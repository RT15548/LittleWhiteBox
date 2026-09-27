/* eslint-disable */
import { $ as E, F as l, H as I, L as h, M as O, N as U, Q as m, Y as z, _ as c, et as Y, g as b, h as A, m as i, tt as d, u as p, x } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { r as u } from "./xiaobai-os-copy-Bo3eHGxn.js";
var N = {
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
var T = 80, P = 180, V = 200;
function d2(e) {
  const t = Math.max(0, e - 1) * 45 + 720 + T, a = t + P;
  return {
    countAt: t,
    verdictAt: a,
    settledAt: a + V
  };
}
var F = ["aria-label"], Q = { class: "game-die-stage" }, H = { class: "game-die-pips" }, X = /* @__PURE__ */ x({
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
    ], o = {
      1: [0, 0],
      2: [90, 180],
      3: [0, -90],
      4: [0, 90],
      5: [-90, 0],
      6: [180, 0]
    };
    function r(s, f) {
      return `rotateX(${s}deg) rotateY(${f}deg)`;
    }
    function Z() {
      return typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    const g = z(null), M = z(null);
    let v = null, y = null;
    function $() {
      const [s, f] = o[t.value];
      g.value && (g.value.style.transform = r(s, f));
    }
    function R() {
      const s = g.value;
      if (!s) return;
      if (v?.cancel(), y?.cancel(), v = null, y = null, !t.animate || Z() || typeof s.animate != "function") {
        $();
        return;
      }
      const [f, n] = o[t.value], k = 360 * (2 + Math.floor(Math.random() * 2)) + 146, w = 360 * (1 + Math.floor(Math.random() * 2)) + 101;
      v = s.animate([
        {
          transform: r(f - k, n - w),
          easing: "cubic-bezier(.11,.58,.32,1)"
        },
        {
          transform: r(f + 13, n + 9),
          offset: 0.84,
          easing: "cubic-bezier(.36,0,.4,1)"
        },
        { transform: r(f, n) }
      ], {
        duration: 720,
        delay: t.delay,
        fill: "both"
      }), y = M.value?.animate([
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
    return O(R), U(() => {
      v?.cancel(), y?.cancel();
    }), I(() => t.value, R), (s, f) => (l(), c("div", {
      ref_key: "shell",
      ref: M,
      class: E(["game-die", { "is-hit": e.highlight }]),
      role: "img",
      "aria-label": `骰子 ${e.value} 点`
    }, [i("div", Q, [i("div", {
      ref_key: "cube",
      ref: g,
      class: "game-die-cube"
    }, [(l(), c(p, null, h(a, (n) => i("div", {
      key: n.side,
      class: E(["game-die-face", [n.side, { "is-result": n.face === e.value }]])
    }, [i("div", H, [(l(!0), c(p, null, h(m(N)[n.face], ([k, w], C) => (l(), c("i", {
      key: C,
      class: "game-die-pip",
      style: Y({ gridArea: `${k} / ${w}` })
    }, null, 4))), 128))])], 2)), 64))], 512)])], 10, F));
  }
}), G = X, L = [
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
function D(e) {
  return `${L[e.count] || e.count}个${L[e.face]}`;
}
function u2(e, t) {
  return e.filter((a) => a.count === t).map((a) => a.face);
}
function B(e, t) {
  return e === 1 || e === t;
}
var j = {
  key: 0,
  class: "dice-record"
}, q = { class: "game-dice-row" }, J = { class: "game-dice-row" }, K = /* @__PURE__ */ x({
  __name: "DiceRecord",
  props: { detail: {} },
  setup(e) {
    return (t, a) => e.detail.kind === "dice" ? (l(), c("div", j, [
      i("p", null, d(e.detail.finalBid.by === "player" ? "你" : "对方") + "叫" + d(m(D)(e.detail.finalBid)) + " · " + d(e.detail.challenger === "player" ? "你" : "对方") + "开盅 ", 1),
      i("p", null, " 实际有" + d(m(D)({
        count: e.detail.matchingDiceCount,
        face: e.detail.finalBid.face
      })) + "（一点百搭） ", 1),
      a[0] || (a[0] = i("span", null, "对方的骰子", -1)),
      i("div", q, [(l(!0), c(p, null, h(e.detail.dealerDice, (o, r) => (l(), A(G, {
        key: r,
        value: o,
        animate: !1,
        highlight: m(B)(o, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))]),
      a[1] || (a[1] = i("span", null, "你的骰子", -1)),
      i("div", J, [(l(!0), c(p, null, h(e.detail.playerDice, (o, r) => (l(), A(G, {
        key: r,
        value: o,
        animate: !1,
        highlight: m(B)(o, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))])
    ])) : b("", !0);
  }
}), W = K, e2 = { key: 0 }, t2 = /* @__PURE__ */ x({
  __name: "PushRecord",
  props: { detail: {} },
  setup(e) {
    return (t, a) => e.detail.kind === "push" ? (l(), c("p", e2, "这局找到了 " + d(e.detail.revealedCoins) + " 张金币。", 1)) : b("", !0);
  }
}), a2 = t2, r2 = {
  key: 0,
  class: "game-record-steps"
}, l2 = /* @__PURE__ */ x({
  __name: "LadderRecord",
  props: { detail: {} },
  setup(e) {
    const t = {
      safe: "稳着走",
      medium: "跨一步",
      risky: "大胆跃"
    };
    return (a, o) => e.detail.kind === "ladder" ? (l(), c("ol", r2, [(l(!0), c(p, null, h(e.detail.steps, (r) => (l(), c("li", { key: r.floor }, " 第 " + d(r.floor) + " 层 · " + d(t[r.choice]) + " · " + d(r.success ? "走过了，攒下 ¤ " + r.amountAfterStep : "没站稳"), 1))), 128))])) : b("", !0);
  }
}), c2 = l2, i2 = [
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
  return i2.find((t) => t.id === e);
}
var o2 = {
  id: "moving",
  name: u.name,
  category: u.category,
  tagline: u.tagline,
  description: u.description,
  entry: u.entry,
  mark: u.mark,
  tone: "moving"
}, S = [
  {
    ..._("dice"),
    record: W,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='cup'%20x1='115'%20y1='50'%20x2='245'%20y2='140'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b4cce2'/%3e%3cstop%20offset='.5'%20stop-color='%23edf6ff'/%3e%3cstop%20offset='1'%20stop-color='%237295b4'/%3e%3c/linearGradient%3e%3clinearGradient%20id='die'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23fff'/%3e%3cstop%20offset='1'%20stop-color='%23dce7f2'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='190'%20rx='111'%20ry='23'%20fill='%230c6c83'%20opacity='.25'/%3e%3cg%20transform='rotate(-12%20184%20123)'%3e%3cpath%20d='M129%2057Q181%2027%20230%2057L245%20159Q183%20202%20113%20164Z'%20fill='url(%23cup)'%20stroke='%23fff'%20stroke-width='2'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='51'%20ry='19'%20fill='%23bdd5e7'%20stroke='%23fff'%20stroke-width='3'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='39'%20ry='12'%20fill='%23375675'/%3e%3cpath%20d='M116%20151Q183%20185%20243%20146'%20stroke='%23fff'%20stroke-width='4'/%3e%3cpath%20d='M137%2088L132%20140M146%2094L143%20145'%20stroke='%23fff'%20opacity='.3'%20stroke-width='2'/%3e%3c/g%3e%3cg%20transform='translate(232%20137)%20rotate(16)'%3e%3crect%20width='56'%20height='56'%20rx='12'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3cg%20fill='%2322364d'%3e%3ccircle%20cx='16'%20cy='15'%20r='4'/%3e%3ccircle%20cx='40'%20cy='15'%20r='4'/%3e%3ccircle%20cx='16'%20cy='28'%20r='4'/%3e%3ccircle%20cx='40'%20cy='28'%20r='4'/%3e%3ccircle%20cx='16'%20cy='41'%20r='4'/%3e%3ccircle%20cx='40'%20cy='41'%20r='4'/%3e%3c/g%3e%3c/g%3e%3cg%20transform='translate(88%20164)%20rotate(-16)'%3e%3crect%20width='49'%20height='49'%20rx='11'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3ccircle%20cx='24.5'%20cy='24.5'%20r='7'%20fill='%23f14260'/%3e%3c/g%3e%3cpath%20d='m282%2068%205-11m-2%2026%2014-4M90%2091l-10-7'%20stroke='%231db49c'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-DiceRoom-D8J3k2UJ.js")
  },
  {
    ..._("push"),
    record: a2,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='gold'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23ffdf62'/%3e%3cstop%20offset='1'%20stop-color='%23ffae1a'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='198'%20rx='106'%20ry='19'%20fill='%23302470'%20opacity='.18'/%3e%3cg%20transform='translate(85%2060)%20rotate(-17%2055%2072)'%3e%3crect%20width='110'%20height='145'%20rx='12'%20fill='%235961cc'%20stroke='%23bac8ff'%20stroke-width='3'/%3e%3crect%20x='9'%20y='9'%20width='92'%20height='127'%20rx='7'%20stroke='%23bac8ff'/%3e%3cpath%20d='m55%2033%2028%2039-28%2039-28-39Z'%20fill='%238598f0'/%3e%3cpath%20d='m55%2048%2016%2024-16%2024-16-24Z'%20stroke='%23fff'/%3e%3c/g%3e%3cg%20transform='translate(169%2039)%20rotate(13%2054%2074)'%3e%3crect%20width='110'%20height='150'%20rx='12'%20fill='%23fff'%20stroke='%23dee5ff'%20stroke-width='2'/%3e%3ccircle%20cx='55'%20cy='75'%20r='30'%20fill='url(%23gold)'%20stroke='%23eea522'%20stroke-width='3'/%3e%3ccircle%20cx='55'%20cy='75'%20r='23'%20stroke='%23fff4be'%20stroke-width='2'/%3e%3cpath%20d='m55%2055%206%2013%2014%202-10%2010%203%2015-13-7-13%207%203-15-10-10%2014-2Z'%20fill='%23cb7a00'/%3e%3cpath%20d='M13%2017h10m-5-5v10M87%20130h10m-5-5v10'%20stroke='%23ffc14d'%20stroke-width='2'/%3e%3c/g%3e%3cg%20stroke='%23eea522'%20stroke-width='2'%3e%3cellipse%20cx='262'%20cy='192'%20rx='26'%20ry='11'%20fill='%23c98712'/%3e%3cellipse%20cx='262'%20cy='186'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3cellipse%20cx='247'%20cy='172'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-PushRoom-CzgmNB9U.js")
  },
  {
    ..._("ladder"),
    record: c2,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cellipse%20cx='178'%20cy='201'%20rx='118'%20ry='18'%20fill='%232054a0'%20opacity='.16'/%3e%3cpath%20d='M70%20164h43v-29h43v-29h43V77h43V48h45v146H70Z'%20fill='%23549cec'/%3e%3cpath%20d='m70%20164%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h45l-19%2011Z'%20fill='%23d9f0ff'/%3e%3cpath%20d='m287%2048%2019-11v146l-19%2011Z'%20fill='%23246bc8'/%3e%3cpath%20d='M70%20194h217'%20stroke='%231f5db3'%20stroke-width='3'/%3e%3ccircle%20cx='134'%20cy='107'%20r='12'%20fill='%23fff'/%3e%3cpath%20d='m129%20122-8%2014%2025%201-1-16Z'%20fill='%23fa6957'/%3e%3cpath%20d='m128%20137-9%2014m20-14%208%204m-4-17%2017-11'%20stroke='%23cc3b47'%20stroke-width='6'%20stroke-linecap='round'/%3e%3cpath%20d='m266%2014%204%207%209%202-6%207%201%208-8-4-8%204%201-8-6-7%209-2Z'%20fill='%23ffdf60'%20stroke='%23e9a31a'/%3e%3cpath%20d='m83%2057%205-10m-4%2024%2012-3m115-44%204-8'%20stroke='%235da8ed'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-LadderRoom-CvlgQamw.js")
  }
];
function m2(e) {
  return S.find((t) => t.id === e);
}
var s2 = [{
  ...o2,
  mode: "standalone",
  artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20320%20270'%3e%3crect%20width='320'%20height='270'%20rx='24'%20fill='%23e1eee8'/%3e%3cellipse%20cx='162'%20cy='231'%20rx='122'%20ry='20'%20fill='%23bbd1c6'/%3e%3cpath%20d='m35%20172%20123-68%20125%2070-123%2073z'%20fill='%2382b4a6'/%3e%3cpath%20d='m35%20159%20123-68%20125%2070-123%2073z'%20fill='%23fff0d7'/%3e%3cpath%20d='M35%20159V61l123-35v99z'%20fill='%23cae3d7'/%3e%3cpath%20d='M158%2026%20283%2093v68l-125-36z'%20fill='%23deece3'/%3e%3cpath%20d='m182%2060%2053%2027v39l-53-19z'%20fill='%23fff8ea'/%3e%3cpath%20d='m189%2071%2039%2020v26l-39-14z'%20fill='%23a8d2df'/%3e%3cpath%20d='m209%2082v29m-20-19%2039%2016'%20stroke='%23fff8ea'%20stroke-width='4'/%3e%3cpath%20d='m63%20152%2072-31%2040%2020-72%2037z'%20fill='%23f4aeb8'/%3e%3cpath%20d='m63%20152v-30l72-30v29z'%20fill='%23e49ca9'/%3e%3cpath%20d='m64%20154%2040%2023v19l-40-23zm40%2023%2071-36v19l-71%2036z'%20fill='%23edbdc6'/%3e%3cpath%20d='m187%20153%2042-17%2034%2019-42%2019z'%20fill='%23f6d4a2'/%3e%3cpath%20d='m187%20153v39l34%2019v-37zm34%2021%2042-19v37l-42%2019z'%20fill='%23e3b77f'/%3e%3cpath%20d='m237%20174%2013-6'%20stroke='%23fff1d4'%20stroke-width='4'%20stroke-linecap='round'/%3e%3cg%20transform='translate(129%20143)'%3e%3cellipse%20cy='-8'%20rx='14'%20ry='15'%20fill='%23fff1e9'/%3e%3cpath%20d='m-13-15-1-14%2012%209m4%200%2012-10v16'%20fill='%23fff1e9'/%3e%3ccircle%20cx='-5'%20cy='-10'%20r='1.7'%20fill='%234a5359'/%3e%3ccircle%20cx='5'%20cy='-10'%20r='1.7'%20fill='%234a5359'/%3e%3c/g%3e%3cg%20transform='translate(98%20220)'%3e%3cellipse%20cy='-5'%20rx='15'%20ry='20'%20fill='%23fffaf1'/%3e%3cellipse%20cx='-9'%20cy='-22'%20rx='4'%20ry='8'%20fill='%23fffaf1'/%3e%3cellipse%20cx='9'%20cy='-22'%20rx='4'%20ry='8'%20fill='%23fffaf1'/%3e%3ccircle%20cx='-5'%20cy='-10'%20r='1.7'%20fill='%234a5359'/%3e%3ccircle%20cx='5'%20cy='-10'%20r='1.7'%20fill='%234a5359'/%3e%3crect%20x='-12'%20y='0'%20width='25'%20height='20'%20rx='3'%20fill='%23dbab79'/%3e%3cpath%20d='M0%200v20'%20stroke='%23ffe0a9'%20stroke-width='5'/%3e%3c/g%3e%3cg%20transform='translate(175%20200)'%3e%3cellipse%20rx='17'%20ry='6'%20fill='%2377bba8'/%3e%3cpath%20d='M-9-3a9%209%200%200%201%2018%200'%20fill='%23b5e5e6'/%3e%3cpath%20d='M-14%200q14%208%2028%200'%20fill='none'%20stroke='%23f8e3a2'%20stroke-width='2'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href,
  load: () => import("./xiaobai-os-MovingRoom-DAL7fc9d.js")
}, ...S.map((e) => ({
  ...e,
  mode: "wager"
}))];
function h2(e) {
  return s2.find((t) => t.id === e);
}
export {
  u2 as a,
  G as c,
  _ as i,
  d2 as l,
  h2 as n,
  D as o,
  m2 as r,
  B as s,
  s2 as t
};
