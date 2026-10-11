/* eslint-disable */
import { $ as qt, A as zn, D as We, E as Fe, I as fn, J as is, M as Wt, N as ls, P as Rt, Q as Pn, R as jt, S as I, T as Oe, U as Le, V as P, W as En, X as me, at as Ht, b as Ut, c as ar, ct as nr, d as pn, dt as Yt, ft as $, h as re, i as In, l as cs, lt as m, m as pt, p as sr, q as ds, r as us, rt as W, ut as St, v as J, x as Q, y as _ } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as ct } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as rr, r as Wa, t as or } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as ir } from "./xiaobai-os-constants-CDXgazQ7.js";
import { C as sa, Ct as lr, Ft as Ln, Lt as it, Pt as cr, S as dr, St as hs, T as An, Tt as ur, X as mt, Y as fs, Z as hr, _ as Qa, _t as fr, a as xa, bt as qa, d as mn, et as ps, h as pr, kt as mr, l as vr, n as ms, o as gr, p as br, st as vs, vt as yr, w as gs, wt as Tn, x as wr, xt as vn, y as jn, yt as xr } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as bs } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
import { C as ys, S as Mr, _ as Ae, a as wt, b as ws, c as N, d as ce, f as Ka, g as xs, h as _r, i as pa, l as Ms, m as he, n as Xa, o as Mt, p as ot, r as Bt, s as kr, t as ae, u as On, v as K, x as _e, y as Lt } from "./xiaobai-os-copy-Dk1QktdY.js";
function Ca(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Sr(e, t, s) {
  const a = [...t], n = [];
  for (; a.length && n.length < s; ) n.push(a.splice(Math.floor(Ca(e) * a.length), 1)[0]);
  return n;
}
function Ha() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function we(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function ze(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var Rr = 1e-9;
function Vt(e, t, s) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (s + 0.5) * e.cellSize
  };
}
function At(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function _s(e, t) {
  const s = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!s || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((o) => o.length !== s || /[^.# ]/.test(o))) && ze("map_invalid");
  const n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const o of e.gates) {
    (!o.id || n.has(o.id) || !o.cells.length) && ze("map_invalid"), n.add(o.id);
    const c = !t.has(o.id);
    c && l.add(o.id);
    for (const { column: u, row: d } of o.cells) {
      (!Number.isInteger(u) || !Number.isInteger(d) || u < 0 || u >= s || e.rows[d]?.[u] !== ".") && ze("map_invalid");
      const h = d * s + u;
      r.has(h) && ze("map_invalid"), r.add(h), c && i.add(h);
    }
  }
  for (const o of t) n.has(o) || ze("gate_unknown");
  return {
    map: e,
    columns: s,
    rows: a,
    closedGates: l,
    blocked(o, c) {
      return o < 0 || o >= s || c < 0 || c >= a || e.rows[c][o] !== "." || i.has(c * s + o);
    }
  };
}
function Ma(e, t, s, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), r = Math.max(s - e.y, 0, e.y - s - a);
  return n * n + r * r;
}
function ma(e, t, s) {
  const a = s.x - t.x, n = s.y - t.y, r = a * a + n * n, i = r === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / r));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function ks(e, t, s, a, n) {
  let r = 0, i = 1;
  for (const [l, o, c] of [[
    e.x,
    t.x - e.x,
    s
  ], [
    e.y,
    t.y - e.y,
    a
  ]]) if (o === 0) {
    if (l <= c || l >= c + n) return !1;
  } else {
    const u = (c - l) / o, d = (c + n - l) / o;
    if (r = Math.max(r, Math.min(u, d)), i = Math.min(i, Math.max(u, d)), r >= i) return !1;
  }
  return r < i;
}
function $r(e, t, s, a, n) {
  return ks(e, t, s, a, n) ? 0 : Math.min(Ma(e, s, a, n), Ma(t, s, a, n), ma({
    x: s,
    y: a
  }, e, t), ma({
    x: s + n,
    y: a
  }, e, t), ma({
    x: s,
    y: a + n
  }, e, t), ma({
    x: s + n,
    y: a + n
  }, e, t));
}
function Ee(e, t, s, a = 0) {
  (![
    t.x,
    t.y,
    s.x,
    s.y,
    a
  ].every(Number.isFinite) || a < 0) && ze("input_invalid");
  const { map: n } = e, r = n.cellSize, i = At(n, {
    x: Math.min(t.x, s.x) - a,
    y: Math.min(t.y, s.y) - a
  }), l = At(n, {
    x: Math.max(t.x, s.x) + a,
    y: Math.max(t.y, s.y) + a
  });
  for (let o = i.row; o <= l.row; o++) for (let c = i.column; c <= l.column; c++) {
    if (!e.blocked(c, o)) continue;
    const u = n.origin.x + c * r, d = n.origin.y + o * r;
    if (a === 0 ? ks(t, s, u, d, r) || Ma(t, u, d, r) === 0 && Ma(s, u, d, r) === 0 : $r(t, s, u, d, r) < a * a - Rr) return !1;
  }
  return !0;
}
var bt = (e, t, s) => Ee(e, t, t, s);
function gn(e, t, s, a) {
  [s.x, s.y].every(Number.isFinite) || ze("input_invalid"), bt(e, t, a) || ze("position_blocked");
  const n = Math.hypot(s.x, s.y);
  if (n === 0) return;
  const r = Math.ceil(n / (e.map.cellSize / 4)), i = s.x / r, l = s.y / r;
  for (let o = 0; o < r; o++) {
    const c = {
      x: t.x + i,
      y: t.y + l
    };
    if (Ee(e, t, c, a)) {
      Object.assign(t, c);
      continue;
    }
    const u = Math.abs(i) >= Math.abs(l) ? ["x", "y"] : ["y", "x"];
    for (const d of u) {
      const h = {
        ...t,
        [d]: t[d] + (d === "x" ? i : l)
      };
      Ee(e, t, h, a) && Object.assign(t, h);
    }
  }
}
function Ja(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function yt(e) {
  const { landscape: t } = e, { bounds: s } = t, a = {
    x: s.x - s.width / 2,
    y: s.z - s.depth / 2
  }, n = [
    s,
    ...t.features.map((u) => u.footprint),
    ...t.gates.map((u) => u.footprint)
  ];
  n.some((u) => ![
    u.x,
    u.z,
    u.width,
    u.depth
  ].every(Number.isFinite) || u.width <= 0 || u.depth <= 0 || ![
    u.x - u.width / 2,
    u.z - u.depth / 2,
    u.width,
    u.depth
  ].every(Number.isInteger)) && ze("map_invalid");
  const r = t.features.map((u) => u.id);
  new Set(r).size !== r.length && ze("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && ze("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + s.width || u.z + u.depth / 2 > a.y + s.depth) && ze("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([d, h], p) => !Number.isFinite(d) || !Number.isFinite(h) || p > 0 && d === u.points[p - 1][0] && h === u.points[p - 1][1])) && ze("map_invalid");
  const i = [];
  for (let u = 0; u < s.depth; u++) {
    let d = "";
    for (let h = 0; h < s.width; h++) {
      const p = {
        x: a.x + h + 0.5,
        y: a.y + u + 0.5
      };
      d += t.features.some((g) => g.kind !== "arch" && Ja(p, g.footprint)) ? "#" : ".";
    }
    i.push(d);
  }
  const l = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((u) => {
      const d = u.footprint, h = [];
      for (let p = d.z - d.depth / 2 - a.y; p < d.z + d.depth / 2 - a.y; p++) for (let g = d.x - d.width / 2 - a.x; g < d.x + d.width / 2 - a.x; g++) h.push({
        column: g,
        row: p
      });
      return {
        id: u.id,
        cells: h
      };
    })
  }, o = _s(l, new Set(l.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !bt(o, u, K.playerRadius)) && ze("map_invalid");
  const c = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || c.has(u.id)) && ze("map_invalid"), c.add(u.id);
  return {
    ...e,
    map: l,
    gates: t.gates
  };
}
var R = (e, t, s, a, n, r, i = {}) => ({
  id: e,
  kind: t,
  footprint: {
    x: s,
    z: a,
    width: n,
    depth: r
  },
  ...i
}), ee = (e, t, s, a, n, r, i, l = {}) => ({
  ...R(e, s, a, n, r, i, l),
  label: t
}), Gt = {
  clinic_front: {
    name: "诊棚 · 接诊间",
    household: ["sanniang"],
    use: "三娘接诊、换药与整理药材的前间，病人会来候诊。",
    enclosure: "临街木门经过后掩上；北侧木门通向三娘的起居后间。候诊处与诊床间有屏风。",
    width: 24,
    depth: 22,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "clinic_front"
    }, {
      side: "north",
      to: "sanniang_room",
      arrival: "south"
    }],
    furniture: [
      ee("examination", "铺白布的诊床", "bed", -5.5, -3.5, 3, 5, { tint: "sage" }),
      ee("screen", "遮住诊床的屏风", "screen", -2.5, -3, 1, 6),
      ee("apothecary", "分格药柜", "cabinet", 7, -7, 6, 2, { tint: "sage" }),
      ee("medicine", "药碗与药材工作台", "medicine", 7, -2, 6, 2),
      ee("wash", "洗手盆与清水罐", "basin", -8, -8, 2, 2),
      ee("waiting", "候诊长凳", "bench", -7, 6, 6, 2)
    ]
  },
  sanniang_room: {
    name: "三娘的起居后间",
    household: ["sanniang"],
    use: "三娘在诊棚后的日常住处，与接诊间分开。",
    enclosure: "木门通接诊间，经过后掩上；窗帘遮住临巷的窗，门外的说话声仍可能传进来。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "clinic_front",
      arrival: "north"
    }],
    furniture: [
      ee("bed", "床与叠好的薄被", "bed", -4.5, -4, 3, 4, { tint: "rose" }),
      ee("wardrobe", "衣柜与换洗衣物", "wardrobe", 5, -7, 6, 2, { tint: "rose" }),
      ee("tea", "放着茶具和书的矮桌", "table", 4, 1, 4, 2),
      ee("chair", "桌边的木椅", "chair", 4, 4, 2, 2),
      ee("wash", "梳洗盆与毛巾", "basin", -7, 4, 2, 2)
    ]
  },
  inn: {
    name: "小客店 · 前厅",
    household: ["innkeeper"],
    use: "檐下供过路人投宿的小客店，共用前厅。",
    enclosure: "临街木门与客房门相隔一个前厅，店家在柜台边照看生意。",
    width: 24,
    depth: 22,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "inn"
    }, {
      side: "north",
      to: "guest_room",
      arrival: "south"
    }],
    furniture: [
      ee("counter", "店家的柜台与登记簿", "ledger", 7, -5, 6, 2),
      ee("shelf", "碗盏与备用被褥柜", "cabinet", 7, -9, 6, 2),
      ee("table", "共用饭桌", "table", -5, 0, 4, 4),
      ee("seats", "饭桌旁的长凳", "bench", -5, 4, 4, 2),
      ee("stove", "温着水的小炉", "stove", -8, -7, 2, 2)
    ]
  },
  guest_room: {
    name: "小客店 · 旅人客房",
    household: ["player"],
    use: "旅人在檐下投宿的一间客房，暂住，不是自有房产。",
    enclosure: "独立木门通前厅，经过后掩上；有窗帘，木隔墙不完全隔音。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "inn",
      arrival: "north"
    }],
    furniture: [
      ee("bed", "客床与干净被褥", "bed", -4.5, -3, 3, 4, { tint: "sage" }),
      ee("chest", "放行囊的矮柜", "cabinet", 5, -6, 4, 2, { height: 1.2 }),
      ee("table", "带烛台的小桌", "table", 5, 0, 4, 2),
      ee("chair", "木椅", "chair", 5, 3, 2, 2),
      ee("wash", "水盆与毛巾", "basin", -7, 4, 2, 2)
    ]
  },
  laobai_home: {
    name: "老白的小屋",
    household: ["laobai"],
    use: "外门附近，老白离开父母家后独住的小屋；门楼是工作点。",
    enclosure: "独立木门临街，经过后掩上；窄窗挂着旧布帘，能听见外门的动静。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "laobai_home"
    }],
    furniture: [
      ee("bed", "靠墙的单人床", "bed", -4.5, -4, 3, 4, { tint: "sage" }),
      ee("kit", "衣物柜与守门用具", "wardrobe", 6, -7, 4, 2),
      ee("table", "饭碗与水壶所在的桌子", "table", 5, -1, 4, 2),
      ee("chair", "旧木椅", "chair", 5, 2, 2, 2),
      ee("stove", "墙角的小炉", "stove", -7, 5, 2, 2)
    ]
  },
  kouzi_home: {
    name: "扣子的管边小窝",
    household: ["kouzi"],
    use: "扣子在管线旁自搭的住处，修缮工具和睡铺挤在同一间。",
    enclosure: "木板门经过后掩上，板壁接缝透进管架的光；热管的震声穿过墙板。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "kouzi_home"
    }],
    furniture: [
      ee("bed", "挤在工具旁的睡铺", "bed", -4.5, -3, 3, 4, { tint: "amber" }),
      ee("bench", "钳子、扳手与零件工作台", "workbench", 5, -4, 6, 2),
      ee("rack", "铜管短料与工具架", "toolrack", 5, -7, 6, 2),
      ee("chair", "修理凳", "chair", 5, -1, 2, 2),
      ee("wash", "搪洗盆", "basin", -7, 5, 2, 2)
    ]
  },
  anian_home: {
    name: "阿念家 · 起居间",
    household: ["anian", "anian_parents"],
    use: "阿念与父母同住的家，共用起居间供一家吃饭、做活。父母睡处在屏风后。",
    enclosure: "临街木门经过后掩上；北侧木门通阿念的睡处。父母在家做活，起居间不是空屋。",
    width: 26,
    depth: 24,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "anian_home"
    }, {
      side: "north",
      to: "anian_room",
      arrival: "south"
    }],
    furniture: [
      ee("table", "一家人吃饭的桌子", "table", -5, 3, 4, 4),
      ee("bench", "桌边长凳", "bench", -5, 7, 4, 2),
      ee("work", "父亲修铜管的工作台", "workbench", 8, -6, 6, 2),
      ee("sewing", "母亲的衣料柜", "wardrobe", 8, 0, 6, 2, { tint: "rose" }),
      ee("parents_bed", "父母的床铺", "bed", -7, -6, 4, 4),
      ee("screen", "遮住父母睡处的屏风", "screen", -7, -1.5, 6, 1)
    ]
  },
  anian_room: {
    name: "阿念的睡处",
    household: ["anian"],
    use: "阿念在父母家中的小房间。",
    enclosure: "木门与起居间相隔，经过后掩上；有窗帘，隔壁父母做活与说话的声音可闻。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "anian_home",
      arrival: "north"
    }],
    furniture: [
      ee("bed", "小床与洗净的被单", "bed", -4.5, -3, 3, 4, { tint: "rose" }),
      ee("clothes", "衣物柜", "wardrobe", 5, -6, 6, 2, { tint: "rose" }),
      ee("desk", "临窗小桌", "table", 5, 0, 4, 2),
      ee("chair", "木椅", "chair", 5, 3, 2, 2),
      ee("wash", "洗脸盆", "basin", -7, 5, 2, 2)
    ]
  }
}, Va = [
  {
    to: "clinic_front",
    building: "clinic",
    position: {
      x: -19,
      y: 12
    }
  },
  {
    to: "inn",
    building: "arrival-home",
    position: {
      x: -27,
      y: 32.5
    }
  },
  {
    to: "laobai_home",
    building: "roadside-workshop",
    position: {
      x: -17,
      y: -32.5
    }
  },
  {
    to: "kouzi_home",
    building: "eastern-workshop",
    position: {
      x: 28,
      y: 34.5
    }
  },
  {
    to: "anian_home",
    building: "eastern-home",
    position: {
      x: 15,
      y: 23.5
    }
  }
];
function _a(e) {
  return Object.hasOwn(Gt, e) ? Gt[e] : void 0;
}
function ra(e) {
  return _a(e) ? "camp" : e;
}
var Cr = yt({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(Va.map((e) => [e.to, e.position])),
    start: {
      x: -22,
      y: 16
    },
    road: {
      x: 0,
      y: -53
    },
    clinic: {
      x: -13,
      y: 12
    },
    guard: {
      x: 7,
      y: -39
    },
    kouzi: {
      x: 32,
      y: 8
    },
    anian: {
      x: -18,
      y: 15
    },
    rest: {
      x: -3,
      y: 15
    },
    cargo: {
      x: 16,
      y: 7
    },
    postern: {
      x: -42,
      y: 7
    },
    receiving: {
      x: -16,
      y: 16
    },
    gatehouse: {
      x: 11,
      y: -37
    },
    clinic_back: {
      x: -29,
      y: 8
    },
    registry: {
      x: -10,
      y: 15
    }
  },
  exits: [
    ...Va.map((e) => ({
      id: e.to,
      anchor: e.to,
      to: e.to,
      arrival: "south",
      doorway: !0
    })),
    {
      id: "road",
      anchor: "road",
      to: "crossroads",
      arrival: "camp",
      condition: { all: ["briefed"] }
    },
    {
      id: "postern",
      anchor: "postern",
      to: "cells",
      arrival: "postern",
      condition: { all: ["postern_opened", "briefed"] }
    }
  ],
  objects: [{
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }, {
    id: "cargo",
    anchor: "cargo",
    kind: "inspect",
    passage: "cargo",
    condition: { all: ["warden_defeated"] }
  }],
  landscape: {
    vista: "camp",
    surface: "street",
    bounds: {
      x: 0,
      z: -8,
      width: 96,
      depth: 100
    },
    suspended: [
      {
        kind: "pipe",
        from: [
          -35.7,
          5.3,
          36
        ],
        to: [
          -35.7,
          5.3,
          -46
        ]
      },
      {
        kind: "pipe",
        from: [
          -36,
          4.8,
          4
        ],
        to: [
          -19,
          4.8,
          4
        ]
      },
      {
        kind: "pipe",
        from: [
          -27,
          5.2,
          28
        ],
        to: [
          -27,
          5.2,
          4
        ]
      },
      {
        kind: "pipe",
        from: [
          -8,
          5.4,
          -12
        ],
        to: [
          12,
          5.4,
          -12
        ]
      },
      {
        kind: "pipe",
        from: [
          12,
          5.4,
          -12
        ],
        to: [
          12,
          5.4,
          -48
        ]
      },
      {
        kind: "pipe",
        from: [
          12,
          5.4,
          -12
        ],
        to: [
          34,
          5.4,
          -12
        ]
      },
      {
        kind: "pipe",
        from: [
          34,
          5.4,
          -12
        ],
        to: [
          34,
          5.4,
          20
        ]
      },
      {
        kind: "washing",
        from: [
          -27,
          3.5,
          25
        ],
        to: [
          -12,
          3.8,
          20
        ]
      },
      {
        kind: "washing",
        from: [
          15,
          3.7,
          20
        ],
        to: [
          28,
          4.2,
          28
        ]
      }
    ],
    gates: [{
      id: "postern",
      footprint: {
        x: -36,
        z: 7,
        width: 2,
        depth: 4
      },
      condition: { all: ["postern_opened"] }
    }],
    roads: [
      {
        points: [
          [0, 36],
          [0, 16],
          [-4, 10],
          [-4, 1],
          [2, -12],
          [0, -24],
          [0, -53]
        ],
        width: 4
      },
      {
        points: [
          [-33, 18],
          [-23, 15],
          [-14, 13],
          [0, 11],
          [16, 8],
          [28, 8]
        ],
        width: 3
      },
      {
        points: [
          [-31, 32],
          [-30, 19],
          [-29, 8]
        ],
        width: 3
      },
      {
        points: [
          [-27, 18],
          [-22, 18],
          [-17, 23.2],
          [-12, 23.2]
        ],
        width: 2
      },
      {
        points: [
          [0, -36],
          [17, -37],
          [27, -43]
        ],
        width: 4
      }
    ],
    features: [
      R("clinic", "clinic", -19, 4, 14, 10),
      R("storehouse", "storehouse", 12, -9, 12, 12),
      R("hearth", "stove", 0, 6, 4, 4),
      R("rest-bench", "bench", -5, 15, 2, 4),
      R("wagon", "wagon", 22, 3, 4, 6),
      R("supply-crates", "supplies", 20, -5, 4, 4),
      R("drying-shed", "workshop", -29, 0, 4, 10, { height: 3.5 }),
      R("herbs-small", "medicine", -23, 10, 6, 2),
      R("menders-home", "dwelling", -12, 20, 4, 4, {
        height: 3.3,
        tint: "rose"
      }),
      R("eastern-home", "dwelling", 15, 20, 4, 4, { height: 4.1 }),
      R("wall-home", "dwelling", -31, -12, 4, 4, { height: 5 }),
      R("charcoal-home", "dwelling", 34, -16, 4, 4, { height: 4.7 }),
      R("pipe-home", "dwelling", -16, -19, 4, 4, { height: 3.8 }),
      R("canal-west", "water", -26, -28, 44, 4),
      R("canal-east", "water", 26, -28, 44, 4),
      R("bridge-west", "wall", -5, -28, 2, 6, { height: 0.8 }),
      R("bridge-east", "wall", 5, -28, 2, 6, { height: 0.8 }),
      R("gate-west", "wall", -26, -49, 44, 4, { height: 6 }),
      R("gate-east", "wall", 26, -49, 44, 4, { height: 6 }),
      R("west-watchtower", "tower", -8, -49, 6, 8, { height: 12 }),
      R("east-watchtower", "tower", 8, -49, 6, 8, { height: 12 }),
      R("departure-arch", "arch", 0, -49, 10, 4, { height: 8 }),
      R("west-boundary", "wall", -37, -26, 2, 62, {
        height: 7,
        wallUse: "homes"
      }),
      R("postern-bottom", "wall", -37, 25, 2, 32, {
        height: 7,
        wallUse: "homes"
      }),
      R("south-boundary", "wall", 0, 40, 96, 4, { height: 1 }),
      R("east-boundary", "wall", 46, -8, 4, 96, { height: 1.2 }),
      R("postern-end", "wall", -47, -8, 2, 100, { height: 2.4 }),
      R("north-boundary", "wall", 0, -57, 96, 2, { height: 5 }),
      R("roadside-workshop", "workshop", -17, -38, 16, 8, { height: 4 }),
      R("lookout-ruin", "ruin", 24, -38, 6, 6, { height: 3 }),
      R("arrival-home", "dwelling", -27, 28, 6, 6, { height: 4.3 }),
      R("eastern-workshop", "workshop", 28, 30, 6, 6, { height: 3.7 }),
      R("wall-row", "dwelling", -24, -21, 18, 4, { height: 4.5 }),
      R("roadside-homes", "dwelling", -8, -12, 4, 10, { height: 4.2 }),
      R("clinic-back-shed", "workshop", -20, -5, 16, 2, { height: 2.6 })
    ].map((e) => Va.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), zr = yt({
  id: "crossroads",
  safe: !1,
  anchors: {
    camp: {
      x: 0,
      y: 43
    },
    gate: {
      x: 0,
      y: -43
    },
    waterway: {
      x: 34,
      y: 7
    },
    roots: {
      x: -36,
      y: -13
    },
    warning: {
      x: 5,
      y: 19
    },
    encounter: {
      x: 0,
      y: 9
    },
    patrol: {
      x: -4,
      y: -8
    },
    lookout: {
      x: 8,
      y: -18
    }
  },
  exits: [
    {
      id: "camp",
      anchor: "camp",
      to: "camp",
      arrival: "road"
    },
    {
      id: "gate",
      anchor: "gate",
      to: "gate",
      arrival: "crossroads",
      condition: { all: ["crossroads_cleared"] }
    },
    {
      id: "waterway",
      anchor: "waterway",
      to: "waterway",
      arrival: "crossroads",
      condition: { all: ["crossroads_cleared"] }
    },
    {
      id: "roots",
      anchor: "roots",
      to: "roots",
      arrival: "crossroads",
      condition: { all: ["warden_defeated"] }
    }
  ],
  objects: [{
    id: "warning",
    anchor: "warning",
    kind: "inspect",
    passage: "warning"
  }],
  landscape: {
    vista: "ramparts",
    surface: "grass",
    bounds: {
      x: 0,
      z: 0,
      width: 96,
      depth: 96
    },
    gates: [{
      id: "roots",
      footprint: {
        x: -29,
        z: -13,
        width: 2,
        depth: 6
      },
      condition: { all: ["warden_defeated"] }
    }],
    roads: [
      {
        points: [
          [0, 44],
          [0, 28],
          [-4, 14],
          [2, 0],
          [0, -20],
          [0, -44]
        ],
        width: 8
      },
      {
        points: [
          [-4, 14],
          [14, 14],
          [24, 7],
          [35, 7]
        ],
        width: 4
      },
      {
        points: [
          [0, -13],
          [-18, -13],
          [-37, -13]
        ],
        width: 5
      }
    ],
    features: [
      R("wall-west", "wall", -30, -32, 2, 32, { height: 3 }),
      R("wall-west-low", "wall", -30, 19, 2, 58, { height: 2 }),
      R("wall-east", "wall", 24, -25, 4, 44, { height: 7 }),
      R("rampart-tower", "tower", 24, -16, 8, 8, { height: 15 }),
      R("gate-tower-left", "tower", -8, -41, 6, 8, { height: 11 }),
      R("gate-tower-right", "tower", 8, -41, 6, 8, { height: 11 }),
      R("north-arch", "arch", 0, -41, 10, 4, { height: 8 }),
      R("west-gate-wall", "wall", -26, -43, 40, 4, { height: 5 }),
      R("east-gate-wall", "wall", 36, -43, 20, 4, { height: 5 }),
      R("road-ruin", "ruin", -12, 1, 6, 6, { height: 3.5 }),
      R("fallen-column", "ruin", 12, -2, 4, 4, { height: 1.2 }),
      R("road-tree", "tree", -17, 27, 4, 4, {
        height: 9,
        tint: "amber"
      }),
      R("roots-tree", "tree", -39, -25, 6, 6, {
        height: 13,
        tint: "sage"
      }),
      R("southern-tree", "tree", 17, 37, 4, 4, {
        height: 9,
        tint: "sage"
      }),
      R("arrival-watch-west", "tower", -8, 44, 6, 8, { height: 10 }),
      R("arrival-watch-east", "tower", 8, 44, 6, 8, { height: 10 }),
      R("arrival-arch", "arch", 0, 44, 10, 4, { height: 8 }),
      R("broken-convoy", "wagon", -12, 19, 4, 6, { damaged: !0 }),
      R("convoy-supplies", "supplies", -16, 16, 4, 4),
      R("stranded-cargo", "cargo", -24, 28, 8, 12),
      R("stranded-fuel", "fuel", 18, 25, 6, 8),
      R("old-border", "thicket", -18, -6, 14, 4),
      R("waterway-bank", "water", 37, 21, 22, 16),
      R("north-boundary", "wall", 0, -47, 96, 2, { height: 5 }),
      R("south-boundary-west", "wall", -26, 47, 44, 2, { height: 5 }),
      R("south-boundary-east", "wall", 26, 47, 44, 2, { height: 5 }),
      R("west-boundary", "wall", -47, 0, 2, 96, { height: 2 }),
      R("east-boundary", "wall", 47, 0, 2, 96, { height: 2 })
    ]
  }
}), Pr = yt({
  id: "gate",
  safe: !1,
  anchors: {
    crossroads: {
      x: 0,
      y: 32
    },
    beacon: {
      x: 0,
      y: -33
    },
    encounter: {
      x: 0,
      y: 0
    },
    guard: {
      x: -5,
      y: -9
    },
    archer: {
      x: 8,
      y: -17
    },
    parley: {
      x: 0,
      y: 19
    },
    parley_side: {
      x: -7,
      y: 19
    },
    guard_side: {
      x: -8,
      y: 9
    },
    archer_side: {
      x: 8,
      y: 9
    }
  },
  exits: [{
    id: "crossroads",
    anchor: "crossroads",
    to: "crossroads",
    arrival: "gate"
  }, {
    id: "beacon",
    anchor: "beacon",
    to: "beacon",
    arrival: "gate",
    condition: { all: ["patrol_cleared"] }
  }],
  objects: [],
  landscape: {
    vista: "ramparts",
    surface: "paving",
    bounds: {
      x: 0,
      z: 0,
      width: 72,
      depth: 80
    },
    gates: [],
    roads: [{
      points: [
        [0, 34],
        [0, 13],
        [0, -9],
        [0, -34]
      ],
      width: 10
    }, {
      points: [
        [-26, 12],
        [0, 12],
        [26, 12]
      ],
      width: 4
    }],
    features: [
      R("outer-west", "wall", -35, 0, 2, 80, { height: 8 }),
      R("outer-east", "wall", 35, 0, 2, 80, { height: 8 }),
      R("north-wall", "wall", 0, -39, 72, 2, { height: 9 }),
      R("south-wall", "wall", 0, 39, 72, 2, { height: 5 }),
      R("gate-tower-west", "tower", -10, -27, 8, 12, { height: 16 }),
      R("gate-tower-east", "tower", 10, -27, 8, 12, { height: 16 }),
      R("main-arch", "arch", 0, -27, 12, 6, { height: 12 }),
      R("gate-flank-west", "wall", -25, -27, 22, 6, { height: 9 }),
      R("gate-flank-east", "wall", 25, -27, 22, 6, { height: 9 }),
      R("west-pillars", "ruin", -13, -3, 6, 4, { height: 4.8 }),
      R("east-pillars", "ruin", 13, -3, 6, 4, { height: 4.8 }),
      R("western-barracks", "storehouse", -25, 2, 12, 12),
      R("eastern-barracks", "storehouse", 25, 2, 12, 12),
      R("awaiting-inspection", "cargo", -15, 23, 4, 12),
      R("cleared-consignments", "cargo", 15, 23, 4, 12),
      R("inspection-cart", "wagon", 25, 19, 4, 6),
      R("inspection-crates", "supplies", 28, 25, 4, 4),
      R("barracks-tree", "tree", -27, 26, 4, 4, {
        height: 9,
        tint: "amber"
      })
    ]
  }
}), Er = yt({
  id: "beacon",
  safe: !1,
  anchors: {
    gate: {
      x: 0,
      y: 35
    },
    hall: {
      x: 0,
      y: -35
    },
    beacon: {
      x: 0,
      y: 0
    },
    encounter: {
      x: 0,
      y: 9
    },
    guard: {
      x: -9,
      y: -13
    },
    archer: {
      x: 12,
      y: -13
    },
    parley: {
      x: 0,
      y: 28
    },
    parley_side: {
      x: -8,
      y: 28
    },
    guard_side: {
      x: -14,
      y: 2
    },
    archer_side: {
      x: 14,
      y: 2
    }
  },
  exits: [{
    id: "gate",
    anchor: "gate",
    to: "gate",
    arrival: "beacon"
  }, {
    id: "hall",
    anchor: "hall",
    to: "hall",
    arrival: "beacon",
    condition: { all: ["alarm_silenced"] }
  }],
  objects: [],
  landscape: {
    vista: "ramparts",
    surface: "paving",
    bounds: {
      x: 0,
      z: 0,
      width: 72,
      depth: 84
    },
    gates: [],
    roads: [{
      points: [
        [0, 36],
        [0, 10],
        [-9, 0],
        [-9, -18],
        [0, -27],
        [0, -36]
      ],
      width: 6
    }, {
      points: [
        [0, 10],
        [10, 0],
        [10, -18],
        [0, -27]
      ],
      width: 6
    }],
    features: [
      R("west-parapet", "wall", -35, 0, 2, 84, { height: 3 }),
      R("east-parapet", "wall", 35, 0, 2, 84, { height: 3 }),
      R("north-wall", "wall", 0, -41, 72, 2, { height: 9 }),
      R("south-wall", "wall", 0, 41, 72, 2, { height: 5 }),
      R("signal-brazier", "beacon", 0, -8, 6, 6),
      R("west-signal-column", "column", -20, -10, 4, 4, { height: 11 }),
      R("east-signal-column", "column", 20, -10, 4, 4, { height: 11 }),
      R("west-approach-column", "column", -20, 12, 4, 4, { height: 8 }),
      R("east-approach-column", "column", 20, 12, 4, 4, { height: 8 }),
      R("hall-tower-west", "tower", -10, -30, 8, 8, { height: 16 }),
      R("hall-tower-east", "tower", 10, -30, 8, 8, { height: 16 }),
      R("hall-arch", "arch", 0, -30, 12, 4, { height: 12 }),
      R("signal-fuel", "fuel", -27, 19, 8, 22),
      R("signal-reserve", "cargo", 27, 19, 8, 22),
      R("west-copper-store", "supplies", -26, -23, 6, 6),
      R("east-copper-store", "supplies", 26, -23, 6, 6)
    ]
  }
}), Ir = yt({
  id: "waterway",
  safe: !1,
  anchors: {
    crossroads: {
      x: -21,
      y: -35
    },
    cells: {
      x: 20,
      y: 35
    },
    sluice: {
      x: -9,
      y: 8
    },
    encounter: {
      x: 4,
      y: 4
    },
    guard: {
      x: 10,
      y: -5
    }
  },
  exits: [{
    id: "crossroads",
    anchor: "crossroads",
    to: "crossroads",
    arrival: "waterway"
  }, {
    id: "cells",
    anchor: "cells",
    to: "cells",
    arrival: "waterway",
    condition: { all: ["waterway_cleared"] }
  }],
  objects: [{
    id: "sluice",
    anchor: "sluice",
    kind: "switch",
    fact: "sluice_opened"
  }],
  landscape: {
    vista: "interior",
    surface: "wet",
    bounds: {
      x: 0,
      z: 0,
      width: 64,
      depth: 88
    },
    suspended: [
      {
        kind: "pipe",
        from: [
          -28.5,
          4.3,
          -41
        ],
        to: [
          -28.5,
          4.3,
          16
        ]
      },
      {
        kind: "pipe",
        from: [
          -28.5,
          4.3,
          -18
        ],
        to: [
          29,
          4.3,
          -18
        ]
      },
      {
        kind: "pipe",
        from: [
          29,
          4.3,
          -18
        ],
        to: [
          29,
          4.3,
          41
        ]
      }
    ],
    gates: [{
      id: "sluice",
      footprint: {
        x: 0,
        z: 16,
        width: 12,
        depth: 4
      },
      condition: { all: ["sluice_opened"] }
    }],
    roads: [{
      points: [
        [-21, -35],
        [-10, -32],
        [-10, -12],
        [3, 0],
        [0, 16],
        [14, 28],
        [20, 35]
      ],
      width: 5
    }],
    features: [
      R("west-wall", "wall", -31, 0, 2, 88, { height: 7 }),
      R("east-wall", "wall", 31, 0, 2, 88, { height: 7 }),
      R("north-wall", "wall", 0, -43, 64, 2, { height: 8 }),
      R("south-wall", "wall", 0, 43, 64, 2, { height: 8 }),
      R("upper-channel-west", "water", -24, -3, 12, 58),
      R("upper-channel-east", "water", 23, -12, 14, 48),
      R("lower-channel-west", "water", -13, 32, 30, 20),
      R("lower-channel-east", "water", 28, 32, 4, 20),
      R("sluice-west-abutment", "wall", -18, 16, 24, 4, { height: 5 }),
      R("sluice-east-abutment", "wall", 18, 16, 24, 4, { height: 5 }),
      R("upper-pier-west", "column", -15, -18, 4, 4, { height: 9 }),
      R("upper-pier-east", "column", 11, -18, 4, 4, { height: 9 }),
      R("lower-pier-west", "column", -13, 0, 4, 4, { height: 9 }),
      R("lower-pier-east", "column", 13, 0, 4, 4, { height: 9 }),
      R("vault-north", "arch", -2, -18, 26, 2, { height: 10 }),
      R("vault-middle", "arch", 0, 0, 26, 2, { height: 10 }),
      R("entry-marker", "ruin", -24, -39, 6, 2, { height: 5 }),
      R("maintenance-supplies", "supplies", 8, 36, 4, 4)
    ]
  }
}), Lr = yt({
  id: "cells",
  safe: !1,
  anchors: {
    waterway: {
      x: -21,
      y: 21
    },
    hall: {
      x: 0,
      y: -3
    },
    postern: {
      x: 23,
      y: 33
    },
    latch: {
      x: 20,
      y: 16
    },
    release: {
      x: -3,
      y: 5
    },
    kouzi: {
      x: -15,
      y: -12
    },
    anian: {
      x: 15,
      y: -12
    },
    kouzi_talk: {
      x: -15,
      y: -8
    },
    anian_talk: {
      x: 15,
      y: -8
    }
  },
  exits: [
    {
      id: "waterway",
      anchor: "waterway",
      to: "waterway",
      arrival: "cells"
    },
    {
      id: "hall",
      anchor: "hall",
      to: "hall",
      arrival: "cells"
    },
    {
      id: "postern",
      anchor: "postern",
      to: "camp",
      arrival: "postern",
      condition: { all: ["postern_opened"] }
    }
  ],
  objects: [{
    id: "release",
    anchor: "release",
    kind: "switch",
    fact: "captives_released"
  }, {
    id: "postern_latch",
    anchor: "latch",
    kind: "switch",
    fact: "postern_opened"
  }],
  landscape: {
    vista: "interior",
    surface: "paving",
    bounds: {
      x: 0,
      z: 0,
      width: 64,
      depth: 76
    },
    gates: [
      {
        id: "cell-west",
        footprint: {
          x: -15,
          z: -10,
          width: 10,
          depth: 2
        },
        condition: { all: ["captives_released"] }
      },
      {
        id: "cell-east",
        footprint: {
          x: 15,
          z: -10,
          width: 10,
          depth: 2
        },
        condition: { all: ["captives_released"] }
      },
      {
        id: "postern",
        footprint: {
          x: 24,
          z: 24,
          width: 12,
          depth: 2
        },
        condition: { all: ["postern_opened"] }
      }
    ],
    roads: [{
      points: [
        [-21, 21],
        [-21, 12],
        [0, 5],
        [20, 12],
        [24, 24],
        [23, 34]
      ],
      width: 4
    }, {
      points: [
        [-16, -23],
        [-15, -10],
        [0, 5],
        [15, -10],
        [16, -23]
      ],
      width: 4
    }],
    features: [
      R("west-wall", "wall", -31, 0, 2, 76, { height: 6 }),
      R("east-wall", "wall", 31, 0, 2, 76, { height: 6 }),
      R("north-wall", "wall", 0, -37, 64, 2, { height: 8 }),
      R("south-wall", "wall", 0, 37, 64, 2, { height: 6 }),
      R("cells-divider", "wall", 0, -24, 2, 28, { height: 6 }),
      R("cells-front-center", "wall", 0, -10, 20, 2, { height: 6 }),
      R("cells-front-west", "wall", -26, -10, 12, 2, { height: 6 }),
      R("cells-front-east", "wall", 26, -10, 12, 2, { height: 6 }),
      R("postern-divider", "wall", -7, 24, 50, 2, { height: 5 }),
      R("waterway-passage", "arch", -21, 19, 10, 2, { height: 7 }),
      R("postern-corridor", "wall", 17, 31, 2, 12, { height: 5 }),
      R("west-bunk", "bunk", -26, -24, 4, 8),
      R("east-bunk", "bunk", 26, -24, 4, 8),
      R("west-cell-bench", "bench", -8, -30, 2, 4),
      R("east-cell-bench", "bench", 8, -30, 2, 4),
      R("guard-desk", "ledger", 3, 12, 4, 4),
      R("hall-pier-west", "column", -7, -4, 2, 2, { height: 7 }),
      R("hall-pier-east", "column", 7, -4, 2, 2, { height: 7 })
    ]
  }
}), Ar = yt({
  id: "hall",
  safe: !1,
  anchors: {
    beacon: {
      x: -22,
      y: 35
    },
    cells: {
      x: 22,
      y: 35
    },
    encounter: {
      x: 0,
      y: 5
    },
    warden: {
      x: 0,
      y: -17
    },
    orders: {
      x: 0,
      y: -36
    },
    reinforcementLeft: {
      x: -24,
      y: -12
    },
    reinforcementRight: {
      x: 24,
      y: -12
    }
  },
  exits: [{
    id: "beacon",
    anchor: "beacon",
    to: "beacon",
    arrival: "hall"
  }, {
    id: "cells",
    anchor: "cells",
    to: "cells",
    arrival: "hall"
  }],
  objects: [{
    id: "orders",
    anchor: "orders",
    kind: "inspect",
    passage: "orders",
    condition: { all: ["warden_defeated"] }
  }],
  landscape: {
    vista: "interior",
    surface: "marble",
    bounds: {
      x: 0,
      z: 0,
      width: 80,
      depth: 92
    },
    gates: [],
    roads: [{
      points: [
        [-22, 36],
        [-22, 27],
        [0, 19],
        [22, 27],
        [22, 36]
      ],
      width: 5
    }, {
      points: [
        [0, 27],
        [0, 4],
        [0, -17],
        [0, -35]
      ],
      width: 10
    }],
    features: [
      R("west-wall", "wall", -39, 0, 2, 92, { height: 11 }),
      R("east-wall", "wall", 39, 0, 2, 92, { height: 11 }),
      R("north-wall", "wall", 0, -45, 80, 2, { height: 13 }),
      R("south-wall", "wall", 0, 45, 80, 2, { height: 8 }),
      R("western-front-column", "column", -15, 17, 4, 4, { height: 12 }),
      R("eastern-front-column", "column", 15, 17, 4, 4, { height: 12 }),
      R("western-middle-column", "column", -15, -3, 4, 4, { height: 12 }),
      R("eastern-middle-column", "column", 15, -3, 4, 4, { height: 12 }),
      R("western-rear-column", "column", -15, -25, 4, 4, { height: 12 }),
      R("eastern-rear-column", "column", 15, -25, 4, 4, { height: 12 }),
      R("entry-vault", "arch", 0, 17, 30, 2, { height: 14 }),
      R("rear-vault", "arch", 0, -25, 30, 2, { height: 14 }),
      R("west-gallery", "planter", -32, 4, 6, 28),
      R("east-gallery", "planter", 32, 4, 6, 28),
      R("west-gallery-bench", "bench", -28, 28, 2, 6),
      R("east-gallery-bench", "bench", 28, 28, 2, 6),
      R("crown-console", "ledger", 0, -41, 6, 4),
      R("northern-west-pillar", "column", -29, -35, 4, 4, { height: 14 }),
      R("northern-east-pillar", "column", 29, -35, 4, 4, { height: 14 })
    ]
  }
}), Tr = yt({
  id: "roots",
  safe: !1,
  anchors: {
    crossroads: {
      x: 0,
      y: 34
    },
    encounter: {
      x: 0,
      y: 5
    },
    tree: {
      x: 0,
      y: -12
    },
    rootLeft: {
      x: -12,
      y: -13
    },
    rootRight: {
      x: 12,
      y: -13
    }
  },
  exits: [{
    id: "crossroads",
    anchor: "crossroads",
    to: "crossroads",
    arrival: "roots"
  }],
  objects: [],
  landscape: {
    vista: "garden",
    surface: "grass",
    bounds: {
      x: 0,
      z: 0,
      width: 80,
      depth: 84
    },
    gates: [],
    suspended: [{
      kind: "pipe",
      from: [
        -38,
        3.2,
        -29
      ],
      to: [
        -3,
        3.2,
        -29
      ]
    }, {
      kind: "pipe",
      from: [
        3,
        2.8,
        -29
      ],
      to: [
        38,
        2.8,
        -29
      ]
    }],
    roads: [{
      points: [
        [0, 35],
        [0, 23],
        [-9, 11],
        [-12, -7],
        [0, -19]
      ],
      width: 5
    }, {
      points: [
        [0, 23],
        [11, 12],
        [13, -5],
        [0, -19]
      ],
      width: 4
    }],
    features: [
      R("west-enclosure", "wall", -39, 0, 2, 84, { height: 3 }),
      R("east-enclosure", "wall", 39, 0, 2, 84, { height: 3 }),
      R("north-enclosure", "wall", 0, -41, 80, 2, { height: 4 }),
      R("south-enclosure", "wall", 0, 41, 80, 2, { height: 3 }),
      R("dead-heartwood", "root", 0, -29, 12, 10, { height: 17 }),
      R("western-root", "root", -22, -15, 8, 4, { height: 3.8 }),
      R("eastern-root", "root", 22, -11, 8, 4, { height: 3.2 }),
      R("west-reflecting-pool", "water", -26, 9, 12, 16),
      R("east-reflecting-pool", "water", 26, 9, 12, 16),
      R("west-old-colonnade", "ruin", -15, 7, 4, 4, { height: 5 }),
      R("east-old-colonnade", "ruin", 15, 9, 4, 4, { height: 4 }),
      R("western-growth", "thicket", -29, -27, 14, 12),
      R("eastern-growth", "thicket", 29, -27, 14, 12),
      R("west-entry-pillar", "column", -7, 30, 4, 4, { height: 7 }),
      R("east-entry-pillar", "column", 7, 30, 4, 4, { height: 7 }),
      R("garden-arch", "arch", 0, 30, 14, 2, { height: 9 }),
      R("west-entry-tree", "tree", -21, 29, 6, 6, {
        height: 12,
        tint: "rose"
      }),
      R("east-entry-tree", "tree", 23, 29, 6, 6, {
        height: 12,
        tint: "sage"
      }),
      R("west-north-tree", "tree", -18, -33, 6, 6, {
        height: 14,
        tint: "sage"
      }),
      R("east-north-tree", "tree", 18, -33, 6, 6, {
        height: 14,
        tint: "rose"
      })
    ]
  }
}), jr = Object.fromEntries(Object.entries(Gt).map(([e, t]) => {
  const { width: s, depth: a } = t, n = s / 2, r = a / 2, i = [R("west-wall", "wall", -n + 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  }), R("east-wall", "wall", n - 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const o of ["north", "south"]) {
    const c = (o === "north" ? -1 : 1) * (r - 0.5);
    if (t.doors.some((u) => u.side === o)) {
      i.push(R(`${o}-door`, "door", 0, c, 4, 1));
      for (const u of [-1, 1]) i.push(R(`${o}-${u}`, "wall", u * (n + 2) / 2, c, n - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else i.push(R(`${o}-wall`, "wall", 0, c, s, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const l = e === "guest_room" ? t.furniture.find((o) => o.kind === "bed").footprint : null;
  return [e, yt({
    id: e,
    safe: !0,
    anchors: {
      settle: {
        x: 0,
        y: 1
      },
      ...l ? { rest: {
        x: l.x + l.width / 2 + 1,
        y: l.z
      } } : {},
      ...Object.fromEntries(t.doors.map((o) => [o.side, {
        x: 0,
        y: (o.side === "north" ? -1 : 1) * (r - 2)
      }]))
    },
    exits: t.doors.map((o) => ({
      id: o.side,
      anchor: o.side,
      to: o.to,
      arrival: o.arrival,
      doorway: !0
    })),
    objects: l ? [{
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }] : [],
    landscape: {
      bounds: {
        x: 0,
        z: 0,
        width: s,
        depth: a
      },
      vista: "room",
      surface: "boards",
      roads: [],
      gates: [],
      features: [...i, ...t.furniture]
    }
  })];
})), Me = {
  camp: Cr,
  crossroads: zr,
  gate: Pr,
  beacon: Er,
  waterway: Ir,
  cells: Lr,
  hall: Ar,
  roots: Tr,
  ...jr
};
function Zn(e) {
  return !e || Me[e.location.scene].safe && e.phase === "exploration";
}
var rt = {
  traveler: {
    price: 0,
    achievement: null,
    fabric: "#326d9f",
    metal: "#d5b77b",
    glow: "#a7def3",
    silhouette: "cloak",
    head: "none"
  },
  guardian: {
    price: 0,
    achievement: "boss-0",
    fabric: "#278c7f",
    metal: "#d9bb75",
    glow: "#99e2c5",
    silhouette: "armor",
    head: "helm"
  },
  moonweaver: {
    price: 0,
    achievement: "boss-1",
    fabric: "#7863b4",
    metal: "#ddd9ed",
    glow: "#bdceff",
    silhouette: "robe",
    head: "hat"
  },
  sovereign: {
    price: 0,
    achievement: "boss-2",
    fabric: "#973f59",
    metal: "#e3bd64",
    glow: "#ffe4a4",
    silhouette: "armor",
    head: "crown"
  },
  ranger: {
    price: 180,
    achievement: null,
    fabric: "#387759",
    metal: "#d2b989",
    glow: "#c8ebad",
    silhouette: "hood",
    head: "hood"
  },
  paladin: {
    price: 320,
    achievement: null,
    fabric: "#e9e6d4",
    metal: "#a1b9c5",
    glow: "#e8dba3",
    silhouette: "armor",
    head: "helm"
  },
  witch: {
    price: 240,
    achievement: null,
    fabric: "#383b69",
    metal: "#cda56d",
    glow: "#b9a6f3",
    silhouette: "robe",
    head: "hat"
  },
  assassin: {
    price: 280,
    achievement: null,
    fabric: "#343947",
    metal: "#d88675",
    glow: "#ce9cac",
    silhouette: "hood",
    head: "hood"
  },
  machinist: {
    price: 260,
    achievement: null,
    fabric: "#b67745",
    metal: "#3f636c",
    glow: "#b0eff1",
    silhouette: "coat",
    head: "goggles"
  },
  beastcaller: {
    price: 300,
    achievement: null,
    fabric: "#70906b",
    metal: "#ece0b7",
    glow: "#c5e895",
    silhouette: "cloak",
    head: "horns"
  },
  frostbound: {
    price: 420,
    achievement: null,
    fabric: "#8dbbc7",
    metal: "#e4eef0",
    glow: "#c3fbff",
    silhouette: "coat",
    head: "crown"
  },
  stargazer: {
    price: 480,
    achievement: null,
    fabric: "#504881",
    metal: "#d4bc8c",
    glow: "#ddcbff",
    silhouette: "robe",
    head: "crown"
  }
};
function Ya(e, t) {
  const s = rt[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || s.achievement !== null && e.awards.some((a) => a.key === s.achievement);
}
var ge = (e, t, s = 0) => ({
  family: e,
  chapter: s,
  ...t ? { requires: [t] } : {}
}), oe = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), ca = {
  "storm-step": ge("storm"),
  conductor: ge("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: ge("storm"),
  cinder: ge("fire"),
  wildfire: ge("fire", ["cinder", "inferno"]),
  "blood-price": ge("risk"),
  frost: ge("frost"),
  shatter: ge("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: ge("skill"),
  hunter: {
    ...ge("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: ge("blade"),
  orbit: ge("storm"),
  thorns: ge("guard"),
  aegis: ge("guard"),
  siphon: ge("life"),
  focus: ge("skill"),
  renewal: ge("life"),
  execution: ge("blade"),
  "last-stand": ge("guard", void 0, 1),
  quicksilver: ge("skill"),
  magnet: ge("skill"),
  wardstone: ge("guard"),
  pilgrim: ge("life"),
  gambit: ge("risk", void 0, 1),
  riposte: oe("blade"),
  "shield-break": oe("blade"),
  "cleave-wave": oe("blade", 1),
  duelist: oe("blade"),
  "blood-dance": oe("blade"),
  valor: oe("blade", 1),
  ricochet: oe("bow"),
  "split-arrow": oe("bow"),
  pinning: oe("bow"),
  "distance-draw": oe("bow"),
  "hunter-mark": oe("bow", 1),
  trapper: oe("bow"),
  nova: oe("staff"),
  inferno: {
    ...oe("staff"),
    requires: [["cinder"]]
  },
  fracture: {
    ...oe("staff"),
    requires: [[
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  overload: {
    ...oe("staff", 1),
    requires: [["cinder"], [
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  orbitals: oe("staff"),
  convergence: oe("staff"),
  backstab: oe("daggers"),
  shadowstep: oe("daggers"),
  hemorrhage: oe("daggers"),
  "execution-chain": oe("daggers", 1),
  smoke: oe("daggers"),
  venom: oe("daggers"),
  "pack-bond": oe("grimoire"),
  martyr: oe("grimoire"),
  covenant: oe("grimoire"),
  frenzy: oe("grimoire"),
  "soul-harvest": oe("grimoire", 1),
  command: oe("grimoire"),
  shrapnel: oe("cannon"),
  minefield: oe("cannon"),
  overclock: oe("cannon"),
  bunker: oe("cannon"),
  salvage: oe("cannon"),
  railgun: oe("cannon", 1)
}, z = (e, t) => e.relics.find((s) => s.id === t)?.rank ?? 0;
function Or(e) {
  return xs.filter((t) => !ca[t].weapons || ca[t].weapons.includes(e));
}
function Ss(e, t, s = null) {
  const a = ca[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((r) => r !== s && z(e, r) > 0)));
}
var _t = Math.PI * 2, q = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), be = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), bn = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Ke = (e, t, s) => ({
  x: e.x + Math.cos(t) * s,
  y: e.y + Math.sin(t) * s
});
function Je(e, t, s, a, n, r) {
  if (r) {
    gn(r.space, t, {
      x: Math.cos(s) * a,
      y: Math.sin(s) * a
    }, n);
    return;
  }
  t.x += Math.cos(s) * a, t.y += Math.sin(s) * a;
  for (const i of e.obstacles) {
    const l = q(t, i), o = n + i.radius;
    if (l < o) {
      const c = l < 1e-3 ? s : be(i, t);
      t.x = i.x + Math.cos(c) * o, t.y = i.y + Math.sin(c) * o;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function Zr(e, t, s, a) {
  const n = e.x - t.x, r = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(s) + r * Math.sin(s)));
  return Math.hypot(n - Math.cos(s) * i, r - Math.sin(s) * i);
}
var Ur = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], Ga = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function da(e, t, s, a) {
  if (!bt(e, t, a) || !bt(e, s, a)) return null;
  if (Ee(e, t, s, a)) return [{ ...s }];
  const { map: n, columns: r, rows: i } = e, l = At(n, t), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), d = [];
  function h(g) {
    return Vt(n, g % r, Math.floor(g / r));
  }
  function p(g, v, y, M) {
    if (g < 0 || g >= r || v < 0 || v >= i) return;
    const x = v * r + g;
    u.has(x) || (o.get(x) ?? 1 / 0) <= y || (o.set(x, y), c.set(x, M), d.push({
      id: x,
      score: y + Ga(h(x), s)
    }));
  }
  for (let g = -1; g <= 1; g++) for (let v = -1; v <= 1; v++) {
    const y = l.column + v, M = l.row + g, x = Vt(n, y, M);
    Ee(e, t, x, a) && p(y, M, Ga(t, x), -1);
  }
  for (; d.length; ) {
    d.sort((y, M) => M.score - y.score || M.id - y.id);
    const { id: g } = d.pop();
    if (u.has(g)) continue;
    u.add(g);
    const v = h(g);
    if (Ee(e, v, s, a)) {
      const y = [{ ...s }];
      let M = g;
      for (; M !== -1; )
        y.push(h(M)), M = c.get(M);
      y.reverse();
      const x = [];
      let S = t;
      for (let b = 0; b < y.length; ) {
        let w = b;
        for (; w + 1 < y.length && Ee(e, S, y[w + 1], a); ) w++;
        S = y[w], x.push(S), b = w + 1;
      }
      return x;
    }
    for (const [y, M] of Ur) {
      const x = g % r + y, S = Math.floor(g / r) + M, b = Vt(n, x, S);
      Ee(e, v, b, a) && p(x, S, o.get(g) + Ga(v, b), g);
    }
  }
  return null;
}
var Un = (e) => !_e(e) || e === "warden" || e === "thornheart", se = (e, t, s, a = 0) => !e || Ee(e.space, t, s, a);
function Nr(e, t, s) {
  return e.summonPoints.filter((a) => bt(e.space, a, s) && da(e.space, e.entry, a, s)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Rs(e, t, s) {
  return !e || Ee(e.space, t, s, 0.3) ? s : {
    x: t.x,
    y: t.y
  };
}
function $s(e, t, s, a) {
  if (!e) return Math.atan2(s.y - t.y, s.x - t.x);
  let n = s;
  if (!bt(e.space, n, a)) {
    const i = [], l = a + e.space.map.cellSize, o = At(e.space.map, {
      x: s.x - l,
      y: s.y - l
    }), c = At(e.space.map, {
      x: s.x + l,
      y: s.y + l
    });
    for (let d = Math.max(0, o.row); d <= Math.min(e.space.rows - 1, c.row); d++) for (let h = Math.max(0, o.column); h <= Math.min(e.space.columns - 1, c.column); h++) {
      const p = Vt(e.space.map, h, d);
      Math.hypot(p.x - s.x, p.y - s.y) <= a + e.space.map.cellSize && bt(e.space, p, a) && Ee(e.space, p, s) && i.push(p);
    }
    i.sort((d, h) => Math.hypot(d.x - s.x, d.y - s.y) - Math.hypot(h.x - s.x, h.y - s.y));
    const u = i.find((d) => da(e.space, t, d, a));
    if (!u) return null;
    n = u;
  }
  const r = da(e.space, t, n, a);
  return r?.length ? Math.atan2(r[0].y - t.y, r[0].x - t.x) : null;
}
function ye(e, t, s, a = 1, n = 0) {
  e.effects.push({
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: s,
    size: a,
    angle: n,
    life: s === "slash" ? 9 : 15
  });
}
function Pe(e, t, s, a) {
  if (!_e(t) && e.enemies.filter((i) => i.hp > 0).length >= K.maxEnemies) return null;
  if (a) {
    const i = Nr(a, s, he[t].radius);
    if (!i) return null;
    s = i;
  }
  const n = he[t].hp * (_e(t) ? 1 : 1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)), r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: n,
    maxHp: n,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Ca(e) * 20),
    windup: 0,
    target: { ...s },
    pattern: 0,
    phase: 1,
    chill: 0,
    burn: 0,
    marked: 0,
    stun: 0,
    bleed: 0,
    poison: 0,
    exposed: 0,
    motion: 0,
    motionAngle: 0,
    stagger: 0,
    memory: []
  };
  return e.enemies.push(r), r;
}
function vt(e, t, s, a, n, r = {}) {
  const i = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    angle: s,
    damage: a,
    friendly: n,
    source: "attack",
    pierce: 0,
    hits: [],
    speed: 0.22,
    life: 130,
    radius: 0.16,
    splash: 0,
    bounce: 0,
    ...r
  };
  return e.shots.push(i), i;
}
function pe(e, t, s, a, n, r, i, l = !1, o = {}) {
  const c = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: s,
    radius: a,
    wait: n,
    life: r,
    damage: i,
    friendly: l,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: l ? "passive" : "attack",
    hits: [],
    ...o
  };
  return e.hazards.push(c), c;
}
function nt(e, t, s, a, n) {
  return pe(e, t, "slam", s, a, 8, n);
}
function Ce(e, t, s, a, n, r, i) {
  return pe(e, t, "beam", 0, r, 9, i, !1, {
    angle: s,
    length: a,
    width: n
  });
}
function ft(e, t, s, a, n, r, i = 0.22) {
  for (let l = 0; l < a; l++) vt(e, t, s + (l / Math.max(1, a - 1) - 0.5) * n, r, !1, { speed: i });
}
function Nn(e, t, s, a, n, r = 0.16) {
  for (let i = 0; i < s; i++) vt(e, t, a + i * _t / s, n, !1, { speed: r });
}
function en(e, t, s, a, n = 0) {
  const r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: t === "turret" ? 65 : t === "familiar" ? ot.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(r), r;
}
var va = (e) => e === "attack" || e === "skill";
function Cs(e, t) {
  if (e.player.hp <= 0) return;
  const s = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += s, s > 0 && ye(e, e.player, "heal");
}
function gt(e, t, s) {
  if (_e(t.kind)) {
    if (t.stagger += s, t.stagger < 100) return;
    t.stagger = 0, s = 24;
  }
  t.stun = Math.max(t.stun, s), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), ye(e, t, "guard", 1.4);
}
function Ze(e, t, s, a, n, r = e.player, i) {
  if (t.hp <= 0 || !se(i, r, t)) return;
  const l = t.burn > 0 || va(n) && z(a, "cinder") > 0, o = t.chill > 0 || va(n) && z(a, "frost") > 0, c = (n === "skill" || n === "companion" && a.weapon === "cannon") && o && z(a, "shatter") > 0, u = va(n) && l && o && z(a, "overload") > 0;
  let d = s * (z(a, "blood-price") ? Ae.bloodDamage + (z(a, "blood-price") - 1) * 0.12 : 1);
  if (z(a, "execution") && t.hp / t.maxHp < Ae.executeThreshold && (d *= Ae.executeDamage + (z(a, "execution") - 1) * 0.1), t.exposed > 0 && (d *= 1.25), (t.kind === "guard" || i && t.kind === "warden") && n === "attack" && Math.cos(be(t, r) - t.angle) > 0.4 && t.exposed <= 0 && (d *= z(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !_e(t.kind) && e.enemies.some((h) => h.kind === "priest" && h.hp > 0 && q(t, h) < 3.5 && se(i, t, h)) && (d *= 0.7), n === "attack" && z(a, "backstab") && Math.cos(be(t, e.player) - t.angle) < -0.3 && (d *= 1.6 + z(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && z(a, "duelist") && gt(e, t, 9 * z(a, "duelist")), c) {
    d += 15 * z(a, "shatter"), t.chill = 0, ye(e, t, "burst", 2.2);
    for (const h of e.enemies) h.id !== t.id && q(t, h) < 2.2 && Ze(e, h, 9 * z(a, "shatter"), a, "passive", t, i);
  }
  if (va(n) && (z(a, "cinder") && (t.burn = Math.max(t.burn, 80 + z(a, "cinder") * 25)), z(a, "frost") && (t.chill = Math.max(t.chill, 45 + z(a, "frost") * 20)), (z(a, "blood-dance") || z(a, "hemorrhage")) && (t.bleed = 100 + 25 * (z(a, "blood-dance") + z(a, "hemorrhage"))), z(a, "venom") && (t.poison = 100 + z(a, "venom") * 35), u && (d += 20 * z(a, "overload"), ye(e, t, "lightning")), n === "skill" && z(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + z(a, "hunter-mark") * 40)), z(a, "inferno") && l && n === "skill" && pe(e, t, "fire", 1.5 + z(a, "inferno") * 0.3, 0, 70, 4 * z(a, "inferno"), !0)), u && (t.burn = 0), (u || c) && (t.chill = 0), t.hp = Math.max(0, t.hp - d), t.marked = 5, n === "lightning" && z(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - z(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, ye(e, t, "burst", _e(t.kind) ? 3 : 0.8), z(a, "wildfire") && l && pe(e, t, "fire", 1.8 + z(a, "wildfire") * 0.2, 0, 90, 3 * z(a, "wildfire"), !0), z(a, "fracture") && o) for (let h = 0; h < 4 + z(a, "fracture"); h++) vt(e, t, h * _t / (4 + z(a, "fracture")), 9, !0, { source: "passive" });
    if (z(a, "siphon") && (e.kills % Ae.siphonEvery === 0 || _e(t.kind)) && Cs(e, (_e(t.kind) ? Ae.siphonBossHeal : Ae.siphonHeal) + z(a, "siphon") - 1), z(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * z(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), z(a, "soul-harvest") && (e.player.resource = Math.min(ot.maxPower, e.player.resource + 9 * z(a, "soul-harvest"))), n === "companion" && z(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * z(a, "salvage"))), z(a, "magnet"))
      for (const h of e.enemies) h.hp > 0 && q(t, h) < 3 + z(a, "magnet") && se(i, t, h) && Je(e, h, be(h, t), 0.7, he[h.kind].radius, i);
  }
}
function tn(e, t, s, a, n, r = e.player) {
  const i = [t];
  if (se(n, r, t)) {
    z(s, "conductor") && i.push(...e.enemies.filter((l) => l.id !== t.id && l.hp > 0 && q(l, t) < 4.5 && se(n, t, l)).sort((l, o) => q(l, t) - q(o, t)).slice(0, z(s, "conductor") + 1));
    for (const l of i)
      ye(e, l, "lightning"), Ze(e, l, a, s, "lightning", n ? l === t ? r : t : e.player, n);
  }
}
function zs(e, t, s) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), ye(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const r = z(t, "riposte"), i = z(t, "thorns");
  if (r || i)
    for (const l of e.enemies) q(l, a) < 3.2 + r * 0.3 && se(s, a, l) && (Ze(e, l, (n ? 20 : 8) * r + 9 * i, t, "passive", a, s), gt(e, l, n ? 20 : 7));
}
function za(e, t, s, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    zs(e, s, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let r = t * Lt[s.weapon].guard * (z(s, "blood-price") ? Ae.bloodHurt : 1) * (z(s, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, r);
  if (n.ward -= i, r -= i, n.hp <= r && z(s, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + z(s, "last-stand") * 8, n.invulnerable = 60, ye(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - r), e.damageTaken += r, n.invulnerable = 18, n.lastHit = e.tick, ye(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), z(s, "thorns"))
    for (const l of e.enemies) q(l, n) < 3 && Ze(e, l, 10 * z(s, "thorns"), s, "passive", n, a);
}
function oa(e, t, s = 45) {
  e.ward += Math.max(0, Math.min(t, s - e.ward));
}
function Dn(e, t, s, a = !1, n) {
  const r = Lt[t.weapon], i = e.player, l = be(i, s), o = (a ? 0.6 : 1) * (z(t, "gambit") ? 1 + z(t, "gambit") * 0.12 : 1);
  if (i.facing = l, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const h = r.range + z(t, "piercing") * 0.25;
    ye(e, i, "slash", h, l);
    for (const p of e.enemies)
      q(i, p) > h + he[p.kind].radius || Math.cos(be(i, p) - l) < -0.1 || !se(n, i, p) || (Ze(e, p, r.damage * o, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && gt(e, p, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), z(t, "cleave-wave") && i.combo % 3 === 2 && vt(e, i, l, 14 * z(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let c = r.damage * o;
  z(t, "distance-draw") && (c *= 1 + Math.min(1, q(i, s) / 8) * 0.15 * z(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(ot.maxPower, i.resource + 12));
  const u = z(t, "piercing") * Ae.extraPierce + z(t, "railgun") * 2, d = vt(e, i, l, c, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + z(t, "shrapnel") * 0.3 : 0,
    bounce: z(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && z(t, "split-arrow") && i.combo % 3 === 2) for (const h of [-0.18, 0.18]) vt(e, i, l + h, c * (0.35 + z(t, "split-arrow") * 0.1), !0, {
    speed: d.speed,
    pierce: u
  });
}
function Dr(e, t, s, a) {
  const n = e.player, r = Lt[t.weapon], i = z(t, "focus");
  switch (n.skill = Math.round(r.skillCooldown * (i ? Ae.focusSkill - (i - 1) * 0.06 : 1)), z(t, "aegis") && (n.shield = 18 + z(t, "aegis") * 6, n.guard = 8, oa(n, z(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + z(t, "aegis") * 6, n.guard = 9;
      const l = 1 + n.resource / 100;
      n.resource = 0, ye(e, n, "slash", 3.6, n.facing);
      for (const o of e.enemies)
        o.hp <= 0 || q(n, o) > 3.6 + he[o.kind].radius || !se(a, n, o) || (z(t, "shield-break") && (o.exposed = Math.max(o.exposed, 70 + 30 * z(t, "shield-break"))), Ze(e, o, r.skill * l, t, "skill", n, a), gt(e, o, 40), _e(o.kind) || Je(e, o, be(n, o), 1.5, he[o.kind].radius, a));
      z(t, "valor") && oa(n, 12 * z(t, "valor") * l);
      break;
    }
    case "bow":
      for (let l = -2; l <= 2; l++) vt(e, n, n.facing + l * 0.15, r.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      Je(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const l = s ?? n, o = 1 + n.resource / 125;
      if (n.resource = 0, z(t, "convergence"))
        for (const c of e.enemies) q(c, l) < 4 + z(t, "convergence") && se(a, l, c) && Je(e, c, be(c, l), 1.2, he[c.kind].radius, a);
      for (let c = 0; c < 3; c++) {
        const u = Ke(l, c * _t / 3, 0.7);
        pe(e, se(a, l, u) ? u : l, "slam", 2.3, 10 + c * 10, 1, r.skill * o, !0, { source: "skill" });
      }
      if (z(t, "nova")) {
        pe(e, n, "frost", 3 + z(t, "nova") * 0.5, 0, 32, 6 * z(t, "nova"), !0, { source: "skill" });
        for (const c of e.enemies) q(n, c) < 3.5 && se(a, n, c) && (c.chill = 120, gt(e, c, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), s) {
        const l = Ke(s, s.angle + Math.PI, he[s.kind].radius + 0.55);
        Je(e, n, be(n, l), Math.min(5, q(n, l)), K.playerRadius, a), n.facing = be(n, s), se(a, n, s) && (!a || q(n, s) <= r.range + he[s.kind].radius) && (s.exposed = Math.max(s.exposed, 60), Ze(e, s, r.skill, t, "skill", n, a), gt(e, s, 20)), ye(e, n, "slash", 2, n.facing);
      }
      z(t, "shadowstep") && en(e, "shade", n, 95 + z(t, "shadowstep") * 30, z(t, "shadowstep"));
      break;
    case "grimoire": {
      const l = n.resource;
      n.resource = 0, n.resonance = ot.resonanceTicks + l, ye(e, n, "resonance", 2);
      for (const o of e.companions) o.kind === "familiar" && o.hp > 0 && o.life > 0 && (o.hp = Math.max(o.hp, ot.familiarHp), o.cooldown = 0);
      s && (s.exposed = Math.max(s.exposed, 100), Ze(e, s, r.skill + l * 0.3, t, "skill", n, a)), z(t, "command") && pe(e, s ?? n, "storm", 2.4 + z(t, "command") * 0.3, 10, 65, 7 * z(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const l = 1 + (z(t, "overclock") >= 2 ? 1 : 0), o = e.companions.filter((c) => c.kind === "turret");
      o.length >= l && (o[0].life = 0), en(e, "turret", Rs(a, n, Ke(n, n.facing, 0.9)), 240 + z(t, "overclock") * 45, z(t, "overclock")), z(t, "bunker") && oa(n, 15 * z(t, "bunker"));
      break;
    }
  }
}
function Fr(e, t, s, a) {
  const n = e.player, r = z(s, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - r * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? bn(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, z(s, "storm-step") && pe(e, n, "storm", 1.7 + z(s, "storm-step") * 0.15, 0, 70, 6 + z(s, "storm-step") * 3, !0), z(s, "trapper") && pe(e, n, "frost", 1.8, 12, 110, 5 * z(s, "trapper"), !0), z(s, "minefield") && pe(e, n, "mine", 2 + z(s, "minefield") * 0.2, 12, 180, 25 * z(s, "minefield"), !0), z(s, "smoke")) {
    for (const i of e.enemies) q(i, n) < 3 + z(s, "smoke") * 0.4 && se(a, n, i) && (gt(e, i, 30 + z(s, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    ye(e, n, "guard", 3);
  }
}
function Br(e, t, s, a) {
  const n = e.player;
  for (const c of [
    "attack",
    "dash",
    "skill",
    "invulnerable",
    "swing",
    "shield",
    "guard"
  ]) n[c] = Math.max(0, n[c] - 1);
  const r = e.enemies.filter((c) => c.hp > 0 && se(a, n, c)).sort((c, u) => q(n, c) - q(n, u))[0];
  t.dash && !n.dash && !n.dashTime && Fr(e, t, s, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    Je(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && z(s, "momentum") && r && q(n, r) < 3 && tn(e, r, s, 10 + z(s, "momentum") * 5, a);
  else if (t.move) {
    n.facing = bn(t.move);
    const c = n.swing > 0;
    let u = K.speed * (c ? Lt[s.weapon].moveFire : 1);
    z(s, "quicksilver") && n.dash > K.dashCooldown / 2 && (u *= 1 + z(s, "quicksilver") * 0.1), e.hazards.some((d) => !d.friendly && d.kind === "frost" && !d.wait && q(d, n) < d.radius && se(a, d, n)) && (u *= 0.65), Je(e, n, n.facing, u, K.playerRadius, a);
  }
  n.travel += q(i, n), z(s, "pilgrim") && n.travel >= 28 && (n.travel -= 28, oa(n, z(s, "pilgrim") * 6, 35)), z(s, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && oa(n, 2, z(s, "wardstone") * 10);
  const l = r && se(a, n, r) ? r : void 0;
  t.skill && !n.skill && (l && (n.facing = be(n, l)), Dr(e, s, l, a));
  const o = Lt[s.weapon].range + (s.weapon === "blade" || s.weapon === "daggers" ? z(s, "piercing") * 0.25 : 0);
  if (l && !n.attack && q(n, l) <= o + he[l.kind].radius && (Dn(e, s, l, !1, a), n.combo++, z(s, "echo") && n.combo % Math.max(2, Ae.echoEvery + 1 - z(s, "echo")) === 0 && Dn(e, s, l, !0, a), n.attack = Math.round(Lt[s.weapon].period * (z(s, "focus") ? Ae.focusAttack : 1))), z(s, "orbit") && e.tick % Math.round(Ae.orbitTicks / (1 + z(s, "orbit") * 0.25)) === 0 && r && q(n, r) < 4.5 && tn(e, r, s, 12 + z(s, "orbit") * 3, a), z(s, "orbitals") && e.tick % 35 === 0) {
    for (const c of e.enemies) q(n, c) < 2.5 + z(s, "orbitals") * 0.35 && se(a, n, c) && (Ze(e, c, 12 * z(s, "orbitals"), s, "passive", n, a), c.chill = Math.max(c.chill, 30));
    ye(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function Wr(e, t, s) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + z(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && en(e, "familiar", Rs(s, e.player, Ke(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || se(s, a, i))).sort((i, l) => q(i, a) - q(l, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = be(a, n), a.kind !== "turret") {
      const i = q(a, e.player) > 8;
      if (i || q(a, n) > 1.3 || !se(s, a, n)) {
        const l = $s(s, a, i ? e.player : n, 0.25);
        l !== null && Je(e, a, l, i ? 0.19 : 0.14 + z(t, "frenzy") * 0.015, 0.25, s);
      }
    }
    const r = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && q(a, n) < r && se(s, a, n)) if (a.kind === "turret")
      vt(e, a, a.angle, Lt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      Ze(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? ot.empoweredDamage : ot.damage) * (1 + z(t, "covenant") * 0.15), t, "companion", a, s), ye(e, a, "slash", 1.2, a.angle);
      const l = a.kind === "shade" ? 32 : i ? ot.empoweredAttackTicks : ot.attackTicks;
      a.cooldown = Math.round(l / (1 + z(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && z(t, "martyr") && (Cs(e, z(t, "martyr")), pe(e, a, "slam", 2.2, 0, 1, 15 * z(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
var xt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), ka = [
  {
    x: -4,
    y: 0
  },
  {
    x: 4,
    y: -3
  },
  {
    x: 0,
    y: 4
  }
];
function ba(e, t, s) {
  if (e.wave++, s) {
    for (const r of s.waves[e.wave - 1]) Pe(e, r.kind, r.position);
    return;
  }
  if (e.boss) {
    Pe(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = _r[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let r = 0; r < n; r++) {
    const i = _t * r / n + (e.wave - 1) * 0.8;
    let l = a[(r + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && r < 2 && (l = a[0]), e.encounter === "pursuit" && r === 0 && (l = "stalker"), e.encounter === "siege" && r === 0 && (l = "guard"), Pe(e, l, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function qr(e, t, s) {
  if (e.boss) return;
  const a = e.objective, n = e.enemies.some((r) => r.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && q(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && q(i, a) < 2.2) && a.progress++;
    const r = Math.min(2, Math.floor(a.progress / xt.ritualTicks));
    a.x = ka[r].x, a.y = ka[r].y, e.tick % xt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Pe(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Ca(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % xt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && ba(e, t), e.tick % 150 === 0 && pe(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % xt.pursuitInterval, e.wave < e.waves && a.progress === 0 && ba(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const r = e.tick % 300 === 0, i = Math.round((r ? e.player.y : e.player.x) / 3) * 3;
    Ce(e, r ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, r ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  e.tick > xt.warningAfter && e.tick % 180 === 0 && pe(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, ba(e, t, s)) : n && (e.nextWave = 0);
}
function Hr(e) {
  return e.enemies.some((t) => t.hp > 0) ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function Vr(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, ka[0]), t.target = xt.ritualTicks * ka.length), e.encounter === "survival" && (t.target = xt.survivalTicks), e.encounter === "pursuit" && (t.target = xt.pursuitInterval);
}
var Nt = (e, t) => {
  e.motion = t, e.motionAngle = be(e, e.target), e.stun = 18;
}, Yr = {
  warden(e, t, s) {
    const a = t.pattern % 3, n = Ka.warden.damage;
    if (a === 0)
      Nt(t, 24), Ce(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let r = -1; r <= 1; r++) nt(e, Ke(t, t.angle + r * 0.55, 3.5), 1.8, 12 + Math.abs(r) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      ft(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Pe(e, "guard", {
        x: -7,
        y: -7
      }, s);
  },
  thornheart(e, t, s) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) pe(e, Ke(t.target, n * _t / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      pe(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Pe(e, "stalker", {
      x: n,
      y: -6
    }, s);
    else for (let n = 0; n < 3 + t.phase; n++) Ce(e, t, t.angle + n * _t / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, ye(e, t, "burst", 2), Ce(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), Ce(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (s === 1) ft(e, t, be(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (s === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Ke({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        Ce(e, n, be(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + a * 8, 18);
      }
      t.exposed = Math.max(t.exposed, 75);
    } else
      Pe(e, "wisp", {
        x: -7,
        y: 5
      }), Pe(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const s = t.pattern % 3, a = t.pattern * 0.53;
    if (s === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && Ce(e, t, a + n * _t / 7, 18, 0.6, 32, 23);
    else if (s === 1) for (let n = 0; n < 6; n++) {
      const r = Ke({
        x: 0,
        y: 0
      }, n * _t / 6, 9);
      ft(e, r, be(r, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      nt(e, t.target, 2, 18, 24), pe(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      Nt(t, 18), Ce(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (s === 1) for (let a = 0; a < 2 + t.phase; a++) nt(e, Ke(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else s === 2 ? (Ce(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Ce(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (ft(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Pe(e, "stalker", {
      x: -8,
      y: 3
    }), Pe(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const s = t.pattern % 4;
    if (s === 0) {
      Nt(t, 28);
      for (let a = 0; a < 6; a++) pe(e, Ke(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (s === 1) Nn(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (s === 2)
      t.x = 0, t.y = 0, pe(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Pe(e, "bomber", a);
  },
  forgemaster(e, t) {
    const s = t.pattern % 4;
    if (s === 0) for (const a of [
      -7,
      0,
      7
    ]) Ce(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (s === 1) for (let a = -1; a <= 1; a++) pe(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else s === 2 ? (nt(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Pe(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Pe(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const s = t.pattern % 3;
    if (s === 0) for (let a = 0; a < 3; a++) pe(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (s === 1)
      Nt(t, 30), Ce(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) nt(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const s = t.pattern % 4;
    if (s === 0) for (let a = 0; a < 4; a++) pe(e, Ke(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else s === 1 ? ft(e, t, t.angle, 9, 2.2, 14, 0.21) : s === 2 ? (t.x = -t.x, t.y = -t.y, Ce(e, t, be(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Pe(e, "stalker", {
      x: 0,
      y: -8
    }));
  },
  leviathan(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = -9, t.y = t.target.y, t.target = {
        x: 9,
        y: t.y
      }, Nt(t, 40), Ce(e, t, 0, 19, 1.4, 14, 25);
    else if (s === 1) for (let a = 0; a < 4; a++) Ce(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else s === 2 ? (nt(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), ft(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), nt(e, t.target, 2.3, 24, 21);
    else if (s === 1) for (let a = 0; a < t.memory.length; a++) nt(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (s === 2) {
      for (const a of t.memory) Ce(e, a, be(a, t.target), 18, 0.65, 32, 22);
      Pe(e, "wisp", {
        x: -7,
        y: -7
      }), Pe(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Nn(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), ye(e, t, "burst", 2), Ce(e, t, be(t, t.target), 20, 0.8, 24, 26);
    else if (s === 1)
      Nt(t, 20), ft(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (s === 2)
      nt(e, t, 3, 12, 26), pe(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) Ce(e, a, be(a, t.target), 20, 0.6, 22, 23);
  }
};
function Gr(e, t, s, a) {
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const r = t.phase + 1;
    t.phase = r, ye(e, t, "burst", 4), n === "phoenix" && r === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), pe(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), s.oaths.includes("legion") && Pe(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  Yr[n](e, t, a), t.pattern++;
}
function Qr(e, t, s) {
  if (!_e(t.kind)) {
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && q(n, t) < 2.8 && se(s, t, n)).sort((n, r) => q(n, t) - q(r, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && q(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function Kr(e, t, s, a, n) {
  const r = he[t.kind];
  q(t.target, e.player) < a && q(t, e.player) < r.reach + 1 && se(n, t, e.player) && za(e, r.damage, s, n);
  for (const i of e.companions) q(t.target, i) < a && q(t, i) < r.reach + 1 && se(n, t, i) && (i.hp -= r.damage);
  !e.boss && e.encounter === "siege" && q(t.target, e.objective) < a && q(t, e.objective) < r.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - r.damage * 0.5)), ye(e, t.target, "slash", a, t.angle);
}
function Xr(e, t, s, a) {
  const n = he[t.kind];
  if (_e(t.kind)) {
    Gr(e, t, s, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      ft(e, t, t.angle, e.chapter > 0 ? 3 : 2, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const r of e.enemies) r.hp > 0 && !_e(r.kind) && q(r, t) < 3.5 && se(a, t, r) && (r.hp = Math.min(r.maxHp, r.hp + 8));
      ft(e, t, t.angle, 3, 0.7, n.damage, 0.18), ye(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      pe(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      vt(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      nt(e, t.target, 1.7, 8, n.damage);
      break;
    default:
      Kr(e, t, s, n.reach + 0.15, a);
  }
}
function Jr(e, t, s, a) {
  const n = he[t.kind], r = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (Je(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    q(t, e.player) < n.radius + 0.4 && se(a, t, e.player) && za(e, n.damage, s, a);
    for (const l of e.companions) q(t, l) < n.radius + 0.3 && se(a, t, l) && (l.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && q(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), q(r, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, ye(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function eo(e, t, s, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    for (const d of [
      "marked",
      "chill",
      "exposed"
    ]) n[d] = Math.max(0, n[d] - 1);
    for (const d of [
      "burn",
      "bleed",
      "poison"
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && Ze(e, n, 2 + (d === "burn" ? z(t, "cinder") + z(t, "inferno") : d === "bleed" ? z(t, "hemorrhage") + z(t, "blood-dance") : z(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      Jr(e, n, t, a);
      continue;
    }
    const r = he[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (Xr(e, n, t, a), n.cooldown = Math.round(r.cooldown * (i ? 0.8 : 1) / (_e(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1)));
      continue;
    }
    const l = Qr(e, n, a), o = q(n, l), c = se(a, n, l);
    if (n.cooldown = Math.max(0, n.cooldown - 1), n.angle = be(n, l), !n.cooldown && o < r.reach && c) {
      if (n.target = {
        x: l.x,
        y: l.y
      }, n.windup = Math.round(r.windup * (i ? 0.8 : 1)), l === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : o / 0.24, h = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(s.x, s.y))), p = {
          x: l.x + s.x * h,
          y: l.y + s.y * h
        };
        a ? se(a, n, p) && se(a, l, p) && (n.target = p) : (n.target.x = Math.max(-10, Math.min(10, p.x)), n.target.y = Math.max(-10, Math.min(10, p.y))), n.angle = be(n, n.target);
      }
      continue;
    }
    const u = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (o > (u ? 5 : _e(n.kind) ? 2.8 : 0.95) || u && o < 3 || !c) {
      const d = n.kind === "stalker" && o > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, h = $s(a, n, l, r.radius);
      h !== null && Je(e, n, h + (u && o < 3 && c ? Math.PI : a ? 0 : d), r.speed * (n.chill ? _e(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), r.radius, a);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && q(n, d) < r.radius + he[d.kind].radius && Je(e, n, be(d, n), 0.027, r.radius, a);
  }
}
function ga(e, t, s) {
  if (e.kind === "beam") return Zr(t, e, e.angle, e.length) < e.width + s;
  const a = q(e, t);
  return a < e.radius + s && (e.kind !== "ring" || a > e.inner - s);
}
function to(e, t, s) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, s ? !se(s, n, a, a.radius) : Math.abs(a.x) > K.arena || Math.abs(a.y) > K.arena || e.obstacles.some((r) => q(r, a) < r.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (q(a, e.player) < K.playerRadius + a.radius && se(s, a, e.player)) e.player.shield > 0 ? (zs(e, t, s), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (za(e, a.damage, t, s), a.life = 0);
      else {
        const r = e.companions.find((i) => i.hp > 0 && q(a, i) < 0.3 + a.radius && se(s, a, i));
        r && (r.hp -= a.damage * (1 - z(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const r of e.enemies) {
      if (r.hp <= 0 || a.hits.includes(r.id) || q(r, a) > he[r.kind].radius + a.radius || !se(s, a, r)) continue;
      a.hits.push(r.id);
      const i = a.damage * (z(t, "hunter") && q(r, e.player) > Ae.hunterRange ? Ae.hunterDamage + (z(t, "hunter") - 1) * 0.15 : 1);
      if (Ze(e, r, i, t, a.source, a, s), z(t, "pinning") && a.source === "attack" && (r.chill = 50 + z(t, "pinning") * 20, e.player.combo % 3 === 0 && gt(e, r, 8 * z(t, "pinning"))), a.splash > 0) {
        ye(e, r, "burst", a.splash);
        for (const l of e.enemies) l.id !== r.id && q(l, r) < a.splash + he[l.kind].radius && Ze(e, l, i * 0.55, t, a.source, r, s);
      }
      if (a.bounce > 0) {
        const l = e.enemies.filter((o) => o.hp > 0 && !a.hits.includes(o.id) && q(o, r) < 6 && se(s, a, o, a.radius)).sort((o, c) => q(r, o) - q(r, c))[0];
        if (l) {
          a.bounce--, a.angle = be(a, l), a.damage *= 0.8;
          break;
        }
      }
      if (a.pierce-- <= 0) {
        a.life = 0;
        break;
      }
    }
  }
  e.shots = e.shots.filter((a) => a.life > 0);
}
function ao(e, t, s) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      ga(a, e.player, K.playerRadius) && se(s, a, e.player) && za(e, a.damage, t, s), !e.boss && e.encounter === "siege" && e.tick % 15 === 0 && ga(a, e.objective, 0.6) && se(s, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35));
      const r = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if (r || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!r || !a.hits.includes(i.id)) && ga(a, i, 0.3) && se(s, a, i) && (i.hp -= a.damage * 0.25, r && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((r) => r.hp > 0 && ga(a, r, he[r.kind].radius) && se(s, a, r));
    a.kind === "mine" && n.length && (a.life = 0, ye(e, a, "burst", a.radius));
    for (const r of n) a.kind === "storm" ? tn(e, r, t, a.damage, s, a) : (a.kind === "fire" && (r.burn = Math.max(r.burn, 45)), a.kind === "frost" && (r.chill = Math.max(r.chill, 60)), a.kind === "mine" && gt(e, r, 25), Ze(e, r, a.damage, t, a.source, a, s));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function no(e, t, s) {
  to(e, t, s), ao(e, t, s);
}
function so(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function ro(e, t, s) {
  const { seed: a, zone: n, chapter: r, elite: i, boss: l, bossKind: o, encounter: c, hp: u } = e, d = {
    tick: 0,
    seed: a,
    serial: 0,
    player: {
      x: 0,
      y: 5,
      hp: u,
      facing: -Math.PI / 2,
      attack: 0,
      dash: 0,
      skill: 0,
      invulnerable: 30,
      dashTime: 0,
      dashAngle: 0,
      swing: 0,
      shield: 0,
      combo: 0,
      guard: 0,
      resource: 0,
      resonance: 0,
      ward: 0,
      lastHit: 0,
      travel: 0,
      rescues: 0
    },
    enemies: [],
    shots: [],
    hazards: [],
    effects: [],
    companions: [],
    obstacles: l ? o === "warden" || o === "colossus" ? [{
      x: -5,
      y: 0,
      radius: 0.85
    }, {
      x: 5,
      y: 0,
      radius: 0.85
    }] : [] : [{
      x: -5,
      y: -4,
      radius: 0.9
    }, {
      x: 5,
      y: 3,
      radius: 0.9
    }],
    wave: 0,
    waves: l ? 1 : i ? 3 : 2,
    nextWave: 0,
    kills: 0,
    damageTaken: 0,
    status: "fighting",
    zone: n,
    chapter: r,
    elite: i,
    boss: l,
    bossKind: o,
    encounter: c,
    objective: {
      x: 0,
      y: 0,
      hp: 100,
      progress: 0,
      target: 0
    }
  };
  return s && ((l && !Un(o) || s.waves.some((h) => h.some((p) => !Un(p.kind)))) && ze("encounter_unsupported"), (c !== "skirmish" || !s.waves.length || !bt(s.space, s.entry, K.playerRadius) || s.waves.some((h) => !h.length || h.some((p) => !bt(s.space, p.position, he[p.kind].radius) || !da(s.space, s.entry, p.position, K.playerRadius)))) && ze("map_invalid"), Object.assign(d.player, s.entry), Object.assign(d.objective, s.objective), d.obstacles = [], d.waves = s.waves.length), Vr(d), ba(d, t, s), d;
}
function oo(e, t, s, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((r) => --r.life > 0).slice(-80);
  const n = Br(e, t, s, a);
  Wr(e, s, a), eo(e, s, n, a), no(e, s, a), e.enemies = e.enemies.filter((r) => r.hp > 0), so(e) ? e.status = "lost" : (qr(e, s, a), Hr(e) && (e.status = "won", e.shots = [], e.hazards = []));
}
function io(e, t) {
  const s = e.at(-1);
  s && s.move === t.move && s.dash === t.dash && s.skill === t.skill ? s.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var lo = 2.4;
function Sa(e, t) {
  return (!e?.all || e.all.every((s) => t.has(s))) && (!e?.none || e.none.every((s) => !t.has(s)));
}
var Fn = /* @__PURE__ */ new WeakMap();
function $t(e, t) {
  const s = e.gates.filter((i) => Sa(i.condition, t)).map((i) => i.id), a = s.join("/");
  let n = Fn.get(e);
  n || (n = /* @__PURE__ */ new Map(), Fn.set(e, n));
  let r = n.get(a);
  return r || (r = _s(e.map, new Set(s)), n.set(a, r)), r;
}
function Pa(e, t) {
  const s = e.exits.filter((n) => Sa(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => Sa(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...s, ...a];
}
function co(e, t, s) {
  const a = $t(e, s);
  return Pa(e, s).filter((n) => q(t.position, n.position) <= 2.4 && Ee(a, t.position, n.position)).sort((n, r) => q(t.position, n.position) - q(t.position, r.position) || n.target.id.localeCompare(r.target.id));
}
function uo(e, t, s, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && ze("input_invalid"), t && (e.facing = bn(t), gn(s, e.position, {
    x: Math.cos(e.facing) * K.speed * a,
    y: Math.sin(e.facing) * K.speed * a
  }, K.playerRadius));
}
var Qt = {
  crossroads: {
    complete: "crossroads_cleared",
    triggerRadius: 26,
    boss: null,
    summons: [],
    waves: [[{
      kind: "soldier",
      anchor: "patrol"
    }, {
      kind: "soldier",
      anchor: "lookout"
    }]]
  },
  gate: {
    complete: "patrol_cleared",
    boss: null,
    summons: [],
    waves: [[{
      kind: "guard",
      anchor: "guard"
    }, {
      kind: "archer",
      anchor: "archer"
    }]]
  },
  beacon: {
    complete: "alarm_silenced",
    boss: null,
    summons: [],
    waves: [[{
      kind: "guard",
      anchor: "guard"
    }, {
      kind: "archer",
      anchor: "archer"
    }], [{
      kind: "charger",
      anchor: "guard"
    }]]
  },
  waterway: {
    complete: "waterway_cleared",
    boss: null,
    summons: [],
    waves: [[{
      kind: "guard",
      anchor: "guard"
    }]]
  },
  hall: {
    complete: "warden_defeated",
    boss: "warden",
    summons: ["reinforcementLeft", "reinforcementRight"],
    waves: [[{
      kind: "warden",
      anchor: "warden"
    }]]
  },
  roots: {
    complete: "roots_cleared",
    boss: "thornheart",
    summons: ["rootLeft", "rootRight"],
    waves: [[{
      kind: "thornheart",
      anchor: "tree"
    }]]
  }
};
function Ps(e, t, s, a, n, r) {
  const i = Qt[e];
  if (!i || t.has(i.complete)) return null;
  const l = Me[e], o = i.waves.map((c) => c.map((u) => ({
    kind: u.kind,
    position: l.anchors[u.anchor]
  })));
  return e === "hall" && r && o[0].push({
    kind: "guard",
    position: l.anchors.reinforcementLeft
  }, {
    kind: "archer",
    position: l.anchors.reinforcementRight
  }), {
    setup: {
      seed: a,
      zone: 0,
      chapter: 0,
      elite: !1,
      boss: i.boss !== null,
      bossKind: i.boss ?? "warden",
      encounter: "skirmish",
      hp: n
    },
    field: {
      space: $t(l, t),
      entry: s,
      objective: l.anchors.encounter,
      waves: o,
      summonPoints: i.summons.map((c) => l.anchors[c])
    }
  };
}
var Ea = {
  sanniang: "三娘",
  anian: "阿念",
  kouzi: "扣子",
  laobai: "老白"
}, lt = Object.keys(Ea), ho = {
  sanniang: "changyounian_intel",
  laobai: "bajin_intel",
  anian: null,
  kouzi: null
}, ne = Object.freeze({
  artwork: {
    unavailable: "部分场景纹理未载入，不影响游玩。",
    retry: "重新载入",
    loading: "载入中…"
  },
  transition: (e) => `正在前往 · ${e}`,
  households: {
    anian_parents: "阿念的父母",
    innkeeper: "客店店家"
  },
  scenes: {
    camp: "檐下",
    crossroads: "外墙岔口",
    gate: "哨站正门",
    beacon: "烽火台",
    waterway: "旧水道",
    cells: "牢房",
    hall: "内堡门厅",
    roots: "根庭",
    ...Object.fromEntries(Object.entries(Gt).map(([e, t]) => [e, t.name]))
  },
  people: Ea,
  switches: {
    sluice_opened: "升起水闸",
    captives_released: "打开牢门",
    postern_opened: "拉开小门"
  },
  passages: {
    warning: {
      title: "哨站的烽火",
      body: "墙上的传令管正通向烽火台。先熄灭烽火，能截住内堡的增援；若从水道先去救人，守军会在撤离途中或内堡集结。受困者不会因为你停下来查看道路而被处决。"
    },
    cargo: {
      title: "归还的货签",
      body: `货车上是药材和冷却管件。

哨站随货送来的放还单：
“冷却管件十二副，库中仅此，余者冻裂报损。”

管件箱里夹着的出库签：
“本箱原装二十四副，出十二，存十二，完好。”`
    },
    orders: {
      title: "主闸控制台",
      body: "封锁的闸齿停了下来，外墙的输送轨道正在逐段亮起。控制台上的旧命令只有“内城优先”四个字，没有撤销日期。"
    }
  },
  actions: {
    inspect: "查看",
    talk: "交谈",
    rest: "休整",
    travel: "前往",
    close: "返回",
    interact: "交互",
    next: "切换对象",
    map: "地图",
    resume: "继续",
    move: "移动",
    controls: "WASD 或方向键移动，E 交互",
    paused: "已暂停"
  }
}), Ia = {
  sanniang: {
    initial: {
      scene: "camp",
      anchor: "clinic"
    },
    station: {
      scene: "camp",
      anchor: "clinic"
    },
    captive: !1
  },
  laobai: {
    initial: {
      scene: "camp",
      anchor: "guard"
    },
    station: {
      scene: "camp",
      anchor: "guard"
    },
    captive: !1
  },
  kouzi: {
    initial: {
      scene: "cells",
      anchor: "kouzi"
    },
    station: {
      scene: "camp",
      anchor: "kouzi"
    },
    captive: !0
  },
  anian: {
    initial: {
      scene: "cells",
      anchor: "anian"
    },
    station: {
      scene: "camp",
      anchor: "anian"
    },
    captive: !0
  }
}, La = {
  ...Object.fromEntries(Object.keys(Gt).map((e) => [e, {
    scene: e,
    anchor: "settle",
    name: ne.scenes[e]
  }])),
  camp: {
    scene: "camp",
    anchor: "start",
    name: "檐下营地"
  },
  gatehouse: {
    scene: "camp",
    anchor: "gatehouse",
    name: "外门门楼"
  },
  pipewalk: {
    scene: "camp",
    anchor: "kouzi",
    name: "管架高处"
  },
  clinic_back: {
    scene: "camp",
    anchor: "clinic_back",
    name: "诊棚后"
  },
  registry: {
    scene: "camp",
    anchor: "registry",
    name: "登记棚"
  },
  crossroads: {
    scene: "crossroads",
    anchor: "warning",
    name: ne.scenes.crossroads
  },
  gate: {
    scene: "gate",
    anchor: "crossroads",
    name: ne.scenes.gate
  },
  beacon: {
    scene: "beacon",
    anchor: "gate",
    name: ne.scenes.beacon
  },
  waterway: {
    scene: "waterway",
    anchor: "crossroads",
    name: ne.scenes.waterway
  },
  cells: {
    scene: "cells",
    anchor: "release",
    name: ne.scenes.cells
  },
  hall: {
    scene: "hall",
    anchor: "cells",
    name: ne.scenes.hall
  },
  roots: {
    scene: "roots",
    anchor: "crossroads",
    name: ne.scenes.roots
  }
}, yn = {
  briefing: {
    atClinic: !1,
    people: ["sanniang", "laobai"],
    requires: [],
    fact: "briefed",
    meaning: "玩家明确愿意去哨站救人时提交，确认接下救援委托、开放营地外的路线。对白说明正门与旧水道两条路线；是否邀你同行另算，实际救援由探索完成。"
  },
  receiving: {
    atClinic: !1,
    people: ["laobai"],
    requires: [],
    fact: "receiving_arranged",
    meaning: "玩家请求或接受担架接应，老白答应安排时提交。担架队在小门接应；牢门和小门打开后，玩家回到檐下才完成接回。"
  },
  finish: {
    atClinic: !1,
    people: ["sanniang"],
    requires: [
      "captives_arrived",
      "supplies_secured",
      "warden_defeated"
    ],
    fact: "chapter_completed",
    meaning: "与玩家核对回来的两个人和药材后提交收尾。玩家读完并继续后结算这一章。第二章尚未开放。"
  },
  clinic: {
    atClinic: !0,
    people: ["sanniang"],
    requires: ["captives_arrived", "supplies_secured"],
    fact: "clinic_helped",
    meaning: "玩家帮三娘归置归还的药材、你在对白中回应这次协助时提交。记录共同经历，好感和态度由你另行判断。"
  }
}, Es = Object.keys(yn);
function fo(e, t, s) {
  return ra(s.scene) !== "camp" ? [] : Es.filter((a) => {
    const n = yn[a], r = Ia[t].station, i = Me[r.scene].anchors[r.anchor], l = s.scene === "clinic_front" || s.scene === r.scene && Math.hypot(s.position.x - i.x, s.position.y - i.y) <= 2.4;
    return n.atClinic && !l ? !1 : n.people.includes(t) && !e.includes(n.fact) && n.requires.every((o) => e.includes(o));
  });
}
var Tt = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Bn = /* @__PURE__ */ new WeakMap();
function an(e, t, s) {
  if (Ee(e, t, s, K.playerRadius)) return s;
  const a = At(e.map, t), n = At(e.map, s), r = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Bn.get(e);
  i || (i = /* @__PURE__ */ new Map(), Bn.set(e, i));
  const l = Vt(e.map, a.column, a.row);
  if (!i.has(r)) {
    const c = da(e, l, Vt(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(r, c?.find((u) => Tt(u, l) > 0.01) ?? null);
  }
  const o = i.get(r);
  return o ? Ee(e, t, o, K.playerRadius) ? o : l : null;
}
function ya(e, t) {
  const s = Qt[e];
  return !s || t.has(s.complete);
}
function nn(e, t, s, a) {
  const n = [{
    ...e,
    route: []
  }], r = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), l = Me[i.scene], o = $t(l, s);
    if (i.scene === t.scene && an(o, i.position, l.anchors[t.anchor])) return i.route;
    for (const c of Me[i.scene].exits) {
      const u = `${c.to}/${c.arrival}`;
      r.has(u) || !Sa(c.condition, s) || a && !ya(c.to, s) || !an(o, i.position, l.anchors[c.anchor]) || (r.add(u), n.push({
        scene: c.to,
        position: Me[c.to].anchors[c.arrival],
        route: [...i.route, c]
      }));
    }
  }
  return null;
}
function Is(e, t) {
  const s = new Set(e.facts), a = e.people[t];
  return Object.entries(La).map(([n, r]) => ({
    id: n,
    name: r.name,
    ..._a(r.scene) ? { use: _a(r.scene).use } : {},
    personHere: a.scene === r.scene && (n === r.scene || Tt(a.position, Me[r.scene].anchors[r.anchor]) <= 2.4),
    playerHere: e.location.scene === r.scene && (n === r.scene || Tt(e.location.position, Me[r.scene].anchors[r.anchor]) <= 2.4),
    accessible: nn(a, r, s, !1) !== null,
    safe: ya(r.scene, s),
    solo: ya(a.scene, s) && ya(r.scene, s) && nn(a, r, s, !0) !== null
  }));
}
function po(e, t) {
  return !Ia[t].captive || e.facts.includes("captives_arrived");
}
var Ls = (e) => lo * (0.7 + lt.indexOf(e) / lt.length * 0.2);
function mo(e) {
  return lt.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && Tt(e.people[t].position, e.location.position) >= Ls(t));
}
function As(e, t) {
  return lt.filter((s) => t[s].scene === e).map((s) => ({
    kind: "object",
    position: t[s].position,
    target: {
      id: s,
      anchor: "",
      kind: "person",
      person: s
    }
  }));
}
function Ts(e) {
  return [...Pa(Me[e.location.scene], new Set(e.facts)), ...As(e.location.scene, e.people)];
}
function wn(e, t, s, a) {
  return As(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const r = e.id === "cells" && Ia[n.target.person].captive && !s.has("captives_arrived"), i = $t(e, r ? /* @__PURE__ */ new Set([...s, "captives_released"]) : s);
    return Tt(n.position, t) <= (r ? 5 : 2.4) && Ee(i, t, n.position);
  });
}
function vo(e) {
  const t = new Set(e.facts);
  for (const s of lt) {
    const a = e.people[s];
    if (a.mode === "idle") continue;
    const n = Me[a.scene], r = $t(n, t);
    let i, l;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && we("invalid"), i = e.location.position, Tt(a.position, i) < Ls(s)) continue;
    } else {
      const p = La[a.destination], g = nn(a, p, t, !0);
      if (g || we("unavailable"), l = g[0], i = n.anchors[l?.anchor ?? p.anchor], Tt(a.position, i) < 0.2) {
        l ? (a.scene = l.to, a.position = { ...Me[l.to].anchors[l.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const o = an(r, a.position, i);
    o || we("unavailable");
    const c = o.x - a.position.x, u = o.y - a.position.y, d = Math.hypot(c, u), h = Math.min(d, K.speed * 1.8);
    d && (a.facing = Math.atan2(u, c), gn(r, a.position, {
      x: c / d * h,
      y: u / d * h
    }, K.playerRadius));
  }
}
var Ne = {
  bajin: {
    name: "八斤",
    card: "enemy-bajin",
    scene: "gate",
    intel: "bajin_intel",
    complete: "patrol_cleared",
    persuaded: "bajin_passed",
    kind: "guard",
    anchor: "parley",
    clearedAnchor: "parley_side",
    approachRadius: 7,
    sentryExits: {
      guard: "guard_side",
      archer: "archer_side"
    }
  },
  changyounian: {
    name: "常有年",
    card: "enemy-changyounian",
    scene: "beacon",
    intel: "changyounian_intel",
    complete: "alarm_silenced",
    persuaded: "changyounian_passed",
    kind: "archer",
    anchor: "parley",
    clearedAnchor: "parley_side",
    approachRadius: 7,
    sentryExits: {
      guard: "guard_side",
      archer: "archer_side"
    }
  }
}, Aa = Object.keys(Ne), js = [...lt, ...Aa];
function Ue(e) {
  return Object.hasOwn(Ea, e);
}
function Be(e) {
  return Ue(e) ? Ea[e] : Ne[e].name;
}
function Ra(e, t) {
  const s = Ne[e];
  return Me[s.scene].anchors[t.has(s.complete) ? s.clearedAnchor : s.anchor];
}
function Ta(e, t, s) {
  return Aa.filter((a) => Ne[a].scene === e).flatMap((a) => {
    const n = Ra(a, s), r = Ne[a];
    return Math.hypot(t.x - n.x, t.y - n.y) <= r.approachRadius ? [{
      kind: "object",
      target: {
        id: a,
        anchor: "",
        kind: "enemy",
        enemy: a
      },
      position: n
    }] : [];
  });
}
function sn(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && we("invalid"), e;
}
function Wn(e, t = 0, s = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > s) && we("invalid"), e;
}
function kt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && we("invalid"), e;
}
function qn(e, t, s) {
  return (!Array.isArray(e) || e.length > t) && we("invalid"), e.map(s);
}
function go(e) {
  return new Set(e).size !== e.length && we("invalid"), e;
}
function Hn(e) {
  typeof e != "boolean" && we("invalid");
}
function bo(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && we("identity"), e;
}
var Os = ["male", "female"];
function yo(e) {
  const t = sn(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && we("invalid"), {
    name: t.name.trim(),
    gender: kt(t.gender, Os)
  };
}
var It = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), Zs = `${It.number} · ${It.title}`, wo = {
  sanniang: { initial: {
    reply: "先坐一坐。檐下不常见生面孔，身上可有哪里不舒服？路上受的凉、磕碰的小伤，都可以同我说。",
    performance: {
      expression: "smile",
      gesture: "gesture"
    }
  } },
  laobai: { initial: {
    reply: "生面孔啊。找人，还是找路？找人我倒认得几个，找路嘛……我这条腿，眼下只能给你指指。",
    performance: {
      expression: "teasing",
      gesture: "tilt"
    }
  } },
  anian: {
    initial: {
      reply: "嗯？……你不是这里的人。是来接我们的吗？这些货签我还留着，就是泡皱了。",
      performance: {
        expression: "surprised",
        gesture: "tilt"
      }
    },
    returned: {
      reply: "啊，你来了。三娘让我在这儿歇着……你要坐吗？这边还有地方。",
      performance: {
        expression: "neutral",
        gesture: "gesture"
      }
    }
  },
  kouzi: {
    initial: {
      reply: "哎，新来的。别站那儿挡光，我正看这道缝呢。……外头现在什么动静？",
      performance: {
        expression: "serious",
        gesture: "tilt"
      }
    },
    returned: {
      reply: "哎，找我？站稳了再说，这边管子松着。别伸手，我自己下得来。",
      performance: {
        expression: "neutral",
        gesture: "gesture"
      }
    }
  },
  bajin: { initial: {
    reply: "来人止步。此处是哨站正门，往来均须验签。把凭签拿出来，有什么事，一并说清楚。",
    performance: {
      expression: "neutral",
      gesture: "gesture"
    }
  } },
  changyounian: { initial: {
    reply: "这位，且留步。烽火台不是寻常走动的地方，不知是哪一位放你上来的？若有公事，不妨先说给我听。",
    performance: {
      expression: "neutral",
      gesture: "tilt"
    }
  } }
};
function Us(e, t) {
  const s = wo[t], a = e.facts.includes("captives_arrived") && s.returned ? s.returned : s.initial;
  return {
    id: `greeting-${t}`,
    kind: "greeting",
    player: "",
    ...structuredClone(a),
    action: null,
    scene: e.location.scene,
    facts: [...e.knowledge[t]]
  };
}
function rn(e) {
  const t = e.lastReply;
  if (!t) return null;
  const s = e.conversations[t.person].at(-1);
  return s?.id === t.turnId ? {
    person: t.person,
    turn: s
  } : null;
}
function xn(e) {
  const t = rn(e);
  return t?.turn.action === "finish" && !e.facts.includes("chapter_completed") ? t.person : null;
}
var ia = Object.freeze({
  encounterReach: 14,
  alarmTicks: 900,
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function on(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((s) => s.id === t))
  };
}
function xo(e, t) {
  if (e.phase !== "exploration" || !Me[e.location.scene].safe) return "unavailable";
  if (t.length > K.relicSlots) return "capacity";
  if (new Set(t).size !== t.length || t.some((a) => !e.collection.some((n) => n.id === a))) return "invalid";
  const s = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((a) => t.includes(a.id))
  };
  return t.some((a) => !Ss(s, a)) ? "dependency" : null;
}
function Ns(e, t, s) {
  e.facts.includes(t) || e.facts.push(t);
  const a = s ?? [...lt.filter((n) => e.people[n].scene === e.location.scene), ...Aa.filter((n) => Ne[n].scene === e.location.scene)];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function Mo(e) {
  const t = e.checkpoint;
  return Ps(e.location.scene, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"))?.field;
}
function _o(e) {
  const t = Qt[e.location.scene];
  Ns(e, t.complete);
  const s = on(e);
  t.boss && (e.hp = Math.min(K.maxHp, e.hp + 20 + z(s, "renewal") * Ae.renewalZoneHeal)), e.offers = Sr(e, Or(e.weapon).flatMap((a) => {
    const n = e.collection.find((r) => r.id === a)?.rank ?? 0;
    return n < K.maxRelicRank && Ss(s, a) && (ca[a].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: a,
      rank: n + 1
    }] : [];
  }), 3), e.phase = e.offers.length ? "reward" : "exploration", e.battle = null, e.checkpoint = null;
}
function Vn(e, t) {
  if (!(e.pendingParley || xn(e))) {
    if (e.phase === "battle" && e.battle) {
      const s = Mo(e);
      s || we("invalid"), oo(e.battle, t, on(e), s);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, ["gate", "beacon"].includes(e.location.scene) && !e.facts.includes("alarm_silenced") && (e.alarmTicks++, e.alarmTicks >= ia.alarmTicks && Ns(e, "alarm_raised")), a.status === "won" ? _o(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const s = Me[e.location.scene], a = new Set(e.facts);
      uo(e.location, t.move, $t(s, a), ia.explorationSpeed);
      const n = Qt[s.id], r = s.anchors.encounter;
      if (n && !a.has(n.complete) && r && Math.hypot(e.location.position.x - r.x, e.location.position.y - r.y) <= (n.triggerRadius ?? ia.encounterReach)) {
        const i = Ps(s.id, a, e.location.position, Math.floor(Ca(e) * 4294967296), e.hp, a.has("alarm_raised") && !a.has("alarm_silenced"));
        e.battle = ro(i.setup, on(e), i.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && vo(e);
  }
}
var $a = Object.freeze({
  minimum: 0,
  maximum: 100,
  changeMin: 2,
  changeMax: 4,
  bands: [
    0,
    21,
    41,
    61,
    81
  ]
});
function Mn(e) {
  return $a.bands.filter((t) => e >= t).length - 1;
}
var Dt = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, ko = {
  sanniang: {
    expressions: {
      neutral: "平静倾听",
      smile: "真诚愉快地微笑",
      teasing: "从容、有一点逗弄的笑意",
      blush: "脸颊泛红，仍看向对方",
      rest: "安心合眼、短暂休憩",
      serious: "收起笑意，认真而冷静",
      worried: "眉间担忧，仍专注看着对方",
      sad: "垂眼含泪，流露难过",
      displeased: "收起客气，冷淡地表达不悦",
      fond: "眼帘半垂，仍看着对方，微张嘴温柔回应",
      laugh: "笑弯眼睛，自然地笑出声",
      surprised: "睁大眼，微张嘴，短暂失去从容"
    },
    gestures: Dt
  },
  anian: {
    expressions: {
      neutral: "略带出神地听着",
      smile: "回过神来，露出自然坦率的微笑",
      laugh: "玩得高兴，放开地笑出声",
      blush: "脸颊明显泛红，有些迟疑地看着对方",
      fond: "眼帘半垂，带着柔和笑意回应对方",
      rest: "安心合眼，短暂休憩",
      surprised: "睁大眼，微张嘴，忽然回过神",
      worried: "眉间担忧，留神听着",
      displeased: "皱眉抿嘴，明显不高兴",
      sad: "垂眼难过，嘴角低下来"
    },
    gestures: Dt
  },
  kouzi: {
    expressions: {
      neutral: "利落、直接地看着对方",
      blush: "脸颊泛红，别开目光，嘴上仍有些倔",
      smile: "办成事情后，露出利落得意的笑",
      teasing: "挑起一边眉梢，嘴角带着促狭的笑",
      laugh: "忘了绷着，痛快地笑出声",
      fond: "目光难得柔和下来，微张嘴想说真心话",
      serious: "收起玩笑，冷静专注",
      surprised: "睁大眼，微张嘴，有些不敢相信",
      worried: "眉间紧起来，尽量藏住担心",
      displeased: "目光变锐，明确表示不悦",
      sad: "垂下眼，咬住话头，不愿露出受伤的样子"
    },
    gestures: Dt
  },
  laobai: {
    expressions: {
      neutral: "松松地站着，听对方说话",
      smile: "眉眼松开，好相处地笑了笑",
      teasing: "挑起一边眉梢，带着自嘲的促狭笑意",
      laugh: "没绷住，真心笑出声",
      blush: "脸颊泛红，目光躲开，有些措手不及",
      fond: "目光柔和下来，半垂眼帘，微张嘴回应",
      serious: "玩笑收住，目光安静而认真",
      surprised: "眉梢抬起，睁大眼，话停了一下",
      worried: "眉间微皱，藏不住担心",
      sad: "垂下目光，笑意消失，安静地难过"
    },
    gestures: Dt
  },
  bajin: {
    expressions: {
      neutral: "绷着脸，警惕地审视来人",
      suspicious: "眯起眼，带着怀疑审视",
      angry: "眉头压紧，硬声发令",
      worried: "眉间露出紧张，眼神有些慌",
      relieved: "脸上稍松，仍然保持警惕",
      resigned: "垂下目光，不情愿地让步"
    },
    gestures: {
      ...Dt,
      gesture: "略抬拿签的手，作一个示意",
      withdraw: "拿签的手略向内收，再放松"
    }
  },
  changyounian: {
    expressions: {
      neutral: "眯着眼，保持克制的官家神色",
      smile: "带着分寸的客气微笑",
      squint: "眼睛眯得更紧，费力辨认",
      displeased: "客气收住，神色冷下来",
      worried: "眉间绷紧，露出一丝不安",
      relieved: "眉眼稍松，露出疲惫的淡笑"
    },
    gestures: Dt
  }
};
function So(e) {
  return ko[e];
}
var Ro = (e) => kt(e, ws), Yn = (e) => kt(e, xs), Gn = (e) => kt(e, ys);
function $o(e) {
  const t = sn(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: Ro(t.weapon),
        outfit: Gn(t.outfit),
        traveler: yo(t.traveler),
        chapter: kt(t.chapter, [It.id])
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: Gn(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: bo(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: kt(t.id, Es),
        person: kt(t.person, lt)
      };
    case "greet":
      return {
        type: "greet",
        person: kt(t.person, js)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: go(qn(t.equipped, K.relicSlots, Yn))
      };
    case "input": {
      const s = qn(t.spans, K.maxInputTicks, (a) => {
        const n = sn(a);
        return Hn(n.dash), Hn(n.skill), {
          move: Wn(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Wn(n.ticks, 1, K.maxInputTicks)
        };
      });
      return (!s.length || s.reduce((a, n) => a + n.ticks, 0) > K.maxInputTicks) && we("invalid"), {
        type: "input",
        spans: s
      };
    }
    case "relic":
      return {
        type: "relic",
        id: Yn(t.id)
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: t.type };
    default:
      return we("invalid");
  }
}
function Co(e, t) {
  const s = Ht(null), a = W(!1), n = W(""), r = Ht(null), i = W(!1), l = W(!1), o = Ht(null), c = W(null), u = J(() => s.value?.replyFailure?.actionId === c.value ? null : s.value?.replyFailure ?? null), d = J(() => i.value || !!s.value?.conversation), h = W(!1), p = W(!1);
  let g = !1, v = null;
  const y = J(() => a.value || d.value || l.value || !!r.value || !s.value?.ready || s.value.writeState !== "ready" || s.value.pending), M = (C, U) => C.data.revision !== U.data.revision ? C.data.revision > U.data.revision : C.fileRevision >= U.fileRevision;
  function x(C) {
    if (g || s.value && !M(C, s.value)) return;
    const U = o.value;
    (s.value?.data.active?.id !== C.data.active?.id || U && C.data.active?.conversations[U.person].some((T) => T.id === U.actionId)) && (o.value = null), s.value = C;
  }
  const S = J(() => {
    if (o.value) return o.value;
    if (s.value?.conversation) return {
      ...s.value.conversation,
      status: "sending"
    };
    const C = s.value?.replyFailure;
    return !C || C.regenerating || s.value?.data.active?.conversations[C.person].some((U) => U.id === C.actionId) ? null : {
      actionId: C.actionId,
      person: C.person,
      text: C.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function b(C, U, T) {
    if (g || a.value) return !1;
    a.value = !0, v = null, n.value = "";
    try {
      const H = await e.request(`game/expedition/${C}`, {
        chatIdentity: t,
        ...C === "rebuild" ? { actionId: Ha() } : {},
        ...U,
        ...T ? { person: T } : {}
      }, 35e3), Y = v;
      return x(Y && M(Y, H.result) ? Y : H.result), h.value = !1, p.value = !1, s.value?.writeState === "ready" && !s.value.pending && C !== "read" && (r.value = null), !0;
    } catch (H) {
      if (!g) {
        h.value = !0, v && x(v), n.value = Mt(H);
        const Y = H && typeof H == "object" && "code" in H ? String(H.code) : "";
        p.value = Y === "expedition_data_invalid", U && (Y.startsWith("expedition_save_") || Y.startsWith("host_request_")) && (r.value = U);
      }
      return !1;
    } finally {
      g || (a.value = !1);
    }
  }
  const w = e.subscribe((C) => {
    if (g) return;
    if (C.type === "game/expedition/error") {
      const T = C.payload;
      T.chatIdentity === t && (n.value = Mt(T), p.value = T.code === "expedition_data_invalid");
      return;
    }
    if (C.type !== "game/expedition/state") return;
    const U = C.payload;
    U.chatIdentity === t && (a.value ? v = U.state : x(U.state));
  });
  async function k() {
    const C = r.value;
    return !await b("confirm") || !s.value || s.value.writeState !== "ready" || s.value.pending ? !1 : C && s.value.data.revision === C.revision ? b("act", C) : (r.value = null, l.value = !1, !0);
  }
  async function E(C, U, T) {
    if (y.value || g) return !1;
    const H = Ha();
    o.value = {
      actionId: H,
      person: C,
      text: U,
      regenerating: !!T,
      status: "sending"
    }, i.value = !0, a.value = !0, n.value = "", v = null;
    try {
      const Y = await e.request(T ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: H,
        revision: s.value.data.revision,
        person: C,
        text: U,
        ...T ? { turnId: T } : {}
      }, 18e4), F = v;
      return x(F && M(F, Y.result) ? F : Y.result), !0;
    } catch (Y) {
      if (!g) {
        v && x(v);
        const F = Y && typeof Y == "object" && "code" in Y ? String(Y.code) : Y instanceof Error ? Y.message : "";
        if (F === "expedition_cancelled")
          return n.value = "", !1;
        l.value = F.startsWith("host_request_") || F.startsWith("expedition_save_"), n.value = l.value ? N.aiUnknown : s.value?.replyFailure?.actionId === H ? "" : Mt(Y);
      }
      return !1;
    } finally {
      i.value = !1, g || (a.value = !1, o.value?.actionId === H && (o.value = T ? null : {
        ...o.value,
        status: "failed"
      }));
    }
  }
  async function L() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (C) {
        g || (n.value = Mt(C));
      }
  }
  const j = J(() => h.value || !!r.value || l.value || !s.value || s.value.pending || s.value.writeState !== "ready");
  return {
    view: s,
    busy: a,
    error: n,
    blocked: y,
    failed: r,
    talking: d,
    uncertainTalk: l,
    talk: E,
    outgoing: S,
    cancelTalk: L,
    recoveryRequired: j,
    dataInvalid: p,
    conversationFailure: u,
    dismissConversationFailure() {
      c.value = s.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => b("rebuild"),
    retryMemory: (C) => y.value ? Promise.resolve(!1) : b("retry-memory", void 0, C),
    dismissError() {
      j.value || (n.value = "");
    },
    notice: J(() => n.value || (s.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(s.value.writeState) || s.value.pending && s.value.writeState === "ready") ? ae.saveError : "")),
    read: () => b("read"),
    recover: k,
    act: (C) => y.value ? Promise.resolve(!1) : b("act", {
      actionId: Ha(),
      revision: s.value.data.revision,
      command: $o(C)
    }),
    dispose() {
      g = !0, w();
    }
  };
}
function zo(e) {
  const t = Ht(null), s = Ht(!1);
  let a = [], n = 0, r = null, i = !1;
  function l() {
    const d = e.view.value?.data.active;
    if (t.value = d ? structuredClone(d) : null, t.value) for (const h of a) for (let p = 0; p < h.ticks; p++) Vn(t.value, h);
    s.value = a.length > 0;
  }
  const o = me(e.view, () => {
    !r && !a.length && l();
  }, { immediate: !0 });
  async function c() {
    if (r)
      return await r ? c() : !1;
    if (!a.length) return !e.blocked.value;
    if (e.blocked.value || i) return !1;
    const d = a;
    a = [], n = 0, r = e.act({
      type: "input",
      spans: d
    });
    const h = await r;
    return r = null, h ? l() : e.failed.value || (a = d.concat(a), n = a.reduce((p, g) => p + g.ticks, 0)), s.value = a.length > 0 || !h, h;
  }
  function u(d) {
    const h = t.value;
    !h || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(h.phase) || h.phase === "exploration" && !d.move && !mo(h) || (Vn(h, d), io(a, d), n++, s.value = !0, nr(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(h.phase)) && c());
  }
  return {
    current: t,
    dirty: s,
    input: u,
    flush: c,
    sync: l,
    async recover() {
      return await e.recover() ? (l(), c()) : !1;
    },
    dispose() {
      i = !0, o();
    }
  };
}
var de = Object.freeze({
  affection: "好感",
  context: "上下文",
  close: "关闭",
  loading: "正在读取人物资料",
  retry: "重新读取",
  rawReply: "查看回复原文",
  reloadArtwork: "重新加载人物画面",
  regenerate: "重新生成",
  retrySend: "重试发送",
  sendFailed: "未完成回复，原消息已保留。",
  continue: "继续",
  issues: {
    action_rejected: "对白已保存，附带行动不成立，未执行。",
    reply_invalid: "回复格式有误。原文已保存，未执行行动或改变好感。",
    reply_incomplete: "回复未完整生成。已收到的原文已保存，未执行行动或改变好感。"
  },
  shareSecret: "把当前阶段的秘密实际讲给玩家，记录玩家已获得这份情报。",
  follow: "跟随玩家，跨场景同行；可以进入战区，但不参战。",
  stay: "停止跟随，留在原处；营地外在玩家离开场景后自行回营。",
  go: (e) => `自己步行去${e}，到了在那里等玩家；不移动玩家。`,
  pass: "决定放行，不再进行这场战斗；玩家读完并关闭面板后让路。",
  attack: "决定动手，对话结束；玩家读完并迎战后开始战斗。",
  fight: "迎战",
  contextParts: {
    system: "世界与人物",
    situation: "当前处境",
    memory: "历史摘要",
    history: "近期交谈"
  },
  estimate: "本地估算；摘要期间保留原文继续交谈，达到等待线后等摘要完成再发送。",
  memoryRunning: "正在后台整理较早的交谈",
  memoryRetry: "重试摘要",
  memoryServiceFailed: "摘要服务调用失败，原文已保留。",
  threshold: (e) => `${e / 1e3}k 开始后台摘要`
});
function Po(e) {
  let t = null, s = null, a = null, n = !1, r = !1, i = null, l = -1, o = 0, c = 0, u = 0, d = 0, h = 0;
  function p(v, y, M, x = "sine", S = v * 0.8, b = 0) {
    if (!n || !t || !s || t.state !== "running") return;
    const w = t.createOscillator(), k = t.createGain(), E = t.currentTime + b;
    w.type = x, w.frequency.setValueAtTime(v, E), w.frequency.exponentialRampToValueAtTime(Math.max(30, S), E + y), k.gain.setValueAtTime(1e-4, E), k.gain.exponentialRampToValueAtTime(M, E + 9e-3), k.gain.exponentialRampToValueAtTime(1e-4, E + y), w.connect(k).connect(s), w.start(E), w.stop(E + y), w.onended = () => {
      w.disconnect(), k.disconnect();
    };
  }
  function g(v, y, M, x) {
    if (!n || !t || !s || !a || t.state !== "running") return;
    const S = t.createBufferSource(), b = t.createBiquadFilter(), w = t.createGain(), k = t.currentTime;
    S.buffer = a, b.type = "bandpass", b.Q.value = 0.65, b.frequency.setValueAtTime(M, k), b.frequency.exponentialRampToValueAtTime(x, k + v), w.gain.setValueAtTime(1e-4, k), w.gain.exponentialRampToValueAtTime(y, k + 8e-3), w.gain.exponentialRampToValueAtTime(1e-4, k + v), S.connect(b).connect(w).connect(s), S.start(k), S.stop(k + v), S.onended = () => {
      S.disconnect(), b.disconnect(), w.disconnect();
    };
  }
  return {
    async enable(v) {
      if (!r) {
        n = v;
        try {
          if (!v) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), s = t.createGain(), s.gain.value = 0.55, s.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const y = a.getChannelData(0);
            for (let M = 0; M < y.length; M++) y[M] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, r || e();
        }
      }
    },
    tick(v) {
      (!i || v.tick < l) && (l = -1, o = v.player.hp, c = v.kills, u = v.player.skill, d = v.serial, h = v.player.combo), i = v, l !== v.tick && (l = v.tick, v.player.hp < o && (g(0.16, 0.17, 800, 120), p(95, 0.2, 0.12, "triangle", 42)), v.kills > c && (p(659, 0.22, 0.045), p(988, 0.3, 0.025, "sine", 980, 0.035)), v.player.combo > h && g(0.095, 0.08, 2700, 500), v.player.dashTime === 7 && g(0.2, 0.09, 500, 2600), v.player.skill > u && (g(0.24, 0.12, 2200, 250), p(165, 0.35, 0.075, "triangle", 82), p(660, 0.36, 0.035, "sine", 440, 0.02)), v.effects.some((y) => y.id > d && y.kind === "lightning") && (g(0.12, 0.1, 4400, 1e3), p(1200, 0.08, 0.018, "sine", 210)), v.effects.some((y) => y.id > d && (y.kind === "block" || y.kind === "parry")) && (p(1350, 0.18, 0.07, "triangle", 740), p(2200, 0.11, 0.025, "sine", 1600)), v.effects.some((y) => y.id > d && y.kind === "ward-hit") && p(510, 0.16, 0.06, "sine", 250), v.effects.some((y) => y.id > d && y.kind === "ward-break") && (g(0.25, 0.1, 3600, 650), p(720, 0.3, 0.05, "sine", 120)), v.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((y, M) => p(y, 0.65, 0.04, "sine", y, M * 0.075)), v.status === "lost" && p(147, 0.7, 0.06, "triangle", 73), o = v.player.hp, c = v.kills, u = v.player.skill, d = v.serial, h = v.player.combo);
    },
    dispose() {
      r = !0, n = !1, t && (t.close().catch(e), t = null), s = null, a = null;
    }
  };
}
var f = {
  grass: "#a5afc1",
  grassLight: "#c2c9d8",
  grassDark: "#909bb1",
  soil: "#67717e",
  stone: "#c4c7d9",
  light: "#edf0fa",
  mortar: "#8290a9",
  slate: "#465271",
  roof: "#3d4666",
  roofLight: "#667396",
  timber: "#42465c",
  wood: "#9d8171",
  shadow: "#2a354f",
  brass: "#bf926f",
  cloth: "#d9c9be",
  leaf: "#556e83",
  leafLight: "#8fabc0",
  amber: "#ad927c",
  amberLight: "#d9b993",
  rose: "#bfa3bd",
  water: "#627fba",
  ripple: "#c7d9f1",
  ember: "#ffcb92",
  pottery: "#ad7d74",
  undercroft: "#485977",
  wetStone: "#98abc9",
  marble: "#cbd5ea",
  marbleLight: "#e4eafa",
  root: "#64627a",
  rootLight: "#9290a1",
  sky: "#cbd5f0",
  haze: "#e3e6f6",
  window: "#c4d1e5",
  distantGround: "#8596b2",
  distantLeaf: "#a2b0c8",
  distantWall: "#bac5df",
  distantRoof: "#818cac",
  street: "#a2acc3",
  streetStone: "#bdc5d7",
  streetSeam: "#98a3ba"
}, Qn = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], st = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, je = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, Xe = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, ja = [
  {
    sky: f.sky,
    haze: f.haze,
    stone: f.stone,
    light: f.light,
    floor: f.grass,
    tile: f.grassLight,
    seam: f.mortar,
    dark: f.shadow,
    trim: f.brass,
    accent: f.ember,
    foliage: f.leaf,
    flower: f.rose,
    water: f.water
  },
  {
    sky: "#bfcfe9",
    haze: "#dde5f5",
    stone: "#dce3ed",
    light: "#f4f1ff",
    floor: "#abb6cb",
    tile: "#b2bcd0",
    seam: "#93a1bb",
    dark: "#364869",
    trim: "#c4bcdf",
    accent: "#9cbeff",
    foliage: "#626ca0",
    flower: "#e0b2dd",
    water: "#88a0bc"
  },
  {
    sky: "#f3d8b0",
    haze: "#fbebd2",
    stone: "#f0ddba",
    light: "#fff4da",
    floor: "#c9bda5",
    tile: "#cfc3ac",
    seam: "#b6a88f",
    dark: "#5a565d",
    trim: "#c99249",
    accent: "#ffd481",
    foliage: "#b87056",
    flower: "#ffe2a3",
    water: "#a6b8b0"
  },
  {
    sky: "#e0c6bb",
    haze: "#f0dccc",
    stone: "#bfada1",
    light: "#eee3ce",
    floor: "#a9a1a0",
    tile: "#b4aaa5",
    seam: "#88878c",
    dark: "#3e4a55",
    trim: "#c18c59",
    accent: "#ffb06d",
    foliage: "#8a634b",
    flower: "#ffd6a5",
    water: "#c77446"
  },
  {
    sky: "#c1e4f1",
    haze: "#e0f4f8",
    stone: "#d7e9ed",
    light: "#f6ffff",
    floor: "#a7c5d2",
    tile: "#b0cfd9",
    seam: "#8dabbc",
    dark: "#365773",
    trim: "#afcdd9",
    accent: "#9ce4f0",
    foliage: "#6395ad",
    flower: "#edf5ff",
    water: "#599aba"
  },
  {
    sky: "#c9c1e6",
    haze: "#e5dff5",
    stone: "#ddd6ec",
    light: "#f8f3ff",
    floor: "#b8b0ce",
    tile: "#c4bcd9",
    seam: "#9f95b5",
    dark: "#44395e",
    trim: "#d5ba8e",
    accent: "#c6aff9",
    foliage: "#766a9f",
    flower: "#eadba9",
    water: "#9482bb"
  }
], Eo = {
  storm: "#428dad",
  fire: "#b96839",
  frost: "#558eaf",
  guard: "#4e8776",
  life: "#ad5261",
  skill: "#8170ac",
  risk: "#a54853",
  blade: "#a98243",
  bow: "#498362",
  staff: "#8170ac",
  daggers: "#a95176",
  grimoire: "#578476",
  cannon: "#987347"
}, w2 = Object.fromEntries(Object.entries(ca).map(([e, t]) => [e, Eo[t.family]]));
function Io(e, t, s) {
  const a = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, r = !1, i = !1;
  const l = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "KeyE",
    "Escape"
  ];
  function o(h) {
    if (!(!l.includes(h.code) || h.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(h.target.tagName)) && !(h.code === "Space" && h.target instanceof HTMLElement && h.target.closest("button"))) {
      if (h.preventDefault(), h.stopPropagation(), s(), h.code === "Escape") {
        h.repeat || t();
        return;
      }
      a.add(h.code), !h.repeat && h.code === "Space" && (r = !0), !h.repeat && h.code === "KeyE" && (i = !0);
    }
  }
  function c(h) {
    a.delete(h.code);
  }
  function u() {
    a.clear(), n = {
      x: 0,
      y: 0
    }, r = !1, i = !1;
  }
  function d() {
    u(), t();
  }
  return e.addEventListener("keydown", o), window.addEventListener("keyup", c), window.addEventListener("blur", d), {
    frame() {
      const h = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), p = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), g = {
        move: Math.hypot(h, p) < 0.15 ? 0 : (Math.round((Math.atan2(p, h) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: r,
        skill: i
      };
      return r = !1, i = !1, g;
    },
    stick(h, p) {
      n = {
        x: h,
        y: p
      };
    },
    dash() {
      r = !0, s();
    },
    skill() {
      i = !0, s();
    },
    clear: u,
    dispose() {
      u(), e.removeEventListener("keydown", o), window.removeEventListener("keyup", c), window.removeEventListener("blur", d);
    }
  };
}
function Lo(e, t) {
  let s = null;
  function a(r) {
    if (!s || r.pointerId !== s.id) return;
    const i = s.surface.getBoundingClientRect(), l = i.width * 0.36, o = (r.clientX - i.left - i.width / 2) / l, c = (r.clientY - i.top - i.height / 2) / l, u = Math.max(1, Math.hypot(o, c));
    e(o / u, c / u);
  }
  function n() {
    const r = s;
    s = null, e(0, 0), r?.surface.hasPointerCapture(r.id) && r.surface.releasePointerCapture(r.id);
  }
  return {
    down(r) {
      if (s || r.button !== 0) return;
      t();
      const i = r.currentTarget;
      i.setPointerCapture(r.pointerId), s = {
        id: r.pointerId,
        surface: i
      }, a(r);
    },
    move: a,
    release(r) {
      s?.id === r.pointerId && n();
    },
    clear: n
  };
}
function ln(e) {
  const t = new Tn();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const s = {
    box: new gr(1, 1, 1),
    sphere: new mr(1, 20, 14),
    rock: new An(1, 0),
    crown: new An(1, 1),
    cylinder: new pr(1, 1, 1, 24),
    cone: new br(1, 1, 12),
    disc: new vr(1, 48),
    ring: new qa(0.965, 1, 64),
    arc: new qa(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new Ln(1, 0.08, 8, 40),
    stroke: new qa(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new Ln(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new jn(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
  function i(h, p = !1, g = 1, v = !1) {
    const y = `${h}/${p}/${g}/${v}`;
    let M = n.get(y);
    return M || (M = p ? new hr({
      color: h,
      transparent: g < 1,
      opacity: g,
      depthWrite: g === 1,
      side: 2
    }) : new ps({
      color: h,
      map: e?.get(h) ?? null,
      roughness: v ? 0.34 : 0.88,
      metalness: v ? 0.45 : 0.02,
      side: 2
    }), n.set(y, M)), M;
  }
  function l(h, p, g, v, y = [
    0,
    0,
    0
  ], M = !1, x = 1, S = !1) {
    let b = s[p];
    if (!M && p === "box" && e?.has(g)) {
      b = b.clone(), r.add(b);
      const k = b.getAttribute("position"), E = b.getAttribute("normal"), L = b.getAttribute("uv");
      for (let j = 0; j < L.count; j++) {
        const C = Math.abs(E.getX(j)) > 0.5 ? k.getZ(j) * v[2] : k.getX(j) * v[0], U = Math.abs(E.getY(j)) > 0.5 ? k.getZ(j) * v[2] : k.getY(j) * v[1];
        L.setXY(j, C / 8, U / 8);
      }
    }
    const w = new mt(b, i(g, M, x, S));
    return w.scale.set(...v), w.position.set(...y), w.castShadow = !M, w.receiveShadow = !M, h.add(w), w;
  }
  function o(h, p = [
    0,
    0,
    0
  ]) {
    const g = new sa();
    return g.position.set(...p), h.add(g), g;
  }
  function c(h, p, g, v, y, M = 1, x = !1, S = 0.04) {
    const b = l(h, x ? "disc" : "ring", p, [
      g,
      g,
      1
    ], [
      v,
      S,
      y
    ], !0, M);
    return b.rotation.x = -Math.PI / 2, b;
  }
  function u(h, p, g, v = [
    0,
    0,
    0
  ], y = 0) {
    const M = e?.has(g) ?? !1, x = JSON.stringify([
      p,
      y,
      M
    ]);
    let S = a.get(x);
    if (!S) {
      const w = new Tn();
      if (p.forEach(([k, E], L) => L ? w.lineTo(k, E) : w.moveTo(k, E)), w.closePath(), S = y ? new jn(w, {
        depth: y,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: y * 0.3,
        bevelSize: y * 0.3,
        bevelSegments: 2
      }) : new ur(w), M) {
        const k = S.getAttribute("uv");
        for (let E = 0; E < k.count; E++) k.setXY(E, k.getX(E) / 8, k.getY(E) / 8);
      }
      a.set(x, S);
    }
    const b = new mt(S, i(g));
    return b.position.set(...v), b.castShadow = !0, b.receiveShadow = !0, h.add(b), b;
  }
  function d(h) {
    h.updateMatrixWorld(!0);
    const p = h.matrixWorld.clone().invert(), g = new fs(), v = /* @__PURE__ */ new Map();
    h.traverse((M) => {
      if (!(M instanceof mt) || Array.isArray(M.material)) return;
      const x = (M.geometry.index ? M.geometry.toNonIndexed() : M.geometry.clone()).applyMatrix4(g.multiplyMatrices(p, M.matrixWorld)), S = `${M.material.uuid}/${M.castShadow}/${M.receiveShadow}`;
      let b = v.get(S);
      b || (b = {
        material: M.material,
        castShadow: M.castShadow,
        receiveShadow: M.receiveShadow,
        geometries: []
      }, v.set(S, b)), b.geometries.push(x);
    }), h.clear();
    const y = [];
    for (const { material: M, castShadow: x, receiveShadow: S, geometries: b } of v.values()) {
      const w = bs(b);
      if (b.forEach((E) => E.dispose()), !w) throw new Error("expedition_geometry_merge");
      const k = new mt(w, M);
      k.castShadow = x, k.receiveShadow = S, h.add(k), y.push(w);
    }
    return () => {
      h.clear(), y.forEach((M) => M.dispose());
    };
  }
  return {
    mesh: l,
    group: o,
    ring: c,
    shape: u,
    material: i,
    bake: d,
    geometries: s,
    dispose() {
      Object.values(s).forEach((h) => h.dispose()), a.forEach((h) => h.dispose()), r.forEach((h) => h.dispose()), n.forEach((h) => h.dispose());
    }
  };
}
function Ao(e, t, s, a) {
  const n = ja[s], r = K.arena, { mesh: i, group: l, ring: o } = e, c = (g, v, y, M = n.stone) => i(g, "box", M, v, y);
  function u(g, v, y, M = !0) {
    const x = l(t, [
      g,
      0,
      v
    ]);
    c(x, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), c(x, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), c(x, [
      0.91,
      y,
      0.91
    ], [
      0,
      y / 2 + 0.6,
      0
    ]);
    for (const S of [-0.38, 0.38]) c(x, [
      0.08,
      y - 0.35,
      0.12
    ], [
      S,
      y / 2 + 0.6,
      0.48
    ], n.light);
    return c(x, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      y + 0.6,
      0
    ], n.light), c(x, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      y + 0.85,
      0
    ], n.dark), M && (i(x, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      y + 1.24,
      0
    ]), c(x, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      y - 0.15,
      0.52
    ], n.trim)), x;
  }
  function d(g, v, y, M) {
    u(g - y / 2, v, M - 2), u(g + y / 2, v, M - 2);
    const x = l(t, [
      g,
      M - 2,
      v
    ]);
    i(x, "arch", n.light, [
      y / 2,
      2.3,
      1.15
    ]);
    for (let S = 1; S < 10; S++) {
      const b = S / 10 * Math.PI, w = c(x, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(b) * y * 0.49,
        Math.sin(b) * 2.25,
        0.59
      ], n.trim);
      w.rotation.z = b - Math.PI / 2;
    }
    c(x, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function h(g, v, y = 1) {
    const M = l(t, [
      g,
      0,
      v
    ]);
    M.scale.setScalar(y);
    for (let x = 0; x < 5; x++) {
      const S = x * 2.4, b = i(M, "rock", x % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + x % 2 * 0.3,
        0.45
      ], [
        Math.cos(S) * 0.4,
        0.5,
        Math.sin(S) * 0.4
      ]);
      b.rotation.z = Math.sin(S) * 0.4;
    }
    for (let x = 0; x < 3; x++) i(M, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(x * 4) * 0.5,
      1,
      Math.cos(x * 4) * 0.4
    ]);
  }
  function p(g, v, y) {
    const M = l(t, [
      g,
      0,
      v
    ]);
    M.scale.setScalar(y);
    const x = i(M, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    x.rotation.z = -0.1;
    for (let S = 0; S < 6; S++) {
      const b = S * 2.4;
      i(M, "rock", S % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(b) * 0.95,
        3 + Math.sin(b) * 0.5,
        Math.sin(b) * 0.85
      ]);
    }
  }
  c(t, [
    180,
    0.3,
    180
  ], [
    0,
    -4.1,
    0
  ], n.water);
  for (let g = 0; g < 16; g++) c(t, [
    3 + g % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(g * 7) * 32,
    -3.92,
    Math.cos(g * 3) * 25
  ], n.haze);
  c(t, [
    r * 2 + 2.4,
    2.4,
    r * 2 + 2.4
  ], [
    0,
    -1.5,
    0
  ], n.dark), c(t, [
    r * 2 + 1.1,
    0.42,
    r * 2 + 1.1
  ], [
    0,
    -0.42,
    0
  ], n.trim), c(t, [
    r * 2 + 0.5,
    0.35,
    r * 2 + 0.5
  ], [
    0,
    -0.14,
    0
  ], n.floor);
  for (let g = -10; g <= 10; g += 2) for (let v = -10; v <= 10; v += 2) c(t, [
    1.96,
    0.045,
    1.96
  ], [
    g,
    0.025,
    v
  ], (g * 3 + v + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    o(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), o(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), o(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let g = 0; g < 8; g++) {
      const v = g * Math.PI / 4, y = c(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(v) * 5.04,
        0.065,
        Math.sin(v) * 5.04
      ], n.trim);
      y.rotation.y = -v + Math.PI / 2;
    }
    if (s === 1) i(t, "crescent", n.seam, [
      3,
      3,
      0.12
    ], [
      0,
      0.065,
      0
    ]).rotation.set(-Math.PI / 2, 0, 0.7);
    else {
      const g = [];
      for (let y = 0; y < (s === 2 ? 24 : 16); y++) {
        const M = y * Math.PI * 2 / (s === 2 ? 24 : 16), x = y % 2 ? 0.85 : s === 2 ? 2.6 : y % 4 ? 1.8 : 3.2;
        g.push([Math.cos(M) * x, Math.sin(M) * x]);
      }
      const v = e.shape(t, g, n.seam, [
        0,
        0.061,
        0
      ]);
      v.rotation.x = -Math.PI / 2, o(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const g of [-1, 1]) for (let v = 0; v < 4; v++) {
    const y = g * (7 + v % 2), M = -7 + v * 4, x = c(t, [
      0.035,
      0.016,
      0.55 + v * 0.1
    ], [
      y,
      0.055,
      M
    ], n.seam);
    x.rotation.y = v * 1.3;
    const S = c(t, [
      0.028,
      0.015,
      0.3
    ], [
      y + 0.1,
      0.055,
      M + 0.3
    ], n.seam);
    S.rotation.y = v * 1.3 + 0.8;
  }
  for (const g of [-r - 0.35, r + 0.35]) {
    c(t, [
      0.38,
      0.18,
      r * 2 + 1
    ], [
      g,
      0.08,
      0
    ], n.light);
    for (let v = -10; v <= 10; v += 5) u(g + Math.sign(g) * 0.5, v, v === -10 ? 3.6 : 1.35);
  }
  for (let g = 0; g < 6; g++) c(t, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - g * 0.26,
    r + 0.65 + g * 0.8
  ], g % 2 ? n.stone : n.light);
  d(0, -r - 3, 8, 6.3);
  for (const g of [-1, 1]) {
    c(t, [
      5,
      3.2,
      1.9
    ], [
      g * 8.4,
      1.45,
      -r - 3
    ], n.dark), c(t, [
      5.5,
      0.3,
      2.3
    ], [
      g * 8.4,
      3.2,
      -r - 3
    ], n.light);
    const v = l(t, [
      g * 5.8,
      4.8,
      -r - 2.9
    ]);
    c(v, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let y = 0; y < 5; y++) c(v, [
      0.35,
      2.6 - Math.abs(y - 2) * 0.12,
      0.08
    ], [
      (y - 2) * 0.34,
      -1.35,
      Math.sin(y * 2) * 0.08
    ], y % 2 ? n.foliage : n.dark);
    if (c(v, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), s < 3) {
      for (let y = 0; y < 4; y++) h(g * (12.8 + y % 2), -9 + y * 5, 0.8 + y * 0.1);
      p(g * 15, -13, 1.5), p(g * 17, 1, 1.7);
    } else if (s === 3) for (let y = 0; y < 3; y++) {
      const M = l(t, [
        g * 15,
        0,
        -9 + y * 7
      ]);
      i(M, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), i(M, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), c(M, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), i(M, "torus", n.trim, [
        1.1,
        1.1,
        0.3
      ], [
        0,
        1.2,
        1.4
      ]);
    }
    else if (s === 4) {
      for (let M = 0; M < 5; M++) i(t, "rock", M % 2 ? n.light : n.accent, [
        1,
        2.2 + M % 3,
        0.9
      ], [
        g * (13.5 + M % 2),
        1.2,
        -9 + M * 4
      ]).rotation.z = g * -0.2;
      const y = l(t, [
        g * 17,
        0,
        -13
      ]);
      c(y, [
        0.22,
        8,
        0.22
      ], [
        0,
        3.5,
        0
      ], n.dark), e.shape(y, [
        [0, 0],
        [3, -1],
        [0, -4]
      ], n.light, [
        0,
        6.5,
        0
      ]);
    } else {
      for (let M = 0; M < 4; M++) {
        const x = l(t, [
          g * 14,
          0,
          -10 + M * 6
        ]);
        c(x, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let S = 0; S < 3; S++) {
          c(x, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + S,
            0
          ], n.trim);
          for (let b = 0; b < 5; b++) c(x, [
            0.27,
            0.65 + b % 2 * 0.12,
            0.6
          ], [
            -0.85 + b * 0.4,
            1.2 + S,
            0.1
          ], b % 2 ? n.foliage : n.stone);
        }
      }
      const y = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        g * 18,
        6.2,
        -13
      ]);
      y.rotation.y = g * 0.3;
    }
    c(t, [
      7,
      1.4,
      18
    ], [
      g * 17,
      -0.7,
      -3
    ], n.dark), c(t, [
      6.7,
      0.1,
      17.7
    ], [
      g * 17,
      0.06,
      -3
    ], n.seam);
    for (const y of [-3.5, 3.5]) c(t, [
      0.22,
      0.25,
      18.2
    ], [
      g * 17 + y,
      0.13,
      -3
    ], n.stone);
    c(t, [
      9,
      1.8,
      10
    ], [
      g * 15,
      -0.9,
      -17
    ], n.dark), c(t, [
      8.7,
      0.1,
      9.7
    ], [
      g * 15,
      0.06,
      -17
    ], n.seam);
  }
  for (let g = 0; g < 7; g++) {
    const v = (g - 3) * 8, y = -26 - g % 3 * 6, M = 7 + g * 5 % 7;
    if (c(t, [
      5.2,
      M,
      5.5
    ], [
      v,
      M / 2 - 3,
      y
    ], n.stone), c(t, [
      5.8,
      0.4,
      6
    ], [
      v,
      M - 3,
      y
    ], n.light), s === 1) {
      const x = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        v,
        M - 0.8,
        y
      ]);
      x.rotation.z = 0.9;
    } else if (s === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      v,
      M - 0.8,
      y
    ]);
    else if (s === 3) {
      for (const x of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + g % 2 * 2,
        0.7
      ], [
        v + x,
        M - 1,
        y
      ]);
      c(t, [
        3.8,
        0.25,
        4
      ], [
        v,
        M - 2.5,
        y
      ], n.trim);
    } else if (s === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        v,
        M - 0.8,
        y
      ]);
      for (const x of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        v + x,
        M - 3,
        y + 3
      ]);
    } else if (s === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        v,
        M + 0.7,
        y
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        v,
        M - 1,
        y
      ]).rotation.x = Math.PI / 2;
    else {
      for (const x of [
        -2,
        0,
        2
      ]) c(t, [
        0.7,
        1.2,
        5.6
      ], [
        v + x,
        M - 2.35,
        y
      ], n.light);
      g % 2 && p(v + 1, y + 2, 1.5);
    }
    for (const x of [
      -1.5,
      0,
      1.5
    ]) c(t, [
      0.5,
      2.8,
      0.12
    ], [
      v + x,
      M - 5.6,
      y + 2.8
    ], n.dark);
  }
  for (const g of a?.obstacles ?? []) {
    const v = l(t, [
      g.x,
      0,
      g.y
    ]);
    i(v, "cylinder", n.dark, [
      g.radius,
      0.22,
      g.radius
    ], [
      0,
      0.11,
      0
    ]), i(v, "cylinder", n.stone, [
      g.radius * 0.85,
      1.15,
      g.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(v, "cylinder", n.light, [
      g.radius,
      0.2,
      g.radius
    ], [
      0,
      1.4,
      0
    ]), i(v, "rock", n.accent, [
      0.28,
      0.58,
      0.28
    ], [
      0,
      1.9,
      0
    ]);
    for (let y = 0; y < 6; y++) {
      const M = y * Math.PI / 3;
      c(v, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(M) * g.radius * 0.86,
        0.8,
        Math.sin(M) * g.radius * 0.86
      ], n.trim);
    }
  }
  if (!a) {
    i(t, "cylinder", n.dark, [
      2.1,
      0.16,
      2.1
    ], [
      0,
      0.08,
      -8
    ]), i(t, "cylinder", n.light, [
      1.95,
      0.14,
      1.95
    ], [
      0,
      0.2,
      -8
    ]), o(t, n.trim, 1.68, 0, -8, 1, !1, 0.28);
    for (const g of [-1, 1]) {
      h(g * 3, -8, 1.2), h(g * 4, -10, 0.85);
      const v = l(t, [
        g * 2.6,
        0.5,
        -6
      ]);
      i(v, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), i(v, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), i(v, "cone", n.trim, [
        0.42,
        0.3,
        0.42
      ], [
        0,
        0.74,
        0
      ]);
    }
  }
  return e.bake(t);
}
function To(e, t, s) {
  const a = e.group(t, [
    0,
    1.3,
    0
  ]);
  a.scale.setScalar(1.5);
  const n = e.group(a), r = e.group(a, [
    0,
    0.5,
    0
  ]), i = e.group(r), l = s === "female", o = l ? 0.225 : 0.255, c = rt.traveler.fabric, u = "#574a40", d = "#d7ab8b", h = "#463f3b";
  e.mesh(n, "sphere", c, [
    o,
    0.28,
    0.155
  ], [
    0,
    -0.04,
    0
  ]), e.mesh(n, "cylinder", c, [
    l ? 0.165 : 0.185,
    0.24,
    0.16
  ], [
    0,
    -0.25,
    0
  ]), e.mesh(n, "cylinder", u, [
    0.196,
    0.06,
    0.175
  ], [
    0,
    -0.24,
    0
  ]), e.mesh(n, "box", "#d5b77b", [
    0.07,
    0.067,
    0.025
  ], [
    0,
    -0.24,
    0.178
  ]), e.mesh(n, "cylinder", d, [
    0.066,
    0.16,
    0.07
  ], [
    0,
    0.265,
    0
  ]), e.mesh(r, "sphere", d, [
    l ? 0.161 : 0.172,
    0.22,
    0.165
  ]), e.mesh(i, "sphere", h, [
    0.18,
    0.125,
    0.173
  ], [
    0,
    0.135,
    -0.022
  ]);
  for (const x of [-1, 1])
    e.mesh(r, "sphere", d, [
      0.027,
      0.042,
      0.027
    ], [
      x * 0.166,
      -0.01,
      0
    ]), e.mesh(r, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      x * 0.061,
      0.016,
      0.155
    ]), e.mesh(r, "box", h, [
      0.047,
      0.012,
      0.014
    ], [
      x * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", h, [
      0.035,
      0.12,
      0.08
    ], [
      x * 0.157,
      0.035,
      -0.036
    ]);
  if (e.mesh(r, "sphere", d, [
    0.027,
    0.041,
    0.028
  ], [
    0,
    -0.025,
    0.16
  ]), e.mesh(r, "box", "#a86e60", [
    0.045,
    9e-3,
    0.012
  ], [
    0,
    -0.1,
    0.148
  ]), l) {
    const x = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let S = 0; S < 4; S++) e.mesh(x, "sphere", h, [
      0.064 - S * 9e-3,
      0.09,
      0.063 - S * 8e-3
    ], [
      S % 2 ? 0.014 : -0.014,
      -S * 0.115,
      0
    ]);
    e.mesh(x, "box", c, [
      0.066,
      0.032,
      0.066
    ], [
      0,
      -0.33,
      0
    ]);
  }
  const p = [], g = [];
  for (const x of [-1, 1]) {
    const S = e.group(a, [
      x * o,
      0.12,
      0
    ]);
    p.push(S), e.mesh(S, "cylinder", c, [
      0.076,
      0.27,
      0.078
    ], [
      0,
      -0.12,
      0
    ]), e.mesh(S, "cylinder", "#e5dfcd", [
      0.081,
      0.085,
      0.081
    ], [
      0,
      -0.27,
      0
    ]), e.mesh(S, "cylinder", d, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(S, "sphere", d, [
      0.06,
      0.075,
      0.047
    ], [
      0,
      -0.45,
      0.015
    ]);
    const b = e.group(a, [
      x * 0.105,
      -0.32,
      0
    ]);
    g.push(b), e.mesh(b, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(b, "cylinder", u, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(b, "sphere", u, [
      0.089,
      0.066,
      0.155
    ], [
      0,
      -0.485,
      0.056
    ]);
  }
  i.removeFromParent();
  const v = [
    n,
    r,
    i,
    ...p,
    ...g
  ].map((x) => e.bake(x));
  r.add(i);
  const y = [];
  a.traverse((x) => {
    x instanceof mt && x.material === e.material(c) && y.push(x);
  });
  let M = null;
  return {
    body: a,
    hand: e.group(p[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(x) {
      if (x !== M) {
        M = x;
        for (const S of y) S.material = e.material(rt[x].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(rt[x].head);
      }
    },
    pose(x, S, b, w, k, E) {
      const L = !k && b ? Math.sin(S * 0.55) * 0.48 : 0;
      a.position.y = 1.3 + (!k && b ? Math.abs(Math.sin(S * 0.55)) * 0.025 : 0), a.rotation.set(!k && w ? 0.16 : 0, Math.PI / 2 - x, 0), g.forEach((j, C) => {
        j.rotation.x = (C ? -1 : 1) * L;
      }), p.forEach((j, C) => {
        j.rotation.set(C && E ? -0.55 : (C ? 1 : -1) * L * 0.65, 0, (C ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      v.forEach((x) => x()), a.removeFromParent();
    }
  };
}
function jo(e, t, s) {
  const a = rt[s], { mesh: n, group: r, shape: i } = e, l = r(t, [
    0,
    0.2,
    -0.23
  ]), o = r(t, [
    0,
    0.328,
    0
  ]), c = r(t, [
    0,
    0.55,
    0
  ]);
  o.scale.set(0.64, 0.78, 0.72);
  const u = a.silhouette === "robe" || a.silhouette === "coat";
  if (i(l, [
    [-0.23, 0],
    [0.23, 0],
    [0.38, u ? -0.68 : -0.48],
    [0.1, u ? -0.77 : -0.59],
    [-0.36, u ? -0.68 : -0.5]
  ], a.fabric), i(l, [
    [-0.04, -0.08],
    [0.04, -0.08],
    [0.055, u ? -0.61 : -0.45],
    [0, u ? -0.68 : -0.5],
    [-0.05, u ? -0.61 : -0.45]
  ], a.metal, [
    0,
    0,
    -0.012
  ]), n(t, "torus", a.fabric, [
    0.2,
    0.15,
    0.19
  ], [
    0,
    0.19,
    0
  ]).rotation.x = Math.PI / 2, a.silhouette === "armor") {
    n(t, "sphere", a.metal, [
      0.295,
      0.18,
      0.27
    ], [
      0,
      -0.15,
      0
    ], !1, 1, !0), n(t, "rock", a.glow, [
      0.065,
      0.09,
      0.025
    ], [
      0,
      -0.07,
      0.285
    ]);
    for (const d of [-1, 1]) n(t, "rock", a.metal, [
      0.15,
      0.12,
      0.17
    ], [
      d * 0.3,
      -0.02,
      0
    ], !1, 1, !0);
  } else u && (n(t, "cone", a.fabric, [
    0.34,
    0.46,
    0.27
  ], [
    0,
    -0.2,
    -0.025
  ]), i(t, [
    [-0.07, 0],
    [0.07, 0],
    [0.14, -0.42],
    [-0.14, -0.42]
  ], a.metal, [
    0,
    -0.02,
    0.245
  ]), n(t, "rock", a.glow, [
    0.055,
    0.065,
    0.035
  ], [
    0,
    -0.12,
    0.285
  ]));
  if (a.head === "helm") {
    n(o, "sphere", a.metal, [
      0.31,
      0.13,
      0.265
    ], [
      0,
      0.44,
      -0.015
    ], !1, 1, !0);
    for (const d of [-1, 1]) n(o, "box", a.metal, [
      0.065,
      0.22,
      0.17
    ], [
      d * 0.285,
      0.29,
      -0.02
    ], !1, 1, !0);
  } else if (a.head === "hat")
    n(o, "cylinder", a.fabric, [
      0.43,
      0.045,
      0.32
    ], [
      0,
      0.46,
      0
    ]), n(o, "cone", a.fabric, [
      0.23,
      0.48,
      0.23
    ], [
      0.055,
      0.7,
      -0.02
    ]).rotation.z = -0.18, n(o, "torus", a.metal, [
      0.245,
      0.245,
      0.24
    ], [
      0,
      0.52,
      -0.01
    ]).rotation.x = Math.PI / 2;
  else if (a.head === "hood") {
    n(o, "sphere", a.fabric, [
      0.345,
      0.35,
      0.265
    ], [
      0,
      0.22,
      -0.12
    ]);
    for (const d of [-1, 1]) n(o, "sphere", a.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      d * 0.285,
      0.19,
      0.055
    ]);
  } else if (a.head === "crown") {
    n(o, "torus", a.metal, [
      0.28,
      0.28,
      0.28
    ], [
      0,
      0.48,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let d = 0; d < 5; d++) {
      const h = d * Math.PI * 2 / 5;
      n(o, "cone", a.metal, [
        0.045,
        0.2,
        0.045
      ], [
        Math.sin(h) * 0.27,
        0.57,
        Math.cos(h) * 0.27
      ]);
    }
  } else if (a.head === "horns") for (const d of [-1, 1]) {
    const h = r(o, [
      d * 0.26,
      0.5,
      -0.06
    ]);
    h.rotation.z = d * -0.45, n(h, "cylinder", a.metal, [
      0.035,
      0.44,
      0.03
    ], [
      0,
      0.18,
      0
    ]);
    for (const p of [0.16, 0.3]) n(h, "cone", a.metal, [
      0.025,
      0.22,
      0.025
    ], [
      d * 0.06,
      p,
      0
    ]).rotation.z = d * -0.8;
  }
  else if (a.head === "goggles") {
    n(o, "torus", "#4c4a42", [
      0.32,
      0.22,
      0.27
    ], [
      0,
      0.4,
      0
    ]).rotation.x = Math.PI / 2;
    for (const d of [-1, 1])
      n(o, "torus", a.metal, [
        0.095,
        0.075,
        0.05
      ], [
        d * 0.115,
        0.39,
        0.24
      ]), n(o, "sphere", a.glow, [
        0.08,
        0.06,
        0.045
      ], [
        d * 0.115,
        0.39,
        0.24
      ]);
  }
  switch (s) {
    case "guardian":
      n(o, "cone", a.fabric, [
        0.08,
        0.28,
        0.1
      ], [
        0,
        0.67,
        -0.06
      ]);
      break;
    case "moonweaver":
      n(o, "crescent", a.metal, [
        0.15,
        0.15,
        0.05
      ], [
        0,
        0.67,
        0.19
      ]).rotation.z = 0.8;
      break;
    case "sovereign":
      for (const d of [-1, 1]) n(t, "cone", a.metal, [
        0.1,
        0.2,
        0.12
      ], [
        d * 0.35,
        0.12,
        -0.03
      ]).rotation.z = d * -0.5;
      break;
    case "ranger":
      n(t, "cylinder", "#79543d", [
        0.095,
        0.46,
        0.085
      ], [
        -0.25,
        0.1,
        -0.31
      ]).rotation.z = -0.35;
      for (let d = 0; d < 3; d++) n(t, "cylinder", a.metal, [
        0.012,
        0.32,
        0.012
      ], [
        -0.21 + d * 0.04,
        0.4,
        -0.29
      ]);
      n(o, "cone", a.glow, [
        0.06,
        0.25,
        0.04
      ], [
        -0.31,
        0.48,
        -0.05
      ]).rotation.z = -0.6;
      break;
    case "paladin":
      for (const d of [-1, 1]) i(t, [
        [0, 0],
        [d * 0.22, 0.24],
        [d * 0.18, -0.05],
        [d * 0.05, -0.12]
      ], a.metal, [
        d * 0.32,
        0.02,
        -0.06
      ]);
      break;
    case "witch":
      for (const d of [-1, 1])
        n(t, "sphere", a.glow, [
          0.05,
          0.065,
          0.04
        ], [
          d * 0.27,
          -0.16,
          0.17
        ]), n(t, "box", a.metal, [
          0.07,
          0.025,
          0.07
        ], [
          d * 0.27,
          -0.09,
          0.17
        ]);
      break;
    case "assassin":
      n(t, "sphere", a.metal, [
        0.21,
        0.045,
        0.055
      ], [
        0,
        0.045,
        0.25
      ]), i(t, [
        [0, 0],
        [0.1, -0.07],
        [0.08, -0.29],
        [0, -0.19]
      ], a.metal, [
        -0.1,
        -0.02,
        0.27
      ]);
      break;
    case "machinist":
      n(t, "box", a.metal, [
        0.38,
        0.4,
        0.18
      ], [
        0,
        0.06,
        -0.35
      ], !1, 1, !0);
      for (const d of [-1, 1]) n(t, "cylinder", "#c99767", [
        0.06,
        0.32,
        0.06
      ], [
        d * 0.14,
        0.21,
        -0.38
      ]);
      n(t, "rock", a.glow, [
        0.09,
        0.14,
        0.05
      ], [
        0,
        0.06,
        -0.46
      ]);
      break;
    case "beastcaller":
      for (let d = -2; d <= 2; d++) n(t, "rock", d % 2 ? a.fabric : a.metal, [
        0.07,
        0.17,
        0.045
      ], [
        d * 0.11,
        -0.07,
        0.21
      ]).rotation.z = d * 0.27;
      break;
    case "frostbound":
      for (let d = -2; d <= 2; d++) n(t, "sphere", "#f6ffff", [
        0.08,
        0.075,
        0.09
      ], [
        d * 0.115,
        5e-3,
        0.13
      ]);
      for (const d of [-1, 1]) n(t, "rock", a.glow, [
        0.09,
        0.36,
        0.09
      ], [
        d * 0.3,
        0.22,
        -0.35
      ]).rotation.z = d * -0.5;
      break;
    case "stargazer":
      n(c, "torus", a.metal, [
        0.43,
        0.43,
        0.43
      ], [
        0,
        0.16,
        0
      ], !1, 1, !0).rotation.x = 0.6;
      for (let d = 0; d < 3; d++) {
        const h = d * Math.PI * 2 / 3;
        n(c, "rock", a.glow, [
          0.04,
          0.075,
          0.04
        ], [
          Math.cos(h) * 0.47,
          0.16,
          Math.sin(h) * 0.47
        ]);
      }
      break;
    case "traveler":
      break;
  }
  return {
    cape: l,
    animate(d, h) {
      c.rotation.y = h ? 0.4 : d * 0.014;
    }
  };
}
function Oo(e, t, s, a, n, r) {
  const { mesh: i, group: l, shape: o } = e, c = "#d6b881", u = "#fff0c1", d = (h, p, g) => {
    for (const v of [-1, 1]) i(s, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      v * g,
      h,
      p
    ], !0);
  };
  switch (n) {
    case "thornheart":
      i(t, "cone", "#576e58", [
        1.6,
        2.9,
        1.3
      ], [
        0,
        1.45,
        0
      ]), i(s, "rock", "#8da17f", [
        0.8,
        1,
        0.65
      ], [
        0,
        2.3,
        0.5
      ]), d(2.6, 1.06, 0.28);
      for (let h = 0; h < 7; h++) {
        const p = h * Math.PI * 2 / 7, g = l(t, [
          Math.cos(p) * 0.8,
          2.6,
          Math.sin(p) * 0.6
        ]);
        g.rotation.z = Math.cos(p) * 0.8, i(g, "cone", "#526451", [
          0.18,
          2.4,
          0.18
        ], [
          0,
          0.9,
          0
        ]), i(g, "rock", r.foliage, [
          0.6,
          0.6,
          0.4
        ], [
          0,
          1.3,
          0
        ]), i(t, "cone", "#67765a", [
          0.3,
          2,
          0.3
        ], [
          Math.cos(p),
          0.28,
          Math.sin(p)
        ]).rotation.z = 1.15;
      }
      i(t, "rock", "#ebbb73", [
        0.35,
        0.55,
        0.2
      ], [
        0,
        1.6,
        1.1
      ]);
      break;
    case "astrologer":
      i(t, "cone", "#777191", [
        0.85,
        2.2,
        0.75
      ], [
        0,
        1.8,
        0
      ]), i(s, "sphere", "#c3c1db", [
        0.5,
        0.6,
        0.42
      ], [
        0,
        3.1,
        0
      ]), i(s, "box", "#4c4469", [
        0.94,
        0.18,
        0.16
      ], [
        0,
        3.2,
        0.38
      ]);
      for (const h of [
        1.35,
        1.8,
        2.25
      ]) i(a, "torus", c, [
        h,
        h,
        h
      ], [
        0,
        2.2,
        0
      ], !1, 1, !0).rotation.set(h * 0.7, 0.5, h);
      i(a, "sphere", "#d6dbff", [
        0.23,
        0.23,
        0.23
      ], [
        1.8,
        2.3,
        0.3
      ], !0);
      break;
    case "phoenix":
      i(t, "rock", "#ac6249", [
        0.65,
        1.3,
        0.7
      ], [
        0,
        1.8,
        0
      ]), i(s, "sphere", "#e4ac68", [
        0.4,
        0.5,
        0.43
      ], [
        0,
        3.15,
        0.25
      ]), d(3.25, 0.63, 0.18), i(s, "cone", c, [
        0.18,
        0.55,
        0.15
      ], [
        0,
        3.03,
        0.76
      ]).rotation.x = Math.PI / 2;
      for (const h of [-1, 1]) {
        for (let p = 0; p < 5; p++) o(a, [
          [0, 0],
          [h * (2.4 - p * 0.25), 0.95 - p * 0.22],
          [h * (2 - p * 0.24), -0.1 - p * 0.24],
          [0, -0.45]
        ], p % 2 ? "#e2a465" : "#d47c4f", [
          h * 0.4,
          2.5,
          -0.1 - p * 0.06
        ]);
        i(t, "cone", "#e3a25b", [
          0.18,
          1.5,
          0.25
        ], [
          h * 0.3,
          0.6,
          -0.6
        ]).rotation.x = -0.8;
      }
      break;
    case "forgemaster":
      i(t, "box", "#675756", [
        1.8,
        2.1,
        1.2
      ], [
        0,
        1.6,
        0
      ]), i(t, "box", "#9b6148", [
        1.2,
        1.6,
        0.17
      ], [
        0,
        1.55,
        0.7
      ]), i(s, "cylinder", "#b08563", [
        0.7,
        0.7,
        0.6
      ], [
        0,
        3.05,
        0
      ]), i(s, "box", "#ffd18c", [
        0.65,
        0.1,
        0.08
      ], [
        0,
        3.12,
        0.63
      ], !0);
      for (const h of [-1, 1])
        i(t, "cylinder", r.dark, [
          0.36,
          0.8,
          0.38
        ], [
          h * 0.55,
          0.5,
          0
        ]), i(t, "sphere", "#c9976e", [
          0.65,
          0.55,
          0.55
        ], [
          h * 1.05,
          2.5,
          0
        ], !1, 1, !0);
      a.position.set(1.4, 1.7, 0.4), i(a, "cylinder", "#765948", [
        0.1,
        2.3,
        0.1
      ]), i(a, "box", "#444e57", [
        1.8,
        0.8,
        0.9
      ], [
        0,
        1.3,
        0
      ]), i(a, "box", "#ffc482", [
        0.5,
        0.72,
        0.95
      ], [
        0,
        1.3,
        0
      ]);
      break;
    case "colossus":
      i(t, "sphere", "#565d63", [
        1.45,
        1.6,
        0.95
      ], [
        0,
        2.15,
        0
      ]), i(t, "torus", "#b68d66", [
        0.78,
        0.78,
        0.45
      ], [
        0,
        2.25,
        0.82
      ], !1, 1, !0), i(t, "sphere", "#ffb77b", [
        0.57,
        0.57,
        0.2
      ], [
        0,
        2.25,
        1
      ], !0), i(s, "box", "#818883", [
        1.3,
        0.5,
        1
      ], [
        0,
        3.7,
        0
      ]), d(3.73, 0.51, 0.3);
      for (const h of [-1, 1])
        i(t, "box", "#818883", [
          0.8,
          1.2,
          0.95
        ], [
          h * 0.8,
          0.6,
          0
        ]), i(a, "cylinder", "#6b7375", [
          0.65,
          2.1,
          0.65
        ], [
          h * 1.75,
          1.85,
          0
        ]), i(a, "box", "#b29370", [
          1.1,
          0.8,
          1.1
        ], [
          h * 1.75,
          0.8,
          0.15
        ]);
      break;
    case "frostqueen":
      i(t, "cone", "#82a9c1", [
        1.1,
        2.7,
        0.95
      ], [
        0,
        1.8,
        0
      ]), i(s, "sphere", "#d5e9ec", [
        0.45,
        0.58,
        0.4
      ], [
        0,
        3.35,
        0
      ]), d(3.4, 0.39, 0.18);
      for (let h = -2; h <= 2; h++) i(s, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(h) * 0.08,
        0.11
      ], [
        h * 0.18,
        3.94,
        0.02
      ]);
      for (const h of [-1, 1]) o(t, [
        [0, 0],
        [h * 0.95, 0.8],
        [h * 0.5, -1.3],
        [0, -0.5]
      ], "#bddeeb", [
        h * 0.5,
        2.7,
        -0.35
      ]);
      a.position.set(1.05, 1.9, 0), i(a, "cylinder", "#aec9d5", [
        0.045,
        2.5,
        0.045
      ]), i(a, "rock", "#ddfbff", [
        0.28,
        0.5,
        0.2
      ], [
        0,
        1.5,
        0
      ]);
      break;
    case "leviathan":
      for (let h = 0; h < 5; h++) {
        const p = 1 - h * 0.14;
        i(t, "sphere", h % 2 ? "#658c9c" : "#7da9b8", [
          p,
          p * 0.8,
          p
        ], [
          Math.sin(h * 0.6) * 0.4,
          0.8,
          0.5 - h * 0.8
        ]), i(t, "cone", "#d7e9dc", [
          0.2 * p,
          0.6 * p,
          0.25 * p
        ], [
          0,
          1.5 - h * 0.13,
          0.4 - h * 0.7
        ]);
      }
      i(s, "rock", "#7da9b8", [
        1.05,
        0.7,
        0.85
      ], [
        0,
        1.05,
        1
      ]), d(1.32, 1.65, 0.43);
      for (const h of [-1, 1])
        o(a, [
          [0, 0],
          [h * 1.4, 0.1],
          [h * 0.8, -0.7]
        ], "#b6d6d8", [
          h * 0.7,
          0.7,
          0
        ]), i(s, "cone", "#e4efde", [
          0.15,
          1,
          0.15
        ], [
          h * 0.72,
          1.65,
          1.2
        ]).rotation.z = h * -0.7;
      break;
    case "archivist":
      i(t, "cone", "#685881", [
        0.95,
        2.6,
        0.8
      ], [
        0,
        2,
        0
      ]), i(s, "rock", "#e7dcc4", [
        0.45,
        0.62,
        0.38
      ], [
        0,
        3.6,
        0
      ]), d(3.65, 0.38, 0.16);
      for (let h = 0; h < 5; h++) {
        const p = h * Math.PI * 2 / 5, g = l(a, [
          Math.cos(p) * 1.7,
          2.5 + Math.sin(p) * 0.6,
          Math.sin(p) * 1.3
        ]);
        g.rotation.z = p * 0.3, i(g, "box", "#baa481", [
          0.55,
          0.72,
          0.14
        ]), i(g, "box", "#f1e4c6", [
          0.48,
          0.65,
          0.15
        ], [
          0,
          0,
          0.03
        ]);
      }
      i(s, "torus", c, [
        0.75,
        0.75,
        0.75
      ], [
        0,
        4.25,
        0
      ]).rotation.x = Math.PI / 2;
      break;
    case "voidknight":
      i(t, "box", "#51486f", [
        0.95,
        1.5,
        0.65
      ], [
        0,
        1.75,
        0
      ]), i(s, "rock", "#b8afcc", [
        0.43,
        0.66,
        0.4
      ], [
        0,
        2.95,
        0
      ]), d(3, 0.4, 0.17);
      for (const h of [-1, 1]) {
        i(t, "box", "#867995", [
          0.33,
          0.9,
          0.4
        ], [
          h * 0.3,
          0.55,
          0
        ]), i(t, "rock", "#b8afcc", [
          0.5,
          0.28,
          0.38
        ], [
          h * 0.6,
          2.4,
          0
        ]);
        const p = l(a, [
          h * 0.85,
          1.8,
          0.2
        ]);
        p.rotation.z = h * -0.25, o(p, [
          [-0.07, 0],
          [0.15, 0],
          [0.3, 1.5],
          [0.12, 2.25],
          [-0.13, 1.7]
        ], "#dfc9ff");
      }
      o(t, [
        [-0.4, 0],
        [0.4, 0],
        [0.85, -2.1],
        [0, -1.4],
        [-0.65, -2.3]
      ], "#4a4266", [
        0,
        2.45,
        -0.4
      ]);
      break;
  }
}
function Zo(e, t) {
  const s = e.group(t), a = e.group(s), n = [
    [0, 0.35],
    [0.16, 0.32],
    [0.26, 0.22],
    [0.25, -0.02],
    [0.19, -0.18],
    [0.09, -0.29],
    [0, -0.34],
    [-0.09, -0.29],
    [-0.19, -0.18],
    [-0.25, -0.02],
    [-0.26, 0.22],
    [-0.16, 0.32]
  ], r = e.shape(a, n, je.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, je.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, je.enamel, [
    0,
    0,
    -0.018
  ]).scale.set(0.87, 0.87, 1);
  for (const c of [-0.025, 0.09])
    e.shape(a, [
      [0, 0.24],
      [0.08, 0.12],
      [0.045, -0.07],
      [0, -0.2],
      [-0.045, -0.07],
      [-0.08, 0.12]
    ], je.silver, [
      0,
      0,
      c
    ]), e.mesh(a, "rock", je.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      c + Math.sign(c) * 0.014
    ], !1, 1, !0);
  let l = 0, o = -1;
  return s.visible = !1, { update(c, u, d, h, p) {
    const g = u ? 1 : 0, v = Math.max(0, Math.min(4, h - o));
    l = p || o < 0 || h < o ? g : l + (g - l) * (1 - Math.exp(-v * 0.85)), o = h, s.visible = c === "blade" || u || l > 0.04, s.position.set(-0.4 + l * 0.12, -0.1 + l * 0.3, 0.17 + l * 0.25), s.rotation.set(0.12 - l * 0.22, 0.15 - l * 0.3, -0.16 + l * 0.22), a.scale.setScalar(0.94 + l * 0.07), r.material = e.material(d ? je.parry : c === "blade" ? je.block : je.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : je.enamel);
  } };
}
function Uo(e, t) {
  const s = e.group(t), a = new lr({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new mn(je.ward) },
      impact: { value: 0 }
    },
    vertexShader: `varying vec3 surfaceNormal; varying vec3 viewDirection;
            void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); surfaceNormal = normalMatrix * normal;
                viewDirection = -p.xyz; gl_Position = projectionMatrix * p; }`,
    fragmentShader: `uniform vec3 tint; uniform float impact; varying vec3 surfaceNormal; varying vec3 viewDirection;
            void main() { float rim = pow(1.0 - abs(dot(normalize(surfaceNormal), normalize(viewDirection))), 2.2);
                gl_FragColor = vec4(mix(tint, vec3(1.0), rim * .4 + impact * .3), .045 + rim * .65 + impact * .16);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }`
  }), n = new mt(e.geometries.sphere, a);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, s.add(n), s.visible = !1, {
    update(r, i) {
      s.visible = !!r && r.ward > 0, !(!r || !s.visible) && (s.position.set(r.x, 0, r.y), a.uniforms.impact.value = i, s.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), s.removeFromParent();
    }
  };
}
function No(e, t) {
  const s = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  s.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const d = e.group(s);
    e.mesh(d, "box", Xe.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(d, "box", Xe.page, [
      0.22,
      0.06,
      0.38
    ], [
      u * 0.12,
      0.04,
      0
    ]), a.push(d);
  }
  const n = e.group(s, [
    0,
    0.085,
    0
  ]);
  e.mesh(n, "box", "#fffced", [
    0.22,
    0.012,
    0.37
  ], [
    0.11,
    0,
    0
  ]);
  const r = e.mesh(s, "rock", Xe.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(s, "torus", Xe.crest, [
    0.17,
    0.17,
    0.17
  ], [
    0,
    0.31,
    0
  ], !0, 0.65);
  i.rotation.x = Math.PI / 2;
  let l = 0, o = 0.15, c = -1;
  return { update(u, d, h, p) {
    const g = p || c < 0 || h < c ? 1 : 1 - Math.exp(-Math.min(4, h - c) * 0.5);
    c = h, l += ((u ? 1 : 0) - l) * g, o += ((d ? 0.5 : u ? 0.28 : 0.15) - o) * g, s.position.y = o, s.rotation.x = -0.45 + (o - 0.15) * 0.7, a[0].rotation.z = -0.65 + l * 0.5, a[1].rotation.z = 0.65 - l * 0.5, n.rotation.z = p ? 0.2 : 0.2 + l * (Math.sin(h * 0.18) + 1) * 1.3, r.scale.set(0.07 + l * 0.025, 0.1 + l * 0.06, 0.07 + l * 0.025), i.visible = u, p || (r.rotation.y = h * 0.08);
  } };
}
function Ds(e, t, s = 1) {
  const a = e.group(t);
  a.scale.setScalar(s), e.shape(a, [
    [0.02, -0.44],
    [0.11, -0.41],
    [0.27, -0.2],
    [0.29, 0.12],
    [0.18, 0.42],
    [0.04, 0.51],
    [0.1, 0.28],
    [0.14, 0],
    [0.08, -0.25]
  ], "#ceac6e", [
    0,
    0,
    0.06
  ]), e.mesh(a, "box", "#f5f3dc", [
    0.012,
    0.94,
    0.015
  ], [
    0.04,
    0.03,
    0.07
  ]), e.mesh(a, "box", "#705444", [
    0.09,
    0.18,
    0.09
  ], [
    0.12,
    0,
    0.06
  ]);
}
function Fs(e, t, s) {
  const a = e.group(t), n = To(e, a, s), r = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), l = e.group(r), o = n.hand, c = e.group(l), u = Zo(e, l);
  let d = null, h = -1, p = Math.PI / 2, g = null, v = null, y = null, M = 0, x = 0;
  function S(b, w) {
    if (!(b === v && w === y)) {
      if (v = b, y = w, c.clear(), o.clear(), d = null, g = jo(e, c, y), n.dress(y), v === "blade")
        e.mesh(o, "cylinder", "#624d42", [
          0.035,
          0.28,
          0.035
        ], [
          0,
          -0.08,
          0.06
        ]), e.mesh(o, "box", "#d4b470", [
          0.32,
          0.05,
          0.11
        ], [
          0,
          0.07,
          0.06
        ], !1, 1, !0), e.shape(o, [
          [-0.07, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83],
          [-0.07, 0.65]
        ], "#f5f8ef", [
          0,
          0,
          0.07
        ], 0.018), e.shape(o, [
          [0, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83]
        ], "#9cc6ce", [
          0,
          0,
          0.094
        ]);
      else if (v === "bow") Ds(e, o);
      else if (v === "staff")
        e.mesh(o, "cylinder", "#796889", [
          0.035,
          1.12,
          0.035
        ], [
          0,
          0.18,
          0.04
        ]), e.mesh(o, "torus", "#d8bc80", [
          0.19,
          0.24,
          0.18
        ], [
          0,
          0.85,
          0.04
        ], !1, 1, !0), e.mesh(o, "rock", "#b9ecff", [
          0.11,
          0.18,
          0.1
        ], [
          0,
          0.85,
          0.04
        ]);
      else if (v === "daggers") for (const k of [-1, 1]) {
        const E = e.group(o, [
          k < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(E, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(E, [
          [-0.045, 0.1],
          [0.05, 0.1],
          [0.035, 0.34],
          [0, 0.47],
          [-0.06, 0.27]
        ], "#dce9ed", [
          0,
          0,
          0.03
        ]);
      }
      else if (v === "grimoire") d = No(e, o);
      else if (v === "cannon") {
        const k = e.group(o, [
          0.02,
          0.08,
          0.17
        ]);
        k.rotation.x = Math.PI / 2, e.mesh(k, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(k, "torus", "#d2a96c", [
          0.15,
          0.15,
          0.15
        ], [
          0,
          0.39,
          0
        ], !1, 1, !0).rotation.x = Math.PI / 2, e.mesh(o, "box", "#906749", [
          0.22,
          0.16,
          0.2
        ], [
          0,
          -0.1,
          0.13
        ]);
      }
    }
  }
  return {
    root: a,
    update(b, w, k, E, L, j, C = !1) {
      S(w, k), u.update(w, !!b?.shield, !!b?.guard, E, L);
      const U = L || h < 0 || E < h ? 1 : 1 - Math.exp(-Math.min(4, E - h) * 0.65);
      h = E;
      const T = j ? Math.PI / 2 + 0.23 : b?.facing ?? Math.PI / 2;
      p += Math.atan2(Math.sin(T - p), Math.cos(T - p)) * U;
      const H = !!b && Math.abs(b.x - M) + Math.abs(b.y - x) > 1e-3, Y = !!b?.dashTime;
      a.position.set(b?.x ?? 0, j ? 0.3 : 0, b?.y ?? -8), a.scale.setScalar(j ? 1.65 : 1), n.pose(p, E, H, Y, L, !!b?.swing || C), g.cape.rotation.x = L ? -0.15 : -0.15 - (H ? 0.5 : 0.06) - Math.sin(E * 0.15) * 0.12, g.animate(E, L);
      const F = b?.swing && !L ? Math.sin(b.swing / (w === "cannon" ? 16 : 9) * Math.PI) : 0;
      o.rotation.z += ((C ? -0.3 : -0.2 - F * 1.3) - o.rotation.z) * U, o.rotation.x += ((C ? -0.25 : 0.1 + F * 0.6) - o.rotation.x) * U, d && d.update(!!b?.resonance, C, E, L), i.scale.set(0.6 + (Y ? 0.25 : 0), 0.6, 1), b && (M = b.x, x = b.y);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function _n(e, t, s, a) {
  const { mesh: n, group: r } = e, i = r(t), l = r(i), o = r(l), c = r(l), u = [], d = _e(s), h = he[s].radius;
  e.ring(i, "#1d3540", h * 1.15, 0, 0, 0.16, !0);
  const p = "#cfad70", g = "#fff0b0", v = a.dark;
  function y(C, U, T) {
    const H = r(l, [
      C,
      T,
      U
    ]);
    n(H, "box", v, [
      0.32,
      T,
      0.42
    ], [
      0,
      -T / 2,
      0
    ]), n(H, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -T + 0.11,
      0.1
    ]), u.push(H);
  }
  function M(C, U, T = "#d9e8df") {
    n(C, "box", p, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(C, "box", v, [
      0.11,
      0.4,
      0.11
    ]), n(C, "box", T, [
      0.2,
      U,
      0.13
    ], [
      0,
      U / 2 + 0.35,
      0
    ], !1, 1, !0), n(C, "cone", T, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      U + 0.5,
      0
    ]);
  }
  if (s === "charger") {
    n(l, "rock", a.stone, [
      0.58,
      0.58,
      0.9
    ], [
      0,
      0.7,
      0
    ]), n(c, "rock", v, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const C of [-0.27, 0.27]) {
      const U = n(c, "cone", p, [
        0.15,
        0.7,
        0.15
      ], [
        C,
        1.15,
        0.9
      ]);
      U.rotation.x = 0.55, n(c, "sphere", g, [
        0.05,
        0.04,
        0.06
      ], [
        C,
        0.82,
        1.02
      ], !0), y(C, -0.42, 0.45), y(C, 0.45, 0.45);
    }
    for (let C = 0; C < 3; C++) n(l, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + C * 0.4
    ]);
  } else if (s === "weaver") {
    n(l, "cone", "#63689d", [
      1.45,
      3,
      1.2
    ], [
      0,
      2.1,
      0
    ]), n(l, "cone", a.light, [
      0.8,
      1.8,
      0.65
    ], [
      0,
      2.65,
      0.3
    ]), n(c, "sphere", v, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const C = n(c, "crescent", p, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    C.rotation.z = 0.87;
    for (const U of [-0.23, 0.23]) n(c, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      U,
      4.08,
      0.45
    ], !0);
    for (const U of [-1, 1]) {
      const T = r(l, [
        U * 0.8,
        3.3,
        0
      ]);
      T.rotation.z = U * 0.65, n(T, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(T, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), u.push(T);
    }
    for (let U = 0; U < 5; U++) {
      const T = U / 5 * Math.PI * 2, H = n(o, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(T) * 1.95,
        3.3 + Math.sin(T) * 1.1,
        -0.3
      ]);
      H.rotation.z = T;
    }
  } else if (s === "king") {
    y(-0.5, 0, 0.8), y(0.5, 0, 0.8), n(l, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(l, "box", v, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(l, "rock", p, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const C of [-1, 1]) n(l, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      C * 0.95,
      2.95,
      0
    ]);
    n(c, "sphere", v, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(c, "box", g, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(c, "torus", p, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let C = 0; C < 7; C++) {
      const U = C * Math.PI * 2 / 7;
      n(c, "cone", p, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(U) * 0.78,
        4.85,
        Math.sin(U) * 0.78
      ]);
    }
    o.position.set(1.55, 1.35, 0.2), o.rotation.z = -0.3, M(o, 3.4, "#f6dc9f"), n(l, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (s === "warden") {
    y(-0.65, 0.05, 0.85), y(0.65, 0.05, 0.85), n(l, "cylinder", v, [
      1.1,
      1.85,
      0.8
    ], [
      0,
      1.9,
      0
    ]), n(l, "box", a.stone, [
      1.1,
      1.45,
      0.35
    ], [
      0,
      2,
      0.72
    ]), n(l, "rock", a.accent, [
      0.28,
      0.4,
      0.14
    ], [
      0,
      2.1,
      0.94
    ]);
    for (const U of [-1, 1])
      n(l, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        U * 1.03,
        2.7,
        0
      ]), n(l, "box", p, [
        0.7,
        0.1,
        0.8
      ], [
        U * 1.08,
        2.45,
        0.1
      ], !1, 1, !0);
    n(c, "sphere", a.stone, [
      0.73,
      0.77,
      0.63
    ], [
      0,
      3.2,
      0
    ]), n(c, "box", v, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(c, "box", g, [
      0.74,
      0.095,
      0.05
    ], [
      0,
      3.22,
      0.66
    ], !0), n(c, "cone", a.foliage, [
      0.27,
      1.1,
      0.5
    ], [
      0,
      4,
      -0.2
    ]);
    const C = r(l, [
      -1.32,
      1.5,
      0.6
    ]);
    n(C, "box", v, [
      1.2,
      1.8,
      0.25
    ]), n(C, "box", p, [
      1,
      1.58,
      0.28
    ]), n(C, "box", a.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(C, "rock", a.light, [
      0.28,
      0.4,
      0.1
    ], [
      0,
      0.1,
      0.22
    ]), o.position.set(1.5, 1.8, 0.25), n(o, "cylinder", "#766450", [
      0.1,
      2.5,
      0.1
    ]), n(o, "box", v, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(o, "box", p, [
      0.24,
      0.96,
      0.94
    ], [
      0,
      1.4,
      0
    ], !1, 1, !0), n(o, "box", a.light, [
      0.22,
      0.77,
      0.74
    ], [
      0.65,
      1.4,
      0
    ]);
  } else if (_e(s)) Oo(e, l, c, o, s, a);
  else if (s === "wisp")
    n(l, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(c, "torus", p, [
      0.48,
      0.6,
      0.4
    ], [
      0,
      1,
      0
    ]), n(c, "sphere", "#f7f5e8", [
      0.12,
      0.13,
      0.1
    ], [
      0,
      1.05,
      0.31
    ], !0), n(l, "cone", a.light, [
      0.16,
      0.6,
      0.16
    ], [
      0,
      0.35,
      0
    ]).rotation.z = Math.PI;
  else if (s === "stalker") {
    n(l, "sphere", a.dark, [
      0.4,
      0.35,
      0.65
    ], [
      0,
      0.55,
      0
    ]), n(c, "rock", a.foliage, [
      0.33,
      0.38,
      0.32
    ], [
      0,
      0.75,
      0.5
    ]);
    for (const C of [-1, 1])
      y(C * 0.27, -0.25, 0.35), n(c, "cone", p, [
        0.09,
        0.35,
        0.09
      ], [
        C * 0.21,
        1.09,
        0.42
      ]), n(c, "sphere", g, [
        0.05,
        0.04,
        0.035
      ], [
        C * 0.15,
        0.8,
        0.77
      ], !0), n(o, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        C * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (s === "bomber")
    y(-0.22, 0, 0.45), y(0.22, 0, 0.45), n(l, "sphere", "#85654c", [
      0.5,
      0.6,
      0.4
    ], [
      0,
      0.95,
      0
    ]), n(c, "sphere", a.stone, [
      0.35,
      0.38,
      0.31
    ], [
      0,
      1.62,
      0
    ]), n(c, "box", a.dark, [
      0.63,
      0.15,
      0.08
    ], [
      0,
      1.69,
      0.3
    ]), n(l, "cylinder", "#ac7b54", [
      0.3,
      0.75,
      0.3
    ], [
      0,
      1.05,
      -0.4
    ]), n(o, "sphere", "#404c57", [
      0.25,
      0.25,
      0.25
    ], [
      0.56,
      1.1,
      0.18
    ]), n(o, "cone", "#ffca88", [
      0.07,
      0.3,
      0.07
    ], [
      0.56,
      1.41,
      0.18
    ]);
  else {
    const C = s === "priest", U = s === "guard";
    if (C ? n(l, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (y(-0.22, 0, 0.5), y(0.22, 0, 0.5), n(l, "box", v, [
      0.72,
      0.85,
      0.52
    ], [
      0,
      0.92,
      0
    ])), n(l, "box", a.stone, [
      0.5,
      0.55,
      0.15
    ], [
      0,
      1,
      0.3
    ]), n(c, "sphere", a.stone, [
      0.43,
      0.45,
      0.38
    ], [
      0,
      1.63,
      0
    ]), n(c, "box", v, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(c, "box", g, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), C)
      n(c, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), o.position.set(0.52, 1, 0.1), n(o, "cylinder", p, [
        0.04,
        1.6,
        0.04
      ]), n(o, "rock", "#d1dcff", [
        0.22,
        0.32,
        0.22
      ], [
        0,
        0.95,
        0
      ]);
    else {
      n(c, "box", a.foliage, [
        0.12,
        0.38,
        0.55
      ], [
        0,
        2,
        -0.07
      ]);
      for (const T of [-1, 1]) n(l, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        T * 0.45,
        1.22,
        0
      ]);
      o.position.set(0.54, 1, 0.2), s === "archer" ? Ds(e, o, 1.3) : (o.rotation.z = -0.3, M(o, 0.75)), U && (n(l, "box", p, [
        0.85,
        1.1,
        0.18
      ], [
        -0.4,
        0.95,
        0.46
      ]), n(l, "box", a.foliage, [
        0.72,
        0.92,
        0.22
      ], [
        -0.4,
        0.95,
        0.47
      ]));
    }
  }
  const x = r(i, [
    0,
    d ? 5.5 : s === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(x, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const S = n(x, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), b = [];
  l.traverse((C) => {
    C instanceof mt && b.push({
      mesh: C,
      material: C.material
    });
  });
  let w = 0, k = -100, E = 0, L = 0;
  const j = o.rotation.z;
  return {
    root: i,
    bar: x,
    update(C, U, T) {
      const H = Math.abs(C.x - E) + Math.abs(C.y - L) > 5e-3;
      E = C.x, L = C.y, w && !C.windup && (k = U), w = C.windup;
      const Y = C.windup ? 1 - C.windup / he[C.kind].windup : 0, F = Math.max(0, 1 - (U - k) / 10);
      i.position.set(C.x, 0, C.y), l.rotation.y = Math.PI / 2 - C.angle, l.position.y = T ? 0 : s === "weaver" || s === "priest" ? 0.13 + Math.sin(U * 0.055) * 0.1 : H ? Math.abs(Math.sin(U * 0.3)) * 0.055 : 0, l.rotation.x = T ? 0 : -Y * 0.16 + F * 0.2, c.rotation.z = !T && s === "king" ? Math.sin(U * 0.035) * 0.08 : 0, o.rotation.x = T ? 0 : Y * -1.3 + F * 1.4, o.rotation.z = j + (T ? 0 : Y * -0.35);
      for (let Z = 0; Z < u.length; Z++) u[Z].rotation.x = !T && H ? Math.sin(U * 0.32 + Z * Math.PI) * 0.28 : 0;
      for (const Z of b) Z.mesh.material = C.marked > 2 && !T ? e.material("#fff6dd") : Z.material;
      x.visible = !d && C.hp < C.maxHp, S.scale.x = C.hp / C.maxHp, S.position.x = (C.hp / C.maxHp - 1) * 0.5;
    }
  };
}
var ie = {
  danger: "#c34740",
  warning: "#ec8754",
  magic: "#8bd9f2",
  frost: "#addffc",
  gold: "#fff0bb",
  heal: "#75dbb0",
  fire: "#f0ad55"
};
function Do(e, t) {
  const s = /* @__PURE__ */ new Map();
  function a(r, i, l = 1, o = !1) {
    const c = Math.max(0.1, Math.min(1, Math.round(l * 10) / 10)), u = `${r}/${i}/${c}/${o}`;
    let d = s.get(u);
    d || (d = {
      list: [],
      used: 0
    }, s.set(u, d));
    let h = d.list[d.used++];
    return h || (h = e.mesh(t, r, i, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !o, c), d.list.push(h)), h.visible = !0, h.rotation.set(0, 0, 0), h.scale.set(1, 1, 1), h;
  }
  function n(r, i, l, o, c, u = 1, d = 0.09) {
    const h = a(r, i, u);
    return h.position.set(o, d, c), h.scale.set(l, l, 1), h.rotation.x = -Math.PI / 2, h;
  }
  return { update(r, i) {
    for (const o of s.values())
      o.used = 0, o.list.forEach((c) => c.visible = !1);
    if (!r) return;
    const l = r.player;
    if (n("ring", "#f2f6e2", 0.64, l.x, l.y, 0.8), l.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const c = a("cone", ie.gold, 0.7 - o * 0.15);
      c.position.set(l.x - Math.cos(l.dashAngle) * o * 0.43, 0.45, l.y - Math.sin(l.dashAngle) * o * 0.43), c.scale.set(0.13, l.dashTime / 8 * 1.7, 0.13), c.rotation.set(0, -l.dashAngle, -Math.PI / 2);
    }
    if (!r.boss && (r.encounter === "siege" || r.encounter === "ritual")) {
      const o = r.objective;
      r.encounter === "ritual" && (n("disc", ie.magic, 2.5, o.x, o.y, 0.12), n("ring", ie.magic, 2.5, o.x, o.y), n("ring", ie.gold, 2.2, o.x, o.y, 0.8));
      const c = a("cylinder", "#526b79");
      c.position.set(o.x, 0.3, o.y), c.scale.set(0.5, 0.6, 0.5);
      const u = a("rock", r.encounter === "siege" ? ie.fire : ie.magic);
      if (u.position.set(o.x, 1, o.y), u.scale.set(0.23, 0.5, 0.23), r.encounter === "siege") {
        u.position.y = 1.35, u.scale.set(0.4, 0.85, 0.4);
        const d = a("cone", ie.gold, 0.8);
        d.position.set(o.x, 1.4, o.y), d.scale.set(0.2, 0.85, 0.2), n("ring", ie.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (u.rotation.y = r.tick * 0.025);
    }
    for (const o of r.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", ie.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const c = a("cylinder", "#687c81");
          c.position.set(o.x, 0.25, o.y), c.scale.set(0.4, 0.5, 0.4);
          const u = a("box", "#bd9a68");
          u.position.set(o.x, 0.65, o.y), u.scale.set(0.9, 0.2, 0.25), u.rotation.y = -o.angle;
          const d = a("sphere", ie.magic);
          d.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const c = o.kind === "familiar" && l.resonance > 0, u = c ? 1.5 : 1, d = o.kind === "shade" ? "#a6acd8" : c ? Xe.empowered : Xe.familiar, h = i ? 0 : Math.sin(r.tick * 0.1 + o.id) * 0.08, p = a("sphere", d, 1, !0);
          p.position.set(o.x, 0.55 * u + h, o.y), p.scale.set(0.3 * u, 0.36 * u, 0.3 * u);
          for (const v of [-1, 1]) {
            const y = a("cone", d, 1, !0);
            y.position.set(o.x + v * 0.2 * u, 0.93 * u + h, o.y), y.scale.set(0.08 * u, 0.22 * u, 0.08 * u);
          }
          const g = a("sphere", "#35475b");
          if (g.position.set(o.x + Math.cos(o.angle) * 0.28 * u, 0.63 * u + h, o.y + Math.sin(o.angle) * 0.28 * u), g.scale.setScalar(0.07 * u), c) {
            const v = a("torus", Xe.crest, 1, !0);
            v.position.set(o.x, 1.45 + h, o.y), v.rotation.x = Math.PI / 2, v.scale.setScalar(0.32);
            for (let y = 0; y < 3; y++) {
              const M = y * Math.PI * 2 / 3, x = a("rock", Xe.crest, 1, !0);
              x.position.set(o.x + Math.cos(M) * 0.32, 1.55 + h, o.y + Math.sin(M) * 0.32), x.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of r.enemies) {
      if (_e(o.kind) && o.phase > 1) {
        const c = he[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? ie.fire : ie.magic, c, o.x, o.y, 0.65), !i) for (let u = 0; u < o.phase + 2; u++) {
          const d = r.tick * 0.025 + u * Math.PI * 2 / (o.phase + 2), h = a("rock", o.kind === "king" ? ie.fire : ie.magic, 0.8);
          h.position.set(o.x + Math.cos(d) * c, 0.55 + Math.sin(d * 2) * 0.2, o.y + Math.sin(d) * c), h.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const c = 1 - o.windup / he[o.kind].windup;
        if (n("ring", ie.warning, he[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const u = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), d = a("box", ie.danger, 0.3);
          d.scale.set(0.75, 0.035, u), d.position.set(o.x + Math.cos(o.angle) * u / 2, 0.09, o.y + Math.sin(o.angle) * u / 2), d.rotation.y = Math.PI / 2 - o.angle, n("ring", ie.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const u = Math.hypot(o.target.x - o.x, o.target.y - o.y), d = a("box", ie.warning, 0.6);
          d.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), d.scale.set(u, 0.03, 0.09), d.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", ie.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", ie.danger, he[o.kind].reach, o.target.x, o.target.y, 0.15 + c * 0.2), n("ring", ie.danger, he[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", ie.frost, he[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", ie.gold, he[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let c = 0; c < 3; c++) {
        const u = a("rock", ie.fire, 0.8);
        u.position.set(o.x + Math.sin(c * 2) * 0.3, 0.35 + (r.tick + c * 7) % 20 / 18, o.y + Math.cos(c * 2) * 0.3), u.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of r.hazards) {
      const c = o.friendly ? o.kind === "fire" ? ie.fire : ie.magic : ie.danger;
      if (o.kind === "beam") {
        const u = a("box", c, o.wait ? 0.3 : 0.75);
        u.position.set(o.x + Math.cos(o.angle) * o.length / 2, 0.11, o.y + Math.sin(o.angle) * o.length / 2), u.scale.set(o.length, 0.04, o.width * 2), u.rotation.y = -o.angle;
        for (const d of [0, o.length]) n("disc", c, o.width, o.x + Math.cos(o.angle) * d, o.y + Math.sin(o.angle) * d, o.wait ? 0.3 : 0.75);
        continue;
      }
      if (o.kind === "ring") {
        n("ring", c, o.inner, o.x, o.y), n("ring", c, o.radius, o.x, o.y);
        for (let u = 1; u <= 4; u++) n("ring", c, o.inner + (o.radius - o.inner) * u / 5, o.x, o.y, o.wait ? 0.35 : 0.8);
        continue;
      }
      if (n("disc", c, o.radius, o.x, o.y, o.wait ? 0.2 : 0.4), n("ring", c, o.radius, o.x, o.y), o.wait) {
        n("ring", c, o.radius * (1 - Math.min(1, o.wait / 45)), o.x, o.y, 0.7);
        const u = a("box", c, 0.7);
        u.position.set(o.x, 0.12, o.y), u.scale.set(0.08, 0.02, 0.6);
        const d = a("box", c, 0.7);
        d.position.copy(u.position), d.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", ie.gold, o.radius * (0.7 + Math.sin(r.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let u = 0; u < 6; u++) {
          const d = u * Math.PI / 3, h = a("cone", c, 0.7);
          h.position.set(o.x + Math.cos(d) * o.radius * 0.65, 0.45, o.y + Math.sin(d) * o.radius * 0.65), h.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of r.shots) {
      const c = o.friendly ? ie.gold : ie.danger, u = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      u.position.set(o.x, 0.6, o.y), u.scale.set(0.11, 0.11, 0.11);
      const d = a("sphere", c, 0.8);
      d.position.copy(u.position), d.scale.set(0.21, 0.18, 0.21);
      const h = a("cone", c, 0.5);
      h.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), h.scale.set(0.14, 0.75, 0.14), h.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of r.effects) {
      const c = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const u = n("arc", ie.gold, o.size, o.x, o.y, 0.3 * (1 - c), 0.42);
        u.rotation.z = -o.angle - 0.9 + c * 0.4;
        const d = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - c), 0.43);
        d.rotation.z = u.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", Xe.crest, o.size * (i ? 1 : 0.6 + c * (2 - c)), o.x, o.y, 0.8 - c * 0.6, 0.16);
        for (const u of r.companions) {
          if (u.kind !== "familiar" || u.hp <= 0 || u.life <= 0) continue;
          const d = u.x - l.x, h = u.y - l.y, p = a("box", Xe.empowered, 1 - c * 0.7);
          p.position.set((l.x + u.x) / 2, 1.1, (l.y + u.y) / 2), p.scale.set(Math.hypot(d, h), 0.045, 0.045), p.rotation.y = -Math.atan2(h, d);
        }
        for (let u = 0; u < 4; u++) {
          const d = u * Math.PI / 2 + (i ? 0 : c), h = a("rock", Xe.empowered, 1 - c * 0.4);
          h.position.set(l.x + Math.cos(d) * 0.95, 1.7 + (i ? 0 : c * 0.5), l.y + Math.sin(d) * 0.95), h.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let u = 0; u < 4; u++) {
          const d = a("box", u % 2 ? "#ffffff" : ie.magic, 1 - c * 0.6);
          d.scale.set(0.09 + (1 - c) * 0.09, 1.05, 0.08), d.position.set(o.x + (u % 2 ? 0.14 : -0.14), 0.5 + u * 0.85, o.y), d.rotation.z = u % 2 ? -0.35 : 0.35;
        }
        n("ring", ie.magic, 0.4 + c, o.x, o.y, 1 - c);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const u = o.kind === "block" || o.kind === "parry", d = o.kind === "ward-break", h = u ? o.kind === "parry" ? je.parry : je.block : je.ward;
        if (u) {
          const p = a("ring", h, 1 - c);
          p.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), p.rotation.y = Math.PI / 2 - o.angle, p.scale.setScalar(0.6 + c * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let p = 0; p < (d ? 6 : 4); p++) {
          const g = p * 2.4 + o.id, v = a(d ? "rock" : "box", h, 1 - c), y = i ? 1.1 : 0.7 + c * (d ? 1.5 : 0.6);
          v.position.set(o.x + Math.cos(g) * y, 0.7 + p % 3 * 0.55, o.y + Math.sin(g) * y), v.scale.set(0.07 * (1 - c), (d ? 0.3 : 0.16) * (1 - c), 0.04), v.rotation.set(g, g, g);
        }
      } else if (o.kind === "heal") n("ring", ie.heal, 0.4 + c, o.x, o.y, 1 - c);
      else {
        const u = o.kind === "hit" ? ie.danger : ie.gold;
        if (n("ring", u, o.size * (0.4 + c), o.x, o.y, 1 - c), !i) for (let d = 0; d < 7; d++) {
          const h = d * 2.4 + o.id, p = a("rock", u, 1 - c * 0.8);
          p.position.set(o.x + Math.cos(h) * c * o.size, 0.4 + Math.sin(c * Math.PI) * 0.8, o.y + Math.sin(h) * c * o.size), p.scale.set(0.1 * (1 - c), 0.28 * (1 - c), 0.1 * (1 - c)), p.rotation.z = h;
        }
      }
    }
  } };
}
function Fo(e) {
  const t = document.createElement("div"), s = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", je.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ae.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(s);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new it();
  let r = null, i = 0, l = 0, o = null;
  function c(u, d, h, p, g, v, y) {
    n.set(d, h, p).project(g), u.style.left = `${(n.x * 0.5 + 0.5) * v}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * y}px`;
  }
  return {
    update(u, d, h, p) {
      if (u !== r && (r = u, i = 0, o = null, l = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const g = u.player;
      t.hidden || (s.style.width = `${g.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(g.ward)), c(t, g.x, 0, g.y, d, h, p));
      const v = u.effects.filter((M) => M.id > i && M.kind in ae.defenseFeedback), y = v.find((M) => M.kind === "parry" || M.kind === "ward-break") ?? v.at(-1);
      y && (o = y.kind, l = u.tick + 27), i = u.serial, u.tick >= l && (o = null), a.hidden = !o && !g.shield, a.dataset.state = o ?? "blocking", a.textContent = o ? ae.defenseFeedback[o] : g.shield ? ae.guardActive : "", c(a, g.x, g.shield ? 3.65 : 3.05, g.y, d, h, p);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function Bo(e, t, s, a) {
  const { width: n, depth: r } = a.footprint, i = n >= r, l = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(n, r) / 5));
  e.mesh(t, "box", f.mortar, [
    n,
    0.4,
    r
  ], [
    0,
    0.2,
    0
  ]);
  for (let o = 0; o < l; o++) {
    const c = i ? n / l : n, u = i ? r : r / l, d = e.group(s, [
      i ? -n / 2 + (o + 0.5) * c : 0,
      0,
      i ? 0 : -r / 2 + (o + 0.5) * u
    ]), h = (a.height ?? 4) + (o % 3 - 1) * 0.35, p = a.kind === "workshop";
    e.mesh(d, "box", o % 2 ? f.stone : f.cloth, [
      c - 0.15,
      h - 0.4,
      u - 0.15
    ], [
      0,
      (h + 0.4) / 2,
      0
    ]);
    for (const x of [-c / 2 + 0.12, c / 2 - 0.12]) e.mesh(d, "box", f.timber, [
      0.18,
      h,
      u
    ], [
      x,
      h / 2,
      0
    ]);
    for (const x of [0.7, h - 0.3]) e.mesh(d, "box", f.wood, [
      c,
      0.15,
      u
    ], [
      0,
      x,
      0
    ]);
    const g = e.group(d, [
      0,
      h + 0.24,
      0
    ]);
    g.rotation.x = -0.18;
    const v = !i && l > 1 ? u - 0.03 : u + 0.7;
    e.mesh(g, "box", f.roof, [
      c + 0.6,
      0.16,
      v
    ]);
    for (let x = -c / 2; x <= c / 2; x += 0.8) e.mesh(g, "box", f.roofLight, [
      0.055,
      0.07,
      v
    ], [
      x,
      0.12,
      0
    ]);
    e.mesh(g, "box", f.brass, [
      c + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      v / 2
    ]);
    const y = e.group(d, [
      0,
      0,
      u / 2
    ]), M = a.entrance ? 0 : -c * 0.19;
    e.mesh(y, "box", f.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      M,
      1.1,
      0
    ]);
    for (const x of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(y, "box", f.wood, [
      0.24,
      1.95,
      0.12
    ], [
      M + x,
      1.06,
      0.04
    ]);
    if (e.mesh(y, "box", f.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      c * 0.27,
      2.25,
      0.03
    ]), e.mesh(y, "box", f.ember, [
      0.7,
      0.67,
      0.14
    ], [
      c * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(y, "box", f.timber, [
      0.07,
      0.85,
      0.16
    ], [
      c * 0.27,
      2.25,
      0.15
    ]), e.mesh(y, "box", f.timber, [
      0.85,
      0.07,
      0.16
    ], [
      c * 0.27,
      2.25,
      0.15
    ]), u >= 4 && (i || o === l - 1)) {
      const x = e.group(y, [
        0,
        2.8,
        0.55
      ]);
      x.rotation.x = 0.22, e.mesh(x, "box", a.tint === "rose" ? f.rose : f.cloth, [
        c * 0.8,
        0.045,
        1.6
      ]), e.mesh(x, "box", f.light, [
        0.55,
        0.015,
        0.45
      ], [
        -c * 0.17,
        0.035,
        0.35
      ]);
    }
    if (p) {
      e.mesh(d, "box", f.wood, [
        c * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        u / 2 - 0.5
      ]);
      for (let x = 0; x < 3; x++) e.mesh(d, "cylinder", f.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (x - 1) * 0.55,
        1.4,
        u / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(d, "box", f.slate, [
        0.6,
        h * 0.38,
        0.7
      ], [
        -c * 0.3,
        h + 0.55,
        -u * 0.2
      ]), e.mesh(d, "box", f.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -c * 0.3,
        h * 1.19 + 0.6,
        -u * 0.2
      ]);
  }
}
function Wo(e, t, s) {
  const a = e.group(t, [
    s.width / 2 + 0.04,
    0,
    0
  ]);
  a.rotation.y = Math.PI / 2;
  const n = Math.min(4.8, s.depth - 0.7);
  e.mesh(a, "box", f.timber, [
    n,
    0.16,
    2.2
  ], [
    0,
    3.25,
    1
  ]), e.mesh(a, "box", f.cloth, [
    n - 0.15,
    2.35,
    1.75
  ], [
    0,
    4.5,
    0.86
  ]);
  for (const i of [-n / 2 + 0.1, n / 2 - 0.1]) {
    e.mesh(a, "box", f.timber, [
      0.16,
      2.5,
      1.9
    ], [
      i,
      4.5,
      0.9
    ]);
    const l = e.mesh(a, "box", f.wood, [
      0.15,
      1,
      0.15
    ], [
      i,
      3,
      0.4
    ]);
    l.rotation.x = -0.68;
  }
  e.mesh(a, "box", f.shadow, [
    1.3,
    1,
    0.05
  ], [
    0,
    4.55,
    1.76
  ]), e.mesh(a, "box", f.ember, [
    1.03,
    0.77,
    0.06
  ], [
    0,
    4.55,
    1.8
  ], !0), e.mesh(a, "box", f.timber, [
    0.07,
    0.95,
    0.1
  ], [
    0,
    4.55,
    1.85
  ]);
  for (const i of [-0.78, 0.78]) e.mesh(a, "box", f.wood, [
    0.26,
    1.15,
    0.12
  ], [
    i,
    4.55,
    1.83
  ]);
  const r = e.group(a, [
    0,
    5.8,
    1.1
  ]);
  r.rotation.x = 0.14, e.mesh(r, "box", f.roof, [
    n + 0.45,
    0.16,
    2.5
  ]);
  for (let i = -n / 2; i < n / 2; i += 0.6) e.mesh(r, "box", f.roofLight, [
    0.07,
    0.1,
    2.53
  ], [
    i,
    0.1,
    0
  ]);
  e.mesh(a, "box", f.wood, [
    1.2,
    1.9,
    0.08
  ], [
    0,
    1,
    0.04
  ]), e.mesh(a, "box", f.timber, [
    0.1,
    0.4,
    0.06
  ], [
    0.3,
    1,
    0.11
  ]);
}
function qo(e, t) {
  e.mesh(t, "box", f.mortar, [
    4,
    0.2,
    4
  ], [
    0,
    0.1,
    0
  ]), e.mesh(t, "box", f.slate, [
    1.45,
    1.1,
    1.15
  ], [
    0,
    0.75,
    0
  ]), e.mesh(t, "box", f.shadow, [
    0.95,
    0.55,
    0.04
  ], [
    0,
    0.62,
    0.59
  ]), e.mesh(t, "box", f.ember, [
    0.62,
    0.24,
    0.05
  ], [
    0,
    0.52,
    0.62
  ], !0);
  for (const s of [
    -0.22,
    0,
    0.22
  ]) e.mesh(t, "box", f.shadow, [
    0.05,
    0.48,
    0.07
  ], [
    s,
    0.62,
    0.67
  ]);
  e.mesh(t, "cylinder", f.shadow, [
    0.13,
    2.5,
    0.13
  ], [
    -0.48,
    2.25,
    -0.4
  ]), e.mesh(t, "cylinder", f.pottery, [
    0.36,
    0.48,
    0.36
  ], [
    0.2,
    1.52,
    0
  ]), e.mesh(t, "cylinder", f.shadow, [
    0.38,
    0.07,
    0.38
  ], [
    0.2,
    1.79,
    0
  ]);
  for (let s = 0; s < 5; s++) e.mesh(t, "box", f.wood, [
    0.8,
    0.16,
    0.2
  ], [
    1.25,
    0.3 + s % 3 * 0.18,
    -0.5 + Math.floor(s / 3) * 0.24
  ]);
  e.mesh(t, "cylinder", f.timber, [
    0.38,
    0.65,
    0.38
  ], [
    -1.15,
    0.52,
    0.5
  ]);
  for (let s = 0; s < 5; s++) e.mesh(t, "rock", f.shadow, [
    0.18,
    0.16,
    0.17
  ], [
    -1.15 + Math.sin(s * 2) * 0.2,
    0.87,
    0.5 + Math.cos(s * 2) * 0.2
  ]);
}
function Ho(e, t, s, a) {
  e.mesh(t, "box", f.wood, [
    s,
    0.16,
    a
  ], [
    0,
    1,
    0
  ]);
  for (const n of [-1, 1]) e.mesh(t, "box", f.timber, [
    0.18,
    1,
    a - 0.2
  ], [
    n * (s / 2 - 0.2),
    0.5,
    0
  ]);
  e.mesh(t, "box", f.cloth, [
    s * 0.4,
    0.025,
    a * 0.8
  ], [
    -s * 0.2,
    1.1,
    0
  ]);
  for (let n = 0; n < 5; n++)
    e.mesh(t, "cylinder", n % 2 ? f.pottery : f.slate, [
      0.16,
      0.32 + n % 2 * 0.15,
      0.16
    ], [
      s * 0.04 + n * 0.43,
      1.28,
      -0.3
    ]), e.mesh(t, "cylinder", f.wood, [
      0.17,
      0.055,
      0.17
    ], [
      s * 0.04 + n * 0.43,
      1.47 + n % 2 * 0.075,
      -0.3
    ]);
  for (let n = 0; n < 3; n++) e.mesh(t, "box", f.light, [
    0.8,
    0.12,
    0.48
  ], [
    -s * 0.25,
    1.18 + n * 0.12,
    0.12
  ]);
  e.mesh(t, "cylinder", f.pottery, [
    0.3,
    0.18,
    0.3
  ], [
    s * 0.22,
    1.19,
    0.45
  ]);
}
function Vo(e, t, s) {
  const a = new it(...s.from), n = new it(...s.to), r = n.clone().sub(a), i = r.length(), l = s.kind === "pipe", o = l ? 0.23 : 0.018, c = e.mesh(t, "cylinder", l ? f.brass : f.timber, [
    o,
    i,
    o
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (c.quaternion.setFromUnitVectors(new it(0, 1, 0), r.normalize()), l) for (let u = 1; u < i; u += 3.7) {
    const d = a.clone().addScaledVector(r, u);
    e.mesh(t, "cylinder", f.wood, [
      0.28,
      0.16,
      0.28
    ], d.toArray()).quaternion.copy(c.quaternion), e.mesh(t, "box", f.shadow, [
      0.12,
      0.65,
      0.12
    ], [
      d.x,
      d.y - 0.3,
      d.z
    ]);
  }
  else for (let u = 2; u < i - 2; u += 1.9) {
    const d = a.clone().addScaledVector(r, u), h = e.group(t, d.toArray());
    h.rotation.y = Math.atan2(r.x, r.z) + Math.PI / 2, e.shape(h, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(u) % 2 ? f.cloth : f.light);
    for (const p of [-1, 1]) e.mesh(h, "box", f.wood, [
      0.07,
      0.17,
      0.06
    ], [
      p * 0.42,
      -0.02,
      0.03
    ]);
  }
}
function Yo(e, t, s) {
  const { width: a, depth: n } = s.footprint;
  if (s.kind === "ledger") {
    e.mesh(t, "box", f.wood, [
      a,
      0.18,
      n
    ], [
      0,
      1.18,
      0
    ]);
    for (const l of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      l * (a / 2 - 0.3),
      0.55,
      0
    ]);
    for (let l = -1; l <= 1; l++)
      e.mesh(t, "box", f.slate, [
        0.85,
        0.17,
        1.1
      ], [
        l * 1.2,
        1.35,
        -0.3
      ]), e.mesh(t, "box", f.light, [
        0.77,
        0.025,
        0.98
      ], [
        l * 1.2,
        1.45,
        -0.3
      ]), e.mesh(t, "box", f.brass, [
        0.08,
        0.025,
        1.13
      ], [
        l * 1.2,
        1.48,
        -0.3
      ]);
    e.mesh(t, "cylinder", f.brass, [
      0.18,
      0.25,
      0.18
    ], [
      a * 0.28,
      1.4,
      n * 0.28
    ]), e.mesh(t, "box", f.light, [
      1.1,
      0.024,
      0.65
    ], [
      -a * 0.2,
      1.3,
      n * 0.28
    ]);
    return;
  }
  e.mesh(t, "box", f.timber, [
    a,
    0.16,
    n
  ], [
    0,
    0.08,
    0
  ]);
  const r = Math.max(1, Math.floor(n / 2.2)), i = Math.max(1, Math.floor(a / 1.8));
  for (let l = 0; l < r; l++) for (let o = 0; o < i; o++) {
    const c = -a / 2 + (o + 0.5) * a / i, u = -n / 2 + (l + 0.5) * n / r, d = a / i - 0.22, h = n / r - 0.24;
    if (s.kind === "fuel") {
      for (let p = 0; p < 5; p++) e.mesh(t, "box", p % 2 ? f.wood : f.timber, [
        d,
        0.2,
        h / 2 - 0.07
      ], [
        c,
        0.28 + p * 0.24,
        u + p % 2 * 0.12
      ]);
      e.mesh(t, "box", f.cloth, [
        d + 0.08,
        0.055,
        h
      ], [
        c,
        1.42,
        u
      ]);
    } else {
      const p = 0.85 + (l + o) % 3 * 0.22;
      e.mesh(t, "box", f.wood, [
        d,
        p,
        h
      ], [
        c,
        0.16 + p / 2,
        u
      ]);
      for (const g of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.11,
        p + 0.04,
        h + 0.05
      ], [
        c + g * d * 0.32,
        0.16 + p / 2,
        u
      ]);
      e.mesh(t, "box", f.light, [
        0.32,
        0.4,
        0.03
      ], [
        c,
        0.7,
        u + h / 2 + 0.02
      ]), e.mesh(t, "box", f.rose, [
        0.09,
        0.09,
        0.04
      ], [
        c,
        0.61,
        u + h / 2 + 0.045
      ]);
      for (let g = -0.25; g <= 0.25; g += 0.25) e.mesh(t, "box", f.timber, [
        d,
        0.015,
        0.016
      ], [
        c,
        p + 0.17,
        u + g * h
      ]);
      (l + o) % 3 === 0 && (e.mesh(t, "box", f.cloth, [
        d * 0.75,
        0.38,
        h * 0.55
      ], [
        c,
        p + 0.37,
        u - 0.18
      ]), e.mesh(t, "box", f.timber, [
        0.055,
        0.4,
        h * 0.57
      ], [
        c,
        p + 0.37,
        u - 0.18
      ])), e.mesh(t, "box", f.light, [
        0.32,
        0.018,
        0.45
      ], [
        c + d * 0.23,
        p + 0.19,
        u + h * 0.25
      ]);
    }
  }
}
function Go(e, t, s, a) {
  for (let n = 0; n < 3; n++) e.mesh(t, "box", f.slate, [
    s * 0.65,
    0.08,
    0.7
  ], [
    0,
    2.19 + n * 0.08,
    a * 0.22
  ]);
  e.mesh(t, "box", f.rose, [
    s * 0.6,
    0.03,
    0.08
  ], [
    0,
    2.41,
    a * 0.22 + 0.25
  ]), e.mesh(t, "cylinder", f.pottery, [
    0.22,
    0.15,
    0.22
  ], [
    s * 0.35,
    0.17,
    a * 0.35
  ]), e.mesh(t, "cylinder", f.shadow, [
    0.18,
    0.014,
    0.18
  ], [
    s * 0.35,
    0.25,
    a * 0.35
  ]);
  for (const n of [-0.17, 0.17]) e.mesh(t, "box", f.wood, [
    0.23,
    0.12,
    0.44
  ], [
    n,
    0.08,
    -a * 0.37
  ]);
  e.mesh(t, "box", f.rose, [
    0.42,
    0.045,
    0.3
  ], [
    0.3,
    0.9,
    a * 0.2
  ]);
}
function Kn(e, t, s) {
  const { width: a, depth: n } = s.footprint, r = s.tint === "rose" ? f.rose : s.tint === "amber" ? f.amber : f.leafLight, i = (l) => {
    for (const o of [-1, 1]) for (const c of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.16,
      l,
      0.16
    ], [
      o * (a / 2 - 0.3),
      l / 2,
      c * (n / 2 - 0.3)
    ]);
  };
  switch (s.kind) {
    case "bed":
      i(0.65), e.mesh(t, "box", f.wood, [
        a - 0.25,
        0.3,
        n - 0.25
      ], [
        0,
        0.65,
        0
      ]), e.mesh(t, "box", f.light, [
        a - 0.5,
        0.25,
        n - 0.5
      ], [
        0,
        0.91,
        0
      ]), e.mesh(t, "box", r, [
        a - 0.42,
        0.1,
        n * 0.6
      ], [
        0,
        1.08,
        n * 0.13
      ]), e.mesh(t, "box", f.cloth, [
        a - 0.7,
        0.12,
        0.35
      ], [
        0,
        1.15,
        -n * 0.15
      ]), e.mesh(t, "box", f.light, [
        a - 1,
        0.25,
        1
      ], [
        0,
        1.15,
        -n / 2 + 1
      ]), e.mesh(t, "box", f.timber, [
        a - 0.1,
        1.5,
        0.17
      ], [
        0,
        0.9,
        -n / 2 + 0.12
      ]);
      for (const l of [-1, 1]) e.mesh(t, "cylinder", f.brass, [
        0.07,
        1.35,
        0.07
      ], [
        l * (a / 2 - 0.23),
        0.9,
        -n / 2 + 0.22
      ]);
      e.mesh(t, "box", r, [
        1,
        0.018,
        n - 0.8
      ], [
        a / 2 + 0.65,
        0.015,
        0
      ]).castShadow = !1;
      for (const l of [-1, 1]) e.mesh(t, "box", f.cloth, [
        0.95,
        0.021,
        0.1
      ], [
        a / 2 + 0.65,
        0.02,
        l * (n / 2 - 0.65)
      ]).castShadow = !1;
      break;
    case "wardrobe": {
      e.mesh(t, "box", f.timber, [
        a - 0.15,
        2.9,
        n - 0.15
      ], [
        0,
        2.9 / 2,
        0
      ]);
      for (const o of [-1, 1])
        e.mesh(t, "box", f.wood, [
          a / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          o * a / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(t, "box", f.cloth, [
          a / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          o * a / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(t, "box", f.brass, [
          0.045,
          0.27,
          0.08
        ], [
          o * 0.2,
          1.4,
          n / 2 + 0.14
        ]);
      e.mesh(t, "box", f.wood, [
        a + 0.1,
        0.16,
        n + 0.15
      ], [
        0,
        2.9,
        0
      ]), e.mesh(t, "box", r, [
        a * 0.4,
        0.17,
        n * 0.65
      ], [
        -a * 0.23,
        3.06,
        0
      ]);
      break;
    }
    case "toolrack":
      for (const l of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.17,
        2.8,
        n
      ], [
        l * (a / 2 - 0.2),
        1.4,
        0
      ]);
      for (const l of [
        0.3,
        1.4,
        2.5
      ]) {
        e.mesh(t, "box", f.wood, [
          a,
          0.15,
          n
        ], [
          0,
          l,
          0
        ]);
        for (let o = 0; o < 4; o++) e.mesh(t, "cylinder", f.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + o * 0.6,
          l + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", f.shadow, [
          0.2,
          0.25,
          0.7
        ], [
          a * 0.32,
          l + 0.2,
          0
        ]);
      }
      break;
    case "cabinet": {
      const l = s.height ?? 2.5;
      e.mesh(t, "box", f.timber, [
        a - 0.2,
        l,
        n - 0.2
      ], [
        0,
        l / 2,
        0
      ]);
      for (let o = -a / 2 + 0.55; o < a / 2 - 0.2; o += 1) for (let c = 0.5; c < l - 0.1; c += 0.8)
        e.mesh(t, "box", f.wood, [
          0.88,
          0.68,
          0.12
        ], [
          o,
          c,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", f.brass, [
          0.055,
          0.055,
          0.06
        ], [
          o,
          c,
          n / 2 + 0.03
        ]);
      e.mesh(t, "box", f.cloth, [
        a * 0.45,
        0.13,
        n * 0.66
      ], [
        -a * 0.2,
        l + 0.075,
        0
      ]);
      for (let o = 0; o < 3; o++) e.mesh(t, "cylinder", o % 2 ? f.pottery : f.light, [
        0.15,
        0.32 + o * 0.1,
        0.15
      ], [
        a * 0.15 + o * 0.4,
        l + 0.2,
        0
      ]);
      break;
    }
    case "table":
    case "workbench":
      if (i(1.2), e.mesh(t, "box", f.wood, [
        a,
        0.18,
        n
      ], [
        0,
        1.28,
        0
      ]), e.mesh(t, "box", f.timber, [
        a - 0.5,
        0.15,
        0.15
      ], [
        0,
        0.4,
        0
      ]), s.kind === "workbench") {
        for (let l = 0; l < 3; l++) e.mesh(t, "cylinder", f.brass, [
          0.15,
          1,
          0.15
        ], [
          (l - 1) * 0.7,
          1.55,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", f.shadow, [
          0.1,
          0.08,
          1
        ], [
          a * 0.3,
          1.42,
          0
        ]).rotation.y = 0.5;
      } else {
        e.mesh(t, "box", f.light, [
          1,
          0.08,
          0.7
        ], [
          -a * 0.24,
          1.42,
          0
        ]).rotation.y = -0.12, e.mesh(t, "cylinder", f.pottery, [
          0.28,
          0.45,
          0.28
        ], [
          a * 0.2,
          1.6,
          0
        ]);
        for (const l of [-0.45, 0.45]) e.mesh(t, "cylinder", f.light, [
          0.13,
          0.19,
          0.13
        ], [
          a * 0.2 + 0.65,
          1.48,
          l
        ]);
        e.mesh(t, "cylinder", f.brass, [
          0.15,
          0.13,
          0.15
        ], [
          -a * 0.32,
          1.43,
          -n * 0.3
        ]), e.mesh(t, "cylinder", f.light, [
          0.07,
          0.32,
          0.07
        ], [
          -a * 0.32,
          1.65,
          -n * 0.3
        ]), e.mesh(t, "rock", f.ember, [
          0.055,
          0.14,
          0.055
        ], [
          -a * 0.32,
          1.92,
          -n * 0.3
        ], !0);
      }
      break;
    case "chair":
      i(0.7), e.mesh(t, "box", f.wood, [
        a - 0.25,
        0.18,
        n - 0.25
      ], [
        0,
        0.78,
        0
      ]);
      for (const l of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.14,
        1.5,
        0.14
      ], [
        l * (a / 2 - 0.3),
        0.78,
        n / 2 - 0.3
      ]);
      e.mesh(t, "box", f.wood, [
        a - 0.45,
        0.4,
        0.13
      ], [
        0,
        1.35,
        n / 2 - 0.3
      ]);
      break;
    case "basin":
      i(0.9), e.mesh(t, "box", f.wood, [
        a - 0.2,
        0.15,
        n - 0.2
      ], [
        0,
        0.95,
        0
      ]), e.mesh(t, "cylinder", f.light, [
        0.65,
        0.22,
        0.65
      ], [
        0,
        1.12,
        0
      ]), e.mesh(t, "cylinder", f.water, [
        0.54,
        0.025,
        0.54
      ], [
        0,
        1.24,
        0
      ]), e.mesh(t, "box", f.cloth, [
        0.35,
        0.07,
        n * 0.8
      ], [
        a / 2 - 0.25,
        1.06,
        0
      ]);
      break;
    case "screen": {
      const l = a > n, o = Math.max(a, n), c = e.group(t);
      l || (c.rotation.y = Math.PI / 2);
      for (let u = -o / 2 + 0.15; u < o / 2; u += 1.4)
        e.mesh(c, "box", f.timber, [
          0.09,
          2.8,
          0.12
        ], [
          u,
          1.4,
          0
        ]), e.mesh(c, "box", f.cloth, [
          Math.min(1.27, o / 2 - u),
          2.15,
          0.055
        ], [
          u + Math.min(0.68, (o / 2 - u) / 2),
          1.53,
          0
        ]);
      for (const u of [-1, 1]) e.mesh(c, "box", f.timber, [
        0.3,
        0.18,
        0.8
      ], [
        u * (o / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function Qo(e, t, s, a) {
  const { width: n, depth: r } = a.footprint, i = a.height;
  e.mesh(t, "box", f.slate, [
    n,
    0.3,
    r
  ], [
    0,
    0.15,
    0
  ]), e.mesh(s, "box", f.light, [
    n,
    i - 0.3,
    r
  ], [
    0,
    (i + 0.3) / 2,
    0
  ]);
  for (const c of [0.5, i - 0.1]) e.mesh(s, "box", f.wood, [
    n + 0.04,
    0.16,
    r + 0.04
  ], [
    0,
    c,
    0
  ]);
  const l = n > r, o = Math.max(n, r);
  for (let c = -o / 2 + 0.3; c < o / 2; c += 3.5) e.mesh(s, "box", f.wood, [
    l ? 0.12 : n + 0.04,
    i,
    l ? r + 0.04 : 0.12
  ], [
    l ? c : 0,
    i / 2,
    l ? 0 : c
  ]);
  if (a.id === "west-wall") {
    const c = e.group(s, [
      n / 2 + 0.04,
      2.35,
      0
    ]);
    c.rotation.y = Math.PI / 2, e.mesh(c, "box", f.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(c, "box", f.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const u of [-1, 1])
      e.mesh(c, "box", f.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        u * 0.73,
        -0.07,
        0.21
      ]), e.mesh(c, "box", f.brass, [
        0.78,
        0.06,
        0.03
      ], [
        u * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(c, "box", f.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(c, "box", f.wood, [
      2.5,
      0.13,
      0.6
    ], [
      0,
      -0.85,
      0.24
    ]);
  }
}
function Ko(e, t) {
  for (const s of [-1, 1]) e.mesh(t, "box", f.timber, [
    0.22,
    3.6,
    0.4
  ], [
    s * 1.9,
    1.8,
    0
  ]);
  e.mesh(t, "box", f.wood, [
    4,
    0.22,
    0.45
  ], [
    0,
    3.65,
    0
  ]), e.mesh(t, "box", f.wood, [
    3.5,
    3.35,
    0.16
  ], [
    0,
    1.7,
    0
  ]);
  for (const s of [0.5, 2.8]) e.mesh(t, "box", f.timber, [
    3.5,
    0.13,
    0.2
  ], [
    0,
    s,
    0
  ]);
  for (const s of [-1, 1]) e.mesh(t, "sphere", f.brass, [
    0.09,
    0.09,
    0.09
  ], [
    1.25,
    1.45,
    s * 0.16
  ]);
}
function Bs(e, t, s, a, n = 2.8) {
  e.mesh(t, "cylinder", f.shadow, [
    0.055,
    n,
    0.055
  ], [
    s,
    n / 2,
    a
  ]), e.mesh(t, "box", f.brass, [
    0.4,
    0.08,
    0.4
  ], [
    s,
    n,
    a
  ]), e.mesh(t, "box", f.ember, [
    0.22,
    0.38,
    0.22
  ], [
    s,
    n + 0.21,
    a
  ], !0), e.mesh(t, "cone", f.shadow, [
    0.32,
    0.24,
    0.32
  ], [
    s,
    n + 0.51,
    a
  ]);
  for (const r of [-1, 1]) e.mesh(t, "box", f.shadow, [
    0.035,
    0.4,
    0.035
  ], [
    s + r * 0.14,
    n + 0.2,
    a + 0.14
  ]);
}
function Ws(e, t, s, a, n, r) {
  const i = s / 2 + 0.45, l = Math.atan2(r, i), o = Math.hypot(i, r);
  for (const c of [-1, 1]) {
    const u = e.group(t, [
      c * i / 2,
      n + r / 2,
      0
    ]);
    u.rotation.z = -c * l, e.mesh(u, "box", f.roof, [
      o + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let d = 0; d < Math.ceil(o / 0.65); d++) e.mesh(u, "box", d % 3 ? f.roof : f.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -o / 2 + d * 0.65,
      0.13,
      0
    ]);
    e.mesh(u, "box", f.shadow, [
      0.2,
      0.24,
      a + 1.25
    ], [
      c * o / 2,
      -0.05,
      0
    ]);
  }
  e.mesh(t, "box", f.brass, [
    0.24,
    0.23,
    a + 1.4
  ], [
    0,
    n + r + 0.14,
    0
  ]);
  for (const c of [-a / 2 - 0.08, a / 2 + 0.08])
    e.shape(t, [
      [-s / 2, 0],
      [s / 2, 0],
      [0, r]
    ], f.light, [
      0,
      n,
      c
    ], 0.08), e.mesh(t, "box", f.timber, [
      0.15,
      r,
      0.18
    ], [
      0,
      n + r / 2,
      c + 0.12
    ]);
}
function wa(e, t, s, a, n, r = 1.1) {
  e.mesh(t, "box", f.shadow, [
    r,
    1.45,
    0.12
  ], [
    s,
    n,
    a
  ]), e.mesh(t, "box", f.window, [
    r - 0.18,
    1.25,
    0.14
  ], [
    s,
    n,
    a + 0.07
  ]);
  for (const i of [-1, 1])
    e.mesh(t, "box", f.wood, [
      0.13,
      1.6,
      0.2
    ], [
      s + i * r / 2,
      n,
      a + 0.12
    ]), e.mesh(t, "box", f.light, [
      r + 0.28,
      0.14,
      0.26
    ], [
      s,
      n + i * 0.8,
      a + 0.12
    ]);
  e.mesh(t, "box", f.timber, [
    0.07,
    1.3,
    0.16
  ], [
    s,
    n,
    a + 0.16
  ]), e.mesh(t, "box", f.timber, [
    r,
    0.06,
    0.16
  ], [
    s,
    n,
    a + 0.16
  ]);
}
function Xo(e, t, s) {
  const { width: a, depth: n } = s.footprint, r = s.kind === "clinic", i = r ? 3.7 : 5;
  e.mesh(t, "box", f.stone, [
    a - 0.3,
    i,
    n - 0.3
  ], [
    0,
    i / 2,
    0
  ]), e.mesh(t, "box", f.light, [
    a - 0.4,
    i - 1,
    n - 0.1
  ], [
    0,
    i / 2 + 0.4,
    0
  ]);
  for (const u of [-a / 2 + 0.15, a / 2 - 0.15]) for (const d of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(t, "box", f.timber, [
    0.27,
    i,
    0.27
  ], [
    u,
    i / 2,
    d
  ]);
  for (const u of [0.8, i - 0.25]) e.mesh(t, "box", f.timber, [
    a,
    0.18,
    n
  ], [
    0,
    u,
    0
  ]);
  for (const u of [-a * 0.29, a * 0.29]) wa(e, t, u, n / 2, 2.3, r ? 1.6 : 1.2);
  const l = e.group(t, [
    a / 2,
    0,
    0
  ]);
  l.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) wa(e, l, u, 0.03, 2.3);
  e.mesh(t, "box", f.shadow, [
    1.9,
    2.65,
    0.13
  ], [
    0,
    1.35,
    n / 2
  ]);
  for (const u of [-1, 1]) e.mesh(t, "box", f.wood, [
    0.85,
    2.5,
    0.12
  ], [
    u * 0.46,
    1.3,
    n / 2 + 0.08
  ]);
  e.mesh(t, "sphere", f.brass, [
    0.07,
    0.07,
    0.05
  ], [
    0.23,
    1.15,
    n / 2 + 0.19
  ]), Ws(e, t, a, n, i, r ? 1.15 : 3.2);
  const o = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), c = r ? 2.1 : 3.3;
  if (e.mesh(o, "box", f.stone, [
    1.1,
    c,
    1.2
  ], [
    0,
    c / 2,
    0
  ]), e.mesh(o, "box", f.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    c - 0.2,
    0
  ]), e.mesh(o, "box", f.shadow, [
    0.85,
    0.04,
    0.95
  ], [
    0,
    c - 0.03,
    0
  ]), r) {
    const u = e.group(t, [
      0,
      2.9,
      n / 2 + 1
    ]);
    u.rotation.x = 0.19;
    for (let d = -6; d <= 6; d++) e.mesh(u, "box", d % 3 ? f.cloth : f.light, [
      0.74,
      0.04,
      2.3
    ], [
      d * 0.75,
      0,
      0
    ]);
    for (const d of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.09,
      0.12,
      2.1
    ], [
      d * 4.5,
      2.6,
      n / 2 + 0.95
    ]);
    e.mesh(u, "box", f.rose, [
      1,
      0.014,
      0.65
    ], [
      -2.2,
      0.034,
      0.3
    ]);
    for (let d = -3; d <= 3; d++)
      e.mesh(t, "box", f.timber, [
        0.025,
        0.35,
        0.025
      ], [
        d * 0.45 - 3,
        2.5,
        n / 2 + 0.16
      ]), e.mesh(t, "cone", f.leaf, [
        0.17,
        0.6,
        0.15
      ], [
        d * 0.45 - 3,
        2.05,
        n / 2 + 0.16
      ]);
    for (const d of [-a * 0.29, a * 0.29]) e.mesh(t, "box", f.ember, [
      1.35,
      1.15,
      0.015
    ], [
      d,
      2.3,
      n / 2 + 0.151
    ], !0);
    e.mesh(t, "box", f.slate, [
      0.9,
      1.2,
      0.14
    ], [
      2.8,
      2.8,
      n / 2 + 0.25
    ]), e.mesh(t, "cylinder", f.brass, [
      0.21,
      0.47,
      0.06
    ], [
      2.8,
      2.75,
      n / 2 + 0.36
    ]), e.mesh(t, "box", f.brass, [
      0.18,
      0.16,
      0.1
    ], [
      2.8,
      3.08,
      n / 2 + 0.36
    ]);
  } else
    wa(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", f.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function Jo(e, t, s) {
  const a = s.height, n = s.footprint.width, r = s.tint === "amber", i = s.tint === "rose", l = r ? f.amber : i ? f.rose : f.leaf, o = r ? f.amberLight : i ? "#dfb2a1" : f.leafLight, c = e.mesh(t, "cylinder", f.timber, [
    0.24,
    a * 0.67,
    0.28
  ], [
    0,
    a * 0.33,
    0
  ]);
  c.rotation.z = 0.06;
  for (let u = 0; u < 3; u++) {
    const d = e.group(t, [
      0,
      a * 0.39,
      0
    ]);
    d.rotation.set(0.4 * Math.sin(u * 2), 0, (u - 1) * 0.65), e.mesh(d, "cylinder", f.timber, [
      0.095,
      a * 0.32,
      0.095
    ], [
      0,
      a * 0.16,
      0
    ]);
  }
  for (let u = 0; u < 9; u++) {
    const d = u * 2.4, h = u === 8 ? 0.1 : n * 0.56, p = e.mesh(t, "crown", u % 3 ? l : o, [
      n * 0.49 + 0.4,
      a * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(d) * h,
      a * (0.68 + u % 3 * 0.11),
      Math.cos(d) * h
    ]);
    p.rotation.set(u * 0.37, u * 0.61, 0.14), p.receiveShadow = !1;
  }
}
function ei(e, t, s) {
  const { width: a, depth: n } = s.footprint, r = s.height;
  e.mesh(t, "box", f.stone, [
    a,
    r,
    n
  ], [
    0,
    r / 2,
    0
  ]);
  for (const i of [
    1,
    r * 0.55,
    r - 0.6
  ]) e.mesh(t, "box", f.light, [
    a + 0.25,
    0.3,
    n + 0.25
  ], [
    0,
    i,
    0
  ]);
  for (const i of [-a / 2 + 0.3, a / 2 - 0.3]) e.mesh(t, "box", f.mortar, [
    0.55,
    r - 1,
    n + 0.15
  ], [
    i,
    r / 2,
    0
  ]);
  for (const i of [r * 0.35, r * 0.7]) wa(e, t, 0, n / 2 + 0.02, i, 0.7);
  Ws(e, t, a + 0.35, n + 0.35, r, r * 0.32), e.mesh(t, "cylinder", f.brass, [
    0.055,
    2.7,
    0.055
  ], [
    0,
    r * 1.32 + 1.2,
    0
  ]), e.shape(t, [
    [0, 0],
    [1.6, -0.3],
    [1.2, -0.75],
    [0, -0.95]
  ], f.cloth, [
    0.05,
    r * 1.32 + 2.4,
    0
  ]);
}
function ti(e, t, s, a, n) {
  const r = a.footprint, i = e.group(t, [
    r.x,
    0,
    r.z
  ]), l = e.group(s, [
    r.x,
    0,
    r.z
  ]);
  switch (a.kind) {
    case "door":
      Ko(e, l);
      break;
    case "screen":
      Kn(e, l, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      Kn(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      Bo(e, i, l, a);
      break;
    case "stove":
      qo(e, i);
      break;
    case "medicine":
      Ho(e, i, r.width, r.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      Yo(e, i, a);
      break;
    case "clinic":
    case "storehouse":
      e.mesh(i, "box", f.mortar, [
        r.width,
        0.3,
        r.depth
      ], [
        0,
        0.15,
        0
      ]), Xo(e, l, a);
      break;
    case "tree":
      e.mesh(i, "box", f.soil, [
        r.width,
        0.18,
        r.depth
      ], [
        0,
        0.08,
        0
      ]);
      for (let o = 0; o < 7; o++) {
        const c = o * 0.9;
        e.mesh(i, "rock", f.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(c) * r.width * 0.33,
          0.2,
          Math.cos(c) * r.depth * 0.33
        ]);
      }
      Jo(e, l, a);
      break;
    case "tower":
      ei(e, l, a);
      break;
    case "column": {
      const o = a.height, c = Math.min(r.width, r.depth) * 0.3;
      e.mesh(i, "box", f.mortar, [
        r.width,
        0.35,
        r.depth
      ], [
        0,
        0.17,
        0
      ]), e.mesh(i, "box", f.light, [
        r.width * 0.84,
        0.35,
        r.depth * 0.84
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", f.stone, [
        c,
        o - 1.1,
        c
      ], [
        0,
        o / 2,
        0
      ]);
      for (let u = 0; u < 10; u++) {
        const d = u * Math.PI / 5;
        e.mesh(l, "box", f.light, [
          0.085,
          o - 2,
          0.085
        ], [
          Math.sin(d) * c,
          o / 2,
          Math.cos(d) * c
        ]);
      }
      for (const u of [0.85, o - 0.7]) e.mesh(l, "cylinder", f.brass, [
        c * 1.15,
        0.18,
        c * 1.15
      ], [
        0,
        u,
        0
      ]);
      e.mesh(l, "box", f.light, [
        r.width,
        0.4,
        r.depth
      ], [
        0,
        o - 0.3,
        0
      ]), e.mesh(l, "box", f.slate, [
        r.width * 0.9,
        0.3,
        r.depth * 0.9
      ], [
        0,
        o,
        0
      ]);
      break;
    }
    case "beacon":
      e.mesh(i, "box", f.mortar, [
        r.width,
        0.28,
        r.depth
      ], [
        0,
        0.14,
        0
      ]), e.mesh(i, "cylinder", f.stone, [
        2.5,
        0.5,
        2.5
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", f.slate, [
        1.35,
        3.9,
        1.35
      ], [
        0,
        2.3,
        0
      ]);
      for (const o of [
        1.2,
        3.5,
        4.4
      ]) e.mesh(l, "cylinder", f.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        o,
        0
      ]);
      e.mesh(l, "cylinder", f.shadow, [
        2.2,
        0.5,
        2.2
      ], [
        0,
        4.8,
        0
      ]), e.mesh(l, "torus", f.brass, [
        2.3,
        2.3,
        1.4
      ], [
        0,
        5.1,
        0
      ]).rotation.x = Math.PI / 2;
      for (let o = 0; o < 6; o++) {
        const c = o * Math.PI / 3, u = e.group(l, [
          Math.sin(c) * 2.1,
          4.8,
          Math.cos(c) * 2.1
        ]);
        u.rotation.y = c, e.shape(u, [
          [-0.12, 0],
          [0.12, 0],
          [0.2, 1.8],
          [0, 2.4],
          [-0.2, 1.8]
        ], f.brass, [
          0,
          0,
          0
        ], 0.14);
      }
      break;
    case "bunk":
      Go(e, i, r.width, r.depth);
      for (const o of [0.55, 1.9])
        e.mesh(i, "box", f.timber, [
          r.width - 0.5,
          0.18,
          r.depth - 0.5
        ], [
          0,
          o,
          0
        ]), e.mesh(i, "box", f.cloth, [
          r.width - 0.8,
          0.18,
          r.depth - 0.9
        ], [
          0,
          o + 0.16,
          0
        ]), e.mesh(i, "box", f.light, [
          r.width - 1,
          0.24,
          1.2
        ], [
          0,
          o + 0.28,
          -r.depth / 2 + 1.3
        ]);
      for (const o of [-1, 1]) for (const c of [-1, 1]) e.mesh(i, "box", f.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        o * (r.width / 2 - 0.3),
        1.35,
        c * (r.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const o = a.height, c = r.width * 0.23;
      e.mesh(i, "rock", f.soil, [
        r.width * 0.5,
        0.65,
        r.depth * 0.5
      ], [
        0,
        0.1,
        0
      ]);
      for (let u = 0; u < 5; u++) {
        const d = u * Math.PI * 0.4, h = r.width * 0.25, p = e.group(l, [
          Math.sin(d) * c * 0.45,
          0,
          Math.cos(d) * c * 0.45
        ]);
        p.rotation.y = d;
        const g = e.mesh(p, "cylinder", u % 2 ? f.root : f.rootLight, [
          c * 0.65,
          o * 0.64,
          c * 0.49
        ], [
          0,
          o * 0.3,
          0
        ]);
        g.rotation.z = 0.13;
        const v = e.group(p, [
          0,
          o * 0.48,
          0
        ]);
        v.rotation.z = 0.4 + u * 0.12, e.mesh(v, "cone", f.root, [
          c * 0.47,
          o * 0.55,
          c * 0.4
        ], [
          0,
          o * 0.25,
          0
        ]);
        const y = e.mesh(p, "cone", f.root, [
          c * 0.5,
          h * 1.4,
          c * 0.4
        ], [
          h * 0.6,
          0.7,
          0
        ]);
        y.rotation.z = -1.15;
      }
      if (o > 8) {
        e.mesh(l, "rock", f.shadow, [
          c * 0.65,
          o * 0.22,
          0.35
        ], [
          0,
          o * 0.38,
          c * 0.65
        ]), e.mesh(l, "rock", f.brass, [
          c * 0.16,
          o * 0.16,
          0.15
        ], [
          0,
          o * 0.4,
          c * 0.68
        ], !0);
        for (let u = 0; u < 7; u++) e.mesh(l, "crown", u % 2 ? f.leaf : f.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(u * 2) * c,
          o * 0.55 + u * 0.4,
          Math.cos(u * 2) * c
        ]);
      }
      break;
    }
    case "arch": {
      const o = a.height;
      e.mesh(l, "arch", f.light, [
        r.width / 2 - 0.4,
        3.1,
        r.depth * 0.65
      ], [
        0,
        o - 3,
        0
      ]), e.mesh(l, "box", f.brass, [
        0.8,
        1.4,
        r.depth * 0.75
      ], [
        0,
        o + 0.2,
        0
      ]);
      for (const c of [-1, 1]) {
        const u = e.group(l, [
          c * (r.width / 2 - 0.5),
          o - 2.2,
          r.depth / 2 - 0.4
        ]);
        e.mesh(u, "box", f.brass, [
          1.5,
          0.08,
          0.1
        ]), e.shape(u, [
          [-0.6, 0],
          [0.6, 0],
          [0.6, -2.5],
          [0, -2.9],
          [-0.6, -2.5]
        ], f.slate, [
          0,
          -0.05,
          0.06
        ]), e.mesh(u, "box", f.cloth, [
          0.08,
          1.9,
          0.06
        ], [
          0,
          -1.2,
          0.14
        ]);
      }
      break;
    }
    case "wall": {
      if (a.wallUse === "room") {
        Qo(e, i, l, a);
        break;
      }
      const o = a.height, c = Math.min(o, 0.65);
      a.wallUse === "homes" && Wo(e, l, r), e.mesh(i, "box", f.mortar, [
        r.width,
        c,
        r.depth
      ], [
        0,
        c / 2,
        0
      ]), o > c && e.mesh(l, "box", n ? f.marble : f.stone, [
        r.width,
        o - c,
        r.depth
      ], [
        0,
        (o + c) / 2,
        0
      ]), e.mesh(l, "box", f.light, [
        r.width + 0.12,
        0.23,
        r.depth + 0.12
      ], [
        0,
        o,
        0
      ]);
      const u = r.width > r.depth, d = Math.max(r.width, r.depth);
      if (n) {
        for (const h of [1.1, o - 0.55]) e.mesh(l, "box", f.light, [
          r.width + 0.15,
          0.22,
          r.depth + 0.15
        ], [
          0,
          h,
          0
        ]);
        for (let h = -d / 2 + 3; h < d / 2 - 1; h += 6) for (const p of [-1, 1]) {
          const g = e.group(l, [
            u ? h : p * (r.width / 2 + 0.04),
            0,
            u ? p * (r.depth / 2 + 0.04) : h
          ]);
          g.rotation.y = u ? p < 0 ? Math.PI : 0 : p * Math.PI / 2;
          const v = o * 0.61, y = Math.min(2.1, o * 0.3);
          e.mesh(g, "box", f.undercroft, [
            1.5,
            y,
            0.05
          ], [
            0,
            v,
            0
          ]);
          for (const M of [
            -0.55,
            0,
            0.55
          ]) e.mesh(g, "box", f.shadow, [
            0.07,
            y,
            0.06
          ], [
            M,
            v,
            0.06
          ]);
          for (const M of [-1, 1]) e.mesh(g, "box", f.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            v + M * y / 2,
            0.06
          ]);
          e.mesh(g, "box", f.stone, [
            0.45,
            o - 1,
            0.32
          ], [
            2.2,
            o / 2,
            0
          ]);
        }
        break;
      }
      for (let h = -d / 2 + 1; h < d / 2; h += 3.5) {
        o > 4 && e.mesh(l, "box", f.stone, u ? [
          1.3,
          0.85,
          r.depth
        ] : [
          r.width,
          0.85,
          1.3
        ], [
          u ? h : 0,
          o + 0.55,
          u ? 0 : h
        ]);
        for (let p = 0; p < Math.floor(o / 0.9); p++) e.mesh(l, "box", f.mortar, u ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          u ? h + p % 2 * 0.7 : r.width / 2 + 0.01,
          0.55 + p * 0.85,
          u ? r.depth / 2 + 0.01 : h + p % 2 * 0.7
        ]);
      }
      break;
    }
    case "water":
      e.mesh(i, "box", f.water, [
        r.width,
        0.12,
        r.depth
      ], [
        0,
        -0.18,
        0
      ]);
      for (let o = 0; o < r.width * r.depth / 9; o++) {
        const c = Math.sin(o * 7.3) * (r.width / 2 - 0.8), u = Math.cos(o * 3.7) * (r.depth / 2 - 0.3);
        e.mesh(i, "box", f.ripple, [
          0.4 + o % 4 * 0.3,
          0.012,
          0.04
        ], [
          c,
          -0.11,
          u
        ], !0);
      }
      break;
    case "planter":
      e.mesh(i, "box", f.stone, [
        r.width,
        0.55,
        r.depth
      ], [
        0,
        0.275,
        0
      ]), e.mesh(i, "box", f.soil, [
        r.width - 0.35,
        0.1,
        r.depth - 0.35
      ], [
        0,
        0.57,
        0
      ]);
      for (let o = -r.width / 2 + 0.65; o < r.width / 2; o += 1) for (let c = -r.depth / 2 + 0.6; c < r.depth / 2; c += 0.95) {
        const u = Math.sin(o * 7 + c * 19), d = r.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? f.leafLight : f.leaf, [
          d,
          0.32 + u * 0.1,
          d * 0.9
        ], [
          o + u * 0.15,
          0.81,
          c
        ]), u > 0.5 && e.mesh(i, "rock", u > 0.8 ? f.light : f.rose, [
          0.1,
          0.12,
          0.1
        ], [
          o + 0.1,
          1.13,
          c
        ]);
      }
      break;
    case "thicket":
      e.mesh(i, "box", f.soil, [
        r.width,
        0.2,
        r.depth
      ], [
        0,
        0.07,
        0
      ]);
      for (let o = -r.width / 2 + 0.7; o < r.width / 2; o += 1.3) for (let c = -r.depth / 2 + 0.65; c < r.depth / 2; c += 1.25) {
        const u = Math.sin(o * 13 + c * 7), d = 0.6 + u * 0.2;
        e.mesh(i, "crown", u > 0 ? f.leaf : f.leafLight, [
          0.7,
          d,
          0.7
        ], [
          o,
          d * 0.75,
          c
        ]), u > 0.75 && e.mesh(i, "rock", f.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          o,
          d * 1.65,
          c
        ]);
      }
      break;
    case "wagon":
      e.mesh(i, "box", f.wood, [
        r.width - 1,
        0.35,
        r.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const o of [-1, 1]) {
        for (let c = 0; c < 3; c++) e.mesh(i, "box", f.wood, [
          0.12,
          0.24,
          r.depth - 1
        ], [
          o * (r.width / 2 - 0.5),
          1.4 + c * 0.29,
          0
        ]);
        for (const c of [-r.depth * 0.28, r.depth * 0.28]) {
          if (a.damaged && o < 0 && c > 0) {
            e.mesh(i, "torus", f.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -r.width / 2 + 0.8,
              0.18,
              c
            ]).rotation.x = Math.PI / 2, e.mesh(i, "box", f.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -r.width / 2 + 0.8,
              0.18,
              c
            ]), e.mesh(i, "box", f.wood, [
              0.1,
              0.1,
              1.1
            ], [
              -r.width / 2 + 0.8,
              0.18,
              c
            ]);
            continue;
          }
          e.mesh(i, "torus", f.shadow, [
            0.7,
            0.7,
            0.7
          ], [
            o * (r.width / 2 - 0.2),
            0.76,
            c
          ]).rotation.y = Math.PI / 2;
          for (let u = 0; u < 4; u++) {
            const d = e.mesh(i, "box", f.wood, [
              0.09,
              1.25,
              0.09
            ], [
              o * (r.width / 2 - 0.2),
              0.76,
              c
            ]);
            d.rotation.x = u * Math.PI / 4;
          }
        }
      }
      e.mesh(i, "box", f.cloth, [
        1.4,
        0.8,
        1.8
      ], [
        0,
        1.7,
        -0.8
      ]), e.mesh(i, "cylinder", f.timber, [
        0.45,
        0.9,
        0.45
      ], [
        0.6,
        1.8,
        1
      ]);
      break;
    case "supplies":
      for (let o = 0; o < 4; o++) {
        const c = e.group(i, [
          o % 2 * 1.5 - 0.75,
          o === 3 ? 1.3 : 0,
          o < 2 ? -0.7 : 0.7
        ]);
        e.mesh(c, "box", f.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const u of [-1, 1]) e.mesh(c, "box", f.timber, [
          0.1,
          1.25,
          1.3
        ], [
          u * 0.43,
          0.6,
          0
        ]);
        e.mesh(c, "box", f.light, [
          0.32,
          0.35,
          0.02
        ], [
          0,
          0.7,
          0.62
        ]);
      }
      break;
    case "bench":
      e.mesh(i, "box", f.wood, [
        r.width - 0.3,
        0.18,
        r.depth - 0.2
      ], [
        0,
        0.72,
        0
      ]), e.mesh(i, "box", f.wood, [
        0.13,
        0.75,
        r.depth - 0.2
      ], [
        -r.width / 2 + 0.1,
        1.12,
        0
      ]);
      for (const o of [-1, 1]) e.mesh(i, "box", f.shadow, [
        r.width - 0.5,
        0.7,
        0.22
      ], [
        0,
        0.35,
        o * (r.depth / 2 - 0.5)
      ]);
      break;
    case "ruin":
      e.mesh(i, "box", f.stone, [
        r.width,
        0.5,
        r.depth
      ], [
        0,
        0.25,
        0
      ]);
      for (let o = 0; o < 3; o++) {
        const c = -r.width * 0.3 + o * r.width * 0.3, u = (a.height ?? 3) * (1 - o * 0.22), d = r.width * 0.11;
        e.mesh(l, "cylinder", f.stone, [
          d,
          u,
          d
        ], [
          c,
          u / 2 + 0.3,
          -r.depth * 0.2
        ]), e.mesh(l, "box", f.light, [
          d * 2.6,
          0.25,
          d * 2.6
        ], [
          c,
          u + 0.3,
          -r.depth * 0.2
        ]);
        for (let h = 0; h < 6; h++) {
          const p = h * Math.PI / 3;
          e.mesh(l, "box", f.mortar, [
            0.055,
            u * 0.8,
            0.055
          ], [
            c + Math.sin(p) * d,
            u / 2 + 0.3,
            -r.depth * 0.2 + Math.cos(p) * d
          ]);
        }
      }
      e.mesh(i, "rock", f.grassDark, [
        r.width * 0.4,
        0.3,
        r.depth * 0.3
      ], [
        0,
        0.7,
        r.depth * 0.2
      ]);
      break;
  }
  return l.children.length > 0;
}
var la = 1e-7;
function cn(e, t, s) {
  return (t[0] - e[0]) * (s[1] - e[1]) - (t[1] - e[1]) * (s[0] - e[0]);
}
function Xn(e, t, s, a) {
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const i = e[r], l = e[(r + 1) % e.length], o = cn(t, s, i), c = cn(t, s, l), u = a ? o >= -1e-7 : o <= la, d = a ? c >= -1e-7 : c <= la;
    if (u && n.push(i), u !== d && Math.abs(o - c) > la) {
      const h = o / (o - c);
      n.push([i[0] + (l[0] - i[0]) * h, i[1] + (l[1] - i[1]) * h]);
    }
  }
  return n;
}
function qs(e) {
  return Math.abs(e.reduce((t, s, a) => t + s[0] * e[(a + 1) % e.length][1] - s[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function ai(e, t) {
  let s = e;
  const a = [];
  for (let n = 0; n < t.length && s.length >= 3; n++) {
    const r = t[n], i = t[(n + 1) % t.length], l = Xn(s, r, i, !1);
    qs(l) > la && a.push(l), s = Xn(s, r, i, !0);
  }
  return a;
}
function ni(e, t, s) {
  const a = t[0] - e[0], n = t[1] - e[1], r = s / (2 * Math.hypot(a, n)), i = -n * r, l = a * r;
  return [
    [e[0] + i, e[1] + l],
    [e[0] - i, e[1] - l],
    [t[0] - i, t[1] - l],
    [t[0] + i, t[1] + l]
  ];
}
function Hs(e, t) {
  const s = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) s.push(ni(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, r] of a.points.slice(1, -1)) s.push(Array.from({ length: 12 }, (i, l) => {
      const o = l * Math.PI / 6, c = (a.width + t) / 2;
      return [n + Math.cos(o) * c, r + Math.sin(o) * c];
    }));
  }
  return s;
}
function si(e, t = 0) {
  const s = Hs(e, t), a = [];
  for (let n = 0; n < s.length; n++) {
    let r = [s[n]];
    for (let i = 0; i < n && r.length; i++) r = r.flatMap((l) => ai(l, s[i]));
    a.push(...r.filter((i) => qs(i) > la));
  }
  return a;
}
function ri(e, t, s, a) {
  const n = s === "marble", r = s === "street";
  for (const [o, c, u] of [[
    0.4,
    0.025,
    n ? f.brass : r ? f.streetSeam : f.mortar
  ], [
    0,
    0.04,
    n ? f.slate : r ? f.streetStone : f.stone
  ]]) for (const d of si(t, o)) {
    const h = d.reduce((v, y) => v + y[0], 0) / d.length, p = d.reduce((v, y) => v + y[1], 0) / d.length, g = e.shape(a(h, p), d.map((v) => [v[0], -v[1]]), u, [
      0,
      c,
      0
    ]);
    g.rotation.x = -Math.PI / 2, g.castShadow = !1;
  }
  const i = Hs(t, 0.4);
  let l = 0;
  for (const o of t) {
    for (let c = 1; c < o.points.length; c++, l++) {
      const u = o.points[c - 1], d = o.points[c], h = d[0] - u[0], p = d[1] - u[1], g = Math.hypot(h, p);
      for (let v = 1.5; v < g; v += 1.65) {
        const y = u[0] + h * v / g, M = u[1] + p * v / g;
        if (i.some((S, b) => b !== l && S.every((w, k) => cn(w, S[(k + 1) % S.length], [y, M]) >= -1e-7))) continue;
        const x = e.mesh(a(y, M), "box", n ? f.shadow : r ? f.streetSeam : f.mortar, [
          o.width - 0.08,
          0.012,
          0.025
        ], [
          y,
          0.049,
          M
        ]);
        if (x.rotation.y = Math.atan2(h, p), x.castShadow = !1, r) {
          const S = e.mesh(a(y, M), "box", f.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            y + Math.cos(v) * 0.55,
            0.049,
            M
          ]);
          S.rotation.y = Math.atan2(h, p), S.castShadow = !1;
        }
      }
    }
    l += o.points.length - 2;
  }
}
function oi(e, t) {
  const s = e.x - e.width / 2, a = s + e.width, n = e.z - e.depth / 2, r = n + e.depth, i = Math.max(s, t.x - t.width / 2), l = Math.min(a, t.x + t.width / 2), o = Math.max(n, t.z - t.depth / 2), c = Math.min(r, t.z + t.depth / 2);
  return i >= l || o >= c ? [e] : [
    [
      s,
      n,
      a,
      o
    ],
    [
      s,
      c,
      a,
      r
    ],
    [
      s,
      o,
      i,
      c
    ],
    [
      l,
      o,
      a,
      c
    ]
  ].filter(([u, d, h, p]) => h > u && p > d).map(([u, d, h, p]) => ({
    x: (u + h) / 2,
    z: (d + p) / 2,
    width: h - u,
    depth: p - d
  }));
}
function Jn(e, t, s) {
  const a = s[0] - t[0], n = s[1] - t[1], r = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * r, e.y - t[1] - n * r);
}
function ii(e, t, s) {
  const a = [], n = /* @__PURE__ */ new Map(), r = [], i = new fr(), l = new it(), o = new yr(), c = [];
  function u(b, w) {
    const k = `${Math.floor(b / 16)}:${Math.floor(w / 16)}`;
    let E = n.get(k);
    return E || (E = e.group(t), n.set(k, E)), E;
  }
  let d = [s.bounds];
  for (const b of s.features.filter((w) => w.kind === "water")) d = d.flatMap((w) => oi(w, b.footprint));
  const h = s.surface === "grass", p = s.surface === "marble", g = s.surface === "street", v = s.surface === "boards", y = v ? f.wood : h ? f.grass : g ? f.street : s.surface === "wet" ? f.wetStone : p ? f.marble : f.stone;
  for (const b of d)
    if (e.mesh(u(b.x, b.z), "box", y, [
      b.width,
      0.6,
      b.depth
    ], [
      b.x,
      -0.32,
      b.z
    ]).castShadow = !1, v) for (let w = b.x - b.width / 2; w < b.x + b.width / 2; w += 1) for (let k = b.z - b.depth / 2; k < b.z + b.depth / 2; k += 4) {
      const E = Math.min(4, b.z + b.depth / 2 - k);
      e.mesh(u(w, k), "box", Qn[Math.abs(w + k) % Qn.length], [
        0.985,
        0.018,
        E - 0.025
      ], [
        w + 0.5,
        -9e-3,
        k + E / 2
      ]).castShadow = !1;
    }
    else if (!h && !g) for (let w = b.x - b.width / 2; w < b.x + b.width / 2; w += 4) for (let k = b.z - b.depth / 2; k < b.z + b.depth / 2; k += 4) {
      const E = Math.min(4, b.x + b.width / 2 - w), L = Math.min(4, b.z + b.depth / 2 - k), j = p ? Math.round(w / 4 + k / 4) % 2 ? f.marble : f.marbleLight : y;
      e.mesh(u(w, k), "box", j, [
        E - 0.04,
        0.018,
        L - 0.04
      ], [
        w + E / 2,
        -9e-3,
        k + L / 2
      ]).castShadow = !1;
    }
  if (ri(e, s.roads, s.surface, u), g) for (let b = 0; b < 320; b++) {
    const w = s.bounds.x + Math.sin(b * 127.13) * (s.bounds.width / 2 - 3), k = s.bounds.z + Math.cos(b * 53.71) * (s.bounds.depth / 2 - 3), E = {
      x: w,
      y: k
    };
    if (s.features.some((C) => Ja(E, C.footprint))) continue;
    const L = Math.min(...s.roads.flatMap((C) => C.points.slice(1).map((U, T) => Jn(E, C.points[T], U))));
    if (L < 2 || L > 9) continue;
    const j = e.mesh(u(w, k), "box", b % 3 ? f.streetSeam : f.streetStone, [
      0.4 + b % 3 * 0.18,
      0.025,
      0.25
    ], [
      w,
      -2e-3,
      k
    ]);
    j.rotation.y = b * 0.41, j.castShadow = !1;
  }
  if (p) {
    const b = u(0, -17);
    for (const w of [
      4,
      4.4,
      5.5
    ]) e.ring(b, f.brass, w, 0, -17, 1, !1, 0.09);
    for (let w = 0; w < 12; w++) {
      const k = w * Math.PI / 6;
      e.shape(b, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], f.brass, [
        Math.sin(k) * 4.6,
        0.095,
        -17 + Math.cos(k) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, k);
    }
  }
  for (const b of s.suspended ?? []) {
    const w = e.group(t);
    Vo(e, w, b), a.push(e.bake(w)), r.push({
      root: w,
      bounds: new xa().setFromObject(w).expandByScalar(0.1)
    });
  }
  const { bounds: M } = s;
  for (let b = 0; b < (h ? 420 : 0); b++) {
    const w = M.x + Math.sin(b * 127.13) * (M.width / 2 - 3), k = M.z + Math.cos(b * 53.71) * (M.depth / 2 - 3), E = {
      x: w,
      y: k
    };
    if (s.features.some((j) => Ja(E, {
      ...j.footprint,
      width: j.footprint.width + 1.5,
      depth: j.footprint.depth + 1.5
    })) || s.roads.some((j) => j.points.slice(1).some((C, U) => Jn(E, j.points[U], C) < j.width / 2 + 1))) continue;
    const L = u(w, k);
    if (b % 4 === 0) {
      const j = Array.from({ length: 9 }, (U, T) => {
        const H = T * Math.PI * 2 / 9, Y = 1 + Math.sin(T * 7 + b) * 0.3;
        return [Math.cos(H) * Y * (1.2 + b % 3), Math.sin(H) * Y * (0.7 + b % 2)];
      }), C = e.shape(L, j, b % 8 ? f.grassDark : f.grassLight, [
        w,
        5e-3,
        k
      ]);
      C.rotation.x = -Math.PI / 2;
    } else {
      for (let j = 0; j < 3; j++) {
        const C = e.mesh(L, "cone", b % 3 ? f.grassDark : f.leafLight, [
          0.035,
          0.3 + j * 0.09,
          0.035
        ], [
          w + (j - 1) * 0.16,
          0.15,
          k
        ]);
        C.rotation.z = (j - 1) * 0.35;
      }
      b % 11 === 0 && e.mesh(L, "rock", f.light, [
        0.12,
        0.13,
        0.12
      ], [
        w,
        0.38,
        k
      ]);
    }
  }
  for (const b of s.features) {
    const w = b.footprint, k = w.width > w.depth, E = Math.max(w.width, w.depth), L = b.kind === "wall" ? Math.ceil(E / 7) : 1, j = e.group(t);
    j.name = b.id;
    for (let C = 0; C < L; C++) {
      const U = -E / 2 + (C + 0.5) * E / L, T = L === 1 ? w : {
        ...w,
        x: w.x + (k ? U : 0),
        z: w.z + (k ? 0 : U),
        width: k ? E / L : w.width,
        depth: k ? w.depth : E / L
      }, H = L === 1 ? j : e.group(j);
      ti(e, u(T.x, T.z), H, {
        ...b,
        footprint: T
      }, s.vista === "interior") ? (a.push(e.bake(H)), r.push({
        root: H,
        bounds: new xa().setFromObject(H).expandByScalar(0.35)
      })) : H.removeFromParent();
    }
  }
  for (const b of s.roads.slice(0, 1)) for (let w = 1; w < b.points.length; w++) {
    const [k, E] = b.points[w];
    if (!(s.vista === "camp" && Math.hypot(k, E - 8) < 13))
      for (const L of [-1, 1]) Bs(e, u(k, E), k + L * (b.width / 2 + 0.6), E);
  }
  const x = e.group(t), S = s.vista === "interior" || s.vista === "room";
  if (e.mesh(x, "box", S ? f.undercroft : f.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, s.vista === "camp") for (let b = 0; b < 13; b++) {
    const w = -55 - b % 2 * 6, k = -44 + b * 7, E = 7 + b % 3 * 2;
    e.mesh(x, "box", f.distantWall, [
      10,
      E,
      6.5
    ], [
      w,
      E / 2,
      k
    ]);
    const L = e.mesh(x, "box", f.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      w,
      E,
      k
    ]);
    L.rotation.z = -0.16;
    for (let j = -1; j <= 1; j++) e.mesh(x, "box", b % 4 ? f.shadow : f.ember, [
      0.05,
      0.7,
      0.6
    ], [
      w + 5.03,
      E - 1.7,
      k + j * 1.6
    ], b % 4 === 0);
  }
  for (let b = 0; b < (S ? 0 : 12); b++) {
    const w = (b % 2 ? 1 : -1) * (M.width / 2 + 15 + b % 3 * 8), k = M.z - 25 + b * 7;
    e.mesh(x, "crown", b % 3 ? f.distantGround : f.distantLeaf, [
      17 + b % 4 * 3,
      6 + b % 3 * 2,
      22
    ], [
      w,
      -3,
      k
    ]);
  }
  for (let b = 0; b < (S || s.vista === "garden" ? 0 : 9); b++) {
    const w = (b - 4) * 12, k = M.z - M.depth / 2 - 15 - b % 3 * 6, E = 9 + b % 4 * 3;
    e.mesh(x, "box", f.distantWall, [
      9,
      E,
      9
    ], [
      w,
      E / 2 - 2,
      k
    ]), e.mesh(x, "cone", f.distantRoof, [
      7,
      6,
      7
    ], [
      w,
      E + 1,
      k
    ]);
    for (let L = -1; L <= 1; L++) e.mesh(x, "box", f.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      w + L * 2.2,
      E - 4,
      k + 4.55
    ]);
  }
  if (!S && s.vista !== "garden") {
    const b = M.z - M.depth / 2 - 28;
    e.mesh(x, "cylinder", f.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      b
    ]);
    for (const w of [
      10,
      22,
      33
    ]) e.mesh(x, "cylinder", f.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      w,
      b
    ]);
    for (let w = 0; w < 6; w++) {
      const k = w * Math.PI / 3, E = -17 + Math.sin(k) * 8.8, L = b + Math.cos(k) * 8.8;
      e.mesh(x, "box", f.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        E,
        19,
        L
      ]);
      const j = e.mesh(x, "box", f.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(k) * 9.02,
        26,
        b + Math.cos(k) * 9.02
      ], !0);
      j.rotation.y = k;
    }
    e.mesh(x, "cylinder", f.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      b
    ]), e.mesh(x, "cone", f.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      b
    ]);
  }
  a.push(e.bake(x));
  for (const b of n.values()) a.push(e.bake(b));
  return {
    update(b, w) {
      i.direction.copy(l.set(Math.sin(w), st.height / st.distance, Math.cos(w)).normalize());
      for (const k of r) {
        c.length = 0;
        for (const E of [0.1, 1.6])
          if (i.origin.set(b.x, E, b.y), o.ray.copy(i), i.intersectsBox(k.bounds) && o.intersectObject(k.root, !0, c), c.length) break;
        k.root.visible = c.length === 0;
      }
    },
    dispose() {
      a.forEach((b) => b()), t.clear();
    }
  };
}
function li(e, t, s, a, n, r, i = !0) {
  const l = r.has("captives_arrived"), o = e.group(t, [
    a,
    0,
    n
  ]), c = e.group(t), u = s === "sanniang", d = s === "laobai", h = s === "kouzi";
  o.rotation.y = u ? 0.25 : -0.35, i && (h || s === "anian") && (o.position.y = -0.3), o.scale.setScalar(d ? 1.24 : h ? 1.06 : s === "anian" ? 1.19 : 1.12);
  const p = u ? "#343d59" : d ? "#596a80" : h ? "#53617a" : "#79647d", g = "#615047", v = "#dfbaa0", y = d ? 0.39 : h ? 0.25 : 0.29, M = d ? 0.31 : 0.23, x = [];
  for (const F of [-1, 1]) {
    const Z = e.group(o, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    Z.rotation.x = i && (h || s === "anian") ? -1.15 : F * 0.06, x.push(Z), e.mesh(Z, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(Z, "cylinder", g, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(Z, "sphere", g, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(o, "sphere", p, [
    y,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(o, "cylinder", p, [
    M,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(o, "cylinder", g, [
    M + 0.015,
    0.08,
    0.23
  ], [
    0,
    1.01,
    0
  ]), e.mesh(o, "box", "#c6aa72", [
    0.13,
    0.11,
    0.03
  ], [
    0,
    1.01,
    0.244
  ]), e.mesh(o, "cylinder", v, [
    0.095,
    0.2,
    0.1
  ], [
    0,
    1.68,
    0
  ]);
  const S = e.group(o, [
    0,
    1.93,
    0.025
  ]);
  S.rotation.x = u ? 0.1 : -0.025, e.mesh(S, "sphere", v, [
    0.215,
    0.285,
    0.22
  ]);
  const b = u ? "#272b42" : h ? "#643d41" : s === "anian" ? "#483b40" : "#30343e";
  e.mesh(S, "sphere", b, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(S, "sphere", b, [
      0.045,
      0.17,
      0.095
    ], [
      F * 0.2,
      0.02,
      -0.03
    ]), e.mesh(S, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      F * 0.083,
      0.025,
      0.216
    ]), e.mesh(S, "box", b, [
      0.069,
      0.018,
      0.016
    ], [
      F * 0.086,
      0.093,
      0.219
    ]), e.mesh(S, "sphere", v, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(S, "sphere", v, [
    0.035,
    0.05,
    0.045
  ], [
    0,
    -0.025,
    0.223
  ]), e.mesh(S, "box", "#b47f70", [
    0.06,
    0.012,
    0.014
  ], [
    0,
    -0.126,
    0.194
  ]);
  for (const F of [-1, 1]) {
    const Z = e.group(o, [
      F * y,
      1.48,
      0
    ]);
    Z.rotation.z = F * 0.11, Z.rotation.x = u ? F > 0 ? -0.85 : -0.2 : F > 0 ? -0.4 : -0.1, e.mesh(Z, "cylinder", p, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(Z, "cylinder", u ? "#e8e1cc" : "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(Z, "cylinder", v, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(Z, "sphere", v, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]), u && F > 0 && (e.mesh(Z, "cylinder", "#b67e3f", [
      0.073,
      0.21,
      0.073
    ], [
      0,
      -0.68,
      0.1
    ]), e.mesh(Z, "cylinder", "#dbc8a2", [
      0.045,
      0.055,
      0.045
    ], [
      0,
      -0.55,
      0.1
    ]));
  }
  if (u) {
    e.mesh(o, "cylinder", p, [
      0.125,
      0.23,
      0.12
    ], [
      0,
      1.66,
      0
    ]), e.shape(o, [
      [-0.21, 0.36],
      [0.21, 0.36],
      [0.3, -0.36],
      [-0.3, -0.36]
    ], "#eee7d3", [
      0,
      1.02,
      0.238
    ], 0.014), e.mesh(o, "box", "#d0c4a4", [
      0.18,
      0.17,
      0.025
    ], [
      0.07,
      0.85,
      0.276
    ]);
    for (const F of [-1, 1]) {
      const Z = e.mesh(o, "box", "#eee7d3", [
        0.052,
        0.53,
        0.025
      ], [
        F * 0.16,
        1.39,
        0.19
      ]);
      Z.rotation.z = -F * 0.15;
    }
    e.mesh(S, "sphere", b, [
      0.19,
      0.17,
      0.13
    ], [
      0.09,
      -0.03,
      -0.22
    ]), e.mesh(S, "cylinder", "#dfba7a", [
      0.014,
      0.38,
      0.014
    ], [
      0.12,
      0.03,
      -0.26
    ]).rotation.z = 1.2, e.mesh(o, "cone", p, [
      0.4,
      0.85,
      0.32
    ], [
      0,
      0.66,
      0
    ]), e.mesh(o, "cylinder", "#803f4e", [
      0.27,
      0.075,
      0.245
    ], [
      0,
      1.01,
      0
    ]), e.shape(o, [
      [-0.35, 0.2],
      [0.35, 0.2],
      [0.43, -0.22],
      [-0.43, -0.22]
    ], p, [
      0,
      1.43,
      -0.23
    ], 0.018), e.mesh(o, "box", g, [
      0.24,
      0.28,
      0.17
    ], [
      -0.31,
      0.9,
      -0.05
    ]);
  } else if (d) {
    e.mesh(o, "sphere", p, [
      0.34,
      0.35,
      0.2
    ], [
      0,
      1.17,
      0.1
    ]), e.shape(o, [
      [-0.41, 0.34],
      [0.41, 0.34],
      [0.49, -0.58],
      [0.18, -0.7],
      [-0.35, -0.57]
    ], "#627a92", [
      0,
      1.18,
      -0.26
    ], 0.025), e.mesh(o, "box", "#aeb7b6", [
      0.44,
      0.14,
      0.11
    ], [
      0,
      1.62,
      0.19
    ]);
    const F = e.group(o, [
      -0.36,
      1.1,
      0.2
    ]);
    F.rotation.z = -0.18, e.mesh(F, "box", "#7a624b", [
      0.32,
      0.42,
      0.075
    ]), e.mesh(F, "box", "#e4dfcd", [
      0.27,
      0.36,
      0.025
    ], [
      0,
      0,
      0.047
    ]), e.mesh(o, "cylinder", "#e4dfcd", [
      0.13,
      0.25,
      0.14
    ], [
      0.16,
      0.36,
      0.06
    ]);
  } else if (h) {
    if (e.mesh(o, "cylinder", "#b48859", [
      0.18,
      0.17,
      0.17
    ], [
      0,
      1.65,
      0
    ]), e.mesh(o, "box", "#b48859", [
      0.17,
      0.38,
      0.04
    ], [
      0.08,
      1.42,
      0.24
    ]), e.mesh(o, "cylinder", "#74869e", [
      0.025,
      0.48,
      0.025
    ], [
      -0.36,
      0.67,
      0.18
    ]), e.mesh(o, "box", "#74869e", [
      0.13,
      0.11,
      0.055
    ], [
      -0.36,
      0.92,
      0.18
    ]), l && i) {
      o.position.y = 0.5;
      const F = e.mesh(c, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        a,
        0.72,
        n
      ]);
      F.rotation.z = Math.PI / 2;
      for (const Z of [-1, 1]) e.mesh(c, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + Z * 0.8,
        0.35,
        n
      ]);
    }
    e.mesh(o, "box", "#e7dbc4", [
      0.28,
      0.22,
      0.23
    ], [
      0.16,
      0.53,
      0.03
    ]), e.mesh(o, "box", "#6f5540", [
      0.24,
      0.21,
      0.15
    ], [
      -0.3,
      1,
      0.12
    ]), r.has("supplies_secured") && e.mesh(o, "cylinder", "#8caaa7", [
      0.035,
      0.44,
      0.035
    ], [
      -0.32,
      1.11,
      0.22
    ]), e.mesh(o, "box", "#6b5944", [
      0.52,
      0.43,
      0.03
    ], [
      0,
      1.29,
      0.24
    ]);
  } else {
    e.mesh(o, "cone", p, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(S, "sphere", b, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let Z = 0; Z < 3; Z++) {
      const G = e.mesh(o, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + Z * 0.02,
        1.02,
        0.31 + Z * 0.023
      ]);
      G.rotation.z = Z * 0.1;
    }
    const F = e.mesh(o, "box", "#d8ba87", [
      0.075,
      0.83,
      0.04
    ], [
      0,
      1.25,
      0.22
    ]);
    F.rotation.z = -0.55, e.mesh(o, "box", g, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const w = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  S.removeFromParent(), x.forEach((F) => F.removeFromParent());
  const k = x.map((F) => e.bake(F)), E = e.bake(o), L = e.bake(S), j = e.bake(c);
  o.add(S, ...x);
  const C = o.position.y, U = o.rotation.y, T = {
    x: a,
    y: n
  };
  let H = -1 / 0, Y = 0;
  return {
    root: o,
    ring: w,
    id: s,
    position: T,
    seated: i,
    locate(F, Z) {
      const G = T.x !== F.position.x || T.y !== F.position.y;
      return G && (H = Z), Y = F.facing, T.x = F.position.x, T.y = F.position.y, o.position.x = T.x, o.position.z = T.y, w.position.x = T.x, w.position.z = T.y, G;
    },
    update(F, Z, G) {
      const le = Z - H < 120, Ye = Math.hypot(F.x - T.x, F.y - T.y) < 10;
      w.visible = Ye;
      const et = le ? Math.PI / 2 - Y : Ye ? Math.atan2(F.x - T.x, F.y - T.y) : U, ke = Math.atan2(Math.sin(et - o.rotation.y), Math.cos(et - o.rotation.y));
      o.rotation.y += G ? ke : ke * 0.16, o.position.y = C + (G ? 0 : Math.sin(Z * 15e-4 + a) * 0.012), S.rotation.y = G ? 0 : Math.sin(Z * 8e-4 + n) * 0.04, i || x.forEach((ue, xe) => {
        ue.rotation.x = G || !le ? 0 : Math.sin(Z * 0.012 + xe * Math.PI) * 0.45;
      });
    },
    dispose() {
      E(), L(), j(), k.forEach((F) => F()), o.removeFromParent(), c.removeFromParent(), w.removeFromParent();
    }
  };
}
function ci(e, t, s, a) {
  const n = e.group(t), r = Qt[s.id], i = Object.values(Ne).find((d) => d.scene === s.id);
  let l = a, o = !1;
  const c = (r?.waves[0] ?? []).map((d) => {
    const h = _n(e, n, d.kind, ja[0]);
    h.bar.removeFromParent();
    const p = s.anchors[d.anchor], g = i?.sentryExits[d.anchor], v = g ? s.anchors[g] : p, y = a.has(r.complete) ? v : p;
    return h.root.position.set(y.x, 0, y.y), {
      ...h,
      home: p,
      aside: v,
      dispose: e.bake(h.root)
    };
  }), u = () => {
    n.visible = !o && !!r && (!!i || !l.has(r.complete));
  };
  return u(), {
    setFacts(d) {
      l = d, u();
    },
    setEncounterActive(d) {
      o = d, u();
    },
    animate(d) {
      if (!n.visible) return !1;
      let h = !1;
      for (const p of c) {
        const g = l.has(r.complete) ? p.aside : p.home, v = g.x - p.root.position.x, y = g.y - p.root.position.z, M = Math.hypot(v, y);
        if (M < 1e-3) continue;
        const x = d ? 1 : Math.min(1, 0.36 / M);
        p.root.position.x += v * x, p.root.position.z += y * x, p.root.rotation.y = M > 0.4 ? Math.atan2(v, y) : 0, h = !0;
      }
      return h;
    },
    dispose() {
      c.forEach((d) => d.dispose()), n.removeFromParent();
    }
  };
}
function di(e, t, s, a) {
  const n = Ne[s], r = _n(e, t, n.kind, ja[0]);
  r.bar.removeFromParent();
  const i = e.bake(r.root), l = { ...Ra(s, a) };
  r.root.position.set(l.x, 0, l.y);
  let o = a;
  return {
    id: s,
    root: r.root,
    position: l,
    setFacts(c) {
      o = c;
    },
    update(c, u) {
      const d = Ra(s, o), h = c.x - d.x, p = c.y - d.y, g = Math.hypot(h, p), v = g <= n.approachRadius, y = v && !o.has(n.complete) ? 1 : 0, M = d.x + (g ? h / g * y : 0), x = d.y + (g ? p / g * y : 0), S = l.x + l.y + r.root.rotation.y;
      l.x += u ? M - l.x : (M - l.x) * 0.22, l.y += u ? x - l.y : (x - l.y) * 0.22, Math.abs(M - l.x) + Math.abs(x - l.y) < 0.01 && (l.x = M, l.y = x);
      const b = v ? Math.atan2(h, p) : 0, w = Math.atan2(Math.sin(b - r.root.rotation.y), Math.cos(b - r.root.rotation.y));
      return r.root.rotation.y += u || Math.abs(w) < 5e-3 ? w : w * 0.2, r.root.position.set(l.x, 0, l.y), S !== l.x + l.y + r.root.rotation.y;
    },
    dispose() {
      i(), r.root.removeFromParent();
    }
  };
}
var $e = (e, t, s, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: s,
  facing: a
}), Vs = {
  camp: [
    {
      id: "mender",
      name: "补衣人",
      activity: "mend",
      coat: "rose",
      phase: 0,
      route: [$e(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [$e(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [$e(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [$e(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        $e(-31, 18, 6, -Math.PI / 2),
        $e(-27, 16, 0),
        $e(-23, 13, 7, Math.PI),
        $e(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        $e(10, 7, 6),
        $e(5, 10, 0),
        $e(-8, 13, 0),
        $e(-18, 14, 8, Math.PI),
        $e(-8, 13, 0),
        $e(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [$e(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: ne.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [$e(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [$e(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [$e(8, 2, 0)]
  }]
}, ui = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, hi = 0.85;
function es(e, t) {
  const s = e.route;
  if (s.length === 1) return {
    position: s[0].position,
    facing: s[0].facing,
    walking: !1
  };
  const a = s.map((r, i) => {
    const l = s[(i + 1) % s.length].position;
    return r.wait + Math.hypot(l.x - r.position.x, l.y - r.position.y) / hi;
  });
  let n = (t + e.phase) % a.reduce((r, i) => r + i, 0);
  for (let r = 0; r < s.length; r++) {
    if (n > a[r]) {
      n -= a[r];
      continue;
    }
    const i = s[r], l = s[(r + 1) % s.length].position;
    if (n <= i.wait) return {
      position: i.position,
      facing: i.facing,
      walking: !1
    };
    const o = (n - i.wait) / (a[r] - i.wait);
    return {
      position: {
        x: i.position.x + (l.x - i.position.x) * o,
        y: i.position.y + (l.y - i.position.y) * o
      },
      facing: Math.atan2(l.x - i.position.x, l.y - i.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function fi(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function pi(e, t) {
  e.updateWorldMatrix(!0, !0);
  const s = e.matrixWorld.clone().invert(), a = new fs(), n = [];
  e.traverse((l) => {
    if (!(l instanceof mt)) return;
    const o = (l.geometry.index ? l.geometry.toNonIndexed() : l.geometry.clone()).applyMatrix4(a.multiplyMatrices(s, l.matrixWorld)), c = l.material.color, u = new wr(new Float32Array(o.getAttribute("position").count * 3), 3);
    for (let d = 0; d < u.count; d++) u.setXYZ(d, c.r, c.g, c.b);
    o.setAttribute("color", u), n.push(o);
  });
  const r = bs(n);
  if (n.forEach((l) => l.dispose()), !r) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new mt(r, t);
  return i.receiveShadow = !0, e.add(i), () => {
    r.dispose(), e.clear();
  };
}
function mi(e, t, s, a) {
  const n = e.group(t), r = e.group(n), i = [], l = [], o = {
    blue: f.slate,
    rose: f.rose,
    cream: f.cloth
  }[s.coat], c = s.activity === "mend" || s.activity === "warm", u = "#dfbda7", d = c ? 0.75 : 1.05;
  e.mesh(r, "box", o, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    d,
    0
  ]), e.mesh(r, "crown", u, [
    0.23,
    0.27,
    0.21
  ], [
    0,
    d + 0.61,
    0
  ]), e.mesh(r, "crown", f.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    d + 0.77,
    -0.02
  ]), e.mesh(r, "box", f.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    d - 0.23,
    0
  ]), e.mesh(r, "box", f.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    d + 0.12,
    0.21
  ]);
  for (const p of [-1, 1]) {
    const g = e.group(n, [
      p * 0.36,
      d + 0.22,
      0
    ]);
    i.push(g), e.mesh(g, "box", o, [
      0.17,
      0.44,
      0.19
    ], [
      0,
      -0.2,
      0
    ]), e.mesh(g, "crown", u, [
      0.1,
      0.11,
      0.1
    ], [
      0,
      -0.46,
      0.02
    ]);
    const v = e.group(n, [
      p * 0.16,
      d - 0.31,
      0
    ]);
    l.push(v), e.mesh(v, "box", f.timber, [
      0.2,
      c ? 0.3 : 0.59,
      0.22
    ], [
      0,
      c ? -0.12 : -0.26,
      c ? 0.2 : 0
    ]), e.mesh(v, "box", f.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      c ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (c && e.mesh(r, "box", f.wood, [
    0.62,
    0.55,
    0.6
  ], [
    0,
    0.275,
    -0.12
  ]), s.activity === "water") for (const p of [-1, 1]) e.mesh(i[p > 0 ? 1 : 0], "box", f.wood, [
    0.36,
    0.39,
    0.36
  ], [
    p * 0.13,
    -0.65,
    0
  ]);
  else s.activity === "deliver" ? (e.mesh(r, "box", f.wood, [
    0.65,
    0.47,
    0.5
  ], [
    0,
    d - 0.05,
    0.45
  ]), e.mesh(r, "box", f.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    d - 0.05,
    0.72
  ])) : s.activity === "mend" || s.activity === "dressings" ? e.mesh(r, "box", f.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    d - 0.22,
    0.36
  ]) : s.activity === "warm" && e.mesh(r, "box", f.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    d + 0.1,
    0.38
  ]);
  n.traverse((p) => {
    p.castShadow = !1;
  });
  const h = [
    r,
    ...i,
    ...l
  ].map((p) => pi(p, a));
  return {
    root: n,
    body: r,
    arms: i,
    legs: l,
    dispose() {
      h.forEach((p) => p()), n.removeFromParent();
    }
  };
}
function vi(e, t, s) {
  const a = new ps({
    vertexColors: !0,
    roughness: 0.95
  }), n = (Vs[s] ?? []).map((l) => ({
    spec: l,
    model: mi(e, t, l, a),
    time: 0
  }));
  let r = null, i = null;
  return {
    animate(l, o, c, u) {
      const d = c ? 0 : fi(r, o);
      r = o;
      let h = n.length > 0 && i !== c;
      i = c;
      for (const p of n) {
        const { spec: g, model: v } = p, y = es(g, p.time), M = Math.hypot(y.position.x - l.x, y.position.y - l.y) < 27 && u(y.position);
        if (v.root.visible !== M && (v.root.visible = M, h = !0), !M) continue;
        p.time += d;
        const x = es(g, p.time), S = c ? 0 : Math.sin(p.time * (x.walking ? 5.5 : 1.5) + g.phase);
        v.root.position.set(x.position.x, 0, x.position.y), v.root.rotation.y = x.facing, v.body.position.y = x.walking ? Math.abs(S) * 0.035 : 0, v.legs.forEach((b, w) => {
          b.rotation.x = x.walking ? S * 0.35 * (w ? 1 : -1) : 0;
        }), v.arms.forEach((b, w) => {
          b.rotation.x = x.walking ? S * 0.24 * (w ? -1 : 1) : -0.6 + S * 0.13 * (w ? 1 : -1), g.activity === "deliver" && (b.rotation.x = -0.75), g.activity === "warm" && (b.rotation.x = -1.1), g.activity === "cook" && !w && (b.rotation.x = -0.8 + S * 0.3);
        }), h = d > 0 || h;
      }
      return h;
    },
    dispose() {
      n.forEach((l) => l.model.dispose()), a.dispose();
    }
  };
}
function gi(e, t, s, a) {
  const n = ii(e, t, s.landscape), r = e.group(t), i = e.group(t), l = ci(e, t, s, a), o = vi(e, i, s.id), c = [], u = Aa.filter((v) => Ne[v].scene === s.id).map((v) => di(e, i, v, a));
  let d = -1, h = null, p = null;
  function g(v) {
    const y = [...v].sort().join("/");
    if (y === p) return;
    p = y, u.forEach((x) => x.setFacts(v)), h?.(), l.setFacts(v);
    for (const x of Pa(s, v)) {
      const S = x.position;
      if (x.kind === "exit") {
        if (!x.target.doorway) for (const b of [-1, 1]) Bs(e, r, S.x + b * 1.7, S.y, 1.5);
        e.mesh(r, "box", f.brass, [
          3,
          0.025,
          0.35
        ], [
          S.x,
          0.12,
          S.y
        ]).castShadow = !1;
      } else if (x.target.kind === "inspect" && x.target.passage === "warning")
        e.mesh(r, "box", f.timber, [
          0.12,
          1.8,
          0.12
        ], [
          S.x,
          0.9,
          S.y
        ]), e.mesh(r, "box", f.wood, [
          1.4,
          0.7,
          0.13
        ], [
          S.x,
          1.6,
          S.y
        ]), e.mesh(r, "box", f.light, [
          0.7,
          0.4,
          0.025
        ], [
          S.x,
          1.6,
          S.y + 0.08
        ]);
      else if (x.target.kind === "inspect" && x.target.passage === "orders") {
        e.mesh(r, "box", f.slate, [
          2.2,
          0.8,
          1.2
        ], [
          S.x,
          0.4,
          S.y - 0.8
        ]);
        const b = e.mesh(r, "box", f.light, [
          1.8,
          0.08,
          0.9
        ], [
          S.x,
          0.85,
          S.y - 0.8
        ]);
        b.rotation.x = 0.2;
        for (let w = -1; w <= 1; w++) e.mesh(r, "cylinder", f.brass, [
          0.12,
          0.12,
          0.12
        ], [
          S.x + w * 0.45,
          0.95,
          S.y - 0.55
        ]);
      }
    }
    if (s.id === "camp") {
      const x = s.landscape.features.find((S) => S.kind === "clinic").footprint;
      if (v.has("clinic_helped")) {
        const S = s.landscape.features.find((b) => b.kind === "bench").footprint;
        for (const b of [-1, 1])
          e.mesh(r, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            S.x,
            0.91,
            S.z + b * 0.65
          ]), e.mesh(r, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            S.x,
            1.024,
            S.z + b * 0.65
          ]);
      }
      if (v.has("receiving_arranged")) for (const S of [-1, 1]) {
        const b = x.x + S * 2.4, w = x.z + x.depth / 2 - 0.2, k = e.group(r, [
          b,
          0.2,
          w
        ]);
        k.rotation.x = -0.16;
        for (const E of [-1, 1]) e.mesh(k, "cylinder", f.timber, [
          0.055,
          2.9,
          0.055
        ], [
          E * 0.42,
          1.4,
          0
        ]);
        e.mesh(k, "box", v.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const E of [0.7, 2.1]) e.mesh(k, "box", f.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          E,
          0.12
        ]);
      }
      if (v.has("warden_defeated")) {
        const S = s.landscape.features.find((b) => b.kind === "wagon").footprint;
        for (let b = 0; b < 4; b++) {
          const w = e.group(r, [
            S.x + (b % 2 ? 0.65 : -0.65),
            1.4,
            S.z + (b < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(w, "box", f.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const k of [-1, 1]) e.mesh(w, "box", f.brass, [
            0.08,
            0.78,
            1.22
          ], [
            k * 0.35,
            0.38,
            0
          ]);
          e.mesh(w, "box", f.light, [
            0.25,
            0.025,
            0.55
          ], [
            0,
            0.77,
            0
          ]);
        }
      }
    }
    for (const x of s.objects) {
      if (x.kind !== "switch") continue;
      const S = s.anchors[x.anchor], b = v.has(x.fact), w = e.group(r, [
        S.x,
        0,
        S.y
      ]);
      e.mesh(w, "box", f.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(w, "box", f.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const k = e.group(w, [
        0,
        0.75,
        0
      ]);
      k.rotation.z = b ? 0.65 : -0.65, e.mesh(k, "cylinder", f.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(k, "cylinder", f.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const M = $t(s, v);
    for (const x of s.landscape.gates) {
      const S = x.footprint, b = S.width > S.depth, w = Math.max(S.width, S.depth), k = e.group(r, [
        S.x,
        0,
        S.z
      ]);
      b || (k.rotation.y = Math.PI / 2);
      for (const E of [-1, 1]) e.mesh(k, "box", f.stone, [
        0.35,
        3.2,
        0.7
      ], [
        E * w / 2,
        1.6,
        0
      ]);
      if (e.mesh(k, "box", f.light, [
        w + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), M.closedGates.has(x.id)) {
        for (let E = -w / 2 + 0.2; E < w / 2; E += 0.4) e.mesh(k, "box", f.shadow, [
          0.065,
          3,
          0.1
        ], [
          E,
          1.5,
          0
        ]);
        for (const E of [0.4, 2.5]) e.mesh(k, "box", f.brass, [
          w,
          0.12,
          0.15
        ], [
          0,
          E,
          0
        ]);
      } else e.mesh(k, "box", f.shadow, [
        w,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const x of s.landscape.features) {
      if (x.kind !== "beacon" || v.has("alarm_silenced")) continue;
      const S = x.footprint, b = e.mesh(r, "cylinder", f.timber, [
        0.045,
        4.8,
        0.045
      ], [
        S.x + 3.3,
        2.7,
        S.z + 2.5
      ]);
      b.rotation.z = -0.32;
      for (let w = 0; w < 5; w++) e.mesh(r, "rock", w % 2 ? f.ember : f.cloth, [
        0.55,
        1.2 + w % 3 * 0.3,
        0.55
      ], [
        S.x + Math.sin(w * 2) * 0.7,
        5.4 + w % 3 * 0.3,
        S.z + Math.cos(w * 2) * 0.7
      ], !0);
    }
    h = e.bake(r);
  }
  return g(a), {
    setFacts: g,
    people: c,
    parleyPeople: u,
    setPeople(v, y) {
      let M = !1;
      for (const x of lt) {
        const S = v[x], b = Ia[x].station, w = Me[b.scene].anchors[b.anchor], k = S.mode === "idle" && (S.scene === "cells" || S.scene === b.scene && Math.hypot(S.position.x - w.x, S.position.y - w.y) < 1);
        let E = c.find((L) => L.id === x);
        E && (S.scene !== s.id || E.seated !== k) && (E.dispose(), c.splice(c.indexOf(E), 1), E = void 0, M = !0), S.scene === s.id && (E || (E = li(e, i, x, S.position.x, S.position.y, new Set(p?.split("/")), k), c.push(E), M = !0), M = E.locate(S, y) || M);
      }
      return M;
    },
    setEncounterActive(v) {
      l.setEncounterActive(v), u.forEach((y) => {
        y.root.visible = !v;
      });
    },
    update: n.update,
    animate(v, y, M, x) {
      const S = Math.floor(y / 80);
      if (S === d) return !1;
      d = S;
      let b = l.animate(M);
      b = o.animate(v, y, M, x) || b;
      for (const w of u) b = w.update(v, M) || b;
      for (const w of c) Math.hypot(w.position.x - v.x, w.position.y - v.y) < 22 ? (w.update(v, y, M), b = !M || b) : w.ring.visible = !1;
      return b;
    },
    dispose() {
      o.dispose(), c.splice(0).forEach((v) => v.dispose()), u.forEach((v) => v.dispose()), i.removeFromParent(), h?.(), l.dispose(), n.dispose();
    }
  };
}
var bi = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, yi = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, wi = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, xi = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Mi(e, t) {
  const s = new cr(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  let i = 0, l = !1;
  function o(c, u) {
    i++;
    const d = s.load(c, (h) => {
      if (l) {
        h.dispose();
        return;
      }
      i--, r.delete(c);
      for (const p of u) a.set(p, h);
      e(), t(r.size, i);
    }, void 0, () => {
      l || (i--, n.delete(d), d.dispose(), r.set(c, u), t(r.size, i));
    });
    d.colorSpace = vn, d.wrapS = d.wrapT = xr, d.anisotropy = 2, n.add(d);
  }
  for (const [c, u] of [
    [bi, [
      f.stone,
      f.wetStone,
      f.marble,
      f.marbleLight
    ]],
    [yi, [f.light]],
    [wi, [f.roof, f.roofLight]],
    [xi, [
      f.grass,
      f.grassLight,
      f.grassDark
    ]]
  ]) o(c, u);
  return {
    maps: a,
    retry() {
      if (!l && i === 0) {
        for (const [c, u] of r) o(c, u);
        t(r.size, i);
      }
    },
    dispose() {
      l = !0, n.forEach((c) => c.dispose()), n.clear(), a.clear(), r.clear();
    }
  };
}
function _i(e, t, s) {
  const a = new ms({
    antialias: !0,
    alpha: !1,
    powerPreference: s.world ? "default" : "high-performance"
  });
  a.outputColorSpace = vn, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, s.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const r = new hs(), i = new vs(-10, 10, 10, -10, 0.1, 180), l = ln();
  r.add(new gs("#effbff", "#74918a", 2));
  const o = new Qa("#fff4e5", 1.9);
  o.position.set(-12, 25, 13), o.castShadow = !0;
  const c = s.world ? 1024 : 1536;
  o.shadow.mapSize.set(c, c), Object.assign(o.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), o.shadow.bias = -4e-4, o.shadow.normalBias = 0.035, o.shadow.radius = 3, r.add(o);
  const u = new Qa("#c3edff", 1.1);
  u.position.set(7, 8, -15), r.add(u);
  const d = new sa(), h = new sa(), p = new sa();
  r.add(d, h, p);
  const g = Fs(l, h, s.traveler.gender), v = Do(l, p), y = Uo(l, p), M = Fo(n), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), b = [], w = matchMedia("(prefers-reduced-motion: reduce)"), k = new it(), E = new it();
  let L = null, j = "", C = "", U = "", T = null, H = null, Y = null, F = NaN, Z = NaN, G = NaN, le = null, Ye = 0, et = 0, ke = 1, ue = 1, xe = !0, dt = !1, Ct = !1, qe = 0, De = -1, Ge = 0, Re = !1;
  const fe = s.world ? Mi(() => {
    j = "", xe = !0, s.invalidate?.();
  }, (ve, tt) => s.artworkStatus?.(ve, tt)) : null;
  function He() {
    const ve = e.getBoundingClientRect();
    ke = Math.max(1, ve.width), ue = Math.max(1, ve.height), a.setSize(ke, ue, !1), xe = !0, Re = !1, s.invalidate?.();
  }
  const Ie = new ResizeObserver(He);
  Ie.observe(e), He();
  function ua(ve) {
    ve.preventDefault(), Ct = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", ua);
  function zt(ve, tt, Ve, ut, Qe = !1) {
    if (Math.abs(ve) < 1) return;
    const B = document.createElement("span");
    B.className = Qe ? "exp-damage is-player" : ve < 0 ? "exp-damage is-heal" : "exp-damage", B.textContent = `${ve < 0 ? "+" : ""}${Math.ceil(Math.abs(ve))}`, n.append(B), b.push({
      element: B,
      position: new it(tt, 2, Ve),
      born: ut
    });
  }
  function Kt() {
    for (const ve of x.values())
      h.remove(ve.actor.root), ve.marker.remove();
    x.clear(), b.splice(0).forEach((ve) => ve.element.remove());
  }
  function ha(ve) {
    return Re ? (E.set(ve.x, 1, ve.y).project(i), Math.abs(E.x) < 1.15 && Math.abs(E.y) < 1.15) : !0;
  }
  return {
    draw(ve, tt, Ve, ut = "battle", Qe = 0, B) {
      if (dt || Ct) return;
      const Za = performance.now(), V = ut === "battle" ? ve : null, Ua = V?.tick ?? (w.matches ? 0 : Qe * 0.025), Ot = (V?.tick ?? -1) !== De, Xt = `${tt.weapon}/${tt.outfit}/${Ve}`;
      if (!B && !xe && ut === C && Xt === U && V === T && (!Ot && V || !V && (ut === "between" || w.matches || Qe - qe < 40))) return;
      qe = Qe;
      const Jt = ja[Ve], fa = B ? B.definition.id : `${Ve}:${V?.boss ?? !1}:${!!V}`;
      if (fa !== j) {
        if (S.forEach((X) => X.remove()), S.clear(), L?.(), B) {
          const X = ln(fe?.maps);
          H = gi(X, d, B.definition, B.facts);
          const te = H;
          L = () => {
            te.dispose(), X.dispose();
          };
        } else
          H = null, L = Ao(l, d, Ve, V);
        Re = !1, j = fa, r.background = new mn(Jt.sky), r.fog = new dr(Jt.haze, 42, 95);
      } else B && le !== B.facts && H?.setFacts(B.facts);
      (!!V != !!T || V && T && V.tick < De) && (Kt(), Ge = V?.player.hp ?? 0);
      const ea = !B && ut !== "battle", at = ke < 600, ta = at || ue < 400, Zt = ke / ue, O = B?.definition.landscape.vista === "room", D = O ? at ? 20 : Math.max(30, Zt * (ue < 400 ? 19 : 25)) : B ? (at ? st.mobileWidth : Math.max(st.minimumWidth, Zt * (ue < 400 ? st.shortSpan : st.tallSpan))) * (B.definition.safe && !V ? st.settlementScale : 1) : ea ? at ? 13 : 28 : at ? 18.5 : Math.max(27, Zt * (ue < 400 ? 14 : 23)), A = Math.max(0, K.arena - D / 2 + 0.5), Se = B ? B.location.position.x * (O ? 0.4 : 1) : V ? ta ? V.player.x * 0.62 : Math.max(-A, Math.min(A, V.player.x * 0.62)) : at ? 0 : 5.5, Pt = B ? O ? B.location.position.y * 0.4 - 1 : B.location.position.y - st.lead : V ? V.player.y * (ta ? 0.62 : 0.2) - 0.4 : at ? -4.2 : -11.8;
      B && Math.hypot(F - B.location.position.x, Z - B.location.position.y) > 8 && (Re = !1);
      const aa = Math.abs(k.x - Se) + Math.abs(k.z - Pt) < 0.015, Ks = B && H?.setPeople(B.people, Qe), Xs = B && H?.animate(B.location.position, Qe, w.matches, ha);
      if (B && !xe && Re && aa && Xt === U && V === T && !Ot && F === B.location.position.x && Z === B.location.position.y && G === B.location.facing && le === B.facts && !Xs && !Ks) return;
      !Re || w.matches ? (k.set(Se, 0, Pt), Re = !0) : (k.x += (Se - k.x) * 0.14, k.z += (Pt - k.z) * 0.14), i.left = -D / 2, i.right = D / 2, i.top = D / Zt / 2, i.bottom = -i.top;
      const Na = ea ? 0 : 1 * Math.PI / 4, Sn = B ? st.distance : 25;
      i.position.set(k.x + Math.sin(Na) * Sn, B ? st.height : 28, k.z + Math.cos(Na) * Sn), i.lookAt(k.x, 0, k.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), B && (H?.setEncounterActive(!!V), H?.update(B.location.position, Na)), S.forEach((X) => {
        X.hidden = !0;
      });
      const Js = new Set(B && !V ? [...wn(B.definition, B.location.position, B.facts, B.people), ...Ta(B.definition.id, B.location.position, B.facts)].map((X) => X.target.id) : []);
      for (const X of [...H?.people ?? [], ...H?.parleyPeople ?? []]) {
        if (V || !B || Math.hypot(X.position.x - B.location.position.x, X.position.y - B.location.position.y) > 10) continue;
        let te = S.get(X.id);
        te || (te = document.createElement("span"), te.className = "exp-person-name", te.textContent = Be(X.id), n.append(te), S.set(X.id, te)), te.textContent = Js.has(X.id) ? `${Be(X.id)} · ${ne.actions.talk}` : Be(X.id), E.set(X.position.x, 2.9 + X.root.position.y, X.position.y).project(i);
        const Te = (E.x * 0.5 + 0.5) * ke, ht = (-E.y * 0.5 + 0.5) * ue;
        te.hidden = Te < 30 || Te > ke - 30 || ht < 20 || ht > ue - 20, te.style.transform = `translate(${Te}px,${ht}px) translate(-50%,-100%)`;
      }
      s.world && (o.position.set(k.x - 12, 25, k.z + 13), o.target.position.set(k.x, 0, k.z), o.target.updateMatrixWorld());
      const er = B ? {
        ...B.location.position,
        facing: B.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      g.update(V?.player ?? er, tt.weapon, tt.outfit, Ua, w.matches, ea, !!V?.effects.some((X) => X.kind === "resonance"));
      for (const X of V?.enemies ?? []) {
        let te = x.get(X.id);
        if (!te) {
          const Ba = document.createElement("i");
          Ba.className = _e(X.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Ba), te = {
            actor: _n(l, h, X.kind, Jt),
            hp: X.hp,
            death: null,
            marker: Ba
          }, x.set(X.id, te);
        }
        te.hp > X.hp && Ot && zt(te.hp - X.hp, X.x, X.y, V.tick), te.hp = X.hp, te.actor.update(X, V.tick, w.matches), te.actor.bar.quaternion.copy(i.quaternion), E.set(X.x, 1.2, X.y).project(i);
        const Te = (E.x * 0.5 + 0.5) * ke, ht = (-E.y * 0.5 + 0.5) * ue, $n = Math.min(18, ke / 2), Cn = Math.min(at ? 132 : 95, ue * 0.3), tr = Math.max(Cn, ue - Math.min(130, ue * 0.3)), Da = Math.max($n, Math.min(ke - $n, Te)), Fa = Math.max(Cn, Math.min(tr, ht));
        te.marker.hidden = Math.abs(Te - Da) + Math.abs(ht - Fa) < 10, te.marker.style.transform = `translate(${Da}px,${Fa}px) rotate(${Math.atan2(ht - Fa, Te - Da) + Math.PI / 2}rad)`;
      }
      for (const [X, te] of x) {
        if (V?.enemies.some((ht) => ht.id === X)) continue;
        te.death === null && (te.death = V?.tick ?? 0, V && te.hp > 0 && zt(te.hp, te.actor.root.position.x, te.actor.root.position.z, V.tick));
        const Te = ((V?.tick ?? 0) - te.death) / 12;
        te.actor.bar.visible = !1, te.marker.hidden = !0, te.actor.root.scale.setScalar(Math.max(0, 1 - Te)), (Te >= 1 || !V || w.matches) && (h.remove(te.actor.root), te.marker.remove(), x.delete(X));
      }
      V && Ot && (Ge !== V.player.hp && zt(Ge - V.player.hp, V.player.x, V.player.y, V.tick, Ge > V.player.hp), Ge = V.player.hp), v.update(V, w.matches);
      const Rn = V?.effects.filter((X) => X.kind === "ward-hit").at(-1);
      y.update(V?.player ?? null, Rn ? Math.max(0, (Rn.life - 5) / 10) : 0), M.update(V, i, ke, ue);
      for (let X = b.length - 1; X >= 0; X--) {
        const te = b[X], Te = ((V?.tick ?? 0) - te.born) / 27;
        if (Te >= 1 || !V) {
          te.element.remove(), b.splice(X, 1);
          continue;
        }
        E.copy(te.position), E.y += w.matches ? 0 : Te * 0.9, E.project(i), te.element.style.transform = `translate(${(E.x * 0.5 + 0.5) * ke}px,${(-E.y * 0.5 + 0.5) * ue}px)`, te.element.style.opacity = String(Math.min(1, (1 - Te) * 3));
      }
      a.render(r, i), Ye++, et += performance.now() - Za, B && Y !== B.definition.id && (Y = B.definition.id, s.sceneReady?.(Y)), xe = !1, C = ut, U = Xt, T = V, De = V?.tick ?? -1, B && (F = B.location.position.x, Z = B.location.position.y, G = B.location.facing, le = B.facts);
    },
    invalidate() {
      xe = !0, s.invalidate?.();
    },
    retryArtwork() {
      fe?.retry();
    },
    stats() {
      return {
        draws: Ye,
        submitMs: et,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      dt = !0, Ie.disconnect(), a.domElement.removeEventListener("webglcontextlost", ua), Kt(), g.dispose(), M.dispose(), y.dispose(), L?.(), fe?.dispose(), o.shadow.dispose(), l.dispose(), r.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function dn(e) {
  if (e.kind === "exit") return `${ne.actions.travel} ${ne.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${ne.actions.talk} · ${ne.people[t.person]}`;
    case "enemy":
      return `${ne.actions.talk} · ${Be(t.enemy)}`;
    case "inspect":
      return ne.passages[t.passage].title;
    case "rest":
      return ne.actions.rest;
    case "switch":
      return ne.switches[t.fact];
  }
}
var ki = ["aria-label"], Si = { class: "journey-heading" }, Ri = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, $i = ["disabled"], Ci = {
  key: 1,
  class: "journey-controls"
}, zi = ["aria-label"], Pi = {
  key: 0,
  class: "journey-interaction"
}, Ei = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Ii = {
  key: 0,
  class: "journey-resource"
}, Li = [
  "max",
  "value",
  "aria-label"
], Ai = ["disabled"], Ti = ["disabled"], ji = {
  key: 2,
  class: "journey-overlay"
}, Oi = /* @__PURE__ */ We({
  __name: "ExplorationField",
  props: {
    world: {},
    traveler: {},
    paused: { type: Boolean },
    transitioning: { type: Boolean },
    weapon: {},
    outfit: {},
    battle: {}
  },
  emits: [
    "input",
    "interact",
    "pause",
    "resume",
    "ready",
    "error"
  ],
  setup(e, { expose: t, emit: s }) {
    const a = e, n = s, r = W(null), i = W(null), l = W({
      x: 0,
      y: 0
    }), o = W(null), c = W({
      failed: 0,
      pending: 0
    }), u = J(() => a.battle ? [] : [
      ...Ta(a.world.definition.id, a.world.location.position, a.world.facts),
      ...co(a.world.definition, a.world.location, a.world.facts),
      ...wn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), d = J(() => u.value.find((Z) => Z.target.id === o.value) ?? null), h = J(() => a.weapon === "grimoire" ? ae.contractPower : ae.resource);
    let p = null, g = null, v = 0, y = 0, M = 0, x = !1, S = !0;
    const b = Lo((Z, G) => {
      l.value = {
        x: Z * 26,
        y: G * 26
      }, g?.stick(Z, G);
    }, () => r.value?.focus({ preventScroll: !0 }));
    function w() {
      b.clear(), g?.clear(), M = 0;
    }
    function k() {
      w(), n("pause");
    }
    function E() {
      p?.retryArtwork();
    }
    function L() {
      document.hidden ? (cancelAnimationFrame(v), v = 0, k()) : (p?.invalidate(), j());
    }
    function j() {
      !v && !x && S && (y = 0, v = requestAnimationFrame(F));
    }
    function C() {
      !a.paused && d.value && (w(), n("interact", d.value.target.id));
    }
    function U(Z) {
      (!Z || Z.detail === 0) && g?.dash();
    }
    function T(Z) {
      (!Z || Z.detail === 0) && g?.skill();
    }
    function H(Z, G) {
      Z.button === 0 && g?.[G]();
    }
    function Y() {
      const Z = u.value.findIndex((G) => G.target.id === o.value);
      o.value = u.value[(Z + 1) % u.value.length]?.target.id ?? null;
    }
    function F(Z) {
      if (v = 0, x || !S) return;
      !a.paused && !document.hidden && (v = requestAnimationFrame(F));
      const G = y ? Math.min(100, Z - y) : 0;
      if (y = Z, !a.paused && !document.hidden)
        for (M += G; M >= 1e3 / K.hz && !a.paused; ) {
          M -= 1e3 / K.hz;
          const le = g.frame();
          if (le.skill && !a.battle) {
            C();
            break;
          }
          n("input", le);
        }
      else M = 0;
      if (!document.hidden) try {
        p?.draw(a.battle ?? null, a, 0, "battle", Z, a.world);
      } catch (le) {
        cancelAnimationFrame(v), v = 0, w(), n("error", le);
      }
    }
    return me(u, (Z) => {
      Z.some((G) => G.target.id === o.value) || (o.value = Z[0]?.target.id ?? null);
    }, { immediate: !0 }), me(() => a.world.definition.id, () => {
      w(), o.value = u.value[0]?.target.id ?? null, r.value?.focus({ preventScroll: !0 });
    }), me(() => a.paused, (Z) => {
      w(), j(), Z || r.value?.focus({ preventScroll: !0 });
    }), me(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.weapon,
      a.outfit
    ], j), jt(() => {
      try {
        p = _i(i.value, () => {
          k(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: j,
          sceneReady: (Z) => n("ready", Z),
          artworkStatus: (Z, G) => {
            c.value = {
              failed: Z,
              pending: G
            };
          }
        });
      } catch (Z) {
        n("error", Z);
        return;
      }
      g = Io(r.value, k, () => {
      }), document.addEventListener("visibilitychange", L), j(), r.value?.focus({ preventScroll: !0 });
    }), fn(() => {
      S = !1, cancelAnimationFrame(v), v = 0, k();
    }), ls(() => {
      S = !0, j();
    }), Rt(() => {
      x = !0, cancelAnimationFrame(v), w(), g?.dispose(), document.removeEventListener("visibilitychange", L), p?.dispose();
    }), t({
      stats: () => p?.stats(),
      focus: () => r.value?.focus({ preventScroll: !0 })
    }), (Z, G) => (P(), I("section", {
      ref_key: "root",
      ref: r,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? m(ae).controls : m(ne).actions.controls
    }, [
      _("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      _("header", Si, [_("h1", null, $(m(ne).scenes[e.world.definition.id]), 1), En(Z.$slots, "status", {}, void 0, !0)]),
      c.value.failed ? (P(), I("div", Ri, [_("span", null, $(m(ne).artwork.unavailable), 1), _("button", {
        type: "button",
        disabled: c.value.pending > 0,
        onClick: E
      }, $(c.value.pending ? m(ne).artwork.loading : m(ne).artwork.retry), 9, $i)])) : Q("", !0),
      e.paused ? Q("", !0) : (P(), I("div", Ci, [
        _("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": m(ne).actions.move,
          onPointerdown: G[0] || (G[0] = pt((...le) => m(b).down && m(b).down(...le), ["prevent"])),
          onPointermove: G[1] || (G[1] = pt((...le) => m(b).move && m(b).move(...le), ["prevent"])),
          onPointerup: G[2] || (G[2] = (...le) => m(b).release && m(b).release(...le)),
          onPointercancel: G[3] || (G[3] = (...le) => m(b).release && m(b).release(...le)),
          onLostpointercapture: G[4] || (G[4] = (...le) => m(b).release && m(b).release(...le)),
          onContextmenu: G[5] || (G[5] = pt(() => {
          }, ["prevent"]))
        }, [_("span", { style: Yt({ transform: `translate(${l.value.x}px, ${l.value.y}px)` }) }, null, 4)], 40, zi),
        d.value ? (P(), I("div", Pi, [_("button", {
          type: "button",
          class: "journey-act",
          onClick: C
        }, [G[9] || (G[9] = _("kbd", null, "E", -1)), Oe($(m(dn)(d.value)), 1)]), u.value.length > 1 ? (P(), I("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: Y
        }, $(m(ne).actions.next), 1)) : Q("", !0)])) : Q("", !0),
        e.battle ? (P(), I("div", Ei, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? (P(), I("div", Ii, [
            _("span", null, $(e.battle.player.resonance > 0 ? m(ae).resonanceActive : h.value), 1),
            _("meter", {
              min: "0",
              max: m(ot).maxPower,
              value: e.battle.player.resource,
              "aria-label": h.value
            }, null, 8, Li),
            _("small", null, $(e.battle.player.resonance > 0 ? m(ae).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : Q("", !0),
          _("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: G[6] || (G[6] = pt((le) => H(le, "dash"), ["prevent"])),
            onClick: U
          }, [
            _("kbd", null, $(m(ae).dashKey), 1),
            Oe($(m(ae).dash), 1),
            _("small", null, $(e.battle.player.dash > 0 ? m(ae).secondsLeft(e.battle.player.dash) : m(ae).ready), 1)
          ], 40, Ai),
          _("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: G[7] || (G[7] = pt((le) => H(le, "skill"), ["prevent"])),
            onClick: T
          }, [
            _("kbd", null, $(m(ae).skillKey), 1),
            Oe($(m(wt)[e.weapon].action), 1),
            _("small", null, $(e.battle.player.skill > 0 ? m(ae).secondsLeft(e.battle.player.skill) : m(ae).ready), 1)
          ], 40, Ti)
        ])) : Q("", !0)
      ])),
      e.paused && !e.transitioning ? (P(), I("div", ji, [En(Z.$slots, "overlay", {}, () => [_("button", {
        class: "journey-act",
        type: "button",
        onClick: G[8] || (G[8] = (le) => n("resume"))
      }, $(m(ne).actions.resume), 1)], !0)])) : Q("", !0)
    ], 8, ki));
  }
}), Zi = /* @__PURE__ */ ct(Oi, [["__scopeId", "data-v-a7e66cb8"]]);
function Ui(e) {
  const t = new Set(e.location.visited.map(ra)), s = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const r = ra(n);
    for (const i of Pa(Me[n], s)) {
      if (i.kind !== "exit") continue;
      const l = ra(i.target.to), o = [r, l].sort().join("/");
      r !== l && (t.add(l), a.set(o, {
        id: o,
        from: r,
        to: l
      }));
    }
  }
  return {
    scenes: [...t],
    links: [...a.values()]
  };
}
function Ys(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function Ni(e, t) {
  const s = Ys(t), a = 3 * s, n = [], r = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let l = r(i), o = -1;
    for (let c = 0; c <= 48; c++) {
      const u = Math.ceil(c / 8) * 5.2 * s, d = c * Math.PI / 4, h = r({
        x: i.x + Math.cos(d) * u,
        y: i.y + Math.sin(d) * u
      }), p = Math.min(1 / 0, ...n.map((g) => Math.hypot(g.x - h.x, g.y - h.y)));
      if (p > o && (l = h, o = p), p >= 5.2 * s) break;
    }
    n.push(l);
  }
  return n;
}
var Di = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, Fi = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, Bi = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, Wi = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, qi = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, Hi = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, Vi = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, Yi = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, Gi = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, Qi = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, Ki = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, Xi = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, Ji = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, el = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, tl = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, al = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, nl = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, sl = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, rl = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, un = {
  city: Di,
  cityMobile: Fi,
  chapter: Bi
}, ol = {
  blade: Wi,
  bow: qi,
  staff: Hi,
  daggers: Vi,
  grimoire: Yi,
  cannon: Gi
}, hn = {
  camp: Qi,
  crossroads: Ki,
  gate: Xi,
  beacon: Ji,
  waterway: el,
  cells: tl,
  hall: al,
  roots: nl
}, ts = {
  arrival: sl,
  ending: rl
}, il = { class: "ember-map-header" }, ll = ["src"], cl = ["aria-pressed"], dl = ["viewBox", "aria-label"], ul = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], hl = ["transform"], fl = ["fill"], pl = {
  y: "22",
  "text-anchor": "middle"
}, ml = ["viewBox", "aria-label"], vl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], gl = ["points", "stroke-width"], bl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], yl = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], wl = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], xl = [
  "cx",
  "cy",
  "r",
  "fill"
], Ml = ["x", "y"], _l = {
  key: 2,
  class: "ember-map-key"
}, kl = {
  key: 3,
  class: "ember-map-places"
}, Sl = /* @__PURE__ */ We({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, a = t, n = W(!1), r = W(null), i = W(!1), l = W(null), o = W({
      width: 400,
      height: 400
    }), c = new ResizeObserver((b) => {
      for (const w of b) {
        const { width: k, height: E } = w.contentRect;
        w.target === r.value ? i.value = k > E * 1.55 : o.value = {
          width: k,
          height: E
        };
      }
    });
    me(l, (b, w) => {
      w && c.unobserve(w), b && c.observe(b);
    }), jt(() => {
      c.observe(r.value);
    }), Rt(() => c.disconnect());
    const u = {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 10],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70]
    }, d = J(() => Ui(s.campaign)), h = J(() => Object.fromEntries(d.value.scenes.map((b) => {
      const [w, k] = u[b], { width: E, height: L } = o.value;
      return [b, i.value ? [50 + (104 - k) / 104 * (E - 100), 10 + (w - 10) / 80 * (L - 40)] : [45 + w / 104 * (E - 90), 10 + k / 104 * (L - 40)]];
    }))), p = J(() => d.value.links), g = J(() => Me[s.campaign.location.scene]), v = J(() => g.value.landscape.bounds), y = J(() => Ys(v.value)), M = J(() => `${v.value.x - v.value.width / 2 - 5 * y.value} ${v.value.z - v.value.depth / 2 - 5 * y.value} ${v.value.width + 10 * y.value} ${v.value.depth + 10 * y.value}`), x = J(() => Ts(s.campaign)), S = J(() => {
      const b = Ni(x.value.map((w) => w.position), v.value);
      return x.value.map((w, k) => ({
        ...w,
        marker: b[k]
      }));
    });
    return (b, w) => (P(), I("div", {
      ref_key: "root",
      ref: r,
      class: St(["ember-map", {
        "ember-map-wide": i.value,
        "ember-map-local": !n.value
      }])
    }, [
      _("div", il, [
        m(hn)[g.value.id] ? (P(), I("img", {
          key: 0,
          src: m(hn)[g.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, ll)) : Q("", !0),
        _("h2", null, $(n.value ? m(N).chapterMap : m(ne).scenes[g.value.id]), 1),
        _("div", null, [_("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: w[0] || (w[0] = (k) => n.value = !n.value)
        }, $(n.value ? m(N).localMap : m(N).chapterMap), 9, cl), _("button", {
          type: "button",
          onClick: w[1] || (w[1] = (k) => a("close"))
        }, $(m(N).close), 1)])
      ]),
      n.value ? (P(), I("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: l,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": m(N).chapterMap,
        class: "ember-route-map"
      }, [(P(!0), I(re, null, Le(p.value, (k) => (P(), I("line", {
        key: k.id,
        x1: h.value[k.from][0],
        y1: h.value[k.from][1],
        x2: h.value[k.to][0],
        y2: h.value[k.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(k.from) && e.campaign.location.visited.includes(k.to) ? void 0 : "4 4"
      }, null, 8, ul))), 128)), (P(!0), I(re, null, Le(h.value, (k, E) => (P(), I("g", {
        key: E,
        transform: `translate(${k.join(",")})`
      }, [
        _("circle", {
          r: "6",
          fill: E === m(ra)(g.value.id) ? "#bf6242" : e.campaign.location.visited.includes(E) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, fl),
        _("text", pl, $(e.campaign.location.visited.includes(E) ? m(ne).scenes[E] : m(N).unknownArea), 1),
        _("title", null, $(e.campaign.location.visited.includes(E) ? m(ne).scenes[E] : m(N).unknownArea), 1)
      ], 8, hl))), 128))], 8, dl)) : (P(), I("svg", {
        key: 1,
        viewBox: M.value,
        role: "img",
        "aria-label": m(ne).scenes[g.value.id]
      }, [
        _("rect", {
          x: v.value.x - v.value.width / 2,
          y: v.value.z - v.value.depth / 2,
          width: v.value.width,
          height: v.value.depth,
          rx: "2",
          fill: g.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, vl),
        (P(!0), I(re, null, Le(g.value.landscape.roads, (k, E) => (P(), I("polyline", {
          key: E,
          points: k.points.map((L) => L.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": k.width,
          "stroke-linejoin": "round"
        }, null, 8, gl))), 128)),
        (P(!0), I(re, null, Le(g.value.landscape.features, (k) => (P(), I("rect", {
          key: k.id,
          x: k.footprint.x - k.footprint.width / 2,
          y: k.footprint.z - k.footprint.depth / 2,
          width: k.footprint.width,
          height: k.footprint.depth,
          fill: k.kind === "water" ? "#6eb8c6" : k.kind === "tree" || k.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, bl))), 128)),
        _("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * y.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": y.value
        }, [_("title", null, $(m(N).here), 1)], 8, yl),
        (P(!0), I(re, null, Le(S.value, (k, E) => (P(), I("g", { key: k.target.id }, [
          _("line", {
            x1: k.position.x,
            y1: k.position.y,
            x2: k.marker.x,
            y2: k.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * y.value
          }, null, 8, wl),
          _("circle", {
            cx: k.marker.x,
            cy: k.marker.y,
            r: 2.4 * y.value,
            fill: k.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, xl),
          _("text", {
            class: "ember-map-number",
            style: Yt({ fontSize: `${3.4 * y.value}px` }),
            x: k.marker.x,
            y: k.marker.y + 1.1 * y.value,
            "text-anchor": "middle"
          }, $(E + 1), 13, Ml),
          _("title", null, $(m(dn)(k)), 1)
        ]))), 128))
      ], 8, ml)),
      n.value ? (P(), I("p", _l, $(m(N).mapKey), 1)) : (P(), I("ol", kl, [(P(!0), I(re, null, Le(x.value, (k) => (P(), I("li", { key: k.target.id }, $(m(dn)(k)), 1))), 128))]))
    ], 2));
  }
}), Rl = /* @__PURE__ */ ct(Sl, [["__scopeId", "data-v-4b7b0a2d"]]), as = {
  map: {
    body: "M8 15 24 9 40 15 56 9 56 49 40 55 24 49 8 55Z",
    detail: "M24 9V49 M40 15V55 M14 38 20 31 30 36 47 23 M44 19 50 25 M50 19 44 25"
  },
  blade: {
    body: "M31 5 38 15 26 39 20 35Z M18 32 30 39 27 44 15 37Z M19 41 24 44 17 57 12 54Z",
    detail: "M31 12 23 35 M15 54 20 45"
  },
  bow: {
    body: "M19 7Q51 28 21 57L25 48Q40 31 24 16Z M30 31 50 27 45 34Z",
    detail: "M19 7 28 32 21 57 M13 37 48 29 M13 37 15 30 M13 37 20 39"
  },
  staff: {
    body: "M29 28 35 29 31 58 26 57Z M32 6 42 17 32 30 22 17Z",
    detail: "M32 6 32 30 M22 17 42 17 M19 9 15 13 M45 22 48 18 M23 46 35 47"
  },
  daggers: {
    body: "M10 7 28 25 23 36 16 29Z M54 7 36 25 41 36 48 29Z M22 39 29 33 35 52 29 55Z M42 39 35 33 29 52 35 55Z",
    detail: "M12 34 31 29 M52 34 33 29"
  },
  grimoire: {
    body: "M9 15Q22 9 32 17 43 9 55 15L52 51Q40 45 32 53 22 45 12 51Z",
    detail: "M32 17 32 53 M16 23 26 26 M38 26 48 23 M17 33 25 35 M39 35 47 33"
  },
  cannon: {
    body: "M15 23 51 16 55 32 21 40Z M23 42 42 42 48 54 14 54Z",
    detail: "M46 17 50 33 M23 24 27 37 M32 42 32 52 M11 15 6 10 M13 23 5 23"
  },
  wardrobe: {
    body: "M21 12 28 9 36 9 43 12 54 23 45 31 42 26 42 54 22 54 22 26 19 31 10 23Z",
    detail: "M28 9Q32 25 36 9 M27 46 37 46"
  },
  "storm-step": {
    body: "M23 10 40 13 34 37 46 43 44 52 17 52 15 44 23 35Z",
    detail: "M30 15 25 28 35 25 27 40 M19 45 43 45 M17 56 45 56"
  },
  conductor: {
    body: "M30 7 36 18 31 47 27 53 24 46Z M17 22 44 26 42 32 16 28Z",
    detail: "M12 12 8 20 17 18 11 28 M48 35 54 31 49 42 56 41 M20 56 35 56"
  },
  momentum: {
    body: "M32 12 41 17 45 27 42 40 31 48 21 42 17 30 21 19Z M31 22 36 29 32 37 27 30Z",
    detail: "M9 31A23 23 0 0 1 43 10 M43 5 44 11 38 13 M55 30A23 23 0 0 1 20 53 M20 59 18 53 25 51"
  },
  cinder: {
    body: "M32 7C38 23 49 27 46 42 44 52 20 57 17 42 14 33 21 24 25 21 23 33 29 35 32 7Z",
    detail: "M32 34Q44 47 32 52 24 49 32 34 M12 20 15 17 M48 16 51 21"
  },
  wildfire: {
    body: "M24 8 41 8 39 16 39 24Q53 37 44 50 32 58 21 50 11 39 26 24L26 16Z",
    detail: "M24 16 40 16 M20 35Q32 30 45 35 M31 34Q24 47 33 49 43 46 35 39 M30 5 37 5"
  },
  "blood-price": {
    body: "M32 7C36 21 49 28 46 40 42 58 19 56 17 41 15 30 28 19 32 7Z",
    detail: "M28 27 22 39 28 46 M34 34 42 26 M36 47 47 50 M14 14 19 19"
  },
  frost: {
    body: "M32 12C21 12 21 24 20 33L15 43Q32 51 49 43L44 33C43 24 43 12 32 12Z M28 48 36 48 35 54 29 54Z",
    detail: "M29 6 35 6 35 12 M18 39 46 39 M32 20 32 34 M26 24 38 30 M38 24 26 30"
  },
  shatter: {
    body: "M29 8 39 23 34 43 24 47 20 27Z M43 35 52 37 42 52 37 48Z M12 14 17 18 14 25 8 21Z",
    detail: "M29 8 29 30 24 47 M20 27 39 23 M15 48 20 53 M30 54 30 59"
  },
  echo: {
    body: "M27 17 39 23 39 42 27 48 17 41 17 24Z M27 25 32 28 32 38 27 41 23 37 23 28Z",
    detail: "M41 15Q58 32 41 50 M47 7Q69 32 47 57 M9 30 5 34"
  },
  hunter: {
    body: "M26 9 41 16 42 33 32 45 17 38 13 22Z M28 17 35 21 36 31 30 36 22 33 20 24Z M28 44 35 44 34 57 26 57Z",
    detail: "M28 21 28 32 M23 27 34 27 M7 10 12 15 M45 44 50 49"
  },
  piercing: {
    body: "M48 7Q23 7 17 36L13 52 28 45Q48 29 48 7Z",
    detail: "M9 57 40 17 M21 43 21 29 M28 35 29 20 M33 30 43 28 M38 23 46 19"
  },
  orbit: {
    body: "M32 20 42 26 41 37 31 44 22 38 21 27Z M49 10 54 13 53 18 48 20 45 15Z",
    detail: "M21 11C-4 19 13 52 44 50 64 48 54 26 45 21 M19 41C5 45 2 36 15 24 26 14 43 11 49 13"
  },
  thorns: {
    body: "M32 12A20 20 0 1 1 31.9 12M32 19A13 13 0 1 0 32.1 19Z",
    detail: "M19 16 15 5 27 12 M43 17 54 14 48 27 M46 43 52 54 38 51 M16 44 5 46 12 34"
  },
  aegis: {
    body: "M32 7 50 15 46 39 32 55 18 39 14 15Z M32 15 42 20 39 36 32 45 25 36 22 20Z",
    detail: "M32 15 32 45 M22 20 39 36 M42 20 25 36"
  },
  siphon: {
    body: "M32 12 48 23 44 44 29 54 15 39 18 21Z",
    detail: "M18 21 29 31 48 23 M29 31 29 54 M18 34 25 34 29 25 34 41 38 33 45 33"
  },
  focus: {
    body: "M32 7 49 24 42 45 32 55 20 44 15 24Z",
    detail: "M32 7 32 55 M15 24 49 24 M15 24 32 40 49 24 M22 12 17 7 M49 49 54 54"
  },
  renewal: {
    body: "M21 19 43 19 47 46 39 53 24 53 17 46Z M26 6 38 6 41 16 23 16Z",
    detail: "M24 23 23 44 40 44 39 23 M32 27 36 35 32 40 28 35Z M17 47 46 47"
  },
  execution: {
    body: "M45 7 48 19 34 38 27 31Z M22 31 37 43 32 48 17 35Z M21 41 28 47 18 57 12 51Z",
    detail: "M42 16 30 33 M36 25 41 27 M10 15 17 20 M10 27 15 26"
  },
  "last-stand": {
    body: "M32 6 48 17 44 42 32 56 20 42 16 17Z",
    detail: "M32 19Q43 35 34 44 22 39 28 30L32 35Z M9 42 15 45 M49 45 55 42"
  },
  quicksilver: {
    body: "M29 8 43 13 38 29 45 38 39 53 19 51 15 40 26 31Z",
    detail: "M7 23 19 23 M5 31 16 31 M30 14 27 24 M21 45 38 46"
  },
  magnet: {
    body: "M13 13 24 13 24 35Q32 46 40 35L40 13 51 13 51 36Q32 66 13 36Z",
    detail: "M13 24 24 24 M40 24 51 24 M32 7 32 19 M7 46 4 51 M57 46 60 51"
  },
  wardstone: {
    body: "M32 10 47 22 43 45 32 54 21 45 17 22Z",
    detail: "M24 26 40 26 38 38 32 44 26 38Z M9 19 13 15 M51 15 55 19"
  },
  pilgrim: {
    body: "M28 9 35 9 35 41 43 46 42 52 21 52 20 46 28 41Z",
    detail: "M28 20 35 20 M10 50Q4 24 20 15 M14 13 21 14 19 21 M47 18 53 26 47 34"
  },
  gambit: {
    body: "M20 10 45 10 51 46 26 55 13 29Z",
    detail: "M32 18 41 31 33 42 24 30Z M21 16 22 19 M43 42 44 46"
  },
  riposte: {
    body: "M32 9 48 17 43 41 32 52 21 41 16 17Z",
    detail: "M23 31 41 31 M34 23 42 31 34 39 M10 16 6 23 M54 40 58 34"
  },
  "shield-break": {
    body: "M30 8 17 16 21 41 28 51 31 36 26 28 33 20Z M37 10 49 17 44 41 35 52 36 36 31 28 38 20Z",
    detail: "M9 34 15 31 M50 31 57 34"
  },
  "cleave-wave": {
    body: "M43 8 47 18 28 37 22 31Z M17 31 34 44 29 48 13 36Z M17 42 24 47 16 56 10 51Z",
    detail: "M43 28Q58 36 49 50 M48 23Q66 35 56 53"
  },
  duelist: {
    body: "M14 10 32 31 27 36 11 21Z M50 10 53 21 30 48 24 43Z",
    detail: "M11 41 27 54 M37 41 53 54 M32 6 32 16"
  },
  "blood-dance": {
    body: "M46 8 49 18 29 39 23 33Z M16 34 33 47 29 51 12 38Z M22 45 28 50 20 58 14 53Z",
    detail: "M17 9Q7 22 17 26 27 22 17 9 M37 42Q49 43 49 54"
  },
  valor: {
    body: "M32 7 39 20 54 23 43 35 44 50 32 44 20 50 21 35 10 23 25 20Z",
    detail: "M32 20 39 29 32 37 25 29Z"
  },
  ricochet: {
    body: "M44 7 54 11 49 22 46 16 26 36 22 32 42 12Z",
    detail: "M10 55 24 39 18 27 9 23 M38 34 47 43 53 40 M50 34 54 40 49 46"
  },
  "split-arrow": {
    body: "M32 6 40 18 35 18 35 53 29 53 29 18 24 18Z",
    detail: "M32 39 13 20 M9 27 12 18 21 18 M32 39 51 20 M43 18 52 18 55 27"
  },
  pinning: {
    body: "M32 7 40 21 35 21 35 45 29 45 29 21 24 21Z",
    detail: "M14 35 50 35 M17 41 47 41 M16 52Q32 43 48 52 M32 45 32 57"
  },
  "distance-draw": {
    body: "M17 8Q53 31 17 56L23 44Q39 31 23 20Z",
    detail: "M17 8 30 31 17 56 M8 32 55 32 M48 25 56 32 48 39"
  },
  "hunter-mark": {
    body: "M32 19 44 31 32 43 20 31Z",
    detail: "M32 6 32 16 M32 46 32 57 M7 31 17 31 M47 31 57 31 M18 13A23 23 0 0 1 47 16 M46 49A23 23 0 0 1 16 47"
  },
  trapper: {
    body: "M12 21 52 21 48 48 16 48Z",
    detail: "M18 21 21 48 M27 21 29 48 M37 21 35 48 M46 21 43 48 M14 31 50 31 M15 40 49 40 M32 8 32 17 M25 12 39 12"
  },
  nova: {
    body: "M32 7 38 22 53 17 45 31 56 42 40 42 32 57 25 42 9 42 20 31 12 17 26 22Z",
    detail: "M32 22 39 32 32 42 25 32Z"
  },
  inferno: {
    body: "M17 10 42 10 49 17 47 52 17 52Z",
    detail: "M32 21Q46 39 35 46 24 45 25 33L31 36Z M42 10 42 18 49 18"
  },
  fracture: {
    body: "M16 15 27 22 32 9 39 22 50 15 45 45 19 45Z",
    detail: "M21 51 43 51 M29 23 26 33 34 35 30 45 M8 37 13 35 M51 35 57 37"
  },
  overload: {
    body: "M32 7 49 26 40 49 23 49 14 26Z",
    detail: "M32 7 32 20 24 31 38 28 30 43 32 55 M14 26 24 31 M38 28 49 26"
  },
  orbitals: {
    body: "M32 23 42 32 32 42 22 32Z M9 28 16 33 12 40 5 35Z M45 10 53 14 50 22 42 18Z",
    detail: "M20 14Q45 4 54 33 52 54 27 54 11 50 10 42 M17 24Q33 13 45 36"
  },
  convergence: {
    body: "M32 20 43 32 32 44 21 32Z",
    detail: "M6 7 23 23 M15 22 24 24 22 15 M58 7 41 23 M42 15 40 24 49 22 M32 58 32 46 M26 50 32 44 38 50"
  },
  backstab: {
    body: "M46 7 49 18 28 38 22 32Z M17 34 32 45 27 49 12 38Z M21 46 27 50 18 58 12 53Z",
    detail: "M11 12 24 12 24 25 M36 38Q50 35 53 46 M48 41 54 47 58 40"
  },
  shadowstep: {
    body: "M18 10 28 16 25 35 35 44 32 53 11 53 8 44 17 33Z",
    detail: "M36 12 45 18 42 34 53 44 50 52 40 52 M34 26 40 26 M36 32 39 32"
  },
  hemorrhage: {
    body: "M32 7 48 29 43 48 21 48 16 29Z",
    detail: "M19 30 27 30 31 21 36 39 40 30 46 30 M24 53 40 53"
  },
  "execution-chain": {
    body: "M15 12 26 10 34 18 26 29 15 30 7 22Z M38 35 49 33 57 41 49 52 38 53 30 45Z",
    detail: "M21 21 44 44 M43 8 52 17 M43 17 52 8"
  },
  smoke: {
    body: "M25 28 39 28 45 44 40 54 23 54 18 44Z",
    detail: "M25 35 39 35 M29 24Q14 23 18 14 24 8 30 17 M35 24Q49 22 46 13 39 6 35 15 M31 5 31 11"
  },
  venom: {
    body: "M44 7 50 13 25 43 18 38Z M17 39 24 44 15 58 11 55Z",
    detail: "M35 11 47 21 M20 31 31 41 M49 31Q39 46 49 49 59 46 49 31"
  },
  "pack-bond": {
    body: "M32 21 43 32 39 47 25 47 21 32Z M13 14 20 21 15 28 7 23Z M51 14 57 23 49 28 44 21Z",
    detail: "M18 41 12 36 6 41 M46 41 52 36 58 41 M32 10 32 17"
  },
  martyr: {
    body: "M32 12Q21 12 20 27L15 41 49 41 44 27Q43 12 32 12Z",
    detail: "M27 47 37 47 32 54Z M32 21 32 35 M25 28 39 28 M29 6 35 6"
  },
  covenant: {
    body: "M19 12 30 16 28 28 17 32 10 23Z M45 12 54 23 47 32 36 28 34 16Z M24 37 40 37 44 49 32 56 20 49Z",
    detail: "M20 23 32 33 44 23 M32 33 32 47"
  },
  frenzy: {
    body: "M15 8 26 17 22 44 15 55 12 32Z M33 7 42 17 35 48 29 57 29 31Z M50 13 56 23 47 47 39 54 45 30Z",
    detail: "M13 23 23 26 M30 21 39 24 M46 27 53 30"
  },
  "soul-harvest": {
    body: "M20 24 44 24 48 50 16 50Z M27 9 37 9 42 20 22 20Z",
    detail: "M32 29Q41 39 32 45 23 39 32 29 M10 7 9 15 16 20 M53 7 55 15 48 20 M17 55 47 55"
  },
  command: {
    body: "M18 8 45 8 45 56 32 48 18 56Z",
    detail: "M32 16 27 29 38 26 28 42 M22 12 40 12"
  },
  shrapnel: {
    body: "M21 24 36 17 47 38 32 48Z",
    detail: "M25 29 40 23 M14 12 21 18 M41 7 39 15 M54 21 47 24 M52 49 46 44 M21 50 17 56 M9 35 18 34"
  },
  minefield: {
    body: "M20 22 44 22 51 40 44 51 20 51 13 40Z",
    detail: "M32 10 32 22 M25 10 39 10 M13 40 51 40 M25 30 39 30 M25 45 39 45"
  },
  overclock: {
    body: "M27 8 37 8 39 16 48 19 54 27 49 35 48 45 39 48 36 56 26 56 23 48 14 45 10 35 15 27 16 18 25 16Z",
    detail: "M32 21 25 34 35 32 30 43 M42 9 50 5 M53 50 58 54"
  },
  bunker: {
    body: "M11 22 18 12 46 12 53 22 50 50 14 50Z",
    detail: "M13 26 51 26 M22 33 42 33 42 42 22 42Z M19 55 45 55"
  },
  salvage: {
    body: "M42 8 38 21 46 25 55 15 55 30 44 38 33 34 17 55 10 49 28 28 27 16Z",
    detail: "M14 49 17 50 M9 15 18 15 18 24 9 24Z"
  },
  railgun: {
    body: "M13 19 47 12 50 22 20 30Z M20 35 51 27 54 37 20 45Z M24 47 39 44 43 55 19 55Z",
    detail: "M5 33 57 20 M50 17 58 20 53 27"
  },
  battle: {
    body: "M17 7 32 25 27 30 13 17Z M47 7 51 17 23 49 17 44Z",
    detail: "M10 37 27 53 M38 37 54 52 M35 38 46 51 M17 48 11 55 M45 48 52 55"
  },
  elite: {
    body: "M32 8 48 21 44 42 32 55 20 42 16 21Z",
    detail: "M24 27 28 29 M40 27 36 29 M24 39 40 39 M32 18 32 35 M9 24 5 34 M55 24 59 34"
  },
  camp: {
    body: "M32 12C33 26 47 27 41 39 36 48 23 47 21 36 21 30 27 23 27 23L28 33Z",
    detail: "M14 47 49 57 M15 57 49 47 M15 18 11 23 M46 16 48 21"
  },
  shrine: {
    body: "M32 7 41 21 32 34 23 21Z M19 42 45 42 49 53 15 53Z",
    detail: "M12 58 52 58 M32 7 32 34 M9 23 15 23 M49 23 55 23 M20 36 16 40 M44 36 48 40"
  },
  merchant: {
    body: "M13 28 51 28 48 53 16 53Z M18 11 46 11 54 27 10 27Z",
    detail: "M24 12 21 26 M40 12 43 26 M23 35 23 46 M41 35 41 46 M28 33 36 33 36 52"
  },
  boss: {
    body: "M13 19 24 26 32 9 40 26 51 19 46 45 18 45Z",
    detail: "M18 51 46 51 M25 35 25 38 M39 35 39 38 M32 30 32 41"
  },
  crown: {
    body: "M10 18 23 28 32 10 41 28 54 18 47 46 17 46Z",
    detail: "M19 53 45 53 M32 28 37 35 32 41 27 35Z"
  },
  coin: {
    body: "M32 9A23 23 0 1 1 31.9 9 M32 16A16 16 0 1 0 32.1 16Z",
    detail: "M32 21 40 32 32 43 24 32Z"
  },
  heart: {
    body: "M32 52 12 32C0 14 22 6 32 20 43 6 64 15 52 32Z",
    detail: ""
  },
  bag: {
    body: "M20 22 44 22 50 51 14 51Z",
    detail: "M24 22 24 12 40 12 40 22 M15 32Q32 41 49 32 M28 35 36 35 36 43 28 43Z"
  },
  journal: {
    body: "M15 10 48 10 48 54 15 54Z",
    detail: "M22 10 22 54 M31 22 41 22 M31 29 39 29 M10 20 17 20 M10 42 17 42"
  },
  sound: {
    body: "M13 25 23 25 35 14 35 50 23 39 13 39Z",
    detail: "M43 22Q54 32 43 42 M49 15Q64 32 49 49"
  },
  mute: {
    body: "M13 25 23 25 35 14 35 50 23 39 13 39Z",
    detail: "M44 25 56 39 M56 25 44 39"
  },
  pause: {
    body: "M20 15 27 15 27 49 20 49Z M37 15 44 15 44 49 37 49Z",
    detail: ""
  },
  close: {
    body: "",
    detail: "M18 18 46 46 M46 18 18 46"
  },
  arrow: {
    body: "",
    detail: "M12 32 51 32 M37 18 51 32 37 46"
  },
  lock: {
    body: "M17 28 47 28 47 53 17 53Z",
    detail: "M23 28 23 19A9 9 0 0 1 41 19L41 28 M32 38 32 45"
  },
  dash: {
    body: "M34 12 52 31 34 51 26 43 36 31 26 20Z",
    detail: "M10 21 23 21 M5 32 23 32 M10 43 23 43"
  },
  help: {
    body: "",
    detail: "M22 22C22 8 47 10 43 26 41 33 32 30 32 39 M32 49 32 51"
  }
}, $l = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, Cl = ["d"], zl = ["d"], Pl = /* @__PURE__ */ We({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, s) => (P(), I("svg", $l, [_("path", {
      d: m(as)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, Cl), _("path", {
      d: m(as)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, zl)]));
  }
}), Et = Pl, El = { class: "exp-wardrobe" }, Il = { class: "exp-fitting-body" }, Ll = { class: "exp-preview-stage" }, Al = ["aria-label"], Tl = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, jl = { class: "exp-preview-tools" }, Ol = ["aria-label"], Zl = ["disabled"], Ul = { class: "exp-outfit-info" }, Nl = { class: "exp-muted" }, Dl = { class: "exp-fitting-actions" }, Fl = {
  key: 0,
  class: "exp-muted"
}, Bl = ["disabled"], Wl = { key: 2 }, ql = { class: "exp-purchase-confirm" }, Hl = ["disabled"], Vl = ["disabled"], Yl = ["aria-label"], Gl = ["aria-pressed", "onClick"], Ql = ["src"], Kl = /* @__PURE__ */ We({
  __name: "ExpeditionWardrobe",
  props: {
    data: {},
    traveler: {},
    balance: {},
    blocked: { type: Boolean },
    weapon: {}
  },
  emits: ["command"],
  setup(e, { emit: t }) {
    const s = e, a = t, n = W(s.data.equippedOutfit), r = W(!1), i = W(0), l = W(!1), o = W(null), c = W(null), u = W({}), d = J(() => rt[n.value]), h = J(() => Ya(s.data, n.value)), p = J(() => Mr.find((L) => Ka[L].awardKey === d.value.achievement)), g = J(() => ys.filter((L) => Ya(s.data, L) || rt[L].achievement === null || Object.values(Qt).some((j) => j.boss && Ka[j.boss].awardKey === rt[L].achievement)));
    let v = null, y = !0, M = 0, x = () => {
    };
    me([
      n,
      i,
      () => s.weapon
    ], () => {
      y = !0, x(), r.value = !1;
    });
    function S(L) {
      n.value = L, c.value?.scrollTo({ top: 0 });
    }
    function b() {
      M = performance.now() + 1100, y = !0, x();
    }
    function w() {
      r.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function k() {
      y = !0;
      let L;
      try {
        L = new ms({
          antialias: !0,
          alpha: !1
        });
      } catch {
        l.value = !0;
        return;
      }
      L.outputColorSpace = vn, L.toneMapping = 7, L.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const j = new hs(), C = ln(), U = new sa(), T = Fs(C, U, s.traveler.gender);
      j.background = new mn("#d1e0e1"), j.add(U, new gs("#fff6e3", "#627c93", 2.7));
      const H = new Qa("#fff6e0", 3);
      H.position.set(-3, 5, 6), j.add(H);
      const Y = new vs(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new xa();
      function Z(fe) {
        T.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, fe, 0, !0, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = -0.2, T.root.scale.setScalar(1.35);
      }
      for (const fe of g.value)
        Z(fe), F.union(new xa().setFromObject(U));
      const G = F.getSize(new it()), le = F.getCenter(new it()), Ye = G.y * 0.5 + G.z * 0.1 + 0.2, et = Math.hypot(G.x, G.z) * 0.5 + 0.2;
      Y.position.set(0, le.y + 0.8, 7), Y.lookAt(0, le.y, 0);
      function ke(fe) {
        const He = Math.max(Ye, et / fe);
        Y.left = -He * fe, Y.right = -Y.left, Y.top = He, Y.bottom = -He, Y.updateProjectionMatrix();
      }
      ke(1), L.setSize(144, 144, !1);
      try {
        for (const fe of g.value)
          Z(fe), L.render(j, Y), u.value[fe] = L.domElement.toDataURL("image/png");
      } catch {
        l.value = !0, T.dispose(), C.dispose(), j.clear(), L.dispose(), L.forceContextLoss();
        return;
      }
      o.value.append(L.domElement);
      let ue = 0, xe = 1, dt = 1;
      const Ct = new ResizeObserver(() => {
        const fe = o.value.getBoundingClientRect();
        xe = Math.max(1, fe.width), dt = Math.max(1, fe.height), L.setSize(xe, dt, !1), ke(xe / dt), y = !0, x();
      });
      Ct.observe(o.value);
      const qe = matchMedia("(prefers-reduced-motion: reduce)");
      function De(fe) {
        fe.preventDefault(), l.value = !0, cancelAnimationFrame(ue), ue = 0;
      }
      L.domElement.addEventListener("webglcontextlost", De);
      function Ge(fe) {
        if (ue = 0, l.value || document.hidden || !y && (fe > M || qe.matches)) return;
        const He = fe < M && !qe.matches, Ie = fe * 0.03;
        T.update({
          x: He ? Math.sin(Ie * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: He ? 8 - Ie % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, n.value, Ie, qe.matches, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = Number(i.value) * Math.PI / 180, T.root.scale.setScalar(1.35);
        try {
          L.render(j, Y), y = !1;
        } catch {
          l.value = !0;
        }
        He && !l.value && x();
      }
      x = () => {
        !ue && !l.value && !document.hidden && (ue = requestAnimationFrame(Ge));
      };
      function Re() {
        document.hidden ? (cancelAnimationFrame(ue), ue = 0) : (y = !0, x());
      }
      document.addEventListener("visibilitychange", Re), x(), v = () => {
        x = () => {
        }, cancelAnimationFrame(ue), Ct.disconnect(), document.removeEventListener("visibilitychange", Re), L.domElement.removeEventListener("webglcontextlost", De), T.dispose(), C.dispose(), j.clear(), L.dispose(), L.forceContextLoss(), L.domElement.remove();
      };
    }
    function E() {
      v?.(), v = null, l.value = !1, k();
    }
    return jt(k), Rt(() => v?.()), (L, j) => (P(), I("div", El, [_("section", {
      ref_key: "fitting",
      ref: c,
      class: "exp-fitting"
    }, [_("div", Il, [_("div", Ll, [_("div", {
      ref_key: "host",
      ref: o,
      class: "exp-outfit-preview",
      "aria-label": m(Bt)[n.value].name
    }, [l.value ? (P(), I("div", Tl, [_("p", null, $(m(ae).presentationError.rendering), 1), _("button", {
      type: "button",
      onClick: E
    }, $(m(N).reload), 1)])) : Q("", !0)], 8, Al), _("div", jl, [_("label", null, [Oe($(m(ae).rotate), 1), qt(_("input", {
      "onUpdate:modelValue": j[0] || (j[0] = (C) => i.value = C),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": m(ae).rotate
    }, null, 8, Ol), [[pn, i.value]])]), _("button", {
      type: "button",
      disabled: l.value,
      onClick: b
    }, $(m(ae).previewAction), 9, Zl)])]), _("div", Ul, [
      _("h3", null, $(m(Bt)[n.value].name), 1),
      _("p", null, $(m(Bt)[n.value].detail), 1),
      _("p", Nl, $(m(ae).wardrobeNote), 1)
    ])]), _("div", Dl, [m(Zn)(e.data.active) ? Q("", !0) : (P(), I("p", Fl, $(m(N).safeWardrobe), 1)), h.value ? (P(), I("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !m(Zn)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: j[1] || (j[1] = (C) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, $(e.data.equippedOutfit === n.value ? m(ae).equipped : m(ae).equip), 9, Bl)) : p.value ? (P(), I("p", Wl, $(m(ae).unlockWeapon(m(Xa)[p.value])), 1)) : r.value ? (P(), I(re, { key: 3 }, [_("p", null, $(m(ae).buyOutfit(m(Bt)[n.value].name, d.value.price)), 1), _("div", ql, [_("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < d.value.price,
      onClick: w
    }, $(m(ae).confirm), 9, Hl), _("button", {
      type: "button",
      onClick: j[2] || (j[2] = (C) => r.value = !1)
    }, $(m(ae).cancel), 1)])], 64)) : (P(), I("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < d.value.price,
      onClick: j[3] || (j[3] = (C) => r.value = !0)
    }, $(e.balance < d.value.price ? m(ae).noCoins : m(ae).purchase) + " · " + $(m(ae).coins(d.value.price)), 9, Vl))])], 512), _("div", {
      class: "exp-outfit-rack",
      "aria-label": m(ae).tryOn
    }, [(P(!0), I(re, null, Le(g.value, (C) => (P(), I("button", {
      key: C,
      type: "button",
      "aria-pressed": n.value === C,
      onClick: (U) => S(C)
    }, [
      u.value[C] ? (P(), I("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[C],
        alt: ""
      }, null, 8, Ql)) : Q("", !0),
      _("strong", null, $(m(Bt)[C].name), 1),
      _("small", null, $(e.data.equippedOutfit === C ? m(ae).equipped : m(Ya)(e.data, C) ? m(ae).owned : m(rt)[C].price ? m(ae).coins(m(rt)[C].price) : m(ae).achievement), 1)
    ], 8, Gl))), 128))], 8, Yl)]));
  }
}), Xl = Kl;
function Jl(e, t = 1) {
  const s = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (s[n] || n >= $a.bands.length) && we("narrative_unavailable");
    const r = /* @__PURE__ */ new Map();
    for (const l of a[3].matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
      r.has(l[1]) && we("narrative_unavailable"), r.set(l[1], l[2].replace(/^[^:\n]+:\s*/, "").trim());
    const i = (l) => {
      const o = r.get(l);
      return o || we("narrative_unavailable"), o;
    };
    s[n] = {
      name: i("name"),
      relationship: i("relationship"),
      memory: r.get("memory") ?? "",
      shadow: r.get("shadow") ?? "",
      intimacy: i("intimacy"),
      secret: r.get("secret") ?? null
    };
  }
  return $a.bands.some((a, n) => !s[n]) && we("narrative_unavailable"), s;
}
function ec(e, t, s) {
  const a = e[Mn(t.affection)];
  return {
    relationship: a.relationship,
    shadow: a.shadow,
    intimacy: a.intimacy,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: s ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var tc = async (e, t) => {
  const s = await fetch(`/${ir}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  s.ok || we("narrative_unavailable");
  const a = await s.text();
  return a.trim() || we("narrative_unavailable"), a;
};
async function ac(e, t, s = tc) {
  const [a, n, r, i, l] = await Promise.all([
    s("system-prompt", t),
    s("world", t),
    s("player", t),
    s("meta-protocol", t),
    Promise.all(js.map(async (M) => ({
      id: M,
      document: await s(Ue(M) ? M : Ne[M].card, t)
    })))
  ]), o = l.map(({ id: M, document: x }) => {
    const S = [...x.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (S.length !== 1 || !S[0][1].trim()) && we("narrative_unavailable"), {
      id: M,
      introduction: S[0][1].trim(),
      document: x.replace(S[0][0], "").trim()
    };
  }), c = o.map((M) => M.introduction).join(`
`), u = o.find((M) => M.id === e).document, d = {
    system: a,
    world: n,
    player: r,
    protocol: i,
    npcs: c
  };
  if (!Ue(e)) {
    const M = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!M || M[1] !== `${e}.initial`) && we("narrative_unavailable"), {
      ...d,
      character: u.slice(0, M.index).replace(/# 开场\s*$/, "").trim(),
      stages: [],
      opening: {
        initial: M[2],
        returned: null
      }
    };
  }
  const [h, p] = await Promise.all(["openings", `${e}-stages`].map((M) => s(M, t))), g = new Map([...h.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((M) => [M[1], M[2].trim()])), v = g.get(`${e}.initial`), y = g.get(`${e}.returned`) ?? null;
  return (!v || (e === "anian" || e === "kouzi") && !y) && we("narrative_unavailable"), {
    ...d,
    character: u,
    stages: Jl(p),
    opening: {
      initial: v,
      returned: y
    }
  };
}
function Gs(e) {
  return ho[e];
}
function nc(e, t, s = []) {
  if (!Ue(t)) {
    const i = Ne[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: de.attack,
      ...e.facts.includes(i.intel) ? { pass: de.pass } : {}
    };
  }
  const a = Object.fromEntries(fo(e.facts, t, e.people[t]).map((i) => [i, yn[i].meaning])), n = Gs(t), r = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && r >= $a.bands[4] && s[Mn(r)]?.secret && (a.share_secret = de.shareSecret), po(e, t)) {
    a.follow = de.follow, a.stay = de.stay;
    for (const i of Is(e, t).filter((l) => l.accessible && l.solo)) a[`go:${i.id}`] = de.go(i.name);
  }
  return a;
}
var Qs = "dialogue", Oa = `<${Qs}>`, kn = `</${Qs}>`, x2 = new RegExp(`${Oa}([\\s\\S]*?)${kn}`, "i"), M2 = new RegExp(Oa, "i");
function ns(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${Oa}
${e.reply}
${kn}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null
  })}`;
}
function sc(e) {
  return `［开工强调］：

每次输出均由两部分组成：XML 正文与 JSON 操作，缺一不可。

在${Oa}…${kn}中用【${e}】的身份第一人称叙事。在JSON 对象中提交操作。
开工：`;
}
function rc(e) {
  return e.map((t) => ({
    id: t,
    event: Ms[t]
  }));
}
function oc(e) {
  const t = /* @__PURE__ */ new Set();
  let s;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((l) => !t.has(l)), r = {
      ...a.scene === s ? {} : { place: ne.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((l) => t.add(l)), s = a.scene;
    const i = Object.keys(r).length ? `<scene>
${JSON.stringify(r)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: ns(a)
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: ns(a)
    }];
  });
}
function ic(e, t) {
  return t ? e.findIndex((s) => s.id === t.throughId) + 1 : 0;
}
function lc(e, t) {
  const s = new Set(e.facts), a = Ue(t) ? e.people[t] : null, n = Me[Ue(t) ? e.people[t].scene : Ne[t].scene], r = Ue(t) ? e.people[t].position : Ra(t, s), i = wn(n, r, s, e.people), l = Ta(n.id, r, s).filter((c) => Ee($t(n, s), r, c.position)), o = _a(n.id);
  return {
    place: ne.scenes[n.id],
    playerLodging: Gt.guest_room.name,
    ...o ? { room: {
      use: o.use,
      enclosure: o.enclosure,
      household: o.household.map((c) => c === "player" ? e.traveler.name : c === "anian_parents" || c === "innkeeper" ? ne.households[c] : Be(c)),
      furniture: o.furniture.map((c) => ({
        item: c.label,
        position: {
          x: c.footprint.x,
          y: c.footprint.z
        }
      })),
      exits: n.exits.map((c) => ({
        place: ne.scenes[c.to],
        position: n.anchors[c.anchor]
      }))
    } } : {},
    positions: {
      player: e.location.position,
      self: r
    },
    present: [
      e.traveler.name,
      ...lt.filter((c) => e.people[c].scene === n.id).map(Be),
      ...l.map((c) => Be(c.target.id))
    ],
    residents: (Vs[n.id] ?? []).map((c) => ({
      name: c.name,
      activity: ui[c.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? La[a.destination].name : null
    } : null,
    nearby: [...i, ...l].filter((c) => c.target.id !== t).map((c) => Be(c.target.id))
  };
}
function cc(e, t, s = []) {
  const a = nc(e, t, s), n = Object.keys(a), r = {
    person: Be(t),
    ...lc(e, t),
    events: rc(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (!Ue(t)) {
    const i = Ne[t];
    return {
      ...r,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...r,
    map: Is(e, t),
    rescued: e.knowledge[t].includes("captives_arrived"),
    affection: e.relationships[t].affection
  };
}
function na(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function dc(e, t, s, a, n = e.memories[t]) {
  const r = cc(e, t, a.stages), i = So(t), l = Ue(t) ? Gs(t) : null, o = Ue(t) ? ec(a.stages, e.relationships[t], !!l && e.facts.includes(l)) : null, { actions: c, actionMeanings: u, events: d, ...h } = r, p = {
    actions: u,
    performance: i
  }, g = {
    memory: n?.text ?? null,
    events: d,
    ...h,
    opening: e.conversations[t].some((v) => v.kind === "dialogue") || !Ue(t) && e.facts.includes(Ne[t].complete) ? null : r.rescued ? a.opening.returned : a.opening.initial,
    stage: o
  };
  return {
    systemPrompt: [
      a.system.trim(),
      na("background", a.world.trim()),
      na("player", `${a.player.trim()}

${JSON.stringify({
        ...e.traveler,
        outfit: Bt[e.outfit].detail,
        equipment: wt[e.weapon].equipment
      }, null, 2)}`),
      na("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${na("meta_protocol", `${a.protocol.trim()}

${na("operations", JSON.stringify(p, null, 2))}`)}

<story>
${JSON.stringify(g, null, 2)}`
      },
      ...oc(e.conversations[t].length ? e.conversations[t].slice(ic(e.conversations[t], n)) : [Us(e, t)]),
      {
        role: "user",
        content: `${s}
</story>

${sc(r.person)}`
      }
    ]
  };
}
var ss = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function uc(e, t, s, a) {
  const n = dc(e, t, s, a), r = rr({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = Wa(n.systemPrompt), l = Wa(e.memories[t]?.text ?? ""), o = Wa(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: r,
    system: i,
    memory: l,
    history: o,
    situation: Math.max(0, r - i - l - o),
    limit: ss.waitAt,
    trigger: ss.trigger
  };
}
var hc = ["aria-label", "aria-expanded"], fc = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, pc = ["id"], mc = ["y", "height"], vc = ["href"], gc = ["href", "clip-path"], bc = ["aria-label", "aria-expanded"], yc = {
  key: 1,
  class: "ember-meter-popover"
}, wc = ["aria-label"], xc = { class: "ember-meter-total" }, Mc = { key: 0 }, _c = { class: "ember-meter-total" }, kc = {
  key: 0,
  role: "status"
}, Sc = { role: "status" }, Rc = ["disabled"], $c = { key: 2 }, Cc = { role: "status" }, zc = /* @__PURE__ */ We({
  __name: "ConversationMeters",
  props: {
    campaign: {},
    person: {},
    draft: {},
    memoryState: {},
    blocked: { type: Boolean }
  },
  emits: ["retry-memory"],
  setup(e) {
    const t = e, s = Ht(null), a = W(null), n = W(0), r = W("");
    let i = null, l;
    async function o() {
      i?.abort(), i = new AbortController();
      const v = i;
      s.value = null, r.value = "";
      try {
        const y = await ac(t.person, v.signal);
        v.signal.aborted || (s.value = y);
      } catch (y) {
        v.signal.aborted || (r.value = Mt(y));
      }
    }
    me(() => t.person, () => {
      a.value = null, n.value = 0, o();
    }, { immediate: !0 });
    const c = J(() => Ue(t.person) ? t.campaign.relationships[t.person].affection : 0), u = `ember-affection-${ds()}`, d = J(() => 19 * c.value / 100), h = J(() => s.value?.stages[Mn(c.value)]?.name ?? ""), p = J(() => s.value ? uc(t.campaign, t.person, t.draft, s.value) : null);
    me(() => [t.person, c.value], ([v, y], [M, x]) => {
      v === M && y === x || (l && clearTimeout(l), n.value = v === M ? y - x : 0, n.value && (l = setTimeout(() => {
        n.value = 0;
      }, 3500)));
    }), us(() => (a.value = null, !0), () => !!a.value), Rt(() => {
      i?.abort(), l && clearTimeout(l);
    });
    const g = (v) => `${(v / 1e3).toFixed(1)}k`;
    return (v, y) => (P(), I("div", {
      class: "ember-meters",
      onKeydown: y[4] || (y[4] = sr(pt((M) => a.value = null, ["stop"]), ["esc"]))
    }, [
      m(Ue)(e.person) ? (P(), I("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(de).affection,
        "aria-expanded": a.value === "affection",
        onClick: y[0] || (y[0] = (M) => a.value = a.value === "affection" ? null : "affection")
      }, [(P(), I("svg", fc, [
        _("defs", null, [_("path", {
          id: `${u}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, pc), _("clipPath", { id: u }, [_("rect", {
          x: "2",
          y: 22 - d.value,
          width: "20",
          height: d.value
        }, null, 8, mc)])]),
        _("use", {
          href: `#${u}-shape`,
          class: "ember-affection-track"
        }, null, 8, vc),
        _("use", {
          href: `#${u}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${u})`
        }, null, 8, gc)
      ])), n.value ? (P(), I("small", {
        key: 0,
        class: St(["ember-affection-change", { "is-down": n.value < 0 }]),
        role: "status"
      }, $(n.value > 0 ? "+" : "") + $(n.value), 3)) : Q("", !0)], 8, hc)) : Q("", !0),
      _("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(de).context,
        "aria-expanded": a.value === "context",
        onClick: y[1] || (y[1] = (M) => a.value = a.value === "context" ? null : "context")
      }, [_("span", {
        class: St(["ember-meter-ring", { "is-warning": p.value && p.value.used >= p.value.trigger }]),
        style: Yt({ "--meter-fill": `${Math.min(1, (p.value?.used ?? 0) / (p.value?.limit ?? 1)) * 360}deg` })
      }, [...y[5] || (y[5] = [_("span", null, null, -1)])], 6)], 8, bc),
      a.value ? (P(), I("section", yc, [
        _("header", null, [_("strong", null, $(a.value === "affection" ? m(de).affection : m(de).context), 1), _("button", {
          type: "button",
          "aria-label": m(de).close,
          onClick: y[2] || (y[2] = (M) => a.value = null)
        }, "×", 8, wc)]),
        a.value === "affection" ? (P(), I(re, { key: 0 }, [_("p", xc, [Oe($(c.value) + " ", 1), y[6] || (y[6] = _("small", null, "/ 100", -1))]), r.value ? Q("", !0) : (P(), I("p", Mc, $(h.value || m(de).loading), 1))], 64)) : p.value ? (P(), I(re, { key: 1 }, [
          _("p", _c, $(g(p.value.used)) + " / " + $(g(p.value.limit)), 1),
          _("dl", null, [(P(!0), I(re, null, Le(m(de).contextParts, (M, x) => (P(), I(re, { key: x }, [_("dt", null, $(M), 1), _("dd", null, $(g(p.value[x])), 1)], 64))), 128))]),
          e.memoryState?.status === "running" ? (P(), I("p", kc, $(m(de).memoryRunning), 1)) : e.memoryState?.status === "failed" ? (P(), I(re, { key: 1 }, [_("p", Sc, $(e.memoryState.code === "expedition_agent_failed" ? m(de).memoryServiceFailed : m(Mt)(e.memoryState)), 1), _("button", {
            type: "button",
            disabled: e.blocked,
            onClick: y[3] || (y[3] = (M) => v.$emit("retry-memory"))
          }, $(m(de).memoryRetry), 9, Rc)], 64)) : Q("", !0),
          _("p", null, $(m(de).threshold(p.value.trigger)), 1),
          _("small", null, $(m(de).estimate), 1)
        ], 64)) : r.value ? Q("", !0) : (P(), I("p", $c, $(m(de).loading), 1)),
        r.value ? (P(), I(re, { key: 3 }, [_("p", Cc, $(r.value), 1), _("button", {
          type: "button",
          onClick: o
        }, $(m(de).retry), 1)], 64)) : Q("", !0)
      ])) : Q("", !0)
    ], 32));
  }
}), Pc = /* @__PURE__ */ ct(zc, [["__scopeId", "data-v-3753eb0b"]]), Ec = ["aria-label"], Ic = { class: "ember-weapon-layout" }, Lc = { class: "ember-weapon-list" }, Ac = ["name", "value"], Tc = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, jc = ["src"], Oc = { class: "ember-weapon-skill" }, Zc = /* @__PURE__ */ We({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = is(e, "modelValue"), s = ds();
    return (a, n) => (P(), I("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": m(ce).chooseWeapon
    }, [_("div", Ic, [_("div", Lc, [(P(!0), I(re, null, Le(m(ws), (r) => (P(), I("label", {
      key: r,
      class: St({ "is-selected": t.value === r })
    }, [
      qt(_("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: m(s),
        value: r
      }, null, 8, Ac), [[cs, t.value]]),
      Fe(Et, { name: r }, null, 8, ["name"]),
      _("span", null, $(m(wt)[r].name), 1)
    ], 2))), 128))]), _("div", Tc, [
      (P(), I("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: m(ol)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, jc)),
      _("h3", null, $(m(wt)[t.value].name), 1),
      _("p", null, $(m(wt)[t.value].detail), 1),
      _("div", Oc, [_("strong", null, $(m(wt)[t.value].action), 1), _("p", null, $(m(wt)[t.value].skill), 1)])
    ])])], 8, Ec));
  }
}), Uc = /* @__PURE__ */ ct(Zc, [["__scopeId", "data-v-0c0d4e2b"]]), Nc = ["src"], Dc = /* @__PURE__ */ We({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = W(null), s = W(null), a = new ResizeObserver((n) => {
      const { width: r, height: i } = n[0].contentRect;
      s.value = r <= 700 && i > r;
    });
    return jt(() => a.observe(t.value)), Rt(() => a.disconnect()), (n, r) => (P(), I("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [s.value !== null ? (P(), I("img", {
      key: 0,
      src: s.value ? m(un).cityMobile : m(un).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, Nc)) : Q("", !0)], 512));
  }
}), Fc = /* @__PURE__ */ ct(Dc, [["__scopeId", "data-v-f5a6e0d9"]]), Bc = ["aria-label"], Wc = {
  key: 0,
  class: "entry-title"
}, qc = { class: "entry-city" }, Hc = ["aria-label"], Vc = ["disabled"], Yc = ["disabled"], Gc = ["disabled"], Qc = ["disabled"], Kc = {
  key: 0,
  class: "entry-save"
}, Xc = ["disabled"], Jc = { for: "ember-traveler-name" }, ed = ["maxlength", "placeholder"], td = ["value"], ad = {
  class: "entry-primary",
  type: "submit"
}, nd = {
  key: 1,
  class: "entry-chapters"
}, sd = ["src"], rd = {
  class: "entry-numeral",
  "aria-hidden": "true"
}, od = { class: "entry-chapter-body" }, id = { key: 0 }, ld = { class: "entry-forthcoming" }, cd = { class: "entry-traveler" }, dd = {
  key: 0,
  class: "entry-restart"
}, ud = ["disabled"], hd = {
  key: 0,
  "aria-hidden": "true"
}, fd = /* @__PURE__ */ We({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: s }) {
    const a = e, n = s, r = W("title"), i = W(!1), l = W(a.campaign?.traveler.name ?? ""), o = W(a.campaign?.traveler.gender ?? null), c = W(a.campaign?.weapon ?? "blade"), u = W(!1), d = W(null), h = W(null), p = J(() => ({
      title: N.title,
      identity: ce.identity,
      chapters: ce.chooseChapter,
      weapon: ce.chooseWeapon
    })[r.value]);
    me(r, async () => {
      await Wt(), h.value && (h.value.scrollTop = 0), d.value?.focus({ preventScroll: !0 });
    });
    function g() {
      i.value = !0, u.value = !1, r.value = "identity";
    }
    function v() {
      l.value.trim() && o.value && (l.value = l.value.trim(), r.value = "chapters");
    }
    function y() {
      r.value = r.value === "weapon" ? "chapters" : r.value === "chapters" && i.value ? "identity" : "title";
    }
    function M() {
      a.campaign && !i.value ? n("continue") : r.value = "weapon";
    }
    function x() {
      !o.value || !l.value.trim() || a.blocked || a.campaign && !u.value || n("start", {
        traveler: {
          name: l.value.trim(),
          gender: o.value
        },
        weapon: c.value,
        chapter: It.id
      });
    }
    return t({ back: () => r.value === "title" ? !1 : (y(), !0) }), (S, b) => (P(), I("section", {
      class: St(["ember-entry", { "is-title": r.value === "title" }]),
      "aria-label": m(N).title
    }, [
      Fe(Fc),
      b[10] || (b[10] = _("div", { class: "entry-shade" }, null, -1)),
      r.value === "title" ? (P(), I("div", Wc, [
        _("p", qc, $(m(ce).city), 1),
        _("h1", {
          ref_key: "heading",
          ref: d,
          tabindex: "-1"
        }, $(m(N).title), 513),
        _("nav", { "aria-label": m(N).title }, [
          e.campaign ? (P(), I("button", {
            key: 0,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: b[0] || (b[0] = (w) => n("continue"))
          }, [Oe($(m(N).resume), 1), b[6] || (b[6] = _("span", { "aria-hidden": "true" }, "→", -1))], 8, Vc)) : (P(), I("button", {
            key: 1,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, [Oe($(e.ready ? m(ce).begin : m(ce).loading), 1), b[7] || (b[7] = _("span", { "aria-hidden": "true" }, "→", -1))], 8, Yc)),
          e.campaign ? (P(), I("button", {
            key: 2,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: b[1] || (b[1] = (w) => {
              i.value = !1, r.value = "chapters";
            })
          }, $(m(ce).chapters), 9, Gc)) : Q("", !0),
          e.campaign ? (P(), I("button", {
            key: 3,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, $(m(ce).newJourney), 9, Qc)) : Q("", !0)
        ], 8, Hc),
        e.campaign ? (P(), I("p", Kc, [_("span", null, $(e.campaign.traveler.name), 1), _("span", null, $(m(Zs)), 1)])) : Q("", !0)
      ])) : (P(), I("div", {
        key: 1,
        ref_key: "sheet",
        ref: h,
        class: "entry-sheet"
      }, [
        _("header", null, [_("button", {
          type: "button",
          disabled: e.busy,
          onClick: y
        }, "← " + $(m(ce).back), 9, Xc), _("span", null, $(m(N).title), 1)]),
        _("h2", {
          ref_key: "heading",
          ref: d,
          tabindex: "-1"
        }, $(p.value), 513),
        r.value === "identity" ? (P(), I("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: pt(v, ["prevent"])
        }, [
          _("label", Jc, $(m(ce).name), 1),
          qt(_("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": b[2] || (b[2] = (w) => l.value = w),
            maxlength: m(24),
            placeholder: m(ce).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, ed), [[pn, l.value]]),
          _("fieldset", null, [_("legend", null, $(m(ce).gender), 1), (P(!0), I(re, null, Le(m(Os), (w) => (P(), I("label", { key: w }, [qt(_("input", {
            "onUpdate:modelValue": b[3] || (b[3] = (k) => o.value = k),
            type: "radio",
            name: "ember-traveler-gender",
            value: w,
            required: ""
          }, null, 8, td), [[cs, o.value]]), _("span", null, $(m(ce).genders[w]), 1)]))), 128))]),
          _("button", ad, [Oe($(m(ce).next), 1), b[8] || (b[8] = _("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : r.value === "chapters" ? (P(), I("div", nd, [_("button", {
          type: "button",
          class: "entry-chapter",
          onClick: M
        }, [
          _("img", {
            class: "entry-chapter-art",
            src: m(un).chapter,
            alt: "",
            decoding: "async"
          }, null, 8, sd),
          _("span", rd, $(m(It).numeral), 1),
          _("span", od, [
            _("small", null, $(m(It).number), 1),
            _("strong", null, $(m(It).title), 1),
            _("span", null, $(m(N).opening), 1),
            e.campaign && !i.value ? (P(), I("small", id, $(e.campaign.facts.includes("chapter_completed") ? m(ce).completeChapter : m(ce).currentChapter), 1)) : Q("", !0)
          ]),
          b[9] || (b[9] = _("span", {
            class: "entry-chapter-arrow",
            "aria-hidden": "true"
          }, "→", -1))
        ]), _("div", ld, [_("span", null, $(m(ce).nextChapter), 1), _("span", null, $(m(ce).forthcoming), 1)])])) : (P(), I("form", {
          key: 2,
          class: "entry-loadout",
          onSubmit: pt(x, ["prevent"])
        }, [
          _("p", cd, [_("strong", null, $(l.value), 1), _("span", null, $(o.value ? m(ce).genders[o.value] : "") + " · " + $(m(ce).identityRole), 1)]),
          Fe(Uc, {
            modelValue: c.value,
            "onUpdate:modelValue": b[4] || (b[4] = (w) => c.value = w)
          }, null, 8, ["modelValue"]),
          e.campaign ? (P(), I("label", dd, [qt(_("input", {
            "onUpdate:modelValue": b[5] || (b[5] = (w) => u.value = w),
            type: "checkbox",
            required: ""
          }, null, 512), [[ar, u.value]]), _("span", null, $(m(ce).restartWarning), 1)])) : Q("", !0),
          _("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Oe($(e.busy ? m(ce).entering : e.campaign ? m(ce).confirmRestart : m(ce).enter), 1), e.busy ? Q("", !0) : (P(), I("span", hd, "→"))], 8, ud)
        ], 32))
      ], 512))
    ], 10, Bc));
  }
}), pd = /* @__PURE__ */ ct(fd, [["__scopeId", "data-v-93861d5f"]]), md = [
  "aria-label",
  "title",
  "disabled"
], vd = ["disabled"], gd = [
  "maxlength",
  "aria-label",
  "placeholder"
], bd = ["aria-label", "title"], yd = [
  "aria-label",
  "title",
  "disabled"
], wd = /* @__PURE__ */ We({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ zn({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ zn([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const s = is(e, "modelValue"), a = e, n = t, r = W(null), i = W(!1);
    let l = null, o = 0;
    function c() {
      r.value && (r.value.style.height = "44px", r.value.style.height = `${Math.min(132, r.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && s.value.trim() && n("send");
    }
    function d(h) {
      or(h, i.value) && (h.preventDefault(), u());
    }
    return me(s, async () => {
      await Wt(), c();
    }), me(r, (h, p) => {
      p && l?.unobserve(p), h && (c(), l?.observe(h));
    }, { flush: "post" }), jt(() => {
      c(), l = new ResizeObserver((h) => {
        const p = h[0].contentRect.width;
        p !== o && (o = p, c());
      }), r.value && l.observe(r.value);
    }), Rt(() => l?.disconnect()), (h, p) => (P(), I("form", {
      class: "ember-composer",
      onSubmit: pt(u, ["prevent"])
    }, [
      _("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? m(de).retrySend : m(de).regenerate,
        title: e.retrying ? m(de).retrySend : m(de).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: p[0] || (p[0] = (g) => n("regenerate"))
      }, [...p[6] || (p[6] = [_("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [_("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, md),
      e.conclusion ? (P(), I("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: p[1] || (p[1] = (g) => n("continue"))
      }, [Oe($(e.conclusion === "fight" ? m(de).fight : m(de).continue), 1), p[7] || (p[7] = _("span", { "aria-hidden": "true" }, "→", -1))], 8, vd)) : qt((P(), I("textarea", {
        key: 1,
        ref_key: "input",
        ref: r,
        "onUpdate:modelValue": p[2] || (p[2] = (g) => s.value = g),
        rows: "1",
        maxlength: m(ia).playerTextLimit,
        "aria-label": m(N).input,
        placeholder: m(N).input,
        enterkeyhint: "enter",
        onKeydown: d,
        onCompositionstart: p[3] || (p[3] = (g) => i.value = !0),
        onCompositionend: p[4] || (p[4] = (g) => i.value = !1)
      }, null, 40, gd)), [[pn, s.value]]),
      e.talking ? (P(), I("button", {
        key: 2,
        type: "button",
        "aria-label": m(N).cancel,
        title: m(N).cancel,
        onClick: p[5] || (p[5] = (g) => n("cancel"))
      }, [...p[8] || (p[8] = [_("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [_("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, bd)) : e.conclusion ? Q("", !0) : (P(), I("button", {
        key: 3,
        type: "submit",
        "aria-label": m(N).send,
        title: m(N).send,
        disabled: e.blocked || !s.value.trim()
      }, [...p[9] || (p[9] = [_("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [_("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, yd))
    ], 32));
  }
}), xd = /* @__PURE__ */ ct(wd, [["__scopeId", "data-v-640a5540"]]), rs = "关闭交谈后出发", Ft = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${rs}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, s) => s ? `${e}准备前往${t}等候 · ${rs}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function Md(e, t, s) {
  if (!Ue(t)) return !1;
  const a = e.people[t], n = s.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const r = e.conversations[t];
  for (let i = r.length - 1; i >= 0; i--) {
    const l = r[i], o = l.action;
    if (o === "follow" || o === "stay" || o?.startsWith("go:")) return l.id === s.id;
  }
  return !1;
}
function _d(e, t, s) {
  const a = s.action;
  if (s.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === s.id, r = Md(e, t, s) || n && (a === "finish" ? xn(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), i = Be(t);
  let l;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      l = Ft[a];
      break;
    case "follow":
      l = Ft.follow(i, r);
      break;
    case "stay":
      l = Ft.stay(i);
      break;
    case "pass":
      l = Ft.pass(i, r);
      break;
    case "attack":
    case "finish":
      l = Ft[a](r);
      break;
    default:
      l = Ft.go(i, La[a.slice(3)].name, r);
  }
  return {
    action: a,
    phase: r ? "pending" : "applied",
    text: l
  };
}
var kd = ["data-action", "data-phase"], Sd = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, Rd = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, $d = /* @__PURE__ */ We({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, s = J(() => _d(t.campaign, t.person, t.turn));
    return (a, n) => s.value ? (P(), I("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": s.value.action,
      "data-phase": s.value.phase
    }, [(P(), I("svg", Sd, [s.value.phase === "pending" ? (P(), I(re, { key: 0 }, [n[0] || (n[0] = _("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = _("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : (P(), I("path", Rd))])), _("span", null, $(s.value.text), 1)], 8, kd)) : Q("", !0);
  }
}), Cd = /* @__PURE__ */ ct($d, [["__scopeId", "data-v-00613f94"]]);
function zd(e) {
  const t = [];
  let s = 0;
  for (const a of e.matchAll(/「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"/g))
    a.index > s && t.push({
      text: e.slice(s, a.index),
      spoken: !1
    }), t.push({
      text: a[0],
      spoken: !0
    }), s = a.index + a[0].length;
  return s < e.length && t.push({
    text: e.slice(s),
    spoken: !1
  }), t;
}
var Pd = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, Ed = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, Id = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, Ld = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, Ad = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, Td = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, jd = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, Od = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, Zd = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, Ud = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, Nd = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, Dd = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, Fd = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, Bd = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, Wd = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, qd = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, Hd = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, Vd = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, Yd = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, Gd = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, Qd = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, Kd = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, Xd = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, Jd = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, eu = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, tu = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, au = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, nu = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, su = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, ru = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, ou = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, iu = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, lu = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, cu = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, du = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, uu = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, hu = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, fu = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, pu = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, mu = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, vu = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, gu = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, bu = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, yu = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, wu = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, xu = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, Mu = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, _u = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, ku = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, Su = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, Ru = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, $u = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, Cu = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, zu = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, Pu = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, Eu = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, Iu = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, Lu = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, Au = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, Tu = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, ju = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, Ou = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, Zu = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, Uu = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, Nu = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, Du = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, Fu = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, Bu = {
  sanniang: {
    body: Pd,
    arm: Ed,
    heads: {
      neutral: Id,
      smile: Ld,
      teasing: Ad,
      blush: Td,
      rest: jd,
      serious: Od,
      worried: Zd,
      sad: Ud,
      displeased: Nd,
      fond: Dd,
      laugh: Fd,
      surprised: Bd
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: Wd,
    arm: Hd,
    heads: {
      neutral: qd,
      smile: tu,
      blush: Vd,
      displeased: Yd,
      fond: Gd,
      laugh: Qd,
      rest: Kd,
      sad: Xd,
      surprised: Jd,
      worried: eu
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: au,
    arm: su,
    heads: {
      neutral: nu,
      blush: pu,
      displeased: ru,
      fond: ou,
      laugh: iu,
      sad: lu,
      serious: cu,
      smile: du,
      surprised: uu,
      teasing: hu,
      worried: fu
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: mu,
    arm: vu,
    heads: {
      neutral: gu,
      smile: bu,
      teasing: yu,
      laugh: wu,
      blush: xu,
      fond: Mu,
      serious: _u,
      surprised: ku,
      worried: Su,
      sad: Ru
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: $u,
    arm: zu,
    heads: {
      neutral: Cu,
      angry: Pu,
      relieved: Eu,
      resigned: Iu,
      suspicious: Lu,
      worried: Au
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: Tu,
    arm: Ou,
    heads: {
      neutral: ju,
      displeased: Zu,
      relieved: Uu,
      smile: Nu,
      squint: Du,
      worried: Fu
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, Wu = {
  nod: {
    joint: "head",
    frames: [
      "translateY(0) rotate(0)",
      "translateY(2.5px) rotate(2deg)",
      "translateY(0) rotate(0)"
    ],
    duration: 1e3
  },
  tilt: {
    joint: "head",
    frames: [
      "rotate(0)",
      "rotate(-5deg)",
      "rotate(-5deg)",
      "rotate(0)"
    ],
    duration: 1750
  },
  shake: {
    joint: "head",
    frames: [
      "rotate(0)",
      "rotate(-2deg)",
      "rotate(2deg)",
      "rotate(-1deg)",
      "rotate(0)"
    ],
    duration: 1350
  },
  gesture: {
    joint: "arm",
    angles: [
      0,
      8,
      6,
      0
    ],
    duration: 1600
  },
  withdraw: {
    joint: "arm",
    angles: [
      0,
      -8,
      -8,
      0
    ],
    duration: 1800
  }
};
function qu(e, t, s) {
  if (e === "none") return null;
  const a = Wu[e], n = a.joint === "arm" ? a.angles.map((r) => `rotate(${r * s}deg)`) : a.frames;
  return t[a.joint].animate(n.map((r) => ({ transform: r })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var Hu = ["src"], Vu = ["src"], Yu = ["src"], Gu = /* @__PURE__ */ We({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = W(null), a = W(null), n = W(null), r = J(() => Bu[t.person]), i = W(!1), l = W(0);
    let o = 0, c = !1, u = !1, d = null, h, p;
    function g() {
      u = !0, d?.cancel(), d = null;
    }
    function v() {
      if (!(!t.animate || u || i.value || o < 3 || !c)) {
        if (document.hidden || p?.matches) {
          g();
          return;
        }
        a.value && n.value && (u = !0, d = qu(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, r.value.armDirection));
      }
    }
    function y() {
      o++, v();
    }
    function M() {
      i.value = !0, g();
    }
    function x() {
      o = 0, i.value = !1, l.value++;
    }
    function S() {
      document.hidden && g();
    }
    function b() {
      p?.matches && g();
    }
    return me(() => t.animate, (w) => {
      w ? v() : g();
    }), jt(() => {
      p = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || p.matches) && g(), p.addEventListener("change", b), document.addEventListener("visibilitychange", S), h = new IntersectionObserver((w) => {
        c = w[0].isIntersecting && w[0].intersectionRatio >= 0.25, c ? v() : d && g();
      }, { threshold: 0.25 }), s.value && h.observe(s.value);
    }), fn(g), Rt(() => {
      g(), h?.disconnect(), p?.removeEventListener("change", b), document.removeEventListener("visibilitychange", S);
    }), (w, k) => (P(), I("span", {
      ref_key: "root",
      ref: s,
      class: St(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? (P(), I("button", {
      key: 1,
      type: "button",
      onClick: x
    }, $(m(de).reloadArtwork), 1)) : (P(), I(re, { key: 0 }, [
      (P(), I("img", {
        key: "body-" + l.value,
        src: r.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 40, Hu)),
      (P(), I("img", {
        key: "head-" + l.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: r.value.heads[e.performance?.expression ?? "neutral"],
        style: Yt({ transformOrigin: r.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 44, Vu)),
      (P(), I("img", {
        key: "arm-" + l.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: r.value.arm,
        style: Yt({ transformOrigin: r.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 44, Yu))
    ], 64))], 2));
  }
}), Qu = /* @__PURE__ */ ct(Gu, [["__scopeId", "data-v-606c2ccc"]]), Ku = { class: "ember-npc-bubble" }, Xu = { class: "ember-npc-line" }, Ju = /* @__PURE__ */ We({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = J(() => zd(t.reply));
    return (a, n) => (P(), I("div", Ku, [Fe(Qu, {
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ]), _("p", Xu, [(P(!0), I(re, null, Le(s.value, (r, i) => (P(), I("span", {
      key: i,
      class: St({ "ember-spoken": r.spoken })
    }, $(r.text), 3))), 128))])]));
  }
}), os = /* @__PURE__ */ ct(Ju, [["__scopeId", "data-v-5a2c5c6c"]]), e1 = { class: "ember-campaign" }, t1 = { class: "ember-health" }, a1 = [
  "max",
  "value",
  "aria-label"
], n1 = { class: "ember-objective" }, s1 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, r1 = ["aria-label"], o1 = ["disabled", "aria-label"], i1 = ["disabled", "aria-label"], l1 = ["disabled", "aria-label"], c1 = ["aria-label"], d1 = {
  key: 4,
  class: "ember-boss"
}, u1 = [
  "max",
  "value",
  "aria-label"
], h1 = {
  key: 5,
  class: "ember-alarm"
}, f1 = ["aria-label"], p1 = ["disabled"], m1 = ["disabled"], v1 = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, g1 = { key: 0 }, b1 = { class: "ember-prose" }, y1 = ["aria-label"], w1 = {
  key: 0,
  class: "ember-panel-heading"
}, x1 = ["aria-label"], M1 = ["aria-pressed"], _1 = ["aria-pressed"], k1 = ["disabled"], S1 = { class: "ember-prose ember-prologue" }, R1 = { class: "ember-objective-panel" }, $1 = { class: "ember-journal" }, C1 = { class: "ember-pack-heading" }, z1 = { key: 0 }, P1 = { key: 1 }, E1 = { class: "ember-relics" }, I1 = { key: 0 }, L1 = ["disabled", "onClick"], A1 = { class: "ember-dialogue-heading" }, T1 = { class: "ember-person-heading" }, j1 = ["disabled"], O1 = {
  key: 0,
  class: "ember-player-line"
}, Z1 = {
  key: 1,
  class: "ember-dialogue-issue"
}, U1 = { key: 2 }, N1 = { class: "ember-prose" }, D1 = {
  key: 3,
  class: "ember-prose"
}, F1 = ["data-fresh-reply"], B1 = ["aria-busy"], W1 = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, q1 = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, H1 = { key: 0 }, V1 = { class: "ember-prose" }, Y1 = { key: 3 }, G1 = {
  key: 6,
  class: "ember-prose"
}, Q1 = ["src"], K1 = { class: "ember-prose" }, X1 = ["src"], J1 = { class: "ember-prose" }, e2 = { class: "ember-continued" }, t2 = { class: "ember-relics" }, a2 = ["disabled", "onClick"], n2 = ["disabled"], s2 = { class: "ember-prose" }, r2 = ["disabled"], o2 = ["disabled"], i2 = ["disabled"], l2 = { class: "ember-pause-actions" }, c2 = ["aria-pressed"], d2 = { class: "ember-help ember-keyboard-help" }, u2 = { class: "ember-help ember-touch-help" }, h2 = /* @__PURE__ */ We({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, s = Co(t.bridge, t.chatIdentity), a = zo(s), { view: n, notice: r, busy: i, blocked: l, talking: o, outgoing: c, conversationFailure: u } = s, { current: d, dirty: h } = a, p = W(!0), g = W(!1), v = W(!1), y = W(0), M = W(!1), x = W(!1), S = W(null), b = W(null), w = W(null), k = W("relics"), E = J(() => w.value === "map" ? N.map : w.value === "journal" ? N.journal : w.value === "build" ? N.build : w.value === "person" ? Be(L.value) : w.value === "passage" ? ne.passages[j.value].title : w.value === "arrival" ? ne.scenes.camp : w.value === "ending" || w.value === "prologue" ? Zs : d.value?.phase === "reward" ? N.reward : d.value?.phase === "lost" ? N.fallen : N.pause), L = W("sanniang"), j = W("warning"), C = W(null), U = W({}), T = J({
      get: () => U.value[L.value] ?? "",
      set: (O) => {
        U.value[L.value] = O;
      }
    }), H = W(null), Y = W(!1), F = /* @__PURE__ */ new Map(), Z = W(null), G = W(null), le = W(null), Ye = J((O) => {
      const D = d.value?.facts ?? [];
      return O && O.size === D.length && D.every((A) => O.has(A)) ? O : new Set(D);
    }), et = J(() => d.value ? {
      definition: Me[d.value.location.scene],
      location: d.value.location,
      facts: Ye.value,
      people: d.value.people
    } : null), ke = J(() => {
      const O = d.value && hn[d.value.location.scene];
      return O ? { "--scene-art": `url("${O}")` } : void 0;
    }), ue = J(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), xe = J(() => d.value ? xn(d.value) : null), dt = J(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : xe.value ? "continue" : void 0), Ct = J(() => !M.value || !d.value || !!d.value.pendingParley || !!xe.value || p.value || !!w.value || !!r.value || o.value || v.value || t.generationActive || x.value || !!S.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), qe = J(() => d.value?.battle?.enemies.find((O) => _e(O.kind))), De = J(() => d.value?.conversations[L.value] ?? []), Ge = J(() => d.value && !De.value.length ? Us(d.value, L.value) : null), Re = J(() => H.value?.person === L.value ? {
      ...H.value,
      status: Y.value ? "sending" : "failed"
    } : c.value?.person === L.value && !c.value.regenerating && !De.value.some((O) => O.id === c.value?.actionId) ? c.value : null), fe = J(() => Re.value?.status === "failed"), He = J(() => d.value && rn(d.value)?.person === L.value), Ie = W(null), ua = J(() => d.value?.collection.map((O) => {
      const D = d.value.equipped.includes(O.id) ? d.value.equipped.filter((A) => A !== O.id) : [...d.value.equipped, O.id];
      return {
        ...O,
        equipped: D,
        issue: xo(d.value, D)
      };
    }) ?? []), zt = Po(() => {
      s.error.value = ae.presentationError.sound, g.value = !1;
    });
    let Kt = !1;
    function ha() {
      (w.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && B();
    }
    async function ve() {
      await V({ type: "resolve_parley" }) && (w.value = null, await Wt(), le.value?.focus());
    }
    async function tt() {
      xe.value ? await V({ type: "accept_reply" }) : await ve();
    }
    In(C, ha), us(() => M.value ? w.value ? (ha(), !0) : p.value ? !1 : (Ve(), !0) : b.value?.back() ?? !1), In(G, () => {
      !i.value && !v.value && !t.generationActive && s.dismissError();
    });
    function Ve() {
      p.value = !0, a.flush();
    }
    function ut() {
      w.value = null, Ve();
    }
    async function Qe(O) {
      x.value || S.value || (w.value = O, O === "build" && (k.value = "relics"), await a.flush());
    }
    async function B() {
      if (!xe.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await ve();
          return;
        }
        !r.value && !t.generationActive && (M.value = !0, w.value = null, p.value = !1, await Wt(), le.value?.focus());
      }
    }
    function Za() {
      M.value = !0, d.value?.pendingParley || xe.value ? (L.value = d.value?.pendingParley?.enemy ?? xe.value, w.value = "person", p.value = !1) : B();
    }
    async function V(O) {
      if (x.value || S.value) return !1;
      x.value = !0, O.type === "interact" && d.value && (S.value = Me[d.value.location.scene].exits.find((A) => A.id === O.id)?.to ?? null);
      let D = !1;
      try {
        return await a.flush() ? (D = await s.act(O), D && (a.sync(), !w.value && !p.value && (await Wt(), le.value?.focus())), D) : !1;
      } finally {
        x.value = !1, D || (S.value = null);
      }
    }
    function Ua(O) {
      O === S.value && (S.value = null);
    }
    async function Ot(O) {
      await V({
        type: d.value ? "restart" : "start",
        ...O,
        outfit: ue.value
      }) && (M.value = !0, w.value = "prologue");
    }
    function Xt() {
      p.value = !0, w.value = null, M.value = !1, a.flush();
    }
    async function Jt(O) {
      if (!d.value || x.value || S.value) return;
      const D = [...Ts(d.value), ...Ta(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((Se) => Se.target.id === O), A = D?.kind === "object" ? D.target : null;
      if (A?.kind === "person" || A?.kind === "enemy") {
        const Se = A.kind === "person" ? A.person : A.enemy;
        L.value = Se, w.value = "person", await a.flush() && !d.value.conversations[Se].length && await s.act({
          type: "greet",
          person: Se
        }) && a.sync();
        return;
      }
      await V({
        type: "interact",
        id: O
      }) && A?.kind === "inspect" && (j.value = A.passage, w.value = "passage");
    }
    async function fa() {
      const O = L.value, D = T.value.trim();
      if (!(l.value || Y.value || !D || dt.value)) {
        U.value[O] = "", H.value = {
          person: O,
          text: D
        }, Y.value = !0, F.delete(O);
        try {
          if (!await a.flush()) return;
          const A = s.talk(O, D);
          H.value = null, await A && a.sync();
        } finally {
          Y.value = !1;
        }
      }
    }
    async function ea() {
      if (!(l.value || Y.value || !d.value))
        if (F.delete(L.value), fe.value && Re.value) {
          const O = Re.value, D = s.talk(O.person, O.text);
          H.value = null, await D && a.sync();
        } else {
          const O = rn(d.value);
          O?.person === L.value && await s.talk(L.value, O.turn.player, O.turn.id) && a.sync();
        }
    }
    function at() {
      const O = Z.value;
      O && F.set(L.value, {
        top: O.scrollTop,
        latest: O.scrollHeight - O.clientHeight - O.scrollTop < 32
      });
    }
    function ta() {
      const O = Z.value;
      if (!O || F.get(L.value)?.latest === !1) return;
      const D = Ie.value ? O.querySelector('[data-fresh-reply="true"]') : null;
      O.scrollTop = D && D.offsetHeight > O.clientHeight ? D.getBoundingClientRect().top - O.getBoundingClientRect().top + O.scrollTop - 12 : O.scrollHeight;
    }
    async function Zt() {
      await a.recover() && (p.value = !0, y.value++);
    }
    return me(() => t.generationActive, (O) => {
      O && Ve();
    }), me(() => [d.value?.pendingParley, xe.value], ([O, D]) => {
      (O || D) && (L.value = O?.enemy ?? D, w.value = "person");
    }, { immediate: !0 }), me(g, (O) => {
      zt.enable(O);
    }), me(d, (O) => {
      g.value && O?.battle && zt.tick(O.battle);
    }), me(() => n.value?.data, (O, D) => {
      if (!O?.active || !D?.active || O.active.id !== D.active.id) return;
      const A = new Set(D.active.facts), Se = new Set(O.active.facts);
      !A.has("chapter_completed") && Se.has("chapter_completed") ? w.value = "ending" : !A.has("captives_arrived") && Se.has("captives_arrived") && (w.value = "arrival");
    }), me(() => d.value?.id, () => {
      U.value = {}, H.value = null, F.clear();
    }), me([w, L], () => {
      Ie.value = null;
    }), me(r, (O) => {
      O && (Ie.value = null);
    }), me(() => [L.value, De.value], ([O, D], [A, Se]) => {
      const Pt = D.filter((aa) => aa.kind === "dialogue").at(-1);
      O === A && w.value === "person" && Pt && !Se.some((aa) => aa.id === Pt.id) && (Ie.value = Pt.id);
    }), me([Z, L], ([O, D]) => {
      const A = F.get(D);
      O && (O.scrollTop = A && !A.latest ? A.top : O.scrollHeight);
    }, { flush: "post" }), me(Z, (O, D, A) => {
      if (!O) return;
      const Se = new ResizeObserver(ta);
      Se.observe(O), A(() => Se.disconnect());
    }, { flush: "post" }), me(() => [
      De.value.length,
      o.value,
      Re.value,
      Ie.value
    ], async () => {
      await Wt(), ta();
    }), jt(async () => {
      await s.read(), Kt = !0;
    }), ls(() => {
      Kt && !h.value && s.read();
    }), fn(() => {
      Ie.value = null, Ve();
    }), Rt(() => {
      a.dispose(), s.dispose(), zt.dispose();
    }), (O, D) => (P(), I("section", e1, [
      M.value ? Q("", !0) : (P(), Ut(pd, {
        key: 0,
        ref_key: "entry",
        ref: b,
        campaign: m(d),
        ready: !!m(n)?.ready,
        busy: m(i),
        blocked: m(l) || e.generationActive,
        onStart: Ot,
        onContinue: Za
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      M.value && m(d) && et.value ? (P(), Ut(Zi, {
        key: y.value,
        ref_key: "field",
        ref: le,
        world: et.value,
        traveler: m(d).traveler,
        paused: Ct.value,
        transitioning: !!S.value,
        weapon: m(d).weapon,
        outfit: ue.value,
        battle: m(d).battle,
        onInput: m(a).input,
        onInteract: Jt,
        onPause: Ve,
        onResume: B,
        onError: D[0] || (D[0] = (A) => v.value = !0),
        onReady: Ua
      }, {
        status: Pn(() => [m(d) ? (P(), I(re, { key: 0 }, [_("div", t1, [_("meter", {
          min: 0,
          max: m(K).maxHp,
          value: m(d).hp,
          "aria-label": m(ae).hp
        }, null, 8, a1), _("span", null, $(Math.ceil(m(d).hp)) + " / " + $(m(K).maxHp), 1)]), _("p", n1, $(m(On)(m(d))), 1)], 64)) : Q("", !0)]),
        overlay: Pn(() => [...D[17] || (D[17] = [_("span", null, null, -1)])]),
        _: 1
      }, 8, [
        "world",
        "traveler",
        "paused",
        "transitioning",
        "weapon",
        "outfit",
        "battle",
        "onInput"
      ])) : Q("", !0),
      M.value && S.value && !m(r) && !v.value && !w.value && !p.value ? (P(), I("aside", s1, $(m(ne).transition(m(ne).scenes[S.value])), 1)) : Q("", !0),
      M.value && m(d) && !m(d).pendingParley && !xe.value ? (P(), I("nav", {
        key: 3,
        class: "ember-tools",
        "aria-label": m(N).prepare
      }, [
        _("button", {
          type: "button",
          disabled: x.value || !!S.value,
          "aria-label": m(N).map,
          onClick: D[1] || (D[1] = (A) => Qe("map"))
        }, [Fe(Et, { name: "map" }), _("span", null, $(m(N).map), 1)], 8, o1),
        _("button", {
          type: "button",
          disabled: x.value || !!S.value,
          "aria-label": m(N).build,
          onClick: D[2] || (D[2] = (A) => Qe("build"))
        }, [Fe(Et, { name: "bag" }), _("span", null, $(m(N).build), 1)], 8, i1),
        _("button", {
          type: "button",
          disabled: x.value || !!S.value,
          "aria-label": m(N).journal,
          onClick: D[3] || (D[3] = (A) => Qe("journal"))
        }, [Fe(Et, { name: "journal" }), _("span", null, $(m(N).journal), 1)], 8, l1),
        _("button", {
          type: "button",
          "aria-label": m(N).pause,
          onClick: ut
        }, [Fe(Et, { name: "pause" }), _("span", null, $(m(N).pause), 1)], 8, c1)
      ], 8, r1)) : Q("", !0),
      M.value && qe.value && !w.value ? (P(), I("div", d1, [_("strong", null, $(m(Xa)[qe.value.kind]), 1), _("meter", {
        min: "0",
        max: qe.value.maxHp,
        value: qe.value.hp,
        "aria-label": m(Xa)[qe.value.kind]
      }, null, 8, u1)])) : Q("", !0),
      M.value && m(d)?.phase === "battle" && ["gate", "beacon"].includes(m(d).location.scene) && !Ye.value.has("alarm_silenced") ? (P(), I("div", h1, $(Ye.value.has("alarm_raised") ? m(N).alarmRaised : m(N).alarmSeconds(Math.ceil((m(ia).alarmTicks - m(d).alarmTicks) / m(K).hz))), 1)) : Q("", !0),
      m(r) || v.value || e.generationActive ? (P(), I("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: G,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": m(N).noticeTitle,
        tabindex: "-1"
      }, [_("p", null, $(v.value ? m(N).renderError : e.generationActive ? m(N).generation : m(r)), 1), v.value ? (P(), I("button", {
        key: 0,
        type: "button",
        onClick: D[4] || (D[4] = (A) => {
          v.value = !1, y.value++;
        })
      }, $(m(N).reload), 1)) : m(s).dataInvalid.value && !e.generationActive ? (P(), I(re, { key: 1 }, [_("p", null, $(m(N).rebuildWarning), 1), _("button", {
        type: "button",
        disabled: m(i),
        onClick: D[5] || (D[5] = (...A) => m(s).rebuild && m(s).rebuild(...A))
      }, $(m(N).rebuild), 9, p1)], 64)) : e.generationActive ? Q("", !0) : (P(), I("button", {
        key: 2,
        type: "button",
        disabled: m(i),
        onClick: D[6] || (D[6] = (A) => m(s).recoveryRequired.value ? Zt() : m(s).dismissError())
      }, $(m(s).recoveryRequired.value ? m(N).recover : m(N).acknowledge), 9, m1))], 8, f1)) : Q("", !0),
      m(u) && !m(r) && (w.value !== "person" || L.value !== m(u).person) ? (P(), I("aside", v1, [
        _("strong", null, $(m(Be)(m(u).person)), 1),
        _("p", null, $(m(Mt)(m(u))), 1),
        m(u).text ? (P(), I("details", g1, [_("summary", null, $(m(N).receivedReply), 1), _("p", b1, $(m(u).text), 1)])) : Q("", !0),
        _("button", {
          type: "button",
          onClick: D[7] || (D[7] = (...A) => m(s).dismissConversationFailure && m(s).dismissConversationFailure(...A))
        }, $(m(N).acknowledge), 1)
      ])) : Q("", !0),
      M.value && m(d) && !m(r) && !v.value && !e.generationActive && (w.value || p.value || m(d).phase === "reward" || m(d).phase === "lost") ? (P(), I("div", {
        key: 8,
        class: "ember-curtain",
        style: Yt(w.value === "person" ? ke.value : void 0)
      }, [_("section", {
        ref_key: "dialog",
        ref: C,
        class: St(["ember-panel", {
          "ember-wide": w.value === "map" || w.value === "build" && k.value === "wardrobe",
          "ember-map-panel": w.value === "map",
          "ember-wardrobe-panel": w.value === "build" && k.value === "wardrobe",
          "ember-dialogue": w.value === "person"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": E.value,
        tabindex: "-1"
      }, [w.value !== "map" && w.value !== "person" ? (P(), I("header", w1, [
        _("h2", null, $(E.value), 1),
        w.value === "build" ? (P(), I("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": m(N).build
        }, [_("button", {
          type: "button",
          "aria-pressed": k.value === "relics",
          onClick: D[8] || (D[8] = (A) => k.value = "relics")
        }, $(m(ce).equipment), 9, M1), _("button", {
          type: "button",
          "aria-pressed": k.value === "wardrobe",
          onClick: D[9] || (D[9] = (A) => k.value = "wardrobe")
        }, $(m(N).wardrobe), 9, _1)], 8, x1)) : Q("", !0),
        w.value !== "prologue" && m(d).pendingParley?.decision !== "attack" && (w.value || m(d).phase !== "lost" && m(d).phase !== "reward") ? (P(), I("button", {
          key: 1,
          type: "button",
          disabled: !!m(d).pendingParley && m(l),
          onClick: B
        }, $(m(N).close), 9, k1)) : Q("", !0)
      ])) : Q("", !0), w.value === "map" ? (P(), Ut(Rl, {
        key: 1,
        campaign: m(d),
        onClose: B
      }, null, 8, ["campaign"])) : w.value === "prologue" ? (P(), I(re, { key: 2 }, [_("p", S1, $(m(N).opening), 1), _("button", {
        class: "ember-primary",
        type: "button",
        onClick: B
      }, $(m(N).start), 1)], 64)) : w.value === "journal" ? (P(), I(re, { key: 3 }, [_("p", R1, $(m(On)(m(d))), 1), _("ol", $1, [(P(!0), I(re, null, Le(m(d).facts, (A) => (P(), I("li", { key: A }, $(m(Ms)[A]), 1))), 128))])], 64)) : w.value === "build" ? (P(), I(re, { key: 4 }, [k.value === "wardrobe" && m(n) ? (P(), Ut(Xl, {
        key: 0,
        data: m(n).data,
        traveler: m(d).traveler,
        balance: m(n).balance,
        blocked: m(l),
        weapon: m(d).weapon,
        onCommand: V
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : (P(), I(re, { key: 1 }, [
        _("div", C1, [_("strong", null, $(m(d).traveler.name), 1), _("span", null, $(m(ce).genders[m(d).traveler.gender]) + " · " + $(m(ce).identityRole), 1)]),
        _("small", null, $(m(N).slots(m(d).equipped.length, m(K).relicSlots)), 1),
        _("p", null, $(m(wt)[m(d).weapon].name) + " · " + $(m(kr)(m(d).weapon)), 1),
        m(Me)[m(d).location.scene].safe ? Q("", !0) : (P(), I("p", z1, $(m(N).safeBuild), 1)),
        m(d).collection.length ? Q("", !0) : (P(), I("p", P1, $(m(N).emptyBuild), 1)),
        _("div", E1, [(P(!0), I(re, null, Le(ua.value, (A) => (P(), I("article", { key: A.id }, [
          Fe(Et, { name: A.id }, null, 8, ["name"]),
          _("h3", null, [Oe($(m(pa)[A.id].name) + " ", 1), _("small", null, $(m(ae).rank(A.rank)), 1)]),
          _("p", null, $(m(pa)[A.id].detail), 1),
          A.issue === "dependency" || A.issue === "capacity" ? (P(), I("small", I1, $(m(N).loadoutIssue[A.issue]), 1)) : Q("", !0),
          _("button", {
            type: "button",
            disabled: m(l) || !!A.issue,
            onClick: (Se) => V({
              type: "loadout",
              equipped: A.equipped
            })
          }, $(m(d).equipped.includes(A.id) ? m(N).takeOff : m(N).putOn), 9, L1)
        ]))), 128))])
      ], 64))], 64)) : w.value === "person" ? (P(), I(re, { key: 5 }, [
        _("header", A1, [
          _("div", T1, [_("h2", null, $(m(Be)(L.value)), 1), _("small", null, $(m(ne).scenes[m(d).location.scene]), 1)]),
          (P(), Ut(Pc, {
            key: L.value,
            campaign: m(d),
            person: L.value,
            draft: T.value,
            "memory-state": m(n)?.memories?.[L.value],
            blocked: m(l),
            onRetryMemory: D[10] || (D[10] = (A) => m(s).retryMemory(L.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !xe.value && m(d).pendingParley?.decision !== "attack" ? (P(), I("button", {
            key: 0,
            type: "button",
            disabled: !!m(d).pendingParley && m(l),
            onClick: B
          }, $(m(N).close), 9, j1)) : Q("", !0)
        ]),
        _("div", {
          ref_key: "transcript",
          ref: Z,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          onScroll: at
        }, [
          Ge.value ? (P(), Ut(os, {
            key: 0,
            person: L.value,
            reply: Ge.value.reply,
            performance: Ge.value.performance,
            animate: !1
          }, null, 8, [
            "person",
            "reply",
            "performance"
          ])) : Q("", !0),
          (P(!0), I(re, null, Le(De.value, (A) => (P(), I(re, { key: A.id }, [
            A.kind !== "greeting" ? (P(), I("p", O1, [_("small", null, $(m(d).traveler.name), 1), Oe($(A.player), 1)])) : Q("", !0),
            A.issue === "action_rejected" || A.issue === "reply_invalid" || A.issue === "reply_incomplete" ? (P(), I("p", Z1, $(m(de).issues[A.issue]), 1)) : Q("", !0),
            A.kind === "receipt" && A.issue === "reply_invalid" ? (P(), I("details", U1, [_("summary", null, $(m(de).rawReply), 1), _("p", N1, $(A.reply), 1)])) : A.kind === "receipt" ? (P(), I("p", D1, $(A.reply), 1)) : (P(), I("div", {
              key: 4,
              class: "ember-npc-turn",
              "data-fresh-reply": Ie.value === A.id
            }, [Fe(os, {
              person: L.value,
              reply: A.reply,
              performance: A.performance,
              animate: Ie.value === A.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]), Fe(Cd, {
              campaign: m(d),
              person: L.value,
              turn: A
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ])], 8, F1))
          ], 64))), 128)),
          Re.value ? (P(), I(re, { key: 1 }, [_("p", {
            class: "ember-player-line",
            "aria-busy": Re.value.status === "sending"
          }, [_("small", null, $(m(d).traveler.name), 1), Oe($(Re.value.text), 1)], 8, B1), fe.value ? (P(), I("p", W1, $(m(de).sendFailed), 1)) : Q("", !0)], 64)) : Q("", !0),
          m(u)?.person === L.value && !De.value.some((A) => A.id === m(u)?.actionId) ? (P(), I("div", q1, [
            _("p", null, $(m(Mt)(m(u))), 1),
            m(u).text ? (P(), I("details", H1, [_("summary", null, $(m(N).receivedReply), 1), _("p", V1, $(m(u).text), 1)])) : Q("", !0),
            _("button", {
              type: "button",
              onClick: D[11] || (D[11] = (...A) => m(s).dismissConversationFailure && m(s).dismissConversationFailure(...A))
            }, $(m(N).acknowledge), 1)
          ])) : Q("", !0),
          m(o) ? (P(), I("p", Y1, $(m(N).thinking), 1)) : Q("", !0)
        ], 544),
        Fe(xd, {
          modelValue: T.value,
          "onUpdate:modelValue": D[12] || (D[12] = (A) => T.value = A),
          blocked: m(l) || Y.value || e.generationActive,
          talking: m(o),
          "can-regenerate": !!He.value || fe.value,
          retrying: fe.value,
          conclusion: dt.value,
          onSend: fa,
          onRegenerate: ea,
          onContinue: tt,
          onCancel: m(s).cancelTalk
        }, null, 8, [
          "modelValue",
          "blocked",
          "talking",
          "can-regenerate",
          "retrying",
          "conclusion",
          "onCancel"
        ])
      ], 64)) : w.value === "passage" ? (P(), I("p", G1, $(m(ne).passages[j.value].body), 1)) : w.value === "arrival" ? (P(), I(re, { key: 7 }, [
        _("img", {
          class: "ember-story-art",
          src: m(ts).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, Q1),
        _("p", K1, $(m(N).received), 1),
        _("button", {
          class: "ember-primary",
          type: "button",
          onClick: B
        }, $(m(N).resume), 1)
      ], 64)) : w.value === "ending" ? (P(), I(re, { key: 8 }, [
        _("img", {
          class: "ember-story-art",
          src: m(ts).ending,
          alt: "",
          decoding: "async"
        }, null, 8, X1),
        _("h2", null, $(m(N).endingTitle), 1),
        _("p", J1, $(m(N).ending), 1),
        _("strong", e2, $(m(N).continued), 1),
        _("p", null, $(m(N).optional), 1),
        _("button", {
          class: "ember-primary",
          type: "button",
          onClick: B
        }, $(m(N).remain), 1)
      ], 64)) : m(d).phase === "reward" ? (P(), I(re, { key: 9 }, [
        _("p", null, $(m(N).rewardDetail), 1),
        _("div", t2, [(P(!0), I(re, null, Le(m(d).offers, (A) => (P(), I("button", {
          key: A.id,
          type: "button",
          disabled: m(l),
          onClick: (Se) => V({
            type: "relic",
            id: A.id
          })
        }, [
          Fe(Et, { name: A.id }, null, 8, ["name"]),
          _("h3", null, [Oe($(m(pa)[A.id].name) + " ", 1), _("small", null, $(m(ae).rank(A.rank)), 1)]),
          _("p", null, $(m(pa)[A.id].detail), 1)
        ], 8, a2))), 128))]),
        _("button", {
          type: "button",
          disabled: m(l),
          onClick: D[13] || (D[13] = (A) => V({ type: "leave" }))
        }, $(m(N).skip), 9, n2)
      ], 64)) : m(d).phase === "lost" ? (P(), I(re, { key: 10 }, [
        _("p", s2, $(m(N).fallenDetail), 1),
        _("button", {
          class: "ember-primary",
          type: "button",
          disabled: m(l),
          onClick: D[14] || (D[14] = (A) => V({ type: "retry" }))
        }, $(m(N).retry), 9, r2),
        _("button", {
          type: "button",
          disabled: m(l),
          onClick: D[15] || (D[15] = (A) => V({ type: "retreat" }))
        }, $(m(N).retreat), 9, o2)
      ], 64)) : (P(), I(re, { key: 11 }, [
        _("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!m(r) || e.generationActive,
          onClick: B
        }, $(m(N).resume), 9, i2),
        _("div", l2, [_("button", {
          type: "button",
          "aria-pressed": g.value,
          onClick: D[16] || (D[16] = (A) => g.value = !g.value)
        }, $(m(N).sound), 9, c2)]),
        _("details", null, [
          _("summary", null, $(m(ce).controls), 1),
          _("p", d2, $(m(N).controls), 1),
          _("p", u2, $(m(N).touchControls), 1)
        ]),
        _("button", {
          type: "button",
          onClick: Xt
        }, $(m(ce).title), 1)
      ], 64))], 10, y1)], 4)) : Q("", !0)
    ]));
  }
}), _2 = h2;
export {
  _2 as default
};
