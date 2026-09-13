/* eslint-disable */
var H = Object.freeze([
  "wall",
  "road",
  "water",
  "terrain",
  "furniture",
  "decoration",
  "door",
  "danger",
  "marker",
  "actor",
  "label",
  "grid",
  "magic",
  "secret",
  "light"
]), U = Object.freeze([
  "rect",
  "circle",
  "path",
  "curve",
  "icon",
  "label"
]), Q = Object.freeze([
  "door",
  "stairs",
  "elevator",
  "portal",
  "passage",
  "entrance",
  "exit",
  "north",
  "south",
  "east",
  "west",
  "up",
  "down",
  "trap",
  "chest",
  "marker",
  "player",
  "actor"
]), V = Object.freeze([
  "unknown",
  "wood",
  "stone",
  "tile",
  "carpet",
  "bed-sheet",
  "fabric",
  "tatami",
  "sand",
  "marble",
  "blood",
  "water",
  "grass",
  "forest",
  "glass",
  "dirt",
  "snow",
  "metal",
  "rune",
  "warm-light",
  "cold-light",
  "shadow"
]), rr = Object.freeze([
  "confirmed",
  "inferred",
  "unknown"
]), I = Object.freeze([
  {
    name: "Seating and sleeping",
    icons: [
      "chair",
      "stool",
      "bench",
      "sofa",
      "bed"
    ],
    hint: "chair has a back; stool has none; bench is a long shared seat."
  },
  {
    name: "Surfaces and storage",
    icons: [
      "table",
      "counter",
      "shelf",
      "cabinet",
      "chest",
      "barrel"
    ],
    hint: "shelf is open shelving; cabinet is closed storage; chest is a box; barrel covers barrels and jars."
  },
  {
    name: "Kitchen and bathroom",
    icons: [
      "stove",
      "refrigerator",
      "sink",
      "toilet",
      "bathtub"
    ],
    hint: ""
  },
  {
    name: "Equipment and vehicles",
    icons: [
      "terminal",
      "machine",
      "vending-machine",
      "car"
    ],
    hint: "terminal is an operator console; machine is general machinery."
  },
  {
    name: "Site fixtures",
    icons: [
      "column",
      "partition",
      "fence",
      "door-open",
      "ladder",
      "statue",
      "well",
      "fountain",
      "bridge",
      "tent"
    ],
    hint: "partition is a freestanding screen; fence follows a path; door-open is an entrance marker, not evidence of an open door; ladder is a standalone ladder, not stairs or a floor connection."
  },
  {
    name: "Plants and natural objects",
    icons: [
      "tree",
      "potted-plant",
      "rock"
    ],
    hint: "tree is one tree; a forest is terrain with material forest."
  },
  {
    name: "Lighting and signs",
    icons: [
      "light",
      "fire",
      "flag",
      "sign"
    ],
    hint: "light is a freestanding fixture; light regions use category light without an object icon."
  }
]), T = Object.freeze(I.flatMap((r) => [...r.icons])), tr = Object.freeze([
  ...T,
  "stairs",
  "elevator",
  "portal",
  "passage",
  "entrance",
  "exit",
  "north",
  "south",
  "east",
  "west",
  "up",
  "down",
  "trap",
  "marker",
  "player",
  "actor",
  "building",
  "water"
]), ar = Object.freeze(/* @__PURE__ */ new Set([
  "floor",
  "ground",
  "surface",
  "base",
  "area",
  "deck",
  "platform",
  "walkway",
  "clearing",
  "yard"
])), N = Object.freeze({
  unknown: "#bfc5b6",
  wood: "#c4a477",
  stone: "#bac0ad",
  tile: "#ccd2bf",
  carpet: "#b49d91",
  "bed-sheet": "#e0dcca",
  fabric: "#acb69e",
  tatami: "#bebd8f",
  sand: "#ded0a1",
  marble: "#dce0d3",
  blood: "#ab6260",
  water: "#86bdb9",
  grass: "#c7d4ae",
  forest: "#91ac7d",
  glass: "#b5d5ce",
  dirt: "#bda989",
  snow: "#e6eee1",
  metal: "#aabec0",
  rune: "#aca0be",
  "warm-light": "#e3c28c",
  "cold-light": "#afced6",
  shadow: "#758079"
});
function L(r, t) {
  return `url(#${t}-material-${r || "unknown"})`;
}
function er(r, t) {
  return `url(#${t}-face-${r || "unknown"})`;
}
function or(r) {
  return `color-mix(in srgb, ${N[r]}, var(--map-surface) var(--scene-material-mix))`;
}
var z = /* @__PURE__ */ new Set([
  "water",
  "terrain",
  "furniture",
  "decoration",
  "danger",
  "magic",
  "secret",
  "light"
]), R = new Set(T), B = /* @__PURE__ */ new Set([
  "chair",
  "table",
  "bed",
  "counter",
  "shelf",
  "sofa",
  "bridge",
  "tree",
  "rock"
]);
function nr(r) {
  return !!r.icon && B.has(r.icon);
}
var _ = (r) => Number(r.toFixed(3)).toString(), y = (r) => r.geometry.points || [];
function G(r) {
  return r.shape === "icon" || r.shape === "label" || r.category === "actor" || r.category === "door" || r.kind === "stairs" || r.icon === "stairs" || r.icon === "door-open";
}
function m(r) {
  return y(r).length >= 3 && (r.closed ?? z.has(r.category));
}
function k(r) {
  return r.category === "wall" || r.category === "grid" || r.icon === "fence" && ["path", "curve"].includes(r.shape) ? !1 : r.shape === "rect" || r.shape === "circle" ? !0 : (r.shape === "path" || r.shape === "curve") && m(r);
}
function K(r) {
  return ![
    "wall",
    "grid",
    "actor"
  ].includes(r.category) && (r.shape === "rect" || r.shape === "circle") && (r.icon !== void 0 && R.has(r.icon) || [
    "furniture",
    "decoration",
    "door"
  ].includes(r.category));
}
function P(r, t, o) {
  const a = r[o], i = r[(o + 1) % r.length], e = r[o - 1] || (t ? r[r.length - 1] : a), n = r[o + 2] || (t ? r[(o + 2) % r.length] : i), c = (s, l, g) => Math.max(Math.min(l, g), Math.min(Math.max(l, g), s));
  return [[c(a[0] + (i[0] - e[0]) / 6, a[0], i[0]), c(a[1] + (i[1] - e[1]) / 6, a[1], i[1])], [c(i[0] - (n[0] - a[0]) / 6, a[0], i[0]), c(i[1] - (n[1] - a[1]) / 6, a[1], i[1])]];
}
function ir(r) {
  if (r.shape === "rect") {
    const { x: e, y: n, width: c, height: s } = r.geometry;
    return {
      points: [
        [e, n],
        [e + c, n],
        [e + c, n + s],
        [e, n + s]
      ],
      closed: !0
    };
  }
  if (r.shape === "circle") {
    const { x: e, y: n, radius: c } = r.geometry;
    return {
      points: Array.from({ length: 64 }, (s, l) => [e + c * Math.cos(l * Math.PI / 32), n + c * Math.sin(l * Math.PI / 32)]),
      closed: !0
    };
  }
  if (r.shape !== "path" && r.shape !== "curve") return {
    points: [],
    closed: !1
  };
  const t = y(r), o = m(r), a = (e) => e.map((n) => Number(_(n)));
  if (r.shape === "path" || t.length < 2) return {
    points: t.map(a),
    closed: o
  };
  const i = [a(t[0])];
  for (let e = 0; e < t.length - (o ? 0 : 1); e += 1) {
    const n = a(t[e]), c = a(t[(e + 1) % t.length]), [s, l] = P(t, o, e).map(a);
    for (let g = 1; g <= 12; g += 1) {
      const h = g / 12, f = 1 - h;
      i.push([0, 1].map((d) => f ** 3 * n[d] + 3 * f ** 2 * h * s[d] + 3 * f * h ** 2 * l[d] + h ** 3 * c[d]));
    }
  }
  return o && i.pop(), {
    points: i,
    closed: o
  };
}
function cr(r) {
  if (r.shape === "rect") {
    const { x: e, y: n, width: c, height: s } = r.geometry;
    return `M ${e} ${n} h ${c} v ${s} h ${-c} Z`;
  }
  if (r.shape === "circle") {
    const { x: e, y: n, radius: c } = r.geometry;
    return `M ${e - c} ${n} a ${c} ${c} 0 1 0 ${c * 2} 0 a ${c} ${c} 0 1 0 ${-c * 2} 0 Z`;
  }
  const t = y(r);
  if (t.length < 2) return "";
  const o = m(r);
  if (r.shape === "path") return `M ${t.map(([e, n]) => `${_(e)} ${_(n)}`).join(" L ")}${o ? " Z" : ""}`;
  const a = [`M ${t[0].map(_).join(" ")}`], i = t.length;
  for (let e = 0; e < i - (o ? 0 : 1); e += 1) {
    const [n, c] = P(t, o, e), s = t[(e + 1) % i];
    a.push(`C ${n.map(_).join(" ")}, ${c.map(_).join(" ")}, ${s.map(_).join(" ")}`);
  }
  return a.join(" ") + (o ? " Z" : "");
}
function O(r) {
  if (r.shape === "rect") return { ...r.geometry };
  if (r.shape === "circle") {
    const { x: i, y: e, radius: n } = r.geometry;
    return {
      x: i - n,
      y: e - n,
      width: n * 2,
      height: n * 2
    };
  }
  const t = y(r);
  if (!t.length) {
    const { x: i, y: e } = r.geometry;
    return {
      x: i,
      y: e,
      width: 0,
      height: 0
    };
  }
  const o = t.map((i) => i[0]), a = t.map((i) => i[1]);
  return {
    x: Math.min(...o),
    y: Math.min(...a),
    width: Math.max(...o) - Math.min(...o),
    height: Math.max(...a) - Math.min(...a)
  };
}
function sr(r) {
  if (!r.rotation) return;
  const t = O(r);
  return `rotate(${r.rotation} ${t.x + t.width / 2} ${t.y + t.height / 2})`;
}
function hr(r, t = 1) {
  const o = O(r), a = [o.x + o.width / 2, o.y + o.height / 2];
  if (r.shape === "label") return a;
  if (G(r)) return [a[0], a[1] + 23 * t];
  if ((r.category === "terrain" || r.category === "water") && k(r)) return a;
  if (r.shape === "path" || r.shape === "curve") {
    const n = y(r), c = m(r), s = n.length - (c ? 0 : 1), l = Array.from({ length: s }, (w, p) => Math.hypot(n[(p + 1) % n.length][0] - n[p][0], n[(p + 1) % n.length][1] - n[p][1]));
    let g = l.reduce((w, p) => w + p, 0) / 2, h = 0;
    for (; h < l.length - 1 && g > l[h]; )
      g -= l[h], h += 1;
    const f = n[h], d = n[(h + 1) % n.length], u = l[h] ? g / l[h] : 0.5;
    let E = f[0] + (d[0] - f[0]) * u, A = f[1] + (d[1] - f[1]) * u, S = d[0] - f[0], x = d[1] - f[1];
    if (r.shape === "curve") {
      const [w, p] = P(n, c, h), b = 1 - u;
      E = b ** 3 * f[0] + 3 * b ** 2 * u * w[0] + 3 * b * u ** 2 * p[0] + u ** 3 * d[0], A = b ** 3 * f[1] + 3 * b ** 2 * u * w[1] + 3 * b * u ** 2 * p[1] + u ** 3 * d[1], S = 3 * b ** 2 * (w[0] - f[0]) + 6 * b * u * (p[0] - w[0]) + 3 * u ** 2 * (d[0] - p[0]), x = 3 * b ** 2 * (w[1] - f[1]) + 6 * b * u * (p[1] - w[1]) + 3 * u ** 2 * (d[1] - p[1]);
    }
    const j = Math.hypot(S, x);
    if (!j) return [E, A - 13 * t];
    let M = -x / j, v = S / j;
    return (v > 0 || v === 0 && M < 0) && (M = -M, v = -v), [E + M * 13 * t, A + v * 13 * t];
  }
  const i = (r.rotation || 0) * Math.PI / 180, e = r.shape === "circle" ? o.height / 2 : (Math.abs(Math.sin(i)) * o.width + Math.abs(Math.cos(i)) * o.height) / 2;
  return [a[0], a[1] + e + 13 * t];
}
function D(r) {
  let t = 2166136261;
  for (const o of r) t = Math.imul(t ^ o.charCodeAt(0), 16777619);
  return t >>> 0;
}
function dr(r) {
  const t = r.filter((a) => a.category === "terrain" && a.material === "forest" && k(a) && !K(a)).sort((a, i) => a.id < i.id ? -1 : a.id > i.id ? 1 : 0), o = /* @__PURE__ */ new Map();
  for (let a = 0; a < t.length; a += 1) {
    const i = t[a], e = O(i), n = Math.floor(256 / t.length) + (a < 256 % t.length ? 1 : 0), c = e.width && e.height ? Math.min(n, Math.max(1, Math.ceil(e.width * e.height / 2704))) : 0, s = Math.min(c, Math.max(1, Math.ceil(Math.sqrt(c * e.width / Math.max(1, e.height))))), l = Math.ceil(c / Math.max(1, s));
    let g = D(i.id);
    const h = () => (g = Math.imul(g, 1664525) + 1013904223 >>> 0, g / 4294967296), f = [];
    for (let d = 0; d < c; d += 1) f.push({
      x: e.x + (d % s + 0.5 + (h() - 0.5) * 0.35) * e.width / s,
      y: e.y + (Math.floor(d / s) + 0.5 + (h() - 0.5) * 0.35) * e.height / l,
      size: Math.min(Math.max(e.width / s, e.height / l), Math.min(e.width, e.height)) * (1.25 + h() * 0.35),
      variant: Math.floor(h() * 3)
    });
    o.set(i.id, f);
  }
  return o;
}
var $ = {
  chair: "椅",
  stool: "凳",
  bench: "长凳",
  sofa: "沙发",
  bed: "床",
  table: "桌",
  counter: "台",
  shelf: "架",
  cabinet: "柜",
  chest: "箱",
  barrel: "桶",
  stove: "灶",
  refrigerator: "冰箱",
  sink: "水槽",
  toilet: "厕",
  bathtub: "浴缸",
  terminal: "终端",
  machine: "机械",
  "vending-machine": "售货",
  car: "车",
  column: "柱",
  partition: "屏风",
  fence: "围栏",
  "door-open": "门",
  ladder: "梯",
  statue: "雕像",
  well: "井",
  fountain: "喷泉",
  bridge: "桥",
  tent: "帐篷",
  tree: "树",
  "potted-plant": "盆栽",
  rock: "石",
  light: "灯",
  fire: "火",
  flag: "旗",
  sign: "牌"
}, F = Object.freeze({
  wall: {
    stroke: "var(--scene-edge)",
    fill: "none",
    width: 6
  },
  road: {
    stroke: "var(--scene-road)",
    fill: "var(--scene-road)",
    width: 8
  },
  water: {
    stroke: "var(--scene-water-edge)",
    fill: "var(--scene-water)",
    width: 3
  },
  terrain: {
    stroke: "var(--scene-soft-edge)",
    fill: "var(--scene-ground)",
    width: 0.8
  },
  furniture: {
    stroke: "var(--scene-edge)",
    fill: "var(--scene-object)",
    width: 1
  },
  decoration: {
    stroke: "var(--scene-soft-edge)",
    fill: "var(--scene-object)",
    width: 1
  },
  door: {
    stroke: "var(--map-accent)",
    fill: "var(--scene-object)",
    width: 2
  },
  danger: {
    stroke: "#ff6d7a",
    fill: "rgba(218, 52, 72, .24)",
    width: 2.6,
    dash: "7 4"
  },
  marker: {
    stroke: "#66d9ff",
    fill: "rgba(48, 166, 222, .22)",
    width: 2.2
  },
  actor: {
    stroke: "#f4f8ff",
    fill: "#167fc3",
    width: 2.2
  },
  label: {
    stroke: "none",
    fill: "#e9f4ff",
    width: 0
  },
  grid: {
    stroke: "#54738d",
    fill: "none",
    width: 1,
    dash: "2 5"
  },
  magic: {
    stroke: "#c18cff",
    fill: "rgba(139, 83, 213, .25)",
    width: 2.5
  },
  secret: {
    stroke: "#8198aa",
    fill: "rgba(74, 96, 113, .20)",
    width: 2,
    dash: "3 6"
  },
  light: {
    stroke: "#ffe49a",
    fill: "rgba(255, 210, 91, .22)",
    width: 1.5
  }
}), Y = Object.freeze({
  wall: "墙体",
  road: "道路",
  water: "水域",
  terrain: "地形",
  furniture: "家具",
  decoration: "陈设",
  door: "出入口",
  danger: "危险",
  marker: "标记",
  actor: "人物",
  label: "标注",
  grid: "网格",
  magic: "魔法",
  secret: "未知",
  light: "光源"
}), J = Object.freeze({
  door: "door_open",
  stairs: "stairs",
  elevator: "elevator",
  portal: "captive_portal",
  passage: "conversion_path",
  entrance: "login",
  exit: "exit_to_app",
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "arrow_upward",
  down: "arrow_downward",
  trap: "warning",
  chest: "inventory_2",
  marker: "location_on",
  player: "person_pin_circle",
  actor: "person"
}), Z = Object.freeze({
  door: "D",
  stairs: "S",
  elevator: "E",
  portal: "O",
  passage: "P",
  entrance: "I",
  exit: "O",
  north: "N",
  south: "S",
  east: "E",
  west: "W",
  up: "↑",
  down: "↓",
  trap: "!",
  chest: "X",
  marker: "+",
  player: "P",
  actor: "A"
}), q = Object.freeze({
  "door-open": "door_open",
  stairs: "stairs",
  elevator: "elevator",
  portal: "captive_portal",
  passage: "conversion_path",
  entrance: "login",
  exit: "exit_to_app",
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "arrow_upward",
  down: "arrow_downward",
  trap: "warning",
  chest: "inventory_2",
  marker: "location_on",
  player: "person_pin_circle",
  actor: "person",
  chair: "chair",
  table: "table_restaurant",
  bed: "bed",
  counter: "countertops",
  shelf: "shelves",
  sofa: "weekend",
  bridge: "road",
  tree: "park",
  rock: "landscape",
  building: "apartment",
  fire: "local_fire_department",
  light: "lightbulb",
  water: "water_drop",
  stool: "chair_alt",
  bench: "event_seat",
  cabinet: "kitchen",
  barrel: "propane_tank",
  stove: "oven_gen",
  refrigerator: "kitchen",
  sink: "countertops",
  toilet: "wc",
  bathtub: "bathtub",
  terminal: "computer",
  machine: "precision_manufacturing",
  "vending-machine": "point_of_sale",
  car: "directions_car",
  column: "account_balance",
  partition: "view_column",
  fence: "fence",
  ladder: "format_line_spacing",
  statue: "architecture",
  well: "water_pump",
  fountain: "water",
  tent: "camping",
  "potted-plant": "potted_plant",
  flag: "flag",
  sign: "signpost"
}), W = Object.freeze({
  wall: "architecture",
  road: "route",
  water: "water_drop",
  terrain: "terrain",
  furniture: "chair",
  decoration: "category",
  door: "door_open",
  danger: "warning",
  marker: "location_on",
  actor: "person",
  label: "label",
  grid: "grid_on",
  magic: "auto_awesome",
  secret: "visibility_off",
  light: "lightbulb"
}), C = Object.freeze({
  terrain: 10,
  water: 20,
  grid: 25,
  road: 30,
  wall: 40,
  furniture: 50,
  decoration: 52,
  door: 55,
  danger: 60,
  secret: 62,
  magic: 65,
  light: 70,
  marker: 80,
  actor: 85,
  label: 90
}), lr = Object.freeze({
  neutral: {
    background: "#071019",
    glow: "rgba(59, 157, 219, .13)",
    accent: "#55baff"
  },
  warm: {
    background: "#130e0b",
    glow: "rgba(235, 142, 65, .14)",
    accent: "#f2ad68"
  },
  cold: {
    background: "#07121b",
    glow: "rgba(88, 190, 231, .14)",
    accent: "#73d2f4"
  },
  dark: {
    background: "#05070a",
    glow: "rgba(92, 114, 137, .10)",
    accent: "#8aa6bd"
  },
  mystic: {
    background: "#0d0a17",
    glow: "rgba(156, 94, 231, .16)",
    accent: "#c89aff"
  },
  danger: {
    background: "#16090d",
    glow: "rgba(239, 66, 85, .15)",
    accent: "#ff7180"
  },
  calm: {
    background: "#071411",
    glow: "rgba(61, 189, 158, .13)",
    accent: "#69d8b8"
  }
}), fr = Object.freeze({
  world: "世界",
  region: "区域",
  city: "城市",
  district: "区域",
  building: "建筑",
  floor: "楼层",
  room: "房间",
  outdoor: "户外"
}), gr = Object.freeze({
  door: "门",
  stairs: "楼梯",
  elevator: "电梯",
  path: "小径",
  road: "道路",
  portal: "传送门",
  passage: "通道"
});
function X(r, t) {
  return r < t ? -1 : r > t ? 1 : 0;
}
function ur(r, t) {
  const o = F[r.category], a = k(r), i = a && (r.material || r.category === "water") ? L(r.material || "water", t) : "", e = r.certainty === "inferred" ? "8 6" : r.certainty === "unknown" ? "3 7" : o.dash;
  return {
    ...o,
    fill: a ? i || o.fill : "none",
    opacity: r.certainty === "unknown" ? 0.48 : r.certainty === "inferred" ? 0.72 : 1,
    dash: e,
    icon: r.icon ? q[r.icon] : r.kind ? J[r.kind] : W[r.category],
    fallback: r.kind ? Z[r.kind] : r.icon && Object.hasOwn($, r.icon) ? $[r.icon] : Y[r.category].slice(0, 1),
    z: C[r.category]
  };
}
function pr(r) {
  const t = (o) => {
    if (!k(o)) return 0;
    const a = O(o);
    return a.width * a.height;
  };
  return [...r].sort((o, a) => C[o.category] - C[a.category] || t(a) - t(o) || X(o.id, a.id));
}
export {
  N as _,
  ur as a,
  L as b,
  nr as c,
  K as d,
  O as f,
  sr as g,
  cr as h,
  fr as i,
  k as l,
  ir as m,
  gr as n,
  pr as o,
  hr as p,
  lr as r,
  dr as s,
  Y as t,
  G as u,
  or as v,
  V as x,
  er as y
};
