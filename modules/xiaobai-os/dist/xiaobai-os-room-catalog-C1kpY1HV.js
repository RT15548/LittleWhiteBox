/* eslint-disable */
import { D as M, R as P, S as o, U as x, V as i, X as Z, b as G, dt as V, ft as u, h as _, lt as w, rt as L, ut as S, x as z, y as s, z as Y } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { r as v, t as N } from "./xiaobai-os-outfit-Bu9V9bRI.js";
import { n as F, t as X } from "./xiaobai-os-design-Bb2ApHR1.js";
import { t as b } from "./xiaobai-os-copy-BMey45Sg.js";
import { i as y, t as j } from "./xiaobai-os-outfit-BedKY6Cl.js";
var Q = {
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
var H = 80, q = 180, J = 200;
function $2(e) {
  const t = Math.max(0, e - 1) * 45 + 720 + H, r = t + q;
  return {
    countAt: t,
    verdictAt: r,
    settledAt: r + J
  };
}
var K = ["aria-label"], W = { class: "game-die-stage" }, e2 = { class: "game-die-pips" }, t2 = /* @__PURE__ */ M({
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
    const t = e, r = [
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
    ], c = {
      1: [0, 0],
      2: [90, 180],
      3: [0, -90],
      4: [0, 90],
      5: [-90, 0],
      6: [180, 0]
    };
    function l(f, m) {
      return `rotateX(${f}deg) rotateY(${m}deg)`;
    }
    function a() {
      return typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    const n = L(null), p = L(null);
    let g = null, d = null;
    function k() {
      const [f, m] = c[t.value];
      n.value && (n.value.style.transform = l(f, m));
    }
    function A() {
      const f = n.value;
      if (!f) return;
      if (g?.cancel(), d?.cancel(), g = null, d = null, !t.animate || a() || typeof f.animate != "function") {
        k();
        return;
      }
      const [m, h] = c[t.value], $ = 360 * (2 + Math.floor(Math.random() * 2)) + 146, R = 360 * (1 + Math.floor(Math.random() * 2)) + 101;
      g = f.animate([
        {
          transform: l(m - $, h - R),
          easing: "cubic-bezier(.11,.58,.32,1)"
        },
        {
          transform: l(m + 13, h + 9),
          offset: 0.84,
          easing: "cubic-bezier(.36,0,.4,1)"
        },
        { transform: l(m, h) }
      ], {
        duration: 720,
        delay: t.delay,
        fill: "both"
      }), d = p.value?.animate([
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
    return P(A), Y(() => {
      g?.cancel(), d?.cancel();
    }), Z(() => t.value, A), (f, m) => (i(), o("div", {
      ref_key: "shell",
      ref: p,
      class: S(["game-die", { "is-hit": e.highlight }]),
      role: "img",
      "aria-label": `骰子 ${e.value} 点`
    }, [s("div", W, [s("div", {
      ref_key: "cube",
      ref: n,
      class: "game-die-cube"
    }, [(i(), o(_, null, x(r, (h) => s("div", {
      key: h.side,
      class: S(["game-die-face", [h.side, { "is-result": h.face === e.value }]])
    }, [s("div", e2, [(i(!0), o(_, null, x(w(Q)[h.face], ([$, R], T) => (i(), o("i", {
      key: T,
      class: "game-die-pip",
      style: V({ gridArea: `${$} / ${R}` })
    }, null, 4))), 128))])], 2)), 64))], 512)])], 10, K));
  }
}), B = t2, D = [
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
function O(e) {
  return `${D[e.count] || e.count}个${D[e.face]}`;
}
function R2(e, t) {
  return e.filter((r) => r.count === t).map((r) => r.face);
}
function C(e, t) {
  return e === 1 || e === t;
}
var a2 = {
  key: 0,
  class: "dice-record"
}, r2 = { class: "game-dice-row" }, l2 = { class: "game-dice-row" }, i2 = /* @__PURE__ */ M({
  __name: "DiceRecord",
  props: { detail: {} },
  setup(e) {
    return (t, r) => e.detail.kind === "dice" ? (i(), o("div", a2, [
      s("p", null, u(e.detail.finalBid.by === "player" ? "你" : "对方") + "叫" + u(w(O)(e.detail.finalBid)) + " · " + u(e.detail.challenger === "player" ? "你" : "对方") + "开盅 ", 1),
      s("p", null, " 实际有" + u(w(O)({
        count: e.detail.matchingDiceCount,
        face: e.detail.finalBid.face
      })) + "（一点百搭） ", 1),
      r[0] || (r[0] = s("span", null, "对方的骰子", -1)),
      s("div", r2, [(i(!0), o(_, null, x(e.detail.dealerDice, (c, l) => (i(), G(B, {
        key: l,
        value: c,
        animate: !1,
        highlight: w(C)(c, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))]),
      r[1] || (r[1] = s("span", null, "你的骰子", -1)),
      s("div", l2, [(i(!0), o(_, null, x(e.detail.playerDice, (c, l) => (i(), G(B, {
        key: l,
        value: c,
        animate: !1,
        highlight: w(C)(c, e.detail.finalBid.face)
      }, null, 8, ["value", "highlight"]))), 128))])
    ])) : z("", !0);
  }
}), c2 = i2, o2 = { key: 0 }, s2 = /* @__PURE__ */ M({
  __name: "PushRecord",
  props: { detail: {} },
  setup(e) {
    return (t, r) => e.detail.kind === "push" ? (i(), o("p", o2, "这局找到了 " + u(e.detail.revealedCoins) + " 张金币。", 1)) : z("", !0);
  }
}), n2 = s2, d2 = {
  key: 0,
  class: "game-record-steps"
}, f2 = /* @__PURE__ */ M({
  __name: "LadderRecord",
  props: { detail: {} },
  setup(e) {
    const t = {
      safe: "稳着走",
      medium: "跨一步",
      risky: "大胆跃"
    };
    return (r, c) => e.detail.kind === "ladder" ? (i(), o("ol", d2, [(i(!0), o(_, null, x(e.detail.steps, (l) => (i(), o("li", { key: l.floor }, " 第 " + u(l.floor) + " 层 · " + u(t[l.choice]) + " · " + u(l.success ? "走过了，攒下 ¤ " + l.amountAfterStep : "没站稳"), 1))), 128))])) : z("", !0);
  }
}), m2 = f2, h2 = [
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
function E(e) {
  return h2.find((t) => t.id === e);
}
function u2(e, t = []) {
  const r = e === "mark" ? "132 56 248 305" : t.length ? "90 48 332 420" : "110 48 292 420", c = F.map((a) => `  <ellipse cx="${256 + a.center[0] * 360}" cy="${300 - a.center[1] * 360}" rx="${a.radius[0] * 360}" ry="${a.radius[1] * 360}" fill="${X[a.color]}"/>`), l = t.map((a) => {
    const n = 256 + a.at[0] * 360, p = 300 - a.at[1] * 360, g = a.tilt ? ` transform="rotate(${-a.tilt * 180 / Math.PI} ${n} ${p})"` : "";
    if (a.shape === "ball") return `  <ellipse cx="${n}" cy="${p}" rx="${a.size[0] * 360}" ry="${a.size[1] * 360}" fill="${a.color}"${g}/>`;
    const d = a.size[0] * 360, k = a.size[1] * 360;
    return `  <rect x="${n - d / 2}" y="${p - k / 2}" width="${d}" height="${k}" rx="${Math.min(d, k) * 0.18}" fill="${a.color}"${g}/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r}" role="img" aria-labelledby="title">
  <title id="title">小白</title>
${[...c, ...l].join(`
`)}
</svg>
`;
}
function I(e) {
  return `data:image/svg+xml,${encodeURIComponent(u2("portrait", e))}`;
}
var g2 = {
  id: "moving",
  name: y.name,
  category: y.category,
  tagline: y.tagline,
  description: y.description,
  entry: y.entry,
  mark: y.mark,
  tone: "moving",
  mascotPortrait: I(j)
}, p2 = {
  id: "building",
  name: v.name,
  category: v.category,
  tagline: v.tagline,
  description: v.description,
  entry: v.entry,
  mark: v.mark,
  tone: "building",
  mascotPortrait: I(N)
}, v2 = {
  id: "expedition",
  name: b.name,
  category: b.category,
  tagline: b.tagline,
  entry: b.entry,
  tone: "expedition"
}, y2 = "" + new URL("ember-assets/game-cover-CEKAUJdV.webp", import.meta.url).href, U = [
  {
    ...E("dice"),
    record: c2,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='cup'%20x1='115'%20y1='50'%20x2='245'%20y2='140'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b4cce2'/%3e%3cstop%20offset='.5'%20stop-color='%23edf6ff'/%3e%3cstop%20offset='1'%20stop-color='%237295b4'/%3e%3c/linearGradient%3e%3clinearGradient%20id='die'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23fff'/%3e%3cstop%20offset='1'%20stop-color='%23dce7f2'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='190'%20rx='111'%20ry='23'%20fill='%230c6c83'%20opacity='.25'/%3e%3cg%20transform='rotate(-12%20184%20123)'%3e%3cpath%20d='M129%2057Q181%2027%20230%2057L245%20159Q183%20202%20113%20164Z'%20fill='url(%23cup)'%20stroke='%23fff'%20stroke-width='2'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='51'%20ry='19'%20fill='%23bdd5e7'%20stroke='%23fff'%20stroke-width='3'/%3e%3cellipse%20cx='180'%20cy='59'%20rx='39'%20ry='12'%20fill='%23375675'/%3e%3cpath%20d='M116%20151Q183%20185%20243%20146'%20stroke='%23fff'%20stroke-width='4'/%3e%3cpath%20d='M137%2088L132%20140M146%2094L143%20145'%20stroke='%23fff'%20opacity='.3'%20stroke-width='2'/%3e%3c/g%3e%3cg%20transform='translate(232%20137)%20rotate(16)'%3e%3crect%20width='56'%20height='56'%20rx='12'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3cg%20fill='%2322364d'%3e%3ccircle%20cx='16'%20cy='15'%20r='4'/%3e%3ccircle%20cx='40'%20cy='15'%20r='4'/%3e%3ccircle%20cx='16'%20cy='28'%20r='4'/%3e%3ccircle%20cx='40'%20cy='28'%20r='4'/%3e%3ccircle%20cx='16'%20cy='41'%20r='4'/%3e%3ccircle%20cx='40'%20cy='41'%20r='4'/%3e%3c/g%3e%3c/g%3e%3cg%20transform='translate(88%20164)%20rotate(-16)'%3e%3crect%20width='49'%20height='49'%20rx='11'%20fill='url(%23die)'%20stroke='%23fff'/%3e%3ccircle%20cx='24.5'%20cy='24.5'%20r='7'%20fill='%23f14260'/%3e%3c/g%3e%3cpath%20d='m282%2068%205-11m-2%2026%2014-4M90%2091l-10-7'%20stroke='%231db49c'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-DiceRoom-D-xkrT5v.js")
  },
  {
    ...E("push"),
    record: n2,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='gold'%20x2='1'%20y2='1'%3e%3cstop%20stop-color='%23ffdf62'/%3e%3cstop%20offset='1'%20stop-color='%23ffae1a'/%3e%3c/linearGradient%3e%3c/defs%3e%3cellipse%20cx='180'%20cy='198'%20rx='106'%20ry='19'%20fill='%23302470'%20opacity='.18'/%3e%3cg%20transform='translate(85%2060)%20rotate(-17%2055%2072)'%3e%3crect%20width='110'%20height='145'%20rx='12'%20fill='%235961cc'%20stroke='%23bac8ff'%20stroke-width='3'/%3e%3crect%20x='9'%20y='9'%20width='92'%20height='127'%20rx='7'%20stroke='%23bac8ff'/%3e%3cpath%20d='m55%2033%2028%2039-28%2039-28-39Z'%20fill='%238598f0'/%3e%3cpath%20d='m55%2048%2016%2024-16%2024-16-24Z'%20stroke='%23fff'/%3e%3c/g%3e%3cg%20transform='translate(169%2039)%20rotate(13%2054%2074)'%3e%3crect%20width='110'%20height='150'%20rx='12'%20fill='%23fff'%20stroke='%23dee5ff'%20stroke-width='2'/%3e%3ccircle%20cx='55'%20cy='75'%20r='30'%20fill='url(%23gold)'%20stroke='%23eea522'%20stroke-width='3'/%3e%3ccircle%20cx='55'%20cy='75'%20r='23'%20stroke='%23fff4be'%20stroke-width='2'/%3e%3cpath%20d='m55%2055%206%2013%2014%202-10%2010%203%2015-13-7-13%207%203-15-10-10%2014-2Z'%20fill='%23cb7a00'/%3e%3cpath%20d='M13%2017h10m-5-5v10M87%20130h10m-5-5v10'%20stroke='%23ffc14d'%20stroke-width='2'/%3e%3c/g%3e%3cg%20stroke='%23eea522'%20stroke-width='2'%3e%3cellipse%20cx='262'%20cy='192'%20rx='26'%20ry='11'%20fill='%23c98712'/%3e%3cellipse%20cx='262'%20cy='186'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3cellipse%20cx='247'%20cy='172'%20rx='26'%20ry='11'%20fill='url(%23gold)'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-PushRoom-CHrDlIHV.js")
  },
  {
    ...E("ladder"),
    record: m2,
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20230'%20fill='none'%3e%3cellipse%20cx='178'%20cy='201'%20rx='118'%20ry='18'%20fill='%232054a0'%20opacity='.16'/%3e%3cpath%20d='M70%20164h43v-29h43v-29h43V77h43V48h45v146H70Z'%20fill='%23549cec'/%3e%3cpath%20d='m70%20164%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h43l-19%2011Zm43-29%2019-11h45l-19%2011Z'%20fill='%23d9f0ff'/%3e%3cpath%20d='m287%2048%2019-11v146l-19%2011Z'%20fill='%23246bc8'/%3e%3cpath%20d='M70%20194h217'%20stroke='%231f5db3'%20stroke-width='3'/%3e%3ccircle%20cx='134'%20cy='107'%20r='12'%20fill='%23fff'/%3e%3cpath%20d='m129%20122-8%2014%2025%201-1-16Z'%20fill='%23fa6957'/%3e%3cpath%20d='m128%20137-9%2014m20-14%208%204m-4-17%2017-11'%20stroke='%23cc3b47'%20stroke-width='6'%20stroke-linecap='round'/%3e%3cpath%20d='m266%2014%204%207%209%202-6%207%201%208-8-4-8%204%201-8-6-7%209-2Z'%20fill='%23ffdf60'%20stroke='%23e9a31a'/%3e%3cpath%20d='m83%2057%205-10m-4%2024%2012-3m115-44%204-8'%20stroke='%235da8ed'%20stroke-width='3'%20stroke-linecap='round'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-LadderRoom-ncfJdGms.js")
  }
];
function E2(e) {
  return U.find((t) => t.id === e);
}
var k2 = [
  {
    ...v2,
    mode: "standalone",
    artwork: y2,
    load: () => import("./xiaobai-os-ExpeditionRoom-DBqwYrPY.js")
  },
  {
    ...p2,
    mode: "standalone",
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%20240'%3e%3crect%20width='360'%20height='240'%20rx='24'%20fill='%23d9eef2'/%3e%3cellipse%20cx='182'%20cy='197'%20rx='134'%20ry='20'%20fill='%23c5e0dc'/%3e%3cpath%20d='m49%20184%2024-25h224l19%2025-20%2014H70Z'%20fill='%23fff9e9'/%3e%3cpath%20d='M105%20166V92h146v74'%20fill='%23fffdf6'%20stroke='%23dacdb9'%20stroke-width='3'/%3e%3cpath%20d='M177%2092V50h74v116'%20fill='%23fffdf6'%20stroke='%23dacdb9'%20stroke-width='3'/%3e%3cpath%20d='m96%2094%2046-37%2043%2037m-18-44%2047-37%2047%2037'%20fill='%23b8d6c8'%20stroke='%2389b3a1'%20stroke-width='4'%20stroke-linejoin='round'/%3e%3cpath%20d='M174%2094h78m-78-43h84'%20stroke='%23fffaf1'%20stroke-width='6'/%3e%3cpath%20d='M122%20114h25v28h-25zm73-47h27v24h-27z'%20fill='%23b4dbe7'/%3e%3cpath%20d='M177%20166v-45h28v45'%20fill='%23b8d6c8'/%3e%3cpath%20d='M137%20144v-30m-15%2014h25m61-61v24m-13-12h27'%20stroke='%23fffdf6'%20stroke-width='3'/%3e%3cpath%20d='M227%20166v-37h25'%20fill='none'%20stroke='%23d7b38f'%20stroke-width='5'/%3e%3cpath%20d='M74%20166v-38'%20stroke='%23c7a479'%20stroke-width='6'/%3e%3cpath%20d='M59%20120c-23-33%2022-52%2035-29%2032%205%2015%2049-15%2038-9%209-22%201-20-9Z'%20fill='%23b9d7c4'/%3e%3cpath%20d='M272%20167v-24m-7%209h14'%20stroke='%23d9a294'%20stroke-width='4'/%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-BuildingRoom-0IpJx7tq.js")
  },
  {
    ...g2,
    mode: "standalone",
    artwork: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20320%20270'%3e%3crect%20width='320'%20height='270'%20rx='24'%20fill='%23e1eee8'/%3e%3cellipse%20cx='162'%20cy='231'%20rx='122'%20ry='20'%20fill='%23bbd1c6'/%3e%3cpath%20d='m35%20172%20123-68%20125%2070-123%2073z'%20fill='%2382b4a6'/%3e%3cpath%20d='m35%20159%20123-68%20125%2070-123%2073z'%20fill='%23fff0d7'/%3e%3cpath%20d='M35%20159V61l123-35v99z'%20fill='%23cae3d7'/%3e%3cpath%20d='M158%2026%20283%2093v68l-125-36z'%20fill='%23deece3'/%3e%3cpath%20d='m182%2060%2053%2027v39l-53-19z'%20fill='%23fff8ea'/%3e%3cpath%20d='m189%2071%2039%2020v26l-39-14z'%20fill='%23a8d2df'/%3e%3cpath%20d='m209%2082v29m-20-19%2039%2016'%20stroke='%23fff8ea'%20stroke-width='4'/%3e%3cpath%20d='m63%20152%2072-31%2040%2020-72%2037z'%20fill='%23f4aeb8'/%3e%3cpath%20d='m63%20152v-30l72-30v29z'%20fill='%23e49ca9'/%3e%3cpath%20d='m64%20154%2040%2023v19l-40-23zm40%2023%2071-36v19l-71%2036z'%20fill='%23edbdc6'/%3e%3cpath%20d='m187%20153%2042-17%2034%2019-42%2019z'%20fill='%23f6d4a2'/%3e%3cpath%20d='m187%20153v39l34%2019v-37zm34%2021%2042-19v37l-42%2019z'%20fill='%23e3b77f'/%3e%3cpath%20d='m237%20174%2013-6'%20stroke='%23fff1d4'%20stroke-width='4'%20stroke-linecap='round'/%3e%3cg%20transform='translate(175%20200)'%3e%3cellipse%20rx='17'%20ry='6'%20fill='%2377bba8'/%3e%3cpath%20d='M-9-3a9%209%200%200%201%2018%200'%20fill='%23b5e5e6'/%3e%3cpath%20d='M-14%200q14%208%2028%200'%20fill='none'%20stroke='%23f8e3a2'%20stroke-width='2'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href,
    load: () => import("./xiaobai-os-MovingRoom-BdSPyDLo.js")
  },
  ...U.map((e) => ({
    ...e,
    mode: "wager"
  }))
];
function z2(e) {
  return k2.find((t) => t.id === e);
}
export {
  R2 as a,
  B as c,
  E as i,
  $2 as l,
  z2 as n,
  O as o,
  E2 as r,
  C as s,
  k2 as t
};
