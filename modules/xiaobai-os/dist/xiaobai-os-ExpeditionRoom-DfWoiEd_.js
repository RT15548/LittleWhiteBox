/* eslint-disable */
import { $ as Zt, A as Un, D as Ie, E as je, I as Oa, J as ys, M as mt, N as Sn, P as It, Q as Nn, R as qt, S as A, T as _e, U as ke, V as $, W as Dn, X as ce, at as Rt, b as St, c as mr, ct as vr, d as Rn, dt as ra, ft as R, h as J, i as Fn, l as bs, lt as p, m as pt, nt as gr, p as yr, q as ws, r as xs, rt as W, u as br, ut as lt, v as Y, x as V, y as k } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Be } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as wr, r as en, t as xr } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as Mr, t as _r } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as kr } from "./xiaobai-os-constants-CDXgazQ7.js";
import { C as fa, Ct as Sr, Ft as Bn, Lt as ct, Pt as Rr, S as Cr, St as Ms, T as Wn, Tt as $r, X as vt, Y as _s, Z as Ar, _ as ln, _t as Pr, a as Pa, bt as tn, d as Cn, et as ks, h as Er, kt as Ir, l as zr, n as Ss, o as Lr, p as Tr, st as Rs, vt as jr, w as Cs, wt as qn, x as Or, xt as $n, y as Hn, yt as Zr } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as $s } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
import { A as it, B as Ur, C, D as oe, E as Nr, F as ze, I as K, L as Et, M as Dr, N as Fr, O as Br, P as As, R as Ps, S as cn, T as Es, V as Is, _ as ga, a as Ct, b as zs, c as D, d as Ls, f as ya, g as Za, h as Vn, i as ka, j as de, k as oa, l as un, m as An, n as dn, o as At, p as Ts, r as na, s as Wr, t as ee, u as hn, v as te, w as Ye, x as Nt, y as an, z as xe } from "./xiaobai-os-copy-DTxpG0aF.js";
function Ua(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function qr(e, t, s) {
  const a = [...t], n = [];
  for (; a.length && n.length < s; ) n.push(a.splice(Math.floor(Ua(e) * a.length), 1)[0]);
  return n;
}
function nn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function ye(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function $e(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var Hr = 1e-9;
function sa(e, t, s) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (s + 0.5) * e.cellSize
  };
}
function Ft(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function js(e, t) {
  const s = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!s || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((r) => r.length !== s || /[^.# ]/.test(r))) && $e("map_invalid");
  const n = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const r of e.gates) {
    (!r.id || n.has(r.id) || !r.cells.length) && $e("map_invalid"), n.add(r.id);
    const c = !t.has(r.id);
    c && l.add(r.id);
    for (const { column: d, row: h } of r.cells) {
      (!Number.isInteger(d) || !Number.isInteger(h) || d < 0 || d >= s || e.rows[h]?.[d] !== ".") && $e("map_invalid");
      const u = h * s + d;
      o.has(u) && $e("map_invalid"), o.add(u), c && i.add(u);
    }
  }
  for (const r of t) n.has(r) || $e("gate_unknown");
  return {
    map: e,
    columns: s,
    rows: a,
    closedGates: l,
    blocked(r, c) {
      return r < 0 || r >= s || c < 0 || c >= a || e.rows[c][r] !== "." || i.has(c * s + r);
    }
  };
}
function Ea(e, t, s, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), o = Math.max(s - e.y, 0, e.y - s - a);
  return n * n + o * o;
}
function Sa(e, t, s) {
  const a = s.x - t.x, n = s.y - t.y, o = a * a + n * n, i = o === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / o));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function Os(e, t, s, a, n) {
  let o = 0, i = 1;
  for (const [l, r, c] of [[
    e.x,
    t.x - e.x,
    s
  ], [
    e.y,
    t.y - e.y,
    a
  ]]) if (r === 0) {
    if (l <= c || l >= c + n) return !1;
  } else {
    const d = (c - l) / r, h = (c + n - l) / r;
    if (o = Math.max(o, Math.min(d, h)), i = Math.min(i, Math.max(d, h)), o >= i) return !1;
  }
  return o < i;
}
function Vr(e, t, s, a, n) {
  return Os(e, t, s, a, n) ? 0 : Math.min(Ea(e, s, a, n), Ea(t, s, a, n), Sa({
    x: s,
    y: a
  }, e, t), Sa({
    x: s + n,
    y: a
  }, e, t), Sa({
    x: s,
    y: a + n
  }, e, t), Sa({
    x: s + n,
    y: a + n
  }, e, t));
}
function Pe(e, t, s, a = 0) {
  (![
    t.x,
    t.y,
    s.x,
    s.y,
    a
  ].every(Number.isFinite) || a < 0) && $e("input_invalid");
  const { map: n } = e, o = n.cellSize, i = Ft(n, {
    x: Math.min(t.x, s.x) - a,
    y: Math.min(t.y, s.y) - a
  }), l = Ft(n, {
    x: Math.max(t.x, s.x) + a,
    y: Math.max(t.y, s.y) + a
  });
  for (let r = i.row; r <= l.row; r++) for (let c = i.column; c <= l.column; c++) {
    if (!e.blocked(c, r)) continue;
    const d = n.origin.x + c * o, h = n.origin.y + r * o;
    if (a === 0 ? Os(t, s, d, h, o) || Ea(t, d, h, o) === 0 && Ea(s, d, h, o) === 0 : Vr(t, s, d, h, o) < a * a - Hr) return !1;
  }
  return !0;
}
var wt = (e, t, s) => Pe(e, t, t, s);
function Pn(e, t, s, a) {
  [s.x, s.y].every(Number.isFinite) || $e("input_invalid"), wt(e, t, a) || $e("position_blocked");
  const n = Math.hypot(s.x, s.y);
  if (n === 0) return;
  const o = Math.ceil(n / (e.map.cellSize / 4)), i = s.x / o, l = s.y / o;
  for (let r = 0; r < o; r++) {
    const c = {
      x: t.x + i,
      y: t.y + l
    };
    if (Pe(e, t, c, a)) {
      Object.assign(t, c);
      continue;
    }
    const d = Math.abs(i) >= Math.abs(l) ? ["x", "y"] : ["y", "x"];
    for (const h of d) {
      const u = {
        ...t,
        [h]: t[h] + (h === "x" ? i : l)
      };
      Pe(e, t, u, a) && Object.assign(t, u);
    }
  }
}
function fn(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function Mt(e) {
  const { landscape: t } = e, { bounds: s } = t, a = {
    x: s.x - s.width / 2,
    y: s.z - s.depth / 2
  }, n = [
    s,
    ...t.features.map((d) => d.footprint),
    ...t.gates.map((d) => d.footprint)
  ];
  n.some((d) => ![
    d.x,
    d.z,
    d.width,
    d.depth
  ].every(Number.isFinite) || d.width <= 0 || d.depth <= 0 || ![
    d.x - d.width / 2,
    d.z - d.depth / 2,
    d.width,
    d.depth
  ].every(Number.isInteger)) && $e("map_invalid");
  const o = t.features.map((d) => d.id);
  new Set(o).size !== o.length && $e("map_invalid"), t.features.some((d) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(d.kind) && (d.height === void 0 || !Number.isFinite(d.height) || d.height <= 0)) && $e("map_invalid");
  for (const d of n.slice(1)) (d.x - d.width / 2 < a.x || d.z - d.depth / 2 < a.y || d.x + d.width / 2 > a.x + s.width || d.z + d.depth / 2 > a.y + s.depth) && $e("map_invalid");
  t.roads.some((d) => !Number.isFinite(d.width) || d.width <= 0 || d.points.length < 2 || d.points.some(([h, u], v) => !Number.isFinite(h) || !Number.isFinite(u) || v > 0 && h === d.points[v - 1][0] && u === d.points[v - 1][1])) && $e("map_invalid");
  const i = [];
  for (let d = 0; d < s.depth; d++) {
    let h = "";
    for (let u = 0; u < s.width; u++) {
      const v = {
        x: a.x + u + 0.5,
        y: a.y + d + 0.5
      };
      h += t.features.some((f) => f.kind !== "arch" && fn(v, f.footprint)) ? "#" : ".";
    }
    i.push(h);
  }
  const l = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((d) => {
      const h = d.footprint, u = [];
      for (let v = h.z - h.depth / 2 - a.y; v < h.z + h.depth / 2 - a.y; v++) for (let f = h.x - h.width / 2 - a.x; f < h.x + h.width / 2 - a.x; f++) u.push({
        column: f,
        row: v
      });
      return {
        id: d.id,
        cells: u
      };
    })
  }, r = js(l, new Set(l.gates.map((d) => d.id)));
  Object.values(e.anchors).some((d) => !wt(r, d, K.playerRadius)) && $e("map_invalid");
  const c = /* @__PURE__ */ new Set();
  for (const d of [...e.exits, ...e.objects])
    (!e.anchors[d.anchor] || c.has(d.id)) && $e("map_invalid"), c.add(d.id);
  return {
    ...e,
    map: l,
    gates: t.gates
  };
}
var Gr = Mt({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(an.map((e) => [e.to, e.position])),
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
    ...an.map((e) => ({
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
  }, An.object],
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
    ].map((e) => an.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), Yr = Mt({
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
}), Qr = Mt({
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
}), Kr = Mt({
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
}), Xr = Mt({
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
}), Jr = Mt({
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
}), eo = Mt({
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
}), to = Mt({
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
}), ao = Object.fromEntries(Object.entries(zs).map(([e, t]) => {
  const { width: s, depth: a } = t, n = s / 2, o = a / 2, i = [C("west-wall", "wall", -n + 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  }), C("east-wall", "wall", n - 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const r of ["north", "south"]) {
    const c = (r === "north" ? -1 : 1) * (o - 0.5);
    if (t.doors.some((d) => d.side === r)) {
      i.push(C(`${r}-door`, "door", 0, c, 4, 1));
      for (const d of [-1, 1]) i.push(C(`${r}-${d}`, "wall", d * (n + 2) / 2, c, n - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else i.push(C(`${r}-wall`, "wall", 0, c, s, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const l = e === "guest_room" ? t.furniture.find((r) => r.kind === "bed").footprint : null;
  return [e, Mt({
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
      ...Object.fromEntries(t.doors.map((r) => [r.side, {
        x: 0,
        y: (r.side === "north" ? -1 : 1) * (o - 2)
      }]))
    },
    exits: t.doors.map((r) => ({
      id: r.side,
      anchor: r.side,
      to: r.to,
      arrival: r.arrival,
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
})), ve = {
  camp: Gr,
  crossroads: Yr,
  gate: Qr,
  beacon: Kr,
  waterway: Xr,
  cells: Jr,
  hall: eo,
  roots: to,
  ...ao
};
function Gn(e) {
  return !e || ve[e.location.scene].safe && e.phase === "exploration";
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
function sn(e, t) {
  const s = ot[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || s.achievement !== null && e.awards.some((a) => a.key === s.achievement);
}
var pe = (e, t, s = 0) => ({
  family: e,
  chapter: s,
  ...t ? { requires: [t] } : {}
}), se = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), ba = {
  "storm-step": pe("storm"),
  conductor: pe("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: pe("storm"),
  cinder: pe("fire"),
  wildfire: pe("fire", ["cinder", "inferno"]),
  "blood-price": pe("risk"),
  frost: pe("frost"),
  shatter: pe("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: pe("skill"),
  hunter: {
    ...pe("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: pe("blade"),
  orbit: pe("storm"),
  thorns: pe("guard"),
  aegis: pe("guard"),
  siphon: pe("life"),
  focus: pe("skill"),
  renewal: pe("life"),
  execution: pe("blade"),
  "last-stand": pe("guard", void 0, 1),
  quicksilver: pe("skill"),
  magnet: pe("skill"),
  wardstone: pe("guard"),
  pilgrim: pe("life"),
  gambit: pe("risk", void 0, 1),
  riposte: se("blade"),
  "shield-break": se("blade"),
  "cleave-wave": se("blade", 1),
  duelist: se("blade"),
  "blood-dance": se("blade"),
  valor: se("blade", 1),
  ricochet: se("bow"),
  "split-arrow": se("bow"),
  pinning: se("bow"),
  "distance-draw": se("bow"),
  "hunter-mark": se("bow", 1),
  trapper: se("bow"),
  nova: se("staff"),
  inferno: {
    ...se("staff"),
    requires: [["cinder"]]
  },
  fracture: {
    ...se("staff"),
    requires: [[
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  overload: {
    ...se("staff", 1),
    requires: [["cinder"], [
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  orbitals: se("staff"),
  convergence: se("staff"),
  backstab: se("daggers"),
  shadowstep: se("daggers"),
  hemorrhage: se("daggers"),
  "execution-chain": se("daggers", 1),
  smoke: se("daggers"),
  venom: se("daggers"),
  "pack-bond": se("grimoire"),
  martyr: se("grimoire"),
  covenant: se("grimoire"),
  frenzy: se("grimoire"),
  "soul-harvest": se("grimoire", 1),
  command: se("grimoire"),
  shrapnel: se("cannon"),
  minefield: se("cannon"),
  overclock: se("cannon"),
  bunker: se("cannon"),
  salvage: se("cannon"),
  railgun: se("cannon", 1)
}, z = (e, t) => e.relics.find((s) => s.id === t)?.rank ?? 0;
function no(e) {
  return As.filter((t) => !ba[t].weapons || ba[t].weapons.includes(e));
}
function Zs(e, t, s = null) {
  const a = ba[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((o) => o !== s && z(e, o) > 0)));
}
var Pt = Math.PI * 2, Q = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), me = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), En = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Xe = (e, t, s) => ({
  x: e.x + Math.cos(t) * s,
  y: e.y + Math.sin(t) * s
});
function et(e, t, s, a, n, o) {
  if (o) {
    Pn(o.space, t, {
      x: Math.cos(s) * a,
      y: Math.sin(s) * a
    }, n);
    return;
  }
  t.x += Math.cos(s) * a, t.y += Math.sin(s) * a;
  for (const i of e.obstacles) {
    const l = Q(t, i), r = n + i.radius;
    if (l < r) {
      const c = l < 1e-3 ? s : me(i, t);
      t.x = i.x + Math.cos(c) * r, t.y = i.y + Math.sin(c) * r;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function so(e, t, s, a) {
  const n = e.x - t.x, o = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(s) + o * Math.sin(s)));
  return Math.hypot(n - Math.cos(s) * i, o - Math.sin(s) * i);
}
var ro = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], rn = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function Bt(e, t, s, a) {
  if (!wt(e, t, a) || !wt(e, s, a)) return null;
  if (Pe(e, t, s, a)) return [{ ...s }];
  const { map: n, columns: o, rows: i } = e, l = Ft(n, t), r = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), h = [];
  function u(f) {
    return sa(n, f % o, Math.floor(f / o));
  }
  function v(f, g, b, _) {
    if (f < 0 || f >= o || g < 0 || g >= i) return;
    const M = g * o + f;
    d.has(M) || (r.get(M) ?? 1 / 0) <= b || (r.set(M, b), c.set(M, _), h.push({
      id: M,
      score: b + rn(u(M), s)
    }));
  }
  for (let f = -1; f <= 1; f++) for (let g = -1; g <= 1; g++) {
    const b = l.column + g, _ = l.row + f, M = sa(n, b, _);
    Pe(e, t, M, a) && v(b, _, rn(t, M), -1);
  }
  for (; h.length; ) {
    h.sort((b, _) => _.score - b.score || _.id - b.id);
    const { id: f } = h.pop();
    if (d.has(f)) continue;
    d.add(f);
    const g = u(f);
    if (Pe(e, g, s, a)) {
      const b = [{ ...s }];
      let _ = f;
      for (; _ !== -1; )
        b.push(u(_)), _ = c.get(_);
      b.reverse();
      const M = [];
      let S = t;
      for (let y = 0; y < b.length; ) {
        let x = y;
        for (; x + 1 < b.length && Pe(e, S, b[x + 1], a); ) x++;
        S = b[x], M.push(S), y = x + 1;
      }
      return M;
    }
    for (const [b, _] of ro) {
      const M = f % o + b, S = Math.floor(f / o) + _, y = sa(n, M, S);
      Pe(e, g, y, a) && v(M, S, r.get(f) + rn(g, y), f);
    }
  }
  return null;
}
var Yn = (e) => !xe(e) || e === "warden" || e === "thornheart", ae = (e, t, s, a = 0) => !e || Pe(e.space, t, s, a);
function oo(e, t, s) {
  return e.summonPoints.filter((a) => wt(e.space, a, s) && Bt(e.space, e.entry, a, s)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Us(e, t, s) {
  return !e || Pe(e.space, t, s, 0.3) ? s : {
    x: t.x,
    y: t.y
  };
}
function Ns(e, t, s, a) {
  if (!e) return Math.atan2(s.y - t.y, s.x - t.x);
  let n = s;
  if (!wt(e.space, n, a)) {
    const i = [], l = a + e.space.map.cellSize, r = Ft(e.space.map, {
      x: s.x - l,
      y: s.y - l
    }), c = Ft(e.space.map, {
      x: s.x + l,
      y: s.y + l
    });
    for (let h = Math.max(0, r.row); h <= Math.min(e.space.rows - 1, c.row); h++) for (let u = Math.max(0, r.column); u <= Math.min(e.space.columns - 1, c.column); u++) {
      const v = sa(e.space.map, u, h);
      Math.hypot(v.x - s.x, v.y - s.y) <= a + e.space.map.cellSize && wt(e.space, v, a) && Pe(e.space, v, s) && i.push(v);
    }
    i.sort((h, u) => Math.hypot(h.x - s.x, h.y - s.y) - Math.hypot(u.x - s.x, u.y - s.y));
    const d = i.find((h) => Bt(e.space, t, h, a));
    if (!d) return null;
    n = d;
  }
  const o = Bt(e.space, t, n, a);
  return o?.length ? Math.atan2(o[0].y - t.y, o[0].x - t.x) : null;
}
function ge(e, t, s, a = 1, n = 0) {
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
  if (!xe(t) && e.enemies.filter((i) => i.hp > 0).length >= K.maxEnemies) return null;
  if (a) {
    const i = oo(a, s, de[t].radius);
    if (!i) return null;
    s = i;
  }
  const n = de[t].hp * (xe(t) ? 1 : 1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)), o = {
    id: ++e.serial,
    kind: t,
    x: s.x,
    y: s.y,
    hp: n,
    maxHp: n,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Ua(e) * 20),
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
  return e.enemies.push(o), o;
}
function yt(e, t, s, a, n, o = {}) {
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
    ...o
  };
  return e.shots.push(i), i;
}
function he(e, t, s, a, n, o, i, l = !1, r = {}) {
  const c = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: s,
    radius: a,
    wait: n,
    life: o,
    damage: i,
    friendly: l,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: l ? "passive" : "attack",
    hits: [],
    ...r
  };
  return e.hazards.push(c), c;
}
function st(e, t, s, a, n) {
  return he(e, t, "slam", s, a, 8, n);
}
function Ce(e, t, s, a, n, o, i) {
  return he(e, t, "beam", 0, o, 9, i, !1, {
    angle: s,
    length: a,
    width: n
  });
}
function ft(e, t, s, a, n, o, i = 0.22) {
  for (let l = 0; l < a; l++) yt(e, t, s + (l / Math.max(1, a - 1) - 0.5) * n, o, !1, { speed: i });
}
function Qn(e, t, s, a, n, o = 0.16) {
  for (let i = 0; i < s; i++) yt(e, t, a + i * Pt / s, n, !1, { speed: o });
}
function pn(e, t, s, a, n = 0) {
  const o = {
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
  return e.companions.push(o), o;
}
var Ra = (e) => e === "attack" || e === "skill";
function Ds(e, t) {
  if (e.player.hp <= 0) return;
  const s = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += s, s > 0 && ge(e, e.player, "heal");
}
function bt(e, t, s) {
  if (xe(t.kind)) {
    if (t.stagger += s, t.stagger < 100) return;
    t.stagger = 0, s = 24;
  }
  t.stun = Math.max(t.stun, s), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), ge(e, t, "guard", 1.4);
}
function Ze(e, t, s, a, n, o = e.player, i) {
  if (t.hp <= 0 || !ae(i, o, t)) return;
  const l = t.burn > 0 || Ra(n) && z(a, "cinder") > 0, r = t.chill > 0 || Ra(n) && z(a, "frost") > 0, c = (n === "skill" || n === "companion" && a.weapon === "cannon") && r && z(a, "shatter") > 0, d = Ra(n) && l && r && z(a, "overload") > 0;
  let h = s * (z(a, "blood-price") ? ze.bloodDamage + (z(a, "blood-price") - 1) * 0.12 : 1);
  if (z(a, "execution") && t.hp / t.maxHp < ze.executeThreshold && (h *= ze.executeDamage + (z(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden") && n === "attack" && Math.cos(me(t, o) - t.angle) > 0.4 && t.exposed <= 0 && (h *= z(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !xe(t.kind) && e.enemies.some((u) => u.kind === "priest" && u.hp > 0 && Q(t, u) < 3.5 && ae(i, t, u)) && (h *= 0.7), n === "attack" && z(a, "backstab") && Math.cos(me(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + z(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && z(a, "duelist") && bt(e, t, 9 * z(a, "duelist")), c) {
    h += 15 * z(a, "shatter"), t.chill = 0, ge(e, t, "burst", 2.2);
    for (const u of e.enemies) u.id !== t.id && Q(t, u) < 2.2 && Ze(e, u, 9 * z(a, "shatter"), a, "passive", t, i);
  }
  if (Ra(n) && (z(a, "cinder") && (t.burn = Math.max(t.burn, 80 + z(a, "cinder") * 25)), z(a, "frost") && (t.chill = Math.max(t.chill, 45 + z(a, "frost") * 20)), (z(a, "blood-dance") || z(a, "hemorrhage")) && (t.bleed = 100 + 25 * (z(a, "blood-dance") + z(a, "hemorrhage"))), z(a, "venom") && (t.poison = 100 + z(a, "venom") * 35), d && (h += 20 * z(a, "overload"), ge(e, t, "lightning")), n === "skill" && z(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + z(a, "hunter-mark") * 40)), z(a, "inferno") && l && n === "skill" && he(e, t, "fire", 1.5 + z(a, "inferno") * 0.3, 0, 70, 4 * z(a, "inferno"), !0)), d && (t.burn = 0), (d || c) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && z(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - z(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, ge(e, t, "burst", xe(t.kind) ? 3 : 0.8), z(a, "wildfire") && l && he(e, t, "fire", 1.8 + z(a, "wildfire") * 0.2, 0, 90, 3 * z(a, "wildfire"), !0), z(a, "fracture") && r) for (let u = 0; u < 4 + z(a, "fracture"); u++) yt(e, t, u * Pt / (4 + z(a, "fracture")), 9, !0, { source: "passive" });
    if (z(a, "siphon") && (e.kills % ze.siphonEvery === 0 || xe(t.kind)) && Ds(e, (xe(t.kind) ? ze.siphonBossHeal : ze.siphonHeal) + z(a, "siphon") - 1), z(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * z(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), z(a, "soul-harvest") && (e.player.resource = Math.min(it.maxPower, e.player.resource + 9 * z(a, "soul-harvest"))), n === "companion" && z(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * z(a, "salvage"))), z(a, "magnet"))
      for (const u of e.enemies) u.hp > 0 && Q(t, u) < 3 + z(a, "magnet") && ae(i, t, u) && et(e, u, me(u, t), 0.7, de[u.kind].radius, i);
  }
}
function mn(e, t, s, a, n, o = e.player) {
  const i = [t];
  if (ae(n, o, t)) {
    z(s, "conductor") && i.push(...e.enemies.filter((l) => l.id !== t.id && l.hp > 0 && Q(l, t) < 4.5 && ae(n, t, l)).sort((l, r) => Q(l, t) - Q(r, t)).slice(0, z(s, "conductor") + 1));
    for (const l of i)
      ge(e, l, "lightning"), Ze(e, l, a, s, "lightning", n ? l === t ? o : t : e.player, n);
  }
}
function Fs(e, t, s) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), ge(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const o = z(t, "riposte"), i = z(t, "thorns");
  if (o || i)
    for (const l of e.enemies) Q(l, a) < 3.2 + o * 0.3 && ae(s, a, l) && (Ze(e, l, (n ? 20 : 8) * o + 9 * i, t, "passive", a, s), bt(e, l, n ? 20 : 7));
}
function Na(e, t, s, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Fs(e, s, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let o = t * Et[s.weapon].guard * (z(s, "blood-price") ? ze.bloodHurt : 1) * (z(s, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, o);
  if (n.ward -= i, o -= i, n.hp <= o && z(s, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + z(s, "last-stand") * 8, n.invulnerable = 60, ge(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - o), e.damageTaken += o, n.invulnerable = 18, n.lastHit = e.tick, ge(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), z(s, "thorns"))
    for (const l of e.enemies) Q(l, n) < 3 && Ze(e, l, 10 * z(s, "thorns"), s, "passive", n, a);
}
function pa(e, t, s = 45) {
  e.ward += Math.max(0, Math.min(t, s - e.ward));
}
function Kn(e, t, s, a = !1, n) {
  const o = Et[t.weapon], i = e.player, l = me(i, s), r = (a ? 0.6 : 1) * (z(t, "gambit") ? 1 + z(t, "gambit") * 0.12 : 1);
  if (i.facing = l, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const u = o.range + z(t, "piercing") * 0.25;
    ge(e, i, "slash", u, l);
    for (const v of e.enemies)
      Q(i, v) > u + de[v.kind].radius || Math.cos(me(i, v) - l) < -0.1 || !ae(n, i, v) || (Ze(e, v, o.damage * r, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && bt(e, v, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), z(t, "cleave-wave") && i.combo % 3 === 2 && yt(e, i, l, 14 * z(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let c = o.damage * r;
  z(t, "distance-draw") && (c *= 1 + Math.min(1, Q(i, s) / 8) * 0.15 * z(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(it.maxPower, i.resource + 12));
  const d = z(t, "piercing") * ze.extraPierce + z(t, "railgun") * 2, h = yt(e, i, l, c, !0, {
    pierce: d,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + z(t, "shrapnel") * 0.3 : 0,
    bounce: z(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && z(t, "split-arrow") && i.combo % 3 === 2) for (const u of [-0.18, 0.18]) yt(e, i, l + u, c * (0.35 + z(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: d
  });
}
function io(e, t, s, a) {
  const n = e.player, o = Et[t.weapon], i = z(t, "focus");
  switch (n.skill = Math.round(o.skillCooldown * (i ? ze.focusSkill - (i - 1) * 0.06 : 1)), z(t, "aegis") && (n.shield = 18 + z(t, "aegis") * 6, n.guard = 8, pa(n, z(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + z(t, "aegis") * 6, n.guard = 9;
      const l = 1 + n.resource / 100;
      n.resource = 0, ge(e, n, "slash", 3.6, n.facing);
      for (const r of e.enemies)
        r.hp <= 0 || Q(n, r) > 3.6 + de[r.kind].radius || !ae(a, n, r) || (z(t, "shield-break") && (r.exposed = Math.max(r.exposed, 70 + 30 * z(t, "shield-break"))), Ze(e, r, o.skill * l, t, "skill", n, a), bt(e, r, 40), xe(r.kind) || et(e, r, me(n, r), 1.5, de[r.kind].radius, a));
      z(t, "valor") && pa(n, 12 * z(t, "valor") * l);
      break;
    }
    case "bow":
      for (let l = -2; l <= 2; l++) yt(e, n, n.facing + l * 0.15, o.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      et(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const l = s ?? n, r = 1 + n.resource / 125;
      if (n.resource = 0, z(t, "convergence"))
        for (const c of e.enemies) Q(c, l) < 4 + z(t, "convergence") && ae(a, l, c) && et(e, c, me(c, l), 1.2, de[c.kind].radius, a);
      for (let c = 0; c < 3; c++) {
        const d = Xe(l, c * Pt / 3, 0.7);
        he(e, ae(a, l, d) ? d : l, "slam", 2.3, 10 + c * 10, 1, o.skill * r, !0, { source: "skill" });
      }
      if (z(t, "nova")) {
        he(e, n, "frost", 3 + z(t, "nova") * 0.5, 0, 32, 6 * z(t, "nova"), !0, { source: "skill" });
        for (const c of e.enemies) Q(n, c) < 3.5 && ae(a, n, c) && (c.chill = 120, bt(e, c, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), s) {
        const l = Xe(s, s.angle + Math.PI, de[s.kind].radius + 0.55);
        et(e, n, me(n, l), Math.min(5, Q(n, l)), K.playerRadius, a), n.facing = me(n, s), ae(a, n, s) && (!a || Q(n, s) <= o.range + de[s.kind].radius) && (s.exposed = Math.max(s.exposed, 60), Ze(e, s, o.skill, t, "skill", n, a), bt(e, s, 20)), ge(e, n, "slash", 2, n.facing);
      }
      z(t, "shadowstep") && pn(e, "shade", n, 95 + z(t, "shadowstep") * 30, z(t, "shadowstep"));
      break;
    case "grimoire": {
      const l = n.resource;
      n.resource = 0, n.resonance = it.resonanceTicks + l, ge(e, n, "resonance", 2);
      for (const r of e.companions) r.kind === "familiar" && r.hp > 0 && r.life > 0 && (r.hp = Math.max(r.hp, it.familiarHp), r.cooldown = 0);
      s && (s.exposed = Math.max(s.exposed, 100), Ze(e, s, o.skill + l * 0.3, t, "skill", n, a)), z(t, "command") && he(e, s ?? n, "storm", 2.4 + z(t, "command") * 0.3, 10, 65, 7 * z(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const l = 1 + (z(t, "overclock") >= 2 ? 1 : 0), r = e.companions.filter((c) => c.kind === "turret");
      r.length >= l && (r[0].life = 0), pn(e, "turret", Us(a, n, Xe(n, n.facing, 0.9)), 240 + z(t, "overclock") * 45, z(t, "overclock")), z(t, "bunker") && pa(n, 15 * z(t, "bunker"));
      break;
    }
  }
}
function lo(e, t, s, a) {
  const n = e.player, o = z(s, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - o * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? En(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, z(s, "storm-step") && he(e, n, "storm", 1.7 + z(s, "storm-step") * 0.15, 0, 70, 6 + z(s, "storm-step") * 3, !0), z(s, "trapper") && he(e, n, "frost", 1.8, 12, 110, 5 * z(s, "trapper"), !0), z(s, "minefield") && he(e, n, "mine", 2 + z(s, "minefield") * 0.2, 12, 180, 25 * z(s, "minefield"), !0), z(s, "smoke")) {
    for (const i of e.enemies) Q(i, n) < 3 + z(s, "smoke") * 0.4 && ae(a, n, i) && (bt(e, i, 30 + z(s, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    ge(e, n, "guard", 3);
  }
}
function co(e, t, s, a) {
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
  const o = e.enemies.filter((c) => c.hp > 0 && ae(a, n, c)).sort((c, d) => Q(n, c) - Q(n, d))[0];
  t.dash && !n.dash && !n.dashTime && lo(e, t, s, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    et(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && z(s, "momentum") && o && Q(n, o) < 3 && mn(e, o, s, 10 + z(s, "momentum") * 5, a);
  else if (t.move) {
    n.facing = En(t.move);
    const c = n.swing > 0;
    let d = K.speed * (c ? Et[s.weapon].moveFire : 1);
    z(s, "quicksilver") && n.dash > K.dashCooldown / 2 && (d *= 1 + z(s, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && Q(h, n) < h.radius && ae(a, h, n)) && (d *= 0.65), et(e, n, n.facing, d, K.playerRadius, a);
  }
  n.travel += Q(i, n), z(s, "pilgrim") && n.travel >= 28 && (n.travel -= 28, pa(n, z(s, "pilgrim") * 6, 35)), z(s, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && pa(n, 2, z(s, "wardstone") * 10);
  const l = o && ae(a, n, o) ? o : void 0;
  t.skill && !n.skill && (l && (n.facing = me(n, l)), io(e, s, l, a));
  const r = Et[s.weapon].range + (s.weapon === "blade" || s.weapon === "daggers" ? z(s, "piercing") * 0.25 : 0);
  if (l && !n.attack && Q(n, l) <= r + de[l.kind].radius && (Kn(e, s, l, !1, a), n.combo++, z(s, "echo") && n.combo % Math.max(2, ze.echoEvery + 1 - z(s, "echo")) === 0 && Kn(e, s, l, !0, a), n.attack = Math.round(Et[s.weapon].period * (z(s, "focus") ? ze.focusAttack : 1))), z(s, "orbit") && e.tick % Math.round(ze.orbitTicks / (1 + z(s, "orbit") * 0.25)) === 0 && o && Q(n, o) < 4.5 && mn(e, o, s, 12 + z(s, "orbit") * 3, a), z(s, "orbitals") && e.tick % 35 === 0) {
    for (const c of e.enemies) Q(n, c) < 2.5 + z(s, "orbitals") * 0.35 && ae(a, n, c) && (Ze(e, c, 12 * z(s, "orbitals"), s, "passive", n, a), c.chill = Math.max(c.chill, 30));
    ge(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function uo(e, t, s) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + z(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && pn(e, "familiar", Us(s, e.player, Xe(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || ae(s, a, i))).sort((i, l) => Q(i, a) - Q(l, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = me(a, n), a.kind !== "turret") {
      const i = Q(a, e.player) > 8;
      if (i || Q(a, n) > 1.3 || !ae(s, a, n)) {
        const l = Ns(s, a, i ? e.player : n, 0.25);
        l !== null && et(e, a, l, i ? 0.19 : 0.14 + z(t, "frenzy") * 0.015, 0.25, s);
      }
    }
    const o = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && Q(a, n) < o && ae(s, a, n)) if (a.kind === "turret")
      yt(e, a, a.angle, Et.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      Ze(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? it.empoweredDamage : it.damage) * (1 + z(t, "covenant") * 0.15), t, "companion", a, s), ge(e, a, "slash", 1.2, a.angle);
      const l = a.kind === "shade" ? 32 : i ? it.empoweredAttackTicks : it.attackTicks;
      a.cooldown = Math.round(l / (1 + z(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && z(t, "martyr") && (Ds(e, z(t, "martyr")), he(e, a, "slam", 2.2, 0, 1, 15 * z(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
var $t = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), Ia = [
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
function $a(e, t, s) {
  if (e.wave++, s) {
    for (const o of s.waves[e.wave - 1]) Ae(e, o.kind, o.position);
    return;
  }
  if (e.boss) {
    Ae(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = Fr[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let o = 0; o < n; o++) {
    const i = Pt * o / n + (e.wave - 1) * 0.8;
    let l = a[(o + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && o < 2 && (l = a[0]), e.encounter === "pursuit" && o === 0 && (l = "stalker"), e.encounter === "siege" && o === 0 && (l = "guard"), Ae(e, l, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function ho(e, t, s) {
  if (e.boss) return;
  const a = e.objective, n = e.enemies.some((o) => o.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && Q(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && Q(i, a) < 2.2) && a.progress++;
    const o = Math.min(2, Math.floor(a.progress / $t.ritualTicks));
    a.x = Ia[o].x, a.y = Ia[o].y, e.tick % $t.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Ae(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Ua(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % $t.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && $a(e, t), e.tick % 150 === 0 && he(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % $t.pursuitInterval, e.wave < e.waves && a.progress === 0 && $a(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const o = e.tick % 300 === 0, i = Math.round((o ? e.player.y : e.player.x) / 3) * 3;
    Ce(e, o ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, o ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  e.tick > $t.warningAfter && e.tick % 180 === 0 && he(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, $a(e, t, s)) : n && (e.nextWave = 0);
}
function fo(e) {
  return e.enemies.some((t) => t.hp > 0) ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function po(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, Ia[0]), t.target = $t.ritualTicks * Ia.length), e.encounter === "survival" && (t.target = $t.survivalTicks), e.encounter === "pursuit" && (t.target = $t.pursuitInterval);
}
var ea = (e, t) => {
  e.motion = t, e.motionAngle = me(e, e.target), e.stun = 18;
}, mo = {
  warden(e, t, s) {
    const a = t.pattern % 3, n = oa.warden.damage;
    if (a === 0)
      ea(t, 24), Ce(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let o = -1; o <= 1; o++) st(e, Xe(t, t.angle + o * 0.55, 3.5), 1.8, 12 + Math.abs(o) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      ft(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Ae(e, "guard", {
        x: -7,
        y: -7
      }, s);
  },
  thornheart(e, t, s) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) he(e, Xe(t.target, n * Pt / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      he(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Ae(e, "stalker", {
      x: n,
      y: -6
    }, s);
    else for (let n = 0; n < 3 + t.phase; n++) Ce(e, t, t.angle + n * Pt / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, ge(e, t, "burst", 2), Ce(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), Ce(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (s === 1) ft(e, t, me(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (s === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Xe({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        Ce(e, n, me(n, {
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
      n !== t.phase && Ce(e, t, a + n * Pt / 7, 18, 0.6, 32, 23);
    else if (s === 1) for (let n = 0; n < 6; n++) {
      const o = Xe({
        x: 0,
        y: 0
      }, n * Pt / 6, 9);
      ft(e, o, me(o, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      st(e, t.target, 2, 18, 24), he(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      ea(t, 18), Ce(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (s === 1) for (let a = 0; a < 2 + t.phase; a++) st(e, Xe(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else s === 2 ? (Ce(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Ce(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (ft(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Ae(e, "stalker", {
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
      ea(t, 28);
      for (let a = 0; a < 6; a++) he(e, Xe(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (s === 1) Qn(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (s === 2)
      t.x = 0, t.y = 0, he(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
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
    ]) Ce(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (s === 1) for (let a = -1; a <= 1; a++) he(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else s === 2 ? (st(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Ae(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Ae(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const s = t.pattern % 3;
    if (s === 0) for (let a = 0; a < 3; a++) he(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (s === 1)
      ea(t, 30), Ce(e, t, t.motionAngle, 18, 1.4, 18, 27);
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
    if (s === 0) for (let a = 0; a < 4; a++) he(e, Xe(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else s === 1 ? ft(e, t, t.angle, 9, 2.2, 14, 0.21) : s === 2 ? (t.x = -t.x, t.y = -t.y, Ce(e, t, me(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (he(e, {
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
      }, ea(t, 40), Ce(e, t, 0, 19, 1.4, 14, 25);
    else if (s === 1) for (let a = 0; a < 4; a++) Ce(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else s === 2 ? (st(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (he(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), ft(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), st(e, t.target, 2.3, 24, 21);
    else if (s === 1) for (let a = 0; a < t.memory.length; a++) st(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (s === 2) {
      for (const a of t.memory) Ce(e, a, me(a, t.target), 18, 0.65, 32, 22);
      Ae(e, "wisp", {
        x: -7,
        y: -7
      }), Ae(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Qn(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const s = t.pattern % 4;
    if (s === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), ge(e, t, "burst", 2), Ce(e, t, me(t, t.target), 20, 0.8, 24, 26);
    else if (s === 1)
      ea(t, 20), ft(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (s === 2)
      st(e, t, 3, 12, 26), he(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) Ce(e, a, me(a, t.target), 20, 0.6, 22, 23);
  }
};
function vo(e, t, s, a) {
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const o = t.phase + 1;
    t.phase = o, ge(e, t, "burst", 4), n === "phoenix" && o === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), he(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), s.oaths.includes("legion") && Ae(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  mo[n](e, t, a), t.pattern++;
}
function go(e, t, s) {
  if (!xe(t.kind)) {
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && Q(n, t) < 2.8 && ae(s, t, n)).sort((n, o) => Q(n, t) - Q(o, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && Q(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function yo(e, t, s, a, n) {
  const o = de[t.kind];
  Q(t.target, e.player) < a && Q(t, e.player) < o.reach + 1 && ae(n, t, e.player) && Na(e, o.damage, s, n);
  for (const i of e.companions) Q(t.target, i) < a && Q(t, i) < o.reach + 1 && ae(n, t, i) && (i.hp -= o.damage);
  !e.boss && e.encounter === "siege" && Q(t.target, e.objective) < a && Q(t, e.objective) < o.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - o.damage * 0.5)), ge(e, t.target, "slash", a, t.angle);
}
function bo(e, t, s, a) {
  const n = de[t.kind];
  if (xe(t.kind)) {
    vo(e, t, s, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      ft(e, t, t.angle, e.chapter > 0 ? 3 : 2, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const o of e.enemies) o.hp > 0 && !xe(o.kind) && Q(o, t) < 3.5 && ae(a, t, o) && (o.hp = Math.min(o.maxHp, o.hp + 8));
      ft(e, t, t.angle, 3, 0.7, n.damage, 0.18), ge(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      he(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      yt(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      st(e, t.target, 1.7, 8, n.damage);
      break;
    default:
      yo(e, t, s, n.reach + 0.15, a);
  }
}
function wo(e, t, s, a) {
  const n = de[t.kind], o = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (et(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    Q(t, e.player) < n.radius + 0.4 && ae(a, t, e.player) && Na(e, n.damage, s, a);
    for (const l of e.companions) Q(t, l) < n.radius + 0.3 && ae(a, t, l) && (l.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && Q(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), Q(o, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, ge(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function xo(e, t, s, a) {
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
    ]) n[h] > 0 && (n[h]--, e.tick % 15 === 0 && Ze(e, n, 2 + (h === "burn" ? z(t, "cinder") + z(t, "inferno") : h === "bleed" ? z(t, "hemorrhage") + z(t, "blood-dance") : z(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      wo(e, n, t, a);
      continue;
    }
    const o = de[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (bo(e, n, t, a), n.cooldown = Math.round(o.cooldown * (i ? 0.8 : 1) / (xe(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1)));
      continue;
    }
    const l = go(e, n, a), r = Q(n, l), c = ae(a, n, l);
    if (n.cooldown = Math.max(0, n.cooldown - 1), n.angle = me(n, l), !n.cooldown && r < o.reach && c) {
      if (n.target = {
        x: l.x,
        y: l.y
      }, n.windup = Math.round(o.windup * (i ? 0.8 : 1)), l === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const h = n.kind === "bomber" ? 23 : r / 0.24, u = Math.min(n.windup + h, 4.5 / Math.max(1e-3, Math.hypot(s.x, s.y))), v = {
          x: l.x + s.x * u,
          y: l.y + s.y * u
        };
        a ? ae(a, n, v) && ae(a, l, v) && (n.target = v) : (n.target.x = Math.max(-10, Math.min(10, v.x)), n.target.y = Math.max(-10, Math.min(10, v.y))), n.angle = me(n, n.target);
      }
      continue;
    }
    const d = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (r > (d ? 5 : xe(n.kind) ? 2.8 : 0.95) || d && r < 3 || !c) {
      const h = n.kind === "stalker" && r > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, u = Ns(a, n, l, o.radius);
      u !== null && et(e, n, u + (d && r < 3 && c ? Math.PI : a ? 0 : h), o.speed * (n.chill ? xe(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), o.radius, a);
    }
    for (const h of e.enemies) h.id !== n.id && h.hp > 0 && Q(n, h) < o.radius + de[h.kind].radius && et(e, n, me(h, n), 0.027, o.radius, a);
  }
}
function Ca(e, t, s) {
  if (e.kind === "beam") return so(t, e, e.angle, e.length) < e.width + s;
  const a = Q(e, t);
  return a < e.radius + s && (e.kind !== "ring" || a > e.inner - s);
}
function Mo(e, t, s) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, s ? !ae(s, n, a, a.radius) : Math.abs(a.x) > K.arena || Math.abs(a.y) > K.arena || e.obstacles.some((o) => Q(o, a) < o.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (Q(a, e.player) < K.playerRadius + a.radius && ae(s, a, e.player)) e.player.shield > 0 ? (Fs(e, t, s), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (Na(e, a.damage, t, s), a.life = 0);
      else {
        const o = e.companions.find((i) => i.hp > 0 && Q(a, i) < 0.3 + a.radius && ae(s, a, i));
        o && (o.hp -= a.damage * (1 - z(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const o of e.enemies) {
      if (o.hp <= 0 || a.hits.includes(o.id) || Q(o, a) > de[o.kind].radius + a.radius || !ae(s, a, o)) continue;
      a.hits.push(o.id);
      const i = a.damage * (z(t, "hunter") && Q(o, e.player) > ze.hunterRange ? ze.hunterDamage + (z(t, "hunter") - 1) * 0.15 : 1);
      if (Ze(e, o, i, t, a.source, a, s), z(t, "pinning") && a.source === "attack" && (o.chill = 50 + z(t, "pinning") * 20, e.player.combo % 3 === 0 && bt(e, o, 8 * z(t, "pinning"))), a.splash > 0) {
        ge(e, o, "burst", a.splash);
        for (const l of e.enemies) l.id !== o.id && Q(l, o) < a.splash + de[l.kind].radius && Ze(e, l, i * 0.55, t, a.source, o, s);
      }
      if (a.bounce > 0) {
        const l = e.enemies.filter((r) => r.hp > 0 && !a.hits.includes(r.id) && Q(r, o) < 6 && ae(s, a, r, a.radius)).sort((r, c) => Q(o, r) - Q(o, c))[0];
        if (l) {
          a.bounce--, a.angle = me(a, l), a.damage *= 0.8;
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
function _o(e, t, s) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      Ca(a, e.player, K.playerRadius) && ae(s, a, e.player) && Na(e, a.damage, t, s), !e.boss && e.encounter === "siege" && e.tick % 15 === 0 && Ca(a, e.objective, 0.6) && ae(s, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35));
      const o = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if (o || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!o || !a.hits.includes(i.id)) && Ca(a, i, 0.3) && ae(s, a, i) && (i.hp -= a.damage * 0.25, o && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((o) => o.hp > 0 && Ca(a, o, de[o.kind].radius) && ae(s, a, o));
    a.kind === "mine" && n.length && (a.life = 0, ge(e, a, "burst", a.radius));
    for (const o of n) a.kind === "storm" ? mn(e, o, t, a.damage, s, a) : (a.kind === "fire" && (o.burn = Math.max(o.burn, 45)), a.kind === "frost" && (o.chill = Math.max(o.chill, 60)), a.kind === "mine" && bt(e, o, 25), Ze(e, o, a.damage, t, a.source, a, s));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function ko(e, t, s) {
  Mo(e, t, s), _o(e, t, s);
}
function So(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function Ro(e, t, s) {
  const { seed: a, zone: n, chapter: o, elite: i, boss: l, bossKind: r, encounter: c, hp: d } = e, h = {
    tick: 0,
    seed: a,
    serial: 0,
    player: {
      x: 0,
      y: 5,
      hp: d,
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
    obstacles: l ? r === "warden" || r === "colossus" ? [{
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
    chapter: o,
    elite: i,
    boss: l,
    bossKind: r,
    encounter: c,
    objective: {
      x: 0,
      y: 0,
      hp: 100,
      progress: 0,
      target: 0
    }
  };
  return s && ((l && !Yn(r) || s.waves.some((u) => u.some((v) => !Yn(v.kind)))) && $e("encounter_unsupported"), (c !== "skirmish" || !s.waves.length || !wt(s.space, s.entry, K.playerRadius) || s.waves.some((u) => !u.length || u.some((v) => !wt(s.space, v.position, de[v.kind].radius) || !Bt(s.space, s.entry, v.position, K.playerRadius)))) && $e("map_invalid"), Object.assign(h.player, s.entry), Object.assign(h.objective, s.objective), h.obstacles = [], h.waves = s.waves.length), po(h), $a(h, t, s), h;
}
function Co(e, t, s, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((o) => --o.life > 0).slice(-80);
  const n = co(e, t, s, a);
  uo(e, s, a), xo(e, s, n, a), ko(e, s, a), e.enemies = e.enemies.filter((o) => o.hp > 0), So(e) ? e.status = "lost" : (ho(e, s, a), fo(e) && (e.status = "won", e.shots = [], e.hazards = []));
}
function $o(e, t) {
  const s = e.at(-1);
  s && s.move === t.move && s.dash === t.dash && s.skill === t.skill ? s.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var Ao = 2.4;
function Dt(e, t) {
  return (!e?.all || e.all.every((s) => t.has(s))) && (!e?.none || e.none.every((s) => !t.has(s)));
}
var Xn = /* @__PURE__ */ new WeakMap();
function xt(e, t) {
  const s = e.gates.filter((i) => Dt(i.condition, t)).map((i) => i.id), a = s.join("/");
  let n = Xn.get(e);
  n || (n = /* @__PURE__ */ new Map(), Xn.set(e, n));
  let o = n.get(a);
  return o || (o = js(e.map, new Set(s)), n.set(a, o)), o;
}
function Da(e, t) {
  const s = e.exits.filter((n) => Dt(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => Dt(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...s, ...a];
}
function Bs(e, t, s) {
  const a = xt(e, s);
  return Da(e, s).filter((n) => Q(t.position, n.position) <= 2.4 && Pe(a, t.position, n.position)).sort((n, o) => Q(t.position, n.position) - Q(t.position, o.position) || n.target.id.localeCompare(o.target.id));
}
function Po(e, t, s, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && $e("input_invalid"), t && (e.facing = En(t), Pn(s, e.position, {
    x: Math.cos(e.facing) * K.speed * a,
    y: Math.sin(e.facing) * K.speed * a
  }, K.playerRadius));
}
var ia = {
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
function Ws(e, t, s, a, n, o) {
  const i = ia[e];
  if (!i || t.has(i.complete)) return null;
  const l = ve[e], r = i.waves.map((c) => c.map((d) => ({
    kind: d.kind,
    position: l.anchors[d.anchor]
  })));
  return e === "hall" && o && r[0].push({
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
      space: xt(l, t),
      entry: s,
      objective: l.anchors.encounter,
      waves: r,
      summonPoints: i.summons.map((c) => l.anchors[c])
    }
  };
}
var In = {
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
    meaning: "玩家请求或接受担架接应，老白答应安排时提交。牢门、小门打开且玩家回到檐下后，担架队接回仍留在牢房等候的人；已跟随或自行离开的人继续自己的行程。"
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
}, qs = Object.keys(In);
function Eo(e, t, s) {
  return Nt(s.scene) !== "camp" ? [] : qs.filter((a) => {
    if (a === "receiving" && e.includes("captives_arrived")) return !1;
    const n = In[a], o = ga[t].station, i = ve[o.scene].anchors[o.anchor], l = s.scene === "clinic_front" || s.scene === o.scene && Math.hypot(s.position.x - i.x, s.position.y - i.y) <= 2.4;
    return n.atClinic && !l ? !1 : n.people.includes(t) && !e.includes(n.fact) && n.requires.every((r) => e.includes(r));
  });
}
var Wt = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Jn = /* @__PURE__ */ new WeakMap();
function vn(e, t, s) {
  if (Pe(e, t, s, K.playerRadius)) return s;
  const a = Ft(e.map, t), n = Ft(e.map, s), o = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Jn.get(e);
  i || (i = /* @__PURE__ */ new Map(), Jn.set(e, i));
  const l = sa(e.map, a.column, a.row);
  if (!i.has(o)) {
    const c = Bt(e, l, sa(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(o, c?.find((d) => Wt(d, l) > 0.01) ?? null);
  }
  const r = i.get(o);
  return r ? Pe(e, t, r, K.playerRadius) ? r : l : null;
}
function Io(e) {
  return {
    scene: e.scene,
    position: { ...ve[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function gn(e, t) {
  const s = ia[e];
  return !s || t.has(s.complete);
}
function za(e, t, s, a) {
  const n = [{
    ...e,
    route: []
  }], o = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), l = ve[i.scene], r = xt(l, s);
    if (i.scene === t.scene && vn(r, i.position, l.anchors[t.anchor])) return i.route;
    for (const c of ve[i.scene].exits) {
      const d = `${c.to}/${c.arrival}`;
      o.has(d) || !Dt(c.condition, s) || a && !gn(c.to, s) || !vn(r, i.position, l.anchors[c.anchor]) || (o.add(d), n.push({
        scene: c.to,
        position: ve[c.to].anchors[c.arrival],
        route: [...i.route, c]
      }));
    }
  }
  return null;
}
function Hs(e, t) {
  const s = new Set(e.facts), a = e.people[t];
  return Object.entries(Za).map(([n, o]) => {
    const i = za(a, o, s, !1), l = gn(o.scene, s), r = gn(a.scene, s) && l ? za(a, o, s, !0) : null;
    return {
      id: n,
      name: o.name,
      ...cn(o.scene) ? { use: cn(o.scene).use } : {},
      personHere: a.scene === o.scene && (n === o.scene || Wt(a.position, ve[o.scene].anchors[o.anchor]) <= 2.4),
      playerHere: e.location.scene === o.scene && (n === o.scene || Wt(e.location.position, ve[o.scene].anchors[o.anchor]) <= 2.4),
      accessible: i !== null,
      safe: l,
      solo: r !== null,
      route: r ?? i
    };
  });
}
function zo(e, t) {
  return Ts(e.facts, t) !== "confined";
}
var Vs = (e) => Ao * (0.7 + Ye.indexOf(e) / Ye.length * 0.2);
function Lo(e) {
  return Ye.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && Wt(e.people[t].position, e.location.position) >= Vs(t));
}
function Gs(e, t) {
  return Ye.filter((s) => t[s].scene === e).map((s) => ({
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
function Ys(e) {
  return [...Da(ve[e.location.scene], new Set(e.facts)), ...Gs(e.location.scene, e.people)];
}
function zn(e, t, s, a) {
  return Gs(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const o = e.id === "cells" && !!ga[n.target.person].returnFact && !s.has("captives_released"), i = xt(e, o ? /* @__PURE__ */ new Set([...s, "captives_released"]) : s);
    return Wt(n.position, t) <= (o ? 5 : 2.4) && Pe(i, t, n.position);
  });
}
function To(e) {
  const t = new Set(e.facts);
  for (const s of Ye) {
    const a = e.people[s];
    if (a.mode === "idle") continue;
    const n = ve[a.scene], o = xt(n, t);
    let i, l;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && ye("invalid"), i = e.location.position, Wt(a.position, i) < Vs(s)) continue;
    } else {
      const v = Za[a.destination], f = za(a, v, t, !0);
      if (f || ye("unavailable"), l = f[0], i = n.anchors[l?.anchor ?? v.anchor], Wt(a.position, i) < 0.2) {
        l ? (a.scene = l.to, a.position = { ...ve[l.to].anchors[l.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const r = vn(o, a.position, i);
    r || ye("unavailable");
    const c = r.x - a.position.x, d = r.y - a.position.y, h = Math.hypot(c, d), u = Math.min(h, K.speed * 1.8);
    h && (a.facing = Math.atan2(d, c), Pn(o, a.position, {
      x: c / h * u,
      y: d / h * u
    }, K.playerRadius));
  }
}
var Ue = {
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
}, Fa = Object.keys(Ue), Qs = [...Ye, ...Fa];
function Ee(e) {
  return Object.hasOwn(Es, e);
}
function Fe(e) {
  return Ee(e) ? Es[e] : Ue[e].name;
}
function La(e, t) {
  const s = Ue[e];
  return ve[s.scene].anchors[t.has(s.complete) ? s.clearedAnchor : s.anchor];
}
function Ba(e, t, s) {
  return Fa.filter((a) => Ue[a].scene === e).flatMap((a) => {
    const n = La(a, s), o = Ue[a];
    return Math.hypot(t.x - n.x, t.y - n.y) <= o.approachRadius ? [{
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
function yn(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && ye("invalid"), e;
}
function es(e, t = 0, s = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > s) && ye("invalid"), e;
}
function gt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && ye("invalid"), e;
}
function ts(e, t, s) {
  return (!Array.isArray(e) || e.length > t) && ye("invalid"), e.map(s);
}
function jo(e) {
  return new Set(e).size !== e.length && ye("invalid"), e;
}
function as(e) {
  typeof e != "boolean" && ye("invalid");
}
function Oo(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && ye("identity"), e;
}
var wa = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), Zo = Object.keys(wa), Ks = ["male", "female"];
function Uo(e) {
  const t = yn(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && ye("invalid"), {
    name: t.name.trim(),
    gender: gt(t.gender, Ks),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: gt(t.appearanceAge, Zo) }
  };
}
var Ut = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), Xs = `${Ut.number} · ${Ut.title}`, No = {
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
function Js(e, t) {
  const s = No[t], a = Ee(t) && ya(e.facts, t) && s.returned ? s.returned : s.initial;
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
var Ta = Object.freeze({
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
function Ln(e) {
  return Ta.bands.filter((t) => e >= t).length - 1;
}
function Do(e) {
  const t = e.lastReply;
  if (!t) return null;
  const s = e.conversations[t.person].at(-1);
  return s?.id === t.turnId ? {
    person: t.person,
    turn: s
  } : null;
}
function ns(e, t) {
  const s = e.conversations[t].at(-1);
  return s && s.kind !== "greeting" ? s : null;
}
function Fo(e) {
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
function Tn(e) {
  const t = Do(e);
  return t?.turn.action === "finish" && !e.facts.includes("chapter_completed") ? t.person : null;
}
var ma = Object.freeze({
  encounterReach: 14,
  alarmTicks: 900,
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function bn(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((s) => s.id === t))
  };
}
function Bo(e, t) {
  if (e.phase !== "exploration" || !ve[e.location.scene].safe) return "unavailable";
  if (t.length > K.relicSlots) return "capacity";
  if (new Set(t).size !== t.length || t.some((a) => !e.collection.some((n) => n.id === a))) return "invalid";
  const s = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((a) => t.includes(a.id))
  };
  return t.some((a) => !Zs(s, a)) ? "dependency" : null;
}
function ja(e, t, s) {
  e.facts.includes(t) || e.facts.push(t);
  const a = s ?? [...Ye.filter((n) => e.people[n].scene === e.location.scene), ...Fa.filter((n) => Ue[n].scene === e.location.scene)];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function Wo(e) {
  const t = e.checkpoint;
  return Ws(e.location.scene, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"))?.field;
}
function qo(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const t = Nt(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const s of Vn) {
    if (ya(e.facts, s)) continue;
    const a = e.people[s];
    t && a.scene === "cells" && a.mode === "idle" && (e.people[s] = Io(ga[s].station));
    const n = e.people[s].scene;
    Nt(n) === "camp" && ja(e, ga[s].returnFact, Ye.filter((o) => e.people[o].scene === n));
  }
  Vn.every((s) => ya(e.facts, s)) && ja(e, "captives_arrived", Ye.filter((s) => e.people[s].scene === "camp"));
}
function Ho(e) {
  const t = ia[e.location.scene];
  ja(e, t.complete);
  const s = bn(e);
  t.boss && (e.hp = Math.min(K.maxHp, e.hp + 20 + z(s, "renewal") * ze.renewalZoneHeal)), e.offers = qr(e, no(e.weapon).flatMap((a) => {
    const n = e.collection.find((o) => o.id === a)?.rank ?? 0;
    return n < K.maxRelicRank && Zs(s, a) && (ba[a].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: a,
      rank: n + 1
    }] : [];
  }), 3), e.phase = e.offers.length ? "reward" : "exploration", e.battle = null, e.checkpoint = null;
}
function ss(e, t) {
  if (!(e.pendingParley || Tn(e))) {
    if (e.phase === "battle" && e.battle) {
      const s = Wo(e);
      s || ye("invalid"), Co(e.battle, t, bn(e), s);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, ["gate", "beacon"].includes(e.location.scene) && !e.facts.includes("alarm_silenced") && (e.alarmTicks++, e.alarmTicks >= ma.alarmTicks && ja(e, "alarm_raised")), a.status === "won" ? Ho(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const s = ve[e.location.scene], a = new Set(e.facts);
      Po(e.location, t.move, xt(s, a), ma.explorationSpeed);
      const n = ia[s.id], o = s.anchors.encounter;
      if (n && !a.has(n.complete) && o && Math.hypot(e.location.position.x - o.x, e.location.position.y - o.y) <= (n.triggerRadius ?? ma.encounterReach)) {
        const i = Ws(s.id, a, e.location.position, Math.floor(Ua(e) * 4294967296), e.hp, a.has("alarm_raised") && !a.has("alarm_silenced"));
        e.battle = Ro(i.setup, bn(e), i.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (To(e), qo(e));
  }
}
var er = [
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
    fact: An.fact,
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
    key: oa.warden.awardKey,
    amount: K.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: oa.thornheart.awardKey,
    amount: K.firstBossAward
  }
], k2 = Object.fromEntries([
  ...Br.map((e) => [oa[e].awardKey, K.firstBossAward]),
  ["victory", K.firstVictoryAward],
  ...Object.keys(Et).map((e) => [`mastery-${e}`, K.masteryAward]),
  ...Dr.map((e) => [`oath-${e}`, K.oathAward]),
  ...er.map((e) => [e.key, e.amount])
]), ta = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, Vo = {
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
    gestures: ta
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
    gestures: ta
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
    gestures: ta
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
    gestures: ta
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
      ...ta,
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
    gestures: ta
  }
};
function Go(e) {
  return Vo[e];
}
var jn = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, Yo = {
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
}, xa = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function tr(e, t) {
  const s = { ...Yo[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(s, a.clothing);
  return s;
}
var Qo = (e) => gt(e, Ps), rs = (e) => gt(e, As), os = (e) => gt(e, Is);
function Ko(e) {
  const t = yn(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: Qo(t.weapon),
        outfit: os(t.outfit),
        traveler: Uo(t.traveler),
        chapter: gt(t.chapter, [Ut.id])
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: os(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: Oo(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: gt(t.id, qs),
        person: gt(t.person, Ye)
      };
    case "greet":
      return {
        type: "greet",
        person: gt(t.person, Qs)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: jo(ts(t.equipped, K.relicSlots, rs))
      };
    case "input": {
      const s = ts(t.spans, K.maxInputTicks, (a) => {
        const n = yn(a);
        return as(n.dash), as(n.skill), {
          move: es(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: es(n.ticks, 1, K.maxInputTicks)
        };
      });
      return (!s.length || s.reduce((a, n) => a + n.ticks, 0) > K.maxInputTicks) && ye("invalid"), {
        type: "input",
        spans: s
      };
    }
    case "relic":
      return {
        type: "relic",
        id: rs(t.id)
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: t.type };
    default:
      return ye("invalid");
  }
}
function Xo(e, t) {
  const s = Rt(null), a = W(!1), n = W(""), o = Rt(null), i = W(!1), l = W(!1), r = Rt(null), c = Rt(null), d = W(null), h = Y(() => s.value?.replyFailure?.actionId === d.value ? null : s.value?.replyFailure ?? null), u = Y(() => i.value || !!s.value?.conversation), v = W(!1), f = W(!1);
  let g = !1;
  const b = Rt(null), _ = Y(() => {
    const E = (b.value ?? s.value)?.conversation;
    return E || (i.value ? r.value : null);
  }), M = Y(() => a.value || u.value || l.value || !!o.value || !s.value?.ready || s.value.writeState !== "ready" || s.value.pending), S = (E, B) => E.data.revision !== B.data.revision ? E.data.revision > B.data.revision : E.fileRevision >= B.fileRevision;
  function y(E) {
    if (g || s.value && !S(E, s.value)) return;
    const B = r.value;
    (s.value?.data.active?.id !== E.data.active?.id || B && E.data.active?.conversations[B.person].some((q) => q.id === B.actionId)) && (r.value = null), s.value = E;
  }
  const x = Y(() => {
    if (r.value) return r.value;
    if (s.value?.conversation) return {
      ...s.value.conversation,
      status: "sending"
    };
    const E = s.value?.replyFailure;
    return !E || E.regenerating || s.value?.data.active?.conversations[E.person].some((B) => B.id === E.actionId) ? null : {
      actionId: E.actionId,
      person: E.person,
      text: E.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function w(E, B, q) {
    if (g || a.value) return !1;
    a.value = !0, b.value = null, n.value = "";
    try {
      const F = await e.request(`game/expedition/${E}`, {
        chatIdentity: t,
        ...E === "rebuild" ? { actionId: nn() } : {},
        ...B,
        ...q ? { person: q } : {}
      }, 35e3), U = b.value;
      return y(U && S(U, F.result) ? U : F.result), v.value = !1, f.value = !1, s.value?.writeState === "ready" && !s.value.pending && E !== "read" && (o.value = null), !0;
    } catch (F) {
      if (!g) {
        v.value = !0, b.value && y(b.value), n.value = At(F);
        const U = F && typeof F == "object" && "code" in F ? String(F.code) : "";
        f.value = U === "expedition_data_invalid", B && (U.startsWith("expedition_save_") || U.startsWith("host_request_")) && (o.value = B);
      }
      return !1;
    } finally {
      b.value = null, g || (a.value = !1);
    }
  }
  const I = e.subscribe((E) => {
    if (g) return;
    if (E.type === "game/expedition/error") {
      const q = E.payload;
      q.chatIdentity === t && (n.value = At(q), f.value = q.code === "expedition_data_invalid");
      return;
    }
    if (E.type !== "game/expedition/state") return;
    const B = E.payload;
    B.chatIdentity === t && (a.value ? b.value = B.state : (b.value = null, y(B.state)));
  });
  async function N() {
    const E = o.value;
    return !await w("confirm") || !s.value || s.value.writeState !== "ready" || s.value.pending ? !1 : E && s.value.data.revision === E.revision ? w("act", E) : (o.value = null, l.value = !1, !0);
  }
  async function j(E, B, q) {
    if (M.value || g) return !1;
    const F = nn();
    c.value = q ? {
      person: E,
      turnId: q
    } : null, r.value = {
      actionId: F,
      person: E,
      text: B,
      regenerating: !!q,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", b.value = null;
    try {
      const U = await e.request(q ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: F,
        revision: s.value.data.revision,
        person: E,
        text: B,
        ...q ? { turnId: q } : {}
      }, 18e4), H = b.value;
      return y(H && S(H, U.result) ? H : U.result), !0;
    } catch (U) {
      if (!g) {
        b.value && y(b.value);
        const H = U && typeof U == "object" && "code" in U ? String(U.code) : U instanceof Error ? U.message : "";
        if (H === "expedition_cancelled")
          return n.value = "", !1;
        l.value = H.startsWith("host_request_") || H.startsWith("expedition_save_"), n.value = l.value ? D.aiUnknown : s.value?.replyFailure?.actionId === F ? "" : At(U);
      }
      return !1;
    } finally {
      c.value = null, i.value = !1, b.value = null, g || (a.value = !1, r.value?.actionId === F && (r.value = q ? null : {
        ...r.value,
        status: "failed"
      }));
    }
  }
  async function P() {
    if (u.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (E) {
        g || (n.value = At(E));
      }
  }
  const Z = Y(() => v.value || !!o.value || l.value || !s.value || s.value.pending || s.value.writeState !== "ready");
  return {
    view: s,
    busy: a,
    error: n,
    blocked: M,
    failed: o,
    talking: u,
    uncertainTalk: l,
    talk: j,
    outgoing: x,
    replacingReply: c,
    conversationProgress: _,
    cancelTalk: P,
    recoveryRequired: Z,
    dataInvalid: f,
    conversationFailure: h,
    dismissConversationFailure() {
      d.value = s.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => w("rebuild"),
    retryMemory: (E) => M.value ? Promise.resolve(!1) : w("retry-memory", void 0, E),
    dismissError() {
      Z.value || (n.value = "");
    },
    notice: Y(() => n.value || (s.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(s.value.writeState) || s.value.pending && s.value.writeState === "ready") ? ee.saveError : "")),
    read: () => w("read"),
    recover: N,
    act: (E) => M.value ? Promise.resolve(!1) : w("act", {
      actionId: nn(),
      revision: s.value.data.revision,
      command: Ko(E)
    }),
    dispose() {
      g = !0, I();
    }
  };
}
function Jo(e) {
  const t = Rt(null), s = Rt(!1);
  let a = [], n = 0, o = null, i = !1;
  function l() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const u of a) for (let v = 0; v < u.ticks; v++) ss(t.value, u);
    s.value = a.length > 0;
  }
  const r = ce(e.view, () => {
    !o && !a.length && l();
  }, { immediate: !0 });
  async function c() {
    if (o)
      return await o ? c() : !1;
    if (!a.length) return !e.blocked.value;
    if (e.blocked.value || i) return !1;
    const h = a;
    a = [], n = 0, o = e.act({
      type: "input",
      spans: h
    });
    const u = await o;
    return o = null, u ? l() : e.failed.value || (a = h.concat(a), n = a.reduce((v, f) => v + f.ticks, 0)), s.value = a.length > 0 || !u, u;
  }
  function d(h) {
    const u = t.value;
    !u || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(u.phase) || u.phase === "exploration" && !h.move && !Lo(u) || (ss(u, h), $o(a, h), n++, s.value = !0, vr(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(u.phase)) && c());
  }
  return {
    current: t,
    dirty: s,
    input: d,
    flush: c,
    sync: l,
    async recover() {
      return await e.recover() ? (l(), c()) : !1;
    },
    dispose() {
      i = !0, r();
    }
  };
}
var { recent: on, maximum: is } = _r;
function ei(e) {
  const { history: t, pending: s, talking: a, person: n, campaignId: o, transcript: i, freshReply: l } = e, r = gr(/* @__PURE__ */ new Map());
  let c = 0, d = !1;
  const h = Y(() => t.value.reduce((P, Z) => P + (Z.kind === "greeting" || Z.kind === "player" ? 1 : 2), 0)), u = Y(() => h.value + Number(s.value)), v = Y(() => Mr(r.get(n.value)?.range, u.value)), f = Y(() => {
    const P = [];
    let Z = 0;
    for (const E of t.value) {
      if (Z >= v.value.end) break;
      const B = E.kind === "greeting" ? ["npc"] : E.kind === "player" ? ["player"] : ["player", "npc"];
      for (const q of B)
        Z >= v.value.start && Z < v.value.end && P.push({
          key: `${E.id}:${q}`,
          side: q,
          turn: E
        }), Z++;
    }
    return P;
  }), g = Y(() => v.value.start > 0), b = Y(() => v.value.end < u.value), _ = Y(() => b.value || v.value.end - v.value.start > on), M = Y(() => s.value && v.value.end > h.value);
  function S(P) {
    P && !P.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function y(P, Z) {
    const E = P.getBoundingClientRect().top, B = [...P.querySelectorAll("[data-message-key]")].find((q) => Z.has(q.dataset.messageKey) && q.getBoundingClientRect().bottom > E);
    return B ? {
      key: B.dataset.messageKey,
      offset: B.getBoundingClientRect().top - E
    } : null;
  }
  function x(P, Z) {
    const E = Z && [...P.querySelectorAll("[data-message-key]")].find((B) => B.dataset.messageKey === Z.key);
    return !E || !Z ? !1 : (P.scrollTop += E.getBoundingClientRect().top - P.getBoundingClientRect().top - Z.offset, !0);
  }
  function w() {
    const P = i.value;
    if (!P || d || r.get(n.value)?.latest === !1) return;
    const Z = l.value ? P.querySelector('[data-fresh-reply="true"]') : null;
    P.scrollTop = Z && Z.offsetHeight > P.clientHeight ? Z.getBoundingClientRect().top - P.getBoundingClientRect().top + P.scrollTop - 12 : P.scrollHeight;
  }
  function I() {
    const P = ++c, Z = n.value, E = i.value?.contains(document.activeElement) ? document.activeElement : null;
    d = !1, l.value = null, r.delete(Z), mt(() => {
      c === P && n.value === Z && (w(), S(E));
    });
  }
  function N() {
    const P = i.value;
    if (!P || d) return;
    const Z = !b.value && P.scrollHeight - P.clientHeight - P.scrollTop < 32;
    if (Z && _.value) {
      I();
      return;
    }
    r.set(n.value, {
      top: P.scrollTop,
      latest: Z,
      range: Z ? null : {
        start: v.value.start,
        end: b.value ? v.value.end : null
      }
    });
  }
  async function j(P) {
    const Z = i.value;
    if (!Z || d) return;
    const E = { ...v.value };
    P === "older" ? (E.start = Math.max(0, E.start - on), E.end = Math.min(E.end, E.start + is)) : (E.end = Math.min(u.value, E.end + on), E.start = Math.max(E.start, E.end - is));
    const B = y(Z, new Set(f.value.filter((ne, Ne) => {
      const De = v.value.start + Ne;
      return De >= E.start && De < E.end;
    }).map((ne) => ne.key))), q = Z.contains(document.activeElement) ? document.activeElement : null, F = n.value, U = ++c;
    d = !0;
    const H = {
      start: E.start,
      end: E.end === u.value ? null : E.end
    };
    r.set(F, {
      range: H,
      top: Z.scrollTop,
      latest: !1
    }), await mt(), !(U !== c || n.value !== F || i.value !== Z) && (x(Z, B) || (Z.scrollTop = P === "older" ? 0 : Z.scrollHeight), r.set(F, {
      range: H,
      top: Z.scrollTop,
      latest: !1
    }), d = !1, S(q));
  }
  return ce(o, () => {
    c++, d = !1, r.clear();
  }), ce([i, n], ([P, Z]) => {
    c++, d = !1;
    const E = r.get(Z);
    P && (P.scrollTop = E && !E.latest ? E.top : P.scrollHeight);
  }, { flush: "post" }), ce(i, (P, Z, E) => {
    if (!P) return;
    const B = new ResizeObserver(w);
    B.observe(P), E(() => B.disconnect());
  }, { flush: "post" }), ce(f, async (P) => {
    const Z = i.value, E = n.value, B = c, q = r.get(E);
    if (!Z || d || !q || q.latest) return;
    const F = y(Z, new Set(P.map((U) => U.key)));
    await mt(), !(B !== c || i.value !== Z || r.get(E) !== q) && (x(Z, F), q.top = Z.scrollTop);
  }), ce([
    t,
    s,
    a,
    l
  ], async () => {
    await mt(), w();
  }), {
    messages: f,
    hasOlder: g,
    hasNewer: b,
    expanded: _,
    pendingVisible: M,
    rememberReading: N,
    resetLatest: I,
    older: () => j("older"),
    newer: () => j("newer")
  };
}
var ie = Object.freeze({
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
    clothing_rejected: xa.rejected,
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
function ti(e) {
  let t = null, s = null, a = null, n = !1, o = !1, i = null, l = -1, r = 0, c = 0, d = 0, h = 0, u = 0;
  function v(g, b, _, M = "sine", S = g * 0.8, y = 0) {
    if (!n || !t || !s || t.state !== "running") return;
    const x = t.createOscillator(), w = t.createGain(), I = t.currentTime + y;
    x.type = M, x.frequency.setValueAtTime(g, I), x.frequency.exponentialRampToValueAtTime(Math.max(30, S), I + b), w.gain.setValueAtTime(1e-4, I), w.gain.exponentialRampToValueAtTime(_, I + 9e-3), w.gain.exponentialRampToValueAtTime(1e-4, I + b), x.connect(w).connect(s), x.start(I), x.stop(I + b), x.onended = () => {
      x.disconnect(), w.disconnect();
    };
  }
  function f(g, b, _, M) {
    if (!n || !t || !s || !a || t.state !== "running") return;
    const S = t.createBufferSource(), y = t.createBiquadFilter(), x = t.createGain(), w = t.currentTime;
    S.buffer = a, y.type = "bandpass", y.Q.value = 0.65, y.frequency.setValueAtTime(_, w), y.frequency.exponentialRampToValueAtTime(M, w + g), x.gain.setValueAtTime(1e-4, w), x.gain.exponentialRampToValueAtTime(b, w + 8e-3), x.gain.exponentialRampToValueAtTime(1e-4, w + g), S.connect(y).connect(x).connect(s), S.start(w), S.stop(w + g), S.onended = () => {
      S.disconnect(), y.disconnect(), x.disconnect();
    };
  }
  return {
    async enable(g) {
      if (!o) {
        n = g;
        try {
          if (!g) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), s = t.createGain(), s.gain.value = 0.55, s.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const b = a.getChannelData(0);
            for (let _ = 0; _ < b.length; _++) b[_] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, o || e();
        }
      }
    },
    tick(g) {
      (!i || g.tick < l) && (l = -1, r = g.player.hp, c = g.kills, d = g.player.skill, h = g.serial, u = g.player.combo), i = g, l !== g.tick && (l = g.tick, g.player.hp < r && (f(0.16, 0.17, 800, 120), v(95, 0.2, 0.12, "triangle", 42)), g.kills > c && (v(659, 0.22, 0.045), v(988, 0.3, 0.025, "sine", 980, 0.035)), g.player.combo > u && f(0.095, 0.08, 2700, 500), g.player.dashTime === 7 && f(0.2, 0.09, 500, 2600), g.player.skill > d && (f(0.24, 0.12, 2200, 250), v(165, 0.35, 0.075, "triangle", 82), v(660, 0.36, 0.035, "sine", 440, 0.02)), g.effects.some((b) => b.id > h && b.kind === "lightning") && (f(0.12, 0.1, 4400, 1e3), v(1200, 0.08, 0.018, "sine", 210)), g.effects.some((b) => b.id > h && (b.kind === "block" || b.kind === "parry")) && (v(1350, 0.18, 0.07, "triangle", 740), v(2200, 0.11, 0.025, "sine", 1600)), g.effects.some((b) => b.id > h && b.kind === "ward-hit") && v(510, 0.16, 0.06, "sine", 250), g.effects.some((b) => b.id > h && b.kind === "ward-break") && (f(0.25, 0.1, 3600, 650), v(720, 0.3, 0.05, "sine", 120)), g.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((b, _) => v(b, 0.65, 0.04, "sine", b, _ * 0.075)), g.status === "lost" && v(147, 0.7, 0.06, "triangle", 73), r = g.player.hp, c = g.kills, d = g.player.skill, h = g.serial, u = g.player.combo);
    },
    dispose() {
      o = !0, n = !1, t && (t.close().catch(e), t = null), s = null, a = null;
    }
  };
}
var m = {
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
}, ls = [
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
}, Oe = {
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
}, Wa = [
  {
    sky: m.sky,
    haze: m.haze,
    stone: m.stone,
    light: m.light,
    floor: m.grass,
    tile: m.grassLight,
    seam: m.mortar,
    dark: m.shadow,
    trim: m.brass,
    accent: m.ember,
    foliage: m.leaf,
    flower: m.rose,
    water: m.water
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
], ai = {
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
}, S2 = Object.fromEntries(Object.entries(ba).map(([e, t]) => [e, ai[t.family]]));
function ni(e, t, s) {
  const a = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, o = !1, i = !1;
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
  function r(u) {
    if (!(!l.includes(u.code) || u.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(u.target.tagName)) && !(u.code === "Space" && u.target instanceof HTMLElement && u.target.closest("button"))) {
      if (u.preventDefault(), u.stopPropagation(), s(), u.code === "Escape") {
        u.repeat || t();
        return;
      }
      a.add(u.code), !u.repeat && u.code === "Space" && (o = !0), !u.repeat && u.code === "KeyE" && (i = !0);
    }
  }
  function c(u) {
    a.delete(u.code);
  }
  function d() {
    a.clear(), n = {
      x: 0,
      y: 0
    }, o = !1, i = !1;
  }
  function h() {
    d(), t();
  }
  return e.addEventListener("keydown", r), window.addEventListener("keyup", c), window.addEventListener("blur", h), {
    frame() {
      const u = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), v = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), f = {
        move: Math.hypot(u, v) < 0.15 ? 0 : (Math.round((Math.atan2(v, u) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: o,
        skill: i
      };
      return o = !1, i = !1, f;
    },
    stick(u, v) {
      n = {
        x: u,
        y: v
      };
    },
    dash() {
      o = !0, s();
    },
    skill() {
      i = !0, s();
    },
    clear: d,
    dispose() {
      d(), e.removeEventListener("keydown", r), window.removeEventListener("keyup", c), window.removeEventListener("blur", h);
    }
  };
}
function si(e, t) {
  let s = null;
  function a(o) {
    if (!s || o.pointerId !== s.id) return;
    const i = s.surface.getBoundingClientRect(), l = i.width * 0.36, r = (o.clientX - i.left - i.width / 2) / l, c = (o.clientY - i.top - i.height / 2) / l, d = Math.max(1, Math.hypot(r, c));
    e(r / d, c / d);
  }
  function n() {
    const o = s;
    s = null, e(0, 0), o?.surface.hasPointerCapture(o.id) && o.surface.releasePointerCapture(o.id);
  }
  return {
    down(o) {
      if (s || o.button !== 0) return;
      t();
      const i = o.currentTarget;
      i.setPointerCapture(o.pointerId), s = {
        id: o.pointerId,
        surface: i
      }, a(o);
    },
    move: a,
    release(o) {
      s?.id === o.pointerId && n();
    },
    clear: n
  };
}
function wn(e) {
  const t = new qn();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const s = {
    box: new Lr(1, 1, 1),
    sphere: new Ir(1, 20, 14),
    rock: new Wn(1, 0),
    crown: new Wn(1, 1),
    cylinder: new Er(1, 1, 1, 24),
    cone: new Tr(1, 1, 12),
    disc: new zr(1, 48),
    ring: new tn(0.965, 1, 64),
    arc: new tn(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new Bn(1, 0.08, 8, 40),
    stroke: new tn(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new Bn(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new Hn(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
  function i(u, v = !1, f = 1, g = !1) {
    const b = `${u}/${v}/${f}/${g}`;
    let _ = n.get(b);
    return _ || (_ = v ? new Ar({
      color: u,
      transparent: f < 1,
      opacity: f,
      depthWrite: f === 1,
      side: 2
    }) : new ks({
      color: u,
      map: e?.get(u) ?? null,
      roughness: g ? 0.34 : 0.88,
      metalness: g ? 0.45 : 0.02,
      side: 2
    }), n.set(b, _)), _;
  }
  function l(u, v, f, g, b = [
    0,
    0,
    0
  ], _ = !1, M = 1, S = !1) {
    let y = s[v];
    if (!_ && v === "box" && e?.has(f)) {
      y = y.clone(), o.add(y);
      const w = y.getAttribute("position"), I = y.getAttribute("normal"), N = y.getAttribute("uv");
      for (let j = 0; j < N.count; j++) {
        const P = Math.abs(I.getX(j)) > 0.5 ? w.getZ(j) * g[2] : w.getX(j) * g[0], Z = Math.abs(I.getY(j)) > 0.5 ? w.getZ(j) * g[2] : w.getY(j) * g[1];
        N.setXY(j, P / 8, Z / 8);
      }
    }
    const x = new vt(y, i(f, _, M, S));
    return x.scale.set(...g), x.position.set(...b), x.castShadow = !_, x.receiveShadow = !_, u.add(x), x;
  }
  function r(u, v = [
    0,
    0,
    0
  ]) {
    const f = new fa();
    return f.position.set(...v), u.add(f), f;
  }
  function c(u, v, f, g, b, _ = 1, M = !1, S = 0.04) {
    const y = l(u, M ? "disc" : "ring", v, [
      f,
      f,
      1
    ], [
      g,
      S,
      b
    ], !0, _);
    return y.rotation.x = -Math.PI / 2, y;
  }
  function d(u, v, f, g = [
    0,
    0,
    0
  ], b = 0) {
    const _ = e?.has(f) ?? !1, M = JSON.stringify([
      v,
      b,
      _
    ]);
    let S = a.get(M);
    if (!S) {
      const x = new qn();
      if (v.forEach(([w, I], N) => N ? x.lineTo(w, I) : x.moveTo(w, I)), x.closePath(), S = b ? new Hn(x, {
        depth: b,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: b * 0.3,
        bevelSize: b * 0.3,
        bevelSegments: 2
      }) : new $r(x), _) {
        const w = S.getAttribute("uv");
        for (let I = 0; I < w.count; I++) w.setXY(I, w.getX(I) / 8, w.getY(I) / 8);
      }
      a.set(M, S);
    }
    const y = new vt(S, i(f));
    return y.position.set(...g), y.castShadow = !0, y.receiveShadow = !0, u.add(y), y;
  }
  function h(u) {
    u.updateMatrixWorld(!0);
    const v = u.matrixWorld.clone().invert(), f = new _s(), g = /* @__PURE__ */ new Map();
    u.traverse((_) => {
      if (!(_ instanceof vt) || Array.isArray(_.material)) return;
      const M = (_.geometry.index ? _.geometry.toNonIndexed() : _.geometry.clone()).applyMatrix4(f.multiplyMatrices(v, _.matrixWorld)), S = `${_.material.uuid}/${_.castShadow}/${_.receiveShadow}`;
      let y = g.get(S);
      y || (y = {
        material: _.material,
        castShadow: _.castShadow,
        receiveShadow: _.receiveShadow,
        geometries: []
      }, g.set(S, y)), y.geometries.push(M);
    }), u.clear();
    const b = [];
    for (const { material: _, castShadow: M, receiveShadow: S, geometries: y } of g.values()) {
      const x = $s(y);
      if (y.forEach((I) => I.dispose()), !x) throw new Error("expedition_geometry_merge");
      const w = new vt(x, _);
      w.castShadow = M, w.receiveShadow = S, u.add(w), b.push(x);
    }
    return () => {
      u.clear(), b.forEach((_) => _.dispose());
    };
  }
  return {
    mesh: l,
    group: r,
    ring: c,
    shape: d,
    material: i,
    bake: h,
    geometries: s,
    dispose() {
      Object.values(s).forEach((u) => u.dispose()), a.forEach((u) => u.dispose()), o.forEach((u) => u.dispose()), n.forEach((u) => u.dispose());
    }
  };
}
function ri(e, t, s, a) {
  const n = Wa[s], o = K.arena, { mesh: i, group: l, ring: r } = e, c = (f, g, b, _ = n.stone) => i(f, "box", _, g, b);
  function d(f, g, b, _ = !0) {
    const M = l(t, [
      f,
      0,
      g
    ]);
    c(M, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), c(M, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), c(M, [
      0.91,
      b,
      0.91
    ], [
      0,
      b / 2 + 0.6,
      0
    ]);
    for (const S of [-0.38, 0.38]) c(M, [
      0.08,
      b - 0.35,
      0.12
    ], [
      S,
      b / 2 + 0.6,
      0.48
    ], n.light);
    return c(M, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      b + 0.6,
      0
    ], n.light), c(M, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      b + 0.85,
      0
    ], n.dark), _ && (i(M, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      b + 1.24,
      0
    ]), c(M, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      b - 0.15,
      0.52
    ], n.trim)), M;
  }
  function h(f, g, b, _) {
    d(f - b / 2, g, _ - 2), d(f + b / 2, g, _ - 2);
    const M = l(t, [
      f,
      _ - 2,
      g
    ]);
    i(M, "arch", n.light, [
      b / 2,
      2.3,
      1.15
    ]);
    for (let S = 1; S < 10; S++) {
      const y = S / 10 * Math.PI, x = c(M, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(y) * b * 0.49,
        Math.sin(y) * 2.25,
        0.59
      ], n.trim);
      x.rotation.z = y - Math.PI / 2;
    }
    c(M, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function u(f, g, b = 1) {
    const _ = l(t, [
      f,
      0,
      g
    ]);
    _.scale.setScalar(b);
    for (let M = 0; M < 5; M++) {
      const S = M * 2.4, y = i(_, "rock", M % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + M % 2 * 0.3,
        0.45
      ], [
        Math.cos(S) * 0.4,
        0.5,
        Math.sin(S) * 0.4
      ]);
      y.rotation.z = Math.sin(S) * 0.4;
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
  function v(f, g, b) {
    const _ = l(t, [
      f,
      0,
      g
    ]);
    _.scale.setScalar(b);
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
    for (let S = 0; S < 6; S++) {
      const y = S * 2.4;
      i(_, "rock", S % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(y) * 0.95,
        3 + Math.sin(y) * 0.5,
        Math.sin(y) * 0.85
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
  for (let f = 0; f < 16; f++) c(t, [
    3 + f % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(f * 7) * 32,
    -3.92,
    Math.cos(f * 3) * 25
  ], n.haze);
  c(t, [
    o * 2 + 2.4,
    2.4,
    o * 2 + 2.4
  ], [
    0,
    -1.5,
    0
  ], n.dark), c(t, [
    o * 2 + 1.1,
    0.42,
    o * 2 + 1.1
  ], [
    0,
    -0.42,
    0
  ], n.trim), c(t, [
    o * 2 + 0.5,
    0.35,
    o * 2 + 0.5
  ], [
    0,
    -0.14,
    0
  ], n.floor);
  for (let f = -10; f <= 10; f += 2) for (let g = -10; g <= 10; g += 2) c(t, [
    1.96,
    0.045,
    1.96
  ], [
    f,
    0.025,
    g
  ], (f * 3 + g + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    r(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), r(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), r(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let f = 0; f < 8; f++) {
      const g = f * Math.PI / 4, b = c(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(g) * 5.04,
        0.065,
        Math.sin(g) * 5.04
      ], n.trim);
      b.rotation.y = -g + Math.PI / 2;
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
      const f = [];
      for (let b = 0; b < (s === 2 ? 24 : 16); b++) {
        const _ = b * Math.PI * 2 / (s === 2 ? 24 : 16), M = b % 2 ? 0.85 : s === 2 ? 2.6 : b % 4 ? 1.8 : 3.2;
        f.push([Math.cos(_) * M, Math.sin(_) * M]);
      }
      const g = e.shape(t, f, n.seam, [
        0,
        0.061,
        0
      ]);
      g.rotation.x = -Math.PI / 2, r(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const f of [-1, 1]) for (let g = 0; g < 4; g++) {
    const b = f * (7 + g % 2), _ = -7 + g * 4, M = c(t, [
      0.035,
      0.016,
      0.55 + g * 0.1
    ], [
      b,
      0.055,
      _
    ], n.seam);
    M.rotation.y = g * 1.3;
    const S = c(t, [
      0.028,
      0.015,
      0.3
    ], [
      b + 0.1,
      0.055,
      _ + 0.3
    ], n.seam);
    S.rotation.y = g * 1.3 + 0.8;
  }
  for (const f of [-o - 0.35, o + 0.35]) {
    c(t, [
      0.38,
      0.18,
      o * 2 + 1
    ], [
      f,
      0.08,
      0
    ], n.light);
    for (let g = -10; g <= 10; g += 5) d(f + Math.sign(f) * 0.5, g, g === -10 ? 3.6 : 1.35);
  }
  for (let f = 0; f < 6; f++) c(t, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - f * 0.26,
    o + 0.65 + f * 0.8
  ], f % 2 ? n.stone : n.light);
  h(0, -o - 3, 8, 6.3);
  for (const f of [-1, 1]) {
    c(t, [
      5,
      3.2,
      1.9
    ], [
      f * 8.4,
      1.45,
      -o - 3
    ], n.dark), c(t, [
      5.5,
      0.3,
      2.3
    ], [
      f * 8.4,
      3.2,
      -o - 3
    ], n.light);
    const g = l(t, [
      f * 5.8,
      4.8,
      -o - 2.9
    ]);
    c(g, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let b = 0; b < 5; b++) c(g, [
      0.35,
      2.6 - Math.abs(b - 2) * 0.12,
      0.08
    ], [
      (b - 2) * 0.34,
      -1.35,
      Math.sin(b * 2) * 0.08
    ], b % 2 ? n.foliage : n.dark);
    if (c(g, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), s < 3) {
      for (let b = 0; b < 4; b++) u(f * (12.8 + b % 2), -9 + b * 5, 0.8 + b * 0.1);
      v(f * 15, -13, 1.5), v(f * 17, 1, 1.7);
    } else if (s === 3) for (let b = 0; b < 3; b++) {
      const _ = l(t, [
        f * 15,
        0,
        -9 + b * 7
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
      ]), c(_, [
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
        f * (13.5 + _ % 2),
        1.2,
        -9 + _ * 4
      ]).rotation.z = f * -0.2;
      const b = l(t, [
        f * 17,
        0,
        -13
      ]);
      c(b, [
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
      for (let _ = 0; _ < 4; _++) {
        const M = l(t, [
          f * 14,
          0,
          -10 + _ * 6
        ]);
        c(M, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let S = 0; S < 3; S++) {
          c(M, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + S,
            0
          ], n.trim);
          for (let y = 0; y < 5; y++) c(M, [
            0.27,
            0.65 + y % 2 * 0.12,
            0.6
          ], [
            -0.85 + y * 0.4,
            1.2 + S,
            0.1
          ], y % 2 ? n.foliage : n.stone);
        }
      }
      const b = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        f * 18,
        6.2,
        -13
      ]);
      b.rotation.y = f * 0.3;
    }
    c(t, [
      7,
      1.4,
      18
    ], [
      f * 17,
      -0.7,
      -3
    ], n.dark), c(t, [
      6.7,
      0.1,
      17.7
    ], [
      f * 17,
      0.06,
      -3
    ], n.seam);
    for (const b of [-3.5, 3.5]) c(t, [
      0.22,
      0.25,
      18.2
    ], [
      f * 17 + b,
      0.13,
      -3
    ], n.stone);
    c(t, [
      9,
      1.8,
      10
    ], [
      f * 15,
      -0.9,
      -17
    ], n.dark), c(t, [
      8.7,
      0.1,
      9.7
    ], [
      f * 15,
      0.06,
      -17
    ], n.seam);
  }
  for (let f = 0; f < 7; f++) {
    const g = (f - 3) * 8, b = -26 - f % 3 * 6, _ = 7 + f * 5 % 7;
    if (c(t, [
      5.2,
      _,
      5.5
    ], [
      g,
      _ / 2 - 3,
      b
    ], n.stone), c(t, [
      5.8,
      0.4,
      6
    ], [
      g,
      _ - 3,
      b
    ], n.light), s === 1) {
      const M = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        g,
        _ - 0.8,
        b
      ]);
      M.rotation.z = 0.9;
    } else if (s === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      g,
      _ - 0.8,
      b
    ]);
    else if (s === 3) {
      for (const M of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + f % 2 * 2,
        0.7
      ], [
        g + M,
        _ - 1,
        b
      ]);
      c(t, [
        3.8,
        0.25,
        4
      ], [
        g,
        _ - 2.5,
        b
      ], n.trim);
    } else if (s === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        g,
        _ - 0.8,
        b
      ]);
      for (const M of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        g + M,
        _ - 3,
        b + 3
      ]);
    } else if (s === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        g,
        _ + 0.7,
        b
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        g,
        _ - 1,
        b
      ]).rotation.x = Math.PI / 2;
    else {
      for (const M of [
        -2,
        0,
        2
      ]) c(t, [
        0.7,
        1.2,
        5.6
      ], [
        g + M,
        _ - 2.35,
        b
      ], n.light);
      f % 2 && v(g + 1, b + 2, 1.5);
    }
    for (const M of [
      -1.5,
      0,
      1.5
    ]) c(t, [
      0.5,
      2.8,
      0.12
    ], [
      g + M,
      _ - 5.6,
      b + 2.8
    ], n.dark);
  }
  for (const f of a?.obstacles ?? []) {
    const g = l(t, [
      f.x,
      0,
      f.y
    ]);
    i(g, "cylinder", n.dark, [
      f.radius,
      0.22,
      f.radius
    ], [
      0,
      0.11,
      0
    ]), i(g, "cylinder", n.stone, [
      f.radius * 0.85,
      1.15,
      f.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(g, "cylinder", n.light, [
      f.radius,
      0.2,
      f.radius
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
    for (let b = 0; b < 6; b++) {
      const _ = b * Math.PI / 3;
      c(g, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(_) * f.radius * 0.86,
        0.8,
        Math.sin(_) * f.radius * 0.86
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
    ]), r(t, n.trim, 1.68, 0, -8, 1, !1, 0.28);
    for (const f of [-1, 1]) {
      u(f * 3, -8, 1.2), u(f * 4, -10, 0.85);
      const g = l(t, [
        f * 2.6,
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
function oi(e, t, s) {
  const a = e.group(t, [
    0,
    1.3,
    0
  ]);
  a.scale.setScalar(1.5);
  const n = e.group(a), o = e.group(a, [
    0,
    0.5,
    0
  ]), i = e.group(o), l = s === "female", r = l ? 0.225 : 0.255, c = ot.traveler.fabric, d = "#574a40", h = "#d7ab8b", u = "#463f3b";
  e.mesh(n, "sphere", c, [
    r,
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
  ]), e.mesh(n, "cylinder", d, [
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
  ]), e.mesh(o, "sphere", h, [
    l ? 0.161 : 0.172,
    0.22,
    0.165
  ]), e.mesh(i, "sphere", u, [
    0.18,
    0.125,
    0.173
  ], [
    0,
    0.135,
    -0.022
  ]);
  for (const M of [-1, 1])
    e.mesh(o, "sphere", h, [
      0.027,
      0.042,
      0.027
    ], [
      M * 0.166,
      -0.01,
      0
    ]), e.mesh(o, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      M * 0.061,
      0.016,
      0.155
    ]), e.mesh(o, "box", u, [
      0.047,
      0.012,
      0.014
    ], [
      M * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", u, [
      0.035,
      0.12,
      0.08
    ], [
      M * 0.157,
      0.035,
      -0.036
    ]);
  if (e.mesh(o, "sphere", h, [
    0.027,
    0.041,
    0.028
  ], [
    0,
    -0.025,
    0.16
  ]), e.mesh(o, "box", "#a86e60", [
    0.045,
    9e-3,
    0.012
  ], [
    0,
    -0.1,
    0.148
  ]), l) {
    const M = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let S = 0; S < 4; S++) e.mesh(M, "sphere", u, [
      0.064 - S * 9e-3,
      0.09,
      0.063 - S * 8e-3
    ], [
      S % 2 ? 0.014 : -0.014,
      -S * 0.115,
      0
    ]);
    e.mesh(M, "box", c, [
      0.066,
      0.032,
      0.066
    ], [
      0,
      -0.33,
      0
    ]);
  }
  const v = [], f = [];
  for (const M of [-1, 1]) {
    const S = e.group(a, [
      M * r,
      0.12,
      0
    ]);
    v.push(S), e.mesh(S, "cylinder", c, [
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
    ]), e.mesh(S, "cylinder", h, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(S, "sphere", h, [
      0.06,
      0.075,
      0.047
    ], [
      0,
      -0.45,
      0.015
    ]);
    const y = e.group(a, [
      M * 0.105,
      -0.32,
      0
    ]);
    f.push(y), e.mesh(y, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(y, "cylinder", d, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(y, "sphere", d, [
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
    o,
    i,
    ...v,
    ...f
  ].map((M) => e.bake(M));
  o.add(i);
  const b = [];
  a.traverse((M) => {
    M instanceof vt && M.material === e.material(c) && b.push(M);
  });
  let _ = null;
  return {
    body: a,
    hand: e.group(v[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(M) {
      if (M !== _) {
        _ = M;
        for (const S of b) S.material = e.material(ot[M].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(ot[M].head);
      }
    },
    pose(M, S, y, x, w, I) {
      a.position.y = 1.3 + y, a.rotation.set(!w && x ? 0.16 : 0, Math.PI / 2 - M, 0), f.forEach((N, j) => {
        N.rotation.x = (j ? -1 : 1) * S;
      }), v.forEach((N, j) => {
        N.rotation.set(j && I ? -0.55 : (j ? 1 : -1) * S * 0.65, 0, (j ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      g.forEach((M) => M()), a.removeFromParent();
    }
  };
}
function ii(e, t, s) {
  const a = ot[s], { mesh: n, group: o, shape: i } = e, l = o(t, [
    0,
    0.2,
    -0.23
  ]), r = o(t, [
    0,
    0.328,
    0
  ]), c = o(t, [
    0,
    0.55,
    0
  ]);
  r.scale.set(0.64, 0.78, 0.72);
  const d = a.silhouette === "robe" || a.silhouette === "coat";
  if (i(l, [
    [-0.23, 0],
    [0.23, 0],
    [0.38, d ? -0.68 : -0.48],
    [0.1, d ? -0.77 : -0.59],
    [-0.36, d ? -0.68 : -0.5]
  ], a.fabric), i(l, [
    [-0.04, -0.08],
    [0.04, -0.08],
    [0.055, d ? -0.61 : -0.45],
    [0, d ? -0.68 : -0.5],
    [-0.05, d ? -0.61 : -0.45]
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
  } else d && (n(t, "cone", a.fabric, [
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
    n(r, "sphere", a.metal, [
      0.31,
      0.13,
      0.265
    ], [
      0,
      0.44,
      -0.015
    ], !1, 1, !0);
    for (const h of [-1, 1]) n(r, "box", a.metal, [
      0.065,
      0.22,
      0.17
    ], [
      h * 0.285,
      0.29,
      -0.02
    ], !1, 1, !0);
  } else if (a.head === "hat")
    n(r, "cylinder", a.fabric, [
      0.43,
      0.045,
      0.32
    ], [
      0,
      0.46,
      0
    ]), n(r, "cone", a.fabric, [
      0.23,
      0.48,
      0.23
    ], [
      0.055,
      0.7,
      -0.02
    ]).rotation.z = -0.18, n(r, "torus", a.metal, [
      0.245,
      0.245,
      0.24
    ], [
      0,
      0.52,
      -0.01
    ]).rotation.x = Math.PI / 2;
  else if (a.head === "hood") {
    n(r, "sphere", a.fabric, [
      0.345,
      0.35,
      0.265
    ], [
      0,
      0.22,
      -0.12
    ]);
    for (const h of [-1, 1]) n(r, "sphere", a.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      h * 0.285,
      0.19,
      0.055
    ]);
  } else if (a.head === "crown") {
    n(r, "torus", a.metal, [
      0.28,
      0.28,
      0.28
    ], [
      0,
      0.48,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let h = 0; h < 5; h++) {
      const u = h * Math.PI * 2 / 5;
      n(r, "cone", a.metal, [
        0.045,
        0.2,
        0.045
      ], [
        Math.sin(u) * 0.27,
        0.57,
        Math.cos(u) * 0.27
      ]);
    }
  } else if (a.head === "horns") for (const h of [-1, 1]) {
    const u = o(r, [
      h * 0.26,
      0.5,
      -0.06
    ]);
    u.rotation.z = h * -0.45, n(u, "cylinder", a.metal, [
      0.035,
      0.44,
      0.03
    ], [
      0,
      0.18,
      0
    ]);
    for (const v of [0.16, 0.3]) n(u, "cone", a.metal, [
      0.025,
      0.22,
      0.025
    ], [
      h * 0.06,
      v,
      0
    ]).rotation.z = h * -0.8;
  }
  else if (a.head === "goggles") {
    n(r, "torus", "#4c4a42", [
      0.32,
      0.22,
      0.27
    ], [
      0,
      0.4,
      0
    ]).rotation.x = Math.PI / 2;
    for (const h of [-1, 1])
      n(r, "torus", a.metal, [
        0.095,
        0.075,
        0.05
      ], [
        h * 0.115,
        0.39,
        0.24
      ]), n(r, "sphere", a.glow, [
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
      n(r, "cone", a.fabric, [
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
      n(r, "crescent", a.metal, [
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
      n(r, "cone", a.glow, [
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
      n(c, "torus", a.metal, [
        0.43,
        0.43,
        0.43
      ], [
        0,
        0.16,
        0
      ], !1, 1, !0).rotation.x = 0.6;
      for (let h = 0; h < 3; h++) {
        const u = h * Math.PI * 2 / 3;
        n(c, "rock", a.glow, [
          0.04,
          0.075,
          0.04
        ], [
          Math.cos(u) * 0.47,
          0.16,
          Math.sin(u) * 0.47
        ]);
      }
      break;
    case "traveler":
      break;
  }
  return {
    cape: l,
    animate(h, u) {
      c.rotation.y = u ? 0.4 : h * 0.014;
    }
  };
}
function li(e, t, s, a, n, o) {
  const { mesh: i, group: l, shape: r } = e, c = "#d6b881", d = "#fff0c1", h = (u, v, f) => {
    for (const g of [-1, 1]) i(s, "sphere", d, [
      0.09,
      0.055,
      0.06
    ], [
      g * f,
      u,
      v
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
      for (let u = 0; u < 7; u++) {
        const v = u * Math.PI * 2 / 7, f = l(t, [
          Math.cos(v) * 0.8,
          2.6,
          Math.sin(v) * 0.6
        ]);
        f.rotation.z = Math.cos(v) * 0.8, i(f, "cone", "#526451", [
          0.18,
          2.4,
          0.18
        ], [
          0,
          0.9,
          0
        ]), i(f, "rock", o.foliage, [
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
          Math.cos(v),
          0.28,
          Math.sin(v)
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
      for (const u of [
        1.35,
        1.8,
        2.25
      ]) i(a, "torus", c, [
        u,
        u,
        u
      ], [
        0,
        2.2,
        0
      ], !1, 1, !0).rotation.set(u * 0.7, 0.5, u);
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
      ]), h(3.25, 0.63, 0.18), i(s, "cone", c, [
        0.18,
        0.55,
        0.15
      ], [
        0,
        3.03,
        0.76
      ]).rotation.x = Math.PI / 2;
      for (const u of [-1, 1]) {
        for (let v = 0; v < 5; v++) r(a, [
          [0, 0],
          [u * (2.4 - v * 0.25), 0.95 - v * 0.22],
          [u * (2 - v * 0.24), -0.1 - v * 0.24],
          [0, -0.45]
        ], v % 2 ? "#e2a465" : "#d47c4f", [
          u * 0.4,
          2.5,
          -0.1 - v * 0.06
        ]);
        i(t, "cone", "#e3a25b", [
          0.18,
          1.5,
          0.25
        ], [
          u * 0.3,
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
      for (const u of [-1, 1])
        i(t, "cylinder", o.dark, [
          0.36,
          0.8,
          0.38
        ], [
          u * 0.55,
          0.5,
          0
        ]), i(t, "sphere", "#c9976e", [
          0.65,
          0.55,
          0.55
        ], [
          u * 1.05,
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
      for (const u of [-1, 1])
        i(t, "box", "#818883", [
          0.8,
          1.2,
          0.95
        ], [
          u * 0.8,
          0.6,
          0
        ]), i(a, "cylinder", "#6b7375", [
          0.65,
          2.1,
          0.65
        ], [
          u * 1.75,
          1.85,
          0
        ]), i(a, "box", "#b29370", [
          1.1,
          0.8,
          1.1
        ], [
          u * 1.75,
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
      for (let u = -2; u <= 2; u++) i(s, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(u) * 0.08,
        0.11
      ], [
        u * 0.18,
        3.94,
        0.02
      ]);
      for (const u of [-1, 1]) r(t, [
        [0, 0],
        [u * 0.95, 0.8],
        [u * 0.5, -1.3],
        [0, -0.5]
      ], "#bddeeb", [
        u * 0.5,
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
      for (let u = 0; u < 5; u++) {
        const v = 1 - u * 0.14;
        i(t, "sphere", u % 2 ? "#658c9c" : "#7da9b8", [
          v,
          v * 0.8,
          v
        ], [
          Math.sin(u * 0.6) * 0.4,
          0.8,
          0.5 - u * 0.8
        ]), i(t, "cone", "#d7e9dc", [
          0.2 * v,
          0.6 * v,
          0.25 * v
        ], [
          0,
          1.5 - u * 0.13,
          0.4 - u * 0.7
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
      for (const u of [-1, 1])
        r(a, [
          [0, 0],
          [u * 1.4, 0.1],
          [u * 0.8, -0.7]
        ], "#b6d6d8", [
          u * 0.7,
          0.7,
          0
        ]), i(s, "cone", "#e4efde", [
          0.15,
          1,
          0.15
        ], [
          u * 0.72,
          1.65,
          1.2
        ]).rotation.z = u * -0.7;
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
      for (let u = 0; u < 5; u++) {
        const v = u * Math.PI * 2 / 5, f = l(a, [
          Math.cos(v) * 1.7,
          2.5 + Math.sin(v) * 0.6,
          Math.sin(v) * 1.3
        ]);
        f.rotation.z = v * 0.3, i(f, "box", "#baa481", [
          0.55,
          0.72,
          0.14
        ]), i(f, "box", "#f1e4c6", [
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
      ]), h(3, 0.4, 0.17);
      for (const u of [-1, 1]) {
        i(t, "box", "#867995", [
          0.33,
          0.9,
          0.4
        ], [
          u * 0.3,
          0.55,
          0
        ]), i(t, "rock", "#b8afcc", [
          0.5,
          0.28,
          0.38
        ], [
          u * 0.6,
          2.4,
          0
        ]);
        const v = l(a, [
          u * 0.85,
          1.8,
          0.2
        ]);
        v.rotation.z = u * -0.25, r(v, [
          [-0.07, 0],
          [0.15, 0],
          [0.3, 1.5],
          [0.12, 2.25],
          [-0.13, 1.7]
        ], "#dfc9ff");
      }
      r(t, [
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
function ci(e, t) {
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
  ], o = e.shape(a, n, Oe.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, Oe.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, Oe.enamel, [
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
    ], Oe.silver, [
      0,
      0,
      c
    ]), e.mesh(a, "rock", Oe.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      c + Math.sign(c) * 0.014
    ], !1, 1, !0);
  let l = 0, r = -1;
  return s.visible = !1, { update(c, d, h, u, v) {
    const f = d ? 1 : 0, g = Math.max(0, Math.min(4, u - r));
    l = v || r < 0 || u < r ? f : l + (f - l) * (1 - Math.exp(-g * 0.85)), r = u, s.visible = c === "blade" || d || l > 0.04, s.position.set(-0.4 + l * 0.12, -0.1 + l * 0.3, 0.17 + l * 0.25), s.rotation.set(0.12 - l * 0.22, 0.15 - l * 0.3, -0.16 + l * 0.22), a.scale.setScalar(0.94 + l * 0.07), o.material = e.material(h ? Oe.parry : c === "blade" ? Oe.block : Oe.ward, !1, 1, !0), i.material = e.material(d ? "#617f99" : Oe.enamel);
  } };
}
function ui(e, t) {
  const s = e.group(t), a = new Sr({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new Cn(Oe.ward) },
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
    update(o, i) {
      s.visible = !!o && o.ward > 0, !(!o || !s.visible) && (s.position.set(o.x, 0, o.y), a.uniforms.impact.value = i, s.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), s.removeFromParent();
    }
  };
}
function di(e, t) {
  const s = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  s.rotation.set(-0.45, 0, -0.2);
  for (const d of [-1, 1]) {
    const h = e.group(s);
    e.mesh(h, "box", Je.cover, [
      0.25,
      0.055,
      0.44
    ], [
      d * 0.125,
      0,
      0
    ]), e.mesh(h, "box", Je.page, [
      0.22,
      0.06,
      0.38
    ], [
      d * 0.12,
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
  const o = e.mesh(s, "rock", Je.empowered, [
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
  let l = 0, r = 0.15, c = -1;
  return { update(d, h, u, v) {
    const f = v || c < 0 || u < c ? 1 : 1 - Math.exp(-Math.min(4, u - c) * 0.5);
    c = u, l += ((d ? 1 : 0) - l) * f, r += ((h ? 0.5 : d ? 0.28 : 0.15) - r) * f, s.position.y = r, s.rotation.x = -0.45 + (r - 0.15) * 0.7, a[0].rotation.z = -0.65 + l * 0.5, a[1].rotation.z = 0.65 - l * 0.5, n.rotation.z = v ? 0.2 : 0.2 + l * (Math.sin(u * 0.18) + 1) * 1.3, o.scale.set(0.07 + l * 0.025, 0.1 + l * 0.06, 0.07 + l * 0.025), i.visible = d, v || (o.rotation.y = u * 0.08);
  } };
}
function hi() {
  let e = null, t = 0, s = -1 / 0, a = 0, n = 0;
  function o() {
    e = null, s = -1 / 0, a = 0, n = 0;
  }
  return {
    reset: o,
    get active() {
      return n > 0;
    },
    update(i, l, r) {
      (l < t || !i || r) && o();
      const c = e ? Math.min(0.1, l - t) : 0;
      i && e && Math.hypot(i.x - e.x, i.y - e.y) > 1e-3 && (s = l);
      const d = !r && l - s <= 2 / K.hz, h = n > 0;
      n += ((d ? 1 : 0) - n) * (1 - Math.exp(-c * (d ? 14 : 18))), !d && n < 1e-3 ? (n = 0, a = 0) : h && (a = (a + c * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = i ? {
        x: i.x,
        y: i.y
      } : null, t = l;
      const u = Math.sin(a);
      return {
        stride: u * 0.45 * n,
        lift: u * u * 0.035 * n,
        amount: n
      };
    }
  };
}
function ar(e, t, s = 1) {
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
function nr(e, t, s) {
  const a = e.group(t), n = oi(e, a, s), o = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), l = e.group(o), r = n.hand, c = e.group(l), d = ci(e, l), h = hi();
  let u = null, v = -1, f = Math.PI / 2, g = null, b = null, _ = null;
  function M(S, y) {
    if (!(S === b && y === _)) {
      if (b = S, _ = y, c.clear(), r.clear(), u = null, g = ii(e, c, _), n.dress(_), b === "blade")
        e.mesh(r, "cylinder", "#624d42", [
          0.035,
          0.28,
          0.035
        ], [
          0,
          -0.08,
          0.06
        ]), e.mesh(r, "box", "#d4b470", [
          0.32,
          0.05,
          0.11
        ], [
          0,
          0.07,
          0.06
        ], !1, 1, !0), e.shape(r, [
          [-0.07, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83],
          [-0.07, 0.65]
        ], "#f5f8ef", [
          0,
          0,
          0.07
        ], 0.018), e.shape(r, [
          [0, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83]
        ], "#9cc6ce", [
          0,
          0,
          0.094
        ]);
      else if (b === "bow") ar(e, r);
      else if (b === "staff")
        e.mesh(r, "cylinder", "#796889", [
          0.035,
          1.12,
          0.035
        ], [
          0,
          0.18,
          0.04
        ]), e.mesh(r, "torus", "#d8bc80", [
          0.19,
          0.24,
          0.18
        ], [
          0,
          0.85,
          0.04
        ], !1, 1, !0), e.mesh(r, "rock", "#b9ecff", [
          0.11,
          0.18,
          0.1
        ], [
          0,
          0.85,
          0.04
        ]);
      else if (b === "daggers") for (const x of [-1, 1]) {
        const w = e.group(r, [
          x < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(w, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(w, [
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
      else if (b === "grimoire") u = di(e, r);
      else if (b === "cannon") {
        const x = e.group(r, [
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
        ], !1, 1, !0).rotation.x = Math.PI / 2, e.mesh(r, "box", "#906749", [
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
    update(S, y, x, w, I, N, j, P = !1) {
      M(y, x), d.update(y, !!S?.shield, !!S?.guard, w, N);
      const Z = N || v < 0 || w < v ? 1 : 1 - Math.exp(-Math.min(4, w - v) * 0.65);
      v = w;
      const E = j ? Math.PI / 2 + 0.23 : S?.facing ?? Math.PI / 2;
      f += Math.atan2(Math.sin(E - f), Math.cos(E - f)) * Z;
      const B = h.update(j ? null : S, I, N), q = !!S?.dashTime;
      a.position.set(S?.x ?? 0, j ? 0.3 : 0, S?.y ?? -8), a.scale.setScalar(j ? 1.65 : 1), n.pose(f, B.stride, B.lift, q, N, !!S?.swing || P), g.cape.rotation.x = N ? -0.15 : -0.21 - B.amount * 0.44 - Math.sin(w * 0.15) * 0.12, g.animate(w, N);
      const F = S?.swing && !N ? Math.sin(S.swing / (y === "cannon" ? 16 : 9) * Math.PI) : 0;
      r.rotation.z += ((P ? -0.3 : -0.2 - F * 1.3) - r.rotation.z) * Z, r.rotation.x += ((P ? -0.25 : 0.1 + F * 0.6) - r.rotation.x) * Z, u && u.update(!!S?.resonance, P, w, N), i.scale.set(0.6 + (q ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function On(e, t, s, a) {
  const { mesh: n, group: o } = e, i = o(t), l = o(i), r = o(l), c = o(l), d = [], h = xe(s), u = de[s].radius;
  e.ring(i, "#1d3540", u * 1.15, 0, 0, 0.16, !0);
  const v = "#cfad70", f = "#fff0b0", g = a.dark;
  function b(P, Z, E) {
    const B = o(l, [
      P,
      E,
      Z
    ]);
    n(B, "box", g, [
      0.32,
      E,
      0.42
    ], [
      0,
      -E / 2,
      0
    ]), n(B, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -E + 0.11,
      0.1
    ]), d.push(B);
  }
  function _(P, Z, E = "#d9e8df") {
    n(P, "box", v, [
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
    ]), n(P, "box", E, [
      0.2,
      Z,
      0.13
    ], [
      0,
      Z / 2 + 0.35,
      0
    ], !1, 1, !0), n(P, "cone", E, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      Z + 0.5,
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
    ]), n(c, "rock", g, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const P of [-0.27, 0.27]) {
      const Z = n(c, "cone", v, [
        0.15,
        0.7,
        0.15
      ], [
        P,
        1.15,
        0.9
      ]);
      Z.rotation.x = 0.55, n(c, "sphere", f, [
        0.05,
        0.04,
        0.06
      ], [
        P,
        0.82,
        1.02
      ], !0), b(P, -0.42, 0.45), b(P, 0.45, 0.45);
    }
    for (let P = 0; P < 3; P++) n(l, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + P * 0.4
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
    ]), n(c, "sphere", g, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const P = n(c, "crescent", v, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    P.rotation.z = 0.87;
    for (const Z of [-0.23, 0.23]) n(c, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      Z,
      4.08,
      0.45
    ], !0);
    for (const Z of [-1, 1]) {
      const E = o(l, [
        Z * 0.8,
        3.3,
        0
      ]);
      E.rotation.z = Z * 0.65, n(E, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(E, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), d.push(E);
    }
    for (let Z = 0; Z < 5; Z++) {
      const E = Z / 5 * Math.PI * 2, B = n(r, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(E) * 1.95,
        3.3 + Math.sin(E) * 1.1,
        -0.3
      ]);
      B.rotation.z = E;
    }
  } else if (s === "king") {
    b(-0.5, 0, 0.8), b(0.5, 0, 0.8), n(l, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(l, "box", g, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(l, "rock", v, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const P of [-1, 1]) n(l, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      P * 0.95,
      2.95,
      0
    ]);
    n(c, "sphere", g, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(c, "box", f, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(c, "torus", v, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let P = 0; P < 7; P++) {
      const Z = P * Math.PI * 2 / 7;
      n(c, "cone", v, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(Z) * 0.78,
        4.85,
        Math.sin(Z) * 0.78
      ]);
    }
    r.position.set(1.55, 1.35, 0.2), r.rotation.z = -0.3, _(r, 3.4, "#f6dc9f"), n(l, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (s === "warden") {
    b(-0.65, 0.05, 0.85), b(0.65, 0.05, 0.85), n(l, "cylinder", g, [
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
    for (const Z of [-1, 1])
      n(l, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        Z * 1.03,
        2.7,
        0
      ]), n(l, "box", v, [
        0.7,
        0.1,
        0.8
      ], [
        Z * 1.08,
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
    ]), n(c, "box", g, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(c, "box", f, [
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
    const P = o(l, [
      -1.32,
      1.5,
      0.6
    ]);
    n(P, "box", g, [
      1.2,
      1.8,
      0.25
    ]), n(P, "box", v, [
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
    ]), r.position.set(1.5, 1.8, 0.25), n(r, "cylinder", "#766450", [
      0.1,
      2.5,
      0.1
    ]), n(r, "box", g, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(r, "box", v, [
      0.24,
      0.96,
      0.94
    ], [
      0,
      1.4,
      0
    ], !1, 1, !0), n(r, "box", a.light, [
      0.22,
      0.77,
      0.74
    ], [
      0.65,
      1.4,
      0
    ]);
  } else if (xe(s)) li(e, l, c, r, s, a);
  else if (s === "wisp")
    n(l, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(c, "torus", v, [
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
    for (const P of [-1, 1])
      b(P * 0.27, -0.25, 0.35), n(c, "cone", v, [
        0.09,
        0.35,
        0.09
      ], [
        P * 0.21,
        1.09,
        0.42
      ]), n(c, "sphere", f, [
        0.05,
        0.04,
        0.035
      ], [
        P * 0.15,
        0.8,
        0.77
      ], !0), n(r, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        P * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (s === "bomber")
    b(-0.22, 0, 0.45), b(0.22, 0, 0.45), n(l, "sphere", "#85654c", [
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
    ]), n(r, "sphere", "#404c57", [
      0.25,
      0.25,
      0.25
    ], [
      0.56,
      1.1,
      0.18
    ]), n(r, "cone", "#ffca88", [
      0.07,
      0.3,
      0.07
    ], [
      0.56,
      1.41,
      0.18
    ]);
  else {
    const P = s === "priest", Z = s === "guard";
    if (P ? n(l, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (b(-0.22, 0, 0.5), b(0.22, 0, 0.5), n(l, "box", g, [
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
    ]), n(c, "box", g, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(c, "box", f, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), P)
      n(c, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), r.position.set(0.52, 1, 0.1), n(r, "cylinder", v, [
        0.04,
        1.6,
        0.04
      ]), n(r, "rock", "#d1dcff", [
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
      for (const E of [-1, 1]) n(l, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        E * 0.45,
        1.22,
        0
      ]);
      r.position.set(0.54, 1, 0.2), s === "archer" ? ar(e, r, 1.3) : (r.rotation.z = -0.3, _(r, 0.75)), Z && (n(l, "box", v, [
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
  const M = o(i, [
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
  const S = n(M, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), y = [];
  l.traverse((P) => {
    P instanceof vt && y.push({
      mesh: P,
      material: P.material
    });
  });
  let x = 0, w = -100, I = 0, N = 0;
  const j = r.rotation.z;
  return {
    root: i,
    bar: M,
    update(P, Z, E) {
      const B = Math.abs(P.x - I) + Math.abs(P.y - N) > 5e-3;
      I = P.x, N = P.y, x && !P.windup && (w = Z), x = P.windup;
      const q = P.windup ? 1 - P.windup / de[P.kind].windup : 0, F = Math.max(0, 1 - (Z - w) / 10);
      i.position.set(P.x, 0, P.y), l.rotation.y = Math.PI / 2 - P.angle, l.position.y = E ? 0 : s === "weaver" || s === "priest" ? 0.13 + Math.sin(Z * 0.055) * 0.1 : B ? Math.abs(Math.sin(Z * 0.3)) * 0.055 : 0, l.rotation.x = E ? 0 : -q * 0.16 + F * 0.2, c.rotation.z = !E && s === "king" ? Math.sin(Z * 0.035) * 0.08 : 0, r.rotation.x = E ? 0 : q * -1.3 + F * 1.4, r.rotation.z = j + (E ? 0 : q * -0.35);
      for (let U = 0; U < d.length; U++) d[U].rotation.x = !E && B ? Math.sin(Z * 0.32 + U * Math.PI) * 0.28 : 0;
      for (const U of y) U.mesh.material = P.marked > 2 && !E ? e.material("#fff6dd") : U.material;
      M.visible = !h && P.hp < P.maxHp, S.scale.x = P.hp / P.maxHp, S.position.x = (P.hp / P.maxHp - 1) * 0.5;
    }
  };
}
var re = {
  danger: "#c34740",
  warning: "#ec8754",
  magic: "#8bd9f2",
  frost: "#addffc",
  gold: "#fff0bb",
  heal: "#75dbb0",
  fire: "#f0ad55"
};
function fi(e, t) {
  const s = /* @__PURE__ */ new Map();
  function a(o, i, l = 1, r = !1) {
    const c = Math.max(0.1, Math.min(1, Math.round(l * 10) / 10)), d = `${o}/${i}/${c}/${r}`;
    let h = s.get(d);
    h || (h = {
      list: [],
      used: 0
    }, s.set(d, h));
    let u = h.list[h.used++];
    return u || (u = e.mesh(t, o, i, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !r, c), h.list.push(u)), u.visible = !0, u.rotation.set(0, 0, 0), u.scale.set(1, 1, 1), u;
  }
  function n(o, i, l, r, c, d = 1, h = 0.09) {
    const u = a(o, i, d);
    return u.position.set(r, h, c), u.scale.set(l, l, 1), u.rotation.x = -Math.PI / 2, u;
  }
  return { update(o, i) {
    for (const r of s.values())
      r.used = 0, r.list.forEach((c) => c.visible = !1);
    if (!o) return;
    const l = o.player;
    if (n("ring", "#f2f6e2", 0.64, l.x, l.y, 0.8), l.dashTime && !i) for (let r = 1; r <= 3; r++) {
      const c = a("cone", re.gold, 0.7 - r * 0.15);
      c.position.set(l.x - Math.cos(l.dashAngle) * r * 0.43, 0.45, l.y - Math.sin(l.dashAngle) * r * 0.43), c.scale.set(0.13, l.dashTime / 8 * 1.7, 0.13), c.rotation.set(0, -l.dashAngle, -Math.PI / 2);
    }
    if (!o.boss && (o.encounter === "siege" || o.encounter === "ritual")) {
      const r = o.objective;
      o.encounter === "ritual" && (n("disc", re.magic, 2.5, r.x, r.y, 0.12), n("ring", re.magic, 2.5, r.x, r.y), n("ring", re.gold, 2.2, r.x, r.y, 0.8));
      const c = a("cylinder", "#526b79");
      c.position.set(r.x, 0.3, r.y), c.scale.set(0.5, 0.6, 0.5);
      const d = a("rock", o.encounter === "siege" ? re.fire : re.magic);
      if (d.position.set(r.x, 1, r.y), d.scale.set(0.23, 0.5, 0.23), o.encounter === "siege") {
        d.position.y = 1.35, d.scale.set(0.4, 0.85, 0.4);
        const h = a("cone", re.gold, 0.8);
        h.position.set(r.x, 1.4, r.y), h.scale.set(0.2, 0.85, 0.2), n("ring", re.fire, 0.9, r.x, r.y, 0.8);
      }
      i || (d.rotation.y = o.tick * 0.025);
    }
    for (const r of o.companions)
      if (!(r.hp <= 0 || r.life <= 0))
        if (n("ring", re.heal, 0.4, r.x, r.y, 0.8), r.kind === "turret") {
          const c = a("cylinder", "#687c81");
          c.position.set(r.x, 0.25, r.y), c.scale.set(0.4, 0.5, 0.4);
          const d = a("box", "#bd9a68");
          d.position.set(r.x, 0.65, r.y), d.scale.set(0.9, 0.2, 0.25), d.rotation.y = -r.angle;
          const h = a("sphere", re.magic);
          h.position.set(r.x + Math.cos(r.angle) * 0.45, 0.65, r.y + Math.sin(r.angle) * 0.45), h.scale.setScalar(0.11);
        } else {
          const c = r.kind === "familiar" && l.resonance > 0, d = c ? 1.5 : 1, h = r.kind === "shade" ? "#a6acd8" : c ? Je.empowered : Je.familiar, u = i ? 0 : Math.sin(o.tick * 0.1 + r.id) * 0.08, v = a("sphere", h, 1, !0);
          v.position.set(r.x, 0.55 * d + u, r.y), v.scale.set(0.3 * d, 0.36 * d, 0.3 * d);
          for (const g of [-1, 1]) {
            const b = a("cone", h, 1, !0);
            b.position.set(r.x + g * 0.2 * d, 0.93 * d + u, r.y), b.scale.set(0.08 * d, 0.22 * d, 0.08 * d);
          }
          const f = a("sphere", "#35475b");
          if (f.position.set(r.x + Math.cos(r.angle) * 0.28 * d, 0.63 * d + u, r.y + Math.sin(r.angle) * 0.28 * d), f.scale.setScalar(0.07 * d), c) {
            const g = a("torus", Je.crest, 1, !0);
            g.position.set(r.x, 1.45 + u, r.y), g.rotation.x = Math.PI / 2, g.scale.setScalar(0.32);
            for (let b = 0; b < 3; b++) {
              const _ = b * Math.PI * 2 / 3, M = a("rock", Je.crest, 1, !0);
              M.position.set(r.x + Math.cos(_) * 0.32, 1.55 + u, r.y + Math.sin(_) * 0.32), M.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const r of o.enemies) {
      if (xe(r.kind) && r.phase > 1) {
        const c = de[r.kind].radius + 0.55;
        if (n("ring", r.kind === "king" ? re.fire : re.magic, c, r.x, r.y, 0.65), !i) for (let d = 0; d < r.phase + 2; d++) {
          const h = o.tick * 0.025 + d * Math.PI * 2 / (r.phase + 2), u = a("rock", r.kind === "king" ? re.fire : re.magic, 0.8);
          u.position.set(r.x + Math.cos(h) * c, 0.55 + Math.sin(h * 2) * 0.2, r.y + Math.sin(h) * c), u.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (r.windup) {
        const c = 1 - r.windup / de[r.kind].windup;
        if (n("ring", re.warning, de[r.kind].radius + 0.35, r.x, r.y, 0.8), r.kind === "charger") {
          const d = Math.min(9, Math.hypot(r.target.x - r.x, r.target.y - r.y)), h = a("box", re.danger, 0.3);
          h.scale.set(0.75, 0.035, d), h.position.set(r.x + Math.cos(r.angle) * d / 2, 0.09, r.y + Math.sin(r.angle) * d / 2), h.rotation.y = Math.PI / 2 - r.angle, n("ring", re.danger, 0.5, r.target.x, r.target.y, 0.9);
        } else if (r.kind === "archer") {
          const d = Math.hypot(r.target.x - r.x, r.target.y - r.y), h = a("box", re.warning, 0.6);
          h.position.set((r.x + r.target.x) / 2, 0.11, (r.y + r.target.y) / 2), h.scale.set(d, 0.03, 0.09), h.rotation.y = -r.angle;
        } else r.kind === "bomber" ? n("ring", re.warning, 1.9, r.target.x, r.target.y) : (r.kind === "soldier" || r.kind === "guard" || r.kind === "stalker") && (n("disc", re.danger, de[r.kind].reach, r.target.x, r.target.y, 0.15 + c * 0.2), n("ring", re.danger, de[r.kind].reach, r.target.x, r.target.y));
      }
      if (r.chill && n("ring", re.frost, de[r.kind].radius + 0.13, r.x, r.y), r.exposed && n("arc", re.gold, de[r.kind].radius + 0.3, r.x, r.y, 0.9), r.burn && !i) for (let c = 0; c < 3; c++) {
        const d = a("rock", re.fire, 0.8);
        d.position.set(r.x + Math.sin(c * 2) * 0.3, 0.35 + (o.tick + c * 7) % 20 / 18, r.y + Math.cos(c * 2) * 0.3), d.scale.set(0.08, 0.2, 0.08);
      }
      r.kind === "priest" && n("ring", "#a39aca", 3.5, r.x, r.y, 0.4);
    }
    for (const r of o.hazards) {
      const c = r.friendly ? r.kind === "fire" ? re.fire : re.magic : re.danger;
      if (r.kind === "beam") {
        const d = a("box", c, r.wait ? 0.3 : 0.75);
        d.position.set(r.x + Math.cos(r.angle) * r.length / 2, 0.11, r.y + Math.sin(r.angle) * r.length / 2), d.scale.set(r.length, 0.04, r.width * 2), d.rotation.y = -r.angle;
        for (const h of [0, r.length]) n("disc", c, r.width, r.x + Math.cos(r.angle) * h, r.y + Math.sin(r.angle) * h, r.wait ? 0.3 : 0.75);
        continue;
      }
      if (r.kind === "ring") {
        n("ring", c, r.inner, r.x, r.y), n("ring", c, r.radius, r.x, r.y);
        for (let d = 1; d <= 4; d++) n("ring", c, r.inner + (r.radius - r.inner) * d / 5, r.x, r.y, r.wait ? 0.35 : 0.8);
        continue;
      }
      if (n("disc", c, r.radius, r.x, r.y, r.wait ? 0.2 : 0.4), n("ring", c, r.radius, r.x, r.y), r.wait) {
        n("ring", c, r.radius * (1 - Math.min(1, r.wait / 45)), r.x, r.y, 0.7);
        const d = a("box", c, 0.7);
        d.position.set(r.x, 0.12, r.y), d.scale.set(0.08, 0.02, 0.6);
        const h = a("box", c, 0.7);
        h.position.copy(d.position), h.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", re.gold, r.radius * (0.7 + Math.sin(o.tick * 0.1) * 0.1), r.x, r.y, 0.7, 0.25);
        for (let d = 0; d < 6; d++) {
          const h = d * Math.PI / 3, u = a("cone", c, 0.7);
          u.position.set(r.x + Math.cos(h) * r.radius * 0.65, 0.45, r.y + Math.sin(h) * r.radius * 0.65), u.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const r of o.shots) {
      const c = r.friendly ? re.gold : re.danger, d = a("sphere", r.friendly ? "#fffbea" : "#fff1c9");
      d.position.set(r.x, 0.6, r.y), d.scale.set(0.11, 0.11, 0.11);
      const h = a("sphere", c, 0.8);
      h.position.copy(d.position), h.scale.set(0.21, 0.18, 0.21);
      const u = a("cone", c, 0.5);
      u.position.set(r.x - Math.cos(r.angle) * 0.38, 0.6, r.y - Math.sin(r.angle) * 0.38), u.scale.set(0.14, 0.75, 0.14), u.rotation.set(0, -r.angle, -Math.PI / 2);
    }
    for (const r of o.effects) {
      const c = 1 - r.life / (r.kind === "slash" ? 9 : 15);
      if (r.kind === "slash") {
        const d = n("arc", re.gold, r.size, r.x, r.y, 0.3 * (1 - c), 0.42);
        d.rotation.z = -r.angle - 0.9 + c * 0.4;
        const h = n("stroke", "#fff4d2", r.size, r.x, r.y, 0.9 * (1 - c), 0.43);
        h.rotation.z = d.rotation.z;
      } else if (r.kind === "resonance") {
        n("ring", Je.crest, r.size * (i ? 1 : 0.6 + c * (2 - c)), r.x, r.y, 0.8 - c * 0.6, 0.16);
        for (const d of o.companions) {
          if (d.kind !== "familiar" || d.hp <= 0 || d.life <= 0) continue;
          const h = d.x - l.x, u = d.y - l.y, v = a("box", Je.empowered, 1 - c * 0.7);
          v.position.set((l.x + d.x) / 2, 1.1, (l.y + d.y) / 2), v.scale.set(Math.hypot(h, u), 0.045, 0.045), v.rotation.y = -Math.atan2(u, h);
        }
        for (let d = 0; d < 4; d++) {
          const h = d * Math.PI / 2 + (i ? 0 : c), u = a("rock", Je.empowered, 1 - c * 0.4);
          u.position.set(l.x + Math.cos(h) * 0.95, 1.7 + (i ? 0 : c * 0.5), l.y + Math.sin(h) * 0.95), u.scale.set(0.08, 0.18, 0.08);
        }
      } else if (r.kind === "lightning") {
        for (let d = 0; d < 4; d++) {
          const h = a("box", d % 2 ? "#ffffff" : re.magic, 1 - c * 0.6);
          h.scale.set(0.09 + (1 - c) * 0.09, 1.05, 0.08), h.position.set(r.x + (d % 2 ? 0.14 : -0.14), 0.5 + d * 0.85, r.y), h.rotation.z = d % 2 ? -0.35 : 0.35;
        }
        n("ring", re.magic, 0.4 + c, r.x, r.y, 1 - c);
      } else if (r.kind === "block" || r.kind === "parry" || r.kind === "ward-hit" || r.kind === "ward-break") {
        const d = r.kind === "block" || r.kind === "parry", h = r.kind === "ward-break", u = d ? r.kind === "parry" ? Oe.parry : Oe.block : Oe.ward;
        if (d) {
          const v = a("ring", u, 1 - c);
          v.position.set(r.x + Math.cos(r.angle) * 0.7, 1.3, r.y + Math.sin(r.angle) * 0.7), v.rotation.y = Math.PI / 2 - r.angle, v.scale.setScalar(0.6 + c * (r.kind === "parry" ? 1.3 : 0.6));
        }
        for (let v = 0; v < (h ? 6 : 4); v++) {
          const f = v * 2.4 + r.id, g = a(h ? "rock" : "box", u, 1 - c), b = i ? 1.1 : 0.7 + c * (h ? 1.5 : 0.6);
          g.position.set(r.x + Math.cos(f) * b, 0.7 + v % 3 * 0.55, r.y + Math.sin(f) * b), g.scale.set(0.07 * (1 - c), (h ? 0.3 : 0.16) * (1 - c), 0.04), g.rotation.set(f, f, f);
        }
      } else if (r.kind === "heal") n("ring", re.heal, 0.4 + c, r.x, r.y, 1 - c);
      else {
        const d = r.kind === "hit" ? re.danger : re.gold;
        if (n("ring", d, r.size * (0.4 + c), r.x, r.y, 1 - c), !i) for (let h = 0; h < 7; h++) {
          const u = h * 2.4 + r.id, v = a("rock", d, 1 - c * 0.8);
          v.position.set(r.x + Math.cos(u) * c * r.size, 0.4 + Math.sin(c * Math.PI) * 0.8, r.y + Math.sin(u) * c * r.size), v.scale.set(0.1 * (1 - c), 0.28 * (1 - c), 0.1 * (1 - c)), v.rotation.z = u;
        }
      }
    }
  } };
}
function pi(e) {
  const t = document.createElement("div"), s = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", Oe.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ee.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(s);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new ct();
  let o = null, i = 0, l = 0, r = null;
  function c(d, h, u, v, f, g, b) {
    n.set(h, u, v).project(f), d.style.left = `${(n.x * 0.5 + 0.5) * g}px`, d.style.top = `${(-n.y * 0.5 + 0.5) * b}px`;
  }
  return {
    update(d, h, u, v) {
      if (d !== o && (o = d, i = 0, r = null, l = 0), t.hidden = !d || d.player.ward <= 0, a.hidden = !d, !d) return;
      const f = d.player;
      t.hidden || (s.style.width = `${f.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(f.ward)), c(t, f.x, 0, f.y, h, u, v));
      const g = d.effects.filter((_) => _.id > i && _.kind in ee.defenseFeedback), b = g.find((_) => _.kind === "parry" || _.kind === "ward-break") ?? g.at(-1);
      b && (r = b.kind, l = d.tick + 27), i = d.serial, d.tick >= l && (r = null), a.hidden = !r && !f.shield, a.dataset.state = r ?? "blocking", a.textContent = r ? ee.defenseFeedback[r] : f.shield ? ee.guardActive : "", c(a, f.x, f.shield ? 3.65 : 3.05, f.y, h, u, v);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function mi(e, t, s, a) {
  const { width: n, depth: o } = a.footprint, i = n >= o, l = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(n, o) / 5));
  e.mesh(t, "box", m.mortar, [
    n,
    0.4,
    o
  ], [
    0,
    0.2,
    0
  ]);
  for (let r = 0; r < l; r++) {
    const c = i ? n / l : n, d = i ? o : o / l, h = e.group(s, [
      i ? -n / 2 + (r + 0.5) * c : 0,
      0,
      i ? 0 : -o / 2 + (r + 0.5) * d
    ]), u = (a.height ?? 4) + (r % 3 - 1) * 0.35, v = a.kind === "workshop";
    e.mesh(h, "box", r % 2 ? m.stone : m.cloth, [
      c - 0.15,
      u - 0.4,
      d - 0.15
    ], [
      0,
      (u + 0.4) / 2,
      0
    ]);
    for (const M of [-c / 2 + 0.12, c / 2 - 0.12]) e.mesh(h, "box", m.timber, [
      0.18,
      u,
      d
    ], [
      M,
      u / 2,
      0
    ]);
    for (const M of [0.7, u - 0.3]) e.mesh(h, "box", m.wood, [
      c,
      0.15,
      d
    ], [
      0,
      M,
      0
    ]);
    const f = e.group(h, [
      0,
      u + 0.24,
      0
    ]);
    f.rotation.x = -0.18;
    const g = !i && l > 1 ? d - 0.03 : d + 0.7;
    e.mesh(f, "box", m.roof, [
      c + 0.6,
      0.16,
      g
    ]);
    for (let M = -c / 2; M <= c / 2; M += 0.8) e.mesh(f, "box", m.roofLight, [
      0.055,
      0.07,
      g
    ], [
      M,
      0.12,
      0
    ]);
    e.mesh(f, "box", m.brass, [
      c + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      g / 2
    ]);
    const b = e.group(h, [
      0,
      0,
      d / 2
    ]), _ = a.entrance ? 0 : -c * 0.19;
    e.mesh(b, "box", m.shadow, [
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
    ]) e.mesh(b, "box", m.wood, [
      0.24,
      1.95,
      0.12
    ], [
      _ + M,
      1.06,
      0.04
    ]);
    if (e.mesh(b, "box", m.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      c * 0.27,
      2.25,
      0.03
    ]), e.mesh(b, "box", m.ember, [
      0.7,
      0.67,
      0.14
    ], [
      c * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(b, "box", m.timber, [
      0.07,
      0.85,
      0.16
    ], [
      c * 0.27,
      2.25,
      0.15
    ]), e.mesh(b, "box", m.timber, [
      0.85,
      0.07,
      0.16
    ], [
      c * 0.27,
      2.25,
      0.15
    ]), d >= 4 && (i || r === l - 1)) {
      const M = e.group(b, [
        0,
        2.8,
        0.55
      ]);
      M.rotation.x = 0.22, e.mesh(M, "box", a.tint === "rose" ? m.rose : m.cloth, [
        c * 0.8,
        0.045,
        1.6
      ]), e.mesh(M, "box", m.light, [
        0.55,
        0.015,
        0.45
      ], [
        -c * 0.17,
        0.035,
        0.35
      ]);
    }
    if (v) {
      e.mesh(h, "box", m.wood, [
        c * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        d / 2 - 0.5
      ]);
      for (let M = 0; M < 3; M++) e.mesh(h, "cylinder", m.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (M - 1) * 0.55,
        1.4,
        d / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(h, "box", m.slate, [
        0.6,
        u * 0.38,
        0.7
      ], [
        -c * 0.3,
        u + 0.55,
        -d * 0.2
      ]), e.mesh(h, "box", m.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -c * 0.3,
        u * 1.19 + 0.6,
        -d * 0.2
      ]);
  }
}
function vi(e, t, s) {
  const a = e.group(t, [
    s.width / 2 + 0.04,
    0,
    0
  ]);
  a.rotation.y = Math.PI / 2;
  const n = Math.min(4.8, s.depth - 0.7);
  e.mesh(a, "box", m.timber, [
    n,
    0.16,
    2.2
  ], [
    0,
    3.25,
    1
  ]), e.mesh(a, "box", m.cloth, [
    n - 0.15,
    2.35,
    1.75
  ], [
    0,
    4.5,
    0.86
  ]);
  for (const i of [-n / 2 + 0.1, n / 2 - 0.1]) {
    e.mesh(a, "box", m.timber, [
      0.16,
      2.5,
      1.9
    ], [
      i,
      4.5,
      0.9
    ]);
    const l = e.mesh(a, "box", m.wood, [
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
  e.mesh(a, "box", m.shadow, [
    1.3,
    1,
    0.05
  ], [
    0,
    4.55,
    1.76
  ]), e.mesh(a, "box", m.ember, [
    1.03,
    0.77,
    0.06
  ], [
    0,
    4.55,
    1.8
  ], !0), e.mesh(a, "box", m.timber, [
    0.07,
    0.95,
    0.1
  ], [
    0,
    4.55,
    1.85
  ]);
  for (const i of [-0.78, 0.78]) e.mesh(a, "box", m.wood, [
    0.26,
    1.15,
    0.12
  ], [
    i,
    4.55,
    1.83
  ]);
  const o = e.group(a, [
    0,
    5.8,
    1.1
  ]);
  o.rotation.x = 0.14, e.mesh(o, "box", m.roof, [
    n + 0.45,
    0.16,
    2.5
  ]);
  for (let i = -n / 2; i < n / 2; i += 0.6) e.mesh(o, "box", m.roofLight, [
    0.07,
    0.1,
    2.53
  ], [
    i,
    0.1,
    0
  ]);
  e.mesh(a, "box", m.wood, [
    1.2,
    1.9,
    0.08
  ], [
    0,
    1,
    0.04
  ]), e.mesh(a, "box", m.timber, [
    0.1,
    0.4,
    0.06
  ], [
    0.3,
    1,
    0.11
  ]);
}
function gi(e, t) {
  e.mesh(t, "box", m.mortar, [
    4,
    0.2,
    4
  ], [
    0,
    0.1,
    0
  ]), e.mesh(t, "box", m.slate, [
    1.45,
    1.1,
    1.15
  ], [
    0,
    0.75,
    0
  ]), e.mesh(t, "box", m.shadow, [
    0.95,
    0.55,
    0.04
  ], [
    0,
    0.62,
    0.59
  ]), e.mesh(t, "box", m.ember, [
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
  ]) e.mesh(t, "box", m.shadow, [
    0.05,
    0.48,
    0.07
  ], [
    s,
    0.62,
    0.67
  ]);
  e.mesh(t, "cylinder", m.shadow, [
    0.13,
    2.5,
    0.13
  ], [
    -0.48,
    2.25,
    -0.4
  ]), e.mesh(t, "cylinder", m.pottery, [
    0.36,
    0.48,
    0.36
  ], [
    0.2,
    1.52,
    0
  ]), e.mesh(t, "cylinder", m.shadow, [
    0.38,
    0.07,
    0.38
  ], [
    0.2,
    1.79,
    0
  ]);
  for (let s = 0; s < 5; s++) e.mesh(t, "box", m.wood, [
    0.8,
    0.16,
    0.2
  ], [
    1.25,
    0.3 + s % 3 * 0.18,
    -0.5 + Math.floor(s / 3) * 0.24
  ]);
  e.mesh(t, "cylinder", m.timber, [
    0.38,
    0.65,
    0.38
  ], [
    -1.15,
    0.52,
    0.5
  ]);
  for (let s = 0; s < 5; s++) e.mesh(t, "rock", m.shadow, [
    0.18,
    0.16,
    0.17
  ], [
    -1.15 + Math.sin(s * 2) * 0.2,
    0.87,
    0.5 + Math.cos(s * 2) * 0.2
  ]);
}
function yi(e, t, s, a) {
  e.mesh(t, "box", m.wood, [
    s,
    0.16,
    a
  ], [
    0,
    1,
    0
  ]);
  for (const n of [-1, 1]) e.mesh(t, "box", m.timber, [
    0.18,
    1,
    a - 0.2
  ], [
    n * (s / 2 - 0.2),
    0.5,
    0
  ]);
  e.mesh(t, "box", m.cloth, [
    s * 0.4,
    0.025,
    a * 0.8
  ], [
    -s * 0.2,
    1.1,
    0
  ]);
  for (let n = 0; n < 5; n++)
    e.mesh(t, "cylinder", n % 2 ? m.pottery : m.slate, [
      0.16,
      0.32 + n % 2 * 0.15,
      0.16
    ], [
      s * 0.04 + n * 0.43,
      1.28,
      -0.3
    ]), e.mesh(t, "cylinder", m.wood, [
      0.17,
      0.055,
      0.17
    ], [
      s * 0.04 + n * 0.43,
      1.47 + n % 2 * 0.075,
      -0.3
    ]);
  for (let n = 0; n < 3; n++) e.mesh(t, "box", m.light, [
    0.8,
    0.12,
    0.48
  ], [
    -s * 0.25,
    1.18 + n * 0.12,
    0.12
  ]);
  e.mesh(t, "cylinder", m.pottery, [
    0.3,
    0.18,
    0.3
  ], [
    s * 0.22,
    1.19,
    0.45
  ]);
}
function bi(e, t, s) {
  const a = new ct(...s.from), n = new ct(...s.to), o = n.clone().sub(a), i = o.length(), l = s.kind === "pipe", r = l ? 0.23 : 0.018, c = e.mesh(t, "cylinder", l ? m.brass : m.timber, [
    r,
    i,
    r
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (c.quaternion.setFromUnitVectors(new ct(0, 1, 0), o.normalize()), l) for (let d = 1; d < i; d += 3.7) {
    const h = a.clone().addScaledVector(o, d);
    e.mesh(t, "cylinder", m.wood, [
      0.28,
      0.16,
      0.28
    ], h.toArray()).quaternion.copy(c.quaternion), e.mesh(t, "box", m.shadow, [
      0.12,
      0.65,
      0.12
    ], [
      h.x,
      h.y - 0.3,
      h.z
    ]);
  }
  else for (let d = 2; d < i - 2; d += 1.9) {
    const h = a.clone().addScaledVector(o, d), u = e.group(t, h.toArray());
    u.rotation.y = Math.atan2(o.x, o.z) + Math.PI / 2, e.shape(u, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(d) % 2 ? m.cloth : m.light);
    for (const v of [-1, 1]) e.mesh(u, "box", m.wood, [
      0.07,
      0.17,
      0.06
    ], [
      v * 0.42,
      -0.02,
      0.03
    ]);
  }
}
function wi(e, t, s) {
  const { width: a, depth: n } = s.footprint;
  if (s.kind === "ledger") {
    e.mesh(t, "box", m.wood, [
      a,
      0.18,
      n
    ], [
      0,
      1.18,
      0
    ]);
    for (const l of [-1, 1]) e.mesh(t, "box", m.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      l * (a / 2 - 0.3),
      0.55,
      0
    ]);
    for (let l = -1; l <= 1; l++)
      e.mesh(t, "box", m.slate, [
        0.85,
        0.17,
        1.1
      ], [
        l * 1.2,
        1.35,
        -0.3
      ]), e.mesh(t, "box", m.light, [
        0.77,
        0.025,
        0.98
      ], [
        l * 1.2,
        1.45,
        -0.3
      ]), e.mesh(t, "box", m.brass, [
        0.08,
        0.025,
        1.13
      ], [
        l * 1.2,
        1.48,
        -0.3
      ]);
    e.mesh(t, "cylinder", m.brass, [
      0.18,
      0.25,
      0.18
    ], [
      a * 0.28,
      1.4,
      n * 0.28
    ]), e.mesh(t, "box", m.light, [
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
  e.mesh(t, "box", m.timber, [
    a,
    0.16,
    n
  ], [
    0,
    0.08,
    0
  ]);
  const o = Math.max(1, Math.floor(n / 2.2)), i = Math.max(1, Math.floor(a / 1.8));
  for (let l = 0; l < o; l++) for (let r = 0; r < i; r++) {
    const c = -a / 2 + (r + 0.5) * a / i, d = -n / 2 + (l + 0.5) * n / o, h = a / i - 0.22, u = n / o - 0.24;
    if (s.kind === "fuel") {
      for (let v = 0; v < 5; v++) e.mesh(t, "box", v % 2 ? m.wood : m.timber, [
        h,
        0.2,
        u / 2 - 0.07
      ], [
        c,
        0.28 + v * 0.24,
        d + v % 2 * 0.12
      ]);
      e.mesh(t, "box", m.cloth, [
        h + 0.08,
        0.055,
        u
      ], [
        c,
        1.42,
        d
      ]);
    } else {
      const v = 0.85 + (l + r) % 3 * 0.22;
      e.mesh(t, "box", m.wood, [
        h,
        v,
        u
      ], [
        c,
        0.16 + v / 2,
        d
      ]);
      for (const f of [-1, 1]) e.mesh(t, "box", m.timber, [
        0.11,
        v + 0.04,
        u + 0.05
      ], [
        c + f * h * 0.32,
        0.16 + v / 2,
        d
      ]);
      e.mesh(t, "box", m.light, [
        0.32,
        0.4,
        0.03
      ], [
        c,
        0.7,
        d + u / 2 + 0.02
      ]), e.mesh(t, "box", m.rose, [
        0.09,
        0.09,
        0.04
      ], [
        c,
        0.61,
        d + u / 2 + 0.045
      ]);
      for (let f = -0.25; f <= 0.25; f += 0.25) e.mesh(t, "box", m.timber, [
        h,
        0.015,
        0.016
      ], [
        c,
        v + 0.17,
        d + f * u
      ]);
      (l + r) % 3 === 0 && (e.mesh(t, "box", m.cloth, [
        h * 0.75,
        0.38,
        u * 0.55
      ], [
        c,
        v + 0.37,
        d - 0.18
      ]), e.mesh(t, "box", m.timber, [
        0.055,
        0.4,
        u * 0.57
      ], [
        c,
        v + 0.37,
        d - 0.18
      ])), e.mesh(t, "box", m.light, [
        0.32,
        0.018,
        0.45
      ], [
        c + h * 0.23,
        v + 0.19,
        d + u * 0.25
      ]);
    }
  }
}
function xi(e, t, s, a) {
  for (let n = 0; n < 3; n++) e.mesh(t, "box", m.slate, [
    s * 0.65,
    0.08,
    0.7
  ], [
    0,
    2.19 + n * 0.08,
    a * 0.22
  ]);
  e.mesh(t, "box", m.rose, [
    s * 0.6,
    0.03,
    0.08
  ], [
    0,
    2.41,
    a * 0.22 + 0.25
  ]), e.mesh(t, "cylinder", m.pottery, [
    0.22,
    0.15,
    0.22
  ], [
    s * 0.35,
    0.17,
    a * 0.35
  ]), e.mesh(t, "cylinder", m.shadow, [
    0.18,
    0.014,
    0.18
  ], [
    s * 0.35,
    0.25,
    a * 0.35
  ]);
  for (const n of [-0.17, 0.17]) e.mesh(t, "box", m.wood, [
    0.23,
    0.12,
    0.44
  ], [
    n,
    0.08,
    -a * 0.37
  ]);
  e.mesh(t, "box", m.rose, [
    0.42,
    0.045,
    0.3
  ], [
    0.3,
    0.9,
    a * 0.2
  ]);
}
function cs(e, t, s) {
  const { width: a, depth: n } = s.footprint, o = s.tint === "rose" ? m.rose : s.tint === "amber" ? m.amber : m.leafLight, i = (l) => {
    for (const r of [-1, 1]) for (const c of [-1, 1]) e.mesh(t, "box", m.timber, [
      0.16,
      l,
      0.16
    ], [
      r * (a / 2 - 0.3),
      l / 2,
      c * (n / 2 - 0.3)
    ]);
  };
  switch (s.kind) {
    case "bed":
      i(0.65), e.mesh(t, "box", m.wood, [
        a - 0.25,
        0.3,
        n - 0.25
      ], [
        0,
        0.65,
        0
      ]), e.mesh(t, "box", m.light, [
        a - 0.5,
        0.25,
        n - 0.5
      ], [
        0,
        0.91,
        0
      ]), e.mesh(t, "box", o, [
        a - 0.42,
        0.1,
        n * 0.6
      ], [
        0,
        1.08,
        n * 0.13
      ]), e.mesh(t, "box", m.cloth, [
        a - 0.7,
        0.12,
        0.35
      ], [
        0,
        1.15,
        -n * 0.15
      ]), e.mesh(t, "box", m.light, [
        a - 1,
        0.25,
        1
      ], [
        0,
        1.15,
        -n / 2 + 1
      ]), e.mesh(t, "box", m.timber, [
        a - 0.1,
        1.5,
        0.17
      ], [
        0,
        0.9,
        -n / 2 + 0.12
      ]);
      for (const l of [-1, 1]) e.mesh(t, "cylinder", m.brass, [
        0.07,
        1.35,
        0.07
      ], [
        l * (a / 2 - 0.23),
        0.9,
        -n / 2 + 0.22
      ]);
      e.mesh(t, "box", o, [
        1,
        0.018,
        n - 0.8
      ], [
        a / 2 + 0.65,
        0.015,
        0
      ]).castShadow = !1;
      for (const l of [-1, 1]) e.mesh(t, "box", m.cloth, [
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
      e.mesh(t, "box", m.timber, [
        a - 0.15,
        2.9,
        n - 0.15
      ], [
        0,
        2.9 / 2,
        0
      ]);
      for (const r of [-1, 1])
        e.mesh(t, "box", m.wood, [
          a / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          r * a / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(t, "box", m.cloth, [
          a / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          r * a / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(t, "box", m.brass, [
          0.045,
          0.27,
          0.08
        ], [
          r * 0.2,
          1.4,
          n / 2 + 0.14
        ]);
      e.mesh(t, "box", m.wood, [
        a + 0.1,
        0.16,
        n + 0.15
      ], [
        0,
        2.9,
        0
      ]), e.mesh(t, "box", o, [
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
      for (const l of [-1, 1]) e.mesh(t, "box", m.timber, [
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
        e.mesh(t, "box", m.wood, [
          a,
          0.15,
          n
        ], [
          0,
          l,
          0
        ]);
        for (let r = 0; r < 4; r++) e.mesh(t, "cylinder", m.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + r * 0.6,
          l + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", m.shadow, [
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
      e.mesh(t, "box", m.timber, [
        a - 0.2,
        l,
        n - 0.2
      ], [
        0,
        l / 2,
        0
      ]);
      for (let r = -a / 2 + 0.55; r < a / 2 - 0.2; r += 1) for (let c = 0.5; c < l - 0.1; c += 0.8)
        e.mesh(t, "box", m.wood, [
          0.88,
          0.68,
          0.12
        ], [
          r,
          c,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", m.brass, [
          0.055,
          0.055,
          0.06
        ], [
          r,
          c,
          n / 2 + 0.03
        ]);
      e.mesh(t, "box", m.cloth, [
        a * 0.45,
        0.13,
        n * 0.66
      ], [
        -a * 0.2,
        l + 0.075,
        0
      ]);
      for (let r = 0; r < 3; r++) e.mesh(t, "cylinder", r % 2 ? m.pottery : m.light, [
        0.15,
        0.32 + r * 0.1,
        0.15
      ], [
        a * 0.15 + r * 0.4,
        l + 0.2,
        0
      ]);
      break;
    }
    case "table":
    case "workbench":
      if (i(1.2), e.mesh(t, "box", m.wood, [
        a,
        0.18,
        n
      ], [
        0,
        1.28,
        0
      ]), e.mesh(t, "box", m.timber, [
        a - 0.5,
        0.15,
        0.15
      ], [
        0,
        0.4,
        0
      ]), s.kind === "workbench") {
        for (let l = 0; l < 3; l++) e.mesh(t, "cylinder", m.brass, [
          0.15,
          1,
          0.15
        ], [
          (l - 1) * 0.7,
          1.55,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", m.shadow, [
          0.1,
          0.08,
          1
        ], [
          a * 0.3,
          1.42,
          0
        ]).rotation.y = 0.5;
      } else {
        e.mesh(t, "box", m.light, [
          1,
          0.08,
          0.7
        ], [
          -a * 0.24,
          1.42,
          0
        ]).rotation.y = -0.12, e.mesh(t, "cylinder", m.pottery, [
          0.28,
          0.45,
          0.28
        ], [
          a * 0.2,
          1.6,
          0
        ]);
        for (const l of [-0.45, 0.45]) e.mesh(t, "cylinder", m.light, [
          0.13,
          0.19,
          0.13
        ], [
          a * 0.2 + 0.65,
          1.48,
          l
        ]);
        e.mesh(t, "cylinder", m.brass, [
          0.15,
          0.13,
          0.15
        ], [
          -a * 0.32,
          1.43,
          -n * 0.3
        ]), e.mesh(t, "cylinder", m.light, [
          0.07,
          0.32,
          0.07
        ], [
          -a * 0.32,
          1.65,
          -n * 0.3
        ]), e.mesh(t, "rock", m.ember, [
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
      i(0.7), e.mesh(t, "box", m.wood, [
        a - 0.25,
        0.18,
        n - 0.25
      ], [
        0,
        0.78,
        0
      ]);
      for (const l of [-1, 1]) e.mesh(t, "box", m.timber, [
        0.14,
        1.5,
        0.14
      ], [
        l * (a / 2 - 0.3),
        0.78,
        n / 2 - 0.3
      ]);
      e.mesh(t, "box", m.wood, [
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
      i(0.9), e.mesh(t, "box", m.wood, [
        a - 0.2,
        0.15,
        n - 0.2
      ], [
        0,
        0.95,
        0
      ]), e.mesh(t, "cylinder", m.light, [
        0.65,
        0.22,
        0.65
      ], [
        0,
        1.12,
        0
      ]), e.mesh(t, "cylinder", m.water, [
        0.54,
        0.025,
        0.54
      ], [
        0,
        1.24,
        0
      ]), e.mesh(t, "box", m.cloth, [
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
      const l = a > n, r = Math.max(a, n), c = e.group(t);
      l || (c.rotation.y = Math.PI / 2);
      for (let d = -r / 2 + 0.15; d < r / 2; d += 1.4)
        e.mesh(c, "box", m.timber, [
          0.09,
          2.8,
          0.12
        ], [
          d,
          1.4,
          0
        ]), e.mesh(c, "box", m.cloth, [
          Math.min(1.27, r / 2 - d),
          2.15,
          0.055
        ], [
          d + Math.min(0.68, (r / 2 - d) / 2),
          1.53,
          0
        ]);
      for (const d of [-1, 1]) e.mesh(c, "box", m.timber, [
        0.3,
        0.18,
        0.8
      ], [
        d * (r / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function Mi(e, t, s, a) {
  const { width: n, depth: o } = a.footprint, i = a.height;
  e.mesh(t, "box", m.slate, [
    n,
    0.3,
    o
  ], [
    0,
    0.15,
    0
  ]), e.mesh(s, "box", m.light, [
    n,
    i - 0.3,
    o
  ], [
    0,
    (i + 0.3) / 2,
    0
  ]);
  for (const c of [0.5, i - 0.1]) e.mesh(s, "box", m.wood, [
    n + 0.04,
    0.16,
    o + 0.04
  ], [
    0,
    c,
    0
  ]);
  const l = n > o, r = Math.max(n, o);
  for (let c = -r / 2 + 0.3; c < r / 2; c += 3.5) e.mesh(s, "box", m.wood, [
    l ? 0.12 : n + 0.04,
    i,
    l ? o + 0.04 : 0.12
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
    c.rotation.y = Math.PI / 2, e.mesh(c, "box", m.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(c, "box", m.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const d of [-1, 1])
      e.mesh(c, "box", m.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        d * 0.73,
        -0.07,
        0.21
      ]), e.mesh(c, "box", m.brass, [
        0.78,
        0.06,
        0.03
      ], [
        d * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(c, "box", m.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(c, "box", m.wood, [
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
function _i(e, t) {
  for (const s of [-1, 1]) e.mesh(t, "box", m.timber, [
    0.22,
    3.6,
    0.4
  ], [
    s * 1.9,
    1.8,
    0
  ]);
  e.mesh(t, "box", m.wood, [
    4,
    0.22,
    0.45
  ], [
    0,
    3.65,
    0
  ]), e.mesh(t, "box", m.wood, [
    3.5,
    3.35,
    0.16
  ], [
    0,
    1.7,
    0
  ]);
  for (const s of [0.5, 2.8]) e.mesh(t, "box", m.timber, [
    3.5,
    0.13,
    0.2
  ], [
    0,
    s,
    0
  ]);
  for (const s of [-1, 1]) e.mesh(t, "sphere", m.brass, [
    0.09,
    0.09,
    0.09
  ], [
    1.25,
    1.45,
    s * 0.16
  ]);
}
function sr(e, t, s, a, n = 2.8) {
  e.mesh(t, "cylinder", m.shadow, [
    0.055,
    n,
    0.055
  ], [
    s,
    n / 2,
    a
  ]), e.mesh(t, "box", m.brass, [
    0.4,
    0.08,
    0.4
  ], [
    s,
    n,
    a
  ]), e.mesh(t, "box", m.ember, [
    0.22,
    0.38,
    0.22
  ], [
    s,
    n + 0.21,
    a
  ], !0), e.mesh(t, "cone", m.shadow, [
    0.32,
    0.24,
    0.32
  ], [
    s,
    n + 0.51,
    a
  ]);
  for (const o of [-1, 1]) e.mesh(t, "box", m.shadow, [
    0.035,
    0.4,
    0.035
  ], [
    s + o * 0.14,
    n + 0.2,
    a + 0.14
  ]);
}
function rr(e, t, s, a, n, o) {
  const i = s / 2 + 0.45, l = Math.atan2(o, i), r = Math.hypot(i, o);
  for (const c of [-1, 1]) {
    const d = e.group(t, [
      c * i / 2,
      n + o / 2,
      0
    ]);
    d.rotation.z = -c * l, e.mesh(d, "box", m.roof, [
      r + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let h = 0; h < Math.ceil(r / 0.65); h++) e.mesh(d, "box", h % 3 ? m.roof : m.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -r / 2 + h * 0.65,
      0.13,
      0
    ]);
    e.mesh(d, "box", m.shadow, [
      0.2,
      0.24,
      a + 1.25
    ], [
      c * r / 2,
      -0.05,
      0
    ]);
  }
  e.mesh(t, "box", m.brass, [
    0.24,
    0.23,
    a + 1.4
  ], [
    0,
    n + o + 0.14,
    0
  ]);
  for (const c of [-a / 2 - 0.08, a / 2 + 0.08])
    e.shape(t, [
      [-s / 2, 0],
      [s / 2, 0],
      [0, o]
    ], m.light, [
      0,
      n,
      c
    ], 0.08), e.mesh(t, "box", m.timber, [
      0.15,
      o,
      0.18
    ], [
      0,
      n + o / 2,
      c + 0.12
    ]);
}
function Aa(e, t, s, a, n, o = 1.1) {
  e.mesh(t, "box", m.shadow, [
    o,
    1.45,
    0.12
  ], [
    s,
    n,
    a
  ]), e.mesh(t, "box", m.window, [
    o - 0.18,
    1.25,
    0.14
  ], [
    s,
    n,
    a + 0.07
  ]);
  for (const i of [-1, 1])
    e.mesh(t, "box", m.wood, [
      0.13,
      1.6,
      0.2
    ], [
      s + i * o / 2,
      n,
      a + 0.12
    ]), e.mesh(t, "box", m.light, [
      o + 0.28,
      0.14,
      0.26
    ], [
      s,
      n + i * 0.8,
      a + 0.12
    ]);
  e.mesh(t, "box", m.timber, [
    0.07,
    1.3,
    0.16
  ], [
    s,
    n,
    a + 0.16
  ]), e.mesh(t, "box", m.timber, [
    o,
    0.06,
    0.16
  ], [
    s,
    n,
    a + 0.16
  ]);
}
function ki(e, t, s) {
  const { width: a, depth: n } = s.footprint, o = s.kind === "clinic", i = o ? 3.7 : 5;
  e.mesh(t, "box", m.stone, [
    a - 0.3,
    i,
    n - 0.3
  ], [
    0,
    i / 2,
    0
  ]), e.mesh(t, "box", m.light, [
    a - 0.4,
    i - 1,
    n - 0.1
  ], [
    0,
    i / 2 + 0.4,
    0
  ]);
  for (const d of [-a / 2 + 0.15, a / 2 - 0.15]) for (const h of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(t, "box", m.timber, [
    0.27,
    i,
    0.27
  ], [
    d,
    i / 2,
    h
  ]);
  for (const d of [0.8, i - 0.25]) e.mesh(t, "box", m.timber, [
    a,
    0.18,
    n
  ], [
    0,
    d,
    0
  ]);
  for (const d of [-a * 0.29, a * 0.29]) Aa(e, t, d, n / 2, 2.3, o ? 1.6 : 1.2);
  const l = e.group(t, [
    a / 2,
    0,
    0
  ]);
  l.rotation.y = Math.PI / 2;
  for (const d of [-n * 0.27, n * 0.27]) Aa(e, l, d, 0.03, 2.3);
  e.mesh(t, "box", m.shadow, [
    1.9,
    2.65,
    0.13
  ], [
    0,
    1.35,
    n / 2
  ]);
  for (const d of [-1, 1]) e.mesh(t, "box", m.wood, [
    0.85,
    2.5,
    0.12
  ], [
    d * 0.46,
    1.3,
    n / 2 + 0.08
  ]);
  e.mesh(t, "sphere", m.brass, [
    0.07,
    0.07,
    0.05
  ], [
    0.23,
    1.15,
    n / 2 + 0.19
  ]), rr(e, t, a, n, i, o ? 1.15 : 3.2);
  const r = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), c = o ? 2.1 : 3.3;
  if (e.mesh(r, "box", m.stone, [
    1.1,
    c,
    1.2
  ], [
    0,
    c / 2,
    0
  ]), e.mesh(r, "box", m.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    c - 0.2,
    0
  ]), e.mesh(r, "box", m.shadow, [
    0.85,
    0.04,
    0.95
  ], [
    0,
    c - 0.03,
    0
  ]), o) {
    const d = e.group(t, [
      0,
      2.9,
      n / 2 + 1
    ]);
    d.rotation.x = 0.19;
    for (let h = -6; h <= 6; h++) e.mesh(d, "box", h % 3 ? m.cloth : m.light, [
      0.74,
      0.04,
      2.3
    ], [
      h * 0.75,
      0,
      0
    ]);
    for (const h of [-1, 1]) e.mesh(t, "box", m.timber, [
      0.09,
      0.12,
      2.1
    ], [
      h * 4.5,
      2.6,
      n / 2 + 0.95
    ]);
    e.mesh(d, "box", m.rose, [
      1,
      0.014,
      0.65
    ], [
      -2.2,
      0.034,
      0.3
    ]);
    for (let h = -3; h <= 3; h++)
      e.mesh(t, "box", m.timber, [
        0.025,
        0.35,
        0.025
      ], [
        h * 0.45 - 3,
        2.5,
        n / 2 + 0.16
      ]), e.mesh(t, "cone", m.leaf, [
        0.17,
        0.6,
        0.15
      ], [
        h * 0.45 - 3,
        2.05,
        n / 2 + 0.16
      ]);
    for (const h of [-a * 0.29, a * 0.29]) e.mesh(t, "box", m.ember, [
      1.35,
      1.15,
      0.015
    ], [
      h,
      2.3,
      n / 2 + 0.151
    ], !0);
    e.mesh(t, "box", m.slate, [
      0.9,
      1.2,
      0.14
    ], [
      2.8,
      2.8,
      n / 2 + 0.25
    ]), e.mesh(t, "cylinder", m.brass, [
      0.21,
      0.47,
      0.06
    ], [
      2.8,
      2.75,
      n / 2 + 0.36
    ]), e.mesh(t, "box", m.brass, [
      0.18,
      0.16,
      0.1
    ], [
      2.8,
      3.08,
      n / 2 + 0.36
    ]);
  } else
    Aa(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", m.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function Si(e, t, s) {
  const a = s.height, n = s.footprint.width, o = s.tint === "amber", i = s.tint === "rose", l = o ? m.amber : i ? m.rose : m.leaf, r = o ? m.amberLight : i ? "#dfb2a1" : m.leafLight, c = e.mesh(t, "cylinder", m.timber, [
    0.24,
    a * 0.67,
    0.28
  ], [
    0,
    a * 0.33,
    0
  ]);
  c.rotation.z = 0.06;
  for (let d = 0; d < 3; d++) {
    const h = e.group(t, [
      0,
      a * 0.39,
      0
    ]);
    h.rotation.set(0.4 * Math.sin(d * 2), 0, (d - 1) * 0.65), e.mesh(h, "cylinder", m.timber, [
      0.095,
      a * 0.32,
      0.095
    ], [
      0,
      a * 0.16,
      0
    ]);
  }
  for (let d = 0; d < 9; d++) {
    const h = d * 2.4, u = d === 8 ? 0.1 : n * 0.56, v = e.mesh(t, "crown", d % 3 ? l : r, [
      n * 0.49 + 0.4,
      a * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(h) * u,
      a * (0.68 + d % 3 * 0.11),
      Math.cos(h) * u
    ]);
    v.rotation.set(d * 0.37, d * 0.61, 0.14), v.receiveShadow = !1;
  }
}
function Ri(e, t, s) {
  const { width: a, depth: n } = s.footprint, o = s.height;
  e.mesh(t, "box", m.stone, [
    a,
    o,
    n
  ], [
    0,
    o / 2,
    0
  ]);
  for (const i of [
    1,
    o * 0.55,
    o - 0.6
  ]) e.mesh(t, "box", m.light, [
    a + 0.25,
    0.3,
    n + 0.25
  ], [
    0,
    i,
    0
  ]);
  for (const i of [-a / 2 + 0.3, a / 2 - 0.3]) e.mesh(t, "box", m.mortar, [
    0.55,
    o - 1,
    n + 0.15
  ], [
    i,
    o / 2,
    0
  ]);
  for (const i of [o * 0.35, o * 0.7]) Aa(e, t, 0, n / 2 + 0.02, i, 0.7);
  rr(e, t, a + 0.35, n + 0.35, o, o * 0.32), e.mesh(t, "cylinder", m.brass, [
    0.055,
    2.7,
    0.055
  ], [
    0,
    o * 1.32 + 1.2,
    0
  ]), e.shape(t, [
    [0, 0],
    [1.6, -0.3],
    [1.2, -0.75],
    [0, -0.95]
  ], m.cloth, [
    0.05,
    o * 1.32 + 2.4,
    0
  ]);
}
function Ci(e, t, s, a, n) {
  const o = a.footprint, i = e.group(t, [
    o.x,
    0,
    o.z
  ]), l = e.group(s, [
    o.x,
    0,
    o.z
  ]);
  switch (a.kind) {
    case "door":
      _i(e, l);
      break;
    case "screen":
      cs(e, l, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      cs(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      mi(e, i, l, a);
      break;
    case "stove":
      gi(e, i);
      break;
    case "medicine":
      yi(e, i, o.width, o.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      wi(e, i, a);
      break;
    case "clinic":
    case "storehouse":
      e.mesh(i, "box", m.mortar, [
        o.width,
        0.3,
        o.depth
      ], [
        0,
        0.15,
        0
      ]), ki(e, l, a);
      break;
    case "tree":
      e.mesh(i, "box", m.soil, [
        o.width,
        0.18,
        o.depth
      ], [
        0,
        0.08,
        0
      ]);
      for (let r = 0; r < 7; r++) {
        const c = r * 0.9;
        e.mesh(i, "rock", m.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(c) * o.width * 0.33,
          0.2,
          Math.cos(c) * o.depth * 0.33
        ]);
      }
      Si(e, l, a);
      break;
    case "tower":
      Ri(e, l, a);
      break;
    case "column": {
      const r = a.height, c = Math.min(o.width, o.depth) * 0.3;
      e.mesh(i, "box", m.mortar, [
        o.width,
        0.35,
        o.depth
      ], [
        0,
        0.17,
        0
      ]), e.mesh(i, "box", m.light, [
        o.width * 0.84,
        0.35,
        o.depth * 0.84
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", m.stone, [
        c,
        r - 1.1,
        c
      ], [
        0,
        r / 2,
        0
      ]);
      for (let d = 0; d < 10; d++) {
        const h = d * Math.PI / 5;
        e.mesh(l, "box", m.light, [
          0.085,
          r - 2,
          0.085
        ], [
          Math.sin(h) * c,
          r / 2,
          Math.cos(h) * c
        ]);
      }
      for (const d of [0.85, r - 0.7]) e.mesh(l, "cylinder", m.brass, [
        c * 1.15,
        0.18,
        c * 1.15
      ], [
        0,
        d,
        0
      ]);
      e.mesh(l, "box", m.light, [
        o.width,
        0.4,
        o.depth
      ], [
        0,
        r - 0.3,
        0
      ]), e.mesh(l, "box", m.slate, [
        o.width * 0.9,
        0.3,
        o.depth * 0.9
      ], [
        0,
        r,
        0
      ]);
      break;
    }
    case "beacon":
      e.mesh(i, "box", m.mortar, [
        o.width,
        0.28,
        o.depth
      ], [
        0,
        0.14,
        0
      ]), e.mesh(i, "cylinder", m.stone, [
        2.5,
        0.5,
        2.5
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", m.slate, [
        1.35,
        3.9,
        1.35
      ], [
        0,
        2.3,
        0
      ]);
      for (const r of [
        1.2,
        3.5,
        4.4
      ]) e.mesh(l, "cylinder", m.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        r,
        0
      ]);
      e.mesh(l, "cylinder", m.shadow, [
        2.2,
        0.5,
        2.2
      ], [
        0,
        4.8,
        0
      ]), e.mesh(l, "torus", m.brass, [
        2.3,
        2.3,
        1.4
      ], [
        0,
        5.1,
        0
      ]).rotation.x = Math.PI / 2;
      for (let r = 0; r < 6; r++) {
        const c = r * Math.PI / 3, d = e.group(l, [
          Math.sin(c) * 2.1,
          4.8,
          Math.cos(c) * 2.1
        ]);
        d.rotation.y = c, e.shape(d, [
          [-0.12, 0],
          [0.12, 0],
          [0.2, 1.8],
          [0, 2.4],
          [-0.2, 1.8]
        ], m.brass, [
          0,
          0,
          0
        ], 0.14);
      }
      break;
    case "bunk":
      xi(e, i, o.width, o.depth);
      for (const r of [0.55, 1.9])
        e.mesh(i, "box", m.timber, [
          o.width - 0.5,
          0.18,
          o.depth - 0.5
        ], [
          0,
          r,
          0
        ]), e.mesh(i, "box", m.cloth, [
          o.width - 0.8,
          0.18,
          o.depth - 0.9
        ], [
          0,
          r + 0.16,
          0
        ]), e.mesh(i, "box", m.light, [
          o.width - 1,
          0.24,
          1.2
        ], [
          0,
          r + 0.28,
          -o.depth / 2 + 1.3
        ]);
      for (const r of [-1, 1]) for (const c of [-1, 1]) e.mesh(i, "box", m.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        r * (o.width / 2 - 0.3),
        1.35,
        c * (o.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const r = a.height, c = o.width * 0.23;
      e.mesh(i, "rock", m.soil, [
        o.width * 0.5,
        0.65,
        o.depth * 0.5
      ], [
        0,
        0.1,
        0
      ]);
      for (let d = 0; d < 5; d++) {
        const h = d * Math.PI * 0.4, u = o.width * 0.25, v = e.group(l, [
          Math.sin(h) * c * 0.45,
          0,
          Math.cos(h) * c * 0.45
        ]);
        v.rotation.y = h;
        const f = e.mesh(v, "cylinder", d % 2 ? m.root : m.rootLight, [
          c * 0.65,
          r * 0.64,
          c * 0.49
        ], [
          0,
          r * 0.3,
          0
        ]);
        f.rotation.z = 0.13;
        const g = e.group(v, [
          0,
          r * 0.48,
          0
        ]);
        g.rotation.z = 0.4 + d * 0.12, e.mesh(g, "cone", m.root, [
          c * 0.47,
          r * 0.55,
          c * 0.4
        ], [
          0,
          r * 0.25,
          0
        ]);
        const b = e.mesh(v, "cone", m.root, [
          c * 0.5,
          u * 1.4,
          c * 0.4
        ], [
          u * 0.6,
          0.7,
          0
        ]);
        b.rotation.z = -1.15;
      }
      if (r > 8) {
        e.mesh(l, "rock", m.shadow, [
          c * 0.65,
          r * 0.22,
          0.35
        ], [
          0,
          r * 0.38,
          c * 0.65
        ]), e.mesh(l, "rock", m.brass, [
          c * 0.16,
          r * 0.16,
          0.15
        ], [
          0,
          r * 0.4,
          c * 0.68
        ], !0);
        for (let d = 0; d < 7; d++) e.mesh(l, "crown", d % 2 ? m.leaf : m.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(d * 2) * c,
          r * 0.55 + d * 0.4,
          Math.cos(d * 2) * c
        ]);
      }
      break;
    }
    case "arch": {
      const r = a.height;
      e.mesh(l, "arch", m.light, [
        o.width / 2 - 0.4,
        3.1,
        o.depth * 0.65
      ], [
        0,
        r - 3,
        0
      ]), e.mesh(l, "box", m.brass, [
        0.8,
        1.4,
        o.depth * 0.75
      ], [
        0,
        r + 0.2,
        0
      ]);
      for (const c of [-1, 1]) {
        const d = e.group(l, [
          c * (o.width / 2 - 0.5),
          r - 2.2,
          o.depth / 2 - 0.4
        ]);
        e.mesh(d, "box", m.brass, [
          1.5,
          0.08,
          0.1
        ]), e.shape(d, [
          [-0.6, 0],
          [0.6, 0],
          [0.6, -2.5],
          [0, -2.9],
          [-0.6, -2.5]
        ], m.slate, [
          0,
          -0.05,
          0.06
        ]), e.mesh(d, "box", m.cloth, [
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
        Mi(e, i, l, a);
        break;
      }
      const r = a.height, c = Math.min(r, 0.65);
      a.wallUse === "homes" && vi(e, l, o), e.mesh(i, "box", m.mortar, [
        o.width,
        c,
        o.depth
      ], [
        0,
        c / 2,
        0
      ]), r > c && e.mesh(l, "box", n ? m.marble : m.stone, [
        o.width,
        r - c,
        o.depth
      ], [
        0,
        (r + c) / 2,
        0
      ]), e.mesh(l, "box", m.light, [
        o.width + 0.12,
        0.23,
        o.depth + 0.12
      ], [
        0,
        r,
        0
      ]);
      const d = o.width > o.depth, h = Math.max(o.width, o.depth);
      if (n) {
        for (const u of [1.1, r - 0.55]) e.mesh(l, "box", m.light, [
          o.width + 0.15,
          0.22,
          o.depth + 0.15
        ], [
          0,
          u,
          0
        ]);
        for (let u = -h / 2 + 3; u < h / 2 - 1; u += 6) for (const v of [-1, 1]) {
          const f = e.group(l, [
            d ? u : v * (o.width / 2 + 0.04),
            0,
            d ? v * (o.depth / 2 + 0.04) : u
          ]);
          f.rotation.y = d ? v < 0 ? Math.PI : 0 : v * Math.PI / 2;
          const g = r * 0.61, b = Math.min(2.1, r * 0.3);
          e.mesh(f, "box", m.undercroft, [
            1.5,
            b,
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
          ]) e.mesh(f, "box", m.shadow, [
            0.07,
            b,
            0.06
          ], [
            _,
            g,
            0.06
          ]);
          for (const _ of [-1, 1]) e.mesh(f, "box", m.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            g + _ * b / 2,
            0.06
          ]);
          e.mesh(f, "box", m.stone, [
            0.45,
            r - 1,
            0.32
          ], [
            2.2,
            r / 2,
            0
          ]);
        }
        break;
      }
      for (let u = -h / 2 + 1; u < h / 2; u += 3.5) {
        r > 4 && e.mesh(l, "box", m.stone, d ? [
          1.3,
          0.85,
          o.depth
        ] : [
          o.width,
          0.85,
          1.3
        ], [
          d ? u : 0,
          r + 0.55,
          d ? 0 : u
        ]);
        for (let v = 0; v < Math.floor(r / 0.9); v++) e.mesh(l, "box", m.mortar, d ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          d ? u + v % 2 * 0.7 : o.width / 2 + 0.01,
          0.55 + v * 0.85,
          d ? o.depth / 2 + 0.01 : u + v % 2 * 0.7
        ]);
      }
      break;
    }
    case "water":
      e.mesh(i, "box", m.water, [
        o.width,
        0.12,
        o.depth
      ], [
        0,
        -0.18,
        0
      ]);
      for (let r = 0; r < o.width * o.depth / 9; r++) {
        const c = Math.sin(r * 7.3) * (o.width / 2 - 0.8), d = Math.cos(r * 3.7) * (o.depth / 2 - 0.3);
        e.mesh(i, "box", m.ripple, [
          0.4 + r % 4 * 0.3,
          0.012,
          0.04
        ], [
          c,
          -0.11,
          d
        ], !0);
      }
      break;
    case "planter":
      e.mesh(i, "box", m.stone, [
        o.width,
        0.55,
        o.depth
      ], [
        0,
        0.275,
        0
      ]), e.mesh(i, "box", m.soil, [
        o.width - 0.35,
        0.1,
        o.depth - 0.35
      ], [
        0,
        0.57,
        0
      ]);
      for (let r = -o.width / 2 + 0.65; r < o.width / 2; r += 1) for (let c = -o.depth / 2 + 0.6; c < o.depth / 2; c += 0.95) {
        const d = Math.sin(r * 7 + c * 19), h = o.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", d > 0.3 ? m.leafLight : m.leaf, [
          h,
          0.32 + d * 0.1,
          h * 0.9
        ], [
          r + d * 0.15,
          0.81,
          c
        ]), d > 0.5 && e.mesh(i, "rock", d > 0.8 ? m.light : m.rose, [
          0.1,
          0.12,
          0.1
        ], [
          r + 0.1,
          1.13,
          c
        ]);
      }
      break;
    case "thicket":
      e.mesh(i, "box", m.soil, [
        o.width,
        0.2,
        o.depth
      ], [
        0,
        0.07,
        0
      ]);
      for (let r = -o.width / 2 + 0.7; r < o.width / 2; r += 1.3) for (let c = -o.depth / 2 + 0.65; c < o.depth / 2; c += 1.25) {
        const d = Math.sin(r * 13 + c * 7), h = 0.6 + d * 0.2;
        e.mesh(i, "crown", d > 0 ? m.leaf : m.leafLight, [
          0.7,
          h,
          0.7
        ], [
          r,
          h * 0.75,
          c
        ]), d > 0.75 && e.mesh(i, "rock", m.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          r,
          h * 1.65,
          c
        ]);
      }
      break;
    case "wagon":
      e.mesh(i, "box", m.wood, [
        o.width - 1,
        0.35,
        o.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const r of [-1, 1]) {
        for (let c = 0; c < 3; c++) e.mesh(i, "box", m.wood, [
          0.12,
          0.24,
          o.depth - 1
        ], [
          r * (o.width / 2 - 0.5),
          1.4 + c * 0.29,
          0
        ]);
        for (const c of [-o.depth * 0.28, o.depth * 0.28]) {
          if (a.damaged && r < 0 && c > 0) {
            e.mesh(i, "torus", m.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -o.width / 2 + 0.8,
              0.18,
              c
            ]).rotation.x = Math.PI / 2, e.mesh(i, "box", m.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -o.width / 2 + 0.8,
              0.18,
              c
            ]), e.mesh(i, "box", m.wood, [
              0.1,
              0.1,
              1.1
            ], [
              -o.width / 2 + 0.8,
              0.18,
              c
            ]);
            continue;
          }
          e.mesh(i, "torus", m.shadow, [
            0.7,
            0.7,
            0.7
          ], [
            r * (o.width / 2 - 0.2),
            0.76,
            c
          ]).rotation.y = Math.PI / 2;
          for (let d = 0; d < 4; d++) {
            const h = e.mesh(i, "box", m.wood, [
              0.09,
              1.25,
              0.09
            ], [
              r * (o.width / 2 - 0.2),
              0.76,
              c
            ]);
            h.rotation.x = d * Math.PI / 4;
          }
        }
      }
      e.mesh(i, "box", m.cloth, [
        1.4,
        0.8,
        1.8
      ], [
        0,
        1.7,
        -0.8
      ]), e.mesh(i, "cylinder", m.timber, [
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
      for (let r = 0; r < 4; r++) {
        const c = e.group(i, [
          r % 2 * 1.5 - 0.75,
          r === 3 ? 1.3 : 0,
          r < 2 ? -0.7 : 0.7
        ]);
        e.mesh(c, "box", m.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const d of [-1, 1]) e.mesh(c, "box", m.timber, [
          0.1,
          1.25,
          1.3
        ], [
          d * 0.43,
          0.6,
          0
        ]);
        e.mesh(c, "box", m.light, [
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
      e.mesh(i, "box", m.wood, [
        o.width - 0.3,
        0.18,
        o.depth - 0.2
      ], [
        0,
        0.72,
        0
      ]), e.mesh(i, "box", m.wood, [
        0.13,
        0.75,
        o.depth - 0.2
      ], [
        -o.width / 2 + 0.1,
        1.12,
        0
      ]);
      for (const r of [-1, 1]) e.mesh(i, "box", m.shadow, [
        o.width - 0.5,
        0.7,
        0.22
      ], [
        0,
        0.35,
        r * (o.depth / 2 - 0.5)
      ]);
      break;
    case "ruin":
      e.mesh(i, "box", m.stone, [
        o.width,
        0.5,
        o.depth
      ], [
        0,
        0.25,
        0
      ]);
      for (let r = 0; r < 3; r++) {
        const c = -o.width * 0.3 + r * o.width * 0.3, d = (a.height ?? 3) * (1 - r * 0.22), h = o.width * 0.11;
        e.mesh(l, "cylinder", m.stone, [
          h,
          d,
          h
        ], [
          c,
          d / 2 + 0.3,
          -o.depth * 0.2
        ]), e.mesh(l, "box", m.light, [
          h * 2.6,
          0.25,
          h * 2.6
        ], [
          c,
          d + 0.3,
          -o.depth * 0.2
        ]);
        for (let u = 0; u < 6; u++) {
          const v = u * Math.PI / 3;
          e.mesh(l, "box", m.mortar, [
            0.055,
            d * 0.8,
            0.055
          ], [
            c + Math.sin(v) * h,
            d / 2 + 0.3,
            -o.depth * 0.2 + Math.cos(v) * h
          ]);
        }
      }
      e.mesh(i, "rock", m.grassDark, [
        o.width * 0.4,
        0.3,
        o.depth * 0.3
      ], [
        0,
        0.7,
        o.depth * 0.2
      ]);
      break;
  }
  return l.children.length > 0;
}
var va = 1e-7;
function xn(e, t, s) {
  return (t[0] - e[0]) * (s[1] - e[1]) - (t[1] - e[1]) * (s[0] - e[0]);
}
function us(e, t, s, a) {
  const n = [];
  for (let o = 0; o < e.length; o++) {
    const i = e[o], l = e[(o + 1) % e.length], r = xn(t, s, i), c = xn(t, s, l), d = a ? r >= -1e-7 : r <= va, h = a ? c >= -1e-7 : c <= va;
    if (d && n.push(i), d !== h && Math.abs(r - c) > va) {
      const u = r / (r - c);
      n.push([i[0] + (l[0] - i[0]) * u, i[1] + (l[1] - i[1]) * u]);
    }
  }
  return n;
}
function or(e) {
  return Math.abs(e.reduce((t, s, a) => t + s[0] * e[(a + 1) % e.length][1] - s[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function $i(e, t) {
  let s = e;
  const a = [];
  for (let n = 0; n < t.length && s.length >= 3; n++) {
    const o = t[n], i = t[(n + 1) % t.length], l = us(s, o, i, !1);
    or(l) > va && a.push(l), s = us(s, o, i, !0);
  }
  return a;
}
function Ai(e, t, s) {
  const a = t[0] - e[0], n = t[1] - e[1], o = s / (2 * Math.hypot(a, n)), i = -n * o, l = a * o;
  return [
    [e[0] + i, e[1] + l],
    [e[0] - i, e[1] - l],
    [t[0] - i, t[1] - l],
    [t[0] + i, t[1] + l]
  ];
}
function ir(e, t) {
  const s = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) s.push(Ai(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, o] of a.points.slice(1, -1)) s.push(Array.from({ length: 12 }, (i, l) => {
      const r = l * Math.PI / 6, c = (a.width + t) / 2;
      return [n + Math.cos(r) * c, o + Math.sin(r) * c];
    }));
  }
  return s;
}
function Pi(e, t = 0) {
  const s = ir(e, t), a = [];
  for (let n = 0; n < s.length; n++) {
    let o = [s[n]];
    for (let i = 0; i < n && o.length; i++) o = o.flatMap((l) => $i(l, s[i]));
    a.push(...o.filter((i) => or(i) > va));
  }
  return a;
}
function Ei(e, t, s, a) {
  const n = s === "marble", o = s === "street";
  for (const [r, c, d] of [[
    0.4,
    0.025,
    n ? m.brass : o ? m.streetSeam : m.mortar
  ], [
    0,
    0.04,
    n ? m.slate : o ? m.streetStone : m.stone
  ]]) for (const h of Pi(t, r)) {
    const u = h.reduce((g, b) => g + b[0], 0) / h.length, v = h.reduce((g, b) => g + b[1], 0) / h.length, f = e.shape(a(u, v), h.map((g) => [g[0], -g[1]]), d, [
      0,
      c,
      0
    ]);
    f.rotation.x = -Math.PI / 2, f.castShadow = !1;
  }
  const i = ir(t, 0.4);
  let l = 0;
  for (const r of t) {
    for (let c = 1; c < r.points.length; c++, l++) {
      const d = r.points[c - 1], h = r.points[c], u = h[0] - d[0], v = h[1] - d[1], f = Math.hypot(u, v);
      for (let g = 1.5; g < f; g += 1.65) {
        const b = d[0] + u * g / f, _ = d[1] + v * g / f;
        if (i.some((S, y) => y !== l && S.every((x, w) => xn(x, S[(w + 1) % S.length], [b, _]) >= -1e-7))) continue;
        const M = e.mesh(a(b, _), "box", n ? m.shadow : o ? m.streetSeam : m.mortar, [
          r.width - 0.08,
          0.012,
          0.025
        ], [
          b,
          0.049,
          _
        ]);
        if (M.rotation.y = Math.atan2(u, v), M.castShadow = !1, o) {
          const S = e.mesh(a(b, _), "box", m.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            b + Math.cos(g) * 0.55,
            0.049,
            _
          ]);
          S.rotation.y = Math.atan2(u, v), S.castShadow = !1;
        }
      }
    }
    l += r.points.length - 2;
  }
}
function Ii(e, t) {
  const s = e.x - e.width / 2, a = s + e.width, n = e.z - e.depth / 2, o = n + e.depth, i = Math.max(s, t.x - t.width / 2), l = Math.min(a, t.x + t.width / 2), r = Math.max(n, t.z - t.depth / 2), c = Math.min(o, t.z + t.depth / 2);
  return i >= l || r >= c ? [e] : [
    [
      s,
      n,
      a,
      r
    ],
    [
      s,
      c,
      a,
      o
    ],
    [
      s,
      r,
      i,
      c
    ],
    [
      l,
      r,
      a,
      c
    ]
  ].filter(([d, h, u, v]) => u > d && v > h).map(([d, h, u, v]) => ({
    x: (d + u) / 2,
    z: (h + v) / 2,
    width: u - d,
    depth: v - h
  }));
}
function ds(e, t, s) {
  const a = s[0] - t[0], n = s[1] - t[1], o = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * o, e.y - t[1] - n * o);
}
function zi(e, t, s) {
  const a = [], n = /* @__PURE__ */ new Map(), o = [], i = new Pr(), l = new ct(), r = new jr(), c = [];
  function d(y, x) {
    const w = `${Math.floor(y / 16)}:${Math.floor(x / 16)}`;
    let I = n.get(w);
    return I || (I = e.group(t), n.set(w, I)), I;
  }
  let h = [s.bounds];
  for (const y of s.features.filter((x) => x.kind === "water")) h = h.flatMap((x) => Ii(x, y.footprint));
  const u = s.surface === "grass", v = s.surface === "marble", f = s.surface === "street", g = s.surface === "boards", b = g ? m.wood : u ? m.grass : f ? m.street : s.surface === "wet" ? m.wetStone : v ? m.marble : m.stone;
  for (const y of h)
    if (e.mesh(d(y.x, y.z), "box", b, [
      y.width,
      0.6,
      y.depth
    ], [
      y.x,
      -0.32,
      y.z
    ]).castShadow = !1, g) for (let x = y.x - y.width / 2; x < y.x + y.width / 2; x += 1) for (let w = y.z - y.depth / 2; w < y.z + y.depth / 2; w += 4) {
      const I = Math.min(4, y.z + y.depth / 2 - w);
      e.mesh(d(x, w), "box", ls[Math.abs(x + w) % ls.length], [
        0.985,
        0.018,
        I - 0.025
      ], [
        x + 0.5,
        -9e-3,
        w + I / 2
      ]).castShadow = !1;
    }
    else if (!u && !f) for (let x = y.x - y.width / 2; x < y.x + y.width / 2; x += 4) for (let w = y.z - y.depth / 2; w < y.z + y.depth / 2; w += 4) {
      const I = Math.min(4, y.x + y.width / 2 - x), N = Math.min(4, y.z + y.depth / 2 - w), j = v ? Math.round(x / 4 + w / 4) % 2 ? m.marble : m.marbleLight : b;
      e.mesh(d(x, w), "box", j, [
        I - 0.04,
        0.018,
        N - 0.04
      ], [
        x + I / 2,
        -9e-3,
        w + N / 2
      ]).castShadow = !1;
    }
  if (Ei(e, s.roads, s.surface, d), f) for (let y = 0; y < 320; y++) {
    const x = s.bounds.x + Math.sin(y * 127.13) * (s.bounds.width / 2 - 3), w = s.bounds.z + Math.cos(y * 53.71) * (s.bounds.depth / 2 - 3), I = {
      x,
      y: w
    };
    if (s.features.some((P) => fn(I, P.footprint))) continue;
    const N = Math.min(...s.roads.flatMap((P) => P.points.slice(1).map((Z, E) => ds(I, P.points[E], Z))));
    if (N < 2 || N > 9) continue;
    const j = e.mesh(d(x, w), "box", y % 3 ? m.streetSeam : m.streetStone, [
      0.4 + y % 3 * 0.18,
      0.025,
      0.25
    ], [
      x,
      -2e-3,
      w
    ]);
    j.rotation.y = y * 0.41, j.castShadow = !1;
  }
  if (v) {
    const y = d(0, -17);
    for (const x of [
      4,
      4.4,
      5.5
    ]) e.ring(y, m.brass, x, 0, -17, 1, !1, 0.09);
    for (let x = 0; x < 12; x++) {
      const w = x * Math.PI / 6;
      e.shape(y, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], m.brass, [
        Math.sin(w) * 4.6,
        0.095,
        -17 + Math.cos(w) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, w);
    }
  }
  for (const y of s.suspended ?? []) {
    const x = e.group(t);
    bi(e, x, y), a.push(e.bake(x)), o.push({
      root: x,
      bounds: new Pa().setFromObject(x).expandByScalar(0.1)
    });
  }
  const { bounds: _ } = s;
  for (let y = 0; y < (u ? 420 : 0); y++) {
    const x = _.x + Math.sin(y * 127.13) * (_.width / 2 - 3), w = _.z + Math.cos(y * 53.71) * (_.depth / 2 - 3), I = {
      x,
      y: w
    };
    if (s.features.some((j) => fn(I, {
      ...j.footprint,
      width: j.footprint.width + 1.5,
      depth: j.footprint.depth + 1.5
    })) || s.roads.some((j) => j.points.slice(1).some((P, Z) => ds(I, j.points[Z], P) < j.width / 2 + 1))) continue;
    const N = d(x, w);
    if (y % 4 === 0) {
      const j = Array.from({ length: 9 }, (Z, E) => {
        const B = E * Math.PI * 2 / 9, q = 1 + Math.sin(E * 7 + y) * 0.3;
        return [Math.cos(B) * q * (1.2 + y % 3), Math.sin(B) * q * (0.7 + y % 2)];
      }), P = e.shape(N, j, y % 8 ? m.grassDark : m.grassLight, [
        x,
        5e-3,
        w
      ]);
      P.rotation.x = -Math.PI / 2;
    } else {
      for (let j = 0; j < 3; j++) {
        const P = e.mesh(N, "cone", y % 3 ? m.grassDark : m.leafLight, [
          0.035,
          0.3 + j * 0.09,
          0.035
        ], [
          x + (j - 1) * 0.16,
          0.15,
          w
        ]);
        P.rotation.z = (j - 1) * 0.35;
      }
      y % 11 === 0 && e.mesh(N, "rock", m.light, [
        0.12,
        0.13,
        0.12
      ], [
        x,
        0.38,
        w
      ]);
    }
  }
  for (const y of s.features) {
    const x = y.footprint, w = x.width > x.depth, I = Math.max(x.width, x.depth), N = y.kind === "wall" ? Math.ceil(I / 7) : 1, j = e.group(t);
    j.name = y.id;
    for (let P = 0; P < N; P++) {
      const Z = -I / 2 + (P + 0.5) * I / N, E = N === 1 ? x : {
        ...x,
        x: x.x + (w ? Z : 0),
        z: x.z + (w ? 0 : Z),
        width: w ? I / N : x.width,
        depth: w ? x.depth : I / N
      }, B = N === 1 ? j : e.group(j);
      Ci(e, d(E.x, E.z), B, {
        ...y,
        footprint: E
      }, s.vista === "interior") ? (a.push(e.bake(B)), o.push({
        root: B,
        bounds: new Pa().setFromObject(B).expandByScalar(0.35)
      })) : B.removeFromParent();
    }
  }
  for (const y of s.roads.slice(0, 1)) for (let x = 1; x < y.points.length; x++) {
    const [w, I] = y.points[x];
    if (!(s.vista === "camp" && Math.hypot(w, I - 8) < 13))
      for (const N of [-1, 1]) sr(e, d(w, I), w + N * (y.width / 2 + 0.6), I);
  }
  const M = e.group(t), S = s.vista === "interior" || s.vista === "room";
  if (e.mesh(M, "box", S ? m.undercroft : m.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, s.vista === "camp") for (let y = 0; y < 13; y++) {
    const x = -55 - y % 2 * 6, w = -44 + y * 7, I = 7 + y % 3 * 2;
    e.mesh(M, "box", m.distantWall, [
      10,
      I,
      6.5
    ], [
      x,
      I / 2,
      w
    ]);
    const N = e.mesh(M, "box", m.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      x,
      I,
      w
    ]);
    N.rotation.z = -0.16;
    for (let j = -1; j <= 1; j++) e.mesh(M, "box", y % 4 ? m.shadow : m.ember, [
      0.05,
      0.7,
      0.6
    ], [
      x + 5.03,
      I - 1.7,
      w + j * 1.6
    ], y % 4 === 0);
  }
  for (let y = 0; y < (S ? 0 : 12); y++) {
    const x = (y % 2 ? 1 : -1) * (_.width / 2 + 15 + y % 3 * 8), w = _.z - 25 + y * 7;
    e.mesh(M, "crown", y % 3 ? m.distantGround : m.distantLeaf, [
      17 + y % 4 * 3,
      6 + y % 3 * 2,
      22
    ], [
      x,
      -3,
      w
    ]);
  }
  for (let y = 0; y < (S || s.vista === "garden" ? 0 : 9); y++) {
    const x = (y - 4) * 12, w = _.z - _.depth / 2 - 15 - y % 3 * 6, I = 9 + y % 4 * 3;
    e.mesh(M, "box", m.distantWall, [
      9,
      I,
      9
    ], [
      x,
      I / 2 - 2,
      w
    ]), e.mesh(M, "cone", m.distantRoof, [
      7,
      6,
      7
    ], [
      x,
      I + 1,
      w
    ]);
    for (let N = -1; N <= 1; N++) e.mesh(M, "box", m.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      x + N * 2.2,
      I - 4,
      w + 4.55
    ]);
  }
  if (!S && s.vista !== "garden") {
    const y = _.z - _.depth / 2 - 28;
    e.mesh(M, "cylinder", m.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      y
    ]);
    for (const x of [
      10,
      22,
      33
    ]) e.mesh(M, "cylinder", m.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      x,
      y
    ]);
    for (let x = 0; x < 6; x++) {
      const w = x * Math.PI / 3, I = -17 + Math.sin(w) * 8.8, N = y + Math.cos(w) * 8.8;
      e.mesh(M, "box", m.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        I,
        19,
        N
      ]);
      const j = e.mesh(M, "box", m.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(w) * 9.02,
        26,
        y + Math.cos(w) * 9.02
      ], !0);
      j.rotation.y = w;
    }
    e.mesh(M, "cylinder", m.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      y
    ]), e.mesh(M, "cone", m.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      y
    ]);
  }
  a.push(e.bake(M));
  for (const y of n.values()) a.push(e.bake(y));
  return {
    update(y, x) {
      i.direction.copy(l.set(Math.sin(x), rt.height / rt.distance, Math.cos(x)).normalize());
      for (const w of o) {
        c.length = 0;
        for (const I of [0.1, 1.6])
          if (i.origin.set(y.x, I, y.y), r.ray.copy(i), i.intersectsBox(w.bounds) && r.intersectObject(w.root, !0, c), c.length) break;
        w.root.visible = c.length === 0;
      }
    },
    dispose() {
      a.forEach((y) => y()), t.clear();
    }
  };
}
function Li(e, t, s, a, n, o, i = !0) {
  const l = ya([...o], s), r = e.group(t, [
    a,
    0,
    n
  ]), c = e.group(t), d = s === "sanniang", h = s === "laobai", u = s === "kouzi";
  r.rotation.y = d ? 0.25 : -0.35, i && (u || s === "anian") && (r.position.y = -0.3), r.scale.setScalar(h ? 1.24 : u ? 1.06 : s === "anian" ? 1.19 : 1.12);
  const v = d ? "#343d59" : h ? "#596a80" : u ? "#53617a" : "#79647d", f = "#615047", g = "#dfbaa0", b = h ? 0.39 : u ? 0.25 : 0.29, _ = h ? 0.31 : 0.23, M = [];
  for (const F of [-1, 1]) {
    const U = e.group(r, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    U.rotation.x = i && (u || s === "anian") ? -1.15 : F * 0.06, M.push(U), e.mesh(U, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(U, "cylinder", f, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(U, "sphere", f, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(r, "sphere", v, [
    b,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(r, "cylinder", v, [
    _,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(r, "cylinder", f, [
    _ + 0.015,
    0.08,
    0.23
  ], [
    0,
    1.01,
    0
  ]), e.mesh(r, "box", "#c6aa72", [
    0.13,
    0.11,
    0.03
  ], [
    0,
    1.01,
    0.244
  ]), e.mesh(r, "cylinder", g, [
    0.095,
    0.2,
    0.1
  ], [
    0,
    1.68,
    0
  ]);
  const S = e.group(r, [
    0,
    1.93,
    0.025
  ]);
  S.rotation.x = d ? 0.1 : -0.025, e.mesh(S, "sphere", g, [
    0.215,
    0.285,
    0.22
  ]);
  const y = d ? "#272b42" : u ? "#643d41" : s === "anian" ? "#483b40" : "#30343e";
  e.mesh(S, "sphere", y, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(S, "sphere", y, [
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
    ]), e.mesh(S, "box", y, [
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
    const U = e.group(r, [
      F * b,
      1.48,
      0
    ]);
    U.rotation.z = F * 0.11, U.rotation.x = d ? F > 0 ? -0.85 : -0.2 : F > 0 ? -0.4 : -0.1, e.mesh(U, "cylinder", v, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(U, "cylinder", d ? "#e8e1cc" : "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(U, "cylinder", g, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(U, "sphere", g, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]), d && F > 0 && (e.mesh(U, "cylinder", "#b67e3f", [
      0.073,
      0.21,
      0.073
    ], [
      0,
      -0.68,
      0.1
    ]), e.mesh(U, "cylinder", "#dbc8a2", [
      0.045,
      0.055,
      0.045
    ], [
      0,
      -0.55,
      0.1
    ]));
  }
  if (d) {
    e.mesh(r, "cylinder", v, [
      0.125,
      0.23,
      0.12
    ], [
      0,
      1.66,
      0
    ]), e.shape(r, [
      [-0.21, 0.36],
      [0.21, 0.36],
      [0.3, -0.36],
      [-0.3, -0.36]
    ], "#eee7d3", [
      0,
      1.02,
      0.238
    ], 0.014), e.mesh(r, "box", "#d0c4a4", [
      0.18,
      0.17,
      0.025
    ], [
      0.07,
      0.85,
      0.276
    ]);
    for (const F of [-1, 1]) {
      const U = e.mesh(r, "box", "#eee7d3", [
        0.052,
        0.53,
        0.025
      ], [
        F * 0.16,
        1.39,
        0.19
      ]);
      U.rotation.z = -F * 0.15;
    }
    e.mesh(S, "sphere", y, [
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
    ]).rotation.z = 1.2, e.mesh(r, "cone", v, [
      0.4,
      0.85,
      0.32
    ], [
      0,
      0.66,
      0
    ]), e.mesh(r, "cylinder", "#803f4e", [
      0.27,
      0.075,
      0.245
    ], [
      0,
      1.01,
      0
    ]), e.shape(r, [
      [-0.35, 0.2],
      [0.35, 0.2],
      [0.43, -0.22],
      [-0.43, -0.22]
    ], v, [
      0,
      1.43,
      -0.23
    ], 0.018), e.mesh(r, "box", f, [
      0.24,
      0.28,
      0.17
    ], [
      -0.31,
      0.9,
      -0.05
    ]);
  } else if (h) {
    e.mesh(r, "sphere", v, [
      0.34,
      0.35,
      0.2
    ], [
      0,
      1.17,
      0.1
    ]), e.shape(r, [
      [-0.41, 0.34],
      [0.41, 0.34],
      [0.49, -0.58],
      [0.18, -0.7],
      [-0.35, -0.57]
    ], "#627a92", [
      0,
      1.18,
      -0.26
    ], 0.025), e.mesh(r, "box", "#aeb7b6", [
      0.44,
      0.14,
      0.11
    ], [
      0,
      1.62,
      0.19
    ]);
    const F = e.group(r, [
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
    ]), e.mesh(r, "cylinder", "#e4dfcd", [
      0.13,
      0.25,
      0.14
    ], [
      0.16,
      0.36,
      0.06
    ]);
  } else if (u) {
    if (e.mesh(r, "cylinder", "#b48859", [
      0.18,
      0.17,
      0.17
    ], [
      0,
      1.65,
      0
    ]), e.mesh(r, "box", "#b48859", [
      0.17,
      0.38,
      0.04
    ], [
      0.08,
      1.42,
      0.24
    ]), e.mesh(r, "cylinder", "#74869e", [
      0.025,
      0.48,
      0.025
    ], [
      -0.36,
      0.67,
      0.18
    ]), e.mesh(r, "box", "#74869e", [
      0.13,
      0.11,
      0.055
    ], [
      -0.36,
      0.92,
      0.18
    ]), l && i) {
      r.position.y = 0.5;
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
      for (const U of [-1, 1]) e.mesh(c, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + U * 0.8,
        0.35,
        n
      ]);
    }
    e.mesh(r, "box", "#e7dbc4", [
      0.28,
      0.22,
      0.23
    ], [
      0.16,
      0.53,
      0.03
    ]), e.mesh(r, "box", "#6f5540", [
      0.24,
      0.21,
      0.15
    ], [
      -0.3,
      1,
      0.12
    ]), o.has("supplies_secured") && e.mesh(r, "cylinder", "#8caaa7", [
      0.035,
      0.44,
      0.035
    ], [
      -0.32,
      1.11,
      0.22
    ]), e.mesh(r, "box", "#6b5944", [
      0.52,
      0.43,
      0.03
    ], [
      0,
      1.29,
      0.24
    ]);
  } else {
    e.mesh(r, "cone", v, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(S, "sphere", y, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let U = 0; U < 3; U++) {
      const H = e.mesh(r, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + U * 0.02,
        1.02,
        0.31 + U * 0.023
      ]);
      H.rotation.z = U * 0.1;
    }
    const F = e.mesh(r, "box", "#d8ba87", [
      0.075,
      0.83,
      0.04
    ], [
      0,
      1.25,
      0.22
    ]);
    F.rotation.z = -0.55, e.mesh(r, "box", f, [
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
  S.removeFromParent(), M.forEach((F) => F.removeFromParent());
  const w = M.map((F) => e.bake(F)), I = e.bake(r), N = e.bake(S), j = e.bake(c);
  r.add(S, ...M);
  const P = r.position.y, Z = r.rotation.y, E = {
    x: a,
    y: n
  };
  let B = -1 / 0, q = 0;
  return {
    root: r,
    ring: x,
    id: s,
    position: E,
    seated: i,
    locate(F, U) {
      const H = E.x !== F.position.x || E.y !== F.position.y;
      return H && (B = U), q = F.facing, E.x = F.position.x, E.y = F.position.y, r.position.x = E.x, r.position.z = E.y, x.position.x = E.x, x.position.z = E.y, H;
    },
    update(F, U, H) {
      const ne = U - B < 120, Ne = Math.hypot(F.x - E.x, F.y - E.y) < 10;
      x.visible = Ne;
      const De = ne ? Math.PI / 2 - q : Ne ? Math.atan2(F.x - E.x, F.y - E.y) : Z, Me = Math.atan2(Math.sin(De - r.rotation.y), Math.cos(De - r.rotation.y));
      r.rotation.y += H ? Me : Me * 0.16, r.position.y = P + (H ? 0 : Math.sin(U * 15e-4 + a) * 0.012), S.rotation.y = H ? 0 : Math.sin(U * 8e-4 + n) * 0.04, i || M.forEach((le, be) => {
        le.rotation.x = H || !ne ? 0 : Math.sin(U * 0.012 + be * Math.PI) * 0.45;
      });
    },
    dispose() {
      I(), N(), j(), w.forEach((F) => F()), r.removeFromParent(), c.removeFromParent(), x.removeFromParent();
    }
  };
}
function Ti(e, t, s, a) {
  const n = e.group(t), o = ia[s.id], i = Object.values(Ue).find((h) => h.scene === s.id);
  let l = a, r = !1;
  const c = (o?.waves[0] ?? []).map((h) => {
    const u = On(e, n, h.kind, Wa[0]);
    u.bar.removeFromParent();
    const v = s.anchors[h.anchor], f = i?.sentryExits[h.anchor], g = f ? s.anchors[f] : v, b = a.has(o.complete) ? g : v;
    return u.root.position.set(b.x, 0, b.y), {
      ...u,
      home: v,
      aside: g,
      dispose: e.bake(u.root)
    };
  }), d = () => {
    n.visible = !r && !!o && (!!i || !l.has(o.complete));
  };
  return d(), {
    setFacts(h) {
      l = h, d();
    },
    setEncounterActive(h) {
      r = h, d();
    },
    animate(h) {
      if (!n.visible) return !1;
      let u = !1;
      for (const v of c) {
        const f = l.has(o.complete) ? v.aside : v.home, g = f.x - v.root.position.x, b = f.y - v.root.position.z, _ = Math.hypot(g, b);
        if (_ < 1e-3) continue;
        const M = h ? 1 : Math.min(1, 0.36 / _);
        v.root.position.x += g * M, v.root.position.z += b * M, v.root.rotation.y = _ > 0.4 ? Math.atan2(g, b) : 0, u = !0;
      }
      return u;
    },
    dispose() {
      c.forEach((h) => h.dispose()), n.removeFromParent();
    }
  };
}
function ji(e, t, s, a) {
  const n = Ue[s], o = On(e, t, n.kind, Wa[0]);
  o.bar.removeFromParent();
  const i = e.bake(o.root), l = { ...La(s, a) };
  o.root.position.set(l.x, 0, l.y);
  let r = a;
  return {
    id: s,
    root: o.root,
    position: l,
    setFacts(c) {
      r = c;
    },
    update(c, d) {
      const h = La(s, r), u = c.x - h.x, v = c.y - h.y, f = Math.hypot(u, v), g = f <= n.approachRadius, b = g && !r.has(n.complete) ? 1 : 0, _ = h.x + (f ? u / f * b : 0), M = h.y + (f ? v / f * b : 0), S = l.x + l.y + o.root.rotation.y;
      l.x += d ? _ - l.x : (_ - l.x) * 0.22, l.y += d ? M - l.y : (M - l.y) * 0.22, Math.abs(_ - l.x) + Math.abs(M - l.y) < 0.01 && (l.x = _, l.y = M);
      const y = g ? Math.atan2(u, v) : 0, x = Math.atan2(Math.sin(y - o.root.rotation.y), Math.cos(y - o.root.rotation.y));
      return o.root.rotation.y += d || Math.abs(x) < 5e-3 ? x : x * 0.2, o.root.position.set(l.x, 0, l.y), S !== l.x + l.y + o.root.rotation.y;
    },
    dispose() {
      i(), o.root.removeFromParent();
    }
  };
}
var Re = (e, t, s, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: s,
  facing: a
}), lr = {
  camp: [
    {
      id: "mender",
      name: "补衣人",
      activity: "mend",
      coat: "rose",
      phase: 0,
      route: [Re(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [Re(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [Re(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [Re(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        Re(-31, 18, 6, -Math.PI / 2),
        Re(-27, 16, 0),
        Re(-23, 13, 7, Math.PI),
        Re(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        Re(10, 7, 6),
        Re(5, 10, 0),
        Re(-8, 13, 0),
        Re(-18, 14, 8, Math.PI),
        Re(-8, 13, 0),
        Re(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [Re(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: te.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [Re(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [Re(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [Re(8, 2, 0)]
  }]
}, Oi = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, Zi = 0.85;
function hs(e, t) {
  const s = e.route;
  if (s.length === 1) return {
    position: s[0].position,
    facing: s[0].facing,
    walking: !1
  };
  const a = s.map((o, i) => {
    const l = s[(i + 1) % s.length].position;
    return o.wait + Math.hypot(l.x - o.position.x, l.y - o.position.y) / Zi;
  });
  let n = (t + e.phase) % a.reduce((o, i) => o + i, 0);
  for (let o = 0; o < s.length; o++) {
    if (n > a[o]) {
      n -= a[o];
      continue;
    }
    const i = s[o], l = s[(o + 1) % s.length].position;
    if (n <= i.wait) return {
      position: i.position,
      facing: i.facing,
      walking: !1
    };
    const r = (n - i.wait) / (a[o] - i.wait);
    return {
      position: {
        x: i.position.x + (l.x - i.position.x) * r,
        y: i.position.y + (l.y - i.position.y) * r
      },
      facing: Math.atan2(l.x - i.position.x, l.y - i.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function Ui(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function Ni(e, t) {
  e.updateWorldMatrix(!0, !0);
  const s = e.matrixWorld.clone().invert(), a = new _s(), n = [];
  e.traverse((l) => {
    if (!(l instanceof vt)) return;
    const r = (l.geometry.index ? l.geometry.toNonIndexed() : l.geometry.clone()).applyMatrix4(a.multiplyMatrices(s, l.matrixWorld)), c = l.material.color, d = new Or(new Float32Array(r.getAttribute("position").count * 3), 3);
    for (let h = 0; h < d.count; h++) d.setXYZ(h, c.r, c.g, c.b);
    r.setAttribute("color", d), n.push(r);
  });
  const o = $s(n);
  if (n.forEach((l) => l.dispose()), !o) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new vt(o, t);
  return i.receiveShadow = !0, e.add(i), () => {
    o.dispose(), e.clear();
  };
}
function Di(e, t, s, a) {
  const n = e.group(t), o = e.group(n), i = [], l = [], r = {
    blue: m.slate,
    rose: m.rose,
    cream: m.cloth
  }[s.coat], c = s.activity === "mend" || s.activity === "warm", d = "#dfbda7", h = c ? 0.75 : 1.05;
  e.mesh(o, "box", r, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    h,
    0
  ]), e.mesh(o, "crown", d, [
    0.23,
    0.27,
    0.21
  ], [
    0,
    h + 0.61,
    0
  ]), e.mesh(o, "crown", m.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    h + 0.77,
    -0.02
  ]), e.mesh(o, "box", m.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    h - 0.23,
    0
  ]), e.mesh(o, "box", m.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    h + 0.12,
    0.21
  ]);
  for (const v of [-1, 1]) {
    const f = e.group(n, [
      v * 0.36,
      h + 0.22,
      0
    ]);
    i.push(f), e.mesh(f, "box", r, [
      0.17,
      0.44,
      0.19
    ], [
      0,
      -0.2,
      0
    ]), e.mesh(f, "crown", d, [
      0.1,
      0.11,
      0.1
    ], [
      0,
      -0.46,
      0.02
    ]);
    const g = e.group(n, [
      v * 0.16,
      h - 0.31,
      0
    ]);
    l.push(g), e.mesh(g, "box", m.timber, [
      0.2,
      c ? 0.3 : 0.59,
      0.22
    ], [
      0,
      c ? -0.12 : -0.26,
      c ? 0.2 : 0
    ]), e.mesh(g, "box", m.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      c ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (c && e.mesh(o, "box", m.wood, [
    0.62,
    0.55,
    0.6
  ], [
    0,
    0.275,
    -0.12
  ]), s.activity === "water") for (const v of [-1, 1]) e.mesh(i[v > 0 ? 1 : 0], "box", m.wood, [
    0.36,
    0.39,
    0.36
  ], [
    v * 0.13,
    -0.65,
    0
  ]);
  else s.activity === "deliver" ? (e.mesh(o, "box", m.wood, [
    0.65,
    0.47,
    0.5
  ], [
    0,
    h - 0.05,
    0.45
  ]), e.mesh(o, "box", m.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    h - 0.05,
    0.72
  ])) : s.activity === "mend" || s.activity === "dressings" ? e.mesh(o, "box", m.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    h - 0.22,
    0.36
  ]) : s.activity === "warm" && e.mesh(o, "box", m.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    h + 0.1,
    0.38
  ]);
  n.traverse((v) => {
    v.castShadow = !1;
  });
  const u = [
    o,
    ...i,
    ...l
  ].map((v) => Ni(v, a));
  return {
    root: n,
    body: o,
    arms: i,
    legs: l,
    dispose() {
      u.forEach((v) => v()), n.removeFromParent();
    }
  };
}
function Fi(e, t, s) {
  const a = new ks({
    vertexColors: !0,
    roughness: 0.95
  }), n = (lr[s] ?? []).map((l) => ({
    spec: l,
    model: Di(e, t, l, a),
    time: 0
  }));
  let o = null, i = null;
  return {
    animate(l, r, c, d) {
      const h = c ? 0 : Ui(o, r);
      o = r;
      let u = n.length > 0 && i !== c;
      i = c;
      for (const v of n) {
        const { spec: f, model: g } = v, b = hs(f, v.time), _ = Math.hypot(b.position.x - l.x, b.position.y - l.y) < 27 && d(b.position);
        if (g.root.visible !== _ && (g.root.visible = _, u = !0), !_) continue;
        v.time += h;
        const M = hs(f, v.time), S = c ? 0 : Math.sin(v.time * (M.walking ? 5.5 : 1.5) + f.phase);
        g.root.position.set(M.position.x, 0, M.position.y), g.root.rotation.y = M.facing, g.body.position.y = M.walking ? Math.abs(S) * 0.035 : 0, g.legs.forEach((y, x) => {
          y.rotation.x = M.walking ? S * 0.35 * (x ? 1 : -1) : 0;
        }), g.arms.forEach((y, x) => {
          y.rotation.x = M.walking ? S * 0.24 * (x ? -1 : 1) : -0.6 + S * 0.13 * (x ? 1 : -1), f.activity === "deliver" && (y.rotation.x = -0.75), f.activity === "warm" && (y.rotation.x = -1.1), f.activity === "cook" && !x && (y.rotation.x = -0.8 + S * 0.3);
        }), u = h > 0 || u;
      }
      return u;
    },
    dispose() {
      n.forEach((l) => l.model.dispose()), a.dispose();
    }
  };
}
function Bi(e, t, s, a) {
  const n = zi(e, t, s.landscape), o = e.group(t), i = e.group(t), l = Ti(e, t, s, a), r = Fi(e, i, s.id), c = [], d = Fa.filter((g) => Ue[g].scene === s.id).map((g) => ji(e, i, g, a));
  let h = -1, u = null, v = null;
  function f(g) {
    const b = [...g].sort().join("/");
    if (b === v) return;
    v = b, d.forEach((M) => M.setFacts(g)), u?.(), l.setFacts(g);
    for (const M of Da(s, g)) {
      const S = M.position;
      if (M.kind === "exit") {
        if (!M.target.doorway) for (const y of [-1, 1]) sr(e, o, S.x + y * 1.7, S.y, 1.5);
        e.mesh(o, "box", m.brass, [
          3,
          0.025,
          0.35
        ], [
          S.x,
          0.12,
          S.y
        ]).castShadow = !1;
      } else if (M.target.kind === "inspect" && M.target.passage === "warning")
        e.mesh(o, "box", m.timber, [
          0.12,
          1.8,
          0.12
        ], [
          S.x,
          0.9,
          S.y
        ]), e.mesh(o, "box", m.wood, [
          1.4,
          0.7,
          0.13
        ], [
          S.x,
          1.6,
          S.y
        ]), e.mesh(o, "box", m.light, [
          0.7,
          0.4,
          0.025
        ], [
          S.x,
          1.6,
          S.y + 0.08
        ]);
      else if (M.target.kind === "inspect" && M.target.passage === "orders") {
        e.mesh(o, "box", m.slate, [
          2.2,
          0.8,
          1.2
        ], [
          S.x,
          0.4,
          S.y - 0.8
        ]);
        const y = e.mesh(o, "box", m.light, [
          1.8,
          0.08,
          0.9
        ], [
          S.x,
          0.85,
          S.y - 0.8
        ]);
        y.rotation.x = 0.2;
        for (let x = -1; x <= 1; x++) e.mesh(o, "cylinder", m.brass, [
          0.12,
          0.12,
          0.12
        ], [
          S.x + x * 0.45,
          0.95,
          S.y - 0.55
        ]);
      }
    }
    if (s.id === "camp") {
      const M = s.landscape.features.find((S) => S.kind === "clinic").footprint;
      if (g.has("clinic_helped")) {
        const S = s.landscape.features.find((y) => y.kind === "bench").footprint;
        for (const y of [-1, 1])
          e.mesh(o, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            S.x,
            0.91,
            S.z + y * 0.65
          ]), e.mesh(o, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            S.x,
            1.024,
            S.z + y * 0.65
          ]);
      }
      if (g.has("receiving_arranged")) for (const S of [-1, 1]) {
        const y = M.x + S * 2.4, x = M.z + M.depth / 2 - 0.2, w = e.group(o, [
          y,
          0.2,
          x
        ]);
        w.rotation.x = -0.16;
        for (const I of [-1, 1]) e.mesh(w, "cylinder", m.timber, [
          0.055,
          2.9,
          0.055
        ], [
          I * 0.42,
          1.4,
          0
        ]);
        e.mesh(w, "box", g.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const I of [0.7, 2.1]) e.mesh(w, "box", m.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          I,
          0.12
        ]);
      }
      if (g.has("warden_defeated")) {
        const S = s.landscape.features.find((y) => y.kind === "wagon").footprint;
        for (let y = 0; y < 4; y++) {
          const x = e.group(o, [
            S.x + (y % 2 ? 0.65 : -0.65),
            1.4,
            S.z + (y < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(x, "box", m.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const w of [-1, 1]) e.mesh(x, "box", m.brass, [
            0.08,
            0.78,
            1.22
          ], [
            w * 0.35,
            0.38,
            0
          ]);
          e.mesh(x, "box", m.light, [
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
      const S = s.anchors[M.anchor], y = g.has(M.fact), x = e.group(o, [
        S.x,
        0,
        S.y
      ]);
      e.mesh(x, "box", m.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(x, "box", m.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const w = e.group(x, [
        0,
        0.75,
        0
      ]);
      w.rotation.z = y ? 0.65 : -0.65, e.mesh(w, "cylinder", m.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(w, "cylinder", m.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const _ = xt(s, g);
    for (const M of s.landscape.gates) {
      const S = M.footprint, y = S.width > S.depth, x = Math.max(S.width, S.depth), w = e.group(o, [
        S.x,
        0,
        S.z
      ]);
      y || (w.rotation.y = Math.PI / 2);
      for (const I of [-1, 1]) e.mesh(w, "box", m.stone, [
        0.35,
        3.2,
        0.7
      ], [
        I * x / 2,
        1.6,
        0
      ]);
      if (e.mesh(w, "box", m.light, [
        x + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), _.closedGates.has(M.id)) {
        for (let I = -x / 2 + 0.2; I < x / 2; I += 0.4) e.mesh(w, "box", m.shadow, [
          0.065,
          3,
          0.1
        ], [
          I,
          1.5,
          0
        ]);
        for (const I of [0.4, 2.5]) e.mesh(w, "box", m.brass, [
          x,
          0.12,
          0.15
        ], [
          0,
          I,
          0
        ]);
      } else e.mesh(w, "box", m.shadow, [
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
      const S = M.footprint, y = e.mesh(o, "cylinder", m.timber, [
        0.045,
        4.8,
        0.045
      ], [
        S.x + 3.3,
        2.7,
        S.z + 2.5
      ]);
      y.rotation.z = -0.32;
      for (let x = 0; x < 5; x++) e.mesh(o, "rock", x % 2 ? m.ember : m.cloth, [
        0.55,
        1.2 + x % 3 * 0.3,
        0.55
      ], [
        S.x + Math.sin(x * 2) * 0.7,
        5.4 + x % 3 * 0.3,
        S.z + Math.cos(x * 2) * 0.7
      ], !0);
    }
    u = e.bake(o);
  }
  return f(a), {
    setFacts: f,
    people: c,
    parleyPeople: d,
    setPeople(g, b) {
      let _ = !1;
      for (const M of Ye) {
        const S = g[M], y = ga[M].station, x = ve[y.scene].anchors[y.anchor], w = S.mode === "idle" && (S.scene === "cells" || S.scene === y.scene && Math.hypot(S.position.x - x.x, S.position.y - x.y) < 1);
        let I = c.find((N) => N.id === M);
        I && (S.scene !== s.id || I.seated !== w) && (I.dispose(), c.splice(c.indexOf(I), 1), I = void 0, _ = !0), S.scene === s.id && (I || (I = Li(e, i, M, S.position.x, S.position.y, new Set(v?.split("/")), w), c.push(I), _ = !0), _ = I.locate(S, b) || _);
      }
      return _;
    },
    setEncounterActive(g) {
      l.setEncounterActive(g), d.forEach((b) => {
        b.root.visible = !g;
      });
    },
    update: n.update,
    animate(g, b, _, M) {
      const S = Math.floor(b / 80);
      if (S === h) return !1;
      h = S;
      let y = l.animate(_);
      y = r.animate(g, b, _, M) || y;
      for (const x of d) y = x.update(g, _) || y;
      for (const x of c) Math.hypot(x.position.x - g.x, x.position.y - g.y) < 22 ? (x.update(g, b, _), y = !_ || y) : x.ring.visible = !1;
      return y;
    },
    dispose() {
      r.dispose(), c.splice(0).forEach((g) => g.dispose()), d.forEach((g) => g.dispose()), i.removeFromParent(), u?.(), l.dispose(), n.dispose();
    }
  };
}
var Wi = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, qi = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Hi = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, Vi = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Gi(e, t) {
  const s = new Rr(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
  let i = 0, l = !1;
  function r(c, d) {
    i++;
    const h = s.load(c, (u) => {
      if (l) {
        u.dispose();
        return;
      }
      i--, o.delete(c);
      for (const v of d) a.set(v, u);
      e(), t(o.size, i);
    }, void 0, () => {
      l || (i--, n.delete(h), h.dispose(), o.set(c, d), t(o.size, i));
    });
    h.colorSpace = $n, h.wrapS = h.wrapT = Zr, h.anisotropy = 2, n.add(h);
  }
  for (const [c, d] of [
    [Wi, [
      m.stone,
      m.wetStone,
      m.marble,
      m.marbleLight
    ]],
    [qi, [m.light]],
    [Hi, [m.roof, m.roofLight]],
    [Vi, [
      m.grass,
      m.grassLight,
      m.grassDark
    ]]
  ]) r(c, d);
  return {
    maps: a,
    retry() {
      if (!l && i === 0) {
        for (const [c, d] of o) r(c, d);
        t(o.size, i);
      }
    },
    dispose() {
      l = !0, n.forEach((c) => c.dispose()), n.clear(), a.clear(), o.clear();
    }
  };
}
function Yi(e, t, s) {
  const a = new Ss({
    antialias: !0,
    alpha: !1,
    powerPreference: s.world ? "default" : "high-performance"
  });
  a.outputColorSpace = $n, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, s.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const o = new Ms(), i = new Rs(-10, 10, 10, -10, 0.1, 180), l = wn();
  o.add(new Cs("#effbff", "#74918a", 2));
  const r = new ln("#fff4e5", 1.9);
  r.position.set(-12, 25, 13), r.castShadow = !0;
  const c = s.world ? 1024 : 1536;
  r.shadow.mapSize.set(c, c), Object.assign(r.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), r.shadow.bias = -4e-4, r.shadow.normalBias = 0.035, r.shadow.radius = 3, o.add(r);
  const d = new ln("#c3edff", 1.1);
  d.position.set(7, 8, -15), o.add(d);
  const h = new fa(), u = new fa(), v = new fa();
  o.add(h, u, v);
  const f = nr(l, u, s.traveler.gender), g = fi(l, v), b = ui(l, v), _ = pi(n), M = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), y = [], x = matchMedia("(prefers-reduced-motion: reduce)"), w = new ct(), I = new ct();
  let N = null, j = "", P = "", Z = "", E = null, B = null, q = null, F = NaN, U = NaN, H = NaN, ne = null, Ne = 0, De = 0, Me = 1, le = 1, be = !0, ut = !1, zt = !1, We = 0, qe = -1, tt = 0, Se = !1;
  const ue = s.world ? Gi(() => {
    j = "", be = !0, s.invalidate?.();
  }, (fe, Ve) => s.artworkStatus?.(fe, Ve)) : null;
  function He() {
    const fe = e.getBoundingClientRect();
    Me = Math.max(1, fe.width), le = Math.max(1, fe.height), a.setSize(Me, le, !1), be = !0, Se = !1, s.invalidate?.();
  }
  const Le = new ResizeObserver(He);
  Le.observe(e), He();
  function Ht(fe) {
    fe.preventDefault(), zt = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", Ht);
  function Lt(fe, Ve, kt, dt, Qe = !1) {
    if (Math.abs(fe) < 1) return;
    const G = document.createElement("span");
    G.className = Qe ? "exp-damage is-player" : fe < 0 ? "exp-damage is-heal" : "exp-damage", G.textContent = `${fe < 0 ? "+" : ""}${Math.ceil(Math.abs(fe))}`, n.append(G), y.push({
      element: G,
      position: new ct(Ve, 2, kt),
      born: dt
    });
  }
  function _t() {
    for (const fe of M.values())
      u.remove(fe.actor.root), fe.marker.remove();
    M.clear(), y.splice(0).forEach((fe) => fe.element.remove());
  }
  function Tt(fe) {
    return Se ? (I.set(fe.x, 1, fe.y).project(i), Math.abs(I.x) < 1.15 && Math.abs(I.y) < 1.15) : !0;
  }
  return {
    draw(fe, Ve, kt, dt = "battle", Qe = 0, G) {
      if (ut || zt) return;
      const Ha = performance.now(), X = dt === "battle" ? fe : null, Vt = X?.tick ?? (x.matches ? 0 : Qe * 0.025), jt = (X?.tick ?? -1) !== qe, Gt = `${Ve.weapon}/${Ve.outfit}/${kt}`;
      if (!G && !be && dt === P && Gt === Z && X === E && (!jt && X || !X && (dt === "between" || x.matches || Qe - We < 40))) return;
      We = Qe;
      const la = Wa[kt], Yt = G ? G.definition.id : `${kt}:${X?.boss ?? !1}:${!!X}`;
      if (Yt !== j) {
        if (f.resetMotion(), S.forEach((O) => O.remove()), S.clear(), N?.(), G) {
          const O = wn(ue?.maps);
          B = Bi(O, h, G.definition, G.facts);
          const L = B;
          N = () => {
            L.dispose(), O.dispose();
          };
        } else
          B = null, N = ri(l, h, kt, X);
        Se = !1, j = Yt, o.background = new Cn(la.sky), o.fog = new Cr(la.haze, 42, 95);
      } else G && ne !== G.facts && B?.setFacts(G.facts);
      (!!X != !!E || X && E && X.tick < qe) && (f.resetMotion(), _t(), tt = X?.player.hp ?? 0);
      const Qt = !G && dt !== "battle", Ke = Me < 600, ca = Ke || le < 400, Kt = Me / le, ht = G?.definition.landscape.vista === "room", Xt = ht ? Ke ? 20 : Math.max(30, Kt * (le < 400 ? 19 : 25)) : G ? (Ke ? rt.mobileWidth : Math.max(rt.minimumWidth, Kt * (le < 400 ? rt.shortSpan : rt.tallSpan))) * (G.definition.safe && !X ? rt.settlementScale : 1) : Qt ? Ke ? 13 : 28 : Ke ? 18.5 : Math.max(27, Kt * (le < 400 ? 14 : 23)), Jt = Math.max(0, K.arena - Xt / 2 + 0.5), Te = G ? G.location.position.x * (ht ? 0.4 : 1) : X ? ca ? X.player.x * 0.62 : Math.max(-Jt, Math.min(Jt, X.player.x * 0.62)) : Ke ? 0 : 5.5, ua = G ? ht ? G.location.position.y * 0.4 - 1 : G.location.position.y - rt.lead : X ? X.player.y * (ca ? 0.62 : 0.2) - 0.4 : Ke ? -4.2 : -11.8;
      G && Math.hypot(F - G.location.position.x, U - G.location.position.y) > 8 && (Se = !1);
      const Ge = Math.abs(w.x - Te) + Math.abs(w.z - ua) < 0.015, Va = G && B?.setPeople(G.people, Qe), Ga = G && B?.animate(G.location.position, Qe, x.matches, Tt);
      if (G && !be && Se && Ge && Gt === Z && X === E && !jt && F === G.location.position.x && U === G.location.position.y && H === G.location.facing && ne === G.facts && !Ga && !Va && !f.animating) return;
      !Se || x.matches ? (w.set(Te, 0, ua), Se = !0) : (w.x += (Te - w.x) * 0.14, w.z += (ua - w.z) * 0.14), i.left = -Xt / 2, i.right = Xt / 2, i.top = Xt / Kt / 2, i.bottom = -i.top;
      const da = Qt ? 0 : 1 * Math.PI / 4, Ma = G ? rt.distance : 25;
      i.position.set(w.x + Math.sin(da) * Ma, G ? rt.height : 28, w.z + Math.cos(da) * Ma), i.lookAt(w.x, 0, w.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), G && (B?.setEncounterActive(!!X), B?.update(G.location.position, da)), S.forEach((O) => {
        O.hidden = !0;
      });
      const Ya = new Set(G && !X ? [...zn(G.definition, G.location.position, G.facts, G.people), ...Ba(G.definition.id, G.location.position, G.facts)].map((O) => O.target.id) : []);
      for (const O of [...B?.people ?? [], ...B?.parleyPeople ?? []]) {
        if (X || !G || Math.hypot(O.position.x - G.location.position.x, O.position.y - G.location.position.y) > 10) continue;
        let L = S.get(O.id);
        L || (L = document.createElement("span"), L.className = "exp-person-name", L.textContent = Fe(O.id), n.append(L), S.set(O.id, L)), L.textContent = Ya.has(O.id) ? `${Fe(O.id)} · ${te.actions.talk}` : Fe(O.id), I.set(O.position.x, 2.9 + O.root.position.y, O.position.y).project(i);
        const T = (I.x * 0.5 + 0.5) * Me, we = (-I.y * 0.5 + 0.5) * le;
        L.hidden = T < 30 || T > Me - 30 || we < 20 || we > le - 20, L.style.transform = `translate(${T}px,${we}px) translate(-50%,-100%)`;
      }
      s.world && (r.position.set(w.x - 12, 25, w.z + 13), r.target.position.set(w.x, 0, w.z), r.target.updateMatrixWorld());
      const Qa = G ? {
        ...G.location.position,
        facing: G.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      f.update(X?.player ?? Qa, Ve.weapon, Ve.outfit, Vt, Qe / 1e3, x.matches, Qt, !!X?.effects.some((O) => O.kind === "resonance"));
      for (const O of X?.enemies ?? []) {
        let L = M.get(O.id);
        if (!L) {
          const Ja = document.createElement("i");
          Ja.className = xe(O.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Ja), L = {
            actor: On(l, u, O.kind, la),
            hp: O.hp,
            death: null,
            marker: Ja
          }, M.set(O.id, L);
        }
        L.hp > O.hp && jt && Lt(L.hp - O.hp, O.x, O.y, X.tick), L.hp = O.hp, L.actor.update(O, X.tick, x.matches), L.actor.bar.quaternion.copy(i.quaternion), I.set(O.x, 1.2, O.y).project(i);
        const T = (I.x * 0.5 + 0.5) * Me, we = (-I.y * 0.5 + 0.5) * le, at = Math.min(18, Me / 2), nt = Math.min(Ke ? 132 : 95, le * 0.3), pr = Math.max(nt, le - Math.min(130, le * 0.3)), Ka = Math.max(at, Math.min(Me - at, T)), Xa = Math.max(nt, Math.min(pr, we));
        L.marker.hidden = Math.abs(T - Ka) + Math.abs(we - Xa) < 10, L.marker.style.transform = `translate(${Ka}px,${Xa}px) rotate(${Math.atan2(we - Xa, T - Ka) + Math.PI / 2}rad)`;
      }
      for (const [O, L] of M) {
        if (X?.enemies.some((we) => we.id === O)) continue;
        L.death === null && (L.death = X?.tick ?? 0, X && L.hp > 0 && Lt(L.hp, L.actor.root.position.x, L.actor.root.position.z, X.tick));
        const T = ((X?.tick ?? 0) - L.death) / 12;
        L.actor.bar.visible = !1, L.marker.hidden = !0, L.actor.root.scale.setScalar(Math.max(0, 1 - T)), (T >= 1 || !X || x.matches) && (u.remove(L.actor.root), L.marker.remove(), M.delete(O));
      }
      X && jt && (tt !== X.player.hp && Lt(tt - X.player.hp, X.player.x, X.player.y, X.tick, tt > X.player.hp), tt = X.player.hp), g.update(X, x.matches);
      const _a = X?.effects.filter((O) => O.kind === "ward-hit").at(-1);
      b.update(X?.player ?? null, _a ? Math.max(0, (_a.life - 5) / 10) : 0), _.update(X, i, Me, le);
      for (let O = y.length - 1; O >= 0; O--) {
        const L = y[O], T = ((X?.tick ?? 0) - L.born) / 27;
        if (T >= 1 || !X) {
          L.element.remove(), y.splice(O, 1);
          continue;
        }
        I.copy(L.position), I.y += x.matches ? 0 : T * 0.9, I.project(i), L.element.style.transform = `translate(${(I.x * 0.5 + 0.5) * Me}px,${(-I.y * 0.5 + 0.5) * le}px)`, L.element.style.opacity = String(Math.min(1, (1 - T) * 3));
      }
      a.render(o, i), Ne++, De += performance.now() - Ha, G && q !== G.definition.id && (q = G.definition.id, s.sceneReady?.(q)), be = !1, P = dt, Z = Gt, E = X, qe = X?.tick ?? -1, G && (F = G.location.position.x, U = G.location.position.y, H = G.location.facing, ne = G.facts);
    },
    invalidate() {
      be = !0, s.invalidate?.();
    },
    retryArtwork() {
      ue?.retry();
    },
    stats() {
      return {
        draws: Ne,
        submitMs: De,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      ut = !0, Le.disconnect(), a.domElement.removeEventListener("webglcontextlost", Ht), _t(), f.dispose(), _.dispose(), b.dispose(), N?.(), ue?.dispose(), r.shadow.dispose(), l.dispose(), o.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function Mn(e) {
  if (e.kind === "exit") return `${te.actions.travel} ${te.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${te.actions.talk} · ${te.people[t.person]}`;
    case "enemy":
      return `${te.actions.talk} · ${Fe(t.enemy)}`;
    case "inspect":
      return te.passages[t.passage].title;
    case "rest":
      return te.actions.rest;
    case "switch":
      return te.switches[t.fact];
  }
}
var Qi = ["aria-label"], Ki = { class: "journey-heading" }, Xi = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, Ji = ["disabled"], el = {
  key: 1,
  class: "journey-controls"
}, tl = ["aria-label"], al = {
  key: 0,
  class: "journey-interaction"
}, nl = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, sl = {
  key: 0,
  class: "journey-resource"
}, rl = [
  "max",
  "value",
  "aria-label"
], ol = ["disabled"], il = ["disabled"], ll = {
  key: 2,
  class: "journey-overlay"
}, cl = /* @__PURE__ */ Ie({
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
    const a = e, n = s, o = W(null), i = W(null), l = W({
      x: 0,
      y: 0
    }), r = W(null), c = W({
      failed: 0,
      pending: 0
    }), d = Y(() => a.battle ? [] : [
      ...Ba(a.world.definition.id, a.world.location.position, a.world.facts),
      ...Bs(a.world.definition, a.world.location, a.world.facts),
      ...zn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), h = Y(() => d.value.find((U) => U.target.id === r.value) ?? null), u = Y(() => a.weapon === "grimoire" ? ee.contractPower : ee.resource);
    let v = null, f = null, g = 0, b = 0, _ = 0, M = !1, S = !0;
    const y = si((U, H) => {
      l.value = {
        x: U * 26,
        y: H * 26
      }, f?.stick(U, H);
    }, () => o.value?.focus({ preventScroll: !0 }));
    function x() {
      y.clear(), f?.clear(), _ = 0;
    }
    function w() {
      x(), n("pause");
    }
    function I() {
      v?.retryArtwork();
    }
    function N() {
      document.hidden ? (cancelAnimationFrame(g), g = 0, w()) : (v?.invalidate(), j());
    }
    function j() {
      !g && !M && S && (b = 0, g = requestAnimationFrame(F));
    }
    function P() {
      !a.paused && h.value && (x(), n("interact", h.value.target.id));
    }
    function Z(U) {
      (!U || U.detail === 0) && f?.dash();
    }
    function E(U) {
      (!U || U.detail === 0) && f?.skill();
    }
    function B(U, H) {
      U.button === 0 && f?.[H]();
    }
    function q() {
      const U = d.value.findIndex((H) => H.target.id === r.value);
      r.value = d.value[(U + 1) % d.value.length]?.target.id ?? null;
    }
    function F(U) {
      if (g = 0, M || !S) return;
      !a.paused && !document.hidden && (g = requestAnimationFrame(F));
      const H = b ? Math.min(100, U - b) : 0;
      if (b = U, !a.paused && !document.hidden)
        for (_ += H; _ >= 1e3 / K.hz && !a.paused; ) {
          _ -= 1e3 / K.hz;
          const ne = f.frame();
          if (ne.skill && !a.battle) {
            P();
            break;
          }
          n("input", ne);
        }
      else _ = 0;
      if (!document.hidden) try {
        v?.draw(a.battle ?? null, a, 0, "battle", U, a.world);
      } catch (ne) {
        cancelAnimationFrame(g), g = 0, x(), n("error", ne);
      }
    }
    return ce(d, (U) => {
      U.some((H) => H.target.id === r.value) || (r.value = U[0]?.target.id ?? null);
    }, { immediate: !0 }), ce(() => a.world.definition.id, () => {
      x(), r.value = d.value[0]?.target.id ?? null, o.value?.focus({ preventScroll: !0 });
    }), ce(() => a.paused, (U) => {
      x(), j(), U || o.value?.focus({ preventScroll: !0 });
    }), ce(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.weapon,
      a.outfit
    ], j), qt(() => {
      try {
        v = Yi(i.value, () => {
          w(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: j,
          sceneReady: (U) => n("ready", U),
          artworkStatus: (U, H) => {
            c.value = {
              failed: U,
              pending: H
            };
          }
        });
      } catch (U) {
        n("error", U);
        return;
      }
      f = ni(o.value, w, () => {
      }), document.addEventListener("visibilitychange", N), j(), o.value?.focus({ preventScroll: !0 });
    }), Oa(() => {
      S = !1, cancelAnimationFrame(g), g = 0, w();
    }), Sn(() => {
      S = !0, j();
    }), It(() => {
      M = !0, cancelAnimationFrame(g), x(), f?.dispose(), document.removeEventListener("visibilitychange", N), v?.dispose();
    }), t({
      stats: () => v?.stats(),
      focus: () => o.value?.focus({ preventScroll: !0 })
    }), (U, H) => ($(), A("section", {
      ref_key: "root",
      ref: o,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? p(ee).controls : p(te).actions.controls
    }, [
      k("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      k("header", Ki, [k("h1", null, R(p(te).scenes[e.world.definition.id]), 1), Dn(U.$slots, "status", {}, void 0, !0)]),
      c.value.failed ? ($(), A("div", Xi, [k("span", null, R(p(te).artwork.unavailable), 1), k("button", {
        type: "button",
        disabled: c.value.pending > 0,
        onClick: I
      }, R(c.value.pending ? p(te).artwork.loading : p(te).artwork.retry), 9, Ji)])) : V("", !0),
      e.paused ? V("", !0) : ($(), A("div", el, [
        k("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": p(te).actions.move,
          onPointerdown: H[0] || (H[0] = pt((...ne) => p(y).down && p(y).down(...ne), ["prevent"])),
          onPointermove: H[1] || (H[1] = pt((...ne) => p(y).move && p(y).move(...ne), ["prevent"])),
          onPointerup: H[2] || (H[2] = (...ne) => p(y).release && p(y).release(...ne)),
          onPointercancel: H[3] || (H[3] = (...ne) => p(y).release && p(y).release(...ne)),
          onLostpointercapture: H[4] || (H[4] = (...ne) => p(y).release && p(y).release(...ne)),
          onContextmenu: H[5] || (H[5] = pt(() => {
          }, ["prevent"]))
        }, [k("span", { style: ra({ transform: `translate(${l.value.x}px, ${l.value.y}px)` }) }, null, 4)], 40, tl),
        h.value ? ($(), A("div", al, [k("button", {
          type: "button",
          class: "journey-act",
          onClick: P
        }, [H[9] || (H[9] = k("kbd", null, "E", -1)), _e(R(p(Mn)(h.value)), 1)]), d.value.length > 1 ? ($(), A("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: q
        }, R(p(te).actions.next), 1)) : V("", !0)])) : V("", !0),
        e.battle ? ($(), A("div", nl, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? ($(), A("div", sl, [
            k("span", null, R(e.battle.player.resonance > 0 ? p(ee).resonanceActive : u.value), 1),
            k("meter", {
              min: "0",
              max: p(it).maxPower,
              value: e.battle.player.resource,
              "aria-label": u.value
            }, null, 8, rl),
            k("small", null, R(e.battle.player.resonance > 0 ? p(ee).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : V("", !0),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: H[6] || (H[6] = pt((ne) => B(ne, "dash"), ["prevent"])),
            onClick: Z
          }, [
            k("kbd", null, R(p(ee).dashKey), 1),
            _e(R(p(ee).dash), 1),
            k("small", null, R(e.battle.player.dash > 0 ? p(ee).secondsLeft(e.battle.player.dash) : p(ee).ready), 1)
          ], 40, ol),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: H[7] || (H[7] = pt((ne) => B(ne, "skill"), ["prevent"])),
            onClick: E
          }, [
            k("kbd", null, R(p(ee).skillKey), 1),
            _e(R(p(Ct)[e.weapon].action), 1),
            k("small", null, R(e.battle.player.skill > 0 ? p(ee).secondsLeft(e.battle.player.skill) : p(ee).ready), 1)
          ], 40, il)
        ])) : V("", !0)
      ])),
      e.paused && !e.transitioning ? ($(), A("div", ll, [Dn(U.$slots, "overlay", {}, () => [k("button", {
        class: "journey-act",
        type: "button",
        onClick: H[8] || (H[8] = (ne) => n("resume"))
      }, R(p(te).actions.resume), 1)], !0)])) : V("", !0)
    ], 8, Qi));
  }
}), ul = /* @__PURE__ */ Be(cl, [["__scopeId", "data-v-a7e66cb8"]]);
function dl(e) {
  const t = new Set(e.location.visited.map(Nt)), s = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const o = Nt(n);
    for (const i of Da(ve[n], s)) {
      if (i.kind !== "exit") continue;
      const l = Nt(i.target.to), r = [o, l].sort().join("/");
      o !== l && (t.add(l), a.set(r, {
        id: r,
        from: o,
        to: l
      }));
    }
  }
  return {
    scenes: [...t],
    links: [...a.values()]
  };
}
function cr(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function hl(e, t) {
  const s = cr(t), a = 3 * s, n = [], o = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let l = o(i), r = -1;
    for (let c = 0; c <= 48; c++) {
      const d = Math.ceil(c / 8) * 5.2 * s, h = c * Math.PI / 4, u = o({
        x: i.x + Math.cos(h) * d,
        y: i.y + Math.sin(h) * d
      }), v = Math.min(1 / 0, ...n.map((f) => Math.hypot(f.x - u.x, f.y - u.y)));
      if (v > r && (l = u, r = v), v >= 5.2 * s) break;
    }
    n.push(l);
  }
  return n;
}
var fl = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, pl = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, ml = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, vl = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, gl = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, yl = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, bl = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, wl = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, xl = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, Ml = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, _l = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, kl = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, Sl = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, Rl = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, Cl = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, $l = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, Al = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, Pl = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, El = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, _n = {
  city: fl,
  cityMobile: pl,
  chapter: ml
}, Il = {
  blade: vl,
  bow: gl,
  staff: yl,
  daggers: bl,
  grimoire: wl,
  cannon: xl
}, kn = {
  camp: Ml,
  crossroads: _l,
  gate: kl,
  beacon: Sl,
  waterway: Rl,
  cells: Cl,
  hall: $l,
  roots: Al
}, fs = {
  arrival: Pl,
  ending: El
}, zl = { class: "ember-map-header" }, Ll = ["src"], Tl = ["aria-pressed"], jl = ["viewBox", "aria-label"], Ol = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Zl = ["transform"], Ul = ["fill"], Nl = {
  y: "22",
  "text-anchor": "middle"
}, Dl = ["viewBox", "aria-label"], Fl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Bl = ["points", "stroke-width"], Wl = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], ql = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Hl = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Vl = [
  "cx",
  "cy",
  "r",
  "fill"
], Gl = ["x", "y"], Yl = {
  key: 2,
  class: "ember-map-key"
}, Ql = {
  key: 3,
  class: "ember-map-places"
}, Kl = /* @__PURE__ */ Ie({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, a = t, n = W(!1), o = W(null), i = W(!1), l = W(null), r = W({
      width: 400,
      height: 400
    }), c = new ResizeObserver((y) => {
      for (const x of y) {
        const { width: w, height: I } = x.contentRect;
        x.target === o.value ? i.value = w > I * 1.55 : r.value = {
          width: w,
          height: I
        };
      }
    });
    ce(l, (y, x) => {
      x && c.unobserve(x), y && c.observe(y);
    }), qt(() => {
      c.observe(o.value);
    }), It(() => c.disconnect());
    const d = {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 10],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70]
    }, h = Y(() => dl(s.campaign)), u = Y(() => Object.fromEntries(h.value.scenes.map((y) => {
      const [x, w] = d[y], { width: I, height: N } = r.value;
      return [y, i.value ? [50 + (104 - w) / 104 * (I - 100), 10 + (x - 10) / 80 * (N - 40)] : [45 + x / 104 * (I - 90), 10 + w / 104 * (N - 40)]];
    }))), v = Y(() => h.value.links), f = Y(() => ve[s.campaign.location.scene]), g = Y(() => f.value.landscape.bounds), b = Y(() => cr(g.value)), _ = Y(() => `${g.value.x - g.value.width / 2 - 5 * b.value} ${g.value.z - g.value.depth / 2 - 5 * b.value} ${g.value.width + 10 * b.value} ${g.value.depth + 10 * b.value}`), M = Y(() => Ys(s.campaign)), S = Y(() => {
      const y = hl(M.value.map((x) => x.position), g.value);
      return M.value.map((x, w) => ({
        ...x,
        marker: y[w]
      }));
    });
    return (y, x) => ($(), A("div", {
      ref_key: "root",
      ref: o,
      class: lt(["ember-map", {
        "ember-map-wide": i.value,
        "ember-map-local": !n.value
      }])
    }, [
      k("div", zl, [
        p(kn)[f.value.id] ? ($(), A("img", {
          key: 0,
          src: p(kn)[f.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, Ll)) : V("", !0),
        k("h2", null, R(n.value ? p(D).chapterMap : p(te).scenes[f.value.id]), 1),
        k("div", null, [k("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: x[0] || (x[0] = (w) => n.value = !n.value)
        }, R(n.value ? p(D).localMap : p(D).chapterMap), 9, Tl), k("button", {
          type: "button",
          onClick: x[1] || (x[1] = (w) => a("close"))
        }, R(p(D).close), 1)])
      ]),
      n.value ? ($(), A("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: l,
        viewBox: `0 0 ${r.value.width} ${r.value.height}`,
        role: "img",
        "aria-label": p(D).chapterMap,
        class: "ember-route-map"
      }, [($(!0), A(J, null, ke(v.value, (w) => ($(), A("line", {
        key: w.id,
        x1: u.value[w.from][0],
        y1: u.value[w.from][1],
        x2: u.value[w.to][0],
        y2: u.value[w.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(w.from) && e.campaign.location.visited.includes(w.to) ? void 0 : "4 4"
      }, null, 8, Ol))), 128)), ($(!0), A(J, null, ke(u.value, (w, I) => ($(), A("g", {
        key: I,
        transform: `translate(${w.join(",")})`
      }, [
        k("circle", {
          r: "6",
          fill: I === p(Nt)(f.value.id) ? "#bf6242" : e.campaign.location.visited.includes(I) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Ul),
        k("text", Nl, R(e.campaign.location.visited.includes(I) ? p(te).scenes[I] : p(D).unknownArea), 1),
        k("title", null, R(e.campaign.location.visited.includes(I) ? p(te).scenes[I] : p(D).unknownArea), 1)
      ], 8, Zl))), 128))], 8, jl)) : ($(), A("svg", {
        key: 1,
        viewBox: _.value,
        role: "img",
        "aria-label": p(te).scenes[f.value.id]
      }, [
        k("rect", {
          x: g.value.x - g.value.width / 2,
          y: g.value.z - g.value.depth / 2,
          width: g.value.width,
          height: g.value.depth,
          rx: "2",
          fill: f.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, Fl),
        ($(!0), A(J, null, ke(f.value.landscape.roads, (w, I) => ($(), A("polyline", {
          key: I,
          points: w.points.map((N) => N.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": w.width,
          "stroke-linejoin": "round"
        }, null, 8, Bl))), 128)),
        ($(!0), A(J, null, ke(f.value.landscape.features, (w) => ($(), A("rect", {
          key: w.id,
          x: w.footprint.x - w.footprint.width / 2,
          y: w.footprint.z - w.footprint.depth / 2,
          width: w.footprint.width,
          height: w.footprint.depth,
          fill: w.kind === "water" ? "#6eb8c6" : w.kind === "tree" || w.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Wl))), 128)),
        k("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * b.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": b.value
        }, [k("title", null, R(p(D).here), 1)], 8, ql),
        ($(!0), A(J, null, ke(S.value, (w, I) => ($(), A("g", { key: w.target.id }, [
          k("line", {
            x1: w.position.x,
            y1: w.position.y,
            x2: w.marker.x,
            y2: w.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * b.value
          }, null, 8, Hl),
          k("circle", {
            cx: w.marker.x,
            cy: w.marker.y,
            r: 2.4 * b.value,
            fill: w.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Vl),
          k("text", {
            class: "ember-map-number",
            style: ra({ fontSize: `${3.4 * b.value}px` }),
            x: w.marker.x,
            y: w.marker.y + 1.1 * b.value,
            "text-anchor": "middle"
          }, R(I + 1), 13, Gl),
          k("title", null, R(p(Mn)(w)), 1)
        ]))), 128))
      ], 8, Dl)),
      n.value ? ($(), A("p", Yl, R(p(D).mapKey), 1)) : ($(), A("ol", Ql, [($(!0), A(J, null, ke(M.value, (w) => ($(), A("li", { key: w.target.id }, R(p(Mn)(w)), 1))), 128))]))
    ], 2));
  }
}), Xl = /* @__PURE__ */ Be(Kl, [["__scopeId", "data-v-4b7b0a2d"]]), ps = {
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
}, Jl = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, ec = ["d"], tc = ["d"], ac = /* @__PURE__ */ Ie({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, s) => ($(), A("svg", Jl, [k("path", {
      d: p(ps)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, ec), k("path", {
      d: p(ps)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, tc)]));
  }
}), Ot = ac, nc = { class: "exp-wardrobe" }, sc = { class: "exp-fitting-body" }, rc = { class: "exp-preview-stage" }, oc = ["aria-label"], ic = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, lc = { class: "exp-preview-tools" }, cc = ["aria-label"], uc = ["disabled"], dc = { class: "exp-outfit-info" }, hc = { class: "exp-muted" }, fc = { class: "exp-fitting-actions" }, pc = {
  key: 0,
  class: "exp-muted"
}, mc = ["disabled"], vc = { key: 2 }, gc = { class: "exp-purchase-confirm" }, yc = ["disabled"], bc = ["disabled"], wc = ["aria-label"], xc = ["aria-pressed", "onClick"], Mc = ["src"], _c = /* @__PURE__ */ Ie({
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
    const s = e, a = t, n = W(s.data.equippedOutfit), o = W(!1), i = W(0), l = W(!1), r = W(null), c = W(null), d = W({}), h = Y(() => ot[n.value]), u = Y(() => sn(s.data, n.value)), v = Y(() => Ur.find((N) => oa[N].awardKey === h.value.achievement)), f = Y(() => Is.filter((N) => sn(s.data, N) || ot[N].achievement === null || Object.values(ia).some((j) => j.boss && oa[j.boss].awardKey === ot[N].achievement)));
    let g = null, b = !0, _ = 0, M = () => {
    };
    ce([
      n,
      i,
      () => s.weapon
    ], () => {
      b = !0, M(), o.value = !1;
    });
    function S(N) {
      n.value = N, c.value?.scrollTo({ top: 0 });
    }
    function y() {
      _ = performance.now() + 1100, b = !0, M();
    }
    function x() {
      o.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function w() {
      b = !0;
      let N;
      try {
        N = new Ss({
          antialias: !0,
          alpha: !1
        });
      } catch {
        l.value = !0;
        return;
      }
      N.outputColorSpace = $n, N.toneMapping = 7, N.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const j = new Ms(), P = wn(), Z = new fa(), E = nr(P, Z, s.traveler.gender);
      j.background = new Cn("#d1e0e1"), j.add(Z, new Cs("#fff6e3", "#627c93", 2.7));
      const B = new ln("#fff6e0", 3);
      B.position.set(-3, 5, 6), j.add(B);
      const q = new Rs(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new Pa();
      function U(ue) {
        E.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, ue, 0, 0, !0, !1), E.root.position.set(0, 0.1, 0), E.root.rotation.y = -0.2, E.root.scale.setScalar(1.35);
      }
      for (const ue of f.value)
        U(ue), F.union(new Pa().setFromObject(Z));
      const H = F.getSize(new ct()), ne = F.getCenter(new ct()), Ne = H.y * 0.5 + H.z * 0.1 + 0.2, De = Math.hypot(H.x, H.z) * 0.5 + 0.2;
      q.position.set(0, ne.y + 0.8, 7), q.lookAt(0, ne.y, 0);
      function Me(ue) {
        const He = Math.max(Ne, De / ue);
        q.left = -He * ue, q.right = -q.left, q.top = He, q.bottom = -He, q.updateProjectionMatrix();
      }
      Me(1), N.setSize(144, 144, !1);
      try {
        for (const ue of f.value)
          U(ue), N.render(j, q), d.value[ue] = N.domElement.toDataURL("image/png");
      } catch {
        l.value = !0, E.dispose(), P.dispose(), j.clear(), N.dispose(), N.forceContextLoss();
        return;
      }
      r.value.append(N.domElement);
      let le = 0, be = 1, ut = 1;
      const zt = new ResizeObserver(() => {
        const ue = r.value.getBoundingClientRect();
        be = Math.max(1, ue.width), ut = Math.max(1, ue.height), N.setSize(be, ut, !1), Me(be / ut), b = !0, M();
      });
      zt.observe(r.value);
      const We = matchMedia("(prefers-reduced-motion: reduce)");
      function qe(ue) {
        ue.preventDefault(), l.value = !0, cancelAnimationFrame(le), le = 0;
      }
      N.domElement.addEventListener("webglcontextlost", qe);
      function tt(ue) {
        if (le = 0, l.value || document.hidden || !b && (ue > _ || We.matches) && !E.animating) return;
        const He = ue < _ && !We.matches, Le = ue * 0.03;
        E.update({
          x: He ? Math.sin(Le * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: He ? 8 - Le % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, s.weapon, n.value, Le, ue / 1e3, We.matches, !1), E.root.position.set(0, 0.1, 0), E.root.rotation.y = Number(i.value) * Math.PI / 180, E.root.scale.setScalar(1.35);
        try {
          N.render(j, q), b = !1;
        } catch {
          l.value = !0;
        }
        (He || E.animating) && !l.value && M();
      }
      M = () => {
        !le && !l.value && !document.hidden && (le = requestAnimationFrame(tt));
      };
      function Se() {
        document.hidden ? (cancelAnimationFrame(le), le = 0) : (b = !0, M());
      }
      document.addEventListener("visibilitychange", Se), M(), g = () => {
        M = () => {
        }, cancelAnimationFrame(le), zt.disconnect(), document.removeEventListener("visibilitychange", Se), N.domElement.removeEventListener("webglcontextlost", qe), E.dispose(), P.dispose(), j.clear(), N.dispose(), N.forceContextLoss(), N.domElement.remove();
      };
    }
    function I() {
      g?.(), g = null, l.value = !1, w();
    }
    return qt(w), It(() => g?.()), (N, j) => ($(), A("div", nc, [k("section", {
      ref_key: "fitting",
      ref: c,
      class: "exp-fitting"
    }, [k("div", sc, [k("div", rc, [k("div", {
      ref_key: "host",
      ref: r,
      class: "exp-outfit-preview",
      "aria-label": p(na)[n.value].name
    }, [l.value ? ($(), A("div", ic, [k("p", null, R(p(ee).presentationError.rendering), 1), k("button", {
      type: "button",
      onClick: I
    }, R(p(D).reload), 1)])) : V("", !0)], 8, oc), k("div", lc, [k("label", null, [_e(R(p(ee).rotate), 1), Zt(k("input", {
      "onUpdate:modelValue": j[0] || (j[0] = (P) => i.value = P),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": p(ee).rotate
    }, null, 8, cc), [[Rn, i.value]])]), k("button", {
      type: "button",
      disabled: l.value,
      onClick: y
    }, R(p(ee).previewAction), 9, uc)])]), k("div", dc, [
      k("h3", null, R(p(na)[n.value].name), 1),
      k("p", null, R(p(na)[n.value].detail), 1),
      k("p", hc, R(p(ee).wardrobeNote), 1)
    ])]), k("div", fc, [p(Gn)(e.data.active) ? V("", !0) : ($(), A("p", pc, R(p(D).safeWardrobe), 1)), u.value ? ($(), A("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !p(Gn)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: j[1] || (j[1] = (P) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, R(e.data.equippedOutfit === n.value ? p(ee).equipped : p(ee).equip), 9, mc)) : v.value ? ($(), A("p", vc, R(p(ee).unlockWeapon(p(dn)[v.value])), 1)) : o.value ? ($(), A(J, { key: 3 }, [k("p", null, R(p(ee).buyOutfit(p(na)[n.value].name, h.value.price)), 1), k("div", gc, [k("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: x
    }, R(p(ee).confirm), 9, yc), k("button", {
      type: "button",
      onClick: j[2] || (j[2] = (P) => o.value = !1)
    }, R(p(ee).cancel), 1)])], 64)) : ($(), A("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: j[3] || (j[3] = (P) => o.value = !0)
    }, R(e.balance < h.value.price ? p(ee).noCoins : p(ee).purchase) + " · " + R(p(ee).coins(h.value.price)), 9, bc))])], 512), k("div", {
      class: "exp-outfit-rack",
      "aria-label": p(ee).tryOn
    }, [($(!0), A(J, null, ke(f.value, (P) => ($(), A("button", {
      key: P,
      type: "button",
      "aria-pressed": n.value === P,
      onClick: (Z) => S(P)
    }, [
      d.value[P] ? ($(), A("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: d.value[P],
        alt: ""
      }, null, 8, Mc)) : V("", !0),
      k("strong", null, R(p(na)[P].name), 1),
      k("small", null, R(e.data.equippedOutfit === P ? p(ee).equipped : p(sn)(e.data, P) ? p(ee).owned : p(ot)[P].price ? p(ee).coins(p(ot)[P].price) : p(ee).achievement), 1)
    ], 8, xc))), 128))], 8, wc)]));
  }
}), kc = _c;
function Sc(e, t = 1) {
  const s = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (s[n] || n >= Ta.bands.length) && ye("narrative_unavailable");
    const o = /* @__PURE__ */ new Map();
    for (const l of a[3].matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
      o.has(l[1]) && ye("narrative_unavailable"), o.set(l[1], l[2].replace(/^[^:\n]+:\s*/, "").trim());
    const i = (l) => {
      const r = o.get(l);
      return r || ye("narrative_unavailable"), r;
    };
    s[n] = {
      name: i("name"),
      relationship: i("relationship"),
      memory: o.get("memory") ?? "",
      shadow: o.get("shadow") ?? "",
      intimacy: i("intimacy"),
      secret: o.get("secret") ?? null
    };
  }
  return Ta.bands.some((a, n) => !s[n]) && ye("narrative_unavailable"), s;
}
function Rc(e, t, s) {
  const a = e[Ln(t.affection)];
  return {
    relationship: a.relationship,
    shadow: a.shadow,
    intimacy: a.intimacy,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: s ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var Cc = async (e, t) => {
  const s = await fetch(`/${kr}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  s.ok || ye("narrative_unavailable");
  const a = await s.text();
  return a.trim() || ye("narrative_unavailable"), a;
};
async function $c(e, t, s = Cc) {
  const [a, n, o, i, l] = await Promise.all([
    s("system-prompt", t),
    s("world", t),
    s("player", t),
    s("meta-protocol", t),
    Promise.all(Qs.map(async (_) => ({
      id: _,
      document: await s(Ee(_) ? _ : Ue[_].card, t)
    })))
  ]), r = l.map(({ id: _, document: M }) => {
    const S = [...M.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (S.length !== 1 || !S[0][1].trim()) && ye("narrative_unavailable"), {
      id: _,
      introduction: S[0][1].trim(),
      document: M.replace(S[0][0], "").trim()
    };
  }), c = r.map((_) => _.introduction).join(`
`), d = r.find((_) => _.id === e).document, h = {
    system: a,
    world: n,
    player: o,
    protocol: i,
    npcs: c
  };
  if (!Ee(e)) {
    const _ = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(d);
    return (!_ || _[1] !== `${e}.initial`) && ye("narrative_unavailable"), {
      ...h,
      character: d.slice(0, _.index).replace(/# 开场\s*$/, "").trim(),
      stages: [],
      opening: {
        initial: _[2],
        returned: null
      }
    };
  }
  const [u, v] = await Promise.all(["openings", `${e}-stages`].map((_) => s(_, t))), f = new Map([...u.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((_) => [_[1], _[2].trim()])), g = f.get(`${e}.initial`), b = f.get(`${e}.returned`) ?? null;
  return (!g || (e === "anian" || e === "kouzi") && !b) && ye("narrative_unavailable"), {
    ...h,
    character: d,
    stages: Sc(v),
    opening: {
      initial: g,
      returned: b
    }
  };
}
function ur(e) {
  return Nr[e];
}
function Ac(e, t, s = []) {
  if (!Ee(t)) {
    const i = Ue[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: ie.attack,
      ...e.facts.includes(i.intel) ? { pass: ie.pass } : {}
    };
  }
  const a = Object.fromEntries(Eo(e.facts, t, e.people[t]).map((i) => [i, In[i].meaning])), n = ur(t), o = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && o >= Ta.bands[4] && s[Ln(o)]?.secret && (a.share_secret = ie.shareSecret), zo(e, t)) {
    a.follow = ie.follow, a.stay = ie.stay;
    for (const i of Hs(e, t).filter((l) => l.accessible && l.solo)) a[`go:${i.id}`] = ie.go(i.name);
  }
  return a;
}
var dr = "dialogue", qa = `<${dr}>`, Zn = `</${dr}>`, R2 = new RegExp(`${qa}([\\s\\S]*?)${Zn}`, "i"), C2 = new RegExp(qa, "i");
function ms(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${qa}
${e.reply}
${Zn}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function Pc(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${qa}…${Zn} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function Ec(e) {
  return e.map((t) => ({
    id: t,
    event: un[t]
  }));
}
function Ic(e) {
  const t = /* @__PURE__ */ new Set();
  let s;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((l) => !t.has(l)), o = {
      ...a.scene === s ? {} : { place: te.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((l) => t.add(l)), s = a.scene;
    const i = Object.keys(o).length ? `<scene>
${JSON.stringify(o)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: ms(a)
    }] : a.kind === "player" ? [{
      role: "user",
      content: i + a.player
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: ms(a)
    }];
  });
}
function zc(e, t) {
  return t ? e.findIndex((s) => s.id === t.throughId) + 1 : 0;
}
var Lc = {
  confined: "你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。",
  released: "牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。",
  returned: "你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。"
};
function hr(e, t) {
  if (!t) return null;
  let s = e;
  return t.map((a) => {
    const n = {
      from: s,
      exit: a.id,
      to: a.to,
      place: te.scenes[a.to],
      position: ve[s].anchors[a.anchor]
    };
    return s = a.to, n;
  });
}
function Tc(e, t) {
  const s = new Set(e.facts), a = Ee(t) ? e.people[t] : null, n = ve[Ee(t) ? e.people[t].scene : Ue[t].scene], o = Ee(t) ? e.people[t].position : La(t, s), i = zn(n, o, s, e.people), l = Ba(n.id, o, s).filter((f) => Pe(xt(n, s), o, f.position)), r = cn(n.id), c = Ee(t) ? Ts(e.facts, t) : null, d = e.location.scene === n.id ? Bs(n, e.location, s) : [], h = Ls(e), u = An, v = xt(n, s);
  return {
    place: te.scenes[n.id],
    chapter: {
      phase: h.phase,
      playerObjective: hn(e),
      optionalRoots: h.optionalRoots
    },
    supplies: {
      phase: h.supplies,
      situation: u.situation[h.supplies],
      collection: {
        scene: u.scene,
        place: te.scenes[u.scene],
        interaction: te.passages[u.object.passage].title,
        position: ve[u.scene].anchors[u.object.anchor],
        available: Dt(u.object.condition, s),
        route: hr(e.location.scene, za(e.location, {
          scene: u.scene,
          anchor: u.object.anchor
        }, s, !1))
      }
    },
    exits: n.exits.map((f) => {
      const g = n.anchors[f.anchor], b = Dt(f.condition, s);
      return {
        id: f.id,
        to: f.to,
        place: te.scenes[f.to],
        position: g,
        open: b,
        selfAccessible: b && Bt(v, o, g, K.playerRadius) !== null,
        playerAccessible: b && e.location.scene === n.id && Bt(v, e.location.position, g, K.playerRadius) !== null,
        withinReach: d.some((_) => _.target.id === f.id)
      };
    }),
    playerLodging: zs.guest_room.name,
    ...c ? { rescue: {
      phase: c,
      situation: Lc[c]
    } } : {},
    playerMechanisms: n.objects.flatMap((f) => f.kind === "switch" && Dt(f.condition, s) ? [{
      id: f.id,
      action: te.switches[f.fact],
      position: n.anchors[f.anchor],
      completed: s.has(f.fact),
      withinReach: d.some((g) => g.target.id === f.id)
    }] : []),
    ...r ? { room: {
      use: r.use,
      enclosure: r.enclosure,
      household: r.household.map((f) => f === "player" ? e.traveler.name : f === "anian_parents" || f === "innkeeper" ? te.households[f] : Fe(f)),
      furniture: r.furniture.map((f) => ({
        item: f.label,
        position: {
          x: f.footprint.x,
          y: f.footprint.z
        }
      })),
      exits: n.exits.map((f) => ({
        place: te.scenes[f.to],
        position: n.anchors[f.anchor]
      }))
    } } : {},
    positions: {
      player: e.location.position,
      self: o
    },
    present: [
      e.traveler.name,
      ...Ye.filter((f) => e.people[f].scene === n.id).map(Fe),
      ...l.map((f) => Fe(f.target.id))
    ],
    residents: (lr[n.id] ?? []).map((f) => ({
      name: f.name,
      activity: Oi[f.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? Za[a.destination].name : null,
      leader: a.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [...i, ...l].filter((f) => f.target.id !== t).map((f) => Fe(f.target.id))
  };
}
function jc(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: wa[e.appearanceAge] } : {}
  };
}
function Oc(e, t, s = []) {
  const a = Ac(e, t, s), n = Object.keys(a), o = {
    person: Fe(t),
    ...Tc(e, t),
    clothing: tr(e, t),
    events: Ec(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (!Ee(t)) {
    const i = Ue[t];
    return {
      ...o,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...o,
    map: Hs(e, t).map((i) => ({
      ...i,
      route: hr(e.people[t].scene, i.route)
    })),
    rescued: ya(e.facts, t),
    affection: e.relationships[t].affection
  };
}
function ha(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function Zc(e, t, s, a, n = e.memories[t]) {
  const o = Oc(e, t, a.stages), i = Go(t), l = Ee(t) ? ur(t) : null, r = Ee(t) ? Rc(a.stages, e.relationships[t], !!l && e.facts.includes(l)) : null, { actions: c, actionMeanings: d, events: h, ...u } = o, v = {
    actions: d,
    performance: i,
    clothing: jn
  }, f = {
    memory: n?.text ?? null,
    events: h,
    ...u,
    opening: e.conversations[t].some((g) => g.kind === "dialogue") || !Ee(t) && e.facts.includes(Ue[t].complete) ? null : o.rescued ? a.opening.returned : a.opening.initial,
    stage: r
  };
  return {
    systemPrompt: [
      a.system.trim(),
      ha("background", a.world.trim()),
      ha("player", `${a.player.trim()}

${JSON.stringify({
        ...jc(e.traveler),
        outfit: na[e.outfit].detail,
        equipment: Ct[e.weapon].equipment
      }, null, 2)}`),
      ha("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${ha("meta_protocol", `${a.protocol.trim()}

${ha("operations", JSON.stringify(v, null, 2))}`)}

<story>
${JSON.stringify(f, null, 2)}`
      },
      ...Ic(e.conversations[t].length ? e.conversations[t].slice(zc(e.conversations[t], n)) : [Js(e, t)]),
      {
        role: "user",
        content: `${s}
</story>

${Pc(o.person)}`
      }
    ]
  };
}
var vs = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function Uc(e, t, s, a) {
  const n = Zc(e, t, s, a), o = wr({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = en(n.systemPrompt), l = en(e.memories[t]?.text ?? ""), r = en(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: o,
    system: i,
    memory: l,
    history: r,
    situation: Math.max(0, o - i - l - r),
    limit: vs.waitAt,
    trigger: vs.trigger
  };
}
var Nc = { class: "ember-clothing-list" }, Dc = ["data-clothing-slot"], Fc = /* @__PURE__ */ Ie({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => ($(), A("dl", Nc, [($(!0), A(J, null, ke(p(jn), (a, n) => ($(), A(J, { key: n }, [e.clothing[n] !== void 0 ? ($(), A(J, { key: 0 }, [k("dt", null, R(a), 1), k("dd", {
      "data-clothing-slot": n,
      class: lt({ "is-absent": !e.clothing[n] })
    }, R(e.clothing[n] || p(xa).absent), 11, Dc)], 64)) : V("", !0)], 64))), 128))]));
  }
}), fr = /* @__PURE__ */ Be(Fc, [["__scopeId", "data-v-2445b8a0"]]), Bc = ["onKeydown"], Wc = ["aria-label", "aria-expanded"], qc = ["aria-label", "aria-expanded"], Hc = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Vc = ["id"], Gc = ["y", "height"], Yc = ["href"], Qc = ["href", "clip-path"], Kc = ["aria-label", "aria-expanded"], Xc = ["aria-label"], Jc = ["aria-label"], eu = { class: "ember-meter-total" }, tu = { key: 0 }, au = { class: "ember-meter-total" }, nu = { class: "ember-meter-breakdown" }, su = {
  class: "ember-error-detail",
  role: "status"
}, ru = ["disabled"], ou = { key: 3 }, iu = { role: "status" }, lu = /* @__PURE__ */ Ie({
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
    const t = e, s = Rt(null), a = W(null), n = {
      clothing: xa.title,
      affection: ie.affection,
      context: ie.context
    }, o = Y(() => tr(t.campaign, t.person)), i = W(null);
    function l() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const r = W(0), c = W("");
    let d = null, h;
    async function u() {
      d?.abort(), d = new AbortController();
      const S = d;
      s.value = null, c.value = "";
      try {
        const y = await $c(t.person, S.signal);
        S.signal.aborted || (s.value = y);
      } catch (y) {
        S.signal.aborted || (c.value = At(y));
      }
    }
    ce(() => t.person, () => {
      a.value = null, r.value = 0, u();
    }, { immediate: !0 });
    const v = Y(() => Ee(t.person) ? t.campaign.relationships[t.person].affection : 0), f = `ember-affection-${ws()}`, g = Y(() => 19 * v.value / 100), b = Y(() => s.value?.stages[Ln(v.value)]?.name ?? ""), _ = Y(() => s.value ? Uc(t.campaign, t.person, t.draft, s.value) : null);
    ce(() => [t.person, v.value], ([S, y], [x, w]) => {
      S === x && y === w || (h && clearTimeout(h), r.value = S === x ? y - w : 0, r.value && (h = setTimeout(() => {
        r.value = 0;
      }, 3500)));
    }), xs(() => (l(), !0), () => !!a.value), It(() => {
      d?.abort(), h && clearTimeout(h);
    });
    const M = (S) => `${(S / 1e3).toFixed(1)}k`;
    return (S, y) => ($(), A("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: yr(pt(l, ["stop"]), ["esc"])
    }, [
      k("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": p(xa).title,
        "aria-expanded": a.value === "clothing",
        onClick: y[0] || (y[0] = (x) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...y[4] || (y[4] = [k("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [k("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Wc),
      p(Ee)(e.person) ? ($(), A("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": p(ie).affection,
        "aria-expanded": a.value === "affection",
        onClick: y[1] || (y[1] = (x) => a.value = a.value === "affection" ? null : "affection")
      }, [($(), A("svg", Hc, [
        k("defs", null, [k("path", {
          id: `${f}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Vc), k("clipPath", { id: f }, [k("rect", {
          x: "2",
          y: 22 - g.value,
          width: "20",
          height: g.value
        }, null, 8, Gc)])]),
        k("use", {
          href: `#${f}-shape`,
          class: "ember-affection-track"
        }, null, 8, Yc),
        k("use", {
          href: `#${f}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${f})`
        }, null, 8, Qc)
      ])), r.value ? ($(), A("small", {
        key: 0,
        class: lt(["ember-affection-change", { "is-down": r.value < 0 }]),
        role: "status"
      }, R(r.value > 0 ? "+" : "") + R(r.value), 3)) : V("", !0)], 8, qc)) : V("", !0),
      k("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": p(ie).context,
        "aria-expanded": a.value === "context",
        onClick: y[2] || (y[2] = (x) => a.value = a.value === "context" ? null : "context")
      }, [k("span", {
        class: lt(["ember-meter-ring", { "is-warning": _.value && _.value.used >= _.value.trigger }]),
        style: ra({ "--meter-fill": `${Math.min(1, (_.value?.used ?? 0) / (_.value?.limit ?? 1)) * 360}deg` })
      }, [...y[5] || (y[5] = [k("span", null, null, -1)])], 6)], 8, Kc),
      a.value ? ($(), A("section", {
        key: 1,
        class: lt(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        k("header", null, [k("strong", null, R(n[a.value]), 1), k("button", {
          type: "button",
          "aria-label": p(ie).close,
          onClick: l
        }, "×", 8, Jc)]),
        a.value === "affection" ? ($(), A(J, { key: 0 }, [k("p", eu, [_e(R(v.value) + " ", 1), y[6] || (y[6] = k("small", null, "/ 100", -1))]), c.value ? V("", !0) : ($(), A("p", tu, R(b.value || p(ie).loading), 1))], 64)) : a.value === "clothing" ? ($(), St(fr, {
          key: 1,
          clothing: o.value
        }, null, 8, ["clothing"])) : _.value ? ($(), A(J, { key: 2 }, [
          k("p", au, R(M(_.value.used)) + " / " + R(M(_.value.limit)), 1),
          k("dl", nu, [($(!0), A(J, null, ke(p(ie).contextParts, (x, w) => ($(), A(J, { key: w }, [k("dt", null, R(x), 1), k("dd", null, R(M(_.value[w])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? ($(), A(J, { key: 0 }, [k("p", su, R(p(At)(e.memoryState)), 1), k("button", {
            type: "button",
            disabled: e.blocked,
            onClick: y[3] || (y[3] = (x) => S.$emit("retry-memory"))
          }, R(p(ie).memoryRetry), 9, ru)], 64)) : V("", !0)
        ], 64)) : c.value ? V("", !0) : ($(), A("p", ou, R(p(ie).loading), 1)),
        c.value && a.value !== "clothing" ? ($(), A(J, { key: 4 }, [k("p", iu, R(c.value), 1), k("button", {
          type: "button",
          onClick: u
        }, R(p(ie).retry), 1)], 64)) : V("", !0)
      ], 10, Xc)) : V("", !0)
    ], 40, Bc));
  }
}), cu = /* @__PURE__ */ Be(lu, [["__scopeId", "data-v-be9b84d5"]]), uu = ["aria-label"], du = { class: "ember-weapon-layout" }, hu = { class: "ember-weapon-list" }, fu = ["name", "value"], pu = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, mu = ["src"], vu = { class: "ember-weapon-skill" }, gu = /* @__PURE__ */ Ie({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = ys(e, "modelValue"), s = ws();
    return (a, n) => ($(), A("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": p(oe).chooseWeapon
    }, [k("div", du, [k("div", hu, [($(!0), A(J, null, ke(p(Ps), (o) => ($(), A("label", {
      key: o,
      class: lt({ "is-selected": t.value === o })
    }, [
      Zt(k("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: p(s),
        value: o
      }, null, 8, fu), [[bs, t.value]]),
      je(Ot, { name: o }, null, 8, ["name"]),
      k("span", null, R(p(Ct)[o].name), 1)
    ], 2))), 128))]), k("div", pu, [
      ($(), A("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: p(Il)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, mu)),
      k("h3", null, R(p(Ct)[t.value].name), 1),
      k("p", null, R(p(Ct)[t.value].detail), 1),
      k("div", vu, [k("strong", null, R(p(Ct)[t.value].action), 1), k("p", null, R(p(Ct)[t.value].skill), 1)])
    ])])], 8, uu));
  }
}), yu = /* @__PURE__ */ Be(gu, [["__scopeId", "data-v-0c0d4e2b"]]), bu = ["src"], wu = /* @__PURE__ */ Ie({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = W(null), s = W(null), a = new ResizeObserver((n) => {
      const { width: o, height: i } = n[0].contentRect;
      s.value = o <= 700 && i > o;
    });
    return qt(() => a.observe(t.value)), It(() => a.disconnect()), (n, o) => ($(), A("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [s.value !== null ? ($(), A("img", {
      key: 0,
      src: s.value ? p(_n).cityMobile : p(_n).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, bu)) : V("", !0)], 512));
  }
}), xu = /* @__PURE__ */ Be(wu, [["__scopeId", "data-v-f5a6e0d9"]]), Mu = ["aria-label"], _u = {
  key: 0,
  class: "entry-title"
}, ku = { class: "entry-city" }, Su = ["aria-label"], Ru = ["disabled"], Cu = ["disabled"], $u = ["disabled"], Au = ["disabled"], Pu = {
  key: 0,
  class: "entry-save"
}, Eu = ["disabled"], Iu = { class: "entry-name" }, zu = { for: "ember-traveler-name" }, Lu = ["maxlength", "placeholder"], Tu = { class: "entry-identity-details" }, ju = ["value"], Ou = { class: "entry-age" }, Zu = { for: "ember-traveler-age" }, Uu = {
  disabled: "",
  value: ""
}, Nu = ["value"], Du = {
  class: "entry-primary",
  type: "submit"
}, Fu = {
  key: 1,
  class: "entry-chapters"
}, Bu = ["src"], Wu = {
  class: "entry-numeral",
  "aria-hidden": "true"
}, qu = { class: "entry-chapter-body" }, Hu = { key: 0 }, Vu = { class: "entry-forthcoming" }, Gu = { class: "entry-traveler" }, Yu = {
  key: 0,
  class: "entry-restart"
}, Qu = ["disabled"], Ku = {
  key: 0,
  "aria-hidden": "true"
}, Xu = /* @__PURE__ */ Ie({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: s }) {
    const a = e, n = s, o = W("title"), i = W(!1), l = W(a.campaign?.traveler.name ?? ""), r = W(a.campaign?.traveler.gender ?? null), c = W(a.campaign?.traveler.appearanceAge ?? ""), d = W(a.campaign?.weapon ?? "blade"), h = W(!1), u = W(null), v = W(null), f = Y(() => ({
      title: D.title,
      identity: oe.identity,
      chapters: oe.chooseChapter,
      weapon: oe.chooseWeapon
    })[o.value]);
    ce(o, async () => {
      await mt(), v.value && (v.value.scrollTop = 0), u.value?.focus({ preventScroll: !0 });
    });
    function g() {
      i.value = !0, h.value = !1, o.value = "identity";
    }
    function b() {
      l.value.trim() && r.value && c.value && (l.value = l.value.trim(), o.value = "chapters");
    }
    function _() {
      o.value = o.value === "weapon" ? "chapters" : o.value === "chapters" && i.value ? "identity" : "title";
    }
    function M() {
      a.campaign && !i.value ? n("continue") : o.value = "weapon";
    }
    function S() {
      !r.value || !c.value || !l.value.trim() || a.blocked || a.campaign && !h.value || n("start", {
        traveler: {
          name: l.value.trim(),
          gender: r.value,
          appearanceAge: c.value
        },
        weapon: d.value,
        chapter: Ut.id
      });
    }
    return t({ back: () => o.value === "title" ? !1 : (_(), !0) }), (y, x) => ($(), A("section", {
      class: lt(["ember-entry", { "is-title": o.value === "title" }]),
      "aria-label": p(D).title
    }, [
      je(xu),
      x[11] || (x[11] = k("div", { class: "entry-shade" }, null, -1)),
      o.value === "title" ? ($(), A("div", _u, [
        k("p", ku, R(p(oe).city), 1),
        k("h1", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, R(p(D).title), 513),
        k("nav", { "aria-label": p(D).title }, [
          e.campaign ? ($(), A("button", {
            key: 0,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[0] || (x[0] = (w) => n("continue"))
          }, [_e(R(p(D).resume), 1), x[7] || (x[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, Ru)) : ($(), A("button", {
            key: 1,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, [_e(R(e.ready ? p(oe).begin : p(oe).loading), 1), x[8] || (x[8] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, Cu)),
          e.campaign ? ($(), A("button", {
            key: 2,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[1] || (x[1] = (w) => {
              i.value = !1, o.value = "chapters";
            })
          }, R(p(oe).chapters), 9, $u)) : V("", !0),
          e.campaign ? ($(), A("button", {
            key: 3,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: g
          }, R(p(oe).newJourney), 9, Au)) : V("", !0)
        ], 8, Su),
        e.campaign ? ($(), A("p", Pu, [k("span", null, R(e.campaign.traveler.name), 1), k("span", null, R(p(Xs)), 1)])) : V("", !0)
      ])) : ($(), A("div", {
        key: 1,
        ref_key: "sheet",
        ref: v,
        class: "entry-sheet"
      }, [
        k("header", null, [k("button", {
          type: "button",
          disabled: e.busy,
          onClick: _
        }, "← " + R(p(oe).back), 9, Eu), k("span", null, R(p(D).title), 1)]),
        k("h2", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, R(f.value), 513),
        o.value === "identity" ? ($(), A("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: pt(b, ["prevent"])
        }, [
          k("div", Iu, [k("label", zu, R(p(oe).name), 1), Zt(k("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": x[2] || (x[2] = (w) => l.value = w),
            maxlength: p(24),
            placeholder: p(oe).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, Lu), [[Rn, l.value]])]),
          k("div", Tu, [k("fieldset", null, [k("legend", null, R(p(oe).gender), 1), ($(!0), A(J, null, ke(p(Ks), (w) => ($(), A("label", { key: w }, [Zt(k("input", {
            "onUpdate:modelValue": x[3] || (x[3] = (I) => r.value = I),
            type: "radio",
            name: "ember-traveler-gender",
            value: w,
            required: ""
          }, null, 8, ju), [[bs, r.value]]), k("span", null, R(p(oe).genders[w]), 1)]))), 128))]), k("div", Ou, [k("label", Zu, R(p(oe).age), 1), Zt(k("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": x[4] || (x[4] = (w) => c.value = w),
            required: ""
          }, [k("option", Uu, R(p(oe).agePlaceholder), 1), ($(!0), A(J, null, ke(p(wa), (w, I) => ($(), A("option", {
            key: I,
            value: I
          }, R(w), 9, Nu))), 128))], 512), [[br, c.value]])])]),
          k("button", Du, [_e(R(p(oe).next), 1), x[9] || (x[9] = k("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : o.value === "chapters" ? ($(), A("div", Fu, [k("button", {
          type: "button",
          class: "entry-chapter",
          onClick: M
        }, [
          k("img", {
            class: "entry-chapter-art",
            src: p(_n).chapter,
            alt: "",
            decoding: "async"
          }, null, 8, Bu),
          k("span", Wu, R(p(Ut).numeral), 1),
          k("span", qu, [
            k("small", null, R(p(Ut).number), 1),
            k("strong", null, R(p(Ut).title), 1),
            k("span", null, R(p(D).opening), 1),
            e.campaign && !i.value ? ($(), A("small", Hu, R(e.campaign.facts.includes("chapter_completed") ? p(oe).completeChapter : p(oe).currentChapter), 1)) : V("", !0)
          ]),
          x[10] || (x[10] = k("span", {
            class: "entry-chapter-arrow",
            "aria-hidden": "true"
          }, "→", -1))
        ]), k("div", Vu, [k("span", null, R(p(oe).nextChapter), 1), k("span", null, R(p(oe).forthcoming), 1)])])) : ($(), A("form", {
          key: 2,
          class: "entry-loadout",
          onSubmit: pt(S, ["prevent"])
        }, [
          k("p", Gu, [k("strong", null, R(l.value), 1), k("span", null, R(r.value ? p(oe).genders[r.value] : "") + " · " + R(c.value ? p(wa)[c.value] : "") + " · " + R(p(oe).identityRole), 1)]),
          je(yu, {
            modelValue: d.value,
            "onUpdate:modelValue": x[5] || (x[5] = (w) => d.value = w)
          }, null, 8, ["modelValue"]),
          e.campaign ? ($(), A("label", Yu, [Zt(k("input", {
            "onUpdate:modelValue": x[6] || (x[6] = (w) => h.value = w),
            type: "checkbox",
            required: ""
          }, null, 512), [[mr, h.value]]), k("span", null, R(p(oe).restartWarning), 1)])) : V("", !0),
          k("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [_e(R(e.busy ? p(oe).entering : e.campaign ? p(oe).confirmRestart : p(oe).enter), 1), e.busy ? V("", !0) : ($(), A("span", Ku, "→"))], 8, Qu)
        ], 32))
      ], 512))
    ], 10, Mu));
  }
}), Ju = /* @__PURE__ */ Be(Xu, [["__scopeId", "data-v-38da0fee"]]), ed = [
  "aria-label",
  "title",
  "disabled"
], td = ["disabled"], ad = [
  "maxlength",
  "aria-label",
  "placeholder"
], nd = ["aria-label", "title"], sd = [
  "aria-label",
  "title",
  "disabled"
], rd = /* @__PURE__ */ Ie({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ Un({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Un([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const s = ys(e, "modelValue"), a = e, n = t, o = W(null), i = W(!1);
    let l = null, r = 0;
    function c() {
      o.value && (o.value.style.height = "44px", o.value.style.height = `${Math.min(132, o.value.scrollHeight + 2)}px`);
    }
    function d() {
      !a.blocked && s.value.trim() && n("send");
    }
    function h(u) {
      xr(u, i.value) && (u.preventDefault(), d());
    }
    return ce(s, async () => {
      await mt(), c();
    }), ce(o, (u, v) => {
      v && l?.unobserve(v), u && (c(), l?.observe(u));
    }, { flush: "post" }), qt(() => {
      c(), l = new ResizeObserver((u) => {
        const v = u[0].contentRect.width;
        v !== r && (r = v, c());
      }), o.value && l.observe(o.value);
    }), It(() => l?.disconnect()), (u, v) => ($(), A("form", {
      class: "ember-composer",
      onSubmit: pt(d, ["prevent"])
    }, [
      k("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? p(ie).retrySend : p(ie).regenerate,
        title: e.retrying ? p(ie).retrySend : p(ie).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: v[0] || (v[0] = (f) => n("regenerate"))
      }, [...v[6] || (v[6] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, ed),
      e.conclusion ? ($(), A("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: v[1] || (v[1] = (f) => n("continue"))
      }, [_e(R(e.conclusion === "fight" ? p(ie).fight : p(ie).continue), 1), v[7] || (v[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, td)) : Zt(($(), A("textarea", {
        key: 1,
        ref_key: "input",
        ref: o,
        "onUpdate:modelValue": v[2] || (v[2] = (f) => s.value = f),
        rows: "1",
        maxlength: p(ma).playerTextLimit,
        "aria-label": p(D).input,
        placeholder: p(D).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: v[3] || (v[3] = (f) => i.value = !0),
        onCompositionend: v[4] || (v[4] = (f) => i.value = !1)
      }, null, 40, ad)), [[Rn, s.value]]),
      e.talking ? ($(), A("button", {
        key: 2,
        type: "button",
        "aria-label": p(D).cancel,
        title: p(D).cancel,
        onClick: v[5] || (v[5] = (f) => n("cancel"))
      }, [...v[8] || (v[8] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, nd)) : e.conclusion ? V("", !0) : ($(), A("button", {
        key: 3,
        type: "submit",
        "aria-label": p(D).send,
        title: p(D).send,
        disabled: e.blocked || !s.value.trim()
      }, [...v[9] || (v[9] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, sd))
    ], 32));
  }
}), od = /* @__PURE__ */ Be(rd, [["__scopeId", "data-v-640a5540"]]), id = ["data-phase"], ld = {
  role: "status",
  "aria-live": "polite"
}, cd = ["datetime"], ud = /* @__PURE__ */ Ie({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, s = W(Date.now()), a = W(!0);
    Sn(() => {
      a.value = !0;
    }), Oa(() => {
      a.value = !1;
    });
    const n = Y(() => Math.max(0, Math.floor((s.value - t.startedAt) / 1e3)));
    return ce(() => [t.startedAt, a.value], (o, i, l) => {
      if (s.value = Date.now(), !a.value) return;
      const r = setInterval(() => {
        s.value = Date.now();
      }, 1e3);
      l(() => clearInterval(r));
    }, { immediate: !0 }), (o, i) => ($(), A("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = k("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      k("span", ld, R(p(ie).phases[e.phase]), 1),
      k("time", { datetime: `PT${n.value}S` }, R(p(ie).elapsed(n.value)), 9, cd)
    ], 8, id));
  }
}), dd = /* @__PURE__ */ Be(ud, [["__scopeId", "data-v-55406ff9"]]), gs = "关闭交谈后出发", aa = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${gs}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, s) => s ? `${e}准备前往${t}等候 · ${gs}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function hd(e, t, s) {
  if (!Ee(t)) return !1;
  const a = e.people[t], n = s.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const o = e.conversations[t];
  for (let i = o.length - 1; i >= 0; i--) {
    const l = o[i], r = l.action;
    if (r === "follow" || r === "stay" || r?.startsWith("go:")) return l.id === s.id;
  }
  return !1;
}
function fd(e, t, s) {
  const a = s.action;
  if (s.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === s.id, o = hd(e, t, s) || n && (a === "finish" ? Tn(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), i = Fe(t);
  let l;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      l = aa[a];
      break;
    case "follow":
      l = aa.follow(i, o);
      break;
    case "stay":
      l = aa.stay(i);
      break;
    case "pass":
      l = aa.pass(i, o);
      break;
    case "attack":
    case "finish":
      l = aa[a](o);
      break;
    default:
      l = aa.go(i, Za[a.slice(3)].name, o);
  }
  return {
    action: a,
    phase: o ? "pending" : "applied",
    text: l
  };
}
var pd = ["data-action", "data-phase"], md = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, vd = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, gd = /* @__PURE__ */ Ie({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, s = Y(() => fd(t.campaign, t.person, t.turn));
    return (a, n) => s.value ? ($(), A("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": s.value.action,
      "data-phase": s.value.phase
    }, [($(), A("svg", md, [s.value.phase === "pending" ? ($(), A(J, { key: 0 }, [n[0] || (n[0] = k("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = k("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : ($(), A("path", vd))])), k("span", null, R(s.value.text), 1)], 8, pd)) : V("", !0);
  }
}), yd = /* @__PURE__ */ Be(gd, [["__scopeId", "data-v-00613f94"]]), bd = { class: "ember-clothing-feedback" }, wd = { key: 0 }, xd = /* @__PURE__ */ Ie({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, s) => ($(), A("details", bd, [k("summary", null, [_e(R(p(xa).changed), 1), k("span", null, [($(!0), A(J, null, ke(p(jn), (a, n) => ($(), A(J, { key: n }, [e.clothing[n] !== void 0 ? ($(), A("small", wd, R(a), 1)) : V("", !0)], 64))), 128))])]), je(fr, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), Md = /* @__PURE__ */ Be(xd, [["__scopeId", "data-v-49dedcf2"]]);
function _d(e) {
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
var kd = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, Sd = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, Rd = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, Cd = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, $d = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, Ad = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, Pd = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, Ed = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, Id = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, zd = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, Ld = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, Td = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, jd = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, Od = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, Zd = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, Ud = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, Nd = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, Dd = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, Fd = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, Bd = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, Wd = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, qd = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, Hd = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, Vd = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, Gd = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, Yd = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, Qd = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, Kd = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, Xd = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, Jd = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, e1 = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, t1 = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, a1 = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, n1 = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, s1 = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, r1 = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, o1 = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, i1 = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, l1 = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, c1 = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, u1 = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, d1 = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, h1 = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, f1 = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, p1 = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, m1 = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, v1 = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, g1 = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, y1 = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, b1 = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, w1 = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, x1 = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, M1 = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, _1 = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, k1 = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, S1 = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, R1 = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, C1 = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, $1 = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, A1 = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, P1 = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, E1 = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, I1 = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, z1 = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, L1 = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, T1 = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, j1 = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, O1 = {
  sanniang: {
    body: kd,
    arm: Sd,
    heads: {
      neutral: Rd,
      smile: Cd,
      teasing: $d,
      blush: Ad,
      rest: Pd,
      serious: Ed,
      worried: Id,
      sad: zd,
      displeased: Ld,
      fond: Td,
      laugh: jd,
      surprised: Od
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: Zd,
    arm: Nd,
    heads: {
      neutral: Ud,
      smile: Yd,
      blush: Dd,
      displeased: Fd,
      fond: Bd,
      laugh: Wd,
      rest: qd,
      sad: Hd,
      surprised: Vd,
      worried: Gd
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: Qd,
    arm: Xd,
    heads: {
      neutral: Kd,
      blush: l1,
      displeased: Jd,
      fond: e1,
      laugh: t1,
      sad: a1,
      serious: n1,
      smile: s1,
      surprised: r1,
      teasing: o1,
      worried: i1
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: c1,
    arm: u1,
    heads: {
      neutral: d1,
      smile: h1,
      teasing: f1,
      laugh: p1,
      blush: m1,
      fond: v1,
      serious: g1,
      surprised: y1,
      worried: b1,
      sad: w1
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: x1,
    arm: _1,
    heads: {
      neutral: M1,
      angry: k1,
      relieved: S1,
      resigned: R1,
      suspicious: C1,
      worried: $1
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: A1,
    arm: E1,
    heads: {
      neutral: P1,
      displeased: I1,
      relieved: z1,
      smile: L1,
      squint: T1,
      worried: j1
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, Z1 = {
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
function U1(e, t, s) {
  if (e === "none") return null;
  const a = Z1[e], n = a.joint === "arm" ? a.angles.map((o) => `rotate(${o * s}deg)`) : a.frames;
  return t[a.joint].animate(n.map((o) => ({ transform: o })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var N1 = ["src"], D1 = ["src"], F1 = ["src"], B1 = /* @__PURE__ */ Ie({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = W(null), a = W(null), n = W(null), o = Y(() => O1[t.person]), i = W(!1), l = W(0);
    let r = 0, c = !1, d = !1, h = null, u, v;
    function f() {
      d = !0, h?.cancel(), h = null;
    }
    function g() {
      if (!(!t.animate || d || i.value || r < 3 || !c)) {
        if (document.hidden || v?.matches) {
          f();
          return;
        }
        a.value && n.value && (d = !0, h = U1(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, o.value.armDirection));
      }
    }
    function b() {
      r++, g();
    }
    function _() {
      i.value = !0, f();
    }
    function M() {
      r = 0, i.value = !1, l.value++;
    }
    function S() {
      document.hidden && f();
    }
    function y() {
      v?.matches && f();
    }
    return ce(() => t.animate, (x) => {
      x ? g() : f();
    }), qt(() => {
      v = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || v.matches) && f(), v.addEventListener("change", y), document.addEventListener("visibilitychange", S), u = new IntersectionObserver((x) => {
        c = x[0].isIntersecting && x[0].intersectionRatio >= 0.25, c ? g() : h && f();
      }, { threshold: 0.25 }), s.value && u.observe(s.value);
    }), Oa(f), It(() => {
      f(), u?.disconnect(), v?.removeEventListener("change", y), document.removeEventListener("visibilitychange", S);
    }), (x, w) => ($(), A("span", {
      ref_key: "root",
      ref: s,
      class: lt(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? ($(), A("button", {
      key: 1,
      type: "button",
      onClick: M
    }, R(p(ie).reloadArtwork), 1)) : ($(), A(J, { key: 0 }, [
      ($(), A("img", {
        key: "body-" + l.value,
        src: o.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: _
      }, null, 40, N1)),
      ($(), A("img", {
        key: "head-" + l.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: o.value.heads[e.performance?.expression ?? "neutral"],
        style: ra({ transformOrigin: o.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: _
      }, null, 44, D1)),
      ($(), A("img", {
        key: "arm-" + l.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: o.value.arm,
        style: ra({ transformOrigin: o.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: _
      }, null, 44, F1))
    ], 64))], 2));
  }
}), W1 = /* @__PURE__ */ Be(B1, [["__scopeId", "data-v-606c2ccc"]]), q1 = { class: "ember-npc-bubble" }, H1 = { class: "ember-npc-line" }, V1 = /* @__PURE__ */ Ie({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, s = Y(() => _d(t.reply));
    return (a, n) => ($(), A("div", q1, [je(W1, {
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ]), k("p", H1, [($(!0), A(J, null, ke(s.value, (o, i) => ($(), A("span", {
      key: i,
      class: lt({ "ember-spoken": o.spoken })
    }, R(o.text), 3))), 128))])]));
  }
}), G1 = /* @__PURE__ */ Be(V1, [["__scopeId", "data-v-5a2c5c6c"]]), Y1 = { class: "ember-campaign" }, Q1 = { class: "ember-health" }, K1 = [
  "max",
  "value",
  "aria-label"
], X1 = { class: "ember-objective" }, J1 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, eh = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, th = ["aria-label"], ah = ["disabled", "aria-label"], nh = ["disabled", "aria-label"], sh = ["disabled", "aria-label"], rh = ["aria-label"], oh = {
  key: 5,
  class: "ember-boss"
}, ih = [
  "max",
  "value",
  "aria-label"
], lh = {
  key: 6,
  class: "ember-alarm"
}, ch = ["aria-label"], uh = { class: "ember-error-detail" }, dh = ["disabled"], hh = ["disabled"], fh = {
  key: 8,
  class: "ember-conversation-notice",
  role: "status"
}, ph = { class: "ember-error-detail" }, mh = { key: 0 }, vh = { class: "ember-prose" }, gh = {
  key: 9,
  class: "ember-award-notice",
  role: "status"
}, yh = ["aria-label"], bh = ["aria-label"], wh = {
  key: 0,
  class: "ember-panel-heading"
}, xh = ["aria-label"], Mh = ["aria-pressed"], _h = ["aria-pressed"], kh = ["disabled"], Sh = { class: "ember-prose ember-prologue" }, Rh = { class: "ember-objective-panel" }, Ch = { class: "ember-journal" }, $h = { class: "ember-journal" }, Ah = { class: "ember-pack-heading" }, Ph = { key: 0 }, Eh = { key: 1 }, Ih = { class: "ember-relics" }, zh = { key: 0 }, Lh = ["disabled", "onClick"], Th = { class: "ember-dialogue-heading" }, jh = { class: "ember-person-heading" }, Oh = ["disabled"], Zh = ["data-message-key"], Uh = ["data-message-key", "data-fresh-reply"], Nh = {
  key: 0,
  class: "ember-dialogue-issue"
}, Dh = { key: 1 }, Fh = { class: "ember-prose" }, Bh = {
  key: 2,
  class: "ember-prose"
}, Wh = ["aria-busy"], qh = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Hh = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, Vh = { class: "ember-error-detail" }, Gh = { key: 0 }, Yh = { class: "ember-prose" }, Qh = {
  key: 3,
  class: "ember-history-nav"
}, Kh = {
  key: 6,
  class: "ember-prose"
}, Xh = ["src"], Jh = { class: "ember-prose" }, e2 = ["src"], t2 = { class: "ember-prose" }, a2 = { key: 0 }, n2 = { key: 1 }, s2 = { class: "ember-relics" }, r2 = ["disabled", "onClick"], o2 = ["disabled"], i2 = { class: "ember-prose" }, l2 = ["disabled"], c2 = ["disabled"], u2 = ["disabled"], d2 = { class: "ember-pause-actions" }, h2 = ["aria-pressed"], f2 = { class: "ember-help ember-keyboard-help" }, p2 = { class: "ember-help ember-touch-help" }, m2 = /* @__PURE__ */ Ie({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, s = Xo(t.bridge, t.chatIdentity), a = Jo(s), { view: n, notice: o, busy: i, blocked: l, talking: r, outgoing: c, conversationProgress: d, conversationFailure: h } = s, { current: u, dirty: v } = a, f = W(!0), g = W(!1), b = W(!1), _ = W(0), M = W(!1), S = W(!1), y = W(null), x = W(null), w = W(null), I = W("relics"), N = Y(() => w.value === "map" ? D.map : w.value === "journal" ? D.journal : w.value === "build" ? D.build : w.value === "person" ? Fe(j.value) : w.value === "passage" ? te.passages[P.value].title : w.value === "arrival" ? te.scenes.camp : w.value === "ending" || w.value === "prologue" ? Xs : u.value?.phase === "reward" ? D.reward : u.value?.phase === "lost" ? D.fallen : D.pause), j = W("sanniang"), P = W("warning"), Z = W(null), E = W({}), B = Y({
      get: () => E.value[j.value] ?? "",
      set: (O) => {
        E.value[j.value] = O;
      }
    }), q = W(null), F = W(!1), U = W(null), H = W(null), ne = W(null), Ne = Y((O) => {
      const L = u.value?.facts ?? [];
      return O && O.size === L.length && L.every((T) => O.has(T)) ? O : new Set(L);
    }), De = Y(() => u.value ? {
      definition: ve[u.value.location.scene],
      location: u.value.location,
      facts: Ne.value,
      people: u.value.people
    } : null), Me = Y(() => {
      const O = u.value && kn[u.value.location.scene];
      return O ? { "--scene-art": `url("${O}")` } : void 0;
    }), le = Y(() => u.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), be = Y(() => u.value ? Tn(u.value) : null), ut = Y(() => u.value?.pendingParley ? u.value.pendingParley.decision === "attack" ? "fight" : "continue" : be.value ? "continue" : void 0), zt = Y(() => !M.value || !u.value || !!u.value.pendingParley || !!be.value || f.value || !!w.value || !!o.value || r.value || b.value || t.generationActive || S.value || !!y.value || !["exploration", "battle"].includes(u.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), We = Y(() => u.value?.battle?.enemies.find((O) => xe(O.kind))), qe = Y(() => {
      const O = u.value?.conversations[j.value] ?? [], L = s.replacingReply.value;
      return L?.person === j.value ? O.map((T) => T.id === L.turnId ? Fo(T) : T) : O;
    }), tt = Y(() => u.value && !qe.value.length ? Js(u.value, j.value) : null), Se = Y(() => q.value?.person === j.value ? {
      ...q.value,
      status: F.value ? "sending" : "failed"
    } : c.value?.person === j.value && !c.value.regenerating && !qe.value.some((O) => O.id === c.value?.actionId) ? c.value : null), ue = Y(() => Se.value?.status === "failed"), He = Y(() => u.value && ns(u.value, j.value)), Le = W(null), Ht = W(!1);
    let Lt;
    function _t() {
      clearTimeout(Lt), Lt = void 0, Ht.value = !1;
    }
    const Tt = W(0), fe = Y(() => er.flatMap((O) => {
      const L = n.value?.data.awards.find((T) => T.key === O.key && T.runId === u.value?.id);
      return L ? [{
        fact: O.fact,
        amount: L.amount
      }] : [];
    })), Ve = Y(() => fe.value.reduce((O, L) => O + L.amount, 0)), { messages: kt, hasOlder: dt, hasNewer: Qe, expanded: G, pendingVisible: Ha, rememberReading: X, resetLatest: Vt, older: jt, newer: Gt } = ei({
      history: Y(() => tt.value ? [tt.value] : qe.value),
      pending: Y(() => !!Se.value),
      person: j,
      campaignId: Y(() => u.value?.id),
      transcript: U,
      freshReply: Le,
      talking: r
    }), la = Y(() => u.value?.collection.map((O) => {
      const L = u.value.equipped.includes(O.id) ? u.value.equipped.filter((T) => T !== O.id) : [...u.value.equipped, O.id];
      return {
        ...O,
        equipped: L,
        issue: Bo(u.value, L)
      };
    }) ?? []), Yt = ti(() => {
      s.error.value = ee.presentationError.sound, g.value = !1;
    });
    let Qt = !1;
    function Ke() {
      (w.value || u.value && ["exploration", "battle"].includes(u.value.phase)) && Te();
    }
    async function ca() {
      await Ge({ type: "resolve_parley" }) && (w.value = null, await mt(), ne.value?.focus());
    }
    async function Kt() {
      be.value ? await Ge({ type: "accept_reply" }) : await ca();
    }
    Fn(Z, Ke), xs(() => M.value ? w.value ? (Ke(), !0) : f.value ? !1 : (ht(), !0) : x.value?.back() ?? !1), Fn(H, () => {
      !i.value && !b.value && !t.generationActive && s.dismissError();
    });
    function ht() {
      f.value = !0, a.flush();
    }
    function Xt() {
      w.value = null, ht();
    }
    async function Jt(O) {
      S.value || y.value || (w.value = O, O === "build" && (I.value = "relics"), await a.flush());
    }
    async function Te() {
      if (!be.value) {
        if (u.value?.pendingParley) {
          u.value.pendingParley.decision === "pass" && await ca();
          return;
        }
        !o.value && !t.generationActive && (M.value = !0, w.value = null, f.value = !1, await mt(), ne.value?.focus());
      }
    }
    function ua() {
      M.value = !0, u.value?.pendingParley || be.value ? (j.value = u.value?.pendingParley?.enemy ?? be.value, w.value = "person", f.value = !1) : Te();
    }
    async function Ge(O) {
      if (S.value || y.value) return !1;
      S.value = !0, O.type === "interact" && u.value && (y.value = ve[u.value.location.scene].exits.find((T) => T.id === O.id)?.to ?? null);
      let L = !1;
      try {
        return await a.flush() ? (L = await s.act(O), L && (a.sync(), !w.value && !f.value && (await mt(), ne.value?.focus())), L) : !1;
      } finally {
        S.value = !1, L || (y.value = null);
      }
    }
    function Va(O) {
      O === y.value && (y.value = null);
    }
    async function Ga(O) {
      await Ge({
        type: u.value ? "restart" : "start",
        ...O,
        outfit: le.value
      }) && (M.value = !0, w.value = "prologue");
    }
    function da() {
      f.value = !0, w.value = null, M.value = !1, a.flush();
    }
    async function Ma(O) {
      if (!u.value || S.value || y.value) return;
      _t();
      const L = [...Ys(u.value), ...Ba(u.value.location.scene, u.value.location.position, new Set(u.value.facts))].find((we) => we.target.id === O), T = L?.kind === "object" ? L.target : null;
      if (T?.kind === "person" || T?.kind === "enemy") {
        const we = T.kind === "person" ? T.person : T.enemy;
        j.value = we, w.value = "person", await a.flush() && !u.value.conversations[we].length && await s.act({
          type: "greet",
          person: we
        }) && a.sync();
        return;
      }
      await Ge({
        type: "interact",
        id: O
      }) && (T?.kind === "inspect" ? (P.value = T.passage, w.value = "passage") : T?.kind === "rest" && (Ht.value = !0, Lt = setTimeout(_t, 3e3)));
    }
    async function Ya() {
      const O = j.value, L = B.value.trim();
      if (!(l.value || F.value || !L || ut.value)) {
        E.value[O] = "", q.value = {
          person: O,
          text: L
        }, F.value = !0, Vt();
        try {
          if (!await a.flush()) return;
          const T = s.talk(O, L);
          q.value = null, await T && a.sync();
        } finally {
          F.value = !1;
        }
      }
    }
    async function Qa() {
      if (!(l.value || F.value || !u.value))
        if (Vt(), ue.value && Se.value) {
          const O = Se.value, L = s.talk(O.person, O.text);
          q.value = null, await L && a.sync();
        } else {
          const O = ns(u.value, j.value);
          O && await s.talk(j.value, O.player, O.id) && a.sync();
        }
    }
    async function _a() {
      await a.recover() && (f.value = !0, _.value++);
    }
    return ce(() => t.generationActive, (O) => {
      O && ht();
    }), ce(() => [u.value?.pendingParley, be.value], ([O, L]) => {
      (O || L) && (j.value = O?.enemy ?? L, w.value = "person");
    }, { immediate: !0 }), ce(g, (O) => {
      Yt.enable(O);
    }), ce(u, (O) => {
      g.value && O?.battle && Yt.tick(O.battle);
    }), ce(() => n.value?.data, (O, L) => {
      if (!O?.active || !L?.active || O.active.id !== L.active.id) {
        Tt.value = 0;
        return;
      }
      Tt.value += O.awards.filter((at) => !L.awards.some((nt) => nt.key === at.key)).reduce((at, nt) => at + nt.amount, 0);
      const T = new Set(L.active.facts), we = new Set(O.active.facts);
      !T.has("chapter_completed") && we.has("chapter_completed") ? w.value = "ending" : !T.has("captives_arrived") && we.has("captives_arrived") && (w.value = "arrival");
    }), ce(() => u.value?.id, () => {
      E.value = {}, q.value = null;
    }), ce([
      M,
      f,
      w,
      o,
      () => u.value?.id,
      () => u.value?.location.scene
    ], _t), ce([w, j], () => {
      Le.value = null;
    }), ce(o, (O) => {
      O && (Le.value = null);
    }), ce(() => [j.value, qe.value], ([O, L], [T, we]) => {
      const at = L.filter((nt) => nt.kind === "dialogue").at(-1);
      O === T && w.value === "person" && at && !we.some((nt) => nt.id === at.id) && (Le.value = at.id);
    }), qt(async () => {
      await s.read(), Qt = !0;
    }), Sn(() => {
      Qt && !v.value && s.read();
    }), Oa(() => {
      Le.value = null, _t(), ht();
    }), It(() => {
      _t(), a.dispose(), s.dispose(), Yt.dispose();
    }), (O, L) => ($(), A("section", Y1, [
      M.value ? V("", !0) : ($(), St(Ju, {
        key: 0,
        ref_key: "entry",
        ref: x,
        campaign: p(u),
        ready: !!p(n)?.ready,
        busy: p(i),
        blocked: p(l) || e.generationActive,
        onStart: Ga,
        onContinue: ua
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      M.value && p(u) && De.value ? ($(), St(ul, {
        key: _.value,
        ref_key: "field",
        ref: ne,
        world: De.value,
        traveler: p(u).traveler,
        paused: zt.value,
        transitioning: !!y.value,
        weapon: p(u).weapon,
        outfit: le.value,
        battle: p(u).battle,
        onInput: p(a).input,
        onInteract: Ma,
        onPause: ht,
        onResume: Te,
        onError: L[0] || (L[0] = (T) => b.value = !0),
        onReady: Va
      }, {
        status: Nn(() => [p(u) ? ($(), A(J, { key: 0 }, [k("div", Q1, [k("meter", {
          min: 0,
          max: p(K).maxHp,
          value: p(u).hp,
          "aria-label": p(ee).hp
        }, null, 8, K1), k("span", null, R(Math.ceil(p(u).hp)) + " / " + R(p(K).maxHp), 1)]), k("p", X1, R(p(hn)(p(u))), 1)], 64)) : V("", !0)]),
        overlay: Nn(() => [...L[22] || (L[22] = [k("span", null, null, -1)])]),
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
      ])) : V("", !0),
      M.value && y.value && !p(o) && !b.value && !w.value && !f.value ? ($(), A("aside", J1, R(p(te).transition(p(te).scenes[y.value])), 1)) : V("", !0),
      M.value && Ht.value && !w.value && !f.value && !p(o) ? ($(), A("p", eh, R(p(te).rested), 1)) : V("", !0),
      M.value && p(u) && !p(u).pendingParley && !be.value ? ($(), A("nav", {
        key: 4,
        class: "ember-tools",
        "aria-label": p(D).prepare
      }, [
        k("button", {
          type: "button",
          disabled: S.value || !!y.value,
          "aria-label": p(D).map,
          onClick: L[1] || (L[1] = (T) => Jt("map"))
        }, [je(Ot, { name: "map" }), k("span", null, R(p(D).map), 1)], 8, ah),
        k("button", {
          type: "button",
          disabled: S.value || !!y.value,
          "aria-label": p(D).build,
          onClick: L[2] || (L[2] = (T) => Jt("build"))
        }, [je(Ot, { name: "bag" }), k("span", null, R(p(D).build), 1)], 8, nh),
        k("button", {
          type: "button",
          disabled: S.value || !!y.value,
          "aria-label": p(D).journal,
          onClick: L[3] || (L[3] = (T) => Jt("journal"))
        }, [je(Ot, { name: "journal" }), k("span", null, R(p(D).journal), 1)], 8, sh),
        k("button", {
          type: "button",
          "aria-label": p(D).pause,
          onClick: Xt
        }, [je(Ot, { name: "pause" }), k("span", null, R(p(D).pause), 1)], 8, rh)
      ], 8, th)) : V("", !0),
      M.value && We.value && !w.value ? ($(), A("div", oh, [k("strong", null, R(p(dn)[We.value.kind]), 1), k("meter", {
        min: "0",
        max: We.value.maxHp,
        value: We.value.hp,
        "aria-label": p(dn)[We.value.kind]
      }, null, 8, ih)])) : V("", !0),
      M.value && p(u)?.phase === "battle" && ["gate", "beacon"].includes(p(u).location.scene) && !Ne.value.has("alarm_silenced") ? ($(), A("div", lh, R(Ne.value.has("alarm_raised") ? p(D).alarmRaised : p(D).alarmSeconds(Math.ceil((p(ma).alarmTicks - p(u).alarmTicks) / p(K).hz))), 1)) : V("", !0),
      p(o) || b.value || e.generationActive ? ($(), A("section", {
        key: 7,
        ref_key: "noticePanel",
        ref: H,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": p(D).noticeTitle,
        tabindex: "-1"
      }, [k("p", uh, R(b.value ? p(D).renderError : e.generationActive ? p(D).generation : p(o)), 1), b.value ? ($(), A("button", {
        key: 0,
        type: "button",
        onClick: L[4] || (L[4] = (T) => {
          b.value = !1, _.value++;
        })
      }, R(p(D).reload), 1)) : p(s).dataInvalid.value && !e.generationActive ? ($(), A(J, { key: 1 }, [k("p", null, R(p(D).rebuildWarning), 1), k("button", {
        type: "button",
        disabled: p(i),
        onClick: L[5] || (L[5] = (...T) => p(s).rebuild && p(s).rebuild(...T))
      }, R(p(D).rebuild), 9, dh)], 64)) : e.generationActive ? V("", !0) : ($(), A("button", {
        key: 2,
        type: "button",
        disabled: p(i),
        onClick: L[6] || (L[6] = (T) => p(s).recoveryRequired.value ? _a() : p(s).dismissError())
      }, R(p(s).recoveryRequired.value ? p(D).recover : p(D).acknowledge), 9, hh))], 8, ch)) : V("", !0),
      p(h) && !p(o) && (w.value !== "person" || j.value !== p(h).person) ? ($(), A("aside", fh, [
        k("strong", null, R(p(Fe)(p(h).person)), 1),
        k("p", ph, R(p(At)(p(h))), 1),
        p(h).text ? ($(), A("details", mh, [k("summary", null, R(p(D).receivedReply), 1), k("p", vh, R(p(h).text), 1)])) : V("", !0),
        k("button", {
          type: "button",
          onClick: L[7] || (L[7] = (...T) => p(s).dismissConversationFailure && p(s).dismissConversationFailure(...T))
        }, R(p(D).acknowledge), 1)
      ])) : V("", !0),
      M.value && Tt.value && !w.value && !f.value && !p(o) ? ($(), A("aside", gh, [k("span", null, [k("small", null, R(p(D).rewardTitle), 1), k("strong", null, R(p(D).rewardReceived(Tt.value)), 1)]), k("button", {
        type: "button",
        "aria-label": p(D).rewardDismiss,
        onClick: L[8] || (L[8] = (T) => Tt.value = 0)
      }, "×", 8, yh)])) : V("", !0),
      M.value && p(u) && !p(o) && !b.value && !e.generationActive && (w.value || f.value || p(u).phase === "reward" || p(u).phase === "lost") ? ($(), A("div", {
        key: 10,
        class: "ember-curtain",
        style: ra(w.value === "person" ? Me.value : void 0)
      }, [k("section", {
        ref_key: "dialog",
        ref: Z,
        class: lt(["ember-panel", {
          "ember-wide": w.value === "map" || w.value === "build" && I.value === "wardrobe",
          "ember-map-panel": w.value === "map",
          "ember-wardrobe-panel": w.value === "build" && I.value === "wardrobe",
          "ember-dialogue": w.value === "person"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": N.value,
        tabindex: "-1"
      }, [w.value !== "map" && w.value !== "person" ? ($(), A("header", wh, [
        k("h2", null, R(N.value), 1),
        w.value === "build" ? ($(), A("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": p(D).build
        }, [k("button", {
          type: "button",
          "aria-pressed": I.value === "relics",
          onClick: L[9] || (L[9] = (T) => I.value = "relics")
        }, R(p(oe).equipment), 9, Mh), k("button", {
          type: "button",
          "aria-pressed": I.value === "wardrobe",
          onClick: L[10] || (L[10] = (T) => I.value = "wardrobe")
        }, R(p(D).wardrobe), 9, _h)], 8, xh)) : V("", !0),
        w.value !== "prologue" && p(u).pendingParley?.decision !== "attack" && (w.value || p(u).phase !== "lost" && p(u).phase !== "reward") ? ($(), A("button", {
          key: 1,
          type: "button",
          disabled: !!p(u).pendingParley && p(l),
          onClick: Te
        }, R(p(D).close), 9, kh)) : V("", !0)
      ])) : V("", !0), w.value === "map" ? ($(), St(Xl, {
        key: 1,
        campaign: p(u),
        onClose: Te
      }, null, 8, ["campaign"])) : w.value === "prologue" ? ($(), A(J, { key: 2 }, [k("p", Sh, R(p(D).opening), 1), k("button", {
        class: "ember-primary",
        type: "button",
        onClick: Te
      }, R(p(D).start), 1)], 64)) : w.value === "journal" ? ($(), A(J, { key: 3 }, [
        k("p", Rh, R(p(hn)(p(u))), 1),
        k("ol", Ch, [($(!0), A(J, null, ke(p(u).facts, (T) => ($(), A("li", { key: T }, R(p(un)[T]), 1))), 128))]),
        fe.value.length ? ($(), A(J, { key: 0 }, [
          k("h3", null, R(p(D).journeyReward(Ve.value)), 1),
          k("ul", $h, [($(!0), A(J, null, ke(fe.value, (T) => ($(), A("li", { key: T.fact }, [_e(R(p(un)[T.fact]) + " ", 1), k("strong", null, R(p(D).rewardReceived(T.amount)), 1)]))), 128))]),
          k("small", null, R(p(D).rewardRule), 1)
        ], 64)) : V("", !0)
      ], 64)) : w.value === "build" ? ($(), A(J, { key: 4 }, [I.value === "wardrobe" && p(n) ? ($(), St(kc, {
        key: 0,
        data: p(n).data,
        traveler: p(u).traveler,
        balance: p(n).balance,
        blocked: p(l),
        weapon: p(u).weapon,
        onCommand: Ge
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : ($(), A(J, { key: 1 }, [
        k("div", Ah, [k("strong", null, R(p(u).traveler.name), 1), k("span", null, [
          _e(R(p(oe).genders[p(u).traveler.gender]), 1),
          p(u).traveler.appearanceAge ? ($(), A(J, { key: 0 }, [_e(" · " + R(p(wa)[p(u).traveler.appearanceAge]), 1)], 64)) : V("", !0),
          _e(" · " + R(p(oe).identityRole), 1)
        ])]),
        k("small", null, R(p(D).slots(p(u).equipped.length, p(K).relicSlots)), 1),
        k("p", null, R(p(Ct)[p(u).weapon].name) + " · " + R(p(Wr)(p(u).weapon)), 1),
        p(ve)[p(u).location.scene].safe ? V("", !0) : ($(), A("p", Ph, R(p(D).safeBuild), 1)),
        p(u).collection.length ? V("", !0) : ($(), A("p", Eh, R(p(D).emptyBuild), 1)),
        k("div", Ih, [($(!0), A(J, null, ke(la.value, (T) => ($(), A("article", { key: T.id }, [
          je(Ot, { name: T.id }, null, 8, ["name"]),
          k("h3", null, [_e(R(p(ka)[T.id].name) + " ", 1), k("small", null, R(p(ee).rank(T.rank)), 1)]),
          k("p", null, R(p(ka)[T.id].detail), 1),
          T.issue === "dependency" || T.issue === "capacity" ? ($(), A("small", zh, R(p(D).loadoutIssue[T.issue]), 1)) : V("", !0),
          k("button", {
            type: "button",
            disabled: p(l) || !!T.issue,
            onClick: (we) => Ge({
              type: "loadout",
              equipped: T.equipped
            })
          }, R(p(u).equipped.includes(T.id) ? p(D).takeOff : p(D).putOn), 9, Lh)
        ]))), 128))])
      ], 64))], 64)) : w.value === "person" ? ($(), A(J, { key: 5 }, [
        k("header", Th, [
          k("div", jh, [k("h2", null, R(p(Fe)(j.value)), 1), k("small", null, R(p(te).scenes[p(u).location.scene]), 1)]),
          ($(), St(cu, {
            key: j.value,
            campaign: p(u),
            person: j.value,
            draft: B.value,
            "memory-state": p(n)?.memories?.[j.value],
            blocked: p(l),
            onRetryMemory: L[11] || (L[11] = (T) => p(s).retryMemory(j.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !be.value && p(u).pendingParley?.decision !== "attack" ? ($(), A("button", {
            key: 0,
            type: "button",
            disabled: !!p(u).pendingParley && p(l),
            onClick: Te
          }, R(p(D).close), 9, Oh)) : V("", !0)
        ]),
        k("div", {
          ref_key: "transcript",
          ref: U,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: L[16] || (L[16] = (...T) => p(X) && p(X)(...T))
        }, [
          p(dt) ? ($(), A("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: L[12] || (L[12] = (...T) => p(jt) && p(jt)(...T))
          }, R(p(ie).older), 1)) : V("", !0),
          ($(!0), A(J, null, ke(p(kt), (T) => ($(), A(J, { key: T.key }, [T.side === "player" ? ($(), A("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": T.key
          }, [k("small", null, R(p(u).traveler.name), 1), _e(R(T.turn.player), 1)], 8, Zh)) : ($(), A("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": T.key,
            "data-fresh-reply": Le.value === T.turn.id
          }, [T.turn.issue === "action_rejected" || T.turn.issue === "clothing_rejected" || T.turn.issue === "reply_invalid" || T.turn.issue === "reply_incomplete" ? ($(), A("p", Nh, R(p(ie).issues[T.turn.issue]), 1)) : V("", !0), T.turn.kind === "receipt" && T.turn.issue === "reply_invalid" ? ($(), A("details", Dh, [k("summary", null, R(p(ie).rawReply), 1), k("p", Fh, R(T.turn.reply), 1)])) : T.turn.kind === "receipt" ? ($(), A("p", Bh, R(T.turn.reply), 1)) : ($(), A(J, { key: 3 }, [
            je(G1, {
              person: j.value,
              reply: T.turn.reply,
              performance: T.turn.performance,
              animate: Le.value === T.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            je(yd, {
              campaign: p(u),
              person: j.value,
              turn: T.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            T.turn.clothing ? ($(), St(Md, {
              key: 0,
              clothing: T.turn.clothing
            }, null, 8, ["clothing"])) : V("", !0)
          ], 64))], 8, Uh))], 64))), 128)),
          p(Ha) && Se.value ? ($(), A(J, { key: 1 }, [k("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Se.value.status === "sending"
          }, [k("small", null, R(p(u).traveler.name), 1), _e(R(Se.value.text), 1)], 8, Wh), ue.value ? ($(), A("p", qh, R(p(ie).sendFailed), 1)) : V("", !0)], 64)) : V("", !0),
          !p(Qe) && p(h)?.person === j.value && !qe.value.some((T) => T.id === p(h)?.actionId) ? ($(), A("div", Hh, [
            k("p", Vh, R(p(At)(p(h))), 1),
            p(h).text ? ($(), A("details", Gh, [k("summary", null, R(p(D).receivedReply), 1), k("p", Yh, R(p(h).text), 1)])) : V("", !0),
            k("button", {
              type: "button",
              onClick: L[13] || (L[13] = (...T) => p(s).dismissConversationFailure && p(s).dismissConversationFailure(...T))
            }, R(p(D).acknowledge), 1)
          ])) : V("", !0),
          p(G) ? ($(), A("nav", Qh, [p(Qe) ? ($(), A("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: L[14] || (L[14] = (...T) => p(Gt) && p(Gt)(...T))
          }, R(p(ie).newer), 1)) : V("", !0), k("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: L[15] || (L[15] = (...T) => p(Vt) && p(Vt)(...T))
          }, R(p(ie).latest), 1)])) : V("", !0)
        ], 544),
        p(d)?.person === j.value ? ($(), St(dd, {
          key: 0,
          phase: p(d).phase,
          "started-at": p(d).startedAt
        }, null, 8, ["phase", "started-at"])) : V("", !0),
        je(od, {
          modelValue: B.value,
          "onUpdate:modelValue": L[17] || (L[17] = (T) => B.value = T),
          blocked: p(l) || F.value || e.generationActive,
          talking: p(r),
          "can-regenerate": !!He.value || ue.value,
          retrying: ue.value,
          conclusion: ut.value,
          onSend: Ya,
          onRegenerate: Qa,
          onContinue: Kt,
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
      ], 64)) : w.value === "passage" ? ($(), A("p", Kh, R(p(te).passages[P.value].body), 1)) : w.value === "arrival" ? ($(), A(J, { key: 7 }, [
        k("img", {
          class: "ember-story-art",
          src: p(fs).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, Xh),
        k("p", Jh, R(p(D).received), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: Te
        }, R(p(D).resume), 1)
      ], 64)) : w.value === "ending" ? ($(), A(J, { key: 8 }, [
        k("img", {
          class: "ember-story-art",
          src: p(fs).ending,
          alt: "",
          decoding: "async"
        }, null, 8, e2),
        k("h2", null, R(p(D).endingTitle), 1),
        k("p", t2, R(p(D).ending), 1),
        k("p", null, R(p(D).freeTime), 1),
        p(Ls)(p(u)).optionalRoots ? ($(), A("p", a2, R(p(D).optionalRoots), 1)) : V("", !0),
        Ve.value ? ($(), A("strong", n2, R(p(D).journeyReward(Ve.value)), 1)) : V("", !0),
        k("small", null, R(p(D).continued), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: Te
        }, R(p(D).remain), 1)
      ], 64)) : p(u).phase === "reward" ? ($(), A(J, { key: 9 }, [
        k("p", null, R(p(D).rewardDetail), 1),
        k("div", s2, [($(!0), A(J, null, ke(p(u).offers, (T) => ($(), A("button", {
          key: T.id,
          type: "button",
          disabled: p(l),
          onClick: (we) => Ge({
            type: "relic",
            id: T.id
          })
        }, [
          je(Ot, { name: T.id }, null, 8, ["name"]),
          k("h3", null, [_e(R(p(ka)[T.id].name) + " ", 1), k("small", null, R(p(ee).rank(T.rank)), 1)]),
          k("p", null, R(p(ka)[T.id].detail), 1)
        ], 8, r2))), 128))]),
        k("button", {
          type: "button",
          disabled: p(l),
          onClick: L[18] || (L[18] = (T) => Ge({ type: "leave" }))
        }, R(p(D).skip), 9, o2)
      ], 64)) : p(u).phase === "lost" ? ($(), A(J, { key: 10 }, [
        k("p", i2, R(p(D).fallenDetail), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: p(l),
          onClick: L[19] || (L[19] = (T) => Ge({ type: "retry" }))
        }, R(p(D).retry), 9, l2),
        k("button", {
          type: "button",
          disabled: p(l),
          onClick: L[20] || (L[20] = (T) => Ge({ type: "retreat" }))
        }, R(p(D).retreat), 9, c2)
      ], 64)) : ($(), A(J, { key: 11 }, [
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!p(o) || e.generationActive,
          onClick: Te
        }, R(p(D).resume), 9, u2),
        k("div", d2, [k("button", {
          type: "button",
          "aria-pressed": g.value,
          onClick: L[21] || (L[21] = (T) => g.value = !g.value)
        }, R(p(D).sound), 9, h2)]),
        k("details", null, [
          k("summary", null, R(p(oe).controls), 1),
          k("p", f2, R(p(D).controls), 1),
          k("p", p2, R(p(D).touchControls), 1)
        ]),
        k("button", {
          type: "button",
          onClick: da
        }, R(p(oe).title), 1)
      ], 64))], 10, bh)], 4)) : V("", !0)
    ]));
  }
}), $2 = m2;
export {
  $2 as default
};
