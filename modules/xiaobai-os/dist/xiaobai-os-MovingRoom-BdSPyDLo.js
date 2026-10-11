/* eslint-disable */
import { D as Me, E as re, I as Ze, M as Ye, N as Be, P as Fe, R as Oe, S as y, T as ne, U as ce, V as h, X as Te, at as we, b as Ne, dt as xe, ft as m, h as te, i as Ve, lt as t, m as je, r as Ue, rt as W, ut as ue, v as J, w as se, x as q, y as s } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { C as Ce, Ft as We, It as Re, Lt as ve, St as Xe, X as Ke, _ as Le, a as Je, d as Qe, et, h as tt, kt as at, n as nt, st as it, vt as ot, w as lt, xt as rt } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { a as st, n as dt, o as ct, t as ut } from "./xiaobai-os-performance-BD3WuJCC.js";
import { t as ft } from "./xiaobai-os-RoundedBoxGeometry-6yGznEQp.js";
import { a as vt, c as he, i as o, n as De, o as pe, r as de, s as pt, t as bt } from "./xiaobai-os-outfit-BedKY6Cl.js";
var Ge = [
  "cat",
  "cup",
  "plant",
  "toast",
  "duck",
  "ufo",
  "potion",
  "star"
];
function mt(e) {
  return {
    remaining: e.items.map((d) => d.id),
    tray: []
  };
}
function me(e) {
  return !e.remaining.length && !e.tray.length ? "won" : e.tray.length >= 7 ? "lost" : "playing";
}
function He(e, d) {
  return (e.items.length - d.remaining.length - d.tray.length) / 3;
}
function $e(e, d) {
  return me(e) === "playing" && e.remaining.includes(d.id) && (!d.above || !e.remaining.includes(d.above));
}
function gt(e, d, a) {
  if (me(d) !== "playing") return {
    ok: !1,
    reason: "finished"
  };
  const n = e.items.find((f) => f.id === a.id);
  if (!n || !d.remaining.includes(n.id)) return {
    ok: !1,
    reason: "missing"
  };
  if (!$e(d, n)) return {
    ok: !1,
    reason: "blocked"
  };
  const i = [...d.tray], r = (f) => e.items.find((g) => g.id === f).kind === n.kind, u = i.reduce((f, g, P) => r(g) ? P : f, -1);
  i.splice(u < 0 ? i.length : u + 1, 0, n.id);
  const l = i.filter(r), p = l.length === 3 ? l : [];
  return {
    ok: !0,
    packed: p,
    state: {
      remaining: d.remaining.filter((f) => f !== n.id),
      tray: i.filter((f) => !p.includes(f))
    }
  };
}
function ht(e) {
  let d = e >>> 0;
  return () => {
    d += 1831565813;
    let a = d;
    return a = Math.imul(a ^ a >>> 15, a | 1), a ^= a + Math.imul(a ^ a >>> 7, a | 61), ((a ^ a >>> 14) >>> 0) / 4294967296;
  };
}
function yt(e, d, a) {
  const n = e.flatMap((i) => Array.from({ length: 3 }, () => i));
  for (let i = n.length - 1; i > 0; i--) {
    const r = Math.floor(a() * (i + 1));
    [n[i], n[r]] = [n[r], n[i]];
  }
  return Array.from({ length: d }, (i, r) => n.filter((u, l) => l % d === r));
}
var ie = [
  [
    -2.35,
    0.7,
    -1.9
  ],
  [
    2.05,
    0.9,
    -1.85
  ],
  [
    2.05,
    0.65,
    1.2
  ],
  [
    -2.1,
    0.4,
    1.3
  ]
], kt = 0.51, sn = {
  lanes: ie.length,
  depth: Ge.length * 3 / ie.length
}, wt = [
  {
    count: 4,
    lanes: 3,
    seed: 9
  },
  {
    count: 5,
    lanes: 3,
    seed: 2
  },
  {
    count: 6,
    lanes: 3,
    seed: 3
  },
  {
    count: 7,
    lanes: 4,
    seed: 56
  },
  {
    count: 7,
    lanes: 4,
    seed: 5
  }
];
function xt(e, d, a, n) {
  const i = e.map((r, u) => r.map((l, p) => `s${u}-${p}`));
  return {
    id: d,
    key: a,
    seed: n,
    items: e.flatMap((r, u) => r.map((l, p) => {
      const [f, g, P] = ie[u];
      return {
        id: i[u][p],
        kind: l,
        above: p ? i[u][p - 1] : null,
        position: [
          f + (p % 2 ? 0.18 : -0.18),
          g + (r.length - p - 1) * kt + 0.32,
          P
        ]
      };
    })),
    stacks: i
  };
}
var be = wt.map((e, d) => xt(yt(Ge.slice(0, e.count), e.lanes, ht(e.seed)), "weekend", `chapter-${d + 1}`, e.seed));
function Mt(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`moving_${e}`), { code: `moving_${e}` });
}
function Ct(e) {
  let d = mt(e.level);
  for (const a of e.moves) {
    const n = gt(e.level, d, {
      type: "pick",
      id: a
    });
    n.ok || Mt("invalid"), d = n.state;
  }
  return d;
}
function ze(e) {
  return e.abandoned ? "abandoned" : me(Ct(e));
}
function $t() {
  return [...crypto.getRandomValues(new Uint32Array(4))].map((e) => e.toString(16).padStart(8, "0")).join("");
}
function _t(e, d) {
  const a = we(null), n = W(!1), i = W(""), r = W(!1), u = we(null);
  let l = !1, p = null;
  const f = J(() => n.value || !!u.value || !a.value?.ready || a.value.writeState !== "ready" || a.value.pending);
  function g(C) {
    l || (a.value = C);
  }
  async function P(C, R) {
    if (l || n.value) return !1;
    n.value = !0, p = null, r.value = !!R && "command" in R && R.command.type === "challenge", i.value = "";
    try {
      const _ = await e.request(`game/moving/${C}`, {
        chatIdentity: d,
        ...R
      }, 35e3), B = p;
      return g(B && B.revision >= _.result.revision ? B : _.result), a.value?.writeState === "ready" && !a.value.pending && (u.value = null), !0;
    } catch (_) {
      if (!l) {
        if (p && g(p), C === "sound") throw _;
        i.value = pt(_);
        const B = _ && typeof _ == "object" && "code" in _ ? String(_.code) : _ instanceof Error ? _.message : "";
        R && "command" in R && (B.startsWith("moving_save_") || B.startsWith("host_request_")) && (u.value = R);
      }
      return !1;
    } finally {
      l || (n.value = !1, r.value = !1);
    }
  }
  const T = e.subscribe((C) => {
    if (l || C.type !== "game/moving/state") return;
    const R = C.payload;
    R.chatIdentity === d && (n.value ? p = R.state : g(R.state));
  });
  async function $() {
    const C = u.value;
    !await P("confirm") || !a.value || a.value.writeState !== "ready" || a.value.pending || C && a.value.revision === C.revision && await P("act", C);
  }
  return {
    view: a,
    busy: n,
    error: i,
    generating: r,
    blocked: f,
    failed: u,
    notice: J(() => i.value || (a.value?.writeState === "conflict" ? o.conflict : a.value?.pending || a.value?.writeState === "unconfirmed" ? o.saveProblem : "")),
    read: () => P("read"),
    recover: $,
    setSoundEnabled: (C) => P("sound", { enabled: C }),
    act: (C) => f.value ? Promise.resolve(!1) : P("act", {
      actionId: $t(),
      revision: a.value.revision,
      command: C
    }),
    dispose() {
      l = !0, T();
    }
  };
}
function St() {
  let e, d = !1, a = !1, n = 0;
  return {
    available: typeof AudioContext < "u",
    async setEnabled(i) {
      const r = ++n;
      return a ? !1 : (d = i, i ? (e ??= new AudioContext(), await e.resume()) : e?.state === "running" && await e.suspend(), r === n && !a);
    },
    play(i) {
      !d || e?.state !== "running" || (i ? [
        523.25,
        659.25,
        783.99
      ] : [392]).forEach((r, u) => {
        const l = e.createOscillator(), p = e.createGain(), f = e.currentTime + u * 0.09;
        l.type = "sine", l.frequency.value = r, p.gain.setValueAtTime(0, f), p.gain.linearRampToValueAtTime(0.065, f + 0.015), p.gain.exponentialRampToValueAtTime(1e-3, f + 0.25), l.connect(p), p.connect(e.destination), l.start(f), l.stop(f + 0.27), l.onended = () => {
          l.disconnect(), p.disconnect();
        };
      });
    },
    async dispose() {
      a = !0, n++, d = !1, e && e.state !== "closed" && await e.close();
    }
  };
}
var qe = {
  cat: "#f8bbbf",
  toast: "#dd9a54",
  ufo: "#70c9b3",
  cup: "#b8a2e5",
  duck: "#ffce5b",
  plant: "#52ad89",
  potion: "#916ce1",
  star: "#ffd36b"
};
function ye(e, d) {
  const a = new Ce(), n = qe[d], i = (r, u, l = 0.1) => {
    for (const p of [-l, l]) e.ball(a, [
      0.025,
      0.038,
      0.02
    ], "#343447", [
      p,
      r,
      u
    ]);
  };
  switch (d) {
    case "cat":
      e.ball(a, [
        0.26,
        0.26,
        0.21
      ], n, [
        0,
        -0.06,
        0
      ]), e.ball(a, [
        0.29,
        0.23,
        0.22
      ], n, [
        0,
        0.15,
        0
      ]);
      for (const r of [-0.19, 0.19])
        e.cylinder(a, 0, 0.12, 0.25, n, [
          r,
          0.37,
          -0.015
        ], 3).rotation.y = Math.PI, e.ball(a, [
          0.065,
          0.035,
          0.03
        ], "#ed90a1", [
          r,
          0.09,
          0.2
        ]);
      i(0.18, 0.212), e.ball(a, [
        0.032,
        0.025,
        0.03
      ], "#d97690", [
        0,
        0.11,
        0.224
      ]), e.ring(a, 0.13, 0.045, n, [
        0.26,
        -0.11,
        -0.03
      ]).rotation.y = 0.5;
      break;
    case "toast":
      e.box(a, [
        0.52,
        0.58,
        0.2
      ], n, [
        0,
        0.04,
        0
      ], 0.1), e.ball(a, [
        0.3,
        0.16,
        0.12
      ], n, [
        0,
        0.28,
        0
      ]), e.box(a, [
        0.4,
        0.43,
        0.025
      ], "#ffe9b9", [
        0,
        0.045,
        0.11
      ], 0.1), e.box(a, [
        0.18,
        0.14,
        0.045
      ], "#ffd467", [
        0,
        0.08,
        0.14
      ], 0.03).rotation.z = 0.15, i(-0.07, 0.145);
      break;
    case "ufo":
      e.ball(a, [
        0.35,
        0.1,
        0.3
      ], n, [
        0,
        -0.04,
        0
      ]), e.ball(a, [
        0.2,
        0.21,
        0.19
      ], "#bbe8ec", [
        0,
        0.09,
        0
      ]), e.ring(a, 0.26, 0.045, "#ede7aa", [
        0,
        -0.04,
        0
      ]).rotation.x = Math.PI / 2;
      for (const r of [-0.18, 0.18]) e.ball(a, [
        0.06,
        0.06,
        0.06
      ], "#f7b2b8", [
        r,
        -0.075,
        0.19
      ]);
      i(0.09, 0.172, 0.07);
      break;
    case "cup":
      e.cylinder(a, 0.235, 0.18, 0.43, n, [
        0,
        0,
        0
      ]), e.cylinder(a, 0.19, 0.19, 0.015, "#715144", [
        0,
        0.22,
        0
      ]), e.ring(a, 0.13, 0.047, n, [
        0.25,
        0.025,
        0
      ]), e.ring(a, 0.213, 0.025, "#e7d9fb", [
        0,
        0.22,
        0
      ]).rotation.x = Math.PI / 2, i(0, 0.208);
      break;
    case "duck":
      e.ball(a, [
        0.27,
        0.19,
        0.26
      ], n, [
        0,
        -0.08,
        0
      ]), e.ball(a, [
        0.18,
        0.18,
        0.17
      ], n, [
        0,
        0.16,
        0.07
      ]), e.ball(a, [
        0.1,
        0.045,
        0.11
      ], "#f59b46", [
        0,
        0.12,
        0.24
      ]);
      for (const r of [-0.22, 0.22]) e.ball(a, [
        0.06,
        0.1,
        0.15
      ], "#f4b742", [
        r,
        -0.045,
        0
      ]);
      i(0.19, 0.218, 0.07);
      break;
    case "plant":
      e.cylinder(a, 0.19, 0.14, 0.25, "#efa08e", [
        0,
        -0.19,
        0
      ]), e.cylinder(a, 0.2, 0.2, 0.06, "#ffc1ac", [
        0,
        -0.07,
        0
      ]), e.cylinder(a, 0.025, 0.025, 0.34, n, [
        0,
        0.1,
        0
      ]);
      for (let r = 0; r < 5; r++) {
        const u = r * 2.4, l = e.ball(a, [
          0.085,
          0.21,
          0.07
        ], n, [
          Math.sin(u) * 0.13,
          0.15 + r * 0.025,
          Math.cos(u) * 0.12
        ]);
        l.rotation.z = Math.sin(u) * 0.7, l.rotation.x = Math.cos(u) * 0.7;
      }
      break;
    case "potion":
      e.ball(a, [
        0.235,
        0.25,
        0.21
      ], n, [
        0,
        -0.04,
        0
      ]), e.cylinder(a, 0.095, 0.11, 0.23, "#c1a1f2", [
        0,
        0.21,
        0
      ]), e.cylinder(a, 0.105, 0.09, 0.1, "#d1a370", [
        0,
        0.35,
        0
      ]), e.box(a, [
        0.2,
        0.17,
        0.025
      ], "#fff0bc", [
        0,
        -0.03,
        0.205
      ], 0.04).rotation.z = 0.15, e.ball(a, [
        0.04,
        0.065,
        0.02
      ], "#fff5ff", [
        -0.11,
        0.05,
        0.19
      ]);
      break;
    case "star":
      e.ball(a, [
        0.2,
        0.2,
        0.115
      ], n, [
        0,
        0,
        0
      ]);
      for (let r = 0; r < 5; r++) {
        const u = r * Math.PI * 2 / 5, l = e.cylinder(a, 0, 0.13, 0.25, n, [
          Math.sin(u) * 0.22,
          Math.cos(u) * 0.22,
          0
        ], 4);
        l.rotation.z = -u;
      }
      i(0.02, 0.11, 0.07);
      break;
  }
  return a;
}
function Et() {
  const e = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  function a(n, i, r, u, l) {
    d.has(i) || d.set(i, r()), e.has(u) || e.set(u, new et({
      color: u,
      roughness: 0.55,
      metalness: 0.02
    }));
    const p = new Ke(d.get(i), e.get(u));
    return p.position.set(...l), p.castShadow = !0, p.receiveShadow = !0, n.add(p), p;
  }
  return {
    group(n, i = [
      0,
      0,
      0
    ]) {
      const r = new Ce();
      return r.position.set(...i), n.add(r), r;
    },
    box(n, i, r, u, l = 0.08) {
      const p = Math.min(l, ...i.map((f) => f / 2));
      return a(n, `b:${i}:${p}`, () => new ft(...i, 2, p), r, u);
    },
    ball(n, i, r, u) {
      const l = a(n, "ball", () => new at(1, 16, 12), r, u);
      return l.scale.set(...i), l;
    },
    cylinder(n, i, r, u, l, p, f = 24) {
      return a(n, `c:${i}:${r}:${u}:${f}`, () => new tt(i, r, u, f), l, p);
    },
    ring(n, i, r, u, l) {
      return a(n, `t:${i}:${r}`, () => new We(i, r, 8, 32), u, l);
    },
    dispose() {
      d.forEach((n) => n.dispose()), e.forEach((n) => n.dispose()), d.clear(), e.clear();
    }
  };
}
var It = {
  weekend: {
    wall: "#e0efe7",
    floor: "#fff0df",
    trim: "#95c9b3",
    seat: "#f2b4bc",
    rug: "#c9e1f3",
    cabinet: "#f4d294"
  },
  witch: {
    wall: "#e9e3fc",
    floor: "#f3efff",
    trim: "#b5a5dc",
    seat: "#b2d2e5",
    rug: "#c7eddf",
    cabinet: "#b8ded8"
  }
};
function At(e) {
  const d = Et(), a = new Ce(), n = It[e.id], i = d.group(a), r = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), l = d.box, p = d.ball;
  l(i, [
    9.6,
    0.5,
    8.8
  ], n.trim, [
    0,
    -0.46,
    0
  ], 0.22), l(i, [
    9.25,
    0.26,
    8.5
  ], n.floor, [
    0,
    -0.13,
    0
  ], 0.16), l(i, [
    9.05,
    4.35,
    0.22
  ], n.wall, [
    0,
    2.08,
    -3.58
  ], 0.08), l(i, [
    0.22,
    4.35,
    6.9
  ], n.wall, [
    -4.42,
    2.08,
    -0.22
  ], 0.08), l(i, [
    9.05,
    0.14,
    0.15
  ], n.trim, [
    0,
    0.13,
    -3.4
  ], 0.03);
  for (let b = -4; b <= 4; b++) l(i, [
    0.014,
    9e-3,
    8.15
  ], "#e5ddd2", [
    b,
    8e-3,
    0.1
  ], 0);
  for (const b of [
    -2,
    0,
    2
  ]) l(i, [
    8.8,
    9e-3,
    0.014
  ], "#e5ddd2", [
    0,
    8e-3,
    b
  ], 0);
  const f = l(i, [
    5.9,
    0.055,
    3.15
  ], n.rug, [
    0,
    0.035,
    1.45
  ], 0.025);
  f.rotation.y = -0.035;
  for (let b = 0; b < 14; b++) l(i, [
    0.055,
    0.025,
    0.18
  ], "#fffdf6", [
    -2.6 + b * 0.4,
    0.05,
    3.08
  ], 0.01);
  if (l(i, [
    2.5,
    1.65,
    0.17
  ], "#fffaf0", [
    0.35,
    3.15,
    -3.38
  ], 0.09), l(i, [
    2.24,
    1.4,
    0.06
  ], e.id === "witch" ? "#b6bde9" : "#b8e2ee", [
    0.35,
    3.15,
    -3.27
  ], 0.05), p(i, [
    0.25,
    0.25,
    0.04
  ], "#fff0ba", [
    0.98,
    3.48,
    -3.2
  ]), e.id === "witch") {
    p(i, [
      0.22,
      0.22,
      0.045
    ], "#b6bde9", [
      1.1,
      3.56,
      -3.15
    ]);
    for (const [b, E] of [
      [-0.25, 3.55],
      [0.15, 2.85],
      [0.85, 2.8]
    ]) {
      const x = ye(d, "star");
      x.position.set(b, E, -3.17), x.scale.setScalar(0.25), i.add(x);
    }
  } else for (const b of [
    -0.3,
    -0.05,
    0.2
  ]) p(i, [
    0.22,
    0.11,
    0.025
  ], "#f8fcff", [
    b,
    3.3,
    -3.21
  ]);
  l(i, [
    0.06,
    1.45,
    0.07
  ], "#fffaf0", [
    0.35,
    3.15,
    -3.15
  ], 0.02);
  for (const b of [-1.12, 1.82]) l(i, [
    0.42,
    1.8,
    0.25
  ], e.id === "witch" ? "#c4b2e7" : "#f4c4bf", [
    b,
    3.15,
    -3.12
  ], 0.1);
  const [g, P, T] = ie[0];
  if (e.id === "weekend") {
    l(i, [
      3,
      0.45,
      1.42
    ], n.seat, [
      g,
      P - 0.3,
      T
    ], 0.18), l(i, [
      3,
      0.85,
      0.32
    ], n.seat, [
      g,
      P + 0.25,
      T - 0.67
    ], 0.15);
    for (const b of [g - 1.35, g + 1.35]) l(i, [
      0.3,
      0.65,
      1.48
    ], n.seat, [
      b,
      P,
      T
    ], 0.14);
    for (const b of [
      g - 0.8,
      g,
      g + 0.8
    ]) l(i, [
      0.73,
      0.18,
      1.05
    ], "#ffd7d9", [
      b,
      P - 0.04,
      T
    ], 0.08);
  } else {
    l(i, [
      3.05,
      0.64,
      1.5
    ], n.seat, [
      g,
      P - 0.35,
      T
    ], 0.1), l(i, [
      3.2,
      0.15,
      1.6
    ], "#fff6e8", [
      g,
      P - 0.04,
      T
    ], 0.06);
    for (const E of [g - 0.9, g + 0.9])
      l(i, [
        0.68,
        0.38,
        0.035
      ], "#8699be", [
        E,
        0.31,
        T + 0.77
      ], 0.06), p(i, [
        0.055,
        0.055,
        0.03
      ], "#f6d38b", [
        E,
        0.52,
        T + 0.8
      ]);
    const b = d.group(i, [
      -3.42,
      0.46,
      0.7
    ]);
    p(b, [
      0.47,
      0.4,
      0.43
    ], "#9c91c5", [
      0,
      0,
      0
    ]), d.ring(b, 0.36, 0.06, "#c0b1e1", [
      0,
      0.26,
      0
    ]).rotation.x = Math.PI / 2, d.cylinder(b, 0.33, 0.33, 0.018, "#a8edcf", [
      0,
      0.26,
      0
    ]);
    for (const E of [-0.48, 0.48]) d.ring(b, 0.1, 0.03, "#dfcfa1", [
      E,
      0.06,
      0
    ]);
    for (const [E, x] of [
      [-0.16, 0.48],
      [0.1, 0.74],
      [0.21, 0.43]
    ]) p(b, [
      0.095,
      0.095,
      0.095
    ], "#c2f5df", [
      E,
      x,
      0
    ]);
  }
  const [$, C, R] = ie[1];
  l(i, [
    2.35,
    C,
    1.45
  ], n.cabinet, [
    $,
    C / 2,
    R
  ], 0.09), l(i, [
    2.48,
    0.13,
    1.56
  ], "#fff7e6", [
    $,
    C,
    R
  ], 0.05);
  for (const b of [0.25, 0.62])
    l(i, [
      2.12,
      0.27,
      0.04
    ], n.trim, [
      $,
      b,
      R + 0.75
    ], 0.03), l(i, [
      0.45,
      0.055,
      0.08
    ], "#fff7e6", [
      $,
      b,
      R + 0.81
    ], 0.02);
  const [_, B, X] = ie[2];
  l(i, [
    1.85,
    B,
    1.45
  ], "#e9be94", [
    _,
    B / 2,
    X
  ], 0.06), l(i, [
    0.2,
    B + 0.016,
    1.48
  ], "#ffe5b7", [
    _,
    B / 2,
    X
  ], 0.01), l(i, [
    0.5,
    0.25,
    0.02
  ], "#fff7e6", [
    _ - 0.45,
    0.35,
    X + 0.74
  ], 0.03);
  const [U, I, Z] = ie[3];
  l(i, [
    2.15,
    0.13,
    1.35
  ], e.id === "witch" ? "#c1d8f0" : "#f5d6ac", [
    U,
    I,
    Z
  ], 0.055);
  for (const b of [U - 0.7, U + 0.7]) l(i, [
    0.11,
    I,
    0.8
  ], n.trim, [
    b,
    I / 2,
    Z
  ], 0.03);
  l(i, [
    1.4,
    0.13,
    0.62
  ], n.trim, [
    3.25,
    3.45,
    -3.02
  ], 0.05);
  const z = d.group(i, [
    2.94,
    3.515,
    -2.96
  ]);
  l(z, [
    0.5,
    0.075,
    0.24
  ], n.seat, [
    0,
    0.04,
    0
  ], 0.025), d.cylinder(z, 0.25, 0.25, 0.16, n.seat, [
    0,
    0.3,
    0
  ]).rotation.x = Math.PI / 2, d.cylinder(z, 0.207, 0.207, 0.018, "#fffaf0", [
    0,
    0.3,
    0.09
  ]).rotation.x = Math.PI / 2, l(z, [
    0.025,
    0.145,
    0.018
  ], "#53646b", [
    0,
    0.36,
    0.11
  ], 8e-3), l(z, [
    0.13,
    0.025,
    0.018
  ], "#53646b", [
    0.05,
    0.3,
    0.11
  ], 8e-3);
  for (const [b, E, x] of [
    [
      3.36,
      0.42,
      n.rug
    ],
    [
      3.53,
      0.54,
      n.trim
    ],
    [
      3.7,
      0.46,
      n.seat
    ]
  ]) {
    const c = d.group(i, [
      b,
      3.515,
      -2.96
    ]);
    l(c, [
      0.14,
      E,
      0.3
    ], x, [
      0,
      E / 2,
      0
    ], 0.012), l(c, [
      0.1,
      0.018,
      0.25
    ], "#fffaf0", [
      0,
      E - 0.025,
      0.012
    ], 3e-3);
    for (const k of [0.07, E - 0.07]) l(c, [
      0.095,
      0.016,
      0.012
    ], "#fffaf0", [
      0,
      k,
      0.151
    ], 3e-3);
  }
  const w = d.group(i, [
    -4.25,
    2.55,
    0.05
  ]);
  w.rotation.y = Math.PI / 2, l(w, [
    1,
    1.1,
    0.09
  ], "#fff7e8", [
    0,
    0,
    0
  ], 0.04), l(w, [
    0.82,
    0.9,
    0.03
  ], "#cddff3", [
    0,
    0,
    0.06
  ], 0.025);
  const A = ye(d, e.id === "witch" ? "potion" : "cat");
  A.scale.setScalar(0.8), A.position.set(0, -0.08, 0.15), w.add(A);
  for (const b of e.items) {
    const E = ye(d, b.kind);
    l(E, [
      0.93,
      0.085,
      0.76
    ], "#fff9e9", [
      0,
      -0.29,
      0
    ], 0.035);
    for (const c of [-0.34, 0.34]) p(E, [
      0.1,
      0.055,
      0.25
    ], "#f4e8d5", [
      c,
      -0.23,
      0
    ]);
    E.position.set(...b.position), E.userData.itemId = b.id, a.add(E), r.set(b.id, E);
    const x = d.group(a, [
      b.position[0],
      b.position[1] - 0.27,
      b.position[2]
    ]);
    d.ring(x, 0.47, 0.023, "#eaba61", [
      0,
      0,
      0
    ]).rotation.x = Math.PI / 2, u.set(b.id, x);
  }
  const F = ct(d, a, [
    -3.05,
    0.52,
    3.55
  ]);
  st(d, F, bt);
  const Y = d.group(F, [
    0,
    -0.03,
    0.37
  ]);
  l(Y, [
    0.47,
    0.35,
    0.33
  ], "#dfb084", [
    0,
    0,
    0
  ], 0.035), l(Y, [
    0.08,
    0.36,
    0.34
  ], "#ffe6b8", [
    0,
    0,
    0
  ], 8e-3), Y.visible = !1;
  const O = d.group(a, [
    3.6,
    0.1,
    3.55
  ]);
  for (let b = 0; b < e.items.length / 3; b++) {
    const E = l(O, [
      0.4,
      0.26,
      0.4
    ], b % 2 ? "#e2b585" : "#efcba2", [
      b % 2 * 0.43 - 0.25,
      Math.floor(b / 2) * 0.28 + 0.14,
      0
    ], 0.03);
    E.visible = !1;
  }
  const Q = d.ring(a, 0.49, 0.03, "#e6ac44", [
    0,
    0.1,
    0
  ]);
  return Q.rotation.x = -Math.PI / 2, Q.visible = !1, Q.castShadow = !1, {
    root: a,
    items: r,
    markers: u,
    mascot: F,
    parcel: Y,
    shipped: O,
    halo: Q,
    dispose: () => d.dispose()
  };
}
var ke = 0.42;
function Pt() {
  return new it(-7, 7, 7, -7, 0.1, 100);
}
function Tt(e, d, a, n) {
  e.position.set(Math.sin(n) * 18, 13.5, Math.cos(n) * 18), e.lookAt(0, 1, 0.1), e.updateMatrixWorld(!0);
  const i = new Je(new ve(-4.8, -0.8, -3.7), new ve(4.8, 4.7, 4.4));
  let r = 0, u = 0;
  for (const f of [i.min.x, i.max.x]) for (const g of [i.min.y, i.max.y]) for (const P of [i.min.z, i.max.z]) {
    const T = new ve(f, g, P).applyMatrix4(e.matrixWorldInverse);
    r = Math.max(r, Math.abs(T.x)), u = Math.max(u, Math.abs(T.y));
  }
  const l = d / a, p = Math.max(u, r / l) * 1.035;
  e.top = p, e.bottom = -p, e.left = -p * l, e.right = -e.left, e.updateProjectionMatrix();
}
function Rt(e, d, a, n) {
  const i = new Xe(), r = Pt(), u = new ot(), l = new Re(), p = new Re(), f = At(d), g = f.mascot.position.clone(), P = dt(f.mascot, g), T = new AbortController();
  let $, C, R, _ = !1, B = !1, X = !0, U = !0, I = 0, Z = 0, z = 0, w = ke;
  const A = 0.86;
  let F = a, Y = null, O = null;
  const Q = matchMedia("(prefers-reduced-motion: reduce)");
  let b;
  const E = new Le("#fff4df", 3.1);
  E.position.set(-3, 10, 7), E.castShadow = !0, E.shadow.mapSize.set(1024, 1024), Object.assign(E.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 0.5,
    far: 30
  }), E.shadow.normalBias = 0.025, E.shadow.bias = -15e-5, i.add(new lt("#f3f8ff", "#b6b2b0", 2.1), E, f.root);
  const x = new Le("#dbeaff", 0.7);
  x.position.set(6, 5, -3), i.add(x);
  function c() {
    for (const M of d.items) {
      const L = f.items.get(M.id);
      L.visible = F.remaining.includes(M.id), L.position.set(...M.position), L.scale.setScalar(A), f.markers.get(M.id).visible = $e(F, M);
    }
    P.rest(f.parcel), f.shipped.children.forEach((M, L) => {
      M.visible = L < He(d, F);
    });
  }
  function k() {
    const M = b;
    b = void 0, c(), M?.done();
  }
  function G() {
    I && (cancelAnimationFrame(I), I = 0);
  }
  function H(M, L) {
    _ || B || (B = !0, G(), k(), n.error(M, L));
  }
  function K() {
    Tt(r, Z, z, w);
  }
  function ee(M) {
    if (I = 0, !(_ || B || !X || !U || document.hidden || Z <= 0 || z <= 0))
      try {
        if (b) {
          const v = Math.min(1, (M - b.started) / b.duration), V = b.action;
          if (V?.type === "pick") {
            const D = d.items.find((le) => le.id === V.id), S = f.items.get(D.id), j = Math.min(1, v * (b.packed ? 4 : 1));
            S.visible = j < 1, S.position.set(...D.position).lerp(g.clone().add(new ve(0, 0.43, 0)), j), S.position.y += Math.sin(j * Math.PI) * 1.4, S.scale.setScalar(A * (1 - j * 0.7)), b.packed && P.carry(v, f.shipped.position.x, f.parcel);
          }
          v >= 1 && k();
        }
        const L = Y ? f.items.get(Y) : void 0;
        f.halo.visible = !!L?.visible, L?.visible && (f.halo.position.copy(L.position), f.halo.position.y -= 0.28), $.getSize(p), (p.x !== Z || p.y !== z) && $.setSize(Z, z, !1), $.render(i, r), b && N();
      } catch (L) {
        H("graphicsFailed", L);
      }
  }
  function N() {
    !I && !_ && !B && X && U && !document.hidden && Z > 0 && z > 0 && (I = requestAnimationFrame(ee));
  }
  function ae() {
    const M = e.getBoundingClientRect();
    if (Z = M.width, z = M.height, Z <= 0 || z <= 0) {
      G();
      return;
    }
    K(), N();
  }
  function ge(M, L) {
    const v = $.domElement.getBoundingClientRect();
    l.set((M - v.left) / v.width * 2 - 1, -(L - v.top) / v.height * 2 + 1), u.setFromCamera(l, r);
    const V = u.intersectObject(f.root, !0);
    for (const D of V) {
      let S = D.object, j = !0;
      for (; S; ) {
        if (!S.visible) {
          j = !1;
          break;
        }
        S = S.parent;
      }
      if (!(!j || D.object === f.halo || [...f.markers.values()].some((le) => D.object.parent === le))) {
        for (S = D.object; S; ) {
          if (S.userData.itemId) return {
            type: "pick",
            id: S.userData.itemId
          };
          S = S.parent;
        }
        return null;
      }
    }
    return null;
  }
  function _e(M, L) {
    const v = ge(M, L);
    if (v?.type === "pick") return v;
    const V = $.domElement.getBoundingClientRect(), D = d.items.flatMap((S) => {
      const j = f.items.get(S.id);
      if (!j.visible) return [];
      const le = j.position.clone().project(r), Ie = V.left + (le.x + 1) * V.width / 2, Ae = V.top + (1 - le.y) * V.height / 2, Pe = Math.hypot(M - Ie, L - Ae);
      return Pe <= 22 ? [{
        id: S.id,
        x: Ie,
        y: Ae,
        distance: Pe
      }] : [];
    }).sort((S, j) => S.distance - j.distance);
    for (const S of D) {
      const j = ge(S.x, S.y);
      if (j?.type === "pick" && j.id === S.id) return j;
    }
    return v;
  }
  function fe(M) {
    r.zoom = Math.max(1, Math.min(1.8, r.zoom * M)), r.updateProjectionMatrix(), N();
  }
  function Se(M) {
    w = Math.max(-0.15, Math.min(1.05, w + M)), K(), N();
  }
  function Ee() {
    _ || (_ = !0, G(), k(), T.abort(), C?.disconnect(), R?.disconnect(), f.dispose(), E.shadow.dispose(), i.clear(), $?.dispose(), $?.forceContextLoss(), $?.domElement.remove());
  }
  try {
    $ = new nt({
      alpha: !0,
      antialias: !0,
      powerPreference: "low-power"
    }), $.setPixelRatio(Math.min(window.devicePixelRatio, 2)), $.setClearColor(new Qe("#e6f1ed"), 0), $.outputColorSpace = rt, $.toneMapping = 7, $.shadowMap.enabled = !0, $.shadowMap.type = 2, $.debug.onShaderError = () => H("graphicsFailed");
    const M = $.domElement;
    M.setAttribute("aria-label", o.sceneLabel), M.setAttribute("role", "img"), M.tabIndex = 0, e.prepend(M);
    const L = { signal: T.signal };
    M.addEventListener("webglcontextlost", (v) => {
      v.preventDefault(), H("contextLost");
    }, L), M.addEventListener("pointerdown", (v) => {
      v.button !== 0 || O || b || (M.setPointerCapture(v.pointerId), O = {
        id: v.pointerId,
        x: v.clientX,
        y: v.clientY,
        yaw: w,
        dragged: !1
      });
    }, L), M.addEventListener("pointermove", (v) => {
      if (!O) {
        if (b || v.pointerType !== "mouse") return;
        const S = _e(v.clientX, v.clientY), j = S?.type === "pick" ? S.id : null;
        M.style.cursor = S ? "pointer" : "grab", Y !== j && (Y = j, N());
        return;
      }
      if (O.id !== v.pointerId) return;
      const V = v.clientX - O.x, D = v.clientY - O.y;
      Math.hypot(V, D) > 7 && (O.dragged = !0), O.dragged && (w = Math.max(-0.15, Math.min(1.05, O.yaw - V / Z * 2.4)), K(), N());
    }, L), M.addEventListener("pointerleave", () => {
      Y && (Y = null, N());
    }, L), M.addEventListener("pointerup", (v) => {
      if (!O || O.id !== v.pointerId) return;
      const V = O.dragged;
      if (O = null, M.hasPointerCapture(v.pointerId) && M.releasePointerCapture(v.pointerId), !V && !b) {
        const D = _e(v.clientX, v.clientY);
        D && n.action(D);
      }
    }, L);
    for (const v of ["pointercancel", "lostpointercapture"]) M.addEventListener(v, () => {
      O = null;
    }, L);
    return M.addEventListener("keydown", (v) => {
      v.key === "ArrowLeft" || v.key === "ArrowRight" ? (v.preventDefault(), Se(v.key === "ArrowLeft" ? -0.14 : 0.14)) : v.key === "Home" ? (v.preventDefault(), w = ke, r.zoom = 1, K(), N()) : v.key === "+" || v.key === "=" ? (v.preventDefault(), fe(1.15)) : v.key === "-" && (v.preventDefault(), fe(1 / 1.15));
    }, L), M.addEventListener("wheel", (v) => {
      v.preventDefault(), fe(v.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, {
      ...L,
      passive: !1
    }), document.addEventListener("visibilitychange", () => {
      document.hidden ? (G(), k(), O = null) : N();
    }, L), Q.addEventListener("change", () => {
      k(), N();
    }, L), C = new ResizeObserver(() => {
      try {
        ae();
      } catch (v) {
        H("graphicsFailed", v);
      }
    }), C.observe(e), R = new IntersectionObserver((v) => {
      U = v[0].isIntersecting, U ? N() : (G(), k());
    }), R.observe(e), c(), ae(), {
      dispose: Ee,
      rotate: Se,
      zoom: fe,
      visibleItems() {
        const v = $.domElement.getBoundingClientRect();
        return d.items.filter((V) => {
          const D = f.items.get(V.id);
          if (!D.visible) return !1;
          const S = D.position.clone().project(r);
          if (Math.abs(S.x) > 1 || Math.abs(S.y) > 1) return !1;
          const j = ge(v.left + (S.x + 1) * v.width / 2, v.top + (1 - S.y) * v.height / 2);
          return j?.type === "pick" && j.id === V.id;
        }).map((V) => V.id);
      },
      resetView() {
        w = ke, r.zoom = 1, K(), N();
      },
      focus(v) {
        Y = v, N();
      },
      active(v) {
        X = v, v ? ae() : (G(), k(), O = null);
      },
      update(v, V, D = !1) {
        return k(), F = v, c(), Q.matches || !X || document.hidden || B || !U || !V ? (N(), Promise.resolve()) : new Promise((S) => {
          b = {
            started: performance.now(),
            duration: D ? ut : 300,
            action: V,
            packed: D,
            done: S
          }, N();
        });
      }
    };
  } catch (M) {
    throw Ee(), M;
  }
}
var Lt = {
  key: 0,
  fill: "currentColor"
}, zt = { key: 1 }, Bt = { key: 2 }, Ft = { key: 3 }, Ot = { key: 4 }, Nt = { key: 5 }, Vt = { key: 6 }, jt = { key: 7 }, Dt = /* @__PURE__ */ Me({
  __name: "ItemIcon",
  props: { kind: {} },
  setup(e) {
    return (d, a) => (h(), y("svg", {
      viewBox: "0 0 48 48",
      "aria-hidden": "true",
      style: xe({ color: t(qe)[e.kind] }),
      class: "moving-item-icon"
    }, [e.kind === "cat" ? (h(), y("g", Lt, [...a[0] || (a[0] = [se('<path d="M11 23 10 6 22 15 29 14 39 6 38 26Z"></path><ellipse cx="24" cy="31" rx="14" ry="12"></ellipse><ellipse cx="24" cy="23" rx="17" ry="13"></ellipse><path d="M38 33q10 5 3 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path><g fill="#354353"><circle cx="18" cy="23" r="1.6"></circle><circle cx="30" cy="23" r="1.6"></circle></g><path d="m22 27 2 2 2-2" fill="#ce778a"></path>', 6)])])) : e.kind === "toast" ? (h(), y("g", zt, [...a[1] || (a[1] = [se('<path d="M9 17C1 2 47 2 39 17v24H9Z" fill="currentColor"></path><path d="M14 19C8 8 40 8 34 19v17H14Z" fill="#ffe9b9"></path><rect x="19" y="18" width="12" height="9" rx="2" fill="#f8ca54" transform="rotate(10 25 22)"></rect><g fill="#354353"><circle cx="19" cy="31" r="1.5"></circle><circle cx="29" cy="31" r="1.5"></circle></g>', 4)])])) : e.kind === "ufo" ? (h(), y("g", Bt, [...a[2] || (a[2] = [se('<ellipse cx="24" cy="29" rx="22" ry="8" fill="currentColor"></ellipse><path d="M12 27v-5a12 12 0 0 1 24 0v5Z" fill="#b0e4e8"></path><path d="M5 28q19 10 38 0" stroke="#eee4a6" stroke-width="3" fill="none"></path><g fill="#354353"><circle cx="20" cy="23" r="1.5"></circle><circle cx="28" cy="23" r="1.5"></circle></g>', 4)])])) : e.kind === "cup" ? (h(), y("g", Ft, [...a[3] || (a[3] = [se('<path d="M33 17h5c11 0 9 16-4 16" fill="none" stroke="currentColor" stroke-width="5"></path><path d="M7 13h29l-3 24q-12 8-23 0Z" fill="currentColor"></path><ellipse cx="21.5" cy="13" rx="14.5" ry="5" fill="#e7d9fb"></ellipse><ellipse cx="21.5" cy="13" rx="10" ry="3" fill="#806254"></ellipse><g fill="#354353"><circle cx="16" cy="27" r="1.5"></circle><circle cx="26" cy="27" r="1.5"></circle></g>', 5)])])) : e.kind === "duck" ? (h(), y("g", Ot, [...a[4] || (a[4] = [se('<ellipse cx="24" cy="32" rx="18" ry="11" fill="currentColor"></ellipse><circle cx="25" cy="17" r="12" fill="currentColor"></circle><ellipse cx="26" cy="23" rx="8" ry="4" fill="#f49c44"></ellipse><g fill="#354353"><circle cx="20" cy="16" r="1.5"></circle><circle cx="30" cy="16" r="1.5"></circle></g><path d="M11 30q3 8 9 4" fill="none" stroke="#eba93b" stroke-width="2"></path>', 5)])])) : e.kind === "plant" ? (h(), y("g", Nt, [...a[5] || (a[5] = [
      s("path", {
        d: "M24 33V10",
        stroke: "currentColor",
        "stroke-width": "3"
      }, null, -1),
      s("path", {
        d: "M23 23C4 22 7 5 23 18 18 1 36 0 27 17 43 4 45 25 26 26Z",
        fill: "currentColor"
      }, null, -1),
      s("path", {
        d: "m12 29 3 15h19l3-15Z",
        fill: "#efa08e"
      }, null, -1),
      s("rect", {
        x: "10",
        y: "27",
        width: "28",
        height: "6",
        rx: "2",
        fill: "#ffc1ac"
      }, null, -1)
    ])])) : e.kind === "potion" ? (h(), y("g", Vt, [...a[6] || (a[6] = [
      s("path", {
        d: "M19 9h10v10c19 14 8 25-5 25S0 33 19 19Z",
        fill: "currentColor"
      }, null, -1),
      s("rect", {
        x: "18",
        y: "4",
        width: "12",
        height: "8",
        rx: "2",
        fill: "#cfa678"
      }, null, -1),
      s("rect", {
        x: "17",
        y: "26",
        width: "15",
        height: "11",
        rx: "3",
        fill: "#fff0bc",
        transform: "rotate(10 24 31)"
      }, null, -1),
      s("path", {
        d: "m15 23-3 6",
        stroke: "#e1c8ff",
        "stroke-width": "3",
        "stroke-linecap": "round"
      }, null, -1)
    ])])) : (h(), y("g", jt, [...a[7] || (a[7] = [s("path", {
      d: "m24 2 7 14 15 3-11 12 2 15-13-7-13 7 2-15L2 19l15-3Z",
      fill: "currentColor",
      stroke: "#eab655",
      "stroke-width": "1",
      "stroke-linejoin": "round"
    }, null, -1), s("g", { fill: "#354353" }, [s("circle", {
      cx: "19",
      cy: "25",
      r: "1.6"
    }), s("circle", {
      cx: "29",
      cy: "25",
      r: "1.6"
    })], -1)])]))], 4));
  }
}), oe = Dt, Gt = [
  "aria-label",
  "data-status",
  "data-tier",
  "data-level",
  "data-run",
  "aria-busy"
], Ht = { class: "moving-heading" }, qt = ["aria-label"], Zt = { class: "moving-room-number" }, Yt = {
  key: 0,
  class: "moving-tier"
}, Ut = ["aria-label"], Wt = { class: "moving-stage" }, Xt = {
  key: 0,
  class: "moving-view-tools"
}, Kt = { class: "moving-rotate" }, Jt = ["aria-label"], Qt = ["aria-label"], ea = ["aria-label"], ta = ["aria-label"], aa = ["aria-label"], na = {
  key: 0,
  class: "moving-gesture-hint"
}, ia = {
  key: 1,
  class: "moving-scene-error",
  role: "alert"
}, oa = {
  key: 2,
  class: "moving-result",
  "aria-live": "polite"
}, la = {
  class: "moving-result-mark",
  "aria-hidden": "true"
}, ra = ["data-next-tier"], sa = { class: "moving-dock" }, da = { class: "moving-dock-label" }, ca = {
  role: "status",
  "aria-live": "polite"
}, ua = ["aria-label"], fa = ["aria-label"], va = {
  key: 1,
  "aria-hidden": "true"
}, pa = { class: "moving-tools" }, ba = ["disabled"], ma = ["disabled"], ga = ["disabled"], ha = ["disabled"], ya = ["disabled", "aria-pressed"], ka = { id: "moving-board-dialog" }, wa = ["aria-label"], xa = { class: "moving-rules" }, Ma = {
  key: 0,
  class: "moving-session-note"
}, Ca = { class: "moving-session-note" }, $a = [
  "data-item-id",
  "disabled",
  "aria-label",
  "onFocus",
  "onClick"
], _a = ["aria-label"], Sa = /* @__PURE__ */ Me({
  __name: "MovingBoard",
  props: {
    active: {},
    board: {},
    disabled: { type: Boolean },
    award: {},
    challenge: {},
    soundEnabled: { type: Boolean },
    setSoundEnabled: { type: Function }
  },
  emits: [
    "pick",
    "undo",
    "restart",
    "abandon",
    "chapters",
    "next",
    "animation"
  ],
  setup(e, { emit: d }) {
    const a = e, n = d, i = J(() => a.active.level), r = J(() => a.active.stage === null), u = J(() => a.active.abandoned ? "abandoned" : me(a.board)), l = J(() => He(i.value, a.board)), p = W(!1), f = W(!1), g = St(), P = J(() => a.soundEnabled && g.available), T = W(o.description), $ = W(""), C = W(null), R = W(null), _ = W(null), B = we([]), X = J(() => Array.from({ length: 7 }, (x, c) => i.value.items.find((k) => k.id === a.board.tray[c]))), U = J(() => i.value.stacks.map((x) => x.map((c) => i.value.items.find((k) => k.id === c)).filter((c) => a.board.remaining.includes(c.id))));
    let I, Z = !1, z = !0, w = 0, A = null;
    Ve(R, () => {
      _.value = null;
    });
    function F(x) {
      p.value = x, n("animation", x);
    }
    function Y() {
      if (I?.dispose(), I = void 0, $.value = "", !!C.value)
        try {
          I = Rt(C.value, i.value, a.board, {
            action: O,
            error: (x, c) => {
              $.value = o[x], F(!1), c && console.error(o[x], c);
            }
          }), I.active(z);
        } catch (x) {
          $.value = o.graphicsFailed, console.error(o.graphicsFailed, x);
        }
    }
    function O(x) {
      if (a.disabled || p.value || $.value || !z) return;
      const c = i.value.items.find((k) => k.id === x.id);
      if (!c || !$e(a.board, c)) {
        T.value = vt.blocked, c?.above && I?.focus(c.above);
        return;
      }
      _.value = null, A = P.value ? g.setEnabled(!0).catch((k) => (T.value = o.soundFailed, console.error(o.soundFailed, k), !1)) : null, n("pick", x.id);
    }
    Te(() => a.active.id, async () => {
      w++, A = null, F(!1), T.value = o.description, await Ye(), Y();
    }), Te(() => a.board, async (x, c) => {
      if (!Z || !c || c === x) return;
      const k = ++w, G = c.remaining.filter((N) => !x.remaining.includes(N)), H = G.length === 1 && x.remaining.length === c.remaining.length - 1, K = H ? i.value.items.find((N) => N.id === G[0]) : void 0, ee = H && c.tray.length + 1 - x.tray.length === 3;
      if (K) {
        if (T.value = ee ? o.packed(de[K.kind]) : o.selected(de[K.kind]), z) {
          const N = A;
          A = null, N ? N.then((ae) => {
            ae && z && k === w && g.play(ee);
          }).catch((ae) => {
            T.value = o.soundFailed, console.error(o.soundFailed, ae);
          }) : g.play(ee);
        }
      } else T.value = o.description;
      F(!0), await I?.update(x, K ? {
        type: "pick",
        id: K.id
      } : void 0, ee), k === w && F(!1);
    });
    async function Q() {
      if (f.value) return;
      f.value = !0;
      const x = !P.value;
      let c = !1;
      try {
        if (x && !await g.setEnabled(!0)) return;
        c = !0, await a.setSoundEnabled(x) ? x ? g.play(!0) : await g.setEnabled(!1) : x && await g.setEnabled(!1);
      } catch (k) {
        x && await g.setEnabled(!1).catch((H) => console.error(o.soundFailed, H));
        const G = c ? o.soundSaveFailed : o.soundFailed;
        T.value = G, console.error(G, k);
      } finally {
        f.value = !1;
      }
    }
    async function b() {
      try {
        await g.setEnabled(!1);
      } catch (x) {
        T.value = o.soundFailed, console.error(o.soundFailed, x);
      }
    }
    function E() {
      B.value = I?.visibleItems() ?? [], _.value = "items";
    }
    return Oe(() => {
      Z = !0, Y();
    }), Be(() => {
      z = !0, I?.active(!0);
    }), Ze(() => {
      z = !1, A = null, _.value = null, I?.active(!1), b();
    }), Fe(() => {
      w++, Z = !1, I?.dispose(), F(!1), g.dispose().catch((x) => console.error(o.soundFailed, x));
    }), (x, c) => (h(), y("section", {
      class: ue(["moving-room", `moving-${i.value.id}`]),
      "aria-label": t(o).name,
      "data-status": u.value,
      "data-tier": e.challenge.activeTier,
      "data-level": i.value.key,
      "data-run": e.active.id,
      "aria-busy": e.disabled || p.value
    }, [
      s("header", Ht, [s("button", {
        type: "button",
        class: "moving-location",
        "aria-label": t(o).backChapters,
        onClick: c[0] || (c[0] = (k) => n("chapters"))
      }, [
        s("span", Zt, m(r.value ? "Ⅱ" : String(e.active.stage + 1).padStart(2, "0")), 1),
        s("span", null, [s("strong", null, [ne(m(t(pe)[i.value.id]), 1), r.value ? (h(), y("span", Yt, m(t(De)[e.challenge.activeTier]), 1)) : q("", !0)]), s("small", null, [r.value ? q("", !0) : (h(), y(te, { key: 0 }, [ne(m(t(o).stage(e.active.stage)) + " · ", 1)], 64)), ne(m(t(o).progress(l.value, i.value.items.length / t(3))), 1)])]),
        c[18] || (c[18] = s("span", { "aria-hidden": "true" }, "⌄", -1))
      ], 8, qt), s("button", {
        type: "button",
        class: "moving-icon-button",
        "aria-label": t(o).rules,
        onClick: c[1] || (c[1] = (k) => _.value = "rules")
      }, "?", 8, Ut)]),
      s("div", Wt, [
        s("div", {
          ref_key: "host",
          ref: C,
          class: "moving-canvas"
        }, null, 512),
        $.value ? q("", !0) : (h(), y("div", Xt, [s("div", Kt, [
          s("button", {
            type: "button",
            "aria-label": t(o).zoomOut,
            onClick: c[2] || (c[2] = (k) => t(I)?.zoom(1 / 1.2))
          }, "−", 8, Jt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateLeft,
            onClick: c[3] || (c[3] = (k) => t(I)?.rotate(-0.18))
          }, "↶", 8, Qt),
          s("button", {
            type: "button",
            "aria-label": t(o).resetView,
            onClick: c[4] || (c[4] = (k) => t(I)?.resetView())
          }, "⌂", 8, ea),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateRight,
            onClick: c[5] || (c[5] = (k) => t(I)?.rotate(0.18))
          }, "↷", 8, ta),
          s("button", {
            type: "button",
            "aria-label": t(o).zoomIn,
            onClick: c[6] || (c[6] = (k) => t(I)?.zoom(1.2))
          }, "+", 8, aa)
        ]), u.value === "playing" ? (h(), y("span", na, m(t(o).rotateHint), 1)) : q("", !0)])),
        $.value ? (h(), y("section", ia, [
          s("p", null, m($.value), 1),
          s("button", {
            type: "button",
            class: "moving-primary",
            onClick: Y
          }, m(t(o).retryGraphics), 1),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: c[7] || (c[7] = (k) => n("chapters"))
          }, m(t(o).backChapters), 1)
        ])) : u.value !== "playing" && !p.value && !e.disabled ? (h(), y("section", oa, [
          s("span", la, m(u.value === "won" ? "✓" : "…"), 1),
          s("h2", null, m(u.value === "won" ? t(o).won : u.value === "lost" ? t(o).lost : t(o).abandoned), 1),
          s("p", null, m(u.value === "won" ? e.award ? t(o).reward(e.award) : t(o).earned : r.value ? t(o).paidLost : t(o).lostBody), 1),
          r.value ? (h(), y("p", {
            key: 0,
            "data-next-tier": e.challenge.tier
          }, m(t(o).nextTier(e.challenge.tier)), 9, ra)) : q("", !0),
          u.value === "won" ? (h(), y("button", {
            key: 1,
            type: "button",
            class: "moving-primary",
            onClick: c[8] || (c[8] = (k) => n("next"))
          }, m(r.value ? t(o).admission : e.active.stage < t(be).length - 1 ? t(o).next : t(o).chapterComplete), 1)) : r.value ? (h(), y("button", {
            key: 3,
            type: "button",
            class: "moving-primary",
            onClick: c[10] || (c[10] = (k) => n("next"))
          }, m(t(o).admission), 1)) : (h(), y("button", {
            key: 2,
            type: "button",
            class: "moving-primary",
            onClick: c[9] || (c[9] = (k) => n("undo"))
          }, m(t(o).undo), 1)),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: c[11] || (c[11] = (k) => n("chapters"))
          }, m(t(o).backChapters), 1)
        ])) : q("", !0)
      ]),
      s("footer", sa, [
        s("div", da, [s("strong", null, [ne(m(t(o).tray) + " ", 1), s("small", null, m(t(o).slots(e.board.tray.length, t(7))), 1)]), s("p", ca, m(T.value), 1)]),
        s("ol", {
          class: ue(["moving-tray", { "is-full": u.value === "lost" }]),
          "aria-label": t(o).tray,
          style: xe({ "--moving-capacity": t(7) })
        }, [(h(!0), y(te, null, ce(X.value, (k, G) => (h(), y("li", {
          key: G,
          "aria-label": t(o).slot(k ? t(de)[k.kind] : t(o).emptySlot, G),
          class: ue({ "is-filled": k })
        }, [k ? (h(), Ne(oe, {
          key: 0,
          kind: k.kind
        }, null, 8, ["kind"])) : (h(), y("span", va, "·"))], 10, fa))), 128))], 14, ua),
        s("div", pa, [
          r.value ? q("", !0) : (h(), y("button", {
            key: 0,
            type: "button",
            disabled: e.disabled || p.value || !e.active.moves.length,
            onClick: c[12] || (c[12] = (k) => n("undo"))
          }, "↩ " + m(t(o).undo), 9, ba)),
          s("button", {
            type: "button",
            disabled: e.disabled || p.value || !!$.value || u.value !== "playing",
            onClick: E
          }, "⌕ " + m(t(o).pickList), 9, ma),
          r.value ? (h(), y("button", {
            key: 2,
            type: "button",
            disabled: e.disabled || p.value || u.value !== "playing",
            onClick: c[14] || (c[14] = (k) => n("abandon"))
          }, m(t(o).abandon), 9, ha)) : (h(), y("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || p.value,
            onClick: c[13] || (c[13] = (k) => n("restart"))
          }, "↻ " + m(t(o).restart), 9, ga)),
          s("button", {
            type: "button",
            disabled: e.disabled || f.value || !t(g).available,
            "aria-pressed": P.value,
            onClick: Q
          }, m(P.value ? t(o).soundOn : t(o).soundOff), 9, ya)
        ])
      ]),
      _.value ? (h(), y("div", {
        key: 0,
        class: "moving-modal-backdrop",
        onClick: c[17] || (c[17] = je((k) => _.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: R,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-board-dialog",
        tabindex: "-1"
      }, [s("header", null, [s("h2", ka, m(_.value === "rules" ? t(o).rules : t(o).pickListTitle), 1), s("button", {
        type: "button",
        "aria-label": t(o).close,
        onClick: c[15] || (c[15] = (k) => _.value = null)
      }, "×", 8, wa)]), _.value === "rules" ? (h(), y(te, { key: 0 }, [
        s("ol", xa, [(h(!0), y(te, null, ce(t(o).instructions, (k) => (h(), y("li", { key: k }, m(k), 1))), 128))]),
        r.value ? (h(), y("p", Ma, m(t(o).admissionBody), 1)) : q("", !0),
        s("p", Ca, m(t(o).sessionNote), 1)
      ], 64)) : (h(), y("div", {
        key: 1,
        class: "moving-stack-overview",
        style: xe({ "--stack-count": U.value.length })
      }, [(h(!0), y(te, null, ce(U.value, (k, G) => (h(), y("section", { key: G }, [s("h3", null, m(t(o).shelf(G)), 1), (h(!0), y(te, null, ce(k, (H, K) => (h(), y(te, { key: H.id }, [K === 0 ? (h(), y("button", {
        key: 0,
        type: "button",
        "data-item-id": H.id,
        disabled: !B.value.includes(H.id),
        "aria-label": t(o).item(t(de)[H.kind], G + 1),
        onFocus: (ee) => t(I)?.focus(H.id),
        onBlur: c[16] || (c[16] = (ee) => t(I)?.focus(null)),
        onClick: (ee) => O({
          type: "pick",
          id: H.id
        })
      }, [re(oe, { kind: H.kind }, null, 8, ["kind"]), s("span", null, m(t(o).available), 1)], 40, $a)) : (h(), y("div", {
        key: 1,
        "aria-label": `${t(de)[H.kind]} · ${t(o).underneath}`
      }, [re(oe, { kind: H.kind }, null, 8, ["kind"])], 8, _a))], 64))), 128))]))), 128))], 4))], 512)])) : q("", !0)
    ], 10, Gt));
  }
}), Ea = Sa, Ia = {
  key: 0,
  class: "moving-account"
}, Aa = { role: "status" }, Pa = {
  key: 1,
  class: "moving-save-notice",
  role: "alert"
}, Ta = ["disabled"], Ra = ["disabled"], La = {
  key: 2,
  class: "moving-loading",
  role: "status"
}, za = ["aria-label"], Ba = { class: "moving-chapter-card chapter-home" }, Fa = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, Oa = { class: "moving-chapter-title" }, Na = { class: "moving-stage-path" }, Va = [
  "data-stage",
  "aria-label",
  "disabled",
  "onClick"
], ja = { class: "moving-chapter-card chapter-witch" }, Da = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, Ga = { class: "moving-chapter-title" }, Ha = ["data-tier"], qa = {
  key: 0,
  class: "moving-session-note"
}, Za = ["disabled"], Ya = {
  key: 1,
  class: "moving-session-note"
}, Ua = { class: "moving-session-note" }, Wa = {
  key: 5,
  class: "moving-generating",
  role: "status"
}, Xa = { id: "moving-confirm-title" }, Ka = ["aria-label"], Ja = ["data-tier"], Qa = { class: "moving-confirm-actions" }, en = ["disabled"], tn = /* @__PURE__ */ Me({
  __name: "MovingRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const d = e, a = _t(d.bridge, d.chatIdentity), { view: n, busy: i, blocked: r, notice: u, generating: l, failed: p } = a, f = W("chapters"), g = W(null), P = W(null), T = W(!1);
    let $ = !1;
    const C = J(() => n.value?.active ?? null), R = J(() => !!C.value && C.value.stage === null && ze(C.value) === "playing"), _ = J(() => n.value?.completed.length === be.length), B = J(() => r.value || T.value || d.generationActive);
    Ve(P, () => {
      g.value = null;
    }), Ue(() => f.value !== "board" ? !1 : (f.value = "chapters", !0));
    async function X(z) {
      await a.act({
        type: "start",
        stage: z
      }) && (f.value = "board");
    }
    async function U() {
      const z = g.value;
      z && (g.value = null, await a.act({ type: z === "admission" ? "challenge" : z }) && (f.value = "board"));
    }
    function I() {
      R.value ? f.value = "board" : g.value = "admission";
    }
    async function Z() {
      C.value && (C.value.stage !== null && C.value.stage < be.length - 1 ? await X(C.value.stage + 1) : I());
    }
    return Oe(async () => {
      await a.read(), C.value && (f.value = "board"), $ = !0;
    }), Be(() => {
      $ && a.read();
    }), Fe(a.dispose), (z, w) => (h(), y("div", { class: ue(["moving-app", { "moving-app-board": f.value === "board" }]) }, [
      t(n) ? (h(), y("div", Ia, [s("span", null, m(t(o).balance(t(n).balance)), 1), s("small", Aa, m(e.generationActive ? t(o).storyBusy : t(i) ? t(l) ? t(o).generating : t(o).saving : t(n).writeState === "ready" && !t(p) ? t(o).saved : ""), 1)])) : q("", !0),
      t(u) || t(p) || t(n)?.pending || t(n)?.writeState === "failed" ? (h(), y("aside", Pa, [
        s("p", null, m(t(u) || t(o).saveProblem), 1),
        s("button", {
          type: "button",
          disabled: t(i),
          onClick: w[0] || (w[0] = (...A) => t(a).recover && t(a).recover(...A))
        }, m(t(o).recover), 9, Ta),
        t(n)?.writeState === "conflict" ? (h(), y("button", {
          key: 0,
          type: "button",
          disabled: t(i),
          onClick: w[1] || (w[1] = (...A) => t(a).read && t(a).read(...A))
        }, m(t(o).refresh), 9, Ra)) : q("", !0)
      ])) : q("", !0),
      t(n) ? f.value === "board" && C.value && t(n).board ? (h(), Ne(Ea, {
        key: C.value.id,
        active: C.value,
        board: t(n).board,
        disabled: t(r) || e.generationActive,
        award: t(n).award,
        challenge: t(n).challenge,
        "sound-enabled": t(n).soundEnabled,
        "set-sound-enabled": t(a).setSoundEnabled,
        onPick: w[2] || (w[2] = (A) => t(a).act({
          type: "pick",
          id: A
        })),
        onUndo: w[3] || (w[3] = (A) => t(a).act({ type: "undo" })),
        onRestart: w[4] || (w[4] = (A) => g.value = "restart"),
        onAbandon: w[5] || (w[5] = (A) => g.value = "abandon"),
        onChapters: w[6] || (w[6] = (A) => f.value = "chapters"),
        onNext: Z,
        onAnimation: w[7] || (w[7] = (A) => T.value = A)
      }, null, 8, [
        "active",
        "board",
        "disabled",
        "award",
        "challenge",
        "sound-enabled",
        "set-sound-enabled"
      ])) : t(n) ? (h(), y("section", {
        key: 4,
        class: "moving-chapters moving-room",
        "aria-label": t(o).chapters
      }, [
        C.value && t(ze)(C.value) === "playing" ? (h(), y("button", {
          key: 0,
          type: "button",
          class: "moving-resume",
          onClick: w[8] || (w[8] = (A) => f.value = "board")
        }, [s("span", null, m(t(o).resume) + " · " + m(t(pe)[C.value.level.id]), 1), w[12] || (w[12] = s("span", { "aria-hidden": "true" }, "→", -1))])) : q("", !0),
        s("article", Ba, [
          s("div", Fa, [re(oe, { kind: "cat" }), re(oe, { kind: "plant" })]),
          s("div", Oa, [
            s("small", null, m(t(o).chapterOne), 1),
            s("h2", null, m(t(pe).weekend), 1),
            s("p", null, m(t(o).firstReward), 1)
          ]),
          s("ol", Na, [(h(!0), y(te, null, ce(t(be), (A, F) => (h(), y("li", { key: A.key }, [s("button", {
            type: "button",
            "data-stage": F,
            "aria-label": t(o).stage(F),
            disabled: B.value || R.value || F > t(n).completed.length,
            class: ue({ "is-cleared": t(n).completed.includes(F) }),
            onClick: (Y) => X(F)
          }, [s("strong", null, m(F + 1), 1), s("small", null, m(t(n).completed.includes(F) ? "✓" : "+" + t(he).chapterReward), 1)], 10, Va)]))), 128))])
        ]),
        s("article", ja, [
          s("div", Da, [re(oe, { kind: "potion" }), re(oe, { kind: "star" })]),
          s("div", Ga, [
            s("small", null, [ne(m(t(o).chapterTwo) + " · ", 1), s("span", { "data-tier": t(n).challenge.tier }, m(t(De)[t(n).challenge.tier]), 9, Ha)]),
            s("h2", null, m(t(pe).witch), 1),
            s("p", null, m(t(o).challengeTerms), 1)
          ]),
          _.value ? (h(), y("p", qa, m(t(o).tierProgress(t(n).challenge)), 1)) : q("", !0),
          s("button", {
            type: "button",
            class: "moving-primary",
            disabled: B.value || !_.value || !R.value && t(n).balance < t(he).challengeFee,
            onClick: I
          }, m(R.value ? t(o).resume : _.value ? t(o).admission : t(o).challengeLocked), 9, Za),
          _.value && !R.value && t(n).balance < t(he).challengeFee ? (h(), y("p", Ya, m(t(o).noFunds), 1)) : q("", !0)
        ]),
        s("p", Ua, m(t(o).sessionNote), 1)
      ], 8, za)) : q("", !0) : (h(), y("p", La, m(t(o).loading), 1)),
      t(l) ? (h(), y("div", Wa, m(t(o).generating), 1)) : q("", !0),
      g.value ? (h(), y("div", {
        key: 6,
        class: "moving-modal-backdrop moving-room-theme",
        onClick: w[11] || (w[11] = je((A) => g.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: P,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-confirm-title",
        tabindex: "-1"
      }, [
        s("header", null, [s("h2", Xa, m(g.value === "admission" && t(n) ? t(o).admissionTitle(t(n).challenge.tier) : g.value === "abandon" ? t(o).abandonTitle : t(o).restartTitle), 1), s("button", {
          type: "button",
          "aria-label": t(o).close,
          onClick: w[9] || (w[9] = (A) => g.value = null)
        }, "×", 8, Ka)]),
        s("p", null, m(g.value === "admission" ? t(o).admissionBody : g.value === "abandon" ? t(o).abandonBody : t(o).discard), 1),
        g.value === "admission" && t(n) ? (h(), y("p", {
          key: 0,
          class: "moving-session-note",
          "data-tier": t(n).challenge.tier
        }, [
          ne(m(t(o).tierProgress(t(n).challenge)), 1),
          w[13] || (w[13] = s("br", null, null, -1)),
          ne(m(t(o).tierRule), 1)
        ], 8, Ja)) : q("", !0),
        s("div", Qa, [s("button", {
          type: "button",
          class: "moving-plain",
          onClick: w[10] || (w[10] = (A) => g.value = null)
        }, m(t(o).cancel), 1), s("button", {
          type: "button",
          class: "moving-primary",
          disabled: B.value,
          onClick: U
        }, m(g.value === "admission" ? t(o).admission : t(o).confirm), 9, en)])
      ], 512)])) : q("", !0)
    ], 2));
  }
}), dn = tn;
export {
  dn as default
};
