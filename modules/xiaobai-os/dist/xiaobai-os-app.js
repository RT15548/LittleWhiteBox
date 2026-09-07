/* eslint-disable */
import { B as H, C as te, D as ie, E as re, H as O, I as b, L as le, M as Z, O as se, P as X, S as oe, T as p, V as N, _ as E, b as ne, c as ce, d as r, f as C, g as pe, l as de, m as u, n as ue, p as _, t as fe, u as K, v as S, x as ve, z as he } from "./xiaobai-os-runtime-dom.esm-bundler-DwdCK5Jt.js";
import { n as me, t as L } from "./xiaobai-os-frame-bridge-8-bd80In.js";
var ge = [
  "agent-api",
  "fourth-wall",
  "messages",
  "wallet",
  "shop",
  "bank",
  "game",
  "map",
  "world",
  "tasks",
  "learning"
], be = Object.freeze({
  id: "agent-api",
  name: "Agent API",
  accent: "#00b8c5"
}), we = Object.freeze({
  id: "bank",
  name: "银行",
  accent: "#175ce5"
}), ye = Object.freeze({
  id: "fourth-wall",
  name: "四次元壁",
  accent: "#8b50f5"
}), xe = Object.freeze({
  id: "game",
  name: "游戏",
  accent: "#ef486f"
}), ke = Object.freeze({
  id: "map",
  name: "地图",
  accent: "#2795f5"
}), Ae = Object.freeze({
  id: "messages",
  name: "信息",
  accent: "#0bbe61"
}), Pe = Object.freeze({
  id: "shop",
  name: "奇物商店",
  accent: "#f34b42"
}), Se = Object.freeze({
  id: "tasks",
  name: "任务",
  accent: "#7950eb"
}), Oe = Object.freeze({
  id: "wallet",
  name: "钱包",
  accent: "#f69a0e"
}), _e = Object.freeze({
  id: "world",
  name: "世界",
  accent: "#1388f5"
}), Re = Object.freeze({
  id: "learning",
  name: "语伴",
  accent: "#2467ed"
}), Ie = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2325dccc'/%3e%3cstop%20offset='1'%20stop-color='%2300a9c4'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3crect%20x='24'%20y='24'%20width='40'%20height='40'%20rx='11'%20stroke='%23fff'%20stroke-width='4'/%3e%3cpath%20d='M34%2016v8m10-8v8m10-8v8M34%2064v8m10-8v8m10-8v8M16%2034h8m-8%2010h8m-8%2010h8m40-20h8m-8%2010h8m-8%2010h8'%20stroke='%23fff'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3cpath%20d='m39%2036-8%208%208%208m10-16%208%208-8%208'%20stroke='%23fff'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Ee = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23a168ff'/%3e%3cstop%20offset='1'%20stop-color='%236837f1'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M26%2022h37a10%2010%200%200%201%2010%2010v20a10%2010%200%200%201-10%2010H43L27%2074V62h-1a10%2010%200%200%201-10-10V32a10%2010%200%200%201%2010-10Z'%20fill='%23fff'/%3e%3cpath%20d='M32%2035v16m-4-16h8m-8%2016h8m8-16%206%2016%207-16'%20stroke='%238046ee'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='m70%2011%202%206%206%202-6%202-2%206-2-6-6-2%206-2Z'%20fill='%23c8fff3'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Me = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ffc535'/%3e%3cstop%20offset='1'%20stop-color='%23ff991a'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='m23%2030%2037-12a5%205%200%200%201%206%204v15H23Z'%20fill='%23fff'/%3e%3cpath%20d='M23%2029h42a8%208%200%200%201%208%208v28a8%208%200%200%201-8%208H23a8%208%200%200%201-8-8V37a8%208%200%200%201%208-8Z'%20fill='%23252938'/%3e%3cpath%20d='M24%2039h37'%20stroke='%23fff'%20stroke-opacity='.3'%20stroke-width='2.5'%20stroke-linecap='round'/%3e%3crect%20x='52'%20y='45'%20width='23'%20height='16'%20rx='6'%20fill='%23fff'/%3e%3ccircle%20cx='59'%20cy='53'%20r='2.5'%20fill='%23252938'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Ue = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ff805d'/%3e%3cstop%20offset='1'%20stop-color='%23ff434e'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M23%2029h42l6%2039a6%206%200%200%201-6%207H23a6%206%200%200%201-6-7Z'%20fill='%23fff'/%3e%3cpath%20d='M33%2032V25a11%2011%200%200%201%2022%200v7'%20stroke='%23fff'%20stroke-width='4.5'%20stroke-linecap='round'/%3e%3cpath%20d='M33%2049c2%2014%2020%2014%2022%200'%20stroke='%23fa5951'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, $e = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23353c4c'/%3e%3cstop%20offset='1'%20stop-color='%23111723'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='m18%2034%2026-17%2026%2017Z'%20fill='%23fff'/%3e%3cpath%20d='M22%2063V42m15%2021V42m14%2021V42m15%2021V42'%20stroke='%23fff'%20stroke-width='6'%20stroke-linecap='round'/%3e%3cpath%20d='M18%2072h52'%20stroke='%23fff'%20stroke-width='5'%20stroke-linecap='round'/%3e%3ccircle%20cx='44'%20cy='29'%20r='3'%20fill='%23465368'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Be = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ff7386'/%3e%3cstop%20offset='1'%20stop-color='%23ef385e'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M30%2028h28a13%2013%200%200%201%2013%2010l6%2020a9%209%200%200%201-15%209l-8-8H34l-8%208a9%209%200%200%201-15-9l6-20a13%2013%200%200%201%2013-10Z'%20fill='%23fff'/%3e%3cpath%20d='M28%2037v17m-8-8h16'%20stroke='%23ed4066'%20stroke-width='4'%20stroke-linecap='round'/%3e%3ccircle%20cx='60'%20cy='39'%20r='3.5'%20fill='%238554ed'/%3e%3ccircle%20cx='67'%20cy='48'%20r='3.5'%20fill='%2316bad0'/%3e%3cpath%20d='M38%2025v-4a6%206%200%200%201%206-6h8'%20stroke='%23fff'%20stroke-width='3'%20stroke-linecap='round'%20opacity='.8'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Le = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23f8fcff'/%3e%3cstop%20offset='1'%20stop-color='%23e7f3ff'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M0%200h39v32H0Z'%20fill='%2389eb9b'/%3e%3cpath%20d='M53%200h35v39H53Z'%20fill='%2345cf86'/%3e%3cpath%20d='M0%2048h28v40H0Z'%20fill='%23a0e89d'/%3e%3cpath%20d='M46%2053h42v35H46Z'%20fill='%2390d6ff'/%3e%3cpath%20d='M0%2039h88M39%200v88'%20stroke='%23fff'%20stroke-width='9'/%3e%3cpath%20d='m4%2085%2077-63'%20stroke='%23fff'%20stroke-width='12'/%3e%3cpath%20d='m4%2085%2077-63'%20stroke='%23ffcb45'%20stroke-width='5'/%3e%3cpath%20d='M60%2014a16%2016%200%200%200-16%2016c0%2013%2016%2028%2016%2028s16-15%2016-28a16%2016%200%200%200-16-16Z'%20fill='%23fa4c60'/%3e%3ccircle%20cx='60'%20cy='30'%20r='6'%20fill='%23fff'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Ce = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2351e766'/%3e%3cstop%20offset='1'%20stop-color='%2305b959'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M73%2041c0%2015-13%2027-30%2027-4%200-8-1-12-2l-16%207%205-15c-5-5-8-10-8-17%200-15%2014-27%2031-27s30%2012%2030%2027Z'%20fill='%23fff'/%3e%3ccircle%20cx='30'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3ccircle%20cx='43'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3ccircle%20cx='56'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, He = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%239d72ff'/%3e%3cstop%20offset='1'%20stop-color='%236b3eec'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3crect%20x='22'%20y='15'%20width='48'%20height='61'%20rx='9'%20fill='%23fff'/%3e%3cpath%20d='m17%2033%205%205%209-11m-14%2028%205%205%209-11'%20stroke='%23caffdc'%20stroke-width='4.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M39%2032h19M39%2040h12M39%2053h19M39%2061h12'%20stroke='%238658ec'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Ge = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2332c8ff'/%3e%3cstop%20offset='1'%20stop-color='%23086ef2'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3ccircle%20cx='44'%20cy='44'%20r='28'%20stroke='%23fff'%20stroke-width='3'/%3e%3cellipse%20cx='44'%20cy='44'%20rx='13'%20ry='28'%20stroke='%23fff'%20stroke-width='2.5'/%3e%3cpath%20d='M18%2034h52M16%2048h56M23%2061h42'%20stroke='%23fff'%20stroke-width='2.5'/%3e%3cpath%20d='m64%2018%207-5%205%205-5%207Z'%20fill='%23b5ffe0'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href, Te = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%234099ff'/%3e%3cstop%20offset='1'%20stop-color='%232260f1'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M23%2017h32a9%209%200%200%201%209%209v25a9%209%200%200%201-9%209H37L23%2070V60a9%209%200%200%201-9-9V26a9%209%200%200%201%209-9Z'%20fill='%23fff'/%3e%3cpath%20d='m27%2048%2010-23%2010%2023m-17-7h14'%20stroke='%232773f5'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3crect%20x='48'%20y='48'%20width='29'%20height='29'%20rx='9'%20fill='%2390ecff'/%3e%3cpath%20d='M54%2058h17m-9-4v4m5%200c-1%208-6%2011-12%2014m2-12c2%205%207%2010%2013%2012'%20stroke='%231952aa'%20stroke-width='2'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href;
function De(t) {
  let a = null, i = null;
  return Object.freeze({
    load() {
      return a ? Promise.resolve(a) : (i ??= t().then((l) => {
        if (!l?.default) throw new Error("app_component_missing");
        return a = l.default, a;
      }).catch((l) => {
        throw i = null, l;
      }), i);
    },
    reset() {
      a = null, i = null;
    }
  });
}
function w(t, a, i) {
  const l = De(i);
  return Object.freeze({
    ...t,
    icon: a,
    load: l.load,
    resetLoader: l.reset
  });
}
var je = Object.freeze({
  "agent-api": w(be, Ie, () => import("./xiaobai-os-AgentApiApp-MQ6rh0GN.js")),
  "fourth-wall": w(ye, Ee, () => import("./xiaobai-os-FourthWallApp-CEYFeRmI.js")),
  wallet: w(Oe, Me, () => import("./xiaobai-os-WalletApp-D35tA2Lk.js")),
  shop: w(Pe, Ue, () => import("./xiaobai-os-ShopApp-BbjvuqSP.js")),
  bank: w(we, $e, () => import("./xiaobai-os-BankApp-D0ZbUfMo.js")),
  game: w(xe, Be, () => import("./xiaobai-os-GameApp-B78sgmUd.js")),
  map: w(ke, Le, () => import("./xiaobai-os-MapApp-BDA2OYTF.js")),
  messages: w(Ae, Ce, () => import("./xiaobai-os-MessagesApp-CjffdHpF.js")),
  tasks: w(Se, He, () => import("./xiaobai-os-TasksApp-WuFHj6iI.js")),
  world: w(_e, Ge, () => import("./xiaobai-os-WorldApp-8GzCYqf4.js")),
  learning: w(Re, Te, () => import("./xiaobai-os-LearningApp-BpWS8JGA.js"))
}), q = Object.freeze(ge.map((t) => {
  const a = je[t];
  if (!a) throw new Error(`missing_shell_app:${t}`);
  return a;
})), ba = Object.freeze(q.map((t) => t.id)), ze = /* @__PURE__ */ S({
  __name: "AppBoundary",
  emits: ["failed"],
  setup(t, { emit: a }) {
    const i = a;
    return oe((l) => (i("failed", l), !1)), (l, s) => ie(l.$slots, "default");
  }
}), Fe = ze, Ve = { class: "xiaobai-os-home" }, Ze = ["src"], Xe = {
  class: "xiaobai-os-app-grid",
  "aria-label": "应用"
}, Ne = ["onClick"], Ke = {
  class: "xiaobai-os-app-icon",
  "aria-hidden": "true"
}, qe = ["src"], We = { class: "xiaobai-os-app-name" }, Je = /* @__PURE__ */ S({
  __name: "XiaobaiOsHome",
  props: {
    apps: {},
    characterAvatar: {}
  },
  emits: ["openApp"],
  setup(t) {
    return (a, i) => (p(), u("main", Ve, [
      t.characterAvatar ? (p(), u("img", {
        key: 0,
        class: "xiaobai-os-wallpaper",
        src: t.characterAvatar,
        alt: ""
      }, null, 8, Ze)) : _("", !0),
      i[0] || (i[0] = r("div", {
        class: "xiaobai-os-home-wash",
        "aria-hidden": "true"
      }, null, -1)),
      r("section", Xe, [(p(!0), u(de, null, re(t.apps, (l) => (p(), u("button", {
        key: l.id,
        type: "button",
        class: "xiaobai-os-app-tile",
        style: N({ "--app-accent": l.accent }),
        onClick: (s) => a.$emit("openApp", l)
      }, [r("span", Ke, [r("img", {
        src: l.icon,
        alt: "",
        width: "64",
        height: "64",
        draggable: "false"
      }, null, 8, qe)]), r("span", We, O(l.name), 1)], 12, Ne))), 128))])
    ]));
  }
}), Qe = Je, Ye = ["disabled"], ea = {
  key: 0,
  "aria-hidden": "true"
}, aa = /* @__PURE__ */ S({
  __name: "XiaobaiOsNavigation",
  props: { isHome: { type: Boolean } },
  emits: [
    "back",
    "home",
    "close"
  ],
  setup(t) {
    return (a, i) => (p(), u("nav", {
      class: H(["xiaobai-os-navigation", { "is-home": t.isHome }]),
      "aria-label": "系统导航"
    }, [
      r("button", {
        type: "button",
        class: "xiaobai-os-nav-button",
        disabled: t.isHome,
        "aria-label": "返回",
        onClick: i[0] || (i[0] = (l) => a.$emit("back"))
      }, [...i[3] || (i[3] = [r("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [r("path", { d: "m14.5 6-6 6 6 6" })], -1)])], 8, Ye),
      r("button", {
        type: "button",
        class: "xiaobai-os-nav-button xiaobai-os-home-button",
        "aria-label": "主页",
        onClick: i[1] || (i[1] = (l) => a.$emit("home"))
      }, [i[4] || (i[4] = r("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [r("path", { d: "m4.5 11 7.5-6 7.5 6v8h-5v-5h-5v5h-5z" })], -1)), t.isHome ? (p(), u("i", ea)) : _("", !0)]),
      r("button", {
        type: "button",
        class: "xiaobai-os-nav-button xiaobai-os-close-button",
        "aria-label": "关闭",
        onClick: i[2] || (i[2] = (l) => a.$emit("close"))
      }, [...i[5] || (i[5] = [r("span", null, [r("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [r("path", { d: "m7 9.5 5 5 5-5" })])], -1)])])
    ], 2));
  }
}), ta = aa, ia = /* @__PURE__ */ S({
  __name: "XiaobaiOsSystemBar",
  props: { isHome: { type: Boolean } },
  setup(t) {
    return (a, i) => (p(), u("header", {
      class: H(["xiaobai-os-system-bar", { "is-home": t.isHome }]),
      "aria-label": "系统状态"
    }, [...i[0] || (i[0] = [r("span", { class: "xiaobai-os-system-mark" }, "小白", -1), r("span", {
      class: "xiaobai-os-system-status",
      "aria-hidden": "true"
    }, [r("span", { class: "xiaobai-os-signal" }, [
      r("i"),
      r("i"),
      r("i"),
      r("i")
    ]), r("span", { class: "xiaobai-os-battery" }, [r("i")])], -1)])], 2));
  }
}), ra = ia, la = { class: "xiaobai-os-device" }, sa = { class: "xiaobai-os-glass" }, oa = {
  key: "failure",
  class: "xiaobai-os-app-failure",
  role: "alert"
}, na = { class: "xiaobai-os-app-failure-actions" }, ca = {
  key: "loading",
  class: "xiaobai-os-app-loading",
  role: "status"
}, pa = /* @__PURE__ */ S({
  __name: "XiaobaiOsDevice",
  props: {
    apps: {},
    activeApp: {},
    activeComponent: {},
    activeState: {},
    appFailure: {},
    appLoading: { type: Boolean },
    appRenderKey: {},
    bridge: {},
    characterAvatar: {}
  },
  emits: [
    "openApp",
    "back",
    "home",
    "close",
    "renderFailed",
    "retry",
    "reload"
  ],
  setup(t) {
    const a = t, i = K(() => a.activeApp === null);
    return (l, s) => (p(), u("div", la, [s[9] || (s[9] = r("span", {
      class: "xiaobai-os-side-key",
      "aria-hidden": "true"
    }, null, -1)), r("div", sa, [
      E(ra, { "is-home": i.value }, null, 8, ["is-home"]),
      r("div", {
        class: "xiaobai-os-stage",
        style: N(t.activeApp ? { "--app-accent": t.activeApp.accent } : null)
      }, [E(fe, {
        name: "xiaobai-os-route",
        mode: "out-in"
      }, {
        default: Z(() => [i.value ? (p(), C(Qe, {
          key: "home",
          apps: t.apps,
          "character-avatar": t.characterAvatar,
          onOpenApp: s[0] || (s[0] = (m) => l.$emit("openApp", m))
        }, null, 8, ["apps", "character-avatar"])) : t.appFailure ? (p(), u("section", oa, [
          s[7] || (s[7] = r("span", {
            class: "xiaobai-os-app-failure-mark",
            "aria-hidden": "true"
          }, "!", -1)),
          r("h1", null, O(t.activeApp?.name) + "暂时无法打开", 1),
          r("p", null, O(t.appFailure.message), 1),
          r("div", na, [t.appFailure.retryable ? (p(), u("button", {
            key: 0,
            type: "button",
            onClick: s[1] || (s[1] = (m) => l.$emit("retry"))
          }, "重试")) : _("", !0), r("button", {
            type: "button",
            onClick: s[2] || (s[2] = (m) => l.$emit("reload"))
          }, "重新载入 OS")])
        ])) : t.appLoading ? (p(), u("div", ca, [s[8] || (s[8] = r("span", { "aria-hidden": "true" }, null, -1)), pe(" 正在打开" + O(t.activeApp?.name), 1)])) : t.activeApp && t.activeComponent ? (p(), u("div", {
          key: `app:${t.activeApp.id}:${t.appRenderKey}`,
          class: "xiaobai-os-app-route"
        }, [E(Fe, { onFailed: s[3] || (s[3] = (m) => l.$emit("renderFailed", m)) }, {
          default: Z(() => [(p(), C(se(t.activeComponent), {
            bridge: t.bridge,
            "initial-state": t.activeState
          }, null, 8, ["bridge", "initial-state"]))]),
          _: 1
        })])) : _("", !0)]),
        _: 1
      })], 4),
      E(ta, {
        "is-home": i.value,
        onBack: s[4] || (s[4] = (m) => l.$emit("back")),
        onHome: s[5] || (s[5] = (m) => l.$emit("home")),
        onClose: s[6] || (s[6] = (m) => l.$emit("close"))
      }, null, 8, ["is-home"])
    ])]));
  }
}), da = pa, ua = {
  key: 0,
  class: "xiaobai-os-error",
  role: "alert"
}, fa = {
  key: 1,
  class: "xiaobai-os-loading",
  role: "status"
}, va = /* @__PURE__ */ S({
  __name: "App",
  setup(t) {
    const a = me(), i = b(null), l = b(!1), s = b("light"), m = b(/* @__PURE__ */ new Set()), G = b(""), d = b(null), x = le(null), k = b(null), f = b(!1), n = b(null), T = b(0), R = b("");
    let D = null, j = () => {
    }, A = 0, v = null;
    const W = K(() => q.filter((e) => m.value.has(e.id)));
    function z(e) {
      const o = new Set(e.map((y) => String(y.id))), c = d.value && !o.has(d.value.id), g = v && !o.has(v.appId);
      m.value = o, !(!c && !g) && (A += 1, v = null, d.value = null, x.value = null, k.value = null, f.value = !1, n.value = null, a.clearAppSession());
    }
    function J(e) {
      A += 1, v = null, s.value = e.theme === "dark" ? "dark" : "light", z(e.apps || []), G.value = String(e.chat?.characterAvatar || ""), d.value = null, x.value = null, k.value = null, f.value = !1, n.value = null, a.clearAppSession(), l.value = !0;
    }
    function Q(e) {
      if (e.type === "os/init" && J(e.payload || {}), e.type === "os/theme-changed" && (s.value = e.payload?.theme === "dark" ? "dark" : "light"), e.type === "os/apps-changed") {
        const g = e.payload;
        z(g?.apps || []);
      }
      if (e.type === "os/app-state") {
        const g = e.payload, y = g?.status;
        g?.appId === d.value?.id && y?.state === "failed" && (f.value = !1, n.value = {
          phase: y.failure?.phase || "host",
          message: y.failure?.message || "Host APP 运行失败",
          retryable: y.failure?.retryable !== !1,
          requiresAppRetry: !0
        }, a.clearAppSession());
      }
      e.type === "os/error" && (R.value = String(e.payload?.message || "小白 OS 初始化失败"));
      const o = e.payload?.state;
      v && e.appId === v.appId && e.type === `${v.appId}/state` && (v.latestState = o);
      const c = a.getAppSession();
      d.value && c?.appId === d.value.id && e.appId === c.appId && e.activationToken === c.activationToken && e.type === `${d.value.id}/state` && (k.value = o);
    }
    async function M(e) {
      const o = ++A, c = { appId: e.id };
      v = c, d.value = e, x.value = null, k.value = null, f.value = !0, n.value = null, a.clearAppSession(), R.value = "";
      const g = a.request("app/activate", { appId: e.id }), y = e.load(), [P, I] = await Promise.allSettled([g, y]);
      try {
        if (o !== A) return;
        if (P.status === "fulfilled") {
          if (P.value.appId !== e.id || !P.value.activationToken) throw new Error("app_activation_mismatch");
          a.setAppSession({
            appId: e.id,
            activationToken: P.value.activationToken
          }), k.value = c.latestState ?? P.value.state ?? null;
        } else {
          const h = P.reason;
          n.value = {
            phase: h instanceof L ? h.phase : "host",
            message: h instanceof Error ? h.message : String(h),
            retryable: !(h instanceof L) || h.retryable,
            requiresAppRetry: h instanceof L && h.requiresAppRetry
          };
        }
        I.status === "fulfilled" ? x.value = X(I.value) : n.value || (n.value = {
          phase: "ui-load",
          message: I.reason instanceof Error ? I.reason.message : "APP 界面加载失败",
          retryable: !0
        }), f.value = !1;
      } catch (h) {
        f.value = !1, n.value = {
          phase: "host",
          message: h instanceof Error ? h.message : String(h),
          retryable: !0
        }, a.clearAppSession();
      } finally {
        v === c && (v = null);
      }
    }
    async function Y() {
      const e = d.value, o = n.value;
      if (!(!e || !o)) {
        if (o.phase === "ui-render") {
          n.value = null, T.value += 1;
          return;
        }
        if (o.phase === "ui-load" && a.getAppSession()?.appId === e.id) {
          f.value = !0, n.value = null, e.resetLoader();
          try {
            x.value = X(await e.load());
          } catch (c) {
            n.value = {
              phase: "ui-load",
              message: c instanceof Error ? c.message : "APP 界面加载失败",
              retryable: !0
            };
          } finally {
            f.value = !1;
          }
          return;
        }
        if ((o.phase === "activate" || o.phase === "host") && !o.requiresAppRetry) {
          await M(e);
          return;
        }
        f.value = !0, n.value = null;
        try {
          await a.request("app/retry", { appId: e.id }), await M(e);
        } catch (c) {
          f.value = !1, n.value = {
            phase: "host",
            message: c instanceof Error ? c.message : String(c),
            retryable: !0
          };
        }
      }
    }
    function U(e) {
      const o = d.value;
      o && (n.value = {
        phase: "ui-render",
        message: e instanceof Error ? e.message : "APP 界面渲染失败",
        retryable: !0
      }, a.post("os/app-ui-failure", {
        appId: o.id,
        phase: "ui-render"
      }));
    }
    function F(e) {
      !d.value || f.value || n.value || (e.preventDefault(), U(e.error ?? new Error(e.message || "APP 界面运行失败")));
    }
    function V(e) {
      !d.value || f.value || n.value || (e.preventDefault(), U(e.reason));
    }
    function ee() {
      window.location.reload();
    }
    function $() {
      A += 1, v = null, a.post("app/deactivate", { appId: d.value?.id || "" }), a.clearAppSession(), d.value = null, x.value = null, k.value = null, f.value = !1, n.value = null;
    }
    function B() {
      A += 1, v = null, a.post("os/close"), a.clearAppSession();
    }
    function ae(e) {
      if (e.key === "Escape") {
        e.preventDefault(), d.value ? $() : B();
        return;
      }
      if (e.key !== "Tab" || !i.value) return;
      const o = Array.from(i.value.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'));
      if (o.length === 0) return;
      const c = o[0], g = o[o.length - 1];
      e.shiftKey && document.activeElement === c ? (e.preventDefault(), g.focus()) : !e.shiftKey && document.activeElement === g && (e.preventDefault(), c.focus());
    }
    return te(async () => {
      D = document.activeElement instanceof HTMLElement ? document.activeElement : null, j = a.subscribe(Q), a.start(), window.addEventListener("error", F), window.addEventListener("unhandledrejection", V), await ne(), i.value?.focus();
    }), ve(() => {
      A += 1, v = null, window.removeEventListener("error", F), window.removeEventListener("unhandledrejection", V), j(), a.dispose(), D?.focus();
    }), (e, o) => (p(), u("main", {
      ref_key: "root",
      ref: i,
      class: H(["xiaobai-os-shell", `theme-${s.value}`]),
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "小白 OS",
      tabindex: "-1",
      onKeydown: ae,
      onClick: ce(B, ["self"])
    }, [R.value ? (p(), u("div", ua, O(R.value), 1)) : _("", !0), l.value ? (p(), C(da, {
      key: 2,
      apps: W.value,
      "active-app": d.value,
      "active-component": x.value,
      "active-state": k.value,
      "app-failure": n.value,
      "app-loading": f.value,
      "app-render-key": T.value,
      bridge: he(a),
      "character-avatar": G.value,
      onOpenApp: M,
      onBack: $,
      onHome: $,
      onClose: B,
      onRenderFailed: U,
      onRetry: Y,
      onReload: ee
    }, null, 8, [
      "apps",
      "active-app",
      "active-component",
      "active-state",
      "app-failure",
      "app-loading",
      "app-render-key",
      "bridge",
      "character-avatar"
    ])) : (p(), u("div", fa, "正在启动小白 OS"))], 34));
  }
}), ha = va;
ue(ha).mount("#app");
