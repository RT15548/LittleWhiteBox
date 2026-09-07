/* eslint-disable */
import { D as he, G as p, H as K, I as ve, J as b, K as Q, M as Te, P as fe, R as ie, T as _e, W as Be, _ as qe, b as Y, c as ke, f as $, g as o, h as k, j as Z, k as r, l as re, m as G, o as He, p as s, q as Me, s as ze, u as A, v as N, w as Ke, y as C, z as Ce } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as Le } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { t as Se } from "./xiaobai-os-AppDialog-ycKLGrLE.js";
var Ne = { class: "map-viewport" }, Ve = ["viewBox", "aria-label"], Ze = {
  class: "map-viewport-controls",
  "aria-label": "地图缩放"
}, De = /* @__PURE__ */ Y({
  __name: "MapViewport",
  props: {
    viewBox: {},
    resetKey: { default: "" },
    label: {},
    focusPoint: { default: void 0 },
    focusSequence: { default: 0 }
  },
  setup(e) {
    const n = e, l = K(null), t = K([...n.viewBox]), u = K([0, 0]), c = $(() => u.value[0] && u.value[1] ? Math.max(t.value[2] / u.value[0], t.value[3] / u.value[1]) : 1);
    let v;
    he(() => {
      v = new ResizeObserver((m) => {
        const S = m[0].contentRect;
        u.value = [S.width, S.height];
      }), l.value && v.observe(l.value);
    });
    const i = /* @__PURE__ */ new Map();
    let f = null, d = [0, 0], a = 0, y = null, x = !1, R = !1, B = null;
    const D = $(() => t.value.join(" "));
    function q() {
      t.value = [...n.viewBox];
    }
    function T() {
      return c.value;
    }
    function w(m, S) {
      const I = l.value?.getBoundingClientRect();
      if (!I) return [t.value[0], t.value[1]];
      const H = T();
      return [t.value[0] + t.value[2] / 2 + (m - I.left - I.width / 2) * H, t.value[1] + t.value[3] / 2 + (S - I.top - I.height / 2) * H];
    }
    function g(m, S) {
      const I = Math.max(1, n.viewBox[2]), H = Math.min(I * 3, Math.max(Math.min(I * 0.24, 240), t.value[2] * m)), W = H / t.value[2], X = S || [t.value[0] + t.value[2] / 2, t.value[1] + t.value[3] / 2];
      t.value = [
        X[0] - (X[0] - t.value[0]) * W,
        X[1] - (X[1] - t.value[1]) * W,
        H,
        t.value[3] * W
      ];
    }
    function V() {
      if (!n.focusPoint) return;
      const m = Math.min(t.value[2], 620), S = t.value[3] * m / t.value[2];
      t.value = [
        n.focusPoint[0] - m / 2,
        n.focusPoint[1] - S / 2,
        m,
        S
      ];
    }
    function L() {
      const m = [...i.values()];
      m.length === 1 && (f = m[0], d = [t.value[0], t.value[1]]), m.length === 2 && (a = Math.hypot(m[1][0] - m[0][0], m[1][1] - m[0][1]), y = [(m[0][0] + m[1][0]) / 2, (m[0][1] + m[1][1]) / 2], x = !0);
    }
    function z(m) {
      m.button !== 0 || i.size >= 2 || (i.size || (x = !1), i.set(m.pointerId, [m.clientX, m.clientY]), m.target.setPointerCapture(m.pointerId), L());
    }
    function P(m) {
      if (!i.has(m.pointerId)) return;
      i.set(m.pointerId, [m.clientX, m.clientY]);
      const S = [...i.values()];
      if (S.length === 2 && y) {
        const I = Math.hypot(S[1][0] - S[0][0], S[1][1] - S[0][1]), H = [(S[0][0] + S[1][0]) / 2, (S[0][1] + S[1][1]) / 2];
        I > 0 && a > 0 && g(a / I, w(...y)), t.value[0] -= (H[0] - y[0]) * T(), t.value[1] -= (H[1] - y[1]) * T(), a = I, y = H;
      } else if (f) {
        const I = m.clientX - f[0], H = m.clientY - f[1];
        Math.abs(I) + Math.abs(H) > 4 && (x = !0), t.value = [
          d[0] - I * T(),
          d[1] - H * T(),
          t.value[2],
          t.value[3]
        ];
      }
    }
    function O(m) {
      if (!i.delete(m.pointerId)) return;
      const S = m.target;
      S.hasPointerCapture(m.pointerId) && S.releasePointerCapture(m.pointerId), L(), i.size || (f = null, y = null), x && (R = !0, B && clearTimeout(B), B = setTimeout(() => {
        R = !1;
      }, 0));
    }
    function _(m) {
      R && (m.preventDefault(), m.stopPropagation());
    }
    return ve(() => n.resetKey, q, { immediate: !0 }), ve(() => n.focusSequence, V, { flush: "post" }), _e(() => {
      v?.disconnect(), B && clearTimeout(B);
    }), (m, S) => (r(), o("div", Ne, [(r(), o("svg", {
      ref_key: "svg",
      ref: l,
      class: "map-viewport-svg",
      viewBox: D.value,
      preserveAspectRatio: "xMidYMid meet",
      role: "group",
      "aria-label": e.label,
      onWheel: S[0] || (S[0] = re((I) => g(I.deltaY < 0 ? 0.84 : 1.19, w(I.clientX, I.clientY)), ["prevent"])),
      onPointerdown: z,
      onPointermove: P,
      onPointerup: O,
      onPointercancel: O,
      onClickCapture: _
    }, [Te(m.$slots, "default", { unitScale: c.value })], 40, Ve)), s("div", Ze, [
      s("button", {
        type: "button",
        "aria-label": "放大地图",
        onClick: S[1] || (S[1] = (I) => g(0.8))
      }, "+"),
      s("button", {
        type: "button",
        "aria-label": "缩小地图",
        onClick: S[2] || (S[2] = (I) => g(1.25))
      }, "−"),
      s("button", {
        type: "button",
        class: "map-fit",
        onClick: q
      }, "全图")
    ])]));
  }
}), je = De, Qe = {
  class: "map-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, Ye = ["d"], Ge = /* @__PURE__ */ Y({
  __name: "MapIcon",
  props: { name: { default: "pin" } },
  setup(e) {
    const n = {
      search: "m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
      pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
      locate: "M12 2v3m0 14v3M2 12h3m14 0h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
      globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
      layers: "m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5",
      back: "m14 5-7 7 7 7",
      next: "m9 5 7 7-7 7",
      close: "m6 6 12 12M6 18 18 6",
      more: "M5 12h.01M12 12h.01M19 12h.01",
      refresh: "M20 4v6h-6M4 20v-6h6M20 10a8 8 0 0 0-14-5M4 14a8 8 0 0 0 14 5",
      route: "M6 18V6h12v12M3 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0M15 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
      building: "M5 21V4h14v17M3 21h18M9 8h1m4 0h1M9 12h1m4 0h1M10 21v-5h4v5",
      person: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-2a7 7 0 0 1 14 0v2",
      mountain: "m2 20 7-15 5 10 3-6 5 11H2Zm4-8 3 2 2-2",
      tree: "m12 2-7 10h3l-4 6h16l-4-6h3L12 2Zm0 16v4",
      water: "M2 7c4-5 6 5 10 0s6 5 10 0M2 13c4-5 6 5 10 0s6 5 10 0M2 19c4-5 6 5 10 0s6 5 10 0",
      compass: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-6-3-2 5-5 2 2-5 5-2Z"
    };
    return (l, t) => (r(), o("svg", Qe, [s("path", { d: n[e.name] || n.pin }, null, 8, Ye)]));
  }
}), j = Ge;
function ye(e, n) {
  const l = new Map(e.locations.map((c) => [c.key, c])), t = [];
  let u = l.get(n);
  for (; u; )
    t.unshift(u), u = u.parent ? l.get(u.parent) : void 0;
  return t;
}
function we(e) {
  const n = e.locations.filter((l) => !l.parent);
  return n.length === 1 && e.locations.some((l) => l.parent === n[0].key) ? n[0].key : "";
}
function oe(e, n, l) {
  return ye(e, n).find((t) => (t.parent || "") === l)?.key || "";
}
function Xe(e, n) {
  return e.links.flatMap((l) => {
    if (l.from !== n && l.to !== n) return [];
    const t = e.locations.find((u) => u.key === (l.from === n ? l.to : l.from));
    return t ? [{
      location: t,
      link: l,
      outgoing: l.bidirectional || l.from === n
    }] : [];
  });
}
function Fe(e, n) {
  const l = e.locations.filter((d) => (d.parent || "") === n).sort((d, a) => d.key.localeCompare(a.key, "en")), t = l.filter((d) => d.position).map((d) => ({
    location: d,
    x: d.position[0],
    y: d.position[1],
    placed: !0
  }));
  let u = 0;
  for (const d of l.filter((a) => !a.position)) {
    let a, y;
    do {
      const x = u * 2.3999632297, R = 155 * Math.sqrt(u++);
      a = Math.round(500 + Math.cos(x) * R), y = Math.round(420 + Math.sin(x) * R);
    } while (t.some((x) => Math.hypot(x.x - a, x.y - y) < 160));
    t.push({
      location: d,
      x: a,
      y,
      placed: !1
    });
  }
  t.sort((d, a) => d.location.key.localeCompare(a.location.key, "en"));
  const c = new Map(t.map((d) => [d.location.key, d])), v = e.links.flatMap((d) => {
    const a = c.get(oe(e, d.from, n)), y = c.get(oe(e, d.to, n));
    if (!a || !y || a === y) return [];
    const x = (a.x + y.x) / 2, R = (a.y + y.y) / 2;
    return [{
      link: d,
      from: a,
      to: y,
      x,
      y: R,
      path: `M ${a.x} ${a.y} Q ${x + (y.y - a.y) * 0.12} ${R - (y.x - a.x) * 0.12} ${y.x} ${y.y}`
    }];
  }), i = t.length ? Math.min(...t.map((d) => d.x)) - 140 : 0, f = t.length ? Math.min(...t.map((d) => d.y)) - 150 : 0;
  return {
    nodes: t,
    routes: v,
    viewBox: [
      i,
      f,
      t.length ? Math.max(420, Math.max(...t.map((d) => d.x)) - i + 140) : 800,
      t.length ? Math.max(500, Math.max(...t.map((d) => d.y)) - f + 190) : 900
    ]
  };
}
var We = {
  class: "map-landscapes",
  "aria-hidden": "true"
}, Ue = ["transform"], Je = {
  class: "map-world-roads",
  "aria-hidden": "true"
}, et = ["d"], tt = ["d", "marker-end"], at = ["x", "y"], nt = [
  "transform",
  "aria-label",
  "onClick",
  "onKeydown"
], st = { transform: "translate(-14 -20)" }, lt = {
  y: "64",
  class: "map-place-name"
}, rt = {
  key: 0,
  y: "89",
  class: "map-place-status"
}, ot = {
  key: 1,
  y: "89",
  class: "map-place-status"
}, it = /* @__PURE__ */ Y({
  __name: "MapAtlas",
  props: {
    atlas: {},
    region: {},
    currentLocationKey: {},
    selectedLocationKey: {},
    focusKey: {},
    focusSequence: {}
  },
  emits: ["select"],
  setup(e) {
    const n = e, l = $(() => Fe(n.atlas, n.region)), t = $(() => oe(n.atlas, n.currentLocationKey, n.region)), u = $(() => l.value.nodes.find((i) => i.location.key === n.focusKey)), c = "map-arrow-" + fe();
    function v(i, f) {
      return i === "water" ? "water" : i === "forest" ? "tree" : i === "mountain" ? "mountain" : ["world", "region"].includes(f) ? "globe" : f === "outdoor" ? "compass" : "building";
    }
    return (i, f) => (r(), G(je, {
      "view-box": l.value.viewBox,
      "reset-key": e.region,
      label: "世界地图",
      "focus-point": u.value ? [u.value.x, u.value.y] : void 0,
      "focus-sequence": e.focusSequence
    }, {
      default: ie(({ unitScale: d }) => [
        s("defs", null, [s("marker", {
          id: c,
          viewBox: "0 0 10 10",
          refX: "16",
          refY: "5",
          markerWidth: "5",
          markerHeight: "5",
          orient: "auto"
        }, [...f[0] || (f[0] = [s("path", {
          d: "M1 1l8 4-8 4z",
          fill: "var(--map-road-ink)"
        }, null, -1)])])]),
        s("g", We, [(r(!0), o(A, null, Z(l.value.nodes, (a) => (r(), o("g", {
          key: a.location.key,
          transform: `translate(${a.x} ${a.y})`,
          class: Q(`is-${a.location.terrain || "urban"}`)
        }, [...f[1] || (f[1] = [s("path", { d: "M-108-20Q-100-100-32-94T87-56Q127-13 99 48T21 99Q-57 113-90 65T-108-20Z" }, null, -1), s("path", {
          class: "map-contour",
          d: "M-133-22Q-124-126-39-116T110-70Q156-17 124 60T26 123Q-71 139-112 81T-133-22Z"
        }, null, -1)])], 10, Ue))), 128))]),
        s("g", Je, [(r(!0), o(A, null, Z(l.value.routes, (a) => (r(), o("g", {
          key: a.link.id,
          class: Q({
            "is-path": a.link.kind === "path",
            "is-portal": a.link.kind === "portal"
          })
        }, [
          s("path", {
            class: "map-road-casing",
            d: a.path
          }, null, 8, et),
          s("path", {
            class: "map-road-line",
            d: a.path,
            "marker-end": a.link.bidirectional ? void 0 : `url(#${c})`
          }, null, 8, tt),
          a.link.label ? (r(), o("text", {
            key: 0,
            x: a.x,
            y: a.y - 14
          }, b(a.link.label), 9, at)) : k("", !0)
        ], 2))), 128))]),
        (r(!0), o(A, null, Z(l.value.nodes, (a) => (r(), o("g", {
          key: a.location.key,
          class: Q(["map-place", {
            "is-selected": a.location.key === e.selectedLocationKey,
            "is-current": a.location.key === t.value,
            "is-unvisited": a.location.status !== "visited"
          }]),
          transform: `translate(${a.x} ${a.y}) scale(${d * 0.5})`,
          role: "button",
          tabindex: "0",
          "aria-label": `查看${a.location.name}`,
          onClick: re((y) => i.$emit("select", a.location.key), ["stop"]),
          onKeydown: [ke(re((y) => i.$emit("select", a.location.key), ["stop"]), ["enter"]), ke(re((y) => i.$emit("select", a.location.key), ["stop", "prevent"]), ["space"])]
        }, [
          f[2] || (f[2] = s("circle", {
            class: "map-pin-halo",
            r: "39"
          }, null, -1)),
          f[3] || (f[3] = s("path", {
            class: "map-pin-body",
            d: "M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z"
          }, null, -1)),
          s("g", st, [C(j, {
            name: v(a.location.terrain, a.location.scale),
            width: "28",
            height: "28"
          }, null, 8, ["name"])]),
          s("text", lt, b(a.location.name.length > 14 ? a.location.name.slice(0, 13) + "…" : a.location.name), 1),
          a.location.key === t.value ? (r(), o("text", rt, "你在这里")) : a.location.status !== "visited" ? (r(), o("text", ot, "未到访")) : k("", !0),
          s("title", null, b(a.location.name) + b(a.location.brief ? " · " + a.location.brief : ""), 1)
        ], 42, nt))), 128))
      ]),
      _: 1
    }, 8, [
      "view-box",
      "reset-key",
      "focus-point",
      "focus-sequence"
    ]));
  }
}), ut = it, ae;
async function ct() {
  if (!ae) {
    const e = [
      "..",
      "..",
      "..",
      "libs",
      "material-symbols",
      "material-symbols-rounded.woff2"
    ].join("/"), n = new URL(e, import.meta.url);
    ae = new FontFace("Xiaobai Map Symbols", `url("${n.href}")`, {
      display: "block",
      weight: "400"
    }).load(), ae.catch(() => {
      ae = void 0;
    });
  }
  document.fonts.add(await ae);
}
var Fn = Object.freeze([
  "wall",
  "road",
  "water",
  "terrain",
  "furniture",
  "decoration",
  "door",
  "danger",
  "marker",
  "actor",
  "label",
  "grid",
  "magic",
  "secret",
  "light"
]), Wn = Object.freeze([
  "rect",
  "circle",
  "path",
  "curve",
  "icon",
  "label"
]), Un = Object.freeze([
  "door",
  "stairs",
  "elevator",
  "portal",
  "passage",
  "entrance",
  "exit",
  "north",
  "south",
  "east",
  "west",
  "up",
  "down",
  "trap",
  "chest",
  "marker",
  "player",
  "actor"
]), dt = Object.freeze([
  "unknown",
  "wood",
  "stone",
  "tile",
  "carpet",
  "bed-sheet",
  "fabric",
  "tatami",
  "sand",
  "marble",
  "blood",
  "water",
  "grass",
  "forest",
  "glass",
  "dirt",
  "snow",
  "metal",
  "rune",
  "warm-light",
  "cold-light",
  "shadow"
]), Jn = Object.freeze([
  "confirmed",
  "inferred",
  "unknown"
]), es = Object.freeze([
  "door-open",
  "stairs",
  "elevator",
  "portal",
  "passage",
  "entrance",
  "exit",
  "north",
  "south",
  "east",
  "west",
  "up",
  "down",
  "trap",
  "chest",
  "marker",
  "player",
  "actor",
  "chair",
  "table",
  "bed",
  "counter",
  "shelf",
  "sofa",
  "bridge",
  "tree",
  "rock",
  "building",
  "fire",
  "light",
  "water"
]), ts = Object.freeze(/* @__PURE__ */ new Set([
  "floor",
  "ground",
  "surface",
  "base",
  "area",
  "deck",
  "platform",
  "walkway",
  "clearing",
  "yard"
])), vt = Object.freeze({
  unknown: "#bfc5b6",
  wood: "#c4a477",
  stone: "#bac0ad",
  tile: "#ccd2bf",
  carpet: "#b49d91",
  "bed-sheet": "#e0dcca",
  fabric: "#acb69e",
  tatami: "#bebd8f",
  sand: "#ded0a1",
  marble: "#dce0d3",
  blood: "#ab6260",
  water: "#86bdb9",
  grass: "#c7d4ae",
  forest: "#91ac7d",
  glass: "#b5d5ce",
  dirt: "#bda989",
  snow: "#e6eee1",
  metal: "#aabec0",
  rune: "#aca0be",
  "warm-light": "#e3c28c",
  "cold-light": "#afced6",
  shadow: "#758079"
});
function Ae(e, n) {
  return `url(#${n}-material-${e || "unknown"})`;
}
function pt(e, n) {
  return `url(#${n}-face-${e || "unknown"})`;
}
function ne(e) {
  return `color-mix(in srgb, ${vt[e]}, var(--map-surface) var(--scene-material-mix))`;
}
var ht = ["id"], ft = ["stop-color", "stop-opacity"], yt = ["stop-color", "stop-opacity"], mt = ["stop-color", "stop-opacity"], bt = ["id"], gt = ["fill", "fill-opacity"], kt = {
  fill: "none",
  stroke: "var(--scene-shadow)",
  "stroke-width": ".65",
  opacity: ".24"
}, Mt = {
  key: 1,
  d: "M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21"
}, wt = {
  key: 2,
  d: "M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z"
}, $t = {
  key: 3,
  d: "M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17",
  opacity: ".65"
}, xt = {
  key: 4,
  d: "M3 8q6 3 13 0M25 25q7 2 17-1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.3",
  opacity: "1"
}, _t = {
  key: 5,
  d: "M5 32 37 0M12 32 44 0",
  stroke: "var(--scene-highlight)",
  "stroke-width": "2.2"
}, Ct = {
  key: 6,
  d: "M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3"
}, St = {
  key: 7,
  d: "M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2",
  "stroke-linecap": "round"
}, jt = {
  key: 8,
  d: "M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1"
}, At = {
  key: 9,
  d: "M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32",
  opacity: ".55"
}, Et = {
  key: 10,
  d: "m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8"
}, Ot = {
  key: 11,
  d: "M7 8q12-5 16 6t20 7M4 27l6-3"
}, It = {
  key: 12,
  d: "M5 19q5-3 11-1M29 8q6-2 12 1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.4"
}, Pt = {
  key: 0,
  d: "M0 1H48",
  stroke: "var(--scene-highlight)",
  "stroke-width": ".7",
  opacity: ".35"
}, Rt = ["id"], Tt = ["id"], Bt = ["transform", "fill"], qt = /* @__PURE__ */ Y({
  __name: "SceneMaterials",
  props: { prefix: {} },
  setup(e) {
    return (n, l) => (r(), o("defs", null, [
      (r(!0), o(A, null, Z(p(dt), (t) => (r(), o(A, { key: t }, [s("linearGradient", {
        id: `${e.prefix}-face-${t}`,
        x1: "0",
        y1: "0",
        x2: ".7",
        y2: "1"
      }, [
        s("stop", {
          offset: "0",
          "stop-color": `color-mix(in srgb, ${p(ne)(t)}, var(--scene-highlight) 24%)`,
          "stop-opacity": t === "glass" ? 0.35 : 1
        }, null, 8, ft),
        s("stop", {
          offset: ".52",
          "stop-color": p(ne)(t),
          "stop-opacity": t === "glass" ? 0.16 : 1
        }, null, 8, yt),
        s("stop", {
          offset: "1",
          "stop-color": `color-mix(in srgb, ${p(ne)(t)}, var(--scene-shadow) 16%)`,
          "stop-opacity": t === "glass" ? 0.28 : 1
        }, null, 8, mt)
      ], 8, ht), s("pattern", {
        id: `${e.prefix}-material-${t}`,
        width: "48",
        height: "32",
        patternUnits: "userSpaceOnUse",
        class: "scene-texture"
      }, [
        s("rect", {
          width: "48",
          height: "32",
          fill: p(ne)(t),
          "fill-opacity": t === "glass" ? 0.4 : 1
        }, null, 8, gt),
        s("g", kt, [t === "wood" ? (r(), o(A, { key: 0 }, [l[0] || (l[0] = s("path", { d: "M0 0H48M0 16H48M19 0V16M37 16V32" }, null, -1)), l[1] || (l[1] = s("path", {
          d: "M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1",
          opacity: ".5"
        }, null, -1))], 64)) : t === "stone" ? (r(), o("path", Mt)) : t === "tile" ? (r(), o("path", wt)) : t === "marble" ? (r(), o("path", $t)) : t === "water" ? (r(), o("path", xt)) : t === "glass" ? (r(), o("path", _t)) : t === "grass" || t === "forest" ? (r(), o("path", Ct)) : t === "dirt" || t === "sand" ? (r(), o("path", St)) : t === "metal" ? (r(), o("path", jt)) : [
          "carpet",
          "fabric",
          "bed-sheet",
          "tatami"
        ].includes(t) ? (r(), o("path", At)) : t === "rune" ? (r(), o("path", Et)) : t === "blood" ? (r(), o("path", Ot)) : t === "snow" ? (r(), o("path", It)) : k("", !0)]),
        t === "wood" || t === "stone" || t === "metal" ? (r(), o("path", Pt)) : k("", !0)
      ], 8, bt)], 64))), 128)),
      s("radialGradient", {
        id: `${e.prefix}-crown-face`,
        cx: ".32",
        cy: ".25",
        r: ".8"
      }, [...l[2] || (l[2] = [
        s("stop", {
          offset: "0",
          "stop-color": "var(--scene-leaf-light)"
        }, null, -1),
        s("stop", {
          offset: ".6",
          "stop-color": "var(--scene-leaf)"
        }, null, -1),
        s("stop", {
          offset: "1",
          "stop-color": "var(--scene-leaf-dark)"
        }, null, -1)
      ])], 8, Rt),
      (r(), o(A, null, Z(3, (t) => s("symbol", {
        id: `${e.prefix}-crown-${t - 1}`,
        key: t,
        viewBox: "0 0 100 100"
      }, [s("g", {
        transform: `rotate(${t * 37} 50 50)`,
        fill: `url(#${e.prefix}-crown-face)`,
        stroke: "var(--scene-leaf-dark)",
        "stroke-width": ".6"
      }, [...l[3] || (l[3] = [
        s("path", { d: "M49 5Q65 2 73 16Q91 14 93 36Q99 46 90 59Q95 76 76 81Q68 96 50 91Q30 97 23 82Q5 79 9 60Q-1 45 9 34Q7 17 28 16Q33 1 49 5Z" }, null, -1),
        s("circle", {
          cx: "34",
          cy: "32",
          r: "21"
        }, null, -1),
        s("circle", {
          cx: "69",
          cy: "36",
          r: "22"
        }, null, -1),
        s("circle", {
          cx: "30",
          cy: "62",
          r: "20"
        }, null, -1),
        s("circle", {
          cx: "64",
          cy: "67",
          r: "23"
        }, null, -1),
        s("circle", {
          cx: "49",
          cy: "48",
          r: "24"
        }, null, -1),
        s("path", {
          d: "M24 25q8-10 19-5M61 21q11-3 17 8M36 45q9-11 21-8M63 59q9-2 14 6",
          fill: "none",
          stroke: "var(--scene-leaf-light)",
          "stroke-width": "1.4",
          opacity: ".75"
        }, null, -1)
      ])], 8, Bt)], 8, Tt)), 64))
    ]));
  }
}), Ht = qt, zt = /* @__PURE__ */ new Set([
  "water",
  "terrain",
  "furniture",
  "decoration",
  "danger",
  "magic",
  "secret",
  "light"
]), Kt = /* @__PURE__ */ new Set([
  "chair",
  "table",
  "bed",
  "counter",
  "shelf",
  "sofa",
  "bridge",
  "tree",
  "rock"
]), U = (e) => Number(e.toFixed(3)).toString(), ue = (e) => e.geometry.points || [];
function me(e) {
  return ue(e).length >= 3 && (e.closed ?? zt.has(e.category));
}
function se(e) {
  return e.category === "wall" || e.category === "grid" ? !1 : e.shape === "rect" || e.shape === "circle" ? !0 : (e.shape === "path" || e.shape === "curve") && me(e);
}
function Ee(e) {
  return (e.shape === "rect" || e.shape === "circle") && (e.icon !== void 0 && Kt.has(e.icon) || [
    "furniture",
    "decoration",
    "door"
  ].includes(e.category));
}
function Oe(e, n, l) {
  const t = e[l], u = e[(l + 1) % e.length], c = e[l - 1] || (n ? e[e.length - 1] : t), v = e[l + 2] || (n ? e[(l + 2) % e.length] : u), i = (f, d, a) => Math.max(Math.min(d, a), Math.min(Math.max(d, a), f));
  return [[i(t[0] + (u[0] - c[0]) / 6, t[0], u[0]), i(t[1] + (u[1] - c[1]) / 6, t[1], u[1])], [i(u[0] - (v[0] - t[0]) / 6, t[0], u[0]), i(u[1] - (v[1] - t[1]) / 6, t[1], u[1])]];
}
function Lt(e) {
  if (e.shape === "rect") {
    const { x: c, y: v, width: i, height: f } = e.geometry;
    return `M ${c} ${v} h ${i} v ${f} h ${-i} Z`;
  }
  if (e.shape === "circle") {
    const { x: c, y: v, radius: i } = e.geometry;
    return `M ${c - i} ${v} a ${i} ${i} 0 1 0 ${i * 2} 0 a ${i} ${i} 0 1 0 ${-i * 2} 0 Z`;
  }
  const n = ue(e);
  if (n.length < 2) return "";
  const l = me(e);
  if (e.shape === "path") return `M ${n.map(([c, v]) => `${U(c)} ${U(v)}`).join(" L ")}${l ? " Z" : ""}`;
  const t = [`M ${n[0].map(U).join(" ")}`], u = n.length;
  for (let c = 0; c < u - (l ? 0 : 1); c += 1) {
    const [v, i] = Oe(n, l, c), f = n[(c + 1) % u];
    t.push(`C ${v.map(U).join(" ")}, ${i.map(U).join(" ")}, ${f.map(U).join(" ")}`);
  }
  return t.join(" ") + (l ? " Z" : "");
}
function ee(e) {
  if (e.shape === "rect") return { ...e.geometry };
  if (e.shape === "circle") {
    const { x: u, y: c, radius: v } = e.geometry;
    return {
      x: u - v,
      y: c - v,
      width: v * 2,
      height: v * 2
    };
  }
  const n = ue(e);
  if (!n.length) {
    const { x: u, y: c } = e.geometry;
    return {
      x: u,
      y: c,
      width: 0,
      height: 0
    };
  }
  const l = n.map((u) => u[0]), t = n.map((u) => u[1]);
  return {
    x: Math.min(...l),
    y: Math.min(...t),
    width: Math.max(...l) - Math.min(...l),
    height: Math.max(...t) - Math.min(...t)
  };
}
function Nt(e) {
  if (!e.rotation) return;
  const n = ee(e);
  return `rotate(${e.rotation} ${n.x + n.width / 2} ${n.y + n.height / 2})`;
}
function $e(e, n = 1) {
  const l = ee(e), t = [l.x + l.width / 2, l.y + l.height / 2];
  if (e.shape === "label") return t;
  if (e.shape === "icon") return [t[0], t[1] + 23 * n];
  if ((e.category === "terrain" || e.category === "water") && se(e)) return t;
  if (e.shape === "path" || e.shape === "curve") {
    const v = ue(e), i = me(e), f = v.length - (i ? 0 : 1), d = Array.from({ length: f }, (z, P) => Math.hypot(v[(P + 1) % v.length][0] - v[P][0], v[(P + 1) % v.length][1] - v[P][1]));
    let a = d.reduce((z, P) => z + P, 0) / 2, y = 0;
    for (; y < d.length - 1 && a > d[y]; )
      a -= d[y], y += 1;
    const x = v[y], R = v[(y + 1) % v.length], B = d[y] ? a / d[y] : 0.5;
    let D = x[0] + (R[0] - x[0]) * B, q = x[1] + (R[1] - x[1]) * B, T = R[0] - x[0], w = R[1] - x[1];
    if (e.shape === "curve") {
      const [z, P] = Oe(v, i, y), O = 1 - B;
      D = O ** 3 * x[0] + 3 * O ** 2 * B * z[0] + 3 * O * B ** 2 * P[0] + B ** 3 * R[0], q = O ** 3 * x[1] + 3 * O ** 2 * B * z[1] + 3 * O * B ** 2 * P[1] + B ** 3 * R[1], T = 3 * O ** 2 * (z[0] - x[0]) + 6 * O * B * (P[0] - z[0]) + 3 * B ** 2 * (R[0] - P[0]), w = 3 * O ** 2 * (z[1] - x[1]) + 6 * O * B * (P[1] - z[1]) + 3 * B ** 2 * (R[1] - P[1]);
    }
    const g = Math.hypot(T, w);
    if (!g) return [D, q - 13 * n];
    let V = -w / g, L = T / g;
    return (L > 0 || L === 0 && V < 0) && (V = -V, L = -L), [D + V * 13 * n, q + L * 13 * n];
  }
  const u = (e.rotation || 0) * Math.PI / 180, c = e.shape === "circle" ? l.height / 2 : (Math.abs(Math.sin(u)) * l.width + Math.abs(Math.cos(u)) * l.height) / 2;
  return [t[0], t[1] + c + 13 * n];
}
function Vt(e) {
  let n = 2166136261;
  for (const l of e) n = Math.imul(n ^ l.charCodeAt(0), 16777619);
  return n >>> 0;
}
function Zt(e) {
  const n = e.filter((t) => t.category === "terrain" && t.material === "forest" && se(t) && !Ee(t)).sort((t, u) => t.id < u.id ? -1 : t.id > u.id ? 1 : 0), l = /* @__PURE__ */ new Map();
  for (let t = 0; t < n.length; t += 1) {
    const u = n[t], c = ee(u), v = Math.floor(256 / n.length) + (t < 256 % n.length ? 1 : 0), i = c.width && c.height ? Math.min(v, Math.max(1, Math.ceil(c.width * c.height / 2704))) : 0, f = Math.min(i, Math.max(1, Math.ceil(Math.sqrt(i * c.width / Math.max(1, c.height))))), d = Math.ceil(i / Math.max(1, f));
    let a = Vt(u.id);
    const y = () => (a = Math.imul(a, 1664525) + 1013904223 >>> 0, a / 4294967296), x = [];
    for (let R = 0; R < i; R += 1) x.push({
      x: c.x + (R % f + 0.5 + (y() - 0.5) * 0.35) * c.width / f,
      y: c.y + (Math.floor(R / f) + 0.5 + (y() - 0.5) * 0.35) * c.height / d,
      size: Math.min(Math.max(c.width / f, c.height / d), Math.min(c.width, c.height)) * (1.25 + y() * 0.35),
      variant: Math.floor(y() * 3)
    });
    l.set(u.id, x);
  }
  return l;
}
var Dt = [
  "x",
  "y",
  "width",
  "height"
], Qt = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "50"
}, Yt = {
  key: 1,
  width: "100",
  height: "100"
}, Gt = ["clip-path", "fill"], Xt = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "49",
  class: "scene-object-edge"
}, Ft = {
  key: 1,
  x: "1",
  y: "1",
  width: "98",
  height: "98",
  rx: "2",
  class: "scene-object-edge"
}, Wt = ["fill"], Ut = ["fill"], Jt = ["d"], ea = {
  key: 0,
  d: "M9 78H91",
  class: "scene-object-seam"
}, ta = ["x"], aa = /* @__PURE__ */ Y({
  __name: "SceneObject",
  props: {
    element: {},
    prefix: {},
    unitScale: {}
  },
  setup(e) {
    const n = e, l = $(() => ee(n.element)), t = $(() => Math.min(l.value.width, l.value.height) / n.unitScale >= 12), u = $(() => n.element.shape === "circle"), c = $(() => n.element.material), v = $(() => pt(c.value, n.prefix)), i = $(() => Ae(c.value, n.prefix)), f = `scene-object-${fe()}`;
    return (d, a) => (r(), o("svg", {
      x: l.value.x,
      y: l.value.y,
      width: l.value.width,
      height: l.value.height,
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "scene-object"
    }, [s("defs", null, [s("clipPath", { id: f }, [u.value ? (r(), o("circle", Qt)) : (r(), o("rect", Yt))])]), s("g", {
      "clip-path": `url(#${f})`,
      fill: v.value
    }, [u.value ? (r(), o("circle", Xt)) : (r(), o("rect", Ft)), t.value ? (r(), o(A, { key: 2 }, [u.value ? (r(), o("circle", {
      key: 0,
      cx: "50",
      cy: "50",
      r: "44",
      fill: i.value,
      class: "scene-object-inset"
    }, null, 8, Wt)) : (r(), o("rect", {
      key: 1,
      x: "5",
      y: "5",
      width: "90",
      height: "90",
      rx: "2",
      fill: i.value,
      class: "scene-object-inset"
    }, null, 8, Ut)), e.element.icon === "table" || e.element.icon === "counter" ? (r(), o(A, { key: 2 }, [s("path", {
      d: u.value ? "M18 36A35 35 0 0 1 72 22" : "M8 13V8H92",
      class: "scene-object-shine"
    }, null, 8, Jt), e.element.icon === "counter" ? (r(), o("path", ea)) : k("", !0)], 64)) : e.element.icon === "chair" ? (r(), o(A, { key: 3 }, [
      a[0] || (a[0] = s("rect", {
        x: "12",
        y: "29",
        width: "76",
        height: "61",
        rx: "9",
        class: "scene-object-inset"
      }, null, -1)),
      a[1] || (a[1] = s("rect", {
        x: "7",
        y: "5",
        width: "86",
        height: "23",
        rx: "6",
        class: "scene-object-edge"
      }, null, -1)),
      a[2] || (a[2] = s("path", {
        d: "M16 12H84",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : e.element.icon === "bed" ? (r(), o(A, { key: 4 }, [
      a[3] || (a[3] = s("rect", {
        x: "10",
        y: "12",
        width: "80",
        height: "79",
        rx: "5",
        class: "scene-object-inset"
      }, null, -1)),
      a[4] || (a[4] = s("rect", {
        x: "20",
        y: "17",
        width: "60",
        height: "20",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      a[5] || (a[5] = s("path", {
        d: "M12 45H88M17 82H83",
        class: "scene-object-seam"
      }, null, -1)),
      a[6] || (a[6] = s("path", {
        d: "M18 49H82",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : e.element.icon === "shelf" ? (r(), o(A, { key: 5 }, [a[7] || (a[7] = s("path", {
      d: "M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92",
      class: "scene-object-seam"
    }, null, -1)), a[8] || (a[8] = s("path", {
      d: "M8 34H92M8 68H92",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "sofa" ? (r(), o(A, { key: 6 }, [
      a[9] || (a[9] = s("rect", {
        x: "8",
        y: "5",
        width: "84",
        height: "25",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      (r(), o(A, null, Z(3, (y) => s("rect", {
        key: y,
        x: 15 + (y - 1) * 24,
        y: "32",
        width: "22",
        height: "57",
        rx: "5",
        class: "scene-object-inset"
      }, null, 8, ta)), 64)),
      a[10] || (a[10] = s("rect", {
        x: "3",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1)),
      a[11] || (a[11] = s("rect", {
        x: "86",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1))
    ], 64)) : e.element.icon === "bridge" ? (r(), o(A, { key: 7 }, [a[12] || (a[12] = s("path", {
      d: "M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91",
      class: "scene-object-seam"
    }, null, -1)), a[13] || (a[13] = s("path", {
      d: "M11 7V93M89 7V93",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "tree" ? (r(), o(A, { key: 8 }, [a[14] || (a[14] = qe('<circle cx="34" cy="32" r="24" class="scene-object-inset"></circle><circle cx="69" cy="36" r="24" class="scene-object-inset"></circle><circle cx="30" cy="62" r="23" class="scene-object-inset"></circle><circle cx="64" cy="67" r="25" class="scene-object-inset"></circle><circle cx="49" cy="48" r="26" class="scene-object-inset"></circle><path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine"></path>', 6))], 64)) : e.element.icon === "rock" ? (r(), o(A, { key: 9 }, [a[15] || (a[15] = s("path", {
      d: "M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57",
      class: "scene-object-seam"
    }, null, -1)), a[16] || (a[16] = s("path", {
      d: "M12 38 33 17 72 22",
      class: "scene-object-shine"
    }, null, -1))], 64)) : k("", !0)], 64)) : k("", !0)], 8, Gt)], 8, Dt));
  }
}), na = aa, sa = Object.freeze({
  wall: {
    stroke: "var(--scene-edge)",
    fill: "none",
    width: 6
  },
  road: {
    stroke: "var(--scene-road)",
    fill: "var(--scene-road)",
    width: 8
  },
  water: {
    stroke: "var(--scene-water-edge)",
    fill: "var(--scene-water)",
    width: 3
  },
  terrain: {
    stroke: "var(--scene-soft-edge)",
    fill: "var(--scene-ground)",
    width: 0.8
  },
  furniture: {
    stroke: "var(--scene-edge)",
    fill: "var(--scene-object)",
    width: 1
  },
  decoration: {
    stroke: "var(--scene-soft-edge)",
    fill: "var(--scene-object)",
    width: 1
  },
  door: {
    stroke: "var(--map-accent)",
    fill: "var(--scene-object)",
    width: 2
  },
  danger: {
    stroke: "#ff6d7a",
    fill: "rgba(218, 52, 72, .24)",
    width: 2.6,
    dash: "7 4"
  },
  marker: {
    stroke: "#66d9ff",
    fill: "rgba(48, 166, 222, .22)",
    width: 2.2
  },
  actor: {
    stroke: "#f4f8ff",
    fill: "#167fc3",
    width: 2.2
  },
  label: {
    stroke: "none",
    fill: "#e9f4ff",
    width: 0
  },
  grid: {
    stroke: "#54738d",
    fill: "none",
    width: 1,
    dash: "2 5"
  },
  magic: {
    stroke: "#c18cff",
    fill: "rgba(139, 83, 213, .25)",
    width: 2.5
  },
  secret: {
    stroke: "#8198aa",
    fill: "rgba(74, 96, 113, .20)",
    width: 2,
    dash: "3 6"
  },
  light: {
    stroke: "#ffe49a",
    fill: "rgba(255, 210, 91, .22)",
    width: 1.5
  }
}), la = Object.freeze({
  wall: "墙体",
  road: "道路",
  water: "水域",
  terrain: "地形",
  furniture: "家具",
  decoration: "陈设",
  door: "出入口",
  danger: "危险",
  marker: "标记",
  actor: "人物",
  label: "标注",
  grid: "网格",
  magic: "魔法",
  secret: "未知",
  light: "光源"
}), ra = Object.freeze({
  door: "door_open",
  stairs: "stairs",
  elevator: "elevator",
  portal: "captive_portal",
  passage: "conversion_path",
  entrance: "login",
  exit: "exit_to_app",
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "arrow_upward",
  down: "arrow_downward",
  trap: "warning",
  chest: "inventory_2",
  marker: "location_on",
  player: "person_pin_circle",
  actor: "person"
}), oa = Object.freeze({
  door: "D",
  stairs: "S",
  elevator: "E",
  portal: "O",
  passage: "P",
  entrance: "I",
  exit: "O",
  north: "N",
  south: "S",
  east: "E",
  west: "W",
  up: "↑",
  down: "↓",
  trap: "!",
  chest: "X",
  marker: "+",
  player: "P",
  actor: "A"
}), ia = Object.freeze({
  "door-open": "door_open",
  stairs: "stairs",
  elevator: "elevator",
  portal: "captive_portal",
  passage: "conversion_path",
  entrance: "login",
  exit: "exit_to_app",
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "arrow_upward",
  down: "arrow_downward",
  trap: "warning",
  chest: "inventory_2",
  marker: "location_on",
  player: "person_pin_circle",
  actor: "person",
  chair: "chair",
  table: "table_restaurant",
  bed: "bed",
  counter: "countertops",
  shelf: "shelves",
  sofa: "weekend",
  bridge: "road",
  tree: "park",
  rock: "landscape",
  building: "apartment",
  fire: "local_fire_department",
  light: "lightbulb",
  water: "water_drop"
}), ua = Object.freeze({
  wall: "architecture",
  road: "route",
  water: "water_drop",
  terrain: "terrain",
  furniture: "chair",
  decoration: "category",
  door: "door_open",
  danger: "warning",
  marker: "location_on",
  actor: "person",
  label: "label",
  grid: "grid_on",
  magic: "auto_awesome",
  secret: "visibility_off",
  light: "lightbulb"
}), pe = Object.freeze({
  terrain: 10,
  water: 20,
  grid: 25,
  road: 30,
  wall: 40,
  furniture: 50,
  decoration: 52,
  door: 55,
  danger: 60,
  secret: 62,
  magic: 65,
  light: 70,
  marker: 80,
  actor: 85,
  label: 90
}), ca = Object.freeze({
  neutral: {
    background: "#071019",
    glow: "rgba(59, 157, 219, .13)",
    accent: "#55baff"
  },
  warm: {
    background: "#130e0b",
    glow: "rgba(235, 142, 65, .14)",
    accent: "#f2ad68"
  },
  cold: {
    background: "#07121b",
    glow: "rgba(88, 190, 231, .14)",
    accent: "#73d2f4"
  },
  dark: {
    background: "#05070a",
    glow: "rgba(92, 114, 137, .10)",
    accent: "#8aa6bd"
  },
  mystic: {
    background: "#0d0a17",
    glow: "rgba(156, 94, 231, .16)",
    accent: "#c89aff"
  },
  danger: {
    background: "#16090d",
    glow: "rgba(239, 66, 85, .15)",
    accent: "#ff7180"
  },
  calm: {
    background: "#071411",
    glow: "rgba(61, 189, 158, .13)",
    accent: "#69d8b8"
  }
}), Ie = Object.freeze({
  world: "世界",
  region: "区域",
  city: "城市",
  district: "区域",
  building: "建筑",
  floor: "楼层",
  room: "房间",
  outdoor: "户外"
}), da = Object.freeze({
  door: "门",
  stairs: "楼梯",
  elevator: "电梯",
  path: "小径",
  road: "道路",
  portal: "传送门",
  passage: "通道"
});
function va(e, n) {
  return e < n ? -1 : e > n ? 1 : 0;
}
function pa(e, n) {
  const l = sa[e.category], t = se(e), u = t && (e.material || e.category === "water") ? Ae(e.material || "water", n) : "", c = e.certainty === "inferred" ? "8 6" : e.certainty === "unknown" ? "3 7" : l.dash;
  return {
    ...l,
    fill: t ? u || l.fill : "none",
    opacity: e.certainty === "unknown" ? 0.48 : e.certainty === "inferred" ? 0.72 : 1,
    dash: c,
    icon: e.icon ? ia[e.icon] : e.kind ? ra[e.kind] : ua[e.category],
    fallback: e.kind ? oa[e.kind] : la[e.category].slice(0, 1),
    z: pe[e.category]
  };
}
function ha(e) {
  const n = (l) => {
    if (!se(l)) return 0;
    const t = ee(l);
    return t.width * t.height;
  };
  return [...e].sort((l, t) => pe[l.category] - pe[t.category] || n(t) - n(l) || va(l.id, t.id));
}
var fa = ["data-element", "opacity"], ya = ["transform"], ma = ["d"], ba = ["d", "stroke-width"], ga = [
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap"
], ka = [
  "d",
  "stroke",
  "stroke-opacity",
  "stroke-dasharray"
], Ma = ["id"], wa = ["d"], $a = ["clip-path"], xa = [
  "href",
  "x",
  "y",
  "width",
  "height"
], _a = ["transform"], Ca = {
  key: 0,
  r: "19",
  class: "scene-player-halo"
}, Sa = ["stroke"], ja = {
  key: 1,
  class: "map-material-symbol",
  "aria-hidden": "true"
}, Aa = {
  key: 2,
  class: "map-symbol-fallback",
  "aria-hidden": "true"
}, Ea = ["x", "y"], Oa = /* @__PURE__ */ Y({
  __name: "MapScene",
  props: { scene: {} },
  setup(e) {
    const n = e, l = K(!1);
    he(() => {
      ct().then(() => {
        l.value = !0;
      }).catch(() => {
        l.value = !1;
      });
    });
    const t = `xiaobai-map-scene-${fe()}`, u = $(() => ca[n.scene.mood || "neutral"]), c = $(() => Zt(n.scene.elements)), v = $(() => ha(n.scene.elements).map((i, f) => ({
      element: i,
      bounds: ee(i),
      path: Lt(i),
      transform: Nt(i),
      area: se(i),
      presentation: pa(i, t),
      clipId: `${t}-area-${f}`,
      object: Ee(i)
    })));
    return (i, f) => (r(), G(je, {
      class: "map-scene-viewport",
      style: Me({ "--scene-glow": u.value.glow }),
      "view-box": e.scene.viewBox,
      "reset-key": e.scene.key,
      label: `${e.scene.name} 场景地图`
    }, {
      default: ie(({ unitScale: d }) => [
        C(Ht, { prefix: t }),
        (r(!0), o(A, null, Z(v.value, (a) => (r(), o("g", {
          key: a.element.id,
          class: Q(["map-scene-element", [`is-${a.element.category}`, `is-${a.element.certainty || "confirmed"}`]]),
          "data-element": a.element.id,
          opacity: a.presentation.opacity
        }, [s("g", { transform: a.transform }, [
          a.object ? (r(), G(na, {
            key: 0,
            element: a.element,
            prefix: t,
            "unit-scale": d
          }, null, 8, ["element", "unit-scale"])) : a.path ? (r(), o(A, { key: 1 }, [
            a.element.category === "wall" ? (r(), o("path", {
              key: 0,
              d: a.path,
              fill: "none",
              stroke: "var(--scene-shadow)",
              "stroke-width": "9",
              opacity: ".18",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ma)) : k("", !0),
            a.element.category === "road" && !a.area ? (r(), o("path", {
              key: 1,
              d: a.path,
              fill: "none",
              stroke: "var(--scene-soft-edge)",
              "stroke-width": a.presentation.width + 2,
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ba)) : k("", !0),
            s("path", {
              d: a.path,
              fill: a.presentation.fill,
              stroke: a.presentation.stroke,
              "stroke-width": a.presentation.width,
              "stroke-dasharray": a.presentation.dash,
              "stroke-linejoin": "round",
              "stroke-linecap": a.element.category === "wall" ? "butt" : "round",
              "fill-rule": "evenodd",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ga),
            a.element.category === "wall" ? (r(), o("path", {
              key: 2,
              d: a.path,
              fill: "none",
              stroke: a.element.material ? p(ne)(a.element.material) : "var(--scene-wall)",
              "stroke-width": "3.5",
              "stroke-opacity": a.element.material === "glass" ? 0.4 : 1,
              "stroke-dasharray": a.presentation.dash,
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ka)) : k("", !0)
          ], 64)) : k("", !0),
          c.value.has(a.element.id) ? (r(), o(A, { key: 2 }, [s("defs", null, [s("clipPath", { id: a.clipId }, [s("path", {
            d: a.path,
            "clip-rule": "evenodd"
          }, null, 8, wa)], 8, Ma)]), s("g", {
            "clip-path": `url(#${a.clipId})`,
            class: "scene-forest-decoration",
            "aria-hidden": "true"
          }, [(r(!0), o(A, null, Z(c.value.get(a.element.id), (y, x) => (r(), o("use", {
            key: x,
            href: `#${t}-crown-${y.variant}`,
            x: y.x - y.size / 2,
            y: y.y - y.size / 2,
            width: y.size,
            height: y.size
          }, null, 8, xa))), 128))], 8, $a)], 64)) : k("", !0),
          a.element.shape === "icon" ? (r(), o("g", {
            key: 3,
            class: "map-scene-icon",
            transform: `translate(${a.bounds.x} ${a.bounds.y}) scale(${d})`
          }, [
            a.element.kind === "player" ? (r(), o("circle", Ca)) : k("", !0),
            s("circle", {
              r: "11",
              stroke: a.presentation.stroke
            }, null, 8, Sa),
            l.value ? (r(), o("text", ja, b(a.presentation.icon), 1)) : (r(), o("text", Aa, b(a.presentation.fallback), 1))
          ], 8, _a)) : k("", !0)
        ], 8, ya)], 10, fa))), 128)),
        s("g", {
          class: "scene-labels",
          style: Me({ "--scene-unit-scale": d })
        }, [(r(!0), o(A, null, Z(v.value, (a) => (r(), o(A, { key: a.element.id }, [a.element.label ? (r(), o("text", {
          key: 0,
          class: Q(["map-scene-label", { "is-primary": a.element.shape === "label" }]),
          x: p($e)(a.element, d)[0],
          y: p($e)(a.element, d)[1]
        }, b(a.element.label), 11, Ea)) : k("", !0)], 64))), 128))], 4)
      ]),
      _: 1
    }, 8, [
      "style",
      "view-box",
      "reset-key",
      "label"
    ]));
  }
}), Ia = Oa, Pa = { class: "map-dialog-header" }, Ra = { key: 0 }, Ta = { class: "map-settings-content" }, Ba = { class: "map-auto-setting" }, qa = ["aria-checked", "disabled"], Ha = { class: "map-settings-section" }, za = ["disabled"], Ka = { key: 0 }, La = { class: "map-settings-section" }, Na = { key: 0 }, Va = ["disabled"], Za = {
  key: 0,
  class: "map-setting-note",
  role: "status"
}, Da = ["disabled"], Qa = /* @__PURE__ */ Y({
  __name: "MapSettings",
  props: {
    autoMaintenance: { type: Boolean },
    busy: { type: Boolean },
    refreshDisabled: { type: Boolean },
    autoToggleBusy: { type: Boolean },
    disabledReason: {},
    hasMap: { type: Boolean },
    status: {},
    maintenanceMessage: {},
    maintenanceError: { type: Boolean },
    notice: {},
    noticeError: { type: Boolean }
  },
  emits: [
    "close",
    "setAuto",
    "update",
    "rebuild",
    "refresh"
  ],
  setup(e) {
    return (n, l) => (r(), G(Se, {
      class: "map-dialog map-settings",
      "aria-labelledby": "map-settings-title",
      onClose: l[5] || (l[5] = (t) => n.$emit("close"))
    }, {
      default: ie(() => [
        s("header", Pa, [l[6] || (l[6] = s("div", null, [s("small", null, "让地图跟上你的故事"), s("h2", { id: "map-settings-title" }, "地图设置")], -1)), s("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "关闭地图设置",
          onClick: l[0] || (l[0] = (t) => n.$emit("close"))
        }, [C(j, { name: "close" })])]),
        e.status || e.notice || e.maintenanceMessage ? (r(), o("section", {
          key: 0,
          class: Q(["map-settings-feedback", { "is-error": e.notice ? e.noticeError : e.maintenanceError }]),
          role: "status"
        }, [s("strong", null, b(e.notice ? e.notice === e.maintenanceMessage ? "最近一次更新" : "操作提示" : e.status || "最近一次更新"), 1), e.notice || e.maintenanceMessage ? (r(), o("p", Ra, b(e.notice || e.maintenanceMessage), 1)) : k("", !0)], 2)) : k("", !0),
        s("div", Ta, [
          s("section", Ba, [l[8] || (l[8] = s("div", null, [s("h3", null, "随对话自动更新"), s("p", null, "你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。")], -1)), s("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": e.autoMaintenance,
            "aria-label": "随对话自动更新",
            disabled: e.autoToggleBusy,
            onClick: l[1] || (l[1] = (t) => n.$emit("setAuto", !e.autoMaintenance))
          }, [...l[7] || (l[7] = [s("span", null, null, -1)])], 8, qa)]),
          s("section", Ha, [
            C(j, { name: "refresh" }),
            l[9] || (l[9] = s("h3", null, "补充最近的变化", -1)),
            l[10] || (l[10] = s("p", null, "根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。", -1)),
            s("button", {
              type: "button",
              class: "map-primary-button",
              disabled: e.busy || !!e.disabledReason || !e.hasMap,
              onClick: l[2] || (l[2] = (t) => n.$emit("update"))
            }, b(e.busy ? e.status || "请稍候…" : "更新地图"), 9, za),
            e.hasMap ? k("", !0) : (r(), o("small", Ka, "请先建立世界地图"))
          ]),
          s("section", La, [
            C(j, { name: "globe" }),
            s("h3", null, b(e.hasMap ? "重新绘制世界" : "建立世界地图"), 1),
            l[11] || (l[11] = s("p", null, "依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。", -1)),
            e.hasMap ? (r(), o("p", Na, "新地图保存成功后替换原图；失败时保留原图。")) : k("", !0),
            s("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: e.busy || !!e.disabledReason,
              onClick: l[3] || (l[3] = (t) => n.$emit("rebuild"))
            }, b(e.busy ? e.status || "请稍候…" : e.hasMap ? "重新绘制" : "绘制世界地图"), 9, Va)
          ]),
          e.disabledReason ? (r(), o("p", Za, b(e.disabledReason), 1)) : k("", !0),
          s("button", {
            type: "button",
            class: "map-sync-button",
            disabled: e.busy || e.refreshDisabled,
            onClick: l[4] || (l[4] = (t) => n.$emit("refresh"))
          }, [C(j, { name: "refresh" }), l[12] || (l[12] = N("同步已保存的地图", -1))], 8, Da),
          l[13] || (l[13] = s("p", { class: "map-setting-note" }, "同步只读取保存结果，不会重新生成地图。绘制或更新开始后，可以离开此页面。", -1))
        ])
      ]),
      _: 1
    }));
  }
}), Ya = Qa, Ga = { class: "map-search-input" }, Xa = {
  class: "map-search-filters",
  "aria-label": "地点筛选"
}, Fa = ["aria-pressed", "onClick"], Wa = { class: "map-search-results" }, Ua = ["onClick"], Ja = { class: "map-result-icon" }, en = { key: 0 }, tn = {
  key: 0,
  class: "map-search-empty"
}, an = /* @__PURE__ */ Y({
  __name: "MapSearch",
  props: { atlas: {} },
  emits: ["close", "select"],
  setup(e) {
    const n = e, l = K(""), t = K("all"), u = $(() => n.atlas.locations.filter((c) => [
      c.name,
      c.brief,
      n.atlas.locations.find((v) => v.key === c.parent)?.name
    ].some((v) => v?.toLocaleLowerCase().includes(l.value.trim().toLocaleLowerCase())) && (t.value === "all" || (t.value === "unvisited" ? c.status !== "visited" : c.status === "visited"))));
    return (c, v) => (r(), G(Se, {
      class: "map-dialog map-search-dialog",
      "aria-label": "查找地点",
      onClose: v[2] || (v[2] = (i) => c.$emit("close"))
    }, {
      default: ie(() => [
        s("header", Ga, [
          C(j, { name: "search" }),
          Ce(s("input", {
            "onUpdate:modelValue": v[0] || (v[0] = (i) => l.value = i),
            type: "search",
            "aria-label": "搜索地点",
            placeholder: "想去哪里？",
            autofocus: ""
          }, null, 512), [[He, l.value]]),
          s("button", {
            type: "button",
            onClick: v[1] || (v[1] = (i) => c.$emit("close"))
          }, "取消")
        ]),
        s("nav", Xa, [(r(), o(A, null, Z([
          {
            id: "all",
            name: "全部地点"
          },
          {
            id: "unvisited",
            name: "还没去过"
          },
          {
            id: "visited",
            name: "已到访"
          }
        ], (i) => s("button", {
          key: i.id,
          type: "button",
          "aria-pressed": t.value === i.id,
          onClick: (f) => t.value = i.id
        }, b(i.name), 9, Fa)), 64))]),
        s("div", Wa, [
          s("small", null, b(u.value.length) + " 个地点", 1),
          (r(!0), o(A, null, Z(u.value, (i) => (r(), o("button", {
            key: i.key,
            type: "button",
            class: "map-search-result",
            onClick: (f) => c.$emit("select", i.key)
          }, [
            s("span", Ja, [C(j, { name: "pin" })]),
            s("span", null, [
              s("strong", null, b(i.name), 1),
              s("small", null, b(p(Ie)[i.scale]) + " · " + b(i.status === "visited" ? "已到访" : "未到访"), 1),
              i.brief ? (r(), o("p", en, b(i.brief), 1)) : k("", !0)
            ]),
            C(j, { name: "next" })
          ], 8, Ua))), 128)),
          u.value.length ? k("", !0) : (r(), o("div", tn, [
            C(j, { name: "search" }),
            v[3] || (v[3] = s("h3", null, "还没有找到这个地点", -1)),
            v[4] || (v[4] = s("p", null, "试试其他名称，或看看全部地点。", -1))
          ]))
        ])
      ]),
      _: 1
    }));
  }
}), nn = an, sn = {
  class: "map-place-detail",
  "aria-labelledby": "map-place-title"
}, ln = { id: "map-place-title" }, rn = { class: "map-place-content" }, on = {
  key: 0,
  class: "map-place-full-name"
}, un = {
  key: 1,
  class: "map-address"
}, cn = { class: "map-place-intro" }, dn = {
  key: 2,
  class: "map-place-actions"
}, vn = {
  key: 3,
  class: "map-detail-section"
}, pn = { class: "map-people" }, hn = {
  key: 4,
  class: "map-detail-section"
}, fn = ["onClick"], yn = /* @__PURE__ */ Y({
  __name: "MapPlaceDetail",
  props: {
    location: {},
    map: {},
    currentKey: {}
  },
  emits: [
    "close",
    "scene",
    "explore",
    "select"
  ],
  setup(e) {
    const n = e, l = $(() => ye(n.map.atlas, n.location.key).slice(0, -1)), t = $(() => n.map.atlas.locations.filter((i) => i.parent === n.location.key)), u = $(() => n.map.atlas.actors.filter((i) => i.locationKey === n.location.key)), c = $(() => Xe(n.map.atlas, n.location.key)), v = $(() => n.location.sceneKey ? n.map.scenes[n.location.sceneKey] : void 0);
    return (i, f) => (r(), o("section", sn, [
      f[7] || (f[7] = s("div", {
        class: "map-sheet-grip",
        "aria-hidden": "true"
      }, null, -1)),
      s("header", null, [s("div", null, [s("small", null, b(p(Ie)[e.location.scale]) + " · " + b(e.currentKey === e.location.key ? "当前位置" : e.location.status === "visited" ? "已到访" : "未到访"), 1), s("h2", ln, b(e.location.name), 1)]), s("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "关闭地点详情",
        onClick: f[0] || (f[0] = (d) => i.$emit("close"))
      }, [C(j, { name: "close" })])]),
      s("div", rn, [
        e.location.name.length > 24 ? (r(), o("p", on, b(e.location.name), 1)) : k("", !0),
        l.value.length ? (r(), o("p", un, [C(j, { name: "pin" }), N(b(l.value.map((d) => d.name).join(" · ")), 1)])) : k("", !0),
        s("p", cn, b(e.location.brief || "这个地点已记录在世界地图上，更多介绍等待故事展开。"), 1),
        t.value.length || v.value ? (r(), o("div", dn, [t.value.length ? (r(), o("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          onClick: f[1] || (f[1] = (d) => i.$emit("explore"))
        }, [C(j, { name: "compass" }), N("探索这里 · " + b(t.value.length) + " 处", 1)])) : k("", !0), v.value ? (r(), o("button", {
          key: 1,
          type: "button",
          class: "map-secondary-button",
          onClick: f[2] || (f[2] = (d) => i.$emit("scene"))
        }, [C(j, { name: "layers" }), f[3] || (f[3] = N("查看场景图", -1))])) : k("", !0)])) : k("", !0),
        u.value.length ? (r(), o("section", vn, [f[4] || (f[4] = s("h3", null, "记录在这里的人物", -1)), s("p", pn, [(r(!0), o(A, null, Z(u.value, (d) => (r(), o("span", { key: d.actorKey }, [C(j, { name: "person" }), N(b(d.displayName), 1)]))), 128))])])) : k("", !0),
        c.value.length ? (r(), o("section", hn, [f[5] || (f[5] = s("h3", null, "相连的地方", -1)), (r(!0), o(A, null, Z(c.value, (d) => (r(), o("button", {
          key: d.link.id,
          type: "button",
          class: "map-connection",
          onClick: (a) => i.$emit("select", d.location.key)
        }, [
          C(j, { name: "route" }),
          s("span", null, [s("strong", null, b(d.location.name), 1), s("small", null, b(d.link.label || p(da)[d.link.kind]) + b(d.link.bidirectional ? "" : d.outgoing ? " · 单向前往" : " · 仅可从对面到达"), 1)]),
          C(j, { name: "next" })
        ], 8, fn))), 128))])) : k("", !0),
        f[6] || (f[6] = s("p", { class: "map-detail-footnote" }, "查看地图不会改变你在故事中的位置", -1))
      ])
    ]));
  }
}), mn = yn;
function J(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function xe(e) {
  return e.maintenanceStatus === "maintaining" || e.maintenanceStatus === "rebuilding";
}
function bn(e) {
  const n = K(structuredClone(Be(e.initialState))), l = K(null), t = K(""), u = K(!1);
  let c = !1, v = 0, i = 0, f = () => {
  };
  const d = $(() => n.value.status === "unconfirmed" || n.value.writeState === "unconfirmed"), a = $(() => l.value !== null || ["loading", "saving"].includes(n.value.status) || ["maintaining", "rebuilding"].includes(n.value.maintenanceStatus || "")), y = $(() => a.value ? "正在更新地图，请稍候" : d.value ? "请先核实上一次保存结果" : n.value.status === "conflict" ? "保存的版本不一致，请先处理保存问题" : n.value.status !== "ready" ? n.value.message || "地图暂时不可更新" : n.value.chatIdentity ? "" : "请先打开一个聊天"), x = $(() => n.value.maintenanceStatus === "rebuilding" || l.value === "rebuild" ? "正在绘制世界…" : n.value.maintenanceStatus === "maintaining" || l.value === "maintain" ? "正在更新地图…" : l.value === "confirm" ? "正在核实保存…" : a.value ? "正在同步…" : ""), R = $(() => n.value.message || t.value), B = $(() => n.value.message ? [
    "blocked",
    "error",
    "conflict",
    "unconfirmed"
  ].includes(n.value.status) : u.value);
  function D(w) {
    const g = xe(n.value);
    n.value = structuredClone(w), xe(w) ? (t.value = "", u.value = !1) : g && (t.value = w.maintenanceMessage || "", u.value = w.maintenanceStatus === "error");
  }
  function q(w, g) {
    const V = w instanceof Error ? w.message : String(w);
    return V.includes("聊天已切换") ? "聊天已切换，请重新打开地图。" : V === "host_request_timeout" ? "等待结果超时，更新可能仍在进行。请稍后查看，不要重复提交。" : g === "confirm" ? "仍无法确认保存结果，请稍后再试。" : g === "adopt" ? "未能恢复已保存的版本，当前更改仍暂停保存。" : g === "settings" ? "设置未能保存，请重试。" : "地图操作未完成，请稍后重试。";
  }
  async function T(w, g, V = {}) {
    if (l.value) return;
    const L = ++v, z = i, P = n.value.chatIdentity;
    l.value = g, t.value = "", u.value = !1;
    try {
      const O = await e.bridge.request(w, {
        chatIdentity: P,
        ...V
      }, 35e3);
      if (!c || L !== v || n.value.chatIdentity !== P) return;
      const _ = J(O) ? O.result : void 0, m = J(_) && J(_.state) ? _.state : _;
      z === i && J(m) && m.chatIdentity === P && D(m), (g === "maintain" || g === "rebuild") && J(_) && typeof _.message == "string" && _.message && (t.value = _.message), g === "refresh" && n.value.status === "ready" && (t.value = "已同步保存的地图。"), g === "settings" && (t.value = n.value.autoMaintenance ? "自动更新已开启。" : "自动更新已关闭。"), g === "confirm" && n.value.status === "ready" && (t.value = "保存已确认。"), g === "adopt" && J(_) && _.adoption === "adopted" && (t.value = "已恢复当前聊天中保存的 OS 数据。");
    } catch (O) {
      c && L === v && n.value.chatIdentity === P && (t.value = q(O, g), u.value = !0);
    } finally {
      c && L === v && (l.value = null);
    }
  }
  return he(() => {
    c = !0, f = e.bridge.subscribe((w) => {
      if (w.type === "map/state") {
        const g = w.payload.state;
        if (g.chatIdentity !== n.value.chatIdentity) return;
        i += 1, D(g);
      } else w.type === "map/error" && (i += 1, u.value = !0, t.value = w.payload.message || "地图暂时无法读取，请重新打开。");
    });
  }), _e(() => {
    c = !1, v += 1, f();
  }), {
    state: n,
    activeRequest: l,
    busy: a,
    disabledReason: y,
    requiresConfirmation: d,
    status: x,
    notice: R,
    isError: B,
    dismissNotice: () => {
      t.value = "", u.value = !1;
    },
    refresh: () => {
      if (!a.value && !d.value) return T("map/refresh", "refresh");
    },
    confirmSave: () => {
      if (!a.value) return T("map/confirm-save", "confirm");
    },
    adopt: () => {
      if (!a.value) return T("map/adopt-server-state", "adopt");
    },
    setAuto: (w) => T("map/set-auto-maintenance", "settings", { enabled: w }),
    update: () => {
      if (!y.value && n.value.map) return T("map/maintain-once", "maintain");
    },
    rebuild: () => {
      if (!y.value) return T("map/rebuild", "rebuild");
    }
  };
}
var gn = { class: "map-top" }, kn = { class: "map-search-bar" }, Mn = ["disabled"], wn = {
  key: 1,
  class: "map-search-entry"
}, $n = {
  key: 0,
  class: "map-view-switch",
  "aria-label": "地图视图"
}, xn = ["aria-pressed"], _n = ["aria-pressed"], Cn = {
  key: 1,
  class: "map-region-trail",
  "aria-label": "当前查看区域"
}, Sn = ["onClick"], jn = {
  key: 2,
  class: "map-progress",
  role: "status"
}, An = ["disabled"], En = ["disabled"], On = ["disabled"], In = {
  key: 1,
  class: "map-empty"
}, Pn = ["disabled"], Rn = {
  key: 0,
  class: "map-setting-note"
}, Tn = {
  key: 1,
  class: "map-empty"
}, Bn = {
  key: 1,
  class: "map-empty map-first-map"
}, qn = { class: "map-empty-art" }, Hn = ["disabled"], zn = {
  key: 1,
  class: "map-setting-note"
}, Kn = ["disabled"], Ln = ["aria-expanded"], Nn = {
  key: 1,
  class: "map-key"
}, Vn = {
  key: 3,
  class: "map-region-card"
}, Zn = { class: "map-region-icon" }, Dn = {
  key: 4,
  class: "map-scene-caption"
}, Qn = /* @__PURE__ */ Y({
  __name: "MapApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: n, activeRequest: l, busy: t, disabledReason: u, requiresConfirmation: c, status: v, notice: i, isError: f, dismissNotice: d, refresh: a, confirmSave: y, adopt: x, setAuto: R, update: B, rebuild: D } = bn(e), q = K(n.value.map ? we(n.value.map.atlas) : ""), T = K(""), w = K(null), g = $(() => w.value !== null), V = K(""), L = K(0), z = K(!1), P = K(!1), O = K(!1), _ = $(() => n.value.map?.atlas), m = $(() => _.value?.actors.find((E) => E.actorKey === "player")?.locationKey || ""), S = $(() => _.value?.locations.find((E) => E.key === m.value)), I = $(() => _.value?.locations.find((E) => E.key === T.value)), H = $(() => _.value?.locations.find((E) => E.key === (w.value || m.value))), W = $(() => g.value && H.value?.sceneKey ? n.value.map?.scenes[H.value.sceneKey] : void 0), X = $(() => _.value?.locations.find((E) => E.key === q.value)), ce = $(() => _.value?.locations.filter((E) => (E.parent || "") === q.value) || []), be = $(() => ce.value.filter((E) => E.status !== "visited").length), Pe = $(() => _.value ? ye(_.value, q.value) : []);
    ve(() => n.value, (E, h) => {
      const M = E.chatIdentity !== h.chatIdentity;
      (!h.map || M || q.value && !E.map?.atlas.locations.some((F) => F.key === q.value)) && (q.value = E.map ? we(E.map.atlas) : ""), (M || !E.map?.atlas.locations.some((F) => F.key === T.value)) && (T.value = ""), (M || w.value && !E.map?.atlas.locations.some((F) => F.key === w.value)) && (w.value = null), M && (z.value = !1, P.value = !1);
    });
    function te(E) {
      q.value = E, T.value = "", w.value = null, O.value = !1;
    }
    async function le(E, h = !1) {
      const M = _.value?.locations.find((F) => F.key === E);
      M && (w.value = null, T.value = E, P.value = !1, O.value = !1, h && (q.value = M.parent || ""), await Ke(), V.value = _.value ? oe(_.value, E, q.value) : E, L.value += 1);
    }
    async function Re() {
      S.value && await le(S.value.key, !0);
    }
    function de(E = "") {
      w.value = E === m.value ? "" : E, O.value = !1, P.value = !1;
    }
    function ge() {
      w.value = null, O.value = !1;
    }
    return Le(() => O.value ? (O.value = !1, !0) : g.value ? (ge(), !0) : T.value ? (T.value = "", !0) : q.value ? (te(X.value?.parent || ""), !0) : !1), (E, h) => (r(), o("main", { class: Q(["map-app", {
      "has-view-switch": _.value?.locations.length,
      "is-scene-view": g.value
    }]) }, [
      s("div", gn, [
        s("header", kn, [
          C(j, { name: g.value ? "layers" : "search" }, null, 8, ["name"]),
          g.value ? (r(), o("div", wn, [N(b(H.value?.name || "当前场景"), 1), s("small", null, b(w.value ? "正在查看已记录的场景" : "看看你身边的布局"), 1)])) : (r(), o("button", {
            key: 0,
            type: "button",
            class: "map-search-entry",
            disabled: !_.value?.locations.length,
            onClick: h[0] || (h[0] = (M) => P.value = !0)
          }, [...h[22] || (h[22] = [N("想去哪里？", -1), s("small", null, "搜索世界中的地点", -1)])], 8, Mn)),
          s("button", {
            type: "button",
            class: "map-round-button",
            "aria-label": "地图设置",
            onClick: h[1] || (h[1] = (M) => z.value = !0)
          }, [C(j, { name: "more" })])
        ]),
        _.value?.locations.length ? (r(), o("nav", $n, [s("button", {
          type: "button",
          "aria-pressed": !g.value,
          onClick: ge
        }, [C(j, { name: "globe" }), h[23] || (h[23] = N("世界地图", -1))], 8, xn), s("button", {
          type: "button",
          "aria-pressed": g.value,
          onClick: h[2] || (h[2] = (M) => de())
        }, [C(j, { name: "layers" }), N(b(w.value ? "场景地图" : "当前场景"), 1)], 8, _n)])) : k("", !0),
        _.value?.locations.length && !g.value ? (r(), o("nav", Cn, [s("button", {
          type: "button",
          onClick: h[3] || (h[3] = (M) => te(""))
        }, [C(j, { name: "globe" }), h[24] || (h[24] = N("世界", -1))]), (r(!0), o(A, null, Z(Pe.value, (M) => (r(), o(A, { key: M.key }, [C(j, { name: "next" }), s("button", {
          type: "button",
          onClick: (F) => te(M.key)
        }, b(M.name), 9, Sn)], 64))), 128))])) : k("", !0),
        p(v) ? (r(), o("div", jn, [h[25] || (h[25] = s("span", null, null, -1)), N(b(p(v)), 1)])) : k("", !0),
        p(i) || p(c) || p(n).status === "conflict" ? (r(), o("aside", {
          key: 3,
          class: Q(["map-notice", { "is-error": p(f) }]),
          role: "status"
        }, [s("p", null, b(p(i) || (p(c) ? "保存结果尚未确认。" : "保存的版本不一致。")), 1), p(c) ? (r(), o("button", {
          key: 0,
          type: "button",
          disabled: p(t),
          onClick: h[4] || (h[4] = (...M) => p(y) && p(y)(...M))
        }, "核实保存结果", 8, An)) : p(n).status === "conflict" ? (r(), o(A, { key: 1 }, [h[26] || (h[26] = s("small", null, "恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。", -1)), s("button", {
          type: "button",
          disabled: p(t),
          onClick: h[5] || (h[5] = (...M) => p(x) && p(x)(...M))
        }, "放弃未保存更改并恢复", 8, En)], 64)) : p(n).status === "error" || p(n).status === "blocked" ? (r(), o("button", {
          key: 2,
          type: "button",
          disabled: p(t),
          onClick: h[6] || (h[6] = (...M) => p(a) && p(a)(...M))
        }, "重新读取", 8, On)) : (r(), o("button", {
          key: 3,
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭地图提示",
          onClick: h[7] || (h[7] = (...M) => p(d) && p(d)(...M))
        }, [C(j, { name: "close" })]))], 2)) : k("", !0)
      ]),
      s("div", { class: Q(["map-canvas", { "has-detail": I.value && !g.value }]) }, [p(n).map && _.value?.locations.length ? (r(), o(A, { key: 0 }, [
        Ce(C(ut, {
          atlas: p(n).map.atlas,
          region: q.value,
          "current-location-key": m.value,
          "selected-location-key": T.value,
          "focus-key": V.value,
          "focus-sequence": L.value,
          onSelect: h[8] || (h[8] = (M) => le(M))
        }, null, 8, [
          "atlas",
          "region",
          "current-location-key",
          "selected-location-key",
          "focus-key",
          "focus-sequence"
        ]), [[ze, !g.value]]),
        g.value ? (r(), o(A, { key: 0 }, [W.value?.status === "active" ? (r(), G(Ia, {
          key: 0,
          scene: W.value
        }, null, 8, ["scene"])) : (r(), o("div", In, [
          C(j, { name: "layers" }),
          s("h2", null, b(H.value ? "这里的布局还没画出来" : "还不知道你在哪里"), 1),
          s("p", null, b(H.value ? "更新地图后，会结合设定与剧情补齐这里的普通布局。" : "更新地图后，会根据剧情确认你所在的地方。"), 1),
          s("button", {
            type: "button",
            class: "map-secondary-button",
            disabled: !!p(u),
            onClick: h[9] || (h[9] = (...M) => p(B) && p(B)(...M))
          }, b(p(t) ? "正在更新…" : "更新地图"), 9, Pn),
          p(u) && !p(t) ? (r(), o("p", Rn, b(p(u)), 1)) : k("", !0)
        ]))], 64)) : k("", !0),
        !g.value && !ce.value.length ? (r(), o("div", Tn, [
          C(j, { name: "pin" }),
          h[27] || (h[27] = s("h2", null, "这里还没有标出更多地点", -1)),
          h[28] || (h[28] = s("p", null, "可以先看看其他区域，或更新地图补充。", -1)),
          s("button", {
            type: "button",
            class: "map-secondary-button",
            onClick: h[10] || (h[10] = (M) => te(X.value?.parent || ""))
          }, "查看上级区域")
        ])) : k("", !0)
      ], 64)) : (r(), o("div", Bn, [
        s("span", qn, [C(j, { name: "globe" })]),
        h[29] || (h[29] = s("small", null, "故事之外，还有一整个世界", -1)),
        s("h1", null, b(p(n).status === "loading" ? "正在打开地图…" : "下一站，去哪里？"), 1),
        h[30] || (h[30] = s("p", null, [
          N("把世界设定画成地图，"),
          s("br"),
          N("也为留白的地方添上值得探索的去处。")
        ], -1)),
        p(n).status !== "loading" ? (r(), o("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          disabled: !!p(u),
          onClick: h[11] || (h[11] = (...M) => p(D) && p(D)(...M))
        }, b(p(t) ? p(v) || "正在准备…" : "绘制世界地图"), 9, Hn)) : k("", !0),
        p(u) && !p(t) ? (r(), o("p", zn, b(p(u)), 1)) : k("", !0)
      ]))], 2),
      _.value?.locations.length ? (r(), o("div", {
        key: 0,
        class: Q(["map-floating-tools", { "has-detail": I.value && !g.value }])
      }, [g.value && w.value ? (r(), o("button", {
        key: 0,
        type: "button",
        class: "map-round-button",
        "aria-label": "回到当前场景",
        onClick: h[12] || (h[12] = (M) => de())
      }, [C(j, { name: "locate" })])) : g.value ? k("", !0) : (r(), o("button", {
        key: 1,
        type: "button",
        class: "map-round-button",
        disabled: !S.value,
        "aria-label": "回到我的位置",
        onClick: Re
      }, [C(j, { name: "locate" })], 8, Kn)), s("button", {
        type: "button",
        class: "map-round-button",
        "aria-expanded": O.value,
        "aria-label": "地图图例",
        onClick: h[13] || (h[13] = (M) => O.value = !O.value)
      }, [C(j, { name: "layers" })], 8, Ln)], 2)) : k("", !0),
      O.value ? (r(), o("aside", Nn, [...h[31] || (h[31] = [
        s("strong", null, "读懂这张地图", -1),
        s("p", null, [
          s("i", { class: "map-key-current" }),
          N("你在这里 "),
          s("i", { class: "map-key-place" }),
          N("可探索地点")
        ], -1),
        s("p", null, "路线连接已记录的地点；箭头表示单向通行。", -1),
        s("small", null, "世界图展示区域与地点，不按实际比例。场景图展示一个地点的内部布局。", -1)
      ])])) : k("", !0),
      I.value && p(n).map && !g.value ? (r(), G(mn, {
        key: I.value.key,
        location: I.value,
        map: p(n).map,
        "current-key": m.value,
        onClose: h[14] || (h[14] = (M) => T.value = ""),
        onScene: h[15] || (h[15] = (M) => de(I.value.key)),
        onExplore: h[16] || (h[16] = (M) => te(I.value.key)),
        onSelect: h[17] || (h[17] = (M) => le(M, !0))
      }, null, 8, [
        "location",
        "map",
        "current-key"
      ])) : _.value?.locations.length && !g.value ? (r(), o("footer", Vn, [
        s("span", Zn, [C(j, { name: "compass" })]),
        s("div", null, [s("h1", null, b(X.value?.name || "世界地图"), 1), s("p", null, b(ce.value.length) + " 个地点 · " + b(be.value ? be.value + " 处还没去过" : "看看熟悉的地方有什么变化"), 1)]),
        s("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "浏览全部地点",
          onClick: h[18] || (h[18] = (M) => P.value = !0)
        }, [C(j, { name: "next" })])
      ])) : g.value && _.value?.locations.length ? (r(), o("footer", Dn, [C(j, { name: "layers" }), s("span", null, [s("strong", null, b(H.value?.name || "当前位置待确认"), 1), s("small", null, b(w.value ? "正在查看场景图 · 不会移动人物" : "当前位置的场景图"), 1)])])) : k("", !0),
      P.value && _.value ? (r(), G(nn, {
        key: 5,
        atlas: _.value,
        onClose: h[19] || (h[19] = (M) => P.value = !1),
        onSelect: h[20] || (h[20] = (M) => le(M, !0))
      }, null, 8, ["atlas"])) : k("", !0),
      z.value ? (r(), G(Ya, {
        key: 6,
        "auto-maintenance": p(n).autoMaintenance,
        busy: p(t),
        "refresh-disabled": p(c),
        "auto-toggle-busy": p(l) !== null,
        "disabled-reason": p(u),
        "has-map": !!p(n).map,
        status: p(v),
        "maintenance-message": p(n).maintenanceMessage || "",
        "maintenance-error": p(n).maintenanceStatus === "error",
        notice: p(i),
        "notice-error": p(f),
        onClose: h[21] || (h[21] = (M) => z.value = !1),
        onSetAuto: p(R),
        onUpdate: p(B),
        onRebuild: p(D),
        onRefresh: p(a)
      }, null, 8, [
        "auto-maintenance",
        "busy",
        "refresh-disabled",
        "auto-toggle-busy",
        "disabled-reason",
        "has-map",
        "status",
        "maintenance-message",
        "maintenance-error",
        "notice",
        "notice-error",
        "onSetAuto",
        "onUpdate",
        "onRebuild",
        "onRefresh"
      ])) : k("", !0)
    ], 2));
  }
}), as = Qn;
export {
  as as default
};
