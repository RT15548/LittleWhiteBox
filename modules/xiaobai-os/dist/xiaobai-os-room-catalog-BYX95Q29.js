/* eslint-disable */
import { D as C, G as u, H as R, I as U, J as f, K as A, O as z, b as y, g as l, h as w, j as h, k as c, m as D, p as i, q as I, u as m } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
var O = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [
    [1, 1],
    [2, 2],
    [3, 3]
  ],
  4: [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3]
  ],
  5: [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3]
  ],
  6: [
    [1, 1],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 3]
  ]
};
var T = 80, Y = 180, P = 200;
function se(e) {
  const t = Math.max(0, e - 1) * 45 + 720 + T, a = t + Y;
  return {
    countAt: t,
    verdictAt: a,
    settledAt: a + P
  };
}
var N = ["aria-label"], V = { class: "game-die-stage" }, F = { class: "game-die-pips" }, Q = /* @__PURE__ */ y({
  __name: "Die",
  props: {
    value: {},
    delay: { default: 0 },
    highlight: {
      type: Boolean,
      default: !1
    },
    animate: {
      type: Boolean,
      default: !0
    }
  },
  setup(e) {
    const t = e, a = [
      {
        side: "is-front",
        face: 1
      },
      {
        side: "is-back",
        face: 6
      },
      {
        side: "is-top",
        face: 5
      },
      {
        side: "is-bottom",
        face: 2
      },
      {
        side: "is-left",
        face: 4
      },
      {
        side: "is-right",
        face: 3
      }
    ], s = {
      1: [0, 0],
      2: [90, 180],
      3: [0, -90],
      4: [0, 90],
      5: [-90, 0],
      6: [180, 0]
    };
    function r(o, n) {
      return `rotateX(${o}deg) rotateY(${n}deg)`;
    }
    function S() {
      return typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    const g = R(null), b = R(null);
    let p = null, v = null;
    function Z() {
      const [o, n] = s[t.value];
      g.value && (g.value.style.transform = r(o, n));
    }
    function M() {
      const o = g.value;
      if (!o) return;
      if (p?.cancel(), v?.cancel(), p = null, v = null, !t.animate || S() || typeof o.animate != "function") {
        Z();
        return;
      }
      const [n, d] = s[t.value], k = 360 * (2 + Math.floor(Math.random() * 2)) + 146, x = 360 * (1 + Math.floor(Math.random() * 2)) + 101;
      p = o.animate([
        {
          transform: r(n - k, d - x),
          easing: "cubic-bezier(.11,.58,.32,1)"
        },
        {
          transform: r(n + 13, d + 9),
          offset: 0.84,
          easing: "cubic-bezier(.36,0,.4,1)"
        },
        { transform: r(n, d) }
      ], {
        duration: 720,
        delay: t.delay,
        fill: "both"
      }), v = b.value?.animate([
        {
          transform: "translateY(-16px) scale(1.06)",
          easing: "cubic-bezier(.4,0,.7,1)"
        },
        {
          transform: "translateY(0) scale(1)",
          offset: 0.5,
          easing: "cubic-bezier(.2,0,.2,1)"
        },
        {
          transform: "translateY(-6px) scale(1.02)",
          offset: 0.68,
          easing: "cubic-bezier(.4,0,.7,1)"
        },
        {
          transform: "translateY(0) scale(1)",
          offset: 0.82,
          easing: "cubic-bezier(.2,0,.4,1)"
        },
        {
          transform: "translateY(-1.5px) scale(1)",
          offset: 0.9
        },
        { transform: "translateY(0) scale(1)" }
      ], {
        duration: 720,
        delay: t.delay,
        fill: "both"
      }) ?? null;
    }
    return C(M), z(() => {
      p?.cancel(), v?.cancel();
    }), U(() => t.value, M), (o, n) => (c(), l("div", {
      ref_key: "shell",
      ref: b,
      class: A(["game-die", { "is-hit": e.highlight }]),
      role: "img",
      "aria-label": `骰子 ${e.value} 点`
    }, [i("div", V, [i("div", {
      ref_key: "cube",
      ref: g,
      class: "game-die-cube"
    }, [(c(), l(m, null, h(a, (d) => i("div", {
      key: d.side,
      class: A(["game-die-face", [d.side, { "is-result": d.face === e.value }]])
    }, [i("div", F, [(c(!0), l(m, null, h(u(O)[d.face], ([k, x], $) => (c(), l("i", {
      key: $,
      class: "game-die-pip",
      style: I({ gridArea: `${k} / ${x}` })
    }, null, 4))), 128))])], 2)), 64))], 512)])], 10, N));
  }
}), E = Q, G = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十"
];
function L(e) {
  return `${G[e.count] || e.count}个${G[e.face]}`;
}
function oe(e, t) {
  return e.filter((a) => a.count === t).map((a) => a.face);
}
function B(e, t) {
  return e === 1 || e === t;
}
var j = {
  key: 0,
  class: "dice-record"
}, H = { class: "game-dice-row" }, X = { class: "game-dice-row" }, q = /* @__PURE__ */ y({
  __name: "DiceRecord",
  props: { detail: {} },
  setup(e) {
    return (t, a) => e.detail.kind === "dice" ? (c(), l("div", j, [
      i("p", null, f(e.detail.finalBid.by === "player" ? "你" : "对方") + "叫" + f(u(L)(e.detail.finalBid)) + " · " + f(e.detail.challenger === "player" ? "你" : "对方") + "开盅 ", 1),
      i("p", null, " 实际有" + f(u(L)({
        count: e.detail.matchingDiceCount,
        face: e.detail.finalBid.face
      })) + "（一点百搭） ", 1),
      a[0] || (a[0] = i("span", null, "对方的骰子", -1)),
      i("div", H, [(c(!0), l(m, null, h(e.detail.dealerDice, (s, r) => (c(), D(E, {
        key: r,
        value: s,
        animate: !1,
        highlight: u(B)(s, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))]),
      a[1] || (a[1] = i("span", null, "你的骰子", -1)),
      i("div", X, [(c(!0), l(m, null, h(e.detail.playerDice, (s, r) => (c(), D(E, {
        key: r,
        value: s,
        animate: !1,
        highlight: u(B)(s, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))])
    ])) : w("", !0);
  }
}), J = q, K = { key: 0 }, W = /* @__PURE__ */ y({
  __name: "PushRecord",
  props: { detail: {} },
  setup(e) {
    return (t, a) => e.detail.kind === "push" ? (c(), l("p", K, "这局找到了 " + f(e.detail.revealedCoins) + " 张金币。", 1)) : w("", !0);
  }
}), ee = W, te = {
  key: 0,
  class: "game-record-steps"
}, ae = /* @__PURE__ */ y({
  __name: "LadderRecord",
  props: { detail: {} },
  setup(e) {
    const t = {
      safe: "稳着走",
      medium: "跨一步",
      risky: "大胆跃"
    };
    return (a, s) => e.detail.kind === "ladder" ? (c(), l("ol", te, [(c(!0), l(m, null, h(e.detail.steps, (r) => (c(), l("li", { key: r.floor }, " 第 " + f(r.floor) + " 层 · " + f(t[r.choice]) + " · " + f(r.success ? "走过了，攒下 ¤ " + r.amountAfterStep : "没站稳"), 1))), 128))])) : w("", !0);
  }
}), re = ae, ce = [
  {
    id: "dice",
    name: "大话骰",
    category: "斗智",
    tagline: "摇一摇，猜猜他敢叫几个",
    description: "你一口，我一口。不信？开盅见分晓。",
    entry: "50 小白币起",
    mark: "骰",
    tone: "jade"
  },
  {
    id: "push",
    name: "翻牌寻金",
    category: "手气",
    tagline: "再翻一张，还是见好就收",
    description: "金币已经到手，下一张会是什么？",
    entry: "每局 50 小白币",
    mark: "金",
    tone: "claret"
  },
  {
    id: "ladder",
    name: "步步登高",
    category: "闯关",
    tagline: "走稳一点，还是大胆一搏",
    description: "五层阶梯，选你的路，也选收手的时机。",
    entry: "30 小白币起",
    mark: "阶",
    tone: "amber"
  }
];
function _(e) {
  return ce.find((t) => t.id === e);
}
var le = [
  {
    ..._("dice"),
    record: J,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='cup'%20x1='115'%20y1='50'%20x2='245'%20y2='140'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b4cce2'/%3e%3cstop%20offset='.5'%20stop-color='%23edf6ff'/%3e%3cstop%20offset='1'%20stop-color='%237295b4'/%3e%3c/linearGradient%3e%3clinearGradient%20id='die'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23fff'/%3e%3cstop%20offset='1'%20stop-color='%23dce7f2'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='190'%20rx='111'%20ry='23'%20fill='%230c6c83'%20opacity='.25'/%3e%3cg%20transform='rotate(-12%20184%20123)'%3e%3cpath%20d='M129%2057Q181%2027%20230%2057L245%20159Q183%20202%20113%20164Z'%20fill='url(%23cup)'%20stroke='%23fff'%20stroke-width='2'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='51'%20ry='19'%20fill='%23bdd5e7'%20stroke='%23fff'%20stroke-width='3'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='39'%20ry='12'%20fill='%23375675'/%3e%3cpath%20d='M116%20151Q183%20185%20243%20146'%20stroke='%23fff'%20stroke-width='4'/%3e%3cpath%20d='M137%2088L132%20140M146%2094L143%20145'%20stroke='%23fff'%20opacity='.3'%20stroke-width='2'/%3e%3c/g%3e%3cg%20transform='translate(232%20137)%20rotate(16)'%3e%3crect%20width='56'%20height='56'%20rx='12'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3cg%20fill='%2322364d'%3e%3ccircle%20cx='16'%20cy='15'%20r='4'/%3e%3ccircle%20cx='40'%20cy='15'%20r='4'/%3e%3ccircle%20cx='16'%20cy='28'%20r='4'/%3e%3ccircle%20cx='40'%20cy='28'%20r='4'/%3e%3ccircle%20cx='16'%20cy='41'%20r='4'/%3e%3ccircle%20cx='40'%20cy='41'%20r='4'/%3e%3c/g%3e%3c/g%3e%3cg%20transform='translate(88%20164)%20rotate(-16)'%3e%3crect%20width='49'%20height='49'%20rx='11'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3ccircle%20cx='24.5'%20cy='24.5'%20r='7'%20fill='%23f14260'/%3e%3c/g%3e%3cpath%20d='m282%2068%205-11m-2%2026%2014-4M90%2091l-10-7'%20stroke='%231db49c'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-DiceRoom-wvmYLH7d.js")
  },
  {
    ..._("push"),
    record: ee,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='gold'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23ffdf62'/%3e%3cstop%20offset='1'%20stop-color='%23ffae1a'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='198'%20rx='106'%20ry='19'%20fill='%23302470'%20opacity='.18'/%3e%3cg%20transform='translate(85%2060)%20rotate(-17%2055%2072)'%3e%3crect%20width='110'%20height='145'%20rx='12'%20fill='%235961cc'%20stroke='%23bac8ff'%20stroke-width='3'/%3e%3crect%20x='9'%20y='9'%20width='92'%20height='127'%20rx='7'%20stroke='%23bac8ff'/%3e%3cpath%20d='m55%2033%2028%2039-28%2039-28-39Z'%20fill='%238598f0'/%3e%3cpath%20d='m55%2048%2016%2024-16%2024-16-24Z'%20stroke='%23fff'/%3e%3c/g%3e%3cg%20transform='translate(169%2039)%20rotate(13%2054%2074)'%3e%3crect%20width='110'%20height='150'%20rx='12'%20fill='%23fff'%20stroke='%23dee5ff'%20stroke-width='2'/%3e%3ccircle%20cx='55'%20cy='75'%20r='30'%20fill='url(%23gold)'%20stroke='%23eea522'%20stroke-width='3'/%3e%3ccircle%20cx='55'%20cy='75'%20r='23'%20stroke='%23fff4be'%20stroke-width='2'/%3e%3cpath%20d='m55%2055%206%2013%2014%202-10%2010%203%2015-13-7-13%207%203-15-10-10%2014-2Z'%20fill='%23cb7a00'/%3e%3cpath%20d='M13%2017h10m-5-5v10M87%20130h10m-5-5v10'%20stroke='%23ffc14d'%20stroke-width='2'/%3e%3c/g%3e%3cg%20stroke='%23eea522'%20stroke-width='2'%3e%3cellipse%20cx='262'%20cy='192'%20rx='26'%20ry='11'%20fill='%23c98712'/%3e%3cellipse%20cx='262'%20cy='186'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3cellipse%20cx='247'%20cy='172'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-PushRoom-CZRnc_VU.js")
  },
  {
    ..._("ladder"),
    record: re,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cellipse%20cx='178'%20cy='201'%20rx='118'%20ry='18'%20fill='%232054a0'%20opacity='.16'/%3e%3cpath%20d='M70%20164h43v-29h43v-29h43V77h43V48h45v146H70Z'%20fill='%23549cec'/%3e%3cpath%20d='m70%20164%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h45l-19%2011Z'%20fill='%23d9f0ff'/%3e%3cpath%20d='m287%2048%2019-11v146l-19%2011Z'%20fill='%23246bc8'/%3e%3cpath%20d='M70%20194h217'%20stroke='%231f5db3'%20stroke-width='3'/%3e%3ccircle%20cx='134'%20cy='107'%20r='12'%20fill='%23fff'/%3e%3cpath%20d='m129%20122-8%2014%2025%201-1-16Z'%20fill='%23fa6957'/%3e%3cpath%20d='m128%20137-9%2014m20-14%208%204m-4-17%2017-11'%20stroke='%23cc3b47'%20stroke-width='6'%20stroke-linecap='round'/%3e%3cpath%20d='m266%2014%204%207%209%202-6%207%201%208-8-4-8%204%201-8-6-7%209-2Z'%20fill='%23ffdf60'%20stroke='%23e9a31a'/%3e%3cpath%20d='m83%2057%205-10m-4%2024%2012-3m115-44%204-8'%20stroke='%235da8ed'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-LadderRoom-Cm4Hiez1.js")
  }
];
function ne(e) {
  return le.find((t) => t.id === e);
}
export {
  L as a,
  se as c,
  oe as i,
  ne as n,
  B as o,
  _ as r,
  E as s,
  le as t
};
