/* eslint-disable */
import { E as me, F as Re, H as ye, J as Le, K as q, L as fe, M as l, P as L, Q as h, T as Ee, V as ue, X as O, Y as d, Z as oe, _ as Te, b as T, c as Me, f as w, g as o, h as f, k as ce, l as ie, m as N, o as Qe, p as t, s as Se, u as B, v as R, y as $, z as te } from "./xiaobai-os-runtime-dom.esm-bundler-BcM9c-Z9.js";
import { n as ze } from "./xiaobai-os-app-navigation-sg-40eOk.js";
import { t as je } from "./xiaobai-os-AppDialog-CI-E933W.js";
import { a as Oe, b as De, c as Ze, d as Ue, f as Be, g as Ne, h as We, i as He, l as Ye, n as Xe, o as Fe, p as $e, r as qe, s as Ge, u as we, v as se, x as Je, y as et } from "./xiaobai-os-map-presentation-DmLs9dcB.js";
var tt = { class: "map-viewport" }, at = ["viewBox", "aria-label"], lt = {
  class: "map-viewport-controls",
  "aria-label": "地图缩放"
}, st = /* @__PURE__ */ T({
  __name: "MapViewport",
  props: {
    viewBox: {},
    resetKey: { default: "" },
    label: {},
    focusPoint: { default: void 0 },
    focusSequence: { default: 0 }
  },
  setup(s) {
    const n = s, i = q(null), a = q([...n.viewBox]), v = q([0, 0]), k = w(() => v.value[0] && v.value[1] ? Math.max(a.value[2] / v.value[0], a.value[3] / v.value[1]) : 1);
    let m;
    ce(() => {
      m = new ResizeObserver((y) => {
        const M = y[0].contentRect;
        v.value = [M.width, M.height];
      }), i.value && m.observe(i.value);
    });
    const r = /* @__PURE__ */ new Map();
    let p = null, c = [0, 0], e = 0, g = null, V = !1, E = !1, Q = null;
    const Y = w(() => a.value.join(" "));
    function A() {
      a.value = [...n.viewBox];
    }
    function P() {
      return k.value;
    }
    function C(y, M) {
      const x = i.value?.getBoundingClientRect();
      if (!x) return [a.value[0], a.value[1]];
      const S = P();
      return [a.value[0] + a.value[2] / 2 + (y - x.left - x.width / 2) * S, a.value[1] + a.value[3] / 2 + (M - x.top - x.height / 2) * S];
    }
    function H(y, M) {
      const x = Math.max(1, n.viewBox[2]), S = Math.min(x * 3, Math.max(Math.min(x * 0.24, 240), a.value[2] * y)), W = S / a.value[2], X = M || [a.value[0] + a.value[2] / 2, a.value[1] + a.value[3] / 2];
      a.value = [
        X[0] - (X[0] - a.value[0]) * W,
        X[1] - (X[1] - a.value[1]) * W,
        S,
        a.value[3] * W
      ];
    }
    function D() {
      if (!n.focusPoint) return;
      const y = Math.min(a.value[2], 620), M = a.value[3] * y / a.value[2];
      a.value = [
        n.focusPoint[0] - y / 2,
        n.focusPoint[1] - M / 2,
        y,
        M
      ];
    }
    function z() {
      const y = [...r.values()];
      y.length === 1 && (p = y[0], c = [a.value[0], a.value[1]]), y.length === 2 && (e = Math.hypot(y[1][0] - y[0][0], y[1][1] - y[0][1]), g = [(y[0][0] + y[1][0]) / 2, (y[0][1] + y[1][1]) / 2], V = !0);
    }
    function Z(y) {
      y.button !== 0 || r.size >= 2 || (r.size || (V = !1), r.set(y.pointerId, [y.clientX, y.clientY]), y.target.setPointerCapture(y.pointerId), z());
    }
    function K(y) {
      if (!r.has(y.pointerId)) return;
      r.set(y.pointerId, [y.clientX, y.clientY]);
      const M = [...r.values()];
      if (M.length === 2 && g) {
        const x = Math.hypot(M[1][0] - M[0][0], M[1][1] - M[0][1]), S = [(M[0][0] + M[1][0]) / 2, (M[0][1] + M[1][1]) / 2];
        x > 0 && e > 0 && H(e / x, C(...g)), a.value[0] -= (S[0] - g[0]) * P(), a.value[1] -= (S[1] - g[1]) * P(), e = x, g = S;
      } else if (p) {
        const x = y.clientX - p[0], S = y.clientY - p[1];
        Math.abs(x) + Math.abs(S) > 4 && (V = !0), a.value = [
          c[0] - x * P(),
          c[1] - S * P(),
          a.value[2],
          a.value[3]
        ];
      }
    }
    function U(y) {
      if (!r.delete(y.pointerId)) return;
      const M = y.target;
      M.hasPointerCapture(y.pointerId) && M.releasePointerCapture(y.pointerId), z(), r.size || (p = null, g = null), V && (E = !0, Q && clearTimeout(Q), Q = setTimeout(() => {
        E = !1;
      }, 0));
    }
    function I(y) {
      E && (y.preventDefault(), y.stopPropagation());
    }
    return te(() => n.resetKey, A, { immediate: !0 }), te(() => n.focusSequence, D, { flush: "post" }), me(() => {
      m?.disconnect(), Q && clearTimeout(Q);
    }), (y, M) => (l(), o("div", tt, [(l(), o("svg", {
      ref_key: "svg",
      ref: i,
      class: "map-viewport-svg",
      viewBox: Y.value,
      preserveAspectRatio: "xMidYMid meet",
      role: "group",
      "aria-label": s.label,
      onWheel: M[0] || (M[0] = ie((x) => H(x.deltaY < 0 ? 0.84 : 1.19, C(x.clientX, x.clientY)), ["prevent"])),
      onPointerdown: Z,
      onPointermove: K,
      onPointerup: U,
      onPointercancel: U,
      onClickCapture: I
    }, [Re(y.$slots, "default", { unitScale: k.value })], 40, at)), t("div", lt, [
      t("button", {
        type: "button",
        "aria-label": "放大地图",
        onClick: M[1] || (M[1] = (x) => H(0.8))
      }, "+"),
      t("button", {
        type: "button",
        "aria-label": "缩小地图",
        onClick: M[2] || (M[2] = (x) => H(1.25))
      }, "−"),
      t("button", {
        type: "button",
        class: "map-fit",
        onClick: A
      }, "全图")
    ])]));
  }
}), Ke = st, nt = {
  class: "map-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, ot = ["d"], it = /* @__PURE__ */ T({
  __name: "MapIcon",
  props: { name: { default: "pin" } },
  setup(s) {
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
    return (i, a) => (l(), o("svg", nt, [t("path", { d: n[s.name] || n.pin }, null, 8, ot)]));
  }
}), j = it;
function he(s, n) {
  const i = new Map(s.locations.map((k) => [k.key, k])), a = [];
  let v = i.get(n);
  for (; v; )
    a.unshift(v), v = v.parent ? i.get(v.parent) : void 0;
  return a;
}
function xe(s) {
  const n = s.locations.filter((i) => !i.parent);
  return n.length === 1 && s.locations.some((i) => i.parent === n[0].key) ? n[0].key : "";
}
function re(s, n, i) {
  return he(s, n).find((a) => (a.parent || "") === i)?.key || "";
}
function rt(s, n) {
  return s.links.flatMap((i) => {
    if (i.from !== n && i.to !== n) return [];
    const a = s.locations.find((v) => v.key === (i.from === n ? i.to : i.from));
    return a ? [{
      location: a,
      link: i,
      outgoing: i.bidirectional || i.from === n
    }] : [];
  });
}
function ut(s, n) {
  const i = s.locations.filter((c) => (c.parent || "") === n).sort((c, e) => c.key.localeCompare(e.key, "en")), a = i.filter((c) => c.position).map((c) => ({
    location: c,
    x: c.position[0],
    y: c.position[1],
    placed: !0
  }));
  let v = 0;
  for (const c of i.filter((e) => !e.position)) {
    let e, g;
    do {
      const V = v * 2.3999632297, E = 155 * Math.sqrt(v++);
      e = Math.round(500 + Math.cos(V) * E), g = Math.round(420 + Math.sin(V) * E);
    } while (a.some((V) => Math.hypot(V.x - e, V.y - g) < 160));
    a.push({
      location: c,
      x: e,
      y: g,
      placed: !1
    });
  }
  a.sort((c, e) => c.location.key.localeCompare(e.location.key, "en"));
  const k = new Map(a.map((c) => [c.location.key, c])), m = s.links.flatMap((c) => {
    const e = k.get(re(s, c.from, n)), g = k.get(re(s, c.to, n));
    if (!e || !g || e === g) return [];
    const V = (e.x + g.x) / 2, E = (e.y + g.y) / 2;
    return [{
      link: c,
      from: e,
      to: g,
      x: V,
      y: E,
      path: `M ${e.x} ${e.y} Q ${V + (g.y - e.y) * 0.12} ${E - (g.x - e.x) * 0.12} ${g.x} ${g.y}`
    }];
  }), r = a.length ? Math.min(...a.map((c) => c.x)) - 140 : 0, p = a.length ? Math.min(...a.map((c) => c.y)) - 150 : 0;
  return {
    nodes: a,
    routes: m,
    viewBox: [
      r,
      p,
      a.length ? Math.max(420, Math.max(...a.map((c) => c.x)) - r + 140) : 800,
      a.length ? Math.max(500, Math.max(...a.map((c) => c.y)) - p + 190) : 900
    ]
  };
}
var ct = {
  class: "map-landscapes",
  "aria-hidden": "true"
}, dt = ["transform"], vt = {
  class: "map-world-roads",
  "aria-hidden": "true"
}, pt = ["d"], mt = ["d", "marker-end"], yt = ["x", "y"], ft = [
  "transform",
  "aria-label",
  "onClick",
  "onKeydown"
], ht = { transform: "translate(-14 -20)" }, bt = {
  y: "64",
  class: "map-place-name"
}, kt = {
  key: 0,
  y: "89",
  class: "map-place-status"
}, gt = {
  key: 1,
  y: "89",
  class: "map-place-status"
}, Mt = /* @__PURE__ */ T({
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
  setup(s) {
    const n = s, i = w(() => ut(n.atlas, n.region)), a = w(() => re(n.atlas, n.currentLocationKey, n.region)), v = w(() => i.value.nodes.find((r) => r.location.key === n.focusKey)), k = "map-arrow-" + fe();
    function m(r, p) {
      return r === "water" ? "water" : r === "forest" ? "tree" : r === "mountain" ? "mountain" : ["world", "region"].includes(p) ? "globe" : p === "outdoor" ? "compass" : "building";
    }
    return (r, p) => (l(), N(Ke, {
      "view-box": i.value.viewBox,
      "reset-key": s.region,
      label: "世界地图",
      "focus-point": v.value ? [v.value.x, v.value.y] : void 0,
      "focus-sequence": s.focusSequence
    }, {
      default: ue(({ unitScale: c }) => [
        t("defs", null, [t("marker", {
          id: k,
          viewBox: "0 0 10 10",
          refX: "16",
          refY: "5",
          markerWidth: "5",
          markerHeight: "5",
          orient: "auto"
        }, [...p[0] || (p[0] = [t("path", {
          d: "M1 1l8 4-8 4z",
          fill: "var(--map-road-ink)"
        }, null, -1)])])]),
        t("g", ct, [(l(!0), o(B, null, L(i.value.nodes, (e) => (l(), o("g", {
          key: e.location.key,
          transform: `translate(${e.x} ${e.y})`,
          class: O(`is-${e.location.terrain || "urban"}`)
        }, [...p[1] || (p[1] = [t("path", { d: "M-108-20Q-100-100-32-94T87-56Q127-13 99 48T21 99Q-57 113-90 65T-108-20Z" }, null, -1), t("path", {
          class: "map-contour",
          d: "M-133-22Q-124-126-39-116T110-70Q156-17 124 60T26 123Q-71 139-112 81T-133-22Z"
        }, null, -1)])], 10, dt))), 128))]),
        t("g", vt, [(l(!0), o(B, null, L(i.value.routes, (e) => (l(), o("g", {
          key: e.link.id,
          class: O({
            "is-path": e.link.kind === "path",
            "is-portal": e.link.kind === "portal"
          })
        }, [
          t("path", {
            class: "map-road-casing",
            d: e.path
          }, null, 8, pt),
          t("path", {
            class: "map-road-line",
            d: e.path,
            "marker-end": e.link.bidirectional ? void 0 : `url(#${k})`
          }, null, 8, mt),
          e.link.label ? (l(), o("text", {
            key: 0,
            x: e.x,
            y: e.y - 14
          }, h(e.link.label), 9, yt)) : f("", !0)
        ], 2))), 128))]),
        (l(!0), o(B, null, L(i.value.nodes, (e) => (l(), o("g", {
          key: e.location.key,
          class: O(["map-place", {
            "is-selected": e.location.key === s.selectedLocationKey,
            "is-current": e.location.key === a.value,
            "is-unvisited": e.location.status !== "visited"
          }]),
          transform: `translate(${e.x} ${e.y}) scale(${c * 0.5})`,
          role: "button",
          tabindex: "0",
          "aria-label": `查看${e.location.name}`,
          onClick: ie((g) => r.$emit("select", e.location.key), ["stop"]),
          onKeydown: [Me(ie((g) => r.$emit("select", e.location.key), ["stop"]), ["enter"]), Me(ie((g) => r.$emit("select", e.location.key), ["stop", "prevent"]), ["space"])]
        }, [
          p[2] || (p[2] = t("circle", {
            class: "map-pin-halo",
            r: "39"
          }, null, -1)),
          p[3] || (p[3] = t("path", {
            class: "map-pin-body",
            d: "M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z"
          }, null, -1)),
          t("g", ht, [$(j, {
            name: m(e.location.terrain, e.location.scale),
            width: "28",
            height: "28"
          }, null, 8, ["name"])]),
          t("text", bt, h(e.location.name.length > 14 ? e.location.name.slice(0, 13) + "…" : e.location.name), 1),
          e.location.key === a.value ? (l(), o("text", kt, "你在这里")) : e.location.status !== "visited" ? (l(), o("text", gt, "未到访")) : f("", !0),
          t("title", null, h(e.location.name) + h(e.location.brief ? " · " + e.location.brief : ""), 1)
        ], 42, ft))), 128))
      ]),
      _: 1
    }, 8, [
      "view-box",
      "reset-key",
      "focus-point",
      "focus-sequence"
    ]));
  }
}), $t = Mt, le;
async function Pe() {
  if (!le) {
    const s = [
      "..",
      "..",
      "..",
      "libs",
      "material-symbols",
      "material-symbols-rounded.woff2"
    ].join("/"), n = new URL(s, import.meta.url);
    le = new FontFace("Xiaobai Map Symbols", `url("${n.href}")`, {
      display: "block",
      weight: "400"
    }).load(), le.catch(() => {
      le = void 0;
    });
  }
  document.fonts.add(await le);
}
var wt = ["id"], xt = ["stop-color", "stop-opacity"], _t = ["stop-color", "stop-opacity"], Ct = ["stop-color", "stop-opacity"], St = ["id"], jt = ["fill", "fill-opacity"], Bt = {
  fill: "none",
  stroke: "var(--scene-shadow)",
  "stroke-width": ".65",
  opacity: ".24"
}, Ht = {
  key: 1,
  d: "M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21"
}, qt = {
  key: 2,
  d: "M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z"
}, Kt = {
  key: 3,
  d: "M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17",
  opacity: ".65"
}, Pt = {
  key: 4,
  d: "M3 8q6 3 13 0M25 25q7 2 17-1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.3",
  opacity: "1"
}, Vt = {
  key: 5,
  d: "M5 32 37 0M12 32 44 0",
  stroke: "var(--scene-highlight)",
  "stroke-width": "2.2"
}, At = {
  key: 6,
  d: "M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3"
}, It = {
  key: 7,
  d: "M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2",
  "stroke-linecap": "round"
}, Rt = {
  key: 8,
  d: "M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1"
}, Lt = {
  key: 9,
  d: "M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32",
  opacity: ".55"
}, Et = {
  key: 10,
  d: "m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8"
}, Tt = {
  key: 11,
  d: "M7 8q12-5 16 6t20 7M4 27l6-3"
}, Qt = {
  key: 12,
  d: "M5 19q5-3 11-1M29 8q6-2 12 1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.4"
}, zt = {
  key: 0,
  d: "M0 1H48",
  stroke: "var(--scene-highlight)",
  "stroke-width": ".7",
  opacity: ".35"
}, Ot = ["id"], Dt = ["id"], Zt = ["transform", "fill"], Ut = /* @__PURE__ */ T({
  __name: "SceneMaterials",
  props: { prefix: {} },
  setup(s) {
    return (n, i) => (l(), o("defs", null, [
      (l(!0), o(B, null, L(d(Je), (a) => (l(), o(B, { key: a }, [t("linearGradient", {
        id: `${s.prefix}-face-${a}`,
        x1: "0",
        y1: "0",
        x2: ".7",
        y2: "1"
      }, [
        t("stop", {
          offset: "0",
          "stop-color": `color-mix(in srgb, ${d(se)(a)}, var(--scene-highlight) 24%)`,
          "stop-opacity": a === "glass" ? 0.35 : 1
        }, null, 8, xt),
        t("stop", {
          offset: ".52",
          "stop-color": d(se)(a),
          "stop-opacity": a === "glass" ? 0.16 : 1
        }, null, 8, _t),
        t("stop", {
          offset: "1",
          "stop-color": `color-mix(in srgb, ${d(se)(a)}, var(--scene-shadow) 16%)`,
          "stop-opacity": a === "glass" ? 0.28 : 1
        }, null, 8, Ct)
      ], 8, wt), t("pattern", {
        id: `${s.prefix}-material-${a}`,
        width: "48",
        height: "32",
        patternUnits: "userSpaceOnUse",
        class: "scene-texture"
      }, [
        t("rect", {
          width: "48",
          height: "32",
          fill: d(se)(a),
          "fill-opacity": a === "glass" ? 0.4 : 1
        }, null, 8, jt),
        t("g", Bt, [a === "wood" ? (l(), o(B, { key: 0 }, [i[0] || (i[0] = t("path", { d: "M0 0H48M0 16H48M19 0V16M37 16V32" }, null, -1)), i[1] || (i[1] = t("path", {
          d: "M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1",
          opacity: ".5"
        }, null, -1))], 64)) : a === "stone" ? (l(), o("path", Ht)) : a === "tile" ? (l(), o("path", qt)) : a === "marble" ? (l(), o("path", Kt)) : a === "water" ? (l(), o("path", Pt)) : a === "glass" ? (l(), o("path", Vt)) : a === "grass" || a === "forest" ? (l(), o("path", At)) : a === "dirt" || a === "sand" ? (l(), o("path", It)) : a === "metal" ? (l(), o("path", Rt)) : [
          "carpet",
          "fabric",
          "bed-sheet",
          "tatami"
        ].includes(a) ? (l(), o("path", Lt)) : a === "rune" ? (l(), o("path", Et)) : a === "blood" ? (l(), o("path", Tt)) : a === "snow" ? (l(), o("path", Qt)) : f("", !0)]),
        a === "wood" || a === "stone" || a === "metal" ? (l(), o("path", zt)) : f("", !0)
      ], 8, St)], 64))), 128)),
      t("radialGradient", {
        id: `${s.prefix}-crown-face`,
        cx: ".32",
        cy: ".25",
        r: ".8"
      }, [...i[2] || (i[2] = [
        t("stop", {
          offset: "0",
          "stop-color": "var(--scene-leaf-light)"
        }, null, -1),
        t("stop", {
          offset: ".6",
          "stop-color": "var(--scene-leaf)"
        }, null, -1),
        t("stop", {
          offset: "1",
          "stop-color": "var(--scene-leaf-dark)"
        }, null, -1)
      ])], 8, Ot),
      (l(), o(B, null, L(3, (a) => t("symbol", {
        id: `${s.prefix}-crown-${a - 1}`,
        key: a,
        viewBox: "0 0 100 100"
      }, [t("g", {
        transform: `rotate(${a * 37} 50 50)`,
        fill: `url(#${s.prefix}-crown-face)`,
        stroke: "var(--scene-leaf-dark)",
        "stroke-width": ".6"
      }, [...i[3] || (i[3] = [
        t("path", { d: "M49 5Q65 2 73 16Q91 14 93 36Q99 46 90 59Q95 76 76 81Q68 96 50 91Q30 97 23 82Q5 79 9 60Q-1 45 9 34Q7 17 28 16Q33 1 49 5Z" }, null, -1),
        t("circle", {
          cx: "34",
          cy: "32",
          r: "21"
        }, null, -1),
        t("circle", {
          cx: "69",
          cy: "36",
          r: "22"
        }, null, -1),
        t("circle", {
          cx: "30",
          cy: "62",
          r: "20"
        }, null, -1),
        t("circle", {
          cx: "64",
          cy: "67",
          r: "23"
        }, null, -1),
        t("circle", {
          cx: "49",
          cy: "48",
          r: "24"
        }, null, -1),
        t("path", {
          d: "M24 25q8-10 19-5M61 21q11-3 17 8M36 45q9-11 21-8M63 59q9-2 14 6",
          fill: "none",
          stroke: "var(--scene-leaf-light)",
          "stroke-width": "1.4",
          opacity: ".75"
        }, null, -1)
      ])], 8, Zt)], 8, Dt)), 64))
    ]));
  }
}), Nt = Ut, Wt = [
  "x",
  "y",
  "width",
  "height"
], Yt = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "50"
}, Xt = {
  key: 1,
  width: "100",
  height: "100"
}, Ft = ["clip-path", "fill"], Gt = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "49",
  class: "scene-object-edge"
}, Jt = {
  key: 1,
  x: "1",
  y: "1",
  width: "98",
  height: "98",
  rx: "2",
  class: "scene-object-edge"
}, ea = ["fill"], ta = ["fill"], aa = ["d"], la = {
  key: 0,
  d: "M9 78H91",
  class: "scene-object-seam"
}, sa = ["x"], na = /* @__PURE__ */ T({
  __name: "SceneObject",
  props: {
    element: {},
    prefix: {},
    unitScale: {}
  },
  setup(s) {
    const n = s, i = w(() => Be(n.element)), a = w(() => Math.min(i.value.width, i.value.height) / n.unitScale >= 12), v = w(() => n.element.shape === "circle"), k = w(() => n.element.material), m = w(() => et(k.value, n.prefix)), r = w(() => De(k.value, n.prefix)), p = `scene-object-${fe()}`;
    return (c, e) => (l(), o("svg", {
      x: i.value.x,
      y: i.value.y,
      width: i.value.width,
      height: i.value.height,
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "scene-object"
    }, [t("defs", null, [t("clipPath", { id: p }, [v.value ? (l(), o("circle", Yt)) : (l(), o("rect", Xt))])]), t("g", {
      "clip-path": `url(#${p})`,
      fill: m.value
    }, [v.value ? (l(), o("circle", Gt)) : (l(), o("rect", Jt)), a.value ? (l(), o(B, { key: 2 }, [v.value ? (l(), o("circle", {
      key: 0,
      cx: "50",
      cy: "50",
      r: "44",
      fill: r.value,
      class: "scene-object-inset"
    }, null, 8, ea)) : (l(), o("rect", {
      key: 1,
      x: "5",
      y: "5",
      width: "90",
      height: "90",
      rx: "2",
      fill: r.value,
      class: "scene-object-inset"
    }, null, 8, ta)), s.element.icon === "table" || s.element.icon === "counter" ? (l(), o(B, { key: 2 }, [t("path", {
      d: v.value ? "M18 36A35 35 0 0 1 72 22" : "M8 13V8H92",
      class: "scene-object-shine"
    }, null, 8, aa), s.element.icon === "counter" ? (l(), o("path", la)) : f("", !0)], 64)) : s.element.icon === "chair" ? (l(), o(B, { key: 3 }, [
      e[0] || (e[0] = t("rect", {
        x: "12",
        y: "29",
        width: "76",
        height: "61",
        rx: "9",
        class: "scene-object-inset"
      }, null, -1)),
      e[1] || (e[1] = t("rect", {
        x: "7",
        y: "5",
        width: "86",
        height: "23",
        rx: "6",
        class: "scene-object-edge"
      }, null, -1)),
      e[2] || (e[2] = t("path", {
        d: "M16 12H84",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : s.element.icon === "bed" ? (l(), o(B, { key: 4 }, [
      e[3] || (e[3] = t("rect", {
        x: "10",
        y: "12",
        width: "80",
        height: "79",
        rx: "5",
        class: "scene-object-inset"
      }, null, -1)),
      e[4] || (e[4] = t("rect", {
        x: "20",
        y: "17",
        width: "60",
        height: "20",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      e[5] || (e[5] = t("path", {
        d: "M12 45H88M17 82H83",
        class: "scene-object-seam"
      }, null, -1)),
      e[6] || (e[6] = t("path", {
        d: "M18 49H82",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : s.element.icon === "shelf" ? (l(), o(B, { key: 5 }, [e[7] || (e[7] = t("path", {
      d: "M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92",
      class: "scene-object-seam"
    }, null, -1)), e[8] || (e[8] = t("path", {
      d: "M8 34H92M8 68H92",
      class: "scene-object-shine"
    }, null, -1))], 64)) : s.element.icon === "sofa" ? (l(), o(B, { key: 6 }, [
      e[9] || (e[9] = t("rect", {
        x: "8",
        y: "5",
        width: "84",
        height: "25",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      (l(), o(B, null, L(3, (g) => t("rect", {
        key: g,
        x: 15 + (g - 1) * 24,
        y: "32",
        width: "22",
        height: "57",
        rx: "5",
        class: "scene-object-inset"
      }, null, 8, sa)), 64)),
      e[10] || (e[10] = t("rect", {
        x: "3",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1)),
      e[11] || (e[11] = t("rect", {
        x: "86",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1))
    ], 64)) : s.element.icon === "bridge" ? (l(), o(B, { key: 7 }, [e[12] || (e[12] = t("path", {
      d: "M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91",
      class: "scene-object-seam"
    }, null, -1)), e[13] || (e[13] = t("path", {
      d: "M11 7V93M89 7V93",
      class: "scene-object-shine"
    }, null, -1))], 64)) : s.element.icon === "tree" ? (l(), o(B, { key: 8 }, [e[14] || (e[14] = Te('<circle cx="34" cy="32" r="24" class="scene-object-inset"></circle><circle cx="69" cy="36" r="24" class="scene-object-inset"></circle><circle cx="30" cy="62" r="23" class="scene-object-inset"></circle><circle cx="64" cy="67" r="25" class="scene-object-inset"></circle><circle cx="49" cy="48" r="26" class="scene-object-inset"></circle><path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine"></path>', 6))], 64)) : s.element.icon === "rock" ? (l(), o(B, { key: 9 }, [e[15] || (e[15] = t("path", {
      d: "M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57",
      class: "scene-object-seam"
    }, null, -1)), e[16] || (e[16] = t("path", {
      d: "M12 38 33 17 72 22",
      class: "scene-object-shine"
    }, null, -1))], 64)) : f("", !0)], 64)) : f("", !0)], 8, Ft)], 8, Wt));
  }
}), oa = na, ia = ["data-element", "opacity"], ra = ["transform"], ua = ["d"], ca = ["d", "stroke-width"], da = [
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap"
], va = [
  "d",
  "stroke",
  "stroke-opacity",
  "stroke-dasharray"
], pa = ["transform"], ma = ["id"], ya = ["d"], fa = ["clip-path"], ha = [
  "href",
  "x",
  "y",
  "width",
  "height"
], ba = ["transform"], ka = {
  key: 0,
  r: "19",
  class: "scene-player-halo"
}, ga = ["stroke"], Ma = {
  key: 1,
  class: "map-material-symbol",
  "aria-hidden": "true"
}, $a = {
  key: 2,
  class: "map-symbol-fallback",
  "aria-hidden": "true"
}, wa = ["x", "y"], xa = /* @__PURE__ */ T({
  __name: "MapScene",
  props: { scene: {} },
  setup(s) {
    const n = s, i = q(!1);
    ce(() => {
      Pe().then(() => {
        i.value = !0;
      }).catch(() => {
        i.value = !1;
      });
    });
    const a = `xiaobai-map-scene-${fe()}`, v = w(() => qe[n.scene.mood || "neutral"]), k = w(() => Ge(n.scene.elements)), m = w(() => Fe(n.scene.elements).map((r, p) => ({
      element: r,
      bounds: Be(r),
      path: We(r),
      transform: Ne(r),
      area: Ye(r),
      presentation: Oe(r, a),
      clipId: `${a}-area-${p}`,
      object: Ue(r) && !we(r),
      marker: we(r) && r.shape !== "label"
    })));
    return (r, p) => (l(), N(Ke, {
      class: "map-scene-viewport",
      style: oe({ "--scene-glow": v.value.glow }),
      "view-box": s.scene.viewBox,
      "reset-key": s.scene.key,
      label: `${s.scene.name} 场景地图`
    }, {
      default: ue(({ unitScale: c }) => [
        $(Nt, { prefix: a }),
        (l(!0), o(B, null, L(m.value, (e) => (l(), o("g", {
          key: e.element.id,
          class: O(["map-scene-element", [`is-${e.element.category}`, `is-${e.element.certainty || "confirmed"}`]]),
          "data-element": e.element.id,
          opacity: e.presentation.opacity
        }, [t("g", { transform: e.transform }, [
          e.object ? (l(), N(oa, {
            key: 0,
            element: e.element,
            prefix: a,
            "unit-scale": c
          }, null, 8, ["element", "unit-scale"])) : e.path ? (l(), o(B, { key: 1 }, [
            e.element.category === "wall" ? (l(), o("path", {
              key: 0,
              d: e.path,
              fill: "none",
              stroke: "var(--scene-shadow)",
              "stroke-width": "9",
              opacity: ".18",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ua)) : f("", !0),
            e.element.category === "road" && !e.area ? (l(), o("path", {
              key: 1,
              d: e.path,
              fill: "none",
              stroke: "var(--scene-soft-edge)",
              "stroke-width": e.presentation.width + 2,
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, ca)) : f("", !0),
            t("path", {
              d: e.path,
              fill: e.presentation.fill,
              stroke: e.presentation.stroke,
              "stroke-width": e.presentation.width,
              "stroke-dasharray": e.presentation.dash,
              "stroke-linejoin": "round",
              "stroke-linecap": e.element.category === "wall" ? "butt" : "round",
              "fill-rule": "evenodd",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, da),
            e.element.category === "wall" ? (l(), o("path", {
              key: 2,
              d: e.path,
              fill: "none",
              stroke: e.element.material ? d(se)(e.element.material) : "var(--scene-wall)",
              "stroke-width": "3.5",
              "stroke-opacity": e.element.material === "glass" ? 0.4 : 1,
              "stroke-dasharray": e.presentation.dash,
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, va)) : f("", !0)
          ], 64)) : f("", !0),
          e.object && !d(Ze)(e.element) && Math.min(e.bounds.width, e.bounds.height) / c >= 12 ? (l(), o("g", {
            key: 2,
            transform: `translate(${e.bounds.x + e.bounds.width / 2} ${e.bounds.y + e.bounds.height / 2})`,
            "aria-hidden": "true"
          }, [t("text", {
            class: O(i.value ? "map-material-symbol" : "map-symbol-fallback"),
            style: oe({
              fontSize: `${Math.min(22 * c, Math.min(e.bounds.width, e.bounds.height) * 0.65)}px`,
              fill: "var(--scene-edge)",
              textAnchor: "middle",
              dominantBaseline: "central"
            })
          }, h(i.value ? e.presentation.icon : e.presentation.fallback), 7)], 8, pa)) : f("", !0),
          k.value.has(e.element.id) ? (l(), o(B, { key: 3 }, [t("defs", null, [t("clipPath", { id: e.clipId }, [t("path", {
            d: e.path,
            "clip-rule": "evenodd"
          }, null, 8, ya)], 8, ma)]), t("g", {
            "clip-path": `url(#${e.clipId})`,
            class: "scene-forest-decoration",
            "aria-hidden": "true"
          }, [(l(!0), o(B, null, L(k.value.get(e.element.id), (g, V) => (l(), o("use", {
            key: V,
            href: `#${a}-crown-${g.variant}`,
            x: g.x - g.size / 2,
            y: g.y - g.size / 2,
            width: g.size,
            height: g.size
          }, null, 8, ha))), 128))], 8, fa)], 64)) : f("", !0)
        ], 8, ra), e.marker ? (l(), o("g", {
          key: 0,
          class: "map-scene-icon",
          transform: `translate(${e.bounds.x + e.bounds.width / 2} ${e.bounds.y + e.bounds.height / 2}) scale(${c})`
        }, [
          e.element.actorKey === "player" || e.element.kind === "player" ? (l(), o("circle", ka)) : f("", !0),
          t("circle", {
            r: "11",
            stroke: e.presentation.stroke
          }, null, 8, ga),
          i.value ? (l(), o("text", Ma, h(e.presentation.icon), 1)) : (l(), o("text", $a, h(e.presentation.fallback), 1))
        ], 8, ba)) : f("", !0)], 10, ia))), 128)),
        t("g", {
          class: "scene-labels",
          style: oe({ "--scene-unit-scale": c })
        }, [(l(!0), o(B, null, L(m.value, (e) => (l(), o(B, { key: e.element.id }, [e.element.label ? (l(), o("text", {
          key: 0,
          class: O(["map-scene-label", { "is-primary": e.element.shape === "label" }]),
          x: d($e)(e.element, c)[0],
          y: d($e)(e.element, c)[1]
        }, h(e.element.label), 11, wa)) : f("", !0)], 64))), 128))], 4)
      ]),
      _: 1
    }, 8, [
      "style",
      "view-box",
      "reset-key",
      "label"
    ]));
  }
}), _a = xa, Ca = {
  key: 0,
  class: "map-3d-loading",
  role: "status"
}, Sa = {
  class: "map-viewport-controls",
  "aria-label": "三维视角"
}, ja = /* @__PURE__ */ T({
  __name: "MapScene3D",
  props: {
    scene: {},
    lowWalls: { type: Boolean },
    showLabels: { type: Boolean }
  },
  emits: ["fallback"],
  setup(s, { emit: n }) {
    const i = s, a = n, v = q(null), k = q(null), m = q(!0);
    let r, p = !1;
    return ce(async () => {
      p = !0;
      try {
        const { createThreeRuntime: c } = await import("./xiaobai-os-three-runtime-DAiv4929.js");
        if (!p) return;
        r = c(v.value, k.value, { fallback: (e) => a("fallback", e) }), r.setScene(i.scene), r.walls(i.lowWalls), r.labels(i.showLabels), m.value = !1, Pe().then(() => {
          p && r?.symbols(!0);
        }).catch(() => {
        });
      } catch {
        p && a("fallback", "当前设备无法打开三维，已切换二维。");
      }
    }), te(() => i.scene, (c) => r?.setScene(c)), te(() => i.lowWalls, (c) => r?.walls(c)), te(() => i.showLabels, (c) => r?.labels(c)), me(() => {
      p = !1, r?.dispose(), r = void 0;
    }), (c, e) => (l(), o("div", {
      ref_key: "host",
      ref: v,
      class: "map-scene-three",
      style: oe({ "--scene-glow": d(qe)[s.scene.mood || "neutral"].glow })
    }, [
      t("div", {
        ref_key: "labelHost",
        ref: k,
        class: "map-3d-labels"
      }, null, 512),
      m.value ? (l(), o("div", Ca, "正在打开三维…")) : f("", !0),
      t("div", Sa, [
        t("button", {
          type: "button",
          "aria-label": "放大三维",
          onClick: e[0] || (e[0] = (g) => d(r)?.zoom(1.2))
        }, "+"),
        t("button", {
          type: "button",
          "aria-label": "缩小三维",
          onClick: e[1] || (e[1] = (g) => d(r)?.zoom(1 / 1.2))
        }, "−"),
        t("button", {
          type: "button",
          class: "map-fit",
          "aria-label": "重置三维视角",
          onClick: e[2] || (e[2] = (g) => d(r)?.fit())
        }, "全图")
      ])
    ], 4));
  }
}), Ba = ja, Ha = ["aria-label"], qa = { class: "map-scene-toolbar" }, Ka = {
  class: "map-render-switch",
  role: "group",
  "aria-label": "场景显示方式"
}, Pa = ["aria-pressed"], Va = ["aria-pressed", "disabled"], Aa = ["aria-pressed"], Ia = ["aria-pressed"], Ra = { class: "map-scene-stage" }, La = /* @__PURE__ */ T({
  __name: "MapSceneView",
  props: {
    scene: {},
    mode: {},
    threeUnavailable: { type: Boolean }
  },
  emits: ["update:mode", "fallback"],
  setup(s, { emit: n }) {
    const i = n, a = q(!1), v = q(!0);
    return (k, m) => (l(), o("section", {
      class: "map-scene-view",
      "aria-label": s.scene.name
    }, [t("div", qa, [
      t("div", Ka, [t("button", {
        type: "button",
        "aria-pressed": s.mode === "2d",
        onClick: m[0] || (m[0] = (r) => i("update:mode", "2d"))
      }, "二维", 8, Pa), t("button", {
        type: "button",
        "aria-pressed": s.mode === "3d",
        disabled: s.threeUnavailable,
        onClick: m[1] || (m[1] = (r) => i("update:mode", "3d"))
      }, "三维", 8, Va)]),
      s.mode === "3d" ? (l(), o("button", {
        key: 0,
        type: "button",
        "aria-pressed": a.value,
        onClick: m[2] || (m[2] = (r) => a.value = !a.value)
      }, "低墙", 8, Aa)) : f("", !0),
      s.mode === "3d" ? (l(), o("button", {
        key: 1,
        type: "button",
        "aria-pressed": v.value,
        onClick: m[3] || (m[3] = (r) => v.value = !v.value)
      }, "名称", 8, Ia)) : f("", !0)
    ]), t("div", Ra, [ye($(_a, { scene: s.scene }, null, 8, ["scene"]), [[Se, s.mode === "2d"]]), s.mode === "3d" ? (l(), N(Ba, {
      key: 0,
      scene: s.scene,
      "low-walls": a.value,
      "show-labels": v.value,
      onFallback: m[4] || (m[4] = (r) => i("fallback", r))
    }, null, 8, [
      "scene",
      "low-walls",
      "show-labels"
    ])) : f("", !0)])], 8, Ha));
  }
}), Ea = La;
function _e(s) {
  const n = s?.atlas.actors.find((a) => a.actorKey === "player"), i = s?.atlas.locations.find((a) => a.key === n?.locationKey);
  return i?.sceneKey && s?.scenes[i.sceneKey]?.status === "active" ? "scene" : "world";
}
var Ta = { class: "map-dialog-header" }, Qa = { key: 0 }, za = { class: "map-settings-content" }, Oa = { class: "map-auto-setting" }, Da = ["aria-checked", "disabled"], Za = { class: "map-settings-section" }, Ua = ["disabled"], Na = { key: 0 }, Wa = { class: "map-settings-section" }, Ya = { key: 0 }, Xa = ["disabled"], Fa = {
  key: 0,
  class: "map-setting-note",
  role: "status"
}, Ga = ["disabled"], Ja = /* @__PURE__ */ T({
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
  setup(s) {
    return (n, i) => (l(), N(je, {
      class: "map-dialog map-settings",
      "aria-labelledby": "map-settings-title",
      onClose: i[5] || (i[5] = (a) => n.$emit("close"))
    }, {
      default: ue(() => [
        t("header", Ta, [i[6] || (i[6] = t("div", null, [t("small", null, "让地图跟上你的故事"), t("h2", { id: "map-settings-title" }, "地图设置")], -1)), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "关闭地图设置",
          onClick: i[0] || (i[0] = (a) => n.$emit("close"))
        }, [$(j, { name: "close" })])]),
        s.status || s.notice || s.maintenanceMessage ? (l(), o("section", {
          key: 0,
          class: O(["map-settings-feedback", { "is-error": s.notice ? s.noticeError : s.maintenanceError }]),
          role: "status"
        }, [t("strong", null, h(s.notice ? s.notice === s.maintenanceMessage ? "最近一次更新" : "操作提示" : s.status || "最近一次更新"), 1), s.notice || s.maintenanceMessage ? (l(), o("p", Qa, h(s.notice || s.maintenanceMessage), 1)) : f("", !0)], 2)) : f("", !0),
        t("div", za, [
          t("section", Oa, [i[8] || (i[8] = t("div", null, [t("h3", null, "随对话自动更新"), t("p", null, "你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。")], -1)), t("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": s.autoMaintenance,
            "aria-label": "随对话自动更新",
            disabled: s.autoToggleBusy,
            onClick: i[1] || (i[1] = (a) => n.$emit("setAuto", !s.autoMaintenance))
          }, [...i[7] || (i[7] = [t("span", null, null, -1)])], 8, Da)]),
          t("section", Za, [
            $(j, { name: "refresh" }),
            i[9] || (i[9] = t("h3", null, "补充最近的变化", -1)),
            i[10] || (i[10] = t("p", null, "根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。", -1)),
            t("button", {
              type: "button",
              class: "map-primary-button",
              disabled: s.busy || !!s.disabledReason || !s.hasMap,
              onClick: i[2] || (i[2] = (a) => n.$emit("update"))
            }, h(s.busy ? s.status || "请稍候…" : "更新地图"), 9, Ua),
            s.hasMap ? f("", !0) : (l(), o("small", Na, "请先建立世界地图"))
          ]),
          t("section", Wa, [
            $(j, { name: "globe" }),
            t("h3", null, h(s.hasMap ? "重新绘制世界" : "建立世界地图"), 1),
            i[11] || (i[11] = t("p", null, "依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。", -1)),
            s.hasMap ? (l(), o("p", Ya, "新地图保存成功后替换原图；失败时保留原图。")) : f("", !0),
            t("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: s.busy || !!s.disabledReason,
              onClick: i[3] || (i[3] = (a) => n.$emit("rebuild"))
            }, h(s.busy ? s.status || "请稍候…" : s.hasMap ? "重新绘制" : "绘制世界地图"), 9, Xa)
          ]),
          s.disabledReason ? (l(), o("p", Fa, h(s.disabledReason), 1)) : f("", !0),
          t("button", {
            type: "button",
            class: "map-sync-button",
            disabled: s.busy || s.refreshDisabled,
            onClick: i[4] || (i[4] = (a) => n.$emit("refresh"))
          }, [$(j, { name: "refresh" }), i[12] || (i[12] = R("同步已保存的地图", -1))], 8, Ga),
          i[13] || (i[13] = t("p", { class: "map-setting-note" }, "同步只读取保存结果，不会重新生成地图。绘制或更新开始后，可以离开此页面。", -1))
        ])
      ]),
      _: 1
    }));
  }
}), el = Ja, tl = { class: "map-search-input" }, al = {
  class: "map-search-filters",
  "aria-label": "地点筛选"
}, ll = ["aria-pressed", "onClick"], sl = { class: "map-search-results" }, nl = ["onClick"], ol = { class: "map-result-icon" }, il = { key: 0 }, rl = {
  key: 0,
  class: "map-search-empty"
}, ul = /* @__PURE__ */ T({
  __name: "MapSearch",
  props: { atlas: {} },
  emits: ["close", "select"],
  setup(s) {
    const n = s, i = q(""), a = q("all"), v = w(() => n.atlas.locations.filter((k) => [
      k.name,
      k.brief,
      n.atlas.locations.find((m) => m.key === k.parent)?.name
    ].some((m) => m?.toLocaleLowerCase().includes(i.value.trim().toLocaleLowerCase())) && (a.value === "all" || (a.value === "unvisited" ? k.status !== "visited" : k.status === "visited"))));
    return (k, m) => (l(), N(je, {
      class: "map-dialog map-search-dialog",
      "aria-label": "查找地点",
      onClose: m[2] || (m[2] = (r) => k.$emit("close"))
    }, {
      default: ue(() => [
        t("header", tl, [
          $(j, { name: "search" }),
          ye(t("input", {
            "onUpdate:modelValue": m[0] || (m[0] = (r) => i.value = r),
            type: "search",
            "aria-label": "搜索地点",
            placeholder: "想去哪里？",
            autofocus: ""
          }, null, 512), [[Qe, i.value]]),
          t("button", {
            type: "button",
            onClick: m[1] || (m[1] = (r) => k.$emit("close"))
          }, "取消")
        ]),
        t("nav", al, [(l(), o(B, null, L([
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
        ], (r) => t("button", {
          key: r.id,
          type: "button",
          "aria-pressed": a.value === r.id,
          onClick: (p) => a.value = r.id
        }, h(r.name), 9, ll)), 64))]),
        t("div", sl, [
          t("small", null, h(v.value.length) + " 个地点", 1),
          (l(!0), o(B, null, L(v.value, (r) => (l(), o("button", {
            key: r.key,
            type: "button",
            class: "map-search-result",
            onClick: (p) => k.$emit("select", r.key)
          }, [
            t("span", ol, [$(j, { name: "pin" })]),
            t("span", null, [
              t("strong", null, h(r.name), 1),
              t("small", null, h(d(He)[r.scale]) + " · " + h(r.status === "visited" ? "已到访" : "未到访"), 1),
              r.brief ? (l(), o("p", il, h(r.brief), 1)) : f("", !0)
            ]),
            $(j, { name: "next" })
          ], 8, nl))), 128)),
          v.value.length ? f("", !0) : (l(), o("div", rl, [
            $(j, { name: "search" }),
            m[3] || (m[3] = t("h3", null, "还没有找到这个地点", -1)),
            m[4] || (m[4] = t("p", null, "试试其他名称，或看看全部地点。", -1))
          ]))
        ])
      ]),
      _: 1
    }));
  }
}), cl = ul, dl = {
  class: "map-place-detail",
  "aria-labelledby": "map-place-title"
}, vl = { id: "map-place-title" }, pl = { class: "map-place-content" }, ml = {
  key: 0,
  class: "map-place-full-name"
}, yl = {
  key: 1,
  class: "map-address"
}, fl = { class: "map-place-intro" }, hl = {
  key: 2,
  class: "map-place-actions"
}, bl = {
  key: 3,
  class: "map-detail-section"
}, kl = { class: "map-people" }, gl = {
  key: 4,
  class: "map-detail-section"
}, Ml = ["onClick"], $l = /* @__PURE__ */ T({
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
  setup(s) {
    const n = s, i = w(() => he(n.map.atlas, n.location.key).slice(0, -1)), a = w(() => n.map.atlas.locations.filter((r) => r.parent === n.location.key)), v = w(() => n.map.atlas.actors.filter((r) => r.locationKey === n.location.key)), k = w(() => rt(n.map.atlas, n.location.key)), m = w(() => n.location.sceneKey ? n.map.scenes[n.location.sceneKey] : void 0);
    return (r, p) => (l(), o("section", dl, [
      p[7] || (p[7] = t("div", {
        class: "map-sheet-grip",
        "aria-hidden": "true"
      }, null, -1)),
      t("header", null, [t("div", null, [t("small", null, h(d(He)[s.location.scale]) + " · " + h(s.currentKey === s.location.key ? "当前位置" : s.location.status === "visited" ? "已到访" : "未到访"), 1), t("h2", vl, h(s.location.name), 1)]), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "关闭地点详情",
        onClick: p[0] || (p[0] = (c) => r.$emit("close"))
      }, [$(j, { name: "close" })])]),
      t("div", pl, [
        s.location.name.length > 24 ? (l(), o("p", ml, h(s.location.name), 1)) : f("", !0),
        i.value.length ? (l(), o("p", yl, [$(j, { name: "pin" }), R(h(i.value.map((c) => c.name).join(" · ")), 1)])) : f("", !0),
        t("p", fl, h(s.location.brief || "这个地点已记录在世界地图上，更多介绍等待故事展开。"), 1),
        a.value.length || m.value ? (l(), o("div", hl, [a.value.length ? (l(), o("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          onClick: p[1] || (p[1] = (c) => r.$emit("explore"))
        }, [$(j, { name: "compass" }), R("探索这里 · " + h(a.value.length) + " 处", 1)])) : f("", !0), m.value ? (l(), o("button", {
          key: 1,
          type: "button",
          class: "map-secondary-button",
          onClick: p[2] || (p[2] = (c) => r.$emit("scene"))
        }, [$(j, { name: "layers" }), p[3] || (p[3] = R("查看场景图", -1))])) : f("", !0)])) : f("", !0),
        v.value.length ? (l(), o("section", bl, [p[4] || (p[4] = t("h3", null, "记录在这里的人物", -1)), t("p", kl, [(l(!0), o(B, null, L(v.value, (c) => (l(), o("span", { key: c.actorKey }, [$(j, { name: "person" }), R(h(c.displayName), 1)]))), 128))])])) : f("", !0),
        k.value.length ? (l(), o("section", gl, [p[5] || (p[5] = t("h3", null, "相连的地方", -1)), (l(!0), o(B, null, L(k.value, (c) => (l(), o("button", {
          key: c.link.id,
          type: "button",
          class: "map-connection",
          onClick: (e) => r.$emit("select", c.location.key)
        }, [
          $(j, { name: "route" }),
          t("span", null, [t("strong", null, h(c.location.name), 1), t("small", null, h(c.link.label || d(Xe)[c.link.kind]) + h(c.link.bidirectional ? "" : c.outgoing ? " · 单向前往" : " · 仅可从对面到达"), 1)]),
          $(j, { name: "next" })
        ], 8, Ml))), 128))])) : f("", !0),
        p[6] || (p[6] = t("p", { class: "map-detail-footnote" }, "查看地图不会改变你在故事中的位置", -1))
      ])
    ]));
  }
}), wl = $l;
function ee(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function Ce(s) {
  return s.maintenanceStatus === "maintaining" || s.maintenanceStatus === "rebuilding";
}
function xl(s) {
  const n = q(structuredClone(Le(s.initialState))), i = q(null), a = q(""), v = q(!1);
  let k = !1, m = 0, r = 0, p = () => {
  };
  const c = w(() => n.value.status === "unconfirmed" || n.value.writeState === "unconfirmed"), e = w(() => i.value !== null || ["loading", "saving"].includes(n.value.status) || ["maintaining", "rebuilding"].includes(n.value.maintenanceStatus || "")), g = w(() => e.value ? "正在更新地图，请稍候" : c.value ? "请先核实上一次保存结果" : n.value.status === "conflict" ? "保存的版本不一致，请先处理保存问题" : n.value.status !== "ready" ? n.value.message || "地图暂时不可更新" : n.value.chatIdentity ? "" : "请先打开一个聊天"), V = w(() => n.value.maintenanceStatus === "rebuilding" || i.value === "rebuild" ? "正在绘制世界…" : n.value.maintenanceStatus === "maintaining" || i.value === "maintain" ? "正在更新地图…" : i.value === "confirm" ? "正在核实保存…" : e.value ? "正在同步…" : ""), E = w(() => n.value.message || a.value), Q = w(() => n.value.message ? [
    "blocked",
    "error",
    "conflict",
    "unconfirmed"
  ].includes(n.value.status) : v.value);
  function Y(C) {
    const H = Ce(n.value);
    n.value = structuredClone(C), Ce(C) ? (a.value = "", v.value = !1) : H && (a.value = C.maintenanceMessage || "", v.value = C.maintenanceStatus === "error");
  }
  function A(C, H) {
    const D = C instanceof Error ? C.message : String(C);
    return D.includes("聊天已切换") ? "聊天已切换，请重新打开地图。" : D === "host_request_timeout" ? "等待结果超时，更新可能仍在进行。请稍后查看，不要重复提交。" : H === "confirm" ? "仍无法确认保存结果，请稍后再试。" : H === "adopt" ? "未能恢复已保存的版本，当前更改仍暂停保存。" : H === "settings" ? "设置未能保存，请重试。" : "地图操作未完成，请稍后重试。";
  }
  async function P(C, H, D = {}) {
    if (i.value) return;
    const z = ++m, Z = r, K = n.value.chatIdentity;
    i.value = H, a.value = "", v.value = !1;
    try {
      const U = await s.bridge.request(C, {
        chatIdentity: K,
        ...D
      }, 35e3);
      if (!k || z !== m || n.value.chatIdentity !== K) return;
      const I = ee(U) ? U.result : void 0, y = ee(I) && ee(I.state) ? I.state : I;
      Z === r && ee(y) && y.chatIdentity === K && Y(y), (H === "maintain" || H === "rebuild") && ee(I) && typeof I.message == "string" && I.message && (a.value = I.message), H === "refresh" && n.value.status === "ready" && (a.value = "已同步保存的地图。"), H === "settings" && (a.value = n.value.autoMaintenance ? "自动更新已开启。" : "自动更新已关闭。"), H === "confirm" && n.value.status === "ready" && (a.value = "保存已确认。"), H === "adopt" && ee(I) && I.adoption === "adopted" && (a.value = "已恢复当前聊天中保存的 OS 数据。");
    } catch (U) {
      k && z === m && n.value.chatIdentity === K && (a.value = A(U, H), v.value = !0);
    } finally {
      k && z === m && (i.value = null);
    }
  }
  return ce(() => {
    k = !0, p = s.bridge.subscribe((C) => {
      if (C.type === "map/state") {
        const H = C.payload.state;
        if (H.chatIdentity !== n.value.chatIdentity) return;
        r += 1, Y(H);
      } else C.type === "map/error" && (r += 1, v.value = !0, a.value = C.payload.message || "地图暂时无法读取，请重新打开。");
    });
  }), me(() => {
    k = !1, m += 1, p();
  }), {
    state: n,
    activeRequest: i,
    busy: e,
    disabledReason: g,
    requiresConfirmation: c,
    status: V,
    notice: E,
    isError: Q,
    dismissNotice: () => {
      a.value = "", v.value = !1;
    },
    refresh: () => {
      if (!e.value && !c.value) return P("map/refresh", "refresh");
    },
    confirmSave: () => {
      if (!e.value) return P("map/confirm-save", "confirm");
    },
    adopt: () => {
      if (!e.value) return P("map/adopt-server-state", "adopt");
    },
    setAuto: (C) => P("map/set-auto-maintenance", "settings", { enabled: C }),
    update: () => {
      if (!g.value && n.value.map) return P("map/maintain-once", "maintain");
    },
    rebuild: () => {
      if (!g.value) return P("map/rebuild", "rebuild");
    }
  };
}
var _l = { class: "map-top" }, Cl = { class: "map-search-bar" }, Sl = ["disabled"], jl = {
  key: 1,
  class: "map-search-entry"
}, Bl = {
  key: 0,
  class: "map-view-row"
}, Hl = {
  class: "map-view-switch",
  "aria-label": "地图视图"
}, ql = ["aria-pressed"], Kl = ["aria-pressed"], Pl = {
  key: 0,
  class: "map-scene-tools"
}, Vl = ["aria-expanded"], Al = {
  key: 1,
  class: "map-region-trail",
  "aria-label": "当前查看区域"
}, Il = ["onClick"], Rl = {
  key: 2,
  class: "map-progress",
  role: "status"
}, Ll = {
  key: 3,
  class: "map-notice",
  role: "status"
}, El = ["disabled"], Tl = ["disabled"], Ql = ["disabled"], zl = {
  key: 1,
  class: "map-empty"
}, Ol = ["disabled"], Dl = {
  key: 0,
  class: "map-setting-note"
}, Zl = {
  key: 1,
  class: "map-empty"
}, Ul = {
  key: 1,
  class: "map-empty map-first-map"
}, Nl = { class: "map-empty-art" }, Wl = ["disabled"], Yl = {
  key: 1,
  class: "map-setting-note"
}, Xl = ["disabled"], Fl = ["aria-expanded"], Gl = {
  key: 1,
  class: "map-key"
}, Jl = {
  key: 3,
  class: "map-region-card"
}, es = { class: "map-region-icon" }, ts = {
  key: 4,
  class: "map-scene-caption"
}, as = /* @__PURE__ */ T({
  __name: "MapApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const { state: n, activeRequest: i, busy: a, disabledReason: v, requiresConfirmation: k, status: m, notice: r, isError: p, dismissNotice: c, refresh: e, confirmSave: g, adopt: V, setAuto: E, update: Q, rebuild: Y } = xl(s), A = q(n.value.map ? xe(n.value.map.atlas) : ""), P = q(""), C = q(_e(n.value.map) === "scene" ? "" : null), H = q("3d"), D = q(!1), z = q("");
    let Z = !1;
    const K = w(() => C.value !== null), U = q(""), I = q(0), y = q(!1), M = q(!1), x = q(!1), S = w(() => n.value.map?.atlas), W = w(() => S.value?.actors.find((_) => _.actorKey === "player")?.locationKey || ""), X = w(() => S.value?.locations.find((_) => _.key === W.value)), G = w(() => S.value?.locations.find((_) => _.key === P.value)), J = w(() => S.value?.locations.find((_) => _.key === (C.value || W.value))), be = w(() => K.value && J.value?.sceneKey ? n.value.map?.scenes[J.value.sceneKey] : void 0), de = w(() => S.value?.locations.find((_) => _.key === A.value)), ve = w(() => S.value?.locations.filter((_) => (_.parent || "") === A.value) || []), ke = w(() => ve.value.filter((_) => _.status !== "visited").length), Ve = w(() => S.value ? he(S.value, A.value) : []);
    te(() => n.value, (_, u) => {
      const b = _.chatIdentity !== u.chatIdentity;
      (!u.map || b || A.value && !_.map?.atlas.locations.some((F) => F.key === A.value)) && (A.value = _.map ? xe(_.map.atlas) : ""), (b || !_.map?.atlas.locations.some((F) => F.key === P.value)) && (P.value = ""), b && (Z = !1), (b || !u.map?.atlas.locations.length && _.map?.atlas.locations.length && !Z || C.value && !_.map?.atlas.locations.some((F) => F.key === C.value)) && (C.value = _e(_.map) === "scene" ? "" : null), b && (y.value = !1, M.value = !1);
    });
    function ae(_) {
      Z = !0, A.value = _, P.value = "", C.value = null, x.value = !1;
    }
    async function ne(_, u = !1) {
      const b = S.value?.locations.find((F) => F.key === _);
      b && (Z = !0, C.value = null, P.value = _, M.value = !1, x.value = !1, u && (A.value = b.parent || ""), await Ee(), U.value = S.value ? re(S.value, _, A.value) : _, I.value += 1);
    }
    async function Ae() {
      X.value && await ne(X.value.key, !0);
    }
    function pe(_ = "") {
      Z = !0, C.value = _ === W.value ? "" : _, x.value = !1, M.value = !1;
    }
    function ge() {
      Z = !0, C.value = null, x.value = !1;
    }
    function Ie(_) {
      D.value || (D.value = !0, H.value = "2d", z.value = _);
    }
    return ze(() => x.value ? (x.value = !1, !0) : K.value ? (ge(), !0) : P.value ? (P.value = "", !0) : A.value ? (ae(de.value?.parent || ""), !0) : !1), (_, u) => (l(), o("main", { class: O(["map-app", {
      "has-view-switch": S.value?.locations.length,
      "is-scene-view": K.value
    }]) }, [
      t("div", _l, [
        t("header", Cl, [
          $(j, { name: K.value ? "layers" : "search" }, null, 8, ["name"]),
          K.value ? (l(), o("div", jl, [R(h(J.value?.name || "当前场景"), 1), t("small", null, h(C.value ? "正在查看已记录的场景" : "看看你身边的布局"), 1)])) : (l(), o("button", {
            key: 0,
            type: "button",
            class: "map-search-entry",
            disabled: !S.value?.locations.length,
            onClick: u[0] || (u[0] = (b) => M.value = !0)
          }, [...u[25] || (u[25] = [R("想去哪里？", -1), t("small", null, "搜索世界中的地点", -1)])], 8, Sl)),
          t("button", {
            type: "button",
            class: "map-round-button",
            "aria-label": "地图设置",
            onClick: u[1] || (u[1] = (b) => y.value = !0)
          }, [$(j, { name: "more" })])
        ]),
        S.value?.locations.length ? (l(), o("div", Bl, [t("nav", Hl, [t("button", {
          type: "button",
          "aria-pressed": !K.value,
          onClick: ge
        }, [$(j, { name: "globe" }), u[26] || (u[26] = R("世界地图", -1))], 8, ql), t("button", {
          type: "button",
          "aria-pressed": K.value,
          onClick: u[2] || (u[2] = (b) => pe())
        }, [$(j, { name: "layers" }), R(h(C.value ? "场景地图" : "当前场景"), 1)], 8, Kl)]), K.value ? (l(), o("div", Pl, [C.value ? (l(), o("button", {
          key: 0,
          type: "button",
          class: "map-round-button",
          "aria-label": "回到当前场景",
          onClick: u[3] || (u[3] = (b) => pe())
        }, [$(j, { name: "locate" })])) : f("", !0), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-expanded": x.value,
          "aria-label": "地图图例",
          onClick: u[4] || (u[4] = (b) => x.value = !x.value)
        }, [$(j, { name: "layers" })], 8, Vl)])) : f("", !0)])) : f("", !0),
        S.value?.locations.length && !K.value ? (l(), o("nav", Al, [t("button", {
          type: "button",
          onClick: u[5] || (u[5] = (b) => ae(""))
        }, [$(j, { name: "globe" }), u[27] || (u[27] = R("世界", -1))]), (l(!0), o(B, null, L(Ve.value, (b) => (l(), o(B, { key: b.key }, [$(j, { name: "next" }), t("button", {
          type: "button",
          onClick: (F) => ae(b.key)
        }, h(b.name), 9, Il)], 64))), 128))])) : f("", !0),
        d(m) ? (l(), o("div", Rl, [u[28] || (u[28] = t("span", null, null, -1)), R(h(d(m)), 1)])) : f("", !0),
        z.value ? (l(), o("aside", Ll, [t("p", null, h(z.value), 1), t("button", {
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭三维提示",
          onClick: u[6] || (u[6] = (b) => z.value = "")
        }, [$(j, { name: "close" })])])) : f("", !0),
        d(r) || d(k) || d(n).status === "conflict" ? (l(), o("aside", {
          key: 4,
          class: O(["map-notice", { "is-error": d(p) }]),
          role: "status"
        }, [t("p", null, h(d(r) || (d(k) ? "保存结果尚未确认。" : "保存的版本不一致。")), 1), d(k) ? (l(), o("button", {
          key: 0,
          type: "button",
          disabled: d(a),
          onClick: u[7] || (u[7] = (...b) => d(g) && d(g)(...b))
        }, "核实保存结果", 8, El)) : d(n).status === "conflict" ? (l(), o(B, { key: 1 }, [u[29] || (u[29] = t("small", null, "恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。", -1)), t("button", {
          type: "button",
          disabled: d(a),
          onClick: u[8] || (u[8] = (...b) => d(V) && d(V)(...b))
        }, "放弃未保存更改并恢复", 8, Tl)], 64)) : d(n).status === "error" || d(n).status === "blocked" ? (l(), o("button", {
          key: 2,
          type: "button",
          disabled: d(a),
          onClick: u[9] || (u[9] = (...b) => d(e) && d(e)(...b))
        }, "重新读取", 8, Ql)) : (l(), o("button", {
          key: 3,
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭地图提示",
          onClick: u[10] || (u[10] = (...b) => d(c) && d(c)(...b))
        }, [$(j, { name: "close" })]))], 2)) : f("", !0)
      ]),
      t("div", { class: O(["map-canvas", { "has-detail": G.value && !K.value }]) }, [d(n).map && S.value?.locations.length ? (l(), o(B, { key: 0 }, [
        ye($($t, {
          atlas: d(n).map.atlas,
          region: A.value,
          "current-location-key": W.value,
          "selected-location-key": P.value,
          "focus-key": U.value,
          "focus-sequence": I.value,
          onSelect: u[11] || (u[11] = (b) => ne(b))
        }, null, 8, [
          "atlas",
          "region",
          "current-location-key",
          "selected-location-key",
          "focus-key",
          "focus-sequence"
        ]), [[Se, !K.value]]),
        K.value ? (l(), o(B, { key: 0 }, [be.value?.status === "active" ? (l(), N(Ea, {
          key: 0,
          mode: H.value,
          "onUpdate:mode": u[12] || (u[12] = (b) => H.value = b),
          scene: be.value,
          "three-unavailable": D.value,
          onFallback: Ie
        }, null, 8, [
          "mode",
          "scene",
          "three-unavailable"
        ])) : (l(), o("div", zl, [
          $(j, { name: "layers" }),
          t("h2", null, h(J.value ? "这里的布局还没画出来" : "还不知道你在哪里"), 1),
          t("p", null, h(J.value ? "更新地图后，会结合设定与剧情补齐这里的普通布局。" : "更新地图后，会根据剧情确认你所在的地方。"), 1),
          t("button", {
            type: "button",
            class: "map-secondary-button",
            disabled: !!d(v),
            onClick: u[13] || (u[13] = (...b) => d(Q) && d(Q)(...b))
          }, h(d(a) ? "正在更新…" : "更新地图"), 9, Ol),
          d(v) && !d(a) ? (l(), o("p", Dl, h(d(v)), 1)) : f("", !0)
        ]))], 64)) : f("", !0),
        !K.value && !ve.value.length ? (l(), o("div", Zl, [
          $(j, { name: "pin" }),
          u[30] || (u[30] = t("h2", null, "这里还没有标出更多地点", -1)),
          u[31] || (u[31] = t("p", null, "可以先看看其他区域，或更新地图补充。", -1)),
          t("button", {
            type: "button",
            class: "map-secondary-button",
            onClick: u[14] || (u[14] = (b) => ae(de.value?.parent || ""))
          }, "查看上级区域")
        ])) : f("", !0)
      ], 64)) : (l(), o("div", Ul, [
        t("span", Nl, [$(j, { name: "globe" })]),
        u[32] || (u[32] = t("small", null, "故事之外，还有一整个世界", -1)),
        t("h1", null, h(d(n).status === "loading" ? "正在打开地图…" : "下一站，去哪里？"), 1),
        u[33] || (u[33] = t("p", null, [
          R("把世界设定画成地图，"),
          t("br"),
          R("也为留白的地方添上值得探索的去处。")
        ], -1)),
        d(n).status !== "loading" ? (l(), o("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          disabled: !!d(v),
          onClick: u[15] || (u[15] = (...b) => d(Y) && d(Y)(...b))
        }, h(d(a) ? d(m) || "正在准备…" : "绘制世界地图"), 9, Wl)) : f("", !0),
        d(v) && !d(a) ? (l(), o("p", Yl, h(d(v)), 1)) : f("", !0)
      ]))], 2),
      S.value?.locations.length && !K.value ? (l(), o("div", {
        key: 0,
        class: O(["map-floating-tools", { "has-detail": G.value }])
      }, [t("button", {
        type: "button",
        class: "map-round-button",
        disabled: !X.value,
        "aria-label": "回到我的位置",
        onClick: Ae
      }, [$(j, { name: "locate" })], 8, Xl), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-expanded": x.value,
        "aria-label": "地图图例",
        onClick: u[16] || (u[16] = (b) => x.value = !x.value)
      }, [$(j, { name: "layers" })], 8, Fl)], 2)) : f("", !0),
      x.value ? (l(), o("aside", Gl, [...u[34] || (u[34] = [
        t("strong", null, "读懂这张地图", -1),
        t("p", null, [
          t("i", { class: "map-key-current" }),
          R("你在这里 "),
          t("i", { class: "map-key-place" }),
          R("可探索地点")
        ], -1),
        t("p", null, "路线连接已记录的地点；箭头表示单向通行。", -1),
        t("small", null, "世界图展示区域与地点，不按实际比例。场景图展示一个地点的内部布局。", -1)
      ])])) : f("", !0),
      G.value && d(n).map && !K.value ? (l(), N(wl, {
        key: G.value.key,
        location: G.value,
        map: d(n).map,
        "current-key": W.value,
        onClose: u[17] || (u[17] = (b) => P.value = ""),
        onScene: u[18] || (u[18] = (b) => pe(G.value.key)),
        onExplore: u[19] || (u[19] = (b) => ae(G.value.key)),
        onSelect: u[20] || (u[20] = (b) => ne(b, !0))
      }, null, 8, [
        "location",
        "map",
        "current-key"
      ])) : S.value?.locations.length && !K.value ? (l(), o("footer", Jl, [
        t("span", es, [$(j, { name: "compass" })]),
        t("div", null, [t("h1", null, h(de.value?.name || "世界地图"), 1), t("p", null, h(ve.value.length) + " 个地点 · " + h(ke.value ? ke.value + " 处还没去过" : "看看熟悉的地方有什么变化"), 1)]),
        t("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "浏览全部地点",
          onClick: u[21] || (u[21] = (b) => M.value = !0)
        }, [$(j, { name: "next" })])
      ])) : K.value && S.value?.locations.length ? (l(), o("footer", ts, [$(j, { name: "layers" }), t("span", null, [t("strong", null, h(J.value?.name || "当前位置待确认"), 1), t("small", null, h(C.value ? "正在查看场景图 · 不会移动人物" : "当前位置的场景图"), 1)])])) : f("", !0),
      M.value && S.value ? (l(), N(cl, {
        key: 5,
        atlas: S.value,
        onClose: u[22] || (u[22] = (b) => M.value = !1),
        onSelect: u[23] || (u[23] = (b) => ne(b, !0))
      }, null, 8, ["atlas"])) : f("", !0),
      y.value ? (l(), N(el, {
        key: 6,
        "auto-maintenance": d(n).autoMaintenance,
        busy: d(a),
        "refresh-disabled": d(k),
        "auto-toggle-busy": d(i) !== null,
        "disabled-reason": d(v),
        "has-map": !!d(n).map,
        status: d(m),
        "maintenance-message": d(n).maintenanceMessage || "",
        "maintenance-error": d(n).maintenanceStatus === "error",
        notice: d(r),
        "notice-error": d(p),
        onClose: u[24] || (u[24] = (b) => y.value = !1),
        onSetAuto: d(E),
        onUpdate: d(Q),
        onRebuild: d(Y),
        onRefresh: d(e)
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
      ])) : f("", !0)
    ], 2));
  }
}), is = as;
export {
  is as default
};
