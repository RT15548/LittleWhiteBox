/* eslint-disable */
import { $ as oa, A as Or, D as Be, E as nt, I as zn, J as ws, M as $t, N as yr, P as ea, Q as Zn, R as fa, S as T, T as Fe, U as Se, V as $, W as qn, X as he, at as Wt, b as yt, c as $o, ct as Io, d as wr, dt as ca, ft as P, h as ae, i as jr, l as bs, lt as g, m as Nt, nt as To, p as Lo, q as xs, r as _s, rt as H, u as Oo, ut as xt, v as G, x as Y, y as R } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as ot } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { n as jo, r as Dn, t as No } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { n as Uo, t as Fo } from "./xiaobai-os-conversation-window-no8ylrha.js";
import { t as Zo } from "./xiaobai-os-constants-CDXgazQ7.js";
import { $ as xn, At as qo, Bt as Do, Ct as Bo, D as Ms, Dt as ks, E as Ca, Et as br, Ft as Wo, Gt as ht, Nt as Ss, O as Nr, Ot as Ho, S as Ur, St as Vo, T as Go, Tt as hn, Vt as Fr, _ as Yo, d as Qo, dt as Rs, et as bt, h as Ko, i as Xo, it as xr, kt as Zr, n as Es, o as _n, p as _r, s as Jo, tt as ei, w as ti, wt as ai, y as er, zt as ni } from "./xiaobai-os-three.module-DZLCEE7H.js";
import { t as zs } from "./xiaobai-os-BufferGeometryUtils-BVwpfAe2.js";
import { $ as $a, A as Mr, B as ri, C as Ps, D as Xa, E as Pn, F as pt, G as si, H as Jt, I as tr, J as rt, K as oi, L as v, M as Ke, N as Bn, O as oe, P as ar, Q as Ie, R as _t, S as Ja, T as qr, U as It, V as ii, W as me, X as Kt, Y as X, Z as Cs, _ as li, a as Ht, at as ci, b as di, c as ke, ct as ui, d as nr, et as As, f as Wn, g as $s, h as Is, i as ia, it as Ts, j as kr, k as hi, l as B, lt as Ls, m as pi, n as rr, nt as fi, o as Yt, ot as qe, p as mi, q as Os, r as Pa, rt as gi, s as vi, st as js, t as ie, tt as yi, u as en, v as wi, w as Sr, x as Ns, y as la, z as Us } from "./xiaobai-os-copy-_MN2tyQS.js";
import { n as bi, r as xi, t as _i } from "./xiaobai-os-meshopt_decoder.module-Cy7KYu6P.js";
import { t as Mi } from "./xiaobai-os-GLTFLoader-BUhik4S0.js";
function Cn(e) {
  return e.seed = Math.imul(e.seed, 1664525) + 1013904223 >>> 0, e.seed / 4294967296;
}
function Dr(e, t, r) {
  const a = [...t], n = [];
  for (; a.length && n.length < r; ) n.push(a.splice(Math.floor(Cn(e) * a.length), 1)[0]);
  return n;
}
function Hn() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (e) => e.toString(16).padStart(8, "0")).join("");
}
function ve(e, t) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_${e}`), {
    code: `expedition_${e}`,
    ...t === void 0 ? {} : { cause: t }
  });
}
function Ze(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`expedition_world_${e}`), { code: `expedition_world_${e}` });
}
var ki = 1e-9;
function da(e, t, r) {
  return {
    x: e.origin.x + (t + 0.5) * e.cellSize,
    y: e.origin.y + (r + 0.5) * e.cellSize
  };
}
function ua(e, t) {
  return {
    column: Math.floor((t.x - e.origin.x) / e.cellSize),
    row: Math.floor((t.y - e.origin.y) / e.cellSize)
  };
}
function Fs(e, t) {
  const r = e.rows[0]?.length ?? 0, a = e.rows.length;
  (!r || !a || !Number.isFinite(e.cellSize) || e.cellSize <= 0 || !Number.isFinite(e.origin.x) || !Number.isFinite(e.origin.y) || e.rows.some((c) => c.length !== r || /[^.# ]/.test(c))) && Ze("map_invalid");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const c of e.gates) {
    (!c.id || n.has(c.id) || !c.cells.length) && Ze("map_invalid"), n.add(c.id);
    const o = !t.has(c.id);
    o && l.add(c.id);
    for (const { column: u, row: h } of c.cells) {
      (!Number.isInteger(u) || !Number.isInteger(h) || u < 0 || u >= r || e.rows[h]?.[u] !== ".") && Ze("map_invalid");
      const d = h * r + u;
      s.has(d) && Ze("map_invalid"), s.add(d), o && i.add(d);
    }
  }
  for (const c of t) n.has(c) || Ze("gate_unknown");
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
function Mn(e, t, r, a) {
  const n = Math.max(t - e.x, 0, e.x - t - a), s = Math.max(r - e.y, 0, e.y - r - a);
  return n * n + s * s;
}
function pn(e, t, r) {
  const a = r.x - t.x, n = r.y - t.y, s = a * a + n * n, i = s === 0 ? 0 : Math.max(0, Math.min(1, ((e.x - t.x) * a + (e.y - t.y) * n) / s));
  return (e.x - t.x - a * i) ** 2 + (e.y - t.y - n * i) ** 2;
}
function Zs(e, t, r, a, n) {
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
function Si(e, t, r, a, n) {
  return Zs(e, t, r, a, n) ? 0 : Math.min(Mn(e, r, a, n), Mn(t, r, a, n), pn({
    x: r,
    y: a
  }, e, t), pn({
    x: r + n,
    y: a
  }, e, t), pn({
    x: r,
    y: a + n
  }, e, t), pn({
    x: r + n,
    y: a + n
  }, e, t));
}
function He(e, t, r, a = 0) {
  (![
    t.x,
    t.y,
    r.x,
    r.y,
    a
  ].every(Number.isFinite) || a < 0) && Ze("input_invalid");
  const { map: n } = e, s = n.cellSize, i = ua(n, {
    x: Math.min(t.x, r.x) - a,
    y: Math.min(t.y, r.y) - a
  }), l = ua(n, {
    x: Math.max(t.x, r.x) + a,
    y: Math.max(t.y, r.y) + a
  });
  for (let c = i.row; c <= l.row; c++) for (let o = i.column; o <= l.column; o++) {
    if (!e.blocked(o, c)) continue;
    const u = n.origin.x + o * s, h = n.origin.y + c * s;
    if (a === 0 ? Zs(t, r, u, h, s) || Mn(t, u, h, s) === 0 && Mn(r, u, h, s) === 0 : Si(t, r, u, h, s) < a * a - ki) return !1;
  }
  return !0;
}
var Tt = (e, t, r) => He(e, t, t, r);
function Rr(e, t, r, a) {
  [r.x, r.y].every(Number.isFinite) || Ze("input_invalid"), Tt(e, t, a) || Ze("position_blocked");
  const n = Math.hypot(r.x, r.y);
  if (n === 0) return;
  const s = Math.ceil(n / (e.map.cellSize / 4)), i = r.x / s, l = r.y / s;
  for (let c = 0; c < s; c++) {
    const o = {
      x: t.x + i,
      y: t.y + l
    };
    if (He(e, t, o, a)) {
      Object.assign(t, o);
      continue;
    }
    const u = Math.abs(i) >= Math.abs(l) ? ["x", "y"] : ["y", "x"];
    for (const h of u) {
      const d = {
        ...t,
        [h]: t[h] + (h === "x" ? i : l)
      };
      He(e, t, d, a) && Object.assign(t, d);
    }
  }
}
function vn(e, t) {
  return e.x >= t.x - t.width / 2 && e.x < t.x + t.width / 2 && e.y >= t.z - t.depth / 2 && e.y < t.z + t.depth / 2;
}
function we(e) {
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
  ].every(Number.isInteger)) && Ze("map_invalid");
  const s = t.features.map((u) => u.id);
  new Set(s).size !== s.length && Ze("map_invalid"), t.features.some((u) => [
    "tree",
    "tower",
    "wall",
    "arch",
    "column",
    "root",
    "kiln",
    "hoist",
    "cliff"
  ].includes(u.kind) && (u.height === void 0 || !Number.isFinite(u.height) || u.height <= 0)) && Ze("map_invalid");
  for (const u of n.slice(1)) (u.x - u.width / 2 < a.x || u.z - u.depth / 2 < a.y || u.x + u.width / 2 > a.x + r.width || u.z + u.depth / 2 > a.y + r.depth) && Ze("map_invalid");
  t.roads.some((u) => !Number.isFinite(u.width) || u.width <= 0 || u.points.length < 2 || u.points.some(([h, d], f) => !Number.isFinite(h) || !Number.isFinite(d) || f > 0 && h === u.points[f - 1][0] && d === u.points[f - 1][1])) && Ze("map_invalid");
  const i = [];
  for (let u = 0; u < r.depth; u++) {
    let h = "";
    for (let d = 0; d < r.width; d++) {
      const f = {
        x: a.x + d + 0.5,
        y: a.y + u + 0.5
      };
      h += t.features.some((m) => m.kind !== "arch" && vn(f, m.footprint) && (m.kind !== "bridge" || Math.abs(f.y - m.footprint.z) >= m.footprint.depth / 2 - 1)) ? "#" : ".";
    }
    i.push(h);
  }
  const l = {
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
  }, c = Fs(l, new Set(l.gates.map((u) => u.id)));
  Object.values(e.anchors).some((u) => !Tt(c, u, X.playerRadius)) && Ze("map_invalid");
  const o = /* @__PURE__ */ new Set();
  for (const u of [...e.exits, ...e.objects])
    (!e.anchors[u.anchor] || o.has(u.id)) && Ze("map_invalid"), o.add(u.id);
  return {
    ...e,
    map: l,
    gates: t.gates
  };
}
var Ri = we({
  id: "camp",
  safe: !0,
  anchors: {
    ...Object.fromEntries(Bn.map((e) => [e.to, e.position])),
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
    ...Bn.map((e) => ({
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
    Sr.object
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
    ].map((e) => Bn.some((t) => t.building === e.id) ? {
      ...e,
      entrance: !0
    } : e)
  }
}), Ei = we({
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
}), zi = we({
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
}), Pi = we({
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
}), Ci = we({
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
}), Ai = we({
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
}), $i = we({
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
      condition: { all: la }
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
}), Ii = we({
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
}), Ti = Object.fromEntries(Object.entries(ar).map(([e, t]) => {
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
})), Li = we({
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
}), Oi = we({
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
}), ji = we({
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
}), Ni = we({
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
}), Ui = we({
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
}), Fi = we({
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
}), Zi = we({
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
}), qi = we({
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
}), Di = {
  south_street: Li,
  workshop_street: Oi,
  heat_station: ji,
  pipe_gallery: Ni,
  sluice_bridge: Ui,
  main_valve: Fi,
  deep_waterway: Zi,
  coal_store: qi
}, De = {
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
}, ma = Object.keys(De), Bi = we({
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
}), Wi = we({
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
}), Hi = we({
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
}), Vi = we({
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
}), Gi = we({
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
}), Yi = we({
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
}), Qi = we({
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
}), Ki = we({
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
}), Xi = we({
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
}), Ji = {
  furnace_terrace: Bi,
  snow_road: Wi,
  old_kiln: Hi,
  return_bridge: Vi,
  furnace_quarter: Gi,
  furnace_lift: Yi,
  furnace_scaffold: Qi,
  furnace_antechamber: Ki,
  furnace_heart: Xi
}, el = {
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
function tl(e) {
  const t = el[e.id];
  return t ? we({
    ...e,
    anchors: {
      ...e.anchors,
      ...t.anchors
    },
    exits: [...e.exits, ...t.exits],
    objects: [...e.objects, ...t.objects]
  }) : e;
}
var Aa = {
  camp: Ri,
  crossroads: Ei,
  gate: zi,
  beacon: Pi,
  waterway: Ci,
  cells: Ai,
  hall: $i,
  roots: Ii,
  ...Ti,
  ...Di,
  ...Ji
};
for (const e of Object.keys(Aa)) Aa[e] = tl(Aa[e]);
for (const e of ma) {
  const { scene: t, anchor: r } = De[e], a = Aa[t];
  Aa[t] = we({
    ...a,
    objects: [...a.objects, {
      id: e,
      anchor: r,
      kind: "resident",
      person: e
    }]
  });
}
var Re = Aa;
function Br(e) {
  return !e || Re[e.location.scene].safe && e.phase === "exploration";
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
function Vn(e, t) {
  const r = At[t];
  return t === "traveler" || e.purchases.some((a) => a.id === t) || r.achievement !== null && e.awards.some((a) => a.key === r.achievement);
}
var Ee = (e, t, r = 0) => ({
  family: e,
  chapter: r,
  ...t ? { requires: [t] } : {}
}), de = (e, t = 0) => ({
  family: e,
  weapons: [e],
  chapter: t
}), Ia = {
  "storm-step": Ee("storm"),
  conductor: Ee("storm", [
    "storm-step",
    "orbit",
    "momentum",
    "command"
  ]),
  momentum: Ee("storm"),
  cinder: Ee("fire"),
  wildfire: Ee("fire", ["cinder", "inferno"]),
  "blood-price": Ee("risk"),
  frost: Ee("frost"),
  shatter: Ee("frost", [
    "frost",
    "nova",
    "pinning",
    "trapper",
    "orbitals"
  ]),
  echo: Ee("skill"),
  hunter: {
    ...Ee("bow"),
    weapons: [
      "bow",
      "staff",
      "grimoire",
      "cannon"
    ]
  },
  piercing: Ee("blade"),
  orbit: Ee("storm"),
  thorns: Ee("guard"),
  aegis: Ee("guard"),
  siphon: Ee("life"),
  focus: Ee("skill"),
  renewal: Ee("life"),
  execution: Ee("blade"),
  "last-stand": Ee("guard", void 0, 1),
  quicksilver: Ee("skill"),
  magnet: Ee("skill"),
  wardstone: Ee("guard"),
  pilgrim: Ee("life"),
  gambit: Ee("risk", void 0, 1),
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
}, O = (e, t) => e.relics.find((r) => r.id === t)?.rank ?? 0;
function al(e) {
  return Os.filter((t) => !Ia[t].weapons || Ia[t].weapons.includes(e));
}
function qs(e, t, r = null) {
  const a = Ia[t];
  return (!a.weapons || a.weapons.includes(e.weapon)) && (!a.requires || a.requires.every((n) => n.some((s) => s !== r && O(e, s) > 0)));
}
var Qt = Math.PI * 2, K = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), ue = (e, t) => Math.atan2(t.y - e.y, t.x - e.x), Er = (e) => (e - 1) * Math.PI / 4 - Math.PI / 2, Xe = (e, t, r) => ({
  x: e.x + Math.cos(t) * r,
  y: e.y + Math.sin(t) * r
});
function ct(e, t, r, a, n, s) {
  if (s) {
    Rr(s.space, t, {
      x: Math.cos(r) * a,
      y: Math.sin(r) * a
    }, n);
    return;
  }
  t.x += Math.cos(r) * a, t.y += Math.sin(r) * a;
  for (const i of e.obstacles) {
    const l = K(t, i), c = n + i.radius;
    if (l < c) {
      const o = l < 1e-3 ? r : ue(i, t);
      t.x = i.x + Math.cos(o) * c, t.y = i.y + Math.sin(o) * c;
    }
  }
  t.x = Math.max(-X.arena + n, Math.min(X.arena - n, t.x)), t.y = Math.max(-X.arena + n, Math.min(X.arena - n, t.y));
}
function nl(e, t, r, a) {
  const n = e.x - t.x, s = e.y - t.y, i = Math.max(0, Math.min(a, n * Math.cos(r) + s * Math.sin(r)));
  return Math.hypot(n - Math.cos(r) * i, s - Math.sin(r) * i);
}
var rl = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
], Gn = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function ha(e, t, r, a) {
  if (!Tt(e, t, a) || !Tt(e, r, a)) return null;
  if (He(e, t, r, a)) return [{ ...r }];
  const { map: n, columns: s, rows: i } = e, l = ua(n, t), c = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), h = [];
  function d(m) {
    return da(n, m % s, Math.floor(m / s));
  }
  function f(m, x, w, y) {
    if (m < 0 || m >= s || x < 0 || x >= i) return;
    const _ = x * s + m;
    u.has(_) || (c.get(_) ?? 1 / 0) <= w || (c.set(_, w), o.set(_, y), h.push({
      id: _,
      score: w + Gn(d(_), r)
    }));
  }
  for (let m = -1; m <= 1; m++) for (let x = -1; x <= 1; x++) {
    const w = l.column + x, y = l.row + m, _ = da(n, w, y);
    He(e, t, _, a) && f(w, y, Gn(t, _), -1);
  }
  for (; h.length; ) {
    h.sort((w, y) => y.score - w.score || y.id - w.id);
    const { id: m } = h.pop();
    if (u.has(m)) continue;
    u.add(m);
    const x = d(m);
    if (He(e, x, r, a)) {
      const w = [{ ...r }];
      let y = m;
      for (; y !== -1; )
        w.push(d(y)), y = o.get(y);
      w.reverse();
      const _ = [];
      let k = t;
      for (let z = 0; z < w.length; ) {
        let L = z;
        for (; L + 1 < w.length && He(e, k, w[L + 1], a); ) L++;
        k = w[L], _.push(k), z = L + 1;
      }
      return _;
    }
    for (const [w, y] of rl) {
      const _ = m % s + w, k = Math.floor(m / s) + y, z = da(n, _, k);
      He(e, x, z, a) && f(_, k, c.get(m) + Gn(x, z), m);
    }
  }
  return null;
}
var Wr = (e) => !Ie(e) || [
  "warden",
  "thornheart",
  "keeper",
  "bridgekeeper",
  "heatkeeper",
  "kilnheart",
  "furnacemaster"
].includes(e), Hr = /* @__PURE__ */ new WeakMap();
function Ds(e, t) {
  let r = Hr.get(e);
  r || (r = /* @__PURE__ */ new WeakMap(), Hr.set(e, r));
  let a = r.get(t);
  return a || (a = {
    ...e,
    blocked(n, s) {
      const i = da(e.map, n, s);
      return i.x < t.left || i.x > t.right || i.y < t.top || i.y > t.bottom || e.blocked(n, s);
    }
  }, r.set(t, a)), a;
}
var ce = (e, t, r, a = 0) => !e || He(e.space, t, r, a);
function Ft(e, t, r, a, n) {
  let s = 0;
  for (let i = 0.2; i <= a + 0.2; i += 0.2) {
    const l = Math.min(i, a), c = {
      x: t.x + Math.cos(r) * l,
      y: t.y + Math.sin(r) * l
    };
    if (!He(e.space, t, c, n)) break;
    s = l;
  }
  return s;
}
function sl(e, t, r) {
  return e.summonPoints.filter((a) => Tt(e.space, a, r) && ha(e.space, e.entry, a, r)).sort((a, n) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(n.x - t.x, n.y - t.y))[0] ?? null;
}
function Bs(e, t, r) {
  return !e || He(e.space, t, r, 0.3) ? r : {
    x: t.x,
    y: t.y
  };
}
function zr(e, t, r, a) {
  if (!e) return Math.atan2(r.y - t.y, r.x - t.x);
  let n = r;
  if (!Tt(e.space, n, a)) {
    const i = [], l = a + e.space.map.cellSize, c = ua(e.space.map, {
      x: r.x - l,
      y: r.y - l
    }), o = ua(e.space.map, {
      x: r.x + l,
      y: r.y + l
    });
    for (let h = Math.max(0, c.row); h <= Math.min(e.space.rows - 1, o.row); h++) for (let d = Math.max(0, c.column); d <= Math.min(e.space.columns - 1, o.column); d++) {
      const f = da(e.space.map, d, h);
      Math.hypot(f.x - r.x, f.y - r.y) <= a + e.space.map.cellSize && Tt(e.space, f, a) && He(e.space, f, r) && i.push(f);
    }
    i.sort((h, d) => Math.hypot(h.x - r.x, h.y - r.y) - Math.hypot(d.x - r.x, d.y - r.y));
    const u = i.find((h) => ha(e.space, t, h, a));
    if (!u) return null;
    n = u;
  }
  const s = ha(e.space, t, n, a);
  return s?.length ? Math.atan2(s[0].y - t.y, s[0].x - t.x) : null;
}
function xe(e, t, r, a = 1, n = 0) {
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
function Ue(e, t, r, a, n = !1) {
  if (!Ie(t) && e.enemies.filter((c) => c.hp > 0).length >= (a?.enemyLimit ?? X.maxEnemies)) return null;
  if (a && !n) {
    const c = sl(a, r, me[t].radius);
    if (!c) return null;
    r = c;
  }
  const s = me[t], i = (a?.segment && t === "warden" ? qe.wardenHp : a?.segment && t === "thornheart" ? qe.heartHp : a?.segment && t === "keeper" ? qe.keeperHp : s.hp) * (Ie(t) ? 1 : (1 + e.chapter * 0.2 + (e.elite ? 0.25 : 0)) * (a?.segment ? qe.mobHp : 1)), l = {
    id: ++e.serial,
    kind: t,
    x: r.x,
    y: r.y,
    hp: i,
    maxHp: i,
    angle: Math.PI / 2,
    cooldown: 35 + Math.floor(Cn(e) * 20),
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
function Zt(e, t, r, a, n, s = {}) {
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
function ge(e, t, r, a, n, s, i, l = !1, c = {}) {
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
function Qe(e, t, r, a, n) {
  return ge(e, t, "slam", r, a, 8, n);
}
function ze(e, t, r, a, n, s, i) {
  return ge(e, t, "beam", 0, s, 9, i, !1, {
    angle: r,
    length: a,
    width: n
  });
}
function Ct(e, t, r, a, n, s, i = 0.22) {
  for (let l = 0; l < a; l++) Zt(e, t, r + (a === 1 ? 0 : l / (a - 1) - 0.5) * n, s, !1, { speed: i });
}
function Vr(e, t, r, a, n, s = 0.16) {
  for (let i = 0; i < r; i++) Zt(e, t, a + i * Qt / r, n, !1, { speed: s });
}
function sr(e, t, r, a, n = 0) {
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
var fn = (e) => e === "attack" || e === "skill";
function ol(e, t, r) {
  const a = ue(t, t.target), n = t.pattern++ % 3, s = (l, c, o, u, h) => ze(e, t, l, Ft(r, t, l, c, o), o, u, h);
  if (t.kind === "kilnheart") {
    if (n === 0) s(a, 19, 1.1, 32, 23);
    else if (n === 1) ge(e, t, "ring", 8, 39, 10, 25, !1, {
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
      const c = Ue(e, "coupler", l, r);
      c && (c.hp = c.maxHp = r.furnacePrepared ? $a.preparedCouplerHp : $a.couplerHp);
    }
    t.memory = r.summonPoints.map((l) => ({ ...l })), xe(e, t, "burst", 4);
  }
  const i = e.enemies.some((l) => l.kind === "coupler" && l.hp > 0);
  if (n === 0) {
    const l = Ft(r, t, a, Math.min(8, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), 1.45);
    t.motionAngle = a, t.motion = Math.floor(l / 0.32), t.stun = 30;
    const c = ze(e, t, a, l, 1.45, 30, 0);
    c.life = Math.max(1, t.motion), t.exposed = Math.max(t.exposed, 30 + t.motion + (t.phase === 3 ? 105 : 75));
  } else if (n === 1)
    Qe(e, Xe(t, a, Ft(r, t, a, 3, 0.4)), 3.8, 32, 29), i && s(a + (t.pattern % 2 ? 1 : -1) * 0.9, 22, 1.2, 53, 24), t.stun = 54, t.exposed = Math.max(t.exposed, t.phase === 3 ? 185 : 145);
  else {
    for (const l of [-1, 1]) s(a + l * 0.65, 26, 1.3, 40, 27);
    t.phase === 3 && i && Qe(e, t.target, 2.8, 65, 25), t.stun = 66, t.exposed = Math.max(t.exposed, t.phase === 3 ? 200 : 155);
  }
}
function il(e, t) {
  if (t.kind === "coupler") {
    const r = e.enemies.find((a) => a.kind === "furnacemaster" && a.hp > 0);
    r && (r.stun = Math.max(r.stun, $a.couplerStun), r.exposed = Math.max(r.exposed, $a.couplerExposed), r.motion = 0, r.windup = 0, xe(e, r, "guard", 3));
  } else if (t.kind === "furnacemaster")
    for (const r of e.enemies) r.kind === "coupler" && (r.hp = 0);
}
function Ws(e, t) {
  if (e.player.hp <= 0) return;
  const r = Math.min(X.maxHp - e.player.hp, t);
  e.player.hp += r, r > 0 && xe(e, e.player, "heal");
}
function qt(e, t, r) {
  if (Ie(t.kind)) {
    if (t.controlRecovery > 0 || (t.stagger += r, t.stagger < 100)) return;
    t.stagger = 0, r = 24, t.controlRecovery = qe.bossControlRecovery;
  }
  t.stun = Math.max(t.stun, r), t.windup = 0, t.motion = 0, t.cooldown = Math.max(20, t.cooldown), xe(e, t, "guard", 1.4);
}
function st(e, t, r, a, n, s = e.player, i) {
  if (t.hp <= 0 || !ce(i, s, t)) return;
  const l = t.burn > 0 || fn(n) && O(a, "cinder") > 0, c = t.chill > 0 || fn(n) && O(a, "frost") > 0, o = (n === "skill" || n === "companion" && a.weapon === "cannon") && c && O(a, "shatter") > 0, u = fn(n) && l && c && O(a, "overload") > 0;
  let h = r * (O(a, "blood-price") ? rt.bloodDamage + (O(a, "blood-price") - 1) * 0.12 : 1);
  if (O(a, "execution") && t.hp / t.maxHp < rt.executeThreshold && (h *= rt.executeDamage + (O(a, "execution") - 1) * 0.1), t.exposed > 0 && (h *= 1.25), (t.kind === "guard" || i && t.kind === "warden" && js(t.phase)) && n === "attack" && Math.cos(ue(t, s) - t.angle) > 0.4 && t.exposed <= 0 && (h *= O(a, "shield-break") ? 0.8 : 0.35), t.kind !== "priest" && !Ie(t.kind) && e.enemies.some((d) => d.kind === "priest" && d.hp > 0 && K(t, d) < 3.5 && ce(i, t, d)) && (h *= 0.7), n === "attack" && O(a, "backstab") && Math.cos(ue(t, e.player) - t.angle) < -0.3 && (h *= 1.6 + O(a, "backstab") * 0.2, t.exposed = Math.max(t.exposed, 55)), n === "attack" && O(a, "duelist") && qt(e, t, 9 * O(a, "duelist")), o) {
    h += 15 * O(a, "shatter"), t.chill = 0, xe(e, t, "burst", 2.2);
    for (const d of e.enemies) d.id !== t.id && K(t, d) < 2.2 && st(e, d, 9 * O(a, "shatter"), a, "passive", t, i);
  }
  if (fn(n) && (O(a, "cinder") && (t.burn = Math.max(t.burn, 80 + O(a, "cinder") * 25)), O(a, "frost") && (t.chill = Math.max(t.chill, 45 + O(a, "frost") * 20)), (O(a, "blood-dance") || O(a, "hemorrhage")) && (t.bleed = 100 + 25 * (O(a, "blood-dance") + O(a, "hemorrhage"))), O(a, "venom") && (t.poison = 100 + O(a, "venom") * 35), u && (h += 20 * O(a, "overload"), xe(e, t, "lightning")), n === "skill" && O(a, "hunter-mark") && (t.exposed = Math.max(t.exposed, 100 + O(a, "hunter-mark") * 40)), O(a, "inferno") && l && n === "skill" && ge(e, t, "fire", 1.5 + O(a, "inferno") * 0.3, 0, 70, 4 * O(a, "inferno"), !0)), u && (t.burn = 0), (u || o) && (t.chill = 0), t.hp = Math.max(0, t.hp - h), t.marked = 5, n === "lightning" && O(a, "momentum") && e.tick % 6 === 0 && (e.player.dash = Math.max(0, e.player.dash - O(a, "momentum") * 2)), !(t.hp > 0)) {
    if (il(e, t), e.kills++, xe(e, t, "burst", Ie(t.kind) ? 3 : 0.8), O(a, "wildfire") && l && ge(e, t, "fire", 1.8 + O(a, "wildfire") * 0.2, 0, 90, 3 * O(a, "wildfire"), !0), O(a, "fracture") && c) for (let d = 0; d < 4 + O(a, "fracture"); d++) Zt(e, t, d * Qt / (4 + O(a, "fracture")), 9, !0, { source: "passive" });
    if (O(a, "siphon") && (e.kills % rt.siphonEvery === 0 || Ie(t.kind)) && Ws(e, (Ie(t.kind) ? rt.siphonBossHeal : rt.siphonHeal) + O(a, "siphon") - 1), O(a, "execution-chain") && (e.player.dash = Math.max(0, e.player.dash - 12 * O(a, "execution-chain")), e.player.skill = Math.max(0, e.player.skill - 8)), O(a, "soul-harvest") && (e.player.resource = Math.min(It.maxPower, e.player.resource + 9 * O(a, "soul-harvest"))), n === "companion" && O(a, "salvage") && (e.player.skill = Math.max(0, e.player.skill - 12 * O(a, "salvage"))), O(a, "magnet"))
      for (const d of e.enemies) d.hp > 0 && d.kind !== "coupler" && K(t, d) < 3 + O(a, "magnet") && ce(i, t, d) && ct(e, d, ue(d, t), 0.7, me[d.kind].radius, i);
  }
}
function or(e, t, r, a, n, s = e.player) {
  const i = [t];
  if (ce(n, s, t)) {
    O(r, "conductor") && i.push(...e.enemies.filter((l) => l.id !== t.id && l.hp > 0 && K(l, t) < 4.5 && ce(n, t, l)).sort((l, c) => K(l, t) - K(c, t)).slice(0, O(r, "conductor") + 1));
    for (const l of i)
      xe(e, l, "lightning"), st(e, l, a, r, "lightning", n ? l === t ? s : t : e.player, n);
  }
}
function Hs(e, t, r) {
  const a = e.player, n = a.guard > 0;
  a.resource = Math.min(100, a.resource + (n ? 25 : 8)), xe(e, a, n ? "parry" : "block", n ? 2 : 1, a.facing), n && (a.skill = Math.max(35, a.skill - 15));
  const s = O(t, "riposte"), i = O(t, "thorns");
  if (s || i)
    for (const l of e.enemies) K(l, a) < 3.2 + s * 0.3 && ce(r, a, l) && (st(e, l, (n ? 20 : 8) * s + 9 * i, t, "passive", a, r), qt(e, l, n ? 20 : 7));
}
function An(e, t, r, a) {
  const n = e.player;
  if (n.invulnerable > 0 || n.hp <= 0) return;
  if (n.shield > 0) {
    Hs(e, r, a), n.invulnerable = n.guard > 0 ? 8 : 4;
    return;
  }
  let s = t * Kt[r.weapon].guard * (O(r, "blood-price") ? rt.bloodHurt : 1) * (O(r, "gambit") ? 1.2 : 1);
  const i = Math.min(n.ward, s);
  if (n.ward -= i, s -= i, n.hp <= s && O(r, "last-stand") && !n.rescues) {
    n.rescues++, n.hp = 15 + O(r, "last-stand") * 8, n.invulnerable = 60, xe(e, n, i > 0 ? "ward-break" : "guard", 3);
    return;
  }
  if (n.hp = Math.max(0, n.hp - s), e.damageTaken += s, n.invulnerable = 18, n.lastHit = e.tick, xe(e, n, i > 0 ? n.ward > 0 ? "ward-hit" : "ward-break" : "hit"), O(r, "thorns"))
    for (const l of e.enemies) K(l, n) < 3 && st(e, l, 10 * O(r, "thorns"), r, "passive", n, a);
}
function Qa(e, t, r = 45) {
  e.ward += Math.max(0, Math.min(t, r - e.ward));
}
function Gr(e, t, r, a = !1, n) {
  const s = Kt[t.weapon], i = e.player, l = ue(i, r), c = (a ? 0.6 : 1) * (O(t, "gambit") ? 1 + O(t, "gambit") * 0.12 : 1);
  if (i.facing = l, i.swing = t.weapon === "cannon" ? 15 : 8, t.weapon === "blade" || t.weapon === "daggers") {
    const d = s.range + O(t, "piercing") * 0.25;
    xe(e, i, "slash", d, l);
    for (const f of e.enemies)
      K(i, f) > d + me[f.kind].radius || Math.cos(ue(i, f) - l) < -0.1 || !ce(n, i, f) || (st(e, f, s.damage * c, t, "attack", i, n), t.weapon === "blade" && !a && i.combo % 3 === 2 && qt(e, f, 14));
    t.weapon === "blade" && (i.resource = Math.min(100, i.resource + 9), O(t, "cleave-wave") && i.combo % 3 === 2 && Zt(e, i, l, 14 * O(t, "cleave-wave"), !0, {
      pierce: 5,
      radius: 0.4,
      speed: 0.3,
      source: "passive"
    }));
    return;
  }
  let o = s.damage * c;
  O(t, "distance-draw") && (o *= 1 + Math.min(1, K(i, r) / 8) * 0.15 * O(t, "distance-draw")), t.weapon === "staff" && (i.resource = Math.min(100, i.resource + 18)), t.weapon === "grimoire" && (i.resource = Math.min(It.maxPower, i.resource + 12));
  const u = O(t, "piercing") * rt.extraPierce + O(t, "railgun") * 2, h = Zt(e, i, l, o, !0, {
    pierce: u,
    speed: t.weapon === "bow" ? 0.38 : 0.28,
    splash: t.weapon === "staff" ? 1.4 : t.weapon === "cannon" ? 1.8 + O(t, "shrapnel") * 0.3 : 0,
    bounce: O(t, "ricochet"),
    radius: t.weapon === "cannon" ? 0.3 : 0.16
  });
  if (t.weapon === "bow" && O(t, "split-arrow") && i.combo % 3 === 2) for (const d of [-0.18, 0.18]) Zt(e, i, l + d, o * (0.35 + O(t, "split-arrow") * 0.1), !0, {
    speed: h.speed,
    pierce: u
  });
}
function ll(e, t, r, a) {
  const n = e.player, s = Kt[t.weapon], i = O(t, "focus");
  switch (n.skill = Math.round(s.skillCooldown * (i ? rt.focusSkill - (i - 1) * 0.06 : 1)), O(t, "aegis") && (n.shield = 18 + O(t, "aegis") * 6, n.guard = 8, Qa(n, O(t, "aegis") * 6)), t.weapon) {
    case "blade": {
      n.shield = 26 + O(t, "aegis") * 6, n.guard = 9;
      const l = 1 + n.resource / 100;
      n.resource = 0, xe(e, n, "slash", 3.6, n.facing);
      for (const c of e.enemies)
        c.hp <= 0 || K(n, c) > 3.6 + me[c.kind].radius || !ce(a, n, c) || (O(t, "shield-break") && (c.exposed = Math.max(c.exposed, 70 + 30 * O(t, "shield-break"))), st(e, c, s.skill * l, t, "skill", n, a), qt(e, c, 40), !Ie(c.kind) && c.kind !== "coupler" && ct(e, c, ue(n, c), 1.5, me[c.kind].radius, a));
      O(t, "valor") && Qa(n, 12 * O(t, "valor") * l);
      break;
    }
    case "bow":
      for (let l = -2; l <= 2; l++) Zt(e, n, n.facing + l * 0.15, s.skill, !0, {
        pierce: 6,
        speed: 0.42,
        source: "skill"
      });
      ct(e, n, n.facing + Math.PI, 0.85, X.playerRadius, a);
      break;
    case "staff": {
      const l = r ?? n, c = 1 + n.resource / 125;
      if (n.resource = 0, O(t, "convergence"))
        for (const o of e.enemies) o.kind !== "coupler" && K(o, l) < 4 + O(t, "convergence") && ce(a, l, o) && ct(e, o, ue(o, l), 1.2, me[o.kind].radius, a);
      for (let o = 0; o < 3; o++) {
        const u = Xe(l, o * Qt / 3, 0.7);
        ge(e, ce(a, l, u) ? u : l, "slam", 2.3, 10 + o * 10, 1, s.skill * c, !0, { source: "skill" });
      }
      if (O(t, "nova")) {
        ge(e, n, "frost", 3 + O(t, "nova") * 0.5, 0, 32, 6 * O(t, "nova"), !0, { source: "skill" });
        for (const o of e.enemies) K(n, o) < 3.5 && ce(a, n, o) && (o.chill = 120, qt(e, o, 25));
      }
      break;
    }
    case "daggers":
      if (n.invulnerable = Math.max(n.invulnerable, 12), r) {
        const l = Xe(r, r.angle + Math.PI, me[r.kind].radius + 0.55);
        ct(e, n, ue(n, l), Math.min(5, K(n, l)), X.playerRadius, a), n.facing = ue(n, r), ce(a, n, r) && (!a || K(n, r) <= s.range + me[r.kind].radius) && (r.exposed = Math.max(r.exposed, 60), st(e, r, s.skill, t, "skill", n, a), qt(e, r, 20)), xe(e, n, "slash", 2, n.facing);
      }
      O(t, "shadowstep") && sr(e, "shade", n, 95 + O(t, "shadowstep") * 30, O(t, "shadowstep"));
      break;
    case "grimoire": {
      const l = n.resource;
      n.resource = 0, n.resonance = It.resonanceTicks + l, xe(e, n, "resonance", 2);
      for (const c of e.companions) c.kind === "familiar" && c.hp > 0 && c.life > 0 && (c.hp = Math.max(c.hp, It.familiarHp), c.cooldown = 0);
      r && (r.exposed = Math.max(r.exposed, 100), st(e, r, s.skill + l * 0.3, t, "skill", n, a)), O(t, "command") && ge(e, r ?? n, "storm", 2.4 + O(t, "command") * 0.3, 10, 65, 7 * O(t, "command"), !0, { source: "skill" });
      break;
    }
    case "cannon": {
      const l = 1 + (O(t, "overclock") >= 2 ? 1 : 0), c = e.companions.filter((o) => o.kind === "turret");
      c.length >= l && (c[0].life = 0), sr(e, "turret", Bs(a, n, Xe(n, n.facing, 0.9)), 240 + O(t, "overclock") * 45, O(t, "overclock")), O(t, "bunker") && Qa(n, 15 * O(t, "bunker"));
      break;
    }
  }
}
function cl(e, t, r, a) {
  const n = e.player, s = O(r, "quicksilver");
  if (n.dash = Math.round(X.dashCooldown * (1 - s * 0.08)), n.dashTime = X.dashTicks, n.dashAngle = t.move ? Er(t.move) : n.facing, n.invulnerable = X.dashTicks + 2, O(r, "storm-step") && ge(e, n, "storm", 1.7 + O(r, "storm-step") * 0.15, 0, 70, 6 + O(r, "storm-step") * 3, !0), O(r, "trapper") && ge(e, n, "frost", 1.8, 12, 110, 5 * O(r, "trapper"), !0), O(r, "minefield") && ge(e, n, "mine", 2 + O(r, "minefield") * 0.2, 12, 180, 25 * O(r, "minefield"), !0), O(r, "smoke")) {
    for (const i of e.enemies) K(i, n) < 3 + O(r, "smoke") * 0.4 && ce(a, n, i) && (qt(e, i, 30 + O(r, "smoke") * 8), i.exposed = Math.max(i.exposed, 65));
    xe(e, n, "guard", 3);
  }
}
function dl(e, t, r, a) {
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
  const s = e.enemies.filter((o) => o.hp > 0 && ce(a, n, o)).sort((o, u) => K(n, o) - K(n, u))[0];
  t.dash && !n.dash && !n.dashTime && cl(e, t, r, a);
  const i = {
    x: n.x,
    y: n.y
  };
  if (n.dashTime > 0)
    ct(e, n, n.dashAngle, X.speed * 3.6, X.playerRadius, a), n.dashTime--, !n.dashTime && O(r, "momentum") && s && K(n, s) < 3 && or(e, s, r, 10 + O(r, "momentum") * 5, a);
  else if (t.move) {
    n.facing = Er(t.move);
    const o = n.swing > 0;
    let u = X.speed * (o ? Kt[r.weapon].moveFire : 1);
    O(r, "quicksilver") && n.dash > X.dashCooldown / 2 && (u *= 1 + O(r, "quicksilver") * 0.1), e.hazards.some((h) => !h.friendly && h.kind === "frost" && !h.wait && K(h, n) < h.radius && ce(a, h, n)) && (u *= 0.65), ct(e, n, n.facing, u, X.playerRadius, a);
  }
  n.travel += K(i, n), O(r, "pilgrim") && n.travel >= 28 && (n.travel -= 28, Qa(n, O(r, "pilgrim") * 6, 35)), O(r, "wardstone") && e.tick - n.lastHit > 150 && e.tick % 30 === 0 && Qa(n, 2, O(r, "wardstone") * 10);
  const l = s && ce(a, n, s) ? s : void 0;
  t.skill && !n.skill && (l && (n.facing = ue(n, l)), ll(e, r, l, a));
  const c = Kt[r.weapon].range + (r.weapon === "blade" || r.weapon === "daggers" ? O(r, "piercing") * 0.25 : 0);
  if (l && !n.attack && K(n, l) <= c + me[l.kind].radius && (Gr(e, r, l, !1, a), n.combo++, O(r, "echo") && n.combo % Math.max(2, rt.echoEvery + 1 - O(r, "echo")) === 0 && Gr(e, r, l, !0, a), n.attack = Math.round(Kt[r.weapon].period * (O(r, "focus") ? rt.focusAttack : 1))), O(r, "orbit") && e.tick % Math.round(rt.orbitTicks / (1 + O(r, "orbit") * 0.25)) === 0 && s && K(n, s) < 4.5 && or(e, s, r, 12 + O(r, "orbit") * 3, a), O(r, "orbitals") && e.tick % 35 === 0) {
    for (const o of e.enemies) K(n, o) < 2.5 + O(r, "orbitals") * 0.35 && ce(a, n, o) && (st(e, o, 12 * O(r, "orbitals"), r, "passive", n, a), o.chill = Math.max(o.chill, 30));
    xe(e, n, "burst", 2.8);
  }
  return {
    x: n.x - i.x,
    y: n.y - i.y
  };
}
function ul(e, t, r) {
  if (e.player.resonance = Math.max(0, e.player.resonance - 1), t.weapon === "grimoire" && e.tick % 45 === 1) {
    const a = 2 + O(t, "pack-bond");
    e.companions.filter((n) => n.kind === "familiar" && n.hp > 0 && n.life > 0).length < a && sr(e, "familiar", Bs(r, e.player, Xe(e.player, e.tick, 1)), 36e3);
  }
  for (const a of e.companions) {
    a.life--, a.cooldown = Math.max(0, a.cooldown - 1);
    const n = e.enemies.filter((i) => i.hp > 0 && (a.kind !== "turret" || ce(r, a, i))).sort((i, l) => K(i, a) - K(l, a))[0];
    if (a.hp <= 0 || a.life <= 0 || !n) continue;
    if (a.angle = ue(a, n), a.kind !== "turret") {
      const i = K(a, e.player) > 8;
      if (i || K(a, n) > 1.3 || !ce(r, a, n)) {
        const l = zr(r, a, i ? e.player : n, 0.25);
        l !== null && ct(e, a, l, i ? 0.19 : 0.14 + O(t, "frenzy") * 0.015, 0.25, r);
      }
    }
    const s = a.kind === "turret" ? 8 : 1.8;
    if (!a.cooldown && K(a, n) < s && ce(r, a, n)) if (a.kind === "turret")
      Zt(e, a, a.angle, Kt.cannon.skill * (1 + a.empowered * 0.15), !0, {
        source: "companion",
        speed: 0.35
      }), a.cooldown = 28 - a.empowered * 3;
    else {
      const i = a.kind === "familiar" && e.player.resonance > 0;
      st(e, n, a.kind === "shade" ? 9 + a.empowered * 4 : (i ? It.empoweredDamage : It.damage) * (1 + O(t, "covenant") * 0.15), t, "companion", a, r), xe(e, a, "slash", 1.2, a.angle);
      const l = a.kind === "shade" ? 32 : i ? It.empoweredAttackTicks : It.attackTicks;
      a.cooldown = Math.round(l / (1 + O(t, "frenzy") * 0.18));
    }
  }
  for (const a of e.companions) a.hp <= 0 && a.kind === "familiar" && O(t, "martyr") && (Ws(e, O(t, "martyr")), ge(e, a, "slam", 2.2, 0, 1, 15 * O(t, "martyr"), !0));
  e.companions = e.companions.filter((a) => a.hp > 0 && a.life > 0);
}
function hl(e, t, r) {
  if (r?.segment !== "beacon" || t.kind !== "archer" || !["approach", "lighting"].includes(e.script.signal)) return !1;
  if (t.hp < e.script.signalHp)
    return e.script.signal = "stopped", t.exposed = Math.max(t.exposed, qe.recoveryTicks), t.cooldown = qe.recoveryTicks, !1;
  if (t.windup = 0, e.script.signal === "approach") {
    const a = r.signalPoint;
    if (K(t, a) < 1) e.script.signal = "lighting";
    else {
      const n = zr(r, t, a, 0.36);
      n !== null && (t.angle = n, ct(e, t, n, 0.1, 0.36, r));
    }
  }
  return !0;
}
function pl(e, t) {
  const r = e.script, a = e.enemies.find((s) => [
    "keeper",
    "warden",
    "thornheart"
  ].includes(s.kind));
  let n = [];
  if (t.segment === "gate" && !e.enemies.some((s) => s.kind === "archer") && (n = ["charger"]), t.segment === "waterway" && a && a.hp <= a.maxHp * 0.5 && (n = ["archer", "soldier"]), t.segment === "hall" && t.reinforcement && a && a.hp <= a.maxHp * 0.65 && (n = ["guard", "archer"]), t.segment === "roots" && a && a.hp <= a.maxHp * 0.5 && (n = ["stalker", "stalker"]), t.segment === "beacon") {
    const s = e.enemies.find((i) => i.kind === "archer");
    !s && r.signal !== "lit" && (r.signal = "stopped"), s && r.signal === "idle" && !e.enemies.some((i) => i.kind === "guard") && (r.signal = "approach", r.signalHp = s.hp, s.windup = 0, e.objective.target = qe.signalTicks), s && r.signal === "lighting" && (s.hp < r.signalHp ? (r.signal = "stopped", s.exposed = Math.max(s.exposed, qe.recoveryTicks)) : ++e.objective.progress >= qe.signalTicks && (r.signal = "lit", e.objective.hp = 0)), r.signal === "lit" && (n = ["soldier", "soldier"]);
  }
  if (!(!n.length || r.reinforcements === "done")) {
    if (r.reinforcements === "idle" && (r.reinforcements = "warning", r.warning = qe.reinforcementWarning, a && (a.windup = 0, a.cooldown = Math.max(a.cooldown, qe.reinforcementWarning + qe.recoveryTicks))), e.tick % 6 === 0) for (const s of t.summonPoints) xe(e, s, "guard", 1.2);
    --r.warning > 0 || (n.forEach((s, i) => {
      Ue(e, s, t.summonPoints[i], t) || Ze("map_invalid");
    }), r.reinforcements = "done");
  }
}
var Yr = {
  ...ci,
  ...fi
}, yn = Object.freeze({
  wait: 42,
  damage: 23
}), Vs = (e) => e && Object.hasOwn(Yr, e) ? Yr[e].map((t) => ({
  ...t,
  ...yn
})) : [];
function fl(e, t) {
  for (const r of Vs(t.segment))
    e.tick < r.offset || (e.tick - r.offset) % r.period || ze(e, r, r.angle, Ft(t, r, r.angle, r.length, r.width), r.width, r.wait, r.damage);
}
var Vt = Object.freeze({
  ritualTicks: 330,
  survivalTicks: 1500,
  pursuitInterval: 390,
  reinforcementInterval: 270,
  warningAfter: 1800
}), kn = [
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
function wn(e, t, r) {
  if (e.wave++, r) {
    for (const s of r.waves[e.wave - 1]) Ue(e, s.kind, s.position, r, !0);
    return;
  }
  if (e.boss) {
    Ue(e, e.bossKind, {
      x: 0,
      y: -5
    });
    return;
  }
  const a = oi[e.zone].mobs, n = 4 + e.chapter + (e.elite ? 2 : 0) + (t.oaths.includes("legion") ? 2 : 0);
  for (let s = 0; s < n; s++) {
    const i = Qt * s / n + (e.wave - 1) * 0.8;
    let l = a[(s + e.wave - 1) % a.length];
    e.wave === 1 && e.chapter === 0 && s < 2 && (l = a[0]), e.encounter === "pursuit" && s === 0 && (l = "stalker"), e.encounter === "siege" && s === 0 && (l = "guard"), Ue(e, l, {
      x: Math.cos(i) * 8.7,
      y: Math.sin(i) * 8.7
    });
  }
}
function ml(e, t, r) {
  if (r?.segment && (pl(e, r), fl(e, r)), e.boss) return;
  const a = e.objective, n = e.enemies.some((s) => s.hp > 0);
  if (e.encounter === "ritual") {
    a.progress < a.target && K(e.player, a) < 2.5 && !e.enemies.some((i) => i.hp > 0 && K(i, a) < 2.2) && a.progress++;
    const s = Math.min(2, Math.floor(a.progress / Vt.ritualTicks));
    a.x = kn[s].x, a.y = kn[s].y, e.tick % Vt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 8 && Ue(e, e.chapter ? "wisp" : "stalker", {
      x: a.x > 0 ? -9 : 9,
      y: Cn(e) * 12 - 6
    });
  } else if (e.encounter === "survival")
    a.progress = Math.min(a.target, a.progress + 1), e.tick % Vt.reinforcementInterval === 0 && a.progress < a.target && e.enemies.length < 10 && wn(e, t), e.tick % 150 === 0 && ge(e, {
      x: 0,
      y: 0
    }, "ring", 15, 35, 90, 12, !1, { inner: Math.max(4.8, 9 - e.tick / 400) });
  else if (e.encounter === "pursuit")
    a.progress = e.tick % Vt.pursuitInterval, e.wave < e.waves && a.progress === 0 && wn(e, t);
  else if (e.encounter === "crossfire" && e.tick % 150 === 0) {
    const s = e.tick % 300 === 0, i = Math.round((s ? e.player.y : e.player.x) / 3) * 3;
    ze(e, s ? {
      x: -10,
      y: i
    } : {
      x: i,
      y: -10
    }, s ? 0 : Math.PI / 2, 20, 0.65, 36, 15);
  }
  !r && e.tick > Vt.warningAfter && e.tick % 180 === 0 && ge(e, e.player, "fire", 2.2, 36, 90, 13), !n && e.wave < e.waves && e.encounter !== "survival" ? ++e.nextWave >= 40 && (e.nextWave = 0, wn(e, t, r)) : n && (e.nextWave = 0);
}
function gl(e, t) {
  return e.enemies.some((r) => r.hp > 0) || (t?.segment === "gate" || t?.segment === "beacon" && e.script.signal === "lit") && e.script.reinforcements !== "done" ? !1 : !e.boss && e.encounter === "survival" ? e.objective.progress >= e.objective.target : !e.boss && e.encounter === "ritual" ? e.objective.progress >= e.objective.target && e.wave >= e.waves : e.wave >= e.waves;
}
function vl(e) {
  const t = e.objective;
  e.encounter === "ritual" && (Object.assign(t, kn[0]), t.target = Vt.ritualTicks * kn.length), e.encounter === "survival" && (t.target = Vt.survivalTicks), e.encounter === "pursuit" && (t.target = Vt.pursuitInterval);
}
function yl(e) {
  return e.kind === "furnacemaster" ? e.hp <= e.maxHp * $a.burningAt ? 3 : e.hp <= e.maxHp * $a.connectedAt ? 2 : 1 : e.kind === "warden" ? e.hp <= e.maxHp * 0.3 ? 3 : e.hp <= e.maxHp * 0.65 ? 2 : 1 : e.hp <= e.maxHp * 0.5 ? 2 : 1;
}
function wl(e, t, r, a) {
  const n = ue(t, t.target), s = Ft(r, t, n, Math.min(7.5, Math.hypot(t.target.x - t.x, t.target.y - t.y) + 1), me[t.kind].radius);
  t.motionAngle = n, t.motion = Math.ceil(s / 0.32), t.stun = 24;
  const i = ze(e, t, n, s, me[t.kind].radius, 24, 0);
  if (i.life = Math.max(1, t.motion), a) {
    const l = Xe(t, n, s);
    s > 1 && Qe(e, l, 2.8, 24 + t.motion + 20, 23);
  }
  t.exposed = Math.max(t.exposed, 24 + t.motion + 70);
}
function Gs(e, t, r) {
  const a = t.pattern % (t.kind === "keeper" && t.phase === 1 ? 2 : 3), n = (s, i, l, c, o) => ze(e, t, s, Ft(r, t, s, i, l), l, c, o);
  if (t.kind === "warden" || t.kind === "keeper") if (a === 0) wl(e, t, r, t.kind === "warden" && t.phase > 1);
  else if (a === 1) {
    const s = ue(t, t.target);
    Qe(e, Xe(t, s, Ft(r, t, s, 2.4, 0.3)), t.kind === "keeper" ? 2.5 : 3, 25, t.kind === "keeper" ? 20 : 24), t.exposed = Math.max(t.exposed, 95), t.stun = 25;
  } else t.kind === "keeper" || t.phase === 3 ? (n(ue(t, t.target), t.kind === "keeper" ? 10 : 15, 0.9, 30, 23), t.exposed = Math.max(t.exposed, 100), t.stun = 30) : (Ct(e, t, t.angle, 5, 1.3, 14, 0.2), t.exposed = Math.max(t.exposed, 65));
  else if (a === 0)
    n(ue(t, t.target), 16, 0.8, 30, 20), t.phase > 1 && e.hazards.filter((s) => !s.friendly && s.kind === "poison").length < 2 && ge(e, t.target, "poison", 2, 40, 150, 9);
  else if (a === 1) {
    for (const s of [-1, 1]) n(t.angle + s * 0.7, 13, 1, 32, 21);
    t.exposed = Math.max(t.exposed, 110), t.stun = 32;
  } else
    ge(e, t, "ring", 7, 36, 10, 22, !1, {
      inner: 3.8,
      angle: t.angle + Math.PI / 2,
      gap: qe.rootRingGap
    }), t.exposed = Math.max(t.exposed, 110), t.stun = 36;
  t.pattern++;
}
function bl(e, t, r) {
  const a = t.pattern % (t.kind === "bridgekeeper" ? 3 : 4), n = (s, i, l, c = yn.wait, o = yn.damage) => ze(e, t, s, Ft(r, t, s, i, l), l, c, o);
  if (a === 0) {
    const s = n(ue(t, t.target), 18, 0.55, 36, 15);
    s.pull = gi.pullDistance, t.stun = 36, t.exposed = Math.max(t.exposed, 108);
  } else if (a === 1) {
    const s = ue(t, t.target);
    Qe(e, Xe(t, s, Ft(r, t, s, 2.8, 0.35)), 2.7, 28, 26), t.stun = 28, t.exposed = Math.max(t.exposed, 112);
  } else if (a === 2) {
    const s = ue(t, t.target);
    for (const i of [-1, 1]) n(s + i * 0.62, 20, 1.15);
    t.stun = yn.wait, t.exposed = Math.max(t.exposed, 125);
  } else {
    const s = ue(t, t.target), i = t.pattern % 8 < 4 ? -1 : 1;
    n(s, 18, 1.1, 38), t.phase > 1 && n(s + i * 0.9, 18, 1.1, 58), t.stun = 38, t.exposed = Math.max(t.exposed, 135);
  }
  t.pattern++;
}
var Ma = (e, t) => {
  e.motion = t, e.motionAngle = ue(e, e.target), e.stun = 18;
}, xl = {
  keeper(e, t, r) {
    r ? Gs(e, t, r) : Qe(e, t.target, 2.5, 24, Jt.keeper.damage);
  },
  warden(e, t, r) {
    const a = t.pattern % 3, n = Jt.warden.damage;
    if (a === 0)
      Ma(t, 24), ze(e, t, t.motionAngle, 13, 1.1, 18, n);
    else if (a === 1) {
      for (let s = -1; s <= 1; s++) Qe(e, Xe(t, t.angle + s * 0.55, 3.5), 1.8, 12 + Math.abs(s) * 8, n);
      t.exposed = Math.max(t.exposed, 65);
    } else
      Ct(e, t, t.angle, 5 + t.phase * 2, 1.5, n * 0.65), t.phase > 1 && Ue(e, "guard", {
        x: -7,
        y: -7
      }, r);
  },
  thornheart(e, t, r) {
    const a = t.pattern % 4;
    if (a === 0) for (let n = 0; n < 5; n++) ge(e, Xe(t.target, n * Qt / 5, 3.6), "poison", 1.4, 26, 110, 12);
    else if (a === 1)
      ge(e, t, "ring", 7.5, 25, 14, 22, !1, { inner: 3 }), t.exposed = Math.max(t.exposed, 80);
    else if (a === 2) for (const n of [-7, 7]) Ue(e, "stalker", {
      x: n,
      y: -6
    }, r);
    else for (let n = 0; n < 3 + t.phase; n++) ze(e, t, t.angle + n * Qt / (3 + t.phase), 15, 0.55, 25, 18);
  },
  weaver(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = t.target.x > 0 ? -7 : 7, t.y = -5, xe(e, t, "burst", 2), ze(e, {
        x: -10,
        y: t.target.y
      }, 0, 20, 0.7, 30, 21), ze(e, {
        x: t.target.x,
        y: -10
      }, Math.PI / 2, 20, 0.7, 42, 21);
    else if (r === 1) Ct(e, t, ue(t, e.player), 7 + t.phase, 1.8, 13, 0.2);
    else if (r === 2) {
      for (let a = 0; a < 4; a++) {
        const n = Xe({
          x: 0,
          y: 0
        }, a * Math.PI / 2 + Math.PI / 4, 7);
        ze(e, n, ue(n, {
          x: 0,
          y: 0
        }), 11, 0.6, 25 + a * 8, 18);
      }
      t.exposed = Math.max(t.exposed, 75);
    } else
      Ue(e, "wisp", {
        x: -7,
        y: 5
      }), Ue(e, "wisp", {
        x: 7,
        y: 5
      });
  },
  astrologer(e, t) {
    const r = t.pattern % 3, a = t.pattern * 0.53;
    if (r === 0) for (let n = 0; n < 7; n++)
      n !== t.phase && ze(e, t, a + n * Qt / 7, 18, 0.6, 32, 23);
    else if (r === 1) for (let n = 0; n < 6; n++) {
      const s = Xe({
        x: 0,
        y: 0
      }, n * Qt / 6, 9);
      Ct(e, s, ue(s, t.target), 2 + t.phase, 0.45, 12, 0.16);
    }
    else
      Qe(e, t.target, 2, 18, 24), ge(e, {
        x: 0,
        y: 0
      }, "ring", 10.5, 38, 12, 22, !1, { inner: 5.5 }), t.exposed = Math.max(t.exposed, 90);
  },
  king(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      Ma(t, 18), ze(e, t, t.motionAngle, 10, 0.9, 18, 24);
    else if (r === 1) for (let a = 0; a < 2 + t.phase; a++) Qe(e, Xe(t, t.angle + (a % 2 ? 0.65 : -0.65), 3), 2, 7 + a * 10, 23);
    else r === 2 ? (ze(e, {
      x: -10,
      y: 0
    }, 0, 20, 0.8, 22, 26), ze(e, {
      x: 0,
      y: -10
    }, Math.PI / 2, 20, 0.8, 35, 26), t.exposed = Math.max(t.exposed, 65)) : (Ct(e, t, t.angle, 3, 0.55, 18, 0.29), t.phase > 1 && (Ue(e, "stalker", {
      x: -8,
      y: 3
    }), Ue(e, "archer", {
      x: 8,
      y: -3
    })));
  },
  phoenix(e, t) {
    const r = t.pattern % 4;
    if (r === 0) {
      Ma(t, 28);
      for (let a = 0; a < 6; a++) ge(e, Xe(t, t.motionAngle, a * 2), "fire", 1.2, 20 + a * 4, 95, 13);
    } else if (r === 1) Vr(e, t, 10 + t.phase * 2, t.pattern * 0.32, 13, 0.17);
    else if (r === 2)
      t.x = 0, t.y = 0, ge(e, t, "ring", 9, 30, 15, 25, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 85);
    else for (const a of [{
      x: -6,
      y: -5
    }, {
      x: 6,
      y: 5
    }]) Ue(e, "bomber", a);
  },
  forgemaster(e, t) {
    const r = t.pattern % 4;
    if (r === 0) for (const a of [
      -7,
      0,
      7
    ]) ze(e, {
      x: a,
      y: -10
    }, Math.PI / 2, 20, 1.1, 26, 24);
    else if (r === 1) for (let a = -1; a <= 1; a++) ge(e, {
      x: t.target.x + a * 2.5,
      y: t.target.y
    }, "fire", 1.6, 28 + Math.abs(a) * 7, 100, 14);
    else r === 2 ? (Qe(e, t, 4, 18, 26), t.exposed = Math.max(t.exposed, 100)) : (Ue(e, "bomber", {
      x: -8,
      y: 5
    }), t.phase > 1 && Ue(e, "guard", {
      x: 8,
      y: 5
    }));
  },
  colossus(e, t) {
    const r = t.pattern % 3;
    if (r === 0) for (let a = 0; a < 3; a++) ge(e, t, "ring", 3 + a * 3, 20 + a * 19, 9, 23, !1, { inner: 1.4 + a * 3 });
    else if (r === 1)
      Ma(t, 30), ze(e, t, t.motionAngle, 18, 1.4, 18, 27);
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
    if (r === 0) for (let a = 0; a < 4; a++) ge(e, Xe(t.target, a * Math.PI / 2, 3), "frost", 1.8, 24, 100, 10);
    else r === 1 ? Ct(e, t, t.angle, 9, 2.2, 14, 0.21) : r === 2 ? (t.x = -t.x, t.y = -t.y, ze(e, t, ue(t, t.target), 20, 1.2, 32, 24), t.exposed = Math.max(t.exposed, 85)) : (ge(e, {
      x: 0,
      y: 0
    }, "ring", 10.5, 32, 18, 22, !1, { inner: 5 }), Ue(e, "stalker", {
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
      }, Ma(t, 40), ze(e, t, 0, 19, 1.4, 14, 25);
    else if (r === 1) for (let a = 0; a < 4; a++) ze(e, {
      x: -10,
      y: -8 + a * 5
    }, 0, 20, 0.7, 20 + a * 13, 20);
    else r === 2 ? (Qe(e, t.target, 3.8, 28, 26), t.exposed = Math.max(t.exposed, 95)) : (ge(e, {
      x: 0,
      y: 0
    }, "ring", 10, 26, 14, 23, !1, { inner: t.phase > 1 ? 4 : 6 }), Ct(e, t, t.angle, 5, 1.3, 14));
  },
  archivist(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.memory.push({ ...t.target }), t.memory = t.memory.slice(-4), Qe(e, t.target, 2.3, 24, 21);
    else if (r === 1) for (let a = 0; a < t.memory.length; a++) Qe(e, t.memory[a], 2.6, 22 + a * 8, 24);
    else if (r === 2) {
      for (const a of t.memory) ze(e, a, ue(a, t.target), 18, 0.65, 32, 22);
      Ue(e, "wisp", {
        x: -7,
        y: -7
      }), Ue(e, "wisp", {
        x: 7,
        y: 7
      });
    } else
      Vr(e, t, 12, t.pattern * 0.2, 14), t.exposed = Math.max(t.exposed, 100);
  },
  voidknight(e, t) {
    const r = t.pattern % 4;
    if (r === 0)
      t.x = Math.max(-8, Math.min(8, -t.target.x)), t.y = Math.max(-8, Math.min(8, -t.target.y)), xe(e, t, "burst", 2), ze(e, t, ue(t, t.target), 20, 0.8, 24, 26);
    else if (r === 1)
      Ma(t, 20), Ct(e, t, t.angle, 3 + t.phase, 0.9, 15, 0.26);
    else if (r === 2)
      Qe(e, t, 3, 12, 26), ge(e, t, "ring", 7, 30, 10, 22, !1, { inner: 3.5 }), t.exposed = Math.max(t.exposed, 65);
    else for (const a of [{
      x: t.target.x,
      y: -9
    }, {
      x: -9,
      y: t.target.y
    }]) ze(e, a, ue(a, t.target), 20, 0.6, 22, 23);
  }
};
function _l(e, t, r, a) {
  if (t.kind === "kilnheart" || t.kind === "furnacemaster") {
    a || ve("invalid"), ol(e, t, a);
    return;
  }
  if (t.kind === "bridgekeeper" || t.kind === "heatkeeper") {
    a || ve("invalid"), bl(e, t, a);
    return;
  }
  if (a?.segment && [
    "keeper",
    "warden",
    "thornheart"
  ].includes(t.kind)) {
    Gs(e, t, a);
    return;
  }
  const n = t.kind;
  for (; t.phase < (t.hp / t.maxHp < 0.3 ? 3 : t.hp / t.maxHp < 0.65 ? 2 : 1); ) {
    const s = t.phase + 1;
    t.phase = s, xe(e, t, "burst", 4), n === "phoenix" && s === 2 && (t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12), ge(e, t, "fire", 3, 25, 100, 14)), n === "archivist" && (t.memory.push({
      x: e.player.x,
      y: e.player.y
    }), t.memory = t.memory.slice(-4)), r.oaths.includes("legion") && Ue(e, "stalker", {
      x: t.x > 0 ? -8 : 8,
      y: 6
    }, a);
  }
  xl[n](e, t, a), t.pattern++;
}
function Ml(e, t, r) {
  if (!Ie(t.kind) && [
    "soldier",
    "guard",
    "stalker"
  ].includes(t.kind)) {
    if (r?.segment && t.kind === "soldier") return e.player;
    const a = e.companions.filter((n) => n.hp > 0 && n.life > 0 && K(n, t) < 2.8 && ce(r, t, n)).sort((n, s) => K(n, t) - K(s, t))[0];
    if (a) return a;
    if (e.encounter === "siege" && !e.boss && (t.kind === "soldier" || t.kind === "guard" || t.kind === "charger") && K(t, e.player) > 3) return e.objective;
  }
  return e.player;
}
function kl(e, t, r, a, n) {
  const s = me[t.kind];
  K(t.target, e.player) < a && K(t, e.player) < s.reach + 1 && ce(n, t, e.player) && An(e, s.damage, r, n);
  for (const i of e.companions) K(t.target, i) < a && K(t, i) < s.reach + 1 && ce(n, t, i) && (i.hp -= s.damage);
  !e.boss && e.encounter === "siege" && K(t.target, e.objective) < a && K(t, e.objective) < s.reach + 1 && (e.objective.hp = Math.max(0, e.objective.hp - s.damage * 0.5)), xe(e, t.target, "slash", a, t.angle);
}
function Sl(e, t, r, a) {
  const n = me[t.kind];
  if (Ie(t.kind)) {
    _l(e, t, r, a);
    return;
  }
  switch (t.kind) {
    case "archer":
      Ct(e, t, t.angle, e.chapter > 0 ? 3 : 1, 0.36, n.damage, 0.24);
      break;
    case "priest":
      for (const s of e.enemies) s.hp > 0 && !Ie(s.kind) && K(s, t) < 3.5 && ce(a, t, s) && (s.hp = Math.min(s.maxHp, s.hp + 8));
      Ct(e, t, t.angle, 3, 0.7, n.damage, 0.18), xe(e, t, "heal", 3.5);
      break;
    case "charger":
      t.motion = 23, t.motionAngle = t.angle;
      break;
    case "bomber":
      ge(e, t.target, "fire", 1.9, 23, 75, n.damage);
      break;
    case "wisp":
      Zt(e, t, t.angle, n.damage, !1, { speed: 0.3 }), t.motion = 7, t.motionAngle = t.angle + Math.PI / 2;
      break;
    case "guard":
      Qe(e, t.target, 1.7, 8, n.damage), t.exposed = Math.max(t.exposed, 60);
      break;
    default:
      kl(e, t, r, n.reach + 0.15, a);
  }
}
function Rl(e, t, r, a) {
  const n = me[t.kind], s = {
    x: t.x,
    y: t.y
  }, i = t.kind === "leviathan" ? 0.44 : t.kind === "wisp" ? 0.24 : 0.32;
  if (ct(e, t, t.motionAngle, i, n.radius, a), t.motion--, t.kind !== "wisp") {
    K(t, e.player) < n.radius + 0.4 && ce(a, t, e.player) && (An(e, n.damage, r, a), t.motion = 0);
    for (const l of e.companions) K(t, l) < n.radius + 0.3 && ce(a, t, l) && (l.hp -= n.damage, t.motion = 0);
    !e.boss && e.encounter === "siege" && K(t, e.objective) < n.radius + 0.6 && (e.objective.hp = Math.max(0, e.objective.hp - n.damage * 0.5), t.motion = 0), K(s, t) < i * 0.65 && (t.motion = 0, t.exposed = Math.max(t.exposed, 80), t.stun = 24, xe(e, t, "guard", 2));
  }
  t.motion || (t.cooldown = Math.max(t.cooldown, 28));
}
function El(e, t, r, a) {
  for (const n of [...e.enemies]) {
    if (n.hp <= 0) continue;
    if (a?.segment && Ie(n.kind)) {
      const d = yl(n);
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
    ]) n[d] > 0 && (n[d]--, e.tick % 15 === 0 && st(e, n, 2 + (d === "burn" ? O(t, "cinder") + O(t, "inferno") : d === "bleed" ? O(t, "hemorrhage") + O(t, "blood-dance") : O(t, "venom")) * 1.5, t, "passive", a ? n : e.player, a));
    if (n.hp <= 0 || n.kind === "coupler" || hl(e, n, a)) continue;
    if (n.stun > 0) {
      n.stun--;
      continue;
    }
    if (n.motion > 0) {
      Rl(e, n, t, a);
      continue;
    }
    const s = me[n.kind], i = t.oaths.includes("haste");
    if (n.windup > 0) {
      --n.windup === 0 && (Sl(e, n, t, a), n.cooldown = Math.max(n.cooldown, a?.segment && Ie(n.kind) ? n.phase === 3 ? 95 : 75 : Math.round(s.cooldown * (i ? 0.8 : 1) / (Ie(n.kind) ? 1 + (n.phase - 1) * 0.12 : 1))));
      continue;
    }
    const l = Ml(e, n, a), c = K(n, l), o = ce(a, n, l);
    n.cooldown = Math.max(0, n.cooldown - 1), n.angle = ue(n, l);
    const u = a?.segment && e.enemies.filter((d) => d.id !== n.id && d.hp > 0 && (d.windup > 0 || d.motion > 0)).length + e.hazards.filter((d) => !d.friendly && d.life > 0).length >= qe.simultaneousWindups;
    if (!n.cooldown && c < s.reach && o && !u) {
      if (n.target = {
        x: l.x,
        y: l.y
      }, n.windup = Math.round(s.windup * (i ? 0.8 : 1)), l === e.player && (n.kind === "archer" || n.kind === "bomber")) {
        const d = n.kind === "bomber" ? 23 : c / 0.24, f = Math.min(n.windup + d, 4.5 / Math.max(1e-3, Math.hypot(r.x, r.y))), m = {
          x: l.x + r.x * f,
          y: l.y + r.y * f
        };
        a ? ce(a, n, m) && ce(a, l, m) && (n.target = m) : (n.target.x = Math.max(-10, Math.min(10, m.x)), n.target.y = Math.max(-10, Math.min(10, m.y))), n.angle = ue(n, n.target);
      }
      continue;
    }
    const h = n.kind === "archer" || n.kind === "priest" || n.kind === "bomber" || n.kind === "wisp";
    if (c > (h ? 5 : Ie(n.kind) ? 2.8 : 0.95) || h && c < 3 || !o) {
      const d = n.kind === "stalker" && c > 3 ? n.id % 2 ? 0.28 : -0.28 : 0, f = zr(a, n, l, s.radius);
      f !== null && ct(e, n, f + (h && c < 3 && o ? Math.PI : a ? 0 : d), s.speed * (n.chill ? Ie(n.kind) ? 0.8 : 0.5 : 1) * (i ? 1.08 : 1), s.radius, a);
    }
    for (const d of e.enemies) d.id !== n.id && d.hp > 0 && K(n, d) < s.radius + me[d.kind].radius && ct(e, n, ue(d, n), 0.027, s.radius, a);
  }
}
function mn(e, t, r) {
  if (e.kind === "beam") return nl(t, e, e.angle, e.length) < e.width + r;
  const a = K(e, t);
  return e.kind === "ring" && e.gap && Math.abs(Math.atan2(Math.sin(ue(e, t) - e.angle), Math.cos(ue(e, t) - e.angle))) + Math.asin(Math.min(1, r / Math.max(r, a))) < e.gap / 2 ? !1 : a < e.radius + r && (e.kind !== "ring" || a > e.inner - r);
}
function zl(e, t, r) {
  for (const a of e.shots) {
    if (a.life <= 0) continue;
    const n = {
      x: a.x,
      y: a.y
    };
    if (a.x += Math.cos(a.angle) * a.speed, a.y += Math.sin(a.angle) * a.speed, a.life--, r ? !ce(r, n, a, a.radius) : Math.abs(a.x) > X.arena || Math.abs(a.y) > X.arena || e.obstacles.some((s) => K(s, a) < s.radius + a.radius)) {
      a.life = 0;
      continue;
    }
    if (!a.friendly) {
      if (K(a, e.player) < X.playerRadius + a.radius && ce(r, a, e.player)) e.player.shield > 0 ? (Hs(e, t, r), a.friendly = !0, a.source = "skill", a.angle += Math.PI, a.damage *= 1.8, a.hits = []) : (An(e, a.damage, t, r), a.life = 0);
      else {
        const s = e.companions.find((i) => i.hp > 0 && K(a, i) < 0.3 + a.radius && ce(r, a, i));
        s && (s.hp -= a.damage * (1 - O(t, "covenant") * 0.12), a.life = 0);
      }
      continue;
    }
    for (const s of e.enemies) {
      if (s.hp <= 0 || a.hits.includes(s.id) || K(s, a) > me[s.kind].radius + a.radius || !ce(r, a, s)) continue;
      a.hits.push(s.id);
      const i = a.damage * (O(t, "hunter") && K(s, e.player) > rt.hunterRange ? rt.hunterDamage + (O(t, "hunter") - 1) * 0.15 : 1);
      if (st(e, s, i, t, a.source, a, r), O(t, "pinning") && a.source === "attack" && (s.chill = 50 + O(t, "pinning") * 20, e.player.combo % 3 === 0 && qt(e, s, 8 * O(t, "pinning"))), a.splash > 0) {
        xe(e, s, "burst", a.splash);
        for (const l of e.enemies) l.id !== s.id && K(l, s) < a.splash + me[l.kind].radius && st(e, l, i * 0.55, t, a.source, s, r);
      }
      if (a.bounce > 0) {
        const l = e.enemies.filter((c) => c.hp > 0 && !a.hits.includes(c.id) && K(c, s) < 6 && ce(r, a, c, a.radius)).sort((c, o) => K(s, c) - K(s, o))[0];
        if (l) {
          a.bounce--, a.angle = ue(a, l), a.damage *= 0.8;
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
function Pl(e, t, r) {
  for (const a of [...e.hazards]) {
    if (a.wait > 0) {
      a.wait--;
      continue;
    }
    if (a.life--, !a.friendly) {
      if (a.damage <= 0) continue;
      const s = a.kind === "slam" || a.kind === "beam" || a.kind === "ring";
      if ((s ? !a.hits.includes(0) : e.tick % 15 === 0) && mn(a, e.player, X.playerRadius) && ce(r, a, e.player)) {
        const i = a.pull && !e.player.invulnerable && !e.player.shield && e.player.hp > 0;
        An(e, a.damage, t, r), s && a.hits.push(0), i && ct(e, e.player, ue(e.player, a), Math.min(a.pull, Math.max(0, K(e.player, a) - 1.8)), X.playerRadius, r);
      }
      if (!e.boss && e.encounter === "siege" && e.tick % 15 === 0 && mn(a, e.objective, 0.6) && ce(r, a, e.objective) && (e.objective.hp = Math.max(0, e.objective.hp - a.damage * 0.35)), s || e.tick % 15 === 0)
        for (const i of e.companions) i.hp > 0 && (!s || !a.hits.includes(i.id)) && mn(a, i, 0.3) && ce(r, a, i) && (i.hp -= a.damage * 0.25, s && a.hits.push(i.id));
      continue;
    }
    if (a.kind !== "slam" && a.kind !== "mine" && e.tick % 15 !== 0) continue;
    const n = e.enemies.filter((s) => s.hp > 0 && mn(a, s, me[s.kind].radius) && ce(r, a, s));
    a.kind === "mine" && n.length && (a.life = 0, xe(e, a, "burst", a.radius));
    for (const s of n) a.kind === "storm" ? or(e, s, t, a.damage, r, a) : (a.kind === "fire" && (s.burn = Math.max(s.burn, 45)), a.kind === "frost" && (s.chill = Math.max(s.chill, 60)), a.kind === "mine" && qt(e, s, 25), st(e, s, a.damage, t, a.source, a, r));
  }
  e.hazards = e.hazards.filter((a) => a.life > 0);
}
function Cl(e, t, r) {
  zl(e, t, r), Pl(e, t, r);
}
function Al(e) {
  return e.player.hp <= 0 ? "fallen" : !e.boss && e.encounter === "siege" && e.objective.hp <= 0 ? "beacon" : null;
}
function $l(e, t, r) {
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
  return r && ((l && !Wr(c) || r.waves.some((d) => d.some((f) => !Wr(f.kind)))) && Ze("encounter_unsupported"), (o !== "skirmish" || !r.waves.length || !Tt(r.space, r.entry, X.playerRadius) || r.waves.some((d) => !d.length || d.some((f) => !Tt(r.space, f.position, me[f.kind].radius) || !ha(r.space, r.entry, f.position, X.playerRadius)))) && Ze("map_invalid"), Object.assign(h.player, r.entry), Object.assign(h.objective, r.objective), h.obstacles = [], h.waves = r.waves.length), vl(h), wn(h, t, r), h;
}
function Il(e, t, r, a) {
  if (e.status !== "fighting") return;
  e.tick++, e.effects = e.effects.filter((s) => --s.life > 0).slice(-80);
  const n = dl(e, t, r, a);
  ul(e, r, a), El(e, r, n, a), Cl(e, r, a), e.enemies = e.enemies.filter((s) => s.hp > 0), Al(e) ? e.status = "lost" : (ml(e, r, a), gl(e, a) && (e.status = "won", e.shots = [], e.hazards = []));
}
function Tl(e, t) {
  const r = e.at(-1);
  r && r.move === t.move && r.dash === t.dash && r.skill === t.skill ? r.ticks++ : e.push({
    ...t,
    ticks: 1
  });
}
var Ll = 2.4;
function Ut(e, t) {
  return (!e?.all || e.all.every((r) => t.has(r))) && (!e?.none || e.none.every((r) => !t.has(r)));
}
var Qr = /* @__PURE__ */ new WeakMap();
function Lt(e, t) {
  const r = e.gates.filter((i) => Ut(i.condition, t)).map((i) => i.id), a = r.join("/");
  let n = Qr.get(e);
  n || (n = /* @__PURE__ */ new Map(), Qr.set(e, n));
  let s = n.get(a);
  return s || (s = Fs(e.map, new Set(r)), n.set(a, s)), s;
}
function $n(e, t) {
  const r = e.exits.filter((n) => Ut(n.condition, t)).map((n) => ({
    kind: "exit",
    target: n,
    position: e.anchors[n.anchor]
  })), a = e.objects.filter((n) => Ut(n.condition, t) && !(n.kind === "switch" && t.has(n.fact))).map((n) => ({
    kind: "object",
    target: n,
    position: e.anchors[n.anchor]
  }));
  return [...r, ...a];
}
function Ta(e, t, r) {
  const a = Lt(e, r);
  return $n(e, r).filter((n) => K(t.position, n.position) <= 2.4 && He(a, t.position, n.position)).sort((n, s) => K(t.position, n.position) - K(t.position, s.position) || n.target.id.localeCompare(s.target.id));
}
function Ol(e, t, r, a = 1) {
  (!Number.isInteger(t) || t < 0 || t > 8) && Ze("input_invalid"), t && (e.facing = Er(t), Rr(r, e.position, {
    x: Math.cos(e.facing) * X.speed * a,
    y: Math.sin(e.facing) * X.speed * a
  }, X.playerRadius));
}
var jl = [
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
  ...yi
], $e = (e, t) => ({
  kind: e,
  anchor: t
}), ft = {
  ...Ts,
  ...As,
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
      $e("soldier", "front_left"),
      $e("soldier", "front_right"),
      $e("archer", "front_archer")
    ], [
      $e("guard", "patrol"),
      $e("soldier", "lookout"),
      $e("bomber", "flank")
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
      $e("guard", "guard"),
      $e("soldier", "flank"),
      $e("archer", "archer"),
      $e("archer", "archer_left")
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
      $e("guard", "guard"),
      $e("archer", "archer"),
      $e("bomber", "bomber")
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
      $e("soldier", "front_left"),
      $e("soldier", "front_right"),
      $e("archer", "front_archer")
    ], [
      $e("guard", "front_guard"),
      $e("bomber", "front_bomber"),
      $e("soldier", "front_flank")
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
    waves: [[$e("keeper", "guard")]]
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
    waves: [[$e("warden", "warden")]]
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
    waves: [[$e("thornheart", "tree")]]
  }
}, In = (e) => jl.filter((t) => ft[t].scene === e), Sn = (e, t, r) => {
  const a = ft[e];
  return a.complete ? t.has(a.complete) : r.includes(e) || In(a.scene).some((n) => {
    const s = ft[n];
    return s.prerequisite === e && s.complete && t.has(s.complete);
  });
};
function Ys(e, t, r) {
  return In(e).find((a) => !Sn(a, t, r) && (!ft[a].prerequisite || Sn(ft[a].prerequisite, t, r)));
}
function Qs(e, t, r, a, n, s) {
  const i = ft[e];
  if (i.complete && t.has(i.complete)) return null;
  const l = Re[i.scene];
  return {
    setup: {
      seed: a,
      zone: Jt[i.boss ?? "warden"].region,
      chapter: Object.hasOwn(As, e) ? 2 : Object.hasOwn(Ts, e) ? 1 : 0,
      elite: e === "coal_store",
      boss: i.boss !== null,
      bossKind: i.boss ?? "warden",
      encounter: "skirmish",
      hp: n
    },
    field: {
      space: Ds(Lt(l, t), i.bounds),
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
      enemyLimit: i.boss ? qe.bossEnemyLimit : qe.enemyLimit,
      ...e === "beacon" ? { signalPoint: l.anchors.signal } : {},
      ...e === "furnace_heart" ? { furnacePrepared: t.has("furnace_workers_helped") } : {}
    }
  };
}
var Je = {
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
}, Tn = Object.keys(Je), ir = [
  ..._t,
  ...Tn,
  ...ma
];
function Pe(e) {
  return Object.hasOwn(Us, e);
}
function Ks(e) {
  return Object.hasOwn(Je, e);
}
function Mt(e) {
  return Object.hasOwn(De, e);
}
function Ve(e) {
  return Pe(e) ? Us[e] : Ks(e) ? Je[e].name : De[e].name;
}
var Nl = {
  visit_wen: {
    people: ["sanniang"],
    requires: la,
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
    requires: la,
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
    requires: la,
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
    requires: la,
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
}, La = {
  ...Nl,
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
    requires: la,
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
}, Xs = Object.keys(La);
function Js(e) {
  return e && Object.hasOwn(La, e) ? La[e] : void 0;
}
function Kr(e, t) {
  if (!Pe(t) && !Mt(t)) return [];
  const { facts: r } = e, a = Pe(t) ? e.people[t].scene : De[t].scene;
  return Xs.filter((n) => {
    if (n === "receiving" && r.includes("captives_arrived")) return !1;
    const s = La[n];
    if (s.district && pt(a) !== s.district || s.scenes && !s.scenes.includes(a) || s.excludes?.some((i) => r.includes(i)) || s.minPeak !== void 0 && (!Pe(t) || e.relationships[t].highestBand < s.minPeak) || s.present?.some((i) => (Pe(i) ? e.people[i].scene : Mt(i) ? De[i].scene : null) !== a)) return !1;
    if (s.atClinic) {
      if (!Pe(t)) return !1;
      const i = e.people[t], l = Xa[t].station, c = Re[l.scene].anchors[l.anchor];
      if (a !== "clinic_front" && !(a === l.scene && Math.hypot(i.position.x - c.x, i.position.y - c.y) <= 2.4)) return !1;
    }
    return s.people.includes(t) && !r.includes(s.fact) && s.requires.every((i) => r.includes(i));
  });
}
function Ul(e, t) {
  if (t.kind === "reward") {
    const r = e.rewards[t.node];
    return !!r?.offers.length && r.scene === e.location.scene;
  }
  return t.kind !== "rest" || e.location.scene !== "waterway" || Sn("waterway_approach", new Set(e.facts), e.completedSegments);
}
function Pr(e, t = !1) {
  const r = Re[e.location.scene], a = new Set(e.facts);
  return (t ? Ta(r, e.location, a) : $n(r, a)).filter((n) => n.kind === "exit" || Ul(e, n.target));
}
function eo(e) {
  return e.phase === "exploration" && (Re[e.location.scene].safe || Pr(e, !0).some((t) => t.kind === "object" && t.target.kind === "rest"));
}
function Fl(e, t) {
  return e === "kouzi_home" && t === "deep_waterway" || e === "deep_waterway" && t === "kouzi_home";
}
function Cr(e, t) {
  const r = e.knowledge[t], a = t === "kouzi" || r.includes("deep_route_agreed") || r.includes("deep_route_walked"), n = a || e.facts.includes("deep_route_shared") || Pe(t) && e.people[t].scene === "deep_waterway";
  return {
    place: (s) => s !== "deep_waterway" || n,
    exit: (s, i) => Fl(s, i) ? a : s !== "deep_waterway" && i !== "deep_waterway" || n
  };
}
var pa = (e, t) => Math.hypot(e.x - t.x, e.y - t.y), Xr = /* @__PURE__ */ new WeakMap();
function lr(e, t, r) {
  if (He(e, t, r, X.playerRadius)) return r;
  const a = ua(e.map, t), n = ua(e.map, r), s = `${a.column},${a.row}/${n.column},${n.row}`;
  let i = Xr.get(e);
  i || (i = /* @__PURE__ */ new Map(), Xr.set(e, i));
  const l = da(e.map, a.column, a.row);
  if (!i.has(s)) {
    const o = ha(e, l, da(e.map, n.column, n.row), X.playerRadius);
    i.size >= 512 && i.delete(i.keys().next().value), i.set(s, o?.find((u) => pa(u, l) > 0.01) ?? null);
  }
  const c = i.get(s);
  return c ? He(e, t, c, X.playerRadius) ? c : l : null;
}
function Zl(e) {
  return {
    scene: e.scene,
    position: { ...Re[e.scene].anchors[e.anchor] },
    facing: 0,
    mode: "idle",
    destination: null
  };
}
function cr(e, t) {
  return In(e).every((r) => {
    const a = ft[r];
    return a.complete === null || t.has(a.complete);
  });
}
function Rn(e, t, r, a, n) {
  const s = [{
    ...e,
    route: []
  }], i = /* @__PURE__ */ new Set();
  for (; s.length; ) {
    const l = s.shift(), c = Re[l.scene], o = Lt(c, r);
    if (l.scene === t.scene && lr(o, l.position, c.anchors[t.anchor])) return l.route;
    for (const u of Re[l.scene].exits) {
      const h = `${u.to}/${u.arrival}`;
      i.has(h) || n && !n(l.scene, u.to) || !Ut(u.condition, r) || a && !cr(u.to, r) || !lr(o, l.position, c.anchors[u.anchor]) || (i.add(h), s.push({
        scene: u.to,
        position: Re[u.to].anchors[u.arrival],
        route: [...l.route, u]
      }));
    }
  }
  return null;
}
function to(e, t) {
  const r = new Set(e.facts), a = e.people[t], n = Cr(e, t);
  return Object.entries(Pn).filter(([, s]) => n.place(s.scene) && (!Mr(pt(s.scene)) || la.every((i) => r.has(i)) && (s.scene !== "deep_waterway" || r.has("deep_route_agreed")))).map(([s, i]) => {
    const l = Rn(a, i, r, !1, n.exit), c = cr(i.scene, r), o = cr(a.scene, r) && c ? Rn(a, i, r, !0, n.exit) : null;
    return {
      id: s,
      name: i.name,
      ...tr(i.scene) ? { use: tr(i.scene).use } : {},
      personHere: a.scene === i.scene && (s === i.scene || pa(a.position, Re[i.scene].anchors[i.anchor]) <= 2.4),
      playerHere: e.location.scene === i.scene && (s === i.scene || pa(e.location.position, Re[i.scene].anchors[i.anchor]) <= 2.4),
      accessible: l !== null,
      safe: c,
      solo: o !== null,
      route: o ?? l
    };
  });
}
function ql(e, t) {
  return Ps(e.facts, t) !== "confined";
}
var ao = (e) => Ll * (0.7 + _t.indexOf(e) / _t.length * 0.2);
function Dl(e) {
  return _t.some((t) => e.people[t].mode === "travel" || e.people[t].mode === "follow" && pa(e.people[t].position, e.location.position) >= ao(t));
}
function no(e, t) {
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
function ro(e) {
  return [...Pr(e), ...no(e.location.scene, e.people)];
}
function so(e) {
  return Ln(Re[e.location.scene], e.location.position, new Set(e.facts), e.people);
}
function Ln(e, t, r, a) {
  return no(e.id, a).filter((n) => {
    if (n.kind !== "object" || n.target.kind !== "person") return !1;
    const s = e.id === "cells" && !!Xa[n.target.person].returnFact && !r.has("captives_released"), i = Lt(e, s ? /* @__PURE__ */ new Set([...r, "captives_released"]) : r);
    return pa(n.position, t) <= (s ? 5 : 2.4) && He(i, t, n.position);
  });
}
function Bl(e) {
  const t = new Set(e.facts);
  for (const r of _t) {
    const a = e.people[r];
    if (a.mode === "idle") continue;
    const n = Re[a.scene], s = Lt(n, t);
    let i, l;
    if (a.mode === "follow") {
      if (a.scene !== e.location.scene && ve("invalid"), i = e.location.position, pa(a.position, i) < ao(r)) continue;
    } else {
      const f = Pn[a.destination], m = Rn(a, f, t, !0, Cr(e, r).exit);
      if (m || ve("unavailable"), l = m[0], i = n.anchors[l?.anchor ?? f.anchor], pa(a.position, i) < 0.2) {
        l ? (a.scene = l.to, a.position = { ...Re[l.to].anchors[l.arrival] }) : (a.mode = "idle", a.destination = null);
        continue;
      }
    }
    const c = lr(s, a.position, i);
    c || ve("unavailable");
    const o = c.x - a.position.x, u = c.y - a.position.y, h = Math.hypot(o, u), d = Math.min(h, X.speed * 1.8);
    h && (a.facing = Math.atan2(u, o), Rr(s, a.position, {
      x: o / h * d,
      y: u / h * d
    }, X.playerRadius));
  }
}
function En(e, t) {
  const r = Je[e];
  return Re[r.scene].anchors[t.has(r.complete) ? r.clearedAnchor : r.anchor];
}
function rn(e, t, r) {
  return Tn.filter((a) => Je[a].scene === e).flatMap((a) => {
    const n = En(a, r), s = Je[a];
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
function Wl(e, t) {
  return e.phase === "exploration" && !e.pendingParley && rn(e.location.scene, e.location.position, new Set(e.facts)).some((r) => r.target.id === t);
}
function dr(e) {
  return (!e || typeof e != "object" || Array.isArray(e)) && ve("invalid"), e;
}
function Jr(e, t = 0, r = Number.MAX_SAFE_INTEGER) {
  return (!Number.isSafeInteger(e) || Number(e) < t || Number(e) > r) && ve("invalid"), e;
}
function Xt(e, t) {
  return (typeof e != "string" || !t.includes(e)) && ve("invalid"), e;
}
function es(e, t, r) {
  return (!Array.isArray(e) || e.length > t) && ve("invalid"), e.map(r);
}
function Hl(e) {
  return new Set(e).size !== e.length && ve("invalid"), e;
}
function ts(e) {
  typeof e != "boolean" && ve("invalid");
}
function Vl(e) {
  return (typeof e != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(e)) && ve("identity"), e;
}
var tn = Object.freeze({
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}), Gl = Object.keys(tn), oo = ["male", "female"];
function Yl(e) {
  const t = dr(e);
  return (typeof t.name != "string" || !t.name.trim() || t.name.trim().length > 24 || /[\r\n]/.test(t.name)) && ve("invalid"), {
    name: t.name.trim(),
    gender: Xt(t.gender, oo),
    ...t.appearanceAge === void 0 ? {} : { appearanceAge: Xt(t.appearanceAge, Gl) }
  };
}
var Ql = {
  ...Object.fromEntries(ma.map((e) => [e, { initial: { reply: De[e].greeting } }])),
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
function io(e, t) {
  const r = Ql[t], a = Pe(t) && Ja(e.facts, t) && r.returned ? r.returned : r.initial;
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
function Ar(e) {
  return Oa.bands.filter((t) => e >= t).length - 1;
}
function Kl(e) {
  const t = e.lastReply;
  if (!t) return null;
  const r = e.conversations[t.person].at(-1);
  return r?.id === t.turnId ? {
    person: t.person,
    turn: r
  } : null;
}
function as(e, t) {
  const r = e.conversations[t].at(-1);
  return r && r.kind !== "greeting" ? r : null;
}
function Xl(e) {
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
function On(e) {
  const t = Kl(e), r = Js(t?.turn.action ?? null);
  return t && r?.confirm && !e.facts.includes(r.fact) ? t.person : null;
}
var lo = Object.freeze({
  rankCap: 2,
  choices: 3
}), Jl = [
  "city_arrival",
  "return_plan",
  "bridge",
  "heatkeeper",
  "coal_store"
], ec = [
  "furnace_trial",
  "furnace_convoy",
  "furnace_ascent"
], tc = (e) => Jl.includes(e) || ec.includes(e) ? 3 : lo.rankCap, ac = [
  "crossroads",
  "approach",
  "passage"
], nc = {
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
}, rc = {
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
function sc(e, t) {
  if (e.rewards[t]) return;
  const r = {
    weapon: e.weapon,
    oaths: [],
    relics: e.collection.filter((c) => e.equipped.includes(c.id))
  }, a = new Set(Object.values(e.rewards).flatMap((c) => c.offers.map((o) => o.id))), n = ac.includes(t), s = al(e.weapon).flatMap((c) => {
    const o = e.collection.find((u) => u.id === c)?.rank ?? 0;
    return !a.has(c) && o < tc(t) && (!n || !o) && qs(r, c) && (Ia[c].chapter === 0 || e.facts.includes("warden_defeated")) ? [{
      id: c,
      rank: o + 1
    }] : [];
  }), i = [], l = (c) => {
    const o = Dr(e, s.filter((u) => c.includes(u.id) && !i.some((h) => h.id === u.id)), 1)[0];
    o && i.push(o);
  };
  if (t === "crossroads") for (const c of nc[e.weapon]) l([c]);
  else
    l(e.equipped.flatMap((c) => rc[c] ?? [])), l(s.filter((c) => ["guard", "life"].includes(Ia[c.id].family)).map((c) => c.id));
  i.push(...Dr(e, s.filter((c) => !i.some((o) => o.id === c.id)), lo.choices - i.length)), e.rewards[t] = {
    scene: e.location.scene,
    offers: i
  };
}
var oc = (e) => e.rewardNode ? e.rewards[e.rewardNode].offers : [];
function ic(e, t) {
  const r = kr(t), a = new Set(e.facts);
  if (!r) return null;
  const n = a.has(r.fact), s = new Set(n ? [] : so(e).map((u) => u.target.id)), i = n ? [] : (r.witnesses ?? []).filter((u) => Pe(u) ? !s.has(u) : !Mt(u) || De[u].scene !== e.location.scene), l = Is.find((u) => r.witnesses?.includes(u.person))?.resolved.find((u) => a.has(u));
  let c = i.length ? Ke.awaitWitness(i.map(Ve).join("、")) : r.body, o = !n && !i.length ? r.operation ?? null : null;
  return !n && t === "return_trial" && a.has("bridge_cleared") && (c = Ke.trialAfterBridge, o && (o = {
    ...o,
    setup: Ke.trialAfterBridgeSetup
  })), n && (c = `${Ke.reviewed}
${en[r.fact]}`, l && (c += `

${Ke.now}
${en[l]}`)), a.has("heat_restored") && (t === "heat_notice" && (c = Ke.restoredNotice), t === "return_plan" && (c = Ke.restoredPlan), t === "deep_receipt" && !i.length && !l && (c += `

${Ke.restoredDeep}`)), {
    ...r,
    body: c,
    ready: !i.length,
    read: n,
    operation: o
  };
}
var co = Object.freeze({
  explorationSpeed: 1.65,
  playerTextLimit: 2e3,
  replyTextLimit: 8e3
});
function $r(e) {
  return {
    weapon: e.weapon,
    oaths: [],
    relics: e.equipped.map((t) => e.collection.find((r) => r.id === t))
  };
}
function lc(e, t) {
  return eo(e) ? t.length > X.relicSlots ? "capacity" : new Set(t).size !== t.length || t.some((r) => !e.collection.some((a) => a.id === r)) ? "invalid" : null : "unavailable";
}
function an(e, t, r) {
  e.facts.includes(t) || e.facts.push(t);
  const a = r ?? [
    ..._t.filter((n) => e.people[n].scene === e.location.scene),
    ...Tn.filter((n) => Je[n].scene === e.location.scene),
    ...ma.filter((n) => De[n].scene === e.location.scene)
  ];
  for (const n of a) e.knowledge[n].includes(t) || e.knowledge[n].push(t);
}
function cc(e) {
  const t = e.checkpoint;
  if (e.engagement)
    return Qs(e.engagement.id, new Set(e.facts), t?.player ?? e.location.position, t?.seed ?? e.seed, t?.player.hp ?? e.hp, e.engagement.reinforcement)?.field;
}
function dc(e, t) {
  const r = e.facts.includes("alarm_raised") && !e.facts.includes("alarm_silenced"), a = Qs(t, new Set(e.facts), e.location.position, Math.floor(Cn(e) * 4294967296), e.hp, r);
  a || ve("unavailable"), e.engagement = {
    id: t,
    reinforcement: r
  }, e.battle = $l(a.setup, $r(e), a.field), e.checkpoint = structuredClone(e.battle), e.phase = "battle";
}
function ns(e, t) {
  return On(e) ? !1 : Mt(t) ? e.phase === "exploration" && !e.pendingParley && Ta(Re[e.location.scene], e.location, new Set(e.facts)).some((r) => r.kind === "object" && r.target.kind === "resident" && r.target.person === t) : Pe(t) ? e.pendingParley ? !1 : e.phase === "exploration" && so(e).some((r) => r.kind === "object" && r.target.kind === "person" && r.target.person === t) : Wl(e, t);
}
function uc(e) {
  if (!e.facts.includes("captives_released") || e.facts.includes("captives_arrived")) return;
  const t = pt(e.location.scene) === "camp" && e.facts.includes("postern_opened") && e.facts.includes("receiving_arranged");
  for (const r of qr) {
    if (Ja(e.facts, r)) continue;
    const a = e.people[r];
    t && a.scene === "cells" && a.mode === "idle" && (e.people[r] = Zl(Xa[r].station));
    const n = e.people[r].scene;
    pt(n) === "camp" && an(e, Xa[r].returnFact, _t.filter((s) => e.people[s].scene === n));
  }
  qr.every((r) => Ja(e.facts, r)) && an(e, "captives_arrived", _t.filter((r) => e.people[r].scene === "camp"));
}
function hc(e) {
  !e.facts.includes("kouzi_entered_city") && ["south_street", "workshop_street"].includes(pt(e.people.kouzi.scene)) && an(e, "kouzi_entered_city", ["kouzi"]);
}
function pc(e) {
  const t = e.engagement.id, r = ft[t];
  r.complete ? an(e, r.complete) : e.completedSegments.includes(t) || e.completedSegments.push(t), r.reward && sc(e, r.reward), e.phase = "exploration", e.battle = null, e.checkpoint = null, e.engagement = null;
}
function rs(e, t) {
  if (!(e.pendingParley || On(e))) {
    if (e.phase === "battle" && e.battle) {
      const r = cc(e);
      r || ve("invalid"), Il(e.battle, t, $r(e), r);
      const a = e.battle;
      e.hp = a.player.hp, e.location.position = {
        x: a.player.x,
        y: a.player.y
      }, e.location.facing = a.player.facing, e.engagement?.id === "beacon" && a.objective.hp === 0 && an(e, "alarm_raised"), a.status === "won" ? pc(e) : a.status === "lost" && (e.phase = "lost");
    } else if (e.phase === "exploration") {
      const r = Re[e.location.scene], a = new Set(e.facts);
      Ol(e.location, t.move, Lt(r, a), co.explorationSpeed);
      const n = Ys(r.id, a, e.completedSegments);
      if (n) {
        const s = ft[n], i = r.anchors[s.trigger];
        Math.hypot(e.location.position.x - i.x, e.location.position.y - i.y) <= s.triggerRadius && Tt(Ds(Lt(r, a), s.bounds), e.location.position, X.playerRadius) && dc(e, n);
      }
    }
    (e.phase === "exploration" || e.phase === "battle") && (Bl(e), uc(e), hc(e));
  }
}
var uo = [
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
    fact: Sr.fact,
    key: "supplies-received",
    amount: 300
  },
  {
    fact: "chapter_completed",
    key: "chapter-one",
    amount: X.firstVictoryAward
  },
  {
    fact: "warden_defeated",
    key: Jt.warden.awardKey,
    amount: X.firstBossAward
  },
  {
    fact: "roots_cleared",
    key: Jt.thornheart.awardKey,
    amount: X.firstBossAward
  }
], z0 = Object.fromEntries([
  ...ii.map((e) => [Jt[e].awardKey, X.firstBossAward]),
  ["victory", X.firstVictoryAward],
  ...Object.keys(Kt).map((e) => [`mastery-${e}`, X.masteryAward]),
  ...si.map((e) => [`oath-${e}`, X.oathAward]),
  ...uo.map((e) => [e.key, e.amount])
]), ka = {
  none: "保持这一句的表情与姿态",
  nod: "轻轻点头一次",
  tilt: "略侧头打量，再回正",
  shake: "轻轻摇头一次",
  gesture: "抬起空着的手掌，作一个轻缓的示意",
  withdraw: "外伸的手略向内收，停一下再放松"
}, ho = {
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
    gestures: ka
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
    gestures: ka
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
    gestures: ka
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
    gestures: ka
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
      ...ka,
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
    gestures: ka
  }
};
function po(e) {
  return Object.hasOwn(ho, e);
}
function fc(e) {
  return po(e) ? ho[e] : {
    expressions: {},
    gestures: {}
  };
}
var Ir = {
  outer: "外衣",
  lower: "下装",
  inner: "内衣",
  underpants: "内裤",
  shoes: "鞋",
  socks: "袜"
}, mc = {
  ...Object.fromEntries(ma.map((e) => [e, De[e].clothing])),
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
function fo(e, t) {
  const r = { ...mc[t] };
  for (const a of e.conversations[t]) a.kind === "dialogue" && a.clothing && Object.assign(r, a.clothing);
  return r;
}
var gc = {
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
}, vc = Object.keys(gc), P0 = [
  ...vc,
  "soldier",
  "archer",
  "guard",
  "priest",
  "charger",
  "stalker",
  "bomber",
  "wisp"
], yc = (e) => Xt(e, Cs), Yn = (e) => Xt(e, Os), ss = (e) => Xt(e, Ls);
function wc(e) {
  const t = dr(e);
  switch (t.type) {
    case "start":
    case "restart":
      return {
        type: t.type,
        weapon: yc(t.weapon),
        outfit: ss(t.outfit),
        traveler: Yl(t.traveler)
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
        id: Vl(t.id)
      };
    case "choice":
      return {
        type: "choice",
        id: Xt(t.id, Xs),
        person: Xt(t.person, ir)
      };
    case "greet":
      return {
        type: "greet",
        person: Xt(t.person, ir)
      };
    case "loadout":
      return {
        type: "loadout",
        equipped: Hl(es(t.equipped, X.relicSlots, Yn))
      };
    case "input": {
      const r = es(t.spans, X.maxInputTicks, (a) => {
        const n = dr(a);
        return ts(n.dash), ts(n.skill), {
          move: Jr(n.move, 0, 8),
          dash: n.dash,
          skill: n.skill,
          ticks: Jr(n.ticks, 1, X.maxInputTicks)
        };
      });
      return (!r.length || r.reduce((a, n) => a + n.ticks, 0) > X.maxInputTicks) && ve("invalid"), {
        type: "input",
        spans: r
      };
    }
    case "relic":
      return {
        type: "relic",
        id: Yn(t.id),
        ...t.replace === void 0 ? {} : { replace: Yn(t.replace) }
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
function bc(e, t) {
  const r = Wt(null), a = H(!1), n = H(""), s = Wt(null), i = H(!1), l = H(!1), c = Wt(null), o = Wt(null), u = H(null), h = G(() => r.value?.replyFailure?.actionId === u.value ? null : r.value?.replyFailure ?? null), d = G(() => i.value || !!r.value?.conversation), f = H(!1), m = H(!1);
  let x = !1;
  const w = Wt(null), y = G(() => {
    const M = (w.value ?? r.value)?.conversation;
    return M || (i.value ? c.value : null);
  }), _ = G(() => a.value || d.value || l.value || !!s.value || !r.value?.ready || r.value.writeState !== "ready" || r.value.pending), k = (M, N) => M.data.revision !== N.data.revision ? M.data.revision > N.data.revision : M.fileRevision >= N.fileRevision;
  function z(M) {
    if (x || r.value && !k(M, r.value)) return;
    const N = c.value;
    (r.value?.data.active?.id !== M.data.active?.id || N && M.data.active?.conversations[N.person].some((j) => j.id === N.actionId)) && (c.value = null), r.value = M;
  }
  const L = G(() => {
    if (c.value) return c.value;
    if (r.value?.conversation) return {
      ...r.value.conversation,
      status: "sending"
    };
    const M = r.value?.replyFailure;
    return !M || M.regenerating || r.value?.data.active?.conversations[M.person].some((N) => N.id === M.actionId) ? null : {
      actionId: M.actionId,
      person: M.person,
      text: M.playerText,
      regenerating: !1,
      status: "failed"
    };
  });
  async function b(M, N, j) {
    if (x || a.value) return !1;
    a.value = !0, w.value = null, n.value = "";
    try {
      const F = await e.request(`game/expedition/${M}`, {
        chatIdentity: t,
        ...M === "rebuild" ? { actionId: Hn() } : {},
        ...N,
        ...j ? { person: j } : {}
      }, 35e3), W = w.value;
      return z(W && k(W, F.result) ? W : F.result), f.value = !1, m.value = !1, r.value?.writeState === "ready" && !r.value.pending && M !== "read" && (s.value = null), !0;
    } catch (F) {
      if (!x) {
        f.value = !0, w.value && z(w.value), n.value = Yt(F);
        const W = F && typeof F == "object" && "code" in F ? String(F.code) : "";
        m.value = W === "expedition_data_invalid", N && (W.startsWith("expedition_save_") || W.startsWith("host_request_")) && (s.value = N);
      }
      return !1;
    } finally {
      w.value = null, x || (a.value = !1);
    }
  }
  const E = e.subscribe((M) => {
    if (x) return;
    if (M.type === "game/expedition/error") {
      const j = M.payload;
      j.chatIdentity === t && (n.value = Yt(j), m.value = j.code === "expedition_data_invalid");
      return;
    }
    if (M.type !== "game/expedition/state") return;
    const N = M.payload;
    N.chatIdentity === t && (a.value ? w.value = N.state : (w.value = null, z(N.state)));
  });
  async function S() {
    const M = s.value;
    return !await b("confirm") || !r.value || r.value.writeState !== "ready" || r.value.pending ? !1 : M && r.value.data.revision === M.revision ? b("act", M) : (s.value = null, l.value = !1, !0);
  }
  async function C(M, N, j) {
    if (_.value || x) return !1;
    const F = Hn();
    o.value = j ? {
      person: M,
      turnId: j
    } : null, c.value = {
      actionId: F,
      person: M,
      text: N,
      regenerating: !!j,
      status: "sending",
      phase: "preparing",
      startedAt: Date.now()
    }, i.value = !0, a.value = !0, n.value = "", w.value = null;
    try {
      const W = await e.request(j ? "game/expedition/regenerate" : "game/expedition/talk", {
        chatIdentity: t,
        actionId: F,
        revision: r.value.data.revision,
        person: M,
        text: N,
        ...j ? { turnId: j } : {}
      }, 18e4), V = w.value;
      return z(V && k(V, W.result) ? V : W.result), !0;
    } catch (W) {
      if (!x) {
        w.value && z(w.value);
        const V = W && typeof W == "object" && "code" in W ? String(W.code) : W instanceof Error ? W.message : "";
        if (V === "expedition_cancelled")
          return n.value = "", !1;
        l.value = V.startsWith("host_request_") || V.startsWith("expedition_save_"), n.value = l.value ? B.aiUnknown : r.value?.replyFailure?.actionId === F ? "" : Yt(W);
      }
      return !1;
    } finally {
      o.value = null, i.value = !1, w.value = null, x || (a.value = !1, c.value?.actionId === F && (c.value = j ? null : {
        ...c.value,
        status: "failed"
      }));
    }
  }
  async function I() {
    if (d.value)
      try {
        await e.request("game/expedition/cancel", { chatIdentity: t }, 35e3);
      } catch (M) {
        x || (n.value = Yt(M));
      }
  }
  const A = G(() => f.value || !!s.value || l.value || !r.value || r.value.pending || r.value.writeState !== "ready");
  return {
    view: r,
    busy: a,
    error: n,
    blocked: _,
    failed: s,
    talking: d,
    uncertainTalk: l,
    talk: C,
    outgoing: L,
    replacingReply: o,
    conversationProgress: y,
    cancelTalk: I,
    recoveryRequired: A,
    dataInvalid: m,
    conversationFailure: h,
    dismissConversationFailure() {
      u.value = r.value?.replyFailure?.actionId ?? null;
    },
    rebuild: () => b("rebuild"),
    retryMemory: (M) => _.value ? Promise.resolve(!1) : b("retry-memory", void 0, M),
    dismissError() {
      A.value || (n.value = "");
    },
    notice: G(() => n.value || (r.value && ([
      "failed",
      "conflict",
      "unconfirmed"
    ].includes(r.value.writeState) || r.value.pending && r.value.writeState === "ready") ? ie.saveError : "")),
    read: () => b("read"),
    recover: S,
    act: (M) => _.value ? Promise.resolve(!1) : b("act", {
      actionId: Hn(),
      revision: r.value.data.revision,
      command: wc(M)
    }),
    dispose() {
      x = !0, E();
    }
  };
}
function xc(e) {
  const t = Wt(null), r = Wt(!1);
  let a = [], n = 0, s = null, i = !1;
  function l() {
    const h = e.view.value?.data.active;
    if (t.value = h ? structuredClone(h) : null, t.value) for (const d of a) for (let f = 0; f < d.ticks; f++) rs(t.value, d);
    r.value = a.length > 0;
  }
  const c = he(e.view, () => {
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
    return s = null, d ? l() : e.failed.value || (a = h.concat(a), n = a.reduce((f, m) => f + m.ticks, 0)), r.value = a.length > 0 || !d, d;
  }
  function u(h) {
    const d = t.value;
    !d || i || e.failed.value || e.uncertainTalk.value || e.notice.value || n >= X.maxInputTicks || !["exploration", "battle"].includes(d.phase) || d.phase === "exploration" && !h.move && !Dl(d) || (rs(d, h), Tl(a, h), n++, r.value = !0, Io(t), (n >= X.checkpointTicks || !["exploration", "battle"].includes(d.phase)) && o());
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
var { recent: Qn, maximum: os } = Fo;
function _c(e) {
  const { history: t, pending: r, talking: a, person: n, campaignId: s, transcript: i, freshReply: l } = e, c = To(/* @__PURE__ */ new Map());
  let o = 0, u = !1;
  const h = G(() => t.value.reduce((I, A) => I + (A.kind === "greeting" || A.kind === "player" ? 1 : 2), 0)), d = G(() => h.value + Number(r.value)), f = G(() => Uo(c.get(n.value)?.range, d.value)), m = G(() => {
    const I = [];
    let A = 0;
    for (const M of t.value) {
      if (A >= f.value.end) break;
      const N = M.kind === "greeting" ? ["npc"] : M.kind === "player" ? ["player"] : ["player", "npc"];
      for (const j of N)
        A >= f.value.start && A < f.value.end && I.push({
          key: `${M.id}:${j}`,
          side: j,
          turn: M
        }), A++;
    }
    return I;
  }), x = G(() => f.value.start > 0), w = G(() => f.value.end < d.value), y = G(() => w.value || f.value.end - f.value.start > Qn), _ = G(() => r.value && f.value.end > h.value);
  function k(I) {
    I && !I.isConnected && i.value?.focus({ preventScroll: !0 });
  }
  function z(I, A) {
    const M = I.getBoundingClientRect().top, N = [...I.querySelectorAll("[data-message-key]")].find((j) => A.has(j.dataset.messageKey) && j.getBoundingClientRect().bottom > M);
    return N ? {
      key: N.dataset.messageKey,
      offset: N.getBoundingClientRect().top - M
    } : null;
  }
  function L(I, A) {
    const M = A && [...I.querySelectorAll("[data-message-key]")].find((N) => N.dataset.messageKey === A.key);
    return !M || !A ? !1 : (I.scrollTop += M.getBoundingClientRect().top - I.getBoundingClientRect().top - A.offset, !0);
  }
  function b() {
    const I = i.value;
    if (!I || u || c.get(n.value)?.latest === !1) return;
    const A = l.value ? I.querySelector('[data-fresh-reply="true"]') : null;
    I.scrollTop = A && A.offsetHeight > I.clientHeight ? A.getBoundingClientRect().top - I.getBoundingClientRect().top + I.scrollTop - 12 : I.scrollHeight;
  }
  function E() {
    const I = ++o, A = n.value, M = i.value?.contains(document.activeElement) ? document.activeElement : null;
    u = !1, l.value = null, c.delete(A), $t(() => {
      o === I && n.value === A && (b(), k(M));
    });
  }
  function S() {
    const I = i.value;
    if (!I || u) return;
    const A = !w.value && I.scrollHeight - I.clientHeight - I.scrollTop < 32;
    if (A && y.value) {
      E();
      return;
    }
    c.set(n.value, {
      top: I.scrollTop,
      latest: A,
      range: A ? null : {
        start: f.value.start,
        end: w.value ? f.value.end : null
      }
    });
  }
  async function C(I) {
    const A = i.value;
    if (!A || u) return;
    const M = { ...f.value };
    I === "older" ? (M.start = Math.max(0, M.start - Qn), M.end = Math.min(M.end, M.start + os)) : (M.end = Math.min(d.value, M.end + Qn), M.start = Math.max(M.start, M.end - os));
    const N = z(A, new Set(m.value.filter((J, re) => {
      const Ce = f.value.start + re;
      return Ce >= M.start && Ce < M.end;
    }).map((J) => J.key))), j = A.contains(document.activeElement) ? document.activeElement : null, F = n.value, W = ++o;
    u = !0;
    const V = {
      start: M.start,
      end: M.end === d.value ? null : M.end
    };
    c.set(F, {
      range: V,
      top: A.scrollTop,
      latest: !1
    }), await $t(), !(W !== o || n.value !== F || i.value !== A) && (L(A, N) || (A.scrollTop = I === "older" ? 0 : A.scrollHeight), c.set(F, {
      range: V,
      top: A.scrollTop,
      latest: !1
    }), u = !1, k(j));
  }
  return he(s, () => {
    o++, u = !1, c.clear();
  }), he([i, n], ([I, A]) => {
    o++, u = !1;
    const M = c.get(A);
    I && (I.scrollTop = M && !M.latest ? M.top : I.scrollHeight);
  }, { flush: "post" }), he(i, (I, A, M) => {
    if (!I) return;
    const N = new ResizeObserver(b);
    N.observe(I), M(() => N.disconnect());
  }, { flush: "post" }), he(m, async (I) => {
    const A = i.value, M = n.value, N = o, j = c.get(M);
    if (!A || u || !j || j.latest) return;
    const F = z(A, new Set(I.map((W) => W.key)));
    await $t(), !(N !== o || i.value !== A || c.get(M) !== j) && (L(A, F), j.top = A.scrollTop);
  }), he([
    t,
    r,
    a,
    l
  ], async () => {
    await $t(), b();
  }), {
    messages: m,
    hasOlder: x,
    hasNewer: w,
    expanded: y,
    pendingVisible: _,
    rememberReading: S,
    resetLatest: E,
    older: () => C("older"),
    newer: () => C("newer")
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
}, is = {
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
}, Mc = {
  class: "exp-icon",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, kc = ["d"], Sc = ["d"], Rc = /* @__PURE__ */ Be({
  __name: "ExpeditionIcon",
  props: { name: {} },
  setup(e) {
    return (t, r) => ($(), T("svg", Mc, [R("path", {
      d: g(is)[e.name].body,
      fill: "currentColor",
      "fill-opacity": ".17",
      "fill-rule": "evenodd",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linejoin": "round"
    }, null, 8, kc), R("path", {
      d: g(is)[e.name].detail,
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Sc)]));
  }
}), Gt = Rc, Ec = { class: "ember-relics" }, zc = ["disabled", "onClick"], Pc = ["disabled"], Cc = ["disabled"], Ac = { class: "ember-relics" }, $c = ["disabled", "onClick"], Ic = ["disabled"], Tc = /* @__PURE__ */ Be({
  __name: "RelicReward",
  props: {
    campaign: {},
    blocked: { type: Boolean }
  },
  emits: ["choose", "leave"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = H(null);
    function s(i) {
      r.campaign.equipped.length >= X.relicSlots && !r.campaign.equipped.includes(i) ? n.value = i : a("choose", i);
    }
    return (i, l) => n.value ? ($(), T(ae, { key: 0 }, [
      R("h3", null, P(g(ia)[n.value].name) + " · " + P(g(ut).replace), 1),
      R("div", Ec, [($(!0), T(ae, null, Se(e.campaign.equipped, (c) => ($(), T("button", {
        key: c,
        type: "button",
        disabled: e.blocked,
        onClick: (o) => a("choose", n.value, c)
      }, [nt(Gt, { name: c }, null, 8, ["name"]), R("h3", null, P(g(ia)[c].name), 1)], 8, zc))), 128))]),
      R("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[0] || (l[0] = (c) => a("choose", n.value))
      }, P(g(ut).store), 9, Pc),
      R("button", {
        type: "button",
        disabled: e.blocked,
        onClick: l[1] || (l[1] = (c) => n.value = null)
      }, P(g(ut).back), 9, Cc)
    ], 64)) : ($(), T(ae, { key: 1 }, [R("div", Ac, [($(!0), T(ae, null, Se(g(oc)(e.campaign), (c) => ($(), T("button", {
      key: c.id,
      type: "button",
      disabled: e.blocked,
      onClick: (o) => s(c.id)
    }, [
      nt(Gt, { name: c.id }, null, 8, ["name"]),
      R("h3", null, [Fe(P(g(ia)[c.id].name) + " ", 1), R("small", null, P(g(ie).rank(c.rank)), 1)]),
      R("p", null, P(g(ia)[c.id].detail), 1)
    ], 8, $c))), 128))]), R("button", {
      type: "button",
      disabled: e.blocked,
      onClick: l[2] || (l[2] = (c) => a("leave"))
    }, P(g(B).skip), 9, Ic)], 64));
  }
}), Lc = Tc, pe = Object.freeze({
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
function Oc(e) {
  let t = null, r = null, a = null, n = !1, s = !1, i = null, l = -1, c = 0, o = 0, u = 0, h = 0, d = 0;
  function f(x, w, y, _ = "sine", k = x * 0.8, z = 0) {
    if (!n || !t || !r || t.state !== "running") return;
    const L = t.createOscillator(), b = t.createGain(), E = t.currentTime + z;
    L.type = _, L.frequency.setValueAtTime(x, E), L.frequency.exponentialRampToValueAtTime(Math.max(30, k), E + w), b.gain.setValueAtTime(1e-4, E), b.gain.exponentialRampToValueAtTime(y, E + 9e-3), b.gain.exponentialRampToValueAtTime(1e-4, E + w), L.connect(b).connect(r), L.start(E), L.stop(E + w), L.onended = () => {
      L.disconnect(), b.disconnect();
    };
  }
  function m(x, w, y, _) {
    if (!n || !t || !r || !a || t.state !== "running") return;
    const k = t.createBufferSource(), z = t.createBiquadFilter(), L = t.createGain(), b = t.currentTime;
    k.buffer = a, z.type = "bandpass", z.Q.value = 0.65, z.frequency.setValueAtTime(y, b), z.frequency.exponentialRampToValueAtTime(_, b + x), L.gain.setValueAtTime(1e-4, b), L.gain.exponentialRampToValueAtTime(w, b + 8e-3), L.gain.exponentialRampToValueAtTime(1e-4, b + x), k.connect(z).connect(L).connect(r), k.start(b), k.stop(b + x), k.onended = () => {
      k.disconnect(), z.disconnect(), L.disconnect();
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
            const w = a.getChannelData(0);
            for (let y = 0; y < w.length; y++) w[y] = Math.random() * 2 - 1;
          }
          await t.resume();
        } catch {
          n = !1, s || e();
        }
      }
    },
    tick(x) {
      (!i || x.tick < l) && (l = -1, c = x.player.hp, o = x.kills, u = x.player.skill, h = x.serial, d = x.player.combo), i = x, l !== x.tick && (l = x.tick, x.player.hp < c && (m(0.16, 0.17, 800, 120), f(95, 0.2, 0.12, "triangle", 42)), x.kills > o && (f(659, 0.22, 0.045), f(988, 0.3, 0.025, "sine", 980, 0.035)), x.player.combo > d && m(0.095, 0.08, 2700, 500), x.player.dashTime === 7 && m(0.2, 0.09, 500, 2600), x.player.skill > u && (m(0.24, 0.12, 2200, 250), f(165, 0.35, 0.075, "triangle", 82), f(660, 0.36, 0.035, "sine", 440, 0.02)), x.effects.some((w) => w.id > h && w.kind === "lightning") && (m(0.12, 0.1, 4400, 1e3), f(1200, 0.08, 0.018, "sine", 210)), x.effects.some((w) => w.id > h && (w.kind === "block" || w.kind === "parry")) && (f(1350, 0.18, 0.07, "triangle", 740), f(2200, 0.11, 0.025, "sine", 1600)), x.effects.some((w) => w.id > h && w.kind === "ward-hit") && f(510, 0.16, 0.06, "sine", 250), x.effects.some((w) => w.id > h && w.kind === "ward-break") && (m(0.25, 0.1, 3600, 650), f(720, 0.3, 0.05, "sine", 120)), x.status === "won" && [
        392,
        494,
        587,
        784
      ].forEach((w, y) => f(w, 0.65, 0.04, "sine", w, y * 0.075)), x.status === "lost" && f(147, 0.7, 0.06, "triangle", 73), c = x.player.hp, o = x.kills, u = x.player.skill, h = x.serial, d = x.player.combo);
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
}, ls = [
  "#b9a89e",
  "#bdada2",
  "#c1b1a5"
], Pt = {
  height: 23,
  distance: 25,
  lead: 5,
  minimumWidth: 42,
  mobileWidth: 26,
  tallSpan: 28,
  shortSpan: 19,
  settlementScale: 0.88
}, at = {
  ward: "#75c7eb",
  edge: "#e5f6ff",
  block: "#dcc08a",
  parry: "#fff2c9",
  enamel: "#42647c",
  silver: "#e4e7df"
}, wt = {
  familiar: "#8cc9bc",
  empowered: "#f1d89e",
  crest: "#9daedc",
  page: "#f2ecda",
  cover: "#4d5876"
}, jn = [
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
], jc = {
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
}, C0 = Object.fromEntries(Object.entries(Ia).map(([e, t]) => [e, jc[t.family]]));
function Nc(e, t, r) {
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
      u(), e.removeEventListener("keydown", c), window.removeEventListener("keyup", o), window.removeEventListener("blur", h);
    }
  };
}
function ur(e) {
  const t = new Zr();
  t.absarc(0, 0, 1.1, 0, Math.PI, !1), t.lineTo(-0.86, 0), t.absarc(0, 0, 0.86, Math.PI, 0, !0), t.closePath();
  const r = {
    box: new Jo(1, 1, 1),
    sphere: new Wo(1, 20, 14),
    rock: new Nr(1, 0),
    crown: new Nr(1, 1),
    cylinder: new Yo(1, 1, 1, 24),
    cone: new Ko(1, 1, 12),
    disc: new Qo(1, 48),
    ring: new hn(0.965, 1, 64),
    openRing: new hn(0.965, 1, 48, 1, qe.rootRingGap / 2, Math.PI * 2 - qe.rootRingGap),
    arc: new hn(0.87, 1, 40, 1, -0.2, Math.PI * 1.3),
    torus: new Fr(1, 0.08, 8, 40),
    stroke: new hn(0.975, 1, 48, 1, -0.2, Math.PI * 1.3),
    crescent: new Fr(1, 0.14, 6, 24, Math.PI * 1.45),
    arch: new Ur(t, {
      depth: 1,
      bevelEnabled: !1,
      curveSegments: 24
    }).translate(0, 0, -0.5)
  }, a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  function i(d, f = !1, m = 1, x = !1) {
    const w = `${d}/${f}/${m}/${x}`;
    let y = n.get(w);
    return y || (y = f ? new ei({
      color: d,
      transparent: m < 1,
      opacity: m,
      depthWrite: m === 1,
      side: 2
    }) : new xr({
      color: d,
      map: e?.get(d) ?? null,
      roughness: x ? 0.34 : 0.88,
      metalness: x ? 0.45 : 0.02,
      side: 2
    }), n.set(w, y)), y;
  }
  function l(d, f, m, x, w = [
    0,
    0,
    0
  ], y = !1, _ = 1, k = !1) {
    let z = r[f];
    if (!y && f === "box" && e?.has(m)) {
      z = z.clone(), s.add(z);
      const b = z.getAttribute("position"), E = z.getAttribute("normal"), S = z.getAttribute("uv");
      for (let C = 0; C < S.count; C++) {
        const I = Math.abs(E.getX(C)) > 0.5 ? b.getZ(C) * x[2] : b.getX(C) * x[0], A = Math.abs(E.getY(C)) > 0.5 ? b.getZ(C) * x[2] : b.getY(C) * x[1];
        S.setXY(C, I / 8, A / 8);
      }
    }
    const L = new bt(z, i(m, y, _, k));
    return L.scale.set(...x), L.position.set(...w), L.castShadow = !y, L.receiveShadow = !y, d.add(L), L;
  }
  function c(d, f = [
    0,
    0,
    0
  ]) {
    const m = new Ca();
    return m.position.set(...f), d.add(m), m;
  }
  function o(d, f, m, x, w, y = 1, _ = !1, k = 0.04) {
    const z = l(d, _ ? "disc" : "ring", f, [
      m,
      m,
      1
    ], [
      x,
      k,
      w
    ], !0, y);
    return z.rotation.x = -Math.PI / 2, z;
  }
  function u(d, f, m, x = [
    0,
    0,
    0
  ], w = 0) {
    const y = e?.has(m) ?? !1, _ = JSON.stringify([
      f,
      w,
      y
    ]);
    let k = a.get(_);
    if (!k) {
      const L = new Zr();
      if (f.forEach(([b, E], S) => S ? L.lineTo(b, E) : L.moveTo(b, E)), L.closePath(), k = w ? new Ur(L, {
        depth: w,
        steps: 1,
        bevelEnabled: !0,
        bevelThickness: w * 0.3,
        bevelSize: w * 0.3,
        bevelSegments: 2
      }) : new qo(L), y) {
        const b = k.getAttribute("uv");
        for (let E = 0; E < b.count; E++) b.setXY(E, b.getX(E) / 8, b.getY(E) / 8);
      }
      a.set(_, k);
    }
    const z = new bt(k, i(m));
    return z.position.set(...x), z.castShadow = !0, z.receiveShadow = !0, d.add(z), z;
  }
  function h(d) {
    d.updateMatrixWorld(!0);
    const f = d.matrixWorld.clone().invert(), m = new xn(), x = /* @__PURE__ */ new Map();
    d.traverse((y) => {
      if (!(y instanceof bt) || Array.isArray(y.material)) return;
      const _ = (y.geometry.index ? y.geometry.toNonIndexed() : y.geometry.clone()).applyMatrix4(m.multiplyMatrices(f, y.matrixWorld)), k = `${y.material.uuid}/${y.castShadow}/${y.receiveShadow}`;
      let z = x.get(k);
      z || (z = {
        material: y.material,
        castShadow: y.castShadow,
        receiveShadow: y.receiveShadow,
        geometries: []
      }, x.set(k, z)), z.geometries.push(_);
    }), d.clear();
    const w = [];
    for (const { material: y, castShadow: _, receiveShadow: k, geometries: z } of x.values()) {
      const L = zs(z);
      if (z.forEach((E) => E.dispose()), !L) throw new Error("expedition_geometry_merge");
      const b = new bt(L, y);
      b.castShadow = _, b.receiveShadow = k, d.add(b), w.push(L);
    }
    return () => {
      d.clear(), w.forEach((y) => y.dispose());
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
function Uc(e, t, r, a) {
  const n = jn[r], s = X.arena, { mesh: i, group: l, ring: c } = e, o = (m, x, w, y = n.stone) => i(m, "box", y, x, w);
  function u(m, x, w, y = !0) {
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
      w,
      0.91
    ], [
      0,
      w / 2 + 0.6,
      0
    ]);
    for (const k of [-0.38, 0.38]) o(_, [
      0.08,
      w - 0.35,
      0.12
    ], [
      k,
      w / 2 + 0.6,
      0.48
    ], n.light);
    return o(_, [
      1.3,
      0.24,
      1.3
    ], [
      0,
      w + 0.6,
      0
    ], n.light), o(_, [
      1.56,
      0.3,
      1.56
    ], [
      0,
      w + 0.85,
      0
    ], n.dark), y && (i(_, "cone", n.trim, [
      0.2,
      0.65,
      0.2
    ], [
      0,
      w + 1.24,
      0
    ]), o(_, [
      0.16,
      0.6,
      0.08
    ], [
      0,
      w - 0.15,
      0.52
    ], n.trim)), _;
  }
  function h(m, x, w, y) {
    u(m - w / 2, x, y - 2), u(m + w / 2, x, y - 2);
    const _ = l(t, [
      m,
      y - 2,
      x
    ]);
    i(_, "arch", n.light, [
      w / 2,
      2.3,
      1.15
    ]);
    for (let k = 1; k < 10; k++) {
      const z = k / 10 * Math.PI, L = o(_, [
        0.025,
        0.64,
        0.025
      ], [
        Math.cos(z) * w * 0.49,
        Math.sin(z) * 2.25,
        0.59
      ], n.trim);
      L.rotation.z = z - Math.PI / 2;
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
  function d(m, x, w = 1) {
    const y = l(t, [
      m,
      0,
      x
    ]);
    y.scale.setScalar(w);
    for (let _ = 0; _ < 5; _++) {
      const k = _ * 2.4, z = i(y, "rock", _ % 2 ? n.foliage : n.accent, [
        0.55,
        0.8 + _ % 2 * 0.3,
        0.45
      ], [
        Math.cos(k) * 0.4,
        0.5,
        Math.sin(k) * 0.4
      ]);
      z.rotation.z = Math.sin(k) * 0.4;
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
  function f(m, x, w) {
    const y = l(t, [
      m,
      0,
      x
    ]);
    y.scale.setScalar(w);
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
    for (let k = 0; k < 6; k++) {
      const z = k * 2.4;
      i(y, "rock", k % 2 ? n.foliage : n.accent, [
        1.65,
        0.88,
        1.4
      ], [
        Math.cos(z) * 0.95,
        3 + Math.sin(z) * 0.5,
        Math.sin(z) * 0.85
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
      const x = m * Math.PI / 4, w = o(t, [
        0.18,
        0.025,
        0.55
      ], [
        Math.cos(x) * 5.04,
        0.065,
        Math.sin(x) * 5.04
      ], n.trim);
      w.rotation.y = -x + Math.PI / 2;
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
      for (let w = 0; w < (r === 2 ? 24 : 16); w++) {
        const y = w * Math.PI * 2 / (r === 2 ? 24 : 16), _ = w % 2 ? 0.85 : r === 2 ? 2.6 : w % 4 ? 1.8 : 3.2;
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
    const w = m * (7 + x % 2), y = -7 + x * 4, _ = o(t, [
      0.035,
      0.016,
      0.55 + x * 0.1
    ], [
      w,
      0.055,
      y
    ], n.seam);
    _.rotation.y = x * 1.3;
    const k = o(t, [
      0.028,
      0.015,
      0.3
    ], [
      w + 0.1,
      0.055,
      y + 0.3
    ], n.seam);
    k.rotation.y = x * 1.3 + 0.8;
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
    for (let w = 0; w < 5; w++) o(x, [
      0.35,
      2.6 - Math.abs(w - 2) * 0.12,
      0.08
    ], [
      (w - 2) * 0.34,
      -1.35,
      Math.sin(w * 2) * 0.08
    ], w % 2 ? n.foliage : n.dark);
    if (o(x, [
      0.12,
      1.8,
      0.09
    ], [
      0,
      -1.15,
      0.13
    ], n.trim), r < 3) {
      for (let w = 0; w < 4; w++) d(m * (12.8 + w % 2), -9 + w * 5, 0.8 + w * 0.1);
      f(m * 15, -13, 1.5), f(m * 17, 1, 1.7);
    } else if (r === 3) for (let w = 0; w < 3; w++) {
      const y = l(t, [
        m * 15,
        0,
        -9 + w * 7
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
      const w = l(t, [
        m * 17,
        0,
        -13
      ]);
      o(w, [
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
        for (let k = 0; k < 3; k++) {
          o(_, [
            2.6,
            0.12,
            1.1
          ], [
            0,
            0.8 + k,
            0
          ], n.trim);
          for (let z = 0; z < 5; z++) o(_, [
            0.27,
            0.65 + z % 2 * 0.12,
            0.6
          ], [
            -0.85 + z * 0.4,
            1.2 + k,
            0.1
          ], z % 2 ? n.foliage : n.stone);
        }
      }
      const w = i(t, "torus", n.trim, [
        3.4,
        4,
        0.5
      ], [
        m * 18,
        6.2,
        -13
      ]);
      w.rotation.y = m * 0.3;
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
    for (const w of [-3.5, 3.5]) o(t, [
      0.22,
      0.25,
      18.2
    ], [
      m * 17 + w,
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
    const x = (m - 3) * 8, w = -26 - m % 3 * 6, y = 7 + m * 5 % 7;
    if (o(t, [
      5.2,
      y,
      5.5
    ], [
      x,
      y / 2 - 3,
      w
    ], n.stone), o(t, [
      5.8,
      0.4,
      6
    ], [
      x,
      y - 3,
      w
    ], n.light), r === 1) {
      const _ = i(t, "crescent", n.trim, [
        1.5,
        1.5,
        1.5
      ], [
        x,
        y - 0.8,
        w
      ]);
      _.rotation.z = 0.9;
    } else if (r === 2) i(t, "cone", n.trim, [
      3.4,
      4.8,
      3.4
    ], [
      x,
      y - 0.8,
      w
    ]);
    else if (r === 3) {
      for (const _ of [-1.3, 1.3]) i(t, "cylinder", n.dark, [
        0.7,
        5 + m % 2 * 2,
        0.7
      ], [
        x + _,
        y - 1,
        w
      ]);
      o(t, [
        3.8,
        0.25,
        4
      ], [
        x,
        y - 2.5,
        w
      ], n.trim);
    } else if (r === 4) {
      i(t, "cone", n.light, [
        3.2,
        4.5,
        3.2
      ], [
        x,
        y - 0.8,
        w
      ]);
      for (const _ of [-1, 1]) i(t, "rock", n.accent, [
        0.4,
        2,
        0.4
      ], [
        x + _,
        y - 3,
        w + 3
      ]);
    } else if (r === 5)
      i(t, "rock", n.trim, [
        1.4,
        2.3,
        1.4
      ], [
        x,
        y + 0.7,
        w
      ]), i(t, "torus", n.accent, [
        2,
        2,
        2
      ], [
        x,
        y - 1,
        w
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
        w
      ], n.light);
      m % 2 && f(x + 1, w + 2, 1.5);
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
      w + 2.8
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
    for (let w = 0; w < 6; w++) {
      const y = w * Math.PI / 3;
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
function Fc(e, t, r) {
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
    for (let k = 0; k < 4; k++) e.mesh(_, "sphere", d, [
      0.064 - k * 9e-3,
      0.09,
      0.063 - k * 8e-3
    ], [
      k % 2 ? 0.014 : -0.014,
      -k * 0.115,
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
  const f = [], m = [];
  for (const _ of [-1, 1]) {
    const k = e.group(a, [
      _ * c,
      0.12,
      0
    ]);
    f.push(k), e.mesh(k, "cylinder", o, [
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
    const z = e.group(a, [
      _ * 0.105,
      -0.32,
      0
    ]);
    m.push(z), e.mesh(z, "cylinder", "#434e55", [
      0.078,
      0.35,
      0.085
    ], [
      0,
      -0.15,
      0
    ]), e.mesh(z, "cylinder", u, [
      0.085,
      0.23,
      0.091
    ], [
      0,
      -0.39,
      0
    ]), e.mesh(z, "sphere", u, [
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
    ...f,
    ...m
  ].map((_) => e.bake(_));
  s.add(i);
  const w = [];
  a.traverse((_) => {
    _ instanceof bt && _.material === e.material(o) && w.push(_);
  });
  let y = null;
  return {
    body: a,
    hand: e.group(f[1], [
      0,
      -0.45,
      0.015
    ]),
    dress(_) {
      if (_ !== y) {
        y = _;
        for (const k of w) k.material = e.material(At[_].fabric);
        i.visible = ![
          "helm",
          "hat",
          "hood"
        ].includes(At[_].head);
      }
    },
    pose(_, k, z, L, b, E) {
      a.position.y = 1.3 + z, a.rotation.set(!b && L ? 0.16 : 0, Math.PI / 2 - _, 0), m.forEach((S, C) => {
        S.rotation.x = (C ? -1 : 1) * k;
      }), f.forEach((S, C) => {
        S.rotation.set(C && E ? -0.55 : (C ? 1 : -1) * k * 0.65, 0, (C ? -1 : 1) * 0.1);
      });
    },
    dispose() {
      x.forEach((_) => _()), a.removeFromParent();
    }
  };
}
function Zc(e, t, r) {
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
var Sa = "#45576a", gn = "#93a7ad", Ra = "#bc835a", Kn = "#ffd498";
function mo(e, t, r, a, n) {
  if (n === "coupler") {
    e.mesh(t, "box", Sa, [
      1.5,
      0.4,
      1.5
    ], [
      0,
      0.2,
      0
    ]), e.mesh(t, "cylinder", Ra, [
      0.5,
      1.8,
      0.5
    ], [
      0,
      1.2,
      0
    ]), e.mesh(r, "rock", Kn, [
      0.32,
      0.7,
      0.32
    ], [
      0,
      1.6,
      0
    ], !0);
    for (const s of [-1, 1]) e.mesh(t, "box", gn, [
      0.15,
      1.9,
      0.2
    ], [
      s * 0.6,
      1.15,
      0
    ]);
    e.mesh(t, "torus", Sa, [
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
    ]), e.mesh(r, "rock", Kn, [
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
      ]), e.mesh(t, "cylinder", Ra, [
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
    ]), e.mesh(t, "box", Sa, [
      0.65,
      1.8,
      0.8
    ], [
      s * 0.9,
      1.12,
      -0.05
    ]), e.mesh(t, "box", gn, [
      0.9,
      0.32,
      1.3
    ], [
      s * 0.9,
      0.2,
      0.22
    ]), e.mesh(t, "cylinder", Ra, [
      0.12,
      1.4,
      0.12
    ], [
      s * 1.25,
      1.2,
      0.1
    ]), e.mesh(t, "box", Sa, [
      0.25,
      2.9,
      0.35
    ], [
      s * 0.75,
      2.3,
      -0.58
    ]), e.mesh(t, "box", gn, [
      0.65,
      0.28,
      0.9
    ], [
      s * 0.85,
      3.8,
      -0.45
    ]), e.mesh(t, "cylinder", Ra, [
      0.37,
      1.8,
      0.37
    ], [
      s * 0.48,
      2.5,
      -0.9
    ]), e.mesh(t, "rock", Kn, [
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
    i.name = s < 0 ? "furnace-armor-left" : "furnace-armor-right", e.mesh(i, "box", Ra, [
      0.65,
      1.1,
      0.14
    ], [
      -s * 0.2,
      0,
      0
    ]);
  }
  e.mesh(t, "box", Sa, [
    1.8,
    0.3,
    0.35
  ], [
    0,
    3.84,
    -0.58
  ]), a.position.set(1.6, 2.3, 0.05), e.mesh(a, "cylinder", gn, [
    0.12,
    2.8,
    0.12
  ]), e.mesh(a, "box", Sa, [
    1.1,
    0.9,
    1.3
  ], [
    0,
    -1.1,
    0.18
  ]), e.mesh(a, "box", Ra, [
    1.2,
    0.18,
    1.4
  ], [
    0,
    -1.45,
    0.18
  ]);
}
function qc(e, t, r, a, n, s) {
  const { mesh: i, group: l, shape: c } = e, o = "#d6b881", u = "#fff0c1", h = (d, f, m) => {
    for (const x of [-1, 1]) i(r, "sphere", u, [
      0.09,
      0.055,
      0.06
    ], [
      x * m,
      d,
      f
    ], !0);
  };
  switch (n) {
    case "kilnheart":
    case "furnacemaster":
      mo(e, t, r, a, n);
      break;
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
        const f = d * Math.PI * 2 / 7, m = l(t, [
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
        for (let f = 0; f < 5; f++) c(a, [
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
        const f = d * Math.PI * 2 / 5, m = l(a, [
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
        const f = l(a, [
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
function Dc(e, t) {
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
  ], s = e.shape(a, n, at.block, [
    0,
    0,
    0
  ], 0.055), i = e.shape(a, n, at.enamel, [
    0,
    0,
    0.057
  ], 0.025);
  i.scale.set(0.87, 0.87, 1), e.shape(a, n, at.enamel, [
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
    ], at.silver, [
      0,
      0,
      o
    ]), e.mesh(a, "rock", at.block, [
      0.035,
      0.06,
      0.015
    ], [
      0,
      0.075,
      o + Math.sign(o) * 0.014
    ], !1, 1, !0);
  let l = 0, c = -1;
  return r.visible = !1, { update(o, u, h, d, f) {
    const m = u ? 1 : 0, x = Math.max(0, Math.min(4, d - c));
    l = f || c < 0 || d < c ? m : l + (m - l) * (1 - Math.exp(-x * 0.85)), c = d, r.visible = o === "blade" || u || l > 0.04, r.position.set(-0.4 + l * 0.12, -0.1 + l * 0.3, 0.17 + l * 0.25), r.rotation.set(0.12 - l * 0.22, 0.15 - l * 0.3, -0.16 + l * 0.22), a.scale.setScalar(0.94 + l * 0.07), s.material = e.material(h ? at.parry : o === "blade" ? at.block : at.ward, !1, 1, !0), i.material = e.material(u ? "#617f99" : at.enamel);
  } };
}
function Bc(e, t) {
  const r = e.group(t), a = new Ho({
    transparent: !0,
    depthWrite: !1,
    uniforms: {
      tint: { value: new _r(at.ward) },
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
function Wc(e, t) {
  const r = e.group(t, [
    0,
    0.15,
    0.12
  ]), a = [];
  r.rotation.set(-0.45, 0, -0.2);
  for (const u of [-1, 1]) {
    const h = e.group(r);
    e.mesh(h, "box", wt.cover, [
      0.25,
      0.055,
      0.44
    ], [
      u * 0.125,
      0,
      0
    ]), e.mesh(h, "box", wt.page, [
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
  const s = e.mesh(r, "rock", wt.empowered, [
    0.07,
    0.1,
    0.07
  ], [
    0,
    0.3,
    0
  ], !1, 1, !0), i = e.mesh(r, "torus", wt.crest, [
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
  return { update(u, h, d, f) {
    const m = f || o < 0 || d < o ? 1 : 1 - Math.exp(-Math.min(4, d - o) * 0.5);
    o = d, l += ((u ? 1 : 0) - l) * m, c += ((h ? 0.5 : u ? 0.28 : 0.15) - c) * m, r.position.y = c, r.rotation.x = -0.45 + (c - 0.15) * 0.7, a[0].rotation.z = -0.65 + l * 0.5, a[1].rotation.z = 0.65 - l * 0.5, n.rotation.z = f ? 0.2 : 0.2 + l * (Math.sin(d * 0.18) + 1) * 1.3, s.scale.set(0.07 + l * 0.025, 0.1 + l * 0.06, 0.07 + l * 0.025), i.visible = u, f || (s.rotation.y = d * 0.08);
  } };
}
function Hc() {
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
      const u = !c && l - r <= 2 / X.hz, h = n > 0;
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
function go(e, t, r = 1) {
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
function vo(e, t, r) {
  const a = e.group(t), n = Fc(e, a, r), s = n.body, i = e.ring(a, "#193f49", 0.6, 0, 0, 0.14, !0), l = e.group(s), c = n.hand, o = e.group(l), u = Dc(e, l), h = Hc();
  let d = null, f = -1, m = Math.PI / 2, x = null, w = null, y = null;
  function _(k, z) {
    if (!(k === w && z === y)) {
      if (w = k, y = z, o.clear(), c.clear(), d = null, x = Zc(e, o, y), n.dress(y), w === "blade")
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
      else if (w === "bow") go(e, c);
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
      else if (w === "daggers") for (const L of [-1, 1]) {
        const b = e.group(c, [
          L < 0 ? -0.58 : 0,
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
      else if (w === "grimoire") d = Wc(e, c);
      else if (w === "cannon") {
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
    update(k, z, L, b, E, S, C, I = !1) {
      _(z, L), u.update(z, !!k?.shield, !!k?.guard, b, S);
      const A = S || f < 0 || b < f ? 1 : 1 - Math.exp(-Math.min(4, b - f) * 0.65);
      f = b;
      const M = C ? Math.PI / 2 + 0.23 : k?.facing ?? Math.PI / 2;
      m += Math.atan2(Math.sin(M - m), Math.cos(M - m)) * A;
      const N = h.update(C ? null : k, E, S), j = !!k?.dashTime;
      a.position.set(k?.x ?? 0, C ? 0.3 : 0, k?.y ?? -8), a.scale.setScalar(C ? 1.65 : 1), n.pose(m, N.stride, N.lift, j, S, !!k?.swing || I), x.cape.rotation.x = S ? -0.15 : -0.21 - N.amount * 0.44 - Math.sin(b * 0.15) * 0.12, x.animate(b, S);
      const F = k?.swing && !S ? Math.sin(k.swing / (z === "cannon" ? 16 : 9) * Math.PI) : 0;
      c.rotation.z += ((I ? -0.3 : -0.2 - F * 1.3) - c.rotation.z) * A, c.rotation.x += ((I ? -0.25 : 0.1 + F * 0.6) - c.rotation.x) * A, d && d.update(!!k?.resonance, I, b, S), i.scale.set(0.6 + (j ? 0.25 : 0), 0.6, 1);
    },
    dispose() {
      n.dispose(), a.removeFromParent();
    }
  };
}
function Tr(e, t, r, a) {
  const { mesh: n, group: s } = e, i = s(t), l = s(i), c = s(l), o = s(l), u = [], h = Ie(r), d = me[r].radius;
  let f = null;
  e.ring(i, "#1d3540", d * 1.15, 0, 0, 0.16, !0);
  const m = "#cfad70", x = "#fff0b0", w = a.dark;
  function y(M, N, j) {
    const F = s(l, [
      M,
      j,
      N
    ]);
    n(F, "box", w, [
      0.32,
      j,
      0.42
    ], [
      0,
      -j / 2,
      0
    ]), n(F, "box", a.stone, [
      0.38,
      0.22,
      0.55
    ], [
      0,
      -j + 0.11,
      0.1
    ]), u.push(F);
  }
  function _(M, N, j = "#d9e8df") {
    n(M, "box", m, [
      0.55,
      0.1,
      0.24
    ], [
      0,
      0.25,
      0
    ], !1, 1, !0), n(M, "box", w, [
      0.11,
      0.4,
      0.11
    ]), n(M, "box", j, [
      0.2,
      N,
      0.13
    ], [
      0,
      N / 2 + 0.35,
      0
    ], !1, 1, !0), n(M, "cone", j, [
      0.15,
      0.4,
      0.13
    ], [
      0,
      N + 0.5,
      0
    ]);
  }
  if (r === "coupler") mo(e, l, o, c, r);
  else if (r === "charger") {
    n(l, "rock", a.stone, [
      0.58,
      0.58,
      0.9
    ], [
      0,
      0.7,
      0
    ]), n(o, "rock", w, [
      0.43,
      0.45,
      0.46
    ], [
      0,
      0.73,
      0.7
    ]);
    for (const M of [-0.27, 0.27]) {
      const N = n(o, "cone", m, [
        0.15,
        0.7,
        0.15
      ], [
        M,
        1.15,
        0.9
      ]);
      N.rotation.x = 0.55, n(o, "sphere", x, [
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
    ]), n(o, "sphere", w, [
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
    for (const N of [-0.23, 0.23]) n(o, "sphere", "#e4e3ff", [
      0.09,
      0.055,
      0.05
    ], [
      N,
      4.08,
      0.45
    ], !0);
    for (const N of [-1, 1]) {
      const j = s(l, [
        N * 0.8,
        3.3,
        0
      ]);
      j.rotation.z = N * 0.65, n(j, "cone", "#757caf", [
        0.5,
        1.8,
        0.45
      ], [
        0,
        -0.65,
        0
      ]), n(j, "sphere", a.light, [
        0.22,
        0.25,
        0.22
      ], [
        0,
        -1.45,
        0.1
      ]), u.push(j);
    }
    for (let N = 0; N < 5; N++) {
      const j = N / 5 * Math.PI * 2, F = n(c, "rock", a.accent, [
        0.2,
        0.34,
        0.2
      ], [
        Math.cos(j) * 1.95,
        3.3 + Math.sin(j) * 1.1,
        -0.3
      ]);
      F.rotation.z = j;
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
    ]), n(l, "box", w, [
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
    n(o, "sphere", w, [
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
      const N = M * Math.PI * 2 / 7;
      n(o, "cone", m, [
        0.17,
        0.85,
        0.17
      ], [
        Math.cos(N) * 0.78,
        4.85,
        Math.sin(N) * 0.78
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
    r === "keeper" && l.scale.setScalar(0.72), y(-0.65, 0.05, 0.85), y(0.65, 0.05, 0.85), n(l, "cylinder", w, [
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
    for (const N of [-1, 1])
      n(l, "rock", a.stone, [
        0.83,
        0.6,
        0.7
      ], [
        N * 1.03,
        2.7,
        0
      ]), n(l, "box", m, [
        0.7,
        0.1,
        0.8
      ], [
        N * 1.08,
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
    ]), n(o, "box", w, [
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
    f = M, n(M, "box", w, [
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
    ]), n(c, "box", w, [
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
  } else if (Ie(r)) qc(e, l, o, c, r, a);
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
    const M = r === "priest", N = r === "guard";
    if (M ? n(l, "cone", "#767da5", [
      0.55,
      1.5,
      0.5
    ], [
      0,
      0.95,
      0
    ]) : (y(-0.22, 0, 0.5), y(0.22, 0, 0.5), n(l, "box", w, [
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
    ]), n(o, "box", w, [
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
      for (const j of [-1, 1]) n(l, "rock", a.stone, [
        0.28,
        0.23,
        0.3
      ], [
        j * 0.45,
        1.22,
        0
      ]);
      c.position.set(0.54, 1, 0.2), r === "archer" ? go(e, c, 1.3) : (c.rotation.z = -0.3, _(c, 0.75)), N && (n(l, "box", m, [
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
  const k = s(i, [
    0,
    h ? 5.5 : r === "charger" ? 1.7 : 2.45,
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
  const z = n(k, "box", "#f0ba83", [
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
  let b = 0, E = -100, S = 0, C = 0;
  const I = c.rotation.z, A = [l.getObjectByName("furnace-armor-left"), l.getObjectByName("furnace-armor-right")];
  return {
    root: i,
    bar: k,
    update(M, N, j, F = !1) {
      const W = Math.abs(M.x - S) + Math.abs(M.y - C) > 5e-3;
      S = M.x, C = M.y, b && !M.windup && (E = N), b = M.windup;
      const V = M.windup ? 1 - M.windup / me[M.kind].windup : 0, J = Math.max(0, 1 - (N - E) / 10);
      i.position.set(M.x, 0, M.y), l.rotation.y = Math.PI / 2 - M.angle, l.position.y = j ? 0 : r === "weaver" || r === "priest" ? 0.13 + Math.sin(N * 0.055) * 0.1 : W ? Math.abs(Math.sin(N * 0.3)) * 0.055 : 0, l.rotation.x = j ? 0 : -V * 0.16 + J * 0.2, o.rotation.z = !j && r === "king" ? Math.sin(N * 0.035) * 0.08 : 0, c.rotation.x = j ? 0 : V * -1.3 + J * 1.4, c.rotation.z = I + (j ? 0 : V * -0.35), f && F && (f.visible = r !== "warden" || js(M.phase), f.rotation.x = M.exposed ? -Math.PI / 3 : 0), A.forEach((re, Ce) => {
        re && (re.rotation.y = M.phase === 3 ? (Ce ? 1 : -1) * 1.1 : 0);
      });
      for (let re = 0; re < u.length; re++) u[re].rotation.x = !j && W ? Math.sin(N * 0.32 + re * Math.PI) * 0.28 : 0;
      for (const re of L) re.mesh.material = M.marked > 2 && !j ? e.material("#fff6dd") : re.material;
      k.visible = !h && M.hp < M.maxHp, z.scale.x = M.hp / M.maxHp, z.position.x = (M.hp / M.maxHp - 1) * 0.5;
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
function Vc(e, t) {
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
      for (const f of [o, u]) {
        const m = a("box", le.warning, 0.5);
        m.position.set(f, 0.14, (h + d) / 2), m.scale.set(0.1, 0.15, d - h);
      }
      for (const f of [h, d]) {
        const m = a("box", le.warning, 0.5);
        m.position.set((o + u) / 2, 0.14, f), m.scale.set(u - o, 0.15, 0.1);
      }
    }
    if (!s) return;
    const c = s.player;
    if (n("ring", "#f2f6e2", 0.64, c.x, c.y, 0.8), c.dashTime && !i) for (let o = 1; o <= 3; o++) {
      const u = a("cone", le.gold, 0.7 - o * 0.15);
      u.position.set(c.x - Math.cos(c.dashAngle) * o * 0.43, 0.45, c.y - Math.sin(c.dashAngle) * o * 0.43), u.scale.set(0.13, c.dashTime / 8 * 1.7, 0.13), u.rotation.set(0, -c.dashAngle, -Math.PI / 2);
    }
    if (!s.boss && (s.encounter === "siege" || s.encounter === "ritual")) {
      const o = s.objective;
      s.encounter === "ritual" && (n("disc", le.magic, 2.5, o.x, o.y, 0.12), n("ring", le.magic, 2.5, o.x, o.y), n("ring", le.gold, 2.2, o.x, o.y, 0.8));
      const u = a("cylinder", "#526b79");
      u.position.set(o.x, 0.3, o.y), u.scale.set(0.5, 0.6, 0.5);
      const h = a("rock", s.encounter === "siege" ? le.fire : le.magic);
      if (h.position.set(o.x, 1, o.y), h.scale.set(0.23, 0.5, 0.23), s.encounter === "siege") {
        h.position.y = 1.35, h.scale.set(0.4, 0.85, 0.4);
        const d = a("cone", le.gold, 0.8);
        d.position.set(o.x, 1.4, o.y), d.scale.set(0.2, 0.85, 0.2), n("ring", le.fire, 0.9, o.x, o.y, 0.8);
      }
      i || (h.rotation.y = s.tick * 0.025);
    }
    for (const o of s.companions)
      if (!(o.hp <= 0 || o.life <= 0))
        if (n("ring", le.heal, 0.4, o.x, o.y, 0.8), o.kind === "turret") {
          const u = a("cylinder", "#687c81");
          u.position.set(o.x, 0.25, o.y), u.scale.set(0.4, 0.5, 0.4);
          const h = a("box", "#bd9a68");
          h.position.set(o.x, 0.65, o.y), h.scale.set(0.9, 0.2, 0.25), h.rotation.y = -o.angle;
          const d = a("sphere", le.magic);
          d.position.set(o.x + Math.cos(o.angle) * 0.45, 0.65, o.y + Math.sin(o.angle) * 0.45), d.scale.setScalar(0.11);
        } else {
          const u = o.kind === "familiar" && c.resonance > 0, h = u ? 1.5 : 1, d = o.kind === "shade" ? "#a6acd8" : u ? wt.empowered : wt.familiar, f = i ? 0 : Math.sin(s.tick * 0.1 + o.id) * 0.08, m = a("sphere", d, 1, !0);
          m.position.set(o.x, 0.55 * h + f, o.y), m.scale.set(0.3 * h, 0.36 * h, 0.3 * h);
          for (const w of [-1, 1]) {
            const y = a("cone", d, 1, !0);
            y.position.set(o.x + w * 0.2 * h, 0.93 * h + f, o.y), y.scale.set(0.08 * h, 0.22 * h, 0.08 * h);
          }
          const x = a("sphere", "#35475b");
          if (x.position.set(o.x + Math.cos(o.angle) * 0.28 * h, 0.63 * h + f, o.y + Math.sin(o.angle) * 0.28 * h), x.scale.setScalar(0.07 * h), u) {
            const w = a("torus", wt.crest, 1, !0);
            w.position.set(o.x, 1.45 + f, o.y), w.rotation.x = Math.PI / 2, w.scale.setScalar(0.32);
            for (let y = 0; y < 3; y++) {
              const _ = y * Math.PI * 2 / 3, k = a("rock", wt.crest, 1, !0);
              k.position.set(o.x + Math.cos(_) * 0.32, 1.55 + f, o.y + Math.sin(_) * 0.32), k.scale.set(0.08, 0.17, 0.08);
            }
          }
        }
    for (const o of s.enemies) {
      if (Ie(o.kind) && o.phase > 1) {
        const u = me[o.kind].radius + 0.55;
        if (n("ring", o.kind === "king" ? le.fire : le.magic, u, o.x, o.y, 0.65), !i) for (let h = 0; h < o.phase + 2; h++) {
          const d = s.tick * 0.025 + h * Math.PI * 2 / (o.phase + 2), f = a("rock", o.kind === "king" ? le.fire : le.magic, 0.8);
          f.position.set(o.x + Math.cos(d) * u, 0.55 + Math.sin(d * 2) * 0.2, o.y + Math.sin(d) * u), f.scale.set(0.08, 0.19, 0.08);
        }
      }
      if (o.windup) {
        const u = 1 - o.windup / me[o.kind].windup;
        if (n("ring", le.warning, me[o.kind].radius + 0.35, o.x, o.y, 0.8), o.kind === "charger") {
          const h = Math.min(9, Math.hypot(o.target.x - o.x, o.target.y - o.y)), d = a("box", le.danger, 0.3);
          d.scale.set(0.75, 0.035, h), d.position.set(o.x + Math.cos(o.angle) * h / 2, 0.09, o.y + Math.sin(o.angle) * h / 2), d.rotation.y = Math.PI / 2 - o.angle, n("ring", le.danger, 0.5, o.target.x, o.target.y, 0.9);
        } else if (o.kind === "archer") {
          const h = Math.hypot(o.target.x - o.x, o.target.y - o.y), d = a("box", le.warning, 0.6);
          d.position.set((o.x + o.target.x) / 2, 0.11, (o.y + o.target.y) / 2), d.scale.set(h, 0.03, 0.09), d.rotation.y = -o.angle;
        } else o.kind === "bomber" ? n("ring", le.warning, 1.9, o.target.x, o.target.y) : (o.kind === "soldier" || o.kind === "guard" || o.kind === "stalker") && (n("disc", le.danger, me[o.kind].reach, o.target.x, o.target.y, 0.15 + u * 0.2), n("ring", le.danger, me[o.kind].reach, o.target.x, o.target.y));
      }
      if (o.chill && n("ring", le.frost, me[o.kind].radius + 0.13, o.x, o.y), o.exposed && n("arc", le.gold, me[o.kind].radius + 0.3, o.x, o.y, 0.9), o.burn && !i) for (let u = 0; u < 3; u++) {
        const h = a("rock", le.fire, 0.8);
        h.position.set(o.x + Math.sin(u * 2) * 0.3, 0.35 + (s.tick + u * 7) % 20 / 18, o.y + Math.cos(u * 2) * 0.3), h.scale.set(0.08, 0.2, 0.08);
      }
      o.kind === "priest" && n("ring", "#a39aca", 3.5, o.x, o.y, 0.4);
    }
    for (const o of s.hazards) {
      const u = o.friendly ? o.kind === "fire" ? le.fire : le.magic : le.danger;
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
        n("ring", le.gold, o.radius * (0.7 + Math.sin(s.tick * 0.1) * 0.1), o.x, o.y, 0.7, 0.25);
        for (let h = 0; h < 6; h++) {
          const d = h * Math.PI / 3, f = a("cone", u, 0.7);
          f.position.set(o.x + Math.cos(d) * o.radius * 0.65, 0.45, o.y + Math.sin(d) * o.radius * 0.65), f.scale.set(0.15, 0.9, 0.15);
        }
      }
    }
    for (const o of s.shots) {
      const u = o.friendly ? le.gold : le.danger, h = a("sphere", o.friendly ? "#fffbea" : "#fff1c9");
      h.position.set(o.x, 0.6, o.y), h.scale.set(0.11, 0.11, 0.11);
      const d = a("sphere", u, 0.8);
      d.position.copy(h.position), d.scale.set(0.21, 0.18, 0.21);
      const f = a("cone", u, 0.5);
      f.position.set(o.x - Math.cos(o.angle) * 0.38, 0.6, o.y - Math.sin(o.angle) * 0.38), f.scale.set(0.14, 0.75, 0.14), f.rotation.set(0, -o.angle, -Math.PI / 2);
    }
    for (const o of s.effects) {
      const u = 1 - o.life / (o.kind === "slash" ? 9 : 15);
      if (o.kind === "slash") {
        const h = n("arc", le.gold, o.size, o.x, o.y, 0.3 * (1 - u), 0.42);
        h.rotation.z = -o.angle - 0.9 + u * 0.4;
        const d = n("stroke", "#fff4d2", o.size, o.x, o.y, 0.9 * (1 - u), 0.43);
        d.rotation.z = h.rotation.z;
      } else if (o.kind === "resonance") {
        n("ring", wt.crest, o.size * (i ? 1 : 0.6 + u * (2 - u)), o.x, o.y, 0.8 - u * 0.6, 0.16);
        for (const h of s.companions) {
          if (h.kind !== "familiar" || h.hp <= 0 || h.life <= 0) continue;
          const d = h.x - c.x, f = h.y - c.y, m = a("box", wt.empowered, 1 - u * 0.7);
          m.position.set((c.x + h.x) / 2, 1.1, (c.y + h.y) / 2), m.scale.set(Math.hypot(d, f), 0.045, 0.045), m.rotation.y = -Math.atan2(f, d);
        }
        for (let h = 0; h < 4; h++) {
          const d = h * Math.PI / 2 + (i ? 0 : u), f = a("rock", wt.empowered, 1 - u * 0.4);
          f.position.set(c.x + Math.cos(d) * 0.95, 1.7 + (i ? 0 : u * 0.5), c.y + Math.sin(d) * 0.95), f.scale.set(0.08, 0.18, 0.08);
        }
      } else if (o.kind === "lightning") {
        for (let h = 0; h < 4; h++) {
          const d = a("box", h % 2 ? "#ffffff" : le.magic, 1 - u * 0.6);
          d.scale.set(0.09 + (1 - u) * 0.09, 1.05, 0.08), d.position.set(o.x + (h % 2 ? 0.14 : -0.14), 0.5 + h * 0.85, o.y), d.rotation.z = h % 2 ? -0.35 : 0.35;
        }
        n("ring", le.magic, 0.4 + u, o.x, o.y, 1 - u);
      } else if (o.kind === "block" || o.kind === "parry" || o.kind === "ward-hit" || o.kind === "ward-break") {
        const h = o.kind === "block" || o.kind === "parry", d = o.kind === "ward-break", f = h ? o.kind === "parry" ? at.parry : at.block : at.ward;
        if (h) {
          const m = a("ring", f, 1 - u);
          m.position.set(o.x + Math.cos(o.angle) * 0.7, 1.3, o.y + Math.sin(o.angle) * 0.7), m.rotation.y = Math.PI / 2 - o.angle, m.scale.setScalar(0.6 + u * (o.kind === "parry" ? 1.3 : 0.6));
        }
        for (let m = 0; m < (d ? 6 : 4); m++) {
          const x = m * 2.4 + o.id, w = a(d ? "rock" : "box", f, 1 - u), y = i ? 1.1 : 0.7 + u * (d ? 1.5 : 0.6);
          w.position.set(o.x + Math.cos(x) * y, 0.7 + m % 3 * 0.55, o.y + Math.sin(x) * y), w.scale.set(0.07 * (1 - u), (d ? 0.3 : 0.16) * (1 - u), 0.04), w.rotation.set(x, x, x);
        }
      } else if (o.kind === "heal") n("ring", le.heal, 0.4 + u, o.x, o.y, 1 - u);
      else {
        const h = o.kind === "hit" ? le.danger : le.gold;
        if (n("ring", h, o.size * (0.4 + u), o.x, o.y, 1 - u), !i) for (let d = 0; d < 7; d++) {
          const f = d * 2.4 + o.id, m = a("rock", h, 1 - u * 0.8);
          m.position.set(o.x + Math.cos(f) * u * o.size, 0.4 + Math.sin(u * Math.PI) * 0.8, o.y + Math.sin(f) * u * o.size), m.scale.set(0.1 * (1 - u), 0.28 * (1 - u), 0.1 * (1 - u)), m.rotation.z = f;
        }
      }
    }
  } };
}
function Gc(e) {
  const t = document.createElement("div"), r = document.createElement("i");
  t.className = "exp-world-ward", t.style.setProperty("--ward-color", at.ward), t.setAttribute("role", "meter"), t.setAttribute("aria-label", ie.ward), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(X.maxHp)), t.append(r);
  const a = document.createElement("div");
  a.className = "exp-world-defense", e.append(t, a), t.hidden = !0, a.hidden = !0;
  const n = new ht();
  let s = null, i = 0, l = 0, c = null;
  function o(u, h, d, f, m, x, w) {
    n.set(h, d, f).project(m), u.style.left = `${(n.x * 0.5 + 0.5) * x}px`, u.style.top = `${(-n.y * 0.5 + 0.5) * w}px`;
  }
  return {
    update(u, h, d, f) {
      if (u !== s && (s = u, i = 0, c = null, l = 0), t.hidden = !u || u.player.ward <= 0, a.hidden = !u, !u) return;
      const m = u.player;
      t.hidden || (r.style.width = `${m.ward / X.maxHp * 100}%`, t.setAttribute("aria-valuenow", String(m.ward)), o(t, m.x, 0, m.y, h, d, f));
      const x = u.effects.filter((y) => y.id > i && y.kind in ie.defenseFeedback), w = x.find((y) => y.kind === "parry" || y.kind === "ward-break") ?? x.at(-1);
      w && (c = w.kind, l = u.tick + 27), i = u.serial, u.tick >= l && (c = null), a.hidden = !c && !m.shield, a.dataset.state = c ?? "blocking", a.textContent = c ? ie.defenseFeedback[c] : m.shield ? ie.guardActive : "", o(a, m.x, m.shield ? 3.65 : 3.05, m.y, h, d, f);
    },
    dispose() {
      t.remove(), a.remove();
    }
  };
}
function Yc(e, t, r, a) {
  const n = a.facing === "east" || a.facing === "west", s = n ? a.footprint.depth : a.footprint.width, i = n ? a.footprint.width : a.footprint.depth, l = s >= i;
  t.rotation.y = r.rotation.y = a.facing === "north" ? Math.PI : a.facing === "east" ? Math.PI / 2 : a.facing === "west" ? -Math.PI / 2 : 0;
  const c = a.entrance ? 1 : Math.max(1, Math.floor(Math.max(s, i) / 5));
  e.mesh(t, "box", p.mortar, [
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
    ]), f = (a.height ?? 4) + (o % 3 - 1) * 0.35, m = a.kind === "workshop", x = a.facing ? a.tint === "rose" ? "#c9b8cb" : a.tint === "sage" ? "#b6c5ca" : "#d4c8bb" : o % 2 ? p.stone : p.cloth;
    e.mesh(d, "box", x, [
      u - 0.15,
      f - 0.4,
      h - 0.15
    ], [
      0,
      (f + 0.4) / 2,
      0
    ]);
    for (const z of [-u / 2 + 0.12, u / 2 - 0.12]) e.mesh(d, "box", p.timber, [
      0.18,
      f,
      h
    ], [
      z,
      f / 2,
      0
    ]);
    for (const z of [0.7, f - 0.3]) e.mesh(d, "box", p.wood, [
      u,
      0.15,
      h
    ], [
      0,
      z,
      0
    ]);
    const w = e.group(d, [
      0,
      f + 0.24,
      0
    ]);
    w.rotation.x = -0.18;
    const y = !l && c > 1 ? h - 0.03 : h + 0.7;
    e.mesh(w, "box", p.roof, [
      u + 0.6,
      0.16,
      y
    ]);
    for (let z = -u / 2; z <= u / 2; z += 0.8) e.mesh(w, "box", p.roofLight, [
      0.055,
      0.07,
      y
    ], [
      z,
      0.12,
      0
    ]);
    e.mesh(w, "box", p.brass, [
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
    ]), k = a.entrance ? 0 : -u * 0.19;
    e.mesh(_, "box", p.shadow, [
      1.05,
      2.1,
      0.1
    ], [
      k,
      1.1,
      0
    ]);
    for (const z of [
      -0.4,
      -0.13,
      0.14,
      0.41
    ]) e.mesh(_, "box", p.wood, [
      0.24,
      1.95,
      0.12
    ], [
      k + z,
      1.06,
      0.04
    ]);
    if (e.mesh(_, "box", p.shadow, [
      0.9,
      0.9,
      0.12
    ], [
      u * 0.27,
      2.25,
      0.03
    ]), e.mesh(_, "box", p.ember, [
      0.7,
      0.67,
      0.14
    ], [
      u * 0.27,
      2.25,
      0.1
    ], !0), e.mesh(_, "box", p.timber, [
      0.07,
      0.85,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), e.mesh(_, "box", p.timber, [
      0.85,
      0.07,
      0.16
    ], [
      u * 0.27,
      2.25,
      0.15
    ]), a.facing) {
      for (const [z, L, b] of [
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
        const E = e.group(d);
        E.rotation.y = z;
        for (let S = -b / 2 + 1.8; S < b / 2 - 0.8; S += 3.2) for (let C = 2.1; C < f - 0.65; C += 2.5)
          z === 0 && C < 3 && (Math.abs(S - k) < 1.3 || Math.abs(S - u * 0.27) < 1.3) || (e.mesh(E, "box", p.shadow, [
            1.16,
            1.45,
            0.12
          ], [
            S,
            C,
            L
          ]), e.mesh(E, "box", p.ember, [
            0.94,
            1.17,
            0.07
          ], [
            S,
            C,
            L + 0.08
          ], !0), e.mesh(E, "box", p.timber, [
            0.08,
            1.3,
            0.11
          ], [
            S,
            C,
            L + 0.14
          ]), e.mesh(E, "box", p.timber, [
            1.03,
            0.09,
            0.11
          ], [
            S,
            C,
            L + 0.14
          ]), e.mesh(E, "box", p.light, [
            1.4,
            0.14,
            0.34
          ], [
            S,
            C - 0.76,
            L + 0.09
          ]));
        f > 5.5 && e.mesh(E, "box", p.light, [
          b,
          0.17,
          0.17
        ], [
          0,
          3.35,
          L
        ]);
      }
      if (a.entrance) {
        e.mesh(_, "box", p.timber, [
          2.9,
          0.8,
          0.18
        ], [
          0,
          3.45,
          0.14
        ]);
        for (const z of [
          -0.8,
          0,
          0.8
        ]) e.mesh(_, "box", p.brass, [
          0.25,
          0.38,
          0.04
        ], [
          z,
          3.45,
          0.25
        ]);
        for (const z of [-1, 1])
          e.mesh(_, "box", p.brass, [
            0.1,
            0.8,
            0.5
          ], [
            z * 1.6,
            2.9,
            0.25
          ]), e.mesh(_, "box", p.ember, [
            0.35,
            0.48,
            0.3
          ], [
            z * 1.6,
            2.5,
            0.43
          ], !0);
      }
    }
    if (h >= 4 && (l || o === c - 1)) {
      const z = e.group(_, [
        0,
        2.8,
        0.55
      ]);
      z.rotation.x = 0.22, e.mesh(z, "box", a.tint === "rose" ? p.rose : p.cloth, [
        u * 0.8,
        0.045,
        1.6
      ]), e.mesh(z, "box", p.light, [
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
      for (let z = 0; z < 3; z++) e.mesh(d, "cylinder", p.brass, [
        0.18,
        0.6,
        0.18
      ], [
        (z - 1) * 0.55,
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
function Qc(e, t, r) {
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
    const l = e.mesh(a, "box", p.wood, [
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
function Kc(e, t) {
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
function Xc(e, t, r, a) {
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
function Jc(e, t, r) {
  const a = new ht(...r.from), n = new ht(...r.to), s = n.clone().sub(a), i = s.length(), l = r.kind === "pipe", c = l ? 0.23 : 0.018, o = e.mesh(t, "cylinder", l ? p.brass : p.timber, [
    c,
    i,
    c
  ], a.clone().add(n).multiplyScalar(0.5).toArray());
  if (o.quaternion.setFromUnitVectors(new ht(0, 1, 0), s.normalize()), l) for (let u = 1; u < i; u += 3.7) {
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
function ed(e, t, r) {
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
    for (const l of [-1, 1]) e.mesh(t, "box", p.timber, [
      0.25,
      1.1,
      n - 0.4
    ], [
      l * (a / 2 - 0.3),
      0.55,
      0
    ]);
    for (let l = -1; l <= 1; l++)
      e.mesh(t, "box", p.slate, [
        0.85,
        0.17,
        1.1
      ], [
        l * 1.2,
        1.35,
        -0.3
      ]), e.mesh(t, "box", p.light, [
        0.77,
        0.025,
        0.98
      ], [
        l * 1.2,
        1.45,
        -0.3
      ]), e.mesh(t, "box", p.brass, [
        0.08,
        0.025,
        1.13
      ], [
        l * 1.2,
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
  for (let l = 0; l < s; l++) for (let c = 0; c < i; c++) {
    const o = -a / 2 + (c + 0.5) * a / i, u = -n / 2 + (l + 0.5) * n / s, h = a / i - 0.22, d = n / s - 0.24;
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
      const f = 0.85 + (l + c) % 3 * 0.22;
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
      (l + c) % 3 === 0 && (e.mesh(t, "box", p.cloth, [
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
function td(e, t, r, a) {
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
function cs(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.tint === "rose" ? p.rose : r.tint === "amber" ? p.amber : p.leafLight, i = (l) => {
    for (const c of [-1, 1]) for (const o of [-1, 1]) e.mesh(t, "box", p.timber, [
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
      for (const l of [-1, 1]) e.mesh(t, "cylinder", p.brass, [
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
      for (const l of [-1, 1]) e.mesh(t, "box", p.cloth, [
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
      e.mesh(t, "box", p.timber, [
        a - 0.15,
        2.9,
        n - 0.15
      ], [
        0,
        2.9 / 2,
        0
      ]);
      for (const c of [-1, 1])
        e.mesh(t, "box", p.wood, [
          a / 2 - 0.18,
          2.9 - 0.35,
          0.14
        ], [
          c * a / 4,
          2.9 / 2,
          n / 2
        ]), e.mesh(t, "box", p.cloth, [
          a / 2 - 0.5,
          2.9 - 0.8,
          0.025
        ], [
          c * a / 4,
          1.51,
          n / 2 + 0.09
        ]), e.mesh(t, "box", p.brass, [
          0.045,
          0.27,
          0.08
        ], [
          c * 0.2,
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
      for (const l of [-1, 1]) e.mesh(t, "box", p.timber, [
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
        e.mesh(t, "box", p.wood, [
          a,
          0.15,
          n
        ], [
          0,
          l,
          0
        ]);
        for (let c = 0; c < 4; c++) e.mesh(t, "cylinder", p.brass, [
          0.12,
          n * 0.8,
          0.12
        ], [
          -a * 0.3 + c * 0.6,
          l + 0.21,
          0
        ]).rotation.x = Math.PI / 2;
        e.mesh(t, "box", p.shadow, [
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
      e.mesh(t, "box", p.timber, [
        a - 0.2,
        l,
        n - 0.2
      ], [
        0,
        l / 2,
        0
      ]);
      for (let c = -a / 2 + 0.55; c < a / 2 - 0.2; c += 1) for (let o = 0.5; o < l - 0.1; o += 0.8)
        e.mesh(t, "box", p.wood, [
          0.88,
          0.68,
          0.12
        ], [
          c,
          o,
          n / 2 - 0.04
        ]), e.mesh(t, "sphere", p.brass, [
          0.055,
          0.055,
          0.06
        ], [
          c,
          o,
          n / 2 + 0.03
        ]);
      e.mesh(t, "box", p.cloth, [
        a * 0.45,
        0.13,
        n * 0.66
      ], [
        -a * 0.2,
        l + 0.075,
        0
      ]);
      for (let c = 0; c < 3; c++) e.mesh(t, "cylinder", c % 2 ? p.pottery : p.light, [
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
        for (let l = 0; l < 3; l++) e.mesh(t, "cylinder", p.brass, [
          0.15,
          1,
          0.15
        ], [
          (l - 1) * 0.7,
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
        for (const l of [-0.45, 0.45]) e.mesh(t, "cylinder", p.light, [
          0.13,
          0.19,
          0.13
        ], [
          a * 0.2 + 0.65,
          1.48,
          l
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
      for (const l of [-1, 1]) e.mesh(t, "box", p.timber, [
        0.14,
        1.5,
        0.14
      ], [
        l * (a / 2 - 0.3),
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
      const l = a > n, c = Math.max(a, n), o = e.group(t);
      l || (o.rotation.y = Math.PI / 2);
      for (let u = -c / 2 + 0.15; u < c / 2; u += 1.4)
        e.mesh(o, "box", p.timber, [
          0.09,
          2.8,
          0.12
        ], [
          u,
          1.4,
          0
        ]), e.mesh(o, "box", p.cloth, [
          Math.min(1.27, c / 2 - u),
          2.15,
          0.055
        ], [
          u + Math.min(0.68, (c / 2 - u) / 2),
          1.53,
          0
        ]);
      for (const u of [-1, 1]) e.mesh(o, "box", p.timber, [
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
function ad(e, t, r, a) {
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
  const l = n > s, c = Math.max(n, s);
  for (let o = -c / 2 + 0.3; o < c / 2; o += 3.5) e.mesh(r, "box", p.wood, [
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
function nd(e, t) {
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
}, Ye = be;
function hr(e, t, r) {
  const { width: a, depth: n } = r.footprint, s = r.height;
  if (r.kind === "cliff") {
    const i = a > n, l = Math.ceil(Math.max(a, n) / 7);
    for (let c = 0; c < l; c++) {
      const o = [
        i ? -a / 2 + (c + 0.5) * a / l : 0,
        s * 0.4,
        i ? 0 : -n / 2 + (c + 0.5) * n / l
      ];
      e.mesh(t, "rock", Ye.ice, [
        i ? a / l * 0.55 : a / 2,
        s * 0.7,
        i ? n / 2 : n / l * 0.55
      ], o), e.mesh(t, "rock", Ye.snow, [
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
  if (e.mesh(t, "box", Ye.soot, [
    a,
    0.65,
    n
  ], [
    0,
    0.325,
    0
  ]), r.kind === "hoist") {
    for (const i of [-1, 1]) {
      e.mesh(t, "box", Ye.iron, [
        0.65,
        s,
        n * 0.72
      ], [
        i * (a / 2 - 0.5),
        s / 2,
        0
      ]);
      for (let l = 2; l < s; l += 4) e.mesh(t, "box", Ye.copper, [
        a,
        0.25,
        0.3
      ], [
        0,
        l,
        n * 0.34
      ]);
      e.mesh(t, "cylinder", Ye.edge, [
        0.075,
        s - 2,
        0.075
      ], [
        i * a * 0.18,
        s / 2,
        0.6
      ]);
    }
    e.mesh(t, "box", Ye.iron, [
      a + 0.4,
      1,
      n
    ], [
      0,
      s,
      0
    ]), e.mesh(t, "torus", Ye.copper, [
      a * 0.3,
      a * 0.3,
      0.8
    ], [
      0,
      s - 1.8,
      0.3
    ]), e.mesh(t, "box", Ye.edge, [
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
  e.mesh(t, "cylinder", Ye.iron, [
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
  ]) e.mesh(t, "cylinder", Ye.copper, [
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
    e.mesh(t, "box", Ye.edge, [
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
    e.mesh(t, "box", Ye.soot, [
      a * 0.16,
      s * 0.34,
      0.15
    ], [
      i * a * 0.23,
      s * 0.58,
      n * 0.45
    ]);
    for (let l = 0; l < 5; l++) e.mesh(t, "box", Ye.copper, [
      a * 0.16,
      0.14,
      0.2
    ], [
      i * a * 0.23,
      s * 0.44 + l * s * 0.065,
      n * 0.46
    ]);
  }
  e.mesh(t, "box", Ye.soot, [
    a * 0.4,
    s * 0.22,
    0.18
  ], [
    0,
    s * 0.16,
    n * 0.45
  ]), e.mesh(t, "torus", Ye.copper, [
    Math.min(a * 0.16, 1.3),
    Math.min(a * 0.16, 1.3),
    0.25
  ], [
    0,
    s * 0.18,
    n * 0.47
  ]);
}
function rd(e, t, r) {
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
  hr(e, e.group(t, [
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
    hr(e, e.group(t, [
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
function yo(e, t, r, a, n = 2.8) {
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
function wo(e, t, r, a, n, s) {
  const i = r / 2 + 0.45, l = Math.atan2(s, i), c = Math.hypot(i, s);
  for (const o of [-1, 1]) {
    const u = e.group(t, [
      o * i / 2,
      n + s / 2,
      0
    ]);
    u.rotation.z = -o * l, e.mesh(u, "box", p.roof, [
      c + 0.2,
      0.18,
      a + 1.1
    ]);
    for (let h = 0; h < Math.ceil(c / 0.65); h++) e.mesh(u, "box", h % 3 ? p.roof : p.roofLight, [
      0.14,
      0.07,
      a + 1.15
    ], [
      -c / 2 + h * 0.65,
      0.13,
      0
    ]);
    e.mesh(u, "box", p.shadow, [
      0.2,
      0.24,
      a + 1.25
    ], [
      o * c / 2,
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
function bn(e, t, r, a, n, s = 1.1) {
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
function sd(e, t, r) {
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
  for (const u of [-a * 0.29, a * 0.29]) bn(e, t, u, n / 2, 2.3, s ? 1.6 : 1.2);
  const l = e.group(t, [
    a / 2,
    0,
    0
  ]);
  l.rotation.y = Math.PI / 2;
  for (const u of [-n * 0.27, n * 0.27]) bn(e, l, u, 0.03, 2.3);
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
  ]), wo(e, t, a, n, i, s ? 1.15 : 3.2);
  const c = e.group(t, [
    -a * 0.27,
    i,
    -n * 0.18
  ]), o = s ? 2.1 : 3.3;
  if (e.mesh(c, "box", p.stone, [
    1.1,
    o,
    1.2
  ], [
    0,
    o / 2,
    0
  ]), e.mesh(c, "box", p.light, [
    1.4,
    0.3,
    1.5
  ], [
    0,
    o - 0.2,
    0
  ]), e.mesh(c, "box", p.shadow, [
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
    bn(e, t, 0, n / 2 + 0.09, i + 1, 0.9), e.mesh(t, "box", p.timber, [
      a + 0.4,
      0.26,
      0.24
    ], [
      0,
      3.5,
      n / 2 + 0.25
    ]);
}
function od(e, t, r) {
  const a = r.height, n = r.footprint.width, s = r.tint === "amber", i = r.tint === "rose", l = s ? p.amber : i ? p.rose : p.leaf, c = s ? p.amberLight : i ? "#dfb2a1" : p.leafLight, o = e.mesh(t, "cylinder", p.timber, [
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
    const h = u * 2.4, d = u === 8 ? 0.1 : n * 0.56, f = e.mesh(t, "crown", u % 3 ? l : c, [
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
function id(e, t, r) {
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
  for (const i of [s * 0.35, s * 0.7]) bn(e, t, 0, n / 2 + 0.02, i, 0.7);
  wo(e, t, a + 0.35, n + 0.35, s, s * 0.32), e.mesh(t, "cylinder", p.brass, [
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
function ld(e, t, r, a, n) {
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
      hr(e, l, a);
      break;
    case "door":
      nd(e, l);
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
      Yc(e, i, l, a);
      break;
    case "stove":
      Kc(e, i);
      break;
    case "medicine":
      Xc(e, i, s.width, s.depth);
      break;
    case "cargo":
    case "fuel":
    case "ledger":
      ed(e, i, a);
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
      ]), sd(e, l, a);
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
      for (let c = 0; c < 7; c++) {
        const o = c * 0.9;
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
      od(e, l, a);
      break;
    case "tower":
      id(e, l, a);
      break;
    case "column": {
      const c = a.height, o = Math.min(s.width, s.depth) * 0.3;
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
      ]), e.mesh(l, "cylinder", p.stone, [
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
        e.mesh(l, "box", p.light, [
          0.085,
          c - 2,
          0.085
        ], [
          Math.sin(h) * o,
          c / 2,
          Math.cos(h) * o
        ]);
      }
      for (const u of [0.85, c - 0.7]) e.mesh(l, "cylinder", p.brass, [
        o * 1.15,
        0.18,
        o * 1.15
      ], [
        0,
        u,
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
        ], p.brass, [
          0,
          0,
          0
        ], 0.14);
      }
      break;
    case "bunk":
      td(e, i, s.width, s.depth);
      for (const c of [0.55, 1.9])
        e.mesh(i, "box", p.timber, [
          s.width - 0.5,
          0.18,
          s.depth - 0.5
        ], [
          0,
          c,
          0
        ]), e.mesh(i, "box", p.cloth, [
          s.width - 0.8,
          0.18,
          s.depth - 0.9
        ], [
          0,
          c + 0.16,
          0
        ]), e.mesh(i, "box", p.light, [
          s.width - 1,
          0.24,
          1.2
        ], [
          0,
          c + 0.28,
          -s.depth / 2 + 1.3
        ]);
      for (const c of [-1, 1]) for (const o of [-1, 1]) e.mesh(i, "box", p.shadow, [
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
        const h = u * Math.PI * 0.4, d = s.width * 0.25, f = e.group(l, [
          Math.sin(h) * o * 0.45,
          0,
          Math.cos(h) * o * 0.45
        ]);
        f.rotation.y = h;
        const m = e.mesh(f, "cylinder", u % 2 ? p.root : p.rootLight, [
          o * 0.65,
          c * 0.64,
          o * 0.49
        ], [
          0,
          c * 0.3,
          0
        ]);
        m.rotation.z = 0.13;
        const x = e.group(f, [
          0,
          c * 0.48,
          0
        ]);
        x.rotation.z = 0.4 + u * 0.12, e.mesh(x, "cone", p.root, [
          o * 0.47,
          c * 0.55,
          o * 0.4
        ], [
          0,
          c * 0.25,
          0
        ]);
        const w = e.mesh(f, "cone", p.root, [
          o * 0.5,
          d * 1.4,
          o * 0.4
        ], [
          d * 0.6,
          0.7,
          0
        ]);
        w.rotation.z = -1.15;
      }
      if (c > 8) {
        e.mesh(l, "rock", p.shadow, [
          o * 0.65,
          c * 0.22,
          0.35
        ], [
          0,
          c * 0.38,
          o * 0.65
        ]), e.mesh(l, "rock", p.brass, [
          o * 0.16,
          c * 0.16,
          0.15
        ], [
          0,
          c * 0.4,
          o * 0.68
        ], !0);
        for (let u = 0; u < 7; u++) e.mesh(l, "crown", u % 2 ? p.leaf : p.leafLight, [
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
      e.mesh(i, "box", p.light, [
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
      const c = a.height;
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
      for (const o of [-1, 1]) {
        const u = e.group(l, [
          o * (s.width / 2 - 0.5),
          c - 2.2,
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
        ad(e, i, l, a);
        break;
      }
      const c = a.height, o = Math.min(c, 0.65);
      a.wallUse === "homes" && Qc(e, l, s), e.mesh(i, "box", p.mortar, [
        s.width,
        o,
        s.depth
      ], [
        0,
        o / 2,
        0
      ]), c > o && e.mesh(l, "box", n ? p.marble : p.stone, [
        s.width,
        c - o,
        s.depth
      ], [
        0,
        (c + o) / 2,
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
      const u = s.width > s.depth, h = Math.max(s.width, s.depth);
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
        for (let d = -h / 2 + 3; d < h / 2 - 1; d += 6) for (const f of [-1, 1]) {
          const m = e.group(l, [
            u ? d : f * (s.width / 2 + 0.04),
            0,
            u ? f * (s.depth / 2 + 0.04) : d
          ]);
          m.rotation.y = u ? f < 0 ? Math.PI : 0 : f * Math.PI / 2;
          const x = c * 0.61, w = Math.min(2.1, c * 0.3);
          e.mesh(m, "box", p.undercroft, [
            1.5,
            w,
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
          ]) e.mesh(m, "box", p.shadow, [
            0.07,
            w,
            0.06
          ], [
            y,
            x,
            0.06
          ]);
          for (const y of [-1, 1]) e.mesh(m, "box", p.light, [
            1.9,
            0.15,
            0.2
          ], [
            0,
            x + y * w / 2,
            0.06
          ]);
          e.mesh(m, "box", p.stone, [
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
        c > 4 && e.mesh(l, "box", p.stone, u ? [
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
        for (let f = 0; f < Math.floor(c / 0.9); f++) e.mesh(l, "box", p.mortar, u ? [
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
      for (let c = 0; c < s.width * s.depth / 9; c++) {
        const o = Math.sin(c * 7.3) * (s.width / 2 - 0.8), u = Math.cos(c * 3.7) * (s.depth / 2 - 0.3);
        e.mesh(i, "box", p.ripple, [
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
      for (let c = -s.width / 2 + 0.65; c < s.width / 2; c += 1) for (let o = -s.depth / 2 + 0.6; o < s.depth / 2; o += 0.95) {
        const u = Math.sin(c * 7 + o * 19), h = s.width > 8 ? 0.63 : 0.37;
        e.mesh(i, "crown", u > 0.3 ? p.leafLight : p.leaf, [
          h,
          0.32 + u * 0.1,
          h * 0.9
        ], [
          c + u * 0.15,
          0.81,
          o
        ]), u > 0.5 && e.mesh(i, "rock", u > 0.8 ? p.light : p.rose, [
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
      e.mesh(i, "box", p.soil, [
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
        e.mesh(i, "crown", u > 0 ? p.leaf : p.leafLight, [
          0.7,
          h,
          0.7
        ], [
          c,
          h * 0.75,
          o
        ]), u > 0.75 && e.mesh(i, "rock", p.amberLight, [
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
      e.mesh(i, "box", p.wood, [
        s.width - 1,
        0.35,
        s.depth - 1.2
      ], [
        0,
        1.1,
        0
      ]);
      for (const c of [-1, 1]) {
        for (let o = 0; o < 3; o++) e.mesh(i, "box", p.wood, [
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
            c * (s.width / 2 - 0.2),
            0.76,
            o
          ]).rotation.y = Math.PI / 2;
          for (let u = 0; u < 4; u++) {
            const h = e.mesh(i, "box", p.wood, [
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
      for (let c = 0; c < 4; c++) {
        const o = e.group(i, [
          c % 2 * 1.5 - 0.75,
          c === 3 ? 1.3 : 0,
          c < 2 ? -0.7 : 0.7
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
      for (const c of [-1, 1]) e.mesh(i, "box", p.shadow, [
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
      e.mesh(i, "box", p.stone, [
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
        e.mesh(l, "cylinder", p.stone, [
          h,
          u,
          h
        ], [
          o,
          u / 2 + 0.3,
          -s.depth * 0.2
        ]), e.mesh(l, "box", p.light, [
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
          e.mesh(l, "box", p.mortar, [
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
  return l.children.length > 0;
}
var Ka = 1e-7;
function pr(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function ds(e, t, r, a) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const i = e[s], l = e[(s + 1) % e.length], c = pr(t, r, i), o = pr(t, r, l), u = a ? c >= -1e-7 : c <= Ka, h = a ? o >= -1e-7 : o <= Ka;
    if (u && n.push(i), u !== h && Math.abs(c - o) > Ka) {
      const d = c / (c - o);
      n.push([i[0] + (l[0] - i[0]) * d, i[1] + (l[1] - i[1]) * d]);
    }
  }
  return n;
}
function bo(e) {
  return Math.abs(e.reduce((t, r, a) => t + r[0] * e[(a + 1) % e.length][1] - r[1] * e[(a + 1) % e.length][0], 0)) / 2;
}
function cd(e, t) {
  let r = e;
  const a = [];
  for (let n = 0; n < t.length && r.length >= 3; n++) {
    const s = t[n], i = t[(n + 1) % t.length], l = ds(r, s, i, !1);
    bo(l) > Ka && a.push(l), r = ds(r, s, i, !0);
  }
  return a;
}
function dd(e, t, r) {
  const a = t[0] - e[0], n = t[1] - e[1], s = r / (2 * Math.hypot(a, n)), i = -n * s, l = a * s;
  return [
    [e[0] + i, e[1] + l],
    [e[0] - i, e[1] - l],
    [t[0] - i, t[1] - l],
    [t[0] + i, t[1] + l]
  ];
}
function xo(e, t) {
  const r = [];
  for (const a of e) {
    for (let n = 1; n < a.points.length; n++) r.push(dd(a.points[n - 1], a.points[n], a.width + t));
    for (const [n, s] of a.points.slice(1, -1)) r.push(Array.from({ length: 12 }, (i, l) => {
      const c = l * Math.PI / 6, o = (a.width + t) / 2;
      return [n + Math.cos(c) * o, s + Math.sin(c) * o];
    }));
  }
  return r;
}
function ud(e, t = 0) {
  const r = xo(e, t), a = [];
  for (let n = 0; n < r.length; n++) {
    let s = [r[n]];
    for (let i = 0; i < n && s.length; i++) s = s.flatMap((l) => cd(l, r[i]));
    a.push(...s.filter((i) => bo(i) > Ka));
  }
  return a;
}
function hd(e, t, r, a) {
  if (r === "boards") return;
  const n = r === "marble", s = r === "street", i = r === "iron", l = r === "snow";
  for (const [u, h, d] of [[
    l ? 1.1 : 0.4,
    0.025,
    l ? be.snowCrest : i ? be.copper : n ? p.brass : s ? p.streetSeam : p.mortar
  ], [
    0,
    0.04,
    l ? be.snowPath : i ? be.walkway : n ? p.slate : s ? p.streetStone : p.stone
  ]]) for (const f of ud(t, u)) {
    const m = f.reduce((y, _) => y + _[0], 0) / f.length, x = f.reduce((y, _) => y + _[1], 0) / f.length, w = e.shape(a(m, x), f.map((y) => [y[0], -y[1]]), d, [
      0,
      h,
      0
    ]);
    w.rotation.x = -Math.PI / 2, w.castShadow = !1;
  }
  if (l) return;
  const c = xo(t, 0.4);
  let o = 0;
  for (const u of t) {
    for (let h = 1; h < u.points.length; h++, o++) {
      const d = u.points[h - 1], f = u.points[h], m = f[0] - d[0], x = f[1] - d[1], w = Math.hypot(m, x);
      for (let y = 1.5; y < w; y += 1.65) {
        const _ = d[0] + m * y / w, k = d[1] + x * y / w;
        if (c.some((L, b) => b !== o && L.every((E, S) => pr(E, L[(S + 1) % L.length], [_, k]) >= -1e-7))) continue;
        const z = e.mesh(a(_, k), "box", i ? be.iron : n ? p.shadow : s ? p.streetSeam : p.mortar, [
          u.width - 0.08,
          0.012,
          0.025
        ], [
          _,
          0.049,
          k
        ]);
        if (z.rotation.y = Math.atan2(m, x), z.castShadow = !1, s) {
          const L = e.mesh(a(_, k), "box", p.streetSeam, [
            0.025,
            0.012,
            1.4
          ], [
            _ + Math.cos(y) * 0.55,
            0.049,
            k
          ]);
          L.rotation.y = Math.atan2(m, x), L.castShadow = !1;
        }
      }
    }
    o += u.points.length - 2;
  }
}
function pd(e, t) {
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
  ].filter(([u, h, d, f]) => d > u && f > h).map(([u, h, d, f]) => ({
    x: (u + d) / 2,
    z: (h + f) / 2,
    width: d - u,
    depth: f - h
  }));
}
function Xn(e, t, r) {
  const a = r[0] - t[0], n = r[1] - t[1], s = Math.max(0, Math.min(1, ((e.x - t[0]) * a + (e.y - t[1]) * n) / (a * a + n * n)));
  return Math.hypot(e.x - t[0] - a * s, e.y - t[1] - n * s);
}
function fd(e, t, r) {
  const a = [], n = /* @__PURE__ */ new Map(), s = [], i = new Vo(), l = new ht(), c = new Bo(), o = [];
  function u(b, E) {
    const S = `${Math.floor(b / 16)}:${Math.floor(E / 16)}`;
    let C = n.get(S);
    return C || (C = e.group(t), n.set(S, C)), C;
  }
  let h = [r.bounds];
  for (const b of r.features.filter((E) => E.kind === "water")) h = h.flatMap((E) => pd(E, b.footprint));
  const d = r.surface === "grass", f = r.surface === "marble", m = r.surface === "street", x = r.surface === "boards", w = r.surface === "snow", y = r.surface === "iron" ? be.deck : w ? be.snow : x ? p.wood : d ? p.grass : m ? p.street : r.surface === "wet" ? p.wetStone : f ? p.marble : p.stone;
  for (const b of h)
    if (e.mesh(u(b.x, b.z), "box", y, [
      b.width,
      0.6,
      b.depth
    ], [
      b.x,
      -0.32,
      b.z
    ]).castShadow = !1, x) for (let E = b.x - b.width / 2; E < b.x + b.width / 2; E += 1) for (let S = b.z - b.depth / 2; S < b.z + b.depth / 2; S += 4) {
      const C = Math.min(4, b.z + b.depth / 2 - S);
      e.mesh(u(E, S), "box", ls[Math.abs(E + S) % ls.length], [
        0.985,
        0.018,
        C - 0.025
      ], [
        E + 0.5,
        -9e-3,
        S + C / 2
      ]).castShadow = !1;
    }
    else if (!d && !m && !w) for (let E = b.x - b.width / 2; E < b.x + b.width / 2; E += 4) for (let S = b.z - b.depth / 2; S < b.z + b.depth / 2; S += 4) {
      const C = Math.min(4, b.x + b.width / 2 - E), I = Math.min(4, b.z + b.depth / 2 - S), A = f ? Math.round(E / 4 + S / 4) % 2 ? p.marble : p.marbleLight : y;
      e.mesh(u(E, S), "box", A, [
        C - 0.04,
        0.018,
        I - 0.04
      ], [
        E + C / 2,
        -9e-3,
        S + I / 2
      ]).castShadow = !1;
    }
  if (r.vista !== "room" && hd(e, r.roads, r.surface, u), w) for (let b = 0; b < 70; b++) {
    const E = r.bounds.x + Math.sin(b * 31.7) * (r.bounds.width / 2 - 4), S = r.bounds.z + Math.cos(b * 19.3) * (r.bounds.depth / 2 - 5), C = {
      x: E,
      y: S
    };
    if (r.features.some((A) => vn(C, A.footprint)) || r.roads.some((A) => A.points.slice(1).some((M, N) => Xn(C, A.points[N], M) < A.width / 2 + 1.5))) continue;
    const I = e.mesh(u(E, S), "rock", b % 3 ? be.snowCrest : be.ice, [
      1.2 + b % 3,
      0.06 + b % 2 * 0.03,
      0.3 + b % 4 * 0.1
    ], [
      E,
      0.025,
      S
    ]);
    I.rotation.y = -0.35, I.castShadow = !1;
  }
  if (m) for (let b = 0; b < 320; b++) {
    const E = r.bounds.x + Math.sin(b * 127.13) * (r.bounds.width / 2 - 3), S = r.bounds.z + Math.cos(b * 53.71) * (r.bounds.depth / 2 - 3), C = {
      x: E,
      y: S
    };
    if (r.features.some((M) => vn(C, M.footprint))) continue;
    const I = Math.min(...r.roads.flatMap((M) => M.points.slice(1).map((N, j) => Xn(C, M.points[j], N))));
    if (I < 2 || I > 9) continue;
    const A = e.mesh(u(E, S), "box", b % 3 ? p.streetSeam : p.streetStone, [
      0.4 + b % 3 * 0.18,
      0.025,
      0.25
    ], [
      E,
      -2e-3,
      S
    ]);
    A.rotation.y = b * 0.41, A.castShadow = !1;
  }
  if (f) {
    const b = u(0, -17);
    for (const E of [
      4,
      4.4,
      5.5
    ]) e.ring(b, p.brass, E, 0, -17, 1, !1, 0.09);
    for (let E = 0; E < 12; E++) {
      const S = E * Math.PI / 6;
      e.shape(b, [
        [0, 0],
        [0.35, 0.7],
        [0, 2.5],
        [-0.35, 0.7]
      ], p.brass, [
        Math.sin(S) * 4.6,
        0.095,
        -17 + Math.cos(S) * 4.6
      ]).rotation.set(-Math.PI / 2, 0, S);
    }
  }
  for (const b of r.suspended ?? []) {
    const E = e.group(t);
    Jc(e, E, b), a.push(e.bake(E)), s.push({
      root: E,
      bounds: new _n().setFromObject(E).expandByScalar(0.1)
    });
  }
  const { bounds: _ } = r;
  for (let b = 0; b < (d ? 420 : 0); b++) {
    const E = _.x + Math.sin(b * 127.13) * (_.width / 2 - 3), S = _.z + Math.cos(b * 53.71) * (_.depth / 2 - 3), C = {
      x: E,
      y: S
    };
    if (r.features.some((A) => vn(C, {
      ...A.footprint,
      width: A.footprint.width + 1.5,
      depth: A.footprint.depth + 1.5
    })) || r.roads.some((A) => A.points.slice(1).some((M, N) => Xn(C, A.points[N], M) < A.width / 2 + 1))) continue;
    const I = u(E, S);
    if (b % 4 === 0) {
      const A = Array.from({ length: 9 }, (N, j) => {
        const F = j * Math.PI * 2 / 9, W = 1 + Math.sin(j * 7 + b) * 0.3;
        return [Math.cos(F) * W * (1.2 + b % 3), Math.sin(F) * W * (0.7 + b % 2)];
      }), M = e.shape(I, A, b % 8 ? p.grassDark : p.grassLight, [
        E,
        5e-3,
        S
      ]);
      M.rotation.x = -Math.PI / 2;
    } else {
      for (let A = 0; A < 3; A++) {
        const M = e.mesh(I, "cone", b % 3 ? p.grassDark : p.leafLight, [
          0.035,
          0.3 + A * 0.09,
          0.035
        ], [
          E + (A - 1) * 0.16,
          0.15,
          S
        ]);
        M.rotation.z = (A - 1) * 0.35;
      }
      b % 11 === 0 && e.mesh(I, "rock", p.light, [
        0.12,
        0.13,
        0.12
      ], [
        E,
        0.38,
        S
      ]);
    }
  }
  for (const b of r.features) {
    const E = b.footprint, S = E.width > E.depth, C = Math.max(E.width, E.depth), I = b.kind === "wall" ? Math.ceil(C / 7) : 1, A = e.group(t);
    A.name = b.id;
    for (let M = 0; M < I; M++) {
      const N = -C / 2 + (M + 0.5) * C / I, j = I === 1 ? E : {
        ...E,
        x: E.x + (S ? N : 0),
        z: E.z + (S ? 0 : N),
        width: S ? C / I : E.width,
        depth: S ? E.depth : C / I
      }, F = I === 1 ? A : e.group(A);
      ld(e, u(j.x, j.z), F, {
        ...b,
        footprint: j
      }, r.vista === "interior") ? (a.push(e.bake(F)), s.push({
        root: F,
        bounds: new _n().setFromObject(F).expandByScalar(0.35)
      })) : F.removeFromParent();
    }
  }
  for (const b of r.vista === "room" ? [] : r.roads.slice(0, 1)) for (let E = 1; E < b.points.length; E++) {
    const [S, C] = b.points[E];
    if (!(r.vista === "camp" && Math.hypot(S, C - 8) < 13))
      for (const I of [-1, 1]) yo(e, u(S, C), S + I * (b.width / 2 + 0.6), C);
  }
  const k = e.group(t), z = r.vista === "interior" || r.vista === "room", L = r.vista === "snow" || r.vista === "furnace";
  if (e.mesh(k, "box", L ? "#93acbb" : z ? p.undercroft : p.distantGround, [
    300,
    8,
    300
  ], [
    0,
    L ? -25 : -4.65,
    0
  ]).castShadow = !1, L && rd(e, k, r), r.vista === "camp") for (let b = 0; b < 13; b++) {
    const E = -55 - b % 2 * 6, S = -44 + b * 7, C = 7 + b % 3 * 2;
    e.mesh(k, "box", p.distantWall, [
      10,
      C,
      6.5
    ], [
      E,
      C / 2,
      S
    ]);
    const I = e.mesh(k, "box", p.distantRoof, [
      11,
      0.28,
      7.5
    ], [
      E,
      C,
      S
    ]);
    I.rotation.z = -0.16;
    for (let A = -1; A <= 1; A++) e.mesh(k, "box", b % 4 ? p.shadow : p.ember, [
      0.05,
      0.7,
      0.6
    ], [
      E + 5.03,
      C - 1.7,
      S + A * 1.6
    ], b % 4 === 0);
  }
  for (let b = 0; b < (z || L ? 0 : 12); b++) {
    const E = (b % 2 ? 1 : -1) * (_.width / 2 + 15 + b % 3 * 8), S = _.z - 25 + b * 7;
    e.mesh(k, "crown", b % 3 ? p.distantGround : p.distantLeaf, [
      17 + b % 4 * 3,
      6 + b % 3 * 2,
      22
    ], [
      E,
      -3,
      S
    ]);
  }
  for (let b = 0; b < (z || L || r.vista === "garden" ? 0 : 9); b++) {
    const E = (b - 4) * 12, S = _.z - _.depth / 2 - 15 - b % 3 * 6, C = 9 + b % 4 * 3;
    e.mesh(k, "box", p.distantWall, [
      9,
      C,
      9
    ], [
      E,
      C / 2 - 2,
      S
    ]), e.mesh(k, "cone", p.distantRoof, [
      7,
      6,
      7
    ], [
      E,
      C + 1,
      S
    ]);
    for (let I = -1; I <= 1; I++) e.mesh(k, "box", p.distantGround, [
      0.8,
      2.5,
      0.08
    ], [
      E + I * 2.2,
      C - 4,
      S + 4.55
    ]);
  }
  if (!z && !L && r.vista !== "garden") {
    const b = _.z - _.depth / 2 - 28;
    e.mesh(k, "cylinder", p.distantWall, [
      9,
      36,
      9
    ], [
      -17,
      17,
      b
    ]);
    for (const E of [
      10,
      22,
      33
    ]) e.mesh(k, "cylinder", p.distantRoof, [
      10,
      1.2,
      10
    ], [
      -17,
      E,
      b
    ]);
    for (let E = 0; E < 6; E++) {
      const S = E * Math.PI / 3, C = -17 + Math.sin(S) * 8.8, I = b + Math.cos(S) * 8.8;
      e.mesh(k, "box", p.distantRoof, [
        1.4,
        40,
        1.4
      ], [
        C,
        19,
        I
      ]);
      const A = e.mesh(k, "box", p.ember, [
        1,
        7,
        0.12
      ], [
        -17 + Math.sin(S) * 9.02,
        26,
        b + Math.cos(S) * 9.02
      ], !0);
      A.rotation.y = S;
    }
    e.mesh(k, "cylinder", p.distantWall, [
      4.2,
      15,
      4.2
    ], [
      -17,
      42,
      b
    ]), e.mesh(k, "cone", p.distantRoof, [
      5,
      7,
      5
    ], [
      -17,
      53,
      b
    ]);
  }
  a.push(e.bake(k));
  for (const b of n.values()) a.push(e.bake(b));
  return {
    update(b, E) {
      i.direction.copy(l.set(Math.sin(E), Pt.height / Pt.distance, Math.cos(E)).normalize());
      for (const S of s) {
        o.length = 0;
        for (const C of [0.1, 1.6])
          if (i.origin.set(b.x, C, b.y), c.ray.copy(i), i.intersectsBox(S.bounds) && c.intersectObject(S.root, !0, o), o.length) break;
        S.root.visible = o.length === 0;
      }
    },
    dispose() {
      a.forEach((b) => b()), t.clear();
    }
  };
}
function md(e, t, r, a, n, s) {
  const i = r.create(), l = i.root, c = {
    x: a,
    y: n
  };
  t.add(l), l.position.set(a, 0, n), l.rotation.y = 0.25;
  const o = e.ring(t, "#e8c77b", 0.75, a, n, 0.8);
  let u = 0, h = -1 / 0, d = 0, f = -1;
  return {
    root: l,
    ring: o,
    id: "sanniang",
    position: c,
    seated: s,
    locate(m, x) {
      const w = Math.hypot(c.x - m.position.x, c.y - m.position.y);
      return w && (u += w, h = x), d = m.facing, c.x = m.position.x, c.y = m.position.y, l.position.set(c.x, 0, c.y), o.position.x = c.x, o.position.z = c.y, w > 0;
    },
    update(m, x, w) {
      const y = x - h < 120, _ = Math.hypot(m.x - c.x, m.y - c.y) < 10;
      o.visible = _;
      const k = y ? Math.PI / 2 - d : _ ? Math.atan2(m.x - c.x, m.y - c.y) : 0.25, z = Math.atan2(Math.sin(k - l.rotation.y), Math.cos(k - l.rotation.y)), L = f < 0 ? 0 : Math.min(0.12, (x - f) / 1e3);
      f = x, l.rotation.y += w ? z : z * (1 - Math.exp(-L * 9)), i.pose(x, u, y, w);
    },
    dispose() {
      i.dispose(), o.removeFromParent();
    }
  };
}
function gd(e, t, r, a, n, s, i, l = !0) {
  if (r === "sanniang") return md(e, t, i(), a, n, l);
  const c = Ja([...s], r), o = e.group(t, [
    a,
    0,
    n
  ]), u = e.group(t), h = r === "laobai", d = r === "kouzi";
  o.rotation.y = -0.35, l && (d || r === "anian") && (o.position.y = -0.3), o.scale.setScalar(h ? 1.24 : d ? 1.06 : r === "anian" ? 1.19 : 1.12);
  const f = h ? "#596a80" : d ? "#53617a" : "#79647d", m = "#615047", x = "#dfbaa0", w = h ? 0.39 : d ? 0.25 : 0.29, y = h ? 0.31 : 0.23, _ = [];
  for (const F of [-1, 1]) {
    const W = e.group(o, [
      F * 0.16,
      0.78,
      F > 0 ? 0.03 : -0.04
    ]);
    W.rotation.x = l && (d || r === "anian") ? -1.15 : F * 0.06, _.push(W), e.mesh(W, "cylinder", "#48545d", [
      0.115,
      0.61,
      0.12
    ], [
      0,
      -0.28,
      0
    ]), e.mesh(W, "cylinder", m, [
      0.135,
      0.37,
      0.14
    ], [
      0,
      -0.53,
      0
    ]), e.mesh(W, "sphere", m, [
      0.14,
      0.12,
      0.23
    ], [
      0,
      -0.69,
      0.08
    ]);
  }
  e.mesh(o, "sphere", f, [
    w,
    0.46,
    0.22
  ], [
    0,
    1.24,
    0
  ]), e.mesh(o, "cylinder", f, [
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
  const k = e.group(o, [
    0,
    1.93,
    0.025
  ]);
  k.rotation.x = -0.025, e.mesh(k, "sphere", x, [
    0.215,
    0.285,
    0.22
  ]);
  const z = d ? "#643d41" : r === "anian" ? "#483b40" : "#30343e";
  e.mesh(k, "sphere", z, [
    0.23,
    0.18,
    0.23
  ], [
    0,
    0.16,
    -0.025
  ]);
  for (const F of [-1, 1])
    e.mesh(k, "sphere", z, [
      0.045,
      0.17,
      0.095
    ], [
      F * 0.2,
      0.02,
      -0.03
    ]), e.mesh(k, "sphere", "#303b3b", [
      0.026,
      0.033,
      0.013
    ], [
      F * 0.083,
      0.025,
      0.216
    ]), e.mesh(k, "box", z, [
      0.069,
      0.018,
      0.016
    ], [
      F * 0.086,
      0.093,
      0.219
    ]), e.mesh(k, "sphere", x, [
      0.036,
      0.062,
      0.045
    ], [
      F * 0.212,
      -0.025,
      0
    ]);
  e.mesh(k, "sphere", x, [
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
  for (const F of [-1, 1]) {
    const W = e.group(o, [
      F * w,
      1.48,
      0
    ]);
    W.rotation.z = F * 0.11, W.rotation.x = F > 0 ? -0.4 : -0.1, e.mesh(W, "cylinder", f, [
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
    ]), e.mesh(W, "cylinder", x, [
      0.076,
      0.22,
      0.085
    ], [
      0,
      -0.51,
      0
    ]), e.mesh(W, "sphere", x, [
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
    e.mesh(o, "sphere", f, [
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
      for (const W of [-1, 1]) e.mesh(u, "box", "#637b7c", [
        0.2,
        0.7,
        0.6
      ], [
        a + W * 0.8,
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
    e.mesh(o, "cone", f, [
      0.36,
      1.05,
      0.28
    ], [
      0,
      0.67,
      0
    ]), e.mesh(k, "sphere", z, [
      0.22,
      0.48,
      0.16
    ], [
      0,
      -0.26,
      -0.17
    ]);
    for (let W = 0; W < 3; W++) {
      const V = e.mesh(o, "box", "#ded3b5", [
        0.29,
        0.34,
        0.018
      ], [
        -0.12 + W * 0.02,
        1.02,
        0.31 + W * 0.023
      ]);
      V.rotation.z = W * 0.1;
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
  k.removeFromParent(), _.forEach((F) => F.removeFromParent());
  const b = _.map((F) => e.bake(F)), E = e.bake(o), S = e.bake(k), C = e.bake(u);
  o.add(k, ..._);
  const I = o.position.y, A = o.rotation.y, M = {
    x: a,
    y: n
  };
  let N = -1 / 0, j = 0;
  return {
    root: o,
    ring: L,
    id: r,
    position: M,
    seated: l,
    locate(F, W) {
      const V = M.x !== F.position.x || M.y !== F.position.y;
      return V && (N = W), j = F.facing, M.x = F.position.x, M.y = F.position.y, o.position.x = M.x, o.position.z = M.y, L.position.x = M.x, L.position.z = M.y, V;
    },
    update(F, W, V) {
      const J = W - N < 120, re = Math.hypot(F.x - M.x, F.y - M.y) < 10;
      L.visible = re;
      const Ce = J ? Math.PI / 2 - j : re ? Math.atan2(F.x - M.x, F.y - M.y) : A, We = Math.atan2(Math.sin(Ce - o.rotation.y), Math.cos(Ce - o.rotation.y));
      o.rotation.y += V ? We : We * 0.16, o.position.y = I + (V ? 0 : Math.sin(W * 15e-4 + a) * 0.012), k.rotation.y = V ? 0 : Math.sin(W * 8e-4 + n) * 0.04, l || _.forEach((Te, Ae) => {
        Te.rotation.x = V || !J ? 0 : Math.sin(W * 0.012 + Ae * Math.PI) * 0.45;
      });
    },
    dispose() {
      E(), S(), C(), b.forEach((F) => F()), o.removeFromParent(), u.removeFromParent(), L.removeFromParent();
    }
  };
}
function vd(e, t, r, a) {
  const n = e.group(t), s = Object.values(Je).find((h) => h.scene === r.id);
  let i = a, l = !1, c = [];
  const o = In(r.id).flatMap((h) => {
    const d = ft[h];
    return d.waves[0].filter((f, m) => !s || f.kind !== s.kind || m !== d.waves[0].findIndex((x) => x.kind === s.kind)).map((f) => {
      const m = Tr(e, n, f.kind, jn[0]);
      m.bar.removeFromParent();
      const x = r.anchors[f.anchor];
      return m.root.position.set(x.x, 0, x.y), {
        ...m,
        id: h,
        dispose: e.bake(m.root)
      };
    });
  }), u = () => {
    let h = !1;
    for (const d of o) {
      const f = !l && !Sn(d.id, i, c);
      d.root.visible !== f && (d.root.visible = f, h = !0);
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
function yd(e, t, r, a) {
  const n = Je[r], s = Tr(e, t, n.kind, jn[0]);
  s.bar.removeFromParent();
  const i = e.bake(s.root), l = { ...En(r, a) };
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
      const h = En(r, c), d = o.x - h.x, f = o.y - h.y, m = Math.hypot(d, f), x = m <= n.approachRadius, w = x && !c.has(n.complete) ? 1 : 0, y = h.x + (m ? d / m * w : 0), _ = h.y + (m ? f / m * w : 0), k = l.x + l.y + s.root.rotation.y;
      l.x += u ? y - l.x : (y - l.x) * 0.22, l.y += u ? _ - l.y : (_ - l.y) * 0.22, Math.abs(y - l.x) + Math.abs(_ - l.y) < 0.01 && (l.x = y, l.y = _);
      const z = x ? Math.atan2(d, f) : 0, L = Math.atan2(Math.sin(z - s.root.rotation.y), Math.cos(z - s.root.rotation.y));
      return s.root.rotation.y += u || Math.abs(L) < 5e-3 ? L : L * 0.2, s.root.position.set(l.x, 0, l.y), k !== l.x + l.y + s.root.rotation.y;
    },
    dispose() {
      i(), s.root.removeFromParent();
    }
  };
}
var te = (e, t, r, a = Math.PI) => ({
  position: {
    x: e,
    y: t
  },
  wait: r,
  facing: a
}), _o = {
  furnace_terrace: [{
    id: "peisu-at-table",
    name: "掌炉官裴肃",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [te(0, -25, 0, 0)],
    condition: { none: ["furnace_approach_ready"] }
  }, {
    id: "terrace-attendant",
    name: "炉台侍者",
    activity: "keep",
    coat: "cream",
    phase: 0,
    route: [te(8, -13, 0)]
  }],
  furnace_quarter: [
    {
      id: "bathhouse-water",
      name: "澡堂伙计",
      activity: "water",
      coat: "blue",
      phase: 4,
      route: [
        te(-10, -8, 8),
        te(-9, 6, 0),
        te(-10, 17, 7),
        te(-9, 6, 0)
      ]
    },
    {
      id: "furnace-mender",
      name: "修衣的住户",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [te(13, 1, 0)]
    },
    {
      id: "furnace-delivery",
      name: "运料工",
      activity: "deliver",
      coat: "cream",
      phase: 9,
      route: [
        te(12, 21, 6),
        te(5, 16, 0),
        te(6, 0, 0),
        te(9, -15, 8),
        te(6, 0, 0),
        te(5, 16, 0)
      ]
    },
    {
      id: "furnace-handover-worker",
      name: "接管炉组的管工",
      activity: "warm",
      coat: "blue",
      phase: 0,
      route: [te(-6, -17, 0, Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    },
    {
      id: "furnace-handover-clerk",
      name: "登记住户的办事员",
      activity: "register",
      coat: "cream",
      phase: 2,
      route: [te(6, -17, 0, -Math.PI / 2)],
      condition: { all: ["furnace_stilled"] }
    }
  ],
  furnace_antechamber: [{
    id: "furnace-orderly",
    name: "值房看护",
    activity: "dressings",
    coat: "cream",
    phase: 0,
    route: [te(11, -9, 0)]
  }],
  furnace_heart: [{
    id: "furnace-recovery-worker",
    name: "接手检修的管工",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [te(6, -32, 0)],
    condition: { all: ["furnace_stilled"] }
  }, {
    id: "furnace-recovery-carrier",
    name: "搬送晶座的工人",
    activity: "deliver",
    coat: "cream",
    phase: 5,
    route: [
      te(9, 20, 6),
      te(9, -13, 0),
      te(9, -28, 8),
      te(9, -13, 0)
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
      route: [te(-12, 23.2, 0)]
    },
    {
      id: "patient",
      name: "歇脚的病人",
      activity: "warm",
      coat: "blue",
      phase: 1.3,
      route: [te(-21, 12.5, 0, -0.4)]
    },
    {
      id: "helper",
      name: "帮忙的街坊",
      activity: "dressings",
      coat: "cream",
      phase: 2.7,
      route: [te(-24, 11.9, 0, -0.8)]
    },
    {
      id: "stove-tender",
      name: "看炉的街坊",
      activity: "cook",
      coat: "blue",
      phase: 0.7,
      route: [te(-2.8, 6, 0, Math.PI / 2)]
    },
    {
      id: "water-carrier",
      name: "提水人",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        te(-31, 18, 6, -Math.PI / 2),
        te(-27, 16, 0),
        te(-23, 13, 7, Math.PI),
        te(-27, 16, 0)
      ]
    },
    {
      id: "delivery",
      name: "送货人",
      activity: "deliver",
      coat: "rose",
      phase: 12,
      route: [
        te(10, 7, 6),
        te(5, 10, 0),
        te(-8, 13, 0),
        te(-18, 14, 8, Math.PI),
        te(-8, 13, 0),
        te(5, 10, 0)
      ]
    }
  ],
  clinic_front: [{
    id: "waiting-patient",
    name: "候诊的街坊",
    activity: "warm",
    coat: "blue",
    phase: 0,
    route: [te(-7, 4.5, 0)]
  }],
  inn: [{
    id: "innkeeper",
    name: oe.households.innkeeper,
    activity: "keep",
    coat: "cream",
    phase: 1,
    route: [te(7, -7, 0)]
  }],
  anian_home: [{
    id: "anian-father",
    name: "阿念的父亲",
    activity: "repair",
    coat: "blue",
    phase: 0,
    route: [te(8, -4, 0)]
  }, {
    id: "anian-mother",
    name: "阿念的母亲",
    activity: "mend",
    coat: "rose",
    phase: 2,
    route: [te(8, 2, 0)]
  }],
  south_street: [
    {
      id: "tea-seller",
      name: "热水铺掌柜",
      activity: "cook",
      coat: "cream",
      phase: 0,
      route: [te(7, -17, 0, Math.PI / 2)]
    },
    {
      id: "tea-drinker",
      name: "歇脚的街坊",
      activity: "warm",
      coat: "blue",
      phase: 1,
      route: [te(-7, 19, 0)]
    },
    {
      id: "city-delivery",
      name: "送货的伙计",
      activity: "deliver",
      coat: "rose",
      phase: 6,
      route: [
        te(11, 23, 7),
        te(5, 17, 0),
        te(0, 7, 0),
        te(0, -5, 5),
        te(0, 7, 0),
        te(5, 17, 0)
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
      route: [te(18, -4, 0)]
    },
    {
      id: "lodging-mender",
      name: "补衣的寄工",
      activity: "mend",
      coat: "rose",
      phase: 1,
      route: [te(17, 20, 0)]
    },
    {
      id: "workshop-water",
      name: "领水的寄工",
      activity: "water",
      coat: "cream",
      phase: 3,
      route: [
        te(-10, 19, 6, -Math.PI / 2),
        te(-4, 18, 0),
        te(8, 21, 0),
        te(14, 20, 7),
        te(8, 21, 0),
        te(-4, 18, 0)
      ]
    }
  ],
  workers_lodging: [{
    id: "old-mender",
    name: "补鞋的老寄工",
    activity: "mend",
    coat: "cream",
    phase: 0,
    route: [te(-7, 7, 0)]
  }]
}, wd = {
  mend: "缝补衣物",
  warm: "捧着热水歇息",
  dressings: "整理敷料",
  cook: "照看炉火",
  water: "提水往来",
  deliver: "搬送货物",
  repair: "修理铜管",
  keep: "照看柜台",
  register: "核对名册"
}, bd = 0.85;
function us(e, t) {
  const r = e.route;
  if (r.length === 1) return {
    position: r[0].position,
    facing: r[0].facing,
    walking: !1
  };
  const a = r.map((s, i) => {
    const l = r[(i + 1) % r.length].position;
    return s.wait + Math.hypot(l.x - s.position.x, l.y - s.position.y) / bd;
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
function xd(e, t) {
  return e === null ? 0 : Math.min(0.1, Math.max(0, (t - e) / 1e3));
}
function _d(e, t) {
  e.updateWorldMatrix(!0, !0);
  const r = e.matrixWorld.clone().invert(), a = new xn(), n = [];
  e.traverse((l) => {
    if (!(l instanceof bt)) return;
    const c = (l.geometry.index ? l.geometry.toNonIndexed() : l.geometry.clone()).applyMatrix4(a.multiplyMatrices(r, l.matrixWorld)), o = l.material.color, u = new ti(new Float32Array(c.getAttribute("position").count * 3), 3);
    for (let h = 0; h < u.count; h++) u.setXYZ(h, o.r, o.g, o.b);
    c.setAttribute("color", u), n.push(c);
  });
  const s = zs(n);
  if (n.forEach((l) => l.dispose()), !s) throw new Error("expedition_geometry_merge");
  e.clear();
  const i = new bt(s, t);
  return i.receiveShadow = !0, e.add(i), () => {
    s.dispose(), e.clear();
  };
}
function Mo(e, t, r, a) {
  const n = e.group(t), s = e.group(n), i = [], l = [], c = {
    blue: p.slate,
    rose: p.rose,
    cream: p.cloth
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
      f * 0.16,
      h - 0.31,
      0
    ]);
    l.push(x), e.mesh(x, "box", p.timber, [
      0.2,
      o ? 0.3 : 0.59,
      0.22
    ], [
      0,
      o ? -0.12 : -0.26,
      o ? 0.2 : 0
    ]), e.mesh(x, "box", p.shadow, [
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
  ])) : r.activity === "mend" || r.activity === "dressings" || r.activity === "register" ? (e.mesh(s, "box", p.light, [
    0.52,
    0.055,
    0.4
  ], [
    0,
    h - 0.22,
    0.36
  ]), r.activity === "register" && e.mesh(s, "box", p.timber, [
    0.025,
    0.025,
    0.26
  ], [
    0.18,
    h - 0.17,
    0.38
  ])) : r.activity === "warm" && e.mesh(s, "box", p.pottery, [
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
    ...l
  ].map((f) => _d(f, a));
  return {
    root: n,
    body: s,
    arms: i,
    legs: l,
    dispose() {
      d.forEach((f) => f()), n.removeFromParent();
    }
  };
}
function Md(e, t, r) {
  const a = new xr({
    vertexColors: !0,
    roughness: 0.95
  }), n = (_o[r] ?? []).map((c) => ({
    spec: c,
    model: Mo(e, t, c, a),
    time: 0
  }));
  let s = null, i = null, l = /* @__PURE__ */ new Set();
  return {
    setFacts(c) {
      l = c;
    },
    animate(c, o, u, h) {
      const d = u ? 0 : xd(s, o);
      s = o;
      let f = n.length > 0 && i !== u;
      i = u;
      for (const m of n) {
        const { spec: x, model: w } = m, y = us(x, m.time), _ = Ut(x.condition, l) && Math.hypot(y.position.x - c.x, y.position.y - c.y) < 27 && h(y.position);
        if (w.root.visible !== _ && (w.root.visible = _, f = !0), !_) continue;
        m.time += d;
        const k = us(x, m.time), z = u ? 0 : Math.sin(m.time * (k.walking ? 5.5 : 1.5) + x.phase);
        w.root.position.set(k.position.x, 0, k.position.y), w.root.rotation.y = k.facing, w.body.position.y = k.walking ? Math.abs(z) * 0.035 : 0, w.legs.forEach((L, b) => {
          L.rotation.x = k.walking ? z * 0.35 * (b ? 1 : -1) : 0;
        }), w.arms.forEach((L, b) => {
          L.rotation.x = k.walking ? z * 0.24 * (b ? -1 : 1) : -0.6 + z * 0.13 * (b ? 1 : -1), x.activity === "deliver" && (L.rotation.x = -0.75), x.activity === "warm" && (L.rotation.x = -1.1), x.activity === "cook" && !b && (L.rotation.x = -0.8 + z * 0.3);
        }), f = d > 0 || f;
      }
      return f;
    },
    dispose() {
      n.forEach((c) => c.model.dispose()), a.dispose();
    }
  };
}
function kd(e, t, r) {
  const a = new xr({
    vertexColors: !0,
    roughness: 0.9
  }), n = ma.filter((s) => De[s].scene === r.id).map((s) => {
    const i = De[s], l = r.anchors[i.anchor], c = Mo(e, t, {
      coat: i.coat,
      activity: s === "chenhe" ? "mend" : s === "chengtiesheng" ? "repair" : "keep"
    }, a);
    c.root.position.set(l.x, 0, l.y);
    const o = e.group(c.body);
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
    const u = e.bake(o), h = e.ring(c.root, p.brass, 0.72, 0, 0, 0.5, !0);
    let d = 0;
    return {
      id: s,
      root: c.root,
      position: l,
      update(f, m, x) {
        const w = f.x - l.x, y = f.y - l.y, _ = Math.hypot(w, y) < 6;
        h.visible = _;
        const k = _ ? Math.atan2(w, y) : Math.PI, z = Math.atan2(Math.sin(k - c.root.rotation.y), Math.cos(k - c.root.rotation.y)), L = Math.abs(z) > 5e-3;
        c.root.rotation.y += x || !L ? z : z * 0.22;
        const b = !x && Math.hypot(w, y) < 22;
        if (b || d !== 0) {
          d = b ? m : 0;
          const E = b ? Math.sin(m / 1e3 * 1.5) : 0;
          c.body.position.y = E * 0.014, c.arms.forEach((S, C) => {
            S.rotation.x = -0.35 + E * 0.045 * (C ? -1 : 1);
          });
        }
        return b || L;
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
function Sd(e, t, r, a) {
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
        const x = e.mesh(f, "box", d, [
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
    const x = e.group(s, [
      d,
      1.2,
      f + 0.25
    ]);
    e.mesh(x, "torus", p.brass, [
      0.7,
      0.7,
      0.7
    ]);
    for (const y of [0, Math.PI / 2]) {
      const _ = e.mesh(x, "box", p.timber, [
        1.2,
        0.085,
        0.08
      ]);
      _.rotation.z = y;
    }
    i.push(e.bake(x));
    const w = o ? "deep_gate_opened" : u ? "heat_restored" : "return_flow_tested";
    if (c(w, (y) => {
      x.rotation.z = y * Math.PI * 1.3;
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
      const y = e.group(s, [
        d,
        2.15,
        f + 0.14
      ]);
      e.mesh(y, "box", p.ember, [
        0.035,
        0.25,
        0.025
      ], [
        0,
        0.09,
        0
      ]), i.push(e.bake(y)), c(w, (_) => {
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
function Rd(e, t, r) {
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
          for (let f = -29; f < 21; f += 1.6) e.mesh(a, "box", be.iron, [
            2.8,
            0.1,
            0.55
          ], [
            d,
            0.19,
            f
          ]);
          for (const f of [-1, 1]) e.mesh(a, "box", be.copper, [
            0.12,
            0.1,
            51
          ], [
            d + f * 1.4,
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
        const u = r.id === "old_kiln", h = r.anchors[u ? "trial" : "shutdown"], d = u ? c.has("division_tested") : !c.has("furnace_stilled"), f = e.group(a, [
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
        ]), e.mesh(f, "torus", be.copper, [
          0.65,
          0.65,
          0.24
        ]), f.rotation.z = d ? -0.7 : 0.7, e.mesh(f, "box", be.edge, [
          1.1,
          0.08,
          0.09
        ]), e.mesh(f, "box", be.edge, [
          0.08,
          1.1,
          0.09
        ]);
        const m = r.landscape.features.find((w) => w.kind === "kiln"), x = m.footprint;
        for (const w of [-1, 1]) e.mesh(a, "box", d ? be.ember : "#926c61", [
          x.width * 0.14,
          m.height * 0.3,
          0.06
        ], [
          x.x + w * x.width * 0.23,
          m.height * 0.58,
          x.z + x.depth * 0.465
        ], d);
        if (u && c.has("division_tested") && !c.has("furnace_cargo_loaded")) {
          const w = r.landscape.features.find((y) => y.id === "load-platform").footprint;
          e.mesh(a, "cylinder", be.iron, [
            1.4,
            1.8,
            1.4
          ], [
            w.x,
            2.2,
            w.z
          ]);
          for (const y of [-1, 1]) e.mesh(a, "box", be.copper, [
            0.08,
            2.3,
            3
          ], [
            w.x + y,
            2,
            w.z
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
          for (let f = 0; f < 3; f++) e.mesh(d, "box", be.soot, [
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
function Ed(e, t, r, a, n) {
  const s = fd(e, t, r.landscape), i = e.group(t), l = e.group(t), c = vd(e, t, r, a), o = Md(e, l, r.id), u = kd(e, l, r), h = Sd(e, t, r, a), d = Rd(e, t, r), f = e.group(t);
  for (const E of Vs(r.id)) {
    const S = e.group(f, [
      E.x,
      0.65,
      E.y
    ]);
    S.rotation.y = Math.PI / 2 - E.angle, e.mesh(S, "cylinder", p.brass, [
      0.4,
      1.2,
      0.4
    ], [
      0,
      0,
      -0.6
    ]).rotation.x = Math.PI / 2, e.mesh(S, "torus", p.timber, [
      0.42,
      0.42,
      0.14
    ], [
      0,
      0,
      0
    ]), e.mesh(S, "disc", p.shadow, [
      0.34,
      0.34,
      1
    ]);
  }
  const m = e.bake(f), x = r.objects.filter((E) => E.kind === "reward" || E.kind === "rest").map((E) => {
    const S = r.anchors[E.anchor], C = e.group(t, [
      S.x,
      0,
      S.y
    ]);
    if (E.kind === "reward") {
      e.mesh(C, "box", p.wood, [
        0.85,
        0.45,
        0.6
      ], [
        0,
        0.225,
        -0.65
      ]);
      for (const I of [-1, 1]) e.mesh(C, "box", p.brass, [
        0.055,
        0.48,
        0.63
      ], [
        I * 0.26,
        0.24,
        -0.65
      ]);
      e.mesh(C, "rock", p.ember, [
        0.15,
        0.3,
        0.15
      ], [
        0,
        0.68,
        -0.65
      ], !0), e.ring(C, p.brass, 0.65, 0, 0, 0.35, !0);
    } else {
      e.mesh(C, "box", p.wood, [
        1.4,
        0.12,
        0.6
      ], [
        0,
        0.5,
        -0.7
      ]);
      for (const I of [-1, 1]) e.mesh(C, "box", p.timber, [
        0.12,
        0.45,
        0.5
      ], [
        I * 0.5,
        0.22,
        -0.7
      ]);
    }
    return C.visible = !1, {
      id: E.id,
      model: C,
      dispose: e.bake(C)
    };
  }), w = [], y = Tn.filter((E) => Je[E].scene === r.id).map((E) => yd(e, l, E, a));
  let _ = -1, k = -1, z = null, L = null;
  function b(E) {
    const S = [...E].sort().join("/");
    if (S === L) return;
    L = S, y.forEach((I) => I.setFacts(E)), z?.(), c.setFacts(E), o.setFacts(E), h.setFacts(E), d.setFacts(E);
    for (const I of $n(r, E)) {
      const A = I.position;
      if (I.kind === "exit") {
        if (!I.target.doorway) for (const M of [-1, 1]) yo(e, i, A.x + M * 1.7, A.y, 1.5);
        e.mesh(i, "box", p.brass, [
          3,
          0.025,
          0.35
        ], [
          A.x,
          0.12,
          A.y
        ]).castShadow = !1;
      } else if (I.target.kind === "inspect" && I.target.passage === "warning")
        e.mesh(i, "box", p.timber, [
          0.12,
          1.8,
          0.12
        ], [
          A.x,
          0.9,
          A.y
        ]), e.mesh(i, "box", p.wood, [
          1.4,
          0.7,
          0.13
        ], [
          A.x,
          1.6,
          A.y
        ]), e.mesh(i, "box", p.light, [
          0.7,
          0.4,
          0.025
        ], [
          A.x,
          1.6,
          A.y + 0.08
        ]);
      else if (I.target.kind === "inspect" && I.target.passage === "orders") {
        e.mesh(i, "box", p.slate, [
          2.2,
          0.8,
          1.2
        ], [
          A.x,
          0.4,
          A.y - 0.8
        ]);
        const M = e.mesh(i, "box", p.light, [
          1.8,
          0.08,
          0.9
        ], [
          A.x,
          0.85,
          A.y - 0.8
        ]);
        M.rotation.x = 0.2;
        for (let N = -1; N <= 1; N++) e.mesh(i, "cylinder", p.brass, [
          0.12,
          0.12,
          0.12
        ], [
          A.x + N * 0.45,
          0.95,
          A.y - 0.55
        ]);
      }
    }
    if (r.id === "camp") {
      const I = r.landscape.features.find((A) => A.kind === "clinic").footprint;
      if (E.has("heat_restored")) {
        const A = r.landscape.features.find((M) => M.id === "hearth").footprint;
        e.mesh(i, "disc", p.ember, [
          1.2,
          1.2,
          1
        ], [
          A.x,
          0.2,
          A.z + 1.12
        ], !0).rotation.x = -Math.PI / 2;
        for (let M = 0; M < 3; M++) e.mesh(i, "crown", "#f0f5f6", [
          0.24 + M * 0.1,
          0.38,
          0.24
        ], [
          A.x + (M % 2 ? 0.17 : -0.1),
          2.2 + M * 0.5,
          A.z
        ], !0, 0.32 - M * 0.06);
        for (const M of [-1, 1])
          e.mesh(i, "cylinder", p.pottery, [
            0.32,
            0.38,
            0.32
          ], [
            I.x + M * 1.6,
            0.19,
            I.z + I.depth / 2 + 0.6
          ]), e.mesh(i, "disc", "#b5d8e6", [
            0.29,
            0.29,
            1
          ], [
            I.x + M * 1.6,
            0.39,
            I.z + I.depth / 2 + 0.6
          ], !0).rotation.x = -Math.PI / 2;
      }
      if (E.has("clinic_helped")) {
        const A = r.landscape.features.find((M) => M.kind === "bench").footprint;
        for (const M of [-1, 1])
          e.mesh(i, "cylinder", "#ede3c9", [
            0.16,
            0.22,
            0.16
          ], [
            A.x,
            0.91,
            A.z + M * 0.65
          ]), e.mesh(i, "cylinder", "#99704c", [
            0.125,
            0.012,
            0.125
          ], [
            A.x,
            1.024,
            A.z + M * 0.65
          ]);
      }
      if (E.has("receiving_arranged")) for (const A of [-1, 1]) {
        const M = I.x + A * 2.4, N = I.z + I.depth / 2 - 0.2, j = e.group(i, [
          M,
          0.2,
          N
        ]);
        j.rotation.x = -0.16;
        for (const F of [-1, 1]) e.mesh(j, "cylinder", p.timber, [
          0.055,
          2.9,
          0.055
        ], [
          F * 0.42,
          1.4,
          0
        ]);
        e.mesh(j, "box", E.has("captives_arrived") ? "#bdccc0" : "#eee7d1", [
          0.76,
          2.2,
          0.09
        ], [
          0,
          1.4,
          0.05
        ]);
        for (const F of [0.7, 2.1]) e.mesh(j, "box", p.timber, [
          0.94,
          0.055,
          0.08
        ], [
          0,
          F,
          0.12
        ]);
      }
      if (E.has("warden_defeated")) {
        const A = r.landscape.features.find((M) => M.kind === "wagon").footprint;
        for (let M = 0; M < 4; M++) {
          const N = e.group(i, [
            A.x + (M % 2 ? 0.65 : -0.65),
            1.4,
            A.z + (M < 2 ? -0.9 : 0.6)
          ]);
          e.mesh(N, "box", p.wood, [
            1.1,
            0.75,
            1.2
          ], [
            0,
            0.375,
            0
          ]);
          for (const j of [-1, 1]) e.mesh(N, "box", p.brass, [
            0.08,
            0.78,
            1.22
          ], [
            j * 0.35,
            0.38,
            0
          ]);
          e.mesh(N, "box", p.light, [
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
    for (const I of r.objects) {
      if (I.kind !== "switch") continue;
      const A = r.anchors[I.anchor], M = E.has(I.fact), N = e.group(i, [
        A.x,
        0,
        A.y
      ]);
      e.mesh(N, "box", p.slate, [
        0.7,
        0.65,
        0.7
      ], [
        0,
        0.325,
        0
      ]), e.mesh(N, "box", p.brass, [
        0.5,
        0.1,
        0.5
      ], [
        0,
        0.7,
        0
      ]);
      const j = e.group(N, [
        0,
        0.75,
        0
      ]);
      j.rotation.z = M ? 0.65 : -0.65, e.mesh(j, "cylinder", p.brass, [
        0.065,
        0.7,
        0.065
      ], [
        0,
        0.35,
        0
      ]), e.mesh(j, "cylinder", p.timber, [
        0.09,
        0.44,
        0.09
      ], [
        0,
        0.73,
        0
      ]).rotation.z = Math.PI / 2;
    }
    const C = Lt(r, E);
    for (const I of r.landscape.gates) {
      if (r.id === "deep_waterway" && I.id === "deep_gate") continue;
      const A = I.footprint, M = A.width > A.depth, N = Math.max(A.width, A.depth), j = e.group(i, [
        A.x,
        0,
        A.z
      ]);
      M || (j.rotation.y = Math.PI / 2);
      for (const F of [-1, 1]) e.mesh(j, "box", p.stone, [
        0.35,
        3.2,
        0.7
      ], [
        F * N / 2,
        1.6,
        0
      ]);
      if (e.mesh(j, "box", p.light, [
        N + 0.5,
        0.35,
        0.9
      ], [
        0,
        3.25,
        0
      ]), C.closedGates.has(I.id)) {
        for (let F = -N / 2 + 0.2; F < N / 2; F += 0.4) e.mesh(j, "box", p.shadow, [
          0.065,
          3,
          0.1
        ], [
          F,
          1.5,
          0
        ]);
        for (const F of [0.4, 2.5]) e.mesh(j, "box", p.brass, [
          N,
          0.12,
          0.15
        ], [
          0,
          F,
          0
        ]);
      } else e.mesh(j, "box", p.shadow, [
        N,
        0.42,
        0.16
      ], [
        0,
        3,
        0
      ]);
    }
    for (const I of r.landscape.features) {
      if (I.kind !== "beacon" || E.has("alarm_silenced")) continue;
      const A = I.footprint, M = e.mesh(i, "cylinder", p.timber, [
        0.045,
        4.8,
        0.045
      ], [
        A.x + 3.3,
        2.7,
        A.z + 2.5
      ]);
      M.rotation.z = -0.32;
      for (let N = 0; N < 5; N++) e.mesh(i, "rock", N % 2 ? p.ember : p.cloth, [
        0.55,
        1.2 + N % 3 * 0.3,
        0.55
      ], [
        A.x + Math.sin(N * 2) * 0.7,
        5.4 + N % 3 * 0.3,
        A.z + Math.cos(N * 2) * 0.7
      ], !0);
    }
    z = e.bake(i);
  }
  return b(a), {
    setFacts: b,
    people: w,
    parleyPeople: y,
    storyPeople: u.people,
    get animating() {
      return h.animating;
    },
    setProgress(E, S) {
      let C = c.setProgress(E);
      for (const I of x) {
        const A = S.has(I.id);
        I.model.visible !== A && (I.model.visible = A, C = !0);
      }
      return C;
    },
    setPeople(E, S) {
      let C = !1;
      for (const I of _t) {
        const A = E[I], M = Xa[I].station, N = Re[M.scene].anchors[M.anchor], j = A.mode === "idle" && (A.scene === "cells" || A.scene === M.scene && Math.hypot(A.position.x - N.x, A.position.y - N.y) < 1);
        let F = w.find((W) => W.id === I);
        F && (A.scene !== r.id || F.seated !== j) && (F.dispose(), w.splice(w.indexOf(F), 1), F = void 0, C = !0), A.scene === r.id && (F || (F = gd(e, l, I, A.position.x, A.position.y, new Set(L?.split("/")), n, j), w.push(F), C = !0), C = F.locate(A, S) || C);
      }
      return C;
    },
    setEncounterActive(E) {
      c.setEncounterActive(E), y.forEach((S) => {
        S.root.visible = !E;
      });
    },
    update: s.update,
    animate(E, S, C, I) {
      let A = !1;
      const M = Math.floor(S / (1e3 / 30));
      if (M !== k) {
        k = M;
        const j = w.find((F) => F.id === "sanniang");
        j && Math.hypot(j.position.x - E.x, j.position.y - E.y) < 22 && I(j.position) ? (j.update(E, S, C), A = !C) : j && (j.ring.visible = !1);
      }
      const N = Math.floor(S / 80);
      if (N === _) return A;
      _ = N, A = h.animate(S, C) || A, A = c.animate(C) || A, A = o.animate(E, S, C, I) || A;
      for (const j of y) A = j.update(E, C) || A;
      for (const j of u.people) A = j.update(E, S, C) || A;
      for (const j of w)
        j.id !== "sanniang" && (Math.hypot(j.position.x - E.x, j.position.y - E.y) < 22 ? (j.update(E, S, C), A = !C || A) : j.ring.visible = !1);
      return A;
    },
    dispose() {
      d.dispose(), h.dispose(), m(), f.removeFromParent(), x.forEach((E) => {
        E.dispose(), E.model.removeFromParent();
      }), o.dispose(), u.dispose(), w.splice(0).forEach((E) => E.dispose()), y.forEach((E) => E.dispose()), l.removeFromParent(), z?.(), c.dispose(), s.dispose();
    }
  };
}
var zd = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-stone.webp?v=3ccdfd02e4300f8b",
  import.meta.url
).href, Pd = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-plaster.webp?v=66cf9d7a7de2e698",
  import.meta.url
).href, Cd = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-slate.webp?v=cd1d7b4377c151d0",
  import.meta.url
).href, Ad = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/texture-ground.webp?v=8bf9c4c3f63de17d",
  import.meta.url
).href;
function $d(e, t) {
  const r = new Do(), a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  let i = 0, l = !1;
  function c(o, u) {
    i++;
    const h = r.load(o, (d) => {
      if (l) {
        d.dispose();
        return;
      }
      i--, s.delete(o);
      for (const f of u) a.set(f, d);
      e(), t(s.size, i);
    }, void 0, () => {
      l || (i--, n.delete(h), h.dispose(), s.set(o, u), t(s.size, i));
    });
    h.colorSpace = br, h.wrapS = h.wrapT = ai, h.anisotropy = 2, n.add(h);
  }
  for (const [o, u] of [
    [zd, [
      p.stone,
      p.wetStone,
      p.marble,
      p.marbleLight
    ]],
    [Pd, [p.light]],
    [Cd, [p.roof, p.roofLight]],
    [Ad, [
      p.grass,
      p.grassLight,
      p.grassDark
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
var hs = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/characters/sanniang.glb?v=995762a127831c0e",
  import.meta.url
).href;
function ps(e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  e.scene.traverse((s) => {
    if (s instanceof bt) {
      t.add(s.geometry);
      for (const i of Array.isArray(s.material) ? s.material : [s.material]) {
        r.add(i);
        for (const l of Object.values(i)) l instanceof ni && a.add(l);
      }
      s instanceof Ss && n.add(s.skeleton);
    }
  }), t.forEach((s) => s.dispose()), r.forEach((s) => s.dispose()), n.forEach((s) => s.dispose()), a.forEach((s) => {
    s.dispose(), s.source.data?.close?.();
  });
}
async function Id(e) {
  const t = await fetch(hs, { signal: e });
  if (!t.ok) throw new Error(`expedition_character_load:${t.status}`);
  const r = await t.arrayBuffer();
  e.throwIfAborted();
  const a = await new Mi().setMeshoptDecoder(_i).parseAsync(r, new URL(".", new URL(hs, location.href)).href), n = a.animations.find((o) => o.name === "idle"), s = a.animations.find((o) => o.name === "walk"), i = a.scene.getObjectByName("Sanniang")?.userData.stride;
  try {
    if (e.throwIfAborted(), !n || !s || typeof i != "number" || i <= 0) throw new Error("expedition_character_motion_missing");
  } catch (o) {
    throw ps(a), o;
  }
  const l = 1.48, c = i * l;
  return {
    create() {
      const o = new Ca(), u = bi(a.scene);
      o.add(u), u.scale.setScalar(l);
      const h = [], d = new ht(), f = new xn(), m = new xn(), x = /* @__PURE__ */ new Set();
      o.updateMatrixWorld(!0), u.traverse((S) => {
        if (S instanceof bt && (S.castShadow = S.receiveShadow = !0, S.frustumCulled = !1, S instanceof Ss)) {
          x.add(S.skeleton);
          const C = S.userData.groundContacts;
          for (const I of C) h.push({
            mesh: S,
            index: I[0],
            positions: I.map((A) => new ht().fromBufferAttribute(S.geometry.getAttribute("position"), A))
          });
        }
      });
      function w(S, C, I, A, M) {
        return d.set(I, A, M), S.applyBoneTransform(C, d).applyMatrix4(m), d.y;
      }
      const y = new Xo(u), _ = y.clipAction(n), k = y.clipAction(s);
      _.play(), k.play(), k.enabled = !1;
      let z = !1, L = -1, b = 0, E = 0;
      return {
        root: o,
        pose(S, C, I, A) {
          const M = L < 0 ? 0 : Math.min(0.12, Math.max(0, (S - L) / 1e3));
          L = S;
          const N = Math.max(0, C - b);
          if (b = C, I !== z) {
            z = I;
            const F = z ? k : _, W = z ? _ : k;
            F.reset().play(), W.crossFadeTo(F, 0.18, !1);
          }
          if (I && (E = (E + Math.min(N / c, M * 1.8)) % 1), k.timeScale = 0, z && (k.time = A ? 0 : E * s.duration), A) {
            const F = z ? k : _;
            (z ? _ : k).stop(), F.stopFading().setEffectiveWeight(1), F.time = 0;
          }
          y.update(A ? 0 : M), u.position.y = 0, o.updateMatrixWorld(!0), f.copy(o.matrixWorld).invert();
          let j = 1 / 0;
          for (const { mesh: F, index: W, positions: V } of h) {
            m.multiplyMatrices(f, F.matrixWorld);
            const J = w(F, W, 0, 0, 0), re = w(F, W, 1, 0, 0) - J, Ce = w(F, W, 0, 1, 0) - J, We = w(F, W, 0, 0, 1) - J;
            for (const Te of V) j = Math.min(j, J + Te.x * re + Te.y * Ce + Te.z * We);
          }
          u.position.y = -j;
        },
        dispose() {
          y.stopAllAction(), y.uncacheRoot(u), x.forEach((S) => S.dispose()), o.removeFromParent();
        }
      };
    },
    dispose() {
      ps(a);
    }
  };
}
function Td(e, t, r) {
  const a = new Es({
    antialias: !0,
    alpha: !1,
    powerPreference: r.world ? "default" : "high-performance"
  });
  a.outputColorSpace = br, a.toneMapping = 7, a.toneMappingExposure = 1, a.setPixelRatio(Math.min(devicePixelRatio || 1, r.world ? 1.4 : 1.8)), a.shadowMap.enabled = !0, a.shadowMap.type = 2, e.append(a.domElement);
  const n = document.createElement("div");
  n.className = "exp-world-labels", n.setAttribute("aria-hidden", "true"), e.append(n);
  const s = new ks(), i = new Rs(-10, 10, 10, -10, 0.1, 180), l = ur();
  s.add(new Ms("#effbff", "#74918a", 2));
  const c = new er("#fff4e5", 1.9);
  c.position.set(-12, 25, 13), c.castShadow = !0;
  const o = r.world ? 1024 : 1536;
  c.shadow.mapSize.set(o, o), Object.assign(c.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    far: 80
  }), c.shadow.bias = -4e-4, c.shadow.normalBias = 0.035, c.shadow.radius = 3, s.add(c);
  const u = new er("#c3edff", 1.1);
  u.position.set(7, 8, -15), s.add(u);
  const h = new Ca(), d = new Ca(), f = new Ca();
  s.add(h, d, f);
  const m = vo(l, d, r.traveler.gender), x = Vc(l, f), w = Bc(l, f), y = Gc(n), _ = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), z = [], L = matchMedia("(prefers-reduced-motion: reduce)"), b = matchMedia("(max-height:450px) and (min-width:600px)"), E = new ht(), S = new ht();
  let C = null, I = "", A = "", M = "", N = null, j = null, F = null, W = !1, V = NaN, J = NaN, re = NaN, Ce = null, We = 0, Te = 0, Ae = 1, _e = 1, dt = !0, kt = !1, Ot = !1, ta = 0, Dt = -1, ye = 0, Me = !1;
  const St = r.world ? $d(() => {
    I = "", dt = !0, r.invalidate?.();
  }, (fe, Ne) => r.artworkStatus?.(fe, Ne)) : null, sn = new AbortController();
  let it = null, Bt = !1;
  function ja(fe) {
    return kt || Ot ? !1 : !fe || fe.people.sanniang.scene !== fe.definition.id || it ? !0 : (Bt || (Bt = !0, Id(sn.signal).then((Ne) => {
      if (kt) {
        Ne.dispose();
        return;
      }
      it = Ne, dt = !0, r.invalidate?.();
    }).catch((Ne) => {
      kt || (Ot = !0, t(Ne));
    })), !1);
  }
  function Rt() {
    const fe = e.getBoundingClientRect();
    Ae = Math.max(1, fe.width), _e = Math.max(1, fe.height), a.setSize(Ae, _e, !1), dt = !0, Me = !1, r.invalidate?.();
  }
  const aa = new ResizeObserver(Rt);
  aa.observe(e), Rt();
  function on(fe) {
    fe.preventDefault(), Ot = !0, t(/* @__PURE__ */ new Error("expedition_webgl_context_lost"));
  }
  a.domElement.addEventListener("webglcontextlost", on);
  function mt(fe, Ne, lt, gt, Ge = !1) {
    if (Math.abs(fe) < 1) return;
    const D = document.createElement("span");
    D.className = Ge ? "exp-damage is-player" : fe < 0 ? "exp-damage is-heal" : "exp-damage", D.textContent = `${fe < 0 ? "+" : ""}${Math.ceil(Math.abs(fe))}`, n.append(D), z.push({
      element: D,
      position: new ht(Ne, 2, lt),
      born: gt
    });
  }
  function ga() {
    for (const fe of _.values())
      d.remove(fe.actor.root), fe.marker.remove();
    _.clear(), z.splice(0).forEach((fe) => fe.element.remove());
  }
  function Na(fe) {
    return Me ? (S.set(fe.x, 1, fe.y).project(i), Math.abs(S.x) < 1.15 && Math.abs(S.y) < 1.15) : !0;
  }
  return {
    draw(fe, Ne, lt, gt = "battle", Ge = 0, D) {
      if (!ja(D)) return;
      const Ua = performance.now(), ne = gt === "battle" ? fe : null, Fa = ne?.tick ?? (L.matches ? 0 : Ge * 0.025), va = (ne?.tick ?? -1) !== Dt, Za = `${Ne.weapon}/${Ne.outfit}/${lt}`;
      if (!D && !dt && gt === A && Za === M && ne === N && (!va && ne || !ne && (gt === "between" || L.matches || Ge - ta < 40))) return;
      ta = Ge;
      const qa = jn[lt], Da = D ? D.definition.id : `${lt}:${ne?.boss ?? !1}:${!!ne}`;
      if (Da !== I) {
        if (m.resetMotion(), k.forEach((ee) => ee.remove()), k.clear(), C?.(), D) {
          const ee = ur(St?.maps);
          j = Ed(ee, h, D.definition, D.facts, () => it);
          const se = j;
          C = () => {
            se.dispose(), ee.dispose();
          };
        } else
          j = null, C = Uc(l, h, lt, ne);
        Me = !1, I = Da, s.background = new _r(qa.sky), s.fog = new Go(qa.haze, 42, 95);
      } else D && Ce !== D.facts && j?.setFacts(D.facts);
      (!!ne != !!N || ne && N && ne.tick < Dt) && (m.resetMotion(), ga(), ye = ne?.player.hp ?? 0);
      const Ba = !D && gt !== "battle", Et = Ae < 600, Wa = Et || _e < 400, zt = Ae / _e;
      !!D?.reading !== W && (W = !!D?.reading, Me = !1);
      const ya = D?.definition.landscape.vista === "room", jt = ya ? Et ? 20 : Math.max(30, zt * (_e < 400 ? 19 : 25)) : D ? (Et ? Pt.mobileWidth : Math.max(Pt.minimumWidth, zt * (_e < 400 ? Pt.shortSpan : Pt.tallSpan))) * (D.definition.safe && !ne ? Pt.settlementScale : 1) : Ba ? Et ? 13 : 28 : Et ? 18.5 : Math.max(27, zt * (_e < 400 ? 14 : 23)), ln = Math.max(0, X.arena - jt / 2 + 0.5), vt = Ba ? 0 : 1 * Math.PI / 4, Ha = W && !b.matches ? jt / zt * 0.22 : 0, wa = W && b.matches ? jt * 0.23 : 0, ba = (D ? D.location.position.x * (ya ? 0.4 : 1) : ne ? Wa ? ne.player.x * 0.62 : Math.max(-ln, Math.min(ln, ne.player.x * 0.62)) : Et ? 0 : 5.5) + Math.sin(vt) * Ha + Math.cos(vt) * wa, Va = (D ? ya ? D.location.position.y * 0.4 - 1 : D.location.position.y - Pt.lead : ne ? ne.player.y * (Wa ? 0.62 : 0.2) - 0.4 : Et ? -4.2 : -11.8) + Math.cos(vt) * Ha - Math.sin(vt) * wa;
      D && Math.hypot(V - D.location.position.x, J - D.location.position.y) > 8 && (Me = !1);
      const na = Math.abs(E.x - ba) + Math.abs(E.z - Va) < 0.015, Un = D && j?.setPeople(D.people, Ge), Ga = D && j?.setProgress(D.completedSegments, D.objects), et = D && j?.animate(D.location.position, Ge, L.matches, Na);
      if (D && !dt && Me && na && Za === M && ne === N && !va && V === D.location.position.x && J === D.location.position.y && re === D.location.facing && Ce === D.facts && !et && !Un && !Ga && !m.animating) return;
      !Me || L.matches ? (E.set(ba, 0, Va), Me = !0) : (E.x += (ba - E.x) * 0.14, E.z += (Va - E.z) * 0.14), i.left = -jt / 2, i.right = jt / 2, i.top = jt / zt / 2, i.bottom = -i.top;
      const cn = D ? Pt.distance : 25;
      if (i.position.set(E.x + Math.sin(vt) * cn, D ? Pt.height : 28, E.z + Math.cos(vt) * cn), i.lookAt(E.x, 0, E.z), i.updateProjectionMatrix(), i.updateMatrixWorld(), D && (j?.setEncounterActive(!!ne), j?.update(D.location.position, vt)), k.forEach((ee) => {
        ee.hidden = !0;
      }), D && !ne) for (const ee of D.definition.objects) {
        if (ee.kind !== "reward" || !D.objects.has(ee.id)) continue;
        const se = `reward/${ee.id}`, Le = D.definition.anchors[ee.anchor];
        let Oe = k.get(se);
        Oe || (Oe = document.createElement("span"), Oe.className = "exp-person-name", Oe.textContent = `◇ ${ut.cache}`, n.append(Oe), k.set(se, Oe)), S.set(Le.x, 1.4, Le.y).project(i);
        const xa = Math.max(65, Math.min(Ae - 65, (S.x * 0.5 + 0.5) * Ae)), _a = Math.max(105, Math.min(_e - 145, (-S.y * 0.5 + 0.5) * _e));
        Oe.hidden = !1, Oe.style.transform = `translate(${xa}px,${_a}px) translate(-50%,-100%)`;
      }
      const tt = new Set(D && !ne ? [
        ...Ln(D.definition, D.location.position, D.facts, D.people),
        ...rn(D.definition.id, D.location.position, D.facts),
        ...Ta(D.definition, D.location, D.facts).filter((ee) => ee.kind === "object" && ee.target.kind === "resident")
      ].map((ee) => ee.target.id) : []);
      for (const ee of [
        ...j?.people ?? [],
        ...j?.parleyPeople ?? [],
        ...j?.storyPeople ?? []
      ]) {
        if (ne || !D || Math.hypot(ee.position.x - D.location.position.x, ee.position.y - D.location.position.y) > 10) continue;
        let se = k.get(ee.id);
        se || (se = document.createElement("span"), se.className = "exp-person-name", se.textContent = Ve(ee.id), n.append(se), k.set(ee.id, se)), se.textContent = tt.has(ee.id) ? `${Ve(ee.id)} · ${oe.actions.talk}` : Ve(ee.id), S.set(ee.position.x, 2.9 + ee.root.position.y, ee.position.y).project(i);
        const Le = (S.x * 0.5 + 0.5) * Ae, Oe = (-S.y * 0.5 + 0.5) * _e;
        se.hidden = Le < 30 || Le > Ae - 30 || Oe < 20 || Oe > _e - 20, se.style.transform = `translate(${Le}px,${Oe}px) translate(-50%,-100%)`;
      }
      r.world && (c.position.set(E.x - 12, 25, E.z + 13), c.target.position.set(E.x, 0, E.z), c.target.updateMatrixWorld());
      const Fn = D ? {
        ...D.location.position,
        facing: D.location.facing,
        dashTime: 0,
        swing: 0,
        shield: 0,
        guard: 0,
        resonance: 0
      } : null;
      m.update(ne?.player ?? Fn, Ne.weapon, Ne.outfit, Fa, Ge / 1e3, L.matches, Ba, !!ne?.effects.some((ee) => ee.kind === "resonance"));
      for (const ee of ne?.enemies ?? []) {
        let se = _.get(ee.id);
        if (!se) {
          const je = document.createElement("i");
          je.className = Ie(ee.kind) ? "exp-threat is-boss" : "exp-threat", n.append(je), se = {
            actor: Tr(l, d, ee.kind, qa),
            hp: ee.hp,
            death: null,
            marker: je
          }, _.set(ee.id, se);
        }
        se.hp > ee.hp && va && mt(se.hp - ee.hp, ee.x, ee.y, ne.tick), se.hp = ee.hp, se.actor.update(ee, ne.tick, L.matches, !!D), se.actor.bar.quaternion.copy(i.quaternion), S.set(ee.x, 1.2, ee.y).project(i);
        const Le = (S.x * 0.5 + 0.5) * Ae, Oe = (-S.y * 0.5 + 0.5) * _e, xa = Math.min(18, Ae / 2), _a = Math.min(Et ? 132 : 95, _e * 0.3), Z = Math.max(_a, _e - Math.min(130, _e * 0.3)), q = Math.max(xa, Math.min(Ae - xa, Le)), U = Math.max(_a, Math.min(Z, Oe));
        se.marker.hidden = Math.abs(Le - q) + Math.abs(Oe - U) < 10, se.marker.style.transform = `translate(${q}px,${U}px) rotate(${Math.atan2(Oe - U, Le - q) + Math.PI / 2}rad)`;
      }
      for (const [ee, se] of _) {
        if (ne?.enemies.some((Oe) => Oe.id === ee)) continue;
        se.death === null && (se.death = ne?.tick ?? 0, ne && se.hp > 0 && mt(se.hp, se.actor.root.position.x, se.actor.root.position.z, ne.tick));
        const Le = ((ne?.tick ?? 0) - se.death) / 12;
        se.actor.bar.visible = !1, se.marker.hidden = !0, se.actor.root.scale.setScalar(Math.max(0, 1 - Le)), (Le >= 1 || !ne || L.matches) && (d.remove(se.actor.root), se.marker.remove(), _.delete(ee));
      }
      ne && va && (ye !== ne.player.hp && mt(ye - ne.player.hp, ne.player.x, ne.player.y, ne.tick, ye > ne.player.hp), ye = ne.player.hp);
      const dn = D && (D.engagement ?? Ys(D.definition.id, D.facts, D.completedSegments));
      x.update(ne, L.matches, dn ? ft[dn].bounds : void 0);
      const un = ne?.effects.filter((ee) => ee.kind === "ward-hit").at(-1);
      w.update(ne?.player ?? null, un ? Math.max(0, (un.life - 5) / 10) : 0), y.update(ne, i, Ae, _e);
      for (let ee = z.length - 1; ee >= 0; ee--) {
        const se = z[ee], Le = ((ne?.tick ?? 0) - se.born) / 27;
        if (Le >= 1 || !ne) {
          se.element.remove(), z.splice(ee, 1);
          continue;
        }
        S.copy(se.position), S.y += L.matches ? 0 : Le * 0.9, S.project(i), se.element.style.transform = `translate(${(S.x * 0.5 + 0.5) * Ae}px,${(-S.y * 0.5 + 0.5) * _e}px)`, se.element.style.opacity = String(Math.min(1, (1 - Le) * 3));
      }
      a.render(s, i), We++, Te += performance.now() - Ua, D && F !== D.definition.id && (F = D.definition.id, r.sceneReady?.(F)), dt = !1, A = gt, M = Za, N = ne, Dt = ne?.tick ?? -1, D && (V = D.location.position.x, J = D.location.position.y, re = D.location.facing, Ce = D.facts);
    },
    invalidate() {
      dt = !0, r.invalidate?.();
    },
    ready: ja,
    needsFrame() {
      return j?.animating ?? !1;
    },
    retryArtwork() {
      St?.retry();
    },
    stats() {
      return {
        draws: We,
        submitMs: Te,
        calls: a.info.render.calls,
        triangles: a.info.render.triangles,
        geometries: a.info.memory.geometries,
        textures: a.info.memory.textures
      };
    },
    dispose() {
      kt = !0, aa.disconnect(), a.domElement.removeEventListener("webglcontextlost", on), sn.abort(), ga(), m.dispose(), y.dispose(), w.dispose(), C?.(), it?.dispose(), St?.dispose(), c.shadow.dispose(), l.dispose(), s.clear(), a.dispose(), a.forceContextLoss(), a.domElement.remove(), n.remove();
    }
  };
}
function fr(e) {
  if (e.kind === "exit") return `${oe.actions.travel} ${oe.scenes[e.target.to]}`;
  const t = e.target;
  switch (t.kind) {
    case "person":
      return `${oe.actions.talk} · ${oe.people[t.person]}`;
    case "enemy":
      return `${oe.actions.talk} · ${Ve(t.enemy)}`;
    case "resident":
      return `${oe.actions.talk} · ${Ve(t.person)}`;
    case "inspect":
      return oe.passages[t.passage].title;
    case "rest":
      return oe.actions.rest;
    case "reward":
      return ut.cache;
    case "switch":
      return oe.switches[t.fact];
  }
}
var mr = (e) => e.kind === "object" && e.target.kind === "inspect" ? kr(e.target.passage) : null, Ld = (e, t) => e.position.x === t.position.x && e.position.y === t.position.y;
function Od(e, t) {
  const r = (n) => {
    const s = mr(n);
    return s !== null && !t.has(s.fact);
  }, a = /* @__PURE__ */ new Map();
  for (const n of e) {
    const s = `${n.position.x}/${n.position.y}`, i = a.get(s) ?? [];
    i.push(n), a.set(s, i);
  }
  for (const n of a.values()) n.sort((s, i) => Number(r(i)) - Number(r(s)));
  return e.map((n) => a.get(`${n.position.x}/${n.position.y}`).shift());
}
function jd(e, t, r, a) {
  const n = e.find((i) => i.target.id === t);
  if (!n) return e[0]?.target.id ?? null;
  const s = mr(n);
  if (s && a && !a.has(s.fact) && r.has(s.fact)) {
    const i = e.find((l) => {
      const c = mr(l);
      return Ld(n, l) && c && !r.has(c.fact);
    });
    if (i) return i.target.id;
  }
  return t;
}
var Nd = ["aria-label"], Ud = {
  key: 0,
  class: "ember-transition",
  role: "status"
}, Fd = { class: "journey-hud" }, Zd = { class: "journey-heading" }, qd = { class: "journey-threat" }, Dd = {
  key: 1,
  class: "journey-artwork-issue",
  role: "status"
}, Bd = ["disabled"], Wd = {
  key: 2,
  class: "journey-controls"
}, Hd = ["aria-label"], Vd = {
  key: 0,
  class: "journey-interaction"
}, Gd = {
  key: 1,
  class: "journey-interaction journey-battle-actions"
}, Yd = {
  key: 0,
  class: "journey-resource"
}, Qd = [
  "max",
  "value",
  "aria-label"
], Kd = ["disabled"], Xd = ["disabled"], Jd = {
  key: 3,
  class: "journey-overlay"
}, eu = /* @__PURE__ */ Be({
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
    const a = e, n = r, s = H(null), i = H(null), l = H({
      x: 0,
      y: 0
    }), c = H(null), o = H({
      failed: 0,
      pending: 0
    }), u = H(!0), h = G(() => a.battle ? [] : Od([
      ...rn(a.world.definition.id, a.world.location.position, a.world.facts),
      ...Ta(a.world.definition, a.world.location, a.world.facts).filter((V) => V.kind === "exit" || a.world.objects.has(V.target.id)),
      ...Ln(a.world.definition, a.world.location.position, a.world.facts, a.world.people)
    ], a.world.facts)), d = G(() => h.value.find((V) => V.target.id === c.value) ?? null), f = G(() => a.weapon === "grimoire" ? ie.contractPower : ie.resource);
    let m = null, x = null, w = 0, y = 0, _ = 0, k = !1, z = !0;
    const L = xi((V, J) => {
      l.value = {
        x: V * 26,
        y: J * 26
      }, x?.stick(V, J);
    }, () => s.value?.focus({ preventScroll: !0 }));
    function b() {
      L.clear(), x?.clear(), _ = 0;
    }
    function E() {
      b(), n("pause");
    }
    function S() {
      m?.retryArtwork();
    }
    function C() {
      document.hidden ? (cancelAnimationFrame(w), w = 0, E()) : (m?.invalidate(), I());
    }
    function I() {
      !w && !k && z && (y = 0, w = requestAnimationFrame(W));
    }
    function A() {
      !a.paused && d.value && (b(), n("interact", d.value.target.id));
    }
    function M(V) {
      (!V || V.detail === 0) && x?.dash();
    }
    function N(V) {
      (!V || V.detail === 0) && x?.skill();
    }
    function j(V, J) {
      V.button === 0 && x?.[J]();
    }
    function F() {
      const V = h.value.findIndex((J) => J.target.id === c.value);
      c.value = h.value[(V + 1) % h.value.length]?.target.id ?? null;
    }
    function W(V) {
      if (w = 0, k || !z) return;
      !a.paused && !document.hidden && (w = requestAnimationFrame(W));
      const J = y ? Math.min(100, V - y) : 0;
      if (y = V, !a.paused && !document.hidden && m?.ready(a.world))
        for (_ += J; _ >= 1e3 / X.hz && !a.paused; ) {
          _ -= 1e3 / X.hz;
          const re = x.frame();
          if (re.skill && !a.battle) {
            A();
            break;
          }
          n("input", re);
        }
      else _ = 0;
      if (!document.hidden) try {
        m?.draw(a.battle ?? null, a, 0, "battle", V, a.world), !w && m?.needsFrame() && (w = requestAnimationFrame(W));
      } catch (re) {
        cancelAnimationFrame(w), w = 0, b(), n("error", re);
      }
    }
    return he([h, () => a.world.facts], ([V, J], re) => {
      c.value = jd(V, c.value, J, re?.[1]);
    }, { immediate: !0 }), he(() => a.world.definition.id, () => {
      b(), c.value = h.value[0]?.target.id ?? null, s.value?.focus({ preventScroll: !0 });
    }), he(() => a.paused, (V) => {
      b(), I(), V || s.value?.focus({ preventScroll: !0 });
    }), he(() => [
      a.world.definition,
      a.world.facts,
      a.world.location.position.x,
      a.world.location.position.y,
      a.world.reading,
      a.weapon,
      a.outfit
    ], I), fa(() => {
      try {
        m = Td(i.value, (V) => {
          u.value = !1, E(), n("error", V);
        }, {
          traveler: a.traveler,
          world: !0,
          invalidate: I,
          sceneReady: (V) => {
            u.value = !1, n("ready", V);
          },
          artworkStatus: (V, J) => {
            o.value = {
              failed: V,
              pending: J
            };
          }
        });
      } catch (V) {
        n("error", V);
        return;
      }
      x = Nc(s.value, E, () => {
      }), document.addEventListener("visibilitychange", C), I(), s.value?.focus({ preventScroll: !0 });
    }), zn(() => {
      z = !1, cancelAnimationFrame(w), w = 0, E();
    }), yr(() => {
      z = !0, I();
    }), ea(() => {
      k = !0, cancelAnimationFrame(w), b(), x?.dispose(), document.removeEventListener("visibilitychange", C), m?.dispose();
    }), t({
      stats: () => m?.stats(),
      focus: () => s.value?.focus({ preventScroll: !0 })
    }), (V, J) => ($(), T("section", {
      ref_key: "root",
      ref: s,
      class: "journey-field",
      tabindex: "0",
      "aria-label": e.battle ? g(ie).controls : g(oe).actions.controls
    }, [
      R("div", {
        ref_key: "canvas",
        ref: i,
        class: "journey-canvas"
      }, null, 512),
      u.value && !e.transitioning ? ($(), T("aside", Ud, P(g(oe).transition(g(oe).scenes[e.world.definition.id])), 1)) : Y("", !0),
      R("div", Fd, [R("header", Zd, [R("h1", null, P(g(oe).scenes[e.world.definition.id]), 1), qn(V.$slots, "status", {}, void 0, !0)]), R("div", qd, [qn(V.$slots, "threat", {}, void 0, !0)])]),
      o.value.failed ? ($(), T("div", Dd, [R("span", null, P(g(oe).artwork.unavailable), 1), R("button", {
        type: "button",
        disabled: o.value.pending > 0,
        onClick: S
      }, P(o.value.pending ? g(oe).artwork.loading : g(oe).artwork.retry), 9, Bd)])) : Y("", !0),
      e.paused ? Y("", !0) : ($(), T("div", Wd, [
        R("div", {
          class: "journey-stick",
          role: "group",
          "aria-label": g(oe).actions.move,
          onPointerdown: J[0] || (J[0] = Nt((...re) => g(L).down && g(L).down(...re), ["prevent"])),
          onPointermove: J[1] || (J[1] = Nt((...re) => g(L).move && g(L).move(...re), ["prevent"])),
          onPointerup: J[2] || (J[2] = (...re) => g(L).release && g(L).release(...re)),
          onPointercancel: J[3] || (J[3] = (...re) => g(L).release && g(L).release(...re)),
          onLostpointercapture: J[4] || (J[4] = (...re) => g(L).release && g(L).release(...re)),
          onContextmenu: J[5] || (J[5] = Nt(() => {
          }, ["prevent"]))
        }, [R("span", { style: ca({ transform: `translate(${l.value.x}px, ${l.value.y}px)` }) }, null, 4)], 40, Hd),
        d.value ? ($(), T("div", Vd, [R("button", {
          type: "button",
          class: "journey-act",
          onClick: A
        }, [J[9] || (J[9] = R("kbd", null, "E", -1)), Fe(P(g(fr)(d.value)), 1)]), h.value.length > 1 ? ($(), T("button", {
          key: 0,
          type: "button",
          class: "journey-switch",
          onClick: F
        }, P(g(oe).actions.next), 1)) : Y("", !0)])) : Y("", !0),
        e.battle ? ($(), T("div", Gd, [
          [
            "blade",
            "staff",
            "grimoire"
          ].includes(e.weapon) ? ($(), T("div", Yd, [
            R("span", null, P(e.battle.player.resonance > 0 ? g(ie).resonanceActive : f.value), 1),
            R("meter", {
              min: "0",
              max: g(It).maxPower,
              value: e.battle.player.resource,
              "aria-label": f.value
            }, null, 8, Qd),
            R("small", null, P(e.battle.player.resonance > 0 ? g(ie).secondsLeft(e.battle.player.resonance) : Math.floor(e.battle.player.resource)), 1)
          ])) : Y("", !0),
          R("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.dash > 0,
            onPointerdown: J[6] || (J[6] = Nt((re) => j(re, "dash"), ["prevent"])),
            onClick: M
          }, [
            R("kbd", null, P(g(ie).dashKey), 1),
            Fe(P(g(ie).dash), 1),
            R("small", null, P(e.battle.player.dash > 0 ? g(ie).secondsLeft(e.battle.player.dash) : g(ie).ready), 1)
          ], 40, Kd),
          R("button", {
            class: "journey-act",
            type: "button",
            disabled: e.battle.player.skill > 0,
            onPointerdown: J[7] || (J[7] = Nt((re) => j(re, "skill"), ["prevent"])),
            onClick: N
          }, [
            R("kbd", null, P(g(ie).skillKey), 1),
            Fe(P(g(Ht)[e.weapon].action), 1),
            R("small", null, P(e.battle.player.skill > 0 ? g(ie).secondsLeft(e.battle.player.skill) : g(ie).ready), 1)
          ], 40, Xd)
        ])) : Y("", !0)
      ])),
      e.paused && !e.transitioning ? ($(), T("div", Jd, [qn(V.$slots, "overlay", {}, () => [R("button", {
        class: "journey-act",
        type: "button",
        onClick: J[8] || (J[8] = (re) => n("resume"))
      }, P(g(oe).actions.resume), 1)], !0)])) : Y("", !0)
    ], 8, Nd));
  }
}), tu = /* @__PURE__ */ ot(eu, [["__scopeId", "data-v-79edbda2"]]);
function au(e) {
  const t = new Set(e.location.visited.map(pt)), r = new Set(e.facts), a = /* @__PURE__ */ new Map();
  for (const n of e.location.visited) {
    const s = pt(n);
    for (const i of $n(Re[n], r)) {
      if (i.kind !== "exit") continue;
      const l = pt(i.target.to), c = [s, l].sort().join("/");
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
function ko(e) {
  return Math.min(1, Math.min(e.width, e.depth) / 48);
}
function nu(e, t) {
  const r = ko(t), a = 3 * r, n = [], s = (i) => ({
    x: Math.max(t.x - t.width / 2 + a, Math.min(t.x + t.width / 2 - a, i.x)),
    y: Math.max(t.z - t.depth / 2 + a, Math.min(t.z + t.depth / 2 - a, i.y))
  });
  for (const i of e) {
    let l = s(i), c = -1;
    for (let o = 0; o <= 48; o++) {
      const u = Math.ceil(o / 8) * 5.2 * r, h = o * Math.PI / 4, d = s({
        x: i.x + Math.cos(h) * u,
        y: i.y + Math.sin(h) * u
      }), f = Math.min(1 / 0, ...n.map((m) => Math.hypot(m.x - d.x, m.y - d.y)));
      if (f > c && (l = d, c = f), f >= 5.2 * r) break;
    }
    n.push(l);
  }
  return n;
}
var ru = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/city-title.webp?v=e4da13bbd2fcb340",
  import.meta.url
).href, su = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/city-title-mobile.webp?v=b8c01112d5a24eba",
  import.meta.url
).href, ou = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-blade.webp?v=4afc3e9865f141f7",
  import.meta.url
).href, iu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-bow.webp?v=500f7936a56ed7a4",
  import.meta.url
).href, lu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-staff.webp?v=7fa32ff5577395e2",
  import.meta.url
).href, cu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-daggers.webp?v=86e6748e6d63cd49",
  import.meta.url
).href, du = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-grimoire.webp?v=2a62d36aaf6ec5b8",
  import.meta.url
).href, uu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/weapon-cannon.webp?v=37563c460e90f22b",
  import.meta.url
).href, hu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-camp.webp?v=d0b67bb847717255",
  import.meta.url
).href, pu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-crossroads.webp?v=4664ca9a4a943122",
  import.meta.url
).href, fu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-gate.webp?v=07d03a81ef93c76d",
  import.meta.url
).href, mu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-beacon.webp?v=22bc3649a7c3e783",
  import.meta.url
).href, gu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-waterway.webp?v=1788573c3dccc39a",
  import.meta.url
).href, vu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-cells.webp?v=1be273a4a5d70324",
  import.meta.url
).href, yu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-hall.webp?v=88da060da4622d75",
  import.meta.url
).href, wu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-roots.webp?v=f8fa744bcfa4f844",
  import.meta.url
).href, bu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/cg-arrival.webp?v=d6ab0fad582cb4d8",
  import.meta.url
).href, xu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/cg-ending.webp?v=c67a3c63cc53a73a",
  import.meta.url
).href, _u = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-south-street.webp?v=b3ec5e32bff0b5e8",
  import.meta.url
).href, Mu = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-workshop-street.webp?v=9e19441f76865b1e",
  import.meta.url
).href, ku = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/scene-heat-station.webp?v=40ef15f3dabee913",
  import.meta.url
).href, fs = {
  city: ru,
  cityMobile: su
}, Su = {
  blade: ou,
  bow: iu,
  staff: lu,
  daggers: cu,
  grimoire: du,
  cannon: uu
}, gr = {
  camp: hu,
  crossroads: pu,
  gate: fu,
  beacon: mu,
  waterway: gu,
  cells: vu,
  hall: yu,
  roots: wu,
  south_street: _u,
  workshop_street: Mu,
  heat_station: ku
}, ms = {
  arrival: bu,
  ending: xu
}, vr = {
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
}, So = (e) => hi(e) ? "furnace" : Mr(e) ? "city" : "outskirts", Ru = (e) => Object.keys(vr).filter((t) => t === "outskirts" || e.some((r) => So(r) === t)), Eu = { class: "ember-map-header" }, zu = ["src"], Pu = ["aria-pressed"], Cu = ["viewBox", "aria-label"], Au = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-dasharray"
], $u = ["transform"], Iu = ["fill"], Tu = {
  y: "22",
  "text-anchor": "middle"
}, Lu = ["viewBox", "aria-label"], Ou = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], ju = ["points", "stroke-width"], Nu = [
  "x",
  "y",
  "width",
  "height",
  "fill"
], Uu = [
  "cx",
  "cy",
  "r",
  "stroke-width"
], Fu = [
  "x1",
  "y1",
  "x2",
  "y2",
  "stroke-width"
], Zu = [
  "cx",
  "cy",
  "r",
  "fill"
], qu = ["x", "y"], Du = {
  key: 2,
  class: "ember-map-regions"
}, Bu = ["aria-pressed", "onClick"], Wu = {
  key: 3,
  class: "ember-map-places"
}, Hu = /* @__PURE__ */ Be({
  __name: "CampaignMap",
  props: { campaign: {} },
  emits: ["close"],
  setup(e, { emit: t }) {
    const r = e, a = t, n = H(!1), s = H(So(pt(r.campaign.location.scene))), i = H(null), l = H(!1), c = H(null), o = H({
      width: 400,
      height: 400
    }), u = new ResizeObserver((b) => {
      for (const E of b) {
        const { width: S, height: C } = E.contentRect;
        E.target === i.value ? l.value = S > C * 1.55 : o.value = {
          width: S,
          height: C
        };
      }
    });
    he(c, (b, E) => {
      E && u.unobserve(E), b && u.observe(b);
    }), fa(() => {
      u.observe(i.value);
    }), ea(() => u.disconnect());
    const h = G(() => au(r.campaign)), d = G(() => vr[s.value].layout), f = G(() => Object.fromEntries(h.value.scenes.filter((b) => d.value[b]).map((b) => {
      const [E, S] = d.value[b], { width: C, height: I } = o.value;
      return [b, l.value ? [50 + (104 - S) / 104 * (C - 100), 10 + (E - 10) / 80 * (I - 40)] : [45 + E / 104 * (C - 90), 10 + S / 104 * (I - 40)]];
    }))), m = G(() => h.value.links.filter((b) => f.value[b.from] && f.value[b.to])), x = G(() => Ru(r.campaign.location.visited.map(pt)).map((b) => [b, vr[b]])), w = G(() => Re[r.campaign.location.scene]), y = G(() => w.value.landscape.bounds), _ = G(() => ko(y.value)), k = G(() => `${y.value.x - y.value.width / 2 - 5 * _.value} ${y.value.z - y.value.depth / 2 - 5 * _.value} ${y.value.width + 10 * _.value} ${y.value.depth + 10 * _.value}`), z = G(() => ro(r.campaign)), L = G(() => {
      const b = nu(z.value.map((E) => E.position), y.value);
      return z.value.map((E, S) => ({
        ...E,
        marker: b[S]
      }));
    });
    return (b, E) => ($(), T("div", {
      ref_key: "root",
      ref: i,
      class: xt(["ember-map", {
        "ember-map-wide": l.value,
        "ember-map-local": !n.value
      }])
    }, [
      R("div", Eu, [
        g(gr)[w.value.id] ? ($(), T("img", {
          key: 0,
          src: g(gr)[w.value.id],
          alt: "",
          decoding: "async"
        }, null, 8, zu)) : Y("", !0),
        R("h2", null, P(n.value ? g(B).chapterMap : g(oe).scenes[w.value.id]), 1),
        R("div", null, [R("button", {
          type: "button",
          "aria-pressed": n.value,
          onClick: E[0] || (E[0] = (S) => n.value = !n.value)
        }, P(n.value ? g(B).localMap : g(B).chapterMap), 9, Pu), R("button", {
          type: "button",
          onClick: E[1] || (E[1] = (S) => a("close"))
        }, P(g(B).close), 1)])
      ]),
      n.value ? ($(), T("svg", {
        key: 0,
        ref_key: "routeMap",
        ref: c,
        viewBox: `0 0 ${o.value.width} ${o.value.height}`,
        role: "img",
        "aria-label": g(B).chapterMap,
        class: "ember-route-map"
      }, [($(!0), T(ae, null, Se(m.value, (S) => ($(), T("line", {
        key: S.id,
        x1: f.value[S.from][0],
        y1: f.value[S.from][1],
        x2: f.value[S.to][0],
        y2: f.value[S.to][1],
        stroke: "#9ab5ae",
        "stroke-width": "1.5",
        "stroke-dasharray": e.campaign.location.visited.includes(S.from) && e.campaign.location.visited.includes(S.to) ? void 0 : "4 4"
      }, null, 8, Au))), 128)), ($(!0), T(ae, null, Se(f.value, (S, C) => ($(), T("g", {
        key: C,
        transform: `translate(${S.join(",")})`
      }, [
        R("circle", {
          r: "6",
          fill: C === g(pt)(w.value.id) ? "#bf6242" : e.campaign.location.visited.includes(C) ? "#366678" : "#b6c9c2",
          stroke: "#fffcef",
          "stroke-width": "1.5"
        }, null, 8, Iu),
        R("text", Tu, P(e.campaign.location.visited.includes(C) ? g(oe).scenes[C] : g(B).unknownArea), 1),
        R("title", null, P(e.campaign.location.visited.includes(C) ? g(oe).scenes[C] : g(B).unknownArea), 1)
      ], 8, $u))), 128))], 8, Cu)) : ($(), T("svg", {
        key: 1,
        viewBox: k.value,
        role: "img",
        "aria-label": g(oe).scenes[w.value.id]
      }, [
        R("rect", {
          x: y.value.x - y.value.width / 2,
          y: y.value.z - y.value.depth / 2,
          width: y.value.width,
          height: y.value.depth,
          rx: "2",
          fill: w.value.landscape.vista === "room" ? "#e8e1d5" : "#d4e5d9"
        }, null, 8, Ou),
        ($(!0), T(ae, null, Se(w.value.landscape.roads, (S, C) => ($(), T("polyline", {
          key: C,
          points: S.points.map((I) => I.join(",")).join(" "),
          fill: "none",
          stroke: "#f8f1d9",
          "stroke-width": S.width,
          "stroke-linejoin": "round"
        }, null, 8, ju))), 128)),
        ($(!0), T(ae, null, Se(w.value.landscape.features, (S) => ($(), T("rect", {
          key: S.id,
          x: S.footprint.x - S.footprint.width / 2,
          y: S.footprint.z - S.footprint.depth / 2,
          width: S.footprint.width,
          height: S.footprint.depth,
          fill: S.kind === "water" ? "#6eb8c6" : S.kind === "tree" || S.kind === "thicket" ? "#80a28a" : "#8a9e9f",
          rx: ".5"
        }, null, 8, Nu))), 128)),
        R("circle", {
          cx: e.campaign.location.position.x,
          cy: e.campaign.location.position.y,
          r: 3.2 * _.value,
          fill: "none",
          stroke: "#c84f3c",
          "stroke-width": _.value
        }, [R("title", null, P(g(B).here), 1)], 8, Uu),
        ($(!0), T(ae, null, Se(L.value, (S, C) => ($(), T("g", { key: S.target.id }, [
          R("line", {
            x1: S.position.x,
            y1: S.position.y,
            x2: S.marker.x,
            y2: S.marker.y,
            stroke: "#a3642a",
            "stroke-width": 0.5 * _.value
          }, null, 8, Fu),
          R("circle", {
            cx: S.marker.x,
            cy: S.marker.y,
            r: 2.4 * _.value,
            fill: S.kind === "exit" ? "#356987" : "#a3642a"
          }, null, 8, Zu),
          R("text", {
            class: "ember-map-number",
            style: ca({ fontSize: `${3.4 * _.value}px` }),
            x: S.marker.x,
            y: S.marker.y + 1.1 * _.value,
            "text-anchor": "middle"
          }, P(C + 1), 13, qu),
          R("title", null, P(g(fr)(S)), 1)
        ]))), 128))
      ], 8, Lu)),
      n.value ? ($(), T("div", Du, [($(!0), T(ae, null, Se(x.value, ([S, C]) => ($(), T("button", {
        key: S,
        type: "button",
        "aria-pressed": s.value === S,
        onClick: (I) => s.value = S
      }, P(C.label), 9, Bu))), 128))])) : ($(), T("ol", Wu, [($(!0), T(ae, null, Se(z.value, (S) => ($(), T("li", { key: S.target.id }, P(g(fr)(S)), 1))), 128))]))
    ], 2));
  }
}), Vu = /* @__PURE__ */ ot(Hu, [["__scopeId", "data-v-73f4e820"]]), Gu = { class: "exp-wardrobe" }, Yu = { class: "exp-fitting-body" }, Qu = { class: "exp-preview-stage" }, Ku = ["aria-label"], Xu = {
  key: 0,
  class: "exp-preview-error",
  role: "alert"
}, Ju = { class: "exp-preview-tools" }, eh = ["aria-label"], th = ["disabled"], ah = { class: "exp-outfit-info" }, nh = { class: "exp-muted" }, rh = { class: "exp-fitting-actions" }, sh = {
  key: 0,
  class: "exp-muted"
}, oh = ["disabled"], ih = { key: 2 }, lh = { class: "exp-purchase-confirm" }, ch = ["disabled"], dh = ["disabled"], uh = ["aria-label"], hh = ["aria-pressed", "onClick"], ph = ["src"], fh = /* @__PURE__ */ Be({
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
    const r = e, a = t, n = H(r.data.equippedOutfit), s = H(!1), i = H(0), l = H(!1), c = H(null), o = H(null), u = H({}), h = G(() => At[n.value]), d = G(() => Vn(r.data, n.value)), f = G(() => ui.find((S) => Jt[S].awardKey === h.value.achievement)), m = G(() => Ls.filter((S) => Vn(r.data, S) || At[S].achievement === null || Object.values(ft).some((C) => C.boss && Jt[C.boss].awardKey === At[S].achievement)));
    let x = null, w = !0, y = 0, _ = () => {
    };
    he([
      n,
      i,
      () => r.weapon
    ], () => {
      w = !0, _(), s.value = !1;
    });
    function k(S) {
      n.value = S, o.value?.scrollTo({ top: 0 });
    }
    function z() {
      y = performance.now() + 1100, w = !0, _();
    }
    function L() {
      s.value = !1, a("command", {
        type: "purchase",
        id: n.value
      });
    }
    function b() {
      w = !0;
      let S;
      try {
        S = new Es({
          antialias: !0,
          alpha: !1
        });
      } catch {
        l.value = !0;
        return;
      }
      S.outputColorSpace = br, S.toneMapping = 7, S.setPixelRatio(Math.min(devicePixelRatio, 1.8));
      const C = new ks(), I = ur(), A = new Ca(), M = vo(I, A, r.traveler.gender);
      C.background = new _r("#d1e0e1"), C.add(A, new Ms("#fff6e3", "#627c93", 2.7));
      const N = new er("#fff6e0", 3);
      N.position.set(-3, 5, 6), C.add(N);
      const j = new Rs(-2.35, 2.35, 2.35, -2.35, 0.1, 30), F = new _n();
      function W(ye) {
        M.update({
          x: 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, ye, 0, 0, !0, !1), M.root.position.set(0, 0.1, 0), M.root.rotation.y = -0.2, M.root.scale.setScalar(1.35);
      }
      for (const ye of m.value)
        W(ye), F.union(new _n().setFromObject(A));
      const V = F.getSize(new ht()), J = F.getCenter(new ht()), re = V.y * 0.5 + V.z * 0.1 + 0.2, Ce = Math.hypot(V.x, V.z) * 0.5 + 0.2;
      j.position.set(0, J.y + 0.8, 7), j.lookAt(0, J.y, 0);
      function We(ye) {
        const Me = Math.max(re, Ce / ye);
        j.left = -Me * ye, j.right = -j.left, j.top = Me, j.bottom = -Me, j.updateProjectionMatrix();
      }
      We(1), S.setSize(144, 144, !1);
      try {
        for (const ye of m.value)
          W(ye), S.render(C, j), u.value[ye] = S.domElement.toDataURL("image/png");
      } catch {
        l.value = !0, M.dispose(), I.dispose(), C.clear(), S.dispose(), S.forceContextLoss();
        return;
      }
      c.value.append(S.domElement);
      let Te = 0, Ae = 1, _e = 1;
      const dt = new ResizeObserver(() => {
        const ye = c.value.getBoundingClientRect();
        Ae = Math.max(1, ye.width), _e = Math.max(1, ye.height), S.setSize(Ae, _e, !1), We(Ae / _e), w = !0, _();
      });
      dt.observe(c.value);
      const kt = matchMedia("(prefers-reduced-motion: reduce)");
      function Ot(ye) {
        ye.preventDefault(), l.value = !0, cancelAnimationFrame(Te), Te = 0;
      }
      S.domElement.addEventListener("webglcontextlost", Ot);
      function ta(ye) {
        if (Te = 0, l.value || document.hidden || !w && (ye > y || kt.matches) && !M.animating) return;
        const Me = ye < y && !kt.matches, St = ye * 0.03;
        M.update({
          x: Me ? Math.sin(St * 0.4) * 0.03 : 0,
          y: 0,
          facing: Math.PI / 2,
          dashTime: 0,
          swing: Me ? 8 - St % 8 : 0,
          shield: 0,
          guard: 0,
          resonance: 0
        }, r.weapon, n.value, St, ye / 1e3, kt.matches, !1), M.root.position.set(0, 0.1, 0), M.root.rotation.y = Number(i.value) * Math.PI / 180, M.root.scale.setScalar(1.35);
        try {
          S.render(C, j), w = !1;
        } catch {
          l.value = !0;
        }
        (Me || M.animating) && !l.value && _();
      }
      _ = () => {
        !Te && !l.value && !document.hidden && (Te = requestAnimationFrame(ta));
      };
      function Dt() {
        document.hidden ? (cancelAnimationFrame(Te), Te = 0) : (w = !0, _());
      }
      document.addEventListener("visibilitychange", Dt), _(), x = () => {
        _ = () => {
        }, cancelAnimationFrame(Te), dt.disconnect(), document.removeEventListener("visibilitychange", Dt), S.domElement.removeEventListener("webglcontextlost", Ot), M.dispose(), I.dispose(), C.clear(), S.dispose(), S.forceContextLoss(), S.domElement.remove();
      };
    }
    function E() {
      x?.(), x = null, l.value = !1, b();
    }
    return fa(b), ea(() => x?.()), (S, C) => ($(), T("div", Gu, [R("section", {
      ref_key: "fitting",
      ref: o,
      class: "exp-fitting"
    }, [R("div", Yu, [R("div", Qu, [R("div", {
      ref_key: "host",
      ref: c,
      class: "exp-outfit-preview",
      "aria-label": g(Pa)[n.value].name
    }, [l.value ? ($(), T("div", Xu, [R("p", null, P(g(ie).presentationError.rendering), 1), R("button", {
      type: "button",
      onClick: E
    }, P(g(B).reload), 1)])) : Y("", !0)], 8, Ku), R("div", Ju, [R("label", null, [Fe(P(g(ie).rotate), 1), oa(R("input", {
      "onUpdate:modelValue": C[0] || (C[0] = (I) => i.value = I),
      type: "range",
      min: "-180",
      max: "180",
      step: "5",
      "aria-label": g(ie).rotate
    }, null, 8, eh), [[wr, i.value]])]), R("button", {
      type: "button",
      disabled: l.value,
      onClick: z
    }, P(g(ie).previewAction), 9, th)])]), R("div", ah, [
      R("h3", null, P(g(Pa)[n.value].name), 1),
      R("p", null, P(g(Pa)[n.value].detail), 1),
      R("p", nh, P(g(ie).wardrobeNote), 1)
    ])]), R("div", rh, [g(Br)(e.data.active) ? Y("", !0) : ($(), T("p", sh, P(g(B).safeWardrobe), 1)), d.value ? ($(), T("button", {
      key: 1,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || !g(Br)(e.data.active) || e.data.equippedOutfit === n.value,
      onClick: C[1] || (C[1] = (I) => a("command", {
        type: "equip",
        id: n.value
      }))
    }, P(e.data.equippedOutfit === n.value ? g(ie).equipped : g(ie).equip), 9, oh)) : f.value ? ($(), T("p", ih, P(g(ie).unlockWeapon(g(rr)[f.value])), 1)) : s.value ? ($(), T(ae, { key: 3 }, [R("p", null, P(g(ie).buyOutfit(g(Pa)[n.value].name, h.value.price)), 1), R("div", lh, [R("button", {
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: L
    }, P(g(ie).confirm), 9, ch), R("button", {
      type: "button",
      onClick: C[2] || (C[2] = (I) => s.value = !1)
    }, P(g(ie).cancel), 1)])], 64)) : ($(), T("button", {
      key: 4,
      type: "button",
      class: "exp-primary",
      disabled: e.blocked || e.balance < h.value.price,
      onClick: C[3] || (C[3] = (I) => s.value = !0)
    }, P(e.balance < h.value.price ? g(ie).noCoins : g(ie).purchase) + " · " + P(g(ie).coins(h.value.price)), 9, dh))])], 512), R("div", {
      class: "exp-outfit-rack",
      "aria-label": g(ie).tryOn
    }, [($(!0), T(ae, null, Se(m.value, (I) => ($(), T("button", {
      key: I,
      type: "button",
      "aria-pressed": n.value === I,
      onClick: (A) => k(I)
    }, [
      u.value[I] ? ($(), T("img", {
        key: 0,
        class: "exp-outfit-swatch",
        src: u.value[I],
        alt: ""
      }, null, 8, ph)) : Y("", !0),
      R("strong", null, P(g(Pa)[I].name), 1),
      R("small", null, P(e.data.equippedOutfit === I ? g(ie).equipped : g(Vn)(e.data, I) ? g(ie).owned : g(At)[I].price ? g(ie).coins(g(At)[I].price) : g(ie).achievement), 1)
    ], 8, hh))), 128))], 8, uh)]));
  }
}), mh = fh;
function Ro(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.matchAll(/<!-- field:([a-z]+) -->\s*([^]*?)(?=<!-- field:|$)/g))
    t.has(r[1]) && ve("narrative_unavailable"), t.set(r[1], r[2].trim());
  return t;
}
function gh(e, t = 1) {
  const r = [];
  for (const a of e.matchAll(/<!-- stage:(\d+):(\d+) -->\s*([\s\S]*?)<!-- \/stage -->/g)) {
    if (Number(a[1]) !== t) continue;
    const n = Number(a[2]);
    (r[n] || n >= Oa.bands.length) && ve("narrative_unavailable");
    const s = Ro(a[3]);
    r[n] = {
      memory: s.get("memory") ?? "",
      shadow: s.get("shadow") ?? "",
      secret: s.get("secret") ?? null
    };
  }
  return Oa.bands.some((a, n) => !r[n]) && ve("narrative_unavailable"), r;
}
function vh(e, t, r) {
  const a = e[Ar(t.affection)];
  return {
    shadow: a.shadow,
    personalPast: e.slice(0, t.highestBand + 1).map((n) => n.memory).filter(Boolean),
    secret: a.secret,
    disclosedSecret: r ? e.find((n) => n.secret)?.secret ?? null : null
  };
}
var yh = Object.freeze({
  position: "位置",
  longing: "渴求",
  possession: "占有",
  defense: "防御",
  surrender: "让渡",
  balance: "力量关系"
});
function wh(e) {
  let t;
  const r = [];
  for (const a of e.matchAll(/<!-- relationship:(zero|\d+) -->\s*([\s\S]*?)<!-- \/relationship -->/g)) {
    const n = Ro(a[2]), s = (l) => {
      const c = n.get(l);
      return c || ve("narrative_unavailable"), c;
    }, i = Object.fromEntries(Object.entries(yh).map(([l, c]) => [c, s(l)]));
    if (a[1] === "zero")
      t && ve("narrative_unavailable"), t = i;
    else {
      const l = Number(a[1]);
      (r[l] || l >= Oa.bands.length) && ve("narrative_unavailable"), r[l] = {
        name: s("name"),
        psychology: i
      };
    }
  }
  return (!t || Oa.bands.some((a, n) => !r[n])) && ve("narrative_unavailable"), {
    zero: t,
    bands: r
  };
}
function Eo(e, t) {
  const r = e.bands[Ar(t)];
  return t === 0 ? {
    name: r.name,
    psychology: e.zero
  } : r;
}
var bh = async (e, t) => {
  const r = await fetch(`/${Zo}/modules/xiaobai-os/docs/expedition-cards/${e}.md`, {
    signal: t,
    cache: "no-cache"
  });
  r.ok || ve("narrative_unavailable");
  const a = await r.text();
  return a.trim() || ve("narrative_unavailable"), a;
};
async function xh(e, t, r = bh) {
  const [a, n, s, i, l] = await Promise.all([
    r("system-prompt", t),
    r("world", t),
    r("player", t),
    r("meta-protocol", t),
    Promise.all(ir.map(async (y) => ({
      id: y,
      document: await r(Pe(y) || Mt(y) ? y : Je[y].card, t)
    })))
  ]), c = l.map(({ id: y, document: _ }) => {
    const k = [..._.matchAll(/<!-- public -->\s*([\s\S]*?)\s*<!-- \/public -->/g)];
    return (k.length !== 1 || !k[0][1].trim()) && ve("narrative_unavailable"), {
      id: y,
      introduction: k[0][1].trim(),
      document: _.replace(k[0][0], "").trim()
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
      initial: De[e].greeting,
      returned: null
    }
  };
  if (!Pe(e)) {
    const y = /<!-- opening:([a-z]+\.initial) -->\s*([\s\S]*?)\s*<!-- \/opening -->/.exec(u);
    return (!y || y[1] !== `${e}.initial`) && ve("narrative_unavailable"), {
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
  const [d, f] = await Promise.all(["openings", `${e}-stages`].map((y) => r(y, t))), m = new Map([...d.matchAll(/<!-- opening:([a-z]+\.(?:initial|returned)) -->\s*([\s\S]*?)\s*<!-- \/opening -->/g)].map((y) => [y[1], y[2].trim()])), x = m.get(`${e}.initial`), w = m.get(`${e}.returned`) ?? null;
  return (!x || (e === "anian" || e === "kouzi") && !w) && ve("narrative_unavailable"), {
    ...h,
    character: u,
    relationship: wh(f),
    stages: gh(f),
    opening: {
      initial: x,
      returned: w
    }
  };
}
function zo(e) {
  return ri[e];
}
function _h(e, t, r = []) {
  if (Mt(t)) return Object.fromEntries(Kr(e, t).map((i) => [i, La[i].meaning]));
  if (!Pe(t)) {
    const i = Je[t];
    return e.facts.includes(i.complete) || e.pendingParley ? {} : {
      attack: pe.attack,
      ...e.facts.includes(i.intel) ? { pass: pe.pass } : {}
    };
  }
  const a = Object.fromEntries(Kr(e, t).map((i) => [i, La[i].meaning])), n = zo(t), s = e.relationships[t].affection;
  if (n && !e.facts.includes(n) && s >= Oa.bands[4] && r[Ar(s)]?.secret && (a.share_secret = pe.shareSecret), ql(e, t)) {
    a.follow = pe.follow, a.stay = pe.stay;
    for (const i of to(e, t).filter((l) => l.accessible && l.solo)) a[`go:${i.id}`] = pe.go(i.name);
  }
  return a;
}
var Po = "dialogue", Nn = `<${Po}>`, Lr = `</${Po}>`, A0 = new RegExp(`${Nn}([\\s\\S]*?)${Lr}`, "i"), $0 = new RegExp(Nn, "i");
function gs(e) {
  const t = e.affectionDelta ? e.affectionDelta > 0 ? "up" : "down" : null;
  return `${Nn}
${e.reply}
${Lr}
${JSON.stringify({
    action: e.action,
    affection: t,
    performance: e.performance ?? null,
    clothing: e.clothing ?? null
  })}`;
}
function Mh(e) {
  return `［开工强调］：

本轮回复由两部分组成：XML 正文与 JSON 操作，缺一不可。

第一部分，在 ${Nn}…${Lr} 中用【${e}】的身份第一人称叙事，具体遵循前面的世界设定、人物设定与叙事框架，还原人物。

第二部分，在正文后的 JSON 对象中，逐项核对并提交本轮操作：
- action：人物前往、跟随、留下，以及本轮可用的剧情行动。
- clothing：本轮服饰变化。
- affection：本轮好感变化。
- performance：对应正文的表情与动作表现。

涉及上述可操作项时，必须提交对应字段，不能只停留在正文描述。具体遵循前面的操作规则。

开工：`;
}
function kh(e) {
  return e.map((t) => ({
    id: t,
    event: en[t]
  }));
}
function Sh(e) {
  const t = /* @__PURE__ */ new Set();
  let r;
  return e.filter((a) => a.kind !== "receipt").flatMap((a) => {
    const n = a.facts.filter((l) => !t.has(l)), s = {
      ...a.scene === r ? {} : { place: oe.scenes[a.scene] },
      ...n.length ? { newEvents: n } : {}
    };
    a.facts.forEach((l) => t.add(l)), r = a.scene;
    const i = Object.keys(s).length ? `<scene>
${JSON.stringify(s)}
</scene>
` : "";
    return a.kind === "greeting" ? [{
      role: "assistant",
      content: gs(a)
    }] : a.kind === "player" ? [{
      role: "user",
      content: i + a.player
    }] : [{
      role: "user",
      content: i + a.player
    }, {
      role: "assistant",
      content: gs(a)
    }];
  });
}
function Rh(e, t) {
  return t ? e.findIndex((r) => r.id === t.throughId) + 1 : 0;
}
var Eh = {
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
      place: oe.scenes[a.to],
      position: Re[r].anchors[a.anchor]
    };
    return r = a.to, n;
  });
}
function zh(e, t) {
  const r = new Set(e.facts), a = new Set(e.knowledge[t]), n = [], s = Mr(pt(t in De ? De[t].scene : t in e.people ? e.people[t].scene : e.location.scene));
  r.has("city_rekindled") || (r.has("heat_restored") ? n.push("heat_restored") : (a.has("heat_notice_read") || s) && n.push("heat_notice_read"));
  const i = Is.flatMap((l) => {
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
    situation: l === "heat_notice_read" ? Ke.heatSituation : t === "chenhe" && l === "worker_record_corrected" ? Ke.workerCorrected : di[l]
  }));
}
function Ph(e, t) {
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
    situation: pi[i]
  }));
}
function Ch(e, t) {
  const r = new Set(e.facts), a = Pe(t) ? e.people[t] : null, n = Re[Pe(t) ? e.people[t].scene : Mt(t) ? De[t].scene : Je[t].scene], s = Pe(t) ? e.people[t].position : Mt(t) ? n.anchors[De[t].anchor] : En(t, r), i = Ln(n, s, r, e.people), l = rn(n.id, s, r).filter((y) => He(Lt(n, r), s, y.position)), c = tr(n.id), o = Pe(t) ? Ps(e.facts, t) : null, u = e.location.scene === n.id ? Ta(n, e.location, r) : [], h = Ns(e), d = Sr, f = $s(e).find((y) => y.person === t), m = Lt(n, r), x = Cr(e, t), w = n.exits.filter((y) => x.exit(n.id, y.to));
  return {
    place: oe.scenes[n.id],
    chapter: e.chapter !== "outpost" ? { situation: [...zh(e, t), ...Ph(e, t)] } : {
      phase: h.phase,
      playerObjective: nr(e),
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
        place: oe.scenes[d.scene],
        interaction: oe.passages[d.object.passage].title,
        position: Re[d.scene].anchors[d.object.anchor],
        available: Ut(d.object.condition, r),
        route: Co(e.location.scene, Rn(e.location, {
          scene: d.scene,
          anchor: d.object.anchor
        }, r, !1, x.exit))
      }
    } } : {},
    exits: w.map((y) => {
      const _ = n.anchors[y.anchor], k = Ut(y.condition, r);
      return {
        id: y.id,
        to: y.to,
        place: oe.scenes[y.to],
        position: _,
        open: k,
        selfAccessible: k && ha(m, s, _, X.playerRadius) !== null,
        playerAccessible: k && e.location.scene === n.id && ha(m, e.location.position, _, X.playerRadius) !== null,
        withinReach: u.some((z) => z.target.id === y.id)
      };
    }),
    playerLodging: [ar.guest_room.name, ...e.location.visited.includes("south_inn") ? [ar.south_inn.name] : []],
    ...o ? { rescue: {
      phase: o,
      situation: Eh[o]
    } } : {},
    playerMechanisms: n.objects.flatMap((y) => {
      if (!Ut(y.condition, r)) return [];
      const _ = y.kind === "inspect" ? kr(y.passage) : void 0, k = y.kind === "switch" ? {
        action: oe.switches[y.fact],
        fact: y.fact
      } : _?.operation ? {
        action: _.operation.label,
        fact: _.fact
      } : null;
      return k ? [{
        id: y.id,
        action: k.action,
        position: n.anchors[y.anchor],
        completed: r.has(k.fact),
        withinReach: u.some((z) => z.target.id === y.id)
      }] : [];
    }),
    ...c ? { room: {
      use: c.use,
      enclosure: c.enclosure,
      household: c.household.map((y) => y === "player" ? e.traveler.name : y in oe.households ? oe.households[y] : Ve(y)),
      furniture: c.furniture.map((y) => ({
        item: y.label,
        position: {
          x: y.footprint.x,
          y: y.footprint.z
        }
      })),
      exits: w.map((y) => ({
        place: oe.scenes[y.to],
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
      ..._t.filter((y) => e.people[y].scene === n.id).map(Ve),
      ...ma.filter((y) => De[y].scene === n.id).map(Ve),
      ...l.map((y) => Ve(y.target.id))
    ],
    residents: (_o[n.id] ?? []).filter((y) => Ut(y.condition, r)).map((y) => ({
      name: y.name,
      activity: wd[y.activity]
    })),
    movement: a ? {
      mode: a.mode,
      destination: a.destination ? Pn[a.destination].name : null,
      leader: a.mode === "follow" ? e.traveler.name : null
    } : null,
    nearby: [
      ...i,
      ...l,
      ...Ta(n, {
        scene: n.id,
        position: s,
        facing: 0,
        visited: [n.id]
      }, r).filter((y) => y.kind === "object" && y.target.kind === "resident")
    ].filter((y) => y.target.id !== t).map((y) => Ve(y.target.id))
  };
}
function Ah(e) {
  return {
    name: e.name,
    gender: e.gender,
    adult: !0,
    ...e.appearanceAge ? { appearanceAge: tn[e.appearanceAge] } : {}
  };
}
function $h(e, t, r = []) {
  const a = _h(e, t, r), n = Object.keys(a), s = {
    person: Ve(t),
    ...Ch(e, t),
    clothing: fo(e, t),
    events: kh(e.knowledge[t]),
    actions: n,
    actionMeanings: a
  };
  if (Mt(t)) return {
    ...s,
    rescued: !1
  };
  if (!Pe(t)) {
    const i = Je[t];
    return {
      ...s,
      rescued: !1,
      resolved: e.facts.includes(i.complete)
    };
  }
  return {
    ...s,
    map: to(e, t).map((i) => ({
      ...i,
      route: Co(e.people[t].scene, i.route)
    })),
    rescued: Ja(e.facts, t),
    affection: e.relationships[t].affection
  };
}
function Ya(e, t) {
  return `<${e}>
${t}
</${e}>`;
}
function Ih(e, t, r, a, n = e.memories[t]) {
  const s = $h(e, t, a.stages), i = fc(t), l = Pe(t) ? zo(t) : null, c = Pe(t) ? {
    psychology: Eo(a.relationship, e.relationships[t].affection).psychology,
    ...vh(a.stages, e.relationships[t], !!l && e.facts.includes(l))
  } : null, { actions: o, actionMeanings: u, events: h, ...d } = s, f = {
    actions: u,
    performance: i,
    clothing: Ir
  }, m = {
    memory: n?.text ?? null,
    events: h,
    ...d,
    opening: e.conversations[t].some((x) => x.kind === "dialogue") || Ks(t) && e.facts.includes(Je[t].complete) ? null : s.rescued ? a.opening.returned : a.opening.initial,
    stage: c
  };
  return {
    systemPrompt: [
      a.system.trim(),
      Ya("background", a.world.trim()),
      Ya("player", `${a.player.trim()}

${JSON.stringify({
        ...Ah(e.traveler),
        outfit: Pa[e.outfit].detail,
        equipment: Ht[e.weapon].equipment
      }, null, 2)}`),
      Ya("NPCs", `${a.npcs}

${a.character.trim()}`)
    ].join(`

`),
    messages: [
      {
        role: "user",
        content: `${Ya("meta_protocol", `${a.protocol.trim()}

${Ya("operations", JSON.stringify(f, null, 2))}`)}

<story>
${JSON.stringify(m, null, 2)}`
      },
      ...Sh(e.conversations[t].length ? e.conversations[t].slice(Rh(e.conversations[t], n)) : [io(e, t)]),
      {
        role: "user",
        content: `${r}
</story>

${Mh(s.person)}`
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
function Th(e, t, r, a) {
  const n = Ih(e, t, r, a), s = jo({ messages: [{
    role: "system",
    content: n.systemPrompt
  }, ...n.messages] }), i = Dn(n.systemPrompt), l = Dn(e.memories[t]?.text ?? ""), c = Dn(JSON.stringify(n.messages.slice(1, -1)));
  return {
    used: s,
    system: i,
    memory: l,
    history: c,
    situation: Math.max(0, s - i - l - c),
    limit: vs.waitAt,
    trigger: vs.trigger
  };
}
var Lh = { class: "ember-clothing-list" }, Oh = ["data-clothing-slot"], jh = /* @__PURE__ */ Be({
  __name: "ClothingList",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), T("dl", Lh, [($(!0), T(ae, null, Se(g(Ir), (a, n) => ($(), T(ae, { key: n }, [e.clothing[n] !== void 0 ? ($(), T(ae, { key: 0 }, [R("dt", null, P(a), 1), R("dd", {
      "data-clothing-slot": n,
      class: xt({ "is-absent": !e.clothing[n] })
    }, P(e.clothing[n] || g(nn).absent), 11, Oh)], 64)) : Y("", !0)], 64))), 128))]));
  }
}), Ao = /* @__PURE__ */ ot(jh, [["__scopeId", "data-v-2445b8a0"]]), Nh = ["onKeydown"], Uh = ["aria-label", "aria-expanded"], Fh = ["aria-label", "aria-expanded"], Zh = {
  class: "ember-affection-heart",
  viewBox: "2 3 20 19",
  "aria-hidden": "true"
}, qh = ["id"], Dh = ["y", "height"], Bh = ["href"], Wh = ["href", "clip-path"], Hh = ["aria-label", "aria-expanded"], Vh = ["aria-label"], Gh = ["aria-label"], Yh = { class: "ember-meter-total" }, Qh = { key: 0 }, Kh = { class: "ember-meter-total" }, Xh = { class: "ember-meter-breakdown" }, Jh = {
  class: "ember-error-detail",
  role: "status"
}, e1 = ["disabled"], t1 = { key: 3 }, a1 = { role: "status" }, n1 = /* @__PURE__ */ Be({
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
    const t = e, r = Wt(null), a = H(null), n = {
      clothing: nn.title,
      affection: pe.affection,
      context: pe.context
    }, s = G(() => fo(t.campaign, t.person)), i = H(null);
    function l() {
      i.value?.querySelector("button[aria-expanded=true]")?.focus(), a.value = null;
    }
    const c = H(0), o = H("");
    let u = null, h;
    async function d() {
      u?.abort(), u = new AbortController();
      const k = u;
      r.value = null, o.value = "";
      try {
        const z = await xh(t.person, k.signal);
        k.signal.aborted || (r.value = z);
      } catch (z) {
        k.signal.aborted || (o.value = Yt(z));
      }
    }
    he(() => t.person, () => {
      a.value = null, c.value = 0, d();
    }, { immediate: !0 });
    const f = G(() => Pe(t.person) ? t.campaign.relationships[t.person].affection : 0), m = `ember-affection-${xs()}`, x = G(() => 19 * f.value / 100), w = G(() => r.value?.relationship ? Eo(r.value.relationship, f.value).name : ""), y = G(() => r.value ? Th(t.campaign, t.person, t.draft, r.value) : null);
    he(() => [t.person, f.value], ([k, z], [L, b]) => {
      k === L && z === b || (h && clearTimeout(h), c.value = k === L ? z - b : 0, c.value && (h = setTimeout(() => {
        c.value = 0;
      }, 3500)));
    }), _s(() => (l(), !0), () => !!a.value), ea(() => {
      u?.abort(), h && clearTimeout(h);
    });
    const _ = (k) => `${(k / 1e3).toFixed(1)}k`;
    return (k, z) => ($(), T("div", {
      ref_key: "meters",
      ref: i,
      class: "ember-meters",
      onKeydown: Lo(Nt(l, ["stop"]), ["esc"])
    }, [
      R("button", {
        type: "button",
        class: "ember-meter-button ember-clothing-button",
        "aria-label": g(nn).title,
        "aria-expanded": a.value === "clothing",
        onClick: z[0] || (z[0] = (L) => a.value = a.value === "clothing" ? null : "clothing")
      }, [...z[4] || (z[4] = [R("svg", {
        viewBox: "2 2 20 20",
        "aria-hidden": "true"
      }, [R("path", { d: "m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c0 2-1.5 3-4 3S8 6 8 4Z" })], -1)])], 8, Uh),
      g(Pe)(e.person) ? ($(), T("button", {
        key: 0,
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(pe).affection,
        "aria-expanded": a.value === "affection",
        onClick: z[1] || (z[1] = (L) => a.value = a.value === "affection" ? null : "affection")
      }, [($(), T("svg", Zh, [
        R("defs", null, [R("path", {
          id: `${m}-shape`,
          d: "M12 21C10.6 19.8 3 14.7 3 8.5C3 5.9 5.1 4 7.5 4C9.4 4 11 5 12 6.5C13 5 14.6 4 16.5 4C18.9 4 21 5.9 21 8.5C21 14.7 13.4 19.8 12 21Z"
        }, null, 8, qh), R("clipPath", { id: m }, [R("rect", {
          x: "2",
          y: 22 - x.value,
          width: "20",
          height: x.value
        }, null, 8, Dh)])]),
        R("use", {
          href: `#${m}-shape`,
          class: "ember-affection-track"
        }, null, 8, Bh),
        R("use", {
          href: `#${m}-shape`,
          class: "ember-affection-filled",
          "clip-path": `url(#${m})`
        }, null, 8, Wh)
      ])), c.value ? ($(), T("small", {
        key: 0,
        class: xt(["ember-affection-change", { "is-down": c.value < 0 }]),
        role: "status"
      }, P(c.value > 0 ? "+" : "") + P(c.value), 3)) : Y("", !0)], 8, Fh)) : Y("", !0),
      R("button", {
        type: "button",
        class: "ember-meter-button",
        "aria-label": g(pe).context,
        "aria-expanded": a.value === "context",
        onClick: z[2] || (z[2] = (L) => a.value = a.value === "context" ? null : "context")
      }, [R("span", {
        class: xt(["ember-meter-ring", { "is-warning": y.value && y.value.used >= y.value.trigger }]),
        style: ca({ "--meter-fill": `${Math.min(1, (y.value?.used ?? 0) / (y.value?.limit ?? 1)) * 360}deg` })
      }, [...z[5] || (z[5] = [R("span", null, null, -1)])], 6)], 8, Hh),
      a.value ? ($(), T("section", {
        key: 1,
        class: xt(["ember-meter-popover", { "ember-clothing-popover": a.value === "clothing" }]),
        "aria-label": n[a.value]
      }, [
        R("header", null, [R("strong", null, P(n[a.value]), 1), R("button", {
          type: "button",
          "aria-label": g(pe).close,
          onClick: l
        }, "×", 8, Gh)]),
        a.value === "affection" ? ($(), T(ae, { key: 0 }, [R("p", Yh, [Fe(P(f.value) + " ", 1), z[6] || (z[6] = R("small", null, "/ 100", -1))]), o.value ? Y("", !0) : ($(), T("p", Qh, P(w.value || g(pe).loading), 1))], 64)) : a.value === "clothing" ? ($(), yt(Ao, {
          key: 1,
          clothing: s.value
        }, null, 8, ["clothing"])) : y.value ? ($(), T(ae, { key: 2 }, [
          R("p", Kh, P(_(y.value.used)) + " / " + P(_(y.value.limit)), 1),
          R("dl", Xh, [($(!0), T(ae, null, Se(g(pe).contextParts, (L, b) => ($(), T(ae, { key: b }, [R("dt", null, P(L), 1), R("dd", null, P(_(y.value[b])), 1)], 64))), 128))]),
          e.memoryState?.status === "failed" ? ($(), T(ae, { key: 0 }, [R("p", Jh, P(g(Yt)(e.memoryState)), 1), R("button", {
            type: "button",
            disabled: e.blocked,
            onClick: z[3] || (z[3] = (L) => k.$emit("retry-memory"))
          }, P(g(pe).memoryRetry), 9, e1)], 64)) : Y("", !0)
        ], 64)) : o.value ? Y("", !0) : ($(), T("p", t1, P(g(pe).loading), 1)),
        o.value && a.value !== "clothing" ? ($(), T(ae, { key: 4 }, [R("p", a1, P(o.value), 1), R("button", {
          type: "button",
          onClick: d
        }, P(g(pe).retry), 1)], 64)) : Y("", !0)
      ], 10, Vh)) : Y("", !0)
    ], 40, Nh));
  }
}), r1 = /* @__PURE__ */ ot(n1, [["__scopeId", "data-v-38bbe277"]]), s1 = ["aria-label"], o1 = { class: "ember-weapon-layout" }, i1 = { class: "ember-weapon-list" }, l1 = ["name", "value"], c1 = {
  class: "ember-weapon-profile",
  "aria-live": "polite",
  "aria-atomic": "true"
}, d1 = ["src"], u1 = { class: "ember-weapon-skill" }, h1 = /* @__PURE__ */ Be({
  __name: "WeaponSelection",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = ws(e, "modelValue"), r = xs();
    return (a, n) => ($(), T("fieldset", {
      class: "ember-weapon-selector",
      "aria-label": g(ke).chooseWeapon
    }, [R("div", o1, [R("div", i1, [($(!0), T(ae, null, Se(g(Cs), (s) => ($(), T("label", {
      key: s,
      class: xt({ "is-selected": t.value === s })
    }, [
      oa(R("input", {
        "onUpdate:modelValue": n[0] || (n[0] = (i) => t.value = i),
        type: "radio",
        name: g(r),
        value: s
      }, null, 8, l1), [[bs, t.value]]),
      nt(Gt, { name: s }, null, 8, ["name"]),
      R("span", null, P(g(Ht)[s].name), 1)
    ], 2))), 128))]), R("div", c1, [
      ($(), T("img", {
        key: t.value,
        class: "ember-weapon-art",
        src: g(Su)[t.value],
        alt: "",
        decoding: "async",
        width: "640",
        height: "640"
      }, null, 8, d1)),
      R("h3", null, P(g(Ht)[t.value].name), 1),
      R("p", null, P(g(Ht)[t.value].detail), 1),
      R("div", u1, [R("strong", null, P(g(Ht)[t.value].action), 1), R("p", null, P(g(Ht)[t.value].skill), 1)])
    ])])], 8, s1));
  }
}), p1 = /* @__PURE__ */ ot(h1, [["__scopeId", "data-v-0c0d4e2b"]]), f1 = ["src"], m1 = /* @__PURE__ */ Be({
  __name: "WorldFrontispiece",
  setup(e) {
    const t = H(null), r = H(null), a = new ResizeObserver((n) => {
      const { width: s, height: i } = n[0].contentRect;
      r.value = s <= 700 && i > s;
    });
    return fa(() => a.observe(t.value)), ea(() => a.disconnect()), (n, s) => ($(), T("div", {
      ref_key: "root",
      ref: t,
      class: "ember-frontispiece",
      "aria-hidden": "true"
    }, [r.value !== null ? ($(), T("img", {
      key: 0,
      src: r.value ? g(fs).cityMobile : g(fs).city,
      alt: "",
      fetchpriority: "high",
      decoding: "async",
      width: "1376",
      height: "768"
    }, null, 8, f1)) : Y("", !0)], 512));
  }
}), g1 = /* @__PURE__ */ ot(m1, [["__scopeId", "data-v-f5a6e0d9"]]), v1 = ["aria-label"], y1 = {
  key: 0,
  class: "entry-title"
}, w1 = { class: "entry-city" }, b1 = ["aria-label"], x1 = ["disabled"], _1 = ["disabled"], M1 = ["disabled"], k1 = {
  key: 0,
  class: "entry-save"
}, S1 = ["disabled"], R1 = { class: "entry-name" }, E1 = { for: "ember-traveler-name" }, z1 = ["maxlength", "placeholder"], P1 = { class: "entry-identity-details" }, C1 = ["value"], A1 = { class: "entry-age" }, $1 = { for: "ember-traveler-age" }, I1 = {
  disabled: "",
  value: ""
}, T1 = ["value"], L1 = {
  class: "entry-primary",
  type: "submit"
}, O1 = { class: "entry-traveler" }, j1 = {
  key: 0,
  class: "entry-restart"
}, N1 = ["disabled"], U1 = {
  key: 0,
  "aria-hidden": "true"
}, F1 = /* @__PURE__ */ Be({
  __name: "JourneyEntry",
  props: {
    campaign: {},
    ready: { type: Boolean },
    busy: { type: Boolean },
    blocked: { type: Boolean }
  },
  emits: ["start", "continue"],
  setup(e, { expose: t, emit: r }) {
    const a = e, n = r, s = H("title"), i = H(a.campaign?.traveler.name ?? ""), l = H(a.campaign?.traveler.gender ?? null), c = H(a.campaign?.traveler.appearanceAge ?? ""), o = H(a.campaign?.weapon ?? "blade"), u = H(!1), h = H(null), d = H(null), f = G(() => ({
      title: B.title,
      identity: ke.identity,
      weapon: ke.chooseWeapon
    })[s.value]);
    he(s, async () => {
      await $t(), d.value && (d.value.scrollTop = 0), h.value?.focus({ preventScroll: !0 });
    });
    function m() {
      u.value = !1, s.value = "identity";
    }
    function x() {
      i.value.trim() && l.value && c.value && (i.value = i.value.trim(), s.value = "weapon");
    }
    function w() {
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
    return t({ back: () => s.value === "title" ? !1 : (w(), !0) }), (_, k) => ($(), T("section", {
      class: xt(["ember-entry", { "is-title": s.value === "title" }]),
      "aria-label": g(B).title
    }, [
      nt(g1),
      k[9] || (k[9] = R("div", { class: "entry-shade" }, null, -1)),
      s.value === "title" ? ($(), T("div", y1, [
        R("p", w1, P(g(ke).city), 1),
        R("h1", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, P(g(B).title), 513),
        R("nav", { "aria-label": g(B).title }, [e.campaign ? ($(), T("button", {
          key: 0,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: k[0] || (k[0] = (z) => n("continue"))
        }, [Fe(P(g(B).resume), 1), k[6] || (k[6] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, x1)) : ($(), T("button", {
          key: 1,
          class: "entry-primary",
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, [Fe(P(e.ready ? g(ke).begin : g(ke).loading), 1), k[7] || (k[7] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, _1)), e.campaign ? ($(), T("button", {
          key: 2,
          type: "button",
          disabled: !e.ready || e.blocked,
          onClick: m
        }, P(g(ke).newJourney), 9, M1)) : Y("", !0)], 8, b1),
        e.campaign ? ($(), T("p", k1, [R("span", null, P(e.campaign.traveler.name), 1), R("span", null, P(g(oe).scenes[e.campaign.location.scene]), 1)])) : Y("", !0)
      ])) : ($(), T("div", {
        key: 1,
        ref_key: "sheet",
        ref: d,
        class: "entry-sheet"
      }, [
        R("header", null, [R("button", {
          type: "button",
          disabled: e.busy,
          onClick: w
        }, "← " + P(g(ke).back), 9, S1), R("span", null, P(g(B).title), 1)]),
        R("h2", {
          ref_key: "heading",
          ref: h,
          tabindex: "-1"
        }, P(f.value), 513),
        s.value === "identity" ? ($(), T("form", {
          key: 0,
          class: "entry-identity",
          onSubmit: Nt(x, ["prevent"])
        }, [
          R("div", R1, [R("label", E1, P(g(ke).name), 1), oa(R("input", {
            id: "ember-traveler-name",
            "onUpdate:modelValue": k[1] || (k[1] = (z) => i.value = z),
            maxlength: g(24),
            placeholder: g(ke).namePlaceholder,
            required: "",
            autocomplete: "off",
            pattern: ".*\\S.*"
          }, null, 8, z1), [[wr, i.value]])]),
          R("div", P1, [R("fieldset", null, [R("legend", null, P(g(ke).gender), 1), ($(!0), T(ae, null, Se(g(oo), (z) => ($(), T("label", { key: z }, [oa(R("input", {
            "onUpdate:modelValue": k[2] || (k[2] = (L) => l.value = L),
            type: "radio",
            name: "ember-traveler-gender",
            value: z,
            required: ""
          }, null, 8, C1), [[bs, l.value]]), R("span", null, P(g(ke).genders[z]), 1)]))), 128))]), R("div", A1, [R("label", $1, P(g(ke).age), 1), oa(R("select", {
            id: "ember-traveler-age",
            "onUpdate:modelValue": k[3] || (k[3] = (z) => c.value = z),
            required: ""
          }, [R("option", I1, P(g(ke).agePlaceholder), 1), ($(!0), T(ae, null, Se(g(tn), (z, L) => ($(), T("option", {
            key: L,
            value: L
          }, P(z), 9, T1))), 128))], 512), [[Oo, c.value]])])]),
          R("button", L1, [Fe(P(g(ke).next), 1), k[8] || (k[8] = R("span", { "aria-hidden": "true" }, "→", -1))])
        ], 32)) : ($(), T("form", {
          key: 1,
          class: "entry-loadout",
          onSubmit: Nt(y, ["prevent"])
        }, [
          R("p", O1, [R("strong", null, P(i.value), 1), R("span", null, P(l.value ? g(ke).genders[l.value] : "") + " · " + P(c.value ? g(tn)[c.value] : "") + " · " + P(g(ke).identityRole), 1)]),
          nt(p1, {
            modelValue: o.value,
            "onUpdate:modelValue": k[4] || (k[4] = (z) => o.value = z)
          }, null, 8, ["modelValue"]),
          e.campaign ? ($(), T("label", j1, [oa(R("input", {
            "onUpdate:modelValue": k[5] || (k[5] = (z) => u.value = z),
            type: "checkbox",
            required: ""
          }, null, 512), [[$o, u.value]]), R("span", null, P(g(ke).restartWarning), 1)])) : Y("", !0),
          R("button", {
            class: "entry-primary",
            type: "submit",
            disabled: e.blocked
          }, [Fe(P(e.busy ? g(ke).entering : e.campaign ? g(ke).confirmRestart : g(ke).enter), 1), e.busy ? Y("", !0) : ($(), T("span", U1, "→"))], 8, N1)
        ], 32))
      ], 512))
    ], 10, v1));
  }
}), Z1 = /* @__PURE__ */ ot(F1, [["__scopeId", "data-v-5cbd1a94"]]), q1 = [
  "aria-label",
  "title",
  "disabled"
], D1 = ["disabled"], B1 = [
  "maxlength",
  "aria-label",
  "placeholder"
], W1 = ["aria-label", "title"], H1 = [
  "aria-label",
  "title",
  "disabled"
], V1 = /* @__PURE__ */ Be({
  __name: "DialogueComposer",
  props: /* @__PURE__ */ Or({
    blocked: { type: Boolean },
    talking: { type: Boolean },
    canRegenerate: { type: Boolean },
    retrying: { type: Boolean },
    conclusion: {}
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Or([
    "send",
    "cancel",
    "regenerate",
    "continue"
  ], ["update:modelValue"]),
  setup(e, { emit: t }) {
    const r = ws(e, "modelValue"), a = e, n = t, s = H(null), i = H(!1);
    let l = null, c = 0;
    function o() {
      s.value && (s.value.style.height = "44px", s.value.style.height = `${Math.min(132, s.value.scrollHeight + 2)}px`);
    }
    function u() {
      !a.blocked && r.value.trim() && n("send");
    }
    function h(d) {
      No(d, i.value) && (d.preventDefault(), u());
    }
    return he(r, async () => {
      await $t(), o();
    }), he(s, (d, f) => {
      f && l?.unobserve(f), d && (o(), l?.observe(d));
    }, { flush: "post" }), fa(() => {
      o(), l = new ResizeObserver((d) => {
        const f = d[0].contentRect.width;
        f !== c && (c = f, o());
      }), s.value && l.observe(s.value);
    }), ea(() => l?.disconnect()), (d, f) => ($(), T("form", {
      class: "ember-composer",
      onSubmit: Nt(u, ["prevent"])
    }, [
      R("button", {
        class: "ember-regenerate",
        type: "button",
        "aria-label": e.retrying ? g(pe).retrySend : g(pe).regenerate,
        title: e.retrying ? g(pe).retrySend : g(pe).regenerate,
        disabled: e.blocked || !e.canRegenerate,
        onClick: f[0] || (f[0] = (m) => n("regenerate"))
      }, [...f[6] || (f[6] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("path", { d: "M4 10a8 8 0 1 1 1 7M4 4v6h6" })], -1)])], 8, q1),
      e.conclusion ? ($(), T("button", {
        key: 0,
        class: "ember-continue",
        type: "button",
        disabled: e.blocked,
        onClick: f[1] || (f[1] = (m) => n("continue"))
      }, [Fe(P(e.conclusion === "fight" ? g(pe).fight : g(pe).continue), 1), f[7] || (f[7] = R("span", { "aria-hidden": "true" }, "→", -1))], 8, D1)) : oa(($(), T("textarea", {
        key: 1,
        ref_key: "input",
        ref: s,
        "onUpdate:modelValue": f[2] || (f[2] = (m) => r.value = m),
        rows: "1",
        maxlength: g(co).playerTextLimit,
        "aria-label": g(B).input,
        placeholder: g(B).input,
        enterkeyhint: "enter",
        onKeydown: h,
        onCompositionstart: f[3] || (f[3] = (m) => i.value = !0),
        onCompositionend: f[4] || (f[4] = (m) => i.value = !1)
      }, null, 40, B1)), [[wr, r.value]]),
      e.talking ? ($(), T("button", {
        key: 2,
        type: "button",
        "aria-label": g(B).cancel,
        title: g(B).cancel,
        onClick: f[5] || (f[5] = (m) => n("cancel"))
      }, [...f[8] || (f[8] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      })], -1)])], 8, W1)) : e.conclusion ? Y("", !0) : ($(), T("button", {
        key: 3,
        type: "submit",
        "aria-label": g(B).send,
        title: g(B).send,
        disabled: e.blocked || !r.value.trim()
      }, [...f[9] || (f[9] = [R("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [R("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, H1))
    ], 32));
  }
}), G1 = /* @__PURE__ */ ot(V1, [["__scopeId", "data-v-640a5540"]]), Y1 = ["data-phase"], Q1 = {
  role: "status",
  "aria-live": "polite"
}, K1 = ["datetime"], X1 = /* @__PURE__ */ Be({
  __name: "DialogueStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(e) {
    const t = e, r = H(Date.now()), a = H(!0);
    yr(() => {
      a.value = !0;
    }), zn(() => {
      a.value = !1;
    });
    const n = G(() => Math.max(0, Math.floor((r.value - t.startedAt) / 1e3)));
    return he(() => [t.startedAt, a.value], (s, i, l) => {
      if (r.value = Date.now(), !a.value) return;
      const c = setInterval(() => {
        r.value = Date.now();
      }, 1e3);
      l(() => clearInterval(c));
    }, { immediate: !0 }), (s, i) => ($(), T("div", {
      class: "ember-dialogue-status",
      "data-phase": e.phase
    }, [
      i[0] || (i[0] = R("span", {
        class: "ember-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      R("span", Q1, P(g(pe).phases[e.phase]), 1),
      R("time", { datetime: `PT${n.value}S` }, P(g(pe).elapsed(n.value)), 9, K1)
    ], 8, Y1));
  }
}), J1 = /* @__PURE__ */ ot(X1, [["__scopeId", "data-v-55406ff9"]]), ys = "关闭交谈后出发", Ea = {
  briefing: "已接下哨站救援 · 营地外路线已开放",
  receiving: "担架接应已安排",
  clinic: "共同经历已记入手记 · 整理诊棚药材",
  share_secret: "新情报已记入手记",
  follow: (e, t) => t ? `${e}将与你同行 · ${ys}` : `${e}曾答应与你同行`,
  stay: (e) => `${e}留在原处`,
  go: (e, t, r) => r ? `${e}准备前往${t}等候 · ${ys}` : `${e}曾约定前往${t}等候`,
  pass: (e, t) => t ? `${e}已同意放行 · 结束交谈后让路` : `${e}已让路`,
  attack: (e) => e ? "交涉破裂 · 准备迎战" : "交涉以战斗收场",
  finish: (e) => e ? "救援已核对 · 继续后结算" : "哨站救援已完成"
};
function e2(e, t, r) {
  if (!Pe(t)) return !1;
  const a = e.people[t], n = r.action;
  if (!(n === "follow" && a.mode === "follow" || a.mode === "travel" && n === `go:${a.destination}`)) return !1;
  const s = e.conversations[t];
  for (let i = s.length - 1; i >= 0; i--) {
    const l = s[i], c = l.action;
    if (c === "follow" || c === "stay" || c?.startsWith("go:")) return l.id === r.id;
  }
  return !1;
}
function t2(e, t, r) {
  const a = r.action;
  if (r.kind !== "dialogue" || !a) return null;
  const n = e.conversations[t].at(-1)?.id === r.id, s = Js(a), i = e2(e, t, r) || n && (s?.confirm ? On(e) === t : (a === "pass" || a === "attack") && e.pendingParley?.enemy === t), l = Ve(t);
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
      c = Ea.go(l, Pn[a.slice(3)].name, i);
  }
  return {
    action: a,
    phase: i ? "pending" : "applied",
    text: c
  };
}
var a2 = ["data-action", "data-phase"], n2 = {
  viewBox: "0 0 20 20",
  "aria-hidden": "true"
}, r2 = {
  key: 1,
  d: "m4 10 4 4 8-8"
}, s2 = /* @__PURE__ */ Be({
  __name: "DialogueActionFeedback",
  props: {
    campaign: {},
    person: {},
    turn: {}
  },
  setup(e) {
    const t = e, r = G(() => t2(t.campaign, t.person, t.turn));
    return (a, n) => r.value ? ($(), T("p", {
      key: 0,
      class: "ember-action-feedback",
      "data-action": r.value.action,
      "data-phase": r.value.phase
    }, [($(), T("svg", n2, [r.value.phase === "pending" ? ($(), T(ae, { key: 0 }, [n[0] || (n[0] = R("circle", {
      cx: "10",
      cy: "10",
      r: "7"
    }, null, -1)), n[1] || (n[1] = R("path", { d: "M10 5v5l3 2" }, null, -1))], 64)) : ($(), T("path", r2))])), R("span", null, P(r.value.text), 1)], 8, a2)) : Y("", !0);
  }
}), o2 = /* @__PURE__ */ ot(s2, [["__scopeId", "data-v-00613f94"]]), i2 = { class: "ember-clothing-feedback" }, l2 = { key: 0 }, c2 = /* @__PURE__ */ Be({
  __name: "ClothingFeedback",
  props: { clothing: {} },
  setup(e) {
    return (t, r) => ($(), T("details", i2, [R("summary", null, [Fe(P(g(nn).changed), 1), R("span", null, [($(!0), T(ae, null, Se(g(Ir), (a, n) => ($(), T(ae, { key: n }, [e.clothing[n] !== void 0 ? ($(), T("small", l2, P(a), 1)) : Y("", !0)], 64))), 128))])]), nt(Ao, { clothing: e.clothing }, null, 8, ["clothing"])]));
  }
}), d2 = /* @__PURE__ */ ot(c2, [["__scopeId", "data-v-49dedcf2"]]);
function u2(e) {
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
var h2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-arm.webp?v=fd0d609d4ec02768",
  import.meta.url
).href, p2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-blush.webp?v=7c20cdfbade91161",
  import.meta.url
).href, f2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-body.webp?v=10628303fc258e25",
  import.meta.url
).href, m2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-displeased.webp?v=dca7dd9e53465144",
  import.meta.url
).href, g2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-fond.webp?v=67d3773440720ffd",
  import.meta.url
).href, v2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-laugh.webp?v=23632e8af5ecd6c7",
  import.meta.url
).href, y2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-neutral.webp?v=efa30b3d180075d1",
  import.meta.url
).href, w2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-rest.webp?v=1038f79033077860",
  import.meta.url
).href, b2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-sad.webp?v=3095503c26fb6fe0",
  import.meta.url
).href, x2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-smile.webp?v=4faa9e9307c789e3",
  import.meta.url
).href, _2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-surprised.webp?v=d68fa784d11cc78c",
  import.meta.url
).href, M2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/anian-worried.webp?v=5f96e9d15f68340c",
  import.meta.url
).href, k2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-angry.webp?v=aa41b88a99fae75b",
  import.meta.url
).href, S2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-arm.webp?v=cb9679251ce7224b",
  import.meta.url
).href, R2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-body.webp?v=bfce2cac40277f85",
  import.meta.url
).href, E2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-neutral.webp?v=dfc1365cc4c28b6f",
  import.meta.url
).href, z2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-relieved.webp?v=4a6c3eefd6b4c692",
  import.meta.url
).href, P2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-resigned.webp?v=29e36eb6e92de7d3",
  import.meta.url
).href, C2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-suspicious.webp?v=2594ff9f16f4bff1",
  import.meta.url
).href, A2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/bajin-worried.webp?v=56efa314ee4ab0d1",
  import.meta.url
).href, $2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-arm.webp?v=00c4182caaa8fb53",
  import.meta.url
).href, I2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-body.webp?v=4dda7b728d6c24f7",
  import.meta.url
).href, T2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-displeased.webp?v=293ee66a0b98f879",
  import.meta.url
).href, L2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-neutral.webp?v=10c4e5408f754e31",
  import.meta.url
).href, O2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-relieved.webp?v=2092c6bd40af38f4",
  import.meta.url
).href, j2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-smile.webp?v=f1ca0dddcfa6a5b3",
  import.meta.url
).href, N2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-squint.webp?v=658d1224e7a3cec9",
  import.meta.url
).href, U2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/changyounian-worried.webp?v=549cd87fcb1e98df",
  import.meta.url
).href, F2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-arm.webp?v=6e040dbb32c5b933",
  import.meta.url
).href, Z2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-blush.webp?v=78902e5bc2f36032",
  import.meta.url
).href, q2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-body.webp?v=5a474abbab62fd30",
  import.meta.url
).href, D2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-displeased.webp?v=1fc9e1d5fd49e3ee",
  import.meta.url
).href, B2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-fond.webp?v=212331e79516bf7f",
  import.meta.url
).href, W2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-laugh.webp?v=690ccfe560b027a3",
  import.meta.url
).href, H2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-neutral.webp?v=e405a536b974c1de",
  import.meta.url
).href, V2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-sad.webp?v=280e468945cae00d",
  import.meta.url
).href, G2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-serious.webp?v=cd781e4d0b9d84e0",
  import.meta.url
).href, Y2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-smile.webp?v=3ae1327fb15a158e",
  import.meta.url
).href, Q2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-surprised.webp?v=571014006d95898e",
  import.meta.url
).href, K2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-teasing.webp?v=f63fad83062455bb",
  import.meta.url
).href, X2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/kouzi-worried.webp?v=f6ce76fd235cff74",
  import.meta.url
).href, J2 = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-arm.webp?v=e2a8648faac7a5fc",
  import.meta.url
).href, ep = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-blush.webp?v=9786c4821e46d177",
  import.meta.url
).href, tp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-body.webp?v=24dfd70982f3f655",
  import.meta.url
).href, ap = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-fond.webp?v=43cfc9b75373ef9b",
  import.meta.url
).href, np = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-laugh.webp?v=808c976ba4fb39d7",
  import.meta.url
).href, rp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-neutral.webp?v=c33f5f73b9ef37f1",
  import.meta.url
).href, sp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-sad.webp?v=90162790173a9622",
  import.meta.url
).href, op = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-serious.webp?v=81b30a031e26dc72",
  import.meta.url
).href, ip = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-smile.webp?v=b2c788d51fd5dd97",
  import.meta.url
).href, lp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-surprised.webp?v=ed06964e772c492c",
  import.meta.url
).href, cp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-teasing.webp?v=11a4659aea380062",
  import.meta.url
).href, dp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/laobai-worried.webp?v=0e5851551d6ef8f5",
  import.meta.url
).href, up = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-arm.webp?v=018e79f0cc85bff1",
  import.meta.url
).href, hp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-blush.webp?v=4625d9fdbe238ddd",
  import.meta.url
).href, pp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-body.webp?v=7093e7ebb88de83c",
  import.meta.url
).href, fp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-displeased.webp?v=9f20517e0a93803b",
  import.meta.url
).href, mp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-fond.webp?v=3de05c591762e97b",
  import.meta.url
).href, gp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-laugh.webp?v=6c409163ff16d22c",
  import.meta.url
).href, vp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-neutral.webp?v=d0cdf22439878886",
  import.meta.url
).href, yp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-relaxed.webp?v=71c0d8846be23f8e",
  import.meta.url
).href, wp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-sad.webp?v=139cb08d4be6a468",
  import.meta.url
).href, bp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-serious.webp?v=6c551dafe840aecb",
  import.meta.url
).href, xp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-smile.webp?v=f96a190fe9ce90f1",
  import.meta.url
).href, _p = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-surprised.webp?v=7cc5f8d225dd9dfd",
  import.meta.url
).href, Mp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-teasing.webp?v=962b1437724b9677",
  import.meta.url
).href, kp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/performance/sanniang-worried.webp?v=bbf275fe2cd2475d",
  import.meta.url
).href, za = {
  width: 420,
  height: 495
}, Q = {
  "anian-arm": {
    src: h2,
    x: 15,
    y: 256,
    width: 171,
    height: 106
  },
  "anian-blush": {
    src: p2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-body": {
    src: f2,
    x: 131,
    y: 148,
    width: 268,
    height: 347
  },
  "anian-displeased": {
    src: m2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-fond": {
    src: g2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-laugh": {
    src: v2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-neutral": {
    src: y2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-rest": {
    src: w2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-sad": {
    src: b2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-smile": {
    src: x2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-surprised": {
    src: _2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "anian-worried": {
    src: M2,
    x: 187,
    y: 24,
    width: 129,
    height: 183
  },
  "bajin-angry": {
    src: k2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-arm": {
    src: S2,
    x: 307,
    y: 294,
    width: 106,
    height: 104
  },
  "bajin-body": {
    src: R2,
    x: 6,
    y: 123,
    width: 408,
    height: 361
  },
  "bajin-neutral": {
    src: E2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-relieved": {
    src: z2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-resigned": {
    src: P2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-suspicious": {
    src: C2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "bajin-worried": {
    src: A2,
    x: 186,
    y: 17,
    width: 95,
    height: 157
  },
  "changyounian-arm": {
    src: $2,
    x: 11,
    y: 314,
    width: 137,
    height: 92
  },
  "changyounian-body": {
    src: I2,
    x: 82,
    y: 134,
    width: 325,
    height: 329
  },
  "changyounian-displeased": {
    src: T2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-neutral": {
    src: L2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-relieved": {
    src: O2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-smile": {
    src: j2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-squint": {
    src: N2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "changyounian-worried": {
    src: U2,
    x: 185,
    y: 16,
    width: 108,
    height: 173
  },
  "kouzi-arm": {
    src: F2,
    x: 301,
    y: 216,
    width: 102,
    height: 124
  },
  "kouzi-blush": {
    src: Z2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-body": {
    src: q2,
    x: 34,
    y: 149,
    width: 307,
    height: 346
  },
  "kouzi-displeased": {
    src: D2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-fond": {
    src: B2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-laugh": {
    src: W2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-neutral": {
    src: H2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-sad": {
    src: V2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-serious": {
    src: G2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-smile": {
    src: Y2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-surprised": {
    src: Q2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-teasing": {
    src: K2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "kouzi-worried": {
    src: X2,
    x: 113,
    y: 26,
    width: 143,
    height: 158
  },
  "laobai-arm": {
    src: J2,
    x: 8,
    y: 301,
    width: 116,
    height: 80
  },
  "laobai-blush": {
    src: ep,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-body": {
    src: tp,
    x: 76,
    y: 122,
    width: 339,
    height: 347
  },
  "laobai-fond": {
    src: ap,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-laugh": {
    src: np,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-neutral": {
    src: rp,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-sad": {
    src: sp,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-serious": {
    src: op,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-smile": {
    src: ip,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-surprised": {
    src: lp,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-teasing": {
    src: cp,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "laobai-worried": {
    src: dp,
    x: 179,
    y: 14,
    width: 109,
    height: 166
  },
  "sanniang-arm": {
    src: up,
    x: 18,
    y: 222,
    width: 140,
    height: 128
  },
  "sanniang-blush": {
    src: hp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-body": {
    src: pp,
    x: 112,
    y: 152,
    width: 308,
    height: 343
  },
  "sanniang-displeased": {
    src: fp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-fond": {
    src: mp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-laugh": {
    src: gp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-neutral": {
    src: vp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-relaxed": {
    src: yp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-sad": {
    src: wp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-serious": {
    src: bp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-smile": {
    src: xp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-surprised": {
    src: _p,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-teasing": {
    src: Mp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  },
  "sanniang-worried": {
    src: kp,
    x: 156,
    y: 3,
    width: 183,
    height: 186
  }
}, Sp = {
  sanniang: {
    body: Q["sanniang-body"],
    arm: Q["sanniang-arm"],
    heads: {
      neutral: Q["sanniang-neutral"],
      smile: Q["sanniang-smile"],
      teasing: Q["sanniang-teasing"],
      blush: Q["sanniang-blush"],
      rest: Q["sanniang-relaxed"],
      serious: Q["sanniang-serious"],
      worried: Q["sanniang-worried"],
      sad: Q["sanniang-sad"],
      displeased: Q["sanniang-displeased"],
      fond: Q["sanniang-fond"],
      laugh: Q["sanniang-laugh"],
      surprised: Q["sanniang-surprised"]
    },
    headOrigin: "58% 34%",
    armOrigin: "34.6% 67%",
    armDirection: 1
  },
  anian: {
    body: Q["anian-body"],
    arm: Q["anian-arm"],
    heads: {
      neutral: Q["anian-neutral"],
      smile: Q["anian-smile"],
      blush: Q["anian-blush"],
      displeased: Q["anian-displeased"],
      fond: Q["anian-fond"],
      laugh: Q["anian-laugh"],
      rest: Q["anian-rest"],
      sad: Q["anian-sad"],
      surprised: Q["anian-surprised"],
      worried: Q["anian-worried"]
    },
    headOrigin: "58.140% 35.108%",
    armOrigin: "40.814% 67.258%",
    armDirection: 1
  },
  kouzi: {
    body: Q["kouzi-body"],
    arm: Q["kouzi-arm"],
    heads: {
      neutral: Q["kouzi-neutral"],
      blush: Q["kouzi-blush"],
      displeased: Q["kouzi-displeased"],
      fond: Q["kouzi-fond"],
      laugh: Q["kouzi-laugh"],
      sad: Q["kouzi-sad"],
      serious: Q["kouzi-serious"],
      smile: Q["kouzi-smile"],
      surprised: Q["kouzi-surprised"],
      teasing: Q["kouzi-teasing"],
      worried: Q["kouzi-worried"]
    },
    headOrigin: "44.500% 34.677%",
    armOrigin: "74.625% 64.687%",
    armDirection: -1
  },
  laobai: {
    body: Q["laobai-body"],
    arm: Q["laobai-arm"],
    heads: {
      neutral: Q["laobai-neutral"],
      smile: Q["laobai-smile"],
      teasing: Q["laobai-teasing"],
      laugh: Q["laobai-laugh"],
      blush: Q["laobai-blush"],
      fond: Q["laobai-fond"],
      serious: Q["laobai-serious"],
      surprised: Q["laobai-surprised"],
      worried: Q["laobai-worried"],
      sad: Q["laobai-sad"]
    },
    headOrigin: "57.065% 33.026%",
    armOrigin: "25.543% 70.203%",
    armDirection: 1
  },
  bajin: {
    body: Q["bajin-body"],
    arm: Q["bajin-arm"],
    heads: {
      neutral: Q["bajin-neutral"],
      angry: Q["bajin-angry"],
      relieved: Q["bajin-relieved"],
      resigned: Q["bajin-resigned"],
      suspicious: Q["bajin-suspicious"],
      worried: Q["bajin-worried"]
    },
    headOrigin: "55.618% 32.031%",
    armOrigin: "89.888% 63.203%",
    armDirection: -1
  },
  changyounian: {
    body: Q["changyounian-body"],
    arm: Q["changyounian-arm"],
    heads: {
      neutral: Q["changyounian-neutral"],
      displeased: Q["changyounian-displeased"],
      relieved: Q["changyounian-relieved"],
      smile: Q["changyounian-smile"],
      squint: Q["changyounian-squint"],
      worried: Q["changyounian-worried"]
    },
    headOrigin: "56.559% 32.847%",
    armOrigin: "30.000% 70.620%",
    armDirection: 1
  }
};
function Jn(e, t = "0% 0%") {
  const [r, a] = t.split(" ").map(parseFloat);
  return {
    left: `${e.x / za.width * 100}%`,
    top: `${e.y / za.height * 100}%`,
    width: `${e.width / za.width * 100}%`,
    height: `${e.height / za.height * 100}%`,
    transformOrigin: `${(r / 100 * za.width - e.x) / e.width * 100}% ${(a / 100 * za.height - e.y) / e.height * 100}%`
  };
}
var Rp = {
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
function Ep(e, t, r) {
  if (e === "none") return null;
  const a = Rp[e], n = a.joint === "arm" ? a.angles.map((s) => `rotate(${s * r}deg)`) : a.frames;
  return t[a.joint].animate(n.map((s) => ({ transform: s })), {
    duration: a.duration,
    easing: "ease-in-out",
    iterations: 1
  });
}
var zp = [
  "src",
  "width",
  "height"
], Pp = [
  "src",
  "width",
  "height"
], Cp = [
  "src",
  "width",
  "height"
], Ap = /* @__PURE__ */ Be({
  __name: "DialogueActor",
  props: {
    person: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = H(null), a = H(null), n = H(null), s = G(() => Sp[t.person]), i = G(() => s.value.heads[t.performance?.expression ?? "neutral"]), l = H(!1), c = H(0);
    let o = 0, u = !1, h = !1, d = null, f, m;
    function x() {
      h = !0, d?.cancel(), d = null;
    }
    function w() {
      if (!(!t.animate || h || l.value || o < 3 || !u)) {
        if (document.hidden || m?.matches) {
          x();
          return;
        }
        a.value && n.value && (h = !0, d = Ep(t.performance?.gesture ?? "none", {
          head: a.value,
          arm: n.value
        }, s.value.armDirection));
      }
    }
    function y() {
      o++, w();
    }
    function _() {
      l.value = !0, x();
    }
    function k() {
      o = 0, l.value = !1, c.value++;
    }
    function z() {
      document.hidden && x();
    }
    function L() {
      m?.matches && x();
    }
    return he(() => t.animate, (b) => {
      b ? w() : x();
    }), fa(() => {
      m = matchMedia("(prefers-reduced-motion: reduce)"), (document.hidden || m.matches) && x(), m.addEventListener("change", L), document.addEventListener("visibilitychange", z), f = new IntersectionObserver((b) => {
        u = b[0].isIntersecting && b[0].intersectionRatio >= 0.25, u ? w() : d && x();
      }, { threshold: 0.25 }), r.value && f.observe(r.value);
    }), zn(x), ea(() => {
      x(), f?.disconnect(), m?.removeEventListener("change", L), document.removeEventListener("visibilitychange", z);
    }), (b, E) => ($(), T("span", {
      ref_key: "root",
      ref: r,
      class: xt(["ember-dialogue-actor", { "actor-failed": l.value }])
    }, [l.value ? ($(), T("button", {
      key: 1,
      type: "button",
      onClick: k
    }, P(g(pe).reloadArtwork), 1)) : ($(), T(ae, { key: 0 }, [
      ($(), T("img", {
        key: "body-" + c.value,
        src: s.value.body.src,
        style: ca(g(Jn)(s.value.body)),
        alt: "",
        width: s.value.body.width,
        height: s.value.body.height,
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: _
      }, null, 44, zp)),
      ($(), T("img", {
        key: "head-" + c.value,
        ref_key: "head",
        ref: a,
        class: "actor-head",
        src: i.value.src,
        style: ca(g(Jn)(i.value, s.value.headOrigin)),
        alt: "",
        width: i.value.width,
        height: i.value.height,
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: _
      }, null, 44, Pp)),
      ($(), T("img", {
        key: "arm-" + c.value,
        ref_key: "arm",
        ref: n,
        class: "actor-arm",
        src: s.value.arm.src,
        style: ca(g(Jn)(s.value.arm, s.value.armOrigin)),
        alt: "",
        width: s.value.arm.width,
        height: s.value.arm.height,
        decoding: "async",
        loading: "lazy",
        onLoad: y,
        onError: _
      }, null, 44, Cp))
    ], 64))], 2));
  }
}), $p = /* @__PURE__ */ ot(Ap, [["__scopeId", "data-v-e2ecfe59"]]), Ip = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-wenshoutong.webp?v=125e510258d1e978",
  import.meta.url
).href, Tp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-chenhe.webp?v=b9754e363d94b06d",
  import.meta.url
).href, Lp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-qinzhi.webp?v=0fbba17d8e6dc4a5",
  import.meta.url
).href, Op = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-liangyoufang.webp?v=6d6f95d6ef29539d",
  import.meta.url
).href, jp = new URL(
  /* @vite-ignore */
  "../apps/game/expedition/assets/portrait-chengtiesheng.webp?v=f7a5b12ba48194f2",
  import.meta.url
).href, Np = {
  wenshoutong: Ip,
  chenhe: Tp,
  qinzhi: Lp,
  liangyoufang: Op,
  chengtiesheng: jp
}, Up = ["src"], Fp = /* @__PURE__ */ Be({
  __name: "StoryPortrait",
  props: { person: {} },
  setup(e) {
    const t = H(!1), r = H(0);
    function a() {
      t.value = !1, r.value++;
    }
    return (n, s) => ($(), T("span", { class: xt(["ember-story-portrait", { "is-failed": t.value }]) }, [t.value ? ($(), T("button", {
      key: 1,
      type: "button",
      onClick: a
    }, P(g(pe).reloadArtwork), 1)) : ($(), T("img", {
      key: r.value,
      src: g(Np)[e.person],
      alt: "",
      width: "418",
      height: "560",
      loading: "lazy",
      decoding: "async",
      onError: s[0] || (s[0] = (i) => t.value = !0)
    }, null, 40, Up))], 2));
  }
}), Zp = /* @__PURE__ */ ot(Fp, [["__scopeId", "data-v-be9de30b"]]), qp = { class: "ember-npc-bubble" }, Dp = { class: "ember-npc-line" }, Bp = /* @__PURE__ */ Be({
  __name: "DialogueBubble",
  props: {
    person: {},
    reply: {},
    performance: {},
    animate: { type: Boolean }
  },
  setup(e) {
    const t = e, r = G(() => u2(t.reply));
    return (a, n) => ($(), T("div", qp, [g(po)(e.person) ? ($(), yt($p, {
      key: 0,
      person: e.person,
      performance: e.performance,
      animate: e.animate
    }, null, 8, [
      "person",
      "performance",
      "animate"
    ])) : g(Mt)(e.person) ? ($(), yt(Zp, {
      key: 1,
      person: e.person
    }, null, 8, ["person"])) : Y("", !0), R("p", Dp, [($(!0), T(ae, null, Se(r.value, (s, i) => ($(), T("span", {
      key: i,
      class: xt({ "ember-spoken": s.spoken })
    }, P(s.text), 3))), 128))])]));
  }
}), Wp = /* @__PURE__ */ ot(Bp, [["__scopeId", "data-v-3e8dc9c6"]]), Hp = { class: "ember-campaign" }, Vp = { class: "ember-health" }, Gp = [
  "max",
  "value",
  "aria-label"
], Yp = { class: "ember-objective" }, Qp = {
  key: 0,
  class: "ember-boss"
}, Kp = [
  "max",
  "value",
  "aria-label"
], Xp = {
  key: 1,
  class: "ember-alarm",
  role: "status"
}, Jp = {
  key: 2,
  class: "ember-combat-notice",
  role: "status"
}, ef = {
  key: 2,
  class: "ember-transition",
  role: "status"
}, tf = {
  key: 3,
  class: "ember-rest-notice",
  role: "status"
}, af = {
  key: 4,
  class: "ember-rest-notice",
  role: "status"
}, nf = ["aria-label"], rf = ["disabled", "aria-label"], sf = ["disabled", "aria-label"], of = ["disabled", "aria-label"], lf = ["aria-label"], cf = ["aria-label"], df = { class: "ember-error-detail" }, uf = ["disabled"], hf = ["disabled"], pf = {
  key: 7,
  class: "ember-conversation-notice",
  role: "status"
}, ff = { class: "ember-error-detail" }, mf = { key: 0 }, gf = { class: "ember-prose" }, vf = {
  key: 8,
  class: "ember-award-notice",
  role: "status"
}, yf = ["aria-label"], wf = ["aria-label"], bf = {
  key: 0,
  class: "ember-panel-heading"
}, xf = ["aria-label"], _f = ["aria-pressed"], Mf = ["aria-pressed"], kf = ["disabled"], Sf = { class: "ember-prose ember-prologue" }, Rf = { class: "ember-objective-panel" }, Ef = {
  key: 0,
  class: "ember-thread"
}, zf = { class: "ember-journal" }, Pf = { class: "ember-journal" }, Cf = { class: "ember-pack-heading" }, Af = { key: 0 }, $f = { key: 1 }, If = { class: "ember-relics" }, Tf = { key: 0 }, Lf = { key: 1 }, Of = ["disabled", "onClick"], jf = { class: "ember-dialogue-heading" }, Nf = { class: "ember-person-heading" }, Uf = ["disabled"], Ff = ["data-message-key"], Zf = ["data-message-key", "data-fresh-reply"], qf = {
  key: 0,
  class: "ember-dialogue-issue"
}, Df = { key: 1 }, Bf = { class: "ember-prose" }, Wf = {
  key: 2,
  class: "ember-prose"
}, Hf = ["aria-busy"], Vf = {
  key: 0,
  class: "ember-dialogue-issue",
  role: "status"
}, Gf = {
  key: 2,
  class: "ember-dialogue-issue",
  role: "status"
}, Yf = { class: "ember-error-detail" }, Qf = { key: 0 }, Kf = { class: "ember-prose" }, Xf = {
  key: 3,
  class: "ember-history-nav"
}, Jf = { class: "ember-passage-actions" }, e0 = ["disabled"], t0 = ["disabled", "onClick"], a0 = ["disabled"], n0 = ["src"], r0 = { class: "ember-prose" }, s0 = ["src"], o0 = { class: "ember-prose" }, i0 = { key: 0 }, l0 = { key: 1 }, c0 = { class: "ember-prose" }, d0 = ["disabled"], u0 = ["disabled"], h0 = ["disabled"], p0 = { class: "ember-pause-actions" }, f0 = ["aria-pressed"], m0 = { class: "ember-help ember-keyboard-help" }, g0 = { class: "ember-help ember-touch-help" }, v0 = /* @__PURE__ */ Be({
  __name: "ExpeditionRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const t = e, r = bc(t.bridge, t.chatIdentity), a = xc(r), { view: n, notice: s, busy: i, blocked: l, talking: c, outgoing: o, conversationProgress: u, conversationFailure: h } = r, { current: d, dirty: f } = a, m = H(!0), x = H(!1), w = H(!1), y = H(0), _ = H(!1), k = H(!1), z = H(null), L = H(null), b = H(null), E = H("relics"), S = G(() => b.value === "map" ? B.map : b.value === "journal" ? B.journal : b.value === "build" ? B.build : b.value === "person" ? Ve(C.value) : b.value === "passage" ? oe.passages[I.value].title : b.value === "arrival" || b.value === "prologue" ? oe.scenes.camp : b.value === "ending" ? wi.title : d.value?.phase === "reward" ? B.reward : d.value?.phase === "lost" ? B.fallen : B.pause), C = H("sanniang"), I = H("warning"), A = H(null), M = H(null), N = H(null), j = H(""), F = G(() => N.value?.operation && !d.value?.facts.includes(N.value.fact) ? N.value.operation : null), W = G(() => F.value?.setup ?? N.value?.body ?? oe.passages[I.value].body), V = G(() => !F.value && d.value ? (N.value?.ready ? N.value.witnesses ?? [] : []).filter((Z) => ns(d.value, Z)) : []), J = H({}), re = G({
      get: () => J.value[C.value] ?? "",
      set: (Z) => {
        J.value[C.value] = Z;
      }
    }), Ce = H(null), We = H(!1), Te = H(null), Ae = H(null), _e = H(null), dt = G((Z) => {
      const q = d.value?.facts ?? [];
      return Z && Z.size === q.length && q.every((U) => Z.has(U)) ? Z : new Set(q);
    }), kt = G((Z) => {
      const q = d.value ? Pr(d.value).filter((U) => U.kind === "object").map((U) => U.target.id) : [];
      return Z && Z.size === q.length && q.every((U) => Z.has(U)) ? Z : new Set(q);
    }), Ot = G(() => d.value ? {
      definition: Re[d.value.location.scene],
      location: d.value.location,
      facts: dt.value,
      people: d.value.people,
      objects: kt.value,
      completedSegments: d.value.completedSegments,
      engagement: d.value.engagement?.id,
      reading: b.value === "passage"
    } : null), ta = G(() => {
      const Z = d.value?.battle;
      if (d.value?.engagement?.id !== "beacon" || !Z) return "";
      switch (Z.script.signal) {
        case "approach":
          return ut.signalApproach;
        case "lighting":
          return ut.signalCountdown(Math.ceil((Z.objective.target - Z.objective.progress) / X.hz));
        case "lit":
          return ut.signalLit;
        default:
          return "";
      }
    }), Dt = G(() => {
      const Z = d.value && gr[d.value.location.scene];
      return Z ? { "--scene-art": `url("${Z}")` } : void 0;
    }), ye = G(() => d.value?.outfit ?? n.value?.data.equippedOutfit ?? "traveler"), Me = G(() => d.value ? On(d.value) : null), St = G(() => d.value?.pendingParley ? d.value.pendingParley.decision === "attack" ? "fight" : "continue" : Me.value ? "continue" : void 0), sn = G(() => !_.value || !d.value || !!d.value.pendingParley || !!Me.value || m.value || !!b.value || !!s.value || c.value || w.value || t.generationActive || k.value || !!z.value || !["exploration", "battle"].includes(d.value.phase) || !n.value?.ready || n.value.pending || n.value.writeState !== "ready"), it = G(() => d.value?.battle?.enemies.find((Z) => Ie(Z.kind)));
    he(() => [it.value?.kind === "furnacemaster" && it.value.hp > 0 ? it.value.phase : 0, d.value?.battle?.enemies.filter((Z) => Z.kind === "coupler" && Z.hp > 0).length ?? 0], ([Z, q], [U, je]) => {
      Z && (Z === 3 && Z !== U ? Ge(Wn.burning, 5500) : q > je ? Ge(Wn.connected, 5500) : q < je && Ge(Wn.couplerBroken, 3500));
    });
    const Bt = G(() => {
      const Z = d.value?.conversations[C.value] ?? [], q = r.replacingReply.value;
      return q?.person === C.value ? Z.map((U) => U.id === q.turnId ? Xl(U) : U) : Z;
    }), ja = G(() => d.value && !Bt.value.length ? io(d.value, C.value) : null), Rt = G(() => Ce.value?.person === C.value ? {
      ...Ce.value,
      status: We.value ? "sending" : "failed"
    } : o.value?.person === C.value && !o.value.regenerating && !Bt.value.some((Z) => Z.id === o.value?.actionId) ? o.value : null), aa = G(() => Rt.value?.status === "failed"), on = G(() => d.value && as(d.value, C.value)), mt = H(null), ga = H(!1);
    let Na;
    function fe() {
      clearTimeout(Na), Na = void 0, ga.value = !1;
    }
    const Ne = H(0), lt = H("");
    let gt;
    function Ge(Z, q = 4e3) {
      clearTimeout(gt), lt.value = Z, gt = setTimeout(() => {
        lt.value = "";
      }, q);
    }
    he(() => d.value?.engagement?.id, (Z, q) => {
      if (Z === q || !d.value) return;
      const U = d.value.facts.includes("return_flow_tested");
      Z === "sluice_bridge" && Ge(U ? Ke.bridgeTested : Ke.bridgeUntried, 6500), Z === "main_valve" && Ge(U ? Ke.valveTested : Ke.valveUntried, 6500);
    }), he(() => [d.value?.id, d.value ? Object.keys(d.value.rewards).length : 0], (Z, q) => {
      Z[0] && Z[0] === q[0] && Z[1] > q[1] && Ge(ut.cacheReady);
    });
    const D = G(() => uo.flatMap((Z) => {
      const q = n.value?.data.awards.find((U) => U.key === Z.key && U.runId === d.value?.id);
      return q ? [{
        fact: Z.fact,
        amount: q.amount
      }] : [];
    })), Ua = G(() => D.value.reduce((Z, q) => Z + q.amount, 0)), ne = G(() => d.value ? $s(d.value).filter((Z) => Z.task) : []), Fa = G(() => d.value ? li(d.value) : null), va = G(() => d.value ? mi(d.value) : []), { messages: Za, hasOlder: qa, hasNewer: Da, expanded: Ba, pendingVisible: Et, rememberReading: Wa, resetLatest: zt, older: ya, newer: jt } = _c({
      history: G(() => ja.value ? [ja.value] : Bt.value),
      pending: G(() => !!Rt.value),
      person: C,
      campaignId: G(() => d.value?.id),
      transcript: Te,
      freshReply: mt,
      talking: c
    }), ln = G(() => d.value?.collection.map((Z) => {
      const q = d.value.equipped.includes(Z.id) ? d.value.equipped.filter((U) => U !== Z.id) : [...d.value.equipped, Z.id];
      return {
        ...Z,
        equipped: q,
        issue: lc(d.value, q),
        dormant: d.value.equipped.includes(Z.id) && !qs($r(d.value), Z.id)
      };
    }) ?? []), vt = Oc(() => {
      r.error.value = ie.presentationError.sound, x.value = !1;
    });
    let Ha = !1;
    function wa() {
      if (!b.value && d.value?.phase === "reward") {
        tt({ type: "leave" });
        return;
      }
      (b.value || d.value && ["exploration", "battle"].includes(d.value.phase)) && et();
    }
    async function ba() {
      await tt({ type: "resolve_parley" }) && (b.value = null, await $t(), _e.value?.focus());
    }
    async function Va() {
      Me.value ? await tt({ type: "accept_reply" }) && b.value === "person" && await et() : await ba();
    }
    jr(A, wa), _s(() => _.value ? b.value || d.value?.phase === "reward" ? (wa(), !0) : m.value ? !1 : (na(), !0) : L.value?.back() ?? !1), jr(Ae, () => {
      !i.value && !w.value && !t.generationActive && r.dismissError();
    });
    function na() {
      m.value = !0, a.flush();
    }
    function Un() {
      b.value = null, na();
    }
    async function Ga(Z) {
      k.value || z.value || (b.value = Z, Z === "build" && (E.value = "relics"), await a.flush());
    }
    async function et() {
      if (!k.value && !Me.value) {
        if (d.value?.pendingParley) {
          d.value.pendingParley.decision === "pass" && await ba();
          return;
        }
        !s.value && !t.generationActive && (_.value = !0, b.value = null, m.value = !1, await $t(), _e.value?.focus());
      }
    }
    function cn() {
      _.value = !0, d.value?.pendingParley || Me.value ? (C.value = d.value?.pendingParley?.enemy ?? Me.value, b.value = "person", m.value = !1) : et();
    }
    async function tt(Z) {
      if (k.value || z.value) return !1;
      k.value = !0, Z.type === "interact" && d.value && (z.value = Re[d.value.location.scene].exits.find((U) => U.id === Z.id)?.to ?? null);
      let q = !1;
      try {
        return await a.flush() ? (q = await r.act(Z), q && (a.sync(), Z.type === "relic" && Ge(ut.received(ia[Z.id].name, !!d.value?.equipped.includes(Z.id))), !b.value && !m.value && (await $t(), _e.value?.focus())), q) : !1;
      } finally {
        k.value = !1, q || (z.value = null);
      }
    }
    function Fn(Z) {
      Z === z.value && (z.value = null);
    }
    async function dn(Z) {
      await tt({
        type: d.value ? "restart" : "start",
        ...Z,
        outfit: ye.value
      }) && (_.value = !0, b.value = "prologue");
    }
    function un() {
      m.value = !0, b.value = null, _.value = !1, a.flush();
    }
    async function ee(Z) {
      if (!d.value || k.value || z.value) return;
      fe();
      const q = [...ro(d.value), ...rn(d.value.location.scene, d.value.location.position, new Set(d.value.facts))].find((je) => je.target.id === Z), U = q?.kind === "object" ? q.target : null;
      if (U?.kind === "person" || U?.kind === "enemy" || U?.kind === "resident") {
        await Le(U.kind === "enemy" ? U.enemy : U.person);
        return;
      }
      if (U?.kind === "inspect" && (I.value = U.passage, j.value = Z, N.value = ic(d.value, U.passage), F.value)) {
        b.value = "passage", await a.flush();
        return;
      }
      await tt({
        type: "interact",
        id: Z
      }) && (U?.kind === "inspect" ? b.value = "passage" : U?.kind === "rest" && (ga.value = !0, Na = setTimeout(fe, 3e3)));
    }
    async function se() {
      !F.value || !await tt({
        type: "interact",
        id: j.value
      }) || (await $t(), M.value && (M.value.scrollTop = 0, M.value.focus({ preventScroll: !0 })));
    }
    async function Le(Z) {
      !d.value || k.value || !ns(d.value, Z) || (C.value = Z, b.value = "person", await a.flush() && !d.value.conversations[Z].length && await r.act({
        type: "greet",
        person: Z
      }) && a.sync());
    }
    async function Oe() {
      const Z = C.value, q = re.value.trim();
      if (!(l.value || We.value || !q || St.value)) {
        J.value[Z] = "", Ce.value = {
          person: Z,
          text: q
        }, We.value = !0, zt();
        try {
          if (!await a.flush()) return;
          const U = r.talk(Z, q);
          Ce.value = null, await U && a.sync();
        } finally {
          We.value = !1;
        }
      }
    }
    async function xa() {
      if (!(l.value || We.value || !d.value))
        if (zt(), aa.value && Rt.value) {
          const Z = Rt.value, q = r.talk(Z.person, Z.text);
          Ce.value = null, await q && a.sync();
        } else {
          const Z = as(d.value, C.value);
          Z && await r.talk(C.value, Z.player, Z.id) && a.sync();
        }
    }
    async function _a() {
      await a.recover() && (m.value = !0, y.value++);
    }
    return he(() => t.generationActive, (Z) => {
      Z && na();
    }), he(() => [d.value?.pendingParley, Me.value], ([Z, q]) => {
      (Z || q) && (C.value = Z?.enemy ?? q, b.value = "person");
    }, { immediate: !0 }), he(x, (Z) => {
      vt.enable(Z);
    }), he(d, (Z) => {
      x.value && Z?.battle && vt.tick(Z.battle);
    }), he(() => n.value?.data, (Z, q) => {
      if (!Z?.active || !q?.active || Z.active.id !== q.active.id) {
        Ne.value = 0;
        return;
      }
      Ne.value += Z.awards.filter((ra) => !q.awards.some((sa) => sa.key === ra.key)).reduce((ra, sa) => ra + sa.amount, 0);
      const U = new Set(q.active.facts), je = new Set(Z.active.facts);
      !U.has("chapter_completed") && je.has("chapter_completed") && Z.active.chapter === "outpost" ? b.value = "ending" : !U.has("captives_arrived") && je.has("captives_arrived") && (b.value = "arrival");
    }), he(() => d.value?.id, () => {
      J.value = {}, Ce.value = null;
    }), he([
      _,
      m,
      b,
      s,
      () => d.value?.id,
      () => d.value?.location.scene
    ], fe), he([b, C], () => {
      mt.value = null;
    }), he(s, (Z) => {
      Z && (mt.value = null);
    }), he(() => [C.value, Bt.value], ([Z, q], [U, je]) => {
      const ra = q.filter((sa) => sa.kind === "dialogue").at(-1);
      Z === U && b.value === "person" && ra && !je.some((sa) => sa.id === ra.id) && (mt.value = ra.id);
    }), fa(async () => {
      await r.read(), Ha = !0;
    }), yr(() => {
      Ha && !f.value && r.read();
    }), zn(() => {
      mt.value = null, fe(), na();
    }), ea(() => {
      clearTimeout(gt), fe(), a.dispose(), r.dispose(), vt.dispose();
    }), (Z, q) => ($(), T("section", Hp, [
      _.value ? Y("", !0) : ($(), yt(Z1, {
        key: 0,
        ref_key: "entry",
        ref: L,
        campaign: g(d),
        ready: !!g(n)?.ready,
        busy: g(i),
        blocked: g(l) || e.generationActive,
        onStart: dn,
        onContinue: cn
      }, null, 8, [
        "campaign",
        "ready",
        "busy",
        "blocked"
      ])),
      _.value && g(d) && Ot.value ? ($(), yt(tu, {
        key: y.value,
        ref_key: "field",
        ref: _e,
        world: Ot.value,
        traveler: g(d).traveler,
        paused: sn.value,
        transitioning: !!z.value,
        weapon: g(d).weapon,
        outfit: ye.value,
        battle: g(d).battle,
        onInput: g(a).input,
        onInteract: ee,
        onPause: na,
        onResume: et,
        onError: q[0] || (q[0] = (U) => w.value = !0),
        onReady: Fn
      }, {
        status: Zn(() => [g(d) ? ($(), T(ae, { key: 0 }, [R("div", Vp, [R("meter", {
          min: 0,
          max: g(X).maxHp,
          value: g(d).hp,
          "aria-label": g(ie).hp
        }, null, 8, Gp), R("span", null, P(Math.ceil(g(d).hp)) + " / " + P(g(X).maxHp), 1)]), R("p", Yp, P(g(nr)(g(d))), 1)], 64)) : Y("", !0)]),
        threat: Zn(() => [
          _.value && it.value && !b.value ? ($(), T("div", Qp, [R("strong", null, P(g(rr)[it.value.kind]), 1), R("meter", {
            min: "0",
            max: it.value.maxHp,
            value: it.value.hp,
            "aria-label": g(rr)[it.value.kind]
          }, null, 8, Kp)])) : Y("", !0),
          _.value && ta.value && !b.value ? ($(), T("div", Xp, P(ta.value), 1)) : Y("", !0),
          _.value && lt.value && g(d)?.phase === "battle" && !b.value && !m.value && !g(s) ? ($(), T("p", Jp, P(lt.value), 1)) : Y("", !0)
        ]),
        overlay: Zn(() => [...q[23] || (q[23] = [R("span", null, null, -1)])]),
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
      _.value && z.value && !g(s) && !w.value && !b.value && !m.value ? ($(), T("aside", ef, P(g(oe).transition(g(oe).scenes[z.value])), 1)) : Y("", !0),
      _.value && ga.value && !b.value && !m.value && !g(s) ? ($(), T("p", tf, P(g(oe).rested), 1)) : _.value && lt.value && g(d)?.phase === "exploration" && !b.value && !m.value && !g(s) ? ($(), T("p", af, P(lt.value), 1)) : Y("", !0),
      _.value && g(d) && b.value !== "passage" && !g(d).pendingParley && !Me.value ? ($(), T("nav", {
        key: 5,
        class: "ember-tools",
        "aria-label": g(B).prepare
      }, [
        R("button", {
          type: "button",
          disabled: k.value || !!z.value,
          "aria-label": g(B).map,
          onClick: q[1] || (q[1] = (U) => Ga("map"))
        }, [nt(Gt, { name: "map" }), R("span", null, P(g(B).map), 1)], 8, rf),
        R("button", {
          type: "button",
          disabled: k.value || !!z.value,
          "aria-label": g(B).build,
          onClick: q[2] || (q[2] = (U) => Ga("build"))
        }, [nt(Gt, { name: "bag" }), R("span", null, P(g(B).build), 1)], 8, sf),
        R("button", {
          type: "button",
          disabled: k.value || !!z.value,
          "aria-label": g(B).journal,
          onClick: q[3] || (q[3] = (U) => Ga("journal"))
        }, [nt(Gt, { name: "journal" }), R("span", null, P(g(B).journal), 1)], 8, of),
        R("button", {
          type: "button",
          "aria-label": g(B).pause,
          onClick: Un
        }, [nt(Gt, { name: "pause" }), R("span", null, P(g(B).pause), 1)], 8, lf)
      ], 8, nf)) : Y("", !0),
      g(s) || w.value || e.generationActive ? ($(), T("section", {
        key: 6,
        ref_key: "noticePanel",
        ref: Ae,
        class: "ember-notice",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": g(B).noticeTitle,
        tabindex: "-1"
      }, [R("p", df, P(w.value ? g(B).renderError : e.generationActive ? g(B).generation : g(s)), 1), w.value ? ($(), T("button", {
        key: 0,
        type: "button",
        onClick: q[4] || (q[4] = (U) => {
          w.value = !1, y.value++;
        })
      }, P(g(B).reload), 1)) : g(r).dataInvalid.value && !e.generationActive ? ($(), T(ae, { key: 1 }, [R("p", null, P(g(B).rebuildWarning), 1), R("button", {
        type: "button",
        disabled: g(i),
        onClick: q[5] || (q[5] = (...U) => g(r).rebuild && g(r).rebuild(...U))
      }, P(g(B).rebuild), 9, uf)], 64)) : e.generationActive ? Y("", !0) : ($(), T("button", {
        key: 2,
        type: "button",
        disabled: g(i),
        onClick: q[6] || (q[6] = (U) => g(r).recoveryRequired.value ? _a() : g(r).dismissError())
      }, P(g(r).recoveryRequired.value ? g(B).recover : g(B).acknowledge), 9, hf))], 8, cf)) : Y("", !0),
      g(h) && !g(s) && (b.value !== "person" || C.value !== g(h).person) ? ($(), T("aside", pf, [
        R("strong", null, P(g(Ve)(g(h).person)), 1),
        R("p", ff, P(g(Yt)(g(h))), 1),
        g(h).text ? ($(), T("details", mf, [R("summary", null, P(g(B).receivedReply), 1), R("p", gf, P(g(h).text), 1)])) : Y("", !0),
        R("button", {
          type: "button",
          onClick: q[7] || (q[7] = (...U) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...U))
        }, P(g(B).acknowledge), 1)
      ])) : Y("", !0),
      _.value && Ne.value && !b.value && !m.value && !g(s) ? ($(), T("aside", vf, [R("span", null, [R("small", null, P(g(B).rewardTitle), 1), R("strong", null, P(g(B).rewardReceived(Ne.value)), 1)]), R("button", {
        type: "button",
        "aria-label": g(B).rewardDismiss,
        onClick: q[8] || (q[8] = (U) => Ne.value = 0)
      }, "×", 8, yf)])) : Y("", !0),
      _.value && g(d) && !g(s) && !w.value && !e.generationActive && (b.value || m.value || g(d).phase === "reward" || g(d).phase === "lost") ? ($(), T("div", {
        key: 9,
        class: "ember-curtain",
        style: ca(b.value === "person" ? Dt.value : void 0)
      }, [R("section", {
        ref_key: "dialog",
        ref: A,
        class: xt(["ember-panel", {
          "ember-wide": b.value === "map" || b.value === "build" && E.value === "wardrobe",
          "ember-map-panel": b.value === "map",
          "ember-wardrobe-panel": b.value === "build" && E.value === "wardrobe",
          "ember-dialogue": b.value === "person",
          "ember-passage": b.value === "passage"
        }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": S.value,
        tabindex: "-1"
      }, [b.value !== "map" && b.value !== "person" ? ($(), T("header", bf, [
        R("h2", null, P(S.value), 1),
        b.value === "build" ? ($(), T("nav", {
          key: 0,
          class: "ember-pack-tabs",
          "aria-label": g(B).build
        }, [R("button", {
          type: "button",
          "aria-pressed": E.value === "relics",
          onClick: q[9] || (q[9] = (U) => E.value = "relics")
        }, P(g(ke).equipment), 9, _f), R("button", {
          type: "button",
          "aria-pressed": E.value === "wardrobe",
          onClick: q[10] || (q[10] = (U) => E.value = "wardrobe")
        }, P(g(B).wardrobe), 9, Mf)], 8, xf)) : Y("", !0),
        b.value !== "prologue" && b.value !== "passage" && g(d).pendingParley?.decision !== "attack" && (b.value || g(d).phase !== "lost" && g(d).phase !== "reward") ? ($(), T("button", {
          key: 1,
          type: "button",
          disabled: k.value || !!g(d).pendingParley && g(l),
          onClick: et
        }, P(g(B).close), 9, kf)) : Y("", !0)
      ])) : Y("", !0), b.value === "map" ? ($(), yt(Vu, {
        key: 1,
        campaign: g(d),
        onClose: et
      }, null, 8, ["campaign"])) : b.value === "prologue" ? ($(), T(ae, { key: 2 }, [R("p", Sf, P(g(B).opening), 1), R("button", {
        class: "ember-primary",
        type: "button",
        onClick: et
      }, P(g(B).start), 1)], 64)) : b.value === "journal" ? ($(), T(ae, { key: 3 }, [
        R("p", Rf, P(g(nr)(g(d))), 1),
        ($(!0), T(ae, null, Se(ne.value, (U) => ($(), T("section", {
          key: U.person,
          class: "ember-thread"
        }, [R("h3", null, P(U.name) + " · " + P(U.title), 1), R("p", null, P(U.task), 1)]))), 128)),
        Fa.value ? ($(), T("section", Ef, [R("h3", null, P(Fa.value.title), 1), R("p", null, P(Fa.value.task), 1)])) : Y("", !0),
        ($(!0), T(ae, null, Se(va.value, (U) => ($(), T("section", {
          key: U.person,
          class: "ember-thread"
        }, [R("h3", null, P(U.name) + " · " + P(U.title), 1), R("p", null, P(U.task), 1)]))), 128)),
        R("ol", zf, [($(!0), T(ae, null, Se(g(d).facts, (U) => ($(), T("li", { key: U }, P(g(en)[U]), 1))), 128))]),
        D.value.length ? ($(), T(ae, { key: 1 }, [
          R("h3", null, P(g(B).journeyReward(Ua.value)), 1),
          R("ul", Pf, [($(!0), T(ae, null, Se(D.value, (U) => ($(), T("li", { key: U.fact }, [Fe(P(g(en)[U.fact]) + " ", 1), R("strong", null, P(g(B).rewardReceived(U.amount)), 1)]))), 128))]),
          R("small", null, P(g(B).rewardRule), 1)
        ], 64)) : Y("", !0)
      ], 64)) : b.value === "build" ? ($(), T(ae, { key: 4 }, [E.value === "wardrobe" && g(n) ? ($(), yt(mh, {
        key: 0,
        data: g(n).data,
        traveler: g(d).traveler,
        balance: g(n).balance,
        blocked: g(l),
        weapon: g(d).weapon,
        onCommand: tt
      }, null, 8, [
        "data",
        "traveler",
        "balance",
        "blocked",
        "weapon"
      ])) : ($(), T(ae, { key: 1 }, [
        R("div", Cf, [R("strong", null, P(g(d).traveler.name), 1), R("span", null, [
          Fe(P(g(ke).genders[g(d).traveler.gender]), 1),
          g(d).traveler.appearanceAge ? ($(), T(ae, { key: 0 }, [Fe(" · " + P(g(tn)[g(d).traveler.appearanceAge]), 1)], 64)) : Y("", !0),
          Fe(" · " + P(g(ke).identityRole), 1)
        ])]),
        R("small", null, P(g(B).slots(g(d).equipped.length, g(X).relicSlots)), 1),
        R("p", null, P(g(Ht)[g(d).weapon].name) + " · " + P(g(vi)(g(d).weapon)), 1),
        g(eo)(g(d)) ? Y("", !0) : ($(), T("p", Af, P(g(ut).restBuild), 1)),
        g(d).collection.length ? Y("", !0) : ($(), T("p", $f, P(g(B).emptyBuild), 1)),
        R("div", If, [($(!0), T(ae, null, Se(ln.value, (U) => ($(), T("article", { key: U.id }, [
          nt(Gt, { name: U.id }, null, 8, ["name"]),
          R("h3", null, [Fe(P(g(ia)[U.id].name) + " ", 1), R("small", null, P(g(ie).rank(U.rank)), 1)]),
          R("p", null, P(g(ia)[U.id].detail), 1),
          U.issue === "capacity" ? ($(), T("small", Tf, P(g(B).loadoutIssue.capacity), 1)) : Y("", !0),
          U.dormant ? ($(), T("small", Lf, P(g(ut).dormantRelic), 1)) : Y("", !0),
          R("button", {
            type: "button",
            disabled: g(l) || !!U.issue,
            onClick: (je) => tt({
              type: "loadout",
              equipped: U.equipped
            })
          }, P(g(d).equipped.includes(U.id) ? g(B).takeOff : g(B).putOn), 9, Of)
        ]))), 128))])
      ], 64))], 64)) : b.value === "person" ? ($(), T(ae, { key: 5 }, [
        R("header", jf, [
          R("div", Nf, [R("h2", null, P(g(Ve)(C.value)), 1), R("small", null, P(g(oe).scenes[g(d).location.scene]), 1)]),
          ($(), yt(r1, {
            key: C.value,
            campaign: g(d),
            person: C.value,
            draft: re.value,
            "memory-state": g(n)?.memories?.[C.value],
            blocked: g(l),
            onRetryMemory: q[11] || (q[11] = (U) => g(r).retryMemory(C.value))
          }, null, 8, [
            "campaign",
            "person",
            "draft",
            "memory-state",
            "blocked"
          ])),
          !Me.value && g(d).pendingParley?.decision !== "attack" ? ($(), T("button", {
            key: 0,
            type: "button",
            disabled: !!g(d).pendingParley && g(l),
            onClick: et
          }, P(g(B).close), 9, Uf)) : Y("", !0)
        ]),
        R("div", {
          ref_key: "transcript",
          ref: Te,
          class: "ember-dialogue-scroll",
          role: "log",
          "aria-live": "polite",
          tabindex: "-1",
          onScroll: q[16] || (q[16] = (...U) => g(Wa) && g(Wa)(...U))
        }, [
          g(qa) ? ($(), T("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "older",
            onClick: q[12] || (q[12] = (...U) => g(ya) && g(ya)(...U))
          }, P(g(pe).older), 1)) : Y("", !0),
          ($(!0), T(ae, null, Se(g(Za), (U) => ($(), T(ae, { key: U.key }, [U.side === "player" ? ($(), T("p", {
            key: 0,
            class: "ember-player-line",
            "data-message-key": U.key
          }, [R("small", null, P(g(d).traveler.name), 1), Fe(P(U.turn.player), 1)], 8, Ff)) : ($(), T("div", {
            key: 1,
            class: "ember-npc-turn",
            "data-message-key": U.key,
            "data-fresh-reply": mt.value === U.turn.id
          }, [U.turn.issue === "action_rejected" || U.turn.issue === "clothing_rejected" || U.turn.issue === "reply_invalid" || U.turn.issue === "reply_incomplete" ? ($(), T("p", qf, P(g(pe).issues[U.turn.issue]), 1)) : Y("", !0), U.turn.kind === "receipt" && U.turn.issue === "reply_invalid" ? ($(), T("details", Df, [R("summary", null, P(g(pe).rawReply), 1), R("p", Bf, P(U.turn.reply), 1)])) : U.turn.kind === "receipt" ? ($(), T("p", Wf, P(U.turn.reply), 1)) : ($(), T(ae, { key: 3 }, [
            nt(Wp, {
              person: C.value,
              reply: U.turn.reply,
              performance: U.turn.performance,
              animate: mt.value === U.turn.id
            }, null, 8, [
              "person",
              "reply",
              "performance",
              "animate"
            ]),
            nt(o2, {
              campaign: g(d),
              person: C.value,
              turn: U.turn
            }, null, 8, [
              "campaign",
              "person",
              "turn"
            ]),
            U.turn.clothing ? ($(), yt(d2, {
              key: 0,
              clothing: U.turn.clothing
            }, null, 8, ["clothing"])) : Y("", !0)
          ], 64))], 8, Zf))], 64))), 128)),
          g(Et) && Rt.value ? ($(), T(ae, { key: 1 }, [R("p", {
            class: "ember-player-line",
            "data-message-key": "pending",
            "aria-busy": Rt.value.status === "sending"
          }, [R("small", null, P(g(d).traveler.name), 1), Fe(P(Rt.value.text), 1)], 8, Hf), aa.value ? ($(), T("p", Vf, P(g(pe).sendFailed), 1)) : Y("", !0)], 64)) : Y("", !0),
          !g(Da) && g(h)?.person === C.value && !Bt.value.some((U) => U.id === g(h)?.actionId) ? ($(), T("div", Gf, [
            R("p", Yf, P(g(Yt)(g(h))), 1),
            g(h).text ? ($(), T("details", Qf, [R("summary", null, P(g(B).receivedReply), 1), R("p", Kf, P(g(h).text), 1)])) : Y("", !0),
            R("button", {
              type: "button",
              onClick: q[13] || (q[13] = (...U) => g(r).dismissConversationFailure && g(r).dismissConversationFailure(...U))
            }, P(g(B).acknowledge), 1)
          ])) : Y("", !0),
          g(Ba) ? ($(), T("nav", Xf, [g(Da) ? ($(), T("button", {
            key: 0,
            type: "button",
            class: "ember-history-link",
            "data-history": "newer",
            onClick: q[14] || (q[14] = (...U) => g(jt) && g(jt)(...U))
          }, P(g(pe).newer), 1)) : Y("", !0), R("button", {
            type: "button",
            class: "ember-history-link",
            "data-history": "latest",
            onClick: q[15] || (q[15] = (...U) => g(zt) && g(zt)(...U))
          }, P(g(pe).latest), 1)])) : Y("", !0)
        ], 544),
        g(u)?.person === C.value ? ($(), yt(J1, {
          key: 0,
          phase: g(u).phase,
          "started-at": g(u).startedAt
        }, null, 8, ["phase", "started-at"])) : Y("", !0),
        nt(G1, {
          modelValue: re.value,
          "onUpdate:modelValue": q[17] || (q[17] = (U) => re.value = U),
          blocked: g(l) || We.value || e.generationActive,
          talking: g(c),
          "can-regenerate": !!on.value || aa.value,
          retrying: aa.value,
          conclusion: St.value,
          onSend: Oe,
          onRegenerate: xa,
          onContinue: Va,
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
      ], 64)) : b.value === "passage" ? ($(), T(ae, { key: 6 }, [R("div", {
        ref_key: "passageContent",
        ref: M,
        class: "ember-passage-body",
        tabindex: "0"
      }, [($(!0), T(ae, null, Se(W.value.split(`

`), (U, je) => ($(), T("p", {
        key: je,
        class: "ember-prose"
      }, P(U), 1))), 128))], 512), R("footer", Jf, [
        F.value ? ($(), T("button", {
          key: 0,
          class: "ember-primary",
          type: "button",
          disabled: g(l) || k.value,
          onClick: se
        }, P(F.value.label), 9, e0)) : Y("", !0),
        ($(!0), T(ae, null, Se(V.value, (U) => ($(), T("button", {
          key: U,
          type: "button",
          disabled: g(l) || k.value,
          onClick: (je) => Le(U)
        }, P(g(Ke).talk(g(Ve)(U))), 9, t0))), 128)),
        R("button", {
          type: "button",
          disabled: k.value,
          onClick: et
        }, P(g(Ke).leave), 9, a0)
      ])], 64)) : b.value === "arrival" ? ($(), T(ae, { key: 7 }, [
        R("img", {
          class: "ember-story-art",
          src: g(ms).arrival,
          alt: "",
          decoding: "async"
        }, null, 8, n0),
        R("p", r0, P(g(B).received), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          onClick: et
        }, P(g(B).resume), 1)
      ], 64)) : b.value === "ending" ? ($(), T(ae, { key: 8 }, [
        R("img", {
          class: "ember-story-art",
          src: g(ms).ending,
          alt: "",
          decoding: "async"
        }, null, 8, s0),
        R("h2", null, P(g(B).endingTitle), 1),
        R("p", o0, P(g(B).ending), 1),
        R("p", null, P(g(B).freeTime), 1),
        g(Ns)(g(d)).optionalRoots ? ($(), T("p", i0, P(g(B).optionalRoots), 1)) : Y("", !0),
        Ua.value ? ($(), T("strong", l0, P(g(B).journeyReward(Ua.value)), 1)) : Y("", !0),
        R("small", null, P(g(B).continued), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          onClick: et
        }, P(g(B).remain), 1)
      ], 64)) : g(d).phase === "reward" ? ($(), yt(Lc, {
        key: 9,
        campaign: g(d),
        blocked: g(l),
        onChoose: q[18] || (q[18] = (U, je) => tt({
          type: "relic",
          id: U,
          ...je ? { replace: je } : {}
        })),
        onLeave: q[19] || (q[19] = (U) => tt({ type: "leave" }))
      }, null, 8, ["campaign", "blocked"])) : g(d).phase === "lost" ? ($(), T(ae, { key: 10 }, [
        R("p", c0, P(g(B).fallenDetail), 1),
        R("button", {
          class: "ember-primary",
          type: "button",
          disabled: g(l),
          onClick: q[20] || (q[20] = (U) => tt({ type: "retry" }))
        }, P(g(B).retry), 9, d0),
        R("button", {
          type: "button",
          disabled: g(l),
          onClick: q[21] || (q[21] = (U) => tt({ type: "retreat" }))
        }, P(g(B).retreat), 9, u0)
      ], 64)) : ($(), T(ae, { key: 11 }, [
        R("button", {
          class: "ember-primary",
          type: "button",
          disabled: !!g(s) || e.generationActive,
          onClick: et
        }, P(g(B).resume), 9, h0),
        R("div", p0, [R("button", {
          type: "button",
          "aria-pressed": x.value,
          onClick: q[22] || (q[22] = (U) => x.value = !x.value)
        }, P(g(B).sound), 9, f0)]),
        R("details", null, [
          R("summary", null, P(g(ke).controls), 1),
          R("p", m0, P(g(B).controls), 1),
          R("p", g0, P(g(B).touchControls), 1)
        ]),
        R("button", {
          type: "button",
          onClick: un
        }, P(g(ke).title), 1)
      ], 64))], 10, wf)], 4)) : Y("", !0)
    ]));
  }
}), I0 = v0;
export {
  I0 as default
};
