/* eslint-disable */
import { $ as de, A as qe, D as Re, E as Ye, F as g, H as Le, L as se, M as Be, O as Oe, Q as t, X as ke, Y as W, _ as h, b as oe, et as we, g as G, h as Fe, l as je, m as s, p as U, tt as b, u as te, v as le, x as xe, y as ae } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as Ze, r as Ve } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { a as fe, i as We, n as re, o as Ke, r as o, s as he, t as Ne } from "./xiaobai-os-copy-BtVqW5Q2.js";
import { $ as Xe, Ft as Pe, It as ve, Ot as Ue, Pt as Qe, S as Je, St as et, Y as tt, a as at, g as ze, m as nt, ot as it, t as ot, u as lt, vt as rt, x as Me, xt as st } from "./xiaobai-os-three.module-DlsF37OG.js";
import { t as dt } from "./xiaobai-os-RoundedBoxGeometry-DfNp4gEJ.js";
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
  const n = e.items.find((c) => c.id === a.id);
  if (!n || !d.remaining.includes(n.id)) return {
    ok: !1,
    reason: "missing"
  };
  if (!Ce(d, n)) return {
    ok: !1,
    reason: "blocked"
  };
  const i = [...d.tray], r = (c) => e.items.find((y) => y.id === c).kind === n.kind, v = i.reduce((c, y, A) => r(y) ? A : c, -1);
  i.splice(v < 0 ? i.length : v + 1, 0, n.id);
  const l = i.filter(r), u = l.length === 3 ? l : [];
  return {
    ok: !0,
    packed: u,
    state: {
      remaining: d.remaining.filter((c) => c !== n.id),
      tray: i.filter((c) => !u.includes(c))
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
var ne = [
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
], pt = 0.51, tn = {
  lanes: ne.length,
  depth: De.length * 3 / ne.length
}, mt = [
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
function bt(e, d, a, n) {
  const i = e.map((r, v) => r.map((l, u) => `s${v}-${u}`));
  return {
    id: d,
    key: a,
    seed: n,
    items: e.flatMap((r, v) => r.map((l, u) => {
      const [c, y, A] = ne[v];
      return {
        id: i[v][u],
        kind: l,
        above: u ? i[v][u - 1] : null,
        position: [
          c + (u % 2 ? 0.18 : -0.18),
          y + (r.length - u - 1) * pt + 0.32,
          A
        ]
      };
    })),
    stacks: i
  };
}
var pe = mt.map((e, d) => bt(vt(De.slice(0, e.count), e.lanes, ft(e.seed)), "weekend", `chapter-${d + 1}`, e.seed));
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
  const a = ke(null), n = W(!1), i = W(""), r = W(!1), v = ke(null);
  let l = !1, u = null;
  const c = U(() => n.value || !!v.value || !a.value?.ready || a.value.writeState !== "ready" || a.value.pending);
  function y($) {
    l || (a.value = $);
  }
  async function A($, z) {
    if (l || n.value) return !1;
    n.value = !0, u = null, r.value = z?.command.type === "challenge", i.value = "";
    try {
      const _ = await e.request(`game/moving/${$}`, {
        chatIdentity: d,
        ...z
      }, 35e3), B = u;
      return y(B && B.revision >= _.result.revision ? B : _.result), a.value?.writeState === "ready" && !a.value.pending && (v.value = null), !0;
    } catch (_) {
      if (!l) {
        u && y(u), i.value = Ke(_);
        const B = _ && typeof _ == "object" && "code" in _ ? String(_.code) : _ instanceof Error ? _.message : "";
        z && (B.startsWith("moving_save_") || B.startsWith("host_request_")) && (v.value = z);
      }
      return !1;
    } finally {
      l || (n.value = !1, r.value = !1);
    }
  }
  const M = e.subscribe(($) => {
    if (l || $.type !== "game/moving/state") return;
    const z = $.payload;
    z.chatIdentity === d && (n.value ? u = z.state : y(z.state));
  });
  async function F() {
    const $ = v.value;
    !await A("confirm") || !a.value || a.value.writeState !== "ready" || a.value.pending || $ && a.value.revision === $.revision && await A("act", $);
  }
  return {
    view: a,
    busy: n,
    error: i,
    generating: r,
    blocked: c,
    failed: v,
    notice: U(() => i.value || (a.value?.writeState === "conflict" ? o.conflict : a.value?.pending || a.value?.writeState === "unconfirmed" ? o.saveProblem : "")),
    read: () => A("read"),
    recover: F,
    act: ($) => c.value ? Promise.resolve(!1) : A("act", {
      actionId: yt(),
      revision: a.value.revision,
      command: $
    }),
    dispose() {
      l = !0, M();
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
        const l = e.createOscillator(), u = e.createGain(), c = e.currentTime + v * 0.09;
        l.type = "sine", l.frequency.value = r, u.gain.setValueAtTime(0, c), u.gain.linearRampToValueAtTime(0.065, c + 0.015), u.gain.exponentialRampToValueAtTime(1e-3, c + 0.25), l.connect(u), u.connect(e.destination), l.start(c), l.stop(c + 0.27), l.onended = () => {
          l.disconnect(), u.disconnect();
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
function ue(e, d) {
  const a = new Me(), n = He[d], i = (r, v, l = 0.1) => {
    for (const u of [-l, l]) e.ball(a, [
      0.025,
      0.038,
      0.02
    ], "#343447", [
      u,
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
    d.has(i) || d.set(i, r()), e.has(v) || e.set(v, new Xe({
      color: v,
      roughness: 0.55,
      metalness: 0.02
    }));
    const u = new tt(d.get(i), e.get(v));
    return u.position.set(...l), u.castShadow = !0, u.receiveShadow = !0, n.add(u), u;
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
      const u = Math.min(l, ...i.map((c) => c / 2));
      return a(n, `b:${i}:${u}`, () => new dt(...i, 2, u), r, v);
    },
    ball(n, i, r, v) {
      const l = a(n, "ball", () => new Ue(1, 16, 12), r, v);
      return l.scale.set(...i), l;
    },
    cylinder(n, i, r, v, l, u, c = 24) {
      return a(n, `c:${i}:${r}:${v}:${c}`, () => new nt(i, r, v, c), l, u);
    },
    ring(n, i, r, v, l) {
      return a(n, `t:${i}:${r}`, () => new Qe(i, r, 8, 32), v, l);
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
  const d = xt(), a = new Me(), n = Mt[e.id], i = d.group(a), r = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), l = d.box, u = d.ball;
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
  for (let f = -4; f <= 4; f++) l(i, [
    0.014,
    9e-3,
    8.15
  ], "#e5ddd2", [
    f,
    8e-3,
    0.1
  ], 0);
  for (const f of [
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
    f
  ], 0);
  const c = l(i, [
    5.9,
    0.055,
    3.15
  ], n.rug, [
    0,
    0.035,
    1.45
  ], 0.025);
  c.rotation.y = -0.035;
  for (let f = 0; f < 14; f++) l(i, [
    0.055,
    0.025,
    0.18
  ], "#fffdf6", [
    -2.6 + f * 0.4,
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
  ], 0.05), u(i, [
    0.25,
    0.25,
    0.04
  ], "#fff0ba", [
    0.98,
    3.48,
    -3.2
  ]), e.id === "witch") {
    u(i, [
      0.22,
      0.22,
      0.045
    ], "#b6bde9", [
      1.1,
      3.56,
      -3.15
    ]);
    for (const [f, L] of [
      [-0.25, 3.55],
      [0.15, 2.85],
      [0.85, 2.8]
    ]) {
      const k = ue(d, "star");
      k.position.set(f, L, -3.17), k.scale.setScalar(0.25), i.add(k);
    }
  } else for (const f of [
    -0.3,
    -0.05,
    0.2
  ]) u(i, [
    0.22,
    0.11,
    0.025
  ], "#f8fcff", [
    f,
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
  for (const f of [-1.12, 1.82]) l(i, [
    0.42,
    1.8,
    0.25
  ], e.id === "witch" ? "#c4b2e7" : "#f4c4bf", [
    f,
    3.15,
    -3.12
  ], 0.1);
  const [y, A, M] = ne[0];
  if (e.id === "weekend") {
    l(i, [
      3,
      0.45,
      1.42
    ], n.seat, [
      y,
      A - 0.3,
      M
    ], 0.18), l(i, [
      3,
      0.85,
      0.32
    ], n.seat, [
      y,
      A + 0.25,
      M - 0.67
    ], 0.15);
    for (const f of [y - 1.35, y + 1.35]) l(i, [
      0.3,
      0.65,
      1.48
    ], n.seat, [
      f,
      A,
      M
    ], 0.14);
    for (const f of [
      y - 0.8,
      y,
      y + 0.8
    ]) l(i, [
      0.73,
      0.18,
      1.05
    ], "#ffd7d9", [
      f,
      A - 0.04,
      M
    ], 0.08);
  } else {
    l(i, [
      3.05,
      0.64,
      1.5
    ], n.seat, [
      y,
      A - 0.35,
      M
    ], 0.1), l(i, [
      3.2,
      0.15,
      1.6
    ], "#fff6e8", [
      y,
      A - 0.04,
      M
    ], 0.06);
    for (const L of [y - 0.9, y + 0.9])
      l(i, [
        0.68,
        0.38,
        0.035
      ], "#8699be", [
        L,
        0.31,
        M + 0.77
      ], 0.06), u(i, [
        0.055,
        0.055,
        0.03
      ], "#f6d38b", [
        L,
        0.52,
        M + 0.8
      ]);
    const f = d.group(i, [
      -3.42,
      0.46,
      0.7
    ]);
    u(f, [
      0.47,
      0.4,
      0.43
    ], "#9c91c5", [
      0,
      0,
      0
    ]), d.ring(f, 0.36, 0.06, "#c0b1e1", [
      0,
      0.26,
      0
    ]).rotation.x = Math.PI / 2, d.cylinder(f, 0.33, 0.33, 0.018, "#a8edcf", [
      0,
      0.26,
      0
    ]);
    for (const L of [-0.48, 0.48]) d.ring(f, 0.1, 0.03, "#dfcfa1", [
      L,
      0.06,
      0
    ]);
    for (const [L, k] of [
      [-0.16, 0.48],
      [0.1, 0.74],
      [0.21, 0.43]
    ]) u(f, [
      0.095,
      0.095,
      0.095
    ], "#c2f5df", [
      L,
      k,
      0
    ]);
  }
  const [F, $, z] = ne[1];
  l(i, [
    2.35,
    $,
    1.45
  ], n.cabinet, [
    F,
    $ / 2,
    z
  ], 0.09), l(i, [
    2.48,
    0.13,
    1.56
  ], "#fff7e6", [
    F,
    $,
    z
  ], 0.05);
  for (const f of [0.25, 0.62])
    l(i, [
      2.12,
      0.27,
      0.04
    ], n.trim, [
      F,
      f,
      z + 0.75
    ], 0.03), l(i, [
      0.45,
      0.055,
      0.08
    ], "#fff7e6", [
      F,
      f,
      z + 0.81
    ], 0.02);
  const [_, B, K] = ne[2];
  l(i, [
    1.85,
    B,
    1.45
  ], "#e9be94", [
    _,
    B / 2,
    K
  ], 0.06), l(i, [
    0.2,
    B + 0.016,
    1.48
  ], "#ffe5b7", [
    _,
    B / 2,
    K
  ], 0.01), l(i, [
    0.5,
    0.25,
    0.02
  ], "#fff7e6", [
    _ - 0.45,
    0.35,
    K + 0.74
  ], 0.03);
  const [Z, E, q] = ne[3];
  l(i, [
    2.15,
    0.13,
    1.35
  ], e.id === "witch" ? "#c1d8f0" : "#f5d6ac", [
    Z,
    E,
    q
  ], 0.055);
  for (const f of [Z - 0.7, Z + 0.7]) l(i, [
    0.11,
    E,
    0.8
  ], n.trim, [
    f,
    E / 2,
    q
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
  for (const [f, L] of [["plant", 3], ["cup", 3.53]]) {
    const k = ue(d, f);
    k.position.set(L, 3.76, -2.96), k.scale.setScalar(0.7), i.add(k);
  }
  const T = d.group(i, [
    -4.25,
    2.55,
    0.05
  ]);
  T.rotation.y = Math.PI / 2, l(T, [
    1,
    1.1,
    0.09
  ], "#fff7e8", [
    0,
    0,
    0
  ], 0.04), l(T, [
    0.82,
    0.9,
    0.03
  ], "#cddff3", [
    0,
    0,
    0.06
  ], 0.025);
  const C = ue(d, e.id === "witch" ? "potion" : "cat");
  C.scale.setScalar(0.8), C.position.set(0, -0.08, 0.15), T.add(C);
  for (const f of e.items) {
    const L = ue(d, f.kind);
    l(L, [
      0.93,
      0.085,
      0.76
    ], "#fff9e9", [
      0,
      -0.29,
      0
    ], 0.035);
    for (const m of [-0.34, 0.34]) u(L, [
      0.1,
      0.055,
      0.25
    ], "#f4e8d5", [
      m,
      -0.23,
      0
    ]);
    L.position.set(...f.position), L.userData.itemId = f.id, a.add(L), r.set(f.id, L);
    const k = d.group(a, [
      f.position[0],
      f.position[1] - 0.27,
      f.position[2]
    ]);
    d.ring(k, 0.47, 0.023, "#eaba61", [
      0,
      0,
      0
    ]).rotation.x = Math.PI / 2, v.set(f.id, k);
  }
  const S = d.group(a, [
    -3.05,
    0.52,
    3.55
  ]);
  u(S, [
    0.32,
    0.4,
    0.27
  ], "#fffaf2", [
    0,
    0.1,
    0
  ]);
  for (const f of [-0.2, 0.2])
    u(S, [
      0.09,
      0.17,
      0.085
    ], "#fffaf2", [
      f,
      0.48,
      0
    ]), u(S, [
      0.065,
      0.07,
      0.1
    ], "#667486", [
      f * 0.75,
      -0.28,
      0.06
    ]), u(S, [
      0.028,
      0.039,
      0.02
    ], "#354353", [
      f * 0.5,
      0.22,
      0.252
    ]), u(S, [
      0.052,
      0.028,
      0.025
    ], "#f0afb0", [
      f * 0.8,
      0.12,
      0.242
    ]);
  const R = d.group(S, [
    0,
    -0.03,
    0.37
  ]);
  l(R, [
    0.47,
    0.35,
    0.33
  ], "#dfb084", [
    0,
    0,
    0
  ], 0.035), l(R, [
    0.08,
    0.36,
    0.34
  ], "#ffe6b8", [
    0,
    0,
    0
  ], 8e-3), R.visible = !1;
  const O = d.group(a, [
    3.6,
    0.1,
    3.55
  ]);
  for (let f = 0; f < e.items.length / 3; f++) {
    const L = l(O, [
      0.4,
      0.26,
      0.4
    ], f % 2 ? "#e2b585" : "#efcba2", [
      f % 2 * 0.43 - 0.25,
      Math.floor(f / 2) * 0.28 + 0.14,
      0
    ], 0.03);
    L.visible = !1;
  }
  const J = d.ring(a, 0.49, 0.03, "#e6ac44", [
    0,
    0.1,
    0
  ]);
  return J.rotation.x = -Math.PI / 2, J.visible = !1, J.castShadow = !1, {
    root: a,
    items: r,
    markers: v,
    mascot: S,
    parcel: R,
    shipped: O,
    halo: J,
    dispose: () => d.dispose()
  };
}
var ye = 0.42;
function $t() {
  return new it(-7, 7, 7, -7, 0.1, 100);
}
function _t(e, d, a, n) {
  e.position.set(Math.sin(n) * 18, 13.5, Math.cos(n) * 18), e.lookAt(0, 1, 0.1), e.updateMatrixWorld(!0);
  const i = new at(new ve(-4.8, -0.8, -3.7), new ve(4.8, 4.7, 4.4));
  let r = 0, v = 0;
  for (const c of [i.min.x, i.max.x]) for (const y of [i.min.y, i.max.y]) for (const A of [i.min.z, i.max.z]) {
    const M = new ve(c, y, A).applyMatrix4(e.matrixWorldInverse);
    r = Math.max(r, Math.abs(M.x)), v = Math.max(v, Math.abs(M.y));
  }
  const l = d / a, u = Math.max(v, r / l) * 1.035;
  e.top = u, e.bottom = -u, e.left = -u * l, e.right = -e.left, e.updateProjectionMatrix();
}
function St(e, d, a, n) {
  const i = new et(), r = $t(), v = new rt(), l = new Pe(), u = new Pe(), c = Ct(d), y = c.mascot.position.clone(), A = new AbortController();
  let M, F, $, z = !1, _ = !1, B = !0, K = !0, Z = 0, E = 0, q = 0, T = ye;
  const C = 0.86;
  let S = a, R = null, O = null;
  const J = matchMedia("(prefers-reduced-motion: reduce)");
  let f;
  const L = new ze("#fff4df", 3.1);
  L.position.set(-3, 10, 7), L.castShadow = !0, L.shadow.mapSize.set(1024, 1024), Object.assign(L.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 0.5,
    far: 30
  }), L.shadow.normalBias = 0.025, L.shadow.bias = -15e-5, i.add(new Je("#f3f8ff", "#b6b2b0", 2.1), L, c.root);
  const k = new ze("#dbeaff", 0.7);
  k.position.set(6, 5, -3), i.add(k);
  function m() {
    for (const x of d.items) {
      const P = c.items.get(x.id);
      P.visible = S.remaining.includes(x.id), P.position.set(...x.position), P.scale.setScalar(C), c.markers.get(x.id).visible = Ce(S, x);
    }
    c.mascot.position.copy(y), c.mascot.rotation.y = 0, c.parcel.visible = !1, c.shipped.children.forEach((x, P) => {
      x.visible = P < Ge(d, S);
    });
  }
  function w() {
    const x = f;
    f = void 0, m(), x?.done();
  }
  function Y() {
    Z && (cancelAnimationFrame(Z), Z = 0);
  }
  function H(x, P) {
    z || _ || (_ = !0, Y(), w(), n.error(x, P));
  }
  function X() {
    _t(r, E, q, T);
  }
  function ee(x) {
    if (Z = 0, !(z || _ || !B || !K || document.hidden || E <= 0 || q <= 0))
      try {
        if (f) {
          const p = Math.min(1, (x - f.started) / f.duration), j = f.action;
          if (j?.type === "pick") {
            const N = d.items.find((Q) => Q.id === j.id), I = c.items.get(N.id), V = Math.min(1, p * (f.packed ? 4 : 1));
            if (I.visible = V < 1, I.position.set(...N.position).lerp(y.clone().add(new ve(0, 0.43, 0)), V), I.position.y += Math.sin(V * Math.PI) * 1.4, I.scale.setScalar(C * (1 - V * 0.7)), f.packed) {
              const Q = Math.max(0, (p - 0.2) / 0.8);
              c.parcel.visible = Q > 0 && Q < 0.92, c.mascot.position.x = y.x + Q * (c.shipped.position.x - y.x), c.mascot.position.y = y.y + Math.abs(Math.sin(Q * 22)) * 0.1, c.mascot.rotation.y = 0.6;
            }
          }
          p >= 1 && w();
        }
        const P = R ? c.items.get(R) : void 0;
        c.halo.visible = !!P?.visible, P?.visible && (c.halo.position.copy(P.position), c.halo.position.y -= 0.28), M.getSize(u), (u.x !== E || u.y !== q) && M.setSize(E, q, !1), M.render(i, r), f && D();
      } catch (P) {
        H("graphicsFailed", P);
      }
  }
  function D() {
    !Z && !z && !_ && B && K && !document.hidden && E > 0 && q > 0 && (Z = requestAnimationFrame(ee));
  }
  function be() {
    const x = e.getBoundingClientRect();
    if (E = x.width, q = x.height, E <= 0 || q <= 0) {
      Y();
      return;
    }
    X(), D();
  }
  function ge(x, P) {
    const p = M.domElement.getBoundingClientRect();
    l.set((x - p.left) / p.width * 2 - 1, -(P - p.top) / p.height * 2 + 1), v.setFromCamera(l, r);
    const j = v.intersectObject(c.root, !0);
    for (const N of j) {
      let I = N.object, V = !0;
      for (; I; ) {
        if (!I.visible) {
          V = !1;
          break;
        }
        I = I.parent;
      }
      if (!(!V || N.object === c.halo || [...c.markers.values()].some((Q) => N.object.parent === Q))) {
        for (I = N.object; I; ) {
          if (I.userData.itemId) return {
            type: "pick",
            id: I.userData.itemId
          };
          I = I.parent;
        }
        return null;
      }
    }
    return null;
  }
  function $e(x, P) {
    const p = ge(x, P);
    if (p?.type === "pick") return p;
    const j = M.domElement.getBoundingClientRect(), N = d.items.flatMap((I) => {
      const V = c.items.get(I.id);
      if (!V.visible) return [];
      const Q = V.position.clone().project(r), Ie = j.left + (Q.x + 1) * j.width / 2, Ee = j.top + (1 - Q.y) * j.height / 2, Ae = Math.hypot(x - Ie, P - Ee);
      return Ae <= 22 ? [{
        id: I.id,
        x: Ie,
        y: Ee,
        distance: Ae
      }] : [];
    }).sort((I, V) => I.distance - V.distance);
    for (const I of N) {
      const V = ge(I.x, I.y);
      if (V?.type === "pick" && V.id === I.id) return V;
    }
    return p;
  }
  function ce(x) {
    r.zoom = Math.max(1, Math.min(1.8, r.zoom * x)), r.updateProjectionMatrix(), D();
  }
  function _e(x) {
    T = Math.max(-0.15, Math.min(1.05, T + x)), X(), D();
  }
  function Se() {
    z || (z = !0, Y(), w(), A.abort(), F?.disconnect(), $?.disconnect(), c.dispose(), L.shadow.dispose(), i.clear(), M?.dispose(), M?.forceContextLoss(), M?.domElement.remove());
  }
  try {
    M = new ot({
      alpha: !0,
      antialias: !0,
      powerPreference: "low-power"
    }), M.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)), M.setClearColor(new lt("#e6f1ed"), 0), M.outputColorSpace = st, M.toneMapping = 7, M.shadowMap.enabled = !0, M.shadowMap.type = 2, M.debug.onShaderError = () => H("graphicsFailed");
    const x = M.domElement;
    x.setAttribute("aria-label", o.sceneLabel), x.setAttribute("role", "img"), x.tabIndex = 0, e.prepend(x);
    const P = { signal: A.signal };
    x.addEventListener("webglcontextlost", (p) => {
      p.preventDefault(), H("contextLost");
    }, P), x.addEventListener("pointerdown", (p) => {
      p.button !== 0 || O || f || (x.setPointerCapture(p.pointerId), O = {
        id: p.pointerId,
        x: p.clientX,
        y: p.clientY,
        yaw: T,
        dragged: !1
      });
    }, P), x.addEventListener("pointermove", (p) => {
      if (!O) {
        if (f || p.pointerType !== "mouse") return;
        const I = $e(p.clientX, p.clientY), V = I?.type === "pick" ? I.id : null;
        x.style.cursor = I ? "pointer" : "grab", R !== V && (R = V, D());
        return;
      }
      if (O.id !== p.pointerId) return;
      const j = p.clientX - O.x, N = p.clientY - O.y;
      Math.hypot(j, N) > 7 && (O.dragged = !0), O.dragged && (T = Math.max(-0.15, Math.min(1.05, O.yaw - j / E * 2.4)), X(), D());
    }, P), x.addEventListener("pointerleave", () => {
      R && (R = null, D());
    }, P), x.addEventListener("pointerup", (p) => {
      if (!O || O.id !== p.pointerId) return;
      const j = O.dragged;
      if (O = null, x.hasPointerCapture(p.pointerId) && x.releasePointerCapture(p.pointerId), !j && !f) {
        const N = $e(p.clientX, p.clientY);
        N && n.action(N);
      }
    }, P);
    for (const p of ["pointercancel", "lostpointercapture"]) x.addEventListener(p, () => {
      O = null;
    }, P);
    return x.addEventListener("keydown", (p) => {
      p.key === "ArrowLeft" || p.key === "ArrowRight" ? (p.preventDefault(), _e(p.key === "ArrowLeft" ? -0.14 : 0.14)) : p.key === "Home" ? (p.preventDefault(), T = ye, r.zoom = 1, X(), D()) : p.key === "+" || p.key === "=" ? (p.preventDefault(), ce(1.15)) : p.key === "-" && (p.preventDefault(), ce(1 / 1.15));
    }, P), x.addEventListener("wheel", (p) => {
      p.preventDefault(), ce(p.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, {
      ...P,
      passive: !1
    }), document.addEventListener("visibilitychange", () => {
      document.hidden ? (Y(), w(), O = null) : D();
    }, P), J.addEventListener("change", () => {
      w(), D();
    }, P), F = new ResizeObserver(() => {
      try {
        be();
      } catch (p) {
        H("graphicsFailed", p);
      }
    }), F.observe(e), $ = new IntersectionObserver((p) => {
      K = p[0].isIntersecting, K ? D() : (Y(), w());
    }), $.observe(e), m(), be(), {
      dispose: Se,
      rotate: _e,
      zoom: ce,
      visibleItems() {
        const p = M.domElement.getBoundingClientRect();
        return d.items.filter((j) => {
          const N = c.items.get(j.id);
          if (!N.visible) return !1;
          const I = N.position.clone().project(r);
          if (Math.abs(I.x) > 1 || Math.abs(I.y) > 1) return !1;
          const V = ge(p.left + (I.x + 1) * p.width / 2, p.top + (1 - I.y) * p.height / 2);
          return V?.type === "pick" && V.id === j.id;
        }).map((j) => j.id);
      },
      resetView() {
        T = ye, r.zoom = 1, X(), D();
      },
      focus(p) {
        R = p, D();
      },
      active(p) {
        B = p, p ? be() : (Y(), w(), O = null);
      },
      update(p, j, N = !1) {
        return w(), S = p, m(), J.matches || !B || document.hidden || _ || !K || !j ? (D(), Promise.resolve()) : new Promise((I) => {
          f = {
            started: performance.now(),
            duration: N ? 1100 : 300,
            action: j,
            packed: N,
            done: I
          }, D();
        });
      }
    };
  } catch (x) {
    throw Se(), x;
  }
}
var It = {
  key: 0,
  fill: "currentColor"
}, Et = { key: 1 }, At = { key: 2 }, Lt = { key: 3 }, Pt = { key: 4 }, zt = { key: 5 }, Tt = { key: 6 }, Rt = { key: 7 }, Bt = /* @__PURE__ */ xe({
  __name: "ItemIcon",
  props: { kind: {} },
  setup(e) {
    return (d, a) => (g(), h("svg", {
      viewBox: "0 0 48 48",
      "aria-hidden": "true",
      style: we({ color: t(He)[e.kind] }),
      class: "moving-item-icon"
    }, [e.kind === "cat" ? (g(), h("g", It, [...a[0] || (a[0] = [le('<path d="M11 23 10 6 22 15 29 14 39 6 38 26Z"></path><ellipse cx="24" cy="31" rx="14" ry="12"></ellipse><ellipse cx="24" cy="23" rx="17" ry="13"></ellipse><path d="M38 33q10 5 3 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path><g fill="#354353"><circle cx="18" cy="23" r="1.6"></circle><circle cx="30" cy="23" r="1.6"></circle></g><path d="m22 27 2 2 2-2" fill="#ce778a"></path>', 6)])])) : e.kind === "toast" ? (g(), h("g", Et, [...a[1] || (a[1] = [le('<path d="M9 17C1 2 47 2 39 17v24H9Z" fill="currentColor"></path><path d="M14 19C8 8 40 8 34 19v17H14Z" fill="#ffe9b9"></path><rect x="19" y="18" width="12" height="9" rx="2" fill="#f8ca54" transform="rotate(10 25 22)"></rect><g fill="#354353"><circle cx="19" cy="31" r="1.5"></circle><circle cx="29" cy="31" r="1.5"></circle></g>', 4)])])) : e.kind === "ufo" ? (g(), h("g", At, [...a[2] || (a[2] = [le('<ellipse cx="24" cy="29" rx="22" ry="8" fill="currentColor"></ellipse><path d="M12 27v-5a12 12 0 0 1 24 0v5Z" fill="#b0e4e8"></path><path d="M5 28q19 10 38 0" stroke="#eee4a6" stroke-width="3" fill="none"></path><g fill="#354353"><circle cx="20" cy="23" r="1.5"></circle><circle cx="28" cy="23" r="1.5"></circle></g>', 4)])])) : e.kind === "cup" ? (g(), h("g", Lt, [...a[3] || (a[3] = [le('<path d="M33 17h5c11 0 9 16-4 16" fill="none" stroke="currentColor" stroke-width="5"></path><path d="M7 13h29l-3 24q-12 8-23 0Z" fill="currentColor"></path><ellipse cx="21.5" cy="13" rx="14.5" ry="5" fill="#e7d9fb"></ellipse><ellipse cx="21.5" cy="13" rx="10" ry="3" fill="#806254"></ellipse><g fill="#354353"><circle cx="16" cy="27" r="1.5"></circle><circle cx="26" cy="27" r="1.5"></circle></g>', 5)])])) : e.kind === "duck" ? (g(), h("g", Pt, [...a[4] || (a[4] = [le('<ellipse cx="24" cy="32" rx="18" ry="11" fill="currentColor"></ellipse><circle cx="25" cy="17" r="12" fill="currentColor"></circle><ellipse cx="26" cy="23" rx="8" ry="4" fill="#f49c44"></ellipse><g fill="#354353"><circle cx="20" cy="16" r="1.5"></circle><circle cx="30" cy="16" r="1.5"></circle></g><path d="M11 30q3 8 9 4" fill="none" stroke="#eba93b" stroke-width="2"></path>', 5)])])) : e.kind === "plant" ? (g(), h("g", zt, [...a[5] || (a[5] = [
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
    ])])) : e.kind === "potion" ? (g(), h("g", Tt, [...a[6] || (a[6] = [
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
    ])])) : (g(), h("g", Rt, [...a[7] || (a[7] = [s("path", {
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
}), ie = Bt, Ot = [
  "aria-label",
  "data-status",
  "data-tier",
  "data-level",
  "data-run",
  "aria-busy"
], Ft = { class: "moving-heading" }, jt = ["aria-label"], Vt = { class: "moving-room-number" }, Nt = {
  key: 0,
  class: "moving-tier"
}, Dt = ["aria-label"], Gt = { class: "moving-stage" }, Ht = {
  key: 0,
  class: "moving-view-tools"
}, qt = { class: "moving-rotate" }, Yt = ["aria-label"], Zt = ["aria-label"], Wt = ["aria-label"], Kt = ["aria-label"], Xt = ["aria-label"], Ut = {
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
}, sa = { class: "moving-tools" }, da = ["disabled"], ca = ["disabled"], ua = ["disabled"], fa = ["disabled"], va = ["disabled", "aria-pressed"], pa = { id: "moving-board-dialog" }, ma = ["aria-label"], ba = { class: "moving-rules" }, ga = {
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
    challenge: {}
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
    const a = e, n = d, i = U(() => a.active.level), r = U(() => a.active.stage === null), v = U(() => a.active.abandoned ? "abandoned" : me(a.board)), l = U(() => Ge(i.value, a.board)), u = W(!1), c = W(!1), y = W(!1), A = wt(), M = W(o.description), F = W(""), $ = W(null), z = W(null), _ = W(null), B = ke([]), K = U(() => Array.from({ length: 7 }, (k, m) => i.value.items.find((w) => w.id === a.board.tray[m]))), Z = U(() => i.value.stacks.map((k) => k.map((m) => i.value.items.find((w) => w.id === m)).filter((m) => a.board.remaining.includes(m.id))));
    let E, q = !1, T = !0, C = 0;
    Ve(z, () => {
      _.value = null;
    });
    function S(k) {
      u.value = k, n("animation", k);
    }
    function R() {
      if (E?.dispose(), E = void 0, F.value = "", !!$.value)
        try {
          E = St($.value, i.value, a.board, {
            action: O,
            error: (k, m) => {
              F.value = o[k], S(!1), m && console.error(o[k], m);
            }
          }), E.active(T);
        } catch (k) {
          F.value = o.graphicsFailed, console.error(o.graphicsFailed, k);
        }
    }
    function O(k) {
      if (a.disabled || u.value || F.value || !T) return;
      const m = i.value.items.find((w) => w.id === k.id);
      if (!m || !Ce(a.board, m)) {
        M.value = We.blocked, m?.above && E?.focus(m.above);
        return;
      }
      _.value = null, n("pick", k.id);
    }
    Le(() => a.active.id, async () => {
      C++, S(!1), M.value = o.description, await Ye(), R();
    }), Le(() => a.board, async (k, m) => {
      if (!q || !m || m === k) return;
      const w = ++C, Y = m.remaining.filter((D) => !k.remaining.includes(D)), H = Y.length === 1 && k.remaining.length === m.remaining.length - 1, X = H ? i.value.items.find((D) => D.id === Y[0]) : void 0, ee = H && m.tray.length + 1 - k.tray.length === 3;
      X ? (M.value = ee ? o.packed(re[X.kind]) : o.selected(re[X.kind]), T && A.play(ee)) : M.value = o.description, S(!0), await E?.update(k, X ? {
        type: "pick",
        id: X.id
      } : void 0, ee), w === C && S(!1);
    });
    async function J() {
      if (!y.value) {
        y.value = !0;
        try {
          const k = !c.value;
          await A.setEnabled(k) && (c.value = k, k && A.play(!0));
        } catch (k) {
          M.value = o.soundFailed, console.error(o.soundFailed, k);
        } finally {
          y.value = !1;
        }
      }
    }
    async function f() {
      try {
        await A.setEnabled(!1), c.value = !1;
      } catch (k) {
        M.value = o.soundFailed, console.error(o.soundFailed, k);
      }
    }
    function L() {
      B.value = E?.visibleItems() ?? [], _.value = "items";
    }
    return Be(() => {
      q = !0, R();
    }), Re(() => {
      T = !0, E?.active(!0);
    }), qe(() => {
      T = !1, _.value = null, E?.active(!1), f();
    }), Oe(() => {
      C++, q = !1, E?.dispose(), S(!1), A.dispose().catch((k) => console.error(o.soundFailed, k));
    }), (k, m) => (g(), h("section", {
      class: de(["moving-room", `moving-${i.value.id}`]),
      "aria-label": t(o).name,
      "data-status": v.value,
      "data-tier": e.challenge.activeTier,
      "data-level": i.value.key,
      "data-run": e.active.id,
      "aria-busy": e.disabled || u.value
    }, [
      s("header", Ft, [s("button", {
        type: "button",
        class: "moving-location",
        "aria-label": t(o).backChapters,
        onClick: m[0] || (m[0] = (w) => n("chapters"))
      }, [
        s("span", Vt, b(r.value ? "Ⅱ" : String(e.active.stage + 1).padStart(2, "0")), 1),
        s("span", null, [s("strong", null, [ae(b(t(fe)[i.value.id]), 1), r.value ? (g(), h("span", Nt, b(t(Ne)[e.challenge.activeTier]), 1)) : G("", !0)]), s("small", null, [r.value ? G("", !0) : (g(), h(te, { key: 0 }, [ae(b(t(o).stage(e.active.stage)) + " · ", 1)], 64)), ae(b(t(o).progress(l.value, i.value.items.length / t(3))), 1)])]),
        m[18] || (m[18] = s("span", { "aria-hidden": "true" }, "⌄", -1))
      ], 8, jt), s("button", {
        type: "button",
        class: "moving-icon-button",
        "aria-label": t(o).rules,
        onClick: m[1] || (m[1] = (w) => _.value = "rules")
      }, "?", 8, Dt)]),
      s("div", Gt, [
        s("div", {
          ref_key: "host",
          ref: $,
          class: "moving-canvas"
        }, null, 512),
        F.value ? G("", !0) : (g(), h("div", Ht, [s("div", qt, [
          s("button", {
            type: "button",
            "aria-label": t(o).zoomOut,
            onClick: m[2] || (m[2] = (w) => t(E)?.zoom(1 / 1.2))
          }, "−", 8, Yt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateLeft,
            onClick: m[3] || (m[3] = (w) => t(E)?.rotate(-0.18))
          }, "↶", 8, Zt),
          s("button", {
            type: "button",
            "aria-label": t(o).resetView,
            onClick: m[4] || (m[4] = (w) => t(E)?.resetView())
          }, "⌂", 8, Wt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateRight,
            onClick: m[5] || (m[5] = (w) => t(E)?.rotate(0.18))
          }, "↷", 8, Kt),
          s("button", {
            type: "button",
            "aria-label": t(o).zoomIn,
            onClick: m[6] || (m[6] = (w) => t(E)?.zoom(1.2))
          }, "+", 8, Xt)
        ]), v.value === "playing" ? (g(), h("span", Ut, b(t(o).rotateHint), 1)) : G("", !0)])),
        F.value ? (g(), h("section", Qt, [
          s("p", null, b(F.value), 1),
          s("button", {
            type: "button",
            class: "moving-primary",
            onClick: R
          }, b(t(o).retryGraphics), 1),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: m[7] || (m[7] = (w) => n("chapters"))
          }, b(t(o).backChapters), 1)
        ])) : v.value !== "playing" && !u.value && !e.disabled ? (g(), h("section", Jt, [
          s("span", ea, b(v.value === "won" ? "✓" : "…"), 1),
          s("h2", null, b(v.value === "won" ? t(o).won : v.value === "lost" ? t(o).lost : t(o).abandoned), 1),
          s("p", null, b(v.value === "won" ? e.award ? t(o).reward(e.award) : t(o).earned : r.value ? t(o).paidLost : t(o).lostBody), 1),
          r.value ? (g(), h("p", {
            key: 0,
            "data-next-tier": e.challenge.tier
          }, b(t(o).nextTier(e.challenge.tier)), 9, ta)) : G("", !0),
          v.value === "won" ? (g(), h("button", {
            key: 1,
            type: "button",
            class: "moving-primary",
            onClick: m[8] || (m[8] = (w) => n("next"))
          }, b(r.value ? t(o).admission : e.active.stage < t(pe).length - 1 ? t(o).next : t(o).chapterComplete), 1)) : r.value ? (g(), h("button", {
            key: 3,
            type: "button",
            class: "moving-primary",
            onClick: m[10] || (m[10] = (w) => n("next"))
          }, b(t(o).admission), 1)) : (g(), h("button", {
            key: 2,
            type: "button",
            class: "moving-primary",
            onClick: m[9] || (m[9] = (w) => n("undo"))
          }, b(t(o).undo), 1)),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: m[11] || (m[11] = (w) => n("chapters"))
          }, b(t(o).backChapters), 1)
        ])) : G("", !0)
      ]),
      s("footer", aa, [
        s("div", na, [s("strong", null, [ae(b(t(o).tray) + " ", 1), s("small", null, b(t(o).slots(e.board.tray.length, t(7))), 1)]), s("p", ia, b(M.value), 1)]),
        s("ol", {
          class: de(["moving-tray", { "is-full": v.value === "lost" }]),
          "aria-label": t(o).tray,
          style: we({ "--moving-capacity": t(7) })
        }, [(g(!0), h(te, null, se(K.value, (w, Y) => (g(), h("li", {
          key: Y,
          "aria-label": t(o).slot(w ? t(re)[w.kind] : t(o).emptySlot, Y),
          class: de({ "is-filled": w })
        }, [w ? (g(), Fe(ie, {
          key: 0,
          kind: w.kind
        }, null, 8, ["kind"])) : (g(), h("span", ra, "·"))], 10, la))), 128))], 14, oa),
        s("div", sa, [
          r.value ? G("", !0) : (g(), h("button", {
            key: 0,
            type: "button",
            disabled: e.disabled || u.value || !e.active.moves.length,
            onClick: m[12] || (m[12] = (w) => n("undo"))
          }, "↩ " + b(t(o).undo), 9, da)),
          s("button", {
            type: "button",
            disabled: e.disabled || u.value || !!F.value || v.value !== "playing",
            onClick: L
          }, "⌕ " + b(t(o).pickList), 9, ca),
          r.value ? (g(), h("button", {
            key: 2,
            type: "button",
            disabled: e.disabled || u.value || v.value !== "playing",
            onClick: m[14] || (m[14] = (w) => n("abandon"))
          }, b(t(o).abandon), 9, fa)) : (g(), h("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || u.value,
            onClick: m[13] || (m[13] = (w) => n("restart"))
          }, "↻ " + b(t(o).restart), 9, ua)),
          s("button", {
            type: "button",
            disabled: y.value || !t(A).available,
            "aria-pressed": c.value,
            onClick: J
          }, b(c.value ? t(o).soundOn : t(o).soundOff), 9, va)
        ])
      ]),
      _.value ? (g(), h("div", {
        key: 0,
        class: "moving-modal-backdrop",
        onClick: m[17] || (m[17] = je((w) => _.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: z,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-board-dialog",
        tabindex: "-1"
      }, [s("header", null, [s("h2", pa, b(_.value === "rules" ? t(o).rules : t(o).pickListTitle), 1), s("button", {
        type: "button",
        "aria-label": t(o).close,
        onClick: m[15] || (m[15] = (w) => _.value = null)
      }, "×", 8, ma)]), _.value === "rules" ? (g(), h(te, { key: 0 }, [
        s("ol", ba, [(g(!0), h(te, null, se(t(o).instructions, (w) => (g(), h("li", { key: w }, b(w), 1))), 128))]),
        r.value ? (g(), h("p", ga, b(t(o).admissionBody), 1)) : G("", !0),
        s("p", ha, b(t(o).sessionNote), 1)
      ], 64)) : (g(), h("div", {
        key: 1,
        class: "moving-stack-overview",
        style: we({ "--stack-count": Z.value.length })
      }, [(g(!0), h(te, null, se(Z.value, (w, Y) => (g(), h("section", { key: Y }, [s("h3", null, b(t(o).shelf(Y)), 1), (g(!0), h(te, null, se(w, (H, X) => (g(), h(te, { key: H.id }, [X === 0 ? (g(), h("button", {
        key: 0,
        type: "button",
        "data-item-id": H.id,
        disabled: !B.value.includes(H.id),
        "aria-label": t(o).item(t(re)[H.kind], Y + 1),
        onFocus: (ee) => t(E)?.focus(H.id),
        onBlur: m[16] || (m[16] = (ee) => t(E)?.focus(null)),
        onClick: (ee) => O({
          type: "pick",
          id: H.id
        })
      }, [oe(ie, { kind: H.kind }, null, 8, ["kind"]), s("span", null, b(t(o).available), 1)], 40, ya)) : (g(), h("div", {
        key: 1,
        "aria-label": `${t(re)[H.kind]} · ${t(o).underneath}`
      }, [oe(ie, { kind: H.kind }, null, 8, ["kind"])], 8, ka))], 64))), 128))]))), 128))], 4))], 512)])) : G("", !0)
    ], 10, Ot));
  }
}), xa = wa, Ma = {
  key: 0,
  class: "moving-account"
}, Ca = { role: "status" }, $a = {
  key: 1,
  class: "moving-save-notice",
  role: "alert"
}, _a = ["disabled"], Sa = ["disabled"], Ia = {
  key: 2,
  class: "moving-loading",
  role: "status"
}, Ea = ["aria-label"], Aa = { class: "moving-chapter-card chapter-home" }, La = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, Pa = { class: "moving-chapter-title" }, za = { class: "moving-stage-path" }, Ta = [
  "data-stage",
  "aria-label",
  "disabled",
  "onClick"
], Ra = { class: "moving-chapter-card chapter-witch" }, Ba = {
  class: "moving-chapter-art",
  "aria-hidden": "true"
}, Oa = { class: "moving-chapter-title" }, Fa = ["data-tier"], ja = {
  key: 0,
  class: "moving-session-note"
}, Va = ["disabled"], Na = {
  key: 1,
  class: "moving-session-note"
}, Da = { class: "moving-session-note" }, Ga = {
  key: 5,
  class: "moving-generating",
  role: "status"
}, Ha = { id: "moving-confirm-title" }, qa = ["aria-label"], Ya = ["data-tier"], Za = { class: "moving-confirm-actions" }, Wa = ["disabled"], Ka = /* @__PURE__ */ xe({
  __name: "MovingRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const d = e, a = kt(d.bridge, d.chatIdentity), { view: n, busy: i, blocked: r, notice: v, generating: l, failed: u } = a, c = W("chapters"), y = W(null), A = W(null), M = W(!1);
    let F = !1;
    const $ = U(() => n.value?.active ?? null), z = U(() => !!$.value && $.value.stage === null && Te($.value) === "playing"), _ = U(() => n.value?.completed.length === pe.length), B = U(() => r.value || M.value || d.generationActive);
    Ve(A, () => {
      y.value = null;
    }), Ze(() => c.value !== "board" ? !1 : (c.value = "chapters", !0));
    async function K(T) {
      await a.act({
        type: "start",
        stage: T
      }) && (c.value = "board");
    }
    async function Z() {
      const T = y.value;
      T && (y.value = null, await a.act({ type: T === "admission" ? "challenge" : T }) && (c.value = "board"));
    }
    function E() {
      z.value ? c.value = "board" : y.value = "admission";
    }
    async function q() {
      $.value && ($.value.stage !== null && $.value.stage < pe.length - 1 ? await K($.value.stage + 1) : E());
    }
    return Be(async () => {
      await a.read(), $.value && (c.value = "board"), F = !0;
    }), Re(() => {
      F && a.read();
    }), Oe(a.dispose), (T, C) => (g(), h("div", { class: de(["moving-app", { "moving-app-board": c.value === "board" }]) }, [
      t(n) ? (g(), h("div", Ma, [s("span", null, b(t(o).balance(t(n).balance)), 1), s("small", Ca, b(e.generationActive ? t(o).storyBusy : t(i) ? t(l) ? t(o).generating : t(o).saving : t(n).writeState === "ready" && !t(u) ? t(o).saved : ""), 1)])) : G("", !0),
      t(v) || t(u) || t(n)?.pending || t(n)?.writeState === "failed" ? (g(), h("aside", $a, [
        s("p", null, b(t(v) || t(o).saveProblem), 1),
        s("button", {
          type: "button",
          disabled: t(i),
          onClick: C[0] || (C[0] = (...S) => t(a).recover && t(a).recover(...S))
        }, b(t(o).recover), 9, _a),
        t(n)?.writeState === "conflict" ? (g(), h("button", {
          key: 0,
          type: "button",
          disabled: t(i),
          onClick: C[1] || (C[1] = (...S) => t(a).read && t(a).read(...S))
        }, b(t(o).refresh), 9, Sa)) : G("", !0)
      ])) : G("", !0),
      t(n) ? c.value === "board" && $.value && t(n).board ? (g(), Fe(xa, {
        key: $.value.id,
        active: $.value,
        board: t(n).board,
        disabled: t(r) || e.generationActive,
        award: t(n).award,
        challenge: t(n).challenge,
        onPick: C[2] || (C[2] = (S) => t(a).act({
          type: "pick",
          id: S
        })),
        onUndo: C[3] || (C[3] = (S) => t(a).act({ type: "undo" })),
        onRestart: C[4] || (C[4] = (S) => y.value = "restart"),
        onAbandon: C[5] || (C[5] = (S) => y.value = "abandon"),
        onChapters: C[6] || (C[6] = (S) => c.value = "chapters"),
        onNext: q,
        onAnimation: C[7] || (C[7] = (S) => M.value = S)
      }, null, 8, [
        "active",
        "board",
        "disabled",
        "award",
        "challenge"
      ])) : t(n) ? (g(), h("section", {
        key: 4,
        class: "moving-chapters moving-room",
        "aria-label": t(o).chapters
      }, [
        $.value && t(Te)($.value) === "playing" ? (g(), h("button", {
          key: 0,
          type: "button",
          class: "moving-resume",
          onClick: C[8] || (C[8] = (S) => c.value = "board")
        }, [s("span", null, b(t(o).resume) + " · " + b(t(fe)[$.value.level.id]), 1), C[12] || (C[12] = s("span", { "aria-hidden": "true" }, "→", -1))])) : G("", !0),
        s("article", Aa, [
          s("div", La, [oe(ie, { kind: "cat" }), oe(ie, { kind: "plant" })]),
          s("div", Pa, [
            s("small", null, b(t(o).chapterOne), 1),
            s("h2", null, b(t(fe).weekend), 1),
            s("p", null, b(t(o).firstReward), 1)
          ]),
          s("ol", za, [(g(!0), h(te, null, se(t(pe), (S, R) => (g(), h("li", { key: S.key }, [s("button", {
            type: "button",
            "data-stage": R,
            "aria-label": t(o).stage(R),
            disabled: B.value || z.value || R > t(n).completed.length,
            class: de({ "is-cleared": t(n).completed.includes(R) }),
            onClick: (O) => K(R)
          }, [s("strong", null, b(R + 1), 1), s("small", null, b(t(n).completed.includes(R) ? "✓" : "+" + t(he).chapterReward), 1)], 10, Ta)]))), 128))])
        ]),
        s("article", Ra, [
          s("div", Ba, [oe(ie, { kind: "potion" }), oe(ie, { kind: "star" })]),
          s("div", Oa, [
            s("small", null, [ae(b(t(o).chapterTwo) + " · ", 1), s("span", { "data-tier": t(n).challenge.tier }, b(t(Ne)[t(n).challenge.tier]), 9, Fa)]),
            s("h2", null, b(t(fe).witch), 1),
            s("p", null, b(t(o).challengeTerms), 1)
          ]),
          _.value ? (g(), h("p", ja, b(t(o).tierProgress(t(n).challenge)), 1)) : G("", !0),
          s("button", {
            type: "button",
            class: "moving-primary",
            disabled: B.value || !_.value || !z.value && t(n).balance < t(he).challengeFee,
            onClick: E
          }, b(z.value ? t(o).resume : _.value ? t(o).admission : t(o).challengeLocked), 9, Va),
          _.value && !z.value && t(n).balance < t(he).challengeFee ? (g(), h("p", Na, b(t(o).noFunds), 1)) : G("", !0)
        ]),
        s("p", Da, b(t(o).sessionNote), 1)
      ], 8, Ea)) : G("", !0) : (g(), h("p", Ia, b(t(o).loading), 1)),
      t(l) ? (g(), h("div", Ga, b(t(o).generating), 1)) : G("", !0),
      y.value ? (g(), h("div", {
        key: 6,
        class: "moving-modal-backdrop moving-room-theme",
        onClick: C[11] || (C[11] = je((S) => y.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: A,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-confirm-title",
        tabindex: "-1"
      }, [
        s("header", null, [s("h2", Ha, b(y.value === "admission" && t(n) ? t(o).admissionTitle(t(n).challenge.tier) : y.value === "abandon" ? t(o).abandonTitle : t(o).restartTitle), 1), s("button", {
          type: "button",
          "aria-label": t(o).close,
          onClick: C[9] || (C[9] = (S) => y.value = null)
        }, "×", 8, qa)]),
        s("p", null, b(y.value === "admission" ? t(o).admissionBody : y.value === "abandon" ? t(o).abandonBody : t(o).discard), 1),
        y.value === "admission" && t(n) ? (g(), h("p", {
          key: 0,
          class: "moving-session-note",
          "data-tier": t(n).challenge.tier
        }, [
          ae(b(t(o).tierProgress(t(n).challenge)), 1),
          C[13] || (C[13] = s("br", null, null, -1)),
          ae(b(t(o).tierRule), 1)
        ], 8, Ya)) : G("", !0),
        s("div", Za, [s("button", {
          type: "button",
          class: "moving-plain",
          onClick: C[10] || (C[10] = (S) => y.value = null)
        }, b(t(o).cancel), 1), s("button", {
          type: "button",
          class: "moving-primary",
          disabled: B.value,
          onClick: Z
        }, b(y.value === "admission" ? t(o).admission : t(o).confirm), 9, Wa)])
      ], 512)])) : G("", !0)
    ], 2));
  }
}), an = Ka;
export {
  an as default
};
