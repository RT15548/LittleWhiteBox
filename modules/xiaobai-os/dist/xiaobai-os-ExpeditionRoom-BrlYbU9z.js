/* eslint-disable */
import { $ as it, A as Lr, D as De, E as na, I as An, J as ws, M as Pa, N as vr, P as et, Q as Un, R as ft, S as T, T as He, U as je, V as O, W as Gn, X as ue, at as Wa, b as va, c as Ci, ct as Pi, d as wr, dt as ct, ft as E, h as te, i as Ir, l as ys, lt as m, m as $a, nt as Oi, p as Fi, q as xs, r as _s, rt as B, u as Ti, ut as xa, v as Q, x as K, y as R } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as ia } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as Li, r as Nn, t as Ii } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as $i, t as qi } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as Hi } from "./xiaobai-os-constants-CDXgazQ7.js";
import { $ as ya, Bt as $r, Ct as Ui, D as ks, Dt as Gi, E as Et, Et as Ms, Mt as js, O as qr, Ot as Hr, Pt as Ni, Q as xn, Rt as Di, S as Ur, St as Wi, T as Bi, Tt as yr, Wt as ua, _ as Zi, d as Qi, et as Ki, h as Yi, i as Vi, kt as Ji, n as Ss, o as _n, p as xr, rt as _r, s as Xi, ut as Rs, w as eo, wt as un, xt as ao, y as er, zt as to } from "./xiaobai-os-three.module-CEf4RC2U.js";
import { t as As } from "./xiaobai-os-BufferGeometryUtils-Dxy-eeb2.js";
import { $ as Pt, A as kr, B as no, C as zs, D as Jt, E as zn, F as pa, G as ro, H as Xa, I as ar, J as ra, K as so, L as v, M as Ve, N as Dn, O as ie, P as tr, Q as Oe, R as _a, S as Xt, T as Gr, U as Oa, V as io, W as be, X as Va, Y as J, Z as Es, _ as oo, a as Ba, at as lo, b as co, c as Me, ct as ho, d as nr, et as Cs, f as Wn, g as Ps, h as Os, i as ot, it as Fs, j as Mr, k as uo, l as D, lt as Ts, m as po, n as rr, nt as fo, o as Ka, ot as Ge, p as bo, q as Ls, r as zt, rt as mo, s as go, st as Is, t as oe, tt as vo, u as en, v as wo, w as jr, x as $s, y as lt, z as qs } from "./xiaobai-os-copy-_MN2tyQS.js";
import { n as yo, t as xo } from "./xiaobai-os-SkeletonUtils-C1GE4stQ.js";
import { t as _o } from "./xiaobai-os-GLTFLoader-cY1YnDku.js";
function En(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Nr(e, a, r) {
  const t = [...a], n = [];
  for (; t.length && n.length < r; ) n.push(t.splice(Math.floor(En(e) * t.length), 1)[0]);
  return n;
}
function Bn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function ge(e, a) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...a === void 0 ? {} : { cause: a }
  });
}
function Ue(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var ko = 1e-9;
function dt(e, a, r) {
  return {
    x: e.origin.x + (a + 0.5) * e.cellSize,
    y: e.origin.y + (r + 0.5) * e.cellSize
  };
}
function ht(e, a) {
  return {
    column: Math.floor((a.x - e.origin.x) / e.cellSize),
    row: Math.floor((a.y - e.origin.y) / e.cellSize)
  };
}
function Hs(e, a) {
  const r = e.rows[0]?.length ?? 0, t = e.rows.length;
  (!r || !t || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((c) => c.length !== r || /[^.# ]/.test(c))) && Ue("map_invalid");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const c of e.gates) {
    (!c.id || n.has(c.id) || !c.cells.length) && Ue("map_invalid"), n.add(c.id);
    const i = !a.has(c.id);
    i && l.add(c.id);
    for (const { column: h, row: u } of c.cells) {
      (!Number.isInteger(h) || !Number.isInteger(u) || h < 0 || h >= r || e.rows[u]?.[h] !== ".") && Ue("map_invalid");
      const d = u * r + h;
      s.has(d) && Ue("map_invalid"), s.add(d), i && o.add(d);
    }
  }
  for (const c of a) n.has(c) || Ue("gate_unknown");
  return {
    map: e,
    columns: r,
    rows: t,
    closedGates: l,
    blocked(c, i) {
      return c < 0 || c >= r || i < 0 || i >= t || e.rows[i][c] !== "." || o.has(i * r + c);
    }
  };
}
function kn(e, a, r, t) {
  const n = Math.max(a - e.x, 0, e.x - a - t), s = Math.max(r - e.y, 0, e.y - r - t);
  return n * n + s * s;
}
function pn(e, a, r) {
  const t = r.x - a.x, n = r.y - a.y, s = t * t + n * n, o = s === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - a.x) * t + (e.y - a.y) * n) / s));
  return (e.x - a.x - t * o) ** 2 + (e.y - a.y - n * o) ** 2;
}
function Us(e, a, r, t, n) {
  let s = 0, o = 1;
  for (const [l, c, i] of [[
    e.x,
    a.x - e.x,
    r
  ], [
    e.y,
    a.y - e.y,
    t
  ]]) if (c === 0) {
    if (l <= i || l >= i + n) return !1;
  } else {
    const h = (i - l) / c, u = (i + n - l) / c;
    if (s = Math.max(s, Math.min(h, u)), o = Math.min(o, Math.max(h, u)), s >= o) return !1;
  }
  return s < o;
}
function Mo(e, a, r, t, n) {
  return Us(e, a, r, t, n) ? 0 : Math.min(kn(e, r, t, n), kn(a, r, t, n), pn({
    x: r,
    y: t
  }, e, a), pn({
    x: r + n,
    y: t
  }, e, a), pn({
    x: r,
    y: t + n
  }, e, a), pn({
    x: r + n,
    y: t + n
  }, e, a));
}
function Be(e, a, r, t = 0) {
  (![
    a.x,
    a.y,
    r.x,
    r.y,
    t
  ].every(Number.isFinite) || t < 0) && Ue("input_invalid");
  const { map: n } = e, s = n.cellSize, o = ht(n, {
    x: Math.min(a.x, r.x) - t,
    y: Math.min(a.y, r.y) - t
  }), l = ht(n, {
    x: Math.max(a.x, r.x) + t,
    y: Math.max(a.y, r.y) + t
  });
  for (let c = o.row; c <= l.row; c++) for (let i = o.column; i <= l.column; i++) {
    if (!e.blocked(i, c)) continue;
    const h = n.origin.x + i * s, u = n.origin.y + c * s;
    if (t === 0 ? Us(a, r, h, u, s) || kn(a, h, u, s) === 0 && kn(r, h, u, s) === 0 : Mo(a, r, h, u, s) < t * t - ko) return !1;
  }
  return !0;
}
var Fa = (e, a, r) => Be(e, a, a, r);
function Sr(e, a, r, t) {
  [r.x, r.y].every(Number.isFinite) || Ue("input_invalid"), Fa(e, a, t) || Ue("position_blocked");
  const n = Math.hypot(r.x, r.y);
  if (n === 0) return;
  const s = Math.ceil(n / (e.map.cellSize / 4)), o = r.x / s, l = r.y / s;
  for (let c = 0; c < s; c++) {
    const i = {
      x: a.x + o,
      y: a.y + l
    };
    if (Be(e, a, i, t)) {
      Object.assign(a, i);
      continue;
    }
    const h = Math.abs(o) >= Math.abs(l) ? ["x", "y"] : ["y", "x"];
    for (const u of h) {
      const d = {
        ...a,
        [u]: a[u] + (u === "x" ? o : l)
      };
      Be(e, a, d, t) && Object.assign(a, d);
    }
  }
}
function gn(e, a) {
  return e.x >= a.x - a.width / 2 && e.x < a.x + a.width / 2 && e.y >= a.z - a.depth / 2 && e.y < a.z + a.depth / 2;
}
function we(e) {
  const { landscape: a } = e, { bounds: r } = a, t = {
    x: r.x - r.width / 2,
    y: r.z - r.depth / 2
  }, n = [
    r,
    ...a.features.map((h) => h.footprint),
    ...a.gates.map((h) => h.footprint)
  ];
  n.some((h) => ![
    h.x,
    h.z,
    h.width,
    h.depth
  ].every(Number.isFinite) || h.width <= 0 || h.depth <= 0 || ![
    h.x - h.width / 2,
    h.z - h.depth / 2,
    h.width,
    h.depth
  ].every(Number.isInteger)) && Ue("map_invalid");
  const s = a.features.map((h) => h.id);
  new Set(s).size !== s.length && Ue("map_invalid"), a.features.some((h) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root",
    "kiln",
    "hoist",
    "cliff"
  ].includes(h.kind) && (h.height === void 0 || !Number.isFinite(h.height) || h.height <= 0)) && Ue("map_invalid");
  for (const h of n.slice(1)) (h.x - h.width / 2 < t.x || h.z - h.depth / 2 < t.y || h.x + h.width / 2 > t.x + r.width || h.z + h.depth / 2 > t.y + r.depth) && Ue("map_invalid");
  a.roads.some((h) => !Number.isFinite(h.width) || h.width <= 0 || h.points.length < 2 || h.points.some(([u, d], f) => !Number.isFinite(u) || !Number.isFinite(d) || f > 0 && u === h.points[f - 1][0] && d === h.points[f - 1][1])) && Ue("map_invalid");
  const o = [];
  for (let h = 0; h < r.depth; h++) {
    let u = "";
    for (let d = 0; d < r.width; d++) {
      const f = {
        x: t.x + d + 0.5,
        y: t.y + h + 0.5
      };
      u += a.features.some((b) => b.kind !== "arch" && gn(f, b.footprint) && (b.kind !== "bridge" || Math.abs(f.y - b.footprint.z) >= b.footprint.depth / 2 - 1)) ? "#" : ".";
    }
    o.push(u);
  }
  const l = {
    origin: t,
    cellSize: 1,
    rows: o,
    gates: a.gates.map((h) => {
      const u = h.footprint, d = [];
      for (let f = u.z - u.depth / 2 - t.y; f < u.z + u.depth / 2 - t.y; f++) for (let b = u.x - u.width / 2 - t.x; b < u.x + u.width / 2 - t.x; b++) d.push({
        column: b,
        row: f
      });
      return {
        id: h.id,
        cells: d
      };
    })
  }, c = Hs(l, new Set(l.gates.map((h) => h.id)));
  Object.values(e.anchors).some((h) => !Fa(c, h, J.playerRadius)) && Ue("map_invalid");
  const i = /* @__PURE__ */ new Set();
  for (const h of [...e.exits, ...e.objects])
    (!e.anchors[h.anchor] || i.has(h.id)) && Ue("map_invalid"), i.add(h.id);
  return {
    ...e,
    map: l,
    gates: a.gates
  };
}
var jo = we({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(Dn.map((e) => [e.to, e.position])),
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
    ...Dn.map((e) => ({
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
    jr.object
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
      v("clinic", "clinic", -19, 4, 14, 10),
      v("storehouse", "storehouse", 12, -9, 12, 12),
      v("hearth", "stove", 0, 6, 4, 4),
      v("rest-bench", "bench", -5, 15, 2, 4),
      v("wagon", "wagon", 22, 3, 4, 6),
      v("supply-crates", "supplies", 20, -5, 4, 4),
      v("drying-shed", "workshop", -29, 0, 4, 10, { height: 3.5 }),
      v("herbs-small", "medicine", -23, 10, 6, 2),
      v("menders-home", "dwelling", -12, 20, 4, 4, {
        height: 3.3,
        tint: "rose"
      }),
      v("eastern-home", "dwelling", 15, 20, 4, 4, { height: 4.1 }),
      v("wall-home", "dwelling", -31, -12, 4, 4, { height: 5 }),
      v("charcoal-home", "dwelling", 34, -16, 4, 4, { height: 4.7 }),
      v("pipe-home", "dwelling", -16, -19, 4, 4, { height: 3.8 }),
      v("canal-west", "water", -26, -28, 44, 4),
      v("canal-east", "water", 26, -28, 44, 4),
      v("bridge-west", "wall", -5, -28, 2, 6, { height: 0.8 }),
      v("bridge-east", "wall", 5, -28, 2, 6, { height: 0.8 }),
      v("gate-west", "wall", -26, -49, 44, 4, { height: 6 }),
      v("gate-east", "wall", 26, -49, 44, 4, { height: 6 }),
      v("west-watchtower", "tower", -8, -49, 6, 8, { height: 12 }),
      v("east-watchtower", "tower", 8, -49, 6, 8, { height: 12 }),
      v("departure-arch", "arch", 0, -49, 10, 4, { height: 8 }),
      v("west-boundary", "wall", -37, -26, 2, 62, {
        height: 7,
        wallUse: "homes"
      }),
      v("postern-bottom", "wall", -37, 25, 2, 32, {
        height: 7,
        wallUse: "homes"
      }),
      v("south-boundary", "wall", 0, 40, 96, 4, { height: 1 }),
      v("east-boundary", "wall", 46, -8, 4, 96, { height: 1.2 }),
      v("postern-end", "wall", -47, -8, 2, 100, { height: 2.4 }),
      v("north-boundary", "wall", 0, -57, 96, 2, { height: 5 }),
      v("roadside-workshop", "workshop", -17, -38, 16, 8, { height: 4 }),
      v("lookout-ruin", "ruin", 24, -38, 6, 6, { height: 3 }),
      v("arrival-home", "dwelling", -27, 28, 6, 6, { height: 4.3 }),
      v("eastern-workshop", "workshop", 28, 30, 6, 6, { height: 3.7 }),
      v("wall-row", "dwelling", -24, -21, 18, 4, { height: 4.5 }),
      v("roadside-homes", "dwelling", -8, -12, 4, 10, { height: 4.2 }),
      v("clinic-back-shed", "workshop", -20, -5, 16, 2, { height: 2.6 })
    ].map((e) => Dn.some((a) => a.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), So = we({
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
      v("wall-west", "wall", -30, -32, 2, 32, { height: 3 }),
      v("wall-west-low", "wall", -30, 19, 2, 58, { height: 2 }),
      v("wall-east", "wall", 24, -25, 4, 44, { height: 7 }),
      v("rampart-tower", "tower", 24, -16, 8, 8, { height: 15 }),
      v("gate-tower-left", "tower", -8, -41, 6, 8, { height: 11 }),
      v("gate-tower-right", "tower", 8, -41, 6, 8, { height: 11 }),
      v("north-arch", "arch", 0, -41, 10, 4, { height: 8 }),
      v("west-gate-wall", "wall", -26, -43, 40, 4, { height: 5 }),
      v("east-gate-wall", "wall", 36, -43, 20, 4, { height: 5 }),
      v("road-ruin", "ruin", -12, 1, 6, 6, { height: 3.5 }),
      v("fallen-column", "ruin", 12, -2, 4, 4, { height: 1.2 }),
      v("road-tree", "tree", -17, 27, 4, 4, {
        height: 9,
        tint: "amber"
      }),
      v("roots-tree", "tree", -39, -25, 6, 6, {
        height: 13,
        tint: "sage"
      }),
      v("southern-tree", "tree", 17, 37, 4, 4, {
        height: 9,
        tint: "sage"
      }),
      v("arrival-watch-west", "tower", -8, 44, 6, 8, { height: 10 }),
      v("arrival-watch-east", "tower", 8, 44, 6, 8, { height: 10 }),
      v("arrival-arch", "arch", 0, 44, 10, 4, { height: 8 }),
      v("broken-convoy", "wagon", -12, 19, 4, 6, { damaged: !0 }),
      v("convoy-supplies", "supplies", -16, 16, 4, 4),
      v("stranded-cargo", "cargo", -24, 28, 8, 12),
      v("stranded-fuel", "fuel", 18, 25, 6, 8),
      v("old-border", "thicket", -18, -6, 14, 4),
      v("waterway-bank", "water", 37, 21, 22, 16),
      v("north-boundary", "wall", 0, -47, 96, 2, { height: 5 }),
      v("south-boundary-west", "wall", -26, 47, 44, 2, { height: 5 }),
      v("south-boundary-east", "wall", 26, 47, 44, 2, { height: 5 }),
      v("west-boundary", "wall", -47, 0, 2, 96, { height: 2 }),
      v("east-boundary", "wall", 47, 0, 2, 96, { height: 2 })
    ]
  }
}), Ro = we({
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
      v("outer-west", "wall", -35, 0, 2, 80, { height: 8 }),
      v("outer-east", "wall", 35, 0, 2, 80, { height: 8 }),
      v("north-wall", "wall", 0, -39, 72, 2, { height: 9 }),
      v("south-wall", "wall", 0, 39, 72, 2, { height: 5 }),
      v("gate-tower-west", "tower", -10, -27, 8, 12, { height: 16 }),
      v("gate-tower-east", "tower", 10, -27, 8, 12, { height: 16 }),
      v("main-arch", "arch", 0, -27, 12, 6, { height: 12 }),
      v("gate-flank-west", "wall", -25, -27, 22, 6, { height: 9 }),
      v("gate-flank-east", "wall", 25, -27, 22, 6, { height: 9 }),
      v("west-pillars", "ruin", -13, -3, 6, 4, { height: 4.8 }),
      v("east-pillars", "ruin", 13, -3, 6, 4, { height: 4.8 }),
      v("western-barracks", "storehouse", -25, 2, 12, 12),
      v("eastern-barracks", "storehouse", 25, 2, 12, 12),
      v("awaiting-inspection", "cargo", -15, 23, 4, 12),
      v("cleared-consignments", "cargo", 15, 23, 4, 12),
      v("inspection-cart", "wagon", 25, 19, 4, 6),
      v("inspection-crates", "supplies", 28, 25, 4, 4),
      v("barracks-tree", "tree", -27, 26, 4, 4, {
        height: 9,
        tint: "amber"
      })
    ]
  }
}), Ao = we({
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
      v("west-parapet", "wall", -35, 0, 2, 84, { height: 3 }),
      v("east-parapet", "wall", 35, 0, 2, 84, { height: 3 }),
      v("north-wall", "wall", 0, -41, 72, 2, { height: 9 }),
      v("south-wall", "wall", 0, 41, 72, 2, { height: 5 }),
      v("signal-brazier", "beacon", 0, -8, 6, 6),
      v("west-signal-column", "column", -20, -10, 4, 4, { height: 11 }),
      v("east-signal-column", "column", 20, -10, 4, 4, { height: 11 }),
      v("west-approach-column", "column", -20, 12, 4, 4, { height: 8 }),
      v("east-approach-column", "column", 20, 12, 4, 4, { height: 8 }),
      v("hall-tower-west", "tower", -10, -30, 8, 8, { height: 16 }),
      v("hall-tower-east", "tower", 10, -30, 8, 8, { height: 16 }),
      v("hall-arch", "arch", 0, -30, 12, 4, { height: 12 }),
      v("signal-fuel", "fuel", -27, 19, 8, 22),
      v("signal-reserve", "cargo", 27, 19, 8, 22),
      v("west-copper-store", "supplies", -26, -23, 6, 6),
      v("east-copper-store", "supplies", 26, -23, 6, 6)
    ]
  }
}), zo = we({
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
      v("west-wall", "wall", -31, 0, 2, 88, { height: 7 }),
      v("east-wall", "wall", 31, 0, 2, 88, { height: 7 }),
      v("north-wall", "wall", 0, -43, 64, 2, { height: 8 }),
      v("south-wall", "wall", 0, 43, 64, 2, { height: 8 }),
      v("upper-channel-west", "water", -24, -3, 12, 58),
      v("upper-channel-east", "water", 23, -12, 14, 48),
      v("lower-channel-west", "water", -13, 32, 30, 20),
      v("lower-channel-east", "water", 28, 32, 4, 20),
      v("sluice-west-abutment", "wall", -18, 16, 24, 4, { height: 5 }),
      v("sluice-east-abutment", "wall", 18, 16, 24, 4, { height: 5 }),
      v("upper-pier-west", "column", -15, -18, 4, 4, { height: 9 }),
      v("upper-pier-east", "column", 11, -18, 4, 4, { height: 9 }),
      v("lower-pier-west", "column", -13, 0, 4, 4, { height: 9 }),
      v("lower-pier-east", "column", 13, 0, 4, 4, { height: 9 }),
      v("vault-north", "arch", -2, -18, 26, 2, { height: 10 }),
      v("vault-middle", "arch", 0, 0, 26, 2, { height: 10 }),
      v("entry-marker", "ruin", -24, -39, 6, 2, { height: 5 }),
      v("maintenance-supplies", "supplies", 8, 36, 4, 4)
    ]
  }
}), Eo = we({
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
      v("west-wall", "wall", -31, 0, 2, 76, { height: 6 }),
      v("east-wall", "wall", 31, 0, 2, 76, { height: 6 }),
      v("north-wall", "wall", 0, -37, 64, 2, { height: 8 }),
      v("south-wall", "wall", 0, 37, 64, 2, { height: 6 }),
      v("cells-divider", "wall", 0, -24, 2, 28, { height: 6 }),
      v("cells-front-center", "wall", 0, -10, 20, 2, { height: 6 }),
      v("cells-front-west", "wall", -26, -10, 12, 2, { height: 6 }),
      v("cells-front-east", "wall", 26, -10, 12, 2, { height: 6 }),
      v("postern-divider", "wall", -7, 24, 50, 2, { height: 5 }),
      v("waterway-passage", "arch", -21, 19, 10, 2, { height: 7 }),
      v("postern-corridor", "wall", 17, 31, 2, 12, { height: 5 }),
      v("west-bunk", "bunk", -26, -24, 4, 8),
      v("east-bunk", "bunk", 26, -24, 4, 8),
      v("west-cell-bench", "bench", -8, -30, 2, 4),
      v("east-cell-bench", "bench", 8, -30, 2, 4),
      v("guard-desk", "ledger", 3, 12, 4, 4),
      v("hall-pier-west", "column", -7, -4, 2, 2, { height: 7 }),
      v("hall-pier-east", "column", 7, -4, 2, 2, { height: 7 })
    ]
  }
}), Co = we({
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
      condition: { all: lt }
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
      v("west-wall", "wall", -39, 0, 2, 92, { height: 11 }),
      v("east-wall", "wall", 39, 0, 2, 92, { height: 11 }),
      v("north-wall", "wall", 0, -45, 80, 2, { height: 13 }),
      v("south-wall", "wall", 0, 45, 80, 2, { height: 8 }),
      v("western-front-column", "column", -15, 17, 4, 4, { height: 12 }),
      v("eastern-front-column", "column", 15, 17, 4, 4, { height: 12 }),
      v("western-middle-column", "column", -15, -3, 4, 4, { height: 12 }),
      v("eastern-middle-column", "column", 15, -3, 4, 4, { height: 12 }),
      v("western-rear-column", "column", -15, -25, 4, 4, { height: 12 }),
      v("eastern-rear-column", "column", 15, -25, 4, 4, { height: 12 }),
      v("entry-vault", "arch", 0, 17, 30, 2, { height: 14 }),
      v("rear-vault", "arch", 0, -25, 30, 2, { height: 14 }),
      v("west-gallery", "planter", -32, 4, 6, 28),
      v("east-gallery", "planter", 32, 4, 6, 28),
      v("west-gallery-bench", "bench", -28, 28, 2, 6),
      v("east-gallery-bench", "bench", 28, 28, 2, 6),
      v("crown-console", "ledger", 0, -41, 6, 4),
      v("northern-west-pillar", "column", -29, -35, 4, 4, { height: 14 }),
      v("northern-east-pillar", "column", 29, -35, 4, 4, { height: 14 })
    ]
  }
}), Po = we({
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
      v("west-enclosure", "wall", -39, 0, 2, 84, { height: 3 }),
      v("east-enclosure", "wall", 39, 0, 2, 84, { height: 3 }),
      v("north-enclosure", "wall", 0, -41, 80, 2, { height: 4 }),
      v("south-enclosure", "wall", 0, 41, 80, 2, { height: 3 }),
      v("dead-heartwood", "root", 0, -29, 12, 10, { height: 17 }),
      v("western-root", "root", -22, -15, 8, 4, { height: 3.8 }),
      v("eastern-root", "root", 22, -11, 8, 4, { height: 3.2 }),
      v("west-reflecting-pool", "water", -26, 9, 12, 16),
      v("east-reflecting-pool", "water", 26, 9, 12, 16),
      v("west-old-colonnade", "ruin", -15, 7, 4, 4, { height: 5 }),
      v("east-old-colonnade", "ruin", 15, 9, 4, 4, { height: 4 }),
      v("western-growth", "thicket", -29, -27, 14, 12),
      v("eastern-growth", "thicket", 29, -27, 14, 12),
      v("west-entry-pillar", "column", -7, 30, 4, 4, { height: 7 }),
      v("east-entry-pillar", "column", 7, 30, 4, 4, { height: 7 }),
      v("garden-arch", "arch", 0, 30, 14, 2, { height: 9 }),
      v("west-entry-tree", "tree", -21, 29, 6, 6, {
        height: 12,
        tint: "rose"
      }),
      v("east-entry-tree", "tree", 23, 29, 6, 6, {
        height: 12,
        tint: "sage"
      }),
      v("west-north-tree", "tree", -18, -33, 6, 6, {
        height: 14,
        tint: "sage"
      }),
      v("east-north-tree", "tree", 18, -33, 6, 6, {
        height: 14,
        tint: "rose"
      })
    ]
  }
}), Oo = Object.fromEntries(Object.entries(tr).map(([e, a]) => {
  const r = a, { width: t, depth: n } = r, s = t / 2, o = n / 2, l = [v("west-wall", "wall", -s + 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  }), v("east-wall", "wall", s - 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const i of ["north", "south"]) {
    const h = (i === "north" ? -1 : 1) * (o - 0.5);
    if (r.doors.some((u) => u.side === i)) {
      l.push(v(`${i}-door`, "door", 0, h, 4, 1));
      for (const u of [-1, 1]) l.push(v(`${i}-${u}`, "wall", u * (s + 2) / 2, h, s - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else l.push(v(`${i}-wall`, "wall", 0, h, t, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const c = r.rest ? r.furniture.find((i) => i.kind === "bed").footprint : null;
  return [e, we({
    id: e,
    safe: !0,
    anchors: {
      settle: {
        x: 0,
        y: 1
      },
      ...r.anchors,
      ...c ? { rest: {
        x: c.x + c.width / 2 + 1,
        y: c.z
      } } : {},
      ...Object.fromEntries(r.doors.map((i) => [i.side, {
        x: 0,
        y: (i.side === "north" ? -1 : 1) * (o - 2)
      }]))
    },
    exits: r.doors.map((i) => ({
      id: i.side,
      anchor: i.side,
      to: i.to,
      arrival: i.arrival,
      doorway: !0,
      ...i.condition ? { condition: i.condition } : {}
    })),
    objects: [...r.objects ?? [], ...c ? [{
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }] : []],
    landscape: {
      bounds: {
        x: 0,
        z: 0,
        width: t,
        depth: n
      },
      vista: "room",
      surface: "boards",
      roads: [],
      gates: [],
      features: [...l, ...r.furniture]
    }
  })];
})), Fo = we({
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
      v("wen-house", "dwelling", -20, -31, 20, 12, {
        height: 6.8,
        tint: "rose",
        entrance: !0,
        facing: "south"
      }),
      v("audit-house", "workshop", -20, 0, 18, 8, {
        height: 6,
        tint: "sage",
        entrance: !0,
        facing: "south"
      }),
      v("inn-house", "dwelling", 18, 10, 18, 12, {
        height: 6.8,
        tint: "amber",
        entrance: !0,
        facing: "south"
      }),
      v("north-homes", "dwelling", 24, -29, 20, 16, {
        height: 6.2,
        tint: "sage",
        facing: "west"
      }),
      v("south-homes", "dwelling", -25, 29, 20, 20, {
        height: 6.5,
        tint: "amber",
        facing: "east"
      }),
      v("tea-front", "workshop", -11, 21, 6, 8, {
        height: 3.6,
        tint: "rose",
        facing: "east"
      }),
      v("bread-stall", "workshop", 7, 30, 6, 4, {
        height: 3.2,
        tint: "amber",
        facing: "north"
      }),
      v("north-stall", "workshop", 8, -29, 6, 4, {
        height: 3.3,
        tint: "sage",
        facing: "south"
      }),
      v("street-planter", "planter", -8, 13, 2, 4),
      v("inn-laundry", "basin", 26, 19, 2, 2),
      v("hot-water-stall", "stove", 10, -18, 4, 4),
      v("notice-board", "ledger", 8, -24, 4, 2),
      v("tea-bench", "bench", -8, 26, 2, 2),
      v("stall-crates", "supplies", 13, 29, 4, 4),
      v("plane-tree", "tree", -11, -13, 4, 4, {
        height: 10,
        tint: "amber"
      }),
      v("street-arch", "arch", 0, 37, 14, 2, { height: 13 }),
      v("west-boundary", "wall", -37, 0, 2, 88, {
        height: 7,
        wallUse: "homes"
      }),
      v("east-boundary", "wall", 37, 0, 2, 88, {
        height: 7,
        wallUse: "homes"
      }),
      v("north-boundary", "wall", 0, -43, 76, 2, { height: 8 }),
      v("south-boundary", "wall", 0, 43, 76, 2, { height: 7 })
    ]
  }
}), To = we({
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
      v("transfer-office", "workshop", -20, -29, 20, 12, {
        height: 6.5,
        tint: "sage",
        entrance: !0,
        facing: "south"
      }),
      v("dormitory", "dwelling", 21, 29, 20, 12, {
        height: 6.5,
        tint: "amber",
        entrance: !0,
        facing: "north"
      }),
      v("pipe-workshop", "workshop", 25, -27, 20, 14, {
        height: 7,
        tint: "amber",
        facing: "south"
      }),
      v("pipe-stock", "cargo", 23, -14, 4, 6),
      v("worktable", "workbench", 18, -7, 6, 2),
      v("western-homes", "dwelling", -26, -3, 18, 14, {
        height: 6.5,
        tint: "rose",
        facing: "east"
      }),
      v("southern-homes", "dwelling", -24, 30, 22, 12, {
        height: 6,
        tint: "sage",
        facing: "north"
      }),
      v("cobbler", "workshop", -12, -3, 6, 6, {
        height: 3.4,
        tint: "sage",
        facing: "east"
      }),
      v("workshop-fuel", "fuel", 9, -24, 4, 4),
      v("water-stove", "stove", -13, 20, 2, 2),
      v("bench", "bench", -12, 13, 4, 2),
      v("echo-water-north", "water", 0, 27, 6, 4),
      v("echo-water-south", "water", 0, 35, 6, 4),
      v("echo-bridge", "bridge", 0, 31, 10, 4),
      v("west-wall", "wall", -39, 0, 2, 84, {
        height: 7,
        wallUse: "homes"
      }),
      v("east-wall", "wall", 39, 0, 2, 84, {
        height: 7,
        wallUse: "homes"
      }),
      v("north-wall", "wall", 0, -41, 80, 2, { height: 10 }),
      v("south-wall", "wall", 0, 41, 80, 2, {
        height: 7,
        wallUse: "homes"
      })
    ]
  }
}), Lo = we({
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
      v("plan-table", "ledger", 18, -7, 6, 4),
      v("tool-rack", "toolrack", 22, -16, 6, 2),
      v("notice-desk", "ledger", -18, 10, 4, 2),
      v("bench", "bench", -20, -13, 2, 6),
      v("west-boiler", "tower", -20, -24, 8, 8, { height: 10 }),
      v("east-boiler", "tower", 20, -26, 10, 8, { height: 13 }),
      v("entry-column", "column", 7, 17, 4, 4, { height: 9 }),
      v("work-arch", "arch", 0, -22, 18, 2, { height: 12 }),
      v("west-wall", "wall", -31, 0, 2, 72, { height: 8 }),
      v("east-wall", "wall", 31, 0, 2, 72, { height: 8 }),
      v("north-wall", "wall", 0, -35, 64, 2, { height: 12 }),
      v("south-wall", "wall", 0, 35, 64, 2, { height: 7 })
    ]
  }
}), Io = we({
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
      v("west-wall", "wall", -23, 0, 2, 72, { height: 9 }),
      v("east-wall", "wall", 23, 0, 2, 72, { height: 9 }),
      v("north-wall", "wall", 0, -35, 48, 2, { height: 9 }),
      v("south-wall", "wall", 0, 35, 48, 2, { height: 9 }),
      v("west-block", "column", -14, 9, 4, 6, { height: 7 }),
      v("east-block", "column", 13, -7, 4, 6, { height: 7 }),
      v("west-water", "water", -20, -9, 2, 40),
      v("east-water", "water", 20, 9, 2, 40),
      v("entry-arch", "arch", 0, 25, 20, 2, { height: 9 })
    ]
  }
}), $o = we({
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
      v("west-channel", "water", -23, 0, 10, 60),
      v("east-channel", "water", 23, 0, 10, 60),
      v("west-pier", "column", -12, 4, 4, 4, { height: 7 }),
      v("east-pier", "column", 12, -5, 4, 4, { height: 7 }),
      v("west-wall", "wall", -29, 0, 2, 76, { height: 6 }),
      v("east-wall", "wall", 29, 0, 2, 76, { height: 6 }),
      v("north-wall", "wall", 0, -37, 60, 2, { height: 7 }),
      v("south-wall", "wall", 0, 37, 60, 2, { height: 7 }),
      v("bridge-arch", "arch", 0, -22, 28, 2, { height: 13 })
    ]
  }
}), qo = we({
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
      v("main-console", "ledger", 0, -37, 10, 4),
      v("left-cylinder", "tower", -26, -29, 8, 12, { height: 14 }),
      v("right-cylinder", "tower", 26, -29, 8, 12, { height: 14 }),
      v("west-cover", "column", -12, 0, 4, 6, { height: 8 }),
      v("east-cover", "column", 12, 0, 4, 6, { height: 8 }),
      v("west-wall", "wall", -33, 0, 2, 84, { height: 12 }),
      v("east-wall", "wall", 33, 0, 2, 84, { height: 12 }),
      v("north-wall", "wall", 0, -41, 68, 2, { height: 14 }),
      v("south-wall", "wall", 0, 41, 68, 2, { height: 9 })
    ]
  }
}), Ho = we({
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
      v("trade-box", "supplies", -14, 2, 4, 4),
      v("water", "water", 9, 7, 8, 24),
      v("winch", "toolrack", -7, -23, 4, 2),
      v("west-ruin", "ruin", -14, -15, 6, 8, { height: 5 }),
      v("east-ruin", "ruin", 15, -29, 10, 6, { height: 5 }),
      v("south-column", "column", 10, 25, 4, 4, { height: 7 }),
      v("west-wall", "wall", -23, 0, 2, 72, { height: 7 }),
      v("east-wall", "wall", 23, 0, 2, 72, { height: 7 }),
      v("north-wall", "wall", 0, -35, 48, 2, { height: 7 }),
      v("south-wall", "wall", 0, 35, 48, 2, { height: 7 })
    ]
  }
}), Uo = we({
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
      v("west-fuel", "fuel", -23, -9, 8, 30),
      v("east-fuel", "fuel", 23, -9, 8, 30),
      v("cover", "cargo", -9, 2, 4, 4),
      v("north-fuel", "fuel", 0, -32, 18, 4),
      v("west-wall", "wall", -29, 0, 2, 72, { height: 7 }),
      v("east-wall", "wall", 29, 0, 2, 72, { height: 7 }),
      v("north-wall", "wall", 0, -35, 60, 2, { height: 9 }),
      v("south-wall", "wall", 0, 35, 60, 2, { height: 7 })
    ]
  }
}), Go = {
  south_street: Fo,
  workshop_street: To,
  heat_station: Lo,
  pipe_gallery: Io,
  sluice_bridge: $o,
  main_valve: qo,
  deep_waterway: Ho,
  coal_store: Uo
}, Ne = {
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
}, bt = Object.keys(Ne), No = we({
  id: "furnace_terrace",
  safe: !0,
  anchors: {
    south: {
      x: 0,
      y: 30
    },
    snow_road: {
      x: -28,
      y: 4
    },
    furnace_quarter: {
      x: 28,
      y: -12
    },
    offer: {
      x: 0,
      y: -13
    },
    rest: {
      x: -12,
      y: 20
    }
  },
  exits: [
    {
      id: "heat_station",
      anchor: "south",
      to: "heat_station",
      arrival: "furnace_terrace"
    },
    {
      id: "snow_road",
      anchor: "snow_road",
      to: "snow_road",
      arrival: "south",
      condition: { all: ["division_plan_known"] }
    },
    {
      id: "furnace_quarter",
      anchor: "furnace_quarter",
      to: "furnace_quarter",
      arrival: "south",
      condition: { all: ["division_works_started"] }
    }
  ],
  objects: [{
    id: "furnace_offer",
    anchor: "offer",
    kind: "inspect",
    passage: "furnace_offer"
  }, {
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 72,
      depth: 76
    },
    vista: "furnace",
    surface: "marble",
    gates: [],
    roads: [{
      points: [
        [0, 33],
        [0, 7],
        [0, -13]
      ],
      width: 10
    }, {
      points: [
        [-30, 4],
        [0, 4],
        [30, -12]
      ],
      width: 6
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -22,
        9,
        -24
      ],
      to: [
        -22,
        9,
        23
      ]
    }, {
      kind: "pipe",
      from: [
        22,
        9,
        -24
      ],
      to: [
        22,
        9,
        23
      ]
    }],
    features: [
      v("banquet-table", "table", 0, -20, 10, 4),
      v("empty-chair", "chair", 0, -17, 2, 2),
      v("west-brazier", "stove", -12, -17, 4, 4),
      v("east-brazier", "stove", 12, -17, 4, 4),
      v("west-riser", "kiln", -22, -24, 6, 6, { height: 18 }),
      v("east-riser", "kiln", 22, -24, 6, 6, { height: 18 }),
      v("south-west", "hoist", -22, 23, 4, 4, { height: 13 }),
      v("south-east", "hoist", 22, 23, 4, 4, { height: 13 }),
      v("north-parapet", "wall", 0, -37, 72, 2, { height: 1.6 }),
      v("west-parapet", "wall", -35, 0, 2, 76, { height: 1.6 }),
      v("east-parapet", "wall", 35, 0, 2, 76, { height: 1.6 }),
      v("lower-arch", "arch", 0, 29, 20, 2, { height: 13 })
    ]
  }
}), Do = we({
  id: "snow_road",
  safe: !1,
  anchors: {
    south: {
      x: 0,
      y: 37
    },
    north: {
      x: 0,
      y: -37
    },
    encounter: {
      x: 0,
      y: 12
    },
    left: {
      x: -10,
      y: -12
    },
    right: {
      x: 10,
      y: -14
    },
    front: {
      x: 0,
      y: -7
    },
    rear: {
      x: 0,
      y: -25
    },
    rest: {
      x: -9,
      y: 31
    }
  },
  exits: [{
    id: "furnace_terrace",
    anchor: "south",
    to: "furnace_terrace",
    arrival: "snow_road"
  }, {
    id: "old_kiln",
    anchor: "north",
    to: "old_kiln",
    arrival: "south",
    condition: { all: ["snow_road_cleared"] }
  }],
  objects: [{
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 56,
      depth: 88
    },
    vista: "snow",
    surface: "snow",
    gates: [],
    roads: [{
      points: [
        [0, 40],
        [-7, 20],
        [5, -3],
        [-3, -20],
        [0, -40]
      ],
      width: 8
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -23,
        3,
        39
      ],
      to: [
        -23,
        3,
        -39
      ]
    }],
    features: [
      v("west-ridge", "cliff", -27, 0, 2, 88, { height: 4 }),
      v("east-ridge", "cliff", 27, 0, 2, 88, { height: 4 }),
      v("shelter", "ruin", -16, 28, 8, 6),
      v("abandoned-cart", "wagon", 17, 22, 6, 10),
      v("cracked-pier", "column", -14, 0, 4, 6, { height: 5 }),
      v("fallen-post", "ruin", 15, -22, 6, 8),
      v("old-pipe-root", "root", -20, -24, 4, 8, { height: 5 }),
      v("north-arch", "arch", 0, -34, 22, 2, { height: 10 })
    ]
  }
}), Wo = we({
  id: "old_kiln",
  safe: !1,
  anchors: {
    south: {
      x: 0,
      y: 34
    },
    cargo: {
      x: 24,
      y: 25
    },
    encounter: {
      x: 0,
      y: 10
    },
    boss: {
      x: 0,
      y: -12
    },
    left: {
      x: -13,
      y: -11
    },
    right: {
      x: 13,
      y: -11
    },
    trial: {
      x: 0,
      y: -28
    },
    load: {
      x: 23,
      y: 18
    },
    view: {
      x: -23,
      y: 23
    },
    rest: {
      x: -8,
      y: 30
    },
    reward: {
      x: 11,
      y: -27
    }
  },
  exits: [{
    id: "snow_road",
    anchor: "south",
    to: "snow_road",
    arrival: "north"
  }, {
    id: "return_bridge",
    anchor: "cargo",
    to: "return_bridge",
    arrival: "south",
    condition: { all: ["furnace_cargo_loaded"] }
  }],
  objects: [
    {
      id: "division_trial",
      anchor: "trial",
      kind: "inspect",
      passage: "division_trial",
      condition: { all: ["kilnheart_defeated"] }
    },
    {
      id: "furnace_loading",
      anchor: "load",
      kind: "inspect",
      passage: "furnace_loading",
      condition: { all: ["division_tested"] }
    },
    {
      id: "anian_snow",
      anchor: "view",
      kind: "inspect",
      passage: "anian_snow",
      condition: { all: ["kilnheart_defeated"] }
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
      node: "furnace_trial"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 68,
      depth: 84
    },
    vista: "snow",
    surface: "snow",
    gates: [],
    roads: [{
      points: [
        [0, 37],
        [0, 16],
        [0, -29]
      ],
      width: 8
    }, {
      points: [
        [-25, 23],
        [0, 23],
        [25, 23]
      ],
      width: 5
    }],
    features: [
      v("kiln", "kiln", 0, -35, 12, 8, { height: 12 }),
      v("load-platform", "wagon", 26, 10, 8, 10),
      v("west-roof-pier", "column", -20, -19, 4, 6, { height: 10 }),
      v("east-roof-pier", "column", 20, -19, 4, 6, { height: 10 }),
      v("kiln-fuel", "fuel", -12, -30, 6, 6),
      v("east-workbench", "workbench", 20, -29, 8, 4),
      v("north-wall", "wall", 0, -41, 68, 2, { height: 8 }),
      v("west-wall", "wall", -33, -9, 2, 64, { height: 4 }),
      v("east-wall", "wall", 33, -9, 2, 64, { height: 4 }),
      v("entry-arch", "arch", 0, 27, 16, 2, { height: 8 })
    ]
  }
}), Bo = we({
  id: "return_bridge",
  safe: !1,
  anchors: {
    south: {
      x: 0,
      y: 34
    },
    north: {
      x: 0,
      y: -34
    },
    encounter: {
      x: 0,
      y: 12
    },
    front: {
      x: 0,
      y: -3
    },
    left: {
      x: -10,
      y: -15
    },
    right: {
      x: 10,
      y: -16
    },
    rear: {
      x: 0,
      y: -24
    },
    rest: {
      x: -8,
      y: 29
    },
    reward: {
      x: 9,
      y: -29
    }
  },
  exits: [{
    id: "old_kiln",
    anchor: "south",
    to: "old_kiln",
    arrival: "cargo"
  }, {
    id: "south_street",
    anchor: "north",
    to: "south_street",
    arrival: "furnace_cargo",
    condition: { all: ["furnace_convoy_secured"] }
  }],
  objects: [{
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }, {
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "furnace_convoy"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 48,
      depth: 80
    },
    vista: "snow",
    surface: "boards",
    gates: [],
    roads: [{
      points: [[0, 36], [0, -36]],
      width: 9
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -17,
        5,
        37
      ],
      to: [
        -17,
        5,
        -37
      ]
    }, {
      kind: "pipe",
      from: [
        17,
        5,
        37
      ],
      to: [
        17,
        5,
        -37
      ]
    }],
    features: [
      v("west-rail", "wall", -23, 0, 2, 80, { height: 1.2 }),
      v("east-rail", "wall", 23, 0, 2, 80, { height: 1.2 }),
      v("cargo-truck", "wagon", 13, 26, 6, 8),
      v("west-pylon", "column", -16, 0, 4, 6, { height: 14 }),
      v("east-pylon", "column", 16, 0, 4, 6, { height: 14 }),
      v("upper-arch", "arch", 0, -29, 28, 2, { height: 13 })
    ]
  }
}), Zo = we({
  id: "furnace_quarter",
  safe: !0,
  anchors: {
    south: {
      x: 0,
      y: 34
    },
    lift: {
      x: -20,
      y: -27
    },
    scaffold: {
      x: 20,
      y: -27
    },
    roster: {
      x: 0,
      y: 7
    },
    charter: {
      x: 0,
      y: -12
    },
    rest: {
      x: 10,
      y: 23
    }
  },
  exits: [
    {
      id: "furnace_terrace",
      anchor: "south",
      to: "furnace_terrace",
      arrival: "furnace_quarter"
    },
    {
      id: "furnace_lift",
      anchor: "lift",
      to: "furnace_lift",
      arrival: "south",
      condition: { all: ["furnace_roster_seen"] }
    },
    {
      id: "furnace_scaffold",
      anchor: "scaffold",
      to: "furnace_scaffold",
      arrival: "south",
      condition: { all: ["furnace_roster_seen"] }
    }
  ],
  objects: [
    {
      id: "furnace_roster",
      anchor: "roster",
      kind: "inspect",
      passage: "furnace_roster"
    },
    {
      id: "furnace_charter",
      anchor: "charter",
      kind: "inspect",
      passage: "furnace_charter",
      condition: { all: ["furnace_stilled"] }
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 72,
      depth: 80
    },
    vista: "furnace",
    surface: "street",
    gates: [],
    roads: [{
      points: [
        [0, 36],
        [0, 7],
        [0, -12],
        [-20, -27]
      ],
      width: 7
    }, {
      points: [[0, -12], [20, -27]],
      width: 6
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -31,
        12,
        -32
      ],
      to: [
        31,
        12,
        -32
      ]
    }, {
      kind: "washing",
      from: [
        -29,
        6,
        19
      ],
      to: [
        -12,
        6,
        19
      ]
    }],
    features: [
      v("bathhouse", "dwelling", -23, -9, 16, 18, {
        height: 8,
        tint: "sage",
        facing: "east"
      }),
      v("old-tenements", "dwelling", 24, -8, 16, 18, {
        height: 10,
        tint: "rose",
        facing: "west"
      }),
      v("low-homes", "dwelling", -23, 26, 18, 16, {
        height: 7,
        tint: "amber",
        facing: "east"
      }),
      v("packing-house", "workshop", 24, 24, 16, 14, {
        height: 7,
        tint: "sage",
        facing: "west"
      }),
      v("street-table", "ledger", -5, 7, 4, 4),
      v("charter-table", "table", 0, -17, 8, 4),
      v("furnace-buttress", "column", 0, -30, 8, 10, { height: 25 }),
      v("west-wall", "wall", -35, 0, 2, 80, { height: 5 }),
      v("east-wall", "wall", 35, 0, 2, 80, { height: 5 })
    ]
  }
}), Qo = we({
  id: "furnace_lift",
  safe: !1,
  anchors: {
    south: {
      x: 0,
      y: 34
    },
    north: {
      x: 0,
      y: -34
    },
    encounter: {
      x: 0,
      y: 13
    },
    front: {
      x: 0,
      y: -3
    },
    left: {
      x: -12,
      y: -15
    },
    right: {
      x: 12,
      y: -15
    },
    rear: {
      x: 0,
      y: -25
    },
    rest: {
      x: -9,
      y: 28
    },
    reward: {
      x: 10,
      y: -28
    }
  },
  exits: [{
    id: "furnace_quarter",
    anchor: "south",
    to: "furnace_quarter",
    arrival: "lift"
  }, {
    id: "furnace_antechamber",
    anchor: "north",
    to: "furnace_antechamber",
    arrival: "lift",
    condition: { all: ["furnace_lift_cleared"] }
  }],
  objects: [{
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }, {
    id: "relic_cache",
    anchor: "reward",
    kind: "reward",
    node: "furnace_ascent"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 60,
      depth: 80
    },
    vista: "furnace",
    surface: "iron",
    gates: [],
    roads: [{
      points: [[0, 36], [0, -36]],
      width: 12
    }],
    features: [
      v("west-hoist", "hoist", -24, -20, 8, 10, { height: 22 }),
      v("east-hoist", "hoist", 24, -20, 8, 10, { height: 22 }),
      v("left-crates", "cargo", -19, 12, 6, 8),
      v("right-crates", "cargo", 19, 7, 6, 8),
      v("center-pier", "column", 0, -14, 4, 4, { height: 8 }),
      v("west-railing", "wall", -29, 0, 2, 80, { height: 1.3 }),
      v("east-railing", "wall", 29, 0, 2, 80, { height: 1.3 })
    ]
  }
}), Ko = we({
  id: "furnace_scaffold",
  safe: !1,
  anchors: {
    south: {
      x: -11,
      y: 34
    },
    north: {
      x: 11,
      y: -34
    },
    encounter: {
      x: 0,
      y: 12
    },
    front: {
      x: -6,
      y: -7
    },
    left: {
      x: -11,
      y: -18
    },
    right: {
      x: 11,
      y: -19
    },
    rear: {
      x: 5,
      y: -25
    },
    rest: {
      x: 2,
      y: 30
    },
    crossing: {
      x: -10,
      y: -30
    },
    reward: {
      x: 4,
      y: -30
    }
  },
  exits: [{
    id: "furnace_quarter",
    anchor: "south",
    to: "furnace_quarter",
    arrival: "scaffold"
  }, {
    id: "furnace_antechamber",
    anchor: "north",
    to: "furnace_antechamber",
    arrival: "scaffold",
    condition: { all: ["furnace_scaffold_cleared"] }
  }],
  objects: [
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    },
    {
      id: "relic_cache",
      anchor: "reward",
      kind: "reward",
      node: "furnace_ascent"
    },
    {
      id: "kouzi_scaffold",
      anchor: "crossing",
      kind: "inspect",
      passage: "kouzi_scaffold",
      condition: { all: ["furnace_scaffold_cleared"] }
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 34,
      depth: 80
    },
    vista: "furnace",
    surface: "boards",
    gates: [],
    roads: [{
      points: [
        [-11, 36],
        [-11, 21],
        [7, 5],
        [-4, -12],
        [11, -25],
        [11, -36]
      ],
      width: 7
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -14,
        5,
        35
      ],
      to: [
        -14,
        5,
        -35
      ]
    }],
    features: [
      v("west-edge", "wall", -16, 0, 2, 80, { height: 1.2 }),
      v("east-edge", "wall", 16, 0, 2, 80, { height: 1.2 }),
      v("lower-brace", "column", 14, 18, 2, 6, { height: 14 }),
      v("upper-brace", "column", -14, -10, 2, 6, { height: 14 }),
      v("inner-pipe", "kiln", 13, -7, 4, 8, { height: 18 })
    ]
  }
}), Yo = we({
  id: "furnace_antechamber",
  safe: !0,
  anchors: {
    lift: {
      x: -14,
      y: 19
    },
    scaffold: {
      x: 14,
      y: 19
    },
    heart: {
      x: 0,
      y: -19
    },
    threshold: {
      x: 0,
      y: 0
    },
    pause: {
      x: -11,
      y: -6
    },
    rest: {
      x: 11,
      y: -6
    }
  },
  exits: [
    {
      id: "furnace_lift",
      anchor: "lift",
      to: "furnace_lift",
      arrival: "north",
      condition: { all: ["furnace_lift_cleared"] }
    },
    {
      id: "furnace_scaffold",
      anchor: "scaffold",
      to: "furnace_scaffold",
      arrival: "north",
      condition: { all: ["furnace_scaffold_cleared"] }
    },
    {
      id: "furnace_heart",
      anchor: "heart",
      to: "furnace_heart",
      arrival: "south",
      condition: { all: ["furnace_approach_ready"] }
    }
  ],
  objects: [
    {
      id: "furnace_threshold",
      anchor: "threshold",
      kind: "inspect",
      passage: "furnace_threshold"
    },
    {
      id: "sanniang_furnace",
      anchor: "pause",
      kind: "inspect",
      passage: "sanniang_furnace",
      condition: { none: ["furnace_master_defeated"] }
    },
    {
      id: "rest",
      anchor: "rest",
      kind: "rest"
    }
  ],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 44,
      depth: 48
    },
    vista: "room",
    surface: "boards",
    gates: [],
    roads: [{
      points: [
        [-14, 20],
        [0, 5],
        [14, 20]
      ],
      width: 5
    }, {
      points: [[0, 5], [0, -20]],
      width: 6
    }],
    features: [
      v("bench", "bench", -15, -6, 2, 8),
      v("water", "basin", -15, -14, 2, 2),
      v("medical-table", "table", 15, -11, 6, 4),
      v("cot", "bed", 15, 3, 6, 10),
      v("west-wall", "wall", -21, 0, 2, 48, {
        height: 6,
        wallUse: "room"
      }),
      v("east-wall", "wall", 21, 0, 2, 48, {
        height: 6,
        wallUse: "room"
      }),
      v("north-wall", "wall", 0, -23, 44, 2, {
        height: 8,
        wallUse: "room"
      }),
      v("south-wall", "wall", 0, 23, 44, 2, {
        height: 6,
        wallUse: "room"
      }),
      v("furnace-door", "arch", 0, -18, 12, 2, { height: 7 })
    ]
  }
}), Vo = we({
  id: "furnace_heart",
  safe: !1,
  anchors: {
    south: {
      x: 0,
      y: 36
    },
    encounter: {
      x: 0,
      y: 15
    },
    master: {
      x: 0,
      y: -9
    },
    left: {
      x: -18,
      y: -13
    },
    right: {
      x: 18,
      y: -13
    },
    shutdown: {
      x: 0,
      y: -33
    },
    rest: {
      x: -9,
      y: 31
    }
  },
  exits: [{
    id: "furnace_antechamber",
    anchor: "south",
    to: "furnace_antechamber",
    arrival: "heart"
  }],
  objects: [{
    id: "furnace_shutdown",
    anchor: "shutdown",
    kind: "inspect",
    passage: "furnace_shutdown",
    condition: { all: ["furnace_master_defeated"] }
  }, {
    id: "rest",
    anchor: "rest",
    kind: "rest"
  }],
  landscape: {
    bounds: {
      x: 0,
      z: 0,
      width: 76,
      depth: 88
    },
    vista: "interior",
    surface: "iron",
    gates: [],
    roads: [{
      points: [[0, 39], [0, -35]],
      width: 12
    }, {
      points: [
        [-26, 20],
        [-26, -24],
        [26, -24],
        [26, 20]
      ],
      width: 6
    }],
    suspended: [{
      kind: "pipe",
      from: [
        -29,
        11,
        -29
      ],
      to: [
        29,
        11,
        -29
      ]
    }],
    features: [
      v("furnace-heart", "kiln", 0, -40, 22, 6, { height: 28 }),
      v("west-exchanger", "kiln", -32, -9, 8, 14, { height: 21 }),
      v("east-exchanger", "kiln", 32, -9, 8, 14, { height: 21 }),
      v("west-cover", "column", -14, 7, 4, 4, { height: 8 }),
      v("east-cover", "column", 14, 7, 4, 4, { height: 8 }),
      v("west-wall", "wall", -37, 0, 2, 88, { height: 12 }),
      v("east-wall", "wall", 37, 0, 2, 88, { height: 12 }),
      v("entry-arch", "arch", 0, 29, 24, 2, { height: 16 })
    ]
  }
}), Jo = {
  furnace_terrace: No,
  snow_road: Do,
  old_kiln: Wo,
  return_bridge: Bo,
  furnace_quarter: Zo,
  furnace_lift: Qo,
  furnace_scaffold: Ko,
  furnace_antechamber: Yo,
  furnace_heart: Vo
}, Xo = {
  camp: {
    anchors: {},
    exits: [],
    objects: [{
      id: "furnace_invitation",
      anchor: "rest",
      kind: "inspect",
      passage: "furnace_invitation",
      condition: {
        all: ["warmth_seen_home"],
        none: ["furnace_invited"]
      }
    }, {
      id: "furnace_home",
      anchor: "rest",
      kind: "inspect",
      passage: "furnace_home",
      condition: { all: ["city_rekindled"] }
    }]
  },
  heat_station: {
    anchors: { furnace_terrace: {
      x: 22,
      y: 7
    } },
    exits: [{
      id: "furnace_terrace",
      anchor: "furnace_terrace",
      to: "furnace_terrace",
      arrival: "south",
      condition: { all: ["furnace_invited"] }
    }],
    objects: [{
      id: "division_plan",
      anchor: "plan",
      kind: "inspect",
      passage: "division_plan",
      condition: {
        all: ["furnace_offer_heard"],
        none: ["division_works_started"]
      }
    }]
  },
  south_street: {
    anchors: {
      furnace_cargo: {
        x: 29,
        y: -15
      },
      delivery: {
        x: 25,
        y: -11
      }
    },
    exits: [{
      id: "return_bridge",
      anchor: "furnace_cargo",
      to: "return_bridge",
      arrival: "north",
      condition: { all: ["furnace_convoy_secured"] }
    }],
    objects: [
      {
        id: "furnace_delivery",
        anchor: "delivery",
        kind: "inspect",
        passage: "furnace_delivery",
        condition: { all: ["furnace_convoy_secured"] }
      },
      {
        id: "furnace_shelter",
        anchor: "rest",
        kind: "inspect",
        passage: "furnace_shelter",
        condition: {
          all: ["division_works_started"],
          none: ["furnace_stilled"]
        }
      },
      {
        id: "laobai_return",
        anchor: "tea",
        kind: "inspect",
        passage: "laobai_return",
        condition: { all: ["division_works_started"] }
      }
    ]
  },
  workshop_street: {
    anchors: {},
    exits: [],
    objects: [{
      id: "furnace_tools",
      anchor: "pipes",
      kind: "inspect",
      passage: "furnace_tools",
      condition: {
        all: ["division_works_started"],
        none: ["furnace_stilled"]
      }
    }]
  },
  sanniang_room: {
    anchors: {},
    exits: [],
    objects: [{
      id: "sanniang_coda",
      anchor: "settle",
      kind: "inspect",
      passage: "sanniang_coda",
      condition: { all: ["long_night_ended", "sanniang_furnace_pause"] }
    }]
  },
  anian_room: {
    anchors: {},
    exits: [],
    objects: [{
      id: "anian_coda",
      anchor: "settle",
      kind: "inspect",
      passage: "anian_coda",
      condition: { all: ["long_night_ended", "anian_snow_view"] }
    }]
  },
  kouzi_home: {
    anchors: {},
    exits: [],
    objects: [{
      id: "kouzi_coda",
      anchor: "settle",
      kind: "inspect",
      passage: "kouzi_coda",
      condition: { all: ["long_night_ended", "kouzi_furnace_crossing"] }
    }]
  },
  laobai_home: {
    anchors: {},
    exits: [],
    objects: [{
      id: "laobai_coda",
      anchor: "settle",
      kind: "inspect",
      passage: "laobai_coda",
      condition: { all: ["long_night_ended", "laobai_return_seat"] }
    }]
  }
};
function el(e) {
  const a = Xo[e.id];
  return a ? we({
    ...e,
    anchors: {
      ...e.anchors,
      ...a.anchors
    },
    exits: [...e.exits, ...a.exits],
    objects: [...e.objects, ...a.objects]
  }) : e;
}
var Ct = {
  camp: jo,
  crossroads: So,
  gate: Ro,
  beacon: Ao,
  waterway: zo,
  cells: Eo,
  hall: Co,
  roots: Po,
  ...Oo,
  ...Go,
  ...Jo
};
for (const e of Object.keys(Ct)) Ct[e] = el(Ct[e]);
for (const e of bt) {
  const { scene: a, anchor: r } = Ne[e], t = Ct[a];
  Ct[a] = we({
    ...t,
    objects: [...t.objects, {
      id: e,
      anchor: r,
      kind: "resident",
      person: e
    }]
  });
}
var Se = Ct;
function Dr(e) {
  return !e || Se[e.location.scene].safe && e.phase === "exploration";
}
var Ca = {
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
function Zn(e, a) {
  const r = Ca[a];
  return a === "traveler" || e.purchases.some((t) => t.id === a) || r.achievement !== null && e.awards.some((t) => t.key === r.achievement);
}
var Re = (e, a, r = 0) => ({
  family: e,
  chapter: r,
  ...a ? { requires: [a] } : {}
}), de = (e, a = 0) => ({
  family: e,
  weapons: [e],
  chapter: a
}), Ot = {
  "storm-step": Re("storm"),
  conductor: Re("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: Re("storm"),
  cinder: Re("fire"),
  wildfire: Re("fire", ["cinder", "inferno"]),
  "blood-price": Re("risk"),
  frost: Re("frost"),
  shatter: Re("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: Re("skill"),
  hunter: {
    ...Re("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: Re("blade"),
  orbit: Re("storm"),
  thorns: Re("guard"),
  aegis: Re("guard"),
  siphon: Re("life"),
  focus: Re("skill"),
  renewal: Re("life"),
  execution: Re("blade"),
  "last-stand": Re("guard", void 0, 1),
  quicksilver: Re("skill"),
  magnet: Re("skill"),
  wardstone: Re("guard"),
  pilgrim: Re("life"),
  gambit: Re("risk", void 0, 1),
  riposte: de("blade"),
  "shield-break": de("blade"),
  "cleave-wave": de("blade", 1),
  duelist: de("blade"),
  "blood-dance": de("blade"),
  valor: de("blade", 1),
  ricochet: de("bow"),
  "split-arrow": de("bow"),
  pinning: de("bow"),
  "distance-draw": de("bow"),
  "hunter-mark": de("bow", 1),
  trapper: de("bow"),
  nova: de("staff"),
  inferno: {
    ...de("staff"),
    requires: [["cinder"]]
  },
  fracture: {
    ...de("staff"),
    requires: [[
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  overload: {
    ...de("staff", 1),
    requires: [["cinder"], [
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  orbitals: de("staff"),
  convergence: de("staff"),
  backstab: de("daggers"),
  shadowstep: de("daggers"),
  hemorrhage: de("daggers"),
  "execution-chain": de("daggers", 1),
  smoke: de("daggers"),
  venom: de("daggers"),
  "pack-bond": de("grimoire"),
  martyr: de("grimoire"),
  covenant: de("grimoire"),
  frenzy: de("grimoire"),
  "soul-harvest": de("grimoire", 1),
  command: de("grimoire"),
  shrapnel: de("cannon"),
  minefield: de("cannon"),
  overclock: de("cannon"),
  bunker: de("cannon"),
  salvage: de("cannon"),
  railgun: de("cannon", 1)
}, L = (e, a) => e.relics.find((r) => r.id === a)?.rank ?? 0;
function al(e) {
  return Ls.filter((a) => !Ot[a].weapons || Ot[a].weapons.includes(e));
}
function Gs(e, a, r = null) {
  const t = Ot[a];
  return (!t.weapons || t.weapons.includes(e.weapon)) && (!t.requires || t.requires.every((n) => n.some((s) => s !== r && L(e, s) > 0)));
}
var Ya = Math.PI * 2, V = (e, a) => Math.hypot(e.x - a.x, e.y - a.y), he = (e, a) => Math.atan2(a.y - e.y, a.x - e.x), Rr = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Je = (e, a, r) => ({
  x: e.x + Math.cos(a) * r,
  y: e.y + Math.sin(a) * r
});
function ca(e, a, r, t, n, s) {
  if (s) {
    Sr(s.space, a, {
      x: Math.cos(r) * t,
      y: Math.sin(r) * t
    }, n);
    return;
  }
  a.x += Math.cos(r) * t, a.y += Math.sin(r) * t;
  for (const o of e.obstacles) {
    const l = V(a, o), c = n + o.radius;
    if (l < c) {
      const i = l < 1e-3 ? r : he(o, a);
      a.x = o.x + Math.cos(i) * c, a.y = o.y + Math.sin(i) * c;
    }
  }
  a.x = Math.max(-J.arena + n, Math.min(J.arena - n, a.x)), a.y = Math.max(-J.arena + n, Math.min(J.arena - n, a.y));
}
function tl(e, a, r, t) {
  const n = e.x - a.x, s = e.y - a.y, o = Math.max(0, Math.min(t, n * Math.cos(r) + s * Math.sin(r)));
  return Math.hypot(n - Math.cos(r) * o, s - Math.sin(r) * o);
}
var nl = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], Qn = (e, a) => Math.hypot(a.x - e.x, a.y - e.y);
function ut(e, a, r, t) {
  if (!Fa(e, a, t) || !Fa(e, r, t)) return null;
  if (Be(e, a, r, t)) return [{ ...r }];
  const { map: n, columns: s, rows: o } = e, l = ht(n, a), c = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Set(), u = [];
  function d(b) {
    return dt(n, b % s, Math.floor(b / s));
  }
  function f(b, _, w, g) {
    if (b < 0 || b >= s || _ < 0 || _ >= o) return;
    const x = _ * s + b;
    h.has(x) || (c.get(x) ?? 1 / 0) <= w || (c.set(x, w), i.set(x, g), u.push({
      id: x,
      score: w + Qn(d(x), r)
    }));
  }
  for (let b = -1; b <= 1; b++) for (let _ = -1; _ <= 1; _++) {
    const w = l.column + _, g = l.row + b, x = dt(n, w, g);
    Be(e, a, x, t) && f(w, g, Qn(a, x), -1);
  }
  for (; u.length; ) {
    u.sort((w, g) => g.score - w.score || g.id - w.id);
    const { id: b } = u.pop();
    if (h.has(b)) continue;
    h.add(b);
    const _ = d(b);
    if (Be(e, _, r, t)) {
      const w = [{ ...r }];
      let g = b;
      for (; g !== -1; )
        w.push(d(g)), g = i.get(g);
      w.reverse();
      const x = [];
      let k = a;
      for (let M = 0; M < w.length; ) {
        let F = M;
        for (; F + 1 < w.length && Be(e, k, w[F + 1], t); ) F++;
        k = w[F], x.push(k), M = F + 1;
      }
      return x;
    }
    for (const [w, g] of nl) {
      const x = b % s + w, k = Math.floor(b / s) + g, M = dt(n, x, k);
      Be(e, _, M, t) && f(x, k, c.get(b) + Qn(_, M), b);
    }
  }
  return null;
}
var Wr = (e) => !Oe(e) || [
  "warden",
  "thornheart",
  "keeper",
  "bridgekeeper",
  "heatkeeper",
  "kilnheart",
  "furnacemaster"
].includes(e), Br = /* @__PURE__ */ new WeakMap();
function Ns(e, a) {
  let r = Br.get(e);
  r || (r = /* @__PURE__ */ new WeakMap(), Br.set(e, r));
  let t = r.get(a);
  return t || (t = {
    ...e,
    blocked(n, s) {
      const o = dt(e.map, n, s);
      return o.x < a.left || o.x > a.right || o.y < a.top || o.y > a.bottom || e.blocked(n, s);
    }
  }, r.set(a, t)), t;
}
var ce = (e, a, r, t = 0) => !e || Be(e.space, a, r, t);
function Ha(e, a, r, t, n) {
  let s = 0;
  for (let o = 0.2; o <= t + 0.2; o += 0.2) {
    const l = Math.min(o, t), c = {
      x: a.x + Math.cos(r) * l,
      y: a.y + Math.sin(r) * l
    };
    if (!Be(e.space, a, c, n)) break;
    s = l;
  }
  return s;
}
function rl(e, a, r) {
  return e.summonPoints.filter((t) => Fa(e.space, t, r) && ut(e.space, e.entry, t, r)).sort((t, n) => Math.hypot(t.x - a.x, t.y - a.y) - Math.hypot(n.x - a.x, n.y - a.y))[0] ?? null;
}
function Ds(e, a, r) {
  return !e || Be(e.space, a, r, 0.3) ? r : {
    x: a.x,
    y: a.y
  };
}
function Ar(e, a, r, t) {
  if (!e) return Math.atan2(r.y - a.y, r.x - a.x);
  let n = r;
  if (!Fa(e.space, n, t)) {
    const o = [], l = t + e.space.map.cellSize, c = ht(e.space.map, {
      x: r.x - l,
      y: r.y - l
    }), i = ht(e.space.map, {
      x: r.x + l,
      y: r.y + l
    });
    for (let u = Math.max(0, c.row); u <= Math.min(e.space.rows - 1, i.row); u++) for (let d = Math.max(0, c.column); d <= Math.min(e.space.columns - 1, i.column); d++) {
      const f = dt(e.space.map, d, u);
      Math.hypot(f.x - r.x, f.y - r.y) <= t + e.space.map.cellSize && Fa(e.space, f, t) && Be(e.space, f, r) && o.push(f);
    }
    o.sort((u, d) => Math.hypot(u.x - r.x, u.y - r.y) - Math.hypot(d.x - r.x, d.y - r.y));
    const h = o.find((u) => ut(e.space, a, u, t));
    if (!h) return null;
    n = h;
  }
  const s = ut(e.space, a, n, t);
  return s?.length ? Math.atan2(s[0].y - a.y, s[0].x - a.x) : null;
}
function xe(e, a, r, t = 1, n = 0) {
  e.effects.push({
    id: ++e.serial,
    x: a.x,
    y: a.y,
    kind: r,
    size: t,
    angle: n,
    life: r === "slash" ? 9 : 15
  });
}
function qe(e, a, r, t, n = !1) {
  if (!Oe(a) && e.enemies.filter((c) => c.hp > 0).length >= (t?.enemyLimit ?? J.maxEnemies)) return null;
  if (t && !n) {
    const c = rl(t, r, be[a].radius);
    if (!c) return null;
    r = c;
  }
  const s = be[a], o = (t?.segment && a === "warden" ? Ge.wardenHp : t?.segment && a === "thornheart" ? Ge.heartHp : t?.segment && a === "keeper" ? Ge.keeperHp : s.hp) * (Oe(a) ? 1 : (1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)) * (t?.segment ? Ge.mobHp : 1)), l = {
    id: ++e.serial,
    kind: a,
    x: r.x,
    y: r.y,
    hp: o,
    maxHp: o,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(En(e) * 20),
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
  return e.enemies.push(l), l;
}
function Ua(e, a, r, t, n, s = {}) {
  const o = {
    id: ++e.serial,
    x: a.x,
    y: a.y,
    angle: r,
    damage: t,
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
  return e.shots.push(o), o;
}
function me(e, a, r, t, n, s, o, l = !1, c = {}) {
  const i = {
    id: ++e.serial,
    x: a.x,
    y: a.y,
    kind: r,
    radius: t,
    wait: n,
    life: s,
    damage: o,
    friendly: l,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: l ? "passive" : "attack",
    hits: [],
    ...c
  };
  return e.hazards.push(i), i;
}
function Ye(e, a, r, t, n) {
  return me(e, a, "slam", r, t, 8, n);
}
function Ae(e, a, r, t, n, s, o) {
  return me(e, a, "beam", 0, s, 9, o, !1, {
    angle: r,
    length: t,
    width: n
  });
}
function Ea(e, a, r, t, n, s, o = 0.22) {
  for (let l = 0; l < t; l++) Ua(e, a, r + (t === 1 ? 0 : l / (t - 1) - 0.5) * n, s, !1, { speed: o });
}
function Zr(e, a, r, t, n, s = 0.16) {
  for (let o = 0; o < r; o++) Ua(e, a, t + o * Ya / r, n, !1, { speed: s });
}
function sr(e, a, r, t, n = 0) {
  const s = {
    id: ++e.serial,
    kind: a,
    x: r.x,
    y: r.y,
    hp: a === "turret" ? 65 : a === "familiar" ? Oa.familiarHp : 38,
    life: t,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(s), s;
}
var fn = (e) => e === "attack" || e === "skill";
function sl(e, a, r) {
  const t = he(a, a.target), n = a.pattern++ % 3, s = (l, c, i, h, u) => Ae(e, a, l, Ha(r, a, l, c, i), i, h, u);
  if (a.kind === "kilnheart") {
    if (n === 0) s(t, 19, 1.1, 32, 23);
    else if (n === 1) me(e, a, "ring", 8, 39, 10, 25, !1, {
      inner: 3.8,
      angle: t + Math.PI / 2,
      gap: 1.5
    });
    else for (const l of [-1, 1]) s(t + l * 0.72, 17, 1.2, 35, 23);
    a.stun = 40, a.exposed = Math.max(a.exposed, 125);
    return;
  }
  if (a.phase >= 2 && a.memory.length === 0) {
    for (const l of r.summonPoints) {
      const c = qe(e, "coupler", l, r);
      c && (c.hp = c.maxHp = r.furnacePrepared ? Pt.preparedCouplerHp : Pt.couplerHp);
    }
    a.memory = r.summonPoints.map((l) => ({ ...l })), xe(e, a, "burst", 4);
  }
  const o = e.enemies.some((l) => l.kind === "coupler" && l.hp > 0);
  if (n === 0) {
    const l = Ha(r, a, t, Math.min(8, Math.hypot(a.target.x - a.x, a.target.y - a.y) + 1), 1.45);
    a.motionAngle = t, a.motion = Math.floor(l / 0.32), a.stun = 30;
    const c = Ae(e, a, t, l, 1.45, 30, 0);
    c.life = Math.max(1, a.motion), a.exposed = Math.max(a.exposed, 30 + a.motion + (a.phase === 3 ? 105 : 75));
  } else if (n === 1)
    Ye(e, Je(a, t, Ha(r, a, t, 3, 0.4)), 3.8, 32, 29), o && s(t + (a.pattern % 2 ? 1 : -1) * 0.9, 22, 1.2, 53, 24), a.stun = 54, a.exposed = Math.max(a.exposed, a.phase === 3 ? 185 : 145);
  else {
    for (const l of [-1, 1]) s(t + l * 0.65, 26, 1.3, 40, 27);
    a.phase === 3 && o && Ye(e, a.target, 2.8, 65, 25), a.stun = 66, a.exposed = Math.max(a.exposed, a.phase === 3 ? 200 : 155);
  }
}
function il(e, a) {
  if (a.kind === "coupler") {
    const r = e.enemies.find((t) => t.kind === "furnacemaster" && t.hp > 0);
    r && (r.stun = Math.max(r.stun, Pt.couplerStun), r.exposed = Math.max(r.exposed, Pt.couplerExposed), r.motion = 0, r.windup = 0, xe(e, r, "guard", 3));
  } else if (a.kind === "furnacemaster")
    for (const r of e.enemies) r.kind === "coupler" && (r.hp = 0);
}
function Ws(e, a) {
  if (e.player.hp <= 0) return;
  const r = Math.min(J.maxHp - e.player.hp, a);
  e.player.hp += r, r > 0 && xe(e, e.player, "heal");
}
function Ga(e, a, r) {
  if (Oe(a.kind)) {
    if (a.controlRecovery > 0 || (a.stagger += r, a.stagger < 100)) return;
    a.stagger = 0, r = 24, a.controlRecovery = Ge.bossControlRecovery;
  }
  a.stun = Math.max(a.stun, r), a.windup = 0, a.motion = 0, a.cooldown = Math.max(20, a.cooldown), xe(e, a, "guard", 1.4);
}
function sa(e, a, r, t, n, s = e.player, o) {
  if (a.hp <= 0 || !ce(o, s, a)) return;
  const l = a.burn > 0 || fn(n) && L(t, "cinder") > 0, c = a.chill > 0 || fn(n) && L(t, "frost") > 0, i = (n === "skill" || n === "companion" && t.weapon === "cannon") && c && L(t, "shatter") > 0, h = fn(n) && l && c && L(t, "overload") > 0;
  let u = r * (L(t, "blood-price") ? ra.bloodDamage + (L(t, "blood-price") - 1) * 0.12 : 1);
  if (L(t, "execution") && a.hp / a.maxHp < ra.executeThreshold && (u *= ra.executeDamage + (L(t, "execution") - 1) * 0.1), a.exposed > 0 && (u *= 1.25), (a.kind === "guard" || o && a.kind === "warden" && Is(a.phase)) && n === "attack" && Math.cos(he(a, s) - a.angle) > 0.4 && a.exposed <= 0 && (u *= L(t, "shield-break") ? 0.8 : 0.35), a.kind !== "priest" && !Oe(a.kind) && e.enemies.some((d) => d.kind === "priest" && d.hp > 0 && V(a, d) < 3.5 && ce(o, a, d)) && (u *= 0.7), n === "attack" && L(t, "backstab") && Math.cos(he(a, e.player) - a.angle) < -0.3 && (u *= 1.6 + L(t, "backstab") * 0.2, a.exposed = Math.max(a.exposed, 55)), n === "attack" && L(t, "duelist") && Ga(e, a, 9 * L(t, "duelist")), i) {
    u += 15 * L(t, "shatter"), a.chill = 0, xe(e, a, "burst", 2.2);
    for (const d of e.enemies) d.id !== a.id && V(a, d) < 2.2 && sa(e, d, 9 * L(t, "shatter"), t, "passive", a, o);
  }
  if (fn(n) && (L(t, "cinder") && (a.burn = Math.max(a.burn, 80 + L(t, "cinder") * 25)), L(t, "frost") && (a.chill = Math.max(a.chill, 45 + L(t, "frost") * 20)), (L(t, "blood-dance") || L(t, "hemorrhage")) && (a.bleed = 100 + 25 * (L(t, "blood-dance") + L(t, "hemorrhage"))), L(t, "venom") && (a.poison = 100 + L(t, "venom") * 35), h && (u += 20 * L(t, "overload"), xe(e, a, "lightning")), n === "skill" && L(t, "hunter-mark") && (a.exposed = Math.max(a.exposed, 100 + L(t, "hunter-mark") * 40)), L(t, "inferno") && l && n === "skill" && me(e, a, "fire", 1.5 + L(t, "inferno") * 0.3, 0, 70, 4 * L(t, "inferno"), !0)), h && (a.burn = 0), (h || i) && (a.chill = 0), a.hp = Math.max(0, a.hp - u), a.marked = 5, n === "lightning" && L(t, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - L(t, "momentum") * 2)), !(a.hp > 0)) {
    if (il(e, a), e.kills++, xe(e, a, "burst", Oe(a.kind) ? 3 : 0.8), L(t, "wildfire") && l && me(e, a, "fire", 1.8 + L(t, "wildfire") * 0.2, 0, 90, 3 * L(t, "wildfire"), !0), L(t, "fracture") && c) for (let d = 0; d < 4 + L(t, "fracture"); d++) Ua(e, a, d * Ya / (4 + L(t, "fracture")), 9, !0, { source: "passive" });
    if (L(t, "siphon") && (e.kills % ra.siphonEvery === 0 || Oe(a.kind)) && Ws(e, (Oe(a.kind) ? ra.siphonBossHeal : ra.siphonHeal) + L(t, "siphon") - 1), L(t, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * L(t, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), L(t, "soul-harvest") && (e.player.resource = Math.min(Oa.maxPower, e.player.resource + 9 * L(t, "soul-harvest"))), n === "companion" && L(t, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * L(t, "salvage"))), L(t, "magnet"))
      for (const d of e.enemies) d.hp > 0 && d.kind !== "coupler" && V(a, d) < 3 + L(t, "magnet") && ce(o, a, d) && ca(e, d, he(d, a), 0.7, be[d.kind].radius, o);
  }
}
function ir(e, a, r, t, n, s = e.player) {
  const o = [a];
  if (ce(n, s, a)) {
    L(r, "conductor") && o.push(...e.enemies.filter((l) => l.id !== a.id && l.hp > 0 && V(l, a) < 4.5 && ce(n, a, l)).sort((l, c) => V(l, a) - V(c, a)).slice(0, L(r, "conductor") + 1));
    for (const l of o)
      xe(e, l, "lightning"), sa(e, l, t, r, "lightning", n ? l === a ? s : a : e.player, n);
  }
}
function Bs(e, a, r) {
  const t = e.player, n = t.guard > 0;
  t.resource = Math.min(100, t.resource + (n ? 25 : 8)), xe(e, t, n ? "parry" : "block", n ? 2 : 1, t.facing), n && (t.skill = Math.max(35, t.skill - 15));
  const s = L(a, "riposte"), o = L(a, "thorns");
  if (s || o)
    for (const l of e.enemies) V(l, t) < 3.2 + s * 0.3 && ce(r, t, l) && (sa(e, l, (n ? 20 : 8) * s + 9 * o, a, "passive", t, r), Ga(e, l, n ? 20 : 7));
}
function Cn(e, a, r, t) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Bs(e, r, t), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let s = a * Va[r.weapon].guard * (L(r, "blood-price") ? ra.bloodHurt : 1) * (L(r, "gambit") ? 1.2 : 1);
  const o = Math.min(n.ward, s);
  if (n.ward -= o, s -= o, n.hp <= s && L(r, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + L(r, "last-stand") * 8, n.invulnerable = 60, xe(e, n, o > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - s), e.damageTaken += s, n.invulnerable = 18, n.lastHit = e.tick, xe(e, n, o > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), L(r, "thorns"))
    for (const l of e.enemies) V(l, n) < 3 && sa(e, l, 10 * L(r, "thorns"), r, "passive", n, t);
}
function Yt(e, a, r = 45) {
  e.ward += Math.max(0, Math.min(a, r - e.ward));
}
function Qr(e, a, r, t = !1, n) {
  const s = Va[a.weapon], o = e.player, l = he(o, r), c = (t ? 0.6 : 1) * (L(a, "gambit") ? 1 + L(a, "gambit") * 0.12 : 1);
  if (o.facing = l, o.swing = a.weapon === "cannon" ? 15 : 8, a.weapon === "blade" || a.weapon === "daggers") {
    const d = s.range + L(a, "piercing") * 0.25;
    xe(e, o, "slash", d, l);
    for (const f of e.enemies)
      V(o, f) > d + be[f.kind].radius || Math.cos(he(o, f) - l) < -0.1 || !ce(n, o, f) || (sa(e, f, s.damage * c, a, "attack", o, n), a.weapon === "blade" && !t && o.combo % 3 === 2 && Ga(e, f, 14));
    a.weapon === "blade" && (o.resource = Math.min(100, o.resource + 9), L(a, "cleave-wave") && o.combo % 3 === 2 && Ua(e, o, l, 14 * L(a, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let i = s.damage * c;
  L(a, "distance-draw") && (i *= 1 + Math.min(1, V(o, r) / 8) * 0.15 * L(a, "distance-draw")), a.weapon === "staff" && (o.resource = Math.min(100, o.resource + 18)), a.weapon === "grimoire" && (o.resource = Math.min(Oa.maxPower, o.resource + 12));
  const h = L(a, "piercing") * ra.extraPierce + L(a, "railgun") * 2, u = Ua(e, o, l, i, !0, {
    pierce: h,
    speed: a.weapon === "bow" ? 0.38 : 0.28,
    splash: a.weapon === "staff" ? 1.4 : a.weapon === "cannon" ? 1.8 + L(a, "shrapnel") * 0.3 : 0,
    bounce: L(a, "ricochet"),
    radius: a.weapon === "cannon" ? 0.3 : 0.16
  });
  if (a.weapon === "bow" && L(a, "split-arrow") && o.combo % 3 === 2) for (const d of [-0.18, 0.18]) Ua(e, o, l + d, i * (0.35 + L(a, "split-arrow") * 0.1), !0, {
    speed: u.speed,
    pierce: h
  });
}
function ol(e, a, r, t) {
  const n = e.player, s = Va[a.weapon], o = L(a, "focus");
  switch (n.skill = Math.round(s.skillCooldown * (o ? ra.focusSkill - (o - 1) * 0.06 : 1)), L(a, "aegis") && (n.shield = 18 + L(a, "aegis") * 6, n.guard = 8, Yt(n, L(a, "aegis") * 6)), a.weapon) {
    case "blade": {
      n.shield = 26 + L(a, "aegis") * 6, n.guard = 9;
      const l = 1 + n.resource / 100;
      n.resource = 0, xe(e, n, "slash", 3.6, n.facing);
      for (const c of e.enemies)
        c.hp <= 0 || V(n, c) > 3.6 + be[c.kind].radius || !ce(t, n, c) || (L(a, "shield-break") && (c.exposed = Math.max(c.exposed, 70 + 30 * L(a, "shield-break"))), sa(e, c, s.skill * l, a, "skill", n, t), Ga(e, c, 40), !Oe(c.kind) && c.kind !== "coupler" && ca(e, c, he(n, c), 1.5, be[c.kind].radius, t));
      L(a, "valor") && Yt(n, 12 * L(a, "valor") * l);
      break;
    }
    case "bow":
      for (let l = -2; l <= 2; l++) Ua(e, n, n.facing + l * 0.15, s.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      ca(e, n, n.facing + Math.PI, 0.85, J.playerRadius, t);
      break;
    case "staff": {
      const l = r ?? n, c = 1 + n.resource / 125;
      if (n.resource = 0, L(a, "convergence"))
        for (const i of e.enemies) i.kind !== "coupler" && V(i, l) < 4 + L(a, "convergence") && ce(t, l, i) && ca(e, i, he(i, l), 1.2, be[i.kind].radius, t);
      for (let i = 0; i < 3; i++) {
        const h = Je(l, i * Ya / 3, 0.7);
        me(e, ce(t, l, h) ? h : l, "slam", 2.3, 10 + i * 10, 1, s.skill * c, !0, { source: "skill" });
      }
      if (L(a, "nova")) {
        me(e, n, "frost", 3 + L(a, "nova") * 0.5, 0, 32, 6 * L(a, "nova"), !0, { source: "skill" });
        for (const i of e.enemies) V(n, i) < 3.5 && ce(t, n, i) && (i.chill = 120, Ga(e, i, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), r) {
        const l = Je(r, r.angle + Math.PI, be[r.kind].radius + 0.55);
        ca(e, n, he(n, l), Math.min(5, V(n, l)), J.playerRadius, t), n.facing = he(n, r), ce(t, n, r) && (!t || V(n, r) <= s.range + be[r.kind].radius) && (r.exposed = Math.max(r.exposed, 60), sa(e, r, s.skill, a, "skill", n, t), Ga(e, r, 20)), xe(e, n, "slash", 2, n.facing);
      }
      L(a, "shadowstep") && sr(e, "shade", n, 95 + L(a, "shadowstep") * 30, L(a, "shadowstep"));
      break;
    case "grimoire": {
      const l = n.resource;
      n.resource = 0, n.resonance = Oa.resonanceTicks + l, xe(e, n, "resonance", 2);
      for (const c of e.companions) c.kind === "familiar" && c.hp > 0 && c.life > 0 && (c.hp = Math.max(c.hp, Oa.familiarHp), c.cooldown = 0);
      r && (r.exposed = Math.max(r.exposed, 100), sa(e, r, s.skill + l * 0.3, a, "skill", n, t)), L(a, "command") && me(e, r ?? n, "storm", 2.4 + L(a, "command") * 0.3, 10, 65, 7 * L(a, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const l = 1 + (L(a, "overclock") >= 2 ? 1 : 0), c = e.companions.filter((i) => i.kind === "turret");
      c.length >= l && (c[0].life = 0), sr(e, "turret", Ds(t, n, Je(n, n.facing, 0.9)), 240 + L(a, "overclock") * 45, L(a, "overclock")), L(a, "bunker") && Yt(n, 15 * L(a, "bunker"));
      break;
    }
  }
}
function ll(e, a, r, t) {
  const n = e.player, s = L(r, "quicksilver");
  if (n.dash = Math.round(J.dashCooldown * (1 - s * 0.08)), n.dashTime = J.dashTicks, n.dashAngle = a.move ? Rr(a.move) : n.facing, n.invulnerable = J.dashTicks + 2, L(r, "storm-step") && me(e, n, "storm", 1.7 + L(r, "storm-step") * 0.15, 0, 70, 6 + L(r, "storm-step") * 3, !0), L(r, "trapper") && me(e, n, "frost", 1.8, 12, 110, 5 * L(r, "trapper"), !0), L(r, "minefield") && me(e, n, "mine", 2 + L(r, "minefield") * 0.2, 12, 180, 25 * L(r, "minefield"), !0), L(r, "smoke")) {
    for (const o of e.enemies) V(o, n) < 3 + L(r, "smoke") * 0.4 && ce(t, n, o) && (Ga(e, o, 30 + L(r, "smoke") * 8), o.exposed = Math.max(o.exposed, 65));
    xe(e, n, "guard", 3);
  }
}
function cl(e, a, r, t) {
  const n = e.player;
  for (const i of [
    "attack",
    "dash",
    "skill",
    "invulnerable",
    "swing",
    "shield",
    "guard"
  ]) n[i] = Math.max(0, n[i] - 1);
  const s = e.enemies.filter((i) => i.hp > 0 && ce(t, n, i)).sort((i, h) => V(n, i) - V(n, h))[0];
  a.dash && !n.dash && !n.dashTime && ll(e, a, r, t);
  const o = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    ca(e, n, n.dashAngle, J.speed * 3.6, J.playerRadius, t), n.dashTime--, !n.dashTime && L(r, "momentum") && s && V(n, s) < 3 && ir(e, s, r, 10 + L(r, "momentum") * 5, t);
  else if (a.move) {
    n.facing = Rr(a.move);
    const i = n.swing > 0;
    let h = J.speed * (i ? Va[r.weapon].moveFire : 1);
    L(r, "quicksilver") && n.dash > J.dashCooldown / 2 && (h *= 1 + L(r, "quicksilver") * 0.1), e.hazards.some((u) => !u.friendly && u.kind === "frost" && !u.wait && V(u, n) < u.radius && ce(t, u, n)) && (h *= 0.65), ca(e, n, n.facing, h, J.playerRadius, t);
  }
  n.travel += V(o, n), L(r, "pilgrim") && n.travel >= 28 && (n.travel -= 28, Yt(n, L(r, "pilgrim") * 6, 35)), L(r, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && Yt(n, 2, L(r, "wardstone") * 10);
  const l = s && ce(t, n, s) ? s : void 0;
  a.skill && !n.skill && (l && (n.facing = he(n, l)), ol(e, r, l, t));
  const c = Va[r.weapon].range + (r.weapon === "blade" || r.weapon === "daggers" ? L(r, "piercing") * 0.25 : 0);
  if (l && !n.attack && V(n, l) <= c + be[l.kind].radius && (Qr(e, r, l, !1, t), n.combo++, L(r, "echo") && n.combo % Math.max(2, ra.echoEvery + 1 - L(r, "echo")) === 0 && Qr(e, r, l, !0, t), n.attack = Math.round(Va[r.weapon].period * (L(r, "focus") ? ra.focusAttack : 1))), L(r, "orbit") && e.tick % Math.round(ra.orbitTicks / (1 + L(r, "orbit") * 0.25)) === 0 && s && V(n, s) < 4.5 && ir(e, s, r, 12 + L(r, "orbit") * 3, t), L(r, "orbitals") && e.tick % 35 === 0) {
    for (const i of e.enemies) V(n, i) < 2.5 + L(r, "orbitals") * 0.35 && ce(t, n, i) && (sa(e, i, 12 * L(r, "orbitals"), r, "passive", n, t), i.chill = Math.max(i.chill, 30));
    xe(e, n, "burst", 2.8);
  }
  return {
    x: n.x - o.x,
    y: n.y - o.y
  };
}
function dl(e, a, r) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), a.weapon === "grimoire" && e.tick % 45 === 1) {
    const t = 2 + L(a, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < t && sr(e, "familiar", Ds(r, e.player, Je(e.player, e.tick, 1)), 36e3);
  }
  for (const t of e.companions) {
    t.life--, t.cooldown = Math.max(0, t.cooldown - 1);
    const n = e.enemies.filter((o) => o.hp > 0 && (t.kind !== "turret" || ce(r, t, o))).sort((o, l) => V(o, t) - V(l, t))[0];
    if (t.hp <= 0 || t.life <= 0 || !n) continue;
    if (t.angle = he(t, n), t.kind !== "turret") {
      const o = V(t, e.player) > 8;
      if (o || V(t, n) > 1.3 || !ce(r, t, n)) {
        const l = Ar(r, t, o ? e.player : n, 0.25);
        l !== null && ca(e, t, l, o ? 0.19 : 0.14 + L(a, "frenzy") * 0.015, 0.25, r);
      }
    }
    const s = t.kind === "turret" ? 8 : 1.8;
    if (!t.cooldown && V(t, n) < s && ce(r, t, n)) if (t.kind === "turret")
      Ua(e, t, t.angle, Va.cannon.skill * (1 + t.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), t.cooldown = 28 - t.empowered * 3;
    else {
      const o = t.kind === "familiar" && e.player.resonance > 0;
      sa(e, n, t.kind === "shade" ? 9 + t.empowered * 4 : (o ? Oa.empoweredDamage : Oa.damage) * (1 + L(a, "covenant") * 0.15), a, "companion", t, r), xe(e, t, "slash", 1.2, t.angle);
      const l = t.kind === "shade" ? 32 : o ? Oa.empoweredAttackTicks : Oa.attackTicks;
      t.cooldown = Math.round(l / (1 + L(a, "frenzy") * 0.18));
    }
  }
  for (const t of e.companions) t.hp <= 0 && t.kind === "familiar" && L(a, "martyr") && (Ws(e, L(a, "martyr")), me(e, t, "slam", 2.2, 0, 1, 15 * L(a, "martyr"), !0));
  e.companions = e.companions.filter((t) => t.hp > 0 && t.life > 0);
}
function hl(e, a, r) {
  if (r?.segment !== "beacon" || a.kind !== "archer" || !["approach", "lighting"].includes(e.script.signal)) return !1;
  if (a.hp < e.script.signalHp)
    return e.script.signal = "stopped", a.exposed = Math.max(a.exposed, Ge.recoveryTicks), a.cooldown = Ge.recoveryTicks, !1;
  if (a.windup = 0, e.script.signal === "approach") {
    const t = r.signalPoint;
    if (V(a, t) < 1) e.script.signal = "lighting";
    else {
      const n = Ar(r, a, t, 0.36);
      n !== null && (a.angle = n, ca(e, a, n, 0.1, 0.36, r));
    }
  }
  return !0;
}
function ul(e, a) {
  const r = e.script, t = e.enemies.find((s) => [
    "keeper",
    "warden",
    "thornheart"
  ].includes(s.kind));
  let n = [];
  if (a.segment === "gate" && !e.enemies.some((s) => s.kind === "archer") && (n = ["charger"]), a.segment === "waterway" && t && t.hp <= t.maxHp * 0.5 && (n = ["archer", "soldier"]), a.segment === "hall" && a.reinforcement && t && t.hp <= t.maxHp * 0.65 && (n = ["guard", "archer"]), a.segment === "roots" && t && t.hp <= t.maxHp * 0.5 && (n = ["stalker", "stalker"]), a.segment === "beacon") {
    const s = e.enemies.find((o) => o.kind === "archer");
    !s && r.signal !== "lit" && (r.signal = "stopped"), s && r.signal === "idle" && !e.enemies.some((o) => o.kind === "guard") && (r.signal = "approach", r.signalHp = s.hp, s.windup = 0, e.objective.target = Ge.signalTicks), s && r.signal === "lighting" && (s.hp < r.signalHp ? (r.signal = "stopped", s.exposed = Math.max(s.exposed, Ge.recoveryTicks)) : ++e.objective.progress >= Ge.signalTicks && (r.signal = "lit", e.objective.hp = 0)), r.signal === "lit" && (n = ["soldier", "soldier"]);
  }
  if (!(!n.length || r.reinforcements === "done")) {
    if (r.reinforcements === "idle" && (r.reinforcements = "warning", r.warning = Ge.reinforcementWarning, t && (t.windup = 0, t.cooldown = Math.max(t.cooldown, Ge.reinforcementWarning + Ge.recoveryTicks))), e.tick % 6 === 0) for (const s of a.summonPoints) xe(e, s, "guard", 1.2);
    --r.warning > 0 || (n.forEach((s, o) => {
      qe(e, s, a.summonPoints[o], a) || Ue("map_invalid");
    }), r.reinforcements = "done");
  }
}
var Kr = {
  ...lo,
  ...fo
}, vn = Object.freeze({
  wait: 42,
  damage: 23
}), Zs = (e) => e && Object.hasOwn(Kr, e) ? Kr[e].map((a) => ({
  ...a,
  ...vn
})) : [];
function pl(e, a) {
  for (const r of Zs(a.segment))
    e.tick < r.offset || (e.tick - r.offset) % r.period || Ae(e, r, r.angle, Ha(a, r, r.angle, r.length, r.width), r.width, r.wait, r.damage);
}
var Za = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), Mn = [
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
function wn(e, a, r) {
  if (e.wave++, r) {
    for (const s of r.waves[e.wave - 1]) qe(e, s.kind, s.position, r, !0);
    return;
  }
  if (e.boss) {
    qe(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const t = so[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (a.oaths.includes("legion") ? 2 : 0);
  for (let s = 0; s < n; s++) {
    const o = Ya * s / n + (e.wave - 1) * 0.8;
    let l = t[(s + e.wave - 1) % t.length];
    e.wave === 1 && e.chapter === 0 && s < 2 && (l = t[0]), e.encounter === "pursuit" && s === 0 && (l = "stalker"), e.encounter === "siege" && s === 0 && (l = "guard"), qe(e, l, {
      x: Math.cos(o) * 8.7,
      y: Math.sin(o) * 8.7
    });
  }
}
function fl(e, a, r) {
  if (r?.segment && (ul(e, r), pl(e, r)), e.boss) return;
  const t = e.objective, n = e.enemies.some((s) => s.hp > 0);
  if (e.encounter === "ritual") {
    t.progress < t.target && V(e.player, t) < 2.5 && !e.enemies.some((o) => o.hp > 0 && V(o, t) < 2.2) && t.progress++;
    const s = Math.min(2, Math.floor(t.progress / Za.ritualTicks));
    t.x = Mn[s].x, t.y = Mn[s].y, e.tick % Za.reinforcementInterval === 0 && t.progress < t.target && e.enemies.length < 8 && qe(e, e.chapter ? "wisp" : "stalker", {
      x: t.x > 0 ? -9 : 9,
      y: En(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    t.progress = Math.min(t.target, t.progress + 1), e.tick % Za.reinforcementInterval === 0 && t.progress < t.target && e.enemies.length < 10 && wn(e, a), e.tick % 150 === 0 && me(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    t.progress = e.tick % Za.pursuitInterval, e.wave < e.waves && t.progress === 0 && wn(e, a);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const s = e.tick % 300 === 0, o = Math.round((s ? e.player.y : e.player.x) / 3) * 3;
    Ae(e, s ? {
      x: -10,
      y: o
    } : {
      x: o,
      y: -10
    }, s ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  !r && e.tick > Za.warningAfter && e.tick % 180 === 0 && me(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, wn(e, a, r)) : n && (e.nextWave = 0);
}
function bl(e, a) {
  return e.enemies.some((r) => r.hp > 0) || (a?.segment === "gate" || a?.segment === "beacon" && e.script.signal === "lit") && e.script.reinforcements !== "done" ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function ml(e) {
  const a = e.objective;
  e.encounter === "ritual" && (Object.assign(a, Mn[0]), a.target = Za.ritualTicks * Mn.length), e.encounter === "survival" && (a.target = Za.survivalTicks), e.encounter === "pursuit" && (a.target = Za.pursuitInterval);
}
function gl(e) {
  return e.kind === "furnacemaster" ? e.hp <= e.maxHp * Pt.burningAt ? 3 : e.hp <= e.maxHp * Pt.connectedAt ? 2 : 1 : e.kind === "warden" ? e.hp <= e.maxHp * 0.3 ? 3 : e.hp <= e.maxHp * 0.65 ? 2 : 1 : e.hp <= e.maxHp * 0.5 ? 2 : 1;
}
function vl(e, a, r, t) {
  const n = he(a, a.target), s = Ha(r, a, n, Math.min(7.5, Math.hypot(a.target.x - a.x, a.target.y - a.y) + 1), be[a.kind].radius);
  a.motionAngle = n, a.motion = Math.ceil(s / 0.32), a.stun = 24;
  const o = Ae(e, a, n, s, be[a.kind].radius, 24, 0);
  if (o.life = Math.max(1, a.motion), t) {
    const l = Je(a, n, s);
    s > 1 && Ye(e, l, 2.8, 24 + a.motion + 20, 23);
  }
  a.exposed = Math.max(a.exposed, 24 + a.motion + 70);
}
function Qs(e, a, r) {
  const t = a.pattern % (a.kind === "keeper" && a.phase === 1 ? 2 : 3), n = (s, o, l, c, i) => Ae(e, a, s, Ha(r, a, s, o, l), l, c, i);
  if (a.kind === "warden" || a.kind === "keeper") if (t === 0) vl(e, a, r, a.kind === "warden" && a.phase > 1);
  else if (t === 1) {
    const s = he(a, a.target);
    Ye(e, Je(a, s, Ha(r, a, s, 2.4, 0.3)), a.kind === "keeper" ? 2.5 : 3, 25, a.kind === "keeper" ? 20 : 24), a.exposed = Math.max(a.exposed, 95), a.stun = 25;
  } else a.kind === "keeper" || a.phase === 3 ? (n(he(a, a.target), a.kind === "keeper" ? 10 : 15, 0.9, 30, 23), a.exposed = Math.max(a.exposed, 100), a.stun = 30) : (Ea(e, a, a.angle, 5, 1.3, 14, 0.2), a.exposed = Math.max(a.exposed, 65));
  else if (t === 0)
    n(he(a, a.target), 16, 0.8, 30, 20), a.phase > 1 && e.hazards.filter((s) => !s.friendly && s.kind === "poison").length < 2 && me(e, a.target, "poison", 2, 40, 150, 9);
  else if (t === 1) {
    for (const s of [-1, 1]) n(a.angle + s * 0.7, 13, 1, 32, 21);
    a.exposed = Math.max(a.exposed, 110), a.stun = 32;
  } else
    me(e, a, "ring", 7, 36, 10, 22, !1, {
      inner: 3.8,
      angle: a.angle + Math.PI / 2,
      gap: Ge.rootRingGap
    }), a.exposed = Math.max(a.exposed, 110), a.stun = 36;
  a.pattern++;
}
function wl(e, a, r) {
  const t = a.pattern % (a.kind === "bridgekeeper" ? 3 : 4), n = (s, o, l, c = vn.wait, i = vn.damage) => Ae(e, a, s, Ha(r, a, s, o, l), l, c, i);
  if (t === 0) {
    const s = n(he(a, a.target), 18, 0.55, 36, 15);
    s.pull = mo.pullDistance, a.stun = 36, a.exposed = Math.max(a.exposed, 108);
  } else if (t === 1) {
    const s = he(a, a.target);
    Ye(e, Je(a, s, Ha(r, a, s, 2.8, 0.35)), 2.7, 28, 26), a.stun = 28, a.exposed = Math.max(a.exposed, 112);
  } else if (t === 2) {
    const s = he(a, a.target);
    for (const o of [-1, 1]) n(s + o * 0.62, 20, 1.15);
    a.stun = vn.wait, a.exposed = Math.max(a.exposed, 125);
  } else {
    const s = he(a, a.target), o = a.pattern % 8 < 4 ? -1 : 1;
    n(s, 18, 1.1, 38), a.phase > 1 && n(s + o * 0.9, 18, 1.1, 58), a.stun = 38, a.exposed = Math.max(a.exposed, 135);
  }
  a.pattern++;
}
var kt = (e, a) => {
  e.motion = a, e.motionAngle = he(e, e.target), e.stun = 18;
}, yl = {
  keeper(e, a, r) {
    r ? Qs(e, a, r) : Ye(e, a.target, 2.5, 24, Xa.keeper.damage);
  },
  warden(e, a, r) {
    const t = a.pattern % 3, n = Xa.warden.damage;
    if (t === 0)
      kt(a, 24), Ae(e, a, a.motionAngle, 13, 1.1, 18, n);
    else if (t === 1) {
      for (let s = -1; s <= 1; s++) Ye(e, Je(a, a.angle + s * 0.55, 3.5), 1.8, 12 + Math.abs(s) * 8, n);
      a.exposed = Math.max(a.exposed, 65);
    } else
      Ea(e, a, a.angle, 5 + a.phase * 2, 1.5, n * 0.65), a.phase > 1 && qe(e, "guard", {
        x: -7,
        y: -7
      }, r);
  },
  thornheart(e, a, r) {
    const t = a.pattern % 4;
    if (t === 0) for (let n = 0; n < 5; n++) me(e, Je(a.target, n * Ya / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (t === 1)
      me(e, a, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), a.exposed = Math.max(a.exposed, 80);
    else if (t === 2) for (const n of [-7, 7]) qe(e, "stalker", {
      x: n,
      y: -6
    }, r);
    else for (let n = 0; n < 3 + a.phase; n++) Ae(e, a, a.angle + n * Ya / (3 + a.phase), 15, 0.55, 25, 18);
  },
  weaver(e, a) {
    const r = a.pattern % 4;
    if (r === 0)
      a.x = a.target.x > 0 ? -7 : 7, a.y = -5, xe(e, a, "burst", 2), Ae(e, {
        x: -10,
        y: a.target.y
      }, 0, 20, 0.7, 30, 21), Ae(e, {
        x: a.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (r === 1) Ea(e, a, he(a, e.player), 7 + a.phase, 1.8, 13, 0.2);
    else if (r === 2) {
      for (let t = 0; t < 4; t++) {
        const n = Je({
          x: 0,
          y: 0
        }, t * Math.PI / 2 + Math.PI / 4, 7);
        Ae(e, n, he(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + t * 8, 18);
      }
      a.exposed = Math.max(a.exposed, 75);
    } else
      qe(e, "wisp", {
        x: -7,
        y: 5
      }), qe(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, a) {
    const r = a.pattern % 3, t = a.pattern * 0.53;
    if (r === 0) for (let n = 0; n < 7; n++)
      n !== a.phase && Ae(e, a, t + n * Ya / 7, 18, 0.6, 32, 23);
    else if (r === 1) for (let n = 0; n < 6; n++) {
      const s = Je({
        x: 0,
        y: 0
      }, n * Ya / 6, 9);
      Ea(e, s, he(s, a.target), 2 + a.phase, 0.45, 12, 0.16);
    }
    else
      Ye(e, a.target, 2, 18, 24), me(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), a.exposed = Math.max(a.exposed, 90);
  },
  king(e, a) {
    const r = a.pattern % 4;
    if (r === 0)
      kt(a, 18), Ae(e, a, a.motionAngle, 10, 0.9, 18, 24);
    else if (r === 1) for (let t = 0; t < 2 + a.phase; t++) Ye(e, Je(a, a.angle + (t % 2 ? 0.65 : -0.65), 3), 2, 7 + t * 10, 23);
    else r === 2 ? (Ae(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Ae(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), a.exposed = Math.max(a.exposed, 65)) : (Ea(e, a, a.angle, 3, 0.55, 18, 0.29), a.phase > 1 && (qe(e, "stalker", {
      x: -8,
      y: 3
    }), qe(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, a) {
    const r = a.pattern % 4;
    if (r === 0) {
      kt(a, 28);
      for (let t = 0; t < 6; t++) me(e, Je(a, a.motionAngle, t * 2), "fire", 1.2, 20 + t * 4, 95, 13);
    } else if (r === 1) Zr(e, a, 10 + a.phase * 2, a.pattern * 0.32, 13, 0.17);
    else if (r === 2)
      a.x = 0, a.y = 0, me(e, a, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), a.exposed = Math.max(a.exposed, 85);
    else for (const t of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) qe(e, "bomber", t);
  },
  forgemaster(e, a) {
    const r = a.pattern % 4;
    if (r === 0) for (const t of [
      -7,
      0,
      7
    ]) Ae(e, {
      x: t,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (r === 1) for (let t = -1; t <= 1; t++) me(e, {
      x: a.target.x + t * 2.5,
      y: a.target.y
    }, "fire", 1.6, 28 + Math.abs(t) * 7, 100, 14);
    else r === 2 ? (Ye(e, a, 4, 18, 26), a.exposed = Math.max(a.exposed, 100)) : (qe(e, "bomber", {
      x: -8,
      y: 5
    }), a.phase > 1 && qe(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, a) {
    const r = a.pattern % 3;
    if (r === 0) for (let t = 0; t < 3; t++) me(e, a, "ring", 3 + t * 3, 20 + t * 19, 9, 23, !1, { inner: 1.4 + t * 3 });
    else if (r === 1)
      kt(a, 30), Ae(e, a, a.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const t of [-1, 1]) Ye(e, {
        x: a.target.x + t * 2,
        y: a.target.y
      }, 2.7, 30, 25);
      a.exposed = Math.max(a.exposed, 110);
    }
  },
  frostqueen(e, a) {
    const r = a.pattern % 4;
    if (r === 0) for (let t = 0; t < 4; t++) me(e, Je(a.target, t * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else r === 1 ? Ea(e, a, a.angle, 9, 2.2, 14, 0.21) : r === 2 ? (a.x = -a.x, a.y = -a.y, Ae(e, a, he(a, a.target), 20, 1.2, 32, 24), a.exposed = Math.max(a.exposed, 85)) : (me(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), qe(e, "stalker", {
      x: 0,
      y: -8
    }));
  },
  leviathan(e, a) {
    const r = a.pattern % 4;
    if (r === 0)
      a.x = -9, a.y = a.target.y, a.target = {
        x: 9,
        y: a.y
      }, kt(a, 40), Ae(e, a, 0, 19, 1.4, 14, 25);
    else if (r === 1) for (let t = 0; t < 4; t++) Ae(e, {
      x: -10,
      y: -8 + t * 5
    }, 0, 20, 0.7, 20 + t * 13, 20);
    else r === 2 ? (Ye(e, a.target, 3.8, 28, 26), a.exposed = Math.max(a.exposed, 95)) : (me(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: a.phase > 1 ? 4 : 6 }), Ea(e, a, a.angle, 5, 1.3, 14));
  },
  archivist(e, a) {
    const r = a.pattern % 4;
    if (r === 0)
      a.memory.push({ ...a.target }), a.memory = a.memory.slice(-4), Ye(e, a.target, 2.3, 24, 21);
    else if (r === 1) for (let t = 0; t < a.memory.length; t++) Ye(e, a.memory[t], 2.6, 22 + t * 8, 24);
    else if (r === 2) {
      for (const t of a.memory) Ae(e, t, he(t, a.target), 18, 0.65, 32, 22);
      qe(e, "wisp", {
        x: -7,
        y: -7
      }), qe(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Zr(e, a, 12, a.pattern * 0.2, 14), a.exposed = Math.max(a.exposed, 100);
  },
  voidknight(e, a) {
    const r = a.pattern % 4;
    if (r === 0)
      a.x = Math.max(-8, Math.min(8, -a.target.x)), a.y = Math.max(-8, Math.min(8, -a.target.y)), xe(e, a, "burst", 2), Ae(e, a, he(a, a.target), 20, 0.8, 24, 26);
    else if (r === 1)
      kt(a, 20), Ea(e, a, a.angle, 3 + a.phase, 0.9, 15, 0.26);
    else if (r === 2)
      Ye(e, a, 3, 12, 26), me(e, a, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), a.exposed = Math.max(a.exposed, 65);
    else for (const t of [{
      x: a.target.x,
      y: -9
    }, {
      x: -9,
      y: a.target.y
    }]) Ae(e, t, he(t, a.target), 20, 0.6, 22, 23);
  }
};
function xl(e, a, r, t) {
  if (a.kind === "kilnheart" || a.kind === "furnacemaster") {
    t || ge("invalid"), sl(e, a, t);
    return;
  }
  if (a.kind === "bridgekeeper" || a.kind === "heatkeeper") {
    t || ge("invalid"), wl(e, a, t);
    return;
  }
  if (t?.segment && [
    "keeper",
    "warden",
    "thornheart"
  ].includes(a.kind)) {
    Qs(e, a, t);
    return;
  }
  const n = a.kind;
  for (; a.phase < (a.hp / a.maxHp < 0.3 ? 3 : a.hp / a.maxHp < 0.65 ? 2 : 1); ) {
    const s = a.phase + 1;
    a.phase = s, xe(e, a, "burst", 4), n === "phoenix" && s === 2 && (a.hp = Math.min(a.maxHp, a.hp + a.maxHp * 0.12), me(e, a, "fire", 3, 25, 100, 14)), n === "archivist" && (a.memory.push({
      x: e.player.x,
      y: e.player.y
    }), a.memory = a.memory.slice(-4)), r.oaths.includes("legion") && qe(e, "stalker", {
      x: a.x > 0 ? -8 : 8,
      y: 6
    }, t);
  }
  yl[n](e, a, t), a.pattern++;
}
function _l(e, a, r) {
  if (!Oe(a.kind) && [
    "soldier",
    "guard",
    "stalker"
  ].includes(a.kind)) {
    if (r?.segment && a.kind === "soldier") return e.player;
    const t = e.companions.filter((n) => n.hp > 0 && n.life > 0 && V(n, a) < 2.8 && ce(r, a, n)).sort((n, s) => V(n, a) - V(s, a))[0];
    if (t) return t;
    if (e.encounter === "siege" && !e.boss && (a.kind === "soldier" || a.kind === "guard" || a.kind === "charger") && V(a, e.player) > 3) return e.objective;
  }
  return e.player;
}
function kl(e, a, r, t, n) {
  const s = be[a.kind];
  V(a.target, e.player) < t && V(a, e.player) < s.reach + 1 && ce(n, a, e.player) && Cn(e, s.damage, r, n);
  for (const o of e.companions) V(a.target, o) < t && V(a, o) < s.reach + 1 && ce(n, a, o) && (o.hp -= s.damage);
  !e.boss && e.encounter === "siege" && V(a.target, e.objective) < t && V(a, e.objective) < s.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - s.damage * 0.5)), xe(e, a.target, "slash", t, a.angle);
}
function Ml(e, a, r, t) {
  const n = be[a.kind];
  if (Oe(a.kind)) {
    xl(e, a, r, t);
    return;
  }
  switch (a.kind) {
    case "archer":
      Ea(e, a, a.angle, e.chapter > 0 ? 3 : 1, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const s of e.enemies) s.hp > 0 && !Oe(s.kind) && V(s, a) < 3.5 && ce(t, a, s) && (s.hp = Math.min(s.maxHp, s.hp + 8));
      Ea(e, a, a.angle, 3, 0.7, n.damage, 0.18), xe(e, a, "heal", 3.5);
      break;
    case "charger":
      a.motion = 23, a.motionAngle = a.angle;
      break;
    case "bomber":
      me(e, a.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      Ua(e, a, a.angle, n.damage, !1, { speed: 0.3 }), a.motion = 7, a.motionAngle = a.angle + Math.PI / 2;
      break;
    case "guard":
      Ye(e, a.target, 1.7, 8, n.damage), a.exposed = Math.max(a.exposed, 60);
      break;
    default:
      kl(e, a, r, n.reach + 0.15, t);
  }
}
function jl(e, a, r, t) {
  const n = be[a.kind], s = {
    x: a.x,
    y: a.y
  }, o = a.kind === "leviathan" ? 0.44 : a.kind === "wisp" ? 0.24 : 0.32;
  if (ca(e, a, a.motionAngle, o, n.radius, t), a.motion--, a.kind !== "wisp") {
    V(a, e.player) < n.radius + 0.4 && ce(t, a, e.player) && (Cn(e, n.damage, r, t), a.motion = 0);
    for (const l of e.companions) V(a, l) < n.radius + 0.3 && ce(t, a, l) && (l.hp -= n.damage, a.motion = 0);
    !e.boss && e.encounter === "siege" && V(a, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), a.motion = 0), V(s, a) < o * 0.65 && (a.motion = 0, a.exposed = Math.max(a.exposed, 80), a.stun = 24, xe(e, a, "guard", 2));
  }
  a.motion || (a.cooldown = Math.max(a.cooldown, 28));
}
function Sl(e, a, r, t) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    if (t?.segment && Oe(n.kind)) {
      const d = gl(n);
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
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && sa(e, n, 2 + (d === "burn" ? L(a, "cinder") + L(a, "inferno") : d === "bleed" ? L(a, "hemorrhage") + L(a, "blood-dance") : L(a, "venom")) * 1.5, a, "passive", t ? n : e.player, t));
    if (n.hp <= 0 || n.kind === "coupler" || hl(e, n, t)) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      jl(e, n, a, t);
      continue;
    }
    const s = be[n.kind], o = a.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (Ml(e, n, a, t), n.cooldown = Math.max(n.cooldown, t?.segment && Oe(n.kind) ? n.phase === 3 ? 95 : 75 : Math.round(s.cooldown * (o ? 0.8 : 1) / (Oe(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1))));
      continue;
    }
    const l = _l(e, n, t), c = V(n, l), i = ce(t, n, l);
    n.cooldown = Math.max(0, n.cooldown - 1), n.angle = he(n, l);
    const h = t?.segment && e.enemies.filter((d) => d.id !== n.id && d.hp > 0 && (d.windup > 0 || d.motion > 0)).length + e.hazards.filter((d) => !d.friendly && d.life > 0).length >= Ge.simultaneousWindups;
    if (!n.cooldown && c < s.reach && i && !h) {
      if (n.target = {
        x: l.x,
        y: l.y
      }, n.windup = Math.round(s.windup * (o ? 0.8 : 1)), l === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : c / 0.24, f = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(r.x, r.y))), b = {
          x: l.x + r.x * f,
          y: l.y + r.y * f
        };
        t ? ce(t, n, b) && ce(t, l, b) && (n.target = b) : (n.target.x = Math.max(-10, Math.min(10, b.x)), n.target.y = Math.max(-10, Math.min(10, b.y))), n.angle = he(n, n.target);
      }
      continue;
    }
    const u = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (c > (u ? 5 : Oe(n.kind) ? 2.8 : 0.95) || u && c < 3 || !i) {
      const d = n.kind === "stalker" && c > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, f = Ar(t, n, l, s.radius);
      f !== null && ca(e, n, f + (u && c < 3 && i ? Math.PI : t ? 0 : d), s.speed * (n.chill ? Oe(n.kind) ? 0.8 : 0.5 : 1) * (o ? 1.08 : 1), s.radius, t);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && V(n, d) < s.radius + be[d.kind].radius && ca(e, n, he(d, n), 0.027, s.radius, t);
  }
}
function bn(e, a, r) {
  if (e.kind === "beam") return tl(a, e, e.angle, e.length) < e.width + r;
  const t = V(e, a);
  return e.kind === "ring" && e.gap && Math.abs(Math.atan2(Math.sin(he(e, a) - e.angle), Math.cos(he(e, a) - e.angle))) + Math.asin(Math.min(1, r / Math.max(r, t))) < e.gap / 2 ? !1 : t < e.radius + r && (e.kind !== "ring" || t > e.inner - r);
}
function Rl(e, a, r) {
  for (const t of e.shots) {
    if (t.life <= 0) continue;
    const n = {
      x: t.x,
      y: t.y
    };
    if (t.x += Math.cos(t.angle) * t.speed, t.y += Math.sin(t.angle) * t.speed, t.life--, r ? !ce(r, n, t, t.radius) : Math.abs(t.x) > J.arena || Math.abs(t.y) > J.arena || e.obstacles.some((s) => V(s, t) < s.radius + t.radius)) {
      t.life = 0;
      continue;
    }
    if (!t.friendly) {
      if (V(t, e.player) < J.playerRadius + t.radius && ce(r, t, e.player)) e.player.shield > 0 ? (Bs(e, a, r), t.friendly = !0, t.source = "skill", t.angle += Math.PI, t.damage *= 1.8, t.hits = []) : (Cn(e, t.damage, a, r), t.life = 0);
      else {
        const s = e.companions.find((o) => o.hp > 0 && V(t, o) < 0.3 + t.radius && ce(r, t, o));
        s && (s.hp -= t.damage * (1 - L(a, "covenant") * 0.12), t.life = 0);
      }
      continue;
    }
    for (const s of e.enemies) {
      if (s.hp <= 0 || t.hits.includes(s.id) || V(s, t) > be[s.kind].radius + t.radius || !ce(r, t, s)) continue;
      t.hits.push(s.id);
      const o = t.damage * (L(a, "hunter") && V(s, e.player) > ra.hunterRange ? ra.hunterDamage + (L(a, "hunter") - 1) * 0.15 : 1);
      if (sa(e, s, o, a, t.source, t, r), L(a, "pinning") && t.source === "attack" && (s.chill = 50 + L(a, "pinning") * 20, e.player.combo % 3 === 0 && Ga(e, s, 8 * L(a, "pinning"))), t.splash > 0) {
        xe(e, s, "burst", t.splash);
        for (const l of e.enemies) l.id !== s.id && V(l, s) < t.splash + be[l.kind].radius && sa(e, l, o * 0.55, a, t.source, s, r);
      }
      if (t.bounce > 0) {
        const l = e.enemies.filter((c) => c.hp > 0 && !t.hits.includes(c.id) && V(c, s) < 6 && ce(r, t, c, t.radius)).sort((c, i) => V(s, c) - V(s, i))[0];
        if (l) {
          t.bounce--, t.angle = he(t, l), t.damage *= 0.8;
          break;
        }
      }
      if (t.pierce-- <= 0) {
        t.life = 0;
        break;
      }
    }
  }
  e.shots = e.shots.filter((t) => t.life > 0);
}
function Al(e, a, r) {
  for (const t of [...e.hazards]) {
    if (t.wait > 0) {
      t.wait--;
      continue;
    }
    if (t.life--, !t.friendly) {
      if (t.damage <= 0) continue;
      const s = t.kind === "slam" || t.kind === "beam" || t.kind === "ring";
      if ((s ? !t.hits.includes(0) : e.tick % 15 === 0) && bn(t, e.player, J.playerRadius) && ce(r, t, e.player)) {
        const o = t.pull && !e.player.invulnerable && !e.player.shield && e.player.hp > 0;
        Cn(e, t.damage, a, r), s && t.hits.push(0), o && ca(e, e.player, he(e.player, t), Math.min(t.pull, Math.max(0, V(e.player, t) - 1.8)), J.playerRadius, r);
      }
      if (!e.boss && e.encounter === "siege" && e.tick % 15 === 0 && bn(t, e.objective, 0.6) && ce(r, t, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - t.damage * 0.35)), s || e.tick % 15 === 0)
        for (const o of e.companions) o.hp > 0 && (!s || !t.hits.includes(o.id)) && bn(t, o, 0.3) && ce(r, t, o) && (o.hp -= t.damage * 0.25, s && t.hits.push(o.id));
      continue;
    }
    if (t.kind !== "slam" && t.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((s) => s.hp > 0 && bn(t, s, be[s.kind].radius) && ce(r, t, s));
    t.kind === "mine" && n.length && (t.life = 0, xe(e, t, "burst", t.radius));
    for (const s of n) t.kind === "storm" ? ir(e, s, a, t.damage, r, t) : (t.kind === "fire" && (s.burn = Math.max(s.burn, 45)), t.kind === "frost" && (s.chill = Math.max(s.chill, 60)), t.kind === "mine" && Ga(e, s, 25), sa(e, s, t.damage, a, t.source, t, r));
  }
  e.hazards = e.hazards.filter((t) => t.life > 0);
}
function zl(e, a, r) {
  Rl(e, a, r), Al(e, a, r);
}
function El(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function Cl(e, a, r) {
  const { seed: t, zone: n, chapter: s, elite: o, boss: l, bossKind: c, encounter: i, hp: h } = e, u = {
    tick: 0,
    seed: t,
    serial: 0,
    player: {
      x: 0,
      y: 5,
      hp: h,
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
    obstacles: l ? c === "warden" || c === "colossus" ? [{
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
    waves: l ? 1 : o ? 3 : 2,
    nextWave: 0,
    kills: 0,
    damageTaken: 0,
    status: "fighting",
    zone: n,
    chapter: s,
    elite: o,
    boss: l,
    bossKind: c,
    encounter: i,
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
  return r && ((l && !Wr(c) || r.waves.some((d) => d.some((f) => !Wr(f.kind)))) && Ue("encounter_unsupported"), (i !== "skirmish" || !r.waves.length || !Fa(r.space, r.entry, J.playerRadius) || r.waves.some((d) => !d.length || d.some((f) => !Fa(r.space, f.position, be[f.kind].radius) || !ut(r.space, r.entry, f.position, J.playerRadius)))) && Ue("map_invalid"), Object.assign(u.player, r.entry), Object.assign(u.objective, r.objective), u.obstacles = [], u.waves = r.waves.length), ml(u), wn(u, a, r), u;
}
function Pl(e, a, r, t) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((s) => --s.life > 0).slice(-80);
  const n = cl(e, a, r, t);
  dl(e, r, t), Sl(e, r, n, t), zl(e, r, t), e.enemies = e.enemies.filter((s) => s.hp > 0), El(e) ? e.status = "lost" : (fl(e, r, t), bl(e, t) && (e.status = "won", e.shots = [], e.hazards = []));
}
function Ol(e, a) {
  const r = e.at(-1);
  r && r.move === a.move && r.dash === a.dash && r.skill === a.skill ? r.ticks++ : e.push({
    ...a,
    ticks: 1
  });
}
var Fl = 2.4;
function qa(e, a) {
  return (!e?.all || e.all.every((r) => a.has(r))) && (!e?.none || e.none.every((r) => !a.has(r)));
}
var Yr = /* @__PURE__ */ new WeakMap();
function Ta(e, a) {
  const r = e.gates.filter((o) => qa(o.condition, a)).map((o) => o.id), t = r.join("/");
  let n = Yr.get(e);
  n || (n = /* @__PURE__ */ new Map(), Yr.set(e, n));
  let s = n.get(t);
  return s || (s = Hs(e.map, new Set(r)), n.set(t, s)), s;
}
function Pn(e, a) {
  const r = e.exits.filter((n) => qa(n.condition, a)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), t = e.objects.filter((n) => qa(n.condition, a) && !(n.kind === "switch" && a.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...r, ...t];
}
function Ft(e, a, r) {
  const t = Ta(e, r);
  return Pn(e, r).filter((n) => V(a.position, n.position) <= 2.4 && Be(t, a.position, n.position)).sort((n, s) => V(a.position, n.position) - V(a.position, s.position) || n.target.id.localeCompare(s.target.id));
}
function Tl(e, a, r, t = 1) {
  (!Number.isInteger(a) || a < 0 || a > 8) && Ue("input_invalid"), a && (e.facing = Rr(a), Sr(r, e.position, {
    x: Math.cos(e.facing) * J.speed * t,
    y: Math.sin(e.facing) * J.speed * t
  }, J.playerRadius));
}
var Ll = [
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
  "coal_store",
  ...vo
], Pe = (e, a) => ({
  kind: e,
  anchor: a
}), fa = {
  ...Fs,
  ...Cs,
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
      Pe("soldier", "front_left"),
      Pe("soldier", "front_right"),
      Pe("archer", "front_archer")
    ], [
      Pe("guard", "patrol"),
      Pe("soldier", "lookout"),
      Pe("bomber", "flank")
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
      Pe("guard", "guard"),
      Pe("soldier", "flank"),
      Pe("archer", "archer"),
      Pe("archer", "archer_left")
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
      Pe("guard", "guard"),
      Pe("archer", "archer"),
      Pe("bomber", "bomber")
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
      Pe("soldier", "front_left"),
      Pe("soldier", "front_right"),
      Pe("archer", "front_archer")
    ], [
      Pe("guard", "front_guard"),
      Pe("bomber", "front_bomber"),
      Pe("soldier", "front_flank")
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
    waves: [[Pe("keeper", "guard")]]
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
    waves: [[Pe("warden", "warden")]]
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
    waves: [[Pe("thornheart", "tree")]]
  }
}, On = (e) => Ll.filter((a) => fa[a].scene === e), jn = (e, a, r) => {
  const t = fa[e];
  return t.complete ? a.has(t.complete) : r.includes(e) || On(t.scene).some((n) => {
    const s = fa[n];
    return s.prerequisite === e && s.complete && a.has(s.complete);
  });
};
function Ks(e, a, r) {
  return On(e).find((t) => !jn(t, a, r) && (!fa[t].prerequisite || jn(fa[t].prerequisite, a, r)));
}
function Ys(e, a, r, t, n, s) {
  const o = fa[e];
  if (o.complete && a.has(o.complete)) return null;
  const l = Se[o.scene];
  return {
    setup: {
      seed: t,
      zone: Xa[o.boss ?? "warden"].region,
      chapter: Object.hasOwn(Cs, e) ? 2 : Object.hasOwn(Fs, e) ? 1 : 0,
      elite: e === "coal_store",
      boss: o.boss !== null,
      bossKind: o.boss ?? "warden",
      encounter: "skirmish",
      hp: n
    },
    field: {
      space: Ns(Ta(l, a), o.bounds),
      entry: r,
      objective: l.anchors[o.trigger],
      waves: o.waves.map((c) => c.filter((i) => !(e === "furnace_scaffold" && a.has("furnace_residents_helped") && i.kind === "bomber")).map((i) => ({
        kind: i.kind,
        position: l.anchors[i.anchor]
      }))),
      summonPoints: o.summons.map((c) => l.anchors[c]),
      bounds: o.bounds,
      segment: e,
      reinforcement: s,
      enemyLimit: o.boss ? Ge.bossEnemyLimit : Ge.enemyLimit,
      ...e === "beacon" ? { signalPoint: l.anchors.signal } : {},
      ...e === "furnace_heart" ? { furnacePrepared: a.has("furnace_workers_helped") } : {}
    }
  };
}
var Xe = {
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
}, Fn = Object.keys(Xe), or = [
  ..._a,
  ...Fn,
  ...bt
];
function ze(e) {
  return Object.hasOwn(qs, e);
}
function Vs(e) {
  return Object.hasOwn(Xe, e);
}
function ka(e) {
  return Object.hasOwn(Ne, e);
}
function Ze(e) {
  return ze(e) ? qs[e] : Vs(e) ? Xe[e].name : Ne[e].name;
}
var Il = {
  visit_wen: {
    people: ["sanniang"],
    requires: lt,
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
    requires: lt,
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
    requires: lt,
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
    requires: lt,
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
}, Tt = {
  ...Il,
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
    requires: lt,
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
}, Js = Object.keys(Tt);
function Xs(e) {
  return e && Object.hasOwn(Tt, e) ? Tt[e] : void 0;
}
function Vr(e, a) {
  if (!ze(a) && !ka(a)) return [];
  const { facts: r } = e, t = ze(a) ? e.people[a].scene : Ne[a].scene;
  return Js.filter((n) => {
    if (n === "receiving" && r.includes("captives_arrived")) return !1;
    const s = Tt[n];
    if (s.district && pa(t) !== s.district || s.scenes && !s.scenes.includes(t) || s.excludes?.some((o) => r.includes(o)) || s.minPeak !== void 0 && (!ze(a) || e.relationships[a].highestBand < s.minPeak) || s.present?.some((o) => (ze(o) ? e.people[o].scene : ka(o) ? Ne[o].scene : null) !== t)) return !1;
    if (s.atClinic) {
      if (!ze(a)) return !1;
      const o = e.people[a], l = Jt[a].station, c = Se[l.scene].anchors[l.anchor];
      if (t !== "clinic_front" && !(t === l.scene && Math.hypot(o.position.x - c.x, o.position.y - c.y) <= 2.4)) return !1;
    }
    return s.people.includes(a) && !r.includes(s.fact) && s.requires.every((o) => r.includes(o));
  });
}
function $l(e, a) {
  if (a.kind === "reward") {
    const r = e.rewards[a.node];
    return !!r?.offers.length && r.scene === e.location.scene;
  }
  return a.kind !== "rest" || e.location.scene !== "waterway" || jn("waterway_approach", new Set(e.facts), e.completedSegments);
}
function zr(e, a = !1) {
  const r = Se[e.location.scene], t = new Set(e.facts);
  return (a ? Ft(r, e.location, t) : Pn(r, t)).filter((n) => n.kind === "exit" || $l(e, n.target));
}
function ei(e) {
  return e.phase === "exploration" && (Se[e.location.scene].safe || zr(e, !0).some((a) => a.kind === "object" && a.target.kind === "rest"));
}
function ql(e, a) {
  return e === "kouzi_home" && a === "deep_waterway" || e === "deep_waterway" && a === "kouzi_home";
}
function Er(e, a) {
  const r = e.knowledge[a], t = a === "kouzi" || r.includes("deep_route_agreed") || r.includes("deep_route_walked"), n = t || e.facts.includes("deep_route_shared") || ze(a) && e.people[a].scene === "deep_waterway";
  return {
    place: (s) => s !== "deep_waterway" || n,
    exit: (s, o) => ql(s, o) ? t : s !== "deep_waterway" && o !== "deep_waterway" || n
  };
}
var pt = (e, a) => Math.hypot(e.x - a.x, e.y - a.y), Jr = /* @__PURE__ */ new WeakMap();
function lr(e, a, r) {
  if (Be(e, a, r, J.playerRadius)) return r;
  const t = ht(e.map, a), n = ht(e.map, r), s = `${t.column},${t.row}/${n.column},${n.row}`;
  let o = Jr.get(e);
  o || (o = /* @__PURE__ */ new Map(), Jr.set(e, o));
  const l = dt(e.map, t.column, t.row);
  if (!o.has(s)) {
    const i = ut(e, l, dt(e.map, n.column, n.row), J.playerRadius);
    o.size >= 512 && o.delete(o.keys().next().value), o.set(s, i?.find((h) => pt(h, l) > 0.01) ?? null);
  }
  const c = o.get(s);
  return c ? Be(e, a, c, J.playerRadius) ? c : l : null;
}
function Hl(e) {
  return {
    scene: e.scene,
    position: { ...Se[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function cr(e, a) {
  return On(e).every((r) => {
    const t = fa[r];
    return t.complete === null || a.has(t.complete);
  });
}
function Sn(e, a, r, t, n) {
  const s = [{
    ...e,
    route: []
  }], o = /* @__PURE__ */ new Set();
  for (; s.length; ) {
    const l = s.shift(), c = Se[l.scene], i = Ta(c, r);
    if (l.scene === a.scene && lr(i, l.position, c.anchors[a.anchor])) return l.route;
    for (const h of Se[l.scene].exits) {
      const u = `${h.to}/${h.arrival}`;
      o.has(u) || n && !n(l.scene, h.to) || !qa(h.condition, r) || t && !cr(h.to, r) || !lr(i, l.position, c.anchors[h.anchor]) || (o.add(u), s.push({
        scene: h.to,
        position: Se[h.to].anchors[h.arrival],
        route: [...l.route, h]
      }));
    }
  }
  return null;
}
function ai(e, a) {
  const r = new Set(e.facts), t = e.people[a], n = Er(e, a);
  return Object.entries(zn).filter(([, s]) => n.place(s.scene) && (!kr(pa(s.scene)) || lt.every((o) => r.has(o)) && (s.scene !== "deep_waterway" || r.has("deep_route_agreed")))).map(([s, o]) => {
    const l = Sn(t, o, r, !1, n.exit), c = cr(o.scene, r), i = cr(t.scene, r) && c ? Sn(t, o, r, !0, n.exit) : null;
    return {
      id: s,
      name: o.name,
      ...ar(o.scene) ? { use: ar(o.scene).use } : {},
      personHere: t.scene === o.scene && (s === o.scene || pt(t.position, Se[o.scene].anchors[o.anchor]) <= 2.4),
      playerHere: e.location.scene === o.scene && (s === o.scene || pt(e.location.position, Se[o.scene].anchors[o.anchor]) <= 2.4),
      accessible: l !== null,
      safe: c,
      solo: i !== null,
      route: i ?? l
    };
  });
}
function Ul(e, a) {
  return zs(e.facts, a) !== "confined";
}
var ti = (e) => Fl * (0.7 + _a.indexOf(e) / _a.length * 0.2);
function Gl(e) {
  return _a.some((a) => e.people[a].mode === "travel" || e.people[a].mode === "follow" && pt(e.people[a].position, e.location.position) >= ti(a));
}
function ni(e, a) {
  return _a.filter((r) => a[r].scene === e).map((r) => ({
    kind: "object",
    position: a[r].position,
    target: {
      id: r,
      anchor: "",
      kind: "person",
      person: r
    }
  }));
}
function ri(e) {
  return [...zr(e), ...ni(e.location.scene, e.people)];
}
function si(e) {
  return Tn(Se[e.location.scene], e.location.position, new Set(e.facts), e.people);
}
function Tn(e, a, r, t) {
  return ni(e.id, t).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const s = e.id === "cells" && !!Jt[n.target.person].returnFact && !r.has("captives_released"), o = Ta(e, s ? /* @__PURE__ */ new Set([...r, "captives_released"]) : r);
    return pt(n.position, a) <= (s ? 5 : 2.4) && Be(o, a, n.position);
  });
}
function Nl(e) {
  const a = new Set(e.facts);
  for (const r of _a) {
    const t = e.people[r];
    if (t.mode === "idle") continue;
    const n = Se[t.scene], s = Ta(n, a);
    let o, l;
    if (t.mode === "follow") {
      if (t.scene !== e.location.scene && ge("invalid"), o = e.location.position, pt(t.position, o) < ti(r)) continue;
    } else {
      const f = zn[t.destination], b = Sn(t, f, a, !0, Er(e, r).exit);
      if (b || ge("unavailable"), l = b[0], o = n.anchors[l?.anchor ?? f.anchor], pt(t.position, o) < 0.2) {
        l ? (t.scene = l.to, t.position = { ...Se[l.to].anchors[l.arrival] }) : (t.mode = "idle", t.destination = null);
        continue;
      }
    }
    const c = lr(s, t.position, o);
    c || ge("unavailable");
    const i = c.x - t.position.x, h = c.y - t.position.y, u = Math.hypot(i, h), d = Math.min(u, J.speed * 1.8);
    u && (t.facing = Math.atan2(h, i), Sr(s, t.position, {
      x: i / u * d,
      y: h / u * d
    }, J.playerRadius));
  }
}
function Rn(e, a) {
  const r = Xe[e];
  return Se[r.scene].anchors[a.has(r.complete) ? r.clearedAnchor : r.anchor];
}
function rn(e, a, r) {
  return Fn.filter((t) => Xe[t].scene === e).flatMap((t) => {
    const n = Rn(t, r), s = Xe[t];
    return Math.hypot(a.x - n.x, a.y - n.y) <= s.approachRadius ? [{
      kind: "object",
      target: {
        id: t,
        anchor: "",
        kind: "enemy",
        enemy: t
      },
      position: n
    }] : [];
  });
}
function Dl(e, a) {
  return e.phase === "exploration" && !e.pendingParley && rn(e.location.scene, e.location.position, new Set(e.facts)).some((r) => r.target.id === a);
}
function dr(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && ge("invalid"), e;
}
function Xr(e, a = 0, r = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < a || Number(e) > r) && ge("invalid"), e;
}
function Ja(e, a) {
  return (typeof e != "string" || !a.includes(e)) && ge("invalid"), e;
}
function es(e, a, r) {
  return (!Array.isArray(e) || e.length > a) && ge("invalid"), e.map(r);
}
function Wl(e) {
  return new Set(e).size !== e.length && ge("invalid"), e;
}
function as(e) {
  typeof e != "boolean" && ge("invalid");
}
function Bl(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && ge("identity"), e;
}
var an = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), Zl = Object.keys(an), ii = ["male", "female"];
function Ql(e) {
  const a = dr(e);
  return (typeof a.name != "string" || !a.name.trim() || a.name.trim().length > 24 || /[\r\n]/.test(a.name)) && ge("invalid"), {
    name: a.name.trim(),
    gender: Ja(a.gender, ii),
    ...a.appearanceAge === void 0 ? {} : { appearanceAge: Ja(a.appearanceAge, Zl) }
  };
}
var Kl = {
  ...Object.fromEntries(bt.map((e) => [e, { initial: { reply: Ne[e].greeting } }])),
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
function oi(e, a) {
  const r = Kl[a], t = ze(a) && Xt(e.facts, a) && r.returned ? r.returned : r.initial;
  return {
    id: `greeting-${a}`,
    kind: "greeting",
    player: "",
    ...structuredClone(t),
    action: null,
    scene: e.location.scene,
    facts: [...e.knowledge[a]]
  };
}
var Lt = Object.freeze({
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
function Cr(e) {
  return Lt.bands.filter((a) => e >= a).length - 1;
}
function Yl(e) {
  const a = e.lastReply;
  if (!a) return null;
  const r = e.conversations[a.person].at(-1);
  return r?.id === a.turnId ? {
    person: a.person,
    turn: r
  } : null;
}
function ts(e, a) {
  const r = e.conversations[a].at(-1);
  return r && r.kind !== "greeting" ? r : null;
}
function Vl(e) {
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
function Ln(e) {
  const a = Yl(e), r = Xs(a?.turn.action ?? null);
  return a && r?.confirm && !e.facts.includes(r.fact) ? a.person : null;
}
var li = Object.freeze({
  rankCap: 2,
  choices: 3
}), Jl = [
  "city_arrival",
  "return_plan",
  "bridge",
  "heatkeeper",
  "coal_store"
], Xl = [
  "furnace_trial",
  "furnace_convoy",
  "furnace_ascent"
], ec = (e) => Jl.includes(e) || Xl.includes(e) ? 3 : li.rankCap, ac = [
  "crossroads",
  "approach",
  "passage"
], tc = {
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
}, nc = {
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
function rc(e, a) {
  if (e.rewards[a]) return;
  const r = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((c) => e.equipped.includes(c.id))
  }, t = new Set(Object.values(e.rewards).flatMap((c) => c.offers.map((i) => i.id))), n = ac.includes(a), s = al(e.weapon).flatMap((c) => {
    const i = e.collection.find((h) => h.id === c)?.rank ?? 0;
    return !t.has(c) && i < ec(a) && (!n || !i) && Gs(r, c) && (Ot[c].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: c,
      rank: i + 1
    }] : [];
  }), o = [], l = (c) => {
    const i = Nr(e, s.filter((h) => c.includes(h.id) && !o.some((u) => u.id === h.id)), 1)[0];
    i && o.push(i);
  };
  if (a === "crossroads") for (const c of tc[e.weapon]) l([c]);
  else
    l(e.equipped.flatMap((c) => nc[c] ?? [])), l(s.filter((c) => ["guard", "life"].includes(Ot[c.id].family)).map((c) => c.id));
  o.push(...Nr(e, s.filter((c) => !o.some((i) => i.id === c.id)), li.choices - o.length)), e.rewards[a] = {
    scene: e.location.scene,
    offers: o
  };
}
var sc = (e) => e.rewardNode ? e.rewards[e.rewardNode].offers : [];
function ic(e, a) {
  const r = Mr(a), t = new Set(e.facts);
  if (!r) return null;
  const n = t.has(r.fact), s = new Set(n ? [] : si(e).map((h) => h.target.id)), o = n ? [] : (r.witnesses ?? []).filter((h) => ze(h) ? !s.has(h) : !ka(h) || Ne[h].scene !== e.location.scene), l = Os.find((h) => r.witnesses?.includes(h.person))?.resolved.find((h) => t.has(h));
  let c = o.length ? Ve.awaitWitness(o.map(Ze).join("、")) : r.body, i = !n && !o.length ? r.operation ?? null : null;
  return !n && a === "return_trial" && t.has("bridge_cleared") && (c = Ve.trialAfterBridge, i && (i = {
    ...i,
    setup: Ve.trialAfterBridgeSetup
  })), n && (c = `${Ve.reviewed}
${en[r.fact]}`, l && (c += `

${Ve.now}
${en[l]}`)), t.has("heat_restored") && (a === "heat_notice" && (c = Ve.restoredNotice), a === "return_plan" && (c = Ve.restoredPlan), a === "deep_receipt" && !o.length && !l && (c += `

${Ve.restoredDeep}`)), {
    ...r,
    body: c,
    ready: !o.length,
    read: n,
    operation: i
  };
}
var ci = Object.freeze({
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function Pr(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((a) => e.collection.find((r) => r.id === a))
  };
}
function oc(e, a) {
  return ei(e) ? a.length > J.relicSlots ? "capacity" : new Set(a).size !== a.length || a.some((r) => !e.collection.some((t) => t.id === r)) ? "invalid" : null : "unavailable";
}
function tn(e, a, r) {
  e.facts.includes(a) || e.facts.push(a);
  const t = r ?? [
    ..._a.filter((n) => e.people[n].scene === e.location.scene),
    ...Fn.filter((n) => Xe[n].scene === e.location.scene),
    ...bt.filter((n) => Ne[n].scene === e.location.scene)
  ];
  for (const n of t) e.knowledge[n].includes(a) || e.knowledge[n].push(a);
}
function lc(e) {
  const a = e.checkpoint;
  if (e.engagement)
    return Ys(e.engagement.id, new Set(e.facts), a?.player ?? e.location.position, a?.seed ?? e.seed, a?.player.hp ?? e.hp, e.engagement.reinforcement)?.field;
}
function cc(e, a) {
  const r = e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"), t = Ys(a, new Set(e.facts), e.location.position, Math.floor(En(e) * 4294967296), e.hp, r);
  t || ge("unavailable"), e.engagement = {
    id: a,
    reinforcement: r
  }, e.battle = Cl(t.setup, Pr(e), t.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
}
function ns(e, a) {
  return Ln(e) ? !1 : ka(a) ? e.phase === "exploration" && !e.pendingParley && Ft(Se[e.location.scene], e.location, new Set(e.facts)).some((r) => r.kind === "object" && r.target.kind === "resident" && r.target.person === a) : ze(a) ? e.pendingParley ? !1 : e.phase === "exploration" && si(e).some((r) => r.kind === "object" && r.target.kind === "person" && r.target.person === a) : Dl(e, a);
}
function dc(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const a = pa(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const r of Gr) {
    if (Xt(e.facts, r)) continue;
    const t = e.people[r];
    a && t.scene === "cells" && t.mode === "idle" && (e.people[r] = Hl(Jt[r].station));
    const n = e.people[r].scene;
    pa(n) === "camp" && tn(e, Jt[r].returnFact, _a.filter((s) => e.people[s].scene === n));
  }
  Gr.every((r) => Xt(e.facts, r)) && tn(e, "captives_arrived", _a.filter((r) => e.people[r].scene === "camp"));
}
function hc(e) {
  !e.facts.includes("kouzi_entered_city") && ["south_street", "workshop_street"].includes(pa(e.people.kouzi.scene)) && tn(e, "kouzi_entered_city", ["kouzi"]);
}
function uc(e) {
  const a = e.engagement.id, r = fa[a];
  r.complete ? tn(e, r.complete) : e.completedSegments.includes(a) || e.completedSegments.push(a), r.reward && rc(e, r.reward), e.phase = "exploration", e.battle = null, e.checkpoint = null, e.engagement = null;
}
function rs(e, a) {
  if (!(e.pendingParley || Ln(e))) {
    if (e.phase === "battle" && e.battle) {
      const r = lc(e);
      r || ge("invalid"), Pl(e.battle, a, Pr(e), r);
      const t = e.battle;
      e.hp = t.player.hp, e.location.position = {
        x: t.player.x,
        y: t.player.y
      }, e.location.facing = t.player.facing, e.engagement?.id === "beacon" && t.objective.hp === 0 && tn(e, "alarm_raised"), t.status === "won" ? uc(e) : t.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const r = Se[e.location.scene], t = new Set(e.facts);
      Tl(e.location, a.move, Ta(r, t), ci.explorationSpeed);
      const n = Ks(r.id, t, e.completedSegments);
      if (n) {
        const s = fa[n], o = r.anchors[s.trigger];
        Math.hypot(e.location.position.x - o.x, e.location.position.y - o.y) <= s.triggerRadius && Fa(Ns(Ta(r, t), s.bounds), e.location.position, J.playerRadius) && cc(e, n);
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (Nl(e), dc(e), hc(e));
  }
}
var di = [
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
    fact: jr.fact,
    key: "supplies-received",
    amount: 300
  },
  {
    fact: "chapter_completed",
    key: "chapter-one",
    amount: J.firstVictoryAward
  },
  {
    fact: "warden_defeated",
    key: Xa.warden.awardKey,
    amount: J.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: Xa.thornheart.awardKey,
    amount: J.firstBossAward
  }
], Ab = Object.fromEntries([
  ...io.map((e) => [Xa[e].awardKey, J.firstBossAward]),
  ["victory", J.firstVictoryAward],
  ...Object.keys(Va).map((e) => [`mastery-${e}`, J.masteryAward]),
  ...ro.map((e) => [`oath-${e}`, J.oathAward]),
  ...di.map((e) => [e.key, e.amount])
]), Mt = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, hi = {
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
    gestures: Mt
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
    gestures: Mt
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
    gestures: Mt
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
    gestures: Mt
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
      ...Mt,
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
    gestures: Mt
  }
};
function ui(e) {
  return Object.hasOwn(hi, e);
}
function pc(e) {
  return ui(e) ? hi[e] : {
    expressions: {},
    gestures: {}
  };
}
var Or = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, fc = {
  ...Object.fromEntries(bt.map((e) => [e, Ne[e].clothing])),
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
}, nn = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function pi(e, a) {
  const r = { ...fc[a] };
  for (const t of e.conversations[a]) t.kind === "dialogue" && t.clothing && Object.assign(r, t.clothing);
  return r;
}
var bc = {
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
}, mc = Object.keys(bc), zb = [
  ...mc,
  "soldier",
  "archer",
  "guard",
  "priest",
  "charger",
  "stalker",
  "bomber",
  "wisp"
], gc = (e) => Ja(e, Es), Kn = (e) => Ja(e, Ls), ss = (e) => Ja(e, Ts);
function vc(e) {
  const a = dr(e);
  switch (a.type) {
    case "start":
    case "restart":
      return {
        type: a.type,
        weapon: gc(a.weapon),
        outfit: ss(a.outfit),
        traveler: Ql(a.traveler)
      };
    case "purchase":
    case "equip":
      return {
        type: a.type,
        id: ss(a.id)
      };
    case "interact":
      return {
        type: "interact",
        id: Bl(a.id)
      };
    case "choice":
      return {
        type: "choice",
        id: Ja(a.id, Js),
        person: Ja(a.person, or)
      };
    case "greet":
      return {
        type: "greet",
        person: Ja(a.person, or)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: Wl(es(a.equipped, J.relicSlots, Kn))
      };
    case "input": {
      const r = es(a.spans, J.maxInputTicks, (t) => {
        const n = dr(t);
        return as(n.dash), as(n.skill), {
          move: Xr(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Xr(n.ticks, 1, J.maxInputTicks)
        };
      });
      return (!r.length || r.reduce((t, n) => t + n.ticks, 0) > J.maxInputTicks) && ge("invalid"), {
        type: "input",
        spans: r
      };
    }
    case "relic":
      return {
        type: "relic",
        id: Kn(a.id),
        ...a.replace === void 0 ? {} : { replace: Kn(a.replace) }
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: a.type };
    default:
      return ge("invalid");
  }
}
function wc(e, a) {
  const r = Wa(null), t = B(!1), n = B(""), s = Wa(null), o = B(!1), l = B(!1), c = Wa(null), i = Wa(null), h = B(null), u = Q(() => r.value?.replyFailure?.actionId === h.value ? null : r.value?.replyFailure ?? null), d = Q(() => o.value || !!r.value?.conversation), f = B(!1), b = B(!1);
  let _ = !1;
  const w = Wa(null), g = Q(() => {
    const S = (w.value ?? r.value)?.conversation;
    return S || (o.value ? c.value : null);
  }), x = Q(() => t.value || d.value || l.value || !!s.value || !r.value?.ready || r.value.writeState !== "ready" || r.value.pending), k = (S, $) => S.data.revision !== $.data.revision ? S.data.revision > $.data.revision : S.fileRevision >= $.fileRevision;
  function M(S) {
    if (_ || r.value && !k(S, r.value)) return;
    const $ = c.value;
    (r.value?.data.active?.id !== S.data.active?.id || $ && S.data.active?.conversations[$.person].some((I) => I.id === $.actionId)) && (c.value = null), r.value = S;
  }
  const F = Q(() => {
    if (c.value) return c.value;
    if (r.value?.conversation) return {
      ...r.value.conversation,
      status: "sending"
    };
    const S = r.value?.replyFailure;
    return !S || S.regenerating || r.value?.data.active?.conversations[S.person].some(($) => $.id === S.actionId) ? null : {
      actionId: S.actionId,
      person: S.person,
      text: S.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function y(S, $, I) {
    if (_ || t.value) return !1;
    t.value = !0, w.value = null, n.value = "";
    try {
      const H = await e.request(`game/expedition/${S}`, {
        chatIdentity: a,
        ...S === "rebuild" ? { actionId: Bn() } : {},
        ...$,
        ...I ? { person: I } : {}
      }, 35e3), W = w.value;
      return M(W && k(W, H.result) ? W : H.result), f.value = !1, b.value = !1, r.value?.writeState === "ready" && !r.value.pending && S !== "read" && (s.value = null), !0;
    } catch (H) {
      if (!_) {
        f.value = !0, w.value && M(w.value), n.value = Ka(H);
        const W = H && typeof H == "object" && "code" in H ? String(H.code) : "";
        b.value = W === "expedition_data_invalid", $ && (W.startsWith("expedition_save_") || W.startsWith("host_request_")) && (s.value = $);
      }
      return !1;
    } finally {
      w.value = null, _ || (t.value = !1);
    }
  }
  const A = e.subscribe((S) => {
    if (_) return;
    if (S.type === "game/expedition/error") {
      const I = S.payload;
      I.chatIdentity === a && (n.value = Ka(I), b.value = I.code === "expedition_data_invalid");
      return;
    }
    if (S.type !== "game/expedition/state") return;
    const $ = S.payload;
    $.chatIdentity === a && (t.value ? w.value = $.state : (w.value = null, M($.state)));
  });
  async function j() {
    const S = s.value;
    return !await y("confirm") || !r.value || r.value.writeState !== "ready" || r.value.pending ? !1 : S && r.value.data.revision === S.revision ? y("act", S) : (s.value = null, l.value = !1, !0);
  }
  async function z(S, $, I) {
    if (x.value || _) return !1;
    const H = Bn();
    i.value = I ? {
      person: S,
      turnId: I
    } : null, c.value = {
      actionId: H,
      person: S,
      text: $,
      regenerating: !!I,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, o.value = !0, t.value = !0, n.value = "", w.value = null;
    try {
      const W = await e.request(I ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: a,
        actionId: H,
        revision: r.value.data.revision,
        person: S,
        text: $,
        ...I ? { turnId: I } : {}
      }, 18e4), Z = w.value;
      return M(Z && k(Z, W.result) ? Z : W.result), !0;
    } catch (W) {
      if (!_) {
        w.value && M(w.value);
        const Z = W && typeof W == "object" && "code" in W ? String(W.code) : W instanceof Error ? W.message : "";
        if (Z === "expedition_cancelled")
          return n.value = "", !1;
        l.value = Z.startsWith("host_request_") || Z.startsWith("expedition_save_"), n.value = l.value ? D.aiUnknown : r.value?.replyFailure?.actionId === H ? "" : Ka(W);
      }
      return !1;
    } finally {
      i.value = null, o.value = !1, w.value = null, _ || (t.value = !1, c.value?.actionId === H && (c.value = I ? null : {
        ...c.value,
        status: "failed"
      }));
    }
  }
  async function P() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: a }, 35e3);
      } catch (S) {
        _ || (n.value = Ka(S));
      }
  }
  const C = Q(() => f.value || !!s.value || l.value || !r.value || r.value.pending || r.value.writeState !== "ready");
  return {
    view: r,
    busy: t,
    error: n,
    blocked: x,
    failed: s,
    talking: d,
    uncertainTalk: l,
    talk: z,
    outgoing: F,
    replacingReply: i,
    conversationProgress: g,
    cancelTalk: P,
    recoveryRequired: C,
    dataInvalid: b,
    conversationFailure: u,
    dismissConversationFailure() {
      h.value = r.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => y("rebuild"),
    retryMemory: (S) => x.value ? Promise.resolve(!1) : y("retry-memory", void 0, S),
    dismissError() {
      C.value || (n.value = "");
    },
    notice: Q(() => n.value || (r.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(r.value.writeState) || r.value.pending && r.value.writeState === "ready") ? oe.saveError : "")),
    read: () => y("read"),
    recover: j,
    act: (S) => x.value ? Promise.resolve(!1) : y("act", {
      actionId: Bn(),
      revision: r.value.data.revision,
      command: vc(S)
    }),
    dispose() {
      _ = !0, A();
    }
  };
}
function yc(e) {
  const a = Wa(null), r = Wa(!1);
  let t = [], n = 0, s = null, o = !1;
  function l() {
    const u = e.view.value?.data.active;
    if (a.value = u ? structuredClone(u) : null, a.value) for (const d of t) for (let f = 0; f < d.ticks; f++) rs(a.value, d);
    r.value = t.length > 0;
  }
  const c = ue(e.view, () => {
    !s && !t.length && l();
  }, { immediate: !0 });
  async function i() {
    if (s)
      return await s ? i() : !1;
    if (!t.length) return !e.blocked.value;
    if (e.blocked.value || o) return !1;
    const u = t;
    t = [], n = 0, s = e.act({
      type: "input",
      spans: u
    });
    const d = await s;
    return s = null, d ? l() : e.failed.value || (t = u.concat(t), n = t.reduce((f, b) => f + b.ticks, 0)), r.value = t.length > 0 || !d, d;
  }
  function h(u) {
    const d = a.value;
    !d || o || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= J.maxInputTicks || !["exploration", "battle"].includes(d.phase) || d.phase === "exploration" && !u.move && !Gl(d) || (rs(d, u), Ol(t, u), n++, r.value = !0, Pi(a), (n >= J.checkpointTicks || !["exploration", "battle"].includes(d.phase)) && i());
  }
  return {
    current: a,
    dirty: r,
    input: h,
    flush: i,
    sync: l,
    async recover() {
      return await e.recover() ? (l(), i()) : !1;
    },
    dispose() {
      o = !0, c();
    }
  };
}
var { recent: Yn, maximum: is } = qi;
function xc(e) {
  const { history: a, pending: r, talking: t, person: n, campaignId: s, transcript: o, freshReply: l } = e, c = Oi(/* @__PURE__ */ new Map());
  let i = 0, h = !1;
  const u = Q(() => a.value.reduce((P, C) => P + (C.kind === "greeting" || C.kind === "player" ? 1 : 2), 0)), d = Q(() => u.value + Number(r.value)), f = Q(() => $i(c.get(n.value)?.range, d.value)), b = Q(() => {
    const P = [];
    let C = 0;
    for (const S of a.value) {
      if (C >= f.value.end) break;
      const $ = S.kind === "greeting" ? ["npc"] : S.kind === "player" ? ["player"] : ["player", "npc"];
      for (const I of $)
        C >= f.value.start && C < f.value.end && P.push({
          key: `${S.id}:${I}`,
          side: I,
          turn: S
        }), C++;
    }
    return P;
  }), _ = Q(() => f.value.start > 0), w = Q(() => f.value.end < d.value), g = Q(() => w.value || f.value.end - f.value.start > Yn), x = Q(() => r.value && f.value.end > u.value);
  function k(P) {
    P && !P.isConnected && o.value?.focus({ preventScroll: !0 });
  }
  function M(P, C) {
    const S = P.getBoundingClientRect().top, $ = [...P.querySelectorAll("[data-message-key]")].find((I) => C.has(I.dataset.messageKey) && I.getBoundingClientRect().bottom > S);
    return $ ? {
      key: $.dataset.messageKey,
      offset: $.getBoundingClientRect().top - S
    } : null;
  }
  function F(P, C) {
    const S = C && [...P.querySelectorAll("[data-message-key]")].find(($) => $.dataset.messageKey === C.key);
    return !S || !C ? !1 : (P.scrollTop += S.getBoundingClientRect().top - P.getBoundingClientRect().top - C.offset, !0);
  }
  function y() {
    const P = o.value;
    if (!P || h || c.get(n.value)?.latest === !1) return;
    const C = l.value ? P.querySelector('[data-fresh-reply="true"]') : null;
    P.scrollTop = C && C.offsetHeight > P.clientHeight ? C.getBoundingClientRect().top - P.getBoundingClientRect().top + P.scrollTop - 12 : P.scrollHeight;
  }
  function A() {
    const P = ++i, C = n.value, S = o.value?.contains(document.activeElement) ? document.activeElement : null;
    h = !1, l.value = null, c.delete(C), Pa(() => {
      i === P && n.value === C && (y(), k(S));
    });
  }
  function j() {
    const P = o.value;
    if (!P || h) return;
    const C = !w.value && P.scrollHeight - P.clientHeight - P.scrollTop < 32;
    if (C && g.value) {
      A();
      return;
    }
    c.set(n.value, {
      top: P.scrollTop,
      latest: C,
      range: C ? null : {
        start: f.value.start,
        end: w.value ? f.value.end : null
      }
    });
  }
  async function z(P) {
    const C = o.value;
    if (!C || h) return;
    const S = { ...f.value };
    P === "older" ? (S.start = Math.max(0, S.start - Yn), S.end = Math.min(S.end, S.start + is)) : (S.end = Math.min(d.value, S.end + Yn), S.start = Math.max(S.start, S.end - is));
    const $ = M(C, new Set(b.value.filter((X, re) => {
      const Ee = f.value.start + re;
      return Ee >= S.start && Ee < S.end;
    }).map((X) => X.key))), I = C.contains(document.activeElement) ? document.activeElement : null, H = n.value, W = ++i;
    h = !0;
    const Z = {
      start: S.start,
      end: S.end === d.value ? null : S.end
    };
    c.set(H, {
      range: Z,
      top: C.scrollTop,
      latest: !1
    }), await Pa(), !(W !== i || n.value !== H || o.value !== C) && (F(C, $) || (C.scrollTop = P === "older" ? 0 : C.scrollHeight), c.set(H, {
      range: Z,
      top: C.scrollTop,
      latest: !1
    }), h = !1, k(I));
  }
  return ue(s, () => {
    i++, h = !1, c.clear();
  }), ue([o, n], ([P, C]) => {
    i++, h = !1;
    const S = c.get(C);
    P && (P.scrollTop = S && !S.latest ? S.top : P.scrollHeight);
  }, { flush: "post" }), ue(o, (P, C, S) => {
    if (!P) return;
    const $ = new ResizeObserver(y);
    $.observe(P), S(() => $.disconnect());
  }, { flush: "post" }), ue(b, async (P) => {
    const C = o.value, S = n.value, $ = i, I = c.get(S);
    if (!C || h || !I || I.latest) return;
    const H = M(C, new Set(P.map((W) => W.key)));
    await Pa(), !($ !== i || o.value !== C || c.get(S) !== I) && (F(C, H), I.top = C.scrollTop);
  }), ue([
    a,
    r,
    t,
    l
  ], async () => {
    await Pa(), y();
  }), {
    messages: b,
    hasOlder: _,
    hasNewer: w,
    expanded: g,
    pendingVisible: x,
    rememberReading: j,
    resetLatest: A,
    older: () => z("older"),
    newer: () => z("newer")
  };
}
var ha = {
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
  received: (e, a) => `${e} · ${a ? "已装配" : "收入收藏"}`
}, os = {
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
}, _c = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, kc = ["d"], Mc = ["d"], jc = /* @__PURE__ */ De({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (a, r) => (O(), T("svg", _c, [R("path", {
      d: m(os)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, kc), R("path", {
      d: m(os)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Mc)]));
  }
}), Qa = jc, Sc = { class: "ember-relics" }, Rc = ["disabled", "onClick"], Ac = ["disabled"], zc = ["disabled"], Ec = { class: "ember-relics" }, Cc = ["disabled", "onClick"], Pc = ["disabled"], Oc = /* @__PURE__ */ De({
  __name: "RelicReward",
  props: {
    campaign: {},
    blocked: { type: Boolean }
  },
  emits: ["choose", "leave"],
  setup(e, { emit: a }) {
    const r = e, t = a, n = B(null);
    function s(o) {
      r.campaign.equipped.length >= J.relicSlots && !r.campaign.equipped.includes(o) ? n.value = o : t("choose", o);
    }
    return (o, l) => n.value ? (O(), T(te, { key: 0 }, [
      R("h3", null, E(m(ot)[n.value].name) + " · " + E(m(ha).replace), 1),
      R("div", Sc, [(O(!0), T(te, null, je(e.campaign.equipped, (c) => (O(), T("button", {
        key: c,
        type: "button",
        disabled: e.blocked,
        onClick: (i) => t("choose", n.value, c)
      }, [na(Qa, { name: c }, null, 8, ["name"]), R("h3", null, E(m(ot)[c].name), 1)], 8, Rc))), 128))]),
      R("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[0] || (l[0] = (c) => t("choose", n.value))
      }, E(m(ha).store), 9, Ac),
      R("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[1] || (l[1] = (c) => n.value = null)
      }, E(m(ha).back), 9, zc)
    ], 64)) : (O(), T(te, { key: 1 }, [R("div", Ec, [(O(!0), T(te, null, je(m(sc)(e.campaign), (c) => (O(), T("button", {
      key: c.id,
      type: "button",
      disabled: e.blocked,
      onClick: (i) => s(c.id)
    }, [
      na(Qa, { name: c.id }, null, 8, ["name"]),
      R("h3", null, [He(E(m(ot)[c.id].name) + " ", 1), R("small", null, E(m(oe).rank(c.rank)), 1)]),
      R("p", null, E(m(ot)[c.id].detail), 1)
    ], 8, Cc))), 128))]), R("button", {
      type: "button",
      disabled: e.blocked,
      onClick: l[2] || (l[2] = (c) => t("leave"))
    }, E(m(D).skip), 9, Pc)], 64));
  }
}), Fc = Oc, pe = Object.freeze({
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
    clothing_rejected: nn.rejected,
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
function Tc(e) {
  let a = null, r = null, t = null, n = !1, s = !1, o = null, l = -1, c = 0, i = 0, h = 0, u = 0, d = 0;
  function f(_, w, g, x = "sine", k = _ * 0.8, M = 0) {
    if (!n || !a || !r || a.state !== "running") return;
    const F = a.createOscillator(), y = a.createGain(), A = a.currentTime + M;
    F.type = x, F.frequency.setValueAtTime(_, A), F.frequency.exponentialRampToValueAtTime(Math.max(30, k), A + w), y.gain.setValueAtTime(1e-4, A), y.gain.exponentialRampToValueAtTime(g, A + 9e-3), y.gain.exponentialRampToValueAtTime(1e-4, A + w), F.connect(y).connect(r), F.start(A), F.stop(A + w), F.onended = () => {
      F.disconnect(), y.disconnect();
    };
  }
  function b(_, w, g, x) {
    if (!n || !a || !r || !t || a.state !== "running") return;
    const k = a.createBufferSource(), M = a.createBiquadFilter(), F = a.createGain(), y = a.currentTime;
    k.buffer = t, M.type = "bandpass", M.Q.value = 0.65, M.frequency.setValueAtTime(g, y), M.frequency.exponentialRampToValueAtTime(x, y + _), F.gain.setValueAtTime(1e-4, y), F.gain.exponentialRampToValueAtTime(w, y + 8e-3), F.gain.exponentialRampToValueAtTime(1e-4, y + _), k.connect(M).connect(F).connect(r), k.start(y), k.stop(y + _), k.onended = () => {
      k.disconnect(), M.disconnect(), F.disconnect();
    };
  }
  return {
    async enable(_) {
      if (!s) {
        n = _;
        try {
          if (!_) {
            a && await a.suspend();
            return;
          }
          if (!a) {
            a = new AudioContext(), r = a.createGain(), r.gain.value = 0.55, r.connect(a.destination), t = a.createBuffer(1, a.sampleRate, a.sampleRate);
            const w = t.getChannelData(0);
            for (let g = 0; g < w.length; g++) w[g] = Math.random() * 2 - 1;
          }
          await a.resume();
        } catch {
          n = !1, s || e();
        }
      }
    },
    tick(_) {
      (!o || _.tick < l) && (l = -1, c = _.player.hp, i = _.kills, h = _.player.skill, u = _.serial, d = _.player.combo), o = _, l !== _.tick && (l = _.tick, _.player.hp < c && (b(0.16, 0.17, 800, 120), f(95, 0.2, 0.12, "triangle", 42)), _.kills > i && (f(659, 0.22, 0.045), f(988, 0.3, 0.025, "sine", 980, 0.035)), _.player.combo > d && b(0.095, 0.08, 2700, 500), _.player.dashTime === 7 && b(0.2, 0.09, 500, 2600), _.player.skill > h && (b(0.24, 0.12, 2200, 250), f(165, 0.35, 0.075, "triangle", 82), f(660, 0.36, 0.035, "sine", 440, 0.02)), _.effects.some((w) => w.id > u && w.kind === "lightning") && (b(0.12, 0.1, 4400, 1e3), f(1200, 0.08, 0.018, "sine", 210)), _.effects.some((w) => w.id > u && (w.kind === "block" || w.kind === "parry")) && (f(1350, 0.18, 0.07, "triangle", 740), f(2200, 0.11, 0.025, "sine", 1600)), _.effects.some((w) => w.id > u && w.kind === "ward-hit") && f(510, 0.16, 0.06, "sine", 250), _.effects.some((w) => w.id > u && w.kind === "ward-break") && (b(0.25, 0.1, 3600, 650), f(720, 0.3, 0.05, "sine", 120)), _.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((w, g) => f(w, 0.65, 0.04, "sine", w, g * 0.075)), _.status === "lost" && f(147, 0.7, 0.06, "triangle", 73), c = _.player.hp, i = _.kills, h = _.player.skill, u = _.serial, d = _.player.combo);
    },
    dispose() {
      s = !0, n = !1, a && (a.close().catch(e), a = null), r = null, t = null;
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
}, ls = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], za = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, ta = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, wa = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, In = [
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
], Lc = {
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
}, Eb = Object.fromEntries(Object.entries(Ot).map(([e, a]) => [e, Lc[a.family]]));
function Ic(e, a, r) {
  const t = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, s = !1, o = !1;
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
  function c(d) {
    if (!(!l.includes(d.code) || d.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(d.target.tagName)) && !(d.code === "Space" && d.target instanceof HTMLElement && d.target.closest("button"))) {
      if (d.preventDefault(), d.stopPropagation(), r(), d.code === "Escape") {
        d.repeat || a();
        return;
      }
      t.add(d.code), !d.repeat && d.code === "Space" && (s = !0), !d.repeat && d.code === "KeyE" && (o = !0);
    }
  }
  function i(d) {
    t.delete(d.code);
  }
  function h() {
    t.clear(), n = {
      x: 0,
      y: 0
    }, s = !1, o = !1;
  }
  function u() {
    h(), a();
  }
  return e.addEventListener("keydown", c), window.addEventListener("keyup", i), window.addEventListener("blur", u), {
    frame() {
      const d = n.x || Number(t.has("KeyD") || t.has("ArrowRight")) - Number(t.has("KeyA") || t.has("ArrowLeft")), f = n.y || Number(t.has("KeyS") || t.has("ArrowDown")) - Number(t.has("KeyW") || t.has("ArrowUp")), b = {
        move: Math.hypot(d, f) < 0.15 ? 0 : (Math.round((Math.atan2(f, d) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: s,
        skill: o
      };
      return s = !1, o = !1, b;
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
      o = !0, r();
    },
    clear: h,
    dispose() {
      h(), e.removeEventListener("keydown", c), window.removeEventListener("keyup", i), window.removeEventListener("blur", u);
    }
  };
}
function hr(e) {
  const a = new Hr();
  a.absarc(0, 0, 1.1, 0, Math.PI, !1), a.lineTo(-0.86, 0), a.absarc(0, 0, 0.86, Math.PI, 0, !0), a.closePath();
  const r = {
    box: new Xi(1, 1, 1),
    sphere: new Ni(1, 20, 14),
    rock: new qr(1, 0),
    crown: new qr(1, 1),
    cylinder: new Zi(1, 1, 1, 24),
    cone: new Yi(1, 1, 12),
    disc: new Qi(1, 48),
    ring: new un(0.965, 1, 64),
    openRing: new un(0.965, 1, 48, 1, Ge.rootRingGap / 2, Math.PI * 2 - Ge.rootRingGap),
    arc: new un(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new $r(1, 0.08, 8, 40),
    stroke: new un(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new $r(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new Ur(a, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  function o(d, f = !1, b = 1, _ = !1) {
    const w = `${d}/${f}/${b}/${_}`;
    let g = n.get(w);
    return g || (g = f ? new Ki({
      color: d,
      transparent: b < 1,
      opacity: b,
      depthWrite: b === 1,
      side: 2
    }) : new _r({
      color: d,
      map: e?.get(d) ?? null,
      roughness: _ ? 0.34 : 0.88,
      metalness: _ ? 0.45 : 0.02,
      side: 2
    }), n.set(w, g)), g;
  }
  function l(d, f, b, _, w = [
    0,
    0,
    0
  ], g = !1, x = 1, k = !1) {
    let M = r[f];
    if (!g && f === "box" && e?.has(b)) {
      M = M.clone(), s.add(M);
      const y = M.getAttribute("position"), A = M.getAttribute("normal"), j = M.getAttribute("uv");
      for (let z = 0; z < j.count; z++) {
        const P = Math.abs(A.getX(z)) > 0.5 ? y.getZ(z) * _[2] : y.getX(z) * _[0], C = Math.abs(A.getY(z)) > 0.5 ? y.getZ(z) * _[2] : y.getY(z) * _[1];
        j.setXY(z, P / 8, C / 8);
      }
    }
    const F = new ya(M, o(b, g, x, k));
    return F.scale.set(..._), F.position.set(...w), F.castShadow = !g, F.receiveShadow = !g, d.add(F), F;
  }
  function c(d, f = [
    0,
    0,
    0
  ]) {
    const b = new Et();
    return b.position.set(...f), d.add(b), b;
  }
  function i(d, f, b, _, w, g = 1, x = !1, k = 0.04) {
    const M = l(d, x ? "disc" : "ring", f, [
      b,
      b,
      1
    ], [
      _,
      k,
      w
    ], !0, g);
    return M.rotation.x = -Math.PI / 2, M;
  }
  function h(d, f, b, _ = [
    0,
    0,
    0
  ], w = 0) {
    const g = e?.has(b) ?? !1, x = JSON.stringify([
      f,
      w,
      g
    ]);
    let k = t.get(x);
    if (!k) {
      const F = new Hr();
      if (f.forEach(([y, A], j) => j ? F.lineTo(y, A) : F.moveTo(y, A)), F.closePath(), k = w ? new Ur(F, {
        depth: w,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: w * 0.3,
        bevelSize: w * 0.3,
        bevelSegments: 2
      }) : new Ji(F), g) {
        const y = k.getAttribute("uv");
        for (let A = 0; A < y.count; A++) y.setXY(A, y.getX(A) / 8, y.getY(A) / 8);
      }
      t.set(x, k);
    }
    const M = new ya(k, o(b));
    return M.position.set(..._), M.castShadow = !0, M.receiveShadow = !0, d.add(M), M;
  }
  function u(d) {
    d.updateMatrixWorld(!0);
    const f = d.matrixWorld.clone().invert(), b = new xn(), _ = /* @__PURE__ */ new Map();
    d.traverse((g) => {
      if (!(g instanceof ya) || Array.isArray(g.material)) return;
      const x = (g.geometry.index ? g.geometry.toNonIndexed() : g.geometry.clone()).applyMatrix4(b.multiplyMatrices(f, g.matrixWorld)), k = `${g.material.uuid}/${g.castShadow}/${g.receiveShadow}`;
      let M = _.get(k);
      M || (M = {
        material: g.material,
        castShadow: g.castShadow,
        receiveShadow: g.receiveShadow,
        geometries: []
      }, _.set(k, M)), M.geometries.push(x);
    }), d.clear();
    const w = [];
    for (const { material: g, castShadow: x, receiveShadow: k, geometries: M } of _.values()) {
      const F = As(M);
      if (M.forEach((A) => A.dispose()), !F) throw new Error("expedition_geometry_merge");
      const y = new ya(F, g);
      y.castShadow = x, y.receiveShadow = k, d.add(y), w.push(F);
    }
    return () => {
      d.clear(), w.forEach((g) => g.dispose());
    };
  }
  return {
    mesh: l,
    group: c,
    ring: i,
    shape: h,
    material: o,
    bake: u,
    geometries: r,
    dispose() {
      Object.values(r).forEach((d) => d.dispose()), t.forEach((d) => d.dispose()), s.forEach((d) => d.dispose()), n.forEach((d) => d.dispose());
    }
  };
}
function $c(e, a, r, t) {
  const n = In[r], s = J.arena, { mesh: o, group: l, ring: c } = e, i = (b, _, w, g = n.stone) => o(b, "box", g, _, w);
  function h(b, _, w, g = !0) {
    const x = l(a, [
      b,
      0,
      _
    ]);
    i(x, [
      1.65,
      0.38,
      1.65
    ], [
      0,
      0.15,
      0
    ]), i(x, [
      1.3,
      0.3,
      1.3
    ], [
      0,
      0.49,
      0
    ], n.light), i(x, [
      0.91,
      w,
      0.91
    ], [
      0,
      w / 2 + 0.6,
      0
    ]);
    for (const k of [-0.38, 0.38]) i(x, [
      0.08,
      w - 0.35,
      0.12
    ], [
      k,
      w / 2 + 0.6,
      0.48
    ], n.light);
    return i(x, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      w + 0.6,
      0
    ], n.light), i(x, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      w + 0.85,
      0
    ], n.dark), g && (o(x, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      w + 1.24,
      0
    ]), i(x, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      w - 0.15,
      0.52
    ], n.trim)), x;
  }
  function u(b, _, w, g) {
    h(b - w / 2, _, g - 2), h(b + w / 2, _, g - 2);
    const x = l(a, [
      b,
      g - 2,
      _
    ]);
    o(x, "arch", n.light, [
      w / 2,
      2.3,
      1.15
    ]);
    for (let k = 1; k < 10; k++) {
      const M = k / 10 * Math.PI, F = i(x, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(M) * w * 0.49,
        Math.sin(M) * 2.25,
        0.59
      ], n.trim);
      F.rotation.z = M - Math.PI / 2;
    }
    i(x, [
      0.6,
      0.9,
      1.3
    ], [
      0,
      2.28,
      0
    ], n.trim);
  }
  function d(b, _, w = 1) {
    const g = l(a, [
      b,
      0,
      _
    ]);
    g.scale.setScalar(w);
    for (let x = 0; x < 5; x++) {
      const k = x * 2.4, M = o(g, "rock", x % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + x % 2 * 0.3,
        0.45
      ], [
        Math.cos(k) * 0.4,
        0.5,
        Math.sin(k) * 0.4
      ]);
      M.rotation.z = Math.sin(k) * 0.4;
    }
    for (let x = 0; x < 3; x++) o(g, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(x * 4) * 0.5,
      1,
      Math.cos(x * 4) * 0.4
    ]);
  }
  function f(b, _, w) {
    const g = l(a, [
      b,
      0,
      _
    ]);
    g.scale.setScalar(w);
    const x = o(g, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    x.rotation.z = -0.1;
    for (let k = 0; k < 6; k++) {
      const M = k * 2.4;
      o(g, "rock", k % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(M) * 0.95,
        3 + Math.sin(M) * 0.5,
        Math.sin(M) * 0.85
      ]);
    }
  }
  i(a, [
    180,
    0.3,
    180
  ], [
    0,
    -4.1,
    0
  ], n.water);
  for (let b = 0; b < 16; b++) i(a, [
    3 + b % 4 * 2,
    0.015,
    0.055
  ], [
    Math.sin(b * 7) * 32,
    -3.92,
    Math.cos(b * 3) * 25
  ], n.haze);
  i(a, [
    s * 2 + 2.4,
    2.4,
    s * 2 + 2.4
  ], [
    0,
    -1.5,
    0
  ], n.dark), i(a, [
    s * 2 + 1.1,
    0.42,
    s * 2 + 1.1
  ], [
    0,
    -0.42,
    0
  ], n.trim), i(a, [
    s * 2 + 0.5,
    0.35,
    s * 2 + 0.5
  ], [
    0,
    -0.14,
    0
  ], n.floor);
  for (let b = -10; b <= 10; b += 2) for (let _ = -10; _ <= 10; _ += 2) i(a, [
    1.96,
    0.045,
    1.96
  ], [
    b,
    0.025,
    _
  ], (b * 3 + _ + 40) % 8 === 0 ? n.tile : n.floor);
  if (t) {
    c(a, n.trim, 5.35, 0, 0, 1, !1, 0.058), c(a, n.light, 5.18, 0, 0, 0.6, !1, 0.059), c(a, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let b = 0; b < 8; b++) {
      const _ = b * Math.PI / 4, w = i(a, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(_) * 5.04,
        0.065,
        Math.sin(_) * 5.04
      ], n.trim);
      w.rotation.y = -_ + Math.PI / 2;
    }
    if (r === 1) o(a, "crescent", n.seam, [
      3,
      3,
      0.12
    ], [
      0,
      0.065,
      0
    ]).rotation.set(-Math.PI / 2, 0, 0.7);
    else {
      const b = [];
      for (let w = 0; w < (r === 2 ? 24 : 16); w++) {
        const g = w * Math.PI * 2 / (r === 2 ? 24 : 16), x = w % 2 ? 0.85 : r === 2 ? 2.6 : w % 4 ? 1.8 : 3.2;
        b.push([Math.cos(g) * x, Math.sin(g) * x]);
      }
      const _ = e.shape(a, b, n.seam, [
        0,
        0.061,
        0
      ]);
      _.rotation.x = -Math.PI / 2, c(a, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const b of [-1, 1]) for (let _ = 0; _ < 4; _++) {
    const w = b * (7 + _ % 2), g = -7 + _ * 4, x = i(a, [
      0.035,
      0.016,
      0.55 + _ * 0.1
    ], [
      w,
      0.055,
      g
    ], n.seam);
    x.rotation.y = _ * 1.3;
    const k = i(a, [
      0.028,
      0.015,
      0.3
    ], [
      w + 0.1,
      0.055,
      g + 0.3
    ], n.seam);
    k.rotation.y = _ * 1.3 + 0.8;
  }
  for (const b of [-s - 0.35, s + 0.35]) {
    i(a, [
      0.38,
      0.18,
      s * 2 + 1
    ], [
      b,
      0.08,
      0
    ], n.light);
    for (let _ = -10; _ <= 10; _ += 5) h(b + Math.sign(b) * 0.5, _, _ === -10 ? 3.6 : 1.35);
  }
  for (let b = 0; b < 6; b++) i(a, [
    7.2,
    0.24,
    1
  ], [
    0,
    -0.12 - b * 0.26,
    s + 0.65 + b * 0.8
  ], b % 2 ? n.stone : n.light);
  u(0, -s - 3, 8, 6.3);
  for (const b of [-1, 1]) {
    i(a, [
      5,
      3.2,
      1.9
    ], [
      b * 8.4,
      1.45,
      -s - 3
    ], n.dark), i(a, [
      5.5,
      0.3,
      2.3
    ], [
      b * 8.4,
      3.2,
      -s - 3
    ], n.light);
    const _ = l(a, [
      b * 5.8,
      4.8,
      -s - 2.9
    ]);
    i(_, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let w = 0; w < 5; w++) i(_, [
      0.35,
      2.6 - Math.abs(w - 2) * 0.12,
      0.08
    ], [
      (w - 2) * 0.34,
      -1.35,
      Math.sin(w * 2) * 0.08
    ], w % 2 ? n.foliage : n.dark);
    if (i(_, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), r < 3) {
      for (let w = 0; w < 4; w++) d(b * (12.8 + w % 2), -9 + w * 5, 0.8 + w * 0.1);
      f(b * 15, -13, 1.5), f(b * 17, 1, 1.7);
    } else if (r === 3) for (let w = 0; w < 3; w++) {
      const g = l(a, [
        b * 15,
        0,
        -9 + w * 7
      ]);
      o(g, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), o(g, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), i(g, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), o(g, "torus", n.trim, [
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
      for (let g = 0; g < 5; g++) o(a, "rock", g % 2 ? n.light : n.accent, [
        1,
        2.2 + g % 3,
        0.9
      ], [
        b * (13.5 + g % 2),
        1.2,
        -9 + g * 4
      ]).rotation.z = b * -0.2;
      const w = l(a, [
        b * 17,
        0,
        -13
      ]);
      i(w, [
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
      for (let g = 0; g < 4; g++) {
        const x = l(a, [
          b * 14,
          0,
          -10 + g * 6
        ]);
        i(x, [
          2.4,
          3.5,
          1
        ], [
          0,
          1.75,
          0
        ], n.dark);
        for (let k = 0; k < 3; k++) {
          i(x, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + k,
            0
          ], n.trim);
          for (let M = 0; M < 5; M++) i(x, [
            0.27,
            0.65 + M % 2 * 0.12,
            0.6
          ], [
            -0.85 + M * 0.4,
            1.2 + k,
            0.1
          ], M % 2 ? n.foliage : n.stone);
        }
      }
      const w = o(a, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        b * 18,
        6.2,
        -13
      ]);
      w.rotation.y = b * 0.3;
    }
    i(a, [
      7,
      1.4,
      18
    ], [
      b * 17,
      -0.7,
      -3
    ], n.dark), i(a, [
      6.7,
      0.1,
      17.7
    ], [
      b * 17,
      0.06,
      -3
    ], n.seam);
    for (const w of [-3.5, 3.5]) i(a, [
      0.22,
      0.25,
      18.2
    ], [
      b * 17 + w,
      0.13,
      -3
    ], n.stone);
    i(a, [
      9,
      1.8,
      10
    ], [
      b * 15,
      -0.9,
      -17
    ], n.dark), i(a, [
      8.7,
      0.1,
      9.7
    ], [
      b * 15,
      0.06,
      -17
    ], n.seam);
  }
  for (let b = 0; b < 7; b++) {
    const _ = (b - 3) * 8, w = -26 - b % 3 * 6, g = 7 + b * 5 % 7;
    if (i(a, [
      5.2,
      g,
      5.5
    ], [
      _,
      g / 2 - 3,
      w
    ], n.stone), i(a, [
      5.8,
      0.4,
      6
    ], [
      _,
      g - 3,
      w
    ], n.light), r === 1) {
      const x = o(a, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        _,
        g - 0.8,
        w
      ]);
      x.rotation.z = 0.9;
    } else if (r === 2) o(a, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      _,
      g - 0.8,
      w
    ]);
    else if (r === 3) {
      for (const x of [-1.3, 1.3]) o(a, "cylinder", n.dark, [
        0.7,
        5 + b % 2 * 2,
        0.7
      ], [
        _ + x,
        g - 1,
        w
      ]);
      i(a, [
        3.8,
        0.25,
        4
      ], [
        _,
        g - 2.5,
        w
      ], n.trim);
    } else if (r === 4) {
      o(a, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        _,
        g - 0.8,
        w
      ]);
      for (const x of [-1, 1]) o(a, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        _ + x,
        g - 3,
        w + 3
      ]);
    } else if (r === 5)
      o(a, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        _,
        g + 0.7,
        w
      ]), o(a, "torus", n.accent, [
        2,
        2,
        2
      ], [
        _,
        g - 1,
        w
      ]).rotation.x = Math.PI / 2;
    else {
      for (const x of [
        -2,
        0,
        2
      ]) i(a, [
        0.7,
        1.2,
        5.6
      ], [
        _ + x,
        g - 2.35,
        w
      ], n.light);
      b % 2 && f(_ + 1, w + 2, 1.5);
    }
    for (const x of [
      -1.5,
      0,
      1.5
    ]) i(a, [
      0.5,
      2.8,
      0.12
    ], [
      _ + x,
      g - 5.6,
      w + 2.8
    ], n.dark);
  }
  for (const b of t?.obstacles ?? []) {
    const _ = l(a, [
      b.x,
      0,
      b.y
    ]);
    o(_, "cylinder", n.dark, [
      b.radius,
      0.22,
      b.radius
    ], [
      0,
      0.11,
      0
    ]), o(_, "cylinder", n.stone, [
      b.radius * 0.85,
      1.15,
      b.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), o(_, "cylinder", n.light, [
      b.radius,
      0.2,
      b.radius
    ], [
      0,
      1.4,
      0
    ]), o(_, "rock", n.accent, [
      0.28,
      0.58,
      0.28
    ], [
      0,
      1.9,
      0
    ]);
    for (let w = 0; w < 6; w++) {
      const g = w * Math.PI / 3;
      i(_, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(g) * b.radius * 0.86,
        0.8,
        Math.sin(g) * b.radius * 0.86
      ], n.trim);
    }
  }
  if (!t) {
    o(a, "cylinder", n.dark, [
      2.1,
      0.16,
      2.1
    ], [
      0,
      0.08,
      -8
    ]), o(a, "cylinder", n.light, [
      1.95,
      0.14,
      1.95
    ], [
      0,
      0.2,
      -8
    ]), c(a, n.trim, 1.68, 0, -8, 1, !1, 0.28);
    for (const b of [-1, 1]) {
      d(b * 3, -8, 1.2), d(b * 4, -10, 0.85);
      const _ = l(a, [
        b * 2.6,
        0.5,
        -6
      ]);
      o(_, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), o(_, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), o(_, "cone", n.trim, [
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
  return e.bake(a);
}
function qc(e, a, r) {
  const t = e.group(a, [
    0,
    1.3,
    0
  ]);
  t.scale.setScalar(1.5);
  const n = e.group(t), s = e.group(t, [
    0,
    0.5,
    0
  ]), o = e.group(s), l = r === "female", c = l ? 0.225 : 0.255, i = Ca.traveler.fabric, h = "#574a40", u = "#d7ab8b", d = "#463f3b";
  e.mesh(n, "sphere", i, [
    c,
    0.28,
    0.155
  ], [
    0,
    -0.04,
    0
  ]), e.mesh(n, "cylinder", i, [
    l ? 0.165 : 0.185,
    0.24,
    0.16
  ], [
    0,
    -0.25,
    0
  ]), e.mesh(n, "cylinder", h, [
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
  ]), e.mesh(n, "cylinder", u, [
    0.066,
    0.16,
    0.07
  ], [
    0,
    0.265,
    0
  ]), e.mesh(s, "sphere", u, [
    l ? 0.161 : 0.172,
    0.22,
    0.165
  ]), e.mesh(o, "sphere", d, [
    0.18,
    0.125,
    0.173
  ], [
    0,
    0.135,
    -0.022
  ]);
  for (const x of [-1, 1])
    e.mesh(s, "sphere", u, [
      0.027,
      0.042,
      0.027
    ], [
      x * 0.166,
      -0.01,
      0
    ]), e.mesh(s, "sphere", "#303b3b", [
      0.019,
      0.023,
      0.012
    ], [
      x * 0.061,
      0.016,
      0.155
    ]), e.mesh(s, "box", d, [
      0.047,
      0.012,
      0.014
    ], [
      x * 0.064,
      0.062,
      0.154
    ]), e.mesh(o, "sphere", d, [
      0.035,
      0.12,
      0.08
    ], [
      x * 0.157,
      0.035,
      -0.036
    ]);
  if (e.mesh(s, "sphere", u, [
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
  ]), l) {
    const x = e.group(o, [
      0,
      0.06,
      -0.17
    ]);
    for (let k = 0; k < 4; k++) e.mesh(x, "sphere", d, [
      0.064 - k * 9e-3,
      0.09,
      0.063 - k * 8e-3
    ], [
      k % 2 ? 0.014 : -0.014,
      -k * 0.115,
      0
    ]);
    e.mesh(x, "box", i, [
      0.066,
      0.032,
      0.066
    ], [
      0,
      -0.33,
      0
    ]);
  }
  const f = [], b = [];
  for (const x of [-1, 1]) {
    const k = e.group(t, [
      x * c,
      0.12,
      0
    ]);
    f.push(k), e.mesh(k, "cylinder", i, [
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
    ]), e.mesh(k, "cylinder", u, [
      0.052,
      0.14,
      0.057
    ], [
      0,
      -0.36,
      8e-3
    ]), e.mesh(k, "sphere", u, [
      0.06,
      0.075,
      0.047
    ], [
      0,
      -0.45,
      0.015
    ]);
    const M = e.group(t, [
      x * 0.105,
      -0.32,
      0
    ]);
    b.push(M), e.mesh(M, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(M, "cylinder", h, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(M, "sphere", h, [
      0.089,
      0.066,
      0.155
    ], [
      0,
      -0.485,
      0.056
    ]);
  }
  o.removeFromParent();
  const _ = [
    n,
    s,
    o,
    ...f,
    ...b
  ].map((x) => e.bake(x));
  s.add(o);
  const w = [];
  t.traverse((x) => {
    x instanceof ya && x.material === e.material(i) && w.push(x);
  });
  let g = null;
  return {
    body: t,
    hand: e.group(f[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(x) {
      if (x !== g) {
        g = x;
        for (const k of w) k.material = e.material(Ca[x].fabric);
        o.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(Ca[x].head);
      }
    },
    pose(x, k, M, F, y, A) {
      t.position.y = 1.3 + M, t.rotation.set(!y && F ? 0.16 : 0, Math.PI / 2 - x, 0), b.forEach((j, z) => {
        j.rotation.x = (z ? -1 : 1) * k;
      }), f.forEach((j, z) => {
        j.rotation.set(z && A ? -0.55 : (z ? 1 : -1) * k * 0.65, 0, (z ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      _.forEach((x) => x()), t.removeFromParent();
    }
  };
}
function Hc(e, a, r) {
  const t = Ca[r], { mesh: n, group: s, shape: o } = e, l = s(a, [
    0,
    0.2,
    -0.23
  ]), c = s(a, [
    0,
    0.328,
    0
  ]), i = s(a, [
    0,
    0.55,
    0
  ]);
  c.scale.set(0.64, 0.78, 0.72);
  const h = t.silhouette === "robe" || t.silhouette === "coat";
  if (o(l, [
    [-0.23, 0],
    [0.23, 0],
    [0.38, h ? -0.68 : -0.48],
    [0.1, h ? -0.77 : -0.59],
    [-0.36, h ? -0.68 : -0.5]
  ], t.fabric), o(l, [
    [-0.04, -0.08],
    [0.04, -0.08],
    [0.055, h ? -0.61 : -0.45],
    [0, h ? -0.68 : -0.5],
    [-0.05, h ? -0.61 : -0.45]
  ], t.metal, [
    0,
    0,
    -0.012
  ]), n(a, "torus", t.fabric, [
    0.2,
    0.15,
    0.19
  ], [
    0,
    0.19,
    0
  ]).rotation.x = Math.PI / 2, t.silhouette === "armor") {
    n(a, "sphere", t.metal, [
      0.295,
      0.18,
      0.27
    ], [
      0,
      -0.15,
      0
    ], !1, 1, !0), n(a, "rock", t.glow, [
      0.065,
      0.09,
      0.025
    ], [
      0,
      -0.07,
      0.285
    ]);
    for (const u of [-1, 1]) n(a, "rock", t.metal, [
      0.15,
      0.12,
      0.17
    ], [
      u * 0.3,
      -0.02,
      0
    ], !1, 1, !0);
  } else h && (n(a, "cone", t.fabric, [
    0.34,
    0.46,
    0.27
  ], [
    0,
    -0.2,
    -0.025
  ]), o(a, [
    [-0.07, 0],
    [0.07, 0],
    [0.14, -0.42],
    [-0.14, -0.42]
  ], t.metal, [
    0,
    -0.02,
    0.245
  ]), n(a, "rock", t.glow, [
    0.055,
    0.065,
    0.035
  ], [
    0,
    -0.12,
    0.285
  ]));
  if (t.head === "helm") {
    n(c, "sphere", t.metal, [
      0.31,
      0.13,
      0.265
    ], [
      0,
      0.44,
      -0.015
    ], !1, 1, !0);
    for (const u of [-1, 1]) n(c, "box", t.metal, [
      0.065,
      0.22,
      0.17
    ], [
      u * 0.285,
      0.29,
      -0.02
    ], !1, 1, !0);
  } else if (t.head === "hat")
    n(c, "cylinder", t.fabric, [
      0.43,
      0.045,
      0.32
    ], [
      0,
      0.46,
      0
    ]), n(c, "cone", t.fabric, [
      0.23,
      0.48,
      0.23
    ], [
      0.055,
      0.7,
      -0.02
    ]).rotation.z = -0.18, n(c, "torus", t.metal, [
      0.245,
      0.245,
      0.24
    ], [
      0,
      0.52,
      -0.01
    ]).rotation.x = Math.PI / 2;
  else if (t.head === "hood") {
    n(c, "sphere", t.fabric, [
      0.345,
      0.35,
      0.265
    ], [
      0,
      0.22,
      -0.12
    ]);
    for (const u of [-1, 1]) n(c, "sphere", t.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      u * 0.285,
      0.19,
      0.055
    ]);
  } else if (t.head === "crown") {
    n(c, "torus", t.metal, [
      0.28,
      0.28,
      0.28
    ], [
      0,
      0.48,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let u = 0; u < 5; u++) {
      const d = u * Math.PI * 2 / 5;
      n(c, "cone", t.metal, [
        0.045,
        0.2,
        0.045
      ], [
        Math.sin(d) * 0.27,
        0.57,
        Math.cos(d) * 0.27
      ]);
    }
  } else if (t.head === "horns") for (const u of [-1, 1]) {
    const d = s(c, [
      u * 0.26,
      0.5,
      -0.06
    ]);
    d.rotation.z = u * -0.45, n(d, "cylinder", t.metal, [
      0.035,
      0.44,
      0.03
    ], [
      0,
      0.18,
      0
    ]);
    for (const f of [0.16, 0.3]) n(d, "cone", t.metal, [
      0.025,
      0.22,
      0.025
    ], [
      u * 0.06,
      f,
      0
    ]).rotation.z = u * -0.8;
  }
  else if (t.head === "goggles") {
    n(c, "torus", "#4c4a42", [
      0.32,
      0.22,
      0.27
    ], [
      0,
      0.4,
      0
    ]).rotation.x = Math.PI / 2;
    for (const u of [-1, 1])
      n(c, "torus", t.metal, [
        0.095,
        0.075,
        0.05
      ], [
        u * 0.115,
        0.39,
        0.24
      ]), n(c, "sphere", t.glow, [
        0.08,
        0.06,
        0.045
      ], [
        u * 0.115,
        0.39,
        0.24
      ]);
  }
  switch (r) {
    case "guardian":
      n(c, "cone", t.fabric, [
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
      n(c, "crescent", t.metal, [
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
      for (const u of [-1, 1]) n(a, "cone", t.metal, [
        0.1,
        0.2,
        0.12
      ], [
        u * 0.35,
        0.12,
        -0.03
      ]).rotation.z = u * -0.5;
      break;
    case "ranger":
      n(a, "cylinder", "#79543d", [
        0.095,
        0.46,
        0.085
      ], [
        -0.25,
        0.1,
        -0.31
      ]).rotation.z = -0.35;
      for (let u = 0; u < 3; u++) n(a, "cylinder", t.metal, [
        0.012,
        0.32,
        0.012
      ], [
        -0.21 + u * 0.04,
        0.4,
        -0.29
      ]);
      n(c, "cone", t.glow, [
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
      for (const u of [-1, 1]) o(a, [
        [0, 0],
        [u * 0.22, 0.24],
        [u * 0.18, -0.05],
        [u * 0.05, -0.12]
      ], t.metal, [
        u * 0.32,
        0.02,
        -0.06
      ]);
      break;
    case "witch":
      for (const u of [-1, 1])
        n(a, "sphere", t.glow, [
          0.05,
          0.065,
          0.04
        ], [
          u * 0.27,
          -0.16,
          0.17
        ]), n(a, "box", t.metal, [
          0.07,
          0.025,
          0.07
        ], [
          u * 0.27,
          -0.09,
          0.17
        ]);
      break;
    case "assassin":
      n(a, "sphere", t.metal, [
        0.21,
        0.045,
        0.055
      ], [
        0,
        0.045,
        0.25
      ]), o(a, [
        [0, 0],
        [0.1, -0.07],
        [0.08, -0.29],
        [0, -0.19]
      ], t.metal, [
        -0.1,
        -0.02,
        0.27
      ]);
      break;
    case "machinist":
      n(a, "box", t.metal, [
        0.38,
        0.4,
        0.18
      ], [
        0,
        0.06,
        -0.35
      ], !1, 1, !0);
      for (const u of [-1, 1]) n(a, "cylinder", "#c99767", [
        0.06,
        0.32,
        0.06
      ], [
        u * 0.14,
        0.21,
        -0.38
      ]);
      n(a, "rock", t.glow, [
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
      for (let u = -2; u <= 2; u++) n(a, "rock", u % 2 ? t.fabric : t.metal, [
        0.07,
        0.17,
        0.045
      ], [
        u * 0.11,
        -0.07,
        0.21
      ]).rotation.z = u * 0.27;
      break;
    case "frostbound":
      for (let u = -2; u <= 2; u++) n(a, "sphere", "#f6ffff", [
        0.08,
        0.075,
        0.09
      ], [
        u * 0.115,
        5e-3,
        0.13
      ]);
      for (const u of [-1, 1]) n(a, "rock", t.glow, [
        0.09,
        0.36,
        0.09
      ], [
        u * 0.3,
        0.22,
        -0.35
      ]).rotation.z = u * -0.5;
      break;
    case "stargazer":
      n(i, "torus", t.metal, [
        0.43,
        0.43,
        0.43
      ], [
        0,
        0.16,
        0
      ], !1, 1, !0).rotation.x = 0.6;
      for (let u = 0; u < 3; u++) {
        const d = u * Math.PI * 2 / 3;
        n(i, "rock", t.glow, [
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
    cape: l,
    animate(u, d) {
      i.rotation.y = d ? 0.4 : u * 0.014;
    }
  };
}
var jt = "#45576a", mn = "#93a7ad", St = "#bc835a", Vn = "#ffd498";
function fi(e, a, r, t, n) {
  if (n === "coupler") {
    e.mesh(a, "box", jt, [
      1.5,
      0.4,
      1.5
    ], [
      0,
      0.2,
      0
    ]), e.mesh(a, "cylinder", St, [
      0.5,
      1.8,
      0.5
    ], [
      0,
      1.2,
      0
    ]), e.mesh(r, "rock", Vn, [
      0.32,
      0.7,
      0.32
    ], [
      0,
      1.6,
      0
    ], !0);
    for (const s of [-1, 1]) e.mesh(a, "box", mn, [
      0.15,
      1.9,
      0.2
    ], [
      s * 0.6,
      1.15,
      0
    ]);
    e.mesh(a, "torus", jt, [
      0.65,
      0.65,
      0.2
    ], [
      0,
      1.7,
      0
    ]).rotation.x = Math.PI / 2;
    return;
  }
  if (n === "kilnheart") {
    e.mesh(a, "rock", "#5e738b", [
      1.25,
      0.7,
      1.2
    ], [
      0,
      0.55,
      0
    ]), e.mesh(r, "rock", "#badfe4", [
      0.72,
      1.3,
      0.6
    ], [
      0,
      1.9,
      0.2
    ]), e.mesh(r, "rock", Vn, [
      0.25,
      0.65,
      0.17
    ], [
      0,
      1.95,
      0.72
    ], !0);
    for (let s = 0; s < 6; s++) {
      const o = s * Math.PI / 3, l = e.group(t, [
        Math.sin(o) * 1.05,
        0.8,
        Math.cos(o) * 1.05
      ]);
      l.rotation.z = Math.sin(o) * 0.5, l.rotation.x = Math.cos(o) * 0.5, e.mesh(l, "rock", s % 2 ? "#90b9c9" : "#d5eced", [
        0.24,
        1.3 + s % 2 * 0.35,
        0.24
      ], [
        0,
        1,
        0
      ]), e.mesh(a, "cylinder", St, [
        0.13,
        0.65,
        0.13
      ], [
        Math.sin(o) * 0.9,
        0.5,
        Math.cos(o) * 0.9
      ]);
    }
    return;
  }
  e.mesh(a, "box", "#354459", [
    0.85,
    1.45,
    0.65
  ], [
    0,
    2,
    0.1
  ]), e.mesh(a, "box", "#d4c2a5", [
    0.15,
    1.1,
    0.07
  ], [
    0.2,
    2.12,
    0.46
  ]), e.mesh(r, "sphere", "#c8a386", [
    0.36,
    0.46,
    0.34
  ], [
    0,
    3.04,
    0.18
  ]), e.mesh(r, "sphere", "#44424a", [
    0.39,
    0.19,
    0.36
  ], [
    0,
    3.38,
    0.16
  ]);
  for (const s of [-1, 1]) {
    e.mesh(r, "box", "#312f36", [
      0.085,
      0.038,
      0.03
    ], [
      s * 0.13,
      3.08,
      0.51
    ]), e.mesh(a, "box", jt, [
      0.65,
      1.8,
      0.8
    ], [
      s * 0.9,
      1.12,
      -0.05
    ]), e.mesh(a, "box", mn, [
      0.9,
      0.32,
      1.3
    ], [
      s * 0.9,
      0.2,
      0.22
    ]), e.mesh(a, "cylinder", St, [
      0.12,
      1.4,
      0.12
    ], [
      s * 1.25,
      1.2,
      0.1
    ]), e.mesh(a, "box", jt, [
      0.25,
      2.9,
      0.35
    ], [
      s * 0.75,
      2.3,
      -0.58
    ]), e.mesh(a, "box", mn, [
      0.65,
      0.28,
      0.9
    ], [
      s * 0.85,
      3.8,
      -0.45
    ]), e.mesh(a, "cylinder", St, [
      0.37,
      1.8,
      0.37
    ], [
      s * 0.48,
      2.5,
      -0.9
    ]), e.mesh(a, "rock", Vn, [
      0.16,
      0.58,
      0.12
    ], [
      s * 0.48,
      2.7,
      -1.22
    ], !0);
    const o = e.group(a, [
      s * 0.68,
      2.25,
      0.46
    ]);
    o.name = s < 0 ? "furnace-armor-left" : "furnace-armor-right", e.mesh(o, "box", St, [
      0.65,
      1.1,
      0.14
    ], [
      -s * 0.2,
      0,
      0
    ]);
  }
  e.mesh(a, "box", jt, [
    1.8,
    0.3,
    0.35
  ], [
    0,
    3.84,
    -0.58
  ]), t.position.set(1.6, 2.3, 0.05), e.mesh(t, "cylinder", mn, [
    0.12,
    2.8,
    0.12
  ]), e.mesh(t, "box", jt, [
    1.1,
    0.9,
    1.3
  ], [
    0,
    -1.1,
    0.18
  ]), e.mesh(t, "box", St, [
    1.2,
    0.18,
    1.4
  ], [
    0,
    -1.45,
    0.18
  ]);
}
function Uc(e, a, r, t, n, s) {
  const { mesh: o, group: l, shape: c } = e, i = "#d6b881", h = "#fff0c1", u = (d, f, b) => {
    for (const _ of [-1, 1]) o(r, "sphere", h, [
      0.09,
      0.055,
      0.06
    ], [
      _ * b,
      d,
      f
    ], !0);
  };
  switch (n) {
    case "kilnheart":
    case "furnacemaster":
      fi(e, a, r, t, n);
      break;
    case "bridgekeeper":
    case "heatkeeper": {
      const d = n === "heatkeeper", f = d ? "#374e62" : "#667376";
      for (const b of [-1, 1]) o(a, "box", "#393d43", [
        0.4,
        1.05,
        0.52
      ], [
        b * 0.36,
        0.6,
        0
      ]);
      o(a, "box", f, [
        1.2,
        1.65,
        0.75
      ], [
        0,
        1.95,
        0
      ]), o(a, "box", "#ae8564", [
        0.78,
        1.28,
        0.13
      ], [
        0,
        1.85,
        0.44
      ]), o(r, "sphere", "#c9a78b", [
        0.46,
        0.55,
        0.42
      ], [
        0,
        3.02,
        0
      ]), o(r, "cylinder", "#656e72", [
        0.56,
        0.25,
        0.49
      ], [
        0,
        3.5,
        0
      ]), o(r, "box", i, [
        0.73,
        0.17,
        0.12
      ], [
        0,
        3.12,
        0.43
      ]), u(3.13, 0.51, 0.18), o(a, "cylinder", "#ab8257", [
        0.38,
        1.55,
        0.38
      ], [
        -0.69,
        2.15,
        -0.52
      ]), o(a, "torus", "#4e555a", [
        0.55,
        0.55,
        0.3
      ], [
        0.7,
        1.65,
        -0.2
      ]), t.position.set(0.95, 1.6, 0.3), o(t, "cylinder", "#848b8c", [
        0.09,
        2.7,
        0.09
      ]), o(t, "torus", "#bd9865", [
        0.4,
        0.4,
        0.2
      ], [
        0,
        1.45,
        0
      ]), d && o(a, "box", "#edbc76", [
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
      o(a, "cone", "#576e58", [
        1.6,
        2.9,
        1.3
      ], [
        0,
        1.45,
        0
      ]), o(r, "rock", "#8da17f", [
        0.8,
        1,
        0.65
      ], [
        0,
        2.3,
        0.5
      ]), u(2.6, 1.06, 0.28);
      for (let d = 0; d < 7; d++) {
        const f = d * Math.PI * 2 / 7, b = l(a, [
          Math.cos(f) * 0.8,
          2.6,
          Math.sin(f) * 0.6
        ]);
        b.rotation.z = Math.cos(f) * 0.8, o(b, "cone", "#526451", [
          0.18,
          2.4,
          0.18
        ], [
          0,
          0.9,
          0
        ]), o(b, "rock", s.foliage, [
          0.6,
          0.6,
          0.4
        ], [
          0,
          1.3,
          0
        ]), o(a, "cone", "#67765a", [
          0.3,
          2,
          0.3
        ], [
          Math.cos(f),
          0.28,
          Math.sin(f)
        ]).rotation.z = 1.15;
      }
      o(a, "rock", "#ebbb73", [
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
      o(a, "cone", "#777191", [
        0.85,
        2.2,
        0.75
      ], [
        0,
        1.8,
        0
      ]), o(r, "sphere", "#c3c1db", [
        0.5,
        0.6,
        0.42
      ], [
        0,
        3.1,
        0
      ]), o(r, "box", "#4c4469", [
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
      ]) o(t, "torus", i, [
        d,
        d,
        d
      ], [
        0,
        2.2,
        0
      ], !1, 1, !0).rotation.set(d * 0.7, 0.5, d);
      o(t, "sphere", "#d6dbff", [
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
      o(a, "rock", "#ac6249", [
        0.65,
        1.3,
        0.7
      ], [
        0,
        1.8,
        0
      ]), o(r, "sphere", "#e4ac68", [
        0.4,
        0.5,
        0.43
      ], [
        0,
        3.15,
        0.25
      ]), u(3.25, 0.63, 0.18), o(r, "cone", i, [
        0.18,
        0.55,
        0.15
      ], [
        0,
        3.03,
        0.76
      ]).rotation.x = Math.PI / 2;
      for (const d of [-1, 1]) {
        for (let f = 0; f < 5; f++) c(t, [
          [0, 0],
          [d * (2.4 - f * 0.25), 0.95 - f * 0.22],
          [d * (2 - f * 0.24), -0.1 - f * 0.24],
          [0, -0.45]
        ], f % 2 ? "#e2a465" : "#d47c4f", [
          d * 0.4,
          2.5,
          -0.1 - f * 0.06
        ]);
        o(a, "cone", "#e3a25b", [
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
      o(a, "box", "#675756", [
        1.8,
        2.1,
        1.2
      ], [
        0,
        1.6,
        0
      ]), o(a, "box", "#9b6148", [
        1.2,
        1.6,
        0.17
      ], [
        0,
        1.55,
        0.7
      ]), o(r, "cylinder", "#b08563", [
        0.7,
        0.7,
        0.6
      ], [
        0,
        3.05,
        0
      ]), o(r, "box", "#ffd18c", [
        0.65,
        0.1,
        0.08
      ], [
        0,
        3.12,
        0.63
      ], !0);
      for (const d of [-1, 1])
        o(a, "cylinder", s.dark, [
          0.36,
          0.8,
          0.38
        ], [
          d * 0.55,
          0.5,
          0
        ]), o(a, "sphere", "#c9976e", [
          0.65,
          0.55,
          0.55
        ], [
          d * 1.05,
          2.5,
          0
        ], !1, 1, !0);
      t.position.set(1.4, 1.7, 0.4), o(t, "cylinder", "#765948", [
        0.1,
        2.3,
        0.1
      ]), o(t, "box", "#444e57", [
        1.8,
        0.8,
        0.9
      ], [
        0,
        1.3,
        0
      ]), o(t, "box", "#ffc482", [
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
      o(a, "sphere", "#565d63", [
        1.45,
        1.6,
        0.95
      ], [
        0,
        2.15,
        0
      ]), o(a, "torus", "#b68d66", [
        0.78,
        0.78,
        0.45
      ], [
        0,
        2.25,
        0.82
      ], !1, 1, !0), o(a, "sphere", "#ffb77b", [
        0.57,
        0.57,
        0.2
      ], [
        0,
        2.25,
        1
      ], !0), o(r, "box", "#818883", [
        1.3,
        0.5,
        1
      ], [
        0,
        3.7,
        0
      ]), u(3.73, 0.51, 0.3);
      for (const d of [-1, 1])
        o(a, "box", "#818883", [
          0.8,
          1.2,
          0.95
        ], [
          d * 0.8,
          0.6,
          0
        ]), o(t, "cylinder", "#6b7375", [
          0.65,
          2.1,
          0.65
        ], [
          d * 1.75,
          1.85,
          0
        ]), o(t, "box", "#b29370", [
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
      o(a, "cone", "#82a9c1", [
        1.1,
        2.7,
        0.95
      ], [
        0,
        1.8,
        0
      ]), o(r, "sphere", "#d5e9ec", [
        0.45,
        0.58,
        0.4
      ], [
        0,
        3.35,
        0
      ]), u(3.4, 0.39, 0.18);
      for (let d = -2; d <= 2; d++) o(r, "rock", "#d8fbff", [
        0.11,
        0.48 - Math.abs(d) * 0.08,
        0.11
      ], [
        d * 0.18,
        3.94,
        0.02
      ]);
      for (const d of [-1, 1]) c(a, [
        [0, 0],
        [d * 0.95, 0.8],
        [d * 0.5, -1.3],
        [0, -0.5]
      ], "#bddeeb", [
        d * 0.5,
        2.7,
        -0.35
      ]);
      t.position.set(1.05, 1.9, 0), o(t, "cylinder", "#aec9d5", [
        0.045,
        2.5,
        0.045
      ]), o(t, "rock", "#ddfbff", [
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
        o(a, "sphere", d % 2 ? "#658c9c" : "#7da9b8", [
          f,
          f * 0.8,
          f
        ], [
          Math.sin(d * 0.6) * 0.4,
          0.8,
          0.5 - d * 0.8
        ]), o(a, "cone", "#d7e9dc", [
          0.2 * f,
          0.6 * f,
          0.25 * f
        ], [
          0,
          1.5 - d * 0.13,
          0.4 - d * 0.7
        ]);
      }
      o(r, "rock", "#7da9b8", [
        1.05,
        0.7,
        0.85
      ], [
        0,
        1.05,
        1
      ]), u(1.32, 1.65, 0.43);
      for (const d of [-1, 1])
        c(t, [
          [0, 0],
          [d * 1.4, 0.1],
          [d * 0.8, -0.7]
        ], "#b6d6d8", [
          d * 0.7,
          0.7,
          0
        ]), o(r, "cone", "#e4efde", [
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
      o(a, "cone", "#685881", [
        0.95,
        2.6,
        0.8
      ], [
        0,
        2,
        0
      ]), o(r, "rock", "#e7dcc4", [
        0.45,
        0.62,
        0.38
      ], [
        0,
        3.6,
        0
      ]), u(3.65, 0.38, 0.16);
      for (let d = 0; d < 5; d++) {
        const f = d * Math.PI * 2 / 5, b = l(t, [
          Math.cos(f) * 1.7,
          2.5 + Math.sin(f) * 0.6,
          Math.sin(f) * 1.3
        ]);
        b.rotation.z = f * 0.3, o(b, "box", "#baa481", [
          0.55,
          0.72,
          0.14
        ]), o(b, "box", "#f1e4c6", [
          0.48,
          0.65,
          0.15
        ], [
          0,
          0,
          0.03
        ]);
      }
      o(r, "torus", i, [
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
      o(a, "box", "#51486f", [
        0.95,
        1.5,
        0.65
      ], [
        0,
        1.75,
        0
      ]), o(r, "rock", "#b8afcc", [
        0.43,
        0.66,
        0.4
      ], [
        0,
        2.95,
        0
      ]), u(3, 0.4, 0.17);
      for (const d of [-1, 1]) {
        o(a, "box", "#867995", [
          0.33,
          0.9,
          0.4
        ], [
          d * 0.3,
          0.55,
          0
        ]), o(a, "rock", "#b8afcc", [
          0.5,
          0.28,
          0.38
        ], [
          d * 0.6,
          2.4,
          0
        ]);
        const f = l(t, [
          d * 0.85,
          1.8,
          0.2
        ]);
        f.rotation.z = d * -0.25, c(f, [
          [-0.07, 0],
          [0.15, 0],
          [0.3, 1.5],
          [0.12, 2.25],
          [-0.13, 1.7]
        ], "#dfc9ff");
      }
      c(a, [
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
function Gc(e, a) {
  const r = e.group(a), t = e.group(r), n = [
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
  ], s = e.shape(t, n, ta.block, [
    0,
    0,
    0
  ], 0.055), o = e.shape(t, n, ta.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  o.scale.set(0.87, 0.87, 1), e.shape(t, n, ta.enamel, [
    0,
    0,
    -0.018
  ]).scale.set(0.87, 0.87, 1);
  for (const i of [-0.025, 0.09])
    e.shape(t, [
      [0, 0.24],
      [0.08, 0.12],
      [0.045, -0.07],
      [0, -0.2],
      [-0.045, -0.07],
      [-0.08, 0.12]
    ], ta.silver, [
      0,
      0,
      i
    ]), e.mesh(t, "rock", ta.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      i + Math.sign(i) * 0.014
    ], !1, 1, !0);
  let l = 0, c = -1;
  return r.visible = !1, { update(i, h, u, d, f) {
    const b = h ? 1 : 0, _ = Math.max(0, Math.min(4, d - c));
    l = f || c < 0 || d < c ? b : l + (b - l) * (1 - Math.exp(-_ * 0.85)), c = d, r.visible = i === "blade" || h || l > 0.04, r.position.set(-0.4 + l * 0.12, -0.1 + l * 0.3, 0.17 + l * 0.25), r.rotation.set(0.12 - l * 0.22, 0.15 - l * 0.3, -0.16 + l * 0.22), t.scale.setScalar(0.94 + l * 0.07), s.material = e.material(u ? ta.parry : i === "blade" ? ta.block : ta.ward, !1, 1, !0), o.material = e.material(h ? "#617f99" : ta.enamel);
  } };
}
function Nc(e, a) {
  const r = e.group(a), t = new Gi({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new xr(ta.ward) },
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
  }), n = new ya(e.geometries.sphere, t);
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, r.add(n), r.visible = !1, {
    update(s, o) {
      r.visible = !!s && s.ward > 0, !(!s || !r.visible) && (r.position.set(s.x, 0, s.y), t.uniforms.impact.value = o, r.scale.setScalar(1 + o * 0.035));
    },
    dispose() {
      t.dispose(), r.removeFromParent();
    }
  };
}
function Dc(e, a) {
  const r = e.group(a, [
    0,
    0.15,
    0.12
  ]), t = [];
  r.rotation.set(-0.45, 0, -0.2);
  for (const h of [-1, 1]) {
    const u = e.group(r);
    e.mesh(u, "box", wa.cover, [
      0.25,
      0.055,
      0.44
    ], [
      h * 0.125,
      0,
      0
    ]), e.mesh(u, "box", wa.page, [
      0.22,
      0.06,
      0.38
    ], [
      h * 0.12,
      0.04,
      0
    ]), t.push(u);
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
  const s = e.mesh(r, "rock", wa.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), o = e.mesh(r, "torus", wa.crest, [
    0.17,
    0.17,
    0.17
  ], [
    0,
    0.31,
    0
  ], !0, 0.65);
  o.rotation.x = Math.PI / 2;
  let l = 0, c = 0.15, i = -1;
  return { update(h, u, d, f) {
    const b = f || i < 0 || d < i ? 1 : 1 - Math.exp(-Math.min(4, d - i) * 0.5);
    i = d, l += ((h ? 1 : 0) - l) * b, c += ((u ? 0.5 : h ? 0.28 : 0.15) - c) * b, r.position.y = c, r.rotation.x = -0.45 + (c - 0.15) * 0.7, t[0].rotation.z = -0.65 + l * 0.5, t[1].rotation.z = 0.65 - l * 0.5, n.rotation.z = f ? 0.2 : 0.2 + l * (Math.sin(d * 0.18) + 1) * 1.3, s.scale.set(0.07 + l * 0.025, 0.1 + l * 0.06, 0.07 + l * 0.025), o.visible = h, f || (s.rotation.y = d * 0.08);
  } };
}
function Wc() {
  let e = null, a = 0, r = -1 / 0, t = 0, n = 0;
  function s() {
    e = null, r = -1 / 0, t = 0, n = 0;
  }
  return {
    reset: s,
    get active() {
      return n > 0;
    },
    update(o, l, c) {
      (l < a || !o || c) && s();
      const i = e ? Math.min(0.1, l - a) : 0;
      o && e && Math.hypot(o.x - e.x, o.y - e.y) > 1e-3 && (r = l);
      const h = !c && l - r <= 2 / J.hz, u = n > 0;
      n += ((h ? 1 : 0) - n) * (1 - Math.exp(-i * (h ? 14 : 18))), !h && n < 1e-3 ? (n = 0, t = 0) : u && (t = (t + i * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = o ? {
        x: o.x,
        y: o.y
      } : null, a = l;
      const d = Math.sin(t);
      return {
        stride: d * 0.45 * n,
        lift: d * d * 0.035 * n,
        amount: n
      };
    }
  };
}
function bi(e, a, r = 1) {
  const t = e.group(a);
  t.scale.setScalar(r), e.shape(t, [
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
  ]), e.mesh(t, "box", "#f5f3dc", [
    0.012,
    0.94,
    0.015
  ], [
    0.04,
    0.03,
    0.07
  ]), e.mesh(t, "box", "#705444", [
    0.09,
    0.18,
    0.09
  ], [
    0.12,
    0,
    0.06
  ]);
}
function mi(e, a, r) {
  const t = e.group(a), n = qc(e, t, r), s = n.body, o = e.ring(t, "#193f49", 0.6, 0, 0, 0.14, !0), l = e.group(s), c = n.hand, i = e.group(l), h = Gc(e, l), u = Wc();
  let d = null, f = -1, b = Math.PI / 2, _ = null, w = null, g = null;
  function x(k, M) {
    if (!(k === w && M === g)) {
      if (w = k, g = M, i.clear(), c.clear(), d = null, _ = Hc(e, i, g), n.dress(g), w === "blade")
        e.mesh(c, "cylinder", "#624d42", [
          0.035,
          0.28,
          0.035
        ], [
          0,
          -0.08,
          0.06
        ]), e.mesh(c, "box", "#d4b470", [
          0.32,
          0.05,
          0.11
        ], [
          0,
          0.07,
          0.06
        ], !1, 1, !0), e.shape(c, [
          [-0.07, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83],
          [-0.07, 0.65]
        ], "#f5f8ef", [
          0,
          0,
          0.07
        ], 0.018), e.shape(c, [
          [0, 0.1],
          [0.07, 0.1],
          [0.07, 0.65],
          [0, 0.83]
        ], "#9cc6ce", [
          0,
          0,
          0.094
        ]);
      else if (w === "bow") bi(e, c);
      else if (w === "staff")
        e.mesh(c, "cylinder", "#796889", [
          0.035,
          1.12,
          0.035
        ], [
          0,
          0.18,
          0.04
        ]), e.mesh(c, "torus", "#d8bc80", [
          0.19,
          0.24,
          0.18
        ], [
          0,
          0.85,
          0.04
        ], !1, 1, !0), e.mesh(c, "rock", "#b9ecff", [
          0.11,
          0.18,
          0.1
        ], [
          0,
          0.85,
          0.04
        ]);
      else if (w === "daggers") for (const F of [-1, 1]) {
        const y = e.group(c, [
          F < 0 ? -0.58 : 0,
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
      else if (w === "grimoire") d = Dc(e, c);
      else if (w === "cannon") {
        const F = e.group(c, [
          0.02,
          0.08,
          0.17
        ]);
        F.rotation.x = Math.PI / 2, e.mesh(F, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(F, "torus", "#d2a96c", [
          0.15,
          0.15,
          0.15
        ], [
          0,
          0.39,
          0
        ], !1, 1, !0).rotation.x = Math.PI / 2, e.mesh(c, "box", "#906749", [
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
    root: t,
    resetMotion: u.reset,
    get animating() {
      return u.active;
    },
    update(k, M, F, y, A, j, z, P = !1) {
      x(M, F), h.update(M, !!k?.shield, !!k?.guard, y, j);
      const C = j || f < 0 || y < f ? 1 : 1 - Math.exp(-Math.min(4, y - f) * 0.65);
      f = y;
      const S = z ? Math.PI / 2 + 0.23 : k?.facing ?? Math.PI / 2;
      b += Math.atan2(Math.sin(S - b), Math.cos(S - b)) * C;
      const $ = u.update(z ? null : k, A, j), I = !!k?.dashTime;
      t.position.set(k?.x ?? 0, z ? 0.3 : 0, k?.y ?? -8), t.scale.setScalar(z ? 1.65 : 1), n.pose(b, $.stride, $.lift, I, j, !!k?.swing || P), _.cape.rotation.x = j ? -0.15 : -0.21 - $.amount * 0.44 - Math.sin(y * 0.15) * 0.12, _.animate(y, j);
      const H = k?.swing && !j ? Math.sin(k.swing / (M === "cannon" ? 16 : 9) * Math.PI) : 0;
      c.rotation.z += ((P ? -0.3 : -0.2 - H * 1.3) - c.rotation.z) * C, c.rotation.x += ((P ? -0.25 : 0.1 + H * 0.6) - c.rotation.x) * C, d && d.update(!!k?.resonance, P, y, j), o.scale.set(0.6 + (I ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), t.removeFromParent();
    }
  };
}
function Fr(e, a, r, t) {
  const { mesh: n, group: s } = e, o = s(a), l = s(o), c = s(l), i = s(l), h = [], u = Oe(r), d = be[r].radius;
  let f = null;
  e.ring(o, "#1d3540", d * 1.15, 0, 0, 0.16, !0);
  const b = "#cfad70", _ = "#fff0b0", w = t.dark;
  function g(S, $, I) {
    const H = s(l, [
      S,
      I,
      $
    ]);
    n(H, "box", w, [
      0.32,
      I,
      0.42
    ], [
      0,
      -I / 2,
      0
    ]), n(H, "box", t.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -I + 0.11,
      0.1
    ]), h.push(H);
  }
  function x(S, $, I = "#d9e8df") {
    n(S, "box", b, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(S, "box", w, [
      0.11,
      0.4,
      0.11
    ]), n(S, "box", I, [
      0.2,
      $,
      0.13
    ], [
      0,
      $ / 2 + 0.35,
      0
    ], !1, 1, !0), n(S, "cone", I, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      $ + 0.5,
      0
    ]);
  }
  if (r === "coupler") fi(e, l, i, c, r);
  else if (r === "charger") {
    n(l, "rock", t.stone, [
      0.58,
      0.58,
      0.9
    ], [
      0,
      0.7,
      0
    ]), n(i, "rock", w, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const S of [-0.27, 0.27]) {
      const $ = n(i, "cone", b, [
        0.15,
        0.7,
        0.15
      ], [
        S,
        1.15,
        0.9
      ]);
      $.rotation.x = 0.55, n(i, "sphere", _, [
        0.05,
        0.04,
        0.06
      ], [
        S,
        0.82,
        1.02
      ], !0), g(S, -0.42, 0.45), g(S, 0.45, 0.45);
    }
    for (let S = 0; S < 3; S++) n(l, "cone", t.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + S * 0.4
    ]);
  } else if (r === "weaver") {
    n(l, "cone", "#63689d", [
      1.45,
      3,
      1.2
    ], [
      0,
      2.1,
      0
    ]), n(l, "cone", t.light, [
      0.8,
      1.8,
      0.65
    ], [
      0,
      2.65,
      0.3
    ]), n(i, "sphere", w, [
      0.6,
      0.72,
      0.45
    ], [
      0,
      4,
      0
    ]);
    const S = n(i, "crescent", b, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    S.rotation.z = 0.87;
    for (const $ of [-0.23, 0.23]) n(i, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      $,
      4.08,
      0.45
    ], !0);
    for (const $ of [-1, 1]) {
      const I = s(l, [
        $ * 0.8,
        3.3,
        0
      ]);
      I.rotation.z = $ * 0.65, n(I, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(I, "sphere", t.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), h.push(I);
    }
    for (let $ = 0; $ < 5; $++) {
      const I = $ / 5 * Math.PI * 2, H = n(c, "rock", t.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(I) * 1.95,
        3.3 + Math.sin(I) * 1.1,
        -0.3
      ]);
      H.rotation.z = I;
    }
  } else if (r === "king") {
    g(-0.5, 0, 0.8), g(0.5, 0, 0.8), n(l, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(l, "box", w, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(l, "rock", b, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const S of [-1, 1]) n(l, "rock", t.stone, [
      0.85,
      0.5,
      0.7
    ], [
      S * 0.95,
      2.95,
      0
    ]);
    n(i, "sphere", w, [
      0.65,
      0.8,
      0.5
    ], [
      0,
      3.6,
      0
    ]), n(i, "box", _, [
      0.48,
      0.08,
      0.09
    ], [
      0,
      3.7,
      0.51
    ], !0), n(i, "torus", b, [
      0.86,
      0.86,
      0.86
    ], [
      0,
      4.6,
      0
    ], !1, 1, !0).rotation.x = Math.PI / 2;
    for (let S = 0; S < 7; S++) {
      const $ = S * Math.PI * 2 / 7;
      n(i, "cone", b, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos($) * 0.78,
        4.85,
        Math.sin($) * 0.78
      ]);
    }
    c.position.set(1.55, 1.35, 0.2), c.rotation.z = -0.3, x(c, 3.4, "#f6dc9f"), n(l, "box", t.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (r === "warden" || r === "keeper") {
    r === "keeper" && l.scale.setScalar(0.72), g(-0.65, 0.05, 0.85), g(0.65, 0.05, 0.85), n(l, "cylinder", w, [
      1.1,
      1.85,
      0.8
    ], [
      0,
      1.9,
      0
    ]), n(l, "box", t.stone, [
      1.1,
      1.45,
      0.35
    ], [
      0,
      2,
      0.72
    ]), n(l, "rock", t.accent, [
      0.28,
      0.4,
      0.14
    ], [
      0,
      2.1,
      0.94
    ]);
    for (const $ of [-1, 1])
      n(l, "rock", t.stone, [
        0.83,
        0.6,
        0.7
      ], [
        $ * 1.03,
        2.7,
        0
      ]), n(l, "box", b, [
        0.7,
        0.1,
        0.8
      ], [
        $ * 1.08,
        2.45,
        0.1
      ], !1, 1, !0);
    n(i, "sphere", t.stone, [
      0.73,
      0.77,
      0.63
    ], [
      0,
      3.2,
      0
    ]), n(i, "box", w, [
      1.12,
      0.33,
      0.2
    ], [
      0,
      3.22,
      0.54
    ]), n(i, "box", _, [
      0.74,
      0.095,
      0.05
    ], [
      0,
      3.22,
      0.66
    ], !0), n(i, "cone", t.foliage, [
      0.27,
      1.1,
      0.5
    ], [
      0,
      4,
      -0.2
    ]);
    const S = s(l, [
      -1.32,
      1.5,
      0.6
    ]);
    f = S, n(S, "box", w, [
      1.2,
      1.8,
      0.25
    ]), n(S, "box", b, [
      1,
      1.58,
      0.28
    ]), n(S, "box", t.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(S, "rock", t.light, [
      0.28,
      0.4,
      0.1
    ], [
      0,
      0.1,
      0.22
    ]), c.position.set(1.5, 1.8, 0.25), n(c, "cylinder", "#766450", [
      0.1,
      2.5,
      0.1
    ]), n(c, "box", w, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(c, "box", b, [
      0.24,
      0.96,
      0.94
    ], [
      0,
      1.4,
      0
    ], !1, 1, !0), n(c, "box", t.light, [
      0.22,
      0.77,
      0.74
    ], [
      0.65,
      1.4,
      0
    ]);
  } else if (Oe(r)) Uc(e, l, i, c, r, t);
  else if (r === "wisp")
    n(l, "rock", t.accent, [
      0.35,
      0.6,
      0.35
    ], [
      0,
      1,
      0
    ]), n(i, "torus", b, [
      0.48,
      0.6,
      0.4
    ], [
      0,
      1,
      0
    ]), n(i, "sphere", "#f7f5e8", [
      0.12,
      0.13,
      0.1
    ], [
      0,
      1.05,
      0.31
    ], !0), n(l, "cone", t.light, [
      0.16,
      0.6,
      0.16
    ], [
      0,
      0.35,
      0
    ]).rotation.z = Math.PI;
  else if (r === "stalker") {
    n(l, "sphere", t.dark, [
      0.4,
      0.35,
      0.65
    ], [
      0,
      0.55,
      0
    ]), n(i, "rock", t.foliage, [
      0.33,
      0.38,
      0.32
    ], [
      0,
      0.75,
      0.5
    ]);
    for (const S of [-1, 1])
      g(S * 0.27, -0.25, 0.35), n(i, "cone", b, [
        0.09,
        0.35,
        0.09
      ], [
        S * 0.21,
        1.09,
        0.42
      ]), n(i, "sphere", _, [
        0.05,
        0.04,
        0.035
      ], [
        S * 0.15,
        0.8,
        0.77
      ], !0), n(c, "cone", t.light, [
        0.09,
        0.38,
        0.08
      ], [
        S * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (r === "bomber")
    g(-0.22, 0, 0.45), g(0.22, 0, 0.45), n(l, "sphere", "#85654c", [
      0.5,
      0.6,
      0.4
    ], [
      0,
      0.95,
      0
    ]), n(i, "sphere", t.stone, [
      0.35,
      0.38,
      0.31
    ], [
      0,
      1.62,
      0
    ]), n(i, "box", t.dark, [
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
    ]), n(c, "sphere", "#404c57", [
      0.25,
      0.25,
      0.25
    ], [
      0.56,
      1.1,
      0.18
    ]), n(c, "cone", "#ffca88", [
      0.07,
      0.3,
      0.07
    ], [
      0.56,
      1.41,
      0.18
    ]);
  else {
    const S = r === "priest", $ = r === "guard";
    if (S ? n(l, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (g(-0.22, 0, 0.5), g(0.22, 0, 0.5), n(l, "box", w, [
      0.72,
      0.85,
      0.52
    ], [
      0,
      0.92,
      0
    ])), n(l, "box", t.stone, [
      0.5,
      0.55,
      0.15
    ], [
      0,
      1,
      0.3
    ]), n(i, "sphere", t.stone, [
      0.43,
      0.45,
      0.38
    ], [
      0,
      1.63,
      0
    ]), n(i, "box", w, [
      0.68,
      0.17,
      0.12
    ], [
      0,
      1.65,
      0.32
    ]), n(i, "box", _, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), S)
      n(i, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), c.position.set(0.52, 1, 0.1), n(c, "cylinder", b, [
        0.04,
        1.6,
        0.04
      ]), n(c, "rock", "#d1dcff", [
        0.22,
        0.32,
        0.22
      ], [
        0,
        0.95,
        0
      ]);
    else {
      n(i, "box", t.foliage, [
        0.12,
        0.38,
        0.55
      ], [
        0,
        2,
        -0.07
      ]);
      for (const I of [-1, 1]) n(l, "rock", t.stone, [
        0.28,
        0.23,
        0.3
      ], [
        I * 0.45,
        1.22,
        0
      ]);
      c.position.set(0.54, 1, 0.2), r === "archer" ? bi(e, c, 1.3) : (c.rotation.z = -0.3, x(c, 0.75)), $ && (n(l, "box", b, [
        0.85,
        1.1,
        0.18
      ], [
        -0.4,
        0.95,
        0.46
      ]), n(l, "box", t.foliage, [
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
  const k = s(o, [
    0,
    u ? 5.5 : r === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(k, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const M = n(k, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), F = [];
  l.traverse((S) => {
    S instanceof ya && F.push({
      mesh: S,
      material: S.material
    });
  });
  let y = 0, A = -100, j = 0, z = 0;
  const P = c.rotation.z, C = [l.getObjectByName("furnace-armor-left"), l.getObjectByName("furnace-armor-right")];
  return {
    root: o,
    bar: k,
    update(S, $, I, H = !1) {
      const W = Math.abs(S.x - j) + Math.abs(S.y - z) > 5e-3;
      j = S.x, z = S.y, y && !S.windup && (A = $), y = S.windup;
      const Z = S.windup ? 1 - S.windup / be[S.kind].windup : 0, X = Math.max(0, 1 - ($ - A) / 10);
      o.position.set(S.x, 0, S.y), l.rotation.y = Math.PI / 2 - S.angle, l.position.y = I ? 0 : r === "weaver" || r === "priest" ? 0.13 + Math.sin($ * 0.055) * 0.1 : W ? Math.abs(Math.sin($ * 0.3)) * 0.055 : 0, l.rotation.x = I ? 0 : -Z * 0.16 + X * 0.2, i.rotation.z = !I && r === "king" ? Math.sin($ * 0.035) * 0.08 : 0, c.rotation.x = I ? 0 : Z * -1.3 + X * 1.4, c.rotation.z = P + (I ? 0 : Z * -0.35), f && H && (f.visible = r !== "warden" || Is(S.phase), f.rotation.x = S.exposed ? -Math.PI / 3 : 0), C.forEach((re, Ee) => {
        re && (re.rotation.y = S.phase === 3 ? (Ee ? 1 : -1) * 1.1 : 0);
      });
      for (let re = 0; re < h.length; re++) h[re].rotation.x = !I && W ? Math.sin($ * 0.32 + re * Math.PI) * 0.28 : 0;
      for (const re of F) re.mesh.material = S.marked > 2 && !I ? e.material("#fff6dd") : re.material;
      k.visible = !u && S.hp < S.maxHp, M.scale.x = S.hp / S.maxHp, M.position.x = (S.hp / S.maxHp - 1) * 0.5;
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
function Bc(e, a) {
  const r = /* @__PURE__ */ new Map();
  function t(s, o, l = 1, c = !1) {
    const i = Math.max(0.1, Math.min(1, Math.round(l * 10) / 10)), h = `${s}/${o}/${i}/${c}`;
    let u = r.get(h);
    u || (u = {
      list: [],
      used: 0
    }, r.set(h, u));
    let d = u.list[u.used++];
    return d || (d = e.mesh(a, s, o, [
      1,
      1,
      1
    ], [
      0,
      0,
      0
    ], !c, i), u.list.push(d)), d.visible = !0, d.rotation.set(0, 0, 0), d.scale.set(1, 1, 1), d;
  }
  function n(s, o, l, c, i, h = 1, u = 0.09) {
    const d = t(s, o, h);
    return d.position.set(c, u, i), d.scale.set(l, l, 1), d.rotation.x = -Math.PI / 2, d;
  }
  return { update(s, o, l) {
    for (const i of r.values())
      i.used = 0, i.list.forEach((h) => h.visible = !1);
    if (l) {
      const { left: i, right: h, top: u, bottom: d } = l;
      for (const f of [i, h]) {
        const b = t("box", le.warning, 0.5);
        b.position.set(f, 0.14, (u + d) / 2), b.scale.set(0.1, 0.15, d - u);
      }
      for (const f of [u, d]) {
        const b = t("box", le.warning, 0.5);
        b.position.set((i + h) / 2, 0.14, f), b.scale.set(h - i, 0.15, 0.1);
      }
    }
    if (!s) return;
    const c = s.player;
    if (n("ring", "#f2f6e2", 0.64, c.x, c.y, 0.8), c.dashTime && !o) for (let i = 1; i <= 3; i++) {
      const h = t("cone", le.gold, 0.7 - i * 0.15);
      h.position.set(c.x - Math.cos(c.dashAngle) * i * 0.43, 0.45, c.y - Math.sin(c.dashAngle) * i * 0.43), h.scale.set(0.13, c.dashTime / 8 * 1.7, 0.13), h.rotation.set(0, -c.dashAngle, -Math.PI / 2);
    }
    if (!s.boss && (s.encounter === "siege" || s.encounter === "ritual")) {
      const i = s.objective;
      s.encounter === "ritual" && (n("disc", le.magic, 2.5, i.x, i.y, 0.12), n("ring", le.magic, 2.5, i.x, i.y), n("ring", le.gold, 2.2, i.x, i.y, 0.8));
      const h = t("cylinder", "#526b79");
      h.position.set(i.x, 0.3, i.y), h.scale.set(0.5, 0.6, 0.5);
      const u = t("rock", s.encounter === "siege" ? le.fire : le.magic);
      if (u.position.set(i.x, 1, i.y), u.scale.set(0.23, 0.5, 0.23), s.encounter === "siege") {
        u.position.y = 1.35, u.scale.set(0.4, 0.85, 0.4);
        const d = t("cone", le.gold, 0.8);
        d.position.set(i.x, 1.4, i.y), d.scale.set(0.2, 0.85, 0.2), n("ring", le.fire, 0.9, i.x, i.y, 0.8);
      }
      o || (u.rotation.y = s.tick * 0.025);
    }
    for (const i of s.companions)
      if (!(i.hp <= 0 || i.life <= 0))
        if (n("ring", le.heal, 0.4, i.x, i.y, 0.8), i.kind === "turret") {
          const h = t("cylinder", "#687c81");
          h.position.set(i.x, 0.25, i.y), h.scale.set(0.4, 0.5, 0.4);
          const u = t("box", "#bd9a68");
          u.position.set(i.x, 0.65, i.y), u.scale.set(0.9, 0.2, 0.25), u.rotation.y = -i.angle;
          const d = t("sphere", le.magic);
          d.position.set(i.x + Math.cos(i.angle) * 0.45, 0.65, i.y + Math.sin(i.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const h = i.kind === "familiar" && c.resonance > 0, u = h ? 1.5 : 1, d = i.kind === "shade" ? "#a6acd8" : h ? wa.empowered : wa.familiar, f = o ? 0 : Math.sin(s.tick * 0.1 + i.id) * 0.08, b = t("sphere", d, 1, !0);
          b.position.set(i.x, 0.55 * u + f, i.y), b.scale.set(0.3 * u, 0.36 * u, 0.3 * u);
          for (const w of [-1, 1]) {
            const g = t("cone", d, 1, !0);
            g.position.set(i.x + w * 0.2 * u, 0.93 * u + f, i.y), g.scale.set(0.08 * u, 0.22 * u, 0.08 * u);
          }
          const _ = t("sphere", "#35475b");
          if (_.position.set(i.x + Math.cos(i.angle) * 0.28 * u, 0.63 * u + f, i.y + Math.sin(i.angle) * 0.28 * u), _.scale.setScalar(0.07 * u), h) {
            const w = t("torus", wa.crest, 1, !0);
            w.position.set(i.x, 1.45 + f, i.y), w.rotation.x = Math.PI / 2, w.scale.setScalar(0.32);
            for (let g = 0; g < 3; g++) {
              const x = g * Math.PI * 2 / 3, k = t("rock", wa.crest, 1, !0);
              k.position.set(i.x + Math.cos(x) * 0.32, 1.55 + f, i.y + Math.sin(x) * 0.32), k.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const i of s.enemies) {
      if (Oe(i.kind) && i.phase > 1) {
        const h = be[i.kind].radius + 0.55;
        if (n("ring", i.kind === "king" ? le.fire : le.magic, h, i.x, i.y, 0.65), !o) for (let u = 0; u < i.phase + 2; u++) {
          const d = s.tick * 0.025 + u * Math.PI * 2 / (i.phase + 2), f = t("rock", i.kind === "king" ? le.fire : le.magic, 0.8);
          f.position.set(i.x + Math.cos(d) * h, 0.55 + Math.sin(d * 2) * 0.2, i.y + Math.sin(d) * h), f.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (i.windup) {
        const h = 1 - i.windup / be[i.kind].windup;
        if (n("ring", le.warning, be[i.kind].radius + 0.35, i.x, i.y, 0.8), i.kind === "charger") {
          const u = Math.min(9, Math.hypot(i.target.x - i.x, i.target.y - i.y)), d = t("box", le.danger, 0.3);
          d.scale.set(0.75, 0.035, u), d.position.set(i.x + Math.cos(i.angle) * u / 2, 0.09, i.y + Math.sin(i.angle) * u / 2), d.rotation.y = Math.PI / 2 - i.angle, n("ring", le.danger, 0.5, i.target.x, i.target.y, 0.9);
        } else if (i.kind === "archer") {
          const u = Math.hypot(i.target.x - i.x, i.target.y - i.y), d = t("box", le.warning, 0.6);
          d.position.set((i.x + i.target.x) / 2, 0.11, (i.y + i.target.y) / 2), d.scale.set(u, 0.03, 0.09), d.rotation.y = -i.angle;
        } else i.kind === "bomber" ? n("ring", le.warning, 1.9, i.target.x, i.target.y) : (i.kind === "soldier" || i.kind === "guard" || i.kind === "stalker") && (n("disc", le.danger, be[i.kind].reach, i.target.x, i.target.y, 0.15 + h * 0.2), n("ring", le.danger, be[i.kind].reach, i.target.x, i.target.y));
      }
      if (i.chill && n("ring", le.frost, be[i.kind].radius + 0.13, i.x, i.y), i.exposed && n("arc", le.gold, be[i.kind].radius + 0.3, i.x, i.y, 0.9), i.burn && !o) for (let h = 0; h < 3; h++) {
        const u = t("rock", le.fire, 0.8);
        u.position.set(i.x + Math.sin(h * 2) * 0.3, 0.35 + (s.tick + h * 7) % 20 / 18, i.y + Math.cos(h * 2) * 0.3), u.scale.set(0.08, 0.2, 0.08);
      }
      i.kind === "priest" && n("ring", "#a39aca", 3.5, i.x, i.y, 0.4);
    }
    for (const i of s.hazards) {
      const h = i.friendly ? i.kind === "fire" ? le.fire : le.magic : le.danger;
      if (i.kind === "beam") {
        const u = t("box", h, i.wait ? 0.3 : 0.75);
        u.position.set(i.x + Math.cos(i.angle) * i.length / 2, 0.11, i.y + Math.sin(i.angle) * i.length / 2), u.scale.set(i.length, 0.04, i.width * 2), u.rotation.y = -i.angle;
        for (const d of [0, i.length]) n("disc", h, i.width, i.x + Math.cos(i.angle) * d, i.y + Math.sin(i.angle) * d, i.wait ? 0.3 : 0.75);
        continue;
      }
      if (i.kind === "ring") {
        for (let u = 0; u <= 5; u++) {
          const d = n(i.gap ? "openRing" : "ring", h, i.inner + (i.radius - i.inner) * u / 5, i.x, i.y, u === 0 || u === 5 ? 1 : i.wait ? 0.35 : 0.8);
          d.rotation.z = -i.angle;
        }
        continue;
      }
      if (n("disc", h, i.radius, i.x, i.y, i.wait ? 0.2 : 0.4), n("ring", h, i.radius, i.x, i.y), i.wait) {
        n("ring", h, i.radius * (1 - Math.min(1, i.wait / 45)), i.x, i.y, 0.7);
        const u = t("box", h, 0.7);
        u.position.set(i.x, 0.12, i.y), u.scale.set(0.08, 0.02, 0.6);
        const d = t("box", h, 0.7);
        d.position.copy(u.position), d.scale.set(0.6, 0.02, 0.08);
      } else if (!o) {
        n("ring", le.gold, i.radius * (0.7 + Math.sin(s.tick * 0.1) * 0.1), i.x, i.y, 0.7, 0.25);
        for (let u = 0; u < 6; u++) {
          const d = u * Math.PI / 3, f = t("cone", h, 0.7);
          f.position.set(i.x + Math.cos(d) * i.radius * 0.65, 0.45, i.y + Math.sin(d) * i.radius * 0.65), f.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const i of s.shots) {
      const h = i.friendly ? le.gold : le.danger, u = t("sphere", i.friendly ? "#fffbea" : "#fff1c9");
      u.position.set(i.x, 0.6, i.y), u.scale.set(0.11, 0.11, 0.11);
      const d = t("sphere", h, 0.8);
      d.position.copy(u.position), d.scale.set(0.21, 0.18, 0.21);
      const f = t("cone", h, 0.5);
      f.position.set(i.x - Math.cos(i.angle) * 0.38, 0.6, i.y - Math.sin(i.angle) * 0.38), f.scale.set(0.14, 0.75, 0.14), f.rotation.set(0, -i.angle, -Math.PI / 2);
    }
    for (const i of s.effects) {
      const h = 1 - i.life / (i.kind === "slash" ? 9 : 15);
      if (i.kind === "slash") {
        const u = n("arc", le.gold, i.size, i.x, i.y, 0.3 * (1 - h), 0.42);
        u.rotation.z = -i.angle - 0.9 + h * 0.4;
        const d = n("stroke", "#fff4d2", i.size, i.x, i.y, 0.9 * (1 - h), 0.43);
        d.rotation.z = u.rotation.z;
      } else if (i.kind === "resonance") {
        n("ring", wa.crest, i.size * (o ? 1 : 0.6 + h * (2 - h)), i.x, i.y, 0.8 - h * 0.6, 0.16);
        for (const u of s.companions) {
          if (u.kind !== "familiar" || u.hp <= 0 || u.life <= 0) continue;
          const d = u.x - c.x, f = u.y - c.y, b = t("box", wa.empowered, 1 - h * 0.7);
          b.position.set((c.x + u.x) / 2, 1.1, (c.y + u.y) / 2), b.scale.set(Math.hypot(d, f), 0.045, 0.045), b.rotation.y = -Math.atan2(f, d);
        }
        for (let u = 0; u < 4; u++) {
          const d = u * Math.PI / 2 + (o ? 0 : h), f = t("rock", wa.empowered, 1 - h * 0.4);
          f.position.set(c.x + Math.cos(d) * 0.95, 1.7 + (o ? 0 : h * 0.5), c.y + Math.sin(d) * 0.95), f.scale.set(0.08, 0.18, 0.08);
        }
      } else if (i.kind === "lightning") {
        for (let u = 0; u < 4; u++) {
          const d = t("box", u % 2 ? "#ffffff" : le.magic, 1 - h * 0.6);
          d.scale.set(0.09 + (1 - h) * 0.09, 1.05, 0.08), d.position.set(i.x + (u % 2 ? 0.14 : -0.14), 0.5 + u * 0.85, i.y), d.rotation.z = u % 2 ? -0.35 : 0.35;
        }
        n("ring", le.magic, 0.4 + h, i.x, i.y, 1 - h);
      } else if (i.kind === "block" || i.kind === "parry" || i.kind === "ward-hit" || i.kind === "ward-break") {
        const u = i.kind === "block" || i.kind === "parry", d = i.kind === "ward-break", f = u ? i.kind === "parry" ? ta.parry : ta.block : ta.ward;
        if (u) {
          const b = t("ring", f, 1 - h);
          b.position.set(i.x + Math.cos(i.angle) * 0.7, 1.3, i.y + Math.sin(i.angle) * 0.7), b.rotation.y = Math.PI / 2 - i.angle, b.scale.setScalar(0.6 + h * (i.kind === "parry" ? 1.3 : 0.6));
        }
        for (let b = 0; b < (d ? 6 : 4); b++) {
          const _ = b * 2.4 + i.id, w = t(d ? "rock" : "box", f, 1 - h), g = o ? 1.1 : 0.7 + h * (d ? 1.5 : 0.6);
          w.position.set(i.x + Math.cos(_) * g, 0.7 + b % 3 * 0.55, i.y + Math.sin(_) * g), w.scale.set(0.07 * (1 - h), (d ? 0.3 : 0.16) * (1 - h), 0.04), w.rotation.set(_, _, _);
        }
      } else if (i.kind === "heal") n("ring", le.heal, 0.4 + h, i.x, i.y, 1 - h);
      else {
        const u = i.kind === "hit" ? le.danger : le.gold;
        if (n("ring", u, i.size * (0.4 + h), i.x, i.y, 1 - h), !o) for (let d = 0; d < 7; d++) {
          const f = d * 2.4 + i.id, b = t("rock", u, 1 - h * 0.8);
          b.position.set(i.x + Math.cos(f) * h * i.size, 0.4 + Math.sin(h * Math.PI) * 0.8, i.y + Math.sin(f) * h * i.size), b.scale.set(0.1 * (1 - h), 0.28 * (1 - h), 0.1 * (1 - h)), b.rotation.z = f;
        }
      }
    }
  } };
}
function Zc(e) {
  const a = document.createElement("div"), r = document.createElement("i");
  a.className = "exp-world-ward", a.style.setProperty("--ward-color", ta.ward), a.setAttribute("role", "meter"), a.setAttribute("aria-label", oe.ward), a.setAttribute("aria-valuemin", "0"), a.setAttribute("aria-valuemax", String(J.maxHp)), a.append(r);
  const t = document.createElement("div");
  t.className = "exp-world-defense", e.append(a, t), a.hidden = !0, t.hidden = !0;
  const n = new ua();
  let s = null, o = 0, l = 0, c = null;
  function i(h, u, d, f, b, _, w) {
    n.set(u, d, f).project(b), h.style.left = `${(n.x * 0.5 + 0.5) * _}px`, h.style.top = `${(-n.y * 0.5 + 0.5) * w}px`;
  }
  return {
    update(h, u, d, f) {
      if (h !== s && (s = h, o = 0, c = null, l = 0), a.hidden = !h || h.player.ward <= 0, t.hidden = !h, !h) return;
      const b = h.player;
      a.hidden || (r.style.width = `${b.ward / J.maxHp * 100}%`, a.setAttribute("aria-valuenow", String(b.ward)), i(a, b.x, 0, b.y, u, d, f));
      const _ = h.effects.filter((g) => g.id > o && g.kind in oe.defenseFeedback), w = _.find((g) => g.kind === "parry" || g.kind === "ward-break") ?? _.at(-1);
      w && (c = w.kind, l = h.tick + 27), o = h.serial, h.tick >= l && (c = null), t.hidden = !c && !b.shield, t.dataset.state = c ?? "blocking", t.textContent = c ? oe.defenseFeedback[c] : b.shield ? oe.guardActive : "", i(t, b.x, b.shield ? 3.65 : 3.05, b.y, u, d, f);
    },
    dispose() {
      a.remove(), t.remove();
    }
  };
}
function Qc(e, a, r, t) {
  const n = t.facing === "east" || t.facing === "west", s = n ? t.footprint.depth : t.footprint.width, o = n ? t.footprint.width : t.footprint.depth, l = s >= o;
  a.rotation.y = r.rotation.y = t.facing === "north" ? Math.PI : t.facing === "east" ? Math.PI / 2 : t.facing === "west" ? -Math.PI / 2 : 0;
  const c = t.entrance ? 1 : Math.max(1, Math.floor(Math.max(s, o) / 5));
  e.mesh(a, "box", p.mortar, [
    s,
    0.4,
    o
  ], [
    0,
    0.2,
    0
  ]);
  for (let i = 0; i < c; i++) {
    const h = l ? s / c : s, u = l ? o : o / c, d = e.group(r, [
      l ? -s / 2 + (i + 0.5) * h : 0,
      0,
      l ? 0 : -o / 2 + (i + 0.5) * u
    ]), f = (t.height ?? 4) + (i % 3 - 1) * 0.35, b = t.kind === "workshop", _ = t.facing ? t.tint === "rose" ? "#c9b8cb" : t.tint === "sage" ? "#b6c5ca" : "#d4c8bb" : i % 2 ? p.stone : p.cloth;
    e.mesh(d, "box", _, [
      h - 0.15,
      f - 0.4,
      u - 0.15
    ], [
      0,
      (f + 0.4) / 2,
      0
    ]);
    for (const M of [-h / 2 + 0.12, h / 2 - 0.12]) e.mesh(d, "box", p.timber, [
      0.18,
      f,
      u
    ], [
      M,
      f / 2,
      0
    ]);
    for (const M of [0.7, f - 0.3]) e.mesh(d, "box", p.wood, [
      h,
      0.15,
      u
    ], [
      0,
      M,
      0
    ]);
    const w = e.group(d, [
      0,
      f + 0.24,
      0
    ]);
    w.rotation.x = -0.18;
    const g = !l && c > 1 ? u - 0.03 : u + 0.7;
    e.mesh(w, "box", p.roof, [
      h + 0.6,
      0.16,
      g
    ]);
    for (let M = -h / 2; M <= h / 2; M += 0.8) e.mesh(w, "box", p.roofLight, [
      0.055,
      0.07,
      g
    ], [
      M,
      0.12,
      0
    ]);
    e.mesh(w, "box", p.brass, [
      h + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      g / 2
    ]);
    const x = e.group(d, [
      0,
      0,
      u / 2
    ]), k = t.entrance ? 0 : -h * 0.19;
    e.mesh(x, "box", p.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      k,
      1.1,
      0
    ]);
    for (const M of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(x, "box", p.wood, [
      0.24,
      1.95,
      0.12
    ], [
      k + M,
      1.06,
      0.04
    ]);
    if (e.mesh(x, "box", p.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      h * 0.27,
      2.25,
      0.03
    ]), e.mesh(x, "box", p.ember, [
      0.7,
      0.67,
      0.14
    ], [
      h * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(x, "box", p.timber, [
      0.07,
      0.85,
      0.16
    ], [
      h * 0.27,
      2.25,
      0.15
    ]), e.mesh(x, "box", p.timber, [
      0.85,
      0.07,
      0.16
    ], [
      h * 0.27,
      2.25,
      0.15
    ]), t.facing) {
      for (const [M, F, y] of [
        [
          0,
          u / 2,
          h
        ],
        [
          Math.PI,
          u / 2,
          h
        ],
        [
          -Math.PI / 2,
          h / 2,
          u
        ],
        [
          Math.PI / 2,
          h / 2,
          u
        ]
      ]) {
        const A = e.group(d);
        A.rotation.y = M;
        for (let j = -y / 2 + 1.8; j < y / 2 - 0.8; j += 3.2) for (let z = 2.1; z < f - 0.65; z += 2.5)
          M === 0 && z < 3 && (Math.abs(j - k) < 1.3 || Math.abs(j - h * 0.27) < 1.3) || (e.mesh(A, "box", p.shadow, [
            1.16,
            1.45,
            0.12
          ], [
            j,
            z,
            F
          ]), e.mesh(A, "box", p.ember, [
            0.94,
            1.17,
            0.07
          ], [
            j,
            z,
            F + 0.08
          ], !0), e.mesh(A, "box", p.timber, [
            0.08,
            1.3,
            0.11
          ], [
            j,
            z,
            F + 0.14
          ]), e.mesh(A, "box", p.timber, [
            1.03,
            0.09,
            0.11
          ], [
            j,
            z,
            F + 0.14
          ]), e.mesh(A, "box", p.light, [
            1.4,
            0.14,
            0.34
          ], [
            j,
            z - 0.76,
            F + 0.09
          ]));
        f > 5.5 && e.mesh(A, "box", p.light, [
          y,
          0.17,
          0.17
        ], [
          0,
          3.35,
          F
        ]);
      }
      if (t.entrance) {
        e.mesh(x, "box", p.timber, [
          2.9,
          0.8,
          0.18
        ], [
          0,
          3.45,
          0.14
        ]);
        for (const M of [
          -0.8,
          0,
          0.8
        ]) e.mesh(x, "box", p.brass, [
          0.25,
          0.38,
          0.04
        ], [
          M,
          3.45,
          0.25
        ]);
        for (const M of [-1, 1])
          e.mesh(x, "box", p.brass, [
            0.1,
            0.8,
            0.5
          ], [
            M * 1.6,
            2.9,
            0.25
          ]), e.mesh(x, "box", p.ember, [
            0.35,
            0.48,
            0.3
          ], [
            M * 1.6,
            2.5,
            0.43
          ], !0);
      }
    }
    if (u >= 4 && (l || i === c - 1)) {
      const M = e.group(x, [
        0,
        2.8,
        0.55
      ]);
      M.rotation.x = 0.22, e.mesh(M, "box", t.tint === "rose" ? p.rose : p.cloth, [
        h * 0.8,
        0.045,
        1.6
      ]), e.mesh(M, "box", p.light, [
        0.55,
        0.015,
        0.45
      ], [
        -h * 0.17,
        0.035,
        0.35
      ]);
    }
    if (b) {
      e.mesh(d, "box", p.wood, [
        h * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        u / 2 - 0.5
      ]);
      for (let M = 0; M < 3; M++) e.mesh(d, "cylinder", p.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (M - 1) * 0.55,
        1.4,
        u / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(d, "box", p.slate, [
        0.6,
        f * 0.38,
        0.7
      ], [
        -h * 0.3,
        f + 0.55,
        -u * 0.2
      ]), e.mesh(d, "box", p.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -h * 0.3,
        f * 1.19 + 0.6,
        -u * 0.2
      ]);
  }
}
function Kc(e, a, r) {
  const t = e.group(a, [
    r.width / 2 + 0.04,
    0,
    0
  ]);
  t.rotation.y = Math.PI / 2;
  const n = Math.min(4.8, r.depth - 0.7);
  e.mesh(t, "box", p.timber, [
    n,
    0.16,
    2.2
  ], [
    0,
    3.25,
    1
  ]), e.mesh(t, "box", p.cloth, [
    n - 0.15,
    2.35,
    1.75
  ], [
    0,
    4.5,
    0.86
  ]);
  for (const o of [-n / 2 + 0.1, n / 2 - 0.1]) {
    e.mesh(t, "box", p.timber, [
      0.16,
      2.5,
      1.9
    ], [
      o,
      4.5,
      0.9
    ]);
    const l = e.mesh(t, "box", p.wood, [
      0.15,
      1,
      0.15
    ], [
      o,
      3,
      0.4
    ]);
    l.rotation.x = -0.68;
  }
  e.mesh(t, "box", p.shadow, [
    1.3,
    1,
    0.05
  ], [
    0,
    4.55,
    1.76
  ]), e.mesh(t, "box", p.ember, [
    1.03,
    0.77,
    0.06
  ], [
    0,
    4.55,
    1.8
  ], !0), e.mesh(t, "box", p.timber, [
    0.07,
    0.95,
    0.1
  ], [
    0,
    4.55,
    1.85
  ]);
  for (const o of [-0.78, 0.78]) e.mesh(t, "box", p.wood, [
    0.26,
    1.15,
    0.12
  ], [
    o,
    4.55,
    1.83
  ]);
  const s = e.group(t, [
    0,
    5.8,
    1.1
  ]);
  s.rotation.x = 0.14, e.mesh(s, "box", p.roof, [
    n + 0.45,
    0.16,
    2.5
  ]);
  for (let o = -n / 2; o < n / 2; o += 0.6) e.mesh(s, "box", p.roofLight, [
    0.07,
    0.1,
    2.53
  ], [
    o,
    0.1,
    0
  ]);
  e.mesh(t, "box", p.wood, [
    1.2,
    1.9,
    0.08
  ], [
    0,
    1,
    0.04
  ]), e.mesh(t, "box", p.timber, [
    0.1,
    0.4,
    0.06
  ], [
    0.3,
    1,
    0.11
  ]);
}
function Yc(e, a) {
  e.mesh(a, "box", p.mortar, [
    4,
    0.2,
    4
  ], [
    0,
    0.1,
    0
  ]), e.mesh(a, "box", p.slate, [
    1.45,
    1.1,
    1.15
  ], [
    0,
    0.75,
    0
  ]), e.mesh(a, "box", p.shadow, [
    0.95,
    0.55,
    0.04
  ], [
    0,
    0.62,
    0.59
  ]), e.mesh(a, "box", p.ember, [
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
  ]) e.mesh(a, "box", p.shadow, [
    0.05,
    0.48,
    0.07
  ], [
    r,
    0.62,
    0.67
  ]);
  e.mesh(a, "cylinder", p.shadow, [
    0.13,
    2.5,
    0.13
  ], [
    -0.48,
    2.25,
    -0.4
  ]), e.mesh(a, "cylinder", p.pottery, [
    0.36,
    0.48,
    0.36
  ], [
    0.2,
    1.52,
    0
  ]), e.mesh(a, "cylinder", p.shadow, [
    0.38,
    0.07,
    0.38
  ], [
    0.2,
    1.79,
    0
  ]);
  for (let r = 0; r < 5; r++) e.mesh(a, "box", p.wood, [
    0.8,
    0.16,
    0.2
  ], [
    1.25,
    0.3 + r % 3 * 0.18,
    -0.5 + Math.floor(r / 3) * 0.24
  ]);
  e.mesh(a, "cylinder", p.timber, [
    0.38,
    0.65,
    0.38
  ], [
    -1.15,
    0.52,
    0.5
  ]);
  for (let r = 0; r < 5; r++) e.mesh(a, "rock", p.shadow, [
    0.18,
    0.16,
    0.17
  ], [
    -1.15 + Math.sin(r * 2) * 0.2,
    0.87,
    0.5 + Math.cos(r * 2) * 0.2
  ]);
}
function Vc(e, a, r, t) {
  e.mesh(a, "box", p.wood, [
    r,
    0.16,
    t
  ], [
    0,
    1,
    0
  ]);
  for (const n of [-1, 1]) e.mesh(a, "box", p.timber, [
    0.18,
    1,
    t - 0.2
  ], [
    n * (r / 2 - 0.2),
    0.5,
    0
  ]);
  e.mesh(a, "box", p.cloth, [
    r * 0.4,
    0.025,
    t * 0.8
  ], [
    -r * 0.2,
    1.1,
    0
  ]);
  for (let n = 0; n < 5; n++)
    e.mesh(a, "cylinder", n % 2 ? p.pottery : p.slate, [
      0.16,
      0.32 + n % 2 * 0.15,
      0.16
    ], [
      r * 0.04 + n * 0.43,
      1.28,
      -0.3
    ]), e.mesh(a, "cylinder", p.wood, [
      0.17,
      0.055,
      0.17
    ], [
      r * 0.04 + n * 0.43,
      1.47 + n % 2 * 0.075,
      -0.3
    ]);
  for (let n = 0; n < 3; n++) e.mesh(a, "box", p.light, [
    0.8,
    0.12,
    0.48
  ], [
    -r * 0.25,
    1.18 + n * 0.12,
    0.12
  ]);
  e.mesh(a, "cylinder", p.pottery, [
    0.3,
    0.18,
    0.3
  ], [
    r * 0.22,
    1.19,
    0.45
  ]);
}
function Jc(e, a, r) {
  const t = new ua(...r.from), n = new ua(...r.to), s = n.clone().sub(t), o = s.length(), l = r.kind === "pipe", c = l ? 0.23 : 0.018, i = e.mesh(a, "cylinder", l ? p.brass : p.timber, [
    c,
    o,
    c
  ], t.clone().add(n).multiplyScalar(0.5).toArray());
  if (i.quaternion.setFromUnitVectors(new ua(0, 1, 0), s.normalize()), l) for (let h = 1; h < o; h += 3.7) {
    const u = t.clone().addScaledVector(s, h);
    e.mesh(a, "cylinder", p.wood, [
      0.28,
      0.16,
      0.28
    ], u.toArray()).quaternion.copy(i.quaternion), e.mesh(a, "box", p.shadow, [
      0.12,
      0.65,
      0.12
    ], [
      u.x,
      u.y - 0.3,
      u.z
    ]);
  }
  else for (let h = 2; h < o - 2; h += 1.9) {
    const u = t.clone().addScaledVector(s, h), d = e.group(a, u.toArray());
    d.rotation.y = Math.atan2(s.x, s.z) + Math.PI / 2, e.shape(d, [
      [-0.55, 0],
      [0.55, 0],
      [0.5, -1.05],
      [-0.45, -1.12]
    ], Math.floor(h) % 2 ? p.cloth : p.light);
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
function Xc(e, a, r) {
  const { width: t, depth: n } = r.footprint;
  if (r.kind === "ledger") {
    e.mesh(a, "box", p.wood, [
      t,
      0.18,
      n
    ], [
      0,
      1.18,
      0
    ]);
    for (const l of [-1, 1]) e.mesh(a, "box", p.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      l * (t / 2 - 0.3),
      0.55,
      0
    ]);
    for (let l = -1; l <= 1; l++)
      e.mesh(a, "box", p.slate, [
        0.85,
        0.17,
        1.1
      ], [
        l * 1.2,
        1.35,
        -0.3
      ]), e.mesh(a, "box", p.light, [
        0.77,
        0.025,
        0.98
      ], [
        l * 1.2,
        1.45,
        -0.3
      ]), e.mesh(a, "box", p.brass, [
        0.08,
        0.025,
        1.13
      ], [
        l * 1.2,
        1.48,
        -0.3
      ]);
    e.mesh(a, "cylinder", p.brass, [
      0.18,
      0.25,
      0.18
    ], [
      t * 0.28,
      1.4,
      n * 0.28
    ]), e.mesh(a, "box", p.light, [
      1.1,
      0.024,
      0.65
    ], [
      -t * 0.2,
      1.3,
      n * 0.28
    ]);
    return;
  }
  e.mesh(a, "box", p.timber, [
    t,
    0.16,
    n
  ], [
    0,
    0.08,
    0
  ]);
  const s = Math.max(1, Math.floor(n / 2.2)), o = Math.max(1, Math.floor(t / 1.8));
  for (let l = 0; l < s; l++) for (let c = 0; c < o; c++) {
    const i = -t / 2 + (c + 0.5) * t / o, h = -n / 2 + (l + 0.5) * n / s, u = t / o - 0.22, d = n / s - 0.24;
    if (r.kind === "fuel") {
      for (let f = 0; f < 5; f++) e.mesh(a, "box", f % 2 ? p.wood : p.timber, [
        u,
        0.2,
        d / 2 - 0.07
      ], [
        i,
        0.28 + f * 0.24,
        h + f % 2 * 0.12
      ]);
      e.mesh(a, "box", p.cloth, [
        u + 0.08,
        0.055,
        d
      ], [
        i,
        1.42,
        h
      ]);
    } else {
      const f = 0.85 + (l + c) % 3 * 0.22;
      e.mesh(a, "box", p.wood, [
        u,
        f,
        d
      ], [
        i,
        0.16 + f / 2,
        h
      ]);
      for (const b of [-1, 1]) e.mesh(a, "box", p.timber, [
        0.11,
        f + 0.04,
        d + 0.05
      ], [
        i + b * u * 0.32,
        0.16 + f / 2,
        h
      ]);
      e.mesh(a, "box", p.light, [
        0.32,
        0.4,
        0.03
      ], [
        i,
        0.7,
        h + d / 2 + 0.02
      ]), e.mesh(a, "box", p.rose, [
        0.09,
        0.09,
        0.04
      ], [
        i,
        0.61,
        h + d / 2 + 0.045
      ]);
      for (let b = -0.25; b <= 0.25; b += 0.25) e.mesh(a, "box", p.timber, [
        u,
        0.015,
        0.016
      ], [
        i,
        f + 0.17,
        h + b * d
      ]);
      (l + c) % 3 === 0 && (e.mesh(a, "box", p.cloth, [
        u * 0.75,
        0.38,
        d * 0.55
      ], [
        i,
        f + 0.37,
        h - 0.18
      ]), e.mesh(a, "box", p.timber, [
        0.055,
        0.4,
        d * 0.57
      ], [
        i,
        f + 0.37,
        h - 0.18
      ])), e.mesh(a, "box", p.light, [
        0.32,
        0.018,
        0.45
      ], [
        i + u * 0.23,
        f + 0.19,
        h + d * 0.25
      ]);
    }
  }
}
function ed(e, a, r, t) {
  for (let n = 0; n < 3; n++) e.mesh(a, "box", p.slate, [
    r * 0.65,
    0.08,
    0.7
  ], [
    0,
    2.19 + n * 0.08,
    t * 0.22
  ]);
  e.mesh(a, "box", p.rose, [
    r * 0.6,
    0.03,
    0.08
  ], [
    0,
    2.41,
    t * 0.22 + 0.25
  ]), e.mesh(a, "cylinder", p.pottery, [
    0.22,
    0.15,
    0.22
  ], [
    r * 0.35,
    0.17,
    t * 0.35
  ]), e.mesh(a, "cylinder", p.shadow, [
    0.18,
    0.014,
    0.18
  ], [
    r * 0.35,
    0.25,
    t * 0.35
  ]);
  for (const n of [-0.17, 0.17]) e.mesh(a, "box", p.wood, [
    0.23,
    0.12,
    0.44
  ], [
    n,
    0.08,
    -t * 0.37
  ]);
  e.mesh(a, "box", p.rose, [
    0.42,
    0.045,
    0.3
  ], [
    0.3,
    0.9,
    t * 0.2
  ]);
}
function cs(e, a, r) {
  const { width: t, depth: n } = r.footprint, s = r.tint === "rose" ? p.rose : r.tint === "amber" ? p.amber : p.leafLight, o = (l) => {
    for (const c of [-1, 1]) for (const i of [-1, 1]) e.mesh(a, "box", p.timber, [
      0.16,
      l,
      0.16
    ], [
      c * (t / 2 - 0.3),
      l / 2,
      i * (n / 2 - 0.3)
    ]);
  };
  switch (r.kind) {
    case "bed":
      o(0.65), e.mesh(a, "box", p.wood, [
        t - 0.25,
        0.3,
        n - 0.25
      ], [
        0,
        0.65,
        0
      ]), e.mesh(a, "box", p.light, [
        t - 0.5,
        0.25,
        n - 0.5
      ], [
        0,
        0.91,
        0
      ]), e.mesh(a, "box", s, [
        t - 0.42,
        0.1,
        n * 0.6
      ], [
        0,
        1.08,
        n * 0.13
      ]), e.mesh(a, "box", p.cloth, [
        t - 0.7,
        0.12,
        0.35
      ], [
        0,
        1.15,
        -n * 0.15
      ]), e.mesh(a, "box", p.light, [
        t - 1,
        0.25,
        1
      ], [
        0,
        1.15,
        -n / 2 + 1
      ]), e.mesh(a, "box", p.timber, [
        t - 0.1,
        1.5,
        0.17
      ], [
        0,
        0.9,
        -n / 2 + 0.12
      ]);
      for (const l of [-1, 1]) e.mesh(a, "cylinder", p.brass, [
        0.07,
        1.35,
        0.07
      ], [
        l * (t / 2 - 0.23),
        0.9,
        -n / 2 + 0.22
      ]);
      e.mesh(a, "box", s, [
        1,
        0.018,
        n - 0.8
      ], [
        t / 2 + 0.65,
        0.015,
        0
      ]).castShadow = !1;
      for (const l of [-1, 1]) e.mesh(a, "box", p.cloth, [
        0.95,
        0.021,
        0.1
      ], [
        t / 2 + 0.65,
        0.02,
        l * (n / 2 - 0.65)
      ]).castShadow = !1;
      break;
    case "wardrobe": {
      e.mesh(a, "box", p.timber, [
        t - 0.15,
        2.9,
        n - 0.15
      ], [
        0,
        2.9 / 2,
        0
      ]);
      for (const c of [-1, 1])
        e.mesh(a, "box", p.wood, [
          t / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          c * t / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(a, "box", p.cloth, [
          t / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          c * t / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(a, "box", p.brass, [
          0.045,
          0.27,
          0.08
        ], [
          c * 0.2,
          1.4,
          n / 2 + 0.14
        ]);
      e.mesh(a, "box", p.wood, [
        t + 0.1,
        0.16,
        n + 0.15
      ], [
        0,
        2.9,
        0
      ]), e.mesh(a, "box", s, [
        t * 0.4,
        0.17,
        n * 0.65
      ], [
        -t * 0.23,
        3.06,
        0
      ]);
      break;
    }
    case "toolrack":
      for (const l of [-1, 1]) e.mesh(a, "box", p.timber, [
        0.17,
        2.8,
        n
      ], [
        l * (t / 2 - 0.2),
        1.4,
        0
      ]);
      for (const l of [
        0.3,
        1.4,
        2.5
      ]) {
        e.mesh(a, "box", p.wood, [
          t,
          0.15,
          n
        ], [
          0,
          l,
          0
        ]);
        for (let c = 0; c < 4; c++) e.mesh(a, "cylinder", p.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -t * 0.3 + c * 0.6,
          l + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(a, "box", p.shadow, [
          0.2,
          0.25,
          0.7
        ], [
          t * 0.32,
          l + 0.2,
          0
        ]);
      }
      break;
    case "cabinet": {
      const l = r.height ?? 2.5;
      e.mesh(a, "box", p.timber, [
        t - 0.2,
        l,
        n - 0.2
      ], [
        0,
        l / 2,
        0
      ]);
      for (let c = -t / 2 + 0.55; c < t / 2 - 0.2; c += 1) for (let i = 0.5; i < l - 0.1; i += 0.8)
        e.mesh(a, "box", p.wood, [
          0.88,
          0.68,
          0.12
        ], [
          c,
          i,
          n / 2 - 0.04
        ]), e.mesh(a, "sphere", p.brass, [
          0.055,
          0.055,
          0.06
        ], [
          c,
          i,
          n / 2 + 0.03
        ]);
      e.mesh(a, "box", p.cloth, [
        t * 0.45,
        0.13,
        n * 0.66
      ], [
        -t * 0.2,
        l + 0.075,
        0
      ]);
      for (let c = 0; c < 3; c++) e.mesh(a, "cylinder", c % 2 ? p.pottery : p.light, [
        0.15,
        0.32 + c * 0.1,
        0.15
      ], [
        t * 0.15 + c * 0.4,
        l + 0.2,
        0
      ]);
      break;
    }
    case "table":
    case "workbench":
      if (o(1.2), e.mesh(a, "box", p.wood, [
        t,
        0.18,
        n
      ], [
        0,
        1.28,
        0
      ]), e.mesh(a, "box", p.timber, [
        t - 0.5,
        0.15,
        0.15
      ], [
        0,
        0.4,
        0
      ]), r.kind === "workbench") {
        for (let l = 0; l < 3; l++) e.mesh(a, "cylinder", p.brass, [
          0.15,
          1,
          0.15
        ], [
          (l - 1) * 0.7,
          1.55,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(a, "box", p.shadow, [
          0.1,
          0.08,
          1
        ], [
          t * 0.3,
          1.42,
          0
        ]).rotation.y = 0.5;
      } else {
        e.mesh(a, "box", p.light, [
          1,
          0.08,
          0.7
        ], [
          -t * 0.24,
          1.42,
          0
        ]).rotation.y = -0.12, e.mesh(a, "cylinder", p.pottery, [
          0.28,
          0.45,
          0.28
        ], [
          t * 0.2,
          1.6,
          0
        ]);
        for (const l of [-0.45, 0.45]) e.mesh(a, "cylinder", p.light, [
          0.13,
          0.19,
          0.13
        ], [
          t * 0.2 + 0.65,
          1.48,
          l
        ]);
        e.mesh(a, "cylinder", p.brass, [
          0.15,
          0.13,
          0.15
        ], [
          -t * 0.32,
          1.43,
          -n * 0.3
        ]), e.mesh(a, "cylinder", p.light, [
          0.07,
          0.32,
          0.07
        ], [
          -t * 0.32,
          1.65,
          -n * 0.3
        ]), e.mesh(a, "rock", p.ember, [
          0.055,
          0.14,
          0.055
        ], [
          -t * 0.32,
          1.92,
          -n * 0.3
        ], !0);
      }
      break;
    case "chair":
      o(0.7), e.mesh(a, "box", p.wood, [
        t - 0.25,
        0.18,
        n - 0.25
      ], [
        0,
        0.78,
        0
      ]);
      for (const l of [-1, 1]) e.mesh(a, "box", p.timber, [
        0.14,
        1.5,
        0.14
      ], [
        l * (t / 2 - 0.3),
        0.78,
        n / 2 - 0.3
      ]);
      e.mesh(a, "box", p.wood, [
        t - 0.45,
        0.4,
        0.13
      ], [
        0,
        1.35,
        n / 2 - 0.3
      ]);
      break;
    case "basin":
      o(0.9), e.mesh(a, "box", p.wood, [
        t - 0.2,
        0.15,
        n - 0.2
      ], [
        0,
        0.95,
        0
      ]), e.mesh(a, "cylinder", p.light, [
        0.65,
        0.22,
        0.65
      ], [
        0,
        1.12,
        0
      ]), e.mesh(a, "cylinder", p.water, [
        0.54,
        0.025,
        0.54
      ], [
        0,
        1.24,
        0
      ]), e.mesh(a, "box", p.cloth, [
        0.35,
        0.07,
        n * 0.8
      ], [
        t / 2 - 0.25,
        1.06,
        0
      ]);
      break;
    case "screen": {
      const l = t > n, c = Math.max(t, n), i = e.group(a);
      l || (i.rotation.y = Math.PI / 2);
      for (let h = -c / 2 + 0.15; h < c / 2; h += 1.4)
        e.mesh(i, "box", p.timber, [
          0.09,
          2.8,
          0.12
        ], [
          h,
          1.4,
          0
        ]), e.mesh(i, "box", p.cloth, [
          Math.min(1.27, c / 2 - h),
          2.15,
          0.055
        ], [
          h + Math.min(0.68, (c / 2 - h) / 2),
          1.53,
          0
        ]);
      for (const h of [-1, 1]) e.mesh(i, "box", p.timber, [
        0.3,
        0.18,
        0.8
      ], [
        h * (c / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function ad(e, a, r, t) {
  const { width: n, depth: s } = t.footprint, o = t.height;
  e.mesh(a, "box", p.slate, [
    n,
    0.3,
    s
  ], [
    0,
    0.15,
    0
  ]), e.mesh(r, "box", p.light, [
    n,
    o - 0.3,
    s
  ], [
    0,
    (o + 0.3) / 2,
    0
  ]);
  for (const i of [0.5, o - 0.1]) e.mesh(r, "box", p.wood, [
    n + 0.04,
    0.16,
    s + 0.04
  ], [
    0,
    i,
    0
  ]);
  const l = n > s, c = Math.max(n, s);
  for (let i = -c / 2 + 0.3; i < c / 2; i += 3.5) e.mesh(r, "box", p.wood, [
    l ? 0.12 : n + 0.04,
    o,
    l ? s + 0.04 : 0.12
  ], [
    l ? i : 0,
    o / 2,
    l ? 0 : i
  ]);
  if (t.id === "west-wall") {
    const i = e.group(r, [
      n / 2 + 0.04,
      2.35,
      0
    ]);
    i.rotation.y = Math.PI / 2, e.mesh(i, "box", p.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(i, "box", p.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const h of [-1, 1])
      e.mesh(i, "box", p.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        h * 0.73,
        -0.07,
        0.21
      ]), e.mesh(i, "box", p.brass, [
        0.78,
        0.06,
        0.03
      ], [
        h * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(i, "box", p.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(i, "box", p.wood, [
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
function td(e, a) {
  for (const r of [-1, 1]) e.mesh(a, "box", p.timber, [
    0.22,
    3.6,
    0.4
  ], [
    r * 1.9,
    1.8,
    0
  ]);
  e.mesh(a, "box", p.wood, [
    4,
    0.22,
    0.45
  ], [
    0,
    3.65,
    0
  ]), e.mesh(a, "box", p.wood, [
    3.5,
    3.35,
    0.16
  ], [
    0,
    1.7,
    0
  ]);
  for (const r of [0.5, 2.8]) e.mesh(a, "box", p.timber, [
    3.5,
    0.13,
    0.2
  ], [
    0,
    r,
    0
  ]);
  for (const r of [-1, 1]) e.mesh(a, "sphere", p.brass, [
    0.09,
    0.09,
    0.09
  ], [
    1.25,
    1.45,
    r * 0.16
  ]);
}
var ye = {
  iron: "#526777",
  deck: "#637b8c",
  walkway: "#8297a5",
  edge: "#9dacae",
  copper: "#a97b55",
  snow: "#d8e6e9",
  snowPath: "#bdd0d9",
  snowCrest: "#edf3f2",
  ice: "#a8c3cf",
  soot: "#354558",
  ember: "#f5c58b"
}, Ke = ye;
function ur(e, a, r) {
  const { width: t, depth: n } = r.footprint, s = r.height;
  if (r.kind === "cliff") {
    const o = t > n, l = Math.ceil(Math.max(t, n) / 7);
    for (let c = 0; c < l; c++) {
      const i = [
        o ? -t / 2 + (c + 0.5) * t / l : 0,
        s * 0.4,
        o ? 0 : -n / 2 + (c + 0.5) * n / l
      ];
      e.mesh(a, "rock", Ke.ice, [
        o ? t / l * 0.55 : t / 2,
        s * 0.7,
        o ? n / 2 : n / l * 0.55
      ], i), e.mesh(a, "rock", Ke.snow, [
        o ? t / l * 0.53 : t * 0.48,
        s * 0.17,
        o ? n * 0.48 : n / l * 0.53
      ], [
        i[0],
        s * 0.93,
        i[2]
      ]);
    }
    return;
  }
  if (e.mesh(a, "box", Ke.soot, [
    t,
    0.65,
    n
  ], [
    0,
    0.325,
    0
  ]), r.kind === "hoist") {
    for (const o of [-1, 1]) {
      e.mesh(a, "box", Ke.iron, [
        0.65,
        s,
        n * 0.72
      ], [
        o * (t / 2 - 0.5),
        s / 2,
        0
      ]);
      for (let l = 2; l < s; l += 4) e.mesh(a, "box", Ke.copper, [
        t,
        0.25,
        0.3
      ], [
        0,
        l,
        n * 0.34
      ]);
      e.mesh(a, "cylinder", Ke.edge, [
        0.075,
        s - 2,
        0.075
      ], [
        o * t * 0.18,
        s / 2,
        0.6
      ]);
    }
    e.mesh(a, "box", Ke.iron, [
      t + 0.4,
      1,
      n
    ], [
      0,
      s,
      0
    ]), e.mesh(a, "torus", Ke.copper, [
      t * 0.3,
      t * 0.3,
      0.8
    ], [
      0,
      s - 1.8,
      0.3
    ]), e.mesh(a, "box", Ke.edge, [
      t * 0.7,
      0.45,
      n * 0.7
    ], [
      0,
      s * 0.35,
      0
    ]);
    return;
  }
  e.mesh(a, "cylinder", Ke.iron, [
    t * 0.44,
    s - 1,
    n * 0.44
  ], [
    0,
    s / 2 + 0.5,
    0
  ]);
  for (const o of [
    1.1,
    s * 0.38,
    s * 0.7,
    s - 0.3
  ]) e.mesh(a, "cylinder", Ke.copper, [
    t * 0.48,
    0.3,
    n * 0.48
  ], [
    0,
    o,
    0
  ]);
  for (let o = 0; o < 8; o++) {
    const l = o * Math.PI / 4;
    e.mesh(a, "box", Ke.edge, [
      0.22,
      s,
      0.22
    ], [
      Math.sin(l) * t * 0.44,
      s / 2,
      Math.cos(l) * n * 0.44
    ]);
  }
  for (const o of [-1, 1]) {
    e.mesh(a, "box", Ke.soot, [
      t * 0.16,
      s * 0.34,
      0.15
    ], [
      o * t * 0.23,
      s * 0.58,
      n * 0.45
    ]);
    for (let l = 0; l < 5; l++) e.mesh(a, "box", Ke.copper, [
      t * 0.16,
      0.14,
      0.2
    ], [
      o * t * 0.23,
      s * 0.44 + l * s * 0.065,
      n * 0.46
    ]);
  }
  e.mesh(a, "box", Ke.soot, [
    t * 0.4,
    s * 0.22,
    0.18
  ], [
    0,
    s * 0.16,
    n * 0.45
  ]), e.mesh(a, "torus", Ke.copper, [
    Math.min(t * 0.16, 1.3),
    Math.min(t * 0.16, 1.3),
    0.25
  ], [
    0,
    s * 0.18,
    n * 0.47
  ]);
}
function nd(e, a, r) {
  const t = r.bounds, n = t.z - t.depth / 2;
  if (r.vista === "snow") {
    for (let s = 0; s < 14; s++) {
      const o = s % 2 ? -1 : 1, l = 18 + s % 4 * 11, c = o * (t.width / 2 + 22 + s % 3 * 16), i = n - 35 + s * 12;
      e.mesh(a, "rock", s % 3 ? "#99b2c4" : "#b9cdd7", [
        19,
        l,
        23
      ], [
        c,
        -15,
        i
      ]), e.mesh(a, "rock", "#e4eff0", [
        12,
        l * 0.29,
        15
      ], [
        c,
        l * 0.66 - 15,
        i
      ]);
    }
    return;
  }
  ur(e, e.group(a, [
    0,
    -8,
    n - 27
  ]), {
    id: "vista-furnace",
    kind: "kiln",
    height: 68,
    footprint: {
      x: 0,
      z: 0,
      width: 40,
      depth: 34
    }
  });
  for (const s of [-1, 1]) {
    ur(e, e.group(a, [
      s * 33,
      -8,
      n - 18
    ]), {
      id: "vista-hoist",
      kind: "hoist",
      height: 42,
      footprint: {
        x: 0,
        z: 0,
        width: 8,
        depth: 9
      }
    });
    for (let o = 0; o < 5; o++) {
      const l = s * (t.width / 2 + 16), c = n + o * 18;
      e.mesh(a, "box", "#8197a5", [
        11,
        10 + o % 2 * 6,
        12
      ], [
        l,
        -3,
        c
      ]), e.mesh(a, "box", "#52687b", [
        12,
        0.5,
        13
      ], [
        l,
        2 + o % 2 * 3,
        c
      ]);
    }
  }
}
function gi(e, a, r, t, n = 2.8) {
  e.mesh(a, "cylinder", p.shadow, [
    0.055,
    n,
    0.055
  ], [
    r,
    n / 2,
    t
  ]), e.mesh(a, "box", p.brass, [
    0.4,
    0.08,
    0.4
  ], [
    r,
    n,
    t
  ]), e.mesh(a, "box", p.ember, [
    0.22,
    0.38,
    0.22
  ], [
    r,
    n + 0.21,
    t
  ], !0), e.mesh(a, "cone", p.shadow, [
    0.32,
    0.24,
    0.32
  ], [
    r,
    n + 0.51,
    t
  ]);
  for (const s of [-1, 1]) e.mesh(a, "box", p.shadow, [
    0.035,
    0.4,
    0.035
  ], [
    r + s * 0.14,
    n + 0.2,
    t + 0.14
  ]);
}
function vi(e, a, r, t, n, s) {
  const o = r / 2 + 0.45, l = Math.atan2(s, o), c = Math.hypot(o, s);
  for (const i of [-1, 1]) {
    const h = e.group(a, [
      i * o / 2,
      n + s / 2,
      0
    ]);
    h.rotation.z = -i * l, e.mesh(h, "box", p.roof, [
      c + 0.2,
      0.18,
      t + 1.1
    ]);
    for (let u = 0; u < Math.ceil(c / 0.65); u++) e.mesh(h, "box", u % 3 ? p.roof : p.roofLight, [
      0.14,
      0.07,
      t + 1.15
    ], [
      -c / 2 + u * 0.65,
      0.13,
      0
    ]);
    e.mesh(h, "box", p.shadow, [
      0.2,
      0.24,
      t + 1.25
    ], [
      i * c / 2,
      -0.05,
      0
    ]);
  }
  e.mesh(a, "box", p.brass, [
    0.24,
    0.23,
    t + 1.4
  ], [
    0,
    n + s + 0.14,
    0
  ]);
  for (const i of [-t / 2 - 0.08, t / 2 + 0.08])
    e.shape(a, [
      [-r / 2, 0],
      [r / 2, 0],
      [0, s]
    ], p.light, [
      0,
      n,
      i
    ], 0.08), e.mesh(a, "box", p.timber, [
      0.15,
      s,
      0.18
    ], [
      0,
      n + s / 2,
      i + 0.12
    ]);
}
function yn(e, a, r, t, n, s = 1.1) {
  e.mesh(a, "box", p.shadow, [
    s,
    1.45,
    0.12
  ], [
    r,
    n,
    t
  ]), e.mesh(a, "box", p.window, [
    s - 0.18,
    1.25,
    0.14
  ], [
    r,
    n,
    t + 0.07
  ]);
  for (const o of [-1, 1])
    e.mesh(a, "box", p.wood, [
      0.13,
      1.6,
      0.2
    ], [
      r + o * s / 2,
      n,
      t + 0.12
    ]), e.mesh(a, "box", p.light, [
      s + 0.28,
      0.14,
      0.26
    ], [
      r,
      n + o * 0.8,
      t + 0.12
    ]);
  e.mesh(a, "box", p.timber, [
    0.07,
    1.3,
    0.16
  ], [
    r,
    n,
    t + 0.16
  ]), e.mesh(a, "box", p.timber, [
    s,
    0.06,
    0.16
  ], [
    r,
    n,
    t + 0.16
  ]);
}
function rd(e, a, r) {
  const { width: t, depth: n } = r.footprint, s = r.kind === "clinic", o = s ? 3.7 : 5;
  e.mesh(a, "box", p.stone, [
    t - 0.3,
    o,
    n - 0.3
  ], [
    0,
    o / 2,
    0
  ]), e.mesh(a, "box", p.light, [
    t - 0.4,
    o - 1,
    n - 0.1
  ], [
    0,
    o / 2 + 0.4,
    0
  ]);
  for (const h of [-t / 2 + 0.15, t / 2 - 0.15]) for (const u of [-n / 2 + 0.15, n / 2 - 0.15]) e.mesh(a, "box", p.timber, [
    0.27,
    o,
    0.27
  ], [
    h,
    o / 2,
    u
  ]);
  for (const h of [0.8, o - 0.25]) e.mesh(a, "box", p.timber, [
    t,
    0.18,
    n
  ], [
    0,
    h,
    0
  ]);
  for (const h of [-t * 0.29, t * 0.29]) yn(e, a, h, n / 2, 2.3, s ? 1.6 : 1.2);
  const l = e.group(a, [
    t / 2,
    0,
    0
  ]);
  l.rotation.y = Math.PI / 2;
  for (const h of [-n * 0.27, n * 0.27]) yn(e, l, h, 0.03, 2.3);
  e.mesh(a, "box", p.shadow, [
    1.9,
    2.65,
    0.13
  ], [
    0,
    1.35,
    n / 2
  ]);
  for (const h of [-1, 1]) e.mesh(a, "box", p.wood, [
    0.85,
    2.5,
    0.12
  ], [
    h * 0.46,
    1.3,
    n / 2 + 0.08
  ]);
  e.mesh(a, "sphere", p.brass, [
    0.07,
    0.07,
    0.05
  ], [
    0.23,
    1.15,
    n / 2 + 0.19
  ]), vi(e, a, t, n, o, s ? 1.15 : 3.2);
  const c = e.group(a, [
    -t * 0.27,
    o,
    -n * 0.18
  ]), i = s ? 2.1 : 3.3;
  if (e.mesh(c, "box", p.stone, [
    1.1,
    i,
    1.2
  ], [
    0,
    i / 2,
    0
  ]), e.mesh(c, "box", p.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    i - 0.2,
    0
  ]), e.mesh(c, "box", p.shadow, [
    0.85,
    0.04,
    0.95
  ], [
    0,
    i - 0.03,
    0
  ]), s) {
    const h = e.group(a, [
      0,
      2.9,
      n / 2 + 1
    ]);
    h.rotation.x = 0.19;
    for (let u = -6; u <= 6; u++) e.mesh(h, "box", u % 3 ? p.cloth : p.light, [
      0.74,
      0.04,
      2.3
    ], [
      u * 0.75,
      0,
      0
    ]);
    for (const u of [-1, 1]) e.mesh(a, "box", p.timber, [
      0.09,
      0.12,
      2.1
    ], [
      u * 4.5,
      2.6,
      n / 2 + 0.95
    ]);
    e.mesh(h, "box", p.rose, [
      1,
      0.014,
      0.65
    ], [
      -2.2,
      0.034,
      0.3
    ]);
    for (let u = -3; u <= 3; u++)
      e.mesh(a, "box", p.timber, [
        0.025,
        0.35,
        0.025
      ], [
        u * 0.45 - 3,
        2.5,
        n / 2 + 0.16
      ]), e.mesh(a, "cone", p.leaf, [
        0.17,
        0.6,
        0.15
      ], [
        u * 0.45 - 3,
        2.05,
        n / 2 + 0.16
      ]);
    for (const u of [-t * 0.29, t * 0.29]) e.mesh(a, "box", p.ember, [
      1.35,
      1.15,
      0.015
    ], [
      u,
      2.3,
      n / 2 + 0.151
    ], !0);
    e.mesh(a, "box", p.slate, [
      0.9,
      1.2,
      0.14
    ], [
      2.8,
      2.8,
      n / 2 + 0.25
    ]), e.mesh(a, "cylinder", p.brass, [
      0.21,
      0.47,
      0.06
    ], [
      2.8,
      2.75,
      n / 2 + 0.36
    ]), e.mesh(a, "box", p.brass, [
      0.18,
      0.16,
      0.1
    ], [
      2.8,
      3.08,
      n / 2 + 0.36
    ]);
  } else
    yn(e, a, 0, n / 2 + 0.09, o + 1, 0.9), e.mesh(a, "box", p.timber, [
      t + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function sd(e, a, r) {
  const t = r.height, n = r.footprint.width, s = r.tint === "amber", o = r.tint === "rose", l = s ? p.amber : o ? p.rose : p.leaf, c = s ? p.amberLight : o ? "#dfb2a1" : p.leafLight, i = e.mesh(a, "cylinder", p.timber, [
    0.24,
    t * 0.67,
    0.28
  ], [
    0,
    t * 0.33,
    0
  ]);
  i.rotation.z = 0.06;
  for (let h = 0; h < 3; h++) {
    const u = e.group(a, [
      0,
      t * 0.39,
      0
    ]);
    u.rotation.set(0.4 * Math.sin(h * 2), 0, (h - 1) * 0.65), e.mesh(u, "cylinder", p.timber, [
      0.095,
      t * 0.32,
      0.095
    ], [
      0,
      t * 0.16,
      0
    ]);
  }
  for (let h = 0; h < 9; h++) {
    const u = h * 2.4, d = h === 8 ? 0.1 : n * 0.56, f = e.mesh(a, "crown", h % 3 ? l : c, [
      n * 0.49 + 0.4,
      t * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(u) * d,
      t * (0.68 + h % 3 * 0.11),
      Math.cos(u) * d
    ]);
    f.rotation.set(h * 0.37, h * 0.61, 0.14), f.receiveShadow = !1;
  }
}
function id(e, a, r) {
  const { width: t, depth: n } = r.footprint, s = r.height;
  e.mesh(a, "box", p.stone, [
    t,
    s,
    n
  ], [
    0,
    s / 2,
    0
  ]);
  for (const o of [
    1,
    s * 0.55,
    s - 0.6
  ]) e.mesh(a, "box", p.light, [
    t + 0.25,
    0.3,
    n + 0.25
  ], [
    0,
    o,
    0
  ]);
  for (const o of [-t / 2 + 0.3, t / 2 - 0.3]) e.mesh(a, "box", p.mortar, [
    0.55,
    s - 1,
    n + 0.15
  ], [
    o,
    s / 2,
    0
  ]);
  for (const o of [s * 0.35, s * 0.7]) yn(e, a, 0, n / 2 + 0.02, o, 0.7);
  vi(e, a, t + 0.35, n + 0.35, s, s * 0.32), e.mesh(a, "cylinder", p.brass, [
    0.055,
    2.7,
    0.055
  ], [
    0,
    s * 1.32 + 1.2,
    0
  ]), e.shape(a, [
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
function od(e, a, r, t, n) {
  const s = t.footprint, o = e.group(a, [
    s.x,
    0,
    s.z
  ]), l = e.group(r, [
    s.x,
    0,
    s.z
  ]);
  switch (t.kind) {
    case "kiln":
    case "hoist":
    case "cliff":
      ur(e, l, t);
      break;
    case "door":
      td(e, l);
      break;
    case "screen":
      cs(e, l, t);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      cs(e, o, t);
      break;
    case "dwelling":
    case "workshop":
      Qc(e, o, l, t);
      break;
    case "stove":
      Yc(e, o);
      break;
    case "medicine":
      Vc(e, o, s.width, s.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      Xc(e, o, t);
      break;
    case "clinic":
    case "storehouse":
      e.mesh(o, "box", p.mortar, [
        s.width,
        0.3,
        s.depth
      ], [
        0,
        0.15,
        0
      ]), rd(e, l, t);
      break;
    case "tree":
      e.mesh(o, "box", p.soil, [
        s.width,
        0.18,
        s.depth
      ], [
        0,
        0.08,
        0
      ]);
      for (let c = 0; c < 7; c++) {
        const i = c * 0.9;
        e.mesh(o, "rock", p.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(i) * s.width * 0.33,
          0.2,
          Math.cos(i) * s.depth * 0.33
        ]);
      }
      sd(e, l, t);
      break;
    case "tower":
      id(e, l, t);
      break;
    case "column": {
      const c = t.height, i = Math.min(s.width, s.depth) * 0.3;
      e.mesh(o, "box", p.mortar, [
        s.width,
        0.35,
        s.depth
      ], [
        0,
        0.17,
        0
      ]), e.mesh(o, "box", p.light, [
        s.width * 0.84,
        0.35,
        s.depth * 0.84
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", p.stone, [
        i,
        c - 1.1,
        i
      ], [
        0,
        c / 2,
        0
      ]);
      for (let h = 0; h < 10; h++) {
        const u = h * Math.PI / 5;
        e.mesh(l, "box", p.light, [
          0.085,
          c - 2,
          0.085
        ], [
          Math.sin(u) * i,
          c / 2,
          Math.cos(u) * i
        ]);
      }
      for (const h of [0.85, c - 0.7]) e.mesh(l, "cylinder", p.brass, [
        i * 1.15,
        0.18,
        i * 1.15
      ], [
        0,
        h,
        0
      ]);
      e.mesh(l, "box", p.light, [
        s.width,
        0.4,
        s.depth
      ], [
        0,
        c - 0.3,
        0
      ]), e.mesh(l, "box", p.slate, [
        s.width * 0.9,
        0.3,
        s.depth * 0.9
      ], [
        0,
        c,
        0
      ]);
      break;
    }
    case "beacon":
      e.mesh(o, "box", p.mortar, [
        s.width,
        0.28,
        s.depth
      ], [
        0,
        0.14,
        0
      ]), e.mesh(o, "cylinder", p.stone, [
        2.5,
        0.5,
        2.5
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", p.slate, [
        1.35,
        3.9,
        1.35
      ], [
        0,
        2.3,
        0
      ]);
      for (const c of [
        1.2,
        3.5,
        4.4
      ]) e.mesh(l, "cylinder", p.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        c,
        0
      ]);
      e.mesh(l, "cylinder", p.shadow, [
        2.2,
        0.5,
        2.2
      ], [
        0,
        4.8,
        0
      ]), e.mesh(l, "torus", p.brass, [
        2.3,
        2.3,
        1.4
      ], [
        0,
        5.1,
        0
      ]).rotation.x = Math.PI / 2;
      for (let c = 0; c < 6; c++) {
        const i = c * Math.PI / 3, h = e.group(l, [
          Math.sin(i) * 2.1,
          4.8,
          Math.cos(i) * 2.1
        ]);
        h.rotation.y = i, e.shape(h, [
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
      ed(e, o, s.width, s.depth);
      for (const c of [0.55, 1.9])
        e.mesh(o, "box", p.timber, [
          s.width - 0.5,
          0.18,
          s.depth - 0.5
        ], [
          0,
          c,
          0
        ]), e.mesh(o, "box", p.cloth, [
          s.width - 0.8,
          0.18,
          s.depth - 0.9
        ], [
          0,
          c + 0.16,
          0
        ]), e.mesh(o, "box", p.light, [
          s.width - 1,
          0.24,
          1.2
        ], [
          0,
          c + 0.28,
          -s.depth / 2 + 1.3
        ]);
      for (const c of [-1, 1]) for (const i of [-1, 1]) e.mesh(o, "box", p.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        c * (s.width / 2 - 0.3),
        1.35,
        i * (s.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const c = t.height, i = s.width * 0.23;
      e.mesh(o, "rock", p.soil, [
        s.width * 0.5,
        0.65,
        s.depth * 0.5
      ], [
        0,
        0.1,
        0
      ]);
      for (let h = 0; h < 5; h++) {
        const u = h * Math.PI * 0.4, d = s.width * 0.25, f = e.group(l, [
          Math.sin(u) * i * 0.45,
          0,
          Math.cos(u) * i * 0.45
        ]);
        f.rotation.y = u;
        const b = e.mesh(f, "cylinder", h % 2 ? p.root : p.rootLight, [
          i * 0.65,
          c * 0.64,
          i * 0.49
        ], [
          0,
          c * 0.3,
          0
        ]);
        b.rotation.z = 0.13;
        const _ = e.group(f, [
          0,
          c * 0.48,
          0
        ]);
        _.rotation.z = 0.4 + h * 0.12, e.mesh(_, "cone", p.root, [
          i * 0.47,
          c * 0.55,
          i * 0.4
        ], [
          0,
          c * 0.25,
          0
        ]);
        const w = e.mesh(f, "cone", p.root, [
          i * 0.5,
          d * 1.4,
          i * 0.4
        ], [
          d * 0.6,
          0.7,
          0
        ]);
        w.rotation.z = -1.15;
      }
      if (c > 8) {
        e.mesh(l, "rock", p.shadow, [
          i * 0.65,
          c * 0.22,
          0.35
        ], [
          0,
          c * 0.38,
          i * 0.65
        ]), e.mesh(l, "rock", p.brass, [
          i * 0.16,
          c * 0.16,
          0.15
        ], [
          0,
          c * 0.4,
          i * 0.68
        ], !0);
        for (let h = 0; h < 7; h++) e.mesh(l, "crown", h % 2 ? p.leaf : p.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(h * 2) * i,
          c * 0.55 + h * 0.4,
          Math.cos(h * 2) * i
        ]);
      }
      break;
    }
    case "bridge":
      e.mesh(o, "box", p.light, [
        s.width,
        0.06,
        s.depth - 2
      ], [
        0,
        -0.01,
        0
      ]);
      for (const c of [-1, 1]) {
        const i = c * (s.depth / 2 - 0.5);
        e.mesh(o, "box", p.stone, [
          s.width,
          0.72,
          1
        ], [
          0,
          0.36,
          i
        ]), e.mesh(o, "box", p.light, [
          s.width,
          0.15,
          1
        ], [
          0,
          0.795,
          i
        ]);
        for (const h of [-s.width / 2 + 0.5, s.width / 2 - 0.5])
          e.mesh(o, "box", p.mortar, [
            0.8,
            1.05,
            1
          ], [
            h,
            0.525,
            i
          ]), e.mesh(o, "box", p.light, [
            1,
            0.13,
            1
          ], [
            h,
            1.115,
            i
          ]);
      }
      break;
    case "arch": {
      const c = t.height;
      e.mesh(l, "arch", p.light, [
        s.width / 2 - 0.4,
        3.1,
        s.depth * 0.65
      ], [
        0,
        c - 3,
        0
      ]), e.mesh(l, "box", p.brass, [
        0.8,
        1.4,
        s.depth * 0.75
      ], [
        0,
        c + 0.2,
        0
      ]);
      for (const i of [-1, 1]) {
        const h = e.group(l, [
          i * (s.width / 2 - 0.5),
          c - 2.2,
          s.depth / 2 - 0.4
        ]);
        e.mesh(h, "box", p.brass, [
          1.5,
          0.08,
          0.1
        ]), e.shape(h, [
          [-0.6, 0],
          [0.6, 0],
          [0.6, -2.5],
          [0, -2.9],
          [-0.6, -2.5]
        ], p.slate, [
          0,
          -0.05,
          0.06
        ]), e.mesh(h, "box", p.cloth, [
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
      if (t.wallUse === "room") {
        ad(e, o, l, t);
        break;
      }
      const c = t.height, i = Math.min(c, 0.65);
      t.wallUse === "homes" && Kc(e, l, s), e.mesh(o, "box", p.mortar, [
        s.width,
        i,
        s.depth
      ], [
        0,
        i / 2,
        0
      ]), c > i && e.mesh(l, "box", n ? p.marble : p.stone, [
        s.width,
        c - i,
        s.depth
      ], [
        0,
        (c + i) / 2,
        0
      ]), e.mesh(l, "box", p.light, [
        s.width + 0.12,
        0.23,
        s.depth + 0.12
      ], [
        0,
        c,
        0
      ]);
      const h = s.width > s.depth, u = Math.max(s.width, s.depth);
      if (n) {
        for (const d of [1.1, c - 0.55]) e.mesh(l, "box", p.light, [
          s.width + 0.15,
          0.22,
          s.depth + 0.15
        ], [
          0,
          d,
          0
        ]);
        for (let d = -u / 2 + 3; d < u / 2 - 1; d += 6) for (const f of [-1, 1]) {
          const b = e.group(l, [
            h ? d : f * (s.width / 2 + 0.04),
            0,
            h ? f * (s.depth / 2 + 0.04) : d
          ]);
          b.rotation.y = h ? f < 0 ? Math.PI : 0 : f * Math.PI / 2;
          const _ = c * 0.61, w = Math.min(2.1, c * 0.3);
          e.mesh(b, "box", p.undercroft, [
            1.5,
            w,
            0.05
          ], [
            0,
            _,
            0
          ]);
          for (const g of [
            -0.55,
            0,
            0.55
          ]) e.mesh(b, "box", p.shadow, [
            0.07,
            w,
            0.06
          ], [
            g,
            _,
            0.06
          ]);
          for (const g of [-1, 1]) e.mesh(b, "box", p.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            _ + g * w / 2,
            0.06
          ]);
          e.mesh(b, "box", p.stone, [
            0.45,
            c - 1,
            0.32
          ], [
            2.2,
            c / 2,
            0
          ]);
        }
        break;
      }
      for (let d = -u / 2 + 1; d < u / 2; d += 3.5) {
        c > 4 && e.mesh(l, "box", p.stone, h ? [
          1.3,
          0.85,
          s.depth
        ] : [
          s.width,
          0.85,
          1.3
        ], [
          h ? d : 0,
          c + 0.55,
          h ? 0 : d
        ]);
        for (let f = 0; f < Math.floor(c / 0.9); f++) e.mesh(l, "box", p.mortar, h ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          h ? d + f % 2 * 0.7 : s.width / 2 + 0.01,
          0.55 + f * 0.85,
          h ? s.depth / 2 + 0.01 : d + f % 2 * 0.7
        ]);
      }
      break;
    }
    case "water":
      e.mesh(o, "box", p.water, [
        s.width,
        0.12,
        s.depth
      ], [
        0,
        -0.18,
        0
      ]);
      for (let c = 0; c < s.width * s.depth / 9; c++) {
        const i = Math.sin(c * 7.3) * (s.width / 2 - 0.8), h = Math.cos(c * 3.7) * (s.depth / 2 - 0.3);
        e.mesh(o, "box", p.ripple, [
          0.4 + c % 4 * 0.3,
          0.012,
          0.04
        ], [
          i,
          -0.11,
          h
        ], !0);
      }
      break;
    case "planter":
      e.mesh(o, "box", p.stone, [
        s.width,
        0.55,
        s.depth
      ], [
        0,
        0.275,
        0
      ]), e.mesh(o, "box", p.soil, [
        s.width - 0.35,
        0.1,
        s.depth - 0.35
      ], [
        0,
        0.57,
        0
      ]);
      for (let c = -s.width / 2 + 0.65; c < s.width / 2; c += 1) for (let i = -s.depth / 2 + 0.6; i < s.depth / 2; i += 0.95) {
        const h = Math.sin(c * 7 + i * 19), u = s.width > 8 ? 0.63 : 0.37;
        e.mesh(o, "crown", h > 0.3 ? p.leafLight : p.leaf, [
          u,
          0.32 + h * 0.1,
          u * 0.9
        ], [
          c + h * 0.15,
          0.81,
          i
        ]), h > 0.5 && e.mesh(o, "rock", h > 0.8 ? p.light : p.rose, [
          0.1,
          0.12,
          0.1
        ], [
          c + 0.1,
          1.13,
          i
        ]);
      }
      break;
    case "thicket":
      e.mesh(o, "box", p.soil, [
        s.width,
        0.2,
        s.depth
      ], [
        0,
        0.07,
        0
      ]);
      for (let c = -s.width / 2 + 0.7; c < s.width / 2; c += 1.3) for (let i = -s.depth / 2 + 0.65; i < s.depth / 2; i += 1.25) {
        const h = Math.sin(c * 13 + i * 7), u = 0.6 + h * 0.2;
        e.mesh(o, "crown", h > 0 ? p.leaf : p.leafLight, [
          0.7,
          u,
          0.7
        ], [
          c,
          u * 0.75,
          i
        ]), h > 0.75 && e.mesh(o, "rock", p.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          c,
          u * 1.65,
          i
        ]);
      }
      break;
    case "wagon":
      e.mesh(o, "box", p.wood, [
        s.width - 1,
        0.35,
        s.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const c of [-1, 1]) {
        for (let i = 0; i < 3; i++) e.mesh(o, "box", p.wood, [
          0.12,
          0.24,
          s.depth - 1
        ], [
          c * (s.width / 2 - 0.5),
          1.4 + i * 0.29,
          0
        ]);
        for (const i of [-s.depth * 0.28, s.depth * 0.28]) {
          if (t.damaged && c < 0 && i > 0) {
            e.mesh(o, "torus", p.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -s.width / 2 + 0.8,
              0.18,
              i
            ]).rotation.x = Math.PI / 2, e.mesh(o, "box", p.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -s.width / 2 + 0.8,
              0.18,
              i
            ]), e.mesh(o, "box", p.wood, [
              0.1,
              0.1,
              1.1
            ], [
              -s.width / 2 + 0.8,
              0.18,
              i
            ]);
            continue;
          }
          e.mesh(o, "torus", p.shadow, [
            0.7,
            0.7,
            0.7
          ], [
            c * (s.width / 2 - 0.2),
            0.76,
            i
          ]).rotation.y = Math.PI / 2;
          for (let h = 0; h < 4; h++) {
            const u = e.mesh(o, "box", p.wood, [
              0.09,
              1.25,
              0.09
            ], [
              c * (s.width / 2 - 0.2),
              0.76,
              i
            ]);
            u.rotation.x = h * Math.PI / 4;
          }
        }
      }
      e.mesh(o, "box", p.cloth, [
        1.4,
        0.8,
        1.8
      ], [
        0,
        1.7,
        -0.8
      ]), e.mesh(o, "cylinder", p.timber, [
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
      for (let c = 0; c < 4; c++) {
        const i = e.group(o, [
          c % 2 * 1.5 - 0.75,
          c === 3 ? 1.3 : 0,
          c < 2 ? -0.7 : 0.7
        ]);
        e.mesh(i, "box", p.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const h of [-1, 1]) e.mesh(i, "box", p.timber, [
          0.1,
          1.25,
          1.3
        ], [
          h * 0.43,
          0.6,
          0
        ]);
        e.mesh(i, "box", p.light, [
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
      e.mesh(o, "box", p.wood, [
        s.width - 0.3,
        0.18,
        s.depth - 0.2
      ], [
        0,
        0.72,
        0
      ]), e.mesh(o, "box", p.wood, [
        0.13,
        0.75,
        s.depth - 0.2
      ], [
        -s.width / 2 + 0.1,
        1.12,
        0
      ]);
      for (const c of [-1, 1]) e.mesh(o, "box", p.shadow, [
        s.width - 0.5,
        0.7,
        0.22
      ], [
        0,
        0.35,
        c * (s.depth / 2 - 0.5)
      ]);
      break;
    case "ruin":
      e.mesh(o, "box", p.stone, [
        s.width,
        0.5,
        s.depth
      ], [
        0,
        0.25,
        0
      ]);
      for (let c = 0; c < 3; c++) {
        const i = -s.width * 0.3 + c * s.width * 0.3, h = (t.height ?? 3) * (1 - c * 0.22), u = s.width * 0.11;
        e.mesh(l, "cylinder", p.stone, [
          u,
          h,
          u
        ], [
          i,
          h / 2 + 0.3,
          -s.depth * 0.2
        ]), e.mesh(l, "box", p.light, [
          u * 2.6,
          0.25,
          u * 2.6
        ], [
          i,
          h + 0.3,
          -s.depth * 0.2
        ]);
        for (let d = 0; d < 6; d++) {
          const f = d * Math.PI / 3;
          e.mesh(l, "box", p.mortar, [
            0.055,
            h * 0.8,
            0.055
          ], [
            i + Math.sin(f) * u,
            h / 2 + 0.3,
            -s.depth * 0.2 + Math.cos(f) * u
          ]);
        }
      }
      e.mesh(o, "rock", p.grassDark, [
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
  return l.children.length > 0;
}
var Vt = 1e-7;
function pr(e, a, r) {
  return (a[0] - e[0]) * (r[1] - e[1]) - (a[1] - e[1]) * (r[0] - e[0]);
}
function ds(e, a, r, t) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const o = e[s], l = e[(s + 1) % e.length], c = pr(a, r, o), i = pr(a, r, l), h = t ? c >= -1e-7 : c <= Vt, u = t ? i >= -1e-7 : i <= Vt;
    if (h && n.push(o), h !== u && Math.abs(c - i) > Vt) {
      const d = c / (c - i);
      n.push([o[0] + (l[0] - o[0]) * d, o[1] + (l[1] - o[1]) * d]);
    }
  }
  return n;
}
function wi(e) {
  return Math.abs(e.reduce((a, r, t) => a + r[0] * e[(t + 1) % e.length][1] - r[1] * e[(t + 1) % e.length][0], 0)) / 2;
}
function ld(e, a) {
  let r = e;
  const t = [];
  for (let n = 0; n < a.length && r.length >= 3; n++) {
    const s = a[n], o = a[(n + 1) % a.length], l = ds(r, s, o, !1);
    wi(l) > Vt && t.push(l), r = ds(r, s, o, !0);
  }
  return t;
}
function cd(e, a, r) {
  const t = a[0] - e[0], n = a[1] - e[1], s = r / (2 * Math.hypot(t, n)), o = -n * s, l = t * s;
  return [
    [e[0] + o, e[1] + l],
    [e[0] - o, e[1] - l],
    [a[0] - o, a[1] - l],
    [a[0] + o, a[1] + l]
  ];
}
function yi(e, a) {
  const r = [];
  for (const t of e) {
    for (let n = 1; n < t.points.length; n++) r.push(cd(t.points[n - 1], t.points[n], t.width + a));
    for (const [n, s] of t.points.slice(1, -1)) r.push(Array.from({ length: 12 }, (o, l) => {
      const c = l * Math.PI / 6, i = (t.width + a) / 2;
      return [n + Math.cos(c) * i, s + Math.sin(c) * i];
    }));
  }
  return r;
}
function dd(e, a = 0) {
  const r = yi(e, a), t = [];
  for (let n = 0; n < r.length; n++) {
    let s = [r[n]];
    for (let o = 0; o < n && s.length; o++) s = s.flatMap((l) => ld(l, r[o]));
    t.push(...s.filter((o) => wi(o) > Vt));
  }
  return t;
}
function hd(e, a, r, t) {
  if (r === "boards") return;
  const n = r === "marble", s = r === "street", o = r === "iron", l = r === "snow";
  for (const [h, u, d] of [[
    l ? 1.1 : 0.4,
    0.025,
    l ? ye.snowCrest : o ? ye.copper : n ? p.brass : s ? p.streetSeam : p.mortar
  ], [
    0,
    0.04,
    l ? ye.snowPath : o ? ye.walkway : n ? p.slate : s ? p.streetStone : p.stone
  ]]) for (const f of dd(a, h)) {
    const b = f.reduce((g, x) => g + x[0], 0) / f.length, _ = f.reduce((g, x) => g + x[1], 0) / f.length, w = e.shape(t(b, _), f.map((g) => [g[0], -g[1]]), d, [
      0,
      u,
      0
    ]);
    w.rotation.x = -Math.PI / 2, w.castShadow = !1;
  }
  if (l) return;
  const c = yi(a, 0.4);
  let i = 0;
  for (const h of a) {
    for (let u = 1; u < h.points.length; u++, i++) {
      const d = h.points[u - 1], f = h.points[u], b = f[0] - d[0], _ = f[1] - d[1], w = Math.hypot(b, _);
      for (let g = 1.5; g < w; g += 1.65) {
        const x = d[0] + b * g / w, k = d[1] + _ * g / w;
        if (c.some((F, y) => y !== i && F.every((A, j) => pr(A, F[(j + 1) % F.length], [x, k]) >= -1e-7))) continue;
        const M = e.mesh(t(x, k), "box", o ? ye.iron : n ? p.shadow : s ? p.streetSeam : p.mortar, [
          h.width - 0.08,
          0.012,
          0.025
        ], [
          x,
          0.049,
          k
        ]);
        if (M.rotation.y = Math.atan2(b, _), M.castShadow = !1, s) {
          const F = e.mesh(t(x, k), "box", p.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            x + Math.cos(g) * 0.55,
            0.049,
            k
          ]);
          F.rotation.y = Math.atan2(b, _), F.castShadow = !1;
        }
      }
    }
    i += h.points.length - 2;
  }
}
function ud(e, a) {
  const r = e.x - e.width / 2, t = r + e.width, n = e.z - e.depth / 2, s = n + e.depth, o = Math.max(r, a.x - a.width / 2), l = Math.min(t, a.x + a.width / 2), c = Math.max(n, a.z - a.depth / 2), i = Math.min(s, a.z + a.depth / 2);
  return o >= l || c >= i ? [e] : [
    [
      r,
      n,
      t,
      c
    ],
    [
      r,
      i,
      t,
      s
    ],
    [
      r,
      c,
      o,
      i
    ],
    [
      l,
      c,
      t,
      i
    ]
  ].filter(([h, u, d, f]) => d > h && f > u).map(([h, u, d, f]) => ({
    x: (h + d) / 2,
    z: (u + f) / 2,
    width: d - h,
    depth: f - u
  }));
}
function Jn(e, a, r) {
  const t = r[0] - a[0], n = r[1] - a[1], s = Math.max(0, Math.min(1, ((e.x - a[0]) * t + (e.y - a[1]) * n) / (t * t + n * n)));
  return Math.hypot(e.x - a[0] - t * s, e.y - a[1] - n * s);
}
function pd(e, a, r) {
  const t = [], n = /* @__PURE__ */ new Map(), s = [], o = new ao(), l = new ua(), c = new Wi(), i = [];
  function h(y, A) {
    const j = `${Math.floor(y / 16)}:${Math.floor(A / 16)}`;
    let z = n.get(j);
    return z || (z = e.group(a), n.set(j, z)), z;
  }
  let u = [r.bounds];
  for (const y of r.features.filter((A) => A.kind === "water")) u = u.flatMap((A) => ud(A, y.footprint));
  const d = r.surface === "grass", f = r.surface === "marble", b = r.surface === "street", _ = r.surface === "boards", w = r.surface === "snow", g = r.surface === "iron" ? ye.deck : w ? ye.snow : _ ? p.wood : d ? p.grass : b ? p.street : r.surface === "wet" ? p.wetStone : f ? p.marble : p.stone;
  for (const y of u)
    if (e.mesh(h(y.x, y.z), "box", g, [
      y.width,
      0.6,
      y.depth
    ], [
      y.x,
      -0.32,
      y.z
    ]).castShadow = !1, _) for (let A = y.x - y.width / 2; A < y.x + y.width / 2; A += 1) for (let j = y.z - y.depth / 2; j < y.z + y.depth / 2; j += 4) {
      const z = Math.min(4, y.z + y.depth / 2 - j);
      e.mesh(h(A, j), "box", ls[Math.abs(A + j) % ls.length], [
        0.985,
        0.018,
        z - 0.025
      ], [
        A + 0.5,
        -9e-3,
        j + z / 2
      ]).castShadow = !1;
    }
    else if (!d && !b && !w) for (let A = y.x - y.width / 2; A < y.x + y.width / 2; A += 4) for (let j = y.z - y.depth / 2; j < y.z + y.depth / 2; j += 4) {
      const z = Math.min(4, y.x + y.width / 2 - A), P = Math.min(4, y.z + y.depth / 2 - j), C = f ? Math.round(A / 4 + j / 4) % 2 ? p.marble : p.marbleLight : g;
      e.mesh(h(A, j), "box", C, [
        z - 0.04,
        0.018,
        P - 0.04
      ], [
        A + z / 2,
        -9e-3,
        j + P / 2
      ]).castShadow = !1;
    }
  if (r.vista !== "room" && hd(e, r.roads, r.surface, h), w) for (let y = 0; y < 70; y++) {
    const A = r.bounds.x + Math.sin(y * 31.7) * (r.bounds.width / 2 - 4), j = r.bounds.z + Math.cos(y * 19.3) * (r.bounds.depth / 2 - 5), z = {
      x: A,
      y: j
    };
    if (r.features.some((C) => gn(z, C.footprint)) || r.roads.some((C) => C.points.slice(1).some((S, $) => Jn(z, C.points[$], S) < C.width / 2 + 1.5))) continue;
    const P = e.mesh(h(A, j), "rock", y % 3 ? ye.snowCrest : ye.ice, [
      1.2 + y % 3,
      0.06 + y % 2 * 0.03,
      0.3 + y % 4 * 0.1
    ], [
      A,
      0.025,
      j
    ]);
    P.rotation.y = -0.35, P.castShadow = !1;
  }
  if (b) for (let y = 0; y < 320; y++) {
    const A = r.bounds.x + Math.sin(y * 127.13) * (r.bounds.width / 2 - 3), j = r.bounds.z + Math.cos(y * 53.71) * (r.bounds.depth / 2 - 3), z = {
      x: A,
      y: j
    };
    if (r.features.some((S) => gn(z, S.footprint))) continue;
    const P = Math.min(...r.roads.flatMap((S) => S.points.slice(1).map(($, I) => Jn(z, S.points[I], $))));
    if (P < 2 || P > 9) continue;
    const C = e.mesh(h(A, j), "box", y % 3 ? p.streetSeam : p.streetStone, [
      0.4 + y % 3 * 0.18,
      0.025,
      0.25
    ], [
      A,
      -2e-3,
      j
    ]);
    C.rotation.y = y * 0.41, C.castShadow = !1;
  }
  if (f) {
    const y = h(0, -17);
    for (const A of [
      4,
      4.4,
      5.5
    ]) e.ring(y, p.brass, A, 0, -17, 1, !1, 0.09);
    for (let A = 0; A < 12; A++) {
      const j = A * Math.PI / 6;
      e.shape(y, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], p.brass, [
        Math.sin(j) * 4.6,
        0.095,
        -17 + Math.cos(j) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, j);
    }
  }
  for (const y of r.suspended ?? []) {
    const A = e.group(a);
    Jc(e, A, y), t.push(e.bake(A)), s.push({
      root: A,
      bounds: new _n().setFromObject(A).expandByScalar(0.1)
    });
  }
  const { bounds: x } = r;
  for (let y = 0; y < (d ? 420 : 0); y++) {
    const A = x.x + Math.sin(y * 127.13) * (x.width / 2 - 3), j = x.z + Math.cos(y * 53.71) * (x.depth / 2 - 3), z = {
      x: A,
      y: j
    };
    if (r.features.some((C) => gn(z, {
      ...C.footprint,
      width: C.footprint.width + 1.5,
      depth: C.footprint.depth + 1.5
    })) || r.roads.some((C) => C.points.slice(1).some((S, $) => Jn(z, C.points[$], S) < C.width / 2 + 1))) continue;
    const P = h(A, j);
    if (y % 4 === 0) {
      const C = Array.from({ length: 9 }, ($, I) => {
        const H = I * Math.PI * 2 / 9, W = 1 + Math.sin(I * 7 + y) * 0.3;
        return [Math.cos(H) * W * (1.2 + y % 3), Math.sin(H) * W * (0.7 + y % 2)];
      }), S = e.shape(P, C, y % 8 ? p.grassDark : p.grassLight, [
        A,
        5e-3,
        j
      ]);
      S.rotation.x = -Math.PI / 2;
    } else {
      for (let C = 0; C < 3; C++) {
        const S = e.mesh(P, "cone", y % 3 ? p.grassDark : p.leafLight, [
          0.035,
          0.3 + C * 0.09,
          0.035
        ], [
          A + (C - 1) * 0.16,
          0.15,
          j
        ]);
        S.rotation.z = (C - 1) * 0.35;
      }
      y % 11 === 0 && e.mesh(P, "rock", p.light, [
        0.12,
        0.13,
        0.12
      ], [
        A,
        0.38,
        j
      ]);
    }
  }
  for (const y of r.features) {
    const A = y.footprint, j = A.width > A.depth, z = Math.max(A.width, A.depth), P = y.kind === "wall" ? Math.ceil(z / 7) : 1, C = e.group(a);
    C.name = y.id;
    for (let S = 0; S < P; S++) {
      const $ = -z / 2 + (S + 0.5) * z / P, I = P === 1 ? A : {
        ...A,
        x: A.x + (j ? $ : 0),
        z: A.z + (j ? 0 : $),
        width: j ? z / P : A.width,
        depth: j ? A.depth : z / P
      }, H = P === 1 ? C : e.group(C);
      od(e, h(I.x, I.z), H, {
        ...y,
        footprint: I
      }, r.vista === "interior") ? (t.push(e.bake(H)), s.push({
        root: H,
        bounds: new _n().setFromObject(H).expandByScalar(0.35)
      })) : H.removeFromParent();
    }
  }
  for (const y of r.vista === "room" ? [] : r.roads.slice(0, 1)) for (let A = 1; A < y.points.length; A++) {
    const [j, z] = y.points[A];
    if (!(r.vista === "camp" && Math.hypot(j, z - 8) < 13))
      for (const P of [-1, 1]) gi(e, h(j, z), j + P * (y.width / 2 + 0.6), z);
  }
  const k = e.group(a), M = r.vista === "interior" || r.vista === "room", F = r.vista === "snow" || r.vista === "furnace";
  if (e.mesh(k, "box", F ? "#93acbb" : M ? p.undercroft : p.distantGround, [
    300,
    8,
    300
  ], [
    0,
    F ? -25 : -4.65,
    0
  ]).castShadow = !1, F && nd(e, k, r), r.vista === "camp") for (let y = 0; y < 13; y++) {
    const A = -55 - y % 2 * 6, j = -44 + y * 7, z = 7 + y % 3 * 2;
    e.mesh(k, "box", p.distantWall, [
      10,
      z,
      6.5
    ], [
      A,
      z / 2,
      j
    ]);
    const P = e.mesh(k, "box", p.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      A,
      z,
      j
    ]);
    P.rotation.z = -0.16;
    for (let C = -1; C <= 1; C++) e.mesh(k, "box", y % 4 ? p.shadow : p.ember, [
      0.05,
      0.7,
      0.6
    ], [
      A + 5.03,
      z - 1.7,
      j + C * 1.6
    ], y % 4 === 0);
  }
  for (let y = 0; y < (M || F ? 0 : 12); y++) {
    const A = (y % 2 ? 1 : -1) * (x.width / 2 + 15 + y % 3 * 8), j = x.z - 25 + y * 7;
    e.mesh(k, "crown", y % 3 ? p.distantGround : p.distantLeaf, [
      17 + y % 4 * 3,
      6 + y % 3 * 2,
      22
    ], [
      A,
      -3,
      j
    ]);
  }
  for (let y = 0; y < (M || F || r.vista === "garden" ? 0 : 9); y++) {
    const A = (y - 4) * 12, j = x.z - x.depth / 2 - 15 - y % 3 * 6, z = 9 + y % 4 * 3;
    e.mesh(k, "box", p.distantWall, [
      9,
      z,
      9
    ], [
      A,
      z / 2 - 2,
      j
    ]), e.mesh(k, "cone", p.distantRoof, [
      7,
      6,
      7
    ], [
      A,
      z + 1,
      j
    ]);
    for (let P = -1; P <= 1; P++) e.mesh(k, "box", p.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      A + P * 2.2,
      z - 4,
      j + 4.55
    ]);
  }
  if (!M && !F && r.vista !== "garden") {
    const y = x.z - x.depth / 2 - 28;
    e.mesh(k, "cylinder", p.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      y
    ]);
    for (const A of [
      10,
      22,
      33
    ]) e.mesh(k, "cylinder", p.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      A,
      y
    ]);
    for (let A = 0; A < 6; A++) {
      const j = A * Math.PI / 3, z = -17 + Math.sin(j) * 8.8, P = y + Math.cos(j) * 8.8;
      e.mesh(k, "box", p.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        z,
        19,
        P
      ]);
      const C = e.mesh(k, "box", p.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(j) * 9.02,
        26,
        y + Math.cos(j) * 9.02
      ], !0);
      C.rotation.y = j;
    }
    e.mesh(k, "cylinder", p.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      y
    ]), e.mesh(k, "cone", p.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      y
    ]);
  }
  t.push(e.bake(k));
  for (const y of n.values()) t.push(e.bake(y));
  return {
    update(y, A) {
      o.direction.copy(l.set(Math.sin(A), za.height / za.distance, Math.cos(A)).normalize());
      for (const j of s) {
        i.length = 0;
        for (const z of [0.1, 1.6])
          if (o.origin.set(y.x, z, y.y), c.ray.copy(o), o.intersectsBox(j.bounds) && c.intersectObject(j.root, !0, i), i.length) break;
        j.root.visible = i.length === 0;
      }
    },
    dispose() {
      t.forEach((y) => y()), a.clear();
    }
  };
}
function fd(e, a, r, t, n, s) {
  const o = r.create(), l = o.root, c = {
    x: t,
    y: n
  };
  a.add(l), l.position.set(t, 0, n), l.rotation.y = 0.25;
  const i = e.ring(a, "#e8c77b", 0.75, t, n, 0.8);
  let h = 0, u = -1 / 0, d = 0, f = -1;
  return {
    root: l,
    ring: i,
    id: "sanniang",
    position: c,
    seated: s,
    locate(b, _) {
      const w = Math.hypot(c.x - b.position.x, c.y - b.position.y);
      return w && (h += w, u = _), d = b.facing, c.x = b.position.x, c.y = b.position.y, l.position.set(c.x, 0, c.y), i.position.x = c.x, i.position.z = c.y, w > 0;
    },
    update(b, _, w) {
      const g = _ - u < 120, x = Math.hypot(b.x - c.x, b.y - c.y) < 10;
      i.visible = x;
      const k = g ? Math.PI / 2 - d : x ? Math.atan2(b.x - c.x, b.y - c.y) : 0.25, M = Math.atan2(Math.sin(k - l.rotation.y), Math.cos(k - l.rotation.y)), F = f < 0 ? 0 : Math.min(0.12, (_ - f) / 1e3);
      f = _, l.rotation.y += w ? M : M * (1 - Math.exp(-F * 9)), o.pose(_, h, g, w);
    },
    dispose() {
      o.dispose(), i.removeFromParent();
    }
  };
}
function bd(e, a, r, t, n, s, o, l = !0) {
  if (r === "sanniang") return fd(e, a, o(), t, n, l);
  const c = Xt([...s], r), i = e.group(a, [
    t,
    0,
    n
  ]), h = e.group(a), u = r === "laobai", d = r === "kouzi";
  i.rotation.y = -0.35, l && (d || r === "anian") && (i.position.y = -0.3), i.scale.setScalar(u ? 1.24 : d ? 1.06 : r === "anian" ? 1.19 : 1.12);
  const f = u ? "#596a80" : d ? "#53617a" : "#79647d", b = "#615047", _ = "#dfbaa0", w = u ? 0.39 : d ? 0.25 : 0.29, g = u ? 0.31 : 0.23, x = [];
  for (const H of [-1, 1]) {
    const W = e.group(i, [
      H * 0.16,
      0.78,
      H > 0 ? 0.03 : -0.04
    ]);
    W.rotation.x = l && (d || r === "anian") ? -1.15 : H * 0.06, x.push(W), e.mesh(W, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(W, "cylinder", b, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(W, "sphere", b, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(i, "sphere", f, [
    w,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(i, "cylinder", f, [
    g,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(i, "cylinder", b, [
    g + 0.015,
    0.08,
    0.23
  ], [
    0,
    1.01,
    0
  ]), e.mesh(i, "box", "#c6aa72", [
    0.13,
    0.11,
    0.03
  ], [
    0,
    1.01,
    0.244
  ]), e.mesh(i, "cylinder", _, [
    0.095,
    0.2,
    0.1
  ], [
    0,
    1.68,
    0
  ]);
  const k = e.group(i, [
    0,
    1.93,
    0.025
  ]);
  k.rotation.x = -0.025, e.mesh(k, "sphere", _, [
    0.215,
    0.285,
    0.22
  ]);
  const M = d ? "#643d41" : r === "anian" ? "#483b40" : "#30343e";
  e.mesh(k, "sphere", M, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const H of [-1, 1])
    e.mesh(k, "sphere", M, [
      0.045,
      0.17,
      0.095
    ], [
      H * 0.2,
      0.02,
      -0.03
    ]), e.mesh(k, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      H * 0.083,
      0.025,
      0.216
    ]), e.mesh(k, "box", M, [
      0.069,
      0.018,
      0.016
    ], [
      H * 0.086,
      0.093,
      0.219
    ]), e.mesh(k, "sphere", _, [
      0.036,
      0.062,
      0.045
    ], [
      H * 0.212,
      -0.025,
      0
    ]);
  e.mesh(k, "sphere", _, [
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
  for (const H of [-1, 1]) {
    const W = e.group(i, [
      H * w,
      1.48,
      0
    ]);
    W.rotation.z = H * 0.11, W.rotation.x = H > 0 ? -0.4 : -0.1, e.mesh(W, "cylinder", f, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(W, "cylinder", "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(W, "cylinder", _, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(W, "sphere", _, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]);
  }
  if (u) {
    e.mesh(i, "sphere", f, [
      0.34,
      0.35,
      0.2
    ], [
      0,
      1.17,
      0.1
    ]), e.shape(i, [
      [-0.41, 0.34],
      [0.41, 0.34],
      [0.49, -0.58],
      [0.18, -0.7],
      [-0.35, -0.57]
    ], "#627a92", [
      0,
      1.18,
      -0.26
    ], 0.025), e.mesh(i, "box", "#aeb7b6", [
      0.44,
      0.14,
      0.11
    ], [
      0,
      1.62,
      0.19
    ]);
    const H = e.group(i, [
      -0.36,
      1.1,
      0.2
    ]);
    H.rotation.z = -0.18, e.mesh(H, "box", "#7a624b", [
      0.32,
      0.42,
      0.075
    ]), e.mesh(H, "box", "#e4dfcd", [
      0.27,
      0.36,
      0.025
    ], [
      0,
      0,
      0.047
    ]), e.mesh(i, "cylinder", "#e4dfcd", [
      0.13,
      0.25,
      0.14
    ], [
      0.16,
      0.36,
      0.06
    ]);
  } else if (d) {
    if (e.mesh(i, "cylinder", "#b48859", [
      0.18,
      0.17,
      0.17
    ], [
      0,
      1.65,
      0
    ]), e.mesh(i, "box", "#b48859", [
      0.17,
      0.38,
      0.04
    ], [
      0.08,
      1.42,
      0.24
    ]), e.mesh(i, "cylinder", "#74869e", [
      0.025,
      0.48,
      0.025
    ], [
      -0.36,
      0.67,
      0.18
    ]), e.mesh(i, "box", "#74869e", [
      0.13,
      0.11,
      0.055
    ], [
      -0.36,
      0.92,
      0.18
    ]), c && l) {
      i.position.y = 0.5;
      const H = e.mesh(h, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        t,
        0.72,
        n
      ]);
      H.rotation.z = Math.PI / 2;
      for (const W of [-1, 1]) e.mesh(h, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        t + W * 0.8,
        0.35,
        n
      ]);
    }
    e.mesh(i, "box", "#e7dbc4", [
      0.28,
      0.22,
      0.23
    ], [
      0.16,
      0.53,
      0.03
    ]), e.mesh(i, "box", "#6f5540", [
      0.24,
      0.21,
      0.15
    ], [
      -0.3,
      1,
      0.12
    ]), s.has("supplies_secured") && e.mesh(i, "cylinder", "#8caaa7", [
      0.035,
      0.44,
      0.035
    ], [
      -0.32,
      1.11,
      0.22
    ]), e.mesh(i, "box", "#6b5944", [
      0.52,
      0.43,
      0.03
    ], [
      0,
      1.29,
      0.24
    ]);
  } else {
    e.mesh(i, "cone", f, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(k, "sphere", M, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let W = 0; W < 3; W++) {
      const Z = e.mesh(i, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + W * 0.02,
        1.02,
        0.31 + W * 0.023
      ]);
      Z.rotation.z = W * 0.1;
    }
    const H = e.mesh(i, "box", "#d8ba87", [
      0.075,
      0.83,
      0.04
    ], [
      0,
      1.25,
      0.22
    ]);
    H.rotation.z = -0.55, e.mesh(i, "box", b, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const F = e.ring(a, "#e8c77b", 0.75, t, n, 0.8);
  k.removeFromParent(), x.forEach((H) => H.removeFromParent());
  const y = x.map((H) => e.bake(H)), A = e.bake(i), j = e.bake(k), z = e.bake(h);
  i.add(k, ...x);
  const P = i.position.y, C = i.rotation.y, S = {
    x: t,
    y: n
  };
  let $ = -1 / 0, I = 0;
  return {
    root: i,
    ring: F,
    id: r,
    position: S,
    seated: l,
    locate(H, W) {
      const Z = S.x !== H.position.x || S.y !== H.position.y;
      return Z && ($ = W), I = H.facing, S.x = H.position.x, S.y = H.position.y, i.position.x = S.x, i.position.z = S.y, F.position.x = S.x, F.position.z = S.y, Z;
    },
    update(H, W, Z) {
      const X = W - $ < 120, re = Math.hypot(H.x - S.x, H.y - S.y) < 10;
      F.visible = re;
      const Ee = X ? Math.PI / 2 - I : re ? Math.atan2(H.x - S.x, H.y - S.y) : C, We = Math.atan2(Math.sin(Ee - i.rotation.y), Math.cos(Ee - i.rotation.y));
      i.rotation.y += Z ? We : We * 0.16, i.position.y = P + (Z ? 0 : Math.sin(W * 15e-4 + t) * 0.012), k.rotation.y = Z ? 0 : Math.sin(W * 8e-4 + n) * 0.04, l || x.forEach((Fe, Ce) => {
        Fe.rotation.x = Z || !X ? 0 : Math.sin(W * 0.012 + Ce * Math.PI) * 0.45;
      });
    },
    dispose() {
      A(), j(), z(), y.forEach((H) => H()), i.removeFromParent(), h.removeFromParent(), F.removeFromParent();
    }
  };
}
function md(e, a, r, t) {
  const n = e.group(a), s = Object.values(Xe).find((u) => u.scene === r.id);
  let o = t, l = !1, c = [];
  const i = On(r.id).flatMap((u) => {
    const d = fa[u];
    return d.waves[0].filter((f, b) => !s || f.kind !== s.kind || b !== d.waves[0].findIndex((_) => _.kind === s.kind)).map((f) => {
      const b = Fr(e, n, f.kind, In[0]);
      b.bar.removeFromParent();
      const _ = r.anchors[f.anchor];
      return b.root.position.set(_.x, 0, _.y), {
        ...b,
        id: u,
        dispose: e.bake(b.root)
      };
    });
  }), h = () => {
    let u = !1;
    for (const d of i) {
      const f = !l && !jn(d.id, o, c);
      d.root.visible !== f && (d.root.visible = f, u = !0);
    }
    return u;
  };
  return h(), {
    setFacts(u) {
      o = u, h();
    },
    setProgress(u) {
      return c = u, h();
    },
    setEncounterActive(u) {
      l = u, h();
    },
    animate(u) {
      return !1;
    },
    dispose() {
      i.forEach((u) => u.dispose()), n.removeFromParent();
    }
  };
}
function gd(e, a, r, t) {
  const n = Xe[r], s = Fr(e, a, n.kind, In[0]);
  s.bar.removeFromParent();
  const o = e.bake(s.root), l = { ...Rn(r, t) };
  s.root.position.set(l.x, 0, l.y);
  let c = t;
  return {
    id: r,
    root: s.root,
    position: l,
    setFacts(i) {
      c = i;
    },
    update(i, h) {
      const u = Rn(r, c), d = i.x - u.x, f = i.y - u.y, b = Math.hypot(d, f), _ = b <= n.approachRadius, w = _ && !c.has(n.complete) ? 1 : 0, g = u.x + (b ? d / b * w : 0), x = u.y + (b ? f / b * w : 0), k = l.x + l.y + s.root.rotation.y;
      l.x += h ? g - l.x : (g - l.x) * 0.22, l.y += h ? x - l.y : (x - l.y) * 0.22, Math.abs(g - l.x) + Math.abs(x - l.y) < 0.01 && (l.x = g, l.y = x);
      const M = _ ? Math.atan2(d, f) : 0, F = Math.atan2(Math.sin(M - s.root.rotation.y), Math.cos(M - s.root.rotation.y));
      return s.root.rotation.y += h || Math.abs(F) < 5e-3 ? F : F * 0.2, s.root.position.set(l.x, 0, l.y), k !== l.x + l.y + s.root.rotation.y;
    },
    dispose() {
      o(), s.root.removeFromParent();
    }
  };
}
var ae = (e, a, r, t = Math.PI) => ({
  position: {
    x: e,
    y: a
  },
  wait: r,
  facing: t
}), xi = {
  furnace_terrace: [{
    id: "peisu-at-table",
    name: "掌炉官裴肃",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [ae(0, -25, 0, 0)],
    condition: { none: ["furnace_approach_ready"] }
  }, {
    id: "terrace-attendant",
    name: "炉台侍者",
    activity: "keep",
    coat: "cream",
    phase: 0,
    route: [ae(8, -13, 0)]
  }],
  furnace_quarter: [
    {
      id: "bathhouse-water",
      name: "澡堂伙计",
      activity: "water",
      coat: "blue",
      phase: 4,
      route: [
        ae(-10, -8, 8),
        ae(-9, 6, 0),
        ae(-10, 17, 7),
        ae(-9, 6, 0)
      ]
    },
    {
      id: "furnace-mender",
      name: "修衣的住户",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [ae(13, 1, 0)]
    },
    {
      id: "furnace-delivery",
      name: "运料工",
      activity: "deliver",
      coat: "cream",
      phase: 9,
      route: [
        ae(12, 21, 6),
        ae(5, 16, 0),
        ae(6, 0, 0),
        ae(9, -15, 8),
        ae(6, 0, 0),
        ae(5, 16, 0)
      ]
    },
    {
      id: "furnace-handover-worker",
      name: "接管炉组的管工",
      activity: "warm",
      coat: "blue",
      phase: 0,
      route: [ae(-6, -17, 0, Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    },
    {
      id: "furnace-handover-clerk",
      name: "登记住户的办事员",
      activity: "register",
      coat: "cream",
      phase: 2,
      route: [ae(6, -17, 0, -Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    }
  ],
  furnace_antechamber: [{
    id: "furnace-orderly",
    name: "值房看护",
    activity: "dressings",
    coat: "cream",
    phase: 0,
    route: [ae(11, -9, 0)]
  }],
  furnace_heart: [{
    id: "furnace-recovery-worker",
    name: "接手检修的管工",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [ae(6, -32, 0)],
    condition: { all: ["furnace_stilled"] }
  }, {
    id: "furnace-recovery-carrier",
    name: "搬送晶座的工人",
    activity: "deliver",
    coat: "cream",
    phase: 5,
    route: [
      ae(9, 20, 6),
      ae(9, -13, 0),
      ae(9, -28, 8),
      ae(9, -13, 0)
    ],
    condition: { all: ["furnace_stilled"] }
  }],
  camp: [
    {
      id: "mender",
      name: "补衣人",
      activity: "mend",
      coat: "rose",
      phase: 0,
      route: [ae(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [ae(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [ae(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [ae(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        ae(-31, 18, 6, -Math.PI / 2),
        ae(-27, 16, 0),
        ae(-23, 13, 7, Math.PI),
        ae(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        ae(10, 7, 6),
        ae(5, 10, 0),
        ae(-8, 13, 0),
        ae(-18, 14, 8, Math.PI),
        ae(-8, 13, 0),
        ae(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [ae(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: ie.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [ae(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [ae(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [ae(8, 2, 0)]
  }],
  south_street: [
    {
      id: "tea-seller",
      name: "热水铺掌柜",
      activity: "cook",
      coat: "cream",
      phase: 0,
      route: [ae(7, -17, 0, Math.PI / 2)]
    },
    {
      id: "tea-drinker",
      name: "歇脚的街坊",
      activity: "warm",
      coat: "blue",
      phase: 1,
      route: [ae(-7, 19, 0)]
    },
    {
      id: "city-delivery",
      name: "送货的伙计",
      activity: "deliver",
      coat: "rose",
      phase: 6,
      route: [
        ae(11, 23, 7),
        ae(5, 17, 0),
        ae(0, 7, 0),
        ae(0, -5, 5),
        ae(0, 7, 0),
        ae(5, 17, 0)
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
      route: [ae(18, -4, 0)]
    },
    {
      id: "lodging-mender",
      name: "补衣的寄工",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [ae(17, 20, 0)]
    },
    {
      id: "workshop-water",
      name: "领水的寄工",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        ae(-10, 19, 6, -Math.PI / 2),
        ae(-4, 18, 0),
        ae(8, 21, 0),
        ae(14, 20, 7),
        ae(8, 21, 0),
        ae(-4, 18, 0)
      ]
    }
  ],
  workers_lodging: [{
    id: "old-mender",
    name: "补鞋的老寄工",
    activity: "mend",
    coat: "cream",
    phase: 0,
    route: [ae(-7, 7, 0)]
  }]
}, vd = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台",
  register: "核对名册"
}, wd = 0.85;
function hs(e, a) {
  const r = e.route;
  if (r.length === 1) return {
    position: r[0].position,
    facing: r[0].facing,
    walking: !1
  };
  const t = r.map((s, o) => {
    const l = r[(o + 1) % r.length].position;
    return s.wait + Math.hypot(l.x - s.position.x, l.y - s.position.y) / wd;
  });
  let n = (a + e.phase) % t.reduce((s, o) => s + o, 0);
  for (let s = 0; s < r.length; s++) {
    if (n > t[s]) {
      n -= t[s];
      continue;
    }
    const o = r[s], l = r[(s + 1) % r.length].position;
    if (n <= o.wait) return {
      position: o.position,
      facing: o.facing,
      walking: !1
    };
    const c = (n - o.wait) / (t[s] - o.wait);
    return {
      position: {
        x: o.position.x + (l.x - o.position.x) * c,
        y: o.position.y + (l.y - o.position.y) * c
      },
      facing: Math.atan2(l.x - o.position.x, l.y - o.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function yd(e, a) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (a - e) / 1e3));
}
function xd(e, a) {
  e.updateWorldMatrix(!0, !0);
  const r = e.matrixWorld.clone().invert(), t = new xn(), n = [];
  e.traverse((l) => {
    if (!(l instanceof ya)) return;
    const c = (l.geometry.index ? l.geometry.toNonIndexed() : l.geometry.clone()).applyMatrix4(t.multiplyMatrices(r, l.matrixWorld)), i = l.material.color, h = new eo(new Float32Array(c.getAttribute("position").count * 3), 3);
    for (let u = 0; u < h.count; u++) h.setXYZ(u, i.r, i.g, i.b);
    c.setAttribute("color", h), n.push(c);
  });
  const s = As(n);
  if (n.forEach((l) => l.dispose()), !s) throw new Error("expedition_geometry_merge");
  e.clear();
  const o = new ya(s, a);
  return o.receiveShadow = !0, e.add(o), () => {
    s.dispose(), e.clear();
  };
}
function _i(e, a, r, t) {
  const n = e.group(a), s = e.group(n), o = [], l = [], c = {
    blue: p.slate,
    rose: p.rose,
    cream: p.cloth
  }[r.coat], i = r.activity === "mend" || r.activity === "warm" || r.activity === "register", h = "#dfbda7", u = i ? 0.75 : 1.05;
  e.mesh(s, "box", c, [
    0.59,
    0.68,
    0.38
  ], [
    0,
    u,
    0
  ]), e.mesh(s, "crown", h, [
    0.23,
    0.27,
    0.21
  ], [
    0,
    u + 0.61,
    0
  ]), e.mesh(s, "crown", p.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    u + 0.77,
    -0.02
  ]), e.mesh(s, "box", p.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    u - 0.23,
    0
  ]), e.mesh(s, "box", p.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    u + 0.12,
    0.21
  ]);
  for (const f of [-1, 1]) {
    const b = e.group(n, [
      f * 0.36,
      u + 0.22,
      0
    ]);
    o.push(b), e.mesh(b, "box", c, [
      0.17,
      0.44,
      0.19
    ], [
      0,
      -0.2,
      0
    ]), e.mesh(b, "crown", h, [
      0.1,
      0.11,
      0.1
    ], [
      0,
      -0.46,
      0.02
    ]);
    const _ = e.group(n, [
      f * 0.16,
      u - 0.31,
      0
    ]);
    l.push(_), e.mesh(_, "box", p.timber, [
      0.2,
      i ? 0.3 : 0.59,
      0.22
    ], [
      0,
      i ? -0.12 : -0.26,
      i ? 0.2 : 0
    ]), e.mesh(_, "box", p.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      i ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (i && e.mesh(s, "box", p.wood, [
    0.62,
    0.55,
    0.6
  ], [
    0,
    0.275,
    -0.12
  ]), r.activity === "water") for (const f of [-1, 1]) e.mesh(o[f > 0 ? 1 : 0], "box", p.wood, [
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
    u - 0.05,
    0.45
  ]), e.mesh(s, "box", p.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    u - 0.05,
    0.72
  ])) : r.activity === "mend" || r.activity === "dressings" || r.activity === "register" ? (e.mesh(s, "box", p.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    u - 0.22,
    0.36
  ]), r.activity === "register" && e.mesh(s, "box", p.timber, [
    0.025,
    0.025,
    0.26
  ], [
    0.18,
    u - 0.17,
    0.38
  ])) : r.activity === "warm" && e.mesh(s, "box", p.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    u + 0.1,
    0.38
  ]);
  n.traverse((f) => {
    f.castShadow = !1;
  });
  const d = [
    s,
    ...o,
    ...l
  ].map((f) => xd(f, t));
  return {
    root: n,
    body: s,
    arms: o,
    legs: l,
    dispose() {
      d.forEach((f) => f()), n.removeFromParent();
    }
  };
}
function _d(e, a, r) {
  const t = new _r({
    vertexColors: !0,
    roughness: 0.95
  }), n = (xi[r] ?? []).map((c) => ({
    spec: c,
    model: _i(e, a, c, t),
    time: 0
  }));
  let s = null, o = null, l = /* @__PURE__ */ new Set();
  return {
    setFacts(c) {
      l = c;
    },
    animate(c, i, h, u) {
      const d = h ? 0 : yd(s, i);
      s = i;
      let f = n.length > 0 && o !== h;
      o = h;
      for (const b of n) {
        const { spec: _, model: w } = b, g = hs(_, b.time), x = qa(_.condition, l) && Math.hypot(g.position.x - c.x, g.position.y - c.y) < 27 && u(g.position);
        if (w.root.visible !== x && (w.root.visible = x, f = !0), !x) continue;
        b.time += d;
        const k = hs(_, b.time), M = h ? 0 : Math.sin(b.time * (k.walking ? 5.5 : 1.5) + _.phase);
        w.root.position.set(k.position.x, 0, k.position.y), w.root.rotation.y = k.facing, w.body.position.y = k.walking ? Math.abs(M) * 0.035 : 0, w.legs.forEach((F, y) => {
          F.rotation.x = k.walking ? M * 0.35 * (y ? 1 : -1) : 0;
        }), w.arms.forEach((F, y) => {
          F.rotation.x = k.walking ? M * 0.24 * (y ? -1 : 1) : -0.6 + M * 0.13 * (y ? 1 : -1), _.activity === "deliver" && (F.rotation.x = -0.75), _.activity === "warm" && (F.rotation.x = -1.1), _.activity === "cook" && !y && (F.rotation.x = -0.8 + M * 0.3);
        }), f = d > 0 || f;
      }
      return f;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), t.dispose();
    }
  };
}
function kd(e, a, r) {
  const t = new _r({
    vertexColors: !0,
    roughness: 0.9
  }), n = bt.filter((s) => Ne[s].scene === r.id).map((s) => {
    const o = Ne[s], l = r.anchors[o.anchor], c = _i(e, a, {
      coat: o.coat,
      activity: s === "chenhe" ? "mend" : s === "chengtiesheng" ? "repair" : "keep"
    }, t);
    c.root.position.set(l.x, 0, l.y);
    const i = e.group(c.body);
    s === "chengtiesheng" ? (e.mesh(i, "box", p.brass, [
      0.14,
      0.35,
      0.08
    ], [
      0.25,
      0.7,
      0.27
    ]), e.mesh(i, "box", p.timber, [
      0.12,
      0.13,
      0.13
    ], [
      0.25,
      0.96,
      0.27
    ])) : s === "qinzhi" || s === "liangyoufang" ? e.mesh(i, "box", p.cloth, [
      0.37,
      0.04,
      0.29
    ], [
      0,
      0.96,
      0.36
    ]) : s === "wenshoutong" && (e.mesh(i, "box", p.slate, [
      0.56,
      0.45,
      0.36
    ], [
      0,
      0.62,
      0
    ]), e.mesh(i, "cylinder", p.pottery, [
      0.1,
      0.15,
      0.1
    ], [
      0.36,
      0.92,
      0.21
    ]));
    const h = e.bake(i), u = e.ring(c.root, p.brass, 0.72, 0, 0, 0.5, !0);
    let d = 0;
    return {
      id: s,
      root: c.root,
      position: l,
      update(f, b, _) {
        const w = f.x - l.x, g = f.y - l.y, x = Math.hypot(w, g) < 6;
        u.visible = x;
        const k = x ? Math.atan2(w, g) : Math.PI, M = Math.atan2(Math.sin(k - c.root.rotation.y), Math.cos(k - c.root.rotation.y)), F = Math.abs(M) > 5e-3;
        c.root.rotation.y += _ || !F ? M : M * 0.22;
        const y = !_ && Math.hypot(w, g) < 22;
        if (y || d !== 0) {
          d = y ? b : 0;
          const A = y ? Math.sin(b / 1e3 * 1.5) : 0;
          c.body.position.y = A * 0.014, c.arms.forEach((j, z) => {
            j.rotation.x = -0.35 + A * 0.045 * (z ? -1 : 1);
          });
        }
        return y || F;
      },
      dispose() {
        h(), c.dispose();
      }
    };
  });
  return {
    people: n,
    dispose() {
      n.forEach((s) => s.dispose()), t.dispose();
    }
  };
}
function Md(e, a, r, t) {
  const n = e.group(a), s = e.group(a), o = [], l = [];
  function c(i, h) {
    const u = t.has(i) ? 1 : 0;
    l.push({
      fact: i,
      pose: h,
      value: u,
      from: u,
      target: u,
      born: null
    }), h(u);
  }
  if (r.id === "south_street") {
    const i = r.anchors.stroll, h = e.group(n, [
      i.x + 1.3,
      0,
      i.y + 1
    ]);
    for (const u of [-0.7, 0.7]) e.mesh(h, "cylinder", p.timber, [
      0.055,
      1.8,
      0.055
    ], [
      u,
      0.9,
      0
    ]);
    e.mesh(h, "box", p.wood, [
      1.6,
      0.08,
      0.08
    ], [
      0,
      1.6,
      0
    ]);
    for (const [u, d] of [
      p.brass,
      p.rose,
      p.slate
    ].entries()) {
      const f = e.group(h, [
        (u - 1) * 0.65,
        1.6,
        0.1
      ]);
      f.rotation.z = u * 0.7;
      for (const b of [0, Math.PI / 2]) {
        const _ = e.mesh(f, "box", d, [
          0.5,
          0.13,
          0.04
        ], [
          0,
          0,
          0
        ]);
        _.rotation.z = b;
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
    const i = r.id === "deep_waterway", h = r.id === "main_valve", u = r.anchors[i ? "winch" : h ? "valve" : "trial"], d = u.x + 2.8, f = u.y - 0.8, b = e.group(n, [
      d,
      0,
      f
    ]);
    e.mesh(b, "cylinder", p.slate, [
      0.22,
      1.3,
      0.22
    ], [
      0,
      0.65,
      0
    ]);
    const _ = e.group(s, [
      d,
      1.2,
      f + 0.25
    ]);
    e.mesh(_, "torus", p.brass, [
      0.7,
      0.7,
      0.7
    ]);
    for (const g of [0, Math.PI / 2]) {
      const x = e.mesh(_, "box", p.timber, [
        1.2,
        0.085,
        0.08
      ]);
      x.rotation.z = g;
    }
    o.push(e.bake(_));
    const w = i ? "deep_gate_opened" : h ? "heat_restored" : "return_flow_tested";
    if (c(w, (g) => {
      _.rotation.z = g * Math.PI * 1.3;
    }), !i) {
      e.mesh(b, "disc", p.light, [
        0.34,
        0.34,
        1
      ], [
        0,
        2.15,
        0.12
      ]);
      const g = e.group(s, [
        d,
        2.15,
        f + 0.14
      ]);
      e.mesh(g, "box", p.ember, [
        0.035,
        0.25,
        0.025
      ], [
        0,
        0.09,
        0
      ]), o.push(e.bake(g)), c(w, (x) => {
        g.rotation.z = 1.3 - x * 1.8;
      });
    }
  }
  if (r.id === "deep_waterway") {
    const i = r.landscape.gates[0].footprint, h = e.group(s, [
      i.x,
      0,
      i.z
    ]);
    for (const u of [-1, 1]) e.mesh(n, "box", p.stone, [
      0.6,
      6.8,
      1.2
    ], [
      i.x + u * i.width / 2,
      3.4,
      i.z
    ]);
    e.mesh(n, "box", p.stone, [
      i.width + 0.6,
      0.6,
      1.2
    ], [
      i.x,
      6.5,
      i.z
    ]);
    for (let u = -i.width / 2 + 0.4; u < i.width / 2; u += 1) e.mesh(h, "box", p.slate, [
      0.12,
      4.4,
      0.16
    ], [
      u,
      2.2,
      0
    ]);
    for (const u of [0.3, 3.8]) e.mesh(h, "box", p.brass, [
      i.width,
      0.16,
      0.25
    ], [
      0,
      u,
      0
    ]);
    o.push(e.bake(h)), c("deep_gate_opened", (u) => {
      h.position.y = u * 4.5;
    });
  }
  return o.push(e.bake(n)), {
    get animating() {
      return l.some((i) => i.value !== i.target);
    },
    setFacts(i) {
      for (const h of l) {
        const u = i.has(h.fact) ? 1 : 0;
        u !== h.target && (h.from = h.value, h.target = u, h.born = null);
      }
    },
    animate(i, h) {
      let u = !1;
      for (const d of l) {
        if (d.value === d.target) continue;
        d.born ??= i;
        const f = h ? 1 : Math.min(1, (i - d.born) / 1100), b = f * f * (3 - 2 * f);
        d.value = f === 1 ? d.target : d.from + (d.target - d.from) * b, d.pose(d.value), u = !0;
      }
      return u;
    },
    dispose() {
      o.forEach((i) => i()), n.removeFromParent(), s.removeFromParent();
    }
  };
}
function jd(e, a, r) {
  const t = e.group(a);
  let n = "", s = null;
  const o = [
    "division_tested",
    "furnace_cargo_loaded",
    "division_works_started",
    "furnace_stilled",
    "city_rekindled"
  ];
  function l(c) {
    const i = o.map((h) => Number(c.has(h))).join("");
    if (i !== n) {
      if (n = i, s?.(), t.clear(), r.id === "furnace_heart") {
        const h = !c.has("furnace_stilled");
        for (const u of [-1, 1]) {
          const d = u * 23;
          e.mesh(t, "box", ye.soot, [
            2.8,
            0.07,
            51
          ], [
            d,
            0.065,
            -5
          ]), e.mesh(t, "box", h ? ye.ember : ye.iron, [
            1.9,
            0.025,
            50
          ], [
            d,
            0.112,
            -5
          ], h);
          for (let f = -29; f < 21; f += 1.6) e.mesh(t, "box", ye.iron, [
            2.8,
            0.1,
            0.55
          ], [
            d,
            0.19,
            f
          ]);
          for (const f of [-1, 1]) e.mesh(t, "box", ye.copper, [
            0.12,
            0.1,
            51
          ], [
            d + f * 1.4,
            0.17,
            -5
          ]);
        }
        for (const u of [-3.2, 3.2]) e.mesh(t, "box", ye.soot, [
          0.16,
          0.025,
          63
        ], [
          u,
          0.075,
          -3
        ]);
      }
      if (r.id === "old_kiln" || r.id === "furnace_heart") {
        const h = r.id === "old_kiln", u = r.anchors[h ? "trial" : "shutdown"], d = h ? c.has("division_tested") : !c.has("furnace_stilled"), f = e.group(t, [
          u.x + 2.1,
          1.2,
          u.y - 0.7
        ]);
        e.mesh(t, "box", ye.iron, [
          1.8,
          1.1,
          0.8
        ], [
          u.x + 2.1,
          0.55,
          u.y - 0.9
        ]), e.mesh(f, "torus", ye.copper, [
          0.65,
          0.65,
          0.24
        ]), f.rotation.z = d ? -0.7 : 0.7, e.mesh(f, "box", ye.edge, [
          1.1,
          0.08,
          0.09
        ]), e.mesh(f, "box", ye.edge, [
          0.08,
          1.1,
          0.09
        ]);
        const b = r.landscape.features.find((w) => w.kind === "kiln"), _ = b.footprint;
        for (const w of [-1, 1]) e.mesh(t, "box", d ? ye.ember : "#926c61", [
          _.width * 0.14,
          b.height * 0.3,
          0.06
        ], [
          _.x + w * _.width * 0.23,
          b.height * 0.58,
          _.z + _.depth * 0.465
        ], d);
        if (h && c.has("division_tested") && !c.has("furnace_cargo_loaded")) {
          const w = r.landscape.features.find((g) => g.id === "load-platform").footprint;
          e.mesh(t, "cylinder", ye.iron, [
            1.4,
            1.8,
            1.4
          ], [
            w.x,
            2.2,
            w.z
          ]);
          for (const g of [-1, 1]) e.mesh(t, "box", ye.copper, [
            0.08,
            2.3,
            3
          ], [
            w.x + g,
            2,
            w.z
          ]);
        }
      }
      if (r.id === "south_street" && c.has("division_works_started") && !c.has("city_rekindled")) for (let h = 0; h < 3; h++) e.mesh(t, "box", "#a48765", [
        1.2,
        0.8,
        0.8
      ], [
        11 + h * 1.4,
        0.4,
        25
      ]);
      if ((r.id === "camp" || r.id === "furnace_quarter") && c.has("city_rekindled")) {
        const h = r.anchors[r.id === "camp" ? "rest" : "charter"];
        for (const u of [-1, 1]) {
          const d = e.group(t, [
            h.x + u * 3,
            0,
            h.y - 2
          ]);
          e.mesh(d, "cylinder", ye.iron, [
            0.7,
            1.5,
            0.7
          ], [
            0,
            0.75,
            0
          ]), e.mesh(d, "box", ye.ember, [
            0.6,
            0.5,
            0.035
          ], [
            0,
            0.65,
            0.7
          ], !0), e.mesh(d, "cylinder", ye.copper, [
            0.12,
            2.3,
            0.12
          ], [
            0.4,
            1.8,
            -0.1
          ]);
          for (let f = 0; f < 3; f++) e.mesh(d, "box", ye.soot, [
            0.045,
            0.5,
            0.06
          ], [
            (f - 1) * 0.19,
            0.65,
            0.74
          ]);
        }
      }
      s = e.bake(t);
    }
  }
  return {
    setFacts: l,
    dispose() {
      s?.(), t.removeFromParent();
    }
  };
}
function Sd(e, a, r, t, n) {
  const s = pd(e, a, r.landscape), o = e.group(a), l = e.group(a), c = md(e, a, r, t), i = _d(e, l, r.id), h = kd(e, l, r), u = Md(e, a, r, t), d = jd(e, a, r), f = e.group(a);
  for (const A of Zs(r.id)) {
    const j = e.group(f, [
      A.x,
      0.65,
      A.y
    ]);
    j.rotation.y = Math.PI / 2 - A.angle, e.mesh(j, "cylinder", p.brass, [
      0.4,
      1.2,
      0.4
    ], [
      0,
      0,
      -0.6
    ]).rotation.x = Math.PI / 2, e.mesh(j, "torus", p.timber, [
      0.42,
      0.42,
      0.14
    ], [
      0,
      0,
      0
    ]), e.mesh(j, "disc", p.shadow, [
      0.34,
      0.34,
      1
    ]);
  }
  const b = e.bake(f), _ = r.objects.filter((A) => A.kind === "reward" || A.kind === "rest").map((A) => {
    const j = r.anchors[A.anchor], z = e.group(a, [
      j.x,
      0,
      j.y
    ]);
    if (A.kind === "reward") {
      e.mesh(z, "box", p.wood, [
        0.85,
        0.45,
        0.6
      ], [
        0,
        0.225,
        -0.65
      ]);
      for (const P of [-1, 1]) e.mesh(z, "box", p.brass, [
        0.055,
        0.48,
        0.63
      ], [
        P * 0.26,
        0.24,
        -0.65
      ]);
      e.mesh(z, "rock", p.ember, [
        0.15,
        0.3,
        0.15
      ], [
        0,
        0.68,
        -0.65
      ], !0), e.ring(z, p.brass, 0.65, 0, 0, 0.35, !0);
    } else {
      e.mesh(z, "box", p.wood, [
        1.4,
        0.12,
        0.6
      ], [
        0,
        0.5,
        -0.7
      ]);
      for (const P of [-1, 1]) e.mesh(z, "box", p.timber, [
        0.12,
        0.45,
        0.5
      ], [
        P * 0.5,
        0.22,
        -0.7
      ]);
    }
    return z.visible = !1, {
      id: A.id,
      model: z,
      dispose: e.bake(z)
    };
  }), w = [], g = Fn.filter((A) => Xe[A].scene === r.id).map((A) => gd(e, l, A, t));
  let x = -1, k = -1, M = null, F = null;
  function y(A) {
    const j = [...A].sort().join("/");
    if (j === F) return;
    F = j, g.forEach((P) => P.setFacts(A)), M?.(), c.setFacts(A), i.setFacts(A), u.setFacts(A), d.setFacts(A);
    for (const P of Pn(r, A)) {
      const C = P.position;
      if (P.kind === "exit") {
        if (!P.target.doorway) for (const S of [-1, 1]) gi(e, o, C.x + S * 1.7, C.y, 1.5);
        e.mesh(o, "box", p.brass, [
          3,
          0.025,
          0.35
        ], [
          C.x,
          0.12,
          C.y
        ]).castShadow = !1;
      } else if (P.target.kind === "inspect" && P.target.passage === "warning")
        e.mesh(o, "box", p.timber, [
          0.12,
          1.8,
          0.12
        ], [
          C.x,
          0.9,
          C.y
        ]), e.mesh(o, "box", p.wood, [
          1.4,
          0.7,
          0.13
        ], [
          C.x,
          1.6,
          C.y
        ]), e.mesh(o, "box", p.light, [
          0.7,
          0.4,
          0.025
        ], [
          C.x,
          1.6,
          C.y + 0.08
        ]);
      else if (P.target.kind === "inspect" && P.target.passage === "orders") {
        e.mesh(o, "box", p.slate, [
          2.2,
          0.8,
          1.2
        ], [
          C.x,
          0.4,
          C.y - 0.8
        ]);
        const S = e.mesh(o, "box", p.light, [
          1.8,
          0.08,
          0.9
        ], [
          C.x,
          0.85,
          C.y - 0.8
        ]);
        S.rotation.x = 0.2;
        for (let $ = -1; $ <= 1; $++) e.mesh(o, "cylinder", p.brass, [
          0.12,
          0.12,
          0.12
        ], [
          C.x + $ * 0.45,
          0.95,
          C.y - 0.55
        ]);
      }
    }
    if (r.id === "camp") {
      const P = r.landscape.features.find((C) => C.kind === "clinic").footprint;
      if (A.has("heat_restored")) {
        const C = r.landscape.features.find((S) => S.id === "hearth").footprint;
        e.mesh(o, "disc", p.ember, [
          1.2,
          1.2,
          1
        ], [
          C.x,
          0.2,
          C.z + 1.12
        ], !0).rotation.x = -Math.PI / 2;
        for (let S = 0; S < 3; S++) e.mesh(o, "crown", "#f0f5f6", [
          0.24 + S * 0.1,
          0.38,
          0.24
        ], [
          C.x + (S % 2 ? 0.17 : -0.1),
          2.2 + S * 0.5,
          C.z
        ], !0, 0.32 - S * 0.06);
        for (const S of [-1, 1])
          e.mesh(o, "cylinder", p.pottery, [
            0.32,
            0.38,
            0.32
          ], [
            P.x + S * 1.6,
            0.19,
            P.z + P.depth / 2 + 0.6
          ]), e.mesh(o, "disc", "#b5d8e6", [
            0.29,
            0.29,
            1
          ], [
            P.x + S * 1.6,
            0.39,
            P.z + P.depth / 2 + 0.6
          ], !0).rotation.x = -Math.PI / 2;
      }
      if (A.has("clinic_helped")) {
        const C = r.landscape.features.find((S) => S.kind === "bench").footprint;
        for (const S of [-1, 1])
          e.mesh(o, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            C.x,
            0.91,
            C.z + S * 0.65
          ]), e.mesh(o, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            C.x,
            1.024,
            C.z + S * 0.65
          ]);
      }
      if (A.has("receiving_arranged")) for (const C of [-1, 1]) {
        const S = P.x + C * 2.4, $ = P.z + P.depth / 2 - 0.2, I = e.group(o, [
          S,
          0.2,
          $
        ]);
        I.rotation.x = -0.16;
        for (const H of [-1, 1]) e.mesh(I, "cylinder", p.timber, [
          0.055,
          2.9,
          0.055
        ], [
          H * 0.42,
          1.4,
          0
        ]);
        e.mesh(I, "box", A.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const H of [0.7, 2.1]) e.mesh(I, "box", p.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          H,
          0.12
        ]);
      }
      if (A.has("warden_defeated")) {
        const C = r.landscape.features.find((S) => S.kind === "wagon").footprint;
        for (let S = 0; S < 4; S++) {
          const $ = e.group(o, [
            C.x + (S % 2 ? 0.65 : -0.65),
            1.4,
            C.z + (S < 2 ? -0.9 : 0.6)
          ]);
          e.mesh($, "box", p.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const I of [-1, 1]) e.mesh($, "box", p.brass, [
            0.08,
            0.78,
            1.22
          ], [
            I * 0.35,
            0.38,
            0
          ]);
          e.mesh($, "box", p.light, [
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
    for (const P of r.objects) {
      if (P.kind !== "switch") continue;
      const C = r.anchors[P.anchor], S = A.has(P.fact), $ = e.group(o, [
        C.x,
        0,
        C.y
      ]);
      e.mesh($, "box", p.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh($, "box", p.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const I = e.group($, [
        0,
        0.75,
        0
      ]);
      I.rotation.z = S ? 0.65 : -0.65, e.mesh(I, "cylinder", p.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(I, "cylinder", p.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const z = Ta(r, A);
    for (const P of r.landscape.gates) {
      if (r.id === "deep_waterway" && P.id === "deep_gate") continue;
      const C = P.footprint, S = C.width > C.depth, $ = Math.max(C.width, C.depth), I = e.group(o, [
        C.x,
        0,
        C.z
      ]);
      S || (I.rotation.y = Math.PI / 2);
      for (const H of [-1, 1]) e.mesh(I, "box", p.stone, [
        0.35,
        3.2,
        0.7
      ], [
        H * $ / 2,
        1.6,
        0
      ]);
      if (e.mesh(I, "box", p.light, [
        $ + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), z.closedGates.has(P.id)) {
        for (let H = -$ / 2 + 0.2; H < $ / 2; H += 0.4) e.mesh(I, "box", p.shadow, [
          0.065,
          3,
          0.1
        ], [
          H,
          1.5,
          0
        ]);
        for (const H of [0.4, 2.5]) e.mesh(I, "box", p.brass, [
          $,
          0.12,
          0.15
        ], [
          0,
          H,
          0
        ]);
      } else e.mesh(I, "box", p.shadow, [
        $,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const P of r.landscape.features) {
      if (P.kind !== "beacon" || A.has("alarm_silenced")) continue;
      const C = P.footprint, S = e.mesh(o, "cylinder", p.timber, [
        0.045,
        4.8,
        0.045
      ], [
        C.x + 3.3,
        2.7,
        C.z + 2.5
      ]);
      S.rotation.z = -0.32;
      for (let $ = 0; $ < 5; $++) e.mesh(o, "rock", $ % 2 ? p.ember : p.cloth, [
        0.55,
        1.2 + $ % 3 * 0.3,
        0.55
      ], [
        C.x + Math.sin($ * 2) * 0.7,
        5.4 + $ % 3 * 0.3,
        C.z + Math.cos($ * 2) * 0.7
      ], !0);
    }
    M = e.bake(o);
  }
  return y(t), {
    setFacts: y,
    people: w,
    parleyPeople: g,
    storyPeople: h.people,
    get animating() {
      return u.animating;
    },
    setProgress(A, j) {
      let z = c.setProgress(A);
      for (const P of _) {
        const C = j.has(P.id);
        P.model.visible !== C && (P.model.visible = C, z = !0);
      }
      return z;
    },
    setPeople(A, j) {
      let z = !1;
      for (const P of _a) {
        const C = A[P], S = Jt[P].station, $ = Se[S.scene].anchors[S.anchor], I = C.mode === "idle" && (C.scene === "cells" || C.scene === S.scene && Math.hypot(C.position.x - $.x, C.position.y - $.y) < 1);
        let H = w.find((W) => W.id === P);
        H && (C.scene !== r.id || H.seated !== I) && (H.dispose(), w.splice(w.indexOf(H), 1), H = void 0, z = !0), C.scene === r.id && (H || (H = bd(e, l, P, C.position.x, C.position.y, new Set(F?.split("/")), n, I), w.push(H), z = !0), z = H.locate(C, j) || z);
      }
      return z;
    },
    setEncounterActive(A) {
      c.setEncounterActive(A), g.forEach((j) => {
        j.root.visible = !A;
      });
    },
    update: s.update,
    animate(A, j, z, P) {
      let C = !1;
      const S = Math.floor(j / (1e3 / 30));
      if (S !== k) {
        k = S;
        const I = w.find((H) => H.id === "sanniang");
        I && Math.hypot(I.position.x - A.x, I.position.y - A.y) < 22 && P(I.position) ? (I.update(A, j, z), C = !z) : I && (I.ring.visible = !1);
      }
      const $ = Math.floor(j / 80);
      if ($ === x) return C;
      x = $, C = u.animate(j, z) || C, C = c.animate(z) || C, C = i.animate(A, j, z, P) || C;
      for (const I of g) C = I.update(A, z) || C;
      for (const I of h.people) C = I.update(A, j, z) || C;
      for (const I of w)
        I.id !== "sanniang" && (Math.hypot(I.position.x - A.x, I.position.y - A.y) < 22 ? (I.update(A, j, z), C = !z || C) : I.ring.visible = !1);
      return C;
    },
    dispose() {
      d.dispose(), u.dispose(), b(), f.removeFromParent(), _.forEach((A) => {
        A.dispose(), A.model.removeFromParent();
      }), i.dispose(), h.dispose(), w.splice(0).forEach((A) => A.dispose()), g.forEach((A) => A.dispose()), l.removeFromParent(), M?.(), c.dispose(), s.dispose();
    }
  };
}
var Rd = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-stone.webp?v=3ccdfd02e4300f8b",
  import.meta.url
).href, Ad = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-plaster.webp?v=66cf9d7a7de2e698",
  import.meta.url
).href, zd = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-slate.webp?v=cd1d7b4377c151d0",
  import.meta.url
).href, Ed = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-ground.webp?v=8bf9c4c3f63de17d",
  import.meta.url
).href;
function Cd(e, a) {
  const r = new to(), t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  let o = 0, l = !1;
  function c(i, h) {
    o++;
    const u = r.load(i, (d) => {
      if (l) {
        d.dispose();
        return;
      }
      o--, s.delete(i);
      for (const f of h) t.set(f, d);
      e(), a(s.size, o);
    }, void 0, () => {
      l || (o--, n.delete(u), u.dispose(), s.set(i, h), a(s.size, o));
    });
    u.colorSpace = yr, u.wrapS = u.wrapT = Ui, u.anisotropy = 2, n.add(u);
  }
  for (const [i, h] of [
    [Rd, [
      p.stone,
      p.wetStone,
      p.marble,
      p.marbleLight
    ]],
    [Ad, [p.light]],
    [zd, [p.roof, p.roofLight]],
    [Ed, [
      p.grass,
      p.grassLight,
      p.grassDark
    ]]
  ]) c(i, h);
  return {
    maps: t,
    retry() {
      if (!l && o === 0) {
        for (const [i, h] of s) c(i, h);
        a(s.size, o);
      }
    },
    dispose() {
      l = !0, n.forEach((i) => i.dispose()), n.clear(), t.clear(), s.clear();
    }
  };
}
var Pd = (function() {
  var e = "b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q:Odkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklzNbb", a = "b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q:6dkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz:Dbb", r = new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    4,
    1,
    96,
    0,
    0,
    3,
    3,
    2,
    0,
    0,
    5,
    3,
    1,
    0,
    1,
    12,
    1,
    0,
    10,
    22,
    2,
    12,
    0,
    65,
    0,
    65,
    0,
    65,
    0,
    252,
    10,
    0,
    0,
    11,
    7,
    0,
    65,
    0,
    253,
    15,
    26,
    11
  ]), t = new Uint8Array([
    32,
    0,
    65,
    2,
    1,
    106,
    34,
    33,
    3,
    128,
    11,
    4,
    13,
    64,
    6,
    253,
    10,
    7,
    15,
    116,
    127,
    5,
    8,
    12,
    40,
    16,
    19,
    54,
    20,
    9,
    27,
    255,
    113,
    17,
    42,
    67,
    24,
    23,
    146,
    148,
    18,
    14,
    22,
    45,
    70,
    69,
    56,
    114,
    101,
    21,
    25,
    63,
    75,
    136,
    108,
    28,
    118,
    29,
    73,
    115
  ]);
  if (typeof WebAssembly != "object") return { supported: !1 };
  var n = WebAssembly.validate(r) ? l(a) : l(e), s, o = WebAssembly.instantiate(n, {}).then(function(g) {
    s = g.instance, s.exports.__wasm_call_ctors();
  });
  function l(g) {
    for (var x = new Uint8Array(g.length), k = 0; k < g.length; ++k) {
      var M = g.charCodeAt(k);
      x[k] = M > 96 ? M - 97 : M > 64 ? M - 39 : M + 4;
    }
    for (var F = 0, k = 0; k < g.length; ++k) x[F++] = x[k] < 60 ? t[x[k]] : (x[k] - 60) * 64 + x[++k];
    return x.buffer.slice(0, F);
  }
  function c(g, x, k, M, F, y, A) {
    var j = g.exports.sbrk, z = M + 3 & -4, P = j(z * F), C = j(y.length), S = new Uint8Array(g.exports.memory.buffer);
    S.set(y, C);
    var $ = x(P, M, F, C, y.length);
    if ($ == 0 && A && A(P, z, F), k.set(S.subarray(P, P + M * F)), j(P - j(0)), $ != 0) throw new Error("Malformed buffer data: " + $);
  }
  var i = {
    NONE: "",
    OCTAHEDRAL: "meshopt_decodeFilterOct",
    QUATERNION: "meshopt_decodeFilterQuat",
    EXPONENTIAL: "meshopt_decodeFilterExp"
  }, h = {
    ATTRIBUTES: "meshopt_decodeVertexBuffer",
    TRIANGLES: "meshopt_decodeIndexBuffer",
    INDICES: "meshopt_decodeIndexSequence"
  }, u = [], d = 0;
  function f(g) {
    var x = {
      object: new Worker(g),
      pending: 0,
      requests: {}
    };
    return x.object.onmessage = function(k) {
      var M = k.data;
      x.pending -= M.count, x.requests[M.id][M.action](M.value), delete x.requests[M.id];
    }, x;
  }
  function b(g) {
    for (var x = "self.ready = WebAssembly.instantiate(new Uint8Array([" + new Uint8Array(n) + "]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = " + w.name + ";" + c.toString() + w.toString(), k = new Blob([x], { type: "text/javascript" }), M = URL.createObjectURL(k), F = u.length; F < g; ++F) u[F] = f(M);
    for (var F = g; F < u.length; ++F) u[F].object.postMessage({});
    u.length = g, URL.revokeObjectURL(M);
  }
  function _(g, x, k, M, F) {
    for (var y = u[0], A = 1; A < u.length; ++A) u[A].pending < y.pending && (y = u[A]);
    return new Promise(function(j, z) {
      var P = new Uint8Array(k), C = ++d;
      y.pending += g, y.requests[C] = {
        resolve: j,
        reject: z
      }, y.object.postMessage({
        id: C,
        count: g,
        size: x,
        source: P,
        mode: M,
        filter: F
      }, [P.buffer]);
    });
  }
  function w(g) {
    var x = g.data;
    if (!x.id) return self.close();
    self.ready.then(function(k) {
      try {
        var M = new Uint8Array(x.count * x.size);
        c(k, k.exports[x.mode], M, x.count, x.size, x.source, k.exports[x.filter]), self.postMessage({
          id: x.id,
          count: x.count,
          action: "resolve",
          value: M
        }, [M.buffer]);
      } catch (F) {
        self.postMessage({
          id: x.id,
          count: x.count,
          action: "reject",
          value: F
        });
      }
    });
  }
  return {
    ready: o,
    supported: !0,
    useWorkers: function(g) {
      b(g);
    },
    decodeVertexBuffer: function(g, x, k, M, F) {
      c(s, s.exports.meshopt_decodeVertexBuffer, g, x, k, M, s.exports[i[F]]);
    },
    decodeIndexBuffer: function(g, x, k, M) {
      c(s, s.exports.meshopt_decodeIndexBuffer, g, x, k, M);
    },
    decodeIndexSequence: function(g, x, k, M) {
      c(s, s.exports.meshopt_decodeIndexSequence, g, x, k, M);
    },
    decodeGltfBuffer: function(g, x, k, M, F, y) {
      c(s, s.exports[h[F]], g, x, k, M, s.exports[i[y]]);
    },
    decodeGltfBufferAsync: function(g, x, k, M, F) {
      return u.length > 0 ? _(g, x, k, h[M], i[F]) : o.then(function() {
        var y = new Uint8Array(g * x);
        return c(s, s.exports[h[M]], y, g, x, k, s.exports[i[F]]), y;
      });
    }
  };
})(), us = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/characters/sanniang.glb?v=995762a127831c0e",
  import.meta.url
).href;
function ps(e) {
  const a = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  e.scene.traverse((s) => {
    if (s instanceof ya) {
      a.add(s.geometry);
      for (const o of Array.isArray(s.material) ? s.material : [s.material]) {
        r.add(o);
        for (const l of Object.values(o)) l instanceof Di && t.add(l);
      }
      s instanceof js && n.add(s.skeleton);
    }
  }), a.forEach((s) => s.dispose()), r.forEach((s) => s.dispose()), n.forEach((s) => s.dispose()), t.forEach((s) => {
    s.dispose(), s.source.data?.close?.();
  });
}
async function Od(e) {
  const a = await fetch(us, { signal: e });
  if (!a.ok) throw new Error(`expedition_character_load:${a.status}`);
  const r = await a.arrayBuffer();
  e.throwIfAborted();
  const t = await new _o().setMeshoptDecoder(Pd).parseAsync(r, new URL(".", new URL(us, location.href)).href), n = t.animations.find((i) => i.name === "idle"), s = t.animations.find((i) => i.name === "walk"), o = t.scene.getObjectByName("Sanniang")?.userData.stride;
  try {
    if (e.throwIfAborted(), !n || !s || typeof o != "number" || o <= 0) throw new Error("expedition_character_motion_missing");
  } catch (i) {
    throw ps(t), i;
  }
  const l = 1.48, c = o * l;
  return {
    create() {
      const i = new Et(), h = xo(t.scene);
      i.add(h), h.scale.setScalar(l);
      const u = [], d = new ua(), f = new xn(), b = new xn(), _ = /* @__PURE__ */ new Set();
      i.updateMatrixWorld(!0), h.traverse((j) => {
        if (j instanceof ya && (j.castShadow = j.receiveShadow = !0, j.frustumCulled = !1, j instanceof js)) {
          _.add(j.skeleton);
          const z = j.userData.groundContacts;
          for (const P of z) u.push({
            mesh: j,
            index: P[0],
            positions: P.map((C) => new ua().fromBufferAttribute(j.geometry.getAttribute("position"), C))
          });
        }
      });
      function w(j, z, P, C, S) {
        return d.set(P, C, S), j.applyBoneTransform(z, d).applyMatrix4(b), d.y;
      }
      const g = new Vi(h), x = g.clipAction(n), k = g.clipAction(s);
      x.play(), k.play(), k.enabled = !1;
      let M = !1, F = -1, y = 0, A = 0;
      return {
        root: i,
        pose(j, z, P, C) {
          const S = F < 0 ? 0 : Math.min(0.12, Math.max(0, (j - F) / 1e3));
          F = j;
          const $ = Math.max(0, z - y);
          if (y = z, P !== M) {
            M = P;
            const H = M ? k : x, W = M ? x : k;
            H.reset().play(), W.crossFadeTo(H, 0.18, !1);
          }
          if (P && (A = (A + Math.min($ / c, S * 1.8)) % 1), k.timeScale = 0, M && (k.time = C ? 0 : A * s.duration), C) {
            const H = M ? k : x;
            (M ? x : k).stop(), H.stopFading().setEffectiveWeight(1), H.time = 0;
          }
          g.update(C ? 0 : S), h.position.y = 0, i.updateMatrixWorld(!0), f.copy(i.matrixWorld).invert();
          let I = 1 / 0;
          for (const { mesh: H, index: W, positions: Z } of u) {
            b.multiplyMatrices(f, H.matrixWorld);
            const X = w(H, W, 0, 0, 0), re = w(H, W, 1, 0, 0) - X, Ee = w(H, W, 0, 1, 0) - X, We = w(H, W, 0, 0, 1) - X;
            for (const Fe of Z) I = Math.min(I, X + Fe.x * re + Fe.y * Ee + Fe.z * We);
          }
          h.position.y = -I;
        },
        dispose() {
          g.stopAllAction(), g.uncacheRoot(h), _.forEach((j) => j.dispose()), i.removeFromParent();
        }
      };
    },
    dispose() {
      ps(t);
    }
  };
}
function Fd(e, a, r) {
  const t = new Ss({
    antialias: !0,
    alpha: !1,
    powerPreference: r.world ? "default" : "high-performance"
  });
  t.outputColorSpace = yr, t.toneMapping = 7, t.toneMappingExposure = 1, t.setPixelRatio(Math.min(devicePixelRatio || 1, r.world ? 1.4 : 1.8)), t.shadowMap.enabled = !0, t.shadowMap.type = 2, e.append(t.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const s = new Ms(), o = new Rs(-10, 10, 10, -10, 0.1, 180), l = hr();
  s.add(new ks("#effbff", "#74918a", 2));
  const c = new er("#fff4e5", 1.9);
  c.position.set(-12, 25, 13), c.castShadow = !0;
  const i = r.world ? 1024 : 1536;
  c.shadow.mapSize.set(i, i), Object.assign(c.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), c.shadow.bias = -4e-4, c.shadow.normalBias = 0.035, c.shadow.radius = 3, s.add(c);
  const h = new er("#c3edff", 1.1);
  h.position.set(7, 8, -15), s.add(h);
  const u = new Et(), d = new Et(), f = new Et();
  s.add(u, d, f);
  const b = mi(l, d, r.traveler.gender), _ = Bc(l, f), w = Nc(l, f), g = Zc(n), x = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), M = [], F = matchMedia("(prefers-reduced-motion: reduce)"), y = matchMedia("(max-height:450px) and (min-width:600px)"), A = new ua(), j = new ua();
  let z = null, P = "", C = "", S = "", $ = null, I = null, H = null, W = !1, Z = NaN, X = NaN, re = NaN, Ee = null, We = 0, Fe = 0, Ce = 1, _e = 1, da = !0, Ma = !1, La = !1, at = 0, Na = -1, ve = 0, ke = !1;
  const ja = r.world ? Cd(() => {
    P = "", da = !0, r.invalidate?.();
  }, (fe, $e) => r.artworkStatus?.(fe, $e)) : null, sn = new AbortController();
  let oa = null, Da = !1;
  function It(fe) {
    return Ma || La ? !1 : !fe || fe.people.sanniang.scene !== fe.definition.id || oa ? !0 : (Da || (Da = !0, Od(sn.signal).then(($e) => {
      if (Ma) {
        $e.dispose();
        return;
      }
      oa = $e, da = !0, r.invalidate?.();
    }).catch(($e) => {
      Ma || (La = !0, a($e));
    })), !1);
  }
  function Sa() {
    const fe = e.getBoundingClientRect();
    Ce = Math.max(1, fe.width), _e = Math.max(1, fe.height), t.setSize(Ce, _e, !1), da = !0, ke = !1, r.invalidate?.();
  }
  const tt = new ResizeObserver(Sa);
  tt.observe(e), Sa();
  function on(fe) {
    fe.preventDefault(), La = !0, a(/* @__PURE__ */ new Error("expedition_webgl_context_lost"));
  }
  t.domElement.addEventListener("webglcontextlost", on);
  function ba(fe, $e, la, ma, Qe = !1) {
    if (Math.abs(fe) < 1) return;
    const N = document.createElement("span");
    N.className = Qe ? "exp-damage is-player" : fe < 0 ? "exp-damage is-heal" : "exp-damage", N.textContent = `${fe < 0 ? "+" : ""}${Math.ceil(Math.abs(fe))}`, n.append(N), M.push({
      element: N,
      position: new ua($e, 2, la),
      born: ma
    });
  }
  function mt() {
    for (const fe of x.values())
      d.remove(fe.actor.root), fe.marker.remove();
    x.clear(), M.splice(0).forEach((fe) => fe.element.remove());
  }
  function $t(fe) {
    return ke ? (j.set(fe.x, 1, fe.y).project(o), Math.abs(j.x) < 1.15 && Math.abs(j.y) < 1.15) : !0;
  }
  return {
    draw(fe, $e, la, ma = "battle", Qe = 0, N) {
      if (!It(N)) return;
      const qt = performance.now(), ne = ma === "battle" ? fe : null, Ht = ne?.tick ?? (F.matches ? 0 : Qe * 0.025), gt = (ne?.tick ?? -1) !== Na, Ut = `${$e.weapon}/${$e.outfit}/${la}`;
      if (!N && !da && ma === C && Ut === S && ne === $ && (!gt && ne || !ne && (ma === "between" || F.matches || Qe - at < 40))) return;
      at = Qe;
      const Gt = In[la], Nt = N ? N.definition.id : `${la}:${ne?.boss ?? !1}:${!!ne}`;
      if (Nt !== P) {
        if (b.resetMotion(), k.forEach((ee) => ee.remove()), k.clear(), z?.(), N) {
          const ee = hr(ja?.maps);
          I = Sd(ee, u, N.definition, N.facts, () => oa);
          const se = I;
          z = () => {
            se.dispose(), ee.dispose();
          };
        } else
          I = null, z = $c(l, u, la, ne);
        ke = !1, P = Nt, s.background = new xr(Gt.sky), s.fog = new Bi(Gt.haze, 42, 95);
      } else N && Ee !== N.facts && I?.setFacts(N.facts);
      (!!ne != !!$ || ne && $ && ne.tick < Na) && (b.resetMotion(), mt(), ve = ne?.player.hp ?? 0);
      const Dt = !N && ma !== "battle", Ra = Ce < 600, Wt = Ra || _e < 400, Aa = Ce / _e;
      !!N?.reading !== W && (W = !!N?.reading, ke = !1);
      const vt = N?.definition.landscape.vista === "room", Ia = vt ? Ra ? 20 : Math.max(30, Aa * (_e < 400 ? 19 : 25)) : N ? (Ra ? za.mobileWidth : Math.max(za.minimumWidth, Aa * (_e < 400 ? za.shortSpan : za.tallSpan))) * (N.definition.safe && !ne ? za.settlementScale : 1) : Dt ? Ra ? 13 : 28 : Ra ? 18.5 : Math.max(27, Aa * (_e < 400 ? 14 : 23)), ln = Math.max(0, J.arena - Ia / 2 + 0.5), ga = Dt ? 0 : 1 * Math.PI / 4, Bt = W && !y.matches ? Ia / Aa * 0.22 : 0, wt = W && y.matches ? Ia * 0.23 : 0, yt = (N ? N.location.position.x * (vt ? 0.4 : 1) : ne ? Wt ? ne.player.x * 0.62 : Math.max(-ln, Math.min(ln, ne.player.x * 0.62)) : Ra ? 0 : 5.5) + Math.sin(ga) * Bt + Math.cos(ga) * wt, Zt = (N ? vt ? N.location.position.y * 0.4 - 1 : N.location.position.y - za.lead : ne ? ne.player.y * (Wt ? 0.62 : 0.2) - 0.4 : Ra ? -4.2 : -11.8) + Math.cos(ga) * Bt - Math.sin(ga) * wt;
      N && Math.hypot(Z - N.location.position.x, X - N.location.position.y) > 8 && (ke = !1);
      const nt = Math.abs(A.x - yt) + Math.abs(A.z - Zt) < 0.015, qn = N && I?.setPeople(N.people, Qe), Qt = N && I?.setProgress(N.completedSegments, N.objects), ea = N && I?.animate(N.location.position, Qe, F.matches, $t);
      if (N && !da && ke && nt && Ut === S && ne === $ && !gt && Z === N.location.position.x && X === N.location.position.y && re === N.location.facing && Ee === N.facts && !ea && !qn && !Qt && !b.animating) return;
      !ke || F.matches ? (A.set(yt, 0, Zt), ke = !0) : (A.x += (yt - A.x) * 0.14, A.z += (Zt - A.z) * 0.14), o.left = -Ia / 2, o.right = Ia / 2, o.top = Ia / Aa / 2, o.bottom = -o.top;
      const cn = N ? za.distance : 25;
      if (o.position.set(A.x + Math.sin(ga) * cn, N ? za.height : 28, A.z + Math.cos(ga) * cn), o.lookAt(A.x, 0, A.z), o.updateProjectionMatrix(), o.updateMatrixWorld(), N && (I?.setEncounterActive(!!ne), I?.update(N.location.position, ga)), k.forEach((ee) => {
        ee.hidden = !0;
      }), N && !ne) for (const ee of N.definition.objects) {
        if (ee.kind !== "reward" || !N.objects.has(ee.id)) continue;
        const se = `reward/${ee.id}`, Te = N.definition.anchors[ee.anchor];
        let Le = k.get(se);
        Le || (Le = document.createElement("span"), Le.className = "exp-person-name", Le.textContent = `◇ ${ha.cache}`, n.append(Le), k.set(se, Le)), j.set(Te.x, 1.4, Te.y).project(o);
        const xt = Math.max(65, Math.min(Ce - 65, (j.x * 0.5 + 0.5) * Ce)), _t = Math.max(105, Math.min(_e - 145, (-j.y * 0.5 + 0.5) * _e));
        Le.hidden = !1, Le.style.transform = `translate(${xt}px,${_t}px) translate(-50%,-100%)`;
      }
      const aa = new Set(N && !ne ? [
        ...Tn(N.definition, N.location.position, N.facts, N.people),
        ...rn(N.definition.id, N.location.position, N.facts),
        ...Ft(N.definition, N.location, N.facts).filter((ee) => ee.kind === "object" && ee.target.kind === "resident")
      ].map((ee) => ee.target.id) : []);
      for (const ee of [
        ...I?.people ?? [],
        ...I?.parleyPeople ?? [],
        ...I?.storyPeople ?? []
      ]) {
        if (ne || !N || Math.hypot(ee.position.x - N.location.position.x, ee.position.y - N.location.position.y) > 10) continue;
        let se = k.get(ee.id);
        se || (se = document.createElement("span"), se.className = "exp-person-name", se.textContent = Ze(ee.id), n.append(se), k.set(ee.id, se)), se.textContent = aa.has(ee.id) ? `${Ze(ee.id)} · ${ie.actions.talk}` : Ze(ee.id), j.set(ee.position.x, 2.9 + ee.root.position.y, ee.position.y).project(o);
        const Te = (j.x * 0.5 + 0.5) * Ce, Le = (-j.y * 0.5 + 0.5) * _e;
        se.hidden = Te < 30 || Te > Ce - 30 || Le < 20 || Le > _e - 20, se.style.transform = `translate(${Te}px,${Le}px) translate(-50%,-100%)`;
      }
      r.world && (c.position.set(A.x - 12, 25, A.z + 13), c.target.position.set(A.x, 0, A.z), c.target.updateMatrixWorld());
      const Hn = N ? {
        ...N.location.position,
        facing: N.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      b.update(ne?.player ?? Hn, $e.weapon, $e.outfit, Ht, Qe / 1e3, F.matches, Dt, !!ne?.effects.some((ee) => ee.kind === "resonance"));
      for (const ee of ne?.enemies ?? []) {
        let se = x.get(ee.id);
        if (!se) {
          const Ie = document.createElement("i");
          Ie.className = Oe(ee.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Ie), se = {
            actor: Fr(l, d, ee.kind, Gt),
            hp: ee.hp,
            death: null,
            marker: Ie
          }, x.set(ee.id, se);
        }
        se.hp > ee.hp && gt && ba(se.hp - ee.hp, ee.x, ee.y, ne.tick), se.hp = ee.hp, se.actor.update(ee, ne.tick, F.matches, !!N), se.actor.bar.quaternion.copy(o.quaternion), j.set(ee.x, 1.2, ee.y).project(o);
        const Te = (j.x * 0.5 + 0.5) * Ce, Le = (-j.y * 0.5 + 0.5) * _e, xt = Math.min(18, Ce / 2), _t = Math.min(Ra ? 132 : 95, _e * 0.3), U = Math.max(_t, _e - Math.min(130, _e * 0.3)), G = Math.max(xt, Math.min(Ce - xt, Te)), q = Math.max(_t, Math.min(U, Le));
        se.marker.hidden = Math.abs(Te - G) + Math.abs(Le - q) < 10, se.marker.style.transform = `translate(${G}px,${q}px) rotate(${Math.atan2(Le - q, Te - G) + Math.PI / 2}rad)`;
      }
      for (const [ee, se] of x) {
        if (ne?.enemies.some((Le) => Le.id === ee)) continue;
        se.death === null && (se.death = ne?.tick ?? 0, ne && se.hp > 0 && ba(se.hp, se.actor.root.position.x, se.actor.root.position.z, ne.tick));
        const Te = ((ne?.tick ?? 0) - se.death) / 12;
        se.actor.bar.visible = !1, se.marker.hidden = !0, se.actor.root.scale.setScalar(Math.max(0, 1 - Te)), (Te >= 1 || !ne || F.matches) && (d.remove(se.actor.root), se.marker.remove(), x.delete(ee));
      }
      ne && gt && (ve !== ne.player.hp && ba(ve - ne.player.hp, ne.player.x, ne.player.y, ne.tick, ve > ne.player.hp), ve = ne.player.hp);
      const dn = N && (N.engagement ?? Ks(N.definition.id, N.facts, N.completedSegments));
      _.update(ne, F.matches, dn ? fa[dn].bounds : void 0);
      const hn = ne?.effects.filter((ee) => ee.kind === "ward-hit").at(-1);
      w.update(ne?.player ?? null, hn ? Math.max(0, (hn.life - 5) / 10) : 0), g.update(ne, o, Ce, _e);
      for (let ee = M.length - 1; ee >= 0; ee--) {
        const se = M[ee], Te = ((ne?.tick ?? 0) - se.born) / 27;
        if (Te >= 1 || !ne) {
          se.element.remove(), M.splice(ee, 1);
          continue;
        }
        j.copy(se.position), j.y += F.matches ? 0 : Te * 0.9, j.project(o), se.element.style.transform = `translate(${(j.x * 0.5 + 0.5) * Ce}px,${(-j.y * 0.5 + 0.5) * _e}px)`, se.element.style.opacity = String(Math.min(1, (1 - Te) * 3));
      }
      t.render(s, o), We++, Fe += performance.now() - qt, N && H !== N.definition.id && (H = N.definition.id, r.sceneReady?.(H)), da = !1, C = ma, S = Ut, $ = ne, Na = ne?.tick ?? -1, N && (Z = N.location.position.x, X = N.location.position.y, re = N.location.facing, Ee = N.facts);
    },
    invalidate() {
      da = !0, r.invalidate?.();
    },
    ready: It,
    needsFrame() {
      return I?.animating ?? !1;
    },
    retryArtwork() {
      ja?.retry();
    },
    stats() {
      return {
        draws: We,
        submitMs: Fe,
        calls: t.info.render.calls,
        triangles: t.info.render.triangles,
        geometries: t.info.memory.geometries,
        textures: t.info.memory.textures
      };
    },
    dispose() {
      Ma = !0, tt.disconnect(), t.domElement.removeEventListener("webglcontextlost", on), sn.abort(), mt(), b.dispose(), g.dispose(), w.dispose(), z?.(), oa?.dispose(), ja?.dispose(), c.shadow.dispose(), l.dispose(), s.clear(), t.dispose(), t.forceContextLoss(), t.domElement.remove(), n.remove();
    }
  };
}
function fr(e) {
  if (e.kind === "exit") return `${ie.actions.travel} ${ie.scenes[e.target.to]}`;
  const a = e.target;
  switch (a.kind) {
    case "person":
      return `${ie.actions.talk} · ${ie.people[a.person]}`;
    case "enemy":
      return `${ie.actions.talk} · ${Ze(a.enemy)}`;
    case "resident":
      return `${ie.actions.talk} · ${Ze(a.person)}`;
    case "inspect":
      return ie.passages[a.passage].title;
    case "rest":
      return ie.actions.rest;
    case "reward":
      return ha.cache;
    case "switch":
      return ie.switches[a.fact];
  }
}
var br = (e) => e.kind === "object" && e.target.kind === "inspect" ? Mr(e.target.passage) : null, Td = (e, a) => e.position.x === a.position.x && e.position.y === a.position.y;
function Ld(e, a) {
  const r = (n) => {
    const s = br(n);
    return s !== null && !a.has(s.fact);
  }, t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const s = `${n.position.x}/${n.position.y}`, o = t.get(s) ?? [];
    o.push(n), t.set(s, o);
  }
  for (const n of t.values()) n.sort((s, o) => Number(r(o)) - Number(r(s)));
  return e.map((n) => t.get(`${n.position.x}/${n.position.y}`).shift());
}
function Id(e, a, r, t) {
  const n = e.find((o) => o.target.id === a);
  if (!n) return e[0]?.target.id ?? null;
  const s = br(n);
  if (s && t && !t.has(s.fact) && r.has(s.fact)) {
    const o = e.find((l) => {
      const c = br(l);
      return Td(n, l) && c && !r.has(c.fact);
    });
    if (o) return o.target.id;
  }
  return a;
}
var $d = ["aria-label"], qd = {
  key: 0,
  class: "ember-transition",
  role: "status"
}, Hd = { class: "journey-hud" }, Ud = { class: "journey-heading" }, Gd = { class: "journey-threat" }, Nd = {
  key: 1,
  class: "journey-artwork-issue",
  role: "status"
}, Dd = ["disabled"], Wd = {
  key: 2,
  class: "journey-controls"
}, Bd = ["aria-label"], Zd = {
  key: 0,
  class: "journey-interaction"
}, Qd = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Kd = {
  key: 0,
  class: "journey-resource"
}, Yd = [
  "max",
  "value",
  "aria-label"
], Vd = ["disabled"], Jd = ["disabled"], Xd = {
  key: 3,
  class: "journey-overlay"
}, eh = /* @__PURE__ */ De({
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
  setup(e, { expose: a, emit: r }) {
    const t = e, n = r, s = B(null), o = B(null), l = B({
      x: 0,
      y: 0
    }), c = B(null), i = B({
      failed: 0,
      pending: 0
    }), h = B(!0), u = Q(() => t.battle ? [] : Ld([
      ...rn(t.world.definition.id, t.world.location.position, t.world.facts),
      ...Ft(t.world.definition, t.world.location, t.world.facts).filter((Z) => Z.kind === "exit" || t.world.objects.has(Z.target.id)),
      ...Tn(t.world.definition, t.world.location.position, t.world.facts, t.world.people)
    ], t.world.facts)), d = Q(() => u.value.find((Z) => Z.target.id === c.value) ?? null), f = Q(() => t.weapon === "grimoire" ? oe.contractPower : oe.resource);
    let b = null, _ = null, w = 0, g = 0, x = 0, k = !1, M = !0;
    const F = yo((Z, X) => {
      l.value = {
        x: Z * 26,
        y: X * 26
      }, _?.stick(Z, X);
    }, () => s.value?.focus({ preventScroll: !0 }));
    function y() {
      F.clear(), _?.clear(), x = 0;
    }
    function A() {
      y(), n("pause");
    }
    function j() {
      b?.retryArtwork();
    }
    function z() {
      document.hidden ? (cancelAnimationFrame(w), w = 0, A()) : (b?.invalidate(), P());
    }
    function P() {
      !w && !k && M && (g = 0, w = requestAnimationFrame(W));
    }
    function C() {
      !t.paused && d.value && (y(), n("interact", d.value.target.id));
    }
    function S(Z) {
      (!Z || Z.detail === 0) && _?.dash();
    }
    function $(Z) {
      (!Z || Z.detail === 0) && _?.skill();
    }
    function I(Z, X) {
      Z.button === 0 && _?.[X]();
    }
    function H() {
      const Z = u.value.findIndex((X) => X.target.id === c.value);
      c.value = u.value[(Z + 1) % u.value.length]?.target.id ?? null;
    }
    function W(Z) {
      if (w = 0, k || !M) return;
      !t.paused && !document.hidden && (w = requestAnimationFrame(W));
      const X = g ? Math.min(100, Z - g) : 0;
      if (g = Z, !t.paused && !document.hidden && b?.ready(t.world))
        for (x += X; x >= 1e3 / J.hz && !t.paused; ) {
          x -= 1e3 / J.hz;
          const re = _.frame();
          if (re.skill && !t.battle) {
            C();
            break;
          }
          n("input", re);
        }
      else x = 0;
      if (!document.hidden) try {
        b?.draw(t.battle ?? null, t, 0, "battle", Z, t.world), !w && b?.needsFrame() && (w = requestAnimationFrame(W));
      } catch (re) {
        cancelAnimationFrame(w), w = 0, y(), n("error", re);
      }
    }
    return ue([u, () => t.world.facts], ([Z, X], re) => {
      c.value = Id(Z, c.value, X, re?.[1]);
    }, { immediate: !0 }), ue(() => t.world.definition.id, () => {
      y(), c.value = u.value[0]?.target.id ?? null, s.value?.focus({ preventScroll: !0 });
    }), ue(() => t.paused, (Z) => {
      y(), P(), Z || s.value?.focus({ preventScroll: !0 });
    }), ue(() => [
      t.world.definition,
      t.world.facts,
      t.world.location.position.x,
      t.world.location.position.y,
      t.world.reading,
      t.weapon,
      t.outfit
    ], P), ft(() => {
      try {
        b = Fd(o.value, (Z) => {
          h.value = !1, A(), n("error", Z);
        }, {
          traveler: t.traveler,
          world: !0,
          invalidate: P,
          sceneReady: (Z) => {
            h.value = !1, n("ready", Z);
          },
          artworkStatus: (Z, X) => {
            i.value = {
              failed: Z,
              pending: X
            };
          }
        });
      } catch (Z) {
        n("error", Z);
        return;
      }
      _ = Ic(s.value, A, () => {
      }), document.addEventListener("visibilitychange", z), P(), s.value?.focus({ preventScroll: !0 });
    }), An(() => {
      M = !1, cancelAnimationFrame(w), w = 0, A();
    }), vr(() => {
      M = !0, P();
    }), et(() => {
      k = !0, cancelAnimationFrame(w), y(), _?.dispose(), document.removeEventListener("visibilitychange", z), b?.dispose();
    }), a({
      stats: () => b?.stats(),
      focus: () => s.value?.focus({ preventScroll: !0 })
    }), (Z, X) => (O(), T("section", {
      ref_key: "root",
      ref: s,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? m(oe).controls : m(ie).actions.controls
    }, [
      R("div", {
        ref_key: "canvas",
        ref: o,
        class: "journey-canvas"
      }, null, 512),
      h.value && !e.transitioning ? (O(), T("aside", qd, E(m(ie).transition(m(ie).scenes[e.world.definition.id])), 1)) : K("", !0),
      R("div", Hd, [R("header", Ud, [R("h1", null, E(m(ie).scenes[e.world.definition.id]), 1), Gn(Z.$slots, "status", {}, void 0, !0)]), R("div", Gd, [Gn(Z.$slots, "threat", {}, void 0, !0)])]),
      i.value.failed ? (O(), T("div", Nd, [R("span", null, E(m(ie).artwork.unavailable), 1), R("button", {
        type: "button",
        disabled: i.value.pending > 0,
        onClick: j
      }, E(i.value.pending ? m(ie).artwork.loading : m(ie).artwork.retry), 9, Dd)])) : K("", !0),
      e.paused ? K("", !0) : (O(), T("div", Wd, [
        R("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": m(ie).actions.move,
          onPointerdown: X[0] || (X[0] = $a((...re) => m(F).down && m(F).down(...re), ["prevent"])),
          onPointermove: X[1] || (X[1] = $a((...re) => m(F).move && m(F).move(...re), ["prevent"])),
          onPointerup: X[2] || (X[2] = (...re) => m(F).release && m(F).release(...re)),
          onPointercancel: X[3] || (X[3] = (...re) => m(F).release && m(F).release(...re)),
          onLostpointercapture: X[4] || (X[4] = (...re) => m(F).release && m(F).release(...re)),
          onContextmenu: X[5] || (X[5] = $a(() => {
          }, ["prevent"]))
        }, [R("span", { style: ct({ transform: `translate(${l.value.x}px, ${l.value.y}px)` }) }, null, 4)], 40, Bd),
        d.value ? (O(), T("div", Zd, [R("button", {
          type: "button",
          class: "journey-act",
          onClick: C
        }, [X[9] || (X[9] = R("kbd", null, "E", -1)), He(E(m(fr)(d.value)), 1)]), u.value.length > 1 ? (O(), T("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: H
        }, E(m(ie).actions.next), 1)) : K("", !0)])) : K("", !0),
        e.battle ? (O(), T("div", Qd, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? (O(), T("div", Kd, [
            R("span", null, E(e.battle.player.resonance > 0 ? m(oe).resonanceActive : f.value), 1),
            R("meter", {
              min: "0",
              max: m(Oa).maxPower,
              value: e.battle.player.resource,
              "aria-label": f.value
            }, null, 8, Yd),
            R("small", null, E(e.battle.player.resonance > 0 ? m(oe).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : K("", !0),
          R("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: X[6] || (X[6] = $a((re) => I(re, "dash"), ["prevent"])),
            onClick: S
          }, [
            R("kbd", null, E(m(oe).dashKey), 1),
            He(E(m(oe).dash), 1),
            R("small", null, E(e.battle.player.dash > 0 ? m(oe).secondsLeft(e.battle.player.dash) : m(oe).ready), 1)
          ], 40, Vd),
          R("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: X[7] || (X[7] = $a((re) => I(re, "skill"), ["prevent"])),
            onClick: $
          }, [
            R("kbd", null, E(m(oe).skillKey), 1),
            He(E(m(Ba)[e.weapon].action), 1),
            R("small", null, E(e.battle.player.skill > 0 ? m(oe).secondsLeft(e.battle.player.skill) : m(oe).ready), 1)
          ], 40, Jd)
        ])) : K("", !0)
      ])),
      e.paused && !e.transitioning ? (O(), T("div", Xd, [Gn(Z.$slots, "overlay", {}, () => [R("button", {
        class: "journey-act",
        type: "button",
        onClick: X[8] || (X[8] = (re) => n("resume"))
      }, E(m(ie).actions.resume), 1)], !0)])) : K("", !0)
    ], 8, $d));
  }
}), ah = /* @__PURE__ */ ia(eh, [["__scopeId", "data-v-79edbda2"]]);
function th(e) {
  const a = new Set(e.location.visited.map(pa)), r = new Set(e.facts), t = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const s = pa(n);
    for (const o of Pn(Se[n], r)) {
      if (o.kind !== "exit") continue;
      const l = pa(o.target.to), c = [s, l].sort().join("/");
      s !== l && (a.add(l), t.set(c, {
        id: c,
        from: s,
        to: l
      }));
    }
  }
  return {
    scenes: [...a],
    links: [...t.values()]
  };
}
function ki(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function nh(e, a) {
  const r = ki(a), t = 3 * r, n = [], s = (o) => ({
    x: Math.max(a.x - a.width / 2 + t, Math.min(a.x + a.width / 2 - t, o.x)),
    y: Math.max(a.z - a.depth / 2 + t, Math.min(a.z + a.depth / 2 - t, o.y))
  });
  for (const o of e) {
    let l = s(o), c = -1;
    for (let i = 0; i <= 48; i++) {
      const h = Math.ceil(i / 8) * 5.2 * r, u = i * Math.PI / 4, d = s({
        x: o.x + Math.cos(u) * h,
        y: o.y + Math.sin(u) * h
      }), f = Math.min(1 / 0, ...n.map((b) => Math.hypot(b.x - d.x, b.y - d.y)));
      if (f > c && (l = d, c = f), f >= 5.2 * r) break;
    }
    n.push(l);
  }
  return n;
}
var rh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/city-title.webp?v=e4da13bbd2fcb340",
  import.meta.url
).href, sh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/city-title-mobile.webp?v=b8c01112d5a24eba",
  import.meta.url
).href, ih = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-blade.webp?v=4afc3e9865f141f7",
  import.meta.url
).href, oh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-bow.webp?v=500f7936a56ed7a4",
  import.meta.url
).href, lh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-staff.webp?v=7fa32ff5577395e2",
  import.meta.url
).href, ch = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-daggers.webp?v=86e6748e6d63cd49",
  import.meta.url
).href, dh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-grimoire.webp?v=2a62d36aaf6ec5b8",
  import.meta.url
).href, hh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-cannon.webp?v=37563c460e90f22b",
  import.meta.url
).href, uh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-camp.webp?v=d0b67bb847717255",
  import.meta.url
).href, ph = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-crossroads.webp?v=4664ca9a4a943122",
  import.meta.url
).href, fh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-gate.webp?v=07d03a81ef93c76d",
  import.meta.url
).href, bh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-beacon.webp?v=22bc3649a7c3e783",
  import.meta.url
).href, mh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-waterway.webp?v=1788573c3dccc39a",
  import.meta.url
).href, gh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-cells.webp?v=1be273a4a5d70324",
  import.meta.url
).href, vh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-hall.webp?v=88da060da4622d75",
  import.meta.url
).href, wh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-roots.webp?v=f8fa744bcfa4f844",
  import.meta.url
).href, yh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/cg-arrival.webp?v=d6ab0fad582cb4d8",
  import.meta.url
).href, xh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/cg-ending.webp?v=c67a3c63cc53a73a",
  import.meta.url
).href, _h = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-south-street.webp?v=b3ec5e32bff0b5e8",
  import.meta.url
).href, kh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-workshop-street.webp?v=9e19441f76865b1e",
  import.meta.url
).href, Mh = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-heat-station.webp?v=40ef15f3dabee913",
  import.meta.url
).href, fs = {
  city: rh,
  cityMobile: sh
}, jh = {
  blade: ih,
  bow: oh,
  staff: lh,
  daggers: ch,
  grimoire: dh,
  cannon: hh
}, mr = {
  camp: uh,
  crossroads: ph,
  gate: fh,
  beacon: bh,
  waterway: mh,
  cells: gh,
  hall: vh,
  roots: wh,
  south_street: _h,
  workshop_street: kh,
  heat_station: Mh
}, bs = {
  arrival: yh,
  ending: xh
}, gr = {
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
      main_valve: [40, 4],
      furnace_terrace: [75, 36]
    }
  },
  furnace: {
    label: "雪线与古炉",
    layout: {
      south_street: [17, 95],
      heat_station: [51, 95],
      furnace_terrace: [51, 76],
      snow_road: [29, 63],
      old_kiln: [10, 48],
      return_bridge: [10, 74],
      furnace_quarter: [73, 58],
      furnace_lift: [57, 39],
      furnace_scaffold: [89, 39],
      furnace_antechamber: [73, 20],
      furnace_heart: [73, 3]
    }
  }
}, Mi = (e) => uo(e) ? "furnace" : kr(e) ? "city" : "outskirts", Sh = (e) => Object.keys(gr).filter((a) => a === "outskirts" || e.some((r) => Mi(r) === a)), Rh = { class: "ember-map-header" }, Ah = ["src"], zh = ["aria-pressed"], Eh = ["viewBox", "aria-label"], Ch = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Ph = ["transform"], Oh = ["fill"], Fh = {
  y: "22",
  "text-anchor": "middle"
}, Th = ["viewBox", "aria-label"], Lh = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Ih = ["points", "stroke-width"], $h = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], qh = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Hh = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Uh = [
  "cx",
  "cy",
  "r",
  "fill"
], Gh = ["x", "y"], Nh = {
  key: 2,
  class: "ember-map-regions"
}, Dh = ["aria-pressed", "onClick"], Wh = {
  key: 3,
  class: "ember-map-places"
}, Bh = /* @__PURE__ */ De({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: a }) {
    const r = e, t = a, n = B(!1), s = B(Mi(pa(r.campaign.location.scene))), o = B(null), l = B(!1), c = B(null), i = B({
      width: 400,
      height: 400
    }), h = new ResizeObserver((y) => {
      for (const A of y) {
        const { width: j, height: z } = A.contentRect;
        A.target === o.value ? l.value = j > z * 1.55 : i.value = {
          width: j,
          height: z
        };
      }
    });
    ue(c, (y, A) => {
      A && h.unobserve(A), y && h.observe(y);
    }), ft(() => {
      h.observe(o.value);
    }), et(() => h.disconnect());
    const u = Q(() => th(r.campaign)), d = Q(() => gr[s.value].layout), f = Q(() => Object.fromEntries(u.value.scenes.filter((y) => d.value[y]).map((y) => {
      const [A, j] = d.value[y], { width: z, height: P } = i.value;
      return [y, l.value ? [50 + (104 - j) / 104 * (z - 100), 10 + (A - 10) / 80 * (P - 40)] : [45 + A / 104 * (z - 90), 10 + j / 104 * (P - 40)]];
    }))), b = Q(() => u.value.links.filter((y) => f.value[y.from] && f.value[y.to])), _ = Q(() => Sh(r.campaign.location.visited.map(pa)).map((y) => [y, gr[y]])), w = Q(() => Se[r.campaign.location.scene]), g = Q(() => w.value.landscape.bounds), x = Q(() => ki(g.value)), k = Q(() => `${g.value.x - g.value.width / 2 - 5 * x.value} ${g.value.z - g.value.depth / 2 - 5 * x.value} ${g.value.width + 10 * x.value} ${g.value.depth + 10 * x.value}`), M = Q(() => ri(r.campaign)), F = Q(() => {
      const y = nh(M.value.map((A) => A.position), g.value);
      return M.value.map((A, j) => ({
        ...A,
        marker: y[j]
      }));
    });
    return (y, A) => (O(), T("div", {
      ref_key: "root",
      ref: o,
      class: xa(["ember-map", {
        "ember-map-wide": l.value,
        "ember-map-local": !n.value
      }])
    }, [
      R("div", Rh, [
        m(mr)[w.value.id] ? (O(), T("img", {
          key: 0,
          src: m(mr)[w.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, Ah)) : K("", !0),
        R("h2", null, E(n.value ? m(D).chapterMap : m(ie).scenes[w.value.id]), 1),
        R("div", null, [R("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: A[0] || (A[0] = (j) => n.value = !n.value)
        }, E(n.value ? m(D).localMap : m(D).chapterMap), 9, zh), R("button", {
          type: "button",
          onClick: A[1] || (A[1] = (j) => t("close"))
        }, E(m(D).close), 1)])
      ]),
      n.value ? (O(), T("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${i.value.width} ${i.value.height}`,
        role: "img",
        "aria-label": m(D).chapterMap,
        class: "ember-route-map"
      }, [(O(!0), T(te, null, je(b.value, (j) => (O(), T("line", {
        key: j.id,
        x1: f.value[j.from][0],
        y1: f.value[j.from][1],
        x2: f.value[j.to][0],
        y2: f.value[j.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(j.from) && e.campaign.location.visited.includes(j.to) ? void 0 : "4 4"
      }, null, 8, Ch))), 128)), (O(!0), T(te, null, je(f.value, (j, z) => (O(), T("g", {
        key: z,
        transform: `translate(${j.join(",")})`
      }, [
        R("circle", {
          r: "6",
          fill: z === m(pa)(w.value.id) ? "#bf6242" : e.campaign.location.visited.includes(z) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Oh),
        R("text", Fh, E(e.campaign.location.visited.includes(z) ? m(ie).scenes[z] : m(D).unknownArea), 1),
        R("title", null, E(e.campaign.location.visited.includes(z) ? m(ie).scenes[z] : m(D).unknownArea), 1)
      ], 8, Ph))), 128))], 8, Eh)) : (O(), T("svg", {
        key: 1,
        viewBox: k.value,
        role: "img",
        "aria-label": m(ie).scenes[w.value.id]
      }, [
        R("rect", {
          x: g.value.x - g.value.width / 2,
          y: g.value.z - g.value.depth / 2,
          width: g.value.width,
          height: g.value.depth,
          rx: "2",
          fill: w.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, Lh),
        (O(!0), T(te, null, je(w.value.landscape.roads, (j, z) => (O(), T("polyline", {
          key: z,
          points: j.points.map((P) => P.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": j.width,
          "stroke-linejoin": "round"
        }, null, 8, Ih))), 128)),
        (O(!0), T(te, null, je(w.value.landscape.features, (j) => (O(), T("rect", {
          key: j.id,
          x: j.footprint.x - j.footprint.width / 2,
          y: j.footprint.z - j.footprint.depth / 2,
          width: j.footprint.width,
          height: j.footprint.depth,
          fill: j.kind === "water" ? "#6eb8c6" : j.kind === "tree" || j.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, $h))), 128)),
        R("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * x.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": x.value
        }, [R("title", null, E(m(D).here), 1)], 8, qh),
        (O(!0), T(te, null, je(F.value, (j, z) => (O(), T("g", { key: j.target.id }, [
          R("line", {
            x1: j.position.x,
            y1: j.position.y,
            x2: j.marker.x,
            y2: j.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * x.value
          }, null, 8, Hh),
          R("circle", {
            cx: j.marker.x,
            cy: j.marker.y,
            r: 2.4 * x.value,
            fill: j.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Uh),
          R("text", {
            class: "ember-map-number",
            style: ct({ fontSize: `${3.4 * x.value}px` }),
            x: j.marker.x,
            y: j.marker.y + 1.1 * x.value,
            "text-anchor": "middle"
          }, E(z + 1), 13, Gh),
          R("title", null, E(m(fr)(j)), 1)
        ]))), 128))
      ], 8, Th)),
      n.value ? (O(), T("div", Nh, [(O(!0), T(te, null, je(_.value, ([j, z]) => (O(), T("button", {
        key: j,
        type: "button",
        "aria-pressed": s.value === j,
        onClick: (P) => s.value = j
      }, E(z.label), 9, Dh))), 128))])) : (O(), T("ol", Wh, [(O(!0), T(te, null, je(M.value, (j) => (O(), T("li", { key: j.target.id }, E(m(fr)(j)), 1))), 128))]))
    ], 2));
  }
}), Zh = /* @__PURE__ */ ia(Bh, [["__scopeId", "data-v-73f4e820"]]), Qh = { class: "exp-wardrobe" }, Kh = { class: "exp-fitting-body" }, Yh = { class: "exp-preview-stage" }, Vh = ["aria-label"], Jh = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Xh = { class: "exp-preview-tools" }, eu = ["aria-label"], au = ["disabled"], tu = { class: "exp-outfit-info" }, nu = { class: "exp-muted" }, ru = { class: "exp-fitting-actions" }, su = {
  key: 0,
  class: "exp-muted"
}, iu = ["disabled"], ou = { key: 2 }, lu = { class: "exp-purchase-confirm" }, cu = ["disabled"], du = ["disabled"], hu = ["aria-label"], uu = ["aria-pressed", "onClick"], pu = ["src"], fu = /* @__PURE__ */ De({
  __name: "ExpeditionWardrobe",
  props: {
    data: {},
    traveler: {},
    balance: {},
    blocked: { type: Boolean },
    weapon: {}
  },
  emits: ["command"],
  setup(e, { emit: a }) {
    const r = e, t = a, n = B(r.data.equippedOutfit), s = B(!1), o = B(0), l = B(!1), c = B(null), i = B(null), h = B({}), u = Q(() => Ca[n.value]), d = Q(() => Zn(r.data, n.value)), f = Q(() => ho.find((j) => Xa[j].awardKey === u.value.achievement)), b = Q(() => Ts.filter((j) => Zn(r.data, j) || Ca[j].achievement === null || Object.values(fa).some((z) => z.boss && Xa[z.boss].awardKey === Ca[j].achievement)));
    let _ = null, w = !0, g = 0, x = () => {
    };
    ue([
      n,
      o,
      () => r.weapon
    ], () => {
      w = !0, x(), s.value = !1;
    });
    function k(j) {
      n.value = j, i.value?.scrollTo({ top: 0 });
    }
    function M() {
      g = performance.now() + 1100, w = !0, x();
    }
    function F() {
      s.value = !1, t("command", {
        type: "purchase",
        id: n.value
      });
    }
    function y() {
      w = !0;
      let j;
      try {
        j = new Ss({
          antialias: !0,
          alpha: !1
        });
      } catch {
        l.value = !0;
        return;
      }
      j.outputColorSpace = yr, j.toneMapping = 7, j.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const z = new Ms(), P = hr(), C = new Et(), S = mi(P, C, r.traveler.gender);
      z.background = new xr("#d1e0e1"), z.add(C, new ks("#fff6e3", "#627c93", 2.7));
      const $ = new er("#fff6e0", 3);
      $.position.set(-3, 5, 6), z.add($);
      const I = new Rs(-2.35, 2.35, 2.35, -2.35, 0.1, 30), H = new _n();
      function W(ve) {
        S.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, ve, 0, 0, !0, !1), S.root.position.set(0, 0.1, 0), S.root.rotation.y = -0.2, S.root.scale.setScalar(1.35);
      }
      for (const ve of b.value)
        W(ve), H.union(new _n().setFromObject(C));
      const Z = H.getSize(new ua()), X = H.getCenter(new ua()), re = Z.y * 0.5 + Z.z * 0.1 + 0.2, Ee = Math.hypot(Z.x, Z.z) * 0.5 + 0.2;
      I.position.set(0, X.y + 0.8, 7), I.lookAt(0, X.y, 0);
      function We(ve) {
        const ke = Math.max(re, Ee / ve);
        I.left = -ke * ve, I.right = -I.left, I.top = ke, I.bottom = -ke, I.updateProjectionMatrix();
      }
      We(1), j.setSize(144, 144, !1);
      try {
        for (const ve of b.value)
          W(ve), j.render(z, I), h.value[ve] = j.domElement.toDataURL("image/png");
      } catch {
        l.value = !0, S.dispose(), P.dispose(), z.clear(), j.dispose(), j.forceContextLoss();
        return;
      }
      c.value.append(j.domElement);
      let Fe = 0, Ce = 1, _e = 1;
      const da = new ResizeObserver(() => {
        const ve = c.value.getBoundingClientRect();
        Ce = Math.max(1, ve.width), _e = Math.max(1, ve.height), j.setSize(Ce, _e, !1), We(Ce / _e), w = !0, x();
      });
      da.observe(c.value);
      const Ma = matchMedia("(prefers-reduced-motion: reduce)");
      function La(ve) {
        ve.preventDefault(), l.value = !0, cancelAnimationFrame(Fe), Fe = 0;
      }
      j.domElement.addEventListener("webglcontextlost", La);
      function at(ve) {
        if (Fe = 0, l.value || document.hidden || !w && (ve > g || Ma.matches) && !S.animating) return;
        const ke = ve < g && !Ma.matches, ja = ve * 0.03;
        S.update({
          x: ke ? Math.sin(ja * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: ke ? 8 - ja % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, n.value, ja, ve / 1e3, Ma.matches, !1), S.root.position.set(0, 0.1, 0), S.root.rotation.y = Number(o.value) * Math.PI / 180, S.root.scale.setScalar(1.35);
        try {
          j.render(z, I), w = !1;
        } catch {
          l.value = !0;
        }
        (ke || S.animating) && !l.value && x();
      }
      x = () => {
        !Fe && !l.value && !document.hidden && (Fe = requestAnimationFrame(at));
      };
      function Na() {
        document.hidden ? (cancelAnimationFrame(Fe), Fe = 0) : (w = !0, x());
      }
      document.addEventListener("visibilitychange", Na), x(), _ = () => {
        x = () => {
        }, cancelAnimationFrame(Fe), da.disconnect(), document.removeEventListener("visibilitychange", Na), j.domElement.removeEventListener("webglcontextlost", La), S.dispose(), P.dispose(), z.clear(), j.dispose(), j.forceContextLoss(), j.domElement.remove();
      };
    }
    function A() {
      _?.(), _ = null, l.value = !1, y();
    }
    return ft(y), et(() => _?.()), (j, z) => (O(), T("div", Qh, [R("section", {
      ref_key: "fitting",
      ref: i,
      class: "exp-fitting"
    }, [R("div", Kh, [R("div", Yh, [R("div", {
      ref_key: "host",
      ref: c,
      class: "exp-outfit-preview",
      "aria-label": m(zt)[n.value].name
    }, [l.value ? (O(), T("div", Jh, [R("p", null, E(m(oe).presentationError.rendering), 1), R("button", {
      type: "button",
      onClick: A
    }, E(m(D).reload), 1)])) : K("", !0)], 8, Vh), R("div", Xh, [R("label", null, [He(E(m(oe).rotate), 1), it(R("input", {
      "onUpdate:modelValue": z[0] || (z[0] = (P) => o.value = P),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": m(oe).rotate
    }, null, 8, eu), [[wr, o.value]])]), R("button", {
      type: "button",
      disabled: l.value,
      onClick: M
    }, E(m(oe).previewAction), 9, au)])]), R("div", tu, [
      R("h3", null, E(m(zt)[n.value].name), 1),
      R("p", null, E(m(zt)[n.value].detail), 1),
      R("p", nu, E(m(oe).wardrobeNote), 1)
    ])]), R("div", ru, [m(Dr)(e.data.active) ? K("", !0) : (O(), T("p", su, E(m(D).safeWardrobe), 1)), d.value ? (O(), T("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !m(Dr)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: z[1] || (z[1] = (P) => t("command", {
        type: "equip",
        id: n.value
      }))
    }, E(e.data.equippedOutfit === n.value ? m(oe).equipped : m(oe).equip), 9, iu)) : f.value ? (O(), T("p", ou, E(m(oe).unlockWeapon(m(rr)[f.value])), 1)) : s.value ? (O(), T(te, { key: 3 }, [R("p", null, E(m(oe).buyOutfit(m(zt)[n.value].name, u.value.price)), 1), R("div", lu, [R("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < u.value.price,
      onClick: F
    }, E(m(oe).confirm), 9, cu), R("button", {
      type: "button",
      onClick: z[2] || (z[2] = (P) => s.value = !1)
    }, E(m(oe).cancel), 1)])], 64)) : (O(), T("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < u.value.price,
      onClick: z[3] || (z[3] = (P) => s.value = !0)
    }, E(e.balance < u.value.price ? m(oe).noCoins : m(oe).purchase) + " · " + E(m(oe).coins(u.value.price)), 9, du))])], 512), R("div", {
      class: "exp-outfit-rack",
      "aria-label": m(oe).tryOn
    }, [(O(!0), T(te, null, je(b.value, (P) => (O(), T("button", {
      key: P,
      type: "button",
      "aria-pressed": n.value === P,
      onClick: (C) => k(P)
    }, [
      h.value[P] ? (O(), T("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: h.value[P],
        alt: ""
      }, null, 8, pu)) : K("", !0),
      R("strong", null, E(m(zt)[P].name), 1),
      R("small", null, E(e.data.equippedOutfit === P ? m(oe).equipped : m(Zn)(e.data, P) ? m(oe).owned : m(Ca)[P].price ? m(oe).coins(m(Ca)[P].price) : m(oe).achievement), 1)
    ], 8, uu))), 128))], 8, hu)]));
  }
}), bu = fu;
function ji(e) {
  const a = /* @__PURE__ */ new Map();
  for (const r of e.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
    a.has(r[1]) && ge("narrative_unavailable"), a.set(r[1], r[2].trim());
  return a;
}
function mu(e, a = 1) {
  const r = [];
  for (const t of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(t[1]) !== a) continue;
    const n = Number(t[2]);
    (r[n] || n >= Lt.bands.length) && ge("narrative_unavailable");
    const s = ji(t[3]);
    r[n] = {
      memory: s.get("memory") ?? "",
      shadow: s.get("shadow") ?? "",
      secret: s.get("secret") ?? null
    };
  }
  return Lt.bands.some((t, n) => !r[n]) && ge("narrative_unavailable"), r;
}
function gu(e, a, r) {
  const t = e[Cr(a.affection)];
  return {
    shadow: t.shadow,
    personalPast: e.slice(0, a.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: t.secret,
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
function wu(e) {
  let a;
  const r = [];
  for (const t of e.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
    const n = ji(t[2]), s = (l) => {
      const c = n.get(l);
      return c || ge("narrative_unavailable"), c;
    }, o = Object.fromEntries(Object.entries(vu).map(([l, c]) => [c, s(l)]));
    if (t[1] === "zero")
      a && ge("narrative_unavailable"), a = o;
    else {
      const l = Number(t[1]);
      (r[l] || l >= Lt.bands.length) && ge("narrative_unavailable"), r[l] = {
        name: s("name"),
        psychology: o
      };
    }
  }
  return (!a || Lt.bands.some((t, n) => !r[n])) && ge("narrative_unavailable"), {
    zero: a,
    bands: r
  };
}
function Si(e, a) {
  const r = e.bands[Cr(a)];
  return a === 0 ? {
    name: r.name,
    psychology: e.zero
  } : r;
}
var yu = async (e, a) => {
  const r = await fetch(`/${Hi}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: a,
    cache: "no-cache"
  });
  r.ok || ge("narrative_unavailable");
  const t = await r.text();
  return t.trim() || ge("narrative_unavailable"), t;
};
async function xu(e, a, r = yu) {
  const [t, n, s, o, l] = await Promise.all([
    r("system-prompt", a),
    r("world", a),
    r("player", a),
    r("meta-protocol", a),
    Promise.all(or.map(async (g) => ({
      id: g,
      document: await r(ze(g) || ka(g) ? g : Xe[g].card, a)
    })))
  ]), c = l.map(({ id: g, document: x }) => {
    const k = [...x.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (k.length !== 1 || !k[0][1].trim()) && ge("narrative_unavailable"), {
      id: g,
      introduction: k[0][1].trim(),
      document: x.replace(k[0][0], "").trim()
    };
  }), i = c.map((g) => g.introduction).join(`
`), h = c.find((g) => g.id === e).document, u = {
    system: t,
    world: n,
    player: s,
    protocol: o,
    npcs: i
  };
  if (ka(e)) return {
    ...u,
    character: h,
    relationship: null,
    stages: [],
    opening: {
      initial: Ne[e].greeting,
      returned: null
    }
  };
  if (!ze(e)) {
    const g = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(h);
    return (!g || g[1] !== `${e}.initial`) && ge("narrative_unavailable"), {
      ...u,
      character: h.slice(0, g.index).replace(/# 开场\s*$/, "").trim(),
      relationship: null,
      stages: [],
      opening: {
        initial: g[2],
        returned: null
      }
    };
  }
  const [d, f] = await Promise.all(["openings", `${e}-stages`].map((g) => r(g, a))), b = new Map([...d.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((g) => [g[1], g[2].trim()])), _ = b.get(`${e}.initial`), w = b.get(`${e}.returned`) ?? null;
  return (!_ || (e === "anian" || e === "kouzi") && !w) && ge("narrative_unavailable"), {
    ...u,
    character: h,
    relationship: wu(f),
    stages: mu(f),
    opening: {
      initial: _,
      returned: w
    }
  };
}
function Ri(e) {
  return no[e];
}
function _u(e, a, r = []) {
  if (ka(a)) return Object.fromEntries(Vr(e, a).map((o) => [o, Tt[o].meaning]));
  if (!ze(a)) {
    const o = Xe[a];
    return e.facts.includes(o.complete) || e.pendingParley ? {} : {
      attack: pe.attack,
      ...e.facts.includes(o.intel) ? { pass: pe.pass } : {}
    };
  }
  const t = Object.fromEntries(Vr(e, a).map((o) => [o, Tt[o].meaning])), n = Ri(a), s = e.relationships[a].affection;
  if (n && !e.facts.includes(n) && s >= Lt.bands[4] && r[Cr(s)]?.secret && (t.share_secret = pe.shareSecret), Ul(e, a)) {
    t.follow = pe.follow, t.stay = pe.stay;
    for (const o of ai(e, a).filter((l) => l.accessible && l.solo)) t[`go:${o.id}`] = pe.go(o.name);
  }
  return t;
}
var Ai = "dialogue", $n = `<${Ai}>`, Tr = `</${Ai}>`, Cb = new RegExp(`${$n}([\\s\\S]*?)${Tr}`, "i"), Pb = new RegExp($n, "i");
function ms(e) {
  const a = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${$n}
${e.reply}
${Tr}
${JSON.stringify({
    action: e.action,
    affection: a,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function ku(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${$n}…${Tr} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function Mu(e) {
  return e.map((a) => ({
    id: a,
    event: en[a]
  }));
}
function ju(e) {
  const a = /* @__PURE__ */ new Set();
  let r;
  return e.filter((t) => t.kind !== "receipt").flatMap((t) => {
    const n = t.facts.filter((l) => !a.has(l)), s = {
      ...t.scene === r ? {} : { place: ie.scenes[t.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    t.facts.forEach((l) => a.add(l)), r = t.scene;
    const o = Object.keys(s).length ? `<scene>
${JSON.stringify(s)}
</scene>
` : "";
    return t.kind === "greeting" ? [{
      role: "assistant",
      content: ms(t)
    }] : t.kind === "player" ? [{
      role: "user",
      content: o + t.player
    }] : [{
      role: "user",
      content: o + t.player
    }, {
      role: "assistant",
      content: ms(t)
    }];
  });
}
function Su(e, a) {
  return a ? e.findIndex((r) => r.id === a.throughId) + 1 : 0;
}
var Ru = {
  confined: "你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。",
  released: "牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。",
  returned: "你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。"
};
function zi(e, a) {
  if (!a) return null;
  let r = e;
  return a.map((t) => {
    const n = {
      from: r,
      exit: t.id,
      to: t.to,
      place: ie.scenes[t.to],
      position: Se[r].anchors[t.anchor]
    };
    return r = t.to, n;
  });
}
function Au(e, a) {
  const r = new Set(e.facts), t = new Set(e.knowledge[a]), n = [], s = kr(pa(a in Ne ? Ne[a].scene : a in e.people ? e.people[a].scene : e.location.scene));
  r.has("city_rekindled") || (r.has("heat_restored") ? n.push("heat_restored") : (t.has("heat_notice_read") || s) && n.push("heat_notice_read"));
  const o = Os.flatMap((l) => {
    const c = l.resolved.find((i) => r.has(i));
    return c ? [c] : [];
  });
  o.push("worker_record_corrected");
  for (const l of o) {
    const c = a === "chenhe" && l === "worker_record_corrected" && r.has("worker_result_delivered");
    r.has(l) && (t.has(l) || c) && n.push(l);
  }
  return a === "kouzi" && r.has("kouzi_entered_city") && n.push("kouzi_entered_city"), !r.has("heat_restored") && t.has("return_flow_tested") && n.push("return_flow_tested"), n.map((l) => ({
    id: l,
    situation: l === "heat_notice_read" ? Ve.heatSituation : a === "chenhe" && l === "worker_record_corrected" ? Ve.workerCorrected : co[l]
  }));
}
function zu(e, a) {
  const r = new Set(e.facts), t = new Set(e.knowledge[a]), n = r.has("city_rekindled") ? "city_rekindled" : r.has("division_works_started") ? "division_works_started" : null, s = n ? [n] : [];
  if (!r.has("city_rekindled")) {
    const o = [
      "furnace_stilled",
      "furnace_master_defeated",
      "furnace_approach_ready",
      "division_tested",
      "division_plan_known",
      "furnace_offer_heard",
      "furnace_invited"
    ].find((l) => r.has(l) && t.has(l));
    o && s.push(o);
  }
  return s.map((o) => ({
    id: o,
    situation: po[o]
  }));
}
function Eu(e, a) {
  const r = new Set(e.facts), t = ze(a) ? e.people[a] : null, n = Se[ze(a) ? e.people[a].scene : ka(a) ? Ne[a].scene : Xe[a].scene], s = ze(a) ? e.people[a].position : ka(a) ? n.anchors[Ne[a].anchor] : Rn(a, r), o = Tn(n, s, r, e.people), l = rn(n.id, s, r).filter((g) => Be(Ta(n, r), s, g.position)), c = ar(n.id), i = ze(a) ? zs(e.facts, a) : null, h = e.location.scene === n.id ? Ft(n, e.location, r) : [], u = $s(e), d = jr, f = Ps(e).find((g) => g.person === a), b = Ta(n, r), _ = Er(e, a), w = n.exits.filter((g) => _.exit(n.id, g.to));
  return {
    place: ie.scenes[n.id],
    chapter: e.chapter !== "outpost" ? { situation: [...Au(e, a), ...zu(e, a)] } : {
      phase: u.phase,
      playerObjective: nr(e),
      optionalRoots: u.optionalRoots
    },
    personalThread: f ? {
      title: f.title,
      accepted: f.accepted,
      resolved: f.resolved,
      ...f.accepted ? {} : { invitation: f.task }
    } : null,
    ...e.chapter === "outpost" ? { supplies: {
      phase: u.supplies,
      situation: d.situation[u.supplies],
      collection: {
        scene: d.scene,
        place: ie.scenes[d.scene],
        interaction: ie.passages[d.object.passage].title,
        position: Se[d.scene].anchors[d.object.anchor],
        available: qa(d.object.condition, r),
        route: zi(e.location.scene, Sn(e.location, {
          scene: d.scene,
          anchor: d.object.anchor
        }, r, !1, _.exit))
      }
    } } : {},
    exits: w.map((g) => {
      const x = n.anchors[g.anchor], k = qa(g.condition, r);
      return {
        id: g.id,
        to: g.to,
        place: ie.scenes[g.to],
        position: x,
        open: k,
        selfAccessible: k && ut(b, s, x, J.playerRadius) !== null,
        playerAccessible: k && e.location.scene === n.id && ut(b, e.location.position, x, J.playerRadius) !== null,
        withinReach: h.some((M) => M.target.id === g.id)
      };
    }),
    playerLodging: [tr.guest_room.name, ...e.location.visited.includes("south_inn") ? [tr.south_inn.name] : []],
    ...i ? { rescue: {
      phase: i,
      situation: Ru[i]
    } } : {},
    playerMechanisms: n.objects.flatMap((g) => {
      if (!qa(g.condition, r)) return [];
      const x = g.kind === "inspect" ? Mr(g.passage) : void 0, k = g.kind === "switch" ? {
        action: ie.switches[g.fact],
        fact: g.fact
      } : x?.operation ? {
        action: x.operation.label,
        fact: x.fact
      } : null;
      return k ? [{
        id: g.id,
        action: k.action,
        position: n.anchors[g.anchor],
        completed: r.has(k.fact),
        withinReach: h.some((M) => M.target.id === g.id)
      }] : [];
    }),
    ...c ? { room: {
      use: c.use,
      enclosure: c.enclosure,
      household: c.household.map((g) => g === "player" ? e.traveler.name : g in ie.households ? ie.households[g] : Ze(g)),
      furniture: c.furniture.map((g) => ({
        item: g.label,
        position: {
          x: g.footprint.x,
          y: g.footprint.z
        }
      })),
      exits: w.map((g) => ({
        place: ie.scenes[g.to],
        position: n.anchors[g.anchor]
      }))
    } } : n.id === "furnace_antechamber" ? { room: {
      use: "炉心外的公共整备值房",
      enclosure: "厚墙隔热，南面通两条登炉路，北面隔热门通炉心。看护与工班往来。",
      furniture: [{
        item: "长凳与水盆",
        position: n.anchors.pause
      }, {
        item: "整备桌与临时床位",
        position: n.anchors.rest
      }]
    } } : {},
    positions: {
      player: e.location.position,
      self: s
    },
    present: [
      e.traveler.name,
      ..._a.filter((g) => e.people[g].scene === n.id).map(Ze),
      ...bt.filter((g) => Ne[g].scene === n.id).map(Ze),
      ...l.map((g) => Ze(g.target.id))
    ],
    residents: (xi[n.id] ?? []).filter((g) => qa(g.condition, r)).map((g) => ({
      name: g.name,
      activity: vd[g.activity]
    })),
    movement: t ? {
      mode: t.mode,
      destination: t.destination ? zn[t.destination].name : null,
      leader: t.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [
      ...o,
      ...l,
      ...Ft(n, {
        scene: n.id,
        position: s,
        facing: 0,
        visited: [n.id]
      }, r).filter((g) => g.kind === "object" && g.target.kind === "resident")
    ].filter((g) => g.target.id !== a).map((g) => Ze(g.target.id))
  };
}
function Cu(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: an[e.appearanceAge] } : {}
  };
}
function Pu(e, a, r = []) {
  const t = _u(e, a, r), n = Object.keys(t), s = {
    person: Ze(a),
    ...Eu(e, a),
    clothing: pi(e, a),
    events: Mu(e.knowledge[a]),
    actions: n,
    actionMeanings: t
  };
  if (ka(a)) return {
    ...s,
    rescued: !1
  };
  if (!ze(a)) {
    const o = Xe[a];
    return {
      ...s,
      rescued: !1,
      resolved: e.facts.includes(o.complete)
    };
  }
  return {
    ...s,
    map: ai(e, a).map((o) => ({
      ...o,
      route: zi(e.people[a].scene, o.route)
    })),
    rescued: Xt(e.facts, a),
    affection: e.relationships[a].affection
  };
}
function Kt(e, a) {
  return `<${e}>
${a}
</${e}>`;
}
function Ou(e, a, r, t, n = e.memories[a]) {
  const s = Pu(e, a, t.stages), o = pc(a), l = ze(a) ? Ri(a) : null, c = ze(a) ? {
    psychology: Si(t.relationship, e.relationships[a].affection).psychology,
    ...gu(t.stages, e.relationships[a], !!l && e.facts.includes(l))
  } : null, { actions: i, actionMeanings: h, events: u, ...d } = s, f = {
    actions: h,
    performance: o,
    clothing: Or
  }, b = {
    memory: n?.text ?? null,
    events: u,
    ...d,
    opening: e.conversations[a].some((_) => _.kind === "dialogue") || Vs(a) && e.facts.includes(Xe[a].complete) ? null : s.rescued ? t.opening.returned : t.opening.initial,
    stage: c
  };
  return {
    systemPrompt: [
      t.system.trim(),
      Kt("background", t.world.trim()),
      Kt("player", `${t.player.trim()}

${JSON.stringify({
        ...Cu(e.traveler),
        outfit: zt[e.outfit].detail,
        equipment: Ba[e.weapon].equipment
      }, null, 2)}`),
      Kt("NPCs", `${t.npcs}

${t.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${Kt("meta_protocol", `${t.protocol.trim()}

${Kt("operations", JSON.stringify(f, null, 2))}`)}

<story>
${JSON.stringify(b, null, 2)}`
      },
      ...ju(e.conversations[a].length ? e.conversations[a].slice(Su(e.conversations[a], n)) : [oi(e, a)]),
      {
        role: "user",
        content: `${r}
</story>

${ku(s.person)}`
      }
    ]
  };
}
var gs = Object.freeze({
  trigger: 8e4,
  waitAt: 98e3,
  inputBudget: 128e3,
  recentExchanges: 5
});
function Fu(e, a, r, t) {
  const n = Ou(e, a, r, t), s = Li({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), o = Nn(n.systemPrompt), l = Nn(e.memories[a]?.text ?? ""), c = Nn(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: s,
    system: o,
    memory: l,
    history: c,
    situation: Math.max(0, s - o - l - c),
    limit: gs.waitAt,
    trigger: gs.trigger
  };
}
var Tu = { class: "ember-clothing-list" }, Lu = ["data-clothing-slot"], Iu = /* @__PURE__ */ De({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (a, r) => (O(), T("dl", Tu, [(O(!0), T(te, null, je(m(Or), (t, n) => (O(), T(te, { key: n }, [e.clothing[n] !== void 0 ? (O(), T(te, { key: 0 }, [R("dt", null, E(t), 1), R("dd", {
      "data-clothing-slot": n,
      class: xa({ "is-absent": !e.clothing[n] })
    }, E(e.clothing[n] || m(nn).absent), 11, Lu)], 64)) : K("", !0)], 64))), 128))]));
  }
}), Ei = /* @__PURE__ */ ia(Iu, [["__scopeId", "data-v-2445b8a0"]]), $u = ["onKeydown"], qu = ["aria-label", "aria-expanded"], Hu = ["aria-label", "aria-expanded"], Uu = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Gu = ["id"], Nu = ["y", "height"], Du = ["href"], Wu = ["href", "clip-path"], Bu = ["aria-label", "aria-expanded"], Zu = ["aria-label"], Qu = ["aria-label"], Ku = { class: "ember-meter-total" }, Yu = { key: 0 }, Vu = { class: "ember-meter-total" }, Ju = { class: "ember-meter-breakdown" }, Xu = {
  class: "ember-error-detail",
  role: "status"
}, ep = ["disabled"], ap = { key: 3 }, tp = { role: "status" }, np = /* @__PURE__ */ De({
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
    const a = e, r = Wa(null), t = B(null), n = {
      clothing: nn.title,
      affection: pe.affection,
      context: pe.context
    }, s = Q(() => pi(a.campaign, a.person)), o = B(null);
    function l() {
      o.value?.querySelector("button[aria-expanded=true]")?.focus(), t.value = null;
    }
    const c = B(0), i = B("");
    let h = null, u;
    async function d() {
      h?.abort(), h = new AbortController();
      const k = h;
      r.value = null, i.value = "";
      try {
        const M = await xu(a.person, k.signal);
        k.signal.aborted || (r.value = M);
      } catch (M) {
        k.signal.aborted || (i.value = Ka(M));
      }
    }
    ue(() => a.person, () => {
      t.value = null, c.value = 0, d();
    }, { immediate: !0 });
    const f = Q(() => ze(a.person) ? a.campaign.relationships[a.person].affection : 0), b = `ember-affection-${xs()}`, _ = Q(() => 19 * f.value / 100), w = Q(() => r.value?.relationship ? Si(r.value.relationship, f.value).name : ""), g = Q(() => r.value ? Fu(a.campaign, a.person, a.draft, r.value) : null);
    ue(() => [a.person, f.value], ([k, M], [F, y]) => {
      k === F && M === y || (u && clearTimeout(u), c.value = k === F ? M - y : 0, c.value && (u = setTimeout(() => {
        c.value = 0;
      }, 3500)));
    }), _s(() => (l(), !0), () => !!t.value), et(() => {
      h?.abort(), u && clearTimeout(u);
    });
    const x = (k) => `${(k / 1e3).toFixed(1)}k`;
    return (k, M) => (O(), T("div", {
      ref_key: "meters",
      ref: o,
      class: "ember-meters",
      onKeydown: Fi($a(l, ["stop"]), ["esc"])
    }, [
      R("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": m(nn).title,
        "aria-expanded": t.value === "clothing",
        onClick: M[0] || (M[0] = (F) => t.value = t.value === "clothing" ? null : "clothing")
      }, [...M[4] || (M[4] = [R("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [R("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, qu),
      m(ze)(e.person) ? (O(), T("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(pe).affection,
        "aria-expanded": t.value === "affection",
        onClick: M[1] || (M[1] = (F) => t.value = t.value === "affection" ? null : "affection")
      }, [(O(), T("svg", Uu, [
        R("defs", null, [R("path", {
          id: `${b}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Gu), R("clipPath", { id: b }, [R("rect", {
          x: "2",
          y: 22 - _.value,
          width: "20",
          height: _.value
        }, null, 8, Nu)])]),
        R("use", {
          href: `#${b}-shape`,
          class: "ember-affection-track"
        }, null, 8, Du),
        R("use", {
          href: `#${b}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${b})`
        }, null, 8, Wu)
      ])), c.value ? (O(), T("small", {
        key: 0,
        class: xa(["ember-affection-change", { "is-down": c.value < 0 }]),
        role: "status"
      }, E(c.value > 0 ? "+" : "") + E(c.value), 3)) : K("", !0)], 8, Hu)) : K("", !0),
      R("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": m(pe).context,
        "aria-expanded": t.value === "context",
        onClick: M[2] || (M[2] = (F) => t.value = t.value === "context" ? null : "context")
      }, [R("span", {
        class: xa(["ember-meter-ring", { "is-warning": g.value && g.value.used >= g.value.trigger }]),
        style: ct({ "--meter-fill": `${Math.min(1, (g.value?.used ?? 0) / (g.value?.limit ?? 1)) * 360}deg` })
      }, [...M[5] || (M[5] = [R("span", null, null, -1)])], 6)], 8, Bu),
      t.value ? (O(), T("section", {
        key: 1,
        class: xa(["ember-meter-popover", { "ember-clothing-popover": t.value === "clothing" }]),
        "aria-label": n[t.value]
      }, [
        R("header", null, [R("strong", null, E(n[t.value]), 1), R("button", {
          type: "button",
          "aria-label": m(pe).close,
          onClick: l
        }, "×", 8, Qu)]),
        t.value === "affection" ? (O(), T(te, { key: 0 }, [R("p", Ku, [He(E(f.value) + " ", 1), M[6] || (M[6] = R("small", null, "/ 100", -1))]), i.value ? K("", !0) : (O(), T("p", Yu, E(w.value || m(pe).loading), 1))], 64)) : t.value === "clothing" ? (O(), va(Ei, {
          key: 1,
          clothing: s.value
        }, null, 8, ["clothing"])) : g.value ? (O(), T(te, { key: 2 }, [
          R("p", Vu, E(x(g.value.used)) + " / " + E(x(g.value.limit)), 1),
          R("dl", Ju, [(O(!0), T(te, null, je(m(pe).contextParts, (F, y) => (O(), T(te, { key: y }, [R("dt", null, E(F), 1), R("dd", null, E(x(g.value[y])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? (O(), T(te, { key: 0 }, [R("p", Xu, E(m(Ka)(e.memoryState)), 1), R("button", {
            type: "button",
            disabled: e.blocked,
            onClick: M[3] || (M[3] = (F) => k.$emit("retry-memory"))
          }, E(m(pe).memoryRetry), 9, ep)], 64)) : K("", !0)
        ], 64)) : i.value ? K("", !0) : (O(), T("p", ap, E(m(pe).loading), 1)),
        i.value && t.value !== "clothing" ? (O(), T(te, { key: 4 }, [R("p", tp, E(i.value), 1), R("button", {
          type: "button",
          onClick: d
        }, E(m(pe).retry), 1)], 64)) : K("", !0)
      ], 10, Zu)) : K("", !0)
    ], 40, $u));
  }
}), rp = /* @__PURE__ */ ia(np, [["__scopeId", "data-v-38bbe277"]]), sp = ["aria-label"], ip = { class: "ember-weapon-layout" }, op = { class: "ember-weapon-list" }, lp = ["name", "value"], cp = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, dp = ["src"], hp = { class: "ember-weapon-skill" }, up = /* @__PURE__ */ De({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const a = ws(e, "modelValue"), r = xs();
    return (t, n) => (O(), T("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": m(Me).chooseWeapon
    }, [R("div", ip, [R("div", op, [(O(!0), T(te, null, je(m(Es), (s) => (O(), T("label", {
      key: s,
      class: xa({ "is-selected": a.value === s })
    }, [
      it(R("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (o) => a.value = o),
        type: "radio",
        name: m(r),
        value: s
      }, null, 8, lp), [[ys, a.value]]),
      na(Qa, { name: s }, null, 8, ["name"]),
      R("span", null, E(m(Ba)[s].name), 1)
    ], 2))), 128))]), R("div", cp, [
      (O(), T("img", {
        key: a.value,
        class: "ember-weapon-art",
        src: m(jh)[a.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, dp)),
      R("h3", null, E(m(Ba)[a.value].name), 1),
      R("p", null, E(m(Ba)[a.value].detail), 1),
      R("div", hp, [R("strong", null, E(m(Ba)[a.value].action), 1), R("p", null, E(m(Ba)[a.value].skill), 1)])
    ])])], 8, sp));
  }
}), pp = /* @__PURE__ */ ia(up, [["__scopeId", "data-v-0c0d4e2b"]]), fp = ["src"], bp = /* @__PURE__ */ De({
  __name: "WorldFrontispiece",
  setup(e) {
    const a = B(null), r = B(null), t = new ResizeObserver((n) => {
      const { width: s, height: o } = n[0].contentRect;
      r.value = s <= 700 && o > s;
    });
    return ft(() => t.observe(a.value)), et(() => t.disconnect()), (n, s) => (O(), T("div", {
      ref_key: "root",
      ref: a,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [r.value !== null ? (O(), T("img", {
      key: 0,
      src: r.value ? m(fs).cityMobile : m(fs).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, fp)) : K("", !0)], 512));
  }
}), mp = /* @__PURE__ */ ia(bp, [["__scopeId", "data-v-f5a6e0d9"]]), gp = ["aria-label"], vp = {
  key: 0,
  class: "entry-title"
}, wp = { class: "entry-city" }, yp = ["aria-label"], xp = ["disabled"], _p = ["disabled"], kp = ["disabled"], Mp = {
  key: 0,
  class: "entry-save"
}, jp = ["disabled"], Sp = { class: "entry-name" }, Rp = { for: "ember-traveler-name" }, Ap = ["maxlength", "placeholder"], zp = { class: "entry-identity-details" }, Ep = ["value"], Cp = { class: "entry-age" }, Pp = { for: "ember-traveler-age" }, Op = {
  disabled: "",
  value: ""
}, Fp = ["value"], Tp = {
  class: "entry-primary",
  type: "submit"
}, Lp = { class: "entry-traveler" }, Ip = {
  key: 0,
  class: "entry-restart"
}, $p = ["disabled"], qp = {
  key: 0,
  "aria-hidden": "true"
}, Hp = /* @__PURE__ */ De({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: a, emit: r }) {
    const t = e, n = r, s = B("title"), o = B(t.campaign?.traveler.name ?? ""), l = B(t.campaign?.traveler.gender ?? null), c = B(t.campaign?.traveler.appearanceAge ?? ""), i = B(t.campaign?.weapon ?? "blade"), h = B(!1), u = B(null), d = B(null), f = Q(() => ({
      title: D.title,
      identity: Me.identity,
      weapon: Me.chooseWeapon
    })[s.value]);
    ue(s, async () => {
      await Pa(), d.value && (d.value.scrollTop = 0), u.value?.focus({ preventScroll: !0 });
    });
    function b() {
      h.value = !1, s.value = "identity";
    }
    function _() {
      o.value.trim() && l.value && c.value && (o.value = o.value.trim(), s.value = "weapon");
    }
    function w() {
      s.value = s.value === "weapon" ? "identity" : "title";
    }
    function g() {
      !l.value || !c.value || !o.value.trim() || t.blocked || t.campaign && !h.value || n("start", {
        traveler: {
          name: o.value.trim(),
          gender: l.value,
          appearanceAge: c.value
        },
        weapon: i.value
      });
    }
    return a({ back: () => s.value === "title" ? !1 : (w(), !0) }), (x, k) => (O(), T("section", {
      class: xa(["ember-entry", { "is-title": s.value === "title" }]),
      "aria-label": m(D).title
    }, [
      na(mp),
      k[9] || (k[9] = R("div", { class: "entry-shade" }, null, -1)),
      s.value === "title" ? (O(), T("div", vp, [
        R("p", wp, E(m(Me).city), 1),
        R("h1", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, E(m(D).title), 513),
        R("nav", { "aria-label": m(D).title }, [e.campaign ? (O(), T("button", {
          key: 0,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: k[0] || (k[0] = (M) => n("continue"))
        }, [He(E(m(D).resume), 1), k[6] || (k[6] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, xp)) : (O(), T("button", {
          key: 1,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: b
        }, [He(E(e.ready ? m(Me).begin : m(Me).loading), 1), k[7] || (k[7] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, _p)), e.campaign ? (O(), T("button", {
          key: 2,
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: b
        }, E(m(Me).newJourney), 9, kp)) : K("", !0)], 8, yp),
        e.campaign ? (O(), T("p", Mp, [R("span", null, E(e.campaign.traveler.name), 1), R("span", null, E(m(ie).scenes[e.campaign.location.scene]), 1)])) : K("", !0)
      ])) : (O(), T("div", {
        key: 1,
        ref_key: "sheet",
        ref: d,
        class: "entry-sheet"
      }, [
        R("header", null, [R("button", {
          type: "button",
          disabled: e.busy,
          onClick: w
        }, "← " + E(m(Me).back), 9, jp), R("span", null, E(m(D).title), 1)]),
        R("h2", {
          ref_key: "heading",
          ref: u,
          tabindex: "-1"
        }, E(f.value), 513),
        s.value === "identity" ? (O(), T("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: $a(_, ["prevent"])
        }, [
          R("div", Sp, [R("label", Rp, E(m(Me).name), 1), it(R("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": k[1] || (k[1] = (M) => o.value = M),
            maxlength: m(24),
            placeholder: m(Me).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, Ap), [[wr, o.value]])]),
          R("div", zp, [R("fieldset", null, [R("legend", null, E(m(Me).gender), 1), (O(!0), T(te, null, je(m(ii), (M) => (O(), T("label", { key: M }, [it(R("input", {
            "onUpdate:modelValue": k[2] || (k[2] = (F) => l.value = F),
            type: "radio",
            name: "ember-traveler-gender",
            value: M,
            required: ""
          }, null, 8, Ep), [[ys, l.value]]), R("span", null, E(m(Me).genders[M]), 1)]))), 128))]), R("div", Cp, [R("label", Pp, E(m(Me).age), 1), it(R("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": k[3] || (k[3] = (M) => c.value = M),
            required: ""
          }, [R("option", Op, E(m(Me).agePlaceholder), 1), (O(!0), T(te, null, je(m(an), (M, F) => (O(), T("option", {
            key: F,
            value: F
          }, E(M), 9, Fp))), 128))], 512), [[Ti, c.value]])])]),
          R("button", Tp, [He(E(m(Me).next), 1), k[8] || (k[8] = R("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : (O(), T("form", {
          key: 1,
          class: "entry-loadout",
          onSubmit: $a(g, ["prevent"])
        }, [
          R("p", Lp, [R("strong", null, E(o.value), 1), R("span", null, E(l.value ? m(Me).genders[l.value] : "") + " · " + E(c.value ? m(an)[c.value] : "") + " · " + E(m(Me).identityRole), 1)]),
          na(pp, {
            modelValue: i.value,
            "onUpdate:modelValue": k[4] || (k[4] = (M) => i.value = M)
          }, null, 8, ["modelValue"]),
          e.campaign ? (O(), T("label", Ip, [it(R("input", {
            "onUpdate:modelValue": k[5] || (k[5] = (M) => h.value = M),
            type: "checkbox",
            required: ""
          }, null, 512), [[Ci, h.value]]), R("span", null, E(m(Me).restartWarning), 1)])) : K("", !0),
          R("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [He(E(e.busy ? m(Me).entering : e.campaign ? m(Me).confirmRestart : m(Me).enter), 1), e.busy ? K("", !0) : (O(), T("span", qp, "→"))], 8, $p)
        ], 32))
      ], 512))
    ], 10, gp));
  }
}), Up = /* @__PURE__ */ ia(Hp, [["__scopeId", "data-v-5cbd1a94"]]), Gp = [
  "aria-label",
  "title",
  "disabled"
], Np = ["disabled"], Dp = [
  "maxlength",
  "aria-label",
  "placeholder"
], Wp = ["aria-label", "title"], Bp = [
  "aria-label",
  "title",
  "disabled"
], Zp = /* @__PURE__ */ De({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ Lr({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Lr([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: a }) {
    const r = ws(e, "modelValue"), t = e, n = a, s = B(null), o = B(!1);
    let l = null, c = 0;
    function i() {
      s.value && (s.value.style.height = "44px", s.value.style.height = `${Math.min(132, s.value.scrollHeight + 2)}px`);
    }
    function h() {
      !t.blocked && r.value.trim() && n("send");
    }
    function u(d) {
      Ii(d, o.value) && (d.preventDefault(), h());
    }
    return ue(r, async () => {
      await Pa(), i();
    }), ue(s, (d, f) => {
      f && l?.unobserve(f), d && (i(), l?.observe(d));
    }, { flush: "post" }), ft(() => {
      i(), l = new ResizeObserver((d) => {
        const f = d[0].contentRect.width;
        f !== c && (c = f, i());
      }), s.value && l.observe(s.value);
    }), et(() => l?.disconnect()), (d, f) => (O(), T("form", {
      class: "ember-composer",
      onSubmit: $a(h, ["prevent"])
    }, [
      R("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? m(pe).retrySend : m(pe).regenerate,
        title: e.retrying ? m(pe).retrySend : m(pe).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: f[0] || (f[0] = (b) => n("regenerate"))
      }, [...f[6] || (f[6] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, Gp),
      e.conclusion ? (O(), T("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: f[1] || (f[1] = (b) => n("continue"))
      }, [He(E(e.conclusion === "fight" ? m(pe).fight : m(pe).continue), 1), f[7] || (f[7] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, Np)) : it((O(), T("textarea", {
        key: 1,
        ref_key: "input",
        ref: s,
        "onUpdate:modelValue": f[2] || (f[2] = (b) => r.value = b),
        rows: "1",
        maxlength: m(ci).playerTextLimit,
        "aria-label": m(D).input,
        placeholder: m(D).input,
        enterkeyhint: "enter",
        onKeydown: u,
        onCompositionstart: f[3] || (f[3] = (b) => o.value = !0),
        onCompositionend: f[4] || (f[4] = (b) => o.value = !1)
      }, null, 40, Dp)), [[wr, r.value]]),
      e.talking ? (O(), T("button", {
        key: 2,
        type: "button",
        "aria-label": m(D).cancel,
        title: m(D).cancel,
        onClick: f[5] || (f[5] = (b) => n("cancel"))
      }, [...f[8] || (f[8] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, Wp)) : e.conclusion ? K("", !0) : (O(), T("button", {
        key: 3,
        type: "submit",
        "aria-label": m(D).send,
        title: m(D).send,
        disabled: e.blocked || !r.value.trim()
      }, [...f[9] || (f[9] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Bp))
    ], 32));
  }
}), Qp = /* @__PURE__ */ ia(Zp, [["__scopeId", "data-v-640a5540"]]), Kp = ["data-phase"], Yp = {
  role: "status",
  "aria-live": "polite"
}, Vp = ["datetime"], Jp = /* @__PURE__ */ De({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const a = e, r = B(Date.now()), t = B(!0);
    vr(() => {
      t.value = !0;
    }), An(() => {
      t.value = !1;
    });
    const n = Q(() => Math.max(0, Math.floor((r.value - a.startedAt) / 1e3)));
    return ue(() => [a.startedAt, t.value], (s, o, l) => {
      if (r.value = Date.now(), !t.value) return;
      const c = setInterval(() => {
        r.value = Date.now();
      }, 1e3);
      l(() => clearInterval(c));
    }, { immediate: !0 }), (s, o) => (O(), T("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      o[0] || (o[0] = R("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      R("span", Yp, E(m(pe).phases[e.phase]), 1),
      R("time", { datetime: `PT${n.value}S` }, E(m(pe).elapsed(n.value)), 9, Vp)
    ], 8, Kp));
  }
}), Xp = /* @__PURE__ */ ia(Jp, [["__scopeId", "data-v-55406ff9"]]), vs = "关闭交谈后出发", Rt = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, a) => a ? `${e}将与你同行 · ${vs}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, a, r) => r ? `${e}准备前往${a}等候 · ${vs}` : `${e}曾约定前往${a}等候`,
  pass: (e, a) => a ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function e1(e, a, r) {
  if (!ze(a)) return !1;
  const t = e.people[a], n = r.action;
  if (!(n === "follow" && t.mode === "follow" || t.mode === "travel" && n === `go:${t.destination}`)) return !1;
  const s = e.conversations[a];
  for (let o = s.length - 1; o >= 0; o--) {
    const l = s[o], c = l.action;
    if (c === "follow" || c === "stay" || c?.startsWith("go:")) return l.id === r.id;
  }
  return !1;
}
function a1(e, a, r) {
  const t = r.action;
  if (r.kind !== "dialogue" || !t) return null;
  const n = e.conversations[a].at(-1)?.id === r.id, s = Xs(t), o = e1(e, a, r) || n && (s?.confirm ? Ln(e) === a : (t === "pass" || t === "attack") && e.pendingParley?.enemy === a), l = Ze(a);
  if (s?.feedback) return {
    action: t,
    phase: o ? "pending" : "applied",
    text: o ? s.feedback.pending : s.feedback.applied
  };
  let c;
  switch (t) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      c = Rt[t];
      break;
    case "follow":
      c = Rt.follow(l, o);
      break;
    case "stay":
      c = Rt.stay(l);
      break;
    case "pass":
      c = Rt.pass(l, o);
      break;
    case "attack":
    case "finish":
      c = Rt[t](o);
      break;
    default:
      c = Rt.go(l, zn[t.slice(3)].name, o);
  }
  return {
    action: t,
    phase: o ? "pending" : "applied",
    text: c
  };
}
var t1 = ["data-action", "data-phase"], n1 = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, r1 = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, s1 = /* @__PURE__ */ De({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const a = e, r = Q(() => a1(a.campaign, a.person, a.turn));
    return (t, n) => r.value ? (O(), T("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": r.value.action,
      "data-phase": r.value.phase
    }, [(O(), T("svg", n1, [r.value.phase === "pending" ? (O(), T(te, { key: 0 }, [n[0] || (n[0] = R("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = R("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : (O(), T("path", r1))])), R("span", null, E(r.value.text), 1)], 8, t1)) : K("", !0);
  }
}), i1 = /* @__PURE__ */ ia(s1, [["__scopeId", "data-v-00613f94"]]), o1 = { class: "ember-clothing-feedback" }, l1 = { key: 0 }, c1 = /* @__PURE__ */ De({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (a, r) => (O(), T("details", o1, [R("summary", null, [He(E(m(nn).changed), 1), R("span", null, [(O(!0), T(te, null, je(m(Or), (t, n) => (O(), T(te, { key: n }, [e.clothing[n] !== void 0 ? (O(), T("small", l1, E(t), 1)) : K("", !0)], 64))), 128))])]), na(Ei, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), d1 = /* @__PURE__ */ ia(c1, [["__scopeId", "data-v-49dedcf2"]]);
function h1(e) {
  const a = [];
  let r = 0;
  for (const t of e.matchAll(/「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"/g))
    t.index > r && a.push({
      text: e.slice(r, t.index),
      spoken: !1
    }), a.push({
      text: t[0],
      spoken: !0
    }), r = t.index + t[0].length;
  return r < e.length && a.push({
    text: e.slice(r),
    spoken: !1
  }), a;
}
var u1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-arm.webp?v=fd0d609d4ec02768",
  import.meta.url
).href, p1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-blush.webp?v=7c20cdfbade91161",
  import.meta.url
).href, f1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-body.webp?v=10628303fc258e25",
  import.meta.url
).href, b1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-displeased.webp?v=dca7dd9e53465144",
  import.meta.url
).href, m1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-fond.webp?v=67d3773440720ffd",
  import.meta.url
).href, g1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-laugh.webp?v=23632e8af5ecd6c7",
  import.meta.url
).href, v1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-neutral.webp?v=efa30b3d180075d1",
  import.meta.url
).href, w1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-rest.webp?v=1038f79033077860",
  import.meta.url
).href, y1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-sad.webp?v=3095503c26fb6fe0",
  import.meta.url
).href, x1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-smile.webp?v=4faa9e9307c789e3",
  import.meta.url
).href, _1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-surprised.webp?v=d68fa784d11cc78c",
  import.meta.url
).href, k1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-worried.webp?v=5f96e9d15f68340c",
  import.meta.url
).href, M1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-angry.webp?v=aa41b88a99fae75b",
  import.meta.url
).href, j1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-arm.webp?v=cb9679251ce7224b",
  import.meta.url
).href, S1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-body.webp?v=bfce2cac40277f85",
  import.meta.url
).href, R1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-neutral.webp?v=dfc1365cc4c28b6f",
  import.meta.url
).href, A1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-relieved.webp?v=4a6c3eefd6b4c692",
  import.meta.url
).href, z1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-resigned.webp?v=29e36eb6e92de7d3",
  import.meta.url
).href, E1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-suspicious.webp?v=2594ff9f16f4bff1",
  import.meta.url
).href, C1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-worried.webp?v=56efa314ee4ab0d1",
  import.meta.url
).href, P1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-arm.webp?v=00c4182caaa8fb53",
  import.meta.url
).href, O1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-body.webp?v=4dda7b728d6c24f7",
  import.meta.url
).href, F1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-displeased.webp?v=293ee66a0b98f879",
  import.meta.url
).href, T1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-neutral.webp?v=10c4e5408f754e31",
  import.meta.url
).href, L1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-relieved.webp?v=2092c6bd40af38f4",
  import.meta.url
).href, I1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-smile.webp?v=f1ca0dddcfa6a5b3",
  import.meta.url
).href, $1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-squint.webp?v=658d1224e7a3cec9",
  import.meta.url
).href, q1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-worried.webp?v=549cd87fcb1e98df",
  import.meta.url
).href, H1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-arm.webp?v=6e040dbb32c5b933",
  import.meta.url
).href, U1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-blush.webp?v=78902e5bc2f36032",
  import.meta.url
).href, G1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-body.webp?v=5a474abbab62fd30",
  import.meta.url
).href, N1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-displeased.webp?v=1fc9e1d5fd49e3ee",
  import.meta.url
).href, D1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-fond.webp?v=212331e79516bf7f",
  import.meta.url
).href, W1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-laugh.webp?v=690ccfe560b027a3",
  import.meta.url
).href, B1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-neutral.webp?v=e405a536b974c1de",
  import.meta.url
).href, Z1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-sad.webp?v=280e468945cae00d",
  import.meta.url
).href, Q1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-serious.webp?v=cd781e4d0b9d84e0",
  import.meta.url
).href, K1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-smile.webp?v=3ae1327fb15a158e",
  import.meta.url
).href, Y1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-surprised.webp?v=571014006d95898e",
  import.meta.url
).href, V1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-teasing.webp?v=f63fad83062455bb",
  import.meta.url
).href, J1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-worried.webp?v=f6ce76fd235cff74",
  import.meta.url
).href, X1 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-arm.webp?v=e2a8648faac7a5fc",
  import.meta.url
).href, ef = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-blush.webp?v=9786c4821e46d177",
  import.meta.url
).href, af = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-body.webp?v=24dfd70982f3f655",
  import.meta.url
).href, tf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-fond.webp?v=43cfc9b75373ef9b",
  import.meta.url
).href, nf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-laugh.webp?v=808c976ba4fb39d7",
  import.meta.url
).href, rf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-neutral.webp?v=c33f5f73b9ef37f1",
  import.meta.url
).href, sf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-sad.webp?v=90162790173a9622",
  import.meta.url
).href, of = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-serious.webp?v=81b30a031e26dc72",
  import.meta.url
).href, lf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-smile.webp?v=b2c788d51fd5dd97",
  import.meta.url
).href, cf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-surprised.webp?v=ed06964e772c492c",
  import.meta.url
).href, df = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-teasing.webp?v=11a4659aea380062",
  import.meta.url
).href, hf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-worried.webp?v=0e5851551d6ef8f5",
  import.meta.url
).href, uf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-arm.webp?v=018e79f0cc85bff1",
  import.meta.url
).href, pf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-blush.webp?v=4625d9fdbe238ddd",
  import.meta.url
).href, ff = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-body.webp?v=7093e7ebb88de83c",
  import.meta.url
).href, bf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-displeased.webp?v=9f20517e0a93803b",
  import.meta.url
).href, mf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-fond.webp?v=3de05c591762e97b",
  import.meta.url
).href, gf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-laugh.webp?v=6c409163ff16d22c",
  import.meta.url
).href, vf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-neutral.webp?v=d0cdf22439878886",
  import.meta.url
).href, wf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-relaxed.webp?v=71c0d8846be23f8e",
  import.meta.url
).href, yf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-sad.webp?v=139cb08d4be6a468",
  import.meta.url
).href, xf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-serious.webp?v=6c551dafe840aecb",
  import.meta.url
).href, _f = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-smile.webp?v=f96a190fe9ce90f1",
  import.meta.url
).href, kf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-surprised.webp?v=7cc5f8d225dd9dfd",
  import.meta.url
).href, Mf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-teasing.webp?v=962b1437724b9677",
  import.meta.url
).href, jf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-worried.webp?v=bbf275fe2cd2475d",
  import.meta.url
).href, At = {
  width: 420,
  height: 495
}, Y = {
  "anian-arm": {
    src: u1,
    x: 15,
    y: 256,
    width: 171,
    height: 106
  },
  "anian-blush": {
    src: p1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-body": {
    src: f1,
    x: 131,
    y: 148,
    width: 268,
    height: 347
  },
  "anian-displeased": {
    src: b1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-fond": {
    src: m1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-laugh": {
    src: g1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-neutral": {
    src: v1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-rest": {
    src: w1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-sad": {
    src: y1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-smile": {
    src: x1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-surprised": {
    src: _1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-worried": {
    src: k1,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "bajin-angry": {
    src: M1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-arm": {
    src: j1,
    x: 307,
    y: 294,
    width: 106,
    height: 104
  },
  "bajin-body": {
    src: S1,
    x: 6,
    y: 123,
    width: 408,
    height: 361
  },
  "bajin-neutral": {
    src: R1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-relieved": {
    src: A1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-resigned": {
    src: z1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-suspicious": {
    src: E1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-worried": {
    src: C1,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "changyounian-arm": {
    src: P1,
    x: 11,
    y: 314,
    width: 137,
    height: 92
  },
  "changyounian-body": {
    src: O1,
    x: 82,
    y: 134,
    width: 325,
    height: 329
  },
  "changyounian-displeased": {
    src: F1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-neutral": {
    src: T1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-relieved": {
    src: L1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-smile": {
    src: I1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-squint": {
    src: $1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-worried": {
    src: q1,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "kouzi-arm": {
    src: H1,
    x: 301,
    y: 216,
    width: 102,
    height: 124
  },
  "kouzi-blush": {
    src: U1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-body": {
    src: G1,
    x: 34,
    y: 149,
    width: 307,
    height: 346
  },
  "kouzi-displeased": {
    src: N1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-fond": {
    src: D1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-laugh": {
    src: W1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-neutral": {
    src: B1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-sad": {
    src: Z1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-serious": {
    src: Q1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-smile": {
    src: K1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-surprised": {
    src: Y1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-teasing": {
    src: V1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-worried": {
    src: J1,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "laobai-arm": {
    src: X1,
    x: 8,
    y: 301,
    width: 116,
    height: 80
  },
  "laobai-blush": {
    src: ef,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-body": {
    src: af,
    x: 76,
    y: 122,
    width: 339,
    height: 347
  },
  "laobai-fond": {
    src: tf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-laugh": {
    src: nf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-neutral": {
    src: rf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-sad": {
    src: sf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-serious": {
    src: of,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-smile": {
    src: lf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-surprised": {
    src: cf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-teasing": {
    src: df,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-worried": {
    src: hf,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "sanniang-arm": {
    src: uf,
    x: 18,
    y: 222,
    width: 140,
    height: 128
  },
  "sanniang-blush": {
    src: pf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-body": {
    src: ff,
    x: 112,
    y: 152,
    width: 308,
    height: 343
  },
  "sanniang-displeased": {
    src: bf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-fond": {
    src: mf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-laugh": {
    src: gf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-neutral": {
    src: vf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-relaxed": {
    src: wf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-sad": {
    src: yf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-serious": {
    src: xf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-smile": {
    src: _f,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-surprised": {
    src: kf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-teasing": {
    src: Mf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-worried": {
    src: jf,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  }
}, Sf = {
  sanniang: {
    body: Y["sanniang-body"],
    arm: Y["sanniang-arm"],
    heads: {
      neutral: Y["sanniang-neutral"],
      smile: Y["sanniang-smile"],
      teasing: Y["sanniang-teasing"],
      blush: Y["sanniang-blush"],
      rest: Y["sanniang-relaxed"],
      serious: Y["sanniang-serious"],
      worried: Y["sanniang-worried"],
      sad: Y["sanniang-sad"],
      displeased: Y["sanniang-displeased"],
      fond: Y["sanniang-fond"],
      laugh: Y["sanniang-laugh"],
      surprised: Y["sanniang-surprised"]
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: Y["anian-body"],
    arm: Y["anian-arm"],
    heads: {
      neutral: Y["anian-neutral"],
      smile: Y["anian-smile"],
      blush: Y["anian-blush"],
      displeased: Y["anian-displeased"],
      fond: Y["anian-fond"],
      laugh: Y["anian-laugh"],
      rest: Y["anian-rest"],
      sad: Y["anian-sad"],
      surprised: Y["anian-surprised"],
      worried: Y["anian-worried"]
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: Y["kouzi-body"],
    arm: Y["kouzi-arm"],
    heads: {
      neutral: Y["kouzi-neutral"],
      blush: Y["kouzi-blush"],
      displeased: Y["kouzi-displeased"],
      fond: Y["kouzi-fond"],
      laugh: Y["kouzi-laugh"],
      sad: Y["kouzi-sad"],
      serious: Y["kouzi-serious"],
      smile: Y["kouzi-smile"],
      surprised: Y["kouzi-surprised"],
      teasing: Y["kouzi-teasing"],
      worried: Y["kouzi-worried"]
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: Y["laobai-body"],
    arm: Y["laobai-arm"],
    heads: {
      neutral: Y["laobai-neutral"],
      smile: Y["laobai-smile"],
      teasing: Y["laobai-teasing"],
      laugh: Y["laobai-laugh"],
      blush: Y["laobai-blush"],
      fond: Y["laobai-fond"],
      serious: Y["laobai-serious"],
      surprised: Y["laobai-surprised"],
      worried: Y["laobai-worried"],
      sad: Y["laobai-sad"]
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: Y["bajin-body"],
    arm: Y["bajin-arm"],
    heads: {
      neutral: Y["bajin-neutral"],
      angry: Y["bajin-angry"],
      relieved: Y["bajin-relieved"],
      resigned: Y["bajin-resigned"],
      suspicious: Y["bajin-suspicious"],
      worried: Y["bajin-worried"]
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: Y["changyounian-body"],
    arm: Y["changyounian-arm"],
    heads: {
      neutral: Y["changyounian-neutral"],
      displeased: Y["changyounian-displeased"],
      relieved: Y["changyounian-relieved"],
      smile: Y["changyounian-smile"],
      squint: Y["changyounian-squint"],
      worried: Y["changyounian-worried"]
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
};
function Xn(e, a = "0% 0%") {
  const [r, t] = a.split(" ").map(parseFloat);
  return {
    left: `${e.x / At.width * 100}%`,
    top: `${e.y / At.height * 100}%`,
    width: `${e.width / At.width * 100}%`,
    height: `${e.height / At.height * 100}%`,
    transformOrigin: `${(r / 100 * At.width - e.x) / e.width * 100}% ${(t / 100 * At.height - e.y) / e.height * 100}%`
  };
}
var Rf = {
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
function Af(e, a, r) {
  if (e === "none") return null;
  const t = Rf[e], n = t.joint === "arm" ? t.angles.map((s) => `rotate(${s * r}deg)`) : t.frames;
  return a[t.joint].animate(n.map((s) => ({ transform: s })), {
    duration: t.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var zf = [
  "src",
  "width",
  "height"
], Ef = [
  "src",
  "width",
  "height"
], Cf = [
  "src",
  "width",
  "height"
], Pf = /* @__PURE__ */ De({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const a = e, r = B(null), t = B(null), n = B(null), s = Q(() => Sf[a.person]), o = Q(() => s.value.heads[a.performance?.expression ?? "neutral"]), l = B(!1), c = B(0);
    let i = 0, h = !1, u = !1, d = null, f, b;
    function _() {
      u = !0, d?.cancel(), d = null;
    }
    function w() {
      if (!(!a.animate || u || l.value || i < 3 || !h)) {
        if (document.hidden || b?.matches) {
          _();
          return;
        }
        t.value && n.value && (u = !0, d = Af(a.performance?.gesture ?? "none", {
          head: t.value,
          arm: n.value
        }, s.value.armDirection));
      }
    }
    function g() {
      i++, w();
    }
    function x() {
      l.value = !0, _();
    }
    function k() {
      i = 0, l.value = !1, c.value++;
    }
    function M() {
      document.hidden && _();
    }
    function F() {
      b?.matches && _();
    }
    return ue(() => a.animate, (y) => {
      y ? w() : _();
    }), ft(() => {
      b = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || b.matches) && _(), b.addEventListener("change", F), document.addEventListener("visibilitychange", M), f = new IntersectionObserver((y) => {
        h = y[0].isIntersecting && y[0].intersectionRatio >= 0.25, h ? w() : d && _();
      }, { threshold: 0.25 }), r.value && f.observe(r.value);
    }), An(_), et(() => {
      _(), f?.disconnect(), b?.removeEventListener("change", F), document.removeEventListener("visibilitychange", M);
    }), (y, A) => (O(), T("span", {
      ref_key: "root",
      ref: r,
      class: xa(["ember-dialogue-actor", { "actor-failed": l.value }])
    }, [l.value ? (O(), T("button", {
      key: 1,
      type: "button",
      onClick: k
    }, E(m(pe).reloadArtwork), 1)) : (O(), T(te, { key: 0 }, [
      (O(), T("img", {
        key: "body-" + c.value,
        src: s.value.body.src,
        style: ct(m(Xn)(s.value.body)),
        alt: "",
        width: s.value.body.width,
        height: s.value.body.height,
        decoding: "async",
        loading: "lazy",
        onLoad: g,
        onError: x
      }, null, 44, zf)),
      (O(), T("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: t,
        class: "actor-head",
        src: o.value.src,
        style: ct(m(Xn)(o.value, s.value.headOrigin)),
        alt: "",
        width: o.value.width,
        height: o.value.height,
        decoding: "async",
        loading: "lazy",
        onLoad: g,
        onError: x
      }, null, 44, Ef)),
      (O(), T("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: s.value.arm.src,
        style: ct(m(Xn)(s.value.arm, s.value.armOrigin)),
        alt: "",
        width: s.value.arm.width,
        height: s.value.arm.height,
        decoding: "async",
        loading: "lazy",
        onLoad: g,
        onError: x
      }, null, 44, Cf))
    ], 64))], 2));
  }
}), Of = /* @__PURE__ */ ia(Pf, [["__scopeId", "data-v-e2ecfe59"]]), Ff = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-wenshoutong.webp?v=125e510258d1e978",
  import.meta.url
).href, Tf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-chenhe.webp?v=b9754e363d94b06d",
  import.meta.url
).href, Lf = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-qinzhi.webp?v=0fbba17d8e6dc4a5",
  import.meta.url
).href, If = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-liangyoufang.webp?v=6d6f95d6ef29539d",
  import.meta.url
).href, $f = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-chengtiesheng.webp?v=f7a5b12ba48194f2",
  import.meta.url
).href, qf = {
  wenshoutong: Ff,
  chenhe: Tf,
  qinzhi: Lf,
  liangyoufang: If,
  chengtiesheng: $f
}, Hf = ["src"], Uf = /* @__PURE__ */ De({
  __name: "StoryPortrait",
  props: { person: {} },
  setup(e) {
    const a = B(!1), r = B(0);
    function t() {
      a.value = !1, r.value++;
    }
    return (n, s) => (O(), T("span", { class: xa(["ember-story-portrait", { "is-failed": a.value }]) }, [a.value ? (O(), T("button", {
      key: 1,
      type: "button",
      onClick: t
    }, E(m(pe).reloadArtwork), 1)) : (O(), T("img", {
      key: r.value,
      src: m(qf)[e.person],
      alt: "",
      width: "418",
      height: "560",
      loading: "lazy",
      decoding: "async",
      onError: s[0] || (s[0] = (o) => a.value = !0)
    }, null, 40, Hf))], 2));
  }
}), Gf = /* @__PURE__ */ ia(Uf, [["__scopeId", "data-v-be9de30b"]]), Nf = { class: "ember-npc-bubble" }, Df = { class: "ember-npc-line" }, Wf = /* @__PURE__ */ De({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const a = e, r = Q(() => h1(a.reply));
    return (t, n) => (O(), T("div", Nf, [m(ui)(e.person) ? (O(), va(Of, {
      key: 0,
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ])) : m(ka)(e.person) ? (O(), va(Gf, {
      key: 1,
      person: e.person
    }, null, 8, ["person"])) : K("", !0), R("p", Df, [(O(!0), T(te, null, je(r.value, (s, o) => (O(), T("span", {
      key: o,
      class: xa({ "ember-spoken": s.spoken })
    }, E(s.text), 3))), 128))])]));
  }
}), Bf = /* @__PURE__ */ ia(Wf, [["__scopeId", "data-v-3e8dc9c6"]]), Zf = { class: "ember-campaign" }, Qf = { class: "ember-health" }, Kf = [
  "max",
  "value",
  "aria-label"
], Yf = { class: "ember-objective" }, Vf = {
  key: 0,
  class: "ember-boss"
}, Jf = [
  "max",
  "value",
  "aria-label"
], Xf = {
  key: 1,
  class: "ember-alarm",
  role: "status"
}, e2 = {
  key: 2,
  class: "ember-combat-notice",
  role: "status"
}, a2 = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, t2 = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, n2 = {
  key: 4,
  class: "ember-rest-notice",
  role: "status"
}, r2 = ["aria-label"], s2 = ["disabled", "aria-label"], i2 = ["disabled", "aria-label"], o2 = ["disabled", "aria-label"], l2 = ["aria-label"], c2 = ["aria-label"], d2 = { class: "ember-error-detail" }, h2 = ["disabled"], u2 = ["disabled"], p2 = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, f2 = { class: "ember-error-detail" }, b2 = { key: 0 }, m2 = { class: "ember-prose" }, g2 = {
  key: 8,
  class: "ember-award-notice",
  role: "status"
}, v2 = ["aria-label"], w2 = ["aria-label"], y2 = {
  key: 0,
  class: "ember-panel-heading"
}, x2 = ["aria-label"], _2 = ["aria-pressed"], k2 = ["aria-pressed"], M2 = ["disabled"], j2 = { class: "ember-prose ember-prologue" }, S2 = { class: "ember-objective-panel" }, R2 = {
  key: 0,
  class: "ember-thread"
}, A2 = { class: "ember-journal" }, z2 = { class: "ember-journal" }, E2 = { class: "ember-pack-heading" }, C2 = { key: 0 }, P2 = { key: 1 }, O2 = { class: "ember-relics" }, F2 = { key: 0 }, T2 = { key: 1 }, L2 = ["disabled", "onClick"], I2 = { class: "ember-dialogue-heading" }, $2 = { class: "ember-person-heading" }, q2 = ["disabled"], H2 = ["data-message-key"], U2 = ["data-message-key", "data-fresh-reply"], G2 = {
  key: 0,
  class: "ember-dialogue-issue"
}, N2 = { key: 1 }, D2 = { class: "ember-prose" }, W2 = {
  key: 2,
  class: "ember-prose"
}, B2 = ["aria-busy"], Z2 = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Q2 = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, K2 = { class: "ember-error-detail" }, Y2 = { key: 0 }, V2 = { class: "ember-prose" }, J2 = {
  key: 3,
  class: "ember-history-nav"
}, X2 = { class: "ember-passage-actions" }, eb = ["disabled"], ab = ["disabled", "onClick"], tb = ["disabled"], nb = ["src"], rb = { class: "ember-prose" }, sb = ["src"], ib = { class: "ember-prose" }, ob = { key: 0 }, lb = { key: 1 }, cb = { class: "ember-prose" }, db = ["disabled"], hb = ["disabled"], ub = ["disabled"], pb = { class: "ember-pause-actions" }, fb = ["aria-pressed"], bb = { class: "ember-help ember-keyboard-help" }, mb = { class: "ember-help ember-touch-help" }, gb = /* @__PURE__ */ De({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const a = e, r = wc(a.bridge, a.chatIdentity), t = yc(r), { view: n, notice: s, busy: o, blocked: l, talking: c, outgoing: i, conversationProgress: h, conversationFailure: u } = r, { current: d, dirty: f } = t, b = B(!0), _ = B(!1), w = B(!1), g = B(0), x = B(!1), k = B(!1), M = B(null), F = B(null), y = B(null), A = B("relics"), j = Q(() => y.value === "map" ? D.map : y.value === "journal" ? D.journal : y.value === "build" ? D.build : y.value === "person" ? Ze(z.value) : y.value === "passage" ? ie.passages[P.value].title : y.value === "arrival" || y.value === "prologue" ? ie.scenes.camp : y.value === "ending" ? wo.title : d.value?.phase === "reward" ? D.reward : d.value?.phase === "lost" ? D.fallen : D.pause), z = B("sanniang"), P = B("warning"), C = B(null), S = B(null), $ = B(null), I = B(""), H = Q(() => $.value?.operation && !d.value?.facts.includes($.value.fact) ? $.value.operation : null), W = Q(() => H.value?.setup ?? $.value?.body ?? ie.passages[P.value].body), Z = Q(() => !H.value && d.value ? ($.value?.ready ? $.value.witnesses ?? [] : []).filter((U) => ns(d.value, U)) : []), X = B({}), re = Q({
      get: () => X.value[z.value] ?? "",
      set: (U) => {
        X.value[z.value] = U;
      }
    }), Ee = B(null), We = B(!1), Fe = B(null), Ce = B(null), _e = B(null), da = Q((U) => {
      const G = d.value?.facts ?? [];
      return U && U.size === G.length && G.every((q) => U.has(q)) ? U : new Set(G);
    }), Ma = Q((U) => {
      const G = d.value ? zr(d.value).filter((q) => q.kind === "object").map((q) => q.target.id) : [];
      return U && U.size === G.length && G.every((q) => U.has(q)) ? U : new Set(G);
    }), La = Q(() => d.value ? {
      definition: Se[d.value.location.scene],
      location: d.value.location,
      facts: da.value,
      people: d.value.people,
      objects: Ma.value,
      completedSegments: d.value.completedSegments,
      engagement: d.value.engagement?.id,
      reading: y.value === "passage"
    } : null), at = Q(() => {
      const U = d.value?.battle;
      if (d.value?.engagement?.id !== "beacon" || !U) return "";
      switch (U.script.signal) {
        case "approach":
          return ha.signalApproach;
        case "lighting":
          return ha.signalCountdown(Math.ceil((U.objective.target - U.objective.progress) / J.hz));
        case "lit":
          return ha.signalLit;
        default:
          return "";
      }
    }), Na = Q(() => {
      const U = d.value && mr[d.value.location.scene];
      return U ? { "--scene-art": `url("${U}")` } : void 0;
    }), ve = Q(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), ke = Q(() => d.value ? Ln(d.value) : null), ja = Q(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : ke.value ? "continue" : void 0), sn = Q(() => !x.value || !d.value || !!d.value.pendingParley || !!ke.value || b.value || !!y.value || !!s.value || c.value || w.value || a.generationActive || k.value || !!M.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), oa = Q(() => d.value?.battle?.enemies.find((U) => Oe(U.kind)));
    ue(() => [oa.value?.kind === "furnacemaster" && oa.value.hp > 0 ? oa.value.phase : 0, d.value?.battle?.enemies.filter((U) => U.kind === "coupler" && U.hp > 0).length ?? 0], ([U, G], [q, Ie]) => {
      U && (U === 3 && U !== q ? Qe(Wn.burning, 5500) : G > Ie ? Qe(Wn.connected, 5500) : G < Ie && Qe(Wn.couplerBroken, 3500));
    });
    const Da = Q(() => {
      const U = d.value?.conversations[z.value] ?? [], G = r.replacingReply.value;
      return G?.person === z.value ? U.map((q) => q.id === G.turnId ? Vl(q) : q) : U;
    }), It = Q(() => d.value && !Da.value.length ? oi(d.value, z.value) : null), Sa = Q(() => Ee.value?.person === z.value ? {
      ...Ee.value,
      status: We.value ? "sending" : "failed"
    } : i.value?.person === z.value && !i.value.regenerating && !Da.value.some((U) => U.id === i.value?.actionId) ? i.value : null), tt = Q(() => Sa.value?.status === "failed"), on = Q(() => d.value && ts(d.value, z.value)), ba = B(null), mt = B(!1);
    let $t;
    function fe() {
      clearTimeout($t), $t = void 0, mt.value = !1;
    }
    const $e = B(0), la = B("");
    let ma;
    function Qe(U, G = 4e3) {
      clearTimeout(ma), la.value = U, ma = setTimeout(() => {
        la.value = "";
      }, G);
    }
    ue(() => d.value?.engagement?.id, (U, G) => {
      if (U === G || !d.value) return;
      const q = d.value.facts.includes("return_flow_tested");
      U === "sluice_bridge" && Qe(q ? Ve.bridgeTested : Ve.bridgeUntried, 6500), U === "main_valve" && Qe(q ? Ve.valveTested : Ve.valveUntried, 6500);
    }), ue(() => [d.value?.id, d.value ? Object.keys(d.value.rewards).length : 0], (U, G) => {
      U[0] && U[0] === G[0] && U[1] > G[1] && Qe(ha.cacheReady);
    });
    const N = Q(() => di.flatMap((U) => {
      const G = n.value?.data.awards.find((q) => q.key === U.key && q.runId === d.value?.id);
      return G ? [{
        fact: U.fact,
        amount: G.amount
      }] : [];
    })), qt = Q(() => N.value.reduce((U, G) => U + G.amount, 0)), ne = Q(() => d.value ? Ps(d.value).filter((U) => U.task) : []), Ht = Q(() => d.value ? oo(d.value) : null), gt = Q(() => d.value ? bo(d.value) : []), { messages: Ut, hasOlder: Gt, hasNewer: Nt, expanded: Dt, pendingVisible: Ra, rememberReading: Wt, resetLatest: Aa, older: vt, newer: Ia } = xc({
      history: Q(() => It.value ? [It.value] : Da.value),
      pending: Q(() => !!Sa.value),
      person: z,
      campaignId: Q(() => d.value?.id),
      transcript: Fe,
      freshReply: ba,
      talking: c
    }), ln = Q(() => d.value?.collection.map((U) => {
      const G = d.value.equipped.includes(U.id) ? d.value.equipped.filter((q) => q !== U.id) : [...d.value.equipped, U.id];
      return {
        ...U,
        equipped: G,
        issue: oc(d.value, G),
        dormant: d.value.equipped.includes(U.id) && !Gs(Pr(d.value), U.id)
      };
    }) ?? []), ga = Tc(() => {
      r.error.value = oe.presentationError.sound, _.value = !1;
    });
    let Bt = !1;
    function wt() {
      if (!y.value && d.value?.phase === "reward") {
        aa({ type: "leave" });
        return;
      }
      (y.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && ea();
    }
    async function yt() {
      await aa({ type: "resolve_parley" }) && (y.value = null, await Pa(), _e.value?.focus());
    }
    async function Zt() {
      ke.value ? await aa({ type: "accept_reply" }) && y.value === "person" && await ea() : await yt();
    }
    Ir(C, wt), _s(() => x.value ? y.value || d.value?.phase === "reward" ? (wt(), !0) : b.value ? !1 : (nt(), !0) : F.value?.back() ?? !1), Ir(Ce, () => {
      !o.value && !w.value && !a.generationActive && r.dismissError();
    });
    function nt() {
      b.value = !0, t.flush();
    }
    function qn() {
      y.value = null, nt();
    }
    async function Qt(U) {
      k.value || M.value || (y.value = U, U === "build" && (A.value = "relics"), await t.flush());
    }
    async function ea() {
      if (!k.value && !ke.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await yt();
          return;
        }
        !s.value && !a.generationActive && (x.value = !0, y.value = null, b.value = !1, await Pa(), _e.value?.focus());
      }
    }
    function cn() {
      x.value = !0, d.value?.pendingParley || ke.value ? (z.value = d.value?.pendingParley?.enemy ?? ke.value, y.value = "person", b.value = !1) : ea();
    }
    async function aa(U) {
      if (k.value || M.value) return !1;
      k.value = !0, U.type === "interact" && d.value && (M.value = Se[d.value.location.scene].exits.find((q) => q.id === U.id)?.to ?? null);
      let G = !1;
      try {
        return await t.flush() ? (G = await r.act(U), G && (t.sync(), U.type === "relic" && Qe(ha.received(ot[U.id].name, !!d.value?.equipped.includes(U.id))), !y.value && !b.value && (await Pa(), _e.value?.focus())), G) : !1;
      } finally {
        k.value = !1, G || (M.value = null);
      }
    }
    function Hn(U) {
      U === M.value && (M.value = null);
    }
    async function dn(U) {
      await aa({
        type: d.value ? "restart" : "start",
        ...U,
        outfit: ve.value
      }) && (x.value = !0, y.value = "prologue");
    }
    function hn() {
      b.value = !0, y.value = null, x.value = !1, t.flush();
    }
    async function ee(U) {
      if (!d.value || k.value || M.value) return;
      fe();
      const G = [...ri(d.value), ...rn(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((Ie) => Ie.target.id === U), q = G?.kind === "object" ? G.target : null;
      if (q?.kind === "person" || q?.kind === "enemy" || q?.kind === "resident") {
        await Te(q.kind === "enemy" ? q.enemy : q.person);
        return;
      }
      if (q?.kind === "inspect" && (P.value = q.passage, I.value = U, $.value = ic(d.value, q.passage), H.value)) {
        y.value = "passage", await t.flush();
        return;
      }
      await aa({
        type: "interact",
        id: U
      }) && (q?.kind === "inspect" ? y.value = "passage" : q?.kind === "rest" && (mt.value = !0, $t = setTimeout(fe, 3e3)));
    }
    async function se() {
      !H.value || !await aa({
        type: "interact",
        id: I.value
      }) || (await Pa(), S.value && (S.value.scrollTop = 0, S.value.focus({ preventScroll: !0 })));
    }
    async function Te(U) {
      !d.value || k.value || !ns(d.value, U) || (z.value = U, y.value = "person", await t.flush() && !d.value.conversations[U].length && await r.act({
        type: "greet",
        person: U
      }) && t.sync());
    }
    async function Le() {
      const U = z.value, G = re.value.trim();
      if (!(l.value || We.value || !G || ja.value)) {
        X.value[U] = "", Ee.value = {
          person: U,
          text: G
        }, We.value = !0, Aa();
        try {
          if (!await t.flush()) return;
          const q = r.talk(U, G);
          Ee.value = null, await q && t.sync();
        } finally {
          We.value = !1;
        }
      }
    }
    async function xt() {
      if (!(l.value || We.value || !d.value))
        if (Aa(), tt.value && Sa.value) {
          const U = Sa.value, G = r.talk(U.person, U.text);
          Ee.value = null, await G && t.sync();
        } else {
          const U = ts(d.value, z.value);
          U && await r.talk(z.value, U.player, U.id) && t.sync();
        }
    }
    async function _t() {
      await t.recover() && (b.value = !0, g.value++);
    }
    return ue(() => a.generationActive, (U) => {
      U && nt();
    }), ue(() => [d.value?.pendingParley, ke.value], ([U, G]) => {
      (U || G) && (z.value = U?.enemy ?? G, y.value = "person");
    }, { immediate: !0 }), ue(_, (U) => {
      ga.enable(U);
    }), ue(d, (U) => {
      _.value && U?.battle && ga.tick(U.battle);
    }), ue(() => n.value?.data, (U, G) => {
      if (!U?.active || !G?.active || U.active.id !== G.active.id) {
        $e.value = 0;
        return;
      }
      $e.value += U.awards.filter((rt) => !G.awards.some((st) => st.key === rt.key)).reduce((rt, st) => rt + st.amount, 0);
      const q = new Set(G.active.facts), Ie = new Set(U.active.facts);
      !q.has("chapter_completed") && Ie.has("chapter_completed") && U.active.chapter === "outpost" ? y.value = "ending" : !q.has("captives_arrived") && Ie.has("captives_arrived") && (y.value = "arrival");
    }), ue(() => d.value?.id, () => {
      X.value = {}, Ee.value = null;
    }), ue([
      x,
      b,
      y,
      s,
      () => d.value?.id,
      () => d.value?.location.scene
    ], fe), ue([y, z], () => {
      ba.value = null;
    }), ue(s, (U) => {
      U && (ba.value = null);
    }), ue(() => [z.value, Da.value], ([U, G], [q, Ie]) => {
      const rt = G.filter((st) => st.kind === "dialogue").at(-1);
      U === q && y.value === "person" && rt && !Ie.some((st) => st.id === rt.id) && (ba.value = rt.id);
    }), ft(async () => {
      await r.read(), Bt = !0;
    }), vr(() => {
      Bt && !f.value && r.read();
    }), An(() => {
      ba.value = null, fe(), nt();
    }), et(() => {
      clearTimeout(ma), fe(), t.dispose(), r.dispose(), ga.dispose();
    }), (U, G) => (O(), T("section", Zf, [
      x.value ? K("", !0) : (O(), va(Up, {
        key: 0,
        ref_key: "entry",
        ref: F,
        campaign: m(d),
        ready: !!m(n)?.ready,
        busy: m(o),
        blocked: m(l) || e.generationActive,
        onStart: dn,
        onContinue: cn
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      x.value && m(d) && La.value ? (O(), va(ah, {
        key: g.value,
        ref_key: "field",
        ref: _e,
        world: La.value,
        traveler: m(d).traveler,
        paused: sn.value,
        transitioning: !!M.value,
        weapon: m(d).weapon,
        outfit: ve.value,
        battle: m(d).battle,
        onInput: m(t).input,
        onInteract: ee,
        onPause: nt,
        onResume: ea,
        onError: G[0] || (G[0] = (q) => w.value = !0),
        onReady: Hn
      }, {
        status: Un(() => [m(d) ? (O(), T(te, { key: 0 }, [R("div", Qf, [R("meter", {
          min: 0,
          max: m(J).maxHp,
          value: m(d).hp,
          "aria-label": m(oe).hp
        }, null, 8, Kf), R("span", null, E(Math.ceil(m(d).hp)) + " / " + E(m(J).maxHp), 1)]), R("p", Yf, E(m(nr)(m(d))), 1)], 64)) : K("", !0)]),
        threat: Un(() => [
          x.value && oa.value && !y.value ? (O(), T("div", Vf, [R("strong", null, E(m(rr)[oa.value.kind]), 1), R("meter", {
            min: "0",
            max: oa.value.maxHp,
            value: oa.value.hp,
            "aria-label": m(rr)[oa.value.kind]
          }, null, 8, Jf)])) : K("", !0),
          x.value && at.value && !y.value ? (O(), T("div", Xf, E(at.value), 1)) : K("", !0),
          x.value && la.value && m(d)?.phase === "battle" && !y.value && !b.value && !m(s) ? (O(), T("p", e2, E(la.value), 1)) : K("", !0)
        ]),
        overlay: Un(() => [...G[23] || (G[23] = [R("span", null, null, -1)])]),
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
      ])) : K("", !0),
      x.value && M.value && !m(s) && !w.value && !y.value && !b.value ? (O(), T("aside", a2, E(m(ie).transition(m(ie).scenes[M.value])), 1)) : K("", !0),
      x.value && mt.value && !y.value && !b.value && !m(s) ? (O(), T("p", t2, E(m(ie).rested), 1)) : x.value && la.value && m(d)?.phase === "exploration" && !y.value && !b.value && !m(s) ? (O(), T("p", n2, E(la.value), 1)) : K("", !0),
      x.value && m(d) && y.value !== "passage" && !m(d).pendingParley && !ke.value ? (O(), T("nav", {
        key: 5,
        class: "ember-tools",
        "aria-label": m(D).prepare
      }, [
        R("button", {
          type: "button",
          disabled: k.value || !!M.value,
          "aria-label": m(D).map,
          onClick: G[1] || (G[1] = (q) => Qt("map"))
        }, [na(Qa, { name: "map" }), R("span", null, E(m(D).map), 1)], 8, s2),
        R("button", {
          type: "button",
          disabled: k.value || !!M.value,
          "aria-label": m(D).build,
          onClick: G[2] || (G[2] = (q) => Qt("build"))
        }, [na(Qa, { name: "bag" }), R("span", null, E(m(D).build), 1)], 8, i2),
        R("button", {
          type: "button",
          disabled: k.value || !!M.value,
          "aria-label": m(D).journal,
          onClick: G[3] || (G[3] = (q) => Qt("journal"))
        }, [na(Qa, { name: "journal" }), R("span", null, E(m(D).journal), 1)], 8, o2),
        R("button", {
          type: "button",
          "aria-label": m(D).pause,
          onClick: qn
        }, [na(Qa, { name: "pause" }), R("span", null, E(m(D).pause), 1)], 8, l2)
      ], 8, r2)) : K("", !0),
      m(s) || w.value || e.generationActive ? (O(), T("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: Ce,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": m(D).noticeTitle,
        tabindex: "-1"
      }, [R("p", d2, E(w.value ? m(D).renderError : e.generationActive ? m(D).generation : m(s)), 1), w.value ? (O(), T("button", {
        key: 0,
        type: "button",
        onClick: G[4] || (G[4] = (q) => {
          w.value = !1, g.value++;
        })
      }, E(m(D).reload), 1)) : m(r).dataInvalid.value && !e.generationActive ? (O(), T(te, { key: 1 }, [R("p", null, E(m(D).rebuildWarning), 1), R("button", {
        type: "button",
        disabled: m(o),
        onClick: G[5] || (G[5] = (...q) => m(r).rebuild && m(r).rebuild(...q))
      }, E(m(D).rebuild), 9, h2)], 64)) : e.generationActive ? K("", !0) : (O(), T("button", {
        key: 2,
        type: "button",
        disabled: m(o),
        onClick: G[6] || (G[6] = (q) => m(r).recoveryRequired.value ? _t() : m(r).dismissError())
      }, E(m(r).recoveryRequired.value ? m(D).recover : m(D).acknowledge), 9, u2))], 8, c2)) : K("", !0),
      m(u) && !m(s) && (y.value !== "person" || z.value !== m(u).person) ? (O(), T("aside", p2, [
        R("strong", null, E(m(Ze)(m(u).person)), 1),
        R("p", f2, E(m(Ka)(m(u))), 1),
        m(u).text ? (O(), T("details", b2, [R("summary", null, E(m(D).receivedReply), 1), R("p", m2, E(m(u).text), 1)])) : K("", !0),
        R("button", {
          type: "button",
          onClick: G[7] || (G[7] = (...q) => m(r).dismissConversationFailure && m(r).dismissConversationFailure(...q))
        }, E(m(D).acknowledge), 1)
      ])) : K("", !0),
      x.value && $e.value && !y.value && !b.value && !m(s) ? (O(), T("aside", g2, [R("span", null, [R("small", null, E(m(D).rewardTitle), 1), R("strong", null, E(m(D).rewardReceived($e.value)), 1)]), R("button", {
        type: "button",
        "aria-label": m(D).rewardDismiss,
        onClick: G[8] || (G[8] = (q) => $e.value = 0)
      }, "×", 8, v2)])) : K("", !0),
      x.value && m(d) && !m(s) && !w.value && !e.generationActive && (y.value || b.value || m(d).phase === "reward" || m(d).phase === "lost") ? (O(), T("div", {
        key: 9,
        class: "ember-curtain",
        style: ct(y.value === "person" ? Na.value : void 0)
      }, [R("section", {
        ref_key: "dialog",
        ref: C,
        class: xa(["ember-panel", {
          "ember-wide": y.value === "map" || y.value === "build" && A.value === "wardrobe",
          "ember-map-panel": y.value === "map",
          "ember-wardrobe-panel": y.value === "build" && A.value === "wardrobe",
          "ember-dialogue": y.value === "person",
          "ember-passage": y.value === "passage"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": j.value,
        tabindex: "-1"
      }, [y.value !== "map" && y.value !== "person" ? (O(), T("header", y2, [
        R("h2", null, E(j.value), 1),
        y.value === "build" ? (O(), T("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": m(D).build
        }, [R("button", {
          type: "button",
          "aria-pressed": A.value === "relics",
          onClick: G[9] || (G[9] = (q) => A.value = "relics")
        }, E(m(Me).equipment), 9, _2), R("button", {
          type: "button",
          "aria-pressed": A.value === "wardrobe",
          onClick: G[10] || (G[10] = (q) => A.value = "wardrobe")
        }, E(m(D).wardrobe), 9, k2)], 8, x2)) : K("", !0),
        y.value !== "prologue" && y.value !== "passage" && m(d).pendingParley?.decision !== "attack" && (y.value || m(d).phase !== "lost" && m(d).phase !== "reward") ? (O(), T("button", {
          key: 1,
          type: "button",
          disabled: k.value || !!m(d).pendingParley && m(l),
          onClick: ea
        }, E(m(D).close), 9, M2)) : K("", !0)
      ])) : K("", !0), y.value === "map" ? (O(), va(Zh, {
        key: 1,
        campaign: m(d),
        onClose: ea
      }, null, 8, ["campaign"])) : y.value === "prologue" ? (O(), T(te, { key: 2 }, [R("p", j2, E(m(D).opening), 1), R("button", {
        class: "ember-primary",
        type: "button",
        onClick: ea
      }, E(m(D).start), 1)], 64)) : y.value === "journal" ? (O(), T(te, { key: 3 }, [
        R("p", S2, E(m(nr)(m(d))), 1),
        (O(!0), T(te, null, je(ne.value, (q) => (O(), T("section", {
          key: q.person,
          class: "ember-thread"
        }, [R("h3", null, E(q.name) + " · " + E(q.title), 1), R("p", null, E(q.task), 1)]))), 128)),
        Ht.value ? (O(), T("section", R2, [R("h3", null, E(Ht.value.title), 1), R("p", null, E(Ht.value.task), 1)])) : K("", !0),
        (O(!0), T(te, null, je(gt.value, (q) => (O(), T("section", {
          key: q.person,
          class: "ember-thread"
        }, [R("h3", null, E(q.name) + " · " + E(q.title), 1), R("p", null, E(q.task), 1)]))), 128)),
        R("ol", A2, [(O(!0), T(te, null, je(m(d).facts, (q) => (O(), T("li", { key: q }, E(m(en)[q]), 1))), 128))]),
        N.value.length ? (O(), T(te, { key: 1 }, [
          R("h3", null, E(m(D).journeyReward(qt.value)), 1),
          R("ul", z2, [(O(!0), T(te, null, je(N.value, (q) => (O(), T("li", { key: q.fact }, [He(E(m(en)[q.fact]) + " ", 1), R("strong", null, E(m(D).rewardReceived(q.amount)), 1)]))), 128))]),
          R("small", null, E(m(D).rewardRule), 1)
        ], 64)) : K("", !0)
      ], 64)) : y.value === "build" ? (O(), T(te, { key: 4 }, [A.value === "wardrobe" && m(n) ? (O(), va(bu, {
        key: 0,
        data: m(n).data,
        traveler: m(d).traveler,
        balance: m(n).balance,
        blocked: m(l),
        weapon: m(d).weapon,
        onCommand: aa
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : (O(), T(te, { key: 1 }, [
        R("div", E2, [R("strong", null, E(m(d).traveler.name), 1), R("span", null, [
          He(E(m(Me).genders[m(d).traveler.gender]), 1),
          m(d).traveler.appearanceAge ? (O(), T(te, { key: 0 }, [He(" · " + E(m(an)[m(d).traveler.appearanceAge]), 1)], 64)) : K("", !0),
          He(" · " + E(m(Me).identityRole), 1)
        ])]),
        R("small", null, E(m(D).slots(m(d).equipped.length, m(J).relicSlots)), 1),
        R("p", null, E(m(Ba)[m(d).weapon].name) + " · " + E(m(go)(m(d).weapon)), 1),
        m(ei)(m(d)) ? K("", !0) : (O(), T("p", C2, E(m(ha).restBuild), 1)),
        m(d).collection.length ? K("", !0) : (O(), T("p", P2, E(m(D).emptyBuild), 1)),
        R("div", O2, [(O(!0), T(te, null, je(ln.value, (q) => (O(), T("article", { key: q.id }, [
          na(Qa, { name: q.id }, null, 8, ["name"]),
          R("h3", null, [He(E(m(ot)[q.id].name) + " ", 1), R("small", null, E(m(oe).rank(q.rank)), 1)]),
          R("p", null, E(m(ot)[q.id].detail), 1),
          q.issue === "capacity" ? (O(), T("small", F2, E(m(D).loadoutIssue.capacity), 1)) : K("", !0),
          q.dormant ? (O(), T("small", T2, E(m(ha).dormantRelic), 1)) : K("", !0),
          R("button", {
            type: "button",
            disabled: m(l) || !!q.issue,
            onClick: (Ie) => aa({
              type: "loadout",
              equipped: q.equipped
            })
          }, E(m(d).equipped.includes(q.id) ? m(D).takeOff : m(D).putOn), 9, L2)
        ]))), 128))])
      ], 64))], 64)) : y.value === "person" ? (O(), T(te, { key: 5 }, [
        R("header", I2, [
          R("div", $2, [R("h2", null, E(m(Ze)(z.value)), 1), R("small", null, E(m(ie).scenes[m(d).location.scene]), 1)]),
          (O(), va(rp, {
            key: z.value,
            campaign: m(d),
            person: z.value,
            draft: re.value,
            "memory-state": m(n)?.memories?.[z.value],
            blocked: m(l),
            onRetryMemory: G[11] || (G[11] = (q) => m(r).retryMemory(z.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !ke.value && m(d).pendingParley?.decision !== "attack" ? (O(), T("button", {
            key: 0,
            type: "button",
            disabled: !!m(d).pendingParley && m(l),
            onClick: ea
          }, E(m(D).close), 9, q2)) : K("", !0)
        ]),
        R("div", {
          ref_key: "transcript",
          ref: Fe,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: G[16] || (G[16] = (...q) => m(Wt) && m(Wt)(...q))
        }, [
          m(Gt) ? (O(), T("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: G[12] || (G[12] = (...q) => m(vt) && m(vt)(...q))
          }, E(m(pe).older), 1)) : K("", !0),
          (O(!0), T(te, null, je(m(Ut), (q) => (O(), T(te, { key: q.key }, [q.side === "player" ? (O(), T("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": q.key
          }, [R("small", null, E(m(d).traveler.name), 1), He(E(q.turn.player), 1)], 8, H2)) : (O(), T("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": q.key,
            "data-fresh-reply": ba.value === q.turn.id
          }, [q.turn.issue === "action_rejected" || q.turn.issue === "clothing_rejected" || q.turn.issue === "reply_invalid" || q.turn.issue === "reply_incomplete" ? (O(), T("p", G2, E(m(pe).issues[q.turn.issue]), 1)) : K("", !0), q.turn.kind === "receipt" && q.turn.issue === "reply_invalid" ? (O(), T("details", N2, [R("summary", null, E(m(pe).rawReply), 1), R("p", D2, E(q.turn.reply), 1)])) : q.turn.kind === "receipt" ? (O(), T("p", W2, E(q.turn.reply), 1)) : (O(), T(te, { key: 3 }, [
            na(Bf, {
              person: z.value,
              reply: q.turn.reply,
              performance: q.turn.performance,
              animate: ba.value === q.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            na(i1, {
              campaign: m(d),
              person: z.value,
              turn: q.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            q.turn.clothing ? (O(), va(d1, {
              key: 0,
              clothing: q.turn.clothing
            }, null, 8, ["clothing"])) : K("", !0)
          ], 64))], 8, U2))], 64))), 128)),
          m(Ra) && Sa.value ? (O(), T(te, { key: 1 }, [R("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Sa.value.status === "sending"
          }, [R("small", null, E(m(d).traveler.name), 1), He(E(Sa.value.text), 1)], 8, B2), tt.value ? (O(), T("p", Z2, E(m(pe).sendFailed), 1)) : K("", !0)], 64)) : K("", !0),
          !m(Nt) && m(u)?.person === z.value && !Da.value.some((q) => q.id === m(u)?.actionId) ? (O(), T("div", Q2, [
            R("p", K2, E(m(Ka)(m(u))), 1),
            m(u).text ? (O(), T("details", Y2, [R("summary", null, E(m(D).receivedReply), 1), R("p", V2, E(m(u).text), 1)])) : K("", !0),
            R("button", {
              type: "button",
              onClick: G[13] || (G[13] = (...q) => m(r).dismissConversationFailure && m(r).dismissConversationFailure(...q))
            }, E(m(D).acknowledge), 1)
          ])) : K("", !0),
          m(Dt) ? (O(), T("nav", J2, [m(Nt) ? (O(), T("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: G[14] || (G[14] = (...q) => m(Ia) && m(Ia)(...q))
          }, E(m(pe).newer), 1)) : K("", !0), R("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: G[15] || (G[15] = (...q) => m(Aa) && m(Aa)(...q))
          }, E(m(pe).latest), 1)])) : K("", !0)
        ], 544),
        m(h)?.person === z.value ? (O(), va(Xp, {
          key: 0,
          phase: m(h).phase,
          "started-at": m(h).startedAt
        }, null, 8, ["phase", "started-at"])) : K("", !0),
        na(Qp, {
          modelValue: re.value,
          "onUpdate:modelValue": G[17] || (G[17] = (q) => re.value = q),
          blocked: m(l) || We.value || e.generationActive,
          talking: m(c),
          "can-regenerate": !!on.value || tt.value,
          retrying: tt.value,
          conclusion: ja.value,
          onSend: Le,
          onRegenerate: xt,
          onContinue: Zt,
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
      ], 64)) : y.value === "passage" ? (O(), T(te, { key: 6 }, [R("div", {
        ref_key: "passageContent",
        ref: S,
        class: "ember-passage-body",
        tabindex: "0"
      }, [(O(!0), T(te, null, je(W.value.split(`

`), (q, Ie) => (O(), T("p", {
        key: Ie,
        class: "ember-prose"
      }, E(q), 1))), 128))], 512), R("footer", X2, [
        H.value ? (O(), T("button", {
          key: 0,
          class: "ember-primary",
          type: "button",
          disabled: m(l) || k.value,
          onClick: se
        }, E(H.value.label), 9, eb)) : K("", !0),
        (O(!0), T(te, null, je(Z.value, (q) => (O(), T("button", {
          key: q,
          type: "button",
          disabled: m(l) || k.value,
          onClick: (Ie) => Te(q)
        }, E(m(Ve).talk(m(Ze)(q))), 9, ab))), 128)),
        R("button", {
          type: "button",
          disabled: k.value,
          onClick: ea
        }, E(m(Ve).leave), 9, tb)
      ])], 64)) : y.value === "arrival" ? (O(), T(te, { key: 7 }, [
        R("img", {
          class: "ember-story-art",
          src: m(bs).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, nb),
        R("p", rb, E(m(D).received), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          onClick: ea
        }, E(m(D).resume), 1)
      ], 64)) : y.value === "ending" ? (O(), T(te, { key: 8 }, [
        R("img", {
          class: "ember-story-art",
          src: m(bs).ending,
          alt: "",
          decoding: "async"
        }, null, 8, sb),
        R("h2", null, E(m(D).endingTitle), 1),
        R("p", ib, E(m(D).ending), 1),
        R("p", null, E(m(D).freeTime), 1),
        m($s)(m(d)).optionalRoots ? (O(), T("p", ob, E(m(D).optionalRoots), 1)) : K("", !0),
        qt.value ? (O(), T("strong", lb, E(m(D).journeyReward(qt.value)), 1)) : K("", !0),
        R("small", null, E(m(D).continued), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          onClick: ea
        }, E(m(D).remain), 1)
      ], 64)) : m(d).phase === "reward" ? (O(), va(Fc, {
        key: 9,
        campaign: m(d),
        blocked: m(l),
        onChoose: G[18] || (G[18] = (q, Ie) => aa({
          type: "relic",
          id: q,
          ...Ie ? { replace: Ie } : {}
        })),
        onLeave: G[19] || (G[19] = (q) => aa({ type: "leave" }))
      }, null, 8, ["campaign", "blocked"])) : m(d).phase === "lost" ? (O(), T(te, { key: 10 }, [
        R("p", cb, E(m(D).fallenDetail), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          disabled: m(l),
          onClick: G[20] || (G[20] = (q) => aa({ type: "retry" }))
        }, E(m(D).retry), 9, db),
        R("button", {
          type: "button",
          disabled: m(l),
          onClick: G[21] || (G[21] = (q) => aa({ type: "retreat" }))
        }, E(m(D).retreat), 9, hb)
      ], 64)) : (O(), T(te, { key: 11 }, [
        R("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!m(s) || e.generationActive,
          onClick: ea
        }, E(m(D).resume), 9, ub),
        R("div", pb, [R("button", {
          type: "button",
          "aria-pressed": _.value,
          onClick: G[22] || (G[22] = (q) => _.value = !_.value)
        }, E(m(D).sound), 9, fb)]),
        R("details", null, [
          R("summary", null, E(m(Me).controls), 1),
          R("p", bb, E(m(D).controls), 1),
          R("p", mb, E(m(D).touchControls), 1)
        ]),
        R("button", {
          type: "button",
          onClick: hn
        }, E(m(Me).title), 1)
      ], 64))], 10, w2)], 4)) : K("", !0)
    ]));
  }
}), Ob = gb;
export {
  Ob as default
};
