/* eslint-disable */
import { $ as ue, A as qe, D as Re, E as Ye, F as h, H as Pe, L as ce, M as Be, O as Fe, Q as t, X as ke, Y as K, _ as y, b as re, et as we, g as q, h as Oe, l as je, m as s, p as U, tt as g, u as ae, v as se, x as xe, y as ie } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as Ze, r as Ve } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { a as ve, i as We, n as de, o as Xe, r as o, s as ge, t as Ne } from "./xiaobai-os-copy-Bo3eHGxn.js";
import { At as pe, Ot as Ke, S as Ue, St as Qe, X as Je, _t as et, a as tt, g as Le, gt as at, kt as ze, m as nt, mt as it, n as ot, q as lt, rt, t as st, u as dt, x as Me } from "./xiaobai-os-RoundedBoxGeometry-CpWqoTdO.js";
var De = [
  "cat",
  "cup",
  "plant",
  "toast",
  "duck",
  "ufo",
  "potion",
  "star"
];
function ct(e) {
  return {
    remaining: e.items.map((d) => d.id),
    tray: []
  };
}
function me(e) {
  return !e.remaining.length && !e.tray.length ? "won" : e.tray.length >= 7 ? "lost" : "playing";
}
function Ge(e, d) {
  return (e.items.length - d.remaining.length - d.tray.length) / 3;
}
function Ce(e, d) {
  return me(e) === "playing" && e.remaining.includes(d.id) && (!d.above || !e.remaining.includes(d.above));
}
function ut(e, d, a) {
  if (me(d) !== "playing") return {
    ok: !1,
    reason: "finished"
  };
  const n = e.items.find((u) => u.id === a.id);
  if (!n || !d.remaining.includes(n.id)) return {
    ok: !1,
    reason: "missing"
  };
  if (!Ce(d, n)) return {
    ok: !1,
    reason: "blocked"
  };
  const i = [...d.tray], r = (u) => e.items.find((m) => m.id === u).kind === n.kind, v = i.reduce((u, m, P) => r(m) ? P : u, -1);
  i.splice(v < 0 ? i.length : v + 1, 0, n.id);
  const l = i.filter(r), f = l.length === 3 ? l : [];
  return {
    ok: !0,
    packed: f,
    state: {
      remaining: d.remaining.filter((u) => u !== n.id),
      tray: i.filter((u) => !f.includes(u))
    }
  };
}
function ft(e) {
  let d = e >>> 0;
  return () => {
    d += 1831565813;
    let a = d;
    return a = Math.imul(a ^ a >>> 15, a | 1), a ^= a + Math.imul(a ^ a >>> 7, a | 61), ((a ^ a >>> 14) >>> 0) / 4294967296;
  };
}
function vt(e, d, a) {
  const n = e.flatMap((i) => Array.from({ length: 3 }, () => i));
  for (let i = n.length - 1; i > 0; i--) {
    const r = Math.floor(a() * (i + 1));
    [n[i], n[r]] = [n[r], n[i]];
  }
  return Array.from({ length: d }, (i, r) => n.filter((v, l) => l % d === r));
}
var oe = [
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
], pt = 0.51, en = {
  lanes: oe.length,
  depth: De.length * 3 / oe.length
}, bt = [
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
function mt(e, d, a, n) {
  const i = e.map((r, v) => r.map((l, f) => `s${v}-${f}`));
  return {
    id: d,
    key: a,
    seed: n,
    items: e.flatMap((r, v) => r.map((l, f) => {
      const [u, m, P] = oe[v];
      return {
        id: i[v][f],
        kind: l,
        above: f ? i[v][f - 1] : null,
        position: [
          u + (f % 2 ? 0.18 : -0.18),
          m + (r.length - f - 1) * pt + 0.32,
          P
        ]
      };
    })),
    stacks: i
  };
}
var be = bt.map((e, d) => mt(vt(De.slice(0, e.count), e.lanes, ft(e.seed)), "weekend", `chapter-${d + 1}`, e.seed));
function gt(e) {
  throw Object.assign(/* @__PURE__ */ new Error(`moving_${e}`), { code: `moving_${e}` });
}
function ht(e) {
  let d = ct(e.level);
  for (const a of e.moves) {
    const n = ut(e.level, d, {
      type: "pick",
      id: a
    });
    n.ok || gt("invalid"), d = n.state;
  }
  return d;
}
function Te(e) {
  return e.abandoned ? "abandoned" : me(ht(e));
}
function yt() {
  return [...crypto.getRandomValues(new Uint32Array(4))].map((e) => e.toString(16).padStart(8, "0")).join("");
}
function kt(e, d) {
  const a = ke(null), n = K(!1), i = K(""), r = K(!1), v = ke(null);
  let l = !1, f = null;
  const u = U(() => n.value || !!v.value || !a.value?.ready || a.value.writeState !== "ready" || a.value.pending);
  function m(C) {
    l || (a.value = C);
  }
  async function P(C, A) {
    if (l || n.value) return !1;
    n.value = !0, f = null, r.value = !!A && "command" in A && A.command.type === "challenge", i.value = "";
    try {
      const _ = await e.request(`game/moving/${C}`, {
        chatIdentity: d,
        ...A
      }, 35e3), F = f;
      return m(F && F.revision >= _.result.revision ? F : _.result), a.value?.writeState === "ready" && !a.value.pending && (v.value = null), !0;
    } catch (_) {
      if (!l) {
        if (f && m(f), C === "sound") throw _;
        i.value = Xe(_);
        const F = _ && typeof _ == "object" && "code" in _ ? String(_.code) : _ instanceof Error ? _.message : "";
        A && "command" in A && (F.startsWith("moving_save_") || F.startsWith("host_request_")) && (v.value = A);
      }
      return !1;
    } finally {
      l || (n.value = !1, r.value = !1);
    }
  }
  const w = e.subscribe((C) => {
    if (l || C.type !== "game/moving/state") return;
    const A = C.payload;
    A.chatIdentity === d && (n.value ? f = A.state : m(A.state));
  });
  async function j() {
    const C = v.value;
    !await P("confirm") || !a.value || a.value.writeState !== "ready" || a.value.pending || C && a.value.revision === C.revision && await P("act", C);
  }
  return {
    view: a,
    busy: n,
    error: i,
    generating: r,
    blocked: u,
    failed: v,
    notice: U(() => i.value || (a.value?.writeState === "conflict" ? o.conflict : a.value?.pending || a.value?.writeState === "unconfirmed" ? o.saveProblem : "")),
    read: () => P("read"),
    recover: j,
    setSoundEnabled: (C) => P("sound", { enabled: C }),
    act: (C) => u.value ? Promise.resolve(!1) : P("act", {
      actionId: yt(),
      revision: a.value.revision,
      command: C
    }),
    dispose() {
      l = !0, w();
    }
  };
}
function wt() {
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
      ] : [392]).forEach((r, v) => {
        const l = e.createOscillator(), f = e.createGain(), u = e.currentTime + v * 0.09;
        l.type = "sine", l.frequency.value = r, f.gain.setValueAtTime(0, u), f.gain.linearRampToValueAtTime(0.065, u + 0.015), f.gain.exponentialRampToValueAtTime(1e-3, u + 0.25), l.connect(f), f.connect(e.destination), l.start(u), l.stop(u + 0.27), l.onended = () => {
          l.disconnect(), f.disconnect();
        };
      });
    },
    async dispose() {
      a = !0, n++, d = !1, e && e.state !== "closed" && await e.close();
    }
  };
}
var He = {
  cat: "#f8bbbf",
  toast: "#dd9a54",
  ufo: "#70c9b3",
  cup: "#b8a2e5",
  duck: "#ffce5b",
  plant: "#52ad89",
  potion: "#916ce1",
  star: "#ffd36b"
};
function he(e, d) {
  const a = new Me(), n = He[d], i = (r, v, l = 0.1) => {
    for (const f of [-l, l]) e.ball(a, [
      0.025,
      0.038,
      0.02
    ], "#343447", [
      f,
      r,
      v
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
        const v = r * 2.4, l = e.ball(a, [
          0.085,
          0.21,
          0.07
        ], n, [
          Math.sin(v) * 0.13,
          0.15 + r * 0.025,
          Math.cos(v) * 0.12
        ]);
        l.rotation.z = Math.sin(v) * 0.7, l.rotation.x = Math.cos(v) * 0.7;
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
        const v = r * Math.PI * 2 / 5, l = e.cylinder(a, 0, 0.13, 0.25, n, [
          Math.sin(v) * 0.22,
          Math.cos(v) * 0.22,
          0
        ], 4);
        l.rotation.z = -v;
      }
      i(0.02, 0.11, 0.07);
      break;
  }
  return a;
}
function xt() {
  const e = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  function a(n, i, r, v, l) {
    d.has(i) || d.set(i, r()), e.has(v) || e.set(v, new Je({
      color: v,
      roughness: 0.55,
      metalness: 0.02
    }));
    const f = new lt(d.get(i), e.get(v));
    return f.position.set(...l), f.castShadow = !0, f.receiveShadow = !0, n.add(f), f;
  }
  return {
    group(n, i = [
      0,
      0,
      0
    ]) {
      const r = new Me();
      return r.position.set(...i), n.add(r), r;
    },
    box(n, i, r, v, l = 0.08) {
      const f = Math.min(l, ...i.map((u) => u / 2));
      return a(n, `b:${i}:${f}`, () => new st(...i, 2, f), r, v);
    },
    ball(n, i, r, v) {
      const l = a(n, "ball", () => new Qe(1, 16, 12), r, v);
      return l.scale.set(...i), l;
    },
    cylinder(n, i, r, v, l, f, u = 24) {
      return a(n, `c:${i}:${r}:${v}:${u}`, () => new nt(i, r, v, u), l, f);
    },
    ring(n, i, r, v, l) {
      return a(n, `t:${i}:${r}`, () => new Ke(i, r, 8, 32), v, l);
    },
    dispose() {
      d.forEach((n) => n.dispose()), e.forEach((n) => n.dispose()), d.clear(), e.clear();
    }
  };
}
var Mt = {
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
function Ct(e) {
  const d = xt(), a = new Me(), n = Mt[e.id], i = d.group(a), r = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), l = d.box, f = d.ball;
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
  const u = l(i, [
    5.9,
    0.055,
    3.15
  ], n.rug, [
    0,
    0.035,
    1.45
  ], 0.025);
  u.rotation.y = -0.035;
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
  ], 0.05), f(i, [
    0.25,
    0.25,
    0.04
  ], "#fff0ba", [
    0.98,
    3.48,
    -3.2
  ]), e.id === "witch") {
    f(i, [
      0.22,
      0.22,
      0.045
    ], "#b6bde9", [
      1.1,
      3.56,
      -3.15
    ]);
    for (const [b, R] of [
      [-0.25, 3.55],
      [0.15, 2.85],
      [0.85, 2.8]
    ]) {
      const x = he(d, "star");
      x.position.set(b, R, -3.17), x.scale.setScalar(0.25), i.add(x);
    }
  } else for (const b of [
    -0.3,
    -0.05,
    0.2
  ]) f(i, [
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
  const [m, P, w] = oe[0];
  if (e.id === "weekend") {
    l(i, [
      3,
      0.45,
      1.42
    ], n.seat, [
      m,
      P - 0.3,
      w
    ], 0.18), l(i, [
      3,
      0.85,
      0.32
    ], n.seat, [
      m,
      P + 0.25,
      w - 0.67
    ], 0.15);
    for (const b of [m - 1.35, m + 1.35]) l(i, [
      0.3,
      0.65,
      1.48
    ], n.seat, [
      b,
      P,
      w
    ], 0.14);
    for (const b of [
      m - 0.8,
      m,
      m + 0.8
    ]) l(i, [
      0.73,
      0.18,
      1.05
    ], "#ffd7d9", [
      b,
      P - 0.04,
      w
    ], 0.08);
  } else {
    l(i, [
      3.05,
      0.64,
      1.5
    ], n.seat, [
      m,
      P - 0.35,
      w
    ], 0.1), l(i, [
      3.2,
      0.15,
      1.6
    ], "#fff6e8", [
      m,
      P - 0.04,
      w
    ], 0.06);
    for (const R of [m - 0.9, m + 0.9])
      l(i, [
        0.68,
        0.38,
        0.035
      ], "#8699be", [
        R,
        0.31,
        w + 0.77
      ], 0.06), f(i, [
        0.055,
        0.055,
        0.03
      ], "#f6d38b", [
        R,
        0.52,
        w + 0.8
      ]);
    const b = d.group(i, [
      -3.42,
      0.46,
      0.7
    ]);
    f(b, [
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
    for (const R of [-0.48, 0.48]) d.ring(b, 0.1, 0.03, "#dfcfa1", [
      R,
      0.06,
      0
    ]);
    for (const [R, x] of [
      [-0.16, 0.48],
      [0.1, 0.74],
      [0.21, 0.43]
    ]) f(b, [
      0.095,
      0.095,
      0.095
    ], "#c2f5df", [
      R,
      x,
      0
    ]);
  }
  const [j, C, A] = oe[1];
  l(i, [
    2.35,
    C,
    1.45
  ], n.cabinet, [
    j,
    C / 2,
    A
  ], 0.09), l(i, [
    2.48,
    0.13,
    1.56
  ], "#fff7e6", [
    j,
    C,
    A
  ], 0.05);
  for (const b of [0.25, 0.62])
    l(i, [
      2.12,
      0.27,
      0.04
    ], n.trim, [
      j,
      b,
      A + 0.75
    ], 0.03), l(i, [
      0.45,
      0.055,
      0.08
    ], "#fff7e6", [
      j,
      b,
      A + 0.81
    ], 0.02);
  const [_, F, X] = oe[2];
  l(i, [
    1.85,
    F,
    1.45
  ], "#e9be94", [
    _,
    F / 2,
    X
  ], 0.06), l(i, [
    0.2,
    F + 0.016,
    1.48
  ], "#ffe5b7", [
    _,
    F / 2,
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
  const [W, E, Z] = oe[3];
  l(i, [
    2.15,
    0.13,
    1.35
  ], e.id === "witch" ? "#c1d8f0" : "#f5d6ac", [
    W,
    E,
    Z
  ], 0.055);
  for (const b of [W - 0.7, W + 0.7]) l(i, [
    0.11,
    E,
    0.8
  ], n.trim, [
    b,
    E / 2,
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
  const T = d.group(i, [
    2.94,
    3.515,
    -2.96
  ]);
  l(T, [
    0.5,
    0.075,
    0.24
  ], n.seat, [
    0,
    0.04,
    0
  ], 0.025), d.cylinder(T, 0.25, 0.25, 0.16, n.seat, [
    0,
    0.3,
    0
  ]).rotation.x = Math.PI / 2, d.cylinder(T, 0.207, 0.207, 0.018, "#fffaf0", [
    0,
    0.3,
    0.09
  ]).rotation.x = Math.PI / 2, l(T, [
    0.025,
    0.145,
    0.018
  ], "#53646b", [
    0,
    0.36,
    0.11
  ], 8e-3), l(T, [
    0.13,
    0.025,
    0.018
  ], "#53646b", [
    0.05,
    0.3,
    0.11
  ], 8e-3);
  for (const [b, R, x] of [
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
      R,
      0.3
    ], x, [
      0,
      R / 2,
      0
    ], 0.012), l(c, [
      0.1,
      0.018,
      0.25
    ], "#fffaf0", [
      0,
      R - 0.025,
      0.012
    ], 3e-3);
    for (const k of [0.07, R - 0.07]) l(c, [
      0.095,
      0.016,
      0.012
    ], "#fffaf0", [
      0,
      k,
      0.151
    ], 3e-3);
  }
  const $ = d.group(i, [
    -4.25,
    2.55,
    0.05
  ]);
  $.rotation.y = Math.PI / 2, l($, [
    1,
    1.1,
    0.09
  ], "#fff7e8", [
    0,
    0,
    0
  ], 0.04), l($, [
    0.82,
    0.9,
    0.03
  ], "#cddff3", [
    0,
    0,
    0.06
  ], 0.025);
  const I = he(d, e.id === "witch" ? "potion" : "cat");
  I.scale.setScalar(0.8), I.position.set(0, -0.08, 0.15), $.add(I);
  for (const b of e.items) {
    const R = he(d, b.kind);
    l(R, [
      0.93,
      0.085,
      0.76
    ], "#fff9e9", [
      0,
      -0.29,
      0
    ], 0.035);
    for (const c of [-0.34, 0.34]) f(R, [
      0.1,
      0.055,
      0.25
    ], "#f4e8d5", [
      c,
      -0.23,
      0
    ]);
    R.position.set(...b.position), R.userData.itemId = b.id, a.add(R), r.set(b.id, R);
    const x = d.group(a, [
      b.position[0],
      b.position[1] - 0.27,
      b.position[2]
    ]);
    d.ring(x, 0.47, 0.023, "#eaba61", [
      0,
      0,
      0
    ]).rotation.x = Math.PI / 2, v.set(b.id, x);
  }
  const L = d.group(a, [
    -3.05,
    0.52,
    3.55
  ]);
  f(L, [
    0.32,
    0.4,
    0.27
  ], "#fffaf2", [
    0,
    0.1,
    0
  ]);
  for (const b of [-0.2, 0.2])
    f(L, [
      0.09,
      0.17,
      0.085
    ], "#fffaf2", [
      b,
      0.48,
      0
    ]), f(L, [
      0.065,
      0.07,
      0.1
    ], "#667486", [
      b * 0.75,
      -0.28,
      0.06
    ]), f(L, [
      0.028,
      0.039,
      0.02
    ], "#354353", [
      b * 0.5,
      0.22,
      0.252
    ]), f(L, [
      0.052,
      0.028,
      0.025
    ], "#f0afb0", [
      b * 0.8,
      0.12,
      0.242
    ]);
  const B = d.group(L, [
    0,
    -0.03,
    0.37
  ]);
  l(B, [
    0.47,
    0.35,
    0.33
  ], "#dfb084", [
    0,
    0,
    0
  ], 0.035), l(B, [
    0.08,
    0.36,
    0.34
  ], "#ffe6b8", [
    0,
    0,
    0
  ], 8e-3), B.visible = !1;
  const te = d.group(a, [
    3.6,
    0.1,
    3.55
  ]);
  for (let b = 0; b < e.items.length / 3; b++) {
    const R = l(te, [
      0.4,
      0.26,
      0.4
    ], b % 2 ? "#e2b585" : "#efcba2", [
      b % 2 * 0.43 - 0.25,
      Math.floor(b / 2) * 0.28 + 0.14,
      0
    ], 0.03);
    R.visible = !1;
  }
  const D = d.ring(a, 0.49, 0.03, "#e6ac44", [
    0,
    0.1,
    0
  ]);
  return D.rotation.x = -Math.PI / 2, D.visible = !1, D.castShadow = !1, {
    root: a,
    items: r,
    markers: v,
    mascot: L,
    parcel: B,
    shipped: te,
    halo: D,
    dispose: () => d.dispose()
  };
}
var ye = 0.42;
function $t() {
  return new rt(-7, 7, 7, -7, 0.1, 100);
}
function _t(e, d, a, n) {
  e.position.set(Math.sin(n) * 18, 13.5, Math.cos(n) * 18), e.lookAt(0, 1, 0.1), e.updateMatrixWorld(!0);
  const i = new tt(new pe(-4.8, -0.8, -3.7), new pe(4.8, 4.7, 4.4));
  let r = 0, v = 0;
  for (const u of [i.min.x, i.max.x]) for (const m of [i.min.y, i.max.y]) for (const P of [i.min.z, i.max.z]) {
    const w = new pe(u, m, P).applyMatrix4(e.matrixWorldInverse);
    r = Math.max(r, Math.abs(w.x)), v = Math.max(v, Math.abs(w.y));
  }
  const l = d / a, f = Math.max(v, r / l) * 1.035;
  e.top = f, e.bottom = -f, e.left = -f * l, e.right = -e.left, e.updateProjectionMatrix();
}
function St(e, d, a, n) {
  const i = new et(), r = $t(), v = new it(), l = new ze(), f = new ze(), u = Ct(d), m = u.mascot.position.clone(), P = new AbortController();
  let w, j, C, A = !1, _ = !1, F = !0, X = !0, W = 0, E = 0, Z = 0, T = ye;
  const $ = 0.86;
  let I = a, L = null, B = null;
  const te = matchMedia("(prefers-reduced-motion: reduce)");
  let D;
  const b = new Le("#fff4df", 3.1);
  b.position.set(-3, 10, 7), b.castShadow = !0, b.shadow.mapSize.set(1024, 1024), Object.assign(b.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 0.5,
    far: 30
  }), b.shadow.normalBias = 0.025, b.shadow.bias = -15e-5, i.add(new Ue("#f3f8ff", "#b6b2b0", 2.1), b, u.root);
  const R = new Le("#dbeaff", 0.7);
  R.position.set(6, 5, -3), i.add(R);
  function x() {
    for (const M of d.items) {
      const z = u.items.get(M.id);
      z.visible = I.remaining.includes(M.id), z.position.set(...M.position), z.scale.setScalar($), u.markers.get(M.id).visible = Ce(I, M);
    }
    u.mascot.position.copy(m), u.mascot.rotation.y = 0, u.parcel.visible = !1, u.shipped.children.forEach((M, z) => {
      M.visible = z < Ge(d, I);
    });
  }
  function c() {
    const M = D;
    D = void 0, x(), M?.done();
  }
  function k() {
    W && (cancelAnimationFrame(W), W = 0);
  }
  function Y(M, z) {
    A || _ || (_ = !0, k(), c(), n.error(M, z));
  }
  function G() {
    _t(r, E, Z, T);
  }
  function ee(M) {
    if (W = 0, !(A || _ || !F || !X || document.hidden || E <= 0 || Z <= 0))
      try {
        if (D) {
          const p = Math.min(1, (M - D.started) / D.duration), V = D.action;
          if (V?.type === "pick") {
            const H = d.items.find((Q) => Q.id === V.id), S = u.items.get(H.id), N = Math.min(1, p * (D.packed ? 4 : 1));
            if (S.visible = N < 1, S.position.set(...H.position).lerp(m.clone().add(new pe(0, 0.43, 0)), N), S.position.y += Math.sin(N * Math.PI) * 1.4, S.scale.setScalar($ * (1 - N * 0.7)), D.packed) {
              const Q = Math.max(0, (p - 0.2) / 0.8);
              u.parcel.visible = Q > 0 && Q < 0.92, u.mascot.position.x = m.x + Q * (u.shipped.position.x - m.x), u.mascot.position.y = m.y + Math.abs(Math.sin(Q * 22)) * 0.1, u.mascot.rotation.y = 0.6;
            }
          }
          p >= 1 && c();
        }
        const z = L ? u.items.get(L) : void 0;
        u.halo.visible = !!z?.visible, z?.visible && (u.halo.position.copy(z.position), u.halo.position.y -= 0.28), w.getSize(f), (f.x !== E || f.y !== Z) && w.setSize(E, Z, !1), w.render(i, r), D && O();
      } catch (z) {
        Y("graphicsFailed", z);
      }
  }
  function O() {
    !W && !A && !_ && F && X && !document.hidden && E > 0 && Z > 0 && (W = requestAnimationFrame(ee));
  }
  function J() {
    const M = e.getBoundingClientRect();
    if (E = M.width, Z = M.height, E <= 0 || Z <= 0) {
      k();
      return;
    }
    G(), O();
  }
  function ne(M, z) {
    const p = w.domElement.getBoundingClientRect();
    l.set((M - p.left) / p.width * 2 - 1, -(z - p.top) / p.height * 2 + 1), v.setFromCamera(l, r);
    const V = v.intersectObject(u.root, !0);
    for (const H of V) {
      let S = H.object, N = !0;
      for (; S; ) {
        if (!S.visible) {
          N = !1;
          break;
        }
        S = S.parent;
      }
      if (!(!N || H.object === u.halo || [...u.markers.values()].some((Q) => H.object.parent === Q))) {
        for (S = H.object; S; ) {
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
  function $e(M, z) {
    const p = ne(M, z);
    if (p?.type === "pick") return p;
    const V = w.domElement.getBoundingClientRect(), H = d.items.flatMap((S) => {
      const N = u.items.get(S.id);
      if (!N.visible) return [];
      const Q = N.position.clone().project(r), Ee = V.left + (Q.x + 1) * V.width / 2, Ie = V.top + (1 - Q.y) * V.height / 2, Ae = Math.hypot(M - Ee, z - Ie);
      return Ae <= 22 ? [{
        id: S.id,
        x: Ee,
        y: Ie,
        distance: Ae
      }] : [];
    }).sort((S, N) => S.distance - N.distance);
    for (const S of H) {
      const N = ne(S.x, S.y);
      if (N?.type === "pick" && N.id === S.id) return N;
    }
    return p;
  }
  function fe(M) {
    r.zoom = Math.max(1, Math.min(1.8, r.zoom * M)), r.updateProjectionMatrix(), O();
  }
  function _e(M) {
    T = Math.max(-0.15, Math.min(1.05, T + M)), G(), O();
  }
  function Se() {
    A || (A = !0, k(), c(), P.abort(), j?.disconnect(), C?.disconnect(), u.dispose(), b.shadow.dispose(), i.clear(), w?.dispose(), w?.forceContextLoss(), w?.domElement.remove());
  }
  try {
    w = new ot({
      alpha: !0,
      antialias: !0,
      powerPreference: "low-power"
    }), w.setPixelRatio(Math.min(window.devicePixelRatio, 2)), w.setClearColor(new dt("#e6f1ed"), 0), w.outputColorSpace = at, w.toneMapping = 7, w.shadowMap.enabled = !0, w.shadowMap.type = 2, w.debug.onShaderError = () => Y("graphicsFailed");
    const M = w.domElement;
    M.setAttribute("aria-label", o.sceneLabel), M.setAttribute("role", "img"), M.tabIndex = 0, e.prepend(M);
    const z = { signal: P.signal };
    M.addEventListener("webglcontextlost", (p) => {
      p.preventDefault(), Y("contextLost");
    }, z), M.addEventListener("pointerdown", (p) => {
      p.button !== 0 || B || D || (M.setPointerCapture(p.pointerId), B = {
        id: p.pointerId,
        x: p.clientX,
        y: p.clientY,
        yaw: T,
        dragged: !1
      });
    }, z), M.addEventListener("pointermove", (p) => {
      if (!B) {
        if (D || p.pointerType !== "mouse") return;
        const S = $e(p.clientX, p.clientY), N = S?.type === "pick" ? S.id : null;
        M.style.cursor = S ? "pointer" : "grab", L !== N && (L = N, O());
        return;
      }
      if (B.id !== p.pointerId) return;
      const V = p.clientX - B.x, H = p.clientY - B.y;
      Math.hypot(V, H) > 7 && (B.dragged = !0), B.dragged && (T = Math.max(-0.15, Math.min(1.05, B.yaw - V / E * 2.4)), G(), O());
    }, z), M.addEventListener("pointerleave", () => {
      L && (L = null, O());
    }, z), M.addEventListener("pointerup", (p) => {
      if (!B || B.id !== p.pointerId) return;
      const V = B.dragged;
      if (B = null, M.hasPointerCapture(p.pointerId) && M.releasePointerCapture(p.pointerId), !V && !D) {
        const H = $e(p.clientX, p.clientY);
        H && n.action(H);
      }
    }, z);
    for (const p of ["pointercancel", "lostpointercapture"]) M.addEventListener(p, () => {
      B = null;
    }, z);
    return M.addEventListener("keydown", (p) => {
      p.key === "ArrowLeft" || p.key === "ArrowRight" ? (p.preventDefault(), _e(p.key === "ArrowLeft" ? -0.14 : 0.14)) : p.key === "Home" ? (p.preventDefault(), T = ye, r.zoom = 1, G(), O()) : p.key === "+" || p.key === "=" ? (p.preventDefault(), fe(1.15)) : p.key === "-" && (p.preventDefault(), fe(1 / 1.15));
    }, z), M.addEventListener("wheel", (p) => {
      p.preventDefault(), fe(p.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, {
      ...z,
      passive: !1
    }), document.addEventListener("visibilitychange", () => {
      document.hidden ? (k(), c(), B = null) : O();
    }, z), te.addEventListener("change", () => {
      c(), O();
    }, z), j = new ResizeObserver(() => {
      try {
        J();
      } catch (p) {
        Y("graphicsFailed", p);
      }
    }), j.observe(e), C = new IntersectionObserver((p) => {
      X = p[0].isIntersecting, X ? O() : (k(), c());
    }), C.observe(e), x(), J(), {
      dispose: Se,
      rotate: _e,
      zoom: fe,
      visibleItems() {
        const p = w.domElement.getBoundingClientRect();
        return d.items.filter((V) => {
          const H = u.items.get(V.id);
          if (!H.visible) return !1;
          const S = H.position.clone().project(r);
          if (Math.abs(S.x) > 1 || Math.abs(S.y) > 1) return !1;
          const N = ne(p.left + (S.x + 1) * p.width / 2, p.top + (1 - S.y) * p.height / 2);
          return N?.type === "pick" && N.id === V.id;
        }).map((V) => V.id);
      },
      resetView() {
        T = ye, r.zoom = 1, G(), O();
      },
      focus(p) {
        L = p, O();
      },
      active(p) {
        F = p, p ? J() : (k(), c(), B = null);
      },
      update(p, V, H = !1) {
        return c(), I = p, x(), te.matches || !F || document.hidden || _ || !X || !V ? (O(), Promise.resolve()) : new Promise((S) => {
          D = {
            started: performance.now(),
            duration: H ? 1100 : 300,
            action: V,
            packed: H,
            done: S
          }, O();
        });
      }
    };
  } catch (M) {
    throw Se(), M;
  }
}
var Et = {
  key: 0,
  fill: "currentColor"
}, It = { key: 1 }, At = { key: 2 }, Pt = { key: 3 }, Lt = { key: 4 }, zt = { key: 5 }, Tt = { key: 6 }, Rt = { key: 7 }, Bt = /* @__PURE__ */ xe({
  __name: "ItemIcon",
  props: { kind: {} },
  setup(e) {
    return (d, a) => (h(), y("svg", {
      viewBox: "0 0 48 48",
      "aria-hidden": "true",
      style: we({ color: t(He)[e.kind] }),
      class: "moving-item-icon"
    }, [e.kind === "cat" ? (h(), y("g", Et, [...a[0] || (a[0] = [se('<path d="M11 23 10 6 22 15 29 14 39 6 38 26Z"></path><ellipse cx="24" cy="31" rx="14" ry="12"></ellipse><ellipse cx="24" cy="23" rx="17" ry="13"></ellipse><path d="M38 33q10 5 3 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path><g fill="#354353"><circle cx="18" cy="23" r="1.6"></circle><circle cx="30" cy="23" r="1.6"></circle></g><path d="m22 27 2 2 2-2" fill="#ce778a"></path>', 6)])])) : e.kind === "toast" ? (h(), y("g", It, [...a[1] || (a[1] = [se('<path d="M9 17C1 2 47 2 39 17v24H9Z" fill="currentColor"></path><path d="M14 19C8 8 40 8 34 19v17H14Z" fill="#ffe9b9"></path><rect x="19" y="18" width="12" height="9" rx="2" fill="#f8ca54" transform="rotate(10 25 22)"></rect><g fill="#354353"><circle cx="19" cy="31" r="1.5"></circle><circle cx="29" cy="31" r="1.5"></circle></g>', 4)])])) : e.kind === "ufo" ? (h(), y("g", At, [...a[2] || (a[2] = [se('<ellipse cx="24" cy="29" rx="22" ry="8" fill="currentColor"></ellipse><path d="M12 27v-5a12 12 0 0 1 24 0v5Z" fill="#b0e4e8"></path><path d="M5 28q19 10 38 0" stroke="#eee4a6" stroke-width="3" fill="none"></path><g fill="#354353"><circle cx="20" cy="23" r="1.5"></circle><circle cx="28" cy="23" r="1.5"></circle></g>', 4)])])) : e.kind === "cup" ? (h(), y("g", Pt, [...a[3] || (a[3] = [se('<path d="M33 17h5c11 0 9 16-4 16" fill="none" stroke="currentColor" stroke-width="5"></path><path d="M7 13h29l-3 24q-12 8-23 0Z" fill="currentColor"></path><ellipse cx="21.5" cy="13" rx="14.5" ry="5" fill="#e7d9fb"></ellipse><ellipse cx="21.5" cy="13" rx="10" ry="3" fill="#806254"></ellipse><g fill="#354353"><circle cx="16" cy="27" r="1.5"></circle><circle cx="26" cy="27" r="1.5"></circle></g>', 5)])])) : e.kind === "duck" ? (h(), y("g", Lt, [...a[4] || (a[4] = [se('<ellipse cx="24" cy="32" rx="18" ry="11" fill="currentColor"></ellipse><circle cx="25" cy="17" r="12" fill="currentColor"></circle><ellipse cx="26" cy="23" rx="8" ry="4" fill="#f49c44"></ellipse><g fill="#354353"><circle cx="20" cy="16" r="1.5"></circle><circle cx="30" cy="16" r="1.5"></circle></g><path d="M11 30q3 8 9 4" fill="none" stroke="#eba93b" stroke-width="2"></path>', 5)])])) : e.kind === "plant" ? (h(), y("g", zt, [...a[5] || (a[5] = [
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
    ])])) : e.kind === "potion" ? (h(), y("g", Tt, [...a[6] || (a[6] = [
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
    ])])) : (h(), y("g", Rt, [...a[7] || (a[7] = [s("path", {
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
}), le = Bt, Ft = [
  "aria-label",
  "data-status",
  "data-tier",
  "data-level",
  "data-run",
  "aria-busy"
], Ot = { class: "moving-heading" }, jt = ["aria-label"], Vt = { class: "moving-room-number" }, Nt = {
  key: 0,
  class: "moving-tier"
}, Dt = ["aria-label"], Gt = { class: "moving-stage" }, Ht = {
  key: 0,
  class: "moving-view-tools"
}, qt = { class: "moving-rotate" }, Yt = ["aria-label"], Zt = ["aria-label"], Wt = ["aria-label"], Xt = ["aria-label"], Kt = ["aria-label"], Ut = {
  key: 0,
  class: "moving-gesture-hint"
}, Qt = {
  key: 1,
  class: "moving-scene-error",
  role: "alert"
}, Jt = {
  key: 2,
  class: "moving-result",
  "aria-live": "polite"
}, ea = {
  class: "moving-result-mark",
  "aria-hidden": "true"
}, ta = ["data-next-tier"], aa = { class: "moving-dock" }, na = { class: "moving-dock-label" }, ia = {
  role: "status",
  "aria-live": "polite"
}, oa = ["aria-label"], la = ["aria-label"], ra = {
  key: 1,
  "aria-hidden": "true"
}, sa = { class: "moving-tools" }, da = ["disabled"], ca = ["disabled"], ua = ["disabled"], fa = ["disabled"], va = ["disabled", "aria-pressed"], pa = { id: "moving-board-dialog" }, ba = ["aria-label"], ma = { class: "moving-rules" }, ga = {
  key: 0,
  class: "moving-session-note"
}, ha = { class: "moving-session-note" }, ya = [
  "data-item-id",
  "disabled",
  "aria-label",
  "onFocus",
  "onClick"
], ka = ["aria-label"], wa = /* @__PURE__ */ xe({
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
    const a = e, n = d, i = U(() => a.active.level), r = U(() => a.active.stage === null), v = U(() => a.active.abandoned ? "abandoned" : me(a.board)), l = U(() => Ge(i.value, a.board)), f = K(!1), u = K(!1), m = wt(), P = U(() => a.soundEnabled && m.available), w = K(o.description), j = K(""), C = K(null), A = K(null), _ = K(null), F = ke([]), X = U(() => Array.from({ length: 7 }, (x, c) => i.value.items.find((k) => k.id === a.board.tray[c]))), W = U(() => i.value.stacks.map((x) => x.map((c) => i.value.items.find((k) => k.id === c)).filter((c) => a.board.remaining.includes(c.id))));
    let E, Z = !1, T = !0, $ = 0, I = null;
    Ve(A, () => {
      _.value = null;
    });
    function L(x) {
      f.value = x, n("animation", x);
    }
    function B() {
      if (E?.dispose(), E = void 0, j.value = "", !!C.value)
        try {
          E = St(C.value, i.value, a.board, {
            action: te,
            error: (x, c) => {
              j.value = o[x], L(!1), c && console.error(o[x], c);
            }
          }), E.active(T);
        } catch (x) {
          j.value = o.graphicsFailed, console.error(o.graphicsFailed, x);
        }
    }
    function te(x) {
      if (a.disabled || f.value || j.value || !T) return;
      const c = i.value.items.find((k) => k.id === x.id);
      if (!c || !Ce(a.board, c)) {
        w.value = We.blocked, c?.above && E?.focus(c.above);
        return;
      }
      _.value = null, I = P.value ? m.setEnabled(!0).catch((k) => (w.value = o.soundFailed, console.error(o.soundFailed, k), !1)) : null, n("pick", x.id);
    }
    Pe(() => a.active.id, async () => {
      $++, I = null, L(!1), w.value = o.description, await Ye(), B();
    }), Pe(() => a.board, async (x, c) => {
      if (!Z || !c || c === x) return;
      const k = ++$, Y = c.remaining.filter((J) => !x.remaining.includes(J)), G = Y.length === 1 && x.remaining.length === c.remaining.length - 1, ee = G ? i.value.items.find((J) => J.id === Y[0]) : void 0, O = G && c.tray.length + 1 - x.tray.length === 3;
      if (ee) {
        if (w.value = O ? o.packed(de[ee.kind]) : o.selected(de[ee.kind]), T) {
          const J = I;
          I = null, J ? J.then((ne) => {
            ne && T && k === $ && m.play(O);
          }).catch((ne) => {
            w.value = o.soundFailed, console.error(o.soundFailed, ne);
          }) : m.play(O);
        }
      } else w.value = o.description;
      L(!0), await E?.update(x, ee ? {
        type: "pick",
        id: ee.id
      } : void 0, O), k === $ && L(!1);
    });
    async function D() {
      if (u.value) return;
      u.value = !0;
      const x = !P.value;
      let c = !1;
      try {
        if (x && !await m.setEnabled(!0)) return;
        c = !0, await a.setSoundEnabled(x) ? x ? m.play(!0) : await m.setEnabled(!1) : x && await m.setEnabled(!1);
      } catch (k) {
        x && await m.setEnabled(!1).catch((G) => console.error(o.soundFailed, G));
        const Y = c ? o.soundSaveFailed : o.soundFailed;
        w.value = Y, console.error(Y, k);
      } finally {
        u.value = !1;
      }
    }
    async function b() {
      try {
        await m.setEnabled(!1);
      } catch (x) {
        w.value = o.soundFailed, console.error(o.soundFailed, x);
      }
    }
    function R() {
      F.value = E?.visibleItems() ?? [], _.value = "items";
    }
    return Be(() => {
      Z = !0, B();
    }), Re(() => {
      T = !0, E?.active(!0);
    }), qe(() => {
      T = !1, I = null, _.value = null, E?.active(!1), b();
    }), Fe(() => {
      $++, Z = !1, E?.dispose(), L(!1), m.dispose().catch((x) => console.error(o.soundFailed, x));
    }), (x, c) => (h(), y("section", {
      class: ue(["moving-room", `moving-${i.value.id}`]),
      "aria-label": t(o).name,
      "data-status": v.value,
      "data-tier": e.challenge.activeTier,
      "data-level": i.value.key,
      "data-run": e.active.id,
      "aria-busy": e.disabled || f.value
    }, [
      s("header", Ot, [s("button", {
        type: "button",
        class: "moving-location",
        "aria-label": t(o).backChapters,
        onClick: c[0] || (c[0] = (k) => n("chapters"))
      }, [
        s("span", Vt, g(r.value ? "Ⅱ" : String(e.active.stage + 1).padStart(2, "0")), 1),
        s("span", null, [s("strong", null, [ie(g(t(ve)[i.value.id]), 1), r.value ? (h(), y("span", Nt, g(t(Ne)[e.challenge.activeTier]), 1)) : q("", !0)]), s("small", null, [r.value ? q("", !0) : (h(), y(ae, { key: 0 }, [ie(g(t(o).stage(e.active.stage)) + " · ", 1)], 64)), ie(g(t(o).progress(l.value, i.value.items.length / t(3))), 1)])]),
        c[18] || (c[18] = s("span", { "aria-hidden": "true" }, "⌄", -1))
      ], 8, jt), s("button", {
        type: "button",
        class: "moving-icon-button",
        "aria-label": t(o).rules,
        onClick: c[1] || (c[1] = (k) => _.value = "rules")
      }, "?", 8, Dt)]),
      s("div", Gt, [
        s("div", {
          ref_key: "host",
          ref: C,
          class: "moving-canvas"
        }, null, 512),
        j.value ? q("", !0) : (h(), y("div", Ht, [s("div", qt, [
          s("button", {
            type: "button",
            "aria-label": t(o).zoomOut,
            onClick: c[2] || (c[2] = (k) => t(E)?.zoom(1 / 1.2))
          }, "−", 8, Yt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateLeft,
            onClick: c[3] || (c[3] = (k) => t(E)?.rotate(-0.18))
          }, "↶", 8, Zt),
          s("button", {
            type: "button",
            "aria-label": t(o).resetView,
            onClick: c[4] || (c[4] = (k) => t(E)?.resetView())
          }, "⌂", 8, Wt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateRight,
            onClick: c[5] || (c[5] = (k) => t(E)?.rotate(0.18))
          }, "↷", 8, Xt),
          s("button", {
            type: "button",
            "aria-label": t(o).zoomIn,
            onClick: c[6] || (c[6] = (k) => t(E)?.zoom(1.2))
          }, "+", 8, Kt)
        ]), v.value === "playing" ? (h(), y("span", Ut, g(t(o).rotateHint), 1)) : q("", !0)])),
        j.value ? (h(), y("section", Qt, [
          s("p", null, g(j.value), 1),
          s("button", {
            type: "button",
            class: "moving-primary",
            onClick: B
          }, g(t(o).retryGraphics), 1),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: c[7] || (c[7] = (k) => n("chapters"))
          }, g(t(o).backChapters), 1)
        ])) : v.value !== "playing" && !f.value && !e.disabled ? (h(), y("section", Jt, [
          s("span", ea, g(v.value === "won" ? "✓" : "…"), 1),
          s("h2", null, g(v.value === "won" ? t(o).won : v.value === "lost" ? t(o).lost : t(o).abandoned), 1),
          s("p", null, g(v.value === "won" ? e.award ? t(o).reward(e.award) : t(o).earned : r.value ? t(o).paidLost : t(o).lostBody), 1),
          r.value ? (h(), y("p", {
            key: 0,
            "data-next-tier": e.challenge.tier
          }, g(t(o).nextTier(e.challenge.tier)), 9, ta)) : q("", !0),
          v.value === "won" ? (h(), y("button", {
            key: 1,
            type: "button",
            class: "moving-primary",
            onClick: c[8] || (c[8] = (k) => n("next"))
          }, g(r.value ? t(o).admission : e.active.stage < t(be).length - 1 ? t(o).next : t(o).chapterComplete), 1)) : r.value ? (h(), y("button", {
            key: 3,
            type: "button",
            class: "moving-primary",
            onClick: c[10] || (c[10] = (k) => n("next"))
          }, g(t(o).admission), 1)) : (h(), y("button", {
            key: 2,
            type: "button",
            class: "moving-primary",
            onClick: c[9] || (c[9] = (k) => n("undo"))
          }, g(t(o).undo), 1)),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: c[11] || (c[11] = (k) => n("chapters"))
          }, g(t(o).backChapters), 1)
        ])) : q("", !0)
      ]),
      s("footer", aa, [
        s("div", na, [s("strong", null, [ie(g(t(o).tray) + " ", 1), s("small", null, g(t(o).slots(e.board.tray.length, t(7))), 1)]), s("p", ia, g(w.value), 1)]),
        s("ol", {
          class: ue(["moving-tray", { "is-full": v.value === "lost" }]),
          "aria-label": t(o).tray,
          style: we({ "--moving-capacity": t(7) })
        }, [(h(!0), y(ae, null, ce(X.value, (k, Y) => (h(), y("li", {
          key: Y,
          "aria-label": t(o).slot(k ? t(de)[k.kind] : t(o).emptySlot, Y),
          class: ue({ "is-filled": k })
        }, [k ? (h(), Oe(le, {
          key: 0,
          kind: k.kind
        }, null, 8, ["kind"])) : (h(), y("span", ra, "·"))], 10, la))), 128))], 14, oa),
        s("div", sa, [
          r.value ? q("", !0) : (h(), y("button", {
            key: 0,
            type: "button",
            disabled: e.disabled || f.value || !e.active.moves.length,
            onClick: c[12] || (c[12] = (k) => n("undo"))
          }, "↩ " + g(t(o).undo), 9, da)),
          s("button", {
            type: "button",
            disabled: e.disabled || f.value || !!j.value || v.value !== "playing",
            onClick: R
          }, "⌕ " + g(t(o).pickList), 9, ca),
          r.value ? (h(), y("button", {
            key: 2,
            type: "button",
            disabled: e.disabled || f.value || v.value !== "playing",
            onClick: c[14] || (c[14] = (k) => n("abandon"))
          }, g(t(o).abandon), 9, fa)) : (h(), y("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || f.value,
            onClick: c[13] || (c[13] = (k) => n("restart"))
          }, "↻ " + g(t(o).restart), 9, ua)),
          s("button", {
            type: "button",
            disabled: e.disabled || u.value || !t(m).available,
            "aria-pressed": P.value,
            onClick: D
          }, g(P.value ? t(o).soundOn : t(o).soundOff), 9, va)
        ])
      ]),
      _.value ? (h(), y("div", {
        key: 0,
        class: "moving-modal-backdrop",
        onClick: c[17] || (c[17] = je((k) => _.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: A,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-board-dialog",
        tabindex: "-1"
      }, [s("header", null, [s("h2", pa, g(_.value === "rules" ? t(o).rules : t(o).pickListTitle), 1), s("button", {
        type: "button",
        "aria-label": t(o).close,
        onClick: c[15] || (c[15] = (k) => _.value = null)
      }, "×", 8, ba)]), _.value === "rules" ? (h(), y(ae, { key: 0 }, [
        s("ol", ma, [(h(!0), y(ae, null, ce(t(o).instructions, (k) => (h(), y("li", { key: k }, g(k), 1))), 128))]),
        r.value ? (h(), y("p", ga, g(t(o).admissionBody), 1)) : q("", !0),
        s("p", ha, g(t(o).sessionNote), 1)
      ], 64)) : (h(), y("div", {
        key: 1,
        class: "moving-stack-overview",
        style: we({ "--stack-count": W.value.length })
      }, [(h(!0), y(ae, null, ce(W.value, (k, Y) => (h(), y("section", { key: Y }, [s("h3", null, g(t(o).shelf(Y)), 1), (h(!0), y(ae, null, ce(k, (G, ee) => (h(), y(ae, { key: G.id }, [ee === 0 ? (h(), y("button", {
        key: 0,
        type: "button",
        "data-item-id": G.id,
        disabled: !F.value.includes(G.id),
        "aria-label": t(o).item(t(de)[G.kind], Y + 1),
        onFocus: (O) => t(E)?.focus(G.id),
        onBlur: c[16] || (c[16] = (O) => t(E)?.focus(null)),
        onClick: (O) => te({
          type: "pick",
          id: G.id
        })
      }, [re(le, { kind: G.kind }, null, 8, ["kind"]), s("span", null, g(t(o).available), 1)], 40, ya)) : (h(), y("div", {
        key: 1,
        "aria-label": `${t(de)[G.kind]} · ${t(o).underneath}`
      }, [re(le, { kind: G.kind }, null, 8, ["kind"])], 8, ka))], 64))), 128))]))), 128))], 4))], 512)])) : q("", !0)
    ], 10, Ft));
  }
}), xa = wa, Ma = {
  key: 0,
  class: "moving-account"
}, Ca = { role: "status" }, $a = {
  key: 1,
  class: "moving-save-notice",
  role: "alert"
}, _a = ["disabled"], Sa = ["disabled"], Ea = {
  key: 2,
  class: "moving-loading",
  role: "status"
}, Ia = ["aria-label"], Aa = { class: "moving-chapter-card chapter-home" }, Pa = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, La = { class: "moving-chapter-title" }, za = { class: "moving-stage-path" }, Ta = [
  "data-stage",
  "aria-label",
  "disabled",
  "onClick"
], Ra = { class: "moving-chapter-card chapter-witch" }, Ba = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, Fa = { class: "moving-chapter-title" }, Oa = ["data-tier"], ja = {
  key: 0,
  class: "moving-session-note"
}, Va = ["disabled"], Na = {
  key: 1,
  class: "moving-session-note"
}, Da = { class: "moving-session-note" }, Ga = {
  key: 5,
  class: "moving-generating",
  role: "status"
}, Ha = { id: "moving-confirm-title" }, qa = ["aria-label"], Ya = ["data-tier"], Za = { class: "moving-confirm-actions" }, Wa = ["disabled"], Xa = /* @__PURE__ */ xe({
  __name: "MovingRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const d = e, a = kt(d.bridge, d.chatIdentity), { view: n, busy: i, blocked: r, notice: v, generating: l, failed: f } = a, u = K("chapters"), m = K(null), P = K(null), w = K(!1);
    let j = !1;
    const C = U(() => n.value?.active ?? null), A = U(() => !!C.value && C.value.stage === null && Te(C.value) === "playing"), _ = U(() => n.value?.completed.length === be.length), F = U(() => r.value || w.value || d.generationActive);
    Ve(P, () => {
      m.value = null;
    }), Ze(() => u.value !== "board" ? !1 : (u.value = "chapters", !0));
    async function X(T) {
      await a.act({
        type: "start",
        stage: T
      }) && (u.value = "board");
    }
    async function W() {
      const T = m.value;
      T && (m.value = null, await a.act({ type: T === "admission" ? "challenge" : T }) && (u.value = "board"));
    }
    function E() {
      A.value ? u.value = "board" : m.value = "admission";
    }
    async function Z() {
      C.value && (C.value.stage !== null && C.value.stage < be.length - 1 ? await X(C.value.stage + 1) : E());
    }
    return Be(async () => {
      await a.read(), C.value && (u.value = "board"), j = !0;
    }), Re(() => {
      j && a.read();
    }), Fe(a.dispose), (T, $) => (h(), y("div", { class: ue(["moving-app", { "moving-app-board": u.value === "board" }]) }, [
      t(n) ? (h(), y("div", Ma, [s("span", null, g(t(o).balance(t(n).balance)), 1), s("small", Ca, g(e.generationActive ? t(o).storyBusy : t(i) ? t(l) ? t(o).generating : t(o).saving : t(n).writeState === "ready" && !t(f) ? t(o).saved : ""), 1)])) : q("", !0),
      t(v) || t(f) || t(n)?.pending || t(n)?.writeState === "failed" ? (h(), y("aside", $a, [
        s("p", null, g(t(v) || t(o).saveProblem), 1),
        s("button", {
          type: "button",
          disabled: t(i),
          onClick: $[0] || ($[0] = (...I) => t(a).recover && t(a).recover(...I))
        }, g(t(o).recover), 9, _a),
        t(n)?.writeState === "conflict" ? (h(), y("button", {
          key: 0,
          type: "button",
          disabled: t(i),
          onClick: $[1] || ($[1] = (...I) => t(a).read && t(a).read(...I))
        }, g(t(o).refresh), 9, Sa)) : q("", !0)
      ])) : q("", !0),
      t(n) ? u.value === "board" && C.value && t(n).board ? (h(), Oe(xa, {
        key: C.value.id,
        active: C.value,
        board: t(n).board,
        disabled: t(r) || e.generationActive,
        award: t(n).award,
        challenge: t(n).challenge,
        "sound-enabled": t(n).soundEnabled,
        "set-sound-enabled": t(a).setSoundEnabled,
        onPick: $[2] || ($[2] = (I) => t(a).act({
          type: "pick",
          id: I
        })),
        onUndo: $[3] || ($[3] = (I) => t(a).act({ type: "undo" })),
        onRestart: $[4] || ($[4] = (I) => m.value = "restart"),
        onAbandon: $[5] || ($[5] = (I) => m.value = "abandon"),
        onChapters: $[6] || ($[6] = (I) => u.value = "chapters"),
        onNext: Z,
        onAnimation: $[7] || ($[7] = (I) => w.value = I)
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
        C.value && t(Te)(C.value) === "playing" ? (h(), y("button", {
          key: 0,
          type: "button",
          class: "moving-resume",
          onClick: $[8] || ($[8] = (I) => u.value = "board")
        }, [s("span", null, g(t(o).resume) + " · " + g(t(ve)[C.value.level.id]), 1), $[12] || ($[12] = s("span", { "aria-hidden": "true" }, "→", -1))])) : q("", !0),
        s("article", Aa, [
          s("div", Pa, [re(le, { kind: "cat" }), re(le, { kind: "plant" })]),
          s("div", La, [
            s("small", null, g(t(o).chapterOne), 1),
            s("h2", null, g(t(ve).weekend), 1),
            s("p", null, g(t(o).firstReward), 1)
          ]),
          s("ol", za, [(h(!0), y(ae, null, ce(t(be), (I, L) => (h(), y("li", { key: I.key }, [s("button", {
            type: "button",
            "data-stage": L,
            "aria-label": t(o).stage(L),
            disabled: F.value || A.value || L > t(n).completed.length,
            class: ue({ "is-cleared": t(n).completed.includes(L) }),
            onClick: (B) => X(L)
          }, [s("strong", null, g(L + 1), 1), s("small", null, g(t(n).completed.includes(L) ? "✓" : "+" + t(ge).chapterReward), 1)], 10, Ta)]))), 128))])
        ]),
        s("article", Ra, [
          s("div", Ba, [re(le, { kind: "potion" }), re(le, { kind: "star" })]),
          s("div", Fa, [
            s("small", null, [ie(g(t(o).chapterTwo) + " · ", 1), s("span", { "data-tier": t(n).challenge.tier }, g(t(Ne)[t(n).challenge.tier]), 9, Oa)]),
            s("h2", null, g(t(ve).witch), 1),
            s("p", null, g(t(o).challengeTerms), 1)
          ]),
          _.value ? (h(), y("p", ja, g(t(o).tierProgress(t(n).challenge)), 1)) : q("", !0),
          s("button", {
            type: "button",
            class: "moving-primary",
            disabled: F.value || !_.value || !A.value && t(n).balance < t(ge).challengeFee,
            onClick: E
          }, g(A.value ? t(o).resume : _.value ? t(o).admission : t(o).challengeLocked), 9, Va),
          _.value && !A.value && t(n).balance < t(ge).challengeFee ? (h(), y("p", Na, g(t(o).noFunds), 1)) : q("", !0)
        ]),
        s("p", Da, g(t(o).sessionNote), 1)
      ], 8, Ia)) : q("", !0) : (h(), y("p", Ea, g(t(o).loading), 1)),
      t(l) ? (h(), y("div", Ga, g(t(o).generating), 1)) : q("", !0),
      m.value ? (h(), y("div", {
        key: 6,
        class: "moving-modal-backdrop moving-room-theme",
        onClick: $[11] || ($[11] = je((I) => m.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: P,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-confirm-title",
        tabindex: "-1"
      }, [
        s("header", null, [s("h2", Ha, g(m.value === "admission" && t(n) ? t(o).admissionTitle(t(n).challenge.tier) : m.value === "abandon" ? t(o).abandonTitle : t(o).restartTitle), 1), s("button", {
          type: "button",
          "aria-label": t(o).close,
          onClick: $[9] || ($[9] = (I) => m.value = null)
        }, "×", 8, qa)]),
        s("p", null, g(m.value === "admission" ? t(o).admissionBody : m.value === "abandon" ? t(o).abandonBody : t(o).discard), 1),
        m.value === "admission" && t(n) ? (h(), y("p", {
          key: 0,
          class: "moving-session-note",
          "data-tier": t(n).challenge.tier
        }, [
          ie(g(t(o).tierProgress(t(n).challenge)), 1),
          $[13] || ($[13] = s("br", null, null, -1)),
          ie(g(t(o).tierRule), 1)
        ], 8, Ya)) : q("", !0),
        s("div", Za, [s("button", {
          type: "button",
          class: "moving-plain",
          onClick: $[10] || ($[10] = (I) => m.value = null)
        }, g(t(o).cancel), 1), s("button", {
          type: "button",
          class: "moving-primary",
          disabled: F.value,
          onClick: W
        }, g(m.value === "admission" ? t(o).admission : t(o).confirm), 9, Wa)])
      ], 512)])) : q("", !0)
    ], 2));
  }
}), tn = Xa;
export {
  tn as default
};
