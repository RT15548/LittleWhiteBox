/* eslint-disable */
import { $ as At, A as En, D as je, E as Ze, I as mn, J as ds, M as Wt, N as us, P as $t, Q as An, R as Zt, S as I, T as ze, U as Ie, V as z, W as Ln, X as me, at as Ht, b as Mt, c as ir, ct as lr, d as vn, dt as Gt, ft as R, h as ee, i as Tn, l as hs, lt as m, m as mt, p as cr, q as fs, r as ps, rt as q, u as dr, ut as lt, v as X, x as G, y as k } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Ge } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as ur, r as Ha, t as hr } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as fr } from "./xiaobai-os-constants-CDXgazQ7.js";
import { C as sa, Ct as pr, Ft as jn, Lt as ct, Pt as mr, S as vr, St as ms, T as On, Tt as gr, X as vt, Y as vs, Z as br, _ as Xa, _t as yr, a as _a, bt as Va, d as gn, et as gs, h as wr, kt as xr, l as Mr, n as bs, o as _r, p as kr, st as ys, vt as Sr, w as ws, wt as Zn, x as Rr, xt as bn, y as Un, yt as $r } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as xs } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
import { C as Ms, S as Cr, _ as Te, a as _t, b as _s, c as N, d as ce, f as Ja, g as ks, h as zr, i as va, l as Ss, m as ue, n as en, o as St, p as it, r as qt, s as Pr, t as ne, u as Nn, v as K, x as _e, y as Tt } from "./xiaobai-os-copy-BGtWmU_c.js";
function Pa(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Ir(e, t, s) {
  const a = [...t], n = [];
  for (; a.length && n.length < s; ) n.push(a.splice(Math.floor(Pa(e) * a.length), 1)[0]);
  return n;
}
function Ga() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function we(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function Pe(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var Er = 1e-9;
function Vt(e, t, s) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (s + 0.5) * e.cellSize
  };
}
function jt(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function Rs(e, t) {
  const s = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!s || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((o) => o.length !== s || /[^.# ]/.test(o))) && Pe("map_invalid");
  const n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  for (const o of e.gates) {
    (!o.id || n.has(o.id) || !o.cells.length) && Pe("map_invalid"), n.add(o.id);
    const l = !t.has(o.id);
    l && c.add(o.id);
    for (const { column: u, row: d } of o.cells) {
      (!Number.isInteger(u) || !Number.isInteger(d) || u < 0 || u >= s || e.rows[d]?.[u] !== ".") && Pe("map_invalid");
      const h = d * s + u;
      r.has(h) && Pe("map_invalid"), r.add(h), l && i.add(h);
    }
  }
  for (const o of t) n.has(o) || Pe("gate_unknown");
  return {
    map: e,
    columns: s,
    rows: a,
    closedGates: c,
    blocked(o, l) {
      return o < 0 || o >= s || l < 0 || l >= a || e.rows[l][o] !== "." || i.has(l * s + o);
    }
  };
}
function ka(e, t, s, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), r = Math.max(s - e.y, 0, e.y - s - a);
  return n * n + r * r;
}
function ga(e, t, s) {
  const a = s.x - t.x, n = s.y - t.y, r = a * a + n * n, i = r === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / r));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function $s(e, t, s, a, n) {
  let r = 0, i = 1;
  for (const [c, o, l] of [[
    e.x,
    t.x - e.x,
    s
  ], [
    e.y,
    t.y - e.y,
    a
  ]]) if (o === 0) {
    if (c <= l || c >= l + n) return !1;
  } else {
    const u = (l - c) / o, d = (l + n - c) / o;
    if (r = Math.max(r, Math.min(u, d)), i = Math.min(i, Math.max(u, d)), r >= i) return !1;
  }
  return r < i;
}
function Ar(e, t, s, a, n) {
  return $s(e, t, s, a, n) ? 0 : Math.min(ka(e, s, a, n), ka(t, s, a, n), ga({
    x: s,
    y: a
  }, e, t), ga({
    x: s + n,
    y: a
  }, e, t), ga({
    x: s,
    y: a + n
  }, e, t), ga({
    x: s + n,
    y: a + n
  }, e, t));
}
function Le(e, t, s, a = 0) {
  (![
    t.x,
    t.y,
    s.x,
    s.y,
    a
  ].every(Number.isFinite) || a < 0) && Pe("input_invalid");
  const { map: n } = e, r = n.cellSize, i = jt(n, {
    x: Math.min(t.x, s.x) - a,
    y: Math.min(t.y, s.y) - a
  }), c = jt(n, {
    x: Math.max(t.x, s.x) + a,
    y: Math.max(t.y, s.y) + a
  });
  for (let o = i.row; o <= c.row; o++) for (let l = i.column; l <= c.column; l++) {
    if (!e.blocked(l, o)) continue;
    const u = n.origin.x + l * r, d = n.origin.y + o * r;
    if (a === 0 ? $s(t, s, u, d, r) || ka(t, u, d, r) === 0 && ka(s, u, d, r) === 0 : Ar(t, s, u, d, r) < a * a - Er) return !1;
  }
  return !0;
}
var wt = (e, t, s) => Le(e, t, t, s);
function yn(e, t, s, a) {
  [s.x, s.y].every(Number.isFinite) || Pe("input_invalid"), wt(e, t, a) || Pe("position_blocked");
  const n = Math.hypot(s.x, s.y);
  if (n === 0) return;
  const r = Math.ceil(n / (e.map.cellSize / 4)), i = s.x / r, c = s.y / r;
  for (let o = 0; o < r; o++) {
    const l = {
      x: t.x + i,
      y: t.y + c
    };
    if (Le(e, t, l, a)) {
      Object.assign(t, l);
      continue;
    }
    const u = Math.abs(i) >= Math.abs(c) ? ["x", "y"] : ["y", "x"];
    for (const d of u) {
      const h = {
        ...t,
        [d]: t[d] + (d === "x" ? i : c)
      };
      Le(e, t, h, a) && Object.assign(t, h);
    }
  }
}
function tn(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function xt(e) {
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
  ].every(Number.isInteger)) && Pe("map_invalid");
  const r = t.features.map((u) => u.id);
  new Set(r).size !== r.length && Pe("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && Pe("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + s.width || u.z + u.depth / 2 > a.y + s.depth) && Pe("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([d, h], p) => !Number.isFinite(d) || !Number.isFinite(h) || p > 0 && d === u.points[p - 1][0] && h === u.points[p - 1][1])) && Pe("map_invalid");
  const i = [];
  for (let u = 0; u < s.depth; u++) {
    let d = "";
    for (let h = 0; h < s.width; h++) {
      const p = {
        x: a.x + h + 0.5,
        y: a.y + u + 0.5
      };
      d += t.features.some((v) => v.kind !== "arch" && tn(p, v.footprint)) ? "#" : ".";
    }
    i.push(d);
  }
  const c = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((u) => {
      const d = u.footprint, h = [];
      for (let p = d.z - d.depth / 2 - a.y; p < d.z + d.depth / 2 - a.y; p++) for (let v = d.x - d.width / 2 - a.x; v < d.x + d.width / 2 - a.x; v++) h.push({
        column: v,
        row: p
      });
      return {
        id: u.id,
        cells: h
      };
    })
  }, o = Rs(c, new Set(c.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !wt(o, u, K.playerRadius)) && Pe("map_invalid");
  const l = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || l.has(u.id)) && Pe("map_invalid"), l.add(u.id);
  return {
    ...e,
    map: c,
    gates: t.gates
  };
}
var $ = (e, t, s, a, n, r, i = {}) => ({
  id: e,
  kind: t,
  footprint: {
    x: s,
    z: a,
    width: n,
    depth: r
  },
  ...i
}), te = (e, t, s, a, n, r, i, c = {}) => ({
  ...$(e, s, a, n, r, i, c),
  label: t
}), Yt = {
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
      te("examination", "铺白布的诊床", "bed", -5.5, -3.5, 3, 5, { tint: "sage" }),
      te("screen", "遮住诊床的屏风", "screen", -2.5, -3, 1, 6),
      te("apothecary", "分格药柜", "cabinet", 7, -7, 6, 2, { tint: "sage" }),
      te("medicine", "药碗与药材工作台", "medicine", 7, -2, 6, 2),
      te("wash", "洗手盆与清水罐", "basin", -8, -8, 2, 2),
      te("waiting", "候诊长凳", "bench", -7, 6, 6, 2)
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
      te("bed", "床与叠好的薄被", "bed", -4.5, -4, 3, 4, { tint: "rose" }),
      te("wardrobe", "衣柜与换洗衣物", "wardrobe", 5, -7, 6, 2, { tint: "rose" }),
      te("tea", "放着茶具和书的矮桌", "table", 4, 1, 4, 2),
      te("chair", "桌边的木椅", "chair", 4, 4, 2, 2),
      te("wash", "梳洗盆与毛巾", "basin", -7, 4, 2, 2)
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
      te("counter", "店家的柜台与登记簿", "ledger", 7, -5, 6, 2),
      te("shelf", "碗盏与备用被褥柜", "cabinet", 7, -9, 6, 2),
      te("table", "共用饭桌", "table", -5, 0, 4, 4),
      te("seats", "饭桌旁的长凳", "bench", -5, 4, 4, 2),
      te("stove", "温着水的小炉", "stove", -8, -7, 2, 2)
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
      te("bed", "客床与干净被褥", "bed", -4.5, -3, 3, 4, { tint: "sage" }),
      te("chest", "放行囊的矮柜", "cabinet", 5, -6, 4, 2, { height: 1.2 }),
      te("table", "带烛台的小桌", "table", 5, 0, 4, 2),
      te("chair", "木椅", "chair", 5, 3, 2, 2),
      te("wash", "水盆与毛巾", "basin", -7, 4, 2, 2)
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
      te("bed", "靠墙的单人床", "bed", -4.5, -4, 3, 4, { tint: "sage" }),
      te("kit", "衣物柜与守门用具", "wardrobe", 6, -7, 4, 2),
      te("table", "饭碗与水壶所在的桌子", "table", 5, -1, 4, 2),
      te("chair", "旧木椅", "chair", 5, 2, 2, 2),
      te("stove", "墙角的小炉", "stove", -7, 5, 2, 2)
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
      te("bed", "挤在工具旁的睡铺", "bed", -4.5, -3, 3, 4, { tint: "amber" }),
      te("bench", "钳子、扳手与零件工作台", "workbench", 5, -4, 6, 2),
      te("rack", "铜管短料与工具架", "toolrack", 5, -7, 6, 2),
      te("chair", "修理凳", "chair", 5, -1, 2, 2),
      te("wash", "搪洗盆", "basin", -7, 5, 2, 2)
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
      te("table", "一家人吃饭的桌子", "table", -5, 3, 4, 4),
      te("bench", "桌边长凳", "bench", -5, 7, 4, 2),
      te("work", "父亲修铜管的工作台", "workbench", 8, -6, 6, 2),
      te("sewing", "母亲的衣料柜", "wardrobe", 8, 0, 6, 2, { tint: "rose" }),
      te("parents_bed", "父母的床铺", "bed", -7, -6, 4, 4),
      te("screen", "遮住父母睡处的屏风", "screen", -7, -1.5, 6, 1)
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
      te("bed", "小床与洗净的被单", "bed", -4.5, -3, 3, 4, { tint: "rose" }),
      te("clothes", "衣物柜", "wardrobe", 5, -6, 6, 2, { tint: "rose" }),
      te("desk", "临窗小桌", "table", 5, 0, 4, 2),
      te("chair", "木椅", "chair", 5, 3, 2, 2),
      te("wash", "洗脸盆", "basin", -7, 5, 2, 2)
    ]
  }
}, Ya = [
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
function Sa(e) {
  return Object.hasOwn(Yt, e) ? Yt[e] : void 0;
}
function ra(e) {
  return Sa(e) ? "camp" : e;
}
var Lr = xt({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(Ya.map((e) => [e.to, e.position])),
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
    ...Ya.map((e) => ({
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
      $("clinic", "clinic", -19, 4, 14, 10),
      $("storehouse", "storehouse", 12, -9, 12, 12),
      $("hearth", "stove", 0, 6, 4, 4),
      $("rest-bench", "bench", -5, 15, 2, 4),
      $("wagon", "wagon", 22, 3, 4, 6),
      $("supply-crates", "supplies", 20, -5, 4, 4),
      $("drying-shed", "workshop", -29, 0, 4, 10, { height: 3.5 }),
      $("herbs-small", "medicine", -23, 10, 6, 2),
      $("menders-home", "dwelling", -12, 20, 4, 4, {
        height: 3.3,
        tint: "rose"
      }),
      $("eastern-home", "dwelling", 15, 20, 4, 4, { height: 4.1 }),
      $("wall-home", "dwelling", -31, -12, 4, 4, { height: 5 }),
      $("charcoal-home", "dwelling", 34, -16, 4, 4, { height: 4.7 }),
      $("pipe-home", "dwelling", -16, -19, 4, 4, { height: 3.8 }),
      $("canal-west", "water", -26, -28, 44, 4),
      $("canal-east", "water", 26, -28, 44, 4),
      $("bridge-west", "wall", -5, -28, 2, 6, { height: 0.8 }),
      $("bridge-east", "wall", 5, -28, 2, 6, { height: 0.8 }),
      $("gate-west", "wall", -26, -49, 44, 4, { height: 6 }),
      $("gate-east", "wall", 26, -49, 44, 4, { height: 6 }),
      $("west-watchtower", "tower", -8, -49, 6, 8, { height: 12 }),
      $("east-watchtower", "tower", 8, -49, 6, 8, { height: 12 }),
      $("departure-arch", "arch", 0, -49, 10, 4, { height: 8 }),
      $("west-boundary", "wall", -37, -26, 2, 62, {
        height: 7,
        wallUse: "homes"
      }),
      $("postern-bottom", "wall", -37, 25, 2, 32, {
        height: 7,
        wallUse: "homes"
      }),
      $("south-boundary", "wall", 0, 40, 96, 4, { height: 1 }),
      $("east-boundary", "wall", 46, -8, 4, 96, { height: 1.2 }),
      $("postern-end", "wall", -47, -8, 2, 100, { height: 2.4 }),
      $("north-boundary", "wall", 0, -57, 96, 2, { height: 5 }),
      $("roadside-workshop", "workshop", -17, -38, 16, 8, { height: 4 }),
      $("lookout-ruin", "ruin", 24, -38, 6, 6, { height: 3 }),
      $("arrival-home", "dwelling", -27, 28, 6, 6, { height: 4.3 }),
      $("eastern-workshop", "workshop", 28, 30, 6, 6, { height: 3.7 }),
      $("wall-row", "dwelling", -24, -21, 18, 4, { height: 4.5 }),
      $("roadside-homes", "dwelling", -8, -12, 4, 10, { height: 4.2 }),
      $("clinic-back-shed", "workshop", -20, -5, 16, 2, { height: 2.6 })
    ].map((e) => Ya.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), Tr = xt({
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
      $("wall-west", "wall", -30, -32, 2, 32, { height: 3 }),
      $("wall-west-low", "wall", -30, 19, 2, 58, { height: 2 }),
      $("wall-east", "wall", 24, -25, 4, 44, { height: 7 }),
      $("rampart-tower", "tower", 24, -16, 8, 8, { height: 15 }),
      $("gate-tower-left", "tower", -8, -41, 6, 8, { height: 11 }),
      $("gate-tower-right", "tower", 8, -41, 6, 8, { height: 11 }),
      $("north-arch", "arch", 0, -41, 10, 4, { height: 8 }),
      $("west-gate-wall", "wall", -26, -43, 40, 4, { height: 5 }),
      $("east-gate-wall", "wall", 36, -43, 20, 4, { height: 5 }),
      $("road-ruin", "ruin", -12, 1, 6, 6, { height: 3.5 }),
      $("fallen-column", "ruin", 12, -2, 4, 4, { height: 1.2 }),
      $("road-tree", "tree", -17, 27, 4, 4, {
        height: 9,
        tint: "amber"
      }),
      $("roots-tree", "tree", -39, -25, 6, 6, {
        height: 13,
        tint: "sage"
      }),
      $("southern-tree", "tree", 17, 37, 4, 4, {
        height: 9,
        tint: "sage"
      }),
      $("arrival-watch-west", "tower", -8, 44, 6, 8, { height: 10 }),
      $("arrival-watch-east", "tower", 8, 44, 6, 8, { height: 10 }),
      $("arrival-arch", "arch", 0, 44, 10, 4, { height: 8 }),
      $("broken-convoy", "wagon", -12, 19, 4, 6, { damaged: !0 }),
      $("convoy-supplies", "supplies", -16, 16, 4, 4),
      $("stranded-cargo", "cargo", -24, 28, 8, 12),
      $("stranded-fuel", "fuel", 18, 25, 6, 8),
      $("old-border", "thicket", -18, -6, 14, 4),
      $("waterway-bank", "water", 37, 21, 22, 16),
      $("north-boundary", "wall", 0, -47, 96, 2, { height: 5 }),
      $("south-boundary-west", "wall", -26, 47, 44, 2, { height: 5 }),
      $("south-boundary-east", "wall", 26, 47, 44, 2, { height: 5 }),
      $("west-boundary", "wall", -47, 0, 2, 96, { height: 2 }),
      $("east-boundary", "wall", 47, 0, 2, 96, { height: 2 })
    ]
  }
}), jr = xt({
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
      $("outer-west", "wall", -35, 0, 2, 80, { height: 8 }),
      $("outer-east", "wall", 35, 0, 2, 80, { height: 8 }),
      $("north-wall", "wall", 0, -39, 72, 2, { height: 9 }),
      $("south-wall", "wall", 0, 39, 72, 2, { height: 5 }),
      $("gate-tower-west", "tower", -10, -27, 8, 12, { height: 16 }),
      $("gate-tower-east", "tower", 10, -27, 8, 12, { height: 16 }),
      $("main-arch", "arch", 0, -27, 12, 6, { height: 12 }),
      $("gate-flank-west", "wall", -25, -27, 22, 6, { height: 9 }),
      $("gate-flank-east", "wall", 25, -27, 22, 6, { height: 9 }),
      $("west-pillars", "ruin", -13, -3, 6, 4, { height: 4.8 }),
      $("east-pillars", "ruin", 13, -3, 6, 4, { height: 4.8 }),
      $("western-barracks", "storehouse", -25, 2, 12, 12),
      $("eastern-barracks", "storehouse", 25, 2, 12, 12),
      $("awaiting-inspection", "cargo", -15, 23, 4, 12),
      $("cleared-consignments", "cargo", 15, 23, 4, 12),
      $("inspection-cart", "wagon", 25, 19, 4, 6),
      $("inspection-crates", "supplies", 28, 25, 4, 4),
      $("barracks-tree", "tree", -27, 26, 4, 4, {
        height: 9,
        tint: "amber"
      })
    ]
  }
}), Or = xt({
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
      $("west-parapet", "wall", -35, 0, 2, 84, { height: 3 }),
      $("east-parapet", "wall", 35, 0, 2, 84, { height: 3 }),
      $("north-wall", "wall", 0, -41, 72, 2, { height: 9 }),
      $("south-wall", "wall", 0, 41, 72, 2, { height: 5 }),
      $("signal-brazier", "beacon", 0, -8, 6, 6),
      $("west-signal-column", "column", -20, -10, 4, 4, { height: 11 }),
      $("east-signal-column", "column", 20, -10, 4, 4, { height: 11 }),
      $("west-approach-column", "column", -20, 12, 4, 4, { height: 8 }),
      $("east-approach-column", "column", 20, 12, 4, 4, { height: 8 }),
      $("hall-tower-west", "tower", -10, -30, 8, 8, { height: 16 }),
      $("hall-tower-east", "tower", 10, -30, 8, 8, { height: 16 }),
      $("hall-arch", "arch", 0, -30, 12, 4, { height: 12 }),
      $("signal-fuel", "fuel", -27, 19, 8, 22),
      $("signal-reserve", "cargo", 27, 19, 8, 22),
      $("west-copper-store", "supplies", -26, -23, 6, 6),
      $("east-copper-store", "supplies", 26, -23, 6, 6)
    ]
  }
}), Zr = xt({
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
      $("west-wall", "wall", -31, 0, 2, 88, { height: 7 }),
      $("east-wall", "wall", 31, 0, 2, 88, { height: 7 }),
      $("north-wall", "wall", 0, -43, 64, 2, { height: 8 }),
      $("south-wall", "wall", 0, 43, 64, 2, { height: 8 }),
      $("upper-channel-west", "water", -24, -3, 12, 58),
      $("upper-channel-east", "water", 23, -12, 14, 48),
      $("lower-channel-west", "water", -13, 32, 30, 20),
      $("lower-channel-east", "water", 28, 32, 4, 20),
      $("sluice-west-abutment", "wall", -18, 16, 24, 4, { height: 5 }),
      $("sluice-east-abutment", "wall", 18, 16, 24, 4, { height: 5 }),
      $("upper-pier-west", "column", -15, -18, 4, 4, { height: 9 }),
      $("upper-pier-east", "column", 11, -18, 4, 4, { height: 9 }),
      $("lower-pier-west", "column", -13, 0, 4, 4, { height: 9 }),
      $("lower-pier-east", "column", 13, 0, 4, 4, { height: 9 }),
      $("vault-north", "arch", -2, -18, 26, 2, { height: 10 }),
      $("vault-middle", "arch", 0, 0, 26, 2, { height: 10 }),
      $("entry-marker", "ruin", -24, -39, 6, 2, { height: 5 }),
      $("maintenance-supplies", "supplies", 8, 36, 4, 4)
    ]
  }
}), Ur = xt({
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
      $("west-wall", "wall", -31, 0, 2, 76, { height: 6 }),
      $("east-wall", "wall", 31, 0, 2, 76, { height: 6 }),
      $("north-wall", "wall", 0, -37, 64, 2, { height: 8 }),
      $("south-wall", "wall", 0, 37, 64, 2, { height: 6 }),
      $("cells-divider", "wall", 0, -24, 2, 28, { height: 6 }),
      $("cells-front-center", "wall", 0, -10, 20, 2, { height: 6 }),
      $("cells-front-west", "wall", -26, -10, 12, 2, { height: 6 }),
      $("cells-front-east", "wall", 26, -10, 12, 2, { height: 6 }),
      $("postern-divider", "wall", -7, 24, 50, 2, { height: 5 }),
      $("waterway-passage", "arch", -21, 19, 10, 2, { height: 7 }),
      $("postern-corridor", "wall", 17, 31, 2, 12, { height: 5 }),
      $("west-bunk", "bunk", -26, -24, 4, 8),
      $("east-bunk", "bunk", 26, -24, 4, 8),
      $("west-cell-bench", "bench", -8, -30, 2, 4),
      $("east-cell-bench", "bench", 8, -30, 2, 4),
      $("guard-desk", "ledger", 3, 12, 4, 4),
      $("hall-pier-west", "column", -7, -4, 2, 2, { height: 7 }),
      $("hall-pier-east", "column", 7, -4, 2, 2, { height: 7 })
    ]
  }
}), Nr = xt({
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
      $("west-wall", "wall", -39, 0, 2, 92, { height: 11 }),
      $("east-wall", "wall", 39, 0, 2, 92, { height: 11 }),
      $("north-wall", "wall", 0, -45, 80, 2, { height: 13 }),
      $("south-wall", "wall", 0, 45, 80, 2, { height: 8 }),
      $("western-front-column", "column", -15, 17, 4, 4, { height: 12 }),
      $("eastern-front-column", "column", 15, 17, 4, 4, { height: 12 }),
      $("western-middle-column", "column", -15, -3, 4, 4, { height: 12 }),
      $("eastern-middle-column", "column", 15, -3, 4, 4, { height: 12 }),
      $("western-rear-column", "column", -15, -25, 4, 4, { height: 12 }),
      $("eastern-rear-column", "column", 15, -25, 4, 4, { height: 12 }),
      $("entry-vault", "arch", 0, 17, 30, 2, { height: 14 }),
      $("rear-vault", "arch", 0, -25, 30, 2, { height: 14 }),
      $("west-gallery", "planter", -32, 4, 6, 28),
      $("east-gallery", "planter", 32, 4, 6, 28),
      $("west-gallery-bench", "bench", -28, 28, 2, 6),
      $("east-gallery-bench", "bench", 28, 28, 2, 6),
      $("crown-console", "ledger", 0, -41, 6, 4),
      $("northern-west-pillar", "column", -29, -35, 4, 4, { height: 14 }),
      $("northern-east-pillar", "column", 29, -35, 4, 4, { height: 14 })
    ]
  }
}), Dr = xt({
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
      $("west-enclosure", "wall", -39, 0, 2, 84, { height: 3 }),
      $("east-enclosure", "wall", 39, 0, 2, 84, { height: 3 }),
      $("north-enclosure", "wall", 0, -41, 80, 2, { height: 4 }),
      $("south-enclosure", "wall", 0, 41, 80, 2, { height: 3 }),
      $("dead-heartwood", "root", 0, -29, 12, 10, { height: 17 }),
      $("western-root", "root", -22, -15, 8, 4, { height: 3.8 }),
      $("eastern-root", "root", 22, -11, 8, 4, { height: 3.2 }),
      $("west-reflecting-pool", "water", -26, 9, 12, 16),
      $("east-reflecting-pool", "water", 26, 9, 12, 16),
      $("west-old-colonnade", "ruin", -15, 7, 4, 4, { height: 5 }),
      $("east-old-colonnade", "ruin", 15, 9, 4, 4, { height: 4 }),
      $("western-growth", "thicket", -29, -27, 14, 12),
      $("eastern-growth", "thicket", 29, -27, 14, 12),
      $("west-entry-pillar", "column", -7, 30, 4, 4, { height: 7 }),
      $("east-entry-pillar", "column", 7, 30, 4, 4, { height: 7 }),
      $("garden-arch", "arch", 0, 30, 14, 2, { height: 9 }),
      $("west-entry-tree", "tree", -21, 29, 6, 6, {
        height: 12,
        tint: "rose"
      }),
      $("east-entry-tree", "tree", 23, 29, 6, 6, {
        height: 12,
        tint: "sage"
      }),
      $("west-north-tree", "tree", -18, -33, 6, 6, {
        height: 14,
        tint: "sage"
      }),
      $("east-north-tree", "tree", 18, -33, 6, 6, {
        height: 14,
        tint: "rose"
      })
    ]
  }
}), Fr = Object.fromEntries(Object.entries(Yt).map(([e, t]) => {
  const { width: s, depth: a } = t, n = s / 2, r = a / 2, i = [$("west-wall", "wall", -n + 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  }), $("east-wall", "wall", n - 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const o of ["north", "south"]) {
    const l = (o === "north" ? -1 : 1) * (r - 0.5);
    if (t.doors.some((u) => u.side === o)) {
      i.push($(`${o}-door`, "door", 0, l, 4, 1));
      for (const u of [-1, 1]) i.push($(`${o}-${u}`, "wall", u * (n + 2) / 2, l, n - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else i.push($(`${o}-wall`, "wall", 0, l, s, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const c = e === "guest_room" ? t.furniture.find((o) => o.kind === "bed").footprint : null;
  return [e, xt({
    id: e,
    safe: !0,
    anchors: {
      settle: {
        x: 0,
        y: 1
      },
      ...c ? { rest: {
        x: c.x + c.width / 2 + 1,
        y: c.z
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
    objects: c ? [{
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
  camp: Lr,
  crossroads: Tr,
  gate: jr,
  beacon: Or,
  waterway: Zr,
  cells: Ur,
  hall: Nr,
  roots: Dr,
  ...Fr
};
function Dn(e) {
  return !e || Me[e.location.scene].safe && e.phase === "exploration";
}
var ot = {
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
function Qa(e, t) {
  const s = ot[t];
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
}, E = (e, t) => e.relics.find((s) => s.id === t)?.rank ?? 0;
function Br(e) {
  return ks.filter((t) => !ca[t].weapons || ca[t].weapons.includes(e));
}
function Cs(e, t, s = null) {
  const a = ca[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((r) => r !== s && E(e, r) > 0)));
}
var Rt = Math.PI * 2, W = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), be = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), wn = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Xe = (e, t, s) => ({
  x: e.x + Math.cos(t) * s,
  y: e.y + Math.sin(t) * s
});
function et(e, t, s, a, n, r) {
  if (r) {
    yn(r.space, t, {
      x: Math.cos(s) * a,
      y: Math.sin(s) * a
    }, n);
    return;
  }
  t.x += Math.cos(s) * a, t.y += Math.sin(s) * a;
  for (const i of e.obstacles) {
    const c = W(t, i), o = n + i.radius;
    if (c < o) {
      const l = c < 1e-3 ? s : be(i, t);
      t.x = i.x + Math.cos(l) * o, t.y = i.y + Math.sin(l) * o;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function qr(e, t, s, a) {
  const n = e.x - t.x, r = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(s) + r * Math.sin(s)));
  return Math.hypot(n - Math.cos(s) * i, r - Math.sin(s) * i);
}
var Wr = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], Ka = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function da(e, t, s, a) {
  if (!wt(e, t, a) || !wt(e, s, a)) return null;
  if (Le(e, t, s, a)) return [{ ...s }];
  const { map: n, columns: r, rows: i } = e, c = jt(n, t), o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), d = [];
  function h(v) {
    return Vt(n, v % r, Math.floor(v / r));
  }
  function p(v, g, w, x) {
    if (v < 0 || v >= r || g < 0 || g >= i) return;
    const M = g * r + v;
    u.has(M) || (o.get(M) ?? 1 / 0) <= w || (o.set(M, w), l.set(M, x), d.push({
      id: M,
      score: w + Ka(h(M), s)
    }));
  }
  for (let v = -1; v <= 1; v++) for (let g = -1; g <= 1; g++) {
    const w = c.column + g, x = c.row + v, M = Vt(n, w, x);
    Le(e, t, M, a) && p(w, x, Ka(t, M), -1);
  }
  for (; d.length; ) {
    d.sort((w, x) => x.score - w.score || x.id - w.id);
    const { id: v } = d.pop();
    if (u.has(v)) continue;
    u.add(v);
    const g = h(v);
    if (Le(e, g, s, a)) {
      const w = [{ ...s }];
      let x = v;
      for (; x !== -1; )
        w.push(h(x)), x = l.get(x);
      w.reverse();
      const M = [];
      let S = t;
      for (let b = 0; b < w.length; ) {
        let y = b;
        for (; y + 1 < w.length && Le(e, S, w[y + 1], a); ) y++;
        S = w[y], M.push(S), b = y + 1;
      }
      return M;
    }
    for (const [w, x] of Wr) {
      const M = v % r + w, S = Math.floor(v / r) + x, b = Vt(n, M, S);
      Le(e, g, b, a) && p(M, S, o.get(v) + Ka(g, b), v);
    }
  }
  return null;
}
var Fn = (e) => !_e(e) || e === "warden" || e === "thornheart", re = (e, t, s, a = 0) => !e || Le(e.space, t, s, a);
function Hr(e, t, s) {
  return e.summonPoints.filter((a) => wt(e.space, a, s) && da(e.space, e.entry, a, s)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function zs(e, t, s) {
  return !e || Le(e.space, t, s, 0.3) ? s : {
    x: t.x,
    y: t.y
  };
}
function Ps(e, t, s, a) {
  if (!e) return Math.atan2(s.y - t.y, s.x - t.x);
  let n = s;
  if (!wt(e.space, n, a)) {
    const i = [], c = a + e.space.map.cellSize, o = jt(e.space.map, {
      x: s.x - c,
      y: s.y - c
    }), l = jt(e.space.map, {
      x: s.x + c,
      y: s.y + c
    });
    for (let d = Math.max(0, o.row); d <= Math.min(e.space.rows - 1, l.row); d++) for (let h = Math.max(0, o.column); h <= Math.min(e.space.columns - 1, l.column); h++) {
      const p = Vt(e.space.map, h, d);
      Math.hypot(p.x - s.x, p.y - s.y) <= a + e.space.map.cellSize && wt(e.space, p, a) && Le(e.space, p, s) && i.push(p);
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
function Ee(e, t, s, a) {
  if (!_e(t) && e.enemies.filter((i) => i.hp > 0).length >= K.maxEnemies) return null;
  if (a) {
    const i = Hr(a, s, ue[t].radius);
    if (!i) return null;
    s = i;
  }
  const n = ue[t].hp * (_e(t) ? 1 : 1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)), r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: n,
    maxHp: n,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Pa(e) * 20),
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
function bt(e, t, s, a, n, r = {}) {
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
function pe(e, t, s, a, n, r, i, c = !1, o = {}) {
  const l = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: s,
    radius: a,
    wait: n,
    life: r,
    damage: i,
    friendly: c,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: c ? "passive" : "attack",
    hits: [],
    ...o
  };
  return e.hazards.push(l), l;
}
function st(e, t, s, a, n) {
  return pe(e, t, "slam", s, a, 8, n);
}
function Ce(e, t, s, a, n, r, i) {
  return pe(e, t, "beam", 0, r, 9, i, !1, {
    angle: s,
    length: a,
    width: n
  });
}
function pt(e, t, s, a, n, r, i = 0.22) {
  for (let c = 0; c < a; c++) bt(e, t, s + (c / Math.max(1, a - 1) - 0.5) * n, r, !1, { speed: i });
}
function Bn(e, t, s, a, n, r = 0.16) {
  for (let i = 0; i < s; i++) bt(e, t, a + i * Rt / s, n, !1, { speed: r });
}
function an(e, t, s, a, n = 0) {
  const r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: t === "turret" ? 65 : t === "familiar" ? it.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(r), r;
}
var ba = (e) => e === "attack" || e === "skill";
function Is(e, t) {
  if (e.player.hp <= 0) return;
  const s = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += s, s > 0 && ye(e, e.player, "heal");
}
function yt(e, t, s) {
  if (_e(t.kind)) {
    if (t.stagger += s, t.stagger < 100) return;
    t.stagger = 0, s = 24;
  }
  t.stun = Math.max(t.stun, s), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), ye(e, t, "guard", 1.4);
}
function Ne(e, t, s, a, n, r = e.player, i) {
  if (t.hp <= 0 || !re(i, r, t)) return;
  const c = t.burn > 0 || ba(n) && E(a, "cinder") > 0, o = t.chill > 0 || ba(n) && E(a, "frost") > 0, l = (n === "skill" || n === "companion" && a.weapon === "cannon") && o && E(a, "shatter") > 0, u = ba(n) && c && o && E(a, "overload") > 0;
  let d = s * (E(a, "blood-price") ? Te.bloodDamage + (E(a, "blood-price") - 1) * 0.12 : 1);
  if (E(a, "execution") && t.hp / t.maxHp < Te.executeThreshold && (d *= Te.executeDamage + (E(a, "execution") - 1) * 0.1), t.exposed > 0 && (d *= 1.25), (t.kind === "guard" || i && t.kind === "warden") && n === "attack" && Math.cos(be(t, r) - t.angle) > 0.4 && t.exposed <= 0 && (d *= E(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !_e(t.kind) && e.enemies.some((h) => h.kind === "priest" && h.hp > 0 && W(t, h) < 3.5 && re(i, t, h)) && (d *= 0.7), n === "attack" && E(a, "backstab") && Math.cos(be(t, e.player) - t.angle) < -0.3 && (d *= 1.6 + E(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && E(a, "duelist") && yt(e, t, 9 * E(a, "duelist")), l) {
    d += 15 * E(a, "shatter"), t.chill = 0, ye(e, t, "burst", 2.2);
    for (const h of e.enemies) h.id !== t.id && W(t, h) < 2.2 && Ne(e, h, 9 * E(a, "shatter"), a, "passive", t, i);
  }
  if (ba(n) && (E(a, "cinder") && (t.burn = Math.max(t.burn, 80 + E(a, "cinder") * 25)), E(a, "frost") && (t.chill = Math.max(t.chill, 45 + E(a, "frost") * 20)), (E(a, "blood-dance") || E(a, "hemorrhage")) && (t.bleed = 100 + 25 * (E(a, "blood-dance") + E(a, "hemorrhage"))), E(a, "venom") && (t.poison = 100 + E(a, "venom") * 35), u && (d += 20 * E(a, "overload"), ye(e, t, "lightning")), n === "skill" && E(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + E(a, "hunter-mark") * 40)), E(a, "inferno") && c && n === "skill" && pe(e, t, "fire", 1.5 + E(a, "inferno") * 0.3, 0, 70, 4 * E(a, "inferno"), !0)), u && (t.burn = 0), (u || l) && (t.chill = 0), t.hp = Math.max(0, t.hp - d), t.marked = 5, n === "lightning" && E(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - E(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, ye(e, t, "burst", _e(t.kind) ? 3 : 0.8), E(a, "wildfire") && c && pe(e, t, "fire", 1.8 + E(a, "wildfire") * 0.2, 0, 90, 3 * E(a, "wildfire"), !0), E(a, "fracture") && o) for (let h = 0; h < 4 + E(a, "fracture"); h++) bt(e, t, h * Rt / (4 + E(a, "fracture")), 9, !0, { source: "passive" });
    if (E(a, "siphon") && (e.kills % Te.siphonEvery === 0 || _e(t.kind)) && Is(e, (_e(t.kind) ? Te.siphonBossHeal : Te.siphonHeal) + E(a, "siphon") - 1), E(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * E(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), E(a, "soul-harvest") && (e.player.resource = Math.min(it.maxPower, e.player.resource + 9 * E(a, "soul-harvest"))), n === "companion" && E(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * E(a, "salvage"))), E(a, "magnet"))
      for (const h of e.enemies) h.hp > 0 && W(t, h) < 3 + E(a, "magnet") && re(i, t, h) && et(e, h, be(h, t), 0.7, ue[h.kind].radius, i);
  }
}
function nn(e, t, s, a, n, r = e.player) {
  const i = [t];
  if (re(n, r, t)) {
    E(s, "conductor") && i.push(...e.enemies.filter((c) => c.id !== t.id && c.hp > 0 && W(c, t) < 4.5 && re(n, t, c)).sort((c, o) => W(c, t) - W(o, t)).slice(0, E(s, "conductor") + 1));
    for (const c of i)
      ye(e, c, "lightning"), Ne(e, c, a, s, "lightning", n ? c === t ? r : t : e.player, n);
  }
}
function Es(e, t, s) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), ye(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const r = E(t, "riposte"), i = E(t, "thorns");
  if (r || i)
    for (const c of e.enemies) W(c, a) < 3.2 + r * 0.3 && re(s, a, c) && (Ne(e, c, (n ? 20 : 8) * r + 9 * i, t, "passive", a, s), yt(e, c, n ? 20 : 7));
}
function Ia(e, t, s, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Es(e, s, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let r = t * Tt[s.weapon].guard * (E(s, "blood-price") ? Te.bloodHurt : 1) * (E(s, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, r);
  if (n.ward -= i, r -= i, n.hp <= r && E(s, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + E(s, "last-stand") * 8, n.invulnerable = 60, ye(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - r), e.damageTaken += r, n.invulnerable = 18, n.lastHit = e.tick, ye(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), E(s, "thorns"))
    for (const c of e.enemies) W(c, n) < 3 && Ne(e, c, 10 * E(s, "thorns"), s, "passive", n, a);
}
function oa(e, t, s = 45) {
  e.ward += Math.max(0, Math.min(t, s - e.ward));
}
function qn(e, t, s, a = !1, n) {
  const r = Tt[t.weapon], i = e.player, c = be(i, s), o = (a ? 0.6 : 1) * (E(t, "gambit") ? 1 + E(t, "gambit") * 0.12 : 1);
  if (i.facing = c, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const h = r.range + E(t, "piercing") * 0.25;
    ye(e, i, "slash", h, c);
    for (const p of e.enemies)
      W(i, p) > h + ue[p.kind].radius || Math.cos(be(i, p) - c) < -0.1 || !re(n, i, p) || (Ne(e, p, r.damage * o, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && yt(e, p, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), E(t, "cleave-wave") && i.combo % 3 === 2 && bt(e, i, c, 14 * E(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let l = r.damage * o;
  E(t, "distance-draw") && (l *= 1 + Math.min(1, W(i, s) / 8) * 0.15 * E(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(it.maxPower, i.resource + 12));
  const u = E(t, "piercing") * Te.extraPierce + E(t, "railgun") * 2, d = bt(e, i, c, l, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + E(t, "shrapnel") * 0.3 : 0,
    bounce: E(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && E(t, "split-arrow") && i.combo % 3 === 2) for (const h of [-0.18, 0.18]) bt(e, i, c + h, l * (0.35 + E(t, "split-arrow") * 0.1), !0, {
    speed: d.speed,
    pierce: u
  });
}
function Vr(e, t, s, a) {
  const n = e.player, r = Tt[t.weapon], i = E(t, "focus");
  switch (n.skill = Math.round(r.skillCooldown * (i ? Te.focusSkill - (i - 1) * 0.06 : 1)), E(t, "aegis") && (n.shield = 18 + E(t, "aegis") * 6, n.guard = 8, oa(n, E(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + E(t, "aegis") * 6, n.guard = 9;
      const c = 1 + n.resource / 100;
      n.resource = 0, ye(e, n, "slash", 3.6, n.facing);
      for (const o of e.enemies)
        o.hp <= 0 || W(n, o) > 3.6 + ue[o.kind].radius || !re(a, n, o) || (E(t, "shield-break") && (o.exposed = Math.max(o.exposed, 70 + 30 * E(t, "shield-break"))), Ne(e, o, r.skill * c, t, "skill", n, a), yt(e, o, 40), _e(o.kind) || et(e, o, be(n, o), 1.5, ue[o.kind].radius, a));
      E(t, "valor") && oa(n, 12 * E(t, "valor") * c);
      break;
    }
    case "bow":
      for (let c = -2; c <= 2; c++) bt(e, n, n.facing + c * 0.15, r.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      et(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const c = s ?? n, o = 1 + n.resource / 125;
      if (n.resource = 0, E(t, "convergence"))
        for (const l of e.enemies) W(l, c) < 4 + E(t, "convergence") && re(a, c, l) && et(e, l, be(l, c), 1.2, ue[l.kind].radius, a);
      for (let l = 0; l < 3; l++) {
        const u = Xe(c, l * Rt / 3, 0.7);
        pe(e, re(a, c, u) ? u : c, "slam", 2.3, 10 + l * 10, 1, r.skill * o, !0, { source: "skill" });
      }
      if (E(t, "nova")) {
        pe(e, n, "frost", 3 + E(t, "nova") * 0.5, 0, 32, 6 * E(t, "nova"), !0, { source: "skill" });
        for (const l of e.enemies) W(n, l) < 3.5 && re(a, n, l) && (l.chill = 120, yt(e, l, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), s) {
        const c = Xe(s, s.angle + Math.PI, ue[s.kind].radius + 0.55);
        et(e, n, be(n, c), Math.min(5, W(n, c)), K.playerRadius, a), n.facing = be(n, s), re(a, n, s) && (!a || W(n, s) <= r.range + ue[s.kind].radius) && (s.exposed = Math.max(s.exposed, 60), Ne(e, s, r.skill, t, "skill", n, a), yt(e, s, 20)), ye(e, n, "slash", 2, n.facing);
      }
      E(t, "shadowstep") && an(e, "shade", n, 95 + E(t, "shadowstep") * 30, E(t, "shadowstep"));
      break;
    case "grimoire": {
      const c = n.resource;
      n.resource = 0, n.resonance = it.resonanceTicks + c, ye(e, n, "resonance", 2);
      for (const o of e.companions) o.kind === "familiar" && o.hp > 0 && o.life > 0 && (o.hp = Math.max(o.hp, it.familiarHp), o.cooldown = 0);
      s && (s.exposed = Math.max(s.exposed, 100), Ne(e, s, r.skill + c * 0.3, t, "skill", n, a)), E(t, "command") && pe(e, s ?? n, "storm", 2.4 + E(t, "command") * 0.3, 10, 65, 7 * E(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const c = 1 + (E(t, "overclock") >= 2 ? 1 : 0), o = e.companions.filter((l) => l.kind === "turret");
      o.length >= c && (o[0].life = 0), an(e, "turret", zs(a, n, Xe(n, n.facing, 0.9)), 240 + E(t, "overclock") * 45, E(t, "overclock")), E(t, "bunker") && oa(n, 15 * E(t, "bunker"));
      break;
    }
  }
}
function Gr(e, t, s, a) {
  const n = e.player, r = E(s, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - r * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? wn(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, E(s, "storm-step") && pe(e, n, "storm", 1.7 + E(s, "storm-step") * 0.15, 0, 70, 6 + E(s, "storm-step") * 3, !0), E(s, "trapper") && pe(e, n, "frost", 1.8, 12, 110, 5 * E(s, "trapper"), !0), E(s, "minefield") && pe(e, n, "mine", 2 + E(s, "minefield") * 0.2, 12, 180, 25 * E(s, "minefield"), !0), E(s, "smoke")) {
    for (const i of e.enemies) W(i, n) < 3 + E(s, "smoke") * 0.4 && re(a, n, i) && (yt(e, i, 30 + E(s, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    ye(e, n, "guard", 3);
  }
}
function Yr(e, t, s, a) {
  const n = e.player;
  for (const l of [
    "attack",
    "dash",
    "skill",
    "invulnerable",
    "swing",
    "shield",
    "guard"
  ]) n[l] = Math.max(0, n[l] - 1);
  const r = e.enemies.filter((l) => l.hp > 0 && re(a, n, l)).sort((l, u) => W(n, l) - W(n, u))[0];
  t.dash && !n.dash && !n.dashTime && Gr(e, t, s, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    et(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && E(s, "momentum") && r && W(n, r) < 3 && nn(e, r, s, 10 + E(s, "momentum") * 5, a);
  else if (t.move) {
    n.facing = wn(t.move);
    const l = n.swing > 0;
    let u = K.speed * (l ? Tt[s.weapon].moveFire : 1);
    E(s, "quicksilver") && n.dash > K.dashCooldown / 2 && (u *= 1 + E(s, "quicksilver") * 0.1), e.hazards.some((d) => !d.friendly && d.kind === "frost" && !d.wait && W(d, n) < d.radius && re(a, d, n)) && (u *= 0.65), et(e, n, n.facing, u, K.playerRadius, a);
  }
  n.travel += W(i, n), E(s, "pilgrim") && n.travel >= 28 && (n.travel -= 28, oa(n, E(s, "pilgrim") * 6, 35)), E(s, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && oa(n, 2, E(s, "wardstone") * 10);
  const c = r && re(a, n, r) ? r : void 0;
  t.skill && !n.skill && (c && (n.facing = be(n, c)), Vr(e, s, c, a));
  const o = Tt[s.weapon].range + (s.weapon === "blade" || s.weapon === "daggers" ? E(s, "piercing") * 0.25 : 0);
  if (c && !n.attack && W(n, c) <= o + ue[c.kind].radius && (qn(e, s, c, !1, a), n.combo++, E(s, "echo") && n.combo % Math.max(2, Te.echoEvery + 1 - E(s, "echo")) === 0 && qn(e, s, c, !0, a), n.attack = Math.round(Tt[s.weapon].period * (E(s, "focus") ? Te.focusAttack : 1))), E(s, "orbit") && e.tick % Math.round(Te.orbitTicks / (1 + E(s, "orbit") * 0.25)) === 0 && r && W(n, r) < 4.5 && nn(e, r, s, 12 + E(s, "orbit") * 3, a), E(s, "orbitals") && e.tick % 35 === 0) {
    for (const l of e.enemies) W(n, l) < 2.5 + E(s, "orbitals") * 0.35 && re(a, n, l) && (Ne(e, l, 12 * E(s, "orbitals"), s, "passive", n, a), l.chill = Math.max(l.chill, 30));
    ye(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function Qr(e, t, s) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + E(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && an(e, "familiar", zs(s, e.player, Xe(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || re(s, a, i))).sort((i, c) => W(i, a) - W(c, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = be(a, n), a.kind !== "turret") {
      const i = W(a, e.player) > 8;
      if (i || W(a, n) > 1.3 || !re(s, a, n)) {
        const c = Ps(s, a, i ? e.player : n, 0.25);
        c !== null && et(e, a, c, i ? 0.19 : 0.14 + E(t, "frenzy") * 0.015, 0.25, s);
      }
    }
    const r = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && W(a, n) < r && re(s, a, n)) if (a.kind === "turret")
      bt(e, a, a.angle, Tt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      Ne(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? it.empoweredDamage : it.damage) * (1 + E(t, "covenant") * 0.15), t, "companion", a, s), ye(e, a, "slash", 1.2, a.angle);
      const c = a.kind === "shade" ? 32 : i ? it.empoweredAttackTicks : it.attackTicks;
      a.cooldown = Math.round(c / (1 + E(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && E(t, "martyr") && (Is(e, E(t, "martyr")), pe(e, a, "slam", 2.2, 0, 1, 15 * E(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
var kt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), Ra = [
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
function wa(e, t, s) {
  if (e.wave++, s) {
    for (const r of s.waves[e.wave - 1]) Ee(e, r.kind, r.position);
    return;
  }
  if (e.boss) {
    Ee(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = zr[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let r = 0; r < n; r++) {
    const i = Rt * r / n + (e.wave - 1) * 0.8;
    let c = a[(r + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && r < 2 && (c = a[0]), e.encounter === "pursuit" && r === 0 && (c = "stalker"), e.encounter === "siege" && r === 0 && (c = "guard"), Ee(e, c, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function Kr(e, t, s) {
  if (e.boss) return;
  const a = e.objective, n = e.enemies.some((r) => r.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && W(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && W(i, a) < 2.2) && a.progress++;
    const r = Math.min(2, Math.floor(a.progress / kt.ritualTicks));
    a.x = Ra[r].x, a.y = Ra[r].y, e.tick % kt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Ee(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Pa(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % kt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && wa(e, t), e.tick % 150 === 0 && pe(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % kt.pursuitInterval, e.wave < e.waves && a.progress === 0 && wa(e, t);
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
  e.tick > kt.warningAfter && e.tick % 180 === 0 && pe(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, wa(e, t, s)) : n && (e.nextWave = 0);
}
function Xr(e) {
  return e.enemies.some((t) => t.hp > 0) ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function Jr(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, Ra[0]), t.target = kt.ritualTicks * Ra.length), e.encounter === "survival" && (t.target = kt.survivalTicks), e.encounter === "pursuit" && (t.target = kt.pursuitInterval);
}
var Dt = (e, t) => {
  e.motion = t, e.motionAngle = be(e, e.target), e.stun = 18;
}, eo = {
  warden(e, t, s) {
    const a = t.pattern % 3, n = Ja.warden.damage;
    if (a === 0)
      Dt(t, 24), Ce(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let r = -1; r <= 1; r++) st(e, Xe(t, t.angle + r * 0.55, 3.5), 1.8, 12 + Math.abs(r) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      pt(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Ee(e, "guard", {
        x: -7,
        y: -7
      }, s);
  },
  thornheart(e, t, s) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) pe(e, Xe(t.target, n * Rt / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      pe(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Ee(e, "stalker", {
      x: n,
      y: -6
    }, s);
    else for (let n = 0; n < 3 + t.phase; n++) Ce(e, t, t.angle + n * Rt / (3 + t.phase), 15, 0.55, 25, 18);
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
    else if (s === 1) pt(e, t, be(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (s === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Xe({
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
      Ee(e, "wisp", {
        x: -7,
        y: 5
      }), Ee(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const s = t.pattern % 3, a = t.pattern * 0.53;
    if (s === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && Ce(e, t, a + n * Rt / 7, 18, 0.6, 32, 23);
    else if (s === 1) for (let n = 0; n < 6; n++) {
      const r = Xe({
        x: 0,
        y: 0
      }, n * Rt / 6, 9);
      pt(e, r, be(r, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      st(e, t.target, 2, 18, 24), pe(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      Dt(t, 18), Ce(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (s === 1) for (let a = 0; a < 2 + t.phase; a++) st(e, Xe(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else s === 2 ? (Ce(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Ce(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (pt(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Ee(e, "stalker", {
      x: -8,
      y: 3
    }), Ee(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const s = t.pattern % 4;
    if (s === 0) {
      Dt(t, 28);
      for (let a = 0; a < 6; a++) pe(e, Xe(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (s === 1) Bn(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (s === 2)
      t.x = 0, t.y = 0, pe(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Ee(e, "bomber", a);
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
    else s === 2 ? (st(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Ee(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Ee(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const s = t.pattern % 3;
    if (s === 0) for (let a = 0; a < 3; a++) pe(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (s === 1)
      Dt(t, 30), Ce(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) st(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const s = t.pattern % 4;
    if (s === 0) for (let a = 0; a < 4; a++) pe(e, Xe(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else s === 1 ? pt(e, t, t.angle, 9, 2.2, 14, 0.21) : s === 2 ? (t.x = -t.x, t.y = -t.y, Ce(e, t, be(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Ee(e, "stalker", {
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
      }, Dt(t, 40), Ce(e, t, 0, 19, 1.4, 14, 25);
    else if (s === 1) for (let a = 0; a < 4; a++) Ce(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else s === 2 ? (st(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), pt(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), st(e, t.target, 2.3, 24, 21);
    else if (s === 1) for (let a = 0; a < t.memory.length; a++) st(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (s === 2) {
      for (const a of t.memory) Ce(e, a, be(a, t.target), 18, 0.65, 32, 22);
      Ee(e, "wisp", {
        x: -7,
        y: -7
      }), Ee(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Bn(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), ye(e, t, "burst", 2), Ce(e, t, be(t, t.target), 20, 0.8, 24, 26);
    else if (s === 1)
      Dt(t, 20), pt(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (s === 2)
      st(e, t, 3, 12, 26), pe(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) Ce(e, a, be(a, t.target), 20, 0.6, 22, 23);
  }
};
function to(e, t, s, a) {
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const r = t.phase + 1;
    t.phase = r, ye(e, t, "burst", 4), n === "phoenix" && r === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), pe(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), s.oaths.includes("legion") && Ee(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  eo[n](e, t, a), t.pattern++;
}
function ao(e, t, s) {
  if (!_e(t.kind)) {
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && W(n, t) < 2.8 && re(s, t, n)).sort((n, r) => W(n, t) - W(r, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && W(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function no(e, t, s, a, n) {
  const r = ue[t.kind];
  W(t.target, e.player) < a && W(t, e.player) < r.reach + 1 && re(n, t, e.player) && Ia(e, r.damage, s, n);
  for (const i of e.companions) W(t.target, i) < a && W(t, i) < r.reach + 1 && re(n, t, i) && (i.hp -= r.damage);
  !e.boss && e.encounter === "siege" && W(t.target, e.objective) < a && W(t, e.objective) < r.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - r.damage * 0.5)), ye(e, t.target, "slash", a, t.angle);
}
function so(e, t, s, a) {
  const n = ue[t.kind];
  if (_e(t.kind)) {
    to(e, t, s, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      pt(e, t, t.angle, e.chapter > 0 ? 3 : 2, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const r of e.enemies) r.hp > 0 && !_e(r.kind) && W(r, t) < 3.5 && re(a, t, r) && (r.hp = Math.min(r.maxHp, r.hp + 8));
      pt(e, t, t.angle, 3, 0.7, n.damage, 0.18), ye(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      pe(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      bt(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      st(e, t.target, 1.7, 8, n.damage);
      break;
    default:
      no(e, t, s, n.reach + 0.15, a);
  }
}
function ro(e, t, s, a) {
  const n = ue[t.kind], r = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (et(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    W(t, e.player) < n.radius + 0.4 && re(a, t, e.player) && Ia(e, n.damage, s, a);
    for (const c of e.companions) W(t, c) < n.radius + 0.3 && re(a, t, c) && (c.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && W(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), W(r, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, ye(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function oo(e, t, s, a) {
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
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && Ne(e, n, 2 + (d === "burn" ? E(t, "cinder") + E(t, "inferno") : d === "bleed" ? E(t, "hemorrhage") + E(t, "blood-dance") : E(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      ro(e, n, t, a);
      continue;
    }
    const r = ue[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (so(e, n, t, a), n.cooldown = Math.round(r.cooldown * (i ? 0.8 : 1) / (_e(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1)));
      continue;
    }
    const c = ao(e, n, a), o = W(n, c), l = re(a, n, c);
    if (n.cooldown = Math.max(0, n.cooldown - 1), n.angle = be(n, c), !n.cooldown && o < r.reach && l) {
      if (n.target = {
        x: c.x,
        y: c.y
      }, n.windup = Math.round(r.windup * (i ? 0.8 : 1)), c === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : o / 0.24, h = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(s.x, s.y))), p = {
          x: c.x + s.x * h,
          y: c.y + s.y * h
        };
        a ? re(a, n, p) && re(a, c, p) && (n.target = p) : (n.target.x = Math.max(-10, Math.min(10, p.x)), n.target.y = Math.max(-10, Math.min(10, p.y))), n.angle = be(n, n.target);
      }
      continue;
    }
    const u = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (o > (u ? 5 : _e(n.kind) ? 2.8 : 0.95) || u && o < 3 || !l) {
      const d = n.kind === "stalker" && o > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, h = Ps(a, n, c, r.radius);
      h !== null && et(e, n, h + (u && o < 3 && l ? Math.PI : a ? 0 : d), r.speed * (n.chill ? _e(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), r.radius, a);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && W(n, d) < r.radius + ue[d.kind].radius && et(e, n, be(d, n), 0.027, r.radius, a);
  }
}
function ya(e, t, s) {
  if (e.kind === "beam") return qr(t, e, e.angle, e.length) < e.width + s;
  const a = W(e, t);
  return a < e.radius + s && (e.kind !== "ring" || a > e.inner - s);
}
function io(e, t, s) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, s ? !re(s, n, a, a.radius) : Math.abs(a.x) > K.arena || Math.abs(a.y) > K.arena || e.obstacles.some((r) => W(r, a) < r.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (W(a, e.player) < K.playerRadius + a.radius && re(s, a, e.player)) e.player.shield > 0 ? (Es(e, t, s), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (Ia(e, a.damage, t, s), a.life = 0);
      else {
        const r = e.companions.find((i) => i.hp > 0 && W(a, i) < 0.3 + a.radius && re(s, a, i));
        r && (r.hp -= a.damage * (1 - E(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const r of e.enemies) {
      if (r.hp <= 0 || a.hits.includes(r.id) || W(r, a) > ue[r.kind].radius + a.radius || !re(s, a, r)) continue;
      a.hits.push(r.id);
      const i = a.damage * (E(t, "hunter") && W(r, e.player) > Te.hunterRange ? Te.hunterDamage + (E(t, "hunter") - 1) * 0.15 : 1);
      if (Ne(e, r, i, t, a.source, a, s), E(t, "pinning") && a.source === "attack" && (r.chill = 50 + E(t, "pinning") * 20, e.player.combo % 3 === 0 && yt(e, r, 8 * E(t, "pinning"))), a.splash > 0) {
        ye(e, r, "burst", a.splash);
        for (const c of e.enemies) c.id !== r.id && W(c, r) < a.splash + ue[c.kind].radius && Ne(e, c, i * 0.55, t, a.source, r, s);
      }
      if (a.bounce > 0) {
        const c = e.enemies.filter((o) => o.hp > 0 && !a.hits.includes(o.id) && W(o, r) < 6 && re(s, a, o, a.radius)).sort((o, l) => W(r, o) - W(r, l))[0];
        if (c) {
          a.bounce--, a.angle = be(a, c), a.damage *= 0.8;
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
function lo(e, t, s) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      ya(a, e.player, K.playerRadius) && re(s, a, e.player) && Ia(e, a.damage, t, s), !e.boss && e.encounter === "siege" && e.tick % 15 === 0 && ya(a, e.objective, 0.6) && re(s, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35));
      const r = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if (r || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!r || !a.hits.includes(i.id)) && ya(a, i, 0.3) && re(s, a, i) && (i.hp -= a.damage * 0.25, r && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((r) => r.hp > 0 && ya(a, r, ue[r.kind].radius) && re(s, a, r));
    a.kind === "mine" && n.length && (a.life = 0, ye(e, a, "burst", a.radius));
    for (const r of n) a.kind === "storm" ? nn(e, r, t, a.damage, s, a) : (a.kind === "fire" && (r.burn = Math.max(r.burn, 45)), a.kind === "frost" && (r.chill = Math.max(r.chill, 60)), a.kind === "mine" && yt(e, r, 25), Ne(e, r, a.damage, t, a.source, a, s));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function co(e, t, s) {
  io(e, t, s), lo(e, t, s);
}
function uo(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function ho(e, t, s) {
  const { seed: a, zone: n, chapter: r, elite: i, boss: c, bossKind: o, encounter: l, hp: u } = e, d = {
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
    obstacles: c ? o === "warden" || o === "colossus" ? [{
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
    waves: c ? 1 : i ? 3 : 2,
    nextWave: 0,
    kills: 0,
    damageTaken: 0,
    status: "fighting",
    zone: n,
    chapter: r,
    elite: i,
    boss: c,
    bossKind: o,
    encounter: l,
    objective: {
      x: 0,
      y: 0,
      hp: 100,
      progress: 0,
      target: 0
    }
  };
  return s && ((c && !Fn(o) || s.waves.some((h) => h.some((p) => !Fn(p.kind)))) && Pe("encounter_unsupported"), (l !== "skirmish" || !s.waves.length || !wt(s.space, s.entry, K.playerRadius) || s.waves.some((h) => !h.length || h.some((p) => !wt(s.space, p.position, ue[p.kind].radius) || !da(s.space, s.entry, p.position, K.playerRadius)))) && Pe("map_invalid"), Object.assign(d.player, s.entry), Object.assign(d.objective, s.objective), d.obstacles = [], d.waves = s.waves.length), Jr(d), wa(d, t, s), d;
}
function fo(e, t, s, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((r) => --r.life > 0).slice(-80);
  const n = Yr(e, t, s, a);
  Qr(e, s, a), oo(e, s, n, a), co(e, s, a), e.enemies = e.enemies.filter((r) => r.hp > 0), uo(e) ? e.status = "lost" : (Kr(e, s, a), Xr(e) && (e.status = "won", e.shots = [], e.hazards = []));
}
function po(e, t) {
  const s = e.at(-1);
  s && s.move === t.move && s.dash === t.dash && s.skill === t.skill ? s.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var mo = 2.4;
function $a(e, t) {
  return (!e?.all || e.all.every((s) => t.has(s))) && (!e?.none || e.none.every((s) => !t.has(s)));
}
var Wn = /* @__PURE__ */ new WeakMap();
function Ct(e, t) {
  const s = e.gates.filter((i) => $a(i.condition, t)).map((i) => i.id), a = s.join("/");
  let n = Wn.get(e);
  n || (n = /* @__PURE__ */ new Map(), Wn.set(e, n));
  let r = n.get(a);
  return r || (r = Rs(e.map, new Set(s)), n.set(a, r)), r;
}
function Ea(e, t) {
  const s = e.exits.filter((n) => $a(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => $a(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...s, ...a];
}
function vo(e, t, s) {
  const a = Ct(e, s);
  return Ea(e, s).filter((n) => W(t.position, n.position) <= 2.4 && Le(a, t.position, n.position)).sort((n, r) => W(t.position, n.position) - W(t.position, r.position) || n.target.id.localeCompare(r.target.id));
}
function go(e, t, s, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && Pe("input_invalid"), t && (e.facing = wn(t), yn(s, e.position, {
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
function As(e, t, s, a, n, r) {
  const i = Qt[e];
  if (!i || t.has(i.complete)) return null;
  const c = Me[e], o = i.waves.map((l) => l.map((u) => ({
    kind: u.kind,
    position: c.anchors[u.anchor]
  })));
  return e === "hall" && r && o[0].push({
    kind: "guard",
    position: c.anchors.reinforcementLeft
  }, {
    kind: "archer",
    position: c.anchors.reinforcementRight
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
      space: Ct(c, t),
      entry: s,
      objective: c.anchors.encounter,
      waves: o,
      summonPoints: i.summons.map((l) => c.anchors[l])
    }
  };
}
var Aa = {
  sanniang: "三娘",
  anian: "阿念",
  kouzi: "扣子",
  laobai: "老白"
}, dt = Object.keys(Aa), bo = {
  sanniang: "changyounian_intel",
  laobai: "bajin_intel",
  anian: null,
  kouzi: null
}, se = Object.freeze({
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
    ...Object.fromEntries(Object.entries(Yt).map(([e, t]) => [e, t.name]))
  },
  people: Aa,
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
}), La = {
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
}, Ta = {
  ...Object.fromEntries(Object.keys(Yt).map((e) => [e, {
    scene: e,
    anchor: "settle",
    name: se.scenes[e]
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
    name: se.scenes.crossroads
  },
  gate: {
    scene: "gate",
    anchor: "crossroads",
    name: se.scenes.gate
  },
  beacon: {
    scene: "beacon",
    anchor: "gate",
    name: se.scenes.beacon
  },
  waterway: {
    scene: "waterway",
    anchor: "crossroads",
    name: se.scenes.waterway
  },
  cells: {
    scene: "cells",
    anchor: "release",
    name: se.scenes.cells
  },
  hall: {
    scene: "hall",
    anchor: "cells",
    name: se.scenes.hall
  },
  roots: {
    scene: "roots",
    anchor: "crossroads",
    name: se.scenes.roots
  }
}, xn = {
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
}, Ls = Object.keys(xn);
function yo(e, t, s) {
  return ra(s.scene) !== "camp" ? [] : Ls.filter((a) => {
    const n = xn[a], r = La[t].station, i = Me[r.scene].anchors[r.anchor], c = s.scene === "clinic_front" || s.scene === r.scene && Math.hypot(s.position.x - i.x, s.position.y - i.y) <= 2.4;
    return n.atClinic && !c ? !1 : n.people.includes(t) && !e.includes(n.fact) && n.requires.every((o) => e.includes(o));
  });
}
var Ot = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Hn = /* @__PURE__ */ new WeakMap();
function sn(e, t, s) {
  if (Le(e, t, s, K.playerRadius)) return s;
  const a = jt(e.map, t), n = jt(e.map, s), r = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Hn.get(e);
  i || (i = /* @__PURE__ */ new Map(), Hn.set(e, i));
  const c = Vt(e.map, a.column, a.row);
  if (!i.has(r)) {
    const l = da(e, c, Vt(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(r, l?.find((u) => Ot(u, c) > 0.01) ?? null);
  }
  const o = i.get(r);
  return o ? Le(e, t, o, K.playerRadius) ? o : c : null;
}
function xa(e, t) {
  const s = Qt[e];
  return !s || t.has(s.complete);
}
function rn(e, t, s, a) {
  const n = [{
    ...e,
    route: []
  }], r = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), c = Me[i.scene], o = Ct(c, s);
    if (i.scene === t.scene && sn(o, i.position, c.anchors[t.anchor])) return i.route;
    for (const l of Me[i.scene].exits) {
      const u = `${l.to}/${l.arrival}`;
      r.has(u) || !$a(l.condition, s) || a && !xa(l.to, s) || !sn(o, i.position, c.anchors[l.anchor]) || (r.add(u), n.push({
        scene: l.to,
        position: Me[l.to].anchors[l.arrival],
        route: [...i.route, l]
      }));
    }
  }
  return null;
}
function Ts(e, t) {
  const s = new Set(e.facts), a = e.people[t];
  return Object.entries(Ta).map(([n, r]) => ({
    id: n,
    name: r.name,
    ...Sa(r.scene) ? { use: Sa(r.scene).use } : {},
    personHere: a.scene === r.scene && (n === r.scene || Ot(a.position, Me[r.scene].anchors[r.anchor]) <= 2.4),
    playerHere: e.location.scene === r.scene && (n === r.scene || Ot(e.location.position, Me[r.scene].anchors[r.anchor]) <= 2.4),
    accessible: rn(a, r, s, !1) !== null,
    safe: xa(r.scene, s),
    solo: xa(a.scene, s) && xa(r.scene, s) && rn(a, r, s, !0) !== null
  }));
}
function wo(e, t) {
  return !La[t].captive || e.facts.includes("captives_arrived");
}
var js = (e) => mo * (0.7 + dt.indexOf(e) / dt.length * 0.2);
function xo(e) {
  return dt.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && Ot(e.people[t].position, e.location.position) >= js(t));
}
function Os(e, t) {
  return dt.filter((s) => t[s].scene === e).map((s) => ({
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
function Zs(e) {
  return [...Ea(Me[e.location.scene], new Set(e.facts)), ...Os(e.location.scene, e.people)];
}
function Mn(e, t, s, a) {
  return Os(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const r = e.id === "cells" && La[n.target.person].captive && !s.has("captives_arrived"), i = Ct(e, r ? /* @__PURE__ */ new Set([...s, "captives_released"]) : s);
    return Ot(n.position, t) <= (r ? 5 : 2.4) && Le(i, t, n.position);
  });
}
function Mo(e) {
  const t = new Set(e.facts);
  for (const s of dt) {
    const a = e.people[s];
    if (a.mode === "idle") continue;
    const n = Me[a.scene], r = Ct(n, t);
    let i, c;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && we("invalid"), i = e.location.position, Ot(a.position, i) < js(s)) continue;
    } else {
      const p = Ta[a.destination], v = rn(a, p, t, !0);
      if (v || we("unavailable"), c = v[0], i = n.anchors[c?.anchor ?? p.anchor], Ot(a.position, i) < 0.2) {
        c ? (a.scene = c.to, a.position = { ...Me[c.to].anchors[c.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const o = sn(r, a.position, i);
    o || we("unavailable");
    const l = o.x - a.position.x, u = o.y - a.position.y, d = Math.hypot(l, u), h = Math.min(d, K.speed * 1.8);
    d && (a.facing = Math.atan2(u, l), yn(r, a.position, {
      x: l / d * h,
      y: u / d * h
    }, K.playerRadius));
  }
}
var Fe = {
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
}, ja = Object.keys(Fe), Us = [...dt, ...ja];
function De(e) {
  return Object.hasOwn(Aa, e);
}
function qe(e) {
  return De(e) ? Aa[e] : Fe[e].name;
}
function Ca(e, t) {
  const s = Fe[e];
  return Me[s.scene].anchors[t.has(s.complete) ? s.clearedAnchor : s.anchor];
}
function Oa(e, t, s) {
  return ja.filter((a) => Fe[a].scene === e).flatMap((a) => {
    const n = Ca(a, s), r = Fe[a];
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
function on(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && we("invalid"), e;
}
function Vn(e, t = 0, s = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > s) && we("invalid"), e;
}
function gt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && we("invalid"), e;
}
function Gn(e, t, s) {
  return (!Array.isArray(e) || e.length > t) && we("invalid"), e.map(s);
}
function _o(e) {
  return new Set(e).size !== e.length && we("invalid"), e;
}
function Yn(e) {
  typeof e != "boolean" && we("invalid");
}
function ko(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && we("identity"), e;
}
var ua = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), So = Object.keys(ua), Ns = ["male", "female"];
function Ro(e) {
  const t = on(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && we("invalid"), {
    name: t.name.trim(),
    gender: gt(t.gender, Ns),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: gt(t.appearanceAge, So) }
  };
}
var Lt = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), Ds = `${Lt.number} · ${Lt.title}`, $o = {
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
function Fs(e, t) {
  const s = $o[t], a = e.facts.includes("captives_arrived") && s.returned ? s.returned : s.initial;
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
function ln(e) {
  const t = e.lastReply;
  if (!t) return null;
  const s = e.conversations[t.person].at(-1);
  return s?.id === t.turnId ? {
    person: t.person,
    turn: s
  } : null;
}
function _n(e) {
  const t = ln(e);
  return t?.turn.action === "finish" && !e.facts.includes("chapter_completed") ? t.person : null;
}
var ia = Object.freeze({
  encounterReach: 14,
  alarmTicks: 900,
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function cn(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((s) => s.id === t))
  };
}
function Co(e, t) {
  if (e.phase !== "exploration" || !Me[e.location.scene].safe) return "unavailable";
  if (t.length > K.relicSlots) return "capacity";
  if (new Set(t).size !== t.length || t.some((a) => !e.collection.some((n) => n.id === a))) return "invalid";
  const s = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((a) => t.includes(a.id))
  };
  return t.some((a) => !Cs(s, a)) ? "dependency" : null;
}
function Bs(e, t, s) {
  e.facts.includes(t) || e.facts.push(t);
  const a = s ?? [...dt.filter((n) => e.people[n].scene === e.location.scene), ...ja.filter((n) => Fe[n].scene === e.location.scene)];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function zo(e) {
  const t = e.checkpoint;
  return As(e.location.scene, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"))?.field;
}
function Po(e) {
  const t = Qt[e.location.scene];
  Bs(e, t.complete);
  const s = cn(e);
  t.boss && (e.hp = Math.min(K.maxHp, e.hp + 20 + E(s, "renewal") * Te.renewalZoneHeal)), e.offers = Ir(e, Br(e.weapon).flatMap((a) => {
    const n = e.collection.find((r) => r.id === a)?.rank ?? 0;
    return n < K.maxRelicRank && Cs(s, a) && (ca[a].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: a,
      rank: n + 1
    }] : [];
  }), 3), e.phase = e.offers.length ? "reward" : "exploration", e.battle = null, e.checkpoint = null;
}
function Qn(e, t) {
  if (!(e.pendingParley || _n(e))) {
    if (e.phase === "battle" && e.battle) {
      const s = zo(e);
      s || we("invalid"), fo(e.battle, t, cn(e), s);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, ["gate", "beacon"].includes(e.location.scene) && !e.facts.includes("alarm_silenced") && (e.alarmTicks++, e.alarmTicks >= ia.alarmTicks && Bs(e, "alarm_raised")), a.status === "won" ? Po(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const s = Me[e.location.scene], a = new Set(e.facts);
      go(e.location, t.move, Ct(s, a), ia.explorationSpeed);
      const n = Qt[s.id], r = s.anchors.encounter;
      if (n && !a.has(n.complete) && r && Math.hypot(e.location.position.x - r.x, e.location.position.y - r.y) <= (n.triggerRadius ?? ia.encounterReach)) {
        const i = As(s.id, a, e.location.position, Math.floor(Pa(e) * 4294967296), e.hp, a.has("alarm_raised") && !a.has("alarm_silenced"));
        e.battle = ho(i.setup, cn(e), i.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && Mo(e);
  }
}
var za = Object.freeze({
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
function kn(e) {
  return za.bands.filter((t) => e >= t).length - 1;
}
var Ft = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, Io = {
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
    gestures: Ft
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
    gestures: Ft
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
    gestures: Ft
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
    gestures: Ft
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
      ...Ft,
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
    gestures: Ft
  }
};
function Eo(e) {
  return Io[e];
}
var Sn = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, Ao = {
  sanniang: {
    outer: "深靛蓝短外搭，米白滚边；内搭米白高领盘扣长衫，束褐红布带",
    lower: "深蓝长裙，腰间收褶，裙摆细密包边",
    inner: "米白软绸软杯小围，细棉衬里，侧边小揿扣",
    underpants: "米白细棉短平角内裤，细绸滚边，侧腰布带系结",
    shoes: "深靛蓝圆口布鞋，千层布底，鞋口镶窄细边",
    socks: "素白细棉中筒袜，袜口双层收边"
  },
  laobai: {
    outer: "宽松灰蓝长外套，内搭本白布衫，围旧灰褐围巾",
    lower: "深灰直筒厚布长裤，腰系磨旧的棕皮带",
    inner: "本白软棉无袖汗衫，领口包边，布色略旧",
    underpants: "灰白棉布宽松平角内裤，短裤腿，布带腰头",
    shoes: "旧褐皮短靴，宽鞋楦，靴头磨浅",
    socks: "灰色厚棉中筒袜，袜底有补片"
  },
  kouzi: {
    outer: "灰蓝翻领短工装，肘部补强；内搭本白布衫，系赭黄围巾",
    lower: "深灰厚布工裤，膝部双层补片，腰系皮质工具带",
    inner: "灰白棉布宽肩带短背心，领口与下缘包边",
    underpants: "深灰软棉短平角内裤，裆部双层，腰头穿扁布带",
    shoes: "旧褐色系带工作靴，厚底，靴头加皮补强",
    socks: "深灰厚棉短袜，袜筒过踝，后跟有同色补线"
  },
  anian: {
    outer: "浅紫交领长袖衫，外罩灰紫无袖衣，束深紫布带",
    lower: "灰紫长裙，裙摆镶浅紫细边",
    inner: "浅杏细棉背心式小围，淡紫滚边，前襟贝壳小扣",
    underpants: "浅杏细棉短平角内裤，裤口窄包边，腰头穿松紧带",
    shoes: "灰紫一字带布鞋，脚背小搭扣，平底",
    socks: "浅灰棉线及膝袜，罗纹袜口"
  },
  bajin: {
    outer: "深蓝立领绗缝棉号衣，外覆铆钉胸甲，以皮肩带固定",
    lower: "深色厚布军裤，直筒裤腿，束皮腰带",
    inner: "本白棉布圆领汗衫，短袖，肩缝加固",
    underpants: "灰色棉布短平角内裤，宽裤口，抽带腰头",
    shoes: "黑褐皮军靴，靴面上油，厚底",
    socks: "深灰厚棉长袜，罗纹袜口"
  },
  changyounian: {
    outer: "深蓝呢制服外套，米白翻领、铜色扣饰；内搭深色立领衫，束暗红腰带",
    lower: "深蓝厚呢制服长裤，里面加穿灰白棉毛裤",
    inner: "本白细棉圆领长袖汗衫，袖口窄收",
    underpants: "本白细棉短平角内裤，腰侧小扣，裤口细密包边",
    shoes: "黑色皮短靴，低跟，靴面擦得匀亮",
    socks: "深灰羊毛混棉中筒袜，加厚袜底"
  }
}, ha = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function qs(e, t) {
  const s = { ...Ao[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(s, a.clothing);
  return s;
}
var Lo = (e) => gt(e, _s), Kn = (e) => gt(e, ks), Xn = (e) => gt(e, Ms);
function To(e) {
  const t = on(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: Lo(t.weapon),
        outfit: Xn(t.outfit),
        traveler: Ro(t.traveler),
        chapter: gt(t.chapter, [Lt.id])
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: Xn(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: ko(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: gt(t.id, Ls),
        person: gt(t.person, dt)
      };
    case "greet":
      return {
        type: "greet",
        person: gt(t.person, Us)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: _o(Gn(t.equipped, K.relicSlots, Kn))
      };
    case "input": {
      const s = Gn(t.spans, K.maxInputTicks, (a) => {
        const n = on(a);
        return Yn(n.dash), Yn(n.skill), {
          move: Vn(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Vn(n.ticks, 1, K.maxInputTicks)
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
        id: Kn(t.id)
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
function jo(e, t) {
  const s = Ht(null), a = q(!1), n = q(""), r = Ht(null), i = q(!1), c = q(!1), o = Ht(null), l = q(null), u = X(() => s.value?.replyFailure?.actionId === l.value ? null : s.value?.replyFailure ?? null), d = X(() => i.value || !!s.value?.conversation), h = q(!1), p = q(!1);
  let v = !1, g = null;
  const w = X(() => a.value || d.value || c.value || !!r.value || !s.value?.ready || s.value.writeState !== "ready" || s.value.pending), x = (C, U) => C.data.revision !== U.data.revision ? C.data.revision > U.data.revision : C.fileRevision >= U.fileRevision;
  function M(C) {
    if (v || s.value && !x(C, s.value)) return;
    const U = o.value;
    (s.value?.data.active?.id !== C.data.active?.id || U && C.data.active?.conversations[U.person].some((T) => T.id === U.actionId)) && (o.value = null), s.value = C;
  }
  const S = X(() => {
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
    if (v || a.value) return !1;
    a.value = !0, g = null, n.value = "";
    try {
      const H = await e.request(`game/expedition/${C}`, {
        chatIdentity: t,
        ...C === "rebuild" ? { actionId: Ga() } : {},
        ...U,
        ...T ? { person: T } : {}
      }, 35e3), Y = g;
      return M(Y && x(Y, H.result) ? Y : H.result), h.value = !1, p.value = !1, s.value?.writeState === "ready" && !s.value.pending && C !== "read" && (r.value = null), !0;
    } catch (H) {
      if (!v) {
        h.value = !0, g && M(g), n.value = St(H);
        const Y = H && typeof H == "object" && "code" in H ? String(H.code) : "";
        p.value = Y === "expedition_data_invalid", U && (Y.startsWith("expedition_save_") || Y.startsWith("host_request_")) && (r.value = U);
      }
      return !1;
    } finally {
      v || (a.value = !1);
    }
  }
  const y = e.subscribe((C) => {
    if (v) return;
    if (C.type === "game/expedition/error") {
      const T = C.payload;
      T.chatIdentity === t && (n.value = St(T), p.value = T.code === "expedition_data_invalid");
      return;
    }
    if (C.type !== "game/expedition/state") return;
    const U = C.payload;
    U.chatIdentity === t && (a.value ? g = U.state : M(U.state));
  });
  async function _() {
    const C = r.value;
    return !await b("confirm") || !s.value || s.value.writeState !== "ready" || s.value.pending ? !1 : C && s.value.data.revision === C.revision ? b("act", C) : (r.value = null, c.value = !1, !0);
  }
  async function P(C, U, T) {
    if (w.value || v) return !1;
    const H = Ga();
    o.value = {
      actionId: H,
      person: C,
      text: U,
      regenerating: !!T,
      status: "sending"
    }, i.value = !0, a.value = !0, n.value = "", g = null;
    try {
      const Y = await e.request(T ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: H,
        revision: s.value.data.revision,
        person: C,
        text: U,
        ...T ? { turnId: T } : {}
      }, 18e4), F = g;
      return M(F && x(F, Y.result) ? F : Y.result), !0;
    } catch (Y) {
      if (!v) {
        g && M(g);
        const F = Y && typeof Y == "object" && "code" in Y ? String(Y.code) : Y instanceof Error ? Y.message : "";
        if (F === "expedition_cancelled")
          return n.value = "", !1;
        c.value = F.startsWith("host_request_") || F.startsWith("expedition_save_"), n.value = c.value ? N.aiUnknown : s.value?.replyFailure?.actionId === H ? "" : St(Y);
      }
      return !1;
    } finally {
      i.value = !1, v || (a.value = !1, o.value?.actionId === H && (o.value = T ? null : {
        ...o.value,
        status: "failed"
      }));
    }
  }
  async function A() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (C) {
        v || (n.value = St(C));
      }
  }
  const j = X(() => h.value || !!r.value || c.value || !s.value || s.value.pending || s.value.writeState !== "ready");
  return {
    view: s,
    busy: a,
    error: n,
    blocked: w,
    failed: r,
    talking: d,
    uncertainTalk: c,
    talk: P,
    outgoing: S,
    cancelTalk: A,
    recoveryRequired: j,
    dataInvalid: p,
    conversationFailure: u,
    dismissConversationFailure() {
      l.value = s.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => b("rebuild"),
    retryMemory: (C) => w.value ? Promise.resolve(!1) : b("retry-memory", void 0, C),
    dismissError() {
      j.value || (n.value = "");
    },
    notice: X(() => n.value || (s.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(s.value.writeState) || s.value.pending && s.value.writeState === "ready") ? ne.saveError : "")),
    read: () => b("read"),
    recover: _,
    act: (C) => w.value ? Promise.resolve(!1) : b("act", {
      actionId: Ga(),
      revision: s.value.data.revision,
      command: To(C)
    }),
    dispose() {
      v = !0, y();
    }
  };
}
function Oo(e) {
  const t = Ht(null), s = Ht(!1);
  let a = [], n = 0, r = null, i = !1;
  function c() {
    const d = e.view.value?.data.active;
    if (t.value = d ? structuredClone(d) : null, t.value) for (const h of a) for (let p = 0; p < h.ticks; p++) Qn(t.value, h);
    s.value = a.length > 0;
  }
  const o = me(e.view, () => {
    !r && !a.length && c();
  }, { immediate: !0 });
  async function l() {
    if (r)
      return await r ? l() : !1;
    if (!a.length) return !e.blocked.value;
    if (e.blocked.value || i) return !1;
    const d = a;
    a = [], n = 0, r = e.act({
      type: "input",
      spans: d
    });
    const h = await r;
    return r = null, h ? c() : e.failed.value || (a = d.concat(a), n = a.reduce((p, v) => p + v.ticks, 0)), s.value = a.length > 0 || !h, h;
  }
  function u(d) {
    const h = t.value;
    !h || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(h.phase) || h.phase === "exploration" && !d.move && !xo(h) || (Qn(h, d), po(a, d), n++, s.value = !0, lr(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(h.phase)) && l());
  }
  return {
    current: t,
    dirty: s,
    input: u,
    flush: l,
    sync: c,
    async recover() {
      return await e.recover() ? (c(), l()) : !1;
    },
    dispose() {
      i = !0, o();
    }
  };
}
var fe = Object.freeze({
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
    clothing_rejected: ha.rejected,
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
  memoryRetry: "重试",
  memoryServiceFailed: "摘要服务调用失败，原文已保留。"
});
function Zo(e) {
  let t = null, s = null, a = null, n = !1, r = !1, i = null, c = -1, o = 0, l = 0, u = 0, d = 0, h = 0;
  function p(g, w, x, M = "sine", S = g * 0.8, b = 0) {
    if (!n || !t || !s || t.state !== "running") return;
    const y = t.createOscillator(), _ = t.createGain(), P = t.currentTime + b;
    y.type = M, y.frequency.setValueAtTime(g, P), y.frequency.exponentialRampToValueAtTime(Math.max(30, S), P + w), _.gain.setValueAtTime(1e-4, P), _.gain.exponentialRampToValueAtTime(x, P + 9e-3), _.gain.exponentialRampToValueAtTime(1e-4, P + w), y.connect(_).connect(s), y.start(P), y.stop(P + w), y.onended = () => {
      y.disconnect(), _.disconnect();
    };
  }
  function v(g, w, x, M) {
    if (!n || !t || !s || !a || t.state !== "running") return;
    const S = t.createBufferSource(), b = t.createBiquadFilter(), y = t.createGain(), _ = t.currentTime;
    S.buffer = a, b.type = "bandpass", b.Q.value = 0.65, b.frequency.setValueAtTime(x, _), b.frequency.exponentialRampToValueAtTime(M, _ + g), y.gain.setValueAtTime(1e-4, _), y.gain.exponentialRampToValueAtTime(w, _ + 8e-3), y.gain.exponentialRampToValueAtTime(1e-4, _ + g), S.connect(b).connect(y).connect(s), S.start(_), S.stop(_ + g), S.onended = () => {
      S.disconnect(), b.disconnect(), y.disconnect();
    };
  }
  return {
    async enable(g) {
      if (!r) {
        n = g;
        try {
          if (!g) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), s = t.createGain(), s.gain.value = 0.55, s.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const w = a.getChannelData(0);
            for (let x = 0; x < w.length; x++) w[x] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, r || e();
        }
      }
    },
    tick(g) {
      (!i || g.tick < c) && (c = -1, o = g.player.hp, l = g.kills, u = g.player.skill, d = g.serial, h = g.player.combo), i = g, c !== g.tick && (c = g.tick, g.player.hp < o && (v(0.16, 0.17, 800, 120), p(95, 0.2, 0.12, "triangle", 42)), g.kills > l && (p(659, 0.22, 0.045), p(988, 0.3, 0.025, "sine", 980, 0.035)), g.player.combo > h && v(0.095, 0.08, 2700, 500), g.player.dashTime === 7 && v(0.2, 0.09, 500, 2600), g.player.skill > u && (v(0.24, 0.12, 2200, 250), p(165, 0.35, 0.075, "triangle", 82), p(660, 0.36, 0.035, "sine", 440, 0.02)), g.effects.some((w) => w.id > d && w.kind === "lightning") && (v(0.12, 0.1, 4400, 1e3), p(1200, 0.08, 0.018, "sine", 210)), g.effects.some((w) => w.id > d && (w.kind === "block" || w.kind === "parry")) && (p(1350, 0.18, 0.07, "triangle", 740), p(2200, 0.11, 0.025, "sine", 1600)), g.effects.some((w) => w.id > d && w.kind === "ward-hit") && p(510, 0.16, 0.06, "sine", 250), g.effects.some((w) => w.id > d && w.kind === "ward-break") && (v(0.25, 0.1, 3600, 650), p(720, 0.3, 0.05, "sine", 120)), g.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((w, x) => p(w, 0.65, 0.04, "sine", w, x * 0.075)), g.status === "lost" && p(147, 0.7, 0.06, "triangle", 73), o = g.player.hp, l = g.kills, u = g.player.skill, d = g.serial, h = g.player.combo);
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
}, Jn = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], rt = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, Ue = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, Je = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, Za = [
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
], Uo = {
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
}, qh = Object.fromEntries(Object.entries(ca).map(([e, t]) => [e, Uo[t.family]]));
function No(e, t, s) {
  const a = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, r = !1, i = !1;
  const c = [
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
    if (!(!c.includes(h.code) || h.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(h.target.tagName)) && !(h.code === "Space" && h.target instanceof HTMLElement && h.target.closest("button"))) {
      if (h.preventDefault(), h.stopPropagation(), s(), h.code === "Escape") {
        h.repeat || t();
        return;
      }
      a.add(h.code), !h.repeat && h.code === "Space" && (r = !0), !h.repeat && h.code === "KeyE" && (i = !0);
    }
  }
  function l(h) {
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
  return e.addEventListener("keydown", o), window.addEventListener("keyup", l), window.addEventListener("blur", d), {
    frame() {
      const h = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), p = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), v = {
        move: Math.hypot(h, p) < 0.15 ? 0 : (Math.round((Math.atan2(p, h) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: r,
        skill: i
      };
      return r = !1, i = !1, v;
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
      u(), e.removeEventListener("keydown", o), window.removeEventListener("keyup", l), window.removeEventListener("blur", d);
    }
  };
}
function Do(e, t) {
  let s = null;
  function a(r) {
    if (!s || r.pointerId !== s.id) return;
    const i = s.surface.getBoundingClientRect(), c = i.width * 0.36, o = (r.clientX - i.left - i.width / 2) / c, l = (r.clientY - i.top - i.height / 2) / c, u = Math.max(1, Math.hypot(o, l));
    e(o / u, l / u);
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
function dn(e) {
  const t = new Zn();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const s = {
    box: new _r(1, 1, 1),
    sphere: new xr(1, 20, 14),
    rock: new On(1, 0),
    crown: new On(1, 1),
    cylinder: new wr(1, 1, 1, 24),
    cone: new kr(1, 1, 12),
    disc: new Mr(1, 48),
    ring: new Va(0.965, 1, 64),
    arc: new Va(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new jn(1, 0.08, 8, 40),
    stroke: new Va(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new jn(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new Un(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
  function i(h, p = !1, v = 1, g = !1) {
    const w = `${h}/${p}/${v}/${g}`;
    let x = n.get(w);
    return x || (x = p ? new br({
      color: h,
      transparent: v < 1,
      opacity: v,
      depthWrite: v === 1,
      side: 2
    }) : new gs({
      color: h,
      map: e?.get(h) ?? null,
      roughness: g ? 0.34 : 0.88,
      metalness: g ? 0.45 : 0.02,
      side: 2
    }), n.set(w, x)), x;
  }
  function c(h, p, v, g, w = [
    0,
    0,
    0
  ], x = !1, M = 1, S = !1) {
    let b = s[p];
    if (!x && p === "box" && e?.has(v)) {
      b = b.clone(), r.add(b);
      const _ = b.getAttribute("position"), P = b.getAttribute("normal"), A = b.getAttribute("uv");
      for (let j = 0; j < A.count; j++) {
        const C = Math.abs(P.getX(j)) > 0.5 ? _.getZ(j) * g[2] : _.getX(j) * g[0], U = Math.abs(P.getY(j)) > 0.5 ? _.getZ(j) * g[2] : _.getY(j) * g[1];
        A.setXY(j, C / 8, U / 8);
      }
    }
    const y = new vt(b, i(v, x, M, S));
    return y.scale.set(...g), y.position.set(...w), y.castShadow = !x, y.receiveShadow = !x, h.add(y), y;
  }
  function o(h, p = [
    0,
    0,
    0
  ]) {
    const v = new sa();
    return v.position.set(...p), h.add(v), v;
  }
  function l(h, p, v, g, w, x = 1, M = !1, S = 0.04) {
    const b = c(h, M ? "disc" : "ring", p, [
      v,
      v,
      1
    ], [
      g,
      S,
      w
    ], !0, x);
    return b.rotation.x = -Math.PI / 2, b;
  }
  function u(h, p, v, g = [
    0,
    0,
    0
  ], w = 0) {
    const x = e?.has(v) ?? !1, M = JSON.stringify([
      p,
      w,
      x
    ]);
    let S = a.get(M);
    if (!S) {
      const y = new Zn();
      if (p.forEach(([_, P], A) => A ? y.lineTo(_, P) : y.moveTo(_, P)), y.closePath(), S = w ? new Un(y, {
        depth: w,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: w * 0.3,
        bevelSize: w * 0.3,
        bevelSegments: 2
      }) : new gr(y), x) {
        const _ = S.getAttribute("uv");
        for (let P = 0; P < _.count; P++) _.setXY(P, _.getX(P) / 8, _.getY(P) / 8);
      }
      a.set(M, S);
    }
    const b = new vt(S, i(v));
    return b.position.set(...g), b.castShadow = !0, b.receiveShadow = !0, h.add(b), b;
  }
  function d(h) {
    h.updateMatrixWorld(!0);
    const p = h.matrixWorld.clone().invert(), v = new vs(), g = /* @__PURE__ */ new Map();
    h.traverse((x) => {
      if (!(x instanceof vt) || Array.isArray(x.material)) return;
      const M = (x.geometry.index ? x.geometry.toNonIndexed() : x.geometry.clone()).applyMatrix4(v.multiplyMatrices(p, x.matrixWorld)), S = `${x.material.uuid}/${x.castShadow}/${x.receiveShadow}`;
      let b = g.get(S);
      b || (b = {
        material: x.material,
        castShadow: x.castShadow,
        receiveShadow: x.receiveShadow,
        geometries: []
      }, g.set(S, b)), b.geometries.push(M);
    }), h.clear();
    const w = [];
    for (const { material: x, castShadow: M, receiveShadow: S, geometries: b } of g.values()) {
      const y = xs(b);
      if (b.forEach((P) => P.dispose()), !y) throw new Error("expedition_geometry_merge");
      const _ = new vt(y, x);
      _.castShadow = M, _.receiveShadow = S, h.add(_), w.push(y);
    }
    return () => {
      h.clear(), w.forEach((x) => x.dispose());
    };
  }
  return {
    mesh: c,
    group: o,
    ring: l,
    shape: u,
    material: i,
    bake: d,
    geometries: s,
    dispose() {
      Object.values(s).forEach((h) => h.dispose()), a.forEach((h) => h.dispose()), r.forEach((h) => h.dispose()), n.forEach((h) => h.dispose());
    }
  };
}
function Fo(e, t, s, a) {
  const n = Za[s], r = K.arena, { mesh: i, group: c, ring: o } = e, l = (v, g, w, x = n.stone) => i(v, "box", x, g, w);
  function u(v, g, w, x = !0) {
    const M = c(t, [
      v,
      0,
      g
    ]);
    l(M, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), l(M, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), l(M, [
      0.91,
      w,
      0.91
    ], [
      0,
      w / 2 + 0.6,
      0
    ]);
    for (const S of [-0.38, 0.38]) l(M, [
      0.08,
      w - 0.35,
      0.12
    ], [
      S,
      w / 2 + 0.6,
      0.48
    ], n.light);
    return l(M, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      w + 0.6,
      0
    ], n.light), l(M, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      w + 0.85,
      0
    ], n.dark), x && (i(M, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      w + 1.24,
      0
    ]), l(M, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      w - 0.15,
      0.52
    ], n.trim)), M;
  }
  function d(v, g, w, x) {
    u(v - w / 2, g, x - 2), u(v + w / 2, g, x - 2);
    const M = c(t, [
      v,
      x - 2,
      g
    ]);
    i(M, "arch", n.light, [
      w / 2,
      2.3,
      1.15
    ]);
    for (let S = 1; S < 10; S++) {
      const b = S / 10 * Math.PI, y = l(M, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(b) * w * 0.49,
        Math.sin(b) * 2.25,
        0.59
      ], n.trim);
      y.rotation.z = b - Math.PI / 2;
    }
    l(M, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function h(v, g, w = 1) {
    const x = c(t, [
      v,
      0,
      g
    ]);
    x.scale.setScalar(w);
    for (let M = 0; M < 5; M++) {
      const S = M * 2.4, b = i(x, "rock", M % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + M % 2 * 0.3,
        0.45
      ], [
        Math.cos(S) * 0.4,
        0.5,
        Math.sin(S) * 0.4
      ]);
      b.rotation.z = Math.sin(S) * 0.4;
    }
    for (let M = 0; M < 3; M++) i(x, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(M * 4) * 0.5,
      1,
      Math.cos(M * 4) * 0.4
    ]);
  }
  function p(v, g, w) {
    const x = c(t, [
      v,
      0,
      g
    ]);
    x.scale.setScalar(w);
    const M = i(x, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    M.rotation.z = -0.1;
    for (let S = 0; S < 6; S++) {
      const b = S * 2.4;
      i(x, "rock", S % 2 ? n.foliage : n.accent, [
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
  l(t, [
    180,
    0.3,
    180
  ], [
    0,
    -4.1,
    0
  ], n.water);
  for (let v = 0; v < 16; v++) l(t, [
    3 + v % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(v * 7) * 32,
    -3.92,
    Math.cos(v * 3) * 25
  ], n.haze);
  l(t, [
    r * 2 + 2.4,
    2.4,
    r * 2 + 2.4
  ], [
    0,
    -1.5,
    0
  ], n.dark), l(t, [
    r * 2 + 1.1,
    0.42,
    r * 2 + 1.1
  ], [
    0,
    -0.42,
    0
  ], n.trim), l(t, [
    r * 2 + 0.5,
    0.35,
    r * 2 + 0.5
  ], [
    0,
    -0.14,
    0
  ], n.floor);
  for (let v = -10; v <= 10; v += 2) for (let g = -10; g <= 10; g += 2) l(t, [
    1.96,
    0.045,
    1.96
  ], [
    v,
    0.025,
    g
  ], (v * 3 + g + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    o(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), o(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), o(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let v = 0; v < 8; v++) {
      const g = v * Math.PI / 4, w = l(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(g) * 5.04,
        0.065,
        Math.sin(g) * 5.04
      ], n.trim);
      w.rotation.y = -g + Math.PI / 2;
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
      const v = [];
      for (let w = 0; w < (s === 2 ? 24 : 16); w++) {
        const x = w * Math.PI * 2 / (s === 2 ? 24 : 16), M = w % 2 ? 0.85 : s === 2 ? 2.6 : w % 4 ? 1.8 : 3.2;
        v.push([Math.cos(x) * M, Math.sin(x) * M]);
      }
      const g = e.shape(t, v, n.seam, [
        0,
        0.061,
        0
      ]);
      g.rotation.x = -Math.PI / 2, o(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const v of [-1, 1]) for (let g = 0; g < 4; g++) {
    const w = v * (7 + g % 2), x = -7 + g * 4, M = l(t, [
      0.035,
      0.016,
      0.55 + g * 0.1
    ], [
      w,
      0.055,
      x
    ], n.seam);
    M.rotation.y = g * 1.3;
    const S = l(t, [
      0.028,
      0.015,
      0.3
    ], [
      w + 0.1,
      0.055,
      x + 0.3
    ], n.seam);
    S.rotation.y = g * 1.3 + 0.8;
  }
  for (const v of [-r - 0.35, r + 0.35]) {
    l(t, [
      0.38,
      0.18,
      r * 2 + 1
    ], [
      v,
      0.08,
      0
    ], n.light);
    for (let g = -10; g <= 10; g += 5) u(v + Math.sign(v) * 0.5, g, g === -10 ? 3.6 : 1.35);
  }
  for (let v = 0; v < 6; v++) l(t, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - v * 0.26,
    r + 0.65 + v * 0.8
  ], v % 2 ? n.stone : n.light);
  d(0, -r - 3, 8, 6.3);
  for (const v of [-1, 1]) {
    l(t, [
      5,
      3.2,
      1.9
    ], [
      v * 8.4,
      1.45,
      -r - 3
    ], n.dark), l(t, [
      5.5,
      0.3,
      2.3
    ], [
      v * 8.4,
      3.2,
      -r - 3
    ], n.light);
    const g = c(t, [
      v * 5.8,
      4.8,
      -r - 2.9
    ]);
    l(g, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let w = 0; w < 5; w++) l(g, [
      0.35,
      2.6 - Math.abs(w - 2) * 0.12,
      0.08
    ], [
      (w - 2) * 0.34,
      -1.35,
      Math.sin(w * 2) * 0.08
    ], w % 2 ? n.foliage : n.dark);
    if (l(g, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), s < 3) {
      for (let w = 0; w < 4; w++) h(v * (12.8 + w % 2), -9 + w * 5, 0.8 + w * 0.1);
      p(v * 15, -13, 1.5), p(v * 17, 1, 1.7);
    } else if (s === 3) for (let w = 0; w < 3; w++) {
      const x = c(t, [
        v * 15,
        0,
        -9 + w * 7
      ]);
      i(x, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), i(x, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), l(x, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), i(x, "torus", n.trim, [
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
      for (let x = 0; x < 5; x++) i(t, "rock", x % 2 ? n.light : n.accent, [
        1,
        2.2 + x % 3,
        0.9
      ], [
        v * (13.5 + x % 2),
        1.2,
        -9 + x * 4
      ]).rotation.z = v * -0.2;
      const w = c(t, [
        v * 17,
        0,
        -13
      ]);
      l(w, [
        0.22,
        8,
        0.22
      ], [
        0,
        3.5,
        0
      ], n.dark), e.shape(w, [
        [0, 0],
        [3, -1],
        [0, -4]
      ], n.light, [
        0,
        6.5,
        0
      ]);
    } else {
      for (let x = 0; x < 4; x++) {
        const M = c(t, [
          v * 14,
          0,
          -10 + x * 6
        ]);
        l(M, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let S = 0; S < 3; S++) {
          l(M, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + S,
            0
          ], n.trim);
          for (let b = 0; b < 5; b++) l(M, [
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
      const w = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        v * 18,
        6.2,
        -13
      ]);
      w.rotation.y = v * 0.3;
    }
    l(t, [
      7,
      1.4,
      18
    ], [
      v * 17,
      -0.7,
      -3
    ], n.dark), l(t, [
      6.7,
      0.1,
      17.7
    ], [
      v * 17,
      0.06,
      -3
    ], n.seam);
    for (const w of [-3.5, 3.5]) l(t, [
      0.22,
      0.25,
      18.2
    ], [
      v * 17 + w,
      0.13,
      -3
    ], n.stone);
    l(t, [
      9,
      1.8,
      10
    ], [
      v * 15,
      -0.9,
      -17
    ], n.dark), l(t, [
      8.7,
      0.1,
      9.7
    ], [
      v * 15,
      0.06,
      -17
    ], n.seam);
  }
  for (let v = 0; v < 7; v++) {
    const g = (v - 3) * 8, w = -26 - v % 3 * 6, x = 7 + v * 5 % 7;
    if (l(t, [
      5.2,
      x,
      5.5
    ], [
      g,
      x / 2 - 3,
      w
    ], n.stone), l(t, [
      5.8,
      0.4,
      6
    ], [
      g,
      x - 3,
      w
    ], n.light), s === 1) {
      const M = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        g,
        x - 0.8,
        w
      ]);
      M.rotation.z = 0.9;
    } else if (s === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      g,
      x - 0.8,
      w
    ]);
    else if (s === 3) {
      for (const M of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + v % 2 * 2,
        0.7
      ], [
        g + M,
        x - 1,
        w
      ]);
      l(t, [
        3.8,
        0.25,
        4
      ], [
        g,
        x - 2.5,
        w
      ], n.trim);
    } else if (s === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        g,
        x - 0.8,
        w
      ]);
      for (const M of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        g + M,
        x - 3,
        w + 3
      ]);
    } else if (s === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        g,
        x + 0.7,
        w
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        g,
        x - 1,
        w
      ]).rotation.x = Math.PI / 2;
    else {
      for (const M of [
        -2,
        0,
        2
      ]) l(t, [
        0.7,
        1.2,
        5.6
      ], [
        g + M,
        x - 2.35,
        w
      ], n.light);
      v % 2 && p(g + 1, w + 2, 1.5);
    }
    for (const M of [
      -1.5,
      0,
      1.5
    ]) l(t, [
      0.5,
      2.8,
      0.12
    ], [
      g + M,
      x - 5.6,
      w + 2.8
    ], n.dark);
  }
  for (const v of a?.obstacles ?? []) {
    const g = c(t, [
      v.x,
      0,
      v.y
    ]);
    i(g, "cylinder", n.dark, [
      v.radius,
      0.22,
      v.radius
    ], [
      0,
      0.11,
      0
    ]), i(g, "cylinder", n.stone, [
      v.radius * 0.85,
      1.15,
      v.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(g, "cylinder", n.light, [
      v.radius,
      0.2,
      v.radius
    ], [
      0,
      1.4,
      0
    ]), i(g, "rock", n.accent, [
      0.28,
      0.58,
      0.28
    ], [
      0,
      1.9,
      0
    ]);
    for (let w = 0; w < 6; w++) {
      const x = w * Math.PI / 3;
      l(g, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(x) * v.radius * 0.86,
        0.8,
        Math.sin(x) * v.radius * 0.86
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
    for (const v of [-1, 1]) {
      h(v * 3, -8, 1.2), h(v * 4, -10, 0.85);
      const g = c(t, [
        v * 2.6,
        0.5,
        -6
      ]);
      i(g, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), i(g, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), i(g, "cone", n.trim, [
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
function Bo(e, t, s) {
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
  ]), i = e.group(r), c = s === "female", o = c ? 0.225 : 0.255, l = ot.traveler.fabric, u = "#574a40", d = "#d7ab8b", h = "#463f3b";
  e.mesh(n, "sphere", l, [
    o,
    0.28,
    0.155
  ], [
    0,
    -0.04,
    0
  ]), e.mesh(n, "cylinder", l, [
    c ? 0.165 : 0.185,
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
    c ? 0.161 : 0.172,
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
  for (const M of [-1, 1])
    e.mesh(r, "sphere", d, [
      0.027,
      0.042,
      0.027
    ], [
      M * 0.166,
      -0.01,
      0
    ]), e.mesh(r, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      M * 0.061,
      0.016,
      0.155
    ]), e.mesh(r, "box", h, [
      0.047,
      0.012,
      0.014
    ], [
      M * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", h, [
      0.035,
      0.12,
      0.08
    ], [
      M * 0.157,
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
  ]), c) {
    const M = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let S = 0; S < 4; S++) e.mesh(M, "sphere", h, [
      0.064 - S * 9e-3,
      0.09,
      0.063 - S * 8e-3
    ], [
      S % 2 ? 0.014 : -0.014,
      -S * 0.115,
      0
    ]);
    e.mesh(M, "box", l, [
      0.066,
      0.032,
      0.066
    ], [
      0,
      -0.33,
      0
    ]);
  }
  const p = [], v = [];
  for (const M of [-1, 1]) {
    const S = e.group(a, [
      M * o,
      0.12,
      0
    ]);
    p.push(S), e.mesh(S, "cylinder", l, [
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
      M * 0.105,
      -0.32,
      0
    ]);
    v.push(b), e.mesh(b, "cylinder", "#434e55", [
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
  const g = [
    n,
    r,
    i,
    ...p,
    ...v
  ].map((M) => e.bake(M));
  r.add(i);
  const w = [];
  a.traverse((M) => {
    M instanceof vt && M.material === e.material(l) && w.push(M);
  });
  let x = null;
  return {
    body: a,
    hand: e.group(p[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(M) {
      if (M !== x) {
        x = M;
        for (const S of w) S.material = e.material(ot[M].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(ot[M].head);
      }
    },
    pose(M, S, b, y, _, P) {
      const A = !_ && b ? Math.sin(S * 0.55) * 0.48 : 0;
      a.position.y = 1.3 + (!_ && b ? Math.abs(Math.sin(S * 0.55)) * 0.025 : 0), a.rotation.set(!_ && y ? 0.16 : 0, Math.PI / 2 - M, 0), v.forEach((j, C) => {
        j.rotation.x = (C ? -1 : 1) * A;
      }), p.forEach((j, C) => {
        j.rotation.set(C && P ? -0.55 : (C ? 1 : -1) * A * 0.65, 0, (C ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      g.forEach((M) => M()), a.removeFromParent();
    }
  };
}
function qo(e, t, s) {
  const a = ot[s], { mesh: n, group: r, shape: i } = e, c = r(t, [
    0,
    0.2,
    -0.23
  ]), o = r(t, [
    0,
    0.328,
    0
  ]), l = r(t, [
    0,
    0.55,
    0
  ]);
  o.scale.set(0.64, 0.78, 0.72);
  const u = a.silhouette === "robe" || a.silhouette === "coat";
  if (i(c, [
    [-0.23, 0],
    [0.23, 0],
    [0.38, u ? -0.68 : -0.48],
    [0.1, u ? -0.77 : -0.59],
    [-0.36, u ? -0.68 : -0.5]
  ], a.fabric), i(c, [
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
      n(l, "torus", a.metal, [
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
        n(l, "rock", a.glow, [
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
    cape: c,
    animate(d, h) {
      l.rotation.y = h ? 0.4 : d * 0.014;
    }
  };
}
function Wo(e, t, s, a, n, r) {
  const { mesh: i, group: c, shape: o } = e, l = "#d6b881", u = "#fff0c1", d = (h, p, v) => {
    for (const g of [-1, 1]) i(s, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      g * v,
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
        const p = h * Math.PI * 2 / 7, v = c(t, [
          Math.cos(p) * 0.8,
          2.6,
          Math.sin(p) * 0.6
        ]);
        v.rotation.z = Math.cos(p) * 0.8, i(v, "cone", "#526451", [
          0.18,
          2.4,
          0.18
        ], [
          0,
          0.9,
          0
        ]), i(v, "rock", r.foliage, [
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
      ]) i(a, "torus", l, [
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
      ]), d(3.25, 0.63, 0.18), i(s, "cone", l, [
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
        const p = h * Math.PI * 2 / 5, v = c(a, [
          Math.cos(p) * 1.7,
          2.5 + Math.sin(p) * 0.6,
          Math.sin(p) * 1.3
        ]);
        v.rotation.z = p * 0.3, i(v, "box", "#baa481", [
          0.55,
          0.72,
          0.14
        ]), i(v, "box", "#f1e4c6", [
          0.48,
          0.65,
          0.15
        ], [
          0,
          0,
          0.03
        ]);
      }
      i(s, "torus", l, [
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
        const p = c(a, [
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
function Ho(e, t) {
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
  ], r = e.shape(a, n, Ue.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, Ue.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, Ue.enamel, [
    0,
    0,
    -0.018
  ]).scale.set(0.87, 0.87, 1);
  for (const l of [-0.025, 0.09])
    e.shape(a, [
      [0, 0.24],
      [0.08, 0.12],
      [0.045, -0.07],
      [0, -0.2],
      [-0.045, -0.07],
      [-0.08, 0.12]
    ], Ue.silver, [
      0,
      0,
      l
    ]), e.mesh(a, "rock", Ue.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      l + Math.sign(l) * 0.014
    ], !1, 1, !0);
  let c = 0, o = -1;
  return s.visible = !1, { update(l, u, d, h, p) {
    const v = u ? 1 : 0, g = Math.max(0, Math.min(4, h - o));
    c = p || o < 0 || h < o ? v : c + (v - c) * (1 - Math.exp(-g * 0.85)), o = h, s.visible = l === "blade" || u || c > 0.04, s.position.set(-0.4 + c * 0.12, -0.1 + c * 0.3, 0.17 + c * 0.25), s.rotation.set(0.12 - c * 0.22, 0.15 - c * 0.3, -0.16 + c * 0.22), a.scale.setScalar(0.94 + c * 0.07), r.material = e.material(d ? Ue.parry : l === "blade" ? Ue.block : Ue.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : Ue.enamel);
  } };
}
function Vo(e, t) {
  const s = e.group(t), a = new pr({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new gn(Ue.ward) },
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
  }), n = new vt(e.geometries.sphere, a);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, s.add(n), s.visible = !1, {
    update(r, i) {
      s.visible = !!r && r.ward > 0, !(!r || !s.visible) && (s.position.set(r.x, 0, r.y), a.uniforms.impact.value = i, s.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), s.removeFromParent();
    }
  };
}
function Go(e, t) {
  const s = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  s.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const d = e.group(s);
    e.mesh(d, "box", Je.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(d, "box", Je.page, [
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
  const r = e.mesh(s, "rock", Je.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(s, "torus", Je.crest, [
    0.17,
    0.17,
    0.17
  ], [
    0,
    0.31,
    0
  ], !0, 0.65);
  i.rotation.x = Math.PI / 2;
  let c = 0, o = 0.15, l = -1;
  return { update(u, d, h, p) {
    const v = p || l < 0 || h < l ? 1 : 1 - Math.exp(-Math.min(4, h - l) * 0.5);
    l = h, c += ((u ? 1 : 0) - c) * v, o += ((d ? 0.5 : u ? 0.28 : 0.15) - o) * v, s.position.y = o, s.rotation.x = -0.45 + (o - 0.15) * 0.7, a[0].rotation.z = -0.65 + c * 0.5, a[1].rotation.z = 0.65 - c * 0.5, n.rotation.z = p ? 0.2 : 0.2 + c * (Math.sin(h * 0.18) + 1) * 1.3, r.scale.set(0.07 + c * 0.025, 0.1 + c * 0.06, 0.07 + c * 0.025), i.visible = u, p || (r.rotation.y = h * 0.08);
  } };
}
function Ws(e, t, s = 1) {
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
function Hs(e, t, s) {
  const a = e.group(t), n = Bo(e, a, s), r = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), c = e.group(r), o = n.hand, l = e.group(c), u = Ho(e, c);
  let d = null, h = -1, p = Math.PI / 2, v = null, g = null, w = null, x = 0, M = 0;
  function S(b, y) {
    if (!(b === g && y === w)) {
      if (g = b, w = y, l.clear(), o.clear(), d = null, v = qo(e, l, w), n.dress(w), g === "blade")
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
      else if (g === "bow") Ws(e, o);
      else if (g === "staff")
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
      else if (g === "daggers") for (const _ of [-1, 1]) {
        const P = e.group(o, [
          _ < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(P, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(P, [
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
      else if (g === "grimoire") d = Go(e, o);
      else if (g === "cannon") {
        const _ = e.group(o, [
          0.02,
          0.08,
          0.17
        ]);
        _.rotation.x = Math.PI / 2, e.mesh(_, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(_, "torus", "#d2a96c", [
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
    update(b, y, _, P, A, j, C = !1) {
      S(y, _), u.update(y, !!b?.shield, !!b?.guard, P, A);
      const U = A || h < 0 || P < h ? 1 : 1 - Math.exp(-Math.min(4, P - h) * 0.65);
      h = P;
      const T = j ? Math.PI / 2 + 0.23 : b?.facing ?? Math.PI / 2;
      p += Math.atan2(Math.sin(T - p), Math.cos(T - p)) * U;
      const H = !!b && Math.abs(b.x - x) + Math.abs(b.y - M) > 1e-3, Y = !!b?.dashTime;
      a.position.set(b?.x ?? 0, j ? 0.3 : 0, b?.y ?? -8), a.scale.setScalar(j ? 1.65 : 1), n.pose(p, P, H, Y, A, !!b?.swing || C), v.cape.rotation.x = A ? -0.15 : -0.15 - (H ? 0.5 : 0.06) - Math.sin(P * 0.15) * 0.12, v.animate(P, A);
      const F = b?.swing && !A ? Math.sin(b.swing / (y === "cannon" ? 16 : 9) * Math.PI) : 0;
      o.rotation.z += ((C ? -0.3 : -0.2 - F * 1.3) - o.rotation.z) * U, o.rotation.x += ((C ? -0.25 : 0.1 + F * 0.6) - o.rotation.x) * U, d && d.update(!!b?.resonance, C, P, A), i.scale.set(0.6 + (Y ? 0.25 : 0), 0.6, 1), b && (x = b.x, M = b.y);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function Rn(e, t, s, a) {
  const { mesh: n, group: r } = e, i = r(t), c = r(i), o = r(c), l = r(c), u = [], d = _e(s), h = ue[s].radius;
  e.ring(i, "#1d3540", h * 1.15, 0, 0, 0.16, !0);
  const p = "#cfad70", v = "#fff0b0", g = a.dark;
  function w(C, U, T) {
    const H = r(c, [
      C,
      T,
      U
    ]);
    n(H, "box", g, [
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
  function x(C, U, T = "#d9e8df") {
    n(C, "box", p, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(C, "box", g, [
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
    n(c, "rock", a.stone, [
      0.58,
      0.58,
      0.9
    ], [
      0,
      0.7,
      0
    ]), n(l, "rock", g, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const C of [-0.27, 0.27]) {
      const U = n(l, "cone", p, [
        0.15,
        0.7,
        0.15
      ], [
        C,
        1.15,
        0.9
      ]);
      U.rotation.x = 0.55, n(l, "sphere", v, [
        0.05,
        0.04,
        0.06
      ], [
        C,
        0.82,
        1.02
      ], !0), w(C, -0.42, 0.45), w(C, 0.45, 0.45);
    }
    for (let C = 0; C < 3; C++) n(c, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + C * 0.4
    ]);
  } else if (s === "weaver") {
    n(c, "cone", "#63689d", [
      1.45,
      3,
      1.2
    ], [
      0,
      2.1,
      0
    ]), n(c, "cone", a.light, [
      0.8,
      1.8,
      0.65
    ], [
      0,
      2.65,
      0.3
    ]), n(l, "sphere", g, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const C = n(l, "crescent", p, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    C.rotation.z = 0.87;
    for (const U of [-0.23, 0.23]) n(l, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      U,
      4.08,
      0.45
    ], !0);
    for (const U of [-1, 1]) {
      const T = r(c, [
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
    w(-0.5, 0, 0.8), w(0.5, 0, 0.8), n(c, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(c, "box", g, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(c, "rock", p, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const C of [-1, 1]) n(c, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      C * 0.95,
      2.95,
      0
    ]);
    n(l, "sphere", g, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(l, "box", v, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(l, "torus", p, [
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
      n(l, "cone", p, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(U) * 0.78,
        4.85,
        Math.sin(U) * 0.78
      ]);
    }
    o.position.set(1.55, 1.35, 0.2), o.rotation.z = -0.3, x(o, 3.4, "#f6dc9f"), n(c, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (s === "warden") {
    w(-0.65, 0.05, 0.85), w(0.65, 0.05, 0.85), n(c, "cylinder", g, [
      1.1,
      1.85,
      0.8
    ], [
      0,
      1.9,
      0
    ]), n(c, "box", a.stone, [
      1.1,
      1.45,
      0.35
    ], [
      0,
      2,
      0.72
    ]), n(c, "rock", a.accent, [
      0.28,
      0.4,
      0.14
    ], [
      0,
      2.1,
      0.94
    ]);
    for (const U of [-1, 1])
      n(c, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        U * 1.03,
        2.7,
        0
      ]), n(c, "box", p, [
        0.7,
        0.1,
        0.8
      ], [
        U * 1.08,
        2.45,
        0.1
      ], !1, 1, !0);
    n(l, "sphere", a.stone, [
      0.73,
      0.77,
      0.63
    ], [
      0,
      3.2,
      0
    ]), n(l, "box", g, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(l, "box", v, [
      0.74,
      0.095,
      0.05
    ], [
      0,
      3.22,
      0.66
    ], !0), n(l, "cone", a.foliage, [
      0.27,
      1.1,
      0.5
    ], [
      0,
      4,
      -0.2
    ]);
    const C = r(c, [
      -1.32,
      1.5,
      0.6
    ]);
    n(C, "box", g, [
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
    ]), n(o, "box", g, [
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
  } else if (_e(s)) Wo(e, c, l, o, s, a);
  else if (s === "wisp")
    n(c, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(l, "torus", p, [
      0.48,
      0.6,
      0.4
    ], [
      0,
      1,
      0
    ]), n(l, "sphere", "#f7f5e8", [
      0.12,
      0.13,
      0.1
    ], [
      0,
      1.05,
      0.31
    ], !0), n(c, "cone", a.light, [
      0.16,
      0.6,
      0.16
    ], [
      0,
      0.35,
      0
    ]).rotation.z = Math.PI;
  else if (s === "stalker") {
    n(c, "sphere", a.dark, [
      0.4,
      0.35,
      0.65
    ], [
      0,
      0.55,
      0
    ]), n(l, "rock", a.foliage, [
      0.33,
      0.38,
      0.32
    ], [
      0,
      0.75,
      0.5
    ]);
    for (const C of [-1, 1])
      w(C * 0.27, -0.25, 0.35), n(l, "cone", p, [
        0.09,
        0.35,
        0.09
      ], [
        C * 0.21,
        1.09,
        0.42
      ]), n(l, "sphere", v, [
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
    w(-0.22, 0, 0.45), w(0.22, 0, 0.45), n(c, "sphere", "#85654c", [
      0.5,
      0.6,
      0.4
    ], [
      0,
      0.95,
      0
    ]), n(l, "sphere", a.stone, [
      0.35,
      0.38,
      0.31
    ], [
      0,
      1.62,
      0
    ]), n(l, "box", a.dark, [
      0.63,
      0.15,
      0.08
    ], [
      0,
      1.69,
      0.3
    ]), n(c, "cylinder", "#ac7b54", [
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
    if (C ? n(c, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (w(-0.22, 0, 0.5), w(0.22, 0, 0.5), n(c, "box", g, [
      0.72,
      0.85,
      0.52
    ], [
      0,
      0.92,
      0
    ])), n(c, "box", a.stone, [
      0.5,
      0.55,
      0.15
    ], [
      0,
      1,
      0.3
    ]), n(l, "sphere", a.stone, [
      0.43,
      0.45,
      0.38
    ], [
      0,
      1.63,
      0
    ]), n(l, "box", g, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(l, "box", v, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), C)
      n(l, "cone", "#626a9c", [
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
      n(l, "box", a.foliage, [
        0.12,
        0.38,
        0.55
      ], [
        0,
        2,
        -0.07
      ]);
      for (const T of [-1, 1]) n(c, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        T * 0.45,
        1.22,
        0
      ]);
      o.position.set(0.54, 1, 0.2), s === "archer" ? Ws(e, o, 1.3) : (o.rotation.z = -0.3, x(o, 0.75)), U && (n(c, "box", p, [
        0.85,
        1.1,
        0.18
      ], [
        -0.4,
        0.95,
        0.46
      ]), n(c, "box", a.foliage, [
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
  const M = r(i, [
    0,
    d ? 5.5 : s === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(M, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const S = n(M, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), b = [];
  c.traverse((C) => {
    C instanceof vt && b.push({
      mesh: C,
      material: C.material
    });
  });
  let y = 0, _ = -100, P = 0, A = 0;
  const j = o.rotation.z;
  return {
    root: i,
    bar: M,
    update(C, U, T) {
      const H = Math.abs(C.x - P) + Math.abs(C.y - A) > 5e-3;
      P = C.x, A = C.y, y && !C.windup && (_ = U), y = C.windup;
      const Y = C.windup ? 1 - C.windup / ue[C.kind].windup : 0, F = Math.max(0, 1 - (U - _) / 10);
      i.position.set(C.x, 0, C.y), c.rotation.y = Math.PI / 2 - C.angle, c.position.y = T ? 0 : s === "weaver" || s === "priest" ? 0.13 + Math.sin(U * 0.055) * 0.1 : H ? Math.abs(Math.sin(U * 0.3)) * 0.055 : 0, c.rotation.x = T ? 0 : -Y * 0.16 + F * 0.2, l.rotation.z = !T && s === "king" ? Math.sin(U * 0.035) * 0.08 : 0, o.rotation.x = T ? 0 : Y * -1.3 + F * 1.4, o.rotation.z = j + (T ? 0 : Y * -0.35);
      for (let Z = 0; Z < u.length; Z++) u[Z].rotation.x = !T && H ? Math.sin(U * 0.32 + Z * Math.PI) * 0.28 : 0;
      for (const Z of b) Z.mesh.material = C.marked > 2 && !T ? e.material("#fff6dd") : Z.material;
      M.visible = !d && C.hp < C.maxHp, S.scale.x = C.hp / C.maxHp, S.position.x = (C.hp / C.maxHp - 1) * 0.5;
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
function Yo(e, t) {
  const s = /* @__PURE__ */ new Map();
  function a(r, i, c = 1, o = !1) {
    const l = Math.max(0.1, Math.min(1, Math.round(c * 10) / 10)), u = `${r}/${i}/${l}/${o}`;
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
    ], !o, l), d.list.push(h)), h.visible = !0, h.rotation.set(0, 0, 0), h.scale.set(1, 1, 1), h;
  }
  function n(r, i, c, o, l, u = 1, d = 0.09) {
    const h = a(r, i, u);
    return h.position.set(o, d, l), h.scale.set(c, c, 1), h.rotation.x = -Math.PI / 2, h;
  }
  return { update(r, i) {
    for (const o of s.values())
      o.used = 0, o.list.forEach((l) => l.visible = !1);
    if (!r) return;
    const c = r.player;
    if (n("ring", "#f2f6e2", 0.64, c.x, c.y, 0.8), c.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const l = a("cone", ie.gold, 0.7 - o * 0.15);
      l.position.set(c.x - Math.cos(c.dashAngle) * o * 0.43, 0.45, c.y - Math.sin(c.dashAngle) * o * 0.43), l.scale.set(0.13, c.dashTime / 8 * 1.7, 0.13), l.rotation.set(0, -c.dashAngle, -Math.PI / 2);
    }
    if (!r.boss && (r.encounter === "siege" || r.encounter === "ritual")) {
      const o = r.objective;
      r.encounter === "ritual" && (n("disc", ie.magic, 2.5, o.x, o.y, 0.12), n("ring", ie.magic, 2.5, o.x, o.y), n("ring", ie.gold, 2.2, o.x, o.y, 0.8));
      const l = a("cylinder", "#526b79");
      l.position.set(o.x, 0.3, o.y), l.scale.set(0.5, 0.6, 0.5);
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
          const l = a("cylinder", "#687c81");
          l.position.set(o.x, 0.25, o.y), l.scale.set(0.4, 0.5, 0.4);
          const u = a("box", "#bd9a68");
          u.position.set(o.x, 0.65, o.y), u.scale.set(0.9, 0.2, 0.25), u.rotation.y = -o.angle;
          const d = a("sphere", ie.magic);
          d.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const l = o.kind === "familiar" && c.resonance > 0, u = l ? 1.5 : 1, d = o.kind === "shade" ? "#a6acd8" : l ? Je.empowered : Je.familiar, h = i ? 0 : Math.sin(r.tick * 0.1 + o.id) * 0.08, p = a("sphere", d, 1, !0);
          p.position.set(o.x, 0.55 * u + h, o.y), p.scale.set(0.3 * u, 0.36 * u, 0.3 * u);
          for (const g of [-1, 1]) {
            const w = a("cone", d, 1, !0);
            w.position.set(o.x + g * 0.2 * u, 0.93 * u + h, o.y), w.scale.set(0.08 * u, 0.22 * u, 0.08 * u);
          }
          const v = a("sphere", "#35475b");
          if (v.position.set(o.x + Math.cos(o.angle) * 0.28 * u, 0.63 * u + h, o.y + Math.sin(o.angle) * 0.28 * u), v.scale.setScalar(0.07 * u), l) {
            const g = a("torus", Je.crest, 1, !0);
            g.position.set(o.x, 1.45 + h, o.y), g.rotation.x = Math.PI / 2, g.scale.setScalar(0.32);
            for (let w = 0; w < 3; w++) {
              const x = w * Math.PI * 2 / 3, M = a("rock", Je.crest, 1, !0);
              M.position.set(o.x + Math.cos(x) * 0.32, 1.55 + h, o.y + Math.sin(x) * 0.32), M.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of r.enemies) {
      if (_e(o.kind) && o.phase > 1) {
        const l = ue[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? ie.fire : ie.magic, l, o.x, o.y, 0.65), !i) for (let u = 0; u < o.phase + 2; u++) {
          const d = r.tick * 0.025 + u * Math.PI * 2 / (o.phase + 2), h = a("rock", o.kind === "king" ? ie.fire : ie.magic, 0.8);
          h.position.set(o.x + Math.cos(d) * l, 0.55 + Math.sin(d * 2) * 0.2, o.y + Math.sin(d) * l), h.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const l = 1 - o.windup / ue[o.kind].windup;
        if (n("ring", ie.warning, ue[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const u = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), d = a("box", ie.danger, 0.3);
          d.scale.set(0.75, 0.035, u), d.position.set(o.x + Math.cos(o.angle) * u / 2, 0.09, o.y + Math.sin(o.angle) * u / 2), d.rotation.y = Math.PI / 2 - o.angle, n("ring", ie.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const u = Math.hypot(o.target.x - o.x, o.target.y - o.y), d = a("box", ie.warning, 0.6);
          d.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), d.scale.set(u, 0.03, 0.09), d.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", ie.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", ie.danger, ue[o.kind].reach, o.target.x, o.target.y, 0.15 + l * 0.2), n("ring", ie.danger, ue[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", ie.frost, ue[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", ie.gold, ue[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let l = 0; l < 3; l++) {
        const u = a("rock", ie.fire, 0.8);
        u.position.set(o.x + Math.sin(l * 2) * 0.3, 0.35 + (r.tick + l * 7) % 20 / 18, o.y + Math.cos(l * 2) * 0.3), u.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of r.hazards) {
      const l = o.friendly ? o.kind === "fire" ? ie.fire : ie.magic : ie.danger;
      if (o.kind === "beam") {
        const u = a("box", l, o.wait ? 0.3 : 0.75);
        u.position.set(o.x + Math.cos(o.angle) * o.length / 2, 0.11, o.y + Math.sin(o.angle) * o.length / 2), u.scale.set(o.length, 0.04, o.width * 2), u.rotation.y = -o.angle;
        for (const d of [0, o.length]) n("disc", l, o.width, o.x + Math.cos(o.angle) * d, o.y + Math.sin(o.angle) * d, o.wait ? 0.3 : 0.75);
        continue;
      }
      if (o.kind === "ring") {
        n("ring", l, o.inner, o.x, o.y), n("ring", l, o.radius, o.x, o.y);
        for (let u = 1; u <= 4; u++) n("ring", l, o.inner + (o.radius - o.inner) * u / 5, o.x, o.y, o.wait ? 0.35 : 0.8);
        continue;
      }
      if (n("disc", l, o.radius, o.x, o.y, o.wait ? 0.2 : 0.4), n("ring", l, o.radius, o.x, o.y), o.wait) {
        n("ring", l, o.radius * (1 - Math.min(1, o.wait / 45)), o.x, o.y, 0.7);
        const u = a("box", l, 0.7);
        u.position.set(o.x, 0.12, o.y), u.scale.set(0.08, 0.02, 0.6);
        const d = a("box", l, 0.7);
        d.position.copy(u.position), d.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", ie.gold, o.radius * (0.7 + Math.sin(r.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let u = 0; u < 6; u++) {
          const d = u * Math.PI / 3, h = a("cone", l, 0.7);
          h.position.set(o.x + Math.cos(d) * o.radius * 0.65, 0.45, o.y + Math.sin(d) * o.radius * 0.65), h.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of r.shots) {
      const l = o.friendly ? ie.gold : ie.danger, u = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      u.position.set(o.x, 0.6, o.y), u.scale.set(0.11, 0.11, 0.11);
      const d = a("sphere", l, 0.8);
      d.position.copy(u.position), d.scale.set(0.21, 0.18, 0.21);
      const h = a("cone", l, 0.5);
      h.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), h.scale.set(0.14, 0.75, 0.14), h.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of r.effects) {
      const l = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const u = n("arc", ie.gold, o.size, o.x, o.y, 0.3 * (1 - l), 0.42);
        u.rotation.z = -o.angle - 0.9 + l * 0.4;
        const d = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - l), 0.43);
        d.rotation.z = u.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", Je.crest, o.size * (i ? 1 : 0.6 + l * (2 - l)), o.x, o.y, 0.8 - l * 0.6, 0.16);
        for (const u of r.companions) {
          if (u.kind !== "familiar" || u.hp <= 0 || u.life <= 0) continue;
          const d = u.x - c.x, h = u.y - c.y, p = a("box", Je.empowered, 1 - l * 0.7);
          p.position.set((c.x + u.x) / 2, 1.1, (c.y + u.y) / 2), p.scale.set(Math.hypot(d, h), 0.045, 0.045), p.rotation.y = -Math.atan2(h, d);
        }
        for (let u = 0; u < 4; u++) {
          const d = u * Math.PI / 2 + (i ? 0 : l), h = a("rock", Je.empowered, 1 - l * 0.4);
          h.position.set(c.x + Math.cos(d) * 0.95, 1.7 + (i ? 0 : l * 0.5), c.y + Math.sin(d) * 0.95), h.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let u = 0; u < 4; u++) {
          const d = a("box", u % 2 ? "#ffffff" : ie.magic, 1 - l * 0.6);
          d.scale.set(0.09 + (1 - l) * 0.09, 1.05, 0.08), d.position.set(o.x + (u % 2 ? 0.14 : -0.14), 0.5 + u * 0.85, o.y), d.rotation.z = u % 2 ? -0.35 : 0.35;
        }
        n("ring", ie.magic, 0.4 + l, o.x, o.y, 1 - l);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const u = o.kind === "block" || o.kind === "parry", d = o.kind === "ward-break", h = u ? o.kind === "parry" ? Ue.parry : Ue.block : Ue.ward;
        if (u) {
          const p = a("ring", h, 1 - l);
          p.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), p.rotation.y = Math.PI / 2 - o.angle, p.scale.setScalar(0.6 + l * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let p = 0; p < (d ? 6 : 4); p++) {
          const v = p * 2.4 + o.id, g = a(d ? "rock" : "box", h, 1 - l), w = i ? 1.1 : 0.7 + l * (d ? 1.5 : 0.6);
          g.position.set(o.x + Math.cos(v) * w, 0.7 + p % 3 * 0.55, o.y + Math.sin(v) * w), g.scale.set(0.07 * (1 - l), (d ? 0.3 : 0.16) * (1 - l), 0.04), g.rotation.set(v, v, v);
        }
      } else if (o.kind === "heal") n("ring", ie.heal, 0.4 + l, o.x, o.y, 1 - l);
      else {
        const u = o.kind === "hit" ? ie.danger : ie.gold;
        if (n("ring", u, o.size * (0.4 + l), o.x, o.y, 1 - l), !i) for (let d = 0; d < 7; d++) {
          const h = d * 2.4 + o.id, p = a("rock", u, 1 - l * 0.8);
          p.position.set(o.x + Math.cos(h) * l * o.size, 0.4 + Math.sin(l * Math.PI) * 0.8, o.y + Math.sin(h) * l * o.size), p.scale.set(0.1 * (1 - l), 0.28 * (1 - l), 0.1 * (1 - l)), p.rotation.z = h;
        }
      }
    }
  } };
}
function Qo(e) {
  const t = document.createElement("div"), s = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", Ue.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ne.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(s);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new ct();
  let r = null, i = 0, c = 0, o = null;
  function l(u, d, h, p, v, g, w) {
    n.set(d, h, p).project(v), u.style.left = `${(n.x * 0.5 + 0.5) * g}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * w}px`;
  }
  return {
    update(u, d, h, p) {
      if (u !== r && (r = u, i = 0, o = null, c = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const v = u.player;
      t.hidden || (s.style.width = `${v.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(v.ward)), l(t, v.x, 0, v.y, d, h, p));
      const g = u.effects.filter((x) => x.id > i && x.kind in ne.defenseFeedback), w = g.find((x) => x.kind === "parry" || x.kind === "ward-break") ?? g.at(-1);
      w && (o = w.kind, c = u.tick + 27), i = u.serial, u.tick >= c && (o = null), a.hidden = !o && !v.shield, a.dataset.state = o ?? "blocking", a.textContent = o ? ne.defenseFeedback[o] : v.shield ? ne.guardActive : "", l(a, v.x, v.shield ? 3.65 : 3.05, v.y, d, h, p);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function Ko(e, t, s, a) {
  const { width: n, depth: r } = a.footprint, i = n >= r, c = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(n, r) / 5));
  e.mesh(t, "box", f.mortar, [
    n,
    0.4,
    r
  ], [
    0,
    0.2,
    0
  ]);
  for (let o = 0; o < c; o++) {
    const l = i ? n / c : n, u = i ? r : r / c, d = e.group(s, [
      i ? -n / 2 + (o + 0.5) * l : 0,
      0,
      i ? 0 : -r / 2 + (o + 0.5) * u
    ]), h = (a.height ?? 4) + (o % 3 - 1) * 0.35, p = a.kind === "workshop";
    e.mesh(d, "box", o % 2 ? f.stone : f.cloth, [
      l - 0.15,
      h - 0.4,
      u - 0.15
    ], [
      0,
      (h + 0.4) / 2,
      0
    ]);
    for (const M of [-l / 2 + 0.12, l / 2 - 0.12]) e.mesh(d, "box", f.timber, [
      0.18,
      h,
      u
    ], [
      M,
      h / 2,
      0
    ]);
    for (const M of [0.7, h - 0.3]) e.mesh(d, "box", f.wood, [
      l,
      0.15,
      u
    ], [
      0,
      M,
      0
    ]);
    const v = e.group(d, [
      0,
      h + 0.24,
      0
    ]);
    v.rotation.x = -0.18;
    const g = !i && c > 1 ? u - 0.03 : u + 0.7;
    e.mesh(v, "box", f.roof, [
      l + 0.6,
      0.16,
      g
    ]);
    for (let M = -l / 2; M <= l / 2; M += 0.8) e.mesh(v, "box", f.roofLight, [
      0.055,
      0.07,
      g
    ], [
      M,
      0.12,
      0
    ]);
    e.mesh(v, "box", f.brass, [
      l + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      g / 2
    ]);
    const w = e.group(d, [
      0,
      0,
      u / 2
    ]), x = a.entrance ? 0 : -l * 0.19;
    e.mesh(w, "box", f.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      x,
      1.1,
      0
    ]);
    for (const M of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(w, "box", f.wood, [
      0.24,
      1.95,
      0.12
    ], [
      x + M,
      1.06,
      0.04
    ]);
    if (e.mesh(w, "box", f.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      l * 0.27,
      2.25,
      0.03
    ]), e.mesh(w, "box", f.ember, [
      0.7,
      0.67,
      0.14
    ], [
      l * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(w, "box", f.timber, [
      0.07,
      0.85,
      0.16
    ], [
      l * 0.27,
      2.25,
      0.15
    ]), e.mesh(w, "box", f.timber, [
      0.85,
      0.07,
      0.16
    ], [
      l * 0.27,
      2.25,
      0.15
    ]), u >= 4 && (i || o === c - 1)) {
      const M = e.group(w, [
        0,
        2.8,
        0.55
      ]);
      M.rotation.x = 0.22, e.mesh(M, "box", a.tint === "rose" ? f.rose : f.cloth, [
        l * 0.8,
        0.045,
        1.6
      ]), e.mesh(M, "box", f.light, [
        0.55,
        0.015,
        0.45
      ], [
        -l * 0.17,
        0.035,
        0.35
      ]);
    }
    if (p) {
      e.mesh(d, "box", f.wood, [
        l * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        u / 2 - 0.5
      ]);
      for (let M = 0; M < 3; M++) e.mesh(d, "cylinder", f.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (M - 1) * 0.55,
        1.4,
        u / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(d, "box", f.slate, [
        0.6,
        h * 0.38,
        0.7
      ], [
        -l * 0.3,
        h + 0.55,
        -u * 0.2
      ]), e.mesh(d, "box", f.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -l * 0.3,
        h * 1.19 + 0.6,
        -u * 0.2
      ]);
  }
}
function Xo(e, t, s) {
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
    const c = e.mesh(a, "box", f.wood, [
      0.15,
      1,
      0.15
    ], [
      i,
      3,
      0.4
    ]);
    c.rotation.x = -0.68;
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
function Jo(e, t) {
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
function ei(e, t, s, a) {
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
function ti(e, t, s) {
  const a = new ct(...s.from), n = new ct(...s.to), r = n.clone().sub(a), i = r.length(), c = s.kind === "pipe", o = c ? 0.23 : 0.018, l = e.mesh(t, "cylinder", c ? f.brass : f.timber, [
    o,
    i,
    o
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (l.quaternion.setFromUnitVectors(new ct(0, 1, 0), r.normalize()), c) for (let u = 1; u < i; u += 3.7) {
    const d = a.clone().addScaledVector(r, u);
    e.mesh(t, "cylinder", f.wood, [
      0.28,
      0.16,
      0.28
    ], d.toArray()).quaternion.copy(l.quaternion), e.mesh(t, "box", f.shadow, [
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
function ai(e, t, s) {
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
    for (const c of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      c * (a / 2 - 0.3),
      0.55,
      0
    ]);
    for (let c = -1; c <= 1; c++)
      e.mesh(t, "box", f.slate, [
        0.85,
        0.17,
        1.1
      ], [
        c * 1.2,
        1.35,
        -0.3
      ]), e.mesh(t, "box", f.light, [
        0.77,
        0.025,
        0.98
      ], [
        c * 1.2,
        1.45,
        -0.3
      ]), e.mesh(t, "box", f.brass, [
        0.08,
        0.025,
        1.13
      ], [
        c * 1.2,
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
  for (let c = 0; c < r; c++) for (let o = 0; o < i; o++) {
    const l = -a / 2 + (o + 0.5) * a / i, u = -n / 2 + (c + 0.5) * n / r, d = a / i - 0.22, h = n / r - 0.24;
    if (s.kind === "fuel") {
      for (let p = 0; p < 5; p++) e.mesh(t, "box", p % 2 ? f.wood : f.timber, [
        d,
        0.2,
        h / 2 - 0.07
      ], [
        l,
        0.28 + p * 0.24,
        u + p % 2 * 0.12
      ]);
      e.mesh(t, "box", f.cloth, [
        d + 0.08,
        0.055,
        h
      ], [
        l,
        1.42,
        u
      ]);
    } else {
      const p = 0.85 + (c + o) % 3 * 0.22;
      e.mesh(t, "box", f.wood, [
        d,
        p,
        h
      ], [
        l,
        0.16 + p / 2,
        u
      ]);
      for (const v of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.11,
        p + 0.04,
        h + 0.05
      ], [
        l + v * d * 0.32,
        0.16 + p / 2,
        u
      ]);
      e.mesh(t, "box", f.light, [
        0.32,
        0.4,
        0.03
      ], [
        l,
        0.7,
        u + h / 2 + 0.02
      ]), e.mesh(t, "box", f.rose, [
        0.09,
        0.09,
        0.04
      ], [
        l,
        0.61,
        u + h / 2 + 0.045
      ]);
      for (let v = -0.25; v <= 0.25; v += 0.25) e.mesh(t, "box", f.timber, [
        d,
        0.015,
        0.016
      ], [
        l,
        p + 0.17,
        u + v * h
      ]);
      (c + o) % 3 === 0 && (e.mesh(t, "box", f.cloth, [
        d * 0.75,
        0.38,
        h * 0.55
      ], [
        l,
        p + 0.37,
        u - 0.18
      ]), e.mesh(t, "box", f.timber, [
        0.055,
        0.4,
        h * 0.57
      ], [
        l,
        p + 0.37,
        u - 0.18
      ])), e.mesh(t, "box", f.light, [
        0.32,
        0.018,
        0.45
      ], [
        l + d * 0.23,
        p + 0.19,
        u + h * 0.25
      ]);
    }
  }
}
function ni(e, t, s, a) {
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
function es(e, t, s) {
  const { width: a, depth: n } = s.footprint, r = s.tint === "rose" ? f.rose : s.tint === "amber" ? f.amber : f.leafLight, i = (c) => {
    for (const o of [-1, 1]) for (const l of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.16,
      c,
      0.16
    ], [
      o * (a / 2 - 0.3),
      c / 2,
      l * (n / 2 - 0.3)
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
      for (const c of [-1, 1]) e.mesh(t, "cylinder", f.brass, [
        0.07,
        1.35,
        0.07
      ], [
        c * (a / 2 - 0.23),
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
      for (const c of [-1, 1]) e.mesh(t, "box", f.cloth, [
        0.95,
        0.021,
        0.1
      ], [
        a / 2 + 0.65,
        0.02,
        c * (n / 2 - 0.65)
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
      for (const c of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.17,
        2.8,
        n
      ], [
        c * (a / 2 - 0.2),
        1.4,
        0
      ]);
      for (const c of [
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
          c,
          0
        ]);
        for (let o = 0; o < 4; o++) e.mesh(t, "cylinder", f.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + o * 0.6,
          c + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", f.shadow, [
          0.2,
          0.25,
          0.7
        ], [
          a * 0.32,
          c + 0.2,
          0
        ]);
      }
      break;
    case "cabinet": {
      const c = s.height ?? 2.5;
      e.mesh(t, "box", f.timber, [
        a - 0.2,
        c,
        n - 0.2
      ], [
        0,
        c / 2,
        0
      ]);
      for (let o = -a / 2 + 0.55; o < a / 2 - 0.2; o += 1) for (let l = 0.5; l < c - 0.1; l += 0.8)
        e.mesh(t, "box", f.wood, [
          0.88,
          0.68,
          0.12
        ], [
          o,
          l,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", f.brass, [
          0.055,
          0.055,
          0.06
        ], [
          o,
          l,
          n / 2 + 0.03
        ]);
      e.mesh(t, "box", f.cloth, [
        a * 0.45,
        0.13,
        n * 0.66
      ], [
        -a * 0.2,
        c + 0.075,
        0
      ]);
      for (let o = 0; o < 3; o++) e.mesh(t, "cylinder", o % 2 ? f.pottery : f.light, [
        0.15,
        0.32 + o * 0.1,
        0.15
      ], [
        a * 0.15 + o * 0.4,
        c + 0.2,
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
        for (let c = 0; c < 3; c++) e.mesh(t, "cylinder", f.brass, [
          0.15,
          1,
          0.15
        ], [
          (c - 1) * 0.7,
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
        for (const c of [-0.45, 0.45]) e.mesh(t, "cylinder", f.light, [
          0.13,
          0.19,
          0.13
        ], [
          a * 0.2 + 0.65,
          1.48,
          c
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
      for (const c of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.14,
        1.5,
        0.14
      ], [
        c * (a / 2 - 0.3),
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
      const c = a > n, o = Math.max(a, n), l = e.group(t);
      c || (l.rotation.y = Math.PI / 2);
      for (let u = -o / 2 + 0.15; u < o / 2; u += 1.4)
        e.mesh(l, "box", f.timber, [
          0.09,
          2.8,
          0.12
        ], [
          u,
          1.4,
          0
        ]), e.mesh(l, "box", f.cloth, [
          Math.min(1.27, o / 2 - u),
          2.15,
          0.055
        ], [
          u + Math.min(0.68, (o / 2 - u) / 2),
          1.53,
          0
        ]);
      for (const u of [-1, 1]) e.mesh(l, "box", f.timber, [
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
function si(e, t, s, a) {
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
  for (const l of [0.5, i - 0.1]) e.mesh(s, "box", f.wood, [
    n + 0.04,
    0.16,
    r + 0.04
  ], [
    0,
    l,
    0
  ]);
  const c = n > r, o = Math.max(n, r);
  for (let l = -o / 2 + 0.3; l < o / 2; l += 3.5) e.mesh(s, "box", f.wood, [
    c ? 0.12 : n + 0.04,
    i,
    c ? r + 0.04 : 0.12
  ], [
    c ? l : 0,
    i / 2,
    c ? 0 : l
  ]);
  if (a.id === "west-wall") {
    const l = e.group(s, [
      n / 2 + 0.04,
      2.35,
      0
    ]);
    l.rotation.y = Math.PI / 2, e.mesh(l, "box", f.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(l, "box", f.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const u of [-1, 1])
      e.mesh(l, "box", f.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        u * 0.73,
        -0.07,
        0.21
      ]), e.mesh(l, "box", f.brass, [
        0.78,
        0.06,
        0.03
      ], [
        u * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(l, "box", f.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(l, "box", f.wood, [
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
function ri(e, t) {
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
function Vs(e, t, s, a, n = 2.8) {
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
function Gs(e, t, s, a, n, r) {
  const i = s / 2 + 0.45, c = Math.atan2(r, i), o = Math.hypot(i, r);
  for (const l of [-1, 1]) {
    const u = e.group(t, [
      l * i / 2,
      n + r / 2,
      0
    ]);
    u.rotation.z = -l * c, e.mesh(u, "box", f.roof, [
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
      l * o / 2,
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
  for (const l of [-a / 2 - 0.08, a / 2 + 0.08])
    e.shape(t, [
      [-s / 2, 0],
      [s / 2, 0],
      [0, r]
    ], f.light, [
      0,
      n,
      l
    ], 0.08), e.mesh(t, "box", f.timber, [
      0.15,
      r,
      0.18
    ], [
      0,
      n + r / 2,
      l + 0.12
    ]);
}
function Ma(e, t, s, a, n, r = 1.1) {
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
function oi(e, t, s) {
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
  for (const u of [-a * 0.29, a * 0.29]) Ma(e, t, u, n / 2, 2.3, r ? 1.6 : 1.2);
  const c = e.group(t, [
    a / 2,
    0,
    0
  ]);
  c.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) Ma(e, c, u, 0.03, 2.3);
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
  ]), Gs(e, t, a, n, i, r ? 1.15 : 3.2);
  const o = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), l = r ? 2.1 : 3.3;
  if (e.mesh(o, "box", f.stone, [
    1.1,
    l,
    1.2
  ], [
    0,
    l / 2,
    0
  ]), e.mesh(o, "box", f.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    l - 0.2,
    0
  ]), e.mesh(o, "box", f.shadow, [
    0.85,
    0.04,
    0.95
  ], [
    0,
    l - 0.03,
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
    Ma(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", f.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function ii(e, t, s) {
  const a = s.height, n = s.footprint.width, r = s.tint === "amber", i = s.tint === "rose", c = r ? f.amber : i ? f.rose : f.leaf, o = r ? f.amberLight : i ? "#dfb2a1" : f.leafLight, l = e.mesh(t, "cylinder", f.timber, [
    0.24,
    a * 0.67,
    0.28
  ], [
    0,
    a * 0.33,
    0
  ]);
  l.rotation.z = 0.06;
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
    const d = u * 2.4, h = u === 8 ? 0.1 : n * 0.56, p = e.mesh(t, "crown", u % 3 ? c : o, [
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
function li(e, t, s) {
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
  for (const i of [r * 0.35, r * 0.7]) Ma(e, t, 0, n / 2 + 0.02, i, 0.7);
  Gs(e, t, a + 0.35, n + 0.35, r, r * 0.32), e.mesh(t, "cylinder", f.brass, [
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
function ci(e, t, s, a, n) {
  const r = a.footprint, i = e.group(t, [
    r.x,
    0,
    r.z
  ]), c = e.group(s, [
    r.x,
    0,
    r.z
  ]);
  switch (a.kind) {
    case "door":
      ri(e, c);
      break;
    case "screen":
      es(e, c, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      es(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      Ko(e, i, c, a);
      break;
    case "stove":
      Jo(e, i);
      break;
    case "medicine":
      ei(e, i, r.width, r.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      ai(e, i, a);
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
      ]), oi(e, c, a);
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
        const l = o * 0.9;
        e.mesh(i, "rock", f.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(l) * r.width * 0.33,
          0.2,
          Math.cos(l) * r.depth * 0.33
        ]);
      }
      ii(e, c, a);
      break;
    case "tower":
      li(e, c, a);
      break;
    case "column": {
      const o = a.height, l = Math.min(r.width, r.depth) * 0.3;
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
      ]), e.mesh(c, "cylinder", f.stone, [
        l,
        o - 1.1,
        l
      ], [
        0,
        o / 2,
        0
      ]);
      for (let u = 0; u < 10; u++) {
        const d = u * Math.PI / 5;
        e.mesh(c, "box", f.light, [
          0.085,
          o - 2,
          0.085
        ], [
          Math.sin(d) * l,
          o / 2,
          Math.cos(d) * l
        ]);
      }
      for (const u of [0.85, o - 0.7]) e.mesh(c, "cylinder", f.brass, [
        l * 1.15,
        0.18,
        l * 1.15
      ], [
        0,
        u,
        0
      ]);
      e.mesh(c, "box", f.light, [
        r.width,
        0.4,
        r.depth
      ], [
        0,
        o - 0.3,
        0
      ]), e.mesh(c, "box", f.slate, [
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
      ]), e.mesh(c, "cylinder", f.slate, [
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
      ]) e.mesh(c, "cylinder", f.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        o,
        0
      ]);
      e.mesh(c, "cylinder", f.shadow, [
        2.2,
        0.5,
        2.2
      ], [
        0,
        4.8,
        0
      ]), e.mesh(c, "torus", f.brass, [
        2.3,
        2.3,
        1.4
      ], [
        0,
        5.1,
        0
      ]).rotation.x = Math.PI / 2;
      for (let o = 0; o < 6; o++) {
        const l = o * Math.PI / 3, u = e.group(c, [
          Math.sin(l) * 2.1,
          4.8,
          Math.cos(l) * 2.1
        ]);
        u.rotation.y = l, e.shape(u, [
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
      ni(e, i, r.width, r.depth);
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
      for (const o of [-1, 1]) for (const l of [-1, 1]) e.mesh(i, "box", f.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        o * (r.width / 2 - 0.3),
        1.35,
        l * (r.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const o = a.height, l = r.width * 0.23;
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
        const d = u * Math.PI * 0.4, h = r.width * 0.25, p = e.group(c, [
          Math.sin(d) * l * 0.45,
          0,
          Math.cos(d) * l * 0.45
        ]);
        p.rotation.y = d;
        const v = e.mesh(p, "cylinder", u % 2 ? f.root : f.rootLight, [
          l * 0.65,
          o * 0.64,
          l * 0.49
        ], [
          0,
          o * 0.3,
          0
        ]);
        v.rotation.z = 0.13;
        const g = e.group(p, [
          0,
          o * 0.48,
          0
        ]);
        g.rotation.z = 0.4 + u * 0.12, e.mesh(g, "cone", f.root, [
          l * 0.47,
          o * 0.55,
          l * 0.4
        ], [
          0,
          o * 0.25,
          0
        ]);
        const w = e.mesh(p, "cone", f.root, [
          l * 0.5,
          h * 1.4,
          l * 0.4
        ], [
          h * 0.6,
          0.7,
          0
        ]);
        w.rotation.z = -1.15;
      }
      if (o > 8) {
        e.mesh(c, "rock", f.shadow, [
          l * 0.65,
          o * 0.22,
          0.35
        ], [
          0,
          o * 0.38,
          l * 0.65
        ]), e.mesh(c, "rock", f.brass, [
          l * 0.16,
          o * 0.16,
          0.15
        ], [
          0,
          o * 0.4,
          l * 0.68
        ], !0);
        for (let u = 0; u < 7; u++) e.mesh(c, "crown", u % 2 ? f.leaf : f.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(u * 2) * l,
          o * 0.55 + u * 0.4,
          Math.cos(u * 2) * l
        ]);
      }
      break;
    }
    case "arch": {
      const o = a.height;
      e.mesh(c, "arch", f.light, [
        r.width / 2 - 0.4,
        3.1,
        r.depth * 0.65
      ], [
        0,
        o - 3,
        0
      ]), e.mesh(c, "box", f.brass, [
        0.8,
        1.4,
        r.depth * 0.75
      ], [
        0,
        o + 0.2,
        0
      ]);
      for (const l of [-1, 1]) {
        const u = e.group(c, [
          l * (r.width / 2 - 0.5),
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
        si(e, i, c, a);
        break;
      }
      const o = a.height, l = Math.min(o, 0.65);
      a.wallUse === "homes" && Xo(e, c, r), e.mesh(i, "box", f.mortar, [
        r.width,
        l,
        r.depth
      ], [
        0,
        l / 2,
        0
      ]), o > l && e.mesh(c, "box", n ? f.marble : f.stone, [
        r.width,
        o - l,
        r.depth
      ], [
        0,
        (o + l) / 2,
        0
      ]), e.mesh(c, "box", f.light, [
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
        for (const h of [1.1, o - 0.55]) e.mesh(c, "box", f.light, [
          r.width + 0.15,
          0.22,
          r.depth + 0.15
        ], [
          0,
          h,
          0
        ]);
        for (let h = -d / 2 + 3; h < d / 2 - 1; h += 6) for (const p of [-1, 1]) {
          const v = e.group(c, [
            u ? h : p * (r.width / 2 + 0.04),
            0,
            u ? p * (r.depth / 2 + 0.04) : h
          ]);
          v.rotation.y = u ? p < 0 ? Math.PI : 0 : p * Math.PI / 2;
          const g = o * 0.61, w = Math.min(2.1, o * 0.3);
          e.mesh(v, "box", f.undercroft, [
            1.5,
            w,
            0.05
          ], [
            0,
            g,
            0
          ]);
          for (const x of [
            -0.55,
            0,
            0.55
          ]) e.mesh(v, "box", f.shadow, [
            0.07,
            w,
            0.06
          ], [
            x,
            g,
            0.06
          ]);
          for (const x of [-1, 1]) e.mesh(v, "box", f.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            g + x * w / 2,
            0.06
          ]);
          e.mesh(v, "box", f.stone, [
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
        o > 4 && e.mesh(c, "box", f.stone, u ? [
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
        for (let p = 0; p < Math.floor(o / 0.9); p++) e.mesh(c, "box", f.mortar, u ? [
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
        const l = Math.sin(o * 7.3) * (r.width / 2 - 0.8), u = Math.cos(o * 3.7) * (r.depth / 2 - 0.3);
        e.mesh(i, "box", f.ripple, [
          0.4 + o % 4 * 0.3,
          0.012,
          0.04
        ], [
          l,
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
      for (let o = -r.width / 2 + 0.65; o < r.width / 2; o += 1) for (let l = -r.depth / 2 + 0.6; l < r.depth / 2; l += 0.95) {
        const u = Math.sin(o * 7 + l * 19), d = r.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? f.leafLight : f.leaf, [
          d,
          0.32 + u * 0.1,
          d * 0.9
        ], [
          o + u * 0.15,
          0.81,
          l
        ]), u > 0.5 && e.mesh(i, "rock", u > 0.8 ? f.light : f.rose, [
          0.1,
          0.12,
          0.1
        ], [
          o + 0.1,
          1.13,
          l
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
      for (let o = -r.width / 2 + 0.7; o < r.width / 2; o += 1.3) for (let l = -r.depth / 2 + 0.65; l < r.depth / 2; l += 1.25) {
        const u = Math.sin(o * 13 + l * 7), d = 0.6 + u * 0.2;
        e.mesh(i, "crown", u > 0 ? f.leaf : f.leafLight, [
          0.7,
          d,
          0.7
        ], [
          o,
          d * 0.75,
          l
        ]), u > 0.75 && e.mesh(i, "rock", f.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          o,
          d * 1.65,
          l
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
        for (let l = 0; l < 3; l++) e.mesh(i, "box", f.wood, [
          0.12,
          0.24,
          r.depth - 1
        ], [
          o * (r.width / 2 - 0.5),
          1.4 + l * 0.29,
          0
        ]);
        for (const l of [-r.depth * 0.28, r.depth * 0.28]) {
          if (a.damaged && o < 0 && l > 0) {
            e.mesh(i, "torus", f.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -r.width / 2 + 0.8,
              0.18,
              l
            ]).rotation.x = Math.PI / 2, e.mesh(i, "box", f.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -r.width / 2 + 0.8,
              0.18,
              l
            ]), e.mesh(i, "box", f.wood, [
              0.1,
              0.1,
              1.1
            ], [
              -r.width / 2 + 0.8,
              0.18,
              l
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
            l
          ]).rotation.y = Math.PI / 2;
          for (let u = 0; u < 4; u++) {
            const d = e.mesh(i, "box", f.wood, [
              0.09,
              1.25,
              0.09
            ], [
              o * (r.width / 2 - 0.2),
              0.76,
              l
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
        const l = e.group(i, [
          o % 2 * 1.5 - 0.75,
          o === 3 ? 1.3 : 0,
          o < 2 ? -0.7 : 0.7
        ]);
        e.mesh(l, "box", f.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const u of [-1, 1]) e.mesh(l, "box", f.timber, [
          0.1,
          1.25,
          1.3
        ], [
          u * 0.43,
          0.6,
          0
        ]);
        e.mesh(l, "box", f.light, [
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
        const l = -r.width * 0.3 + o * r.width * 0.3, u = (a.height ?? 3) * (1 - o * 0.22), d = r.width * 0.11;
        e.mesh(c, "cylinder", f.stone, [
          d,
          u,
          d
        ], [
          l,
          u / 2 + 0.3,
          -r.depth * 0.2
        ]), e.mesh(c, "box", f.light, [
          d * 2.6,
          0.25,
          d * 2.6
        ], [
          l,
          u + 0.3,
          -r.depth * 0.2
        ]);
        for (let h = 0; h < 6; h++) {
          const p = h * Math.PI / 3;
          e.mesh(c, "box", f.mortar, [
            0.055,
            u * 0.8,
            0.055
          ], [
            l + Math.sin(p) * d,
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
  return c.children.length > 0;
}
var la = 1e-7;
function un(e, t, s) {
  return (t[0] - e[0]) * (s[1] - e[1]) - (t[1] - e[1]) * (s[0] - e[0]);
}
function ts(e, t, s, a) {
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const i = e[r], c = e[(r + 1) % e.length], o = un(t, s, i), l = un(t, s, c), u = a ? o >= -1e-7 : o <= la, d = a ? l >= -1e-7 : l <= la;
    if (u && n.push(i), u !== d && Math.abs(o - l) > la) {
      const h = o / (o - l);
      n.push([i[0] + (c[0] - i[0]) * h, i[1] + (c[1] - i[1]) * h]);
    }
  }
  return n;
}
function Ys(e) {
  return Math.abs(e.reduce((t, s, a) => t + s[0] * e[(a + 1) % e.length][1] - s[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function di(e, t) {
  let s = e;
  const a = [];
  for (let n = 0; n < t.length && s.length >= 3; n++) {
    const r = t[n], i = t[(n + 1) % t.length], c = ts(s, r, i, !1);
    Ys(c) > la && a.push(c), s = ts(s, r, i, !0);
  }
  return a;
}
function ui(e, t, s) {
  const a = t[0] - e[0], n = t[1] - e[1], r = s / (2 * Math.hypot(a, n)), i = -n * r, c = a * r;
  return [
    [e[0] + i, e[1] + c],
    [e[0] - i, e[1] - c],
    [t[0] - i, t[1] - c],
    [t[0] + i, t[1] + c]
  ];
}
function Qs(e, t) {
  const s = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) s.push(ui(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, r] of a.points.slice(1, -1)) s.push(Array.from({ length: 12 }, (i, c) => {
      const o = c * Math.PI / 6, l = (a.width + t) / 2;
      return [n + Math.cos(o) * l, r + Math.sin(o) * l];
    }));
  }
  return s;
}
function hi(e, t = 0) {
  const s = Qs(e, t), a = [];
  for (let n = 0; n < s.length; n++) {
    let r = [s[n]];
    for (let i = 0; i < n && r.length; i++) r = r.flatMap((c) => di(c, s[i]));
    a.push(...r.filter((i) => Ys(i) > la));
  }
  return a;
}
function fi(e, t, s, a) {
  const n = s === "marble", r = s === "street";
  for (const [o, l, u] of [[
    0.4,
    0.025,
    n ? f.brass : r ? f.streetSeam : f.mortar
  ], [
    0,
    0.04,
    n ? f.slate : r ? f.streetStone : f.stone
  ]]) for (const d of hi(t, o)) {
    const h = d.reduce((g, w) => g + w[0], 0) / d.length, p = d.reduce((g, w) => g + w[1], 0) / d.length, v = e.shape(a(h, p), d.map((g) => [g[0], -g[1]]), u, [
      0,
      l,
      0
    ]);
    v.rotation.x = -Math.PI / 2, v.castShadow = !1;
  }
  const i = Qs(t, 0.4);
  let c = 0;
  for (const o of t) {
    for (let l = 1; l < o.points.length; l++, c++) {
      const u = o.points[l - 1], d = o.points[l], h = d[0] - u[0], p = d[1] - u[1], v = Math.hypot(h, p);
      for (let g = 1.5; g < v; g += 1.65) {
        const w = u[0] + h * g / v, x = u[1] + p * g / v;
        if (i.some((S, b) => b !== c && S.every((y, _) => un(y, S[(_ + 1) % S.length], [w, x]) >= -1e-7))) continue;
        const M = e.mesh(a(w, x), "box", n ? f.shadow : r ? f.streetSeam : f.mortar, [
          o.width - 0.08,
          0.012,
          0.025
        ], [
          w,
          0.049,
          x
        ]);
        if (M.rotation.y = Math.atan2(h, p), M.castShadow = !1, r) {
          const S = e.mesh(a(w, x), "box", f.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            w + Math.cos(g) * 0.55,
            0.049,
            x
          ]);
          S.rotation.y = Math.atan2(h, p), S.castShadow = !1;
        }
      }
    }
    c += o.points.length - 2;
  }
}
function pi(e, t) {
  const s = e.x - e.width / 2, a = s + e.width, n = e.z - e.depth / 2, r = n + e.depth, i = Math.max(s, t.x - t.width / 2), c = Math.min(a, t.x + t.width / 2), o = Math.max(n, t.z - t.depth / 2), l = Math.min(r, t.z + t.depth / 2);
  return i >= c || o >= l ? [e] : [
    [
      s,
      n,
      a,
      o
    ],
    [
      s,
      l,
      a,
      r
    ],
    [
      s,
      o,
      i,
      l
    ],
    [
      c,
      o,
      a,
      l
    ]
  ].filter(([u, d, h, p]) => h > u && p > d).map(([u, d, h, p]) => ({
    x: (u + h) / 2,
    z: (d + p) / 2,
    width: h - u,
    depth: p - d
  }));
}
function as(e, t, s) {
  const a = s[0] - t[0], n = s[1] - t[1], r = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * r, e.y - t[1] - n * r);
}
function mi(e, t, s) {
  const a = [], n = /* @__PURE__ */ new Map(), r = [], i = new yr(), c = new ct(), o = new Sr(), l = [];
  function u(b, y) {
    const _ = `${Math.floor(b / 16)}:${Math.floor(y / 16)}`;
    let P = n.get(_);
    return P || (P = e.group(t), n.set(_, P)), P;
  }
  let d = [s.bounds];
  for (const b of s.features.filter((y) => y.kind === "water")) d = d.flatMap((y) => pi(y, b.footprint));
  const h = s.surface === "grass", p = s.surface === "marble", v = s.surface === "street", g = s.surface === "boards", w = g ? f.wood : h ? f.grass : v ? f.street : s.surface === "wet" ? f.wetStone : p ? f.marble : f.stone;
  for (const b of d)
    if (e.mesh(u(b.x, b.z), "box", w, [
      b.width,
      0.6,
      b.depth
    ], [
      b.x,
      -0.32,
      b.z
    ]).castShadow = !1, g) for (let y = b.x - b.width / 2; y < b.x + b.width / 2; y += 1) for (let _ = b.z - b.depth / 2; _ < b.z + b.depth / 2; _ += 4) {
      const P = Math.min(4, b.z + b.depth / 2 - _);
      e.mesh(u(y, _), "box", Jn[Math.abs(y + _) % Jn.length], [
        0.985,
        0.018,
        P - 0.025
      ], [
        y + 0.5,
        -9e-3,
        _ + P / 2
      ]).castShadow = !1;
    }
    else if (!h && !v) for (let y = b.x - b.width / 2; y < b.x + b.width / 2; y += 4) for (let _ = b.z - b.depth / 2; _ < b.z + b.depth / 2; _ += 4) {
      const P = Math.min(4, b.x + b.width / 2 - y), A = Math.min(4, b.z + b.depth / 2 - _), j = p ? Math.round(y / 4 + _ / 4) % 2 ? f.marble : f.marbleLight : w;
      e.mesh(u(y, _), "box", j, [
        P - 0.04,
        0.018,
        A - 0.04
      ], [
        y + P / 2,
        -9e-3,
        _ + A / 2
      ]).castShadow = !1;
    }
  if (fi(e, s.roads, s.surface, u), v) for (let b = 0; b < 320; b++) {
    const y = s.bounds.x + Math.sin(b * 127.13) * (s.bounds.width / 2 - 3), _ = s.bounds.z + Math.cos(b * 53.71) * (s.bounds.depth / 2 - 3), P = {
      x: y,
      y: _
    };
    if (s.features.some((C) => tn(P, C.footprint))) continue;
    const A = Math.min(...s.roads.flatMap((C) => C.points.slice(1).map((U, T) => as(P, C.points[T], U))));
    if (A < 2 || A > 9) continue;
    const j = e.mesh(u(y, _), "box", b % 3 ? f.streetSeam : f.streetStone, [
      0.4 + b % 3 * 0.18,
      0.025,
      0.25
    ], [
      y,
      -2e-3,
      _
    ]);
    j.rotation.y = b * 0.41, j.castShadow = !1;
  }
  if (p) {
    const b = u(0, -17);
    for (const y of [
      4,
      4.4,
      5.5
    ]) e.ring(b, f.brass, y, 0, -17, 1, !1, 0.09);
    for (let y = 0; y < 12; y++) {
      const _ = y * Math.PI / 6;
      e.shape(b, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], f.brass, [
        Math.sin(_) * 4.6,
        0.095,
        -17 + Math.cos(_) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, _);
    }
  }
  for (const b of s.suspended ?? []) {
    const y = e.group(t);
    ti(e, y, b), a.push(e.bake(y)), r.push({
      root: y,
      bounds: new _a().setFromObject(y).expandByScalar(0.1)
    });
  }
  const { bounds: x } = s;
  for (let b = 0; b < (h ? 420 : 0); b++) {
    const y = x.x + Math.sin(b * 127.13) * (x.width / 2 - 3), _ = x.z + Math.cos(b * 53.71) * (x.depth / 2 - 3), P = {
      x: y,
      y: _
    };
    if (s.features.some((j) => tn(P, {
      ...j.footprint,
      width: j.footprint.width + 1.5,
      depth: j.footprint.depth + 1.5
    })) || s.roads.some((j) => j.points.slice(1).some((C, U) => as(P, j.points[U], C) < j.width / 2 + 1))) continue;
    const A = u(y, _);
    if (b % 4 === 0) {
      const j = Array.from({ length: 9 }, (U, T) => {
        const H = T * Math.PI * 2 / 9, Y = 1 + Math.sin(T * 7 + b) * 0.3;
        return [Math.cos(H) * Y * (1.2 + b % 3), Math.sin(H) * Y * (0.7 + b % 2)];
      }), C = e.shape(A, j, b % 8 ? f.grassDark : f.grassLight, [
        y,
        5e-3,
        _
      ]);
      C.rotation.x = -Math.PI / 2;
    } else {
      for (let j = 0; j < 3; j++) {
        const C = e.mesh(A, "cone", b % 3 ? f.grassDark : f.leafLight, [
          0.035,
          0.3 + j * 0.09,
          0.035
        ], [
          y + (j - 1) * 0.16,
          0.15,
          _
        ]);
        C.rotation.z = (j - 1) * 0.35;
      }
      b % 11 === 0 && e.mesh(A, "rock", f.light, [
        0.12,
        0.13,
        0.12
      ], [
        y,
        0.38,
        _
      ]);
    }
  }
  for (const b of s.features) {
    const y = b.footprint, _ = y.width > y.depth, P = Math.max(y.width, y.depth), A = b.kind === "wall" ? Math.ceil(P / 7) : 1, j = e.group(t);
    j.name = b.id;
    for (let C = 0; C < A; C++) {
      const U = -P / 2 + (C + 0.5) * P / A, T = A === 1 ? y : {
        ...y,
        x: y.x + (_ ? U : 0),
        z: y.z + (_ ? 0 : U),
        width: _ ? P / A : y.width,
        depth: _ ? y.depth : P / A
      }, H = A === 1 ? j : e.group(j);
      ci(e, u(T.x, T.z), H, {
        ...b,
        footprint: T
      }, s.vista === "interior") ? (a.push(e.bake(H)), r.push({
        root: H,
        bounds: new _a().setFromObject(H).expandByScalar(0.35)
      })) : H.removeFromParent();
    }
  }
  for (const b of s.roads.slice(0, 1)) for (let y = 1; y < b.points.length; y++) {
    const [_, P] = b.points[y];
    if (!(s.vista === "camp" && Math.hypot(_, P - 8) < 13))
      for (const A of [-1, 1]) Vs(e, u(_, P), _ + A * (b.width / 2 + 0.6), P);
  }
  const M = e.group(t), S = s.vista === "interior" || s.vista === "room";
  if (e.mesh(M, "box", S ? f.undercroft : f.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, s.vista === "camp") for (let b = 0; b < 13; b++) {
    const y = -55 - b % 2 * 6, _ = -44 + b * 7, P = 7 + b % 3 * 2;
    e.mesh(M, "box", f.distantWall, [
      10,
      P,
      6.5
    ], [
      y,
      P / 2,
      _
    ]);
    const A = e.mesh(M, "box", f.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      y,
      P,
      _
    ]);
    A.rotation.z = -0.16;
    for (let j = -1; j <= 1; j++) e.mesh(M, "box", b % 4 ? f.shadow : f.ember, [
      0.05,
      0.7,
      0.6
    ], [
      y + 5.03,
      P - 1.7,
      _ + j * 1.6
    ], b % 4 === 0);
  }
  for (let b = 0; b < (S ? 0 : 12); b++) {
    const y = (b % 2 ? 1 : -1) * (x.width / 2 + 15 + b % 3 * 8), _ = x.z - 25 + b * 7;
    e.mesh(M, "crown", b % 3 ? f.distantGround : f.distantLeaf, [
      17 + b % 4 * 3,
      6 + b % 3 * 2,
      22
    ], [
      y,
      -3,
      _
    ]);
  }
  for (let b = 0; b < (S || s.vista === "garden" ? 0 : 9); b++) {
    const y = (b - 4) * 12, _ = x.z - x.depth / 2 - 15 - b % 3 * 6, P = 9 + b % 4 * 3;
    e.mesh(M, "box", f.distantWall, [
      9,
      P,
      9
    ], [
      y,
      P / 2 - 2,
      _
    ]), e.mesh(M, "cone", f.distantRoof, [
      7,
      6,
      7
    ], [
      y,
      P + 1,
      _
    ]);
    for (let A = -1; A <= 1; A++) e.mesh(M, "box", f.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      y + A * 2.2,
      P - 4,
      _ + 4.55
    ]);
  }
  if (!S && s.vista !== "garden") {
    const b = x.z - x.depth / 2 - 28;
    e.mesh(M, "cylinder", f.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      b
    ]);
    for (const y of [
      10,
      22,
      33
    ]) e.mesh(M, "cylinder", f.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      y,
      b
    ]);
    for (let y = 0; y < 6; y++) {
      const _ = y * Math.PI / 3, P = -17 + Math.sin(_) * 8.8, A = b + Math.cos(_) * 8.8;
      e.mesh(M, "box", f.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        P,
        19,
        A
      ]);
      const j = e.mesh(M, "box", f.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(_) * 9.02,
        26,
        b + Math.cos(_) * 9.02
      ], !0);
      j.rotation.y = _;
    }
    e.mesh(M, "cylinder", f.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      b
    ]), e.mesh(M, "cone", f.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      b
    ]);
  }
  a.push(e.bake(M));
  for (const b of n.values()) a.push(e.bake(b));
  return {
    update(b, y) {
      i.direction.copy(c.set(Math.sin(y), rt.height / rt.distance, Math.cos(y)).normalize());
      for (const _ of r) {
        l.length = 0;
        for (const P of [0.1, 1.6])
          if (i.origin.set(b.x, P, b.y), o.ray.copy(i), i.intersectsBox(_.bounds) && o.intersectObject(_.root, !0, l), l.length) break;
        _.root.visible = l.length === 0;
      }
    },
    dispose() {
      a.forEach((b) => b()), t.clear();
    }
  };
}
function vi(e, t, s, a, n, r, i = !0) {
  const c = r.has("captives_arrived"), o = e.group(t, [
    a,
    0,
    n
  ]), l = e.group(t), u = s === "sanniang", d = s === "laobai", h = s === "kouzi";
  o.rotation.y = u ? 0.25 : -0.35, i && (h || s === "anian") && (o.position.y = -0.3), o.scale.setScalar(d ? 1.24 : h ? 1.06 : s === "anian" ? 1.19 : 1.12);
  const p = u ? "#343d59" : d ? "#596a80" : h ? "#53617a" : "#79647d", v = "#615047", g = "#dfbaa0", w = d ? 0.39 : h ? 0.25 : 0.29, x = d ? 0.31 : 0.23, M = [];
  for (const F of [-1, 1]) {
    const Z = e.group(o, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    Z.rotation.x = i && (h || s === "anian") ? -1.15 : F * 0.06, M.push(Z), e.mesh(Z, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(Z, "cylinder", v, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(Z, "sphere", v, [
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
    w,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(o, "cylinder", p, [
    x,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(o, "cylinder", v, [
    x + 0.015,
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
  ]), e.mesh(o, "cylinder", g, [
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
  S.rotation.x = u ? 0.1 : -0.025, e.mesh(S, "sphere", g, [
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
    ]), e.mesh(S, "sphere", g, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(S, "sphere", g, [
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
      F * w,
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
    ]), e.mesh(Z, "cylinder", g, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(Z, "sphere", g, [
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
    ], 0.018), e.mesh(o, "box", v, [
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
    ]), c && i) {
      o.position.y = 0.5;
      const F = e.mesh(l, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        a,
        0.72,
        n
      ]);
      F.rotation.z = Math.PI / 2;
      for (const Z of [-1, 1]) e.mesh(l, "box", "#637b7c", [
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
      const Q = e.mesh(o, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + Z * 0.02,
        1.02,
        0.31 + Z * 0.023
      ]);
      Q.rotation.z = Z * 0.1;
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
    F.rotation.z = -0.55, e.mesh(o, "box", v, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const y = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  S.removeFromParent(), M.forEach((F) => F.removeFromParent());
  const _ = M.map((F) => e.bake(F)), P = e.bake(o), A = e.bake(S), j = e.bake(l);
  o.add(S, ...M);
  const C = o.position.y, U = o.rotation.y, T = {
    x: a,
    y: n
  };
  let H = -1 / 0, Y = 0;
  return {
    root: o,
    ring: y,
    id: s,
    position: T,
    seated: i,
    locate(F, Z) {
      const Q = T.x !== F.position.x || T.y !== F.position.y;
      return Q && (H = Z), Y = F.facing, T.x = F.position.x, T.y = F.position.y, o.position.x = T.x, o.position.z = T.y, y.position.x = T.x, y.position.z = T.y, Q;
    },
    update(F, Z, Q) {
      const le = Z - H < 120, Ye = Math.hypot(F.x - T.x, F.y - T.y) < 10;
      y.visible = Ye;
      const tt = le ? Math.PI / 2 - Y : Ye ? Math.atan2(F.x - T.x, F.y - T.y) : U, ke = Math.atan2(Math.sin(tt - o.rotation.y), Math.cos(tt - o.rotation.y));
      o.rotation.y += Q ? ke : ke * 0.16, o.position.y = C + (Q ? 0 : Math.sin(Z * 15e-4 + a) * 0.012), S.rotation.y = Q ? 0 : Math.sin(Z * 8e-4 + n) * 0.04, i || M.forEach((de, xe) => {
        de.rotation.x = Q || !le ? 0 : Math.sin(Z * 0.012 + xe * Math.PI) * 0.45;
      });
    },
    dispose() {
      P(), A(), j(), _.forEach((F) => F()), o.removeFromParent(), l.removeFromParent(), y.removeFromParent();
    }
  };
}
function gi(e, t, s, a) {
  const n = e.group(t), r = Qt[s.id], i = Object.values(Fe).find((d) => d.scene === s.id);
  let c = a, o = !1;
  const l = (r?.waves[0] ?? []).map((d) => {
    const h = Rn(e, n, d.kind, Za[0]);
    h.bar.removeFromParent();
    const p = s.anchors[d.anchor], v = i?.sentryExits[d.anchor], g = v ? s.anchors[v] : p, w = a.has(r.complete) ? g : p;
    return h.root.position.set(w.x, 0, w.y), {
      ...h,
      home: p,
      aside: g,
      dispose: e.bake(h.root)
    };
  }), u = () => {
    n.visible = !o && !!r && (!!i || !c.has(r.complete));
  };
  return u(), {
    setFacts(d) {
      c = d, u();
    },
    setEncounterActive(d) {
      o = d, u();
    },
    animate(d) {
      if (!n.visible) return !1;
      let h = !1;
      for (const p of l) {
        const v = c.has(r.complete) ? p.aside : p.home, g = v.x - p.root.position.x, w = v.y - p.root.position.z, x = Math.hypot(g, w);
        if (x < 1e-3) continue;
        const M = d ? 1 : Math.min(1, 0.36 / x);
        p.root.position.x += g * M, p.root.position.z += w * M, p.root.rotation.y = x > 0.4 ? Math.atan2(g, w) : 0, h = !0;
      }
      return h;
    },
    dispose() {
      l.forEach((d) => d.dispose()), n.removeFromParent();
    }
  };
}
function bi(e, t, s, a) {
  const n = Fe[s], r = Rn(e, t, n.kind, Za[0]);
  r.bar.removeFromParent();
  const i = e.bake(r.root), c = { ...Ca(s, a) };
  r.root.position.set(c.x, 0, c.y);
  let o = a;
  return {
    id: s,
    root: r.root,
    position: c,
    setFacts(l) {
      o = l;
    },
    update(l, u) {
      const d = Ca(s, o), h = l.x - d.x, p = l.y - d.y, v = Math.hypot(h, p), g = v <= n.approachRadius, w = g && !o.has(n.complete) ? 1 : 0, x = d.x + (v ? h / v * w : 0), M = d.y + (v ? p / v * w : 0), S = c.x + c.y + r.root.rotation.y;
      c.x += u ? x - c.x : (x - c.x) * 0.22, c.y += u ? M - c.y : (M - c.y) * 0.22, Math.abs(x - c.x) + Math.abs(M - c.y) < 0.01 && (c.x = x, c.y = M);
      const b = g ? Math.atan2(h, p) : 0, y = Math.atan2(Math.sin(b - r.root.rotation.y), Math.cos(b - r.root.rotation.y));
      return r.root.rotation.y += u || Math.abs(y) < 5e-3 ? y : y * 0.2, r.root.position.set(c.x, 0, c.y), S !== c.x + c.y + r.root.rotation.y;
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
}), Ks = {
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
    name: se.households.innkeeper,
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
}, yi = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, wi = 0.85;
function ns(e, t) {
  const s = e.route;
  if (s.length === 1) return {
    position: s[0].position,
    facing: s[0].facing,
    walking: !1
  };
  const a = s.map((r, i) => {
    const c = s[(i + 1) % s.length].position;
    return r.wait + Math.hypot(c.x - r.position.x, c.y - r.position.y) / wi;
  });
  let n = (t + e.phase) % a.reduce((r, i) => r + i, 0);
  for (let r = 0; r < s.length; r++) {
    if (n > a[r]) {
      n -= a[r];
      continue;
    }
    const i = s[r], c = s[(r + 1) % s.length].position;
    if (n <= i.wait) return {
      position: i.position,
      facing: i.facing,
      walking: !1
    };
    const o = (n - i.wait) / (a[r] - i.wait);
    return {
      position: {
        x: i.position.x + (c.x - i.position.x) * o,
        y: i.position.y + (c.y - i.position.y) * o
      },
      facing: Math.atan2(c.x - i.position.x, c.y - i.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function xi(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function Mi(e, t) {
  e.updateWorldMatrix(!0, !0);
  const s = e.matrixWorld.clone().invert(), a = new vs(), n = [];
  e.traverse((c) => {
    if (!(c instanceof vt)) return;
    const o = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(a.multiplyMatrices(s, c.matrixWorld)), l = c.material.color, u = new Rr(new Float32Array(o.getAttribute("position").count * 3), 3);
    for (let d = 0; d < u.count; d++) u.setXYZ(d, l.r, l.g, l.b);
    o.setAttribute("color", u), n.push(o);
  });
  const r = xs(n);
  if (n.forEach((c) => c.dispose()), !r) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new vt(r, t);
  return i.receiveShadow = !0, e.add(i), () => {
    r.dispose(), e.clear();
  };
}
function _i(e, t, s, a) {
  const n = e.group(t), r = e.group(n), i = [], c = [], o = {
    blue: f.slate,
    rose: f.rose,
    cream: f.cloth
  }[s.coat], l = s.activity === "mend" || s.activity === "warm", u = "#dfbda7", d = l ? 0.75 : 1.05;
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
    const v = e.group(n, [
      p * 0.36,
      d + 0.22,
      0
    ]);
    i.push(v), e.mesh(v, "box", o, [
      0.17,
      0.44,
      0.19
    ], [
      0,
      -0.2,
      0
    ]), e.mesh(v, "crown", u, [
      0.1,
      0.11,
      0.1
    ], [
      0,
      -0.46,
      0.02
    ]);
    const g = e.group(n, [
      p * 0.16,
      d - 0.31,
      0
    ]);
    c.push(g), e.mesh(g, "box", f.timber, [
      0.2,
      l ? 0.3 : 0.59,
      0.22
    ], [
      0,
      l ? -0.12 : -0.26,
      l ? 0.2 : 0
    ]), e.mesh(g, "box", f.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      l ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (l && e.mesh(r, "box", f.wood, [
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
    ...c
  ].map((p) => Mi(p, a));
  return {
    root: n,
    body: r,
    arms: i,
    legs: c,
    dispose() {
      h.forEach((p) => p()), n.removeFromParent();
    }
  };
}
function ki(e, t, s) {
  const a = new gs({
    vertexColors: !0,
    roughness: 0.95
  }), n = (Ks[s] ?? []).map((c) => ({
    spec: c,
    model: _i(e, t, c, a),
    time: 0
  }));
  let r = null, i = null;
  return {
    animate(c, o, l, u) {
      const d = l ? 0 : xi(r, o);
      r = o;
      let h = n.length > 0 && i !== l;
      i = l;
      for (const p of n) {
        const { spec: v, model: g } = p, w = ns(v, p.time), x = Math.hypot(w.position.x - c.x, w.position.y - c.y) < 27 && u(w.position);
        if (g.root.visible !== x && (g.root.visible = x, h = !0), !x) continue;
        p.time += d;
        const M = ns(v, p.time), S = l ? 0 : Math.sin(p.time * (M.walking ? 5.5 : 1.5) + v.phase);
        g.root.position.set(M.position.x, 0, M.position.y), g.root.rotation.y = M.facing, g.body.position.y = M.walking ? Math.abs(S) * 0.035 : 0, g.legs.forEach((b, y) => {
          b.rotation.x = M.walking ? S * 0.35 * (y ? 1 : -1) : 0;
        }), g.arms.forEach((b, y) => {
          b.rotation.x = M.walking ? S * 0.24 * (y ? -1 : 1) : -0.6 + S * 0.13 * (y ? 1 : -1), v.activity === "deliver" && (b.rotation.x = -0.75), v.activity === "warm" && (b.rotation.x = -1.1), v.activity === "cook" && !y && (b.rotation.x = -0.8 + S * 0.3);
        }), h = d > 0 || h;
      }
      return h;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function Si(e, t, s, a) {
  const n = mi(e, t, s.landscape), r = e.group(t), i = e.group(t), c = gi(e, t, s, a), o = ki(e, i, s.id), l = [], u = ja.filter((g) => Fe[g].scene === s.id).map((g) => bi(e, i, g, a));
  let d = -1, h = null, p = null;
  function v(g) {
    const w = [...g].sort().join("/");
    if (w === p) return;
    p = w, u.forEach((M) => M.setFacts(g)), h?.(), c.setFacts(g);
    for (const M of Ea(s, g)) {
      const S = M.position;
      if (M.kind === "exit") {
        if (!M.target.doorway) for (const b of [-1, 1]) Vs(e, r, S.x + b * 1.7, S.y, 1.5);
        e.mesh(r, "box", f.brass, [
          3,
          0.025,
          0.35
        ], [
          S.x,
          0.12,
          S.y
        ]).castShadow = !1;
      } else if (M.target.kind === "inspect" && M.target.passage === "warning")
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
      else if (M.target.kind === "inspect" && M.target.passage === "orders") {
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
        for (let y = -1; y <= 1; y++) e.mesh(r, "cylinder", f.brass, [
          0.12,
          0.12,
          0.12
        ], [
          S.x + y * 0.45,
          0.95,
          S.y - 0.55
        ]);
      }
    }
    if (s.id === "camp") {
      const M = s.landscape.features.find((S) => S.kind === "clinic").footprint;
      if (g.has("clinic_helped")) {
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
      if (g.has("receiving_arranged")) for (const S of [-1, 1]) {
        const b = M.x + S * 2.4, y = M.z + M.depth / 2 - 0.2, _ = e.group(r, [
          b,
          0.2,
          y
        ]);
        _.rotation.x = -0.16;
        for (const P of [-1, 1]) e.mesh(_, "cylinder", f.timber, [
          0.055,
          2.9,
          0.055
        ], [
          P * 0.42,
          1.4,
          0
        ]);
        e.mesh(_, "box", g.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const P of [0.7, 2.1]) e.mesh(_, "box", f.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          P,
          0.12
        ]);
      }
      if (g.has("warden_defeated")) {
        const S = s.landscape.features.find((b) => b.kind === "wagon").footprint;
        for (let b = 0; b < 4; b++) {
          const y = e.group(r, [
            S.x + (b % 2 ? 0.65 : -0.65),
            1.4,
            S.z + (b < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(y, "box", f.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const _ of [-1, 1]) e.mesh(y, "box", f.brass, [
            0.08,
            0.78,
            1.22
          ], [
            _ * 0.35,
            0.38,
            0
          ]);
          e.mesh(y, "box", f.light, [
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
    for (const M of s.objects) {
      if (M.kind !== "switch") continue;
      const S = s.anchors[M.anchor], b = g.has(M.fact), y = e.group(r, [
        S.x,
        0,
        S.y
      ]);
      e.mesh(y, "box", f.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(y, "box", f.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const _ = e.group(y, [
        0,
        0.75,
        0
      ]);
      _.rotation.z = b ? 0.65 : -0.65, e.mesh(_, "cylinder", f.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(_, "cylinder", f.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const x = Ct(s, g);
    for (const M of s.landscape.gates) {
      const S = M.footprint, b = S.width > S.depth, y = Math.max(S.width, S.depth), _ = e.group(r, [
        S.x,
        0,
        S.z
      ]);
      b || (_.rotation.y = Math.PI / 2);
      for (const P of [-1, 1]) e.mesh(_, "box", f.stone, [
        0.35,
        3.2,
        0.7
      ], [
        P * y / 2,
        1.6,
        0
      ]);
      if (e.mesh(_, "box", f.light, [
        y + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), x.closedGates.has(M.id)) {
        for (let P = -y / 2 + 0.2; P < y / 2; P += 0.4) e.mesh(_, "box", f.shadow, [
          0.065,
          3,
          0.1
        ], [
          P,
          1.5,
          0
        ]);
        for (const P of [0.4, 2.5]) e.mesh(_, "box", f.brass, [
          y,
          0.12,
          0.15
        ], [
          0,
          P,
          0
        ]);
      } else e.mesh(_, "box", f.shadow, [
        y,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const M of s.landscape.features) {
      if (M.kind !== "beacon" || g.has("alarm_silenced")) continue;
      const S = M.footprint, b = e.mesh(r, "cylinder", f.timber, [
        0.045,
        4.8,
        0.045
      ], [
        S.x + 3.3,
        2.7,
        S.z + 2.5
      ]);
      b.rotation.z = -0.32;
      for (let y = 0; y < 5; y++) e.mesh(r, "rock", y % 2 ? f.ember : f.cloth, [
        0.55,
        1.2 + y % 3 * 0.3,
        0.55
      ], [
        S.x + Math.sin(y * 2) * 0.7,
        5.4 + y % 3 * 0.3,
        S.z + Math.cos(y * 2) * 0.7
      ], !0);
    }
    h = e.bake(r);
  }
  return v(a), {
    setFacts: v,
    people: l,
    parleyPeople: u,
    setPeople(g, w) {
      let x = !1;
      for (const M of dt) {
        const S = g[M], b = La[M].station, y = Me[b.scene].anchors[b.anchor], _ = S.mode === "idle" && (S.scene === "cells" || S.scene === b.scene && Math.hypot(S.position.x - y.x, S.position.y - y.y) < 1);
        let P = l.find((A) => A.id === M);
        P && (S.scene !== s.id || P.seated !== _) && (P.dispose(), l.splice(l.indexOf(P), 1), P = void 0, x = !0), S.scene === s.id && (P || (P = vi(e, i, M, S.position.x, S.position.y, new Set(p?.split("/")), _), l.push(P), x = !0), x = P.locate(S, w) || x);
      }
      return x;
    },
    setEncounterActive(g) {
      c.setEncounterActive(g), u.forEach((w) => {
        w.root.visible = !g;
      });
    },
    update: n.update,
    animate(g, w, x, M) {
      const S = Math.floor(w / 80);
      if (S === d) return !1;
      d = S;
      let b = c.animate(x);
      b = o.animate(g, w, x, M) || b;
      for (const y of u) b = y.update(g, x) || b;
      for (const y of l) Math.hypot(y.position.x - g.x, y.position.y - g.y) < 22 ? (y.update(g, w, x), b = !x || b) : y.ring.visible = !1;
      return b;
    },
    dispose() {
      o.dispose(), l.splice(0).forEach((g) => g.dispose()), u.forEach((g) => g.dispose()), i.removeFromParent(), h?.(), c.dispose(), n.dispose();
    }
  };
}
var Ri = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, $i = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Ci = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, zi = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Pi(e, t) {
  const s = new mr(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  let i = 0, c = !1;
  function o(l, u) {
    i++;
    const d = s.load(l, (h) => {
      if (c) {
        h.dispose();
        return;
      }
      i--, r.delete(l);
      for (const p of u) a.set(p, h);
      e(), t(r.size, i);
    }, void 0, () => {
      c || (i--, n.delete(d), d.dispose(), r.set(l, u), t(r.size, i));
    });
    d.colorSpace = bn, d.wrapS = d.wrapT = $r, d.anisotropy = 2, n.add(d);
  }
  for (const [l, u] of [
    [Ri, [
      f.stone,
      f.wetStone,
      f.marble,
      f.marbleLight
    ]],
    [$i, [f.light]],
    [Ci, [f.roof, f.roofLight]],
    [zi, [
      f.grass,
      f.grassLight,
      f.grassDark
    ]]
  ]) o(l, u);
  return {
    maps: a,
    retry() {
      if (!c && i === 0) {
        for (const [l, u] of r) o(l, u);
        t(r.size, i);
      }
    },
    dispose() {
      c = !0, n.forEach((l) => l.dispose()), n.clear(), a.clear(), r.clear();
    }
  };
}
function Ii(e, t, s) {
  const a = new bs({
    antialias: !0,
    alpha: !1,
    powerPreference: s.world ? "default" : "high-performance"
  });
  a.outputColorSpace = bn, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, s.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const r = new ms(), i = new ys(-10, 10, 10, -10, 0.1, 180), c = dn();
  r.add(new ws("#effbff", "#74918a", 2));
  const o = new Xa("#fff4e5", 1.9);
  o.position.set(-12, 25, 13), o.castShadow = !0;
  const l = s.world ? 1024 : 1536;
  o.shadow.mapSize.set(l, l), Object.assign(o.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), o.shadow.bias = -4e-4, o.shadow.normalBias = 0.035, o.shadow.radius = 3, r.add(o);
  const u = new Xa("#c3edff", 1.1);
  u.position.set(7, 8, -15), r.add(u);
  const d = new sa(), h = new sa(), p = new sa();
  r.add(d, h, p);
  const v = Hs(c, h, s.traveler.gender), g = Yo(c, p), w = Vo(c, p), x = Qo(n), M = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), b = [], y = matchMedia("(prefers-reduced-motion: reduce)"), _ = new ct(), P = new ct();
  let A = null, j = "", C = "", U = "", T = null, H = null, Y = null, F = NaN, Z = NaN, Q = NaN, le = null, Ye = 0, tt = 0, ke = 1, de = 1, xe = !0, ut = !1, zt = !1, We = 0, Be = -1, Qe = 0, Re = !1;
  const he = s.world ? Pi(() => {
    j = "", xe = !0, s.invalidate?.();
  }, (ve, at) => s.artworkStatus?.(ve, at)) : null;
  function He() {
    const ve = e.getBoundingClientRect();
    ke = Math.max(1, ve.width), de = Math.max(1, ve.height), a.setSize(ke, de, !1), xe = !0, Re = !1, s.invalidate?.();
  }
  const Ae = new ResizeObserver(He);
  Ae.observe(e), He();
  function fa(ve) {
    ve.preventDefault(), zt = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", fa);
  function Pt(ve, at, Ve, ht, Ke = !1) {
    if (Math.abs(ve) < 1) return;
    const B = document.createElement("span");
    B.className = Ke ? "exp-damage is-player" : ve < 0 ? "exp-damage is-heal" : "exp-damage", B.textContent = `${ve < 0 ? "+" : ""}${Math.ceil(Math.abs(ve))}`, n.append(B), b.push({
      element: B,
      position: new ct(at, 2, Ve),
      born: ht
    });
  }
  function Kt() {
    for (const ve of M.values())
      h.remove(ve.actor.root), ve.marker.remove();
    M.clear(), b.splice(0).forEach((ve) => ve.element.remove());
  }
  function pa(ve) {
    return Re ? (P.set(ve.x, 1, ve.y).project(i), Math.abs(P.x) < 1.15 && Math.abs(P.y) < 1.15) : !0;
  }
  return {
    draw(ve, at, Ve, ht = "battle", Ke = 0, B) {
      if (ut || zt) return;
      const Na = performance.now(), V = ht === "battle" ? ve : null, Da = V?.tick ?? (y.matches ? 0 : Ke * 0.025), Ut = (V?.tick ?? -1) !== Be, Xt = `${at.weapon}/${at.outfit}/${Ve}`;
      if (!B && !xe && ht === C && Xt === U && V === T && (!Ut && V || !V && (ht === "between" || y.matches || Ke - We < 40))) return;
      We = Ke;
      const Jt = Za[Ve], ma = B ? B.definition.id : `${Ve}:${V?.boss ?? !1}:${!!V}`;
      if (ma !== j) {
        if (S.forEach((J) => J.remove()), S.clear(), A?.(), B) {
          const J = dn(he?.maps);
          H = Si(J, d, B.definition, B.facts);
          const ae = H;
          A = () => {
            ae.dispose(), J.dispose();
          };
        } else
          H = null, A = Fo(c, d, Ve, V);
        Re = !1, j = ma, r.background = new gn(Jt.sky), r.fog = new vr(Jt.haze, 42, 95);
      } else B && le !== B.facts && H?.setFacts(B.facts);
      (!!V != !!T || V && T && V.tick < Be) && (Kt(), Qe = V?.player.hp ?? 0);
      const ea = !B && ht !== "battle", nt = ke < 600, ta = nt || de < 400, Nt = ke / de, O = B?.definition.landscape.vista === "room", D = O ? nt ? 20 : Math.max(30, Nt * (de < 400 ? 19 : 25)) : B ? (nt ? rt.mobileWidth : Math.max(rt.minimumWidth, Nt * (de < 400 ? rt.shortSpan : rt.tallSpan))) * (B.definition.safe && !V ? rt.settlementScale : 1) : ea ? nt ? 13 : 28 : nt ? 18.5 : Math.max(27, Nt * (de < 400 ? 14 : 23)), L = Math.max(0, K.arena - D / 2 + 0.5), Se = B ? B.location.position.x * (O ? 0.4 : 1) : V ? ta ? V.player.x * 0.62 : Math.max(-L, Math.min(L, V.player.x * 0.62)) : nt ? 0 : 5.5, It = B ? O ? B.location.position.y * 0.4 - 1 : B.location.position.y - rt.lead : V ? V.player.y * (ta ? 0.62 : 0.2) - 0.4 : nt ? -4.2 : -11.8;
      B && Math.hypot(F - B.location.position.x, Z - B.location.position.y) > 8 && (Re = !1);
      const aa = Math.abs(_.x - Se) + Math.abs(_.z - It) < 0.015, ar = B && H?.setPeople(B.people, Ke), nr = B && H?.animate(B.location.position, Ke, y.matches, pa);
      if (B && !xe && Re && aa && Xt === U && V === T && !Ut && F === B.location.position.x && Z === B.location.position.y && Q === B.location.facing && le === B.facts && !nr && !ar) return;
      !Re || y.matches ? (_.set(Se, 0, It), Re = !0) : (_.x += (Se - _.x) * 0.14, _.z += (It - _.z) * 0.14), i.left = -D / 2, i.right = D / 2, i.top = D / Nt / 2, i.bottom = -i.top;
      const Fa = ea ? 0 : 1 * Math.PI / 4, Cn = B ? rt.distance : 25;
      i.position.set(_.x + Math.sin(Fa) * Cn, B ? rt.height : 28, _.z + Math.cos(Fa) * Cn), i.lookAt(_.x, 0, _.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), B && (H?.setEncounterActive(!!V), H?.update(B.location.position, Fa)), S.forEach((J) => {
        J.hidden = !0;
      });
      const sr = new Set(B && !V ? [...Mn(B.definition, B.location.position, B.facts, B.people), ...Oa(B.definition.id, B.location.position, B.facts)].map((J) => J.target.id) : []);
      for (const J of [...H?.people ?? [], ...H?.parleyPeople ?? []]) {
        if (V || !B || Math.hypot(J.position.x - B.location.position.x, J.position.y - B.location.position.y) > 10) continue;
        let ae = S.get(J.id);
        ae || (ae = document.createElement("span"), ae.className = "exp-person-name", ae.textContent = qe(J.id), n.append(ae), S.set(J.id, ae)), ae.textContent = sr.has(J.id) ? `${qe(J.id)} · ${se.actions.talk}` : qe(J.id), P.set(J.position.x, 2.9 + J.root.position.y, J.position.y).project(i);
        const Oe = (P.x * 0.5 + 0.5) * ke, ft = (-P.y * 0.5 + 0.5) * de;
        ae.hidden = Oe < 30 || Oe > ke - 30 || ft < 20 || ft > de - 20, ae.style.transform = `translate(${Oe}px,${ft}px) translate(-50%,-100%)`;
      }
      s.world && (o.position.set(_.x - 12, 25, _.z + 13), o.target.position.set(_.x, 0, _.z), o.target.updateMatrixWorld());
      const rr = B ? {
        ...B.location.position,
        facing: B.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      v.update(V?.player ?? rr, at.weapon, at.outfit, Da, y.matches, ea, !!V?.effects.some((J) => J.kind === "resonance"));
      for (const J of V?.enemies ?? []) {
        let ae = M.get(J.id);
        if (!ae) {
          const Wa = document.createElement("i");
          Wa.className = _e(J.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Wa), ae = {
            actor: Rn(c, h, J.kind, Jt),
            hp: J.hp,
            death: null,
            marker: Wa
          }, M.set(J.id, ae);
        }
        ae.hp > J.hp && Ut && Pt(ae.hp - J.hp, J.x, J.y, V.tick), ae.hp = J.hp, ae.actor.update(J, V.tick, y.matches), ae.actor.bar.quaternion.copy(i.quaternion), P.set(J.x, 1.2, J.y).project(i);
        const Oe = (P.x * 0.5 + 0.5) * ke, ft = (-P.y * 0.5 + 0.5) * de, Pn = Math.min(18, ke / 2), In = Math.min(nt ? 132 : 95, de * 0.3), or = Math.max(In, de - Math.min(130, de * 0.3)), Ba = Math.max(Pn, Math.min(ke - Pn, Oe)), qa = Math.max(In, Math.min(or, ft));
        ae.marker.hidden = Math.abs(Oe - Ba) + Math.abs(ft - qa) < 10, ae.marker.style.transform = `translate(${Ba}px,${qa}px) rotate(${Math.atan2(ft - qa, Oe - Ba) + Math.PI / 2}rad)`;
      }
      for (const [J, ae] of M) {
        if (V?.enemies.some((ft) => ft.id === J)) continue;
        ae.death === null && (ae.death = V?.tick ?? 0, V && ae.hp > 0 && Pt(ae.hp, ae.actor.root.position.x, ae.actor.root.position.z, V.tick));
        const Oe = ((V?.tick ?? 0) - ae.death) / 12;
        ae.actor.bar.visible = !1, ae.marker.hidden = !0, ae.actor.root.scale.setScalar(Math.max(0, 1 - Oe)), (Oe >= 1 || !V || y.matches) && (h.remove(ae.actor.root), ae.marker.remove(), M.delete(J));
      }
      V && Ut && (Qe !== V.player.hp && Pt(Qe - V.player.hp, V.player.x, V.player.y, V.tick, Qe > V.player.hp), Qe = V.player.hp), g.update(V, y.matches);
      const zn = V?.effects.filter((J) => J.kind === "ward-hit").at(-1);
      w.update(V?.player ?? null, zn ? Math.max(0, (zn.life - 5) / 10) : 0), x.update(V, i, ke, de);
      for (let J = b.length - 1; J >= 0; J--) {
        const ae = b[J], Oe = ((V?.tick ?? 0) - ae.born) / 27;
        if (Oe >= 1 || !V) {
          ae.element.remove(), b.splice(J, 1);
          continue;
        }
        P.copy(ae.position), P.y += y.matches ? 0 : Oe * 0.9, P.project(i), ae.element.style.transform = `translate(${(P.x * 0.5 + 0.5) * ke}px,${(-P.y * 0.5 + 0.5) * de}px)`, ae.element.style.opacity = String(Math.min(1, (1 - Oe) * 3));
      }
      a.render(r, i), Ye++, tt += performance.now() - Na, B && Y !== B.definition.id && (Y = B.definition.id, s.sceneReady?.(Y)), xe = !1, C = ht, U = Xt, T = V, Be = V?.tick ?? -1, B && (F = B.location.position.x, Z = B.location.position.y, Q = B.location.facing, le = B.facts);
    },
    invalidate() {
      xe = !0, s.invalidate?.();
    },
    retryArtwork() {
      he?.retry();
    },
    stats() {
      return {
        draws: Ye,
        submitMs: tt,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      ut = !0, Ae.disconnect(), a.domElement.removeEventListener("webglcontextlost", fa), Kt(), v.dispose(), x.dispose(), w.dispose(), A?.(), he?.dispose(), o.shadow.dispose(), c.dispose(), r.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function hn(e) {
  if (e.kind === "exit") return `${se.actions.travel} ${se.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${se.actions.talk} · ${se.people[t.person]}`;
    case "enemy":
      return `${se.actions.talk} · ${qe(t.enemy)}`;
    case "inspect":
      return se.passages[t.passage].title;
    case "rest":
      return se.actions.rest;
    case "switch":
      return se.switches[t.fact];
  }
}
var Ei = ["aria-label"], Ai = { class: "journey-heading" }, Li = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, Ti = ["disabled"], ji = {
  key: 1,
  class: "journey-controls"
}, Oi = ["aria-label"], Zi = {
  key: 0,
  class: "journey-interaction"
}, Ui = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Ni = {
  key: 0,
  class: "journey-resource"
}, Di = [
  "max",
  "value",
  "aria-label"
], Fi = ["disabled"], Bi = ["disabled"], qi = {
  key: 2,
  class: "journey-overlay"
}, Wi = /* @__PURE__ */ je({
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
    const a = e, n = s, r = q(null), i = q(null), c = q({
      x: 0,
      y: 0
    }), o = q(null), l = q({
      failed: 0,
      pending: 0
    }), u = X(() => a.battle ? [] : [
      ...Oa(a.world.definition.id, a.world.location.position, a.world.facts),
      ...vo(a.world.definition, a.world.location, a.world.facts),
      ...Mn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), d = X(() => u.value.find((Z) => Z.target.id === o.value) ?? null), h = X(() => a.weapon === "grimoire" ? ne.contractPower : ne.resource);
    let p = null, v = null, g = 0, w = 0, x = 0, M = !1, S = !0;
    const b = Do((Z, Q) => {
      c.value = {
        x: Z * 26,
        y: Q * 26
      }, v?.stick(Z, Q);
    }, () => r.value?.focus({ preventScroll: !0 }));
    function y() {
      b.clear(), v?.clear(), x = 0;
    }
    function _() {
      y(), n("pause");
    }
    function P() {
      p?.retryArtwork();
    }
    function A() {
      document.hidden ? (cancelAnimationFrame(g), g = 0, _()) : (p?.invalidate(), j());
    }
    function j() {
      !g && !M && S && (w = 0, g = requestAnimationFrame(F));
    }
    function C() {
      !a.paused && d.value && (y(), n("interact", d.value.target.id));
    }
    function U(Z) {
      (!Z || Z.detail === 0) && v?.dash();
    }
    function T(Z) {
      (!Z || Z.detail === 0) && v?.skill();
    }
    function H(Z, Q) {
      Z.button === 0 && v?.[Q]();
    }
    function Y() {
      const Z = u.value.findIndex((Q) => Q.target.id === o.value);
      o.value = u.value[(Z + 1) % u.value.length]?.target.id ?? null;
    }
    function F(Z) {
      if (g = 0, M || !S) return;
      !a.paused && !document.hidden && (g = requestAnimationFrame(F));
      const Q = w ? Math.min(100, Z - w) : 0;
      if (w = Z, !a.paused && !document.hidden)
        for (x += Q; x >= 1e3 / K.hz && !a.paused; ) {
          x -= 1e3 / K.hz;
          const le = v.frame();
          if (le.skill && !a.battle) {
            C();
            break;
          }
          n("input", le);
        }
      else x = 0;
      if (!document.hidden) try {
        p?.draw(a.battle ?? null, a, 0, "battle", Z, a.world);
      } catch (le) {
        cancelAnimationFrame(g), g = 0, y(), n("error", le);
      }
    }
    return me(u, (Z) => {
      Z.some((Q) => Q.target.id === o.value) || (o.value = Z[0]?.target.id ?? null);
    }, { immediate: !0 }), me(() => a.world.definition.id, () => {
      y(), o.value = u.value[0]?.target.id ?? null, r.value?.focus({ preventScroll: !0 });
    }), me(() => a.paused, (Z) => {
      y(), j(), Z || r.value?.focus({ preventScroll: !0 });
    }), me(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.weapon,
      a.outfit
    ], j), Zt(() => {
      try {
        p = Ii(i.value, () => {
          _(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: j,
          sceneReady: (Z) => n("ready", Z),
          artworkStatus: (Z, Q) => {
            l.value = {
              failed: Z,
              pending: Q
            };
          }
        });
      } catch (Z) {
        n("error", Z);
        return;
      }
      v = No(r.value, _, () => {
      }), document.addEventListener("visibilitychange", A), j(), r.value?.focus({ preventScroll: !0 });
    }), mn(() => {
      S = !1, cancelAnimationFrame(g), g = 0, _();
    }), us(() => {
      S = !0, j();
    }), $t(() => {
      M = !0, cancelAnimationFrame(g), y(), v?.dispose(), document.removeEventListener("visibilitychange", A), p?.dispose();
    }), t({
      stats: () => p?.stats(),
      focus: () => r.value?.focus({ preventScroll: !0 })
    }), (Z, Q) => (z(), I("section", {
      ref_key: "root",
      ref: r,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? m(ne).controls : m(se).actions.controls
    }, [
      k("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      k("header", Ai, [k("h1", null, R(m(se).scenes[e.world.definition.id]), 1), Ln(Z.$slots, "status", {}, void 0, !0)]),
      l.value.failed ? (z(), I("div", Li, [k("span", null, R(m(se).artwork.unavailable), 1), k("button", {
        type: "button",
        disabled: l.value.pending > 0,
        onClick: P
      }, R(l.value.pending ? m(se).artwork.loading : m(se).artwork.retry), 9, Ti)])) : G("", !0),
      e.paused ? G("", !0) : (z(), I("div", ji, [
        k("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": m(se).actions.move,
          onPointerdown: Q[0] || (Q[0] = mt((...le) => m(b).down && m(b).down(...le), ["prevent"])),
          onPointermove: Q[1] || (Q[1] = mt((...le) => m(b).move && m(b).move(...le), ["prevent"])),
          onPointerup: Q[2] || (Q[2] = (...le) => m(b).release && m(b).release(...le)),
          onPointercancel: Q[3] || (Q[3] = (...le) => m(b).release && m(b).release(...le)),
          onLostpointercapture: Q[4] || (Q[4] = (...le) => m(b).release && m(b).release(...le)),
          onContextmenu: Q[5] || (Q[5] = mt(() => {
          }, ["prevent"]))
        }, [k("span", { style: Gt({ transform: `translate(${c.value.x}px, ${c.value.y}px)` }) }, null, 4)], 40, Oi),
        d.value ? (z(), I("div", Zi, [k("button", {
          type: "button",
          class: "journey-act",
          onClick: C
        }, [Q[9] || (Q[9] = k("kbd", null, "E", -1)), ze(R(m(hn)(d.value)), 1)]), u.value.length > 1 ? (z(), I("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: Y
        }, R(m(se).actions.next), 1)) : G("", !0)])) : G("", !0),
        e.battle ? (z(), I("div", Ui, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? (z(), I("div", Ni, [
            k("span", null, R(e.battle.player.resonance > 0 ? m(ne).resonanceActive : h.value), 1),
            k("meter", {
              min: "0",
              max: m(it).maxPower,
              value: e.battle.player.resource,
              "aria-label": h.value
            }, null, 8, Di),
            k("small", null, R(e.battle.player.resonance > 0 ? m(ne).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : G("", !0),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: Q[6] || (Q[6] = mt((le) => H(le, "dash"), ["prevent"])),
            onClick: U
          }, [
            k("kbd", null, R(m(ne).dashKey), 1),
            ze(R(m(ne).dash), 1),
            k("small", null, R(e.battle.player.dash > 0 ? m(ne).secondsLeft(e.battle.player.dash) : m(ne).ready), 1)
          ], 40, Fi),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: Q[7] || (Q[7] = mt((le) => H(le, "skill"), ["prevent"])),
            onClick: T
          }, [
            k("kbd", null, R(m(ne).skillKey), 1),
            ze(R(m(_t)[e.weapon].action), 1),
            k("small", null, R(e.battle.player.skill > 0 ? m(ne).secondsLeft(e.battle.player.skill) : m(ne).ready), 1)
          ], 40, Bi)
        ])) : G("", !0)
      ])),
      e.paused && !e.transitioning ? (z(), I("div", qi, [Ln(Z.$slots, "overlay", {}, () => [k("button", {
        class: "journey-act",
        type: "button",
        onClick: Q[8] || (Q[8] = (le) => n("resume"))
      }, R(m(se).actions.resume), 1)], !0)])) : G("", !0)
    ], 8, Ei));
  }
}), Hi = /* @__PURE__ */ Ge(Wi, [["__scopeId", "data-v-a7e66cb8"]]);
function Vi(e) {
  const t = new Set(e.location.visited.map(ra)), s = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const r = ra(n);
    for (const i of Ea(Me[n], s)) {
      if (i.kind !== "exit") continue;
      const c = ra(i.target.to), o = [r, c].sort().join("/");
      r !== c && (t.add(c), a.set(o, {
        id: o,
        from: r,
        to: c
      }));
    }
  }
  return {
    scenes: [...t],
    links: [...a.values()]
  };
}
function Xs(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function Gi(e, t) {
  const s = Xs(t), a = 3 * s, n = [], r = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let c = r(i), o = -1;
    for (let l = 0; l <= 48; l++) {
      const u = Math.ceil(l / 8) * 5.2 * s, d = l * Math.PI / 4, h = r({
        x: i.x + Math.cos(d) * u,
        y: i.y + Math.sin(d) * u
      }), p = Math.min(1 / 0, ...n.map((v) => Math.hypot(v.x - h.x, v.y - h.y)));
      if (p > o && (c = h, o = p), p >= 5.2 * s) break;
    }
    n.push(c);
  }
  return n;
}
var Yi = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, Qi = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, Ki = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, Xi = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, Ji = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, el = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, tl = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, al = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, nl = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, sl = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, rl = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, ol = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, il = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, ll = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, cl = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, dl = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, ul = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, hl = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, fl = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, fn = {
  city: Yi,
  cityMobile: Qi,
  chapter: Ki
}, pl = {
  blade: Xi,
  bow: Ji,
  staff: el,
  daggers: tl,
  grimoire: al,
  cannon: nl
}, pn = {
  camp: sl,
  crossroads: rl,
  gate: ol,
  beacon: il,
  waterway: ll,
  cells: cl,
  hall: dl,
  roots: ul
}, ss = {
  arrival: hl,
  ending: fl
}, ml = { class: "ember-map-header" }, vl = ["src"], gl = ["aria-pressed"], bl = ["viewBox", "aria-label"], yl = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], wl = ["transform"], xl = ["fill"], Ml = {
  y: "22",
  "text-anchor": "middle"
}, _l = ["viewBox", "aria-label"], kl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Sl = ["points", "stroke-width"], Rl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], $l = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Cl = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], zl = [
  "cx",
  "cy",
  "r",
  "fill"
], Pl = ["x", "y"], Il = {
  key: 2,
  class: "ember-map-key"
}, El = {
  key: 3,
  class: "ember-map-places"
}, Al = /* @__PURE__ */ je({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, a = t, n = q(!1), r = q(null), i = q(!1), c = q(null), o = q({
      width: 400,
      height: 400
    }), l = new ResizeObserver((b) => {
      for (const y of b) {
        const { width: _, height: P } = y.contentRect;
        y.target === r.value ? i.value = _ > P * 1.55 : o.value = {
          width: _,
          height: P
        };
      }
    });
    me(c, (b, y) => {
      y && l.unobserve(y), b && l.observe(b);
    }), Zt(() => {
      l.observe(r.value);
    }), $t(() => l.disconnect());
    const u = {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 10],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70]
    }, d = X(() => Vi(s.campaign)), h = X(() => Object.fromEntries(d.value.scenes.map((b) => {
      const [y, _] = u[b], { width: P, height: A } = o.value;
      return [b, i.value ? [50 + (104 - _) / 104 * (P - 100), 10 + (y - 10) / 80 * (A - 40)] : [45 + y / 104 * (P - 90), 10 + _ / 104 * (A - 40)]];
    }))), p = X(() => d.value.links), v = X(() => Me[s.campaign.location.scene]), g = X(() => v.value.landscape.bounds), w = X(() => Xs(g.value)), x = X(() => `${g.value.x - g.value.width / 2 - 5 * w.value} ${g.value.z - g.value.depth / 2 - 5 * w.value} ${g.value.width + 10 * w.value} ${g.value.depth + 10 * w.value}`), M = X(() => Zs(s.campaign)), S = X(() => {
      const b = Gi(M.value.map((y) => y.position), g.value);
      return M.value.map((y, _) => ({
        ...y,
        marker: b[_]
      }));
    });
    return (b, y) => (z(), I("div", {
      ref_key: "root",
      ref: r,
      class: lt(["ember-map", {
        "ember-map-wide": i.value,
        "ember-map-local": !n.value
      }])
    }, [
      k("div", ml, [
        m(pn)[v.value.id] ? (z(), I("img", {
          key: 0,
          src: m(pn)[v.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, vl)) : G("", !0),
        k("h2", null, R(n.value ? m(N).chapterMap : m(se).scenes[v.value.id]), 1),
        k("div", null, [k("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: y[0] || (y[0] = (_) => n.value = !n.value)
        }, R(n.value ? m(N).localMap : m(N).chapterMap), 9, gl), k("button", {
          type: "button",
          onClick: y[1] || (y[1] = (_) => a("close"))
        }, R(m(N).close), 1)])
      ]),
      n.value ? (z(), I("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": m(N).chapterMap,
        class: "ember-route-map"
      }, [(z(!0), I(ee, null, Ie(p.value, (_) => (z(), I("line", {
        key: _.id,
        x1: h.value[_.from][0],
        y1: h.value[_.from][1],
        x2: h.value[_.to][0],
        y2: h.value[_.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(_.from) && e.campaign.location.visited.includes(_.to) ? void 0 : "4 4"
      }, null, 8, yl))), 128)), (z(!0), I(ee, null, Ie(h.value, (_, P) => (z(), I("g", {
        key: P,
        transform: `translate(${_.join(",")})`
      }, [
        k("circle", {
          r: "6",
          fill: P === m(ra)(v.value.id) ? "#bf6242" : e.campaign.location.visited.includes(P) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, xl),
        k("text", Ml, R(e.campaign.location.visited.includes(P) ? m(se).scenes[P] : m(N).unknownArea), 1),
        k("title", null, R(e.campaign.location.visited.includes(P) ? m(se).scenes[P] : m(N).unknownArea), 1)
      ], 8, wl))), 128))], 8, bl)) : (z(), I("svg", {
        key: 1,
        viewBox: x.value,
        role: "img",
        "aria-label": m(se).scenes[v.value.id]
      }, [
        k("rect", {
          x: g.value.x - g.value.width / 2,
          y: g.value.z - g.value.depth / 2,
          width: g.value.width,
          height: g.value.depth,
          rx: "2",
          fill: v.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, kl),
        (z(!0), I(ee, null, Ie(v.value.landscape.roads, (_, P) => (z(), I("polyline", {
          key: P,
          points: _.points.map((A) => A.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": _.width,
          "stroke-linejoin": "round"
        }, null, 8, Sl))), 128)),
        (z(!0), I(ee, null, Ie(v.value.landscape.features, (_) => (z(), I("rect", {
          key: _.id,
          x: _.footprint.x - _.footprint.width / 2,
          y: _.footprint.z - _.footprint.depth / 2,
          width: _.footprint.width,
          height: _.footprint.depth,
          fill: _.kind === "water" ? "#6eb8c6" : _.kind === "tree" || _.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Rl))), 128)),
        k("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * w.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": w.value
        }, [k("title", null, R(m(N).here), 1)], 8, $l),
        (z(!0), I(ee, null, Ie(S.value, (_, P) => (z(), I("g", { key: _.target.id }, [
          k("line", {
            x1: _.position.x,
            y1: _.position.y,
            x2: _.marker.x,
            y2: _.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * w.value
          }, null, 8, Cl),
          k("circle", {
            cx: _.marker.x,
            cy: _.marker.y,
            r: 2.4 * w.value,
            fill: _.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, zl),
          k("text", {
            class: "ember-map-number",
            style: Gt({ fontSize: `${3.4 * w.value}px` }),
            x: _.marker.x,
            y: _.marker.y + 1.1 * w.value,
            "text-anchor": "middle"
          }, R(P + 1), 13, Pl),
          k("title", null, R(m(hn)(_)), 1)
        ]))), 128))
      ], 8, _l)),
      n.value ? (z(), I("p", Il, R(m(N).mapKey), 1)) : (z(), I("ol", El, [(z(!0), I(ee, null, Ie(M.value, (_) => (z(), I("li", { key: _.target.id }, R(m(hn)(_)), 1))), 128))]))
    ], 2));
  }
}), Ll = /* @__PURE__ */ Ge(Al, [["__scopeId", "data-v-4b7b0a2d"]]), rs = {
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
}, Tl = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, jl = ["d"], Ol = ["d"], Zl = /* @__PURE__ */ je({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, s) => (z(), I("svg", Tl, [k("path", {
      d: m(rs)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, jl), k("path", {
      d: m(rs)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Ol)]));
  }
}), Et = Zl, Ul = { class: "exp-wardrobe" }, Nl = { class: "exp-fitting-body" }, Dl = { class: "exp-preview-stage" }, Fl = ["aria-label"], Bl = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, ql = { class: "exp-preview-tools" }, Wl = ["aria-label"], Hl = ["disabled"], Vl = { class: "exp-outfit-info" }, Gl = { class: "exp-muted" }, Yl = { class: "exp-fitting-actions" }, Ql = {
  key: 0,
  class: "exp-muted"
}, Kl = ["disabled"], Xl = { key: 2 }, Jl = { class: "exp-purchase-confirm" }, ec = ["disabled"], tc = ["disabled"], ac = ["aria-label"], nc = ["aria-pressed", "onClick"], sc = ["src"], rc = /* @__PURE__ */ je({
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
    const s = e, a = t, n = q(s.data.equippedOutfit), r = q(!1), i = q(0), c = q(!1), o = q(null), l = q(null), u = q({}), d = X(() => ot[n.value]), h = X(() => Qa(s.data, n.value)), p = X(() => Cr.find((A) => Ja[A].awardKey === d.value.achievement)), v = X(() => Ms.filter((A) => Qa(s.data, A) || ot[A].achievement === null || Object.values(Qt).some((j) => j.boss && Ja[j.boss].awardKey === ot[A].achievement)));
    let g = null, w = !0, x = 0, M = () => {
    };
    me([
      n,
      i,
      () => s.weapon
    ], () => {
      w = !0, M(), r.value = !1;
    });
    function S(A) {
      n.value = A, l.value?.scrollTo({ top: 0 });
    }
    function b() {
      x = performance.now() + 1100, w = !0, M();
    }
    function y() {
      r.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function _() {
      w = !0;
      let A;
      try {
        A = new bs({
          antialias: !0,
          alpha: !1
        });
      } catch {
        c.value = !0;
        return;
      }
      A.outputColorSpace = bn, A.toneMapping = 7, A.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const j = new ms(), C = dn(), U = new sa(), T = Hs(C, U, s.traveler.gender);
      j.background = new gn("#d1e0e1"), j.add(U, new ws("#fff6e3", "#627c93", 2.7));
      const H = new Xa("#fff6e0", 3);
      H.position.set(-3, 5, 6), j.add(H);
      const Y = new ys(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new _a();
      function Z(he) {
        T.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, he, 0, !0, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = -0.2, T.root.scale.setScalar(1.35);
      }
      for (const he of v.value)
        Z(he), F.union(new _a().setFromObject(U));
      const Q = F.getSize(new ct()), le = F.getCenter(new ct()), Ye = Q.y * 0.5 + Q.z * 0.1 + 0.2, tt = Math.hypot(Q.x, Q.z) * 0.5 + 0.2;
      Y.position.set(0, le.y + 0.8, 7), Y.lookAt(0, le.y, 0);
      function ke(he) {
        const He = Math.max(Ye, tt / he);
        Y.left = -He * he, Y.right = -Y.left, Y.top = He, Y.bottom = -He, Y.updateProjectionMatrix();
      }
      ke(1), A.setSize(144, 144, !1);
      try {
        for (const he of v.value)
          Z(he), A.render(j, Y), u.value[he] = A.domElement.toDataURL("image/png");
      } catch {
        c.value = !0, T.dispose(), C.dispose(), j.clear(), A.dispose(), A.forceContextLoss();
        return;
      }
      o.value.append(A.domElement);
      let de = 0, xe = 1, ut = 1;
      const zt = new ResizeObserver(() => {
        const he = o.value.getBoundingClientRect();
        xe = Math.max(1, he.width), ut = Math.max(1, he.height), A.setSize(xe, ut, !1), ke(xe / ut), w = !0, M();
      });
      zt.observe(o.value);
      const We = matchMedia("(prefers-reduced-motion: reduce)");
      function Be(he) {
        he.preventDefault(), c.value = !0, cancelAnimationFrame(de), de = 0;
      }
      A.domElement.addEventListener("webglcontextlost", Be);
      function Qe(he) {
        if (de = 0, c.value || document.hidden || !w && (he > x || We.matches)) return;
        const He = he < x && !We.matches, Ae = he * 0.03;
        T.update({
          x: He ? Math.sin(Ae * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: He ? 8 - Ae % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, n.value, Ae, We.matches, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = Number(i.value) * Math.PI / 180, T.root.scale.setScalar(1.35);
        try {
          A.render(j, Y), w = !1;
        } catch {
          c.value = !0;
        }
        He && !c.value && M();
      }
      M = () => {
        !de && !c.value && !document.hidden && (de = requestAnimationFrame(Qe));
      };
      function Re() {
        document.hidden ? (cancelAnimationFrame(de), de = 0) : (w = !0, M());
      }
      document.addEventListener("visibilitychange", Re), M(), g = () => {
        M = () => {
        }, cancelAnimationFrame(de), zt.disconnect(), document.removeEventListener("visibilitychange", Re), A.domElement.removeEventListener("webglcontextlost", Be), T.dispose(), C.dispose(), j.clear(), A.dispose(), A.forceContextLoss(), A.domElement.remove();
      };
    }
    function P() {
      g?.(), g = null, c.value = !1, _();
    }
    return Zt(_), $t(() => g?.()), (A, j) => (z(), I("div", Ul, [k("section", {
      ref_key: "fitting",
      ref: l,
      class: "exp-fitting"
    }, [k("div", Nl, [k("div", Dl, [k("div", {
      ref_key: "host",
      ref: o,
      class: "exp-outfit-preview",
      "aria-label": m(qt)[n.value].name
    }, [c.value ? (z(), I("div", Bl, [k("p", null, R(m(ne).presentationError.rendering), 1), k("button", {
      type: "button",
      onClick: P
    }, R(m(N).reload), 1)])) : G("", !0)], 8, Fl), k("div", ql, [k("label", null, [ze(R(m(ne).rotate), 1), At(k("input", {
      "onUpdate:modelValue": j[0] || (j[0] = (C) => i.value = C),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": m(ne).rotate
    }, null, 8, Wl), [[vn, i.value]])]), k("button", {
      type: "button",
      disabled: c.value,
      onClick: b
    }, R(m(ne).previewAction), 9, Hl)])]), k("div", Vl, [
      k("h3", null, R(m(qt)[n.value].name), 1),
      k("p", null, R(m(qt)[n.value].detail), 1),
      k("p", Gl, R(m(ne).wardrobeNote), 1)
    ])]), k("div", Yl, [m(Dn)(e.data.active) ? G("", !0) : (z(), I("p", Ql, R(m(N).safeWardrobe), 1)), h.value ? (z(), I("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !m(Dn)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: j[1] || (j[1] = (C) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, R(e.data.equippedOutfit === n.value ? m(ne).equipped : m(ne).equip), 9, Kl)) : p.value ? (z(), I("p", Xl, R(m(ne).unlockWeapon(m(en)[p.value])), 1)) : r.value ? (z(), I(ee, { key: 3 }, [k("p", null, R(m(ne).buyOutfit(m(qt)[n.value].name, d.value.price)), 1), k("div", Jl, [k("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < d.value.price,
      onClick: y
    }, R(m(ne).confirm), 9, ec), k("button", {
      type: "button",
      onClick: j[2] || (j[2] = (C) => r.value = !1)
    }, R(m(ne).cancel), 1)])], 64)) : (z(), I("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < d.value.price,
      onClick: j[3] || (j[3] = (C) => r.value = !0)
    }, R(e.balance < d.value.price ? m(ne).noCoins : m(ne).purchase) + " · " + R(m(ne).coins(d.value.price)), 9, tc))])], 512), k("div", {
      class: "exp-outfit-rack",
      "aria-label": m(ne).tryOn
    }, [(z(!0), I(ee, null, Ie(v.value, (C) => (z(), I("button", {
      key: C,
      type: "button",
      "aria-pressed": n.value === C,
      onClick: (U) => S(C)
    }, [
      u.value[C] ? (z(), I("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[C],
        alt: ""
      }, null, 8, sc)) : G("", !0),
      k("strong", null, R(m(qt)[C].name), 1),
      k("small", null, R(e.data.equippedOutfit === C ? m(ne).equipped : m(Qa)(e.data, C) ? m(ne).owned : m(ot)[C].price ? m(ne).coins(m(ot)[C].price) : m(ne).achievement), 1)
    ], 8, nc))), 128))], 8, ac)]));
  }
}), oc = rc;
function ic(e, t = 1) {
  const s = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (s[n] || n >= za.bands.length) && we("narrative_unavailable");
    const r = /* @__PURE__ */ new Map();
    for (const c of a[3].matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
      r.has(c[1]) && we("narrative_unavailable"), r.set(c[1], c[2].replace(/^[^:\n]+:\s*/, "").trim());
    const i = (c) => {
      const o = r.get(c);
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
  return za.bands.some((a, n) => !s[n]) && we("narrative_unavailable"), s;
}
function lc(e, t, s) {
  const a = e[kn(t.affection)];
  return {
    relationship: a.relationship,
    shadow: a.shadow,
    intimacy: a.intimacy,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: s ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var cc = async (e, t) => {
  const s = await fetch(`/${fr}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  s.ok || we("narrative_unavailable");
  const a = await s.text();
  return a.trim() || we("narrative_unavailable"), a;
};
async function dc(e, t, s = cc) {
  const [a, n, r, i, c] = await Promise.all([
    s("system-prompt", t),
    s("world", t),
    s("player", t),
    s("meta-protocol", t),
    Promise.all(Us.map(async (x) => ({
      id: x,
      document: await s(De(x) ? x : Fe[x].card, t)
    })))
  ]), o = c.map(({ id: x, document: M }) => {
    const S = [...M.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (S.length !== 1 || !S[0][1].trim()) && we("narrative_unavailable"), {
      id: x,
      introduction: S[0][1].trim(),
      document: M.replace(S[0][0], "").trim()
    };
  }), l = o.map((x) => x.introduction).join(`
`), u = o.find((x) => x.id === e).document, d = {
    system: a,
    world: n,
    player: r,
    protocol: i,
    npcs: l
  };
  if (!De(e)) {
    const x = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!x || x[1] !== `${e}.initial`) && we("narrative_unavailable"), {
      ...d,
      character: u.slice(0, x.index).replace(/# 开场\s*$/, "").trim(),
      stages: [],
      opening: {
        initial: x[2],
        returned: null
      }
    };
  }
  const [h, p] = await Promise.all(["openings", `${e}-stages`].map((x) => s(x, t))), v = new Map([...h.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((x) => [x[1], x[2].trim()])), g = v.get(`${e}.initial`), w = v.get(`${e}.returned`) ?? null;
  return (!g || (e === "anian" || e === "kouzi") && !w) && we("narrative_unavailable"), {
    ...d,
    character: u,
    stages: ic(p),
    opening: {
      initial: g,
      returned: w
    }
  };
}
function Js(e) {
  return bo[e];
}
function uc(e, t, s = []) {
  if (!De(t)) {
    const i = Fe[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: fe.attack,
      ...e.facts.includes(i.intel) ? { pass: fe.pass } : {}
    };
  }
  const a = Object.fromEntries(yo(e.facts, t, e.people[t]).map((i) => [i, xn[i].meaning])), n = Js(t), r = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && r >= za.bands[4] && s[kn(r)]?.secret && (a.share_secret = fe.shareSecret), wo(e, t)) {
    a.follow = fe.follow, a.stay = fe.stay;
    for (const i of Ts(e, t).filter((c) => c.accessible && c.solo)) a[`go:${i.id}`] = fe.go(i.name);
  }
  return a;
}
var er = "dialogue", Ua = `<${er}>`, $n = `</${er}>`, Wh = new RegExp(`${Ua}([\\s\\S]*?)${$n}`, "i"), Hh = new RegExp(Ua, "i");
function os(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${Ua}
${e.reply}
${$n}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function hc(e) {
  return `［开工强调］：

每次输出均由两部分组成：XML 正文与 JSON 操作，缺一不可。

在${Ua}…${$n}中用【${e}】的身份第一人称叙事。在JSON 对象中提交操作。
开工：`;
}
function fc(e) {
  return e.map((t) => ({
    id: t,
    event: Ss[t]
  }));
}
function pc(e) {
  const t = /* @__PURE__ */ new Set();
  let s;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((c) => !t.has(c)), r = {
      ...a.scene === s ? {} : { place: se.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((c) => t.add(c)), s = a.scene;
    const i = Object.keys(r).length ? `<scene>
${JSON.stringify(r)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: os(a)
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: os(a)
    }];
  });
}
function mc(e, t) {
  return t ? e.findIndex((s) => s.id === t.throughId) + 1 : 0;
}
function vc(e, t) {
  const s = new Set(e.facts), a = De(t) ? e.people[t] : null, n = Me[De(t) ? e.people[t].scene : Fe[t].scene], r = De(t) ? e.people[t].position : Ca(t, s), i = Mn(n, r, s, e.people), c = Oa(n.id, r, s).filter((l) => Le(Ct(n, s), r, l.position)), o = Sa(n.id);
  return {
    place: se.scenes[n.id],
    playerLodging: Yt.guest_room.name,
    ...o ? { room: {
      use: o.use,
      enclosure: o.enclosure,
      household: o.household.map((l) => l === "player" ? e.traveler.name : l === "anian_parents" || l === "innkeeper" ? se.households[l] : qe(l)),
      furniture: o.furniture.map((l) => ({
        item: l.label,
        position: {
          x: l.footprint.x,
          y: l.footprint.z
        }
      })),
      exits: n.exits.map((l) => ({
        place: se.scenes[l.to],
        position: n.anchors[l.anchor]
      }))
    } } : {},
    positions: {
      player: e.location.position,
      self: r
    },
    present: [
      e.traveler.name,
      ...dt.filter((l) => e.people[l].scene === n.id).map(qe),
      ...c.map((l) => qe(l.target.id))
    ],
    residents: (Ks[n.id] ?? []).map((l) => ({
      name: l.name,
      activity: yi[l.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? Ta[a.destination].name : null
    } : null,
    nearby: [...i, ...c].filter((l) => l.target.id !== t).map((l) => qe(l.target.id))
  };
}
function gc(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: ua[e.appearanceAge] } : {}
  };
}
function bc(e, t, s = []) {
  const a = uc(e, t, s), n = Object.keys(a), r = {
    person: qe(t),
    ...vc(e, t),
    clothing: qs(e, t),
    events: fc(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (!De(t)) {
    const i = Fe[t];
    return {
      ...r,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...r,
    map: Ts(e, t),
    rescued: e.knowledge[t].includes("captives_arrived"),
    affection: e.relationships[t].affection
  };
}
function na(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function yc(e, t, s, a, n = e.memories[t]) {
  const r = bc(e, t, a.stages), i = Eo(t), c = De(t) ? Js(t) : null, o = De(t) ? lc(a.stages, e.relationships[t], !!c && e.facts.includes(c)) : null, { actions: l, actionMeanings: u, events: d, ...h } = r, p = {
    actions: u,
    performance: i,
    clothing: Sn
  }, v = {
    memory: n?.text ?? null,
    events: d,
    ...h,
    opening: e.conversations[t].some((g) => g.kind === "dialogue") || !De(t) && e.facts.includes(Fe[t].complete) ? null : r.rescued ? a.opening.returned : a.opening.initial,
    stage: o
  };
  return {
    systemPrompt: [
      a.system.trim(),
      na("background", a.world.trim()),
      na("player", `${a.player.trim()}

${JSON.stringify({
        ...gc(e.traveler),
        outfit: qt[e.outfit].detail,
        equipment: _t[e.weapon].equipment
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
${JSON.stringify(v, null, 2)}`
      },
      ...pc(e.conversations[t].length ? e.conversations[t].slice(mc(e.conversations[t], n)) : [Fs(e, t)]),
      {
        role: "user",
        content: `${s}
</story>

${hc(r.person)}`
      }
    ]
  };
}
var is = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function wc(e, t, s, a) {
  const n = yc(e, t, s, a), r = ur({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = Ha(n.systemPrompt), c = Ha(e.memories[t]?.text ?? ""), o = Ha(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: r,
    system: i,
    memory: c,
    history: o,
    situation: Math.max(0, r - i - c - o),
    limit: is.waitAt,
    trigger: is.trigger
  };
}
var xc = { class: "ember-clothing-list" }, Mc = ["data-clothing-slot"], _c = /* @__PURE__ */ je({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => (z(), I("dl", xc, [(z(!0), I(ee, null, Ie(m(Sn), (a, n) => (z(), I(ee, { key: n }, [e.clothing[n] !== void 0 ? (z(), I(ee, { key: 0 }, [k("dt", null, R(a), 1), k("dd", {
      "data-clothing-slot": n,
      class: lt({ "is-absent": !e.clothing[n] })
    }, R(e.clothing[n] || m(ha).absent), 11, Mc)], 64)) : G("", !0)], 64))), 128))]));
  }
}), tr = /* @__PURE__ */ Ge(_c, [["__scopeId", "data-v-2445b8a0"]]), kc = ["onKeydown"], Sc = ["aria-label", "aria-expanded"], Rc = ["aria-label", "aria-expanded"], $c = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Cc = ["id"], zc = ["y", "height"], Pc = ["href"], Ic = ["href", "clip-path"], Ec = ["aria-label", "aria-expanded"], Ac = ["aria-label"], Lc = ["aria-label"], Tc = { class: "ember-meter-total" }, jc = { key: 0 }, Oc = { class: "ember-meter-total" }, Zc = { class: "ember-meter-breakdown" }, Uc = { role: "status" }, Nc = ["disabled"], Dc = { key: 3 }, Fc = { role: "status" }, Bc = /* @__PURE__ */ je({
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
    const t = e, s = Ht(null), a = q(null), n = {
      clothing: ha.title,
      affection: fe.affection,
      context: fe.context
    }, r = X(() => qs(t.campaign, t.person)), i = q(null);
    function c() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const o = q(0), l = q("");
    let u = null, d;
    async function h() {
      u?.abort(), u = new AbortController();
      const S = u;
      s.value = null, l.value = "";
      try {
        const b = await dc(t.person, S.signal);
        S.signal.aborted || (s.value = b);
      } catch (b) {
        S.signal.aborted || (l.value = St(b));
      }
    }
    me(() => t.person, () => {
      a.value = null, o.value = 0, h();
    }, { immediate: !0 });
    const p = X(() => De(t.person) ? t.campaign.relationships[t.person].affection : 0), v = `ember-affection-${fs()}`, g = X(() => 19 * p.value / 100), w = X(() => s.value?.stages[kn(p.value)]?.name ?? ""), x = X(() => s.value ? wc(t.campaign, t.person, t.draft, s.value) : null);
    me(() => [t.person, p.value], ([S, b], [y, _]) => {
      S === y && b === _ || (d && clearTimeout(d), o.value = S === y ? b - _ : 0, o.value && (d = setTimeout(() => {
        o.value = 0;
      }, 3500)));
    }), ps(() => (c(), !0), () => !!a.value), $t(() => {
      u?.abort(), d && clearTimeout(d);
    });
    const M = (S) => `${(S / 1e3).toFixed(1)}k`;
    return (S, b) => (z(), I("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: cr(mt(c, ["stop"]), ["esc"])
    }, [
      k("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": m(ha).title,
        "aria-expanded": a.value === "clothing",
        onClick: b[0] || (b[0] = (y) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...b[4] || (b[4] = [k("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [k("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Sc),
      m(De)(e.person) ? (z(), I("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(fe).affection,
        "aria-expanded": a.value === "affection",
        onClick: b[1] || (b[1] = (y) => a.value = a.value === "affection" ? null : "affection")
      }, [(z(), I("svg", $c, [
        k("defs", null, [k("path", {
          id: `${v}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Cc), k("clipPath", { id: v }, [k("rect", {
          x: "2",
          y: 22 - g.value,
          width: "20",
          height: g.value
        }, null, 8, zc)])]),
        k("use", {
          href: `#${v}-shape`,
          class: "ember-affection-track"
        }, null, 8, Pc),
        k("use", {
          href: `#${v}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${v})`
        }, null, 8, Ic)
      ])), o.value ? (z(), I("small", {
        key: 0,
        class: lt(["ember-affection-change", { "is-down": o.value < 0 }]),
        role: "status"
      }, R(o.value > 0 ? "+" : "") + R(o.value), 3)) : G("", !0)], 8, Rc)) : G("", !0),
      k("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(fe).context,
        "aria-expanded": a.value === "context",
        onClick: b[2] || (b[2] = (y) => a.value = a.value === "context" ? null : "context")
      }, [k("span", {
        class: lt(["ember-meter-ring", { "is-warning": x.value && x.value.used >= x.value.trigger }]),
        style: Gt({ "--meter-fill": `${Math.min(1, (x.value?.used ?? 0) / (x.value?.limit ?? 1)) * 360}deg` })
      }, [...b[5] || (b[5] = [k("span", null, null, -1)])], 6)], 8, Ec),
      a.value ? (z(), I("section", {
        key: 1,
        class: lt(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        k("header", null, [k("strong", null, R(n[a.value]), 1), k("button", {
          type: "button",
          "aria-label": m(fe).close,
          onClick: c
        }, "×", 8, Lc)]),
        a.value === "affection" ? (z(), I(ee, { key: 0 }, [k("p", Tc, [ze(R(p.value) + " ", 1), b[6] || (b[6] = k("small", null, "/ 100", -1))]), l.value ? G("", !0) : (z(), I("p", jc, R(w.value || m(fe).loading), 1))], 64)) : a.value === "clothing" ? (z(), Mt(tr, {
          key: 1,
          clothing: r.value
        }, null, 8, ["clothing"])) : x.value ? (z(), I(ee, { key: 2 }, [
          k("p", Oc, R(M(x.value.used)) + " / " + R(M(x.value.limit)), 1),
          k("dl", Zc, [(z(!0), I(ee, null, Ie(m(fe).contextParts, (y, _) => (z(), I(ee, { key: _ }, [k("dt", null, R(y), 1), k("dd", null, R(M(x.value[_])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? (z(), I(ee, { key: 0 }, [k("p", Uc, R(e.memoryState.code === "expedition_agent_failed" ? m(fe).memoryServiceFailed : m(St)(e.memoryState)), 1), k("button", {
            type: "button",
            disabled: e.blocked,
            onClick: b[3] || (b[3] = (y) => S.$emit("retry-memory"))
          }, R(m(fe).memoryRetry), 9, Nc)], 64)) : G("", !0)
        ], 64)) : l.value ? G("", !0) : (z(), I("p", Dc, R(m(fe).loading), 1)),
        l.value && a.value !== "clothing" ? (z(), I(ee, { key: 4 }, [k("p", Fc, R(l.value), 1), k("button", {
          type: "button",
          onClick: h
        }, R(m(fe).retry), 1)], 64)) : G("", !0)
      ], 10, Ac)) : G("", !0)
    ], 40, kc));
  }
}), qc = /* @__PURE__ */ Ge(Bc, [["__scopeId", "data-v-b206a6ba"]]), Wc = ["aria-label"], Hc = { class: "ember-weapon-layout" }, Vc = { class: "ember-weapon-list" }, Gc = ["name", "value"], Yc = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, Qc = ["src"], Kc = { class: "ember-weapon-skill" }, Xc = /* @__PURE__ */ je({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = ds(e, "modelValue"), s = fs();
    return (a, n) => (z(), I("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": m(ce).chooseWeapon
    }, [k("div", Hc, [k("div", Vc, [(z(!0), I(ee, null, Ie(m(_s), (r) => (z(), I("label", {
      key: r,
      class: lt({ "is-selected": t.value === r })
    }, [
      At(k("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: m(s),
        value: r
      }, null, 8, Gc), [[hs, t.value]]),
      Ze(Et, { name: r }, null, 8, ["name"]),
      k("span", null, R(m(_t)[r].name), 1)
    ], 2))), 128))]), k("div", Yc, [
      (z(), I("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: m(pl)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, Qc)),
      k("h3", null, R(m(_t)[t.value].name), 1),
      k("p", null, R(m(_t)[t.value].detail), 1),
      k("div", Kc, [k("strong", null, R(m(_t)[t.value].action), 1), k("p", null, R(m(_t)[t.value].skill), 1)])
    ])])], 8, Wc));
  }
}), Jc = /* @__PURE__ */ Ge(Xc, [["__scopeId", "data-v-0c0d4e2b"]]), ed = ["src"], td = /* @__PURE__ */ je({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = q(null), s = q(null), a = new ResizeObserver((n) => {
      const { width: r, height: i } = n[0].contentRect;
      s.value = r <= 700 && i > r;
    });
    return Zt(() => a.observe(t.value)), $t(() => a.disconnect()), (n, r) => (z(), I("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [s.value !== null ? (z(), I("img", {
      key: 0,
      src: s.value ? m(fn).cityMobile : m(fn).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, ed)) : G("", !0)], 512));
  }
}), ad = /* @__PURE__ */ Ge(td, [["__scopeId", "data-v-f5a6e0d9"]]), nd = ["aria-label"], sd = {
  key: 0,
  class: "entry-title"
}, rd = { class: "entry-city" }, od = ["aria-label"], id = ["disabled"], ld = ["disabled"], cd = ["disabled"], dd = ["disabled"], ud = {
  key: 0,
  class: "entry-save"
}, hd = ["disabled"], fd = { class: "entry-name" }, pd = { for: "ember-traveler-name" }, md = ["maxlength", "placeholder"], vd = { class: "entry-identity-details" }, gd = ["value"], bd = { class: "entry-age" }, yd = { for: "ember-traveler-age" }, wd = {
  disabled: "",
  value: ""
}, xd = ["value"], Md = {
  class: "entry-primary",
  type: "submit"
}, _d = {
  key: 1,
  class: "entry-chapters"
}, kd = ["src"], Sd = {
  class: "entry-numeral",
  "aria-hidden": "true"
}, Rd = { class: "entry-chapter-body" }, $d = { key: 0 }, Cd = { class: "entry-forthcoming" }, zd = { class: "entry-traveler" }, Pd = {
  key: 0,
  class: "entry-restart"
}, Id = ["disabled"], Ed = {
  key: 0,
  "aria-hidden": "true"
}, Ad = /* @__PURE__ */ je({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: s }) {
    const a = e, n = s, r = q("title"), i = q(!1), c = q(a.campaign?.traveler.name ?? ""), o = q(a.campaign?.traveler.gender ?? null), l = q(a.campaign?.traveler.appearanceAge ?? ""), u = q(a.campaign?.weapon ?? "blade"), d = q(!1), h = q(null), p = q(null), v = X(() => ({
      title: N.title,
      identity: ce.identity,
      chapters: ce.chooseChapter,
      weapon: ce.chooseWeapon
    })[r.value]);
    me(r, async () => {
      await Wt(), p.value && (p.value.scrollTop = 0), h.value?.focus({ preventScroll: !0 });
    });
    function g() {
      i.value = !0, d.value = !1, r.value = "identity";
    }
    function w() {
      c.value.trim() && o.value && l.value && (c.value = c.value.trim(), r.value = "chapters");
    }
    function x() {
      r.value = r.value === "weapon" ? "chapters" : r.value === "chapters" && i.value ? "identity" : "title";
    }
    function M() {
      a.campaign && !i.value ? n("continue") : r.value = "weapon";
    }
    function S() {
      !o.value || !l.value || !c.value.trim() || a.blocked || a.campaign && !d.value || n("start", {
        traveler: {
          name: c.value.trim(),
          gender: o.value,
          appearanceAge: l.value
        },
        weapon: u.value,
        chapter: Lt.id
      });
    }
    return t({ back: () => r.value === "title" ? !1 : (x(), !0) }), (b, y) => (z(), I("section", {
      class: lt(["ember-entry", { "is-title": r.value === "title" }]),
      "aria-label": m(N).title
    }, [
      Ze(ad),
      y[11] || (y[11] = k("div", { class: "entry-shade" }, null, -1)),
      r.value === "title" ? (z(), I("div", sd, [
        k("p", rd, R(m(ce).city), 1),
        k("h1", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, R(m(N).title), 513),
        k("nav", { "aria-label": m(N).title }, [
          e.campaign ? (z(), I("button", {
            key: 0,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: y[0] || (y[0] = (_) => n("continue"))
          }, [ze(R(m(N).resume), 1), y[7] || (y[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, id)) : (z(), I("button", {
            key: 1,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, [ze(R(e.ready ? m(ce).begin : m(ce).loading), 1), y[8] || (y[8] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, ld)),
          e.campaign ? (z(), I("button", {
            key: 2,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: y[1] || (y[1] = (_) => {
              i.value = !1, r.value = "chapters";
            })
          }, R(m(ce).chapters), 9, cd)) : G("", !0),
          e.campaign ? (z(), I("button", {
            key: 3,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, R(m(ce).newJourney), 9, dd)) : G("", !0)
        ], 8, od),
        e.campaign ? (z(), I("p", ud, [k("span", null, R(e.campaign.traveler.name), 1), k("span", null, R(m(Ds)), 1)])) : G("", !0)
      ])) : (z(), I("div", {
        key: 1,
        ref_key: "sheet",
        ref: p,
        class: "entry-sheet"
      }, [
        k("header", null, [k("button", {
          type: "button",
          disabled: e.busy,
          onClick: x
        }, "← " + R(m(ce).back), 9, hd), k("span", null, R(m(N).title), 1)]),
        k("h2", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, R(v.value), 513),
        r.value === "identity" ? (z(), I("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: mt(w, ["prevent"])
        }, [
          k("div", fd, [k("label", pd, R(m(ce).name), 1), At(k("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": y[2] || (y[2] = (_) => c.value = _),
            maxlength: m(24),
            placeholder: m(ce).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, md), [[vn, c.value]])]),
          k("div", vd, [k("fieldset", null, [k("legend", null, R(m(ce).gender), 1), (z(!0), I(ee, null, Ie(m(Ns), (_) => (z(), I("label", { key: _ }, [At(k("input", {
            "onUpdate:modelValue": y[3] || (y[3] = (P) => o.value = P),
            type: "radio",
            name: "ember-traveler-gender",
            value: _,
            required: ""
          }, null, 8, gd), [[hs, o.value]]), k("span", null, R(m(ce).genders[_]), 1)]))), 128))]), k("div", bd, [k("label", yd, R(m(ce).age), 1), At(k("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": y[4] || (y[4] = (_) => l.value = _),
            required: ""
          }, [k("option", wd, R(m(ce).agePlaceholder), 1), (z(!0), I(ee, null, Ie(m(ua), (_, P) => (z(), I("option", {
            key: P,
            value: P
          }, R(_), 9, xd))), 128))], 512), [[dr, l.value]])])]),
          k("button", Md, [ze(R(m(ce).next), 1), y[9] || (y[9] = k("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : r.value === "chapters" ? (z(), I("div", _d, [k("button", {
          type: "button",
          class: "entry-chapter",
          onClick: M
        }, [
          k("img", {
            class: "entry-chapter-art",
            src: m(fn).chapter,
            alt: "",
            decoding: "async"
          }, null, 8, kd),
          k("span", Sd, R(m(Lt).numeral), 1),
          k("span", Rd, [
            k("small", null, R(m(Lt).number), 1),
            k("strong", null, R(m(Lt).title), 1),
            k("span", null, R(m(N).opening), 1),
            e.campaign && !i.value ? (z(), I("small", $d, R(e.campaign.facts.includes("chapter_completed") ? m(ce).completeChapter : m(ce).currentChapter), 1)) : G("", !0)
          ]),
          y[10] || (y[10] = k("span", {
            class: "entry-chapter-arrow",
            "aria-hidden": "true"
          }, "→", -1))
        ]), k("div", Cd, [k("span", null, R(m(ce).nextChapter), 1), k("span", null, R(m(ce).forthcoming), 1)])])) : (z(), I("form", {
          key: 2,
          class: "entry-loadout",
          onSubmit: mt(S, ["prevent"])
        }, [
          k("p", zd, [k("strong", null, R(c.value), 1), k("span", null, R(o.value ? m(ce).genders[o.value] : "") + " · " + R(l.value ? m(ua)[l.value] : "") + " · " + R(m(ce).identityRole), 1)]),
          Ze(Jc, {
            modelValue: u.value,
            "onUpdate:modelValue": y[5] || (y[5] = (_) => u.value = _)
          }, null, 8, ["modelValue"]),
          e.campaign ? (z(), I("label", Pd, [At(k("input", {
            "onUpdate:modelValue": y[6] || (y[6] = (_) => d.value = _),
            type: "checkbox",
            required: ""
          }, null, 512), [[ir, d.value]]), k("span", null, R(m(ce).restartWarning), 1)])) : G("", !0),
          k("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [ze(R(e.busy ? m(ce).entering : e.campaign ? m(ce).confirmRestart : m(ce).enter), 1), e.busy ? G("", !0) : (z(), I("span", Ed, "→"))], 8, Id)
        ], 32))
      ], 512))
    ], 10, nd));
  }
}), Ld = /* @__PURE__ */ Ge(Ad, [["__scopeId", "data-v-38da0fee"]]), Td = [
  "aria-label",
  "title",
  "disabled"
], jd = ["disabled"], Od = [
  "maxlength",
  "aria-label",
  "placeholder"
], Zd = ["aria-label", "title"], Ud = [
  "aria-label",
  "title",
  "disabled"
], Nd = /* @__PURE__ */ je({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ En({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ En([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const s = ds(e, "modelValue"), a = e, n = t, r = q(null), i = q(!1);
    let c = null, o = 0;
    function l() {
      r.value && (r.value.style.height = "44px", r.value.style.height = `${Math.min(132, r.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && s.value.trim() && n("send");
    }
    function d(h) {
      hr(h, i.value) && (h.preventDefault(), u());
    }
    return me(s, async () => {
      await Wt(), l();
    }), me(r, (h, p) => {
      p && c?.unobserve(p), h && (l(), c?.observe(h));
    }, { flush: "post" }), Zt(() => {
      l(), c = new ResizeObserver((h) => {
        const p = h[0].contentRect.width;
        p !== o && (o = p, l());
      }), r.value && c.observe(r.value);
    }), $t(() => c?.disconnect()), (h, p) => (z(), I("form", {
      class: "ember-composer",
      onSubmit: mt(u, ["prevent"])
    }, [
      k("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? m(fe).retrySend : m(fe).regenerate,
        title: e.retrying ? m(fe).retrySend : m(fe).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: p[0] || (p[0] = (v) => n("regenerate"))
      }, [...p[6] || (p[6] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, Td),
      e.conclusion ? (z(), I("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: p[1] || (p[1] = (v) => n("continue"))
      }, [ze(R(e.conclusion === "fight" ? m(fe).fight : m(fe).continue), 1), p[7] || (p[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, jd)) : At((z(), I("textarea", {
        key: 1,
        ref_key: "input",
        ref: r,
        "onUpdate:modelValue": p[2] || (p[2] = (v) => s.value = v),
        rows: "1",
        maxlength: m(ia).playerTextLimit,
        "aria-label": m(N).input,
        placeholder: m(N).input,
        enterkeyhint: "enter",
        onKeydown: d,
        onCompositionstart: p[3] || (p[3] = (v) => i.value = !0),
        onCompositionend: p[4] || (p[4] = (v) => i.value = !1)
      }, null, 40, Od)), [[vn, s.value]]),
      e.talking ? (z(), I("button", {
        key: 2,
        type: "button",
        "aria-label": m(N).cancel,
        title: m(N).cancel,
        onClick: p[5] || (p[5] = (v) => n("cancel"))
      }, [...p[8] || (p[8] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, Zd)) : e.conclusion ? G("", !0) : (z(), I("button", {
        key: 3,
        type: "submit",
        "aria-label": m(N).send,
        title: m(N).send,
        disabled: e.blocked || !s.value.trim()
      }, [...p[9] || (p[9] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Ud))
    ], 32));
  }
}), Dd = /* @__PURE__ */ Ge(Nd, [["__scopeId", "data-v-640a5540"]]), ls = "关闭交谈后出发", Bt = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${ls}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, s) => s ? `${e}准备前往${t}等候 · ${ls}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function Fd(e, t, s) {
  if (!De(t)) return !1;
  const a = e.people[t], n = s.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const r = e.conversations[t];
  for (let i = r.length - 1; i >= 0; i--) {
    const c = r[i], o = c.action;
    if (o === "follow" || o === "stay" || o?.startsWith("go:")) return c.id === s.id;
  }
  return !1;
}
function Bd(e, t, s) {
  const a = s.action;
  if (s.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === s.id, r = Fd(e, t, s) || n && (a === "finish" ? _n(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), i = qe(t);
  let c;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      c = Bt[a];
      break;
    case "follow":
      c = Bt.follow(i, r);
      break;
    case "stay":
      c = Bt.stay(i);
      break;
    case "pass":
      c = Bt.pass(i, r);
      break;
    case "attack":
    case "finish":
      c = Bt[a](r);
      break;
    default:
      c = Bt.go(i, Ta[a.slice(3)].name, r);
  }
  return {
    action: a,
    phase: r ? "pending" : "applied",
    text: c
  };
}
var qd = ["data-action", "data-phase"], Wd = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, Hd = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, Vd = /* @__PURE__ */ je({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, s = X(() => Bd(t.campaign, t.person, t.turn));
    return (a, n) => s.value ? (z(), I("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": s.value.action,
      "data-phase": s.value.phase
    }, [(z(), I("svg", Wd, [s.value.phase === "pending" ? (z(), I(ee, { key: 0 }, [n[0] || (n[0] = k("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = k("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : (z(), I("path", Hd))])), k("span", null, R(s.value.text), 1)], 8, qd)) : G("", !0);
  }
}), Gd = /* @__PURE__ */ Ge(Vd, [["__scopeId", "data-v-00613f94"]]), Yd = { class: "ember-clothing-feedback" }, Qd = { key: 0 }, Kd = /* @__PURE__ */ je({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => (z(), I("details", Yd, [k("summary", null, [ze(R(m(ha).changed), 1), k("span", null, [(z(!0), I(ee, null, Ie(m(Sn), (a, n) => (z(), I(ee, { key: n }, [e.clothing[n] !== void 0 ? (z(), I("small", Qd, R(a), 1)) : G("", !0)], 64))), 128))])]), Ze(tr, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), Xd = /* @__PURE__ */ Ge(Kd, [["__scopeId", "data-v-49dedcf2"]]);
function Jd(e) {
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
var eu = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, tu = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, au = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, nu = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, su = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, ru = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, ou = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, iu = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, lu = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, cu = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, du = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, uu = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, hu = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, fu = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, pu = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, mu = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, vu = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, gu = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, bu = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, yu = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, wu = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, xu = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, Mu = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, _u = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, ku = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, Su = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, Ru = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, $u = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, Cu = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, zu = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, Pu = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, Iu = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, Eu = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, Au = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, Lu = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, Tu = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, ju = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, Ou = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, Zu = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, Uu = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, Nu = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, Du = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, Fu = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, Bu = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, qu = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, Wu = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, Hu = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, Vu = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, Gu = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, Yu = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, Qu = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, Ku = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, Xu = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, Ju = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, e1 = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, t1 = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, a1 = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, n1 = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, s1 = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, r1 = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, o1 = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, i1 = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, l1 = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, c1 = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, d1 = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, u1 = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, h1 = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, f1 = {
  sanniang: {
    body: eu,
    arm: tu,
    heads: {
      neutral: au,
      smile: nu,
      teasing: su,
      blush: ru,
      rest: ou,
      serious: iu,
      worried: lu,
      sad: cu,
      displeased: du,
      fond: uu,
      laugh: hu,
      surprised: fu
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: pu,
    arm: vu,
    heads: {
      neutral: mu,
      smile: Su,
      blush: gu,
      displeased: bu,
      fond: yu,
      laugh: wu,
      rest: xu,
      sad: Mu,
      surprised: _u,
      worried: ku
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: Ru,
    arm: Cu,
    heads: {
      neutral: $u,
      blush: Zu,
      displeased: zu,
      fond: Pu,
      laugh: Iu,
      sad: Eu,
      serious: Au,
      smile: Lu,
      surprised: Tu,
      teasing: ju,
      worried: Ou
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: Uu,
    arm: Nu,
    heads: {
      neutral: Du,
      smile: Fu,
      teasing: Bu,
      laugh: qu,
      blush: Wu,
      fond: Hu,
      serious: Vu,
      surprised: Gu,
      worried: Yu,
      sad: Qu
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: Ku,
    arm: Ju,
    heads: {
      neutral: Xu,
      angry: e1,
      relieved: t1,
      resigned: a1,
      suspicious: n1,
      worried: s1
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: r1,
    arm: i1,
    heads: {
      neutral: o1,
      displeased: l1,
      relieved: c1,
      smile: d1,
      squint: u1,
      worried: h1
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, p1 = {
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
function m1(e, t, s) {
  if (e === "none") return null;
  const a = p1[e], n = a.joint === "arm" ? a.angles.map((r) => `rotate(${r * s}deg)`) : a.frames;
  return t[a.joint].animate(n.map((r) => ({ transform: r })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var v1 = ["src"], g1 = ["src"], b1 = ["src"], y1 = /* @__PURE__ */ je({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = q(null), a = q(null), n = q(null), r = X(() => f1[t.person]), i = q(!1), c = q(0);
    let o = 0, l = !1, u = !1, d = null, h, p;
    function v() {
      u = !0, d?.cancel(), d = null;
    }
    function g() {
      if (!(!t.animate || u || i.value || o < 3 || !l)) {
        if (document.hidden || p?.matches) {
          v();
          return;
        }
        a.value && n.value && (u = !0, d = m1(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, r.value.armDirection));
      }
    }
    function w() {
      o++, g();
    }
    function x() {
      i.value = !0, v();
    }
    function M() {
      o = 0, i.value = !1, c.value++;
    }
    function S() {
      document.hidden && v();
    }
    function b() {
      p?.matches && v();
    }
    return me(() => t.animate, (y) => {
      y ? g() : v();
    }), Zt(() => {
      p = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || p.matches) && v(), p.addEventListener("change", b), document.addEventListener("visibilitychange", S), h = new IntersectionObserver((y) => {
        l = y[0].isIntersecting && y[0].intersectionRatio >= 0.25, l ? g() : d && v();
      }, { threshold: 0.25 }), s.value && h.observe(s.value);
    }), mn(v), $t(() => {
      v(), h?.disconnect(), p?.removeEventListener("change", b), document.removeEventListener("visibilitychange", S);
    }), (y, _) => (z(), I("span", {
      ref_key: "root",
      ref: s,
      class: lt(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? (z(), I("button", {
      key: 1,
      type: "button",
      onClick: M
    }, R(m(fe).reloadArtwork), 1)) : (z(), I(ee, { key: 0 }, [
      (z(), I("img", {
        key: "body-" + c.value,
        src: r.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: x
      }, null, 40, v1)),
      (z(), I("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: r.value.heads[e.performance?.expression ?? "neutral"],
        style: Gt({ transformOrigin: r.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: x
      }, null, 44, g1)),
      (z(), I("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: r.value.arm,
        style: Gt({ transformOrigin: r.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: x
      }, null, 44, b1))
    ], 64))], 2));
  }
}), w1 = /* @__PURE__ */ Ge(y1, [["__scopeId", "data-v-606c2ccc"]]), x1 = { class: "ember-npc-bubble" }, M1 = { class: "ember-npc-line" }, _1 = /* @__PURE__ */ je({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = X(() => Jd(t.reply));
    return (a, n) => (z(), I("div", x1, [Ze(w1, {
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ]), k("p", M1, [(z(!0), I(ee, null, Ie(s.value, (r, i) => (z(), I("span", {
      key: i,
      class: lt({ "ember-spoken": r.spoken })
    }, R(r.text), 3))), 128))])]));
  }
}), cs = /* @__PURE__ */ Ge(_1, [["__scopeId", "data-v-5a2c5c6c"]]), k1 = { class: "ember-campaign" }, S1 = { class: "ember-health" }, R1 = [
  "max",
  "value",
  "aria-label"
], $1 = { class: "ember-objective" }, C1 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, z1 = ["aria-label"], P1 = ["disabled", "aria-label"], I1 = ["disabled", "aria-label"], E1 = ["disabled", "aria-label"], A1 = ["aria-label"], L1 = {
  key: 4,
  class: "ember-boss"
}, T1 = [
  "max",
  "value",
  "aria-label"
], j1 = {
  key: 5,
  class: "ember-alarm"
}, O1 = ["aria-label"], Z1 = ["disabled"], U1 = ["disabled"], N1 = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, D1 = { key: 0 }, F1 = { class: "ember-prose" }, B1 = ["aria-label"], q1 = {
  key: 0,
  class: "ember-panel-heading"
}, W1 = ["aria-label"], H1 = ["aria-pressed"], V1 = ["aria-pressed"], G1 = ["disabled"], Y1 = { class: "ember-prose ember-prologue" }, Q1 = { class: "ember-objective-panel" }, K1 = { class: "ember-journal" }, X1 = { class: "ember-pack-heading" }, J1 = { key: 0 }, eh = { key: 1 }, th = { class: "ember-relics" }, ah = { key: 0 }, nh = ["disabled", "onClick"], sh = { class: "ember-dialogue-heading" }, rh = { class: "ember-person-heading" }, oh = ["disabled"], ih = {
  key: 0,
  class: "ember-player-line"
}, lh = {
  key: 1,
  class: "ember-dialogue-issue"
}, ch = { key: 2 }, dh = { class: "ember-prose" }, uh = {
  key: 3,
  class: "ember-prose"
}, hh = ["data-fresh-reply"], fh = ["aria-busy"], ph = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, mh = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, vh = { key: 0 }, gh = { class: "ember-prose" }, bh = { key: 3 }, yh = {
  key: 6,
  class: "ember-prose"
}, wh = ["src"], xh = { class: "ember-prose" }, Mh = ["src"], _h = { class: "ember-prose" }, kh = { class: "ember-continued" }, Sh = { class: "ember-relics" }, Rh = ["disabled", "onClick"], $h = ["disabled"], Ch = { class: "ember-prose" }, zh = ["disabled"], Ph = ["disabled"], Ih = ["disabled"], Eh = { class: "ember-pause-actions" }, Ah = ["aria-pressed"], Lh = { class: "ember-help ember-keyboard-help" }, Th = { class: "ember-help ember-touch-help" }, jh = /* @__PURE__ */ je({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, s = jo(t.bridge, t.chatIdentity), a = Oo(s), { view: n, notice: r, busy: i, blocked: c, talking: o, outgoing: l, conversationFailure: u } = s, { current: d, dirty: h } = a, p = q(!0), v = q(!1), g = q(!1), w = q(0), x = q(!1), M = q(!1), S = q(null), b = q(null), y = q(null), _ = q("relics"), P = X(() => y.value === "map" ? N.map : y.value === "journal" ? N.journal : y.value === "build" ? N.build : y.value === "person" ? qe(A.value) : y.value === "passage" ? se.passages[j.value].title : y.value === "arrival" ? se.scenes.camp : y.value === "ending" || y.value === "prologue" ? Ds : d.value?.phase === "reward" ? N.reward : d.value?.phase === "lost" ? N.fallen : N.pause), A = q("sanniang"), j = q("warning"), C = q(null), U = q({}), T = X({
      get: () => U.value[A.value] ?? "",
      set: (O) => {
        U.value[A.value] = O;
      }
    }), H = q(null), Y = q(!1), F = /* @__PURE__ */ new Map(), Z = q(null), Q = q(null), le = q(null), Ye = X((O) => {
      const D = d.value?.facts ?? [];
      return O && O.size === D.length && D.every((L) => O.has(L)) ? O : new Set(D);
    }), tt = X(() => d.value ? {
      definition: Me[d.value.location.scene],
      location: d.value.location,
      facts: Ye.value,
      people: d.value.people
    } : null), ke = X(() => {
      const O = d.value && pn[d.value.location.scene];
      return O ? { "--scene-art": `url("${O}")` } : void 0;
    }), de = X(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), xe = X(() => d.value ? _n(d.value) : null), ut = X(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : xe.value ? "continue" : void 0), zt = X(() => !x.value || !d.value || !!d.value.pendingParley || !!xe.value || p.value || !!y.value || !!r.value || o.value || g.value || t.generationActive || M.value || !!S.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), We = X(() => d.value?.battle?.enemies.find((O) => _e(O.kind))), Be = X(() => d.value?.conversations[A.value] ?? []), Qe = X(() => d.value && !Be.value.length ? Fs(d.value, A.value) : null), Re = X(() => H.value?.person === A.value ? {
      ...H.value,
      status: Y.value ? "sending" : "failed"
    } : l.value?.person === A.value && !l.value.regenerating && !Be.value.some((O) => O.id === l.value?.actionId) ? l.value : null), he = X(() => Re.value?.status === "failed"), He = X(() => d.value && ln(d.value)?.person === A.value), Ae = q(null), fa = X(() => d.value?.collection.map((O) => {
      const D = d.value.equipped.includes(O.id) ? d.value.equipped.filter((L) => L !== O.id) : [...d.value.equipped, O.id];
      return {
        ...O,
        equipped: D,
        issue: Co(d.value, D)
      };
    }) ?? []), Pt = Zo(() => {
      s.error.value = ne.presentationError.sound, v.value = !1;
    });
    let Kt = !1;
    function pa() {
      (y.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && B();
    }
    async function ve() {
      await V({ type: "resolve_parley" }) && (y.value = null, await Wt(), le.value?.focus());
    }
    async function at() {
      xe.value ? await V({ type: "accept_reply" }) : await ve();
    }
    Tn(C, pa), ps(() => x.value ? y.value ? (pa(), !0) : p.value ? !1 : (Ve(), !0) : b.value?.back() ?? !1), Tn(Q, () => {
      !i.value && !g.value && !t.generationActive && s.dismissError();
    });
    function Ve() {
      p.value = !0, a.flush();
    }
    function ht() {
      y.value = null, Ve();
    }
    async function Ke(O) {
      M.value || S.value || (y.value = O, O === "build" && (_.value = "relics"), await a.flush());
    }
    async function B() {
      if (!xe.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await ve();
          return;
        }
        !r.value && !t.generationActive && (x.value = !0, y.value = null, p.value = !1, await Wt(), le.value?.focus());
      }
    }
    function Na() {
      x.value = !0, d.value?.pendingParley || xe.value ? (A.value = d.value?.pendingParley?.enemy ?? xe.value, y.value = "person", p.value = !1) : B();
    }
    async function V(O) {
      if (M.value || S.value) return !1;
      M.value = !0, O.type === "interact" && d.value && (S.value = Me[d.value.location.scene].exits.find((L) => L.id === O.id)?.to ?? null);
      let D = !1;
      try {
        return await a.flush() ? (D = await s.act(O), D && (a.sync(), !y.value && !p.value && (await Wt(), le.value?.focus())), D) : !1;
      } finally {
        M.value = !1, D || (S.value = null);
      }
    }
    function Da(O) {
      O === S.value && (S.value = null);
    }
    async function Ut(O) {
      await V({
        type: d.value ? "restart" : "start",
        ...O,
        outfit: de.value
      }) && (x.value = !0, y.value = "prologue");
    }
    function Xt() {
      p.value = !0, y.value = null, x.value = !1, a.flush();
    }
    async function Jt(O) {
      if (!d.value || M.value || S.value) return;
      const D = [...Zs(d.value), ...Oa(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((Se) => Se.target.id === O), L = D?.kind === "object" ? D.target : null;
      if (L?.kind === "person" || L?.kind === "enemy") {
        const Se = L.kind === "person" ? L.person : L.enemy;
        A.value = Se, y.value = "person", await a.flush() && !d.value.conversations[Se].length && await s.act({
          type: "greet",
          person: Se
        }) && a.sync();
        return;
      }
      await V({
        type: "interact",
        id: O
      }) && L?.kind === "inspect" && (j.value = L.passage, y.value = "passage");
    }
    async function ma() {
      const O = A.value, D = T.value.trim();
      if (!(c.value || Y.value || !D || ut.value)) {
        U.value[O] = "", H.value = {
          person: O,
          text: D
        }, Y.value = !0, F.delete(O), Ae.value = null;
        try {
          if (!await a.flush()) return;
          const L = s.talk(O, D);
          H.value = null, await L && a.sync();
        } finally {
          Y.value = !1;
        }
      }
    }
    async function ea() {
      if (!(c.value || Y.value || !d.value))
        if (F.delete(A.value), he.value && Re.value) {
          const O = Re.value, D = s.talk(O.person, O.text);
          H.value = null, await D && a.sync();
        } else {
          const O = ln(d.value);
          O?.person === A.value && await s.talk(A.value, O.turn.player, O.turn.id) && a.sync();
        }
    }
    function nt() {
      const O = Z.value;
      O && F.set(A.value, {
        top: O.scrollTop,
        latest: O.scrollHeight - O.clientHeight - O.scrollTop < 32
      });
    }
    function ta() {
      const O = Z.value;
      if (!O || F.get(A.value)?.latest === !1) return;
      const D = Ae.value ? O.querySelector('[data-fresh-reply="true"]') : null;
      O.scrollTop = D && D.offsetHeight > O.clientHeight ? D.getBoundingClientRect().top - O.getBoundingClientRect().top + O.scrollTop - 12 : O.scrollHeight;
    }
    async function Nt() {
      await a.recover() && (p.value = !0, w.value++);
    }
    return me(() => t.generationActive, (O) => {
      O && Ve();
    }), me(() => [d.value?.pendingParley, xe.value], ([O, D]) => {
      (O || D) && (A.value = O?.enemy ?? D, y.value = "person");
    }, { immediate: !0 }), me(v, (O) => {
      Pt.enable(O);
    }), me(d, (O) => {
      v.value && O?.battle && Pt.tick(O.battle);
    }), me(() => n.value?.data, (O, D) => {
      if (!O?.active || !D?.active || O.active.id !== D.active.id) return;
      const L = new Set(D.active.facts), Se = new Set(O.active.facts);
      !L.has("chapter_completed") && Se.has("chapter_completed") ? y.value = "ending" : !L.has("captives_arrived") && Se.has("captives_arrived") && (y.value = "arrival");
    }), me(() => d.value?.id, () => {
      U.value = {}, H.value = null, F.clear();
    }), me([y, A], () => {
      Ae.value = null;
    }), me(r, (O) => {
      O && (Ae.value = null);
    }), me(() => [A.value, Be.value], ([O, D], [L, Se]) => {
      const It = D.filter((aa) => aa.kind === "dialogue").at(-1);
      O === L && y.value === "person" && It && !Se.some((aa) => aa.id === It.id) && (Ae.value = It.id);
    }), me([Z, A], ([O, D]) => {
      const L = F.get(D);
      O && (O.scrollTop = L && !L.latest ? L.top : O.scrollHeight);
    }, { flush: "post" }), me(Z, (O, D, L) => {
      if (!O) return;
      const Se = new ResizeObserver(ta);
      Se.observe(O), L(() => Se.disconnect());
    }, { flush: "post" }), me(() => [
      Be.value.length,
      o.value,
      Re.value,
      Ae.value
    ], async () => {
      await Wt(), ta();
    }), Zt(async () => {
      await s.read(), Kt = !0;
    }), us(() => {
      Kt && !h.value && s.read();
    }), mn(() => {
      Ae.value = null, Ve();
    }), $t(() => {
      a.dispose(), s.dispose(), Pt.dispose();
    }), (O, D) => (z(), I("section", k1, [
      x.value ? G("", !0) : (z(), Mt(Ld, {
        key: 0,
        ref_key: "entry",
        ref: b,
        campaign: m(d),
        ready: !!m(n)?.ready,
        busy: m(i),
        blocked: m(c) || e.generationActive,
        onStart: Ut,
        onContinue: Na
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      x.value && m(d) && tt.value ? (z(), Mt(Hi, {
        key: w.value,
        ref_key: "field",
        ref: le,
        world: tt.value,
        traveler: m(d).traveler,
        paused: zt.value,
        transitioning: !!S.value,
        weapon: m(d).weapon,
        outfit: de.value,
        battle: m(d).battle,
        onInput: m(a).input,
        onInteract: Jt,
        onPause: Ve,
        onResume: B,
        onError: D[0] || (D[0] = (L) => g.value = !0),
        onReady: Da
      }, {
        status: An(() => [m(d) ? (z(), I(ee, { key: 0 }, [k("div", S1, [k("meter", {
          min: 0,
          max: m(K).maxHp,
          value: m(d).hp,
          "aria-label": m(ne).hp
        }, null, 8, R1), k("span", null, R(Math.ceil(m(d).hp)) + " / " + R(m(K).maxHp), 1)]), k("p", $1, R(m(Nn)(m(d))), 1)], 64)) : G("", !0)]),
        overlay: An(() => [...D[17] || (D[17] = [k("span", null, null, -1)])]),
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
      ])) : G("", !0),
      x.value && S.value && !m(r) && !g.value && !y.value && !p.value ? (z(), I("aside", C1, R(m(se).transition(m(se).scenes[S.value])), 1)) : G("", !0),
      x.value && m(d) && !m(d).pendingParley && !xe.value ? (z(), I("nav", {
        key: 3,
        class: "ember-tools",
        "aria-label": m(N).prepare
      }, [
        k("button", {
          type: "button",
          disabled: M.value || !!S.value,
          "aria-label": m(N).map,
          onClick: D[1] || (D[1] = (L) => Ke("map"))
        }, [Ze(Et, { name: "map" }), k("span", null, R(m(N).map), 1)], 8, P1),
        k("button", {
          type: "button",
          disabled: M.value || !!S.value,
          "aria-label": m(N).build,
          onClick: D[2] || (D[2] = (L) => Ke("build"))
        }, [Ze(Et, { name: "bag" }), k("span", null, R(m(N).build), 1)], 8, I1),
        k("button", {
          type: "button",
          disabled: M.value || !!S.value,
          "aria-label": m(N).journal,
          onClick: D[3] || (D[3] = (L) => Ke("journal"))
        }, [Ze(Et, { name: "journal" }), k("span", null, R(m(N).journal), 1)], 8, E1),
        k("button", {
          type: "button",
          "aria-label": m(N).pause,
          onClick: ht
        }, [Ze(Et, { name: "pause" }), k("span", null, R(m(N).pause), 1)], 8, A1)
      ], 8, z1)) : G("", !0),
      x.value && We.value && !y.value ? (z(), I("div", L1, [k("strong", null, R(m(en)[We.value.kind]), 1), k("meter", {
        min: "0",
        max: We.value.maxHp,
        value: We.value.hp,
        "aria-label": m(en)[We.value.kind]
      }, null, 8, T1)])) : G("", !0),
      x.value && m(d)?.phase === "battle" && ["gate", "beacon"].includes(m(d).location.scene) && !Ye.value.has("alarm_silenced") ? (z(), I("div", j1, R(Ye.value.has("alarm_raised") ? m(N).alarmRaised : m(N).alarmSeconds(Math.ceil((m(ia).alarmTicks - m(d).alarmTicks) / m(K).hz))), 1)) : G("", !0),
      m(r) || g.value || e.generationActive ? (z(), I("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: Q,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": m(N).noticeTitle,
        tabindex: "-1"
      }, [k("p", null, R(g.value ? m(N).renderError : e.generationActive ? m(N).generation : m(r)), 1), g.value ? (z(), I("button", {
        key: 0,
        type: "button",
        onClick: D[4] || (D[4] = (L) => {
          g.value = !1, w.value++;
        })
      }, R(m(N).reload), 1)) : m(s).dataInvalid.value && !e.generationActive ? (z(), I(ee, { key: 1 }, [k("p", null, R(m(N).rebuildWarning), 1), k("button", {
        type: "button",
        disabled: m(i),
        onClick: D[5] || (D[5] = (...L) => m(s).rebuild && m(s).rebuild(...L))
      }, R(m(N).rebuild), 9, Z1)], 64)) : e.generationActive ? G("", !0) : (z(), I("button", {
        key: 2,
        type: "button",
        disabled: m(i),
        onClick: D[6] || (D[6] = (L) => m(s).recoveryRequired.value ? Nt() : m(s).dismissError())
      }, R(m(s).recoveryRequired.value ? m(N).recover : m(N).acknowledge), 9, U1))], 8, O1)) : G("", !0),
      m(u) && !m(r) && (y.value !== "person" || A.value !== m(u).person) ? (z(), I("aside", N1, [
        k("strong", null, R(m(qe)(m(u).person)), 1),
        k("p", null, R(m(St)(m(u))), 1),
        m(u).text ? (z(), I("details", D1, [k("summary", null, R(m(N).receivedReply), 1), k("p", F1, R(m(u).text), 1)])) : G("", !0),
        k("button", {
          type: "button",
          onClick: D[7] || (D[7] = (...L) => m(s).dismissConversationFailure && m(s).dismissConversationFailure(...L))
        }, R(m(N).acknowledge), 1)
      ])) : G("", !0),
      x.value && m(d) && !m(r) && !g.value && !e.generationActive && (y.value || p.value || m(d).phase === "reward" || m(d).phase === "lost") ? (z(), I("div", {
        key: 8,
        class: "ember-curtain",
        style: Gt(y.value === "person" ? ke.value : void 0)
      }, [k("section", {
        ref_key: "dialog",
        ref: C,
        class: lt(["ember-panel", {
          "ember-wide": y.value === "map" || y.value === "build" && _.value === "wardrobe",
          "ember-map-panel": y.value === "map",
          "ember-wardrobe-panel": y.value === "build" && _.value === "wardrobe",
          "ember-dialogue": y.value === "person"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": P.value,
        tabindex: "-1"
      }, [y.value !== "map" && y.value !== "person" ? (z(), I("header", q1, [
        k("h2", null, R(P.value), 1),
        y.value === "build" ? (z(), I("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": m(N).build
        }, [k("button", {
          type: "button",
          "aria-pressed": _.value === "relics",
          onClick: D[8] || (D[8] = (L) => _.value = "relics")
        }, R(m(ce).equipment), 9, H1), k("button", {
          type: "button",
          "aria-pressed": _.value === "wardrobe",
          onClick: D[9] || (D[9] = (L) => _.value = "wardrobe")
        }, R(m(N).wardrobe), 9, V1)], 8, W1)) : G("", !0),
        y.value !== "prologue" && m(d).pendingParley?.decision !== "attack" && (y.value || m(d).phase !== "lost" && m(d).phase !== "reward") ? (z(), I("button", {
          key: 1,
          type: "button",
          disabled: !!m(d).pendingParley && m(c),
          onClick: B
        }, R(m(N).close), 9, G1)) : G("", !0)
      ])) : G("", !0), y.value === "map" ? (z(), Mt(Ll, {
        key: 1,
        campaign: m(d),
        onClose: B
      }, null, 8, ["campaign"])) : y.value === "prologue" ? (z(), I(ee, { key: 2 }, [k("p", Y1, R(m(N).opening), 1), k("button", {
        class: "ember-primary",
        type: "button",
        onClick: B
      }, R(m(N).start), 1)], 64)) : y.value === "journal" ? (z(), I(ee, { key: 3 }, [k("p", Q1, R(m(Nn)(m(d))), 1), k("ol", K1, [(z(!0), I(ee, null, Ie(m(d).facts, (L) => (z(), I("li", { key: L }, R(m(Ss)[L]), 1))), 128))])], 64)) : y.value === "build" ? (z(), I(ee, { key: 4 }, [_.value === "wardrobe" && m(n) ? (z(), Mt(oc, {
        key: 0,
        data: m(n).data,
        traveler: m(d).traveler,
        balance: m(n).balance,
        blocked: m(c),
        weapon: m(d).weapon,
        onCommand: V
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : (z(), I(ee, { key: 1 }, [
        k("div", X1, [k("strong", null, R(m(d).traveler.name), 1), k("span", null, [
          ze(R(m(ce).genders[m(d).traveler.gender]), 1),
          m(d).traveler.appearanceAge ? (z(), I(ee, { key: 0 }, [ze(" · " + R(m(ua)[m(d).traveler.appearanceAge]), 1)], 64)) : G("", !0),
          ze(" · " + R(m(ce).identityRole), 1)
        ])]),
        k("small", null, R(m(N).slots(m(d).equipped.length, m(K).relicSlots)), 1),
        k("p", null, R(m(_t)[m(d).weapon].name) + " · " + R(m(Pr)(m(d).weapon)), 1),
        m(Me)[m(d).location.scene].safe ? G("", !0) : (z(), I("p", J1, R(m(N).safeBuild), 1)),
        m(d).collection.length ? G("", !0) : (z(), I("p", eh, R(m(N).emptyBuild), 1)),
        k("div", th, [(z(!0), I(ee, null, Ie(fa.value, (L) => (z(), I("article", { key: L.id }, [
          Ze(Et, { name: L.id }, null, 8, ["name"]),
          k("h3", null, [ze(R(m(va)[L.id].name) + " ", 1), k("small", null, R(m(ne).rank(L.rank)), 1)]),
          k("p", null, R(m(va)[L.id].detail), 1),
          L.issue === "dependency" || L.issue === "capacity" ? (z(), I("small", ah, R(m(N).loadoutIssue[L.issue]), 1)) : G("", !0),
          k("button", {
            type: "button",
            disabled: m(c) || !!L.issue,
            onClick: (Se) => V({
              type: "loadout",
              equipped: L.equipped
            })
          }, R(m(d).equipped.includes(L.id) ? m(N).takeOff : m(N).putOn), 9, nh)
        ]))), 128))])
      ], 64))], 64)) : y.value === "person" ? (z(), I(ee, { key: 5 }, [
        k("header", sh, [
          k("div", rh, [k("h2", null, R(m(qe)(A.value)), 1), k("small", null, R(m(se).scenes[m(d).location.scene]), 1)]),
          (z(), Mt(qc, {
            key: A.value,
            campaign: m(d),
            person: A.value,
            draft: T.value,
            "memory-state": m(n)?.memories?.[A.value],
            blocked: m(c),
            onRetryMemory: D[10] || (D[10] = (L) => m(s).retryMemory(A.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !xe.value && m(d).pendingParley?.decision !== "attack" ? (z(), I("button", {
            key: 0,
            type: "button",
            disabled: !!m(d).pendingParley && m(c),
            onClick: B
          }, R(m(N).close), 9, oh)) : G("", !0)
        ]),
        k("div", {
          ref_key: "transcript",
          ref: Z,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          onScroll: nt
        }, [
          Qe.value ? (z(), Mt(cs, {
            key: 0,
            person: A.value,
            reply: Qe.value.reply,
            performance: Qe.value.performance,
            animate: !1
          }, null, 8, [
            "person",
            "reply",
            "performance"
          ])) : G("", !0),
          (z(!0), I(ee, null, Ie(Be.value, (L) => (z(), I(ee, { key: L.id }, [
            L.kind !== "greeting" ? (z(), I("p", ih, [k("small", null, R(m(d).traveler.name), 1), ze(R(L.player), 1)])) : G("", !0),
            L.issue === "action_rejected" || L.issue === "clothing_rejected" || L.issue === "reply_invalid" || L.issue === "reply_incomplete" ? (z(), I("p", lh, R(m(fe).issues[L.issue]), 1)) : G("", !0),
            L.kind === "receipt" && L.issue === "reply_invalid" ? (z(), I("details", ch, [k("summary", null, R(m(fe).rawReply), 1), k("p", dh, R(L.reply), 1)])) : L.kind === "receipt" ? (z(), I("p", uh, R(L.reply), 1)) : (z(), I("div", {
              key: 4,
              class: "ember-npc-turn",
              "data-fresh-reply": Ae.value === L.id
            }, [
              Ze(cs, {
                person: A.value,
                reply: L.reply,
                performance: L.performance,
                animate: Ae.value === L.id
              }, null, 8, [
                "person",
                "reply",
                "performance",
                "animate"
              ]),
              Ze(Gd, {
                campaign: m(d),
                person: A.value,
                turn: L
              }, null, 8, [
                "campaign",
                "person",
                "turn"
              ]),
              L.clothing ? (z(), Mt(Xd, {
                key: 0,
                clothing: L.clothing
              }, null, 8, ["clothing"])) : G("", !0)
            ], 8, hh))
          ], 64))), 128)),
          Re.value ? (z(), I(ee, { key: 1 }, [k("p", {
            class: "ember-player-line",
            "aria-busy": Re.value.status === "sending"
          }, [k("small", null, R(m(d).traveler.name), 1), ze(R(Re.value.text), 1)], 8, fh), he.value ? (z(), I("p", ph, R(m(fe).sendFailed), 1)) : G("", !0)], 64)) : G("", !0),
          m(u)?.person === A.value && !Be.value.some((L) => L.id === m(u)?.actionId) ? (z(), I("div", mh, [
            k("p", null, R(m(St)(m(u))), 1),
            m(u).text ? (z(), I("details", vh, [k("summary", null, R(m(N).receivedReply), 1), k("p", gh, R(m(u).text), 1)])) : G("", !0),
            k("button", {
              type: "button",
              onClick: D[11] || (D[11] = (...L) => m(s).dismissConversationFailure && m(s).dismissConversationFailure(...L))
            }, R(m(N).acknowledge), 1)
          ])) : G("", !0),
          m(o) ? (z(), I("p", bh, R(m(N).thinking), 1)) : G("", !0)
        ], 544),
        Ze(Dd, {
          modelValue: T.value,
          "onUpdate:modelValue": D[12] || (D[12] = (L) => T.value = L),
          blocked: m(c) || Y.value || e.generationActive,
          talking: m(o),
          "can-regenerate": !!He.value || he.value,
          retrying: he.value,
          conclusion: ut.value,
          onSend: ma,
          onRegenerate: ea,
          onContinue: at,
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
      ], 64)) : y.value === "passage" ? (z(), I("p", yh, R(m(se).passages[j.value].body), 1)) : y.value === "arrival" ? (z(), I(ee, { key: 7 }, [
        k("img", {
          class: "ember-story-art",
          src: m(ss).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, wh),
        k("p", xh, R(m(N).received), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: B
        }, R(m(N).resume), 1)
      ], 64)) : y.value === "ending" ? (z(), I(ee, { key: 8 }, [
        k("img", {
          class: "ember-story-art",
          src: m(ss).ending,
          alt: "",
          decoding: "async"
        }, null, 8, Mh),
        k("h2", null, R(m(N).endingTitle), 1),
        k("p", _h, R(m(N).ending), 1),
        k("strong", kh, R(m(N).continued), 1),
        k("p", null, R(m(N).optional), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: B
        }, R(m(N).remain), 1)
      ], 64)) : m(d).phase === "reward" ? (z(), I(ee, { key: 9 }, [
        k("p", null, R(m(N).rewardDetail), 1),
        k("div", Sh, [(z(!0), I(ee, null, Ie(m(d).offers, (L) => (z(), I("button", {
          key: L.id,
          type: "button",
          disabled: m(c),
          onClick: (Se) => V({
            type: "relic",
            id: L.id
          })
        }, [
          Ze(Et, { name: L.id }, null, 8, ["name"]),
          k("h3", null, [ze(R(m(va)[L.id].name) + " ", 1), k("small", null, R(m(ne).rank(L.rank)), 1)]),
          k("p", null, R(m(va)[L.id].detail), 1)
        ], 8, Rh))), 128))]),
        k("button", {
          type: "button",
          disabled: m(c),
          onClick: D[13] || (D[13] = (L) => V({ type: "leave" }))
        }, R(m(N).skip), 9, $h)
      ], 64)) : m(d).phase === "lost" ? (z(), I(ee, { key: 10 }, [
        k("p", Ch, R(m(N).fallenDetail), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: m(c),
          onClick: D[14] || (D[14] = (L) => V({ type: "retry" }))
        }, R(m(N).retry), 9, zh),
        k("button", {
          type: "button",
          disabled: m(c),
          onClick: D[15] || (D[15] = (L) => V({ type: "retreat" }))
        }, R(m(N).retreat), 9, Ph)
      ], 64)) : (z(), I(ee, { key: 11 }, [
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!m(r) || e.generationActive,
          onClick: B
        }, R(m(N).resume), 9, Ih),
        k("div", Eh, [k("button", {
          type: "button",
          "aria-pressed": v.value,
          onClick: D[16] || (D[16] = (L) => v.value = !v.value)
        }, R(m(N).sound), 9, Ah)]),
        k("details", null, [
          k("summary", null, R(m(ce).controls), 1),
          k("p", Lh, R(m(N).controls), 1),
          k("p", Th, R(m(N).touchControls), 1)
        ]),
        k("button", {
          type: "button",
          onClick: Xt
        }, R(m(ce).title), 1)
      ], 64))], 10, B1)], 4)) : G("", !0)
    ]));
  }
}), Vh = jh;
export {
  Vh as default
};
