/* eslint-disable */
import { $ as Q, E as pe, F as k, H as ge, I as we, L as be, M as ue, O as fe, Q as j, R as ve, U as ye, W as te, X as le, Y as y, _ as S, b as Y, et as ne, f as ke, g as Z, h as W, j as xe, l as ae, m as c, n as Ae, p as ie, q as ce, r as Oe, t as _e, tt as N, u as de, x as V, y as Se, z as Ee } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { t as Pe } from "./xiaobai-os-descriptor-DmDuv1pM.js";
import { t as Re } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { n as Ie, t as re } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
var se = [
  "messages",
  "fourth-wall",
  "administrator",
  "learning",
  "map",
  "world",
  "tasks",
  "dice",
  "shop",
  "wallet",
  "bank",
  "game",
  "agent-api"
], Le = Object.freeze({
  id: "agent-api",
  name: "Agent API",
  description: "Configure the shared model connection used by OS agents and test that connection from this APP.",
  accent: "#00b8c5"
}), Me = Object.freeze({
  id: "bank",
  name: "银行",
  description: "Deposit and invest Xiaobai coins, track positions and collect available proceeds.",
  accent: "#175ce5"
}), Ce = Object.freeze({
  id: "fourth-wall",
  name: "四次元壁",
  description: "Have out-of-story conversations with characters and receive their commentary on the roleplay.",
  accent: "#8b50f5"
}), $e = Object.freeze({
  id: "game",
  name: "游戏",
  description: "Play standalone wagering games using Xiaobai coins; game results are independent of roleplay.",
  accent: "#ef486f"
}), Be = Object.freeze({
  id: "map",
  name: "地图",
  description: "Explore the story’s places, routes, character positions and scene layouts.",
  accent: "#2795f5"
}), De = Object.freeze({
  id: "messages",
  name: "信息",
  accent: "#0bbe61",
  description: "Have private in-story conversations with characters; exchanges are synchronized to the main chat as story messages."
}), Te = Object.freeze({
  id: "shop",
  name: "奇物商店",
  description: "Buy items with Xiaobai coins and manage inventory; activated item effects can influence subsequent story replies.",
  accent: "#f34b42"
}), Ue = Object.freeze({
  id: "tasks",
  name: "任务",
  description: "Find and accept commissions, publish requests, recruit assignees and follow task progress and rewards.",
  accent: "#7950eb"
}), He = Object.freeze({
  id: "wallet",
  name: "钱包",
  description: "Read the user’s Xiaobai-coin balance and transaction history.",
  accent: "#f69a0e"
}), je = Object.freeze({
  id: "world",
  name: "世界",
  accent: "#1388f5",
  description: "Read news and a wider-world overview for the current story, with optional story-background injection."
}), Ge = Object.freeze({
  id: "learning",
  name: "语伴",
  accent: "#2467ed",
  description: "Learn languages with a chosen character through conversation, lessons and practice, with saved learning progress."
}), ze = Object.freeze({
  id: "dice",
  name: "Dice",
  accent: "#7062d9",
  description: "Roll dice and manage story action checks, random encounters and a CoC7 character sheet."
}), Xe = [
  {
    ...Pe,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3e%3crect%20width='64'%20height='64'%20rx='16'%20fill='%23428d83'/%3e%3cpath%20d='M17%2018h30v23H32l-10%207v-7h-5z'%20fill='none'%20stroke='%23fff'%20stroke-width='3'%20stroke-linejoin='round'/%3e%3cpath%20d='m25%2029%205%205%2010-11'%20fill='none'%20stroke='%23fff'%20stroke-width='3'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...ze,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3e%3crect%20width='64'%20height='64'%20rx='16'%20fill='%237062d9'/%3e%3cpath%20d='m32%2011%2020%2014v20L32%2056%2012%2045V25Zm0%200L21%2034l11%2022%2011-22ZM12%2025l9%209-9%2011m40-20-9%209%209%2011M21%2034h22'%20fill='none'%20stroke='%23fff'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Le,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2325dccc'/%3e%3cstop%20offset='1'%20stop-color='%2300a9c4'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3crect%20x='24'%20y='24'%20width='40'%20height='40'%20rx='11'%20stroke='%23fff'%20stroke-width='4'/%3e%3cpath%20d='M34%2016v8m10-8v8m10-8v8M34%2064v8m10-8v8m10-8v8M16%2034h8m-8%2010h8m-8%2010h8m40-20h8m-8%2010h8m-8%2010h8'%20stroke='%23fff'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3cpath%20d='m39%2036-8%208%208%208m10-16%208%208-8%208'%20stroke='%23fff'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Ce,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23a168ff'/%3e%3cstop%20offset='1'%20stop-color='%236837f1'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M26%2022h37a10%2010%200%200%201%2010%2010v20a10%2010%200%200%201-10%2010H43L27%2074V62h-1a10%2010%200%200%201-10-10V32a10%2010%200%200%201%2010-10Z'%20fill='%23fff'/%3e%3cpath%20d='M32%2035v16m-4-16h8m-8%2016h8m8-16%206%2016%207-16'%20stroke='%238046ee'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='m70%2011%202%206%206%202-6%202-2%206-2-6-6-2%206-2Z'%20fill='%23c8fff3'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...De,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2351e766'/%3e%3cstop%20offset='1'%20stop-color='%2305b959'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M73%2041c0%2015-13%2027-30%2027-4%200-8-1-12-2l-16%207%205-15c-5-5-8-10-8-17%200-15%2014-27%2031-27s30%2012%2030%2027Z'%20fill='%23fff'/%3e%3ccircle%20cx='30'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3ccircle%20cx='43'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3ccircle%20cx='56'%20cy='42'%20r='3.5'%20fill='%231cc765'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...He,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ffc535'/%3e%3cstop%20offset='1'%20stop-color='%23ff991a'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='m23%2030%2037-12a5%205%200%200%201%206%204v15H23Z'%20fill='%23fff'/%3e%3cpath%20d='M23%2029h42a8%208%200%200%201%208%208v28a8%208%200%200%201-8%208H23a8%208%200%200%201-8-8V37a8%208%200%200%201%208-8Z'%20fill='%23252938'/%3e%3cpath%20d='M24%2039h37'%20stroke='%23fff'%20stroke-opacity='.3'%20stroke-width='2.5'%20stroke-linecap='round'/%3e%3crect%20x='52'%20y='45'%20width='23'%20height='16'%20rx='6'%20fill='%23fff'/%3e%3ccircle%20cx='59'%20cy='53'%20r='2.5'%20fill='%23252938'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Te,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ff805d'/%3e%3cstop%20offset='1'%20stop-color='%23ff434e'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M23%2029h42l6%2039a6%206%200%200%201-6%207H23a6%206%200%200%201-6-7Z'%20fill='%23fff'/%3e%3cpath%20d='M33%2032V25a11%2011%200%200%201%2022%200v7'%20stroke='%23fff'%20stroke-width='4.5'%20stroke-linecap='round'/%3e%3cpath%20d='M33%2049c2%2014%2020%2014%2022%200'%20stroke='%23fa5951'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Me,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23353c4c'/%3e%3cstop%20offset='1'%20stop-color='%23111723'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='m18%2034%2026-17%2026%2017Z'%20fill='%23fff'/%3e%3cpath%20d='M22%2063V42m15%2021V42m14%2021V42m15%2021V42'%20stroke='%23fff'%20stroke-width='6'%20stroke-linecap='round'/%3e%3cpath%20d='M18%2072h52'%20stroke='%23fff'%20stroke-width='5'%20stroke-linecap='round'/%3e%3ccircle%20cx='44'%20cy='29'%20r='3'%20fill='%23465368'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...$e,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23ff7386'/%3e%3cstop%20offset='1'%20stop-color='%23ef385e'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M30%2028h28a13%2013%200%200%201%2013%2010l6%2020a9%209%200%200%201-15%209l-8-8H34l-8%208a9%209%200%200%201-15-9l6-20a13%2013%200%200%201%2013-10Z'%20fill='%23fff'/%3e%3cpath%20d='M28%2037v17m-8-8h16'%20stroke='%23ed4066'%20stroke-width='4'%20stroke-linecap='round'/%3e%3ccircle%20cx='60'%20cy='39'%20r='3.5'%20fill='%238554ed'/%3e%3ccircle%20cx='67'%20cy='48'%20r='3.5'%20fill='%2316bad0'/%3e%3cpath%20d='M38%2025v-4a6%206%200%200%201%206-6h8'%20stroke='%23fff'%20stroke-width='3'%20stroke-linecap='round'%20opacity='.8'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Be,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23f8fcff'/%3e%3cstop%20offset='1'%20stop-color='%23e7f3ff'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M0%200h39v32H0Z'%20fill='%2389eb9b'/%3e%3cpath%20d='M53%200h35v39H53Z'%20fill='%2345cf86'/%3e%3cpath%20d='M0%2048h28v40H0Z'%20fill='%23a0e89d'/%3e%3cpath%20d='M46%2053h42v35H46Z'%20fill='%2390d6ff'/%3e%3cpath%20d='M0%2039h88M39%200v88'%20stroke='%23fff'%20stroke-width='9'/%3e%3cpath%20d='m4%2085%2077-63'%20stroke='%23fff'%20stroke-width='12'/%3e%3cpath%20d='m4%2085%2077-63'%20stroke='%23ffcb45'%20stroke-width='5'/%3e%3cpath%20d='M60%2014a16%2016%200%200%200-16%2016c0%2013%2016%2028%2016%2028s16-15%2016-28a16%2016%200%200%200-16-16Z'%20fill='%23fa4c60'/%3e%3ccircle%20cx='60'%20cy='30'%20r='6'%20fill='%23fff'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...je,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2332c8ff'/%3e%3cstop%20offset='1'%20stop-color='%23086ef2'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3ccircle%20cx='44'%20cy='44'%20r='28'%20stroke='%23fff'%20stroke-width='3'/%3e%3cellipse%20cx='44'%20cy='44'%20rx='13'%20ry='28'%20stroke='%23fff'%20stroke-width='2.5'/%3e%3cpath%20d='M18%2034h52M16%2048h56M23%2061h42'%20stroke='%23fff'%20stroke-width='2.5'/%3e%3cpath%20d='m64%2018%207-5%205%205-5%207Z'%20fill='%23b5ffe0'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Ue,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%239d72ff'/%3e%3cstop%20offset='1'%20stop-color='%236b3eec'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3crect%20x='22'%20y='15'%20width='48'%20height='61'%20rx='9'%20fill='%23fff'/%3e%3cpath%20d='m17%2033%205%205%209-11m-14%2028%205%205%209-11'%20stroke='%23caffdc'%20stroke-width='4.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M39%2032h19M39%2040h12M39%2053h19M39%2061h12'%20stroke='%238658ec'%20stroke-width='3.5'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  },
  {
    ...Ge,
    icon: new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%20fill='none'%3e%3cdefs%3e%3clinearGradient%20id='bg'%20x1='12'%20y1='0'%20x2='76'%20y2='88'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%234099ff'/%3e%3cstop%20offset='1'%20stop-color='%232260f1'/%3e%3c/linearGradient%3e%3cclipPath%20id='tile'%3e%3crect%20width='88'%20height='88'%20rx='22'/%3e%3c/clipPath%3e%3c/defs%3e%3cg%20clip-path='url(%23tile)'%3e%3crect%20width='88'%20height='88'%20fill='url(%23bg)'/%3e%3cpath%20d='M23%2017h32a9%209%200%200%201%209%209v25a9%209%200%200%201-9%209H37L23%2070V60a9%209%200%200%201-9-9V26a9%209%200%200%201%209-9Z'%20fill='%23fff'/%3e%3cpath%20d='m27%2048%2010-23%2010%2023m-17-7h14'%20stroke='%232773f5'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3crect%20x='48'%20y='48'%20width='29'%20height='29'%20rx='9'%20fill='%2390ecff'/%3e%3cpath%20d='M54%2058h17m-9-4v4m5%200c-1%208-6%2011-12%2014m2-12c2%205%207%2010%2013%2012'%20stroke='%231952aa'%20stroke-width='2'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e", "" + import.meta.url).href
  }
], Fe = Object.freeze(se.map((t) => {
  const i = Xe.find((e) => e.id === t);
  if (!i) throw new Error(`missing_shell_app:${t}`);
  return Object.freeze(i);
}));
function qe(t) {
  let i = null, e = null;
  return Object.freeze({
    load() {
      return i ? Promise.resolve(i) : (e ??= t().then((l) => {
        if (!l?.default) throw new Error("app_component_missing");
        return i = l.default, i;
      }).catch((l) => {
        throw e = null, l;
      }), e);
    },
    reset() {
      i = null, e = null;
    }
  });
}
var Ze = Object.freeze({
  administrator: () => import("./xiaobai-os-AdministratorApp-XCk-nQId.js"),
  dice: () => import("./xiaobai-os-DiceApp-DvDzqfhk.js"),
  "agent-api": () => import("./xiaobai-os-AgentApiApp-DQqlXkZc.js"),
  "fourth-wall": () => import("./xiaobai-os-FourthWallApp-BMZja7qm.js"),
  wallet: () => import("./xiaobai-os-WalletApp-C4Pk7UXA.js"),
  shop: () => import("./xiaobai-os-ShopApp-CI2ockjI.js"),
  bank: () => import("./xiaobai-os-BankApp-N29vt14g.js"),
  game: () => import("./xiaobai-os-GameApp-CDmPCT4q.js"),
  map: () => import("./xiaobai-os-MapApp-Dz4cIAjd.js"),
  messages: () => import("./xiaobai-os-MessagesApp-byeH9swH.js"),
  tasks: () => import("./xiaobai-os-TasksApp-BZvY-w7Q.js"),
  world: () => import("./xiaobai-os-WorldApp-BkSYg6zS.js"),
  learning: () => import("./xiaobai-os-LearningApp-DtIAs-Mc.js")
}), he = Object.freeze(Fe.map((t) => {
  const i = Ze[t.id];
  if (!i) throw new Error(`missing_shell_app:${t.id}`);
  const e = qe(i);
  return Object.freeze({
    ...t,
    load: e.load,
    resetLoader: e.reset
  });
})), Ht = Object.freeze(he.map((t) => t.id));
function Ne() {
  const t = [];
  return {
    add(i) {
      return t.push(i), () => {
        const e = t.indexOf(i);
        e >= 0 && t.splice(e, 1);
      };
    },
    back() {
      for (const i of [...t].reverse()) if (i()) return !0;
      return !1;
    }
  };
}
var Ve = /* @__PURE__ */ V({
  __name: "AppNavigationScope",
  props: { owner: {} },
  setup(t, { expose: i }) {
    const e = t, l = y(null), w = le([]), E = Ne();
    return we(Re, {
      root: l,
      layers: w,
      stack: E
    }), ye((u) => {
      const r = w.value.at(-1);
      if (!r || !l.value?.contains(r)) return;
      const m = /* @__PURE__ */ new Set();
      function d() {
        let v = r;
        for (; v.parentElement && v !== l.value; ) {
          for (const f of v.parentElement.children) f !== v && f instanceof HTMLElement && !f.inert && (f.inert = !0, m.add(f));
          v = v.parentElement;
        }
      }
      d();
      const x = new MutationObserver(d);
      let A = r;
      for (; A.parentElement && A !== l.value; )
        x.observe(A.parentElement, { childList: !0 }), A = A.parentElement;
      u(() => {
        x.disconnect();
        for (const v of m) v.inert = !1;
      });
    }, { flush: "post" }), i({
      back: E.back,
      get owner() {
        return e.owner;
      }
    }), (u, r) => (k(), S("div", {
      ref_key: "root",
      ref: l,
      class: "xiaobai-os-app-route",
      tabindex: "-1"
    }, [ve(u.$slots, "default")], 512));
  }
}), Ke = Ve, Ye = /* @__PURE__ */ V({
  __name: "AppBoundary",
  emits: ["failed"],
  setup(t, { emit: i }) {
    const e = i;
    return xe((l) => (e("failed", l), !1)), (l, w) => ve(l.$slots, "default");
  }
}), We = Ye;
function Qe(t) {
  if (!Array.isArray(t)) return [];
  const i = new Set(se);
  return [...new Set(t.filter((e) => typeof e == "string" && i.has(e)))];
}
function me(t) {
  return [.../* @__PURE__ */ new Set([...Qe(t), ...se])];
}
function oe(t, i) {
  const e = new Map(t.map((l) => [l.id, l]));
  return me(i).flatMap((l) => {
    const w = e.get(l);
    return w ? [w] : [];
  });
}
function Je(t, i) {
  const e = new Set(i);
  let l = 0;
  return me(t).map((w) => e.has(w) ? i[l++] : w);
}
function et(t) {
  const i = le(null);
  let e = null, l, w = 0;
  function E() {
    const n = t.root.value;
    if (!e || !i.value || !n) return;
    const s = e;
    i.value = {
      id: s.id,
      x: s.x - s.offsetX,
      y: s.y - s.offsetY,
      width: s.width
    };
    const R = n.getBoundingClientRect(), T = 42, F = s.y < R.top + T ? -8 : s.y > R.bottom - T ? 8 : 0;
    F && (n.scrollTop += F);
    const L = n.querySelector(".xiaobai-os-app-grid");
    if (L) {
      const D = L.getBoundingClientRect();
      let o = 0, g = 1 / 0;
      [...L.querySelectorAll("[data-app-id]")].forEach((p, $) => {
        const U = D.left + p.offsetLeft + p.offsetWidth / 2 - s.x, q = D.top + p.offsetTop + p.offsetHeight / 2 - s.y, H = U * U + q * q;
        H < g && (g = H, o = $);
      }), t.move(s.id, o);
    }
  }
  function u() {
    E(), w = requestAnimationFrame(u);
  }
  function r() {
    e && (clearTimeout(l), t.start(e.id), e.pointerId !== null && t.root.value?.setPointerCapture(e.pointerId), i.value = {
      id: e.id,
      x: e.x - e.offsetX,
      y: e.y - e.offsetY,
      width: e.width
    }, w = requestAnimationFrame(u));
  }
  function m(n, s, R, T, F) {
    if (e || t.disabled()) return;
    const L = n instanceof Element ? n.closest("[data-app-id]") : null;
    if (!L?.dataset.appId) return;
    const D = L.getBoundingClientRect();
    e = {
      id: L.dataset.appId,
      pointerId: T,
      touchId: F,
      x: s,
      y: R,
      startX: s,
      startY: R,
      width: D.width,
      offsetX: s - D.left,
      offsetY: R - D.top
    }, window.addEventListener("pointermove", v), window.addEventListener("pointerup", f), window.addEventListener("pointercancel", G), window.addEventListener("blur", _), t.editing.value ? r() : l = setTimeout(r, 420);
  }
  function d(n, s) {
    e && (e.x = n, e.y = s, !i.value && Math.hypot(n - e.startX, s - e.startY) > 8 && (e.touchId !== null ? x(!0) : r()));
  }
  function x(n) {
    clearTimeout(l), cancelAnimationFrame(w), !n && i.value && E(), window.removeEventListener("pointermove", v), window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", G), window.removeEventListener("blur", _), e?.pointerId !== null && e?.pointerId !== void 0 && t.root.value?.hasPointerCapture(e.pointerId) && t.root.value.releasePointerCapture(e.pointerId);
    const s = !!i.value;
    e = null, i.value = null, s && t.finish(n);
  }
  function A(n) {
    n.pointerType === "touch" || n.button !== 0 || !n.isPrimary || m(n.target, n.clientX, n.clientY, n.pointerId, null);
  }
  function v(n) {
    e?.pointerId === n.pointerId && d(n.clientX, n.clientY);
  }
  function f(n) {
    e?.pointerId === n.pointerId && x(!1);
  }
  function G(n) {
    e?.pointerId === n.pointerId && x(!0);
  }
  function C(n) {
    if (n.touches.length !== 1) {
      x(!0);
      return;
    }
    const s = n.changedTouches[0];
    m(n.target, s.clientX, s.clientY, null, s.identifier), i.value && n.cancelable && n.preventDefault();
  }
  function z(n) {
    const s = [...n.touches].find((R) => R.identifier === e?.touchId);
    s && (i.value && n.cancelable && n.preventDefault(), d(s.clientX, s.clientY));
  }
  function X(n) {
    [...n.changedTouches].some((s) => s.identifier === e?.touchId) && (i.value && n.cancelable && n.preventDefault(), x(!1));
  }
  function _() {
    x(!0);
  }
  function b() {
    document.hidden && _();
  }
  let P = null;
  return ue(() => {
    P = t.root.value, P?.addEventListener("touchstart", C, { passive: !1 }), P?.addEventListener("touchmove", z, { passive: !1 }), P?.addEventListener("touchend", X, { passive: !1 }), P?.addEventListener("touchcancel", _), document.addEventListener("visibilitychange", b);
  }), fe(() => {
    _(), P?.removeEventListener("touchstart", C), P?.removeEventListener("touchmove", z), P?.removeEventListener("touchend", X), P?.removeEventListener("touchcancel", _), document.removeEventListener("visibilitychange", b);
  }), {
    floating: i,
    pointerDown: A,
    cancel: _
  };
}
var tt = {
  class: "xiaobai-os-home-background",
  "aria-hidden": "true"
}, at = ["src"], it = { class: "xiaobai-os-desktop-toolbar" }, rt = ["disabled"], nt = ["disabled"], ot = {
  key: 0,
  class: "xiaobai-os-order-error",
  role: "alert"
}, lt = ["disabled"], st = [
  "data-app-id",
  "aria-label",
  "aria-keyshortcuts",
  "onClick"
], ct = {
  class: "xiaobai-os-app-icon",
  "aria-hidden": "true"
}, dt = ["src"], pt = { class: "xiaobai-os-app-name" }, ut = {
  class: "xiaobai-os-sort-announcement",
  role: "status"
}, ft = { class: "xiaobai-os-app-icon" }, vt = ["src"], ht = { class: "xiaobai-os-app-name" }, mt = /* @__PURE__ */ V({
  __name: "XiaobaiOsHome",
  props: {
    apps: {},
    characterAvatar: {},
    saveAppOrder: { type: Function }
  },
  emits: ["openApp"],
  setup(t, { expose: i, emit: e }) {
    const l = t, w = e, E = y(null), u = y(!1), r = y([]), m = y(!1), d = y(""), x = y(""), A = y("");
    let v = [], f = null;
    const G = ie(() => u.value ? oe(l.apps, r.value) : l.apps);
    function C(o) {
      pe(() => E.value?.querySelector(`[data-app-id="${o}"]`)?.focus({ preventScroll: !0 }));
    }
    function z(o) {
      u.value || (r.value = l.apps.map((g) => g.id)), u.value = !0, A.value = o;
    }
    function X(o, g) {
      const p = r.value.indexOf(o);
      if (p < 0 || p === g) return;
      const $ = [...r.value];
      $.splice(p, 1), $.splice(g, 0, o), r.value = $;
    }
    async function _(o) {
      m.value = !0, d.value = "", f = o;
      try {
        await l.saveAppOrder(o), x.value = "顺序已保存";
      } catch {
        d.value = "顺序未能保存";
      } finally {
        m.value = !1;
      }
    }
    const { floating: b, pointerDown: P, cancel: n } = et({
      root: E,
      editing: u,
      disabled: () => m.value || !!d.value,
      start(o) {
        z(o), v = [...r.value];
      },
      move: X,
      finish(o) {
        o ? r.value = v : r.value.some((g, p) => g !== v[p]) && _([...r.value]), C(A.value);
      }
    }), s = ie(() => l.apps.find((o) => o.id === b.value?.id));
    function R() {
      m.value || (n(), u.value = !1, C(A.value));
    }
    i({
      get editing() {
        return u.value;
      },
      finishEditing: R
    });
    async function T() {
      n(), r.value = oe(l.apps, []).map((o) => o.id), await _(null);
    }
    function F(o) {
      u.value ? A.value = o.id : w("openApp", o);
    }
    function L(o) {
      if (o.key === "Escape" && u.value) {
        o.preventDefault(), o.stopPropagation(), b.value ? n() : R();
        return;
      }
      const g = o.target instanceof Element ? o.target.closest("[data-app-id]") : null, p = g?.dataset.appId;
      if (!p || m.value || d.value) return;
      if (o.key === " " || o.key === "F2") {
        o.preventDefault(), u.value && o.key === " " ? R() : (z(p), x.value = "整理应用，使用方向键移动，空格键完成");
        return;
      }
      if (!u.value) return;
      const $ = g?.parentElement, U = $ ? getComputedStyle($).gridTemplateColumns.split(" ").length : 4, q = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -U,
        ArrowDown: U
      }[o.key];
      if (q === void 0) return;
      o.preventDefault();
      const H = r.value.indexOf(p), J = Math.max(0, Math.min(r.value.length - 1, H + q));
      J !== H && (X(p, J), A.value = p, C(p), _([...r.value]));
    }
    function D(o) {
      o.key === " " && o.target instanceof Element && o.target.closest("[data-app-id]") && o.preventDefault();
    }
    return ge(() => l.apps.map((o) => o.id).sort().join(","), () => {
      n(), r.value = l.apps.map((o) => o.id);
    }), (o, g) => (k(), S("main", {
      ref_key: "root",
      ref: E,
      class: Q(["xiaobai-os-home", { "is-editing": u.value }]),
      onPointerdown: g[1] || (g[1] = (...p) => j(P) && j(P)(...p)),
      onKeydown: L,
      onKeyup: D,
      onContextmenu: g[2] || (g[2] = ae(() => {
      }, ["prevent"])),
      onDragstart: g[3] || (g[3] = ae(() => {
      }, ["prevent"]))
    }, [
      c("div", tt, [t.characterAvatar ? (k(), S("img", {
        key: 0,
        class: "xiaobai-os-wallpaper",
        src: t.characterAvatar,
        alt: "",
        draggable: "false"
      }, null, 8, at)) : Z("", !0), g[4] || (g[4] = c("div", { class: "xiaobai-os-home-wash" }, null, -1))]),
      c("div", it, [u.value ? (k(), S(de, { key: 0 }, [c("button", {
        type: "button",
        disabled: m.value || !!d.value,
        onClick: T
      }, "恢复默认", 8, rt), c("button", {
        class: "xiaobai-os-desktop-done",
        type: "button",
        disabled: m.value,
        onClick: R
      }, "完成", 8, nt)], 64)) : Z("", !0)]),
      d.value ? (k(), S("div", ot, [c("span", null, N(d.value), 1), c("button", {
        type: "button",
        disabled: m.value,
        onClick: g[0] || (g[0] = (p) => _(j(f)))
      }, "重试", 8, lt)])) : Z("", !0),
      Y(Ae, {
        tag: "section",
        name: "xiaobai-os-sort",
        class: "xiaobai-os-app-grid",
        "aria-label": "应用"
      }, {
        default: te(() => [(k(!0), S(de, null, be(G.value, (p) => (k(), S("button", {
          key: p.id,
          type: "button",
          class: Q(["xiaobai-os-app-tile", { "is-lifted": j(b)?.id === p.id }]),
          "data-app-id": p.id,
          "aria-label": p.name,
          "aria-keyshortcuts": u.value ? "ArrowUp ArrowDown ArrowLeft ArrowRight Space" : "F2 Space",
          style: ne({ "--app-accent": p.accent }),
          onClick: ($) => F(p)
        }, [c("span", ct, [c("img", {
          src: p.icon,
          alt: "",
          width: "64",
          height: "64",
          draggable: "false"
        }, null, 8, dt)]), c("span", pt, N(p.name), 1)], 14, st))), 128))]),
        _: 1
      }),
      c("span", ut, N(x.value), 1),
      (k(), W(ke, { to: "body" }, [j(b) && s.value ? (k(), S("div", {
        key: 0,
        class: "xiaobai-os-dragged-app xiaobai-os-app-tile",
        "aria-hidden": "true",
        style: ne({
          left: `${j(b).x}px`,
          top: `${j(b).y}px`,
          width: `${j(b).width}px`
        })
      }, [c("span", ft, [c("img", {
        src: s.value.icon,
        alt: "",
        draggable: "false"
      }, null, 8, vt)]), c("span", ht, N(s.value.name), 1)], 4)) : Z("", !0)]))
    ], 34));
  }
}), gt = mt, wt = ["disabled"], bt = {
  key: 0,
  "aria-hidden": "true"
}, yt = /* @__PURE__ */ V({
  __name: "XiaobaiOsNavigation",
  props: {
    isHome: { type: Boolean },
    canBack: { type: Boolean }
  },
  emits: [
    "back",
    "home",
    "close"
  ],
  setup(t) {
    return (i, e) => (k(), S("nav", {
      class: Q(["xiaobai-os-navigation", { "is-home": t.isHome }]),
      "aria-label": "系统导航"
    }, [
      c("button", {
        type: "button",
        class: "xiaobai-os-nav-button",
        disabled: !t.canBack,
        "aria-label": "返回",
        onPointerdown: e[0] || (e[0] = ae(() => {
        }, ["prevent"])),
        onClick: e[1] || (e[1] = (l) => i.$emit("back"))
      }, [...e[4] || (e[4] = [c("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [c("path", { d: "m14.5 6-6 6 6 6" })], -1)])], 40, wt),
      c("button", {
        type: "button",
        class: "xiaobai-os-nav-button xiaobai-os-home-button",
        "aria-label": "主页",
        onClick: e[2] || (e[2] = (l) => i.$emit("home"))
      }, [e[5] || (e[5] = c("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [c("path", { d: "m4.5 11 7.5-6 7.5 6v8h-5v-5h-5v5h-5z" })], -1)), t.isHome ? (k(), S("i", bt)) : Z("", !0)]),
      c("button", {
        type: "button",
        class: "xiaobai-os-nav-button xiaobai-os-close-button",
        "aria-label": "关闭",
        onClick: e[3] || (e[3] = (l) => i.$emit("close"))
      }, [...e[6] || (e[6] = [c("span", null, [c("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [c("path", { d: "m7 9.5 5 5 5-5" })])], -1)])])
    ], 2));
  }
}), kt = yt, xt = /* @__PURE__ */ V({
  __name: "XiaobaiOsSystemBar",
  props: { isHome: { type: Boolean } },
  setup(t) {
    return (i, e) => (k(), S("header", {
      class: Q(["xiaobai-os-system-bar", { "is-home": t.isHome }]),
      "aria-label": "系统栏"
    }, [...e[0] || (e[0] = [c("span", { class: "xiaobai-os-system-mark" }, "小白 OS", -1)])], 2));
  }
}), At = xt, Ot = { class: "xiaobai-os-device" }, _t = { class: "xiaobai-os-glass" }, St = {
  key: "failure",
  class: "xiaobai-os-app-failure",
  role: "alert"
}, Et = { class: "xiaobai-os-app-failure-actions" }, Pt = {
  key: "loading",
  class: "xiaobai-os-app-loading",
  role: "status"
}, Rt = /* @__PURE__ */ V({
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
    characterAvatar: {},
    saveAppOrder: { type: Function }
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
  setup(t, { expose: i }) {
    const e = t, l = ie(() => e.activeApp === null), w = y(null), E = y(null);
    return i({
      back: () => l.value && w.value?.editing ? (w.value.finishEditing(), !0) : !e.appLoading && !e.appFailure && E.value?.owner === `${e.activeApp?.id}:${e.appRenderKey}` && E.value.back(),
      finishHomeEditing: () => w.value?.finishEditing()
    }), (u, r) => (k(), S("div", Ot, [r[9] || (r[9] = c("span", {
      class: "xiaobai-os-side-key",
      "aria-hidden": "true"
    }, null, -1)), c("div", _t, [
      Y(At, { "is-home": l.value }, null, 8, ["is-home"]),
      c("div", {
        class: "xiaobai-os-stage",
        style: ne(t.activeApp ? { "--app-accent": t.activeApp.accent } : null)
      }, [Y(_e, {
        name: "xiaobai-os-route",
        mode: "out-in"
      }, {
        default: te(() => [l.value ? (k(), W(gt, {
          key: "home",
          ref_key: "home",
          ref: w,
          apps: t.apps,
          "character-avatar": t.characterAvatar,
          "save-app-order": t.saveAppOrder,
          onOpenApp: r[0] || (r[0] = (m) => u.$emit("openApp", m))
        }, null, 8, [
          "apps",
          "character-avatar",
          "save-app-order"
        ])) : t.appFailure ? (k(), S("section", St, [
          r[7] || (r[7] = c("span", {
            class: "xiaobai-os-app-failure-mark",
            "aria-hidden": "true"
          }, "!", -1)),
          c("h1", null, N(t.activeApp?.name) + "暂时无法打开", 1),
          c("p", null, N(t.appFailure.message), 1),
          c("div", Et, [t.appFailure.retryable ? (k(), S("button", {
            key: 0,
            type: "button",
            onClick: r[1] || (r[1] = (m) => u.$emit("retry"))
          }, "重试")) : Z("", !0), c("button", {
            type: "button",
            onClick: r[2] || (r[2] = (m) => u.$emit("reload"))
          }, "重新打开 OS")])
        ])) : t.appLoading ? (k(), S("div", Pt, [r[8] || (r[8] = c("span", { "aria-hidden": "true" }, null, -1)), Se(" 正在打开" + N(t.activeApp?.name), 1)])) : t.activeApp && t.activeComponent ? (k(), W(Ke, {
          key: `app:${t.activeApp.id}:${t.appRenderKey}`,
          ref_key: "navigation",
          ref: E,
          owner: `${t.activeApp.id}:${t.appRenderKey}`
        }, {
          default: te(() => [Y(We, { onFailed: r[3] || (r[3] = (m) => u.$emit("renderFailed", m)) }, {
            default: te(() => [(k(), W(Ee(t.activeComponent), {
              bridge: t.bridge,
              "initial-state": t.activeState
            }, null, 8, ["bridge", "initial-state"]))]),
            _: 1
          })]),
          _: 1
        }, 8, ["owner"])) : Z("", !0)]),
        _: 1
      })], 4),
      Y(kt, {
        "is-home": l.value,
        "can-back": !l.value || !!w.value?.editing,
        onBack: r[4] || (r[4] = (m) => u.$emit("back")),
        onHome: r[5] || (r[5] = (m) => u.$emit("home")),
        onClose: r[6] || (r[6] = (m) => u.$emit("close"))
      }, null, 8, ["is-home", "can-back"])
    ])]));
  }
}), It = Rt, Lt = {
  key: 0,
  class: "xiaobai-os-error",
  role: "alert"
}, Mt = {
  key: 1,
  class: "xiaobai-os-loading",
  role: "status"
}, Ct = /* @__PURE__ */ V({
  __name: "App",
  setup(t) {
    const i = Ie(), e = y(null), l = y(null), w = y(!1), E = y("light"), u = y(/* @__PURE__ */ new Set()), r = y([]), m = y(""), d = y(null), x = le(null), A = y(null), v = y(!1), f = y(null), G = y(0), C = y("");
    let z = null, X = () => {
    }, _ = 0, b = null;
    const P = ie(() => oe(he, r.value).filter((a) => u.value.has(a.id)));
    async function n(a) {
      const h = a === null ? [] : Je(r.value, a);
      r.value = (await i.request("os/set-app-order", { appOrder: h })).appOrder;
    }
    function s(a) {
      const h = new Set(a.map((B) => String(B.id))), O = d.value && !h.has(d.value.id), I = b && !h.has(b.appId);
      u.value = h, !(!O && !I) && (_ += 1, b = null, d.value = null, x.value = null, A.value = null, v.value = !1, f.value = null, i.clearAppSession());
    }
    function R(a) {
      _ += 1, b = null, E.value = a.theme === "dark" ? "dark" : "light", r.value = a.appOrder ?? [], s(a.apps || []), m.value = String(a.chat?.characterAvatar || ""), d.value = null, x.value = null, A.value = null, v.value = !1, f.value = null, i.clearAppSession(), w.value = !0, a.initialAppId && T(a.initialAppId);
    }
    function T(a) {
      if (!a) {
        U();
        return;
      }
      const h = P.value.find((O) => O.id === a);
      h && d.value?.id !== h.id && L(h);
    }
    function F(a) {
      if (a.type === "os/app-order-changed" && (r.value = a.payload.appOrder), a.type === "os/init" && R(a.payload || {}), a.type === "os/navigate" && w.value) {
        const I = a.payload;
        (I?.appId === null || typeof I?.appId == "string") && T(I.appId);
      }
      if (a.type === "os/theme-changed" && (E.value = a.payload?.theme === "dark" ? "dark" : "light"), a.type === "os/apps-changed") {
        const I = a.payload;
        s(I?.apps || []);
      }
      if (a.type === "os/app-state") {
        const I = a.payload, B = I?.status;
        I?.appId === d.value?.id && B?.state === "failed" && (v.value = !1, f.value = {
          phase: B.failure?.phase || "host",
          message: B.failure?.message || "应用暂时无法运行",
          retryable: B.failure?.retryable !== !1,
          requiresAppRetry: !0
        }, i.clearAppSession());
      }
      a.type === "os/error" && (C.value = String(a.payload?.message || "小白 OS 启动失败"));
      const h = a.payload?.state;
      b && a.appId === b.appId && a.type === `${b.appId}/state` && (b.latestState = h);
      const O = i.getAppSession();
      d.value && O?.appId === d.value.id && a.appId === O.appId && a.activationToken === O.activationToken && a.type === `${d.value.id}/state` && (A.value = h);
    }
    async function L(a) {
      const h = ++_;
      G.value += 1;
      const O = { appId: a.id };
      b = O, d.value = a, x.value = null, A.value = null, v.value = !0, f.value = null, i.clearAppSession(), C.value = "";
      const I = i.request("app/activate", { appId: a.id }), B = a.load(), [K, ee] = await Promise.allSettled([I, B]);
      try {
        if (h !== _) return;
        if (K.status === "fulfilled") {
          if (K.value.appId !== a.id || !K.value.activationToken) throw new Error("app_activation_mismatch");
          i.setAppSession({
            appId: a.id,
            activationToken: K.value.activationToken
          }), A.value = O.latestState ?? K.value.state ?? null;
        } else {
          const M = K.reason;
          f.value = {
            phase: M instanceof re ? M.phase : "host",
            message: M instanceof Error ? M.message : String(M),
            retryable: !(M instanceof re) || M.retryable,
            requiresAppRetry: M instanceof re && M.requiresAppRetry
          };
        }
        ee.status === "fulfilled" ? x.value = ce(ee.value) : f.value || (f.value = {
          phase: "ui-load",
          message: ee.reason instanceof Error ? ee.reason.message : "应用页面加载失败",
          retryable: !0
        }), v.value = !1;
      } catch (M) {
        v.value = !1, f.value = {
          phase: "host",
          message: M instanceof Error ? M.message : String(M),
          retryable: !0
        }, i.clearAppSession();
      } finally {
        b === O && (b = null);
      }
    }
    async function D() {
      const a = d.value, h = f.value;
      if (!(!a || !h)) {
        if (h.phase === "ui-render") {
          f.value = null, G.value += 1;
          return;
        }
        if (h.phase === "ui-load" && i.getAppSession()?.appId === a.id) {
          v.value = !0, f.value = null, a.resetLoader();
          try {
            x.value = ce(await a.load());
          } catch (O) {
            f.value = {
              phase: "ui-load",
              message: O instanceof Error ? O.message : "应用页面加载失败",
              retryable: !0
            };
          } finally {
            v.value = !1;
          }
          return;
        }
        if ((h.phase === "activate" || h.phase === "host") && !h.requiresAppRetry) {
          await L(a);
          return;
        }
        v.value = !0, f.value = null;
        try {
          await i.request("app/retry", { appId: a.id }), await L(a);
        } catch (O) {
          v.value = !1, f.value = {
            phase: "host",
            message: O instanceof Error ? O.message : String(O),
            retryable: !0
          };
        }
      }
    }
    function o(a) {
      const h = d.value;
      h && (f.value = {
        phase: "ui-render",
        message: a instanceof Error ? a.message : "应用页面显示出了问题",
        retryable: !0
      }, i.post("os/app-ui-failure", {
        appId: h.id,
        phase: "ui-render"
      }));
    }
    function g(a) {
      !d.value || v.value || f.value || (a.preventDefault(), o(a.error ?? new Error(a.message || "应用页面出了问题")));
    }
    function p(a) {
      !d.value || v.value || f.value || (a.preventDefault(), o(a.reason));
    }
    function $() {
      window.location.reload();
    }
    function U() {
      if (!d.value) {
        l.value?.finishHomeEditing();
        return;
      }
      _ += 1, b = null, i.post("app/deactivate", { appId: d.value?.id || "" }), i.clearAppSession(), d.value = null, x.value = null, A.value = null, v.value = !1, f.value = null;
    }
    function q() {
      l.value?.back() || U();
    }
    function H() {
      _ += 1, b = null, i.post("os/close"), i.clearAppSession();
    }
    function J(a) {
      if (a.key === "Escape") {
        a.preventDefault(), d.value ? q() : l.value?.back() || H();
        return;
      }
      if (a.key !== "Tab" || !e.value) return;
      const h = Array.from(e.value.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])')).filter((B) => !B.closest("[inert]") && B.getClientRects().length > 0);
      if (h.length === 0) return;
      const O = h[0], I = h[h.length - 1];
      a.shiftKey && document.activeElement === O ? (a.preventDefault(), I.focus()) : !a.shiftKey && document.activeElement === I && (a.preventDefault(), O.focus());
    }
    return ue(async () => {
      z = document.activeElement instanceof HTMLElement ? document.activeElement : null, X = i.subscribe(F), i.start(), window.addEventListener("error", g), window.addEventListener("unhandledrejection", p), await pe(), e.value?.focus();
    }), fe(() => {
      _ += 1, b = null, window.removeEventListener("error", g), window.removeEventListener("unhandledrejection", p), X(), i.dispose(), z?.focus();
    }), (a, h) => (k(), S("main", {
      ref_key: "root",
      ref: e,
      class: Q(["xiaobai-os-shell", `theme-${E.value}`]),
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "小白 OS",
      tabindex: "-1",
      onKeydown: J,
      onClick: ae(H, ["self"])
    }, [C.value ? (k(), S("div", Lt, N(C.value), 1)) : Z("", !0), w.value ? (k(), W(It, {
      key: 2,
      ref_key: "device",
      ref: l,
      apps: P.value,
      "active-app": d.value,
      "active-component": x.value,
      "active-state": A.value,
      "app-failure": f.value,
      "app-loading": v.value,
      "app-render-key": G.value,
      bridge: j(i),
      "character-avatar": m.value,
      "save-app-order": n,
      onOpenApp: L,
      onBack: q,
      onHome: U,
      onClose: H,
      onRenderFailed: o,
      onRetry: D,
      onReload: $
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
    ])) : (k(), S("div", Mt, "正在启动小白 OS"))], 34));
  }
}), $t = Ct;
Oe($t).mount("#app");
