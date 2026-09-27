/* eslint-disable */
var Q = {
  world: "世界地图",
  region: "当前地区",
  scene: "当前场景"
}, T = {
  visited: "已到访",
  unvisited: "未到访"
}, $ = {
  world: {
    unit: "地区",
    search: "搜索地区",
    all: "全部地区",
    empty: "还没有记录地区",
    emptyHint: "更新地图后，可根据设定与剧情补充地区。",
    notFound: "没有找到符合条件的地区"
  },
  region: {
    unit: "场景",
    search: "搜索本地区场景",
    all: "全部场景",
    empty: "这个地区还没有记录场景",
    emptyHint: "可以查看其他地区，或更新地图补充。",
    notFound: "没有找到符合条件的场景"
  }
}, tt = {
  viewLabel: "地图视图",
  trailLabel: "当前查看位置",
  unknownRegion: "所属地区待确认",
  unknownRegionHint: "地图还没有记录当前位置所属的地区。",
  regionMap: "查看地区地图",
  sceneMap: "查看场景图",
  cancel: "取消",
  filters: "到访筛选",
  searchHint: "试试其他名称或筛选条件。",
  update: "更新地图",
  updating: "正在更新…",
  sceneBrowsing: "正在查看已记录的场景",
  sceneCurrent: "看看你身边的布局",
  sceneEmpty: "这里的布局还没画出来",
  unknownLocation: "还不知道你在哪里",
  sceneUpdateHint: "更新地图后，会结合设定与剧情补齐这里的普通布局。",
  locationUpdateHint: "更新地图后，会根据剧情确认你所在的地方。",
  legend: "世界图展示地区，地区图展示所属场景；场景图展示一个地点的内部布局。地图不按实际比例。"
};
function N(t, r) {
  return `${r} 个${$[t].unit}`;
}
function rt(t, r, n) {
  return `${N(t, r)} · ${n} 个${T.unvisited}`;
}
function at(t, r) {
  return `查看${r === "all" ? "" : T[r]}${$[t].unit}`;
}
var et = Object.freeze([
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
]), nt = Object.freeze([
  "rect",
  "circle",
  "path",
  "curve",
  "icon",
  "label"
]), ot = Object.freeze([
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
]), it = Object.freeze([
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
]), ct = Object.freeze([
  "confirmed",
  "inferred",
  "unknown"
]), R = Object.freeze([
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
]), I = Object.freeze(R.flatMap((t) => [...t.icons])), st = Object.freeze([
  ...I,
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
]), ht = Object.freeze(/* @__PURE__ */ new Set([
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
])), z = Object.freeze({
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
function B(t, r) {
  return `url(#${r}-material-${t || "unknown"})`;
}
function dt(t, r) {
  return `url(#${r}-face-${t || "unknown"})`;
}
function lt(t) {
  return `color-mix(in srgb, ${z[t]}, var(--map-surface) var(--scene-material-mix))`;
}
var D = /* @__PURE__ */ new Set([
  "water",
  "terrain",
  "furniture",
  "decoration",
  "danger",
  "magic",
  "secret",
  "light"
]), F = new Set(I), G = /* @__PURE__ */ new Set([
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
function ut(t) {
  return !!t.icon && G.has(t.icon);
}
var _ = (t) => Number(t.toFixed(3)).toString(), m = (t) => t.geometry.points || [];
function K(t) {
  return t.shape === "icon" || t.shape === "label" || t.category === "actor" || t.category === "door" || t.kind === "stairs" || t.icon === "stairs" || t.icon === "door-open";
}
function M(t) {
  return m(t).length >= 3 && (t.closed ?? D.has(t.category));
}
function k(t) {
  return t.category === "wall" || t.category === "grid" || t.icon === "fence" && ["path", "curve"].includes(t.shape) ? !1 : t.shape === "rect" || t.shape === "circle" ? !0 : (t.shape === "path" || t.shape === "curve") && M(t);
}
function H(t) {
  return ![
    "wall",
    "grid",
    "actor"
  ].includes(t.category) && (t.shape === "rect" || t.shape === "circle") && (t.icon !== void 0 && F.has(t.icon) || [
    "furniture",
    "decoration",
    "door"
  ].includes(t.category));
}
function j(t, r, n) {
  const a = t[n], i = t[(n + 1) % t.length], e = t[n - 1] || (r ? t[t.length - 1] : a), o = t[n + 2] || (r ? t[(n + 2) % t.length] : i), c = (s, l, g) => Math.max(Math.min(l, g), Math.min(Math.max(l, g), s));
  return [[c(a[0] + (i[0] - e[0]) / 6, a[0], i[0]), c(a[1] + (i[1] - e[1]) / 6, a[1], i[1])], [c(i[0] - (o[0] - a[0]) / 6, a[0], i[0]), c(i[1] - (o[1] - a[1]) / 6, a[1], i[1])]];
}
function gt(t) {
  if (t.shape === "rect") {
    const { x: e, y: o, width: c, height: s } = t.geometry;
    return {
      points: [
        [e, o],
        [e + c, o],
        [e + c, o + s],
        [e, o + s]
      ],
      closed: !0
    };
  }
  if (t.shape === "circle") {
    const { x: e, y: o, radius: c } = t.geometry;
    return {
      points: Array.from({ length: 64 }, (s, l) => [e + c * Math.cos(l * Math.PI / 32), o + c * Math.sin(l * Math.PI / 32)]),
      closed: !0
    };
  }
  if (t.shape !== "path" && t.shape !== "curve") return {
    points: [],
    closed: !1
  };
  const r = m(t), n = M(t), a = (e) => e.map((o) => Number(_(o)));
  if (t.shape === "path" || r.length < 2) return {
    points: r.map(a),
    closed: n
  };
  const i = [a(r[0])];
  for (let e = 0; e < r.length - (n ? 0 : 1); e += 1) {
    const o = a(r[e]), c = a(r[(e + 1) % r.length]), [s, l] = j(r, n, e).map(a);
    for (let g = 1; g <= 12; g += 1) {
      const h = g / 12, u = 1 - h;
      i.push([0, 1].map((d) => u ** 3 * o[d] + 3 * u ** 2 * h * s[d] + 3 * u * h ** 2 * l[d] + h ** 3 * c[d]));
    }
  }
  return n && i.pop(), {
    points: i,
    closed: n
  };
}
function ft(t) {
  if (t.shape === "rect") {
    const { x: e, y: o, width: c, height: s } = t.geometry;
    return `M ${e} ${o} h ${c} v ${s} h ${-c} Z`;
  }
  if (t.shape === "circle") {
    const { x: e, y: o, radius: c } = t.geometry;
    return `M ${e - c} ${o} a ${c} ${c} 0 1 0 ${c * 2} 0 a ${c} ${c} 0 1 0 ${-c * 2} 0 Z`;
  }
  const r = m(t);
  if (r.length < 2) return "";
  const n = M(t);
  if (t.shape === "path") return `M ${r.map(([e, o]) => `${_(e)} ${_(o)}`).join(" L ")}${n ? " Z" : ""}`;
  const a = [`M ${r[0].map(_).join(" ")}`], i = r.length;
  for (let e = 0; e < i - (n ? 0 : 1); e += 1) {
    const [o, c] = j(r, n, e), s = r[(e + 1) % i];
    a.push(`C ${o.map(_).join(" ")}, ${c.map(_).join(" ")}, ${s.map(_).join(" ")}`);
  }
  return a.join(" ") + (n ? " Z" : "");
}
function O(t) {
  if (t.shape === "rect") return { ...t.geometry };
  if (t.shape === "circle") {
    const { x: i, y: e, radius: o } = t.geometry;
    return {
      x: i - o,
      y: e - o,
      width: o * 2,
      height: o * 2
    };
  }
  const r = m(t);
  if (!r.length) {
    const { x: i, y: e } = t.geometry;
    return {
      x: i,
      y: e,
      width: 0,
      height: 0
    };
  }
  const n = r.map((i) => i[0]), a = r.map((i) => i[1]);
  return {
    x: Math.min(...n),
    y: Math.min(...a),
    width: Math.max(...n) - Math.min(...n),
    height: Math.max(...a) - Math.min(...a)
  };
}
function pt(t) {
  if (!t.rotation) return;
  const r = O(t);
  return `rotate(${t.rotation} ${r.x + r.width / 2} ${r.y + r.height / 2})`;
}
function bt(t, r = 1) {
  const n = O(t), a = [n.x + n.width / 2, n.y + n.height / 2];
  if (t.shape === "label") return a;
  if (K(t)) return [a[0], a[1] + 23 * r];
  if ((t.category === "terrain" || t.category === "water") && k(t)) return a;
  if (t.shape === "path" || t.shape === "curve") {
    const o = m(t), c = M(t), s = o.length - (c ? 0 : 1), l = Array.from({ length: s }, (w, p) => Math.hypot(o[(p + 1) % o.length][0] - o[p][0], o[(p + 1) % o.length][1] - o[p][1]));
    let g = l.reduce((w, p) => w + p, 0) / 2, h = 0;
    for (; h < l.length - 1 && g > l[h]; )
      g -= l[h], h += 1;
    const u = o[h], d = o[(h + 1) % o.length], f = l[h] ? g / l[h] : 0.5;
    let E = u[0] + (d[0] - u[0]) * f, A = u[1] + (d[1] - u[1]) * f, S = d[0] - u[0], C = d[1] - u[1];
    if (t.shape === "curve") {
      const [w, p] = j(o, c, h), b = 1 - f;
      E = b ** 3 * u[0] + 3 * b ** 2 * f * w[0] + 3 * b * f ** 2 * p[0] + f ** 3 * d[0], A = b ** 3 * u[1] + 3 * b ** 2 * f * w[1] + 3 * b * f ** 2 * p[1] + f ** 3 * d[1], S = 3 * b ** 2 * (w[0] - u[0]) + 6 * b * f * (p[0] - w[0]) + 3 * f ** 2 * (d[0] - p[0]), C = 3 * b ** 2 * (w[1] - u[1]) + 6 * b * f * (p[1] - w[1]) + 3 * f ** 2 * (d[1] - p[1]);
    }
    const x = Math.hypot(S, C);
    if (!x) return [E, A - 13 * r];
    let y = -C / x, v = S / x;
    return (v > 0 || v === 0 && y < 0) && (y = -y, v = -v), [E + y * 13 * r, A + v * 13 * r];
  }
  const i = (t.rotation || 0) * Math.PI / 180, e = t.shape === "circle" ? n.height / 2 : (Math.abs(Math.sin(i)) * n.width + Math.abs(Math.cos(i)) * n.height) / 2;
  return [a[0], a[1] + e + 13 * r];
}
function Y(t) {
  let r = 2166136261;
  for (const n of t) r = Math.imul(r ^ n.charCodeAt(0), 16777619);
  return r >>> 0;
}
function wt(t) {
  const r = t.filter((a) => a.category === "terrain" && a.material === "forest" && k(a) && !H(a)).sort((a, i) => a.id < i.id ? -1 : a.id > i.id ? 1 : 0), n = /* @__PURE__ */ new Map();
  for (let a = 0; a < r.length; a += 1) {
    const i = r[a], e = O(i), o = Math.floor(256 / r.length) + (a < 256 % r.length ? 1 : 0), c = e.width && e.height ? Math.min(o, Math.max(1, Math.ceil(e.width * e.height / 2704))) : 0, s = Math.min(c, Math.max(1, Math.ceil(Math.sqrt(c * e.width / Math.max(1, e.height))))), l = Math.ceil(c / Math.max(1, s));
    let g = Y(i.id);
    const h = () => (g = Math.imul(g, 1664525) + 1013904223 >>> 0, g / 4294967296), u = [];
    for (let d = 0; d < c; d += 1) u.push({
      x: e.x + (d % s + 0.5 + (h() - 0.5) * 0.35) * e.width / s,
      y: e.y + (Math.floor(d / s) + 0.5 + (h() - 0.5) * 0.35) * e.height / l,
      size: Math.min(Math.max(e.width / s, e.height / l), Math.min(e.width, e.height)) * (1.25 + h() * 0.35),
      variant: Math.floor(h() * 3)
    });
    n.set(i.id, u);
  }
  return n;
}
var L = {
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
}, J = Object.freeze({
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
}), W = Object.freeze({
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
}), Z = Object.freeze({
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
}), q = Object.freeze({
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
}), U = Object.freeze({
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
}), V = Object.freeze({
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
}), P = Object.freeze({
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
}), _t = Object.freeze({
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
}), vt = Object.freeze({
  world: "世界",
  region: $.world.unit,
  city: "城市",
  district: "街区",
  building: "建筑",
  floor: "楼层",
  room: "房间",
  outdoor: "户外"
}), mt = Object.freeze({
  door: "门",
  stairs: "楼梯",
  elevator: "电梯",
  path: "小径",
  road: "道路",
  portal: "传送门",
  passage: "通道"
});
function X(t, r) {
  return t < r ? -1 : t > r ? 1 : 0;
}
function yt(t, r) {
  const n = J[t.category], a = k(t), i = a && (t.material || t.category === "water") ? B(t.material || "water", r) : "", e = t.certainty === "inferred" ? "8 6" : t.certainty === "unknown" ? "3 7" : n.dash;
  return {
    ...n,
    fill: a ? i || n.fill : "none",
    opacity: t.certainty === "unknown" ? 0.48 : t.certainty === "inferred" ? 0.72 : 1,
    dash: e,
    icon: t.icon ? U[t.icon] : t.kind ? Z[t.kind] : V[t.category],
    fallback: t.kind ? q[t.kind] : t.icon && Object.hasOwn(L, t.icon) ? L[t.icon] : W[t.category].slice(0, 1),
    z: P[t.category]
  };
}
function Mt(t) {
  const r = (n) => {
    if (!k(n)) return 0;
    const a = O(n);
    return a.width * a.height;
  };
  return [...t].sort((n, a) => P[n.category] - P[a.category] || r(a) - r(n) || X(n.id, a.id));
}
export {
  tt as C,
  N as D,
  at as E,
  rt as O,
  $ as S,
  T,
  z as _,
  yt as a,
  B as b,
  ut as c,
  H as d,
  O as f,
  pt as g,
  ft as h,
  vt as i,
  k as l,
  gt as m,
  mt as n,
  Mt as o,
  bt as p,
  _t as r,
  wt as s,
  W as t,
  K as u,
  lt as v,
  Q as w,
  it as x,
  dt as y
};
