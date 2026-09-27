/* eslint-disable */
import { $ as ue, A as qe, D as Re, E as Ye, F as h, H as Le, L as ce, M as Be, O as Fe, Q as t, X as ke, Y as X, _ as y, b as re, et as we, g as H, h as Oe, l as je, m as s, p as U, tt as g, u as ae, v as se, x as xe, y as ie } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as Ze, r as Ve } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { a as pe, i as We, n as de, o as Ke, r as o, s as he, t as Ne } from "./xiaobai-os-copy-Bo3eHGxn.js";
import { $ as Xe, Ft as Pe, It as be, Ot as Ue, Pt as Qe, S as Je, St as et, Y as tt, a as at, g as ze, m as nt, ot as it, t as ot, u as lt, vt as rt, x as Me, xt as st } from "./xiaobai-os-three.module-DlsF37OG.js";
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
function ge(e) {
  return !e.remaining.length && !e.tray.length ? "won" : e.tray.length >= 7 ? "lost" : "playing";
}
function Ge(e, d) {
  return (e.items.length - d.remaining.length - d.tray.length) / 3;
}
function Ce(e, d) {
  return ge(e) === "playing" && e.remaining.includes(d.id) && (!d.above || !e.remaining.includes(d.above));
}
function ut(e, d, a) {
  if (ge(d) !== "playing") return {
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
  const i = [...d.tray], r = (c) => e.items.find((m) => m.id === c).kind === n.kind, p = i.reduce((c, m, P) => r(m) ? P : c, -1);
  i.splice(p < 0 ? i.length : p + 1, 0, n.id);
  const l = i.filter(r), f = l.length === 3 ? l : [];
  return {
    ok: !0,
    packed: f,
    state: {
      remaining: d.remaining.filter((c) => c !== n.id),
      tray: i.filter((c) => !f.includes(c))
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
  return Array.from({ length: d }, (i, r) => n.filter((p, l) => l % d === r));
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
], pt = 0.51, tn = {
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
  const i = e.map((r, p) => r.map((l, f) => `s${p}-${f}`));
  return {
    id: d,
    key: a,
    seed: n,
    items: e.flatMap((r, p) => r.map((l, f) => {
      const [c, m, P] = oe[p];
      return {
        id: i[p][f],
        kind: l,
        above: f ? i[p][f - 1] : null,
        position: [
          c + (f % 2 ? 0.18 : -0.18),
          m + (r.length - f - 1) * pt + 0.32,
          P
        ]
      };
    })),
    stacks: i
  };
}
var me = bt.map((e, d) => mt(vt(De.slice(0, e.count), e.lanes, ft(e.seed)), "weekend", `chapter-${d + 1}`, e.seed));
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
  return e.abandoned ? "abandoned" : ge(ht(e));
}
function yt() {
  return [...crypto.getRandomValues(new Uint32Array(4))].map((e) => e.toString(16).padStart(8, "0")).join("");
}
function kt(e, d) {
  const a = ke(null), n = X(!1), i = X(""), r = X(!1), p = ke(null);
  let l = !1, f = null;
  const c = U(() => n.value || !!p.value || !a.value?.ready || a.value.writeState !== "ready" || a.value.pending);
  function m(M) {
    l || (a.value = M);
  }
  async function P(M, A) {
    if (l || n.value) return !1;
    n.value = !0, f = null, r.value = !!A && "command" in A && A.command.type === "challenge", i.value = "";
    try {
      const $ = await e.request(`game/moving/${M}`, {
        chatIdentity: d,
        ...A
      }, 35e3), F = f;
      return m(F && F.revision >= $.result.revision ? F : $.result), a.value?.writeState === "ready" && !a.value.pending && (p.value = null), !0;
    } catch ($) {
      if (!l) {
        if (f && m(f), M === "sound") throw $;
        i.value = Ke($);
        const F = $ && typeof $ == "object" && "code" in $ ? String($.code) : $ instanceof Error ? $.message : "";
        A && "command" in A && (F.startsWith("moving_save_") || F.startsWith("host_request_")) && (p.value = A);
      }
      return !1;
    } finally {
      l || (n.value = !1, r.value = !1);
    }
  }
  const w = e.subscribe((M) => {
    if (l || M.type !== "game/moving/state") return;
    const A = M.payload;
    A.chatIdentity === d && (n.value ? f = A.state : m(A.state));
  });
  async function j() {
    const M = p.value;
    !await P("confirm") || !a.value || a.value.writeState !== "ready" || a.value.pending || M && a.value.revision === M.revision && await P("act", M);
  }
  return {
    view: a,
    busy: n,
    error: i,
    generating: r,
    blocked: c,
    failed: p,
    notice: U(() => i.value || (a.value?.writeState === "conflict" ? o.conflict : a.value?.pending || a.value?.writeState === "unconfirmed" ? o.saveProblem : "")),
    read: () => P("read"),
    recover: j,
    setSoundEnabled: (M) => P("sound", { enabled: M }),
    act: (M) => c.value ? Promise.resolve(!1) : P("act", {
      actionId: yt(),
      revision: a.value.revision,
      command: M
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
      ] : [392]).forEach((r, p) => {
        const l = e.createOscillator(), f = e.createGain(), c = e.currentTime + p * 0.09;
        l.type = "sine", l.frequency.value = r, f.gain.setValueAtTime(0, c), f.gain.linearRampToValueAtTime(0.065, c + 0.015), f.gain.exponentialRampToValueAtTime(1e-3, c + 0.25), l.connect(f), f.connect(e.destination), l.start(c), l.stop(c + 0.27), l.onended = () => {
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
function ve(e, d) {
  const a = new Me(), n = He[d], i = (r, p, l = 0.1) => {
    for (const f of [-l, l]) e.ball(a, [
      0.025,
      0.038,
      0.02
    ], "#343447", [
      f,
      r,
      p
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
        const p = r * 2.4, l = e.ball(a, [
          0.085,
          0.21,
          0.07
        ], n, [
          Math.sin(p) * 0.13,
          0.15 + r * 0.025,
          Math.cos(p) * 0.12
        ]);
        l.rotation.z = Math.sin(p) * 0.7, l.rotation.x = Math.cos(p) * 0.7;
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
        const p = r * Math.PI * 2 / 5, l = e.cylinder(a, 0, 0.13, 0.25, n, [
          Math.sin(p) * 0.22,
          Math.cos(p) * 0.22,
          0
        ], 4);
        l.rotation.z = -p;
      }
      i(0.02, 0.11, 0.07);
      break;
  }
  return a;
}
function xt() {
  const e = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  function a(n, i, r, p, l) {
    d.has(i) || d.set(i, r()), e.has(p) || e.set(p, new Xe({
      color: p,
      roughness: 0.55,
      metalness: 0.02
    }));
    const f = new tt(d.get(i), e.get(p));
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
    box(n, i, r, p, l = 0.08) {
      const f = Math.min(l, ...i.map((c) => c / 2));
      return a(n, `b:${i}:${f}`, () => new dt(...i, 2, f), r, p);
    },
    ball(n, i, r, p) {
      const l = a(n, "ball", () => new Ue(1, 16, 12), r, p);
      return l.scale.set(...i), l;
    },
    cylinder(n, i, r, p, l, f, c = 24) {
      return a(n, `c:${i}:${r}:${p}:${c}`, () => new nt(i, r, p, c), l, f);
    },
    ring(n, i, r, p, l) {
      return a(n, `t:${i}:${r}`, () => new Qe(i, r, 8, 32), p, l);
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
  const d = xt(), a = new Me(), n = Mt[e.id], i = d.group(a), r = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), l = d.box, f = d.ball;
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
  for (let v = -4; v <= 4; v++) l(i, [
    0.014,
    9e-3,
    8.15
  ], "#e5ddd2", [
    v,
    8e-3,
    0.1
  ], 0);
  for (const v of [
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
    v
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
  for (let v = 0; v < 14; v++) l(i, [
    0.055,
    0.025,
    0.18
  ], "#fffdf6", [
    -2.6 + v * 0.4,
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
    for (const [v, L] of [
      [-0.25, 3.55],
      [0.15, 2.85],
      [0.85, 2.8]
    ]) {
      const q = ve(d, "star");
      q.position.set(v, L, -3.17), q.scale.setScalar(0.25), i.add(q);
    }
  } else for (const v of [
    -0.3,
    -0.05,
    0.2
  ]) f(i, [
    0.22,
    0.11,
    0.025
  ], "#f8fcff", [
    v,
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
  for (const v of [-1.12, 1.82]) l(i, [
    0.42,
    1.8,
    0.25
  ], e.id === "witch" ? "#c4b2e7" : "#f4c4bf", [
    v,
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
    for (const v of [m - 1.35, m + 1.35]) l(i, [
      0.3,
      0.65,
      1.48
    ], n.seat, [
      v,
      P,
      w
    ], 0.14);
    for (const v of [
      m - 0.8,
      m,
      m + 0.8
    ]) l(i, [
      0.73,
      0.18,
      1.05
    ], "#ffd7d9", [
      v,
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
    for (const L of [m - 0.9, m + 0.9])
      l(i, [
        0.68,
        0.38,
        0.035
      ], "#8699be", [
        L,
        0.31,
        w + 0.77
      ], 0.06), f(i, [
        0.055,
        0.055,
        0.03
      ], "#f6d38b", [
        L,
        0.52,
        w + 0.8
      ]);
    const v = d.group(i, [
      -3.42,
      0.46,
      0.7
    ]);
    f(v, [
      0.47,
      0.4,
      0.43
    ], "#9c91c5", [
      0,
      0,
      0
    ]), d.ring(v, 0.36, 0.06, "#c0b1e1", [
      0,
      0.26,
      0
    ]).rotation.x = Math.PI / 2, d.cylinder(v, 0.33, 0.33, 0.018, "#a8edcf", [
      0,
      0.26,
      0
    ]);
    for (const L of [-0.48, 0.48]) d.ring(v, 0.1, 0.03, "#dfcfa1", [
      L,
      0.06,
      0
    ]);
    for (const [L, q] of [
      [-0.16, 0.48],
      [0.1, 0.74],
      [0.21, 0.43]
    ]) f(v, [
      0.095,
      0.095,
      0.095
    ], "#c2f5df", [
      L,
      q,
      0
    ]);
  }
  const [j, M, A] = oe[1];
  l(i, [
    2.35,
    M,
    1.45
  ], n.cabinet, [
    j,
    M / 2,
    A
  ], 0.09), l(i, [
    2.48,
    0.13,
    1.56
  ], "#fff7e6", [
    j,
    M,
    A
  ], 0.05);
  for (const v of [0.25, 0.62])
    l(i, [
      2.12,
      0.27,
      0.04
    ], n.trim, [
      j,
      v,
      A + 0.75
    ], 0.03), l(i, [
      0.45,
      0.055,
      0.08
    ], "#fff7e6", [
      j,
      v,
      A + 0.81
    ], 0.02);
  const [$, F, K] = oe[2];
  l(i, [
    1.85,
    F,
    1.45
  ], "#e9be94", [
    $,
    F / 2,
    K
  ], 0.06), l(i, [
    0.2,
    F + 0.016,
    1.48
  ], "#ffe5b7", [
    $,
    F / 2,
    K
  ], 0.01), l(i, [
    0.5,
    0.25,
    0.02
  ], "#fff7e6", [
    $ - 0.45,
    0.35,
    K + 0.74
  ], 0.03);
  const [W, I, Z] = oe[3];
  l(i, [
    2.15,
    0.13,
    1.35
  ], e.id === "witch" ? "#c1d8f0" : "#f5d6ac", [
    W,
    I,
    Z
  ], 0.055);
  for (const v of [W - 0.7, W + 0.7]) l(i, [
    0.11,
    I,
    0.8
  ], n.trim, [
    v,
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
  for (const [v, L] of [["plant", 3], ["cup", 3.53]]) {
    const q = ve(d, v);
    q.position.set(L, 3.76, -2.96), q.scale.setScalar(0.7), i.add(q);
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
  const C = ve(d, e.id === "witch" ? "potion" : "cat");
  C.scale.setScalar(0.8), C.position.set(0, -0.08, 0.15), T.add(C);
  for (const v of e.items) {
    const L = ve(d, v.kind);
    l(L, [
      0.93,
      0.085,
      0.76
    ], "#fff9e9", [
      0,
      -0.29,
      0
    ], 0.035);
    for (const S of [-0.34, 0.34]) f(L, [
      0.1,
      0.055,
      0.25
    ], "#f4e8d5", [
      S,
      -0.23,
      0
    ]);
    L.position.set(...v.position), L.userData.itemId = v.id, a.add(L), r.set(v.id, L);
    const q = d.group(a, [
      v.position[0],
      v.position[1] - 0.27,
      v.position[2]
    ]);
    d.ring(q, 0.47, 0.023, "#eaba61", [
      0,
      0,
      0
    ]).rotation.x = Math.PI / 2, p.set(v.id, q);
  }
  const _ = d.group(a, [
    -3.05,
    0.52,
    3.55
  ]);
  f(_, [
    0.32,
    0.4,
    0.27
  ], "#fffaf2", [
    0,
    0.1,
    0
  ]);
  for (const v of [-0.2, 0.2])
    f(_, [
      0.09,
      0.17,
      0.085
    ], "#fffaf2", [
      v,
      0.48,
      0
    ]), f(_, [
      0.065,
      0.07,
      0.1
    ], "#667486", [
      v * 0.75,
      -0.28,
      0.06
    ]), f(_, [
      0.028,
      0.039,
      0.02
    ], "#354353", [
      v * 0.5,
      0.22,
      0.252
    ]), f(_, [
      0.052,
      0.028,
      0.025
    ], "#f0afb0", [
      v * 0.8,
      0.12,
      0.242
    ]);
  const R = d.group(_, [
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
  const B = d.group(a, [
    3.6,
    0.1,
    3.55
  ]);
  for (let v = 0; v < e.items.length / 3; v++) {
    const L = l(B, [
      0.4,
      0.26,
      0.4
    ], v % 2 ? "#e2b585" : "#efcba2", [
      v % 2 * 0.43 - 0.25,
      Math.floor(v / 2) * 0.28 + 0.14,
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
    markers: p,
    mascot: _,
    parcel: R,
    shipped: B,
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
  const i = new at(new be(-4.8, -0.8, -3.7), new be(4.8, 4.7, 4.4));
  let r = 0, p = 0;
  for (const c of [i.min.x, i.max.x]) for (const m of [i.min.y, i.max.y]) for (const P of [i.min.z, i.max.z]) {
    const w = new be(c, m, P).applyMatrix4(e.matrixWorldInverse);
    r = Math.max(r, Math.abs(w.x)), p = Math.max(p, Math.abs(w.y));
  }
  const l = d / a, f = Math.max(p, r / l) * 1.035;
  e.top = f, e.bottom = -f, e.left = -f * l, e.right = -e.left, e.updateProjectionMatrix();
}
function St(e, d, a, n) {
  const i = new et(), r = $t(), p = new rt(), l = new Pe(), f = new Pe(), c = Ct(d), m = c.mascot.position.clone(), P = new AbortController();
  let w, j, M, A = !1, $ = !1, F = !0, K = !0, W = 0, I = 0, Z = 0, T = ye;
  const C = 0.86;
  let _ = a, R = null, B = null;
  const J = matchMedia("(prefers-reduced-motion: reduce)");
  let v;
  const L = new ze("#fff4df", 3.1);
  L.position.set(-3, 10, 7), L.castShadow = !0, L.shadow.mapSize.set(1024, 1024), Object.assign(L.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 0.5,
    far: 30
  }), L.shadow.normalBias = 0.025, L.shadow.bias = -15e-5, i.add(new Je("#f3f8ff", "#b6b2b0", 2.1), L, c.root);
  const q = new ze("#dbeaff", 0.7);
  q.position.set(6, 5, -3), i.add(q);
  function S() {
    for (const x of d.items) {
      const z = c.items.get(x.id);
      z.visible = _.remaining.includes(x.id), z.position.set(...x.position), z.scale.setScalar(C), c.markers.get(x.id).visible = Ce(_, x);
    }
    c.mascot.position.copy(m), c.mascot.rotation.y = 0, c.parcel.visible = !1, c.shipped.children.forEach((x, z) => {
      x.visible = z < Ge(d, _);
    });
  }
  function u() {
    const x = v;
    v = void 0, S(), x?.done();
  }
  function k() {
    W && (cancelAnimationFrame(W), W = 0);
  }
  function Y(x, z) {
    A || $ || ($ = !0, k(), u(), n.error(x, z));
  }
  function D() {
    _t(r, I, Z, T);
  }
  function te(x) {
    if (W = 0, !(A || $ || !F || !K || document.hidden || I <= 0 || Z <= 0))
      try {
        if (v) {
          const b = Math.min(1, (x - v.started) / v.duration), V = v.action;
          if (V?.type === "pick") {
            const G = d.items.find((Q) => Q.id === V.id), E = c.items.get(G.id), N = Math.min(1, b * (v.packed ? 4 : 1));
            if (E.visible = N < 1, E.position.set(...G.position).lerp(m.clone().add(new be(0, 0.43, 0)), N), E.position.y += Math.sin(N * Math.PI) * 1.4, E.scale.setScalar(C * (1 - N * 0.7)), v.packed) {
              const Q = Math.max(0, (b - 0.2) / 0.8);
              c.parcel.visible = Q > 0 && Q < 0.92, c.mascot.position.x = m.x + Q * (c.shipped.position.x - m.x), c.mascot.position.y = m.y + Math.abs(Math.sin(Q * 22)) * 0.1, c.mascot.rotation.y = 0.6;
            }
          }
          b >= 1 && u();
        }
        const z = R ? c.items.get(R) : void 0;
        c.halo.visible = !!z?.visible, z?.visible && (c.halo.position.copy(z.position), c.halo.position.y -= 0.28), w.getSize(f), (f.x !== I || f.y !== Z) && w.setSize(I, Z, !1), w.render(i, r), v && O();
      } catch (z) {
        Y("graphicsFailed", z);
      }
  }
  function O() {
    !W && !A && !$ && F && K && !document.hidden && I > 0 && Z > 0 && (W = requestAnimationFrame(te));
  }
  function ee() {
    const x = e.getBoundingClientRect();
    if (I = x.width, Z = x.height, I <= 0 || Z <= 0) {
      k();
      return;
    }
    D(), O();
  }
  function ne(x, z) {
    const b = w.domElement.getBoundingClientRect();
    l.set((x - b.left) / b.width * 2 - 1, -(z - b.top) / b.height * 2 + 1), p.setFromCamera(l, r);
    const V = p.intersectObject(c.root, !0);
    for (const G of V) {
      let E = G.object, N = !0;
      for (; E; ) {
        if (!E.visible) {
          N = !1;
          break;
        }
        E = E.parent;
      }
      if (!(!N || G.object === c.halo || [...c.markers.values()].some((Q) => G.object.parent === Q))) {
        for (E = G.object; E; ) {
          if (E.userData.itemId) return {
            type: "pick",
            id: E.userData.itemId
          };
          E = E.parent;
        }
        return null;
      }
    }
    return null;
  }
  function $e(x, z) {
    const b = ne(x, z);
    if (b?.type === "pick") return b;
    const V = w.domElement.getBoundingClientRect(), G = d.items.flatMap((E) => {
      const N = c.items.get(E.id);
      if (!N.visible) return [];
      const Q = N.position.clone().project(r), Ee = V.left + (Q.x + 1) * V.width / 2, Ie = V.top + (1 - Q.y) * V.height / 2, Ae = Math.hypot(x - Ee, z - Ie);
      return Ae <= 22 ? [{
        id: E.id,
        x: Ee,
        y: Ie,
        distance: Ae
      }] : [];
    }).sort((E, N) => E.distance - N.distance);
    for (const E of G) {
      const N = ne(E.x, E.y);
      if (N?.type === "pick" && N.id === E.id) return N;
    }
    return b;
  }
  function fe(x) {
    r.zoom = Math.max(1, Math.min(1.8, r.zoom * x)), r.updateProjectionMatrix(), O();
  }
  function _e(x) {
    T = Math.max(-0.15, Math.min(1.05, T + x)), D(), O();
  }
  function Se() {
    A || (A = !0, k(), u(), P.abort(), j?.disconnect(), M?.disconnect(), c.dispose(), L.shadow.dispose(), i.clear(), w?.dispose(), w?.forceContextLoss(), w?.domElement.remove());
  }
  try {
    w = new ot({
      alpha: !0,
      antialias: !0,
      powerPreference: "low-power"
    }), w.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)), w.setClearColor(new lt("#e6f1ed"), 0), w.outputColorSpace = st, w.toneMapping = 7, w.shadowMap.enabled = !0, w.shadowMap.type = 2, w.debug.onShaderError = () => Y("graphicsFailed");
    const x = w.domElement;
    x.setAttribute("aria-label", o.sceneLabel), x.setAttribute("role", "img"), x.tabIndex = 0, e.prepend(x);
    const z = { signal: P.signal };
    x.addEventListener("webglcontextlost", (b) => {
      b.preventDefault(), Y("contextLost");
    }, z), x.addEventListener("pointerdown", (b) => {
      b.button !== 0 || B || v || (x.setPointerCapture(b.pointerId), B = {
        id: b.pointerId,
        x: b.clientX,
        y: b.clientY,
        yaw: T,
        dragged: !1
      });
    }, z), x.addEventListener("pointermove", (b) => {
      if (!B) {
        if (v || b.pointerType !== "mouse") return;
        const E = $e(b.clientX, b.clientY), N = E?.type === "pick" ? E.id : null;
        x.style.cursor = E ? "pointer" : "grab", R !== N && (R = N, O());
        return;
      }
      if (B.id !== b.pointerId) return;
      const V = b.clientX - B.x, G = b.clientY - B.y;
      Math.hypot(V, G) > 7 && (B.dragged = !0), B.dragged && (T = Math.max(-0.15, Math.min(1.05, B.yaw - V / I * 2.4)), D(), O());
    }, z), x.addEventListener("pointerleave", () => {
      R && (R = null, O());
    }, z), x.addEventListener("pointerup", (b) => {
      if (!B || B.id !== b.pointerId) return;
      const V = B.dragged;
      if (B = null, x.hasPointerCapture(b.pointerId) && x.releasePointerCapture(b.pointerId), !V && !v) {
        const G = $e(b.clientX, b.clientY);
        G && n.action(G);
      }
    }, z);
    for (const b of ["pointercancel", "lostpointercapture"]) x.addEventListener(b, () => {
      B = null;
    }, z);
    return x.addEventListener("keydown", (b) => {
      b.key === "ArrowLeft" || b.key === "ArrowRight" ? (b.preventDefault(), _e(b.key === "ArrowLeft" ? -0.14 : 0.14)) : b.key === "Home" ? (b.preventDefault(), T = ye, r.zoom = 1, D(), O()) : b.key === "+" || b.key === "=" ? (b.preventDefault(), fe(1.15)) : b.key === "-" && (b.preventDefault(), fe(1 / 1.15));
    }, z), x.addEventListener("wheel", (b) => {
      b.preventDefault(), fe(b.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, {
      ...z,
      passive: !1
    }), document.addEventListener("visibilitychange", () => {
      document.hidden ? (k(), u(), B = null) : O();
    }, z), J.addEventListener("change", () => {
      u(), O();
    }, z), j = new ResizeObserver(() => {
      try {
        ee();
      } catch (b) {
        Y("graphicsFailed", b);
      }
    }), j.observe(e), M = new IntersectionObserver((b) => {
      K = b[0].isIntersecting, K ? O() : (k(), u());
    }), M.observe(e), S(), ee(), {
      dispose: Se,
      rotate: _e,
      zoom: fe,
      visibleItems() {
        const b = w.domElement.getBoundingClientRect();
        return d.items.filter((V) => {
          const G = c.items.get(V.id);
          if (!G.visible) return !1;
          const E = G.position.clone().project(r);
          if (Math.abs(E.x) > 1 || Math.abs(E.y) > 1) return !1;
          const N = ne(b.left + (E.x + 1) * b.width / 2, b.top + (1 - E.y) * b.height / 2);
          return N?.type === "pick" && N.id === V.id;
        }).map((V) => V.id);
      },
      resetView() {
        T = ye, r.zoom = 1, D(), O();
      },
      focus(b) {
        R = b, O();
      },
      active(b) {
        F = b, b ? ee() : (k(), u(), B = null);
      },
      update(b, V, G = !1) {
        return u(), _ = b, S(), J.matches || !F || document.hidden || $ || !K || !V ? (O(), Promise.resolve()) : new Promise((E) => {
          v = {
            started: performance.now(),
            duration: G ? 1100 : 300,
            action: V,
            packed: G,
            done: E
          }, O();
        });
      }
    };
  } catch (x) {
    throw Se(), x;
  }
}
var Et = {
  key: 0,
  fill: "currentColor"
}, It = { key: 1 }, At = { key: 2 }, Lt = { key: 3 }, Pt = { key: 4 }, zt = { key: 5 }, Tt = { key: 6 }, Rt = { key: 7 }, Bt = /* @__PURE__ */ xe({
  __name: "ItemIcon",
  props: { kind: {} },
  setup(e) {
    return (d, a) => (h(), y("svg", {
      viewBox: "0 0 48 48",
      "aria-hidden": "true",
      style: we({ color: t(He)[e.kind] }),
      class: "moving-item-icon"
    }, [e.kind === "cat" ? (h(), y("g", Et, [...a[0] || (a[0] = [se('<path d="M11 23 10 6 22 15 29 14 39 6 38 26Z"></path><ellipse cx="24" cy="31" rx="14" ry="12"></ellipse><ellipse cx="24" cy="23" rx="17" ry="13"></ellipse><path d="M38 33q10 5 3 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path><g fill="#354353"><circle cx="18" cy="23" r="1.6"></circle><circle cx="30" cy="23" r="1.6"></circle></g><path d="m22 27 2 2 2-2" fill="#ce778a"></path>', 6)])])) : e.kind === "toast" ? (h(), y("g", It, [...a[1] || (a[1] = [se('<path d="M9 17C1 2 47 2 39 17v24H9Z" fill="currentColor"></path><path d="M14 19C8 8 40 8 34 19v17H14Z" fill="#ffe9b9"></path><rect x="19" y="18" width="12" height="9" rx="2" fill="#f8ca54" transform="rotate(10 25 22)"></rect><g fill="#354353"><circle cx="19" cy="31" r="1.5"></circle><circle cx="29" cy="31" r="1.5"></circle></g>', 4)])])) : e.kind === "ufo" ? (h(), y("g", At, [...a[2] || (a[2] = [se('<ellipse cx="24" cy="29" rx="22" ry="8" fill="currentColor"></ellipse><path d="M12 27v-5a12 12 0 0 1 24 0v5Z" fill="#b0e4e8"></path><path d="M5 28q19 10 38 0" stroke="#eee4a6" stroke-width="3" fill="none"></path><g fill="#354353"><circle cx="20" cy="23" r="1.5"></circle><circle cx="28" cy="23" r="1.5"></circle></g>', 4)])])) : e.kind === "cup" ? (h(), y("g", Lt, [...a[3] || (a[3] = [se('<path d="M33 17h5c11 0 9 16-4 16" fill="none" stroke="currentColor" stroke-width="5"></path><path d="M7 13h29l-3 24q-12 8-23 0Z" fill="currentColor"></path><ellipse cx="21.5" cy="13" rx="14.5" ry="5" fill="#e7d9fb"></ellipse><ellipse cx="21.5" cy="13" rx="10" ry="3" fill="#806254"></ellipse><g fill="#354353"><circle cx="16" cy="27" r="1.5"></circle><circle cx="26" cy="27" r="1.5"></circle></g>', 5)])])) : e.kind === "duck" ? (h(), y("g", Pt, [...a[4] || (a[4] = [se('<ellipse cx="24" cy="32" rx="18" ry="11" fill="currentColor"></ellipse><circle cx="25" cy="17" r="12" fill="currentColor"></circle><ellipse cx="26" cy="23" rx="8" ry="4" fill="#f49c44"></ellipse><g fill="#354353"><circle cx="20" cy="16" r="1.5"></circle><circle cx="30" cy="16" r="1.5"></circle></g><path d="M11 30q3 8 9 4" fill="none" stroke="#eba93b" stroke-width="2"></path>', 5)])])) : e.kind === "plant" ? (h(), y("g", zt, [...a[5] || (a[5] = [
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
    const a = e, n = d, i = U(() => a.active.level), r = U(() => a.active.stage === null), p = U(() => a.active.abandoned ? "abandoned" : ge(a.board)), l = U(() => Ge(i.value, a.board)), f = X(!1), c = X(!1), m = wt(), P = U(() => a.soundEnabled && m.available), w = X(o.description), j = X(""), M = X(null), A = X(null), $ = X(null), F = ke([]), K = U(() => Array.from({ length: 7 }, (S, u) => i.value.items.find((k) => k.id === a.board.tray[u]))), W = U(() => i.value.stacks.map((S) => S.map((u) => i.value.items.find((k) => k.id === u)).filter((u) => a.board.remaining.includes(u.id))));
    let I, Z = !1, T = !0, C = 0, _ = null;
    Ve(A, () => {
      $.value = null;
    });
    function R(S) {
      f.value = S, n("animation", S);
    }
    function B() {
      if (I?.dispose(), I = void 0, j.value = "", !!M.value)
        try {
          I = St(M.value, i.value, a.board, {
            action: J,
            error: (S, u) => {
              j.value = o[S], R(!1), u && console.error(o[S], u);
            }
          }), I.active(T);
        } catch (S) {
          j.value = o.graphicsFailed, console.error(o.graphicsFailed, S);
        }
    }
    function J(S) {
      if (a.disabled || f.value || j.value || !T) return;
      const u = i.value.items.find((k) => k.id === S.id);
      if (!u || !Ce(a.board, u)) {
        w.value = We.blocked, u?.above && I?.focus(u.above);
        return;
      }
      $.value = null, _ = P.value ? m.setEnabled(!0).catch((k) => (w.value = o.soundFailed, console.error(o.soundFailed, k), !1)) : null, n("pick", S.id);
    }
    Le(() => a.active.id, async () => {
      C++, _ = null, R(!1), w.value = o.description, await Ye(), B();
    }), Le(() => a.board, async (S, u) => {
      if (!Z || !u || u === S) return;
      const k = ++C, Y = u.remaining.filter((ee) => !S.remaining.includes(ee)), D = Y.length === 1 && S.remaining.length === u.remaining.length - 1, te = D ? i.value.items.find((ee) => ee.id === Y[0]) : void 0, O = D && u.tray.length + 1 - S.tray.length === 3;
      if (te) {
        if (w.value = O ? o.packed(de[te.kind]) : o.selected(de[te.kind]), T) {
          const ee = _;
          _ = null, ee ? ee.then((ne) => {
            ne && T && k === C && m.play(O);
          }).catch((ne) => {
            w.value = o.soundFailed, console.error(o.soundFailed, ne);
          }) : m.play(O);
        }
      } else w.value = o.description;
      R(!0), await I?.update(S, te ? {
        type: "pick",
        id: te.id
      } : void 0, O), k === C && R(!1);
    });
    async function v() {
      if (c.value) return;
      c.value = !0;
      const S = !P.value;
      let u = !1;
      try {
        if (S && !await m.setEnabled(!0)) return;
        u = !0, await a.setSoundEnabled(S) ? S ? m.play(!0) : await m.setEnabled(!1) : S && await m.setEnabled(!1);
      } catch (k) {
        S && await m.setEnabled(!1).catch((D) => console.error(o.soundFailed, D));
        const Y = u ? o.soundSaveFailed : o.soundFailed;
        w.value = Y, console.error(Y, k);
      } finally {
        c.value = !1;
      }
    }
    async function L() {
      try {
        await m.setEnabled(!1);
      } catch (S) {
        w.value = o.soundFailed, console.error(o.soundFailed, S);
      }
    }
    function q() {
      F.value = I?.visibleItems() ?? [], $.value = "items";
    }
    return Be(() => {
      Z = !0, B();
    }), Re(() => {
      T = !0, I?.active(!0);
    }), qe(() => {
      T = !1, _ = null, $.value = null, I?.active(!1), L();
    }), Fe(() => {
      C++, Z = !1, I?.dispose(), R(!1), m.dispose().catch((S) => console.error(o.soundFailed, S));
    }), (S, u) => (h(), y("section", {
      class: ue(["moving-room", `moving-${i.value.id}`]),
      "aria-label": t(o).name,
      "data-status": p.value,
      "data-tier": e.challenge.activeTier,
      "data-level": i.value.key,
      "data-run": e.active.id,
      "aria-busy": e.disabled || f.value
    }, [
      s("header", Ot, [s("button", {
        type: "button",
        class: "moving-location",
        "aria-label": t(o).backChapters,
        onClick: u[0] || (u[0] = (k) => n("chapters"))
      }, [
        s("span", Vt, g(r.value ? "Ⅱ" : String(e.active.stage + 1).padStart(2, "0")), 1),
        s("span", null, [s("strong", null, [ie(g(t(pe)[i.value.id]), 1), r.value ? (h(), y("span", Nt, g(t(Ne)[e.challenge.activeTier]), 1)) : H("", !0)]), s("small", null, [r.value ? H("", !0) : (h(), y(ae, { key: 0 }, [ie(g(t(o).stage(e.active.stage)) + " · ", 1)], 64)), ie(g(t(o).progress(l.value, i.value.items.length / t(3))), 1)])]),
        u[18] || (u[18] = s("span", { "aria-hidden": "true" }, "⌄", -1))
      ], 8, jt), s("button", {
        type: "button",
        class: "moving-icon-button",
        "aria-label": t(o).rules,
        onClick: u[1] || (u[1] = (k) => $.value = "rules")
      }, "?", 8, Dt)]),
      s("div", Gt, [
        s("div", {
          ref_key: "host",
          ref: M,
          class: "moving-canvas"
        }, null, 512),
        j.value ? H("", !0) : (h(), y("div", Ht, [s("div", qt, [
          s("button", {
            type: "button",
            "aria-label": t(o).zoomOut,
            onClick: u[2] || (u[2] = (k) => t(I)?.zoom(1 / 1.2))
          }, "−", 8, Yt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateLeft,
            onClick: u[3] || (u[3] = (k) => t(I)?.rotate(-0.18))
          }, "↶", 8, Zt),
          s("button", {
            type: "button",
            "aria-label": t(o).resetView,
            onClick: u[4] || (u[4] = (k) => t(I)?.resetView())
          }, "⌂", 8, Wt),
          s("button", {
            type: "button",
            "aria-label": t(o).rotateRight,
            onClick: u[5] || (u[5] = (k) => t(I)?.rotate(0.18))
          }, "↷", 8, Kt),
          s("button", {
            type: "button",
            "aria-label": t(o).zoomIn,
            onClick: u[6] || (u[6] = (k) => t(I)?.zoom(1.2))
          }, "+", 8, Xt)
        ]), p.value === "playing" ? (h(), y("span", Ut, g(t(o).rotateHint), 1)) : H("", !0)])),
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
            onClick: u[7] || (u[7] = (k) => n("chapters"))
          }, g(t(o).backChapters), 1)
        ])) : p.value !== "playing" && !f.value && !e.disabled ? (h(), y("section", Jt, [
          s("span", ea, g(p.value === "won" ? "✓" : "…"), 1),
          s("h2", null, g(p.value === "won" ? t(o).won : p.value === "lost" ? t(o).lost : t(o).abandoned), 1),
          s("p", null, g(p.value === "won" ? e.award ? t(o).reward(e.award) : t(o).earned : r.value ? t(o).paidLost : t(o).lostBody), 1),
          r.value ? (h(), y("p", {
            key: 0,
            "data-next-tier": e.challenge.tier
          }, g(t(o).nextTier(e.challenge.tier)), 9, ta)) : H("", !0),
          p.value === "won" ? (h(), y("button", {
            key: 1,
            type: "button",
            class: "moving-primary",
            onClick: u[8] || (u[8] = (k) => n("next"))
          }, g(r.value ? t(o).admission : e.active.stage < t(me).length - 1 ? t(o).next : t(o).chapterComplete), 1)) : r.value ? (h(), y("button", {
            key: 3,
            type: "button",
            class: "moving-primary",
            onClick: u[10] || (u[10] = (k) => n("next"))
          }, g(t(o).admission), 1)) : (h(), y("button", {
            key: 2,
            type: "button",
            class: "moving-primary",
            onClick: u[9] || (u[9] = (k) => n("undo"))
          }, g(t(o).undo), 1)),
          s("button", {
            type: "button",
            class: "moving-plain",
            onClick: u[11] || (u[11] = (k) => n("chapters"))
          }, g(t(o).backChapters), 1)
        ])) : H("", !0)
      ]),
      s("footer", aa, [
        s("div", na, [s("strong", null, [ie(g(t(o).tray) + " ", 1), s("small", null, g(t(o).slots(e.board.tray.length, t(7))), 1)]), s("p", ia, g(w.value), 1)]),
        s("ol", {
          class: ue(["moving-tray", { "is-full": p.value === "lost" }]),
          "aria-label": t(o).tray,
          style: we({ "--moving-capacity": t(7) })
        }, [(h(!0), y(ae, null, ce(K.value, (k, Y) => (h(), y("li", {
          key: Y,
          "aria-label": t(o).slot(k ? t(de)[k.kind] : t(o).emptySlot, Y),
          class: ue({ "is-filled": k })
        }, [k ? (h(), Oe(le, {
          key: 0,
          kind: k.kind
        }, null, 8, ["kind"])) : (h(), y("span", ra, "·"))], 10, la))), 128))], 14, oa),
        s("div", sa, [
          r.value ? H("", !0) : (h(), y("button", {
            key: 0,
            type: "button",
            disabled: e.disabled || f.value || !e.active.moves.length,
            onClick: u[12] || (u[12] = (k) => n("undo"))
          }, "↩ " + g(t(o).undo), 9, da)),
          s("button", {
            type: "button",
            disabled: e.disabled || f.value || !!j.value || p.value !== "playing",
            onClick: q
          }, "⌕ " + g(t(o).pickList), 9, ca),
          r.value ? (h(), y("button", {
            key: 2,
            type: "button",
            disabled: e.disabled || f.value || p.value !== "playing",
            onClick: u[14] || (u[14] = (k) => n("abandon"))
          }, g(t(o).abandon), 9, fa)) : (h(), y("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || f.value,
            onClick: u[13] || (u[13] = (k) => n("restart"))
          }, "↻ " + g(t(o).restart), 9, ua)),
          s("button", {
            type: "button",
            disabled: e.disabled || c.value || !t(m).available,
            "aria-pressed": P.value,
            onClick: v
          }, g(P.value ? t(o).soundOn : t(o).soundOff), 9, va)
        ])
      ]),
      $.value ? (h(), y("div", {
        key: 0,
        class: "moving-modal-backdrop",
        onClick: u[17] || (u[17] = je((k) => $.value = null, ["self"]))
      }, [s("section", {
        ref_key: "dialog",
        ref: A,
        class: "moving-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "moving-board-dialog",
        tabindex: "-1"
      }, [s("header", null, [s("h2", pa, g($.value === "rules" ? t(o).rules : t(o).pickListTitle), 1), s("button", {
        type: "button",
        "aria-label": t(o).close,
        onClick: u[15] || (u[15] = (k) => $.value = null)
      }, "×", 8, ba)]), $.value === "rules" ? (h(), y(ae, { key: 0 }, [
        s("ol", ma, [(h(!0), y(ae, null, ce(t(o).instructions, (k) => (h(), y("li", { key: k }, g(k), 1))), 128))]),
        r.value ? (h(), y("p", ga, g(t(o).admissionBody), 1)) : H("", !0),
        s("p", ha, g(t(o).sessionNote), 1)
      ], 64)) : (h(), y("div", {
        key: 1,
        class: "moving-stack-overview",
        style: we({ "--stack-count": W.value.length })
      }, [(h(!0), y(ae, null, ce(W.value, (k, Y) => (h(), y("section", { key: Y }, [s("h3", null, g(t(o).shelf(Y)), 1), (h(!0), y(ae, null, ce(k, (D, te) => (h(), y(ae, { key: D.id }, [te === 0 ? (h(), y("button", {
        key: 0,
        type: "button",
        "data-item-id": D.id,
        disabled: !F.value.includes(D.id),
        "aria-label": t(o).item(t(de)[D.kind], Y + 1),
        onFocus: (O) => t(I)?.focus(D.id),
        onBlur: u[16] || (u[16] = (O) => t(I)?.focus(null)),
        onClick: (O) => J({
          type: "pick",
          id: D.id
        })
      }, [re(le, { kind: D.kind }, null, 8, ["kind"]), s("span", null, g(t(o).available), 1)], 40, ya)) : (h(), y("div", {
        key: 1,
        "aria-label": `${t(de)[D.kind]} · ${t(o).underneath}`
      }, [re(le, { kind: D.kind }, null, 8, ["kind"])], 8, ka))], 64))), 128))]))), 128))], 4))], 512)])) : H("", !0)
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
}, Ia = ["aria-label"], Aa = { class: "moving-chapter-card chapter-home" }, La = {
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
}, Ha = { id: "moving-confirm-title" }, qa = ["aria-label"], Ya = ["data-tier"], Za = { class: "moving-confirm-actions" }, Wa = ["disabled"], Ka = /* @__PURE__ */ xe({
  __name: "MovingRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const d = e, a = kt(d.bridge, d.chatIdentity), { view: n, busy: i, blocked: r, notice: p, generating: l, failed: f } = a, c = X("chapters"), m = X(null), P = X(null), w = X(!1);
    let j = !1;
    const M = U(() => n.value?.active ?? null), A = U(() => !!M.value && M.value.stage === null && Te(M.value) === "playing"), $ = U(() => n.value?.completed.length === me.length), F = U(() => r.value || w.value || d.generationActive);
    Ve(P, () => {
      m.value = null;
    }), Ze(() => c.value !== "board" ? !1 : (c.value = "chapters", !0));
    async function K(T) {
      await a.act({
        type: "start",
        stage: T
      }) && (c.value = "board");
    }
    async function W() {
      const T = m.value;
      T && (m.value = null, await a.act({ type: T === "admission" ? "challenge" : T }) && (c.value = "board"));
    }
    function I() {
      A.value ? c.value = "board" : m.value = "admission";
    }
    async function Z() {
      M.value && (M.value.stage !== null && M.value.stage < me.length - 1 ? await K(M.value.stage + 1) : I());
    }
    return Be(async () => {
      await a.read(), M.value && (c.value = "board"), j = !0;
    }), Re(() => {
      j && a.read();
    }), Fe(a.dispose), (T, C) => (h(), y("div", { class: ue(["moving-app", { "moving-app-board": c.value === "board" }]) }, [
      t(n) ? (h(), y("div", Ma, [s("span", null, g(t(o).balance(t(n).balance)), 1), s("small", Ca, g(e.generationActive ? t(o).storyBusy : t(i) ? t(l) ? t(o).generating : t(o).saving : t(n).writeState === "ready" && !t(f) ? t(o).saved : ""), 1)])) : H("", !0),
      t(p) || t(f) || t(n)?.pending || t(n)?.writeState === "failed" ? (h(), y("aside", $a, [
        s("p", null, g(t(p) || t(o).saveProblem), 1),
        s("button", {
          type: "button",
          disabled: t(i),
          onClick: C[0] || (C[0] = (..._) => t(a).recover && t(a).recover(..._))
        }, g(t(o).recover), 9, _a),
        t(n)?.writeState === "conflict" ? (h(), y("button", {
          key: 0,
          type: "button",
          disabled: t(i),
          onClick: C[1] || (C[1] = (..._) => t(a).read && t(a).read(..._))
        }, g(t(o).refresh), 9, Sa)) : H("", !0)
      ])) : H("", !0),
      t(n) ? c.value === "board" && M.value && t(n).board ? (h(), Oe(xa, {
        key: M.value.id,
        active: M.value,
        board: t(n).board,
        disabled: t(r) || e.generationActive,
        award: t(n).award,
        challenge: t(n).challenge,
        "sound-enabled": t(n).soundEnabled,
        "set-sound-enabled": t(a).setSoundEnabled,
        onPick: C[2] || (C[2] = (_) => t(a).act({
          type: "pick",
          id: _
        })),
        onUndo: C[3] || (C[3] = (_) => t(a).act({ type: "undo" })),
        onRestart: C[4] || (C[4] = (_) => m.value = "restart"),
        onAbandon: C[5] || (C[5] = (_) => m.value = "abandon"),
        onChapters: C[6] || (C[6] = (_) => c.value = "chapters"),
        onNext: Z,
        onAnimation: C[7] || (C[7] = (_) => w.value = _)
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
        M.value && t(Te)(M.value) === "playing" ? (h(), y("button", {
          key: 0,
          type: "button",
          class: "moving-resume",
          onClick: C[8] || (C[8] = (_) => c.value = "board")
        }, [s("span", null, g(t(o).resume) + " · " + g(t(pe)[M.value.level.id]), 1), C[12] || (C[12] = s("span", { "aria-hidden": "true" }, "→", -1))])) : H("", !0),
        s("article", Aa, [
          s("div", La, [re(le, { kind: "cat" }), re(le, { kind: "plant" })]),
          s("div", Pa, [
            s("small", null, g(t(o).chapterOne), 1),
            s("h2", null, g(t(pe).weekend), 1),
            s("p", null, g(t(o).firstReward), 1)
          ]),
          s("ol", za, [(h(!0), y(ae, null, ce(t(me), (_, R) => (h(), y("li", { key: _.key }, [s("button", {
            type: "button",
            "data-stage": R,
            "aria-label": t(o).stage(R),
            disabled: F.value || A.value || R > t(n).completed.length,
            class: ue({ "is-cleared": t(n).completed.includes(R) }),
            onClick: (B) => K(R)
          }, [s("strong", null, g(R + 1), 1), s("small", null, g(t(n).completed.includes(R) ? "✓" : "+" + t(he).chapterReward), 1)], 10, Ta)]))), 128))])
        ]),
        s("article", Ra, [
          s("div", Ba, [re(le, { kind: "potion" }), re(le, { kind: "star" })]),
          s("div", Fa, [
            s("small", null, [ie(g(t(o).chapterTwo) + " · ", 1), s("span", { "data-tier": t(n).challenge.tier }, g(t(Ne)[t(n).challenge.tier]), 9, Oa)]),
            s("h2", null, g(t(pe).witch), 1),
            s("p", null, g(t(o).challengeTerms), 1)
          ]),
          $.value ? (h(), y("p", ja, g(t(o).tierProgress(t(n).challenge)), 1)) : H("", !0),
          s("button", {
            type: "button",
            class: "moving-primary",
            disabled: F.value || !$.value || !A.value && t(n).balance < t(he).challengeFee,
            onClick: I
          }, g(A.value ? t(o).resume : $.value ? t(o).admission : t(o).challengeLocked), 9, Va),
          $.value && !A.value && t(n).balance < t(he).challengeFee ? (h(), y("p", Na, g(t(o).noFunds), 1)) : H("", !0)
        ]),
        s("p", Da, g(t(o).sessionNote), 1)
      ], 8, Ia)) : H("", !0) : (h(), y("p", Ea, g(t(o).loading), 1)),
      t(l) ? (h(), y("div", Ga, g(t(o).generating), 1)) : H("", !0),
      m.value ? (h(), y("div", {
        key: 6,
        class: "moving-modal-backdrop moving-room-theme",
        onClick: C[11] || (C[11] = je((_) => m.value = null, ["self"]))
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
          onClick: C[9] || (C[9] = (_) => m.value = null)
        }, "×", 8, qa)]),
        s("p", null, g(m.value === "admission" ? t(o).admissionBody : m.value === "abandon" ? t(o).abandonBody : t(o).discard), 1),
        m.value === "admission" && t(n) ? (h(), y("p", {
          key: 0,
          class: "moving-session-note",
          "data-tier": t(n).challenge.tier
        }, [
          ie(g(t(o).tierProgress(t(n).challenge)), 1),
          C[13] || (C[13] = s("br", null, null, -1)),
          ie(g(t(o).tierRule), 1)
        ], 8, Ya)) : H("", !0),
        s("div", Za, [s("button", {
          type: "button",
          class: "moving-plain",
          onClick: C[10] || (C[10] = (_) => m.value = null)
        }, g(t(o).cancel), 1), s("button", {
          type: "button",
          class: "moving-primary",
          disabled: F.value,
          onClick: W
        }, g(m.value === "admission" ? t(o).admission : t(o).confirm), 9, Wa)])
      ], 512)])) : H("", !0)
    ], 2));
  }
}), an = Ka;
export {
  an as default
};
