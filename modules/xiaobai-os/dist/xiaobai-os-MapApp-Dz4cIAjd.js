/* eslint-disable */
import { $ as N, B as Se, E as Ce, F as n, G as Be, H as ne, L as D, M as Me, O as je, Q as r, R as Fe, W as $e, Y as V, Z as We, _ as i, b as w, c as Ae, et as he, g as b, h as W, l as be, m as t, o as Ne, p as M, s as Re, tt as v, u as S, v as Ye, x as U, y as E } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as Xe } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as Ie } from "./xiaobai-os-AppDialog-CaAiivYL.js";
import { C as L, D as Ge, E as Je, O as et, S as Ke, T as ye, a as tt, b as at, c as lt, d as nt, f as Ee, g as st, h as ot, i as Te, l as it, n as rt, o as ut, p as Ve, r as Oe, s as ct, u as qe, v as me, w as ee, x as dt, y as vt } from "./xiaobai-os-map-presentation-DJztEHLW.js";
var pt = { class: "map-viewport" }, mt = ["viewBox", "aria-label"], yt = {
  class: "map-viewport-controls",
  "aria-label": "地图缩放"
}, ft = /* @__PURE__ */ U({
  __name: "MapViewport",
  props: {
    viewBox: {},
    resetKey: { default: "" },
    label: {},
    focusPoint: { default: void 0 },
    focusSequence: { default: 0 }
  },
  setup(a) {
    const s = a, o = V(null), l = V([...s.viewBox]), c = V([0, 0]), g = M(() => c.value[0] && c.value[1] ? Math.max(l.value[2] / c.value[0], l.value[3] / c.value[1]) : 1);
    let m;
    Me(() => {
      m = new ResizeObserver((y) => {
        const C = y[0].contentRect;
        c.value = [C.width, C.height];
      }), o.value && m.observe(o.value);
    });
    const u = /* @__PURE__ */ new Map();
    let p = null, f = [0, 0], e = 0, h = null, A = !1, K = !1, R = null;
    const X = M(() => l.value.join(" "));
    function I() {
      l.value = [...s.viewBox];
    }
    function T() {
      return g.value;
    }
    function $(y, C) {
      const B = o.value?.getBoundingClientRect();
      if (!B) return [l.value[0], l.value[1]];
      const P = T();
      return [l.value[0] + l.value[2] / 2 + (y - B.left - B.width / 2) * P, l.value[1] + l.value[3] / 2 + (C - B.top - B.height / 2) * P];
    }
    function H(y, C) {
      const B = Math.max(1, s.viewBox[2]), P = Math.min(B * 3, Math.max(Math.min(B * 0.24, 240), l.value[2] * y)), j = P / l.value[2], Z = C || [l.value[0] + l.value[2] / 2, l.value[1] + l.value[3] / 2];
      l.value = [
        Z[0] - (Z[0] - l.value[0]) * j,
        Z[1] - (Z[1] - l.value[1]) * j,
        P,
        l.value[3] * j
      ];
    }
    function Y() {
      if (!s.focusPoint) return;
      const y = Math.min(l.value[2], 620), C = l.value[3] * y / l.value[2];
      l.value = [
        s.focusPoint[0] - y / 2,
        s.focusPoint[1] - C / 2,
        y,
        C
      ];
    }
    function F() {
      const y = [...u.values()];
      y.length === 1 && (p = y[0], f = [l.value[0], l.value[1]]), y.length === 2 && (e = Math.hypot(y[1][0] - y[0][0], y[1][1] - y[0][1]), h = [(y[0][0] + y[1][0]) / 2, (y[0][1] + y[1][1]) / 2], A = !0);
    }
    function G(y) {
      y.button !== 0 || u.size >= 2 || (u.size || (A = !1), u.set(y.pointerId, [y.clientX, y.clientY]), y.target.setPointerCapture(y.pointerId), F());
    }
    function q(y) {
      if (!u.has(y.pointerId)) return;
      u.set(y.pointerId, [y.clientX, y.clientY]);
      const C = [...u.values()];
      if (C.length === 2 && h) {
        const B = Math.hypot(C[1][0] - C[0][0], C[1][1] - C[0][1]), P = [(C[0][0] + C[1][0]) / 2, (C[0][1] + C[1][1]) / 2];
        B > 0 && e > 0 && H(e / B, $(...h)), l.value[0] -= (P[0] - h[0]) * T(), l.value[1] -= (P[1] - h[1]) * T(), e = B, h = P;
      } else if (p) {
        const B = y.clientX - p[0], P = y.clientY - p[1];
        Math.abs(B) + Math.abs(P) > 4 && (A = !0), l.value = [
          f[0] - B * T(),
          f[1] - P * T(),
          l.value[2],
          l.value[3]
        ];
      }
    }
    function O(y) {
      if (!u.delete(y.pointerId)) return;
      const C = y.target;
      C.hasPointerCapture(y.pointerId) && C.releasePointerCapture(y.pointerId), F(), u.size || (p = null, h = null), A && (K = !0, R && clearTimeout(R), R = setTimeout(() => {
        K = !1;
      }, 0));
    }
    function Q(y) {
      K && (y.preventDefault(), y.stopPropagation());
    }
    return ne(() => s.resetKey, I, { immediate: !0 }), ne(() => s.focusSequence, Y, { flush: "post" }), je(() => {
      m?.disconnect(), R && clearTimeout(R);
    }), (y, C) => (n(), i("div", pt, [(n(), i("svg", {
      ref_key: "svg",
      ref: o,
      class: "map-viewport-svg",
      viewBox: X.value,
      preserveAspectRatio: "xMidYMid meet",
      role: "group",
      "aria-label": a.label,
      onWheel: C[0] || (C[0] = be((B) => H(B.deltaY < 0 ? 0.84 : 1.19, $(B.clientX, B.clientY)), ["prevent"])),
      onPointerdown: G,
      onPointermove: q,
      onPointerup: O,
      onPointercancel: O,
      onClickCapture: Q
    }, [Fe(y.$slots, "default", { unitScale: g.value })], 40, mt)), t("div", yt, [
      t("button", {
        type: "button",
        "aria-label": "放大地图",
        onClick: C[1] || (C[1] = (B) => H(0.8))
      }, "+"),
      t("button", {
        type: "button",
        "aria-label": "缩小地图",
        onClick: C[2] || (C[2] = (B) => H(1.25))
      }, "−"),
      t("button", {
        type: "button",
        class: "map-fit",
        onClick: I
      }, "全图")
    ])]));
  }
}), Qe = ft, ht = {
  class: "map-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, bt = ["d"], kt = /* @__PURE__ */ U({
  __name: "MapIcon",
  props: { name: { default: "pin" } },
  setup(a) {
    const s = {
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
    return (o, l) => (n(), i("svg", ht, [t("path", { d: s[a.name] || s.pin }, null, 8, bt)]));
  }
}), _ = kt;
function te(a) {
  return a.scale === "region";
}
function gt(a) {
  return a.scale !== "world" && !te(a);
}
function fe(a, s) {
  const o = new Map(a.locations.map((g) => [g.key, g])), l = [];
  let c = o.get(s);
  for (; c; )
    l.unshift(c), c = c.parent ? o.get(c.parent) : void 0;
  return l;
}
function ke(a, s) {
  return fe(a, s).reverse().find(te);
}
function Mt(a) {
  const s = /* @__PURE__ */ new Set(), o = a.actors.find((l) => l.actorKey === "player")?.locationKey;
  for (const l of a.locations)
    if (!(l.status !== "visited" && l.key !== o))
      for (const c of fe(a, l.key)) s.add(c.key);
  return s;
}
function ge(a, s, o) {
  const l = new Set(o.map((c) => c.key));
  return fe(a, s).reverse().find((c) => l.has(c.key))?.key || "";
}
function $t(a, s) {
  return a.links.flatMap((o) => {
    if (o.from !== s && o.to !== s) return [];
    const l = a.locations.find((c) => c.key === (o.from === s ? o.to : o.from));
    return l ? [{
      location: l,
      link: o,
      outgoing: o.bidirectional || o.from === s
    }] : [];
  });
}
function wt(a, s) {
  const o = [...s.locations].sort((e, h) => e.key.localeCompare(h.key, "en")), l = (e) => e.position && (e.parent || "") === s.positionParent, c = o.filter(l).map((e) => ({
    location: e,
    x: e.position[0],
    y: e.position[1],
    placed: !0
  }));
  let g = 0;
  for (const e of o.filter((h) => !l(h))) {
    let h, A;
    do {
      const K = g * 2.3999632297, R = 155 * Math.sqrt(g++);
      h = Math.round(500 + Math.cos(K) * R), A = Math.round(420 + Math.sin(K) * R);
    } while (c.some((K) => Math.hypot(K.x - h, K.y - A) < 160));
    c.push({
      location: e,
      x: h,
      y: A,
      placed: !1
    });
  }
  c.sort((e, h) => e.location.key.localeCompare(h.location.key, "en"));
  const m = new Map(c.map((e) => [e.location.key, e])), u = a.links.flatMap((e) => {
    const h = m.get(ge(a, e.from, o)), A = m.get(ge(a, e.to, o));
    if (!h || !A || h === A) return [];
    const K = (h.x + A.x) / 2, R = (h.y + A.y) / 2;
    return [{
      link: e,
      from: h,
      to: A,
      x: K,
      y: R,
      path: `M ${h.x} ${h.y} Q ${K + (A.y - h.y) * 0.12} ${R - (A.x - h.x) * 0.12} ${A.x} ${A.y}`
    }];
  }), p = c.length ? Math.min(...c.map((e) => e.x)) - 140 : 0, f = c.length ? Math.min(...c.map((e) => e.y)) - 150 : 0;
  return {
    nodes: c,
    routes: u,
    viewBox: [
      p,
      f,
      c.length ? Math.max(420, Math.max(...c.map((e) => e.x)) - p + 140) : 800,
      c.length ? Math.max(500, Math.max(...c.map((e) => e.y)) - f + 190) : 900
    ]
  };
}
var xt = {
  class: "map-landscapes",
  "aria-hidden": "true"
}, _t = ["transform"], Ct = {
  class: "map-world-roads",
  "aria-hidden": "true"
}, St = ["d"], Bt = ["d", "marker-end"], jt = ["x", "y"], Ht = [
  "transform",
  "aria-label",
  "onClick",
  "onKeydown"
], Pt = { transform: "translate(-14 -20)" }, At = {
  y: "64",
  class: "map-place-name"
}, Vt = {
  key: 0,
  y: "89",
  class: "map-place-status"
}, qt = {
  key: 1,
  y: "89",
  class: "map-place-status"
}, Lt = /* @__PURE__ */ U({
  __name: "MapAtlas",
  props: {
    atlas: {},
    scope: {},
    label: {},
    currentLocationKey: {},
    selectedLocationKey: {},
    focusKey: {},
    focusSequence: {}
  },
  emits: ["select"],
  setup(a) {
    const s = a, o = M(() => wt(s.atlas, s.scope)), l = M(() => ge(s.atlas, s.currentLocationKey, s.scope.locations)), c = M(() => o.value.nodes.find((u) => u.location.key === s.focusKey)), g = "map-arrow-" + Se();
    function m(u, p) {
      return u === "water" ? "water" : u === "forest" ? "tree" : u === "mountain" ? "mountain" : ["world", "region"].includes(p) ? "globe" : p === "outdoor" ? "compass" : "building";
    }
    return (u, p) => (n(), W(Qe, {
      "view-box": o.value.viewBox,
      "reset-key": `${a.scope.kind}:${a.scope.region?.key || ""}`,
      label: a.label,
      "focus-point": c.value ? [c.value.x, c.value.y] : void 0,
      "focus-sequence": a.focusSequence
    }, {
      default: $e(({ unitScale: f }) => [
        t("defs", null, [t("marker", {
          id: g,
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
        t("g", xt, [(n(!0), i(S, null, D(o.value.nodes, (e) => (n(), i("g", {
          key: e.location.key,
          transform: `translate(${e.x} ${e.y})`,
          class: N(`is-${e.location.terrain || "urban"}`)
        }, [...p[1] || (p[1] = [t("path", { d: "M-108-20Q-100-100-32-94T87-56Q127-13 99 48T21 99Q-57 113-90 65T-108-20Z" }, null, -1), t("path", {
          class: "map-contour",
          d: "M-133-22Q-124-126-39-116T110-70Q156-17 124 60T26 123Q-71 139-112 81T-133-22Z"
        }, null, -1)])], 10, _t))), 128))]),
        t("g", Ct, [(n(!0), i(S, null, D(o.value.routes, (e) => (n(), i("g", {
          key: e.link.id,
          class: N({
            "is-path": e.link.kind === "path",
            "is-portal": e.link.kind === "portal"
          })
        }, [
          t("path", {
            class: "map-road-casing",
            d: e.path
          }, null, 8, St),
          t("path", {
            class: "map-road-line",
            d: e.path,
            "marker-end": e.link.bidirectional ? void 0 : `url(#${g})`
          }, null, 8, Bt),
          e.link.label ? (n(), i("text", {
            key: 0,
            x: e.x,
            y: e.y - 14
          }, v(e.link.label), 9, jt)) : b("", !0)
        ], 2))), 128))]),
        (n(!0), i(S, null, D(o.value.nodes, (e) => (n(), i("g", {
          key: e.location.key,
          class: N(["map-place", {
            "is-selected": e.location.key === a.selectedLocationKey,
            "is-current": e.location.key === l.value,
            "is-unvisited": e.location.status !== "visited"
          }]),
          transform: `translate(${e.x} ${e.y}) scale(${f * 0.5})`,
          role: "button",
          tabindex: "0",
          "aria-label": `查看${e.location.name}`,
          onClick: be((h) => u.$emit("select", e.location.key), ["stop"]),
          onKeydown: [Ae(be((h) => u.$emit("select", e.location.key), ["stop"]), ["enter"]), Ae(be((h) => u.$emit("select", e.location.key), ["stop", "prevent"]), ["space"])]
        }, [
          p[2] || (p[2] = t("circle", {
            class: "map-pin-halo",
            r: "39"
          }, null, -1)),
          p[3] || (p[3] = t("path", {
            class: "map-pin-body",
            d: "M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z"
          }, null, -1)),
          t("g", Pt, [w(_, {
            name: m(e.location.terrain, e.location.scale),
            width: "28",
            height: "28"
          }, null, 8, ["name"])]),
          t("text", At, v(e.location.name.length > 14 ? e.location.name.slice(0, 13) + "…" : e.location.name), 1),
          e.location.key === l.value ? (n(), i("text", Vt, "你在这里")) : e.location.status !== "visited" ? (n(), i("text", qt, v(r(ye).unvisited), 1)) : b("", !0),
          t("title", null, v(e.location.name) + v(e.location.brief ? " · " + e.location.brief : ""), 1)
        ], 42, Ht))), 128))
      ]),
      _: 1
    }, 8, [
      "view-box",
      "reset-key",
      "label",
      "focus-point",
      "focus-sequence"
    ]));
  }
}), Rt = Lt, pe;
async function ze() {
  if (!pe) {
    const a = [
      "..",
      "..",
      "..",
      "libs",
      "material-symbols",
      "material-symbols-rounded.woff2"
    ].join("/"), s = new URL(a, import.meta.url);
    pe = new FontFace("Xiaobai Map Symbols", `url("${s.href}")`, {
      display: "block",
      weight: "400"
    }).load(), pe.catch(() => {
      pe = void 0;
    });
  }
  document.fonts.add(await pe);
}
var It = ["id"], Kt = ["stop-color", "stop-opacity"], Et = ["stop-color", "stop-opacity"], Tt = ["stop-color", "stop-opacity"], Ot = ["id"], Qt = ["fill", "fill-opacity"], zt = {
  fill: "none",
  stroke: "var(--scene-shadow)",
  "stroke-width": ".65",
  opacity: ".24"
}, Dt = {
  key: 1,
  d: "M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21"
}, Zt = {
  key: 2,
  d: "M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z"
}, Ut = {
  key: 3,
  d: "M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17",
  opacity: ".65"
}, Ft = {
  key: 4,
  d: "M3 8q6 3 13 0M25 25q7 2 17-1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.3",
  opacity: "1"
}, Wt = {
  key: 5,
  d: "M5 32 37 0M12 32 44 0",
  stroke: "var(--scene-highlight)",
  "stroke-width": "2.2"
}, Nt = {
  key: 6,
  d: "M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3"
}, Yt = {
  key: 7,
  d: "M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2",
  "stroke-linecap": "round"
}, Xt = {
  key: 8,
  d: "M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1"
}, Gt = {
  key: 9,
  d: "M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32",
  opacity: ".55"
}, Jt = {
  key: 10,
  d: "m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8"
}, ea = {
  key: 11,
  d: "M7 8q12-5 16 6t20 7M4 27l6-3"
}, ta = {
  key: 12,
  d: "M5 19q5-3 11-1M29 8q6-2 12 1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.4"
}, aa = {
  key: 0,
  d: "M0 1H48",
  stroke: "var(--scene-highlight)",
  "stroke-width": ".7",
  opacity: ".35"
}, la = ["id"], na = ["id"], sa = ["transform", "fill"], oa = /* @__PURE__ */ U({
  __name: "SceneMaterials",
  props: { prefix: {} },
  setup(a) {
    return (s, o) => (n(), i("defs", null, [
      (n(!0), i(S, null, D(r(dt), (l) => (n(), i(S, { key: l }, [t("linearGradient", {
        id: `${a.prefix}-face-${l}`,
        x1: "0",
        y1: "0",
        x2: ".7",
        y2: "1"
      }, [
        t("stop", {
          offset: "0",
          "stop-color": `color-mix(in srgb, ${r(me)(l)}, var(--scene-highlight) 24%)`,
          "stop-opacity": l === "glass" ? 0.35 : 1
        }, null, 8, Kt),
        t("stop", {
          offset: ".52",
          "stop-color": r(me)(l),
          "stop-opacity": l === "glass" ? 0.16 : 1
        }, null, 8, Et),
        t("stop", {
          offset: "1",
          "stop-color": `color-mix(in srgb, ${r(me)(l)}, var(--scene-shadow) 16%)`,
          "stop-opacity": l === "glass" ? 0.28 : 1
        }, null, 8, Tt)
      ], 8, It), t("pattern", {
        id: `${a.prefix}-material-${l}`,
        width: "48",
        height: "32",
        patternUnits: "userSpaceOnUse",
        class: "scene-texture"
      }, [
        t("rect", {
          width: "48",
          height: "32",
          fill: r(me)(l),
          "fill-opacity": l === "glass" ? 0.4 : 1
        }, null, 8, Qt),
        t("g", zt, [l === "wood" ? (n(), i(S, { key: 0 }, [o[0] || (o[0] = t("path", { d: "M0 0H48M0 16H48M19 0V16M37 16V32" }, null, -1)), o[1] || (o[1] = t("path", {
          d: "M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1",
          opacity: ".5"
        }, null, -1))], 64)) : l === "stone" ? (n(), i("path", Dt)) : l === "tile" ? (n(), i("path", Zt)) : l === "marble" ? (n(), i("path", Ut)) : l === "water" ? (n(), i("path", Ft)) : l === "glass" ? (n(), i("path", Wt)) : l === "grass" || l === "forest" ? (n(), i("path", Nt)) : l === "dirt" || l === "sand" ? (n(), i("path", Yt)) : l === "metal" ? (n(), i("path", Xt)) : [
          "carpet",
          "fabric",
          "bed-sheet",
          "tatami"
        ].includes(l) ? (n(), i("path", Gt)) : l === "rune" ? (n(), i("path", Jt)) : l === "blood" ? (n(), i("path", ea)) : l === "snow" ? (n(), i("path", ta)) : b("", !0)]),
        l === "wood" || l === "stone" || l === "metal" ? (n(), i("path", aa)) : b("", !0)
      ], 8, Ot)], 64))), 128)),
      t("radialGradient", {
        id: `${a.prefix}-crown-face`,
        cx: ".32",
        cy: ".25",
        r: ".8"
      }, [...o[2] || (o[2] = [
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
      ])], 8, la),
      (n(), i(S, null, D(3, (l) => t("symbol", {
        id: `${a.prefix}-crown-${l - 1}`,
        key: l,
        viewBox: "0 0 100 100"
      }, [t("g", {
        transform: `rotate(${l * 37} 50 50)`,
        fill: `url(#${a.prefix}-crown-face)`,
        stroke: "var(--scene-leaf-dark)",
        "stroke-width": ".6"
      }, [...o[3] || (o[3] = [
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
      ])], 8, sa)], 8, na)), 64))
    ]));
  }
}), ia = oa, ra = [
  "x",
  "y",
  "width",
  "height"
], ua = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "50"
}, ca = {
  key: 1,
  width: "100",
  height: "100"
}, da = ["clip-path", "fill"], va = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "49",
  class: "scene-object-edge"
}, pa = {
  key: 1,
  x: "1",
  y: "1",
  width: "98",
  height: "98",
  rx: "2",
  class: "scene-object-edge"
}, ma = ["fill"], ya = ["fill"], fa = ["d"], ha = {
  key: 0,
  d: "M9 78H91",
  class: "scene-object-seam"
}, ba = ["x"], ka = /* @__PURE__ */ U({
  __name: "SceneObject",
  props: {
    element: {},
    prefix: {},
    unitScale: {}
  },
  setup(a) {
    const s = a, o = M(() => Ee(s.element)), l = M(() => Math.min(o.value.width, o.value.height) / s.unitScale >= 12), c = M(() => s.element.shape === "circle"), g = M(() => s.element.material), m = M(() => vt(g.value, s.prefix)), u = M(() => at(g.value, s.prefix)), p = `scene-object-${Se()}`;
    return (f, e) => (n(), i("svg", {
      x: o.value.x,
      y: o.value.y,
      width: o.value.width,
      height: o.value.height,
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "scene-object"
    }, [t("defs", null, [t("clipPath", { id: p }, [c.value ? (n(), i("circle", ua)) : (n(), i("rect", ca))])]), t("g", {
      "clip-path": `url(#${p})`,
      fill: m.value
    }, [c.value ? (n(), i("circle", va)) : (n(), i("rect", pa)), l.value ? (n(), i(S, { key: 2 }, [c.value ? (n(), i("circle", {
      key: 0,
      cx: "50",
      cy: "50",
      r: "44",
      fill: u.value,
      class: "scene-object-inset"
    }, null, 8, ma)) : (n(), i("rect", {
      key: 1,
      x: "5",
      y: "5",
      width: "90",
      height: "90",
      rx: "2",
      fill: u.value,
      class: "scene-object-inset"
    }, null, 8, ya)), a.element.icon === "table" || a.element.icon === "counter" ? (n(), i(S, { key: 2 }, [t("path", {
      d: c.value ? "M18 36A35 35 0 0 1 72 22" : "M8 13V8H92",
      class: "scene-object-shine"
    }, null, 8, fa), a.element.icon === "counter" ? (n(), i("path", ha)) : b("", !0)], 64)) : a.element.icon === "chair" ? (n(), i(S, { key: 3 }, [
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
    ], 64)) : a.element.icon === "bed" ? (n(), i(S, { key: 4 }, [
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
    ], 64)) : a.element.icon === "shelf" ? (n(), i(S, { key: 5 }, [e[7] || (e[7] = t("path", {
      d: "M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92",
      class: "scene-object-seam"
    }, null, -1)), e[8] || (e[8] = t("path", {
      d: "M8 34H92M8 68H92",
      class: "scene-object-shine"
    }, null, -1))], 64)) : a.element.icon === "sofa" ? (n(), i(S, { key: 6 }, [
      e[9] || (e[9] = t("rect", {
        x: "8",
        y: "5",
        width: "84",
        height: "25",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      (n(), i(S, null, D(3, (h) => t("rect", {
        key: h,
        x: 15 + (h - 1) * 24,
        y: "32",
        width: "22",
        height: "57",
        rx: "5",
        class: "scene-object-inset"
      }, null, 8, ba)), 64)),
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
    ], 64)) : a.element.icon === "bridge" ? (n(), i(S, { key: 7 }, [e[12] || (e[12] = t("path", {
      d: "M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91",
      class: "scene-object-seam"
    }, null, -1)), e[13] || (e[13] = t("path", {
      d: "M11 7V93M89 7V93",
      class: "scene-object-shine"
    }, null, -1))], 64)) : a.element.icon === "tree" ? (n(), i(S, { key: 8 }, [e[14] || (e[14] = Ye('<circle cx="34" cy="32" r="24" class="scene-object-inset"></circle><circle cx="69" cy="36" r="24" class="scene-object-inset"></circle><circle cx="30" cy="62" r="23" class="scene-object-inset"></circle><circle cx="64" cy="67" r="25" class="scene-object-inset"></circle><circle cx="49" cy="48" r="26" class="scene-object-inset"></circle><path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine"></path>', 6))], 64)) : a.element.icon === "rock" ? (n(), i(S, { key: 9 }, [e[15] || (e[15] = t("path", {
      d: "M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57",
      class: "scene-object-seam"
    }, null, -1)), e[16] || (e[16] = t("path", {
      d: "M12 38 33 17 72 22",
      class: "scene-object-shine"
    }, null, -1))], 64)) : b("", !0)], 64)) : b("", !0)], 8, da)], 8, ra));
  }
}), ga = ka, Ma = ["data-element", "opacity"], $a = ["transform"], wa = ["d"], xa = ["d", "stroke-width"], _a = [
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap"
], Ca = [
  "d",
  "stroke",
  "stroke-opacity",
  "stroke-dasharray"
], Sa = ["transform"], Ba = ["id"], ja = ["d"], Ha = ["clip-path"], Pa = [
  "href",
  "x",
  "y",
  "width",
  "height"
], Aa = ["transform"], Va = {
  key: 0,
  r: "19",
  class: "scene-player-halo"
}, qa = ["stroke"], La = {
  key: 1,
  class: "map-material-symbol",
  "aria-hidden": "true"
}, Ra = {
  key: 2,
  class: "map-symbol-fallback",
  "aria-hidden": "true"
}, Ia = ["x", "y"], Ka = /* @__PURE__ */ U({
  __name: "MapScene",
  props: { scene: {} },
  setup(a) {
    const s = a, o = V(!1);
    Me(() => {
      ze().then(() => {
        o.value = !0;
      }).catch(() => {
        o.value = !1;
      });
    });
    const l = `xiaobai-map-scene-${Se()}`, c = M(() => Oe[s.scene.mood || "neutral"]), g = M(() => ct(s.scene.elements)), m = M(() => ut(s.scene.elements).map((u, p) => ({
      element: u,
      bounds: Ee(u),
      path: ot(u),
      transform: st(u),
      area: it(u),
      presentation: tt(u, l),
      clipId: `${l}-area-${p}`,
      object: nt(u) && !qe(u),
      marker: qe(u) && u.shape !== "label"
    })));
    return (u, p) => (n(), W(Qe, {
      class: "map-scene-viewport",
      style: he({ "--scene-glow": c.value.glow }),
      "view-box": a.scene.viewBox,
      "reset-key": a.scene.key,
      label: `${a.scene.name} 场景地图`
    }, {
      default: $e(({ unitScale: f }) => [
        w(ia, { prefix: l }),
        (n(!0), i(S, null, D(m.value, (e) => (n(), i("g", {
          key: e.element.id,
          class: N(["map-scene-element", [`is-${e.element.category}`, `is-${e.element.certainty || "confirmed"}`]]),
          "data-element": e.element.id,
          opacity: e.presentation.opacity
        }, [t("g", { transform: e.transform }, [
          e.object ? (n(), W(ga, {
            key: 0,
            element: e.element,
            prefix: l,
            "unit-scale": f
          }, null, 8, ["element", "unit-scale"])) : e.path ? (n(), i(S, { key: 1 }, [
            e.element.category === "wall" ? (n(), i("path", {
              key: 0,
              d: e.path,
              fill: "none",
              stroke: "var(--scene-shadow)",
              "stroke-width": "9",
              opacity: ".18",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, wa)) : b("", !0),
            e.element.category === "road" && !e.area ? (n(), i("path", {
              key: 1,
              d: e.path,
              fill: "none",
              stroke: "var(--scene-soft-edge)",
              "stroke-width": e.presentation.width + 2,
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, xa)) : b("", !0),
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
            }, null, 8, _a),
            e.element.category === "wall" ? (n(), i("path", {
              key: 2,
              d: e.path,
              fill: "none",
              stroke: e.element.material ? r(me)(e.element.material) : "var(--scene-wall)",
              "stroke-width": "3.5",
              "stroke-opacity": e.element.material === "glass" ? 0.4 : 1,
              "stroke-dasharray": e.presentation.dash,
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, Ca)) : b("", !0)
          ], 64)) : b("", !0),
          e.object && !r(lt)(e.element) && Math.min(e.bounds.width, e.bounds.height) / f >= 12 ? (n(), i("g", {
            key: 2,
            transform: `translate(${e.bounds.x + e.bounds.width / 2} ${e.bounds.y + e.bounds.height / 2})`,
            "aria-hidden": "true"
          }, [t("text", {
            class: N(o.value ? "map-material-symbol" : "map-symbol-fallback"),
            style: he({
              fontSize: `${Math.min(22 * f, Math.min(e.bounds.width, e.bounds.height) * 0.65)}px`,
              fill: "var(--scene-edge)",
              textAnchor: "middle",
              dominantBaseline: "central"
            })
          }, v(o.value ? e.presentation.icon : e.presentation.fallback), 7)], 8, Sa)) : b("", !0),
          g.value.has(e.element.id) ? (n(), i(S, { key: 3 }, [t("defs", null, [t("clipPath", { id: e.clipId }, [t("path", {
            d: e.path,
            "clip-rule": "evenodd"
          }, null, 8, ja)], 8, Ba)]), t("g", {
            "clip-path": `url(#${e.clipId})`,
            class: "scene-forest-decoration",
            "aria-hidden": "true"
          }, [(n(!0), i(S, null, D(g.value.get(e.element.id), (h, A) => (n(), i("use", {
            key: A,
            href: `#${l}-crown-${h.variant}`,
            x: h.x - h.size / 2,
            y: h.y - h.size / 2,
            width: h.size,
            height: h.size
          }, null, 8, Pa))), 128))], 8, Ha)], 64)) : b("", !0)
        ], 8, $a), e.marker ? (n(), i("g", {
          key: 0,
          class: "map-scene-icon",
          transform: `translate(${e.bounds.x + e.bounds.width / 2} ${e.bounds.y + e.bounds.height / 2}) scale(${f})`
        }, [
          e.element.actorKey === "player" || e.element.kind === "player" ? (n(), i("circle", Va)) : b("", !0),
          t("circle", {
            r: "11",
            stroke: e.presentation.stroke
          }, null, 8, qa),
          o.value ? (n(), i("text", La, v(e.presentation.icon), 1)) : (n(), i("text", Ra, v(e.presentation.fallback), 1))
        ], 8, Aa)) : b("", !0)], 10, Ma))), 128)),
        t("g", {
          class: "scene-labels",
          style: he({ "--scene-unit-scale": f })
        }, [(n(!0), i(S, null, D(m.value, (e) => (n(), i(S, { key: e.element.id }, [e.element.label ? (n(), i("text", {
          key: 0,
          class: N(["map-scene-label", { "is-primary": e.element.shape === "label" }]),
          x: r(Ve)(e.element, f)[0],
          y: r(Ve)(e.element, f)[1]
        }, v(e.element.label), 11, Ia)) : b("", !0)], 64))), 128))], 4)
      ]),
      _: 1
    }, 8, [
      "style",
      "view-box",
      "reset-key",
      "label"
    ]));
  }
}), Ea = Ka, Ta = {
  key: 0,
  class: "map-3d-loading",
  role: "status"
}, Oa = {
  class: "map-viewport-controls",
  "aria-label": "三维视角"
}, Qa = /* @__PURE__ */ U({
  __name: "MapScene3D",
  props: {
    scene: {},
    lowWalls: { type: Boolean },
    showLabels: { type: Boolean }
  },
  emits: ["fallback"],
  setup(a, { emit: s }) {
    const o = a, l = s, c = V(null), g = V(null), m = V(!0);
    let u, p = !1;
    return Me(async () => {
      p = !0;
      try {
        const { createThreeRuntime: f } = await import("./xiaobai-os-three-runtime-CKh2C5ny.js");
        if (!p) return;
        u = f(c.value, g.value, { fallback: (e) => l("fallback", e) }), u.setScene(o.scene), u.walls(o.lowWalls), u.labels(o.showLabels), m.value = !1, ze().then(() => {
          p && u?.symbols(!0);
        }).catch(() => {
        });
      } catch {
        p && l("fallback", "当前设备无法打开三维，已切换二维。");
      }
    }), ne(() => o.scene, (f) => u?.setScene(f)), ne(() => o.lowWalls, (f) => u?.walls(f)), ne(() => o.showLabels, (f) => u?.labels(f)), je(() => {
      p = !1, u?.dispose(), u = void 0;
    }), (f, e) => (n(), i("div", {
      ref_key: "host",
      ref: c,
      class: "map-scene-three",
      style: he({ "--scene-glow": r(Oe)[a.scene.mood || "neutral"].glow })
    }, [
      t("div", {
        ref_key: "labelHost",
        ref: g,
        class: "map-3d-labels"
      }, null, 512),
      m.value ? (n(), i("div", Ta, "正在打开三维…")) : b("", !0),
      t("div", Oa, [
        t("button", {
          type: "button",
          "aria-label": "放大三维",
          onClick: e[0] || (e[0] = (h) => r(u)?.zoom(1.2))
        }, "+"),
        t("button", {
          type: "button",
          "aria-label": "缩小三维",
          onClick: e[1] || (e[1] = (h) => r(u)?.zoom(1 / 1.2))
        }, "−"),
        t("button", {
          type: "button",
          class: "map-fit",
          "aria-label": "重置三维视角",
          onClick: e[2] || (e[2] = (h) => r(u)?.fit())
        }, "全图")
      ])
    ], 4));
  }
}), za = Qa, Da = ["aria-label"], Za = { class: "map-scene-toolbar" }, Ua = {
  class: "map-render-switch",
  role: "group",
  "aria-label": "场景显示方式"
}, Fa = ["aria-pressed"], Wa = ["aria-pressed", "disabled"], Na = ["aria-pressed"], Ya = ["aria-pressed"], Xa = { class: "map-scene-stage" }, Ga = /* @__PURE__ */ U({
  __name: "MapSceneView",
  props: {
    scene: {},
    mode: {},
    threeUnavailable: { type: Boolean }
  },
  emits: ["update:mode", "fallback"],
  setup(a, { emit: s }) {
    const o = s, l = V(!1), c = V(!0);
    return (g, m) => (n(), i("section", {
      class: "map-scene-view",
      "aria-label": a.scene.name
    }, [t("div", Za, [
      t("div", Ua, [t("button", {
        type: "button",
        "aria-pressed": a.mode === "2d",
        onClick: m[0] || (m[0] = (u) => o("update:mode", "2d"))
      }, "二维", 8, Fa), t("button", {
        type: "button",
        "aria-pressed": a.mode === "3d",
        disabled: a.threeUnavailable,
        onClick: m[1] || (m[1] = (u) => o("update:mode", "3d"))
      }, "三维", 8, Wa)]),
      a.mode === "3d" ? (n(), i("button", {
        key: 0,
        type: "button",
        "aria-pressed": l.value,
        onClick: m[2] || (m[2] = (u) => l.value = !l.value)
      }, "低墙", 8, Na)) : b("", !0),
      a.mode === "3d" ? (n(), i("button", {
        key: 1,
        type: "button",
        "aria-pressed": c.value,
        onClick: m[3] || (m[3] = (u) => c.value = !c.value)
      }, "名称", 8, Ya)) : b("", !0)
    ]), t("div", Xa, [Be(w(Ea, { scene: a.scene }, null, 8, ["scene"]), [[Re, a.mode === "2d"]]), a.mode === "3d" ? (n(), W(za, {
      key: 0,
      scene: a.scene,
      "low-walls": l.value,
      "show-labels": c.value,
      onFallback: m[4] || (m[4] = (u) => o("fallback", u))
    }, null, 8, [
      "scene",
      "low-walls",
      "show-labels"
    ])) : b("", !0)])], 8, Da));
  }
}), Ja = Ga;
function el(a) {
  const s = a?.atlas.actors.find((l) => l.actorKey === "player"), o = a?.atlas.locations.find((l) => l.key === s?.locationKey);
  return o?.sceneKey && a?.scenes[o.sceneKey]?.status === "active" ? "scene" : "world";
}
var tl = { class: "map-dialog-header" }, al = { key: 0 }, ll = { class: "map-settings-content" }, nl = { class: "map-auto-setting" }, sl = ["aria-checked", "disabled"], ol = { class: "map-settings-section" }, il = ["disabled"], rl = { key: 0 }, ul = { class: "map-settings-section" }, cl = { key: 0 }, dl = ["disabled"], vl = {
  key: 0,
  class: "map-setting-note",
  role: "status"
}, pl = ["disabled"], ml = /* @__PURE__ */ U({
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
  setup(a) {
    return (s, o) => (n(), W(Ie, {
      class: "map-dialog map-settings",
      "aria-labelledby": "map-settings-title",
      onClose: o[5] || (o[5] = (l) => s.$emit("close"))
    }, {
      default: $e(() => [
        t("header", tl, [o[6] || (o[6] = t("div", null, [t("small", null, "让地图跟上你的故事"), t("h2", { id: "map-settings-title" }, "地图设置")], -1)), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "关闭地图设置",
          onClick: o[0] || (o[0] = (l) => s.$emit("close"))
        }, [w(_, { name: "close" })])]),
        a.status || a.notice || a.maintenanceMessage ? (n(), i("section", {
          key: 0,
          class: N(["map-settings-feedback", { "is-error": a.notice ? a.noticeError : a.maintenanceError }]),
          role: "status"
        }, [t("strong", null, v(a.notice ? a.notice === a.maintenanceMessage ? "最近一次更新" : "操作提示" : a.status || "最近一次更新"), 1), a.notice || a.maintenanceMessage ? (n(), i("p", al, v(a.notice || a.maintenanceMessage), 1)) : b("", !0)], 2)) : b("", !0),
        t("div", ll, [
          t("section", nl, [o[8] || (o[8] = t("div", null, [t("h3", null, "随对话自动更新"), t("p", null, "你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。")], -1)), t("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": a.autoMaintenance,
            "aria-label": "随对话自动更新",
            disabled: a.autoToggleBusy,
            onClick: o[1] || (o[1] = (l) => s.$emit("setAuto", !a.autoMaintenance))
          }, [...o[7] || (o[7] = [t("span", null, null, -1)])], 8, sl)]),
          t("section", ol, [
            w(_, { name: "refresh" }),
            o[9] || (o[9] = t("h3", null, "补充最近的变化", -1)),
            o[10] || (o[10] = t("p", null, "根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。", -1)),
            t("button", {
              type: "button",
              class: "map-primary-button",
              disabled: a.busy || !!a.disabledReason || !a.hasMap,
              onClick: o[2] || (o[2] = (l) => s.$emit("update"))
            }, v(a.busy ? a.status || "请稍候…" : "更新地图"), 9, il),
            a.hasMap ? b("", !0) : (n(), i("small", rl, "请先建立世界地图"))
          ]),
          t("section", ul, [
            w(_, { name: "globe" }),
            t("h3", null, v(a.hasMap ? "重新绘制世界" : "建立世界地图"), 1),
            o[11] || (o[11] = t("p", null, "依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。", -1)),
            a.hasMap ? (n(), i("p", cl, "新地图保存成功后替换原图；失败时保留原图。")) : b("", !0),
            t("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: a.busy || !!a.disabledReason,
              onClick: o[3] || (o[3] = (l) => s.$emit("rebuild"))
            }, v(a.busy ? a.status || "请稍候…" : a.hasMap ? "重新绘制" : "绘制世界地图"), 9, dl)
          ]),
          a.disabledReason ? (n(), i("p", vl, v(a.disabledReason), 1)) : b("", !0),
          t("button", {
            type: "button",
            class: "map-sync-button",
            disabled: a.busy || a.refreshDisabled,
            onClick: o[4] || (o[4] = (l) => s.$emit("refresh"))
          }, [w(_, { name: "refresh" }), o[12] || (o[12] = E("重新加载地图", -1))], 8, pl),
          o[13] || (o[13] = t("p", { class: "map-setting-note" }, "只加载已保存的地图，不会重新绘制。绘制或更新时可以离开此页面。", -1))
        ])
      ]),
      _: 1
    }));
  }
}), yl = ml;
function fl(a, s) {
  const o = s === null ? void 0 : a.locations.find((u) => u.key === s && te(u)), l = Mt(a), c = (s === null ? a.locations.filter(te) : o ? a.locations.filter((u) => gt(u) && ke(a, u.key)?.key === o.key) : []).map((u) => l.has(u.key) ? {
    ...u,
    status: "visited"
  } : u), g = s === null ? c.filter((u) => !fe(a, u.key).slice(0, -1).some(te)) : [], m = new Set(g.map((u) => u.parent || ""));
  return {
    kind: s === null ? "world" : "region",
    region: o,
    locations: c,
    unvisited: c.filter((u) => u.status !== "visited").length,
    positionParent: o ? o.key : m.size === 1 ? [...m][0] : null
  };
}
function hl(a, s, o) {
  const l = s.trim().toLocaleLowerCase();
  return a.locations.filter((c) => [c.name, c.brief].some((g) => g?.toLocaleLowerCase().includes(l)) && (o === "all" || (o === "visited" ? c.status === "visited" : c.status !== "visited")));
}
var bl = { class: "map-search-input" }, kl = ["aria-label", "placeholder"], gl = { class: "map-search-scope" }, Ml = ["aria-label"], $l = ["aria-pressed", "onClick"], wl = { class: "map-search-results" }, xl = ["onClick"], _l = { class: "map-result-icon" }, Cl = { key: 0 }, Sl = {
  key: 0,
  class: "map-search-empty"
}, Bl = /* @__PURE__ */ U({
  __name: "MapSearch",
  props: {
    scope: {},
    title: {},
    initialFilter: {}
  },
  emits: ["close", "select"],
  setup(a) {
    const s = a, o = V(""), l = V(s.initialFilter), c = M(() => Ke[s.scope.kind]), g = M(() => [
      {
        id: "all",
        name: c.value.all
      },
      {
        id: "unvisited",
        name: ye.unvisited
      },
      {
        id: "visited",
        name: ye.visited
      }
    ]), m = M(() => hl(s.scope, o.value, l.value));
    return (u, p) => (n(), W(Ie, {
      class: "map-dialog map-search-dialog",
      "aria-label": c.value.search,
      onClose: p[2] || (p[2] = (f) => u.$emit("close"))
    }, {
      default: $e(() => [
        t("header", bl, [
          w(_, { name: "search" }),
          Be(t("input", {
            "onUpdate:modelValue": p[0] || (p[0] = (f) => o.value = f),
            type: "search",
            "aria-label": c.value.search,
            placeholder: c.value.search,
            autofocus: ""
          }, null, 8, kl), [[Ne, o.value]]),
          t("button", {
            type: "button",
            onClick: p[1] || (p[1] = (f) => u.$emit("close"))
          }, v(r(L).cancel), 1)
        ]),
        t("h2", gl, v(a.title), 1),
        t("nav", {
          class: "map-search-filters",
          "aria-label": r(L).filters
        }, [(n(!0), i(S, null, D(g.value, (f) => (n(), i("button", {
          key: f.id,
          type: "button",
          "aria-pressed": l.value === f.id,
          onClick: (e) => l.value = f.id
        }, v(f.name), 9, $l))), 128))], 8, Ml),
        t("div", wl, [
          t("small", null, v(r(Ge)(a.scope.kind, m.value.length)), 1),
          (n(!0), i(S, null, D(m.value, (f) => (n(), i("button", {
            key: f.key,
            type: "button",
            class: "map-search-result",
            onClick: (e) => u.$emit("select", f.key)
          }, [
            t("span", _l, [w(_, { name: a.scope.kind === "world" ? "globe" : "pin" }, null, 8, ["name"])]),
            t("span", null, [
              t("strong", null, v(f.name), 1),
              t("small", null, v(r(Te)[f.scale]) + " · " + v(r(ye)[f.status === "visited" ? "visited" : "unvisited"]), 1),
              f.brief ? (n(), i("p", Cl, v(f.brief), 1)) : b("", !0)
            ]),
            w(_, { name: "next" })
          ], 8, xl))), 128)),
          m.value.length ? b("", !0) : (n(), i("div", Sl, [
            w(_, { name: "search" }),
            t("h3", null, v(c.value.notFound), 1),
            t("p", null, v(r(L).searchHint), 1)
          ]))
        ])
      ]),
      _: 1
    }, 8, ["aria-label"]));
  }
}), jl = Bl, Hl = {
  class: "map-place-detail",
  "aria-labelledby": "map-place-title"
}, Pl = { id: "map-place-title" }, Al = { class: "map-place-content" }, Vl = {
  key: 0,
  class: "map-place-full-name"
}, ql = {
  key: 1,
  class: "map-address"
}, Ll = { class: "map-place-intro" }, Rl = { class: "map-place-actions" }, Il = {
  key: 2,
  class: "map-detail-section"
}, Kl = { class: "map-people" }, El = {
  key: 3,
  class: "map-detail-section"
}, Tl = ["onClick"], Ol = /* @__PURE__ */ U({
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
  setup(a) {
    const s = a, o = M(() => fe(s.map.atlas, s.location.key).slice(0, -1)), l = M(() => te(s.location)), c = M(() => s.map.atlas.actors.filter((m) => m.locationKey === s.location.key)), g = M(() => $t(s.map.atlas, s.location.key));
    return (m, u) => (n(), i("section", Hl, [
      u[6] || (u[6] = t("div", {
        class: "map-sheet-grip",
        "aria-hidden": "true"
      }, null, -1)),
      t("header", null, [t("div", null, [t("small", null, v(r(Te)[a.location.scale]) + " · " + v(a.currentKey === a.location.key ? "当前位置" : r(ye)[a.location.status === "visited" ? "visited" : "unvisited"]), 1), t("h2", Pl, v(a.location.name), 1)]), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "关闭地点详情",
        onClick: u[0] || (u[0] = (p) => m.$emit("close"))
      }, [w(_, { name: "close" })])]),
      t("div", Al, [
        a.location.name.length > 24 ? (n(), i("p", Vl, v(a.location.name), 1)) : b("", !0),
        o.value.length ? (n(), i("p", ql, [w(_, { name: "pin" }), E(v(o.value.map((p) => p.name).join(" · ")), 1)])) : b("", !0),
        t("p", Ll, v(a.location.brief || "这个地点已记录在世界地图上，更多介绍等待故事展开。"), 1),
        t("div", Rl, [l.value ? (n(), i("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          onClick: u[1] || (u[1] = (p) => m.$emit("explore"))
        }, [w(_, { name: "compass" }), E(v(r(L).regionMap), 1)])) : (n(), i("button", {
          key: 1,
          type: "button",
          class: "map-secondary-button",
          onClick: u[2] || (u[2] = (p) => m.$emit("scene"))
        }, [w(_, { name: "layers" }), E(v(r(L).sceneMap), 1)]))]),
        c.value.length ? (n(), i("section", Il, [u[3] || (u[3] = t("h3", null, "记录在这里的人物", -1)), t("p", Kl, [(n(!0), i(S, null, D(c.value, (p) => (n(), i("span", { key: p.actorKey }, [w(_, { name: "person" }), E(v(p.displayName), 1)]))), 128))])])) : b("", !0),
        g.value.length ? (n(), i("section", El, [u[4] || (u[4] = t("h3", null, "相连的地方", -1)), (n(!0), i(S, null, D(g.value, (p) => (n(), i("button", {
          key: p.link.id,
          type: "button",
          class: "map-connection",
          onClick: (f) => m.$emit("select", p.location.key)
        }, [
          w(_, { name: "route" }),
          t("span", null, [t("strong", null, v(p.location.name), 1), t("small", null, v(p.link.label || r(rt)[p.link.kind]) + v(p.link.bidirectional ? "" : p.outgoing ? " · 单向前往" : " · 仅可从对面到达"), 1)]),
          w(_, { name: "next" })
        ], 8, Tl))), 128))])) : b("", !0),
        u[5] || (u[5] = t("p", { class: "map-detail-footnote" }, "查看地图不会改变你在故事中的位置", -1))
      ])
    ]));
  }
}), Ql = Ol;
function ue(a) {
  return !!a && typeof a == "object" && !Array.isArray(a);
}
function Le(a) {
  return a.maintenanceStatus === "maintaining" || a.maintenanceStatus === "rebuilding";
}
function zl(a) {
  const s = V(structuredClone(We(a.initialState))), o = V(null), l = V(""), c = V(!1);
  let g = !1, m = 0, u = 0, p = () => {
  };
  const f = M(() => s.value.status === "unconfirmed" || s.value.writeState === "unconfirmed"), e = M(() => o.value !== null || ["loading", "saving"].includes(s.value.status) || ["maintaining", "rebuilding"].includes(s.value.maintenanceStatus || "")), h = M(() => e.value ? "正在更新地图，请稍候" : f.value ? "请先检查上一次是否保存成功" : s.value.status === "conflict" ? "存档有变化，请先选择要保留的版本" : s.value.status !== "ready" ? s.value.message || "地图暂时不可更新" : s.value.chatIdentity ? "" : "请先打开一个聊天"), A = M(() => s.value.maintenanceStatus === "rebuilding" || o.value === "rebuild" ? "正在绘制世界…" : s.value.maintenanceStatus === "maintaining" || o.value === "maintain" ? "正在更新地图…" : o.value === "confirm" ? "正在检查保存…" : e.value ? "请稍候…" : ""), K = M(() => s.value.message || l.value), R = M(() => s.value.message ? [
    "blocked",
    "error",
    "conflict",
    "unconfirmed"
  ].includes(s.value.status) : c.value);
  function X($) {
    const H = Le(s.value);
    s.value = structuredClone($), Le($) ? (l.value = "", c.value = !1) : H && (l.value = $.maintenanceMessage || "", c.value = $.maintenanceStatus === "error");
  }
  function I($, H) {
    const Y = $ instanceof Error ? $.message : String($);
    return Y.includes("聊天已切换") ? "聊天已切换，请重新打开地图。" : Y === "host_request_timeout" ? "暂时没收到结果，地图可能还在更新。请稍后查看，不要再次更新。" : H === "confirm" ? "仍无法确认保存结果，请稍后再试。" : H === "adopt" ? "已保存版本暂时加载不了，当前修改还在，请稍后重试。" : H === "settings" ? "设置未能保存，请重试。" : "地图操作未完成，请稍后重试。";
  }
  async function T($, H, Y = {}) {
    if (o.value) return;
    const F = ++m, G = u, q = s.value.chatIdentity;
    o.value = H, l.value = "", c.value = !1;
    try {
      const O = await a.bridge.request($, {
        chatIdentity: q,
        ...Y
      }, 35e3);
      if (!g || F !== m || s.value.chatIdentity !== q) return;
      const Q = ue(O) ? O.result : void 0, y = ue(Q) && ue(Q.state) ? Q.state : Q;
      G === u && ue(y) && y.chatIdentity === q && X(y), (H === "maintain" || H === "rebuild") && ue(Q) && typeof Q.message == "string" && Q.message && (l.value = Q.message), H === "refresh" && s.value.status === "ready" && (l.value = "已加载保存的地图。"), H === "settings" && (l.value = s.value.autoMaintenance ? "自动更新已开启。" : "自动更新已关闭。"), H === "confirm" && s.value.status === "ready" && (l.value = "已确认保存成功。"), H === "adopt" && ue(Q) && Q.adoption === "adopted" && (l.value = "已使用当前聊天里保存的 OS 存档。");
    } catch (O) {
      g && F === m && s.value.chatIdentity === q && (l.value = I(O, H), c.value = !0);
    } finally {
      g && F === m && (o.value = null);
    }
  }
  return Me(() => {
    g = !0, p = a.bridge.subscribe(($) => {
      if ($.type === "map/state") {
        const H = $.payload.state;
        if (H.chatIdentity !== s.value.chatIdentity) return;
        u += 1, X(H);
      } else $.type === "map/error" && (u += 1, c.value = !0, l.value = $.payload.message || "地图暂时无法读取，请重新打开。");
    });
  }), je(() => {
    g = !1, m += 1, p();
  }), {
    state: s,
    activeRequest: o,
    busy: e,
    disabledReason: h,
    requiresConfirmation: f,
    status: A,
    notice: K,
    isError: R,
    dismissNotice: () => {
      l.value = "", c.value = !1;
    },
    refresh: () => {
      if (!e.value && !f.value) return T("map/refresh", "refresh");
    },
    confirmSave: () => {
      if (!e.value) return T("map/confirm-save", "confirm");
    },
    adopt: () => {
      if (!e.value) return T("map/adopt-server-state", "adopt");
    },
    setAuto: ($) => T("map/set-auto-maintenance", "settings", { enabled: $ }),
    update: () => {
      if (!h.value && s.value.map) return T("map/maintain-once", "maintain");
    },
    rebuild: () => {
      if (!h.value) return T("map/rebuild", "rebuild");
    }
  };
}
var Dl = { class: "map-top" }, Zl = { class: "map-search-bar" }, Ul = ["disabled"], Fl = {
  key: 1,
  class: "map-search-entry"
}, Wl = {
  key: 0,
  class: "map-view-row"
}, Nl = ["aria-label"], Yl = ["aria-pressed"], Xl = ["aria-pressed"], Gl = ["aria-pressed"], Jl = {
  key: 0,
  class: "map-scene-tools"
}, en = ["aria-expanded"], tn = ["aria-label"], an = ["aria-current"], ln = { "aria-current": "page" }, nn = {
  key: 2,
  class: "map-progress",
  role: "status"
}, sn = {
  key: 3,
  class: "map-notice",
  role: "status"
}, on = ["disabled"], rn = ["disabled"], un = ["disabled"], cn = {
  key: 1,
  class: "map-empty"
}, dn = ["disabled"], vn = {
  key: 0,
  class: "map-setting-note"
}, pn = {
  key: 2,
  class: "map-empty"
}, mn = ["disabled"], yn = {
  key: 1,
  class: "map-empty map-first-map"
}, fn = { class: "map-empty-art" }, hn = ["disabled"], bn = {
  key: 1,
  class: "map-setting-note"
}, kn = ["disabled"], gn = ["aria-expanded"], Mn = {
  key: 1,
  class: "map-key"
}, $n = ["aria-label"], wn = { class: "map-region-icon" }, xn = {
  id: "map-browse-summary",
  class: "map-region-summary"
}, _n = {
  class: "map-round-button",
  "aria-hidden": "true"
}, Cn = {
  key: 4,
  class: "map-scene-caption"
}, Sn = /* @__PURE__ */ U({
  __name: "MapApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const { state: s, activeRequest: o, busy: l, disabledReason: c, requiresConfirmation: g, status: m, notice: u, isError: p, dismissNotice: f, refresh: e, confirmSave: h, adopt: A, setAuto: K, update: R, rebuild: X } = zl(a), I = V(""), T = () => el(s.value.map) === "scene" ? {
      kind: "scene",
      key: ""
    } : { kind: "world" }, $ = V(T()), H = V("3d"), Y = V(!1), F = V("");
    let G = !1;
    const q = M(() => $.value.kind === "scene"), O = M(() => $.value.kind === "scene" ? $.value.key : ""), Q = V(""), y = V(0), C = V(!1), B = V(null), P = V(!1), j = M(() => s.value.map?.atlas), Z = M(() => j.value?.actors.find((x) => x.actorKey === "player")?.locationKey || ""), se = M(() => j.value?.locations.find((x) => x.key === Z.value)), oe = M(() => j.value?.locations.find((x) => x.key === (O.value || Z.value))), He = M(() => q.value && oe.value?.sceneKey ? s.value.map?.scenes[oe.value.sceneKey] : void 0), J = M(() => {
      if (!j.value || $.value.kind === "world") return;
      const x = $.value.key || Z.value;
      return ke(j.value, x);
    }), z = M(() => fl(j.value || {
      locations: [],
      links: [],
      actors: []
    }, $.value.kind === "world" ? null : J.value?.key || "")), ae = M(() => z.value.locations.find((x) => x.key === I.value)), ce = M(() => z.value.kind === "world" ? ee.world : J.value?.name || L.unknownRegion), we = M(() => Ke[z.value.kind]), Pe = M(() => z.value.unvisited ? "unvisited" : "all");
    ne(() => s.value, (x, d) => {
      const k = x.chatIdentity !== d.chatIdentity;
      (k || !x.map?.atlas.locations.some((_e) => _e.key === I.value)) && (I.value = ""), k && (G = !1);
      const le = $.value.kind === "world" ? "" : $.value.key, Ue = le && !x.map?.atlas.locations.some((_e) => _e.key === le);
      (k || !d.map?.atlas.locations.length && x.map?.atlas.locations.length && !G || Ue) && ($.value = T()), k && (C.value = !1, B.value = null, P.value = !1);
    }), ne(z, (x, d) => {
      x.locations.some((k) => k.key === I.value) || (I.value = ""), (x.kind !== d.kind || x.region?.key !== d.region?.key || !j.value) && (I.value = "", B.value = null, P.value = !1);
    });
    function xe(x) {
      G = !0, $.value = x, I.value = "", B.value = null, P.value = !1;
    }
    function ie(x = "") {
      xe({
        kind: "region",
        key: x
      });
    }
    async function de(x, d = !1) {
      const k = j.value?.locations.find((le) => le.key === x);
      if (k) {
        if (G = !0, d && j.value) {
          if (te(k)) re();
          else {
            const le = ke(j.value, x);
            if (!le) {
              ve(x);
              return;
            }
            ie(le.key);
          }
          await Ce();
        }
        I.value = x, B.value = null, P.value = !1, await Ce(), Q.value = j.value ? ge(j.value, x, z.value.locations) : x, y.value += 1;
      }
    }
    async function De() {
      if (!(!se.value || !j.value)) {
        if (te(se.value)) {
          await de(se.value.key, !0);
          return;
        }
        if (!ke(j.value, se.value.key)) {
          ve();
          return;
        }
        ie(), await Ce(), await de(se.value.key);
      }
    }
    function ve(x = "") {
      xe({
        kind: "scene",
        key: x === Z.value ? "" : x
      });
    }
    function re() {
      xe({ kind: "world" });
    }
    function Ze(x) {
      Y.value || (Y.value = !0, H.value = "2d", F.value = x);
    }
    return Xe(() => P.value ? (P.value = !1, !0) : q.value ? (ie(O.value && J.value?.key || ""), !0) : I.value ? (I.value = "", !0) : $.value.kind === "region" ? (re(), !0) : !1), (x, d) => (n(), i("main", { class: N(["map-app", {
      "has-view-switch": j.value?.locations.length,
      "is-scene-view": q.value
    }]) }, [
      t("div", Dl, [
        t("header", Zl, [
          w(_, { name: q.value ? "layers" : "search" }, null, 8, ["name"]),
          q.value ? (n(), i("div", Fl, [E(v(oe.value?.name || r(ee).scene), 1), t("small", null, v(O.value ? r(L).sceneBrowsing : r(L).sceneCurrent), 1)])) : (n(), i("button", {
            key: 0,
            type: "button",
            class: "map-search-entry",
            disabled: !j.value?.locations.length,
            onClick: d[0] || (d[0] = (k) => B.value = "all")
          }, [E(v(we.value.search), 1), t("small", null, v(ce.value), 1)], 8, Ul)),
          t("button", {
            type: "button",
            class: "map-round-button",
            "aria-label": "地图设置",
            onClick: d[1] || (d[1] = (k) => C.value = !0)
          }, [w(_, { name: "more" })])
        ]),
        j.value?.locations.length ? (n(), i("div", Wl, [t("nav", {
          class: "map-view-switch",
          "aria-label": r(L).viewLabel
        }, [
          t("button", {
            type: "button",
            "aria-pressed": $.value.kind === "world",
            onClick: re
          }, [w(_, { name: "globe" }), E(v(r(ee).world), 1)], 8, Yl),
          t("button", {
            type: "button",
            "aria-pressed": $.value.kind === "region",
            onClick: d[2] || (d[2] = (k) => ie())
          }, [w(_, { name: "compass" }), E(v(r(ee).region), 1)], 8, Xl),
          t("button", {
            type: "button",
            "aria-pressed": q.value,
            onClick: d[3] || (d[3] = (k) => ve())
          }, [w(_, { name: "layers" }), E(v(r(ee).scene), 1)], 8, Gl)
        ], 8, Nl), q.value ? (n(), i("div", Jl, [O.value ? (n(), i("button", {
          key: 0,
          type: "button",
          class: "map-round-button",
          "aria-label": "回到当前场景",
          onClick: d[4] || (d[4] = (k) => ve())
        }, [w(_, { name: "locate" })])) : b("", !0), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-expanded": P.value,
          "aria-label": "地图图例",
          onClick: d[5] || (d[5] = (k) => P.value = !P.value)
        }, [w(_, { name: "layers" })], 8, en)])) : b("", !0)])) : b("", !0),
        j.value?.locations.length && !q.value ? (n(), i("nav", {
          key: 1,
          class: "map-region-trail",
          "aria-label": r(L).trailLabel
        }, [t("button", {
          type: "button",
          "aria-current": $.value.kind === "world" ? "page" : void 0,
          onClick: re
        }, [w(_, { name: "globe" }), E(v(r(ee).world), 1)], 8, an), $.value.kind === "region" ? (n(), i(S, { key: 0 }, [w(_, { name: "next" }), t("span", ln, v(ce.value), 1)], 64)) : b("", !0)], 8, tn)) : b("", !0),
        r(m) ? (n(), i("div", nn, [d[26] || (d[26] = t("span", null, null, -1)), E(v(r(m)), 1)])) : b("", !0),
        F.value ? (n(), i("aside", sn, [t("p", null, v(F.value), 1), t("button", {
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭三维提示",
          onClick: d[6] || (d[6] = (k) => F.value = "")
        }, [w(_, { name: "close" })])])) : b("", !0),
        r(u) || r(g) || r(s).status === "conflict" ? (n(), i("aside", {
          key: 4,
          class: N(["map-notice", { "is-error": r(p) }]),
          role: "status"
        }, [t("p", null, v(r(u) || (r(g) ? "还不确定是否保存成功，请先检查保存。" : "服务器上的存档与当前内容不同。")), 1), r(g) ? (n(), i("button", {
          key: 0,
          type: "button",
          disabled: r(l),
          onClick: d[7] || (d[7] = (...k) => r(h) && r(h)(...k))
        }, "检查保存", 8, on)) : r(s).status === "conflict" ? (n(), i(S, { key: 1 }, [d[27] || (d[27] = t("small", null, "恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。", -1)), t("button", {
          type: "button",
          disabled: r(l),
          onClick: d[8] || (d[8] = (...k) => r(A) && r(A)(...k))
        }, "放弃未保存更改并恢复", 8, rn)], 64)) : r(s).status === "error" || r(s).status === "blocked" ? (n(), i("button", {
          key: 2,
          type: "button",
          disabled: r(l),
          onClick: d[9] || (d[9] = (...k) => r(e) && r(e)(...k))
        }, "重新加载", 8, un)) : (n(), i("button", {
          key: 3,
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭地图提示",
          onClick: d[10] || (d[10] = (...k) => r(f) && r(f)(...k))
        }, [w(_, { name: "close" })]))], 2)) : b("", !0)
      ]),
      t("div", { class: N(["map-canvas", { "has-detail": ae.value && !q.value }]) }, [r(s).map && j.value?.locations.length ? (n(), i(S, { key: 0 }, [
        z.value.locations.length ? Be((n(), W(Rt, {
          key: 0,
          atlas: r(s).map.atlas,
          scope: z.value,
          label: ce.value,
          "current-location-key": Z.value,
          "selected-location-key": I.value,
          "focus-key": Q.value,
          "focus-sequence": y.value,
          onSelect: d[11] || (d[11] = (k) => de(k))
        }, null, 8, [
          "atlas",
          "scope",
          "label",
          "current-location-key",
          "selected-location-key",
          "focus-key",
          "focus-sequence"
        ])), [[Re, !q.value]]) : b("", !0),
        q.value ? (n(), i(S, { key: 1 }, [He.value?.status === "active" ? (n(), W(Ja, {
          key: 0,
          mode: H.value,
          "onUpdate:mode": d[12] || (d[12] = (k) => H.value = k),
          scene: He.value,
          "three-unavailable": Y.value,
          onFallback: Ze
        }, null, 8, [
          "mode",
          "scene",
          "three-unavailable"
        ])) : (n(), i("div", cn, [
          w(_, { name: "layers" }),
          t("h2", null, v(oe.value ? r(L).sceneEmpty : r(L).unknownLocation), 1),
          O.value && O.value !== Z.value ? (n(), i("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: d[13] || (d[13] = (k) => J.value ? ie(J.value.key) : re())
          }, v(J.value ? r(L).regionMap : r(ee).world), 1)) : (n(), i(S, { key: 1 }, [
            t("p", null, v(oe.value ? r(L).sceneUpdateHint : r(L).locationUpdateHint), 1),
            t("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: !!r(c),
              onClick: d[14] || (d[14] = (...k) => r(R) && r(R)(...k))
            }, v(r(l) ? r(L).updating : r(L).update), 9, dn),
            r(c) && !r(l) ? (n(), i("p", vn, v(r(c)), 1)) : b("", !0)
          ], 64))
        ]))], 64)) : b("", !0),
        !q.value && !z.value.locations.length ? (n(), i("div", pn, [
          w(_, { name: "pin" }),
          t("h2", null, v($.value.kind === "region" && !J.value ? r(L).unknownRegion : we.value.empty), 1),
          t("p", null, v($.value.kind === "region" && !J.value ? r(L).unknownRegionHint : we.value.emptyHint), 1),
          $.value.kind === "region" ? (n(), i("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: re
          }, v(r(ee).world), 1)) : (n(), i("button", {
            key: 1,
            type: "button",
            class: "map-secondary-button",
            disabled: !!r(c),
            onClick: d[15] || (d[15] = (...k) => r(R) && r(R)(...k))
          }, v(r(l) ? r(L).updating : r(L).update), 9, mn))
        ])) : b("", !0)
      ], 64)) : (n(), i("div", yn, [
        t("span", fn, [w(_, { name: "globe" })]),
        d[28] || (d[28] = t("small", null, "故事之外，还有一整个世界", -1)),
        t("h1", null, v(r(s).status === "loading" ? "正在打开地图…" : "下一站，去哪里？"), 1),
        d[29] || (d[29] = t("p", null, [
          E("把世界设定画成地图，"),
          t("br"),
          E("也为留白的地方添上值得探索的去处。")
        ], -1)),
        r(s).status !== "loading" ? (n(), i("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          disabled: !!r(c),
          onClick: d[16] || (d[16] = (...k) => r(X) && r(X)(...k))
        }, v(r(l) ? r(m) || "正在准备…" : "绘制世界地图"), 9, hn)) : b("", !0),
        r(c) && !r(l) ? (n(), i("p", bn, v(r(c)), 1)) : b("", !0)
      ]))], 2),
      j.value?.locations.length && !q.value ? (n(), i("div", {
        key: 0,
        class: N(["map-floating-tools", { "has-detail": ae.value }])
      }, [t("button", {
        type: "button",
        class: "map-round-button",
        disabled: !se.value,
        "aria-label": "回到我的位置",
        onClick: De
      }, [w(_, { name: "locate" })], 8, kn), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-expanded": P.value,
        "aria-label": "地图图例",
        onClick: d[17] || (d[17] = (k) => P.value = !P.value)
      }, [w(_, { name: "layers" })], 8, gn)], 2)) : b("", !0),
      P.value ? (n(), i("aside", Mn, [
        d[30] || (d[30] = t("strong", null, "读懂这张地图", -1)),
        d[31] || (d[31] = t("p", null, [
          t("i", { class: "map-key-current" }),
          E("你在这里 "),
          t("i", { class: "map-key-place" }),
          E("可探索地点")
        ], -1)),
        d[32] || (d[32] = t("p", null, "路线连接已记录的地点；箭头表示单向通行。", -1)),
        t("small", null, v(r(L).legend), 1)
      ])) : b("", !0),
      ae.value && r(s).map && !q.value ? (n(), W(Ql, {
        key: ae.value.key,
        location: ae.value,
        map: r(s).map,
        "current-key": Z.value,
        onClose: d[18] || (d[18] = (k) => I.value = ""),
        onScene: d[19] || (d[19] = (k) => ve(ae.value.key)),
        onExplore: d[20] || (d[20] = (k) => ie(ae.value.key)),
        onSelect: d[21] || (d[21] = (k) => de(k, !0))
      }, null, 8, [
        "location",
        "map",
        "current-key"
      ])) : j.value?.locations.length && !q.value ? (n(), i("button", {
        key: 3,
        type: "button",
        class: "map-region-card",
        "aria-label": r(Je)(z.value.kind, Pe.value),
        "aria-describedby": "map-browse-summary",
        onClick: d[22] || (d[22] = (k) => B.value = Pe.value)
      }, [
        t("span", wn, [w(_, { name: z.value.kind === "world" ? "globe" : "compass" }, null, 8, ["name"])]),
        t("span", xn, [t("strong", null, v(ce.value), 1), t("small", null, v(r(et)(z.value.kind, z.value.locations.length, z.value.unvisited)), 1)]),
        t("span", _n, [w(_, { name: "next" })])
      ], 8, $n)) : q.value && j.value?.locations.length ? (n(), i("footer", Cn, [w(_, { name: "layers" }), t("span", null, [t("strong", null, v(oe.value?.name || "当前位置待确认"), 1), t("small", null, v(O.value ? "正在查看场景图 · 不会移动人物" : "当前位置的场景图"), 1)])])) : b("", !0),
      B.value && j.value ? (n(), W(jl, {
        key: 5,
        scope: z.value,
        title: ce.value,
        "initial-filter": B.value,
        onClose: d[23] || (d[23] = (k) => B.value = null),
        onSelect: d[24] || (d[24] = (k) => de(k))
      }, null, 8, [
        "scope",
        "title",
        "initial-filter"
      ])) : b("", !0),
      C.value ? (n(), W(yl, {
        key: 6,
        "auto-maintenance": r(s).autoMaintenance,
        busy: r(l),
        "refresh-disabled": r(g),
        "auto-toggle-busy": r(o) !== null,
        "disabled-reason": r(c),
        "has-map": !!r(s).map,
        status: r(m),
        "maintenance-message": r(s).maintenanceMessage || "",
        "maintenance-error": r(s).maintenanceStatus === "error",
        notice: r(u),
        "notice-error": r(p),
        onClose: d[25] || (d[25] = (k) => C.value = !1),
        onSetAuto: r(K),
        onUpdate: r(R),
        onRebuild: r(X),
        onRefresh: r(e)
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
      ])) : b("", !0)
    ], 2));
  }
}), An = Sn;
export {
  An as default
};
