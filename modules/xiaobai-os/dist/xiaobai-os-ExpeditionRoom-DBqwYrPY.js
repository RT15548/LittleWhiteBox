/* eslint-disable */
import { $ as Ht, A as Jn, D as Le, E as Ue, I as Va, J as Ir, M as St, N as Tn, P as Dt, Q as cn, R as aa, S as A, T as Ce, U as Re, V as $, W as un, X as de, at as Lt, b as kt, c as Ls, ct as Ts, d as jn, dt as da, ft as S, h as ee, i as er, l as zr, lt as m, m as Rt, nt as js, p as Os, q as Lr, r as Tr, rt as W, u as Zs, ut as yt, v as Y, x as G, y as k } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Ke } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as Us, r as dn, t as Ns } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as Ds, t as Fs } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as Bs } from "./xiaobai-os-constants-CDXgazQ7.js";
import { C as ka, Ct as qs, Ft as tr, Lt as bt, Pt as Ws, S as Hs, St as jr, T as ar, Tt as Vs, X as Ct, Y as Or, Z as Gs, _ as yn, _t as Ys, a as Na, bt as La, d as On, et as Zr, h as Qs, kt as Ks, l as Xs, n as Ur, o as Js, p as eo, st as Nr, vt as to, w as Dr, wt as nr, x as ao, xt as Zn, y as rr, yt as no } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as Fr } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
import { A as gt, B as Ae, C, D as le, E as ro, F as qe, H as so, I as K, L as Nt, M as oo, N as io, O as lo, P as Br, R as qr, S as bn, T as Wr, U as Hr, V as Vr, _ as Ca, a as Tt, b as Gr, c as B, d as Yr, f as $a, g as Ga, h as sr, i as Vt, j as he, k as Xt, l as wn, m as Un, n as xn, o as Zt, p as Qr, r as ua, s as co, t as ne, u as Mn, v as se, w as at, x as Yt, y as hn, z as _e } from "./xiaobai-os-copy-BMey45Sg.js";
function Ya(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function or(e, t, r) {
  const a = [...t], n = [];
  for (; a.length && n.length < r; ) n.push(a.splice(Math.floor(Ya(e) * a.length), 1)[0]);
  return n;
}
function fn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function ve(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function $e(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var uo = 1e-9;
function Qt(e, t, r) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (r + 0.5) * e.cellSize
  };
}
function Jt(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function Kr(e, t) {
  const r = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!r || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((l) => l.length !== r || /[^.# ]/.test(l))) && $e("map_invalid");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  for (const l of e.gates) {
    (!l.id || n.has(l.id) || !l.cells.length) && $e("map_invalid"), n.add(l.id);
    const o = !t.has(l.id);
    o && c.add(l.id);
    for (const { column: d, row: h } of l.cells) {
      (!Number.isInteger(d) || !Number.isInteger(h) || d < 0 || d >= r || e.rows[h]?.[d] !== ".") && $e("map_invalid");
      const u = h * r + d;
      s.has(u) && $e("map_invalid"), s.add(u), o && i.add(u);
    }
  }
  for (const l of t) n.has(l) || $e("gate_unknown");
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
function Da(e, t, r, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), s = Math.max(r - e.y, 0, e.y - r - a);
  return n * n + s * s;
}
function Ta(e, t, r) {
  const a = r.x - t.x, n = r.y - t.y, s = a * a + n * n, i = s === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / s));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function Xr(e, t, r, a, n) {
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
    const d = (o - c) / l, h = (o + n - c) / l;
    if (s = Math.max(s, Math.min(d, h)), i = Math.min(i, Math.max(d, h)), s >= i) return !1;
  }
  return s < i;
}
function ho(e, t, r, a, n) {
  return Xr(e, t, r, a, n) ? 0 : Math.min(Da(e, r, a, n), Da(t, r, a, n), Ta({
    x: r,
    y: a
  }, e, t), Ta({
    x: r + n,
    y: a
  }, e, t), Ta({
    x: r,
    y: a + n
  }, e, t), Ta({
    x: r + n,
    y: a + n
  }, e, t));
}
function ze(e, t, r, a = 0) {
  (![
    t.x,
    t.y,
    r.x,
    r.y,
    a
  ].every(Number.isFinite) || a < 0) && $e("input_invalid");
  const { map: n } = e, s = n.cellSize, i = Jt(n, {
    x: Math.min(t.x, r.x) - a,
    y: Math.min(t.y, r.y) - a
  }), c = Jt(n, {
    x: Math.max(t.x, r.x) + a,
    y: Math.max(t.y, r.y) + a
  });
  for (let l = i.row; l <= c.row; l++) for (let o = i.column; o <= c.column; o++) {
    if (!e.blocked(o, l)) continue;
    const d = n.origin.x + o * s, h = n.origin.y + l * s;
    if (a === 0 ? Xr(t, r, d, h, s) || Da(t, d, h, s) === 0 && Da(r, d, h, s) === 0 : ho(t, r, d, h, s) < a * a - uo) return !1;
  }
  return !0;
}
var wt = (e, t, r) => ze(e, t, t, r);
function Nn(e, t, r, a) {
  [r.x, r.y].every(Number.isFinite) || $e("input_invalid"), wt(e, t, a) || $e("position_blocked");
  const n = Math.hypot(r.x, r.y);
  if (n === 0) return;
  const s = Math.ceil(n / (e.map.cellSize / 4)), i = r.x / s, c = r.y / s;
  for (let l = 0; l < s; l++) {
    const o = {
      x: t.x + i,
      y: t.y + c
    };
    if (ze(e, t, o, a)) {
      Object.assign(t, o);
      continue;
    }
    const d = Math.abs(i) >= Math.abs(c) ? ["x", "y"] : ["y", "x"];
    for (const h of d) {
      const u = {
        ...t,
        [h]: t[h] + (h === "x" ? i : c)
      };
      ze(e, t, u, a) && Object.assign(t, u);
    }
  }
}
function _n(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function Et(e) {
  const { landscape: t } = e, { bounds: r } = t, a = {
    x: r.x - r.width / 2,
    y: r.z - r.depth / 2
  }, n = [
    r,
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
  const s = t.features.map((d) => d.id);
  new Set(s).size !== s.length && $e("map_invalid"), t.features.some((d) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root"
  ].includes(d.kind) && (d.height === void 0 || !Number.isFinite(d.height) || d.height <= 0)) && $e("map_invalid");
  for (const d of n.slice(1)) (d.x - d.width / 2 < a.x || d.z - d.depth / 2 < a.y || d.x + d.width / 2 > a.x + r.width || d.z + d.depth / 2 > a.y + r.depth) && $e("map_invalid");
  t.roads.some((d) => !Number.isFinite(d.width) || d.width <= 0 || d.points.length < 2 || d.points.some(([h, u], v) => !Number.isFinite(h) || !Number.isFinite(u) || v > 0 && h === d.points[v - 1][0] && u === d.points[v - 1][1])) && $e("map_invalid");
  const i = [];
  for (let d = 0; d < r.depth; d++) {
    let h = "";
    for (let u = 0; u < r.width; u++) {
      const v = {
        x: a.x + u + 0.5,
        y: a.y + d + 0.5
      };
      h += t.features.some((f) => f.kind !== "arch" && _n(v, f.footprint)) ? "#" : ".";
    }
    i.push(h);
  }
  const c = {
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
  }, l = Kr(c, new Set(c.gates.map((d) => d.id)));
  Object.values(e.anchors).some((d) => !wt(l, d, K.playerRadius)) && $e("map_invalid");
  const o = /* @__PURE__ */ new Set();
  for (const d of [...e.exits, ...e.objects])
    (!e.anchors[d.anchor] || o.has(d.id)) && $e("map_invalid"), o.add(d.id);
  return {
    ...e,
    map: c,
    gates: t.gates
  };
}
var fo = Et({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(hn.map((e) => [e.to, e.position])),
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
    ...hn.map((e) => ({
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
  }, Un.object],
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
    ].map((e) => hn.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), po = Et({
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
}), mo = Et({
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
}), vo = Et({
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
}), go = Et({
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
}), yo = Et({
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
}), bo = Et({
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
}), wo = Et({
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
}), xo = Object.fromEntries(Object.entries(Gr).map(([e, t]) => {
  const { width: r, depth: a } = t, n = r / 2, s = a / 2, i = [C("west-wall", "wall", -n + 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  }), C("east-wall", "wall", n - 0.5, 0, 1, a, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const l of ["north", "south"]) {
    const o = (l === "north" ? -1 : 1) * (s - 0.5);
    if (t.doors.some((d) => d.side === l)) {
      i.push(C(`${l}-door`, "door", 0, o, 4, 1));
      for (const d of [-1, 1]) i.push(C(`${l}-${d}`, "wall", d * (n + 2) / 2, o, n - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else i.push(C(`${l}-wall`, "wall", 0, o, r, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const c = e === "guest_room" ? t.furniture.find((l) => l.kind === "bed").footprint : null;
  return [e, Et({
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
      ...Object.fromEntries(t.doors.map((l) => [l.side, {
        x: 0,
        y: (l.side === "north" ? -1 : 1) * (s - 2)
      }]))
    },
    exits: t.doors.map((l) => ({
      id: l.side,
      anchor: l.side,
      to: l.to,
      arrival: l.arrival,
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
        width: r,
        depth: a
      },
      vista: "room",
      surface: "boards",
      roads: [],
      gates: [],
      features: [...i, ...t.furniture]
    }
  })];
})), we = {
  camp: fo,
  crossroads: po,
  gate: mo,
  beacon: vo,
  waterway: go,
  cells: yo,
  hall: bo,
  roots: wo,
  ...xo
};
function ir(e) {
  return !e || we[e.location.scene].safe && e.phase === "exploration";
}
var vt = {
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
function pn(e, t) {
  const r = vt[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || r.achievement !== null && e.awards.some((a) => a.key === r.achievement);
}
var be = (e, t, r = 0) => ({
  family: e,
  chapter: r,
  ...t ? { requires: [t] } : {}
}), ie = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), ha = {
  "storm-step": be("storm"),
  conductor: be("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: be("storm"),
  cinder: be("fire"),
  wildfire: be("fire", ["cinder", "inferno"]),
  "blood-price": be("risk"),
  frost: be("frost"),
  shatter: be("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: be("skill"),
  hunter: {
    ...be("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: be("blade"),
  orbit: be("storm"),
  thorns: be("guard"),
  aegis: be("guard"),
  siphon: be("life"),
  focus: be("skill"),
  renewal: be("life"),
  execution: be("blade"),
  "last-stand": be("guard", void 0, 1),
  quicksilver: be("skill"),
  magnet: be("skill"),
  wardstone: be("guard"),
  pilgrim: be("life"),
  gambit: be("risk", void 0, 1),
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
}, I = (e, t) => e.relics.find((r) => r.id === t)?.rank ?? 0;
function Mo(e) {
  return Br.filter((t) => !ha[t].weapons || ha[t].weapons.includes(e));
}
function Jr(e, t, r = null) {
  const a = ha[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((s) => s !== r && I(e, s) > 0)));
}
var Ut = Math.PI * 2, Q = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), fe = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), Dn = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Ye = (e, t, r) => ({
  x: e.x + Math.cos(t) * r,
  y: e.y + Math.sin(t) * r
});
function tt(e, t, r, a, n, s) {
  if (s) {
    Nn(s.space, t, {
      x: Math.cos(r) * a,
      y: Math.sin(r) * a
    }, n);
    return;
  }
  t.x += Math.cos(r) * a, t.y += Math.sin(r) * a;
  for (const i of e.obstacles) {
    const c = Q(t, i), l = n + i.radius;
    if (c < l) {
      const o = c < 1e-3 ? r : fe(i, t);
      t.x = i.x + Math.cos(o) * l, t.y = i.y + Math.sin(o) * l;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function _o(e, t, r, a) {
  const n = e.x - t.x, s = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(r) + s * Math.sin(r)));
  return Math.hypot(n - Math.cos(r) * i, s - Math.sin(r) * i);
}
var ko = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], mn = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function ea(e, t, r, a) {
  if (!wt(e, t, a) || !wt(e, r, a)) return null;
  if (ze(e, t, r, a)) return [{ ...r }];
  const { map: n, columns: s, rows: i } = e, c = Jt(n, t), l = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), h = [];
  function u(f) {
    return Qt(n, f % s, Math.floor(f / s));
  }
  function v(f, w, y, M) {
    if (f < 0 || f >= s || w < 0 || w >= i) return;
    const _ = w * s + f;
    d.has(_) || (l.get(_) ?? 1 / 0) <= y || (l.set(_, y), o.set(_, M), h.push({
      id: _,
      score: y + mn(u(_), r)
    }));
  }
  for (let f = -1; f <= 1; f++) for (let w = -1; w <= 1; w++) {
    const y = c.column + w, M = c.row + f, _ = Qt(n, y, M);
    ze(e, t, _, a) && v(y, M, mn(t, _), -1);
  }
  for (; h.length; ) {
    h.sort((y, M) => M.score - y.score || M.id - y.id);
    const { id: f } = h.pop();
    if (d.has(f)) continue;
    d.add(f);
    const w = u(f);
    if (ze(e, w, r, a)) {
      const y = [{ ...r }];
      let M = f;
      for (; M !== -1; )
        y.push(u(M)), M = o.get(M);
      y.reverse();
      const _ = [];
      let R = t;
      for (let g = 0; g < y.length; ) {
        let x = g;
        for (; x + 1 < y.length && ze(e, R, y[x + 1], a); ) x++;
        R = y[x], _.push(R), g = x + 1;
      }
      return _;
    }
    for (const [y, M] of ko) {
      const _ = f % s + y, R = Math.floor(f / s) + M, g = Qt(n, _, R);
      ze(e, w, g, a) && v(_, R, l.get(f) + mn(w, g), f);
    }
  }
  return null;
}
var lr = (e) => !_e(e) || e === "warden" || e === "thornheart" || e === "keeper", cr = /* @__PURE__ */ new WeakMap();
function es(e, t) {
  let r = cr.get(e);
  r || (r = /* @__PURE__ */ new WeakMap(), cr.set(e, r));
  let a = r.get(t);
  return a || (a = {
    ...e,
    blocked(n, s) {
      const i = Qt(e.map, n, s);
      return i.x < t.left || i.x > t.right || i.y < t.top || i.y > t.bottom || e.blocked(n, s);
    }
  }, r.set(t, a)), a;
}
var oe = (e, t, r, a = 0) => !e || ze(e.space, t, r, a);
function kn(e, t, r, a, n) {
  let s = 0;
  for (let i = 0.2; i <= a + 0.2; i += 0.2) {
    const c = Math.min(i, a), l = {
      x: t.x + Math.cos(r) * c,
      y: t.y + Math.sin(r) * c
    };
    if (!ze(e.space, t, l, n)) break;
    s = c;
  }
  return s;
}
function Ro(e, t, r) {
  return e.summonPoints.filter((a) => wt(e.space, a, r) && ea(e.space, e.entry, a, r)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function ts(e, t, r) {
  return !e || ze(e.space, t, r, 0.3) ? r : {
    x: t.x,
    y: t.y
  };
}
function Fn(e, t, r, a) {
  if (!e) return Math.atan2(r.y - t.y, r.x - t.x);
  let n = r;
  if (!wt(e.space, n, a)) {
    const i = [], c = a + e.space.map.cellSize, l = Jt(e.space.map, {
      x: r.x - c,
      y: r.y - c
    }), o = Jt(e.space.map, {
      x: r.x + c,
      y: r.y + c
    });
    for (let h = Math.max(0, l.row); h <= Math.min(e.space.rows - 1, o.row); h++) for (let u = Math.max(0, l.column); u <= Math.min(e.space.columns - 1, o.column); u++) {
      const v = Qt(e.space.map, u, h);
      Math.hypot(v.x - r.x, v.y - r.y) <= a + e.space.map.cellSize && wt(e.space, v, a) && ze(e.space, v, r) && i.push(v);
    }
    i.sort((h, u) => Math.hypot(h.x - r.x, h.y - r.y) - Math.hypot(u.x - r.x, u.y - r.y));
    const d = i.find((h) => ea(e.space, t, h, a));
    if (!d) return null;
    n = d;
  }
  const s = ea(e.space, t, n, a);
  return s?.length ? Math.atan2(s[0].y - t.y, s[0].x - t.x) : null;
}
function ye(e, t, r, a = 1, n = 0) {
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
function Ie(e, t, r, a, n = !1) {
  if (!_e(t) && e.enemies.filter((l) => l.hp > 0).length >= (a?.enemyLimit ?? K.maxEnemies)) return null;
  if (a && !n) {
    const l = Ro(a, r, he[t].radius);
    if (!l) return null;
    r = l;
  }
  const s = he[t], i = (a?.segment && t === "warden" ? Ae.wardenHp : a?.segment && t === "thornheart" ? Ae.heartHp : a?.segment && t === "keeper" ? Ae.keeperHp : s.hp) * (_e(t) ? 1 : (1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)) * (a?.segment ? Ae.mobHp : 1)), c = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: i,
    maxHp: i,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Ya(e) * 20),
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
function At(e, t, r, a, n, s = {}) {
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
function pe(e, t, r, a, n, s, i, c = !1, l = {}) {
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
function Ge(e, t, r, a, n) {
  return pe(e, t, "slam", r, a, 8, n);
}
function ke(e, t, r, a, n, s, i) {
  return pe(e, t, "beam", 0, s, 9, i, !1, {
    angle: r,
    length: a,
    width: n
  });
}
function mt(e, t, r, a, n, s, i = 0.22) {
  for (let c = 0; c < a; c++) At(e, t, r + (a === 1 ? 0 : c / (a - 1) - 0.5) * n, s, !1, { speed: i });
}
function ur(e, t, r, a, n, s = 0.16) {
  for (let i = 0; i < r; i++) At(e, t, a + i * Ut / r, n, !1, { speed: s });
}
function Rn(e, t, r, a, n = 0) {
  const s = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: t === "turret" ? 65 : t === "familiar" ? gt.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(s), s;
}
var ja = (e) => e === "attack" || e === "skill";
function as(e, t) {
  if (e.player.hp <= 0) return;
  const r = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += r, r > 0 && ye(e, e.player, "heal");
}
function Pt(e, t, r) {
  if (_e(t.kind)) {
    if (t.controlRecovery > 0 || (t.stagger += r, t.stagger < 100)) return;
    t.stagger = 0, r = 24, t.controlRecovery = Ae.bossControlRecovery;
  }
  t.stun = Math.max(t.stun, r), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), ye(e, t, "guard", 1.4);
}
function We(e, t, r, a, n, s = e.player, i) {
  if (t.hp <= 0 || !oe(i, s, t)) return;
  const c = t.burn > 0 || ja(n) && I(a, "cinder") > 0, l = t.chill > 0 || ja(n) && I(a, "frost") > 0, o = (n === "skill" || n === "companion" && a.weapon === "cannon") && l && I(a, "shatter") > 0, d = ja(n) && c && l && I(a, "overload") > 0;
  let h = r * (I(a, "blood-price") ? qe.bloodDamage + (I(a, "blood-price") - 1) * 0.12 : 1);
  if (I(a, "execution") && t.hp / t.maxHp < qe.executeThreshold && (h *= qe.executeDamage + (I(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden" && Vr(t.phase)) && n === "attack" && Math.cos(fe(t, s) - t.angle) > 0.4 && t.exposed <= 0 && (h *= I(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !_e(t.kind) && e.enemies.some((u) => u.kind === "priest" && u.hp > 0 && Q(t, u) < 3.5 && oe(i, t, u)) && (h *= 0.7), n === "attack" && I(a, "backstab") && Math.cos(fe(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + I(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && I(a, "duelist") && Pt(e, t, 9 * I(a, "duelist")), o) {
    h += 15 * I(a, "shatter"), t.chill = 0, ye(e, t, "burst", 2.2);
    for (const u of e.enemies) u.id !== t.id && Q(t, u) < 2.2 && We(e, u, 9 * I(a, "shatter"), a, "passive", t, i);
  }
  if (ja(n) && (I(a, "cinder") && (t.burn = Math.max(t.burn, 80 + I(a, "cinder") * 25)), I(a, "frost") && (t.chill = Math.max(t.chill, 45 + I(a, "frost") * 20)), (I(a, "blood-dance") || I(a, "hemorrhage")) && (t.bleed = 100 + 25 * (I(a, "blood-dance") + I(a, "hemorrhage"))), I(a, "venom") && (t.poison = 100 + I(a, "venom") * 35), d && (h += 20 * I(a, "overload"), ye(e, t, "lightning")), n === "skill" && I(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + I(a, "hunter-mark") * 40)), I(a, "inferno") && c && n === "skill" && pe(e, t, "fire", 1.5 + I(a, "inferno") * 0.3, 0, 70, 4 * I(a, "inferno"), !0)), d && (t.burn = 0), (d || o) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && I(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - I(a, "momentum") * 2)), !(t.hp > 0)) {
    if (e.kills++, ye(e, t, "burst", _e(t.kind) ? 3 : 0.8), I(a, "wildfire") && c && pe(e, t, "fire", 1.8 + I(a, "wildfire") * 0.2, 0, 90, 3 * I(a, "wildfire"), !0), I(a, "fracture") && l) for (let u = 0; u < 4 + I(a, "fracture"); u++) At(e, t, u * Ut / (4 + I(a, "fracture")), 9, !0, { source: "passive" });
    if (I(a, "siphon") && (e.kills % qe.siphonEvery === 0 || _e(t.kind)) && as(e, (_e(t.kind) ? qe.siphonBossHeal : qe.siphonHeal) + I(a, "siphon") - 1), I(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * I(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), I(a, "soul-harvest") && (e.player.resource = Math.min(gt.maxPower, e.player.resource + 9 * I(a, "soul-harvest"))), n === "companion" && I(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * I(a, "salvage"))), I(a, "magnet"))
      for (const u of e.enemies) u.hp > 0 && Q(t, u) < 3 + I(a, "magnet") && oe(i, t, u) && tt(e, u, fe(u, t), 0.7, he[u.kind].radius, i);
  }
}
function Sn(e, t, r, a, n, s = e.player) {
  const i = [t];
  if (oe(n, s, t)) {
    I(r, "conductor") && i.push(...e.enemies.filter((c) => c.id !== t.id && c.hp > 0 && Q(c, t) < 4.5 && oe(n, t, c)).sort((c, l) => Q(c, t) - Q(l, t)).slice(0, I(r, "conductor") + 1));
    for (const c of i)
      ye(e, c, "lightning"), We(e, c, a, r, "lightning", n ? c === t ? s : t : e.player, n);
  }
}
function ns(e, t, r) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), ye(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const s = I(t, "riposte"), i = I(t, "thorns");
  if (s || i)
    for (const c of e.enemies) Q(c, a) < 3.2 + s * 0.3 && oe(r, a, c) && (We(e, c, (n ? 20 : 8) * s + 9 * i, t, "passive", a, r), Pt(e, c, n ? 20 : 7));
}
function Qa(e, t, r, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    ns(e, r, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let s = t * Nt[r.weapon].guard * (I(r, "blood-price") ? qe.bloodHurt : 1) * (I(r, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, s);
  if (n.ward -= i, s -= i, n.hp <= s && I(r, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + I(r, "last-stand") * 8, n.invulnerable = 60, ye(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - s), e.damageTaken += s, n.invulnerable = 18, n.lastHit = e.tick, ye(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), I(r, "thorns"))
    for (const c of e.enemies) Q(c, n) < 3 && We(e, c, 10 * I(r, "thorns"), r, "passive", n, a);
}
function Ra(e, t, r = 45) {
  e.ward += Math.max(0, Math.min(t, r - e.ward));
}
function dr(e, t, r, a = !1, n) {
  const s = Nt[t.weapon], i = e.player, c = fe(i, r), l = (a ? 0.6 : 1) * (I(t, "gambit") ? 1 + I(t, "gambit") * 0.12 : 1);
  if (i.facing = c, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const u = s.range + I(t, "piercing") * 0.25;
    ye(e, i, "slash", u, c);
    for (const v of e.enemies)
      Q(i, v) > u + he[v.kind].radius || Math.cos(fe(i, v) - c) < -0.1 || !oe(n, i, v) || (We(e, v, s.damage * l, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && Pt(e, v, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), I(t, "cleave-wave") && i.combo % 3 === 2 && At(e, i, c, 14 * I(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let o = s.damage * l;
  I(t, "distance-draw") && (o *= 1 + Math.min(1, Q(i, r) / 8) * 0.15 * I(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(gt.maxPower, i.resource + 12));
  const d = I(t, "piercing") * qe.extraPierce + I(t, "railgun") * 2, h = At(e, i, c, o, !0, {
    pierce: d,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + I(t, "shrapnel") * 0.3 : 0,
    bounce: I(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && I(t, "split-arrow") && i.combo % 3 === 2) for (const u of [-0.18, 0.18]) At(e, i, c + u, o * (0.35 + I(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: d
  });
}
function So(e, t, r, a) {
  const n = e.player, s = Nt[t.weapon], i = I(t, "focus");
  switch (n.skill = Math.round(s.skillCooldown * (i ? qe.focusSkill - (i - 1) * 0.06 : 1)), I(t, "aegis") && (n.shield = 18 + I(t, "aegis") * 6, n.guard = 8, Ra(n, I(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + I(t, "aegis") * 6, n.guard = 9;
      const c = 1 + n.resource / 100;
      n.resource = 0, ye(e, n, "slash", 3.6, n.facing);
      for (const l of e.enemies)
        l.hp <= 0 || Q(n, l) > 3.6 + he[l.kind].radius || !oe(a, n, l) || (I(t, "shield-break") && (l.exposed = Math.max(l.exposed, 70 + 30 * I(t, "shield-break"))), We(e, l, s.skill * c, t, "skill", n, a), Pt(e, l, 40), _e(l.kind) || tt(e, l, fe(n, l), 1.5, he[l.kind].radius, a));
      I(t, "valor") && Ra(n, 12 * I(t, "valor") * c);
      break;
    }
    case "bow":
      for (let c = -2; c <= 2; c++) At(e, n, n.facing + c * 0.15, s.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      tt(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const c = r ?? n, l = 1 + n.resource / 125;
      if (n.resource = 0, I(t, "convergence"))
        for (const o of e.enemies) Q(o, c) < 4 + I(t, "convergence") && oe(a, c, o) && tt(e, o, fe(o, c), 1.2, he[o.kind].radius, a);
      for (let o = 0; o < 3; o++) {
        const d = Ye(c, o * Ut / 3, 0.7);
        pe(e, oe(a, c, d) ? d : c, "slam", 2.3, 10 + o * 10, 1, s.skill * l, !0, { source: "skill" });
      }
      if (I(t, "nova")) {
        pe(e, n, "frost", 3 + I(t, "nova") * 0.5, 0, 32, 6 * I(t, "nova"), !0, { source: "skill" });
        for (const o of e.enemies) Q(n, o) < 3.5 && oe(a, n, o) && (o.chill = 120, Pt(e, o, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), r) {
        const c = Ye(r, r.angle + Math.PI, he[r.kind].radius + 0.55);
        tt(e, n, fe(n, c), Math.min(5, Q(n, c)), K.playerRadius, a), n.facing = fe(n, r), oe(a, n, r) && (!a || Q(n, r) <= s.range + he[r.kind].radius) && (r.exposed = Math.max(r.exposed, 60), We(e, r, s.skill, t, "skill", n, a), Pt(e, r, 20)), ye(e, n, "slash", 2, n.facing);
      }
      I(t, "shadowstep") && Rn(e, "shade", n, 95 + I(t, "shadowstep") * 30, I(t, "shadowstep"));
      break;
    case "grimoire": {
      const c = n.resource;
      n.resource = 0, n.resonance = gt.resonanceTicks + c, ye(e, n, "resonance", 2);
      for (const l of e.companions) l.kind === "familiar" && l.hp > 0 && l.life > 0 && (l.hp = Math.max(l.hp, gt.familiarHp), l.cooldown = 0);
      r && (r.exposed = Math.max(r.exposed, 100), We(e, r, s.skill + c * 0.3, t, "skill", n, a)), I(t, "command") && pe(e, r ?? n, "storm", 2.4 + I(t, "command") * 0.3, 10, 65, 7 * I(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const c = 1 + (I(t, "overclock") >= 2 ? 1 : 0), l = e.companions.filter((o) => o.kind === "turret");
      l.length >= c && (l[0].life = 0), Rn(e, "turret", ts(a, n, Ye(n, n.facing, 0.9)), 240 + I(t, "overclock") * 45, I(t, "overclock")), I(t, "bunker") && Ra(n, 15 * I(t, "bunker"));
      break;
    }
  }
}
function Co(e, t, r, a) {
  const n = e.player, s = I(r, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - s * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? Dn(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, I(r, "storm-step") && pe(e, n, "storm", 1.7 + I(r, "storm-step") * 0.15, 0, 70, 6 + I(r, "storm-step") * 3, !0), I(r, "trapper") && pe(e, n, "frost", 1.8, 12, 110, 5 * I(r, "trapper"), !0), I(r, "minefield") && pe(e, n, "mine", 2 + I(r, "minefield") * 0.2, 12, 180, 25 * I(r, "minefield"), !0), I(r, "smoke")) {
    for (const i of e.enemies) Q(i, n) < 3 + I(r, "smoke") * 0.4 && oe(a, n, i) && (Pt(e, i, 30 + I(r, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    ye(e, n, "guard", 3);
  }
}
function $o(e, t, r, a) {
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
  const s = e.enemies.filter((o) => o.hp > 0 && oe(a, n, o)).sort((o, d) => Q(n, o) - Q(n, d))[0];
  t.dash && !n.dash && !n.dashTime && Co(e, t, r, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    tt(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && I(r, "momentum") && s && Q(n, s) < 3 && Sn(e, s, r, 10 + I(r, "momentum") * 5, a);
  else if (t.move) {
    n.facing = Dn(t.move);
    const o = n.swing > 0;
    let d = K.speed * (o ? Nt[r.weapon].moveFire : 1);
    I(r, "quicksilver") && n.dash > K.dashCooldown / 2 && (d *= 1 + I(r, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && Q(h, n) < h.radius && oe(a, h, n)) && (d *= 0.65), tt(e, n, n.facing, d, K.playerRadius, a);
  }
  n.travel += Q(i, n), I(r, "pilgrim") && n.travel >= 28 && (n.travel -= 28, Ra(n, I(r, "pilgrim") * 6, 35)), I(r, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && Ra(n, 2, I(r, "wardstone") * 10);
  const c = s && oe(a, n, s) ? s : void 0;
  t.skill && !n.skill && (c && (n.facing = fe(n, c)), So(e, r, c, a));
  const l = Nt[r.weapon].range + (r.weapon === "blade" || r.weapon === "daggers" ? I(r, "piercing") * 0.25 : 0);
  if (c && !n.attack && Q(n, c) <= l + he[c.kind].radius && (dr(e, r, c, !1, a), n.combo++, I(r, "echo") && n.combo % Math.max(2, qe.echoEvery + 1 - I(r, "echo")) === 0 && dr(e, r, c, !0, a), n.attack = Math.round(Nt[r.weapon].period * (I(r, "focus") ? qe.focusAttack : 1))), I(r, "orbit") && e.tick % Math.round(qe.orbitTicks / (1 + I(r, "orbit") * 0.25)) === 0 && s && Q(n, s) < 4.5 && Sn(e, s, r, 12 + I(r, "orbit") * 3, a), I(r, "orbitals") && e.tick % 35 === 0) {
    for (const o of e.enemies) Q(n, o) < 2.5 + I(r, "orbitals") * 0.35 && oe(a, n, o) && (We(e, o, 12 * I(r, "orbitals"), r, "passive", n, a), o.chill = Math.max(o.chill, 30));
    ye(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function Ao(e, t, r) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + I(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && Rn(e, "familiar", ts(r, e.player, Ye(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || oe(r, a, i))).sort((i, c) => Q(i, a) - Q(c, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = fe(a, n), a.kind !== "turret") {
      const i = Q(a, e.player) > 8;
      if (i || Q(a, n) > 1.3 || !oe(r, a, n)) {
        const c = Fn(r, a, i ? e.player : n, 0.25);
        c !== null && tt(e, a, c, i ? 0.19 : 0.14 + I(t, "frenzy") * 0.015, 0.25, r);
      }
    }
    const s = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && Q(a, n) < s && oe(r, a, n)) if (a.kind === "turret")
      At(e, a, a.angle, Nt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      We(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? gt.empoweredDamage : gt.damage) * (1 + I(t, "covenant") * 0.15), t, "companion", a, r), ye(e, a, "slash", 1.2, a.angle);
      const c = a.kind === "shade" ? 32 : i ? gt.empoweredAttackTicks : gt.attackTicks;
      a.cooldown = Math.round(c / (1 + I(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && I(t, "martyr") && (as(e, I(t, "martyr")), pe(e, a, "slam", 2.2, 0, 1, 15 * I(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
function Po(e, t, r) {
  if (r?.segment !== "beacon" || t.kind !== "archer" || !["approach", "lighting"].includes(e.script.signal)) return !1;
  if (t.hp < e.script.signalHp)
    return e.script.signal = "stopped", t.exposed = Math.max(t.exposed, Ae.recoveryTicks), t.cooldown = Ae.recoveryTicks, !1;
  if (t.windup = 0, e.script.signal === "approach") {
    const a = r.signalPoint;
    if (Q(t, a) < 1) e.script.signal = "lighting";
    else {
      const n = Fn(r, t, a, 0.36);
      n !== null && (t.angle = n, tt(e, t, n, 0.1, 0.36, r));
    }
  }
  return !0;
}
function Eo(e, t) {
  const r = e.script, a = e.enemies.find((s) => [
    "keeper",
    "warden",
    "thornheart"
  ].includes(s.kind));
  let n = [];
  if (t.segment === "gate" && !e.enemies.some((s) => s.kind === "archer") && (n = ["charger"]), t.segment === "waterway" && a && a.hp <= a.maxHp * 0.5 && (n = ["archer", "soldier"]), t.segment === "hall" && t.reinforcement && a && a.hp <= a.maxHp * 0.65 && (n = ["guard", "archer"]), t.segment === "roots" && a && a.hp <= a.maxHp * 0.5 && (n = ["stalker", "stalker"]), t.segment === "beacon") {
    const s = e.enemies.find((i) => i.kind === "archer");
    !s && r.signal !== "lit" && (r.signal = "stopped"), s && r.signal === "idle" && !e.enemies.some((i) => i.kind === "guard") && (r.signal = "approach", r.signalHp = s.hp, s.windup = 0, e.objective.target = Ae.signalTicks), s && r.signal === "lighting" && (s.hp < r.signalHp ? (r.signal = "stopped", s.exposed = Math.max(s.exposed, Ae.recoveryTicks)) : ++e.objective.progress >= Ae.signalTicks && (r.signal = "lit", e.objective.hp = 0)), r.signal === "lit" && (n = ["soldier", "soldier"]);
  }
  if (!(!n.length || r.reinforcements === "done")) {
    if (r.reinforcements === "idle" && (r.reinforcements = "warning", r.warning = Ae.reinforcementWarning, a && (a.windup = 0, a.cooldown = Math.max(a.cooldown, Ae.reinforcementWarning + Ae.recoveryTicks))), e.tick % 6 === 0) for (const s of t.summonPoints) ye(e, s, "guard", 1.2);
    --r.warning > 0 || (n.forEach((s, i) => {
      Ie(e, s, t.summonPoints[i], t) || $e("map_invalid");
    }), r.reinforcements = "done");
  }
}
var jt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), Fa = [
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
function Za(e, t, r) {
  if (e.wave++, r) {
    for (const s of r.waves[e.wave - 1]) Ie(e, s.kind, s.position, r, !0);
    return;
  }
  if (e.boss) {
    Ie(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = io[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let s = 0; s < n; s++) {
    const i = Ut * s / n + (e.wave - 1) * 0.8;
    let c = a[(s + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && s < 2 && (c = a[0]), e.encounter === "pursuit" && s === 0 && (c = "stalker"), e.encounter === "siege" && s === 0 && (c = "guard"), Ie(e, c, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function Io(e, t, r) {
  if (r?.segment && Eo(e, r), e.boss) return;
  const a = e.objective, n = e.enemies.some((s) => s.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && Q(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && Q(i, a) < 2.2) && a.progress++;
    const s = Math.min(2, Math.floor(a.progress / jt.ritualTicks));
    a.x = Fa[s].x, a.y = Fa[s].y, e.tick % jt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Ie(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Ya(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % jt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && Za(e, t), e.tick % 150 === 0 && pe(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % jt.pursuitInterval, e.wave < e.waves && a.progress === 0 && Za(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const s = e.tick % 300 === 0, i = Math.round((s ? e.player.y : e.player.x) / 3) * 3;
    ke(e, s ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, s ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  !r && e.tick > jt.warningAfter && e.tick % 180 === 0 && pe(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, Za(e, t, r)) : n && (e.nextWave = 0);
}
function zo(e, t) {
  return e.enemies.some((r) => r.hp > 0) || (t?.segment === "gate" || t?.segment === "beacon" && e.script.signal === "lit") && e.script.reinforcements !== "done" ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function Lo(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, Fa[0]), t.target = jt.ritualTicks * Fa.length), e.encounter === "survival" && (t.target = jt.survivalTicks), e.encounter === "pursuit" && (t.target = jt.pursuitInterval);
}
function To(e) {
  return e.kind === "warden" ? e.hp <= e.maxHp * 0.3 ? 3 : e.hp <= e.maxHp * 0.65 ? 2 : 1 : e.hp <= e.maxHp * 0.5 ? 2 : 1;
}
function jo(e, t, r, a) {
  const n = fe(t, t.target), s = kn(r, t, n, Math.min(7.5, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), he[t.kind].radius);
  t.motionAngle = n, t.motion = Math.ceil(s / 0.32), t.stun = 24;
  const i = ke(e, t, n, s, he[t.kind].radius, 24, 0);
  if (i.life = Math.max(1, t.motion), a) {
    const c = Ye(t, n, s);
    s > 1 && Ge(e, c, 2.8, 24 + t.motion + 20, 23);
  }
  t.exposed = Math.max(t.exposed, 24 + t.motion + 70);
}
function rs(e, t, r) {
  const a = t.pattern % (t.kind === "keeper" && t.phase === 1 ? 2 : 3), n = (s, i, c, l, o) => ke(e, t, s, kn(r, t, s, i, c), c, l, o);
  if (t.kind === "warden" || t.kind === "keeper") if (a === 0) jo(e, t, r, t.kind === "warden" && t.phase > 1);
  else if (a === 1) {
    const s = fe(t, t.target);
    Ge(e, Ye(t, s, kn(r, t, s, 2.4, 0.3)), t.kind === "keeper" ? 2.5 : 3, 25, t.kind === "keeper" ? 20 : 24), t.exposed = Math.max(t.exposed, 95), t.stun = 25;
  } else t.kind === "keeper" || t.phase === 3 ? (n(fe(t, t.target), t.kind === "keeper" ? 10 : 15, 0.9, 30, 23), t.exposed = Math.max(t.exposed, 100), t.stun = 30) : (mt(e, t, t.angle, 5, 1.3, 14, 0.2), t.exposed = Math.max(t.exposed, 65));
  else if (a === 0)
    n(fe(t, t.target), 16, 0.8, 30, 20), t.phase > 1 && e.hazards.filter((s) => !s.friendly && s.kind === "poison").length < 2 && pe(e, t.target, "poison", 2, 40, 150, 9);
  else if (a === 1) {
    for (const s of [-1, 1]) n(t.angle + s * 0.7, 13, 1, 32, 21);
    t.exposed = Math.max(t.exposed, 110), t.stun = 32;
  } else
    pe(e, t, "ring", 7, 36, 10, 22, !1, {
      inner: 3.8,
      angle: t.angle + Math.PI / 2,
      gap: Ae.rootRingGap
    }), t.exposed = Math.max(t.exposed, 110), t.stun = 36;
  t.pattern++;
}
var ia = (e, t) => {
  e.motion = t, e.motionAngle = fe(e, e.target), e.stun = 18;
}, Oo = {
  keeper(e, t, r) {
    r ? rs(e, t, r) : Ge(e, t.target, 2.5, 24, Xt.keeper.damage);
  },
  warden(e, t, r) {
    const a = t.pattern % 3, n = Xt.warden.damage;
    if (a === 0)
      ia(t, 24), ke(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let s = -1; s <= 1; s++) Ge(e, Ye(t, t.angle + s * 0.55, 3.5), 1.8, 12 + Math.abs(s) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      mt(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Ie(e, "guard", {
        x: -7,
        y: -7
      }, r);
  },
  thornheart(e, t, r) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) pe(e, Ye(t.target, n * Ut / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      pe(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Ie(e, "stalker", {
      x: n,
      y: -6
    }, r);
    else for (let n = 0; n < 3 + t.phase; n++) ke(e, t, t.angle + n * Ut / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, ye(e, t, "burst", 2), ke(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), ke(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (r === 1) mt(e, t, fe(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (r === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Ye({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        ke(e, n, fe(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + a * 8, 18);
      }
      t.exposed = Math.max(t.exposed, 75);
    } else
      Ie(e, "wisp", {
        x: -7,
        y: 5
      }), Ie(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const r = t.pattern % 3, a = t.pattern * 0.53;
    if (r === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && ke(e, t, a + n * Ut / 7, 18, 0.6, 32, 23);
    else if (r === 1) for (let n = 0; n < 6; n++) {
      const s = Ye({
        x: 0,
        y: 0
      }, n * Ut / 6, 9);
      mt(e, s, fe(s, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      Ge(e, t.target, 2, 18, 24), pe(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      ia(t, 18), ke(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (r === 1) for (let a = 0; a < 2 + t.phase; a++) Ge(e, Ye(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else r === 2 ? (ke(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), ke(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (mt(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Ie(e, "stalker", {
      x: -8,
      y: 3
    }), Ie(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const r = t.pattern % 4;
    if (r === 0) {
      ia(t, 28);
      for (let a = 0; a < 6; a++) pe(e, Ye(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (r === 1) ur(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (r === 2)
      t.x = 0, t.y = 0, pe(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Ie(e, "bomber", a);
  },
  forgemaster(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (const a of [
      -7,
      0,
      7
    ]) ke(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (r === 1) for (let a = -1; a <= 1; a++) pe(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else r === 2 ? (Ge(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Ie(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Ie(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const r = t.pattern % 3;
    if (r === 0) for (let a = 0; a < 3; a++) pe(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (r === 1)
      ia(t, 30), ke(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) Ge(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (let a = 0; a < 4; a++) pe(e, Ye(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else r === 1 ? mt(e, t, t.angle, 9, 2.2, 14, 0.21) : r === 2 ? (t.x = -t.x, t.y = -t.y, ke(e, t, fe(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Ie(e, "stalker", {
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
      }, ia(t, 40), ke(e, t, 0, 19, 1.4, 14, 25);
    else if (r === 1) for (let a = 0; a < 4; a++) ke(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else r === 2 ? (Ge(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (pe(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), mt(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), Ge(e, t.target, 2.3, 24, 21);
    else if (r === 1) for (let a = 0; a < t.memory.length; a++) Ge(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (r === 2) {
      for (const a of t.memory) ke(e, a, fe(a, t.target), 18, 0.65, 32, 22);
      Ie(e, "wisp", {
        x: -7,
        y: -7
      }), Ie(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      ur(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), ye(e, t, "burst", 2), ke(e, t, fe(t, t.target), 20, 0.8, 24, 26);
    else if (r === 1)
      ia(t, 20), mt(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (r === 2)
      Ge(e, t, 3, 12, 26), pe(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) ke(e, a, fe(a, t.target), 20, 0.6, 22, 23);
  }
};
function Zo(e, t, r, a) {
  if (a?.segment && [
    "keeper",
    "warden",
    "thornheart"
  ].includes(t.kind)) {
    rs(e, t, a);
    return;
  }
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const s = t.phase + 1;
    t.phase = s, ye(e, t, "burst", 4), n === "phoenix" && s === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), pe(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), r.oaths.includes("legion") && Ie(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  Oo[n](e, t, a), t.pattern++;
}
function Uo(e, t, r) {
  if (!_e(t.kind) && [
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
function No(e, t, r, a, n) {
  const s = he[t.kind];
  Q(t.target, e.player) < a && Q(t, e.player) < s.reach + 1 && oe(n, t, e.player) && Qa(e, s.damage, r, n);
  for (const i of e.companions) Q(t.target, i) < a && Q(t, i) < s.reach + 1 && oe(n, t, i) && (i.hp -= s.damage);
  !e.boss && e.encounter === "siege" && Q(t.target, e.objective) < a && Q(t, e.objective) < s.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - s.damage * 0.5)), ye(e, t.target, "slash", a, t.angle);
}
function Do(e, t, r, a) {
  const n = he[t.kind];
  if (_e(t.kind)) {
    Zo(e, t, r, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      mt(e, t, t.angle, e.chapter > 0 ? 3 : 1, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const s of e.enemies) s.hp > 0 && !_e(s.kind) && Q(s, t) < 3.5 && oe(a, t, s) && (s.hp = Math.min(s.maxHp, s.hp + 8));
      mt(e, t, t.angle, 3, 0.7, n.damage, 0.18), ye(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      pe(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      At(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      Ge(e, t.target, 1.7, 8, n.damage), t.exposed = Math.max(t.exposed, 60);
      break;
    default:
      No(e, t, r, n.reach + 0.15, a);
  }
}
function Fo(e, t, r, a) {
  const n = he[t.kind], s = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (tt(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    Q(t, e.player) < n.radius + 0.4 && oe(a, t, e.player) && (Qa(e, n.damage, r, a), t.motion = 0);
    for (const c of e.companions) Q(t, c) < n.radius + 0.3 && oe(a, t, c) && (c.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && Q(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), Q(s, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, ye(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function Bo(e, t, r, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    if (a?.segment && _e(n.kind)) {
      const u = To(n);
      n.kind === "keeper" && u > n.phase && (n.pattern = 2), n.phase = u;
    }
    for (const u of [
      "marked",
      "chill",
      "exposed",
      "controlRecovery"
    ]) n[u] = Math.max(0, n[u] - 1);
    for (const u of [
      "burn",
      "bleed",
      "poison"
    ]) n[u] > 0 && (n[u]--, e.tick % 15 === 0 && We(e, n, 2 + (u === "burn" ? I(t, "cinder") + I(t, "inferno") : u === "bleed" ? I(t, "hemorrhage") + I(t, "blood-dance") : I(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0 || Po(e, n, a)) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      Fo(e, n, t, a);
      continue;
    }
    const s = he[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (Do(e, n, t, a), n.cooldown = Math.max(n.cooldown, a?.segment && _e(n.kind) ? n.phase === 3 ? 95 : 75 : Math.round(s.cooldown * (i ? 0.8 : 1) / (_e(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1))));
      continue;
    }
    const c = Uo(e, n, a), l = Q(n, c), o = oe(a, n, c);
    n.cooldown = Math.max(0, n.cooldown - 1), n.angle = fe(n, c);
    const d = a?.segment && e.enemies.filter((u) => u.id !== n.id && u.hp > 0 && (u.windup > 0 || u.motion > 0)).length + e.hazards.filter((u) => !u.friendly && u.life > 0).length >= Ae.simultaneousWindups;
    if (!n.cooldown && l < s.reach && o && !d) {
      if (n.target = {
        x: c.x,
        y: c.y
      }, n.windup = Math.round(s.windup * (i ? 0.8 : 1)), c === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const u = n.kind === "bomber" ? 23 : l / 0.24, v = Math.min(n.windup + u, 4.5 / Math.max(1e-3, Math.hypot(r.x, r.y))), f = {
          x: c.x + r.x * v,
          y: c.y + r.y * v
        };
        a ? oe(a, n, f) && oe(a, c, f) && (n.target = f) : (n.target.x = Math.max(-10, Math.min(10, f.x)), n.target.y = Math.max(-10, Math.min(10, f.y))), n.angle = fe(n, n.target);
      }
      continue;
    }
    const h = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (l > (h ? 5 : _e(n.kind) ? 2.8 : 0.95) || h && l < 3 || !o) {
      const u = n.kind === "stalker" && l > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, v = Fn(a, n, c, s.radius);
      v !== null && tt(e, n, v + (h && l < 3 && o ? Math.PI : a ? 0 : u), s.speed * (n.chill ? _e(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), s.radius, a);
    }
    for (const u of e.enemies) u.id !== n.id && u.hp > 0 && Q(n, u) < s.radius + he[u.kind].radius && tt(e, n, fe(u, n), 0.027, s.radius, a);
  }
}
function Oa(e, t, r) {
  if (e.kind === "beam") return _o(t, e, e.angle, e.length) < e.width + r;
  const a = Q(e, t);
  return e.kind === "ring" && e.gap && Math.abs(Math.atan2(Math.sin(fe(e, t) - e.angle), Math.cos(fe(e, t) - e.angle))) + Math.asin(Math.min(1, r / Math.max(r, a))) < e.gap / 2 ? !1 : a < e.radius + r && (e.kind !== "ring" || a > e.inner - r);
}
function qo(e, t, r) {
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
      if (Q(a, e.player) < K.playerRadius + a.radius && oe(r, a, e.player)) e.player.shield > 0 ? (ns(e, t, r), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (Qa(e, a.damage, t, r), a.life = 0);
      else {
        const s = e.companions.find((i) => i.hp > 0 && Q(a, i) < 0.3 + a.radius && oe(r, a, i));
        s && (s.hp -= a.damage * (1 - I(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const s of e.enemies) {
      if (s.hp <= 0 || a.hits.includes(s.id) || Q(s, a) > he[s.kind].radius + a.radius || !oe(r, a, s)) continue;
      a.hits.push(s.id);
      const i = a.damage * (I(t, "hunter") && Q(s, e.player) > qe.hunterRange ? qe.hunterDamage + (I(t, "hunter") - 1) * 0.15 : 1);
      if (We(e, s, i, t, a.source, a, r), I(t, "pinning") && a.source === "attack" && (s.chill = 50 + I(t, "pinning") * 20, e.player.combo % 3 === 0 && Pt(e, s, 8 * I(t, "pinning"))), a.splash > 0) {
        ye(e, s, "burst", a.splash);
        for (const c of e.enemies) c.id !== s.id && Q(c, s) < a.splash + he[c.kind].radius && We(e, c, i * 0.55, t, a.source, s, r);
      }
      if (a.bounce > 0) {
        const c = e.enemies.filter((l) => l.hp > 0 && !a.hits.includes(l.id) && Q(l, s) < 6 && oe(r, a, l, a.radius)).sort((l, o) => Q(s, l) - Q(s, o))[0];
        if (c) {
          a.bounce--, a.angle = fe(a, c), a.damage *= 0.8;
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
function Wo(e, t, r) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      if (a.damage <= 0) continue;
      const s = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if ((s ? !a.hits.includes(0) : e.tick % 15 === 0) && Oa(a, e.player, K.playerRadius) && oe(r, a, e.player) && (Qa(e, a.damage, t, r), s && a.hits.push(0)), !e.boss && e.encounter === "siege" && e.tick % 15 === 0 && Oa(a, e.objective, 0.6) && oe(r, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35)), s || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!s || !a.hits.includes(i.id)) && Oa(a, i, 0.3) && oe(r, a, i) && (i.hp -= a.damage * 0.25, s && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((s) => s.hp > 0 && Oa(a, s, he[s.kind].radius) && oe(r, a, s));
    a.kind === "mine" && n.length && (a.life = 0, ye(e, a, "burst", a.radius));
    for (const s of n) a.kind === "storm" ? Sn(e, s, t, a.damage, r, a) : (a.kind === "fire" && (s.burn = Math.max(s.burn, 45)), a.kind === "frost" && (s.chill = Math.max(s.chill, 60)), a.kind === "mine" && Pt(e, s, 25), We(e, s, a.damage, t, a.source, a, r));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function Ho(e, t, r) {
  qo(e, t, r), Wo(e, t, r);
}
function Vo(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function Go(e, t, r) {
  const { seed: a, zone: n, chapter: s, elite: i, boss: c, bossKind: l, encounter: o, hp: d } = e, h = {
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
  return r && ((c && !lr(l) || r.waves.some((u) => u.some((v) => !lr(v.kind)))) && $e("encounter_unsupported"), (o !== "skirmish" || !r.waves.length || !wt(r.space, r.entry, K.playerRadius) || r.waves.some((u) => !u.length || u.some((v) => !wt(r.space, v.position, he[v.kind].radius) || !ea(r.space, r.entry, v.position, K.playerRadius)))) && $e("map_invalid"), Object.assign(h.player, r.entry), Object.assign(h.objective, r.objective), h.obstacles = [], h.waves = r.waves.length), Lo(h), Za(h, t, r), h;
}
function Yo(e, t, r, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((s) => --s.life > 0).slice(-80);
  const n = $o(e, t, r, a);
  Ao(e, r, a), Bo(e, r, n, a), Ho(e, r, a), e.enemies = e.enemies.filter((s) => s.hp > 0), Vo(e) ? e.status = "lost" : (Io(e, r, a), zo(e, a) && (e.status = "won", e.shots = [], e.hazards = []));
}
function Qo(e, t) {
  const r = e.at(-1);
  r && r.move === t.move && r.dash === t.dash && r.skill === t.skill ? r.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var Ko = 2.4;
function Kt(e, t) {
  return (!e?.all || e.all.every((r) => t.has(r))) && (!e?.none || e.none.every((r) => !t.has(r)));
}
var hr = /* @__PURE__ */ new WeakMap();
function xt(e, t) {
  const r = e.gates.filter((i) => Kt(i.condition, t)).map((i) => i.id), a = r.join("/");
  let n = hr.get(e);
  n || (n = /* @__PURE__ */ new Map(), hr.set(e, n));
  let s = n.get(a);
  return s || (s = Kr(e.map, new Set(r)), n.set(a, s)), s;
}
function Ka(e, t) {
  const r = e.exits.filter((n) => Kt(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => Kt(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...r, ...a];
}
function Bn(e, t, r) {
  const a = xt(e, r);
  return Ka(e, r).filter((n) => Q(t.position, n.position) <= 2.4 && ze(a, t.position, n.position)).sort((n, s) => Q(t.position, n.position) - Q(t.position, s.position) || n.target.id.localeCompare(s.target.id));
}
function Xo(e, t, r, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && $e("input_invalid"), t && (e.facing = Dn(t), Nn(r, e.position, {
    x: Math.cos(e.facing) * K.speed * a,
    y: Math.sin(e.facing) * K.speed * a
  }, K.playerRadius));
}
var Jo = [
  "crossroads",
  "gate",
  "beacon",
  "waterway_approach",
  "waterway",
  "hall",
  "roots"
], Me = (e, t) => ({
  kind: e,
  anchor: t
}), nt = {
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
      Me("soldier", "front_left"),
      Me("soldier", "front_right"),
      Me("archer", "front_archer")
    ], [
      Me("guard", "patrol"),
      Me("soldier", "lookout"),
      Me("bomber", "flank")
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
      Me("guard", "guard"),
      Me("soldier", "flank"),
      Me("archer", "archer"),
      Me("archer", "archer_left")
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
      Me("guard", "guard"),
      Me("archer", "archer"),
      Me("bomber", "bomber")
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
      Me("soldier", "front_left"),
      Me("soldier", "front_right"),
      Me("archer", "front_archer")
    ], [
      Me("guard", "front_guard"),
      Me("bomber", "front_bomber"),
      Me("soldier", "front_flank")
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
    waves: [[Me("keeper", "guard")]]
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
    waves: [[Me("warden", "warden")]]
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
    waves: [[Me("thornheart", "tree")]]
  }
}, Xa = (e) => Jo.filter((t) => nt[t].scene === e), Ba = (e, t, r) => {
  const a = nt[e];
  return a.complete ? t.has(a.complete) : r.includes(e) || Xa(a.scene).some((n) => {
    const s = nt[n];
    return s.prerequisite === e && s.complete && t.has(s.complete);
  });
};
function ss(e, t, r) {
  return Xa(e).find((a) => !Ba(a, t, r) && (!nt[a].prerequisite || Ba(nt[a].prerequisite, t, r)));
}
function os(e, t, r, a, n, s) {
  const i = nt[e];
  if (i.complete && t.has(i.complete)) return null;
  const c = we[i.scene];
  return {
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
      space: es(xt(c, t), i.bounds),
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
      enemyLimit: i.boss ? Ae.bossEnemyLimit : Ae.enemyLimit,
      ...e === "beacon" ? { signalPoint: c.anchors.signal } : {}
    }
  };
}
var qn = {
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
}, is = Object.keys(qn);
function ei(e, t, r) {
  return Yt(r.scene) !== "camp" ? [] : is.filter((a) => {
    if (a === "receiving" && e.includes("captives_arrived")) return !1;
    const n = qn[a], s = Ca[t].station, i = we[s.scene].anchors[s.anchor], c = r.scene === "clinic_front" || r.scene === s.scene && Math.hypot(r.position.x - i.x, r.position.y - i.y) <= 2.4;
    return n.atClinic && !c ? !1 : n.people.includes(t) && !e.includes(n.fact) && n.requires.every((l) => e.includes(l));
  });
}
function ti(e, t) {
  if (t.kind === "reward") {
    const r = e.rewards[t.node];
    return !!r?.offers.length && r.scene === e.location.scene;
  }
  return t.kind !== "rest" || e.location.scene !== "waterway" || Ba("waterway_approach", new Set(e.facts), e.completedSegments);
}
function Wn(e, t = !1) {
  const r = we[e.location.scene], a = new Set(e.facts);
  return (t ? Bn(r, e.location, a) : Ka(r, a)).filter((n) => n.kind === "exit" || ti(e, n.target));
}
function ls(e) {
  return e.phase === "exploration" && (we[e.location.scene].safe || Wn(e, !0).some((t) => t.kind === "object" && t.target.kind === "rest"));
}
var ta = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), fr = /* @__PURE__ */ new WeakMap();
function Cn(e, t, r) {
  if (ze(e, t, r, K.playerRadius)) return r;
  const a = Jt(e.map, t), n = Jt(e.map, r), s = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = fr.get(e);
  i || (i = /* @__PURE__ */ new Map(), fr.set(e, i));
  const c = Qt(e.map, a.column, a.row);
  if (!i.has(s)) {
    const o = ea(e, c, Qt(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(s, o?.find((d) => ta(d, c) > 0.01) ?? null);
  }
  const l = i.get(s);
  return l ? ze(e, t, l, K.playerRadius) ? l : c : null;
}
function ai(e) {
  return {
    scene: e.scene,
    position: { ...we[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function $n(e, t) {
  return Xa(e).every((r) => {
    const a = nt[r];
    return a.complete === null || t.has(a.complete);
  });
}
function qa(e, t, r, a) {
  const n = [{
    ...e,
    route: []
  }], s = /* @__PURE__ */ new Set();
  for (; n.length; ) {
    const i = n.shift(), c = we[i.scene], l = xt(c, r);
    if (i.scene === t.scene && Cn(l, i.position, c.anchors[t.anchor])) return i.route;
    for (const o of we[i.scene].exits) {
      const d = `${o.to}/${o.arrival}`;
      s.has(d) || !Kt(o.condition, r) || a && !$n(o.to, r) || !Cn(l, i.position, c.anchors[o.anchor]) || (s.add(d), n.push({
        scene: o.to,
        position: we[o.to].anchors[o.arrival],
        route: [...i.route, o]
      }));
    }
  }
  return null;
}
function cs(e, t) {
  const r = new Set(e.facts), a = e.people[t];
  return Object.entries(Ga).map(([n, s]) => {
    const i = qa(a, s, r, !1), c = $n(s.scene, r), l = $n(a.scene, r) && c ? qa(a, s, r, !0) : null;
    return {
      id: n,
      name: s.name,
      ...bn(s.scene) ? { use: bn(s.scene).use } : {},
      personHere: a.scene === s.scene && (n === s.scene || ta(a.position, we[s.scene].anchors[s.anchor]) <= 2.4),
      playerHere: e.location.scene === s.scene && (n === s.scene || ta(e.location.position, we[s.scene].anchors[s.anchor]) <= 2.4),
      accessible: i !== null,
      safe: c,
      solo: l !== null,
      route: l ?? i
    };
  });
}
function ni(e, t) {
  return Qr(e.facts, t) !== "confined";
}
var us = (e) => Ko * (0.7 + at.indexOf(e) / at.length * 0.2);
function ri(e) {
  return at.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && ta(e.people[t].position, e.location.position) >= us(t));
}
function ds(e, t) {
  return at.filter((r) => t[r].scene === e).map((r) => ({
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
function hs(e) {
  return [...Wn(e), ...ds(e.location.scene, e.people)];
}
function Hn(e, t, r, a) {
  return ds(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const s = e.id === "cells" && !!Ca[n.target.person].returnFact && !r.has("captives_released"), i = xt(e, s ? /* @__PURE__ */ new Set([...r, "captives_released"]) : r);
    return ta(n.position, t) <= (s ? 5 : 2.4) && ze(i, t, n.position);
  });
}
function si(e) {
  const t = new Set(e.facts);
  for (const r of at) {
    const a = e.people[r];
    if (a.mode === "idle") continue;
    const n = we[a.scene], s = xt(n, t);
    let i, c;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && ve("invalid"), i = e.location.position, ta(a.position, i) < us(r)) continue;
    } else {
      const v = Ga[a.destination], f = qa(a, v, t, !0);
      if (f || ve("unavailable"), c = f[0], i = n.anchors[c?.anchor ?? v.anchor], ta(a.position, i) < 0.2) {
        c ? (a.scene = c.to, a.position = { ...we[c.to].anchors[c.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const l = Cn(s, a.position, i);
    l || ve("unavailable");
    const o = l.x - a.position.x, d = l.y - a.position.y, h = Math.hypot(o, d), u = Math.min(h, K.speed * 1.8);
    h && (a.facing = Math.atan2(d, o), Nn(s, a.position, {
      x: o / h * u,
      y: d / h * u
    }, K.playerRadius));
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
}, Ja = Object.keys(He), fs = [...at, ...Ja];
function Oe(e) {
  return Object.hasOwn(Wr, e);
}
function Qe(e) {
  return Oe(e) ? Wr[e] : He[e].name;
}
function Wa(e, t) {
  const r = He[e];
  return we[r.scene].anchors[t.has(r.complete) ? r.clearedAnchor : r.anchor];
}
function en(e, t, r) {
  return Ja.filter((a) => He[a].scene === e).flatMap((a) => {
    const n = Wa(a, r), s = He[a];
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
function An(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && ve("invalid"), e;
}
function pr(e, t = 0, r = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > r) && ve("invalid"), e;
}
function $t(e, t) {
  return (typeof e != "string" || !t.includes(e)) && ve("invalid"), e;
}
function mr(e, t, r) {
  return (!Array.isArray(e) || e.length > t) && ve("invalid"), e.map(r);
}
function oi(e) {
  return new Set(e).size !== e.length && ve("invalid"), e;
}
function vr(e) {
  typeof e != "boolean" && ve("invalid");
}
function ii(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && ve("identity"), e;
}
var Aa = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), li = Object.keys(Aa), ps = ["male", "female"];
function ci(e) {
  const t = An(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && ve("invalid"), {
    name: t.name.trim(),
    gender: $t(t.gender, ps),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: $t(t.appearanceAge, li) }
  };
}
var Gt = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), ms = `${Gt.number} · ${Gt.title}`, ui = {
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
function vs(e, t) {
  const r = ui[t], a = Oe(t) && $a(e.facts, t) && r.returned ? r.returned : r.initial;
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
var fa = Object.freeze({
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
function Vn(e) {
  return fa.bands.filter((t) => e >= t).length - 1;
}
function di(e) {
  const t = e.lastReply;
  if (!t) return null;
  const r = e.conversations[t.person].at(-1);
  return r?.id === t.turnId ? {
    person: t.person,
    turn: r
  } : null;
}
function gr(e, t) {
  const r = e.conversations[t].at(-1);
  return r && r.kind !== "greeting" ? r : null;
}
function hi(e) {
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
function Gn(e) {
  const t = di(e);
  return t?.turn.action === "finish" && !e.facts.includes("chapter_completed") ? t.person : null;
}
var yr = Object.freeze({
  rankCap: 2,
  choices: 3
}), fi = [
  "crossroads",
  "approach",
  "passage"
], pi = {
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
}, mi = {
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
function vi(e, t) {
  if (e.rewards[t]) return;
  const r = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((l) => e.equipped.includes(l.id))
  }, a = new Set(Object.values(e.rewards).flatMap((l) => l.offers.map((o) => o.id))), n = fi.includes(t), s = Mo(e.weapon).flatMap((l) => {
    const o = e.collection.find((d) => d.id === l)?.rank ?? 0;
    return !a.has(l) && o < yr.rankCap && (!n || !o) && Jr(r, l) && (ha[l].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: l,
      rank: o + 1
    }] : [];
  }), i = [], c = (l) => {
    const o = or(e, s.filter((d) => l.includes(d.id) && !i.some((h) => h.id === d.id)), 1)[0];
    o && i.push(o);
  };
  if (t === "crossroads") for (const l of pi[e.weapon]) c([l]);
  else
    c(e.equipped.flatMap((l) => mi[l] ?? [])), c(s.filter((l) => ["guard", "life"].includes(ha[l.id].family)).map((l) => l.id));
  i.push(...or(e, s.filter((l) => !i.some((o) => o.id === l.id)), yr.choices - i.length)), e.rewards[t] = {
    scene: e.location.scene,
    offers: i
  };
}
var gi = (e) => e.rewardNode ? e.rewards[e.rewardNode].offers : [], gs = Object.freeze({
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function Yn(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((r) => r.id === t))
  };
}
function yi(e, t) {
  return ls(e) ? t.length > K.relicSlots ? "capacity" : new Set(t).size !== t.length || t.some((r) => !e.collection.some((a) => a.id === r)) ? "invalid" : null : "unavailable";
}
function Ha(e, t, r) {
  e.facts.includes(t) || e.facts.push(t);
  const a = r ?? [...at.filter((n) => e.people[n].scene === e.location.scene), ...Ja.filter((n) => He[n].scene === e.location.scene)];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function bi(e) {
  const t = e.checkpoint;
  if (e.engagement)
    return os(e.engagement.id, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.engagement.reinforcement)?.field;
}
function wi(e, t) {
  const r = e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"), a = os(t, new Set(e.facts), e.location.position, Math.floor(Ya(e) * 4294967296), e.hp, r);
  a || ve("unavailable"), e.engagement = {
    id: t,
    reinforcement: r
  }, e.battle = Go(a.setup, Yn(e), a.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
}
function xi(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const t = Yt(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const r of sr) {
    if ($a(e.facts, r)) continue;
    const a = e.people[r];
    t && a.scene === "cells" && a.mode === "idle" && (e.people[r] = ai(Ca[r].station));
    const n = e.people[r].scene;
    Yt(n) === "camp" && Ha(e, Ca[r].returnFact, at.filter((s) => e.people[s].scene === n));
  }
  sr.every((r) => $a(e.facts, r)) && Ha(e, "captives_arrived", at.filter((r) => e.people[r].scene === "camp"));
}
function Mi(e) {
  const t = e.engagement.id, r = nt[t];
  r.complete ? Ha(e, r.complete) : e.completedSegments.includes(t) || e.completedSegments.push(t), vi(e, r.reward), e.phase = "exploration", e.battle = null, e.checkpoint = null, e.engagement = null;
}
function br(e, t) {
  if (!(e.pendingParley || Gn(e))) {
    if (e.phase === "battle" && e.battle) {
      const r = bi(e);
      r || ve("invalid"), Yo(e.battle, t, Yn(e), r);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, e.engagement?.id === "beacon" && a.objective.hp === 0 && Ha(e, "alarm_raised"), a.status === "won" ? Mi(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const r = we[e.location.scene], a = new Set(e.facts);
      Xo(e.location, t.move, xt(r, a), gs.explorationSpeed);
      const n = ss(r.id, a, e.completedSegments);
      if (n) {
        const s = nt[n], i = r.anchors[s.trigger];
        Math.hypot(e.location.position.x - i.x, e.location.position.y - i.y) <= s.triggerRadius && wt(es(xt(r, a), s.bounds), e.location.position, K.playerRadius) && wi(e, n);
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (si(e), xi(e));
  }
}
var ys = [
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
    fact: Un.fact,
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
    key: Xt.warden.awardKey,
    amount: K.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: Xt.thornheart.awardKey,
    amount: K.firstBossAward
  }
], mf = Object.fromEntries([
  ...lo.map((e) => [Xt[e].awardKey, K.firstBossAward]),
  ["victory", K.firstVictoryAward],
  ...Object.keys(Nt).map((e) => [`mastery-${e}`, K.masteryAward]),
  ...oo.map((e) => [`oath-${e}`, K.oathAward]),
  ...ys.map((e) => [e.key, e.amount])
]), la = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, _i = {
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
    gestures: la
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
    gestures: la
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
    gestures: la
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
    gestures: la
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
      ...la,
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
    gestures: la
  }
};
function ki(e) {
  return _i[e];
}
var Qn = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, Ri = {
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
}, Pa = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function bs(e, t) {
  const r = { ...Ri[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(r, a.clothing);
  return r;
}
var Si = {
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
}, Ci = Object.keys(Si), vf = [
  ...Ci,
  "soldier",
  "archer",
  "guard",
  "priest",
  "charger",
  "stalker",
  "bomber",
  "wisp"
], $i = (e) => $t(e, qr), vn = (e) => $t(e, Br), wr = (e) => $t(e, Hr);
function Ai(e) {
  const t = An(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: $i(t.weapon),
        outfit: wr(t.outfit),
        traveler: ci(t.traveler),
        chapter: $t(t.chapter, [Gt.id])
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: wr(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: ii(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: $t(t.id, is),
        person: $t(t.person, at)
      };
    case "greet":
      return {
        type: "greet",
        person: $t(t.person, fs)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: oi(mr(t.equipped, K.relicSlots, vn))
      };
    case "input": {
      const r = mr(t.spans, K.maxInputTicks, (a) => {
        const n = An(a);
        return vr(n.dash), vr(n.skill), {
          move: pr(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: pr(n.ticks, 1, K.maxInputTicks)
        };
      });
      return (!r.length || r.reduce((a, n) => a + n.ticks, 0) > K.maxInputTicks) && ve("invalid"), {
        type: "input",
        spans: r
      };
    }
    case "relic":
      return {
        type: "relic",
        id: vn(t.id),
        ...t.replace === void 0 ? {} : { replace: vn(t.replace) }
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: t.type };
    default:
      return ve("invalid");
  }
}
function Pi(e, t) {
  const r = Lt(null), a = W(!1), n = W(""), s = Lt(null), i = W(!1), c = W(!1), l = Lt(null), o = Lt(null), d = W(null), h = Y(() => r.value?.replyFailure?.actionId === d.value ? null : r.value?.replyFailure ?? null), u = Y(() => i.value || !!r.value?.conversation), v = W(!1), f = W(!1);
  let w = !1;
  const y = Lt(null), M = Y(() => {
    const P = (y.value ?? r.value)?.conversation;
    return P || (i.value ? l.value : null);
  }), _ = Y(() => a.value || u.value || c.value || !!s.value || !r.value?.ready || r.value.writeState !== "ready" || r.value.pending), R = (P, U) => P.data.revision !== U.data.revision ? P.data.revision > U.data.revision : P.fileRevision >= U.fileRevision;
  function g(P) {
    if (w || r.value && !R(P, r.value)) return;
    const U = l.value;
    (r.value?.data.active?.id !== P.data.active?.id || U && P.data.active?.conversations[U.person].some((H) => H.id === U.actionId)) && (l.value = null), r.value = P;
  }
  const x = Y(() => {
    if (l.value) return l.value;
    if (r.value?.conversation) return {
      ...r.value.conversation,
      status: "sending"
    };
    const P = r.value?.replyFailure;
    return !P || P.regenerating || r.value?.data.active?.conversations[P.person].some((U) => U.id === P.actionId) ? null : {
      actionId: P.actionId,
      person: P.person,
      text: P.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function b(P, U, H) {
    if (w || a.value) return !1;
    a.value = !0, y.value = null, n.value = "";
    try {
      const F = await e.request(`game/expedition/${P}`, {
        chatIdentity: t,
        ...P === "rebuild" ? { actionId: fn() } : {},
        ...U,
        ...H ? { person: H } : {}
      }, 35e3), Z = y.value;
      return g(Z && R(Z, F.result) ? Z : F.result), v.value = !1, f.value = !1, r.value?.writeState === "ready" && !r.value.pending && P !== "read" && (s.value = null), !0;
    } catch (F) {
      if (!w) {
        v.value = !0, y.value && g(y.value), n.value = Zt(F);
        const Z = F && typeof F == "object" && "code" in F ? String(F.code) : "";
        f.value = Z === "expedition_data_invalid", U && (Z.startsWith("expedition_save_") || Z.startsWith("host_request_")) && (s.value = U);
      }
      return !1;
    } finally {
      y.value = null, w || (a.value = !1);
    }
  }
  const E = e.subscribe((P) => {
    if (w) return;
    if (P.type === "game/expedition/error") {
      const H = P.payload;
      H.chatIdentity === t && (n.value = Zt(H), f.value = H.code === "expedition_data_invalid");
      return;
    }
    if (P.type !== "game/expedition/state") return;
    const U = P.payload;
    U.chatIdentity === t && (a.value ? y.value = U.state : (y.value = null, g(U.state)));
  });
  async function T() {
    const P = s.value;
    return !await b("confirm") || !r.value || r.value.writeState !== "ready" || r.value.pending ? !1 : P && r.value.data.revision === P.revision ? b("act", P) : (s.value = null, c.value = !1, !0);
  }
  async function L(P, U, H) {
    if (_.value || w) return !1;
    const F = fn();
    o.value = H ? {
      person: P,
      turnId: H
    } : null, l.value = {
      actionId: F,
      person: P,
      text: U,
      regenerating: !!H,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", y.value = null;
    try {
      const Z = await e.request(H ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: F,
        revision: r.value.data.revision,
        person: P,
        text: U,
        ...H ? { turnId: H } : {}
      }, 18e4), V = y.value;
      return g(V && R(V, Z.result) ? V : Z.result), !0;
    } catch (Z) {
      if (!w) {
        y.value && g(y.value);
        const V = Z && typeof Z == "object" && "code" in Z ? String(Z.code) : Z instanceof Error ? Z.message : "";
        if (V === "expedition_cancelled")
          return n.value = "", !1;
        c.value = V.startsWith("host_request_") || V.startsWith("expedition_save_"), n.value = c.value ? B.aiUnknown : r.value?.replyFailure?.actionId === F ? "" : Zt(Z);
      }
      return !1;
    } finally {
      o.value = null, i.value = !1, y.value = null, w || (a.value = !1, l.value?.actionId === F && (l.value = H ? null : {
        ...l.value,
        status: "failed"
      }));
    }
  }
  async function N() {
    if (u.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (P) {
        w || (n.value = Zt(P));
      }
  }
  const z = Y(() => v.value || !!s.value || c.value || !r.value || r.value.pending || r.value.writeState !== "ready");
  return {
    view: r,
    busy: a,
    error: n,
    blocked: _,
    failed: s,
    talking: u,
    uncertainTalk: c,
    talk: L,
    outgoing: x,
    replacingReply: o,
    conversationProgress: M,
    cancelTalk: N,
    recoveryRequired: z,
    dataInvalid: f,
    conversationFailure: h,
    dismissConversationFailure() {
      d.value = r.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => b("rebuild"),
    retryMemory: (P) => _.value ? Promise.resolve(!1) : b("retry-memory", void 0, P),
    dismissError() {
      z.value || (n.value = "");
    },
    notice: Y(() => n.value || (r.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(r.value.writeState) || r.value.pending && r.value.writeState === "ready") ? ne.saveError : "")),
    read: () => b("read"),
    recover: T,
    act: (P) => _.value ? Promise.resolve(!1) : b("act", {
      actionId: fn(),
      revision: r.value.data.revision,
      command: Ai(P)
    }),
    dispose() {
      w = !0, E();
    }
  };
}
function Ei(e) {
  const t = Lt(null), r = Lt(!1);
  let a = [], n = 0, s = null, i = !1;
  function c() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const u of a) for (let v = 0; v < u.ticks; v++) br(t.value, u);
    r.value = a.length > 0;
  }
  const l = de(e.view, () => {
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
    const u = await s;
    return s = null, u ? c() : e.failed.value || (a = h.concat(a), n = a.reduce((v, f) => v + f.ticks, 0)), r.value = a.length > 0 || !u, u;
  }
  function d(h) {
    const u = t.value;
    !u || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(u.phase) || u.phase === "exploration" && !h.move && !ri(u) || (br(u, h), Qo(a, h), n++, r.value = !0, Ts(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(u.phase)) && o());
  }
  return {
    current: t,
    dirty: r,
    input: d,
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
var { recent: gn, maximum: xr } = Fs;
function Ii(e) {
  const { history: t, pending: r, talking: a, person: n, campaignId: s, transcript: i, freshReply: c } = e, l = js(/* @__PURE__ */ new Map());
  let o = 0, d = !1;
  const h = Y(() => t.value.reduce((N, z) => N + (z.kind === "greeting" || z.kind === "player" ? 1 : 2), 0)), u = Y(() => h.value + Number(r.value)), v = Y(() => Ds(l.get(n.value)?.range, u.value)), f = Y(() => {
    const N = [];
    let z = 0;
    for (const P of t.value) {
      if (z >= v.value.end) break;
      const U = P.kind === "greeting" ? ["npc"] : P.kind === "player" ? ["player"] : ["player", "npc"];
      for (const H of U)
        z >= v.value.start && z < v.value.end && N.push({
          key: `${P.id}:${H}`,
          side: H,
          turn: P
        }), z++;
    }
    return N;
  }), w = Y(() => v.value.start > 0), y = Y(() => v.value.end < u.value), M = Y(() => y.value || v.value.end - v.value.start > gn), _ = Y(() => r.value && v.value.end > h.value);
  function R(N) {
    N && !N.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function g(N, z) {
    const P = N.getBoundingClientRect().top, U = [...N.querySelectorAll("[data-message-key]")].find((H) => z.has(H.dataset.messageKey) && H.getBoundingClientRect().bottom > P);
    return U ? {
      key: U.dataset.messageKey,
      offset: U.getBoundingClientRect().top - P
    } : null;
  }
  function x(N, z) {
    const P = z && [...N.querySelectorAll("[data-message-key]")].find((U) => U.dataset.messageKey === z.key);
    return !P || !z ? !1 : (N.scrollTop += P.getBoundingClientRect().top - N.getBoundingClientRect().top - z.offset, !0);
  }
  function b() {
    const N = i.value;
    if (!N || d || l.get(n.value)?.latest === !1) return;
    const z = c.value ? N.querySelector('[data-fresh-reply="true"]') : null;
    N.scrollTop = z && z.offsetHeight > N.clientHeight ? z.getBoundingClientRect().top - N.getBoundingClientRect().top + N.scrollTop - 12 : N.scrollHeight;
  }
  function E() {
    const N = ++o, z = n.value, P = i.value?.contains(document.activeElement) ? document.activeElement : null;
    d = !1, c.value = null, l.delete(z), St(() => {
      o === N && n.value === z && (b(), R(P));
    });
  }
  function T() {
    const N = i.value;
    if (!N || d) return;
    const z = !y.value && N.scrollHeight - N.clientHeight - N.scrollTop < 32;
    if (z && M.value) {
      E();
      return;
    }
    l.set(n.value, {
      top: N.scrollTop,
      latest: z,
      range: z ? null : {
        start: v.value.start,
        end: y.value ? v.value.end : null
      }
    });
  }
  async function L(N) {
    const z = i.value;
    if (!z || d) return;
    const P = { ...v.value };
    N === "older" ? (P.start = Math.max(0, P.start - gn), P.end = Math.min(P.end, P.start + xr)) : (P.end = Math.min(u.value, P.end + gn), P.start = Math.max(P.start, P.end - xr));
    const U = g(z, new Set(f.value.filter((ae, rt) => {
      const Xe = v.value.start + rt;
      return Xe >= P.start && Xe < P.end;
    }).map((ae) => ae.key))), H = z.contains(document.activeElement) ? document.activeElement : null, F = n.value, Z = ++o;
    d = !0;
    const V = {
      start: P.start,
      end: P.end === u.value ? null : P.end
    };
    l.set(F, {
      range: V,
      top: z.scrollTop,
      latest: !1
    }), await St(), !(Z !== o || n.value !== F || i.value !== z) && (x(z, U) || (z.scrollTop = N === "older" ? 0 : z.scrollHeight), l.set(F, {
      range: V,
      top: z.scrollTop,
      latest: !1
    }), d = !1, R(H));
  }
  return de(s, () => {
    o++, d = !1, l.clear();
  }), de([i, n], ([N, z]) => {
    o++, d = !1;
    const P = l.get(z);
    N && (N.scrollTop = P && !P.latest ? P.top : N.scrollHeight);
  }, { flush: "post" }), de(i, (N, z, P) => {
    if (!N) return;
    const U = new ResizeObserver(b);
    U.observe(N), P(() => U.disconnect());
  }, { flush: "post" }), de(f, async (N) => {
    const z = i.value, P = n.value, U = o, H = l.get(P);
    if (!z || d || !H || H.latest) return;
    const F = g(z, new Set(N.map((Z) => Z.key)));
    await St(), !(U !== o || i.value !== z || l.get(P) !== H) && (x(z, F), H.top = z.scrollTop);
  }), de([
    t,
    r,
    a,
    c
  ], async () => {
    await St(), b();
  }), {
    messages: f,
    hasOlder: w,
    hasNewer: y,
    expanded: M,
    pendingVisible: _,
    rememberReading: T,
    resetLatest: E,
    older: () => L("older"),
    newer: () => L("newer")
  };
}
var et = {
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
}, Mr = {
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
}, zi = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, Li = ["d"], Ti = ["d"], ji = /* @__PURE__ */ Le({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, r) => ($(), A("svg", zi, [k("path", {
      d: m(Mr)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, Li), k("path", {
      d: m(Mr)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Ti)]));
  }
}), Ot = ji, Oi = { class: "ember-relics" }, Zi = ["disabled", "onClick"], Ui = ["disabled"], Ni = ["disabled"], Di = { class: "ember-relics" }, Fi = ["disabled", "onClick"], Bi = ["disabled"], qi = /* @__PURE__ */ Le({
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
    return (i, c) => n.value ? ($(), A(ee, { key: 0 }, [
      k("h3", null, S(m(Vt)[n.value].name) + " · " + S(m(et).replace), 1),
      k("div", Oi, [($(!0), A(ee, null, Re(e.campaign.equipped, (l) => ($(), A("button", {
        key: l,
        type: "button",
        disabled: e.blocked,
        onClick: (o) => a("choose", n.value, l)
      }, [Ue(Ot, { name: l }, null, 8, ["name"]), k("h3", null, S(m(Vt)[l].name), 1)], 8, Zi))), 128))]),
      k("button", {
        type: "button",
        disabled: e.blocked,
        onClick: c[0] || (c[0] = (l) => a("choose", n.value))
      }, S(m(et).store), 9, Ui),
      k("button", {
        type: "button",
        disabled: e.blocked,
        onClick: c[1] || (c[1] = (l) => n.value = null)
      }, S(m(et).back), 9, Ni)
    ], 64)) : ($(), A(ee, { key: 1 }, [k("div", Di, [($(!0), A(ee, null, Re(m(gi)(e.campaign), (l) => ($(), A("button", {
      key: l.id,
      type: "button",
      disabled: e.blocked,
      onClick: (o) => s(l.id)
    }, [
      Ue(Ot, { name: l.id }, null, 8, ["name"]),
      k("h3", null, [Ce(S(m(Vt)[l.id].name) + " ", 1), k("small", null, S(m(ne).rank(l.rank)), 1)]),
      k("p", null, S(m(Vt)[l.id].detail), 1)
    ], 8, Fi))), 128))]), k("button", {
      type: "button",
      disabled: e.blocked,
      onClick: c[2] || (c[2] = (l) => a("leave"))
    }, S(m(B).skip), 9, Bi)], 64));
  }
}), Wi = qi, ue = Object.freeze({
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
    clothing_rejected: Pa.rejected,
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
function Hi(e) {
  let t = null, r = null, a = null, n = !1, s = !1, i = null, c = -1, l = 0, o = 0, d = 0, h = 0, u = 0;
  function v(w, y, M, _ = "sine", R = w * 0.8, g = 0) {
    if (!n || !t || !r || t.state !== "running") return;
    const x = t.createOscillator(), b = t.createGain(), E = t.currentTime + g;
    x.type = _, x.frequency.setValueAtTime(w, E), x.frequency.exponentialRampToValueAtTime(Math.max(30, R), E + y), b.gain.setValueAtTime(1e-4, E), b.gain.exponentialRampToValueAtTime(M, E + 9e-3), b.gain.exponentialRampToValueAtTime(1e-4, E + y), x.connect(b).connect(r), x.start(E), x.stop(E + y), x.onended = () => {
      x.disconnect(), b.disconnect();
    };
  }
  function f(w, y, M, _) {
    if (!n || !t || !r || !a || t.state !== "running") return;
    const R = t.createBufferSource(), g = t.createBiquadFilter(), x = t.createGain(), b = t.currentTime;
    R.buffer = a, g.type = "bandpass", g.Q.value = 0.65, g.frequency.setValueAtTime(M, b), g.frequency.exponentialRampToValueAtTime(_, b + w), x.gain.setValueAtTime(1e-4, b), x.gain.exponentialRampToValueAtTime(y, b + 8e-3), x.gain.exponentialRampToValueAtTime(1e-4, b + w), R.connect(g).connect(x).connect(r), R.start(b), R.stop(b + w), R.onended = () => {
      R.disconnect(), g.disconnect(), x.disconnect();
    };
  }
  return {
    async enable(w) {
      if (!s) {
        n = w;
        try {
          if (!w) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), r = t.createGain(), r.gain.value = 0.55, r.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const y = a.getChannelData(0);
            for (let M = 0; M < y.length; M++) y[M] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, s || e();
        }
      }
    },
    tick(w) {
      (!i || w.tick < c) && (c = -1, l = w.player.hp, o = w.kills, d = w.player.skill, h = w.serial, u = w.player.combo), i = w, c !== w.tick && (c = w.tick, w.player.hp < l && (f(0.16, 0.17, 800, 120), v(95, 0.2, 0.12, "triangle", 42)), w.kills > o && (v(659, 0.22, 0.045), v(988, 0.3, 0.025, "sine", 980, 0.035)), w.player.combo > u && f(0.095, 0.08, 2700, 500), w.player.dashTime === 7 && f(0.2, 0.09, 500, 2600), w.player.skill > d && (f(0.24, 0.12, 2200, 250), v(165, 0.35, 0.075, "triangle", 82), v(660, 0.36, 0.035, "sine", 440, 0.02)), w.effects.some((y) => y.id > h && y.kind === "lightning") && (f(0.12, 0.1, 4400, 1e3), v(1200, 0.08, 0.018, "sine", 210)), w.effects.some((y) => y.id > h && (y.kind === "block" || y.kind === "parry")) && (v(1350, 0.18, 0.07, "triangle", 740), v(2200, 0.11, 0.025, "sine", 1600)), w.effects.some((y) => y.id > h && y.kind === "ward-hit") && v(510, 0.16, 0.06, "sine", 250), w.effects.some((y) => y.id > h && y.kind === "ward-break") && (f(0.25, 0.1, 3600, 650), v(720, 0.3, 0.05, "sine", 120)), w.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((y, M) => v(y, 0.65, 0.04, "sine", y, M * 0.075)), w.status === "lost" && v(147, 0.7, 0.06, "triangle", 73), l = w.player.hp, o = w.kills, d = w.player.skill, h = w.serial, u = w.player.combo);
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
}, _r = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], pt = {
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
}, ft = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, tn = [
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
], Vi = {
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
}, gf = Object.fromEntries(Object.entries(ha).map(([e, t]) => [e, Vi[t.family]]));
function Gi(e, t, r) {
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
  function l(u) {
    if (!(!c.includes(u.code) || u.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(u.target.tagName)) && !(u.code === "Space" && u.target instanceof HTMLElement && u.target.closest("button"))) {
      if (u.preventDefault(), u.stopPropagation(), r(), u.code === "Escape") {
        u.repeat || t();
        return;
      }
      a.add(u.code), !u.repeat && u.code === "Space" && (s = !0), !u.repeat && u.code === "KeyE" && (i = !0);
    }
  }
  function o(u) {
    a.delete(u.code);
  }
  function d() {
    a.clear(), n = {
      x: 0,
      y: 0
    }, s = !1, i = !1;
  }
  function h() {
    d(), t();
  }
  return e.addEventListener("keydown", l), window.addEventListener("keyup", o), window.addEventListener("blur", h), {
    frame() {
      const u = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), v = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), f = {
        move: Math.hypot(u, v) < 0.15 ? 0 : (Math.round((Math.atan2(v, u) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: s,
        skill: i
      };
      return s = !1, i = !1, f;
    },
    stick(u, v) {
      n = {
        x: u,
        y: v
      };
    },
    dash() {
      s = !0, r();
    },
    skill() {
      i = !0, r();
    },
    clear: d,
    dispose() {
      d(), e.removeEventListener("keydown", l), window.removeEventListener("keyup", o), window.removeEventListener("blur", h);
    }
  };
}
function Yi(e, t) {
  let r = null;
  function a(s) {
    if (!r || s.pointerId !== r.id) return;
    const i = r.surface.getBoundingClientRect(), c = i.width * 0.36, l = (s.clientX - i.left - i.width / 2) / c, o = (s.clientY - i.top - i.height / 2) / c, d = Math.max(1, Math.hypot(l, o));
    e(l / d, o / d);
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
function Pn(e) {
  const t = new nr();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const r = {
    box: new Js(1, 1, 1),
    sphere: new Ks(1, 20, 14),
    rock: new ar(1, 0),
    crown: new ar(1, 1),
    cylinder: new Qs(1, 1, 1, 24),
    cone: new eo(1, 1, 12),
    disc: new Xs(1, 48),
    ring: new La(0.965, 1, 64),
    openRing: new La(0.965, 1, 48, 1, Ae.rootRingGap / 2, Math.PI * 2 - Ae.rootRingGap),
    arc: new La(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new tr(1, 0.08, 8, 40),
    stroke: new La(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new tr(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new rr(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  function i(u, v = !1, f = 1, w = !1) {
    const y = `${u}/${v}/${f}/${w}`;
    let M = n.get(y);
    return M || (M = v ? new Gs({
      color: u,
      transparent: f < 1,
      opacity: f,
      depthWrite: f === 1,
      side: 2
    }) : new Zr({
      color: u,
      map: e?.get(u) ?? null,
      roughness: w ? 0.34 : 0.88,
      metalness: w ? 0.45 : 0.02,
      side: 2
    }), n.set(y, M)), M;
  }
  function c(u, v, f, w, y = [
    0,
    0,
    0
  ], M = !1, _ = 1, R = !1) {
    let g = r[v];
    if (!M && v === "box" && e?.has(f)) {
      g = g.clone(), s.add(g);
      const b = g.getAttribute("position"), E = g.getAttribute("normal"), T = g.getAttribute("uv");
      for (let L = 0; L < T.count; L++) {
        const N = Math.abs(E.getX(L)) > 0.5 ? b.getZ(L) * w[2] : b.getX(L) * w[0], z = Math.abs(E.getY(L)) > 0.5 ? b.getZ(L) * w[2] : b.getY(L) * w[1];
        T.setXY(L, N / 8, z / 8);
      }
    }
    const x = new Ct(g, i(f, M, _, R));
    return x.scale.set(...w), x.position.set(...y), x.castShadow = !M, x.receiveShadow = !M, u.add(x), x;
  }
  function l(u, v = [
    0,
    0,
    0
  ]) {
    const f = new ka();
    return f.position.set(...v), u.add(f), f;
  }
  function o(u, v, f, w, y, M = 1, _ = !1, R = 0.04) {
    const g = c(u, _ ? "disc" : "ring", v, [
      f,
      f,
      1
    ], [
      w,
      R,
      y
    ], !0, M);
    return g.rotation.x = -Math.PI / 2, g;
  }
  function d(u, v, f, w = [
    0,
    0,
    0
  ], y = 0) {
    const M = e?.has(f) ?? !1, _ = JSON.stringify([
      v,
      y,
      M
    ]);
    let R = a.get(_);
    if (!R) {
      const x = new nr();
      if (v.forEach(([b, E], T) => T ? x.lineTo(b, E) : x.moveTo(b, E)), x.closePath(), R = y ? new rr(x, {
        depth: y,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: y * 0.3,
        bevelSize: y * 0.3,
        bevelSegments: 2
      }) : new Vs(x), M) {
        const b = R.getAttribute("uv");
        for (let E = 0; E < b.count; E++) b.setXY(E, b.getX(E) / 8, b.getY(E) / 8);
      }
      a.set(_, R);
    }
    const g = new Ct(R, i(f));
    return g.position.set(...w), g.castShadow = !0, g.receiveShadow = !0, u.add(g), g;
  }
  function h(u) {
    u.updateMatrixWorld(!0);
    const v = u.matrixWorld.clone().invert(), f = new Or(), w = /* @__PURE__ */ new Map();
    u.traverse((M) => {
      if (!(M instanceof Ct) || Array.isArray(M.material)) return;
      const _ = (M.geometry.index ? M.geometry.toNonIndexed() : M.geometry.clone()).applyMatrix4(f.multiplyMatrices(v, M.matrixWorld)), R = `${M.material.uuid}/${M.castShadow}/${M.receiveShadow}`;
      let g = w.get(R);
      g || (g = {
        material: M.material,
        castShadow: M.castShadow,
        receiveShadow: M.receiveShadow,
        geometries: []
      }, w.set(R, g)), g.geometries.push(_);
    }), u.clear();
    const y = [];
    for (const { material: M, castShadow: _, receiveShadow: R, geometries: g } of w.values()) {
      const x = Fr(g);
      if (g.forEach((E) => E.dispose()), !x) throw new Error("expedition_geometry_merge");
      const b = new Ct(x, M);
      b.castShadow = _, b.receiveShadow = R, u.add(b), y.push(x);
    }
    return () => {
      u.clear(), y.forEach((M) => M.dispose());
    };
  }
  return {
    mesh: c,
    group: l,
    ring: o,
    shape: d,
    material: i,
    bake: h,
    geometries: r,
    dispose() {
      Object.values(r).forEach((u) => u.dispose()), a.forEach((u) => u.dispose()), s.forEach((u) => u.dispose()), n.forEach((u) => u.dispose());
    }
  };
}
function Qi(e, t, r, a) {
  const n = tn[r], s = K.arena, { mesh: i, group: c, ring: l } = e, o = (f, w, y, M = n.stone) => i(f, "box", M, w, y);
  function d(f, w, y, M = !0) {
    const _ = c(t, [
      f,
      0,
      w
    ]);
    o(_, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), o(_, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), o(_, [
      0.91,
      y,
      0.91
    ], [
      0,
      y / 2 + 0.6,
      0
    ]);
    for (const R of [-0.38, 0.38]) o(_, [
      0.08,
      y - 0.35,
      0.12
    ], [
      R,
      y / 2 + 0.6,
      0.48
    ], n.light);
    return o(_, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      y + 0.6,
      0
    ], n.light), o(_, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      y + 0.85,
      0
    ], n.dark), M && (i(_, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      y + 1.24,
      0
    ]), o(_, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      y - 0.15,
      0.52
    ], n.trim)), _;
  }
  function h(f, w, y, M) {
    d(f - y / 2, w, M - 2), d(f + y / 2, w, M - 2);
    const _ = c(t, [
      f,
      M - 2,
      w
    ]);
    i(_, "arch", n.light, [
      y / 2,
      2.3,
      1.15
    ]);
    for (let R = 1; R < 10; R++) {
      const g = R / 10 * Math.PI, x = o(_, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(g) * y * 0.49,
        Math.sin(g) * 2.25,
        0.59
      ], n.trim);
      x.rotation.z = g - Math.PI / 2;
    }
    o(_, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function u(f, w, y = 1) {
    const M = c(t, [
      f,
      0,
      w
    ]);
    M.scale.setScalar(y);
    for (let _ = 0; _ < 5; _++) {
      const R = _ * 2.4, g = i(M, "rock", _ % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + _ % 2 * 0.3,
        0.45
      ], [
        Math.cos(R) * 0.4,
        0.5,
        Math.sin(R) * 0.4
      ]);
      g.rotation.z = Math.sin(R) * 0.4;
    }
    for (let _ = 0; _ < 3; _++) i(M, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(_ * 4) * 0.5,
      1,
      Math.cos(_ * 4) * 0.4
    ]);
  }
  function v(f, w, y) {
    const M = c(t, [
      f,
      0,
      w
    ]);
    M.scale.setScalar(y);
    const _ = i(M, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    _.rotation.z = -0.1;
    for (let R = 0; R < 6; R++) {
      const g = R * 2.4;
      i(M, "rock", R % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(g) * 0.95,
        3 + Math.sin(g) * 0.5,
        Math.sin(g) * 0.85
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
  for (let f = 0; f < 16; f++) o(t, [
    3 + f % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(f * 7) * 32,
    -3.92,
    Math.cos(f * 3) * 25
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
  for (let f = -10; f <= 10; f += 2) for (let w = -10; w <= 10; w += 2) o(t, [
    1.96,
    0.045,
    1.96
  ], [
    f,
    0.025,
    w
  ], (f * 3 + w + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    l(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), l(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), l(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let f = 0; f < 8; f++) {
      const w = f * Math.PI / 4, y = o(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(w) * 5.04,
        0.065,
        Math.sin(w) * 5.04
      ], n.trim);
      y.rotation.y = -w + Math.PI / 2;
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
      const f = [];
      for (let y = 0; y < (r === 2 ? 24 : 16); y++) {
        const M = y * Math.PI * 2 / (r === 2 ? 24 : 16), _ = y % 2 ? 0.85 : r === 2 ? 2.6 : y % 4 ? 1.8 : 3.2;
        f.push([Math.cos(M) * _, Math.sin(M) * _]);
      }
      const w = e.shape(t, f, n.seam, [
        0,
        0.061,
        0
      ]);
      w.rotation.x = -Math.PI / 2, l(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const f of [-1, 1]) for (let w = 0; w < 4; w++) {
    const y = f * (7 + w % 2), M = -7 + w * 4, _ = o(t, [
      0.035,
      0.016,
      0.55 + w * 0.1
    ], [
      y,
      0.055,
      M
    ], n.seam);
    _.rotation.y = w * 1.3;
    const R = o(t, [
      0.028,
      0.015,
      0.3
    ], [
      y + 0.1,
      0.055,
      M + 0.3
    ], n.seam);
    R.rotation.y = w * 1.3 + 0.8;
  }
  for (const f of [-s - 0.35, s + 0.35]) {
    o(t, [
      0.38,
      0.18,
      s * 2 + 1
    ], [
      f,
      0.08,
      0
    ], n.light);
    for (let w = -10; w <= 10; w += 5) d(f + Math.sign(f) * 0.5, w, w === -10 ? 3.6 : 1.35);
  }
  for (let f = 0; f < 6; f++) o(t, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - f * 0.26,
    s + 0.65 + f * 0.8
  ], f % 2 ? n.stone : n.light);
  h(0, -s - 3, 8, 6.3);
  for (const f of [-1, 1]) {
    o(t, [
      5,
      3.2,
      1.9
    ], [
      f * 8.4,
      1.45,
      -s - 3
    ], n.dark), o(t, [
      5.5,
      0.3,
      2.3
    ], [
      f * 8.4,
      3.2,
      -s - 3
    ], n.light);
    const w = c(t, [
      f * 5.8,
      4.8,
      -s - 2.9
    ]);
    o(w, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let y = 0; y < 5; y++) o(w, [
      0.35,
      2.6 - Math.abs(y - 2) * 0.12,
      0.08
    ], [
      (y - 2) * 0.34,
      -1.35,
      Math.sin(y * 2) * 0.08
    ], y % 2 ? n.foliage : n.dark);
    if (o(w, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), r < 3) {
      for (let y = 0; y < 4; y++) u(f * (12.8 + y % 2), -9 + y * 5, 0.8 + y * 0.1);
      v(f * 15, -13, 1.5), v(f * 17, 1, 1.7);
    } else if (r === 3) for (let y = 0; y < 3; y++) {
      const M = c(t, [
        f * 15,
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
      ]), o(M, [
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
    else if (r === 4) {
      for (let M = 0; M < 5; M++) i(t, "rock", M % 2 ? n.light : n.accent, [
        1,
        2.2 + M % 3,
        0.9
      ], [
        f * (13.5 + M % 2),
        1.2,
        -9 + M * 4
      ]).rotation.z = f * -0.2;
      const y = c(t, [
        f * 17,
        0,
        -13
      ]);
      o(y, [
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
        const _ = c(t, [
          f * 14,
          0,
          -10 + M * 6
        ]);
        o(_, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let R = 0; R < 3; R++) {
          o(_, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + R,
            0
          ], n.trim);
          for (let g = 0; g < 5; g++) o(_, [
            0.27,
            0.65 + g % 2 * 0.12,
            0.6
          ], [
            -0.85 + g * 0.4,
            1.2 + R,
            0.1
          ], g % 2 ? n.foliage : n.stone);
        }
      }
      const y = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        f * 18,
        6.2,
        -13
      ]);
      y.rotation.y = f * 0.3;
    }
    o(t, [
      7,
      1.4,
      18
    ], [
      f * 17,
      -0.7,
      -3
    ], n.dark), o(t, [
      6.7,
      0.1,
      17.7
    ], [
      f * 17,
      0.06,
      -3
    ], n.seam);
    for (const y of [-3.5, 3.5]) o(t, [
      0.22,
      0.25,
      18.2
    ], [
      f * 17 + y,
      0.13,
      -3
    ], n.stone);
    o(t, [
      9,
      1.8,
      10
    ], [
      f * 15,
      -0.9,
      -17
    ], n.dark), o(t, [
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
    const w = (f - 3) * 8, y = -26 - f % 3 * 6, M = 7 + f * 5 % 7;
    if (o(t, [
      5.2,
      M,
      5.5
    ], [
      w,
      M / 2 - 3,
      y
    ], n.stone), o(t, [
      5.8,
      0.4,
      6
    ], [
      w,
      M - 3,
      y
    ], n.light), r === 1) {
      const _ = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        w,
        M - 0.8,
        y
      ]);
      _.rotation.z = 0.9;
    } else if (r === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      w,
      M - 0.8,
      y
    ]);
    else if (r === 3) {
      for (const _ of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + f % 2 * 2,
        0.7
      ], [
        w + _,
        M - 1,
        y
      ]);
      o(t, [
        3.8,
        0.25,
        4
      ], [
        w,
        M - 2.5,
        y
      ], n.trim);
    } else if (r === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        w,
        M - 0.8,
        y
      ]);
      for (const _ of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        w + _,
        M - 3,
        y + 3
      ]);
    } else if (r === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        w,
        M + 0.7,
        y
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        w,
        M - 1,
        y
      ]).rotation.x = Math.PI / 2;
    else {
      for (const _ of [
        -2,
        0,
        2
      ]) o(t, [
        0.7,
        1.2,
        5.6
      ], [
        w + _,
        M - 2.35,
        y
      ], n.light);
      f % 2 && v(w + 1, y + 2, 1.5);
    }
    for (const _ of [
      -1.5,
      0,
      1.5
    ]) o(t, [
      0.5,
      2.8,
      0.12
    ], [
      w + _,
      M - 5.6,
      y + 2.8
    ], n.dark);
  }
  for (const f of a?.obstacles ?? []) {
    const w = c(t, [
      f.x,
      0,
      f.y
    ]);
    i(w, "cylinder", n.dark, [
      f.radius,
      0.22,
      f.radius
    ], [
      0,
      0.11,
      0
    ]), i(w, "cylinder", n.stone, [
      f.radius * 0.85,
      1.15,
      f.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(w, "cylinder", n.light, [
      f.radius,
      0.2,
      f.radius
    ], [
      0,
      1.4,
      0
    ]), i(w, "rock", n.accent, [
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
      o(w, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(M) * f.radius * 0.86,
        0.8,
        Math.sin(M) * f.radius * 0.86
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
    for (const f of [-1, 1]) {
      u(f * 3, -8, 1.2), u(f * 4, -10, 0.85);
      const w = c(t, [
        f * 2.6,
        0.5,
        -6
      ]);
      i(w, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), i(w, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), i(w, "cone", n.trim, [
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
function Ki(e, t, r) {
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
  ]), i = e.group(s), c = r === "female", l = c ? 0.225 : 0.255, o = vt.traveler.fabric, d = "#574a40", h = "#d7ab8b", u = "#463f3b";
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
  ]), e.mesh(s, "sphere", h, [
    c ? 0.161 : 0.172,
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
  for (const _ of [-1, 1])
    e.mesh(s, "sphere", h, [
      0.027,
      0.042,
      0.027
    ], [
      _ * 0.166,
      -0.01,
      0
    ]), e.mesh(s, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      _ * 0.061,
      0.016,
      0.155
    ]), e.mesh(s, "box", u, [
      0.047,
      0.012,
      0.014
    ], [
      _ * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", u, [
      0.035,
      0.12,
      0.08
    ], [
      _ * 0.157,
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
    const _ = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let R = 0; R < 4; R++) e.mesh(_, "sphere", u, [
      0.064 - R * 9e-3,
      0.09,
      0.063 - R * 8e-3
    ], [
      R % 2 ? 0.014 : -0.014,
      -R * 0.115,
      0
    ]);
    e.mesh(_, "box", o, [
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
  for (const _ of [-1, 1]) {
    const R = e.group(a, [
      _ * l,
      0.12,
      0
    ]);
    v.push(R), e.mesh(R, "cylinder", o, [
      0.076,
      0.27,
      0.078
    ], [
      0,
      -0.12,
      0
    ]), e.mesh(R, "cylinder", "#e5dfcd", [
      0.081,
      0.085,
      0.081
    ], [
      0,
      -0.27,
      0
    ]), e.mesh(R, "cylinder", h, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(R, "sphere", h, [
      0.06,
      0.075,
      0.047
    ], [
      0,
      -0.45,
      0.015
    ]);
    const g = e.group(a, [
      _ * 0.105,
      -0.32,
      0
    ]);
    f.push(g), e.mesh(g, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(g, "cylinder", d, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(g, "sphere", d, [
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
  const w = [
    n,
    s,
    i,
    ...v,
    ...f
  ].map((_) => e.bake(_));
  s.add(i);
  const y = [];
  a.traverse((_) => {
    _ instanceof Ct && _.material === e.material(o) && y.push(_);
  });
  let M = null;
  return {
    body: a,
    hand: e.group(v[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(_) {
      if (_ !== M) {
        M = _;
        for (const R of y) R.material = e.material(vt[_].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(vt[_].head);
      }
    },
    pose(_, R, g, x, b, E) {
      a.position.y = 1.3 + g, a.rotation.set(!b && x ? 0.16 : 0, Math.PI / 2 - _, 0), f.forEach((T, L) => {
        T.rotation.x = (L ? -1 : 1) * R;
      }), v.forEach((T, L) => {
        T.rotation.set(L && E ? -0.55 : (L ? 1 : -1) * R * 0.65, 0, (L ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      w.forEach((_) => _()), a.removeFromParent();
    }
  };
}
function Xi(e, t, r) {
  const a = vt[r], { mesh: n, group: s, shape: i } = e, c = s(t, [
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
  const d = a.silhouette === "robe" || a.silhouette === "coat";
  if (i(c, [
    [-0.23, 0],
    [0.23, 0],
    [0.38, d ? -0.68 : -0.48],
    [0.1, d ? -0.77 : -0.59],
    [-0.36, d ? -0.68 : -0.5]
  ], a.fabric), i(c, [
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
      const u = h * Math.PI * 2 / 5;
      n(l, "cone", a.metal, [
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
    const u = s(l, [
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
        const u = h * Math.PI * 2 / 3;
        n(o, "rock", a.glow, [
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
    cape: c,
    animate(h, u) {
      o.rotation.y = u ? 0.4 : h * 0.014;
    }
  };
}
function Ji(e, t, r, a, n, s) {
  const { mesh: i, group: c, shape: l } = e, o = "#d6b881", d = "#fff0c1", h = (u, v, f) => {
    for (const w of [-1, 1]) i(r, "sphere", d, [
      0.09,
      0.055,
      0.06
    ], [
      w * f,
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
      ]), i(r, "rock", "#8da17f", [
        0.8,
        1,
        0.65
      ], [
        0,
        2.3,
        0.5
      ]), h(2.6, 1.06, 0.28);
      for (let u = 0; u < 7; u++) {
        const v = u * Math.PI * 2 / 7, f = c(t, [
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
        ]), i(f, "rock", s.foliage, [
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
      for (const u of [
        1.35,
        1.8,
        2.25
      ]) i(a, "torus", o, [
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
      for (const u of [-1, 1]) {
        for (let v = 0; v < 5; v++) l(a, [
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
      for (const u of [-1, 1])
        i(t, "cylinder", s.dark, [
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
      ], !0), i(r, "box", "#818883", [
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
      ]), i(r, "sphere", "#d5e9ec", [
        0.45,
        0.58,
        0.4
      ], [
        0,
        3.35,
        0
      ]), h(3.4, 0.39, 0.18);
      for (let u = -2; u <= 2; u++) i(r, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(u) * 0.08,
        0.11
      ], [
        u * 0.18,
        3.94,
        0.02
      ]);
      for (const u of [-1, 1]) l(t, [
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
      i(r, "rock", "#7da9b8", [
        1.05,
        0.7,
        0.85
      ], [
        0,
        1.05,
        1
      ]), h(1.32, 1.65, 0.43);
      for (const u of [-1, 1])
        l(a, [
          [0, 0],
          [u * 1.4, 0.1],
          [u * 0.8, -0.7]
        ], "#b6d6d8", [
          u * 0.7,
          0.7,
          0
        ]), i(r, "cone", "#e4efde", [
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
      ]), i(r, "rock", "#e7dcc4", [
        0.45,
        0.62,
        0.38
      ], [
        0,
        3.6,
        0
      ]), h(3.65, 0.38, 0.16);
      for (let u = 0; u < 5; u++) {
        const v = u * Math.PI * 2 / 5, f = c(a, [
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
        const v = c(a, [
          u * 0.85,
          1.8,
          0.2
        ]);
        v.rotation.z = u * -0.25, l(v, [
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
function el(e, t) {
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
  ], s = e.shape(a, n, Be.block, [
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
  for (const o of [-0.025, 0.09])
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
      o
    ]), e.mesh(a, "rock", Be.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      o + Math.sign(o) * 0.014
    ], !1, 1, !0);
  let c = 0, l = -1;
  return r.visible = !1, { update(o, d, h, u, v) {
    const f = d ? 1 : 0, w = Math.max(0, Math.min(4, u - l));
    c = v || l < 0 || u < l ? f : c + (f - c) * (1 - Math.exp(-w * 0.85)), l = u, r.visible = o === "blade" || d || c > 0.04, r.position.set(-0.4 + c * 0.12, -0.1 + c * 0.3, 0.17 + c * 0.25), r.rotation.set(0.12 - c * 0.22, 0.15 - c * 0.3, -0.16 + c * 0.22), a.scale.setScalar(0.94 + c * 0.07), s.material = e.material(h ? Be.parry : o === "blade" ? Be.block : Be.ward, !1, 1, !0), i.material = e.material(d ? "#617f99" : Be.enamel);
  } };
}
function tl(e, t) {
  const r = e.group(t), a = new qs({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new On(Be.ward) },
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
  }), n = new Ct(e.geometries.sphere, a);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, r.add(n), r.visible = !1, {
    update(s, i) {
      r.visible = !!s && s.ward > 0, !(!s || !r.visible) && (r.position.set(s.x, 0, s.y), a.uniforms.impact.value = i, r.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), r.removeFromParent();
    }
  };
}
function al(e, t) {
  const r = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  r.rotation.set(-0.45, 0, -0.2);
  for (const d of [-1, 1]) {
    const h = e.group(r);
    e.mesh(h, "box", ft.cover, [
      0.25,
      0.055,
      0.44
    ], [
      d * 0.125,
      0,
      0
    ]), e.mesh(h, "box", ft.page, [
      0.22,
      0.06,
      0.38
    ], [
      d * 0.12,
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
  const s = e.mesh(r, "rock", ft.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(r, "torus", ft.crest, [
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
  return { update(d, h, u, v) {
    const f = v || o < 0 || u < o ? 1 : 1 - Math.exp(-Math.min(4, u - o) * 0.5);
    o = u, c += ((d ? 1 : 0) - c) * f, l += ((h ? 0.5 : d ? 0.28 : 0.15) - l) * f, r.position.y = l, r.rotation.x = -0.45 + (l - 0.15) * 0.7, a[0].rotation.z = -0.65 + c * 0.5, a[1].rotation.z = 0.65 - c * 0.5, n.rotation.z = v ? 0.2 : 0.2 + c * (Math.sin(u * 0.18) + 1) * 1.3, s.scale.set(0.07 + c * 0.025, 0.1 + c * 0.06, 0.07 + c * 0.025), i.visible = d, v || (s.rotation.y = u * 0.08);
  } };
}
function nl() {
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
      const d = !l && c - r <= 2 / K.hz, h = n > 0;
      n += ((d ? 1 : 0) - n) * (1 - Math.exp(-o * (d ? 14 : 18))), !d && n < 1e-3 ? (n = 0, a = 0) : h && (a = (a + o * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = i ? {
        x: i.x,
        y: i.y
      } : null, t = c;
      const u = Math.sin(a);
      return {
        stride: u * 0.45 * n,
        lift: u * u * 0.035 * n,
        amount: n
      };
    }
  };
}
function ws(e, t, r = 1) {
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
function xs(e, t, r) {
  const a = e.group(t), n = Ki(e, a, r), s = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), c = e.group(s), l = n.hand, o = e.group(c), d = el(e, c), h = nl();
  let u = null, v = -1, f = Math.PI / 2, w = null, y = null, M = null;
  function _(R, g) {
    if (!(R === y && g === M)) {
      if (y = R, M = g, o.clear(), l.clear(), u = null, w = Xi(e, o, M), n.dress(M), y === "blade")
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
      else if (y === "bow") ws(e, l);
      else if (y === "staff")
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
      else if (y === "daggers") for (const x of [-1, 1]) {
        const b = e.group(l, [
          x < 0 ? -0.58 : 0,
          0,
          0
        ]);
        e.mesh(b, "box", "#974953", [
          0.07,
          0.2,
          0.07
        ]), e.shape(b, [
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
      else if (y === "grimoire") u = al(e, l);
      else if (y === "cannon") {
        const x = e.group(l, [
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
    update(R, g, x, b, E, T, L, N = !1) {
      _(g, x), d.update(g, !!R?.shield, !!R?.guard, b, T);
      const z = T || v < 0 || b < v ? 1 : 1 - Math.exp(-Math.min(4, b - v) * 0.65);
      v = b;
      const P = L ? Math.PI / 2 + 0.23 : R?.facing ?? Math.PI / 2;
      f += Math.atan2(Math.sin(P - f), Math.cos(P - f)) * z;
      const U = h.update(L ? null : R, E, T), H = !!R?.dashTime;
      a.position.set(R?.x ?? 0, L ? 0.3 : 0, R?.y ?? -8), a.scale.setScalar(L ? 1.65 : 1), n.pose(f, U.stride, U.lift, H, T, !!R?.swing || N), w.cape.rotation.x = T ? -0.15 : -0.21 - U.amount * 0.44 - Math.sin(b * 0.15) * 0.12, w.animate(b, T);
      const F = R?.swing && !T ? Math.sin(R.swing / (g === "cannon" ? 16 : 9) * Math.PI) : 0;
      l.rotation.z += ((N ? -0.3 : -0.2 - F * 1.3) - l.rotation.z) * z, l.rotation.x += ((N ? -0.25 : 0.1 + F * 0.6) - l.rotation.x) * z, u && u.update(!!R?.resonance, N, b, T), i.scale.set(0.6 + (H ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function Kn(e, t, r, a) {
  const { mesh: n, group: s } = e, i = s(t), c = s(i), l = s(c), o = s(c), d = [], h = _e(r), u = he[r].radius;
  let v = null;
  e.ring(i, "#1d3540", u * 1.15, 0, 0, 0.16, !0);
  const f = "#cfad70", w = "#fff0b0", y = a.dark;
  function M(z, P, U) {
    const H = s(c, [
      z,
      U,
      P
    ]);
    n(H, "box", y, [
      0.32,
      U,
      0.42
    ], [
      0,
      -U / 2,
      0
    ]), n(H, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -U + 0.11,
      0.1
    ]), d.push(H);
  }
  function _(z, P, U = "#d9e8df") {
    n(z, "box", f, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(z, "box", y, [
      0.11,
      0.4,
      0.11
    ]), n(z, "box", U, [
      0.2,
      P,
      0.13
    ], [
      0,
      P / 2 + 0.35,
      0
    ], !1, 1, !0), n(z, "cone", U, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      P + 0.5,
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
    ]), n(o, "rock", y, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const z of [-0.27, 0.27]) {
      const P = n(o, "cone", f, [
        0.15,
        0.7,
        0.15
      ], [
        z,
        1.15,
        0.9
      ]);
      P.rotation.x = 0.55, n(o, "sphere", w, [
        0.05,
        0.04,
        0.06
      ], [
        z,
        0.82,
        1.02
      ], !0), M(z, -0.42, 0.45), M(z, 0.45, 0.45);
    }
    for (let z = 0; z < 3; z++) n(c, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + z * 0.4
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
    ]), n(o, "sphere", y, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const z = n(o, "crescent", f, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    z.rotation.z = 0.87;
    for (const P of [-0.23, 0.23]) n(o, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      P,
      4.08,
      0.45
    ], !0);
    for (const P of [-1, 1]) {
      const U = s(c, [
        P * 0.8,
        3.3,
        0
      ]);
      U.rotation.z = P * 0.65, n(U, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(U, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), d.push(U);
    }
    for (let P = 0; P < 5; P++) {
      const U = P / 5 * Math.PI * 2, H = n(l, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(U) * 1.95,
        3.3 + Math.sin(U) * 1.1,
        -0.3
      ]);
      H.rotation.z = U;
    }
  } else if (r === "king") {
    M(-0.5, 0, 0.8), M(0.5, 0, 0.8), n(c, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(c, "box", y, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(c, "rock", f, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const z of [-1, 1]) n(c, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      z * 0.95,
      2.95,
      0
    ]);
    n(o, "sphere", y, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(o, "box", w, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(o, "torus", f, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let z = 0; z < 7; z++) {
      const P = z * Math.PI * 2 / 7;
      n(o, "cone", f, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(P) * 0.78,
        4.85,
        Math.sin(P) * 0.78
      ]);
    }
    l.position.set(1.55, 1.35, 0.2), l.rotation.z = -0.3, _(l, 3.4, "#f6dc9f"), n(c, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (r === "warden" || r === "keeper") {
    r === "keeper" && c.scale.setScalar(0.72), M(-0.65, 0.05, 0.85), M(0.65, 0.05, 0.85), n(c, "cylinder", y, [
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
    for (const P of [-1, 1])
      n(c, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        P * 1.03,
        2.7,
        0
      ]), n(c, "box", f, [
        0.7,
        0.1,
        0.8
      ], [
        P * 1.08,
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
    ]), n(o, "box", y, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(o, "box", w, [
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
    const z = s(c, [
      -1.32,
      1.5,
      0.6
    ]);
    v = z, n(z, "box", y, [
      1.2,
      1.8,
      0.25
    ]), n(z, "box", f, [
      1,
      1.58,
      0.28
    ]), n(z, "box", a.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(z, "rock", a.light, [
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
    ]), n(l, "box", y, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(l, "box", f, [
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
  } else if (_e(r)) Ji(e, c, o, l, r, a);
  else if (r === "wisp")
    n(c, "rock", a.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(o, "torus", f, [
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
    for (const z of [-1, 1])
      M(z * 0.27, -0.25, 0.35), n(o, "cone", f, [
        0.09,
        0.35,
        0.09
      ], [
        z * 0.21,
        1.09,
        0.42
      ]), n(o, "sphere", w, [
        0.05,
        0.04,
        0.035
      ], [
        z * 0.15,
        0.8,
        0.77
      ], !0), n(l, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        z * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (r === "bomber")
    M(-0.22, 0, 0.45), M(0.22, 0, 0.45), n(c, "sphere", "#85654c", [
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
    const z = r === "priest", P = r === "guard";
    if (z ? n(c, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (M(-0.22, 0, 0.5), M(0.22, 0, 0.5), n(c, "box", y, [
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
    ]), n(o, "box", y, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(o, "box", w, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), z)
      n(o, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), l.position.set(0.52, 1, 0.1), n(l, "cylinder", f, [
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
      for (const U of [-1, 1]) n(c, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        U * 0.45,
        1.22,
        0
      ]);
      l.position.set(0.54, 1, 0.2), r === "archer" ? ws(e, l, 1.3) : (l.rotation.z = -0.3, _(l, 0.75)), P && (n(c, "box", f, [
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
  const R = s(i, [
    0,
    h ? 5.5 : r === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(R, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const g = n(R, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), x = [];
  c.traverse((z) => {
    z instanceof Ct && x.push({
      mesh: z,
      material: z.material
    });
  });
  let b = 0, E = -100, T = 0, L = 0;
  const N = l.rotation.z;
  return {
    root: i,
    bar: R,
    update(z, P, U, H = !1) {
      const F = Math.abs(z.x - T) + Math.abs(z.y - L) > 5e-3;
      T = z.x, L = z.y, b && !z.windup && (E = P), b = z.windup;
      const Z = z.windup ? 1 - z.windup / he[z.kind].windup : 0, V = Math.max(0, 1 - (P - E) / 10);
      i.position.set(z.x, 0, z.y), c.rotation.y = Math.PI / 2 - z.angle, c.position.y = U ? 0 : r === "weaver" || r === "priest" ? 0.13 + Math.sin(P * 0.055) * 0.1 : F ? Math.abs(Math.sin(P * 0.3)) * 0.055 : 0, c.rotation.x = U ? 0 : -Z * 0.16 + V * 0.2, o.rotation.z = !U && r === "king" ? Math.sin(P * 0.035) * 0.08 : 0, l.rotation.x = U ? 0 : Z * -1.3 + V * 1.4, l.rotation.z = N + (U ? 0 : Z * -0.35), v && H && (v.visible = r !== "warden" || Vr(z.phase), v.rotation.x = z.exposed ? -Math.PI / 3 : 0);
      for (let ae = 0; ae < d.length; ae++) d[ae].rotation.x = !U && F ? Math.sin(P * 0.32 + ae * Math.PI) * 0.28 : 0;
      for (const ae of x) ae.mesh.material = z.marked > 2 && !U ? e.material("#fff6dd") : ae.material;
      R.visible = !h && z.hp < z.maxHp, g.scale.x = z.hp / z.maxHp, g.position.x = (z.hp / z.maxHp - 1) * 0.5;
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
function rl(e, t) {
  const r = /* @__PURE__ */ new Map();
  function a(s, i, c = 1, l = !1) {
    const o = Math.max(0.1, Math.min(1, Math.round(c * 10) / 10)), d = `${s}/${i}/${o}/${l}`;
    let h = r.get(d);
    h || (h = {
      list: [],
      used: 0
    }, r.set(d, h));
    let u = h.list[h.used++];
    return u || (u = e.mesh(t, s, i, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !l, o), h.list.push(u)), u.visible = !0, u.rotation.set(0, 0, 0), u.scale.set(1, 1, 1), u;
  }
  function n(s, i, c, l, o, d = 1, h = 0.09) {
    const u = a(s, i, d);
    return u.position.set(l, h, o), u.scale.set(c, c, 1), u.rotation.x = -Math.PI / 2, u;
  }
  return { update(s, i, c) {
    for (const o of r.values())
      o.used = 0, o.list.forEach((d) => d.visible = !1);
    if (c) {
      const { left: o, right: d, top: h, bottom: u } = c;
      for (const v of [o, d]) {
        const f = a("box", re.warning, 0.5);
        f.position.set(v, 0.14, (h + u) / 2), f.scale.set(0.1, 0.15, u - h);
      }
      for (const v of [h, u]) {
        const f = a("box", re.warning, 0.5);
        f.position.set((o + d) / 2, 0.14, v), f.scale.set(d - o, 0.15, 0.1);
      }
    }
    if (!s) return;
    const l = s.player;
    if (n("ring", "#f2f6e2", 0.64, l.x, l.y, 0.8), l.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const d = a("cone", re.gold, 0.7 - o * 0.15);
      d.position.set(l.x - Math.cos(l.dashAngle) * o * 0.43, 0.45, l.y - Math.sin(l.dashAngle) * o * 0.43), d.scale.set(0.13, l.dashTime / 8 * 1.7, 0.13), d.rotation.set(0, -l.dashAngle, -Math.PI / 2);
    }
    if (!s.boss && (s.encounter === "siege" || s.encounter === "ritual")) {
      const o = s.objective;
      s.encounter === "ritual" && (n("disc", re.magic, 2.5, o.x, o.y, 0.12), n("ring", re.magic, 2.5, o.x, o.y), n("ring", re.gold, 2.2, o.x, o.y, 0.8));
      const d = a("cylinder", "#526b79");
      d.position.set(o.x, 0.3, o.y), d.scale.set(0.5, 0.6, 0.5);
      const h = a("rock", s.encounter === "siege" ? re.fire : re.magic);
      if (h.position.set(o.x, 1, o.y), h.scale.set(0.23, 0.5, 0.23), s.encounter === "siege") {
        h.position.y = 1.35, h.scale.set(0.4, 0.85, 0.4);
        const u = a("cone", re.gold, 0.8);
        u.position.set(o.x, 1.4, o.y), u.scale.set(0.2, 0.85, 0.2), n("ring", re.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (h.rotation.y = s.tick * 0.025);
    }
    for (const o of s.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", re.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const d = a("cylinder", "#687c81");
          d.position.set(o.x, 0.25, o.y), d.scale.set(0.4, 0.5, 0.4);
          const h = a("box", "#bd9a68");
          h.position.set(o.x, 0.65, o.y), h.scale.set(0.9, 0.2, 0.25), h.rotation.y = -o.angle;
          const u = a("sphere", re.magic);
          u.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), u.scale.setScalar(0.11);
        } else {
          const d = o.kind === "familiar" && l.resonance > 0, h = d ? 1.5 : 1, u = o.kind === "shade" ? "#a6acd8" : d ? ft.empowered : ft.familiar, v = i ? 0 : Math.sin(s.tick * 0.1 + o.id) * 0.08, f = a("sphere", u, 1, !0);
          f.position.set(o.x, 0.55 * h + v, o.y), f.scale.set(0.3 * h, 0.36 * h, 0.3 * h);
          for (const y of [-1, 1]) {
            const M = a("cone", u, 1, !0);
            M.position.set(o.x + y * 0.2 * h, 0.93 * h + v, o.y), M.scale.set(0.08 * h, 0.22 * h, 0.08 * h);
          }
          const w = a("sphere", "#35475b");
          if (w.position.set(o.x + Math.cos(o.angle) * 0.28 * h, 0.63 * h + v, o.y + Math.sin(o.angle) * 0.28 * h), w.scale.setScalar(0.07 * h), d) {
            const y = a("torus", ft.crest, 1, !0);
            y.position.set(o.x, 1.45 + v, o.y), y.rotation.x = Math.PI / 2, y.scale.setScalar(0.32);
            for (let M = 0; M < 3; M++) {
              const _ = M * Math.PI * 2 / 3, R = a("rock", ft.crest, 1, !0);
              R.position.set(o.x + Math.cos(_) * 0.32, 1.55 + v, o.y + Math.sin(_) * 0.32), R.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of s.enemies) {
      if (_e(o.kind) && o.phase > 1) {
        const d = he[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? re.fire : re.magic, d, o.x, o.y, 0.65), !i) for (let h = 0; h < o.phase + 2; h++) {
          const u = s.tick * 0.025 + h * Math.PI * 2 / (o.phase + 2), v = a("rock", o.kind === "king" ? re.fire : re.magic, 0.8);
          v.position.set(o.x + Math.cos(u) * d, 0.55 + Math.sin(u * 2) * 0.2, o.y + Math.sin(u) * d), v.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const d = 1 - o.windup / he[o.kind].windup;
        if (n("ring", re.warning, he[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const h = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), u = a("box", re.danger, 0.3);
          u.scale.set(0.75, 0.035, h), u.position.set(o.x + Math.cos(o.angle) * h / 2, 0.09, o.y + Math.sin(o.angle) * h / 2), u.rotation.y = Math.PI / 2 - o.angle, n("ring", re.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const h = Math.hypot(o.target.x - o.x, o.target.y - o.y), u = a("box", re.warning, 0.6);
          u.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), u.scale.set(h, 0.03, 0.09), u.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", re.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", re.danger, he[o.kind].reach, o.target.x, o.target.y, 0.15 + d * 0.2), n("ring", re.danger, he[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", re.frost, he[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", re.gold, he[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let d = 0; d < 3; d++) {
        const h = a("rock", re.fire, 0.8);
        h.position.set(o.x + Math.sin(d * 2) * 0.3, 0.35 + (s.tick + d * 7) % 20 / 18, o.y + Math.cos(d * 2) * 0.3), h.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of s.hazards) {
      const d = o.friendly ? o.kind === "fire" ? re.fire : re.magic : re.danger;
      if (o.kind === "beam") {
        const h = a("box", d, o.wait ? 0.3 : 0.75);
        h.position.set(o.x + Math.cos(o.angle) * o.length / 2, 0.11, o.y + Math.sin(o.angle) * o.length / 2), h.scale.set(o.length, 0.04, o.width * 2), h.rotation.y = -o.angle;
        for (const u of [0, o.length]) n("disc", d, o.width, o.x + Math.cos(o.angle) * u, o.y + Math.sin(o.angle) * u, o.wait ? 0.3 : 0.75);
        continue;
      }
      if (o.kind === "ring") {
        for (let h = 0; h <= 5; h++) {
          const u = n(o.gap ? "openRing" : "ring", d, o.inner + (o.radius - o.inner) * h / 5, o.x, o.y, h === 0 || h === 5 ? 1 : o.wait ? 0.35 : 0.8);
          u.rotation.z = -o.angle;
        }
        continue;
      }
      if (n("disc", d, o.radius, o.x, o.y, o.wait ? 0.2 : 0.4), n("ring", d, o.radius, o.x, o.y), o.wait) {
        n("ring", d, o.radius * (1 - Math.min(1, o.wait / 45)), o.x, o.y, 0.7);
        const h = a("box", d, 0.7);
        h.position.set(o.x, 0.12, o.y), h.scale.set(0.08, 0.02, 0.6);
        const u = a("box", d, 0.7);
        u.position.copy(h.position), u.scale.set(0.6, 0.02, 0.08);
      } else if (!i) {
        n("ring", re.gold, o.radius * (0.7 + Math.sin(s.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let h = 0; h < 6; h++) {
          const u = h * Math.PI / 3, v = a("cone", d, 0.7);
          v.position.set(o.x + Math.cos(u) * o.radius * 0.65, 0.45, o.y + Math.sin(u) * o.radius * 0.65), v.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of s.shots) {
      const d = o.friendly ? re.gold : re.danger, h = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      h.position.set(o.x, 0.6, o.y), h.scale.set(0.11, 0.11, 0.11);
      const u = a("sphere", d, 0.8);
      u.position.copy(h.position), u.scale.set(0.21, 0.18, 0.21);
      const v = a("cone", d, 0.5);
      v.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), v.scale.set(0.14, 0.75, 0.14), v.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of s.effects) {
      const d = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const h = n("arc", re.gold, o.size, o.x, o.y, 0.3 * (1 - d), 0.42);
        h.rotation.z = -o.angle - 0.9 + d * 0.4;
        const u = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - d), 0.43);
        u.rotation.z = h.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", ft.crest, o.size * (i ? 1 : 0.6 + d * (2 - d)), o.x, o.y, 0.8 - d * 0.6, 0.16);
        for (const h of s.companions) {
          if (h.kind !== "familiar" || h.hp <= 0 || h.life <= 0) continue;
          const u = h.x - l.x, v = h.y - l.y, f = a("box", ft.empowered, 1 - d * 0.7);
          f.position.set((l.x + h.x) / 2, 1.1, (l.y + h.y) / 2), f.scale.set(Math.hypot(u, v), 0.045, 0.045), f.rotation.y = -Math.atan2(v, u);
        }
        for (let h = 0; h < 4; h++) {
          const u = h * Math.PI / 2 + (i ? 0 : d), v = a("rock", ft.empowered, 1 - d * 0.4);
          v.position.set(l.x + Math.cos(u) * 0.95, 1.7 + (i ? 0 : d * 0.5), l.y + Math.sin(u) * 0.95), v.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let h = 0; h < 4; h++) {
          const u = a("box", h % 2 ? "#ffffff" : re.magic, 1 - d * 0.6);
          u.scale.set(0.09 + (1 - d) * 0.09, 1.05, 0.08), u.position.set(o.x + (h % 2 ? 0.14 : -0.14), 0.5 + h * 0.85, o.y), u.rotation.z = h % 2 ? -0.35 : 0.35;
        }
        n("ring", re.magic, 0.4 + d, o.x, o.y, 1 - d);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const h = o.kind === "block" || o.kind === "parry", u = o.kind === "ward-break", v = h ? o.kind === "parry" ? Be.parry : Be.block : Be.ward;
        if (h) {
          const f = a("ring", v, 1 - d);
          f.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), f.rotation.y = Math.PI / 2 - o.angle, f.scale.setScalar(0.6 + d * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let f = 0; f < (u ? 6 : 4); f++) {
          const w = f * 2.4 + o.id, y = a(u ? "rock" : "box", v, 1 - d), M = i ? 1.1 : 0.7 + d * (u ? 1.5 : 0.6);
          y.position.set(o.x + Math.cos(w) * M, 0.7 + f % 3 * 0.55, o.y + Math.sin(w) * M), y.scale.set(0.07 * (1 - d), (u ? 0.3 : 0.16) * (1 - d), 0.04), y.rotation.set(w, w, w);
        }
      } else if (o.kind === "heal") n("ring", re.heal, 0.4 + d, o.x, o.y, 1 - d);
      else {
        const h = o.kind === "hit" ? re.danger : re.gold;
        if (n("ring", h, o.size * (0.4 + d), o.x, o.y, 1 - d), !i) for (let u = 0; u < 7; u++) {
          const v = u * 2.4 + o.id, f = a("rock", h, 1 - d * 0.8);
          f.position.set(o.x + Math.cos(v) * d * o.size, 0.4 + Math.sin(d * Math.PI) * 0.8, o.y + Math.sin(v) * d * o.size), f.scale.set(0.1 * (1 - d), 0.28 * (1 - d), 0.1 * (1 - d)), f.rotation.z = v;
        }
      }
    }
  } };
}
function sl(e) {
  const t = document.createElement("div"), r = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", Be.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ne.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(r);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new bt();
  let s = null, i = 0, c = 0, l = null;
  function o(d, h, u, v, f, w, y) {
    n.set(h, u, v).project(f), d.style.left = `${(n.x * 0.5 + 0.5) * w}px`, d.style.top = `${(-n.y * 0.5 + 0.5) * y}px`;
  }
  return {
    update(d, h, u, v) {
      if (d !== s && (s = d, i = 0, l = null, c = 0), t.hidden = !d || d.player.ward <= 0, a.hidden = !d, !d) return;
      const f = d.player;
      t.hidden || (r.style.width = `${f.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(f.ward)), o(t, f.x, 0, f.y, h, u, v));
      const w = d.effects.filter((M) => M.id > i && M.kind in ne.defenseFeedback), y = w.find((M) => M.kind === "parry" || M.kind === "ward-break") ?? w.at(-1);
      y && (l = y.kind, c = d.tick + 27), i = d.serial, d.tick >= c && (l = null), a.hidden = !l && !f.shield, a.dataset.state = l ?? "blocking", a.textContent = l ? ne.defenseFeedback[l] : f.shield ? ne.guardActive : "", o(a, f.x, f.shield ? 3.65 : 3.05, f.y, h, u, v);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function ol(e, t, r, a) {
  const { width: n, depth: s } = a.footprint, i = n >= s, c = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(n, s) / 5));
  e.mesh(t, "box", p.mortar, [
    n,
    0.4,
    s
  ], [
    0,
    0.2,
    0
  ]);
  for (let l = 0; l < c; l++) {
    const o = i ? n / c : n, d = i ? s : s / c, h = e.group(r, [
      i ? -n / 2 + (l + 0.5) * o : 0,
      0,
      i ? 0 : -s / 2 + (l + 0.5) * d
    ]), u = (a.height ?? 4) + (l % 3 - 1) * 0.35, v = a.kind === "workshop";
    e.mesh(h, "box", l % 2 ? p.stone : p.cloth, [
      o - 0.15,
      u - 0.4,
      d - 0.15
    ], [
      0,
      (u + 0.4) / 2,
      0
    ]);
    for (const _ of [-o / 2 + 0.12, o / 2 - 0.12]) e.mesh(h, "box", p.timber, [
      0.18,
      u,
      d
    ], [
      _,
      u / 2,
      0
    ]);
    for (const _ of [0.7, u - 0.3]) e.mesh(h, "box", p.wood, [
      o,
      0.15,
      d
    ], [
      0,
      _,
      0
    ]);
    const f = e.group(h, [
      0,
      u + 0.24,
      0
    ]);
    f.rotation.x = -0.18;
    const w = !i && c > 1 ? d - 0.03 : d + 0.7;
    e.mesh(f, "box", p.roof, [
      o + 0.6,
      0.16,
      w
    ]);
    for (let _ = -o / 2; _ <= o / 2; _ += 0.8) e.mesh(f, "box", p.roofLight, [
      0.055,
      0.07,
      w
    ], [
      _,
      0.12,
      0
    ]);
    e.mesh(f, "box", p.brass, [
      o + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      w / 2
    ]);
    const y = e.group(h, [
      0,
      0,
      d / 2
    ]), M = a.entrance ? 0 : -o * 0.19;
    e.mesh(y, "box", p.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      M,
      1.1,
      0
    ]);
    for (const _ of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(y, "box", p.wood, [
      0.24,
      1.95,
      0.12
    ], [
      M + _,
      1.06,
      0.04
    ]);
    if (e.mesh(y, "box", p.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      o * 0.27,
      2.25,
      0.03
    ]), e.mesh(y, "box", p.ember, [
      0.7,
      0.67,
      0.14
    ], [
      o * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(y, "box", p.timber, [
      0.07,
      0.85,
      0.16
    ], [
      o * 0.27,
      2.25,
      0.15
    ]), e.mesh(y, "box", p.timber, [
      0.85,
      0.07,
      0.16
    ], [
      o * 0.27,
      2.25,
      0.15
    ]), d >= 4 && (i || l === c - 1)) {
      const _ = e.group(y, [
        0,
        2.8,
        0.55
      ]);
      _.rotation.x = 0.22, e.mesh(_, "box", a.tint === "rose" ? p.rose : p.cloth, [
        o * 0.8,
        0.045,
        1.6
      ]), e.mesh(_, "box", p.light, [
        0.55,
        0.015,
        0.45
      ], [
        -o * 0.17,
        0.035,
        0.35
      ]);
    }
    if (v) {
      e.mesh(h, "box", p.wood, [
        o * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        d / 2 - 0.5
      ]);
      for (let _ = 0; _ < 3; _++) e.mesh(h, "cylinder", p.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (_ - 1) * 0.55,
        1.4,
        d / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(h, "box", p.slate, [
        0.6,
        u * 0.38,
        0.7
      ], [
        -o * 0.3,
        u + 0.55,
        -d * 0.2
      ]), e.mesh(h, "box", p.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -o * 0.3,
        u * 1.19 + 0.6,
        -d * 0.2
      ]);
  }
}
function il(e, t, r) {
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
function ll(e, t) {
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
function cl(e, t, r, a) {
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
function ul(e, t, r) {
  const a = new bt(...r.from), n = new bt(...r.to), s = n.clone().sub(a), i = s.length(), c = r.kind === "pipe", l = c ? 0.23 : 0.018, o = e.mesh(t, "cylinder", c ? p.brass : p.timber, [
    l,
    i,
    l
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (o.quaternion.setFromUnitVectors(new bt(0, 1, 0), s.normalize()), c) for (let d = 1; d < i; d += 3.7) {
    const h = a.clone().addScaledVector(s, d);
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
  else for (let d = 2; d < i - 2; d += 1.9) {
    const h = a.clone().addScaledVector(s, d), u = e.group(t, h.toArray());
    u.rotation.y = Math.atan2(s.x, s.z) + Math.PI / 2, e.shape(u, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(d) % 2 ? p.cloth : p.light);
    for (const v of [-1, 1]) e.mesh(u, "box", p.wood, [
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
function dl(e, t, r) {
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
    const o = -a / 2 + (l + 0.5) * a / i, d = -n / 2 + (c + 0.5) * n / s, h = a / i - 0.22, u = n / s - 0.24;
    if (r.kind === "fuel") {
      for (let v = 0; v < 5; v++) e.mesh(t, "box", v % 2 ? p.wood : p.timber, [
        h,
        0.2,
        u / 2 - 0.07
      ], [
        o,
        0.28 + v * 0.24,
        d + v % 2 * 0.12
      ]);
      e.mesh(t, "box", p.cloth, [
        h + 0.08,
        0.055,
        u
      ], [
        o,
        1.42,
        d
      ]);
    } else {
      const v = 0.85 + (c + l) % 3 * 0.22;
      e.mesh(t, "box", p.wood, [
        h,
        v,
        u
      ], [
        o,
        0.16 + v / 2,
        d
      ]);
      for (const f of [-1, 1]) e.mesh(t, "box", p.timber, [
        0.11,
        v + 0.04,
        u + 0.05
      ], [
        o + f * h * 0.32,
        0.16 + v / 2,
        d
      ]);
      e.mesh(t, "box", p.light, [
        0.32,
        0.4,
        0.03
      ], [
        o,
        0.7,
        d + u / 2 + 0.02
      ]), e.mesh(t, "box", p.rose, [
        0.09,
        0.09,
        0.04
      ], [
        o,
        0.61,
        d + u / 2 + 0.045
      ]);
      for (let f = -0.25; f <= 0.25; f += 0.25) e.mesh(t, "box", p.timber, [
        h,
        0.015,
        0.016
      ], [
        o,
        v + 0.17,
        d + f * u
      ]);
      (c + l) % 3 === 0 && (e.mesh(t, "box", p.cloth, [
        h * 0.75,
        0.38,
        u * 0.55
      ], [
        o,
        v + 0.37,
        d - 0.18
      ]), e.mesh(t, "box", p.timber, [
        0.055,
        0.4,
        u * 0.57
      ], [
        o,
        v + 0.37,
        d - 0.18
      ])), e.mesh(t, "box", p.light, [
        0.32,
        0.018,
        0.45
      ], [
        o + h * 0.23,
        v + 0.19,
        d + u * 0.25
      ]);
    }
  }
}
function hl(e, t, r, a) {
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
function kr(e, t, r) {
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
      for (let d = -l / 2 + 0.15; d < l / 2; d += 1.4)
        e.mesh(o, "box", p.timber, [
          0.09,
          2.8,
          0.12
        ], [
          d,
          1.4,
          0
        ]), e.mesh(o, "box", p.cloth, [
          Math.min(1.27, l / 2 - d),
          2.15,
          0.055
        ], [
          d + Math.min(0.68, (l / 2 - d) / 2),
          1.53,
          0
        ]);
      for (const d of [-1, 1]) e.mesh(o, "box", p.timber, [
        0.3,
        0.18,
        0.8
      ], [
        d * (l / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function fl(e, t, r, a) {
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
    for (const d of [-1, 1])
      e.mesh(o, "box", p.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        d * 0.73,
        -0.07,
        0.21
      ]), e.mesh(o, "box", p.brass, [
        0.78,
        0.06,
        0.03
      ], [
        d * 0.73,
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
function pl(e, t) {
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
function Ms(e, t, r, a, n = 2.8) {
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
function _s(e, t, r, a, n, s) {
  const i = r / 2 + 0.45, c = Math.atan2(s, i), l = Math.hypot(i, s);
  for (const o of [-1, 1]) {
    const d = e.group(t, [
      o * i / 2,
      n + s / 2,
      0
    ]);
    d.rotation.z = -o * c, e.mesh(d, "box", p.roof, [
      l + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let h = 0; h < Math.ceil(l / 0.65); h++) e.mesh(d, "box", h % 3 ? p.roof : p.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -l / 2 + h * 0.65,
      0.13,
      0
    ]);
    e.mesh(d, "box", p.shadow, [
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
function Ua(e, t, r, a, n, s = 1.1) {
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
function ml(e, t, r) {
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
  for (const d of [-a / 2 + 0.15, a / 2 - 0.15]) for (const h of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(t, "box", p.timber, [
    0.27,
    i,
    0.27
  ], [
    d,
    i / 2,
    h
  ]);
  for (const d of [0.8, i - 0.25]) e.mesh(t, "box", p.timber, [
    a,
    0.18,
    n
  ], [
    0,
    d,
    0
  ]);
  for (const d of [-a * 0.29, a * 0.29]) Ua(e, t, d, n / 2, 2.3, s ? 1.6 : 1.2);
  const c = e.group(t, [
    a / 2,
    0,
    0
  ]);
  c.rotation.y = Math.PI / 2;
  for (const d of [-n * 0.27, n * 0.27]) Ua(e, c, d, 0.03, 2.3);
  e.mesh(t, "box", p.shadow, [
    1.9,
    2.65,
    0.13
  ], [
    0,
    1.35,
    n / 2
  ]);
  for (const d of [-1, 1]) e.mesh(t, "box", p.wood, [
    0.85,
    2.5,
    0.12
  ], [
    d * 0.46,
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
  ]), _s(e, t, a, n, i, s ? 1.15 : 3.2);
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
    const d = e.group(t, [
      0,
      2.9,
      n / 2 + 1
    ]);
    d.rotation.x = 0.19;
    for (let h = -6; h <= 6; h++) e.mesh(d, "box", h % 3 ? p.cloth : p.light, [
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
    e.mesh(d, "box", p.rose, [
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
    Ua(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", p.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function vl(e, t, r) {
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
  for (let d = 0; d < 3; d++) {
    const h = e.group(t, [
      0,
      a * 0.39,
      0
    ]);
    h.rotation.set(0.4 * Math.sin(d * 2), 0, (d - 1) * 0.65), e.mesh(h, "cylinder", p.timber, [
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
    const h = d * 2.4, u = d === 8 ? 0.1 : n * 0.56, v = e.mesh(t, "crown", d % 3 ? c : l, [
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
function gl(e, t, r) {
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
  for (const i of [s * 0.35, s * 0.7]) Ua(e, t, 0, n / 2 + 0.02, i, 0.7);
  _s(e, t, a + 0.35, n + 0.35, s, s * 0.32), e.mesh(t, "cylinder", p.brass, [
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
function yl(e, t, r, a, n) {
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
      pl(e, c);
      break;
    case "screen":
      kr(e, c, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      kr(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      ol(e, i, c, a);
      break;
    case "stove":
      ll(e, i);
      break;
    case "medicine":
      cl(e, i, s.width, s.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      dl(e, i, a);
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
      ]), ml(e, c, a);
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
      vl(e, c, a);
      break;
    case "tower":
      gl(e, c, a);
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
      for (let d = 0; d < 10; d++) {
        const h = d * Math.PI / 5;
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
      for (const d of [0.85, l - 0.7]) e.mesh(c, "cylinder", p.brass, [
        o * 1.15,
        0.18,
        o * 1.15
      ], [
        0,
        d,
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
        const o = l * Math.PI / 3, d = e.group(c, [
          Math.sin(o) * 2.1,
          4.8,
          Math.cos(o) * 2.1
        ]);
        d.rotation.y = o, e.shape(d, [
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
      hl(e, i, s.width, s.depth);
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
      for (let d = 0; d < 5; d++) {
        const h = d * Math.PI * 0.4, u = s.width * 0.25, v = e.group(c, [
          Math.sin(h) * o * 0.45,
          0,
          Math.cos(h) * o * 0.45
        ]);
        v.rotation.y = h;
        const f = e.mesh(v, "cylinder", d % 2 ? p.root : p.rootLight, [
          o * 0.65,
          l * 0.64,
          o * 0.49
        ], [
          0,
          l * 0.3,
          0
        ]);
        f.rotation.z = 0.13;
        const w = e.group(v, [
          0,
          l * 0.48,
          0
        ]);
        w.rotation.z = 0.4 + d * 0.12, e.mesh(w, "cone", p.root, [
          o * 0.47,
          l * 0.55,
          o * 0.4
        ], [
          0,
          l * 0.25,
          0
        ]);
        const y = e.mesh(v, "cone", p.root, [
          o * 0.5,
          u * 1.4,
          o * 0.4
        ], [
          u * 0.6,
          0.7,
          0
        ]);
        y.rotation.z = -1.15;
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
        for (let d = 0; d < 7; d++) e.mesh(c, "crown", d % 2 ? p.leaf : p.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(d * 2) * o,
          l * 0.55 + d * 0.4,
          Math.cos(d * 2) * o
        ]);
      }
      break;
    }
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
        const d = e.group(c, [
          o * (s.width / 2 - 0.5),
          l - 2.2,
          s.depth / 2 - 0.4
        ]);
        e.mesh(d, "box", p.brass, [
          1.5,
          0.08,
          0.1
        ]), e.shape(d, [
          [-0.6, 0],
          [0.6, 0],
          [0.6, -2.5],
          [0, -2.9],
          [-0.6, -2.5]
        ], p.slate, [
          0,
          -0.05,
          0.06
        ]), e.mesh(d, "box", p.cloth, [
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
        fl(e, i, c, a);
        break;
      }
      const l = a.height, o = Math.min(l, 0.65);
      a.wallUse === "homes" && il(e, c, s), e.mesh(i, "box", p.mortar, [
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
      const d = s.width > s.depth, h = Math.max(s.width, s.depth);
      if (n) {
        for (const u of [1.1, l - 0.55]) e.mesh(c, "box", p.light, [
          s.width + 0.15,
          0.22,
          s.depth + 0.15
        ], [
          0,
          u,
          0
        ]);
        for (let u = -h / 2 + 3; u < h / 2 - 1; u += 6) for (const v of [-1, 1]) {
          const f = e.group(c, [
            d ? u : v * (s.width / 2 + 0.04),
            0,
            d ? v * (s.depth / 2 + 0.04) : u
          ]);
          f.rotation.y = d ? v < 0 ? Math.PI : 0 : v * Math.PI / 2;
          const w = l * 0.61, y = Math.min(2.1, l * 0.3);
          e.mesh(f, "box", p.undercroft, [
            1.5,
            y,
            0.05
          ], [
            0,
            w,
            0
          ]);
          for (const M of [
            -0.55,
            0,
            0.55
          ]) e.mesh(f, "box", p.shadow, [
            0.07,
            y,
            0.06
          ], [
            M,
            w,
            0.06
          ]);
          for (const M of [-1, 1]) e.mesh(f, "box", p.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            w + M * y / 2,
            0.06
          ]);
          e.mesh(f, "box", p.stone, [
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
      for (let u = -h / 2 + 1; u < h / 2; u += 3.5) {
        l > 4 && e.mesh(c, "box", p.stone, d ? [
          1.3,
          0.85,
          s.depth
        ] : [
          s.width,
          0.85,
          1.3
        ], [
          d ? u : 0,
          l + 0.55,
          d ? 0 : u
        ]);
        for (let v = 0; v < Math.floor(l / 0.9); v++) e.mesh(c, "box", p.mortar, d ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          d ? u + v % 2 * 0.7 : s.width / 2 + 0.01,
          0.55 + v * 0.85,
          d ? s.depth / 2 + 0.01 : u + v % 2 * 0.7
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
        const o = Math.sin(l * 7.3) * (s.width / 2 - 0.8), d = Math.cos(l * 3.7) * (s.depth / 2 - 0.3);
        e.mesh(i, "box", p.ripple, [
          0.4 + l % 4 * 0.3,
          0.012,
          0.04
        ], [
          o,
          -0.11,
          d
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
        const d = Math.sin(l * 7 + o * 19), h = s.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", d > 0.3 ? p.leafLight : p.leaf, [
          h,
          0.32 + d * 0.1,
          h * 0.9
        ], [
          l + d * 0.15,
          0.81,
          o
        ]), d > 0.5 && e.mesh(i, "rock", d > 0.8 ? p.light : p.rose, [
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
        const d = Math.sin(l * 13 + o * 7), h = 0.6 + d * 0.2;
        e.mesh(i, "crown", d > 0 ? p.leaf : p.leafLight, [
          0.7,
          h,
          0.7
        ], [
          l,
          h * 0.75,
          o
        ]), d > 0.75 && e.mesh(i, "rock", p.amberLight, [
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
          for (let d = 0; d < 4; d++) {
            const h = e.mesh(i, "box", p.wood, [
              0.09,
              1.25,
              0.09
            ], [
              l * (s.width / 2 - 0.2),
              0.76,
              o
            ]);
            h.rotation.x = d * Math.PI / 4;
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
        for (const d of [-1, 1]) e.mesh(o, "box", p.timber, [
          0.1,
          1.25,
          1.3
        ], [
          d * 0.43,
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
        const o = -s.width * 0.3 + l * s.width * 0.3, d = (a.height ?? 3) * (1 - l * 0.22), h = s.width * 0.11;
        e.mesh(c, "cylinder", p.stone, [
          h,
          d,
          h
        ], [
          o,
          d / 2 + 0.3,
          -s.depth * 0.2
        ]), e.mesh(c, "box", p.light, [
          h * 2.6,
          0.25,
          h * 2.6
        ], [
          o,
          d + 0.3,
          -s.depth * 0.2
        ]);
        for (let u = 0; u < 6; u++) {
          const v = u * Math.PI / 3;
          e.mesh(c, "box", p.mortar, [
            0.055,
            d * 0.8,
            0.055
          ], [
            o + Math.sin(v) * h,
            d / 2 + 0.3,
            -s.depth * 0.2 + Math.cos(v) * h
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
var Sa = 1e-7;
function En(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function Rr(e, t, r, a) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const i = e[s], c = e[(s + 1) % e.length], l = En(t, r, i), o = En(t, r, c), d = a ? l >= -1e-7 : l <= Sa, h = a ? o >= -1e-7 : o <= Sa;
    if (d && n.push(i), d !== h && Math.abs(l - o) > Sa) {
      const u = l / (l - o);
      n.push([i[0] + (c[0] - i[0]) * u, i[1] + (c[1] - i[1]) * u]);
    }
  }
  return n;
}
function ks(e) {
  return Math.abs(e.reduce((t, r, a) => t + r[0] * e[(a + 1) % e.length][1] - r[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function bl(e, t) {
  let r = e;
  const a = [];
  for (let n = 0; n < t.length && r.length >= 3; n++) {
    const s = t[n], i = t[(n + 1) % t.length], c = Rr(r, s, i, !1);
    ks(c) > Sa && a.push(c), r = Rr(r, s, i, !0);
  }
  return a;
}
function wl(e, t, r) {
  const a = t[0] - e[0], n = t[1] - e[1], s = r / (2 * Math.hypot(a, n)), i = -n * s, c = a * s;
  return [
    [e[0] + i, e[1] + c],
    [e[0] - i, e[1] - c],
    [t[0] - i, t[1] - c],
    [t[0] + i, t[1] + c]
  ];
}
function Rs(e, t) {
  const r = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) r.push(wl(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, s] of a.points.slice(1, -1)) r.push(Array.from({ length: 12 }, (i, c) => {
      const l = c * Math.PI / 6, o = (a.width + t) / 2;
      return [n + Math.cos(l) * o, s + Math.sin(l) * o];
    }));
  }
  return r;
}
function xl(e, t = 0) {
  const r = Rs(e, t), a = [];
  for (let n = 0; n < r.length; n++) {
    let s = [r[n]];
    for (let i = 0; i < n && s.length; i++) s = s.flatMap((c) => bl(c, r[i]));
    a.push(...s.filter((i) => ks(i) > Sa));
  }
  return a;
}
function Ml(e, t, r, a) {
  const n = r === "marble", s = r === "street";
  for (const [l, o, d] of [[
    0.4,
    0.025,
    n ? p.brass : s ? p.streetSeam : p.mortar
  ], [
    0,
    0.04,
    n ? p.slate : s ? p.streetStone : p.stone
  ]]) for (const h of xl(t, l)) {
    const u = h.reduce((w, y) => w + y[0], 0) / h.length, v = h.reduce((w, y) => w + y[1], 0) / h.length, f = e.shape(a(u, v), h.map((w) => [w[0], -w[1]]), d, [
      0,
      o,
      0
    ]);
    f.rotation.x = -Math.PI / 2, f.castShadow = !1;
  }
  const i = Rs(t, 0.4);
  let c = 0;
  for (const l of t) {
    for (let o = 1; o < l.points.length; o++, c++) {
      const d = l.points[o - 1], h = l.points[o], u = h[0] - d[0], v = h[1] - d[1], f = Math.hypot(u, v);
      for (let w = 1.5; w < f; w += 1.65) {
        const y = d[0] + u * w / f, M = d[1] + v * w / f;
        if (i.some((R, g) => g !== c && R.every((x, b) => En(x, R[(b + 1) % R.length], [y, M]) >= -1e-7))) continue;
        const _ = e.mesh(a(y, M), "box", n ? p.shadow : s ? p.streetSeam : p.mortar, [
          l.width - 0.08,
          0.012,
          0.025
        ], [
          y,
          0.049,
          M
        ]);
        if (_.rotation.y = Math.atan2(u, v), _.castShadow = !1, s) {
          const R = e.mesh(a(y, M), "box", p.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            y + Math.cos(w) * 0.55,
            0.049,
            M
          ]);
          R.rotation.y = Math.atan2(u, v), R.castShadow = !1;
        }
      }
    }
    c += l.points.length - 2;
  }
}
function _l(e, t) {
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
  ].filter(([d, h, u, v]) => u > d && v > h).map(([d, h, u, v]) => ({
    x: (d + u) / 2,
    z: (h + v) / 2,
    width: u - d,
    depth: v - h
  }));
}
function Sr(e, t, r) {
  const a = r[0] - t[0], n = r[1] - t[1], s = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * s, e.y - t[1] - n * s);
}
function kl(e, t, r) {
  const a = [], n = /* @__PURE__ */ new Map(), s = [], i = new Ys(), c = new bt(), l = new to(), o = [];
  function d(g, x) {
    const b = `${Math.floor(g / 16)}:${Math.floor(x / 16)}`;
    let E = n.get(b);
    return E || (E = e.group(t), n.set(b, E)), E;
  }
  let h = [r.bounds];
  for (const g of r.features.filter((x) => x.kind === "water")) h = h.flatMap((x) => _l(x, g.footprint));
  const u = r.surface === "grass", v = r.surface === "marble", f = r.surface === "street", w = r.surface === "boards", y = w ? p.wood : u ? p.grass : f ? p.street : r.surface === "wet" ? p.wetStone : v ? p.marble : p.stone;
  for (const g of h)
    if (e.mesh(d(g.x, g.z), "box", y, [
      g.width,
      0.6,
      g.depth
    ], [
      g.x,
      -0.32,
      g.z
    ]).castShadow = !1, w) for (let x = g.x - g.width / 2; x < g.x + g.width / 2; x += 1) for (let b = g.z - g.depth / 2; b < g.z + g.depth / 2; b += 4) {
      const E = Math.min(4, g.z + g.depth / 2 - b);
      e.mesh(d(x, b), "box", _r[Math.abs(x + b) % _r.length], [
        0.985,
        0.018,
        E - 0.025
      ], [
        x + 0.5,
        -9e-3,
        b + E / 2
      ]).castShadow = !1;
    }
    else if (!u && !f) for (let x = g.x - g.width / 2; x < g.x + g.width / 2; x += 4) for (let b = g.z - g.depth / 2; b < g.z + g.depth / 2; b += 4) {
      const E = Math.min(4, g.x + g.width / 2 - x), T = Math.min(4, g.z + g.depth / 2 - b), L = v ? Math.round(x / 4 + b / 4) % 2 ? p.marble : p.marbleLight : y;
      e.mesh(d(x, b), "box", L, [
        E - 0.04,
        0.018,
        T - 0.04
      ], [
        x + E / 2,
        -9e-3,
        b + T / 2
      ]).castShadow = !1;
    }
  if (Ml(e, r.roads, r.surface, d), f) for (let g = 0; g < 320; g++) {
    const x = r.bounds.x + Math.sin(g * 127.13) * (r.bounds.width / 2 - 3), b = r.bounds.z + Math.cos(g * 53.71) * (r.bounds.depth / 2 - 3), E = {
      x,
      y: b
    };
    if (r.features.some((N) => _n(E, N.footprint))) continue;
    const T = Math.min(...r.roads.flatMap((N) => N.points.slice(1).map((z, P) => Sr(E, N.points[P], z))));
    if (T < 2 || T > 9) continue;
    const L = e.mesh(d(x, b), "box", g % 3 ? p.streetSeam : p.streetStone, [
      0.4 + g % 3 * 0.18,
      0.025,
      0.25
    ], [
      x,
      -2e-3,
      b
    ]);
    L.rotation.y = g * 0.41, L.castShadow = !1;
  }
  if (v) {
    const g = d(0, -17);
    for (const x of [
      4,
      4.4,
      5.5
    ]) e.ring(g, p.brass, x, 0, -17, 1, !1, 0.09);
    for (let x = 0; x < 12; x++) {
      const b = x * Math.PI / 6;
      e.shape(g, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], p.brass, [
        Math.sin(b) * 4.6,
        0.095,
        -17 + Math.cos(b) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, b);
    }
  }
  for (const g of r.suspended ?? []) {
    const x = e.group(t);
    ul(e, x, g), a.push(e.bake(x)), s.push({
      root: x,
      bounds: new Na().setFromObject(x).expandByScalar(0.1)
    });
  }
  const { bounds: M } = r;
  for (let g = 0; g < (u ? 420 : 0); g++) {
    const x = M.x + Math.sin(g * 127.13) * (M.width / 2 - 3), b = M.z + Math.cos(g * 53.71) * (M.depth / 2 - 3), E = {
      x,
      y: b
    };
    if (r.features.some((L) => _n(E, {
      ...L.footprint,
      width: L.footprint.width + 1.5,
      depth: L.footprint.depth + 1.5
    })) || r.roads.some((L) => L.points.slice(1).some((N, z) => Sr(E, L.points[z], N) < L.width / 2 + 1))) continue;
    const T = d(x, b);
    if (g % 4 === 0) {
      const L = Array.from({ length: 9 }, (z, P) => {
        const U = P * Math.PI * 2 / 9, H = 1 + Math.sin(P * 7 + g) * 0.3;
        return [Math.cos(U) * H * (1.2 + g % 3), Math.sin(U) * H * (0.7 + g % 2)];
      }), N = e.shape(T, L, g % 8 ? p.grassDark : p.grassLight, [
        x,
        5e-3,
        b
      ]);
      N.rotation.x = -Math.PI / 2;
    } else {
      for (let L = 0; L < 3; L++) {
        const N = e.mesh(T, "cone", g % 3 ? p.grassDark : p.leafLight, [
          0.035,
          0.3 + L * 0.09,
          0.035
        ], [
          x + (L - 1) * 0.16,
          0.15,
          b
        ]);
        N.rotation.z = (L - 1) * 0.35;
      }
      g % 11 === 0 && e.mesh(T, "rock", p.light, [
        0.12,
        0.13,
        0.12
      ], [
        x,
        0.38,
        b
      ]);
    }
  }
  for (const g of r.features) {
    const x = g.footprint, b = x.width > x.depth, E = Math.max(x.width, x.depth), T = g.kind === "wall" ? Math.ceil(E / 7) : 1, L = e.group(t);
    L.name = g.id;
    for (let N = 0; N < T; N++) {
      const z = -E / 2 + (N + 0.5) * E / T, P = T === 1 ? x : {
        ...x,
        x: x.x + (b ? z : 0),
        z: x.z + (b ? 0 : z),
        width: b ? E / T : x.width,
        depth: b ? x.depth : E / T
      }, U = T === 1 ? L : e.group(L);
      yl(e, d(P.x, P.z), U, {
        ...g,
        footprint: P
      }, r.vista === "interior") ? (a.push(e.bake(U)), s.push({
        root: U,
        bounds: new Na().setFromObject(U).expandByScalar(0.35)
      })) : U.removeFromParent();
    }
  }
  for (const g of r.roads.slice(0, 1)) for (let x = 1; x < g.points.length; x++) {
    const [b, E] = g.points[x];
    if (!(r.vista === "camp" && Math.hypot(b, E - 8) < 13))
      for (const T of [-1, 1]) Ms(e, d(b, E), b + T * (g.width / 2 + 0.6), E);
  }
  const _ = e.group(t), R = r.vista === "interior" || r.vista === "room";
  if (e.mesh(_, "box", R ? p.undercroft : p.distantGround, [
    300,
    8,
    300
  ], [
    0,
    -4.65,
    0
  ]).castShadow = !1, r.vista === "camp") for (let g = 0; g < 13; g++) {
    const x = -55 - g % 2 * 6, b = -44 + g * 7, E = 7 + g % 3 * 2;
    e.mesh(_, "box", p.distantWall, [
      10,
      E,
      6.5
    ], [
      x,
      E / 2,
      b
    ]);
    const T = e.mesh(_, "box", p.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      x,
      E,
      b
    ]);
    T.rotation.z = -0.16;
    for (let L = -1; L <= 1; L++) e.mesh(_, "box", g % 4 ? p.shadow : p.ember, [
      0.05,
      0.7,
      0.6
    ], [
      x + 5.03,
      E - 1.7,
      b + L * 1.6
    ], g % 4 === 0);
  }
  for (let g = 0; g < (R ? 0 : 12); g++) {
    const x = (g % 2 ? 1 : -1) * (M.width / 2 + 15 + g % 3 * 8), b = M.z - 25 + g * 7;
    e.mesh(_, "crown", g % 3 ? p.distantGround : p.distantLeaf, [
      17 + g % 4 * 3,
      6 + g % 3 * 2,
      22
    ], [
      x,
      -3,
      b
    ]);
  }
  for (let g = 0; g < (R || r.vista === "garden" ? 0 : 9); g++) {
    const x = (g - 4) * 12, b = M.z - M.depth / 2 - 15 - g % 3 * 6, E = 9 + g % 4 * 3;
    e.mesh(_, "box", p.distantWall, [
      9,
      E,
      9
    ], [
      x,
      E / 2 - 2,
      b
    ]), e.mesh(_, "cone", p.distantRoof, [
      7,
      6,
      7
    ], [
      x,
      E + 1,
      b
    ]);
    for (let T = -1; T <= 1; T++) e.mesh(_, "box", p.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      x + T * 2.2,
      E - 4,
      b + 4.55
    ]);
  }
  if (!R && r.vista !== "garden") {
    const g = M.z - M.depth / 2 - 28;
    e.mesh(_, "cylinder", p.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      g
    ]);
    for (const x of [
      10,
      22,
      33
    ]) e.mesh(_, "cylinder", p.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      x,
      g
    ]);
    for (let x = 0; x < 6; x++) {
      const b = x * Math.PI / 3, E = -17 + Math.sin(b) * 8.8, T = g + Math.cos(b) * 8.8;
      e.mesh(_, "box", p.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        E,
        19,
        T
      ]);
      const L = e.mesh(_, "box", p.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(b) * 9.02,
        26,
        g + Math.cos(b) * 9.02
      ], !0);
      L.rotation.y = b;
    }
    e.mesh(_, "cylinder", p.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      g
    ]), e.mesh(_, "cone", p.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      g
    ]);
  }
  a.push(e.bake(_));
  for (const g of n.values()) a.push(e.bake(g));
  return {
    update(g, x) {
      i.direction.copy(c.set(Math.sin(x), pt.height / pt.distance, Math.cos(x)).normalize());
      for (const b of s) {
        o.length = 0;
        for (const E of [0.1, 1.6])
          if (i.origin.set(g.x, E, g.y), l.ray.copy(i), i.intersectsBox(b.bounds) && l.intersectObject(b.root, !0, o), o.length) break;
        b.root.visible = o.length === 0;
      }
    },
    dispose() {
      a.forEach((g) => g()), t.clear();
    }
  };
}
function Rl(e, t, r, a, n, s, i = !0) {
  const c = $a([...s], r), l = e.group(t, [
    a,
    0,
    n
  ]), o = e.group(t), d = r === "sanniang", h = r === "laobai", u = r === "kouzi";
  l.rotation.y = d ? 0.25 : -0.35, i && (u || r === "anian") && (l.position.y = -0.3), l.scale.setScalar(h ? 1.24 : u ? 1.06 : r === "anian" ? 1.19 : 1.12);
  const v = d ? "#343d59" : h ? "#596a80" : u ? "#53617a" : "#79647d", f = "#615047", w = "#dfbaa0", y = h ? 0.39 : u ? 0.25 : 0.29, M = h ? 0.31 : 0.23, _ = [];
  for (const F of [-1, 1]) {
    const Z = e.group(l, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    Z.rotation.x = i && (u || r === "anian") ? -1.15 : F * 0.06, _.push(Z), e.mesh(Z, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(Z, "cylinder", f, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(Z, "sphere", f, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(l, "sphere", v, [
    y,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(l, "cylinder", v, [
    M,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(l, "cylinder", f, [
    M + 0.015,
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
  ]), e.mesh(l, "cylinder", w, [
    0.095,
    0.2,
    0.1
  ], [
    0,
    1.68,
    0
  ]);
  const R = e.group(l, [
    0,
    1.93,
    0.025
  ]);
  R.rotation.x = d ? 0.1 : -0.025, e.mesh(R, "sphere", w, [
    0.215,
    0.285,
    0.22
  ]);
  const g = d ? "#272b42" : u ? "#643d41" : r === "anian" ? "#483b40" : "#30343e";
  e.mesh(R, "sphere", g, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(R, "sphere", g, [
      0.045,
      0.17,
      0.095
    ], [
      F * 0.2,
      0.02,
      -0.03
    ]), e.mesh(R, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      F * 0.083,
      0.025,
      0.216
    ]), e.mesh(R, "box", g, [
      0.069,
      0.018,
      0.016
    ], [
      F * 0.086,
      0.093,
      0.219
    ]), e.mesh(R, "sphere", w, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(R, "sphere", w, [
    0.035,
    0.05,
    0.045
  ], [
    0,
    -0.025,
    0.223
  ]), e.mesh(R, "box", "#b47f70", [
    0.06,
    0.012,
    0.014
  ], [
    0,
    -0.126,
    0.194
  ]);
  for (const F of [-1, 1]) {
    const Z = e.group(l, [
      F * y,
      1.48,
      0
    ]);
    Z.rotation.z = F * 0.11, Z.rotation.x = d ? F > 0 ? -0.85 : -0.2 : F > 0 ? -0.4 : -0.1, e.mesh(Z, "cylinder", v, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(Z, "cylinder", d ? "#e8e1cc" : "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(Z, "cylinder", w, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(Z, "sphere", w, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]), d && F > 0 && (e.mesh(Z, "cylinder", "#b67e3f", [
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
  if (d) {
    e.mesh(l, "cylinder", v, [
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
      const Z = e.mesh(l, "box", "#eee7d3", [
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
    e.mesh(R, "sphere", g, [
      0.19,
      0.17,
      0.13
    ], [
      0.09,
      -0.03,
      -0.22
    ]), e.mesh(R, "cylinder", "#dfba7a", [
      0.014,
      0.38,
      0.014
    ], [
      0.12,
      0.03,
      -0.26
    ]).rotation.z = 1.2, e.mesh(l, "cone", v, [
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
    ], v, [
      0,
      1.43,
      -0.23
    ], 0.018), e.mesh(l, "box", f, [
      0.24,
      0.28,
      0.17
    ], [
      -0.31,
      0.9,
      -0.05
    ]);
  } else if (h) {
    e.mesh(l, "sphere", v, [
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
  } else if (u) {
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
      for (const Z of [-1, 1]) e.mesh(o, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + Z * 0.8,
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
    e.mesh(l, "cone", v, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(R, "sphere", g, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let Z = 0; Z < 3; Z++) {
      const V = e.mesh(l, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + Z * 0.02,
        1.02,
        0.31 + Z * 0.023
      ]);
      V.rotation.z = Z * 0.1;
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
    F.rotation.z = -0.55, e.mesh(l, "box", f, [
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
  R.removeFromParent(), _.forEach((F) => F.removeFromParent());
  const b = _.map((F) => e.bake(F)), E = e.bake(l), T = e.bake(R), L = e.bake(o);
  l.add(R, ..._);
  const N = l.position.y, z = l.rotation.y, P = {
    x: a,
    y: n
  };
  let U = -1 / 0, H = 0;
  return {
    root: l,
    ring: x,
    id: r,
    position: P,
    seated: i,
    locate(F, Z) {
      const V = P.x !== F.position.x || P.y !== F.position.y;
      return V && (U = Z), H = F.facing, P.x = F.position.x, P.y = F.position.y, l.position.x = P.x, l.position.z = P.y, x.position.x = P.x, x.position.z = P.y, V;
    },
    update(F, Z, V) {
      const ae = Z - U < 120, rt = Math.hypot(F.x - P.x, F.y - P.y) < 10;
      x.visible = rt;
      const Xe = ae ? Math.PI / 2 - H : rt ? Math.atan2(F.x - P.x, F.y - P.y) : z, xe = Math.atan2(Math.sin(Xe - l.rotation.y), Math.cos(Xe - l.rotation.y));
      l.rotation.y += V ? xe : xe * 0.16, l.position.y = N + (V ? 0 : Math.sin(Z * 15e-4 + a) * 0.012), R.rotation.y = V ? 0 : Math.sin(Z * 8e-4 + n) * 0.04, i || _.forEach((ce, Ne) => {
        ce.rotation.x = V || !ae ? 0 : Math.sin(Z * 0.012 + Ne * Math.PI) * 0.45;
      });
    },
    dispose() {
      E(), T(), L(), b.forEach((F) => F()), l.removeFromParent(), o.removeFromParent(), x.removeFromParent();
    }
  };
}
function Sl(e, t, r, a) {
  const n = e.group(t), s = Object.values(He).find((h) => h.scene === r.id);
  let i = a, c = !1, l = [];
  const o = Xa(r.id).flatMap((h) => {
    const u = nt[h];
    return u.waves[0].filter((v, f) => !s || v.kind !== s.kind || f !== u.waves[0].findIndex((w) => w.kind === s.kind)).map((v) => {
      const f = Kn(e, n, v.kind, tn[0]);
      f.bar.removeFromParent();
      const w = r.anchors[v.anchor];
      return f.root.position.set(w.x, 0, w.y), {
        ...f,
        id: h,
        dispose: e.bake(f.root)
      };
    });
  }), d = () => {
    let h = !1;
    for (const u of o) {
      const v = !c && !Ba(u.id, i, l);
      u.root.visible !== v && (u.root.visible = v, h = !0);
    }
    return h;
  };
  return d(), {
    setFacts(h) {
      i = h, d();
    },
    setProgress(h) {
      return l = h, d();
    },
    setEncounterActive(h) {
      c = h, d();
    },
    animate(h) {
      return !1;
    },
    dispose() {
      o.forEach((h) => h.dispose()), n.removeFromParent();
    }
  };
}
function Cl(e, t, r, a) {
  const n = He[r], s = Kn(e, t, n.kind, tn[0]);
  s.bar.removeFromParent();
  const i = e.bake(s.root), c = { ...Wa(r, a) };
  s.root.position.set(c.x, 0, c.y);
  let l = a;
  return {
    id: r,
    root: s.root,
    position: c,
    setFacts(o) {
      l = o;
    },
    update(o, d) {
      const h = Wa(r, l), u = o.x - h.x, v = o.y - h.y, f = Math.hypot(u, v), w = f <= n.approachRadius, y = w && !l.has(n.complete) ? 1 : 0, M = h.x + (f ? u / f * y : 0), _ = h.y + (f ? v / f * y : 0), R = c.x + c.y + s.root.rotation.y;
      c.x += d ? M - c.x : (M - c.x) * 0.22, c.y += d ? _ - c.y : (_ - c.y) * 0.22, Math.abs(M - c.x) + Math.abs(_ - c.y) < 0.01 && (c.x = M, c.y = _);
      const g = w ? Math.atan2(u, v) : 0, x = Math.atan2(Math.sin(g - s.root.rotation.y), Math.cos(g - s.root.rotation.y));
      return s.root.rotation.y += d || Math.abs(x) < 5e-3 ? x : x * 0.2, s.root.position.set(c.x, 0, c.y), R !== c.x + c.y + s.root.rotation.y;
    },
    dispose() {
      i(), s.root.removeFromParent();
    }
  };
}
var Ee = (e, t, r, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: r,
  facing: a
}), Ss = {
  camp: [
    {
      id: "mender",
      name: "补衣人",
      activity: "mend",
      coat: "rose",
      phase: 0,
      route: [Ee(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [Ee(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [Ee(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [Ee(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        Ee(-31, 18, 6, -Math.PI / 2),
        Ee(-27, 16, 0),
        Ee(-23, 13, 7, Math.PI),
        Ee(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        Ee(10, 7, 6),
        Ee(5, 10, 0),
        Ee(-8, 13, 0),
        Ee(-18, 14, 8, Math.PI),
        Ee(-8, 13, 0),
        Ee(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [Ee(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: se.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [Ee(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [Ee(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [Ee(8, 2, 0)]
  }]
}, $l = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台"
}, Al = 0.85;
function Cr(e, t) {
  const r = e.route;
  if (r.length === 1) return {
    position: r[0].position,
    facing: r[0].facing,
    walking: !1
  };
  const a = r.map((s, i) => {
    const c = r[(i + 1) % r.length].position;
    return s.wait + Math.hypot(c.x - s.position.x, c.y - s.position.y) / Al;
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
function Pl(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function El(e, t) {
  e.updateWorldMatrix(!0, !0);
  const r = e.matrixWorld.clone().invert(), a = new Or(), n = [];
  e.traverse((c) => {
    if (!(c instanceof Ct)) return;
    const l = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(a.multiplyMatrices(r, c.matrixWorld)), o = c.material.color, d = new ao(new Float32Array(l.getAttribute("position").count * 3), 3);
    for (let h = 0; h < d.count; h++) d.setXYZ(h, o.r, o.g, o.b);
    l.setAttribute("color", d), n.push(l);
  });
  const s = Fr(n);
  if (n.forEach((c) => c.dispose()), !s) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new Ct(s, t);
  return i.receiveShadow = !0, e.add(i), () => {
    s.dispose(), e.clear();
  };
}
function Il(e, t, r, a) {
  const n = e.group(t), s = e.group(n), i = [], c = [], l = {
    blue: p.slate,
    rose: p.rose,
    cream: p.cloth
  }[r.coat], o = r.activity === "mend" || r.activity === "warm", d = "#dfbda7", h = o ? 0.75 : 1.05;
  e.mesh(s, "box", l, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    h,
    0
  ]), e.mesh(s, "crown", d, [
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
  for (const v of [-1, 1]) {
    const f = e.group(n, [
      v * 0.36,
      h + 0.22,
      0
    ]);
    i.push(f), e.mesh(f, "box", l, [
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
    const w = e.group(n, [
      v * 0.16,
      h - 0.31,
      0
    ]);
    c.push(w), e.mesh(w, "box", p.timber, [
      0.2,
      o ? 0.3 : 0.59,
      0.22
    ], [
      0,
      o ? -0.12 : -0.26,
      o ? 0.2 : 0
    ]), e.mesh(w, "box", p.shadow, [
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
  ]), r.activity === "water") for (const v of [-1, 1]) e.mesh(i[v > 0 ? 1 : 0], "box", p.wood, [
    0.36,
    0.39,
    0.36
  ], [
    v * 0.13,
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
  n.traverse((v) => {
    v.castShadow = !1;
  });
  const u = [
    s,
    ...i,
    ...c
  ].map((v) => El(v, a));
  return {
    root: n,
    body: s,
    arms: i,
    legs: c,
    dispose() {
      u.forEach((v) => v()), n.removeFromParent();
    }
  };
}
function zl(e, t, r) {
  const a = new Zr({
    vertexColors: !0,
    roughness: 0.95
  }), n = (Ss[r] ?? []).map((c) => ({
    spec: c,
    model: Il(e, t, c, a),
    time: 0
  }));
  let s = null, i = null;
  return {
    animate(c, l, o, d) {
      const h = o ? 0 : Pl(s, l);
      s = l;
      let u = n.length > 0 && i !== o;
      i = o;
      for (const v of n) {
        const { spec: f, model: w } = v, y = Cr(f, v.time), M = Math.hypot(y.position.x - c.x, y.position.y - c.y) < 27 && d(y.position);
        if (w.root.visible !== M && (w.root.visible = M, u = !0), !M) continue;
        v.time += h;
        const _ = Cr(f, v.time), R = o ? 0 : Math.sin(v.time * (_.walking ? 5.5 : 1.5) + f.phase);
        w.root.position.set(_.position.x, 0, _.position.y), w.root.rotation.y = _.facing, w.body.position.y = _.walking ? Math.abs(R) * 0.035 : 0, w.legs.forEach((g, x) => {
          g.rotation.x = _.walking ? R * 0.35 * (x ? 1 : -1) : 0;
        }), w.arms.forEach((g, x) => {
          g.rotation.x = _.walking ? R * 0.24 * (x ? -1 : 1) : -0.6 + R * 0.13 * (x ? 1 : -1), f.activity === "deliver" && (g.rotation.x = -0.75), f.activity === "warm" && (g.rotation.x = -1.1), f.activity === "cook" && !x && (g.rotation.x = -0.8 + R * 0.3);
        }), u = h > 0 || u;
      }
      return u;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function Ll(e, t, r, a) {
  const n = kl(e, t, r.landscape), s = e.group(t), i = e.group(t), c = Sl(e, t, r, a), l = zl(e, i, r.id), o = r.objects.filter((y) => y.kind === "reward" || y.kind === "rest").map((y) => {
    const M = r.anchors[y.anchor], _ = e.group(t, [
      M.x,
      0,
      M.y
    ]);
    if (y.kind === "reward") {
      e.mesh(_, "box", p.wood, [
        0.85,
        0.45,
        0.6
      ], [
        0,
        0.225,
        -0.65
      ]);
      for (const R of [-1, 1]) e.mesh(_, "box", p.brass, [
        0.055,
        0.48,
        0.63
      ], [
        R * 0.26,
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
      for (const R of [-1, 1]) e.mesh(_, "box", p.timber, [
        0.12,
        0.45,
        0.5
      ], [
        R * 0.5,
        0.22,
        -0.7
      ]);
    }
    return _.visible = !1, {
      id: y.id,
      model: _,
      dispose: e.bake(_)
    };
  }), d = [], h = Ja.filter((y) => He[y].scene === r.id).map((y) => Cl(e, i, y, a));
  let u = -1, v = null, f = null;
  function w(y) {
    const M = [...y].sort().join("/");
    if (M === f) return;
    f = M, h.forEach((R) => R.setFacts(y)), v?.(), c.setFacts(y);
    for (const R of Ka(r, y)) {
      const g = R.position;
      if (R.kind === "exit") {
        if (!R.target.doorway) for (const x of [-1, 1]) Ms(e, s, g.x + x * 1.7, g.y, 1.5);
        e.mesh(s, "box", p.brass, [
          3,
          0.025,
          0.35
        ], [
          g.x,
          0.12,
          g.y
        ]).castShadow = !1;
      } else if (R.target.kind === "inspect" && R.target.passage === "warning")
        e.mesh(s, "box", p.timber, [
          0.12,
          1.8,
          0.12
        ], [
          g.x,
          0.9,
          g.y
        ]), e.mesh(s, "box", p.wood, [
          1.4,
          0.7,
          0.13
        ], [
          g.x,
          1.6,
          g.y
        ]), e.mesh(s, "box", p.light, [
          0.7,
          0.4,
          0.025
        ], [
          g.x,
          1.6,
          g.y + 0.08
        ]);
      else if (R.target.kind === "inspect" && R.target.passage === "orders") {
        e.mesh(s, "box", p.slate, [
          2.2,
          0.8,
          1.2
        ], [
          g.x,
          0.4,
          g.y - 0.8
        ]);
        const x = e.mesh(s, "box", p.light, [
          1.8,
          0.08,
          0.9
        ], [
          g.x,
          0.85,
          g.y - 0.8
        ]);
        x.rotation.x = 0.2;
        for (let b = -1; b <= 1; b++) e.mesh(s, "cylinder", p.brass, [
          0.12,
          0.12,
          0.12
        ], [
          g.x + b * 0.45,
          0.95,
          g.y - 0.55
        ]);
      }
    }
    if (r.id === "camp") {
      const R = r.landscape.features.find((g) => g.kind === "clinic").footprint;
      if (y.has("clinic_helped")) {
        const g = r.landscape.features.find((x) => x.kind === "bench").footprint;
        for (const x of [-1, 1])
          e.mesh(s, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            g.x,
            0.91,
            g.z + x * 0.65
          ]), e.mesh(s, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            g.x,
            1.024,
            g.z + x * 0.65
          ]);
      }
      if (y.has("receiving_arranged")) for (const g of [-1, 1]) {
        const x = R.x + g * 2.4, b = R.z + R.depth / 2 - 0.2, E = e.group(s, [
          x,
          0.2,
          b
        ]);
        E.rotation.x = -0.16;
        for (const T of [-1, 1]) e.mesh(E, "cylinder", p.timber, [
          0.055,
          2.9,
          0.055
        ], [
          T * 0.42,
          1.4,
          0
        ]);
        e.mesh(E, "box", y.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const T of [0.7, 2.1]) e.mesh(E, "box", p.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          T,
          0.12
        ]);
      }
      if (y.has("warden_defeated")) {
        const g = r.landscape.features.find((x) => x.kind === "wagon").footprint;
        for (let x = 0; x < 4; x++) {
          const b = e.group(s, [
            g.x + (x % 2 ? 0.65 : -0.65),
            1.4,
            g.z + (x < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(b, "box", p.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const E of [-1, 1]) e.mesh(b, "box", p.brass, [
            0.08,
            0.78,
            1.22
          ], [
            E * 0.35,
            0.38,
            0
          ]);
          e.mesh(b, "box", p.light, [
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
    for (const R of r.objects) {
      if (R.kind !== "switch") continue;
      const g = r.anchors[R.anchor], x = y.has(R.fact), b = e.group(s, [
        g.x,
        0,
        g.y
      ]);
      e.mesh(b, "box", p.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(b, "box", p.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const E = e.group(b, [
        0,
        0.75,
        0
      ]);
      E.rotation.z = x ? 0.65 : -0.65, e.mesh(E, "cylinder", p.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(E, "cylinder", p.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const _ = xt(r, y);
    for (const R of r.landscape.gates) {
      const g = R.footprint, x = g.width > g.depth, b = Math.max(g.width, g.depth), E = e.group(s, [
        g.x,
        0,
        g.z
      ]);
      x || (E.rotation.y = Math.PI / 2);
      for (const T of [-1, 1]) e.mesh(E, "box", p.stone, [
        0.35,
        3.2,
        0.7
      ], [
        T * b / 2,
        1.6,
        0
      ]);
      if (e.mesh(E, "box", p.light, [
        b + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), _.closedGates.has(R.id)) {
        for (let T = -b / 2 + 0.2; T < b / 2; T += 0.4) e.mesh(E, "box", p.shadow, [
          0.065,
          3,
          0.1
        ], [
          T,
          1.5,
          0
        ]);
        for (const T of [0.4, 2.5]) e.mesh(E, "box", p.brass, [
          b,
          0.12,
          0.15
        ], [
          0,
          T,
          0
        ]);
      } else e.mesh(E, "box", p.shadow, [
        b,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const R of r.landscape.features) {
      if (R.kind !== "beacon" || y.has("alarm_silenced")) continue;
      const g = R.footprint, x = e.mesh(s, "cylinder", p.timber, [
        0.045,
        4.8,
        0.045
      ], [
        g.x + 3.3,
        2.7,
        g.z + 2.5
      ]);
      x.rotation.z = -0.32;
      for (let b = 0; b < 5; b++) e.mesh(s, "rock", b % 2 ? p.ember : p.cloth, [
        0.55,
        1.2 + b % 3 * 0.3,
        0.55
      ], [
        g.x + Math.sin(b * 2) * 0.7,
        5.4 + b % 3 * 0.3,
        g.z + Math.cos(b * 2) * 0.7
      ], !0);
    }
    v = e.bake(s);
  }
  return w(a), {
    setFacts: w,
    people: d,
    parleyPeople: h,
    setProgress(y, M) {
      let _ = c.setProgress(y);
      for (const R of o) {
        const g = M.has(R.id);
        R.model.visible !== g && (R.model.visible = g, _ = !0);
      }
      return _;
    },
    setPeople(y, M) {
      let _ = !1;
      for (const R of at) {
        const g = y[R], x = Ca[R].station, b = we[x.scene].anchors[x.anchor], E = g.mode === "idle" && (g.scene === "cells" || g.scene === x.scene && Math.hypot(g.position.x - b.x, g.position.y - b.y) < 1);
        let T = d.find((L) => L.id === R);
        T && (g.scene !== r.id || T.seated !== E) && (T.dispose(), d.splice(d.indexOf(T), 1), T = void 0, _ = !0), g.scene === r.id && (T || (T = Rl(e, i, R, g.position.x, g.position.y, new Set(f?.split("/")), E), d.push(T), _ = !0), _ = T.locate(g, M) || _);
      }
      return _;
    },
    setEncounterActive(y) {
      c.setEncounterActive(y), h.forEach((M) => {
        M.root.visible = !y;
      });
    },
    update: n.update,
    animate(y, M, _, R) {
      const g = Math.floor(M / 80);
      if (g === u) return !1;
      u = g;
      let x = c.animate(_);
      x = l.animate(y, M, _, R) || x;
      for (const b of h) x = b.update(y, _) || x;
      for (const b of d) Math.hypot(b.position.x - y.x, b.position.y - y.y) < 22 ? (b.update(y, M, _), x = !_ || x) : b.ring.visible = !1;
      return x;
    },
    dispose() {
      o.forEach((y) => {
        y.dispose(), y.model.removeFromParent();
      }), l.dispose(), d.splice(0).forEach((y) => y.dispose()), h.forEach((y) => y.dispose()), i.removeFromParent(), v?.(), c.dispose(), n.dispose();
    }
  };
}
var Tl = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, jl = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Ol = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, Zl = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Ul(e, t) {
  const r = new Ws(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  let i = 0, c = !1;
  function l(o, d) {
    i++;
    const h = r.load(o, (u) => {
      if (c) {
        u.dispose();
        return;
      }
      i--, s.delete(o);
      for (const v of d) a.set(v, u);
      e(), t(s.size, i);
    }, void 0, () => {
      c || (i--, n.delete(h), h.dispose(), s.set(o, d), t(s.size, i));
    });
    h.colorSpace = Zn, h.wrapS = h.wrapT = no, h.anisotropy = 2, n.add(h);
  }
  for (const [o, d] of [
    [Tl, [
      p.stone,
      p.wetStone,
      p.marble,
      p.marbleLight
    ]],
    [jl, [p.light]],
    [Ol, [p.roof, p.roofLight]],
    [Zl, [
      p.grass,
      p.grassLight,
      p.grassDark
    ]]
  ]) l(o, d);
  return {
    maps: a,
    retry() {
      if (!c && i === 0) {
        for (const [o, d] of s) l(o, d);
        t(s.size, i);
      }
    },
    dispose() {
      c = !0, n.forEach((o) => o.dispose()), n.clear(), a.clear(), s.clear();
    }
  };
}
function Nl(e, t, r) {
  const a = new Ur({
    antialias: !0,
    alpha: !1,
    powerPreference: r.world ? "default" : "high-performance"
  });
  a.outputColorSpace = Zn, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, r.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const s = new jr(), i = new Nr(-10, 10, 10, -10, 0.1, 180), c = Pn();
  s.add(new Dr("#effbff", "#74918a", 2));
  const l = new yn("#fff4e5", 1.9);
  l.position.set(-12, 25, 13), l.castShadow = !0;
  const o = r.world ? 1024 : 1536;
  l.shadow.mapSize.set(o, o), Object.assign(l.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), l.shadow.bias = -4e-4, l.shadow.normalBias = 0.035, l.shadow.radius = 3, s.add(l);
  const d = new yn("#c3edff", 1.1);
  d.position.set(7, 8, -15), s.add(d);
  const h = new ka(), u = new ka(), v = new ka();
  s.add(h, u, v);
  const f = xs(c, u, r.traveler.gender), w = rl(c, v), y = tl(c, v), M = sl(n), _ = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Map(), g = [], x = matchMedia("(prefers-reduced-motion: reduce)"), b = new bt(), E = new bt();
  let T = null, L = "", N = "", z = "", P = null, U = null, H = null, F = NaN, Z = NaN, V = NaN, ae = null, rt = 0, Xe = 0, xe = 1, ce = 1, Ne = !0, Mt = !1, Ze = !1, _t = 0, It = -1, Ve = 0, Te = !1;
  const ge = r.world ? Ul(() => {
    L = "", Ne = !0, r.invalidate?.();
  }, (me, De) => r.artworkStatus?.(me, De)) : null;
  function Pe() {
    const me = e.getBoundingClientRect();
    xe = Math.max(1, me.width), ce = Math.max(1, me.height), a.setSize(xe, ce, !1), Ne = !0, Te = !1, r.invalidate?.();
  }
  const st = new ResizeObserver(Pe);
  st.observe(e), Pe();
  function Ea(me) {
    me.preventDefault(), Ze = !0, t();
  }
  a.domElement.addEventListener("webglcontextlost", Ea);
  function ot(me, De, it, lt, ct = !1) {
    if (Math.abs(me) < 1) return;
    const q = document.createElement("span");
    q.className = ct ? "exp-damage is-player" : me < 0 ? "exp-damage is-heal" : "exp-damage", q.textContent = `${me < 0 ? "+" : ""}${Math.ceil(Math.abs(me))}`, n.append(q), g.push({
      element: q,
      position: new bt(De, 2, it),
      born: lt
    });
  }
  function na() {
    for (const me of _.values())
      u.remove(me.actor.root), me.marker.remove();
    _.clear(), g.splice(0).forEach((me) => me.element.remove());
  }
  function pa(me) {
    return Te ? (E.set(me.x, 1, me.y).project(i), Math.abs(E.x) < 1.15 && Math.abs(E.y) < 1.15) : !0;
  }
  return {
    draw(me, De, it, lt = "battle", ct = 0, q) {
      if (Mt || Ze) return;
      const ma = performance.now(), J = lt === "battle" ? me : null, nn = J?.tick ?? (x.matches ? 0 : ct * 0.025), Ft = (J?.tick ?? -1) !== It, va = `${De.weapon}/${De.outfit}/${it}`;
      if (!q && !Ne && lt === N && va === z && J === P && (!Ft && J || !J && (lt === "between" || x.matches || ct - _t < 40))) return;
      _t = ct;
      const ga = tn[it], ya = q ? q.definition.id : `${it}:${J?.boss ?? !1}:${!!J}`;
      if (ya !== L) {
        if (f.resetMotion(), R.forEach((X) => X.remove()), R.clear(), T?.(), q) {
          const X = Pn(ge?.maps);
          U = Ll(X, h, q.definition, q.facts);
          const te = U;
          T = () => {
            te.dispose(), X.dispose();
          };
        } else
          U = null, T = Qi(c, h, it, J);
        Te = !1, L = ya, s.background = new On(ga.sky), s.fog = new Hs(ga.haze, 42, 95);
      } else q && ae !== q.facts && U?.setFacts(q.facts);
      (!!J != !!P || J && P && J.tick < It) && (f.resetMotion(), na(), Ve = J?.player.hp ?? 0);
      const zt = !q && lt !== "battle", ut = xe < 600, ba = ut || ce < 400, ra = xe / ce, Bt = q?.definition.landscape.vista === "room", qt = Bt ? ut ? 20 : Math.max(30, ra * (ce < 400 ? 19 : 25)) : q ? (ut ? pt.mobileWidth : Math.max(pt.minimumWidth, ra * (ce < 400 ? pt.shortSpan : pt.tallSpan))) * (q.definition.safe && !J ? pt.settlementScale : 1) : zt ? ut ? 13 : 28 : ut ? 18.5 : Math.max(27, ra * (ce < 400 ? 14 : 23)), sa = Math.max(0, K.arena - qt / 2 + 0.5), oa = q ? q.location.position.x * (Bt ? 0.4 : 1) : J ? ba ? J.player.x * 0.62 : Math.max(-sa, Math.min(sa, J.player.x * 0.62)) : ut ? 0 : 5.5, wa = q ? Bt ? q.location.position.y * 0.4 - 1 : q.location.position.y - pt.lead : J ? J.player.y * (ba ? 0.62 : 0.2) - 0.4 : ut ? -4.2 : -11.8;
      q && Math.hypot(F - q.location.position.x, Z - q.location.position.y) > 8 && (Te = !1);
      const Wt = Math.abs(b.x - oa) + Math.abs(b.z - wa) < 0.015, rn = q && U?.setPeople(q.people, ct), xa = q && U?.setProgress(q.completedSegments, q.objects), Je = q && U?.animate(q.location.position, ct, x.matches, pa);
      if (q && !Ne && Te && Wt && va === z && J === P && !Ft && F === q.location.position.x && Z === q.location.position.y && V === q.location.facing && ae === q.facts && !Je && !rn && !xa && !f.animating) return;
      !Te || x.matches ? (b.set(oa, 0, wa), Te = !0) : (b.x += (oa - b.x) * 0.14, b.z += (wa - b.z) * 0.14), i.left = -qt / 2, i.right = qt / 2, i.top = qt / ra / 2, i.bottom = -i.top;
      const Ma = zt ? 0 : 1 * Math.PI / 4, Fe = q ? pt.distance : 25;
      if (i.position.set(b.x + Math.sin(Ma) * Fe, q ? pt.height : 28, b.z + Math.cos(Ma) * Fe), i.lookAt(b.x, 0, b.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), q && (U?.setEncounterActive(!!J), U?.update(q.location.position, Ma)), R.forEach((X) => {
        X.hidden = !0;
      }), q && !J) for (const X of q.definition.objects) {
        if (X.kind !== "reward" || !q.objects.has(X.id)) continue;
        const te = `reward/${X.id}`, Se = q.definition.anchors[X.anchor];
        let O = R.get(te);
        O || (O = document.createElement("span"), O.className = "exp-person-name", O.textContent = `◇ ${et.cache}`, n.append(O), R.set(te, O)), E.set(Se.x, 1.4, Se.y).project(i);
        const D = Math.max(65, Math.min(xe - 65, (E.x * 0.5 + 0.5) * xe)), j = Math.max(105, Math.min(ce - 145, (-E.y * 0.5 + 0.5) * ce));
        O.hidden = !1, O.style.transform = `translate(${D}px,${j}px) translate(-50%,-100%)`;
      }
      const sn = new Set(q && !J ? [...Hn(q.definition, q.location.position, q.facts, q.people), ...en(q.definition.id, q.location.position, q.facts)].map((X) => X.target.id) : []);
      for (const X of [...U?.people ?? [], ...U?.parleyPeople ?? []]) {
        if (J || !q || Math.hypot(X.position.x - q.location.position.x, X.position.y - q.location.position.y) > 10) continue;
        let te = R.get(X.id);
        te || (te = document.createElement("span"), te.className = "exp-person-name", te.textContent = Qe(X.id), n.append(te), R.set(X.id, te)), te.textContent = sn.has(X.id) ? `${Qe(X.id)} · ${se.actions.talk}` : Qe(X.id), E.set(X.position.x, 2.9 + X.root.position.y, X.position.y).project(i);
        const Se = (E.x * 0.5 + 0.5) * xe, O = (-E.y * 0.5 + 0.5) * ce;
        te.hidden = Se < 30 || Se > xe - 30 || O < 20 || O > ce - 20, te.style.transform = `translate(${Se}px,${O}px) translate(-50%,-100%)`;
      }
      r.world && (l.position.set(b.x - 12, 25, b.z + 13), l.target.position.set(b.x, 0, b.z), l.target.updateMatrixWorld());
      const on = q ? {
        ...q.location.position,
        facing: q.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      f.update(J?.player ?? on, De.weapon, De.outfit, nn, ct / 1e3, x.matches, zt, !!J?.effects.some((X) => X.kind === "resonance"));
      for (const X of J?.enemies ?? []) {
        let te = _.get(X.id);
        if (!te) {
          const ln = document.createElement("i");
          ln.className = _e(X.kind) ? "exp-threat is-boss" : "exp-threat", n.append(ln), te = {
            actor: Kn(c, u, X.kind, ga),
            hp: X.hp,
            death: null,
            marker: ln
          }, _.set(X.id, te);
        }
        te.hp > X.hp && Ft && ot(te.hp - X.hp, X.x, X.y, J.tick), te.hp = X.hp, te.actor.update(X, J.tick, x.matches, !!q), te.actor.bar.quaternion.copy(i.quaternion), E.set(X.x, 1.2, X.y).project(i);
        const Se = (E.x * 0.5 + 0.5) * xe, O = (-E.y * 0.5 + 0.5) * ce, D = Math.min(18, xe / 2), j = Math.min(ut ? 132 : 95, ce * 0.3), je = Math.max(j, ce - Math.min(130, ce * 0.3)), dt = Math.max(D, Math.min(xe - D, Se)), ht = Math.max(j, Math.min(je, O));
        te.marker.hidden = Math.abs(Se - dt) + Math.abs(O - ht) < 10, te.marker.style.transform = `translate(${dt}px,${ht}px) rotate(${Math.atan2(O - ht, Se - dt) + Math.PI / 2}rad)`;
      }
      for (const [X, te] of _) {
        if (J?.enemies.some((O) => O.id === X)) continue;
        te.death === null && (te.death = J?.tick ?? 0, J && te.hp > 0 && ot(te.hp, te.actor.root.position.x, te.actor.root.position.z, J.tick));
        const Se = ((J?.tick ?? 0) - te.death) / 12;
        te.actor.bar.visible = !1, te.marker.hidden = !0, te.actor.root.scale.setScalar(Math.max(0, 1 - Se)), (Se >= 1 || !J || x.matches) && (u.remove(te.actor.root), te.marker.remove(), _.delete(X));
      }
      J && Ft && (Ve !== J.player.hp && ot(Ve - J.player.hp, J.player.x, J.player.y, J.tick, Ve > J.player.hp), Ve = J.player.hp);
      const Ia = q && (q.engagement ?? ss(q.definition.id, q.facts, q.completedSegments));
      w.update(J, x.matches, Ia ? nt[Ia].bounds : void 0);
      const za = J?.effects.filter((X) => X.kind === "ward-hit").at(-1);
      y.update(J?.player ?? null, za ? Math.max(0, (za.life - 5) / 10) : 0), M.update(J, i, xe, ce);
      for (let X = g.length - 1; X >= 0; X--) {
        const te = g[X], Se = ((J?.tick ?? 0) - te.born) / 27;
        if (Se >= 1 || !J) {
          te.element.remove(), g.splice(X, 1);
          continue;
        }
        E.copy(te.position), E.y += x.matches ? 0 : Se * 0.9, E.project(i), te.element.style.transform = `translate(${(E.x * 0.5 + 0.5) * xe}px,${(-E.y * 0.5 + 0.5) * ce}px)`, te.element.style.opacity = String(Math.min(1, (1 - Se) * 3));
      }
      a.render(s, i), rt++, Xe += performance.now() - ma, q && H !== q.definition.id && (H = q.definition.id, r.sceneReady?.(H)), Ne = !1, N = lt, z = va, P = J, It = J?.tick ?? -1, q && (F = q.location.position.x, Z = q.location.position.y, V = q.location.facing, ae = q.facts);
    },
    invalidate() {
      Ne = !0, r.invalidate?.();
    },
    retryArtwork() {
      ge?.retry();
    },
    stats() {
      return {
        draws: rt,
        submitMs: Xe,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      Mt = !0, st.disconnect(), a.domElement.removeEventListener("webglcontextlost", Ea), na(), f.dispose(), M.dispose(), y.dispose(), T?.(), ge?.dispose(), l.shadow.dispose(), c.dispose(), s.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function In(e) {
  if (e.kind === "exit") return `${se.actions.travel} ${se.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${se.actions.talk} · ${se.people[t.person]}`;
    case "enemy":
      return `${se.actions.talk} · ${Qe(t.enemy)}`;
    case "inspect":
      return se.passages[t.passage].title;
    case "rest":
      return se.actions.rest;
    case "reward":
      return et.cache;
    case "switch":
      return se.switches[t.fact];
  }
}
var Dl = ["aria-label"], Fl = { class: "journey-hud" }, Bl = { class: "journey-heading" }, ql = { class: "journey-threat" }, Wl = {
  key: 0,
  class: "journey-artwork-issue",
  role: "status"
}, Hl = ["disabled"], Vl = {
  key: 1,
  class: "journey-controls"
}, Gl = ["aria-label"], Yl = {
  key: 0,
  class: "journey-interaction"
}, Ql = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Kl = {
  key: 0,
  class: "journey-resource"
}, Xl = [
  "max",
  "value",
  "aria-label"
], Jl = ["disabled"], ec = ["disabled"], tc = {
  key: 2,
  class: "journey-overlay"
}, ac = /* @__PURE__ */ Le({
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
    }), d = Y(() => a.battle ? [] : [
      ...en(a.world.definition.id, a.world.location.position, a.world.facts),
      ...Bn(a.world.definition, a.world.location, a.world.facts).filter((Z) => Z.kind === "exit" || a.world.objects.has(Z.target.id)),
      ...Hn(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ]), h = Y(() => d.value.find((Z) => Z.target.id === l.value) ?? null), u = Y(() => a.weapon === "grimoire" ? ne.contractPower : ne.resource);
    let v = null, f = null, w = 0, y = 0, M = 0, _ = !1, R = !0;
    const g = Yi((Z, V) => {
      c.value = {
        x: Z * 26,
        y: V * 26
      }, f?.stick(Z, V);
    }, () => s.value?.focus({ preventScroll: !0 }));
    function x() {
      g.clear(), f?.clear(), M = 0;
    }
    function b() {
      x(), n("pause");
    }
    function E() {
      v?.retryArtwork();
    }
    function T() {
      document.hidden ? (cancelAnimationFrame(w), w = 0, b()) : (v?.invalidate(), L());
    }
    function L() {
      !w && !_ && R && (y = 0, w = requestAnimationFrame(F));
    }
    function N() {
      !a.paused && h.value && (x(), n("interact", h.value.target.id));
    }
    function z(Z) {
      (!Z || Z.detail === 0) && f?.dash();
    }
    function P(Z) {
      (!Z || Z.detail === 0) && f?.skill();
    }
    function U(Z, V) {
      Z.button === 0 && f?.[V]();
    }
    function H() {
      const Z = d.value.findIndex((V) => V.target.id === l.value);
      l.value = d.value[(Z + 1) % d.value.length]?.target.id ?? null;
    }
    function F(Z) {
      if (w = 0, _ || !R) return;
      !a.paused && !document.hidden && (w = requestAnimationFrame(F));
      const V = y ? Math.min(100, Z - y) : 0;
      if (y = Z, !a.paused && !document.hidden)
        for (M += V; M >= 1e3 / K.hz && !a.paused; ) {
          M -= 1e3 / K.hz;
          const ae = f.frame();
          if (ae.skill && !a.battle) {
            N();
            break;
          }
          n("input", ae);
        }
      else M = 0;
      if (!document.hidden) try {
        v?.draw(a.battle ?? null, a, 0, "battle", Z, a.world);
      } catch (ae) {
        cancelAnimationFrame(w), w = 0, x(), n("error", ae);
      }
    }
    return de(d, (Z) => {
      Z.some((V) => V.target.id === l.value) || (l.value = Z[0]?.target.id ?? null);
    }, { immediate: !0 }), de(() => a.world.definition.id, () => {
      x(), l.value = d.value[0]?.target.id ?? null, s.value?.focus({ preventScroll: !0 });
    }), de(() => a.paused, (Z) => {
      x(), L(), Z || s.value?.focus({ preventScroll: !0 });
    }), de(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.weapon,
      a.outfit
    ], L), aa(() => {
      try {
        v = Nl(i.value, () => {
          b(), n("error", /* @__PURE__ */ new Error("expedition_webgl_context_lost"));
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: L,
          sceneReady: (Z) => n("ready", Z),
          artworkStatus: (Z, V) => {
            o.value = {
              failed: Z,
              pending: V
            };
          }
        });
      } catch (Z) {
        n("error", Z);
        return;
      }
      f = Gi(s.value, b, () => {
      }), document.addEventListener("visibilitychange", T), L(), s.value?.focus({ preventScroll: !0 });
    }), Va(() => {
      R = !1, cancelAnimationFrame(w), w = 0, b();
    }), Tn(() => {
      R = !0, L();
    }), Dt(() => {
      _ = !0, cancelAnimationFrame(w), x(), f?.dispose(), document.removeEventListener("visibilitychange", T), v?.dispose();
    }), t({
      stats: () => v?.stats(),
      focus: () => s.value?.focus({ preventScroll: !0 })
    }), (Z, V) => ($(), A("section", {
      ref_key: "root",
      ref: s,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? m(ne).controls : m(se).actions.controls
    }, [
      k("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      k("div", Fl, [k("header", Bl, [k("h1", null, S(m(se).scenes[e.world.definition.id]), 1), un(Z.$slots, "status", {}, void 0, !0)]), k("div", ql, [un(Z.$slots, "threat", {}, void 0, !0)])]),
      o.value.failed ? ($(), A("div", Wl, [k("span", null, S(m(se).artwork.unavailable), 1), k("button", {
        type: "button",
        disabled: o.value.pending > 0,
        onClick: E
      }, S(o.value.pending ? m(se).artwork.loading : m(se).artwork.retry), 9, Hl)])) : G("", !0),
      e.paused ? G("", !0) : ($(), A("div", Vl, [
        k("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": m(se).actions.move,
          onPointerdown: V[0] || (V[0] = Rt((...ae) => m(g).down && m(g).down(...ae), ["prevent"])),
          onPointermove: V[1] || (V[1] = Rt((...ae) => m(g).move && m(g).move(...ae), ["prevent"])),
          onPointerup: V[2] || (V[2] = (...ae) => m(g).release && m(g).release(...ae)),
          onPointercancel: V[3] || (V[3] = (...ae) => m(g).release && m(g).release(...ae)),
          onLostpointercapture: V[4] || (V[4] = (...ae) => m(g).release && m(g).release(...ae)),
          onContextmenu: V[5] || (V[5] = Rt(() => {
          }, ["prevent"]))
        }, [k("span", { style: da({ transform: `translate(${c.value.x}px, ${c.value.y}px)` }) }, null, 4)], 40, Gl),
        h.value ? ($(), A("div", Yl, [k("button", {
          type: "button",
          class: "journey-act",
          onClick: N
        }, [V[9] || (V[9] = k("kbd", null, "E", -1)), Ce(S(m(In)(h.value)), 1)]), d.value.length > 1 ? ($(), A("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: H
        }, S(m(se).actions.next), 1)) : G("", !0)])) : G("", !0),
        e.battle ? ($(), A("div", Ql, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? ($(), A("div", Kl, [
            k("span", null, S(e.battle.player.resonance > 0 ? m(ne).resonanceActive : u.value), 1),
            k("meter", {
              min: "0",
              max: m(gt).maxPower,
              value: e.battle.player.resource,
              "aria-label": u.value
            }, null, 8, Xl),
            k("small", null, S(e.battle.player.resonance > 0 ? m(ne).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : G("", !0),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: V[6] || (V[6] = Rt((ae) => U(ae, "dash"), ["prevent"])),
            onClick: z
          }, [
            k("kbd", null, S(m(ne).dashKey), 1),
            Ce(S(m(ne).dash), 1),
            k("small", null, S(e.battle.player.dash > 0 ? m(ne).secondsLeft(e.battle.player.dash) : m(ne).ready), 1)
          ], 40, Jl),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: V[7] || (V[7] = Rt((ae) => U(ae, "skill"), ["prevent"])),
            onClick: P
          }, [
            k("kbd", null, S(m(ne).skillKey), 1),
            Ce(S(m(Tt)[e.weapon].action), 1),
            k("small", null, S(e.battle.player.skill > 0 ? m(ne).secondsLeft(e.battle.player.skill) : m(ne).ready), 1)
          ], 40, ec)
        ])) : G("", !0)
      ])),
      e.paused && !e.transitioning ? ($(), A("div", tc, [un(Z.$slots, "overlay", {}, () => [k("button", {
        class: "journey-act",
        type: "button",
        onClick: V[8] || (V[8] = (ae) => n("resume"))
      }, S(m(se).actions.resume), 1)], !0)])) : G("", !0)
    ], 8, Dl));
  }
}), nc = /* @__PURE__ */ Ke(ac, [["__scopeId", "data-v-126be43e"]]);
function rc(e) {
  const t = new Set(e.location.visited.map(Yt)), r = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const s = Yt(n);
    for (const i of Ka(we[n], r)) {
      if (i.kind !== "exit") continue;
      const c = Yt(i.target.to), l = [s, c].sort().join("/");
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
function Cs(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function sc(e, t) {
  const r = Cs(t), a = 3 * r, n = [], s = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let c = s(i), l = -1;
    for (let o = 0; o <= 48; o++) {
      const d = Math.ceil(o / 8) * 5.2 * r, h = o * Math.PI / 4, u = s({
        x: i.x + Math.cos(h) * d,
        y: i.y + Math.sin(h) * d
      }), v = Math.min(1 / 0, ...n.map((f) => Math.hypot(f.x - u.x, f.y - u.y)));
      if (v > l && (c = u, l = v), v >= 5.2 * r) break;
    }
    n.push(c);
  }
  return n;
}
var oc = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, ic = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, lc = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, cc = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, uc = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, dc = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, hc = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, fc = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, pc = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, mc = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, vc = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, gc = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, yc = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, bc = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, wc = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, xc = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, Mc = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, _c = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, kc = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, zn = {
  city: oc,
  cityMobile: ic,
  chapter: lc
}, Rc = {
  blade: cc,
  bow: uc,
  staff: dc,
  daggers: hc,
  grimoire: fc,
  cannon: pc
}, Ln = {
  camp: mc,
  crossroads: vc,
  gate: gc,
  beacon: yc,
  waterway: bc,
  cells: wc,
  hall: xc,
  roots: Mc
}, $r = {
  arrival: _c,
  ending: kc
}, Sc = { class: "ember-map-header" }, Cc = ["src"], $c = ["aria-pressed"], Ac = ["viewBox", "aria-label"], Pc = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Ec = ["transform"], Ic = ["fill"], zc = {
  y: "22",
  "text-anchor": "middle"
}, Lc = ["viewBox", "aria-label"], Tc = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], jc = ["points", "stroke-width"], Oc = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Zc = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Uc = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Nc = [
  "cx",
  "cy",
  "r",
  "fill"
], Dc = ["x", "y"], Fc = {
  key: 2,
  class: "ember-map-key"
}, Bc = {
  key: 3,
  class: "ember-map-places"
}, qc = /* @__PURE__ */ Le({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = W(!1), s = W(null), i = W(!1), c = W(null), l = W({
      width: 400,
      height: 400
    }), o = new ResizeObserver((g) => {
      for (const x of g) {
        const { width: b, height: E } = x.contentRect;
        x.target === s.value ? i.value = b > E * 1.55 : l.value = {
          width: b,
          height: E
        };
      }
    });
    de(c, (g, x) => {
      x && o.unobserve(x), g && o.observe(g);
    }), aa(() => {
      o.observe(s.value);
    }), Dt(() => o.disconnect());
    const d = {
      camp: [52, 89],
      crossroads: [52, 66],
      gate: [25, 44],
      beacon: [25, 22],
      hall: [52, 10],
      cells: [79, 32],
      waterway: [79, 54],
      roots: [16, 70]
    }, h = Y(() => rc(r.campaign)), u = Y(() => Object.fromEntries(h.value.scenes.map((g) => {
      const [x, b] = d[g], { width: E, height: T } = l.value;
      return [g, i.value ? [50 + (104 - b) / 104 * (E - 100), 10 + (x - 10) / 80 * (T - 40)] : [45 + x / 104 * (E - 90), 10 + b / 104 * (T - 40)]];
    }))), v = Y(() => h.value.links), f = Y(() => we[r.campaign.location.scene]), w = Y(() => f.value.landscape.bounds), y = Y(() => Cs(w.value)), M = Y(() => `${w.value.x - w.value.width / 2 - 5 * y.value} ${w.value.z - w.value.depth / 2 - 5 * y.value} ${w.value.width + 10 * y.value} ${w.value.depth + 10 * y.value}`), _ = Y(() => hs(r.campaign)), R = Y(() => {
      const g = sc(_.value.map((x) => x.position), w.value);
      return _.value.map((x, b) => ({
        ...x,
        marker: g[b]
      }));
    });
    return (g, x) => ($(), A("div", {
      ref_key: "root",
      ref: s,
      class: yt(["ember-map", {
        "ember-map-wide": i.value,
        "ember-map-local": !n.value
      }])
    }, [
      k("div", Sc, [
        m(Ln)[f.value.id] ? ($(), A("img", {
          key: 0,
          src: m(Ln)[f.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, Cc)) : G("", !0),
        k("h2", null, S(n.value ? m(B).chapterMap : m(se).scenes[f.value.id]), 1),
        k("div", null, [k("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: x[0] || (x[0] = (b) => n.value = !n.value)
        }, S(n.value ? m(B).localMap : m(B).chapterMap), 9, $c), k("button", {
          type: "button",
          onClick: x[1] || (x[1] = (b) => a("close"))
        }, S(m(B).close), 1)])
      ]),
      n.value ? ($(), A("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${l.value.width} ${l.value.height}`,
        role: "img",
        "aria-label": m(B).chapterMap,
        class: "ember-route-map"
      }, [($(!0), A(ee, null, Re(v.value, (b) => ($(), A("line", {
        key: b.id,
        x1: u.value[b.from][0],
        y1: u.value[b.from][1],
        x2: u.value[b.to][0],
        y2: u.value[b.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(b.from) && e.campaign.location.visited.includes(b.to) ? void 0 : "4 4"
      }, null, 8, Pc))), 128)), ($(!0), A(ee, null, Re(u.value, (b, E) => ($(), A("g", {
        key: E,
        transform: `translate(${b.join(",")})`
      }, [
        k("circle", {
          r: "6",
          fill: E === m(Yt)(f.value.id) ? "#bf6242" : e.campaign.location.visited.includes(E) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Ic),
        k("text", zc, S(e.campaign.location.visited.includes(E) ? m(se).scenes[E] : m(B).unknownArea), 1),
        k("title", null, S(e.campaign.location.visited.includes(E) ? m(se).scenes[E] : m(B).unknownArea), 1)
      ], 8, Ec))), 128))], 8, Ac)) : ($(), A("svg", {
        key: 1,
        viewBox: M.value,
        role: "img",
        "aria-label": m(se).scenes[f.value.id]
      }, [
        k("rect", {
          x: w.value.x - w.value.width / 2,
          y: w.value.z - w.value.depth / 2,
          width: w.value.width,
          height: w.value.depth,
          rx: "2",
          fill: f.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, Tc),
        ($(!0), A(ee, null, Re(f.value.landscape.roads, (b, E) => ($(), A("polyline", {
          key: E,
          points: b.points.map((T) => T.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": b.width,
          "stroke-linejoin": "round"
        }, null, 8, jc))), 128)),
        ($(!0), A(ee, null, Re(f.value.landscape.features, (b) => ($(), A("rect", {
          key: b.id,
          x: b.footprint.x - b.footprint.width / 2,
          y: b.footprint.z - b.footprint.depth / 2,
          width: b.footprint.width,
          height: b.footprint.depth,
          fill: b.kind === "water" ? "#6eb8c6" : b.kind === "tree" || b.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Oc))), 128)),
        k("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * y.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": y.value
        }, [k("title", null, S(m(B).here), 1)], 8, Zc),
        ($(!0), A(ee, null, Re(R.value, (b, E) => ($(), A("g", { key: b.target.id }, [
          k("line", {
            x1: b.position.x,
            y1: b.position.y,
            x2: b.marker.x,
            y2: b.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * y.value
          }, null, 8, Uc),
          k("circle", {
            cx: b.marker.x,
            cy: b.marker.y,
            r: 2.4 * y.value,
            fill: b.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Nc),
          k("text", {
            class: "ember-map-number",
            style: da({ fontSize: `${3.4 * y.value}px` }),
            x: b.marker.x,
            y: b.marker.y + 1.1 * y.value,
            "text-anchor": "middle"
          }, S(E + 1), 13, Dc),
          k("title", null, S(m(In)(b)), 1)
        ]))), 128))
      ], 8, Lc)),
      n.value ? ($(), A("p", Fc, S(m(B).mapKey), 1)) : ($(), A("ol", Bc, [($(!0), A(ee, null, Re(_.value, (b) => ($(), A("li", { key: b.target.id }, S(m(In)(b)), 1))), 128))]))
    ], 2));
  }
}), Wc = /* @__PURE__ */ Ke(qc, [["__scopeId", "data-v-4b7b0a2d"]]), Hc = { class: "exp-wardrobe" }, Vc = { class: "exp-fitting-body" }, Gc = { class: "exp-preview-stage" }, Yc = ["aria-label"], Qc = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Kc = { class: "exp-preview-tools" }, Xc = ["aria-label"], Jc = ["disabled"], eu = { class: "exp-outfit-info" }, tu = { class: "exp-muted" }, au = { class: "exp-fitting-actions" }, nu = {
  key: 0,
  class: "exp-muted"
}, ru = ["disabled"], su = { key: 2 }, ou = { class: "exp-purchase-confirm" }, iu = ["disabled"], lu = ["disabled"], cu = ["aria-label"], uu = ["aria-pressed", "onClick"], du = ["src"], hu = /* @__PURE__ */ Le({
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
    const r = e, a = t, n = W(r.data.equippedOutfit), s = W(!1), i = W(0), c = W(!1), l = W(null), o = W(null), d = W({}), h = Y(() => vt[n.value]), u = Y(() => pn(r.data, n.value)), v = Y(() => so.find((T) => Xt[T].awardKey === h.value.achievement)), f = Y(() => Hr.filter((T) => pn(r.data, T) || vt[T].achievement === null || Object.values(nt).some((L) => L.boss && Xt[L.boss].awardKey === vt[T].achievement)));
    let w = null, y = !0, M = 0, _ = () => {
    };
    de([
      n,
      i,
      () => r.weapon
    ], () => {
      y = !0, _(), s.value = !1;
    });
    function R(T) {
      n.value = T, o.value?.scrollTo({ top: 0 });
    }
    function g() {
      M = performance.now() + 1100, y = !0, _();
    }
    function x() {
      s.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function b() {
      y = !0;
      let T;
      try {
        T = new Ur({
          antialias: !0,
          alpha: !1
        });
      } catch {
        c.value = !0;
        return;
      }
      T.outputColorSpace = Zn, T.toneMapping = 7, T.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const L = new jr(), N = Pn(), z = new ka(), P = xs(N, z, r.traveler.gender);
      L.background = new On("#d1e0e1"), L.add(z, new Dr("#fff6e3", "#627c93", 2.7));
      const U = new yn("#fff6e0", 3);
      U.position.set(-3, 5, 6), L.add(U);
      const H = new Nr(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new Na();
      function Z(ge) {
        P.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, ge, 0, 0, !0, !1), P.root.position.set(0, 0.1, 0), P.root.rotation.y = -0.2, P.root.scale.setScalar(1.35);
      }
      for (const ge of f.value)
        Z(ge), F.union(new Na().setFromObject(z));
      const V = F.getSize(new bt()), ae = F.getCenter(new bt()), rt = V.y * 0.5 + V.z * 0.1 + 0.2, Xe = Math.hypot(V.x, V.z) * 0.5 + 0.2;
      H.position.set(0, ae.y + 0.8, 7), H.lookAt(0, ae.y, 0);
      function xe(ge) {
        const Pe = Math.max(rt, Xe / ge);
        H.left = -Pe * ge, H.right = -H.left, H.top = Pe, H.bottom = -Pe, H.updateProjectionMatrix();
      }
      xe(1), T.setSize(144, 144, !1);
      try {
        for (const ge of f.value)
          Z(ge), T.render(L, H), d.value[ge] = T.domElement.toDataURL("image/png");
      } catch {
        c.value = !0, P.dispose(), N.dispose(), L.clear(), T.dispose(), T.forceContextLoss();
        return;
      }
      l.value.append(T.domElement);
      let ce = 0, Ne = 1, Mt = 1;
      const Ze = new ResizeObserver(() => {
        const ge = l.value.getBoundingClientRect();
        Ne = Math.max(1, ge.width), Mt = Math.max(1, ge.height), T.setSize(Ne, Mt, !1), xe(Ne / Mt), y = !0, _();
      });
      Ze.observe(l.value);
      const _t = matchMedia("(prefers-reduced-motion: reduce)");
      function It(ge) {
        ge.preventDefault(), c.value = !0, cancelAnimationFrame(ce), ce = 0;
      }
      T.domElement.addEventListener("webglcontextlost", It);
      function Ve(ge) {
        if (ce = 0, c.value || document.hidden || !y && (ge > M || _t.matches) && !P.animating) return;
        const Pe = ge < M && !_t.matches, st = ge * 0.03;
        P.update({
          x: Pe ? Math.sin(st * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: Pe ? 8 - st % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, n.value, st, ge / 1e3, _t.matches, !1), P.root.position.set(0, 0.1, 0), P.root.rotation.y = Number(i.value) * Math.PI / 180, P.root.scale.setScalar(1.35);
        try {
          T.render(L, H), y = !1;
        } catch {
          c.value = !0;
        }
        (Pe || P.animating) && !c.value && _();
      }
      _ = () => {
        !ce && !c.value && !document.hidden && (ce = requestAnimationFrame(Ve));
      };
      function Te() {
        document.hidden ? (cancelAnimationFrame(ce), ce = 0) : (y = !0, _());
      }
      document.addEventListener("visibilitychange", Te), _(), w = () => {
        _ = () => {
        }, cancelAnimationFrame(ce), Ze.disconnect(), document.removeEventListener("visibilitychange", Te), T.domElement.removeEventListener("webglcontextlost", It), P.dispose(), N.dispose(), L.clear(), T.dispose(), T.forceContextLoss(), T.domElement.remove();
      };
    }
    function E() {
      w?.(), w = null, c.value = !1, b();
    }
    return aa(b), Dt(() => w?.()), (T, L) => ($(), A("div", Hc, [k("section", {
      ref_key: "fitting",
      ref: o,
      class: "exp-fitting"
    }, [k("div", Vc, [k("div", Gc, [k("div", {
      ref_key: "host",
      ref: l,
      class: "exp-outfit-preview",
      "aria-label": m(ua)[n.value].name
    }, [c.value ? ($(), A("div", Qc, [k("p", null, S(m(ne).presentationError.rendering), 1), k("button", {
      type: "button",
      onClick: E
    }, S(m(B).reload), 1)])) : G("", !0)], 8, Yc), k("div", Kc, [k("label", null, [Ce(S(m(ne).rotate), 1), Ht(k("input", {
      "onUpdate:modelValue": L[0] || (L[0] = (N) => i.value = N),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": m(ne).rotate
    }, null, 8, Xc), [[jn, i.value]])]), k("button", {
      type: "button",
      disabled: c.value,
      onClick: g
    }, S(m(ne).previewAction), 9, Jc)])]), k("div", eu, [
      k("h3", null, S(m(ua)[n.value].name), 1),
      k("p", null, S(m(ua)[n.value].detail), 1),
      k("p", tu, S(m(ne).wardrobeNote), 1)
    ])]), k("div", au, [m(ir)(e.data.active) ? G("", !0) : ($(), A("p", nu, S(m(B).safeWardrobe), 1)), u.value ? ($(), A("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !m(ir)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: L[1] || (L[1] = (N) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, S(e.data.equippedOutfit === n.value ? m(ne).equipped : m(ne).equip), 9, ru)) : v.value ? ($(), A("p", su, S(m(ne).unlockWeapon(m(xn)[v.value])), 1)) : s.value ? ($(), A(ee, { key: 3 }, [k("p", null, S(m(ne).buyOutfit(m(ua)[n.value].name, h.value.price)), 1), k("div", ou, [k("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: x
    }, S(m(ne).confirm), 9, iu), k("button", {
      type: "button",
      onClick: L[2] || (L[2] = (N) => s.value = !1)
    }, S(m(ne).cancel), 1)])], 64)) : ($(), A("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: L[3] || (L[3] = (N) => s.value = !0)
    }, S(e.balance < h.value.price ? m(ne).noCoins : m(ne).purchase) + " · " + S(m(ne).coins(h.value.price)), 9, lu))])], 512), k("div", {
      class: "exp-outfit-rack",
      "aria-label": m(ne).tryOn
    }, [($(!0), A(ee, null, Re(f.value, (N) => ($(), A("button", {
      key: N,
      type: "button",
      "aria-pressed": n.value === N,
      onClick: (z) => R(N)
    }, [
      d.value[N] ? ($(), A("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: d.value[N],
        alt: ""
      }, null, 8, du)) : G("", !0),
      k("strong", null, S(m(ua)[N].name), 1),
      k("small", null, S(e.data.equippedOutfit === N ? m(ne).equipped : m(pn)(e.data, N) ? m(ne).owned : m(vt)[N].price ? m(ne).coins(m(vt)[N].price) : m(ne).achievement), 1)
    ], 8, uu))), 128))], 8, cu)]));
  }
}), fu = hu;
function $s(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
    t.has(r[1]) && ve("narrative_unavailable"), t.set(r[1], r[2].trim());
  return t;
}
function pu(e, t = 1) {
  const r = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (r[n] || n >= fa.bands.length) && ve("narrative_unavailable");
    const s = $s(a[3]);
    r[n] = {
      memory: s.get("memory") ?? "",
      shadow: s.get("shadow") ?? "",
      secret: s.get("secret") ?? null
    };
  }
  return fa.bands.some((a, n) => !r[n]) && ve("narrative_unavailable"), r;
}
function mu(e, t, r) {
  const a = e[Vn(t.affection)];
  return {
    shadow: a.shadow,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: r ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var vu = Object.freeze({
  position: "位置",
  longing: "渴求",
  possession: "占有",
  defense: "防御",
  surrender: "让渡",
  balance: "力量关系"
});
function gu(e) {
  let t;
  const r = [];
  for (const a of e.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
    const n = $s(a[2]), s = (c) => {
      const l = n.get(c);
      return l || ve("narrative_unavailable"), l;
    }, i = Object.fromEntries(Object.entries(vu).map(([c, l]) => [l, s(c)]));
    if (a[1] === "zero")
      t && ve("narrative_unavailable"), t = i;
    else {
      const c = Number(a[1]);
      (r[c] || c >= fa.bands.length) && ve("narrative_unavailable"), r[c] = {
        name: s("name"),
        psychology: i
      };
    }
  }
  return (!t || fa.bands.some((a, n) => !r[n])) && ve("narrative_unavailable"), {
    zero: t,
    bands: r
  };
}
function As(e, t) {
  const r = e.bands[Vn(t)];
  return t === 0 ? {
    name: r.name,
    psychology: e.zero
  } : r;
}
var yu = async (e, t) => {
  const r = await fetch(`/${Bs}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  r.ok || ve("narrative_unavailable");
  const a = await r.text();
  return a.trim() || ve("narrative_unavailable"), a;
};
async function bu(e, t, r = yu) {
  const [a, n, s, i, c] = await Promise.all([
    r("system-prompt", t),
    r("world", t),
    r("player", t),
    r("meta-protocol", t),
    Promise.all(fs.map(async (M) => ({
      id: M,
      document: await r(Oe(M) ? M : He[M].card, t)
    })))
  ]), l = c.map(({ id: M, document: _ }) => {
    const R = [..._.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (R.length !== 1 || !R[0][1].trim()) && ve("narrative_unavailable"), {
      id: M,
      introduction: R[0][1].trim(),
      document: _.replace(R[0][0], "").trim()
    };
  }), o = l.map((M) => M.introduction).join(`
`), d = l.find((M) => M.id === e).document, h = {
    system: a,
    world: n,
    player: s,
    protocol: i,
    npcs: o
  };
  if (!Oe(e)) {
    const M = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(d);
    return (!M || M[1] !== `${e}.initial`) && ve("narrative_unavailable"), {
      ...h,
      character: d.slice(0, M.index).replace(/# 开场\s*$/, "").trim(),
      relationship: null,
      stages: [],
      opening: {
        initial: M[2],
        returned: null
      }
    };
  }
  const [u, v] = await Promise.all(["openings", `${e}-stages`].map((M) => r(M, t))), f = new Map([...u.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((M) => [M[1], M[2].trim()])), w = f.get(`${e}.initial`), y = f.get(`${e}.returned`) ?? null;
  return (!w || (e === "anian" || e === "kouzi") && !y) && ve("narrative_unavailable"), {
    ...h,
    character: d,
    relationship: gu(v),
    stages: pu(v),
    opening: {
      initial: w,
      returned: y
    }
  };
}
function Ps(e) {
  return ro[e];
}
function wu(e, t, r = []) {
  if (!Oe(t)) {
    const i = He[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: ue.attack,
      ...e.facts.includes(i.intel) ? { pass: ue.pass } : {}
    };
  }
  const a = Object.fromEntries(ei(e.facts, t, e.people[t]).map((i) => [i, qn[i].meaning])), n = Ps(t), s = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && s >= fa.bands[4] && r[Vn(s)]?.secret && (a.share_secret = ue.shareSecret), ni(e, t)) {
    a.follow = ue.follow, a.stay = ue.stay;
    for (const i of cs(e, t).filter((c) => c.accessible && c.solo)) a[`go:${i.id}`] = ue.go(i.name);
  }
  return a;
}
var Es = "dialogue", an = `<${Es}>`, Xn = `</${Es}>`, yf = new RegExp(`${an}([\\s\\S]*?)${Xn}`, "i"), bf = new RegExp(an, "i");
function Ar(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${an}
${e.reply}
${Xn}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function xu(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${an}…${Xn} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function Mu(e) {
  return e.map((t) => ({
    id: t,
    event: wn[t]
  }));
}
function _u(e) {
  const t = /* @__PURE__ */ new Set();
  let r;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((c) => !t.has(c)), s = {
      ...a.scene === r ? {} : { place: se.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((c) => t.add(c)), r = a.scene;
    const i = Object.keys(s).length ? `<scene>
${JSON.stringify(s)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: Ar(a)
    }] : a.kind === "player" ? [{
      role: "user",
      content: i + a.player
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: Ar(a)
    }];
  });
}
function ku(e, t) {
  return t ? e.findIndex((r) => r.id === t.throughId) + 1 : 0;
}
var Ru = {
  confined: "你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。",
  released: "牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。",
  returned: "你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。"
};
function Is(e, t) {
  if (!t) return null;
  let r = e;
  return t.map((a) => {
    const n = {
      from: r,
      exit: a.id,
      to: a.to,
      place: se.scenes[a.to],
      position: we[r].anchors[a.anchor]
    };
    return r = a.to, n;
  });
}
function Su(e, t) {
  const r = new Set(e.facts), a = Oe(t) ? e.people[t] : null, n = we[Oe(t) ? e.people[t].scene : He[t].scene], s = Oe(t) ? e.people[t].position : Wa(t, r), i = Hn(n, s, r, e.people), c = en(n.id, s, r).filter((f) => ze(xt(n, r), s, f.position)), l = bn(n.id), o = Oe(t) ? Qr(e.facts, t) : null, d = e.location.scene === n.id ? Bn(n, e.location, r) : [], h = Yr(e), u = Un, v = xt(n, r);
  return {
    place: se.scenes[n.id],
    chapter: {
      phase: h.phase,
      playerObjective: Mn(e),
      optionalRoots: h.optionalRoots
    },
    supplies: {
      phase: h.supplies,
      situation: u.situation[h.supplies],
      collection: {
        scene: u.scene,
        place: se.scenes[u.scene],
        interaction: se.passages[u.object.passage].title,
        position: we[u.scene].anchors[u.object.anchor],
        available: Kt(u.object.condition, r),
        route: Is(e.location.scene, qa(e.location, {
          scene: u.scene,
          anchor: u.object.anchor
        }, r, !1))
      }
    },
    exits: n.exits.map((f) => {
      const w = n.anchors[f.anchor], y = Kt(f.condition, r);
      return {
        id: f.id,
        to: f.to,
        place: se.scenes[f.to],
        position: w,
        open: y,
        selfAccessible: y && ea(v, s, w, K.playerRadius) !== null,
        playerAccessible: y && e.location.scene === n.id && ea(v, e.location.position, w, K.playerRadius) !== null,
        withinReach: d.some((M) => M.target.id === f.id)
      };
    }),
    playerLodging: Gr.guest_room.name,
    ...o ? { rescue: {
      phase: o,
      situation: Ru[o]
    } } : {},
    playerMechanisms: n.objects.flatMap((f) => f.kind === "switch" && Kt(f.condition, r) ? [{
      id: f.id,
      action: se.switches[f.fact],
      position: n.anchors[f.anchor],
      completed: r.has(f.fact),
      withinReach: d.some((w) => w.target.id === f.id)
    }] : []),
    ...l ? { room: {
      use: l.use,
      enclosure: l.enclosure,
      household: l.household.map((f) => f === "player" ? e.traveler.name : f === "anian_parents" || f === "innkeeper" ? se.households[f] : Qe(f)),
      furniture: l.furniture.map((f) => ({
        item: f.label,
        position: {
          x: f.footprint.x,
          y: f.footprint.z
        }
      })),
      exits: n.exits.map((f) => ({
        place: se.scenes[f.to],
        position: n.anchors[f.anchor]
      }))
    } } : {},
    positions: {
      player: e.location.position,
      self: s
    },
    present: [
      e.traveler.name,
      ...at.filter((f) => e.people[f].scene === n.id).map(Qe),
      ...c.map((f) => Qe(f.target.id))
    ],
    residents: (Ss[n.id] ?? []).map((f) => ({
      name: f.name,
      activity: $l[f.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? Ga[a.destination].name : null,
      leader: a.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [...i, ...c].filter((f) => f.target.id !== t).map((f) => Qe(f.target.id))
  };
}
function Cu(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: Aa[e.appearanceAge] } : {}
  };
}
function $u(e, t, r = []) {
  const a = wu(e, t, r), n = Object.keys(a), s = {
    person: Qe(t),
    ...Su(e, t),
    clothing: bs(e, t),
    events: Mu(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (!Oe(t)) {
    const i = He[t];
    return {
      ...s,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...s,
    map: cs(e, t).map((i) => ({
      ...i,
      route: Is(e.people[t].scene, i.route)
    })),
    rescued: $a(e.facts, t),
    affection: e.relationships[t].affection
  };
}
function _a(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function Au(e, t, r, a, n = e.memories[t]) {
  const s = $u(e, t, a.stages), i = ki(t), c = Oe(t) ? Ps(t) : null, l = Oe(t) ? {
    psychology: As(a.relationship, e.relationships[t].affection).psychology,
    ...mu(a.stages, e.relationships[t], !!c && e.facts.includes(c))
  } : null, { actions: o, actionMeanings: d, events: h, ...u } = s, v = {
    actions: d,
    performance: i,
    clothing: Qn
  }, f = {
    memory: n?.text ?? null,
    events: h,
    ...u,
    opening: e.conversations[t].some((w) => w.kind === "dialogue") || !Oe(t) && e.facts.includes(He[t].complete) ? null : s.rescued ? a.opening.returned : a.opening.initial,
    stage: l
  };
  return {
    systemPrompt: [
      a.system.trim(),
      _a("background", a.world.trim()),
      _a("player", `${a.player.trim()}

${JSON.stringify({
        ...Cu(e.traveler),
        outfit: ua[e.outfit].detail,
        equipment: Tt[e.weapon].equipment
      }, null, 2)}`),
      _a("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${_a("meta_protocol", `${a.protocol.trim()}

${_a("operations", JSON.stringify(v, null, 2))}`)}

<story>
${JSON.stringify(f, null, 2)}`
      },
      ..._u(e.conversations[t].length ? e.conversations[t].slice(ku(e.conversations[t], n)) : [vs(e, t)]),
      {
        role: "user",
        content: `${r}
</story>

${xu(s.person)}`
      }
    ]
  };
}
var Pr = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function Pu(e, t, r, a) {
  const n = Au(e, t, r, a), s = Us({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = dn(n.systemPrompt), c = dn(e.memories[t]?.text ?? ""), l = dn(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: s,
    system: i,
    memory: c,
    history: l,
    situation: Math.max(0, s - i - c - l),
    limit: Pr.waitAt,
    trigger: Pr.trigger
  };
}
var Eu = { class: "ember-clothing-list" }, Iu = ["data-clothing-slot"], zu = /* @__PURE__ */ Le({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), A("dl", Eu, [($(!0), A(ee, null, Re(m(Qn), (a, n) => ($(), A(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), A(ee, { key: 0 }, [k("dt", null, S(a), 1), k("dd", {
      "data-clothing-slot": n,
      class: yt({ "is-absent": !e.clothing[n] })
    }, S(e.clothing[n] || m(Pa).absent), 11, Iu)], 64)) : G("", !0)], 64))), 128))]));
  }
}), zs = /* @__PURE__ */ Ke(zu, [["__scopeId", "data-v-2445b8a0"]]), Lu = ["onKeydown"], Tu = ["aria-label", "aria-expanded"], ju = ["aria-label", "aria-expanded"], Ou = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Zu = ["id"], Uu = ["y", "height"], Nu = ["href"], Du = ["href", "clip-path"], Fu = ["aria-label", "aria-expanded"], Bu = ["aria-label"], qu = ["aria-label"], Wu = { class: "ember-meter-total" }, Hu = { key: 0 }, Vu = { class: "ember-meter-total" }, Gu = { class: "ember-meter-breakdown" }, Yu = {
  class: "ember-error-detail",
  role: "status"
}, Qu = ["disabled"], Ku = { key: 3 }, Xu = { role: "status" }, Ju = /* @__PURE__ */ Le({
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
    const t = e, r = Lt(null), a = W(null), n = {
      clothing: Pa.title,
      affection: ue.affection,
      context: ue.context
    }, s = Y(() => bs(t.campaign, t.person)), i = W(null);
    function c() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const l = W(0), o = W("");
    let d = null, h;
    async function u() {
      d?.abort(), d = new AbortController();
      const R = d;
      r.value = null, o.value = "";
      try {
        const g = await bu(t.person, R.signal);
        R.signal.aborted || (r.value = g);
      } catch (g) {
        R.signal.aborted || (o.value = Zt(g));
      }
    }
    de(() => t.person, () => {
      a.value = null, l.value = 0, u();
    }, { immediate: !0 });
    const v = Y(() => Oe(t.person) ? t.campaign.relationships[t.person].affection : 0), f = `ember-affection-${Lr()}`, w = Y(() => 19 * v.value / 100), y = Y(() => r.value?.relationship ? As(r.value.relationship, v.value).name : ""), M = Y(() => r.value ? Pu(t.campaign, t.person, t.draft, r.value) : null);
    de(() => [t.person, v.value], ([R, g], [x, b]) => {
      R === x && g === b || (h && clearTimeout(h), l.value = R === x ? g - b : 0, l.value && (h = setTimeout(() => {
        l.value = 0;
      }, 3500)));
    }), Tr(() => (c(), !0), () => !!a.value), Dt(() => {
      d?.abort(), h && clearTimeout(h);
    });
    const _ = (R) => `${(R / 1e3).toFixed(1)}k`;
    return (R, g) => ($(), A("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: Os(Rt(c, ["stop"]), ["esc"])
    }, [
      k("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": m(Pa).title,
        "aria-expanded": a.value === "clothing",
        onClick: g[0] || (g[0] = (x) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...g[4] || (g[4] = [k("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [k("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Tu),
      m(Oe)(e.person) ? ($(), A("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(ue).affection,
        "aria-expanded": a.value === "affection",
        onClick: g[1] || (g[1] = (x) => a.value = a.value === "affection" ? null : "affection")
      }, [($(), A("svg", Ou, [
        k("defs", null, [k("path", {
          id: `${f}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Zu), k("clipPath", { id: f }, [k("rect", {
          x: "2",
          y: 22 - w.value,
          width: "20",
          height: w.value
        }, null, 8, Uu)])]),
        k("use", {
          href: `#${f}-shape`,
          class: "ember-affection-track"
        }, null, 8, Nu),
        k("use", {
          href: `#${f}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${f})`
        }, null, 8, Du)
      ])), l.value ? ($(), A("small", {
        key: 0,
        class: yt(["ember-affection-change", { "is-down": l.value < 0 }]),
        role: "status"
      }, S(l.value > 0 ? "+" : "") + S(l.value), 3)) : G("", !0)], 8, ju)) : G("", !0),
      k("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(ue).context,
        "aria-expanded": a.value === "context",
        onClick: g[2] || (g[2] = (x) => a.value = a.value === "context" ? null : "context")
      }, [k("span", {
        class: yt(["ember-meter-ring", { "is-warning": M.value && M.value.used >= M.value.trigger }]),
        style: da({ "--meter-fill": `${Math.min(1, (M.value?.used ?? 0) / (M.value?.limit ?? 1)) * 360}deg` })
      }, [...g[5] || (g[5] = [k("span", null, null, -1)])], 6)], 8, Fu),
      a.value ? ($(), A("section", {
        key: 1,
        class: yt(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        k("header", null, [k("strong", null, S(n[a.value]), 1), k("button", {
          type: "button",
          "aria-label": m(ue).close,
          onClick: c
        }, "×", 8, qu)]),
        a.value === "affection" ? ($(), A(ee, { key: 0 }, [k("p", Wu, [Ce(S(v.value) + " ", 1), g[6] || (g[6] = k("small", null, "/ 100", -1))]), o.value ? G("", !0) : ($(), A("p", Hu, S(y.value || m(ue).loading), 1))], 64)) : a.value === "clothing" ? ($(), kt(zs, {
          key: 1,
          clothing: s.value
        }, null, 8, ["clothing"])) : M.value ? ($(), A(ee, { key: 2 }, [
          k("p", Vu, S(_(M.value.used)) + " / " + S(_(M.value.limit)), 1),
          k("dl", Gu, [($(!0), A(ee, null, Re(m(ue).contextParts, (x, b) => ($(), A(ee, { key: b }, [k("dt", null, S(x), 1), k("dd", null, S(_(M.value[b])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? ($(), A(ee, { key: 0 }, [k("p", Yu, S(m(Zt)(e.memoryState)), 1), k("button", {
            type: "button",
            disabled: e.blocked,
            onClick: g[3] || (g[3] = (x) => R.$emit("retry-memory"))
          }, S(m(ue).memoryRetry), 9, Qu)], 64)) : G("", !0)
        ], 64)) : o.value ? G("", !0) : ($(), A("p", Ku, S(m(ue).loading), 1)),
        o.value && a.value !== "clothing" ? ($(), A(ee, { key: 4 }, [k("p", Xu, S(o.value), 1), k("button", {
          type: "button",
          onClick: u
        }, S(m(ue).retry), 1)], 64)) : G("", !0)
      ], 10, Bu)) : G("", !0)
    ], 40, Lu));
  }
}), ed = /* @__PURE__ */ Ke(Ju, [["__scopeId", "data-v-38bbe277"]]), td = ["aria-label"], ad = { class: "ember-weapon-layout" }, nd = { class: "ember-weapon-list" }, rd = ["name", "value"], sd = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, od = ["src"], id = { class: "ember-weapon-skill" }, ld = /* @__PURE__ */ Le({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = Ir(e, "modelValue"), r = Lr();
    return (a, n) => ($(), A("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": m(le).chooseWeapon
    }, [k("div", ad, [k("div", nd, [($(!0), A(ee, null, Re(m(qr), (s) => ($(), A("label", {
      key: s,
      class: yt({ "is-selected": t.value === s })
    }, [
      Ht(k("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: m(r),
        value: s
      }, null, 8, rd), [[zr, t.value]]),
      Ue(Ot, { name: s }, null, 8, ["name"]),
      k("span", null, S(m(Tt)[s].name), 1)
    ], 2))), 128))]), k("div", sd, [
      ($(), A("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: m(Rc)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, od)),
      k("h3", null, S(m(Tt)[t.value].name), 1),
      k("p", null, S(m(Tt)[t.value].detail), 1),
      k("div", id, [k("strong", null, S(m(Tt)[t.value].action), 1), k("p", null, S(m(Tt)[t.value].skill), 1)])
    ])])], 8, td));
  }
}), cd = /* @__PURE__ */ Ke(ld, [["__scopeId", "data-v-0c0d4e2b"]]), ud = ["src"], dd = /* @__PURE__ */ Le({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = W(null), r = W(null), a = new ResizeObserver((n) => {
      const { width: s, height: i } = n[0].contentRect;
      r.value = s <= 700 && i > s;
    });
    return aa(() => a.observe(t.value)), Dt(() => a.disconnect()), (n, s) => ($(), A("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [r.value !== null ? ($(), A("img", {
      key: 0,
      src: r.value ? m(zn).cityMobile : m(zn).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, ud)) : G("", !0)], 512));
  }
}), hd = /* @__PURE__ */ Ke(dd, [["__scopeId", "data-v-f5a6e0d9"]]), fd = ["aria-label"], pd = {
  key: 0,
  class: "entry-title"
}, md = { class: "entry-city" }, vd = ["aria-label"], gd = ["disabled"], yd = ["disabled"], bd = ["disabled"], wd = ["disabled"], xd = {
  key: 0,
  class: "entry-save"
}, Md = ["disabled"], _d = { class: "entry-name" }, kd = { for: "ember-traveler-name" }, Rd = ["maxlength", "placeholder"], Sd = { class: "entry-identity-details" }, Cd = ["value"], $d = { class: "entry-age" }, Ad = { for: "ember-traveler-age" }, Pd = {
  disabled: "",
  value: ""
}, Ed = ["value"], Id = {
  class: "entry-primary",
  type: "submit"
}, zd = {
  key: 1,
  class: "entry-chapters"
}, Ld = ["src"], Td = {
  class: "entry-numeral",
  "aria-hidden": "true"
}, jd = { class: "entry-chapter-body" }, Od = { key: 0 }, Zd = { class: "entry-forthcoming" }, Ud = { class: "entry-traveler" }, Nd = {
  key: 0,
  class: "entry-restart"
}, Dd = ["disabled"], Fd = {
  key: 0,
  "aria-hidden": "true"
}, Bd = /* @__PURE__ */ Le({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: r }) {
    const a = e, n = r, s = W("title"), i = W(!1), c = W(a.campaign?.traveler.name ?? ""), l = W(a.campaign?.traveler.gender ?? null), o = W(a.campaign?.traveler.appearanceAge ?? ""), d = W(a.campaign?.weapon ?? "blade"), h = W(!1), u = W(null), v = W(null), f = Y(() => ({
      title: B.title,
      identity: le.identity,
      chapters: le.chooseChapter,
      weapon: le.chooseWeapon
    })[s.value]);
    de(s, async () => {
      await St(), v.value && (v.value.scrollTop = 0), u.value?.focus({ preventScroll: !0 });
    });
    function w() {
      i.value = !0, h.value = !1, s.value = "identity";
    }
    function y() {
      c.value.trim() && l.value && o.value && (c.value = c.value.trim(), s.value = "chapters");
    }
    function M() {
      s.value = s.value === "weapon" ? "chapters" : s.value === "chapters" && i.value ? "identity" : "title";
    }
    function _() {
      a.campaign && !i.value ? n("continue") : s.value = "weapon";
    }
    function R() {
      !l.value || !o.value || !c.value.trim() || a.blocked || a.campaign && !h.value || n("start", {
        traveler: {
          name: c.value.trim(),
          gender: l.value,
          appearanceAge: o.value
        },
        weapon: d.value,
        chapter: Gt.id
      });
    }
    return t({ back: () => s.value === "title" ? !1 : (M(), !0) }), (g, x) => ($(), A("section", {
      class: yt(["ember-entry", { "is-title": s.value === "title" }]),
      "aria-label": m(B).title
    }, [
      Ue(hd),
      x[11] || (x[11] = k("div", { class: "entry-shade" }, null, -1)),
      s.value === "title" ? ($(), A("div", pd, [
        k("p", md, S(m(le).city), 1),
        k("h1", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, S(m(B).title), 513),
        k("nav", { "aria-label": m(B).title }, [
          e.campaign ? ($(), A("button", {
            key: 0,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[0] || (x[0] = (b) => n("continue"))
          }, [Ce(S(m(B).resume), 1), x[7] || (x[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, gd)) : ($(), A("button", {
            key: 1,
            class: "entry-primary",
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: w
          }, [Ce(S(e.ready ? m(le).begin : m(le).loading), 1), x[8] || (x[8] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, yd)),
          e.campaign ? ($(), A("button", {
            key: 2,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: x[1] || (x[1] = (b) => {
              i.value = !1, s.value = "chapters";
            })
          }, S(m(le).chapters), 9, bd)) : G("", !0),
          e.campaign ? ($(), A("button", {
            key: 3,
            type: "button",
            disabled: !e.ready || e.blocked,
            onClick: w
          }, S(m(le).newJourney), 9, wd)) : G("", !0)
        ], 8, vd),
        e.campaign ? ($(), A("p", xd, [k("span", null, S(e.campaign.traveler.name), 1), k("span", null, S(m(ms)), 1)])) : G("", !0)
      ])) : ($(), A("div", {
        key: 1,
        ref_key: "sheet",
        ref: v,
        class: "entry-sheet"
      }, [
        k("header", null, [k("button", {
          type: "button",
          disabled: e.busy,
          onClick: M
        }, "← " + S(m(le).back), 9, Md), k("span", null, S(m(B).title), 1)]),
        k("h2", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, S(f.value), 513),
        s.value === "identity" ? ($(), A("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: Rt(y, ["prevent"])
        }, [
          k("div", _d, [k("label", kd, S(m(le).name), 1), Ht(k("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": x[2] || (x[2] = (b) => c.value = b),
            maxlength: m(24),
            placeholder: m(le).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, Rd), [[jn, c.value]])]),
          k("div", Sd, [k("fieldset", null, [k("legend", null, S(m(le).gender), 1), ($(!0), A(ee, null, Re(m(ps), (b) => ($(), A("label", { key: b }, [Ht(k("input", {
            "onUpdate:modelValue": x[3] || (x[3] = (E) => l.value = E),
            type: "radio",
            name: "ember-traveler-gender",
            value: b,
            required: ""
          }, null, 8, Cd), [[zr, l.value]]), k("span", null, S(m(le).genders[b]), 1)]))), 128))]), k("div", $d, [k("label", Ad, S(m(le).age), 1), Ht(k("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": x[4] || (x[4] = (b) => o.value = b),
            required: ""
          }, [k("option", Pd, S(m(le).agePlaceholder), 1), ($(!0), A(ee, null, Re(m(Aa), (b, E) => ($(), A("option", {
            key: E,
            value: E
          }, S(b), 9, Ed))), 128))], 512), [[Zs, o.value]])])]),
          k("button", Id, [Ce(S(m(le).next), 1), x[9] || (x[9] = k("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : s.value === "chapters" ? ($(), A("div", zd, [k("button", {
          type: "button",
          class: "entry-chapter",
          onClick: _
        }, [
          k("img", {
            class: "entry-chapter-art",
            src: m(zn).chapter,
            alt: "",
            decoding: "async"
          }, null, 8, Ld),
          k("span", Td, S(m(Gt).numeral), 1),
          k("span", jd, [
            k("small", null, S(m(Gt).number), 1),
            k("strong", null, S(m(Gt).title), 1),
            k("span", null, S(m(B).opening), 1),
            e.campaign && !i.value ? ($(), A("small", Od, S(e.campaign.facts.includes("chapter_completed") ? m(le).completeChapter : m(le).currentChapter), 1)) : G("", !0)
          ]),
          x[10] || (x[10] = k("span", {
            class: "entry-chapter-arrow",
            "aria-hidden": "true"
          }, "→", -1))
        ]), k("div", Zd, [k("span", null, S(m(le).nextChapter), 1), k("span", null, S(m(le).forthcoming), 1)])])) : ($(), A("form", {
          key: 2,
          class: "entry-loadout",
          onSubmit: Rt(R, ["prevent"])
        }, [
          k("p", Ud, [k("strong", null, S(c.value), 1), k("span", null, S(l.value ? m(le).genders[l.value] : "") + " · " + S(o.value ? m(Aa)[o.value] : "") + " · " + S(m(le).identityRole), 1)]),
          Ue(cd, {
            modelValue: d.value,
            "onUpdate:modelValue": x[5] || (x[5] = (b) => d.value = b)
          }, null, 8, ["modelValue"]),
          e.campaign ? ($(), A("label", Nd, [Ht(k("input", {
            "onUpdate:modelValue": x[6] || (x[6] = (b) => h.value = b),
            type: "checkbox",
            required: ""
          }, null, 512), [[Ls, h.value]]), k("span", null, S(m(le).restartWarning), 1)])) : G("", !0),
          k("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Ce(S(e.busy ? m(le).entering : e.campaign ? m(le).confirmRestart : m(le).enter), 1), e.busy ? G("", !0) : ($(), A("span", Fd, "→"))], 8, Dd)
        ], 32))
      ], 512))
    ], 10, fd));
  }
}), qd = /* @__PURE__ */ Ke(Bd, [["__scopeId", "data-v-38da0fee"]]), Wd = [
  "aria-label",
  "title",
  "disabled"
], Hd = ["disabled"], Vd = [
  "maxlength",
  "aria-label",
  "placeholder"
], Gd = ["aria-label", "title"], Yd = [
  "aria-label",
  "title",
  "disabled"
], Qd = /* @__PURE__ */ Le({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ Jn({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Jn([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const r = Ir(e, "modelValue"), a = e, n = t, s = W(null), i = W(!1);
    let c = null, l = 0;
    function o() {
      s.value && (s.value.style.height = "44px", s.value.style.height = `${Math.min(132, s.value.scrollHeight + 2)}px`);
    }
    function d() {
      !a.blocked && r.value.trim() && n("send");
    }
    function h(u) {
      Ns(u, i.value) && (u.preventDefault(), d());
    }
    return de(r, async () => {
      await St(), o();
    }), de(s, (u, v) => {
      v && c?.unobserve(v), u && (o(), c?.observe(u));
    }, { flush: "post" }), aa(() => {
      o(), c = new ResizeObserver((u) => {
        const v = u[0].contentRect.width;
        v !== l && (l = v, o());
      }), s.value && c.observe(s.value);
    }), Dt(() => c?.disconnect()), (u, v) => ($(), A("form", {
      class: "ember-composer",
      onSubmit: Rt(d, ["prevent"])
    }, [
      k("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? m(ue).retrySend : m(ue).regenerate,
        title: e.retrying ? m(ue).retrySend : m(ue).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: v[0] || (v[0] = (f) => n("regenerate"))
      }, [...v[6] || (v[6] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, Wd),
      e.conclusion ? ($(), A("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: v[1] || (v[1] = (f) => n("continue"))
      }, [Ce(S(e.conclusion === "fight" ? m(ue).fight : m(ue).continue), 1), v[7] || (v[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, Hd)) : Ht(($(), A("textarea", {
        key: 1,
        ref_key: "input",
        ref: s,
        "onUpdate:modelValue": v[2] || (v[2] = (f) => r.value = f),
        rows: "1",
        maxlength: m(gs).playerTextLimit,
        "aria-label": m(B).input,
        placeholder: m(B).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: v[3] || (v[3] = (f) => i.value = !0),
        onCompositionend: v[4] || (v[4] = (f) => i.value = !1)
      }, null, 40, Vd)), [[jn, r.value]]),
      e.talking ? ($(), A("button", {
        key: 2,
        type: "button",
        "aria-label": m(B).cancel,
        title: m(B).cancel,
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
      })], -1)])], 8, Gd)) : e.conclusion ? G("", !0) : ($(), A("button", {
        key: 3,
        type: "submit",
        "aria-label": m(B).send,
        title: m(B).send,
        disabled: e.blocked || !r.value.trim()
      }, [...v[9] || (v[9] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Yd))
    ], 32));
  }
}), Kd = /* @__PURE__ */ Ke(Qd, [["__scopeId", "data-v-640a5540"]]), Xd = ["data-phase"], Jd = {
  role: "status",
  "aria-live": "polite"
}, e1 = ["datetime"], t1 = /* @__PURE__ */ Le({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, r = W(Date.now()), a = W(!0);
    Tn(() => {
      a.value = !0;
    }), Va(() => {
      a.value = !1;
    });
    const n = Y(() => Math.max(0, Math.floor((r.value - t.startedAt) / 1e3)));
    return de(() => [t.startedAt, a.value], (s, i, c) => {
      if (r.value = Date.now(), !a.value) return;
      const l = setInterval(() => {
        r.value = Date.now();
      }, 1e3);
      c(() => clearInterval(l));
    }, { immediate: !0 }), (s, i) => ($(), A("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = k("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      k("span", Jd, S(m(ue).phases[e.phase]), 1),
      k("time", { datetime: `PT${n.value}S` }, S(m(ue).elapsed(n.value)), 9, e1)
    ], 8, Xd));
  }
}), a1 = /* @__PURE__ */ Ke(t1, [["__scopeId", "data-v-55406ff9"]]), Er = "关闭交谈后出发", ca = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${Er}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, r) => r ? `${e}准备前往${t}等候 · ${Er}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function n1(e, t, r) {
  if (!Oe(t)) return !1;
  const a = e.people[t], n = r.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const s = e.conversations[t];
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i], l = c.action;
    if (l === "follow" || l === "stay" || l?.startsWith("go:")) return c.id === r.id;
  }
  return !1;
}
function r1(e, t, r) {
  const a = r.action;
  if (r.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === r.id, s = n1(e, t, r) || n && (a === "finish" ? Gn(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), i = Qe(t);
  let c;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      c = ca[a];
      break;
    case "follow":
      c = ca.follow(i, s);
      break;
    case "stay":
      c = ca.stay(i);
      break;
    case "pass":
      c = ca.pass(i, s);
      break;
    case "attack":
    case "finish":
      c = ca[a](s);
      break;
    default:
      c = ca.go(i, Ga[a.slice(3)].name, s);
  }
  return {
    action: a,
    phase: s ? "pending" : "applied",
    text: c
  };
}
var s1 = ["data-action", "data-phase"], o1 = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, i1 = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, l1 = /* @__PURE__ */ Le({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, r = Y(() => r1(t.campaign, t.person, t.turn));
    return (a, n) => r.value ? ($(), A("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": r.value.action,
      "data-phase": r.value.phase
    }, [($(), A("svg", o1, [r.value.phase === "pending" ? ($(), A(ee, { key: 0 }, [n[0] || (n[0] = k("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = k("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : ($(), A("path", i1))])), k("span", null, S(r.value.text), 1)], 8, s1)) : G("", !0);
  }
}), c1 = /* @__PURE__ */ Ke(l1, [["__scopeId", "data-v-00613f94"]]), u1 = { class: "ember-clothing-feedback" }, d1 = { key: 0 }, h1 = /* @__PURE__ */ Le({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), A("details", u1, [k("summary", null, [Ce(S(m(Pa).changed), 1), k("span", null, [($(!0), A(ee, null, Re(m(Qn), (a, n) => ($(), A(ee, { key: n }, [e.clothing[n] !== void 0 ? ($(), A("small", d1, S(a), 1)) : G("", !0)], 64))), 128))])]), Ue(zs, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), f1 = /* @__PURE__ */ Ke(h1, [["__scopeId", "data-v-49dedcf2"]]);
function p1(e) {
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
var m1 = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, v1 = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, g1 = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, y1 = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, b1 = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, w1 = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, x1 = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, M1 = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, _1 = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, k1 = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, R1 = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, S1 = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, C1 = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, $1 = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, A1 = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, P1 = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, E1 = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, I1 = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, z1 = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, L1 = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, T1 = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, j1 = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, O1 = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, Z1 = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, U1 = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, N1 = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, D1 = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, F1 = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, B1 = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, q1 = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, W1 = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, H1 = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, V1 = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, G1 = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, Y1 = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, Q1 = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, K1 = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, X1 = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, J1 = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, eh = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, th = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, ah = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, nh = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, rh = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, sh = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, oh = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, ih = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, lh = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, ch = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, uh = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, dh = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, hh = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, fh = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, ph = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, mh = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, vh = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, gh = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, yh = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, bh = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, wh = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, xh = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, Mh = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, _h = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, kh = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, Rh = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, Sh = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, Ch = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, $h = {
  sanniang: {
    body: m1,
    arm: v1,
    heads: {
      neutral: g1,
      smile: y1,
      teasing: b1,
      blush: w1,
      rest: x1,
      serious: M1,
      worried: _1,
      sad: k1,
      displeased: R1,
      fond: S1,
      laugh: C1,
      surprised: $1
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: A1,
    arm: E1,
    heads: {
      neutral: P1,
      smile: N1,
      blush: I1,
      displeased: z1,
      fond: L1,
      laugh: T1,
      rest: j1,
      sad: O1,
      surprised: Z1,
      worried: U1
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: D1,
    arm: B1,
    heads: {
      neutral: F1,
      blush: J1,
      displeased: q1,
      fond: W1,
      laugh: H1,
      sad: V1,
      serious: G1,
      smile: Y1,
      surprised: Q1,
      teasing: K1,
      worried: X1
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: eh,
    arm: th,
    heads: {
      neutral: ah,
      smile: nh,
      teasing: rh,
      laugh: sh,
      blush: oh,
      fond: ih,
      serious: lh,
      surprised: ch,
      worried: uh,
      sad: dh
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: hh,
    arm: ph,
    heads: {
      neutral: fh,
      angry: mh,
      relieved: vh,
      resigned: gh,
      suspicious: yh,
      worried: bh
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: wh,
    arm: Mh,
    heads: {
      neutral: xh,
      displeased: _h,
      relieved: kh,
      smile: Rh,
      squint: Sh,
      worried: Ch
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, Ah = {
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
function Ph(e, t, r) {
  if (e === "none") return null;
  const a = Ah[e], n = a.joint === "arm" ? a.angles.map((s) => `rotate(${s * r}deg)`) : a.frames;
  return t[a.joint].animate(n.map((s) => ({ transform: s })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var Eh = ["src"], Ih = ["src"], zh = ["src"], Lh = /* @__PURE__ */ Le({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = W(null), a = W(null), n = W(null), s = Y(() => $h[t.person]), i = W(!1), c = W(0);
    let l = 0, o = !1, d = !1, h = null, u, v;
    function f() {
      d = !0, h?.cancel(), h = null;
    }
    function w() {
      if (!(!t.animate || d || i.value || l < 3 || !o)) {
        if (document.hidden || v?.matches) {
          f();
          return;
        }
        a.value && n.value && (d = !0, h = Ph(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, s.value.armDirection));
      }
    }
    function y() {
      l++, w();
    }
    function M() {
      i.value = !0, f();
    }
    function _() {
      l = 0, i.value = !1, c.value++;
    }
    function R() {
      document.hidden && f();
    }
    function g() {
      v?.matches && f();
    }
    return de(() => t.animate, (x) => {
      x ? w() : f();
    }), aa(() => {
      v = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || v.matches) && f(), v.addEventListener("change", g), document.addEventListener("visibilitychange", R), u = new IntersectionObserver((x) => {
        o = x[0].isIntersecting && x[0].intersectionRatio >= 0.25, o ? w() : h && f();
      }, { threshold: 0.25 }), r.value && u.observe(r.value);
    }), Va(f), Dt(() => {
      f(), u?.disconnect(), v?.removeEventListener("change", g), document.removeEventListener("visibilitychange", R);
    }), (x, b) => ($(), A("span", {
      ref_key: "root",
      ref: r,
      class: yt(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? ($(), A("button", {
      key: 1,
      type: "button",
      onClick: _
    }, S(m(ue).reloadArtwork), 1)) : ($(), A(ee, { key: 0 }, [
      ($(), A("img", {
        key: "body-" + c.value,
        src: s.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 40, Eh)),
      ($(), A("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: s.value.heads[e.performance?.expression ?? "neutral"],
        style: da({ transformOrigin: s.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 44, Ih)),
      ($(), A("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: s.value.arm,
        style: da({ transformOrigin: s.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: M
      }, null, 44, zh))
    ], 64))], 2));
  }
}), Th = /* @__PURE__ */ Ke(Lh, [["__scopeId", "data-v-606c2ccc"]]), jh = { class: "ember-npc-bubble" }, Oh = { class: "ember-npc-line" }, Zh = /* @__PURE__ */ Le({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = Y(() => p1(t.reply));
    return (a, n) => ($(), A("div", jh, [Ue(Th, {
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ]), k("p", Oh, [($(!0), A(ee, null, Re(r.value, (s, i) => ($(), A("span", {
      key: i,
      class: yt({ "ember-spoken": s.spoken })
    }, S(s.text), 3))), 128))])]));
  }
}), Uh = /* @__PURE__ */ Ke(Zh, [["__scopeId", "data-v-5a2c5c6c"]]), Nh = { class: "ember-campaign" }, Dh = { class: "ember-health" }, Fh = [
  "max",
  "value",
  "aria-label"
], Bh = { class: "ember-objective" }, qh = {
  key: 0,
  class: "ember-boss"
}, Wh = [
  "max",
  "value",
  "aria-label"
], Hh = {
  key: 1,
  class: "ember-alarm",
  role: "status"
}, Vh = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, Gh = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, Yh = {
  key: 4,
  class: "ember-rest-notice",
  role: "status"
}, Qh = ["aria-label"], Kh = ["disabled", "aria-label"], Xh = ["disabled", "aria-label"], Jh = ["disabled", "aria-label"], e2 = ["aria-label"], t2 = ["aria-label"], a2 = { class: "ember-error-detail" }, n2 = ["disabled"], r2 = ["disabled"], s2 = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, o2 = { class: "ember-error-detail" }, i2 = { key: 0 }, l2 = { class: "ember-prose" }, c2 = {
  key: 8,
  class: "ember-award-notice",
  role: "status"
}, u2 = ["aria-label"], d2 = ["aria-label"], h2 = {
  key: 0,
  class: "ember-panel-heading"
}, f2 = ["aria-label"], p2 = ["aria-pressed"], m2 = ["aria-pressed"], v2 = ["disabled"], g2 = { class: "ember-prose ember-prologue" }, y2 = { class: "ember-objective-panel" }, b2 = { class: "ember-journal" }, w2 = { class: "ember-journal" }, x2 = { class: "ember-pack-heading" }, M2 = { key: 0 }, _2 = { key: 1 }, k2 = { class: "ember-relics" }, R2 = { key: 0 }, S2 = { key: 1 }, C2 = ["disabled", "onClick"], $2 = { class: "ember-dialogue-heading" }, A2 = { class: "ember-person-heading" }, P2 = ["disabled"], E2 = ["data-message-key"], I2 = ["data-message-key", "data-fresh-reply"], z2 = {
  key: 0,
  class: "ember-dialogue-issue"
}, L2 = { key: 1 }, T2 = { class: "ember-prose" }, j2 = {
  key: 2,
  class: "ember-prose"
}, O2 = ["aria-busy"], Z2 = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, U2 = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, N2 = { class: "ember-error-detail" }, D2 = { key: 0 }, F2 = { class: "ember-prose" }, B2 = {
  key: 3,
  class: "ember-history-nav"
}, q2 = {
  key: 6,
  class: "ember-prose"
}, W2 = ["src"], H2 = { class: "ember-prose" }, V2 = ["src"], G2 = { class: "ember-prose" }, Y2 = { key: 0 }, Q2 = { key: 1 }, K2 = { class: "ember-prose" }, X2 = ["disabled"], J2 = ["disabled"], ef = ["disabled"], tf = { class: "ember-pause-actions" }, af = ["aria-pressed"], nf = { class: "ember-help ember-keyboard-help" }, rf = { class: "ember-help ember-touch-help" }, sf = /* @__PURE__ */ Le({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, r = Pi(t.bridge, t.chatIdentity), a = Ei(r), { view: n, notice: s, busy: i, blocked: c, talking: l, outgoing: o, conversationProgress: d, conversationFailure: h } = r, { current: u, dirty: v } = a, f = W(!0), w = W(!1), y = W(!1), M = W(0), _ = W(!1), R = W(!1), g = W(null), x = W(null), b = W(null), E = W("relics"), T = Y(() => b.value === "map" ? B.map : b.value === "journal" ? B.journal : b.value === "build" ? B.build : b.value === "person" ? Qe(L.value) : b.value === "passage" ? se.passages[N.value].title : b.value === "arrival" ? se.scenes.camp : b.value === "ending" || b.value === "prologue" ? ms : u.value?.phase === "reward" ? B.reward : u.value?.phase === "lost" ? B.fallen : B.pause), L = W("sanniang"), N = W("warning"), z = W(null), P = W({}), U = Y({
      get: () => P.value[L.value] ?? "",
      set: (O) => {
        P.value[L.value] = O;
      }
    }), H = W(null), F = W(!1), Z = W(null), V = W(null), ae = W(null), rt = Y((O) => {
      const D = u.value?.facts ?? [];
      return O && O.size === D.length && D.every((j) => O.has(j)) ? O : new Set(D);
    }), Xe = Y((O) => {
      const D = u.value ? Wn(u.value).filter((j) => j.kind === "object").map((j) => j.target.id) : [];
      return O && O.size === D.length && D.every((j) => O.has(j)) ? O : new Set(D);
    }), xe = Y(() => u.value ? {
      definition: we[u.value.location.scene],
      location: u.value.location,
      facts: rt.value,
      people: u.value.people,
      objects: Xe.value,
      completedSegments: u.value.completedSegments,
      engagement: u.value.engagement?.id
    } : null), ce = Y(() => {
      const O = u.value?.battle;
      if (u.value?.engagement?.id !== "beacon" || !O) return "";
      switch (O.script.signal) {
        case "approach":
          return et.signalApproach;
        case "lighting":
          return et.signalCountdown(Math.ceil((O.objective.target - O.objective.progress) / K.hz));
        case "lit":
          return et.signalLit;
        default:
          return "";
      }
    }), Ne = Y(() => {
      const O = u.value && Ln[u.value.location.scene];
      return O ? { "--scene-art": `url("${O}")` } : void 0;
    }), Mt = Y(() => u.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), Ze = Y(() => u.value ? Gn(u.value) : null), _t = Y(() => u.value?.pendingParley ? u.value.pendingParley.decision === "attack" ? "fight" : "continue" : Ze.value ? "continue" : void 0), It = Y(() => !_.value || !u.value || !!u.value.pendingParley || !!Ze.value || f.value || !!b.value || !!s.value || l.value || y.value || t.generationActive || R.value || !!g.value || !["exploration", "battle"].includes(u.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), Ve = Y(() => u.value?.battle?.enemies.find((O) => _e(O.kind))), Te = Y(() => {
      const O = u.value?.conversations[L.value] ?? [], D = r.replacingReply.value;
      return D?.person === L.value ? O.map((j) => j.id === D.turnId ? hi(j) : j) : O;
    }), ge = Y(() => u.value && !Te.value.length ? vs(u.value, L.value) : null), Pe = Y(() => H.value?.person === L.value ? {
      ...H.value,
      status: F.value ? "sending" : "failed"
    } : o.value?.person === L.value && !o.value.regenerating && !Te.value.some((O) => O.id === o.value?.actionId) ? o.value : null), st = Y(() => Pe.value?.status === "failed"), Ea = Y(() => u.value && gr(u.value, L.value)), ot = W(null), na = W(!1);
    let pa;
    function me() {
      clearTimeout(pa), pa = void 0, na.value = !1;
    }
    const De = W(0), it = W("");
    let lt;
    function ct(O) {
      clearTimeout(lt), it.value = O, lt = setTimeout(() => {
        it.value = "";
      }, 4e3);
    }
    de(() => [u.value?.id, u.value ? Object.keys(u.value.rewards).length : 0], (O, D) => {
      O[0] && O[0] === D[0] && O[1] > D[1] && ct(et.cacheReady);
    });
    const q = Y(() => ys.flatMap((O) => {
      const D = n.value?.data.awards.find((j) => j.key === O.key && j.runId === u.value?.id);
      return D ? [{
        fact: O.fact,
        amount: D.amount
      }] : [];
    })), ma = Y(() => q.value.reduce((O, D) => O + D.amount, 0)), { messages: J, hasOlder: nn, hasNewer: Ft, expanded: va, pendingVisible: ga, rememberReading: ya, resetLatest: zt, older: ut, newer: ba } = Ii({
      history: Y(() => ge.value ? [ge.value] : Te.value),
      pending: Y(() => !!Pe.value),
      person: L,
      campaignId: Y(() => u.value?.id),
      transcript: Z,
      freshReply: ot,
      talking: l
    }), ra = Y(() => u.value?.collection.map((O) => {
      const D = u.value.equipped.includes(O.id) ? u.value.equipped.filter((j) => j !== O.id) : [...u.value.equipped, O.id];
      return {
        ...O,
        equipped: D,
        issue: yi(u.value, D),
        dormant: u.value.equipped.includes(O.id) && !Jr(Yn(u.value), O.id)
      };
    }) ?? []), Bt = Hi(() => {
      r.error.value = ne.presentationError.sound, w.value = !1;
    });
    let qt = !1;
    function sa() {
      if (!b.value && u.value?.phase === "reward") {
        Fe({ type: "leave" });
        return;
      }
      (b.value || u.value && ["exploration", "battle"].includes(u.value.phase)) && Je();
    }
    async function oa() {
      await Fe({ type: "resolve_parley" }) && (b.value = null, await St(), ae.value?.focus());
    }
    async function wa() {
      Ze.value ? await Fe({ type: "accept_reply" }) : await oa();
    }
    er(z, sa), Tr(() => _.value ? b.value || u.value?.phase === "reward" ? (sa(), !0) : f.value ? !1 : (Wt(), !0) : x.value?.back() ?? !1), er(V, () => {
      !i.value && !y.value && !t.generationActive && r.dismissError();
    });
    function Wt() {
      f.value = !0, a.flush();
    }
    function rn() {
      b.value = null, Wt();
    }
    async function xa(O) {
      R.value || g.value || (b.value = O, O === "build" && (E.value = "relics"), await a.flush());
    }
    async function Je() {
      if (!Ze.value) {
        if (u.value?.pendingParley) {
          u.value.pendingParley.decision === "pass" && await oa();
          return;
        }
        !s.value && !t.generationActive && (_.value = !0, b.value = null, f.value = !1, await St(), ae.value?.focus());
      }
    }
    function Ma() {
      _.value = !0, u.value?.pendingParley || Ze.value ? (L.value = u.value?.pendingParley?.enemy ?? Ze.value, b.value = "person", f.value = !1) : Je();
    }
    async function Fe(O) {
      if (R.value || g.value) return !1;
      R.value = !0, O.type === "interact" && u.value && (g.value = we[u.value.location.scene].exits.find((j) => j.id === O.id)?.to ?? null);
      let D = !1;
      try {
        return await a.flush() ? (D = await r.act(O), D && (a.sync(), O.type === "relic" && ct(et.received(Vt[O.id].name, !!u.value?.equipped.includes(O.id))), !b.value && !f.value && (await St(), ae.value?.focus())), D) : !1;
      } finally {
        R.value = !1, D || (g.value = null);
      }
    }
    function sn(O) {
      O === g.value && (g.value = null);
    }
    async function on(O) {
      await Fe({
        type: u.value ? "restart" : "start",
        ...O,
        outfit: Mt.value
      }) && (_.value = !0, b.value = "prologue");
    }
    function Ia() {
      f.value = !0, b.value = null, _.value = !1, a.flush();
    }
    async function za(O) {
      if (!u.value || R.value || g.value) return;
      me();
      const D = [...hs(u.value), ...en(u.value.location.scene, u.value.location.position, new Set(u.value.facts))].find((je) => je.target.id === O), j = D?.kind === "object" ? D.target : null;
      if (j?.kind === "person" || j?.kind === "enemy") {
        const je = j.kind === "person" ? j.person : j.enemy;
        L.value = je, b.value = "person", await a.flush() && !u.value.conversations[je].length && await r.act({
          type: "greet",
          person: je
        }) && a.sync();
        return;
      }
      await Fe({
        type: "interact",
        id: O
      }) && (j?.kind === "inspect" ? (N.value = j.passage, b.value = "passage") : j?.kind === "rest" && (na.value = !0, pa = setTimeout(me, 3e3)));
    }
    async function X() {
      const O = L.value, D = U.value.trim();
      if (!(c.value || F.value || !D || _t.value)) {
        P.value[O] = "", H.value = {
          person: O,
          text: D
        }, F.value = !0, zt();
        try {
          if (!await a.flush()) return;
          const j = r.talk(O, D);
          H.value = null, await j && a.sync();
        } finally {
          F.value = !1;
        }
      }
    }
    async function te() {
      if (!(c.value || F.value || !u.value))
        if (zt(), st.value && Pe.value) {
          const O = Pe.value, D = r.talk(O.person, O.text);
          H.value = null, await D && a.sync();
        } else {
          const O = gr(u.value, L.value);
          O && await r.talk(L.value, O.player, O.id) && a.sync();
        }
    }
    async function Se() {
      await a.recover() && (f.value = !0, M.value++);
    }
    return de(() => t.generationActive, (O) => {
      O && Wt();
    }), de(() => [u.value?.pendingParley, Ze.value], ([O, D]) => {
      (O || D) && (L.value = O?.enemy ?? D, b.value = "person");
    }, { immediate: !0 }), de(w, (O) => {
      Bt.enable(O);
    }), de(u, (O) => {
      w.value && O?.battle && Bt.tick(O.battle);
    }), de(() => n.value?.data, (O, D) => {
      if (!O?.active || !D?.active || O.active.id !== D.active.id) {
        De.value = 0;
        return;
      }
      De.value += O.awards.filter((dt) => !D.awards.some((ht) => ht.key === dt.key)).reduce((dt, ht) => dt + ht.amount, 0);
      const j = new Set(D.active.facts), je = new Set(O.active.facts);
      !j.has("chapter_completed") && je.has("chapter_completed") ? b.value = "ending" : !j.has("captives_arrived") && je.has("captives_arrived") && (b.value = "arrival");
    }), de(() => u.value?.id, () => {
      P.value = {}, H.value = null;
    }), de([
      _,
      f,
      b,
      s,
      () => u.value?.id,
      () => u.value?.location.scene
    ], me), de([b, L], () => {
      ot.value = null;
    }), de(s, (O) => {
      O && (ot.value = null);
    }), de(() => [L.value, Te.value], ([O, D], [j, je]) => {
      const dt = D.filter((ht) => ht.kind === "dialogue").at(-1);
      O === j && b.value === "person" && dt && !je.some((ht) => ht.id === dt.id) && (ot.value = dt.id);
    }), aa(async () => {
      await r.read(), qt = !0;
    }), Tn(() => {
      qt && !v.value && r.read();
    }), Va(() => {
      ot.value = null, me(), Wt();
    }), Dt(() => {
      clearTimeout(lt), me(), a.dispose(), r.dispose(), Bt.dispose();
    }), (O, D) => ($(), A("section", Nh, [
      _.value ? G("", !0) : ($(), kt(qd, {
        key: 0,
        ref_key: "entry",
        ref: x,
        campaign: m(u),
        ready: !!m(n)?.ready,
        busy: m(i),
        blocked: m(c) || e.generationActive,
        onStart: on,
        onContinue: Ma
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      _.value && m(u) && xe.value ? ($(), kt(nc, {
        key: M.value,
        ref_key: "field",
        ref: ae,
        world: xe.value,
        traveler: m(u).traveler,
        paused: It.value,
        transitioning: !!g.value,
        weapon: m(u).weapon,
        outfit: Mt.value,
        battle: m(u).battle,
        onInput: m(a).input,
        onInteract: za,
        onPause: Wt,
        onResume: Je,
        onError: D[0] || (D[0] = (j) => y.value = !0),
        onReady: sn
      }, {
        status: cn(() => [m(u) ? ($(), A(ee, { key: 0 }, [k("div", Dh, [k("meter", {
          min: 0,
          max: m(K).maxHp,
          value: m(u).hp,
          "aria-label": m(ne).hp
        }, null, 8, Fh), k("span", null, S(Math.ceil(m(u).hp)) + " / " + S(m(K).maxHp), 1)]), k("p", Bh, S(m(Mn)(m(u))), 1)], 64)) : G("", !0)]),
        threat: cn(() => [_.value && Ve.value && !b.value ? ($(), A("div", qh, [k("strong", null, S(m(xn)[Ve.value.kind]), 1), k("meter", {
          min: "0",
          max: Ve.value.maxHp,
          value: Ve.value.hp,
          "aria-label": m(xn)[Ve.value.kind]
        }, null, 8, Wh)])) : G("", !0), _.value && ce.value && !b.value ? ($(), A("div", Hh, S(ce.value), 1)) : G("", !0)]),
        overlay: cn(() => [...D[23] || (D[23] = [k("span", null, null, -1)])]),
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
      _.value && g.value && !m(s) && !y.value && !b.value && !f.value ? ($(), A("aside", Vh, S(m(se).transition(m(se).scenes[g.value])), 1)) : G("", !0),
      _.value && na.value && !b.value && !f.value && !m(s) ? ($(), A("p", Gh, S(m(se).rested), 1)) : _.value && it.value && m(u)?.phase === "exploration" && !b.value && !f.value && !m(s) ? ($(), A("p", Yh, S(it.value), 1)) : G("", !0),
      _.value && m(u) && !m(u).pendingParley && !Ze.value ? ($(), A("nav", {
        key: 5,
        class: "ember-tools",
        "aria-label": m(B).prepare
      }, [
        k("button", {
          type: "button",
          disabled: R.value || !!g.value,
          "aria-label": m(B).map,
          onClick: D[1] || (D[1] = (j) => xa("map"))
        }, [Ue(Ot, { name: "map" }), k("span", null, S(m(B).map), 1)], 8, Kh),
        k("button", {
          type: "button",
          disabled: R.value || !!g.value,
          "aria-label": m(B).build,
          onClick: D[2] || (D[2] = (j) => xa("build"))
        }, [Ue(Ot, { name: "bag" }), k("span", null, S(m(B).build), 1)], 8, Xh),
        k("button", {
          type: "button",
          disabled: R.value || !!g.value,
          "aria-label": m(B).journal,
          onClick: D[3] || (D[3] = (j) => xa("journal"))
        }, [Ue(Ot, { name: "journal" }), k("span", null, S(m(B).journal), 1)], 8, Jh),
        k("button", {
          type: "button",
          "aria-label": m(B).pause,
          onClick: rn
        }, [Ue(Ot, { name: "pause" }), k("span", null, S(m(B).pause), 1)], 8, e2)
      ], 8, Qh)) : G("", !0),
      m(s) || y.value || e.generationActive ? ($(), A("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: V,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": m(B).noticeTitle,
        tabindex: "-1"
      }, [k("p", a2, S(y.value ? m(B).renderError : e.generationActive ? m(B).generation : m(s)), 1), y.value ? ($(), A("button", {
        key: 0,
        type: "button",
        onClick: D[4] || (D[4] = (j) => {
          y.value = !1, M.value++;
        })
      }, S(m(B).reload), 1)) : m(r).dataInvalid.value && !e.generationActive ? ($(), A(ee, { key: 1 }, [k("p", null, S(m(B).rebuildWarning), 1), k("button", {
        type: "button",
        disabled: m(i),
        onClick: D[5] || (D[5] = (...j) => m(r).rebuild && m(r).rebuild(...j))
      }, S(m(B).rebuild), 9, n2)], 64)) : e.generationActive ? G("", !0) : ($(), A("button", {
        key: 2,
        type: "button",
        disabled: m(i),
        onClick: D[6] || (D[6] = (j) => m(r).recoveryRequired.value ? Se() : m(r).dismissError())
      }, S(m(r).recoveryRequired.value ? m(B).recover : m(B).acknowledge), 9, r2))], 8, t2)) : G("", !0),
      m(h) && !m(s) && (b.value !== "person" || L.value !== m(h).person) ? ($(), A("aside", s2, [
        k("strong", null, S(m(Qe)(m(h).person)), 1),
        k("p", o2, S(m(Zt)(m(h))), 1),
        m(h).text ? ($(), A("details", i2, [k("summary", null, S(m(B).receivedReply), 1), k("p", l2, S(m(h).text), 1)])) : G("", !0),
        k("button", {
          type: "button",
          onClick: D[7] || (D[7] = (...j) => m(r).dismissConversationFailure && m(r).dismissConversationFailure(...j))
        }, S(m(B).acknowledge), 1)
      ])) : G("", !0),
      _.value && De.value && !b.value && !f.value && !m(s) ? ($(), A("aside", c2, [k("span", null, [k("small", null, S(m(B).rewardTitle), 1), k("strong", null, S(m(B).rewardReceived(De.value)), 1)]), k("button", {
        type: "button",
        "aria-label": m(B).rewardDismiss,
        onClick: D[8] || (D[8] = (j) => De.value = 0)
      }, "×", 8, u2)])) : G("", !0),
      _.value && m(u) && !m(s) && !y.value && !e.generationActive && (b.value || f.value || m(u).phase === "reward" || m(u).phase === "lost") ? ($(), A("div", {
        key: 9,
        class: "ember-curtain",
        style: da(b.value === "person" ? Ne.value : void 0)
      }, [k("section", {
        ref_key: "dialog",
        ref: z,
        class: yt(["ember-panel", {
          "ember-wide": b.value === "map" || b.value === "build" && E.value === "wardrobe",
          "ember-map-panel": b.value === "map",
          "ember-wardrobe-panel": b.value === "build" && E.value === "wardrobe",
          "ember-dialogue": b.value === "person"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": T.value,
        tabindex: "-1"
      }, [b.value !== "map" && b.value !== "person" ? ($(), A("header", h2, [
        k("h2", null, S(T.value), 1),
        b.value === "build" ? ($(), A("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": m(B).build
        }, [k("button", {
          type: "button",
          "aria-pressed": E.value === "relics",
          onClick: D[9] || (D[9] = (j) => E.value = "relics")
        }, S(m(le).equipment), 9, p2), k("button", {
          type: "button",
          "aria-pressed": E.value === "wardrobe",
          onClick: D[10] || (D[10] = (j) => E.value = "wardrobe")
        }, S(m(B).wardrobe), 9, m2)], 8, f2)) : G("", !0),
        b.value !== "prologue" && m(u).pendingParley?.decision !== "attack" && (b.value || m(u).phase !== "lost" && m(u).phase !== "reward") ? ($(), A("button", {
          key: 1,
          type: "button",
          disabled: !!m(u).pendingParley && m(c),
          onClick: Je
        }, S(m(B).close), 9, v2)) : G("", !0)
      ])) : G("", !0), b.value === "map" ? ($(), kt(Wc, {
        key: 1,
        campaign: m(u),
        onClose: Je
      }, null, 8, ["campaign"])) : b.value === "prologue" ? ($(), A(ee, { key: 2 }, [k("p", g2, S(m(B).opening), 1), k("button", {
        class: "ember-primary",
        type: "button",
        onClick: Je
      }, S(m(B).start), 1)], 64)) : b.value === "journal" ? ($(), A(ee, { key: 3 }, [
        k("p", y2, S(m(Mn)(m(u))), 1),
        k("ol", b2, [($(!0), A(ee, null, Re(m(u).facts, (j) => ($(), A("li", { key: j }, S(m(wn)[j]), 1))), 128))]),
        q.value.length ? ($(), A(ee, { key: 0 }, [
          k("h3", null, S(m(B).journeyReward(ma.value)), 1),
          k("ul", w2, [($(!0), A(ee, null, Re(q.value, (j) => ($(), A("li", { key: j.fact }, [Ce(S(m(wn)[j.fact]) + " ", 1), k("strong", null, S(m(B).rewardReceived(j.amount)), 1)]))), 128))]),
          k("small", null, S(m(B).rewardRule), 1)
        ], 64)) : G("", !0)
      ], 64)) : b.value === "build" ? ($(), A(ee, { key: 4 }, [E.value === "wardrobe" && m(n) ? ($(), kt(fu, {
        key: 0,
        data: m(n).data,
        traveler: m(u).traveler,
        balance: m(n).balance,
        blocked: m(c),
        weapon: m(u).weapon,
        onCommand: Fe
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : ($(), A(ee, { key: 1 }, [
        k("div", x2, [k("strong", null, S(m(u).traveler.name), 1), k("span", null, [
          Ce(S(m(le).genders[m(u).traveler.gender]), 1),
          m(u).traveler.appearanceAge ? ($(), A(ee, { key: 0 }, [Ce(" · " + S(m(Aa)[m(u).traveler.appearanceAge]), 1)], 64)) : G("", !0),
          Ce(" · " + S(m(le).identityRole), 1)
        ])]),
        k("small", null, S(m(B).slots(m(u).equipped.length, m(K).relicSlots)), 1),
        k("p", null, S(m(Tt)[m(u).weapon].name) + " · " + S(m(co)(m(u).weapon)), 1),
        m(ls)(m(u)) ? G("", !0) : ($(), A("p", M2, S(m(et).restBuild), 1)),
        m(u).collection.length ? G("", !0) : ($(), A("p", _2, S(m(B).emptyBuild), 1)),
        k("div", k2, [($(!0), A(ee, null, Re(ra.value, (j) => ($(), A("article", { key: j.id }, [
          Ue(Ot, { name: j.id }, null, 8, ["name"]),
          k("h3", null, [Ce(S(m(Vt)[j.id].name) + " ", 1), k("small", null, S(m(ne).rank(j.rank)), 1)]),
          k("p", null, S(m(Vt)[j.id].detail), 1),
          j.issue === "capacity" ? ($(), A("small", R2, S(m(B).loadoutIssue.capacity), 1)) : G("", !0),
          j.dormant ? ($(), A("small", S2, S(m(et).dormantRelic), 1)) : G("", !0),
          k("button", {
            type: "button",
            disabled: m(c) || !!j.issue,
            onClick: (je) => Fe({
              type: "loadout",
              equipped: j.equipped
            })
          }, S(m(u).equipped.includes(j.id) ? m(B).takeOff : m(B).putOn), 9, C2)
        ]))), 128))])
      ], 64))], 64)) : b.value === "person" ? ($(), A(ee, { key: 5 }, [
        k("header", $2, [
          k("div", A2, [k("h2", null, S(m(Qe)(L.value)), 1), k("small", null, S(m(se).scenes[m(u).location.scene]), 1)]),
          ($(), kt(ed, {
            key: L.value,
            campaign: m(u),
            person: L.value,
            draft: U.value,
            "memory-state": m(n)?.memories?.[L.value],
            blocked: m(c),
            onRetryMemory: D[11] || (D[11] = (j) => m(r).retryMemory(L.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !Ze.value && m(u).pendingParley?.decision !== "attack" ? ($(), A("button", {
            key: 0,
            type: "button",
            disabled: !!m(u).pendingParley && m(c),
            onClick: Je
          }, S(m(B).close), 9, P2)) : G("", !0)
        ]),
        k("div", {
          ref_key: "transcript",
          ref: Z,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: D[16] || (D[16] = (...j) => m(ya) && m(ya)(...j))
        }, [
          m(nn) ? ($(), A("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: D[12] || (D[12] = (...j) => m(ut) && m(ut)(...j))
          }, S(m(ue).older), 1)) : G("", !0),
          ($(!0), A(ee, null, Re(m(J), (j) => ($(), A(ee, { key: j.key }, [j.side === "player" ? ($(), A("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": j.key
          }, [k("small", null, S(m(u).traveler.name), 1), Ce(S(j.turn.player), 1)], 8, E2)) : ($(), A("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": j.key,
            "data-fresh-reply": ot.value === j.turn.id
          }, [j.turn.issue === "action_rejected" || j.turn.issue === "clothing_rejected" || j.turn.issue === "reply_invalid" || j.turn.issue === "reply_incomplete" ? ($(), A("p", z2, S(m(ue).issues[j.turn.issue]), 1)) : G("", !0), j.turn.kind === "receipt" && j.turn.issue === "reply_invalid" ? ($(), A("details", L2, [k("summary", null, S(m(ue).rawReply), 1), k("p", T2, S(j.turn.reply), 1)])) : j.turn.kind === "receipt" ? ($(), A("p", j2, S(j.turn.reply), 1)) : ($(), A(ee, { key: 3 }, [
            Ue(Uh, {
              person: L.value,
              reply: j.turn.reply,
              performance: j.turn.performance,
              animate: ot.value === j.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            Ue(c1, {
              campaign: m(u),
              person: L.value,
              turn: j.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            j.turn.clothing ? ($(), kt(f1, {
              key: 0,
              clothing: j.turn.clothing
            }, null, 8, ["clothing"])) : G("", !0)
          ], 64))], 8, I2))], 64))), 128)),
          m(ga) && Pe.value ? ($(), A(ee, { key: 1 }, [k("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Pe.value.status === "sending"
          }, [k("small", null, S(m(u).traveler.name), 1), Ce(S(Pe.value.text), 1)], 8, O2), st.value ? ($(), A("p", Z2, S(m(ue).sendFailed), 1)) : G("", !0)], 64)) : G("", !0),
          !m(Ft) && m(h)?.person === L.value && !Te.value.some((j) => j.id === m(h)?.actionId) ? ($(), A("div", U2, [
            k("p", N2, S(m(Zt)(m(h))), 1),
            m(h).text ? ($(), A("details", D2, [k("summary", null, S(m(B).receivedReply), 1), k("p", F2, S(m(h).text), 1)])) : G("", !0),
            k("button", {
              type: "button",
              onClick: D[13] || (D[13] = (...j) => m(r).dismissConversationFailure && m(r).dismissConversationFailure(...j))
            }, S(m(B).acknowledge), 1)
          ])) : G("", !0),
          m(va) ? ($(), A("nav", B2, [m(Ft) ? ($(), A("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: D[14] || (D[14] = (...j) => m(ba) && m(ba)(...j))
          }, S(m(ue).newer), 1)) : G("", !0), k("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: D[15] || (D[15] = (...j) => m(zt) && m(zt)(...j))
          }, S(m(ue).latest), 1)])) : G("", !0)
        ], 544),
        m(d)?.person === L.value ? ($(), kt(a1, {
          key: 0,
          phase: m(d).phase,
          "started-at": m(d).startedAt
        }, null, 8, ["phase", "started-at"])) : G("", !0),
        Ue(Kd, {
          modelValue: U.value,
          "onUpdate:modelValue": D[17] || (D[17] = (j) => U.value = j),
          blocked: m(c) || F.value || e.generationActive,
          talking: m(l),
          "can-regenerate": !!Ea.value || st.value,
          retrying: st.value,
          conclusion: _t.value,
          onSend: X,
          onRegenerate: te,
          onContinue: wa,
          onCancel: m(r).cancelTalk
        }, null, 8, [
          "modelValue",
          "blocked",
          "talking",
          "can-regenerate",
          "retrying",
          "conclusion",
          "onCancel"
        ])
      ], 64)) : b.value === "passage" ? ($(), A("p", q2, S(m(se).passages[N.value].body), 1)) : b.value === "arrival" ? ($(), A(ee, { key: 7 }, [
        k("img", {
          class: "ember-story-art",
          src: m($r).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, W2),
        k("p", H2, S(m(B).received), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: Je
        }, S(m(B).resume), 1)
      ], 64)) : b.value === "ending" ? ($(), A(ee, { key: 8 }, [
        k("img", {
          class: "ember-story-art",
          src: m($r).ending,
          alt: "",
          decoding: "async"
        }, null, 8, V2),
        k("h2", null, S(m(B).endingTitle), 1),
        k("p", G2, S(m(B).ending), 1),
        k("p", null, S(m(B).freeTime), 1),
        m(Yr)(m(u)).optionalRoots ? ($(), A("p", Y2, S(m(B).optionalRoots), 1)) : G("", !0),
        ma.value ? ($(), A("strong", Q2, S(m(B).journeyReward(ma.value)), 1)) : G("", !0),
        k("small", null, S(m(B).continued), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: Je
        }, S(m(B).remain), 1)
      ], 64)) : m(u).phase === "reward" ? ($(), kt(Wi, {
        key: 9,
        campaign: m(u),
        blocked: m(c),
        onChoose: D[18] || (D[18] = (j, je) => Fe({
          type: "relic",
          id: j,
          ...je ? { replace: je } : {}
        })),
        onLeave: D[19] || (D[19] = (j) => Fe({ type: "leave" }))
      }, null, 8, ["campaign", "blocked"])) : m(u).phase === "lost" ? ($(), A(ee, { key: 10 }, [
        k("p", K2, S(m(B).fallenDetail), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: m(c),
          onClick: D[20] || (D[20] = (j) => Fe({ type: "retry" }))
        }, S(m(B).retry), 9, X2),
        k("button", {
          type: "button",
          disabled: m(c),
          onClick: D[21] || (D[21] = (j) => Fe({ type: "retreat" }))
        }, S(m(B).retreat), 9, J2)
      ], 64)) : ($(), A(ee, { key: 11 }, [
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!m(s) || e.generationActive,
          onClick: Je
        }, S(m(B).resume), 9, ef),
        k("div", tf, [k("button", {
          type: "button",
          "aria-pressed": w.value,
          onClick: D[22] || (D[22] = (j) => w.value = !w.value)
        }, S(m(B).sound), 9, af)]),
        k("details", null, [
          k("summary", null, S(m(le).controls), 1),
          k("p", nf, S(m(B).controls), 1),
          k("p", rf, S(m(B).touchControls), 1)
        ]),
        k("button", {
          type: "button",
          onClick: Ia
        }, S(m(le).title), 1)
      ], 64))], 10, d2)], 4)) : G("", !0)
    ]));
  }
}), wf = sf;
export {
  wf as default
};
