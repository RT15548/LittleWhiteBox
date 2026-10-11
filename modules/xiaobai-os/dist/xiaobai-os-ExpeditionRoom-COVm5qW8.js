/* eslint-disable */
import { $ as Ot, A as Zn, D as Te, E as Fe, I as ja, J as vs, M as zt, N as _n, P as Pt, Q as Un, R as Ft, S as z, T as Pe, U as Ee, V as $, W as Nn, X as pe, at as jt, b as kt, c as lr, ct as cr, d as kn, dt as Qt, ft as R, h as ee, i as Dn, l as gs, lt as p, m as gt, nt as ur, p as dr, q as bs, r as ys, rt as F, u as hr, ut, v as V, x as G, y as S } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Ge } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as fr, r as en, t as pr } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as mr } from "./xiaobai-os-conversation-window-DzAyxmj6.js";
import { t as vr } from "./xiaobai-os-constants-CDXgazQ7.js";
import { C as la, Ct as gr, Ft as Fn, Lt as dt, Pt as br, S as yr, St as ws, T as Bn, Tt as wr, X as bt, Y as xs, Z as xr, _ as on, _t as Mr, a as Pa, bt as tn, d as Sn, et as Ms, h as _r, kt as kr, l as Sr, n as _s, o as Rr, p as Cr, st as ks, vt as $r, w as Ss, wt as Wn, x as zr, xt as Rn, y as qn, yt as Pr } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as Rs } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
import { C as Cs, S as Ir, _ as je, a as St, b as $s, c as N, d as ue, f as ln, g as zs, h as Er, i as Ma, l as Ps, m as fe, n as cn, o as Ct, p as ct, r as Gt, s as Ar, t as ne, u as Hn, v as X, x as ke, y as Ut } from "./xiaobai-os-copy-Ceg3mEjV.js";
function Za(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Lr(e, t, s) {
  const a = [...t], n = [];
  for (; a.length && n.length < s; ) n.push(a.splice(Math.floor(Za(e) * a.length), 1)[0]);
  return n;
}
function an() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function we(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function Ie(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var Tr = 1e-9;
function Yt(e, t, s) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (s + 0.5) * e.cellSize
  };
}
function Nt(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function Is(e, t) {
  const s = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!s || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((o) => o.length !== s || /[^.# ]/.test(o))) && Ie("map_invalid");
  const n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  for (const o of e.gates) {
    (!o.id || n.has(o.id) || !o.cells.length) && Ie("map_invalid"), n.add(o.id);
    const l = !t.has(o.id);
    l && c.add(o.id);
    for (const { column: u, row: h } of o.cells) {
      (!Number.isInteger(u) || !Number.isInteger(h) || u < 0 || u >= s || e.rows[h]?.[u] !== ".") && Ie("map_invalid");
      const d = h * s + u;
      r.has(d) && Ie("map_invalid"), r.add(d), l && i.add(d);
    }
  }
  for (const o of t) n.has(o) || Ie("gate_unknown");
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
function Ia(e, t, s, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), r = Math.max(s - e.y, 0, e.y - s - a);
  return n * n + r * r;
}
function _a(e, t, s) {
  const a = s.x - t.x, n = s.y - t.y, r = a * a + n * n, i = r === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / r));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function Es(e, t, s, a, n) {
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
    const u = (l - c) / o, h = (l + n - c) / o;
    if (r = Math.max(r, Math.min(u, h)), i = Math.min(i, Math.max(u, h)), r >= i) return !1;
  }
  return r < i;
}
function Or(e, t, s, a, n) {
  return Es(e, t, s, a, n) ? 0 : Math.min(Ia(e, s, a, n), Ia(t, s, a, n), _a({
    x: s,
    y: a
  }, e, t), _a({
    x: s + n,
    y: a
  }, e, t), _a({
    x: s,
    y: a + n
  }, e, t), _a({
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
  ].every(Number.isFinite) || a < 0) && Ie("input_invalid");
  const { map: n } = e, r = n.cellSize, i = Nt(n, {
    x: Math.min(t.x, s.x) - a,
    y: Math.min(t.y, s.y) - a
  }), c = Nt(n, {
    x: Math.max(t.x, s.x) + a,
    y: Math.max(t.y, s.y) + a
  });
  for (let o = i.row; o <= c.row; o++) for (let l = i.column; l <= c.column; l++) {
    if (!e.blocked(l, o)) continue;
    const u = n.origin.x + l * r, h = n.origin.y + o * r;
    if (a === 0 ? Es(t, s, u, h, r) || Ia(t, u, h, r) === 0 && Ia(s, u, h, r) === 0 : Or(t, s, u, h, r) < a * a - Tr) return !1;
  }
  return !0;
}
var Mt = (e, t, s) => Le(e, t, t, s);
function Cn(e, t, s, a) {
  [s.x, s.y].every(Number.isFinite) || Ie("input_invalid"), Mt(e, t, a) || Ie("position_blocked");
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
    for (const h of u) {
      const d = {
        ...t,
        [h]: t[h] + (h === "x" ? i : c)
      };
      Le(e, t, d, a) && Object.assign(t, d);
    }
  }
}
function un(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function _t(e) {
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
  ].every(Number.isInteger)) && Ie("map_invalid");
  const r = t.features.map((u) => u.id);
  new Set(r).size !== r.length && Ie("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && Ie("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + s.width || u.z + u.depth / 2 > a.y + s.depth) && Ie("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([h, d], m) => !Number.isFinite(h) || !Number.isFinite(d) || m > 0 && h === u.points[m - 1][0] && d === u.points[m - 1][1])) && Ie("map_invalid");
  const i = [];
  for (let u = 0; u < s.depth; u++) {
    let h = "";
    for (let d = 0; d < s.width; d++) {
      const m = {
        x: a.x + d + 0.5,
        y: a.y + u + 0.5
      };
      h += t.features.some((v) => v.kind !== "arch" && un(m, v.footprint)) ? "#" : ".";
    }
    i.push(h);
  }
  const c = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((u) => {
      const h = u.footprint, d = [];
      for (let m = h.z - h.depth / 2 - a.y; m < h.z + h.depth / 2 - a.y; m++) for (let v = h.x - h.width / 2 - a.x; v < h.x + h.width / 2 - a.x; v++) d.push({
        column: v,
        row: m
      });
      return {
        id: u.id,
        cells: d
      };
    })
  }, o = Is(c, new Set(c.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !Mt(o, u, X.playerRadius)) && Ie("map_invalid");
  const l = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || l.has(u.id)) && Ie("map_invalid"), l.add(u.id);
  return {
    ...e,
    map: c,
    gates: t.gates
  };
}
var C = (e, t, s, a, n, r, i = {}) => ({
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
  ...C(e, s, a, n, r, i, c),
  label: t
}), Kt = {
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
}, nn = [
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
function Ea(e) {
  return Object.hasOwn(Kt, e) ? Kt[e] : void 0;
}
function ca(e) {
  return Ea(e) ? "camp" : e;
}
var jr = _t({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(nn.map((e) => [e.to, e.position])),
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
    ...nn.map((e) => ({
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
      C("clinic", "clinic", -19, 4, 14, 10),
      C("storehouse", "storehouse", 12, -9, 12, 12),
      C("hearth", "stove", 0, 6, 4, 4),
      C("rest-bench", "bench", -5, 15, 2, 4),
      C("wagon", "wagon", 22, 3, 4, 6),
      C("supply-crates", "supplies", 20, -5, 4, 4),
      C("drying-shed", "workshop", -29, 0, 4, 10, { height: 3.5 }),
      C("herbs-small", "medicine", -23, 10, 6, 2),
      C("menders-home", "dwelling", -12, 20, 4, 4, {
        height: 3.3,
        tint: "rose"
      }),
      C("eastern-home", "dwelling", 15, 20, 4, 4, { height: 4.1 }),
      C("wall-home", "dwelling", -31, -12, 4, 4, { height: 5 }),
      C("charcoal-home", "dwelling", 34, -16, 4, 4, { height: 4.7 }),
      C("pipe-home", "dwelling", -16, -19, 4, 4, { height: 3.8 }),
      C("canal-west", "water", -26, -28, 44, 4),
      C("canal-east", "water", 26, -28, 44, 4),
      C("bridge-west", "wall", -5, -28, 2, 6, { height: 0.8 }),
      C("bridge-east", "wall", 5, -28, 2, 6, { height: 0.8 }),
      C("gate-west", "wall", -26, -49, 44, 4, { height: 6 }),
      C("gate-east", "wall", 26, -49, 44, 4, { height: 6 }),
      C("west-watchtower", "tower", -8, -49, 6, 8, { height: 12 }),
      C("east-watchtower", "tower", 8, -49, 6, 8, { height: 12 }),
      C("departure-arch", "arch", 0, -49, 10, 4, { height: 8 }),
      C("west-boundary", "wall", -37, -26, 2, 62, {
        height: 7,
        wallUse: "homes"
      }),
      C("postern-bottom", "wall", -37, 25, 2, 32, {
        height: 7,
        wallUse: "homes"
      }),
      C("south-boundary", "wall", 0, 40, 96, 4, { height: 1 }),
      C("east-boundary", "wall", 46, -8, 4, 96, { height: 1.2 }),
      C("postern-end", "wall", -47, -8, 2, 100, { height: 2.4 }),
      C("north-boundary", "wall", 0, -57, 96, 2, { height: 5 }),
      C("roadside-workshop", "workshop", -17, -38, 16, 8, { height: 4 }),
      C("lookout-ruin", "ruin", 24, -38, 6, 6, { height: 3 }),
      C("arrival-home", "dwelling", -27, 28, 6, 6, { height: 4.3 }),
      C("eastern-workshop", "workshop", 28, 30, 6, 6, { height: 3.7 }),
      C("wall-row", "dwelling", -24, -21, 18, 4, { height: 4.5 }),
      C("roadside-homes", "dwelling", -8, -12, 4, 10, { height: 4.2 }),
      C("clinic-back-shed", "workshop", -20, -5, 16, 2, { height: 2.6 })
    ].map((e) => nn.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), Zr = _t({
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
      C("wall-west", "wall", -30, -32, 2, 32, { height: 3 }),
      C("wall-west-low", "wall", -30, 19, 2, 58, { height: 2 }),
      C("wall-east", "wall", 24, -25, 4, 44, { height: 7 }),
      C("rampart-tower", "tower", 24, -16, 8, 8, { height: 15 }),
      C("gate-tower-left", "tower", -8, -41, 6, 8, { height: 11 }),
      C("gate-tower-right", "tower", 8, -41, 6, 8, { height: 11 }),
      C("north-arch", "arch", 0, -41, 10, 4, { height: 8 }),
      C("west-gate-wall", "wall", -26, -43, 40, 4, { height: 5 }),
      C("east-gate-wall", "wall", 36, -43, 20, 4, { height: 5 }),
      C("road-ruin", "ruin", -12, 1, 6, 6, { height: 3.5 }),
      C("fallen-column", "ruin", 12, -2, 4, 4, { height: 1.2 }),
      C("road-tree", "tree", -17, 27, 4, 4, {
        height: 9,
        tint: "amber"
      }),
      C("roots-tree", "tree", -39, -25, 6, 6, {
        height: 13,
        tint: "sage"
      }),
      C("southern-tree", "tree", 17, 37, 4, 4, {
        height: 9,
        tint: "sage"
      }),
      C("arrival-watch-west", "tower", -8, 44, 6, 8, { height: 10 }),
      C("arrival-watch-east", "tower", 8, 44, 6, 8, { height: 10 }),
      C("arrival-arch", "arch", 0, 44, 10, 4, { height: 8 }),
      C("broken-convoy", "wagon", -12, 19, 4, 6, { damaged: !0 }),
      C("convoy-supplies", "supplies", -16, 16, 4, 4),
      C("stranded-cargo", "cargo", -24, 28, 8, 12),
      C("stranded-fuel", "fuel", 18, 25, 6, 8),
      C("old-border", "thicket", -18, -6, 14, 4),
      C("waterway-bank", "water", 37, 21, 22, 16),
      C("north-boundary", "wall", 0, -47, 96, 2, { height: 5 }),
      C("south-boundary-west", "wall", -26, 47, 44, 2, { height: 5 }),
      C("south-boundary-east", "wall", 26, 47, 44, 2, { height: 5 }),
      C("west-boundary", "wall", -47, 0, 2, 96, { height: 2 }),
      C("east-boundary", "wall", 47, 0, 2, 96, { height: 2 })
    ]
  }
}), Ur = _t({
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
      C("outer-west", "wall", -35, 0, 2, 80, { height: 8 }),
      C("outer-east", "wall", 35, 0, 2, 80, { height: 8 }),
      C("north-wall", "wall", 0, -39, 72, 2, { height: 9 }),
      C("south-wall", "wall", 0, 39, 72, 2, { height: 5 }),
      C("gate-tower-west", "tower", -10, -27, 8, 12, { height: 16 }),
      C("gate-tower-east", "tower", 10, -27, 8, 12, { height: 16 }),
      C("main-arch", "arch", 0, -27, 12, 6, { height: 12 }),
      C("gate-flank-west", "wall", -25, -27, 22, 6, { height: 9 }),
      C("gate-flank-east", "wall", 25, -27, 22, 6, { height: 9 }),
      C("west-pillars", "ruin", -13, -3, 6, 4, { height: 4.8 }),
      C("east-pillars", "ruin", 13, -3, 6, 4, { height: 4.8 }),
      C("western-barracks", "storehouse", -25, 2, 12, 12),
      C("eastern-barracks", "storehouse", 25, 2, 12, 12),
      C("awaiting-inspection", "cargo", -15, 23, 4, 12),
      C("cleared-consignments", "cargo", 15, 23, 4, 12),
      C("inspection-cart", "wagon", 25, 19, 4, 6),
      C("inspection-crates", "supplies", 28, 25, 4, 4),
      C("barracks-tree", "tree", -27, 26, 4, 4, {
        height: 9,
        tint: "amber"
      })
    ]
  }
}), Nr = _t({
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
      C("west-parapet", "wall", -35, 0, 2, 84, { height: 3 }),
      C("east-parapet", "wall", 35, 0, 2, 84, { height: 3 }),
      C("north-wall", "wall", 0, -41, 72, 2, { height: 9 }),
      C("south-wall", "wall", 0, 41, 72, 2, { height: 5 }),
      C("signal-brazier", "beacon", 0, -8, 6, 6),
      C("west-signal-column", "column", -20, -10, 4, 4, { height: 11 }),
      C("east-signal-column", "column", 20, -10, 4, 4, { height: 11 }),
      C("west-approach-column", "column", -20, 12, 4, 4, { height: 8 }),
      C("east-approach-column", "column", 20, 12, 4, 4, { height: 8 }),
      C("hall-tower-west", "tower", -10, -30, 8, 8, { height: 16 }),
      C("hall-tower-east", "tower", 10, -30, 8, 8, { height: 16 }),
      C("hall-arch", "arch", 0, -30, 12, 4, { height: 12 }),
      C("signal-fuel", "fuel", -27, 19, 8, 22),
      C("signal-reserve", "cargo", 27, 19, 8, 22),
      C("west-copper-store", "supplies", -26, -23, 6, 6),
      C("east-copper-store", "supplies", 26, -23, 6, 6)
    ]
  }
}), Dr = _t({
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
      C("west-wall", "wall", -31, 0, 2, 88, { height: 7 }),
      C("east-wall", "wall", 31, 0, 2, 88, { height: 7 }),
      C("north-wall", "wall", 0, -43, 64, 2, { height: 8 }),
      C("south-wall", "wall", 0, 43, 64, 2, { height: 8 }),
      C("upper-channel-west", "water", -24, -3, 12, 58),
      C("upper-channel-east", "water", 23, -12, 14, 48),
      C("lower-channel-west", "water", -13, 32, 30, 20),
      C("lower-channel-east", "water", 28, 32, 4, 20),
      C("sluice-west-abutment", "wall", -18, 16, 24, 4, { height: 5 }),
      C("sluice-east-abutment", "wall", 18, 16, 24, 4, { height: 5 }),
      C("upper-pier-west", "column", -15, -18, 4, 4, { height: 9 }),
      C("upper-pier-east", "column", 11, -18, 4, 4, { height: 9 }),
      C("lower-pier-west", "column", -13, 0, 4, 4, { height: 9 }),
      C("lower-pier-east", "column", 13, 0, 4, 4, { height: 9 }),
      C("vault-north", "arch", -2, -18, 26, 2, { height: 10 }),
      C("vault-middle", "arch", 0, 0, 26, 2, { height: 10 }),
      C("entry-marker", "ruin", -24, -39, 6, 2, { height: 5 }),
      C("maintenance-supplies", "supplies", 8, 36, 4, 4)
    ]
  }
}), Fr = _t({
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
      C("west-wall", "wall", -31, 0, 2, 76, { height: 6 }),
      C("east-wall", "wall", 31, 0, 2, 76, { height: 6 }),
      C("north-wall", "wall", 0, -37, 64, 2, { height: 8 }),
      C("south-wall", "wall", 0, 37, 64, 2, { height: 6 }),
      C("cells-divider", "wall", 0, -24, 2, 28, { height: 6 }),
      C("cells-front-center", "wall", 0, -10, 20, 2, { height: 6 }),
      C("cells-front-west", "wall", -26, -10, 12, 2, { height: 6 }),
      C("cells-front-east", "wall", 26, -10, 12, 2, { height: 6 }),
      C("postern-divider", "wall", -7, 24, 50, 2, { height: 5 }),
      C("waterway-passage", "arch", -21, 19, 10, 2, { height: 7 }),
      C("postern-corridor", "wall", 17, 31, 2, 12, { height: 5 }),
      C("west-bunk", "bunk", -26, -24, 4, 8),
      C("east-bunk", "bunk", 26, -24, 4, 8),
      C("west-cell-bench", "bench", -8, -30, 2, 4),
      C("east-cell-bench", "bench", 8, -30, 2, 4),
      C("guard-desk", "ledger", 3, 12, 4, 4),
      C("hall-pier-west", "column", -7, -4, 2, 2, { height: 7 }),
      C("hall-pier-east", "column", 7, -4, 2, 2, { height: 7 })
    ]
  }
}), Br = _t({
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
      C("west-wall", "wall", -39, 0, 2, 92, { height: 11 }),
      C("east-wall", "wall", 39, 0, 2, 92, { height: 11 }),
      C("north-wall", "wall", 0, -45, 80, 2, { height: 13 }),
      C("south-wall", "wall", 0, 45, 80, 2, { height: 8 }),
      C("western-front-column", "column", -15, 17, 4, 4, { height: 12 }),
      C("eastern-front-column", "column", 15, 17, 4, 4, { height: 12 }),
      C("western-middle-column", "column", -15, -3, 4, 4, { height: 12 }),
      C("eastern-middle-column", "column", 15, -3, 4, 4, { height: 12 }),
      C("western-rear-column", "column", -15, -25, 4, 4, { height: 12 }),
      C("eastern-rear-column", "column", 15, -25, 4, 4, { height: 12 }),
      C("entry-vault", "arch", 0, 17, 30, 2, { height: 14 }),
      C("rear-vault", "arch", 0, -25, 30, 2, { height: 14 }),
      C("west-gallery", "planter", -32, 4, 6, 28),
      C("east-gallery", "planter", 32, 4, 6, 28),
      C("west-gallery-bench", "bench", -28, 28, 2, 6),
      C("east-gallery-bench", "bench", 28, 28, 2, 6),
      C("crown-console", "ledger", 0, -41, 6, 4),
      C("northern-west-pillar", "column", -29, -35, 4, 4, { height: 14 }),
      C("northern-east-pillar", "column", 29, -35, 4, 4, { height: 14 })
    ]
  }
}), Wr = _t({
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
      C("west-enclosure", "wall", -39, 0, 2, 84, { height: 3 }),
      C("east-enclosure", "wall", 39, 0, 2, 84, { height: 3 }),
      C("north-enclosure", "wall", 0, -41, 80, 2, { height: 4 }),
      C("south-enclosure", "wall", 0, 41, 80, 2, { height: 3 }),
      C("dead-heartwood", "root", 0, -29, 12, 10, { height: 17 }),
      C("western-root", "root", -22, -15, 8, 4, { height: 3.8 }),
      C("eastern-root", "root", 22, -11, 8, 4, { height: 3.2 }),
      C("west-reflecting-pool", "water", -26, 9, 12, 16),
      C("east-reflecting-pool", "water", 26, 9, 12, 16),
      C("west-old-colonnade", "ruin", -15, 7, 4, 4, { height: 5 }),
      C("east-old-colonnade", "ruin", 15, 9, 4, 4, { height: 4 }),
      C("western-growth", "thicket", -29, -27, 14, 12),
      C("eastern-growth", "thicket", 29, -27, 14, 12),
      C("west-entry-pillar", "column", -7, 30, 4, 4, { height: 7 }),
      C("east-entry-pillar", "column", 7, 30, 4, 4, { height: 7 }),
      C("garden-arch", "arch", 0, 30, 14, 2, { height: 9 }),
      C("west-entry-tree", "tree", -21, 29, 6, 6, {
        height: 12,
        tint: "rose"
      }),
      C("east-entry-tree", "tree", 23, 29, 6, 6, {
        height: 12,
        tint: "sage"
      }),
      C("west-north-tree", "tree", -18, -33, 6, 6, {
        height: 14,
        tint: "sage"
      }),
      C("east-north-tree", "tree", 18, -33, 6, 6, {
        height: 14,
        tint: "rose"
      })
    ]
  }
}), qr = Object.fromEntries(Object.entries(Kt).map(([e, t]) => {
  const { width: s, depth: a } = t, n = s / 2, r = a / 2, i = [C("west-wall", "wall", -n + 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  }), C("east-wall", "wall", n - 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const o of ["north", "south"]) {
    const l = (o === "north" ? -1 : 1) * (r - 0.5);
    if (t.doors.some((u) => u.side === o)) {
      i.push(C(`${o}-door`, "door", 0, l, 4, 1));
      for (const u of [-1, 1]) i.push(C(`${o}-${u}`, "wall", u * (n + 2) / 2, l, n - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else i.push(C(`${o}-wall`, "wall", 0, l, s, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const c = e === "guest_room" ? t.furniture.find((o) => o.kind === "bed").footprint : null;
  return [e, _t({
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
})), _e = {
  camp: jr,
  crossroads: Zr,
  gate: Ur,
  beacon: Nr,
  waterway: Dr,
  cells: Fr,
  hall: Br,
  roots: Wr,
  ...qr
};
function Vn(e) {
  return !e || _e[e.location.scene].safe && e.phase === "exploration";
}
var lt = {
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
function sn(e, t) {
  const s = lt[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || s.achievement !== null && e.awards.some((a) => a.key === s.achievement);
}
var ve = (e, t, s = 0) => ({
  family: e,
  chapter: s,
  ...t ? { requires: [t] } : {}
}), ie = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), fa = {
  "storm-step": ve("storm"),
  conductor: ve("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: ve("storm"),
  cinder: ve("fire"),
  wildfire: ve("fire", ["cinder", "inferno"]),
  "blood-price": ve("risk"),
  frost: ve("frost"),
  shatter: ve("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: ve("skill"),
  hunter: {
    ...ve("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: ve("blade"),
  orbit: ve("storm"),
  thorns: ve("guard"),
  aegis: ve("guard"),
  siphon: ve("life"),
  focus: ve("skill"),
  renewal: ve("life"),
  execution: ve("blade"),
  "last-stand": ve("guard", void 0, 1),
  quicksilver: ve("skill"),
  magnet: ve("skill"),
  wardstone: ve("guard"),
  pilgrim: ve("life"),
  gambit: ve("risk", void 0, 1),
  riposte: ie("blade"),
  "shield-break": ie("blade"),
  "cleave-wave": ie("blade", 1),
  duelist: ie("blade"),
  "blood-dance": ie("blade"),
  valor: ie("blade", 1),
  ricochet: ie("bow"),
  "split-arrow": ie("bow"),
  pinning: ie("bow"),
  "distance-draw": ie("bow"),
  "hunter-mark": ie("bow", 1),
  trapper: ie("bow"),
  nova: ie("staff"),
  inferno: {
    ...ie("staff"),
    requires: [["cinder"]]
  },
  fracture: {
    ...ie("staff"),
    requires: [[
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  overload: {
    ...ie("staff", 1),
    requires: [["cinder"], [
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  orbitals: ie("staff"),
  convergence: ie("staff"),
  backstab: ie("daggers"),
  shadowstep: ie("daggers"),
  hemorrhage: ie("daggers"),
  "execution-chain": ie("daggers", 1),
  smoke: ie("daggers"),
  venom: ie("daggers"),
  "pack-bond": ie("grimoire"),
  martyr: ie("grimoire"),
  covenant: ie("grimoire"),
  frenzy: ie("grimoire"),
  "soul-harvest": ie("grimoire", 1),
  command: ie("grimoire"),
  shrapnel: ie("cannon"),
  minefield: ie("cannon"),
  overclock: ie("cannon"),
  bunker: ie("cannon"),
  salvage: ie("cannon"),
  railgun: ie("cannon", 1)
}, A = (e, t) => e.relics.find((s) => s.id === t)?.rank ?? 0;
function Hr(e) {
  return zs.filter((t) => !fa[t].weapons || fa[t].weapons.includes(e));
}
function As(e, t, s = null) {
  const a = fa[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((r) => r !== s && A(e, r) > 0)));
}
var $t = Math.PI * 2, H = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), ge = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), $n = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, tt = (e, t, s) => ({
  x: e.x + Math.cos(t) * s,
  y: e.y + Math.sin(t) * s
});
function nt(e, t, s, a, n, r) {
  if (r) {
    Cn(r.space, t, {
      x: Math.cos(s) * a,
      y: Math.sin(s) * a
    }, n);
    return;
  }
  t.x += Math.cos(s) * a, t.y += Math.sin(s) * a;
  for (const i of e.obstacles) {
    const c = H(t, i), o = n + i.radius;
    if (c < o) {
      const l = c < 1e-3 ? s : ge(i, t);
      t.x = i.x + Math.cos(l) * o, t.y = i.y + Math.sin(l) * o;
    }
  }
  t.x = Math.max(-X.arena + n, Math.min(X.arena - n, t.x)), t.y = Math.max(-X.arena + n, Math.min(X.arena - n, t.y));
}
function Vr(e, t, s, a) {
  const n = e.x - t.x, r = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(s) + r * Math.sin(s)));
  return Math.hypot(n - Math.cos(s) * i, r - Math.sin(s) * i);
}
var Gr = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], rn = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function pa(e, t, s, a) {
  if (!Mt(e, t, a) || !Mt(e, s, a)) return null;
  if (Le(e, t, s, a)) return [{ ...s }];
  const { map: n, columns: r, rows: i } = e, c = Nt(n, t), o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), h = [];
  function d(v) {
    return Yt(n, v % r, Math.floor(v / r));
  }
  function m(v, g, w, _) {
    if (v < 0 || v >= r || g < 0 || g >= i) return;
    const M = g * r + v;
    u.has(M) || (o.get(M) ?? 1 / 0) <= w || (o.set(M, w), l.set(M, _), h.push({
      id: M,
      score: w + rn(d(M), s)
    }));
  }
  for (let v = -1; v <= 1; v++) for (let g = -1; g <= 1; g++) {
    const w = c.column + g, _ = c.row + v, M = Yt(n, w, _);
    Le(e, t, M, a) && m(w, _, rn(t, M), -1);
  }
  for (; h.length; ) {
    h.sort((w, _) => _.score - w.score || _.id - w.id);
    const { id: v } = h.pop();
    if (u.has(v)) continue;
    u.add(v);
    const g = d(v);
    if (Le(e, g, s, a)) {
      const w = [{ ...s }];
      let _ = v;
      for (; _ !== -1; )
        w.push(d(_)), _ = l.get(_);
      w.reverse();
      const M = [];
      let k = t;
      for (let b = 0; b < w.length; ) {
        let x = b;
        for (; x + 1 < w.length && Le(e, k, w[x + 1], a); ) x++;
        k = w[x], M.push(k), b = x + 1;
      }
      return M;
    }
    for (const [w, _] of Gr) {
      const M = v % r + w, k = Math.floor(v / r) + _, b = Yt(n, M, k);
      Le(e, g, b, a) && m(M, k, o.get(v) + rn(g, b), v);
    }
  }
  return null;
}
var Gn = (e) => !ke(e) || e === "warden" || e === "thornheart", re = (e, t, s, a = 0) => !e || Le(e.space, t, s, a);
function Yr(e, t, s) {
  return e.summonPoints.filter((a) => Mt(e.space, a, s) && pa(e.space, e.entry, a, s)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Ls(e, t, s) {
  return !e || Le(e.space, t, s, 0.3) ? s : {
    x: t.x,
    y: t.y
  };
}
function Ts(e, t, s, a) {
  if (!e) return Math.atan2(s.y - t.y, s.x - t.x);
  let n = s;
  if (!Mt(e.space, n, a)) {
    const i = [], c = a + e.space.map.cellSize, o = Nt(e.space.map, {
      x: s.x - c,
      y: s.y - c
    }), l = Nt(e.space.map, {
      x: s.x + c,
      y: s.y + c
    });
    for (let h = Math.max(0, o.row); h <= Math.min(e.space.rows - 1, l.row); h++) for (let d = Math.max(0, o.column); d <= Math.min(e.space.columns - 1, l.column); d++) {
      const m = Yt(e.space.map, d, h);
      Math.hypot(m.x - s.x, m.y - s.y) <= a + e.space.map.cellSize && Mt(e.space, m, a) && Le(e.space, m, s) && i.push(m);
    }
    i.sort((h, d) => Math.hypot(h.x - s.x, h.y - s.y) - Math.hypot(d.x - s.x, d.y - s.y));
    const u = i.find((h) => pa(e.space, t, h, a));
    if (!u) return null;
    n = u;
  }
  const r = pa(e.space, t, n, a);
  return r?.length ? Math.atan2(r[0].y - t.y, r[0].x - t.x) : null;
}
function be(e, t, s, a = 1, n = 0) {
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
function Ae(e, t, s, a) {
  if (!ke(t) && e.enemies.filter((i) => i.hp > 0).length >= X.maxEnemies) return null;
  if (a) {
    const i = Yr(a, s, fe[t].radius);
    if (!i) return null;
    s = i;
  }
  const n = fe[t].hp * (ke(t) ? 1 : 1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)), r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: n,
    maxHp: n,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Za(e) * 20),
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
function wt(e, t, s, a, n, r = {}) {
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
function me(e, t, s, a, n, r, i, c = !1, o = {}) {
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
function ot(e, t, s, a, n) {
  return me(e, t, "slam", s, a, 8, n);
}
function ze(e, t, s, a, n, r, i) {
  return me(e, t, "beam", 0, r, 9, i, !1, {
    angle: s,
    length: a,
    width: n
  });
}
function vt(e, t, s, a, n, r, i = 0.22) {
  for (let c = 0; c < a; c++) wt(e, t, s + (c / Math.max(1, a - 1) - 0.5) * n, r, !1, { speed: i });
}
function Yn(e, t, s, a, n, r = 0.16) {
  for (let i = 0; i < s; i++) wt(e, t, a + i * $t / s, n, !1, { speed: r });
}
function dn(e, t, s, a, n = 0) {
  const r = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: t === "turret" ? 65 : t === "familiar" ? ct.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(r), r;
}
var ka = (e) => e === "attack" || e === "skill";
function Os(e, t) {
  if (e.player.hp <= 0) return;
  const s = Math.min(X.maxHp - e.player.hp, t);
  e.player.hp += s, s > 0 && be(e, e.player, "heal");
}
function xt(e, t, s) {
  if (ke(t.kind)) {
    if (t.stagger += s, t.stagger < 100) return;
    t.stagger = 0, s = 24;
  }
  t.stun = Math.max(t.stun, s), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), be(e, t, "guard", 1.4);
}
function We(e, t, s, a, n, r = e.player, i) {
  if (t.hp <= 0 || !re(i, r, t)) return;
  const c = t.burn > 0 || ka(n) && A(a, "cinder") > 0, o = t.chill > 0 || ka(n) && A(a, "frost") > 0, l = (n === "skill" || n === "companion" && a.weapon === "cannon") && o && A(a, "shatter") > 0, u = ka(n) && c && o && A(a, "overload") > 0;
  let h = s * (A(a, "blood-price") ? je.bloodDamage + (A(a, "blood-price") - 1) * 0.12 : 1);
  if (A(a, "execution") && t.hp / t.maxHp < je.executeThreshold && (h *= je.executeDamage + (A(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden") && n === "attack" && Math.cos(ge(t, r) - t.angle) > 0.4 && t.exposed <= 0 && (h *= A(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !ke(t.kind) && e.enemies.some((d) => d.kind === "priest" && d.hp > 0 && H(t, d) < 3.5 && re(i, t, d)) && (h *= 0.7), n === "attack" && A(a, "backstab") && Math.cos(ge(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + A(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && A(a, "duelist") && xt(e, t, 9 * A(a, "duelist")), l) {
    h += 15 * A(a, "shatter"), t.chill = 0, be(e, t, "burst", 2.2);
    for (const d of e.enemies) d.id !== t.id && H(t, d) < 2.2 && We(e, d, 9 * A(a, "shatter"), a, "passive", t, i);
  }
  if (ka(n) && (A(a, "cinder") && (t.burn = Math.max(t.burn, 80 + A(a, "cinder") * 25)), A(a, "frost") && (t.chill = Math.max(t.chill, 45 + A(a, "frost") * 20)), (A(a, "blood-dance") || A(a, "hemorrhage")) && (t.bleed = 100 + 25 * (A(a, "blood-dance") + A(a, "hemorrhage"))), A(a, "venom") && (t.poison = 100 + A(a, "venom") * 35), u && (h += 20 * A(a, "overload"), be(e, t, "lightning")), n === "skill" && A(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + A(a, "hunter-mark") * 40)), A(a, "inferno") && c && n === "skill" && me(e, t, "fire", 1.5 + A(a, "inferno") * 0.3, 0, 70, 4 * A(a, "inferno"), !0)), u && (t.burn = 0), (u || l) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && A(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - A(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, be(e, t, "burst", ke(t.kind) ? 3 : 0.8), A(a, "wildfire") && c && me(e, t, "fire", 1.8 + A(a, "wildfire") * 0.2, 0, 90, 3 * A(a, "wildfire"), !0), A(a, "fracture") && o) for (let d = 0; d < 4 + A(a, "fracture"); d++) wt(e, t, d * $t / (4 + A(a, "fracture")), 9, !0, { source: "passive" });
    if (A(a, "siphon") && (e.kills % je.siphonEvery === 0 || ke(t.kind)) && Os(e, (ke(t.kind) ? je.siphonBossHeal : je.siphonHeal) + A(a, "siphon") - 1), A(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * A(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), A(a, "soul-harvest") && (e.player.resource = Math.min(ct.maxPower, e.player.resource + 9 * A(a, "soul-harvest"))), n === "companion" && A(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * A(a, "salvage"))), A(a, "magnet"))
      for (const d of e.enemies) d.hp > 0 && H(t, d) < 3 + A(a, "magnet") && re(i, t, d) && nt(e, d, ge(d, t), 0.7, fe[d.kind].radius, i);
  }
}
function hn(e, t, s, a, n, r = e.player) {
  const i = [t];
  if (re(n, r, t)) {
    A(s, "conductor") && i.push(...e.enemies.filter((c) => c.id !== t.id && c.hp > 0 && H(c, t) < 4.5 && re(n, t, c)).sort((c, o) => H(c, t) - H(o, t)).slice(0, A(s, "conductor") + 1));
    for (const c of i)
      be(e, c, "lightning"), We(e, c, a, s, "lightning", n ? c === t ? r : t : e.player, n);
  }
}
function js(e, t, s) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), be(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const r = A(t, "riposte"), i = A(t, "thorns");
  if (r || i)
    for (const c of e.enemies) H(c, a) < 3.2 + r * 0.3 && re(s, a, c) && (We(e, c, (n ? 20 : 8) * r + 9 * i, t, "passive", a, s), xt(e, c, n ? 20 : 7));
}
function Ua(e, t, s, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    js(e, s, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let r = t * Ut[s.weapon].guard * (A(s, "blood-price") ? je.bloodHurt : 1) * (A(s, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, r);
  if (n.ward -= i, r -= i, n.hp <= r && A(s, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + A(s, "last-stand") * 8, n.invulnerable = 60, be(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - r), e.damageTaken += r, n.invulnerable = 18, n.lastHit = e.tick, be(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), A(s, "thorns"))
    for (const c of e.enemies) H(c, n) < 3 && We(e, c, 10 * A(s, "thorns"), s, "passive", n, a);
}
function ua(e, t, s = 45) {
  e.ward += Math.max(0, Math.min(t, s - e.ward));
}
function Qn(e, t, s, a = !1, n) {
  const r = Ut[t.weapon], i = e.player, c = ge(i, s), o = (a ? 0.6 : 1) * (A(t, "gambit") ? 1 + A(t, "gambit") * 0.12 : 1);
  if (i.facing = c, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const d = r.range + A(t, "piercing") * 0.25;
    be(e, i, "slash", d, c);
    for (const m of e.enemies)
      H(i, m) > d + fe[m.kind].radius || Math.cos(ge(i, m) - c) < -0.1 || !re(n, i, m) || (We(e, m, r.damage * o, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && xt(e, m, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), A(t, "cleave-wave") && i.combo % 3 === 2 && wt(e, i, c, 14 * A(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let l = r.damage * o;
  A(t, "distance-draw") && (l *= 1 + Math.min(1, H(i, s) / 8) * 0.15 * A(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(ct.maxPower, i.resource + 12));
  const u = A(t, "piercing") * je.extraPierce + A(t, "railgun") * 2, h = wt(e, i, c, l, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + A(t, "shrapnel") * 0.3 : 0,
    bounce: A(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && A(t, "split-arrow") && i.combo % 3 === 2) for (const d of [-0.18, 0.18]) wt(e, i, c + d, l * (0.35 + A(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: u
  });
}
function Qr(e, t, s, a) {
  const n = e.player, r = Ut[t.weapon], i = A(t, "focus");
  switch (n.skill = Math.round(r.skillCooldown * (i ? je.focusSkill - (i - 1) * 0.06 : 1)), A(t, "aegis") && (n.shield = 18 + A(t, "aegis") * 6, n.guard = 8, ua(n, A(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + A(t, "aegis") * 6, n.guard = 9;
      const c = 1 + n.resource / 100;
      n.resource = 0, be(e, n, "slash", 3.6, n.facing);
      for (const o of e.enemies)
        o.hp <= 0 || H(n, o) > 3.6 + fe[o.kind].radius || !re(a, n, o) || (A(t, "shield-break") && (o.exposed = Math.max(o.exposed, 70 + 30 * A(t, "shield-break"))), We(e, o, r.skill * c, t, "skill", n, a), xt(e, o, 40), ke(o.kind) || nt(e, o, ge(n, o), 1.5, fe[o.kind].radius, a));
      A(t, "valor") && ua(n, 12 * A(t, "valor") * c);
      break;
    }
    case "bow":
      for (let c = -2; c <= 2; c++) wt(e, n, n.facing + c * 0.15, r.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      nt(e, n, n.facing + Math.PI, 0.85, X.playerRadius, a);
      break;
    case "staff": {
      const c = s ?? n, o = 1 + n.resource / 125;
      if (n.resource = 0, A(t, "convergence"))
        for (const l of e.enemies) H(l, c) < 4 + A(t, "convergence") && re(a, c, l) && nt(e, l, ge(l, c), 1.2, fe[l.kind].radius, a);
      for (let l = 0; l < 3; l++) {
        const u = tt(c, l * $t / 3, 0.7);
        me(e, re(a, c, u) ? u : c, "slam", 2.3, 10 + l * 10, 1, r.skill * o, !0, { source: "skill" });
      }
      if (A(t, "nova")) {
        me(e, n, "frost", 3 + A(t, "nova") * 0.5, 0, 32, 6 * A(t, "nova"), !0, { source: "skill" });
        for (const l of e.enemies) H(n, l) < 3.5 && re(a, n, l) && (l.chill = 120, xt(e, l, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), s) {
        const c = tt(s, s.angle + Math.PI, fe[s.kind].radius + 0.55);
        nt(e, n, ge(n, c), Math.min(5, H(n, c)), X.playerRadius, a), n.facing = ge(n, s), re(a, n, s) && (!a || H(n, s) <= r.range + fe[s.kind].radius) && (s.exposed = Math.max(s.exposed, 60), We(e, s, r.skill, t, "skill", n, a), xt(e, s, 20)), be(e, n, "slash", 2, n.facing);
      }
      A(t, "shadowstep") && dn(e, "shade", n, 95 + A(t, "shadowstep") * 30, A(t, "shadowstep"));
      break;
    case "grimoire": {
      const c = n.resource;
      n.resource = 0, n.resonance = ct.resonanceTicks + c, be(e, n, "resonance", 2);
      for (const o of e.companions) o.kind === "familiar" && o.hp > 0 && o.life > 0 && (o.hp = Math.max(o.hp, ct.familiarHp), o.cooldown = 0);
      s && (s.exposed = Math.max(s.exposed, 100), We(e, s, r.skill + c * 0.3, t, "skill", n, a)), A(t, "command") && me(e, s ?? n, "storm", 2.4 + A(t, "command") * 0.3, 10, 65, 7 * A(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const c = 1 + (A(t, "overclock") >= 2 ? 1 : 0), o = e.companions.filter((l) => l.kind === "turret");
      o.length >= c && (o[0].life = 0), dn(e, "turret", Ls(a, n, tt(n, n.facing, 0.9)), 240 + A(t, "overclock") * 45, A(t, "overclock")), A(t, "bunker") && ua(n, 15 * A(t, "bunker"));
      break;
    }
  }
}
function Kr(e, t, s, a) {
  const n = e.player, r = A(s, "quicksilver");
  if (n.dash = Math.round(X.dashCooldown * (1 - r * 0.08)), n.dashTime = X.dashTicks, n.dashAngle = t.move ? $n(t.move) : n.facing, n.invulnerable = X.dashTicks + 2, A(s, "storm-step") && me(e, n, "storm", 1.7 + A(s, "storm-step") * 0.15, 0, 70, 6 + A(s, "storm-step") * 3, !0), A(s, "trapper") && me(e, n, "frost", 1.8, 12, 110, 5 * A(s, "trapper"), !0), A(s, "minefield") && me(e, n, "mine", 2 + A(s, "minefield") * 0.2, 12, 180, 25 * A(s, "minefield"), !0), A(s, "smoke")) {
    for (const i of e.enemies) H(i, n) < 3 + A(s, "smoke") * 0.4 && re(a, n, i) && (xt(e, i, 30 + A(s, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    be(e, n, "guard", 3);
  }
}
function Xr(e, t, s, a) {
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
  const r = e.enemies.filter((l) => l.hp > 0 && re(a, n, l)).sort((l, u) => H(n, l) - H(n, u))[0];
  t.dash && !n.dash && !n.dashTime && Kr(e, t, s, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    nt(e, n, n.dashAngle, X.speed * 3.6, X.playerRadius, a), n.dashTime--, !n.dashTime && A(s, "momentum") && r && H(n, r) < 3 && hn(e, r, s, 10 + A(s, "momentum") * 5, a);
  else if (t.move) {
    n.facing = $n(t.move);
    const l = n.swing > 0;
    let u = X.speed * (l ? Ut[s.weapon].moveFire : 1);
    A(s, "quicksilver") && n.dash > X.dashCooldown / 2 && (u *= 1 + A(s, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && H(h, n) < h.radius && re(a, h, n)) && (u *= 0.65), nt(e, n, n.facing, u, X.playerRadius, a);
  }
  n.travel += H(i, n), A(s, "pilgrim") && n.travel >= 28 && (n.travel -= 28, ua(n, A(s, "pilgrim") * 6, 35)), A(s, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && ua(n, 2, A(s, "wardstone") * 10);
  const c = r && re(a, n, r) ? r : void 0;
  t.skill && !n.skill && (c && (n.facing = ge(n, c)), Qr(e, s, c, a));
  const o = Ut[s.weapon].range + (s.weapon === "blade" || s.weapon === "daggers" ? A(s, "piercing") * 0.25 : 0);
  if (c && !n.attack && H(n, c) <= o + fe[c.kind].radius && (Qn(e, s, c, !1, a), n.combo++, A(s, "echo") && n.combo % Math.max(2, je.echoEvery + 1 - A(s, "echo")) === 0 && Qn(e, s, c, !0, a), n.attack = Math.round(Ut[s.weapon].period * (A(s, "focus") ? je.focusAttack : 1))), A(s, "orbit") && e.tick % Math.round(je.orbitTicks / (1 + A(s, "orbit") * 0.25)) === 0 && r && H(n, r) < 4.5 && hn(e, r, s, 12 + A(s, "orbit") * 3, a), A(s, "orbitals") && e.tick % 35 === 0) {
    for (const l of e.enemies) H(n, l) < 2.5 + A(s, "orbitals") * 0.35 && re(a, n, l) && (We(e, l, 12 * A(s, "orbitals"), s, "passive", n, a), l.chill = Math.max(l.chill, 30));
    be(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function Jr(e, t, s) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + A(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && dn(e, "familiar", Ls(s, e.player, tt(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || re(s, a, i))).sort((i, c) => H(i, a) - H(c, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = ge(a, n), a.kind !== "turret") {
      const i = H(a, e.player) > 8;
      if (i || H(a, n) > 1.3 || !re(s, a, n)) {
        const c = Ts(s, a, i ? e.player : n, 0.25);
        c !== null && nt(e, a, c, i ? 0.19 : 0.14 + A(t, "frenzy") * 0.015, 0.25, s);
      }
    }
    const r = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && H(a, n) < r && re(s, a, n)) if (a.kind === "turret")
      wt(e, a, a.angle, Ut.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      We(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? ct.empoweredDamage : ct.damage) * (1 + A(t, "covenant") * 0.15), t, "companion", a, s), be(e, a, "slash", 1.2, a.angle);
      const c = a.kind === "shade" ? 32 : i ? ct.empoweredAttackTicks : ct.attackTicks;
      a.cooldown = Math.round(c / (1 + A(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && A(t, "martyr") && (Os(e, A(t, "martyr")), me(e, a, "slam", 2.2, 0, 1, 15 * A(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
var Rt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), Aa = [
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
function Ca(e, t, s) {
  if (e.wave++, s) {
    for (const r of s.waves[e.wave - 1]) Ae(e, r.kind, r.position);
    return;
  }
  if (e.boss) {
    Ae(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = Er[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let r = 0; r < n; r++) {
    const i = $t * r / n + (e.wave - 1) * 0.8;
    let c = a[(r + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && r < 2 && (c = a[0]), e.encounter === "pursuit" && r === 0 && (c = "stalker"), e.encounter === "siege" && r === 0 && (c = "guard"), Ae(e, c, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function eo(e, t, s) {
  if (e.boss) return;
  const a = e.objective, n = e.enemies.some((r) => r.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && H(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && H(i, a) < 2.2) && a.progress++;
    const r = Math.min(2, Math.floor(a.progress / Rt.ritualTicks));
    a.x = Aa[r].x, a.y = Aa[r].y, e.tick % Rt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Ae(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Za(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % Rt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && Ca(e, t), e.tick % 150 === 0 && me(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % Rt.pursuitInterval, e.wave < e.waves && a.progress === 0 && Ca(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const r = e.tick % 300 === 0, i = Math.round((r ? e.player.y : e.player.x) / 3) * 3;
    ze(e, r ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, r ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  e.tick > Rt.warningAfter && e.tick % 180 === 0 && me(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, Ca(e, t, s)) : n && (e.nextWave = 0);
}
function to(e) {
  return e.enemies.some((t) => t.hp > 0) ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function ao(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, Aa[0]), t.target = Rt.ritualTicks * Aa.length), e.encounter === "survival" && (t.target = Rt.survivalTicks), e.encounter === "pursuit" && (t.target = Rt.pursuitInterval);
}
var qt = (e, t) => {
  e.motion = t, e.motionAngle = ge(e, e.target), e.stun = 18;
}, no = {
  warden(e, t, s) {
    const a = t.pattern % 3, n = ln.warden.damage;
    if (a === 0)
      qt(t, 24), ze(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let r = -1; r <= 1; r++) ot(e, tt(t, t.angle + r * 0.55, 3.5), 1.8, 12 + Math.abs(r) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      vt(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Ae(e, "guard", {
        x: -7,
        y: -7
      }, s);
  },
  thornheart(e, t, s) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) me(e, tt(t.target, n * $t / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      me(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Ae(e, "stalker", {
      x: n,
      y: -6
    }, s);
    else for (let n = 0; n < 3 + t.phase; n++) ze(e, t, t.angle + n * $t / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, be(e, t, "burst", 2), ze(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), ze(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (s === 1) vt(e, t, ge(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (s === 2) {
      for (let a = 0; a < 4; a++) {
        const n = tt({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        ze(e, n, ge(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + a * 8, 18);
      }
      t.exposed = Math.max(t.exposed, 75);
    } else
      Ae(e, "wisp", {
        x: -7,
        y: 5
      }), Ae(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const s = t.pattern % 3, a = t.pattern * 0.53;
    if (s === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && ze(e, t, a + n * $t / 7, 18, 0.6, 32, 23);
    else if (s === 1) for (let n = 0; n < 6; n++) {
      const r = tt({
        x: 0,
        y: 0
      }, n * $t / 6, 9);
      vt(e, r, ge(r, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      ot(e, t.target, 2, 18, 24), me(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      qt(t, 18), ze(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (s === 1) for (let a = 0; a < 2 + t.phase; a++) ot(e, tt(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else s === 2 ? (ze(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), ze(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (vt(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Ae(e, "stalker", {
      x: -8,
      y: 3
    }), Ae(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const s = t.pattern % 4;
    if (s === 0) {
      qt(t, 28);
      for (let a = 0; a < 6; a++) me(e, tt(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (s === 1) Yn(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (s === 2)
      t.x = 0, t.y = 0, me(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Ae(e, "bomber", a);
  },
  forgemaster(e, t) {
    const s = t.pattern % 4;
    if (s === 0) for (const a of [
      -7,
      0,
      7
    ]) ze(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (s === 1) for (let a = -1; a <= 1; a++) me(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else s === 2 ? (ot(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Ae(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Ae(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const s = t.pattern % 3;
    if (s === 0) for (let a = 0; a < 3; a++) me(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (s === 1)
      qt(t, 30), ze(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) ot(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const s = t.pattern % 4;
    if (s === 0) for (let a = 0; a < 4; a++) me(e, tt(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else s === 1 ? vt(e, t, t.angle, 9, 2.2, 14, 0.21) : s === 2 ? (t.x = -t.x, t.y = -t.y, ze(e, t, ge(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (me(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Ae(e, "stalker", {
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
      }, qt(t, 40), ze(e, t, 0, 19, 1.4, 14, 25);
    else if (s === 1) for (let a = 0; a < 4; a++) ze(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else s === 2 ? (ot(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (me(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), vt(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), ot(e, t.target, 2.3, 24, 21);
    else if (s === 1) for (let a = 0; a < t.memory.length; a++) ot(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (s === 2) {
      for (const a of t.memory) ze(e, a, ge(a, t.target), 18, 0.65, 32, 22);
      Ae(e, "wisp", {
        x: -7,
        y: -7
      }), Ae(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Yn(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), be(e, t, "burst", 2), ze(e, t, ge(t, t.target), 20, 0.8, 24, 26);
    else if (s === 1)
      qt(t, 20), vt(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (s === 2)
      ot(e, t, 3, 12, 26), me(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) ze(e, a, ge(a, t.target), 20, 0.6, 22, 23);
  }
};
function so(e, t, s, a) {
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const r = t.phase + 1;
    t.phase = r, be(e, t, "burst", 4), n === "phoenix" && r === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), me(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), s.oaths.includes("legion") && Ae(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  no[n](e, t, a), t.pattern++;
}
function ro(e, t, s) {
  if (!ke(t.kind)) {
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && H(n, t) < 2.8 && re(s, t, n)).sort((n, r) => H(n, t) - H(r, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && H(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function oo(e, t, s, a, n) {
  const r = fe[t.kind];
  H(t.target, e.player) < a && H(t, e.player) < r.reach + 1 && re(n, t, e.player) && Ua(e, r.damage, s, n);
  for (const i of e.companions) H(t.target, i) < a && H(t, i) < r.reach + 1 && re(n, t, i) && (i.hp -= r.damage);
  !e.boss && e.encounter === "siege" && H(t.target, e.objective) < a && H(t, e.objective) < r.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - r.damage * 0.5)), be(e, t.target, "slash", a, t.angle);
}
function io(e, t, s, a) {
  const n = fe[t.kind];
  if (ke(t.kind)) {
    so(e, t, s, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      vt(e, t, t.angle, e.chapter > 0 ? 3 : 2, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const r of e.enemies) r.hp > 0 && !ke(r.kind) && H(r, t) < 3.5 && re(a, t, r) && (r.hp = Math.min(r.maxHp, r.hp + 8));
      vt(e, t, t.angle, 3, 0.7, n.damage, 0.18), be(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      me(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      wt(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      ot(e, t.target, 1.7, 8, n.damage);
      break;
    default:
      oo(e, t, s, n.reach + 0.15, a);
  }
}
function lo(e, t, s, a) {
  const n = fe[t.kind], r = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (nt(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    H(t, e.player) < n.radius + 0.4 && re(a, t, e.player) && Ua(e, n.damage, s, a);
    for (const c of e.companions) H(t, c) < n.radius + 0.3 && re(a, t, c) && (c.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && H(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), H(r, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, be(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function co(e, t, s, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    for (const h of [
      "marked",
      "chill",
      "exposed"
    ]) n[h] = Math.max(0, n[h] - 1);
    for (const h of [
      "burn",
      "bleed",
      "poison"
    ]) n[h] > 0 && (n[h]--, e.tick % 15 === 0 && We(e, n, 2 + (h === "burn" ? A(t, "cinder") + A(t, "inferno") : h === "bleed" ? A(t, "hemorrhage") + A(t, "blood-dance") : A(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      lo(e, n, t, a);
      continue;
    }
    const r = fe[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (io(e, n, t, a), n.cooldown = Math.round(r.cooldown * (i ? 0.8 : 1) / (ke(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1)));
      continue;
    }
    const c = ro(e, n, a), o = H(n, c), l = re(a, n, c);
    if (n.cooldown = Math.max(0, n.cooldown - 1), n.angle = ge(n, c), !n.cooldown && o < r.reach && l) {
      if (n.target = {
        x: c.x,
        y: c.y
      }, n.windup = Math.round(r.windup * (i ? 0.8 : 1)), c === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const h = n.kind === "bomber" ? 23 : o / 0.24, d = Math.min(n.windup + h, 4.5 / Math.max(1e-3, Math.hypot(s.x, s.y))), m = {
          x: c.x + s.x * d,
          y: c.y + s.y * d
        };
        a ? re(a, n, m) && re(a, c, m) && (n.target = m) : (n.target.x = Math.max(-10, Math.min(10, m.x)), n.target.y = Math.max(-10, Math.min(10, m.y))), n.angle = ge(n, n.target);
      }
      continue;
    }
    const u = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (o > (u ? 5 : ke(n.kind) ? 2.8 : 0.95) || u && o < 3 || !l) {
      const h = n.kind === "stalker" && o > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, d = Ts(a, n, c, r.radius);
      d !== null && nt(e, n, d + (u && o < 3 && l ? Math.PI : a ? 0 : h), r.speed * (n.chill ? ke(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), r.radius, a);
    }
    for (const h of e.enemies) h.id !== n.id && h.hp > 0 && H(n, h) < r.radius + fe[h.kind].radius && nt(e, n, ge(h, n), 0.027, r.radius, a);
  }
}
function Sa(e, t, s) {
  if (e.kind === "beam") return Vr(t, e, e.angle, e.length) < e.width + s;
  const a = H(e, t);
  return a < e.radius + s && (e.kind !== "ring" || a > e.inner - s);
}
function uo(e, t, s) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, s ? !re(s, n, a, a.radius) : Math.abs(a.x) > X.arena || Math.abs(a.y) > X.arena || e.obstacles.some((r) => H(r, a) < r.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (H(a, e.player) < X.playerRadius + a.radius && re(s, a, e.player)) e.player.shield > 0 ? (js(e, t, s), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (Ua(e, a.damage, t, s), a.life = 0);
      else {
        const r = e.companions.find((i) => i.hp > 0 && H(a, i) < 0.3 + a.radius && re(s, a, i));
        r && (r.hp -= a.damage * (1 - A(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const r of e.enemies) {
      if (r.hp <= 0 || a.hits.includes(r.id) || H(r, a) > fe[r.kind].radius + a.radius || !re(s, a, r)) continue;
      a.hits.push(r.id);
      const i = a.damage * (A(t, "hunter") && H(r, e.player) > je.hunterRange ? je.hunterDamage + (A(t, "hunter") - 1) * 0.15 : 1);
      if (We(e, r, i, t, a.source, a, s), A(t, "pinning") && a.source === "attack" && (r.chill = 50 + A(t, "pinning") * 20, e.player.combo % 3 === 0 && xt(e, r, 8 * A(t, "pinning"))), a.splash > 0) {
        be(e, r, "burst", a.splash);
        for (const c of e.enemies) c.id !== r.id && H(c, r) < a.splash + fe[c.kind].radius && We(e, c, i * 0.55, t, a.source, r, s);
      }
      if (a.bounce > 0) {
        const c = e.enemies.filter((o) => o.hp > 0 && !a.hits.includes(o.id) && H(o, r) < 6 && re(s, a, o, a.radius)).sort((o, l) => H(r, o) - H(r, l))[0];
        if (c) {
          a.bounce--, a.angle = ge(a, c), a.damage *= 0.8;
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
function ho(e, t, s) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      Sa(a, e.player, X.playerRadius) && re(s, a, e.player) && Ua(e, a.damage, t, s), !e.boss && e.encounter === "siege" && e.tick % 15 === 0 && Sa(a, e.objective, 0.6) && re(s, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35));
      const r = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if (r || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!r || !a.hits.includes(i.id)) && Sa(a, i, 0.3) && re(s, a, i) && (i.hp -= a.damage * 0.25, r && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((r) => r.hp > 0 && Sa(a, r, fe[r.kind].radius) && re(s, a, r));
    a.kind === "mine" && n.length && (a.life = 0, be(e, a, "burst", a.radius));
    for (const r of n) a.kind === "storm" ? hn(e, r, t, a.damage, s, a) : (a.kind === "fire" && (r.burn = Math.max(r.burn, 45)), a.kind === "frost" && (r.chill = Math.max(r.chill, 60)), a.kind === "mine" && xt(e, r, 25), We(e, r, a.damage, t, a.source, a, s));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function fo(e, t, s) {
  uo(e, t, s), ho(e, t, s);
}
function po(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function mo(e, t, s) {
  const { seed: a, zone: n, chapter: r, elite: i, boss: c, bossKind: o, encounter: l, hp: u } = e, h = {
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
  return s && ((c && !Gn(o) || s.waves.some((d) => d.some((m) => !Gn(m.kind)))) && Ie("encounter_unsupported"), (l !== "skirmish" || !s.waves.length || !Mt(s.space, s.entry, X.playerRadius) || s.waves.some((d) => !d.length || d.some((m) => !Mt(s.space, m.position, fe[m.kind].radius) || !pa(s.space, s.entry, m.position, X.playerRadius)))) && Ie("map_invalid"), Object.assign(h.player, s.entry), Object.assign(h.objective, s.objective), h.obstacles = [], h.waves = s.waves.length), ao(h), Ca(h, t, s), h;
}
function vo(e, t, s, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((r) => --r.life > 0).slice(-80);
  const n = Xr(e, t, s, a);
  Jr(e, s, a), co(e, s, n, a), fo(e, s, a), e.enemies = e.enemies.filter((r) => r.hp > 0), po(e) ? e.status = "lost" : (eo(e, s, a), to(e) && (e.status = "won", e.shots = [], e.hazards = []));
}
function go(e, t) {
  const s = e.at(-1);
  s && s.move === t.move && s.dash === t.dash && s.skill === t.skill ? s.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var bo = 2.4;
function La(e, t) {
  return (!e?.all || e.all.every((s) => t.has(s))) && (!e?.none || e.none.every((s) => !t.has(s)));
}
var Kn = /* @__PURE__ */ new WeakMap();
function It(e, t) {
  const s = e.gates.filter((i) => La(i.condition, t)).map((i) => i.id), a = s.join("/");
  let n = Kn.get(e);
  n || (n = /* @__PURE__ */ new Map(), Kn.set(e, n));
  let r = n.get(a);
  return r || (r = Is(e.map, new Set(s)), n.set(a, r)), r;
}
function Na(e, t) {
  const s = e.exits.filter((n) => La(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => La(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...s, ...a];
}
function yo(e, t, s) {
  const a = It(e, s);
  return Na(e, s).filter((n) => H(t.position, n.position) <= 2.4 && Le(a, t.position, n.position)).sort((n, r) => H(t.position, n.position) - H(t.position, r.position) || n.target.id.localeCompare(r.target.id));
}
function wo(e, t, s, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && Ie("input_invalid"), t && (e.facing = $n(t), Cn(s, e.position, {
    x: Math.cos(e.facing) * X.speed * a,
    y: Math.sin(e.facing) * X.speed * a
  }, X.playerRadius));
}
var Xt = {
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
function Zs(e, t, s, a, n, r) {
  const i = Xt[e];
  if (!i || t.has(i.complete)) return null;
  const c = _e[e], o = i.waves.map((l) => l.map((u) => ({
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
      space: It(c, t),
      entry: s,
      objective: c.anchors.encounter,
      waves: o,
      summonPoints: i.summons.map((l) => c.anchors[l])
    }
  };
}
var Da = {
  sanniang: "三娘",
  anian: "阿念",
  kouzi: "扣子",
  laobai: "老白"
}, ht = Object.keys(Da), xo = {
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
    ...Object.fromEntries(Object.entries(Kt).map(([e, t]) => [e, t.name]))
  },
  people: Da,
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
}), Fa = {
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
}, Ba = {
  ...Object.fromEntries(Object.keys(Kt).map((e) => [e, {
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
}, zn = {
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
}, Us = Object.keys(zn);
function Mo(e, t, s) {
  return ca(s.scene) !== "camp" ? [] : Us.filter((a) => {
    const n = zn[a], r = Fa[t].station, i = _e[r.scene].anchors[r.anchor], c = s.scene === "clinic_front" || s.scene === r.scene && Math.hypot(s.position.x - i.x, s.position.y - i.y) <= 2.4;
    return n.atClinic && !c ? !1 : n.people.includes(t) && !e.includes(n.fact) && n.requires.every((o) => e.includes(o));
  });
}
var Dt = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Xn = /* @__PURE__ */ new WeakMap();
function fn(e, t, s) {
  if (Le(e, t, s, X.playerRadius)) return s;
  const a = Nt(e.map, t), n = Nt(e.map, s), r = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Xn.get(e);
  i || (i = /* @__PURE__ */ new Map(), Xn.set(e, i));
  const c = Yt(e.map, a.column, a.row);
  if (!i.has(r)) {
    const l = pa(e, c, Yt(e.map, n.column, n.row), X.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(r, l?.find((u) => Dt(u, c) > 0.01) ?? null);
  }
  const o = i.get(r);
  return o ? Le(e, t, o, X.playerRadius) ? o : c : null;
}
function $a(e, t) {
  const s = Xt[e];
  return !s || t.has(s.complete);
}
function pn(e, t, s, a) {
  const n = [{
    ...e,
    route: []
  }], r = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), c = _e[i.scene], o = It(c, s);
    if (i.scene === t.scene && fn(o, i.position, c.anchors[t.anchor])) return i.route;
    for (const l of _e[i.scene].exits) {
      const u = `${l.to}/${l.arrival}`;
      r.has(u) || !La(l.condition, s) || a && !$a(l.to, s) || !fn(o, i.position, c.anchors[l.anchor]) || (r.add(u), n.push({
        scene: l.to,
        position: _e[l.to].anchors[l.arrival],
        route: [...i.route, l]
      }));
    }
  }
  return null;
}
function Ns(e, t) {
  const s = new Set(e.facts), a = e.people[t];
  return Object.entries(Ba).map(([n, r]) => ({
    id: n,
    name: r.name,
    ...Ea(r.scene) ? { use: Ea(r.scene).use } : {},
    personHere: a.scene === r.scene && (n === r.scene || Dt(a.position, _e[r.scene].anchors[r.anchor]) <= 2.4),
    playerHere: e.location.scene === r.scene && (n === r.scene || Dt(e.location.position, _e[r.scene].anchors[r.anchor]) <= 2.4),
    accessible: pn(a, r, s, !1) !== null,
    safe: $a(r.scene, s),
    solo: $a(a.scene, s) && $a(r.scene, s) && pn(a, r, s, !0) !== null
  }));
}
function _o(e, t) {
  return !Fa[t].captive || e.facts.includes("captives_arrived");
}
var Ds = (e) => bo * (0.7 + ht.indexOf(e) / ht.length * 0.2);
function ko(e) {
  return ht.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && Dt(e.people[t].position, e.location.position) >= Ds(t));
}
function Fs(e, t) {
  return ht.filter((s) => t[s].scene === e).map((s) => ({
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
function Bs(e) {
  return [...Na(_e[e.location.scene], new Set(e.facts)), ...Fs(e.location.scene, e.people)];
}
function Pn(e, t, s, a) {
  return Fs(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const r = e.id === "cells" && Fa[n.target.person].captive && !s.has("captives_arrived"), i = It(e, r ? /* @__PURE__ */ new Set([...s, "captives_released"]) : s);
    return Dt(n.position, t) <= (r ? 5 : 2.4) && Le(i, t, n.position);
  });
}
function So(e) {
  const t = new Set(e.facts);
  for (const s of ht) {
    const a = e.people[s];
    if (a.mode === "idle") continue;
    const n = _e[a.scene], r = It(n, t);
    let i, c;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && we("invalid"), i = e.location.position, Dt(a.position, i) < Ds(s)) continue;
    } else {
      const m = Ba[a.destination], v = pn(a, m, t, !0);
      if (v || we("unavailable"), c = v[0], i = n.anchors[c?.anchor ?? m.anchor], Dt(a.position, i) < 0.2) {
        c ? (a.scene = c.to, a.position = { ..._e[c.to].anchors[c.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const o = fn(r, a.position, i);
    o || we("unavailable");
    const l = o.x - a.position.x, u = o.y - a.position.y, h = Math.hypot(l, u), d = Math.min(h, X.speed * 1.8);
    h && (a.facing = Math.atan2(u, l), Cn(r, a.position, {
      x: l / h * d,
      y: u / h * d
    }, X.playerRadius));
  }
}
var He = {
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
}, Wa = Object.keys(He), Ws = [...ht, ...Wa];
function qe(e) {
  return Object.hasOwn(Da, e);
}
function Ve(e) {
  return qe(e) ? Da[e] : He[e].name;
}
function Ta(e, t) {
  const s = He[e];
  return _e[s.scene].anchors[t.has(s.complete) ? s.clearedAnchor : s.anchor];
}
function qa(e, t, s) {
  return Wa.filter((a) => He[a].scene === e).flatMap((a) => {
    const n = Ta(a, s), r = He[a];
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
function mn(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && we("invalid"), e;
}
function Jn(e, t = 0, s = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > s) && we("invalid"), e;
}
function yt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && we("invalid"), e;
}
function es(e, t, s) {
  return (!Array.isArray(e) || e.length > t) && we("invalid"), e.map(s);
}
function Ro(e) {
  return new Set(e).size !== e.length && we("invalid"), e;
}
function ts(e) {
  typeof e != "boolean" && we("invalid");
}
function Co(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && we("identity"), e;
}
var ma = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), $o = Object.keys(ma), qs = ["male", "female"];
function zo(e) {
  const t = mn(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && we("invalid"), {
    name: t.name.trim(),
    gender: yt(t.gender, qs),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: yt(t.appearanceAge, $o) }
  };
}
var Zt = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), Hs = `${Zt.number} · ${Zt.title}`, Po = {
  sanniang: { initial: {
    reply: `我将拆下的绷带放到一旁，抬眼朝你轻轻一笑，伸手示意身边的座位。
「先坐一坐。檐下不常见生面孔，身上可有哪里不舒服？路上受的凉、磕碰的小伤，都可以同我说。」`,
    performance: {
      expression: "smile",
      gesture: "gesture"
    }
  } },
  laobai: { initial: {
    reply: `我合上签本，靠着门框朝你挑了挑眉。伤腿刚一使劲，嘴角的笑便顿了一下。
「生面孔啊。找人，还是找路？找人我倒认得几个，找路嘛……我这条腿，眼下只能给你指指。」`,
    performance: {
      expression: "teasing",
      gesture: "tilt"
    }
  } },
  anian: {
    initial: {
      reply: `我低头抚平货签翘起的边角，听见动静才抬起脸，愣愣地看着你。
「嗯？……你不是这里的人。是来接我们的吗？这些货签我还留着，就是泡皱了。」`,
      performance: {
        expression: "surprised",
        gesture: "tilt"
      }
    },
    returned: {
      reply: `我捏着衣角坐在诊棚边出神。看见你，便往旁边挪了挪，腾出一点位置。
「啊，你来了。三娘让我在这儿歇着……你要坐吗？这边还有地方。」`,
      performance: {
        expression: "neutral",
        gesture: "gesture"
      }
    }
  },
  kouzi: {
    initial: {
      reply: `我蹲在墙边，指尖沿着砖缝探进去。眼前一暗，便皱着眉偏过头。
「哎，新来的。别站那儿挡光，我正看这道缝呢。……外头现在什么动静？」`,
      performance: {
        expression: "serious",
        gesture: "tilt"
      }
    },
    returned: {
      reply: `我蹲在管架上，脚尖换了个落点，低头瞥你一眼，手仍牢牢扣着横管。
「哎，找我？站稳了再说，这边管子松着。别伸手，我自己下得来。」`,
      performance: {
        expression: "neutral",
        gesture: "gesture"
      }
    }
  },
  bajin: { initial: {
    reply: `我把盾沿往地上一顿，挺直腰背，摊开手等你递签，说话时特意拖长了腔调。
「来人止步。此处是哨站正门，往来均须验签。把凭签拿出来，有什么事，一并说清楚。」`,
    performance: {
      expression: "neutral",
      gesture: "gesture"
    }
  } },
  changyounian: { initial: {
    reply: `我略微侧过头，眯眼打量你，片刻后才慢慢转过身，手搭在火盆边沿。
「这位，且留步。烽火台不是寻常走动的地方，不知是哪一位放你上来的？若有公事，不妨先说给我听。」`,
    performance: {
      expression: "neutral",
      gesture: "tilt"
    }
  } }
};
function Vs(e, t) {
  const s = Po[t], a = e.facts.includes("captives_arrived") && s.returned ? s.returned : s.initial;
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
function vn(e) {
  const t = e.lastReply;
  if (!t) return null;
  const s = e.conversations[t.person].at(-1);
  return s?.id === t.turnId ? {
    person: t.person,
    turn: s
  } : null;
}
function In(e) {
  const t = vn(e);
  return t?.turn.action === "finish" && !e.facts.includes("chapter_completed") ? t.person : null;
}
var da = Object.freeze({
  encounterReach: 14,
  alarmTicks: 900,
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function gn(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((s) => s.id === t))
  };
}
function Io(e, t) {
  if (e.phase !== "exploration" || !_e[e.location.scene].safe) return "unavailable";
  if (t.length > X.relicSlots) return "capacity";
  if (new Set(t).size !== t.length || t.some((a) => !e.collection.some((n) => n.id === a))) return "invalid";
  const s = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((a) => t.includes(a.id))
  };
  return t.some((a) => !As(s, a)) ? "dependency" : null;
}
function Gs(e, t, s) {
  e.facts.includes(t) || e.facts.push(t);
  const a = s ?? [...ht.filter((n) => e.people[n].scene === e.location.scene), ...Wa.filter((n) => He[n].scene === e.location.scene)];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function Eo(e) {
  const t = e.checkpoint;
  return Zs(e.location.scene, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"))?.field;
}
function Ao(e) {
  const t = Xt[e.location.scene];
  Gs(e, t.complete);
  const s = gn(e);
  t.boss && (e.hp = Math.min(X.maxHp, e.hp + 20 + A(s, "renewal") * je.renewalZoneHeal)), e.offers = Lr(e, Hr(e.weapon).flatMap((a) => {
    const n = e.collection.find((r) => r.id === a)?.rank ?? 0;
    return n < X.maxRelicRank && As(s, a) && (fa[a].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: a,
      rank: n + 1
    }] : [];
  }), 3), e.phase = e.offers.length ? "reward" : "exploration", e.battle = null, e.checkpoint = null;
}
function as(e, t) {
  if (!(e.pendingParley || In(e))) {
    if (e.phase === "battle" && e.battle) {
      const s = Eo(e);
      s || we("invalid"), vo(e.battle, t, gn(e), s);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, ["gate", "beacon"].includes(e.location.scene) && !e.facts.includes("alarm_silenced") && (e.alarmTicks++, e.alarmTicks >= da.alarmTicks && Gs(e, "alarm_raised")), a.status === "won" ? Ao(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const s = _e[e.location.scene], a = new Set(e.facts);
      wo(e.location, t.move, It(s, a), da.explorationSpeed);
      const n = Xt[s.id], r = s.anchors.encounter;
      if (n && !a.has(n.complete) && r && Math.hypot(e.location.position.x - r.x, e.location.position.y - r.y) <= (n.triggerRadius ?? da.encounterReach)) {
        const i = Zs(s.id, a, e.location.position, Math.floor(Za(e) * 4294967296), e.hp, a.has("alarm_raised") && !a.has("alarm_silenced"));
        e.battle = mo(i.setup, gn(e), i.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && So(e);
  }
}
var Oa = Object.freeze({
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
function En(e) {
  return Oa.bands.filter((t) => e >= t).length - 1;
}
var Ht = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, Lo = {
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
    gestures: Ht
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
    gestures: Ht
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
    gestures: Ht
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
    gestures: Ht
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
      ...Ht,
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
    gestures: Ht
  }
};
function To(e) {
  return Lo[e];
}
var An = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, Oo = {
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
}, va = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function Ys(e, t) {
  const s = { ...Oo[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(s, a.clothing);
  return s;
}
var jo = (e) => yt(e, $s), ns = (e) => yt(e, zs), ss = (e) => yt(e, Cs);
function Zo(e) {
  const t = mn(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: jo(t.weapon),
        outfit: ss(t.outfit),
        traveler: zo(t.traveler),
        chapter: yt(t.chapter, [Zt.id])
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: ss(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: Co(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: yt(t.id, Us),
        person: yt(t.person, ht)
      };
    case "greet":
      return {
        type: "greet",
        person: yt(t.person, Ws)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: Ro(es(t.equipped, X.relicSlots, ns))
      };
    case "input": {
      const s = es(t.spans, X.maxInputTicks, (a) => {
        const n = mn(a);
        return ts(n.dash), ts(n.skill), {
          move: Jn(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Jn(n.ticks, 1, X.maxInputTicks)
        };
      });
      return (!s.length || s.reduce((a, n) => a + n.ticks, 0) > X.maxInputTicks) && we("invalid"), {
        type: "input",
        spans: s
      };
    }
    case "relic":
      return {
        type: "relic",
        id: ns(t.id)
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
function Uo(e, t) {
  const s = jt(null), a = F(!1), n = F(""), r = jt(null), i = F(!1), c = F(!1), o = jt(null), l = F(null), u = V(() => s.value?.replyFailure?.actionId === l.value ? null : s.value?.replyFailure ?? null), h = V(() => i.value || !!s.value?.conversation), d = F(!1), m = F(!1);
  let v = !1;
  const g = jt(null), w = V(() => {
    const L = (g.value ?? s.value)?.conversation;
    return L || (i.value ? o.value : null);
  }), _ = V(() => a.value || h.value || c.value || !!r.value || !s.value?.ready || s.value.writeState !== "ready" || s.value.pending), M = (L, T) => L.data.revision !== T.data.revision ? L.data.revision > T.data.revision : L.fileRevision >= T.fileRevision;
  function k(L) {
    if (v || s.value && !M(L, s.value)) return;
    const T = o.value;
    (s.value?.data.active?.id !== L.data.active?.id || T && L.data.active?.conversations[T.person].some((B) => B.id === T.actionId)) && (o.value = null), s.value = L;
  }
  const b = V(() => {
    if (o.value) return o.value;
    if (s.value?.conversation) return {
      ...s.value.conversation,
      status: "sending"
    };
    const L = s.value?.replyFailure;
    return !L || L.regenerating || s.value?.data.active?.conversations[L.person].some((T) => T.id === L.actionId) ? null : {
      actionId: L.actionId,
      person: L.person,
      text: L.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function x(L, T, B) {
    if (v || a.value) return !1;
    a.value = !0, g.value = null, n.value = "";
    try {
      const Q = await e.request(`game/expedition/${L}`, {
        chatIdentity: t,
        ...L === "rebuild" ? { actionId: an() } : {},
        ...T,
        ...B ? { person: B } : {}
      }, 35e3), U = g.value;
      return k(U && M(U, Q.result) ? U : Q.result), d.value = !1, m.value = !1, s.value?.writeState === "ready" && !s.value.pending && L !== "read" && (r.value = null), !0;
    } catch (Q) {
      if (!v) {
        d.value = !0, g.value && k(g.value), n.value = Ct(Q);
        const U = Q && typeof Q == "object" && "code" in Q ? String(Q.code) : "";
        m.value = U === "expedition_data_invalid", T && (U.startsWith("expedition_save_") || U.startsWith("host_request_")) && (r.value = T);
      }
      return !1;
    } finally {
      g.value = null, v || (a.value = !1);
    }
  }
  const y = e.subscribe((L) => {
    if (v) return;
    if (L.type === "game/expedition/error") {
      const B = L.payload;
      B.chatIdentity === t && (n.value = Ct(B), m.value = B.code === "expedition_data_invalid");
      return;
    }
    if (L.type !== "game/expedition/state") return;
    const T = L.payload;
    T.chatIdentity === t && (a.value ? g.value = T.state : (g.value = null, k(T.state)));
  });
  async function E() {
    const L = r.value;
    return !await x("confirm") || !s.value || s.value.writeState !== "ready" || s.value.pending ? !1 : L && s.value.data.revision === L.revision ? x("act", L) : (r.value = null, c.value = !1, !0);
  }
  async function O(L, T, B) {
    if (_.value || v) return !1;
    const Q = an();
    o.value = {
      actionId: Q,
      person: L,
      text: T,
      regenerating: !!B,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", g.value = null;
    try {
      const U = await e.request(B ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: Q,
        revision: s.value.data.revision,
        person: L,
        text: T,
        ...B ? { turnId: B } : {}
      }, 18e4), Z = g.value;
      return k(Z && M(Z, U.result) ? Z : U.result), !0;
    } catch (U) {
      if (!v) {
        g.value && k(g.value);
        const Z = U && typeof U == "object" && "code" in U ? String(U.code) : U instanceof Error ? U.message : "";
        if (Z === "expedition_cancelled")
          return n.value = "", !1;
        c.value = Z.startsWith("host_request_") || Z.startsWith("expedition_save_"), n.value = c.value ? N.aiUnknown : s.value?.replyFailure?.actionId === Q ? "" : Ct(U);
      }
      return !1;
    } finally {
      i.value = !1, g.value = null, v || (a.value = !1, o.value?.actionId === Q && (o.value = B ? null : {
        ...o.value,
        status: "failed"
      }));
    }
  }
  async function I() {
    if (h.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (L) {
        v || (n.value = Ct(L));
      }
  }
  const P = V(() => d.value || !!r.value || c.value || !s.value || s.value.pending || s.value.writeState !== "ready");
  return {
    view: s,
    busy: a,
    error: n,
    blocked: _,
    failed: r,
    talking: h,
    uncertainTalk: c,
    talk: O,
    outgoing: b,
    conversationProgress: w,
    cancelTalk: I,
    recoveryRequired: P,
    dataInvalid: m,
    conversationFailure: u,
    dismissConversationFailure() {
      l.value = s.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => x("rebuild"),
    retryMemory: (L) => _.value ? Promise.resolve(!1) : x("retry-memory", void 0, L),
    dismissError() {
      P.value || (n.value = "");
    },
    notice: V(() => n.value || (s.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(s.value.writeState) || s.value.pending && s.value.writeState === "ready") ? ne.saveError : "")),
    read: () => x("read"),
    recover: E,
    act: (L) => _.value ? Promise.resolve(!1) : x("act", {
      actionId: an(),
      revision: s.value.data.revision,
      command: Zo(L)
    }),
    dispose() {
      v = !0, y();
    }
  };
}
function No(e) {
  const t = jt(null), s = jt(!1);
  let a = [], n = 0, r = null, i = !1;
  function c() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const d of a) for (let m = 0; m < d.ticks; m++) as(t.value, d);
    s.value = a.length > 0;
  }
  const o = pe(e.view, () => {
    !r && !a.length && c();
  }, { immediate: !0 });
  async function l() {
    if (r)
      return await r ? l() : !1;
    if (!a.length) return !e.blocked.value;
    if (e.blocked.value || i) return !1;
    const h = a;
    a = [], n = 0, r = e.act({
      type: "input",
      spans: h
    });
    const d = await r;
    return r = null, d ? c() : e.failed.value || (a = h.concat(a), n = a.reduce((m, v) => m + v.ticks, 0)), s.value = a.length > 0 || !d, d;
  }
  function u(h) {
    const d = t.value;
    !d || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= X.maxInputTicks || !["exploration", "battle"].includes(d.phase) || d.phase === "exploration" && !h.move && !ko(d) || (as(d, h), go(a, h), n++, s.value = !0, cr(t), (n >= X.checkpointTicks || !["exploration", "battle"].includes(d.phase)) && l());
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
var { recent: Ra, maximum: rs } = mr;
function Do(e) {
  const { history: t, pending: s, talking: a, person: n, campaignId: r, transcript: i, freshReply: c } = e, o = ur(/* @__PURE__ */ new Map());
  let l = 0, u = !1;
  const h = V(() => t.value[0]?.kind === "greeting" ? 1 : 0), d = V(() => t.value.length * 2 - h.value), m = V(() => d.value + Number(s.value)), v = V(() => {
    const I = o.get(n.value)?.range, P = Math.min(I?.end ?? m.value, m.value);
    return {
      start: Math.max(0, Math.min(I?.start ?? P - Ra, P - 1)),
      end: P
    };
  }), g = V(() => {
    const I = [];
    for (let P = v.value.start; P < Math.min(v.value.end, d.value); P++) {
      const L = Math.floor((P + h.value) / 2), T = (P + h.value) % 2 ? "npc" : "player", B = t.value[L];
      I.push({
        key: `${B.id}:${T}`,
        side: T,
        turn: B
      });
    }
    return I;
  }), w = V(() => v.value.start > 0), _ = V(() => v.value.end < m.value), M = V(() => _.value || v.value.end - v.value.start > Ra), k = V(() => s.value && v.value.end > d.value);
  function b(I) {
    I && !I.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function x() {
    const I = i.value;
    if (!I || u || o.get(n.value)?.latest === !1) return;
    const P = c.value ? I.querySelector('[data-fresh-reply="true"]') : null;
    I.scrollTop = P && P.offsetHeight > I.clientHeight ? P.getBoundingClientRect().top - I.getBoundingClientRect().top + I.scrollTop - 12 : I.scrollHeight;
  }
  function y() {
    const I = ++l, P = n.value, L = i.value?.contains(document.activeElement) ? document.activeElement : null;
    u = !1, c.value = null, o.delete(P), zt(() => {
      l === I && n.value === P && (x(), b(L));
    });
  }
  function E() {
    const I = i.value;
    if (!I || u) return;
    const P = !_.value && I.scrollHeight - I.clientHeight - I.scrollTop < 32;
    if (P && M.value) {
      y();
      return;
    }
    o.set(n.value, {
      top: I.scrollTop,
      latest: P,
      range: P ? null : { ...v.value }
    });
  }
  async function O(I) {
    const P = i.value;
    if (!P || u) return;
    const L = { ...v.value };
    I === "older" ? (L.start = Math.max(0, L.start - Ra), L.end = Math.min(L.end, L.start + rs)) : (L.end = Math.min(m.value, L.end + Ra), L.start = Math.max(L.start, L.end - rs));
    const T = new Set(g.value.filter((Re, Me) => {
      const ce = v.value.start + Me;
      return ce >= L.start && ce < L.end;
    }).map((Re) => Re.key)), B = P.getBoundingClientRect().top, Q = [...P.querySelectorAll("[data-message-key]")].find((Re) => T.has(Re.dataset.messageKey) && Re.getBoundingClientRect().bottom > B), U = Q ? Q.getBoundingClientRect().top - B : 0, Z = P.contains(document.activeElement) ? document.activeElement : null, Y = n.value, oe = ++l;
    if (u = !0, o.set(Y, {
      range: L,
      top: P.scrollTop,
      latest: !1
    }), await zt(), oe !== l || n.value !== Y || i.value !== P) return;
    const Ze = Q && [...P.querySelectorAll("[data-message-key]")].find((Re) => Re.dataset.messageKey === Q.dataset.messageKey);
    Ze ? P.scrollTop += Ze.getBoundingClientRect().top - P.getBoundingClientRect().top - U : P.scrollTop = I === "older" ? 0 : P.scrollHeight, o.set(Y, {
      range: L,
      top: P.scrollTop,
      latest: !1
    }), u = !1, b(Z);
  }
  return pe(r, () => {
    l++, u = !1, o.clear();
  }), pe([i, n], ([I, P]) => {
    l++, u = !1;
    const L = o.get(P);
    I && (I.scrollTop = L && !L.latest ? L.top : I.scrollHeight);
  }, { flush: "post" }), pe(i, (I, P, L) => {
    if (!I) return;
    const T = new ResizeObserver(x);
    T.observe(I), L(() => T.disconnect());
  }, { flush: "post" }), pe([
    t,
    s,
    a,
    c
  ], async () => {
    await zt(), x();
  }), {
    messages: g,
    hasOlder: w,
    hasNewer: _,
    expanded: M,
    pendingVisible: k,
    rememberReading: E,
    resetLatest: y,
    older: () => O("older"),
    newer: () => O("newer")
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
  older: "查看更早消息",
  newer: "查看后续消息",
  latest: "回到最新",
  regenerate: "重新生成",
  retrySend: "重试发送",
  sendFailed: "未完成回复，原消息已保留。",
  continue: "继续",
  phases: {
    preparing: "准备中",
    summarizing: "整理记忆中",
    waiting: "等待响应",
    thinking: "思考中",
    replying: "生成回复中",
    saving: "保存回复中",
    stopping: "正在停止"
  },
  elapsed: (e) => `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`,
  issues: {
    action_rejected: "对白已保存，附带行动不成立，未执行。",
    clothing_rejected: va.rejected,
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
function Fo(e) {
  let t = null, s = null, a = null, n = !1, r = !1, i = null, c = -1, o = 0, l = 0, u = 0, h = 0, d = 0;
  function m(g, w, _, M = "sine", k = g * 0.8, b = 0) {
    if (!n || !t || !s || t.state !== "running") return;
    const x = t.createOscillator(), y = t.createGain(), E = t.currentTime + b;
    x.type = M, x.frequency.setValueAtTime(g, E), x.frequency.exponentialRampToValueAtTime(Math.max(30, k), E + w), y.gain.setValueAtTime(1e-4, E), y.gain.exponentialRampToValueAtTime(_, E + 9e-3), y.gain.exponentialRampToValueAtTime(1e-4, E + w), x.connect(y).connect(s), x.start(E), x.stop(E + w), x.onended = () => {
      x.disconnect(), y.disconnect();
    };
  }
  function v(g, w, _, M) {
    if (!n || !t || !s || !a || t.state !== "running") return;
    const k = t.createBufferSource(), b = t.createBiquadFilter(), x = t.createGain(), y = t.currentTime;
    k.buffer = a, b.type = "bandpass", b.Q.value = 0.65, b.frequency.setValueAtTime(_, y), b.frequency.exponentialRampToValueAtTime(M, y + g), x.gain.setValueAtTime(1e-4, y), x.gain.exponentialRampToValueAtTime(w, y + 8e-3), x.gain.exponentialRampToValueAtTime(1e-4, y + g), k.connect(b).connect(x).connect(s), k.start(y), k.stop(y + g), k.onended = () => {
      k.disconnect(), b.disconnect(), x.disconnect();
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
            for (let _ = 0; _ < w.length; _++) w[_] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, r || e();
        }
      }
    },
    tick(g) {
      (!i || g.tick < c) && (c = -1, o = g.player.hp, l = g.kills, u = g.player.skill, h = g.serial, d = g.player.combo), i = g, c !== g.tick && (c = g.tick, g.player.hp < o && (v(0.16, 0.17, 800, 120), m(95, 0.2, 0.12, "triangle", 42)), g.kills > l && (m(659, 0.22, 0.045), m(988, 0.3, 0.025, "sine", 980, 0.035)), g.player.combo > d && v(0.095, 0.08, 2700, 500), g.player.dashTime === 7 && v(0.2, 0.09, 500, 2600), g.player.skill > u && (v(0.24, 0.12, 2200, 250), m(165, 0.35, 0.075, "triangle", 82), m(660, 0.36, 0.035, "sine", 440, 0.02)), g.effects.some((w) => w.id > h && w.kind === "lightning") && (v(0.12, 0.1, 4400, 1e3), m(1200, 0.08, 0.018, "sine", 210)), g.effects.some((w) => w.id > h && (w.kind === "block" || w.kind === "parry")) && (m(1350, 0.18, 0.07, "triangle", 740), m(2200, 0.11, 0.025, "sine", 1600)), g.effects.some((w) => w.id > h && w.kind === "ward-hit") && m(510, 0.16, 0.06, "sine", 250), g.effects.some((w) => w.id > h && w.kind === "ward-break") && (v(0.25, 0.1, 3600, 650), m(720, 0.3, 0.05, "sine", 120)), g.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((w, _) => m(w, 0.65, 0.04, "sine", w, _ * 0.075)), g.status === "lost" && m(147, 0.7, 0.06, "triangle", 73), o = g.player.hp, l = g.kills, u = g.player.skill, h = g.serial, d = g.player.combo);
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
}, os = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], it = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, Be = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, at = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, Ha = [
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
], Bo = {
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
}, a2 = Object.fromEntries(Object.entries(fa).map(([e, t]) => [e, Bo[t.family]]));
function Wo(e, t, s) {
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
  function o(d) {
    if (!(!c.includes(d.code) || d.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(d.target.tagName)) && !(d.code === "Space" && d.target instanceof HTMLElement && d.target.closest("button"))) {
      if (d.preventDefault(), d.stopPropagation(), s(), d.code === "Escape") {
        d.repeat || t();
        return;
      }
      a.add(d.code), !d.repeat && d.code === "Space" && (r = !0), !d.repeat && d.code === "KeyE" && (i = !0);
    }
  }
  function l(d) {
    a.delete(d.code);
  }
  function u() {
    a.clear(), n = {
      x: 0,
      y: 0
    }, r = !1, i = !1;
  }
  function h() {
    u(), t();
  }
  return e.addEventListener("keydown", o), window.addEventListener("keyup", l), window.addEventListener("blur", h), {
    frame() {
      const d = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), m = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), v = {
        move: Math.hypot(d, m) < 0.15 ? 0 : (Math.round((Math.atan2(m, d) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: r,
        skill: i
      };
      return r = !1, i = !1, v;
    },
    stick(d, m) {
      n = {
        x: d,
        y: m
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
      u(), e.removeEventListener("keydown", o), window.removeEventListener("keyup", l), window.removeEventListener("blur", h);
    }
  };
}
function qo(e, t) {
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
function bn(e) {
  const t = new Wn();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const s = {
    box: new Rr(1, 1, 1),
    sphere: new kr(1, 20, 14),
    rock: new Bn(1, 0),
    crown: new Bn(1, 1),
    cylinder: new _r(1, 1, 1, 24),
    cone: new Cr(1, 1, 12),
    disc: new Sr(1, 48),
    ring: new tn(0.965, 1, 64),
    arc: new tn(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new Fn(1, 0.08, 8, 40),
    stroke: new tn(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new Fn(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new qn(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
  function i(d, m = !1, v = 1, g = !1) {
    const w = `${d}/${m}/${v}/${g}`;
    let _ = n.get(w);
    return _ || (_ = m ? new xr({
      color: d,
      transparent: v < 1,
      opacity: v,
      depthWrite: v === 1,
      side: 2
    }) : new Ms({
      color: d,
      map: e?.get(d) ?? null,
      roughness: g ? 0.34 : 0.88,
      metalness: g ? 0.45 : 0.02,
      side: 2
    }), n.set(w, _)), _;
  }
  function c(d, m, v, g, w = [
    0,
    0,
    0
  ], _ = !1, M = 1, k = !1) {
    let b = s[m];
    if (!_ && m === "box" && e?.has(v)) {
      b = b.clone(), r.add(b);
      const y = b.getAttribute("position"), E = b.getAttribute("normal"), O = b.getAttribute("uv");
      for (let I = 0; I < O.count; I++) {
        const P = Math.abs(E.getX(I)) > 0.5 ? y.getZ(I) * g[2] : y.getX(I) * g[0], L = Math.abs(E.getY(I)) > 0.5 ? y.getZ(I) * g[2] : y.getY(I) * g[1];
        O.setXY(I, P / 8, L / 8);
      }
    }
    const x = new bt(b, i(v, _, M, k));
    return x.scale.set(...g), x.position.set(...w), x.castShadow = !_, x.receiveShadow = !_, d.add(x), x;
  }
  function o(d, m = [
    0,
    0,
    0
  ]) {
    const v = new la();
    return v.position.set(...m), d.add(v), v;
  }
  function l(d, m, v, g, w, _ = 1, M = !1, k = 0.04) {
    const b = c(d, M ? "disc" : "ring", m, [
      v,
      v,
      1
    ], [
      g,
      k,
      w
    ], !0, _);
    return b.rotation.x = -Math.PI / 2, b;
  }
  function u(d, m, v, g = [
    0,
    0,
    0
  ], w = 0) {
    const _ = e?.has(v) ?? !1, M = JSON.stringify([
      m,
      w,
      _
    ]);
    let k = a.get(M);
    if (!k) {
      const x = new Wn();
      if (m.forEach(([y, E], O) => O ? x.lineTo(y, E) : x.moveTo(y, E)), x.closePath(), k = w ? new qn(x, {
        depth: w,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: w * 0.3,
        bevelSize: w * 0.3,
        bevelSegments: 2
      }) : new wr(x), _) {
        const y = k.getAttribute("uv");
        for (let E = 0; E < y.count; E++) y.setXY(E, y.getX(E) / 8, y.getY(E) / 8);
      }
      a.set(M, k);
    }
    const b = new bt(k, i(v));
    return b.position.set(...g), b.castShadow = !0, b.receiveShadow = !0, d.add(b), b;
  }
  function h(d) {
    d.updateMatrixWorld(!0);
    const m = d.matrixWorld.clone().invert(), v = new xs(), g = /* @__PURE__ */ new Map();
    d.traverse((_) => {
      if (!(_ instanceof bt) || Array.isArray(_.material)) return;
      const M = (_.geometry.index ? _.geometry.toNonIndexed() : _.geometry.clone()).applyMatrix4(v.multiplyMatrices(m, _.matrixWorld)), k = `${_.material.uuid}/${_.castShadow}/${_.receiveShadow}`;
      let b = g.get(k);
      b || (b = {
        material: _.material,
        castShadow: _.castShadow,
        receiveShadow: _.receiveShadow,
        geometries: []
      }, g.set(k, b)), b.geometries.push(M);
    }), d.clear();
    const w = [];
    for (const { material: _, castShadow: M, receiveShadow: k, geometries: b } of g.values()) {
      const x = Rs(b);
      if (b.forEach((E) => E.dispose()), !x) throw new Error("expedition_geometry_merge");
      const y = new bt(x, _);
      y.castShadow = M, y.receiveShadow = k, d.add(y), w.push(x);
    }
    return () => {
      d.clear(), w.forEach((_) => _.dispose());
    };
  }
  return {
    mesh: c,
    group: o,
    ring: l,
    shape: u,
    material: i,
    bake: h,
    geometries: s,
    dispose() {
      Object.values(s).forEach((d) => d.dispose()), a.forEach((d) => d.dispose()), r.forEach((d) => d.dispose()), n.forEach((d) => d.dispose());
    }
  };
}
function Ho(e, t, s, a) {
  const n = Ha[s], r = X.arena, { mesh: i, group: c, ring: o } = e, l = (v, g, w, _ = n.stone) => i(v, "box", _, g, w);
  function u(v, g, w, _ = !0) {
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
    for (const k of [-0.38, 0.38]) l(M, [
      0.08,
      w - 0.35,
      0.12
    ], [
      k,
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
    ], n.dark), _ && (i(M, "cone", n.trim, [
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
  function h(v, g, w, _) {
    u(v - w / 2, g, _ - 2), u(v + w / 2, g, _ - 2);
    const M = c(t, [
      v,
      _ - 2,
      g
    ]);
    i(M, "arch", n.light, [
      w / 2,
      2.3,
      1.15
    ]);
    for (let k = 1; k < 10; k++) {
      const b = k / 10 * Math.PI, x = l(M, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(b) * w * 0.49,
        Math.sin(b) * 2.25,
        0.59
      ], n.trim);
      x.rotation.z = b - Math.PI / 2;
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
  function d(v, g, w = 1) {
    const _ = c(t, [
      v,
      0,
      g
    ]);
    _.scale.setScalar(w);
    for (let M = 0; M < 5; M++) {
      const k = M * 2.4, b = i(_, "rock", M % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + M % 2 * 0.3,
        0.45
      ], [
        Math.cos(k) * 0.4,
        0.5,
        Math.sin(k) * 0.4
      ]);
      b.rotation.z = Math.sin(k) * 0.4;
    }
    for (let M = 0; M < 3; M++) i(_, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(M * 4) * 0.5,
      1,
      Math.cos(M * 4) * 0.4
    ]);
  }
  function m(v, g, w) {
    const _ = c(t, [
      v,
      0,
      g
    ]);
    _.scale.setScalar(w);
    const M = i(_, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    M.rotation.z = -0.1;
    for (let k = 0; k < 6; k++) {
      const b = k * 2.4;
      i(_, "rock", k % 2 ? n.foliage : n.accent, [
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
        const _ = w * Math.PI * 2 / (s === 2 ? 24 : 16), M = w % 2 ? 0.85 : s === 2 ? 2.6 : w % 4 ? 1.8 : 3.2;
        v.push([Math.cos(_) * M, Math.sin(_) * M]);
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
    const w = v * (7 + g % 2), _ = -7 + g * 4, M = l(t, [
      0.035,
      0.016,
      0.55 + g * 0.1
    ], [
      w,
      0.055,
      _
    ], n.seam);
    M.rotation.y = g * 1.3;
    const k = l(t, [
      0.028,
      0.015,
      0.3
    ], [
      w + 0.1,
      0.055,
      _ + 0.3
    ], n.seam);
    k.rotation.y = g * 1.3 + 0.8;
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
  h(0, -r - 3, 8, 6.3);
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
      for (let w = 0; w < 4; w++) d(v * (12.8 + w % 2), -9 + w * 5, 0.8 + w * 0.1);
      m(v * 15, -13, 1.5), m(v * 17, 1, 1.7);
    } else if (s === 3) for (let w = 0; w < 3; w++) {
      const _ = c(t, [
        v * 15,
        0,
        -9 + w * 7
      ]);
      i(_, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), i(_, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), l(_, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), i(_, "torus", n.trim, [
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
      for (let _ = 0; _ < 5; _++) i(t, "rock", _ % 2 ? n.light : n.accent, [
        1,
        2.2 + _ % 3,
        0.9
      ], [
        v * (13.5 + _ % 2),
        1.2,
        -9 + _ * 4
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
      for (let _ = 0; _ < 4; _++) {
        const M = c(t, [
          v * 14,
          0,
          -10 + _ * 6
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
        for (let k = 0; k < 3; k++) {
          l(M, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + k,
            0
          ], n.trim);
          for (let b = 0; b < 5; b++) l(M, [
            0.27,
            0.65 + b % 2 * 0.12,
            0.6
          ], [
            -0.85 + b * 0.4,
            1.2 + k,
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
    const g = (v - 3) * 8, w = -26 - v % 3 * 6, _ = 7 + v * 5 % 7;
    if (l(t, [
      5.2,
      _,
      5.5
    ], [
      g,
      _ / 2 - 3,
      w
    ], n.stone), l(t, [
      5.8,
      0.4,
      6
    ], [
      g,
      _ - 3,
      w
    ], n.light), s === 1) {
      const M = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        g,
        _ - 0.8,
        w
      ]);
      M.rotation.z = 0.9;
    } else if (s === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      g,
      _ - 0.8,
      w
    ]);
    else if (s === 3) {
      for (const M of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + v % 2 * 2,
        0.7
      ], [
        g + M,
        _ - 1,
        w
      ]);
      l(t, [
        3.8,
        0.25,
        4
      ], [
        g,
        _ - 2.5,
        w
      ], n.trim);
    } else if (s === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        g,
        _ - 0.8,
        w
      ]);
      for (const M of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        g + M,
        _ - 3,
        w + 3
      ]);
    } else if (s === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        g,
        _ + 0.7,
        w
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        g,
        _ - 1,
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
        _ - 2.35,
        w
      ], n.light);
      v % 2 && m(g + 1, w + 2, 1.5);
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
      _ - 5.6,
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
      const _ = w * Math.PI / 3;
      l(g, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(_) * v.radius * 0.86,
        0.8,
        Math.sin(_) * v.radius * 0.86
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
      d(v * 3, -8, 1.2), d(v * 4, -10, 0.85);
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
function Vo(e, t, s) {
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
  ]), i = e.group(r), c = s === "female", o = c ? 0.225 : 0.255, l = lt.traveler.fabric, u = "#574a40", h = "#d7ab8b", d = "#463f3b";
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
  ]), e.mesh(n, "cylinder", h, [
    0.066,
    0.16,
    0.07
  ], [
    0,
    0.265,
    0
  ]), e.mesh(r, "sphere", h, [
    c ? 0.161 : 0.172,
    0.22,
    0.165
  ]), e.mesh(i, "sphere", d, [
    0.18,
    0.125,
    0.173
  ], [
    0,
    0.135,
    -0.022
  ]);
  for (const M of [-1, 1])
    e.mesh(r, "sphere", h, [
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
    ]), e.mesh(r, "box", d, [
      0.047,
      0.012,
      0.014
    ], [
      M * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", d, [
      0.035,
      0.12,
      0.08
    ], [
      M * 0.157,
      0.035,
      -0.036
    ]);
  if (e.mesh(r, "sphere", h, [
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
    for (let k = 0; k < 4; k++) e.mesh(M, "sphere", d, [
      0.064 - k * 9e-3,
      0.09,
      0.063 - k * 8e-3
    ], [
      k % 2 ? 0.014 : -0.014,
      -k * 0.115,
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
  const m = [], v = [];
  for (const M of [-1, 1]) {
    const k = e.group(a, [
      M * o,
      0.12,
      0
    ]);
    m.push(k), e.mesh(k, "cylinder", l, [
      0.076,
      0.27,
      0.078
    ], [
      0,
      -0.12,
      0
    ]), e.mesh(k, "cylinder", "#e5dfcd", [
      0.081,
      0.085,
      0.081
    ], [
      0,
      -0.27,
      0
    ]), e.mesh(k, "cylinder", h, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(k, "sphere", h, [
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
    ...m,
    ...v
  ].map((M) => e.bake(M));
  r.add(i);
  const w = [];
  a.traverse((M) => {
    M instanceof bt && M.material === e.material(l) && w.push(M);
  });
  let _ = null;
  return {
    body: a,
    hand: e.group(m[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(M) {
      if (M !== _) {
        _ = M;
        for (const k of w) k.material = e.material(lt[M].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(lt[M].head);
      }
    },
    pose(M, k, b, x, y, E) {
      a.position.y = 1.3 + b, a.rotation.set(!y && x ? 0.16 : 0, Math.PI / 2 - M, 0), v.forEach((O, I) => {
        O.rotation.x = (I ? -1 : 1) * k;
      }), m.forEach((O, I) => {
        O.rotation.set(I && E ? -0.55 : (I ? 1 : -1) * k * 0.65, 0, (I ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      g.forEach((M) => M()), a.removeFromParent();
    }
  };
}
function Go(e, t, s) {
  const a = lt[s], { mesh: n, group: r, shape: i } = e, c = r(t, [
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
    for (const h of [-1, 1]) n(t, "rock", a.metal, [
      0.15,
      0.12,
      0.17
    ], [
      h * 0.3,
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
    for (const h of [-1, 1]) n(o, "box", a.metal, [
      0.065,
      0.22,
      0.17
    ], [
      h * 0.285,
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
    for (const h of [-1, 1]) n(o, "sphere", a.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      h * 0.285,
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
    for (let h = 0; h < 5; h++) {
      const d = h * Math.PI * 2 / 5;
      n(o, "cone", a.metal, [
        0.045,
        0.2,
        0.045
      ], [
        Math.sin(d) * 0.27,
        0.57,
        Math.cos(d) * 0.27
      ]);
    }
  } else if (a.head === "horns") for (const h of [-1, 1]) {
    const d = r(o, [
      h * 0.26,
      0.5,
      -0.06
    ]);
    d.rotation.z = h * -0.45, n(d, "cylinder", a.metal, [
      0.035,
      0.44,
      0.03
    ], [
      0,
      0.18,
      0
    ]);
    for (const m of [0.16, 0.3]) n(d, "cone", a.metal, [
      0.025,
      0.22,
      0.025
    ], [
      h * 0.06,
      m,
      0
    ]).rotation.z = h * -0.8;
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
    for (const h of [-1, 1])
      n(o, "torus", a.metal, [
        0.095,
        0.075,
        0.05
      ], [
        h * 0.115,
        0.39,
        0.24
      ]), n(o, "sphere", a.glow, [
        0.08,
        0.06,
        0.045
      ], [
        h * 0.115,
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
      for (const h of [-1, 1]) n(t, "cone", a.metal, [
        0.1,
        0.2,
        0.12
      ], [
        h * 0.35,
        0.12,
        -0.03
      ]).rotation.z = h * -0.5;
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
      for (let h = 0; h < 3; h++) n(t, "cylinder", a.metal, [
        0.012,
        0.32,
        0.012
      ], [
        -0.21 + h * 0.04,
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
      for (const h of [-1, 1]) i(t, [
        [0, 0],
        [h * 0.22, 0.24],
        [h * 0.18, -0.05],
        [h * 0.05, -0.12]
      ], a.metal, [
        h * 0.32,
        0.02,
        -0.06
      ]);
      break;
    case "witch":
      for (const h of [-1, 1])
        n(t, "sphere", a.glow, [
          0.05,
          0.065,
          0.04
        ], [
          h * 0.27,
          -0.16,
          0.17
        ]), n(t, "box", a.metal, [
          0.07,
          0.025,
          0.07
        ], [
          h * 0.27,
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
      for (const h of [-1, 1]) n(t, "cylinder", "#c99767", [
        0.06,
        0.32,
        0.06
      ], [
        h * 0.14,
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
      for (let h = -2; h <= 2; h++) n(t, "rock", h % 2 ? a.fabric : a.metal, [
        0.07,
        0.17,
        0.045
      ], [
        h * 0.11,
        -0.07,
        0.21
      ]).rotation.z = h * 0.27;
      break;
    case "frostbound":
      for (let h = -2; h <= 2; h++) n(t, "sphere", "#f6ffff", [
        0.08,
        0.075,
        0.09
      ], [
        h * 0.115,
        5e-3,
        0.13
      ]);
      for (const h of [-1, 1]) n(t, "rock", a.glow, [
        0.09,
        0.36,
        0.09
      ], [
        h * 0.3,
        0.22,
        -0.35
      ]).rotation.z = h * -0.5;
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
      for (let h = 0; h < 3; h++) {
        const d = h * Math.PI * 2 / 3;
        n(l, "rock", a.glow, [
          0.04,
          0.075,
          0.04
        ], [
          Math.cos(d) * 0.47,
          0.16,
          Math.sin(d) * 0.47
        ]);
      }
      break;
    case "traveler":
      break;
  }
  return {
    cape: c,
    animate(h, d) {
      l.rotation.y = d ? 0.4 : h * 0.014;
    }
  };
}
function Yo(e, t, s, a, n, r) {
  const { mesh: i, group: c, shape: o } = e, l = "#d6b881", u = "#fff0c1", h = (d, m, v) => {
    for (const g of [-1, 1]) i(s, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      g * v,
      d,
      m
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
      ]), h(2.6, 1.06, 0.28);
      for (let d = 0; d < 7; d++) {
        const m = d * Math.PI * 2 / 7, v = c(t, [
          Math.cos(m) * 0.8,
          2.6,
          Math.sin(m) * 0.6
        ]);
        v.rotation.z = Math.cos(m) * 0.8, i(v, "cone", "#526451", [
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
          Math.cos(m),
          0.28,
          Math.sin(m)
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
      for (const d of [
        1.35,
        1.8,
        2.25
      ]) i(a, "torus", l, [
        d,
        d,
        d
      ], [
        0,
        2.2,
        0
      ], !1, 1, !0).rotation.set(d * 0.7, 0.5, d);
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
      ]), h(3.25, 0.63, 0.18), i(s, "cone", l, [
        0.18,
        0.55,
        0.15
      ], [
        0,
        3.03,
        0.76
      ]).rotation.x = Math.PI / 2;
      for (const d of [-1, 1]) {
        for (let m = 0; m < 5; m++) o(a, [
          [0, 0],
          [d * (2.4 - m * 0.25), 0.95 - m * 0.22],
          [d * (2 - m * 0.24), -0.1 - m * 0.24],
          [0, -0.45]
        ], m % 2 ? "#e2a465" : "#d47c4f", [
          d * 0.4,
          2.5,
          -0.1 - m * 0.06
        ]);
        i(t, "cone", "#e3a25b", [
          0.18,
          1.5,
          0.25
        ], [
          d * 0.3,
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
      for (const d of [-1, 1])
        i(t, "cylinder", r.dark, [
          0.36,
          0.8,
          0.38
        ], [
          d * 0.55,
          0.5,
          0
        ]), i(t, "sphere", "#c9976e", [
          0.65,
          0.55,
          0.55
        ], [
          d * 1.05,
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
      ]), h(3.73, 0.51, 0.3);
      for (const d of [-1, 1])
        i(t, "box", "#818883", [
          0.8,
          1.2,
          0.95
        ], [
          d * 0.8,
          0.6,
          0
        ]), i(a, "cylinder", "#6b7375", [
          0.65,
          2.1,
          0.65
        ], [
          d * 1.75,
          1.85,
          0
        ]), i(a, "box", "#b29370", [
          1.1,
          0.8,
          1.1
        ], [
          d * 1.75,
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
      ]), h(3.4, 0.39, 0.18);
      for (let d = -2; d <= 2; d++) i(s, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(d) * 0.08,
        0.11
      ], [
        d * 0.18,
        3.94,
        0.02
      ]);
      for (const d of [-1, 1]) o(t, [
        [0, 0],
        [d * 0.95, 0.8],
        [d * 0.5, -1.3],
        [0, -0.5]
      ], "#bddeeb", [
        d * 0.5,
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
      for (let d = 0; d < 5; d++) {
        const m = 1 - d * 0.14;
        i(t, "sphere", d % 2 ? "#658c9c" : "#7da9b8", [
          m,
          m * 0.8,
          m
        ], [
          Math.sin(d * 0.6) * 0.4,
          0.8,
          0.5 - d * 0.8
        ]), i(t, "cone", "#d7e9dc", [
          0.2 * m,
          0.6 * m,
          0.25 * m
        ], [
          0,
          1.5 - d * 0.13,
          0.4 - d * 0.7
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
      ]), h(1.32, 1.65, 0.43);
      for (const d of [-1, 1])
        o(a, [
          [0, 0],
          [d * 1.4, 0.1],
          [d * 0.8, -0.7]
        ], "#b6d6d8", [
          d * 0.7,
          0.7,
          0
        ]), i(s, "cone", "#e4efde", [
          0.15,
          1,
          0.15
        ], [
          d * 0.72,
          1.65,
          1.2
        ]).rotation.z = d * -0.7;
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
      ]), h(3.65, 0.38, 0.16);
      for (let d = 0; d < 5; d++) {
        const m = d * Math.PI * 2 / 5, v = c(a, [
          Math.cos(m) * 1.7,
          2.5 + Math.sin(m) * 0.6,
          Math.sin(m) * 1.3
        ]);
        v.rotation.z = m * 0.3, i(v, "box", "#baa481", [
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
      ]), h(3, 0.4, 0.17);
      for (const d of [-1, 1]) {
        i(t, "box", "#867995", [
          0.33,
          0.9,
          0.4
        ], [
          d * 0.3,
          0.55,
          0
        ]), i(t, "rock", "#b8afcc", [
          0.5,
          0.28,
          0.38
        ], [
          d * 0.6,
          2.4,
          0
        ]);
        const m = c(a, [
          d * 0.85,
          1.8,
          0.2
        ]);
        m.rotation.z = d * -0.25, o(m, [
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
function Qo(e, t) {
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
  ], r = e.shape(a, n, Be.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, Be.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, Be.enamel, [
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
    ], Be.silver, [
      0,
      0,
      l
    ]), e.mesh(a, "rock", Be.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      l + Math.sign(l) * 0.014
    ], !1, 1, !0);
  let c = 0, o = -1;
  return s.visible = !1, { update(l, u, h, d, m) {
    const v = u ? 1 : 0, g = Math.max(0, Math.min(4, d - o));
    c = m || o < 0 || d < o ? v : c + (v - c) * (1 - Math.exp(-g * 0.85)), o = d, s.visible = l === "blade" || u || c > 0.04, s.position.set(-0.4 + c * 0.12, -0.1 + c * 0.3, 0.17 + c * 0.25), s.rotation.set(0.12 - c * 0.22, 0.15 - c * 0.3, -0.16 + c * 0.22), a.scale.setScalar(0.94 + c * 0.07), r.material = e.material(h ? Be.parry : l === "blade" ? Be.block : Be.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : Be.enamel);
  } };
}
function Ko(e, t) {
  const s = e.group(t), a = new gr({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new Sn(Be.ward) },
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
  }), n = new bt(e.geometries.sphere, a);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, s.add(n), s.visible = !1, {
    update(r, i) {
      s.visible = !!r && r.ward > 0, !(!r || !s.visible) && (s.position.set(r.x, 0, r.y), a.uniforms.impact.value = i, s.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), s.removeFromParent();
    }
  };
}
function Xo(e, t) {
  const s = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  s.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const h = e.group(s);
    e.mesh(h, "box", at.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(h, "box", at.page, [
      0.22,
      0.06,
      0.38
    ], [
      u * 0.12,
      0.04,
      0
    ]), a.push(h);
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
  const r = e.mesh(s, "rock", at.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(s, "torus", at.crest, [
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
  return { update(u, h, d, m) {
    const v = m || l < 0 || d < l ? 1 : 1 - Math.exp(-Math.min(4, d - l) * 0.5);
    l = d, c += ((u ? 1 : 0) - c) * v, o += ((h ? 0.5 : u ? 0.28 : 0.15) - o) * v, s.position.y = o, s.rotation.x = -0.45 + (o - 0.15) * 0.7, a[0].rotation.z = -0.65 + c * 0.5, a[1].rotation.z = 0.65 - c * 0.5, n.rotation.z = m ? 0.2 : 0.2 + c * (Math.sin(d * 0.18) + 1) * 1.3, r.scale.set(0.07 + c * 0.025, 0.1 + c * 0.06, 0.07 + c * 0.025), i.visible = u, m || (r.rotation.y = d * 0.08);
  } };
}
function Jo() {
  let e = null, t = 0, s = -1 / 0, a = 0, n = 0;
  function r() {
    e = null, s = -1 / 0, a = 0, n = 0;
  }
  return {
    reset: r,
    get active() {
      return n > 0;
    },
    update(i, c, o) {
      (c < t || !i || o) && r();
      const l = e ? Math.min(0.1, c - t) : 0;
      i && e && Math.hypot(i.x - e.x, i.y - e.y) > 1e-3 && (s = c);
      const u = !o && c - s <= 2 / X.hz, h = n > 0;
      n += ((u ? 1 : 0) - n) * (1 - Math.exp(-l * (u ? 14 : 18))), !u && n < 1e-3 ? (n = 0, a = 0) : h && (a = (a + l * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = i ? {
        x: i.x,
        y: i.y
      } : null, t = c;
      const d = Math.sin(a);
      return {
        stride: d * 0.45 * n,
        lift: d * d * 0.035 * n,
        amount: n
      };
    }
  };
}
function Qs(e, t, s = 1) {
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
function Ks(e, t, s) {
  const a = e.group(t), n = Vo(e, a, s), r = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), c = e.group(r), o = n.hand, l = e.group(c), u = Qo(e, c), h = Jo();
  let d = null, m = -1, v = Math.PI / 2, g = null, w = null, _ = null;
  function M(k, b) {
    if (!(k === w && b === _)) {
      if (w = k, _ = b, l.clear(), o.clear(), d = null, g = Go(e, l, _), n.dress(_), w === "blade")
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
      else if (w === "bow") Qs(e, o);
      else if (w === "staff")
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
      else if (w === "daggers") for (const x of [-1, 1]) {
        const y = e.group(o, [
          x < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(y, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(y, [
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
      else if (w === "grimoire") d = Xo(e, o);
      else if (w === "cannon") {
        const x = e.group(o, [
          0.02,
          0.08,
          0.17
        ]);
        x.rotation.x = Math.PI / 2, e.mesh(x, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(x, "torus", "#d2a96c", [
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
    resetMotion: h.reset,
    get animating() {
      return h.active;
    },
    update(k, b, x, y, E, O, I, P = !1) {
      M(b, x), u.update(b, !!k?.shield, !!k?.guard, y, O);
      const L = O || m < 0 || y < m ? 1 : 1 - Math.exp(-Math.min(4, y - m) * 0.65);
      m = y;
      const T = I ? Math.PI / 2 + 0.23 : k?.facing ?? Math.PI / 2;
      v += Math.atan2(Math.sin(T - v), Math.cos(T - v)) * L;
      const B = h.update(I ? null : k, E, O), Q = !!k?.dashTime;
      a.position.set(k?.x ?? 0, I ? 0.3 : 0, k?.y ?? -8), a.scale.setScalar(I ? 1.65 : 1), n.pose(v, B.stride, B.lift, Q, O, !!k?.swing || P), g.cape.rotation.x = O ? -0.15 : -0.21 - B.amount * 0.44 - Math.sin(y * 0.15) * 0.12, g.animate(y, O);
      const U = k?.swing && !O ? Math.sin(k.swing / (b === "cannon" ? 16 : 9) * Math.PI) : 0;
      o.rotation.z += ((P ? -0.3 : -0.2 - U * 1.3) - o.rotation.z) * L, o.rotation.x += ((P ? -0.25 : 0.1 + U * 0.6) - o.rotation.x) * L, d && d.update(!!k?.resonance, P, y, O), i.scale.set(0.6 + (Q ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function Ln(e, t, s, a) {
  const { mesh: n, group: r } = e, i = r(t), c = r(i), o = r(c), l = r(c), u = [], h = ke(s), d = fe[s].radius;
  e.ring(i, "#1d3540", d * 1.15, 0, 0, 0.16, !0);
  const m = "#cfad70", v = "#fff0b0", g = a.dark;
  function w(P, L, T) {
    const B = r(c, [
      P,
      T,
      L
    ]);
    n(B, "box", g, [
      0.32,
      T,
      0.42
    ], [
      0,
      -T / 2,
      0
    ]), n(B, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -T + 0.11,
      0.1
    ]), u.push(B);
  }
  function _(P, L, T = "#d9e8df") {
    n(P, "box", m, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(P, "box", g, [
      0.11,
      0.4,
      0.11
    ]), n(P, "box", T, [
      0.2,
      L,
      0.13
    ], [
      0,
      L / 2 + 0.35,
      0
    ], !1, 1, !0), n(P, "cone", T, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      L + 0.5,
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
    for (const P of [-0.27, 0.27]) {
      const L = n(l, "cone", m, [
        0.15,
        0.7,
        0.15
      ], [
        P,
        1.15,
        0.9
      ]);
      L.rotation.x = 0.55, n(l, "sphere", v, [
        0.05,
        0.04,
        0.06
      ], [
        P,
        0.82,
        1.02
      ], !0), w(P, -0.42, 0.45), w(P, 0.45, 0.45);
    }
    for (let P = 0; P < 3; P++) n(c, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + P * 0.4
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
    const P = n(l, "crescent", m, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    P.rotation.z = 0.87;
    for (const L of [-0.23, 0.23]) n(l, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      L,
      4.08,
      0.45
    ], !0);
    for (const L of [-1, 1]) {
      const T = r(c, [
        L * 0.8,
        3.3,
        0
      ]);
      T.rotation.z = L * 0.65, n(T, "cone", "#757caf", [
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
    for (let L = 0; L < 5; L++) {
      const T = L / 5 * Math.PI * 2, B = n(o, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(T) * 1.95,
        3.3 + Math.sin(T) * 1.1,
        -0.3
      ]);
      B.rotation.z = T;
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
    ]), n(c, "rock", m, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const P of [-1, 1]) n(c, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      P * 0.95,
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
    ], !0), n(l, "torus", m, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let P = 0; P < 7; P++) {
      const L = P * Math.PI * 2 / 7;
      n(l, "cone", m, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(L) * 0.78,
        4.85,
        Math.sin(L) * 0.78
      ]);
    }
    o.position.set(1.55, 1.35, 0.2), o.rotation.z = -0.3, _(o, 3.4, "#f6dc9f"), n(c, "box", a.stone, [
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
    for (const L of [-1, 1])
      n(c, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        L * 1.03,
        2.7,
        0
      ]), n(c, "box", m, [
        0.7,
        0.1,
        0.8
      ], [
        L * 1.08,
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
    const P = r(c, [
      -1.32,
      1.5,
      0.6
    ]);
    n(P, "box", g, [
      1.2,
      1.8,
      0.25
    ]), n(P, "box", m, [
      1,
      1.58,
      0.28
    ]), n(P, "box", a.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(P, "rock", a.light, [
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
    ]), n(o, "box", m, [
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
  } else if (ke(s)) Yo(e, c, l, o, s, a);
  else if (s === "wisp")
    n(c, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(l, "torus", m, [
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
    for (const P of [-1, 1])
      w(P * 0.27, -0.25, 0.35), n(l, "cone", m, [
        0.09,
        0.35,
        0.09
      ], [
        P * 0.21,
        1.09,
        0.42
      ]), n(l, "sphere", v, [
        0.05,
        0.04,
        0.035
      ], [
        P * 0.15,
        0.8,
        0.77
      ], !0), n(o, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        P * 0.37,
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
    const P = s === "priest", L = s === "guard";
    if (P ? n(c, "cone", "#767da5", [
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
    ], !0), P)
      n(l, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), o.position.set(0.52, 1, 0.1), n(o, "cylinder", m, [
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
      o.position.set(0.54, 1, 0.2), s === "archer" ? Qs(e, o, 1.3) : (o.rotation.z = -0.3, _(o, 0.75)), L && (n(c, "box", m, [
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
    h ? 5.5 : s === "charger" ? 1.7 : 2.45,
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
  const k = n(M, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), b = [];
  c.traverse((P) => {
    P instanceof bt && b.push({
      mesh: P,
      material: P.material
    });
  });
  let x = 0, y = -100, E = 0, O = 0;
  const I = o.rotation.z;
  return {
    root: i,
    bar: M,
    update(P, L, T) {
      const B = Math.abs(P.x - E) + Math.abs(P.y - O) > 5e-3;
      E = P.x, O = P.y, x && !P.windup && (y = L), x = P.windup;
      const Q = P.windup ? 1 - P.windup / fe[P.kind].windup : 0, U = Math.max(0, 1 - (L - y) / 10);
      i.position.set(P.x, 0, P.y), c.rotation.y = Math.PI / 2 - P.angle, c.position.y = T ? 0 : s === "weaver" || s === "priest" ? 0.13 + Math.sin(L * 0.055) * 0.1 : B ? Math.abs(Math.sin(L * 0.3)) * 0.055 : 0, c.rotation.x = T ? 0 : -Q * 0.16 + U * 0.2, l.rotation.z = !T && s === "king" ? Math.sin(L * 0.035) * 0.08 : 0, o.rotation.x = T ? 0 : Q * -1.3 + U * 1.4, o.rotation.z = I + (T ? 0 : Q * -0.35);
      for (let Z = 0; Z < u.length; Z++) u[Z].rotation.x = !T && B ? Math.sin(L * 0.32 + Z * Math.PI) * 0.28 : 0;
      for (const Z of b) Z.mesh.material = P.marked > 2 && !T ? e.material("#fff6dd") : Z.material;
      M.visible = !h && P.hp < P.maxHp, k.scale.x = P.hp / P.maxHp, k.position.x = (P.hp / P.maxHp - 1) * 0.5;
    }
  };
}
var le = {
  danger: "#c34740",
  warning: "#ec8754",
  magic: "#8bd9f2",
  frost: "#addffc",
  gold: "#fff0bb",
  heal: "#75dbb0",
  fire: "#f0ad55"
};
function ei(e, t) {
  const s = /* @__PURE__ */ new Map();
  function a(r, i, c = 1, o = !1) {
    const l = Math.max(0.1, Math.min(1, Math.round(c * 10) / 10)), u = `${r}/${i}/${l}/${o}`;
    let h = s.get(u);
    h || (h = {
      list: [],
      used: 0
    }, s.set(u, h));
    let d = h.list[h.used++];
    return d || (d = e.mesh(t, r, i, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !o, l), h.list.push(d)), d.visible = !0, d.rotation.set(0, 0, 0), d.scale.set(1, 1, 1), d;
  }
  function n(r, i, c, o, l, u = 1, h = 0.09) {
    const d = a(r, i, u);
    return d.position.set(o, h, l), d.scale.set(c, c, 1), d.rotation.x = -Math.PI / 2, d;
  }
  return { update(r, i) {
    for (const o of s.values())
      o.used = 0, o.list.forEach((l) => l.visible = !1);
    if (!r) return;
    const c = r.player;
    if (n("ring", "#f2f6e2", 0.64, c.x, c.y, 0.8), c.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const l = a("cone", le.gold, 0.7 - o * 0.15);
      l.position.set(c.x - Math.cos(c.dashAngle) * o * 0.43, 0.45, c.y - Math.sin(c.dashAngle) * o * 0.43), l.scale.set(0.13, c.dashTime / 8 * 1.7, 0.13), l.rotation.set(0, -c.dashAngle, -Math.PI / 2);
    }
    if (!r.boss && (r.encounter === "siege" || r.encounter === "ritual")) {
      const o = r.objective;
      r.encounter === "ritual" && (n("disc", le.magic, 2.5, o.x, o.y, 0.12), n("ring", le.magic, 2.5, o.x, o.y), n("ring", le.gold, 2.2, o.x, o.y, 0.8));
      const l = a("cylinder", "#526b79");
      l.position.set(o.x, 0.3, o.y), l.scale.set(0.5, 0.6, 0.5);
      const u = a("rock", r.encounter === "siege" ? le.fire : le.magic);
      if (u.position.set(o.x, 1, o.y), u.scale.set(0.23, 0.5, 0.23), r.encounter === "siege") {
        u.position.y = 1.35, u.scale.set(0.4, 0.85, 0.4);
        const h = a("cone", le.gold, 0.8);
        h.position.set(o.x, 1.4, o.y), h.scale.set(0.2, 0.85, 0.2), n("ring", le.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (u.rotation.y = r.tick * 0.025);
    }
    for (const o of r.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", le.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const l = a("cylinder", "#687c81");
          l.position.set(o.x, 0.25, o.y), l.scale.set(0.4, 0.5, 0.4);
          const u = a("box", "#bd9a68");
          u.position.set(o.x, 0.65, o.y), u.scale.set(0.9, 0.2, 0.25), u.rotation.y = -o.angle;
          const h = a("sphere", le.magic);
          h.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), h.scale.setScalar(0.11);
        } else {
          const l = o.kind === "familiar" && c.resonance > 0, u = l ? 1.5 : 1, h = o.kind === "shade" ? "#a6acd8" : l ? at.empowered : at.familiar, d = i ? 0 : Math.sin(r.tick * 0.1 + o.id) * 0.08, m = a("sphere", h, 1, !0);
          m.position.set(o.x, 0.55 * u + d, o.y), m.scale.set(0.3 * u, 0.36 * u, 0.3 * u);
          for (const g of [-1, 1]) {
            const w = a("cone", h, 1, !0);
            w.position.set(o.x + g * 0.2 * u, 0.93 * u + d, o.y), w.scale.set(0.08 * u, 0.22 * u, 0.08 * u);
          }
          const v = a("sphere", "#35475b");
          if (v.position.set(o.x + Math.cos(o.angle) * 0.28 * u, 0.63 * u + d, o.y + Math.sin(o.angle) * 0.28 * u), v.scale.setScalar(0.07 * u), l) {
            const g = a("torus", at.crest, 1, !0);
            g.position.set(o.x, 1.45 + d, o.y), g.rotation.x = Math.PI / 2, g.scale.setScalar(0.32);
            for (let w = 0; w < 3; w++) {
              const _ = w * Math.PI * 2 / 3, M = a("rock", at.crest, 1, !0);
              M.position.set(o.x + Math.cos(_) * 0.32, 1.55 + d, o.y + Math.sin(_) * 0.32), M.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of r.enemies) {
      if (ke(o.kind) && o.phase > 1) {
        const l = fe[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? le.fire : le.magic, l, o.x, o.y, 0.65), !i) for (let u = 0; u < o.phase + 2; u++) {
          const h = r.tick * 0.025 + u * Math.PI * 2 / (o.phase + 2), d = a("rock", o.kind === "king" ? le.fire : le.magic, 0.8);
          d.position.set(o.x + Math.cos(h) * l, 0.55 + Math.sin(h * 2) * 0.2, o.y + Math.sin(h) * l), d.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const l = 1 - o.windup / fe[o.kind].windup;
        if (n("ring", le.warning, fe[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const u = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), h = a("box", le.danger, 0.3);
          h.scale.set(0.75, 0.035, u), h.position.set(o.x + Math.cos(o.angle) * u / 2, 0.09, o.y + Math.sin(o.angle) * u / 2), h.rotation.y = Math.PI / 2 - o.angle, n("ring", le.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const u = Math.hypot(o.target.x - o.x, o.target.y - o.y), h = a("box", le.warning, 0.6);
          h.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), h.scale.set(u, 0.03, 0.09), h.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", le.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", le.danger, fe[o.kind].reach, o.target.x, o.target.y, 0.15 + l * 0.2), n("ring", le.danger, fe[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", le.frost, fe[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", le.gold, fe[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let l = 0; l < 3; l++) {
        const u = a("rock", le.fire, 0.8);
        u.position.set(o.x + Math.sin(l * 2) * 0.3, 0.35 + (r.tick + l * 7) % 20 / 18, o.y + Math.cos(l * 2) * 0.3), u.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of r.hazards) {
      const l = o.friendly ? o.kind === "fire" ? le.fire : le.magic : le.danger;
      if (o.kind === "beam") {
        const u = a("box", l, o.wait ? 0.3 : 0.75);
        u.position.set(o.x + Math.cos(o.angle) * o.length / 2, 0.11, o.y + Math.sin(o.angle) * o.length / 2), u.scale.set(o.length, 0.04, o.width * 2), u.rotation.y = -o.angle;
        for (const h of [0, o.length]) n("disc", l, o.width, o.x + Math.cos(o.angle) * h, o.y + Math.sin(o.angle) * h, o.wait ? 0.3 : 0.75);
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
        const h = a("box", l, 0.7);
        h.position.copy(u.position), h.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", le.gold, o.radius * (0.7 + Math.sin(r.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let u = 0; u < 6; u++) {
          const h = u * Math.PI / 3, d = a("cone", l, 0.7);
          d.position.set(o.x + Math.cos(h) * o.radius * 0.65, 0.45, o.y + Math.sin(h) * o.radius * 0.65), d.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of r.shots) {
      const l = o.friendly ? le.gold : le.danger, u = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      u.position.set(o.x, 0.6, o.y), u.scale.set(0.11, 0.11, 0.11);
      const h = a("sphere", l, 0.8);
      h.position.copy(u.position), h.scale.set(0.21, 0.18, 0.21);
      const d = a("cone", l, 0.5);
      d.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), d.scale.set(0.14, 0.75, 0.14), d.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of r.effects) {
      const l = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const u = n("arc", le.gold, o.size, o.x, o.y, 0.3 * (1 - l), 0.42);
        u.rotation.z = -o.angle - 0.9 + l * 0.4;
        const h = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - l), 0.43);
        h.rotation.z = u.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", at.crest, o.size * (i ? 1 : 0.6 + l * (2 - l)), o.x, o.y, 0.8 - l * 0.6, 0.16);
        for (const u of r.companions) {
          if (u.kind !== "familiar" || u.hp <= 0 || u.life <= 0) continue;
          const h = u.x - c.x, d = u.y - c.y, m = a("box", at.empowered, 1 - l * 0.7);
          m.position.set((c.x + u.x) / 2, 1.1, (c.y + u.y) / 2), m.scale.set(Math.hypot(h, d), 0.045, 0.045), m.rotation.y = -Math.atan2(d, h);
        }
        for (let u = 0; u < 4; u++) {
          const h = u * Math.PI / 2 + (i ? 0 : l), d = a("rock", at.empowered, 1 - l * 0.4);
          d.position.set(c.x + Math.cos(h) * 0.95, 1.7 + (i ? 0 : l * 0.5), c.y + Math.sin(h) * 0.95), d.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let u = 0; u < 4; u++) {
          const h = a("box", u % 2 ? "#ffffff" : le.magic, 1 - l * 0.6);
          h.scale.set(0.09 + (1 - l) * 0.09, 1.05, 0.08), h.position.set(o.x + (u % 2 ? 0.14 : -0.14), 0.5 + u * 0.85, o.y), h.rotation.z = u % 2 ? -0.35 : 0.35;
        }
        n("ring", le.magic, 0.4 + l, o.x, o.y, 1 - l);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const u = o.kind === "block" || o.kind === "parry", h = o.kind === "ward-break", d = u ? o.kind === "parry" ? Be.parry : Be.block : Be.ward;
        if (u) {
          const m = a("ring", d, 1 - l);
          m.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), m.rotation.y = Math.PI / 2 - o.angle, m.scale.setScalar(0.6 + l * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let m = 0; m < (h ? 6 : 4); m++) {
          const v = m * 2.4 + o.id, g = a(h ? "rock" : "box", d, 1 - l), w = i ? 1.1 : 0.7 + l * (h ? 1.5 : 0.6);
          g.position.set(o.x + Math.cos(v) * w, 0.7 + m % 3 * 0.55, o.y + Math.sin(v) * w), g.scale.set(0.07 * (1 - l), (h ? 0.3 : 0.16) * (1 - l), 0.04), g.rotation.set(v, v, v);
        }
      } else if (o.kind === "heal") n("ring", le.heal, 0.4 + l, o.x, o.y, 1 - l);
      else {
        const u = o.kind === "hit" ? le.danger : le.gold;
        if (n("ring", u, o.size * (0.4 + l), o.x, o.y, 1 - l), !i) for (let h = 0; h < 7; h++) {
          const d = h * 2.4 + o.id, m = a("rock", u, 1 - l * 0.8);
          m.position.set(o.x + Math.cos(d) * l * o.size, 0.4 + Math.sin(l * Math.PI) * 0.8, o.y + Math.sin(d) * l * o.size), m.scale.set(0.1 * (1 - l), 0.28 * (1 - l), 0.1 * (1 - l)), m.rotation.z = d;
        }
      }
    }
  } };
}
function ti(e) {
  const t = document.createElement("div"), s = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", Be.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ne.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(X.maxHp)), t.append(s);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new dt();
  let r = null, i = 0, c = 0, o = null;
  function l(u, h, d, m, v, g, w) {
    n.set(h, d, m).project(v), u.style.left = `${(n.x * 0.5 + 0.5) * g}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * w}px`;
  }
  return {
    update(u, h, d, m) {
      if (u !== r && (r = u, i = 0, o = null, c = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const v = u.player;
      t.hidden || (s.style.width = `${v.ward / X.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(v.ward)), l(t, v.x, 0, v.y, h, d, m));
      const g = u.effects.filter((_) => _.id > i && _.kind in ne.defenseFeedback), w = g.find((_) => _.kind === "parry" || _.kind === "ward-break") ?? g.at(-1);
      w && (o = w.kind, c = u.tick + 27), i = u.serial, u.tick >= c && (o = null), a.hidden = !o && !v.shield, a.dataset.state = o ?? "blocking", a.textContent = o ? ne.defenseFeedback[o] : v.shield ? ne.guardActive : "", l(a, v.x, v.shield ? 3.65 : 3.05, v.y, h, d, m);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function ai(e, t, s, a) {
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
    const l = i ? n / c : n, u = i ? r : r / c, h = e.group(s, [
      i ? -n / 2 + (o + 0.5) * l : 0,
      0,
      i ? 0 : -r / 2 + (o + 0.5) * u
    ]), d = (a.height ?? 4) + (o % 3 - 1) * 0.35, m = a.kind === "workshop";
    e.mesh(h, "box", o % 2 ? f.stone : f.cloth, [
      l - 0.15,
      d - 0.4,
      u - 0.15
    ], [
      0,
      (d + 0.4) / 2,
      0
    ]);
    for (const M of [-l / 2 + 0.12, l / 2 - 0.12]) e.mesh(h, "box", f.timber, [
      0.18,
      d,
      u
    ], [
      M,
      d / 2,
      0
    ]);
    for (const M of [0.7, d - 0.3]) e.mesh(h, "box", f.wood, [
      l,
      0.15,
      u
    ], [
      0,
      M,
      0
    ]);
    const v = e.group(h, [
      0,
      d + 0.24,
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
    const w = e.group(h, [
      0,
      0,
      u / 2
    ]), _ = a.entrance ? 0 : -l * 0.19;
    e.mesh(w, "box", f.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      _,
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
      _ + M,
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
    if (m) {
      e.mesh(h, "box", f.wood, [
        l * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        u / 2 - 0.5
      ]);
      for (let M = 0; M < 3; M++) e.mesh(h, "cylinder", f.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (M - 1) * 0.55,
        1.4,
        u / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(h, "box", f.slate, [
        0.6,
        d * 0.38,
        0.7
      ], [
        -l * 0.3,
        d + 0.55,
        -u * 0.2
      ]), e.mesh(h, "box", f.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -l * 0.3,
        d * 1.19 + 0.6,
        -u * 0.2
      ]);
  }
}
function ni(e, t, s) {
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
function si(e, t) {
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
function ri(e, t, s, a) {
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
function oi(e, t, s) {
  const a = new dt(...s.from), n = new dt(...s.to), r = n.clone().sub(a), i = r.length(), c = s.kind === "pipe", o = c ? 0.23 : 0.018, l = e.mesh(t, "cylinder", c ? f.brass : f.timber, [
    o,
    i,
    o
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (l.quaternion.setFromUnitVectors(new dt(0, 1, 0), r.normalize()), c) for (let u = 1; u < i; u += 3.7) {
    const h = a.clone().addScaledVector(r, u);
    e.mesh(t, "cylinder", f.wood, [
      0.28,
      0.16,
      0.28
    ], h.toArray()).quaternion.copy(l.quaternion), e.mesh(t, "box", f.shadow, [
      0.12,
      0.65,
      0.12
    ], [
      h.x,
      h.y - 0.3,
      h.z
    ]);
  }
  else for (let u = 2; u < i - 2; u += 1.9) {
    const h = a.clone().addScaledVector(r, u), d = e.group(t, h.toArray());
    d.rotation.y = Math.atan2(r.x, r.z) + Math.PI / 2, e.shape(d, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(u) % 2 ? f.cloth : f.light);
    for (const m of [-1, 1]) e.mesh(d, "box", f.wood, [
      0.07,
      0.17,
      0.06
    ], [
      m * 0.42,
      -0.02,
      0.03
    ]);
  }
}
function ii(e, t, s) {
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
    const l = -a / 2 + (o + 0.5) * a / i, u = -n / 2 + (c + 0.5) * n / r, h = a / i - 0.22, d = n / r - 0.24;
    if (s.kind === "fuel") {
      for (let m = 0; m < 5; m++) e.mesh(t, "box", m % 2 ? f.wood : f.timber, [
        h,
        0.2,
        d / 2 - 0.07
      ], [
        l,
        0.28 + m * 0.24,
        u + m % 2 * 0.12
      ]);
      e.mesh(t, "box", f.cloth, [
        h + 0.08,
        0.055,
        d
      ], [
        l,
        1.42,
        u
      ]);
    } else {
      const m = 0.85 + (c + o) % 3 * 0.22;
      e.mesh(t, "box", f.wood, [
        h,
        m,
        d
      ], [
        l,
        0.16 + m / 2,
        u
      ]);
      for (const v of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.11,
        m + 0.04,
        d + 0.05
      ], [
        l + v * h * 0.32,
        0.16 + m / 2,
        u
      ]);
      e.mesh(t, "box", f.light, [
        0.32,
        0.4,
        0.03
      ], [
        l,
        0.7,
        u + d / 2 + 0.02
      ]), e.mesh(t, "box", f.rose, [
        0.09,
        0.09,
        0.04
      ], [
        l,
        0.61,
        u + d / 2 + 0.045
      ]);
      for (let v = -0.25; v <= 0.25; v += 0.25) e.mesh(t, "box", f.timber, [
        h,
        0.015,
        0.016
      ], [
        l,
        m + 0.17,
        u + v * d
      ]);
      (c + o) % 3 === 0 && (e.mesh(t, "box", f.cloth, [
        h * 0.75,
        0.38,
        d * 0.55
      ], [
        l,
        m + 0.37,
        u - 0.18
      ]), e.mesh(t, "box", f.timber, [
        0.055,
        0.4,
        d * 0.57
      ], [
        l,
        m + 0.37,
        u - 0.18
      ])), e.mesh(t, "box", f.light, [
        0.32,
        0.018,
        0.45
      ], [
        l + h * 0.23,
        m + 0.19,
        u + d * 0.25
      ]);
    }
  }
}
function li(e, t, s, a) {
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
function is(e, t, s) {
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
function ci(e, t, s, a) {
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
function ui(e, t) {
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
function Xs(e, t, s, a, n = 2.8) {
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
function Js(e, t, s, a, n, r) {
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
    for (let h = 0; h < Math.ceil(o / 0.65); h++) e.mesh(u, "box", h % 3 ? f.roof : f.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -o / 2 + h * 0.65,
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
function za(e, t, s, a, n, r = 1.1) {
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
function di(e, t, s) {
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
  for (const u of [-a / 2 + 0.15, a / 2 - 0.15]) for (const h of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(t, "box", f.timber, [
    0.27,
    i,
    0.27
  ], [
    u,
    i / 2,
    h
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
  for (const u of [-a * 0.29, a * 0.29]) za(e, t, u, n / 2, 2.3, r ? 1.6 : 1.2);
  const c = e.group(t, [
    a / 2,
    0,
    0
  ]);
  c.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) za(e, c, u, 0.03, 2.3);
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
  ]), Js(e, t, a, n, i, r ? 1.15 : 3.2);
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
    for (let h = -6; h <= 6; h++) e.mesh(u, "box", h % 3 ? f.cloth : f.light, [
      0.74,
      0.04,
      2.3
    ], [
      h * 0.75,
      0,
      0
    ]);
    for (const h of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.09,
      0.12,
      2.1
    ], [
      h * 4.5,
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
    for (let h = -3; h <= 3; h++)
      e.mesh(t, "box", f.timber, [
        0.025,
        0.35,
        0.025
      ], [
        h * 0.45 - 3,
        2.5,
        n / 2 + 0.16
      ]), e.mesh(t, "cone", f.leaf, [
        0.17,
        0.6,
        0.15
      ], [
        h * 0.45 - 3,
        2.05,
        n / 2 + 0.16
      ]);
    for (const h of [-a * 0.29, a * 0.29]) e.mesh(t, "box", f.ember, [
      1.35,
      1.15,
      0.015
    ], [
      h,
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
    za(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", f.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function hi(e, t, s) {
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
    const h = e.group(t, [
      0,
      a * 0.39,
      0
    ]);
    h.rotation.set(0.4 * Math.sin(u * 2), 0, (u - 1) * 0.65), e.mesh(h, "cylinder", f.timber, [
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
    const h = u * 2.4, d = u === 8 ? 0.1 : n * 0.56, m = e.mesh(t, "crown", u % 3 ? c : o, [
      n * 0.49 + 0.4,
      a * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(h) * d,
      a * (0.68 + u % 3 * 0.11),
      Math.cos(h) * d
    ]);
    m.rotation.set(u * 0.37, u * 0.61, 0.14), m.receiveShadow = !1;
  }
}
function fi(e, t, s) {
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
  for (const i of [r * 0.35, r * 0.7]) za(e, t, 0, n / 2 + 0.02, i, 0.7);
  Js(e, t, a + 0.35, n + 0.35, r, r * 0.32), e.mesh(t, "cylinder", f.brass, [
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
function pi(e, t, s, a, n) {
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
      ui(e, c);
      break;
    case "screen":
      is(e, c, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      is(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      ai(e, i, c, a);
      break;
    case "stove":
      si(e, i);
      break;
    case "medicine":
      ri(e, i, r.width, r.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      ii(e, i, a);
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
      ]), di(e, c, a);
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
      hi(e, c, a);
      break;
    case "tower":
      fi(e, c, a);
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
        const h = u * Math.PI / 5;
        e.mesh(c, "box", f.light, [
          0.085,
          o - 2,
          0.085
        ], [
          Math.sin(h) * l,
          o / 2,
          Math.cos(h) * l
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
      li(e, i, r.width, r.depth);
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
        const h = u * Math.PI * 0.4, d = r.width * 0.25, m = e.group(c, [
          Math.sin(h) * l * 0.45,
          0,
          Math.cos(h) * l * 0.45
        ]);
        m.rotation.y = h;
        const v = e.mesh(m, "cylinder", u % 2 ? f.root : f.rootLight, [
          l * 0.65,
          o * 0.64,
          l * 0.49
        ], [
          0,
          o * 0.3,
          0
        ]);
        v.rotation.z = 0.13;
        const g = e.group(m, [
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
        const w = e.mesh(m, "cone", f.root, [
          l * 0.5,
          d * 1.4,
          l * 0.4
        ], [
          d * 0.6,
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
        ci(e, i, c, a);
        break;
      }
      const o = a.height, l = Math.min(o, 0.65);
      a.wallUse === "homes" && ni(e, c, r), e.mesh(i, "box", f.mortar, [
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
      const u = r.width > r.depth, h = Math.max(r.width, r.depth);
      if (n) {
        for (const d of [1.1, o - 0.55]) e.mesh(c, "box", f.light, [
          r.width + 0.15,
          0.22,
          r.depth + 0.15
        ], [
          0,
          d,
          0
        ]);
        for (let d = -h / 2 + 3; d < h / 2 - 1; d += 6) for (const m of [-1, 1]) {
          const v = e.group(c, [
            u ? d : m * (r.width / 2 + 0.04),
            0,
            u ? m * (r.depth / 2 + 0.04) : d
          ]);
          v.rotation.y = u ? m < 0 ? Math.PI : 0 : m * Math.PI / 2;
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
          for (const _ of [
            -0.55,
            0,
            0.55
          ]) e.mesh(v, "box", f.shadow, [
            0.07,
            w,
            0.06
          ], [
            _,
            g,
            0.06
          ]);
          for (const _ of [-1, 1]) e.mesh(v, "box", f.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            g + _ * w / 2,
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
      for (let d = -h / 2 + 1; d < h / 2; d += 3.5) {
        o > 4 && e.mesh(c, "box", f.stone, u ? [
          1.3,
          0.85,
          r.depth
        ] : [
          r.width,
          0.85,
          1.3
        ], [
          u ? d : 0,
          o + 0.55,
          u ? 0 : d
        ]);
        for (let m = 0; m < Math.floor(o / 0.9); m++) e.mesh(c, "box", f.mortar, u ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          u ? d + m % 2 * 0.7 : r.width / 2 + 0.01,
          0.55 + m * 0.85,
          u ? r.depth / 2 + 0.01 : d + m % 2 * 0.7
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
        const u = Math.sin(o * 7 + l * 19), h = r.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? f.leafLight : f.leaf, [
          h,
          0.32 + u * 0.1,
          h * 0.9
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
        const u = Math.sin(o * 13 + l * 7), h = 0.6 + u * 0.2;
        e.mesh(i, "crown", u > 0 ? f.leaf : f.leafLight, [
          0.7,
          h,
          0.7
        ], [
          o,
          h * 0.75,
          l
        ]), u > 0.75 && e.mesh(i, "rock", f.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          o,
          h * 1.65,
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
            const h = e.mesh(i, "box", f.wood, [
              0.09,
              1.25,
              0.09
            ], [
              o * (r.width / 2 - 0.2),
              0.76,
              l
            ]);
            h.rotation.x = u * Math.PI / 4;
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
        const l = -r.width * 0.3 + o * r.width * 0.3, u = (a.height ?? 3) * (1 - o * 0.22), h = r.width * 0.11;
        e.mesh(c, "cylinder", f.stone, [
          h,
          u,
          h
        ], [
          l,
          u / 2 + 0.3,
          -r.depth * 0.2
        ]), e.mesh(c, "box", f.light, [
          h * 2.6,
          0.25,
          h * 2.6
        ], [
          l,
          u + 0.3,
          -r.depth * 0.2
        ]);
        for (let d = 0; d < 6; d++) {
          const m = d * Math.PI / 3;
          e.mesh(c, "box", f.mortar, [
            0.055,
            u * 0.8,
            0.055
          ], [
            l + Math.sin(m) * h,
            u / 2 + 0.3,
            -r.depth * 0.2 + Math.cos(m) * h
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
var ha = 1e-7;
function yn(e, t, s) {
  return (t[0] - e[0]) * (s[1] - e[1]) - (t[1] - e[1]) * (s[0] - e[0]);
}
function ls(e, t, s, a) {
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const i = e[r], c = e[(r + 1) % e.length], o = yn(t, s, i), l = yn(t, s, c), u = a ? o >= -1e-7 : o <= ha, h = a ? l >= -1e-7 : l <= ha;
    if (u && n.push(i), u !== h && Math.abs(o - l) > ha) {
      const d = o / (o - l);
      n.push([i[0] + (c[0] - i[0]) * d, i[1] + (c[1] - i[1]) * d]);
    }
  }
  return n;
}
function er(e) {
  return Math.abs(e.reduce((t, s, a) => t + s[0] * e[(a + 1) % e.length][1] - s[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function mi(e, t) {
  let s = e;
  const a = [];
  for (let n = 0; n < t.length && s.length >= 3; n++) {
    const r = t[n], i = t[(n + 1) % t.length], c = ls(s, r, i, !1);
    er(c) > ha && a.push(c), s = ls(s, r, i, !0);
  }
  return a;
}
function vi(e, t, s) {
  const a = t[0] - e[0], n = t[1] - e[1], r = s / (2 * Math.hypot(a, n)), i = -n * r, c = a * r;
  return [
    [e[0] + i, e[1] + c],
    [e[0] - i, e[1] - c],
    [t[0] - i, t[1] - c],
    [t[0] + i, t[1] + c]
  ];
}
function tr(e, t) {
  const s = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) s.push(vi(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, r] of a.points.slice(1, -1)) s.push(Array.from({ length: 12 }, (i, c) => {
      const o = c * Math.PI / 6, l = (a.width + t) / 2;
      return [n + Math.cos(o) * l, r + Math.sin(o) * l];
    }));
  }
  return s;
}
function gi(e, t = 0) {
  const s = tr(e, t), a = [];
  for (let n = 0; n < s.length; n++) {
    let r = [s[n]];
    for (let i = 0; i < n && r.length; i++) r = r.flatMap((c) => mi(c, s[i]));
    a.push(...r.filter((i) => er(i) > ha));
  }
  return a;
}
function bi(e, t, s, a) {
  const n = s === "marble", r = s === "street";
  for (const [o, l, u] of [[
    0.4,
    0.025,
    n ? f.brass : r ? f.streetSeam : f.mortar
  ], [
    0,
    0.04,
    n ? f.slate : r ? f.streetStone : f.stone
  ]]) for (const h of gi(t, o)) {
    const d = h.reduce((g, w) => g + w[0], 0) / h.length, m = h.reduce((g, w) => g + w[1], 0) / h.length, v = e.shape(a(d, m), h.map((g) => [g[0], -g[1]]), u, [
      0,
      l,
      0
    ]);
    v.rotation.x = -Math.PI / 2, v.castShadow = !1;
  }
  const i = tr(t, 0.4);
  let c = 0;
  for (const o of t) {
    for (let l = 1; l < o.points.length; l++, c++) {
      const u = o.points[l - 1], h = o.points[l], d = h[0] - u[0], m = h[1] - u[1], v = Math.hypot(d, m);
      for (let g = 1.5; g < v; g += 1.65) {
        const w = u[0] + d * g / v, _ = u[1] + m * g / v;
        if (i.some((k, b) => b !== c && k.every((x, y) => yn(x, k[(y + 1) % k.length], [w, _]) >= -1e-7))) continue;
        const M = e.mesh(a(w, _), "box", n ? f.shadow : r ? f.streetSeam : f.mortar, [
          o.width - 0.08,
          0.012,
          0.025
        ], [
          w,
          0.049,
          _
        ]);
        if (M.rotation.y = Math.atan2(d, m), M.castShadow = !1, r) {
          const k = e.mesh(a(w, _), "box", f.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            w + Math.cos(g) * 0.55,
            0.049,
            _
          ]);
          k.rotation.y = Math.atan2(d, m), k.castShadow = !1;
        }
      }
    }
    c += o.points.length - 2;
  }
}
function yi(e, t) {
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
  ].filter(([u, h, d, m]) => d > u && m > h).map(([u, h, d, m]) => ({
    x: (u + d) / 2,
    z: (h + m) / 2,
    width: d - u,
    depth: m - h
  }));
}
function cs(e, t, s) {
  const a = s[0] - t[0], n = s[1] - t[1], r = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * r, e.y - t[1] - n * r);
}
function wi(e, t, s) {
  const a = [], n = /* @__PURE__ */ new Map(), r = [], i = new Mr(), c = new dt(), o = new $r(), l = [];
  function u(b, x) {
    const y = `${Math.floor(b / 16)}:${Math.floor(x / 16)}`;
    let E = n.get(y);
    return E || (E = e.group(t), n.set(y, E)), E;
  }
  let h = [s.bounds];
  for (const b of s.features.filter((x) => x.kind === "water")) h = h.flatMap((x) => yi(x, b.footprint));
  const d = s.surface === "grass", m = s.surface === "marble", v = s.surface === "street", g = s.surface === "boards", w = g ? f.wood : d ? f.grass : v ? f.street : s.surface === "wet" ? f.wetStone : m ? f.marble : f.stone;
  for (const b of h)
    if (e.mesh(u(b.x, b.z), "box", w, [
      b.width,
      0.6,
      b.depth
    ], [
      b.x,
      -0.32,
      b.z
    ]).castShadow = !1, g) for (let x = b.x - b.width / 2; x < b.x + b.width / 2; x += 1) for (let y = b.z - b.depth / 2; y < b.z + b.depth / 2; y += 4) {
      const E = Math.min(4, b.z + b.depth / 2 - y);
      e.mesh(u(x, y), "box", os[Math.abs(x + y) % os.length], [
        0.985,
        0.018,
        E - 0.025
      ], [
        x + 0.5,
        -9e-3,
        y + E / 2
      ]).castShadow = !1;
    }
    else if (!d && !v) for (let x = b.x - b.width / 2; x < b.x + b.width / 2; x += 4) for (let y = b.z - b.depth / 2; y < b.z + b.depth / 2; y += 4) {
      const E = Math.min(4, b.x + b.width / 2 - x), O = Math.min(4, b.z + b.depth / 2 - y), I = m ? Math.round(x / 4 + y / 4) % 2 ? f.marble : f.marbleLight : w;
      e.mesh(u(x, y), "box", I, [
        E - 0.04,
        0.018,
        O - 0.04
      ], [
        x + E / 2,
        -9e-3,
        y + O / 2
      ]).castShadow = !1;
    }
  if (bi(e, s.roads, s.surface, u), v) for (let b = 0; b < 320; b++) {
    const x = s.bounds.x + Math.sin(b * 127.13) * (s.bounds.width / 2 - 3), y = s.bounds.z + Math.cos(b * 53.71) * (s.bounds.depth / 2 - 3), E = {
      x,
      y
    };
    if (s.features.some((P) => un(E, P.footprint))) continue;
    const O = Math.min(...s.roads.flatMap((P) => P.points.slice(1).map((L, T) => cs(E, P.points[T], L))));
    if (O < 2 || O > 9) continue;
    const I = e.mesh(u(x, y), "box", b % 3 ? f.streetSeam : f.streetStone, [
      0.4 + b % 3 * 0.18,
      0.025,
      0.25
    ], [
      x,
      -2e-3,
      y
    ]);
    I.rotation.y = b * 0.41, I.castShadow = !1;
  }
  if (m) {
    const b = u(0, -17);
    for (const x of [
      4,
      4.4,
      5.5
    ]) e.ring(b, f.brass, x, 0, -17, 1, !1, 0.09);
    for (let x = 0; x < 12; x++) {
      const y = x * Math.PI / 6;
      e.shape(b, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], f.brass, [
        Math.sin(y) * 4.6,
        0.095,
        -17 + Math.cos(y) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, y);
    }
  }
  for (const b of s.suspended ?? []) {
    const x = e.group(t);
    oi(e, x, b), a.push(e.bake(x)), r.push({
      root: x,
      bounds: new Pa().setFromObject(x).expandByScalar(0.1)
    });
  }
  const { bounds: _ } = s;
  for (let b = 0; b < (d ? 420 : 0); b++) {
    const x = _.x + Math.sin(b * 127.13) * (_.width / 2 - 3), y = _.z + Math.cos(b * 53.71) * (_.depth / 2 - 3), E = {
      x,
      y
    };
    if (s.features.some((I) => un(E, {
      ...I.footprint,
      width: I.footprint.width + 1.5,
      depth: I.footprint.depth + 1.5
    })) || s.roads.some((I) => I.points.slice(1).some((P, L) => cs(E, I.points[L], P) < I.width / 2 + 1))) continue;
    const O = u(x, y);
    if (b % 4 === 0) {
      const I = Array.from({ length: 9 }, (L, T) => {
        const B = T * Math.PI * 2 / 9, Q = 1 + Math.sin(T * 7 + b) * 0.3;
        return [Math.cos(B) * Q * (1.2 + b % 3), Math.sin(B) * Q * (0.7 + b % 2)];
      }), P = e.shape(O, I, b % 8 ? f.grassDark : f.grassLight, [
        x,
        5e-3,
        y
      ]);
      P.rotation.x = -Math.PI / 2;
    } else {
      for (let I = 0; I < 3; I++) {
        const P = e.mesh(O, "cone", b % 3 ? f.grassDark : f.leafLight, [
          0.035,
          0.3 + I * 0.09,
          0.035
        ], [
          x + (I - 1) * 0.16,
          0.15,
          y
        ]);
        P.rotation.z = (I - 1) * 0.35;
      }
      b % 11 === 0 && e.mesh(O, "rock", f.light, [
        0.12,
        0.13,
        0.12
      ], [
        x,
        0.38,
        y
      ]);
    }
  }
  for (const b of s.features) {
    const x = b.footprint, y = x.width > x.depth, E = Math.max(x.width, x.depth), O = b.kind === "wall" ? Math.ceil(E / 7) : 1, I = e.group(t);
    I.name = b.id;
    for (let P = 0; P < O; P++) {
      const L = -E / 2 + (P + 0.5) * E / O, T = O === 1 ? x : {
        ...x,
        x: x.x + (y ? L : 0),
        z: x.z + (y ? 0 : L),
        width: y ? E / O : x.width,
        depth: y ? x.depth : E / O
      }, B = O === 1 ? I : e.group(I);
      pi(e, u(T.x, T.z), B, {
        ...b,
        footprint: T
      }, s.vista === "interior") ? (a.push(e.bake(B)), r.push({
        root: B,
        bounds: new Pa().setFromObject(B).expandByScalar(0.35)
      })) : B.removeFromParent();
    }
  }
  for (const b of s.roads.slice(0, 1)) for (let x = 1; x < b.points.length; x++) {
    const [y, E] = b.points[x];
    if (!(s.vista === "camp" && Math.hypot(y, E - 8) < 13))
      for (const O of [-1, 1]) Xs(e, u(y, E), y + O * (b.width / 2 + 0.6), E);
  }
  const M = e.group(t), k = s.vista === "interior" || s.vista === "room";
  if (e.mesh(M, "box", k ? f.undercroft : f.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, s.vista === "camp") for (let b = 0; b < 13; b++) {
    const x = -55 - b % 2 * 6, y = -44 + b * 7, E = 7 + b % 3 * 2;
    e.mesh(M, "box", f.distantWall, [
      10,
      E,
      6.5
    ], [
      x,
      E / 2,
      y
    ]);
    const O = e.mesh(M, "box", f.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      x,
      E,
      y
    ]);
    O.rotation.z = -0.16;
    for (let I = -1; I <= 1; I++) e.mesh(M, "box", b % 4 ? f.shadow : f.ember, [
      0.05,
      0.7,
      0.6
    ], [
      x + 5.03,
      E - 1.7,
      y + I * 1.6
    ], b % 4 === 0);
  }
  for (let b = 0; b < (k ? 0 : 12); b++) {
    const x = (b % 2 ? 1 : -1) * (_.width / 2 + 15 + b % 3 * 8), y = _.z - 25 + b * 7;
    e.mesh(M, "crown", b % 3 ? f.distantGround : f.distantLeaf, [
      17 + b % 4 * 3,
      6 + b % 3 * 2,
      22
    ], [
      x,
      -3,
      y
    ]);
  }
  for (let b = 0; b < (k || s.vista === "garden" ? 0 : 9); b++) {
    const x = (b - 4) * 12, y = _.z - _.depth / 2 - 15 - b % 3 * 6, E = 9 + b % 4 * 3;
    e.mesh(M, "box", f.distantWall, [
      9,
      E,
      9
    ], [
      x,
      E / 2 - 2,
      y
    ]), e.mesh(M, "cone", f.distantRoof, [
      7,
      6,
      7
    ], [
      x,
      E + 1,
      y
    ]);
    for (let O = -1; O <= 1; O++) e.mesh(M, "box", f.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      x + O * 2.2,
      E - 4,
      y + 4.55
    ]);
  }
  if (!k && s.vista !== "garden") {
    const b = _.z - _.depth / 2 - 28;
    e.mesh(M, "cylinder", f.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      b
    ]);
    for (const x of [
      10,
      22,
      33
    ]) e.mesh(M, "cylinder", f.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      x,
      b
    ]);
    for (let x = 0; x < 6; x++) {
      const y = x * Math.PI / 3, E = -17 + Math.sin(y) * 8.8, O = b + Math.cos(y) * 8.8;
      e.mesh(M, "box", f.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        E,
        19,
        O
      ]);
      const I = e.mesh(M, "box", f.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(y) * 9.02,
        26,
        b + Math.cos(y) * 9.02
      ], !0);
      I.rotation.y = y;
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
    update(b, x) {
      i.direction.copy(c.set(Math.sin(x), it.height / it.distance, Math.cos(x)).normalize());
      for (const y of r) {
        l.length = 0;
        for (const E of [0.1, 1.6])
          if (i.origin.set(b.x, E, b.y), o.ray.copy(i), i.intersectsBox(y.bounds) && o.intersectObject(y.root, !0, l), l.length) break;
        y.root.visible = l.length === 0;
      }
    },
    dispose() {
      a.forEach((b) => b()), t.clear();
    }
  };
}
function xi(e, t, s, a, n, r, i = !0) {
  const c = r.has("captives_arrived"), o = e.group(t, [
    a,
    0,
    n
  ]), l = e.group(t), u = s === "sanniang", h = s === "laobai", d = s === "kouzi";
  o.rotation.y = u ? 0.25 : -0.35, i && (d || s === "anian") && (o.position.y = -0.3), o.scale.setScalar(h ? 1.24 : d ? 1.06 : s === "anian" ? 1.19 : 1.12);
  const m = u ? "#343d59" : h ? "#596a80" : d ? "#53617a" : "#79647d", v = "#615047", g = "#dfbaa0", w = h ? 0.39 : d ? 0.25 : 0.29, _ = h ? 0.31 : 0.23, M = [];
  for (const U of [-1, 1]) {
    const Z = e.group(o, [
      U * 0.16,
      0.78,
      U > 0 ? 0.03 : -0.04
    ]);
    Z.rotation.x = i && (d || s === "anian") ? -1.15 : U * 0.06, M.push(Z), e.mesh(Z, "cylinder", "#48545d", [
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
  e.mesh(o, "sphere", m, [
    w,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(o, "cylinder", m, [
    _,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(o, "cylinder", v, [
    _ + 0.015,
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
  const k = e.group(o, [
    0,
    1.93,
    0.025
  ]);
  k.rotation.x = u ? 0.1 : -0.025, e.mesh(k, "sphere", g, [
    0.215,
    0.285,
    0.22
  ]);
  const b = u ? "#272b42" : d ? "#643d41" : s === "anian" ? "#483b40" : "#30343e";
  e.mesh(k, "sphere", b, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const U of [-1, 1])
    e.mesh(k, "sphere", b, [
      0.045,
      0.17,
      0.095
    ], [
      U * 0.2,
      0.02,
      -0.03
    ]), e.mesh(k, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      U * 0.083,
      0.025,
      0.216
    ]), e.mesh(k, "box", b, [
      0.069,
      0.018,
      0.016
    ], [
      U * 0.086,
      0.093,
      0.219
    ]), e.mesh(k, "sphere", g, [
      0.036,
      0.062,
      0.045
    ], [
      U * 0.212,
      -0.025,
      0
    ]);
  e.mesh(k, "sphere", g, [
    0.035,
    0.05,
    0.045
  ], [
    0,
    -0.025,
    0.223
  ]), e.mesh(k, "box", "#b47f70", [
    0.06,
    0.012,
    0.014
  ], [
    0,
    -0.126,
    0.194
  ]);
  for (const U of [-1, 1]) {
    const Z = e.group(o, [
      U * w,
      1.48,
      0
    ]);
    Z.rotation.z = U * 0.11, Z.rotation.x = u ? U > 0 ? -0.85 : -0.2 : U > 0 ? -0.4 : -0.1, e.mesh(Z, "cylinder", m, [
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
    ]), u && U > 0 && (e.mesh(Z, "cylinder", "#b67e3f", [
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
    e.mesh(o, "cylinder", m, [
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
    for (const U of [-1, 1]) {
      const Z = e.mesh(o, "box", "#eee7d3", [
        0.052,
        0.53,
        0.025
      ], [
        U * 0.16,
        1.39,
        0.19
      ]);
      Z.rotation.z = -U * 0.15;
    }
    e.mesh(k, "sphere", b, [
      0.19,
      0.17,
      0.13
    ], [
      0.09,
      -0.03,
      -0.22
    ]), e.mesh(k, "cylinder", "#dfba7a", [
      0.014,
      0.38,
      0.014
    ], [
      0.12,
      0.03,
      -0.26
    ]).rotation.z = 1.2, e.mesh(o, "cone", m, [
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
    ], m, [
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
  } else if (h) {
    e.mesh(o, "sphere", m, [
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
    const U = e.group(o, [
      -0.36,
      1.1,
      0.2
    ]);
    U.rotation.z = -0.18, e.mesh(U, "box", "#7a624b", [
      0.32,
      0.42,
      0.075
    ]), e.mesh(U, "box", "#e4dfcd", [
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
  } else if (d) {
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
      const U = e.mesh(l, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        a,
        0.72,
        n
      ]);
      U.rotation.z = Math.PI / 2;
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
    e.mesh(o, "cone", m, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(k, "sphere", b, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let Z = 0; Z < 3; Z++) {
      const Y = e.mesh(o, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + Z * 0.02,
        1.02,
        0.31 + Z * 0.023
      ]);
      Y.rotation.z = Z * 0.1;
    }
    const U = e.mesh(o, "box", "#d8ba87", [
      0.075,
      0.83,
      0.04
    ], [
      0,
      1.25,
      0.22
    ]);
    U.rotation.z = -0.55, e.mesh(o, "box", v, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const x = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  k.removeFromParent(), M.forEach((U) => U.removeFromParent());
  const y = M.map((U) => e.bake(U)), E = e.bake(o), O = e.bake(k), I = e.bake(l);
  o.add(k, ...M);
  const P = o.position.y, L = o.rotation.y, T = {
    x: a,
    y: n
  };
  let B = -1 / 0, Q = 0;
  return {
    root: o,
    ring: x,
    id: s,
    position: T,
    seated: i,
    locate(U, Z) {
      const Y = T.x !== U.position.x || T.y !== U.position.y;
      return Y && (B = Z), Q = U.facing, T.x = U.position.x, T.y = U.position.y, o.position.x = T.x, o.position.z = T.y, x.position.x = T.x, x.position.z = T.y, Y;
    },
    update(U, Z, Y) {
      const oe = Z - B < 120, Ze = Math.hypot(U.x - T.x, U.y - T.y) < 10;
      x.visible = Ze;
      const Re = oe ? Math.PI / 2 - Q : Ze ? Math.atan2(U.x - T.x, U.y - T.y) : L, Me = Math.atan2(Math.sin(Re - o.rotation.y), Math.cos(Re - o.rotation.y));
      o.rotation.y += Y ? Me : Me * 0.16, o.position.y = P + (Y ? 0 : Math.sin(Z * 15e-4 + a) * 0.012), k.rotation.y = Y ? 0 : Math.sin(Z * 8e-4 + n) * 0.04, i || M.forEach((ce, xe) => {
        ce.rotation.x = Y || !oe ? 0 : Math.sin(Z * 0.012 + xe * Math.PI) * 0.45;
      });
    },
    dispose() {
      E(), O(), I(), y.forEach((U) => U()), o.removeFromParent(), l.removeFromParent(), x.removeFromParent();
    }
  };
}
function Mi(e, t, s, a) {
  const n = e.group(t), r = Xt[s.id], i = Object.values(He).find((h) => h.scene === s.id);
  let c = a, o = !1;
  const l = (r?.waves[0] ?? []).map((h) => {
    const d = Ln(e, n, h.kind, Ha[0]);
    d.bar.removeFromParent();
    const m = s.anchors[h.anchor], v = i?.sentryExits[h.anchor], g = v ? s.anchors[v] : m, w = a.has(r.complete) ? g : m;
    return d.root.position.set(w.x, 0, w.y), {
      ...d,
      home: m,
      aside: g,
      dispose: e.bake(d.root)
    };
  }), u = () => {
    n.visible = !o && !!r && (!!i || !c.has(r.complete));
  };
  return u(), {
    setFacts(h) {
      c = h, u();
    },
    setEncounterActive(h) {
      o = h, u();
    },
    animate(h) {
      if (!n.visible) return !1;
      let d = !1;
      for (const m of l) {
        const v = c.has(r.complete) ? m.aside : m.home, g = v.x - m.root.position.x, w = v.y - m.root.position.z, _ = Math.hypot(g, w);
        if (_ < 1e-3) continue;
        const M = h ? 1 : Math.min(1, 0.36 / _);
        m.root.position.x += g * M, m.root.position.z += w * M, m.root.rotation.y = _ > 0.4 ? Math.atan2(g, w) : 0, d = !0;
      }
      return d;
    },
    dispose() {
      l.forEach((h) => h.dispose()), n.removeFromParent();
    }
  };
}
function _i(e, t, s, a) {
  const n = He[s], r = Ln(e, t, n.kind, Ha[0]);
  r.bar.removeFromParent();
  const i = e.bake(r.root), c = { ...Ta(s, a) };
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
      const h = Ta(s, o), d = l.x - h.x, m = l.y - h.y, v = Math.hypot(d, m), g = v <= n.approachRadius, w = g && !o.has(n.complete) ? 1 : 0, _ = h.x + (v ? d / v * w : 0), M = h.y + (v ? m / v * w : 0), k = c.x + c.y + r.root.rotation.y;
      c.x += u ? _ - c.x : (_ - c.x) * 0.22, c.y += u ? M - c.y : (M - c.y) * 0.22, Math.abs(_ - c.x) + Math.abs(M - c.y) < 0.01 && (c.x = _, c.y = M);
      const b = g ? Math.atan2(d, m) : 0, x = Math.atan2(Math.sin(b - r.root.rotation.y), Math.cos(b - r.root.rotation.y));
      return r.root.rotation.y += u || Math.abs(x) < 5e-3 ? x : x * 0.2, r.root.position.set(c.x, 0, c.y), k !== c.x + c.y + r.root.rotation.y;
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
}), ar = {
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
}, ki = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, Si = 0.85;
function us(e, t) {
  const s = e.route;
  if (s.length === 1) return {
    position: s[0].position,
    facing: s[0].facing,
    walking: !1
  };
  const a = s.map((r, i) => {
    const c = s[(i + 1) % s.length].position;
    return r.wait + Math.hypot(c.x - r.position.x, c.y - r.position.y) / Si;
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
function Ri(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function Ci(e, t) {
  e.updateWorldMatrix(!0, !0);
  const s = e.matrixWorld.clone().invert(), a = new xs(), n = [];
  e.traverse((c) => {
    if (!(c instanceof bt)) return;
    const o = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(a.multiplyMatrices(s, c.matrixWorld)), l = c.material.color, u = new zr(new Float32Array(o.getAttribute("position").count * 3), 3);
    for (let h = 0; h < u.count; h++) u.setXYZ(h, l.r, l.g, l.b);
    o.setAttribute("color", u), n.push(o);
  });
  const r = Rs(n);
  if (n.forEach((c) => c.dispose()), !r) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new bt(r, t);
  return i.receiveShadow = !0, e.add(i), () => {
    r.dispose(), e.clear();
  };
}
function $i(e, t, s, a) {
  const n = e.group(t), r = e.group(n), i = [], c = [], o = {
    blue: f.slate,
    rose: f.rose,
    cream: f.cloth
  }[s.coat], l = s.activity === "mend" || s.activity === "warm", u = "#dfbda7", h = l ? 0.75 : 1.05;
  e.mesh(r, "box", o, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    h,
    0
  ]), e.mesh(r, "crown", u, [
    0.23,
    0.27,
    0.21
  ], [
    0,
    h + 0.61,
    0
  ]), e.mesh(r, "crown", f.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    h + 0.77,
    -0.02
  ]), e.mesh(r, "box", f.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    h - 0.23,
    0
  ]), e.mesh(r, "box", f.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    h + 0.12,
    0.21
  ]);
  for (const m of [-1, 1]) {
    const v = e.group(n, [
      m * 0.36,
      h + 0.22,
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
      m * 0.16,
      h - 0.31,
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
  ]), s.activity === "water") for (const m of [-1, 1]) e.mesh(i[m > 0 ? 1 : 0], "box", f.wood, [
    0.36,
    0.39,
    0.36
  ], [
    m * 0.13,
    -0.65,
    0
  ]);
  else s.activity === "deliver" ? (e.mesh(r, "box", f.wood, [
    0.65,
    0.47,
    0.5
  ], [
    0,
    h - 0.05,
    0.45
  ]), e.mesh(r, "box", f.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    h - 0.05,
    0.72
  ])) : s.activity === "mend" || s.activity === "dressings" ? e.mesh(r, "box", f.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    h - 0.22,
    0.36
  ]) : s.activity === "warm" && e.mesh(r, "box", f.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    h + 0.1,
    0.38
  ]);
  n.traverse((m) => {
    m.castShadow = !1;
  });
  const d = [
    r,
    ...i,
    ...c
  ].map((m) => Ci(m, a));
  return {
    root: n,
    body: r,
    arms: i,
    legs: c,
    dispose() {
      d.forEach((m) => m()), n.removeFromParent();
    }
  };
}
function zi(e, t, s) {
  const a = new Ms({
    vertexColors: !0,
    roughness: 0.95
  }), n = (ar[s] ?? []).map((c) => ({
    spec: c,
    model: $i(e, t, c, a),
    time: 0
  }));
  let r = null, i = null;
  return {
    animate(c, o, l, u) {
      const h = l ? 0 : Ri(r, o);
      r = o;
      let d = n.length > 0 && i !== l;
      i = l;
      for (const m of n) {
        const { spec: v, model: g } = m, w = us(v, m.time), _ = Math.hypot(w.position.x - c.x, w.position.y - c.y) < 27 && u(w.position);
        if (g.root.visible !== _ && (g.root.visible = _, d = !0), !_) continue;
        m.time += h;
        const M = us(v, m.time), k = l ? 0 : Math.sin(m.time * (M.walking ? 5.5 : 1.5) + v.phase);
        g.root.position.set(M.position.x, 0, M.position.y), g.root.rotation.y = M.facing, g.body.position.y = M.walking ? Math.abs(k) * 0.035 : 0, g.legs.forEach((b, x) => {
          b.rotation.x = M.walking ? k * 0.35 * (x ? 1 : -1) : 0;
        }), g.arms.forEach((b, x) => {
          b.rotation.x = M.walking ? k * 0.24 * (x ? -1 : 1) : -0.6 + k * 0.13 * (x ? 1 : -1), v.activity === "deliver" && (b.rotation.x = -0.75), v.activity === "warm" && (b.rotation.x = -1.1), v.activity === "cook" && !x && (b.rotation.x = -0.8 + k * 0.3);
        }), d = h > 0 || d;
      }
      return d;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function Pi(e, t, s, a) {
  const n = wi(e, t, s.landscape), r = e.group(t), i = e.group(t), c = Mi(e, t, s, a), o = zi(e, i, s.id), l = [], u = Wa.filter((g) => He[g].scene === s.id).map((g) => _i(e, i, g, a));
  let h = -1, d = null, m = null;
  function v(g) {
    const w = [...g].sort().join("/");
    if (w === m) return;
    m = w, u.forEach((M) => M.setFacts(g)), d?.(), c.setFacts(g);
    for (const M of Na(s, g)) {
      const k = M.position;
      if (M.kind === "exit") {
        if (!M.target.doorway) for (const b of [-1, 1]) Xs(e, r, k.x + b * 1.7, k.y, 1.5);
        e.mesh(r, "box", f.brass, [
          3,
          0.025,
          0.35
        ], [
          k.x,
          0.12,
          k.y
        ]).castShadow = !1;
      } else if (M.target.kind === "inspect" && M.target.passage === "warning")
        e.mesh(r, "box", f.timber, [
          0.12,
          1.8,
          0.12
        ], [
          k.x,
          0.9,
          k.y
        ]), e.mesh(r, "box", f.wood, [
          1.4,
          0.7,
          0.13
        ], [
          k.x,
          1.6,
          k.y
        ]), e.mesh(r, "box", f.light, [
          0.7,
          0.4,
          0.025
        ], [
          k.x,
          1.6,
          k.y + 0.08
        ]);
      else if (M.target.kind === "inspect" && M.target.passage === "orders") {
        e.mesh(r, "box", f.slate, [
          2.2,
          0.8,
          1.2
        ], [
          k.x,
          0.4,
          k.y - 0.8
        ]);
        const b = e.mesh(r, "box", f.light, [
          1.8,
          0.08,
          0.9
        ], [
          k.x,
          0.85,
          k.y - 0.8
        ]);
        b.rotation.x = 0.2;
        for (let x = -1; x <= 1; x++) e.mesh(r, "cylinder", f.brass, [
          0.12,
          0.12,
          0.12
        ], [
          k.x + x * 0.45,
          0.95,
          k.y - 0.55
        ]);
      }
    }
    if (s.id === "camp") {
      const M = s.landscape.features.find((k) => k.kind === "clinic").footprint;
      if (g.has("clinic_helped")) {
        const k = s.landscape.features.find((b) => b.kind === "bench").footprint;
        for (const b of [-1, 1])
          e.mesh(r, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            k.x,
            0.91,
            k.z + b * 0.65
          ]), e.mesh(r, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            k.x,
            1.024,
            k.z + b * 0.65
          ]);
      }
      if (g.has("receiving_arranged")) for (const k of [-1, 1]) {
        const b = M.x + k * 2.4, x = M.z + M.depth / 2 - 0.2, y = e.group(r, [
          b,
          0.2,
          x
        ]);
        y.rotation.x = -0.16;
        for (const E of [-1, 1]) e.mesh(y, "cylinder", f.timber, [
          0.055,
          2.9,
          0.055
        ], [
          E * 0.42,
          1.4,
          0
        ]);
        e.mesh(y, "box", g.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const E of [0.7, 2.1]) e.mesh(y, "box", f.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          E,
          0.12
        ]);
      }
      if (g.has("warden_defeated")) {
        const k = s.landscape.features.find((b) => b.kind === "wagon").footprint;
        for (let b = 0; b < 4; b++) {
          const x = e.group(r, [
            k.x + (b % 2 ? 0.65 : -0.65),
            1.4,
            k.z + (b < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(x, "box", f.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const y of [-1, 1]) e.mesh(x, "box", f.brass, [
            0.08,
            0.78,
            1.22
          ], [
            y * 0.35,
            0.38,
            0
          ]);
          e.mesh(x, "box", f.light, [
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
      const k = s.anchors[M.anchor], b = g.has(M.fact), x = e.group(r, [
        k.x,
        0,
        k.y
      ]);
      e.mesh(x, "box", f.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(x, "box", f.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const y = e.group(x, [
        0,
        0.75,
        0
      ]);
      y.rotation.z = b ? 0.65 : -0.65, e.mesh(y, "cylinder", f.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(y, "cylinder", f.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const _ = It(s, g);
    for (const M of s.landscape.gates) {
      const k = M.footprint, b = k.width > k.depth, x = Math.max(k.width, k.depth), y = e.group(r, [
        k.x,
        0,
        k.z
      ]);
      b || (y.rotation.y = Math.PI / 2);
      for (const E of [-1, 1]) e.mesh(y, "box", f.stone, [
        0.35,
        3.2,
        0.7
      ], [
        E * x / 2,
        1.6,
        0
      ]);
      if (e.mesh(y, "box", f.light, [
        x + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), _.closedGates.has(M.id)) {
        for (let E = -x / 2 + 0.2; E < x / 2; E += 0.4) e.mesh(y, "box", f.shadow, [
          0.065,
          3,
          0.1
        ], [
          E,
          1.5,
          0
        ]);
        for (const E of [0.4, 2.5]) e.mesh(y, "box", f.brass, [
          x,
          0.12,
          0.15
        ], [
          0,
          E,
          0
        ]);
      } else e.mesh(y, "box", f.shadow, [
        x,
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
      const k = M.footprint, b = e.mesh(r, "cylinder", f.timber, [
        0.045,
        4.8,
        0.045
      ], [
        k.x + 3.3,
        2.7,
        k.z + 2.5
      ]);
      b.rotation.z = -0.32;
      for (let x = 0; x < 5; x++) e.mesh(r, "rock", x % 2 ? f.ember : f.cloth, [
        0.55,
        1.2 + x % 3 * 0.3,
        0.55
      ], [
        k.x + Math.sin(x * 2) * 0.7,
        5.4 + x % 3 * 0.3,
        k.z + Math.cos(x * 2) * 0.7
      ], !0);
    }
    d = e.bake(r);
  }
  return v(a), {
    setFacts: v,
    people: l,
    parleyPeople: u,
    setPeople(g, w) {
      let _ = !1;
      for (const M of ht) {
        const k = g[M], b = Fa[M].station, x = _e[b.scene].anchors[b.anchor], y = k.mode === "idle" && (k.scene === "cells" || k.scene === b.scene && Math.hypot(k.position.x - x.x, k.position.y - x.y) < 1);
        let E = l.find((O) => O.id === M);
        E && (k.scene !== s.id || E.seated !== y) && (E.dispose(), l.splice(l.indexOf(E), 1), E = void 0, _ = !0), k.scene === s.id && (E || (E = xi(e, i, M, k.position.x, k.position.y, new Set(m?.split("/")), y), l.push(E), _ = !0), _ = E.locate(k, w) || _);
      }
      return _;
    },
    setEncounterActive(g) {
      c.setEncounterActive(g), u.forEach((w) => {
        w.root.visible = !g;
      });
    },
    update: n.update,
    animate(g, w, _, M) {
      const k = Math.floor(w / 80);
      if (k === h) return !1;
      h = k;
      let b = c.animate(_);
      b = o.animate(g, w, _, M) || b;
      for (const x of u) b = x.update(g, _) || b;
      for (const x of l) Math.hypot(x.position.x - g.x, x.position.y - g.y) < 22 ? (x.update(g, w, _), b = !_ || b) : x.ring.visible = !1;
      return b;
    },
    dispose() {
      o.dispose(), l.splice(0).forEach((g) => g.dispose()), u.forEach((g) => g.dispose()), i.removeFromParent(), d?.(), c.dispose(), n.dispose();
    }
  };
}
var Ii = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, Ei = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Ai = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, Li = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Ti(e, t) {
  const s = new br(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  let i = 0, c = !1;
  function o(l, u) {
    i++;
    const h = s.load(l, (d) => {
      if (c) {
        d.dispose();
        return;
      }
      i--, r.delete(l);
      for (const m of u) a.set(m, d);
      e(), t(r.size, i);
    }, void 0, () => {
      c || (i--, n.delete(h), h.dispose(), r.set(l, u), t(r.size, i));
    });
    h.colorSpace = Rn, h.wrapS = h.wrapT = Pr, h.anisotropy = 2, n.add(h);
  }
  for (const [l, u] of [
    [Ii, [
      f.stone,
      f.wetStone,
      f.marble,
      f.marbleLight
    ]],
    [Ei, [f.light]],
    [Ai, [f.roof, f.roofLight]],
    [Li, [
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
function Oi(e, t, s) {
  const a = new _s({
    antialias: !0,
    alpha: !1,
    powerPreference: s.world ? "default" : "high-performance"
  });
  a.outputColorSpace = Rn, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, s.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const r = new ws(), i = new ks(-10, 10, 10, -10, 0.1, 180), c = bn();
  r.add(new Ss("#effbff", "#74918a", 2));
  const o = new on("#fff4e5", 1.9);
  o.position.set(-12, 25, 13), o.castShadow = !0;
  const l = s.world ? 1024 : 1536;
  o.shadow.mapSize.set(l, l), Object.assign(o.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), o.shadow.bias = -4e-4, o.shadow.normalBias = 0.035, o.shadow.radius = 3, r.add(o);
  const u = new on("#c3edff", 1.1);
  u.position.set(7, 8, -15), r.add(u);
  const h = new la(), d = new la(), m = new la();
  r.add(h, d, m);
  const v = Ks(c, d, s.traveler.gender), g = ei(c, m), w = Ko(c, m), _ = ti(n), M = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), b = [], x = matchMedia("(prefers-reduced-motion: reduce)"), y = new dt(), E = new dt();
  let O = null, I = "", P = "", L = "", T = null, B = null, Q = null, U = NaN, Z = NaN, Y = NaN, oe = null, Ze = 0, Re = 0, Me = 1, ce = 1, xe = !0, ft = !1, Et = !1, Ye = 0, Qe = -1, st = 0, Ce = !1;
  const he = s.world ? Ti(() => {
    I = "", xe = !0, s.invalidate?.();
  }, (ye, Xe) => s.artworkStatus?.(ye, Xe)) : null;
  function Ke() {
    const ye = e.getBoundingClientRect();
    Me = Math.max(1, ye.width), ce = Math.max(1, ye.height), a.setSize(Me, ce, !1), xe = !0, Ce = !1, s.invalidate?.();
  }
  const Ue = new ResizeObserver(Ke);
  Ue.observe(e), Ke();
  function ga(ye) {
    ye.preventDefault(), Et = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", ga);
  function Jt(ye, Xe, Je, rt, et = !1) {
    if (Math.abs(ye) < 1) return;
    const q = document.createElement("span");
    q.className = et ? "exp-damage is-player" : ye < 0 ? "exp-damage is-heal" : "exp-damage", q.textContent = `${ye < 0 ? "+" : ""}${Math.ceil(Math.abs(ye))}`, n.append(q), b.push({
      element: q,
      position: new dt(Xe, 2, Je),
      born: rt
    });
  }
  function ea() {
    for (const ye of M.values())
      d.remove(ye.actor.root), ye.marker.remove();
    M.clear(), b.splice(0).forEach((ye) => ye.element.remove());
  }
  function Ga(ye) {
    return Ce ? (E.set(ye.x, 1, ye.y).project(i), Math.abs(E.x) < 1.15 && Math.abs(E.y) < 1.15) : !0;
  }
  return {
    draw(ye, Xe, Je, rt = "battle", et = 0, q) {
      if (ft || Et) return;
      const ta = performance.now(), K = rt === "battle" ? ye : null, ba = K?.tick ?? (x.matches ? 0 : et * 0.025), At = (K?.tick ?? -1) !== Qe, aa = `${Xe.weapon}/${Xe.outfit}/${Je}`;
      if (!q && !xe && rt === P && aa === L && K === T && (!At && K || !K && (rt === "between" || x.matches || et - Ye < 40))) return;
      Ye = et;
      const pt = Ha[Je], ya = q ? q.definition.id : `${Je}:${K?.boss ?? !1}:${!!K}`;
      if (ya !== I) {
        if (v.resetMotion(), k.forEach((J) => J.remove()), k.clear(), O?.(), q) {
          const J = bn(he?.maps);
          B = Pi(J, h, q.definition, q.facts);
          const ae = B;
          O = () => {
            ae.dispose(), J.dispose();
          };
        } else
          B = null, O = Ho(c, h, Je, K);
        Ce = !1, I = ya, r.background = new Sn(pt.sky), r.fog = new yr(pt.haze, 42, 95);
      } else q && oe !== q.facts && B?.setFacts(q.facts);
      (!!K != !!T || K && T && K.tick < Qe) && (v.resetMotion(), ea(), st = K?.player.hp ?? 0);
      const Lt = !q && rt !== "battle", Se = Me < 600, wa = Se || ce < 400, Oe = Me / ce, na = q?.definition.landscape.vista === "room", Bt = na ? Se ? 20 : Math.max(30, Oe * (ce < 400 ? 19 : 25)) : q ? (Se ? it.mobileWidth : Math.max(it.minimumWidth, Oe * (ce < 400 ? it.shortSpan : it.tallSpan))) * (q.definition.safe && !K ? it.settlementScale : 1) : Lt ? Se ? 13 : 28 : Se ? 18.5 : Math.max(27, Oe * (ce < 400 ? 14 : 23)), xa = Math.max(0, X.arena - Bt / 2 + 0.5), sa = q ? q.location.position.x * (na ? 0.4 : 1) : K ? wa ? K.player.x * 0.62 : Math.max(-xa, Math.min(xa, K.player.x * 0.62)) : Se ? 0 : 5.5, ra = q ? na ? q.location.position.y * 0.4 - 1 : q.location.position.y - it.lead : K ? K.player.y * (wa ? 0.62 : 0.2) - 0.4 : Se ? -4.2 : -11.8;
      q && Math.hypot(U - q.location.position.x, Z - q.location.position.y) > 8 && (Ce = !1);
      const Ya = Math.abs(y.x - sa) + Math.abs(y.z - ra) < 0.015, Qa = q && B?.setPeople(q.people, et), W = q && B?.animate(q.location.position, et, x.matches, Ga);
      if (q && !xe && Ce && Ya && aa === L && K === T && !At && U === q.location.position.x && Z === q.location.position.y && Y === q.location.facing && oe === q.facts && !W && !Qa && !v.animating) return;
      !Ce || x.matches ? (y.set(sa, 0, ra), Ce = !0) : (y.x += (sa - y.x) * 0.14, y.z += (ra - y.z) * 0.14), i.left = -Bt / 2, i.right = Bt / 2, i.top = Bt / Oe / 2, i.bottom = -i.top;
      const D = Lt ? 0 : 1 * Math.PI / 4, j = q ? it.distance : 25;
      i.position.set(y.x + Math.sin(D) * j, q ? it.height : 28, y.z + Math.cos(D) * j), i.lookAt(y.x, 0, y.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), q && (B?.setEncounterActive(!!K), B?.update(q.location.position, D)), k.forEach((J) => {
        J.hidden = !0;
      });
      const Ne = new Set(q && !K ? [...Pn(q.definition, q.location.position, q.facts, q.people), ...qa(q.definition.id, q.location.position, q.facts)].map((J) => J.target.id) : []);
      for (const J of [...B?.people ?? [], ...B?.parleyPeople ?? []]) {
        if (K || !q || Math.hypot(J.position.x - q.location.position.x, J.position.y - q.location.position.y) > 10) continue;
        let ae = k.get(J.id);
        ae || (ae = document.createElement("span"), ae.className = "exp-person-name", ae.textContent = Ve(J.id), n.append(ae), k.set(J.id, ae)), ae.textContent = Ne.has(J.id) ? `${Ve(J.id)} · ${se.actions.talk}` : Ve(J.id), E.set(J.position.x, 2.9 + J.root.position.y, J.position.y).project(i);
        const De = (E.x * 0.5 + 0.5) * Me, mt = (-E.y * 0.5 + 0.5) * ce;
        ae.hidden = De < 30 || De > Me - 30 || mt < 20 || mt > ce - 20, ae.style.transform = `translate(${De}px,${mt}px) translate(-50%,-100%)`;
      }
      s.world && (o.position.set(y.x - 12, 25, y.z + 13), o.target.position.set(y.x, 0, y.z), o.target.updateMatrixWorld());
      const oa = q ? {
        ...q.location.position,
        facing: q.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      v.update(K?.player ?? oa, Xe.weapon, Xe.outfit, ba, et / 1e3, x.matches, Lt, !!K?.effects.some((J) => J.kind === "resonance"));
      for (const J of K?.enemies ?? []) {
        let ae = M.get(J.id);
        if (!ae) {
          const Ja = document.createElement("i");
          Ja.className = ke(J.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Ja), ae = {
            actor: Ln(c, d, J.kind, pt),
            hp: J.hp,
            death: null,
            marker: Ja
          }, M.set(J.id, ae);
        }
        ae.hp > J.hp && At && Jt(ae.hp - J.hp, J.x, J.y, K.tick), ae.hp = J.hp, ae.actor.update(J, K.tick, x.matches), ae.actor.bar.quaternion.copy(i.quaternion), E.set(J.x, 1.2, J.y).project(i);
        const De = (E.x * 0.5 + 0.5) * Me, mt = (-E.y * 0.5 + 0.5) * ce, On = Math.min(18, Me / 2), jn = Math.min(Se ? 132 : 95, ce * 0.3), ir = Math.max(jn, ce - Math.min(130, ce * 0.3)), Ka = Math.max(On, Math.min(Me - On, De)), Xa = Math.max(jn, Math.min(ir, mt));
        ae.marker.hidden = Math.abs(De - Ka) + Math.abs(mt - Xa) < 10, ae.marker.style.transform = `translate(${Ka}px,${Xa}px) rotate(${Math.atan2(mt - Xa, De - Ka) + Math.PI / 2}rad)`;
      }
      for (const [J, ae] of M) {
        if (K?.enemies.some((mt) => mt.id === J)) continue;
        ae.death === null && (ae.death = K?.tick ?? 0, K && ae.hp > 0 && Jt(ae.hp, ae.actor.root.position.x, ae.actor.root.position.z, K.tick));
        const De = ((K?.tick ?? 0) - ae.death) / 12;
        ae.actor.bar.visible = !1, ae.marker.hidden = !0, ae.actor.root.scale.setScalar(Math.max(0, 1 - De)), (De >= 1 || !K || x.matches) && (d.remove(ae.actor.root), ae.marker.remove(), M.delete(J));
      }
      K && At && (st !== K.player.hp && Jt(st - K.player.hp, K.player.x, K.player.y, K.tick, st > K.player.hp), st = K.player.hp), g.update(K, x.matches);
      const Wt = K?.effects.filter((J) => J.kind === "ward-hit").at(-1);
      w.update(K?.player ?? null, Wt ? Math.max(0, (Wt.life - 5) / 10) : 0), _.update(K, i, Me, ce);
      for (let J = b.length - 1; J >= 0; J--) {
        const ae = b[J], De = ((K?.tick ?? 0) - ae.born) / 27;
        if (De >= 1 || !K) {
          ae.element.remove(), b.splice(J, 1);
          continue;
        }
        E.copy(ae.position), E.y += x.matches ? 0 : De * 0.9, E.project(i), ae.element.style.transform = `translate(${(E.x * 0.5 + 0.5) * Me}px,${(-E.y * 0.5 + 0.5) * ce}px)`, ae.element.style.opacity = String(Math.min(1, (1 - De) * 3));
      }
      a.render(r, i), Ze++, Re += performance.now() - ta, q && Q !== q.definition.id && (Q = q.definition.id, s.sceneReady?.(Q)), xe = !1, P = rt, L = aa, T = K, Qe = K?.tick ?? -1, q && (U = q.location.position.x, Z = q.location.position.y, Y = q.location.facing, oe = q.facts);
    },
    invalidate() {
      xe = !0, s.invalidate?.();
    },
    retryArtwork() {
      he?.retry();
    },
    stats() {
      return {
        draws: Ze,
        submitMs: Re,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      ft = !0, Ue.disconnect(), a.domElement.removeEventListener("webglcontextlost", ga), ea(), v.dispose(), _.dispose(), w.dispose(), O?.(), he?.dispose(), o.shadow.dispose(), c.dispose(), r.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function wn(e) {
  if (e.kind === "exit") return `${se.actions.travel} ${se.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${se.actions.talk} · ${se.people[t.person]}`;
    case "enemy":
      return `${se.actions.talk} · ${Ve(t.enemy)}`;
    case "inspect":
      return se.passages[t.passage].title;
    case "rest":
      return se.actions.rest;
    case "switch":
      return se.switches[t.fact];
  }
}
var ji = ["aria-label"], Zi = { class: "journey-heading" }, Ui = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, Ni = ["disabled"], Di = {
  key: 1,
  class: "journey-controls"
}, Fi = ["aria-label"], Bi = {
  key: 0,
  class: "journey-interaction"
}, Wi = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, qi = {
  key: 0,
  class: "journey-resource"
}, Hi = [
  "max",
  "value",
  "aria-label"
], Vi = ["disabled"], Gi = ["disabled"], Yi = {
  key: 2,
  class: "journey-overlay"
}, Qi = /* @__PURE__ */ Te({
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
    const a = e, n = s, r = F(null), i = F(null), c = F({
      x: 0,
      y: 0
    }), o = F(null), l = F({
      failed: 0,
      pending: 0
    }), u = V(() => a.battle ? [] : [
      ...qa(a.world.definition.id, a.world.location.position, a.world.facts),
      ...yo(a.world.definition, a.world.location, a.world.facts),
      ...Pn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), h = V(() => u.value.find((Z) => Z.target.id === o.value) ?? null), d = V(() => a.weapon === "grimoire" ? ne.contractPower : ne.resource);
    let m = null, v = null, g = 0, w = 0, _ = 0, M = !1, k = !0;
    const b = qo((Z, Y) => {
      c.value = {
        x: Z * 26,
        y: Y * 26
      }, v?.stick(Z, Y);
    }, () => r.value?.focus({ preventScroll: !0 }));
    function x() {
      b.clear(), v?.clear(), _ = 0;
    }
    function y() {
      x(), n("pause");
    }
    function E() {
      m?.retryArtwork();
    }
    function O() {
      document.hidden ? (cancelAnimationFrame(g), g = 0, y()) : (m?.invalidate(), I());
    }
    function I() {
      !g && !M && k && (w = 0, g = requestAnimationFrame(U));
    }
    function P() {
      !a.paused && h.value && (x(), n("interact", h.value.target.id));
    }
    function L(Z) {
      (!Z || Z.detail === 0) && v?.dash();
    }
    function T(Z) {
      (!Z || Z.detail === 0) && v?.skill();
    }
    function B(Z, Y) {
      Z.button === 0 && v?.[Y]();
    }
    function Q() {
      const Z = u.value.findIndex((Y) => Y.target.id === o.value);
      o.value = u.value[(Z + 1) % u.value.length]?.target.id ?? null;
    }
    function U(Z) {
      if (g = 0, M || !k) return;
      !a.paused && !document.hidden && (g = requestAnimationFrame(U));
      const Y = w ? Math.min(100, Z - w) : 0;
      if (w = Z, !a.paused && !document.hidden)
        for (_ += Y; _ >= 1e3 / X.hz && !a.paused; ) {
          _ -= 1e3 / X.hz;
          const oe = v.frame();
          if (oe.skill && !a.battle) {
            P();
            break;
          }
          n("input", oe);
        }
      else _ = 0;
      if (!document.hidden) try {
        m?.draw(a.battle ?? null, a, 0, "battle", Z, a.world);
      } catch (oe) {
        cancelAnimationFrame(g), g = 0, x(), n("error", oe);
      }
    }
    return pe(u, (Z) => {
      Z.some((Y) => Y.target.id === o.value) || (o.value = Z[0]?.target.id ?? null);
    }, { immediate: !0 }), pe(() => a.world.definition.id, () => {
      x(), o.value = u.value[0]?.target.id ?? null, r.value?.focus({ preventScroll: !0 });
    }), pe(() => a.paused, (Z) => {
      x(), I(), Z || r.value?.focus({ preventScroll: !0 });
    }), pe(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.weapon,
      a.outfit
    ], I), Ft(() => {
      try {
        m = Oi(i.value, () => {
          y(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: I,
          sceneReady: (Z) => n("ready", Z),
          artworkStatus: (Z, Y) => {
            l.value = {
              failed: Z,
              pending: Y
            };
          }
        });
      } catch (Z) {
        n("error", Z);
        return;
      }
      v = Wo(r.value, y, () => {
      }), document.addEventListener("visibilitychange", O), I(), r.value?.focus({ preventScroll: !0 });
    }), ja(() => {
      k = !1, cancelAnimationFrame(g), g = 0, y();
    }), _n(() => {
      k = !0, I();
    }), Pt(() => {
      M = !0, cancelAnimationFrame(g), x(), v?.dispose(), document.removeEventListener("visibilitychange", O), m?.dispose();
    }), t({
      stats: () => m?.stats(),
      focus: () => r.value?.focus({ preventScroll: !0 })
    }), (Z, Y) => ($(), z("section", {
      ref_key: "root",
      ref: r,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? p(ne).controls : p(se).actions.controls
    }, [
      S("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      S("header", Zi, [S("h1", null, R(p(se).scenes[e.world.definition.id]), 1), Nn(Z.$slots, "status", {}, void 0, !0)]),
      l.value.failed ? ($(), z("div", Ui, [S("span", null, R(p(se).artwork.unavailable), 1), S("button", {
        type: "button",
        disabled: l.value.pending > 0,
        onClick: E
      }, R(l.value.pending ? p(se).artwork.loading : p(se).artwork.retry), 9, Ni)])) : G("", !0),
      e.paused ? G("", !0) : ($(), z("div", Di, [
        S("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": p(se).actions.move,
          onPointerdown: Y[0] || (Y[0] = gt((...oe) => p(b).down && p(b).down(...oe), ["prevent"])),
          onPointermove: Y[1] || (Y[1] = gt((...oe) => p(b).move && p(b).move(...oe), ["prevent"])),
          onPointerup: Y[2] || (Y[2] = (...oe) => p(b).release && p(b).release(...oe)),
          onPointercancel: Y[3] || (Y[3] = (...oe) => p(b).release && p(b).release(...oe)),
          onLostpointercapture: Y[4] || (Y[4] = (...oe) => p(b).release && p(b).release(...oe)),
          onContextmenu: Y[5] || (Y[5] = gt(() => {
          }, ["prevent"]))
        }, [S("span", { style: Qt({ transform: `translate(${c.value.x}px, ${c.value.y}px)` }) }, null, 4)], 40, Fi),
        h.value ? ($(), z("div", Bi, [S("button", {
          type: "button",
          class: "journey-act",
          onClick: P
        }, [Y[9] || (Y[9] = S("kbd", null, "E", -1)), Pe(R(p(wn)(h.value)), 1)]), u.value.length > 1 ? ($(), z("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: Q
        }, R(p(se).actions.next), 1)) : G("", !0)])) : G("", !0),
        e.battle ? ($(), z("div", Wi, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? ($(), z("div", qi, [
            S("span", null, R(e.battle.player.resonance > 0 ? p(ne).resonanceActive : d.value), 1),
            S("meter", {
              min: "0",
              max: p(ct).maxPower,
              value: e.battle.player.resource,
              "aria-label": d.value
            }, null, 8, Hi),
            S("small", null, R(e.battle.player.resonance > 0 ? p(ne).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : G("", !0),
          S("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: Y[6] || (Y[6] = gt((oe) => B(oe, "dash"), ["prevent"])),
            onClick: L
          }, [
            S("kbd", null, R(p(ne).dashKey), 1),
            Pe(R(p(ne).dash), 1),
            S("small", null, R(e.battle.player.dash > 0 ? p(ne).secondsLeft(e.battle.player.dash) : p(ne).ready), 1)
          ], 40, Vi),
          S("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: Y[7] || (Y[7] = gt((oe) => B(oe, "skill"), ["prevent"])),
            onClick: T
          }, [
            S("kbd", null, R(p(ne).skillKey), 1),
            Pe(R(p(St)[e.weapon].action), 1),
            S("small", null, R(e.battle.player.skill > 0 ? p(ne).secondsLeft(e.battle.player.skill) : p(ne).ready), 1)
          ], 40, Gi)
        ])) : G("", !0)
      ])),
      e.paused && !e.transitioning ? ($(), z("div", Yi, [Nn(Z.$slots, "overlay", {}, () => [S("button", {
        class: "journey-act",
        type: "button",
        onClick: Y[8] || (Y[8] = (oe) => n("resume"))
      }, R(p(se).actions.resume), 1)], !0)])) : G("", !0)
    ], 8, ji));
  }
}), Ki = /* @__PURE__ */ Ge(Qi, [["__scopeId", "data-v-a7e66cb8"]]);
function Xi(e) {
  const t = new Set(e.location.visited.map(ca)), s = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const r = ca(n);
    for (const i of Na(_e[n], s)) {
      if (i.kind !== "exit") continue;
      const c = ca(i.target.to), o = [r, c].sort().join("/");
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
function nr(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function Ji(e, t) {
  const s = nr(t), a = 3 * s, n = [], r = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let c = r(i), o = -1;
    for (let l = 0; l <= 48; l++) {
      const u = Math.ceil(l / 8) * 5.2 * s, h = l * Math.PI / 4, d = r({
        x: i.x + Math.cos(h) * u,
        y: i.y + Math.sin(h) * u
      }), m = Math.min(1 / 0, ...n.map((v) => Math.hypot(v.x - d.x, v.y - d.y)));
      if (m > o && (c = d, o = m), m >= 5.2 * s) break;
    }
    n.push(c);
  }
  return n;
}
var el = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, tl = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, al = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, nl = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, sl = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, rl = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, ol = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, il = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, ll = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, cl = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, ul = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, dl = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, hl = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, fl = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, pl = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, ml = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, vl = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, gl = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, bl = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, xn = {
  city: el,
  cityMobile: tl,
  chapter: al
}, yl = {
  blade: nl,
  bow: sl,
  staff: rl,
  daggers: ol,
  grimoire: il,
  cannon: ll
}, Mn = {
  camp: cl,
  crossroads: ul,
  gate: dl,
  beacon: hl,
  waterway: fl,
  cells: pl,
  hall: ml,
  roots: vl
}, ds = {
  arrival: gl,
  ending: bl
}, wl = { class: "ember-map-header" }, xl = ["src"], Ml = ["aria-pressed"], _l = ["viewBox", "aria-label"], kl = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Sl = ["transform"], Rl = ["fill"], Cl = {
  y: "22",
  "text-anchor": "middle"
}, $l = ["viewBox", "aria-label"], zl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Pl = ["points", "stroke-width"], Il = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], El = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Al = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Ll = [
  "cx",
  "cy",
  "r",
  "fill"
], Tl = ["x", "y"], Ol = {
  key: 2,
  class: "ember-map-key"
}, jl = {
  key: 3,
  class: "ember-map-places"
}, Zl = /* @__PURE__ */ Te({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, a = t, n = F(!1), r = F(null), i = F(!1), c = F(null), o = F({
      width: 400,
      height: 400
    }), l = new ResizeObserver((b) => {
      for (const x of b) {
        const { width: y, height: E } = x.contentRect;
        x.target === r.value ? i.value = y > E * 1.55 : o.value = {
          width: y,
          height: E
        };
      }
    });
    pe(c, (b, x) => {
      x && l.unobserve(x), b && l.observe(b);
    }), Ft(() => {
      l.observe(r.value);
    }), Pt(() => l.disconnect());
    const u = {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 10],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70]
    }, h = V(() => Xi(s.campaign)), d = V(() => Object.fromEntries(h.value.scenes.map((b) => {
      const [x, y] = u[b], { width: E, height: O } = o.value;
      return [b, i.value ? [50 + (104 - y) / 104 * (E - 100), 10 + (x - 10) / 80 * (O - 40)] : [45 + x / 104 * (E - 90), 10 + y / 104 * (O - 40)]];
    }))), m = V(() => h.value.links), v = V(() => _e[s.campaign.location.scene]), g = V(() => v.value.landscape.bounds), w = V(() => nr(g.value)), _ = V(() => `${g.value.x - g.value.width / 2 - 5 * w.value} ${g.value.z - g.value.depth / 2 - 5 * w.value} ${g.value.width + 10 * w.value} ${g.value.depth + 10 * w.value}`), M = V(() => Bs(s.campaign)), k = V(() => {
      const b = Ji(M.value.map((x) => x.position), g.value);
      return M.value.map((x, y) => ({
        ...x,
        marker: b[y]
      }));
    });
    return (b, x) => ($(), z("div", {
      ref_key: "root",
      ref: r,
      class: ut(["ember-map", {
        "ember-map-wide": i.value,
        "ember-map-local": !n.value
      }])
    }, [
      S("div", wl, [
        p(Mn)[v.value.id] ? ($(), z("img", {
          key: 0,
          src: p(Mn)[v.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, xl)) : G("", !0),
        S("h2", null, R(n.value ? p(N).chapterMap : p(se).scenes[v.value.id]), 1),
        S("div", null, [S("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: x[0] || (x[0] = (y) => n.value = !n.value)
        }, R(n.value ? p(N).localMap : p(N).chapterMap), 9, Ml), S("button", {
          type: "button",
          onClick: x[1] || (x[1] = (y) => a("close"))
        }, R(p(N).close), 1)])
      ]),
      n.value ? ($(), z("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": p(N).chapterMap,
        class: "ember-route-map"
      }, [($(!0), z(ee, null, Ee(m.value, (y) => ($(), z("line", {
        key: y.id,
        x1: d.value[y.from][0],
        y1: d.value[y.from][1],
        x2: d.value[y.to][0],
        y2: d.value[y.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(y.from) && e.campaign.location.visited.includes(y.to) ? void 0 : "4 4"
      }, null, 8, kl))), 128)), ($(!0), z(ee, null, Ee(d.value, (y, E) => ($(), z("g", {
        key: E,
        transform: `translate(${y.join(",")})`
      }, [
        S("circle", {
          r: "6",
          fill: E === p(ca)(v.value.id) ? "#bf6242" : e.campaign.location.visited.includes(E) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Rl),
        S("text", Cl, R(e.campaign.location.visited.includes(E) ? p(se).scenes[E] : p(N).unknownArea), 1),
        S("title", null, R(e.campaign.location.visited.includes(E) ? p(se).scenes[E] : p(N).unknownArea), 1)
      ], 8, Sl))), 128))], 8, _l)) : ($(), z("svg", {
        key: 1,
        viewBox: _.value,
        role: "img",
        "aria-label": p(se).scenes[v.value.id]
      }, [
        S("rect", {
          x: g.value.x - g.value.width / 2,
          y: g.value.z - g.value.depth / 2,
          width: g.value.width,
          height: g.value.depth,
          rx: "2",
          fill: v.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, zl),
        ($(!0), z(ee, null, Ee(v.value.landscape.roads, (y, E) => ($(), z("polyline", {
          key: E,
          points: y.points.map((O) => O.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": y.width,
          "stroke-linejoin": "round"
        }, null, 8, Pl))), 128)),
        ($(!0), z(ee, null, Ee(v.value.landscape.features, (y) => ($(), z("rect", {
          key: y.id,
          x: y.footprint.x - y.footprint.width / 2,
          y: y.footprint.z - y.footprint.depth / 2,
          width: y.footprint.width,
          height: y.footprint.depth,
          fill: y.kind === "water" ? "#6eb8c6" : y.kind === "tree" || y.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Il))), 128)),
        S("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * w.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": w.value
        }, [S("title", null, R(p(N).here), 1)], 8, El),
        ($(!0), z(ee, null, Ee(k.value, (y, E) => ($(), z("g", { key: y.target.id }, [
          S("line", {
            x1: y.position.x,
            y1: y.position.y,
            x2: y.marker.x,
            y2: y.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * w.value
          }, null, 8, Al),
          S("circle", {
            cx: y.marker.x,
            cy: y.marker.y,
            r: 2.4 * w.value,
            fill: y.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Ll),
          S("text", {
            class: "ember-map-number",
            style: Qt({ fontSize: `${3.4 * w.value}px` }),
            x: y.marker.x,
            y: y.marker.y + 1.1 * w.value,
            "text-anchor": "middle"
          }, R(E + 1), 13, Tl),
          S("title", null, R(p(wn)(y)), 1)
        ]))), 128))
      ], 8, $l)),
      n.value ? ($(), z("p", Ol, R(p(N).mapKey), 1)) : ($(), z("ol", jl, [($(!0), z(ee, null, Ee(M.value, (y) => ($(), z("li", { key: y.target.id }, R(p(wn)(y)), 1))), 128))]))
    ], 2));
  }
}), Ul = /* @__PURE__ */ Ge(Zl, [["__scopeId", "data-v-4b7b0a2d"]]), hs = {
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
}, Nl = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, Dl = ["d"], Fl = ["d"], Bl = /* @__PURE__ */ Te({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, s) => ($(), z("svg", Nl, [S("path", {
      d: p(hs)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, Dl), S("path", {
      d: p(hs)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Fl)]));
  }
}), Tt = Bl, Wl = { class: "exp-wardrobe" }, ql = { class: "exp-fitting-body" }, Hl = { class: "exp-preview-stage" }, Vl = ["aria-label"], Gl = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Yl = { class: "exp-preview-tools" }, Ql = ["aria-label"], Kl = ["disabled"], Xl = { class: "exp-outfit-info" }, Jl = { class: "exp-muted" }, ec = { class: "exp-fitting-actions" }, tc = {
  key: 0,
  class: "exp-muted"
}, ac = ["disabled"], nc = { key: 2 }, sc = { class: "exp-purchase-confirm" }, rc = ["disabled"], oc = ["disabled"], ic = ["aria-label"], lc = ["aria-pressed", "onClick"], cc = ["src"], uc = /* @__PURE__ */ Te({
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
    const s = e, a = t, n = F(s.data.equippedOutfit), r = F(!1), i = F(0), c = F(!1), o = F(null), l = F(null), u = F({}), h = V(() => lt[n.value]), d = V(() => sn(s.data, n.value)), m = V(() => Ir.find((O) => ln[O].awardKey === h.value.achievement)), v = V(() => Cs.filter((O) => sn(s.data, O) || lt[O].achievement === null || Object.values(Xt).some((I) => I.boss && ln[I.boss].awardKey === lt[O].achievement)));
    let g = null, w = !0, _ = 0, M = () => {
    };
    pe([
      n,
      i,
      () => s.weapon
    ], () => {
      w = !0, M(), r.value = !1;
    });
    function k(O) {
      n.value = O, l.value?.scrollTo({ top: 0 });
    }
    function b() {
      _ = performance.now() + 1100, w = !0, M();
    }
    function x() {
      r.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function y() {
      w = !0;
      let O;
      try {
        O = new _s({
          antialias: !0,
          alpha: !1
        });
      } catch {
        c.value = !0;
        return;
      }
      O.outputColorSpace = Rn, O.toneMapping = 7, O.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const I = new ws(), P = bn(), L = new la(), T = Ks(P, L, s.traveler.gender);
      I.background = new Sn("#d1e0e1"), I.add(L, new Ss("#fff6e3", "#627c93", 2.7));
      const B = new on("#fff6e0", 3);
      B.position.set(-3, 5, 6), I.add(B);
      const Q = new ks(-2.35, 2.35, 2.35, -2.35, 0.1, 30), U = new Pa();
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
        }, s.weapon, he, 0, 0, !0, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = -0.2, T.root.scale.setScalar(1.35);
      }
      for (const he of v.value)
        Z(he), U.union(new Pa().setFromObject(L));
      const Y = U.getSize(new dt()), oe = U.getCenter(new dt()), Ze = Y.y * 0.5 + Y.z * 0.1 + 0.2, Re = Math.hypot(Y.x, Y.z) * 0.5 + 0.2;
      Q.position.set(0, oe.y + 0.8, 7), Q.lookAt(0, oe.y, 0);
      function Me(he) {
        const Ke = Math.max(Ze, Re / he);
        Q.left = -Ke * he, Q.right = -Q.left, Q.top = Ke, Q.bottom = -Ke, Q.updateProjectionMatrix();
      }
      Me(1), O.setSize(144, 144, !1);
      try {
        for (const he of v.value)
          Z(he), O.render(I, Q), u.value[he] = O.domElement.toDataURL("image/png");
      } catch {
        c.value = !0, T.dispose(), P.dispose(), I.clear(), O.dispose(), O.forceContextLoss();
        return;
      }
      o.value.append(O.domElement);
      let ce = 0, xe = 1, ft = 1;
      const Et = new ResizeObserver(() => {
        const he = o.value.getBoundingClientRect();
        xe = Math.max(1, he.width), ft = Math.max(1, he.height), O.setSize(xe, ft, !1), Me(xe / ft), w = !0, M();
      });
      Et.observe(o.value);
      const Ye = matchMedia("(prefers-reduced-motion: reduce)");
      function Qe(he) {
        he.preventDefault(), c.value = !0, cancelAnimationFrame(ce), ce = 0;
      }
      O.domElement.addEventListener("webglcontextlost", Qe);
      function st(he) {
        if (ce = 0, c.value || document.hidden || !w && (he > _ || Ye.matches) && !T.animating) return;
        const Ke = he < _ && !Ye.matches, Ue = he * 0.03;
        T.update({
          x: Ke ? Math.sin(Ue * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: Ke ? 8 - Ue % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, n.value, Ue, he / 1e3, Ye.matches, !1), T.root.position.set(0, 0.1, 0), T.root.rotation.y = Number(i.value) * Math.PI / 180, T.root.scale.setScalar(1.35);
        try {
          O.render(I, Q), w = !1;
        } catch {
          c.value = !0;
        }
        (Ke || T.animating) && !c.value && M();
      }
      M = () => {
        !ce && !c.value && !document.hidden && (ce = requestAnimationFrame(st));
      };
      function Ce() {
        document.hidden ? (cancelAnimationFrame(ce), ce = 0) : (w = !0, M());
      }
      document.addEventListener("visibilitychange", Ce), M(), g = () => {
        M = () => {
        }, cancelAnimationFrame(ce), Et.disconnect(), document.removeEventListener("visibilitychange", Ce), O.domElement.removeEventListener("webglcontextlost", Qe), T.dispose(), P.dispose(), I.clear(), O.dispose(), O.forceContextLoss(), O.domElement.remove();
      };
    }
    function E() {
      g?.(), g = null, c.value = !1, y();
    }
    return Ft(y), Pt(() => g?.()), (O, I) => ($(), z("div", Wl, [S("section", {
      ref_key: "fitting",
      ref: l,
      class: "exp-fitting"
    }, [S("div", ql, [S("div", Hl, [S("div", {
      ref_key: "host",
      ref: o,
      class: "exp-outfit-preview",
      "aria-label": p(Gt)[n.value].name
    }, [c.value ? ($(), z("div", Gl, [S("p", null, R(p(ne).presentationError.rendering), 1), S("button", {
      type: "button",
      onClick: E
    }, R(p(N).reload), 1)])) : G("", !0)], 8, Vl), S("div", Yl, [S("label", null, [Pe(R(p(ne).rotate), 1), Ot(S("input", {
      "onUpdate:modelValue": I[0] || (I[0] = (P) => i.value = P),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": p(ne).rotate
    }, null, 8, Ql), [[kn, i.value]])]), S("button", {
      type: "button",
      disabled: c.value,
      onClick: b
    }, R(p(ne).previewAction), 9, Kl)])]), S("div", Xl, [
      S("h3", null, R(p(Gt)[n.value].name), 1),
      S("p", null, R(p(Gt)[n.value].detail), 1),
      S("p", Jl, R(p(ne).wardrobeNote), 1)
    ])]), S("div", ec, [p(Vn)(e.data.active) ? G("", !0) : ($(), z("p", tc, R(p(N).safeWardrobe), 1)), d.value ? ($(), z("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !p(Vn)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: I[1] || (I[1] = (P) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, R(e.data.equippedOutfit === n.value ? p(ne).equipped : p(ne).equip), 9, ac)) : m.value ? ($(), z("p", nc, R(p(ne).unlockWeapon(p(cn)[m.value])), 1)) : r.value ? ($(), z(ee, { key: 3 }, [S("p", null, R(p(ne).buyOutfit(p(Gt)[n.value].name, h.value.price)), 1), S("div", sc, [S("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: x
    }, R(p(ne).confirm), 9, rc), S("button", {
      type: "button",
      onClick: I[2] || (I[2] = (P) => r.value = !1)
    }, R(p(ne).cancel), 1)])], 64)) : ($(), z("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: I[3] || (I[3] = (P) => r.value = !0)
    }, R(e.balance < h.value.price ? p(ne).noCoins : p(ne).purchase) + " · " + R(p(ne).coins(h.value.price)), 9, oc))])], 512), S("div", {
      class: "exp-outfit-rack",
      "aria-label": p(ne).tryOn
    }, [($(!0), z(ee, null, Ee(v.value, (P) => ($(), z("button", {
      key: P,
      type: "button",
      "aria-pressed": n.value === P,
      onClick: (L) => k(P)
    }, [
      u.value[P] ? ($(), z("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[P],
        alt: ""
      }, null, 8, cc)) : G("", !0),
      S("strong", null, R(p(Gt)[P].name), 1),
      S("small", null, R(e.data.equippedOutfit === P ? p(ne).equipped : p(sn)(e.data, P) ? p(ne).owned : p(lt)[P].price ? p(ne).coins(p(lt)[P].price) : p(ne).achievement), 1)
    ], 8, lc))), 128))], 8, ic)]));
  }
}), dc = uc;
function hc(e, t = 1) {
  const s = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (s[n] || n >= Oa.bands.length) && we("narrative_unavailable");
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
  return Oa.bands.some((a, n) => !s[n]) && we("narrative_unavailable"), s;
}
function fc(e, t, s) {
  const a = e[En(t.affection)];
  return {
    relationship: a.relationship,
    shadow: a.shadow,
    intimacy: a.intimacy,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: s ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var pc = async (e, t) => {
  const s = await fetch(`/${vr}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  s.ok || we("narrative_unavailable");
  const a = await s.text();
  return a.trim() || we("narrative_unavailable"), a;
};
async function mc(e, t, s = pc) {
  const [a, n, r, i, c] = await Promise.all([
    s("system-prompt", t),
    s("world", t),
    s("player", t),
    s("meta-protocol", t),
    Promise.all(Ws.map(async (_) => ({
      id: _,
      document: await s(qe(_) ? _ : He[_].card, t)
    })))
  ]), o = c.map(({ id: _, document: M }) => {
    const k = [...M.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (k.length !== 1 || !k[0][1].trim()) && we("narrative_unavailable"), {
      id: _,
      introduction: k[0][1].trim(),
      document: M.replace(k[0][0], "").trim()
    };
  }), l = o.map((_) => _.introduction).join(`
`), u = o.find((_) => _.id === e).document, h = {
    system: a,
    world: n,
    player: r,
    protocol: i,
    npcs: l
  };
  if (!qe(e)) {
    const _ = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!_ || _[1] !== `${e}.initial`) && we("narrative_unavailable"), {
      ...h,
      character: u.slice(0, _.index).replace(/# 开场\s*$/, "").trim(),
      stages: [],
      opening: {
        initial: _[2],
        returned: null
      }
    };
  }
  const [d, m] = await Promise.all(["openings", `${e}-stages`].map((_) => s(_, t))), v = new Map([...d.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((_) => [_[1], _[2].trim()])), g = v.get(`${e}.initial`), w = v.get(`${e}.returned`) ?? null;
  return (!g || (e === "anian" || e === "kouzi") && !w) && we("narrative_unavailable"), {
    ...h,
    character: u,
    stages: hc(m),
    opening: {
      initial: g,
      returned: w
    }
  };
}
function sr(e) {
  return xo[e];
}
function vc(e, t, s = []) {
  if (!qe(t)) {
    const i = He[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: de.attack,
      ...e.facts.includes(i.intel) ? { pass: de.pass } : {}
    };
  }
  const a = Object.fromEntries(Mo(e.facts, t, e.people[t]).map((i) => [i, zn[i].meaning])), n = sr(t), r = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && r >= Oa.bands[4] && s[En(r)]?.secret && (a.share_secret = de.shareSecret), _o(e, t)) {
    a.follow = de.follow, a.stay = de.stay;
    for (const i of Ns(e, t).filter((c) => c.accessible && c.solo)) a[`go:${i.id}`] = de.go(i.name);
  }
  return a;
}
var rr = "dialogue", Va = `<${rr}>`, Tn = `</${rr}>`, n2 = new RegExp(`${Va}([\\s\\S]*?)${Tn}`, "i"), s2 = new RegExp(Va, "i");
function fs(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${Va}
${e.reply}
${Tn}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function gc(e) {
  return `［开工强调］：

每次输出均由两部分组成：XML 正文与 JSON 操作，缺一不可。

在${Va}…${Tn}中用【${e}】的身份第一人称叙事。在JSON 对象中提交操作。
开工：`;
}
function bc(e) {
  return e.map((t) => ({
    id: t,
    event: Ps[t]
  }));
}
function yc(e) {
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
      content: fs(a)
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: fs(a)
    }];
  });
}
function wc(e, t) {
  return t ? e.findIndex((s) => s.id === t.throughId) + 1 : 0;
}
function xc(e, t) {
  const s = new Set(e.facts), a = qe(t) ? e.people[t] : null, n = _e[qe(t) ? e.people[t].scene : He[t].scene], r = qe(t) ? e.people[t].position : Ta(t, s), i = Pn(n, r, s, e.people), c = qa(n.id, r, s).filter((l) => Le(It(n, s), r, l.position)), o = Ea(n.id);
  return {
    place: se.scenes[n.id],
    playerLodging: Kt.guest_room.name,
    ...o ? { room: {
      use: o.use,
      enclosure: o.enclosure,
      household: o.household.map((l) => l === "player" ? e.traveler.name : l === "anian_parents" || l === "innkeeper" ? se.households[l] : Ve(l)),
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
      ...ht.filter((l) => e.people[l].scene === n.id).map(Ve),
      ...c.map((l) => Ve(l.target.id))
    ],
    residents: (ar[n.id] ?? []).map((l) => ({
      name: l.name,
      activity: ki[l.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? Ba[a.destination].name : null
    } : null,
    nearby: [...i, ...c].filter((l) => l.target.id !== t).map((l) => Ve(l.target.id))
  };
}
function Mc(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: ma[e.appearanceAge] } : {}
  };
}
function _c(e, t, s = []) {
  const a = vc(e, t, s), n = Object.keys(a), r = {
    person: Ve(t),
    ...xc(e, t),
    clothing: Ys(e, t),
    events: bc(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (!qe(t)) {
    const i = He[t];
    return {
      ...r,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...r,
    map: Ns(e, t),
    rescued: e.knowledge[t].includes("captives_arrived"),
    affection: e.relationships[t].affection
  };
}
function ia(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function kc(e, t, s, a, n = e.memories[t]) {
  const r = _c(e, t, a.stages), i = To(t), c = qe(t) ? sr(t) : null, o = qe(t) ? fc(a.stages, e.relationships[t], !!c && e.facts.includes(c)) : null, { actions: l, actionMeanings: u, events: h, ...d } = r, m = {
    actions: u,
    performance: i,
    clothing: An
  }, v = {
    memory: n?.text ?? null,
    events: h,
    ...d,
    opening: e.conversations[t].some((g) => g.kind === "dialogue") || !qe(t) && e.facts.includes(He[t].complete) ? null : r.rescued ? a.opening.returned : a.opening.initial,
    stage: o
  };
  return {
    systemPrompt: [
      a.system.trim(),
      ia("background", a.world.trim()),
      ia("player", `${a.player.trim()}

${JSON.stringify({
        ...Mc(e.traveler),
        outfit: Gt[e.outfit].detail,
        equipment: St[e.weapon].equipment
      }, null, 2)}`),
      ia("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${ia("meta_protocol", `${a.protocol.trim()}

${ia("operations", JSON.stringify(m, null, 2))}`)}

<story>
${JSON.stringify(v, null, 2)}`
      },
      ...yc(e.conversations[t].length ? e.conversations[t].slice(wc(e.conversations[t], n)) : [Vs(e, t)]),
      {
        role: "user",
        content: `${s}
</story>

${gc(r.person)}`
      }
    ]
  };
}
var ps = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function Sc(e, t, s, a) {
  const n = kc(e, t, s, a), r = fr({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = en(n.systemPrompt), c = en(e.memories[t]?.text ?? ""), o = en(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: r,
    system: i,
    memory: c,
    history: o,
    situation: Math.max(0, r - i - c - o),
    limit: ps.waitAt,
    trigger: ps.trigger
  };
}
var Rc = { class: "ember-clothing-list" }, Cc = ["data-clothing-slot"], $c = /* @__PURE__ */ Te({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => ($(), z("dl", Rc, [($(!0), z(ee, null, Ee(p(An), (a, n) => ($(), z(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), z(ee, { key: 0 }, [S("dt", null, R(a), 1), S("dd", {
      "data-clothing-slot": n,
      class: ut({ "is-absent": !e.clothing[n] })
    }, R(e.clothing[n] || p(va).absent), 11, Cc)], 64)) : G("", !0)], 64))), 128))]));
  }
}), or = /* @__PURE__ */ Ge($c, [["__scopeId", "data-v-2445b8a0"]]), zc = ["onKeydown"], Pc = ["aria-label", "aria-expanded"], Ic = ["aria-label", "aria-expanded"], Ec = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Ac = ["id"], Lc = ["y", "height"], Tc = ["href"], Oc = ["href", "clip-path"], jc = ["aria-label", "aria-expanded"], Zc = ["aria-label"], Uc = ["aria-label"], Nc = { class: "ember-meter-total" }, Dc = { key: 0 }, Fc = { class: "ember-meter-total" }, Bc = { class: "ember-meter-breakdown" }, Wc = { role: "status" }, qc = ["disabled"], Hc = { key: 3 }, Vc = { role: "status" }, Gc = /* @__PURE__ */ Te({
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
    const t = e, s = jt(null), a = F(null), n = {
      clothing: va.title,
      affection: de.affection,
      context: de.context
    }, r = V(() => Ys(t.campaign, t.person)), i = F(null);
    function c() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const o = F(0), l = F("");
    let u = null, h;
    async function d() {
      u?.abort(), u = new AbortController();
      const k = u;
      s.value = null, l.value = "";
      try {
        const b = await mc(t.person, k.signal);
        k.signal.aborted || (s.value = b);
      } catch (b) {
        k.signal.aborted || (l.value = Ct(b));
      }
    }
    pe(() => t.person, () => {
      a.value = null, o.value = 0, d();
    }, { immediate: !0 });
    const m = V(() => qe(t.person) ? t.campaign.relationships[t.person].affection : 0), v = `ember-affection-${bs()}`, g = V(() => 19 * m.value / 100), w = V(() => s.value?.stages[En(m.value)]?.name ?? ""), _ = V(() => s.value ? Sc(t.campaign, t.person, t.draft, s.value) : null);
    pe(() => [t.person, m.value], ([k, b], [x, y]) => {
      k === x && b === y || (h && clearTimeout(h), o.value = k === x ? b - y : 0, o.value && (h = setTimeout(() => {
        o.value = 0;
      }, 3500)));
    }), ys(() => (c(), !0), () => !!a.value), Pt(() => {
      u?.abort(), h && clearTimeout(h);
    });
    const M = (k) => `${(k / 1e3).toFixed(1)}k`;
    return (k, b) => ($(), z("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: dr(gt(c, ["stop"]), ["esc"])
    }, [
      S("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": p(va).title,
        "aria-expanded": a.value === "clothing",
        onClick: b[0] || (b[0] = (x) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...b[4] || (b[4] = [S("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [S("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Pc),
      p(qe)(e.person) ? ($(), z("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": p(de).affection,
        "aria-expanded": a.value === "affection",
        onClick: b[1] || (b[1] = (x) => a.value = a.value === "affection" ? null : "affection")
      }, [($(), z("svg", Ec, [
        S("defs", null, [S("path", {
          id: `${v}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Ac), S("clipPath", { id: v }, [S("rect", {
          x: "2",
          y: 22 - g.value,
          width: "20",
          height: g.value
        }, null, 8, Lc)])]),
        S("use", {
          href: `#${v}-shape`,
          class: "ember-affection-track"
        }, null, 8, Tc),
        S("use", {
          href: `#${v}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${v})`
        }, null, 8, Oc)
      ])), o.value ? ($(), z("small", {
        key: 0,
        class: ut(["ember-affection-change", { "is-down": o.value < 0 }]),
        role: "status"
      }, R(o.value > 0 ? "+" : "") + R(o.value), 3)) : G("", !0)], 8, Ic)) : G("", !0),
      S("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": p(de).context,
        "aria-expanded": a.value === "context",
        onClick: b[2] || (b[2] = (x) => a.value = a.value === "context" ? null : "context")
      }, [S("span", {
        class: ut(["ember-meter-ring", { "is-warning": _.value && _.value.used >= _.value.trigger }]),
        style: Qt({ "--meter-fill": `${Math.min(1, (_.value?.used ?? 0) / (_.value?.limit ?? 1)) * 360}deg` })
      }, [...b[5] || (b[5] = [S("span", null, null, -1)])], 6)], 8, jc),
      a.value ? ($(), z("section", {
        key: 1,
        class: ut(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        S("header", null, [S("strong", null, R(n[a.value]), 1), S("button", {
          type: "button",
          "aria-label": p(de).close,
          onClick: c
        }, "×", 8, Uc)]),
        a.value === "affection" ? ($(), z(ee, { key: 0 }, [S("p", Nc, [Pe(R(m.value) + " ", 1), b[6] || (b[6] = S("small", null, "/ 100", -1))]), l.value ? G("", !0) : ($(), z("p", Dc, R(w.value || p(de).loading), 1))], 64)) : a.value === "clothing" ? ($(), kt(or, {
          key: 1,
          clothing: r.value
        }, null, 8, ["clothing"])) : _.value ? ($(), z(ee, { key: 2 }, [
          S("p", Fc, R(M(_.value.used)) + " / " + R(M(_.value.limit)), 1),
          S("dl", Bc, [($(!0), z(ee, null, Ee(p(de).contextParts, (x, y) => ($(), z(ee, { key: y }, [S("dt", null, R(x), 1), S("dd", null, R(M(_.value[y])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? ($(), z(ee, { key: 0 }, [S("p", Wc, R(e.memoryState.code === "expedition_agent_failed" ? p(de).memoryServiceFailed : p(Ct)(e.memoryState)), 1), S("button", {
            type: "button",
            disabled: e.blocked,
            onClick: b[3] || (b[3] = (x) => k.$emit("retry-memory"))
          }, R(p(de).memoryRetry), 9, qc)], 64)) : G("", !0)
        ], 64)) : l.value ? G("", !0) : ($(), z("p", Hc, R(p(de).loading), 1)),
        l.value && a.value !== "clothing" ? ($(), z(ee, { key: 4 }, [S("p", Vc, R(l.value), 1), S("button", {
          type: "button",
          onClick: d
        }, R(p(de).retry), 1)], 64)) : G("", !0)
      ], 10, Zc)) : G("", !0)
    ], 40, zc));
  }
}), Yc = /* @__PURE__ */ Ge(Gc, [["__scopeId", "data-v-b206a6ba"]]), Qc = ["aria-label"], Kc = { class: "ember-weapon-layout" }, Xc = { class: "ember-weapon-list" }, Jc = ["name", "value"], eu = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, tu = ["src"], au = { class: "ember-weapon-skill" }, nu = /* @__PURE__ */ Te({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = vs(e, "modelValue"), s = bs();
    return (a, n) => ($(), z("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": p(ue).chooseWeapon
    }, [S("div", Kc, [S("div", Xc, [($(!0), z(ee, null, Ee(p($s), (r) => ($(), z("label", {
      key: r,
      class: ut({ "is-selected": t.value === r })
    }, [
      Ot(S("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: p(s),
        value: r
      }, null, 8, Jc), [[gs, t.value]]),
      Fe(Tt, { name: r }, null, 8, ["name"]),
      S("span", null, R(p(St)[r].name), 1)
    ], 2))), 128))]), S("div", eu, [
      ($(), z("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: p(yl)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, tu)),
      S("h3", null, R(p(St)[t.value].name), 1),
      S("p", null, R(p(St)[t.value].detail), 1),
      S("div", au, [S("strong", null, R(p(St)[t.value].action), 1), S("p", null, R(p(St)[t.value].skill), 1)])
    ])])], 8, Qc));
  }
}), su = /* @__PURE__ */ Ge(nu, [["__scopeId", "data-v-0c0d4e2b"]]), ru = ["src"], ou = /* @__PURE__ */ Te({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = F(null), s = F(null), a = new ResizeObserver((n) => {
      const { width: r, height: i } = n[0].contentRect;
      s.value = r <= 700 && i > r;
    });
    return Ft(() => a.observe(t.value)), Pt(() => a.disconnect()), (n, r) => ($(), z("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [s.value !== null ? ($(), z("img", {
      key: 0,
      src: s.value ? p(xn).cityMobile : p(xn).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, ru)) : G("", !0)], 512));
  }
}), iu = /* @__PURE__ */ Ge(ou, [["__scopeId", "data-v-f5a6e0d9"]]), lu = ["aria-label"], cu = {
  key: 0,
  class: "entry-title"
}, uu = { class: "entry-city" }, du = ["aria-label"], hu = ["disabled"], fu = ["disabled"], pu = ["disabled"], mu = ["disabled"], vu = {
  key: 0,
  class: "entry-save"
}, gu = ["disabled"], bu = { class: "entry-name" }, yu = { for: "ember-traveler-name" }, wu = ["maxlength", "placeholder"], xu = { class: "entry-identity-details" }, Mu = ["value"], _u = { class: "entry-age" }, ku = { for: "ember-traveler-age" }, Su = {
  disabled: "",
  value: ""
}, Ru = ["value"], Cu = {
  class: "entry-primary",
  type: "submit"
}, $u = {
  key: 1,
  class: "entry-chapters"
}, zu = ["src"], Pu = {
  class: "entry-numeral",
  "aria-hidden": "true"
}, Iu = { class: "entry-chapter-body" }, Eu = { key: 0 }, Au = { class: "entry-forthcoming" }, Lu = { class: "entry-traveler" }, Tu = {
  key: 0,
  class: "entry-restart"
}, Ou = ["disabled"], ju = {
  key: 0,
  "aria-hidden": "true"
}, Zu = /* @__PURE__ */ Te({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: s }) {
    const a = e, n = s, r = F("title"), i = F(!1), c = F(a.campaign?.traveler.name ?? ""), o = F(a.campaign?.traveler.gender ?? null), l = F(a.campaign?.traveler.appearanceAge ?? ""), u = F(a.campaign?.weapon ?? "blade"), h = F(!1), d = F(null), m = F(null), v = V(() => ({
      title: N.title,
      identity: ue.identity,
      chapters: ue.chooseChapter,
      weapon: ue.chooseWeapon
    })[r.value]);
    pe(r, async () => {
      await zt(), m.value && (m.value.scrollTop = 0), d.value?.focus({ preventScroll: !0 });
    });
    function g() {
      i.value = !0, h.value = !1, r.value = "identity";
    }
    function w() {
      c.value.trim() && o.value && l.value && (c.value = c.value.trim(), r.value = "chapters");
    }
    function _() {
      r.value = r.value === "weapon" ? "chapters" : r.value === "chapters" && i.value ? "identity" : "title";
    }
    function M() {
      a.campaign && !i.value ? n("continue") : r.value = "weapon";
    }
    function k() {
      !o.value || !l.value || !c.value.trim() || a.blocked || a.campaign && !h.value || n("start", {
        traveler: {
          name: c.value.trim(),
          gender: o.value,
          appearanceAge: l.value
        },
        weapon: u.value,
        chapter: Zt.id
      });
    }
    return t({ back: () => r.value === "title" ? !1 : (_(), !0) }), (b, x) => ($(), z("section", {
      class: ut(["ember-entry", { "is-title": r.value === "title" }]),
      "aria-label": p(N).title
    }, [
      Fe(iu),
      x[11] || (x[11] = S("div", { class: "entry-shade" }, null, -1)),
      r.value === "title" ? ($(), z("div", cu, [
        S("p", uu, R(p(ue).city), 1),
        S("h1", {
          ref_key: "heading",
          ref: d,
          tabindex: "-1"
        }, R(p(N).title), 513),
        S("nav", { "aria-label": p(N).title }, [
          e.campaign ? ($(), z("button", {
            key: 0,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[0] || (x[0] = (y) => n("continue"))
          }, [Pe(R(p(N).resume), 1), x[7] || (x[7] = S("span", { "aria-hidden": "true" }, "→", -1))], 8, hu)) : ($(), z("button", {
            key: 1,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, [Pe(R(e.ready ? p(ue).begin : p(ue).loading), 1), x[8] || (x[8] = S("span", { "aria-hidden": "true" }, "→", -1))], 8, fu)),
          e.campaign ? ($(), z("button", {
            key: 2,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[1] || (x[1] = (y) => {
              i.value = !1, r.value = "chapters";
            })
          }, R(p(ue).chapters), 9, pu)) : G("", !0),
          e.campaign ? ($(), z("button", {
            key: 3,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, R(p(ue).newJourney), 9, mu)) : G("", !0)
        ], 8, du),
        e.campaign ? ($(), z("p", vu, [S("span", null, R(e.campaign.traveler.name), 1), S("span", null, R(p(Hs)), 1)])) : G("", !0)
      ])) : ($(), z("div", {
        key: 1,
        ref_key: "sheet",
        ref: m,
        class: "entry-sheet"
      }, [
        S("header", null, [S("button", {
          type: "button",
          disabled: e.busy,
          onClick: _
        }, "← " + R(p(ue).back), 9, gu), S("span", null, R(p(N).title), 1)]),
        S("h2", {
          ref_key: "heading",
          ref: d,
          tabindex: "-1"
        }, R(v.value), 513),
        r.value === "identity" ? ($(), z("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: gt(w, ["prevent"])
        }, [
          S("div", bu, [S("label", yu, R(p(ue).name), 1), Ot(S("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": x[2] || (x[2] = (y) => c.value = y),
            maxlength: p(24),
            placeholder: p(ue).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, wu), [[kn, c.value]])]),
          S("div", xu, [S("fieldset", null, [S("legend", null, R(p(ue).gender), 1), ($(!0), z(ee, null, Ee(p(qs), (y) => ($(), z("label", { key: y }, [Ot(S("input", {
            "onUpdate:modelValue": x[3] || (x[3] = (E) => o.value = E),
            type: "radio",
            name: "ember-traveler-gender",
            value: y,
            required: ""
          }, null, 8, Mu), [[gs, o.value]]), S("span", null, R(p(ue).genders[y]), 1)]))), 128))]), S("div", _u, [S("label", ku, R(p(ue).age), 1), Ot(S("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": x[4] || (x[4] = (y) => l.value = y),
            required: ""
          }, [S("option", Su, R(p(ue).agePlaceholder), 1), ($(!0), z(ee, null, Ee(p(ma), (y, E) => ($(), z("option", {
            key: E,
            value: E
          }, R(y), 9, Ru))), 128))], 512), [[hr, l.value]])])]),
          S("button", Cu, [Pe(R(p(ue).next), 1), x[9] || (x[9] = S("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : r.value === "chapters" ? ($(), z("div", $u, [S("button", {
          type: "button",
          class: "entry-chapter",
          onClick: M
        }, [
          S("img", {
            class: "entry-chapter-art",
            src: p(xn).chapter,
            alt: "",
            decoding: "async"
          }, null, 8, zu),
          S("span", Pu, R(p(Zt).numeral), 1),
          S("span", Iu, [
            S("small", null, R(p(Zt).number), 1),
            S("strong", null, R(p(Zt).title), 1),
            S("span", null, R(p(N).opening), 1),
            e.campaign && !i.value ? ($(), z("small", Eu, R(e.campaign.facts.includes("chapter_completed") ? p(ue).completeChapter : p(ue).currentChapter), 1)) : G("", !0)
          ]),
          x[10] || (x[10] = S("span", {
            class: "entry-chapter-arrow",
            "aria-hidden": "true"
          }, "→", -1))
        ]), S("div", Au, [S("span", null, R(p(ue).nextChapter), 1), S("span", null, R(p(ue).forthcoming), 1)])])) : ($(), z("form", {
          key: 2,
          class: "entry-loadout",
          onSubmit: gt(k, ["prevent"])
        }, [
          S("p", Lu, [S("strong", null, R(c.value), 1), S("span", null, R(o.value ? p(ue).genders[o.value] : "") + " · " + R(l.value ? p(ma)[l.value] : "") + " · " + R(p(ue).identityRole), 1)]),
          Fe(su, {
            modelValue: u.value,
            "onUpdate:modelValue": x[5] || (x[5] = (y) => u.value = y)
          }, null, 8, ["modelValue"]),
          e.campaign ? ($(), z("label", Tu, [Ot(S("input", {
            "onUpdate:modelValue": x[6] || (x[6] = (y) => h.value = y),
            type: "checkbox",
            required: ""
          }, null, 512), [[lr, h.value]]), S("span", null, R(p(ue).restartWarning), 1)])) : G("", !0),
          S("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Pe(R(e.busy ? p(ue).entering : e.campaign ? p(ue).confirmRestart : p(ue).enter), 1), e.busy ? G("", !0) : ($(), z("span", ju, "→"))], 8, Ou)
        ], 32))
      ], 512))
    ], 10, lu));
  }
}), Uu = /* @__PURE__ */ Ge(Zu, [["__scopeId", "data-v-38da0fee"]]), Nu = [
  "aria-label",
  "title",
  "disabled"
], Du = ["disabled"], Fu = [
  "maxlength",
  "aria-label",
  "placeholder"
], Bu = ["aria-label", "title"], Wu = [
  "aria-label",
  "title",
  "disabled"
], qu = /* @__PURE__ */ Te({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ Zn({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Zn([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const s = vs(e, "modelValue"), a = e, n = t, r = F(null), i = F(!1);
    let c = null, o = 0;
    function l() {
      r.value && (r.value.style.height = "44px", r.value.style.height = `${Math.min(132, r.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && s.value.trim() && n("send");
    }
    function h(d) {
      pr(d, i.value) && (d.preventDefault(), u());
    }
    return pe(s, async () => {
      await zt(), l();
    }), pe(r, (d, m) => {
      m && c?.unobserve(m), d && (l(), c?.observe(d));
    }, { flush: "post" }), Ft(() => {
      l(), c = new ResizeObserver((d) => {
        const m = d[0].contentRect.width;
        m !== o && (o = m, l());
      }), r.value && c.observe(r.value);
    }), Pt(() => c?.disconnect()), (d, m) => ($(), z("form", {
      class: "ember-composer",
      onSubmit: gt(u, ["prevent"])
    }, [
      S("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? p(de).retrySend : p(de).regenerate,
        title: e.retrying ? p(de).retrySend : p(de).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: m[0] || (m[0] = (v) => n("regenerate"))
      }, [...m[6] || (m[6] = [S("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [S("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, Nu),
      e.conclusion ? ($(), z("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: m[1] || (m[1] = (v) => n("continue"))
      }, [Pe(R(e.conclusion === "fight" ? p(de).fight : p(de).continue), 1), m[7] || (m[7] = S("span", { "aria-hidden": "true" }, "→", -1))], 8, Du)) : Ot(($(), z("textarea", {
        key: 1,
        ref_key: "input",
        ref: r,
        "onUpdate:modelValue": m[2] || (m[2] = (v) => s.value = v),
        rows: "1",
        maxlength: p(da).playerTextLimit,
        "aria-label": p(N).input,
        placeholder: p(N).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: m[3] || (m[3] = (v) => i.value = !0),
        onCompositionend: m[4] || (m[4] = (v) => i.value = !1)
      }, null, 40, Fu)), [[kn, s.value]]),
      e.talking ? ($(), z("button", {
        key: 2,
        type: "button",
        "aria-label": p(N).cancel,
        title: p(N).cancel,
        onClick: m[5] || (m[5] = (v) => n("cancel"))
      }, [...m[8] || (m[8] = [S("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [S("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, Bu)) : e.conclusion ? G("", !0) : ($(), z("button", {
        key: 3,
        type: "submit",
        "aria-label": p(N).send,
        title: p(N).send,
        disabled: e.blocked || !s.value.trim()
      }, [...m[9] || (m[9] = [S("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [S("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Wu))
    ], 32));
  }
}), Hu = /* @__PURE__ */ Ge(qu, [["__scopeId", "data-v-640a5540"]]), Vu = ["data-phase"], Gu = {
  role: "status",
  "aria-live": "polite"
}, Yu = ["datetime"], Qu = /* @__PURE__ */ Te({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, s = F(Date.now()), a = F(!0);
    _n(() => {
      a.value = !0;
    }), ja(() => {
      a.value = !1;
    });
    const n = V(() => Math.max(0, Math.floor((s.value - t.startedAt) / 1e3)));
    return pe(() => [t.startedAt, a.value], (r, i, c) => {
      if (s.value = Date.now(), !a.value) return;
      const o = setInterval(() => {
        s.value = Date.now();
      }, 1e3);
      c(() => clearInterval(o));
    }, { immediate: !0 }), (r, i) => ($(), z("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = S("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      S("span", Gu, R(p(de).phases[e.phase]), 1),
      S("time", { datetime: `PT${n.value}S` }, R(p(de).elapsed(n.value)), 9, Yu)
    ], 8, Vu));
  }
}), Ku = /* @__PURE__ */ Ge(Qu, [["__scopeId", "data-v-55406ff9"]]), ms = "关闭交谈后出发", Vt = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${ms}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, s) => s ? `${e}准备前往${t}等候 · ${ms}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function Xu(e, t, s) {
  if (!qe(t)) return !1;
  const a = e.people[t], n = s.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const r = e.conversations[t];
  for (let i = r.length - 1; i >= 0; i--) {
    const c = r[i], o = c.action;
    if (o === "follow" || o === "stay" || o?.startsWith("go:")) return c.id === s.id;
  }
  return !1;
}
function Ju(e, t, s) {
  const a = s.action;
  if (s.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === s.id, r = Xu(e, t, s) || n && (a === "finish" ? In(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), i = Ve(t);
  let c;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      c = Vt[a];
      break;
    case "follow":
      c = Vt.follow(i, r);
      break;
    case "stay":
      c = Vt.stay(i);
      break;
    case "pass":
      c = Vt.pass(i, r);
      break;
    case "attack":
    case "finish":
      c = Vt[a](r);
      break;
    default:
      c = Vt.go(i, Ba[a.slice(3)].name, r);
  }
  return {
    action: a,
    phase: r ? "pending" : "applied",
    text: c
  };
}
var ed = ["data-action", "data-phase"], td = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, ad = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, nd = /* @__PURE__ */ Te({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, s = V(() => Ju(t.campaign, t.person, t.turn));
    return (a, n) => s.value ? ($(), z("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": s.value.action,
      "data-phase": s.value.phase
    }, [($(), z("svg", td, [s.value.phase === "pending" ? ($(), z(ee, { key: 0 }, [n[0] || (n[0] = S("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = S("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : ($(), z("path", ad))])), S("span", null, R(s.value.text), 1)], 8, ed)) : G("", !0);
  }
}), sd = /* @__PURE__ */ Ge(nd, [["__scopeId", "data-v-00613f94"]]), rd = { class: "ember-clothing-feedback" }, od = { key: 0 }, id = /* @__PURE__ */ Te({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => ($(), z("details", rd, [S("summary", null, [Pe(R(p(va).changed), 1), S("span", null, [($(!0), z(ee, null, Ee(p(An), (a, n) => ($(), z(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), z("small", od, R(a), 1)) : G("", !0)], 64))), 128))])]), Fe(or, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), ld = /* @__PURE__ */ Ge(id, [["__scopeId", "data-v-49dedcf2"]]);
function cd(e) {
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
var ud = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, dd = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, hd = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, fd = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, pd = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, md = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, vd = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, gd = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, bd = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, yd = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, wd = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, xd = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, Md = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, _d = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, kd = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, Sd = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, Rd = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, Cd = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, $d = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, zd = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, Pd = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, Id = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, Ed = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, Ad = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, Ld = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, Td = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, Od = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, jd = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, Zd = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, Ud = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, Nd = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, Dd = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, Fd = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, Bd = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, Wd = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, qd = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, Hd = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, Vd = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, Gd = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, Yd = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, Qd = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, Kd = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, Xd = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, Jd = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, e1 = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, t1 = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, a1 = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, n1 = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, s1 = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, r1 = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, o1 = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, i1 = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, l1 = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, c1 = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, u1 = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, d1 = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, h1 = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, f1 = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, p1 = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, m1 = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, v1 = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, g1 = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, b1 = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, y1 = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, w1 = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, x1 = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, M1 = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, _1 = {
  sanniang: {
    body: ud,
    arm: dd,
    heads: {
      neutral: hd,
      smile: fd,
      teasing: pd,
      blush: md,
      rest: vd,
      serious: gd,
      worried: bd,
      sad: yd,
      displeased: wd,
      fond: xd,
      laugh: Md,
      surprised: _d
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: kd,
    arm: Rd,
    heads: {
      neutral: Sd,
      smile: Td,
      blush: Cd,
      displeased: $d,
      fond: zd,
      laugh: Pd,
      rest: Id,
      sad: Ed,
      surprised: Ad,
      worried: Ld
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: Od,
    arm: Zd,
    heads: {
      neutral: jd,
      blush: Gd,
      displeased: Ud,
      fond: Nd,
      laugh: Dd,
      sad: Fd,
      serious: Bd,
      smile: Wd,
      surprised: qd,
      teasing: Hd,
      worried: Vd
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: Yd,
    arm: Qd,
    heads: {
      neutral: Kd,
      smile: Xd,
      teasing: Jd,
      laugh: e1,
      blush: t1,
      fond: a1,
      serious: n1,
      surprised: s1,
      worried: r1,
      sad: o1
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: i1,
    arm: c1,
    heads: {
      neutral: l1,
      angry: u1,
      relieved: d1,
      resigned: h1,
      suspicious: f1,
      worried: p1
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: m1,
    arm: g1,
    heads: {
      neutral: v1,
      displeased: b1,
      relieved: y1,
      smile: w1,
      squint: x1,
      worried: M1
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, k1 = {
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
function S1(e, t, s) {
  if (e === "none") return null;
  const a = k1[e], n = a.joint === "arm" ? a.angles.map((r) => `rotate(${r * s}deg)`) : a.frames;
  return t[a.joint].animate(n.map((r) => ({ transform: r })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var R1 = ["src"], C1 = ["src"], $1 = ["src"], z1 = /* @__PURE__ */ Te({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = F(null), a = F(null), n = F(null), r = V(() => _1[t.person]), i = F(!1), c = F(0);
    let o = 0, l = !1, u = !1, h = null, d, m;
    function v() {
      u = !0, h?.cancel(), h = null;
    }
    function g() {
      if (!(!t.animate || u || i.value || o < 3 || !l)) {
        if (document.hidden || m?.matches) {
          v();
          return;
        }
        a.value && n.value && (u = !0, h = S1(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, r.value.armDirection));
      }
    }
    function w() {
      o++, g();
    }
    function _() {
      i.value = !0, v();
    }
    function M() {
      o = 0, i.value = !1, c.value++;
    }
    function k() {
      document.hidden && v();
    }
    function b() {
      m?.matches && v();
    }
    return pe(() => t.animate, (x) => {
      x ? g() : v();
    }), Ft(() => {
      m = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || m.matches) && v(), m.addEventListener("change", b), document.addEventListener("visibilitychange", k), d = new IntersectionObserver((x) => {
        l = x[0].isIntersecting && x[0].intersectionRatio >= 0.25, l ? g() : h && v();
      }, { threshold: 0.25 }), s.value && d.observe(s.value);
    }), ja(v), Pt(() => {
      v(), d?.disconnect(), m?.removeEventListener("change", b), document.removeEventListener("visibilitychange", k);
    }), (x, y) => ($(), z("span", {
      ref_key: "root",
      ref: s,
      class: ut(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? ($(), z("button", {
      key: 1,
      type: "button",
      onClick: M
    }, R(p(de).reloadArtwork), 1)) : ($(), z(ee, { key: 0 }, [
      ($(), z("img", {
        key: "body-" + c.value,
        src: r.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: _
      }, null, 40, R1)),
      ($(), z("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: r.value.heads[e.performance?.expression ?? "neutral"],
        style: Qt({ transformOrigin: r.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: _
      }, null, 44, C1)),
      ($(), z("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: r.value.arm,
        style: Qt({ transformOrigin: r.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: w,
        onError: _
      }, null, 44, $1))
    ], 64))], 2));
  }
}), P1 = /* @__PURE__ */ Ge(z1, [["__scopeId", "data-v-606c2ccc"]]), I1 = { class: "ember-npc-bubble" }, E1 = { class: "ember-npc-line" }, A1 = /* @__PURE__ */ Te({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = V(() => cd(t.reply));
    return (a, n) => ($(), z("div", I1, [Fe(P1, {
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ]), S("p", E1, [($(!0), z(ee, null, Ee(s.value, (r, i) => ($(), z("span", {
      key: i,
      class: ut({ "ember-spoken": r.spoken })
    }, R(r.text), 3))), 128))])]));
  }
}), L1 = /* @__PURE__ */ Ge(A1, [["__scopeId", "data-v-5a2c5c6c"]]), T1 = { class: "ember-campaign" }, O1 = { class: "ember-health" }, j1 = [
  "max",
  "value",
  "aria-label"
], Z1 = { class: "ember-objective" }, U1 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, N1 = ["aria-label"], D1 = ["disabled", "aria-label"], F1 = ["disabled", "aria-label"], B1 = ["disabled", "aria-label"], W1 = ["aria-label"], q1 = {
  key: 4,
  class: "ember-boss"
}, H1 = [
  "max",
  "value",
  "aria-label"
], V1 = {
  key: 5,
  class: "ember-alarm"
}, G1 = ["aria-label"], Y1 = ["disabled"], Q1 = ["disabled"], K1 = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, X1 = { key: 0 }, J1 = { class: "ember-prose" }, eh = ["aria-label"], th = {
  key: 0,
  class: "ember-panel-heading"
}, ah = ["aria-label"], nh = ["aria-pressed"], sh = ["aria-pressed"], rh = ["disabled"], oh = { class: "ember-prose ember-prologue" }, ih = { class: "ember-objective-panel" }, lh = { class: "ember-journal" }, ch = { class: "ember-pack-heading" }, uh = { key: 0 }, dh = { key: 1 }, hh = { class: "ember-relics" }, fh = { key: 0 }, ph = ["disabled", "onClick"], mh = { class: "ember-dialogue-heading" }, vh = { class: "ember-person-heading" }, gh = ["disabled"], bh = ["data-message-key"], yh = ["data-message-key", "data-fresh-reply"], wh = {
  key: 0,
  class: "ember-dialogue-issue"
}, xh = { key: 1 }, Mh = { class: "ember-prose" }, _h = {
  key: 2,
  class: "ember-prose"
}, kh = ["aria-busy"], Sh = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Rh = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, Ch = { key: 0 }, $h = { class: "ember-prose" }, zh = {
  key: 3,
  class: "ember-history-nav"
}, Ph = {
  key: 6,
  class: "ember-prose"
}, Ih = ["src"], Eh = { class: "ember-prose" }, Ah = ["src"], Lh = { class: "ember-prose" }, Th = { class: "ember-continued" }, Oh = { class: "ember-relics" }, jh = ["disabled", "onClick"], Zh = ["disabled"], Uh = { class: "ember-prose" }, Nh = ["disabled"], Dh = ["disabled"], Fh = ["disabled"], Bh = { class: "ember-pause-actions" }, Wh = ["aria-pressed"], qh = { class: "ember-help ember-keyboard-help" }, Hh = { class: "ember-help ember-touch-help" }, Vh = /* @__PURE__ */ Te({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, s = Uo(t.bridge, t.chatIdentity), a = No(s), { view: n, notice: r, busy: i, blocked: c, talking: o, outgoing: l, conversationProgress: u, conversationFailure: h } = s, { current: d, dirty: m } = a, v = F(!0), g = F(!1), w = F(!1), _ = F(0), M = F(!1), k = F(!1), b = F(null), x = F(null), y = F(null), E = F("relics"), O = V(() => y.value === "map" ? N.map : y.value === "journal" ? N.journal : y.value === "build" ? N.build : y.value === "person" ? Ve(I.value) : y.value === "passage" ? se.passages[P.value].title : y.value === "arrival" ? se.scenes.camp : y.value === "ending" || y.value === "prologue" ? Hs : d.value?.phase === "reward" ? N.reward : d.value?.phase === "lost" ? N.fallen : N.pause), I = F("sanniang"), P = F("warning"), L = F(null), T = F({}), B = V({
      get: () => T.value[I.value] ?? "",
      set: (W) => {
        T.value[I.value] = W;
      }
    }), Q = F(null), U = F(!1), Z = F(null), Y = F(null), oe = F(null), Ze = V((W) => {
      const D = d.value?.facts ?? [];
      return W && W.size === D.length && D.every((j) => W.has(j)) ? W : new Set(D);
    }), Re = V(() => d.value ? {
      definition: _e[d.value.location.scene],
      location: d.value.location,
      facts: Ze.value,
      people: d.value.people
    } : null), Me = V(() => {
      const W = d.value && Mn[d.value.location.scene];
      return W ? { "--scene-art": `url("${W}")` } : void 0;
    }), ce = V(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), xe = V(() => d.value ? In(d.value) : null), ft = V(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : xe.value ? "continue" : void 0), Et = V(() => !M.value || !d.value || !!d.value.pendingParley || !!xe.value || v.value || !!y.value || !!r.value || o.value || w.value || t.generationActive || k.value || !!b.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), Ye = V(() => d.value?.battle?.enemies.find((W) => ke(W.kind))), Qe = V(() => d.value?.conversations[I.value] ?? []), st = V(() => d.value && !Qe.value.length ? Vs(d.value, I.value) : null), Ce = V(() => Q.value?.person === I.value ? {
      ...Q.value,
      status: U.value ? "sending" : "failed"
    } : l.value?.person === I.value && !l.value.regenerating && !Qe.value.some((W) => W.id === l.value?.actionId) ? l.value : null), he = V(() => Ce.value?.status === "failed"), Ke = V(() => d.value && vn(d.value)?.person === I.value), Ue = F(null), { messages: ga, hasOlder: Jt, hasNewer: ea, expanded: Ga, pendingVisible: ye, rememberReading: Xe, resetLatest: Je, older: rt, newer: et } = Do({
      history: V(() => st.value ? [st.value] : Qe.value),
      pending: V(() => !!Ce.value),
      person: I,
      campaignId: V(() => d.value?.id),
      transcript: Z,
      freshReply: Ue,
      talking: o
    }), q = V(() => d.value?.collection.map((W) => {
      const D = d.value.equipped.includes(W.id) ? d.value.equipped.filter((j) => j !== W.id) : [...d.value.equipped, W.id];
      return {
        ...W,
        equipped: D,
        issue: Io(d.value, D)
      };
    }) ?? []), ta = Fo(() => {
      s.error.value = ne.presentationError.sound, g.value = !1;
    });
    let K = !1;
    function ba() {
      (y.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && Se();
    }
    async function At() {
      await Oe({ type: "resolve_parley" }) && (y.value = null, await zt(), oe.value?.focus());
    }
    async function aa() {
      xe.value ? await Oe({ type: "accept_reply" }) : await At();
    }
    Dn(L, ba), ys(() => M.value ? y.value ? (ba(), !0) : v.value ? !1 : (pt(), !0) : x.value?.back() ?? !1), Dn(Y, () => {
      !i.value && !w.value && !t.generationActive && s.dismissError();
    });
    function pt() {
      v.value = !0, a.flush();
    }
    function ya() {
      y.value = null, pt();
    }
    async function Lt(W) {
      k.value || b.value || (y.value = W, W === "build" && (E.value = "relics"), await a.flush());
    }
    async function Se() {
      if (!xe.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await At();
          return;
        }
        !r.value && !t.generationActive && (M.value = !0, y.value = null, v.value = !1, await zt(), oe.value?.focus());
      }
    }
    function wa() {
      M.value = !0, d.value?.pendingParley || xe.value ? (I.value = d.value?.pendingParley?.enemy ?? xe.value, y.value = "person", v.value = !1) : Se();
    }
    async function Oe(W) {
      if (k.value || b.value) return !1;
      k.value = !0, W.type === "interact" && d.value && (b.value = _e[d.value.location.scene].exits.find((j) => j.id === W.id)?.to ?? null);
      let D = !1;
      try {
        return await a.flush() ? (D = await s.act(W), D && (a.sync(), !y.value && !v.value && (await zt(), oe.value?.focus())), D) : !1;
      } finally {
        k.value = !1, D || (b.value = null);
      }
    }
    function na(W) {
      W === b.value && (b.value = null);
    }
    async function Bt(W) {
      await Oe({
        type: d.value ? "restart" : "start",
        ...W,
        outfit: ce.value
      }) && (M.value = !0, y.value = "prologue");
    }
    function xa() {
      v.value = !0, y.value = null, M.value = !1, a.flush();
    }
    async function sa(W) {
      if (!d.value || k.value || b.value) return;
      const D = [...Bs(d.value), ...qa(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((Ne) => Ne.target.id === W), j = D?.kind === "object" ? D.target : null;
      if (j?.kind === "person" || j?.kind === "enemy") {
        const Ne = j.kind === "person" ? j.person : j.enemy;
        I.value = Ne, y.value = "person", await a.flush() && !d.value.conversations[Ne].length && await s.act({
          type: "greet",
          person: Ne
        }) && a.sync();
        return;
      }
      await Oe({
        type: "interact",
        id: W
      }) && j?.kind === "inspect" && (P.value = j.passage, y.value = "passage");
    }
    async function ra() {
      const W = I.value, D = B.value.trim();
      if (!(c.value || U.value || !D || ft.value)) {
        T.value[W] = "", Q.value = {
          person: W,
          text: D
        }, U.value = !0, Je();
        try {
          if (!await a.flush()) return;
          const j = s.talk(W, D);
          Q.value = null, await j && a.sync();
        } finally {
          U.value = !1;
        }
      }
    }
    async function Ya() {
      if (!(c.value || U.value || !d.value))
        if (Je(), he.value && Ce.value) {
          const W = Ce.value, D = s.talk(W.person, W.text);
          Q.value = null, await D && a.sync();
        } else {
          const W = vn(d.value);
          W?.person === I.value && await s.talk(I.value, W.turn.player, W.turn.id) && a.sync();
        }
    }
    async function Qa() {
      await a.recover() && (v.value = !0, _.value++);
    }
    return pe(() => t.generationActive, (W) => {
      W && pt();
    }), pe(() => [d.value?.pendingParley, xe.value], ([W, D]) => {
      (W || D) && (I.value = W?.enemy ?? D, y.value = "person");
    }, { immediate: !0 }), pe(g, (W) => {
      ta.enable(W);
    }), pe(d, (W) => {
      g.value && W?.battle && ta.tick(W.battle);
    }), pe(() => n.value?.data, (W, D) => {
      if (!W?.active || !D?.active || W.active.id !== D.active.id) return;
      const j = new Set(D.active.facts), Ne = new Set(W.active.facts);
      !j.has("chapter_completed") && Ne.has("chapter_completed") ? y.value = "ending" : !j.has("captives_arrived") && Ne.has("captives_arrived") && (y.value = "arrival");
    }), pe(() => d.value?.id, () => {
      T.value = {}, Q.value = null;
    }), pe([y, I], () => {
      Ue.value = null;
    }), pe(r, (W) => {
      W && (Ue.value = null);
    }), pe(() => [I.value, Qe.value], ([W, D], [j, Ne]) => {
      const oa = D.filter((Wt) => Wt.kind === "dialogue").at(-1);
      W === j && y.value === "person" && oa && !Ne.some((Wt) => Wt.id === oa.id) && (Ue.value = oa.id);
    }), Ft(async () => {
      await s.read(), K = !0;
    }), _n(() => {
      K && !m.value && s.read();
    }), ja(() => {
      Ue.value = null, pt();
    }), Pt(() => {
      a.dispose(), s.dispose(), ta.dispose();
    }), (W, D) => ($(), z("section", T1, [
      M.value ? G("", !0) : ($(), kt(Uu, {
        key: 0,
        ref_key: "entry",
        ref: x,
        campaign: p(d),
        ready: !!p(n)?.ready,
        busy: p(i),
        blocked: p(c) || e.generationActive,
        onStart: Bt,
        onContinue: wa
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      M.value && p(d) && Re.value ? ($(), kt(Ki, {
        key: _.value,
        ref_key: "field",
        ref: oe,
        world: Re.value,
        traveler: p(d).traveler,
        paused: Et.value,
        transitioning: !!b.value,
        weapon: p(d).weapon,
        outfit: ce.value,
        battle: p(d).battle,
        onInput: p(a).input,
        onInteract: sa,
        onPause: pt,
        onResume: Se,
        onError: D[0] || (D[0] = (j) => w.value = !0),
        onReady: na
      }, {
        status: Un(() => [p(d) ? ($(), z(ee, { key: 0 }, [S("div", O1, [S("meter", {
          min: 0,
          max: p(X).maxHp,
          value: p(d).hp,
          "aria-label": p(ne).hp
        }, null, 8, j1), S("span", null, R(Math.ceil(p(d).hp)) + " / " + R(p(X).maxHp), 1)]), S("p", Z1, R(p(Hn)(p(d))), 1)], 64)) : G("", !0)]),
        overlay: Un(() => [...D[21] || (D[21] = [S("span", null, null, -1)])]),
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
      M.value && b.value && !p(r) && !w.value && !y.value && !v.value ? ($(), z("aside", U1, R(p(se).transition(p(se).scenes[b.value])), 1)) : G("", !0),
      M.value && p(d) && !p(d).pendingParley && !xe.value ? ($(), z("nav", {
        key: 3,
        class: "ember-tools",
        "aria-label": p(N).prepare
      }, [
        S("button", {
          type: "button",
          disabled: k.value || !!b.value,
          "aria-label": p(N).map,
          onClick: D[1] || (D[1] = (j) => Lt("map"))
        }, [Fe(Tt, { name: "map" }), S("span", null, R(p(N).map), 1)], 8, D1),
        S("button", {
          type: "button",
          disabled: k.value || !!b.value,
          "aria-label": p(N).build,
          onClick: D[2] || (D[2] = (j) => Lt("build"))
        }, [Fe(Tt, { name: "bag" }), S("span", null, R(p(N).build), 1)], 8, F1),
        S("button", {
          type: "button",
          disabled: k.value || !!b.value,
          "aria-label": p(N).journal,
          onClick: D[3] || (D[3] = (j) => Lt("journal"))
        }, [Fe(Tt, { name: "journal" }), S("span", null, R(p(N).journal), 1)], 8, B1),
        S("button", {
          type: "button",
          "aria-label": p(N).pause,
          onClick: ya
        }, [Fe(Tt, { name: "pause" }), S("span", null, R(p(N).pause), 1)], 8, W1)
      ], 8, N1)) : G("", !0),
      M.value && Ye.value && !y.value ? ($(), z("div", q1, [S("strong", null, R(p(cn)[Ye.value.kind]), 1), S("meter", {
        min: "0",
        max: Ye.value.maxHp,
        value: Ye.value.hp,
        "aria-label": p(cn)[Ye.value.kind]
      }, null, 8, H1)])) : G("", !0),
      M.value && p(d)?.phase === "battle" && ["gate", "beacon"].includes(p(d).location.scene) && !Ze.value.has("alarm_silenced") ? ($(), z("div", V1, R(Ze.value.has("alarm_raised") ? p(N).alarmRaised : p(N).alarmSeconds(Math.ceil((p(da).alarmTicks - p(d).alarmTicks) / p(X).hz))), 1)) : G("", !0),
      p(r) || w.value || e.generationActive ? ($(), z("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: Y,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": p(N).noticeTitle,
        tabindex: "-1"
      }, [S("p", null, R(w.value ? p(N).renderError : e.generationActive ? p(N).generation : p(r)), 1), w.value ? ($(), z("button", {
        key: 0,
        type: "button",
        onClick: D[4] || (D[4] = (j) => {
          w.value = !1, _.value++;
        })
      }, R(p(N).reload), 1)) : p(s).dataInvalid.value && !e.generationActive ? ($(), z(ee, { key: 1 }, [S("p", null, R(p(N).rebuildWarning), 1), S("button", {
        type: "button",
        disabled: p(i),
        onClick: D[5] || (D[5] = (...j) => p(s).rebuild && p(s).rebuild(...j))
      }, R(p(N).rebuild), 9, Y1)], 64)) : e.generationActive ? G("", !0) : ($(), z("button", {
        key: 2,
        type: "button",
        disabled: p(i),
        onClick: D[6] || (D[6] = (j) => p(s).recoveryRequired.value ? Qa() : p(s).dismissError())
      }, R(p(s).recoveryRequired.value ? p(N).recover : p(N).acknowledge), 9, Q1))], 8, G1)) : G("", !0),
      p(h) && !p(r) && (y.value !== "person" || I.value !== p(h).person) ? ($(), z("aside", K1, [
        S("strong", null, R(p(Ve)(p(h).person)), 1),
        S("p", null, R(p(Ct)(p(h))), 1),
        p(h).text ? ($(), z("details", X1, [S("summary", null, R(p(N).receivedReply), 1), S("p", J1, R(p(h).text), 1)])) : G("", !0),
        S("button", {
          type: "button",
          onClick: D[7] || (D[7] = (...j) => p(s).dismissConversationFailure && p(s).dismissConversationFailure(...j))
        }, R(p(N).acknowledge), 1)
      ])) : G("", !0),
      M.value && p(d) && !p(r) && !w.value && !e.generationActive && (y.value || v.value || p(d).phase === "reward" || p(d).phase === "lost") ? ($(), z("div", {
        key: 8,
        class: "ember-curtain",
        style: Qt(y.value === "person" ? Me.value : void 0)
      }, [S("section", {
        ref_key: "dialog",
        ref: L,
        class: ut(["ember-panel", {
          "ember-wide": y.value === "map" || y.value === "build" && E.value === "wardrobe",
          "ember-map-panel": y.value === "map",
          "ember-wardrobe-panel": y.value === "build" && E.value === "wardrobe",
          "ember-dialogue": y.value === "person"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": O.value,
        tabindex: "-1"
      }, [y.value !== "map" && y.value !== "person" ? ($(), z("header", th, [
        S("h2", null, R(O.value), 1),
        y.value === "build" ? ($(), z("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": p(N).build
        }, [S("button", {
          type: "button",
          "aria-pressed": E.value === "relics",
          onClick: D[8] || (D[8] = (j) => E.value = "relics")
        }, R(p(ue).equipment), 9, nh), S("button", {
          type: "button",
          "aria-pressed": E.value === "wardrobe",
          onClick: D[9] || (D[9] = (j) => E.value = "wardrobe")
        }, R(p(N).wardrobe), 9, sh)], 8, ah)) : G("", !0),
        y.value !== "prologue" && p(d).pendingParley?.decision !== "attack" && (y.value || p(d).phase !== "lost" && p(d).phase !== "reward") ? ($(), z("button", {
          key: 1,
          type: "button",
          disabled: !!p(d).pendingParley && p(c),
          onClick: Se
        }, R(p(N).close), 9, rh)) : G("", !0)
      ])) : G("", !0), y.value === "map" ? ($(), kt(Ul, {
        key: 1,
        campaign: p(d),
        onClose: Se
      }, null, 8, ["campaign"])) : y.value === "prologue" ? ($(), z(ee, { key: 2 }, [S("p", oh, R(p(N).opening), 1), S("button", {
        class: "ember-primary",
        type: "button",
        onClick: Se
      }, R(p(N).start), 1)], 64)) : y.value === "journal" ? ($(), z(ee, { key: 3 }, [S("p", ih, R(p(Hn)(p(d))), 1), S("ol", lh, [($(!0), z(ee, null, Ee(p(d).facts, (j) => ($(), z("li", { key: j }, R(p(Ps)[j]), 1))), 128))])], 64)) : y.value === "build" ? ($(), z(ee, { key: 4 }, [E.value === "wardrobe" && p(n) ? ($(), kt(dc, {
        key: 0,
        data: p(n).data,
        traveler: p(d).traveler,
        balance: p(n).balance,
        blocked: p(c),
        weapon: p(d).weapon,
        onCommand: Oe
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : ($(), z(ee, { key: 1 }, [
        S("div", ch, [S("strong", null, R(p(d).traveler.name), 1), S("span", null, [
          Pe(R(p(ue).genders[p(d).traveler.gender]), 1),
          p(d).traveler.appearanceAge ? ($(), z(ee, { key: 0 }, [Pe(" · " + R(p(ma)[p(d).traveler.appearanceAge]), 1)], 64)) : G("", !0),
          Pe(" · " + R(p(ue).identityRole), 1)
        ])]),
        S("small", null, R(p(N).slots(p(d).equipped.length, p(X).relicSlots)), 1),
        S("p", null, R(p(St)[p(d).weapon].name) + " · " + R(p(Ar)(p(d).weapon)), 1),
        p(_e)[p(d).location.scene].safe ? G("", !0) : ($(), z("p", uh, R(p(N).safeBuild), 1)),
        p(d).collection.length ? G("", !0) : ($(), z("p", dh, R(p(N).emptyBuild), 1)),
        S("div", hh, [($(!0), z(ee, null, Ee(q.value, (j) => ($(), z("article", { key: j.id }, [
          Fe(Tt, { name: j.id }, null, 8, ["name"]),
          S("h3", null, [Pe(R(p(Ma)[j.id].name) + " ", 1), S("small", null, R(p(ne).rank(j.rank)), 1)]),
          S("p", null, R(p(Ma)[j.id].detail), 1),
          j.issue === "dependency" || j.issue === "capacity" ? ($(), z("small", fh, R(p(N).loadoutIssue[j.issue]), 1)) : G("", !0),
          S("button", {
            type: "button",
            disabled: p(c) || !!j.issue,
            onClick: (Ne) => Oe({
              type: "loadout",
              equipped: j.equipped
            })
          }, R(p(d).equipped.includes(j.id) ? p(N).takeOff : p(N).putOn), 9, ph)
        ]))), 128))])
      ], 64))], 64)) : y.value === "person" ? ($(), z(ee, { key: 5 }, [
        S("header", mh, [
          S("div", vh, [S("h2", null, R(p(Ve)(I.value)), 1), S("small", null, R(p(se).scenes[p(d).location.scene]), 1)]),
          ($(), kt(Yc, {
            key: I.value,
            campaign: p(d),
            person: I.value,
            draft: B.value,
            "memory-state": p(n)?.memories?.[I.value],
            blocked: p(c),
            onRetryMemory: D[10] || (D[10] = (j) => p(s).retryMemory(I.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !xe.value && p(d).pendingParley?.decision !== "attack" ? ($(), z("button", {
            key: 0,
            type: "button",
            disabled: !!p(d).pendingParley && p(c),
            onClick: Se
          }, R(p(N).close), 9, gh)) : G("", !0)
        ]),
        S("div", {
          ref_key: "transcript",
          ref: Z,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: D[15] || (D[15] = (...j) => p(Xe) && p(Xe)(...j))
        }, [
          p(Jt) ? ($(), z("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: D[11] || (D[11] = (...j) => p(rt) && p(rt)(...j))
          }, R(p(de).older), 1)) : G("", !0),
          ($(!0), z(ee, null, Ee(p(ga), (j) => ($(), z(ee, { key: j.key }, [j.side === "player" ? ($(), z("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": j.key
          }, [S("small", null, R(p(d).traveler.name), 1), Pe(R(j.turn.player), 1)], 8, bh)) : ($(), z("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": j.key,
            "data-fresh-reply": Ue.value === j.turn.id
          }, [j.turn.issue === "action_rejected" || j.turn.issue === "clothing_rejected" || j.turn.issue === "reply_invalid" || j.turn.issue === "reply_incomplete" ? ($(), z("p", wh, R(p(de).issues[j.turn.issue]), 1)) : G("", !0), j.turn.kind === "receipt" && j.turn.issue === "reply_invalid" ? ($(), z("details", xh, [S("summary", null, R(p(de).rawReply), 1), S("p", Mh, R(j.turn.reply), 1)])) : j.turn.kind === "receipt" ? ($(), z("p", _h, R(j.turn.reply), 1)) : ($(), z(ee, { key: 3 }, [
            Fe(L1, {
              person: I.value,
              reply: j.turn.reply,
              performance: j.turn.performance,
              animate: Ue.value === j.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            Fe(sd, {
              campaign: p(d),
              person: I.value,
              turn: j.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            j.turn.clothing ? ($(), kt(ld, {
              key: 0,
              clothing: j.turn.clothing
            }, null, 8, ["clothing"])) : G("", !0)
          ], 64))], 8, yh))], 64))), 128)),
          p(ye) && Ce.value ? ($(), z(ee, { key: 1 }, [S("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Ce.value.status === "sending"
          }, [S("small", null, R(p(d).traveler.name), 1), Pe(R(Ce.value.text), 1)], 8, kh), he.value ? ($(), z("p", Sh, R(p(de).sendFailed), 1)) : G("", !0)], 64)) : G("", !0),
          !p(ea) && p(h)?.person === I.value && !Qe.value.some((j) => j.id === p(h)?.actionId) ? ($(), z("div", Rh, [
            S("p", null, R(p(Ct)(p(h))), 1),
            p(h).text ? ($(), z("details", Ch, [S("summary", null, R(p(N).receivedReply), 1), S("p", $h, R(p(h).text), 1)])) : G("", !0),
            S("button", {
              type: "button",
              onClick: D[12] || (D[12] = (...j) => p(s).dismissConversationFailure && p(s).dismissConversationFailure(...j))
            }, R(p(N).acknowledge), 1)
          ])) : G("", !0),
          p(Ga) ? ($(), z("nav", zh, [p(ea) ? ($(), z("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: D[13] || (D[13] = (...j) => p(et) && p(et)(...j))
          }, R(p(de).newer), 1)) : G("", !0), S("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: D[14] || (D[14] = (...j) => p(Je) && p(Je)(...j))
          }, R(p(de).latest), 1)])) : G("", !0)
        ], 544),
        p(u)?.person === I.value ? ($(), kt(Ku, {
          key: 0,
          phase: p(u).phase,
          "started-at": p(u).startedAt
        }, null, 8, ["phase", "started-at"])) : G("", !0),
        Fe(Hu, {
          modelValue: B.value,
          "onUpdate:modelValue": D[16] || (D[16] = (j) => B.value = j),
          blocked: p(c) || U.value || e.generationActive,
          talking: p(o),
          "can-regenerate": !!Ke.value || he.value,
          retrying: he.value,
          conclusion: ft.value,
          onSend: ra,
          onRegenerate: Ya,
          onContinue: aa,
          onCancel: p(s).cancelTalk
        }, null, 8, [
          "modelValue",
          "blocked",
          "talking",
          "can-regenerate",
          "retrying",
          "conclusion",
          "onCancel"
        ])
      ], 64)) : y.value === "passage" ? ($(), z("p", Ph, R(p(se).passages[P.value].body), 1)) : y.value === "arrival" ? ($(), z(ee, { key: 7 }, [
        S("img", {
          class: "ember-story-art",
          src: p(ds).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, Ih),
        S("p", Eh, R(p(N).received), 1),
        S("button", {
          class: "ember-primary",
          type: "button",
          onClick: Se
        }, R(p(N).resume), 1)
      ], 64)) : y.value === "ending" ? ($(), z(ee, { key: 8 }, [
        S("img", {
          class: "ember-story-art",
          src: p(ds).ending,
          alt: "",
          decoding: "async"
        }, null, 8, Ah),
        S("h2", null, R(p(N).endingTitle), 1),
        S("p", Lh, R(p(N).ending), 1),
        S("strong", Th, R(p(N).continued), 1),
        S("p", null, R(p(N).optional), 1),
        S("button", {
          class: "ember-primary",
          type: "button",
          onClick: Se
        }, R(p(N).remain), 1)
      ], 64)) : p(d).phase === "reward" ? ($(), z(ee, { key: 9 }, [
        S("p", null, R(p(N).rewardDetail), 1),
        S("div", Oh, [($(!0), z(ee, null, Ee(p(d).offers, (j) => ($(), z("button", {
          key: j.id,
          type: "button",
          disabled: p(c),
          onClick: (Ne) => Oe({
            type: "relic",
            id: j.id
          })
        }, [
          Fe(Tt, { name: j.id }, null, 8, ["name"]),
          S("h3", null, [Pe(R(p(Ma)[j.id].name) + " ", 1), S("small", null, R(p(ne).rank(j.rank)), 1)]),
          S("p", null, R(p(Ma)[j.id].detail), 1)
        ], 8, jh))), 128))]),
        S("button", {
          type: "button",
          disabled: p(c),
          onClick: D[17] || (D[17] = (j) => Oe({ type: "leave" }))
        }, R(p(N).skip), 9, Zh)
      ], 64)) : p(d).phase === "lost" ? ($(), z(ee, { key: 10 }, [
        S("p", Uh, R(p(N).fallenDetail), 1),
        S("button", {
          class: "ember-primary",
          type: "button",
          disabled: p(c),
          onClick: D[18] || (D[18] = (j) => Oe({ type: "retry" }))
        }, R(p(N).retry), 9, Nh),
        S("button", {
          type: "button",
          disabled: p(c),
          onClick: D[19] || (D[19] = (j) => Oe({ type: "retreat" }))
        }, R(p(N).retreat), 9, Dh)
      ], 64)) : ($(), z(ee, { key: 11 }, [
        S("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!p(r) || e.generationActive,
          onClick: Se
        }, R(p(N).resume), 9, Fh),
        S("div", Bh, [S("button", {
          type: "button",
          "aria-pressed": g.value,
          onClick: D[20] || (D[20] = (j) => g.value = !g.value)
        }, R(p(N).sound), 9, Wh)]),
        S("details", null, [
          S("summary", null, R(p(ue).controls), 1),
          S("p", qh, R(p(N).controls), 1),
          S("p", Hh, R(p(N).touchControls), 1)
        ]),
        S("button", {
          type: "button",
          onClick: xa
        }, R(p(ue).title), 1)
      ], 64))], 10, eh)], 4)) : G("", !0)
    ]));
  }
}), r2 = Vh;
export {
  r2 as default
};
