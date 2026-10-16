/* eslint-disable */
import { $ as ca, A as $r, D as Fe, E as at, I as Mn, J as gs, M as zt, N as pr, P as ea, Q as Nn, R as ga, S as $, T as Oe, U as ke, V as z, W as Un, X as ue, at as Wt, b as vt, c as Po, ct as Ao, d as mr, dt as Ia, ft as P, h as ee, i as Tr, l as vs, lt as g, m as jt, nt as zo, p as Io, q as ys, r as bs, rt as W, u as $o, ut as wt, v as G, x as Y, y as k } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as st } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as To, r as Fn, t as Lo } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as Oo, t as jo } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as No } from "./xiaobai-os-constants-CDXgazQ7.js";
import { $ as bt, Bt as Lr, Ct as Uo, D as ws, Dt as Fo, E as Aa, Et as xs, Mt as _s, O as Or, Ot as jr, Pt as Do, Q as gr, Rt as Zo, S as Nr, St as Bo, T as qo, Tt as vr, Wt as xt, _ as Wo, d as Ho, et as Vo, h as Go, i as Yo, kt as Qo, n as Ms, o as vn, p as yr, rt as br, s as Ko, ut as ks, w as Xo, wt as ln, xt as Jo, y as Qn, zt as ei } from "./xiaobai-os-three.module-CEf4RC2U.js";
import { t as Ss } from "./xiaobai-os-BufferGeometryUtils-Dxy-eeb2.js";
import { $ as $a, A as wr, B as ti, C as Rs, D as Va, E as kn, F as ht, G as ai, H as Jt, I as Kn, J as nt, K as ni, L as v, M as Ve, N as Dn, O as se, P as Xn, Q as ze, R as _t, S as Ga, T as Ur, U as It, V as ri, W as pe, X as Kt, Y as K, Z as Cs, _ as si, a as Ht, at as oi, b as ii, c as Me, ct as li, d as Jn, et as Es, f as Zn, g as Ps, h as As, i as da, it as zs, j as xr, k as ci, l as B, lt as Is, m as di, n as er, nt as ui, o as Yt, ot as Ne, p as hi, q as $s, r as Pa, rt as fi, s as pi, st as Ts, t as oe, tt as mi, u as Ya, v as gi, w as _r, x as Ls, y as ua, z as Os } from "./xiaobai-os-copy-_MN2tyQS.js";
import { t as vi } from "./xiaobai-os-GLTFLoader-cY1YnDku.js";
import { t as yi } from "./xiaobai-os-SkeletonUtils-BL8jdlUp.js";
function Sn(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Fr(e, t, r) {
  const a = [...t], n = [];
  for (; a.length && n.length < r; ) n.push(a.splice(Math.floor(Sn(e) * a.length), 1)[0]);
  return n;
}
function Bn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function ge(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function je(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var bi = 1e-9;
function ha(e, t, r) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (r + 0.5) * e.cellSize
  };
}
function fa(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function js(e, t) {
  const r = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!r || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((c) => c.length !== r || /[^.# ]/.test(c))) && je("map_invalid");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const c of e.gates) {
    (!c.id || n.has(c.id) || !c.cells.length) && je("map_invalid"), n.add(c.id);
    const o = !t.has(c.id);
    o && l.add(c.id);
    for (const { column: u, row: h } of c.cells) {
      (!Number.isInteger(u) || !Number.isInteger(h) || u < 0 || u >= r || e.rows[h]?.[u] !== ".") && je("map_invalid");
      const d = h * r + u;
      s.has(d) && je("map_invalid"), s.add(d), o && i.add(d);
    }
  }
  for (const c of t) n.has(c) || je("gate_unknown");
  return {
    map: e,
    columns: r,
    rows: a,
    closedGates: l,
    blocked(c, o) {
      return c < 0 || c >= r || o < 0 || o >= a || e.rows[o][c] !== "." || i.has(o * r + c);
    }
  };
}
function yn(e, t, r, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), s = Math.max(r - e.y, 0, e.y - r - a);
  return n * n + s * s;
}
function cn(e, t, r) {
  const a = r.x - t.x, n = r.y - t.y, s = a * a + n * n, i = s === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / s));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function Ns(e, t, r, a, n) {
  let s = 0, i = 1;
  for (const [l, c, o] of [[
    e.x,
    t.x - e.x,
    r
  ], [
    e.y,
    t.y - e.y,
    a
  ]]) if (c === 0) {
    if (l <= o || l >= o + n) return !1;
  } else {
    const u = (o - l) / c, h = (o + n - l) / c;
    if (s = Math.max(s, Math.min(u, h)), i = Math.min(i, Math.max(u, h)), s >= i) return !1;
  }
  return s < i;
}
function wi(e, t, r, a, n) {
  return Ns(e, t, r, a, n) ? 0 : Math.min(yn(e, r, a, n), yn(t, r, a, n), cn({
    x: r,
    y: a
  }, e, t), cn({
    x: r + n,
    y: a
  }, e, t), cn({
    x: r,
    y: a + n
  }, e, t), cn({
    x: r + n,
    y: a + n
  }, e, t));
}
function De(e, t, r, a = 0) {
  (![
    t.x,
    t.y,
    r.x,
    r.y,
    a
  ].every(Number.isFinite) || a < 0) && je("input_invalid");
  const { map: n } = e, s = n.cellSize, i = fa(n, {
    x: Math.min(t.x, r.x) - a,
    y: Math.min(t.y, r.y) - a
  }), l = fa(n, {
    x: Math.max(t.x, r.x) + a,
    y: Math.max(t.y, r.y) + a
  });
  for (let c = i.row; c <= l.row; c++) for (let o = i.column; o <= l.column; o++) {
    if (!e.blocked(o, c)) continue;
    const u = n.origin.x + o * s, h = n.origin.y + c * s;
    if (a === 0 ? Ns(t, r, u, h, s) || yn(t, u, h, s) === 0 && yn(r, u, h, s) === 0 : wi(t, r, u, h, s) < a * a - bi) return !1;
  }
  return !0;
}
var $t = (e, t, r) => De(e, t, t, r);
function Mr(e, t, r, a) {
  [r.x, r.y].every(Number.isFinite) || je("input_invalid"), $t(e, t, a) || je("position_blocked");
  const n = Math.hypot(r.x, r.y);
  if (n === 0) return;
  const s = Math.ceil(n / (e.map.cellSize / 4)), i = r.x / s, l = r.y / s;
  for (let c = 0; c < s; c++) {
    const o = {
      x: t.x + i,
      y: t.y + l
    };
    if (De(e, t, o, a)) {
      Object.assign(t, o);
      continue;
    }
    const u = Math.abs(i) >= Math.abs(l) ? ["x", "y"] : ["y", "x"];
    for (const h of u) {
      const d = {
        ...t,
        [h]: t[h] + (h === "x" ? i : l)
      };
      De(e, t, d, a) && Object.assign(t, d);
    }
  }
}
function fn(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function ye(e) {
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
  ].every(Number.isInteger)) && je("map_invalid");
  const s = t.features.map((u) => u.id);
  new Set(s).size !== s.length && je("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root",
    "kiln",
    "hoist",
    "cliff"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && je("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + r.width || u.z + u.depth / 2 > a.y + r.depth) && je("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([h, d], p) => !Number.isFinite(h) || !Number.isFinite(d) || p > 0 && h === u.points[p - 1][0] && d === u.points[p - 1][1])) && je("map_invalid");
  const i = [];
  for (let u = 0; u < r.depth; u++) {
    let h = "";
    for (let d = 0; d < r.width; d++) {
      const p = {
        x: a.x + d + 0.5,
        y: a.y + u + 0.5
      };
      h += t.features.some((m) => m.kind !== "arch" && fn(p, m.footprint) && (m.kind !== "bridge" || Math.abs(p.y - m.footprint.z) >= m.footprint.depth / 2 - 1)) ? "#" : ".";
    }
    i.push(h);
  }
  const l = {
    origin: a,
    cellSize: 1,
    rows: i,
    gates: t.gates.map((u) => {
      const h = u.footprint, d = [];
      for (let p = h.z - h.depth / 2 - a.y; p < h.z + h.depth / 2 - a.y; p++) for (let m = h.x - h.width / 2 - a.x; m < h.x + h.width / 2 - a.x; m++) d.push({
        column: m,
        row: p
      });
      return {
        id: u.id,
        cells: d
      };
    })
  }, c = js(l, new Set(l.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !$t(c, u, K.playerRadius)) && je("map_invalid");
  const o = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || o.has(u.id)) && je("map_invalid"), o.add(u.id);
  return {
    ...e,
    map: l,
    gates: t.gates
  };
}
var xi = ye({
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
    _r.object
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
    ].map((e) => Dn.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), _i = ye({
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
}), Mi = ye({
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
}), ki = ye({
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
}), Si = ye({
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
}), Ri = ye({
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
}), Ci = ye({
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
      condition: { all: ua }
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
}), Ei = ye({
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
}), Pi = Object.fromEntries(Object.entries(Xn).map(([e, t]) => {
  const r = t, { width: a, depth: n } = r, s = a / 2, i = n / 2, l = [v("west-wall", "wall", -s + 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  }), v("east-wall", "wall", s - 0.5, 0, 1, n, {
    height: 3.8,
    wallUse: "room"
  })];
  for (const o of ["north", "south"]) {
    const u = (o === "north" ? -1 : 1) * (i - 0.5);
    if (r.doors.some((h) => h.side === o)) {
      l.push(v(`${o}-door`, "door", 0, u, 4, 1));
      for (const h of [-1, 1]) l.push(v(`${o}-${h}`, "wall", h * (s + 2) / 2, u, s - 2, 1, {
        height: 3.8,
        wallUse: "room"
      }));
    } else l.push(v(`${o}-wall`, "wall", 0, u, a, 1, {
      height: 3.8,
      wallUse: "room"
    }));
  }
  const c = r.rest ? r.furniture.find((o) => o.kind === "bed").footprint : null;
  return [e, ye({
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
    objects: [...r.objects ?? [], ...c ? [{
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
      features: [...l, ...r.furniture]
    }
  })];
})), Ai = ye({
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
}), zi = ye({
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
}), Ii = ye({
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
}), $i = ye({
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
}), Ti = ye({
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
}), Li = ye({
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
}), Oi = ye({
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
}), ji = ye({
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
}), Ni = {
  south_street: Ai,
  workshop_street: zi,
  heat_station: Ii,
  pipe_gallery: $i,
  sluice_bridge: Ti,
  main_valve: Li,
  deep_waterway: Oi,
  coal_store: ji
}, Ue = {
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
}, va = Object.keys(Ue), Ui = ye({
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
}), Fi = ye({
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
}), Di = ye({
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
}), Zi = ye({
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
}), Bi = ye({
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
}), qi = ye({
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
}), Wi = ye({
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
}), Hi = ye({
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
}), Vi = ye({
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
}), Gi = {
  furnace_terrace: Ui,
  snow_road: Fi,
  old_kiln: Di,
  return_bridge: Zi,
  furnace_quarter: Bi,
  furnace_lift: qi,
  furnace_scaffold: Wi,
  furnace_antechamber: Hi,
  furnace_heart: Vi
}, Yi = {
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
function Qi(e) {
  const t = Yi[e.id];
  return t ? ye({
    ...e,
    anchors: {
      ...e.anchors,
      ...t.anchors
    },
    exits: [...e.exits, ...t.exits],
    objects: [...e.objects, ...t.objects]
  }) : e;
}
var za = {
  camp: xi,
  crossroads: _i,
  gate: Mi,
  beacon: ki,
  waterway: Si,
  cells: Ri,
  hall: Ci,
  roots: Ei,
  ...Pi,
  ...Ni,
  ...Gi
};
for (const e of Object.keys(za)) za[e] = Qi(za[e]);
for (const e of va) {
  const { scene: t, anchor: r } = Ue[e], a = za[t];
  za[t] = ye({
    ...a,
    objects: [...a.objects, {
      id: e,
      anchor: r,
      kind: "resident",
      person: e
    }]
  });
}
var Se = za;
function Dr(e) {
  return !e || Se[e.location.scene].safe && e.phase === "exploration";
}
var At = {
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
function qn(e, t) {
  const r = At[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || r.achievement !== null && e.awards.some((a) => a.key === r.achievement);
}
var Re = (e, t, r = 0) => ({
  family: e,
  chapter: r,
  ...t ? { requires: [t] } : {}
}), ce = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), Ta = {
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
  riposte: ce("blade"),
  "shield-break": ce("blade"),
  "cleave-wave": ce("blade", 1),
  duelist: ce("blade"),
  "blood-dance": ce("blade"),
  valor: ce("blade", 1),
  ricochet: ce("bow"),
  "split-arrow": ce("bow"),
  pinning: ce("bow"),
  "distance-draw": ce("bow"),
  "hunter-mark": ce("bow", 1),
  trapper: ce("bow"),
  nova: ce("staff"),
  inferno: {
    ...ce("staff"),
    requires: [["cinder"]]
  },
  fracture: {
    ...ce("staff"),
    requires: [[
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  overload: {
    ...ce("staff", 1),
    requires: [["cinder"], [
      "frost",
      "nova",
      "orbitals"
    ]]
  },
  orbitals: ce("staff"),
  convergence: ce("staff"),
  backstab: ce("daggers"),
  shadowstep: ce("daggers"),
  hemorrhage: ce("daggers"),
  "execution-chain": ce("daggers", 1),
  smoke: ce("daggers"),
  venom: ce("daggers"),
  "pack-bond": ce("grimoire"),
  martyr: ce("grimoire"),
  covenant: ce("grimoire"),
  frenzy: ce("grimoire"),
  "soul-harvest": ce("grimoire", 1),
  command: ce("grimoire"),
  shrapnel: ce("cannon"),
  minefield: ce("cannon"),
  overclock: ce("cannon"),
  bunker: ce("cannon"),
  salvage: ce("cannon"),
  railgun: ce("cannon", 1)
}, j = (e, t) => e.relics.find((r) => r.id === t)?.rank ?? 0;
function Ki(e) {
  return $s.filter((t) => !Ta[t].weapons || Ta[t].weapons.includes(e));
}
function Us(e, t, r = null) {
  const a = Ta[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((s) => s !== r && j(e, s) > 0)));
}
var Qt = Math.PI * 2, Q = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), de = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), kr = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Ke = (e, t, r) => ({
  x: e.x + Math.cos(t) * r,
  y: e.y + Math.sin(t) * r
});
function it(e, t, r, a, n, s) {
  if (s) {
    Mr(s.space, t, {
      x: Math.cos(r) * a,
      y: Math.sin(r) * a
    }, n);
    return;
  }
  t.x += Math.cos(r) * a, t.y += Math.sin(r) * a;
  for (const i of e.obstacles) {
    const l = Q(t, i), c = n + i.radius;
    if (l < c) {
      const o = l < 1e-3 ? r : de(i, t);
      t.x = i.x + Math.cos(o) * c, t.y = i.y + Math.sin(o) * c;
    }
  }
  t.x = Math.max(-K.arena + n, Math.min(K.arena - n, t.x)), t.y = Math.max(-K.arena + n, Math.min(K.arena - n, t.y));
}
function Xi(e, t, r, a) {
  const n = e.x - t.x, s = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(r) + s * Math.sin(r)));
  return Math.hypot(n - Math.cos(r) * i, s - Math.sin(r) * i);
}
var Ji = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], Wn = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function pa(e, t, r, a) {
  if (!$t(e, t, a) || !$t(e, r, a)) return null;
  if (De(e, t, r, a)) return [{ ...r }];
  const { map: n, columns: s, rows: i } = e, l = fa(n, t), c = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), h = [];
  function d(m) {
    return ha(n, m % s, Math.floor(m / s));
  }
  function p(m, x, b, y) {
    if (m < 0 || m >= s || x < 0 || x >= i) return;
    const _ = x * s + m;
    u.has(_) || (c.get(_) ?? 1 / 0) <= b || (c.set(_, b), o.set(_, y), h.push({
      id: _,
      score: b + Wn(d(_), r)
    }));
  }
  for (let m = -1; m <= 1; m++) for (let x = -1; x <= 1; x++) {
    const b = l.column + x, y = l.row + m, _ = ha(n, b, y);
    De(e, t, _, a) && p(b, y, Wn(t, _), -1);
  }
  for (; h.length; ) {
    h.sort((b, y) => y.score - b.score || y.id - b.id);
    const { id: m } = h.pop();
    if (u.has(m)) continue;
    u.add(m);
    const x = d(m);
    if (De(e, x, r, a)) {
      const b = [{ ...r }];
      let y = m;
      for (; y !== -1; )
        b.push(d(y)), y = o.get(y);
      b.reverse();
      const _ = [];
      let S = t;
      for (let E = 0; E < b.length; ) {
        let L = E;
        for (; L + 1 < b.length && De(e, S, b[L + 1], a); ) L++;
        S = b[L], _.push(S), E = L + 1;
      }
      return _;
    }
    for (const [b, y] of Ji) {
      const _ = m % s + b, S = Math.floor(m / s) + y, E = ha(n, _, S);
      De(e, x, E, a) && p(_, S, c.get(m) + Wn(x, E), m);
    }
  }
  return null;
}
var Zr = (e) => !ze(e) || [
  "warden",
  "thornheart",
  "keeper",
  "bridgekeeper",
  "heatkeeper",
  "kilnheart",
  "furnacemaster"
].includes(e), Br = /* @__PURE__ */ new WeakMap();
function Fs(e, t) {
  let r = Br.get(e);
  r || (r = /* @__PURE__ */ new WeakMap(), Br.set(e, r));
  let a = r.get(t);
  return a || (a = {
    ...e,
    blocked(n, s) {
      const i = ha(e.map, n, s);
      return i.x < t.left || i.x > t.right || i.y < t.top || i.y > t.bottom || e.blocked(n, s);
    }
  }, r.set(t, a)), a;
}
var le = (e, t, r, a = 0) => !e || De(e.space, t, r, a);
function Ut(e, t, r, a, n) {
  let s = 0;
  for (let i = 0.2; i <= a + 0.2; i += 0.2) {
    const l = Math.min(i, a), c = {
      x: t.x + Math.cos(r) * l,
      y: t.y + Math.sin(r) * l
    };
    if (!De(e.space, t, c, n)) break;
    s = l;
  }
  return s;
}
function el(e, t, r) {
  return e.summonPoints.filter((a) => $t(e.space, a, r) && pa(e.space, e.entry, a, r)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Ds(e, t, r) {
  return !e || De(e.space, t, r, 0.3) ? r : {
    x: t.x,
    y: t.y
  };
}
function Sr(e, t, r, a) {
  if (!e) return Math.atan2(r.y - t.y, r.x - t.x);
  let n = r;
  if (!$t(e.space, n, a)) {
    const i = [], l = a + e.space.map.cellSize, c = fa(e.space.map, {
      x: r.x - l,
      y: r.y - l
    }), o = fa(e.space.map, {
      x: r.x + l,
      y: r.y + l
    });
    for (let h = Math.max(0, c.row); h <= Math.min(e.space.rows - 1, o.row); h++) for (let d = Math.max(0, c.column); d <= Math.min(e.space.columns - 1, o.column); d++) {
      const p = ha(e.space.map, d, h);
      Math.hypot(p.x - r.x, p.y - r.y) <= a + e.space.map.cellSize && $t(e.space, p, a) && De(e.space, p, r) && i.push(p);
    }
    i.sort((h, d) => Math.hypot(h.x - r.x, h.y - r.y) - Math.hypot(d.x - r.x, d.y - r.y));
    const u = i.find((h) => pa(e.space, t, h, a));
    if (!u) return null;
    n = u;
  }
  const s = pa(e.space, t, n, a);
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
  if (!ze(t) && e.enemies.filter((c) => c.hp > 0).length >= (a?.enemyLimit ?? K.maxEnemies)) return null;
  if (a && !n) {
    const c = el(a, r, pe[t].radius);
    if (!c) return null;
    r = c;
  }
  const s = pe[t], i = (a?.segment && t === "warden" ? Ne.wardenHp : a?.segment && t === "thornheart" ? Ne.heartHp : a?.segment && t === "keeper" ? Ne.keeperHp : s.hp) * (ze(t) ? 1 : (1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)) * (a?.segment ? Ne.mobHp : 1)), l = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: i,
    maxHp: i,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Sn(e) * 20),
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
function Ft(e, t, r, a, n, s = {}) {
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
function me(e, t, r, a, n, s, i, l = !1, c = {}) {
  const o = {
    id: ++e.serial,
    x: t.x,
    y: t.y,
    kind: r,
    radius: a,
    wait: n,
    life: s,
    damage: i,
    friendly: l,
    angle: 0,
    length: 0,
    width: 0.65,
    inner: 0,
    source: l ? "passive" : "attack",
    hits: [],
    ...c
  };
  return e.hazards.push(o), o;
}
function He(e, t, r, a, n) {
  return me(e, t, "slam", r, a, 8, n);
}
function Ce(e, t, r, a, n, s, i) {
  return me(e, t, "beam", 0, s, 9, i, !1, {
    angle: r,
    length: a,
    width: n
  });
}
function Pt(e, t, r, a, n, s, i = 0.22) {
  for (let l = 0; l < a; l++) Ft(e, t, r + (a === 1 ? 0 : l / (a - 1) - 0.5) * n, s, !1, { speed: i });
}
function qr(e, t, r, a, n, s = 0.16) {
  for (let i = 0; i < r; i++) Ft(e, t, a + i * Qt / r, n, !1, { speed: s });
}
function tr(e, t, r, a, n = 0) {
  const s = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: t === "turret" ? 65 : t === "familiar" ? It.familiarHp : 38,
    life: a,
    cooldown: 12,
    angle: 0,
    empowered: n
  };
  return e.companions.push(s), s;
}
var dn = (e) => e === "attack" || e === "skill";
function tl(e, t, r) {
  const a = de(t, t.target), n = t.pattern++ % 3, s = (l, c, o, u, h) => Ce(e, t, l, Ut(r, t, l, c, o), o, u, h);
  if (t.kind === "kilnheart") {
    if (n === 0) s(a, 19, 1.1, 32, 23);
    else if (n === 1) me(e, t, "ring", 8, 39, 10, 25, !1, {
      inner: 3.8,
      angle: a + Math.PI / 2,
      gap: 1.5
    });
    else for (const l of [-1, 1]) s(a + l * 0.72, 17, 1.2, 35, 23);
    t.stun = 40, t.exposed = Math.max(t.exposed, 125);
    return;
  }
  if (t.phase >= 2 && t.memory.length === 0) {
    for (const l of r.summonPoints) {
      const c = Le(e, "coupler", l, r);
      c && (c.hp = c.maxHp = r.furnacePrepared ? $a.preparedCouplerHp : $a.couplerHp);
    }
    t.memory = r.summonPoints.map((l) => ({ ...l })), we(e, t, "burst", 4);
  }
  const i = e.enemies.some((l) => l.kind === "coupler" && l.hp > 0);
  if (n === 0) {
    const l = Ut(r, t, a, Math.min(8, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), 1.45);
    t.motionAngle = a, t.motion = Math.floor(l / 0.32), t.stun = 30;
    const c = Ce(e, t, a, l, 1.45, 30, 0);
    c.life = Math.max(1, t.motion), t.exposed = Math.max(t.exposed, 30 + t.motion + (t.phase === 3 ? 105 : 75));
  } else if (n === 1)
    He(e, Ke(t, a, Ut(r, t, a, 3, 0.4)), 3.8, 32, 29), i && s(a + (t.pattern % 2 ? 1 : -1) * 0.9, 22, 1.2, 53, 24), t.stun = 54, t.exposed = Math.max(t.exposed, t.phase === 3 ? 185 : 145);
  else {
    for (const l of [-1, 1]) s(a + l * 0.65, 26, 1.3, 40, 27);
    t.phase === 3 && i && He(e, t.target, 2.8, 65, 25), t.stun = 66, t.exposed = Math.max(t.exposed, t.phase === 3 ? 200 : 155);
  }
}
function al(e, t) {
  if (t.kind === "coupler") {
    const r = e.enemies.find((a) => a.kind === "furnacemaster" && a.hp > 0);
    r && (r.stun = Math.max(r.stun, $a.couplerStun), r.exposed = Math.max(r.exposed, $a.couplerExposed), r.motion = 0, r.windup = 0, we(e, r, "guard", 3));
  } else if (t.kind === "furnacemaster")
    for (const r of e.enemies) r.kind === "coupler" && (r.hp = 0);
}
function Zs(e, t) {
  if (e.player.hp <= 0) return;
  const r = Math.min(K.maxHp - e.player.hp, t);
  e.player.hp += r, r > 0 && we(e, e.player, "heal");
}
function Dt(e, t, r) {
  if (ze(t.kind)) {
    if (t.controlRecovery > 0 || (t.stagger += r, t.stagger < 100)) return;
    t.stagger = 0, r = 24, t.controlRecovery = Ne.bossControlRecovery;
  }
  t.stun = Math.max(t.stun, r), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), we(e, t, "guard", 1.4);
}
function rt(e, t, r, a, n, s = e.player, i) {
  if (t.hp <= 0 || !le(i, s, t)) return;
  const l = t.burn > 0 || dn(n) && j(a, "cinder") > 0, c = t.chill > 0 || dn(n) && j(a, "frost") > 0, o = (n === "skill" || n === "companion" && a.weapon === "cannon") && c && j(a, "shatter") > 0, u = dn(n) && l && c && j(a, "overload") > 0;
  let h = r * (j(a, "blood-price") ? nt.bloodDamage + (j(a, "blood-price") - 1) * 0.12 : 1);
  if (j(a, "execution") && t.hp / t.maxHp < nt.executeThreshold && (h *= nt.executeDamage + (j(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden" && Ts(t.phase)) && n === "attack" && Math.cos(de(t, s) - t.angle) > 0.4 && t.exposed <= 0 && (h *= j(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !ze(t.kind) && e.enemies.some((d) => d.kind === "priest" && d.hp > 0 && Q(t, d) < 3.5 && le(i, t, d)) && (h *= 0.7), n === "attack" && j(a, "backstab") && Math.cos(de(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + j(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && j(a, "duelist") && Dt(e, t, 9 * j(a, "duelist")), o) {
    h += 15 * j(a, "shatter"), t.chill = 0, we(e, t, "burst", 2.2);
    for (const d of e.enemies) d.id !== t.id && Q(t, d) < 2.2 && rt(e, d, 9 * j(a, "shatter"), a, "passive", t, i);
  }
  if (dn(n) && (j(a, "cinder") && (t.burn = Math.max(t.burn, 80 + j(a, "cinder") * 25)), j(a, "frost") && (t.chill = Math.max(t.chill, 45 + j(a, "frost") * 20)), (j(a, "blood-dance") || j(a, "hemorrhage")) && (t.bleed = 100 + 25 * (j(a, "blood-dance") + j(a, "hemorrhage"))), j(a, "venom") && (t.poison = 100 + j(a, "venom") * 35), u && (h += 20 * j(a, "overload"), we(e, t, "lightning")), n === "skill" && j(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + j(a, "hunter-mark") * 40)), j(a, "inferno") && l && n === "skill" && me(e, t, "fire", 1.5 + j(a, "inferno") * 0.3, 0, 70, 4 * j(a, "inferno"), !0)), u && (t.burn = 0), (u || o) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && j(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - j(a, "momentum") * 2)), !(t.hp > 0)) {
    if (al(e, t), e.kills++, we(e, t, "burst", ze(t.kind) ? 3 : 0.8), j(a, "wildfire") && l && me(e, t, "fire", 1.8 + j(a, "wildfire") * 0.2, 0, 90, 3 * j(a, "wildfire"), !0), j(a, "fracture") && c) for (let d = 0; d < 4 + j(a, "fracture"); d++) Ft(e, t, d * Qt / (4 + j(a, "fracture")), 9, !0, { source: "passive" });
    if (j(a, "siphon") && (e.kills % nt.siphonEvery === 0 || ze(t.kind)) && Zs(e, (ze(t.kind) ? nt.siphonBossHeal : nt.siphonHeal) + j(a, "siphon") - 1), j(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * j(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), j(a, "soul-harvest") && (e.player.resource = Math.min(It.maxPower, e.player.resource + 9 * j(a, "soul-harvest"))), n === "companion" && j(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * j(a, "salvage"))), j(a, "magnet"))
      for (const d of e.enemies) d.hp > 0 && d.kind !== "coupler" && Q(t, d) < 3 + j(a, "magnet") && le(i, t, d) && it(e, d, de(d, t), 0.7, pe[d.kind].radius, i);
  }
}
function ar(e, t, r, a, n, s = e.player) {
  const i = [t];
  if (le(n, s, t)) {
    j(r, "conductor") && i.push(...e.enemies.filter((l) => l.id !== t.id && l.hp > 0 && Q(l, t) < 4.5 && le(n, t, l)).sort((l, c) => Q(l, t) - Q(c, t)).slice(0, j(r, "conductor") + 1));
    for (const l of i)
      we(e, l, "lightning"), rt(e, l, a, r, "lightning", n ? l === t ? s : t : e.player, n);
  }
}
function Bs(e, t, r) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), we(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const s = j(t, "riposte"), i = j(t, "thorns");
  if (s || i)
    for (const l of e.enemies) Q(l, a) < 3.2 + s * 0.3 && le(r, a, l) && (rt(e, l, (n ? 20 : 8) * s + 9 * i, t, "passive", a, r), Dt(e, l, n ? 20 : 7));
}
function Rn(e, t, r, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Bs(e, r, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let s = t * Kt[r.weapon].guard * (j(r, "blood-price") ? nt.bloodHurt : 1) * (j(r, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, s);
  if (n.ward -= i, s -= i, n.hp <= s && j(r, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + j(r, "last-stand") * 8, n.invulnerable = 60, we(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - s), e.damageTaken += s, n.invulnerable = 18, n.lastHit = e.tick, we(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), j(r, "thorns"))
    for (const l of e.enemies) Q(l, n) < 3 && rt(e, l, 10 * j(r, "thorns"), r, "passive", n, a);
}
function Wa(e, t, r = 45) {
  e.ward += Math.max(0, Math.min(t, r - e.ward));
}
function Wr(e, t, r, a = !1, n) {
  const s = Kt[t.weapon], i = e.player, l = de(i, r), c = (a ? 0.6 : 1) * (j(t, "gambit") ? 1 + j(t, "gambit") * 0.12 : 1);
  if (i.facing = l, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const d = s.range + j(t, "piercing") * 0.25;
    we(e, i, "slash", d, l);
    for (const p of e.enemies)
      Q(i, p) > d + pe[p.kind].radius || Math.cos(de(i, p) - l) < -0.1 || !le(n, i, p) || (rt(e, p, s.damage * c, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && Dt(e, p, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), j(t, "cleave-wave") && i.combo % 3 === 2 && Ft(e, i, l, 14 * j(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let o = s.damage * c;
  j(t, "distance-draw") && (o *= 1 + Math.min(1, Q(i, r) / 8) * 0.15 * j(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(It.maxPower, i.resource + 12));
  const u = j(t, "piercing") * nt.extraPierce + j(t, "railgun") * 2, h = Ft(e, i, l, o, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + j(t, "shrapnel") * 0.3 : 0,
    bounce: j(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && j(t, "split-arrow") && i.combo % 3 === 2) for (const d of [-0.18, 0.18]) Ft(e, i, l + d, o * (0.35 + j(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: u
  });
}
function nl(e, t, r, a) {
  const n = e.player, s = Kt[t.weapon], i = j(t, "focus");
  switch (n.skill = Math.round(s.skillCooldown * (i ? nt.focusSkill - (i - 1) * 0.06 : 1)), j(t, "aegis") && (n.shield = 18 + j(t, "aegis") * 6, n.guard = 8, Wa(n, j(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + j(t, "aegis") * 6, n.guard = 9;
      const l = 1 + n.resource / 100;
      n.resource = 0, we(e, n, "slash", 3.6, n.facing);
      for (const c of e.enemies)
        c.hp <= 0 || Q(n, c) > 3.6 + pe[c.kind].radius || !le(a, n, c) || (j(t, "shield-break") && (c.exposed = Math.max(c.exposed, 70 + 30 * j(t, "shield-break"))), rt(e, c, s.skill * l, t, "skill", n, a), Dt(e, c, 40), !ze(c.kind) && c.kind !== "coupler" && it(e, c, de(n, c), 1.5, pe[c.kind].radius, a));
      j(t, "valor") && Wa(n, 12 * j(t, "valor") * l);
      break;
    }
    case "bow":
      for (let l = -2; l <= 2; l++) Ft(e, n, n.facing + l * 0.15, s.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      it(e, n, n.facing + Math.PI, 0.85, K.playerRadius, a);
      break;
    case "staff": {
      const l = r ?? n, c = 1 + n.resource / 125;
      if (n.resource = 0, j(t, "convergence"))
        for (const o of e.enemies) o.kind !== "coupler" && Q(o, l) < 4 + j(t, "convergence") && le(a, l, o) && it(e, o, de(o, l), 1.2, pe[o.kind].radius, a);
      for (let o = 0; o < 3; o++) {
        const u = Ke(l, o * Qt / 3, 0.7);
        me(e, le(a, l, u) ? u : l, "slam", 2.3, 10 + o * 10, 1, s.skill * c, !0, { source: "skill" });
      }
      if (j(t, "nova")) {
        me(e, n, "frost", 3 + j(t, "nova") * 0.5, 0, 32, 6 * j(t, "nova"), !0, { source: "skill" });
        for (const o of e.enemies) Q(n, o) < 3.5 && le(a, n, o) && (o.chill = 120, Dt(e, o, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), r) {
        const l = Ke(r, r.angle + Math.PI, pe[r.kind].radius + 0.55);
        it(e, n, de(n, l), Math.min(5, Q(n, l)), K.playerRadius, a), n.facing = de(n, r), le(a, n, r) && (!a || Q(n, r) <= s.range + pe[r.kind].radius) && (r.exposed = Math.max(r.exposed, 60), rt(e, r, s.skill, t, "skill", n, a), Dt(e, r, 20)), we(e, n, "slash", 2, n.facing);
      }
      j(t, "shadowstep") && tr(e, "shade", n, 95 + j(t, "shadowstep") * 30, j(t, "shadowstep"));
      break;
    case "grimoire": {
      const l = n.resource;
      n.resource = 0, n.resonance = It.resonanceTicks + l, we(e, n, "resonance", 2);
      for (const c of e.companions) c.kind === "familiar" && c.hp > 0 && c.life > 0 && (c.hp = Math.max(c.hp, It.familiarHp), c.cooldown = 0);
      r && (r.exposed = Math.max(r.exposed, 100), rt(e, r, s.skill + l * 0.3, t, "skill", n, a)), j(t, "command") && me(e, r ?? n, "storm", 2.4 + j(t, "command") * 0.3, 10, 65, 7 * j(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const l = 1 + (j(t, "overclock") >= 2 ? 1 : 0), c = e.companions.filter((o) => o.kind === "turret");
      c.length >= l && (c[0].life = 0), tr(e, "turret", Ds(a, n, Ke(n, n.facing, 0.9)), 240 + j(t, "overclock") * 45, j(t, "overclock")), j(t, "bunker") && Wa(n, 15 * j(t, "bunker"));
      break;
    }
  }
}
function rl(e, t, r, a) {
  const n = e.player, s = j(r, "quicksilver");
  if (n.dash = Math.round(K.dashCooldown * (1 - s * 0.08)), n.dashTime = K.dashTicks, n.dashAngle = t.move ? kr(t.move) : n.facing, n.invulnerable = K.dashTicks + 2, j(r, "storm-step") && me(e, n, "storm", 1.7 + j(r, "storm-step") * 0.15, 0, 70, 6 + j(r, "storm-step") * 3, !0), j(r, "trapper") && me(e, n, "frost", 1.8, 12, 110, 5 * j(r, "trapper"), !0), j(r, "minefield") && me(e, n, "mine", 2 + j(r, "minefield") * 0.2, 12, 180, 25 * j(r, "minefield"), !0), j(r, "smoke")) {
    for (const i of e.enemies) Q(i, n) < 3 + j(r, "smoke") * 0.4 && le(a, n, i) && (Dt(e, i, 30 + j(r, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    we(e, n, "guard", 3);
  }
}
function sl(e, t, r, a) {
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
  const s = e.enemies.filter((o) => o.hp > 0 && le(a, n, o)).sort((o, u) => Q(n, o) - Q(n, u))[0];
  t.dash && !n.dash && !n.dashTime && rl(e, t, r, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    it(e, n, n.dashAngle, K.speed * 3.6, K.playerRadius, a), n.dashTime--, !n.dashTime && j(r, "momentum") && s && Q(n, s) < 3 && ar(e, s, r, 10 + j(r, "momentum") * 5, a);
  else if (t.move) {
    n.facing = kr(t.move);
    const o = n.swing > 0;
    let u = K.speed * (o ? Kt[r.weapon].moveFire : 1);
    j(r, "quicksilver") && n.dash > K.dashCooldown / 2 && (u *= 1 + j(r, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && Q(h, n) < h.radius && le(a, h, n)) && (u *= 0.65), it(e, n, n.facing, u, K.playerRadius, a);
  }
  n.travel += Q(i, n), j(r, "pilgrim") && n.travel >= 28 && (n.travel -= 28, Wa(n, j(r, "pilgrim") * 6, 35)), j(r, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && Wa(n, 2, j(r, "wardstone") * 10);
  const l = s && le(a, n, s) ? s : void 0;
  t.skill && !n.skill && (l && (n.facing = de(n, l)), nl(e, r, l, a));
  const c = Kt[r.weapon].range + (r.weapon === "blade" || r.weapon === "daggers" ? j(r, "piercing") * 0.25 : 0);
  if (l && !n.attack && Q(n, l) <= c + pe[l.kind].radius && (Wr(e, r, l, !1, a), n.combo++, j(r, "echo") && n.combo % Math.max(2, nt.echoEvery + 1 - j(r, "echo")) === 0 && Wr(e, r, l, !0, a), n.attack = Math.round(Kt[r.weapon].period * (j(r, "focus") ? nt.focusAttack : 1))), j(r, "orbit") && e.tick % Math.round(nt.orbitTicks / (1 + j(r, "orbit") * 0.25)) === 0 && s && Q(n, s) < 4.5 && ar(e, s, r, 12 + j(r, "orbit") * 3, a), j(r, "orbitals") && e.tick % 35 === 0) {
    for (const o of e.enemies) Q(n, o) < 2.5 + j(r, "orbitals") * 0.35 && le(a, n, o) && (rt(e, o, 12 * j(r, "orbitals"), r, "passive", n, a), o.chill = Math.max(o.chill, 30));
    we(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function ol(e, t, r) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + j(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && tr(e, "familiar", Ds(r, e.player, Ke(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || le(r, a, i))).sort((i, l) => Q(i, a) - Q(l, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = de(a, n), a.kind !== "turret") {
      const i = Q(a, e.player) > 8;
      if (i || Q(a, n) > 1.3 || !le(r, a, n)) {
        const l = Sr(r, a, i ? e.player : n, 0.25);
        l !== null && it(e, a, l, i ? 0.19 : 0.14 + j(t, "frenzy") * 0.015, 0.25, r);
      }
    }
    const s = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && Q(a, n) < s && le(r, a, n)) if (a.kind === "turret")
      Ft(e, a, a.angle, Kt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      rt(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? It.empoweredDamage : It.damage) * (1 + j(t, "covenant") * 0.15), t, "companion", a, r), we(e, a, "slash", 1.2, a.angle);
      const l = a.kind === "shade" ? 32 : i ? It.empoweredAttackTicks : It.attackTicks;
      a.cooldown = Math.round(l / (1 + j(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && j(t, "martyr") && (Zs(e, j(t, "martyr")), me(e, a, "slam", 2.2, 0, 1, 15 * j(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
function il(e, t, r) {
  if (r?.segment !== "beacon" || t.kind !== "archer" || !["approach", "lighting"].includes(e.script.signal)) return !1;
  if (t.hp < e.script.signalHp)
    return e.script.signal = "stopped", t.exposed = Math.max(t.exposed, Ne.recoveryTicks), t.cooldown = Ne.recoveryTicks, !1;
  if (t.windup = 0, e.script.signal === "approach") {
    const a = r.signalPoint;
    if (Q(t, a) < 1) e.script.signal = "lighting";
    else {
      const n = Sr(r, t, a, 0.36);
      n !== null && (t.angle = n, it(e, t, n, 0.1, 0.36, r));
    }
  }
  return !0;
}
function ll(e, t) {
  const r = e.script, a = e.enemies.find((s) => [
    "keeper",
    "warden",
    "thornheart"
  ].includes(s.kind));
  let n = [];
  if (t.segment === "gate" && !e.enemies.some((s) => s.kind === "archer") && (n = ["charger"]), t.segment === "waterway" && a && a.hp <= a.maxHp * 0.5 && (n = ["archer", "soldier"]), t.segment === "hall" && t.reinforcement && a && a.hp <= a.maxHp * 0.65 && (n = ["guard", "archer"]), t.segment === "roots" && a && a.hp <= a.maxHp * 0.5 && (n = ["stalker", "stalker"]), t.segment === "beacon") {
    const s = e.enemies.find((i) => i.kind === "archer");
    !s && r.signal !== "lit" && (r.signal = "stopped"), s && r.signal === "idle" && !e.enemies.some((i) => i.kind === "guard") && (r.signal = "approach", r.signalHp = s.hp, s.windup = 0, e.objective.target = Ne.signalTicks), s && r.signal === "lighting" && (s.hp < r.signalHp ? (r.signal = "stopped", s.exposed = Math.max(s.exposed, Ne.recoveryTicks)) : ++e.objective.progress >= Ne.signalTicks && (r.signal = "lit", e.objective.hp = 0)), r.signal === "lit" && (n = ["soldier", "soldier"]);
  }
  if (!(!n.length || r.reinforcements === "done")) {
    if (r.reinforcements === "idle" && (r.reinforcements = "warning", r.warning = Ne.reinforcementWarning, a && (a.windup = 0, a.cooldown = Math.max(a.cooldown, Ne.reinforcementWarning + Ne.recoveryTicks))), e.tick % 6 === 0) for (const s of t.summonPoints) we(e, s, "guard", 1.2);
    --r.warning > 0 || (n.forEach((s, i) => {
      Le(e, s, t.summonPoints[i], t) || je("map_invalid");
    }), r.reinforcements = "done");
  }
}
var Hr = {
  ...oi,
  ...ui
}, pn = Object.freeze({
  wait: 42,
  damage: 23
}), qs = (e) => e && Object.hasOwn(Hr, e) ? Hr[e].map((t) => ({
  ...t,
  ...pn
})) : [];
function cl(e, t) {
  for (const r of qs(t.segment))
    e.tick < r.offset || (e.tick - r.offset) % r.period || Ce(e, r, r.angle, Ut(t, r, r.angle, r.length, r.width), r.width, r.wait, r.damage);
}
var Vt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), bn = [
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
function mn(e, t, r) {
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
  const a = ni[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let s = 0; s < n; s++) {
    const i = Qt * s / n + (e.wave - 1) * 0.8;
    let l = a[(s + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && s < 2 && (l = a[0]), e.encounter === "pursuit" && s === 0 && (l = "stalker"), e.encounter === "siege" && s === 0 && (l = "guard"), Le(e, l, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function dl(e, t, r) {
  if (r?.segment && (ll(e, r), cl(e, r)), e.boss) return;
  const a = e.objective, n = e.enemies.some((s) => s.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && Q(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && Q(i, a) < 2.2) && a.progress++;
    const s = Math.min(2, Math.floor(a.progress / Vt.ritualTicks));
    a.x = bn[s].x, a.y = bn[s].y, e.tick % Vt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Le(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Sn(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % Vt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && mn(e, t), e.tick % 150 === 0 && me(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % Vt.pursuitInterval, e.wave < e.waves && a.progress === 0 && mn(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const s = e.tick % 300 === 0, i = Math.round((s ? e.player.y : e.player.x) / 3) * 3;
    Ce(e, s ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, s ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  !r && e.tick > Vt.warningAfter && e.tick % 180 === 0 && me(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, mn(e, t, r)) : n && (e.nextWave = 0);
}
function ul(e, t) {
  return e.enemies.some((r) => r.hp > 0) || (t?.segment === "gate" || t?.segment === "beacon" && e.script.signal === "lit") && e.script.reinforcements !== "done" ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function hl(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, bn[0]), t.target = Vt.ritualTicks * bn.length), e.encounter === "survival" && (t.target = Vt.survivalTicks), e.encounter === "pursuit" && (t.target = Vt.pursuitInterval);
}
function fl(e) {
  return e.kind === "furnacemaster" ? e.hp <= e.maxHp * $a.burningAt ? 3 : e.hp <= e.maxHp * $a.connectedAt ? 2 : 1 : e.kind === "warden" ? e.hp <= e.maxHp * 0.3 ? 3 : e.hp <= e.maxHp * 0.65 ? 2 : 1 : e.hp <= e.maxHp * 0.5 ? 2 : 1;
}
function pl(e, t, r, a) {
  const n = de(t, t.target), s = Ut(r, t, n, Math.min(7.5, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), pe[t.kind].radius);
  t.motionAngle = n, t.motion = Math.ceil(s / 0.32), t.stun = 24;
  const i = Ce(e, t, n, s, pe[t.kind].radius, 24, 0);
  if (i.life = Math.max(1, t.motion), a) {
    const l = Ke(t, n, s);
    s > 1 && He(e, l, 2.8, 24 + t.motion + 20, 23);
  }
  t.exposed = Math.max(t.exposed, 24 + t.motion + 70);
}
function Ws(e, t, r) {
  const a = t.pattern % (t.kind === "keeper" && t.phase === 1 ? 2 : 3), n = (s, i, l, c, o) => Ce(e, t, s, Ut(r, t, s, i, l), l, c, o);
  if (t.kind === "warden" || t.kind === "keeper") if (a === 0) pl(e, t, r, t.kind === "warden" && t.phase > 1);
  else if (a === 1) {
    const s = de(t, t.target);
    He(e, Ke(t, s, Ut(r, t, s, 2.4, 0.3)), t.kind === "keeper" ? 2.5 : 3, 25, t.kind === "keeper" ? 20 : 24), t.exposed = Math.max(t.exposed, 95), t.stun = 25;
  } else t.kind === "keeper" || t.phase === 3 ? (n(de(t, t.target), t.kind === "keeper" ? 10 : 15, 0.9, 30, 23), t.exposed = Math.max(t.exposed, 100), t.stun = 30) : (Pt(e, t, t.angle, 5, 1.3, 14, 0.2), t.exposed = Math.max(t.exposed, 65));
  else if (a === 0)
    n(de(t, t.target), 16, 0.8, 30, 20), t.phase > 1 && e.hazards.filter((s) => !s.friendly && s.kind === "poison").length < 2 && me(e, t.target, "poison", 2, 40, 150, 9);
  else if (a === 1) {
    for (const s of [-1, 1]) n(t.angle + s * 0.7, 13, 1, 32, 21);
    t.exposed = Math.max(t.exposed, 110), t.stun = 32;
  } else
    me(e, t, "ring", 7, 36, 10, 22, !1, {
      inner: 3.8,
      angle: t.angle + Math.PI / 2,
      gap: Ne.rootRingGap
    }), t.exposed = Math.max(t.exposed, 110), t.stun = 36;
  t.pattern++;
}
function ml(e, t, r) {
  const a = t.pattern % (t.kind === "bridgekeeper" ? 3 : 4), n = (s, i, l, c = pn.wait, o = pn.damage) => Ce(e, t, s, Ut(r, t, s, i, l), l, c, o);
  if (a === 0) {
    const s = n(de(t, t.target), 18, 0.55, 36, 15);
    s.pull = fi.pullDistance, t.stun = 36, t.exposed = Math.max(t.exposed, 108);
  } else if (a === 1) {
    const s = de(t, t.target);
    He(e, Ke(t, s, Ut(r, t, s, 2.8, 0.35)), 2.7, 28, 26), t.stun = 28, t.exposed = Math.max(t.exposed, 112);
  } else if (a === 2) {
    const s = de(t, t.target);
    for (const i of [-1, 1]) n(s + i * 0.62, 20, 1.15);
    t.stun = pn.wait, t.exposed = Math.max(t.exposed, 125);
  } else {
    const s = de(t, t.target), i = t.pattern % 8 < 4 ? -1 : 1;
    n(s, 18, 1.1, 38), t.phase > 1 && n(s + i * 0.9, 18, 1.1, 58), t.stun = 38, t.exposed = Math.max(t.exposed, 135);
  }
  t.pattern++;
}
var ka = (e, t) => {
  e.motion = t, e.motionAngle = de(e, e.target), e.stun = 18;
}, gl = {
  keeper(e, t, r) {
    r ? Ws(e, t, r) : He(e, t.target, 2.5, 24, Jt.keeper.damage);
  },
  warden(e, t, r) {
    const a = t.pattern % 3, n = Jt.warden.damage;
    if (a === 0)
      ka(t, 24), Ce(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let s = -1; s <= 1; s++) He(e, Ke(t, t.angle + s * 0.55, 3.5), 1.8, 12 + Math.abs(s) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      Pt(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Le(e, "guard", {
        x: -7,
        y: -7
      }, r);
  },
  thornheart(e, t, r) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) me(e, Ke(t.target, n * Qt / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      me(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Le(e, "stalker", {
      x: n,
      y: -6
    }, r);
    else for (let n = 0; n < 3 + t.phase; n++) Ce(e, t, t.angle + n * Qt / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, we(e, t, "burst", 2), Ce(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), Ce(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (r === 1) Pt(e, t, de(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (r === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Ke({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        Ce(e, n, de(n, {
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
      n !== t.phase && Ce(e, t, a + n * Qt / 7, 18, 0.6, 32, 23);
    else if (r === 1) for (let n = 0; n < 6; n++) {
      const s = Ke({
        x: 0,
        y: 0
      }, n * Qt / 6, 9);
      Pt(e, s, de(s, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      He(e, t.target, 2, 18, 24), me(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      ka(t, 18), Ce(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (r === 1) for (let a = 0; a < 2 + t.phase; a++) He(e, Ke(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else r === 2 ? (Ce(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), Ce(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (Pt(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Le(e, "stalker", {
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
      ka(t, 28);
      for (let a = 0; a < 6; a++) me(e, Ke(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (r === 1) qr(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (r === 2)
      t.x = 0, t.y = 0, me(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
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
    ]) Ce(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (r === 1) for (let a = -1; a <= 1; a++) me(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else r === 2 ? (He(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Le(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Le(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const r = t.pattern % 3;
    if (r === 0) for (let a = 0; a < 3; a++) me(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (r === 1)
      ka(t, 30), Ce(e, t, t.motionAngle, 18, 1.4, 18, 27);
    else {
      for (const a of [-1, 1]) He(e, {
        x: t.target.x + a * 2,
        y: t.target.y
      }, 2.7, 30, 25);
      t.exposed = Math.max(t.exposed, 110);
    }
  },
  frostqueen(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (let a = 0; a < 4; a++) me(e, Ke(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else r === 1 ? Pt(e, t, t.angle, 9, 2.2, 14, 0.21) : r === 2 ? (t.x = -t.x, t.y = -t.y, Ce(e, t, de(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (me(e, {
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
      }, ka(t, 40), Ce(e, t, 0, 19, 1.4, 14, 25);
    else if (r === 1) for (let a = 0; a < 4; a++) Ce(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else r === 2 ? (He(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (me(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), Pt(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), He(e, t.target, 2.3, 24, 21);
    else if (r === 1) for (let a = 0; a < t.memory.length; a++) He(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (r === 2) {
      for (const a of t.memory) Ce(e, a, de(a, t.target), 18, 0.65, 32, 22);
      Le(e, "wisp", {
        x: -7,
        y: -7
      }), Le(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      qr(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), we(e, t, "burst", 2), Ce(e, t, de(t, t.target), 20, 0.8, 24, 26);
    else if (r === 1)
      ka(t, 20), Pt(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (r === 2)
      He(e, t, 3, 12, 26), me(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) Ce(e, a, de(a, t.target), 20, 0.6, 22, 23);
  }
};
function vl(e, t, r, a) {
  if (t.kind === "kilnheart" || t.kind === "furnacemaster") {
    a || ge("invalid"), tl(e, t, a);
    return;
  }
  if (t.kind === "bridgekeeper" || t.kind === "heatkeeper") {
    a || ge("invalid"), ml(e, t, a);
    return;
  }
  if (a?.segment && [
    "keeper",
    "warden",
    "thornheart"
  ].includes(t.kind)) {
    Ws(e, t, a);
    return;
  }
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const s = t.phase + 1;
    t.phase = s, we(e, t, "burst", 4), n === "phoenix" && s === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), me(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), r.oaths.includes("legion") && Le(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  gl[n](e, t, a), t.pattern++;
}
function yl(e, t, r) {
  if (!ze(t.kind) && [
    "soldier",
    "guard",
    "stalker"
  ].includes(t.kind)) {
    if (r?.segment && t.kind === "soldier") return e.player;
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && Q(n, t) < 2.8 && le(r, t, n)).sort((n, s) => Q(n, t) - Q(s, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && Q(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function bl(e, t, r, a, n) {
  const s = pe[t.kind];
  Q(t.target, e.player) < a && Q(t, e.player) < s.reach + 1 && le(n, t, e.player) && Rn(e, s.damage, r, n);
  for (const i of e.companions) Q(t.target, i) < a && Q(t, i) < s.reach + 1 && le(n, t, i) && (i.hp -= s.damage);
  !e.boss && e.encounter === "siege" && Q(t.target, e.objective) < a && Q(t, e.objective) < s.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - s.damage * 0.5)), we(e, t.target, "slash", a, t.angle);
}
function wl(e, t, r, a) {
  const n = pe[t.kind];
  if (ze(t.kind)) {
    vl(e, t, r, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      Pt(e, t, t.angle, e.chapter > 0 ? 3 : 1, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const s of e.enemies) s.hp > 0 && !ze(s.kind) && Q(s, t) < 3.5 && le(a, t, s) && (s.hp = Math.min(s.maxHp, s.hp + 8));
      Pt(e, t, t.angle, 3, 0.7, n.damage, 0.18), we(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      me(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      Ft(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      He(e, t.target, 1.7, 8, n.damage), t.exposed = Math.max(t.exposed, 60);
      break;
    default:
      bl(e, t, r, n.reach + 0.15, a);
  }
}
function xl(e, t, r, a) {
  const n = pe[t.kind], s = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (it(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    Q(t, e.player) < n.radius + 0.4 && le(a, t, e.player) && (Rn(e, n.damage, r, a), t.motion = 0);
    for (const l of e.companions) Q(t, l) < n.radius + 0.3 && le(a, t, l) && (l.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && Q(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), Q(s, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, we(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function _l(e, t, r, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    if (a?.segment && ze(n.kind)) {
      const d = fl(n);
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
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && rt(e, n, 2 + (d === "burn" ? j(t, "cinder") + j(t, "inferno") : d === "bleed" ? j(t, "hemorrhage") + j(t, "blood-dance") : j(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0 || n.kind === "coupler" || il(e, n, a)) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      xl(e, n, t, a);
      continue;
    }
    const s = pe[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (wl(e, n, t, a), n.cooldown = Math.max(n.cooldown, a?.segment && ze(n.kind) ? n.phase === 3 ? 95 : 75 : Math.round(s.cooldown * (i ? 0.8 : 1) / (ze(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1))));
      continue;
    }
    const l = yl(e, n, a), c = Q(n, l), o = le(a, n, l);
    n.cooldown = Math.max(0, n.cooldown - 1), n.angle = de(n, l);
    const u = a?.segment && e.enemies.filter((d) => d.id !== n.id && d.hp > 0 && (d.windup > 0 || d.motion > 0)).length + e.hazards.filter((d) => !d.friendly && d.life > 0).length >= Ne.simultaneousWindups;
    if (!n.cooldown && c < s.reach && o && !u) {
      if (n.target = {
        x: l.x,
        y: l.y
      }, n.windup = Math.round(s.windup * (i ? 0.8 : 1)), l === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : c / 0.24, p = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(r.x, r.y))), m = {
          x: l.x + r.x * p,
          y: l.y + r.y * p
        };
        a ? le(a, n, m) && le(a, l, m) && (n.target = m) : (n.target.x = Math.max(-10, Math.min(10, m.x)), n.target.y = Math.max(-10, Math.min(10, m.y))), n.angle = de(n, n.target);
      }
      continue;
    }
    const h = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (c > (h ? 5 : ze(n.kind) ? 2.8 : 0.95) || h && c < 3 || !o) {
      const d = n.kind === "stalker" && c > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, p = Sr(a, n, l, s.radius);
      p !== null && it(e, n, p + (h && c < 3 && o ? Math.PI : a ? 0 : d), s.speed * (n.chill ? ze(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), s.radius, a);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && Q(n, d) < s.radius + pe[d.kind].radius && it(e, n, de(d, n), 0.027, s.radius, a);
  }
}
function un(e, t, r) {
  if (e.kind === "beam") return Xi(t, e, e.angle, e.length) < e.width + r;
  const a = Q(e, t);
  return e.kind === "ring" && e.gap && Math.abs(Math.atan2(Math.sin(de(e, t) - e.angle), Math.cos(de(e, t) - e.angle))) + Math.asin(Math.min(1, r / Math.max(r, a))) < e.gap / 2 ? !1 : a < e.radius + r && (e.kind !== "ring" || a > e.inner - r);
}
function Ml(e, t, r) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, r ? !le(r, n, a, a.radius) : Math.abs(a.x) > K.arena || Math.abs(a.y) > K.arena || e.obstacles.some((s) => Q(s, a) < s.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (Q(a, e.player) < K.playerRadius + a.radius && le(r, a, e.player)) e.player.shield > 0 ? (Bs(e, t, r), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (Rn(e, a.damage, t, r), a.life = 0);
      else {
        const s = e.companions.find((i) => i.hp > 0 && Q(a, i) < 0.3 + a.radius && le(r, a, i));
        s && (s.hp -= a.damage * (1 - j(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const s of e.enemies) {
      if (s.hp <= 0 || a.hits.includes(s.id) || Q(s, a) > pe[s.kind].radius + a.radius || !le(r, a, s)) continue;
      a.hits.push(s.id);
      const i = a.damage * (j(t, "hunter") && Q(s, e.player) > nt.hunterRange ? nt.hunterDamage + (j(t, "hunter") - 1) * 0.15 : 1);
      if (rt(e, s, i, t, a.source, a, r), j(t, "pinning") && a.source === "attack" && (s.chill = 50 + j(t, "pinning") * 20, e.player.combo % 3 === 0 && Dt(e, s, 8 * j(t, "pinning"))), a.splash > 0) {
        we(e, s, "burst", a.splash);
        for (const l of e.enemies) l.id !== s.id && Q(l, s) < a.splash + pe[l.kind].radius && rt(e, l, i * 0.55, t, a.source, s, r);
      }
      if (a.bounce > 0) {
        const l = e.enemies.filter((c) => c.hp > 0 && !a.hits.includes(c.id) && Q(c, s) < 6 && le(r, a, c, a.radius)).sort((c, o) => Q(s, c) - Q(s, o))[0];
        if (l) {
          a.bounce--, a.angle = de(a, l), a.damage *= 0.8;
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
function kl(e, t, r) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      if (a.damage <= 0) continue;
      const s = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if ((s ? !a.hits.includes(0) : e.tick % 15 === 0) && un(a, e.player, K.playerRadius) && le(r, a, e.player)) {
        const i = a.pull && !e.player.invulnerable && !e.player.shield && e.player.hp > 0;
        Rn(e, a.damage, t, r), s && a.hits.push(0), i && it(e, e.player, de(e.player, a), Math.min(a.pull, Math.max(0, Q(e.player, a) - 1.8)), K.playerRadius, r);
      }
      if (!e.boss && e.encounter === "siege" && e.tick % 15 === 0 && un(a, e.objective, 0.6) && le(r, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35)), s || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!s || !a.hits.includes(i.id)) && un(a, i, 0.3) && le(r, a, i) && (i.hp -= a.damage * 0.25, s && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((s) => s.hp > 0 && un(a, s, pe[s.kind].radius) && le(r, a, s));
    a.kind === "mine" && n.length && (a.life = 0, we(e, a, "burst", a.radius));
    for (const s of n) a.kind === "storm" ? ar(e, s, t, a.damage, r, a) : (a.kind === "fire" && (s.burn = Math.max(s.burn, 45)), a.kind === "frost" && (s.chill = Math.max(s.chill, 60)), a.kind === "mine" && Dt(e, s, 25), rt(e, s, a.damage, t, a.source, a, r));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function Sl(e, t, r) {
  Ml(e, t, r), kl(e, t, r);
}
function Rl(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function Cl(e, t, r) {
  const { seed: a, zone: n, chapter: s, elite: i, boss: l, bossKind: c, encounter: o, hp: u } = e, h = {
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
    waves: l ? 1 : i ? 3 : 2,
    nextWave: 0,
    kills: 0,
    damageTaken: 0,
    status: "fighting",
    zone: n,
    chapter: s,
    elite: i,
    boss: l,
    bossKind: c,
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
  return r && ((l && !Zr(c) || r.waves.some((d) => d.some((p) => !Zr(p.kind)))) && je("encounter_unsupported"), (o !== "skirmish" || !r.waves.length || !$t(r.space, r.entry, K.playerRadius) || r.waves.some((d) => !d.length || d.some((p) => !$t(r.space, p.position, pe[p.kind].radius) || !pa(r.space, r.entry, p.position, K.playerRadius)))) && je("map_invalid"), Object.assign(h.player, r.entry), Object.assign(h.objective, r.objective), h.obstacles = [], h.waves = r.waves.length), hl(h), mn(h, t, r), h;
}
function El(e, t, r, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((s) => --s.life > 0).slice(-80);
  const n = sl(e, t, r, a);
  ol(e, r, a), _l(e, r, n, a), Sl(e, r, a), e.enemies = e.enemies.filter((s) => s.hp > 0), Rl(e) ? e.status = "lost" : (dl(e, r, a), ul(e, a) && (e.status = "won", e.shots = [], e.hazards = []));
}
function Pl(e, t) {
  const r = e.at(-1);
  r && r.move === t.move && r.dash === t.dash && r.skill === t.skill ? r.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var Al = 2.4;
function Nt(e, t) {
  return (!e?.all || e.all.every((r) => t.has(r))) && (!e?.none || e.none.every((r) => !t.has(r)));
}
var Vr = /* @__PURE__ */ new WeakMap();
function Tt(e, t) {
  const r = e.gates.filter((i) => Nt(i.condition, t)).map((i) => i.id), a = r.join("/");
  let n = Vr.get(e);
  n || (n = /* @__PURE__ */ new Map(), Vr.set(e, n));
  let s = n.get(a);
  return s || (s = js(e.map, new Set(r)), n.set(a, s)), s;
}
function Cn(e, t) {
  const r = e.exits.filter((n) => Nt(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => Nt(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...r, ...a];
}
function La(e, t, r) {
  const a = Tt(e, r);
  return Cn(e, r).filter((n) => Q(t.position, n.position) <= 2.4 && De(a, t.position, n.position)).sort((n, s) => Q(t.position, n.position) - Q(t.position, s.position) || n.target.id.localeCompare(s.target.id));
}
function zl(e, t, r, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && je("input_invalid"), t && (e.facing = kr(t), Mr(r, e.position, {
    x: Math.cos(e.facing) * K.speed * a,
    y: Math.sin(e.facing) * K.speed * a
  }, K.playerRadius));
}
var Il = [
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
  ...mi
], Ae = (e, t) => ({
  kind: e,
  anchor: t
}), ft = {
  ...zs,
  ...Es,
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
      Ae("soldier", "front_left"),
      Ae("soldier", "front_right"),
      Ae("archer", "front_archer")
    ], [
      Ae("guard", "patrol"),
      Ae("soldier", "lookout"),
      Ae("bomber", "flank")
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
      Ae("guard", "guard"),
      Ae("soldier", "flank"),
      Ae("archer", "archer"),
      Ae("archer", "archer_left")
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
      Ae("guard", "guard"),
      Ae("archer", "archer"),
      Ae("bomber", "bomber")
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
      Ae("soldier", "front_left"),
      Ae("soldier", "front_right"),
      Ae("archer", "front_archer")
    ], [
      Ae("guard", "front_guard"),
      Ae("bomber", "front_bomber"),
      Ae("soldier", "front_flank")
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
    waves: [[Ae("keeper", "guard")]]
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
    waves: [[Ae("warden", "warden")]]
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
    waves: [[Ae("thornheart", "tree")]]
  }
}, En = (e) => Il.filter((t) => ft[t].scene === e), wn = (e, t, r) => {
  const a = ft[e];
  return a.complete ? t.has(a.complete) : r.includes(e) || En(a.scene).some((n) => {
    const s = ft[n];
    return s.prerequisite === e && s.complete && t.has(s.complete);
  });
};
function Hs(e, t, r) {
  return En(e).find((a) => !wn(a, t, r) && (!ft[a].prerequisite || wn(ft[a].prerequisite, t, r)));
}
function Vs(e, t, r, a, n, s) {
  const i = ft[e];
  if (i.complete && t.has(i.complete)) return null;
  const l = Se[i.scene];
  return {
    setup: {
      seed: a,
      zone: Jt[i.boss ?? "warden"].region,
      chapter: Object.hasOwn(Es, e) ? 2 : Object.hasOwn(zs, e) ? 1 : 0,
      elite: e === "coal_store",
      boss: i.boss !== null,
      bossKind: i.boss ?? "warden",
      encounter: "skirmish",
      hp: n
    },
    field: {
      space: Fs(Tt(l, t), i.bounds),
      entry: r,
      objective: l.anchors[i.trigger],
      waves: i.waves.map((c) => c.filter((o) => !(e === "furnace_scaffold" && t.has("furnace_residents_helped") && o.kind === "bomber")).map((o) => ({
        kind: o.kind,
        position: l.anchors[o.anchor]
      }))),
      summonPoints: i.summons.map((c) => l.anchors[c]),
      bounds: i.bounds,
      segment: e,
      reinforcement: s,
      enemyLimit: i.boss ? Ne.bossEnemyLimit : Ne.enemyLimit,
      ...e === "beacon" ? { signalPoint: l.anchors.signal } : {},
      ...e === "furnace_heart" ? { furnacePrepared: t.has("furnace_workers_helped") } : {}
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
}, Pn = Object.keys(Xe), nr = [
  ..._t,
  ...Pn,
  ...va
];
function Ee(e) {
  return Object.hasOwn(Os, e);
}
function Gs(e) {
  return Object.hasOwn(Xe, e);
}
function Mt(e) {
  return Object.hasOwn(Ue, e);
}
function Ze(e) {
  return Ee(e) ? Os[e] : Gs(e) ? Xe[e].name : Ue[e].name;
}
var $l = {
  visit_wen: {
    people: ["sanniang"],
    requires: ua,
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
    requires: ua,
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
    requires: ua,
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
    requires: ua,
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
}, Oa = {
  ...$l,
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
    requires: ua,
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
}, Ys = Object.keys(Oa);
function Qs(e) {
  return e && Object.hasOwn(Oa, e) ? Oa[e] : void 0;
}
function Gr(e, t) {
  if (!Ee(t) && !Mt(t)) return [];
  const { facts: r } = e, a = Ee(t) ? e.people[t].scene : Ue[t].scene;
  return Ys.filter((n) => {
    if (n === "receiving" && r.includes("captives_arrived")) return !1;
    const s = Oa[n];
    if (s.district && ht(a) !== s.district || s.scenes && !s.scenes.includes(a) || s.excludes?.some((i) => r.includes(i)) || s.minPeak !== void 0 && (!Ee(t) || e.relationships[t].highestBand < s.minPeak) || s.present?.some((i) => (Ee(i) ? e.people[i].scene : Mt(i) ? Ue[i].scene : null) !== a)) return !1;
    if (s.atClinic) {
      if (!Ee(t)) return !1;
      const i = e.people[t], l = Va[t].station, c = Se[l.scene].anchors[l.anchor];
      if (a !== "clinic_front" && !(a === l.scene && Math.hypot(i.position.x - c.x, i.position.y - c.y) <= 2.4)) return !1;
    }
    return s.people.includes(t) && !r.includes(s.fact) && s.requires.every((i) => r.includes(i));
  });
}
function Tl(e, t) {
  if (t.kind === "reward") {
    const r = e.rewards[t.node];
    return !!r?.offers.length && r.scene === e.location.scene;
  }
  return t.kind !== "rest" || e.location.scene !== "waterway" || wn("waterway_approach", new Set(e.facts), e.completedSegments);
}
function Rr(e, t = !1) {
  const r = Se[e.location.scene], a = new Set(e.facts);
  return (t ? La(r, e.location, a) : Cn(r, a)).filter((n) => n.kind === "exit" || Tl(e, n.target));
}
function Ks(e) {
  return e.phase === "exploration" && (Se[e.location.scene].safe || Rr(e, !0).some((t) => t.kind === "object" && t.target.kind === "rest"));
}
function Ll(e, t) {
  return e === "kouzi_home" && t === "deep_waterway" || e === "deep_waterway" && t === "kouzi_home";
}
function Cr(e, t) {
  const r = e.knowledge[t], a = t === "kouzi" || r.includes("deep_route_agreed") || r.includes("deep_route_walked"), n = a || e.facts.includes("deep_route_shared") || Ee(t) && e.people[t].scene === "deep_waterway";
  return {
    place: (s) => s !== "deep_waterway" || n,
    exit: (s, i) => Ll(s, i) ? a : s !== "deep_waterway" && i !== "deep_waterway" || n
  };
}
var ma = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Yr = /* @__PURE__ */ new WeakMap();
function rr(e, t, r) {
  if (De(e, t, r, K.playerRadius)) return r;
  const a = fa(e.map, t), n = fa(e.map, r), s = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Yr.get(e);
  i || (i = /* @__PURE__ */ new Map(), Yr.set(e, i));
  const l = ha(e.map, a.column, a.row);
  if (!i.has(s)) {
    const o = pa(e, l, ha(e.map, n.column, n.row), K.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(s, o?.find((u) => ma(u, l) > 0.01) ?? null);
  }
  const c = i.get(s);
  return c ? De(e, t, c, K.playerRadius) ? c : l : null;
}
function Ol(e) {
  return {
    scene: e.scene,
    position: { ...Se[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function sr(e, t) {
  return En(e).every((r) => {
    const a = ft[r];
    return a.complete === null || t.has(a.complete);
  });
}
function xn(e, t, r, a, n) {
  const s = [{
    ...e,
    route: []
  }], i = /* @__PURE__ */ new Set();
  for (; s.length; ) {
    const l = s.shift(), c = Se[l.scene], o = Tt(c, r);
    if (l.scene === t.scene && rr(o, l.position, c.anchors[t.anchor])) return l.route;
    for (const u of Se[l.scene].exits) {
      const h = `${u.to}/${u.arrival}`;
      i.has(h) || n && !n(l.scene, u.to) || !Nt(u.condition, r) || a && !sr(u.to, r) || !rr(o, l.position, c.anchors[u.anchor]) || (i.add(h), s.push({
        scene: u.to,
        position: Se[u.to].anchors[u.arrival],
        route: [...l.route, u]
      }));
    }
  }
  return null;
}
function Xs(e, t) {
  const r = new Set(e.facts), a = e.people[t], n = Cr(e, t);
  return Object.entries(kn).filter(([, s]) => n.place(s.scene) && (!wr(ht(s.scene)) || ua.every((i) => r.has(i)) && (s.scene !== "deep_waterway" || r.has("deep_route_agreed")))).map(([s, i]) => {
    const l = xn(a, i, r, !1, n.exit), c = sr(i.scene, r), o = sr(a.scene, r) && c ? xn(a, i, r, !0, n.exit) : null;
    return {
      id: s,
      name: i.name,
      ...Kn(i.scene) ? { use: Kn(i.scene).use } : {},
      personHere: a.scene === i.scene && (s === i.scene || ma(a.position, Se[i.scene].anchors[i.anchor]) <= 2.4),
      playerHere: e.location.scene === i.scene && (s === i.scene || ma(e.location.position, Se[i.scene].anchors[i.anchor]) <= 2.4),
      accessible: l !== null,
      safe: c,
      solo: o !== null,
      route: o ?? l
    };
  });
}
function jl(e, t) {
  return Rs(e.facts, t) !== "confined";
}
var Js = (e) => Al * (0.7 + _t.indexOf(e) / _t.length * 0.2);
function Nl(e) {
  return _t.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && ma(e.people[t].position, e.location.position) >= Js(t));
}
function eo(e, t) {
  return _t.filter((r) => t[r].scene === e).map((r) => ({
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
function to(e) {
  return [...Rr(e), ...eo(e.location.scene, e.people)];
}
function ao(e) {
  return An(Se[e.location.scene], e.location.position, new Set(e.facts), e.people);
}
function An(e, t, r, a) {
  return eo(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const s = e.id === "cells" && !!Va[n.target.person].returnFact && !r.has("captives_released"), i = Tt(e, s ? /* @__PURE__ */ new Set([...r, "captives_released"]) : r);
    return ma(n.position, t) <= (s ? 5 : 2.4) && De(i, t, n.position);
  });
}
function Ul(e) {
  const t = new Set(e.facts);
  for (const r of _t) {
    const a = e.people[r];
    if (a.mode === "idle") continue;
    const n = Se[a.scene], s = Tt(n, t);
    let i, l;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && ge("invalid"), i = e.location.position, ma(a.position, i) < Js(r)) continue;
    } else {
      const p = kn[a.destination], m = xn(a, p, t, !0, Cr(e, r).exit);
      if (m || ge("unavailable"), l = m[0], i = n.anchors[l?.anchor ?? p.anchor], ma(a.position, i) < 0.2) {
        l ? (a.scene = l.to, a.position = { ...Se[l.to].anchors[l.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const c = rr(s, a.position, i);
    c || ge("unavailable");
    const o = c.x - a.position.x, u = c.y - a.position.y, h = Math.hypot(o, u), d = Math.min(h, K.speed * 1.8);
    h && (a.facing = Math.atan2(u, o), Mr(s, a.position, {
      x: o / h * d,
      y: u / h * d
    }, K.playerRadius));
  }
}
function _n(e, t) {
  const r = Xe[e];
  return Se[r.scene].anchors[t.has(r.complete) ? r.clearedAnchor : r.anchor];
}
function Ja(e, t, r) {
  return Pn.filter((a) => Xe[a].scene === e).flatMap((a) => {
    const n = _n(a, r), s = Xe[a];
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
function Fl(e, t) {
  return e.phase === "exploration" && !e.pendingParley && Ja(e.location.scene, e.location.position, new Set(e.facts)).some((r) => r.target.id === t);
}
function or(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && ge("invalid"), e;
}
function Qr(e, t = 0, r = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > r) && ge("invalid"), e;
}
function Xt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && ge("invalid"), e;
}
function Kr(e, t, r) {
  return (!Array.isArray(e) || e.length > t) && ge("invalid"), e.map(r);
}
function Dl(e) {
  return new Set(e).size !== e.length && ge("invalid"), e;
}
function Xr(e) {
  typeof e != "boolean" && ge("invalid");
}
function Zl(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && ge("identity"), e;
}
var Qa = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), Bl = Object.keys(Qa), no = ["male", "female"];
function ql(e) {
  const t = or(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && ge("invalid"), {
    name: t.name.trim(),
    gender: Xt(t.gender, no),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: Xt(t.appearanceAge, Bl) }
  };
}
var Wl = {
  ...Object.fromEntries(va.map((e) => [e, { initial: { reply: Ue[e].greeting } }])),
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
function ro(e, t) {
  const r = Wl[t], a = Ee(t) && Ga(e.facts, t) && r.returned ? r.returned : r.initial;
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
var ja = Object.freeze({
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
function Er(e) {
  return ja.bands.filter((t) => e >= t).length - 1;
}
function Hl(e) {
  const t = e.lastReply;
  if (!t) return null;
  const r = e.conversations[t.person].at(-1);
  return r?.id === t.turnId ? {
    person: t.person,
    turn: r
  } : null;
}
function Jr(e, t) {
  const r = e.conversations[t].at(-1);
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
function zn(e) {
  const t = Hl(e), r = Qs(t?.turn.action ?? null);
  return t && r?.confirm && !e.facts.includes(r.fact) ? t.person : null;
}
var so = Object.freeze({
  rankCap: 2,
  choices: 3
}), Gl = [
  "city_arrival",
  "return_plan",
  "bridge",
  "heatkeeper",
  "coal_store"
], Yl = [
  "furnace_trial",
  "furnace_convoy",
  "furnace_ascent"
], Ql = (e) => Gl.includes(e) || Yl.includes(e) ? 3 : so.rankCap, Kl = [
  "crossroads",
  "approach",
  "passage"
], Xl = {
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
}, Jl = {
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
function ec(e, t) {
  if (e.rewards[t]) return;
  const r = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((c) => e.equipped.includes(c.id))
  }, a = new Set(Object.values(e.rewards).flatMap((c) => c.offers.map((o) => o.id))), n = Kl.includes(t), s = Ki(e.weapon).flatMap((c) => {
    const o = e.collection.find((u) => u.id === c)?.rank ?? 0;
    return !a.has(c) && o < Ql(t) && (!n || !o) && Us(r, c) && (Ta[c].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: c,
      rank: o + 1
    }] : [];
  }), i = [], l = (c) => {
    const o = Fr(e, s.filter((u) => c.includes(u.id) && !i.some((h) => h.id === u.id)), 1)[0];
    o && i.push(o);
  };
  if (t === "crossroads") for (const c of Xl[e.weapon]) l([c]);
  else
    l(e.equipped.flatMap((c) => Jl[c] ?? [])), l(s.filter((c) => ["guard", "life"].includes(Ta[c.id].family)).map((c) => c.id));
  i.push(...Fr(e, s.filter((c) => !i.some((o) => o.id === c.id)), so.choices - i.length)), e.rewards[t] = {
    scene: e.location.scene,
    offers: i
  };
}
var tc = (e) => e.rewardNode ? e.rewards[e.rewardNode].offers : [];
function ac(e, t) {
  const r = xr(t), a = new Set(e.facts);
  if (!r) return null;
  const n = a.has(r.fact), s = new Set(n ? [] : ao(e).map((u) => u.target.id)), i = n ? [] : (r.witnesses ?? []).filter((u) => Ee(u) ? !s.has(u) : !Mt(u) || Ue[u].scene !== e.location.scene), l = As.find((u) => r.witnesses?.includes(u.person))?.resolved.find((u) => a.has(u));
  let c = i.length ? Ve.awaitWitness(i.map(Ze).join("、")) : r.body, o = !n && !i.length ? r.operation ?? null : null;
  return !n && t === "return_trial" && a.has("bridge_cleared") && (c = Ve.trialAfterBridge, o && (o = {
    ...o,
    setup: Ve.trialAfterBridgeSetup
  })), n && (c = `${Ve.reviewed}
${Ya[r.fact]}`, l && (c += `

${Ve.now}
${Ya[l]}`)), a.has("heat_restored") && (t === "heat_notice" && (c = Ve.restoredNotice), t === "return_plan" && (c = Ve.restoredPlan), t === "deep_receipt" && !i.length && !l && (c += `

${Ve.restoredDeep}`)), {
    ...r,
    body: c,
    ready: !i.length,
    read: n,
    operation: o
  };
}
var oo = Object.freeze({
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function Pr(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((r) => r.id === t))
  };
}
function nc(e, t) {
  return Ks(e) ? t.length > K.relicSlots ? "capacity" : new Set(t).size !== t.length || t.some((r) => !e.collection.some((a) => a.id === r)) ? "invalid" : null : "unavailable";
}
function Ka(e, t, r) {
  e.facts.includes(t) || e.facts.push(t);
  const a = r ?? [
    ..._t.filter((n) => e.people[n].scene === e.location.scene),
    ...Pn.filter((n) => Xe[n].scene === e.location.scene),
    ...va.filter((n) => Ue[n].scene === e.location.scene)
  ];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function rc(e) {
  const t = e.checkpoint;
  if (e.engagement)
    return Vs(e.engagement.id, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.engagement.reinforcement)?.field;
}
function sc(e, t) {
  const r = e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"), a = Vs(t, new Set(e.facts), e.location.position, Math.floor(Sn(e) * 4294967296), e.hp, r);
  a || ge("unavailable"), e.engagement = {
    id: t,
    reinforcement: r
  }, e.battle = Cl(a.setup, Pr(e), a.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
}
function es(e, t) {
  return zn(e) ? !1 : Mt(t) ? e.phase === "exploration" && !e.pendingParley && La(Se[e.location.scene], e.location, new Set(e.facts)).some((r) => r.kind === "object" && r.target.kind === "resident" && r.target.person === t) : Ee(t) ? e.pendingParley ? !1 : e.phase === "exploration" && ao(e).some((r) => r.kind === "object" && r.target.kind === "person" && r.target.person === t) : Fl(e, t);
}
function oc(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const t = ht(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const r of Ur) {
    if (Ga(e.facts, r)) continue;
    const a = e.people[r];
    t && a.scene === "cells" && a.mode === "idle" && (e.people[r] = Ol(Va[r].station));
    const n = e.people[r].scene;
    ht(n) === "camp" && Ka(e, Va[r].returnFact, _t.filter((s) => e.people[s].scene === n));
  }
  Ur.every((r) => Ga(e.facts, r)) && Ka(e, "captives_arrived", _t.filter((r) => e.people[r].scene === "camp"));
}
function ic(e) {
  !e.facts.includes("kouzi_entered_city") && ["south_street", "workshop_street"].includes(ht(e.people.kouzi.scene)) && Ka(e, "kouzi_entered_city", ["kouzi"]);
}
function lc(e) {
  const t = e.engagement.id, r = ft[t];
  r.complete ? Ka(e, r.complete) : e.completedSegments.includes(t) || e.completedSegments.push(t), r.reward && ec(e, r.reward), e.phase = "exploration", e.battle = null, e.checkpoint = null, e.engagement = null;
}
function ts(e, t) {
  if (!(e.pendingParley || zn(e))) {
    if (e.phase === "battle" && e.battle) {
      const r = rc(e);
      r || ge("invalid"), El(e.battle, t, Pr(e), r);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, e.engagement?.id === "beacon" && a.objective.hp === 0 && Ka(e, "alarm_raised"), a.status === "won" ? lc(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const r = Se[e.location.scene], a = new Set(e.facts);
      zl(e.location, t.move, Tt(r, a), oo.explorationSpeed);
      const n = Hs(r.id, a, e.completedSegments);
      if (n) {
        const s = ft[n], i = r.anchors[s.trigger];
        Math.hypot(e.location.position.x - i.x, e.location.position.y - i.y) <= s.triggerRadius && $t(Fs(Tt(r, a), s.bounds), e.location.position, K.playerRadius) && sc(e, n);
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (Ul(e), oc(e), ic(e));
  }
}
var io = [
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
    fact: _r.fact,
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
    key: Jt.warden.awardKey,
    amount: K.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: Jt.thornheart.awardKey,
    amount: K.firstBossAward
  }
], S0 = Object.fromEntries([
  ...ri.map((e) => [Jt[e].awardKey, K.firstBossAward]),
  ["victory", K.firstVictoryAward],
  ...Object.keys(Kt).map((e) => [`mastery-${e}`, K.masteryAward]),
  ...ai.map((e) => [`oath-${e}`, K.oathAward]),
  ...io.map((e) => [e.key, e.amount])
]), Sa = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, lo = {
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
    gestures: Sa
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
    gestures: Sa
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
    gestures: Sa
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
    gestures: Sa
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
      ...Sa,
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
    gestures: Sa
  }
};
function co(e) {
  return Object.hasOwn(lo, e);
}
function cc(e) {
  return co(e) ? lo[e] : {
    expressions: {},
    gestures: {}
  };
}
var Ar = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, dc = {
  ...Object.fromEntries(va.map((e) => [e, Ue[e].clothing])),
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
}, Xa = {
  title: "服饰",
  absent: "未穿",
  changed: "服饰变化",
  rejected: "服饰未完整更新。"
};
function uo(e, t) {
  const r = { ...dc[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(r, a.clothing);
  return r;
}
var uc = {
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
}, hc = Object.keys(uc), R0 = [
  ...hc,
  "soldier",
  "archer",
  "guard",
  "priest",
  "charger",
  "stalker",
  "bomber",
  "wisp"
], fc = (e) => Xt(e, Cs), Hn = (e) => Xt(e, $s), as = (e) => Xt(e, Is);
function pc(e) {
  const t = or(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: fc(t.weapon),
        outfit: as(t.outfit),
        traveler: ql(t.traveler)
      };
    case "purchase":
    case "equip":
      return {
        type: t.type,
        id: as(t.id)
      };
    case "interact":
      return {
        type: "interact",
        id: Zl(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: Xt(t.id, Ys),
        person: Xt(t.person, nr)
      };
    case "greet":
      return {
        type: "greet",
        person: Xt(t.person, nr)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: Dl(Kr(t.equipped, K.relicSlots, Hn))
      };
    case "input": {
      const r = Kr(t.spans, K.maxInputTicks, (a) => {
        const n = or(a);
        return Xr(n.dash), Xr(n.skill), {
          move: Qr(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Qr(n.ticks, 1, K.maxInputTicks)
        };
      });
      return (!r.length || r.reduce((a, n) => a + n.ticks, 0) > K.maxInputTicks) && ge("invalid"), {
        type: "input",
        spans: r
      };
    }
    case "relic":
      return {
        type: "relic",
        id: Hn(t.id),
        ...t.replace === void 0 ? {} : { replace: Hn(t.replace) }
      };
    case "leave":
    case "retry":
    case "retreat":
    case "resolve_parley":
    case "accept_reply":
      return { type: t.type };
    default:
      return ge("invalid");
  }
}
function mc(e, t) {
  const r = Wt(null), a = W(!1), n = W(""), s = Wt(null), i = W(!1), l = W(!1), c = Wt(null), o = Wt(null), u = W(null), h = G(() => r.value?.replyFailure?.actionId === u.value ? null : r.value?.replyFailure ?? null), d = G(() => i.value || !!r.value?.conversation), p = W(!1), m = W(!1);
  let x = !1;
  const b = Wt(null), y = G(() => {
    const M = (b.value ?? r.value)?.conversation;
    return M || (i.value ? c.value : null);
  }), _ = G(() => a.value || d.value || l.value || !!s.value || !r.value?.ready || r.value.writeState !== "ready" || r.value.pending), S = (M, O) => M.data.revision !== O.data.revision ? M.data.revision > O.data.revision : M.fileRevision >= O.fileRevision;
  function E(M) {
    if (x || r.value && !S(M, r.value)) return;
    const O = c.value;
    (r.value?.data.active?.id !== M.data.active?.id || O && M.data.active?.conversations[O.person].some((N) => N.id === O.actionId)) && (c.value = null), r.value = M;
  }
  const L = G(() => {
    if (c.value) return c.value;
    if (r.value?.conversation) return {
      ...r.value.conversation,
      status: "sending"
    };
    const M = r.value?.replyFailure;
    return !M || M.regenerating || r.value?.data.active?.conversations[M.person].some((O) => O.id === M.actionId) ? null : {
      actionId: M.actionId,
      person: M.person,
      text: M.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function w(M, O, N) {
    if (x || a.value) return !1;
    a.value = !0, b.value = null, n.value = "";
    try {
      const F = await e.request(`game/expedition/${M}`, {
        chatIdentity: t,
        ...M === "rebuild" ? { actionId: Bn() } : {},
        ...O,
        ...N ? { person: N } : {}
      }, 35e3), V = b.value;
      return E(V && S(V, F.result) ? V : F.result), p.value = !1, m.value = !1, r.value?.writeState === "ready" && !r.value.pending && M !== "read" && (s.value = null), !0;
    } catch (F) {
      if (!x) {
        p.value = !0, b.value && E(b.value), n.value = Yt(F);
        const V = F && typeof F == "object" && "code" in F ? String(F.code) : "";
        m.value = V === "expedition_data_invalid", O && (V.startsWith("expedition_save_") || V.startsWith("host_request_")) && (s.value = O);
      }
      return !1;
    } finally {
      b.value = null, x || (a.value = !1);
    }
  }
  const C = e.subscribe((M) => {
    if (x) return;
    if (M.type === "game/expedition/error") {
      const N = M.payload;
      N.chatIdentity === t && (n.value = Yt(N), m.value = N.code === "expedition_data_invalid");
      return;
    }
    if (M.type !== "game/expedition/state") return;
    const O = M.payload;
    O.chatIdentity === t && (a.value ? b.value = O.state : (b.value = null, E(O.state)));
  });
  async function R() {
    const M = s.value;
    return !await w("confirm") || !r.value || r.value.writeState !== "ready" || r.value.pending ? !1 : M && r.value.data.revision === M.revision ? w("act", M) : (s.value = null, l.value = !1, !0);
  }
  async function A(M, O, N) {
    if (_.value || x) return !1;
    const F = Bn();
    o.value = N ? {
      person: M,
      turnId: N
    } : null, c.value = {
      actionId: F,
      person: M,
      text: O,
      regenerating: !!N,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", b.value = null;
    try {
      const V = await e.request(N ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: F,
        revision: r.value.data.revision,
        person: M,
        text: O,
        ...N ? { turnId: N } : {}
      }, 18e4), H = b.value;
      return E(H && S(H, V.result) ? H : V.result), !0;
    } catch (V) {
      if (!x) {
        b.value && E(b.value);
        const H = V && typeof V == "object" && "code" in V ? String(V.code) : V instanceof Error ? V.message : "";
        if (H === "expedition_cancelled")
          return n.value = "", !1;
        l.value = H.startsWith("host_request_") || H.startsWith("expedition_save_"), n.value = l.value ? B.aiUnknown : r.value?.replyFailure?.actionId === F ? "" : Yt(V);
      }
      return !1;
    } finally {
      o.value = null, i.value = !1, b.value = null, x || (a.value = !1, c.value?.actionId === F && (c.value = N ? null : {
        ...c.value,
        status: "failed"
      }));
    }
  }
  async function T() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (M) {
        x || (n.value = Yt(M));
      }
  }
  const I = G(() => p.value || !!s.value || l.value || !r.value || r.value.pending || r.value.writeState !== "ready");
  return {
    view: r,
    busy: a,
    error: n,
    blocked: _,
    failed: s,
    talking: d,
    uncertainTalk: l,
    talk: A,
    outgoing: L,
    replacingReply: o,
    conversationProgress: y,
    cancelTalk: T,
    recoveryRequired: I,
    dataInvalid: m,
    conversationFailure: h,
    dismissConversationFailure() {
      u.value = r.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => w("rebuild"),
    retryMemory: (M) => _.value ? Promise.resolve(!1) : w("retry-memory", void 0, M),
    dismissError() {
      I.value || (n.value = "");
    },
    notice: G(() => n.value || (r.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(r.value.writeState) || r.value.pending && r.value.writeState === "ready") ? oe.saveError : "")),
    read: () => w("read"),
    recover: R,
    act: (M) => _.value ? Promise.resolve(!1) : w("act", {
      actionId: Bn(),
      revision: r.value.data.revision,
      command: pc(M)
    }),
    dispose() {
      x = !0, C();
    }
  };
}
function gc(e) {
  const t = Wt(null), r = Wt(!1);
  let a = [], n = 0, s = null, i = !1;
  function l() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const d of a) for (let p = 0; p < d.ticks; p++) ts(t.value, d);
    r.value = a.length > 0;
  }
  const c = ue(e.view, () => {
    !s && !a.length && l();
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
    return s = null, d ? l() : e.failed.value || (a = h.concat(a), n = a.reduce((p, m) => p + m.ticks, 0)), r.value = a.length > 0 || !d, d;
  }
  function u(h) {
    const d = t.value;
    !d || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= K.maxInputTicks || !["exploration", "battle"].includes(d.phase) || d.phase === "exploration" && !h.move && !Nl(d) || (ts(d, h), Pl(a, h), n++, r.value = !0, Ao(t), (n >= K.checkpointTicks || !["exploration", "battle"].includes(d.phase)) && o());
  }
  return {
    current: t,
    dirty: r,
    input: u,
    flush: o,
    sync: l,
    async recover() {
      return await e.recover() ? (l(), o()) : !1;
    },
    dispose() {
      i = !0, c();
    }
  };
}
var { recent: Vn, maximum: ns } = jo;
function vc(e) {
  const { history: t, pending: r, talking: a, person: n, campaignId: s, transcript: i, freshReply: l } = e, c = zo(/* @__PURE__ */ new Map());
  let o = 0, u = !1;
  const h = G(() => t.value.reduce((T, I) => T + (I.kind === "greeting" || I.kind === "player" ? 1 : 2), 0)), d = G(() => h.value + Number(r.value)), p = G(() => Oo(c.get(n.value)?.range, d.value)), m = G(() => {
    const T = [];
    let I = 0;
    for (const M of t.value) {
      if (I >= p.value.end) break;
      const O = M.kind === "greeting" ? ["npc"] : M.kind === "player" ? ["player"] : ["player", "npc"];
      for (const N of O)
        I >= p.value.start && I < p.value.end && T.push({
          key: `${M.id}:${N}`,
          side: N,
          turn: M
        }), I++;
    }
    return T;
  }), x = G(() => p.value.start > 0), b = G(() => p.value.end < d.value), y = G(() => b.value || p.value.end - p.value.start > Vn), _ = G(() => r.value && p.value.end > h.value);
  function S(T) {
    T && !T.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function E(T, I) {
    const M = T.getBoundingClientRect().top, O = [...T.querySelectorAll("[data-message-key]")].find((N) => I.has(N.dataset.messageKey) && N.getBoundingClientRect().bottom > M);
    return O ? {
      key: O.dataset.messageKey,
      offset: O.getBoundingClientRect().top - M
    } : null;
  }
  function L(T, I) {
    const M = I && [...T.querySelectorAll("[data-message-key]")].find((O) => O.dataset.messageKey === I.key);
    return !M || !I ? !1 : (T.scrollTop += M.getBoundingClientRect().top - T.getBoundingClientRect().top - I.offset, !0);
  }
  function w() {
    const T = i.value;
    if (!T || u || c.get(n.value)?.latest === !1) return;
    const I = l.value ? T.querySelector('[data-fresh-reply="true"]') : null;
    T.scrollTop = I && I.offsetHeight > T.clientHeight ? I.getBoundingClientRect().top - T.getBoundingClientRect().top + T.scrollTop - 12 : T.scrollHeight;
  }
  function C() {
    const T = ++o, I = n.value, M = i.value?.contains(document.activeElement) ? document.activeElement : null;
    u = !1, l.value = null, c.delete(I), zt(() => {
      o === T && n.value === I && (w(), S(M));
    });
  }
  function R() {
    const T = i.value;
    if (!T || u) return;
    const I = !b.value && T.scrollHeight - T.clientHeight - T.scrollTop < 32;
    if (I && y.value) {
      C();
      return;
    }
    c.set(n.value, {
      top: T.scrollTop,
      latest: I,
      range: I ? null : {
        start: p.value.start,
        end: b.value ? p.value.end : null
      }
    });
  }
  async function A(T) {
    const I = i.value;
    if (!I || u) return;
    const M = { ...p.value };
    T === "older" ? (M.start = Math.max(0, M.start - Vn), M.end = Math.min(M.end, M.start + ns)) : (M.end = Math.min(d.value, M.end + Vn), M.start = Math.max(M.start, M.end - ns));
    const O = E(I, new Set(m.value.filter((te, ne) => {
      const Ie = p.value.start + ne;
      return Ie >= M.start && Ie < M.end;
    }).map((te) => te.key))), N = I.contains(document.activeElement) ? document.activeElement : null, F = n.value, V = ++o;
    u = !0;
    const H = {
      start: M.start,
      end: M.end === d.value ? null : M.end
    };
    c.set(F, {
      range: H,
      top: I.scrollTop,
      latest: !1
    }), await zt(), !(V !== o || n.value !== F || i.value !== I) && (L(I, O) || (I.scrollTop = T === "older" ? 0 : I.scrollHeight), c.set(F, {
      range: H,
      top: I.scrollTop,
      latest: !1
    }), u = !1, S(N));
  }
  return ue(s, () => {
    o++, u = !1, c.clear();
  }), ue([i, n], ([T, I]) => {
    o++, u = !1;
    const M = c.get(I);
    T && (T.scrollTop = M && !M.latest ? M.top : T.scrollHeight);
  }, { flush: "post" }), ue(i, (T, I, M) => {
    if (!T) return;
    const O = new ResizeObserver(w);
    O.observe(T), M(() => O.disconnect());
  }, { flush: "post" }), ue(m, async (T) => {
    const I = i.value, M = n.value, O = o, N = c.get(M);
    if (!I || u || !N || N.latest) return;
    const F = E(I, new Set(T.map((V) => V.key)));
    await zt(), !(O !== o || i.value !== I || c.get(M) !== N) && (L(I, F), N.top = I.scrollTop);
  }), ue([
    t,
    r,
    a,
    l
  ], async () => {
    await zt(), w();
  }), {
    messages: m,
    hasOlder: x,
    hasNewer: b,
    expanded: y,
    pendingVisible: _,
    rememberReading: R,
    resetLatest: C,
    older: () => A("older"),
    newer: () => A("newer")
  };
}
var ut = {
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
}, rs = {
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
}, yc = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, bc = ["d"], wc = ["d"], xc = /* @__PURE__ */ Fe({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, r) => (z(), $("svg", yc, [k("path", {
      d: g(rs)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, bc), k("path", {
      d: g(rs)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, wc)]));
  }
}), Gt = xc, _c = { class: "ember-relics" }, Mc = ["disabled", "onClick"], kc = ["disabled"], Sc = ["disabled"], Rc = { class: "ember-relics" }, Cc = ["disabled", "onClick"], Ec = ["disabled"], Pc = /* @__PURE__ */ Fe({
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
    return (i, l) => n.value ? (z(), $(ee, { key: 0 }, [
      k("h3", null, P(g(da)[n.value].name) + " · " + P(g(ut).replace), 1),
      k("div", _c, [(z(!0), $(ee, null, ke(e.campaign.equipped, (c) => (z(), $("button", {
        key: c,
        type: "button",
        disabled: e.blocked,
        onClick: (o) => a("choose", n.value, c)
      }, [at(Gt, { name: c }, null, 8, ["name"]), k("h3", null, P(g(da)[c].name), 1)], 8, Mc))), 128))]),
      k("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[0] || (l[0] = (c) => a("choose", n.value))
      }, P(g(ut).store), 9, kc),
      k("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[1] || (l[1] = (c) => n.value = null)
      }, P(g(ut).back), 9, Sc)
    ], 64)) : (z(), $(ee, { key: 1 }, [k("div", Rc, [(z(!0), $(ee, null, ke(g(tc)(e.campaign), (c) => (z(), $("button", {
      key: c.id,
      type: "button",
      disabled: e.blocked,
      onClick: (o) => s(c.id)
    }, [
      at(Gt, { name: c.id }, null, 8, ["name"]),
      k("h3", null, [Oe(P(g(da)[c.id].name) + " ", 1), k("small", null, P(g(oe).rank(c.rank)), 1)]),
      k("p", null, P(g(da)[c.id].detail), 1)
    ], 8, Cc))), 128))]), k("button", {
      type: "button",
      disabled: e.blocked,
      onClick: l[2] || (l[2] = (c) => a("leave"))
    }, P(g(B).skip), 9, Ec)], 64));
  }
}), Ac = Pc, he = Object.freeze({
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
    clothing_rejected: Xa.rejected,
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
function zc(e) {
  let t = null, r = null, a = null, n = !1, s = !1, i = null, l = -1, c = 0, o = 0, u = 0, h = 0, d = 0;
  function p(x, b, y, _ = "sine", S = x * 0.8, E = 0) {
    if (!n || !t || !r || t.state !== "running") return;
    const L = t.createOscillator(), w = t.createGain(), C = t.currentTime + E;
    L.type = _, L.frequency.setValueAtTime(x, C), L.frequency.exponentialRampToValueAtTime(Math.max(30, S), C + b), w.gain.setValueAtTime(1e-4, C), w.gain.exponentialRampToValueAtTime(y, C + 9e-3), w.gain.exponentialRampToValueAtTime(1e-4, C + b), L.connect(w).connect(r), L.start(C), L.stop(C + b), L.onended = () => {
      L.disconnect(), w.disconnect();
    };
  }
  function m(x, b, y, _) {
    if (!n || !t || !r || !a || t.state !== "running") return;
    const S = t.createBufferSource(), E = t.createBiquadFilter(), L = t.createGain(), w = t.currentTime;
    S.buffer = a, E.type = "bandpass", E.Q.value = 0.65, E.frequency.setValueAtTime(y, w), E.frequency.exponentialRampToValueAtTime(_, w + x), L.gain.setValueAtTime(1e-4, w), L.gain.exponentialRampToValueAtTime(b, w + 8e-3), L.gain.exponentialRampToValueAtTime(1e-4, w + x), S.connect(E).connect(L).connect(r), S.start(w), S.stop(w + x), S.onended = () => {
      S.disconnect(), E.disconnect(), L.disconnect();
    };
  }
  return {
    async enable(x) {
      if (!s) {
        n = x;
        try {
          if (!x) {
            t && await t.suspend();
            return;
          }
          if (!t) {
            t = new AudioContext(), r = t.createGain(), r.gain.value = 0.55, r.connect(t.destination), a = t.createBuffer(1, t.sampleRate, t.sampleRate);
            const b = a.getChannelData(0);
            for (let y = 0; y < b.length; y++) b[y] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, s || e();
        }
      }
    },
    tick(x) {
      (!i || x.tick < l) && (l = -1, c = x.player.hp, o = x.kills, u = x.player.skill, h = x.serial, d = x.player.combo), i = x, l !== x.tick && (l = x.tick, x.player.hp < c && (m(0.16, 0.17, 800, 120), p(95, 0.2, 0.12, "triangle", 42)), x.kills > o && (p(659, 0.22, 0.045), p(988, 0.3, 0.025, "sine", 980, 0.035)), x.player.combo > d && m(0.095, 0.08, 2700, 500), x.player.dashTime === 7 && m(0.2, 0.09, 500, 2600), x.player.skill > u && (m(0.24, 0.12, 2200, 250), p(165, 0.35, 0.075, "triangle", 82), p(660, 0.36, 0.035, "sine", 440, 0.02)), x.effects.some((b) => b.id > h && b.kind === "lightning") && (m(0.12, 0.1, 4400, 1e3), p(1200, 0.08, 0.018, "sine", 210)), x.effects.some((b) => b.id > h && (b.kind === "block" || b.kind === "parry")) && (p(1350, 0.18, 0.07, "triangle", 740), p(2200, 0.11, 0.025, "sine", 1600)), x.effects.some((b) => b.id > h && b.kind === "ward-hit") && p(510, 0.16, 0.06, "sine", 250), x.effects.some((b) => b.id > h && b.kind === "ward-break") && (m(0.25, 0.1, 3600, 650), p(720, 0.3, 0.05, "sine", 120)), x.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((b, y) => p(b, 0.65, 0.04, "sine", b, y * 0.075)), x.status === "lost" && p(147, 0.7, 0.06, "triangle", 73), c = x.player.hp, o = x.kills, u = x.player.skill, h = x.serial, d = x.player.combo);
    },
    dispose() {
      s = !0, n = !1, t && (t.close().catch(e), t = null), r = null, a = null;
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
}, ss = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], Et = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, tt = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, yt = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, In = [
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
], Ic = {
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
}, C0 = Object.fromEntries(Object.entries(Ta).map(([e, t]) => [e, Ic[t.family]]));
function $c(e, t, r) {
  const a = /* @__PURE__ */ new Set();
  let n = {
    x: 0,
    y: 0
  }, s = !1, i = !1;
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
  return e.addEventListener("keydown", c), window.addEventListener("keyup", o), window.addEventListener("blur", h), {
    frame() {
      const d = n.x || Number(a.has("KeyD") || a.has("ArrowRight")) - Number(a.has("KeyA") || a.has("ArrowLeft")), p = n.y || Number(a.has("KeyS") || a.has("ArrowDown")) - Number(a.has("KeyW") || a.has("ArrowUp")), m = {
        move: Math.hypot(d, p) < 0.15 ? 0 : (Math.round((Math.atan2(p, d) + Math.PI / 2) / (Math.PI / 4)) + 8 - 1) % 8 + 1,
        dash: s,
        skill: i
      };
      return s = !1, i = !1, m;
    },
    stick(d, p) {
      n = {
        x: d,
        y: p
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
      u(), e.removeEventListener("keydown", c), window.removeEventListener("keyup", o), window.removeEventListener("blur", h);
    }
  };
}
function Tc(e, t) {
  let r = null;
  function a(s) {
    if (!r || s.pointerId !== r.id) return;
    const i = r.surface.getBoundingClientRect(), l = i.width * 0.36, c = (s.clientX - i.left - i.width / 2) / l, o = (s.clientY - i.top - i.height / 2) / l, u = Math.max(1, Math.hypot(c, o));
    e(c / u, o / u);
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
function ir(e) {
  const t = new jr();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const r = {
    box: new Ko(1, 1, 1),
    sphere: new Do(1, 20, 14),
    rock: new Or(1, 0),
    crown: new Or(1, 1),
    cylinder: new Wo(1, 1, 1, 24),
    cone: new Go(1, 1, 12),
    disc: new Ho(1, 48),
    ring: new ln(0.965, 1, 64),
    openRing: new ln(0.965, 1, 48, 1, Ne.rootRingGap / 2, Math.PI * 2 - Ne.rootRingGap),
    arc: new ln(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new Lr(1, 0.08, 8, 40),
    stroke: new ln(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new Lr(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new Nr(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  function i(d, p = !1, m = 1, x = !1) {
    const b = `${d}/${p}/${m}/${x}`;
    let y = n.get(b);
    return y || (y = p ? new Vo({
      color: d,
      transparent: m < 1,
      opacity: m,
      depthWrite: m === 1,
      side: 2
    }) : new br({
      color: d,
      map: e?.get(d) ?? null,
      roughness: x ? 0.34 : 0.88,
      metalness: x ? 0.45 : 0.02,
      side: 2
    }), n.set(b, y)), y;
  }
  function l(d, p, m, x, b = [
    0,
    0,
    0
  ], y = !1, _ = 1, S = !1) {
    let E = r[p];
    if (!y && p === "box" && e?.has(m)) {
      E = E.clone(), s.add(E);
      const w = E.getAttribute("position"), C = E.getAttribute("normal"), R = E.getAttribute("uv");
      for (let A = 0; A < R.count; A++) {
        const T = Math.abs(C.getX(A)) > 0.5 ? w.getZ(A) * x[2] : w.getX(A) * x[0], I = Math.abs(C.getY(A)) > 0.5 ? w.getZ(A) * x[2] : w.getY(A) * x[1];
        R.setXY(A, T / 8, I / 8);
      }
    }
    const L = new bt(E, i(m, y, _, S));
    return L.scale.set(...x), L.position.set(...b), L.castShadow = !y, L.receiveShadow = !y, d.add(L), L;
  }
  function c(d, p = [
    0,
    0,
    0
  ]) {
    const m = new Aa();
    return m.position.set(...p), d.add(m), m;
  }
  function o(d, p, m, x, b, y = 1, _ = !1, S = 0.04) {
    const E = l(d, _ ? "disc" : "ring", p, [
      m,
      m,
      1
    ], [
      x,
      S,
      b
    ], !0, y);
    return E.rotation.x = -Math.PI / 2, E;
  }
  function u(d, p, m, x = [
    0,
    0,
    0
  ], b = 0) {
    const y = e?.has(m) ?? !1, _ = JSON.stringify([
      p,
      b,
      y
    ]);
    let S = a.get(_);
    if (!S) {
      const L = new jr();
      if (p.forEach(([w, C], R) => R ? L.lineTo(w, C) : L.moveTo(w, C)), L.closePath(), S = b ? new Nr(L, {
        depth: b,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: b * 0.3,
        bevelSize: b * 0.3,
        bevelSegments: 2
      }) : new Qo(L), y) {
        const w = S.getAttribute("uv");
        for (let C = 0; C < w.count; C++) w.setXY(C, w.getX(C) / 8, w.getY(C) / 8);
      }
      a.set(_, S);
    }
    const E = new bt(S, i(m));
    return E.position.set(...x), E.castShadow = !0, E.receiveShadow = !0, d.add(E), E;
  }
  function h(d) {
    d.updateMatrixWorld(!0);
    const p = d.matrixWorld.clone().invert(), m = new gr(), x = /* @__PURE__ */ new Map();
    d.traverse((y) => {
      if (!(y instanceof bt) || Array.isArray(y.material)) return;
      const _ = (y.geometry.index ? y.geometry.toNonIndexed() : y.geometry.clone()).applyMatrix4(m.multiplyMatrices(p, y.matrixWorld)), S = `${y.material.uuid}/${y.castShadow}/${y.receiveShadow}`;
      let E = x.get(S);
      E || (E = {
        material: y.material,
        castShadow: y.castShadow,
        receiveShadow: y.receiveShadow,
        geometries: []
      }, x.set(S, E)), E.geometries.push(_);
    }), d.clear();
    const b = [];
    for (const { material: y, castShadow: _, receiveShadow: S, geometries: E } of x.values()) {
      const L = Ss(E);
      if (E.forEach((C) => C.dispose()), !L) throw new Error("expedition_geometry_merge");
      const w = new bt(L, y);
      w.castShadow = _, w.receiveShadow = S, d.add(w), b.push(L);
    }
    return () => {
      d.clear(), b.forEach((y) => y.dispose());
    };
  }
  return {
    mesh: l,
    group: c,
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
function Lc(e, t, r, a) {
  const n = In[r], s = K.arena, { mesh: i, group: l, ring: c } = e, o = (m, x, b, y = n.stone) => i(m, "box", y, x, b);
  function u(m, x, b, y = !0) {
    const _ = l(t, [
      m,
      0,
      x
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
      b,
      0.91
    ], [
      0,
      b / 2 + 0.6,
      0
    ]);
    for (const S of [-0.38, 0.38]) o(_, [
      0.08,
      b - 0.35,
      0.12
    ], [
      S,
      b / 2 + 0.6,
      0.48
    ], n.light);
    return o(_, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      b + 0.6,
      0
    ], n.light), o(_, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      b + 0.85,
      0
    ], n.dark), y && (i(_, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      b + 1.24,
      0
    ]), o(_, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      b - 0.15,
      0.52
    ], n.trim)), _;
  }
  function h(m, x, b, y) {
    u(m - b / 2, x, y - 2), u(m + b / 2, x, y - 2);
    const _ = l(t, [
      m,
      y - 2,
      x
    ]);
    i(_, "arch", n.light, [
      b / 2,
      2.3,
      1.15
    ]);
    for (let S = 1; S < 10; S++) {
      const E = S / 10 * Math.PI, L = o(_, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(E) * b * 0.49,
        Math.sin(E) * 2.25,
        0.59
      ], n.trim);
      L.rotation.z = E - Math.PI / 2;
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
  function d(m, x, b = 1) {
    const y = l(t, [
      m,
      0,
      x
    ]);
    y.scale.setScalar(b);
    for (let _ = 0; _ < 5; _++) {
      const S = _ * 2.4, E = i(y, "rock", _ % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + _ % 2 * 0.3,
        0.45
      ], [
        Math.cos(S) * 0.4,
        0.5,
        Math.sin(S) * 0.4
      ]);
      E.rotation.z = Math.sin(S) * 0.4;
    }
    for (let _ = 0; _ < 3; _++) i(y, "rock", n.flower, [
      0.13,
      0.16,
      0.13
    ], [
      Math.sin(_ * 4) * 0.5,
      1,
      Math.cos(_ * 4) * 0.4
    ]);
  }
  function p(m, x, b) {
    const y = l(t, [
      m,
      0,
      x
    ]);
    y.scale.setScalar(b);
    const _ = i(y, "cylinder", n.dark, [
      0.15,
      3.5,
      0.19
    ], [
      0,
      1.65,
      0
    ]);
    _.rotation.z = -0.1;
    for (let S = 0; S < 6; S++) {
      const E = S * 2.4;
      i(y, "rock", S % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(E) * 0.95,
        3 + Math.sin(E) * 0.5,
        Math.sin(E) * 0.85
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
  for (let m = -10; m <= 10; m += 2) for (let x = -10; x <= 10; x += 2) o(t, [
    1.96,
    0.045,
    1.96
  ], [
    m,
    0.025,
    x
  ], (m * 3 + x + 40) % 8 === 0 ? n.tile : n.floor);
  if (a) {
    c(t, n.trim, 5.35, 0, 0, 1, !1, 0.058), c(t, n.light, 5.18, 0, 0, 0.6, !1, 0.059), c(t, n.seam, 4.72, 0, 0, 0.65, !1, 0.061);
    for (let m = 0; m < 8; m++) {
      const x = m * Math.PI / 4, b = o(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(x) * 5.04,
        0.065,
        Math.sin(x) * 5.04
      ], n.trim);
      b.rotation.y = -x + Math.PI / 2;
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
        const y = b * Math.PI * 2 / (r === 2 ? 24 : 16), _ = b % 2 ? 0.85 : r === 2 ? 2.6 : b % 4 ? 1.8 : 3.2;
        m.push([Math.cos(y) * _, Math.sin(y) * _]);
      }
      const x = e.shape(t, m, n.seam, [
        0,
        0.061,
        0
      ]);
      x.rotation.x = -Math.PI / 2, c(t, n.floor, 0.65, 0, 0, 1, !0, 0.065);
    }
  }
  for (const m of [-1, 1]) for (let x = 0; x < 4; x++) {
    const b = m * (7 + x % 2), y = -7 + x * 4, _ = o(t, [
      0.035,
      0.016,
      0.55 + x * 0.1
    ], [
      b,
      0.055,
      y
    ], n.seam);
    _.rotation.y = x * 1.3;
    const S = o(t, [
      0.028,
      0.015,
      0.3
    ], [
      b + 0.1,
      0.055,
      y + 0.3
    ], n.seam);
    S.rotation.y = x * 1.3 + 0.8;
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
    for (let x = -10; x <= 10; x += 5) u(m + Math.sign(m) * 0.5, x, x === -10 ? 3.6 : 1.35);
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
    const x = l(t, [
      m * 5.8,
      4.8,
      -s - 2.9
    ]);
    o(x, [
      2,
      0.08,
      0.08
    ], [
      0,
      0,
      0
    ], n.trim);
    for (let b = 0; b < 5; b++) o(x, [
      0.35,
      2.6 - Math.abs(b - 2) * 0.12,
      0.08
    ], [
      (b - 2) * 0.34,
      -1.35,
      Math.sin(b * 2) * 0.08
    ], b % 2 ? n.foliage : n.dark);
    if (o(x, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), r < 3) {
      for (let b = 0; b < 4; b++) d(m * (12.8 + b % 2), -9 + b * 5, 0.8 + b * 0.1);
      p(m * 15, -13, 1.5), p(m * 17, 1, 1.7);
    } else if (r === 3) for (let b = 0; b < 3; b++) {
      const y = l(t, [
        m * 15,
        0,
        -9 + b * 7
      ]);
      i(y, "cylinder", n.dark, [
        1.4,
        2.8,
        1.4
      ], [
        0,
        1.4,
        0
      ]), i(y, "cylinder", n.trim, [
        0.7,
        4.5,
        0.7
      ], [
        0,
        4.9,
        0
      ]), o(y, [
        1.5,
        1,
        0.2
      ], [
        0,
        1,
        1.3
      ], n.accent), i(y, "torus", n.trim, [
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
      for (let y = 0; y < 5; y++) i(t, "rock", y % 2 ? n.light : n.accent, [
        1,
        2.2 + y % 3,
        0.9
      ], [
        m * (13.5 + y % 2),
        1.2,
        -9 + y * 4
      ]).rotation.z = m * -0.2;
      const b = l(t, [
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
      for (let y = 0; y < 4; y++) {
        const _ = l(t, [
          m * 14,
          0,
          -10 + y * 6
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
        for (let S = 0; S < 3; S++) {
          o(_, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + S,
            0
          ], n.trim);
          for (let E = 0; E < 5; E++) o(_, [
            0.27,
            0.65 + E % 2 * 0.12,
            0.6
          ], [
            -0.85 + E * 0.4,
            1.2 + S,
            0.1
          ], E % 2 ? n.foliage : n.stone);
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
    const x = (m - 3) * 8, b = -26 - m % 3 * 6, y = 7 + m * 5 % 7;
    if (o(t, [
      5.2,
      y,
      5.5
    ], [
      x,
      y / 2 - 3,
      b
    ], n.stone), o(t, [
      5.8,
      0.4,
      6
    ], [
      x,
      y - 3,
      b
    ], n.light), r === 1) {
      const _ = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        x,
        y - 0.8,
        b
      ]);
      _.rotation.z = 0.9;
    } else if (r === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      x,
      y - 0.8,
      b
    ]);
    else if (r === 3) {
      for (const _ of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + m % 2 * 2,
        0.7
      ], [
        x + _,
        y - 1,
        b
      ]);
      o(t, [
        3.8,
        0.25,
        4
      ], [
        x,
        y - 2.5,
        b
      ], n.trim);
    } else if (r === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        x,
        y - 0.8,
        b
      ]);
      for (const _ of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        x + _,
        y - 3,
        b + 3
      ]);
    } else if (r === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        x,
        y + 0.7,
        b
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        x,
        y - 1,
        b
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
        x + _,
        y - 2.35,
        b
      ], n.light);
      m % 2 && p(x + 1, b + 2, 1.5);
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
      x + _,
      y - 5.6,
      b + 2.8
    ], n.dark);
  }
  for (const m of a?.obstacles ?? []) {
    const x = l(t, [
      m.x,
      0,
      m.y
    ]);
    i(x, "cylinder", n.dark, [
      m.radius,
      0.22,
      m.radius
    ], [
      0,
      0.11,
      0
    ]), i(x, "cylinder", n.stone, [
      m.radius * 0.85,
      1.15,
      m.radius * 0.85
    ], [
      0,
      0.78,
      0
    ]), i(x, "cylinder", n.light, [
      m.radius,
      0.2,
      m.radius
    ], [
      0,
      1.4,
      0
    ]), i(x, "rock", n.accent, [
      0.28,
      0.58,
      0.28
    ], [
      0,
      1.9,
      0
    ]);
    for (let b = 0; b < 6; b++) {
      const y = b * Math.PI / 3;
      o(x, [
        0.09,
        0.8,
        0.09
      ], [
        Math.cos(y) * m.radius * 0.86,
        0.8,
        Math.sin(y) * m.radius * 0.86
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
    ]), c(t, n.trim, 1.68, 0, -8, 1, !1, 0.28);
    for (const m of [-1, 1]) {
      d(m * 3, -8, 1.2), d(m * 4, -10, 0.85);
      const x = l(t, [
        m * 2.6,
        0.5,
        -6
      ]);
      i(x, "box", n.dark, [
        0.5,
        0.16,
        0.5
      ]), i(x, "box", n.flower, [
        0.3,
        0.55,
        0.3
      ], [
        0,
        0.35,
        0
      ]), i(x, "cone", n.trim, [
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
function Oc(e, t, r) {
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
  ]), i = e.group(s), l = r === "female", c = l ? 0.225 : 0.255, o = At.traveler.fabric, u = "#574a40", h = "#d7ab8b", d = "#463f3b";
  e.mesh(n, "sphere", o, [
    c,
    0.28,
    0.155
  ], [
    0,
    -0.04,
    0
  ]), e.mesh(n, "cylinder", o, [
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
  ]), e.mesh(n, "cylinder", h, [
    0.066,
    0.16,
    0.07
  ], [
    0,
    0.265,
    0
  ]), e.mesh(s, "sphere", h, [
    l ? 0.161 : 0.172,
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
    ]), e.mesh(s, "box", d, [
      0.047,
      0.012,
      0.014
    ], [
      _ * 0.064,
      0.062,
      0.154
    ]), e.mesh(i, "sphere", d, [
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
  ]), l) {
    const _ = e.group(i, [
      0,
      0.06,
      -0.17
    ]);
    for (let S = 0; S < 4; S++) e.mesh(_, "sphere", d, [
      0.064 - S * 9e-3,
      0.09,
      0.063 - S * 8e-3
    ], [
      S % 2 ? 0.014 : -0.014,
      -S * 0.115,
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
  const p = [], m = [];
  for (const _ of [-1, 1]) {
    const S = e.group(a, [
      _ * c,
      0.12,
      0
    ]);
    p.push(S), e.mesh(S, "cylinder", o, [
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
    const E = e.group(a, [
      _ * 0.105,
      -0.32,
      0
    ]);
    m.push(E), e.mesh(E, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(E, "cylinder", u, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(E, "sphere", u, [
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
  const x = [
    n,
    s,
    i,
    ...p,
    ...m
  ].map((_) => e.bake(_));
  s.add(i);
  const b = [];
  a.traverse((_) => {
    _ instanceof bt && _.material === e.material(o) && b.push(_);
  });
  let y = null;
  return {
    body: a,
    hand: e.group(p[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(_) {
      if (_ !== y) {
        y = _;
        for (const S of b) S.material = e.material(At[_].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(At[_].head);
      }
    },
    pose(_, S, E, L, w, C) {
      a.position.y = 1.3 + E, a.rotation.set(!w && L ? 0.16 : 0, Math.PI / 2 - _, 0), m.forEach((R, A) => {
        R.rotation.x = (A ? -1 : 1) * S;
      }), p.forEach((R, A) => {
        R.rotation.set(A && C ? -0.55 : (A ? 1 : -1) * S * 0.65, 0, (A ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      x.forEach((_) => _()), a.removeFromParent();
    }
  };
}
function jc(e, t, r) {
  const a = At[r], { mesh: n, group: s, shape: i } = e, l = s(t, [
    0,
    0.2,
    -0.23
  ]), c = s(t, [
    0,
    0.328,
    0
  ]), o = s(t, [
    0,
    0.55,
    0
  ]);
  c.scale.set(0.64, 0.78, 0.72);
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
    n(c, "sphere", a.metal, [
      0.31,
      0.13,
      0.265
    ], [
      0,
      0.44,
      -0.015
    ], !1, 1, !0);
    for (const h of [-1, 1]) n(c, "box", a.metal, [
      0.065,
      0.22,
      0.17
    ], [
      h * 0.285,
      0.29,
      -0.02
    ], !1, 1, !0);
  } else if (a.head === "hat")
    n(c, "cylinder", a.fabric, [
      0.43,
      0.045,
      0.32
    ], [
      0,
      0.46,
      0
    ]), n(c, "cone", a.fabric, [
      0.23,
      0.48,
      0.23
    ], [
      0.055,
      0.7,
      -0.02
    ]).rotation.z = -0.18, n(c, "torus", a.metal, [
      0.245,
      0.245,
      0.24
    ], [
      0,
      0.52,
      -0.01
    ]).rotation.x = Math.PI / 2;
  else if (a.head === "hood") {
    n(c, "sphere", a.fabric, [
      0.345,
      0.35,
      0.265
    ], [
      0,
      0.22,
      -0.12
    ]);
    for (const h of [-1, 1]) n(c, "sphere", a.fabric, [
      0.075,
      0.19,
      0.08
    ], [
      h * 0.285,
      0.19,
      0.055
    ]);
  } else if (a.head === "crown") {
    n(c, "torus", a.metal, [
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
      n(c, "cone", a.metal, [
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
    const d = s(c, [
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
    for (const p of [0.16, 0.3]) n(d, "cone", a.metal, [
      0.025,
      0.22,
      0.025
    ], [
      h * 0.06,
      p,
      0
    ]).rotation.z = h * -0.8;
  }
  else if (a.head === "goggles") {
    n(c, "torus", "#4c4a42", [
      0.32,
      0.22,
      0.27
    ], [
      0,
      0.4,
      0
    ]).rotation.x = Math.PI / 2;
    for (const h of [-1, 1])
      n(c, "torus", a.metal, [
        0.095,
        0.075,
        0.05
      ], [
        h * 0.115,
        0.39,
        0.24
      ]), n(c, "sphere", a.glow, [
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
      n(c, "cone", a.fabric, [
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
      n(c, "crescent", a.metal, [
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
      n(c, "cone", a.glow, [
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
    cape: l,
    animate(h, d) {
      o.rotation.y = d ? 0.4 : h * 0.014;
    }
  };
}
var Ra = "#45576a", hn = "#93a7ad", Ca = "#bc835a", Gn = "#ffd498";
function ho(e, t, r, a, n) {
  if (n === "coupler") {
    e.mesh(t, "box", Ra, [
      1.5,
      0.4,
      1.5
    ], [
      0,
      0.2,
      0
    ]), e.mesh(t, "cylinder", Ca, [
      0.5,
      1.8,
      0.5
    ], [
      0,
      1.2,
      0
    ]), e.mesh(r, "rock", Gn, [
      0.32,
      0.7,
      0.32
    ], [
      0,
      1.6,
      0
    ], !0);
    for (const s of [-1, 1]) e.mesh(t, "box", hn, [
      0.15,
      1.9,
      0.2
    ], [
      s * 0.6,
      1.15,
      0
    ]);
    e.mesh(t, "torus", Ra, [
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
    e.mesh(t, "rock", "#5e738b", [
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
    ]), e.mesh(r, "rock", Gn, [
      0.25,
      0.65,
      0.17
    ], [
      0,
      1.95,
      0.72
    ], !0);
    for (let s = 0; s < 6; s++) {
      const i = s * Math.PI / 3, l = e.group(a, [
        Math.sin(i) * 1.05,
        0.8,
        Math.cos(i) * 1.05
      ]);
      l.rotation.z = Math.sin(i) * 0.5, l.rotation.x = Math.cos(i) * 0.5, e.mesh(l, "rock", s % 2 ? "#90b9c9" : "#d5eced", [
        0.24,
        1.3 + s % 2 * 0.35,
        0.24
      ], [
        0,
        1,
        0
      ]), e.mesh(t, "cylinder", Ca, [
        0.13,
        0.65,
        0.13
      ], [
        Math.sin(i) * 0.9,
        0.5,
        Math.cos(i) * 0.9
      ]);
    }
    return;
  }
  e.mesh(t, "box", "#354459", [
    0.85,
    1.45,
    0.65
  ], [
    0,
    2,
    0.1
  ]), e.mesh(t, "box", "#d4c2a5", [
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
    ]), e.mesh(t, "box", Ra, [
      0.65,
      1.8,
      0.8
    ], [
      s * 0.9,
      1.12,
      -0.05
    ]), e.mesh(t, "box", hn, [
      0.9,
      0.32,
      1.3
    ], [
      s * 0.9,
      0.2,
      0.22
    ]), e.mesh(t, "cylinder", Ca, [
      0.12,
      1.4,
      0.12
    ], [
      s * 1.25,
      1.2,
      0.1
    ]), e.mesh(t, "box", Ra, [
      0.25,
      2.9,
      0.35
    ], [
      s * 0.75,
      2.3,
      -0.58
    ]), e.mesh(t, "box", hn, [
      0.65,
      0.28,
      0.9
    ], [
      s * 0.85,
      3.8,
      -0.45
    ]), e.mesh(t, "cylinder", Ca, [
      0.37,
      1.8,
      0.37
    ], [
      s * 0.48,
      2.5,
      -0.9
    ]), e.mesh(t, "rock", Gn, [
      0.16,
      0.58,
      0.12
    ], [
      s * 0.48,
      2.7,
      -1.22
    ], !0);
    const i = e.group(t, [
      s * 0.68,
      2.25,
      0.46
    ]);
    i.name = s < 0 ? "furnace-armor-left" : "furnace-armor-right", e.mesh(i, "box", Ca, [
      0.65,
      1.1,
      0.14
    ], [
      -s * 0.2,
      0,
      0
    ]);
  }
  e.mesh(t, "box", Ra, [
    1.8,
    0.3,
    0.35
  ], [
    0,
    3.84,
    -0.58
  ]), a.position.set(1.6, 2.3, 0.05), e.mesh(a, "cylinder", hn, [
    0.12,
    2.8,
    0.12
  ]), e.mesh(a, "box", Ra, [
    1.1,
    0.9,
    1.3
  ], [
    0,
    -1.1,
    0.18
  ]), e.mesh(a, "box", Ca, [
    1.2,
    0.18,
    1.4
  ], [
    0,
    -1.45,
    0.18
  ]);
}
function Nc(e, t, r, a, n, s) {
  const { mesh: i, group: l, shape: c } = e, o = "#d6b881", u = "#fff0c1", h = (d, p, m) => {
    for (const x of [-1, 1]) i(r, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      x * m,
      d,
      p
    ], !0);
  };
  switch (n) {
    case "kilnheart":
    case "furnacemaster":
      ho(e, t, r, a, n);
      break;
    case "bridgekeeper":
    case "heatkeeper": {
      const d = n === "heatkeeper", p = d ? "#374e62" : "#667376";
      for (const m of [-1, 1]) i(t, "box", "#393d43", [
        0.4,
        1.05,
        0.52
      ], [
        m * 0.36,
        0.6,
        0
      ]);
      i(t, "box", p, [
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
        const p = d * Math.PI * 2 / 7, m = l(t, [
          Math.cos(p) * 0.8,
          2.6,
          Math.sin(p) * 0.6
        ]);
        m.rotation.z = Math.cos(p) * 0.8, i(m, "cone", "#526451", [
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
        for (let p = 0; p < 5; p++) c(a, [
          [0, 0],
          [d * (2.4 - p * 0.25), 0.95 - p * 0.22],
          [d * (2 - p * 0.24), -0.1 - p * 0.24],
          [0, -0.45]
        ], p % 2 ? "#e2a465" : "#d47c4f", [
          d * 0.4,
          2.5,
          -0.1 - p * 0.06
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
      for (const d of [-1, 1]) c(t, [
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
        const p = 1 - d * 0.14;
        i(t, "sphere", d % 2 ? "#658c9c" : "#7da9b8", [
          p,
          p * 0.8,
          p
        ], [
          Math.sin(d * 0.6) * 0.4,
          0.8,
          0.5 - d * 0.8
        ]), i(t, "cone", "#d7e9dc", [
          0.2 * p,
          0.6 * p,
          0.25 * p
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
        c(a, [
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
        const p = d * Math.PI * 2 / 5, m = l(a, [
          Math.cos(p) * 1.7,
          2.5 + Math.sin(p) * 0.6,
          Math.sin(p) * 1.3
        ]);
        m.rotation.z = p * 0.3, i(m, "box", "#baa481", [
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
        const p = l(a, [
          d * 0.85,
          1.8,
          0.2
        ]);
        p.rotation.z = d * -0.25, c(p, [
          [-0.07, 0],
          [0.15, 0],
          [0.3, 1.5],
          [0.12, 2.25],
          [-0.13, 1.7]
        ], "#dfc9ff");
      }
      c(t, [
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
function Uc(e, t) {
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
  ], s = e.shape(a, n, tt.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, tt.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, tt.enamel, [
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
    ], tt.silver, [
      0,
      0,
      o
    ]), e.mesh(a, "rock", tt.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      o + Math.sign(o) * 0.014
    ], !1, 1, !0);
  let l = 0, c = -1;
  return r.visible = !1, { update(o, u, h, d, p) {
    const m = u ? 1 : 0, x = Math.max(0, Math.min(4, d - c));
    l = p || c < 0 || d < c ? m : l + (m - l) * (1 - Math.exp(-x * 0.85)), c = d, r.visible = o === "blade" || u || l > 0.04, r.position.set(-0.4 + l * 0.12, -0.1 + l * 0.3, 0.17 + l * 0.25), r.rotation.set(0.12 - l * 0.22, 0.15 - l * 0.3, -0.16 + l * 0.22), a.scale.setScalar(0.94 + l * 0.07), s.material = e.material(h ? tt.parry : o === "blade" ? tt.block : tt.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : tt.enamel);
  } };
}
function Fc(e, t) {
  const r = e.group(t), a = new Fo({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new yr(tt.ward) },
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
  return n.scale.set(1.12, 1.4, 1.12), n.position.y = 1.3, r.add(n), r.visible = !1, {
    update(s, i) {
      r.visible = !!s && s.ward > 0, !(!s || !r.visible) && (r.position.set(s.x, 0, s.y), a.uniforms.impact.value = i, r.scale.setScalar(1 + i * 0.035));
    },
    dispose() {
      a.dispose(), r.removeFromParent();
    }
  };
}
function Dc(e, t) {
  const r = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  r.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const h = e.group(r);
    e.mesh(h, "box", yt.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(h, "box", yt.page, [
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
  const s = e.mesh(r, "rock", yt.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(r, "torus", yt.crest, [
    0.17,
    0.17,
    0.17
  ], [
    0,
    0.31,
    0
  ], !0, 0.65);
  i.rotation.x = Math.PI / 2;
  let l = 0, c = 0.15, o = -1;
  return { update(u, h, d, p) {
    const m = p || o < 0 || d < o ? 1 : 1 - Math.exp(-Math.min(4, d - o) * 0.5);
    o = d, l += ((u ? 1 : 0) - l) * m, c += ((h ? 0.5 : u ? 0.28 : 0.15) - c) * m, r.position.y = c, r.rotation.x = -0.45 + (c - 0.15) * 0.7, a[0].rotation.z = -0.65 + l * 0.5, a[1].rotation.z = 0.65 - l * 0.5, n.rotation.z = p ? 0.2 : 0.2 + l * (Math.sin(d * 0.18) + 1) * 1.3, s.scale.set(0.07 + l * 0.025, 0.1 + l * 0.06, 0.07 + l * 0.025), i.visible = u, p || (s.rotation.y = d * 0.08);
  } };
}
function Zc() {
  let e = null, t = 0, r = -1 / 0, a = 0, n = 0;
  function s() {
    e = null, r = -1 / 0, a = 0, n = 0;
  }
  return {
    reset: s,
    get active() {
      return n > 0;
    },
    update(i, l, c) {
      (l < t || !i || c) && s();
      const o = e ? Math.min(0.1, l - t) : 0;
      i && e && Math.hypot(i.x - e.x, i.y - e.y) > 1e-3 && (r = l);
      const u = !c && l - r <= 2 / K.hz, h = n > 0;
      n += ((u ? 1 : 0) - n) * (1 - Math.exp(-o * (u ? 14 : 18))), !u && n < 1e-3 ? (n = 0, a = 0) : h && (a = (a + o * Math.PI * 2 * 1.25) % (Math.PI * 2)), e = i ? {
        x: i.x,
        y: i.y
      } : null, t = l;
      const d = Math.sin(a);
      return {
        stride: d * 0.45 * n,
        lift: d * d * 0.035 * n,
        amount: n
      };
    }
  };
}
function fo(e, t, r = 1) {
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
function po(e, t, r) {
  const a = e.group(t), n = Oc(e, a, r), s = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), l = e.group(s), c = n.hand, o = e.group(l), u = Uc(e, l), h = Zc();
  let d = null, p = -1, m = Math.PI / 2, x = null, b = null, y = null;
  function _(S, E) {
    if (!(S === b && E === y)) {
      if (b = S, y = E, o.clear(), c.clear(), d = null, x = jc(e, o, y), n.dress(y), b === "blade")
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
      else if (b === "bow") fo(e, c);
      else if (b === "staff")
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
      else if (b === "daggers") for (const L of [-1, 1]) {
        const w = e.group(c, [
          L < 0 ? -0.58 : 0,
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
      else if (b === "grimoire") d = Dc(e, c);
      else if (b === "cannon") {
        const L = e.group(c, [
          0.02,
          0.08,
          0.17
        ]);
        L.rotation.x = Math.PI / 2, e.mesh(L, "cylinder", "#586e77", [
          0.12,
          0.55,
          0.12
        ], [
          0,
          0.1,
          0
        ], !1, 1, !0), e.mesh(L, "torus", "#d2a96c", [
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
    root: a,
    resetMotion: h.reset,
    get animating() {
      return h.active;
    },
    update(S, E, L, w, C, R, A, T = !1) {
      _(E, L), u.update(E, !!S?.shield, !!S?.guard, w, R);
      const I = R || p < 0 || w < p ? 1 : 1 - Math.exp(-Math.min(4, w - p) * 0.65);
      p = w;
      const M = A ? Math.PI / 2 + 0.23 : S?.facing ?? Math.PI / 2;
      m += Math.atan2(Math.sin(M - m), Math.cos(M - m)) * I;
      const O = h.update(A ? null : S, C, R), N = !!S?.dashTime;
      a.position.set(S?.x ?? 0, A ? 0.3 : 0, S?.y ?? -8), a.scale.setScalar(A ? 1.65 : 1), n.pose(m, O.stride, O.lift, N, R, !!S?.swing || T), x.cape.rotation.x = R ? -0.15 : -0.21 - O.amount * 0.44 - Math.sin(w * 0.15) * 0.12, x.animate(w, R);
      const F = S?.swing && !R ? Math.sin(S.swing / (E === "cannon" ? 16 : 9) * Math.PI) : 0;
      c.rotation.z += ((T ? -0.3 : -0.2 - F * 1.3) - c.rotation.z) * I, c.rotation.x += ((T ? -0.25 : 0.1 + F * 0.6) - c.rotation.x) * I, d && d.update(!!S?.resonance, T, w, R), i.scale.set(0.6 + (N ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function zr(e, t, r, a) {
  const { mesh: n, group: s } = e, i = s(t), l = s(i), c = s(l), o = s(l), u = [], h = ze(r), d = pe[r].radius;
  let p = null;
  e.ring(i, "#1d3540", d * 1.15, 0, 0, 0.16, !0);
  const m = "#cfad70", x = "#fff0b0", b = a.dark;
  function y(M, O, N) {
    const F = s(l, [
      M,
      N,
      O
    ]);
    n(F, "box", b, [
      0.32,
      N,
      0.42
    ], [
      0,
      -N / 2,
      0
    ]), n(F, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -N + 0.11,
      0.1
    ]), u.push(F);
  }
  function _(M, O, N = "#d9e8df") {
    n(M, "box", m, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(M, "box", b, [
      0.11,
      0.4,
      0.11
    ]), n(M, "box", N, [
      0.2,
      O,
      0.13
    ], [
      0,
      O / 2 + 0.35,
      0
    ], !1, 1, !0), n(M, "cone", N, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      O + 0.5,
      0
    ]);
  }
  if (r === "coupler") ho(e, l, o, c, r);
  else if (r === "charger") {
    n(l, "rock", a.stone, [
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
    for (const M of [-0.27, 0.27]) {
      const O = n(o, "cone", m, [
        0.15,
        0.7,
        0.15
      ], [
        M,
        1.15,
        0.9
      ]);
      O.rotation.x = 0.55, n(o, "sphere", x, [
        0.05,
        0.04,
        0.06
      ], [
        M,
        0.82,
        1.02
      ], !0), y(M, -0.42, 0.45), y(M, 0.45, 0.45);
    }
    for (let M = 0; M < 3; M++) n(l, "cone", a.accent, [
      0.2,
      0.45,
      0.25
    ], [
      0,
      1.25,
      -0.5 + M * 0.4
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
    ]), n(l, "cone", a.light, [
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
    const M = n(o, "crescent", m, [
      1.35,
      1.35,
      0.8
    ], [
      0,
      4.35,
      -0.3
    ], !1, 1, !0);
    M.rotation.z = 0.87;
    for (const O of [-0.23, 0.23]) n(o, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      O,
      4.08,
      0.45
    ], !0);
    for (const O of [-1, 1]) {
      const N = s(l, [
        O * 0.8,
        3.3,
        0
      ]);
      N.rotation.z = O * 0.65, n(N, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(N, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), u.push(N);
    }
    for (let O = 0; O < 5; O++) {
      const N = O / 5 * Math.PI * 2, F = n(c, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(N) * 1.95,
        3.3 + Math.sin(N) * 1.1,
        -0.3
      ]);
      F.rotation.z = N;
    }
  } else if (r === "king") {
    y(-0.5, 0, 0.8), y(0.5, 0, 0.8), n(l, "cone", "#7c4550", [
      1.8,
      3.6,
      0.8
    ], [
      0,
      2,
      -0.3
    ]), n(l, "box", b, [
      1.6,
      1.7,
      1
    ], [
      0,
      2.1,
      0
    ]), n(l, "rock", m, [
      0.5,
      0.9,
      0.3
    ], [
      0,
      2.25,
      0.62
    ]);
    for (const M of [-1, 1]) n(l, "rock", a.stone, [
      0.85,
      0.5,
      0.7
    ], [
      M * 0.95,
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
    ]), n(o, "box", x, [
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
    for (let M = 0; M < 7; M++) {
      const O = M * Math.PI * 2 / 7;
      n(o, "cone", m, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(O) * 0.78,
        4.85,
        Math.sin(O) * 0.78
      ]);
    }
    c.position.set(1.55, 1.35, 0.2), c.rotation.z = -0.3, _(c, 3.4, "#f6dc9f"), n(l, "box", a.stone, [
      0.5,
      1.2,
      0.5
    ], [
      -1.15,
      2,
      0.1
    ]);
  } else if (r === "warden" || r === "keeper") {
    r === "keeper" && l.scale.setScalar(0.72), y(-0.65, 0.05, 0.85), y(0.65, 0.05, 0.85), n(l, "cylinder", b, [
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
    for (const O of [-1, 1])
      n(l, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        O * 1.03,
        2.7,
        0
      ]), n(l, "box", m, [
        0.7,
        0.1,
        0.8
      ], [
        O * 1.08,
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
    ]), n(o, "box", x, [
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
    const M = s(l, [
      -1.32,
      1.5,
      0.6
    ]);
    p = M, n(M, "box", b, [
      1.2,
      1.8,
      0.25
    ]), n(M, "box", m, [
      1,
      1.58,
      0.28
    ]), n(M, "box", a.foliage, [
      0.85,
      1.42,
      0.31
    ]), n(M, "rock", a.light, [
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
    ]), n(c, "box", b, [
      1.25,
      0.9,
      0.9
    ], [
      0,
      1.4,
      0
    ]), n(c, "box", m, [
      0.24,
      0.96,
      0.94
    ], [
      0,
      1.4,
      0
    ], !1, 1, !0), n(c, "box", a.light, [
      0.22,
      0.77,
      0.74
    ], [
      0.65,
      1.4,
      0
    ]);
  } else if (ze(r)) Nc(e, l, o, c, r, a);
  else if (r === "wisp")
    n(l, "rock", a.accent, [
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
    ], !0), n(l, "cone", a.light, [
      0.16,
      0.6,
      0.16
    ], [
      0,
      0.35,
      0
    ]).rotation.z = Math.PI;
  else if (r === "stalker") {
    n(l, "sphere", a.dark, [
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
    for (const M of [-1, 1])
      y(M * 0.27, -0.25, 0.35), n(o, "cone", m, [
        0.09,
        0.35,
        0.09
      ], [
        M * 0.21,
        1.09,
        0.42
      ]), n(o, "sphere", x, [
        0.05,
        0.04,
        0.035
      ], [
        M * 0.15,
        0.8,
        0.77
      ], !0), n(c, "cone", a.light, [
        0.09,
        0.38,
        0.08
      ], [
        M * 0.37,
        0.3,
        0.5
      ]).rotation.x = Math.PI / 2;
  } else if (r === "bomber")
    y(-0.22, 0, 0.45), y(0.22, 0, 0.45), n(l, "sphere", "#85654c", [
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
    const M = r === "priest", O = r === "guard";
    if (M ? n(l, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (y(-0.22, 0, 0.5), y(0.22, 0, 0.5), n(l, "box", b, [
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
    ]), n(o, "box", x, [
      0.39,
      0.045,
      0.05
    ], [
      0,
      1.65,
      0.39
    ], !0), M)
      n(o, "cone", "#626a9c", [
        0.55,
        0.8,
        0.5
      ], [
        0,
        2.14,
        0
      ]), c.position.set(0.52, 1, 0.1), n(c, "cylinder", m, [
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
      n(o, "box", a.foliage, [
        0.12,
        0.38,
        0.55
      ], [
        0,
        2,
        -0.07
      ]);
      for (const N of [-1, 1]) n(l, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        N * 0.45,
        1.22,
        0
      ]);
      c.position.set(0.54, 1, 0.2), r === "archer" ? fo(e, c, 1.3) : (c.rotation.z = -0.3, _(c, 0.75)), O && (n(l, "box", m, [
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
  const S = s(i, [
    0,
    h ? 5.5 : r === "charger" ? 1.7 : 2.45,
    0
  ]);
  n(S, "box", "#233f48", [
    1.06,
    0.105,
    0.02
  ], [
    0,
    0,
    0
  ], !0);
  const E = n(S, "box", "#f0ba83", [
    1,
    0.055,
    0.03
  ], [
    0,
    0,
    0.02
  ], !0), L = [];
  l.traverse((M) => {
    M instanceof bt && L.push({
      mesh: M,
      material: M.material
    });
  });
  let w = 0, C = -100, R = 0, A = 0;
  const T = c.rotation.z, I = [l.getObjectByName("furnace-armor-left"), l.getObjectByName("furnace-armor-right")];
  return {
    root: i,
    bar: S,
    update(M, O, N, F = !1) {
      const V = Math.abs(M.x - R) + Math.abs(M.y - A) > 5e-3;
      R = M.x, A = M.y, w && !M.windup && (C = O), w = M.windup;
      const H = M.windup ? 1 - M.windup / pe[M.kind].windup : 0, te = Math.max(0, 1 - (O - C) / 10);
      i.position.set(M.x, 0, M.y), l.rotation.y = Math.PI / 2 - M.angle, l.position.y = N ? 0 : r === "weaver" || r === "priest" ? 0.13 + Math.sin(O * 0.055) * 0.1 : V ? Math.abs(Math.sin(O * 0.3)) * 0.055 : 0, l.rotation.x = N ? 0 : -H * 0.16 + te * 0.2, o.rotation.z = !N && r === "king" ? Math.sin(O * 0.035) * 0.08 : 0, c.rotation.x = N ? 0 : H * -1.3 + te * 1.4, c.rotation.z = T + (N ? 0 : H * -0.35), p && F && (p.visible = r !== "warden" || Ts(M.phase), p.rotation.x = M.exposed ? -Math.PI / 3 : 0), I.forEach((ne, Ie) => {
        ne && (ne.rotation.y = M.phase === 3 ? (Ie ? 1 : -1) * 1.1 : 0);
      });
      for (let ne = 0; ne < u.length; ne++) u[ne].rotation.x = !N && V ? Math.sin(O * 0.32 + ne * Math.PI) * 0.28 : 0;
      for (const ne of L) ne.mesh.material = M.marked > 2 && !N ? e.material("#fff6dd") : ne.material;
      S.visible = !h && M.hp < M.maxHp, E.scale.x = M.hp / M.maxHp, E.position.x = (M.hp / M.maxHp - 1) * 0.5;
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
function Bc(e, t) {
  const r = /* @__PURE__ */ new Map();
  function a(s, i, l = 1, c = !1) {
    const o = Math.max(0.1, Math.min(1, Math.round(l * 10) / 10)), u = `${s}/${i}/${o}/${c}`;
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
    ], !c, o), h.list.push(d)), d.visible = !0, d.rotation.set(0, 0, 0), d.scale.set(1, 1, 1), d;
  }
  function n(s, i, l, c, o, u = 1, h = 0.09) {
    const d = a(s, i, u);
    return d.position.set(c, h, o), d.scale.set(l, l, 1), d.rotation.x = -Math.PI / 2, d;
  }
  return { update(s, i, l) {
    for (const o of r.values())
      o.used = 0, o.list.forEach((u) => u.visible = !1);
    if (l) {
      const { left: o, right: u, top: h, bottom: d } = l;
      for (const p of [o, u]) {
        const m = a("box", ie.warning, 0.5);
        m.position.set(p, 0.14, (h + d) / 2), m.scale.set(0.1, 0.15, d - h);
      }
      for (const p of [h, d]) {
        const m = a("box", ie.warning, 0.5);
        m.position.set((o + u) / 2, 0.14, p), m.scale.set(u - o, 0.15, 0.1);
      }
    }
    if (!s) return;
    const c = s.player;
    if (n("ring", "#f2f6e2", 0.64, c.x, c.y, 0.8), c.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const u = a("cone", ie.gold, 0.7 - o * 0.15);
      u.position.set(c.x - Math.cos(c.dashAngle) * o * 0.43, 0.45, c.y - Math.sin(c.dashAngle) * o * 0.43), u.scale.set(0.13, c.dashTime / 8 * 1.7, 0.13), u.rotation.set(0, -c.dashAngle, -Math.PI / 2);
    }
    if (!s.boss && (s.encounter === "siege" || s.encounter === "ritual")) {
      const o = s.objective;
      s.encounter === "ritual" && (n("disc", ie.magic, 2.5, o.x, o.y, 0.12), n("ring", ie.magic, 2.5, o.x, o.y), n("ring", ie.gold, 2.2, o.x, o.y, 0.8));
      const u = a("cylinder", "#526b79");
      u.position.set(o.x, 0.3, o.y), u.scale.set(0.5, 0.6, 0.5);
      const h = a("rock", s.encounter === "siege" ? ie.fire : ie.magic);
      if (h.position.set(o.x, 1, o.y), h.scale.set(0.23, 0.5, 0.23), s.encounter === "siege") {
        h.position.y = 1.35, h.scale.set(0.4, 0.85, 0.4);
        const d = a("cone", ie.gold, 0.8);
        d.position.set(o.x, 1.4, o.y), d.scale.set(0.2, 0.85, 0.2), n("ring", ie.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (h.rotation.y = s.tick * 0.025);
    }
    for (const o of s.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", ie.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const u = a("cylinder", "#687c81");
          u.position.set(o.x, 0.25, o.y), u.scale.set(0.4, 0.5, 0.4);
          const h = a("box", "#bd9a68");
          h.position.set(o.x, 0.65, o.y), h.scale.set(0.9, 0.2, 0.25), h.rotation.y = -o.angle;
          const d = a("sphere", ie.magic);
          d.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const u = o.kind === "familiar" && c.resonance > 0, h = u ? 1.5 : 1, d = o.kind === "shade" ? "#a6acd8" : u ? yt.empowered : yt.familiar, p = i ? 0 : Math.sin(s.tick * 0.1 + o.id) * 0.08, m = a("sphere", d, 1, !0);
          m.position.set(o.x, 0.55 * h + p, o.y), m.scale.set(0.3 * h, 0.36 * h, 0.3 * h);
          for (const b of [-1, 1]) {
            const y = a("cone", d, 1, !0);
            y.position.set(o.x + b * 0.2 * h, 0.93 * h + p, o.y), y.scale.set(0.08 * h, 0.22 * h, 0.08 * h);
          }
          const x = a("sphere", "#35475b");
          if (x.position.set(o.x + Math.cos(o.angle) * 0.28 * h, 0.63 * h + p, o.y + Math.sin(o.angle) * 0.28 * h), x.scale.setScalar(0.07 * h), u) {
            const b = a("torus", yt.crest, 1, !0);
            b.position.set(o.x, 1.45 + p, o.y), b.rotation.x = Math.PI / 2, b.scale.setScalar(0.32);
            for (let y = 0; y < 3; y++) {
              const _ = y * Math.PI * 2 / 3, S = a("rock", yt.crest, 1, !0);
              S.position.set(o.x + Math.cos(_) * 0.32, 1.55 + p, o.y + Math.sin(_) * 0.32), S.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of s.enemies) {
      if (ze(o.kind) && o.phase > 1) {
        const u = pe[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? ie.fire : ie.magic, u, o.x, o.y, 0.65), !i) for (let h = 0; h < o.phase + 2; h++) {
          const d = s.tick * 0.025 + h * Math.PI * 2 / (o.phase + 2), p = a("rock", o.kind === "king" ? ie.fire : ie.magic, 0.8);
          p.position.set(o.x + Math.cos(d) * u, 0.55 + Math.sin(d * 2) * 0.2, o.y + Math.sin(d) * u), p.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const u = 1 - o.windup / pe[o.kind].windup;
        if (n("ring", ie.warning, pe[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const h = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), d = a("box", ie.danger, 0.3);
          d.scale.set(0.75, 0.035, h), d.position.set(o.x + Math.cos(o.angle) * h / 2, 0.09, o.y + Math.sin(o.angle) * h / 2), d.rotation.y = Math.PI / 2 - o.angle, n("ring", ie.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const h = Math.hypot(o.target.x - o.x, o.target.y - o.y), d = a("box", ie.warning, 0.6);
          d.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), d.scale.set(h, 0.03, 0.09), d.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", ie.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", ie.danger, pe[o.kind].reach, o.target.x, o.target.y, 0.15 + u * 0.2), n("ring", ie.danger, pe[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", ie.frost, pe[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", ie.gold, pe[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let u = 0; u < 3; u++) {
        const h = a("rock", ie.fire, 0.8);
        h.position.set(o.x + Math.sin(u * 2) * 0.3, 0.35 + (s.tick + u * 7) % 20 / 18, o.y + Math.cos(u * 2) * 0.3), h.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of s.hazards) {
      const u = o.friendly ? o.kind === "fire" ? ie.fire : ie.magic : ie.danger;
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
        n("ring", ie.gold, o.radius * (0.7 + Math.sin(s.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let h = 0; h < 6; h++) {
          const d = h * Math.PI / 3, p = a("cone", u, 0.7);
          p.position.set(o.x + Math.cos(d) * o.radius * 0.65, 0.45, o.y + Math.sin(d) * o.radius * 0.65), p.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of s.shots) {
      const u = o.friendly ? ie.gold : ie.danger, h = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      h.position.set(o.x, 0.6, o.y), h.scale.set(0.11, 0.11, 0.11);
      const d = a("sphere", u, 0.8);
      d.position.copy(h.position), d.scale.set(0.21, 0.18, 0.21);
      const p = a("cone", u, 0.5);
      p.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), p.scale.set(0.14, 0.75, 0.14), p.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of s.effects) {
      const u = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const h = n("arc", ie.gold, o.size, o.x, o.y, 0.3 * (1 - u), 0.42);
        h.rotation.z = -o.angle - 0.9 + u * 0.4;
        const d = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - u), 0.43);
        d.rotation.z = h.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", yt.crest, o.size * (i ? 1 : 0.6 + u * (2 - u)), o.x, o.y, 0.8 - u * 0.6, 0.16);
        for (const h of s.companions) {
          if (h.kind !== "familiar" || h.hp <= 0 || h.life <= 0) continue;
          const d = h.x - c.x, p = h.y - c.y, m = a("box", yt.empowered, 1 - u * 0.7);
          m.position.set((c.x + h.x) / 2, 1.1, (c.y + h.y) / 2), m.scale.set(Math.hypot(d, p), 0.045, 0.045), m.rotation.y = -Math.atan2(p, d);
        }
        for (let h = 0; h < 4; h++) {
          const d = h * Math.PI / 2 + (i ? 0 : u), p = a("rock", yt.empowered, 1 - u * 0.4);
          p.position.set(c.x + Math.cos(d) * 0.95, 1.7 + (i ? 0 : u * 0.5), c.y + Math.sin(d) * 0.95), p.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let h = 0; h < 4; h++) {
          const d = a("box", h % 2 ? "#ffffff" : ie.magic, 1 - u * 0.6);
          d.scale.set(0.09 + (1 - u) * 0.09, 1.05, 0.08), d.position.set(o.x + (h % 2 ? 0.14 : -0.14), 0.5 + h * 0.85, o.y), d.rotation.z = h % 2 ? -0.35 : 0.35;
        }
        n("ring", ie.magic, 0.4 + u, o.x, o.y, 1 - u);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const h = o.kind === "block" || o.kind === "parry", d = o.kind === "ward-break", p = h ? o.kind === "parry" ? tt.parry : tt.block : tt.ward;
        if (h) {
          const m = a("ring", p, 1 - u);
          m.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), m.rotation.y = Math.PI / 2 - o.angle, m.scale.setScalar(0.6 + u * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let m = 0; m < (d ? 6 : 4); m++) {
          const x = m * 2.4 + o.id, b = a(d ? "rock" : "box", p, 1 - u), y = i ? 1.1 : 0.7 + u * (d ? 1.5 : 0.6);
          b.position.set(o.x + Math.cos(x) * y, 0.7 + m % 3 * 0.55, o.y + Math.sin(x) * y), b.scale.set(0.07 * (1 - u), (d ? 0.3 : 0.16) * (1 - u), 0.04), b.rotation.set(x, x, x);
        }
      } else if (o.kind === "heal") n("ring", ie.heal, 0.4 + u, o.x, o.y, 1 - u);
      else {
        const h = o.kind === "hit" ? ie.danger : ie.gold;
        if (n("ring", h, o.size * (0.4 + u), o.x, o.y, 1 - u), !i) for (let d = 0; d < 7; d++) {
          const p = d * 2.4 + o.id, m = a("rock", h, 1 - u * 0.8);
          m.position.set(o.x + Math.cos(p) * u * o.size, 0.4 + Math.sin(u * Math.PI) * 0.8, o.y + Math.sin(p) * u * o.size), m.scale.set(0.1 * (1 - u), 0.28 * (1 - u), 0.1 * (1 - u)), m.rotation.z = p;
        }
      }
    }
  } };
}
function qc(e) {
  const t = document.createElement("div"), r = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", tt.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", oe.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(K.maxHp)), t.append(r);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new xt();
  let s = null, i = 0, l = 0, c = null;
  function o(u, h, d, p, m, x, b) {
    n.set(h, d, p).project(m), u.style.left = `${(n.x * 0.5 + 0.5) * x}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * b}px`;
  }
  return {
    update(u, h, d, p) {
      if (u !== s && (s = u, i = 0, c = null, l = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const m = u.player;
      t.hidden || (r.style.width = `${m.ward / K.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(m.ward)), o(t, m.x, 0, m.y, h, d, p));
      const x = u.effects.filter((y) => y.id > i && y.kind in oe.defenseFeedback), b = x.find((y) => y.kind === "parry" || y.kind === "ward-break") ?? x.at(-1);
      b && (c = b.kind, l = u.tick + 27), i = u.serial, u.tick >= l && (c = null), a.hidden = !c && !m.shield, a.dataset.state = c ?? "blocking", a.textContent = c ? oe.defenseFeedback[c] : m.shield ? oe.guardActive : "", o(a, m.x, m.shield ? 3.65 : 3.05, m.y, h, d, p);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function Wc(e, t, r, a) {
  const n = a.facing === "east" || a.facing === "west", s = n ? a.footprint.depth : a.footprint.width, i = n ? a.footprint.width : a.footprint.depth, l = s >= i;
  t.rotation.y = r.rotation.y = a.facing === "north" ? Math.PI : a.facing === "east" ? Math.PI / 2 : a.facing === "west" ? -Math.PI / 2 : 0;
  const c = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(s, i) / 5));
  e.mesh(t, "box", f.mortar, [
    s,
    0.4,
    i
  ], [
    0,
    0.2,
    0
  ]);
  for (let o = 0; o < c; o++) {
    const u = l ? s / c : s, h = l ? i : i / c, d = e.group(r, [
      l ? -s / 2 + (o + 0.5) * u : 0,
      0,
      l ? 0 : -i / 2 + (o + 0.5) * h
    ]), p = (a.height ?? 4) + (o % 3 - 1) * 0.35, m = a.kind === "workshop", x = a.facing ? a.tint === "rose" ? "#c9b8cb" : a.tint === "sage" ? "#b6c5ca" : "#d4c8bb" : o % 2 ? f.stone : f.cloth;
    e.mesh(d, "box", x, [
      u - 0.15,
      p - 0.4,
      h - 0.15
    ], [
      0,
      (p + 0.4) / 2,
      0
    ]);
    for (const E of [-u / 2 + 0.12, u / 2 - 0.12]) e.mesh(d, "box", f.timber, [
      0.18,
      p,
      h
    ], [
      E,
      p / 2,
      0
    ]);
    for (const E of [0.7, p - 0.3]) e.mesh(d, "box", f.wood, [
      u,
      0.15,
      h
    ], [
      0,
      E,
      0
    ]);
    const b = e.group(d, [
      0,
      p + 0.24,
      0
    ]);
    b.rotation.x = -0.18;
    const y = !l && c > 1 ? h - 0.03 : h + 0.7;
    e.mesh(b, "box", f.roof, [
      u + 0.6,
      0.16,
      y
    ]);
    for (let E = -u / 2; E <= u / 2; E += 0.8) e.mesh(b, "box", f.roofLight, [
      0.055,
      0.07,
      y
    ], [
      E,
      0.12,
      0
    ]);
    e.mesh(b, "box", f.brass, [
      u + 0.65,
      0.12,
      0.13
    ], [
      0,
      0.03,
      y / 2
    ]);
    const _ = e.group(d, [
      0,
      0,
      h / 2
    ]), S = a.entrance ? 0 : -u * 0.19;
    e.mesh(_, "box", f.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      S,
      1.1,
      0
    ]);
    for (const E of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(_, "box", f.wood, [
      0.24,
      1.95,
      0.12
    ], [
      S + E,
      1.06,
      0.04
    ]);
    if (e.mesh(_, "box", f.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      u * 0.27,
      2.25,
      0.03
    ]), e.mesh(_, "box", f.ember, [
      0.7,
      0.67,
      0.14
    ], [
      u * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(_, "box", f.timber, [
      0.07,
      0.85,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), e.mesh(_, "box", f.timber, [
      0.85,
      0.07,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), a.facing) {
      for (const [E, L, w] of [
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
        const C = e.group(d);
        C.rotation.y = E;
        for (let R = -w / 2 + 1.8; R < w / 2 - 0.8; R += 3.2) for (let A = 2.1; A < p - 0.65; A += 2.5)
          E === 0 && A < 3 && (Math.abs(R - S) < 1.3 || Math.abs(R - u * 0.27) < 1.3) || (e.mesh(C, "box", f.shadow, [
            1.16,
            1.45,
            0.12
          ], [
            R,
            A,
            L
          ]), e.mesh(C, "box", f.ember, [
            0.94,
            1.17,
            0.07
          ], [
            R,
            A,
            L + 0.08
          ], !0), e.mesh(C, "box", f.timber, [
            0.08,
            1.3,
            0.11
          ], [
            R,
            A,
            L + 0.14
          ]), e.mesh(C, "box", f.timber, [
            1.03,
            0.09,
            0.11
          ], [
            R,
            A,
            L + 0.14
          ]), e.mesh(C, "box", f.light, [
            1.4,
            0.14,
            0.34
          ], [
            R,
            A - 0.76,
            L + 0.09
          ]));
        p > 5.5 && e.mesh(C, "box", f.light, [
          w,
          0.17,
          0.17
        ], [
          0,
          3.35,
          L
        ]);
      }
      if (a.entrance) {
        e.mesh(_, "box", f.timber, [
          2.9,
          0.8,
          0.18
        ], [
          0,
          3.45,
          0.14
        ]);
        for (const E of [
          -0.8,
          0,
          0.8
        ]) e.mesh(_, "box", f.brass, [
          0.25,
          0.38,
          0.04
        ], [
          E,
          3.45,
          0.25
        ]);
        for (const E of [-1, 1])
          e.mesh(_, "box", f.brass, [
            0.1,
            0.8,
            0.5
          ], [
            E * 1.6,
            2.9,
            0.25
          ]), e.mesh(_, "box", f.ember, [
            0.35,
            0.48,
            0.3
          ], [
            E * 1.6,
            2.5,
            0.43
          ], !0);
      }
    }
    if (h >= 4 && (l || o === c - 1)) {
      const E = e.group(_, [
        0,
        2.8,
        0.55
      ]);
      E.rotation.x = 0.22, e.mesh(E, "box", a.tint === "rose" ? f.rose : f.cloth, [
        u * 0.8,
        0.045,
        1.6
      ]), e.mesh(E, "box", f.light, [
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
      e.mesh(d, "box", f.wood, [
        u * 0.65,
        0.2,
        0.8
      ], [
        0,
        1.1,
        h / 2 - 0.5
      ]);
      for (let E = 0; E < 3; E++) e.mesh(d, "cylinder", f.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (E - 1) * 0.55,
        1.4,
        h / 2 - 0.5
      ]).rotation.z = Math.PI / 2;
    } else
      e.mesh(d, "box", f.slate, [
        0.6,
        p * 0.38,
        0.7
      ], [
        -u * 0.3,
        p + 0.55,
        -h * 0.2
      ]), e.mesh(d, "box", f.shadow, [
        0.75,
        0.15,
        0.85
      ], [
        -u * 0.3,
        p * 1.19 + 0.6,
        -h * 0.2
      ]);
  }
}
function Hc(e, t, r) {
  const a = e.group(t, [
    r.width / 2 + 0.04,
    0,
    0
  ]);
  a.rotation.y = Math.PI / 2;
  const n = Math.min(4.8, r.depth - 0.7);
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
  const s = e.group(a, [
    0,
    5.8,
    1.1
  ]);
  s.rotation.x = 0.14, e.mesh(s, "box", f.roof, [
    n + 0.45,
    0.16,
    2.5
  ]);
  for (let i = -n / 2; i < n / 2; i += 0.6) e.mesh(s, "box", f.roofLight, [
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
function Vc(e, t) {
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
  for (const r of [
    -0.22,
    0,
    0.22
  ]) e.mesh(t, "box", f.shadow, [
    0.05,
    0.48,
    0.07
  ], [
    r,
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
  for (let r = 0; r < 5; r++) e.mesh(t, "box", f.wood, [
    0.8,
    0.16,
    0.2
  ], [
    1.25,
    0.3 + r % 3 * 0.18,
    -0.5 + Math.floor(r / 3) * 0.24
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
  for (let r = 0; r < 5; r++) e.mesh(t, "rock", f.shadow, [
    0.18,
    0.16,
    0.17
  ], [
    -1.15 + Math.sin(r * 2) * 0.2,
    0.87,
    0.5 + Math.cos(r * 2) * 0.2
  ]);
}
function Gc(e, t, r, a) {
  e.mesh(t, "box", f.wood, [
    r,
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
    n * (r / 2 - 0.2),
    0.5,
    0
  ]);
  e.mesh(t, "box", f.cloth, [
    r * 0.4,
    0.025,
    a * 0.8
  ], [
    -r * 0.2,
    1.1,
    0
  ]);
  for (let n = 0; n < 5; n++)
    e.mesh(t, "cylinder", n % 2 ? f.pottery : f.slate, [
      0.16,
      0.32 + n % 2 * 0.15,
      0.16
    ], [
      r * 0.04 + n * 0.43,
      1.28,
      -0.3
    ]), e.mesh(t, "cylinder", f.wood, [
      0.17,
      0.055,
      0.17
    ], [
      r * 0.04 + n * 0.43,
      1.47 + n % 2 * 0.075,
      -0.3
    ]);
  for (let n = 0; n < 3; n++) e.mesh(t, "box", f.light, [
    0.8,
    0.12,
    0.48
  ], [
    -r * 0.25,
    1.18 + n * 0.12,
    0.12
  ]);
  e.mesh(t, "cylinder", f.pottery, [
    0.3,
    0.18,
    0.3
  ], [
    r * 0.22,
    1.19,
    0.45
  ]);
}
function Yc(e, t, r) {
  const a = new xt(...r.from), n = new xt(...r.to), s = n.clone().sub(a), i = s.length(), l = r.kind === "pipe", c = l ? 0.23 : 0.018, o = e.mesh(t, "cylinder", l ? f.brass : f.timber, [
    c,
    i,
    c
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (o.quaternion.setFromUnitVectors(new xt(0, 1, 0), s.normalize()), l) for (let u = 1; u < i; u += 3.7) {
    const h = a.clone().addScaledVector(s, u);
    e.mesh(t, "cylinder", f.wood, [
      0.28,
      0.16,
      0.28
    ], h.toArray()).quaternion.copy(o.quaternion), e.mesh(t, "box", f.shadow, [
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
    ], Math.floor(u) % 2 ? f.cloth : f.light);
    for (const p of [-1, 1]) e.mesh(d, "box", f.wood, [
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
function Qc(e, t, r) {
  const { width: a, depth: n } = r.footprint;
  if (r.kind === "ledger") {
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
  const s = Math.max(1, Math.floor(n / 2.2)), i = Math.max(1, Math.floor(a / 1.8));
  for (let l = 0; l < s; l++) for (let c = 0; c < i; c++) {
    const o = -a / 2 + (c + 0.5) * a / i, u = -n / 2 + (l + 0.5) * n / s, h = a / i - 0.22, d = n / s - 0.24;
    if (r.kind === "fuel") {
      for (let p = 0; p < 5; p++) e.mesh(t, "box", p % 2 ? f.wood : f.timber, [
        h,
        0.2,
        d / 2 - 0.07
      ], [
        o,
        0.28 + p * 0.24,
        u + p % 2 * 0.12
      ]);
      e.mesh(t, "box", f.cloth, [
        h + 0.08,
        0.055,
        d
      ], [
        o,
        1.42,
        u
      ]);
    } else {
      const p = 0.85 + (l + c) % 3 * 0.22;
      e.mesh(t, "box", f.wood, [
        h,
        p,
        d
      ], [
        o,
        0.16 + p / 2,
        u
      ]);
      for (const m of [-1, 1]) e.mesh(t, "box", f.timber, [
        0.11,
        p + 0.04,
        d + 0.05
      ], [
        o + m * h * 0.32,
        0.16 + p / 2,
        u
      ]);
      e.mesh(t, "box", f.light, [
        0.32,
        0.4,
        0.03
      ], [
        o,
        0.7,
        u + d / 2 + 0.02
      ]), e.mesh(t, "box", f.rose, [
        0.09,
        0.09,
        0.04
      ], [
        o,
        0.61,
        u + d / 2 + 0.045
      ]);
      for (let m = -0.25; m <= 0.25; m += 0.25) e.mesh(t, "box", f.timber, [
        h,
        0.015,
        0.016
      ], [
        o,
        p + 0.17,
        u + m * d
      ]);
      (l + c) % 3 === 0 && (e.mesh(t, "box", f.cloth, [
        h * 0.75,
        0.38,
        d * 0.55
      ], [
        o,
        p + 0.37,
        u - 0.18
      ]), e.mesh(t, "box", f.timber, [
        0.055,
        0.4,
        d * 0.57
      ], [
        o,
        p + 0.37,
        u - 0.18
      ])), e.mesh(t, "box", f.light, [
        0.32,
        0.018,
        0.45
      ], [
        o + h * 0.23,
        p + 0.19,
        u + d * 0.25
      ]);
    }
  }
}
function Kc(e, t, r, a) {
  for (let n = 0; n < 3; n++) e.mesh(t, "box", f.slate, [
    r * 0.65,
    0.08,
    0.7
  ], [
    0,
    2.19 + n * 0.08,
    a * 0.22
  ]);
  e.mesh(t, "box", f.rose, [
    r * 0.6,
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
    r * 0.35,
    0.17,
    a * 0.35
  ]), e.mesh(t, "cylinder", f.shadow, [
    0.18,
    0.014,
    0.18
  ], [
    r * 0.35,
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
function os(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.tint === "rose" ? f.rose : r.tint === "amber" ? f.amber : f.leafLight, i = (l) => {
    for (const c of [-1, 1]) for (const o of [-1, 1]) e.mesh(t, "box", f.timber, [
      0.16,
      l,
      0.16
    ], [
      c * (a / 2 - 0.3),
      l / 2,
      o * (n / 2 - 0.3)
    ]);
  };
  switch (r.kind) {
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
      ]), e.mesh(t, "box", s, [
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
      e.mesh(t, "box", s, [
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
      for (const c of [-1, 1])
        e.mesh(t, "box", f.wood, [
          a / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          c * a / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(t, "box", f.cloth, [
          a / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          c * a / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(t, "box", f.brass, [
          0.045,
          0.27,
          0.08
        ], [
          c * 0.2,
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
        for (let c = 0; c < 4; c++) e.mesh(t, "cylinder", f.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + c * 0.6,
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
      const l = r.height ?? 2.5;
      e.mesh(t, "box", f.timber, [
        a - 0.2,
        l,
        n - 0.2
      ], [
        0,
        l / 2,
        0
      ]);
      for (let c = -a / 2 + 0.55; c < a / 2 - 0.2; c += 1) for (let o = 0.5; o < l - 0.1; o += 0.8)
        e.mesh(t, "box", f.wood, [
          0.88,
          0.68,
          0.12
        ], [
          c,
          o,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", f.brass, [
          0.055,
          0.055,
          0.06
        ], [
          c,
          o,
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
      for (let c = 0; c < 3; c++) e.mesh(t, "cylinder", c % 2 ? f.pottery : f.light, [
        0.15,
        0.32 + c * 0.1,
        0.15
      ], [
        a * 0.15 + c * 0.4,
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
      ]), r.kind === "workbench") {
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
      const l = a > n, c = Math.max(a, n), o = e.group(t);
      l || (o.rotation.y = Math.PI / 2);
      for (let u = -c / 2 + 0.15; u < c / 2; u += 1.4)
        e.mesh(o, "box", f.timber, [
          0.09,
          2.8,
          0.12
        ], [
          u,
          1.4,
          0
        ]), e.mesh(o, "box", f.cloth, [
          Math.min(1.27, c / 2 - u),
          2.15,
          0.055
        ], [
          u + Math.min(0.68, (c / 2 - u) / 2),
          1.53,
          0
        ]);
      for (const u of [-1, 1]) e.mesh(o, "box", f.timber, [
        0.3,
        0.18,
        0.8
      ], [
        u * (c / 2 - 0.25),
        0.09,
        0
      ]);
      break;
    }
  }
}
function Xc(e, t, r, a) {
  const { width: n, depth: s } = a.footprint, i = a.height;
  e.mesh(t, "box", f.slate, [
    n,
    0.3,
    s
  ], [
    0,
    0.15,
    0
  ]), e.mesh(r, "box", f.light, [
    n,
    i - 0.3,
    s
  ], [
    0,
    (i + 0.3) / 2,
    0
  ]);
  for (const o of [0.5, i - 0.1]) e.mesh(r, "box", f.wood, [
    n + 0.04,
    0.16,
    s + 0.04
  ], [
    0,
    o,
    0
  ]);
  const l = n > s, c = Math.max(n, s);
  for (let o = -c / 2 + 0.3; o < c / 2; o += 3.5) e.mesh(r, "box", f.wood, [
    l ? 0.12 : n + 0.04,
    i,
    l ? s + 0.04 : 0.12
  ], [
    l ? o : 0,
    i / 2,
    l ? 0 : o
  ]);
  if (a.id === "west-wall") {
    const o = e.group(r, [
      n / 2 + 0.04,
      2.35,
      0
    ]);
    o.rotation.y = Math.PI / 2, e.mesh(o, "box", f.timber, [
      2.2,
      1.7,
      0.12
    ]), e.mesh(o, "box", f.window, [
      1.95,
      1.45,
      0.14
    ], [
      0,
      0,
      0.08
    ]);
    for (const u of [-1, 1])
      e.mesh(o, "box", f.cloth, [
        0.75,
        1.75,
        0.12
      ], [
        u * 0.73,
        -0.07,
        0.21
      ]), e.mesh(o, "box", f.brass, [
        0.78,
        0.06,
        0.03
      ], [
        u * 0.73,
        -0.23,
        0.29
      ]);
    e.mesh(o, "box", f.timber, [
      0.07,
      1.5,
      0.16
    ], [
      0,
      0,
      0.16
    ]), e.mesh(o, "box", f.wood, [
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
function Jc(e, t) {
  for (const r of [-1, 1]) e.mesh(t, "box", f.timber, [
    0.22,
    3.6,
    0.4
  ], [
    r * 1.9,
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
  for (const r of [0.5, 2.8]) e.mesh(t, "box", f.timber, [
    3.5,
    0.13,
    0.2
  ], [
    0,
    r,
    0
  ]);
  for (const r of [-1, 1]) e.mesh(t, "sphere", f.brass, [
    0.09,
    0.09,
    0.09
  ], [
    1.25,
    1.45,
    r * 0.16
  ]);
}
var be = {
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
}, We = be;
function lr(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.height;
  if (r.kind === "cliff") {
    const i = a > n, l = Math.ceil(Math.max(a, n) / 7);
    for (let c = 0; c < l; c++) {
      const o = [
        i ? -a / 2 + (c + 0.5) * a / l : 0,
        s * 0.4,
        i ? 0 : -n / 2 + (c + 0.5) * n / l
      ];
      e.mesh(t, "rock", We.ice, [
        i ? a / l * 0.55 : a / 2,
        s * 0.7,
        i ? n / 2 : n / l * 0.55
      ], o), e.mesh(t, "rock", We.snow, [
        i ? a / l * 0.53 : a * 0.48,
        s * 0.17,
        i ? n * 0.48 : n / l * 0.53
      ], [
        o[0],
        s * 0.93,
        o[2]
      ]);
    }
    return;
  }
  if (e.mesh(t, "box", We.soot, [
    a,
    0.65,
    n
  ], [
    0,
    0.325,
    0
  ]), r.kind === "hoist") {
    for (const i of [-1, 1]) {
      e.mesh(t, "box", We.iron, [
        0.65,
        s,
        n * 0.72
      ], [
        i * (a / 2 - 0.5),
        s / 2,
        0
      ]);
      for (let l = 2; l < s; l += 4) e.mesh(t, "box", We.copper, [
        a,
        0.25,
        0.3
      ], [
        0,
        l,
        n * 0.34
      ]);
      e.mesh(t, "cylinder", We.edge, [
        0.075,
        s - 2,
        0.075
      ], [
        i * a * 0.18,
        s / 2,
        0.6
      ]);
    }
    e.mesh(t, "box", We.iron, [
      a + 0.4,
      1,
      n
    ], [
      0,
      s,
      0
    ]), e.mesh(t, "torus", We.copper, [
      a * 0.3,
      a * 0.3,
      0.8
    ], [
      0,
      s - 1.8,
      0.3
    ]), e.mesh(t, "box", We.edge, [
      a * 0.7,
      0.45,
      n * 0.7
    ], [
      0,
      s * 0.35,
      0
    ]);
    return;
  }
  e.mesh(t, "cylinder", We.iron, [
    a * 0.44,
    s - 1,
    n * 0.44
  ], [
    0,
    s / 2 + 0.5,
    0
  ]);
  for (const i of [
    1.1,
    s * 0.38,
    s * 0.7,
    s - 0.3
  ]) e.mesh(t, "cylinder", We.copper, [
    a * 0.48,
    0.3,
    n * 0.48
  ], [
    0,
    i,
    0
  ]);
  for (let i = 0; i < 8; i++) {
    const l = i * Math.PI / 4;
    e.mesh(t, "box", We.edge, [
      0.22,
      s,
      0.22
    ], [
      Math.sin(l) * a * 0.44,
      s / 2,
      Math.cos(l) * n * 0.44
    ]);
  }
  for (const i of [-1, 1]) {
    e.mesh(t, "box", We.soot, [
      a * 0.16,
      s * 0.34,
      0.15
    ], [
      i * a * 0.23,
      s * 0.58,
      n * 0.45
    ]);
    for (let l = 0; l < 5; l++) e.mesh(t, "box", We.copper, [
      a * 0.16,
      0.14,
      0.2
    ], [
      i * a * 0.23,
      s * 0.44 + l * s * 0.065,
      n * 0.46
    ]);
  }
  e.mesh(t, "box", We.soot, [
    a * 0.4,
    s * 0.22,
    0.18
  ], [
    0,
    s * 0.16,
    n * 0.45
  ]), e.mesh(t, "torus", We.copper, [
    Math.min(a * 0.16, 1.3),
    Math.min(a * 0.16, 1.3),
    0.25
  ], [
    0,
    s * 0.18,
    n * 0.47
  ]);
}
function ed(e, t, r) {
  const a = r.bounds, n = a.z - a.depth / 2;
  if (r.vista === "snow") {
    for (let s = 0; s < 14; s++) {
      const i = s % 2 ? -1 : 1, l = 18 + s % 4 * 11, c = i * (a.width / 2 + 22 + s % 3 * 16), o = n - 35 + s * 12;
      e.mesh(t, "rock", s % 3 ? "#99b2c4" : "#b9cdd7", [
        19,
        l,
        23
      ], [
        c,
        -15,
        o
      ]), e.mesh(t, "rock", "#e4eff0", [
        12,
        l * 0.29,
        15
      ], [
        c,
        l * 0.66 - 15,
        o
      ]);
    }
    return;
  }
  lr(e, e.group(t, [
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
    lr(e, e.group(t, [
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
    for (let i = 0; i < 5; i++) {
      const l = s * (a.width / 2 + 16), c = n + i * 18;
      e.mesh(t, "box", "#8197a5", [
        11,
        10 + i % 2 * 6,
        12
      ], [
        l,
        -3,
        c
      ]), e.mesh(t, "box", "#52687b", [
        12,
        0.5,
        13
      ], [
        l,
        2 + i % 2 * 3,
        c
      ]);
    }
  }
}
function mo(e, t, r, a, n = 2.8) {
  e.mesh(t, "cylinder", f.shadow, [
    0.055,
    n,
    0.055
  ], [
    r,
    n / 2,
    a
  ]), e.mesh(t, "box", f.brass, [
    0.4,
    0.08,
    0.4
  ], [
    r,
    n,
    a
  ]), e.mesh(t, "box", f.ember, [
    0.22,
    0.38,
    0.22
  ], [
    r,
    n + 0.21,
    a
  ], !0), e.mesh(t, "cone", f.shadow, [
    0.32,
    0.24,
    0.32
  ], [
    r,
    n + 0.51,
    a
  ]);
  for (const s of [-1, 1]) e.mesh(t, "box", f.shadow, [
    0.035,
    0.4,
    0.035
  ], [
    r + s * 0.14,
    n + 0.2,
    a + 0.14
  ]);
}
function go(e, t, r, a, n, s) {
  const i = r / 2 + 0.45, l = Math.atan2(s, i), c = Math.hypot(i, s);
  for (const o of [-1, 1]) {
    const u = e.group(t, [
      o * i / 2,
      n + s / 2,
      0
    ]);
    u.rotation.z = -o * l, e.mesh(u, "box", f.roof, [
      c + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let h = 0; h < Math.ceil(c / 0.65); h++) e.mesh(u, "box", h % 3 ? f.roof : f.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -c / 2 + h * 0.65,
      0.13,
      0
    ]);
    e.mesh(u, "box", f.shadow, [
      0.2,
      0.24,
      a + 1.25
    ], [
      o * c / 2,
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
    n + s + 0.14,
    0
  ]);
  for (const o of [-a / 2 - 0.08, a / 2 + 0.08])
    e.shape(t, [
      [-r / 2, 0],
      [r / 2, 0],
      [0, s]
    ], f.light, [
      0,
      n,
      o
    ], 0.08), e.mesh(t, "box", f.timber, [
      0.15,
      s,
      0.18
    ], [
      0,
      n + s / 2,
      o + 0.12
    ]);
}
function gn(e, t, r, a, n, s = 1.1) {
  e.mesh(t, "box", f.shadow, [
    s,
    1.45,
    0.12
  ], [
    r,
    n,
    a
  ]), e.mesh(t, "box", f.window, [
    s - 0.18,
    1.25,
    0.14
  ], [
    r,
    n,
    a + 0.07
  ]);
  for (const i of [-1, 1])
    e.mesh(t, "box", f.wood, [
      0.13,
      1.6,
      0.2
    ], [
      r + i * s / 2,
      n,
      a + 0.12
    ]), e.mesh(t, "box", f.light, [
      s + 0.28,
      0.14,
      0.26
    ], [
      r,
      n + i * 0.8,
      a + 0.12
    ]);
  e.mesh(t, "box", f.timber, [
    0.07,
    1.3,
    0.16
  ], [
    r,
    n,
    a + 0.16
  ]), e.mesh(t, "box", f.timber, [
    s,
    0.06,
    0.16
  ], [
    r,
    n,
    a + 0.16
  ]);
}
function td(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.kind === "clinic", i = s ? 3.7 : 5;
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
  for (const u of [-a * 0.29, a * 0.29]) gn(e, t, u, n / 2, 2.3, s ? 1.6 : 1.2);
  const l = e.group(t, [
    a / 2,
    0,
    0
  ]);
  l.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) gn(e, l, u, 0.03, 2.3);
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
  ]), go(e, t, a, n, i, s ? 1.15 : 3.2);
  const c = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), o = s ? 2.1 : 3.3;
  if (e.mesh(c, "box", f.stone, [
    1.1,
    o,
    1.2
  ], [
    0,
    o / 2,
    0
  ]), e.mesh(c, "box", f.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    o - 0.2,
    0
  ]), e.mesh(c, "box", f.shadow, [
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
    gn(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", f.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function ad(e, t, r) {
  const a = r.height, n = r.footprint.width, s = r.tint === "amber", i = r.tint === "rose", l = s ? f.amber : i ? f.rose : f.leaf, c = s ? f.amberLight : i ? "#dfb2a1" : f.leafLight, o = e.mesh(t, "cylinder", f.timber, [
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
    const h = u * 2.4, d = u === 8 ? 0.1 : n * 0.56, p = e.mesh(t, "crown", u % 3 ? l : c, [
      n * 0.49 + 0.4,
      a * 0.16,
      n * 0.45 + 0.4
    ], [
      Math.sin(h) * d,
      a * (0.68 + u % 3 * 0.11),
      Math.cos(h) * d
    ]);
    p.rotation.set(u * 0.37, u * 0.61, 0.14), p.receiveShadow = !1;
  }
}
function nd(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.height;
  e.mesh(t, "box", f.stone, [
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
    s - 1,
    n + 0.15
  ], [
    i,
    s / 2,
    0
  ]);
  for (const i of [s * 0.35, s * 0.7]) gn(e, t, 0, n / 2 + 0.02, i, 0.7);
  go(e, t, a + 0.35, n + 0.35, s, s * 0.32), e.mesh(t, "cylinder", f.brass, [
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
  ], f.cloth, [
    0.05,
    s * 1.32 + 2.4,
    0
  ]);
}
function rd(e, t, r, a, n) {
  const s = a.footprint, i = e.group(t, [
    s.x,
    0,
    s.z
  ]), l = e.group(r, [
    s.x,
    0,
    s.z
  ]);
  switch (a.kind) {
    case "kiln":
    case "hoist":
    case "cliff":
      lr(e, l, a);
      break;
    case "door":
      Jc(e, l);
      break;
    case "screen":
      os(e, l, a);
      break;
    case "bed":
    case "cabinet":
    case "wardrobe":
    case "toolrack":
    case "table":
    case "chair":
    case "basin":
    case "workbench":
      os(e, i, a);
      break;
    case "dwelling":
    case "workshop":
      Wc(e, i, l, a);
      break;
    case "stove":
      Vc(e, i);
      break;
    case "medicine":
      Gc(e, i, s.width, s.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      Qc(e, i, a);
      break;
    case "clinic":
    case "storehouse":
      e.mesh(i, "box", f.mortar, [
        s.width,
        0.3,
        s.depth
      ], [
        0,
        0.15,
        0
      ]), td(e, l, a);
      break;
    case "tree":
      e.mesh(i, "box", f.soil, [
        s.width,
        0.18,
        s.depth
      ], [
        0,
        0.08,
        0
      ]);
      for (let c = 0; c < 7; c++) {
        const o = c * 0.9;
        e.mesh(i, "rock", f.grassDark, [
          0.7,
          0.3,
          0.5
        ], [
          Math.sin(o) * s.width * 0.33,
          0.2,
          Math.cos(o) * s.depth * 0.33
        ]);
      }
      ad(e, l, a);
      break;
    case "tower":
      nd(e, l, a);
      break;
    case "column": {
      const c = a.height, o = Math.min(s.width, s.depth) * 0.3;
      e.mesh(i, "box", f.mortar, [
        s.width,
        0.35,
        s.depth
      ], [
        0,
        0.17,
        0
      ]), e.mesh(i, "box", f.light, [
        s.width * 0.84,
        0.35,
        s.depth * 0.84
      ], [
        0,
        0.5,
        0
      ]), e.mesh(l, "cylinder", f.stone, [
        o,
        c - 1.1,
        o
      ], [
        0,
        c / 2,
        0
      ]);
      for (let u = 0; u < 10; u++) {
        const h = u * Math.PI / 5;
        e.mesh(l, "box", f.light, [
          0.085,
          c - 2,
          0.085
        ], [
          Math.sin(h) * o,
          c / 2,
          Math.cos(h) * o
        ]);
      }
      for (const u of [0.85, c - 0.7]) e.mesh(l, "cylinder", f.brass, [
        o * 1.15,
        0.18,
        o * 1.15
      ], [
        0,
        u,
        0
      ]);
      e.mesh(l, "box", f.light, [
        s.width,
        0.4,
        s.depth
      ], [
        0,
        c - 0.3,
        0
      ]), e.mesh(l, "box", f.slate, [
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
      e.mesh(i, "box", f.mortar, [
        s.width,
        0.28,
        s.depth
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
      for (const c of [
        1.2,
        3.5,
        4.4
      ]) e.mesh(l, "cylinder", f.brass, [
        1.55,
        0.2,
        1.55
      ], [
        0,
        c,
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
      for (let c = 0; c < 6; c++) {
        const o = c * Math.PI / 3, u = e.group(l, [
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
        ], f.brass, [
          0,
          0,
          0
        ], 0.14);
      }
      break;
    case "bunk":
      Kc(e, i, s.width, s.depth);
      for (const c of [0.55, 1.9])
        e.mesh(i, "box", f.timber, [
          s.width - 0.5,
          0.18,
          s.depth - 0.5
        ], [
          0,
          c,
          0
        ]), e.mesh(i, "box", f.cloth, [
          s.width - 0.8,
          0.18,
          s.depth - 0.9
        ], [
          0,
          c + 0.16,
          0
        ]), e.mesh(i, "box", f.light, [
          s.width - 1,
          0.24,
          1.2
        ], [
          0,
          c + 0.28,
          -s.depth / 2 + 1.3
        ]);
      for (const c of [-1, 1]) for (const o of [-1, 1]) e.mesh(i, "box", f.shadow, [
        0.12,
        2.7,
        0.12
      ], [
        c * (s.width / 2 - 0.3),
        1.35,
        o * (s.depth / 2 - 0.3)
      ]);
      break;
    case "root": {
      const c = a.height, o = s.width * 0.23;
      e.mesh(i, "rock", f.soil, [
        s.width * 0.5,
        0.65,
        s.depth * 0.5
      ], [
        0,
        0.1,
        0
      ]);
      for (let u = 0; u < 5; u++) {
        const h = u * Math.PI * 0.4, d = s.width * 0.25, p = e.group(l, [
          Math.sin(h) * o * 0.45,
          0,
          Math.cos(h) * o * 0.45
        ]);
        p.rotation.y = h;
        const m = e.mesh(p, "cylinder", u % 2 ? f.root : f.rootLight, [
          o * 0.65,
          c * 0.64,
          o * 0.49
        ], [
          0,
          c * 0.3,
          0
        ]);
        m.rotation.z = 0.13;
        const x = e.group(p, [
          0,
          c * 0.48,
          0
        ]);
        x.rotation.z = 0.4 + u * 0.12, e.mesh(x, "cone", f.root, [
          o * 0.47,
          c * 0.55,
          o * 0.4
        ], [
          0,
          c * 0.25,
          0
        ]);
        const b = e.mesh(p, "cone", f.root, [
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
      if (c > 8) {
        e.mesh(l, "rock", f.shadow, [
          o * 0.65,
          c * 0.22,
          0.35
        ], [
          0,
          c * 0.38,
          o * 0.65
        ]), e.mesh(l, "rock", f.brass, [
          o * 0.16,
          c * 0.16,
          0.15
        ], [
          0,
          c * 0.4,
          o * 0.68
        ], !0);
        for (let u = 0; u < 7; u++) e.mesh(l, "crown", u % 2 ? f.leaf : f.leafLight, [
          1.4,
          0.8,
          1.2
        ], [
          Math.sin(u * 2) * o,
          c * 0.55 + u * 0.4,
          Math.cos(u * 2) * o
        ]);
      }
      break;
    }
    case "bridge":
      e.mesh(i, "box", f.light, [
        s.width,
        0.06,
        s.depth - 2
      ], [
        0,
        -0.01,
        0
      ]);
      for (const c of [-1, 1]) {
        const o = c * (s.depth / 2 - 0.5);
        e.mesh(i, "box", f.stone, [
          s.width,
          0.72,
          1
        ], [
          0,
          0.36,
          o
        ]), e.mesh(i, "box", f.light, [
          s.width,
          0.15,
          1
        ], [
          0,
          0.795,
          o
        ]);
        for (const u of [-s.width / 2 + 0.5, s.width / 2 - 0.5])
          e.mesh(i, "box", f.mortar, [
            0.8,
            1.05,
            1
          ], [
            u,
            0.525,
            o
          ]), e.mesh(i, "box", f.light, [
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
      const c = a.height;
      e.mesh(l, "arch", f.light, [
        s.width / 2 - 0.4,
        3.1,
        s.depth * 0.65
      ], [
        0,
        c - 3,
        0
      ]), e.mesh(l, "box", f.brass, [
        0.8,
        1.4,
        s.depth * 0.75
      ], [
        0,
        c + 0.2,
        0
      ]);
      for (const o of [-1, 1]) {
        const u = e.group(l, [
          o * (s.width / 2 - 0.5),
          c - 2.2,
          s.depth / 2 - 0.4
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
        Xc(e, i, l, a);
        break;
      }
      const c = a.height, o = Math.min(c, 0.65);
      a.wallUse === "homes" && Hc(e, l, s), e.mesh(i, "box", f.mortar, [
        s.width,
        o,
        s.depth
      ], [
        0,
        o / 2,
        0
      ]), c > o && e.mesh(l, "box", n ? f.marble : f.stone, [
        s.width,
        c - o,
        s.depth
      ], [
        0,
        (c + o) / 2,
        0
      ]), e.mesh(l, "box", f.light, [
        s.width + 0.12,
        0.23,
        s.depth + 0.12
      ], [
        0,
        c,
        0
      ]);
      const u = s.width > s.depth, h = Math.max(s.width, s.depth);
      if (n) {
        for (const d of [1.1, c - 0.55]) e.mesh(l, "box", f.light, [
          s.width + 0.15,
          0.22,
          s.depth + 0.15
        ], [
          0,
          d,
          0
        ]);
        for (let d = -h / 2 + 3; d < h / 2 - 1; d += 6) for (const p of [-1, 1]) {
          const m = e.group(l, [
            u ? d : p * (s.width / 2 + 0.04),
            0,
            u ? p * (s.depth / 2 + 0.04) : d
          ]);
          m.rotation.y = u ? p < 0 ? Math.PI : 0 : p * Math.PI / 2;
          const x = c * 0.61, b = Math.min(2.1, c * 0.3);
          e.mesh(m, "box", f.undercroft, [
            1.5,
            b,
            0.05
          ], [
            0,
            x,
            0
          ]);
          for (const y of [
            -0.55,
            0,
            0.55
          ]) e.mesh(m, "box", f.shadow, [
            0.07,
            b,
            0.06
          ], [
            y,
            x,
            0.06
          ]);
          for (const y of [-1, 1]) e.mesh(m, "box", f.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            x + y * b / 2,
            0.06
          ]);
          e.mesh(m, "box", f.stone, [
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
      for (let d = -h / 2 + 1; d < h / 2; d += 3.5) {
        c > 4 && e.mesh(l, "box", f.stone, u ? [
          1.3,
          0.85,
          s.depth
        ] : [
          s.width,
          0.85,
          1.3
        ], [
          u ? d : 0,
          c + 0.55,
          u ? 0 : d
        ]);
        for (let p = 0; p < Math.floor(c / 0.9); p++) e.mesh(l, "box", f.mortar, u ? [
          0.035,
          0.6,
          0.025
        ] : [
          0.025,
          0.6,
          0.035
        ], [
          u ? d + p % 2 * 0.7 : s.width / 2 + 0.01,
          0.55 + p * 0.85,
          u ? s.depth / 2 + 0.01 : d + p % 2 * 0.7
        ]);
      }
      break;
    }
    case "water":
      e.mesh(i, "box", f.water, [
        s.width,
        0.12,
        s.depth
      ], [
        0,
        -0.18,
        0
      ]);
      for (let c = 0; c < s.width * s.depth / 9; c++) {
        const o = Math.sin(c * 7.3) * (s.width / 2 - 0.8), u = Math.cos(c * 3.7) * (s.depth / 2 - 0.3);
        e.mesh(i, "box", f.ripple, [
          0.4 + c % 4 * 0.3,
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
      e.mesh(i, "box", f.stone, [
        s.width,
        0.55,
        s.depth
      ], [
        0,
        0.275,
        0
      ]), e.mesh(i, "box", f.soil, [
        s.width - 0.35,
        0.1,
        s.depth - 0.35
      ], [
        0,
        0.57,
        0
      ]);
      for (let c = -s.width / 2 + 0.65; c < s.width / 2; c += 1) for (let o = -s.depth / 2 + 0.6; o < s.depth / 2; o += 0.95) {
        const u = Math.sin(c * 7 + o * 19), h = s.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? f.leafLight : f.leaf, [
          h,
          0.32 + u * 0.1,
          h * 0.9
        ], [
          c + u * 0.15,
          0.81,
          o
        ]), u > 0.5 && e.mesh(i, "rock", u > 0.8 ? f.light : f.rose, [
          0.1,
          0.12,
          0.1
        ], [
          c + 0.1,
          1.13,
          o
        ]);
      }
      break;
    case "thicket":
      e.mesh(i, "box", f.soil, [
        s.width,
        0.2,
        s.depth
      ], [
        0,
        0.07,
        0
      ]);
      for (let c = -s.width / 2 + 0.7; c < s.width / 2; c += 1.3) for (let o = -s.depth / 2 + 0.65; o < s.depth / 2; o += 1.25) {
        const u = Math.sin(c * 13 + o * 7), h = 0.6 + u * 0.2;
        e.mesh(i, "crown", u > 0 ? f.leaf : f.leafLight, [
          0.7,
          h,
          0.7
        ], [
          c,
          h * 0.75,
          o
        ]), u > 0.75 && e.mesh(i, "rock", f.amberLight, [
          0.16,
          0.15,
          0.16
        ], [
          c,
          h * 1.65,
          o
        ]);
      }
      break;
    case "wagon":
      e.mesh(i, "box", f.wood, [
        s.width - 1,
        0.35,
        s.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const c of [-1, 1]) {
        for (let o = 0; o < 3; o++) e.mesh(i, "box", f.wood, [
          0.12,
          0.24,
          s.depth - 1
        ], [
          c * (s.width / 2 - 0.5),
          1.4 + o * 0.29,
          0
        ]);
        for (const o of [-s.depth * 0.28, s.depth * 0.28]) {
          if (a.damaged && c < 0 && o > 0) {
            e.mesh(i, "torus", f.shadow, [
              0.7,
              0.7,
              0.7
            ], [
              -s.width / 2 + 0.8,
              0.18,
              o
            ]).rotation.x = Math.PI / 2, e.mesh(i, "box", f.wood, [
              1.1,
              0.1,
              0.1
            ], [
              -s.width / 2 + 0.8,
              0.18,
              o
            ]), e.mesh(i, "box", f.wood, [
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
          e.mesh(i, "torus", f.shadow, [
            0.7,
            0.7,
            0.7
          ], [
            c * (s.width / 2 - 0.2),
            0.76,
            o
          ]).rotation.y = Math.PI / 2;
          for (let u = 0; u < 4; u++) {
            const h = e.mesh(i, "box", f.wood, [
              0.09,
              1.25,
              0.09
            ], [
              c * (s.width / 2 - 0.2),
              0.76,
              o
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
      for (let c = 0; c < 4; c++) {
        const o = e.group(i, [
          c % 2 * 1.5 - 0.75,
          c === 3 ? 1.3 : 0,
          c < 2 ? -0.7 : 0.7
        ]);
        e.mesh(o, "box", f.wood, [
          1.2,
          1.2,
          1.2
        ], [
          0,
          0.6,
          0
        ]);
        for (const u of [-1, 1]) e.mesh(o, "box", f.timber, [
          0.1,
          1.25,
          1.3
        ], [
          u * 0.43,
          0.6,
          0
        ]);
        e.mesh(o, "box", f.light, [
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
        s.width - 0.3,
        0.18,
        s.depth - 0.2
      ], [
        0,
        0.72,
        0
      ]), e.mesh(i, "box", f.wood, [
        0.13,
        0.75,
        s.depth - 0.2
      ], [
        -s.width / 2 + 0.1,
        1.12,
        0
      ]);
      for (const c of [-1, 1]) e.mesh(i, "box", f.shadow, [
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
      e.mesh(i, "box", f.stone, [
        s.width,
        0.5,
        s.depth
      ], [
        0,
        0.25,
        0
      ]);
      for (let c = 0; c < 3; c++) {
        const o = -s.width * 0.3 + c * s.width * 0.3, u = (a.height ?? 3) * (1 - c * 0.22), h = s.width * 0.11;
        e.mesh(l, "cylinder", f.stone, [
          h,
          u,
          h
        ], [
          o,
          u / 2 + 0.3,
          -s.depth * 0.2
        ]), e.mesh(l, "box", f.light, [
          h * 2.6,
          0.25,
          h * 2.6
        ], [
          o,
          u + 0.3,
          -s.depth * 0.2
        ]);
        for (let d = 0; d < 6; d++) {
          const p = d * Math.PI / 3;
          e.mesh(l, "box", f.mortar, [
            0.055,
            u * 0.8,
            0.055
          ], [
            o + Math.sin(p) * h,
            u / 2 + 0.3,
            -s.depth * 0.2 + Math.cos(p) * h
          ]);
        }
      }
      e.mesh(i, "rock", f.grassDark, [
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
var Ha = 1e-7;
function cr(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function is(e, t, r, a) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const i = e[s], l = e[(s + 1) % e.length], c = cr(t, r, i), o = cr(t, r, l), u = a ? c >= -1e-7 : c <= Ha, h = a ? o >= -1e-7 : o <= Ha;
    if (u && n.push(i), u !== h && Math.abs(c - o) > Ha) {
      const d = c / (c - o);
      n.push([i[0] + (l[0] - i[0]) * d, i[1] + (l[1] - i[1]) * d]);
    }
  }
  return n;
}
function vo(e) {
  return Math.abs(e.reduce((t, r, a) => t + r[0] * e[(a + 1) % e.length][1] - r[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function sd(e, t) {
  let r = e;
  const a = [];
  for (let n = 0; n < t.length && r.length >= 3; n++) {
    const s = t[n], i = t[(n + 1) % t.length], l = is(r, s, i, !1);
    vo(l) > Ha && a.push(l), r = is(r, s, i, !0);
  }
  return a;
}
function od(e, t, r) {
  const a = t[0] - e[0], n = t[1] - e[1], s = r / (2 * Math.hypot(a, n)), i = -n * s, l = a * s;
  return [
    [e[0] + i, e[1] + l],
    [e[0] - i, e[1] - l],
    [t[0] - i, t[1] - l],
    [t[0] + i, t[1] + l]
  ];
}
function yo(e, t) {
  const r = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) r.push(od(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, s] of a.points.slice(1, -1)) r.push(Array.from({ length: 12 }, (i, l) => {
      const c = l * Math.PI / 6, o = (a.width + t) / 2;
      return [n + Math.cos(c) * o, s + Math.sin(c) * o];
    }));
  }
  return r;
}
function id(e, t = 0) {
  const r = yo(e, t), a = [];
  for (let n = 0; n < r.length; n++) {
    let s = [r[n]];
    for (let i = 0; i < n && s.length; i++) s = s.flatMap((l) => sd(l, r[i]));
    a.push(...s.filter((i) => vo(i) > Ha));
  }
  return a;
}
function ld(e, t, r, a) {
  if (r === "boards") return;
  const n = r === "marble", s = r === "street", i = r === "iron", l = r === "snow";
  for (const [u, h, d] of [[
    l ? 1.1 : 0.4,
    0.025,
    l ? be.snowCrest : i ? be.copper : n ? f.brass : s ? f.streetSeam : f.mortar
  ], [
    0,
    0.04,
    l ? be.snowPath : i ? be.walkway : n ? f.slate : s ? f.streetStone : f.stone
  ]]) for (const p of id(t, u)) {
    const m = p.reduce((y, _) => y + _[0], 0) / p.length, x = p.reduce((y, _) => y + _[1], 0) / p.length, b = e.shape(a(m, x), p.map((y) => [y[0], -y[1]]), d, [
      0,
      h,
      0
    ]);
    b.rotation.x = -Math.PI / 2, b.castShadow = !1;
  }
  if (l) return;
  const c = yo(t, 0.4);
  let o = 0;
  for (const u of t) {
    for (let h = 1; h < u.points.length; h++, o++) {
      const d = u.points[h - 1], p = u.points[h], m = p[0] - d[0], x = p[1] - d[1], b = Math.hypot(m, x);
      for (let y = 1.5; y < b; y += 1.65) {
        const _ = d[0] + m * y / b, S = d[1] + x * y / b;
        if (c.some((L, w) => w !== o && L.every((C, R) => cr(C, L[(R + 1) % L.length], [_, S]) >= -1e-7))) continue;
        const E = e.mesh(a(_, S), "box", i ? be.iron : n ? f.shadow : s ? f.streetSeam : f.mortar, [
          u.width - 0.08,
          0.012,
          0.025
        ], [
          _,
          0.049,
          S
        ]);
        if (E.rotation.y = Math.atan2(m, x), E.castShadow = !1, s) {
          const L = e.mesh(a(_, S), "box", f.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            _ + Math.cos(y) * 0.55,
            0.049,
            S
          ]);
          L.rotation.y = Math.atan2(m, x), L.castShadow = !1;
        }
      }
    }
    o += u.points.length - 2;
  }
}
function cd(e, t) {
  const r = e.x - e.width / 2, a = r + e.width, n = e.z - e.depth / 2, s = n + e.depth, i = Math.max(r, t.x - t.width / 2), l = Math.min(a, t.x + t.width / 2), c = Math.max(n, t.z - t.depth / 2), o = Math.min(s, t.z + t.depth / 2);
  return i >= l || c >= o ? [e] : [
    [
      r,
      n,
      a,
      c
    ],
    [
      r,
      o,
      a,
      s
    ],
    [
      r,
      c,
      i,
      o
    ],
    [
      l,
      c,
      a,
      o
    ]
  ].filter(([u, h, d, p]) => d > u && p > h).map(([u, h, d, p]) => ({
    x: (u + d) / 2,
    z: (h + p) / 2,
    width: d - u,
    depth: p - h
  }));
}
function Yn(e, t, r) {
  const a = r[0] - t[0], n = r[1] - t[1], s = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * s, e.y - t[1] - n * s);
}
function dd(e, t, r) {
  const a = [], n = /* @__PURE__ */ new Map(), s = [], i = new Jo(), l = new xt(), c = new Bo(), o = [];
  function u(w, C) {
    const R = `${Math.floor(w / 16)}:${Math.floor(C / 16)}`;
    let A = n.get(R);
    return A || (A = e.group(t), n.set(R, A)), A;
  }
  let h = [r.bounds];
  for (const w of r.features.filter((C) => C.kind === "water")) h = h.flatMap((C) => cd(C, w.footprint));
  const d = r.surface === "grass", p = r.surface === "marble", m = r.surface === "street", x = r.surface === "boards", b = r.surface === "snow", y = r.surface === "iron" ? be.deck : b ? be.snow : x ? f.wood : d ? f.grass : m ? f.street : r.surface === "wet" ? f.wetStone : p ? f.marble : f.stone;
  for (const w of h)
    if (e.mesh(u(w.x, w.z), "box", y, [
      w.width,
      0.6,
      w.depth
    ], [
      w.x,
      -0.32,
      w.z
    ]).castShadow = !1, x) for (let C = w.x - w.width / 2; C < w.x + w.width / 2; C += 1) for (let R = w.z - w.depth / 2; R < w.z + w.depth / 2; R += 4) {
      const A = Math.min(4, w.z + w.depth / 2 - R);
      e.mesh(u(C, R), "box", ss[Math.abs(C + R) % ss.length], [
        0.985,
        0.018,
        A - 0.025
      ], [
        C + 0.5,
        -9e-3,
        R + A / 2
      ]).castShadow = !1;
    }
    else if (!d && !m && !b) for (let C = w.x - w.width / 2; C < w.x + w.width / 2; C += 4) for (let R = w.z - w.depth / 2; R < w.z + w.depth / 2; R += 4) {
      const A = Math.min(4, w.x + w.width / 2 - C), T = Math.min(4, w.z + w.depth / 2 - R), I = p ? Math.round(C / 4 + R / 4) % 2 ? f.marble : f.marbleLight : y;
      e.mesh(u(C, R), "box", I, [
        A - 0.04,
        0.018,
        T - 0.04
      ], [
        C + A / 2,
        -9e-3,
        R + T / 2
      ]).castShadow = !1;
    }
  if (r.vista !== "room" && ld(e, r.roads, r.surface, u), b) for (let w = 0; w < 70; w++) {
    const C = r.bounds.x + Math.sin(w * 31.7) * (r.bounds.width / 2 - 4), R = r.bounds.z + Math.cos(w * 19.3) * (r.bounds.depth / 2 - 5), A = {
      x: C,
      y: R
    };
    if (r.features.some((I) => fn(A, I.footprint)) || r.roads.some((I) => I.points.slice(1).some((M, O) => Yn(A, I.points[O], M) < I.width / 2 + 1.5))) continue;
    const T = e.mesh(u(C, R), "rock", w % 3 ? be.snowCrest : be.ice, [
      1.2 + w % 3,
      0.06 + w % 2 * 0.03,
      0.3 + w % 4 * 0.1
    ], [
      C,
      0.025,
      R
    ]);
    T.rotation.y = -0.35, T.castShadow = !1;
  }
  if (m) for (let w = 0; w < 320; w++) {
    const C = r.bounds.x + Math.sin(w * 127.13) * (r.bounds.width / 2 - 3), R = r.bounds.z + Math.cos(w * 53.71) * (r.bounds.depth / 2 - 3), A = {
      x: C,
      y: R
    };
    if (r.features.some((M) => fn(A, M.footprint))) continue;
    const T = Math.min(...r.roads.flatMap((M) => M.points.slice(1).map((O, N) => Yn(A, M.points[N], O))));
    if (T < 2 || T > 9) continue;
    const I = e.mesh(u(C, R), "box", w % 3 ? f.streetSeam : f.streetStone, [
      0.4 + w % 3 * 0.18,
      0.025,
      0.25
    ], [
      C,
      -2e-3,
      R
    ]);
    I.rotation.y = w * 0.41, I.castShadow = !1;
  }
  if (p) {
    const w = u(0, -17);
    for (const C of [
      4,
      4.4,
      5.5
    ]) e.ring(w, f.brass, C, 0, -17, 1, !1, 0.09);
    for (let C = 0; C < 12; C++) {
      const R = C * Math.PI / 6;
      e.shape(w, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], f.brass, [
        Math.sin(R) * 4.6,
        0.095,
        -17 + Math.cos(R) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, R);
    }
  }
  for (const w of r.suspended ?? []) {
    const C = e.group(t);
    Yc(e, C, w), a.push(e.bake(C)), s.push({
      root: C,
      bounds: new vn().setFromObject(C).expandByScalar(0.1)
    });
  }
  const { bounds: _ } = r;
  for (let w = 0; w < (d ? 420 : 0); w++) {
    const C = _.x + Math.sin(w * 127.13) * (_.width / 2 - 3), R = _.z + Math.cos(w * 53.71) * (_.depth / 2 - 3), A = {
      x: C,
      y: R
    };
    if (r.features.some((I) => fn(A, {
      ...I.footprint,
      width: I.footprint.width + 1.5,
      depth: I.footprint.depth + 1.5
    })) || r.roads.some((I) => I.points.slice(1).some((M, O) => Yn(A, I.points[O], M) < I.width / 2 + 1))) continue;
    const T = u(C, R);
    if (w % 4 === 0) {
      const I = Array.from({ length: 9 }, (O, N) => {
        const F = N * Math.PI * 2 / 9, V = 1 + Math.sin(N * 7 + w) * 0.3;
        return [Math.cos(F) * V * (1.2 + w % 3), Math.sin(F) * V * (0.7 + w % 2)];
      }), M = e.shape(T, I, w % 8 ? f.grassDark : f.grassLight, [
        C,
        5e-3,
        R
      ]);
      M.rotation.x = -Math.PI / 2;
    } else {
      for (let I = 0; I < 3; I++) {
        const M = e.mesh(T, "cone", w % 3 ? f.grassDark : f.leafLight, [
          0.035,
          0.3 + I * 0.09,
          0.035
        ], [
          C + (I - 1) * 0.16,
          0.15,
          R
        ]);
        M.rotation.z = (I - 1) * 0.35;
      }
      w % 11 === 0 && e.mesh(T, "rock", f.light, [
        0.12,
        0.13,
        0.12
      ], [
        C,
        0.38,
        R
      ]);
    }
  }
  for (const w of r.features) {
    const C = w.footprint, R = C.width > C.depth, A = Math.max(C.width, C.depth), T = w.kind === "wall" ? Math.ceil(A / 7) : 1, I = e.group(t);
    I.name = w.id;
    for (let M = 0; M < T; M++) {
      const O = -A / 2 + (M + 0.5) * A / T, N = T === 1 ? C : {
        ...C,
        x: C.x + (R ? O : 0),
        z: C.z + (R ? 0 : O),
        width: R ? A / T : C.width,
        depth: R ? C.depth : A / T
      }, F = T === 1 ? I : e.group(I);
      rd(e, u(N.x, N.z), F, {
        ...w,
        footprint: N
      }, r.vista === "interior") ? (a.push(e.bake(F)), s.push({
        root: F,
        bounds: new vn().setFromObject(F).expandByScalar(0.35)
      })) : F.removeFromParent();
    }
  }
  for (const w of r.vista === "room" ? [] : r.roads.slice(0, 1)) for (let C = 1; C < w.points.length; C++) {
    const [R, A] = w.points[C];
    if (!(r.vista === "camp" && Math.hypot(R, A - 8) < 13))
      for (const T of [-1, 1]) mo(e, u(R, A), R + T * (w.width / 2 + 0.6), A);
  }
  const S = e.group(t), E = r.vista === "interior" || r.vista === "room", L = r.vista === "snow" || r.vista === "furnace";
  if (e.mesh(S, "box", L ? "#93acbb" : E ? f.undercroft : f.distantGround, [
    300,
    8,
    300
  ], [
    0,
    L ? -25 : -4.65,
    0
  ]).castShadow = !1, L && ed(e, S, r), r.vista === "camp") for (let w = 0; w < 13; w++) {
    const C = -55 - w % 2 * 6, R = -44 + w * 7, A = 7 + w % 3 * 2;
    e.mesh(S, "box", f.distantWall, [
      10,
      A,
      6.5
    ], [
      C,
      A / 2,
      R
    ]);
    const T = e.mesh(S, "box", f.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      C,
      A,
      R
    ]);
    T.rotation.z = -0.16;
    for (let I = -1; I <= 1; I++) e.mesh(S, "box", w % 4 ? f.shadow : f.ember, [
      0.05,
      0.7,
      0.6
    ], [
      C + 5.03,
      A - 1.7,
      R + I * 1.6
    ], w % 4 === 0);
  }
  for (let w = 0; w < (E || L ? 0 : 12); w++) {
    const C = (w % 2 ? 1 : -1) * (_.width / 2 + 15 + w % 3 * 8), R = _.z - 25 + w * 7;
    e.mesh(S, "crown", w % 3 ? f.distantGround : f.distantLeaf, [
      17 + w % 4 * 3,
      6 + w % 3 * 2,
      22
    ], [
      C,
      -3,
      R
    ]);
  }
  for (let w = 0; w < (E || L || r.vista === "garden" ? 0 : 9); w++) {
    const C = (w - 4) * 12, R = _.z - _.depth / 2 - 15 - w % 3 * 6, A = 9 + w % 4 * 3;
    e.mesh(S, "box", f.distantWall, [
      9,
      A,
      9
    ], [
      C,
      A / 2 - 2,
      R
    ]), e.mesh(S, "cone", f.distantRoof, [
      7,
      6,
      7
    ], [
      C,
      A + 1,
      R
    ]);
    for (let T = -1; T <= 1; T++) e.mesh(S, "box", f.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      C + T * 2.2,
      A - 4,
      R + 4.55
    ]);
  }
  if (!E && !L && r.vista !== "garden") {
    const w = _.z - _.depth / 2 - 28;
    e.mesh(S, "cylinder", f.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      w
    ]);
    for (const C of [
      10,
      22,
      33
    ]) e.mesh(S, "cylinder", f.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      C,
      w
    ]);
    for (let C = 0; C < 6; C++) {
      const R = C * Math.PI / 3, A = -17 + Math.sin(R) * 8.8, T = w + Math.cos(R) * 8.8;
      e.mesh(S, "box", f.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        A,
        19,
        T
      ]);
      const I = e.mesh(S, "box", f.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(R) * 9.02,
        26,
        w + Math.cos(R) * 9.02
      ], !0);
      I.rotation.y = R;
    }
    e.mesh(S, "cylinder", f.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      w
    ]), e.mesh(S, "cone", f.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      w
    ]);
  }
  a.push(e.bake(S));
  for (const w of n.values()) a.push(e.bake(w));
  return {
    update(w, C) {
      i.direction.copy(l.set(Math.sin(C), Et.height / Et.distance, Math.cos(C)).normalize());
      for (const R of s) {
        o.length = 0;
        for (const A of [0.1, 1.6])
          if (i.origin.set(w.x, A, w.y), c.ray.copy(i), i.intersectsBox(R.bounds) && c.intersectObject(R.root, !0, o), o.length) break;
        R.root.visible = o.length === 0;
      }
    },
    dispose() {
      a.forEach((w) => w()), t.clear();
    }
  };
}
function ud(e, t, r, a, n, s) {
  const i = r.create(), l = i.root, c = {
    x: a,
    y: n
  };
  t.add(l), l.position.set(a, 0, n), l.rotation.y = 0.25;
  const o = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  let u = 0, h = -1 / 0, d = 0, p = -1;
  return {
    root: l,
    ring: o,
    id: "sanniang",
    position: c,
    seated: s,
    locate(m, x) {
      const b = Math.hypot(c.x - m.position.x, c.y - m.position.y);
      return b && (u += b, h = x), d = m.facing, c.x = m.position.x, c.y = m.position.y, l.position.set(c.x, 0, c.y), o.position.x = c.x, o.position.z = c.y, b > 0;
    },
    update(m, x, b) {
      const y = x - h < 120, _ = Math.hypot(m.x - c.x, m.y - c.y) < 10;
      o.visible = _;
      const S = y ? Math.PI / 2 - d : _ ? Math.atan2(m.x - c.x, m.y - c.y) : 0.25, E = Math.atan2(Math.sin(S - l.rotation.y), Math.cos(S - l.rotation.y)), L = p < 0 ? 0 : Math.min(0.12, (x - p) / 1e3);
      p = x, l.rotation.y += b ? E : E * (1 - Math.exp(-L * 9)), i.pose(x, u, y, b);
    },
    dispose() {
      i.dispose(), o.removeFromParent();
    }
  };
}
function hd(e, t, r, a, n, s, i, l = !0) {
  if (r === "sanniang") return ud(e, t, i, a, n, l);
  const c = Ga([...s], r), o = e.group(t, [
    a,
    0,
    n
  ]), u = e.group(t), h = r === "laobai", d = r === "kouzi";
  o.rotation.y = -0.35, l && (d || r === "anian") && (o.position.y = -0.3), o.scale.setScalar(h ? 1.24 : d ? 1.06 : r === "anian" ? 1.19 : 1.12);
  const p = h ? "#596a80" : d ? "#53617a" : "#79647d", m = "#615047", x = "#dfbaa0", b = h ? 0.39 : d ? 0.25 : 0.29, y = h ? 0.31 : 0.23, _ = [];
  for (const F of [-1, 1]) {
    const V = e.group(o, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    V.rotation.x = l && (d || r === "anian") ? -1.15 : F * 0.06, _.push(V), e.mesh(V, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(V, "cylinder", m, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(V, "sphere", m, [
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
    b,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(o, "cylinder", p, [
    y,
    0.34,
    0.21
  ], [
    0,
    0.92,
    0
  ]), e.mesh(o, "cylinder", m, [
    y + 0.015,
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
  ]), e.mesh(o, "cylinder", x, [
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
  S.rotation.x = -0.025, e.mesh(S, "sphere", x, [
    0.215,
    0.285,
    0.22
  ]);
  const E = d ? "#643d41" : r === "anian" ? "#483b40" : "#30343e";
  e.mesh(S, "sphere", E, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(S, "sphere", E, [
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
    ]), e.mesh(S, "box", E, [
      0.069,
      0.018,
      0.016
    ], [
      F * 0.086,
      0.093,
      0.219
    ]), e.mesh(S, "sphere", x, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(S, "sphere", x, [
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
    const V = e.group(o, [
      F * b,
      1.48,
      0
    ]);
    V.rotation.z = F * 0.11, V.rotation.x = F > 0 ? -0.4 : -0.1, e.mesh(V, "cylinder", p, [
      0.11,
      0.39,
      0.12
    ], [
      0,
      -0.17,
      0
    ]), e.mesh(V, "cylinder", "#80969d", [
      0.12,
      0.14,
      0.13
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(V, "cylinder", x, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(V, "sphere", x, [
      0.09,
      0.105,
      0.075
    ], [
      0,
      -0.65,
      0
    ]);
  }
  if (h) {
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
    ]), c && l) {
      o.position.y = 0.5;
      const F = e.mesh(u, "cylinder", "#849b95", [
        0.24,
        2.4,
        0.24
      ], [
        a,
        0.72,
        n
      ]);
      F.rotation.z = Math.PI / 2;
      for (const V of [-1, 1]) e.mesh(u, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + V * 0.8,
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
    ]), s.has("supplies_secured") && e.mesh(o, "cylinder", "#8caaa7", [
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
    ]), e.mesh(S, "sphere", E, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let V = 0; V < 3; V++) {
      const H = e.mesh(o, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + V * 0.02,
        1.02,
        0.31 + V * 0.023
      ]);
      H.rotation.z = V * 0.1;
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
    F.rotation.z = -0.55, e.mesh(o, "box", m, [
      0.42,
      0.44,
      0.21
    ], [
      0.21,
      0.91,
      -0.28
    ]);
  }
  const L = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  S.removeFromParent(), _.forEach((F) => F.removeFromParent());
  const w = _.map((F) => e.bake(F)), C = e.bake(o), R = e.bake(S), A = e.bake(u);
  o.add(S, ..._);
  const T = o.position.y, I = o.rotation.y, M = {
    x: a,
    y: n
  };
  let O = -1 / 0, N = 0;
  return {
    root: o,
    ring: L,
    id: r,
    position: M,
    seated: l,
    locate(F, V) {
      const H = M.x !== F.position.x || M.y !== F.position.y;
      return H && (O = V), N = F.facing, M.x = F.position.x, M.y = F.position.y, o.position.x = M.x, o.position.z = M.y, L.position.x = M.x, L.position.z = M.y, H;
    },
    update(F, V, H) {
      const te = V - O < 120, ne = Math.hypot(F.x - M.x, F.y - M.y) < 10;
      L.visible = ne;
      const Ie = te ? Math.PI / 2 - N : ne ? Math.atan2(F.x - M.x, F.y - M.y) : I, Ge = Math.atan2(Math.sin(Ie - o.rotation.y), Math.cos(Ie - o.rotation.y));
      o.rotation.y += H ? Ge : Ge * 0.16, o.position.y = T + (H ? 0 : Math.sin(V * 15e-4 + a) * 0.012), S.rotation.y = H ? 0 : Math.sin(V * 8e-4 + n) * 0.04, l || _.forEach((Be, Pe) => {
        Be.rotation.x = H || !te ? 0 : Math.sin(V * 0.012 + Pe * Math.PI) * 0.45;
      });
    },
    dispose() {
      C(), R(), A(), w.forEach((F) => F()), o.removeFromParent(), u.removeFromParent(), L.removeFromParent();
    }
  };
}
function fd(e, t, r, a) {
  const n = e.group(t), s = Object.values(Xe).find((h) => h.scene === r.id);
  let i = a, l = !1, c = [];
  const o = En(r.id).flatMap((h) => {
    const d = ft[h];
    return d.waves[0].filter((p, m) => !s || p.kind !== s.kind || m !== d.waves[0].findIndex((x) => x.kind === s.kind)).map((p) => {
      const m = zr(e, n, p.kind, In[0]);
      m.bar.removeFromParent();
      const x = r.anchors[p.anchor];
      return m.root.position.set(x.x, 0, x.y), {
        ...m,
        id: h,
        dispose: e.bake(m.root)
      };
    });
  }), u = () => {
    let h = !1;
    for (const d of o) {
      const p = !l && !wn(d.id, i, c);
      d.root.visible !== p && (d.root.visible = p, h = !0);
    }
    return h;
  };
  return u(), {
    setFacts(h) {
      i = h, u();
    },
    setProgress(h) {
      return c = h, u();
    },
    setEncounterActive(h) {
      l = h, u();
    },
    animate(h) {
      return !1;
    },
    dispose() {
      o.forEach((h) => h.dispose()), n.removeFromParent();
    }
  };
}
function pd(e, t, r, a) {
  const n = Xe[r], s = zr(e, t, n.kind, In[0]);
  s.bar.removeFromParent();
  const i = e.bake(s.root), l = { ..._n(r, a) };
  s.root.position.set(l.x, 0, l.y);
  let c = a;
  return {
    id: r,
    root: s.root,
    position: l,
    setFacts(o) {
      c = o;
    },
    update(o, u) {
      const h = _n(r, c), d = o.x - h.x, p = o.y - h.y, m = Math.hypot(d, p), x = m <= n.approachRadius, b = x && !c.has(n.complete) ? 1 : 0, y = h.x + (m ? d / m * b : 0), _ = h.y + (m ? p / m * b : 0), S = l.x + l.y + s.root.rotation.y;
      l.x += u ? y - l.x : (y - l.x) * 0.22, l.y += u ? _ - l.y : (_ - l.y) * 0.22, Math.abs(y - l.x) + Math.abs(_ - l.y) < 0.01 && (l.x = y, l.y = _);
      const E = x ? Math.atan2(d, p) : 0, L = Math.atan2(Math.sin(E - s.root.rotation.y), Math.cos(E - s.root.rotation.y));
      return s.root.rotation.y += u || Math.abs(L) < 5e-3 ? L : L * 0.2, s.root.position.set(l.x, 0, l.y), S !== l.x + l.y + s.root.rotation.y;
    },
    dispose() {
      i(), s.root.removeFromParent();
    }
  };
}
var J = (e, t, r, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: r,
  facing: a
}), bo = {
  furnace_terrace: [{
    id: "peisu-at-table",
    name: "掌炉官裴肃",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [J(0, -25, 0, 0)],
    condition: { none: ["furnace_approach_ready"] }
  }, {
    id: "terrace-attendant",
    name: "炉台侍者",
    activity: "keep",
    coat: "cream",
    phase: 0,
    route: [J(8, -13, 0)]
  }],
  furnace_quarter: [
    {
      id: "bathhouse-water",
      name: "澡堂伙计",
      activity: "water",
      coat: "blue",
      phase: 4,
      route: [
        J(-10, -8, 8),
        J(-9, 6, 0),
        J(-10, 17, 7),
        J(-9, 6, 0)
      ]
    },
    {
      id: "furnace-mender",
      name: "修衣的住户",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [J(13, 1, 0)]
    },
    {
      id: "furnace-delivery",
      name: "运料工",
      activity: "deliver",
      coat: "cream",
      phase: 9,
      route: [
        J(12, 21, 6),
        J(5, 16, 0),
        J(6, 0, 0),
        J(9, -15, 8),
        J(6, 0, 0),
        J(5, 16, 0)
      ]
    },
    {
      id: "furnace-handover-worker",
      name: "接管炉组的管工",
      activity: "warm",
      coat: "blue",
      phase: 0,
      route: [J(-6, -17, 0, Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    },
    {
      id: "furnace-handover-clerk",
      name: "登记住户的办事员",
      activity: "register",
      coat: "cream",
      phase: 2,
      route: [J(6, -17, 0, -Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    }
  ],
  furnace_antechamber: [{
    id: "furnace-orderly",
    name: "值房看护",
    activity: "dressings",
    coat: "cream",
    phase: 0,
    route: [J(11, -9, 0)]
  }],
  furnace_heart: [{
    id: "furnace-recovery-worker",
    name: "接手检修的管工",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [J(6, -32, 0)],
    condition: { all: ["furnace_stilled"] }
  }, {
    id: "furnace-recovery-carrier",
    name: "搬送晶座的工人",
    activity: "deliver",
    coat: "cream",
    phase: 5,
    route: [
      J(9, 20, 6),
      J(9, -13, 0),
      J(9, -28, 8),
      J(9, -13, 0)
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
      route: [J(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [J(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [J(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [J(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        J(-31, 18, 6, -Math.PI / 2),
        J(-27, 16, 0),
        J(-23, 13, 7, Math.PI),
        J(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        J(10, 7, 6),
        J(5, 10, 0),
        J(-8, 13, 0),
        J(-18, 14, 8, Math.PI),
        J(-8, 13, 0),
        J(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [J(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: se.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [J(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [J(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [J(8, 2, 0)]
  }],
  south_street: [
    {
      id: "tea-seller",
      name: "热水铺掌柜",
      activity: "cook",
      coat: "cream",
      phase: 0,
      route: [J(7, -17, 0, Math.PI / 2)]
    },
    {
      id: "tea-drinker",
      name: "歇脚的街坊",
      activity: "warm",
      coat: "blue",
      phase: 1,
      route: [J(-7, 19, 0)]
    },
    {
      id: "city-delivery",
      name: "送货的伙计",
      activity: "deliver",
      coat: "rose",
      phase: 6,
      route: [
        J(11, 23, 7),
        J(5, 17, 0),
        J(0, 7, 0),
        J(0, -5, 5),
        J(0, 7, 0),
        J(5, 17, 0)
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
      route: [J(18, -4, 0)]
    },
    {
      id: "lodging-mender",
      name: "补衣的寄工",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [J(17, 20, 0)]
    },
    {
      id: "workshop-water",
      name: "领水的寄工",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        J(-10, 19, 6, -Math.PI / 2),
        J(-4, 18, 0),
        J(8, 21, 0),
        J(14, 20, 7),
        J(8, 21, 0),
        J(-4, 18, 0)
      ]
    }
  ],
  workers_lodging: [{
    id: "old-mender",
    name: "补鞋的老寄工",
    activity: "mend",
    coat: "cream",
    phase: 0,
    route: [J(-7, 7, 0)]
  }]
}, md = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台",
  register: "核对名册"
}, gd = 0.85;
function ls(e, t) {
  const r = e.route;
  if (r.length === 1) return {
    position: r[0].position,
    facing: r[0].facing,
    walking: !1
  };
  const a = r.map((s, i) => {
    const l = r[(i + 1) % r.length].position;
    return s.wait + Math.hypot(l.x - s.position.x, l.y - s.position.y) / gd;
  });
  let n = (t + e.phase) % a.reduce((s, i) => s + i, 0);
  for (let s = 0; s < r.length; s++) {
    if (n > a[s]) {
      n -= a[s];
      continue;
    }
    const i = r[s], l = r[(s + 1) % r.length].position;
    if (n <= i.wait) return {
      position: i.position,
      facing: i.facing,
      walking: !1
    };
    const c = (n - i.wait) / (a[s] - i.wait);
    return {
      position: {
        x: i.position.x + (l.x - i.position.x) * c,
        y: i.position.y + (l.y - i.position.y) * c
      },
      facing: Math.atan2(l.x - i.position.x, l.y - i.position.y),
      walking: !0
    };
  }
  throw new Error("expedition_local_route_invalid");
}
function vd(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function yd(e, t) {
  e.updateWorldMatrix(!0, !0);
  const r = e.matrixWorld.clone().invert(), a = new gr(), n = [];
  e.traverse((l) => {
    if (!(l instanceof bt)) return;
    const c = (l.geometry.index ? l.geometry.toNonIndexed() : l.geometry.clone()).applyMatrix4(a.multiplyMatrices(r, l.matrixWorld)), o = l.material.color, u = new Xo(new Float32Array(c.getAttribute("position").count * 3), 3);
    for (let h = 0; h < u.count; h++) u.setXYZ(h, o.r, o.g, o.b);
    c.setAttribute("color", u), n.push(c);
  });
  const s = Ss(n);
  if (n.forEach((l) => l.dispose()), !s) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new bt(s, t);
  return i.receiveShadow = !0, e.add(i), () => {
    s.dispose(), e.clear();
  };
}
function wo(e, t, r, a) {
  const n = e.group(t), s = e.group(n), i = [], l = [], c = {
    blue: f.slate,
    rose: f.rose,
    cream: f.cloth
  }[r.coat], o = r.activity === "mend" || r.activity === "warm" || r.activity === "register", u = "#dfbda7", h = o ? 0.75 : 1.05;
  e.mesh(s, "box", c, [
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
  ]), e.mesh(s, "crown", f.timber, [
    0.245,
    0.17,
    0.225
  ], [
    0,
    h + 0.77,
    -0.02
  ]), e.mesh(s, "box", f.wood, [
    0.62,
    0.055,
    0.41
  ], [
    0,
    h - 0.23,
    0
  ]), e.mesh(s, "box", f.cloth, [
    0.26,
    0.35,
    0.04
  ], [
    0,
    h + 0.12,
    0.21
  ]);
  for (const p of [-1, 1]) {
    const m = e.group(n, [
      p * 0.36,
      h + 0.22,
      0
    ]);
    i.push(m), e.mesh(m, "box", c, [
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
    const x = e.group(n, [
      p * 0.16,
      h - 0.31,
      0
    ]);
    l.push(x), e.mesh(x, "box", f.timber, [
      0.2,
      o ? 0.3 : 0.59,
      0.22
    ], [
      0,
      o ? -0.12 : -0.26,
      o ? 0.2 : 0
    ]), e.mesh(x, "box", f.shadow, [
      0.22,
      0.16,
      0.34
    ], [
      0,
      o ? -0.34 : -0.56,
      0.07
    ]);
  }
  if (o && e.mesh(s, "box", f.wood, [
    0.62,
    0.55,
    0.6
  ], [
    0,
    0.275,
    -0.12
  ]), r.activity === "water") for (const p of [-1, 1]) e.mesh(i[p > 0 ? 1 : 0], "box", f.wood, [
    0.36,
    0.39,
    0.36
  ], [
    p * 0.13,
    -0.65,
    0
  ]);
  else r.activity === "deliver" ? (e.mesh(s, "box", f.wood, [
    0.65,
    0.47,
    0.5
  ], [
    0,
    h - 0.05,
    0.45
  ]), e.mesh(s, "box", f.light, [
    0.18,
    0.17,
    0.025
  ], [
    0,
    h - 0.05,
    0.72
  ])) : r.activity === "mend" || r.activity === "dressings" || r.activity === "register" ? (e.mesh(s, "box", f.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    h - 0.22,
    0.36
  ]), r.activity === "register" && e.mesh(s, "box", f.timber, [
    0.025,
    0.025,
    0.26
  ], [
    0.18,
    h - 0.17,
    0.38
  ])) : r.activity === "warm" && e.mesh(s, "box", f.pottery, [
    0.2,
    0.22,
    0.2
  ], [
    0,
    h + 0.1,
    0.38
  ]);
  n.traverse((p) => {
    p.castShadow = !1;
  });
  const d = [
    s,
    ...i,
    ...l
  ].map((p) => yd(p, a));
  return {
    root: n,
    body: s,
    arms: i,
    legs: l,
    dispose() {
      d.forEach((p) => p()), n.removeFromParent();
    }
  };
}
function bd(e, t, r) {
  const a = new br({
    vertexColors: !0,
    roughness: 0.95
  }), n = (bo[r] ?? []).map((c) => ({
    spec: c,
    model: wo(e, t, c, a),
    time: 0
  }));
  let s = null, i = null, l = /* @__PURE__ */ new Set();
  return {
    setFacts(c) {
      l = c;
    },
    animate(c, o, u, h) {
      const d = u ? 0 : vd(s, o);
      s = o;
      let p = n.length > 0 && i !== u;
      i = u;
      for (const m of n) {
        const { spec: x, model: b } = m, y = ls(x, m.time), _ = Nt(x.condition, l) && Math.hypot(y.position.x - c.x, y.position.y - c.y) < 27 && h(y.position);
        if (b.root.visible !== _ && (b.root.visible = _, p = !0), !_) continue;
        m.time += d;
        const S = ls(x, m.time), E = u ? 0 : Math.sin(m.time * (S.walking ? 5.5 : 1.5) + x.phase);
        b.root.position.set(S.position.x, 0, S.position.y), b.root.rotation.y = S.facing, b.body.position.y = S.walking ? Math.abs(E) * 0.035 : 0, b.legs.forEach((L, w) => {
          L.rotation.x = S.walking ? E * 0.35 * (w ? 1 : -1) : 0;
        }), b.arms.forEach((L, w) => {
          L.rotation.x = S.walking ? E * 0.24 * (w ? -1 : 1) : -0.6 + E * 0.13 * (w ? 1 : -1), x.activity === "deliver" && (L.rotation.x = -0.75), x.activity === "warm" && (L.rotation.x = -1.1), x.activity === "cook" && !w && (L.rotation.x = -0.8 + E * 0.3);
        }), p = d > 0 || p;
      }
      return p;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function wd(e, t, r) {
  const a = new br({
    vertexColors: !0,
    roughness: 0.9
  }), n = va.filter((s) => Ue[s].scene === r.id).map((s) => {
    const i = Ue[s], l = r.anchors[i.anchor], c = wo(e, t, {
      coat: i.coat,
      activity: s === "chenhe" ? "mend" : s === "chengtiesheng" ? "repair" : "keep"
    }, a);
    c.root.position.set(l.x, 0, l.y);
    const o = e.group(c.body);
    s === "chengtiesheng" ? (e.mesh(o, "box", f.brass, [
      0.14,
      0.35,
      0.08
    ], [
      0.25,
      0.7,
      0.27
    ]), e.mesh(o, "box", f.timber, [
      0.12,
      0.13,
      0.13
    ], [
      0.25,
      0.96,
      0.27
    ])) : s === "qinzhi" || s === "liangyoufang" ? e.mesh(o, "box", f.cloth, [
      0.37,
      0.04,
      0.29
    ], [
      0,
      0.96,
      0.36
    ]) : s === "wenshoutong" && (e.mesh(o, "box", f.slate, [
      0.56,
      0.45,
      0.36
    ], [
      0,
      0.62,
      0
    ]), e.mesh(o, "cylinder", f.pottery, [
      0.1,
      0.15,
      0.1
    ], [
      0.36,
      0.92,
      0.21
    ]));
    const u = e.bake(o), h = e.ring(c.root, f.brass, 0.72, 0, 0, 0.5, !0);
    let d = 0;
    return {
      id: s,
      root: c.root,
      position: l,
      update(p, m, x) {
        const b = p.x - l.x, y = p.y - l.y, _ = Math.hypot(b, y) < 6;
        h.visible = _;
        const S = _ ? Math.atan2(b, y) : Math.PI, E = Math.atan2(Math.sin(S - c.root.rotation.y), Math.cos(S - c.root.rotation.y)), L = Math.abs(E) > 5e-3;
        c.root.rotation.y += x || !L ? E : E * 0.22;
        const w = !x && Math.hypot(b, y) < 22;
        if (w || d !== 0) {
          d = w ? m : 0;
          const C = w ? Math.sin(m / 1e3 * 1.5) : 0;
          c.body.position.y = C * 0.014, c.arms.forEach((R, A) => {
            R.rotation.x = -0.35 + C * 0.045 * (A ? -1 : 1);
          });
        }
        return w || L;
      },
      dispose() {
        u(), c.dispose();
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
function xd(e, t, r, a) {
  const n = e.group(t), s = e.group(t), i = [], l = [];
  function c(o, u) {
    const h = a.has(o) ? 1 : 0;
    l.push({
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
    for (const h of [-0.7, 0.7]) e.mesh(u, "cylinder", f.timber, [
      0.055,
      1.8,
      0.055
    ], [
      h,
      0.9,
      0
    ]);
    e.mesh(u, "box", f.wood, [
      1.6,
      0.08,
      0.08
    ], [
      0,
      1.6,
      0
    ]);
    for (const [h, d] of [
      f.brass,
      f.rose,
      f.slate
    ].entries()) {
      const p = e.group(u, [
        (h - 1) * 0.65,
        1.6,
        0.1
      ]);
      p.rotation.z = h * 0.7;
      for (const m of [0, Math.PI / 2]) {
        const x = e.mesh(p, "box", d, [
          0.5,
          0.13,
          0.04
        ], [
          0,
          0,
          0
        ]);
        x.rotation.z = m;
      }
      e.mesh(p, "sphere", f.brass, [
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
    const o = r.id === "deep_waterway", u = r.id === "main_valve", h = r.anchors[o ? "winch" : u ? "valve" : "trial"], d = h.x + 2.8, p = h.y - 0.8, m = e.group(n, [
      d,
      0,
      p
    ]);
    e.mesh(m, "cylinder", f.slate, [
      0.22,
      1.3,
      0.22
    ], [
      0,
      0.65,
      0
    ]);
    const x = e.group(s, [
      d,
      1.2,
      p + 0.25
    ]);
    e.mesh(x, "torus", f.brass, [
      0.7,
      0.7,
      0.7
    ]);
    for (const y of [0, Math.PI / 2]) {
      const _ = e.mesh(x, "box", f.timber, [
        1.2,
        0.085,
        0.08
      ]);
      _.rotation.z = y;
    }
    i.push(e.bake(x));
    const b = o ? "deep_gate_opened" : u ? "heat_restored" : "return_flow_tested";
    if (c(b, (y) => {
      x.rotation.z = y * Math.PI * 1.3;
    }), !o) {
      e.mesh(m, "disc", f.light, [
        0.34,
        0.34,
        1
      ], [
        0,
        2.15,
        0.12
      ]);
      const y = e.group(s, [
        d,
        2.15,
        p + 0.14
      ]);
      e.mesh(y, "box", f.ember, [
        0.035,
        0.25,
        0.025
      ], [
        0,
        0.09,
        0
      ]), i.push(e.bake(y)), c(b, (_) => {
        y.rotation.z = 1.3 - _ * 1.8;
      });
    }
  }
  if (r.id === "deep_waterway") {
    const o = r.landscape.gates[0].footprint, u = e.group(s, [
      o.x,
      0,
      o.z
    ]);
    for (const h of [-1, 1]) e.mesh(n, "box", f.stone, [
      0.6,
      6.8,
      1.2
    ], [
      o.x + h * o.width / 2,
      3.4,
      o.z
    ]);
    e.mesh(n, "box", f.stone, [
      o.width + 0.6,
      0.6,
      1.2
    ], [
      o.x,
      6.5,
      o.z
    ]);
    for (let h = -o.width / 2 + 0.4; h < o.width / 2; h += 1) e.mesh(u, "box", f.slate, [
      0.12,
      4.4,
      0.16
    ], [
      h,
      2.2,
      0
    ]);
    for (const h of [0.3, 3.8]) e.mesh(u, "box", f.brass, [
      o.width,
      0.16,
      0.25
    ], [
      0,
      h,
      0
    ]);
    i.push(e.bake(u)), c("deep_gate_opened", (h) => {
      u.position.y = h * 4.5;
    });
  }
  return i.push(e.bake(n)), {
    get animating() {
      return l.some((o) => o.value !== o.target);
    },
    setFacts(o) {
      for (const u of l) {
        const h = o.has(u.fact) ? 1 : 0;
        h !== u.target && (u.from = u.value, u.target = h, u.born = null);
      }
    },
    animate(o, u) {
      let h = !1;
      for (const d of l) {
        if (d.value === d.target) continue;
        d.born ??= o;
        const p = u ? 1 : Math.min(1, (o - d.born) / 1100), m = p * p * (3 - 2 * p);
        d.value = p === 1 ? d.target : d.from + (d.target - d.from) * m, d.pose(d.value), h = !0;
      }
      return h;
    },
    dispose() {
      i.forEach((o) => o()), n.removeFromParent(), s.removeFromParent();
    }
  };
}
function _d(e, t, r) {
  const a = e.group(t);
  let n = "", s = null;
  const i = [
    "division_tested",
    "furnace_cargo_loaded",
    "division_works_started",
    "furnace_stilled",
    "city_rekindled"
  ];
  function l(c) {
    const o = i.map((u) => Number(c.has(u))).join("");
    if (o !== n) {
      if (n = o, s?.(), a.clear(), r.id === "furnace_heart") {
        const u = !c.has("furnace_stilled");
        for (const h of [-1, 1]) {
          const d = h * 23;
          e.mesh(a, "box", be.soot, [
            2.8,
            0.07,
            51
          ], [
            d,
            0.065,
            -5
          ]), e.mesh(a, "box", u ? be.ember : be.iron, [
            1.9,
            0.025,
            50
          ], [
            d,
            0.112,
            -5
          ], u);
          for (let p = -29; p < 21; p += 1.6) e.mesh(a, "box", be.iron, [
            2.8,
            0.1,
            0.55
          ], [
            d,
            0.19,
            p
          ]);
          for (const p of [-1, 1]) e.mesh(a, "box", be.copper, [
            0.12,
            0.1,
            51
          ], [
            d + p * 1.4,
            0.17,
            -5
          ]);
        }
        for (const h of [-3.2, 3.2]) e.mesh(a, "box", be.soot, [
          0.16,
          0.025,
          63
        ], [
          h,
          0.075,
          -3
        ]);
      }
      if (r.id === "old_kiln" || r.id === "furnace_heart") {
        const u = r.id === "old_kiln", h = r.anchors[u ? "trial" : "shutdown"], d = u ? c.has("division_tested") : !c.has("furnace_stilled"), p = e.group(a, [
          h.x + 2.1,
          1.2,
          h.y - 0.7
        ]);
        e.mesh(a, "box", be.iron, [
          1.8,
          1.1,
          0.8
        ], [
          h.x + 2.1,
          0.55,
          h.y - 0.9
        ]), e.mesh(p, "torus", be.copper, [
          0.65,
          0.65,
          0.24
        ]), p.rotation.z = d ? -0.7 : 0.7, e.mesh(p, "box", be.edge, [
          1.1,
          0.08,
          0.09
        ]), e.mesh(p, "box", be.edge, [
          0.08,
          1.1,
          0.09
        ]);
        const m = r.landscape.features.find((b) => b.kind === "kiln"), x = m.footprint;
        for (const b of [-1, 1]) e.mesh(a, "box", d ? be.ember : "#926c61", [
          x.width * 0.14,
          m.height * 0.3,
          0.06
        ], [
          x.x + b * x.width * 0.23,
          m.height * 0.58,
          x.z + x.depth * 0.465
        ], d);
        if (u && c.has("division_tested") && !c.has("furnace_cargo_loaded")) {
          const b = r.landscape.features.find((y) => y.id === "load-platform").footprint;
          e.mesh(a, "cylinder", be.iron, [
            1.4,
            1.8,
            1.4
          ], [
            b.x,
            2.2,
            b.z
          ]);
          for (const y of [-1, 1]) e.mesh(a, "box", be.copper, [
            0.08,
            2.3,
            3
          ], [
            b.x + y,
            2,
            b.z
          ]);
        }
      }
      if (r.id === "south_street" && c.has("division_works_started") && !c.has("city_rekindled")) for (let u = 0; u < 3; u++) e.mesh(a, "box", "#a48765", [
        1.2,
        0.8,
        0.8
      ], [
        11 + u * 1.4,
        0.4,
        25
      ]);
      if ((r.id === "camp" || r.id === "furnace_quarter") && c.has("city_rekindled")) {
        const u = r.anchors[r.id === "camp" ? "rest" : "charter"];
        for (const h of [-1, 1]) {
          const d = e.group(a, [
            u.x + h * 3,
            0,
            u.y - 2
          ]);
          e.mesh(d, "cylinder", be.iron, [
            0.7,
            1.5,
            0.7
          ], [
            0,
            0.75,
            0
          ]), e.mesh(d, "box", be.ember, [
            0.6,
            0.5,
            0.035
          ], [
            0,
            0.65,
            0.7
          ], !0), e.mesh(d, "cylinder", be.copper, [
            0.12,
            2.3,
            0.12
          ], [
            0.4,
            1.8,
            -0.1
          ]);
          for (let p = 0; p < 3; p++) e.mesh(d, "box", be.soot, [
            0.045,
            0.5,
            0.06
          ], [
            (p - 1) * 0.19,
            0.65,
            0.74
          ]);
        }
      }
      s = e.bake(a);
    }
  }
  return {
    setFacts: l,
    dispose() {
      s?.(), a.removeFromParent();
    }
  };
}
function Md(e, t, r, a, n) {
  const s = dd(e, t, r.landscape), i = e.group(t), l = e.group(t), c = fd(e, t, r, a), o = bd(e, l, r.id), u = wd(e, l, r), h = xd(e, t, r, a), d = _d(e, t, r), p = e.group(t);
  for (const C of qs(r.id)) {
    const R = e.group(p, [
      C.x,
      0.65,
      C.y
    ]);
    R.rotation.y = Math.PI / 2 - C.angle, e.mesh(R, "cylinder", f.brass, [
      0.4,
      1.2,
      0.4
    ], [
      0,
      0,
      -0.6
    ]).rotation.x = Math.PI / 2, e.mesh(R, "torus", f.timber, [
      0.42,
      0.42,
      0.14
    ], [
      0,
      0,
      0
    ]), e.mesh(R, "disc", f.shadow, [
      0.34,
      0.34,
      1
    ]);
  }
  const m = e.bake(p), x = r.objects.filter((C) => C.kind === "reward" || C.kind === "rest").map((C) => {
    const R = r.anchors[C.anchor], A = e.group(t, [
      R.x,
      0,
      R.y
    ]);
    if (C.kind === "reward") {
      e.mesh(A, "box", f.wood, [
        0.85,
        0.45,
        0.6
      ], [
        0,
        0.225,
        -0.65
      ]);
      for (const T of [-1, 1]) e.mesh(A, "box", f.brass, [
        0.055,
        0.48,
        0.63
      ], [
        T * 0.26,
        0.24,
        -0.65
      ]);
      e.mesh(A, "rock", f.ember, [
        0.15,
        0.3,
        0.15
      ], [
        0,
        0.68,
        -0.65
      ], !0), e.ring(A, f.brass, 0.65, 0, 0, 0.35, !0);
    } else {
      e.mesh(A, "box", f.wood, [
        1.4,
        0.12,
        0.6
      ], [
        0,
        0.5,
        -0.7
      ]);
      for (const T of [-1, 1]) e.mesh(A, "box", f.timber, [
        0.12,
        0.45,
        0.5
      ], [
        T * 0.5,
        0.22,
        -0.7
      ]);
    }
    return A.visible = !1, {
      id: C.id,
      model: A,
      dispose: e.bake(A)
    };
  }), b = [], y = Pn.filter((C) => Xe[C].scene === r.id).map((C) => pd(e, l, C, a));
  let _ = -1, S = -1, E = null, L = null;
  function w(C) {
    const R = [...C].sort().join("/");
    if (R === L) return;
    L = R, y.forEach((T) => T.setFacts(C)), E?.(), c.setFacts(C), o.setFacts(C), h.setFacts(C), d.setFacts(C);
    for (const T of Cn(r, C)) {
      const I = T.position;
      if (T.kind === "exit") {
        if (!T.target.doorway) for (const M of [-1, 1]) mo(e, i, I.x + M * 1.7, I.y, 1.5);
        e.mesh(i, "box", f.brass, [
          3,
          0.025,
          0.35
        ], [
          I.x,
          0.12,
          I.y
        ]).castShadow = !1;
      } else if (T.target.kind === "inspect" && T.target.passage === "warning")
        e.mesh(i, "box", f.timber, [
          0.12,
          1.8,
          0.12
        ], [
          I.x,
          0.9,
          I.y
        ]), e.mesh(i, "box", f.wood, [
          1.4,
          0.7,
          0.13
        ], [
          I.x,
          1.6,
          I.y
        ]), e.mesh(i, "box", f.light, [
          0.7,
          0.4,
          0.025
        ], [
          I.x,
          1.6,
          I.y + 0.08
        ]);
      else if (T.target.kind === "inspect" && T.target.passage === "orders") {
        e.mesh(i, "box", f.slate, [
          2.2,
          0.8,
          1.2
        ], [
          I.x,
          0.4,
          I.y - 0.8
        ]);
        const M = e.mesh(i, "box", f.light, [
          1.8,
          0.08,
          0.9
        ], [
          I.x,
          0.85,
          I.y - 0.8
        ]);
        M.rotation.x = 0.2;
        for (let O = -1; O <= 1; O++) e.mesh(i, "cylinder", f.brass, [
          0.12,
          0.12,
          0.12
        ], [
          I.x + O * 0.45,
          0.95,
          I.y - 0.55
        ]);
      }
    }
    if (r.id === "camp") {
      const T = r.landscape.features.find((I) => I.kind === "clinic").footprint;
      if (C.has("heat_restored")) {
        const I = r.landscape.features.find((M) => M.id === "hearth").footprint;
        e.mesh(i, "disc", f.ember, [
          1.2,
          1.2,
          1
        ], [
          I.x,
          0.2,
          I.z + 1.12
        ], !0).rotation.x = -Math.PI / 2;
        for (let M = 0; M < 3; M++) e.mesh(i, "crown", "#f0f5f6", [
          0.24 + M * 0.1,
          0.38,
          0.24
        ], [
          I.x + (M % 2 ? 0.17 : -0.1),
          2.2 + M * 0.5,
          I.z
        ], !0, 0.32 - M * 0.06);
        for (const M of [-1, 1])
          e.mesh(i, "cylinder", f.pottery, [
            0.32,
            0.38,
            0.32
          ], [
            T.x + M * 1.6,
            0.19,
            T.z + T.depth / 2 + 0.6
          ]), e.mesh(i, "disc", "#b5d8e6", [
            0.29,
            0.29,
            1
          ], [
            T.x + M * 1.6,
            0.39,
            T.z + T.depth / 2 + 0.6
          ], !0).rotation.x = -Math.PI / 2;
      }
      if (C.has("clinic_helped")) {
        const I = r.landscape.features.find((M) => M.kind === "bench").footprint;
        for (const M of [-1, 1])
          e.mesh(i, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            I.x,
            0.91,
            I.z + M * 0.65
          ]), e.mesh(i, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            I.x,
            1.024,
            I.z + M * 0.65
          ]);
      }
      if (C.has("receiving_arranged")) for (const I of [-1, 1]) {
        const M = T.x + I * 2.4, O = T.z + T.depth / 2 - 0.2, N = e.group(i, [
          M,
          0.2,
          O
        ]);
        N.rotation.x = -0.16;
        for (const F of [-1, 1]) e.mesh(N, "cylinder", f.timber, [
          0.055,
          2.9,
          0.055
        ], [
          F * 0.42,
          1.4,
          0
        ]);
        e.mesh(N, "box", C.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const F of [0.7, 2.1]) e.mesh(N, "box", f.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          F,
          0.12
        ]);
      }
      if (C.has("warden_defeated")) {
        const I = r.landscape.features.find((M) => M.kind === "wagon").footprint;
        for (let M = 0; M < 4; M++) {
          const O = e.group(i, [
            I.x + (M % 2 ? 0.65 : -0.65),
            1.4,
            I.z + (M < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(O, "box", f.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const N of [-1, 1]) e.mesh(O, "box", f.brass, [
            0.08,
            0.78,
            1.22
          ], [
            N * 0.35,
            0.38,
            0
          ]);
          e.mesh(O, "box", f.light, [
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
    for (const T of r.objects) {
      if (T.kind !== "switch") continue;
      const I = r.anchors[T.anchor], M = C.has(T.fact), O = e.group(i, [
        I.x,
        0,
        I.y
      ]);
      e.mesh(O, "box", f.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(O, "box", f.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const N = e.group(O, [
        0,
        0.75,
        0
      ]);
      N.rotation.z = M ? 0.65 : -0.65, e.mesh(N, "cylinder", f.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(N, "cylinder", f.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const A = Tt(r, C);
    for (const T of r.landscape.gates) {
      if (r.id === "deep_waterway" && T.id === "deep_gate") continue;
      const I = T.footprint, M = I.width > I.depth, O = Math.max(I.width, I.depth), N = e.group(i, [
        I.x,
        0,
        I.z
      ]);
      M || (N.rotation.y = Math.PI / 2);
      for (const F of [-1, 1]) e.mesh(N, "box", f.stone, [
        0.35,
        3.2,
        0.7
      ], [
        F * O / 2,
        1.6,
        0
      ]);
      if (e.mesh(N, "box", f.light, [
        O + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), A.closedGates.has(T.id)) {
        for (let F = -O / 2 + 0.2; F < O / 2; F += 0.4) e.mesh(N, "box", f.shadow, [
          0.065,
          3,
          0.1
        ], [
          F,
          1.5,
          0
        ]);
        for (const F of [0.4, 2.5]) e.mesh(N, "box", f.brass, [
          O,
          0.12,
          0.15
        ], [
          0,
          F,
          0
        ]);
      } else e.mesh(N, "box", f.shadow, [
        O,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const T of r.landscape.features) {
      if (T.kind !== "beacon" || C.has("alarm_silenced")) continue;
      const I = T.footprint, M = e.mesh(i, "cylinder", f.timber, [
        0.045,
        4.8,
        0.045
      ], [
        I.x + 3.3,
        2.7,
        I.z + 2.5
      ]);
      M.rotation.z = -0.32;
      for (let O = 0; O < 5; O++) e.mesh(i, "rock", O % 2 ? f.ember : f.cloth, [
        0.55,
        1.2 + O % 3 * 0.3,
        0.55
      ], [
        I.x + Math.sin(O * 2) * 0.7,
        5.4 + O % 3 * 0.3,
        I.z + Math.cos(O * 2) * 0.7
      ], !0);
    }
    E = e.bake(i);
  }
  return w(a), {
    setFacts: w,
    people: b,
    parleyPeople: y,
    storyPeople: u.people,
    get animating() {
      return h.animating;
    },
    setProgress(C, R) {
      let A = c.setProgress(C);
      for (const T of x) {
        const I = R.has(T.id);
        T.model.visible !== I && (T.model.visible = I, A = !0);
      }
      return A;
    },
    setPeople(C, R) {
      let A = !1;
      for (const T of _t) {
        const I = C[T], M = Va[T].station, O = Se[M.scene].anchors[M.anchor], N = I.mode === "idle" && (I.scene === "cells" || I.scene === M.scene && Math.hypot(I.position.x - O.x, I.position.y - O.y) < 1);
        let F = b.find((V) => V.id === T);
        F && (I.scene !== r.id || F.seated !== N) && (F.dispose(), b.splice(b.indexOf(F), 1), F = void 0, A = !0), I.scene === r.id && (F || (F = hd(e, l, T, I.position.x, I.position.y, new Set(L?.split("/")), n, N), b.push(F), A = !0), A = F.locate(I, R) || A);
      }
      return A;
    },
    setEncounterActive(C) {
      c.setEncounterActive(C), y.forEach((R) => {
        R.root.visible = !C;
      });
    },
    update: s.update,
    animate(C, R, A, T) {
      let I = !1;
      const M = Math.floor(R / (1e3 / 30));
      if (M !== S) {
        S = M;
        const N = b.find((F) => F.id === "sanniang");
        N && Math.hypot(N.position.x - C.x, N.position.y - C.y) < 22 && T(N.position) ? (N.update(C, R, A), I = !A) : N && (N.ring.visible = !1);
      }
      const O = Math.floor(R / 80);
      if (O === _) return I;
      _ = O, I = h.animate(R, A) || I, I = c.animate(A) || I, I = o.animate(C, R, A, T) || I;
      for (const N of y) I = N.update(C, A) || I;
      for (const N of u.people) I = N.update(C, R, A) || I;
      for (const N of b)
        N.id !== "sanniang" && (Math.hypot(N.position.x - C.x, N.position.y - C.y) < 22 ? (N.update(C, R, A), I = !A || I) : N.ring.visible = !1);
      return I;
    },
    dispose() {
      d.dispose(), h.dispose(), m(), p.removeFromParent(), x.forEach((C) => {
        C.dispose(), C.model.removeFromParent();
      }), o.dispose(), u.dispose(), b.splice(0).forEach((C) => C.dispose()), y.forEach((C) => C.dispose()), l.removeFromParent(), E?.(), c.dispose(), s.dispose();
    }
  };
}
var kd = "" + new URL("ember-assets/texture-stone-VVv9Pl_s.webp", import.meta.url).href, Sd = "" + new URL("ember-assets/texture-plaster-Cljz23wF.webp", import.meta.url).href, Rd = "" + new URL("ember-assets/texture-slate-BGr9mHj3.webp", import.meta.url).href, Cd = "" + new URL("ember-assets/texture-ground-DGpe7Gdj.webp", import.meta.url).href;
function Ed(e, t) {
  const r = new ei(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  let i = 0, l = !1;
  function c(o, u) {
    i++;
    const h = r.load(o, (d) => {
      if (l) {
        d.dispose();
        return;
      }
      i--, s.delete(o);
      for (const p of u) a.set(p, d);
      e(), t(s.size, i);
    }, void 0, () => {
      l || (i--, n.delete(h), h.dispose(), s.set(o, u), t(s.size, i));
    });
    h.colorSpace = vr, h.wrapS = h.wrapT = Uo, h.anisotropy = 2, n.add(h);
  }
  for (const [o, u] of [
    [kd, [
      f.stone,
      f.wetStone,
      f.marble,
      f.marbleLight
    ]],
    [Sd, [f.light]],
    [Rd, [f.roof, f.roofLight]],
    [Cd, [
      f.grass,
      f.grassLight,
      f.grassDark
    ]]
  ]) c(o, u);
  return {
    maps: a,
    retry() {
      if (!l && i === 0) {
        for (const [o, u] of s) c(o, u);
        t(s.size, i);
      }
    },
    dispose() {
      l = !0, n.forEach((o) => o.dispose()), n.clear(), a.clear(), s.clear();
    }
  };
}
var cs = "" + new URL("ember-assets/sanniang-BUuYV_OG.glb", import.meta.url).href;
function ds(e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  e.scene.traverse((s) => {
    if (s instanceof bt) {
      t.add(s.geometry);
      for (const i of Array.isArray(s.material) ? s.material : [s.material]) {
        r.add(i);
        for (const l of Object.values(i)) l instanceof Zo && a.add(l);
      }
      s instanceof _s && n.add(s.skeleton);
    }
  }), t.forEach((s) => s.dispose()), r.forEach((s) => s.dispose()), n.forEach((s) => s.dispose()), a.forEach((s) => {
    s.dispose(), s.source.data?.close?.();
  });
}
async function Pd(e) {
  const t = await fetch(cs, { signal: e });
  if (!t.ok) throw new Error(`expedition_character_load:${t.status}`);
  const r = await t.arrayBuffer();
  e.throwIfAborted();
  const a = await new vi().parseAsync(r, new URL(".", new URL(cs, location.href)).href), n = a.animations.find((o) => o.name === "idle"), s = a.animations.find((o) => o.name === "walk"), i = a.scene.getObjectByName("Sanniang")?.userData.stride;
  try {
    if (e.throwIfAborted(), !n || !s || typeof i != "number" || i <= 0) throw new Error("expedition_character_motion_missing");
  } catch (o) {
    throw ds(a), o;
  }
  const l = 1.48, c = i * l;
  return {
    create() {
      const o = new Aa(), u = yi(a.scene);
      o.add(u), u.scale.setScalar(l);
      const h = [], d = new xt(), p = new gr(), m = /* @__PURE__ */ new Set();
      o.updateMatrixWorld(!0), u.traverse((w) => {
        if (!(w instanceof bt)) return;
        w.castShadow = w.receiveShadow = !0, w.frustumCulled = !1;
        const C = [];
        for (let R = 0; R < w.geometry.getAttribute("position").count; R++)
          w.getVertexPosition(R, d).applyMatrix4(w.matrixWorld), d.y < 0.09 * l && C.push(R);
        C.length && h.push({
          mesh: w,
          indices: C
        }), w instanceof _s && m.add(w.skeleton);
      });
      const x = new Yo(u), b = x.clipAction(n), y = x.clipAction(s);
      b.play(), y.play(), y.enabled = !1;
      let _ = !1, S = -1, E = 0, L = 0;
      return {
        root: o,
        pose(w, C, R, A) {
          const T = S < 0 ? 0 : Math.min(0.12, Math.max(0, (w - S) / 1e3));
          S = w;
          const I = Math.max(0, C - E);
          if (E = C, R !== _) {
            _ = R;
            const O = _ ? y : b, N = _ ? b : y;
            O.reset().play(), N.crossFadeTo(O, 0.18, !1);
          }
          if (R && (L = (L + Math.min(I / c, T * 1.8)) % 1), y.timeScale = 0, _ && (y.time = A ? 0 : L * s.duration), A) {
            const O = _ ? y : b;
            (_ ? b : y).stop(), O.stopFading().setEffectiveWeight(1), O.time = 0;
          }
          x.update(A ? 0 : T), u.position.y = 0, o.updateMatrixWorld(!0), p.copy(o.matrixWorld).invert();
          let M = 1 / 0;
          for (const { mesh: O, indices: N } of h) for (const F of N)
            O.getVertexPosition(F, d).applyMatrix4(O.matrixWorld).applyMatrix4(p), M = Math.min(M, d.y);
          u.position.y = -M;
        },
        dispose() {
          x.stopAllAction(), x.uncacheRoot(u), m.forEach((w) => w.dispose()), o.removeFromParent();
        }
      };
    },
    dispose() {
      ds(a);
    }
  };
}
function Ad(e, t, r) {
  const a = new Ms({
    antialias: !0,
    alpha: !1,
    powerPreference: r.world ? "default" : "high-performance"
  });
  a.outputColorSpace = vr, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, r.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const s = new xs(), i = new ks(-10, 10, 10, -10, 0.1, 180), l = ir();
  s.add(new ws("#effbff", "#74918a", 2));
  const c = new Qn("#fff4e5", 1.9);
  c.position.set(-12, 25, 13), c.castShadow = !0;
  const o = r.world ? 1024 : 1536;
  c.shadow.mapSize.set(o, o), Object.assign(c.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), c.shadow.bias = -4e-4, c.shadow.normalBias = 0.035, c.shadow.radius = 3, s.add(c);
  const u = new Qn("#c3edff", 1.1);
  u.position.set(7, 8, -15), s.add(u);
  const h = new Aa(), d = new Aa(), p = new Aa();
  s.add(h, d, p);
  const m = po(l, d, r.traveler.gender), x = Bc(l, p), b = Fc(l, p), y = qc(n), _ = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), E = [], L = matchMedia("(prefers-reduced-motion: reduce)"), w = matchMedia("(max-height:450px) and (min-width:600px)"), C = new xt(), R = new xt();
  let A = null, T = "", I = "", M = "", O = null, N = null, F = null, V = !1, H = NaN, te = NaN, ne = NaN, Ie = null, Ge = 0, Be = 0, Pe = 1, xe = 1, lt = !0, pt = !1, kt = !1, ta = 0, Zt = -1, ve = 0, _e = !1;
  const St = r.world ? Ed(() => {
    T = "", lt = !0, r.invalidate?.();
  }, (fe, ct) => r.artworkStatus?.(fe, ct)) : null, en = new AbortController();
  let Je = null;
  r.world && Pd(en.signal).then((fe) => {
    if (pt) {
      fe.dispose();
      return;
    }
    Je = fe, lt = !0, r.invalidate?.();
  }).catch((fe) => {
    pt || (kt = !0, t(fe));
  });
  function Bt() {
    const fe = e.getBoundingClientRect();
    Pe = Math.max(1, fe.width), xe = Math.max(1, fe.height), a.setSize(Pe, xe, !1), lt = !0, _e = !1, r.invalidate?.();
  }
  const Na = new ResizeObserver(Bt);
  Na.observe(e), Bt();
  function Rt(fe) {
    fe.preventDefault(), kt = !0, t(/* @__PURE__ */ new Error("expedition_webgl_context_lost"));
  }
  a.domElement.addEventListener("webglcontextlost", Rt);
  function qt(fe, ct, dt, ot, Ye = !1) {
    if (Math.abs(fe) < 1) return;
    const q = document.createElement("span");
    q.className = Ye ? "exp-damage is-player" : fe < 0 ? "exp-damage is-heal" : "exp-damage", q.textContent = `${fe < 0 ? "+" : ""}${Math.ceil(Math.abs(fe))}`, n.append(q), E.push({
      element: q,
      position: new xt(ct, 2, dt),
      born: ot
    });
  }
  function tn() {
    for (const fe of _.values())
      d.remove(fe.actor.root), fe.marker.remove();
    _.clear(), E.splice(0).forEach((fe) => fe.element.remove());
  }
  function Lt(fe) {
    return _e ? (R.set(fe.x, 1, fe.y).project(i), Math.abs(R.x) < 1.15 && Math.abs(R.y) < 1.15) : !0;
  }
  return {
    draw(fe, ct, dt, ot = "battle", Ye = 0, q) {
      if (pt || kt || r.world && !Je) return;
      const Ot = performance.now(), ae = ot === "battle" ? fe : null, Ua = ae?.tick ?? (L.matches ? 0 : Ye * 0.025), ya = (ae?.tick ?? -1) !== Zt, aa = `${ct.weapon}/${ct.outfit}/${dt}`;
      if (!q && !lt && ot === I && aa === M && ae === O && (!ya && ae || !ae && (ot === "between" || L.matches || Ye - ta < 40))) return;
      ta = Ye;
      const Fa = In[dt], an = q ? q.definition.id : `${dt}:${ae?.boss ?? !1}:${!!ae}`;
      if (an !== T) {
        if (m.resetMotion(), S.forEach((X) => X.remove()), S.clear(), A?.(), q) {
          const X = ir(St?.maps);
          N = Md(X, h, q.definition, q.facts, Je);
          const re = N;
          A = () => {
            re.dispose(), X.dispose();
          };
        } else
          N = null, A = Lc(l, h, dt, ae);
        _e = !1, T = an, s.background = new yr(Fa.sky), s.fog = new qo(Fa.haze, 42, 95);
      } else q && Ie !== q.facts && N?.setFacts(q.facts);
      (!!ae != !!O || ae && O && ae.tick < Zt) && (m.resetMotion(), tn(), ve = ae?.player.hp ?? 0);
      const Da = !q && ot !== "battle", mt = Pe < 600, nn = mt || xe < 400, na = Pe / xe;
      !!q?.reading !== V && (V = !!q?.reading, _e = !1);
      const ba = q?.definition.landscape.vista === "room", gt = ba ? mt ? 20 : Math.max(30, na * (xe < 400 ? 19 : 25)) : q ? (mt ? Et.mobileWidth : Math.max(Et.minimumWidth, na * (xe < 400 ? Et.shortSpan : Et.tallSpan))) * (q.definition.safe && !ae ? Et.settlementScale : 1) : Da ? mt ? 13 : 28 : mt ? 18.5 : Math.max(27, na * (xe < 400 ? 14 : 23)), Za = Math.max(0, K.arena - gt / 2 + 0.5), Ct = Da ? 0 : 1 * Math.PI / 4, rn = V && !w.matches ? gt / na * 0.22 : 0, wa = V && w.matches ? gt * 0.23 : 0, xa = (q ? q.location.position.x * (ba ? 0.4 : 1) : ae ? nn ? ae.player.x * 0.62 : Math.max(-Za, Math.min(Za, ae.player.x * 0.62)) : mt ? 0 : 5.5) + Math.sin(Ct) * rn + Math.cos(Ct) * wa, ra = (q ? ba ? q.location.position.y * 0.4 - 1 : q.location.position.y - Et.lead : ae ? ae.player.y * (nn ? 0.62 : 0.2) - 0.4 : mt ? -4.2 : -11.8) + Math.cos(Ct) * rn - Math.sin(Ct) * wa;
      q && Math.hypot(H - q.location.position.x, te - q.location.position.y) > 8 && (_e = !1);
      const sn = Math.abs(C.x - xa) + Math.abs(C.z - ra) < 0.015, Tn = q && N?.setPeople(q.people, Ye), sa = q && N?.setProgress(q.completedSegments, q.objects), Ln = q && N?.animate(q.location.position, Ye, L.matches, Lt);
      if (q && !lt && _e && sn && aa === M && ae === O && !ya && H === q.location.position.x && te === q.location.position.y && ne === q.location.facing && Ie === q.facts && !Ln && !Tn && !sa && !m.animating) return;
      !_e || L.matches ? (C.set(xa, 0, ra), _e = !0) : (C.x += (xa - C.x) * 0.14, C.z += (ra - C.z) * 0.14), i.left = -gt / 2, i.right = gt / 2, i.top = gt / na / 2, i.bottom = -i.top;
      const _a = q ? Et.distance : 25;
      if (i.position.set(C.x + Math.sin(Ct) * _a, q ? Et.height : 28, C.z + Math.cos(Ct) * _a), i.lookAt(C.x, 0, C.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), q && (N?.setEncounterActive(!!ae), N?.update(q.location.position, Ct)), S.forEach((X) => {
        X.hidden = !0;
      }), q && !ae) for (const X of q.definition.objects) {
        if (X.kind !== "reward" || !q.objects.has(X.id)) continue;
        const re = `reward/${X.id}`, Te = q.definition.anchors[X.anchor];
        let $e = S.get(re);
        $e || ($e = document.createElement("span"), $e.className = "exp-person-name", $e.textContent = `◇ ${ut.cache}`, n.append($e), S.set(re, $e)), R.set(Te.x, 1.4, Te.y).project(i);
        const oa = Math.max(65, Math.min(Pe - 65, (R.x * 0.5 + 0.5) * Pe)), Ma = Math.max(105, Math.min(xe - 145, (-R.y * 0.5 + 0.5) * xe));
        $e.hidden = !1, $e.style.transform = `translate(${oa}px,${Ma}px) translate(-50%,-100%)`;
      }
      const et = new Set(q && !ae ? [
        ...An(q.definition, q.location.position, q.facts, q.people),
        ...Ja(q.definition.id, q.location.position, q.facts),
        ...La(q.definition, q.location, q.facts).filter((X) => X.kind === "object" && X.target.kind === "resident")
      ].map((X) => X.target.id) : []);
      for (const X of [
        ...N?.people ?? [],
        ...N?.parleyPeople ?? [],
        ...N?.storyPeople ?? []
      ]) {
        if (ae || !q || Math.hypot(X.position.x - q.location.position.x, X.position.y - q.location.position.y) > 10) continue;
        let re = S.get(X.id);
        re || (re = document.createElement("span"), re.className = "exp-person-name", re.textContent = Ze(X.id), n.append(re), S.set(X.id, re)), re.textContent = et.has(X.id) ? `${Ze(X.id)} · ${se.actions.talk}` : Ze(X.id), R.set(X.position.x, 2.9 + X.root.position.y, X.position.y).project(i);
        const Te = (R.x * 0.5 + 0.5) * Pe, $e = (-R.y * 0.5 + 0.5) * xe;
        re.hidden = Te < 30 || Te > Pe - 30 || $e < 20 || $e > xe - 20, re.style.transform = `translate(${Te}px,${$e}px) translate(-50%,-100%)`;
      }
      r.world && (c.position.set(C.x - 12, 25, C.z + 13), c.target.position.set(C.x, 0, C.z), c.target.updateMatrixWorld());
      const On = q ? {
        ...q.location.position,
        facing: q.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      m.update(ae?.player ?? On, ct.weapon, ct.outfit, Ua, Ye / 1e3, L.matches, Da, !!ae?.effects.some((X) => X.kind === "resonance"));
      for (const X of ae?.enemies ?? []) {
        let re = _.get(X.id);
        if (!re) {
          const Z = document.createElement("i");
          Z.className = ze(X.kind) ? "exp-threat is-boss" : "exp-threat", n.append(Z), re = {
            actor: zr(l, d, X.kind, Fa),
            hp: X.hp,
            death: null,
            marker: Z
          }, _.set(X.id, re);
        }
        re.hp > X.hp && ya && qt(re.hp - X.hp, X.x, X.y, ae.tick), re.hp = X.hp, re.actor.update(X, ae.tick, L.matches, !!q), re.actor.bar.quaternion.copy(i.quaternion), R.set(X.x, 1.2, X.y).project(i);
        const Te = (R.x * 0.5 + 0.5) * Pe, $e = (-R.y * 0.5 + 0.5) * xe, oa = Math.min(18, Pe / 2), Ma = Math.min(mt ? 132 : 95, xe * 0.3), jn = Math.max(Ma, xe - Math.min(130, xe * 0.3)), Ba = Math.max(oa, Math.min(Pe - oa, Te)), D = Math.max(Ma, Math.min(jn, $e));
        re.marker.hidden = Math.abs(Te - Ba) + Math.abs($e - D) < 10, re.marker.style.transform = `translate(${Ba}px,${D}px) rotate(${Math.atan2($e - D, Te - Ba) + Math.PI / 2}rad)`;
      }
      for (const [X, re] of _) {
        if (ae?.enemies.some(($e) => $e.id === X)) continue;
        re.death === null && (re.death = ae?.tick ?? 0, ae && re.hp > 0 && qt(re.hp, re.actor.root.position.x, re.actor.root.position.z, ae.tick));
        const Te = ((ae?.tick ?? 0) - re.death) / 12;
        re.actor.bar.visible = !1, re.marker.hidden = !0, re.actor.root.scale.setScalar(Math.max(0, 1 - Te)), (Te >= 1 || !ae || L.matches) && (d.remove(re.actor.root), re.marker.remove(), _.delete(X));
      }
      ae && ya && (ve !== ae.player.hp && qt(ve - ae.player.hp, ae.player.x, ae.player.y, ae.tick, ve > ae.player.hp), ve = ae.player.hp);
      const Qe = q && (q.engagement ?? Hs(q.definition.id, q.facts, q.completedSegments));
      x.update(ae, L.matches, Qe ? ft[Qe].bounds : void 0);
      const on = ae?.effects.filter((X) => X.kind === "ward-hit").at(-1);
      b.update(ae?.player ?? null, on ? Math.max(0, (on.life - 5) / 10) : 0), y.update(ae, i, Pe, xe);
      for (let X = E.length - 1; X >= 0; X--) {
        const re = E[X], Te = ((ae?.tick ?? 0) - re.born) / 27;
        if (Te >= 1 || !ae) {
          re.element.remove(), E.splice(X, 1);
          continue;
        }
        R.copy(re.position), R.y += L.matches ? 0 : Te * 0.9, R.project(i), re.element.style.transform = `translate(${(R.x * 0.5 + 0.5) * Pe}px,${(-R.y * 0.5 + 0.5) * xe}px)`, re.element.style.opacity = String(Math.min(1, (1 - Te) * 3));
      }
      a.render(s, i), Ge++, Be += performance.now() - Ot, q && F !== q.definition.id && (F = q.definition.id, r.sceneReady?.(F)), lt = !1, I = ot, M = aa, O = ae, Zt = ae?.tick ?? -1, q && (H = q.location.position.x, te = q.location.position.y, ne = q.location.facing, Ie = q.facts);
    },
    invalidate() {
      lt = !0, r.invalidate?.();
    },
    ready() {
      return !pt && !kt && (!r.world || !!Je);
    },
    needsFrame() {
      return N?.animating ?? !1;
    },
    retryArtwork() {
      St?.retry();
    },
    stats() {
      return {
        draws: Ge,
        submitMs: Be,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      pt = !0, Na.disconnect(), a.domElement.removeEventListener("webglcontextlost", Rt), en.abort(), tn(), m.dispose(), y.dispose(), b.dispose(), A?.(), Je?.dispose(), St?.dispose(), c.shadow.dispose(), l.dispose(), s.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function dr(e) {
  if (e.kind === "exit") return `${se.actions.travel} ${se.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${se.actions.talk} · ${se.people[t.person]}`;
    case "enemy":
      return `${se.actions.talk} · ${Ze(t.enemy)}`;
    case "resident":
      return `${se.actions.talk} · ${Ze(t.person)}`;
    case "inspect":
      return se.passages[t.passage].title;
    case "rest":
      return se.actions.rest;
    case "reward":
      return ut.cache;
    case "switch":
      return se.switches[t.fact];
  }
}
var ur = (e) => e.kind === "object" && e.target.kind === "inspect" ? xr(e.target.passage) : null, zd = (e, t) => e.position.x === t.position.x && e.position.y === t.position.y;
function Id(e, t) {
  const r = (n) => {
    const s = ur(n);
    return s !== null && !t.has(s.fact);
  }, a = /* @__PURE__ */ new Map();
  for (const n of e) {
    const s = `${n.position.x}/${n.position.y}`, i = a.get(s) ?? [];
    i.push(n), a.set(s, i);
  }
  for (const n of a.values()) n.sort((s, i) => Number(r(i)) - Number(r(s)));
  return e.map((n) => a.get(`${n.position.x}/${n.position.y}`).shift());
}
function $d(e, t, r, a) {
  const n = e.find((i) => i.target.id === t);
  if (!n) return e[0]?.target.id ?? null;
  const s = ur(n);
  if (s && a && !a.has(s.fact) && r.has(s.fact)) {
    const i = e.find((l) => {
      const c = ur(l);
      return zd(n, l) && c && !r.has(c.fact);
    });
    if (i) return i.target.id;
  }
  return t;
}
var Td = ["aria-label"], Ld = {
  key: 0,
  class: "ember-transition",
  role: "status"
}, Od = { class: "journey-hud" }, jd = { class: "journey-heading" }, Nd = { class: "journey-threat" }, Ud = {
  key: 1,
  class: "journey-artwork-issue",
  role: "status"
}, Fd = ["disabled"], Dd = {
  key: 2,
  class: "journey-controls"
}, Zd = ["aria-label"], Bd = {
  key: 0,
  class: "journey-interaction"
}, qd = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Wd = {
  key: 0,
  class: "journey-resource"
}, Hd = [
  "max",
  "value",
  "aria-label"
], Vd = ["disabled"], Gd = ["disabled"], Yd = {
  key: 3,
  class: "journey-overlay"
}, Qd = /* @__PURE__ */ Fe({
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
    const a = e, n = r, s = W(null), i = W(null), l = W({
      x: 0,
      y: 0
    }), c = W(null), o = W({
      failed: 0,
      pending: 0
    }), u = W(!0), h = G(() => a.battle ? [] : Id([
      ...Ja(a.world.definition.id, a.world.location.position, a.world.facts),
      ...La(a.world.definition, a.world.location, a.world.facts).filter((H) => H.kind === "exit" || a.world.objects.has(H.target.id)),
      ...An(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ], a.world.facts)), d = G(() => h.value.find((H) => H.target.id === c.value) ?? null), p = G(() => a.weapon === "grimoire" ? oe.contractPower : oe.resource);
    let m = null, x = null, b = 0, y = 0, _ = 0, S = !1, E = !0;
    const L = Tc((H, te) => {
      l.value = {
        x: H * 26,
        y: te * 26
      }, x?.stick(H, te);
    }, () => s.value?.focus({ preventScroll: !0 }));
    function w() {
      L.clear(), x?.clear(), _ = 0;
    }
    function C() {
      w(), n("pause");
    }
    function R() {
      m?.retryArtwork();
    }
    function A() {
      document.hidden ? (cancelAnimationFrame(b), b = 0, C()) : (m?.invalidate(), T());
    }
    function T() {
      !b && !S && E && (y = 0, b = requestAnimationFrame(V));
    }
    function I() {
      !a.paused && d.value && (w(), n("interact", d.value.target.id));
    }
    function M(H) {
      (!H || H.detail === 0) && x?.dash();
    }
    function O(H) {
      (!H || H.detail === 0) && x?.skill();
    }
    function N(H, te) {
      H.button === 0 && x?.[te]();
    }
    function F() {
      const H = h.value.findIndex((te) => te.target.id === c.value);
      c.value = h.value[(H + 1) % h.value.length]?.target.id ?? null;
    }
    function V(H) {
      if (b = 0, S || !E) return;
      !a.paused && !document.hidden && (b = requestAnimationFrame(V));
      const te = y ? Math.min(100, H - y) : 0;
      if (y = H, !a.paused && !document.hidden && m?.ready())
        for (_ += te; _ >= 1e3 / K.hz && !a.paused; ) {
          _ -= 1e3 / K.hz;
          const ne = x.frame();
          if (ne.skill && !a.battle) {
            I();
            break;
          }
          n("input", ne);
        }
      else _ = 0;
      if (!document.hidden) try {
        m?.draw(a.battle ?? null, a, 0, "battle", H, a.world), !b && m?.needsFrame() && (b = requestAnimationFrame(V));
      } catch (ne) {
        cancelAnimationFrame(b), b = 0, w(), n("error", ne);
      }
    }
    return ue([h, () => a.world.facts], ([H, te], ne) => {
      c.value = $d(H, c.value, te, ne?.[1]);
    }, { immediate: !0 }), ue(() => a.world.definition.id, () => {
      w(), c.value = h.value[0]?.target.id ?? null, s.value?.focus({ preventScroll: !0 });
    }), ue(() => a.paused, (H) => {
      w(), T(), H || s.value?.focus({ preventScroll: !0 });
    }), ue(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.world.reading,
      a.weapon,
      a.outfit
    ], T), ga(() => {
      try {
        m = Ad(i.value, (H) => {
          u.value = !1, C(), n("error", H);
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: T,
          sceneReady: (H) => {
            u.value = !1, n("ready", H);
          },
          artworkStatus: (H, te) => {
            o.value = {
              failed: H,
              pending: te
            };
          }
        });
      } catch (H) {
        n("error", H);
        return;
      }
      x = $c(s.value, C, () => {
      }), document.addEventListener("visibilitychange", A), T(), s.value?.focus({ preventScroll: !0 });
    }), Mn(() => {
      E = !1, cancelAnimationFrame(b), b = 0, C();
    }), pr(() => {
      E = !0, T();
    }), ea(() => {
      S = !0, cancelAnimationFrame(b), w(), x?.dispose(), document.removeEventListener("visibilitychange", A), m?.dispose();
    }), t({
      stats: () => m?.stats(),
      focus: () => s.value?.focus({ preventScroll: !0 })
    }), (H, te) => (z(), $("section", {
      ref_key: "root",
      ref: s,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? g(oe).controls : g(se).actions.controls
    }, [
      k("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      u.value && !e.transitioning ? (z(), $("aside", Ld, P(g(se).transition(g(se).scenes[e.world.definition.id])), 1)) : Y("", !0),
      k("div", Od, [k("header", jd, [k("h1", null, P(g(se).scenes[e.world.definition.id]), 1), Un(H.$slots, "status", {}, void 0, !0)]), k("div", Nd, [Un(H.$slots, "threat", {}, void 0, !0)])]),
      o.value.failed ? (z(), $("div", Ud, [k("span", null, P(g(se).artwork.unavailable), 1), k("button", {
        type: "button",
        disabled: o.value.pending > 0,
        onClick: R
      }, P(o.value.pending ? g(se).artwork.loading : g(se).artwork.retry), 9, Fd)])) : Y("", !0),
      e.paused ? Y("", !0) : (z(), $("div", Dd, [
        k("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": g(se).actions.move,
          onPointerdown: te[0] || (te[0] = jt((...ne) => g(L).down && g(L).down(...ne), ["prevent"])),
          onPointermove: te[1] || (te[1] = jt((...ne) => g(L).move && g(L).move(...ne), ["prevent"])),
          onPointerup: te[2] || (te[2] = (...ne) => g(L).release && g(L).release(...ne)),
          onPointercancel: te[3] || (te[3] = (...ne) => g(L).release && g(L).release(...ne)),
          onLostpointercapture: te[4] || (te[4] = (...ne) => g(L).release && g(L).release(...ne)),
          onContextmenu: te[5] || (te[5] = jt(() => {
          }, ["prevent"]))
        }, [k("span", { style: Ia({ transform: `translate(${l.value.x}px, ${l.value.y}px)` }) }, null, 4)], 40, Zd),
        d.value ? (z(), $("div", Bd, [k("button", {
          type: "button",
          class: "journey-act",
          onClick: I
        }, [te[9] || (te[9] = k("kbd", null, "E", -1)), Oe(P(g(dr)(d.value)), 1)]), h.value.length > 1 ? (z(), $("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: F
        }, P(g(se).actions.next), 1)) : Y("", !0)])) : Y("", !0),
        e.battle ? (z(), $("div", qd, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? (z(), $("div", Wd, [
            k("span", null, P(e.battle.player.resonance > 0 ? g(oe).resonanceActive : p.value), 1),
            k("meter", {
              min: "0",
              max: g(It).maxPower,
              value: e.battle.player.resource,
              "aria-label": p.value
            }, null, 8, Hd),
            k("small", null, P(e.battle.player.resonance > 0 ? g(oe).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : Y("", !0),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: te[6] || (te[6] = jt((ne) => N(ne, "dash"), ["prevent"])),
            onClick: M
          }, [
            k("kbd", null, P(g(oe).dashKey), 1),
            Oe(P(g(oe).dash), 1),
            k("small", null, P(e.battle.player.dash > 0 ? g(oe).secondsLeft(e.battle.player.dash) : g(oe).ready), 1)
          ], 40, Vd),
          k("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: te[7] || (te[7] = jt((ne) => N(ne, "skill"), ["prevent"])),
            onClick: O
          }, [
            k("kbd", null, P(g(oe).skillKey), 1),
            Oe(P(g(Ht)[e.weapon].action), 1),
            k("small", null, P(e.battle.player.skill > 0 ? g(oe).secondsLeft(e.battle.player.skill) : g(oe).ready), 1)
          ], 40, Gd)
        ])) : Y("", !0)
      ])),
      e.paused && !e.transitioning ? (z(), $("div", Yd, [Un(H.$slots, "overlay", {}, () => [k("button", {
        class: "journey-act",
        type: "button",
        onClick: te[8] || (te[8] = (ne) => n("resume"))
      }, P(g(se).actions.resume), 1)], !0)])) : Y("", !0)
    ], 8, Td));
  }
}), Kd = /* @__PURE__ */ st(Qd, [["__scopeId", "data-v-b5389035"]]);
function Xd(e) {
  const t = new Set(e.location.visited.map(ht)), r = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const s = ht(n);
    for (const i of Cn(Se[n], r)) {
      if (i.kind !== "exit") continue;
      const l = ht(i.target.to), c = [s, l].sort().join("/");
      s !== l && (t.add(l), a.set(c, {
        id: c,
        from: s,
        to: l
      }));
    }
  }
  return {
    scenes: [...t],
    links: [...a.values()]
  };
}
function xo(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function Jd(e, t) {
  const r = xo(t), a = 3 * r, n = [], s = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let l = s(i), c = -1;
    for (let o = 0; o <= 48; o++) {
      const u = Math.ceil(o / 8) * 5.2 * r, h = o * Math.PI / 4, d = s({
        x: i.x + Math.cos(h) * u,
        y: i.y + Math.sin(h) * u
      }), p = Math.min(1 / 0, ...n.map((m) => Math.hypot(m.x - d.x, m.y - d.y)));
      if (p > c && (l = d, c = p), p >= 5.2 * r) break;
    }
    n.push(l);
  }
  return n;
}
var eu = "" + new URL("ember-assets/city-title-PvPTt7VM.webp", import.meta.url).href, tu = "" + new URL("ember-assets/city-title-mobile-DjRh8y0I.webp", import.meta.url).href, au = "" + new URL("ember-assets/chapter-outpost-eNUTzzZ8.webp", import.meta.url).href, nu = "" + new URL("ember-assets/weapon-blade-cX_cx3lv.webp", import.meta.url).href, ru = "" + new URL("ember-assets/weapon-bow-dl92j0XJ.webp", import.meta.url).href, su = "" + new URL("ember-assets/weapon-staff-BlMY2GK0.webp", import.meta.url).href, ou = "" + new URL("ember-assets/weapon-daggers-BP7rLrAU.webp", import.meta.url).href, iu = "" + new URL("ember-assets/weapon-grimoire-CrYKQ0FK.webp", import.meta.url).href, lu = "" + new URL("ember-assets/weapon-cannon-9qcVnfRp.webp", import.meta.url).href, cu = "" + new URL("ember-assets/scene-camp-BGT9GK8h.webp", import.meta.url).href, du = "" + new URL("ember-assets/scene-crossroads-DameO7fS.webp", import.meta.url).href, uu = "" + new URL("ember-assets/scene-gate-MnD2gO90.webp", import.meta.url).href, hu = "" + new URL("ember-assets/scene-beacon-CzhjDyj7.webp", import.meta.url).href, fu = "" + new URL("ember-assets/scene-waterway-CTX5alhT.webp", import.meta.url).href, pu = "" + new URL("ember-assets/scene-cells-DA9NefcD.webp", import.meta.url).href, mu = "" + new URL("ember-assets/scene-hall-D9VKJOHX.webp", import.meta.url).href, gu = "" + new URL("ember-assets/scene-roots-3TArgp-z.webp", import.meta.url).href, vu = "" + new URL("ember-assets/cg-arrival-CkFm1ndl.webp", import.meta.url).href, yu = "" + new URL("ember-assets/cg-ending-FbNUmL5I.webp", import.meta.url).href, bu = "" + new URL("ember-assets/scene-south-street-B-Gjuago.webp", import.meta.url).href, wu = "" + new URL("ember-assets/scene-workshop-street-BpKHSHY_.webp", import.meta.url).href, xu = "" + new URL("ember-assets/scene-heat-station-u2F5BDHt.webp", import.meta.url).href, us = {
  city: eu,
  cityMobile: tu,
  chapter: au
}, _u = {
  blade: nu,
  bow: ru,
  staff: su,
  daggers: ou,
  grimoire: iu,
  cannon: lu
}, hr = {
  camp: cu,
  crossroads: du,
  gate: uu,
  beacon: hu,
  waterway: fu,
  cells: pu,
  hall: mu,
  roots: gu,
  south_street: bu,
  workshop_street: wu,
  heat_station: xu
}, hs = {
  arrival: vu,
  ending: yu
}, fr = {
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
}, _o = (e) => ci(e) ? "furnace" : wr(e) ? "city" : "outskirts", Mu = (e) => Object.keys(fr).filter((t) => t === "outskirts" || e.some((r) => _o(r) === t)), ku = { class: "ember-map-header" }, Su = ["src"], Ru = ["aria-pressed"], Cu = ["viewBox", "aria-label"], Eu = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], Pu = ["transform"], Au = ["fill"], zu = {
  y: "22",
  "text-anchor": "middle"
}, Iu = ["viewBox", "aria-label"], $u = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Tu = ["points", "stroke-width"], Lu = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Ou = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], ju = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Nu = [
  "cx",
  "cy",
  "r",
  "fill"
], Uu = ["x", "y"], Fu = {
  key: 2,
  class: "ember-map-regions"
}, Du = ["aria-pressed", "onClick"], Zu = {
  key: 3,
  class: "ember-map-places"
}, Bu = /* @__PURE__ */ Fe({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = W(!1), s = W(_o(ht(r.campaign.location.scene))), i = W(null), l = W(!1), c = W(null), o = W({
      width: 400,
      height: 400
    }), u = new ResizeObserver((w) => {
      for (const C of w) {
        const { width: R, height: A } = C.contentRect;
        C.target === i.value ? l.value = R > A * 1.55 : o.value = {
          width: R,
          height: A
        };
      }
    });
    ue(c, (w, C) => {
      C && u.unobserve(C), w && u.observe(w);
    }), ga(() => {
      u.observe(i.value);
    }), ea(() => u.disconnect());
    const h = G(() => Xd(r.campaign)), d = G(() => fr[s.value].layout), p = G(() => Object.fromEntries(h.value.scenes.filter((w) => d.value[w]).map((w) => {
      const [C, R] = d.value[w], { width: A, height: T } = o.value;
      return [w, l.value ? [50 + (104 - R) / 104 * (A - 100), 10 + (C - 10) / 80 * (T - 40)] : [45 + C / 104 * (A - 90), 10 + R / 104 * (T - 40)]];
    }))), m = G(() => h.value.links.filter((w) => p.value[w.from] && p.value[w.to])), x = G(() => Mu(r.campaign.location.visited.map(ht)).map((w) => [w, fr[w]])), b = G(() => Se[r.campaign.location.scene]), y = G(() => b.value.landscape.bounds), _ = G(() => xo(y.value)), S = G(() => `${y.value.x - y.value.width / 2 - 5 * _.value} ${y.value.z - y.value.depth / 2 - 5 * _.value} ${y.value.width + 10 * _.value} ${y.value.depth + 10 * _.value}`), E = G(() => to(r.campaign)), L = G(() => {
      const w = Jd(E.value.map((C) => C.position), y.value);
      return E.value.map((C, R) => ({
        ...C,
        marker: w[R]
      }));
    });
    return (w, C) => (z(), $("div", {
      ref_key: "root",
      ref: i,
      class: wt(["ember-map", {
        "ember-map-wide": l.value,
        "ember-map-local": !n.value
      }])
    }, [
      k("div", ku, [
        g(hr)[b.value.id] ? (z(), $("img", {
          key: 0,
          src: g(hr)[b.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, Su)) : Y("", !0),
        k("h2", null, P(n.value ? g(B).chapterMap : g(se).scenes[b.value.id]), 1),
        k("div", null, [k("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: C[0] || (C[0] = (R) => n.value = !n.value)
        }, P(n.value ? g(B).localMap : g(B).chapterMap), 9, Ru), k("button", {
          type: "button",
          onClick: C[1] || (C[1] = (R) => a("close"))
        }, P(g(B).close), 1)])
      ]),
      n.value ? (z(), $("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": g(B).chapterMap,
        class: "ember-route-map"
      }, [(z(!0), $(ee, null, ke(m.value, (R) => (z(), $("line", {
        key: R.id,
        x1: p.value[R.from][0],
        y1: p.value[R.from][1],
        x2: p.value[R.to][0],
        y2: p.value[R.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(R.from) && e.campaign.location.visited.includes(R.to) ? void 0 : "4 4"
      }, null, 8, Eu))), 128)), (z(!0), $(ee, null, ke(p.value, (R, A) => (z(), $("g", {
        key: A,
        transform: `translate(${R.join(",")})`
      }, [
        k("circle", {
          r: "6",
          fill: A === g(ht)(b.value.id) ? "#bf6242" : e.campaign.location.visited.includes(A) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Au),
        k("text", zu, P(e.campaign.location.visited.includes(A) ? g(se).scenes[A] : g(B).unknownArea), 1),
        k("title", null, P(e.campaign.location.visited.includes(A) ? g(se).scenes[A] : g(B).unknownArea), 1)
      ], 8, Pu))), 128))], 8, Cu)) : (z(), $("svg", {
        key: 1,
        viewBox: S.value,
        role: "img",
        "aria-label": g(se).scenes[b.value.id]
      }, [
        k("rect", {
          x: y.value.x - y.value.width / 2,
          y: y.value.z - y.value.depth / 2,
          width: y.value.width,
          height: y.value.depth,
          rx: "2",
          fill: b.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, $u),
        (z(!0), $(ee, null, ke(b.value.landscape.roads, (R, A) => (z(), $("polyline", {
          key: A,
          points: R.points.map((T) => T.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": R.width,
          "stroke-linejoin": "round"
        }, null, 8, Tu))), 128)),
        (z(!0), $(ee, null, ke(b.value.landscape.features, (R) => (z(), $("rect", {
          key: R.id,
          x: R.footprint.x - R.footprint.width / 2,
          y: R.footprint.z - R.footprint.depth / 2,
          width: R.footprint.width,
          height: R.footprint.depth,
          fill: R.kind === "water" ? "#6eb8c6" : R.kind === "tree" || R.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Lu))), 128)),
        k("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * _.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": _.value
        }, [k("title", null, P(g(B).here), 1)], 8, Ou),
        (z(!0), $(ee, null, ke(L.value, (R, A) => (z(), $("g", { key: R.target.id }, [
          k("line", {
            x1: R.position.x,
            y1: R.position.y,
            x2: R.marker.x,
            y2: R.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * _.value
          }, null, 8, ju),
          k("circle", {
            cx: R.marker.x,
            cy: R.marker.y,
            r: 2.4 * _.value,
            fill: R.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Nu),
          k("text", {
            class: "ember-map-number",
            style: Ia({ fontSize: `${3.4 * _.value}px` }),
            x: R.marker.x,
            y: R.marker.y + 1.1 * _.value,
            "text-anchor": "middle"
          }, P(A + 1), 13, Uu),
          k("title", null, P(g(dr)(R)), 1)
        ]))), 128))
      ], 8, Iu)),
      n.value ? (z(), $("div", Fu, [(z(!0), $(ee, null, ke(x.value, ([R, A]) => (z(), $("button", {
        key: R,
        type: "button",
        "aria-pressed": s.value === R,
        onClick: (T) => s.value = R
      }, P(A.label), 9, Du))), 128))])) : (z(), $("ol", Zu, [(z(!0), $(ee, null, ke(E.value, (R) => (z(), $("li", { key: R.target.id }, P(g(dr)(R)), 1))), 128))]))
    ], 2));
  }
}), qu = /* @__PURE__ */ st(Bu, [["__scopeId", "data-v-73f4e820"]]), Wu = { class: "exp-wardrobe" }, Hu = { class: "exp-fitting-body" }, Vu = { class: "exp-preview-stage" }, Gu = ["aria-label"], Yu = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Qu = { class: "exp-preview-tools" }, Ku = ["aria-label"], Xu = ["disabled"], Ju = { class: "exp-outfit-info" }, eh = { class: "exp-muted" }, th = { class: "exp-fitting-actions" }, ah = {
  key: 0,
  class: "exp-muted"
}, nh = ["disabled"], rh = { key: 2 }, sh = { class: "exp-purchase-confirm" }, oh = ["disabled"], ih = ["disabled"], lh = ["aria-label"], ch = ["aria-pressed", "onClick"], dh = ["src"], uh = /* @__PURE__ */ Fe({
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
    const r = e, a = t, n = W(r.data.equippedOutfit), s = W(!1), i = W(0), l = W(!1), c = W(null), o = W(null), u = W({}), h = G(() => At[n.value]), d = G(() => qn(r.data, n.value)), p = G(() => li.find((R) => Jt[R].awardKey === h.value.achievement)), m = G(() => Is.filter((R) => qn(r.data, R) || At[R].achievement === null || Object.values(ft).some((A) => A.boss && Jt[A.boss].awardKey === At[R].achievement)));
    let x = null, b = !0, y = 0, _ = () => {
    };
    ue([
      n,
      i,
      () => r.weapon
    ], () => {
      b = !0, _(), s.value = !1;
    });
    function S(R) {
      n.value = R, o.value?.scrollTo({ top: 0 });
    }
    function E() {
      y = performance.now() + 1100, b = !0, _();
    }
    function L() {
      s.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function w() {
      b = !0;
      let R;
      try {
        R = new Ms({
          antialias: !0,
          alpha: !1
        });
      } catch {
        l.value = !0;
        return;
      }
      R.outputColorSpace = vr, R.toneMapping = 7, R.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const A = new xs(), T = ir(), I = new Aa(), M = po(T, I, r.traveler.gender);
      A.background = new yr("#d1e0e1"), A.add(I, new ws("#fff6e3", "#627c93", 2.7));
      const O = new Qn("#fff6e0", 3);
      O.position.set(-3, 5, 6), A.add(O);
      const N = new ks(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new vn();
      function V(ve) {
        M.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, ve, 0, 0, !0, !1), M.root.position.set(0, 0.1, 0), M.root.rotation.y = -0.2, M.root.scale.setScalar(1.35);
      }
      for (const ve of m.value)
        V(ve), F.union(new vn().setFromObject(I));
      const H = F.getSize(new xt()), te = F.getCenter(new xt()), ne = H.y * 0.5 + H.z * 0.1 + 0.2, Ie = Math.hypot(H.x, H.z) * 0.5 + 0.2;
      N.position.set(0, te.y + 0.8, 7), N.lookAt(0, te.y, 0);
      function Ge(ve) {
        const _e = Math.max(ne, Ie / ve);
        N.left = -_e * ve, N.right = -N.left, N.top = _e, N.bottom = -_e, N.updateProjectionMatrix();
      }
      Ge(1), R.setSize(144, 144, !1);
      try {
        for (const ve of m.value)
          V(ve), R.render(A, N), u.value[ve] = R.domElement.toDataURL("image/png");
      } catch {
        l.value = !0, M.dispose(), T.dispose(), A.clear(), R.dispose(), R.forceContextLoss();
        return;
      }
      c.value.append(R.domElement);
      let Be = 0, Pe = 1, xe = 1;
      const lt = new ResizeObserver(() => {
        const ve = c.value.getBoundingClientRect();
        Pe = Math.max(1, ve.width), xe = Math.max(1, ve.height), R.setSize(Pe, xe, !1), Ge(Pe / xe), b = !0, _();
      });
      lt.observe(c.value);
      const pt = matchMedia("(prefers-reduced-motion: reduce)");
      function kt(ve) {
        ve.preventDefault(), l.value = !0, cancelAnimationFrame(Be), Be = 0;
      }
      R.domElement.addEventListener("webglcontextlost", kt);
      function ta(ve) {
        if (Be = 0, l.value || document.hidden || !b && (ve > y || pt.matches) && !M.animating) return;
        const _e = ve < y && !pt.matches, St = ve * 0.03;
        M.update({
          x: _e ? Math.sin(St * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: _e ? 8 - St % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, n.value, St, ve / 1e3, pt.matches, !1), M.root.position.set(0, 0.1, 0), M.root.rotation.y = Number(i.value) * Math.PI / 180, M.root.scale.setScalar(1.35);
        try {
          R.render(A, N), b = !1;
        } catch {
          l.value = !0;
        }
        (_e || M.animating) && !l.value && _();
      }
      _ = () => {
        !Be && !l.value && !document.hidden && (Be = requestAnimationFrame(ta));
      };
      function Zt() {
        document.hidden ? (cancelAnimationFrame(Be), Be = 0) : (b = !0, _());
      }
      document.addEventListener("visibilitychange", Zt), _(), x = () => {
        _ = () => {
        }, cancelAnimationFrame(Be), lt.disconnect(), document.removeEventListener("visibilitychange", Zt), R.domElement.removeEventListener("webglcontextlost", kt), M.dispose(), T.dispose(), A.clear(), R.dispose(), R.forceContextLoss(), R.domElement.remove();
      };
    }
    function C() {
      x?.(), x = null, l.value = !1, w();
    }
    return ga(w), ea(() => x?.()), (R, A) => (z(), $("div", Wu, [k("section", {
      ref_key: "fitting",
      ref: o,
      class: "exp-fitting"
    }, [k("div", Hu, [k("div", Vu, [k("div", {
      ref_key: "host",
      ref: c,
      class: "exp-outfit-preview",
      "aria-label": g(Pa)[n.value].name
    }, [l.value ? (z(), $("div", Yu, [k("p", null, P(g(oe).presentationError.rendering), 1), k("button", {
      type: "button",
      onClick: C
    }, P(g(B).reload), 1)])) : Y("", !0)], 8, Gu), k("div", Qu, [k("label", null, [Oe(P(g(oe).rotate), 1), ca(k("input", {
      "onUpdate:modelValue": A[0] || (A[0] = (T) => i.value = T),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": g(oe).rotate
    }, null, 8, Ku), [[mr, i.value]])]), k("button", {
      type: "button",
      disabled: l.value,
      onClick: E
    }, P(g(oe).previewAction), 9, Xu)])]), k("div", Ju, [
      k("h3", null, P(g(Pa)[n.value].name), 1),
      k("p", null, P(g(Pa)[n.value].detail), 1),
      k("p", eh, P(g(oe).wardrobeNote), 1)
    ])]), k("div", th, [g(Dr)(e.data.active) ? Y("", !0) : (z(), $("p", ah, P(g(B).safeWardrobe), 1)), d.value ? (z(), $("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !g(Dr)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: A[1] || (A[1] = (T) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, P(e.data.equippedOutfit === n.value ? g(oe).equipped : g(oe).equip), 9, nh)) : p.value ? (z(), $("p", rh, P(g(oe).unlockWeapon(g(er)[p.value])), 1)) : s.value ? (z(), $(ee, { key: 3 }, [k("p", null, P(g(oe).buyOutfit(g(Pa)[n.value].name, h.value.price)), 1), k("div", sh, [k("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: L
    }, P(g(oe).confirm), 9, oh), k("button", {
      type: "button",
      onClick: A[2] || (A[2] = (T) => s.value = !1)
    }, P(g(oe).cancel), 1)])], 64)) : (z(), $("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: A[3] || (A[3] = (T) => s.value = !0)
    }, P(e.balance < h.value.price ? g(oe).noCoins : g(oe).purchase) + " · " + P(g(oe).coins(h.value.price)), 9, ih))])], 512), k("div", {
      class: "exp-outfit-rack",
      "aria-label": g(oe).tryOn
    }, [(z(!0), $(ee, null, ke(m.value, (T) => (z(), $("button", {
      key: T,
      type: "button",
      "aria-pressed": n.value === T,
      onClick: (I) => S(T)
    }, [
      u.value[T] ? (z(), $("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[T],
        alt: ""
      }, null, 8, dh)) : Y("", !0),
      k("strong", null, P(g(Pa)[T].name), 1),
      k("small", null, P(e.data.equippedOutfit === T ? g(oe).equipped : g(qn)(e.data, T) ? g(oe).owned : g(At)[T].price ? g(oe).coins(g(At)[T].price) : g(oe).achievement), 1)
    ], 8, ch))), 128))], 8, lh)]));
  }
}), hh = uh;
function Mo(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
    t.has(r[1]) && ge("narrative_unavailable"), t.set(r[1], r[2].trim());
  return t;
}
function fh(e, t = 1) {
  const r = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (r[n] || n >= ja.bands.length) && ge("narrative_unavailable");
    const s = Mo(a[3]);
    r[n] = {
      memory: s.get("memory") ?? "",
      shadow: s.get("shadow") ?? "",
      secret: s.get("secret") ?? null
    };
  }
  return ja.bands.some((a, n) => !r[n]) && ge("narrative_unavailable"), r;
}
function ph(e, t, r) {
  const a = e[Er(t.affection)];
  return {
    shadow: a.shadow,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: r ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var mh = Object.freeze({
  position: "位置",
  longing: "渴求",
  possession: "占有",
  defense: "防御",
  surrender: "让渡",
  balance: "力量关系"
});
function gh(e) {
  let t;
  const r = [];
  for (const a of e.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
    const n = Mo(a[2]), s = (l) => {
      const c = n.get(l);
      return c || ge("narrative_unavailable"), c;
    }, i = Object.fromEntries(Object.entries(mh).map(([l, c]) => [c, s(l)]));
    if (a[1] === "zero")
      t && ge("narrative_unavailable"), t = i;
    else {
      const l = Number(a[1]);
      (r[l] || l >= ja.bands.length) && ge("narrative_unavailable"), r[l] = {
        name: s("name"),
        psychology: i
      };
    }
  }
  return (!t || ja.bands.some((a, n) => !r[n])) && ge("narrative_unavailable"), {
    zero: t,
    bands: r
  };
}
function ko(e, t) {
  const r = e.bands[Er(t)];
  return t === 0 ? {
    name: r.name,
    psychology: e.zero
  } : r;
}
var vh = async (e, t) => {
  const r = await fetch(`/${No}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  r.ok || ge("narrative_unavailable");
  const a = await r.text();
  return a.trim() || ge("narrative_unavailable"), a;
};
async function yh(e, t, r = vh) {
  const [a, n, s, i, l] = await Promise.all([
    r("system-prompt", t),
    r("world", t),
    r("player", t),
    r("meta-protocol", t),
    Promise.all(nr.map(async (y) => ({
      id: y,
      document: await r(Ee(y) || Mt(y) ? y : Xe[y].card, t)
    })))
  ]), c = l.map(({ id: y, document: _ }) => {
    const S = [..._.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (S.length !== 1 || !S[0][1].trim()) && ge("narrative_unavailable"), {
      id: y,
      introduction: S[0][1].trim(),
      document: _.replace(S[0][0], "").trim()
    };
  }), o = c.map((y) => y.introduction).join(`
`), u = c.find((y) => y.id === e).document, h = {
    system: a,
    world: n,
    player: s,
    protocol: i,
    npcs: o
  };
  if (Mt(e)) return {
    ...h,
    character: u,
    relationship: null,
    stages: [],
    opening: {
      initial: Ue[e].greeting,
      returned: null
    }
  };
  if (!Ee(e)) {
    const y = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!y || y[1] !== `${e}.initial`) && ge("narrative_unavailable"), {
      ...h,
      character: u.slice(0, y.index).replace(/# 开场\s*$/, "").trim(),
      relationship: null,
      stages: [],
      opening: {
        initial: y[2],
        returned: null
      }
    };
  }
  const [d, p] = await Promise.all(["openings", `${e}-stages`].map((y) => r(y, t))), m = new Map([...d.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((y) => [y[1], y[2].trim()])), x = m.get(`${e}.initial`), b = m.get(`${e}.returned`) ?? null;
  return (!x || (e === "anian" || e === "kouzi") && !b) && ge("narrative_unavailable"), {
    ...h,
    character: u,
    relationship: gh(p),
    stages: fh(p),
    opening: {
      initial: x,
      returned: b
    }
  };
}
function So(e) {
  return ti[e];
}
function bh(e, t, r = []) {
  if (Mt(t)) return Object.fromEntries(Gr(e, t).map((i) => [i, Oa[i].meaning]));
  if (!Ee(t)) {
    const i = Xe[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: he.attack,
      ...e.facts.includes(i.intel) ? { pass: he.pass } : {}
    };
  }
  const a = Object.fromEntries(Gr(e, t).map((i) => [i, Oa[i].meaning])), n = So(t), s = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && s >= ja.bands[4] && r[Er(s)]?.secret && (a.share_secret = he.shareSecret), jl(e, t)) {
    a.follow = he.follow, a.stay = he.stay;
    for (const i of Xs(e, t).filter((l) => l.accessible && l.solo)) a[`go:${i.id}`] = he.go(i.name);
  }
  return a;
}
var Ro = "dialogue", $n = `<${Ro}>`, Ir = `</${Ro}>`, E0 = new RegExp(`${$n}([\\s\\S]*?)${Ir}`, "i"), P0 = new RegExp($n, "i");
function fs(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${$n}
${e.reply}
${Ir}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function wh(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${$n}…${Ir} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function xh(e) {
  return e.map((t) => ({
    id: t,
    event: Ya[t]
  }));
}
function _h(e) {
  const t = /* @__PURE__ */ new Set();
  let r;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((l) => !t.has(l)), s = {
      ...a.scene === r ? {} : { place: se.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((l) => t.add(l)), r = a.scene;
    const i = Object.keys(s).length ? `<scene>
${JSON.stringify(s)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: fs(a)
    }] : a.kind === "player" ? [{
      role: "user",
      content: i + a.player
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: fs(a)
    }];
  });
}
function Mh(e, t) {
  return t ? e.findIndex((r) => r.id === t.throughId) + 1 : 0;
}
var kh = {
  confined: "你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。",
  released: "牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。",
  returned: "你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。"
};
function Co(e, t) {
  if (!t) return null;
  let r = e;
  return t.map((a) => {
    const n = {
      from: r,
      exit: a.id,
      to: a.to,
      place: se.scenes[a.to],
      position: Se[r].anchors[a.anchor]
    };
    return r = a.to, n;
  });
}
function Sh(e, t) {
  const r = new Set(e.facts), a = new Set(e.knowledge[t]), n = [], s = wr(ht(t in Ue ? Ue[t].scene : t in e.people ? e.people[t].scene : e.location.scene));
  r.has("city_rekindled") || (r.has("heat_restored") ? n.push("heat_restored") : (a.has("heat_notice_read") || s) && n.push("heat_notice_read"));
  const i = As.flatMap((l) => {
    const c = l.resolved.find((o) => r.has(o));
    return c ? [c] : [];
  });
  i.push("worker_record_corrected");
  for (const l of i) {
    const c = t === "chenhe" && l === "worker_record_corrected" && r.has("worker_result_delivered");
    r.has(l) && (a.has(l) || c) && n.push(l);
  }
  return t === "kouzi" && r.has("kouzi_entered_city") && n.push("kouzi_entered_city"), !r.has("heat_restored") && a.has("return_flow_tested") && n.push("return_flow_tested"), n.map((l) => ({
    id: l,
    situation: l === "heat_notice_read" ? Ve.heatSituation : t === "chenhe" && l === "worker_record_corrected" ? Ve.workerCorrected : ii[l]
  }));
}
function Rh(e, t) {
  const r = new Set(e.facts), a = new Set(e.knowledge[t]), n = r.has("city_rekindled") ? "city_rekindled" : r.has("division_works_started") ? "division_works_started" : null, s = n ? [n] : [];
  if (!r.has("city_rekindled")) {
    const i = [
      "furnace_stilled",
      "furnace_master_defeated",
      "furnace_approach_ready",
      "division_tested",
      "division_plan_known",
      "furnace_offer_heard",
      "furnace_invited"
    ].find((l) => r.has(l) && a.has(l));
    i && s.push(i);
  }
  return s.map((i) => ({
    id: i,
    situation: di[i]
  }));
}
function Ch(e, t) {
  const r = new Set(e.facts), a = Ee(t) ? e.people[t] : null, n = Se[Ee(t) ? e.people[t].scene : Mt(t) ? Ue[t].scene : Xe[t].scene], s = Ee(t) ? e.people[t].position : Mt(t) ? n.anchors[Ue[t].anchor] : _n(t, r), i = An(n, s, r, e.people), l = Ja(n.id, s, r).filter((y) => De(Tt(n, r), s, y.position)), c = Kn(n.id), o = Ee(t) ? Rs(e.facts, t) : null, u = e.location.scene === n.id ? La(n, e.location, r) : [], h = Ls(e), d = _r, p = Ps(e).find((y) => y.person === t), m = Tt(n, r), x = Cr(e, t), b = n.exits.filter((y) => x.exit(n.id, y.to));
  return {
    place: se.scenes[n.id],
    chapter: e.chapter !== "outpost" ? { situation: [...Sh(e, t), ...Rh(e, t)] } : {
      phase: h.phase,
      playerObjective: Jn(e),
      optionalRoots: h.optionalRoots
    },
    personalThread: p ? {
      title: p.title,
      accepted: p.accepted,
      resolved: p.resolved,
      ...p.accepted ? {} : { invitation: p.task }
    } : null,
    ...e.chapter === "outpost" ? { supplies: {
      phase: h.supplies,
      situation: d.situation[h.supplies],
      collection: {
        scene: d.scene,
        place: se.scenes[d.scene],
        interaction: se.passages[d.object.passage].title,
        position: Se[d.scene].anchors[d.object.anchor],
        available: Nt(d.object.condition, r),
        route: Co(e.location.scene, xn(e.location, {
          scene: d.scene,
          anchor: d.object.anchor
        }, r, !1, x.exit))
      }
    } } : {},
    exits: b.map((y) => {
      const _ = n.anchors[y.anchor], S = Nt(y.condition, r);
      return {
        id: y.id,
        to: y.to,
        place: se.scenes[y.to],
        position: _,
        open: S,
        selfAccessible: S && pa(m, s, _, K.playerRadius) !== null,
        playerAccessible: S && e.location.scene === n.id && pa(m, e.location.position, _, K.playerRadius) !== null,
        withinReach: u.some((E) => E.target.id === y.id)
      };
    }),
    playerLodging: [Xn.guest_room.name, ...e.location.visited.includes("south_inn") ? [Xn.south_inn.name] : []],
    ...o ? { rescue: {
      phase: o,
      situation: kh[o]
    } } : {},
    playerMechanisms: n.objects.flatMap((y) => {
      if (!Nt(y.condition, r)) return [];
      const _ = y.kind === "inspect" ? xr(y.passage) : void 0, S = y.kind === "switch" ? {
        action: se.switches[y.fact],
        fact: y.fact
      } : _?.operation ? {
        action: _.operation.label,
        fact: _.fact
      } : null;
      return S ? [{
        id: y.id,
        action: S.action,
        position: n.anchors[y.anchor],
        completed: r.has(S.fact),
        withinReach: u.some((E) => E.target.id === y.id)
      }] : [];
    }),
    ...c ? { room: {
      use: c.use,
      enclosure: c.enclosure,
      household: c.household.map((y) => y === "player" ? e.traveler.name : y in se.households ? se.households[y] : Ze(y)),
      furniture: c.furniture.map((y) => ({
        item: y.label,
        position: {
          x: y.footprint.x,
          y: y.footprint.z
        }
      })),
      exits: b.map((y) => ({
        place: se.scenes[y.to],
        position: n.anchors[y.anchor]
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
      ..._t.filter((y) => e.people[y].scene === n.id).map(Ze),
      ...va.filter((y) => Ue[y].scene === n.id).map(Ze),
      ...l.map((y) => Ze(y.target.id))
    ],
    residents: (bo[n.id] ?? []).filter((y) => Nt(y.condition, r)).map((y) => ({
      name: y.name,
      activity: md[y.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? kn[a.destination].name : null,
      leader: a.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [
      ...i,
      ...l,
      ...La(n, {
        scene: n.id,
        position: s,
        facing: 0,
        visited: [n.id]
      }, r).filter((y) => y.kind === "object" && y.target.kind === "resident")
    ].filter((y) => y.target.id !== t).map((y) => Ze(y.target.id))
  };
}
function Eh(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: Qa[e.appearanceAge] } : {}
  };
}
function Ph(e, t, r = []) {
  const a = bh(e, t, r), n = Object.keys(a), s = {
    person: Ze(t),
    ...Ch(e, t),
    clothing: uo(e, t),
    events: xh(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (Mt(t)) return {
    ...s,
    rescued: !1
  };
  if (!Ee(t)) {
    const i = Xe[t];
    return {
      ...s,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...s,
    map: Xs(e, t).map((i) => ({
      ...i,
      route: Co(e.people[t].scene, i.route)
    })),
    rescued: Ga(e.facts, t),
    affection: e.relationships[t].affection
  };
}
function qa(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function Ah(e, t, r, a, n = e.memories[t]) {
  const s = Ph(e, t, a.stages), i = cc(t), l = Ee(t) ? So(t) : null, c = Ee(t) ? {
    psychology: ko(a.relationship, e.relationships[t].affection).psychology,
    ...ph(a.stages, e.relationships[t], !!l && e.facts.includes(l))
  } : null, { actions: o, actionMeanings: u, events: h, ...d } = s, p = {
    actions: u,
    performance: i,
    clothing: Ar
  }, m = {
    memory: n?.text ?? null,
    events: h,
    ...d,
    opening: e.conversations[t].some((x) => x.kind === "dialogue") || Gs(t) && e.facts.includes(Xe[t].complete) ? null : s.rescued ? a.opening.returned : a.opening.initial,
    stage: c
  };
  return {
    systemPrompt: [
      a.system.trim(),
      qa("background", a.world.trim()),
      qa("player", `${a.player.trim()}

${JSON.stringify({
        ...Eh(e.traveler),
        outfit: Pa[e.outfit].detail,
        equipment: Ht[e.weapon].equipment
      }, null, 2)}`),
      qa("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${qa("meta_protocol", `${a.protocol.trim()}

${qa("operations", JSON.stringify(p, null, 2))}`)}

<story>
${JSON.stringify(m, null, 2)}`
      },
      ..._h(e.conversations[t].length ? e.conversations[t].slice(Mh(e.conversations[t], n)) : [ro(e, t)]),
      {
        role: "user",
        content: `${r}
</story>

${wh(s.person)}`
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
function zh(e, t, r, a) {
  const n = Ah(e, t, r, a), s = To({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = Fn(n.systemPrompt), l = Fn(e.memories[t]?.text ?? ""), c = Fn(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: s,
    system: i,
    memory: l,
    history: c,
    situation: Math.max(0, s - i - l - c),
    limit: ps.waitAt,
    trigger: ps.trigger
  };
}
var Ih = { class: "ember-clothing-list" }, $h = ["data-clothing-slot"], Th = /* @__PURE__ */ Fe({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => (z(), $("dl", Ih, [(z(!0), $(ee, null, ke(g(Ar), (a, n) => (z(), $(ee, { key: n }, [e.clothing[n] !== void 0 ? (z(), $(ee, { key: 0 }, [k("dt", null, P(a), 1), k("dd", {
      "data-clothing-slot": n,
      class: wt({ "is-absent": !e.clothing[n] })
    }, P(e.clothing[n] || g(Xa).absent), 11, $h)], 64)) : Y("", !0)], 64))), 128))]));
  }
}), Eo = /* @__PURE__ */ st(Th, [["__scopeId", "data-v-2445b8a0"]]), Lh = ["onKeydown"], Oh = ["aria-label", "aria-expanded"], jh = ["aria-label", "aria-expanded"], Nh = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, Uh = ["id"], Fh = ["y", "height"], Dh = ["href"], Zh = ["href", "clip-path"], Bh = ["aria-label", "aria-expanded"], qh = ["aria-label"], Wh = ["aria-label"], Hh = { class: "ember-meter-total" }, Vh = { key: 0 }, Gh = { class: "ember-meter-total" }, Yh = { class: "ember-meter-breakdown" }, Qh = {
  class: "ember-error-detail",
  role: "status"
}, Kh = ["disabled"], Xh = { key: 3 }, Jh = { role: "status" }, e1 = /* @__PURE__ */ Fe({
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
    const t = e, r = Wt(null), a = W(null), n = {
      clothing: Xa.title,
      affection: he.affection,
      context: he.context
    }, s = G(() => uo(t.campaign, t.person)), i = W(null);
    function l() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const c = W(0), o = W("");
    let u = null, h;
    async function d() {
      u?.abort(), u = new AbortController();
      const S = u;
      r.value = null, o.value = "";
      try {
        const E = await yh(t.person, S.signal);
        S.signal.aborted || (r.value = E);
      } catch (E) {
        S.signal.aborted || (o.value = Yt(E));
      }
    }
    ue(() => t.person, () => {
      a.value = null, c.value = 0, d();
    }, { immediate: !0 });
    const p = G(() => Ee(t.person) ? t.campaign.relationships[t.person].affection : 0), m = `ember-affection-${ys()}`, x = G(() => 19 * p.value / 100), b = G(() => r.value?.relationship ? ko(r.value.relationship, p.value).name : ""), y = G(() => r.value ? zh(t.campaign, t.person, t.draft, r.value) : null);
    ue(() => [t.person, p.value], ([S, E], [L, w]) => {
      S === L && E === w || (h && clearTimeout(h), c.value = S === L ? E - w : 0, c.value && (h = setTimeout(() => {
        c.value = 0;
      }, 3500)));
    }), bs(() => (l(), !0), () => !!a.value), ea(() => {
      u?.abort(), h && clearTimeout(h);
    });
    const _ = (S) => `${(S / 1e3).toFixed(1)}k`;
    return (S, E) => (z(), $("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: Io(jt(l, ["stop"]), ["esc"])
    }, [
      k("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": g(Xa).title,
        "aria-expanded": a.value === "clothing",
        onClick: E[0] || (E[0] = (L) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...E[4] || (E[4] = [k("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [k("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Oh),
      g(Ee)(e.person) ? (z(), $("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(he).affection,
        "aria-expanded": a.value === "affection",
        onClick: E[1] || (E[1] = (L) => a.value = a.value === "affection" ? null : "affection")
      }, [(z(), $("svg", Nh, [
        k("defs", null, [k("path", {
          id: `${m}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, Uh), k("clipPath", { id: m }, [k("rect", {
          x: "2",
          y: 22 - x.value,
          width: "20",
          height: x.value
        }, null, 8, Fh)])]),
        k("use", {
          href: `#${m}-shape`,
          class: "ember-affection-track"
        }, null, 8, Dh),
        k("use", {
          href: `#${m}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${m})`
        }, null, 8, Zh)
      ])), c.value ? (z(), $("small", {
        key: 0,
        class: wt(["ember-affection-change", { "is-down": c.value < 0 }]),
        role: "status"
      }, P(c.value > 0 ? "+" : "") + P(c.value), 3)) : Y("", !0)], 8, jh)) : Y("", !0),
      k("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(he).context,
        "aria-expanded": a.value === "context",
        onClick: E[2] || (E[2] = (L) => a.value = a.value === "context" ? null : "context")
      }, [k("span", {
        class: wt(["ember-meter-ring", { "is-warning": y.value && y.value.used >= y.value.trigger }]),
        style: Ia({ "--meter-fill": `${Math.min(1, (y.value?.used ?? 0) / (y.value?.limit ?? 1)) * 360}deg` })
      }, [...E[5] || (E[5] = [k("span", null, null, -1)])], 6)], 8, Bh),
      a.value ? (z(), $("section", {
        key: 1,
        class: wt(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        k("header", null, [k("strong", null, P(n[a.value]), 1), k("button", {
          type: "button",
          "aria-label": g(he).close,
          onClick: l
        }, "×", 8, Wh)]),
        a.value === "affection" ? (z(), $(ee, { key: 0 }, [k("p", Hh, [Oe(P(p.value) + " ", 1), E[6] || (E[6] = k("small", null, "/ 100", -1))]), o.value ? Y("", !0) : (z(), $("p", Vh, P(b.value || g(he).loading), 1))], 64)) : a.value === "clothing" ? (z(), vt(Eo, {
          key: 1,
          clothing: s.value
        }, null, 8, ["clothing"])) : y.value ? (z(), $(ee, { key: 2 }, [
          k("p", Gh, P(_(y.value.used)) + " / " + P(_(y.value.limit)), 1),
          k("dl", Yh, [(z(!0), $(ee, null, ke(g(he).contextParts, (L, w) => (z(), $(ee, { key: w }, [k("dt", null, P(L), 1), k("dd", null, P(_(y.value[w])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? (z(), $(ee, { key: 0 }, [k("p", Qh, P(g(Yt)(e.memoryState)), 1), k("button", {
            type: "button",
            disabled: e.blocked,
            onClick: E[3] || (E[3] = (L) => S.$emit("retry-memory"))
          }, P(g(he).memoryRetry), 9, Kh)], 64)) : Y("", !0)
        ], 64)) : o.value ? Y("", !0) : (z(), $("p", Xh, P(g(he).loading), 1)),
        o.value && a.value !== "clothing" ? (z(), $(ee, { key: 4 }, [k("p", Jh, P(o.value), 1), k("button", {
          type: "button",
          onClick: d
        }, P(g(he).retry), 1)], 64)) : Y("", !0)
      ], 10, qh)) : Y("", !0)
    ], 40, Lh));
  }
}), t1 = /* @__PURE__ */ st(e1, [["__scopeId", "data-v-38bbe277"]]), a1 = ["aria-label"], n1 = { class: "ember-weapon-layout" }, r1 = { class: "ember-weapon-list" }, s1 = ["name", "value"], o1 = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, i1 = ["src"], l1 = { class: "ember-weapon-skill" }, c1 = /* @__PURE__ */ Fe({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = gs(e, "modelValue"), r = ys();
    return (a, n) => (z(), $("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": g(Me).chooseWeapon
    }, [k("div", n1, [k("div", r1, [(z(!0), $(ee, null, ke(g(Cs), (s) => (z(), $("label", {
      key: s,
      class: wt({ "is-selected": t.value === s })
    }, [
      ca(k("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: g(r),
        value: s
      }, null, 8, s1), [[vs, t.value]]),
      at(Gt, { name: s }, null, 8, ["name"]),
      k("span", null, P(g(Ht)[s].name), 1)
    ], 2))), 128))]), k("div", o1, [
      (z(), $("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: g(_u)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, i1)),
      k("h3", null, P(g(Ht)[t.value].name), 1),
      k("p", null, P(g(Ht)[t.value].detail), 1),
      k("div", l1, [k("strong", null, P(g(Ht)[t.value].action), 1), k("p", null, P(g(Ht)[t.value].skill), 1)])
    ])])], 8, a1));
  }
}), d1 = /* @__PURE__ */ st(c1, [["__scopeId", "data-v-0c0d4e2b"]]), u1 = ["src"], h1 = /* @__PURE__ */ Fe({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = W(null), r = W(null), a = new ResizeObserver((n) => {
      const { width: s, height: i } = n[0].contentRect;
      r.value = s <= 700 && i > s;
    });
    return ga(() => a.observe(t.value)), ea(() => a.disconnect()), (n, s) => (z(), $("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [r.value !== null ? (z(), $("img", {
      key: 0,
      src: r.value ? g(us).cityMobile : g(us).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, u1)) : Y("", !0)], 512));
  }
}), f1 = /* @__PURE__ */ st(h1, [["__scopeId", "data-v-f5a6e0d9"]]), p1 = ["aria-label"], m1 = {
  key: 0,
  class: "entry-title"
}, g1 = { class: "entry-city" }, v1 = ["aria-label"], y1 = ["disabled"], b1 = ["disabled"], w1 = ["disabled"], x1 = {
  key: 0,
  class: "entry-save"
}, _1 = ["disabled"], M1 = { class: "entry-name" }, k1 = { for: "ember-traveler-name" }, S1 = ["maxlength", "placeholder"], R1 = { class: "entry-identity-details" }, C1 = ["value"], E1 = { class: "entry-age" }, P1 = { for: "ember-traveler-age" }, A1 = {
  disabled: "",
  value: ""
}, z1 = ["value"], I1 = {
  class: "entry-primary",
  type: "submit"
}, $1 = { class: "entry-traveler" }, T1 = {
  key: 0,
  class: "entry-restart"
}, L1 = ["disabled"], O1 = {
  key: 0,
  "aria-hidden": "true"
}, j1 = /* @__PURE__ */ Fe({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: r }) {
    const a = e, n = r, s = W("title"), i = W(a.campaign?.traveler.name ?? ""), l = W(a.campaign?.traveler.gender ?? null), c = W(a.campaign?.traveler.appearanceAge ?? ""), o = W(a.campaign?.weapon ?? "blade"), u = W(!1), h = W(null), d = W(null), p = G(() => ({
      title: B.title,
      identity: Me.identity,
      weapon: Me.chooseWeapon
    })[s.value]);
    ue(s, async () => {
      await zt(), d.value && (d.value.scrollTop = 0), h.value?.focus({ preventScroll: !0 });
    });
    function m() {
      u.value = !1, s.value = "identity";
    }
    function x() {
      i.value.trim() && l.value && c.value && (i.value = i.value.trim(), s.value = "weapon");
    }
    function b() {
      s.value = s.value === "weapon" ? "identity" : "title";
    }
    function y() {
      !l.value || !c.value || !i.value.trim() || a.blocked || a.campaign && !u.value || n("start", {
        traveler: {
          name: i.value.trim(),
          gender: l.value,
          appearanceAge: c.value
        },
        weapon: o.value
      });
    }
    return t({ back: () => s.value === "title" ? !1 : (b(), !0) }), (_, S) => (z(), $("section", {
      class: wt(["ember-entry", { "is-title": s.value === "title" }]),
      "aria-label": g(B).title
    }, [
      at(f1),
      S[9] || (S[9] = k("div", { class: "entry-shade" }, null, -1)),
      s.value === "title" ? (z(), $("div", m1, [
        k("p", g1, P(g(Me).city), 1),
        k("h1", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, P(g(B).title), 513),
        k("nav", { "aria-label": g(B).title }, [e.campaign ? (z(), $("button", {
          key: 0,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: S[0] || (S[0] = (E) => n("continue"))
        }, [Oe(P(g(B).resume), 1), S[6] || (S[6] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, y1)) : (z(), $("button", {
          key: 1,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, [Oe(P(e.ready ? g(Me).begin : g(Me).loading), 1), S[7] || (S[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, b1)), e.campaign ? (z(), $("button", {
          key: 2,
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, P(g(Me).newJourney), 9, w1)) : Y("", !0)], 8, v1),
        e.campaign ? (z(), $("p", x1, [k("span", null, P(e.campaign.traveler.name), 1), k("span", null, P(g(se).scenes[e.campaign.location.scene]), 1)])) : Y("", !0)
      ])) : (z(), $("div", {
        key: 1,
        ref_key: "sheet",
        ref: d,
        class: "entry-sheet"
      }, [
        k("header", null, [k("button", {
          type: "button",
          disabled: e.busy,
          onClick: b
        }, "← " + P(g(Me).back), 9, _1), k("span", null, P(g(B).title), 1)]),
        k("h2", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, P(p.value), 513),
        s.value === "identity" ? (z(), $("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: jt(x, ["prevent"])
        }, [
          k("div", M1, [k("label", k1, P(g(Me).name), 1), ca(k("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": S[1] || (S[1] = (E) => i.value = E),
            maxlength: g(24),
            placeholder: g(Me).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, S1), [[mr, i.value]])]),
          k("div", R1, [k("fieldset", null, [k("legend", null, P(g(Me).gender), 1), (z(!0), $(ee, null, ke(g(no), (E) => (z(), $("label", { key: E }, [ca(k("input", {
            "onUpdate:modelValue": S[2] || (S[2] = (L) => l.value = L),
            type: "radio",
            name: "ember-traveler-gender",
            value: E,
            required: ""
          }, null, 8, C1), [[vs, l.value]]), k("span", null, P(g(Me).genders[E]), 1)]))), 128))]), k("div", E1, [k("label", P1, P(g(Me).age), 1), ca(k("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": S[3] || (S[3] = (E) => c.value = E),
            required: ""
          }, [k("option", A1, P(g(Me).agePlaceholder), 1), (z(!0), $(ee, null, ke(g(Qa), (E, L) => (z(), $("option", {
            key: L,
            value: L
          }, P(E), 9, z1))), 128))], 512), [[$o, c.value]])])]),
          k("button", I1, [Oe(P(g(Me).next), 1), S[8] || (S[8] = k("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : (z(), $("form", {
          key: 1,
          class: "entry-loadout",
          onSubmit: jt(y, ["prevent"])
        }, [
          k("p", $1, [k("strong", null, P(i.value), 1), k("span", null, P(l.value ? g(Me).genders[l.value] : "") + " · " + P(c.value ? g(Qa)[c.value] : "") + " · " + P(g(Me).identityRole), 1)]),
          at(d1, {
            modelValue: o.value,
            "onUpdate:modelValue": S[4] || (S[4] = (E) => o.value = E)
          }, null, 8, ["modelValue"]),
          e.campaign ? (z(), $("label", T1, [ca(k("input", {
            "onUpdate:modelValue": S[5] || (S[5] = (E) => u.value = E),
            type: "checkbox",
            required: ""
          }, null, 512), [[Po, u.value]]), k("span", null, P(g(Me).restartWarning), 1)])) : Y("", !0),
          k("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Oe(P(e.busy ? g(Me).entering : e.campaign ? g(Me).confirmRestart : g(Me).enter), 1), e.busy ? Y("", !0) : (z(), $("span", O1, "→"))], 8, L1)
        ], 32))
      ], 512))
    ], 10, p1));
  }
}), N1 = /* @__PURE__ */ st(j1, [["__scopeId", "data-v-5cbd1a94"]]), U1 = [
  "aria-label",
  "title",
  "disabled"
], F1 = ["disabled"], D1 = [
  "maxlength",
  "aria-label",
  "placeholder"
], Z1 = ["aria-label", "title"], B1 = [
  "aria-label",
  "title",
  "disabled"
], q1 = /* @__PURE__ */ Fe({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ $r({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ $r([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const r = gs(e, "modelValue"), a = e, n = t, s = W(null), i = W(!1);
    let l = null, c = 0;
    function o() {
      s.value && (s.value.style.height = "44px", s.value.style.height = `${Math.min(132, s.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && r.value.trim() && n("send");
    }
    function h(d) {
      Lo(d, i.value) && (d.preventDefault(), u());
    }
    return ue(r, async () => {
      await zt(), o();
    }), ue(s, (d, p) => {
      p && l?.unobserve(p), d && (o(), l?.observe(d));
    }, { flush: "post" }), ga(() => {
      o(), l = new ResizeObserver((d) => {
        const p = d[0].contentRect.width;
        p !== c && (c = p, o());
      }), s.value && l.observe(s.value);
    }), ea(() => l?.disconnect()), (d, p) => (z(), $("form", {
      class: "ember-composer",
      onSubmit: jt(u, ["prevent"])
    }, [
      k("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? g(he).retrySend : g(he).regenerate,
        title: e.retrying ? g(he).retrySend : g(he).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: p[0] || (p[0] = (m) => n("regenerate"))
      }, [...p[6] || (p[6] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, U1),
      e.conclusion ? (z(), $("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: p[1] || (p[1] = (m) => n("continue"))
      }, [Oe(P(e.conclusion === "fight" ? g(he).fight : g(he).continue), 1), p[7] || (p[7] = k("span", { "aria-hidden": "true" }, "→", -1))], 8, F1)) : ca((z(), $("textarea", {
        key: 1,
        ref_key: "input",
        ref: s,
        "onUpdate:modelValue": p[2] || (p[2] = (m) => r.value = m),
        rows: "1",
        maxlength: g(oo).playerTextLimit,
        "aria-label": g(B).input,
        placeholder: g(B).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: p[3] || (p[3] = (m) => i.value = !0),
        onCompositionend: p[4] || (p[4] = (m) => i.value = !1)
      }, null, 40, D1)), [[mr, r.value]]),
      e.talking ? (z(), $("button", {
        key: 2,
        type: "button",
        "aria-label": g(B).cancel,
        title: g(B).cancel,
        onClick: p[5] || (p[5] = (m) => n("cancel"))
      }, [...p[8] || (p[8] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, Z1)) : e.conclusion ? Y("", !0) : (z(), $("button", {
        key: 3,
        type: "submit",
        "aria-label": g(B).send,
        title: g(B).send,
        disabled: e.blocked || !r.value.trim()
      }, [...p[9] || (p[9] = [k("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [k("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, B1))
    ], 32));
  }
}), W1 = /* @__PURE__ */ st(q1, [["__scopeId", "data-v-640a5540"]]), H1 = ["data-phase"], V1 = {
  role: "status",
  "aria-live": "polite"
}, G1 = ["datetime"], Y1 = /* @__PURE__ */ Fe({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, r = W(Date.now()), a = W(!0);
    pr(() => {
      a.value = !0;
    }), Mn(() => {
      a.value = !1;
    });
    const n = G(() => Math.max(0, Math.floor((r.value - t.startedAt) / 1e3)));
    return ue(() => [t.startedAt, a.value], (s, i, l) => {
      if (r.value = Date.now(), !a.value) return;
      const c = setInterval(() => {
        r.value = Date.now();
      }, 1e3);
      l(() => clearInterval(c));
    }, { immediate: !0 }), (s, i) => (z(), $("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = k("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      k("span", V1, P(g(he).phases[e.phase]), 1),
      k("time", { datetime: `PT${n.value}S` }, P(g(he).elapsed(n.value)), 9, G1)
    ], 8, H1));
  }
}), Q1 = /* @__PURE__ */ st(Y1, [["__scopeId", "data-v-55406ff9"]]), ms = "关闭交谈后出发", Ea = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${ms}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, r) => r ? `${e}准备前往${t}等候 · ${ms}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function K1(e, t, r) {
  if (!Ee(t)) return !1;
  const a = e.people[t], n = r.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const s = e.conversations[t];
  for (let i = s.length - 1; i >= 0; i--) {
    const l = s[i], c = l.action;
    if (c === "follow" || c === "stay" || c?.startsWith("go:")) return l.id === r.id;
  }
  return !1;
}
function X1(e, t, r) {
  const a = r.action;
  if (r.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === r.id, s = Qs(a), i = K1(e, t, r) || n && (s?.confirm ? zn(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), l = Ze(t);
  if (s?.feedback) return {
    action: a,
    phase: i ? "pending" : "applied",
    text: i ? s.feedback.pending : s.feedback.applied
  };
  let c;
  switch (a) {
    case "briefing":
    case "receiving":
    case "clinic":
    case "share_secret":
      c = Ea[a];
      break;
    case "follow":
      c = Ea.follow(l, i);
      break;
    case "stay":
      c = Ea.stay(l);
      break;
    case "pass":
      c = Ea.pass(l, i);
      break;
    case "attack":
    case "finish":
      c = Ea[a](i);
      break;
    default:
      c = Ea.go(l, kn[a.slice(3)].name, i);
  }
  return {
    action: a,
    phase: i ? "pending" : "applied",
    text: c
  };
}
var J1 = ["data-action", "data-phase"], e2 = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, t2 = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, a2 = /* @__PURE__ */ Fe({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, r = G(() => X1(t.campaign, t.person, t.turn));
    return (a, n) => r.value ? (z(), $("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": r.value.action,
      "data-phase": r.value.phase
    }, [(z(), $("svg", e2, [r.value.phase === "pending" ? (z(), $(ee, { key: 0 }, [n[0] || (n[0] = k("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = k("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : (z(), $("path", t2))])), k("span", null, P(r.value.text), 1)], 8, J1)) : Y("", !0);
  }
}), n2 = /* @__PURE__ */ st(a2, [["__scopeId", "data-v-00613f94"]]), r2 = { class: "ember-clothing-feedback" }, s2 = { key: 0 }, o2 = /* @__PURE__ */ Fe({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => (z(), $("details", r2, [k("summary", null, [Oe(P(g(Xa).changed), 1), k("span", null, [(z(!0), $(ee, null, ke(g(Ar), (a, n) => (z(), $(ee, { key: n }, [e.clothing[n] !== void 0 ? (z(), $("small", s2, P(a), 1)) : Y("", !0)], 64))), 128))])]), at(Eo, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), i2 = /* @__PURE__ */ st(o2, [["__scopeId", "data-v-49dedcf2"]]);
function l2(e) {
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
var c2 = "" + new URL("ember-assets/sanniang-body-B_tq-dMO.webp", import.meta.url).href, d2 = "" + new URL("ember-assets/sanniang-arm-Bm6H1dRj.webp", import.meta.url).href, u2 = "" + new URL("ember-assets/sanniang-neutral-DXTdZp3i.webp", import.meta.url).href, h2 = "" + new URL("ember-assets/sanniang-smile-noV3jnDd.webp", import.meta.url).href, f2 = "" + new URL("ember-assets/sanniang-teasing-Dg0_1bnn.webp", import.meta.url).href, p2 = "" + new URL("ember-assets/sanniang-blush-CCS7mL7q.webp", import.meta.url).href, m2 = "" + new URL("ember-assets/sanniang-relaxed-DW4eA74n.webp", import.meta.url).href, g2 = "" + new URL("ember-assets/sanniang-serious-CwUT-_7U.webp", import.meta.url).href, v2 = "" + new URL("ember-assets/sanniang-worried-BfIdgkTU.webp", import.meta.url).href, y2 = "" + new URL("ember-assets/sanniang-sad-COe1aNTp.webp", import.meta.url).href, b2 = "" + new URL("ember-assets/sanniang-displeased-C2M9rHVA.webp", import.meta.url).href, w2 = "" + new URL("ember-assets/sanniang-fond-BPtREJDc.webp", import.meta.url).href, x2 = "" + new URL("ember-assets/sanniang-laugh-DiCXV8k0.webp", import.meta.url).href, _2 = "" + new URL("ember-assets/sanniang-surprised-BV1JYuTz.webp", import.meta.url).href, M2 = "" + new URL("ember-assets/anian-body-DCOYRRf4.webp", import.meta.url).href, k2 = "" + new URL("ember-assets/anian-neutral-CUA1T09A.webp", import.meta.url).href, S2 = "" + new URL("ember-assets/anian-arm-CxeZ5EK2.webp", import.meta.url).href, R2 = "" + new URL("ember-assets/anian-blush-C8gvbv5I.webp", import.meta.url).href, C2 = "" + new URL("ember-assets/anian-displeased-Dy2sm-18.webp", import.meta.url).href, E2 = "" + new URL("ember-assets/anian-fond-WFHkgJZI.webp", import.meta.url).href, P2 = "" + new URL("ember-assets/anian-laugh-D2ZZqjUz.webp", import.meta.url).href, A2 = "" + new URL("ember-assets/anian-rest-B5smyaQa.webp", import.meta.url).href, z2 = "" + new URL("ember-assets/anian-sad-957wfM7Z.webp", import.meta.url).href, I2 = "" + new URL("ember-assets/anian-surprised-CRBE7-3g.webp", import.meta.url).href, $2 = "" + new URL("ember-assets/anian-worried-CoEnP0Ls.webp", import.meta.url).href, T2 = "" + new URL("ember-assets/anian-smile-vqfRMj9V.webp", import.meta.url).href, L2 = "" + new URL("ember-assets/kouzi-body-pi_GesdX.webp", import.meta.url).href, O2 = "" + new URL("ember-assets/kouzi-neutral-BHN8FRWd.webp", import.meta.url).href, j2 = "" + new URL("ember-assets/kouzi-arm-Dt1k7QS3.webp", import.meta.url).href, N2 = "" + new URL("ember-assets/kouzi-displeased-u3BA-oF8.webp", import.meta.url).href, U2 = "" + new URL("ember-assets/kouzi-fond-BNLlxNvH.webp", import.meta.url).href, F2 = "" + new URL("ember-assets/kouzi-laugh-CmRDrIYh.webp", import.meta.url).href, D2 = "" + new URL("ember-assets/kouzi-sad--tSsbCmM.webp", import.meta.url).href, Z2 = "" + new URL("ember-assets/kouzi-serious-CUEjL5ps.webp", import.meta.url).href, B2 = "" + new URL("ember-assets/kouzi-smile-DQS1bOIn.webp", import.meta.url).href, q2 = "" + new URL("ember-assets/kouzi-surprised-D_m47QNy.webp", import.meta.url).href, W2 = "" + new URL("ember-assets/kouzi-teasing-HV1Xbjwg.webp", import.meta.url).href, H2 = "" + new URL("ember-assets/kouzi-worried-noVjOF-2.webp", import.meta.url).href, V2 = "" + new URL("ember-assets/kouzi-blush-D1R6yAj4.webp", import.meta.url).href, G2 = "" + new URL("ember-assets/laobai-body-CiCiUXaK.webp", import.meta.url).href, Y2 = "" + new URL("ember-assets/laobai-arm-BPcvdc_G.webp", import.meta.url).href, Q2 = "" + new URL("ember-assets/laobai-neutral-BszZr6uU.webp", import.meta.url).href, K2 = "" + new URL("ember-assets/laobai-smile-B6Lrl5WC.webp", import.meta.url).href, X2 = "" + new URL("ember-assets/laobai-teasing-D7aVLAY_.webp", import.meta.url).href, J2 = "" + new URL("ember-assets/laobai-laugh-C7nooIV7.webp", import.meta.url).href, ef = "" + new URL("ember-assets/laobai-blush-DhABNQ2i.webp", import.meta.url).href, tf = "" + new URL("ember-assets/laobai-fond-Bi7eZfNv.webp", import.meta.url).href, af = "" + new URL("ember-assets/laobai-serious-CWzUzqsj.webp", import.meta.url).href, nf = "" + new URL("ember-assets/laobai-surprised-DWl6WaG1.webp", import.meta.url).href, rf = "" + new URL("ember-assets/laobai-worried-NHYVPdJS.webp", import.meta.url).href, sf = "" + new URL("ember-assets/laobai-sad-Dh9Oip1e.webp", import.meta.url).href, of = "" + new URL("ember-assets/bajin-body-CP5YAbCV.webp", import.meta.url).href, lf = "" + new URL("ember-assets/bajin-neutral-CpkizK1M.webp", import.meta.url).href, cf = "" + new URL("ember-assets/bajin-arm-BokEMFK-.webp", import.meta.url).href, df = "" + new URL("ember-assets/bajin-angry-0gZe6btz.webp", import.meta.url).href, uf = "" + new URL("ember-assets/bajin-relieved-wp9h8D8n.webp", import.meta.url).href, hf = "" + new URL("ember-assets/bajin-resigned-xaqeiOk2.webp", import.meta.url).href, ff = "" + new URL("ember-assets/bajin-suspicious-BahktpZg.webp", import.meta.url).href, pf = "" + new URL("ember-assets/bajin-worried-DbSEIW6Z.webp", import.meta.url).href, mf = "" + new URL("ember-assets/changyounian-body-DOfy0pe5.webp", import.meta.url).href, gf = "" + new URL("ember-assets/changyounian-neutral-Dvjv70fG.webp", import.meta.url).href, vf = "" + new URL("ember-assets/changyounian-arm-CWiq1e__.webp", import.meta.url).href, yf = "" + new URL("ember-assets/changyounian-displeased-Bd-oNqUw.webp", import.meta.url).href, bf = "" + new URL("ember-assets/changyounian-relieved-BbpArqR5.webp", import.meta.url).href, wf = "" + new URL("ember-assets/changyounian-smile-DW4L1gw7.webp", import.meta.url).href, xf = "" + new URL("ember-assets/changyounian-squint-K1sh8q-4.webp", import.meta.url).href, _f = "" + new URL("ember-assets/changyounian-worried-FQS8Z8hb.webp", import.meta.url).href, Mf = {
  sanniang: {
    body: c2,
    arm: d2,
    heads: {
      neutral: u2,
      smile: h2,
      teasing: f2,
      blush: p2,
      rest: m2,
      serious: g2,
      worried: v2,
      sad: y2,
      displeased: b2,
      fond: w2,
      laugh: x2,
      surprised: _2
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: M2,
    arm: S2,
    heads: {
      neutral: k2,
      smile: T2,
      blush: R2,
      displeased: C2,
      fond: E2,
      laugh: P2,
      rest: A2,
      sad: z2,
      surprised: I2,
      worried: $2
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: L2,
    arm: j2,
    heads: {
      neutral: O2,
      blush: V2,
      displeased: N2,
      fond: U2,
      laugh: F2,
      sad: D2,
      serious: Z2,
      smile: B2,
      surprised: q2,
      teasing: W2,
      worried: H2
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: G2,
    arm: Y2,
    heads: {
      neutral: Q2,
      smile: K2,
      teasing: X2,
      laugh: J2,
      blush: ef,
      fond: tf,
      serious: af,
      surprised: nf,
      worried: rf,
      sad: sf
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: of,
    arm: cf,
    heads: {
      neutral: lf,
      angry: df,
      relieved: uf,
      resigned: hf,
      suspicious: ff,
      worried: pf
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: mf,
    arm: vf,
    heads: {
      neutral: gf,
      displeased: yf,
      relieved: bf,
      smile: wf,
      squint: xf,
      worried: _f
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
}, kf = {
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
function Sf(e, t, r) {
  if (e === "none") return null;
  const a = kf[e], n = a.joint === "arm" ? a.angles.map((s) => `rotate(${s * r}deg)`) : a.frames;
  return t[a.joint].animate(n.map((s) => ({ transform: s })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var Rf = ["src"], Cf = ["src"], Ef = ["src"], Pf = /* @__PURE__ */ Fe({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = W(null), a = W(null), n = W(null), s = G(() => Mf[t.person]), i = W(!1), l = W(0);
    let c = 0, o = !1, u = !1, h = null, d, p;
    function m() {
      u = !0, h?.cancel(), h = null;
    }
    function x() {
      if (!(!t.animate || u || i.value || c < 3 || !o)) {
        if (document.hidden || p?.matches) {
          m();
          return;
        }
        a.value && n.value && (u = !0, h = Sf(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, s.value.armDirection));
      }
    }
    function b() {
      c++, x();
    }
    function y() {
      i.value = !0, m();
    }
    function _() {
      c = 0, i.value = !1, l.value++;
    }
    function S() {
      document.hidden && m();
    }
    function E() {
      p?.matches && m();
    }
    return ue(() => t.animate, (L) => {
      L ? x() : m();
    }), ga(() => {
      p = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || p.matches) && m(), p.addEventListener("change", E), document.addEventListener("visibilitychange", S), d = new IntersectionObserver((L) => {
        o = L[0].isIntersecting && L[0].intersectionRatio >= 0.25, o ? x() : h && m();
      }, { threshold: 0.25 }), r.value && d.observe(r.value);
    }), Mn(m), ea(() => {
      m(), d?.disconnect(), p?.removeEventListener("change", E), document.removeEventListener("visibilitychange", S);
    }), (L, w) => (z(), $("span", {
      ref_key: "root",
      ref: r,
      class: wt(["ember-dialogue-actor", { "actor-failed": i.value }])
    }, [i.value ? (z(), $("button", {
      key: 1,
      type: "button",
      onClick: _
    }, P(g(he).reloadArtwork), 1)) : (z(), $(ee, { key: 0 }, [
      (z(), $("img", {
        key: "body-" + l.value,
        src: s.value.body,
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: y
      }, null, 40, Rf)),
      (z(), $("img", {
        key: "head-" + l.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: s.value.heads[e.performance?.expression ?? "neutral"],
        style: Ia({ transformOrigin: s.value.headOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: y
      }, null, 44, Cf)),
      (z(), $("img", {
        key: "arm-" + l.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: s.value.arm,
        style: Ia({ transformOrigin: s.value.armOrigin }),
        alt: "",
        width: "420",
        height: "495",
        decoding: "async",
        loading: "lazy",
        onLoad: b,
        onError: y
      }, null, 44, Ef))
    ], 64))], 2));
  }
}), Af = /* @__PURE__ */ st(Pf, [["__scopeId", "data-v-0fe32419"]]), zf = "" + new URL("ember-assets/portrait-wenshoutong-Be48xBQZ.webp", import.meta.url).href, If = "" + new URL("ember-assets/portrait-chenhe-CXD8lUbV.webp", import.meta.url).href, $f = "" + new URL("ember-assets/portrait-qinzhi-CGn-amkh.webp", import.meta.url).href, Tf = "" + new URL("ember-assets/portrait-liangyoufang-BoDQCDQN.webp", import.meta.url).href, Lf = "" + new URL("ember-assets/portrait-chengtiesheng-FQVu_ZCY.webp", import.meta.url).href, Of = {
  wenshoutong: zf,
  chenhe: If,
  qinzhi: $f,
  liangyoufang: Tf,
  chengtiesheng: Lf
}, jf = ["src"], Nf = /* @__PURE__ */ Fe({
  __name: "StoryPortrait",
  props: { person: {} },
  setup(e) {
    const t = W(!1), r = W(0);
    function a() {
      t.value = !1, r.value++;
    }
    return (n, s) => (z(), $("span", { class: wt(["ember-story-portrait", { "is-failed": t.value }]) }, [t.value ? (z(), $("button", {
      key: 1,
      type: "button",
      onClick: a
    }, P(g(he).reloadArtwork), 1)) : (z(), $("img", {
      key: r.value,
      src: g(Of)[e.person],
      alt: "",
      width: "418",
      height: "560",
      loading: "lazy",
      decoding: "async",
      onError: s[0] || (s[0] = (i) => t.value = !0)
    }, null, 40, jf))], 2));
  }
}), Uf = /* @__PURE__ */ st(Nf, [["__scopeId", "data-v-be9de30b"]]), Ff = { class: "ember-npc-bubble" }, Df = { class: "ember-npc-line" }, Zf = /* @__PURE__ */ Fe({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = G(() => l2(t.reply));
    return (a, n) => (z(), $("div", Ff, [g(co)(e.person) ? (z(), vt(Af, {
      key: 0,
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ])) : g(Mt)(e.person) ? (z(), vt(Uf, {
      key: 1,
      person: e.person
    }, null, 8, ["person"])) : Y("", !0), k("p", Df, [(z(!0), $(ee, null, ke(r.value, (s, i) => (z(), $("span", {
      key: i,
      class: wt({ "ember-spoken": s.spoken })
    }, P(s.text), 3))), 128))])]));
  }
}), Bf = /* @__PURE__ */ st(Zf, [["__scopeId", "data-v-3e8dc9c6"]]), qf = { class: "ember-campaign" }, Wf = { class: "ember-health" }, Hf = [
  "max",
  "value",
  "aria-label"
], Vf = { class: "ember-objective" }, Gf = {
  key: 0,
  class: "ember-boss"
}, Yf = [
  "max",
  "value",
  "aria-label"
], Qf = {
  key: 1,
  class: "ember-alarm",
  role: "status"
}, Kf = {
  key: 2,
  class: "ember-combat-notice",
  role: "status"
}, Xf = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, Jf = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, ep = {
  key: 4,
  class: "ember-rest-notice",
  role: "status"
}, tp = ["aria-label"], ap = ["disabled", "aria-label"], np = ["disabled", "aria-label"], rp = ["disabled", "aria-label"], sp = ["aria-label"], op = ["aria-label"], ip = { class: "ember-error-detail" }, lp = ["disabled"], cp = ["disabled"], dp = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, up = { class: "ember-error-detail" }, hp = { key: 0 }, fp = { class: "ember-prose" }, pp = {
  key: 8,
  class: "ember-award-notice",
  role: "status"
}, mp = ["aria-label"], gp = ["aria-label"], vp = {
  key: 0,
  class: "ember-panel-heading"
}, yp = ["aria-label"], bp = ["aria-pressed"], wp = ["aria-pressed"], xp = ["disabled"], _p = { class: "ember-prose ember-prologue" }, Mp = { class: "ember-objective-panel" }, kp = {
  key: 0,
  class: "ember-thread"
}, Sp = { class: "ember-journal" }, Rp = { class: "ember-journal" }, Cp = { class: "ember-pack-heading" }, Ep = { key: 0 }, Pp = { key: 1 }, Ap = { class: "ember-relics" }, zp = { key: 0 }, Ip = { key: 1 }, $p = ["disabled", "onClick"], Tp = { class: "ember-dialogue-heading" }, Lp = { class: "ember-person-heading" }, Op = ["disabled"], jp = ["data-message-key"], Np = ["data-message-key", "data-fresh-reply"], Up = {
  key: 0,
  class: "ember-dialogue-issue"
}, Fp = { key: 1 }, Dp = { class: "ember-prose" }, Zp = {
  key: 2,
  class: "ember-prose"
}, Bp = ["aria-busy"], qp = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Wp = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, Hp = { class: "ember-error-detail" }, Vp = { key: 0 }, Gp = { class: "ember-prose" }, Yp = {
  key: 3,
  class: "ember-history-nav"
}, Qp = { class: "ember-passage-actions" }, Kp = ["disabled"], Xp = ["disabled", "onClick"], Jp = ["disabled"], e0 = ["src"], t0 = { class: "ember-prose" }, a0 = ["src"], n0 = { class: "ember-prose" }, r0 = { key: 0 }, s0 = { key: 1 }, o0 = { class: "ember-prose" }, i0 = ["disabled"], l0 = ["disabled"], c0 = ["disabled"], d0 = { class: "ember-pause-actions" }, u0 = ["aria-pressed"], h0 = { class: "ember-help ember-keyboard-help" }, f0 = { class: "ember-help ember-touch-help" }, p0 = /* @__PURE__ */ Fe({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, r = mc(t.bridge, t.chatIdentity), a = gc(r), { view: n, notice: s, busy: i, blocked: l, talking: c, outgoing: o, conversationProgress: u, conversationFailure: h } = r, { current: d, dirty: p } = a, m = W(!0), x = W(!1), b = W(!1), y = W(0), _ = W(!1), S = W(!1), E = W(null), L = W(null), w = W(null), C = W("relics"), R = G(() => w.value === "map" ? B.map : w.value === "journal" ? B.journal : w.value === "build" ? B.build : w.value === "person" ? Ze(A.value) : w.value === "passage" ? se.passages[T.value].title : w.value === "arrival" || w.value === "prologue" ? se.scenes.camp : w.value === "ending" ? gi.title : d.value?.phase === "reward" ? B.reward : d.value?.phase === "lost" ? B.fallen : B.pause), A = W("sanniang"), T = W("warning"), I = W(null), M = W(null), O = W(null), N = W(""), F = G(() => O.value?.operation && !d.value?.facts.includes(O.value.fact) ? O.value.operation : null), V = G(() => F.value?.setup ?? O.value?.body ?? se.passages[T.value].body), H = G(() => !F.value && d.value ? (O.value?.ready ? O.value.witnesses ?? [] : []).filter((D) => es(d.value, D)) : []), te = W({}), ne = G({
      get: () => te.value[A.value] ?? "",
      set: (D) => {
        te.value[A.value] = D;
      }
    }), Ie = W(null), Ge = W(!1), Be = W(null), Pe = W(null), xe = W(null), lt = G((D) => {
      const Z = d.value?.facts ?? [];
      return D && D.size === Z.length && Z.every((U) => D.has(U)) ? D : new Set(Z);
    }), pt = G((D) => {
      const Z = d.value ? Rr(d.value).filter((U) => U.kind === "object").map((U) => U.target.id) : [];
      return D && D.size === Z.length && Z.every((U) => D.has(U)) ? D : new Set(Z);
    }), kt = G(() => d.value ? {
      definition: Se[d.value.location.scene],
      location: d.value.location,
      facts: lt.value,
      people: d.value.people,
      objects: pt.value,
      completedSegments: d.value.completedSegments,
      engagement: d.value.engagement?.id,
      reading: w.value === "passage"
    } : null), ta = G(() => {
      const D = d.value?.battle;
      if (d.value?.engagement?.id !== "beacon" || !D) return "";
      switch (D.script.signal) {
        case "approach":
          return ut.signalApproach;
        case "lighting":
          return ut.signalCountdown(Math.ceil((D.objective.target - D.objective.progress) / K.hz));
        case "lit":
          return ut.signalLit;
        default:
          return "";
      }
    }), Zt = G(() => {
      const D = d.value && hr[d.value.location.scene];
      return D ? { "--scene-art": `url("${D}")` } : void 0;
    }), ve = G(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), _e = G(() => d.value ? zn(d.value) : null), St = G(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : _e.value ? "continue" : void 0), en = G(() => !_.value || !d.value || !!d.value.pendingParley || !!_e.value || m.value || !!w.value || !!s.value || c.value || b.value || t.generationActive || S.value || !!E.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), Je = G(() => d.value?.battle?.enemies.find((D) => ze(D.kind)));
    ue(() => [Je.value?.kind === "furnacemaster" && Je.value.hp > 0 ? Je.value.phase : 0, d.value?.battle?.enemies.filter((D) => D.kind === "coupler" && D.hp > 0).length ?? 0], ([D, Z], [U, qe]) => {
      D && (D === 3 && D !== U ? Ot(Zn.burning, 5500) : Z > qe ? Ot(Zn.connected, 5500) : Z < qe && Ot(Zn.couplerBroken, 3500));
    });
    const Bt = G(() => {
      const D = d.value?.conversations[A.value] ?? [], Z = r.replacingReply.value;
      return Z?.person === A.value ? D.map((U) => U.id === Z.turnId ? Vl(U) : U) : D;
    }), Na = G(() => d.value && !Bt.value.length ? ro(d.value, A.value) : null), Rt = G(() => Ie.value?.person === A.value ? {
      ...Ie.value,
      status: Ge.value ? "sending" : "failed"
    } : o.value?.person === A.value && !o.value.regenerating && !Bt.value.some((D) => D.id === o.value?.actionId) ? o.value : null), qt = G(() => Rt.value?.status === "failed"), tn = G(() => d.value && Jr(d.value, A.value)), Lt = W(null), fe = W(!1);
    let ct;
    function dt() {
      clearTimeout(ct), ct = void 0, fe.value = !1;
    }
    const ot = W(0), Ye = W("");
    let q;
    function Ot(D, Z = 4e3) {
      clearTimeout(q), Ye.value = D, q = setTimeout(() => {
        Ye.value = "";
      }, Z);
    }
    ue(() => d.value?.engagement?.id, (D, Z) => {
      if (D === Z || !d.value) return;
      const U = d.value.facts.includes("return_flow_tested");
      D === "sluice_bridge" && Ot(U ? Ve.bridgeTested : Ve.bridgeUntried, 6500), D === "main_valve" && Ot(U ? Ve.valveTested : Ve.valveUntried, 6500);
    }), ue(() => [d.value?.id, d.value ? Object.keys(d.value.rewards).length : 0], (D, Z) => {
      D[0] && D[0] === Z[0] && D[1] > Z[1] && Ot(ut.cacheReady);
    });
    const ae = G(() => io.flatMap((D) => {
      const Z = n.value?.data.awards.find((U) => U.key === D.key && U.runId === d.value?.id);
      return Z ? [{
        fact: D.fact,
        amount: Z.amount
      }] : [];
    })), Ua = G(() => ae.value.reduce((D, Z) => D + Z.amount, 0)), ya = G(() => d.value ? Ps(d.value).filter((D) => D.task) : []), aa = G(() => d.value ? si(d.value) : null), Fa = G(() => d.value ? hi(d.value) : []), { messages: an, hasOlder: Da, hasNewer: mt, expanded: nn, pendingVisible: na, rememberReading: ba, resetLatest: gt, older: Za, newer: Ct } = vc({
      history: G(() => Na.value ? [Na.value] : Bt.value),
      pending: G(() => !!Rt.value),
      person: A,
      campaignId: G(() => d.value?.id),
      transcript: Be,
      freshReply: Lt,
      talking: c
    }), rn = G(() => d.value?.collection.map((D) => {
      const Z = d.value.equipped.includes(D.id) ? d.value.equipped.filter((U) => U !== D.id) : [...d.value.equipped, D.id];
      return {
        ...D,
        equipped: Z,
        issue: nc(d.value, Z),
        dormant: d.value.equipped.includes(D.id) && !Us(Pr(d.value), D.id)
      };
    }) ?? []), wa = zc(() => {
      r.error.value = oe.presentationError.sound, x.value = !1;
    });
    let xa = !1;
    function ra() {
      if (!w.value && d.value?.phase === "reward") {
        Qe({ type: "leave" });
        return;
      }
      (w.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && et();
    }
    async function sn() {
      await Qe({ type: "resolve_parley" }) && (w.value = null, await zt(), xe.value?.focus());
    }
    async function Tn() {
      _e.value ? await Qe({ type: "accept_reply" }) && w.value === "person" && await et() : await sn();
    }
    Tr(I, ra), bs(() => _.value ? w.value || d.value?.phase === "reward" ? (ra(), !0) : m.value ? !1 : (sa(), !0) : L.value?.back() ?? !1), Tr(Pe, () => {
      !i.value && !b.value && !t.generationActive && r.dismissError();
    });
    function sa() {
      m.value = !0, a.flush();
    }
    function Ln() {
      w.value = null, sa();
    }
    async function _a(D) {
      S.value || E.value || (w.value = D, D === "build" && (C.value = "relics"), await a.flush());
    }
    async function et() {
      if (!S.value && !_e.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await sn();
          return;
        }
        !s.value && !t.generationActive && (_.value = !0, w.value = null, m.value = !1, await zt(), xe.value?.focus());
      }
    }
    function On() {
      _.value = !0, d.value?.pendingParley || _e.value ? (A.value = d.value?.pendingParley?.enemy ?? _e.value, w.value = "person", m.value = !1) : et();
    }
    async function Qe(D) {
      if (S.value || E.value) return !1;
      S.value = !0, D.type === "interact" && d.value && (E.value = Se[d.value.location.scene].exits.find((U) => U.id === D.id)?.to ?? null);
      let Z = !1;
      try {
        return await a.flush() ? (Z = await r.act(D), Z && (a.sync(), D.type === "relic" && Ot(ut.received(da[D.id].name, !!d.value?.equipped.includes(D.id))), !w.value && !m.value && (await zt(), xe.value?.focus())), Z) : !1;
      } finally {
        S.value = !1, Z || (E.value = null);
      }
    }
    function on(D) {
      D === E.value && (E.value = null);
    }
    async function X(D) {
      await Qe({
        type: d.value ? "restart" : "start",
        ...D,
        outfit: ve.value
      }) && (_.value = !0, w.value = "prologue");
    }
    function re() {
      m.value = !0, w.value = null, _.value = !1, a.flush();
    }
    async function Te(D) {
      if (!d.value || S.value || E.value) return;
      dt();
      const Z = [...to(d.value), ...Ja(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((qe) => qe.target.id === D), U = Z?.kind === "object" ? Z.target : null;
      if (U?.kind === "person" || U?.kind === "enemy" || U?.kind === "resident") {
        await oa(U.kind === "enemy" ? U.enemy : U.person);
        return;
      }
      if (U?.kind === "inspect" && (T.value = U.passage, N.value = D, O.value = ac(d.value, U.passage), F.value)) {
        w.value = "passage", await a.flush();
        return;
      }
      await Qe({
        type: "interact",
        id: D
      }) && (U?.kind === "inspect" ? w.value = "passage" : U?.kind === "rest" && (fe.value = !0, ct = setTimeout(dt, 3e3)));
    }
    async function $e() {
      !F.value || !await Qe({
        type: "interact",
        id: N.value
      }) || (await zt(), M.value && (M.value.scrollTop = 0, M.value.focus({ preventScroll: !0 })));
    }
    async function oa(D) {
      !d.value || S.value || !es(d.value, D) || (A.value = D, w.value = "person", await a.flush() && !d.value.conversations[D].length && await r.act({
        type: "greet",
        person: D
      }) && a.sync());
    }
    async function Ma() {
      const D = A.value, Z = ne.value.trim();
      if (!(l.value || Ge.value || !Z || St.value)) {
        te.value[D] = "", Ie.value = {
          person: D,
          text: Z
        }, Ge.value = !0, gt();
        try {
          if (!await a.flush()) return;
          const U = r.talk(D, Z);
          Ie.value = null, await U && a.sync();
        } finally {
          Ge.value = !1;
        }
      }
    }
    async function jn() {
      if (!(l.value || Ge.value || !d.value))
        if (gt(), qt.value && Rt.value) {
          const D = Rt.value, Z = r.talk(D.person, D.text);
          Ie.value = null, await Z && a.sync();
        } else {
          const D = Jr(d.value, A.value);
          D && await r.talk(A.value, D.player, D.id) && a.sync();
        }
    }
    async function Ba() {
      await a.recover() && (m.value = !0, y.value++);
    }
    return ue(() => t.generationActive, (D) => {
      D && sa();
    }), ue(() => [d.value?.pendingParley, _e.value], ([D, Z]) => {
      (D || Z) && (A.value = D?.enemy ?? Z, w.value = "person");
    }, { immediate: !0 }), ue(x, (D) => {
      wa.enable(D);
    }), ue(d, (D) => {
      x.value && D?.battle && wa.tick(D.battle);
    }), ue(() => n.value?.data, (D, Z) => {
      if (!D?.active || !Z?.active || D.active.id !== Z.active.id) {
        ot.value = 0;
        return;
      }
      ot.value += D.awards.filter((ia) => !Z.awards.some((la) => la.key === ia.key)).reduce((ia, la) => ia + la.amount, 0);
      const U = new Set(Z.active.facts), qe = new Set(D.active.facts);
      !U.has("chapter_completed") && qe.has("chapter_completed") && D.active.chapter === "outpost" ? w.value = "ending" : !U.has("captives_arrived") && qe.has("captives_arrived") && (w.value = "arrival");
    }), ue(() => d.value?.id, () => {
      te.value = {}, Ie.value = null;
    }), ue([
      _,
      m,
      w,
      s,
      () => d.value?.id,
      () => d.value?.location.scene
    ], dt), ue([w, A], () => {
      Lt.value = null;
    }), ue(s, (D) => {
      D && (Lt.value = null);
    }), ue(() => [A.value, Bt.value], ([D, Z], [U, qe]) => {
      const ia = Z.filter((la) => la.kind === "dialogue").at(-1);
      D === U && w.value === "person" && ia && !qe.some((la) => la.id === ia.id) && (Lt.value = ia.id);
    }), ga(async () => {
      await r.read(), xa = !0;
    }), pr(() => {
      xa && !p.value && r.read();
    }), Mn(() => {
      Lt.value = null, dt(), sa();
    }), ea(() => {
      clearTimeout(q), dt(), a.dispose(), r.dispose(), wa.dispose();
    }), (D, Z) => (z(), $("section", qf, [
      _.value ? Y("", !0) : (z(), vt(N1, {
        key: 0,
        ref_key: "entry",
        ref: L,
        campaign: g(d),
        ready: !!g(n)?.ready,
        busy: g(i),
        blocked: g(l) || e.generationActive,
        onStart: X,
        onContinue: On
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      _.value && g(d) && kt.value ? (z(), vt(Kd, {
        key: y.value,
        ref_key: "field",
        ref: xe,
        world: kt.value,
        traveler: g(d).traveler,
        paused: en.value,
        transitioning: !!E.value,
        weapon: g(d).weapon,
        outfit: ve.value,
        battle: g(d).battle,
        onInput: g(a).input,
        onInteract: Te,
        onPause: sa,
        onResume: et,
        onError: Z[0] || (Z[0] = (U) => b.value = !0),
        onReady: on
      }, {
        status: Nn(() => [g(d) ? (z(), $(ee, { key: 0 }, [k("div", Wf, [k("meter", {
          min: 0,
          max: g(K).maxHp,
          value: g(d).hp,
          "aria-label": g(oe).hp
        }, null, 8, Hf), k("span", null, P(Math.ceil(g(d).hp)) + " / " + P(g(K).maxHp), 1)]), k("p", Vf, P(g(Jn)(g(d))), 1)], 64)) : Y("", !0)]),
        threat: Nn(() => [
          _.value && Je.value && !w.value ? (z(), $("div", Gf, [k("strong", null, P(g(er)[Je.value.kind]), 1), k("meter", {
            min: "0",
            max: Je.value.maxHp,
            value: Je.value.hp,
            "aria-label": g(er)[Je.value.kind]
          }, null, 8, Yf)])) : Y("", !0),
          _.value && ta.value && !w.value ? (z(), $("div", Qf, P(ta.value), 1)) : Y("", !0),
          _.value && Ye.value && g(d)?.phase === "battle" && !w.value && !m.value && !g(s) ? (z(), $("p", Kf, P(Ye.value), 1)) : Y("", !0)
        ]),
        overlay: Nn(() => [...Z[23] || (Z[23] = [k("span", null, null, -1)])]),
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
      ])) : Y("", !0),
      _.value && E.value && !g(s) && !b.value && !w.value && !m.value ? (z(), $("aside", Xf, P(g(se).transition(g(se).scenes[E.value])), 1)) : Y("", !0),
      _.value && fe.value && !w.value && !m.value && !g(s) ? (z(), $("p", Jf, P(g(se).rested), 1)) : _.value && Ye.value && g(d)?.phase === "exploration" && !w.value && !m.value && !g(s) ? (z(), $("p", ep, P(Ye.value), 1)) : Y("", !0),
      _.value && g(d) && w.value !== "passage" && !g(d).pendingParley && !_e.value ? (z(), $("nav", {
        key: 5,
        class: "ember-tools",
        "aria-label": g(B).prepare
      }, [
        k("button", {
          type: "button",
          disabled: S.value || !!E.value,
          "aria-label": g(B).map,
          onClick: Z[1] || (Z[1] = (U) => _a("map"))
        }, [at(Gt, { name: "map" }), k("span", null, P(g(B).map), 1)], 8, ap),
        k("button", {
          type: "button",
          disabled: S.value || !!E.value,
          "aria-label": g(B).build,
          onClick: Z[2] || (Z[2] = (U) => _a("build"))
        }, [at(Gt, { name: "bag" }), k("span", null, P(g(B).build), 1)], 8, np),
        k("button", {
          type: "button",
          disabled: S.value || !!E.value,
          "aria-label": g(B).journal,
          onClick: Z[3] || (Z[3] = (U) => _a("journal"))
        }, [at(Gt, { name: "journal" }), k("span", null, P(g(B).journal), 1)], 8, rp),
        k("button", {
          type: "button",
          "aria-label": g(B).pause,
          onClick: Ln
        }, [at(Gt, { name: "pause" }), k("span", null, P(g(B).pause), 1)], 8, sp)
      ], 8, tp)) : Y("", !0),
      g(s) || b.value || e.generationActive ? (z(), $("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: Pe,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": g(B).noticeTitle,
        tabindex: "-1"
      }, [k("p", ip, P(b.value ? g(B).renderError : e.generationActive ? g(B).generation : g(s)), 1), b.value ? (z(), $("button", {
        key: 0,
        type: "button",
        onClick: Z[4] || (Z[4] = (U) => {
          b.value = !1, y.value++;
        })
      }, P(g(B).reload), 1)) : g(r).dataInvalid.value && !e.generationActive ? (z(), $(ee, { key: 1 }, [k("p", null, P(g(B).rebuildWarning), 1), k("button", {
        type: "button",
        disabled: g(i),
        onClick: Z[5] || (Z[5] = (...U) => g(r).rebuild && g(r).rebuild(...U))
      }, P(g(B).rebuild), 9, lp)], 64)) : e.generationActive ? Y("", !0) : (z(), $("button", {
        key: 2,
        type: "button",
        disabled: g(i),
        onClick: Z[6] || (Z[6] = (U) => g(r).recoveryRequired.value ? Ba() : g(r).dismissError())
      }, P(g(r).recoveryRequired.value ? g(B).recover : g(B).acknowledge), 9, cp))], 8, op)) : Y("", !0),
      g(h) && !g(s) && (w.value !== "person" || A.value !== g(h).person) ? (z(), $("aside", dp, [
        k("strong", null, P(g(Ze)(g(h).person)), 1),
        k("p", up, P(g(Yt)(g(h))), 1),
        g(h).text ? (z(), $("details", hp, [k("summary", null, P(g(B).receivedReply), 1), k("p", fp, P(g(h).text), 1)])) : Y("", !0),
        k("button", {
          type: "button",
          onClick: Z[7] || (Z[7] = (...U) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...U))
        }, P(g(B).acknowledge), 1)
      ])) : Y("", !0),
      _.value && ot.value && !w.value && !m.value && !g(s) ? (z(), $("aside", pp, [k("span", null, [k("small", null, P(g(B).rewardTitle), 1), k("strong", null, P(g(B).rewardReceived(ot.value)), 1)]), k("button", {
        type: "button",
        "aria-label": g(B).rewardDismiss,
        onClick: Z[8] || (Z[8] = (U) => ot.value = 0)
      }, "×", 8, mp)])) : Y("", !0),
      _.value && g(d) && !g(s) && !b.value && !e.generationActive && (w.value || m.value || g(d).phase === "reward" || g(d).phase === "lost") ? (z(), $("div", {
        key: 9,
        class: "ember-curtain",
        style: Ia(w.value === "person" ? Zt.value : void 0)
      }, [k("section", {
        ref_key: "dialog",
        ref: I,
        class: wt(["ember-panel", {
          "ember-wide": w.value === "map" || w.value === "build" && C.value === "wardrobe",
          "ember-map-panel": w.value === "map",
          "ember-wardrobe-panel": w.value === "build" && C.value === "wardrobe",
          "ember-dialogue": w.value === "person",
          "ember-passage": w.value === "passage"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": R.value,
        tabindex: "-1"
      }, [w.value !== "map" && w.value !== "person" ? (z(), $("header", vp, [
        k("h2", null, P(R.value), 1),
        w.value === "build" ? (z(), $("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": g(B).build
        }, [k("button", {
          type: "button",
          "aria-pressed": C.value === "relics",
          onClick: Z[9] || (Z[9] = (U) => C.value = "relics")
        }, P(g(Me).equipment), 9, bp), k("button", {
          type: "button",
          "aria-pressed": C.value === "wardrobe",
          onClick: Z[10] || (Z[10] = (U) => C.value = "wardrobe")
        }, P(g(B).wardrobe), 9, wp)], 8, yp)) : Y("", !0),
        w.value !== "prologue" && w.value !== "passage" && g(d).pendingParley?.decision !== "attack" && (w.value || g(d).phase !== "lost" && g(d).phase !== "reward") ? (z(), $("button", {
          key: 1,
          type: "button",
          disabled: S.value || !!g(d).pendingParley && g(l),
          onClick: et
        }, P(g(B).close), 9, xp)) : Y("", !0)
      ])) : Y("", !0), w.value === "map" ? (z(), vt(qu, {
        key: 1,
        campaign: g(d),
        onClose: et
      }, null, 8, ["campaign"])) : w.value === "prologue" ? (z(), $(ee, { key: 2 }, [k("p", _p, P(g(B).opening), 1), k("button", {
        class: "ember-primary",
        type: "button",
        onClick: et
      }, P(g(B).start), 1)], 64)) : w.value === "journal" ? (z(), $(ee, { key: 3 }, [
        k("p", Mp, P(g(Jn)(g(d))), 1),
        (z(!0), $(ee, null, ke(ya.value, (U) => (z(), $("section", {
          key: U.person,
          class: "ember-thread"
        }, [k("h3", null, P(U.name) + " · " + P(U.title), 1), k("p", null, P(U.task), 1)]))), 128)),
        aa.value ? (z(), $("section", kp, [k("h3", null, P(aa.value.title), 1), k("p", null, P(aa.value.task), 1)])) : Y("", !0),
        (z(!0), $(ee, null, ke(Fa.value, (U) => (z(), $("section", {
          key: U.person,
          class: "ember-thread"
        }, [k("h3", null, P(U.name) + " · " + P(U.title), 1), k("p", null, P(U.task), 1)]))), 128)),
        k("ol", Sp, [(z(!0), $(ee, null, ke(g(d).facts, (U) => (z(), $("li", { key: U }, P(g(Ya)[U]), 1))), 128))]),
        ae.value.length ? (z(), $(ee, { key: 1 }, [
          k("h3", null, P(g(B).journeyReward(Ua.value)), 1),
          k("ul", Rp, [(z(!0), $(ee, null, ke(ae.value, (U) => (z(), $("li", { key: U.fact }, [Oe(P(g(Ya)[U.fact]) + " ", 1), k("strong", null, P(g(B).rewardReceived(U.amount)), 1)]))), 128))]),
          k("small", null, P(g(B).rewardRule), 1)
        ], 64)) : Y("", !0)
      ], 64)) : w.value === "build" ? (z(), $(ee, { key: 4 }, [C.value === "wardrobe" && g(n) ? (z(), vt(hh, {
        key: 0,
        data: g(n).data,
        traveler: g(d).traveler,
        balance: g(n).balance,
        blocked: g(l),
        weapon: g(d).weapon,
        onCommand: Qe
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : (z(), $(ee, { key: 1 }, [
        k("div", Cp, [k("strong", null, P(g(d).traveler.name), 1), k("span", null, [
          Oe(P(g(Me).genders[g(d).traveler.gender]), 1),
          g(d).traveler.appearanceAge ? (z(), $(ee, { key: 0 }, [Oe(" · " + P(g(Qa)[g(d).traveler.appearanceAge]), 1)], 64)) : Y("", !0),
          Oe(" · " + P(g(Me).identityRole), 1)
        ])]),
        k("small", null, P(g(B).slots(g(d).equipped.length, g(K).relicSlots)), 1),
        k("p", null, P(g(Ht)[g(d).weapon].name) + " · " + P(g(pi)(g(d).weapon)), 1),
        g(Ks)(g(d)) ? Y("", !0) : (z(), $("p", Ep, P(g(ut).restBuild), 1)),
        g(d).collection.length ? Y("", !0) : (z(), $("p", Pp, P(g(B).emptyBuild), 1)),
        k("div", Ap, [(z(!0), $(ee, null, ke(rn.value, (U) => (z(), $("article", { key: U.id }, [
          at(Gt, { name: U.id }, null, 8, ["name"]),
          k("h3", null, [Oe(P(g(da)[U.id].name) + " ", 1), k("small", null, P(g(oe).rank(U.rank)), 1)]),
          k("p", null, P(g(da)[U.id].detail), 1),
          U.issue === "capacity" ? (z(), $("small", zp, P(g(B).loadoutIssue.capacity), 1)) : Y("", !0),
          U.dormant ? (z(), $("small", Ip, P(g(ut).dormantRelic), 1)) : Y("", !0),
          k("button", {
            type: "button",
            disabled: g(l) || !!U.issue,
            onClick: (qe) => Qe({
              type: "loadout",
              equipped: U.equipped
            })
          }, P(g(d).equipped.includes(U.id) ? g(B).takeOff : g(B).putOn), 9, $p)
        ]))), 128))])
      ], 64))], 64)) : w.value === "person" ? (z(), $(ee, { key: 5 }, [
        k("header", Tp, [
          k("div", Lp, [k("h2", null, P(g(Ze)(A.value)), 1), k("small", null, P(g(se).scenes[g(d).location.scene]), 1)]),
          (z(), vt(t1, {
            key: A.value,
            campaign: g(d),
            person: A.value,
            draft: ne.value,
            "memory-state": g(n)?.memories?.[A.value],
            blocked: g(l),
            onRetryMemory: Z[11] || (Z[11] = (U) => g(r).retryMemory(A.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !_e.value && g(d).pendingParley?.decision !== "attack" ? (z(), $("button", {
            key: 0,
            type: "button",
            disabled: !!g(d).pendingParley && g(l),
            onClick: et
          }, P(g(B).close), 9, Op)) : Y("", !0)
        ]),
        k("div", {
          ref_key: "transcript",
          ref: Be,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: Z[16] || (Z[16] = (...U) => g(ba) && g(ba)(...U))
        }, [
          g(Da) ? (z(), $("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: Z[12] || (Z[12] = (...U) => g(Za) && g(Za)(...U))
          }, P(g(he).older), 1)) : Y("", !0),
          (z(!0), $(ee, null, ke(g(an), (U) => (z(), $(ee, { key: U.key }, [U.side === "player" ? (z(), $("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": U.key
          }, [k("small", null, P(g(d).traveler.name), 1), Oe(P(U.turn.player), 1)], 8, jp)) : (z(), $("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": U.key,
            "data-fresh-reply": Lt.value === U.turn.id
          }, [U.turn.issue === "action_rejected" || U.turn.issue === "clothing_rejected" || U.turn.issue === "reply_invalid" || U.turn.issue === "reply_incomplete" ? (z(), $("p", Up, P(g(he).issues[U.turn.issue]), 1)) : Y("", !0), U.turn.kind === "receipt" && U.turn.issue === "reply_invalid" ? (z(), $("details", Fp, [k("summary", null, P(g(he).rawReply), 1), k("p", Dp, P(U.turn.reply), 1)])) : U.turn.kind === "receipt" ? (z(), $("p", Zp, P(U.turn.reply), 1)) : (z(), $(ee, { key: 3 }, [
            at(Bf, {
              person: A.value,
              reply: U.turn.reply,
              performance: U.turn.performance,
              animate: Lt.value === U.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            at(n2, {
              campaign: g(d),
              person: A.value,
              turn: U.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            U.turn.clothing ? (z(), vt(i2, {
              key: 0,
              clothing: U.turn.clothing
            }, null, 8, ["clothing"])) : Y("", !0)
          ], 64))], 8, Np))], 64))), 128)),
          g(na) && Rt.value ? (z(), $(ee, { key: 1 }, [k("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Rt.value.status === "sending"
          }, [k("small", null, P(g(d).traveler.name), 1), Oe(P(Rt.value.text), 1)], 8, Bp), qt.value ? (z(), $("p", qp, P(g(he).sendFailed), 1)) : Y("", !0)], 64)) : Y("", !0),
          !g(mt) && g(h)?.person === A.value && !Bt.value.some((U) => U.id === g(h)?.actionId) ? (z(), $("div", Wp, [
            k("p", Hp, P(g(Yt)(g(h))), 1),
            g(h).text ? (z(), $("details", Vp, [k("summary", null, P(g(B).receivedReply), 1), k("p", Gp, P(g(h).text), 1)])) : Y("", !0),
            k("button", {
              type: "button",
              onClick: Z[13] || (Z[13] = (...U) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...U))
            }, P(g(B).acknowledge), 1)
          ])) : Y("", !0),
          g(nn) ? (z(), $("nav", Yp, [g(mt) ? (z(), $("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: Z[14] || (Z[14] = (...U) => g(Ct) && g(Ct)(...U))
          }, P(g(he).newer), 1)) : Y("", !0), k("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: Z[15] || (Z[15] = (...U) => g(gt) && g(gt)(...U))
          }, P(g(he).latest), 1)])) : Y("", !0)
        ], 544),
        g(u)?.person === A.value ? (z(), vt(Q1, {
          key: 0,
          phase: g(u).phase,
          "started-at": g(u).startedAt
        }, null, 8, ["phase", "started-at"])) : Y("", !0),
        at(W1, {
          modelValue: ne.value,
          "onUpdate:modelValue": Z[17] || (Z[17] = (U) => ne.value = U),
          blocked: g(l) || Ge.value || e.generationActive,
          talking: g(c),
          "can-regenerate": !!tn.value || qt.value,
          retrying: qt.value,
          conclusion: St.value,
          onSend: Ma,
          onRegenerate: jn,
          onContinue: Tn,
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
      ], 64)) : w.value === "passage" ? (z(), $(ee, { key: 6 }, [k("div", {
        ref_key: "passageContent",
        ref: M,
        class: "ember-passage-body",
        tabindex: "0"
      }, [(z(!0), $(ee, null, ke(V.value.split(`

`), (U, qe) => (z(), $("p", {
        key: qe,
        class: "ember-prose"
      }, P(U), 1))), 128))], 512), k("footer", Qp, [
        F.value ? (z(), $("button", {
          key: 0,
          class: "ember-primary",
          type: "button",
          disabled: g(l) || S.value,
          onClick: $e
        }, P(F.value.label), 9, Kp)) : Y("", !0),
        (z(!0), $(ee, null, ke(H.value, (U) => (z(), $("button", {
          key: U,
          type: "button",
          disabled: g(l) || S.value,
          onClick: (qe) => oa(U)
        }, P(g(Ve).talk(g(Ze)(U))), 9, Xp))), 128)),
        k("button", {
          type: "button",
          disabled: S.value,
          onClick: et
        }, P(g(Ve).leave), 9, Jp)
      ])], 64)) : w.value === "arrival" ? (z(), $(ee, { key: 7 }, [
        k("img", {
          class: "ember-story-art",
          src: g(hs).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, e0),
        k("p", t0, P(g(B).received), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: et
        }, P(g(B).resume), 1)
      ], 64)) : w.value === "ending" ? (z(), $(ee, { key: 8 }, [
        k("img", {
          class: "ember-story-art",
          src: g(hs).ending,
          alt: "",
          decoding: "async"
        }, null, 8, a0),
        k("h2", null, P(g(B).endingTitle), 1),
        k("p", n0, P(g(B).ending), 1),
        k("p", null, P(g(B).freeTime), 1),
        g(Ls)(g(d)).optionalRoots ? (z(), $("p", r0, P(g(B).optionalRoots), 1)) : Y("", !0),
        Ua.value ? (z(), $("strong", s0, P(g(B).journeyReward(Ua.value)), 1)) : Y("", !0),
        k("small", null, P(g(B).continued), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          onClick: et
        }, P(g(B).remain), 1)
      ], 64)) : g(d).phase === "reward" ? (z(), vt(Ac, {
        key: 9,
        campaign: g(d),
        blocked: g(l),
        onChoose: Z[18] || (Z[18] = (U, qe) => Qe({
          type: "relic",
          id: U,
          ...qe ? { replace: qe } : {}
        })),
        onLeave: Z[19] || (Z[19] = (U) => Qe({ type: "leave" }))
      }, null, 8, ["campaign", "blocked"])) : g(d).phase === "lost" ? (z(), $(ee, { key: 10 }, [
        k("p", o0, P(g(B).fallenDetail), 1),
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: g(l),
          onClick: Z[20] || (Z[20] = (U) => Qe({ type: "retry" }))
        }, P(g(B).retry), 9, i0),
        k("button", {
          type: "button",
          disabled: g(l),
          onClick: Z[21] || (Z[21] = (U) => Qe({ type: "retreat" }))
        }, P(g(B).retreat), 9, l0)
      ], 64)) : (z(), $(ee, { key: 11 }, [
        k("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!g(s) || e.generationActive,
          onClick: et
        }, P(g(B).resume), 9, c0),
        k("div", d0, [k("button", {
          type: "button",
          "aria-pressed": x.value,
          onClick: Z[22] || (Z[22] = (U) => x.value = !x.value)
        }, P(g(B).sound), 9, u0)]),
        k("details", null, [
          k("summary", null, P(g(Me).controls), 1),
          k("p", h0, P(g(B).controls), 1),
          k("p", f0, P(g(B).touchControls), 1)
        ]),
        k("button", {
          type: "button",
          onClick: re
        }, P(g(Me).title), 1)
      ], 64))], 10, gp)], 4)) : Y("", !0)
    ]));
  }
}), A0 = p0;
export {
  A0 as default
};
