/* eslint-disable */
import { $ as ra, A as br, D as je, E as Xe, I as vn, J as as, M as Mt, N as rr, P as Yt, Q as $n, R as ha, S as z, T as Ie, U as _e, V as $, W as In, X as ue, at as Nt, b as dt, c as ho, ct as po, d as sr, dt as Ra, ft as E, h as ee, i as wr, l as ns, lt as g, m as Et, nt as fo, p as mo, q as rs, r as ss, rt as W, u as go, ut as ht, v as V, x as G, y as M } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as at } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as vo, r as An, t as yo } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as bo, t as wo } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as xo } from "./xiaobai-os-constants-CDXgazQ7.js";
import { $ as os, At as _o, Bt as Mo, C as xr, Ct as ko, D as Fa, Dt as is, E as So, Et as or, Ft as Ro, O as ls, Ot as Co, St as Po, T as Eo, Tt as an, Vt as _r, Wt as St, b as Nn, dt as cs, et as $t, f as $o, g as Io, it as ir, k as Mr, kt as kr, m as lr, n as ds, o as cn, s as Ao, tt as zo, v as To, wt as Lo } from "./xiaobai-os-three.module-Bxd-t3Ck.js";
import { t as us } from "./xiaobai-os-BufferGeometryUtils-Cb-FyMS_.js";
import { $ as hs, A as Zn, B as he, C as yn, D as dn, E as un, F as ps, G as K, H as Oo, I as jo, J as Ce, K as Wt, L as Uo, M as Dn, N as x, O as Be, P as pt, Q as ze, R as Vt, S as Sr, T as ne, U as fs, V as No, W as et, X as ms, Y as Sa, Z as gs, _ as Fn, a as Zt, b as vs, c as ye, d as Bn, et as Zo, f as ys, g as sa, h as Rr, i as oa, j as ot, k as zn, l as q, m as Do, n as qn, o as Bt, p as bs, q as ws, r as ka, s as Fo, t as re, tt as xs, u as Wn, v as _s, w as Wa, x as cr, y as Ha, z as kt } from "./xiaobai-os-copy-BbOBZLPI.js";
function bn(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Cr(e, t, r) {
  const a = [...t], n = [];
  for (; a.length && n.length < r; ) n.push(a.splice(Math.floor(bn(e) * a.length), 1)[0]);
  return n;
}
function Tn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function me(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function Ae(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var Bo = 1e-9;
function ia(e, t, r) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (r + 0.5) * e.cellSize
  };
}
function ca(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function Ms(e, t) {
  const r = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!r || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((l) => l.length !== r || /[^.# ]/.test(l))) && Ae("map_invalid");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  for (const l of e.gates) {
    (!l.id || n.has(l.id) || !l.cells.length) && Ae("map_invalid"), n.add(l.id);
    const o = !t.has(l.id);
    o && c.add(l.id);
    for (const { column: u, row: h } of l.cells) {
      (!Number.isInteger(u) || !Number.isInteger(h) || u < 0 || u >= r || e.rows[h]?.[u] !== ".") && Ae("map_invalid");
      const d = h * r + u;
      s.has(d) && Ae("map_invalid"), s.add(d), o && i.add(d);
    }
  }
  for (const l of t) n.has(l) || Ae("gate_unknown");
  return {
    map: e,
    columns: r,
    rows: a,
    closedGates: c,
    blocked(l, o) {
      return l < 0 || l >= r || o < 0 || o >= a || e.rows[o][l] !== "." || i.has(o * r + l);
    }
  };
}
function hn(e, t, r, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), s = Math.max(r - e.y, 0, e.y - r - a);
  return n * n + s * s;
}
function nn(e, t, r) {
  const a = r.x - t.x, n = r.y - t.y, s = a * a + n * n, i = s === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / s));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function ks(e, t, r, a, n) {
  let s = 0, i = 1;
  for (const [c, l, o] of [[
    e.x,
    t.x - e.x,
    r
  ], [
    e.y,
    t.y - e.y,
    a
  ]]) if (l === 0) {
    if (c <= o || c >= o + n) return !1;
  } else {
    const u = (o - c) / l, h = (o + n - c) / l;
    if (s = Math.max(s, Math.min(u, h)), i = Math.min(i, Math.max(u, h)), s >= i) return !1;
  }
  return s < i;
}
function qo(e, t, r, a, n) {
  return ks(e, t, r, a, n) ? 0 : Math.min(hn(e, r, a, n), hn(t, r, a, n), nn({
    x: r,
    y: a
  }, e, t), nn({
    x: r + n,
    y: a
  }, e, t), nn({
    x: r,
    y: a + n
  }, e, t), nn({
    x: r + n,
    y: a + n
  }, e, t));
}
function Ne(e, t, r, a = 0) {
  (![
    t.x,
    t.y,
    r.x,
    r.y,
    a
  ].every(Number.isFinite) || a < 0) && Ae("input_invalid");
  const { map: n } = e, s = n.cellSize, i = ca(n, {
    x: Math.min(t.x, r.x) - a,
    y: Math.min(t.y, r.y) - a
  }), c = ca(n, {
    x: Math.max(t.x, r.x) + a,
    y: Math.max(t.y, r.y) + a
  });
  for (let l = i.row; l <= c.row; l++) for (let o = i.column; o <= c.column; o++) {
    if (!e.blocked(o, l)) continue;
    const u = n.origin.x + o * s, h = n.origin.y + l * s;
    if (a === 0 ? ks(t, r, u, h, s) || hn(t, u, h, s) === 0 && hn(r, u, h, s) === 0 : qo(t, r, u, h, s) < a * a - Bo) return !1;
  }
  return !0;
}
var Rt = (e, t, r) => Ne(e, t, t, r);
function dr(e, t, r, a) {
  [r.x, r.y].every(Number.isFinite) || Ae("input_invalid"), Rt(e, t, a) || Ae("position_blocked");
  const n = Math.hypot(r.x, r.y);
  if (n === 0) return;
  const s = Math.ceil(n / (e.map.cellSize / 4)), i = r.x / s, c = r.y / s;
  for (let l = 0; l < s; l++) {
    const o = {
      x: t.x + i,
      y: t.y + c
    };
    if (Ne(e, t, o, a)) {
      Object.assign(t, o);
      continue;
    }
    const u = Math.abs(i) >= Math.abs(c) ? ["x", "y"] : ["y", "x"];
    for (const h of u) {
      const d = {
        ...t,
        [h]: t[h] + (h === "x" ? i : c)
      };
      Ne(e, t, d, a) && Object.assign(t, d);
    }
  }
}
function Hn(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function Ue(e) {
  const { landscape: t } = e, { bounds: r } = t, a = {
    x: r.x - r.width / 2,
    y: r.z - r.depth / 2
  }, n = [
    r,
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
  ].every(Number.isInteger)) && Ae("map_invalid");
  const s = t.features.map((u) => u.id);
  new Set(s).size !== s.length && Ae("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && Ae("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + r.width || u.z + u.depth / 2 > a.y + r.depth) && Ae("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([h, d], f) => !Number.isFinite(h) || !Number.isFinite(d) || f > 0 && h === u.points[f - 1][0] && d === u.points[f - 1][1])) && Ae("map_invalid");
  const i = [];
  for (let u = 0; u < r.depth; u++) {
    let h = "";
    for (let d = 0; d < r.width; d++) {
      const f = {
        x: a.x + d + 0.5,
        y: a.y + u + 0.5
      };
      h += t.features.some((m) => m.kind !== "arch" && Hn(f, m.footprint) && (m.kind !== "bridge" || Math.abs(f.y - m.footprint.z) >= m.footprint.depth / 2 - 1)) ? "#" : ".";
    }
    i.push(h);
  }
  const c = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((u) => {
      const h = u.footprint, d = [];
      for (let f = h.z - h.depth / 2 - a.y; f < h.z + h.depth / 2 - a.y; f++) for (let m = h.x - h.width / 2 - a.x; m < h.x + h.width / 2 - a.x; m++) d.push({
        column: m,
        row: f
      });
      return {
        id: u.id,
        cells: d
      };
    })
  }, l = Ms(c, new Set(c.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !Rt(l, u, K.playerRadius)) && Ae("map_invalid");
  const o = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || o.has(u.id)) && Ae("map_invalid"), o.add(u.id);
  return {
    ...e,
    map: c,
    gates: t.gates
  };
}
var Wo = Ue({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(zn.map((e) => [e.to, e.position])),
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
    ...zn.map((e) => ({
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
  objects: [
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "camp_heat",
      anchor: "rest",
      kind: "inspect",
      passage: "camp_heat",
      condition: { all: ["heat_restored"] }
    },
    {
      id: "anian_return",
      anchor: "registry",
      kind: "inspect",
      passage: "anian_home",
      condition: { all: ["anian_walk_finished"] }
    },
    cr.object
  ],
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
      x("clinic", "clinic", -19, 4, 14, 10),
      x("storehouse", "storehouse", 12, -9, 12, 12),
      x("hearth", "stove", 0, 6, 4, 4),
      x("rest-bench", "bench", -5, 15, 2, 4),
      x("wagon", "wagon", 22, 3, 4, 6),
      x("supply-crates", "supplies", 20, -5, 4, 4),
      x("drying-shed", "workshop", -29, 0, 4, 10, { height: 3.5 }),
      x("herbs-small", "medicine", -23, 10, 6, 2),
      x("menders-home", "dwelling", -12, 20, 4, 4, {
        height: 3.3,
        tint: "rose"
      }),
      x("eastern-home", "dwelling", 15, 20, 4, 4, { height: 4.1 }),
      x("wall-home", "dwelling", -31, -12, 4, 4, { height: 5 }),
      x("charcoal-home", "dwelling", 34, -16, 4, 4, { height: 4.7 }),
      x("pipe-home", "dwelling", -16, -19, 4, 4, { height: 3.8 }),
      x("canal-west", "water", -26, -28, 44, 4),
      x("canal-east", "water", 26, -28, 44, 4),
      x("bridge-west", "wall", -5, -28, 2, 6, { height: 0.8 }),
      x("bridge-east", "wall", 5, -28, 2, 6, { height: 0.8 }),
      x("gate-west", "wall", -26, -49, 44, 4, { height: 6 }),
      x("gate-east", "wall", 26, -49, 44, 4, { height: 6 }),
      x("west-watchtower", "tower", -8, -49, 6, 8, { height: 12 }),
      x("east-watchtower", "tower", 8, -49, 6, 8, { height: 12 }),
      x("departure-arch", "arch", 0, -49, 10, 4, { height: 8 }),
      x("west-boundary", "wall", -37, -26, 2, 62, {
        height: 7,
        wallUse: "homes"
      }),
      x("postern-bottom", "wall", -37, 25, 2, 32, {
        height: 7,
        wallUse: "homes"
      }),
      x("south-boundary", "wall", 0, 40, 96, 4, { height: 1 }),
      x("east-boundary", "wall", 46, -8, 4, 96, { height: 1.2 }),
      x("postern-end", "wall", -47, -8, 2, 100, { height: 2.4 }),
      x("north-boundary", "wall", 0, -57, 96, 2, { height: 5 }),
      x("roadside-workshop", "workshop", -17, -38, 16, 8, { height: 4 }),
      x("lookout-ruin", "ruin", 24, -38, 6, 6, { height: 3 }),
      x("arrival-home", "dwelling", -27, 28, 6, 6, { height: 4.3 }),
      x("eastern-workshop", "workshop", 28, 30, 6, 6, { height: 3.7 }),
      x("wall-row", "dwelling", -24, -21, 18, 4, { height: 4.5 }),
      x("roadside-homes", "dwelling", -8, -12, 4, 10, { height: 4.2 }),
      x("clinic-back-shed", "workshop", -20, -5, 16, 2, { height: 2.6 })
    ].map((e) => zn.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), Ho = Ue({
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
    },
    front_left: {
      x: -4,
      y: 13
    },
    front_right: {
      x: 4,
      y: 7
    },
    front_archer: {
      x: 6,
      y: -5
    },
    flank: {
      x: 6,
      y: -10
    },
    reward: {
      x: -8,
      y: 16
    },
    rest: {
      x: -7,
      y: 20
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
  objects: [
    {
      id: "warning",
      anchor: "warning",
      kind: "inspect",
      passage: "warning"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "crossroads"
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest",
      condition: { all: ["crossroads_cleared"] }
    }
  ],
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
      x("wall-west", "wall", -30, -32, 2, 32, { height: 3 }),
      x("wall-west-low", "wall", -30, 19, 2, 58, { height: 2 }),
      x("wall-east", "wall", 24, -25, 4, 44, { height: 7 }),
      x("rampart-tower", "tower", 24, -16, 8, 8, { height: 15 }),
      x("gate-tower-left", "tower", -8, -41, 6, 8, { height: 11 }),
      x("gate-tower-right", "tower", 8, -41, 6, 8, { height: 11 }),
      x("north-arch", "arch", 0, -41, 10, 4, { height: 8 }),
      x("west-gate-wall", "wall", -26, -43, 40, 4, { height: 5 }),
      x("east-gate-wall", "wall", 36, -43, 20, 4, { height: 5 }),
      x("road-ruin", "ruin", -12, 1, 6, 6, { height: 3.5 }),
      x("fallen-column", "ruin", 12, -2, 4, 4, { height: 1.2 }),
      x("road-tree", "tree", -17, 27, 4, 4, {
        height: 9,
        tint: "amber"
      }),
      x("roots-tree", "tree", -39, -25, 6, 6, {
        height: 13,
        tint: "sage"
      }),
      x("southern-tree", "tree", 17, 37, 4, 4, {
        height: 9,
        tint: "sage"
      }),
      x("arrival-watch-west", "tower", -8, 44, 6, 8, { height: 10 }),
      x("arrival-watch-east", "tower", 8, 44, 6, 8, { height: 10 }),
      x("arrival-arch", "arch", 0, 44, 10, 4, { height: 8 }),
      x("broken-convoy", "wagon", -12, 19, 4, 6, { damaged: !0 }),
      x("convoy-supplies", "supplies", -16, 16, 4, 4),
      x("stranded-cargo", "cargo", -24, 28, 8, 12),
      x("stranded-fuel", "fuel", 18, 25, 6, 8),
      x("old-border", "thicket", -18, -6, 14, 4),
      x("waterway-bank", "water", 37, 21, 22, 16),
      x("north-boundary", "wall", 0, -47, 96, 2, { height: 5 }),
      x("south-boundary-west", "wall", -26, 47, 44, 2, { height: 5 }),
      x("south-boundary-east", "wall", 26, 47, 44, 2, { height: 5 }),
      x("west-boundary", "wall", -47, 0, 2, 96, { height: 2 }),
      x("east-boundary", "wall", 47, 0, 2, 96, { height: 2 })
    ]
  }
}), Vo = Ue({
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
    },
    archer_left: {
      x: -8,
      y: -17
    },
    flank: {
      x: 5,
      y: -4
    },
    reinforcement: {
      x: -16,
      y: 12
    },
    reward: {
      x: -8,
      y: 14
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
  objects: [{
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "approach"
  }],
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
      x("outer-west", "wall", -35, 0, 2, 80, { height: 8 }),
      x("outer-east", "wall", 35, 0, 2, 80, { height: 8 }),
      x("north-wall", "wall", 0, -39, 72, 2, { height: 9 }),
      x("south-wall", "wall", 0, 39, 72, 2, { height: 5 }),
      x("gate-tower-west", "tower", -10, -27, 8, 12, { height: 16 }),
      x("gate-tower-east", "tower", 10, -27, 8, 12, { height: 16 }),
      x("main-arch", "arch", 0, -27, 12, 6, { height: 12 }),
      x("gate-flank-west", "wall", -25, -27, 22, 6, { height: 9 }),
      x("gate-flank-east", "wall", 25, -27, 22, 6, { height: 9 }),
      x("west-pillars", "ruin", -13, -3, 6, 4, { height: 4.8 }),
      x("east-pillars", "ruin", 13, -3, 6, 4, { height: 4.8 }),
      x("western-barracks", "storehouse", -25, 2, 12, 12),
      x("eastern-barracks", "storehouse", 25, 2, 12, 12),
      x("awaiting-inspection", "cargo", -15, 23, 4, 12),
      x("cleared-consignments", "cargo", 15, 23, 4, 12),
      x("inspection-cart", "wagon", 25, 19, 4, 6),
      x("inspection-crates", "supplies", 28, 25, 4, 4),
      x("barracks-tree", "tree", -27, 26, 4, 4, {
        height: 9,
        tint: "amber"
      })
    ]
  }
}), Yo = Ue({
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
    },
    bomber: {
      x: -12,
      y: -20
    },
    reinforcementLeft: {
      x: -8,
      y: -24
    },
    reinforcementRight: {
      x: 8,
      y: -24
    },
    reward: {
      x: 10,
      y: 6
    },
    signal: {
      x: 6,
      y: -5
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
  objects: [{
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "passage"
  }],
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
      x("west-parapet", "wall", -35, 0, 2, 84, { height: 3 }),
      x("east-parapet", "wall", 35, 0, 2, 84, { height: 3 }),
      x("north-wall", "wall", 0, -41, 72, 2, { height: 9 }),
      x("south-wall", "wall", 0, 41, 72, 2, { height: 5 }),
      x("signal-brazier", "beacon", 0, -8, 6, 6),
      x("west-signal-column", "column", -20, -10, 4, 4, { height: 11 }),
      x("east-signal-column", "column", 20, -10, 4, 4, { height: 11 }),
      x("west-approach-column", "column", -20, 12, 4, 4, { height: 8 }),
      x("east-approach-column", "column", 20, 12, 4, 4, { height: 8 }),
      x("hall-tower-west", "tower", -10, -30, 8, 8, { height: 16 }),
      x("hall-tower-east", "tower", 10, -30, 8, 8, { height: 16 }),
      x("hall-arch", "arch", 0, -30, 12, 4, { height: 12 }),
      x("signal-fuel", "fuel", -27, 19, 8, 22),
      x("signal-reserve", "cargo", 27, 19, 8, 22),
      x("west-copper-store", "supplies", -26, -23, 6, 6),
      x("east-copper-store", "supplies", 26, -23, 6, 6)
    ]
  }
}), Go = Ue({
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
      x: 0,
      y: 5
    },
    guard: {
      x: 4,
      y: 5
    },
    approach: {
      x: -8,
      y: -24
    },
    front_left: {
      x: -8,
      y: -18
    },
    front_right: {
      x: -4,
      y: -12
    },
    front_archer: {
      x: 4,
      y: -12
    },
    front_guard: {
      x: 2,
      y: -12
    },
    front_bomber: {
      x: 9,
      y: -10
    },
    front_flank: {
      x: -7,
      y: -11
    },
    reinforcementLeft: {
      x: -8,
      y: 10
    },
    reinforcementRight: {
      x: 8,
      y: 10
    },
    approach_reward: {
      x: -7,
      y: -9
    },
    rest: {
      x: -7,
      y: -6
    },
    reward: {
      x: 8,
      y: 9
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
  objects: [
    {
      id: "sluice",
      anchor: "sluice",
      kind: "switch",
      fact: "sluice_opened"
    },
    {
      id: "approach_cache",
      anchor: "approach_reward",
      kind: "reward",
      node: "approach"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "passage"
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }
  ],
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
      x("west-wall", "wall", -31, 0, 2, 88, { height: 7 }),
      x("east-wall", "wall", 31, 0, 2, 88, { height: 7 }),
      x("north-wall", "wall", 0, -43, 64, 2, { height: 8 }),
      x("south-wall", "wall", 0, 43, 64, 2, { height: 8 }),
      x("upper-channel-west", "water", -24, -3, 12, 58),
      x("upper-channel-east", "water", 23, -12, 14, 48),
      x("lower-channel-west", "water", -13, 32, 30, 20),
      x("lower-channel-east", "water", 28, 32, 4, 20),
      x("sluice-west-abutment", "wall", -18, 16, 24, 4, { height: 5 }),
      x("sluice-east-abutment", "wall", 18, 16, 24, 4, { height: 5 }),
      x("upper-pier-west", "column", -15, -18, 4, 4, { height: 9 }),
      x("upper-pier-east", "column", 11, -18, 4, 4, { height: 9 }),
      x("lower-pier-west", "column", -13, 0, 4, 4, { height: 9 }),
      x("lower-pier-east", "column", 13, 0, 4, 4, { height: 9 }),
      x("vault-north", "arch", -2, -18, 26, 2, { height: 10 }),
      x("vault-middle", "arch", 0, 0, 26, 2, { height: 10 }),
      x("entry-marker", "ruin", -24, -39, 6, 2, { height: 5 }),
      x("maintenance-supplies", "supplies", 8, 36, 4, 4)
    ]
  }
}), Qo = Ue({
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
    reward: {
      x: 4,
      y: 8
    },
    rest: {
      x: 8,
      y: 6
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
  objects: [
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "cells"
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "release",
      anchor: "release",
      kind: "switch",
      fact: "captives_released"
    },
    {
      id: "postern_latch",
      anchor: "latch",
      kind: "switch",
      fact: "postern_opened"
    }
  ],
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
      x("west-wall", "wall", -31, 0, 2, 76, { height: 6 }),
      x("east-wall", "wall", 31, 0, 2, 76, { height: 6 }),
      x("north-wall", "wall", 0, -37, 64, 2, { height: 8 }),
      x("south-wall", "wall", 0, 37, 64, 2, { height: 6 }),
      x("cells-divider", "wall", 0, -24, 2, 28, { height: 6 }),
      x("cells-front-center", "wall", 0, -10, 20, 2, { height: 6 }),
      x("cells-front-west", "wall", -26, -10, 12, 2, { height: 6 }),
      x("cells-front-east", "wall", 26, -10, 12, 2, { height: 6 }),
      x("postern-divider", "wall", -7, 24, 50, 2, { height: 5 }),
      x("waterway-passage", "arch", -21, 19, 10, 2, { height: 7 }),
      x("postern-corridor", "wall", 17, 31, 2, 12, { height: 5 }),
      x("west-bunk", "bunk", -26, -24, 4, 8),
      x("east-bunk", "bunk", 26, -24, 4, 8),
      x("west-cell-bench", "bench", -8, -30, 2, 4),
      x("east-cell-bench", "bench", 8, -30, 2, 4),
      x("guard-desk", "ledger", 3, 12, 4, 4),
      x("hall-pier-west", "column", -7, -4, 2, 2, { height: 7 }),
      x("hall-pier-east", "column", 7, -4, 2, 2, { height: 7 })
    ]
  }
}), Ko = Ue({
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
    },
    reward: {
      x: 4,
      y: -34
    },
    rest: {
      x: 0,
      y: 24
    },
    south_street: {
      x: 10,
      y: -38
    }
  },
  exits: [
    {
      id: "beacon",
      anchor: "beacon",
      to: "beacon",
      arrival: "hall"
    },
    {
      id: "cells",
      anchor: "cells",
      to: "cells",
      arrival: "hall"
    },
    {
      id: "south_street",
      anchor: "south_street",
      to: "south_street",
      arrival: "hall",
      condition: { all: sa }
    }
  ],
  objects: [
    {
      id: "orders",
      anchor: "orders",
      kind: "inspect",
      passage: "orders",
      condition: { all: ["warden_defeated"] }
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "warden"
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }
  ],
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
      x("west-wall", "wall", -39, 0, 2, 92, { height: 11 }),
      x("east-wall", "wall", 39, 0, 2, 92, { height: 11 }),
      x("north-wall", "wall", 0, -45, 80, 2, { height: 13 }),
      x("south-wall", "wall", 0, 45, 80, 2, { height: 8 }),
      x("western-front-column", "column", -15, 17, 4, 4, { height: 12 }),
      x("eastern-front-column", "column", 15, 17, 4, 4, { height: 12 }),
      x("western-middle-column", "column", -15, -3, 4, 4, { height: 12 }),
      x("eastern-middle-column", "column", 15, -3, 4, 4, { height: 12 }),
      x("western-rear-column", "column", -15, -25, 4, 4, { height: 12 }),
      x("eastern-rear-column", "column", 15, -25, 4, 4, { height: 12 }),
      x("entry-vault", "arch", 0, 17, 30, 2, { height: 14 }),
      x("rear-vault", "arch", 0, -25, 30, 2, { height: 14 }),
      x("west-gallery", "planter", -32, 4, 6, 28),
      x("east-gallery", "planter", 32, 4, 6, 28),
      x("west-gallery-bench", "bench", -28, 28, 2, 6),
      x("east-gallery-bench", "bench", 28, 28, 2, 6),
      x("crown-console", "ledger", 0, -41, 6, 4),
      x("northern-west-pillar", "column", -29, -35, 4, 4, { height: 14 }),
      x("northern-east-pillar", "column", 29, -35, 4, 4, { height: 14 })
    ]
  }
}), Xo = Ue({
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
    },
    reward: {
      x: 0,
      y: -20
    }
  },
  exits: [{
    id: "crossroads",
    anchor: "crossroads",
    to: "crossroads",
    arrival: "roots"
  }],
  objects: [{
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "roots"
  }],
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
      x("west-enclosure", "wall", -39, 0, 2, 84, { height: 3 }),
      x("east-enclosure", "wall", 39, 0, 2, 84, { height: 3 }),
      x("north-enclosure", "wall", 0, -41, 80, 2, { height: 4 }),
      x("south-enclosure", "wall", 0, 41, 80, 2, { height: 3 }),
      x("dead-heartwood", "root", 0, -29, 12, 10, { height: 17 }),
      x("western-root", "root", -22, -15, 8, 4, { height: 3.8 }),
      x("eastern-root", "root", 22, -11, 8, 4, { height: 3.2 }),
      x("west-reflecting-pool", "water", -26, 9, 12, 16),
      x("east-reflecting-pool", "water", 26, 9, 12, 16),
      x("west-old-colonnade", "ruin", -15, 7, 4, 4, { height: 5 }),
      x("east-old-colonnade", "ruin", 15, 9, 4, 4, { height: 4 }),
      x("western-growth", "thicket", -29, -27, 14, 12),
      x("eastern-growth", "thicket", 29, -27, 14, 12),
      x("west-entry-pillar", "column", -7, 30, 4, 4, { height: 7 }),
      x("east-entry-pillar", "column", 7, 30, 4, 4, { height: 7 }),
      x("garden-arch", "arch", 0, 30, 14, 2, { height: 9 }),
      x("west-entry-tree", "tree", -21, 29, 6, 6, {
        height: 12,
        tint: "rose"
      }),
      x("east-entry-tree", "tree", 23, 29, 6, 6, {
        height: 12,
        tint: "sage"
      }),
      x("west-north-tree", "tree", -18, -33, 6, 6, {
        height: 14,
        tint: "sage"
      }),
      x("east-north-tree", "tree", 18, -33, 6, 6, {
        height: 14,
        tint: "rose"
      })
    ]
  }
}), Jo = Object.fromEntries(Object.entries(Zn).map(([e, t]) => {
  const r = t, { width: a, depth: n } = r, s = a / 2, i = n / 2, c = [x("west-wall", "wall", -s + 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  }), x("east-wall", "wall", s - 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const o of ["north", "south"]) {
    const u = (o === "north" ? -1 : 1) * (i - 0.5);
    if (r.doors.some((h) => h.side === o)) {
      c.push(x(`${o}-door`, "door", 0, u, 4, 1));
      for (const h of [-1, 1]) c.push(x(`${o}-${h}`, "wall", h * (s + 2) / 2, u, s - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else c.push(x(`${o}-wall`, "wall", 0, u, a, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const l = r.rest ? r.furniture.find((o) => o.kind === "bed").footprint : null;
  return [e, Ue({
    id: e,
    safe: !0,
    anchors: {
      settle: {
        x: 0,
        y: 1
      },
      ...r.anchors,
      ...l ? { rest: {
        x: l.x + l.width / 2 + 1,
        y: l.z
      } } : {},
      ...Object.fromEntries(r.doors.map((o) => [o.side, {
        x: 0,
        y: (o.side === "north" ? -1 : 1) * (i - 2)
      }]))
    },
    exits: r.doors.map((o) => ({
      id: o.side,
      anchor: o.side,
      to: o.to,
      arrival: o.arrival,
      doorway: !0,
      ...o.condition ? { condition: o.condition } : {}
    })),
    objects: [...r.objects ?? [], ...l ? [{
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }] : []],
    landscape: {
      bounds: {
        x: 0,
        z: 0,
        width: a,
        depth: n
      },
      vista: "room",
      surface: "boards",
      roads: [],
      gates: [],
      features: [...c, ...r.furniture]
    }
  })];
})), ei = Ue({
  id: "south_street",
  safe: !0,
  anchors: {
    hall: {
      x: 0,
      y: 37
    },
    workshop_street: {
      x: 31,
      y: -4
    },
    heat_station: {
      x: 0,
      y: -37
    },
    wen_house: {
      x: -20,
      y: -22
    },
    audit_office: {
      x: -20,
      y: 7
    },
    south_inn: {
      x: 18,
      y: 19
    },
    notice: {
      x: 5,
      y: -18
    },
    tea: {
      x: 9,
      y: -14
    },
    stroll: {
      x: 6,
      y: 25
    },
    eaves: {
      x: -12,
      y: -22
    },
    rest: {
      x: -5,
      y: 23
    },
    reward: {
      x: 13,
      y: 23
    },
    deep_waterway: {
      x: 26,
      y: 33
    }
  },
  exits: [
    {
      id: "hall",
      anchor: "hall",
      to: "hall",
      arrival: "south_street"
    },
    {
      id: "workshop_street",
      anchor: "workshop_street",
      to: "workshop_street",
      arrival: "south_street"
    },
    {
      id: "heat_station",
      anchor: "heat_station",
      to: "heat_station",
      arrival: "south_street"
    },
    {
      id: "wen_house",
      anchor: "wen_house",
      to: "wen_house",
      arrival: "south",
      doorway: !0
    },
    {
      id: "audit_office",
      anchor: "audit_office",
      to: "audit_office",
      arrival: "south",
      doorway: !0
    },
    {
      id: "south_inn",
      anchor: "south_inn",
      to: "south_inn",
      arrival: "south",
      doorway: !0
    },
    {
      id: "deep_waterway",
      anchor: "deep_waterway",
      to: "deep_waterway",
      arrival: "south_street",
      condition: { all: ["deep_gate_opened"] }
    }
  ],
  objects: [
    {
      id: "heat_notice",
      anchor: "notice",
      kind: "inspect",
      passage: "heat_notice"
    },
    {
      id: "wen_walk",
      anchor: "eaves",
      kind: "inspect",
      passage: "wen_walk",
      condition: { all: ["wen_terms_heard"] }
    },
    {
      id: "anian_street",
      anchor: "stroll",
      kind: "inspect",
      passage: "anian_street",
      condition: { all: ["missing_name_agreed"] }
    },
    {
      id: "gate_tea",
      anchor: "tea",
      kind: "inspect",
      passage: "gate_tea",
      condition: {
        all: ["gate_book_agreed"],
        none: ["gate_tea_shared"]
      }
    },
    {
      id: "gate_allowed",
      anchor: "tea",
      kind: "inspect",
      passage: "gate_allowed",
      condition: { all: ["gate_cases_heard", "gate_tea_shared"] }
    },
    {
      id: "gate_home",
      anchor: "tea",
      kind: "inspect",
      passage: "gate_home",
      condition: { all: ["gate_responsibility_taken"] }
    },
    {
      id: "gate_home_review",
      anchor: "tea",
      kind: "inspect",
      passage: "gate_home",
      condition: { all: ["gate_review_agreed"] }
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "city_arrival"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 76,
      depth: 88
    },
    vista: "camp",
    surface: "street",
    gates: [],
    roads: [
      {
        points: [
          [0, 40],
          [0, 23],
          [-3, 7],
          [0, -12],
          [0, -40]
        ],
        width: 8
      },
      {
        points: [
          [-23, -22],
          [0, -22],
          [12, -5],
          [34, -5]
        ],
        width: 5
      },
      {
        points: [
          [-24, 7],
          [0, 7],
          [18, 19],
          [26, 33]
        ],
        width: 5
      }
    ],
    suspended: [
      {
        kind: "pipe",
        from: [
          -31,
          5,
          -36
        ],
        to: [
          31,
          5,
          -36
        ]
      },
      {
        kind: "washing",
        from: [
          16,
          6,
          27
        ],
        to: [
          31,
          6,
          27
        ]
      },
      {
        kind: "pipe",
        from: [
          -14,
          4,
          14
        ],
        to: [
          27,
          4,
          14
        ]
      }
    ],
    features: [
      x("wen-house", "dwelling", -20, -31, 20, 12, {
        height: 6.8,
        tint: "rose",
        entrance: !0,
        facing: "south"
      }),
      x("audit-house", "workshop", -20, 0, 18, 8, {
        height: 6,
        tint: "sage",
        entrance: !0,
        facing: "south"
      }),
      x("inn-house", "dwelling", 18, 10, 18, 12, {
        height: 6.8,
        tint: "amber",
        entrance: !0,
        facing: "south"
      }),
      x("north-homes", "dwelling", 24, -29, 20, 16, {
        height: 6.2,
        tint: "sage",
        facing: "west"
      }),
      x("south-homes", "dwelling", -25, 29, 20, 20, {
        height: 6.5,
        tint: "amber",
        facing: "east"
      }),
      x("tea-front", "workshop", -11, 21, 6, 8, {
        height: 3.6,
        tint: "rose",
        facing: "east"
      }),
      x("bread-stall", "workshop", 7, 30, 6, 4, {
        height: 3.2,
        tint: "amber",
        facing: "north"
      }),
      x("north-stall", "workshop", 8, -29, 6, 4, {
        height: 3.3,
        tint: "sage",
        facing: "south"
      }),
      x("street-planter", "planter", -8, 13, 2, 4),
      x("inn-laundry", "basin", 26, 19, 2, 2),
      x("hot-water-stall", "stove", 10, -18, 4, 4),
      x("notice-board", "ledger", 8, -24, 4, 2),
      x("tea-bench", "bench", -8, 26, 2, 2),
      x("stall-crates", "supplies", 13, 29, 4, 4),
      x("plane-tree", "tree", -11, -13, 4, 4, {
        height: 10,
        tint: "amber"
      }),
      x("street-arch", "arch", 0, 37, 14, 2, { height: 13 }),
      x("west-boundary", "wall", -37, 0, 2, 88, {
        height: 7,
        wallUse: "homes"
      }),
      x("east-boundary", "wall", 37, 0, 2, 88, {
        height: 7,
        wallUse: "homes"
      }),
      x("north-boundary", "wall", 0, -43, 76, 2, { height: 8 }),
      x("south-boundary", "wall", 0, 43, 76, 2, { height: 7 })
    ]
  }
}), ti = Ue({
  id: "workshop_street",
  safe: !0,
  anchors: {
    south_street: {
      x: -33,
      y: 14
    },
    heat_station: {
      x: 0,
      y: -35
    },
    coal_store: {
      x: 33,
      y: -3
    },
    workers_lodging: {
      x: 21,
      y: 20
    },
    transfer_office: {
      x: -20,
      y: -20
    },
    pipes: {
      x: 18,
      y: -15
    },
    echo: {
      x: 4,
      y: 31
    },
    rest: {
      x: -10,
      y: 16
    },
    reward: {
      x: -5,
      y: 26
    },
    deep_waterway: {
      x: 8,
      y: 35
    }
  },
  exits: [
    {
      id: "south_street",
      anchor: "south_street",
      to: "south_street",
      arrival: "workshop_street"
    },
    {
      id: "heat_station",
      anchor: "heat_station",
      to: "heat_station",
      arrival: "workshop_street"
    },
    {
      id: "coal_store",
      anchor: "coal_store",
      to: "coal_store",
      arrival: "workshop_street"
    },
    {
      id: "workers_lodging",
      anchor: "workers_lodging",
      to: "workers_lodging",
      arrival: "south",
      doorway: !0
    },
    {
      id: "deep_waterway",
      anchor: "deep_waterway",
      to: "deep_waterway",
      arrival: "workshop_street",
      condition: { all: ["deep_route_shared"] }
    },
    {
      id: "transfer_office",
      anchor: "transfer_office",
      to: "transfer_office",
      arrival: "south",
      doorway: !0
    }
  ],
  objects: [
    {
      id: "pipe_receipt",
      anchor: "pipes",
      kind: "inspect",
      passage: "pipe_receipt"
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "anian_bridge",
      anchor: "echo",
      kind: "inspect",
      passage: "anian_bridge",
      condition: { all: ["anian_street_shared"] }
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "city_arrival"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 80,
      depth: 84
    },
    vista: "camp",
    surface: "street",
    gates: [],
    roads: [
      {
        points: [
          [-36, 14],
          [-11, 14],
          [0, 3],
          [0, -37]
        ],
        width: 7
      },
      {
        points: [
          [-23, -20],
          [0, -20],
          [18, -15],
          [35, -3]
        ],
        width: 5
      },
      {
        points: [
          [0, 3],
          [7, 21],
          [24, 20]
        ],
        width: 5
      }
    ],
    suspended: [{
      kind: "pipe",
      from: [
        -34,
        6,
        -35
      ],
      to: [
        32,
        6,
        -35
      ]
    }, {
      kind: "washing",
      from: [
        16,
        5,
        34
      ],
      to: [
        -10,
        5,
        34
      ]
    }],
    features: [
      x("transfer-office", "workshop", -20, -29, 20, 12, {
        height: 6.5,
        tint: "sage",
        entrance: !0,
        facing: "south"
      }),
      x("dormitory", "dwelling", 21, 29, 20, 12, {
        height: 6.5,
        tint: "amber",
        entrance: !0,
        facing: "north"
      }),
      x("pipe-workshop", "workshop", 25, -27, 20, 14, {
        height: 7,
        tint: "amber",
        facing: "south"
      }),
      x("pipe-stock", "cargo", 23, -14, 4, 6),
      x("worktable", "workbench", 18, -7, 6, 2),
      x("western-homes", "dwelling", -26, -3, 18, 14, {
        height: 6.5,
        tint: "rose",
        facing: "east"
      }),
      x("southern-homes", "dwelling", -24, 30, 22, 12, {
        height: 6,
        tint: "sage",
        facing: "north"
      }),
      x("cobbler", "workshop", -12, -3, 6, 6, {
        height: 3.4,
        tint: "sage",
        facing: "east"
      }),
      x("workshop-fuel", "fuel", 9, -24, 4, 4),
      x("water-stove", "stove", -13, 20, 2, 2),
      x("bench", "bench", -12, 13, 4, 2),
      x("echo-water-north", "water", 0, 27, 6, 4),
      x("echo-water-south", "water", 0, 35, 6, 4),
      x("echo-bridge", "bridge", 0, 31, 10, 4),
      x("west-wall", "wall", -39, 0, 2, 84, {
        height: 7,
        wallUse: "homes"
      }),
      x("east-wall", "wall", 39, 0, 2, 84, {
        height: 7,
        wallUse: "homes"
      }),
      x("north-wall", "wall", 0, -41, 80, 2, { height: 10 }),
      x("south-wall", "wall", 0, 41, 80, 2, {
        height: 7,
        wallUse: "homes"
      })
    ]
  }
}), ai = Ue({
  id: "heat_station",
  safe: !0,
  anchors: {
    south_street: {
      x: -12,
      y: 29
    },
    workshop_street: {
      x: 22,
      y: 21
    },
    pipe_gallery: {
      x: 0,
      y: -28
    },
    notice: {
      x: -12,
      y: 10
    },
    plan: {
      x: 12,
      y: -7
    },
    foreman: {
      x: 12,
      y: -2
    },
    rest: {
      x: -16,
      y: -13
    },
    reward: {
      x: 12,
      y: -14
    }
  },
  exits: [
    {
      id: "south_street",
      anchor: "south_street",
      to: "south_street",
      arrival: "heat_station"
    },
    {
      id: "workshop_street",
      anchor: "workshop_street",
      to: "workshop_street",
      arrival: "heat_station"
    },
    {
      id: "pipe_gallery",
      anchor: "pipe_gallery",
      to: "pipe_gallery",
      arrival: "heat_station",
      condition: { all: ["return_plan_found"] }
    }
  ],
  objects: [
    {
      id: "heat_notice",
      anchor: "notice",
      kind: "inspect",
      passage: "heat_notice"
    },
    {
      id: "return_plan",
      anchor: "plan",
      kind: "inspect",
      passage: "return_plan",
      condition: { all: ["heat_notice_read", "pipes_traced"] }
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "return_plan"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 64,
      depth: 72
    },
    vista: "interior",
    surface: "paving",
    gates: [],
    roads: [{
      points: [
        [-12, 30],
        [-12, 12],
        [0, 0],
        [0, -30]
      ],
      width: 7
    }, {
      points: [
        [22, 22],
        [12, 5],
        [12, -14]
      ],
      width: 5
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -28,
        6,
        -20
      ],
      to: [
        28,
        6,
        -20
      ]
    }, {
      kind: "pipe",
      from: [
        -24,
        7,
        30
      ],
      to: [
        -24,
        7,
        -30
      ]
    }],
    features: [
      x("plan-table", "ledger", 18, -7, 6, 4),
      x("tool-rack", "toolrack", 22, -16, 6, 2),
      x("notice-desk", "ledger", -18, 10, 4, 2),
      x("bench", "bench", -20, -13, 2, 6),
      x("west-boiler", "tower", -20, -24, 8, 8, { height: 10 }),
      x("east-boiler", "tower", 20, -26, 10, 8, { height: 13 }),
      x("entry-column", "column", 7, 17, 4, 4, { height: 9 }),
      x("work-arch", "arch", 0, -22, 18, 2, { height: 12 }),
      x("west-wall", "wall", -31, 0, 2, 72, { height: 8 }),
      x("east-wall", "wall", 31, 0, 2, 72, { height: 8 }),
      x("north-wall", "wall", 0, -35, 64, 2, { height: 12 }),
      x("south-wall", "wall", 0, 35, 64, 2, { height: 7 })
    ]
  }
}), ni = Ue({
  id: "pipe_gallery",
  safe: !1,
  anchors: {
    heat_station: {
      x: 0,
      y: 29
    },
    sluice_bridge: {
      x: 0,
      y: -29
    },
    encounter: {
      x: 0,
      y: 16
    },
    guard: {
      x: -8,
      y: -7
    },
    archer: {
      x: 8,
      y: -17
    },
    flank: {
      x: 9,
      y: 4
    },
    bomber: {
      x: -9,
      y: -19
    },
    trial: {
      x: 0,
      y: -24
    }
  },
  exits: [{
    id: "heat_station",
    anchor: "heat_station",
    to: "heat_station",
    arrival: "pipe_gallery"
  }, {
    id: "sluice_bridge",
    anchor: "sluice_bridge",
    to: "sluice_bridge",
    arrival: "pipe_gallery",
    condition: { all: ["gallery_cleared"] }
  }],
  objects: [{
    id: "return_trial",
    anchor: "trial",
    kind: "inspect",
    passage: "return_trial",
    condition: {
      all: ["gallery_cleared"],
      none: ["heat_restored"]
    }
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 48,
      depth: 72
    },
    vista: "interior",
    surface: "wet",
    gates: [],
    roads: [{
      points: [
        [0, 31],
        [0, 17],
        [-8, 3],
        [0, -12],
        [0, -31]
      ],
      width: 6
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -17,
        5,
        31
      ],
      to: [
        -17,
        5,
        -31
      ]
    }, {
      kind: "pipe",
      from: [
        17,
        7,
        31
      ],
      to: [
        17,
        7,
        -31
      ]
    }],
    features: [
      x("west-wall", "wall", -23, 0, 2, 72, { height: 9 }),
      x("east-wall", "wall", 23, 0, 2, 72, { height: 9 }),
      x("north-wall", "wall", 0, -35, 48, 2, { height: 9 }),
      x("south-wall", "wall", 0, 35, 48, 2, { height: 9 }),
      x("west-block", "column", -14, 9, 4, 6, { height: 7 }),
      x("east-block", "column", 13, -7, 4, 6, { height: 7 }),
      x("west-water", "water", -20, -9, 2, 40),
      x("east-water", "water", 20, 9, 2, 40),
      x("entry-arch", "arch", 0, 25, 20, 2, { height: 9 })
    ]
  }
}), ri = Ue({
  id: "sluice_bridge",
  safe: !1,
  anchors: {
    pipe_gallery: {
      x: 0,
      y: 30
    },
    main_valve: {
      x: 0,
      y: -30
    },
    encounter: {
      x: 0,
      y: 17
    },
    guard: {
      x: 0,
      y: -7
    },
    left: {
      x: -10,
      y: -16
    },
    right: {
      x: 10,
      y: -16
    },
    reward: {
      x: 7,
      y: -26
    },
    rest: {
      x: -7,
      y: 25
    }
  },
  exits: [{
    id: "pipe_gallery",
    anchor: "pipe_gallery",
    to: "pipe_gallery",
    arrival: "sluice_bridge"
  }, {
    id: "main_valve",
    anchor: "main_valve",
    to: "main_valve",
    arrival: "sluice_bridge",
    condition: { all: ["bridge_cleared"] }
  }],
  objects: [{
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }, {
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "bridge"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 60,
      depth: 76
    },
    vista: "ramparts",
    surface: "paving",
    gates: [],
    roads: [{
      points: [[0, 33], [0, -33]],
      width: 10
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -27,
        5,
        -23
      ],
      to: [
        27,
        5,
        -23
      ]
    }],
    features: [
      x("west-channel", "water", -23, 0, 10, 60),
      x("east-channel", "water", 23, 0, 10, 60),
      x("west-pier", "column", -12, 4, 4, 4, { height: 7 }),
      x("east-pier", "column", 12, -5, 4, 4, { height: 7 }),
      x("west-wall", "wall", -29, 0, 2, 76, { height: 6 }),
      x("east-wall", "wall", 29, 0, 2, 76, { height: 6 }),
      x("north-wall", "wall", 0, -37, 60, 2, { height: 7 }),
      x("south-wall", "wall", 0, 37, 60, 2, { height: 7 }),
      x("bridge-arch", "arch", 0, -22, 28, 2, { height: 13 })
    ]
  }
}), si = Ue({
  id: "main_valve",
  safe: !1,
  anchors: {
    sluice_bridge: {
      x: 0,
      y: 34
    },
    encounter: {
      x: 0,
      y: 18
    },
    keeper: {
      x: 0,
      y: -12
    },
    left: {
      x: -18,
      y: -17
    },
    right: {
      x: 18,
      y: -17
    },
    valve: {
      x: 0,
      y: -31
    },
    reward: {
      x: 10,
      y: -29
    },
    rest: {
      x: -10,
      y: 28
    }
  },
  exits: [{
    id: "sluice_bridge",
    anchor: "sluice_bridge",
    to: "sluice_bridge",
    arrival: "main_valve"
  }],
  objects: [
    {
      id: "heat_return",
      anchor: "valve",
      kind: "inspect",
      passage: "heat_return",
      condition: {
        all: ["heatkeeper_defeated"],
        none: ["heat_restored"]
      }
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "heatkeeper"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 68,
      depth: 84
    },
    vista: "interior",
    surface: "paving",
    gates: [],
    roads: [{
      points: [[0, 37], [0, -33]],
      width: 10
    }, {
      points: [
        [-20, 15],
        [-20, -23],
        [20, -23],
        [20, 15]
      ],
      width: 5
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -27,
        7,
        -32
      ],
      to: [
        27,
        7,
        -32
      ]
    }, {
      kind: "pipe",
      from: [
        -28,
        6,
        25
      ],
      to: [
        28,
        6,
        25
      ]
    }],
    features: [
      x("main-console", "ledger", 0, -37, 10, 4),
      x("left-cylinder", "tower", -26, -29, 8, 12, { height: 14 }),
      x("right-cylinder", "tower", 26, -29, 8, 12, { height: 14 }),
      x("west-cover", "column", -12, 0, 4, 6, { height: 8 }),
      x("east-cover", "column", 12, 0, 4, 6, { height: 8 }),
      x("west-wall", "wall", -33, 0, 2, 84, { height: 12 }),
      x("east-wall", "wall", 33, 0, 2, 84, { height: 12 }),
      x("north-wall", "wall", 0, -41, 68, 2, { height: 14 }),
      x("south-wall", "wall", 0, 41, 68, 2, { height: 9 })
    ]
  }
}), oi = Ue({
  id: "deep_waterway",
  safe: !0,
  anchors: {
    kouzi_home: {
      x: 0,
      y: 29
    },
    south_street: {
      x: 0,
      y: -29
    },
    workshop_street: {
      x: 16,
      y: -18
    },
    receipt: {
      x: -9,
      y: 2
    },
    winch: {
      x: -3,
      y: -19
    }
  },
  exits: [
    {
      id: "kouzi_home",
      anchor: "kouzi_home",
      to: "kouzi_home",
      arrival: "north"
    },
    {
      id: "south_street",
      anchor: "south_street",
      to: "south_street",
      arrival: "deep_waterway",
      condition: { all: ["deep_gate_opened"] }
    },
    {
      id: "workshop_street",
      anchor: "workshop_street",
      to: "workshop_street",
      arrival: "deep_waterway",
      condition: { all: ["deep_route_shared"] }
    }
  ],
  objects: [{
    id: "deep_receipt",
    anchor: "receipt",
    kind: "inspect",
    passage: "deep_receipt"
  }, {
    id: "deep_gate",
    anchor: "winch",
    kind: "inspect",
    passage: "deep_gate",
    condition: { all: ["deep_route_agreed"] }
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 48,
      depth: 72
    },
    vista: "interior",
    surface: "wet",
    gates: [{
      id: "deep_gate",
      footprint: {
        x: 0,
        z: -25,
        width: 44,
        depth: 2
      },
      condition: { all: ["deep_gate_opened"] }
    }],
    roads: [{
      points: [
        [0, 31],
        [-7, 13],
        [-7, 0],
        [0, -13],
        [0, -31]
      ],
      width: 5
    }, {
      points: [[0, -18], [17, -18]],
      width: 4
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -19,
        4,
        30
      ],
      to: [
        -19,
        4,
        -30
      ]
    }],
    features: [
      x("trade-box", "supplies", -14, 2, 4, 4),
      x("water", "water", 9, 7, 8, 24),
      x("winch", "toolrack", -7, -23, 4, 2),
      x("west-ruin", "ruin", -14, -15, 6, 8, { height: 5 }),
      x("east-ruin", "ruin", 15, -29, 10, 6, { height: 5 }),
      x("south-column", "column", 10, 25, 4, 4, { height: 7 }),
      x("west-wall", "wall", -23, 0, 2, 72, { height: 7 }),
      x("east-wall", "wall", 23, 0, 2, 72, { height: 7 }),
      x("north-wall", "wall", 0, -35, 48, 2, { height: 7 }),
      x("south-wall", "wall", 0, 35, 48, 2, { height: 7 })
    ]
  }
}), ii = Ue({
  id: "coal_store",
  safe: !1,
  anchors: {
    workshop_street: {
      x: 0,
      y: 29
    },
    encounter: {
      x: 0,
      y: 13
    },
    guard: {
      x: 0,
      y: -6
    },
    archer: {
      x: -13,
      y: -18
    },
    bomber: {
      x: 13,
      y: -18
    },
    flank: {
      x: 13,
      y: 5
    },
    reward: {
      x: 0,
      y: -27
    }
  },
  exits: [{
    id: "workshop_street",
    anchor: "workshop_street",
    to: "workshop_street",
    arrival: "coal_store"
  }],
  objects: [{
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "coal_store"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 60,
      depth: 72
    },
    vista: "interior",
    surface: "paving",
    gates: [],
    roads: [{
      points: [[0, 31], [0, -28]],
      width: 8
    }],
    features: [
      x("west-fuel", "fuel", -23, -9, 8, 30),
      x("east-fuel", "fuel", 23, -9, 8, 30),
      x("cover", "cargo", -9, 2, 4, 4),
      x("north-fuel", "fuel", 0, -32, 18, 4),
      x("west-wall", "wall", -29, 0, 2, 72, { height: 7 }),
      x("east-wall", "wall", 29, 0, 2, 72, { height: 7 }),
      x("north-wall", "wall", 0, -35, 60, 2, { height: 9 }),
      x("south-wall", "wall", 0, 35, 60, 2, { height: 7 })
    ]
  }
}), li = {
  south_street: ei,
  workshop_street: ti,
  heat_station: ai,
  pipe_gallery: ni,
  sluice_bridge: ri,
  main_valve: si,
  deep_waterway: oi,
  coal_store: ii
}, Oe = {
  wenshoutong: {
    name: "文守桐",
    scene: "wen_house",
    anchor: "host",
    coat: "cream",
    greeting: `我将茶杯往你面前挪了挪，手在杯沿旁停住。
「路上冷，先暖一暖。来找三娘的事，还是有别的事要同我说？」`,
    clothing: {
      outer: "灰青细呢长衫，内搭米白立领衬衫，袖口熨平",
      lower: "深灰直筒呢长裤",
      inner: "本白细棉长袖汗衫",
      underpants: "本白细棉短平角内裤，侧腰系带",
      shoes: "黑色系带软皮鞋",
      socks: "深灰棉线中筒袜"
    }
  },
  chenhe: {
    name: "陈禾",
    scene: "workers_lodging",
    anchor: "worker",
    coat: "blue",
    greeting: `我把针插回线团，拇指按住袖口还没收好的线。
「找谁？我今天没在工场值班……要查工牌的话，就在铺边。」`,
    clothing: {
      outer: "褪成灰蓝的短工衣，袖口有同色补布",
      lower: "深褐厚棉工裤，膝部磨白",
      inner: "本色棉布无袖汗衫",
      underpants: "灰白棉布短平角内裤，布带腰头",
      shoes: "旧褐色厚底工作鞋",
      socks: "深灰棉袜，后跟补过"
    }
  },
  qinzhi: {
    name: "秦芷",
    scene: "transfer_office",
    anchor: "clerk",
    coat: "rose",
    greeting: `我把正抄着的那一行点了个墨记，搁下笔。
「哪一年的工牌？先说名字，我翻底簿。要改记录，得把原凭据一道摆出来。」`,
    clothing: {
      outer: "灰紫窄袖短袄，米白立领衫，袖口系护袖",
      lower: "深灰及踝长裙",
      inner: "本白细棉短背心，前襟小扣",
      underpants: "本白棉布短平角内裤，松紧腰头",
      shoes: "黑色一字带布鞋",
      socks: "浅灰棉线及膝袜"
    }
  },
  liangyoufang: {
    name: "梁有方",
    scene: "audit_office",
    anchor: "clerk",
    coat: "cream",
    greeting: `我翻过门簿，留出桌前空着的一截，抬眼看你。
「是来补签，还是查旧账？人名和过门的日子，记得多少说多少。」`,
    clothing: {
      outer: "灰褐呢制服外套，内搭白色翻领衬衫",
      lower: "深褐直筒制服裤",
      inner: "本白棉布圆领汗衫",
      underpants: "本白棉布短平角内裤，抽带腰头",
      shoes: "黑色低帮皮鞋",
      socks: "深灰细棉中筒袜"
    }
  },
  chengtiesheng: {
    name: "程铁生",
    scene: "heat_station",
    anchor: "foreman",
    coat: "blue",
    greeting: `我拿布擦去指节上的黑油，侧身给你让出看图的位置。
「别靠那根热管。找管工？我就是。先说哪儿漏，哪儿不热。」`,
    clothing: {
      outer: "靛蓝厚帆布工装，铜扣，袖口卷起",
      lower: "深蓝宽腿工裤，系牛皮工具腰带",
      inner: "本白棉布短袖汗衫",
      underpants: "深灰细棉短平角内裤",
      shoes: "棕色厚底系带工靴",
      socks: "灰褐厚棉袜"
    }
  }
}, pa = Object.keys(Oe), Vn = {
  camp: Wo,
  crossroads: Ho,
  gate: Vo,
  beacon: Yo,
  waterway: Go,
  cells: Qo,
  hall: Ko,
  roots: Xo,
  ...Jo,
  ...li
};
for (const e of pa) {
  const { scene: t, anchor: r } = Oe[e], a = Vn[t];
  Vn[t] = Ue({
    ...a,
    objects: [...a.objects, {
      id: e,
      anchor: r,
      kind: "resident",
      person: e
    }]
  });
}
var be = Vn;
function Pr(e) {
  return !e || be[e.location.scene].safe && e.phase === "exploration";
}
var _t = {
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
function Ln(e, t) {
  const r = _t[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || r.achievement !== null && e.awards.some((a) => a.key === r.achievement);
}
var xe = (e, t, r = 0) => ({
  family: e,
  chapter: r,
  ...t ? { requires: [t] } : {}
}), ie = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), Ca = {
  "storm-step": xe("storm"),
  conductor: xe("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: xe("storm"),
  cinder: xe("fire"),
  wildfire: xe("fire", ["cinder", "inferno"]),
  "blood-price": xe("risk"),
  frost: xe("frost"),
  shatter: xe("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: xe("skill"),
  hunter: {
    ...xe("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: xe("blade"),
  orbit: xe("storm"),
  thorns: xe("guard"),
  aegis: xe("guard"),
  siphon: xe("life"),
  focus: xe("skill"),
  renewal: xe("life"),
  execution: xe("blade"),
  "last-stand": xe("guard", void 0, 1),
  quicksilver: xe("skill"),
  magnet: xe("skill"),
  wardstone: xe("guard"),
  pilgrim: xe("life"),
  gambit: xe("risk", void 0, 1),
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
}, O = (e, t) => e.relics.find((r) => r.id === t)?.rank ?? 0;
function ci(e) {
  return fs.filter((t) => !Ca[t].weapons || Ca[t].weapons.includes(e));
}
function Ss(e, t, r = null) {
  const a = Ca[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((s) => s !== r && O(e, s) > 0)));
}
var qt = Math.PI * 2, Q = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), ce = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), ur = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Je = (e, t, r) => ({
  x: e.x + Math.cos(t) * r,
  y: e.y + Math.sin(t) * r
});
function rt(e, t, r, a, n, s) {
  if (s) {
    dr(s.space, t, {
      x: Math.cos(r) * a,
      y: Math.sin(r) * a
    }, n);
    return;
  }
  t.x += Math.cos(r) * a, t.y += Math.sin(r) * a;
  for (const i of e.obstacles) {
    const c = Q(t, i), l = n + i.radius;
    if (c < l) {
      const o = c < 1e-3 ? r : ce(i, t);
      t.x = i.x + Math.cos(o) * l, t.y = i.y + Math.sin(o) * l;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function di(e, t, r, a) {
  const n = e.x - t.x, s = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(r) + s * Math.sin(r)));
  return Math.hypot(n - Math.cos(r) * i, s - Math.sin(r) * i);
}
var ui = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], On = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function da(e, t, r, a) {
  if (!Rt(e, t, a) || !Rt(e, r, a)) return null;
  if (Ne(e, t, r, a)) return [{ ...r }];
  const { map: n, columns: s, rows: i } = e, c = ca(n, t), l = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), h = [];
  function d(m) {
    return ia(n, m % s, Math.floor(m / s));
  }
  function f(m, y, b, w) {
    if (m < 0 || m >= s || y < 0 || y >= i) return;
    const k = y * s + m;
    u.has(k) || (l.get(k) ?? 1 / 0) <= b || (l.set(k, b), o.set(k, w), h.push({
      id: k,
      score: b + On(d(k), r)
    }));
  }
  for (let m = -1; m <= 1; m++) for (let y = -1; y <= 1; y++) {
    const b = c.column + y, w = c.row + m, k = ia(n, b, w);
    Ne(e, t, k, a) && f(b, w, On(t, k), -1);
  }
  for (; h.length; ) {
    h.sort((b, w) => w.score - b.score || w.id - b.id);
    const { id: m } = h.pop();
    if (u.has(m)) continue;
    u.add(m);
    const y = d(m);
    if (Ne(e, y, r, a)) {
      const b = [{ ...r }];
      let w = m;
      for (; w !== -1; )
        b.push(d(w)), w = o.get(w);
      b.reverse();
      const k = [];
      let C = t;
      for (let v = 0; v < b.length; ) {
        let R = v;
        for (; R + 1 < b.length && Ne(e, C, b[R + 1], a); ) R++;
        C = b[R], k.push(C), v = R + 1;
      }
      return k;
    }
    for (const [b, w] of ui) {
      const k = m % s + b, C = Math.floor(m / s) + w, v = ia(n, k, C);
      Ne(e, y, v, a) && f(k, C, l.get(m) + On(y, v), m);
    }
  }
  return null;
}
var Er = (e) => !Ce(e) || [
  "warden",
  "thornheart",
  "keeper",
  "bridgekeeper",
  "heatkeeper"
].includes(e), $r = /* @__PURE__ */ new WeakMap();
function Rs(e, t) {
  let r = $r.get(e);
  r || (r = /* @__PURE__ */ new WeakMap(), $r.set(e, r));
  let a = r.get(t);
  return a || (a = {
    ...e,
    blocked(n, s) {
      const i = ia(e.map, n, s);
      return i.x < t.left || i.x > t.right || i.y < t.top || i.y > t.bottom || e.blocked(n, s);
    }
  }, r.set(t, a)), a;
}
var oe = (e, t, r, a = 0) => !e || Ne(e.space, t, r, a);
function Pa(e, t, r, a, n) {
  let s = 0;
  for (let i = 0.2; i <= a + 0.2; i += 0.2) {
    const c = Math.min(i, a), l = {
      x: t.x + Math.cos(r) * c,
      y: t.y + Math.sin(r) * c
    };
    if (!Ne(e.space, t, l, n)) break;
    s = c;
  }
  return s;
}
function hi(e, t, r) {
  return e.summonPoints.filter((a) => Rt(e.space, a, r) && da(e.space, e.entry, a, r)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Cs(e, t, r) {
  return !e || Ne(e.space, t, r, 0.3) ? r : {
    x: t.x,
    y: t.y
  };
}
function hr(e, t, r, a) {
  if (!e) return Math.atan2(r.y - t.y, r.x - t.x);
  let n = r;
  if (!Rt(e.space, n, a)) {
    const i = [], c = a + e.space.map.cellSize, l = ca(e.space.map, {
      x: r.x - c,
      y: r.y - c
    }), o = ca(e.space.map, {
      x: r.x + c,
      y: r.y + c
    });
    for (let h = Math.max(0, l.row); h <= Math.min(e.space.rows - 1, o.row); h++) for (let d = Math.max(0, l.column); d <= Math.min(e.space.columns - 1, o.column); d++) {
      const f = ia(e.space.map, d, h);
      Math.hypot(f.x - r.x, f.y - r.y) <= a + e.space.map.cellSize && Rt(e.space, f, a) && Ne(e.space, f, r) && i.push(f);
    }
    i.sort((h, d) => Math.hypot(h.x - r.x, h.y - r.y) - Math.hypot(d.x - r.x, d.y - r.y));
    const u = i.find((h) => da(e.space, t, h, a));
    if (!u) return null;
    n = u;
  }
  const s = da(e.space, t, n, a);
  return s?.length ? Math.atan2(s[0].y - t.y, s[0].x - t.x) : null;
}
function we(e, t, r, a = 1, n = 0) {
  e.effects.push({
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: r,
    size: a,
    angle: n,
    life: r === "slash" ? 9 : 15
  });
}
function Le(e, t, r, a, n = !1) {
  if (!Ce(t) && e.enemies.filter((l) => l.hp > 0).length >= (a?.enemyLimit ?? K.maxEnemies)) return null;
  if (a && !n) {
    const l = hi(a, r, he[t].radius);
    if (!l) return null;
    r = l;
  }
  const s = he[t], i = (a?.segment && t === "warden" ? ze.wardenHp : a?.segment && t === "thornheart" ? ze.heartHp : a?.segment && t === "keeper" ? ze.keeperHp : s.hp) * (Ce(t) ? 1 : (1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)) * (a?.segment ? ze.mobHp : 1)), c = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: i,
    maxHp: i,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(bn(e) * 20),
    windup: 0,
    target: { ...r },
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
    controlRecovery: 0,
    memory: []
  };
  return e.enemies.push(c), c;
}
function It(e, t, r, a, n, s = {}) {
  const i = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    angle: r,
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
    ...s
  };
  return e.shots.push(i), i;
}
function fe(e, t, r, a, n, s, i, c = !1, l = {}) {
  const o = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: r,
    radius: a,
    wait: n,
    life: s,
    damage: i,
    friendly: c,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: c ? "passive" : "attack",
    hits: [],
    ...l
  };
  return e.hazards.push(o), o;
}
function Qe(e, t, r, a, n) {
  return fe(e, t, "slam", r, a, 8, n);
}
function Re(e, t, r, a, n, s, i) {
  return fe(e, t, "beam", 0, s, 9, i, !1, {
    angle: r,
    length: a,
    width: n
  });
}
function xt(e, t, r, a, n, s, i = 0.22) {
  for (let c = 0; c < a; c++) It(e, t, r + (a === 1 ? 0 : c / (a - 1) - 0.5) * n, s, !1, { speed: i });
}
function Ir(e, t, r, a, n, s = 0.16) {
  for (let i = 0; i < r; i++) It(e, t, a + i * qt / r, n, !1, { speed: s });
}
function Yn(e, t, r, a, n = 0) {
  const s = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: t === "turret" ? 65 : t === "familiar" ? kt.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(s), s;
}
var rn = (e) => e === "attack" || e === "skill";
function Ps(e, t) {
  if (e.player.hp <= 0) return;
  const r = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += r, r > 0 && we(e, e.player, "heal");
}
function At(e, t, r) {
  if (Ce(t.kind)) {
    if (t.controlRecovery > 0 || (t.stagger += r, t.stagger < 100)) return;
    t.stagger = 0, r = 24, t.controlRecovery = ze.bossControlRecovery;
  }
  t.stun = Math.max(t.stun, r), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), we(e, t, "guard", 1.4);
}
function tt(e, t, r, a, n, s = e.player, i) {
  if (t.hp <= 0 || !oe(i, s, t)) return;
  const c = t.burn > 0 || rn(n) && O(a, "cinder") > 0, l = t.chill > 0 || rn(n) && O(a, "frost") > 0, o = (n === "skill" || n === "companion" && a.weapon === "cannon") && l && O(a, "shatter") > 0, u = rn(n) && c && l && O(a, "overload") > 0;
  let h = r * (O(a, "blood-price") ? et.bloodDamage + (O(a, "blood-price") - 1) * 0.12 : 1);
  if (O(a, "execution") && t.hp / t.maxHp < et.executeThreshold && (h *= et.executeDamage + (O(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden" && hs(t.phase)) && n === "attack" && Math.cos(ce(t, s) - t.angle) > 0.4 && t.exposed <= 0 && (h *= O(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !Ce(t.kind) && e.enemies.some((d) => d.kind === "priest" && d.hp > 0 && Q(t, d) < 3.5 && oe(i, t, d)) && (h *= 0.7), n === "attack" && O(a, "backstab") && Math.cos(ce(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + O(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && O(a, "duelist") && At(e, t, 9 * O(a, "duelist")), o) {
    h += 15 * O(a, "shatter"), t.chill = 0, we(e, t, "burst", 2.2);
    for (const d of e.enemies) d.id !== t.id && Q(t, d) < 2.2 && tt(e, d, 9 * O(a, "shatter"), a, "passive", t, i);
  }
  if (rn(n) && (O(a, "cinder") && (t.burn = Math.max(t.burn, 80 + O(a, "cinder") * 25)), O(a, "frost") && (t.chill = Math.max(t.chill, 45 + O(a, "frost") * 20)), (O(a, "blood-dance") || O(a, "hemorrhage")) && (t.bleed = 100 + 25 * (O(a, "blood-dance") + O(a, "hemorrhage"))), O(a, "venom") && (t.poison = 100 + O(a, "venom") * 35), u && (h += 20 * O(a, "overload"), we(e, t, "lightning")), n === "skill" && O(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + O(a, "hunter-mark") * 40)), O(a, "inferno") && c && n === "skill" && fe(e, t, "fire", 1.5 + O(a, "inferno") * 0.3, 0, 70, 4 * O(a, "inferno"), !0)), u && (t.burn = 0), (u || o) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && O(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - O(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, we(e, t, "burst", Ce(t.kind) ? 3 : 0.8), O(a, "wildfire") && c && fe(e, t, "fire", 1.8 + O(a, "wildfire") * 0.2, 0, 90, 3 * O(a, "wildfire"), !0), O(a, "fracture") && l) for (let d = 0; d < 4 + O(a, "fracture"); d++) It(e, t, d * qt / (4 + O(a, "fracture")), 9, !0, { source: "passive" });
    if (O(a, "siphon") && (e.kills % et.siphonEvery === 0 || Ce(t.kind)) && Ps(e, (Ce(t.kind) ? et.siphonBossHeal : et.siphonHeal) + O(a, "siphon") - 1), O(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * O(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), O(a, "soul-harvest") && (e.player.resource = Math.min(kt.maxPower, e.player.resource + 9 * O(a, "soul-harvest"))), n === "companion" && O(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * O(a, "salvage"))), O(a, "magnet"))
      for (const d of e.enemies) d.hp > 0 && Q(t, d) < 3 + O(a, "magnet") && oe(i, t, d) && rt(e, d, ce(d, t), 0.7, he[d.kind].radius, i);
  }
}
function Gn(e, t, r, a, n, s = e.player) {
  const i = [t];
  if (oe(n, s, t)) {
    O(r, "conductor") && i.push(...e.enemies.filter((c) => c.id !== t.id && c.hp > 0 && Q(c, t) < 4.5 && oe(n, t, c)).sort((c, l) => Q(c, t) - Q(l, t)).slice(0, O(r, "conductor") + 1));
    for (const c of i)
      we(e, c, "lightning"), tt(e, c, a, r, "lightning", n ? c === t ? s : t : e.player, n);
  }
}
function Es(e, t, r) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), we(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const s = O(t, "riposte"), i = O(t, "thorns");
  if (s || i)
    for (const c of e.enemies) Q(c, a) < 3.2 + s * 0.3 && oe(r, a, c) && (tt(e, c, (n ? 20 : 8) * s + 9 * i, t, "passive", a, r), At(e, c, n ? 20 : 7));
}
function wn(e, t, r, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Es(e, r, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let s = t * Wt[r.weapon].guard * (O(r, "blood-price") ? et.bloodHurt : 1) * (O(r, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, s);
  if (n.ward -= i, s -= i, n.hp <= s && O(r, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + O(r, "last-stand") * 8, n.invulnerable = 60, we(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - s), e.damageTaken += s, n.invulnerable = 18, n.lastHit = e.tick, we(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), O(r, "thorns"))
    for (const c of e.enemies) Q(c, n) < 3 && tt(e, c, 10 * O(r, "thorns"), r, "passive", n, a);
}
function Ba(e, t, r = 45) {
  e.ward += Math.max(0, Math.min(t, r - e.ward));
}
function Ar(e, t, r, a = !1, n) {
  const s = Wt[t.weapon], i = e.player, c = ce(i, r), l = (a ? 0.6 : 1) * (O(t, "gambit") ? 1 + O(t, "gambit") * 0.12 : 1);
  if (i.facing = c, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const d = s.range + O(t, "piercing") * 0.25;
    we(e, i, "slash", d, c);
    for (const f of e.enemies)
      Q(i, f) > d + he[f.kind].radius || Math.cos(ce(i, f) - c) < -0.1 || !oe(n, i, f) || (tt(e, f, s.damage * l, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && At(e, f, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), O(t, "cleave-wave") && i.combo % 3 === 2 && It(e, i, c, 14 * O(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let o = s.damage * l;
  O(t, "distance-draw") && (o *= 1 + Math.min(1, Q(i, r) / 8) * 0.15 * O(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(kt.maxPower, i.resource + 12));
  const u = O(t, "piercing") * et.extraPierce + O(t, "railgun") * 2, h = It(e, i, c, o, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + O(t, "shrapnel") * 0.3 : 0,
    bounce: O(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && O(t, "split-arrow") && i.combo % 3 === 2) for (const d of [-0.18, 0.18]) It(e, i, c + d, o * (0.35 + O(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: u
  });
}
function pi(e, t, r, a) {
  const n = e.player, s = Wt[t.weapon], i = O(t, "focus");
  switch (n.skill = Math.round(s.skillCooldown * (i ? et.focusSkill - (i - 1) * 0.06 : 1)), O(t, "aegis") && (n.shield = 18 + O(t, "aegis") * 6, n.guard = 8, Ba(n, O(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + O(t, "aegis") * 6, n.guard = 9;
      const c = 1 + n.resource / 100;
      n.resource = 0, we(e, n, "slash", 3.6, n.facing);
      for (const l of e.enemies)
        l.hp <= 0 || Q(n, l) > 3.6 + he[l.kind].radius || !oe(a, n, l) || (O(t, "shield-break") && (l.exposed = Math.max(l.exposed, 70 + 30 * O(t, "shield-break"))), tt(e, l, s.skill * c, t, "skill", n, a), At(e, l, 40), Ce(l.kind) || rt(e, l, ce(n, l), 1.5, he[l.kind].radius, a));
      O(t, "valor") && Ba(n, 12 * O(t, "valor") * c);
      break;
    }
    case "bow":
      for (let c = -2; c <= 2; c++) It(e, n, n.facing + c * 0.15, s.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      rt(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const c = r ?? n, l = 1 + n.resource / 125;
      if (n.resource = 0, O(t, "convergence"))
        for (const o of e.enemies) Q(o, c) < 4 + O(t, "convergence") && oe(a, c, o) && rt(e, o, ce(o, c), 1.2, he[o.kind].radius, a);
      for (let o = 0; o < 3; o++) {
        const u = Je(c, o * qt / 3, 0.7);
        fe(e, oe(a, c, u) ? u : c, "slam", 2.3, 10 + o * 10, 1, s.skill * l, !0, { source: "skill" });
      }
      if (O(t, "nova")) {
        fe(e, n, "frost", 3 + O(t, "nova") * 0.5, 0, 32, 6 * O(t, "nova"), !0, { source: "skill" });
        for (const o of e.enemies) Q(n, o) < 3.5 && oe(a, n, o) && (o.chill = 120, At(e, o, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), r) {
        const c = Je(r, r.angle + Math.PI, he[r.kind].radius + 0.55);
        rt(e, n, ce(n, c), Math.min(5, Q(n, c)), K.playerRadius, a), n.facing = ce(n, r), oe(a, n, r) && (!a || Q(n, r) <= s.range + he[r.kind].radius) && (r.exposed = Math.max(r.exposed, 60), tt(e, r, s.skill, t, "skill", n, a), At(e, r, 20)), we(e, n, "slash", 2, n.facing);
      }
      O(t, "shadowstep") && Yn(e, "shade", n, 95 + O(t, "shadowstep") * 30, O(t, "shadowstep"));
      break;
    case "grimoire": {
      const c = n.resource;
      n.resource = 0, n.resonance = kt.resonanceTicks + c, we(e, n, "resonance", 2);
      for (const l of e.companions) l.kind === "familiar" && l.hp > 0 && l.life > 0 && (l.hp = Math.max(l.hp, kt.familiarHp), l.cooldown = 0);
      r && (r.exposed = Math.max(r.exposed, 100), tt(e, r, s.skill + c * 0.3, t, "skill", n, a)), O(t, "command") && fe(e, r ?? n, "storm", 2.4 + O(t, "command") * 0.3, 10, 65, 7 * O(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const c = 1 + (O(t, "overclock") >= 2 ? 1 : 0), l = e.companions.filter((o) => o.kind === "turret");
      l.length >= c && (l[0].life = 0), Yn(e, "turret", Cs(a, n, Je(n, n.facing, 0.9)), 240 + O(t, "overclock") * 45, O(t, "overclock")), O(t, "bunker") && Ba(n, 15 * O(t, "bunker"));
      break;
    }
  }
}
function fi(e, t, r, a) {
  const n = e.player, s = O(r, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - s * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? ur(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, O(r, "storm-step") && fe(e, n, "storm", 1.7 + O(r, "storm-step") * 0.15, 0, 70, 6 + O(r, "storm-step") * 3, !0), O(r, "trapper") && fe(e, n, "frost", 1.8, 12, 110, 5 * O(r, "trapper"), !0), O(r, "minefield") && fe(e, n, "mine", 2 + O(r, "minefield") * 0.2, 12, 180, 25 * O(r, "minefield"), !0), O(r, "smoke")) {
    for (const i of e.enemies) Q(i, n) < 3 + O(r, "smoke") * 0.4 && oe(a, n, i) && (At(e, i, 30 + O(r, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    we(e, n, "guard", 3);
  }
}
function mi(e, t, r, a) {
  const n = e.player;
  for (const o of [
    "attack",
    "dash",
    "skill",
    "invulnerable",
    "swing",
    "shield",
    "guard"
  ]) n[o] = Math.max(0, n[o] - 1);
  const s = e.enemies.filter((o) => o.hp > 0 && oe(a, n, o)).sort((o, u) => Q(n, o) - Q(n, u))[0];
  t.dash && !n.dash && !n.dashTime && fi(e, t, r, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    rt(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && O(r, "momentum") && s && Q(n, s) < 3 && Gn(e, s, r, 10 + O(r, "momentum") * 5, a);
  else if (t.move) {
    n.facing = ur(t.move);
    const o = n.swing > 0;
    let u = K.speed * (o ? Wt[r.weapon].moveFire : 1);
    O(r, "quicksilver") && n.dash > K.dashCooldown / 2 && (u *= 1 + O(r, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && Q(h, n) < h.radius && oe(a, h, n)) && (u *= 0.65), rt(e, n, n.facing, u, K.playerRadius, a);
  }
  n.travel += Q(i, n), O(r, "pilgrim") && n.travel >= 28 && (n.travel -= 28, Ba(n, O(r, "pilgrim") * 6, 35)), O(r, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && Ba(n, 2, O(r, "wardstone") * 10);
  const c = s && oe(a, n, s) ? s : void 0;
  t.skill && !n.skill && (c && (n.facing = ce(n, c)), pi(e, r, c, a));
  const l = Wt[r.weapon].range + (r.weapon === "blade" || r.weapon === "daggers" ? O(r, "piercing") * 0.25 : 0);
  if (c && !n.attack && Q(n, c) <= l + he[c.kind].radius && (Ar(e, r, c, !1, a), n.combo++, O(r, "echo") && n.combo % Math.max(2, et.echoEvery + 1 - O(r, "echo")) === 0 && Ar(e, r, c, !0, a), n.attack = Math.round(Wt[r.weapon].period * (O(r, "focus") ? et.focusAttack : 1))), O(r, "orbit") && e.tick % Math.round(et.orbitTicks / (1 + O(r, "orbit") * 0.25)) === 0 && s && Q(n, s) < 4.5 && Gn(e, s, r, 12 + O(r, "orbit") * 3, a), O(r, "orbitals") && e.tick % 35 === 0) {
    for (const o of e.enemies) Q(n, o) < 2.5 + O(r, "orbitals") * 0.35 && oe(a, n, o) && (tt(e, o, 12 * O(r, "orbitals"), r, "passive", n, a), o.chill = Math.max(o.chill, 30));
    we(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function gi(e, t, r) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + O(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && Yn(e, "familiar", Cs(r, e.player, Je(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || oe(r, a, i))).sort((i, c) => Q(i, a) - Q(c, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = ce(a, n), a.kind !== "turret") {
      const i = Q(a, e.player) > 8;
      if (i || Q(a, n) > 1.3 || !oe(r, a, n)) {
        const c = hr(r, a, i ? e.player : n, 0.25);
        c !== null && rt(e, a, c, i ? 0.19 : 0.14 + O(t, "frenzy") * 0.015, 0.25, r);
      }
    }
    const s = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && Q(a, n) < s && oe(r, a, n)) if (a.kind === "turret")
      It(e, a, a.angle, Wt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      tt(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? kt.empoweredDamage : kt.damage) * (1 + O(t, "covenant") * 0.15), t, "companion", a, r), we(e, a, "slash", 1.2, a.angle);
      const c = a.kind === "shade" ? 32 : i ? kt.empoweredAttackTicks : kt.attackTicks;
      a.cooldown = Math.round(c / (1 + O(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && O(t, "martyr") && (Ps(e, O(t, "martyr")), fe(e, a, "slam", 2.2, 0, 1, 15 * O(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
function vi(e, t, r) {
  if (r?.segment !== "beacon" || t.kind !== "archer" || !["approach", "lighting"].includes(e.script.signal)) return !1;
  if (t.hp < e.script.signalHp)
    return e.script.signal = "stopped", t.exposed = Math.max(t.exposed, ze.recoveryTicks), t.cooldown = ze.recoveryTicks, !1;
  if (t.windup = 0, e.script.signal === "approach") {
    const a = r.signalPoint;
    if (Q(t, a) < 1) e.script.signal = "lighting";
    else {
      const n = hr(r, t, a, 0.36);
      n !== null && (t.angle = n, rt(e, t, n, 0.1, 0.36, r));
    }
  }
  return !0;
}
function yi(e, t) {
  const r = e.script, a = e.enemies.find((s) => [
    "keeper",
    "warden",
    "thornheart"
  ].includes(s.kind));
  let n = [];
  if (t.segment === "gate" && !e.enemies.some((s) => s.kind === "archer") && (n = ["charger"]), t.segment === "waterway" && a && a.hp <= a.maxHp * 0.5 && (n = ["archer", "soldier"]), t.segment === "hall" && t.reinforcement && a && a.hp <= a.maxHp * 0.65 && (n = ["guard", "archer"]), t.segment === "roots" && a && a.hp <= a.maxHp * 0.5 && (n = ["stalker", "stalker"]), t.segment === "beacon") {
    const s = e.enemies.find((i) => i.kind === "archer");
    !s && r.signal !== "lit" && (r.signal = "stopped"), s && r.signal === "idle" && !e.enemies.some((i) => i.kind === "guard") && (r.signal = "approach", r.signalHp = s.hp, s.windup = 0, e.objective.target = ze.signalTicks), s && r.signal === "lighting" && (s.hp < r.signalHp ? (r.signal = "stopped", s.exposed = Math.max(s.exposed, ze.recoveryTicks)) : ++e.objective.progress >= ze.signalTicks && (r.signal = "lit", e.objective.hp = 0)), r.signal === "lit" && (n = ["soldier", "soldier"]);
  }
  if (!(!n.length || r.reinforcements === "done")) {
    if (r.reinforcements === "idle" && (r.reinforcements = "warning", r.warning = ze.reinforcementWarning, a && (a.windup = 0, a.cooldown = Math.max(a.cooldown, ze.reinforcementWarning + ze.recoveryTicks))), e.tick % 6 === 0) for (const s of t.summonPoints) we(e, s, "guard", 1.2);
    --r.warning > 0 || (n.forEach((s, i) => {
      Le(e, s, t.summonPoints[i], t) || Ae("map_invalid");
    }), r.reinforcements = "done");
  }
}
function bi(e, t) {
  if (t.segment === "pipe_gallery")
    for (const r of gs[t.segment])
      e.tick < r.offset || (e.tick - r.offset) % r.period || Re(e, r, r.angle, Pa(t, r, r.angle, r.length, r.width), r.width, Sa.ventWait, Sa.ventDamage);
}
var Dt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), pn = [
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
function on(e, t, r) {
  if (e.wave++, r) {
    for (const s of r.waves[e.wave - 1]) Le(e, s.kind, s.position, r, !0);
    return;
  }
  if (e.boss) {
    Le(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = Oo[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let s = 0; s < n; s++) {
    const i = qt * s / n + (e.wave - 1) * 0.8;
    let c = a[(s + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && s < 2 && (c = a[0]), e.encounter === "pursuit" && s === 0 && (c = "stalker"), e.encounter === "siege" && s === 0 && (c = "guard"), Le(e, c, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function wi(e, t, r) {
  if (r?.segment && (yi(e, r), bi(e, r)), e.boss) return;
  const a = e.objective, n = e.enemies.some((s) => s.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && Q(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && Q(i, a) < 2.2) && a.progress++;
    const s = Math.min(2, Math.floor(a.progress / Dt.ritualTicks));
    a.x = pn[s].x, a.y = pn[s].y, e.tick % Dt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Le(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: bn(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % Dt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && on(e, t), e.tick % 150 === 0 && fe(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % Dt.pursuitInterval, e.wave < e.waves && a.progress === 0 && on(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const s = e.tick % 300 === 0, i = Math.round((s ? e.player.y : e.player.x) / 3) * 3;
    Re(e, s ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, s ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  !r && e.tick > Dt.warningAfter && e.tick % 180 === 0 && fe(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, on(e, t, r)) : n && (e.nextWave = 0);
}
function xi(e, t) {
  return e.enemies.some((r) => r.hp > 0) || (t?.segment === "gate" || t?.segment === "beacon" && e.script.signal === "lit") && e.script.reinforcements !== "done" ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function _i(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, pn[0]), t.target = Dt.ritualTicks * pn.length), e.encounter === "survival" && (t.target = Dt.survivalTicks), e.encounter === "pursuit" && (t.target = Dt.pursuitInterval);
}
function Mi(e) {
  return e.kind === "warden" ? e.hp <= e.maxHp * 0.3 ? 3 : e.hp <= e.maxHp * 0.65 ? 2 : 1 : e.hp <= e.maxHp * 0.5 ? 2 : 1;
}
function ki(e, t, r, a) {
  const n = ce(t, t.target), s = Pa(r, t, n, Math.min(7.5, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), he[t.kind].radius);
  t.motionAngle = n, t.motion = Math.ceil(s / 0.32), t.stun = 24;
  const i = Re(e, t, n, s, he[t.kind].radius, 24, 0);
  if (i.life = Math.max(1, t.motion), a) {
    const c = Je(t, n, s);
    s > 1 && Qe(e, c, 2.8, 24 + t.motion + 20, 23);
  }
  t.exposed = Math.max(t.exposed, 24 + t.motion + 70);
}
function $s(e, t, r) {
  const a = t.pattern % (t.kind === "keeper" && t.phase === 1 ? 2 : 3), n = (s, i, c, l, o) => Re(e, t, s, Pa(r, t, s, i, c), c, l, o);
  if (t.kind === "warden" || t.kind === "keeper") if (a === 0) ki(e, t, r, t.kind === "warden" && t.phase > 1);
  else if (a === 1) {
    const s = ce(t, t.target);
    Qe(e, Je(t, s, Pa(r, t, s, 2.4, 0.3)), t.kind === "keeper" ? 2.5 : 3, 25, t.kind === "keeper" ? 20 : 24), t.exposed = Math.max(t.exposed, 95), t.stun = 25;
  } else t.kind === "keeper" || t.phase === 3 ? (n(ce(t, t.target), t.kind === "keeper" ? 10 : 15, 0.9, 30, 23), t.exposed = Math.max(t.exposed, 100), t.stun = 30) : (xt(e, t, t.angle, 5, 1.3, 14, 0.2), t.exposed = Math.max(t.exposed, 65));
  else if (a === 0)
    n(ce(t, t.target), 16, 0.8, 30, 20), t.phase > 1 && e.hazards.filter((s) => !s.friendly && s.kind === "poison").length < 2 && fe(e, t.target, "poison", 2, 40, 150, 9);
  else if (a === 1) {
    for (const s of [-1, 1]) n(t.angle + s * 0.7, 13, 1, 32, 21);
    t.exposed = Math.max(t.exposed, 110), t.stun = 32;
  } else
    fe(e, t, "ring", 7, 36, 10, 22, !1, {
      inner: 3.8,
      angle: t.angle + Math.PI / 2,
      gap: ze.rootRingGap
    }), t.exposed = Math.max(t.exposed, 110), t.stun = 36;
  t.pattern++;
}
function Si(e, t, r) {
  const a = t.pattern % (t.kind === "bridgekeeper" ? 3 : 4), n = (s, i, c, l = Sa.ventWait, o = Sa.ventDamage) => Re(e, t, s, Pa(r, t, s, i, c), c, l, o);
  if (a === 0) {
    const s = n(ce(t, t.target), 18, 0.55, 36, 15);
    s.pull = Sa.pullDistance, t.stun = 36, t.exposed = Math.max(t.exposed, 108);
  } else if (a === 1) {
    const s = ce(t, t.target);
    Qe(e, Je(t, s, Pa(r, t, s, 2.8, 0.35)), 2.7, 28, 26), t.stun = 28, t.exposed = Math.max(t.exposed, 112);
  } else if (a === 2) {
    const s = ce(t, t.target);
    for (const i of [-1, 1]) n(s + i * 0.62, 20, 1.15);
    t.stun = Sa.ventWait, t.exposed = Math.max(t.exposed, 125);
  } else {
    const s = ce(t, t.target), i = t.pattern % 8 < 4 ? -1 : 1;
    n(s, 18, 1.1, 38), t.phase > 1 && n(s + i * 0.9, 18, 1.1, 58), t.stun = 38, t.exposed = Math.max(t.exposed, 135);
  }
  t.pattern++;
}
var xa = (e, t) => {
  e.motion = t, e.motionAngle = ce(e, e.target), e.stun = 18;
}, Ri = {
  keeper(e, t, r) {
    r ? $s(e, t, r) : Qe(e, t.target, 2.5, 24, Vt.keeper.damage);
  },
  warden(e, t, r) {
    const a = t.pattern % 3, n = Vt.warden.damage;
    if (a === 0)
      xa(t, 24), Re(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let s = -1; s <= 1; s++) Qe(e, Je(t, t.angle + s * 0.55, 3.5), 1.8, 12 + Math.abs(s) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      xt(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Le(e, "guard", {
        x: -7,
        y: -7
      }, r);
  },
  thornheart(e, t, r) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) fe(e, Je(t.target, n * qt / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      fe(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Le(e, "stalker", {
      x: n,
      y: -6
    }, r);
    else for (let n = 0; n < 3 + t.phase; n++) Re(e, t, t.angle + n * qt / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, we(e, t, "burst", 2), Re(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), Re(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (r === 1) xt(e, t, ce(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (r === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Je({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        Re(e, n, ce(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + a * 8, 18);
      }
      t.exposed = Math.max(t.exposed, 75);
    } else
      Le(e, "wisp", {
        x: -7,
        y: 5
      }), Le(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const r = t.pattern % 3, a = t.pattern * 0.53;
    if (r === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && Re(e, t, a + n * qt / 7, 18, 0.6, 32, 23);
    else if (r === 1) for (let n = 0; n < 6; n++) {
      const s = Je({
        x: 0,
        y: 0
      }, n * qt / 6, 9);
      xt(e, s, ce(s, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      Qe(e, t.target, 2, 18, 24), fe(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      xa(t, 18), Re(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (r === 1) for (let a = 0; a < 2 + t.phase; a++) Qe(e, Je(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else r === 2 ? (Re(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Re(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (xt(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Le(e, "stalker", {
      x: -8,
      y: 3
    }), Le(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const r = t.pattern % 4;
    if (r === 0) {
      xa(t, 28);
      for (let a = 0; a < 6; a++) fe(e, Je(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (r === 1) Ir(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (r === 2)
      t.x = 0, t.y = 0, fe(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Le(e, "bomber", a);
  },
  forgemaster(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (const a of [
      -7,
      0,
      7
    ]) Re(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (r === 1) for (let a = -1; a <= 1; a++) fe(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else r === 2 ? (Qe(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Le(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Le(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const r = t.pattern % 3;
    if (r === 0) for (let a = 0; a < 3; a++) fe(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (r === 1)
      xa(t, 30), Re(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) Qe(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (let a = 0; a < 4; a++) fe(e, Je(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else r === 1 ? xt(e, t, t.angle, 9, 2.2, 14, 0.21) : r === 2 ? (t.x = -t.x, t.y = -t.y, Re(e, t, ce(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (fe(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Le(e, "stalker", {
      x: 0,
      y: -8
    }));
  },
  leviathan(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = -9, t.y = t.target.y, t.target = {
        x: 9,
        y: t.y
      }, xa(t, 40), Re(e, t, 0, 19, 1.4, 14, 25);
    else if (r === 1) for (let a = 0; a < 4; a++) Re(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else r === 2 ? (Qe(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (fe(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), xt(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), Qe(e, t.target, 2.3, 24, 21);
    else if (r === 1) for (let a = 0; a < t.memory.length; a++) Qe(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (r === 2) {
      for (const a of t.memory) Re(e, a, ce(a, t.target), 18, 0.65, 32, 22);
      Le(e, "wisp", {
        x: -7,
        y: -7
      }), Le(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Ir(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), we(e, t, "burst", 2), Re(e, t, ce(t, t.target), 20, 0.8, 24, 26);
    else if (r === 1)
      xa(t, 20), xt(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (r === 2)
      Qe(e, t, 3, 12, 26), fe(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) Re(e, a, ce(a, t.target), 20, 0.6, 22, 23);
  }
};
function Ci(e, t, r, a) {
  if (t.kind === "bridgekeeper" || t.kind === "heatkeeper") {
    a || me("invalid"), Si(e, t, a);
    return;
  }
  if (a?.segment && [
    "keeper",
    "warden",
    "thornheart"
  ].includes(t.kind)) {
    $s(e, t, a);
    return;
  }
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const s = t.phase + 1;
    t.phase = s, we(e, t, "burst", 4), n === "phoenix" && s === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), fe(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), r.oaths.includes("legion") && Le(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  Ri[n](e, t, a), t.pattern++;
}
function Pi(e, t, r) {
  if (!Ce(t.kind) && [
    "soldier",
    "guard",
    "stalker"
  ].includes(t.kind)) {
    if (r?.segment && t.kind === "soldier") return e.player;
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && Q(n, t) < 2.8 && oe(r, t, n)).sort((n, s) => Q(n, t) - Q(s, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && Q(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function Ei(e, t, r, a, n) {
  const s = he[t.kind];
  Q(t.target, e.player) < a && Q(t, e.player) < s.reach + 1 && oe(n, t, e.player) && wn(e, s.damage, r, n);
  for (const i of e.companions) Q(t.target, i) < a && Q(t, i) < s.reach + 1 && oe(n, t, i) && (i.hp -= s.damage);
  !e.boss && e.encounter === "siege" && Q(t.target, e.objective) < a && Q(t, e.objective) < s.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - s.damage * 0.5)), we(e, t.target, "slash", a, t.angle);
}
function $i(e, t, r, a) {
  const n = he[t.kind];
  if (Ce(t.kind)) {
    Ci(e, t, r, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      xt(e, t, t.angle, e.chapter > 0 ? 3 : 1, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const s of e.enemies) s.hp > 0 && !Ce(s.kind) && Q(s, t) < 3.5 && oe(a, t, s) && (s.hp = Math.min(s.maxHp, s.hp + 8));
      xt(e, t, t.angle, 3, 0.7, n.damage, 0.18), we(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      fe(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      It(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      Qe(e, t.target, 1.7, 8, n.damage), t.exposed = Math.max(t.exposed, 60);
      break;
    default:
      Ei(e, t, r, n.reach + 0.15, a);
  }
}
function Ii(e, t, r, a) {
  const n = he[t.kind], s = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (rt(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    Q(t, e.player) < n.radius + 0.4 && oe(a, t, e.player) && (wn(e, n.damage, r, a), t.motion = 0);
    for (const c of e.companions) Q(t, c) < n.radius + 0.3 && oe(a, t, c) && (c.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && Q(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), Q(s, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, we(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function Ai(e, t, r, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    if (a?.segment && Ce(n.kind)) {
      const d = Mi(n);
      n.kind === "keeper" && d > n.phase && (n.pattern = 2), n.phase = d;
    }
    for (const d of [
      "marked",
      "chill",
      "exposed",
      "controlRecovery"
    ]) n[d] = Math.max(0, n[d] - 1);
    for (const d of [
      "burn",
      "bleed",
      "poison"
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && tt(e, n, 2 + (d === "burn" ? O(t, "cinder") + O(t, "inferno") : d === "bleed" ? O(t, "hemorrhage") + O(t, "blood-dance") : O(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0 || vi(e, n, a)) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      Ii(e, n, t, a);
      continue;
    }
    const s = he[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && ($i(e, n, t, a), n.cooldown = Math.max(n.cooldown, a?.segment && Ce(n.kind) ? n.phase === 3 ? 95 : 75 : Math.round(s.cooldown * (i ? 0.8 : 1) / (Ce(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1))));
      continue;
    }
    const c = Pi(e, n, a), l = Q(n, c), o = oe(a, n, c);
    n.cooldown = Math.max(0, n.cooldown - 1), n.angle = ce(n, c);
    const u = a?.segment && e.enemies.filter((d) => d.id !== n.id && d.hp > 0 && (d.windup > 0 || d.motion > 0)).length + e.hazards.filter((d) => !d.friendly && d.life > 0).length >= ze.simultaneousWindups;
    if (!n.cooldown && l < s.reach && o && !u) {
      if (n.target = {
        x: c.x,
        y: c.y
      }, n.windup = Math.round(s.windup * (i ? 0.8 : 1)), c === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : l / 0.24, f = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(r.x, r.y))), m = {
          x: c.x + r.x * f,
          y: c.y + r.y * f
        };
        a ? oe(a, n, m) && oe(a, c, m) && (n.target = m) : (n.target.x = Math.max(-10, Math.min(10, m.x)), n.target.y = Math.max(-10, Math.min(10, m.y))), n.angle = ce(n, n.target);
      }
      continue;
    }
    const h = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (l > (h ? 5 : Ce(n.kind) ? 2.8 : 0.95) || h && l < 3 || !o) {
      const d = n.kind === "stalker" && l > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, f = hr(a, n, c, s.radius);
      f !== null && rt(e, n, f + (h && l < 3 && o ? Math.PI : a ? 0 : d), s.speed * (n.chill ? Ce(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), s.radius, a);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && Q(n, d) < s.radius + he[d.kind].radius && rt(e, n, ce(d, n), 0.027, s.radius, a);
  }
}
function sn(e, t, r) {
  if (e.kind === "beam") return di(t, e, e.angle, e.length) < e.width + r;
  const a = Q(e, t);
  return e.kind === "ring" && e.gap && Math.abs(Math.atan2(Math.sin(ce(e, t) - e.angle), Math.cos(ce(e, t) - e.angle))) + Math.asin(Math.min(1, r / Math.max(r, a))) < e.gap / 2 ? !1 : a < e.radius + r && (e.kind !== "ring" || a > e.inner - r);
}
function zi(e, t, r) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, r ? !oe(r, n, a, a.radius) : Math.abs(a.x) > K.arena || Math.abs(a.y) > K.arena || e.obstacles.some((s) => Q(s, a) < s.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (Q(a, e.player) < K.playerRadius + a.radius && oe(r, a, e.player)) e.player.shield > 0 ? (Es(e, t, r), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (wn(e, a.damage, t, r), a.life = 0);
      else {
        const s = e.companions.find((i) => i.hp > 0 && Q(a, i) < 0.3 + a.radius && oe(r, a, i));
        s && (s.hp -= a.damage * (1 - O(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const s of e.enemies) {
      if (s.hp <= 0 || a.hits.includes(s.id) || Q(s, a) > he[s.kind].radius + a.radius || !oe(r, a, s)) continue;
      a.hits.push(s.id);
      const i = a.damage * (O(t, "hunter") && Q(s, e.player) > et.hunterRange ? et.hunterDamage + (O(t, "hunter") - 1) * 0.15 : 1);
      if (tt(e, s, i, t, a.source, a, r), O(t, "pinning") && a.source === "attack" && (s.chill = 50 + O(t, "pinning") * 20, e.player.combo % 3 === 0 && At(e, s, 8 * O(t, "pinning"))), a.splash > 0) {
        we(e, s, "burst", a.splash);
        for (const c of e.enemies) c.id !== s.id && Q(c, s) < a.splash + he[c.kind].radius && tt(e, c, i * 0.55, t, a.source, s, r);
      }
      if (a.bounce > 0) {
        const c = e.enemies.filter((l) => l.hp > 0 && !a.hits.includes(l.id) && Q(l, s) < 6 && oe(r, a, l, a.radius)).sort((l, o) => Q(s, l) - Q(s, o))[0];
        if (c) {
          a.bounce--, a.angle = ce(a, c), a.damage *= 0.8;
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
function Ti(e, t, r) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      if (a.damage <= 0) continue;
      const s = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if ((s ? !a.hits.includes(0) : e.tick % 15 === 0) && sn(a, e.player, K.playerRadius) && oe(r, a, e.player)) {
        const i = a.pull && !e.player.invulnerable && !e.player.shield && e.player.hp > 0;
        wn(e, a.damage, t, r), s && a.hits.push(0), i && rt(e, e.player, ce(e.player, a), Math.min(a.pull, Math.max(0, Q(e.player, a) - 1.8)), K.playerRadius, r);
      }
      if (!e.boss && e.encounter === "siege" && e.tick % 15 === 0 && sn(a, e.objective, 0.6) && oe(r, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35)), s || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!s || !a.hits.includes(i.id)) && sn(a, i, 0.3) && oe(r, a, i) && (i.hp -= a.damage * 0.25, s && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((s) => s.hp > 0 && sn(a, s, he[s.kind].radius) && oe(r, a, s));
    a.kind === "mine" && n.length && (a.life = 0, we(e, a, "burst", a.radius));
    for (const s of n) a.kind === "storm" ? Gn(e, s, t, a.damage, r, a) : (a.kind === "fire" && (s.burn = Math.max(s.burn, 45)), a.kind === "frost" && (s.chill = Math.max(s.chill, 60)), a.kind === "mine" && At(e, s, 25), tt(e, s, a.damage, t, a.source, a, r));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function Li(e, t, r) {
  zi(e, t, r), Ti(e, t, r);
}
function Oi(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function ji(e, t, r) {
  const { seed: a, zone: n, chapter: s, elite: i, boss: c, bossKind: l, encounter: o, hp: u } = e, h = {
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
    obstacles: c ? l === "warden" || l === "colossus" ? [{
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
    chapter: s,
    elite: i,
    boss: c,
    bossKind: l,
    encounter: o,
    objective: {
      x: 0,
      y: 0,
      hp: 100,
      progress: 0,
      target: 0
    },
    script: {
      reinforcements: "idle",
      warning: 0,
      signal: "idle",
      signalHp: 0
    }
  };
  return r && ((c && !Er(l) || r.waves.some((d) => d.some((f) => !Er(f.kind)))) && Ae("encounter_unsupported"), (o !== "skirmish" || !r.waves.length || !Rt(r.space, r.entry, K.playerRadius) || r.waves.some((d) => !d.length || d.some((f) => !Rt(r.space, f.position, he[f.kind].radius) || !da(r.space, r.entry, f.position, K.playerRadius)))) && Ae("map_invalid"), Object.assign(h.player, r.entry), Object.assign(h.objective, r.objective), h.obstacles = [], h.waves = r.waves.length), _i(h), on(h, t, r), h;
}
function Ui(e, t, r, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((s) => --s.life > 0).slice(-80);
  const n = mi(e, t, r, a);
  gi(e, r, a), Ai(e, r, n, a), Li(e, r, a), e.enemies = e.enemies.filter((s) => s.hp > 0), Oi(e) ? e.status = "lost" : (wi(e, r, a), xi(e, a) && (e.status = "won", e.shots = [], e.hazards = []));
}
function Ni(e, t) {
  const r = e.at(-1);
  r && r.move === t.move && r.dash === t.dash && r.skill === t.skill ? r.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var Zi = 2.4;
function la(e, t) {
  return (!e?.all || e.all.every((r) => t.has(r))) && (!e?.none || e.none.every((r) => !t.has(r)));
}
var zr = /* @__PURE__ */ new WeakMap();
function Ct(e, t) {
  const r = e.gates.filter((i) => la(i.condition, t)).map((i) => i.id), a = r.join("/");
  let n = zr.get(e);
  n || (n = /* @__PURE__ */ new Map(), zr.set(e, n));
  let s = n.get(a);
  return s || (s = Ms(e.map, new Set(r)), n.set(a, s)), s;
}
function xn(e, t) {
  const r = e.exits.filter((n) => la(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => la(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...r, ...a];
}
function Ea(e, t, r) {
  const a = Ct(e, r);
  return xn(e, r).filter((n) => Q(t.position, n.position) <= 2.4 && Ne(a, t.position, n.position)).sort((n, s) => Q(t.position, n.position) - Q(t.position, s.position) || n.target.id.localeCompare(s.target.id));
}
function Di(e, t, r, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && Ae("input_invalid"), t && (e.facing = ur(t), dr(r, e.position, {
    x: Math.cos(e.facing) * K.speed * a,
    y: Math.sin(e.facing) * K.speed * a
  }, K.playerRadius));
}
var Fi = [
  "crossroads",
  "gate",
  "beacon",
  "waterway_approach",
  "waterway",
  "hall",
  "roots",
  "pipe_gallery",
  "sluice_bridge",
  "main_valve",
  "coal_store"
], Se = (e, t) => ({
  kind: e,
  anchor: t
}), it = {
  ...ms,
  crossroads: {
    scene: "crossroads",
    complete: "crossroads_cleared",
    reward: "crossroads",
    trigger: "encounter",
    triggerRadius: 22,
    boss: null,
    bounds: {
      left: -26,
      right: 26,
      top: -23,
      bottom: 35
    },
    summons: [],
    waves: [[
      Se("soldier", "front_left"),
      Se("soldier", "front_right"),
      Se("archer", "front_archer")
    ], [
      Se("guard", "patrol"),
      Se("soldier", "lookout"),
      Se("bomber", "flank")
    ]]
  },
  gate: {
    scene: "gate",
    complete: "patrol_cleared",
    reward: "approach",
    trigger: "encounter",
    triggerRadius: 14,
    boss: null,
    bounds: {
      left: -18,
      right: 18,
      top: -21,
      bottom: 25
    },
    summons: ["reinforcement"],
    waves: [[
      Se("guard", "guard"),
      Se("soldier", "flank"),
      Se("archer", "archer"),
      Se("archer", "archer_left")
    ]]
  },
  beacon: {
    scene: "beacon",
    complete: "alarm_silenced",
    reward: "passage",
    trigger: "encounter",
    triggerRadius: 14,
    boss: null,
    bounds: {
      left: -18,
      right: 18,
      top: -25,
      bottom: 33
    },
    summons: ["reinforcementLeft", "reinforcementRight"],
    waves: [[
      Se("guard", "guard"),
      Se("archer", "archer"),
      Se("bomber", "bomber")
    ]]
  },
  waterway_approach: {
    scene: "waterway",
    complete: null,
    reward: "approach",
    trigger: "approach",
    triggerRadius: 8,
    boss: null,
    bounds: {
      left: -18,
      right: 14,
      top: -35,
      bottom: -7
    },
    summons: [],
    waves: [[
      Se("soldier", "front_left"),
      Se("soldier", "front_right"),
      Se("archer", "front_archer")
    ], [
      Se("guard", "front_guard"),
      Se("bomber", "front_bomber"),
      Se("soldier", "front_flank")
    ]]
  },
  waterway: {
    scene: "waterway",
    complete: "waterway_cleared",
    reward: "passage",
    prerequisite: "waterway_approach",
    trigger: "encounter",
    triggerRadius: 10,
    boss: "keeper",
    bounds: {
      left: -11,
      right: 11,
      top: -6,
      bottom: 13
    },
    summons: ["reinforcementLeft", "reinforcementRight"],
    waves: [[Se("keeper", "guard")]]
  },
  hall: {
    scene: "hall",
    complete: "warden_defeated",
    reward: "warden",
    trigger: "encounter",
    triggerRadius: 10,
    boss: "warden",
    bounds: {
      left: -25,
      right: 25,
      top: -32,
      bottom: 17
    },
    summons: ["reinforcementLeft", "reinforcementRight"],
    waves: [[Se("warden", "warden")]]
  },
  roots: {
    scene: "roots",
    complete: "roots_cleared",
    reward: "roots",
    trigger: "encounter",
    triggerRadius: 12,
    boss: "thornheart",
    bounds: {
      left: -20,
      right: 20,
      top: -22,
      bottom: 26
    },
    summons: ["rootLeft", "rootRight"],
    waves: [[Se("thornheart", "tree")]]
  }
}, _n = (e) => Fi.filter((t) => it[t].scene === e), fn = (e, t, r) => {
  const a = it[e];
  return a.complete ? t.has(a.complete) : r.includes(e) || _n(a.scene).some((n) => {
    const s = it[n];
    return s.prerequisite === e && s.complete && t.has(s.complete);
  });
};
function Is(e, t, r) {
  return _n(e).find((a) => !fn(a, t, r) && (!it[a].prerequisite || fn(it[a].prerequisite, t, r)));
}
function As(e, t, r, a, n, s) {
  const i = it[e];
  if (i.complete && t.has(i.complete)) return null;
  const c = be[i.scene];
  return {
    setup: {
      seed: a,
      zone: Vt[i.boss ?? "warden"].region,
      chapter: Object.hasOwn(ms, e) ? 1 : 0,
      elite: e === "coal_store",
      boss: i.boss !== null,
      bossKind: i.boss ?? "warden",
      encounter: "skirmish",
      hp: n
    },
    field: {
      space: Rs(Ct(c, t), i.bounds),
      entry: r,
      objective: c.anchors[i.trigger],
      waves: i.waves.map((l) => l.map((o) => ({
        kind: o.kind,
        position: c.anchors[o.anchor]
      }))),
      summonPoints: i.summons.map((l) => c.anchors[l]),
      bounds: i.bounds,
      segment: e,
      reinforcement: s,
      enemyLimit: i.boss ? ze.bossEnemyLimit : ze.enemyLimit,
      ...e === "beacon" ? { signalPoint: c.anchors.signal } : {}
    }
  };
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
}, Mn = Object.keys(He), Qn = [
  ...pt,
  ...Mn,
  ...pa
];
function Pe(e) {
  return Object.hasOwn(ps, e);
}
function zs(e) {
  return Object.hasOwn(He, e);
}
function ft(e) {
  return Object.hasOwn(Oe, e);
}
function Ze(e) {
  return Pe(e) ? ps[e] : zs(e) ? He[e].name : Oe[e].name;
}
var Bi = {
  visit_wen: {
    people: ["sanniang"],
    requires: sa,
    fact: "wen_visit_agreed",
    minPeak: 4,
    escort: !0,
    confirm: !0,
    meaning: "你邀请旅人陪你回文家赴席、旅人也同意时提交。确认后你随旅人同行，从内堡南街进入文宅。文守桐仍以夫妻的旧习惯准备席面；你与旅人的关系来自你们自己的经历。",
    feedback: {
      pending: "约定回文家 · 确认后同行",
      applied: "三娘与你同行 · 去内堡南街的文宅"
    }
  },
  keep_wen_private: {
    people: ["sanniang"],
    requires: ["wen_terms_heard"],
    excludes: [
      "wen_marriage_ended",
      "wen_independence_agreed",
      "wen_departure_declared"
    ],
    fact: "wen_private_agreed",
    scenes: [
      "sanniang_room",
      "south_inn",
      "guest_room"
    ],
    confirm: !0,
    meaning: "你与旅人在私下谈定暂不向文家公开彼此的私事时提交。婚籍、药物安排照旧，文守桐不知这项约定；以后仍可选择当面摊开。",
    feedback: {
      pending: "暂将私事留在两人之间 · 确认后记录",
      applied: "这项约定只留在你和三娘之间"
    }
  },
  leave_wen_together: {
    people: ["sanniang"],
    present: ["wenshoutong"],
    requires: ["wen_terms_heard"],
    excludes: ["wen_marriage_ended", "wen_independence_agreed"],
    fact: "wen_departure_declared",
    scenes: ["wen_house"],
    escort: !0,
    confirm: !0,
    meaning: "你当着文守桐的面决定随旅人离开、旅人也愿意同行时提交。确认后随旅人出门，继续住在檐下；婚籍与药物安排尚未谈定。你的离开无需他的同意，解除婚姻另行商谈。",
    feedback: {
      pending: "当面选择一起离开 · 婚籍尚未解除",
      applied: "三娘与你同行 · 可以离开文宅"
    }
  },
  offer_wen_release: {
    people: ["wenshoutong"],
    present: ["sanniang"],
    requires: ["wen_terms_heard"],
    excludes: ["wen_marriage_ended", "wen_independence_agreed"],
    fact: "wen_release_offered",
    scenes: ["wen_house"],
    confirm: !0,
    meaning: "你愿意当面同意解除婚姻、结束文家的家庭药物供给时提交。三娘尚可决定是否接受；这是你的表态，不替她决定。",
    feedback: {
      pending: "文守桐同意解除旧婚姻 · 确认后记录",
      applied: "文守桐已表态，接下来与三娘谈她自己的选择"
    }
  },
  offer_wen_independence: {
    people: ["wenshoutong"],
    present: ["sanniang"],
    requires: ["wen_terms_heard"],
    excludes: ["wen_marriage_ended", "wen_independence_agreed"],
    fact: "wen_independence_offered",
    scenes: ["wen_house"],
    confirm: !0,
    meaning: "你愿意当面确认三娘独立居住行医、暂保婚籍、不再以返家作为药物条件时提交。三娘尚可决定是否接受。",
    feedback: {
      pending: "文守桐同意独立安排 · 确认后记录",
      applied: "文守桐已表态，接下来与三娘谈她自己的选择"
    }
  },
  end_wen_marriage: {
    people: ["sanniang"],
    present: ["wenshoutong"],
    requires: ["wen_release_offered"],
    excludes: ["wen_independence_agreed"],
    fact: "wen_marriage_ended",
    scenes: ["wen_house"],
    confirm: !0,
    meaning: "文宅当面谈定解除婚姻时提交。确认后文家停止家庭药物份额，你继续住在檐下行医，今后的药物自行筹措。",
    feedback: {
      pending: "解除与文守桐的婚姻 · 确认后生效",
      applied: "三娘已解除旧婚姻，继续在檐下行医"
    }
  },
  agree_wen_independence: {
    people: ["sanniang"],
    present: ["wenshoutong"],
    requires: ["wen_independence_offered"],
    excludes: ["wen_marriage_ended"],
    fact: "wen_independence_agreed",
    scenes: ["wen_house"],
    confirm: !0,
    meaning: "文宅当面谈定独立居住行医、暂保婚籍时提交。确认后文家不再以返家换取资助，你自己安排药物来源。",
    feedback: {
      pending: "独立居住行医，暂保婚籍 · 确认后生效",
      applied: "三娘的独立安排已谈定，婚籍暂留"
    }
  },
  explore_deep_route: {
    people: ["kouzi"],
    requires: sa,
    fact: "deep_route_agreed",
    minPeak: 4,
    escort: !0,
    confirm: !0,
    meaning: "你愿意带旅人走自己知道的深水道、旅人也同意时提交。确认后随旅人走，从管边小窝后门下水道；去南街要两人在上下层一起打开锈闸。",
    feedback: {
      pending: "约定去深水道 · 确认后同行",
      applied: "扣子与你同行 · 管边小窝后门已可通行"
    }
  },
  keep_deep_route: {
    people: ["kouzi"],
    requires: ["deep_gate_opened", "deep_trade_found"],
    excludes: ["deep_route_shared"],
    fact: "deep_route_private",
    scenes: ["deep_waterway"],
    confirm: !0,
    meaning: "你与旅人谈定保留私路、不给工场完整路线时提交。通往南街的原路保留，工坊街的支门不公开。",
    feedback: {
      pending: "保留有限知情者的私路 · 确认后生效",
      applied: "深水道仍是私路，南街入口保留"
    }
  },
  share_deep_route: {
    people: ["kouzi"],
    requires: ["deep_gate_opened", "deep_trade_found"],
    excludes: ["deep_route_private"],
    fact: "deep_route_shared",
    scenes: ["deep_waterway"],
    confirm: !0,
    meaning: "你与旅人谈定将靠内堡的一段交给检修工和住户时提交。确认后打通工坊街支门；通往你住处的支段仍由你掌握。",
    feedback: {
      pending: "开放检修支段 · 确认后生效",
      applied: "深水道的工坊街支门已开放"
    }
  },
  trace_missing_name: {
    people: ["anian"],
    requires: sa,
    fact: "missing_name_agreed",
    minPeak: 4,
    escort: !0,
    confirm: !0,
    meaning: "你想与旅人一起看看内堡街面、旅人也愿意时提交。确认后随旅人同行。南街有烤饼与铜片风车，工坊街桥洞有回声；你还带着陈禾的名字，可以沿路找寄工住处打听。",
    feedback: {
      pending: "约定一起逛内堡 · 确认后同行",
      applied: "阿念与你同行 · 南街就在门厅以北"
    }
  },
  acknowledge_worker_error: {
    people: ["anian"],
    present: ["qinzhi"],
    requires: ["worker_record_checked"],
    fact: "worker_error_acknowledged",
    scenes: ["transfer_office"],
    confirm: !0,
    meaning: "你在交接房当面承认自己的错笔并请求更正时提交。秦芷负责办理更正，陈禾是否原谅你由他自己决定。",
    feedback: {
      pending: "阿念确认错笔，申请更正 · 确认后记录",
      applied: "阿念已说明错笔 · 可找秦芷办理更正"
    }
  },
  correct_worker_record: {
    people: ["qinzhi"],
    witnesses: ["anian"],
    requires: ["worker_record_checked"],
    fact: "worker_record_corrected",
    scenes: ["transfer_office"],
    confirm: !0,
    meaning: "底簿与陈禾工牌核对一致、你实际办理更正时提交。撤销错误扣签与追债，退回因此扣留的工钱。原经手人的说明可以补入，凭据已经足以更正；陈禾仍在寄工住处，可以带结果去见他。",
    feedback: {
      pending: "更正陈禾的登记与扣签追债 · 确认后生效",
      applied: "陈禾的登记已更正，错误追债已撤销"
    }
  },
  review_gate_book: {
    people: ["laobai"],
    requires: sa,
    fact: "gate_book_agreed",
    minPeak: 4,
    escort: !0,
    confirm: !0,
    meaning: "你愿意带旅人去南街认认熟门路、旅人也同意时提交。确认后随旅人同行。热水铺有你熟识的掌柜，查验房还有一桩借签旧账要谈。",
    feedback: {
      pending: "约定去南街走走 · 确认后同行",
      applied: "老白与你同行 · 南街热水铺有熟人"
    }
  },
  take_gate_responsibility: {
    people: ["laobai"],
    present: ["liangyoufang"],
    requires: ["gate_cases_heard"],
    excludes: ["gate_review_agreed"],
    fact: "gate_responsibility_taken",
    scenes: ["audit_office"],
    confirm: !0,
    meaning: "你决定公开承担自己放行的责任时提交。确认后暂离门口值守，借签者不被一并追偿。",
    feedback: {
      pending: "老白承担放行责任，暂离值守 · 确认后生效",
      applied: "老白承担了自己的责任，借签者不再被一并追偿"
    }
  },
  request_gate_review: {
    people: ["laobai"],
    present: ["liangyoufang"],
    requires: ["gate_cases_heard"],
    excludes: ["gate_responsibility_taken"],
    fact: "gate_review_agreed",
    scenes: ["audit_office"],
    confirm: !0,
    meaning: "你决定具名逐件复核而不是让所有借签者受罚时提交。确认后暂停笼统追偿，你留任并负责带当事人到场作证。",
    feedback: {
      pending: "提交具名复核，暂停笼统追偿 · 确认后生效",
      applied: "逐件复核已受理，老白留任作证"
    }
  }
}, $a = {
  ...Bi,
  briefing: {
    district: "camp",
    atClinic: !1,
    people: ["sanniang", "laobai"],
    requires: [],
    fact: "briefed",
    meaning: "玩家明确愿意去哨站救人时提交，确认接下救援委托、开放营地外的路线。对白说明正门与旧水道两条路线；是否邀你同行另算，实际救援由探索完成。"
  },
  receiving: {
    district: "camp",
    atClinic: !1,
    people: ["laobai"],
    requires: [],
    fact: "receiving_arranged",
    meaning: "玩家请求或接受担架接应，老白答应安排时提交。牢门、小门打开且玩家回到檐下后，担架队接回仍留在牢房等候的人；已跟随或自行离开的人继续自己的行程。"
  },
  finish: {
    district: "camp",
    confirm: !0,
    atClinic: !1,
    people: ["sanniang"],
    requires: sa,
    fact: "chapter_completed",
    meaning: "与玩家核对回来的两个人和药材后提交收尾。玩家读完并继续后确认救援结束，内堡门厅以北通往南街。"
  },
  clinic: {
    district: "camp",
    atClinic: !0,
    people: ["sanniang"],
    requires: ["captives_arrived", "supplies_secured"],
    fact: "clinic_helped",
    meaning: "玩家帮三娘归置归还的药材、你在对白中回应这次协助时提交。记录共同经历，好感和态度由你另行判断。"
  }
}, Ts = Object.keys($a);
function Ls(e) {
  return e && Object.hasOwn($a, e) ? $a[e] : void 0;
}
function Tr(e, t) {
  if (!Pe(t) && !ft(t)) return [];
  const { facts: r } = e, a = Pe(t) ? e.people[t].scene : Oe[t].scene;
  return Ts.filter((n) => {
    if (n === "receiving" && r.includes("captives_arrived")) return !1;
    const s = $a[n];
    if (s.district && ot(a) !== s.district || s.scenes && !s.scenes.includes(a) || s.excludes?.some((i) => r.includes(i)) || s.minPeak !== void 0 && (!Pe(t) || e.relationships[t].highestBand < s.minPeak) || s.present?.some((i) => (Pe(i) ? e.people[i].scene : ft(i) ? Oe[i].scene : null) !== a)) return !1;
    if (s.atClinic) {
      if (!Pe(t)) return !1;
      const i = e.people[t], c = Wa[t].station, l = be[c.scene].anchors[c.anchor];
      if (a !== "clinic_front" && !(a === c.scene && Math.hypot(i.position.x - l.x, i.position.y - l.y) <= 2.4)) return !1;
    }
    return s.people.includes(t) && !r.includes(s.fact) && s.requires.every((i) => r.includes(i));
  });
}
function qi(e, t) {
  if (t.kind === "reward") {
    const r = e.rewards[t.node];
    return !!r?.offers.length && r.scene === e.location.scene;
  }
  return t.kind !== "rest" || e.location.scene !== "waterway" || fn("waterway_approach", new Set(e.facts), e.completedSegments);
}
function pr(e, t = !1) {
  const r = be[e.location.scene], a = new Set(e.facts);
  return (t ? Ea(r, e.location, a) : xn(r, a)).filter((n) => n.kind === "exit" || qi(e, n.target));
}
function Os(e) {
  return e.phase === "exploration" && (be[e.location.scene].safe || pr(e, !0).some((t) => t.kind === "object" && t.target.kind === "rest"));
}
var ua = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Lr = /* @__PURE__ */ new WeakMap();
function Kn(e, t, r) {
  if (Ne(e, t, r, K.playerRadius)) return r;
  const a = ca(e.map, t), n = ca(e.map, r), s = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Lr.get(e);
  i || (i = /* @__PURE__ */ new Map(), Lr.set(e, i));
  const c = ia(e.map, a.column, a.row);
  if (!i.has(s)) {
    const o = da(e, c, ia(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(s, o?.find((u) => ua(u, c) > 0.01) ?? null);
  }
  const l = i.get(s);
  return l ? Ne(e, t, l, K.playerRadius) ? l : c : null;
}
function Wi(e) {
  return {
    scene: e.scene,
    position: { ...be[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function Xn(e, t) {
  return _n(e).every((r) => {
    const a = it[r];
    return a.complete === null || t.has(a.complete);
  });
}
function mn(e, t, r, a) {
  const n = [{
    ...e,
    route: []
  }], s = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), c = be[i.scene], l = Ct(c, r);
    if (i.scene === t.scene && Kn(l, i.position, c.anchors[t.anchor])) return i.route;
    for (const o of be[i.scene].exits) {
      const u = `${o.to}/${o.arrival}`;
      s.has(u) || !la(o.condition, r) || a && !Xn(o.to, r) || !Kn(l, i.position, c.anchors[o.anchor]) || (s.add(u), n.push({
        scene: o.to,
        position: be[o.to].anchors[o.arrival],
        route: [...i.route, o]
      }));
    }
  }
  return null;
}
function js(e, t) {
  const r = new Set(e.facts), a = e.people[t];
  return Object.entries(yn).filter(([, n]) => !un(ot(n.scene)) || sa.every((s) => r.has(s)) && (n.scene !== "deep_waterway" || r.has("deep_route_agreed"))).map(([n, s]) => {
    const i = mn(a, s, r, !1), c = Xn(s.scene, r), l = Xn(a.scene, r) && c ? mn(a, s, r, !0) : null;
    return {
      id: n,
      name: s.name,
      ...Dn(s.scene) ? { use: Dn(s.scene).use } : {},
      personHere: a.scene === s.scene && (n === s.scene || ua(a.position, be[s.scene].anchors[s.anchor]) <= 2.4),
      playerHere: e.location.scene === s.scene && (n === s.scene || ua(e.location.position, be[s.scene].anchors[s.anchor]) <= 2.4),
      accessible: i !== null,
      safe: c,
      solo: l !== null,
      route: l ?? i
    };
  });
}
function Hi(e, t) {
  return vs(e.facts, t) !== "confined";
}
var Us = (e) => Zi * (0.7 + pt.indexOf(e) / pt.length * 0.2);
function Vi(e) {
  return pt.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && ua(e.people[t].position, e.location.position) >= Us(t));
}
function Ns(e, t) {
  return pt.filter((r) => t[r].scene === e).map((r) => ({
    kind: "object",
    position: t[r].position,
    target: {
      id: r,
      anchor: "",
      kind: "person",
      person: r
    }
  }));
}
function Zs(e) {
  return [...pr(e), ...Ns(e.location.scene, e.people)];
}
function Ds(e) {
  return kn(be[e.location.scene], e.location.position, new Set(e.facts), e.people);
}
function kn(e, t, r, a) {
  return Ns(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const s = e.id === "cells" && !!Wa[n.target.person].returnFact && !r.has("captives_released"), i = Ct(e, s ? /* @__PURE__ */ new Set([...r, "captives_released"]) : r);
    return ua(n.position, t) <= (s ? 5 : 2.4) && Ne(i, t, n.position);
  });
}
function Yi(e) {
  const t = new Set(e.facts);
  for (const r of pt) {
    const a = e.people[r];
    if (a.mode === "idle") continue;
    const n = be[a.scene], s = Ct(n, t);
    let i, c;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && me("invalid"), i = e.location.position, ua(a.position, i) < Us(r)) continue;
    } else {
      const f = yn[a.destination], m = mn(a, f, t, !0);
      if (m || me("unavailable"), c = m[0], i = n.anchors[c?.anchor ?? f.anchor], ua(a.position, i) < 0.2) {
        c ? (a.scene = c.to, a.position = { ...be[c.to].anchors[c.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const l = Kn(s, a.position, i);
    l || me("unavailable");
    const o = l.x - a.position.x, u = l.y - a.position.y, h = Math.hypot(o, u), d = Math.min(h, K.speed * 1.8);
    h && (a.facing = Math.atan2(u, o), dr(s, a.position, {
      x: o / h * d,
      y: u / h * d
    }, K.playerRadius));
  }
}
function gn(e, t) {
  const r = He[e];
  return be[r.scene].anchors[t.has(r.complete) ? r.clearedAnchor : r.anchor];
}
function Qa(e, t, r) {
  return Mn.filter((a) => He[a].scene === e).flatMap((a) => {
    const n = gn(a, r), s = He[a];
    return Math.hypot(t.x - n.x, t.y - n.y) <= s.approachRadius ? [{
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
function Gi(e, t) {
  return e.phase === "exploration" && !e.pendingParley && Qa(e.location.scene, e.location.position, new Set(e.facts)).some((r) => r.target.id === t);
}
function Jn(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && me("invalid"), e;
}
function Or(e, t = 0, r = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > r) && me("invalid"), e;
}
function Ht(e, t) {
  return (typeof e != "string" || !t.includes(e)) && me("invalid"), e;
}
function jr(e, t, r) {
  return (!Array.isArray(e) || e.length > t) && me("invalid"), e.map(r);
}
function Qi(e) {
  return new Set(e).size !== e.length && me("invalid"), e;
}
function Ur(e) {
  typeof e != "boolean" && me("invalid");
}
function Ki(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && me("identity"), e;
}
var Va = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), Xi = Object.keys(Va), Fs = ["male", "female"];
function Ji(e) {
  const t = Jn(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && me("invalid"), {
    name: t.name.trim(),
    gender: Ht(t.gender, Fs),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: Ht(t.appearanceAge, Xi) }
  };
}
var el = {
  ...Object.fromEntries(pa.map((e) => [e, { initial: { reply: Oe[e].greeting } }])),
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
      reply: `我捏着衣角出神，听见动静才抬起脸，看了你好一会儿。
「啊……找我吗？有什么事？」`,
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
      reply: `我偏头看你，拍了拍袖口上的灰，目光在你脸上停了一下。
「哎，找我？有话就说，别吞吞吐吐的。」`,
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
function Bs(e, t) {
  const r = el[t], a = Pe(t) && Ha(e.facts, t) && r.returned ? r.returned : r.initial;
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
var Ia = Object.freeze({
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
function fr(e) {
  return Ia.bands.filter((t) => e >= t).length - 1;
}
function tl(e) {
  const t = e.lastReply;
  if (!t) return null;
  const r = e.conversations[t.person].at(-1);
  return r?.id === t.turnId ? {
    person: t.person,
    turn: r
  } : null;
}
function Nr(e, t) {
  const r = e.conversations[t].at(-1);
  return r && r.kind !== "greeting" ? r : null;
}
function al(e) {
  return {
    id: e.id,
    kind: "player",
    player: e.player,
    reply: "",
    action: null,
    scene: e.scene,
    facts: [...e.facts]
  };
}
function Sn(e) {
  const t = tl(e), r = Ls(t?.turn.action ?? null);
  return t && r?.confirm && !e.facts.includes(r.fact) ? t.person : null;
}
var qs = Object.freeze({
  rankCap: 2,
  choices: 3
}), nl = [
  "city_arrival",
  "return_plan",
  "bridge",
  "heatkeeper",
  "coal_store"
], rl = (e) => nl.includes(e) ? 3 : qs.rankCap, sl = [
  "crossroads",
  "approach",
  "passage"
], ol = {
  blade: [
    "riposte",
    "cinder",
    "aegis"
  ],
  bow: [
    "pinning",
    "cinder",
    "aegis"
  ],
  staff: [
    "nova",
    "cinder",
    "aegis"
  ],
  daggers: [
    "backstab",
    "cinder",
    "aegis"
  ],
  grimoire: [
    "pack-bond",
    "cinder",
    "aegis"
  ],
  cannon: [
    "shrapnel",
    "cinder",
    "aegis"
  ]
}, il = {
  riposte: ["thorns", "aegis"],
  pinning: ["shatter"],
  nova: ["shatter", "fracture"],
  backstab: ["shadowstep"],
  "pack-bond": ["frenzy", "covenant"],
  shrapnel: ["minefield"],
  cinder: ["wildfire"],
  frost: ["shatter"],
  aegis: ["thorns", "quicksilver"]
};
function ll(e, t) {
  if (e.rewards[t]) return;
  const r = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((l) => e.equipped.includes(l.id))
  }, a = new Set(Object.values(e.rewards).flatMap((l) => l.offers.map((o) => o.id))), n = sl.includes(t), s = ci(e.weapon).flatMap((l) => {
    const o = e.collection.find((u) => u.id === l)?.rank ?? 0;
    return !a.has(l) && o < rl(t) && (!n || !o) && Ss(r, l) && (Ca[l].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: l,
      rank: o + 1
    }] : [];
  }), i = [], c = (l) => {
    const o = Cr(e, s.filter((u) => l.includes(u.id) && !i.some((h) => h.id === u.id)), 1)[0];
    o && i.push(o);
  };
  if (t === "crossroads") for (const l of ol[e.weapon]) c([l]);
  else
    c(e.equipped.flatMap((l) => il[l] ?? [])), c(s.filter((l) => ["guard", "life"].includes(Ca[l.id].family)).map((l) => l.id));
  i.push(...Cr(e, s.filter((l) => !i.some((o) => o.id === l.id)), qs.choices - i.length)), e.rewards[t] = {
    scene: e.location.scene,
    offers: i
  };
}
var cl = (e) => e.rewardNode ? e.rewards[e.rewardNode].offers : [];
function dl(e, t) {
  if (!Object.hasOwn(dn, t)) return null;
  const r = dn[t], a = new Set(e.facts), n = a.has(r.fact), s = new Set(n ? [] : Ds(e).map((u) => u.target.id)), i = n ? [] : (r.witnesses ?? []).filter((u) => Pe(u) ? !s.has(u) : !ft(u) || Oe[u].scene !== e.location.scene), c = ys.find((u) => r.witnesses?.includes(u.person))?.resolved.find((u) => a.has(u));
  let l = i.length ? Be.awaitWitness(i.map(Ze).join("、")) : r.body, o = !n && !i.length ? r.operation ?? null : null;
  return !n && t === "return_trial" && a.has("bridge_cleared") && (l = Be.trialAfterBridge, o && (o = {
    ...o,
    setup: Be.trialAfterBridgeSetup
  })), n && (l = `${Be.reviewed}
${Fn[r.fact]}`, c && (l += `

${Be.now}
${Fn[c]}`)), a.has("heat_restored") && (t === "heat_notice" && (l = Be.restoredNotice), t === "return_plan" && (l = Be.restoredPlan), t === "deep_receipt" && !i.length && !c && (l += `

${Be.restoredDeep}`)), {
    ...r,
    body: l,
    ready: !i.length,
    read: n,
    operation: o
  };
}
var Ws = Object.freeze({
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function mr(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((r) => r.id === t))
  };
}
function ul(e, t) {
  return Os(e) ? t.length > K.relicSlots ? "capacity" : new Set(t).size !== t.length || t.some((r) => !e.collection.some((a) => a.id === r)) ? "invalid" : null : "unavailable";
}
function Ya(e, t, r) {
  e.facts.includes(t) || e.facts.push(t);
  const a = r ?? [
    ...pt.filter((n) => e.people[n].scene === e.location.scene),
    ...Mn.filter((n) => He[n].scene === e.location.scene),
    ...pa.filter((n) => Oe[n].scene === e.location.scene)
  ];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function hl(e) {
  const t = e.checkpoint;
  if (e.engagement)
    return As(e.engagement.id, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.engagement.reinforcement)?.field;
}
function pl(e, t) {
  const r = e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"), a = As(t, new Set(e.facts), e.location.position, Math.floor(bn(e) * 4294967296), e.hp, r);
  a || me("unavailable"), e.engagement = {
    id: t,
    reinforcement: r
  }, e.battle = ji(a.setup, mr(e), a.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
}
function Zr(e, t) {
  return Sn(e) ? !1 : ft(t) ? e.phase === "exploration" && !e.pendingParley && Ea(be[e.location.scene], e.location, new Set(e.facts)).some((r) => r.kind === "object" && r.target.kind === "resident" && r.target.person === t) : Pe(t) ? e.pendingParley ? !1 : e.phase === "exploration" && Ds(e).some((r) => r.kind === "object" && r.target.kind === "person" && r.target.person === t) : Gi(e, t);
}
function fl(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const t = ot(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const r of Sr) {
    if (Ha(e.facts, r)) continue;
    const a = e.people[r];
    t && a.scene === "cells" && a.mode === "idle" && (e.people[r] = Wi(Wa[r].station));
    const n = e.people[r].scene;
    ot(n) === "camp" && Ya(e, Wa[r].returnFact, pt.filter((s) => e.people[s].scene === n));
  }
  Sr.every((r) => Ha(e.facts, r)) && Ya(e, "captives_arrived", pt.filter((r) => e.people[r].scene === "camp"));
}
function ml(e) {
  !e.facts.includes("kouzi_entered_city") && ["south_street", "workshop_street"].includes(ot(e.people.kouzi.scene)) && Ya(e, "kouzi_entered_city", ["kouzi"]);
}
function gl(e) {
  const t = e.engagement.id, r = it[t];
  r.complete ? Ya(e, r.complete) : e.completedSegments.includes(t) || e.completedSegments.push(t), r.reward && ll(e, r.reward), e.phase = "exploration", e.battle = null, e.checkpoint = null, e.engagement = null;
}
function Dr(e, t) {
  if (!(e.pendingParley || Sn(e))) {
    if (e.phase === "battle" && e.battle) {
      const r = hl(e);
      r || me("invalid"), Ui(e.battle, t, mr(e), r);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, e.engagement?.id === "beacon" && a.objective.hp === 0 && Ya(e, "alarm_raised"), a.status === "won" ? gl(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const r = be[e.location.scene], a = new Set(e.facts);
      Di(e.location, t.move, Ct(r, a), Ws.explorationSpeed);
      const n = Is(r.id, a, e.completedSegments);
      if (n) {
        const s = it[n], i = r.anchors[s.trigger];
        Math.hypot(e.location.position.x - i.x, e.location.position.y - i.y) <= s.triggerRadius && Rt(Rs(Ct(r, a), s.bounds), e.location.position, K.playerRadius) && pl(e, n);
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (Yi(e), fl(e), ml(e));
  }
}
var Hs = [
  {
    fact: "captives_released",
    key: "cells-opened",
    amount: 200
  },
  {
    fact: "captives_arrived",
    key: "rescue-returned",
    amount: 300
  },
  {
    fact: cr.fact,
    key: "supplies-received",
    amount: 300
  },
  {
    fact: "chapter_completed",
    key: "chapter-one",
    amount: K.firstVictoryAward
  },
  {
    fact: "warden_defeated",
    key: Vt.warden.awardKey,
    amount: K.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: Vt.thornheart.awardKey,
    amount: K.firstBossAward
  }
], wf = Object.fromEntries([
  ...Uo.map((e) => [Vt[e].awardKey, K.firstBossAward]),
  ["victory", K.firstVictoryAward],
  ...Object.keys(Wt).map((e) => [`mastery-${e}`, K.masteryAward]),
  ...No.map((e) => [`oath-${e}`, K.oathAward]),
  ...Hs.map((e) => [e.key, e.amount])
]), _a = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, Vs = {
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
    gestures: _a
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
    gestures: _a
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
    gestures: _a
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
    gestures: _a
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
      ..._a,
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
    gestures: _a
  }
};
function Ys(e) {
  return Object.hasOwn(Vs, e);
}
function vl(e) {
  return Ys(e) ? Vs[e] : {
    expressions: {},
    gestures: {}
  };
}
var gr = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, yl = {
  ...Object.fromEntries(pa.map((e) => [e, Oe[e].clothing])),
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
}, Ga = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function Gs(e, t) {
  const r = { ...yl[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(r, a.clothing);
  return r;
}
var bl = {
  warden: 0,
  thornheart: 0,
  weaver: 1,
  astrologer: 1,
  king: 2,
  phoenix: 2,
  forgemaster: 3,
  colossus: 3,
  frostqueen: 4,
  leviathan: 4,
  archivist: 5,
  voidknight: 5
}, wl = Object.keys(bl), xf = [
  ...wl,
  "soldier",
  "archer",
  "guard",
  "priest",
  "charger",
  "stalker",
  "bomber",
  "wisp"
], xl = (e) => Ht(e, ws), jn = (e) => Ht(e, fs), Fr = (e) => Ht(e, xs);
function _l(e) {
  const t = Jn(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: xl(t.weapon),
        outfit: Fr(t.outfit),
        traveler: Ji(t.traveler)
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: Fr(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: Ki(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: Ht(t.id, Ts),
        person: Ht(t.person, Qn)
      };
    case "greet":
      return {
        type: "greet",
        person: Ht(t.person, Qn)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: Qi(jr(t.equipped, K.relicSlots, jn))
      };
    case "input": {
      const r = jr(t.spans, K.maxInputTicks, (a) => {
        const n = Jn(a);
        return Ur(n.dash), Ur(n.skill), {
          move: Or(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Or(n.ticks, 1, K.maxInputTicks)
        };
      });
      return (!r.length || r.reduce((a, n) => a + n.ticks, 0) > K.maxInputTicks) && me("invalid"), {
        type: "input",
        spans: r
      };
    }
    case "relic":
      return {
        type: "relic",
        id: jn(t.id),
        ...t.replace === void 0 ? {} : { replace: jn(t.replace) }
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: t.type };
    default:
      return me("invalid");
  }
}
function Ml(e, t) {
  const r = Nt(null), a = W(!1), n = W(""), s = Nt(null), i = W(!1), c = W(!1), l = Nt(null), o = Nt(null), u = W(null), h = V(() => r.value?.replyFailure?.actionId === u.value ? null : r.value?.replyFailure ?? null), d = V(() => i.value || !!r.value?.conversation), f = W(!1), m = W(!1);
  let y = !1;
  const b = Nt(null), w = V(() => {
    const I = (b.value ?? r.value)?.conversation;
    return I || (i.value ? l.value : null);
  }), k = V(() => a.value || d.value || c.value || !!s.value || !r.value?.ready || r.value.writeState !== "ready" || r.value.pending), C = (I, Z) => I.data.revision !== Z.data.revision ? I.data.revision > Z.data.revision : I.fileRevision >= Z.fileRevision;
  function v(I) {
    if (y || r.value && !C(I, r.value)) return;
    const Z = l.value;
    (r.value?.data.active?.id !== I.data.active?.id || Z && I.data.active?.conversations[Z.person].some((H) => H.id === Z.actionId)) && (l.value = null), r.value = I;
  }
  const R = V(() => {
    if (l.value) return l.value;
    if (r.value?.conversation) return {
      ...r.value.conversation,
      status: "sending"
    };
    const I = r.value?.replyFailure;
    return !I || I.regenerating || r.value?.data.active?.conversations[I.person].some((Z) => Z.id === I.actionId) ? null : {
      actionId: I.actionId,
      person: I.person,
      text: I.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function _(I, Z, H) {
    if (y || a.value) return !1;
    a.value = !0, b.value = null, n.value = "";
    try {
      const F = await e.request(`game/expedition/${I}`, {
        chatIdentity: t,
        ...I === "rebuild" ? { actionId: Tn() } : {},
        ...Z,
        ...H ? { person: H } : {}
      }, 35e3), N = b.value;
      return v(N && C(N, F.result) ? N : F.result), f.value = !1, m.value = !1, r.value?.writeState === "ready" && !r.value.pending && I !== "read" && (s.value = null), !0;
    } catch (F) {
      if (!y) {
        f.value = !0, b.value && v(b.value), n.value = Bt(F);
        const N = F && typeof F == "object" && "code" in F ? String(F.code) : "";
        m.value = N === "expedition_data_invalid", Z && (N.startsWith("expedition_save_") || N.startsWith("host_request_")) && (s.value = Z);
      }
      return !1;
    } finally {
      b.value = null, y || (a.value = !1);
    }
  }
  const A = e.subscribe((I) => {
    if (y) return;
    if (I.type === "game/expedition/error") {
      const H = I.payload;
      H.chatIdentity === t && (n.value = Bt(H), m.value = H.code === "expedition_data_invalid");
      return;
    }
    if (I.type !== "game/expedition/state") return;
    const Z = I.payload;
    Z.chatIdentity === t && (a.value ? b.value = Z.state : (b.value = null, v(Z.state)));
  });
  async function S() {
    const I = s.value;
    return !await _("confirm") || !r.value || r.value.writeState !== "ready" || r.value.pending ? !1 : I && r.value.data.revision === I.revision ? _("act", I) : (s.value = null, c.value = !1, !0);
  }
  async function P(I, Z, H) {
    if (k.value || y) return !1;
    const F = Tn();
    o.value = H ? {
      person: I,
      turnId: H
    } : null, l.value = {
      actionId: F,
      person: I,
      text: Z,
      regenerating: !!H,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", b.value = null;
    try {
      const N = await e.request(H ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: F,
        revision: r.value.data.revision,
        person: I,
        text: Z,
        ...H ? { turnId: H } : {}
      }, 18e4), Y = b.value;
      return v(Y && C(Y, N.result) ? Y : N.result), !0;
    } catch (N) {
      if (!y) {
        b.value && v(b.value);
        const Y = N && typeof N == "object" && "code" in N ? String(N.code) : N instanceof Error ? N.message : "";
        if (Y === "expedition_cancelled")
          return n.value = "", !1;
        c.value = Y.startsWith("host_request_") || Y.startsWith("expedition_save_"), n.value = c.value ? q.aiUnknown : r.value?.replyFailure?.actionId === F ? "" : Bt(N);
      }
      return !1;
    } finally {
      o.value = null, i.value = !1, b.value = null, y || (a.value = !1, l.value?.actionId === F && (l.value = H ? null : {
        ...l.value,
        status: "failed"
      }));
    }
  }
  async function L() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (I) {
        y || (n.value = Bt(I));
      }
  }
  const T = V(() => f.value || !!s.value || c.value || !r.value || r.value.pending || r.value.writeState !== "ready");
  return {
    view: r,
    busy: a,
    error: n,
    blocked: k,
    failed: s,
    talking: d,
    uncertainTalk: c,
    talk: P,
    outgoing: R,
    replacingReply: o,
    conversationProgress: w,
    cancelTalk: L,
    recoveryRequired: T,
    dataInvalid: m,
    conversationFailure: h,
    dismissConversationFailure() {
      u.value = r.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => _("rebuild"),
    retryMemory: (I) => k.value ? Promise.resolve(!1) : _("retry-memory", void 0, I),
    dismissError() {
      T.value || (n.value = "");
    },
    notice: V(() => n.value || (r.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(r.value.writeState) || r.value.pending && r.value.writeState === "ready") ? re.saveError : "")),
    read: () => _("read"),
    recover: S,
    act: (I) => k.value ? Promise.resolve(!1) : _("act", {
      actionId: Tn(),
      revision: r.value.data.revision,
      command: _l(I)
    }),
    dispose() {
      y = !0, A();
    }
  };
}
function kl(e) {
  const t = Nt(null), r = Nt(!1);
  let a = [], n = 0, s = null, i = !1;
  function c() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const d of a) for (let f = 0; f < d.ticks; f++) Dr(t.value, d);
    r.value = a.length > 0;
  }
  const l = ue(e.view, () => {
    !s && !a.length && c();
  }, { immediate: !0 });
  async function o() {
    if (s)
      return await s ? o() : !1;
    if (!a.length) return !e.blocked.value;
    if (e.blocked.value || i) return !1;
    const h = a;
    a = [], n = 0, s = e.act({
      type: "input",
      spans: h
    });
    const d = await s;
    return s = null, d ? c() : e.failed.value || (a = h.concat(a), n = a.reduce((f, m) => f + m.ticks, 0)), r.value = a.length > 0 || !d, d;
  }
  function u(h) {
    const d = t.value;
    !d || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(d.phase) || d.phase === "exploration" && !h.move && !Vi(d) || (Dr(d, h), Ni(a, h), n++, r.value = !0, po(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(d.phase)) && o());
  }
  return {
    current: t,
    dirty: r,
    input: u,
    flush: o,
    sync: c,
    async recover() {
      return await e.recover() ? (c(), o()) : !1;
    },
    dispose() {
      i = !0, l();
    }
  };
}
var { recent: Un, maximum: Br } = wo;
function Sl(e) {
  const { history: t, pending: r, talking: a, person: n, campaignId: s, transcript: i, freshReply: c } = e, l = fo(/* @__PURE__ */ new Map());
  let o = 0, u = !1;
  const h = V(() => t.value.reduce((L, T) => L + (T.kind === "greeting" || T.kind === "player" ? 1 : 2), 0)), d = V(() => h.value + Number(r.value)), f = V(() => bo(l.get(n.value)?.range, d.value)), m = V(() => {
    const L = [];
    let T = 0;
    for (const I of t.value) {
      if (T >= f.value.end) break;
      const Z = I.kind === "greeting" ? ["npc"] : I.kind === "player" ? ["player"] : ["player", "npc"];
      for (const H of Z)
        T >= f.value.start && T < f.value.end && L.push({
          key: `${I.id}:${H}`,
          side: H,
          turn: I
        }), T++;
    }
    return L;
  }), y = V(() => f.value.start > 0), b = V(() => f.value.end < d.value), w = V(() => b.value || f.value.end - f.value.start > Un), k = V(() => r.value && f.value.end > h.value);
  function C(L) {
    L && !L.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function v(L, T) {
    const I = L.getBoundingClientRect().top, Z = [...L.querySelectorAll("[data-message-key]")].find((H) => T.has(H.dataset.messageKey) && H.getBoundingClientRect().bottom > I);
    return Z ? {
      key: Z.dataset.messageKey,
      offset: Z.getBoundingClientRect().top - I
    } : null;
  }
  function R(L, T) {
    const I = T && [...L.querySelectorAll("[data-message-key]")].find((Z) => Z.dataset.messageKey === T.key);
    return !I || !T ? !1 : (L.scrollTop += I.getBoundingClientRect().top - L.getBoundingClientRect().top - T.offset, !0);
  }
  function _() {
    const L = i.value;
    if (!L || u || l.get(n.value)?.latest === !1) return;
    const T = c.value ? L.querySelector('[data-fresh-reply="true"]') : null;
    L.scrollTop = T && T.offsetHeight > L.clientHeight ? T.getBoundingClientRect().top - L.getBoundingClientRect().top + L.scrollTop - 12 : L.scrollHeight;
  }
  function A() {
    const L = ++o, T = n.value, I = i.value?.contains(document.activeElement) ? document.activeElement : null;
    u = !1, c.value = null, l.delete(T), Mt(() => {
      o === L && n.value === T && (_(), C(I));
    });
  }
  function S() {
    const L = i.value;
    if (!L || u) return;
    const T = !b.value && L.scrollHeight - L.clientHeight - L.scrollTop < 32;
    if (T && w.value) {
      A();
      return;
    }
    l.set(n.value, {
      top: L.scrollTop,
      latest: T,
      range: T ? null : {
        start: f.value.start,
        end: b.value ? f.value.end : null
      }
    });
  }
  async function P(L) {
    const T = i.value;
    if (!T || u) return;
    const I = { ...f.value };
    L === "older" ? (I.start = Math.max(0, I.start - Un), I.end = Math.min(I.end, I.start + Br)) : (I.end = Math.min(d.value, I.end + Un), I.start = Math.max(I.start, I.end - Br));
    const Z = v(T, new Set(m.value.filter((ae, Ve) => {
      const Te = f.value.start + Ve;
      return Te >= I.start && Te < I.end;
    }).map((ae) => ae.key))), H = T.contains(document.activeElement) ? document.activeElement : null, F = n.value, N = ++o;
    u = !0;
    const Y = {
      start: I.start,
      end: I.end === d.value ? null : I.end
    };
    l.set(F, {
      range: Y,
      top: T.scrollTop,
      latest: !1
    }), await Mt(), !(N !== o || n.value !== F || i.value !== T) && (R(T, Z) || (T.scrollTop = L === "older" ? 0 : T.scrollHeight), l.set(F, {
      range: Y,
      top: T.scrollTop,
      latest: !1
    }), u = !1, C(H));
  }
  return ue(s, () => {
    o++, u = !1, l.clear();
  }), ue([i, n], ([L, T]) => {
    o++, u = !1;
    const I = l.get(T);
    L && (L.scrollTop = I && !I.latest ? I.top : L.scrollHeight);
  }, { flush: "post" }), ue(i, (L, T, I) => {
    if (!L) return;
    const Z = new ResizeObserver(_);
    Z.observe(L), I(() => Z.disconnect());
  }, { flush: "post" }), ue(m, async (L) => {
    const T = i.value, I = n.value, Z = o, H = l.get(I);
    if (!T || u || !H || H.latest) return;
    const F = v(T, new Set(L.map((N) => N.key)));
    await Mt(), !(Z !== o || i.value !== T || l.get(I) !== H) && (R(T, F), H.top = T.scrollTop);
  }), ue([
    t,
    r,
    a,
    c
  ], async () => {
    await Mt(), _();
  }), {
    messages: m,
    hasOlder: y,
    hasNewer: b,
    expanded: w,
    pendingVisible: k,
    rememberReading: S,
    resetLatest: A,
    older: () => P("older"),
    newer: () => P("newer")
  };
}
var st = {
  cache: "拾取遗物",
  cacheReady: "遗物已留在现场",
  signalApproach: "守长正赶向火盆",
  signalLit: "烽火已点燃 · 援兵将至",
  signalCountdown: (e) => `点火 ${e} 秒 · 击中守长可打断`,
  dormantRelic: "触发来源未装配",
  restBuild: "在营地或休整点调整装配。",
  replace: "替换一件装配",
  store: "只收入收藏",
  back: "重新选择",
  received: (e, t) => `${e} · ${t ? "已装配" : "收入收藏"}`
}, qr = {
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
}, Rl = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, Cl = ["d"], Pl = ["d"], El = /* @__PURE__ */ je({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, r) => ($(), z("svg", Rl, [M("path", {
      d: g(qr)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, Cl), M("path", {
      d: g(qr)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Pl)]));
  }
}), Ft = El, $l = { class: "ember-relics" }, Il = ["disabled", "onClick"], Al = ["disabled"], zl = ["disabled"], Tl = { class: "ember-relics" }, Ll = ["disabled", "onClick"], Ol = ["disabled"], jl = /* @__PURE__ */ je({
  __name: "RelicReward",
  props: {
    campaign: {},
    blocked: { type: Boolean }
  },
  emits: ["choose", "leave"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = W(null);
    function s(i) {
      r.campaign.equipped.length >= K.relicSlots && !r.campaign.equipped.includes(i) ? n.value = i : a("choose", i);
    }
    return (i, c) => n.value ? ($(), z(ee, { key: 0 }, [
      M("h3", null, E(g(oa)[n.value].name) + " · " + E(g(st).replace), 1),
      M("div", $l, [($(!0), z(ee, null, _e(e.campaign.equipped, (l) => ($(), z("button", {
        key: l,
        type: "button",
        disabled: e.blocked,
        onClick: (o) => a("choose", n.value, l)
      }, [Xe(Ft, { name: l }, null, 8, ["name"]), M("h3", null, E(g(oa)[l].name), 1)], 8, Il))), 128))]),
      M("button", {
        type: "button",
        disabled: e.blocked,
        onClick: c[0] || (c[0] = (l) => a("choose", n.value))
      }, E(g(st).store), 9, Al),
      M("button", {
        type: "button",
        disabled: e.blocked,
        onClick: c[1] || (c[1] = (l) => n.value = null)
      }, E(g(st).back), 9, zl)
    ], 64)) : ($(), z(ee, { key: 1 }, [M("div", Tl, [($(!0), z(ee, null, _e(g(cl)(e.campaign), (l) => ($(), z("button", {
      key: l.id,
      type: "button",
      disabled: e.blocked,
      onClick: (o) => s(l.id)
    }, [
      Xe(Ft, { name: l.id }, null, 8, ["name"]),
      M("h3", null, [Ie(E(g(oa)[l.id].name) + " ", 1), M("small", null, E(g(re).rank(l.rank)), 1)]),
      M("p", null, E(g(oa)[l.id].detail), 1)
    ], 8, Ll))), 128))]), M("button", {
      type: "button",
      disabled: e.blocked,
      onClick: c[2] || (c[2] = (l) => a("leave"))
    }, E(g(q).skip), 9, Ol)], 64));
  }
}), Ul = jl, de = Object.freeze({
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
    clothing_rejected: Ga.rejected,
    reply_invalid: "回复格式有误。原文已保存，未执行行动或改变好感。",
    reply_incomplete: "回复未完整生成。已收到的原文已保存，未执行行动或改变好感。"
  },
  shareSecret: "把当前阶段的秘密实际讲给玩家，记录玩家已获得这份情报。",
  follow: "答应与玩家同行时提交；关闭交谈后跟随玩家，跨场景同行，可以进入战区但不参战。",
  stay: "停止跟随或赶路，留在当前地点等候，玩家离开后仍留在这里。",
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
  memoryRetry: "重试"
});
function Nl(e) {
  let t = null, r = null, a = null, n = !1, s = !1, i = null, c = -1, l = 0, o = 0, u = 0, h = 0, d = 0;
  function f(y, b, w, k = "sine", C = y * 0.8, v = 0) {
    if (!n || !t || !r || t.state !== "running") return;
    const R = t.createOscillator(), _ = t.createGain(), A = t.currentTime + v;
    R.type = k, R.frequency.setValueAtTime(y, A), R.frequency.exponentialRampToValueAtTime(Math.max(30, C), A + b), _.gain.setValueAtTime(1e-4, A), _.gain.exponentialRampToValueAtTime(w, A + 9e-3), _.gain.exponentialRampToValueAtTime(1e-4, A + b), R.connect(_).connect(r), R.start(A), R.stop(A + b), R.onended = () => {
      R.disconnect(), _.disconnect();
    };
  }
  function m(y, b, w, k) {
    if (!n || !t || !r || !a || t.state !== "running") return;
    const C = t.createBufferSource(), v = t.createBiquadFilter(), R = t.createGain(), _ = t.currentTime;
    C.buffer = a, v.type = "bandpass", v.Q.value = 0.65, v.frequency.setValueAtTime(w, _), v.frequency.exponentialRampToValueAtTime(k, _ + y), R.gain.setValueAtTime(1e-4, _), R.gain.exponentialRampToValueAtTime(b, _ + 8e-3), R.gain.exponentialRampToValueAtTime(1e-4, _ + y), C.connect(v).connect(R).connect(r), C.start(_), C.stop(_ + y), C.onended = () => {
      C.disconnect(), v.disconnect(), R.disconnect();
    };
  }
  return {
    async enable(y) {
      if (!s) {
        n = y;
        try {
          if (!y) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), r = t.createGain(), r.gain.value = 0.55, r.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const b = a.getChannelData(0);
            for (let w = 0; w < b.length; w++) b[w] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, s || e();
        }
      }
    },
    tick(y) {
      (!i || y.tick < c) && (c = -1, l = y.player.hp, o = y.kills, u = y.player.skill, h = y.serial, d = y.player.combo), i = y, c !== y.tick && (c = y.tick, y.player.hp < l && (m(0.16, 0.17, 800, 120), f(95, 0.2, 0.12, "triangle", 42)), y.kills > o && (f(659, 0.22, 0.045), f(988, 0.3, 0.025, "sine", 980, 0.035)), y.player.combo > d && m(0.095, 0.08, 2700, 500), y.player.dashTime === 7 && m(0.2, 0.09, 500, 2600), y.player.skill > u && (m(0.24, 0.12, 2200, 250), f(165, 0.35, 0.075, "triangle", 82), f(660, 0.36, 0.035, "sine", 440, 0.02)), y.effects.some((b) => b.id > h && b.kind === "lightning") && (m(0.12, 0.1, 4400, 1e3), f(1200, 0.08, 0.018, "sine", 210)), y.effects.some((b) => b.id > h && (b.kind === "block" || b.kind === "parry")) && (f(1350, 0.18, 0.07, "triangle", 740), f(2200, 0.11, 0.025, "sine", 1600)), y.effects.some((b) => b.id > h && b.kind === "ward-hit") && f(510, 0.16, 0.06, "sine", 250), y.effects.some((b) => b.id > h && b.kind === "ward-break") && (m(0.25, 0.1, 3600, 650), f(720, 0.3, 0.05, "sine", 120)), y.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((b, w) => f(b, 0.65, 0.04, "sine", b, w * 0.075)), y.status === "lost" && f(147, 0.7, 0.06, "triangle", 73), l = y.player.hp, o = y.kills, u = y.player.skill, h = y.serial, d = y.player.combo);
    },
    dispose() {
      s = !0, n = !1, t && (t.close().catch(e), t = null), r = null, a = null;
    }
  };
}
var p = {
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
}, Wr = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], wt = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, Ke = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, ut = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, Rn = [
  {
    sky: p.sky,
    haze: p.haze,
    stone: p.stone,
    light: p.light,
    floor: p.grass,
    tile: p.grassLight,
    seam: p.mortar,
    dark: p.shadow,
    trim: p.brass,
    accent: p.ember,
    foliage: p.leaf,
    flower: p.rose,
    water: p.water
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
], Zl = {
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
}, _f = Object.fromEntries(Object.entries(Ca).map(([e, t]) => [e, Zl[t.family]]));
function Dl(e, t, r) {
  const a = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, s = !1, i = !1;
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
  function l(d) {
    if (!(!c.includes(d.code) || d.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(d.target.tagName)) && !(d.code === "Space" && d.target instanceof HTMLElement && d.target.closest("button"))) {
      if (d.preventDefault(), d.stopPropagation(), r(), d.code === "Escape") {
        d.repeat || t();
        return;
      }
      a.add(d.code), !d.repeat && d.code === "Space" && (s = !0), !d.repeat && d.code === "KeyE" && (i = !0);
    }
  }
  function o(d) {
    a.delete(d.code);
  }
  function u() {
    a.clear(), n = {
      x: 0,
      y: 0
    }, s = !1, i = !1;
  }
  function h() {
    u(), t();
  }
  return e.addEventListener("keydown", l), window.addEventListener("keyup", o), window.addEventListener("blur", h), {
    frame() {
      const d = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), f = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), m = {
        move: Math.hypot(d, f) < 0.15 ? 0 : (Math.round((Math.atan2(f, d) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: s,
        skill: i
      };
      return s = !1, i = !1, m;
    },
    stick(d, f) {
      n = {
        x: d,
        y: f
      };
    },
    dash() {
      s = !0, r();
    },
    skill() {
      i = !0, r();
    },
    clear: u,
    dispose() {
      u(), e.removeEventListener("keydown", l), window.removeEventListener("keyup", o), window.removeEventListener("blur", h);
    }
  };
}
function Fl(e, t) {
  let r = null;
  function a(s) {
    if (!r || s.pointerId !== r.id) return;
    const i = r.surface.getBoundingClientRect(), c = i.width * 0.36, l = (s.clientX - i.left - i.width / 2) / c, o = (s.clientY - i.top - i.height / 2) / c, u = Math.max(1, Math.hypot(l, o));
    e(l / u, o / u);
  }
  function n() {
    const s = r;
    r = null, e(0, 0), s?.surface.hasPointerCapture(s.id) && s.surface.releasePointerCapture(s.id);
  }
  return {
    down(s) {
      if (r || s.button !== 0) return;
      t();
      const i = s.currentTarget;
      i.setPointerCapture(s.pointerId), r = {
        id: s.pointerId,
        surface: i
      }, a(s);
    },
    move: a,
    release(s) {
      r?.id === s.pointerId && n();
    },
    clear: n
  };
}
function er(e) {
  const t = new kr();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const r = {
    box: new Ao(1, 1, 1),
    sphere: new Ro(1, 20, 14),
    rock: new Mr(1, 0),
    crown: new Mr(1, 1),
    cylinder: new To(1, 1, 1, 24),
    cone: new Io(1, 1, 12),
    disc: new $o(1, 48),
    ring: new an(0.965, 1, 64),
    openRing: new an(0.965, 1, 48, 1, ze.rootRingGap / 2, Math.PI * 2 - ze.rootRingGap),
    arc: new an(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new _r(1, 0.08, 8, 40),
    stroke: new an(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new _r(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new xr(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  function i(d, f = !1, m = 1, y = !1) {
    const b = `${d}/${f}/${m}/${y}`;
    let w = n.get(b);
    return w || (w = f ? new zo({
      color: d,
      transparent: m < 1,
      opacity: m,
      depthWrite: m === 1,
      side: 2
    }) : new ir({
      color: d,
      map: e?.get(d) ?? null,
      roughness: y ? 0.34 : 0.88,
      metalness: y ? 0.45 : 0.02,
      side: 2
    }), n.set(b, w)), w;
  }
  function c(d, f, m, y, b = [
    0,
    0,
    0
  ], w = !1, k = 1, C = !1) {
    let v = r[f];
    if (!w && f === "box" && e?.has(m)) {
      v = v.clone(), s.add(v);
      const _ = v.getAttribute("position"), A = v.getAttribute("normal"), S = v.getAttribute("uv");
      for (let P = 0; P < S.count; P++) {
        const L = Math.abs(A.getX(P)) > 0.5 ? _.getZ(P) * y[2] : _.getX(P) * y[0], T = Math.abs(A.getY(P)) > 0.5 ? _.getZ(P) * y[2] : _.getY(P) * y[1];
        S.setXY(P, L / 8, T / 8);
      }
    }
    const R = new $t(v, i(m, w, k, C));
    return R.scale.set(...y), R.position.set(...b), R.castShadow = !w, R.receiveShadow = !w, d.add(R), R;
  }
  function l(d, f = [
    0,
    0,
    0
  ]) {
    const m = new Fa();
    return m.position.set(...f), d.add(m), m;
  }
  function o(d, f, m, y, b, w = 1, k = !1, C = 0.04) {
    const v = c(d, k ? "disc" : "ring", f, [
      m,
      m,
      1
    ], [
      y,
      C,
      b
    ], !0, w);
    return v.rotation.x = -Math.PI / 2, v;
  }
  function u(d, f, m, y = [
    0,
    0,
    0
  ], b = 0) {
    const w = e?.has(m) ?? !1, k = JSON.stringify([
      f,
      b,
      w
    ]);
    let C = a.get(k);
    if (!C) {
      const R = new kr();
      if (f.forEach(([_, A], S) => S ? R.lineTo(_, A) : R.moveTo(_, A)), R.closePath(), C = b ? new xr(R, {
        depth: b,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: b * 0.3,
        bevelSize: b * 0.3,
        bevelSegments: 2
      }) : new _o(R), w) {
        const _ = C.getAttribute("uv");
        for (let A = 0; A < _.count; A++) _.setXY(A, _.getX(A) / 8, _.getY(A) / 8);
      }
      a.set(k, C);
    }
    const v = new $t(C, i(m));
    return v.position.set(...y), v.castShadow = !0, v.receiveShadow = !0, d.add(v), v;
  }
  function h(d) {
    d.updateMatrixWorld(!0);
    const f = d.matrixWorld.clone().invert(), m = new os(), y = /* @__PURE__ */ new Map();
    d.traverse((w) => {
      if (!(w instanceof $t) || Array.isArray(w.material)) return;
      const k = (w.geometry.index ? w.geometry.toNonIndexed() : w.geometry.clone()).applyMatrix4(m.multiplyMatrices(f, w.matrixWorld)), C = `${w.material.uuid}/${w.castShadow}/${w.receiveShadow}`;
      let v = y.get(C);
      v || (v = {
        material: w.material,
        castShadow: w.castShadow,
        receiveShadow: w.receiveShadow,
        geometries: []
      }, y.set(C, v)), v.geometries.push(k);
    }), d.clear();
    const b = [];
    for (const { material: w, castShadow: k, receiveShadow: C, geometries: v } of y.values()) {
      const R = us(v);
      if (v.forEach((A) => A.dispose()), !R) throw new Error("expedition_geometry_merge");
      const _ = new $t(R, w);
      _.castShadow = k, _.receiveShadow = C, d.add(_), b.push(R);
    }
    return () => {
      d.clear(), b.forEach((w) => w.dispose());
    };
  }
  return {
    mesh: c,
    group: l,
    ring: o,
    shape: u,
    material: i,
    bake: h,
    geometries: r,
    dispose() {
      Object.values(r).forEach((d) => d.dispose()), a.forEach((d) => d.dispose()), s.forEach((d) => d.dispose()), n.forEach((d) => d.dispose());
    }
  };
}
function Bl(e, t, r, a) {
  const n = Rn[r], s = K.arena, { mesh: i, group: c, ring: l } = e, o = (m, y, b, w = n.stone) => i(m, "box", w, y, b);
  function u(m, y, b, w = !0) {
    const k = c(t, [
      m,
      0,
      y
    ]);
    o(k, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), o(k, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), o(k, [
      0.91,
      b,
      0.91
    ], [
      0,
      b / 2 + 0.6,
      0
    ]);
    for (const C of [-0.38, 0.38]) o(k, [
      0.08,
      b - 0.35,
      0.12
    ], [
      C,
      b / 2 + 0.6,
      0.48
    ], n.light);
    return o(k, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      b + 0.6,
      0
    ], n.light), o(k, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      b + 0.85,
      0
    ], n.dark), w && (i(k, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      b + 1.24,
      0
    ]), o(k, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      b - 0.15,
      0.52
    ], n.trim)), k;
  }
  function h(m, y, b, w) {
    u(m - b / 2, y, w - 2), u(m + b / 2, y, w - 2);
    const k = c(t, [
      m,
      w - 2,
      y
    ]);
    i(k, "arch", n.light, [
      b / 2,
      2.3,
      1.15
    ]);
    for (let C = 1; C < 10; C++) {
      const v = C / 10 * Math.PI, R = o(k, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(v) * b * 0.49,
        Math.sin(v) * 2.25,
        0.59
      ], n.trim);
      R.rotation.z = v - Math.PI / 2;
    }
    o(k, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function d(m, y, b = 1) {
    const w = c(t, [
      m,
      0,
      y
    ]);
    w.scale.setScalar(b);
    for (let k = 0; k < 5; k++) {
      const C = k * 2.4, v = i(w, "rock", k % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + k % 2 * 0.3,
        0.45
      ], [
        Math.cos(C) * 0.4,
        0.5,
        Math.sin(C) * 0.4
      ]);
      v.rotation.z = Math.sin(C) * 0.4;
    }
    for (let k = 0; k < 3; k++) i(w, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(k * 4) * 0.5,
      1,
      Math.cos(k * 4) * 0.4
    ]);
  }
  function f(m, y, b) {
    const w = c(t, [
      m,
      0,
      y
    ]);
    w.scale.setScalar(b);
    const k = i(w, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    k.rotation.z = -0.1;
    for (let C = 0; C < 6; C++) {
      const v = C * 2.4;
      i(w, "rock", C % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(v) * 0.95,
        3 + Math.sin(v) * 0.5,
        Math.sin(v) * 0.85
      ]);
    }
  }
  o(t, [
    180,
    0.3,
    180
  ], [
    0,
    -4.1,
    0
  ], n.water);
  for (let m = 0; m < 16; m++) o(t, [
    3 + m % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(m * 7) * 32,
    -3.92,
    Math.cos(m * 3) * 25
  ], n.haze);
  o(t, [
    s * 2 + 2.4,
    2.4,
    s * 2 + 2.4
  ], [
    0,
    -1.5,
    0
  ], n.dark), o(t, [
    s * 2 + 1.1,
    0.42,
    s * 2 + 1.1
  ], [
    0,
    -0.42,
    0
  ], n.trim), o(t, [
    s * 2 + 0.5,
    0.35,
    s * 2 + 0.5
  ], [
    0,
    -0.14,
    0
  ], n.floor);
  for (let m = -10; m <= 10; m += 2) for (let y = -10; y <= 10; y += 2) o(t, [
    1.96,
    0.045,
    1.96
  ], [
    m,
    0.025,
    y
  ], (m * 3 + y + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    l(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), l(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), l(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let m = 0; m < 8; m++) {
      const y = m * Math.PI / 4, b = o(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(y) * 5.04,
        0.065,
        Math.sin(y) * 5.04
      ], n.trim);
      b.rotation.y = -y + Math.PI / 2;
    }
    if (r === 1) i(t, "crescent", n.seam, [
      3,
      3,
      0.12
    ], [
      0,
      0.065,
      0
    ]).rotation.set(-Math.PI / 2, 0, 0.7);
    else {
      const m = [];
      for (let b = 0; b < (r === 2 ? 24 : 16); b++) {
        const w = b * Math.PI * 2 / (r === 2 ? 24 : 16), k = b % 2 ? 0.85 : r === 2 ? 2.6 : b % 4 ? 1.8 : 3.2;
        m.push([Math.cos(w) * k, Math.sin(w) * k]);
      }
      const y = e.shape(t, m, n.seam, [
        0,
        0.061,
        0
      ]);
      y.rotation.x = -Math.PI / 2, l(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const m of [-1, 1]) for (let y = 0; y < 4; y++) {
    const b = m * (7 + y % 2), w = -7 + y * 4, k = o(t, [
      0.035,
      0.016,
      0.55 + y * 0.1
    ], [
      b,
      0.055,
      w
    ], n.seam);
    k.rotation.y = y * 1.3;
    const C = o(t, [
      0.028,
      0.015,
      0.3
    ], [
      b + 0.1,
      0.055,
      w + 0.3
    ], n.seam);
    C.rotation.y = y * 1.3 + 0.8;
  }
  for (const m of [-s - 0.35, s + 0.35]) {
    o(t, [
      0.38,
      0.18,
      s * 2 + 1
    ], [
      m,
      0.08,
      0
    ], n.light);
    for (let y = -10; y <= 10; y += 5) u(m + Math.sign(m) * 0.5, y, y === -10 ? 3.6 : 1.35);
  }
  for (let m = 0; m < 6; m++) o(t, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - m * 0.26,
    s + 0.65 + m * 0.8
  ], m % 2 ? n.stone : n.light);
  h(0, -s - 3, 8, 6.3);
  for (const m of [-1, 1]) {
    o(t, [
      5,
      3.2,
      1.9
    ], [
      m * 8.4,
      1.45,
      -s - 3
    ], n.dark), o(t, [
      5.5,
      0.3,
      2.3
    ], [
      m * 8.4,
      3.2,
      -s - 3
    ], n.light);
    const y = c(t, [
      m * 5.8,
      4.8,
      -s - 2.9
    ]);
    o(y, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let b = 0; b < 5; b++) o(y, [
      0.35,
      2.6 - Math.abs(b - 2) * 0.12,
      0.08
    ], [
      (b - 2) * 0.34,
      -1.35,
      Math.sin(b * 2) * 0.08
    ], b % 2 ? n.foliage : n.dark);
    if (o(y, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), r < 3) {
      for (let b = 0; b < 4; b++) d(m * (12.8 + b % 2), -9 + b * 5, 0.8 + b * 0.1);
      f(m * 15, -13, 1.5), f(m * 17, 1, 1.7);
    } else if (r === 3) for (let b = 0; b < 3; b++) {
      const w = c(t, [
        m * 15,
        0,
        -9 + b * 7
      ]);
      i(w, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), i(w, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), o(w, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), i(w, "torus", n.trim, [
        1.1,
        1.1,
        0.3
      ], [
        0,
        1.2,
        1.4
      ]);
    }
    else if (r === 4) {
      for (let w = 0; w < 5; w++) i(t, "rock", w % 2 ? n.light : n.accent, [
        1,
        2.2 + w % 3,
        0.9
      ], [
        m * (13.5 + w % 2),
        1.2,
        -9 + w * 4
      ]).rotation.z = m * -0.2;
      const b = c(t, [
        m * 17,
        0,
        -13
      ]);
      o(b, [
        0.22,
        8,
        0.22
      ], [
        0,
        3.5,
        0
      ], n.dark), e.shape(b, [
        [0, 0],
        [3, -1],
        [0, -4]
      ], n.light, [
        0,
        6.5,
        0
      ]);
    } else {
      for (let w = 0; w < 4; w++) {
        const k = c(t, [
          m * 14,
          0,
          -10 + w * 6
        ]);
        o(k, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let C = 0; C < 3; C++) {
          o(k, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + C,
            0
          ], n.trim);
          for (let v = 0; v < 5; v++) o(k, [
            0.27,
            0.65 + v % 2 * 0.12,
            0.6
          ], [
            -0.85 + v * 0.4,
            1.2 + C,
            0.1
          ], v % 2 ? n.foliage : n.stone);
        }
      }
      const b = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        m * 18,
        6.2,
        -13
      ]);
      b.rotation.y = m * 0.3;
    }
    o(t, [
      7,
      1.4,
      18
    ], [
      m * 17,
      -0.7,
      -3
    ], n.dark), o(t, [
      6.7,
      0.1,
      17.7
    ], [
      m * 17,
      0.06,
      -3
    ], n.seam);
    for (const b of [-3.5, 3.5]) o(t, [
      0.22,
      0.25,
      18.2
    ], [
      m * 17 + b,
      0.13,
      -3
    ], n.stone);
    o(t, [
      9,
      1.8,
      10
    ], [
      m * 15,
      -0.9,
      -17
    ], n.dark), o(t, [
      8.7,
      0.1,
      9.7
    ], [
      m * 15,
      0.06,
      -17
    ], n.seam);
  }
  for (let m = 0; m < 7; m++) {
    const y = (m - 3) * 8, b = -26 - m % 3 * 6, w = 7 + m * 5 % 7;
    if (o(t, [
      5.2,
      w,
      5.5
    ], [
      y,
      w / 2 - 3,
      b
    ], n.stone), o(t, [
      5.8,
      0.4,
      6
    ], [
      y,
      w - 3,
      b
    ], n.light), r === 1) {
      const k = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        y,
        w - 0.8,
        b
      ]);
      k.rotation.z = 0.9;
    } else if (r === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      y,
      w - 0.8,
      b
    ]);
    else if (r === 3) {
      for (const k of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + m % 2 * 2,
        0.7
      ], [
        y + k,
        w - 1,
        b
      ]);
      o(t, [
        3.8,
        0.25,
        4
      ], [
        y,
        w - 2.5,
        b
      ], n.trim);
    } else if (r === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        y,
        w - 0.8,
        b
      ]);
      for (const k of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        y + k,
        w - 3,
        b + 3
      ]);
    } else if (r === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        y,
        w + 0.7,
        b
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        y,
        w - 1,
        b
      ]).rotation.x = Math.PI / 2;
    else {
      for (const k of [
        -2,
        0,
        2
      ]) o(t, [
        0.7,
        1.2,
        5.6
      ], [
        y + k,
        w - 2.35,
        b
      ], n.light);
      m % 2 && f(y + 1, b + 2, 1.5);
    }
    for (const k of [
      -1.5,
      0,
      1.5
    ]) o(t, [
      0.5,
      2.8,
      0.12
    ], [
      y + k,
      w - 5.6,
      b + 2.8
    ], n.dark);
  }
  for (const m of a?.obstacles ?? []) {
    const y = c(t, [
      m.x,
      0,
      m.y
    ]);
    i(y, "cylinder", n.dark, [
      m.radius,
      0.22,
      m.radius
    ], [
      0,
      0.11,
      0
    ]), i(y, "cylinder", n.stone, [
      m.radius * 0.85,
      1.15,
      m.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(y, "cylinder", n.light, [
      m.radius,
      0.2,
      m.radius
    ], [
      0,
      1.4,
      0
    ]), i(y, "rock", n.accent, [
      0.28,
      0.58,
      0.28
    ], [
      0,
      1.9,
      0
    ]);
    for (let b = 0; b < 6; b++) {
      const w = b * Math.PI / 3;
      o(y, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(w) * m.radius * 0.86,
        0.8,
        Math.sin(w) * m.radius * 0.86
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
    ]), l(t, n.trim, 1.68, 0, -8, 1, !1, 0.28);
    for (const m of [-1, 1]) {
      d(m * 3, -8, 1.2), d(m * 4, -10, 0.85);
      const y = c(t, [
        m * 2.6,
        0.5,
        -6
      ]);
      i(y, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), i(y, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), i(y, "cone", n.trim, [
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
function ql(e, t, r) {
  const a = e.group(t, [
    0,
    1.3,
    0
  ]);
  a.scale.setScalar(1.5);
  const n = e.group(a), s = e.group(a, [
    0,
    0.5,
    0
  ]), i = e.group(s), c = r === "female", l = c ? 0.225 : 0.255, o = _t.traveler.fabric, u = "#574a40", h = "#d7ab8b", d = "#463f3b";
  e.mesh(n, "sphere", o, [
    l,
    0.28,
    0.155
  ], [
    0,
    -0.04,
    0
  ]), e.mesh(n, "cylinder", o, [
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
  ]), e.mesh(s, "sphere", h, [
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
  for (const k of [-1, 1])
    e.mesh(s, "sphere", h, [
      0.027,
      0.042,
      0.027
    ], [
      k * 0.166,
      -0.01,
      0
    ]), e.mesh(s, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      k * 0.061,
      0.016,
      0.155
    ]), e.mesh(s, "box", d, [
      0.047,
      0.012,
      0.014
    ], [
      k * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", d, [
      0.035,
      0.12,
      0.08
    ], [
      k * 0.157,
      0.035,
      -0.036
    ]);
  if (e.mesh(s, "sphere", h, [
    0.027,
    0.041,
    0.028
  ], [
    0,
    -0.025,
    0.16
  ]), e.mesh(s, "box", "#a86e60", [
    0.045,
    9e-3,
    0.012
  ], [
    0,
    -0.1,
    0.148
  ]), c) {
    const k = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let C = 0; C < 4; C++) e.mesh(k, "sphere", d, [
      0.064 - C * 9e-3,
      0.09,
      0.063 - C * 8e-3
    ], [
      C % 2 ? 0.014 : -0.014,
      -C * 0.115,
      0
    ]);
    e.mesh(k, "box", o, [
      0.066,
      0.032,
      0.066
    ], [
      0,
      -0.33,
      0
    ]);
  }
  const f = [], m = [];
  for (const k of [-1, 1]) {
    const C = e.group(a, [
      k * l,
      0.12,
      0
    ]);
    f.push(C), e.mesh(C, "cylinder", o, [
      0.076,
      0.27,
      0.078
    ], [
      0,
      -0.12,
      0
    ]), e.mesh(C, "cylinder", "#e5dfcd", [
      0.081,
      0.085,
      0.081
    ], [
      0,
      -0.27,
      0
    ]), e.mesh(C, "cylinder", h, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(C, "sphere", h, [
      0.06,
      0.075,
      0.047
    ], [
      0,
      -0.45,
      0.015
    ]);
    const v = e.group(a, [
      k * 0.105,
      -0.32,
      0
    ]);
    m.push(v), e.mesh(v, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(v, "cylinder", u, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(v, "sphere", u, [
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
  const y = [
    n,
    s,
    i,
    ...f,
    ...m
  ].map((k) => e.bake(k));
  s.add(i);
  const b = [];
  a.traverse((k) => {
    k instanceof $t && k.material === e.material(o) && b.push(k);
  });
  let w = null;
  return {
    body: a,
    hand: e.group(f[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(k) {
      if (k !== w) {
        w = k;
        for (const C of b) C.material = e.material(_t[k].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(_t[k].head);
      }
    },
    pose(k, C, v, R, _, A) {
      a.position.y = 1.3 + v, a.rotation.set(!_ && R ? 0.16 : 0, Math.PI / 2 - k, 0), m.forEach((S, P) => {
        S.rotation.x = (P ? -1 : 1) * C;
      }), f.forEach((S, P) => {
        S.rotation.set(P && A ? -0.55 : (P ? 1 : -1) * C * 0.65, 0, (P ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      y.forEach((k) => k()), a.removeFromParent();
    }
  };
}
function Wl(e, t, r) {
  const a = _t[r], { mesh: n, group: s, shape: i } = e, c = s(t, [
    0,
    0.2,
    -0.23
  ]), l = s(t, [
    0,
    0.328,
    0
  ]), o = s(t, [
    0,
    0.55,
    0
  ]);
  l.scale.set(0.64, 0.78, 0.72);
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
    n(l, "sphere", a.metal, [
      0.31,
      0.13,
      0.265
    ], [
      0,
      0.44,
      -0.015
    ], !1, 1, !0);
    for (const h of [-1, 1]) n(l, "box", a.metal, [
      0.065,
      0.22,
      0.17
    ], [
      h * 0.285,
      0.29,
      -0.02
    ], !1, 1, !0);
  } else if (a.head === "hat")
    n(l, "cylinder", a.fabric, [
      0.43,
      0.045,
      0.32
    ], [
      0,
      0.46,
      0
    ]), n(l, "cone", a.fabric, [
      0.23,
      0.48,
      0.23
    ], [
      0.055,
      0.7,
      -0.02
    ]).rotation.z = -0.18, n(l, "torus", a.metal, [
      0.245,
      0.245,
      0.24
    ], [
      0,
      0.52,
      -0.01
    ]).rotation.x = Math.PI / 2;
  else if (a.head === "hood") {
    n(l, "sphere", a.fabric, [
      0.345,
      0.35,
      0.265
    ], [
      0,
      0.22,
      -0.12
    ]);
    for (const h of [-1, 1]) n(l, "sphere", a.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      h * 0.285,
      0.19,
      0.055
    ]);
  } else if (a.head === "crown") {
    n(l, "torus", a.metal, [
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
      n(l, "cone", a.metal, [
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
    const d = s(l, [
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
    for (const f of [0.16, 0.3]) n(d, "cone", a.metal, [
      0.025,
      0.22,
      0.025
    ], [
      h * 0.06,
      f,
      0
    ]).rotation.z = h * -0.8;
  }
  else if (a.head === "goggles") {
    n(l, "torus", "#4c4a42", [
      0.32,
      0.22,
      0.27
    ], [
      0,
      0.4,
      0
    ]).rotation.x = Math.PI / 2;
    for (const h of [-1, 1])
      n(l, "torus", a.metal, [
        0.095,
        0.075,
        0.05
      ], [
        h * 0.115,
        0.39,
        0.24
      ]), n(l, "sphere", a.glow, [
        0.08,
        0.06,
        0.045
      ], [
        h * 0.115,
        0.39,
        0.24
      ]);
  }
  switch (r) {
    case "guardian":
      n(l, "cone", a.fabric, [
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
      n(l, "crescent", a.metal, [
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
      n(l, "cone", a.glow, [
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
      n(o, "torus", a.metal, [
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
        n(o, "rock", a.glow, [
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
      o.rotation.y = d ? 0.4 : h * 0.014;
    }
  };
}
function Hl(e, t, r, a, n, s) {
  const { mesh: i, group: c, shape: l } = e, o = "#d6b881", u = "#fff0c1", h = (d, f, m) => {
    for (const y of [-1, 1]) i(r, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      y * m,
      d,
      f
    ], !0);
  };
  switch (n) {
    case "bridgekeeper":
    case "heatkeeper": {
      const d = n === "heatkeeper", f = d ? "#374e62" : "#667376";
      for (const m of [-1, 1]) i(t, "box", "#393d43", [
        0.4,
        1.05,
        0.52
      ], [
        m * 0.36,
        0.6,
        0
      ]);
      i(t, "box", f, [
        1.2,
        1.65,
        0.75
      ], [
        0,
        1.95,
        0
      ]), i(t, "box", "#ae8564", [
        0.78,
        1.28,
        0.13
      ], [
        0,
        1.85,
        0.44
      ]), i(r, "sphere", "#c9a78b", [
        0.46,
        0.55,
        0.42
      ], [
        0,
        3.02,
        0
      ]), i(r, "cylinder", "#656e72", [
        0.56,
        0.25,
        0.49
      ], [
        0,
        3.5,
        0
      ]), i(r, "box", o, [
        0.73,
        0.17,
        0.12
      ], [
        0,
        3.12,
        0.43
      ]), h(3.13, 0.51, 0.18), i(t, "cylinder", "#ab8257", [
        0.38,
        1.55,
        0.38
      ], [
        -0.69,
        2.15,
        -0.52
      ]), i(t, "torus", "#4e555a", [
        0.55,
        0.55,
        0.3
      ], [
        0.7,
        1.65,
        -0.2
      ]), a.position.set(0.95, 1.6, 0.3), i(a, "cylinder", "#848b8c", [
        0.09,
        2.7,
        0.09
      ]), i(a, "torus", "#bd9865", [
        0.4,
        0.4,
        0.2
      ], [
        0,
        1.45,
        0
      ]), d && i(t, "box", "#edbc76", [
        0.16,
        0.38,
        0.07
      ], [
        0.34,
        2.45,
        0.46
      ], !0);
      break;
    }
    case "thornheart":
      i(t, "cone", "#576e58", [
        1.6,
        2.9,
        1.3
      ], [
        0,
        1.45,
        0
      ]), i(r, "rock", "#8da17f", [
        0.8,
        1,
        0.65
      ], [
        0,
        2.3,
        0.5
      ]), h(2.6, 1.06, 0.28);
      for (let d = 0; d < 7; d++) {
        const f = d * Math.PI * 2 / 7, m = c(t, [
          Math.cos(f) * 0.8,
          2.6,
          Math.sin(f) * 0.6
        ]);
        m.rotation.z = Math.cos(f) * 0.8, i(m, "cone", "#526451", [
          0.18,
          2.4,
          0.18
        ], [
          0,
          0.9,
          0
        ]), i(m, "rock", s.foliage, [
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
          Math.cos(f),
          0.28,
          Math.sin(f)
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
      ]), i(r, "sphere", "#c3c1db", [
        0.5,
        0.6,
        0.42
      ], [
        0,
        3.1,
        0
      ]), i(r, "box", "#4c4469", [
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
      ]) i(a, "torus", o, [
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
      ]), i(r, "sphere", "#e4ac68", [
        0.4,
        0.5,
        0.43
      ], [
        0,
        3.15,
        0.25
      ]), h(3.25, 0.63, 0.18), i(r, "cone", o, [
        0.18,
        0.55,
        0.15
      ], [
        0,
        3.03,
        0.76
      ]).rotation.x = Math.PI / 2;
      for (const d of [-1, 1]) {
        for (let f = 0; f < 5; f++) l(a, [
          [0, 0],
          [d * (2.4 - f * 0.25), 0.95 - f * 0.22],
          [d * (2 - f * 0.24), -0.1 - f * 0.24],
          [0, -0.45]
        ], f % 2 ? "#e2a465" : "#d47c4f", [
          d * 0.4,
          2.5,
          -0.1 - f * 0.06
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
      ]), i(r, "cylinder", "#b08563", [
        0.7,
        0.7,
        0.6
      ], [
        0,
        3.05,
        0
      ]), i(r, "box", "#ffd18c", [
        0.65,
        0.1,
        0.08
      ], [
        0,
        3.12,
        0.63
      ], !0);
      for (const d of [-1, 1])
        i(t, "cylinder", s.dark, [
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
      ], !0), i(r, "box", "#818883", [
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
      ]), i(r, "sphere", "#d5e9ec", [
        0.45,
        0.58,
        0.4
      ], [
        0,
        3.35,
        0
      ]), h(3.4, 0.39, 0.18);
      for (let d = -2; d <= 2; d++) i(r, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(d) * 0.08,
        0.11
      ], [
        d * 0.18,
        3.94,
        0.02
      ]);
      for (const d of [-1, 1]) l(t, [
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
        const f = 1 - d * 0.14;
        i(t, "sphere", d % 2 ? "#658c9c" : "#7da9b8", [
          f,
          f * 0.8,
          f
        ], [
          Math.sin(d * 0.6) * 0.4,
          0.8,
          0.5 - d * 0.8
        ]), i(t, "cone", "#d7e9dc", [
          0.2 * f,
          0.6 * f,
          0.25 * f
        ], [
          0,
          1.5 - d * 0.13,
          0.4 - d * 0.7
        ]);
      }
      i(r, "rock", "#7da9b8", [
        1.05,
        0.7,
        0.85
      ], [
        0,
        1.05,
        1
      ]), h(1.32, 1.65, 0.43);
      for (const d of [-1, 1])
        l(a, [
          [0, 0],
          [d * 1.4, 0.1],
          [d * 0.8, -0.7]
        ], "#b6d6d8", [
          d * 0.7,
          0.7,
          0
        ]), i(r, "cone", "#e4efde", [
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
      ]), i(r, "rock", "#e7dcc4", [
        0.45,
        0.62,
        0.38
      ], [
        0,
        3.6,
        0
      ]), h(3.65, 0.38, 0.16);
      for (let d = 0; d < 5; d++) {
        const f = d * Math.PI * 2 / 5, m = c(a, [
          Math.cos(f) * 1.7,
          2.5 + Math.sin(f) * 0.6,
          Math.sin(f) * 1.3
        ]);
        m.rotation.z = f * 0.3, i(m, "box", "#baa481", [
          0.55,
          0.72,
          0.14
        ]), i(m, "box", "#f1e4c6", [
          0.48,
          0.65,
          0.15
        ], [
          0,
          0,
          0.03
        ]);
      }
      i(r, "torus", o, [
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
      ]), i(r, "rock", "#b8afcc", [
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
        const f = c(a, [
          d * 0.85,
          1.8,
          0.2
        ]);
        f.rotation.z = d * -0.25, l(f, [
          [-0.07, 0],
          [0.15, 0],
          [0.3, 1.5],
          [0.12, 2.25],
          [-0.13, 1.7]
        ], "#dfc9ff");
      }
      l(t, [
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
function Vl(e, t) {
  const r = e.group(t), a = e.group(r), n = [
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
  ], s = e.shape(a, n, Ke.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, Ke.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, Ke.enamel, [
    0,
    0,
    -0.018
  ]).scale.set(0.87, 0.87, 1);
  for (const o of [-0.025, 0.09])
    e.shape(a, [
      [0, 0.24],
      [0.08, 0.12],
      [0.045, -0.07],
      [0, -0.2],
      [-0.045, -0.07],
      [-0.08, 0.12]
    ], Ke.silver, [
      0,
      0,
      o
    ]), e.mesh(a, "rock", Ke.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      o + Math.sign(o) * 0.014
    ], !1, 1, !0);
  let c = 0, l = -1;
  return r.visible = !1, { update(o, u, h, d, f) {
    const m = u ? 1 : 0, y = Math.max(0, Math.min(4, d - l));
    c = f || l < 0 || d < l ? m : c + (m - c) * (1 - Math.exp(-y * 0.85)), l = d, r.visible = o === "blade" || u || c > 0.04, r.position.set(-0.4 + c * 0.12, -0.1 + c * 0.3, 0.17 + c * 0.25), r.rotation.set(0.12 - c * 0.22, 0.15 - c * 0.3, -0.16 + c * 0.22), a.scale.setScalar(0.94 + c * 0.07), s.material = e.material(h ? Ke.parry : o === "blade" ? Ke.block : Ke.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : Ke.enamel);
  } };
}
function Yl(e, t) {
  const r = e.group(t), a = new Co({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new lr(Ke.ward) },
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
  }), n = new $t(e.geometries.sphere, a);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, r.add(n), r.visible = !1, {
    update(s, i) {
      r.visible = !!s && s.ward > 0, !(!s || !r.visible) && (r.position.set(s.x, 0, s.y), a.uniforms.impact.value = i, r.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), r.removeFromParent();
    }
  };
}
function Gl(e, t) {
  const r = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  r.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const h = e.group(r);
    e.mesh(h, "box", ut.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(h, "box", ut.page, [
      0.22,
      0.06,
      0.38
    ], [
      u * 0.12,
      0.04,
      0
    ]), a.push(h);
  }
  const n = e.group(r, [
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
  const s = e.mesh(r, "rock", ut.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(r, "torus", ut.crest, [
    0.17,
    0.17,
    0.17
  ], [
    0,
    0.31,
    0
  ], !0, 0.65);
  i.rotation.x = Math.PI / 2;
  let c = 0, l = 0.15, o = -1;
  return { update(u, h, d, f) {
    const m = f || o < 0 || d < o ? 1 : 1 - Math.exp(-Math.min(4, d - o) * 0.5);
    o = d, c += ((u ? 1 : 0) - c) * m, l += ((h ? 0.5 : u ? 0.28 : 0.15) - l) * m, r.position.y = l, r.rotation.x = -0.45 + (l - 0.15) * 0.7, a[0].rotation.z = -0.65 + c * 0.5, a[1].rotation.z = 0.65 - c * 0.5, n.rotation.z = f ? 0.2 : 0.2 + c * (Math.sin(d * 0.18) + 1) * 1.3, s.scale.set(0.07 + c * 0.025, 0.1 + c * 0.06, 0.07 + c * 0.025), i.visible = u, f || (s.rotation.y = d * 0.08);
  } };
}
function Ql() {
  let e = null, t = 0, r = -1 / 0, a = 0, n = 0;
  function s() {
    e = null, r = -1 / 0, a = 0, n = 0;
  }
  return {
    reset: s,
    get active() {
      return n > 0;
    },
    update(i, c, l) {
      (c < t || !i || l) && s();
      const o = e ? Math.min(0.1, c - t) : 0;
      i && e && Math.hypot(i.x - e.x, i.y - e.y) > 1e-3 && (r = c);
      const u = !l && c - r <= 2 / K.hz, h = n > 0;
      n += ((u ? 1 : 0) - n) * (1 - Math.exp(-o * (u ? 14 : 18))), !u && n < 1e-3 ? (n = 0, a = 0) : h && (a = (a + o * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = i ? {
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
function Qs(e, t, r = 1) {
  const a = e.group(t);
  a.scale.setScalar(r), e.shape(a, [
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
function Ks(e, t, r) {
  const a = e.group(t), n = ql(e, a, r), s = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), c = e.group(s), l = n.hand, o = e.group(c), u = Vl(e, c), h = Ql();
  let d = null, f = -1, m = Math.PI / 2, y = null, b = null, w = null;
  function k(C, v) {
    if (!(C === b && v === w)) {
      if (b = C, w = v, o.clear(), l.clear(), d = null, y = Wl(e, o, w), n.dress(w), b === "blade")
        e.mesh(l, "cylinder", "#624d42", [
          0.035,
          0.28,
          0.035
        ], [
          0,
          -0.08,
          0.06
        ]), e.mesh(l, "box", "#d4b470", [
          0.32,
          0.05,
          0.11
        ], [
          0,
          0.07,
          0.06
        ], !1, 1, !0), e.shape(l, [
          [-0.07, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83],
          [-0.07, 0.65]
        ], "#f5f8ef", [
          0,
          0,
          0.07
        ], 0.018), e.shape(l, [
          [0, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83]
        ], "#9cc6ce", [
          0,
          0,
          0.094
        ]);
      else if (b === "bow") Qs(e, l);
      else if (b === "staff")
        e.mesh(l, "cylinder", "#796889", [
          0.035,
          1.12,
          0.035
        ], [
          0,
          0.18,
          0.04
        ]), e.mesh(l, "torus", "#d8bc80", [
          0.19,
          0.24,
          0.18
        ], [
          0,
          0.85,
          0.04
        ], !1, 1, !0), e.mesh(l, "rock", "#b9ecff", [
          0.11,
          0.18,
          0.1
        ], [
          0,
          0.85,
          0.04
        ]);
      else if (b === "daggers") for (const R of [-1, 1]) {
        const _ = e.group(l, [
          R < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(_, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(_, [
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
      else if (b === "grimoire") d = Gl(e, l);
      else if (b === "cannon") {
        const R = e.group(l, [
          0.02,
          0.08,
          0.17
        ]);
        R.rotation.x = Math.PI / 2, e.mesh(R, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(R, "torus", "#d2a96c", [
          0.15,
          0.15,
          0.15
        ], [
          0,
          0.39,
          0
        ], !1, 1, !0).rotation.x = Math.PI / 2, e.mesh(l, "box", "#906749", [
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
    update(C, v, R, _, A, S, P, L = !1) {
      k(v, R), u.update(v, !!C?.shield, !!C?.guard, _, S);
      const T = S || f < 0 || _ < f ? 1 : 1 - Math.exp(-Math.min(4, _ - f) * 0.65);
      f = _;
      const I = P ? Math.PI / 2 + 0.23 : C?.facing ?? Math.PI / 2;
      m += Math.atan2(Math.sin(I - m), Math.cos(I - m)) * T;
      const Z = h.update(P ? null : C, A, S), H = !!C?.dashTime;
      a.position.set(C?.x ?? 0, P ? 0.3 : 0, C?.y ?? -8), a.scale.setScalar(P ? 1.65 : 1), n.pose(m, Z.stride, Z.lift, H, S, !!C?.swing || L), y.cape.rotation.x = S ? -0.15 : -0.21 - Z.amount * 0.44 - Math.sin(_ * 0.15) * 0.12, y.animate(_, S);
      const F = C?.swing && !S ? Math.sin(C.swing / (v === "cannon" ? 16 : 9) * Math.PI) : 0;
      l.rotation.z += ((L ? -0.3 : -0.2 - F * 1.3) - l.rotation.z) * T, l.rotation.x += ((L ? -0.25 : 0.1 + F * 0.6) - l.rotation.x) * T, d && d.update(!!C?.resonance, L, _, S), i.scale.set(0.6 + (H ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function vr(e, t, r, a) {
  const { mesh: n, group: s } = e, i = s(t), c = s(i), l = s(c), o = s(c), u = [], h = Ce(r), d = he[r].radius;
  let f = null;
  e.ring(i, "#1d3540", d * 1.15, 0, 0, 0.16, !0);
  const m = "#cfad70", y = "#fff0b0", b = a.dark;
  function w(T, I, Z) {
    const H = s(c, [
      T,
      Z,
      I
    ]);
    n(H, "box", b, [
      0.32,
      Z,
      0.42
    ], [
      0,
      -Z / 2,
      0
    ]), n(H, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -Z + 0.11,
      0.1
    ]), u.push(H);
  }
  function k(T, I, Z = "#d9e8df") {
    n(T, "box", m, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(T, "box", b, [
      0.11,
      0.4,
      0.11
    ]), n(T, "box", Z, [
      0.2,
      I,
      0.13
    ], [
      0,
      I / 2 + 0.35,
      0
    ], !1, 1, !0), n(T, "cone", Z, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      I + 0.5,
      0
    ]);
  }
  if (r === "charger") {
    n(c, "rock", a.stone, [
      0.58,
      0.58,
      0.9
    ], [
      0,
      0.7,
      0
    ]), n(o, "rock", b, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const T of [-0.27, 0.27]) {
      const I = n(o, "cone", m, [
        0.15,
        0.7,
        0.15
      ], [
        T,
        1.15,
        0.9
      ]);
      I.rotation.x = 0.55, n(o, "sphere", y, [
        0.05,
        0.04,
        0.06
      ], [
        T,
        0.82,
        1.02
      ], !0), w(T, -0.42, 0.45), w(T, 0.45, 0.45);
    }
    for (let T = 0; T < 3; T++) n(c, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + T * 0.4
    ]);
  } else if (r === "weaver") {
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
    ]), n(o, "sphere", b, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const T = n(o, "crescent", m, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    T.rotation.z = 0.87;
    for (const I of [-0.23, 0.23]) n(o, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      I,
      4.08,
      0.45
    ], !0);
    for (const I of [-1, 1]) {
      const Z = s(c, [
        I * 0.8,
        3.3,
        0
      ]);
      Z.rotation.z = I * 0.65, n(Z, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(Z, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), u.push(Z);
    }
    for (let I = 0; I < 5; I++) {
      const Z = I / 5 * Math.PI * 2, H = n(l, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(Z) * 1.95,
        3.3 + Math.sin(Z) * 1.1,
        -0.3
      ]);
      H.rotation.z = Z;
    }
  } else if (r === "king") {
    w(-0.5, 0, 0.8), w(0.5, 0, 0.8), n(c, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(c, "box", b, [
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
    for (const T of [-1, 1]) n(c, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      T * 0.95,
      2.95,
      0
    ]);
    n(o, "sphere", b, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(o, "box", y, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(o, "torus", m, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let T = 0; T < 7; T++) {
      const I = T * Math.PI * 2 / 7;
      n(o, "cone", m, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(I) * 0.78,
        4.85,
        Math.sin(I) * 0.78
      ]);
    }
    l.position.set(1.55, 1.35, 0.2), l.rotation.z = -0.3, k(l, 3.4, "#f6dc9f"), n(c, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (r === "warden" || r === "keeper") {
    r === "keeper" && c.scale.setScalar(0.72), w(-0.65, 0.05, 0.85), w(0.65, 0.05, 0.85), n(c, "cylinder", b, [
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
    for (const I of [-1, 1])
      n(c, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        I * 1.03,
        2.7,
        0
      ]), n(c, "box", m, [
        0.7,
        0.1,
        0.8
      ], [
        I * 1.08,
        2.45,
        0.1
      ], !1, 1, !0);
    n(o, "sphere", a.stone, [
      0.73,
      0.77,
      0.63
    ], [
      0,
      3.2,
      0
    ]), n(o, "box", b, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(o, "box", y, [
      0.74,
      0.095,
      0.05
    ], [
      0,
      3.22,
      0.66
    ], !0), n(o, "cone", a.foliage, [
      0.27,
      1.1,
      0.5
    ], [
      0,
      4,
      -0.2
    ]);
    const T = s(c, [
      -1.32,
      1.5,
      0.6
    ]);
    f = T, n(T, "box", b, [
      1.2,
      1.8,
      0.25
    ]), n(T, "box", m, [
      1,
      1.58,
      0.28
    ]), n(T, "box", a.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(T, "rock", a.light, [
      0.28,
      0.4,
      0.1
    ], [
      0,
      0.1,
      0.22
    ]), l.position.set(1.5, 1.8, 0.25), n(l, "cylinder", "#766450", [
      0.1,
      2.5,
      0.1
    ]), n(l, "box", b, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(l, "box", m, [
      0.24,
      0.96,
      0.94
    ], [
      0,
      1.4,
      0
    ], !1, 1, !0), n(l, "box", a.light, [
      0.22,
      0.77,
      0.74
    ], [
      0.65,
      1.4,
      0
    ]);
  } else if (Ce(r)) Hl(e, c, o, l, r, a);
  else if (r === "wisp")
    n(c, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(o, "torus", m, [
      0.48,
      0.6,
      0.4
    ], [
      0,
      1,
      0
    ]), n(o, "sphere", "#f7f5e8", [
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
  else if (r === "stalker") {
    n(c, "sphere", a.dark, [
      0.4,
      0.35,
      0.65
    ], [
      0,
      0.55,
      0
    ]), n(o, "rock", a.foliage, [
      0.33,
      0.38,
      0.32
    ], [
      0,
      0.75,
      0.5
    ]);
    for (const T of [-1, 1])
      w(T * 0.27, -0.25, 0.35), n(o, "cone", m, [
        0.09,
        0.35,
        0.09
      ], [
        T * 0.21,
        1.09,
        0.42
      ]), n(o, "sphere", y, [
        0.05,
        0.04,
        0.035
      ], [
        T * 0.15,
        0.8,
        0.77
      ], !0), n(l, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        T * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (r === "bomber")
    w(-0.22, 0, 0.45), w(0.22, 0, 0.45), n(c, "sphere", "#85654c", [
      0.5,
      0.6,
      0.4
    ], [
      0,
      0.95,
      0
    ]), n(o, "sphere", a.stone, [
      0.35,
      0.38,
      0.31
    ], [
      0,
      1.62,
      0
    ]), n(o, "box", a.dark, [
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
    ]), n(l, "sphere", "#404c57", [
      0.25,
      0.25,
      0.25
    ], [
      0.56,
      1.1,
      0.18
    ]), n(l, "cone", "#ffca88", [
      0.07,
      0.3,
      0.07
    ], [
      0.56,
      1.41,
      0.18
    ]);
  else {
    const T = r === "priest", I = r === "guard";
    if (T ? n(c, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (w(-0.22, 0, 0.5), w(0.22, 0, 0.5), n(c, "box", b, [
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
    ]), n(o, "sphere", a.stone, [
      0.43,
      0.45,
      0.38
    ], [
      0,
      1.63,
      0
    ]), n(o, "box", b, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(o, "box", y, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), T)
      n(o, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), l.position.set(0.52, 1, 0.1), n(l, "cylinder", m, [
        0.04,
        1.6,
        0.04
      ]), n(l, "rock", "#d1dcff", [
        0.22,
        0.32,
        0.22
      ], [
        0,
        0.95,
        0
      ]);
    else {
      n(o, "box", a.foliage, [
        0.12,
        0.38,
        0.55
      ], [
        0,
        2,
        -0.07
      ]);
      for (const Z of [-1, 1]) n(c, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        Z * 0.45,
        1.22,
        0
      ]);
      l.position.set(0.54, 1, 0.2), r === "archer" ? Qs(e, l, 1.3) : (l.rotation.z = -0.3, k(l, 0.75)), I && (n(c, "box", m, [
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
  const C = s(i, [
    0,
    h ? 5.5 : r === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(C, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const v = n(C, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), R = [];
  c.traverse((T) => {
    T instanceof $t && R.push({
      mesh: T,
      material: T.material
    });
  });
  let _ = 0, A = -100, S = 0, P = 0;
  const L = l.rotation.z;
  return {
    root: i,
    bar: C,
    update(T, I, Z, H = !1) {
      const F = Math.abs(T.x - S) + Math.abs(T.y - P) > 5e-3;
      S = T.x, P = T.y, _ && !T.windup && (A = I), _ = T.windup;
      const N = T.windup ? 1 - T.windup / he[T.kind].windup : 0, Y = Math.max(0, 1 - (I - A) / 10);
      i.position.set(T.x, 0, T.y), c.rotation.y = Math.PI / 2 - T.angle, c.position.y = Z ? 0 : r === "weaver" || r === "priest" ? 0.13 + Math.sin(I * 0.055) * 0.1 : F ? Math.abs(Math.sin(I * 0.3)) * 0.055 : 0, c.rotation.x = Z ? 0 : -N * 0.16 + Y * 0.2, o.rotation.z = !Z && r === "king" ? Math.sin(I * 0.035) * 0.08 : 0, l.rotation.x = Z ? 0 : N * -1.3 + Y * 1.4, l.rotation.z = L + (Z ? 0 : N * -0.35), f && H && (f.visible = r !== "warden" || hs(T.phase), f.rotation.x = T.exposed ? -Math.PI / 3 : 0);
      for (let ae = 0; ae < u.length; ae++) u[ae].rotation.x = !Z && F ? Math.sin(I * 0.32 + ae * Math.PI) * 0.28 : 0;
      for (const ae of R) ae.mesh.material = T.marked > 2 && !Z ? e.material("#fff6dd") : ae.material;
      C.visible = !h && T.hp < T.maxHp, v.scale.x = T.hp / T.maxHp, v.position.x = (T.hp / T.maxHp - 1) * 0.5;
    }
  };
}
var se = {
  danger: "#c34740",
  warning: "#ec8754",
  magic: "#8bd9f2",
  frost: "#addffc",
  gold: "#fff0bb",
  heal: "#75dbb0",
  fire: "#f0ad55"
};
function Kl(e, t) {
  const r = /* @__PURE__ */ new Map();
  function a(s, i, c = 1, l = !1) {
    const o = Math.max(0.1, Math.min(1, Math.round(c * 10) / 10)), u = `${s}/${i}/${o}/${l}`;
    let h = r.get(u);
    h || (h = {
      list: [],
      used: 0
    }, r.set(u, h));
    let d = h.list[h.used++];
    return d || (d = e.mesh(t, s, i, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !l, o), h.list.push(d)), d.visible = !0, d.rotation.set(0, 0, 0), d.scale.set(1, 1, 1), d;
  }
  function n(s, i, c, l, o, u = 1, h = 0.09) {
    const d = a(s, i, u);
    return d.position.set(l, h, o), d.scale.set(c, c, 1), d.rotation.x = -Math.PI / 2, d;
  }
  return { update(s, i, c) {
    for (const o of r.values())
      o.used = 0, o.list.forEach((u) => u.visible = !1);
    if (c) {
      const { left: o, right: u, top: h, bottom: d } = c;
      for (const f of [o, u]) {
        const m = a("box", se.warning, 0.5);
        m.position.set(f, 0.14, (h + d) / 2), m.scale.set(0.1, 0.15, d - h);
      }
      for (const f of [h, d]) {
        const m = a("box", se.warning, 0.5);
        m.position.set((o + u) / 2, 0.14, f), m.scale.set(u - o, 0.15, 0.1);
      }
    }
    if (!s) return;
    const l = s.player;
    if (n("ring", "#f2f6e2", 0.64, l.x, l.y, 0.8), l.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const u = a("cone", se.gold, 0.7 - o * 0.15);
      u.position.set(l.x - Math.cos(l.dashAngle) * o * 0.43, 0.45, l.y - Math.sin(l.dashAngle) * o * 0.43), u.scale.set(0.13, l.dashTime / 8 * 1.7, 0.13), u.rotation.set(0, -l.dashAngle, -Math.PI / 2);
    }
    if (!s.boss && (s.encounter === "siege" || s.encounter === "ritual")) {
      const o = s.objective;
      s.encounter === "ritual" && (n("disc", se.magic, 2.5, o.x, o.y, 0.12), n("ring", se.magic, 2.5, o.x, o.y), n("ring", se.gold, 2.2, o.x, o.y, 0.8));
      const u = a("cylinder", "#526b79");
      u.position.set(o.x, 0.3, o.y), u.scale.set(0.5, 0.6, 0.5);
      const h = a("rock", s.encounter === "siege" ? se.fire : se.magic);
      if (h.position.set(o.x, 1, o.y), h.scale.set(0.23, 0.5, 0.23), s.encounter === "siege") {
        h.position.y = 1.35, h.scale.set(0.4, 0.85, 0.4);
        const d = a("cone", se.gold, 0.8);
        d.position.set(o.x, 1.4, o.y), d.scale.set(0.2, 0.85, 0.2), n("ring", se.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (h.rotation.y = s.tick * 0.025);
    }
    for (const o of s.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", se.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const u = a("cylinder", "#687c81");
          u.position.set(o.x, 0.25, o.y), u.scale.set(0.4, 0.5, 0.4);
          const h = a("box", "#bd9a68");
          h.position.set(o.x, 0.65, o.y), h.scale.set(0.9, 0.2, 0.25), h.rotation.y = -o.angle;
          const d = a("sphere", se.magic);
          d.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const u = o.kind === "familiar" && l.resonance > 0, h = u ? 1.5 : 1, d = o.kind === "shade" ? "#a6acd8" : u ? ut.empowered : ut.familiar, f = i ? 0 : Math.sin(s.tick * 0.1 + o.id) * 0.08, m = a("sphere", d, 1, !0);
          m.position.set(o.x, 0.55 * h + f, o.y), m.scale.set(0.3 * h, 0.36 * h, 0.3 * h);
          for (const b of [-1, 1]) {
            const w = a("cone", d, 1, !0);
            w.position.set(o.x + b * 0.2 * h, 0.93 * h + f, o.y), w.scale.set(0.08 * h, 0.22 * h, 0.08 * h);
          }
          const y = a("sphere", "#35475b");
          if (y.position.set(o.x + Math.cos(o.angle) * 0.28 * h, 0.63 * h + f, o.y + Math.sin(o.angle) * 0.28 * h), y.scale.setScalar(0.07 * h), u) {
            const b = a("torus", ut.crest, 1, !0);
            b.position.set(o.x, 1.45 + f, o.y), b.rotation.x = Math.PI / 2, b.scale.setScalar(0.32);
            for (let w = 0; w < 3; w++) {
              const k = w * Math.PI * 2 / 3, C = a("rock", ut.crest, 1, !0);
              C.position.set(o.x + Math.cos(k) * 0.32, 1.55 + f, o.y + Math.sin(k) * 0.32), C.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of s.enemies) {
      if (Ce(o.kind) && o.phase > 1) {
        const u = he[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? se.fire : se.magic, u, o.x, o.y, 0.65), !i) for (let h = 0; h < o.phase + 2; h++) {
          const d = s.tick * 0.025 + h * Math.PI * 2 / (o.phase + 2), f = a("rock", o.kind === "king" ? se.fire : se.magic, 0.8);
          f.position.set(o.x + Math.cos(d) * u, 0.55 + Math.sin(d * 2) * 0.2, o.y + Math.sin(d) * u), f.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const u = 1 - o.windup / he[o.kind].windup;
        if (n("ring", se.warning, he[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const h = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), d = a("box", se.danger, 0.3);
          d.scale.set(0.75, 0.035, h), d.position.set(o.x + Math.cos(o.angle) * h / 2, 0.09, o.y + Math.sin(o.angle) * h / 2), d.rotation.y = Math.PI / 2 - o.angle, n("ring", se.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const h = Math.hypot(o.target.x - o.x, o.target.y - o.y), d = a("box", se.warning, 0.6);
          d.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), d.scale.set(h, 0.03, 0.09), d.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", se.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", se.danger, he[o.kind].reach, o.target.x, o.target.y, 0.15 + u * 0.2), n("ring", se.danger, he[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", se.frost, he[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", se.gold, he[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let u = 0; u < 3; u++) {
        const h = a("rock", se.fire, 0.8);
        h.position.set(o.x + Math.sin(u * 2) * 0.3, 0.35 + (s.tick + u * 7) % 20 / 18, o.y + Math.cos(u * 2) * 0.3), h.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of s.hazards) {
      const u = o.friendly ? o.kind === "fire" ? se.fire : se.magic : se.danger;
      if (o.kind === "beam") {
        const h = a("box", u, o.wait ? 0.3 : 0.75);
        h.position.set(o.x + Math.cos(o.angle) * o.length / 2, 0.11, o.y + Math.sin(o.angle) * o.length / 2), h.scale.set(o.length, 0.04, o.width * 2), h.rotation.y = -o.angle;
        for (const d of [0, o.length]) n("disc", u, o.width, o.x + Math.cos(o.angle) * d, o.y + Math.sin(o.angle) * d, o.wait ? 0.3 : 0.75);
        continue;
      }
      if (o.kind === "ring") {
        for (let h = 0; h <= 5; h++) {
          const d = n(o.gap ? "openRing" : "ring", u, o.inner + (o.radius - o.inner) * h / 5, o.x, o.y, h === 0 || h === 5 ? 1 : o.wait ? 0.35 : 0.8);
          d.rotation.z = -o.angle;
        }
        continue;
      }
      if (n("disc", u, o.radius, o.x, o.y, o.wait ? 0.2 : 0.4), n("ring", u, o.radius, o.x, o.y), o.wait) {
        n("ring", u, o.radius * (1 - Math.min(1, o.wait / 45)), o.x, o.y, 0.7);
        const h = a("box", u, 0.7);
        h.position.set(o.x, 0.12, o.y), h.scale.set(0.08, 0.02, 0.6);
        const d = a("box", u, 0.7);
        d.position.copy(h.position), d.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", se.gold, o.radius * (0.7 + Math.sin(s.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let h = 0; h < 6; h++) {
          const d = h * Math.PI / 3, f = a("cone", u, 0.7);
          f.position.set(o.x + Math.cos(d) * o.radius * 0.65, 0.45, o.y + Math.sin(d) * o.radius * 0.65), f.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of s.shots) {
      const u = o.friendly ? se.gold : se.danger, h = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      h.position.set(o.x, 0.6, o.y), h.scale.set(0.11, 0.11, 0.11);
      const d = a("sphere", u, 0.8);
      d.position.copy(h.position), d.scale.set(0.21, 0.18, 0.21);
      const f = a("cone", u, 0.5);
      f.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), f.scale.set(0.14, 0.75, 0.14), f.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of s.effects) {
      const u = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const h = n("arc", se.gold, o.size, o.x, o.y, 0.3 * (1 - u), 0.42);
        h.rotation.z = -o.angle - 0.9 + u * 0.4;
        const d = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - u), 0.43);
        d.rotation.z = h.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", ut.crest, o.size * (i ? 1 : 0.6 + u * (2 - u)), o.x, o.y, 0.8 - u * 0.6, 0.16);
        for (const h of s.companions) {
          if (h.kind !== "familiar" || h.hp <= 0 || h.life <= 0) continue;
          const d = h.x - l.x, f = h.y - l.y, m = a("box", ut.empowered, 1 - u * 0.7);
          m.position.set((l.x + h.x) / 2, 1.1, (l.y + h.y) / 2), m.scale.set(Math.hypot(d, f), 0.045, 0.045), m.rotation.y = -Math.atan2(f, d);
        }
        for (let h = 0; h < 4; h++) {
          const d = h * Math.PI / 2 + (i ? 0 : u), f = a("rock", ut.empowered, 1 - u * 0.4);
          f.position.set(l.x + Math.cos(d) * 0.95, 1.7 + (i ? 0 : u * 0.5), l.y + Math.sin(d) * 0.95), f.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let h = 0; h < 4; h++) {
          const d = a("box", h % 2 ? "#ffffff" : se.magic, 1 - u * 0.6);
          d.scale.set(0.09 + (1 - u) * 0.09, 1.05, 0.08), d.position.set(o.x + (h % 2 ? 0.14 : -0.14), 0.5 + h * 0.85, o.y), d.rotation.z = h % 2 ? -0.35 : 0.35;
        }
        n("ring", se.magic, 0.4 + u, o.x, o.y, 1 - u);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const h = o.kind === "block" || o.kind === "parry", d = o.kind === "ward-break", f = h ? o.kind === "parry" ? Ke.parry : Ke.block : Ke.ward;
        if (h) {
          const m = a("ring", f, 1 - u);
          m.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), m.rotation.y = Math.PI / 2 - o.angle, m.scale.setScalar(0.6 + u * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let m = 0; m < (d ? 6 : 4); m++) {
          const y = m * 2.4 + o.id, b = a(d ? "rock" : "box", f, 1 - u), w = i ? 1.1 : 0.7 + u * (d ? 1.5 : 0.6);
          b.position.set(o.x + Math.cos(y) * w, 0.7 + m % 3 * 0.55, o.y + Math.sin(y) * w), b.scale.set(0.07 * (1 - u), (d ? 0.3 : 0.16) * (1 - u), 0.04), b.rotation.set(y, y, y);
        }
      } else if (o.kind === "heal") n("ring", se.heal, 0.4 + u, o.x, o.y, 1 - u);
      else {
        const h = o.kind === "hit" ? se.danger : se.gold;
        if (n("ring", h, o.size * (0.4 + u), o.x, o.y, 1 - u), !i) for (let d = 0; d < 7; d++) {
          const f = d * 2.4 + o.id, m = a("rock", h, 1 - u * 0.8);
          m.position.set(o.x + Math.cos(f) * u * o.size, 0.4 + Math.sin(u * Math.PI) * 0.8, o.y + Math.sin(f) * u * o.size), m.scale.set(0.1 * (1 - u), 0.28 * (1 - u), 0.1 * (1 - u)), m.rotation.z = f;
        }
      }
    }
  } };
}
function Xl(e) {
  const t = document.createElement("div"), r = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", Ke.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", re.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(r);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new St();
  let s = null, i = 0, c = 0, l = null;
  function o(u, h, d, f, m, y, b) {
    n.set(h, d, f).project(m), u.style.left = `${(n.x * 0.5 + 0.5) * y}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * b}px`;
  }
  return {
    update(u, h, d, f) {
      if (u !== s && (s = u, i = 0, l = null, c = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const m = u.player;
      t.hidden || (r.style.width = `${m.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(m.ward)), o(t, m.x, 0, m.y, h, d, f));
      const y = u.effects.filter((w) => w.id > i && w.kind in re.defenseFeedback), b = y.find((w) => w.kind === "parry" || w.kind === "ward-break") ?? y.at(-1);
      b && (l = b.kind, c = u.tick + 27), i = u.serial, u.tick >= c && (l = null), a.hidden = !l && !m.shield, a.dataset.state = l ?? "blocking", a.textContent = l ? re.defenseFeedback[l] : m.shield ? re.guardActive : "", o(a, m.x, m.shield ? 3.65 : 3.05, m.y, h, d, f);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function Jl(e, t, r, a) {
  const n = a.facing === "east" || a.facing === "west", s = n ? a.footprint.depth : a.footprint.width, i = n ? a.footprint.width : a.footprint.depth, c = s >= i;
  t.rotation.y = r.rotation.y = a.facing === "north" ? Math.PI : a.facing === "east" ? Math.PI / 2 : a.facing === "west" ? -Math.PI / 2 : 0;
  const l = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(s, i) / 5));
  e.mesh(t, "box", p.mortar, [
    s,
    0.4,
    i
  ], [
    0,
    0.2,
    0
  ]);
  for (let o = 0; o < l; o++) {
    const u = c ? s / l : s, h = c ? i : i / l, d = e.group(r, [
      c ? -s / 2 + (o + 0.5) * u : 0,
      0,
      c ? 0 : -i / 2 + (o + 0.5) * h
    ]), f = (a.height ?? 4) + (o % 3 - 1) * 0.35, m = a.kind === "workshop", y = a.facing ? a.tint === "rose" ? "#c9b8cb" : a.tint === "sage" ? "#b6c5ca" : "#d4c8bb" : o % 2 ? p.stone : p.cloth;
    e.mesh(d, "box", y, [
      u - 0.15,
      f - 0.4,
      h - 0.15
    ], [
      0,
      (f + 0.4) / 2,
      0
    ]);
    for (const v of [-u / 2 + 0.12, u / 2 - 0.12]) e.mesh(d, "box", p.timber, [
      0.18,
      f,
      h
    ], [
      v,
      f / 2,
      0
    ]);
    for (const v of [0.7, f - 0.3]) e.mesh(d, "box", p.wood, [
      u,
      0.15,
      h
    ], [
      0,
      v,
      0
    ]);
    const b = e.group(d, [
      0,
      f + 0.24,
      0
    ]);
    b.rotation.x = -0.18;
    const w = !c && l > 1 ? h - 0.03 : h + 0.7;
    e.mesh(b, "box", p.roof, [
      u + 0.6,
      0.16,
      w
    ]);
    for (let v = -u / 2; v <= u / 2; v += 0.8) e.mesh(b, "box", p.roofLight, [
      0.055,
      0.07,
      w
    ], [
      v,
      0.12,
      0
    ]);
    e.mesh(b, "box", p.brass, [
      u + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      w / 2
    ]);
    const k = e.group(d, [
      0,
      0,
      h / 2
    ]), C = a.entrance ? 0 : -u * 0.19;
    e.mesh(k, "box", p.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      C,
      1.1,
      0
    ]);
    for (const v of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(k, "box", p.wood, [
      0.24,
      1.95,
      0.12
    ], [
      C + v,
      1.06,
      0.04
    ]);
    if (e.mesh(k, "box", p.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      u * 0.27,
      2.25,
      0.03
    ]), e.mesh(k, "box", p.ember, [
      0.7,
      0.67,
      0.14
    ], [
      u * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(k, "box", p.timber, [
      0.07,
      0.85,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), e.mesh(k, "box", p.timber, [
      0.85,
      0.07,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), a.facing) {
      for (const [v, R, _] of [
        [
          0,
          h / 2,
          u
        ],
        [
          Math.PI,
          h / 2,
          u
        ],
        [
          -Math.PI / 2,
          u / 2,
          h
        ],
        [
          Math.PI / 2,
          u / 2,
          h
        ]
      ]) {
        const A = e.group(d);
        A.rotation.y = v;
        for (let S = -_ / 2 + 1.8; S < _ / 2 - 0.8; S += 3.2) for (let P = 2.1; P < f - 0.65; P += 2.5)
          v === 0 && P < 3 && (Math.abs(S - C) < 1.3 || Math.abs(S - u * 0.27) < 1.3) || (e.mesh(A, "box", p.shadow, [
            1.16,
            1.45,
            0.12
          ], [
            S,
            P,
            R
          ]), e.mesh(A, "box", p.ember, [
            0.94,
            1.17,
            0.07
          ], [
            S,
            P,
            R + 0.08
          ], !0), e.mesh(A, "box", p.timber, [
            0.08,
            1.3,
            0.11
          ], [
            S,
            P,
            R + 0.14
          ]), e.mesh(A, "box", p.timber, [
            1.03,
            0.09,
            0.11
          ], [
            S,
            P,
            R + 0.14
          ]), e.mesh(A, "box", p.light, [
            1.4,
            0.14,
            0.34
          ], [
            S,
            P - 0.76,
            R + 0.09
          ]));
        f > 5.5 && e.mesh(A, "box", p.light, [
          _,
          0.17,
          0.17
        ], [
          0,
          3.35,
          R
        ]);
      }
      if (a.entrance) {
        e.mesh(k, "box", p.timber, [
          2.9,
          0.8,
          0.18
        ], [
          0,
          3.45,
          0.14
        ]);
        for (const v of [
          -0.8,
          0,
          0.8
        ]) e.mesh(k, "box", p.brass, [
          0.25,
          0.38,
          0.04
        ], [
          v,
          3.45,
          0.25
        ]);
        for (const v of [-1, 1])
          e.mesh(k, "box", p.brass, [
            0.1,
            0.8,
            0.5
          ], [
            v * 1.6,
            2.9,
            0.25
          ]), e.mesh(k, "box", p.ember, [
            0.35,
            0.48,
            0.3
          ], [
            v * 1.6,
            2.5,
            0.43
          ], !0);
      }
    }
    if (h >= 4 && (c || o === l - 1)) {
      const v = e.group(k, [
        0,
        2.8,
        0.55
      ]);
      v.rotation.x = 0.22, e.mesh(v, "box", a.tint === "rose" ? p.rose : p.cloth, [
        u * 0.8,
        0.045,
        1.6
      ]), e.mesh(v, "box", p.light, [
        0.55,
        0.015,
        0.45
      ], [
        -u * 0.17,
        0.035,
        0.35
      ]);
    }
    if (m) {
      e.mesh(d, "box", p.wood, [
        u * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        h / 2 - 0.5
      ]);
      for (let v = 0; v < 3; v++) e.mesh(d, "cylinder", p.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (v - 1) * 0.55,
        1.4,
        h / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(d, "box", p.slate, [
        0.6,
        f * 0.38,
        0.7
      ], [
        -u * 0.3,
        f + 0.55,
        -h * 0.2
      ]), e.mesh(d, "box", p.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -u * 0.3,
        f * 1.19 + 0.6,
        -h * 0.2
      ]);
  }
}
function ec(e, t, r) {
  const a = e.group(t, [
    r.width / 2 + 0.04,
    0,
    0
  ]);
  a.rotation.y = Math.PI / 2;
  const n = Math.min(4.8, r.depth - 0.7);
  e.mesh(a, "box", p.timber, [
    n,
    0.16,
    2.2
  ], [
    0,
    3.25,
    1
  ]), e.mesh(a, "box", p.cloth, [
    n - 0.15,
    2.35,
    1.75
  ], [
    0,
    4.5,
    0.86
  ]);
  for (const i of [-n / 2 + 0.1, n / 2 - 0.1]) {
    e.mesh(a, "box", p.timber, [
      0.16,
      2.5,
      1.9
    ], [
      i,
      4.5,
      0.9
    ]);
    const c = e.mesh(a, "box", p.wood, [
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
  e.mesh(a, "box", p.shadow, [
    1.3,
    1,
    0.05
  ], [
    0,
    4.55,
    1.76
  ]), e.mesh(a, "box", p.ember, [
    1.03,
    0.77,
    0.06
  ], [
    0,
    4.55,
    1.8
  ], !0), e.mesh(a, "box", p.timber, [
    0.07,
    0.95,
    0.1
  ], [
    0,
    4.55,
    1.85
  ]);
  for (const i of [-0.78, 0.78]) e.mesh(a, "box", p.wood, [
    0.26,
    1.15,
    0.12
  ], [
    i,
    4.55,
    1.83
  ]);
  const s = e.group(a, [
    0,
    5.8,
    1.1
  ]);
  s.rotation.x = 0.14, e.mesh(s, "box", p.roof, [
    n + 0.45,
    0.16,
    2.5
  ]);
  for (let i = -n / 2; i < n / 2; i += 0.6) e.mesh(s, "box", p.roofLight, [
    0.07,
    0.1,
    2.53
  ], [
    i,
    0.1,
    0
  ]);
  e.mesh(a, "box", p.wood, [
    1.2,
    1.9,
    0.08
  ], [
    0,
    1,
    0.04
  ]), e.mesh(a, "box", p.timber, [
    0.1,
    0.4,
    0.06
  ], [
    0.3,
    1,
    0.11
  ]);
}
function tc(e, t) {
  e.mesh(t, "box", p.mortar, [
    4,
    0.2,
    4
  ], [
    0,
    0.1,
    0
  ]), e.mesh(t, "box", p.slate, [
    1.45,
    1.1,
    1.15
  ], [
    0,
    0.75,
    0
  ]), e.mesh(t, "box", p.shadow, [
    0.95,
    0.55,
    0.04
  ], [
    0,
    0.62,
    0.59
  ]), e.mesh(t, "box", p.ember, [
    0.62,
    0.24,
    0.05
  ], [
    0,
    0.52,
    0.62
  ], !0);
  for (const r of [
    -0.22,
    0,
    0.22
  ]) e.mesh(t, "box", p.shadow, [
    0.05,
    0.48,
    0.07
  ], [
    r,
    0.62,
    0.67
  ]);
  e.mesh(t, "cylinder", p.shadow, [
    0.13,
    2.5,
    0.13
  ], [
    -0.48,
    2.25,
    -0.4
  ]), e.mesh(t, "cylinder", p.pottery, [
    0.36,
    0.48,
    0.36
  ], [
    0.2,
    1.52,
    0
  ]), e.mesh(t, "cylinder", p.shadow, [
    0.38,
    0.07,
    0.38
  ], [
    0.2,
    1.79,
    0
  ]);
  for (let r = 0; r < 5; r++) e.mesh(t, "box", p.wood, [
    0.8,
    0.16,
    0.2
  ], [
    1.25,
    0.3 + r % 3 * 0.18,
    -0.5 + Math.floor(r / 3) * 0.24
  ]);
  e.mesh(t, "cylinder", p.timber, [
    0.38,
    0.65,
    0.38
  ], [
    -1.15,
    0.52,
    0.5
  ]);
  for (let r = 0; r < 5; r++) e.mesh(t, "rock", p.shadow, [
    0.18,
    0.16,
    0.17
  ], [
    -1.15 + Math.sin(r * 2) * 0.2,
    0.87,
    0.5 + Math.cos(r * 2) * 0.2
  ]);
}
function ac(e, t, r, a) {
  e.mesh(t, "box", p.wood, [
    r,
    0.16,
    a
  ], [
    0,
    1,
    0
  ]);
  for (const n of [-1, 1]) e.mesh(t, "box", p.timber, [
    0.18,
    1,
    a - 0.2
  ], [
    n * (r / 2 - 0.2),
    0.5,
    0
  ]);
  e.mesh(t, "box", p.cloth, [
    r * 0.4,
    0.025,
    a * 0.8
  ], [
    -r * 0.2,
    1.1,
    0
  ]);
  for (let n = 0; n < 5; n++)
    e.mesh(t, "cylinder", n % 2 ? p.pottery : p.slate, [
      0.16,
      0.32 + n % 2 * 0.15,
      0.16
    ], [
      r * 0.04 + n * 0.43,
      1.28,
      -0.3
    ]), e.mesh(t, "cylinder", p.wood, [
      0.17,
      0.055,
      0.17
    ], [
      r * 0.04 + n * 0.43,
      1.47 + n % 2 * 0.075,
      -0.3
    ]);
  for (let n = 0; n < 3; n++) e.mesh(t, "box", p.light, [
    0.8,
    0.12,
    0.48
  ], [
    -r * 0.25,
    1.18 + n * 0.12,
    0.12
  ]);
  e.mesh(t, "cylinder", p.pottery, [
    0.3,
    0.18,
    0.3
  ], [
    r * 0.22,
    1.19,
    0.45
  ]);
}
function nc(e, t, r) {
  const a = new St(...r.from), n = new St(...r.to), s = n.clone().sub(a), i = s.length(), c = r.kind === "pipe", l = c ? 0.23 : 0.018, o = e.mesh(t, "cylinder", c ? p.brass : p.timber, [
    l,
    i,
    l
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (o.quaternion.setFromUnitVectors(new St(0, 1, 0), s.normalize()), c) for (let u = 1; u < i; u += 3.7) {
    const h = a.clone().addScaledVector(s, u);
    e.mesh(t, "cylinder", p.wood, [
      0.28,
      0.16,
      0.28
    ], h.toArray()).quaternion.copy(o.quaternion), e.mesh(t, "box", p.shadow, [
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
    const h = a.clone().addScaledVector(s, u), d = e.group(t, h.toArray());
    d.rotation.y = Math.atan2(s.x, s.z) + Math.PI / 2, e.shape(d, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(u) % 2 ? p.cloth : p.light);
    for (const f of [-1, 1]) e.mesh(d, "box", p.wood, [
      0.07,
      0.17,
      0.06
    ], [
      f * 0.42,
      -0.02,
      0.03
    ]);
  }
}
function rc(e, t, r) {
  const { width: a, depth: n } = r.footprint;
  if (r.kind === "ledger") {
    e.mesh(t, "box", p.wood, [
      a,
      0.18,
      n
    ], [
      0,
      1.18,
      0
    ]);
    for (const c of [-1, 1]) e.mesh(t, "box", p.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      c * (a / 2 - 0.3),
      0.55,
      0
    ]);
    for (let c = -1; c <= 1; c++)
      e.mesh(t, "box", p.slate, [
        0.85,
        0.17,
        1.1
      ], [
        c * 1.2,
        1.35,
        -0.3
      ]), e.mesh(t, "box", p.light, [
        0.77,
        0.025,
        0.98
      ], [
        c * 1.2,
        1.45,
        -0.3
      ]), e.mesh(t, "box", p.brass, [
        0.08,
        0.025,
        1.13
      ], [
        c * 1.2,
        1.48,
        -0.3
      ]);
    e.mesh(t, "cylinder", p.brass, [
      0.18,
      0.25,
      0.18
    ], [
      a * 0.28,
      1.4,
      n * 0.28
    ]), e.mesh(t, "box", p.light, [
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
  e.mesh(t, "box", p.timber, [
    a,
    0.16,
    n
  ], [
    0,
    0.08,
    0
  ]);
  const s = Math.max(1, Math.floor(n / 2.2)), i = Math.max(1, Math.floor(a / 1.8));
  for (let c = 0; c < s; c++) for (let l = 0; l < i; l++) {
    const o = -a / 2 + (l + 0.5) * a / i, u = -n / 2 + (c + 0.5) * n / s, h = a / i - 0.22, d = n / s - 0.24;
    if (r.kind === "fuel") {
      for (let f = 0; f < 5; f++) e.mesh(t, "box", f % 2 ? p.wood : p.timber, [
        h,
        0.2,
        d / 2 - 0.07
      ], [
        o,
        0.28 + f * 0.24,
        u + f % 2 * 0.12
      ]);
      e.mesh(t, "box", p.cloth, [
        h + 0.08,
        0.055,
        d
      ], [
        o,
        1.42,
        u
      ]);
    } else {
      const f = 0.85 + (c + l) % 3 * 0.22;
      e.mesh(t, "box", p.wood, [
        h,
        f,
        d
      ], [
        o,
        0.16 + f / 2,
        u
      ]);
      for (const m of [-1, 1]) e.mesh(t, "box", p.timber, [
        0.11,
        f + 0.04,
        d + 0.05
      ], [
        o + m * h * 0.32,
        0.16 + f / 2,
        u
      ]);
      e.mesh(t, "box", p.light, [
        0.32,
        0.4,
        0.03
      ], [
        o,
        0.7,
        u + d / 2 + 0.02
      ]), e.mesh(t, "box", p.rose, [
        0.09,
        0.09,
        0.04
      ], [
        o,
        0.61,
        u + d / 2 + 0.045
      ]);
      for (let m = -0.25; m <= 0.25; m += 0.25) e.mesh(t, "box", p.timber, [
        h,
        0.015,
        0.016
      ], [
        o,
        f + 0.17,
        u + m * d
      ]);
      (c + l) % 3 === 0 && (e.mesh(t, "box", p.cloth, [
        h * 0.75,
        0.38,
        d * 0.55
      ], [
        o,
        f + 0.37,
        u - 0.18
      ]), e.mesh(t, "box", p.timber, [
        0.055,
        0.4,
        d * 0.57
      ], [
        o,
        f + 0.37,
        u - 0.18
      ])), e.mesh(t, "box", p.light, [
        0.32,
        0.018,
        0.45
      ], [
        o + h * 0.23,
        f + 0.19,
        u + d * 0.25
      ]);
    }
  }
}
function sc(e, t, r, a) {
  for (let n = 0; n < 3; n++) e.mesh(t, "box", p.slate, [
    r * 0.65,
    0.08,
    0.7
  ], [
    0,
    2.19 + n * 0.08,
    a * 0.22
  ]);
  e.mesh(t, "box", p.rose, [
    r * 0.6,
    0.03,
    0.08
  ], [
    0,
    2.41,
    a * 0.22 + 0.25
  ]), e.mesh(t, "cylinder", p.pottery, [
    0.22,
    0.15,
    0.22
  ], [
    r * 0.35,
    0.17,
    a * 0.35
  ]), e.mesh(t, "cylinder", p.shadow, [
    0.18,
    0.014,
    0.18
  ], [
    r * 0.35,
    0.25,
    a * 0.35
  ]);
  for (const n of [-0.17, 0.17]) e.mesh(t, "box", p.wood, [
    0.23,
    0.12,
    0.44
  ], [
    n,
    0.08,
    -a * 0.37
  ]);
  e.mesh(t, "box", p.rose, [
    0.42,
    0.045,
    0.3
  ], [
    0.3,
    0.9,
    a * 0.2
  ]);
}
function Hr(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.tint === "rose" ? p.rose : r.tint === "amber" ? p.amber : p.leafLight, i = (c) => {
    for (const l of [-1, 1]) for (const o of [-1, 1]) e.mesh(t, "box", p.timber, [
      0.16,
      c,
      0.16
    ], [
      l * (a / 2 - 0.3),
      c / 2,
      o * (n / 2 - 0.3)
    ]);
  };
  switch (r.kind) {
    case "bed":
      i(0.65), e.mesh(t, "box", p.wood, [
        a - 0.25,
        0.3,
        n - 0.25
      ], [
        0,
        0.65,
        0
      ]), e.mesh(t, "box", p.light, [
        a - 0.5,
        0.25,
        n - 0.5
      ], [
        0,
        0.91,
        0
      ]), e.mesh(t, "box", s, [
        a - 0.42,
        0.1,
        n * 0.6
      ], [
        0,
        1.08,
        n * 0.13
      ]), e.mesh(t, "box", p.cloth, [
        a - 0.7,
        0.12,
        0.35
      ], [
        0,
        1.15,
        -n * 0.15
      ]), e.mesh(t, "box", p.light, [
        a - 1,
        0.25,
        1
      ], [
        0,
        1.15,
        -n / 2 + 1
      ]), e.mesh(t, "box", p.timber, [
        a - 0.1,
        1.5,
        0.17
      ], [
        0,
        0.9,
        -n / 2 + 0.12
      ]);
      for (const c of [-1, 1]) e.mesh(t, "cylinder", p.brass, [
        0.07,
        1.35,
        0.07
      ], [
        c * (a / 2 - 0.23),
        0.9,
        -n / 2 + 0.22
      ]);
      e.mesh(t, "box", s, [
        1,
        0.018,
        n - 0.8
      ], [
        a / 2 + 0.65,
        0.015,
        0
      ]).castShadow = !1;
      for (const c of [-1, 1]) e.mesh(t, "box", p.cloth, [
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
      e.mesh(t, "box", p.timber, [
        a - 0.15,
        2.9,
        n - 0.15
      ], [
        0,
        2.9 / 2,
        0
      ]);
      for (const l of [-1, 1])
        e.mesh(t, "box", p.wood, [
          a / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          l * a / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(t, "box", p.cloth, [
          a / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          l * a / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(t, "box", p.brass, [
          0.045,
          0.27,
          0.08
        ], [
          l * 0.2,
          1.4,
          n / 2 + 0.14
        ]);
      e.mesh(t, "box", p.wood, [
        a + 0.1,
        0.16,
        n + 0.15
      ], [
        0,
        2.9,
        0
      ]), e.mesh(t, "box", s, [
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
      for (const c of [-1, 1]) e.mesh(t, "box", p.timber, [
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
        e.mesh(t, "box", p.wood, [
          a,
          0.15,
          n
        ], [
          0,
          c,
          0
        ]);
        for (let l = 0; l < 4; l++) e.mesh(t, "cylinder", p.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + l * 0.6,
          c + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", p.shadow, [
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
      const c = r.height ?? 2.5;
      e.mesh(t, "box", p.timber, [
        a - 0.2,
        c,
        n - 0.2
      ], [
        0,
        c / 2,
        0
      ]);
      for (let l = -a / 2 + 0.55; l < a / 2 - 0.2; l += 1) for (let o = 0.5; o < c - 0.1; o += 0.8)
        e.mesh(t, "box", p.wood, [
          0.88,
          0.68,
          0.12
        ], [
          l,
          o,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", p.brass, [
          0.055,
          0.055,
          0.06
        ], [
          l,
          o,
          n / 2 + 0.03
        ]);
      e.mesh(t, "box", p.cloth, [
        a * 0.45,
        0.13,
        n * 0.66
      ], [
        -a * 0.2,
        c + 0.075,
        0
      ]);
      for (let l = 0; l < 3; l++) e.mesh(t, "cylinder", l % 2 ? p.pottery : p.light, [
        0.15,
        0.32 + l * 0.1,
        0.15
      ], [
        a * 0.15 + l * 0.4,
        c + 0.2,
        0
      ]);
      break;
    }
    case "table":
    case "workbench":
      if (i(1.2), e.mesh(t, "box", p.wood, [
        a,
        0.18,
        n
      ], [
        0,
        1.28,
        0
      ]), e.mesh(t, "box", p.timber, [
        a - 0.5,
        0.15,
        0.15
      ], [
        0,
        0.4,
        0
      ]), r.kind === "workbench") {
        for (let c = 0; c < 3; c++) e.mesh(t, "cylinder", p.brass, [
          0.15,
          1,
          0.15
        ], [
          (c - 1) * 0.7,
          1.55,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", p.shadow, [
          0.1,
          0.08,
          1
        ], [
          a * 0.3,
          1.42,
          0
        ]).rotation.y = 0.5;
      } else {
        e.mesh(t, "box", p.light, [
          1,
          0.08,
          0.7
        ], [
          -a * 0.24,
          1.42,
          0
        ]).rotation.y = -0.12, e.mesh(t, "cylinder", p.pottery, [
          0.28,
          0.45,
          0.28
        ], [
          a * 0.2,
          1.6,
          0
        ]);
        for (const c of [-0.45, 0.45]) e.mesh(t, "cylinder", p.light, [
          0.13,
          0.19,
          0.13
        ], [
          a * 0.2 + 0.65,
          1.48,
          c
        ]);
        e.mesh(t, "cylinder", p.brass, [
          0.15,
          0.13,
          0.15
        ], [
          -a * 0.32,
          1.43,
          -n * 0.3
        ]), e.mesh(t, "cylinder", p.light, [
          0.07,
          0.32,
          0.07
        ], [
          -a * 0.32,
          1.65,
          -n * 0.3
        ]), e.mesh(t, "rock", p.ember, [
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
      i(0.7), e.mesh(t, "box", p.wood, [
        a - 0.25,
        0.18,
        n - 0.25
      ], [
        0,
        0.78,
        0
      ]);
      for (const c of [-1, 1]) e.mesh(t, "box", p.timber, [
        0.14,
        1.5,
        0.14
      ], [
        c * (a / 2 - 0.3),
        0.78,
        n / 2 - 0.3
      ]);
      e.mesh(t, "box", p.wood, [
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
      i(0.9), e.mesh(t, "box", p.wood, [
        a - 0.2,
        0.15,
        n - 0.2
      ], [
        0,
        0.95,
        0
      ]), e.mesh(t, "cylinder", p.light, [
        0.65,
        0.22,
        0.65
      ], [
        0,
        1.12,
        0
      ]), e.mesh(t, "cylinder", p.water, [
        0.54,
        0.025,
        0.54
      ], [
        0,
        1.24,
        0
      ]), e.mesh(t, "box", p.cloth, [
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
      const c = a > n, l = Math.max(a, n), o = e.group(t);
      c || (o.rotation.y = Math.PI / 2);
      for (let u = -l / 2 + 0.15; u < l / 2; u += 1.4)
        e.mesh(o, "box", p.timber, [
          0.09,
          2.8,
          0.12
        ], [
          u,
          1.4,
          0
        ]), e.mesh(o, "box", p.cloth, [
          Math.min(1.27, l / 2 - u),
          2.15,
          0.055
        ], [
          u + Math.min(0.68, (l / 2 - u) / 2),
          1.53,
          0
        ]);
      for (const u of [-1, 1]) e.mesh(o, "box", p.timber, [
        0.3,
        0.18,
        0.8
      ], [
        u * (l / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function oc(e, t, r, a) {
  const { width: n, depth: s } = a.footprint, i = a.height;
  e.mesh(t, "box", p.slate, [
    n,
    0.3,
    s
  ], [
    0,
    0.15,
    0
  ]), e.mesh(r, "box", p.light, [
    n,
    i - 0.3,
    s
  ], [
    0,
    (i + 0.3) / 2,
    0
  ]);
  for (const o of [0.5, i - 0.1]) e.mesh(r, "box", p.wood, [
    n + 0.04,
    0.16,
    s + 0.04
  ], [
    0,
    o,
    0
  ]);
  const c = n > s, l = Math.max(n, s);
  for (let o = -l / 2 + 0.3; o < l / 2; o += 3.5) e.mesh(r, "box", p.wood, [
    c ? 0.12 : n + 0.04,
    i,
    c ? s + 0.04 : 0.12
  ], [
    c ? o : 0,
    i / 2,
    c ? 0 : o
  ]);
  if (a.id === "west-wall") {
    const o = e.group(r, [
      n / 2 + 0.04,
      2.35,
      0
    ]);
    o.rotation.y = Math.PI / 2, e.mesh(o, "box", p.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(o, "box", p.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const u of [-1, 1])
      e.mesh(o, "box", p.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        u * 0.73,
        -0.07,
        0.21
      ]), e.mesh(o, "box", p.brass, [
        0.78,
        0.06,
        0.03
      ], [
        u * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(o, "box", p.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(o, "box", p.wood, [
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
function ic(e, t) {
  for (const r of [-1, 1]) e.mesh(t, "box", p.timber, [
    0.22,
    3.6,
    0.4
  ], [
    r * 1.9,
    1.8,
    0
  ]);
  e.mesh(t, "box", p.wood, [
    4,
    0.22,
    0.45
  ], [
    0,
    3.65,
    0
  ]), e.mesh(t, "box", p.wood, [
    3.5,
    3.35,
    0.16
  ], [
    0,
    1.7,
    0
  ]);
  for (const r of [0.5, 2.8]) e.mesh(t, "box", p.timber, [
    3.5,
    0.13,
    0.2
  ], [
    0,
    r,
    0
  ]);
  for (const r of [-1, 1]) e.mesh(t, "sphere", p.brass, [
    0.09,
    0.09,
    0.09
  ], [
    1.25,
    1.45,
    r * 0.16
  ]);
}
function Xs(e, t, r, a, n = 2.8) {
  e.mesh(t, "cylinder", p.shadow, [
    0.055,
    n,
    0.055
  ], [
    r,
    n / 2,
    a
  ]), e.mesh(t, "box", p.brass, [
    0.4,
    0.08,
    0.4
  ], [
    r,
    n,
    a
  ]), e.mesh(t, "box", p.ember, [
    0.22,
    0.38,
    0.22
  ], [
    r,
    n + 0.21,
    a
  ], !0), e.mesh(t, "cone", p.shadow, [
    0.32,
    0.24,
    0.32
  ], [
    r,
    n + 0.51,
    a
  ]);
  for (const s of [-1, 1]) e.mesh(t, "box", p.shadow, [
    0.035,
    0.4,
    0.035
  ], [
    r + s * 0.14,
    n + 0.2,
    a + 0.14
  ]);
}
function Js(e, t, r, a, n, s) {
  const i = r / 2 + 0.45, c = Math.atan2(s, i), l = Math.hypot(i, s);
  for (const o of [-1, 1]) {
    const u = e.group(t, [
      o * i / 2,
      n + s / 2,
      0
    ]);
    u.rotation.z = -o * c, e.mesh(u, "box", p.roof, [
      l + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let h = 0; h < Math.ceil(l / 0.65); h++) e.mesh(u, "box", h % 3 ? p.roof : p.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -l / 2 + h * 0.65,
      0.13,
      0
    ]);
    e.mesh(u, "box", p.shadow, [
      0.2,
      0.24,
      a + 1.25
    ], [
      o * l / 2,
      -0.05,
      0
    ]);
  }
  e.mesh(t, "box", p.brass, [
    0.24,
    0.23,
    a + 1.4
  ], [
    0,
    n + s + 0.14,
    0
  ]);
  for (const o of [-a / 2 - 0.08, a / 2 + 0.08])
    e.shape(t, [
      [-r / 2, 0],
      [r / 2, 0],
      [0, s]
    ], p.light, [
      0,
      n,
      o
    ], 0.08), e.mesh(t, "box", p.timber, [
      0.15,
      s,
      0.18
    ], [
      0,
      n + s / 2,
      o + 0.12
    ]);
}
function ln(e, t, r, a, n, s = 1.1) {
  e.mesh(t, "box", p.shadow, [
    s,
    1.45,
    0.12
  ], [
    r,
    n,
    a
  ]), e.mesh(t, "box", p.window, [
    s - 0.18,
    1.25,
    0.14
  ], [
    r,
    n,
    a + 0.07
  ]);
  for (const i of [-1, 1])
    e.mesh(t, "box", p.wood, [
      0.13,
      1.6,
      0.2
    ], [
      r + i * s / 2,
      n,
      a + 0.12
    ]), e.mesh(t, "box", p.light, [
      s + 0.28,
      0.14,
      0.26
    ], [
      r,
      n + i * 0.8,
      a + 0.12
    ]);
  e.mesh(t, "box", p.timber, [
    0.07,
    1.3,
    0.16
  ], [
    r,
    n,
    a + 0.16
  ]), e.mesh(t, "box", p.timber, [
    s,
    0.06,
    0.16
  ], [
    r,
    n,
    a + 0.16
  ]);
}
function lc(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.kind === "clinic", i = s ? 3.7 : 5;
  e.mesh(t, "box", p.stone, [
    a - 0.3,
    i,
    n - 0.3
  ], [
    0,
    i / 2,
    0
  ]), e.mesh(t, "box", p.light, [
    a - 0.4,
    i - 1,
    n - 0.1
  ], [
    0,
    i / 2 + 0.4,
    0
  ]);
  for (const u of [-a / 2 + 0.15, a / 2 - 0.15]) for (const h of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(t, "box", p.timber, [
    0.27,
    i,
    0.27
  ], [
    u,
    i / 2,
    h
  ]);
  for (const u of [0.8, i - 0.25]) e.mesh(t, "box", p.timber, [
    a,
    0.18,
    n
  ], [
    0,
    u,
    0
  ]);
  for (const u of [-a * 0.29, a * 0.29]) ln(e, t, u, n / 2, 2.3, s ? 1.6 : 1.2);
  const c = e.group(t, [
    a / 2,
    0,
    0
  ]);
  c.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) ln(e, c, u, 0.03, 2.3);
  e.mesh(t, "box", p.shadow, [
    1.9,
    2.65,
    0.13
  ], [
    0,
    1.35,
    n / 2
  ]);
  for (const u of [-1, 1]) e.mesh(t, "box", p.wood, [
    0.85,
    2.5,
    0.12
  ], [
    u * 0.46,
    1.3,
    n / 2 + 0.08
  ]);
  e.mesh(t, "sphere", p.brass, [
    0.07,
    0.07,
    0.05
  ], [
    0.23,
    1.15,
    n / 2 + 0.19
  ]), Js(e, t, a, n, i, s ? 1.15 : 3.2);
  const l = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), o = s ? 2.1 : 3.3;
  if (e.mesh(l, "box", p.stone, [
    1.1,
    o,
    1.2
  ], [
    0,
    o / 2,
    0
  ]), e.mesh(l, "box", p.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    o - 0.2,
    0
  ]), e.mesh(l, "box", p.shadow, [
    0.85,
    0.04,
    0.95
  ], [
    0,
    o - 0.03,
    0
  ]), s) {
    const u = e.group(t, [
      0,
      2.9,
      n / 2 + 1
    ]);
    u.rotation.x = 0.19;
    for (let h = -6; h <= 6; h++) e.mesh(u, "box", h % 3 ? p.cloth : p.light, [
      0.74,
      0.04,
      2.3
    ], [
      h * 0.75,
      0,
      0
    ]);
    for (const h of [-1, 1]) e.mesh(t, "box", p.timber, [
      0.09,
      0.12,
      2.1
    ], [
      h * 4.5,
      2.6,
      n / 2 + 0.95
    ]);
    e.mesh(u, "box", p.rose, [
      1,
      0.014,
      0.65
    ], [
      -2.2,
      0.034,
      0.3
    ]);
    for (let h = -3; h <= 3; h++)
      e.mesh(t, "box", p.timber, [
        0.025,
        0.35,
        0.025
      ], [
        h * 0.45 - 3,
        2.5,
        n / 2 + 0.16
      ]), e.mesh(t, "cone", p.leaf, [
        0.17,
        0.6,
        0.15
      ], [
        h * 0.45 - 3,
        2.05,
        n / 2 + 0.16
      ]);
    for (const h of [-a * 0.29, a * 0.29]) e.mesh(t, "box", p.ember, [
      1.35,
      1.15,
      0.015
    ], [
      h,
      2.3,
      n / 2 + 0.151
    ], !0);
    e.mesh(t, "box", p.slate, [
      0.9,
      1.2,
      0.14
    ], [
      2.8,
      2.8,
      n / 2 + 0.25
    ]), e.mesh(t, "cylinder", p.brass, [
      0.21,
      0.47,
      0.06
    ], [
      2.8,
      2.75,
      n / 2 + 0.36
    ]), e.mesh(t, "box", p.brass, [
      0.18,
      0.16,
      0.1
    ], [
      2.8,
      3.08,
      n / 2 + 0.36
    ]);
  } else
    ln(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", p.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function cc(e, t, r) {
  const a = r.height, n = r.footprint.width, s = r.tint === "amber", i = r.tint === "rose", c = s ? p.amber : i ? p.rose : p.leaf, l = s ? p.amberLight : i ? "#dfb2a1" : p.leafLight, o = e.mesh(t, "cylinder", p.timber, [
    0.24,
    a * 0.67,
    0.28
  ], [
    0,
    a * 0.33,
    0
  ]);
  o.rotation.z = 0.06;
  for (let u = 0; u < 3; u++) {
    const h = e.group(t, [
      0,
      a * 0.39,
      0
    ]);
    h.rotation.set(0.4 * Math.sin(u * 2), 0, (u - 1) * 0.65), e.mesh(h, "cylinder", p.timber, [
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
    const h = u * 2.4, d = u === 8 ? 0.1 : n * 0.56, f = e.mesh(t, "crown", u % 3 ? c : l, [
      n * 0.49 + 0.4,
      a * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(h) * d,
      a * (0.68 + u % 3 * 0.11),
      Math.cos(h) * d
    ]);
    f.rotation.set(u * 0.37, u * 0.61, 0.14), f.receiveShadow = !1;
  }
}
function dc(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.height;
  e.mesh(t, "box", p.stone, [
    a,
    s,
    n
  ], [
    0,
    s / 2,
    0
  ]);
  for (const i of [
    1,
    s * 0.55,
    s - 0.6
  ]) e.mesh(t, "box", p.light, [
    a + 0.25,
    0.3,
    n + 0.25
  ], [
    0,
    i,
    0
  ]);
  for (const i of [-a / 2 + 0.3, a / 2 - 0.3]) e.mesh(t, "box", p.mortar, [
    0.55,
    s - 1,
    n + 0.15
  ], [
    i,
    s / 2,
    0
  ]);
  for (const i of [s * 0.35, s * 0.7]) ln(e, t, 0, n / 2 + 0.02, i, 0.7);
  Js(e, t, a + 0.35, n + 0.35, s, s * 0.32), e.mesh(t, "cylinder", p.brass, [
    0.055,
    2.7,
    0.055
  ], [
    0,
    s * 1.32 + 1.2,
    0
  ]), e.shape(t, [
    [0, 0],
    [1.6, -0.3],
    [1.2, -0.75],
    [0, -0.95]
  ], p.cloth, [
    0.05,
    s * 1.32 + 2.4,
    0
  ]);
}
function uc(e, t, r, a, n) {
  const s = a.footprint, i = e.group(t, [
    s.x,
    0,
    s.z
  ]), c = e.group(r, [
    s.x,
    0,
    s.z
  ]);
  switch (a.kind) {
    case "door":
      ic(e, c);
      break;
    case "screen":
      Hr(e, c, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      Hr(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      Jl(e, i, c, a);
      break;
    case "stove":
      tc(e, i);
      break;
    case "medicine":
      ac(e, i, s.width, s.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      rc(e, i, a);
      break;
    case "clinic":
    case "storehouse":
      e.mesh(i, "box", p.mortar, [
        s.width,
        0.3,
        s.depth
      ], [
        0,
        0.15,
        0
      ]), lc(e, c, a);
      break;
    case "tree":
      e.mesh(i, "box", p.soil, [
        s.width,
        0.18,
        s.depth
      ], [
        0,
        0.08,
        0
      ]);
      for (let l = 0; l < 7; l++) {
        const o = l * 0.9;
        e.mesh(i, "rock", p.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(o) * s.width * 0.33,
          0.2,
          Math.cos(o) * s.depth * 0.33
        ]);
      }
      cc(e, c, a);
      break;
    case "tower":
      dc(e, c, a);
      break;
    case "column": {
      const l = a.height, o = Math.min(s.width, s.depth) * 0.3;
      e.mesh(i, "box", p.mortar, [
        s.width,
        0.35,
        s.depth
      ], [
        0,
        0.17,
        0
      ]), e.mesh(i, "box", p.light, [
        s.width * 0.84,
        0.35,
        s.depth * 0.84
      ], [
        0,
        0.5,
        0
      ]), e.mesh(c, "cylinder", p.stone, [
        o,
        l - 1.1,
        o
      ], [
        0,
        l / 2,
        0
      ]);
      for (let u = 0; u < 10; u++) {
        const h = u * Math.PI / 5;
        e.mesh(c, "box", p.light, [
          0.085,
          l - 2,
          0.085
        ], [
          Math.sin(h) * o,
          l / 2,
          Math.cos(h) * o
        ]);
      }
      for (const u of [0.85, l - 0.7]) e.mesh(c, "cylinder", p.brass, [
        o * 1.15,
        0.18,
        o * 1.15
      ], [
        0,
        u,
        0
      ]);
      e.mesh(c, "box", p.light, [
        s.width,
        0.4,
        s.depth
      ], [
        0,
        l - 0.3,
        0
      ]), e.mesh(c, "box", p.slate, [
        s.width * 0.9,
        0.3,
        s.depth * 0.9
      ], [
        0,
        l,
        0
      ]);
      break;
    }
    case "beacon":
      e.mesh(i, "box", p.mortar, [
        s.width,
        0.28,
        s.depth
      ], [
        0,
        0.14,
        0
      ]), e.mesh(i, "cylinder", p.stone, [
        2.5,
        0.5,
        2.5
      ], [
        0,
        0.5,
        0
      ]), e.mesh(c, "cylinder", p.slate, [
        1.35,
        3.9,
        1.35
      ], [
        0,
        2.3,
        0
      ]);
      for (const l of [
        1.2,
        3.5,
        4.4
      ]) e.mesh(c, "cylinder", p.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        l,
        0
      ]);
      e.mesh(c, "cylinder", p.shadow, [
        2.2,
        0.5,
        2.2
      ], [
        0,
        4.8,
        0
      ]), e.mesh(c, "torus", p.brass, [
        2.3,
        2.3,
        1.4
      ], [
        0,
        5.1,
        0
      ]).rotation.x = Math.PI / 2;
      for (let l = 0; l < 6; l++) {
        const o = l * Math.PI / 3, u = e.group(c, [
          Math.sin(o) * 2.1,
          4.8,
          Math.cos(o) * 2.1
        ]);
        u.rotation.y = o, e.shape(u, [
          [-0.12, 0],
          [0.12, 0],
          [0.2, 1.8],
          [0, 2.4],
          [-0.2, 1.8]
        ], p.brass, [
          0,
          0,
          0
        ], 0.14);
      }
      break;
    case "bunk":
      sc(e, i, s.width, s.depth);
      for (const l of [0.55, 1.9])
        e.mesh(i, "box", p.timber, [
          s.width - 0.5,
          0.18,
          s.depth - 0.5
        ], [
          0,
          l,
          0
        ]), e.mesh(i, "box", p.cloth, [
          s.width - 0.8,
          0.18,
          s.depth - 0.9
        ], [
          0,
          l + 0.16,
          0
        ]), e.mesh(i, "box", p.light, [
          s.width - 1,
          0.24,
          1.2
        ], [
          0,
          l + 0.28,
          -s.depth / 2 + 1.3
        ]);
      for (const l of [-1, 1]) for (const o of [-1, 1]) e.mesh(i, "box", p.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        l * (s.width / 2 - 0.3),
        1.35,
        o * (s.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const l = a.height, o = s.width * 0.23;
      e.mesh(i, "rock", p.soil, [
        s.width * 0.5,
        0.65,
        s.depth * 0.5
      ], [
        0,
        0.1,
        0
      ]);
      for (let u = 0; u < 5; u++) {
        const h = u * Math.PI * 0.4, d = s.width * 0.25, f = e.group(c, [
          Math.sin(h) * o * 0.45,
          0,
          Math.cos(h) * o * 0.45
        ]);
        f.rotation.y = h;
        const m = e.mesh(f, "cylinder", u % 2 ? p.root : p.rootLight, [
          o * 0.65,
          l * 0.64,
          o * 0.49
        ], [
          0,
          l * 0.3,
          0
        ]);
        m.rotation.z = 0.13;
        const y = e.group(f, [
          0,
          l * 0.48,
          0
        ]);
        y.rotation.z = 0.4 + u * 0.12, e.mesh(y, "cone", p.root, [
          o * 0.47,
          l * 0.55,
          o * 0.4
        ], [
          0,
          l * 0.25,
          0
        ]);
        const b = e.mesh(f, "cone", p.root, [
          o * 0.5,
          d * 1.4,
          o * 0.4
        ], [
          d * 0.6,
          0.7,
          0
        ]);
        b.rotation.z = -1.15;
      }
      if (l > 8) {
        e.mesh(c, "rock", p.shadow, [
          o * 0.65,
          l * 0.22,
          0.35
        ], [
          0,
          l * 0.38,
          o * 0.65
        ]), e.mesh(c, "rock", p.brass, [
          o * 0.16,
          l * 0.16,
          0.15
        ], [
          0,
          l * 0.4,
          o * 0.68
        ], !0);
        for (let u = 0; u < 7; u++) e.mesh(c, "crown", u % 2 ? p.leaf : p.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(u * 2) * o,
          l * 0.55 + u * 0.4,
          Math.cos(u * 2) * o
        ]);
      }
      break;
    }
    case "bridge":
      e.mesh(i, "box", p.light, [
        s.width,
        0.06,
        s.depth - 2
      ], [
        0,
        -0.01,
        0
      ]);
      for (const l of [-1, 1]) {
        const o = l * (s.depth / 2 - 0.5);
        e.mesh(i, "box", p.stone, [
          s.width,
          0.72,
          1
        ], [
          0,
          0.36,
          o
        ]), e.mesh(i, "box", p.light, [
          s.width,
          0.15,
          1
        ], [
          0,
          0.795,
          o
        ]);
        for (const u of [-s.width / 2 + 0.5, s.width / 2 - 0.5])
          e.mesh(i, "box", p.mortar, [
            0.8,
            1.05,
            1
          ], [
            u,
            0.525,
            o
          ]), e.mesh(i, "box", p.light, [
            1,
            0.13,
            1
          ], [
            u,
            1.115,
            o
          ]);
      }
      break;
    case "arch": {
      const l = a.height;
      e.mesh(c, "arch", p.light, [
        s.width / 2 - 0.4,
        3.1,
        s.depth * 0.65
      ], [
        0,
        l - 3,
        0
      ]), e.mesh(c, "box", p.brass, [
        0.8,
        1.4,
        s.depth * 0.75
      ], [
        0,
        l + 0.2,
        0
      ]);
      for (const o of [-1, 1]) {
        const u = e.group(c, [
          o * (s.width / 2 - 0.5),
          l - 2.2,
          s.depth / 2 - 0.4
        ]);
        e.mesh(u, "box", p.brass, [
          1.5,
          0.08,
          0.1
        ]), e.shape(u, [
          [-0.6, 0],
          [0.6, 0],
          [0.6, -2.5],
          [0, -2.9],
          [-0.6, -2.5]
        ], p.slate, [
          0,
          -0.05,
          0.06
        ]), e.mesh(u, "box", p.cloth, [
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
        oc(e, i, c, a);
        break;
      }
      const l = a.height, o = Math.min(l, 0.65);
      a.wallUse === "homes" && ec(e, c, s), e.mesh(i, "box", p.mortar, [
        s.width,
        o,
        s.depth
      ], [
        0,
        o / 2,
        0
      ]), l > o && e.mesh(c, "box", n ? p.marble : p.stone, [
        s.width,
        l - o,
        s.depth
      ], [
        0,
        (l + o) / 2,
        0
      ]), e.mesh(c, "box", p.light, [
        s.width + 0.12,
        0.23,
        s.depth + 0.12
      ], [
        0,
        l,
        0
      ]);
      const u = s.width > s.depth, h = Math.max(s.width, s.depth);
      if (n) {
        for (const d of [1.1, l - 0.55]) e.mesh(c, "box", p.light, [
          s.width + 0.15,
          0.22,
          s.depth + 0.15
        ], [
          0,
          d,
          0
        ]);
        for (let d = -h / 2 + 3; d < h / 2 - 1; d += 6) for (const f of [-1, 1]) {
          const m = e.group(c, [
            u ? d : f * (s.width / 2 + 0.04),
            0,
            u ? f * (s.depth / 2 + 0.04) : d
          ]);
          m.rotation.y = u ? f < 0 ? Math.PI : 0 : f * Math.PI / 2;
          const y = l * 0.61, b = Math.min(2.1, l * 0.3);
          e.mesh(m, "box", p.undercroft, [
            1.5,
            b,
            0.05
          ], [
            0,
            y,
            0
          ]);
          for (const w of [
            -0.55,
            0,
            0.55
          ]) e.mesh(m, "box", p.shadow, [
            0.07,
            b,
            0.06
          ], [
            w,
            y,
            0.06
          ]);
          for (const w of [-1, 1]) e.mesh(m, "box", p.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            y + w * b / 2,
            0.06
          ]);
          e.mesh(m, "box", p.stone, [
            0.45,
            l - 1,
            0.32
          ], [
            2.2,
            l / 2,
            0
          ]);
        }
        break;
      }
      for (let d = -h / 2 + 1; d < h / 2; d += 3.5) {
        l > 4 && e.mesh(c, "box", p.stone, u ? [
          1.3,
          0.85,
          s.depth
        ] : [
          s.width,
          0.85,
          1.3
        ], [
          u ? d : 0,
          l + 0.55,
          u ? 0 : d
        ]);
        for (let f = 0; f < Math.floor(l / 0.9); f++) e.mesh(c, "box", p.mortar, u ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          u ? d + f % 2 * 0.7 : s.width / 2 + 0.01,
          0.55 + f * 0.85,
          u ? s.depth / 2 + 0.01 : d + f % 2 * 0.7
        ]);
      }
      break;
    }
    case "water":
      e.mesh(i, "box", p.water, [
        s.width,
        0.12,
        s.depth
      ], [
        0,
        -0.18,
        0
      ]);
      for (let l = 0; l < s.width * s.depth / 9; l++) {
        const o = Math.sin(l * 7.3) * (s.width / 2 - 0.8), u = Math.cos(l * 3.7) * (s.depth / 2 - 0.3);
        e.mesh(i, "box", p.ripple, [
          0.4 + l % 4 * 0.3,
          0.012,
          0.04
        ], [
          o,
          -0.11,
          u
        ], !0);
      }
      break;
    case "planter":
      e.mesh(i, "box", p.stone, [
        s.width,
        0.55,
        s.depth
      ], [
        0,
        0.275,
        0
      ]), e.mesh(i, "box", p.soil, [
        s.width - 0.35,
        0.1,
        s.depth - 0.35
      ], [
        0,
        0.57,
        0
      ]);
      for (let l = -s.width / 2 + 0.65; l < s.width / 2; l += 1) for (let o = -s.depth / 2 + 0.6; o < s.depth / 2; o += 0.95) {
        const u = Math.sin(l * 7 + o * 19), h = s.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? p.leafLight : p.leaf, [
          h,
          0.32 + u * 0.1,
          h * 0.9
        ], [
          l + u * 0.15,
          0.81,
          o
        ]), u > 0.5 && e.mesh(i, "rock", u > 0.8 ? p.light : p.rose, [
          0.1,
          0.12,
          0.1
        ], [
          l + 0.1,
          1.13,
          o
        ]);
      }
      break;
    case "thicket":
      e.mesh(i, "box", p.soil, [
        s.width,
        0.2,
        s.depth
      ], [
        0,
        0.07,
        0
      ]);
      for (let l = -s.width / 2 + 0.7; l < s.width / 2; l += 1.3) for (let o = -s.depth / 2 + 0.65; o < s.depth / 2; o += 1.25) {
        const u = Math.sin(l * 13 + o * 7), h = 0.6 + u * 0.2;
        e.mesh(i, "crown", u > 0 ? p.leaf : p.leafLight, [
          0.7,
          h,
          0.7
        ], [
          l,
          h * 0.75,
          o
        ]), u > 0.75 && e.mesh(i, "rock", p.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          l,
          h * 1.65,
          o
        ]);
      }
      break;
    case "wagon":
      e.mesh(i, "box", p.wood, [
        s.width - 1,
        0.35,
        s.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const l of [-1, 1]) {
        for (let o = 0; o < 3; o++) e.mesh(i, "box", p.wood, [
          0.12,
          0.24,
          s.depth - 1
        ], [
          l * (s.width / 2 - 0.5),
          1.4 + o * 0.29,
          0
        ]);
        for (const o of [-s.depth * 0.28, s.depth * 0.28]) {
          if (a.damaged && l < 0 && o > 0) {
            e.mesh(i, "torus", p.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -s.width / 2 + 0.8,
              0.18,
              o
            ]).rotation.x = Math.PI / 2, e.mesh(i, "box", p.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -s.width / 2 + 0.8,
              0.18,
              o
            ]), e.mesh(i, "box", p.wood, [
              0.1,
              0.1,
              1.1
            ], [
              -s.width / 2 + 0.8,
              0.18,
              o
            ]);
            continue;
          }
          e.mesh(i, "torus", p.shadow, [
            0.7,
            0.7,
            0.7
          ], [
            l * (s.width / 2 - 0.2),
            0.76,
            o
          ]).rotation.y = Math.PI / 2;
          for (let u = 0; u < 4; u++) {
            const h = e.mesh(i, "box", p.wood, [
              0.09,
              1.25,
              0.09
            ], [
              l * (s.width / 2 - 0.2),
              0.76,
              o
            ]);
            h.rotation.x = u * Math.PI / 4;
          }
        }
      }
      e.mesh(i, "box", p.cloth, [
        1.4,
        0.8,
        1.8
      ], [
        0,
        1.7,
        -0.8
      ]), e.mesh(i, "cylinder", p.timber, [
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
      for (let l = 0; l < 4; l++) {
        const o = e.group(i, [
          l % 2 * 1.5 - 0.75,
          l === 3 ? 1.3 : 0,
          l < 2 ? -0.7 : 0.7
        ]);
        e.mesh(o, "box", p.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const u of [-1, 1]) e.mesh(o, "box", p.timber, [
          0.1,
          1.25,
          1.3
        ], [
          u * 0.43,
          0.6,
          0
        ]);
        e.mesh(o, "box", p.light, [
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
      e.mesh(i, "box", p.wood, [
        s.width - 0.3,
        0.18,
        s.depth - 0.2
      ], [
        0,
        0.72,
        0
      ]), e.mesh(i, "box", p.wood, [
        0.13,
        0.75,
        s.depth - 0.2
      ], [
        -s.width / 2 + 0.1,
        1.12,
        0
      ]);
      for (const l of [-1, 1]) e.mesh(i, "box", p.shadow, [
        s.width - 0.5,
        0.7,
        0.22
      ], [
        0,
        0.35,
        l * (s.depth / 2 - 0.5)
      ]);
      break;
    case "ruin":
      e.mesh(i, "box", p.stone, [
        s.width,
        0.5,
        s.depth
      ], [
        0,
        0.25,
        0
      ]);
      for (let l = 0; l < 3; l++) {
        const o = -s.width * 0.3 + l * s.width * 0.3, u = (a.height ?? 3) * (1 - l * 0.22), h = s.width * 0.11;
        e.mesh(c, "cylinder", p.stone, [
          h,
          u,
          h
        ], [
          o,
          u / 2 + 0.3,
          -s.depth * 0.2
        ]), e.mesh(c, "box", p.light, [
          h * 2.6,
          0.25,
          h * 2.6
        ], [
          o,
          u + 0.3,
          -s.depth * 0.2
        ]);
        for (let d = 0; d < 6; d++) {
          const f = d * Math.PI / 3;
          e.mesh(c, "box", p.mortar, [
            0.055,
            u * 0.8,
            0.055
          ], [
            o + Math.sin(f) * h,
            u / 2 + 0.3,
            -s.depth * 0.2 + Math.cos(f) * h
          ]);
        }
      }
      e.mesh(i, "rock", p.grassDark, [
        s.width * 0.4,
        0.3,
        s.depth * 0.3
      ], [
        0,
        0.7,
        s.depth * 0.2
      ]);
      break;
  }
  return c.children.length > 0;
}
var qa = 1e-7;
function tr(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function Vr(e, t, r, a) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const i = e[s], c = e[(s + 1) % e.length], l = tr(t, r, i), o = tr(t, r, c), u = a ? l >= -1e-7 : l <= qa, h = a ? o >= -1e-7 : o <= qa;
    if (u && n.push(i), u !== h && Math.abs(l - o) > qa) {
      const d = l / (l - o);
      n.push([i[0] + (c[0] - i[0]) * d, i[1] + (c[1] - i[1]) * d]);
    }
  }
  return n;
}
function eo(e) {
  return Math.abs(e.reduce((t, r, a) => t + r[0] * e[(a + 1) % e.length][1] - r[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function hc(e, t) {
  let r = e;
  const a = [];
  for (let n = 0; n < t.length && r.length >= 3; n++) {
    const s = t[n], i = t[(n + 1) % t.length], c = Vr(r, s, i, !1);
    eo(c) > qa && a.push(c), r = Vr(r, s, i, !0);
  }
  return a;
}
function pc(e, t, r) {
  const a = t[0] - e[0], n = t[1] - e[1], s = r / (2 * Math.hypot(a, n)), i = -n * s, c = a * s;
  return [
    [e[0] + i, e[1] + c],
    [e[0] - i, e[1] - c],
    [t[0] - i, t[1] - c],
    [t[0] + i, t[1] + c]
  ];
}
function to(e, t) {
  const r = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) r.push(pc(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, s] of a.points.slice(1, -1)) r.push(Array.from({ length: 12 }, (i, c) => {
      const l = c * Math.PI / 6, o = (a.width + t) / 2;
      return [n + Math.cos(l) * o, s + Math.sin(l) * o];
    }));
  }
  return r;
}
function fc(e, t = 0) {
  const r = to(e, t), a = [];
  for (let n = 0; n < r.length; n++) {
    let s = [r[n]];
    for (let i = 0; i < n && s.length; i++) s = s.flatMap((c) => hc(c, r[i]));
    a.push(...s.filter((i) => eo(i) > qa));
  }
  return a;
}
function mc(e, t, r, a) {
  const n = r === "marble", s = r === "street";
  for (const [l, o, u] of [[
    0.4,
    0.025,
    n ? p.brass : s ? p.streetSeam : p.mortar
  ], [
    0,
    0.04,
    n ? p.slate : s ? p.streetStone : p.stone
  ]]) for (const h of fc(t, l)) {
    const d = h.reduce((y, b) => y + b[0], 0) / h.length, f = h.reduce((y, b) => y + b[1], 0) / h.length, m = e.shape(a(d, f), h.map((y) => [y[0], -y[1]]), u, [
      0,
      o,
      0
    ]);
    m.rotation.x = -Math.PI / 2, m.castShadow = !1;
  }
  const i = to(t, 0.4);
  let c = 0;
  for (const l of t) {
    for (let o = 1; o < l.points.length; o++, c++) {
      const u = l.points[o - 1], h = l.points[o], d = h[0] - u[0], f = h[1] - u[1], m = Math.hypot(d, f);
      for (let y = 1.5; y < m; y += 1.65) {
        const b = u[0] + d * y / m, w = u[1] + f * y / m;
        if (i.some((C, v) => v !== c && C.every((R, _) => tr(R, C[(_ + 1) % C.length], [b, w]) >= -1e-7))) continue;
        const k = e.mesh(a(b, w), "box", n ? p.shadow : s ? p.streetSeam : p.mortar, [
          l.width - 0.08,
          0.012,
          0.025
        ], [
          b,
          0.049,
          w
        ]);
        if (k.rotation.y = Math.atan2(d, f), k.castShadow = !1, s) {
          const C = e.mesh(a(b, w), "box", p.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            b + Math.cos(y) * 0.55,
            0.049,
            w
          ]);
          C.rotation.y = Math.atan2(d, f), C.castShadow = !1;
        }
      }
    }
    c += l.points.length - 2;
  }
}
function gc(e, t) {
  const r = e.x - e.width / 2, a = r + e.width, n = e.z - e.depth / 2, s = n + e.depth, i = Math.max(r, t.x - t.width / 2), c = Math.min(a, t.x + t.width / 2), l = Math.max(n, t.z - t.depth / 2), o = Math.min(s, t.z + t.depth / 2);
  return i >= c || l >= o ? [e] : [
    [
      r,
      n,
      a,
      l
    ],
    [
      r,
      o,
      a,
      s
    ],
    [
      r,
      l,
      i,
      o
    ],
    [
      c,
      l,
      a,
      o
    ]
  ].filter(([u, h, d, f]) => d > u && f > h).map(([u, h, d, f]) => ({
    x: (u + d) / 2,
    z: (h + f) / 2,
    width: d - u,
    depth: f - h
  }));
}
function Yr(e, t, r) {
  const a = r[0] - t[0], n = r[1] - t[1], s = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * s, e.y - t[1] - n * s);
}
function vc(e, t, r) {
  const a = [], n = /* @__PURE__ */ new Map(), s = [], i = new Po(), c = new St(), l = new ko(), o = [];
  function u(v, R) {
    const _ = `${Math.floor(v / 16)}:${Math.floor(R / 16)}`;
    let A = n.get(_);
    return A || (A = e.group(t), n.set(_, A)), A;
  }
  let h = [r.bounds];
  for (const v of r.features.filter((R) => R.kind === "water")) h = h.flatMap((R) => gc(R, v.footprint));
  const d = r.surface === "grass", f = r.surface === "marble", m = r.surface === "street", y = r.surface === "boards", b = y ? p.wood : d ? p.grass : m ? p.street : r.surface === "wet" ? p.wetStone : f ? p.marble : p.stone;
  for (const v of h)
    if (e.mesh(u(v.x, v.z), "box", b, [
      v.width,
      0.6,
      v.depth
    ], [
      v.x,
      -0.32,
      v.z
    ]).castShadow = !1, y) for (let R = v.x - v.width / 2; R < v.x + v.width / 2; R += 1) for (let _ = v.z - v.depth / 2; _ < v.z + v.depth / 2; _ += 4) {
      const A = Math.min(4, v.z + v.depth / 2 - _);
      e.mesh(u(R, _), "box", Wr[Math.abs(R + _) % Wr.length], [
        0.985,
        0.018,
        A - 0.025
      ], [
        R + 0.5,
        -9e-3,
        _ + A / 2
      ]).castShadow = !1;
    }
    else if (!d && !m) for (let R = v.x - v.width / 2; R < v.x + v.width / 2; R += 4) for (let _ = v.z - v.depth / 2; _ < v.z + v.depth / 2; _ += 4) {
      const A = Math.min(4, v.x + v.width / 2 - R), S = Math.min(4, v.z + v.depth / 2 - _), P = f ? Math.round(R / 4 + _ / 4) % 2 ? p.marble : p.marbleLight : b;
      e.mesh(u(R, _), "box", P, [
        A - 0.04,
        0.018,
        S - 0.04
      ], [
        R + A / 2,
        -9e-3,
        _ + S / 2
      ]).castShadow = !1;
    }
  if (mc(e, r.roads, r.surface, u), m) for (let v = 0; v < 320; v++) {
    const R = r.bounds.x + Math.sin(v * 127.13) * (r.bounds.width / 2 - 3), _ = r.bounds.z + Math.cos(v * 53.71) * (r.bounds.depth / 2 - 3), A = {
      x: R,
      y: _
    };
    if (r.features.some((L) => Hn(A, L.footprint))) continue;
    const S = Math.min(...r.roads.flatMap((L) => L.points.slice(1).map((T, I) => Yr(A, L.points[I], T))));
    if (S < 2 || S > 9) continue;
    const P = e.mesh(u(R, _), "box", v % 3 ? p.streetSeam : p.streetStone, [
      0.4 + v % 3 * 0.18,
      0.025,
      0.25
    ], [
      R,
      -2e-3,
      _
    ]);
    P.rotation.y = v * 0.41, P.castShadow = !1;
  }
  if (f) {
    const v = u(0, -17);
    for (const R of [
      4,
      4.4,
      5.5
    ]) e.ring(v, p.brass, R, 0, -17, 1, !1, 0.09);
    for (let R = 0; R < 12; R++) {
      const _ = R * Math.PI / 6;
      e.shape(v, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], p.brass, [
        Math.sin(_) * 4.6,
        0.095,
        -17 + Math.cos(_) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, _);
    }
  }
  for (const v of r.suspended ?? []) {
    const R = e.group(t);
    nc(e, R, v), a.push(e.bake(R)), s.push({
      root: R,
      bounds: new cn().setFromObject(R).expandByScalar(0.1)
    });
  }
  const { bounds: w } = r;
  for (let v = 0; v < (d ? 420 : 0); v++) {
    const R = w.x + Math.sin(v * 127.13) * (w.width / 2 - 3), _ = w.z + Math.cos(v * 53.71) * (w.depth / 2 - 3), A = {
      x: R,
      y: _
    };
    if (r.features.some((P) => Hn(A, {
      ...P.footprint,
      width: P.footprint.width + 1.5,
      depth: P.footprint.depth + 1.5
    })) || r.roads.some((P) => P.points.slice(1).some((L, T) => Yr(A, P.points[T], L) < P.width / 2 + 1))) continue;
    const S = u(R, _);
    if (v % 4 === 0) {
      const P = Array.from({ length: 9 }, (T, I) => {
        const Z = I * Math.PI * 2 / 9, H = 1 + Math.sin(I * 7 + v) * 0.3;
        return [Math.cos(Z) * H * (1.2 + v % 3), Math.sin(Z) * H * (0.7 + v % 2)];
      }), L = e.shape(S, P, v % 8 ? p.grassDark : p.grassLight, [
        R,
        5e-3,
        _
      ]);
      L.rotation.x = -Math.PI / 2;
    } else {
      for (let P = 0; P < 3; P++) {
        const L = e.mesh(S, "cone", v % 3 ? p.grassDark : p.leafLight, [
          0.035,
          0.3 + P * 0.09,
          0.035
        ], [
          R + (P - 1) * 0.16,
          0.15,
          _
        ]);
        L.rotation.z = (P - 1) * 0.35;
      }
      v % 11 === 0 && e.mesh(S, "rock", p.light, [
        0.12,
        0.13,
        0.12
      ], [
        R,
        0.38,
        _
      ]);
    }
  }
  for (const v of r.features) {
    const R = v.footprint, _ = R.width > R.depth, A = Math.max(R.width, R.depth), S = v.kind === "wall" ? Math.ceil(A / 7) : 1, P = e.group(t);
    P.name = v.id;
    for (let L = 0; L < S; L++) {
      const T = -A / 2 + (L + 0.5) * A / S, I = S === 1 ? R : {
        ...R,
        x: R.x + (_ ? T : 0),
        z: R.z + (_ ? 0 : T),
        width: _ ? A / S : R.width,
        depth: _ ? R.depth : A / S
      }, Z = S === 1 ? P : e.group(P);
      uc(e, u(I.x, I.z), Z, {
        ...v,
        footprint: I
      }, r.vista === "interior") ? (a.push(e.bake(Z)), s.push({
        root: Z,
        bounds: new cn().setFromObject(Z).expandByScalar(0.35)
      })) : Z.removeFromParent();
    }
  }
  for (const v of r.roads.slice(0, 1)) for (let R = 1; R < v.points.length; R++) {
    const [_, A] = v.points[R];
    if (!(r.vista === "camp" && Math.hypot(_, A - 8) < 13))
      for (const S of [-1, 1]) Xs(e, u(_, A), _ + S * (v.width / 2 + 0.6), A);
  }
  const k = e.group(t), C = r.vista === "interior" || r.vista === "room";
  if (e.mesh(k, "box", C ? p.undercroft : p.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, r.vista === "camp") for (let v = 0; v < 13; v++) {
    const R = -55 - v % 2 * 6, _ = -44 + v * 7, A = 7 + v % 3 * 2;
    e.mesh(k, "box", p.distantWall, [
      10,
      A,
      6.5
    ], [
      R,
      A / 2,
      _
    ]);
    const S = e.mesh(k, "box", p.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      R,
      A,
      _
    ]);
    S.rotation.z = -0.16;
    for (let P = -1; P <= 1; P++) e.mesh(k, "box", v % 4 ? p.shadow : p.ember, [
      0.05,
      0.7,
      0.6
    ], [
      R + 5.03,
      A - 1.7,
      _ + P * 1.6
    ], v % 4 === 0);
  }
  for (let v = 0; v < (C ? 0 : 12); v++) {
    const R = (v % 2 ? 1 : -1) * (w.width / 2 + 15 + v % 3 * 8), _ = w.z - 25 + v * 7;
    e.mesh(k, "crown", v % 3 ? p.distantGround : p.distantLeaf, [
      17 + v % 4 * 3,
      6 + v % 3 * 2,
      22
    ], [
      R,
      -3,
      _
    ]);
  }
  for (let v = 0; v < (C || r.vista === "garden" ? 0 : 9); v++) {
    const R = (v - 4) * 12, _ = w.z - w.depth / 2 - 15 - v % 3 * 6, A = 9 + v % 4 * 3;
    e.mesh(k, "box", p.distantWall, [
      9,
      A,
      9
    ], [
      R,
      A / 2 - 2,
      _
    ]), e.mesh(k, "cone", p.distantRoof, [
      7,
      6,
      7
    ], [
      R,
      A + 1,
      _
    ]);
    for (let S = -1; S <= 1; S++) e.mesh(k, "box", p.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      R + S * 2.2,
      A - 4,
      _ + 4.55
    ]);
  }
  if (!C && r.vista !== "garden") {
    const v = w.z - w.depth / 2 - 28;
    e.mesh(k, "cylinder", p.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      v
    ]);
    for (const R of [
      10,
      22,
      33
    ]) e.mesh(k, "cylinder", p.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      R,
      v
    ]);
    for (let R = 0; R < 6; R++) {
      const _ = R * Math.PI / 3, A = -17 + Math.sin(_) * 8.8, S = v + Math.cos(_) * 8.8;
      e.mesh(k, "box", p.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        A,
        19,
        S
      ]);
      const P = e.mesh(k, "box", p.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(_) * 9.02,
        26,
        v + Math.cos(_) * 9.02
      ], !0);
      P.rotation.y = _;
    }
    e.mesh(k, "cylinder", p.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      v
    ]), e.mesh(k, "cone", p.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      v
    ]);
  }
  a.push(e.bake(k));
  for (const v of n.values()) a.push(e.bake(v));
  return {
    update(v, R) {
      i.direction.copy(c.set(Math.sin(R), wt.height / wt.distance, Math.cos(R)).normalize());
      for (const _ of s) {
        o.length = 0;
        for (const A of [0.1, 1.6])
          if (i.origin.set(v.x, A, v.y), l.ray.copy(i), i.intersectsBox(_.bounds) && l.intersectObject(_.root, !0, o), o.length) break;
        _.root.visible = o.length === 0;
      }
    },
    dispose() {
      a.forEach((v) => v()), t.clear();
    }
  };
}
function yc(e, t, r, a, n, s, i = !0) {
  const c = Ha([...s], r), l = e.group(t, [
    a,
    0,
    n
  ]), o = e.group(t), u = r === "sanniang", h = r === "laobai", d = r === "kouzi";
  l.rotation.y = u ? 0.25 : -0.35, i && (d || r === "anian") && (l.position.y = -0.3), l.scale.setScalar(h ? 1.24 : d ? 1.06 : r === "anian" ? 1.19 : 1.12);
  const f = u ? "#343d59" : h ? "#596a80" : d ? "#53617a" : "#79647d", m = "#615047", y = "#dfbaa0", b = h ? 0.39 : d ? 0.25 : 0.29, w = h ? 0.31 : 0.23, k = [];
  for (const F of [-1, 1]) {
    const N = e.group(l, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    N.rotation.x = i && (d || r === "anian") ? -1.15 : F * 0.06, k.push(N), e.mesh(N, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(N, "cylinder", m, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(N, "sphere", m, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(l, "sphere", f, [
    b,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(l, "cylinder", f, [
    w,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(l, "cylinder", m, [
    w + 0.015,
    0.08,
    0.23
  ], [
    0,
    1.01,
    0
  ]), e.mesh(l, "box", "#c6aa72", [
    0.13,
    0.11,
    0.03
  ], [
    0,
    1.01,
    0.244
  ]), e.mesh(l, "cylinder", y, [
    0.095,
    0.2,
    0.1
  ], [
    0,
    1.68,
    0
  ]);
  const C = e.group(l, [
    0,
    1.93,
    0.025
  ]);
  C.rotation.x = u ? 0.1 : -0.025, e.mesh(C, "sphere", y, [
    0.215,
    0.285,
    0.22
  ]);
  const v = u ? "#272b42" : d ? "#643d41" : r === "anian" ? "#483b40" : "#30343e";
  e.mesh(C, "sphere", v, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(C, "sphere", v, [
      0.045,
      0.17,
      0.095
    ], [
      F * 0.2,
      0.02,
      -0.03
    ]), e.mesh(C, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      F * 0.083,
      0.025,
      0.216
    ]), e.mesh(C, "box", v, [
      0.069,
      0.018,
      0.016
    ], [
      F * 0.086,
      0.093,
      0.219
    ]), e.mesh(C, "sphere", y, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(C, "sphere", y, [
    0.035,
    0.05,
    0.045
  ], [
    0,
    -0.025,
    0.223
  ]), e.mesh(C, "box", "#b47f70", [
    0.06,
    0.012,
    0.014
  ], [
    0,
    -0.126,
    0.194
  ]);
  for (const F of [-1, 1]) {
    const N = e.group(l, [
      F * b,
      1.48,
      0
    ]);
    N.rotation.z = F * 0.11, N.rotation.x = u ? F > 0 ? -0.85 : -0.2 : F > 0 ? -0.4 : -0.1, e.mesh(N, "cylinder", f, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(N, "cylinder", u ? "#e8e1cc" : "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(N, "cylinder", y, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(N, "sphere", y, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]), u && F > 0 && (e.mesh(N, "cylinder", "#b67e3f", [
      0.073,
      0.21,
      0.073
    ], [
      0,
      -0.68,
      0.1
    ]), e.mesh(N, "cylinder", "#dbc8a2", [
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
    e.mesh(l, "cylinder", f, [
      0.125,
      0.23,
      0.12
    ], [
      0,
      1.66,
      0
    ]), e.shape(l, [
      [-0.21, 0.36],
      [0.21, 0.36],
      [0.3, -0.36],
      [-0.3, -0.36]
    ], "#eee7d3", [
      0,
      1.02,
      0.238
    ], 0.014), e.mesh(l, "box", "#d0c4a4", [
      0.18,
      0.17,
      0.025
    ], [
      0.07,
      0.85,
      0.276
    ]);
    for (const F of [-1, 1]) {
      const N = e.mesh(l, "box", "#eee7d3", [
        0.052,
        0.53,
        0.025
      ], [
        F * 0.16,
        1.39,
        0.19
      ]);
      N.rotation.z = -F * 0.15;
    }
    e.mesh(C, "sphere", v, [
      0.19,
      0.17,
      0.13
    ], [
      0.09,
      -0.03,
      -0.22
    ]), e.mesh(C, "cylinder", "#dfba7a", [
      0.014,
      0.38,
      0.014
    ], [
      0.12,
      0.03,
      -0.26
    ]).rotation.z = 1.2, e.mesh(l, "cone", f, [
      0.4,
      0.85,
      0.32
    ], [
      0,
      0.66,
      0
    ]), e.mesh(l, "cylinder", "#803f4e", [
      0.27,
      0.075,
      0.245
    ], [
      0,
      1.01,
      0
    ]), e.shape(l, [
      [-0.35, 0.2],
      [0.35, 0.2],
      [0.43, -0.22],
      [-0.43, -0.22]
    ], f, [
      0,
      1.43,
      -0.23
    ], 0.018), e.mesh(l, "box", m, [
      0.24,
      0.28,
      0.17
    ], [
      -0.31,
      0.9,
      -0.05
    ]);
  } else if (h) {
    e.mesh(l, "sphere", f, [
      0.34,
      0.35,
      0.2
    ], [
      0,
      1.17,
      0.1
    ]), e.shape(l, [
      [-0.41, 0.34],
      [0.41, 0.34],
      [0.49, -0.58],
      [0.18, -0.7],
      [-0.35, -0.57]
    ], "#627a92", [
      0,
      1.18,
      -0.26
    ], 0.025), e.mesh(l, "box", "#aeb7b6", [
      0.44,
      0.14,
      0.11
    ], [
      0,
      1.62,
      0.19
    ]);
    const F = e.group(l, [
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
    ]), e.mesh(l, "cylinder", "#e4dfcd", [
      0.13,
      0.25,
      0.14
    ], [
      0.16,
      0.36,
      0.06
    ]);
  } else if (d) {
    if (e.mesh(l, "cylinder", "#b48859", [
      0.18,
      0.17,
      0.17
    ], [
      0,
      1.65,
      0
    ]), e.mesh(l, "box", "#b48859", [
      0.17,
      0.38,
      0.04
    ], [
      0.08,
      1.42,
      0.24
    ]), e.mesh(l, "cylinder", "#74869e", [
      0.025,
      0.48,
      0.025
    ], [
      -0.36,
      0.67,
      0.18
    ]), e.mesh(l, "box", "#74869e", [
      0.13,
      0.11,
      0.055
    ], [
      -0.36,
      0.92,
      0.18
    ]), c && i) {
      l.position.y = 0.5;
      const F = e.mesh(o, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        a,
        0.72,
        n
      ]);
      F.rotation.z = Math.PI / 2;
      for (const N of [-1, 1]) e.mesh(o, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + N * 0.8,
        0.35,
        n
      ]);
    }
    e.mesh(l, "box", "#e7dbc4", [
      0.28,
      0.22,
      0.23
    ], [
      0.16,
      0.53,
      0.03
    ]), e.mesh(l, "box", "#6f5540", [
      0.24,
      0.21,
      0.15
    ], [
      -0.3,
      1,
      0.12
    ]), s.has("supplies_secured") && e.mesh(l, "cylinder", "#8caaa7", [
      0.035,
      0.44,
      0.035
    ], [
      -0.32,
      1.11,
      0.22
    ]), e.mesh(l, "box", "#6b5944", [
      0.52,
      0.43,
      0.03
    ], [
      0,
      1.29,
      0.24
    ]);
  } else {
    e.mesh(l, "cone", f, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(C, "sphere", v, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let N = 0; N < 3; N++) {
      const Y = e.mesh(l, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + N * 0.02,
        1.02,
        0.31 + N * 0.023
      ]);
      Y.rotation.z = N * 0.1;
    }
    const F = e.mesh(l, "box", "#d8ba87", [
      0.075,
      0.83,
      0.04
    ], [
      0,
      1.25,
      0.22
    ]);
    F.rotation.z = -0.55, e.mesh(l, "box", m, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const R = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  C.removeFromParent(), k.forEach((F) => F.removeFromParent());
  const _ = k.map((F) => e.bake(F)), A = e.bake(l), S = e.bake(C), P = e.bake(o);
  l.add(C, ...k);
  const L = l.position.y, T = l.rotation.y, I = {
    x: a,
    y: n
  };
  let Z = -1 / 0, H = 0;
  return {
    root: l,
    ring: R,
    id: r,
    position: I,
    seated: i,
    locate(F, N) {
      const Y = I.x !== F.position.x || I.y !== F.position.y;
      return Y && (Z = N), H = F.facing, I.x = F.position.x, I.y = F.position.y, l.position.x = I.x, l.position.z = I.y, R.position.x = I.x, R.position.z = I.y, Y;
    },
    update(F, N, Y) {
      const ae = N - Z < 120, Ve = Math.hypot(F.x - I.x, F.y - I.y) < 10;
      R.visible = Ve;
      const Te = ae ? Math.PI / 2 - H : Ve ? Math.atan2(F.x - I.x, F.y - I.y) : T, qe = Math.atan2(Math.sin(Te - l.rotation.y), Math.cos(Te - l.rotation.y));
      l.rotation.y += Y ? qe : qe * 0.16, l.position.y = L + (Y ? 0 : Math.sin(N * 15e-4 + a) * 0.012), C.rotation.y = Y ? 0 : Math.sin(N * 8e-4 + n) * 0.04, i || k.forEach((De, ke) => {
        De.rotation.x = Y || !ae ? 0 : Math.sin(N * 0.012 + ke * Math.PI) * 0.45;
      });
    },
    dispose() {
      A(), S(), P(), _.forEach((F) => F()), l.removeFromParent(), o.removeFromParent(), R.removeFromParent();
    }
  };
}
function bc(e, t, r, a) {
  const n = e.group(t), s = Object.values(He).find((h) => h.scene === r.id);
  let i = a, c = !1, l = [];
  const o = _n(r.id).flatMap((h) => {
    const d = it[h];
    return d.waves[0].filter((f, m) => !s || f.kind !== s.kind || m !== d.waves[0].findIndex((y) => y.kind === s.kind)).map((f) => {
      const m = vr(e, n, f.kind, Rn[0]);
      m.bar.removeFromParent();
      const y = r.anchors[f.anchor];
      return m.root.position.set(y.x, 0, y.y), {
        ...m,
        id: h,
        dispose: e.bake(m.root)
      };
    });
  }), u = () => {
    let h = !1;
    for (const d of o) {
      const f = !c && !fn(d.id, i, l);
      d.root.visible !== f && (d.root.visible = f, h = !0);
    }
    return h;
  };
  return u(), {
    setFacts(h) {
      i = h, u();
    },
    setProgress(h) {
      return l = h, u();
    },
    setEncounterActive(h) {
      c = h, u();
    },
    animate(h) {
      return !1;
    },
    dispose() {
      o.forEach((h) => h.dispose()), n.removeFromParent();
    }
  };
}
function wc(e, t, r, a) {
  const n = He[r], s = vr(e, t, n.kind, Rn[0]);
  s.bar.removeFromParent();
  const i = e.bake(s.root), c = { ...gn(r, a) };
  s.root.position.set(c.x, 0, c.y);
  let l = a;
  return {
    id: r,
    root: s.root,
    position: c,
    setFacts(o) {
      l = o;
    },
    update(o, u) {
      const h = gn(r, l), d = o.x - h.x, f = o.y - h.y, m = Math.hypot(d, f), y = m <= n.approachRadius, b = y && !l.has(n.complete) ? 1 : 0, w = h.x + (m ? d / m * b : 0), k = h.y + (m ? f / m * b : 0), C = c.x + c.y + s.root.rotation.y;
      c.x += u ? w - c.x : (w - c.x) * 0.22, c.y += u ? k - c.y : (k - c.y) * 0.22, Math.abs(w - c.x) + Math.abs(k - c.y) < 0.01 && (c.x = w, c.y = k);
      const v = y ? Math.atan2(d, f) : 0, R = Math.atan2(Math.sin(v - s.root.rotation.y), Math.cos(v - s.root.rotation.y));
      return s.root.rotation.y += u || Math.abs(R) < 5e-3 ? R : R * 0.2, s.root.position.set(c.x, 0, c.y), C !== c.x + c.y + s.root.rotation.y;
    },
    dispose() {
      i(), s.root.removeFromParent();
    }
  };
}
var le = (e, t, r, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: r,
  facing: a
}), ao = {
  camp: [
    {
      id: "mender",
      name: "补衣人",
      activity: "mend",
      coat: "rose",
      phase: 0,
      route: [le(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [le(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [le(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [le(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        le(-31, 18, 6, -Math.PI / 2),
        le(-27, 16, 0),
        le(-23, 13, 7, Math.PI),
        le(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        le(10, 7, 6),
        le(5, 10, 0),
        le(-8, 13, 0),
        le(-18, 14, 8, Math.PI),
        le(-8, 13, 0),
        le(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [le(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: ne.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [le(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [le(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [le(8, 2, 0)]
  }],
  south_street: [
    {
      id: "tea-seller",
      name: "热水铺掌柜",
      activity: "cook",
      coat: "cream",
      phase: 0,
      route: [le(7, -17, 0, Math.PI / 2)]
    },
    {
      id: "tea-drinker",
      name: "歇脚的街坊",
      activity: "warm",
      coat: "blue",
      phase: 1,
      route: [le(-7, 19, 0)]
    },
    {
      id: "city-delivery",
      name: "送货的伙计",
      activity: "deliver",
      coat: "rose",
      phase: 6,
      route: [
        le(11, 23, 7),
        le(5, 17, 0),
        le(0, 7, 0),
        le(0, -5, 5),
        le(0, 7, 0),
        le(5, 17, 0)
      ]
    }
  ],
  workshop_street: [
    {
      id: "pipe-fitter",
      name: "修管的工人",
      activity: "repair",
      coat: "blue",
      phase: 0,
      route: [le(18, -4, 0)]
    },
    {
      id: "lodging-mender",
      name: "补衣的寄工",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [le(17, 20, 0)]
    },
    {
      id: "workshop-water",
      name: "领水的寄工",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        le(-10, 19, 6, -Math.PI / 2),
        le(-4, 18, 0),
        le(8, 21, 0),
        le(14, 20, 7),
        le(8, 21, 0),
        le(-4, 18, 0)
      ]
    }
  ],
  workers_lodging: [{
    id: "old-mender",
    name: "补鞋的老寄工",
    activity: "mend",
    coat: "cream",
    phase: 0,
    route: [le(-7, 7, 0)]
  }]
}, xc = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, _c = 0.85;
function Gr(e, t) {
  const r = e.route;
  if (r.length === 1) return {
    position: r[0].position,
    facing: r[0].facing,
    walking: !1
  };
  const a = r.map((s, i) => {
    const c = r[(i + 1) % r.length].position;
    return s.wait + Math.hypot(c.x - s.position.x, c.y - s.position.y) / _c;
  });
  let n = (t + e.phase) % a.reduce((s, i) => s + i, 0);
  for (let s = 0; s < r.length; s++) {
    if (n > a[s]) {
      n -= a[s];
      continue;
    }
    const i = r[s], c = r[(s + 1) % r.length].position;
    if (n <= i.wait) return {
      position: i.position,
      facing: i.facing,
      walking: !1
    };
    const l = (n - i.wait) / (a[s] - i.wait);
    return {
      position: {
        x: i.position.x + (c.x - i.position.x) * l,
        y: i.position.y + (c.y - i.position.y) * l
      },
      facing: Math.atan2(c.x - i.position.x, c.y - i.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function Mc(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function kc(e, t) {
  e.updateWorldMatrix(!0, !0);
  const r = e.matrixWorld.clone().invert(), a = new os(), n = [];
  e.traverse((c) => {
    if (!(c instanceof $t)) return;
    const l = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(a.multiplyMatrices(r, c.matrixWorld)), o = c.material.color, u = new Eo(new Float32Array(l.getAttribute("position").count * 3), 3);
    for (let h = 0; h < u.count; h++) u.setXYZ(h, o.r, o.g, o.b);
    l.setAttribute("color", u), n.push(l);
  });
  const s = us(n);
  if (n.forEach((c) => c.dispose()), !s) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new $t(s, t);
  return i.receiveShadow = !0, e.add(i), () => {
    s.dispose(), e.clear();
  };
}
function no(e, t, r, a) {
  const n = e.group(t), s = e.group(n), i = [], c = [], l = {
    blue: p.slate,
    rose: p.rose,
    cream: p.cloth
  }[r.coat], o = r.activity === "mend" || r.activity === "warm", u = "#dfbda7", h = o ? 0.75 : 1.05;
  e.mesh(s, "box", l, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    h,
    0
  ]), e.mesh(s, "crown", u, [
    0.23,
    0.27,
    0.21
  ], [
    0,
    h + 0.61,
    0
  ]), e.mesh(s, "crown", p.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    h + 0.77,
    -0.02
  ]), e.mesh(s, "box", p.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    h - 0.23,
    0
  ]), e.mesh(s, "box", p.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    h + 0.12,
    0.21
  ]);
  for (const f of [-1, 1]) {
    const m = e.group(n, [
      f * 0.36,
      h + 0.22,
      0
    ]);
    i.push(m), e.mesh(m, "box", l, [
      0.17,
      0.44,
      0.19
    ], [
      0,
      -0.2,
      0
    ]), e.mesh(m, "crown", u, [
      0.1,
      0.11,
      0.1
    ], [
      0,
      -0.46,
      0.02
    ]);
    const y = e.group(n, [
      f * 0.16,
      h - 0.31,
      0
    ]);
    c.push(y), e.mesh(y, "box", p.timber, [
      0.2,
      o ? 0.3 : 0.59,
      0.22
    ], [
      0,
      o ? -0.12 : -0.26,
      o ? 0.2 : 0
    ]), e.mesh(y, "box", p.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      o ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (o && e.mesh(s, "box", p.wood, [
    0.62,
    0.55,
    0.6
  ], [
    0,
    0.275,
    -0.12
  ]), r.activity === "water") for (const f of [-1, 1]) e.mesh(i[f > 0 ? 1 : 0], "box", p.wood, [
    0.36,
    0.39,
    0.36
  ], [
    f * 0.13,
    -0.65,
    0
  ]);
  else r.activity === "deliver" ? (e.mesh(s, "box", p.wood, [
    0.65,
    0.47,
    0.5
  ], [
    0,
    h - 0.05,
    0.45
  ]), e.mesh(s, "box", p.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    h - 0.05,
    0.72
  ])) : r.activity === "mend" || r.activity === "dressings" ? e.mesh(s, "box", p.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    h - 0.22,
    0.36
  ]) : r.activity === "warm" && e.mesh(s, "box", p.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    h + 0.1,
    0.38
  ]);
  n.traverse((f) => {
    f.castShadow = !1;
  });
  const d = [
    s,
    ...i,
    ...c
  ].map((f) => kc(f, a));
  return {
    root: n,
    body: s,
    arms: i,
    legs: c,
    dispose() {
      d.forEach((f) => f()), n.removeFromParent();
    }
  };
}
function Sc(e, t, r) {
  const a = new ir({
    vertexColors: !0,
    roughness: 0.95
  }), n = (ao[r] ?? []).map((c) => ({
    spec: c,
    model: no(e, t, c, a),
    time: 0
  }));
  let s = null, i = null;
  return {
    animate(c, l, o, u) {
      const h = o ? 0 : Mc(s, l);
      s = l;
      let d = n.length > 0 && i !== o;
      i = o;
      for (const f of n) {
        const { spec: m, model: y } = f, b = Gr(m, f.time), w = Math.hypot(b.position.x - c.x, b.position.y - c.y) < 27 && u(b.position);
        if (y.root.visible !== w && (y.root.visible = w, d = !0), !w) continue;
        f.time += h;
        const k = Gr(m, f.time), C = o ? 0 : Math.sin(f.time * (k.walking ? 5.5 : 1.5) + m.phase);
        y.root.position.set(k.position.x, 0, k.position.y), y.root.rotation.y = k.facing, y.body.position.y = k.walking ? Math.abs(C) * 0.035 : 0, y.legs.forEach((v, R) => {
          v.rotation.x = k.walking ? C * 0.35 * (R ? 1 : -1) : 0;
        }), y.arms.forEach((v, R) => {
          v.rotation.x = k.walking ? C * 0.24 * (R ? -1 : 1) : -0.6 + C * 0.13 * (R ? 1 : -1), m.activity === "deliver" && (v.rotation.x = -0.75), m.activity === "warm" && (v.rotation.x = -1.1), m.activity === "cook" && !R && (v.rotation.x = -0.8 + C * 0.3);
        }), d = h > 0 || d;
      }
      return d;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function Rc(e, t, r) {
  const a = new ir({
    vertexColors: !0,
    roughness: 0.9
  }), n = pa.filter((s) => Oe[s].scene === r.id).map((s) => {
    const i = Oe[s], c = r.anchors[i.anchor], l = no(e, t, {
      coat: i.coat,
      activity: s === "chenhe" ? "mend" : s === "chengtiesheng" ? "repair" : "keep"
    }, a);
    l.root.position.set(c.x, 0, c.y);
    const o = e.group(l.body);
    s === "chengtiesheng" ? (e.mesh(o, "box", p.brass, [
      0.14,
      0.35,
      0.08
    ], [
      0.25,
      0.7,
      0.27
    ]), e.mesh(o, "box", p.timber, [
      0.12,
      0.13,
      0.13
    ], [
      0.25,
      0.96,
      0.27
    ])) : s === "qinzhi" || s === "liangyoufang" ? e.mesh(o, "box", p.cloth, [
      0.37,
      0.04,
      0.29
    ], [
      0,
      0.96,
      0.36
    ]) : s === "wenshoutong" && (e.mesh(o, "box", p.slate, [
      0.56,
      0.45,
      0.36
    ], [
      0,
      0.62,
      0
    ]), e.mesh(o, "cylinder", p.pottery, [
      0.1,
      0.15,
      0.1
    ], [
      0.36,
      0.92,
      0.21
    ]));
    const u = e.bake(o), h = e.ring(l.root, p.brass, 0.72, 0, 0, 0.5, !0);
    let d = 0;
    return {
      id: s,
      root: l.root,
      position: c,
      update(f, m, y) {
        const b = f.x - c.x, w = f.y - c.y, k = Math.hypot(b, w) < 6;
        h.visible = k;
        const C = k ? Math.atan2(b, w) : Math.PI, v = Math.atan2(Math.sin(C - l.root.rotation.y), Math.cos(C - l.root.rotation.y)), R = Math.abs(v) > 5e-3;
        l.root.rotation.y += y || !R ? v : v * 0.22;
        const _ = !y && Math.hypot(b, w) < 22;
        if (_ || d !== 0) {
          d = _ ? m : 0;
          const A = _ ? Math.sin(m / 1e3 * 1.5) : 0;
          l.body.position.y = A * 0.014, l.arms.forEach((S, P) => {
            S.rotation.x = -0.35 + A * 0.045 * (P ? -1 : 1);
          });
        }
        return _ || R;
      },
      dispose() {
        u(), l.dispose();
      }
    };
  });
  return {
    people: n,
    dispose() {
      n.forEach((s) => s.dispose()), a.dispose();
    }
  };
}
function Cc(e, t, r, a) {
  const n = e.group(t), s = e.group(t), i = [], c = [];
  function l(o, u) {
    const h = a.has(o) ? 1 : 0;
    c.push({
      fact: o,
      pose: u,
      value: h,
      from: h,
      target: h,
      born: null
    }), u(h);
  }
  if (r.id === "south_street") {
    const o = r.anchors.stroll, u = e.group(n, [
      o.x + 1.3,
      0,
      o.y + 1
    ]);
    for (const h of [-0.7, 0.7]) e.mesh(u, "cylinder", p.timber, [
      0.055,
      1.8,
      0.055
    ], [
      h,
      0.9,
      0
    ]);
    e.mesh(u, "box", p.wood, [
      1.6,
      0.08,
      0.08
    ], [
      0,
      1.6,
      0
    ]);
    for (const [h, d] of [
      p.brass,
      p.rose,
      p.slate
    ].entries()) {
      const f = e.group(u, [
        (h - 1) * 0.65,
        1.6,
        0.1
      ]);
      f.rotation.z = h * 0.7;
      for (const m of [0, Math.PI / 2]) {
        const y = e.mesh(f, "box", d, [
          0.5,
          0.13,
          0.04
        ], [
          0,
          0,
          0
        ]);
        y.rotation.z = m;
      }
      e.mesh(f, "sphere", p.brass, [
        0.05,
        0.05,
        0.05
      ], [
        0,
        0,
        0.045
      ]);
    }
  }
  if ([
    "pipe_gallery",
    "deep_waterway",
    "main_valve"
  ].includes(r.id)) {
    const o = r.id === "deep_waterway", u = r.id === "main_valve", h = r.anchors[o ? "winch" : u ? "valve" : "trial"], d = h.x + 2.8, f = h.y - 0.8, m = e.group(n, [
      d,
      0,
      f
    ]);
    e.mesh(m, "cylinder", p.slate, [
      0.22,
      1.3,
      0.22
    ], [
      0,
      0.65,
      0
    ]);
    const y = e.group(s, [
      d,
      1.2,
      f + 0.25
    ]);
    e.mesh(y, "torus", p.brass, [
      0.7,
      0.7,
      0.7
    ]);
    for (const w of [0, Math.PI / 2]) {
      const k = e.mesh(y, "box", p.timber, [
        1.2,
        0.085,
        0.08
      ]);
      k.rotation.z = w;
    }
    i.push(e.bake(y));
    const b = o ? "deep_gate_opened" : u ? "heat_restored" : "return_flow_tested";
    if (l(b, (w) => {
      y.rotation.z = w * Math.PI * 1.3;
    }), !o) {
      e.mesh(m, "disc", p.light, [
        0.34,
        0.34,
        1
      ], [
        0,
        2.15,
        0.12
      ]);
      const w = e.group(s, [
        d,
        2.15,
        f + 0.14
      ]);
      e.mesh(w, "box", p.ember, [
        0.035,
        0.25,
        0.025
      ], [
        0,
        0.09,
        0
      ]), i.push(e.bake(w)), l(b, (k) => {
        w.rotation.z = 1.3 - k * 1.8;
      });
    }
  }
  if (r.id === "deep_waterway") {
    const o = r.landscape.gates[0].footprint, u = e.group(s, [
      o.x,
      0,
      o.z
    ]);
    for (const h of [-1, 1]) e.mesh(n, "box", p.stone, [
      0.6,
      6.8,
      1.2
    ], [
      o.x + h * o.width / 2,
      3.4,
      o.z
    ]);
    e.mesh(n, "box", p.stone, [
      o.width + 0.6,
      0.6,
      1.2
    ], [
      o.x,
      6.5,
      o.z
    ]);
    for (let h = -o.width / 2 + 0.4; h < o.width / 2; h += 1) e.mesh(u, "box", p.slate, [
      0.12,
      4.4,
      0.16
    ], [
      h,
      2.2,
      0
    ]);
    for (const h of [0.3, 3.8]) e.mesh(u, "box", p.brass, [
      o.width,
      0.16,
      0.25
    ], [
      0,
      h,
      0
    ]);
    i.push(e.bake(u)), l("deep_gate_opened", (h) => {
      u.position.y = h * 4.5;
    });
  }
  return i.push(e.bake(n)), {
    get animating() {
      return c.some((o) => o.value !== o.target);
    },
    setFacts(o) {
      for (const u of c) {
        const h = o.has(u.fact) ? 1 : 0;
        h !== u.target && (u.from = u.value, u.target = h, u.born = null);
      }
    },
    animate(o, u) {
      let h = !1;
      for (const d of c) {
        if (d.value === d.target) continue;
        d.born ??= o;
        const f = u ? 1 : Math.min(1, (o - d.born) / 1100), m = f * f * (3 - 2 * f);
        d.value = f === 1 ? d.target : d.from + (d.target - d.from) * m, d.pose(d.value), h = !0;
      }
      return h;
    },
    dispose() {
      i.forEach((o) => o()), n.removeFromParent(), s.removeFromParent();
    }
  };
}
function Pc(e, t, r, a) {
  const n = vc(e, t, r.landscape), s = e.group(t), i = e.group(t), c = bc(e, t, r, a), l = Sc(e, i, r.id), o = Rc(e, i, r), u = Cc(e, t, r, a), h = e.group(t);
  if (r.id === "pipe_gallery") for (const v of gs[r.id]) {
    const R = e.group(h, [
      v.x,
      0.65,
      v.y
    ]);
    R.rotation.y = Math.PI / 2 - v.angle, e.mesh(R, "cylinder", p.brass, [
      0.4,
      1.2,
      0.4
    ], [
      0,
      0,
      -0.6
    ]).rotation.x = Math.PI / 2, e.mesh(R, "torus", p.timber, [
      0.42,
      0.42,
      0.14
    ], [
      0,
      0,
      0
    ]), e.mesh(R, "disc", p.shadow, [
      0.34,
      0.34,
      1
    ]);
  }
  const d = e.bake(h), f = r.objects.filter((v) => v.kind === "reward" || v.kind === "rest").map((v) => {
    const R = r.anchors[v.anchor], _ = e.group(t, [
      R.x,
      0,
      R.y
    ]);
    if (v.kind === "reward") {
      e.mesh(_, "box", p.wood, [
        0.85,
        0.45,
        0.6
      ], [
        0,
        0.225,
        -0.65
      ]);
      for (const A of [-1, 1]) e.mesh(_, "box", p.brass, [
        0.055,
        0.48,
        0.63
      ], [
        A * 0.26,
        0.24,
        -0.65
      ]);
      e.mesh(_, "rock", p.ember, [
        0.15,
        0.3,
        0.15
      ], [
        0,
        0.68,
        -0.65
      ], !0), e.ring(_, p.brass, 0.65, 0, 0, 0.35, !0);
    } else {
      e.mesh(_, "box", p.wood, [
        1.4,
        0.12,
        0.6
      ], [
        0,
        0.5,
        -0.7
      ]);
      for (const A of [-1, 1]) e.mesh(_, "box", p.timber, [
        0.12,
        0.45,
        0.5
      ], [
        A * 0.5,
        0.22,
        -0.7
      ]);
    }
    return _.visible = !1, {
      id: v.id,
      model: _,
      dispose: e.bake(_)
    };
  }), m = [], y = Mn.filter((v) => He[v].scene === r.id).map((v) => wc(e, i, v, a));
  let b = -1, w = null, k = null;
  function C(v) {
    const R = [...v].sort().join("/");
    if (R === k) return;
    k = R, y.forEach((A) => A.setFacts(v)), w?.(), c.setFacts(v), u.setFacts(v);
    for (const A of xn(r, v)) {
      const S = A.position;
      if (A.kind === "exit") {
        if (!A.target.doorway) for (const P of [-1, 1]) Xs(e, s, S.x + P * 1.7, S.y, 1.5);
        e.mesh(s, "box", p.brass, [
          3,
          0.025,
          0.35
        ], [
          S.x,
          0.12,
          S.y
        ]).castShadow = !1;
      } else if (A.target.kind === "inspect" && A.target.passage === "warning")
        e.mesh(s, "box", p.timber, [
          0.12,
          1.8,
          0.12
        ], [
          S.x,
          0.9,
          S.y
        ]), e.mesh(s, "box", p.wood, [
          1.4,
          0.7,
          0.13
        ], [
          S.x,
          1.6,
          S.y
        ]), e.mesh(s, "box", p.light, [
          0.7,
          0.4,
          0.025
        ], [
          S.x,
          1.6,
          S.y + 0.08
        ]);
      else if (A.target.kind === "inspect" && A.target.passage === "orders") {
        e.mesh(s, "box", p.slate, [
          2.2,
          0.8,
          1.2
        ], [
          S.x,
          0.4,
          S.y - 0.8
        ]);
        const P = e.mesh(s, "box", p.light, [
          1.8,
          0.08,
          0.9
        ], [
          S.x,
          0.85,
          S.y - 0.8
        ]);
        P.rotation.x = 0.2;
        for (let L = -1; L <= 1; L++) e.mesh(s, "cylinder", p.brass, [
          0.12,
          0.12,
          0.12
        ], [
          S.x + L * 0.45,
          0.95,
          S.y - 0.55
        ]);
      }
    }
    if (r.id === "camp") {
      const A = r.landscape.features.find((S) => S.kind === "clinic").footprint;
      if (v.has("heat_restored")) {
        const S = r.landscape.features.find((P) => P.id === "hearth").footprint;
        e.mesh(s, "disc", p.ember, [
          1.2,
          1.2,
          1
        ], [
          S.x,
          0.2,
          S.z + 1.12
        ], !0).rotation.x = -Math.PI / 2;
        for (let P = 0; P < 3; P++) e.mesh(s, "crown", "#f0f5f6", [
          0.24 + P * 0.1,
          0.38,
          0.24
        ], [
          S.x + (P % 2 ? 0.17 : -0.1),
          2.2 + P * 0.5,
          S.z
        ], !0, 0.32 - P * 0.06);
        for (const P of [-1, 1])
          e.mesh(s, "cylinder", p.pottery, [
            0.32,
            0.38,
            0.32
          ], [
            A.x + P * 1.6,
            0.19,
            A.z + A.depth / 2 + 0.6
          ]), e.mesh(s, "disc", "#b5d8e6", [
            0.29,
            0.29,
            1
          ], [
            A.x + P * 1.6,
            0.39,
            A.z + A.depth / 2 + 0.6
          ], !0).rotation.x = -Math.PI / 2;
      }
      if (v.has("clinic_helped")) {
        const S = r.landscape.features.find((P) => P.kind === "bench").footprint;
        for (const P of [-1, 1])
          e.mesh(s, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            S.x,
            0.91,
            S.z + P * 0.65
          ]), e.mesh(s, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            S.x,
            1.024,
            S.z + P * 0.65
          ]);
      }
      if (v.has("receiving_arranged")) for (const S of [-1, 1]) {
        const P = A.x + S * 2.4, L = A.z + A.depth / 2 - 0.2, T = e.group(s, [
          P,
          0.2,
          L
        ]);
        T.rotation.x = -0.16;
        for (const I of [-1, 1]) e.mesh(T, "cylinder", p.timber, [
          0.055,
          2.9,
          0.055
        ], [
          I * 0.42,
          1.4,
          0
        ]);
        e.mesh(T, "box", v.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const I of [0.7, 2.1]) e.mesh(T, "box", p.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          I,
          0.12
        ]);
      }
      if (v.has("warden_defeated")) {
        const S = r.landscape.features.find((P) => P.kind === "wagon").footprint;
        for (let P = 0; P < 4; P++) {
          const L = e.group(s, [
            S.x + (P % 2 ? 0.65 : -0.65),
            1.4,
            S.z + (P < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(L, "box", p.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const T of [-1, 1]) e.mesh(L, "box", p.brass, [
            0.08,
            0.78,
            1.22
          ], [
            T * 0.35,
            0.38,
            0
          ]);
          e.mesh(L, "box", p.light, [
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
    for (const A of r.objects) {
      if (A.kind !== "switch") continue;
      const S = r.anchors[A.anchor], P = v.has(A.fact), L = e.group(s, [
        S.x,
        0,
        S.y
      ]);
      e.mesh(L, "box", p.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(L, "box", p.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const T = e.group(L, [
        0,
        0.75,
        0
      ]);
      T.rotation.z = P ? 0.65 : -0.65, e.mesh(T, "cylinder", p.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(T, "cylinder", p.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const _ = Ct(r, v);
    for (const A of r.landscape.gates) {
      if (r.id === "deep_waterway" && A.id === "deep_gate") continue;
      const S = A.footprint, P = S.width > S.depth, L = Math.max(S.width, S.depth), T = e.group(s, [
        S.x,
        0,
        S.z
      ]);
      P || (T.rotation.y = Math.PI / 2);
      for (const I of [-1, 1]) e.mesh(T, "box", p.stone, [
        0.35,
        3.2,
        0.7
      ], [
        I * L / 2,
        1.6,
        0
      ]);
      if (e.mesh(T, "box", p.light, [
        L + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), _.closedGates.has(A.id)) {
        for (let I = -L / 2 + 0.2; I < L / 2; I += 0.4) e.mesh(T, "box", p.shadow, [
          0.065,
          3,
          0.1
        ], [
          I,
          1.5,
          0
        ]);
        for (const I of [0.4, 2.5]) e.mesh(T, "box", p.brass, [
          L,
          0.12,
          0.15
        ], [
          0,
          I,
          0
        ]);
      } else e.mesh(T, "box", p.shadow, [
        L,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const A of r.landscape.features) {
      if (A.kind !== "beacon" || v.has("alarm_silenced")) continue;
      const S = A.footprint, P = e.mesh(s, "cylinder", p.timber, [
        0.045,
        4.8,
        0.045
      ], [
        S.x + 3.3,
        2.7,
        S.z + 2.5
      ]);
      P.rotation.z = -0.32;
      for (let L = 0; L < 5; L++) e.mesh(s, "rock", L % 2 ? p.ember : p.cloth, [
        0.55,
        1.2 + L % 3 * 0.3,
        0.55
      ], [
        S.x + Math.sin(L * 2) * 0.7,
        5.4 + L % 3 * 0.3,
        S.z + Math.cos(L * 2) * 0.7
      ], !0);
    }
    w = e.bake(s);
  }
  return C(a), {
    setFacts: C,
    people: m,
    parleyPeople: y,
    storyPeople: o.people,
    get animating() {
      return u.animating;
    },
    setProgress(v, R) {
      let _ = c.setProgress(v);
      for (const A of f) {
        const S = R.has(A.id);
        A.model.visible !== S && (A.model.visible = S, _ = !0);
      }
      return _;
    },
    setPeople(v, R) {
      let _ = !1;
      for (const A of pt) {
        const S = v[A], P = Wa[A].station, L = be[P.scene].anchors[P.anchor], T = S.mode === "idle" && (S.scene === "cells" || S.scene === P.scene && Math.hypot(S.position.x - L.x, S.position.y - L.y) < 1);
        let I = m.find((Z) => Z.id === A);
        I && (S.scene !== r.id || I.seated !== T) && (I.dispose(), m.splice(m.indexOf(I), 1), I = void 0, _ = !0), S.scene === r.id && (I || (I = yc(e, i, A, S.position.x, S.position.y, new Set(k?.split("/")), T), m.push(I), _ = !0), _ = I.locate(S, R) || _);
      }
      return _;
    },
    setEncounterActive(v) {
      c.setEncounterActive(v), y.forEach((R) => {
        R.root.visible = !v;
      });
    },
    update: n.update,
    animate(v, R, _, A) {
      const S = Math.floor(R / 80);
      if (S === b) return !1;
      b = S;
      let P = u.animate(R, _);
      P = c.animate(_) || P, P = l.animate(v, R, _, A) || P;
      for (const L of y) P = L.update(v, _) || P;
      for (const L of o.people) P = L.update(v, R, _) || P;
      for (const L of m) Math.hypot(L.position.x - v.x, L.position.y - v.y) < 22 ? (L.update(v, R, _), P = !_ || P) : L.ring.visible = !1;
      return P;
    },
    dispose() {
      u.dispose(), d(), h.removeFromParent(), f.forEach((v) => {
        v.dispose(), v.model.removeFromParent();
      }), l.dispose(), o.dispose(), m.splice(0).forEach((v) => v.dispose()), y.forEach((v) => v.dispose()), i.removeFromParent(), w?.(), c.dispose(), n.dispose();
    }
  };
}
var Ec = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, $c = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Ic = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, Ac = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function zc(e, t) {
  const r = new Mo(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  let i = 0, c = !1;
  function l(o, u) {
    i++;
    const h = r.load(o, (d) => {
      if (c) {
        d.dispose();
        return;
      }
      i--, s.delete(o);
      for (const f of u) a.set(f, d);
      e(), t(s.size, i);
    }, void 0, () => {
      c || (i--, n.delete(h), h.dispose(), s.set(o, u), t(s.size, i));
    });
    h.colorSpace = or, h.wrapS = h.wrapT = Lo, h.anisotropy = 2, n.add(h);
  }
  for (const [o, u] of [
    [Ec, [
      p.stone,
      p.wetStone,
      p.marble,
      p.marbleLight
    ]],
    [$c, [p.light]],
    [Ic, [p.roof, p.roofLight]],
    [Ac, [
      p.grass,
      p.grassLight,
      p.grassDark
    ]]
  ]) l(o, u);
  return {
    maps: a,
    retry() {
      if (!c && i === 0) {
        for (const [o, u] of s) l(o, u);
        t(s.size, i);
      }
    },
    dispose() {
      c = !0, n.forEach((o) => o.dispose()), n.clear(), a.clear(), s.clear();
    }
  };
}
function Tc(e, t, r) {
  const a = new ds({
    antialias: !0,
    alpha: !1,
    powerPreference: r.world ? "default" : "high-performance"
  });
  a.outputColorSpace = or, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, r.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const s = new is(), i = new cs(-10, 10, 10, -10, 0.1, 180), c = er();
  s.add(new ls("#effbff", "#74918a", 2));
  const l = new Nn("#fff4e5", 1.9);
  l.position.set(-12, 25, 13), l.castShadow = !0;
  const o = r.world ? 1024 : 1536;
  l.shadow.mapSize.set(o, o), Object.assign(l.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), l.shadow.bias = -4e-4, l.shadow.normalBias = 0.035, l.shadow.radius = 3, s.add(l);
  const u = new Nn("#c3edff", 1.1);
  u.position.set(7, 8, -15), s.add(u);
  const h = new Fa(), d = new Fa(), f = new Fa();
  s.add(h, d, f);
  const m = Ks(c, d, r.traveler.gender), y = Kl(c, f), b = Yl(c, f), w = Xl(n), k = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), v = [], R = matchMedia("(prefers-reduced-motion: reduce)"), _ = matchMedia("(max-height:450px) and (min-width:600px)"), A = new St(), S = new St();
  let P = null, L = "", T = "", I = "", Z = null, H = null, F = null, N = !1, Y = NaN, ae = NaN, Ve = NaN, Te = null, qe = 0, De = 0, ke = 1, ge = 1, lt = !0, zt = !1, Tt = !1, Gt = 0, Lt = -1, pe = 0, ve = !1;
  const mt = r.world ? zc(() => {
    L = "", lt = !0, r.invalidate?.();
  }, (Me, Fe) => r.artworkStatus?.(Me, Fe)) : null;
  function Ka() {
    const Me = e.getBoundingClientRect();
    ke = Math.max(1, Me.width), ge = Math.max(1, Me.height), a.setSize(ke, ge, !1), lt = !0, ve = !1, r.invalidate?.();
  }
  const Ot = new ResizeObserver(Ka);
  Ot.observe(e), Ka();
  function jt(Me) {
    Me.preventDefault(), Tt = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", jt);
  function fa(Me, Fe, vt, ct, Ye = !1) {
    if (Math.abs(Me) < 1) return;
    const B = document.createElement("span");
    B.className = Ye ? "exp-damage is-player" : Me < 0 ? "exp-damage is-heal" : "exp-damage", B.textContent = `${Me < 0 ? "+" : ""}${Math.ceil(Math.abs(Me))}`, n.append(B), v.push({
      element: B,
      position: new St(Fe, 2, vt),
      born: ct
    });
  }
  function gt() {
    for (const Me of k.values())
      d.remove(Me.actor.root), Me.marker.remove();
    k.clear(), v.splice(0).forEach((Me) => Me.element.remove());
  }
  function ma(Me) {
    return ve ? (S.set(Me.x, 1, Me.y).project(i), Math.abs(S.x) < 1.15 && Math.abs(S.y) < 1.15) : !0;
  }
  return {
    draw(Me, Fe, vt, ct = "battle", Ye = 0, B) {
      if (zt || Tt) return;
      const ga = performance.now(), J = ct === "battle" ? Me : null, va = J?.tick ?? (R.matches ? 0 : Ye * 0.025), Ut = (J?.tick ?? -1) !== Lt, Qt = `${Fe.weapon}/${Fe.outfit}/${vt}`;
      if (!B && !lt && ct === T && Qt === I && J === Z && (!Ut && J || !J && (ct === "between" || R.matches || Ye - Gt < 40))) return;
      Gt = Ye;
      const Aa = Rn[vt], ya = B ? B.definition.id : `${vt}:${J?.boss ?? !1}:${!!J}`;
      if (ya !== L) {
        if (m.resetMotion(), C.forEach((X) => X.remove()), C.clear(), P?.(), B) {
          const X = er(mt?.maps);
          H = Pc(X, h, B.definition, B.facts);
          const te = H;
          P = () => {
            te.dispose(), X.dispose();
          };
        } else
          H = null, P = Bl(c, h, vt, J);
        ve = !1, L = ya, s.background = new lr(Aa.sky), s.fog = new So(Aa.haze, 42, 95);
      } else B && Te !== B.facts && H?.setFacts(B.facts);
      (!!J != !!Z || J && Z && J.tick < Lt) && (m.resetMotion(), gt(), pe = J?.player.hp ?? 0);
      const za = !B && ct !== "battle", yt = ke < 600, Ta = yt || ge < 400, Kt = ke / ge;
      !!B?.reading !== N && (N = !!B?.reading, ve = !1);
      const La = B?.definition.landscape.vista === "room", Pt = La ? yt ? 20 : Math.max(30, Kt * (ge < 400 ? 19 : 25)) : B ? (yt ? wt.mobileWidth : Math.max(wt.minimumWidth, Kt * (ge < 400 ? wt.shortSpan : wt.tallSpan))) * (B.definition.safe && !J ? wt.settlementScale : 1) : za ? yt ? 13 : 28 : yt ? 18.5 : Math.max(27, Kt * (ge < 400 ? 14 : 23)), Xt = Math.max(0, K.arena - Pt / 2 + 0.5), bt = za ? 0 : 1 * Math.PI / 4, Oa = N && !_.matches ? Pt / Kt * 0.22 : 0, Xa = N && _.matches ? Pt * 0.23 : 0, Jt = (B ? B.location.position.x * (La ? 0.4 : 1) : J ? Ta ? J.player.x * 0.62 : Math.max(-Xt, Math.min(Xt, J.player.x * 0.62)) : yt ? 0 : 5.5) + Math.sin(bt) * Oa + Math.cos(bt) * Xa, ba = (B ? La ? B.location.position.y * 0.4 - 1 : B.location.position.y - wt.lead : J ? J.player.y * (Ta ? 0.62 : 0.2) - 0.4 : yt ? -4.2 : -11.8) + Math.cos(bt) * Oa - Math.sin(bt) * Xa;
      B && Math.hypot(Y - B.location.position.x, ae - B.location.position.y) > 8 && (ve = !1);
      const ja = Math.abs(A.x - Jt) + Math.abs(A.z - ba) < 0.015, Ja = B && H?.setPeople(B.people, Ye), Pn = B && H?.setProgress(B.completedSegments, B.objects), ea = B && H?.animate(B.location.position, Ye, R.matches, ma);
      if (B && !lt && ve && ja && Qt === I && J === Z && !Ut && Y === B.location.position.x && ae === B.location.position.y && Ve === B.location.facing && Te === B.facts && !ea && !Ja && !Pn && !m.animating) return;
      !ve || R.matches ? (A.set(Jt, 0, ba), ve = !0) : (A.x += (Jt - A.x) * 0.14, A.z += (ba - A.z) * 0.14), i.left = -Pt / 2, i.right = Pt / 2, i.top = Pt / Kt / 2, i.bottom = -i.top;
      const en = B ? wt.distance : 25;
      if (i.position.set(A.x + Math.sin(bt) * en, B ? wt.height : 28, A.z + Math.cos(bt) * en), i.lookAt(A.x, 0, A.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), B && (H?.setEncounterActive(!!J), H?.update(B.location.position, bt)), C.forEach((X) => {
        X.hidden = !0;
      }), B && !J) for (const X of B.definition.objects) {
        if (X.kind !== "reward" || !B.objects.has(X.id)) continue;
        const te = `reward/${X.id}`, $e = B.definition.anchors[X.anchor];
        let Ee = C.get(te);
        Ee || (Ee = document.createElement("span"), Ee.className = "exp-person-name", Ee.textContent = `◇ ${st.cache}`, n.append(Ee), C.set(te, Ee)), S.set($e.x, 1.4, $e.y).project(i);
        const wa = Math.max(65, Math.min(ke - 65, (S.x * 0.5 + 0.5) * ke)), ta = Math.max(105, Math.min(ge - 145, (-S.y * 0.5 + 0.5) * ge));
        Ee.hidden = !1, Ee.style.transform = `translate(${wa}px,${ta}px) translate(-50%,-100%)`;
      }
      const Ua = new Set(B && !J ? [
        ...kn(B.definition, B.location.position, B.facts, B.people),
        ...Qa(B.definition.id, B.location.position, B.facts),
        ...Ea(B.definition, B.location, B.facts).filter((X) => X.kind === "object" && X.target.kind === "resident")
      ].map((X) => X.target.id) : []);
      for (const X of [
        ...H?.people ?? [],
        ...H?.parleyPeople ?? [],
        ...H?.storyPeople ?? []
      ]) {
        if (J || !B || Math.hypot(X.position.x - B.location.position.x, X.position.y - B.location.position.y) > 10) continue;
        let te = C.get(X.id);
        te || (te = document.createElement("span"), te.className = "exp-person-name", te.textContent = Ze(X.id), n.append(te), C.set(X.id, te)), te.textContent = Ua.has(X.id) ? `${Ze(X.id)} · ${ne.actions.talk}` : Ze(X.id), S.set(X.position.x, 2.9 + X.root.position.y, X.position.y).project(i);
        const $e = (S.x * 0.5 + 0.5) * ke, Ee = (-S.y * 0.5 + 0.5) * ge;
        te.hidden = $e < 30 || $e > ke - 30 || Ee < 20 || Ee > ge - 20, te.style.transform = `translate(${$e}px,${Ee}px) translate(-50%,-100%)`;
      }
      r.world && (l.position.set(A.x - 12, 25, A.z + 13), l.target.position.set(A.x, 0, A.z), l.target.updateMatrixWorld());
      const Ge = B ? {
        ...B.location.position,
        facing: B.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      m.update(J?.player ?? Ge, Fe.weapon, Fe.outfit, va, Ye / 1e3, R.matches, za, !!J?.effects.some((X) => X.kind === "resonance"));
      for (const X of J?.enemies ?? []) {
        let te = k.get(X.id);
        if (!te) {
          const U = document.createElement("i");
          U.className = Ce(X.kind) ? "exp-threat is-boss" : "exp-threat", n.append(U), te = {
            actor: vr(c, d, X.kind, Aa),
            hp: X.hp,
            death: null,
            marker: U
          }, k.set(X.id, te);
        }
        te.hp > X.hp && Ut && fa(te.hp - X.hp, X.x, X.y, J.tick), te.hp = X.hp, te.actor.update(X, J.tick, R.matches, !!B), te.actor.bar.quaternion.copy(i.quaternion), S.set(X.x, 1.2, X.y).project(i);
        const $e = (S.x * 0.5 + 0.5) * ke, Ee = (-S.y * 0.5 + 0.5) * ge, wa = Math.min(18, ke / 2), ta = Math.min(yt ? 132 : 95, ge * 0.3), En = Math.max(ta, ge - Math.min(130, ge * 0.3)), Na = Math.max(wa, Math.min(ke - wa, $e)), Za = Math.max(ta, Math.min(En, Ee));
        te.marker.hidden = Math.abs($e - Na) + Math.abs(Ee - Za) < 10, te.marker.style.transform = `translate(${Na}px,${Za}px) rotate(${Math.atan2(Ee - Za, $e - Na) + Math.PI / 2}rad)`;
      }
      for (const [X, te] of k) {
        if (J?.enemies.some((Ee) => Ee.id === X)) continue;
        te.death === null && (te.death = J?.tick ?? 0, J && te.hp > 0 && fa(te.hp, te.actor.root.position.x, te.actor.root.position.z, J.tick));
        const $e = ((J?.tick ?? 0) - te.death) / 12;
        te.actor.bar.visible = !1, te.marker.hidden = !0, te.actor.root.scale.setScalar(Math.max(0, 1 - $e)), ($e >= 1 || !J || R.matches) && (d.remove(te.actor.root), te.marker.remove(), k.delete(X));
      }
      J && Ut && (pe !== J.player.hp && fa(pe - J.player.hp, J.player.x, J.player.y, J.tick, pe > J.player.hp), pe = J.player.hp);
      const tn = B && (B.engagement ?? Is(B.definition.id, B.facts, B.completedSegments));
      y.update(J, R.matches, tn ? it[tn].bounds : void 0);
      const We = J?.effects.filter((X) => X.kind === "ward-hit").at(-1);
      b.update(J?.player ?? null, We ? Math.max(0, (We.life - 5) / 10) : 0), w.update(J, i, ke, ge);
      for (let X = v.length - 1; X >= 0; X--) {
        const te = v[X], $e = ((J?.tick ?? 0) - te.born) / 27;
        if ($e >= 1 || !J) {
          te.element.remove(), v.splice(X, 1);
          continue;
        }
        S.copy(te.position), S.y += R.matches ? 0 : $e * 0.9, S.project(i), te.element.style.transform = `translate(${(S.x * 0.5 + 0.5) * ke}px,${(-S.y * 0.5 + 0.5) * ge}px)`, te.element.style.opacity = String(Math.min(1, (1 - $e) * 3));
      }
      a.render(s, i), qe++, De += performance.now() - ga, B && F !== B.definition.id && (F = B.definition.id, r.sceneReady?.(F)), lt = !1, T = ct, I = Qt, Z = J, Lt = J?.tick ?? -1, B && (Y = B.location.position.x, ae = B.location.position.y, Ve = B.location.facing, Te = B.facts);
    },
    invalidate() {
      lt = !0, r.invalidate?.();
    },
    needsFrame() {
      return H?.animating ?? !1;
    },
    retryArtwork() {
      mt?.retry();
    },
    stats() {
      return {
        draws: qe,
        submitMs: De,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      zt = !0, Ot.disconnect(), a.domElement.removeEventListener("webglcontextlost", jt), gt(), m.dispose(), w.dispose(), b.dispose(), P?.(), mt?.dispose(), l.shadow.dispose(), c.dispose(), s.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function ar(e) {
  if (e.kind === "exit") return `${ne.actions.travel} ${ne.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${ne.actions.talk} · ${ne.people[t.person]}`;
    case "enemy":
      return `${ne.actions.talk} · ${Ze(t.enemy)}`;
    case "resident":
      return `${ne.actions.talk} · ${Ze(t.person)}`;
    case "inspect":
      return ne.passages[t.passage].title;
    case "rest":
      return ne.actions.rest;
    case "reward":
      return st.cache;
    case "switch":
      return ne.switches[t.fact];
  }
}
var Lc = ["aria-label"], Oc = { class: "journey-hud" }, jc = { class: "journey-heading" }, Uc = { class: "journey-threat" }, Nc = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, Zc = ["disabled"], Dc = {
  key: 1,
  class: "journey-controls"
}, Fc = ["aria-label"], Bc = {
  key: 0,
  class: "journey-interaction"
}, qc = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Wc = {
  key: 0,
  class: "journey-resource"
}, Hc = [
  "max",
  "value",
  "aria-label"
], Vc = ["disabled"], Yc = ["disabled"], Gc = {
  key: 2,
  class: "journey-overlay"
}, Qc = /* @__PURE__ */ je({
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
  setup(e, { expose: t, emit: r }) {
    const a = e, n = r, s = W(null), i = W(null), c = W({
      x: 0,
      y: 0
    }), l = W(null), o = W({
      failed: 0,
      pending: 0
    }), u = V(() => a.battle ? [] : [
      ...Qa(a.world.definition.id, a.world.location.position, a.world.facts),
      ...Ea(a.world.definition, a.world.location, a.world.facts).filter((N) => N.kind === "exit" || a.world.objects.has(N.target.id)),
      ...kn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), h = V(() => u.value.find((N) => N.target.id === l.value) ?? null), d = V(() => a.weapon === "grimoire" ? re.contractPower : re.resource);
    let f = null, m = null, y = 0, b = 0, w = 0, k = !1, C = !0;
    const v = Fl((N, Y) => {
      c.value = {
        x: N * 26,
        y: Y * 26
      }, m?.stick(N, Y);
    }, () => s.value?.focus({ preventScroll: !0 }));
    function R() {
      v.clear(), m?.clear(), w = 0;
    }
    function _() {
      R(), n("pause");
    }
    function A() {
      f?.retryArtwork();
    }
    function S() {
      document.hidden ? (cancelAnimationFrame(y), y = 0, _()) : (f?.invalidate(), P());
    }
    function P() {
      !y && !k && C && (b = 0, y = requestAnimationFrame(F));
    }
    function L() {
      !a.paused && h.value && (R(), n("interact", h.value.target.id));
    }
    function T(N) {
      (!N || N.detail === 0) && m?.dash();
    }
    function I(N) {
      (!N || N.detail === 0) && m?.skill();
    }
    function Z(N, Y) {
      N.button === 0 && m?.[Y]();
    }
    function H() {
      const N = u.value.findIndex((Y) => Y.target.id === l.value);
      l.value = u.value[(N + 1) % u.value.length]?.target.id ?? null;
    }
    function F(N) {
      if (y = 0, k || !C) return;
      !a.paused && !document.hidden && (y = requestAnimationFrame(F));
      const Y = b ? Math.min(100, N - b) : 0;
      if (b = N, !a.paused && !document.hidden)
        for (w += Y; w >= 1e3 / K.hz && !a.paused; ) {
          w -= 1e3 / K.hz;
          const ae = m.frame();
          if (ae.skill && !a.battle) {
            L();
            break;
          }
          n("input", ae);
        }
      else w = 0;
      if (!document.hidden) try {
        f?.draw(a.battle ?? null, a, 0, "battle", N, a.world), !y && f?.needsFrame() && (y = requestAnimationFrame(F));
      } catch (ae) {
        cancelAnimationFrame(y), y = 0, R(), n("error", ae);
      }
    }
    return ue(u, (N) => {
      N.some((Y) => Y.target.id === l.value) || (l.value = N[0]?.target.id ?? null);
    }, { immediate: !0 }), ue(() => a.world.definition.id, () => {
      R(), l.value = u.value[0]?.target.id ?? null, s.value?.focus({ preventScroll: !0 });
    }), ue(() => a.paused, (N) => {
      R(), P(), N || s.value?.focus({ preventScroll: !0 });
    }), ue(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.world.reading,
      a.weapon,
      a.outfit
    ], P), ha(() => {
      try {
        f = Tc(i.value, () => {
          _(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: P,
          sceneReady: (N) => n("ready", N),
          artworkStatus: (N, Y) => {
            o.value = {
              failed: N,
              pending: Y
            };
          }
        });
      } catch (N) {
        n("error", N);
        return;
      }
      m = Dl(s.value, _, () => {
      }), document.addEventListener("visibilitychange", S), P(), s.value?.focus({ preventScroll: !0 });
    }), vn(() => {
      C = !1, cancelAnimationFrame(y), y = 0, _();
    }), rr(() => {
      C = !0, P();
    }), Yt(() => {
      k = !0, cancelAnimationFrame(y), R(), m?.dispose(), document.removeEventListener("visibilitychange", S), f?.dispose();
    }), t({
      stats: () => f?.stats(),
      focus: () => s.value?.focus({ preventScroll: !0 })
    }), (N, Y) => ($(), z("section", {
      ref_key: "root",
      ref: s,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? g(re).controls : g(ne).actions.controls
    }, [
      M("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      M("div", Oc, [M("header", jc, [M("h1", null, E(g(ne).scenes[e.world.definition.id]), 1), In(N.$slots, "status", {}, void 0, !0)]), M("div", Uc, [In(N.$slots, "threat", {}, void 0, !0)])]),
      o.value.failed ? ($(), z("div", Nc, [M("span", null, E(g(ne).artwork.unavailable), 1), M("button", {
        type: "button",
        disabled: o.value.pending > 0,
        onClick: A
      }, E(o.value.pending ? g(ne).artwork.loading : g(ne).artwork.retry), 9, Zc)])) : G("", !0),
      e.paused ? G("", !0) : ($(), z("div", Dc, [
        M("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": g(ne).actions.move,
          onPointerdown: Y[0] || (Y[0] = Et((...ae) => g(v).down && g(v).down(...ae), ["prevent"])),
          onPointermove: Y[1] || (Y[1] = Et((...ae) => g(v).move && g(v).move(...ae), ["prevent"])),
          onPointerup: Y[2] || (Y[2] = (...ae) => g(v).release && g(v).release(...ae)),
          onPointercancel: Y[3] || (Y[3] = (...ae) => g(v).release && g(v).release(...ae)),
          onLostpointercapture: Y[4] || (Y[4] = (...ae) => g(v).release && g(v).release(...ae)),
          onContextmenu: Y[5] || (Y[5] = Et(() => {
          }, ["prevent"]))
        }, [M("span", { style: Ra({ transform: `translate(${c.value.x}px, ${c.value.y}px)` }) }, null, 4)], 40, Fc),
        h.value ? ($(), z("div", Bc, [M("button", {
          type: "button",
          class: "journey-act",
          onClick: L
        }, [Y[9] || (Y[9] = M("kbd", null, "E", -1)), Ie(E(g(ar)(h.value)), 1)]), u.value.length > 1 ? ($(), z("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: H
        }, E(g(ne).actions.next), 1)) : G("", !0)])) : G("", !0),
        e.battle ? ($(), z("div", qc, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? ($(), z("div", Wc, [
            M("span", null, E(e.battle.player.resonance > 0 ? g(re).resonanceActive : d.value), 1),
            M("meter", {
              min: "0",
              max: g(kt).maxPower,
              value: e.battle.player.resource,
              "aria-label": d.value
            }, null, 8, Hc),
            M("small", null, E(e.battle.player.resonance > 0 ? g(re).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : G("", !0),
          M("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: Y[6] || (Y[6] = Et((ae) => Z(ae, "dash"), ["prevent"])),
            onClick: T
          }, [
            M("kbd", null, E(g(re).dashKey), 1),
            Ie(E(g(re).dash), 1),
            M("small", null, E(e.battle.player.dash > 0 ? g(re).secondsLeft(e.battle.player.dash) : g(re).ready), 1)
          ], 40, Vc),
          M("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: Y[7] || (Y[7] = Et((ae) => Z(ae, "skill"), ["prevent"])),
            onClick: I
          }, [
            M("kbd", null, E(g(re).skillKey), 1),
            Ie(E(g(Zt)[e.weapon].action), 1),
            M("small", null, E(e.battle.player.skill > 0 ? g(re).secondsLeft(e.battle.player.skill) : g(re).ready), 1)
          ], 40, Yc)
        ])) : G("", !0)
      ])),
      e.paused && !e.transitioning ? ($(), z("div", Gc, [In(N.$slots, "overlay", {}, () => [M("button", {
        class: "journey-act",
        type: "button",
        onClick: Y[8] || (Y[8] = (ae) => n("resume"))
      }, E(g(ne).actions.resume), 1)], !0)])) : G("", !0)
    ], 8, Lc));
  }
}), Kc = /* @__PURE__ */ at(Qc, [["__scopeId", "data-v-8c1be168"]]);
function Xc(e) {
  const t = new Set(e.location.visited.map(ot)), r = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const s = ot(n);
    for (const i of xn(be[n], r)) {
      if (i.kind !== "exit") continue;
      const c = ot(i.target.to), l = [s, c].sort().join("/");
      s !== c && (t.add(c), a.set(l, {
        id: l,
        from: s,
        to: c
      }));
    }
  }
  return {
    scenes: [...t],
    links: [...a.values()]
  };
}
function ro(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function Jc(e, t) {
  const r = ro(t), a = 3 * r, n = [], s = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let c = s(i), l = -1;
    for (let o = 0; o <= 48; o++) {
      const u = Math.ceil(o / 8) * 5.2 * r, h = o * Math.PI / 4, d = s({
        x: i.x + Math.cos(h) * u,
        y: i.y + Math.sin(h) * u
      }), f = Math.min(1 / 0, ...n.map((m) => Math.hypot(m.x - d.x, m.y - d.y)));
      if (f > l && (c = d, l = f), f >= 5.2 * r) break;
    }
    n.push(c);
  }
  return n;
}
var ed = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, td = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, ad = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, nd = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, rd = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, sd = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, od = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, id = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, ld = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, cd = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, dd = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, ud = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, hd = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, pd = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, fd = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, md = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, gd = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, vd = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, yd = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, bd = "" + new URL("ember-assets/scene-south-street-B-Gjuago.webp", import.meta.url).href, wd = "" + new URL("ember-assets/scene-workshop-street-BpKHSHY_.webp", import.meta.url).href, xd = "" + new URL("ember-assets/scene-heat-station-u2F5BDHt.webp", import.meta.url).href, Qr = {
  city: ed,
  cityMobile: td,
  chapter: ad
}, _d = {
  blade: nd,
  bow: rd,
  staff: sd,
  daggers: od,
  grimoire: id,
  cannon: ld
}, nr = {
  camp: cd,
  crossroads: dd,
  gate: ud,
  beacon: hd,
  waterway: pd,
  cells: fd,
  hall: md,
  roots: gd,
  south_street: bd,
  workshop_street: wd,
  heat_station: xd
}, Kr = {
  arrival: vd,
  ending: yd
}, Xr = {
  outskirts: {
    label: "外墙与檐下",
    layout: {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 15],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70],
      south_street: [52, 2]
    }
  },
  city: {
    label: "内堡南坊",
    layout: {
      hall: [40, 95],
      south_street: [40, 78],
      deep_waterway: [12, 80],
      workshop_street: [72, 66],
      coal_store: [92, 46],
      heat_station: [40, 52],
      pipe_gallery: [40, 36],
      sluice_bridge: [40, 20],
      main_valve: [40, 4]
    }
  }
}, Md = { class: "ember-map-header" }, kd = ["src"], Sd = ["aria-pressed"], Rd = ["viewBox", "aria-label"], Cd = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Pd = ["transform"], Ed = ["fill"], $d = {
  y: "22",
  "text-anchor": "middle"
}, Id = ["viewBox", "aria-label"], Ad = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], zd = ["points", "stroke-width"], Td = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Ld = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Od = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], jd = [
  "cx",
  "cy",
  "r",
  "fill"
], Ud = ["x", "y"], Nd = {
  key: 2,
  class: "ember-map-regions"
}, Zd = ["aria-pressed", "onClick"], Dd = {
  key: 3,
  class: "ember-map-places"
}, Fd = /* @__PURE__ */ je({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = W(!1), s = W(un(ot(r.campaign.location.scene)) ? "city" : "outskirts"), i = W(null), c = W(!1), l = W(null), o = W({
      width: 400,
      height: 400
    }), u = new ResizeObserver((_) => {
      for (const A of _) {
        const { width: S, height: P } = A.contentRect;
        A.target === i.value ? c.value = S > P * 1.55 : o.value = {
          width: S,
          height: P
        };
      }
    });
    ue(l, (_, A) => {
      A && u.unobserve(A), _ && u.observe(_);
    }), ha(() => {
      u.observe(i.value);
    }), Yt(() => u.disconnect());
    const h = V(() => Xc(r.campaign)), d = V(() => Xr[s.value].layout), f = V(() => Object.fromEntries(h.value.scenes.filter((_) => d.value[_]).map((_) => {
      const [A, S] = d.value[_], { width: P, height: L } = o.value;
      return [_, c.value ? [50 + (104 - S) / 104 * (P - 100), 10 + (A - 10) / 80 * (L - 40)] : [45 + A / 104 * (P - 90), 10 + S / 104 * (L - 40)]];
    }))), m = V(() => h.value.links.filter((_) => f.value[_.from] && f.value[_.to])), y = V(() => Object.entries(Xr).filter(([_]) => _ === "outskirts" || r.campaign.location.visited.some((A) => un(ot(A))))), b = V(() => be[r.campaign.location.scene]), w = V(() => b.value.landscape.bounds), k = V(() => ro(w.value)), C = V(() => `${w.value.x - w.value.width / 2 - 5 * k.value} ${w.value.z - w.value.depth / 2 - 5 * k.value} ${w.value.width + 10 * k.value} ${w.value.depth + 10 * k.value}`), v = V(() => Zs(r.campaign)), R = V(() => {
      const _ = Jc(v.value.map((A) => A.position), w.value);
      return v.value.map((A, S) => ({
        ...A,
        marker: _[S]
      }));
    });
    return (_, A) => ($(), z("div", {
      ref_key: "root",
      ref: i,
      class: ht(["ember-map", {
        "ember-map-wide": c.value,
        "ember-map-local": !n.value
      }])
    }, [
      M("div", Md, [
        g(nr)[b.value.id] ? ($(), z("img", {
          key: 0,
          src: g(nr)[b.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, kd)) : G("", !0),
        M("h2", null, E(n.value ? g(q).chapterMap : g(ne).scenes[b.value.id]), 1),
        M("div", null, [M("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: A[0] || (A[0] = (S) => n.value = !n.value)
        }, E(n.value ? g(q).localMap : g(q).chapterMap), 9, Sd), M("button", {
          type: "button",
          onClick: A[1] || (A[1] = (S) => a("close"))
        }, E(g(q).close), 1)])
      ]),
      n.value ? ($(), z("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: l,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": g(q).chapterMap,
        class: "ember-route-map"
      }, [($(!0), z(ee, null, _e(m.value, (S) => ($(), z("line", {
        key: S.id,
        x1: f.value[S.from][0],
        y1: f.value[S.from][1],
        x2: f.value[S.to][0],
        y2: f.value[S.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(S.from) && e.campaign.location.visited.includes(S.to) ? void 0 : "4 4"
      }, null, 8, Cd))), 128)), ($(!0), z(ee, null, _e(f.value, (S, P) => ($(), z("g", {
        key: P,
        transform: `translate(${S.join(",")})`
      }, [
        M("circle", {
          r: "6",
          fill: P === g(ot)(b.value.id) ? "#bf6242" : e.campaign.location.visited.includes(P) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Ed),
        M("text", $d, E(e.campaign.location.visited.includes(P) ? g(ne).scenes[P] : g(q).unknownArea), 1),
        M("title", null, E(e.campaign.location.visited.includes(P) ? g(ne).scenes[P] : g(q).unknownArea), 1)
      ], 8, Pd))), 128))], 8, Rd)) : ($(), z("svg", {
        key: 1,
        viewBox: C.value,
        role: "img",
        "aria-label": g(ne).scenes[b.value.id]
      }, [
        M("rect", {
          x: w.value.x - w.value.width / 2,
          y: w.value.z - w.value.depth / 2,
          width: w.value.width,
          height: w.value.depth,
          rx: "2",
          fill: b.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, Ad),
        ($(!0), z(ee, null, _e(b.value.landscape.roads, (S, P) => ($(), z("polyline", {
          key: P,
          points: S.points.map((L) => L.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": S.width,
          "stroke-linejoin": "round"
        }, null, 8, zd))), 128)),
        ($(!0), z(ee, null, _e(b.value.landscape.features, (S) => ($(), z("rect", {
          key: S.id,
          x: S.footprint.x - S.footprint.width / 2,
          y: S.footprint.z - S.footprint.depth / 2,
          width: S.footprint.width,
          height: S.footprint.depth,
          fill: S.kind === "water" ? "#6eb8c6" : S.kind === "tree" || S.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Td))), 128)),
        M("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * k.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": k.value
        }, [M("title", null, E(g(q).here), 1)], 8, Ld),
        ($(!0), z(ee, null, _e(R.value, (S, P) => ($(), z("g", { key: S.target.id }, [
          M("line", {
            x1: S.position.x,
            y1: S.position.y,
            x2: S.marker.x,
            y2: S.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * k.value
          }, null, 8, Od),
          M("circle", {
            cx: S.marker.x,
            cy: S.marker.y,
            r: 2.4 * k.value,
            fill: S.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, jd),
          M("text", {
            class: "ember-map-number",
            style: Ra({ fontSize: `${3.4 * k.value}px` }),
            x: S.marker.x,
            y: S.marker.y + 1.1 * k.value,
            "text-anchor": "middle"
          }, E(P + 1), 13, Ud),
          M("title", null, E(g(ar)(S)), 1)
        ]))), 128))
      ], 8, Id)),
      n.value ? ($(), z("div", Nd, [($(!0), z(ee, null, _e(y.value, ([S, P]) => ($(), z("button", {
        key: S,
        type: "button",
        "aria-pressed": s.value === S,
        onClick: (L) => s.value = S
      }, E(P.label), 9, Zd))), 128))])) : ($(), z("ol", Dd, [($(!0), z(ee, null, _e(v.value, (S) => ($(), z("li", { key: S.target.id }, E(g(ar)(S)), 1))), 128))]))
    ], 2));
  }
}), Bd = /* @__PURE__ */ at(Fd, [["__scopeId", "data-v-3bb8330c"]]), qd = { class: "exp-wardrobe" }, Wd = { class: "exp-fitting-body" }, Hd = { class: "exp-preview-stage" }, Vd = ["aria-label"], Yd = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Gd = { class: "exp-preview-tools" }, Qd = ["aria-label"], Kd = ["disabled"], Xd = { class: "exp-outfit-info" }, Jd = { class: "exp-muted" }, eu = { class: "exp-fitting-actions" }, tu = {
  key: 0,
  class: "exp-muted"
}, au = ["disabled"], nu = { key: 2 }, ru = { class: "exp-purchase-confirm" }, su = ["disabled"], ou = ["disabled"], iu = ["aria-label"], lu = ["aria-pressed", "onClick"], cu = ["src"], du = /* @__PURE__ */ je({
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
    const r = e, a = t, n = W(r.data.equippedOutfit), s = W(!1), i = W(0), c = W(!1), l = W(null), o = W(null), u = W({}), h = V(() => _t[n.value]), d = V(() => Ln(r.data, n.value)), f = V(() => Zo.find((S) => Vt[S].awardKey === h.value.achievement)), m = V(() => xs.filter((S) => Ln(r.data, S) || _t[S].achievement === null || Object.values(it).some((P) => P.boss && Vt[P.boss].awardKey === _t[S].achievement)));
    let y = null, b = !0, w = 0, k = () => {
    };
    ue([
      n,
      i,
      () => r.weapon
    ], () => {
      b = !0, k(), s.value = !1;
    });
    function C(S) {
      n.value = S, o.value?.scrollTo({ top: 0 });
    }
    function v() {
      w = performance.now() + 1100, b = !0, k();
    }
    function R() {
      s.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function _() {
      b = !0;
      let S;
      try {
        S = new ds({
          antialias: !0,
          alpha: !1
        });
      } catch {
        c.value = !0;
        return;
      }
      S.outputColorSpace = or, S.toneMapping = 7, S.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const P = new is(), L = er(), T = new Fa(), I = Ks(L, T, r.traveler.gender);
      P.background = new lr("#d1e0e1"), P.add(T, new ls("#fff6e3", "#627c93", 2.7));
      const Z = new Nn("#fff6e0", 3);
      Z.position.set(-3, 5, 6), P.add(Z);
      const H = new cs(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new cn();
      function N(pe) {
        I.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, pe, 0, 0, !0, !1), I.root.position.set(0, 0.1, 0), I.root.rotation.y = -0.2, I.root.scale.setScalar(1.35);
      }
      for (const pe of m.value)
        N(pe), F.union(new cn().setFromObject(T));
      const Y = F.getSize(new St()), ae = F.getCenter(new St()), Ve = Y.y * 0.5 + Y.z * 0.1 + 0.2, Te = Math.hypot(Y.x, Y.z) * 0.5 + 0.2;
      H.position.set(0, ae.y + 0.8, 7), H.lookAt(0, ae.y, 0);
      function qe(pe) {
        const ve = Math.max(Ve, Te / pe);
        H.left = -ve * pe, H.right = -H.left, H.top = ve, H.bottom = -ve, H.updateProjectionMatrix();
      }
      qe(1), S.setSize(144, 144, !1);
      try {
        for (const pe of m.value)
          N(pe), S.render(P, H), u.value[pe] = S.domElement.toDataURL("image/png");
      } catch {
        c.value = !0, I.dispose(), L.dispose(), P.clear(), S.dispose(), S.forceContextLoss();
        return;
      }
      l.value.append(S.domElement);
      let De = 0, ke = 1, ge = 1;
      const lt = new ResizeObserver(() => {
        const pe = l.value.getBoundingClientRect();
        ke = Math.max(1, pe.width), ge = Math.max(1, pe.height), S.setSize(ke, ge, !1), qe(ke / ge), b = !0, k();
      });
      lt.observe(l.value);
      const zt = matchMedia("(prefers-reduced-motion: reduce)");
      function Tt(pe) {
        pe.preventDefault(), c.value = !0, cancelAnimationFrame(De), De = 0;
      }
      S.domElement.addEventListener("webglcontextlost", Tt);
      function Gt(pe) {
        if (De = 0, c.value || document.hidden || !b && (pe > w || zt.matches) && !I.animating) return;
        const ve = pe < w && !zt.matches, mt = pe * 0.03;
        I.update({
          x: ve ? Math.sin(mt * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: ve ? 8 - mt % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, n.value, mt, pe / 1e3, zt.matches, !1), I.root.position.set(0, 0.1, 0), I.root.rotation.y = Number(i.value) * Math.PI / 180, I.root.scale.setScalar(1.35);
        try {
          S.render(P, H), b = !1;
        } catch {
          c.value = !0;
        }
        (ve || I.animating) && !c.value && k();
      }
      k = () => {
        !De && !c.value && !document.hidden && (De = requestAnimationFrame(Gt));
      };
      function Lt() {
        document.hidden ? (cancelAnimationFrame(De), De = 0) : (b = !0, k());
      }
      document.addEventListener("visibilitychange", Lt), k(), y = () => {
        k = () => {
        }, cancelAnimationFrame(De), lt.disconnect(), document.removeEventListener("visibilitychange", Lt), S.domElement.removeEventListener("webglcontextlost", Tt), I.dispose(), L.dispose(), P.clear(), S.dispose(), S.forceContextLoss(), S.domElement.remove();
      };
    }
    function A() {
      y?.(), y = null, c.value = !1, _();
    }
    return ha(_), Yt(() => y?.()), (S, P) => ($(), z("div", qd, [M("section", {
      ref_key: "fitting",
      ref: o,
      class: "exp-fitting"
    }, [M("div", Wd, [M("div", Hd, [M("div", {
      ref_key: "host",
      ref: l,
      class: "exp-outfit-preview",
      "aria-label": g(ka)[n.value].name
    }, [c.value ? ($(), z("div", Yd, [M("p", null, E(g(re).presentationError.rendering), 1), M("button", {
      type: "button",
      onClick: A
    }, E(g(q).reload), 1)])) : G("", !0)], 8, Vd), M("div", Gd, [M("label", null, [Ie(E(g(re).rotate), 1), ra(M("input", {
      "onUpdate:modelValue": P[0] || (P[0] = (L) => i.value = L),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": g(re).rotate
    }, null, 8, Qd), [[sr, i.value]])]), M("button", {
      type: "button",
      disabled: c.value,
      onClick: v
    }, E(g(re).previewAction), 9, Kd)])]), M("div", Xd, [
      M("h3", null, E(g(ka)[n.value].name), 1),
      M("p", null, E(g(ka)[n.value].detail), 1),
      M("p", Jd, E(g(re).wardrobeNote), 1)
    ])]), M("div", eu, [g(Pr)(e.data.active) ? G("", !0) : ($(), z("p", tu, E(g(q).safeWardrobe), 1)), d.value ? ($(), z("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !g(Pr)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: P[1] || (P[1] = (L) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, E(e.data.equippedOutfit === n.value ? g(re).equipped : g(re).equip), 9, au)) : f.value ? ($(), z("p", nu, E(g(re).unlockWeapon(g(qn)[f.value])), 1)) : s.value ? ($(), z(ee, { key: 3 }, [M("p", null, E(g(re).buyOutfit(g(ka)[n.value].name, h.value.price)), 1), M("div", ru, [M("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: R
    }, E(g(re).confirm), 9, su), M("button", {
      type: "button",
      onClick: P[2] || (P[2] = (L) => s.value = !1)
    }, E(g(re).cancel), 1)])], 64)) : ($(), z("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: P[3] || (P[3] = (L) => s.value = !0)
    }, E(e.balance < h.value.price ? g(re).noCoins : g(re).purchase) + " · " + E(g(re).coins(h.value.price)), 9, ou))])], 512), M("div", {
      class: "exp-outfit-rack",
      "aria-label": g(re).tryOn
    }, [($(!0), z(ee, null, _e(m.value, (L) => ($(), z("button", {
      key: L,
      type: "button",
      "aria-pressed": n.value === L,
      onClick: (T) => C(L)
    }, [
      u.value[L] ? ($(), z("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[L],
        alt: ""
      }, null, 8, cu)) : G("", !0),
      M("strong", null, E(g(ka)[L].name), 1),
      M("small", null, E(e.data.equippedOutfit === L ? g(re).equipped : g(Ln)(e.data, L) ? g(re).owned : g(_t)[L].price ? g(re).coins(g(_t)[L].price) : g(re).achievement), 1)
    ], 8, lu))), 128))], 8, iu)]));
  }
}), uu = du;
function so(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
    t.has(r[1]) && me("narrative_unavailable"), t.set(r[1], r[2].trim());
  return t;
}
function hu(e, t = 1) {
  const r = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (r[n] || n >= Ia.bands.length) && me("narrative_unavailable");
    const s = so(a[3]);
    r[n] = {
      memory: s.get("memory") ?? "",
      shadow: s.get("shadow") ?? "",
      secret: s.get("secret") ?? null
    };
  }
  return Ia.bands.some((a, n) => !r[n]) && me("narrative_unavailable"), r;
}
function pu(e, t, r) {
  const a = e[fr(t.affection)];
  return {
    shadow: a.shadow,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: r ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var fu = Object.freeze({
  position: "位置",
  longing: "渴求",
  possession: "占有",
  defense: "防御",
  surrender: "让渡",
  balance: "力量关系"
});
function mu(e) {
  let t;
  const r = [];
  for (const a of e.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
    const n = so(a[2]), s = (c) => {
      const l = n.get(c);
      return l || me("narrative_unavailable"), l;
    }, i = Object.fromEntries(Object.entries(fu).map(([c, l]) => [l, s(c)]));
    if (a[1] === "zero")
      t && me("narrative_unavailable"), t = i;
    else {
      const c = Number(a[1]);
      (r[c] || c >= Ia.bands.length) && me("narrative_unavailable"), r[c] = {
        name: s("name"),
        psychology: i
      };
    }
  }
  return (!t || Ia.bands.some((a, n) => !r[n])) && me("narrative_unavailable"), {
    zero: t,
    bands: r
  };
}
function oo(e, t) {
  const r = e.bands[fr(t)];
  return t === 0 ? {
    name: r.name,
    psychology: e.zero
  } : r;
}
var gu = async (e, t) => {
  const r = await fetch(`/${xo}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  r.ok || me("narrative_unavailable");
  const a = await r.text();
  return a.trim() || me("narrative_unavailable"), a;
};
async function vu(e, t, r = gu) {
  const [a, n, s, i, c] = await Promise.all([
    r("system-prompt", t),
    r("world", t),
    r("player", t),
    r("meta-protocol", t),
    Promise.all(Qn.map(async (w) => ({
      id: w,
      document: await r(Pe(w) || ft(w) ? w : He[w].card, t)
    })))
  ]), l = c.map(({ id: w, document: k }) => {
    const C = [...k.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (C.length !== 1 || !C[0][1].trim()) && me("narrative_unavailable"), {
      id: w,
      introduction: C[0][1].trim(),
      document: k.replace(C[0][0], "").trim()
    };
  }), o = l.map((w) => w.introduction).join(`
`), u = l.find((w) => w.id === e).document, h = {
    system: a,
    world: n,
    player: s,
    protocol: i,
    npcs: o
  };
  if (ft(e)) return {
    ...h,
    character: u,
    relationship: null,
    stages: [],
    opening: {
      initial: Oe[e].greeting,
      returned: null
    }
  };
  if (!Pe(e)) {
    const w = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!w || w[1] !== `${e}.initial`) && me("narrative_unavailable"), {
      ...h,
      character: u.slice(0, w.index).replace(/# 开场\s*$/, "").trim(),
      relationship: null,
      stages: [],
      opening: {
        initial: w[2],
        returned: null
      }
    };
  }
  const [d, f] = await Promise.all(["openings", `${e}-stages`].map((w) => r(w, t))), m = new Map([...d.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((w) => [w[1], w[2].trim()])), y = m.get(`${e}.initial`), b = m.get(`${e}.returned`) ?? null;
  return (!y || (e === "anian" || e === "kouzi") && !b) && me("narrative_unavailable"), {
    ...h,
    character: u,
    relationship: mu(f),
    stages: hu(f),
    opening: {
      initial: y,
      returned: b
    }
  };
}
function io(e) {
  return jo[e];
}
function yu(e, t, r = []) {
  if (ft(t)) return Object.fromEntries(Tr(e, t).map((i) => [i, $a[i].meaning]));
  if (!Pe(t)) {
    const i = He[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: de.attack,
      ...e.facts.includes(i.intel) ? { pass: de.pass } : {}
    };
  }
  const a = Object.fromEntries(Tr(e, t).map((i) => [i, $a[i].meaning])), n = io(t), s = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && s >= Ia.bands[4] && r[fr(s)]?.secret && (a.share_secret = de.shareSecret), Hi(e, t)) {
    a.follow = de.follow, a.stay = de.stay;
    for (const i of js(e, t).filter((c) => c.accessible && c.solo)) a[`go:${i.id}`] = de.go(i.name);
  }
  return a;
}
var lo = "dialogue", Cn = `<${lo}>`, yr = `</${lo}>`, Mf = new RegExp(`${Cn}([\\s\\S]*?)${yr}`, "i"), kf = new RegExp(Cn, "i");
function Jr(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${Cn}
${e.reply}
${yr}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function bu(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${Cn}…${yr} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function wu(e) {
  return e.map((t) => ({
    id: t,
    event: Wn[t]
  }));
}
function xu(e) {
  const t = /* @__PURE__ */ new Set();
  let r;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((c) => !t.has(c)), s = {
      ...a.scene === r ? {} : { place: ne.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((c) => t.add(c)), r = a.scene;
    const i = Object.keys(s).length ? `<scene>
${JSON.stringify(s)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: Jr(a)
    }] : a.kind === "player" ? [{
      role: "user",
      content: i + a.player
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: Jr(a)
    }];
  });
}
function _u(e, t) {
  return t ? e.findIndex((r) => r.id === t.throughId) + 1 : 0;
}
var Mu = {
  confined: "你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。",
  released: "牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。",
  returned: "你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。"
};
function co(e, t) {
  if (!t) return null;
  let r = e;
  return t.map((a) => {
    const n = {
      from: r,
      exit: a.id,
      to: a.to,
      place: ne.scenes[a.to],
      position: be[r].anchors[a.anchor]
    };
    return r = a.to, n;
  });
}
function ku(e, t) {
  const r = new Set(e.facts), a = new Set(e.knowledge[t]), n = [], s = un(ot(t in Oe ? Oe[t].scene : t in e.people ? e.people[t].scene : e.location.scene));
  r.has("heat_restored") ? n.push("heat_restored") : (a.has("heat_notice_read") || s) && n.push("heat_notice_read");
  const i = ys.flatMap((c) => {
    const l = c.resolved.find((o) => r.has(o));
    return l ? [l] : [];
  });
  i.push("worker_record_corrected");
  for (const c of i) {
    const l = t === "chenhe" && c === "worker_record_corrected" && r.has("worker_result_delivered");
    r.has(c) && (a.has(c) || l) && n.push(c);
  }
  return t === "kouzi" && r.has("kouzi_entered_city") && n.push("kouzi_entered_city"), !r.has("heat_restored") && a.has("return_flow_tested") && n.push("return_flow_tested"), n.map((c) => ({
    id: c,
    situation: c === "heat_notice_read" ? Be.heatSituation : t === "chenhe" && c === "worker_record_corrected" ? Be.workerCorrected : Fn[c]
  }));
}
function Su(e, t) {
  const r = new Set(e.facts), a = Pe(t) ? e.people[t] : null, n = be[Pe(t) ? e.people[t].scene : ft(t) ? Oe[t].scene : He[t].scene], s = Pe(t) ? e.people[t].position : ft(t) ? n.anchors[Oe[t].anchor] : gn(t, r), i = kn(n, s, r, e.people), c = Qa(n.id, s, r).filter((y) => Ne(Ct(n, r), s, y.position)), l = Dn(n.id), o = Pe(t) ? vs(e.facts, t) : null, u = e.location.scene === n.id ? Ea(n, e.location, r) : [], h = _s(e), d = cr, f = bs(e).find((y) => y.person === t), m = Ct(n, r);
  return {
    place: ne.scenes[n.id],
    chapter: e.chapter === "inner_city" ? { situation: ku(e, t) } : {
      phase: h.phase,
      playerObjective: Bn(e),
      optionalRoots: h.optionalRoots
    },
    personalThread: f ? {
      title: f.title,
      accepted: f.accepted,
      resolved: f.resolved,
      ...f.accepted ? {} : { invitation: f.task }
    } : null,
    ...e.chapter === "outpost" ? { supplies: {
      phase: h.supplies,
      situation: d.situation[h.supplies],
      collection: {
        scene: d.scene,
        place: ne.scenes[d.scene],
        interaction: ne.passages[d.object.passage].title,
        position: be[d.scene].anchors[d.object.anchor],
        available: la(d.object.condition, r),
        route: co(e.location.scene, mn(e.location, {
          scene: d.scene,
          anchor: d.object.anchor
        }, r, !1))
      }
    } } : {},
    exits: n.exits.map((y) => {
      const b = n.anchors[y.anchor], w = la(y.condition, r);
      return {
        id: y.id,
        to: y.to,
        place: ne.scenes[y.to],
        position: b,
        open: w,
        selfAccessible: w && da(m, s, b, K.playerRadius) !== null,
        playerAccessible: w && e.location.scene === n.id && da(m, e.location.position, b, K.playerRadius) !== null,
        withinReach: u.some((k) => k.target.id === y.id)
      };
    }),
    playerLodging: [Zn.guest_room.name, ...e.location.visited.includes("south_inn") ? [Zn.south_inn.name] : []],
    ...o ? { rescue: {
      phase: o,
      situation: Mu[o]
    } } : {},
    playerMechanisms: n.objects.flatMap((y) => {
      if (!la(y.condition, r)) return [];
      const b = y.kind === "inspect" && Object.hasOwn(dn, y.passage) ? dn[y.passage] : void 0, w = y.kind === "switch" ? {
        action: ne.switches[y.fact],
        fact: y.fact
      } : b?.operation ? {
        action: b.operation.label,
        fact: b.fact
      } : null;
      return w ? [{
        id: y.id,
        action: w.action,
        position: n.anchors[y.anchor],
        completed: r.has(w.fact),
        withinReach: u.some((k) => k.target.id === y.id)
      }] : [];
    }),
    ...l ? { room: {
      use: l.use,
      enclosure: l.enclosure,
      household: l.household.map((y) => y === "player" ? e.traveler.name : y in ne.households ? ne.households[y] : Ze(y)),
      furniture: l.furniture.map((y) => ({
        item: y.label,
        position: {
          x: y.footprint.x,
          y: y.footprint.z
        }
      })),
      exits: n.exits.map((y) => ({
        place: ne.scenes[y.to],
        position: n.anchors[y.anchor]
      }))
    } } : {},
    positions: {
      player: e.location.position,
      self: s
    },
    present: [
      e.traveler.name,
      ...pt.filter((y) => e.people[y].scene === n.id).map(Ze),
      ...pa.filter((y) => Oe[y].scene === n.id).map(Ze),
      ...c.map((y) => Ze(y.target.id))
    ],
    residents: (ao[n.id] ?? []).map((y) => ({
      name: y.name,
      activity: xc[y.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? yn[a.destination].name : null,
      leader: a.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [
      ...i,
      ...c,
      ...Ea(n, {
        scene: n.id,
        position: s,
        facing: 0,
        visited: [n.id]
      }, r).filter((y) => y.kind === "object" && y.target.kind === "resident")
    ].filter((y) => y.target.id !== t).map((y) => Ze(y.target.id))
  };
}
function Ru(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: Va[e.appearanceAge] } : {}
  };
}
function Cu(e, t, r = []) {
  const a = yu(e, t, r), n = Object.keys(a), s = {
    person: Ze(t),
    ...Su(e, t),
    clothing: Gs(e, t),
    events: wu(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (ft(t)) return {
    ...s,
    rescued: !1
  };
  if (!Pe(t)) {
    const i = He[t];
    return {
      ...s,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...s,
    map: js(e, t).map((i) => ({
      ...i,
      route: co(e.people[t].scene, i.route)
    })),
    rescued: Ha(e.facts, t),
    affection: e.relationships[t].affection
  };
}
function Da(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function Pu(e, t, r, a, n = e.memories[t]) {
  const s = Cu(e, t, a.stages), i = vl(t), c = Pe(t) ? io(t) : null, l = Pe(t) ? {
    psychology: oo(a.relationship, e.relationships[t].affection).psychology,
    ...pu(a.stages, e.relationships[t], !!c && e.facts.includes(c))
  } : null, { actions: o, actionMeanings: u, events: h, ...d } = s, f = {
    actions: u,
    performance: i,
    clothing: gr
  }, m = {
    memory: n?.text ?? null,
    events: h,
    ...d,
    opening: e.conversations[t].some((y) => y.kind === "dialogue") || zs(t) && e.facts.includes(He[t].complete) ? null : s.rescued ? a.opening.returned : a.opening.initial,
    stage: l
  };
  return {
    systemPrompt: [
      a.system.trim(),
      Da("background", a.world.trim()),
      Da("player", `${a.player.trim()}

${JSON.stringify({
        ...Ru(e.traveler),
        outfit: ka[e.outfit].detail,
        equipment: Zt[e.weapon].equipment
      }, null, 2)}`),
      Da("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${Da("meta_protocol", `${a.protocol.trim()}

${Da("operations", JSON.stringify(f, null, 2))}`)}

<story>
${JSON.stringify(m, null, 2)}`
      },
      ...xu(e.conversations[t].length ? e.conversations[t].slice(_u(e.conversations[t], n)) : [Bs(e, t)]),
      {
        role: "user",
        content: `${r}
</story>

${bu(s.person)}`
      }
    ]
  };
}
var es = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function Eu(e, t, r, a) {
  const n = Pu(e, t, r, a), s = vo({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = An(n.systemPrompt), c = An(e.memories[t]?.text ?? ""), l = An(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: s,
    system: i,
    memory: c,
    history: l,
    situation: Math.max(0, s - i - c - l),
    limit: es.waitAt,
    trigger: es.trigger
  };
}
var $u = { class: "ember-clothing-list" }, Iu = ["data-clothing-slot"], Au = /* @__PURE__ */ je({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), z("dl", $u, [($(!0), z(ee, null, _e(g(gr), (a, n) => ($(), z(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), z(ee, { key: 0 }, [M("dt", null, E(a), 1), M("dd", {
      "data-clothing-slot": n,
      class: ht({ "is-absent": !e.clothing[n] })
    }, E(e.clothing[n] || g(Ga).absent), 11, Iu)], 64)) : G("", !0)], 64))), 128))]));
  }
}), uo = /* @__PURE__ */ at(Au, [["__scopeId", "data-v-2445b8a0"]]), zu = ["onKeydown"], Tu = ["aria-label", "aria-expanded"], Lu = ["aria-label", "aria-expanded"], Ou = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, ju = ["id"], Uu = ["y", "height"], Nu = ["href"], Zu = ["href", "clip-path"], Du = ["aria-label", "aria-expanded"], Fu = ["aria-label"], Bu = ["aria-label"], qu = { class: "ember-meter-total" }, Wu = { key: 0 }, Hu = { class: "ember-meter-total" }, Vu = { class: "ember-meter-breakdown" }, Yu = {
  class: "ember-error-detail",
  role: "status"
}, Gu = ["disabled"], Qu = { key: 3 }, Ku = { role: "status" }, Xu = /* @__PURE__ */ je({
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
    const t = e, r = Nt(null), a = W(null), n = {
      clothing: Ga.title,
      affection: de.affection,
      context: de.context
    }, s = V(() => Gs(t.campaign, t.person)), i = W(null);
    function c() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const l = W(0), o = W("");
    let u = null, h;
    async function d() {
      u?.abort(), u = new AbortController();
      const C = u;
      r.value = null, o.value = "";
      try {
        const v = await vu(t.person, C.signal);
        C.signal.aborted || (r.value = v);
      } catch (v) {
        C.signal.aborted || (o.value = Bt(v));
      }
    }
    ue(() => t.person, () => {
      a.value = null, l.value = 0, d();
    }, { immediate: !0 });
    const f = V(() => Pe(t.person) ? t.campaign.relationships[t.person].affection : 0), m = `ember-affection-${rs()}`, y = V(() => 19 * f.value / 100), b = V(() => r.value?.relationship ? oo(r.value.relationship, f.value).name : ""), w = V(() => r.value ? Eu(t.campaign, t.person, t.draft, r.value) : null);
    ue(() => [t.person, f.value], ([C, v], [R, _]) => {
      C === R && v === _ || (h && clearTimeout(h), l.value = C === R ? v - _ : 0, l.value && (h = setTimeout(() => {
        l.value = 0;
      }, 3500)));
    }), ss(() => (c(), !0), () => !!a.value), Yt(() => {
      u?.abort(), h && clearTimeout(h);
    });
    const k = (C) => `${(C / 1e3).toFixed(1)}k`;
    return (C, v) => ($(), z("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: mo(Et(c, ["stop"]), ["esc"])
    }, [
      M("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": g(Ga).title,
        "aria-expanded": a.value === "clothing",
        onClick: v[0] || (v[0] = (R) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...v[4] || (v[4] = [M("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [M("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Tu),
      g(Pe)(e.person) ? ($(), z("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(de).affection,
        "aria-expanded": a.value === "affection",
        onClick: v[1] || (v[1] = (R) => a.value = a.value === "affection" ? null : "affection")
      }, [($(), z("svg", Ou, [
        M("defs", null, [M("path", {
          id: `${m}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, ju), M("clipPath", { id: m }, [M("rect", {
          x: "2",
          y: 22 - y.value,
          width: "20",
          height: y.value
        }, null, 8, Uu)])]),
        M("use", {
          href: `#${m}-shape`,
          class: "ember-affection-track"
        }, null, 8, Nu),
        M("use", {
          href: `#${m}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${m})`
        }, null, 8, Zu)
      ])), l.value ? ($(), z("small", {
        key: 0,
        class: ht(["ember-affection-change", { "is-down": l.value < 0 }]),
        role: "status"
      }, E(l.value > 0 ? "+" : "") + E(l.value), 3)) : G("", !0)], 8, Lu)) : G("", !0),
      M("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(de).context,
        "aria-expanded": a.value === "context",
        onClick: v[2] || (v[2] = (R) => a.value = a.value === "context" ? null : "context")
      }, [M("span", {
        class: ht(["ember-meter-ring", { "is-warning": w.value && w.value.used >= w.value.trigger }]),
        style: Ra({ "--meter-fill": `${Math.min(1, (w.value?.used ?? 0) / (w.value?.limit ?? 1)) * 360}deg` })
      }, [...v[5] || (v[5] = [M("span", null, null, -1)])], 6)], 8, Du),
      a.value ? ($(), z("section", {
        key: 1,
        class: ht(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        M("header", null, [M("strong", null, E(n[a.value]), 1), M("button", {
          type: "button",
          "aria-label": g(de).close,
          onClick: c
        }, "×", 8, Bu)]),
        a.value === "affection" ? ($(), z(ee, { key: 0 }, [M("p", qu, [Ie(E(f.value) + " ", 1), v[6] || (v[6] = M("small", null, "/ 100", -1))]), o.value ? G("", !0) : ($(), z("p", Wu, E(b.value || g(de).loading), 1))], 64)) : a.value === "clothing" ? ($(), dt(uo, {
          key: 1,
          clothing: s.value
        }, null, 8, ["clothing"])) : w.value ? ($(), z(ee, { key: 2 }, [
          M("p", Hu, E(k(w.value.used)) + " / " + E(k(w.value.limit)), 1),
          M("dl", Vu, [($(!0), z(ee, null, _e(g(de).contextParts, (R, _) => ($(), z(ee, { key: _ }, [M("dt", null, E(R), 1), M("dd", null, E(k(w.value[_])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? ($(), z(ee, { key: 0 }, [M("p", Yu, E(g(Bt)(e.memoryState)), 1), M("button", {
            type: "button",
            disabled: e.blocked,
            onClick: v[3] || (v[3] = (R) => C.$emit("retry-memory"))
          }, E(g(de).memoryRetry), 9, Gu)], 64)) : G("", !0)
        ], 64)) : o.value ? G("", !0) : ($(), z("p", Qu, E(g(de).loading), 1)),
        o.value && a.value !== "clothing" ? ($(), z(ee, { key: 4 }, [M("p", Ku, E(o.value), 1), M("button", {
          type: "button",
          onClick: d
        }, E(g(de).retry), 1)], 64)) : G("", !0)
      ], 10, Fu)) : G("", !0)
    ], 40, zu));
  }
}), Ju = /* @__PURE__ */ at(Xu, [["__scopeId", "data-v-38bbe277"]]), eh = ["aria-label"], th = { class: "ember-weapon-layout" }, ah = { class: "ember-weapon-list" }, nh = ["name", "value"], rh = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, sh = ["src"], oh = { class: "ember-weapon-skill" }, ih = /* @__PURE__ */ je({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = as(e, "modelValue"), r = rs();
    return (a, n) => ($(), z("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": g(ye).chooseWeapon
    }, [M("div", th, [M("div", ah, [($(!0), z(ee, null, _e(g(ws), (s) => ($(), z("label", {
      key: s,
      class: ht({ "is-selected": t.value === s })
    }, [
      ra(M("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: g(r),
        value: s
      }, null, 8, nh), [[ns, t.value]]),
      Xe(Ft, { name: s }, null, 8, ["name"]),
      M("span", null, E(g(Zt)[s].name), 1)
    ], 2))), 128))]), M("div", rh, [
      ($(), z("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: g(_d)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, sh)),
      M("h3", null, E(g(Zt)[t.value].name), 1),
      M("p", null, E(g(Zt)[t.value].detail), 1),
      M("div", oh, [M("strong", null, E(g(Zt)[t.value].action), 1), M("p", null, E(g(Zt)[t.value].skill), 1)])
    ])])], 8, eh));
  }
}), lh = /* @__PURE__ */ at(ih, [["__scopeId", "data-v-0c0d4e2b"]]), ch = ["src"], dh = /* @__PURE__ */ je({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = W(null), r = W(null), a = new ResizeObserver((n) => {
      const { width: s, height: i } = n[0].contentRect;
      r.value = s <= 700 && i > s;
    });
    return ha(() => a.observe(t.value)), Yt(() => a.disconnect()), (n, s) => ($(), z("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [r.value !== null ? ($(), z("img", {
      key: 0,
      src: r.value ? g(Qr).cityMobile : g(Qr).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, ch)) : G("", !0)], 512));
  }
}), uh = /* @__PURE__ */ at(dh, [["__scopeId", "data-v-f5a6e0d9"]]), hh = ["aria-label"], ph = {
  key: 0,
  class: "entry-title"
}, fh = { class: "entry-city" }, mh = ["aria-label"], gh = ["disabled"], vh = ["disabled"], yh = ["disabled"], bh = {
  key: 0,
  class: "entry-save"
}, wh = ["disabled"], xh = { class: "entry-name" }, _h = { for: "ember-traveler-name" }, Mh = ["maxlength", "placeholder"], kh = { class: "entry-identity-details" }, Sh = ["value"], Rh = { class: "entry-age" }, Ch = { for: "ember-traveler-age" }, Ph = {
  disabled: "",
  value: ""
}, Eh = ["value"], $h = {
  class: "entry-primary",
  type: "submit"
}, Ih = { class: "entry-traveler" }, Ah = {
  key: 0,
  class: "entry-restart"
}, zh = ["disabled"], Th = {
  key: 0,
  "aria-hidden": "true"
}, Lh = /* @__PURE__ */ je({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: r }) {
    const a = e, n = r, s = W("title"), i = W(a.campaign?.traveler.name ?? ""), c = W(a.campaign?.traveler.gender ?? null), l = W(a.campaign?.traveler.appearanceAge ?? ""), o = W(a.campaign?.weapon ?? "blade"), u = W(!1), h = W(null), d = W(null), f = V(() => ({
      title: q.title,
      identity: ye.identity,
      weapon: ye.chooseWeapon
    })[s.value]);
    ue(s, async () => {
      await Mt(), d.value && (d.value.scrollTop = 0), h.value?.focus({ preventScroll: !0 });
    });
    function m() {
      u.value = !1, s.value = "identity";
    }
    function y() {
      i.value.trim() && c.value && l.value && (i.value = i.value.trim(), s.value = "weapon");
    }
    function b() {
      s.value = s.value === "weapon" ? "identity" : "title";
    }
    function w() {
      !c.value || !l.value || !i.value.trim() || a.blocked || a.campaign && !u.value || n("start", {
        traveler: {
          name: i.value.trim(),
          gender: c.value,
          appearanceAge: l.value
        },
        weapon: o.value
      });
    }
    return t({ back: () => s.value === "title" ? !1 : (b(), !0) }), (k, C) => ($(), z("section", {
      class: ht(["ember-entry", { "is-title": s.value === "title" }]),
      "aria-label": g(q).title
    }, [
      Xe(uh),
      C[9] || (C[9] = M("div", { class: "entry-shade" }, null, -1)),
      s.value === "title" ? ($(), z("div", ph, [
        M("p", fh, E(g(ye).city), 1),
        M("h1", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, E(g(q).title), 513),
        M("nav", { "aria-label": g(q).title }, [e.campaign ? ($(), z("button", {
          key: 0,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: C[0] || (C[0] = (v) => n("continue"))
        }, [Ie(E(g(q).resume), 1), C[6] || (C[6] = M("span", { "aria-hidden": "true" }, "→", -1))], 8, gh)) : ($(), z("button", {
          key: 1,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, [Ie(E(e.ready ? g(ye).begin : g(ye).loading), 1), C[7] || (C[7] = M("span", { "aria-hidden": "true" }, "→", -1))], 8, vh)), e.campaign ? ($(), z("button", {
          key: 2,
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, E(g(ye).newJourney), 9, yh)) : G("", !0)], 8, mh),
        e.campaign ? ($(), z("p", bh, [M("span", null, E(e.campaign.traveler.name), 1), M("span", null, E(g(ne).scenes[e.campaign.location.scene]), 1)])) : G("", !0)
      ])) : ($(), z("div", {
        key: 1,
        ref_key: "sheet",
        ref: d,
        class: "entry-sheet"
      }, [
        M("header", null, [M("button", {
          type: "button",
          disabled: e.busy,
          onClick: b
        }, "← " + E(g(ye).back), 9, wh), M("span", null, E(g(q).title), 1)]),
        M("h2", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, E(f.value), 513),
        s.value === "identity" ? ($(), z("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: Et(y, ["prevent"])
        }, [
          M("div", xh, [M("label", _h, E(g(ye).name), 1), ra(M("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": C[1] || (C[1] = (v) => i.value = v),
            maxlength: g(24),
            placeholder: g(ye).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, Mh), [[sr, i.value]])]),
          M("div", kh, [M("fieldset", null, [M("legend", null, E(g(ye).gender), 1), ($(!0), z(ee, null, _e(g(Fs), (v) => ($(), z("label", { key: v }, [ra(M("input", {
            "onUpdate:modelValue": C[2] || (C[2] = (R) => c.value = R),
            type: "radio",
            name: "ember-traveler-gender",
            value: v,
            required: ""
          }, null, 8, Sh), [[ns, c.value]]), M("span", null, E(g(ye).genders[v]), 1)]))), 128))]), M("div", Rh, [M("label", Ch, E(g(ye).age), 1), ra(M("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": C[3] || (C[3] = (v) => l.value = v),
            required: ""
          }, [M("option", Ph, E(g(ye).agePlaceholder), 1), ($(!0), z(ee, null, _e(g(Va), (v, R) => ($(), z("option", {
            key: R,
            value: R
          }, E(v), 9, Eh))), 128))], 512), [[go, l.value]])])]),
          M("button", $h, [Ie(E(g(ye).next), 1), C[8] || (C[8] = M("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : ($(), z("form", {
          key: 1,
          class: "entry-loadout",
          onSubmit: Et(w, ["prevent"])
        }, [
          M("p", Ih, [M("strong", null, E(i.value), 1), M("span", null, E(c.value ? g(ye).genders[c.value] : "") + " · " + E(l.value ? g(Va)[l.value] : "") + " · " + E(g(ye).identityRole), 1)]),
          Xe(lh, {
            modelValue: o.value,
            "onUpdate:modelValue": C[4] || (C[4] = (v) => o.value = v)
          }, null, 8, ["modelValue"]),
          e.campaign ? ($(), z("label", Ah, [ra(M("input", {
            "onUpdate:modelValue": C[5] || (C[5] = (v) => u.value = v),
            type: "checkbox",
            required: ""
          }, null, 512), [[ho, u.value]]), M("span", null, E(g(ye).restartWarning), 1)])) : G("", !0),
          M("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Ie(E(e.busy ? g(ye).entering : e.campaign ? g(ye).confirmRestart : g(ye).enter), 1), e.busy ? G("", !0) : ($(), z("span", Th, "→"))], 8, zh)
        ], 32))
      ], 512))
    ], 10, hh));
  }
}), Oh = /* @__PURE__ */ at(Lh, [["__scopeId", "data-v-5cbd1a94"]]), jh = [
  "aria-label",
  "title",
  "disabled"
], Uh = ["disabled"], Nh = [
  "maxlength",
  "aria-label",
  "placeholder"
], Zh = ["aria-label", "title"], Dh = [
  "aria-label",
  "title",
  "disabled"
], Fh = /* @__PURE__ */ je({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ br({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ br([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const r = as(e, "modelValue"), a = e, n = t, s = W(null), i = W(!1);
    let c = null, l = 0;
    function o() {
      s.value && (s.value.style.height = "44px", s.value.style.height = `${Math.min(132, s.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && r.value.trim() && n("send");
    }
    function h(d) {
      yo(d, i.value) && (d.preventDefault(), u());
    }
    return ue(r, async () => {
      await Mt(), o();
    }), ue(s, (d, f) => {
      f && c?.unobserve(f), d && (o(), c?.observe(d));
    }, { flush: "post" }), ha(() => {
      o(), c = new ResizeObserver((d) => {
        const f = d[0].contentRect.width;
        f !== l && (l = f, o());
      }), s.value && c.observe(s.value);
    }), Yt(() => c?.disconnect()), (d, f) => ($(), z("form", {
      class: "ember-composer",
      onSubmit: Et(u, ["prevent"])
    }, [
      M("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? g(de).retrySend : g(de).regenerate,
        title: e.retrying ? g(de).retrySend : g(de).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: f[0] || (f[0] = (m) => n("regenerate"))
      }, [...f[6] || (f[6] = [M("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [M("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, jh),
      e.conclusion ? ($(), z("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: f[1] || (f[1] = (m) => n("continue"))
      }, [Ie(E(e.conclusion === "fight" ? g(de).fight : g(de).continue), 1), f[7] || (f[7] = M("span", { "aria-hidden": "true" }, "→", -1))], 8, Uh)) : ra(($(), z("textarea", {
        key: 1,
        ref_key: "input",
        ref: s,
        "onUpdate:modelValue": f[2] || (f[2] = (m) => r.value = m),
        rows: "1",
        maxlength: g(Ws).playerTextLimit,
        "aria-label": g(q).input,
        placeholder: g(q).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: f[3] || (f[3] = (m) => i.value = !0),
        onCompositionend: f[4] || (f[4] = (m) => i.value = !1)
      }, null, 40, Nh)), [[sr, r.value]]),
      e.talking ? ($(), z("button", {
        key: 2,
        type: "button",
        "aria-label": g(q).cancel,
        title: g(q).cancel,
        onClick: f[5] || (f[5] = (m) => n("cancel"))
      }, [...f[8] || (f[8] = [M("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [M("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, Zh)) : e.conclusion ? G("", !0) : ($(), z("button", {
        key: 3,
        type: "submit",
        "aria-label": g(q).send,
        title: g(q).send,
        disabled: e.blocked || !r.value.trim()
      }, [...f[9] || (f[9] = [M("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [M("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Dh))
    ], 32));
  }
}), Bh = /* @__PURE__ */ at(Fh, [["__scopeId", "data-v-640a5540"]]), qh = ["data-phase"], Wh = {
  role: "status",
  "aria-live": "polite"
}, Hh = ["datetime"], Vh = /* @__PURE__ */ je({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, r = W(Date.now()), a = W(!0);
    rr(() => {
      a.value = !0;
    }), vn(() => {
      a.value = !1;
    });
    const n = V(() => Math.max(0, Math.floor((r.value - t.startedAt) / 1e3)));
    return ue(() => [t.startedAt, a.value], (s, i, c) => {
      if (r.value = Date.now(), !a.value) return;
      const l = setInterval(() => {
        r.value = Date.now();
      }, 1e3);
      c(() => clearInterval(l));
    }, { immediate: !0 }), (s, i) => ($(), z("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = M("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      M("span", Wh, E(g(de).phases[e.phase]), 1),
      M("time", { datetime: `PT${n.value}S` }, E(g(de).elapsed(n.value)), 9, Hh)
    ], 8, qh));
  }
}), Yh = /* @__PURE__ */ at(Vh, [["__scopeId", "data-v-55406ff9"]]), ts = "关闭交谈后出发", Ma = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${ts}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, r) => r ? `${e}准备前往${t}等候 · ${ts}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function Gh(e, t, r) {
  if (!Pe(t)) return !1;
  const a = e.people[t], n = r.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const s = e.conversations[t];
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i], l = c.action;
    if (l === "follow" || l === "stay" || l?.startsWith("go:")) return c.id === r.id;
  }
  return !1;
}
function Qh(e, t, r) {
  const a = r.action;
  if (r.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === r.id, s = Ls(a), i = Gh(e, t, r) || n && (s?.confirm ? Sn(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), c = Ze(t);
  if (s?.feedback) return {
    action: a,
    phase: i ? "pending" : "applied",
    text: i ? s.feedback.pending : s.feedback.applied
  };
  let l;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      l = Ma[a];
      break;
    case "follow":
      l = Ma.follow(c, i);
      break;
    case "stay":
      l = Ma.stay(c);
      break;
    case "pass":
      l = Ma.pass(c, i);
      break;
    case "attack":
    case "finish":
      l = Ma[a](i);
      break;
    default:
      l = Ma.go(c, yn[a.slice(3)].name, i);
  }
  return {
    action: a,
    phase: i ? "pending" : "applied",
    text: l
  };
}
var Kh = ["data-action", "data-phase"], Xh = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, Jh = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, e1 = /* @__PURE__ */ je({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, r = V(() => Qh(t.campaign, t.person, t.turn));
    return (a, n) => r.value ? ($(), z("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": r.value.action,
      "data-phase": r.value.phase
    }, [($(), z("svg", Xh, [r.value.phase === "pending" ? ($(), z(ee, { key: 0 }, [n[0] || (n[0] = M("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = M("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : ($(), z("path", Jh))])), M("span", null, E(r.value.text), 1)], 8, Kh)) : G("", !0);
  }
}), t1 = /* @__PURE__ */ at(e1, [["__scopeId", "data-v-00613f94"]]), a1 = { class: "ember-clothing-feedback" }, n1 = { key: 0 }, r1 = /* @__PURE__ */ je({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), z("details", a1, [M("summary", null, [Ie(E(g(Ga).changed), 1), M("span", null, [($(!0), z(ee, null, _e(g(gr), (a, n) => ($(), z(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), z("small", n1, E(a), 1)) : G("", !0)], 64))), 128))])]), Xe(uo, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), s1 = /* @__PURE__ */ at(r1, [["__scopeId", "data-v-49dedcf2"]]);
function o1(e) {
  const t = [];
  let r = 0;
  for (const a of e.matchAll(/「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"/g))
    a.index > r && t.push({
      text: e.slice(r, a.index),
      spoken: !1
    }), t.push({
      text: a[0],
      spoken: !0
    }), r = a.index + a[0].length;
  return r < e.length && t.push({
    text: e.slice(r),
    spoken: !1
  }), t;
}
var i1 = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, l1 = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, c1 = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, d1 = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, u1 = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, h1 = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, p1 = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, f1 = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, m1 = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, g1 = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, v1 = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, y1 = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, b1 = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, w1 = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, x1 = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, _1 = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, M1 = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, k1 = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, S1 = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, R1 = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, C1 = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, P1 = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, E1 = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, $1 = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, I1 = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, A1 = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, z1 = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, T1 = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, L1 = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, O1 = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, j1 = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, U1 = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, N1 = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, Z1 = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, D1 = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, F1 = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, B1 = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, q1 = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, W1 = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, H1 = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, V1 = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, Y1 = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, G1 = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, Q1 = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, K1 = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, X1 = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, J1 = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, e2 = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, t2 = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, a2 = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, n2 = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, r2 = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, s2 = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, o2 = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, i2 = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, l2 = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, c2 = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, d2 = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, u2 = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, h2 = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, p2 = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, f2 = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, m2 = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, g2 = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, v2 = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, y2 = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, b2 = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, w2 = {
  sanniang: {
    body: i1,
    arm: l1,
    heads: {
      neutral: c1,
      smile: d1,
      teasing: u1,
      blush: h1,
      rest: p1,
      serious: f1,
      worried: m1,
      sad: g1,
      displeased: v1,
      fond: y1,
      laugh: b1,
      surprised: w1
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: x1,
    arm: M1,
    heads: {
      neutral: _1,
      smile: A1,
      blush: k1,
      displeased: S1,
      fond: R1,
      laugh: C1,
      rest: P1,
      sad: E1,
      surprised: $1,
      worried: I1
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: z1,
    arm: L1,
    heads: {
      neutral: T1,
      blush: W1,
      displeased: O1,
      fond: j1,
      laugh: U1,
      sad: N1,
      serious: Z1,
      smile: D1,
      surprised: F1,
      teasing: B1,
      worried: q1
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: H1,
    arm: V1,
    heads: {
      neutral: Y1,
      smile: G1,
      teasing: Q1,
      laugh: K1,
      blush: X1,
      fond: J1,
      serious: e2,
      surprised: t2,
      worried: a2,
      sad: n2
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: r2,
    arm: o2,
    heads: {
      neutral: s2,
      angry: i2,
      relieved: l2,
      resigned: c2,
      suspicious: d2,
      worried: u2
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: h2,
    arm: f2,
    heads: {
      neutral: p2,
      displeased: m2,
      relieved: g2,
      smile: v2,
      squint: y2,
      worried: b2
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, x2 = {
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
function _2(e, t, r) {
  if (e === "none") return null;
  const a = x2[e], n = a.joint === "arm" ? a.angles.map((s) => `rotate(${s * r}deg)`) : a.frames;
  return t[a.joint].animate(n.map((s) => ({ transform: s })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var M2 = ["src"], k2 = ["src"], S2 = ["src"], R2 = /* @__PURE__ */ je({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = W(null), a = W(null), n = W(null), s = V(() => w2[t.person]), i = W(!1), c = W(0);
    let l = 0, o = !1, u = !1, h = null, d, f;
    function m() {
      u = !0, h?.cancel(), h = null;
    }
    function y() {
      if (!(!t.animate || u || i.value || l < 3 || !o)) {
        if (document.hidden || f?.matches) {
          m();
          return;
        }
        a.value && n.value && (u = !0, h = _2(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, s.value.armDirection));
      }
    }
    function b() {
      l++, y();
    }
    function w() {
      i.value = !0, m();
    }
    function k() {
      l = 0, i.value = !1, c.value++;
    }
    function C() {
      document.hidden && m();
    }
    function v() {
      f?.matches && m();
    }
    return ue(() => t.animate, (R) => {
      R ? y() : m();
    }), ha(() => {
      f = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || f.matches) && m(), f.addEventListener("change", v), document.addEventListener("visibilitychange", C), d = new IntersectionObserver((R) => {
        o = R[0].isIntersecting && R[0].intersectionRatio >= 0.25, o ? y() : h && m();
      }, { threshold: 0.25 }), r.value && d.observe(r.value);
    }), vn(m), Yt(() => {
      m(), d?.disconnect(), f?.removeEventListener("change", v), document.removeEventListener("visibilitychange", C);
    }), (R, _) => ($(), z("span", {
      ref_key: "root",
      ref: r,
      class: ht(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? ($(), z("button", {
      key: 1,
      type: "button",
      onClick: k
    }, E(g(de).reloadArtwork), 1)) : ($(), z(ee, { key: 0 }, [
      ($(), z("img", {
        key: "body-" + c.value,
        src: s.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: w
      }, null, 40, M2)),
      ($(), z("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: s.value.heads[e.performance?.expression ?? "neutral"],
        style: Ra({ transformOrigin: s.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: w
      }, null, 44, k2)),
      ($(), z("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: s.value.arm,
        style: Ra({ transformOrigin: s.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: w
      }, null, 44, S2))
    ], 64))], 2));
  }
}), C2 = /* @__PURE__ */ at(R2, [["__scopeId", "data-v-0fe32419"]]), P2 = "" + new URL("ember-assets/portrait-wenshoutong-Be48xBQZ.webp", import.meta.url).href, E2 = "" + new URL("ember-assets/portrait-chenhe-CXD8lUbV.webp", import.meta.url).href, $2 = "" + new URL("ember-assets/portrait-qinzhi-CGn-amkh.webp", import.meta.url).href, I2 = "" + new URL("ember-assets/portrait-liangyoufang-BoDQCDQN.webp", import.meta.url).href, A2 = "" + new URL("ember-assets/portrait-chengtiesheng-FQVu_ZCY.webp", import.meta.url).href, z2 = {
  wenshoutong: P2,
  chenhe: E2,
  qinzhi: $2,
  liangyoufang: I2,
  chengtiesheng: A2
}, T2 = ["src"], L2 = /* @__PURE__ */ je({
  __name: "StoryPortrait",
  props: { person: {} },
  setup(e) {
    const t = W(!1), r = W(0);
    function a() {
      t.value = !1, r.value++;
    }
    return (n, s) => ($(), z("span", { class: ht(["ember-story-portrait", { "is-failed": t.value }]) }, [t.value ? ($(), z("button", {
      key: 1,
      type: "button",
      onClick: a
    }, E(g(de).reloadArtwork), 1)) : ($(), z("img", {
      key: r.value,
      src: g(z2)[e.person],
      alt: "",
      width: "418",
      height: "560",
      loading: "lazy",
      decoding: "async",
      onError: s[0] || (s[0] = (i) => t.value = !0)
    }, null, 40, T2))], 2));
  }
}), O2 = /* @__PURE__ */ at(L2, [["__scopeId", "data-v-be9de30b"]]), j2 = { class: "ember-npc-bubble" }, U2 = { class: "ember-npc-line" }, N2 = /* @__PURE__ */ je({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = V(() => o1(t.reply));
    return (a, n) => ($(), z("div", j2, [g(Ys)(e.person) ? ($(), dt(C2, {
      key: 0,
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ])) : g(ft)(e.person) ? ($(), dt(O2, {
      key: 1,
      person: e.person
    }, null, 8, ["person"])) : G("", !0), M("p", U2, [($(!0), z(ee, null, _e(r.value, (s, i) => ($(), z("span", {
      key: i,
      class: ht({ "ember-spoken": s.spoken })
    }, E(s.text), 3))), 128))])]));
  }
}), Z2 = /* @__PURE__ */ at(N2, [["__scopeId", "data-v-3e8dc9c6"]]), D2 = { class: "ember-campaign" }, F2 = { class: "ember-health" }, B2 = [
  "max",
  "value",
  "aria-label"
], q2 = {
  key: 0,
  class: "ember-objective"
}, W2 = {
  key: 0,
  class: "ember-boss"
}, H2 = [
  "max",
  "value",
  "aria-label"
], V2 = {
  key: 1,
  class: "ember-alarm",
  role: "status"
}, Y2 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, G2 = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, Q2 = {
  key: 4,
  class: "ember-rest-notice",
  role: "status"
}, K2 = ["aria-label"], X2 = ["disabled", "aria-label"], J2 = ["disabled", "aria-label"], ep = ["disabled", "aria-label"], tp = ["aria-label"], ap = ["aria-label"], np = { class: "ember-error-detail" }, rp = ["disabled"], sp = ["disabled"], op = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, ip = { class: "ember-error-detail" }, lp = { key: 0 }, cp = { class: "ember-prose" }, dp = {
  key: 8,
  class: "ember-award-notice",
  role: "status"
}, up = ["aria-label"], hp = ["aria-label"], pp = {
  key: 0,
  class: "ember-panel-heading"
}, fp = ["aria-label"], mp = ["aria-pressed"], gp = ["aria-pressed"], vp = ["disabled"], yp = { class: "ember-prose ember-prologue" }, bp = { class: "ember-objective-panel" }, wp = {
  key: 0,
  class: "ember-thread"
}, xp = { class: "ember-journal" }, _p = { class: "ember-journal" }, Mp = { class: "ember-pack-heading" }, kp = { key: 0 }, Sp = { key: 1 }, Rp = { class: "ember-relics" }, Cp = { key: 0 }, Pp = { key: 1 }, Ep = ["disabled", "onClick"], $p = { class: "ember-dialogue-heading" }, Ip = { class: "ember-person-heading" }, Ap = ["disabled"], zp = ["data-message-key"], Tp = ["data-message-key", "data-fresh-reply"], Lp = {
  key: 0,
  class: "ember-dialogue-issue"
}, Op = { key: 1 }, jp = { class: "ember-prose" }, Up = {
  key: 2,
  class: "ember-prose"
}, Np = ["aria-busy"], Zp = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Dp = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, Fp = { class: "ember-error-detail" }, Bp = { key: 0 }, qp = { class: "ember-prose" }, Wp = {
  key: 3,
  class: "ember-history-nav"
}, Hp = { class: "ember-passage-actions" }, Vp = ["disabled"], Yp = ["disabled", "onClick"], Gp = ["disabled"], Qp = ["src"], Kp = { class: "ember-prose" }, Xp = ["src"], Jp = { class: "ember-prose" }, ef = { key: 0 }, tf = { key: 1 }, af = { class: "ember-prose" }, nf = ["disabled"], rf = ["disabled"], sf = ["disabled"], of = { class: "ember-pause-actions" }, lf = ["aria-pressed"], cf = { class: "ember-help ember-keyboard-help" }, df = { class: "ember-help ember-touch-help" }, uf = /* @__PURE__ */ je({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, r = Ml(t.bridge, t.chatIdentity), a = kl(r), { view: n, notice: s, busy: i, blocked: c, talking: l, outgoing: o, conversationProgress: u, conversationFailure: h } = r, { current: d, dirty: f } = a, m = W(!0), y = W(!1), b = W(!1), w = W(0), k = W(!1), C = W(!1), v = W(null), R = W(null), _ = W(null), A = W("relics"), S = V(() => _.value === "map" ? q.map : _.value === "journal" ? q.journal : _.value === "build" ? q.build : _.value === "person" ? Ze(P.value) : _.value === "passage" ? ne.passages[L.value].title : _.value === "arrival" || _.value === "prologue" ? ne.scenes.camp : _.value === "ending" ? Rr.title : d.value?.phase === "reward" ? q.reward : d.value?.phase === "lost" ? q.fallen : q.pause), P = W("sanniang"), L = W("warning"), T = W(null), I = W(null), Z = W(null), H = W(""), F = V(() => Z.value?.operation && !d.value?.facts.includes(Z.value.fact) ? Z.value.operation : null), N = V(() => F.value?.setup ?? Z.value?.body ?? ne.passages[L.value].body), Y = V(() => !F.value && d.value ? (Z.value?.ready ? Z.value.witnesses ?? [] : []).filter((U) => Zr(d.value, U)) : []), ae = W({}), Ve = V({
      get: () => ae.value[P.value] ?? "",
      set: (U) => {
        ae.value[P.value] = U;
      }
    }), Te = W(null), qe = W(!1), De = W(null), ke = W(null), ge = W(null), lt = V((U) => {
      const D = d.value?.facts ?? [];
      return U && U.size === D.length && D.every((j) => U.has(j)) ? U : new Set(D);
    }), zt = V((U) => {
      const D = d.value ? pr(d.value).filter((j) => j.kind === "object").map((j) => j.target.id) : [];
      return U && U.size === D.length && D.every((j) => U.has(j)) ? U : new Set(D);
    }), Tt = V(() => d.value ? {
      definition: be[d.value.location.scene],
      location: d.value.location,
      facts: lt.value,
      people: d.value.people,
      objects: zt.value,
      completedSegments: d.value.completedSegments,
      engagement: d.value.engagement?.id,
      reading: _.value === "passage"
    } : null), Gt = V(() => {
      const U = d.value?.battle;
      if (d.value?.engagement?.id !== "beacon" || !U) return "";
      switch (U.script.signal) {
        case "approach":
          return st.signalApproach;
        case "lighting":
          return st.signalCountdown(Math.ceil((U.objective.target - U.objective.progress) / K.hz));
        case "lit":
          return st.signalLit;
        default:
          return "";
      }
    }), Lt = V(() => {
      const U = d.value && nr[d.value.location.scene];
      return U ? { "--scene-art": `url("${U}")` } : void 0;
    }), pe = V(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), ve = V(() => d.value ? Sn(d.value) : null), mt = V(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : ve.value ? "continue" : void 0), Ka = V(() => !k.value || !d.value || !!d.value.pendingParley || !!ve.value || m.value || !!_.value || !!s.value || l.value || b.value || t.generationActive || C.value || !!v.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), Ot = V(() => d.value?.battle?.enemies.find((U) => Ce(U.kind))), jt = V(() => {
      const U = d.value?.conversations[P.value] ?? [], D = r.replacingReply.value;
      return D?.person === P.value ? U.map((j) => j.id === D.turnId ? al(j) : j) : U;
    }), fa = V(() => d.value && !jt.value.length ? Bs(d.value, P.value) : null), gt = V(() => Te.value?.person === P.value ? {
      ...Te.value,
      status: qe.value ? "sending" : "failed"
    } : o.value?.person === P.value && !o.value.regenerating && !jt.value.some((U) => U.id === o.value?.actionId) ? o.value : null), ma = V(() => gt.value?.status === "failed"), Me = V(() => d.value && Nr(d.value, P.value)), Fe = W(null), vt = W(!1);
    let ct;
    function Ye() {
      clearTimeout(ct), ct = void 0, vt.value = !1;
    }
    const B = W(0), ga = W("");
    let J;
    function va(U, D = 4e3) {
      clearTimeout(J), ga.value = U, J = setTimeout(() => {
        ga.value = "";
      }, D);
    }
    ue(() => d.value?.engagement?.id, (U, D) => {
      if (U === D || !d.value) return;
      const j = d.value.facts.includes("return_flow_tested");
      U === "sluice_bridge" && va(j ? Be.bridgeTested : Be.bridgeUntried, 6500), U === "main_valve" && va(j ? Be.valveTested : Be.valveUntried, 6500);
    }), ue(() => [d.value?.id, d.value ? Object.keys(d.value.rewards).length : 0], (U, D) => {
      U[0] && U[0] === D[0] && U[1] > D[1] && va(st.cacheReady);
    });
    const Ut = V(() => Hs.flatMap((U) => {
      const D = n.value?.data.awards.find((j) => j.key === U.key && j.runId === d.value?.id);
      return D ? [{
        fact: U.fact,
        amount: D.amount
      }] : [];
    })), Qt = V(() => Ut.value.reduce((U, D) => U + D.amount, 0)), Aa = V(() => d.value ? bs(d.value).filter((U) => U.task) : []), ya = V(() => d.value ? Do(d.value) : null), { messages: za, hasOlder: yt, hasNewer: Ta, expanded: Kt, pendingVisible: La, rememberReading: Pt, resetLatest: Xt, older: bt, newer: Oa } = Sl({
      history: V(() => fa.value ? [fa.value] : jt.value),
      pending: V(() => !!gt.value),
      person: P,
      campaignId: V(() => d.value?.id),
      transcript: De,
      freshReply: Fe,
      talking: l
    }), Xa = V(() => d.value?.collection.map((U) => {
      const D = d.value.equipped.includes(U.id) ? d.value.equipped.filter((j) => j !== U.id) : [...d.value.equipped, U.id];
      return {
        ...U,
        equipped: D,
        issue: ul(d.value, D),
        dormant: d.value.equipped.includes(U.id) && !Ss(mr(d.value), U.id)
      };
    }) ?? []), Jt = Nl(() => {
      r.error.value = re.presentationError.sound, y.value = !1;
    });
    let ba = !1;
    function ja() {
      if (!_.value && d.value?.phase === "reward") {
        We({ type: "leave" });
        return;
      }
      (_.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && Ge();
    }
    async function Ja() {
      await We({ type: "resolve_parley" }) && (_.value = null, await Mt(), ge.value?.focus());
    }
    async function Pn() {
      ve.value ? await We({ type: "accept_reply" }) && _.value === "person" && await Ge() : await Ja();
    }
    wr(T, ja), ss(() => k.value ? _.value || d.value?.phase === "reward" ? (ja(), !0) : m.value ? !1 : (ea(), !0) : R.value?.back() ?? !1), wr(ke, () => {
      !i.value && !b.value && !t.generationActive && r.dismissError();
    });
    function ea() {
      m.value = !0, a.flush();
    }
    function en() {
      _.value = null, ea();
    }
    async function Ua(U) {
      C.value || v.value || (_.value = U, U === "build" && (A.value = "relics"), await a.flush());
    }
    async function Ge() {
      if (!C.value && !ve.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await Ja();
          return;
        }
        !s.value && !t.generationActive && (k.value = !0, _.value = null, m.value = !1, await Mt(), ge.value?.focus());
      }
    }
    function tn() {
      k.value = !0, d.value?.pendingParley || ve.value ? (P.value = d.value?.pendingParley?.enemy ?? ve.value, _.value = "person", m.value = !1) : Ge();
    }
    async function We(U) {
      if (C.value || v.value) return !1;
      C.value = !0, U.type === "interact" && d.value && (v.value = be[d.value.location.scene].exits.find((j) => j.id === U.id)?.to ?? null);
      let D = !1;
      try {
        return await a.flush() ? (D = await r.act(U), D && (a.sync(), U.type === "relic" && va(st.received(oa[U.id].name, !!d.value?.equipped.includes(U.id))), !_.value && !m.value && (await Mt(), ge.value?.focus())), D) : !1;
      } finally {
        C.value = !1, D || (v.value = null);
      }
    }
    function X(U) {
      U === v.value && (v.value = null);
    }
    async function te(U) {
      await We({
        type: d.value ? "restart" : "start",
        ...U,
        outfit: pe.value
      }) && (k.value = !0, _.value = "prologue");
    }
    function $e() {
      m.value = !0, _.value = null, k.value = !1, a.flush();
    }
    async function Ee(U) {
      if (!d.value || C.value || v.value) return;
      Ye();
      const D = [...Zs(d.value), ...Qa(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((nt) => nt.target.id === U), j = D?.kind === "object" ? D.target : null;
      if (j?.kind === "person" || j?.kind === "enemy" || j?.kind === "resident") {
        await ta(j.kind === "enemy" ? j.enemy : j.person);
        return;
      }
      if (j?.kind === "inspect" && (L.value = j.passage, H.value = U, Z.value = dl(d.value, j.passage), F.value)) {
        _.value = "passage", await a.flush();
        return;
      }
      await We({
        type: "interact",
        id: U
      }) && (j?.kind === "inspect" ? _.value = "passage" : j?.kind === "rest" && (vt.value = !0, ct = setTimeout(Ye, 3e3)));
    }
    async function wa() {
      !F.value || !await We({
        type: "interact",
        id: H.value
      }) || (await Mt(), I.value && (I.value.scrollTop = 0, I.value.focus({ preventScroll: !0 })));
    }
    async function ta(U) {
      !d.value || C.value || !Zr(d.value, U) || (P.value = U, _.value = "person", await a.flush() && !d.value.conversations[U].length && await r.act({
        type: "greet",
        person: U
      }) && a.sync());
    }
    async function En() {
      const U = P.value, D = Ve.value.trim();
      if (!(c.value || qe.value || !D || mt.value)) {
        ae.value[U] = "", Te.value = {
          person: U,
          text: D
        }, qe.value = !0, Xt();
        try {
          if (!await a.flush()) return;
          const j = r.talk(U, D);
          Te.value = null, await j && a.sync();
        } finally {
          qe.value = !1;
        }
      }
    }
    async function Na() {
      if (!(c.value || qe.value || !d.value))
        if (Xt(), ma.value && gt.value) {
          const U = gt.value, D = r.talk(U.person, U.text);
          Te.value = null, await D && a.sync();
        } else {
          const U = Nr(d.value, P.value);
          U && await r.talk(P.value, U.player, U.id) && a.sync();
        }
    }
    async function Za() {
      await a.recover() && (m.value = !0, w.value++);
    }
    return ue(() => t.generationActive, (U) => {
      U && ea();
    }), ue(() => [d.value?.pendingParley, ve.value], ([U, D]) => {
      (U || D) && (P.value = U?.enemy ?? D, _.value = "person");
    }, { immediate: !0 }), ue(y, (U) => {
      Jt.enable(U);
    }), ue(d, (U) => {
      y.value && U?.battle && Jt.tick(U.battle);
    }), ue(() => n.value?.data, (U, D) => {
      if (!U?.active || !D?.active || U.active.id !== D.active.id) {
        B.value = 0;
        return;
      }
      B.value += U.awards.filter((aa) => !D.awards.some((na) => na.key === aa.key)).reduce((aa, na) => aa + na.amount, 0);
      const j = new Set(D.active.facts), nt = new Set(U.active.facts);
      !j.has("chapter_completed") && nt.has("chapter_completed") && U.active.chapter === "outpost" ? _.value = "ending" : !j.has("captives_arrived") && nt.has("captives_arrived") && (_.value = "arrival");
    }), ue(() => d.value?.id, () => {
      ae.value = {}, Te.value = null;
    }), ue([
      k,
      m,
      _,
      s,
      () => d.value?.id,
      () => d.value?.location.scene
    ], Ye), ue([_, P], () => {
      Fe.value = null;
    }), ue(s, (U) => {
      U && (Fe.value = null);
    }), ue(() => [P.value, jt.value], ([U, D], [j, nt]) => {
      const aa = D.filter((na) => na.kind === "dialogue").at(-1);
      U === j && _.value === "person" && aa && !nt.some((na) => na.id === aa.id) && (Fe.value = aa.id);
    }), ha(async () => {
      await r.read(), ba = !0;
    }), rr(() => {
      ba && !f.value && r.read();
    }), vn(() => {
      Fe.value = null, Ye(), ea();
    }), Yt(() => {
      clearTimeout(J), Ye(), a.dispose(), r.dispose(), Jt.dispose();
    }), (U, D) => ($(), z("section", D2, [
      k.value ? G("", !0) : ($(), dt(Oh, {
        key: 0,
        ref_key: "entry",
        ref: R,
        campaign: g(d),
        ready: !!g(n)?.ready,
        busy: g(i),
        blocked: g(c) || e.generationActive,
        onStart: te,
        onContinue: tn
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      k.value && g(d) && Tt.value ? ($(), dt(Kc, {
        key: w.value,
        ref_key: "field",
        ref: ge,
        world: Tt.value,
        traveler: g(d).traveler,
        paused: Ka.value,
        transitioning: !!v.value,
        weapon: g(d).weapon,
        outfit: pe.value,
        battle: g(d).battle,
        onInput: g(a).input,
        onInteract: Ee,
        onPause: ea,
        onResume: Ge,
        onError: D[0] || (D[0] = (j) => b.value = !0),
        onReady: X
      }, {
        status: $n(() => [g(d) ? ($(), z(ee, { key: 0 }, [M("div", F2, [M("meter", {
          min: 0,
          max: g(K).maxHp,
          value: g(d).hp,
          "aria-label": g(re).hp
        }, null, 8, B2), M("span", null, E(Math.ceil(g(d).hp)) + " / " + E(g(K).maxHp), 1)]), g(d).chapter === g(Rr).id || g(d).phase === "battle" ? ($(), z("p", q2, E(g(Bn)(g(d))), 1)) : G("", !0)], 64)) : G("", !0)]),
        threat: $n(() => [k.value && Ot.value && !_.value ? ($(), z("div", W2, [M("strong", null, E(g(qn)[Ot.value.kind]), 1), M("meter", {
          min: "0",
          max: Ot.value.maxHp,
          value: Ot.value.hp,
          "aria-label": g(qn)[Ot.value.kind]
        }, null, 8, H2)])) : G("", !0), k.value && Gt.value && !_.value ? ($(), z("div", V2, E(Gt.value), 1)) : G("", !0)]),
        overlay: $n(() => [...D[23] || (D[23] = [M("span", null, null, -1)])]),
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
      k.value && v.value && !g(s) && !b.value && !_.value && !m.value ? ($(), z("aside", Y2, E(g(ne).transition(g(ne).scenes[v.value])), 1)) : G("", !0),
      k.value && vt.value && !_.value && !m.value && !g(s) ? ($(), z("p", G2, E(g(ne).rested), 1)) : k.value && ga.value && (g(d)?.phase === "exploration" || g(d)?.phase === "battle") && !_.value && !m.value && !g(s) ? ($(), z("p", Q2, E(ga.value), 1)) : G("", !0),
      k.value && g(d) && _.value !== "passage" && !g(d).pendingParley && !ve.value ? ($(), z("nav", {
        key: 5,
        class: "ember-tools",
        "aria-label": g(q).prepare
      }, [
        M("button", {
          type: "button",
          disabled: C.value || !!v.value,
          "aria-label": g(q).map,
          onClick: D[1] || (D[1] = (j) => Ua("map"))
        }, [Xe(Ft, { name: "map" }), M("span", null, E(g(q).map), 1)], 8, X2),
        M("button", {
          type: "button",
          disabled: C.value || !!v.value,
          "aria-label": g(q).build,
          onClick: D[2] || (D[2] = (j) => Ua("build"))
        }, [Xe(Ft, { name: "bag" }), M("span", null, E(g(q).build), 1)], 8, J2),
        M("button", {
          type: "button",
          disabled: C.value || !!v.value,
          "aria-label": g(q).journal,
          onClick: D[3] || (D[3] = (j) => Ua("journal"))
        }, [Xe(Ft, { name: "journal" }), M("span", null, E(g(q).journal), 1)], 8, ep),
        M("button", {
          type: "button",
          "aria-label": g(q).pause,
          onClick: en
        }, [Xe(Ft, { name: "pause" }), M("span", null, E(g(q).pause), 1)], 8, tp)
      ], 8, K2)) : G("", !0),
      g(s) || b.value || e.generationActive ? ($(), z("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: ke,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": g(q).noticeTitle,
        tabindex: "-1"
      }, [M("p", np, E(b.value ? g(q).renderError : e.generationActive ? g(q).generation : g(s)), 1), b.value ? ($(), z("button", {
        key: 0,
        type: "button",
        onClick: D[4] || (D[4] = (j) => {
          b.value = !1, w.value++;
        })
      }, E(g(q).reload), 1)) : g(r).dataInvalid.value && !e.generationActive ? ($(), z(ee, { key: 1 }, [M("p", null, E(g(q).rebuildWarning), 1), M("button", {
        type: "button",
        disabled: g(i),
        onClick: D[5] || (D[5] = (...j) => g(r).rebuild && g(r).rebuild(...j))
      }, E(g(q).rebuild), 9, rp)], 64)) : e.generationActive ? G("", !0) : ($(), z("button", {
        key: 2,
        type: "button",
        disabled: g(i),
        onClick: D[6] || (D[6] = (j) => g(r).recoveryRequired.value ? Za() : g(r).dismissError())
      }, E(g(r).recoveryRequired.value ? g(q).recover : g(q).acknowledge), 9, sp))], 8, ap)) : G("", !0),
      g(h) && !g(s) && (_.value !== "person" || P.value !== g(h).person) ? ($(), z("aside", op, [
        M("strong", null, E(g(Ze)(g(h).person)), 1),
        M("p", ip, E(g(Bt)(g(h))), 1),
        g(h).text ? ($(), z("details", lp, [M("summary", null, E(g(q).receivedReply), 1), M("p", cp, E(g(h).text), 1)])) : G("", !0),
        M("button", {
          type: "button",
          onClick: D[7] || (D[7] = (...j) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...j))
        }, E(g(q).acknowledge), 1)
      ])) : G("", !0),
      k.value && B.value && !_.value && !m.value && !g(s) ? ($(), z("aside", dp, [M("span", null, [M("small", null, E(g(q).rewardTitle), 1), M("strong", null, E(g(q).rewardReceived(B.value)), 1)]), M("button", {
        type: "button",
        "aria-label": g(q).rewardDismiss,
        onClick: D[8] || (D[8] = (j) => B.value = 0)
      }, "×", 8, up)])) : G("", !0),
      k.value && g(d) && !g(s) && !b.value && !e.generationActive && (_.value || m.value || g(d).phase === "reward" || g(d).phase === "lost") ? ($(), z("div", {
        key: 9,
        class: "ember-curtain",
        style: Ra(_.value === "person" ? Lt.value : void 0)
      }, [M("section", {
        ref_key: "dialog",
        ref: T,
        class: ht(["ember-panel", {
          "ember-wide": _.value === "map" || _.value === "build" && A.value === "wardrobe",
          "ember-map-panel": _.value === "map",
          "ember-wardrobe-panel": _.value === "build" && A.value === "wardrobe",
          "ember-dialogue": _.value === "person",
          "ember-passage": _.value === "passage"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": S.value,
        tabindex: "-1"
      }, [_.value !== "map" && _.value !== "person" ? ($(), z("header", pp, [
        M("h2", null, E(S.value), 1),
        _.value === "build" ? ($(), z("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": g(q).build
        }, [M("button", {
          type: "button",
          "aria-pressed": A.value === "relics",
          onClick: D[9] || (D[9] = (j) => A.value = "relics")
        }, E(g(ye).equipment), 9, mp), M("button", {
          type: "button",
          "aria-pressed": A.value === "wardrobe",
          onClick: D[10] || (D[10] = (j) => A.value = "wardrobe")
        }, E(g(q).wardrobe), 9, gp)], 8, fp)) : G("", !0),
        _.value !== "prologue" && _.value !== "passage" && g(d).pendingParley?.decision !== "attack" && (_.value || g(d).phase !== "lost" && g(d).phase !== "reward") ? ($(), z("button", {
          key: 1,
          type: "button",
          disabled: C.value || !!g(d).pendingParley && g(c),
          onClick: Ge
        }, E(g(q).close), 9, vp)) : G("", !0)
      ])) : G("", !0), _.value === "map" ? ($(), dt(Bd, {
        key: 1,
        campaign: g(d),
        onClose: Ge
      }, null, 8, ["campaign"])) : _.value === "prologue" ? ($(), z(ee, { key: 2 }, [M("p", yp, E(g(q).opening), 1), M("button", {
        class: "ember-primary",
        type: "button",
        onClick: Ge
      }, E(g(q).start), 1)], 64)) : _.value === "journal" ? ($(), z(ee, { key: 3 }, [
        M("p", bp, E(g(Bn)(g(d))), 1),
        ($(!0), z(ee, null, _e(Aa.value, (j) => ($(), z("section", {
          key: j.person,
          class: "ember-thread"
        }, [M("h3", null, E(j.name) + " · " + E(j.title), 1), M("p", null, E(j.task), 1)]))), 128)),
        ya.value ? ($(), z("section", wp, [M("h3", null, E(ya.value.title), 1), M("p", null, E(ya.value.task), 1)])) : G("", !0),
        M("ol", xp, [($(!0), z(ee, null, _e(g(d).facts, (j) => ($(), z("li", { key: j }, E(g(Wn)[j]), 1))), 128))]),
        Ut.value.length ? ($(), z(ee, { key: 1 }, [
          M("h3", null, E(g(q).journeyReward(Qt.value)), 1),
          M("ul", _p, [($(!0), z(ee, null, _e(Ut.value, (j) => ($(), z("li", { key: j.fact }, [Ie(E(g(Wn)[j.fact]) + " ", 1), M("strong", null, E(g(q).rewardReceived(j.amount)), 1)]))), 128))]),
          M("small", null, E(g(q).rewardRule), 1)
        ], 64)) : G("", !0)
      ], 64)) : _.value === "build" ? ($(), z(ee, { key: 4 }, [A.value === "wardrobe" && g(n) ? ($(), dt(uu, {
        key: 0,
        data: g(n).data,
        traveler: g(d).traveler,
        balance: g(n).balance,
        blocked: g(c),
        weapon: g(d).weapon,
        onCommand: We
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : ($(), z(ee, { key: 1 }, [
        M("div", Mp, [M("strong", null, E(g(d).traveler.name), 1), M("span", null, [
          Ie(E(g(ye).genders[g(d).traveler.gender]), 1),
          g(d).traveler.appearanceAge ? ($(), z(ee, { key: 0 }, [Ie(" · " + E(g(Va)[g(d).traveler.appearanceAge]), 1)], 64)) : G("", !0),
          Ie(" · " + E(g(ye).identityRole), 1)
        ])]),
        M("small", null, E(g(q).slots(g(d).equipped.length, g(K).relicSlots)), 1),
        M("p", null, E(g(Zt)[g(d).weapon].name) + " · " + E(g(Fo)(g(d).weapon)), 1),
        g(Os)(g(d)) ? G("", !0) : ($(), z("p", kp, E(g(st).restBuild), 1)),
        g(d).collection.length ? G("", !0) : ($(), z("p", Sp, E(g(q).emptyBuild), 1)),
        M("div", Rp, [($(!0), z(ee, null, _e(Xa.value, (j) => ($(), z("article", { key: j.id }, [
          Xe(Ft, { name: j.id }, null, 8, ["name"]),
          M("h3", null, [Ie(E(g(oa)[j.id].name) + " ", 1), M("small", null, E(g(re).rank(j.rank)), 1)]),
          M("p", null, E(g(oa)[j.id].detail), 1),
          j.issue === "capacity" ? ($(), z("small", Cp, E(g(q).loadoutIssue.capacity), 1)) : G("", !0),
          j.dormant ? ($(), z("small", Pp, E(g(st).dormantRelic), 1)) : G("", !0),
          M("button", {
            type: "button",
            disabled: g(c) || !!j.issue,
            onClick: (nt) => We({
              type: "loadout",
              equipped: j.equipped
            })
          }, E(g(d).equipped.includes(j.id) ? g(q).takeOff : g(q).putOn), 9, Ep)
        ]))), 128))])
      ], 64))], 64)) : _.value === "person" ? ($(), z(ee, { key: 5 }, [
        M("header", $p, [
          M("div", Ip, [M("h2", null, E(g(Ze)(P.value)), 1), M("small", null, E(g(ne).scenes[g(d).location.scene]), 1)]),
          ($(), dt(Ju, {
            key: P.value,
            campaign: g(d),
            person: P.value,
            draft: Ve.value,
            "memory-state": g(n)?.memories?.[P.value],
            blocked: g(c),
            onRetryMemory: D[11] || (D[11] = (j) => g(r).retryMemory(P.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !ve.value && g(d).pendingParley?.decision !== "attack" ? ($(), z("button", {
            key: 0,
            type: "button",
            disabled: !!g(d).pendingParley && g(c),
            onClick: Ge
          }, E(g(q).close), 9, Ap)) : G("", !0)
        ]),
        M("div", {
          ref_key: "transcript",
          ref: De,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: D[16] || (D[16] = (...j) => g(Pt) && g(Pt)(...j))
        }, [
          g(yt) ? ($(), z("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: D[12] || (D[12] = (...j) => g(bt) && g(bt)(...j))
          }, E(g(de).older), 1)) : G("", !0),
          ($(!0), z(ee, null, _e(g(za), (j) => ($(), z(ee, { key: j.key }, [j.side === "player" ? ($(), z("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": j.key
          }, [M("small", null, E(g(d).traveler.name), 1), Ie(E(j.turn.player), 1)], 8, zp)) : ($(), z("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": j.key,
            "data-fresh-reply": Fe.value === j.turn.id
          }, [j.turn.issue === "action_rejected" || j.turn.issue === "clothing_rejected" || j.turn.issue === "reply_invalid" || j.turn.issue === "reply_incomplete" ? ($(), z("p", Lp, E(g(de).issues[j.turn.issue]), 1)) : G("", !0), j.turn.kind === "receipt" && j.turn.issue === "reply_invalid" ? ($(), z("details", Op, [M("summary", null, E(g(de).rawReply), 1), M("p", jp, E(j.turn.reply), 1)])) : j.turn.kind === "receipt" ? ($(), z("p", Up, E(j.turn.reply), 1)) : ($(), z(ee, { key: 3 }, [
            Xe(Z2, {
              person: P.value,
              reply: j.turn.reply,
              performance: j.turn.performance,
              animate: Fe.value === j.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            Xe(t1, {
              campaign: g(d),
              person: P.value,
              turn: j.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            j.turn.clothing ? ($(), dt(s1, {
              key: 0,
              clothing: j.turn.clothing
            }, null, 8, ["clothing"])) : G("", !0)
          ], 64))], 8, Tp))], 64))), 128)),
          g(La) && gt.value ? ($(), z(ee, { key: 1 }, [M("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": gt.value.status === "sending"
          }, [M("small", null, E(g(d).traveler.name), 1), Ie(E(gt.value.text), 1)], 8, Np), ma.value ? ($(), z("p", Zp, E(g(de).sendFailed), 1)) : G("", !0)], 64)) : G("", !0),
          !g(Ta) && g(h)?.person === P.value && !jt.value.some((j) => j.id === g(h)?.actionId) ? ($(), z("div", Dp, [
            M("p", Fp, E(g(Bt)(g(h))), 1),
            g(h).text ? ($(), z("details", Bp, [M("summary", null, E(g(q).receivedReply), 1), M("p", qp, E(g(h).text), 1)])) : G("", !0),
            M("button", {
              type: "button",
              onClick: D[13] || (D[13] = (...j) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...j))
            }, E(g(q).acknowledge), 1)
          ])) : G("", !0),
          g(Kt) ? ($(), z("nav", Wp, [g(Ta) ? ($(), z("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: D[14] || (D[14] = (...j) => g(Oa) && g(Oa)(...j))
          }, E(g(de).newer), 1)) : G("", !0), M("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: D[15] || (D[15] = (...j) => g(Xt) && g(Xt)(...j))
          }, E(g(de).latest), 1)])) : G("", !0)
        ], 544),
        g(u)?.person === P.value ? ($(), dt(Yh, {
          key: 0,
          phase: g(u).phase,
          "started-at": g(u).startedAt
        }, null, 8, ["phase", "started-at"])) : G("", !0),
        Xe(Bh, {
          modelValue: Ve.value,
          "onUpdate:modelValue": D[17] || (D[17] = (j) => Ve.value = j),
          blocked: g(c) || qe.value || e.generationActive,
          talking: g(l),
          "can-regenerate": !!Me.value || ma.value,
          retrying: ma.value,
          conclusion: mt.value,
          onSend: En,
          onRegenerate: Na,
          onContinue: Pn,
          onCancel: g(r).cancelTalk
        }, null, 8, [
          "modelValue",
          "blocked",
          "talking",
          "can-regenerate",
          "retrying",
          "conclusion",
          "onCancel"
        ])
      ], 64)) : _.value === "passage" ? ($(), z(ee, { key: 6 }, [M("div", {
        ref_key: "passageContent",
        ref: I,
        class: "ember-passage-body",
        tabindex: "0"
      }, [($(!0), z(ee, null, _e(N.value.split(`

`), (j, nt) => ($(), z("p", {
        key: nt,
        class: "ember-prose"
      }, E(j), 1))), 128))], 512), M("footer", Hp, [
        F.value ? ($(), z("button", {
          key: 0,
          class: "ember-primary",
          type: "button",
          disabled: g(c) || C.value,
          onClick: wa
        }, E(F.value.label), 9, Vp)) : G("", !0),
        ($(!0), z(ee, null, _e(Y.value, (j) => ($(), z("button", {
          key: j,
          type: "button",
          disabled: g(c) || C.value,
          onClick: (nt) => ta(j)
        }, E(g(Be).talk(g(Ze)(j))), 9, Yp))), 128)),
        M("button", {
          type: "button",
          disabled: C.value,
          onClick: Ge
        }, E(g(Be).leave), 9, Gp)
      ])], 64)) : _.value === "arrival" ? ($(), z(ee, { key: 7 }, [
        M("img", {
          class: "ember-story-art",
          src: g(Kr).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, Qp),
        M("p", Kp, E(g(q).received), 1),
        M("button", {
          class: "ember-primary",
          type: "button",
          onClick: Ge
        }, E(g(q).resume), 1)
      ], 64)) : _.value === "ending" ? ($(), z(ee, { key: 8 }, [
        M("img", {
          class: "ember-story-art",
          src: g(Kr).ending,
          alt: "",
          decoding: "async"
        }, null, 8, Xp),
        M("h2", null, E(g(q).endingTitle), 1),
        M("p", Jp, E(g(q).ending), 1),
        M("p", null, E(g(q).freeTime), 1),
        g(_s)(g(d)).optionalRoots ? ($(), z("p", ef, E(g(q).optionalRoots), 1)) : G("", !0),
        Qt.value ? ($(), z("strong", tf, E(g(q).journeyReward(Qt.value)), 1)) : G("", !0),
        M("small", null, E(g(q).continued), 1),
        M("button", {
          class: "ember-primary",
          type: "button",
          onClick: Ge
        }, E(g(q).remain), 1)
      ], 64)) : g(d).phase === "reward" ? ($(), dt(Ul, {
        key: 9,
        campaign: g(d),
        blocked: g(c),
        onChoose: D[18] || (D[18] = (j, nt) => We({
          type: "relic",
          id: j,
          ...nt ? { replace: nt } : {}
        })),
        onLeave: D[19] || (D[19] = (j) => We({ type: "leave" }))
      }, null, 8, ["campaign", "blocked"])) : g(d).phase === "lost" ? ($(), z(ee, { key: 10 }, [
        M("p", af, E(g(q).fallenDetail), 1),
        M("button", {
          class: "ember-primary",
          type: "button",
          disabled: g(c),
          onClick: D[20] || (D[20] = (j) => We({ type: "retry" }))
        }, E(g(q).retry), 9, nf),
        M("button", {
          type: "button",
          disabled: g(c),
          onClick: D[21] || (D[21] = (j) => We({ type: "retreat" }))
        }, E(g(q).retreat), 9, rf)
      ], 64)) : ($(), z(ee, { key: 11 }, [
        M("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!g(s) || e.generationActive,
          onClick: Ge
        }, E(g(q).resume), 9, sf),
        M("div", of, [M("button", {
          type: "button",
          "aria-pressed": y.value,
          onClick: D[22] || (D[22] = (j) => y.value = !y.value)
        }, E(g(q).sound), 9, lf)]),
        M("details", null, [
          M("summary", null, E(g(ye).controls), 1),
          M("p", cf, E(g(q).controls), 1),
          M("p", df, E(g(q).touchControls), 1)
        ]),
        M("button", {
          type: "button",
          onClick: $e
        }, E(g(ye).title), 1)
      ], 64))], 10, hp)], 4)) : G("", !0)
    ]));
  }
}), Sf = uf;
export {
  Sf as default
};
