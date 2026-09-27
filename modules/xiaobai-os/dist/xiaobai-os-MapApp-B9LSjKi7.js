/* eslint-disable */
import { $ as te, B as He, E as Ne, F as l, G as Ue, H as ae, L as W, M as he, O as Ae, Q as i, R as Qe, W as je, Y as B, Z as Ie, _ as r, b as S, c as Ge, et as Re, g as M, h as G, l as Le, m as t, o as gt, p as C, s as at, tt as y, u as I, v as Mt, x as X, y as Z } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as wt } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as nt } from "./xiaobai-os-AppDialog-CaAiivYL.js";
import { t as $t } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { A as _t, C as xt, D as Ct, E as lt, F as St, I as jt, L as At, M as Pe, N as le, O as st, P as _e, S as Et, T as Pt, a as Bt, b as It, c as Rt, d as Lt, f as ot, g as Ht, h as Tt, i as it, j as xe, k as V, l as Ot, n as Vt, o as Kt, p as Xe, r as rt, s as qt, u as Je, v as $e, w as Nt, x as zt, y as Dt } from "./xiaobai-os-map-presentation-CZH95z-i.js";
import { c as ut, d as Zt, f as Be, g as Ft, h as Ut, i as Yt, m as Wt, o as Qt, p as ct, r as Gt, s as ze, t as Ze, u as dt } from "./xiaobai-os-materials-BLRbkJ4k.js";
function De(e, s, a, o, u) {
  const [d, b, c, v] = a, p = Math.max(80, s[0] - v - b), n = Math.max(80, s[1] - d - c), k = Math.max(e[2] / p, e[3] / n), h = o ? k : Math.min(e[2] / s[0], e[3] / s[1]) * 0.78, R = !o && u ? u : [e[0] + e[2] / 2, e[1] + e[3] / 2], q = R[0] - (v + p / 2) * h, N = R[1] - (d + n / 2) * h, F = s[0] * h, m = s[1] * h;
  return [
    o ? q : Math.max(e[0], Math.min(e[0] + e[2] - F, q)),
    o ? N : Math.max(e[1], Math.min(e[1] + e[3] - m, N)),
    F,
    m
  ];
}
function Xt(e, s, a, o) {
  const [u, d, b, c] = o, v = Math.min(s[2] / a[0], 620 / Math.max(80, a[0] - c - d));
  return [
    e[0] - (c + (a[0] - c - d) / 2) * v,
    e[1] - (u + (a[1] - u - b) / 2) * v,
    a[0] * v,
    a[1] * v
  ];
}
var Jt = ["aria-label"], ea = ["aria-label"], ta = ["aria-label"], aa = /* @__PURE__ */ X({
  __name: "MapZoomControls",
  emits: ["zoom", "reset"],
  setup(e) {
    return (s, a) => (l(), r("div", {
      class: "map-viewport-controls",
      "aria-label": i(Pe).label
    }, [
      t("button", {
        type: "button",
        "aria-label": i(Pe).zoomIn,
        onClick: a[0] || (a[0] = (o) => s.$emit("zoom", 0.8))
      }, "+", 8, ea),
      t("button", {
        type: "button",
        "aria-label": i(Pe).zoomOut,
        onClick: a[1] || (a[1] = (o) => s.$emit("zoom", 1.25))
      }, "−", 8, ta),
      t("button", {
        type: "button",
        class: "map-fit",
        onClick: a[2] || (a[2] = (o) => s.$emit("reset"))
      }, y(i(Pe).fit), 1)
    ], 8, Jt));
  }
}), vt = aa, na = { class: "map-viewport" }, la = ["viewBox", "aria-label"], sa = /* @__PURE__ */ X({
  __name: "MapViewport",
  props: {
    viewBox: {},
    resetKey: { default: "" },
    label: {},
    focusPoint: { default: void 0 },
    focusSequence: { default: 0 },
    atlasInsets: { default: void 0 },
    initialPoint: { default: void 0 },
    initialOverview: {
      type: Boolean,
      default: !1
    },
    controls: {
      type: Boolean,
      default: !0
    }
  },
  setup(e, { expose: s }) {
    const a = e, o = B(null), u = B([...a.viewBox]), d = B([0, 0]), b = C(() => d.value[0] && d.value[1] ? Math.max(u.value[2] / d.value[0], u.value[3] / d.value[1]) : 1);
    let c, v = !1;
    he(() => {
      c = new ResizeObserver(($) => {
        const x = $[0].contentRect;
        if (!x.width || !x.height) return;
        const H = d.value;
        if (d.value = [x.width, x.height], a.atlasInsets) {
          if (!v) w();
          else if (H[0] && H[1]) {
            const z = u.value[2] / H[0];
            u.value = [
              u.value[0] + (H[0] - x.width) * z / 2,
              u.value[1] + (H[1] - x.height) * z / 2,
              x.width * z,
              x.height * z
            ];
          }
        }
      }), o.value && c.observe(o.value);
    });
    const p = /* @__PURE__ */ new Map();
    let n = null, k = [0, 0], h = 0, R = null, q = !1, N = !1, F = null;
    const m = C(() => u.value.join(" "));
    function g() {
      u.value = a.atlasInsets && d.value[0] ? De([...a.viewBox], d.value, a.atlasInsets, !0) : [...a.viewBox];
    }
    function w() {
      v = !!d.value[0], u.value = a.atlasInsets && v ? De([...a.viewBox], d.value, a.atlasInsets, a.initialOverview, a.initialPoint) : [...a.viewBox];
    }
    function A() {
      return b.value;
    }
    function L($, x) {
      const H = o.value?.getBoundingClientRect();
      if (!H) return [u.value[0], u.value[1]];
      const z = A();
      return [u.value[0] + u.value[2] / 2 + ($ - H.left - H.width / 2) * z, u.value[1] + u.value[3] / 2 + (x - H.top - H.height / 2) * z];
    }
    function T($, x) {
      const H = Math.max(1, a.atlasInsets && d.value[0] ? De([...a.viewBox], d.value, a.atlasInsets, !0)[2] : a.viewBox[2]), z = Math.min(H * 0.24, 240, u.value[2]), Ee = Math.max(H * 3, u.value[2]), se = Math.min(Ee, Math.max(z, u.value[2] * $)), J = se / u.value[2], D = x || [u.value[0] + u.value[2] / 2, u.value[1] + u.value[3] / 2];
      u.value = [
        D[0] - (D[0] - u.value[0]) * J,
        D[1] - (D[1] - u.value[1]) * J,
        se,
        u.value[3] * J
      ];
    }
    function O() {
      if (!a.focusPoint) return;
      if (a.atlasInsets && d.value[0]) {
        u.value = Xt(a.focusPoint, u.value, d.value, a.atlasInsets);
        return;
      }
      const $ = Math.min(u.value[2], 620), x = u.value[3] * $ / u.value[2];
      u.value = [
        a.focusPoint[0] - $ / 2,
        a.focusPoint[1] - x / 2,
        $,
        x
      ];
    }
    function U() {
      const $ = [...p.values()];
      $.length === 1 && (n = $[0], k = [u.value[0], u.value[1]]), $.length === 2 && (h = Math.hypot($[1][0] - $[0][0], $[1][1] - $[0][1]), R = [($[0][0] + $[1][0]) / 2, ($[0][1] + $[1][1]) / 2], q = !0);
    }
    function P($) {
      $.button !== 0 || p.size >= 2 || (p.size || (q = !1), p.set($.pointerId, [$.clientX, $.clientY]), $.target.setPointerCapture($.pointerId), U());
    }
    function Q($) {
      if (!p.has($.pointerId)) return;
      p.set($.pointerId, [$.clientX, $.clientY]);
      const x = [...p.values()];
      if (x.length === 2 && R) {
        const H = Math.hypot(x[1][0] - x[0][0], x[1][1] - x[0][1]), z = [(x[0][0] + x[1][0]) / 2, (x[0][1] + x[1][1]) / 2];
        H > 0 && h > 0 && T(h / H, L(...R)), u.value[0] -= (z[0] - R[0]) * A(), u.value[1] -= (z[1] - R[1]) * A(), h = H, R = z;
      } else if (n) {
        const H = $.clientX - n[0], z = $.clientY - n[1];
        Math.abs(H) + Math.abs(z) > 4 && (q = !0), u.value = [
          k[0] - H * A(),
          k[1] - z * A(),
          u.value[2],
          u.value[3]
        ];
      }
    }
    function ee($) {
      if (!p.delete($.pointerId)) return;
      const x = $.target;
      x.hasPointerCapture($.pointerId) && x.releasePointerCapture($.pointerId), U(), p.size || (n = null, R = null), q && (N = !0, F && clearTimeout(F), F = setTimeout(() => {
        N = !1;
      }, 0));
    }
    function ce($) {
      N && ($.preventDefault(), $.stopPropagation());
    }
    return ae(() => a.resetKey, w, { immediate: !0 }), ae(() => a.focusSequence, O, { flush: "post" }), Ae(() => {
      c?.disconnect(), F && clearTimeout(F);
    }), s({
      zoom: T,
      reset: g
    }), ($, x) => (l(), r("div", na, [
      Qe($.$slots, "background", {
        viewport: u.value,
        size: d.value,
        unitScale: b.value
      }),
      (l(), r("svg", {
        ref_key: "svg",
        ref: o,
        class: "map-viewport-svg",
        viewBox: m.value,
        preserveAspectRatio: "xMidYMid meet",
        role: "group",
        "aria-label": e.label,
        onWheel: x[0] || (x[0] = Le((H) => T(H.deltaY < 0 ? 0.84 : 1.19, L(H.clientX, H.clientY)), ["prevent"])),
        onPointerdown: P,
        onPointermove: Q,
        onPointerup: ee,
        onPointercancel: ee,
        onClickCapture: ce
      }, [Qe($.$slots, "default", {
        unitScale: b.value,
        viewport: u.value
      })], 40, la)),
      e.controls ? (l(), G(vt, {
        key: 0,
        onZoom: T,
        onReset: g
      })) : M("", !0)
    ]));
  }
}), pt = sa, oa = {
  class: "map-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, ia = ["d"], ra = /* @__PURE__ */ X({
  __name: "MapIcon",
  props: { name: { default: "pin" } },
  setup(e) {
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
    return (a, o) => (l(), r("svg", oa, [t("path", { d: s[e.name] || s.pin }, null, 8, ia)]));
  }
}), E = ra;
function Ce(e) {
  return e.shape === "point" ? `M${e.x - 2} ${e.y}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0` : dt(e).map((s, a) => `${a ? "L" : "M"}${s[0]} ${s[1]}`).join(" ") + (ut(e) ? "Z" : "");
}
function ua(e) {
  return "points" in e && !e.closed ? e.width || 1 : 0;
}
var ca = ["viewBox"], da = ["d"], va = ["clip-path"], pa = [
  "d",
  "fill",
  "stroke",
  "stroke-width"
], ma = {
  key: 1,
  class: "map-atlas-graphics-error",
  role: "alert"
}, fa = /* @__PURE__ */ X({
  __name: "AtlasCanvas",
  props: {
    projection: {},
    viewport: {},
    size: {},
    unitScale: {}
  },
  setup(e) {
    const s = e, a = B(null), o = B(!1), u = B(!1), d = `atlas-preview-${He()}`, b = C(() => Yt(s.projection.features).filter((k) => !k.source.support && (["environment", "surface"].includes(k.source.role) || k.source.material === "water")));
    let c, v = !1;
    function p(k) {
      o.value = !0, console.error("[Map Atlas]", k);
    }
    function n() {
      const k = Ie(s.projection), h = (R) => R.map((q) => ({
        ...Ie(q),
        source: Ie(q.source)
      }));
      c?.update({
        projection: {
          ...k,
          features: h(k.features),
          carriers: h(k.carriers)
        },
        viewport: [...s.viewport],
        size: [...s.size],
        unitScale: s.unitScale
      });
    }
    return he(async () => {
      try {
        const { createAtlasRuntime: k } = await import("./xiaobai-os-gpu-runtime-CLTE89h6.js");
        if (v) return;
        c = k(a.value, p, () => {
          u.value = !0;
        }), n();
      } catch (k) {
        v || p(k);
      }
    }), ae(() => [
      s.projection,
      ...s.viewport,
      ...s.size,
      s.unitScale
    ], n), Ae(() => {
      v = !0, c?.dispose();
    }), (k, h) => (l(), r("div", {
      ref_key: "host",
      ref: a,
      class: "map-atlas-canvas"
    }, [!u.value && !o.value ? (l(), r("svg", {
      key: 0,
      class: "map-atlas-preview",
      viewBox: e.viewport.join(" "),
      "aria-hidden": "true"
    }, [t("defs", null, [t("clipPath", { id: d }, [e.projection.clip ? (l(), r("path", {
      key: 0,
      d: i(Ce)(e.projection.clip)
    }, null, 8, da)) : M("", !0)])]), t("g", { "clip-path": e.projection.clip ? `url(#${d})` : void 0 }, [(l(!0), r(I, null, W(b.value, (R) => (l(), r("path", {
      key: R.source.id,
      d: i(Ce)(R.geometry),
      fill: i(ut)(R.geometry) ? i(Ze)[R.source.material].base : "none",
      stroke: i(Ze)[R.source.material].base,
      "stroke-width": i(ua)(R.geometry),
      "stroke-linecap": "round"
    }, null, 8, pa))), 128))], 8, va)], 8, ca)) : M("", !0), o.value ? (l(), r("p", ma, y(i(Ct).failed), 1)) : M("", !0)], 512));
  }
}), ya = /* @__PURE__ */ $t(fa, [["__scopeId", "data-v-0cb1780a"]]);
function ue(e) {
  return e.scale === "region";
}
function Fe(e) {
  return e.scale !== "world" && !ue(e);
}
function Te(e, s) {
  const a = new Map(e.locations.map((d) => [d.key, d])), o = [];
  let u = a.get(s);
  for (; u; )
    o.unshift(u), u = u.parent ? a.get(u.parent) : void 0;
  return o;
}
function Se(e, s) {
  return Te(e, s).reverse().find(ue);
}
function ha(e) {
  const s = /* @__PURE__ */ new Set(), a = e.actors.find((o) => o.actorKey === "player")?.locationKey;
  for (const o of e.locations)
    if (!(o.status !== "visited" && o.key !== a))
      for (const u of Te(e, o.key)) s.add(u.key);
  return s;
}
function mt(e, s, a) {
  const o = new Set(a.map((u) => u.key));
  return Te(e, s).reverse().find((u) => o.has(u.key))?.key || "";
}
function ba(e, s) {
  return e.links.flatMap((a) => {
    if (a.from !== s && a.to !== s) return [];
    const o = e.locations.find((u) => u.key === (a.from === s ? a.to : a.from));
    return o ? [{
      location: o,
      link: a,
      outgoing: a.bidirectional || a.from === s
    }] : [];
  });
}
var ka = { "aria-hidden": "true" }, ga = [
  "d",
  "stroke-width",
  "stroke-dasharray"
], Ma = ["transform"], wa = ["fill"], $a = ["id"], _a = ["d"], xa = ["clip-path"], Ca = [
  "d",
  "stroke-width",
  "marker-start",
  "marker-end"
], Sa = [
  "transform",
  "aria-label",
  "onClick",
  "onKeydown"
], ja = { transform: "translate(-14 -20)" }, Aa = {
  y: "64",
  class: "map-place-name"
}, Ea = {
  key: 0,
  y: "89",
  class: "map-place-status"
}, Pa = {
  key: 1,
  y: "89",
  class: "map-place-status"
}, Ba = /* @__PURE__ */ X({
  __name: "MapAtlas",
  props: {
    active: { type: Boolean },
    atlas: {},
    projection: {},
    label: {},
    currentLocationKey: {},
    selectedLocationKey: {},
    focusKey: {},
    focusSequence: {},
    insets: {}
  },
  emits: ["select"],
  setup(e, { expose: s }) {
    const a = e, o = C(() => mt(a.atlas, a.currentLocationKey, a.projection.scope.locations)), u = C(() => a.projection.nodes.find((p) => p.location.key === a.focusKey)), d = C(() => a.projection.nodes.find((p) => p.location.key === o.value)), b = "map-arrow-" + He(), c = B(null);
    s({
      zoom: (p) => c.value?.zoom(p),
      reset: () => c.value?.reset()
    });
    function v(p, n) {
      return p === "water" ? "water" : p === "forest" ? "tree" : p === "mountain" ? "mountain" : ["world", "region"].includes(n) ? "globe" : n === "outdoor" ? "compass" : "building";
    }
    return (p, n) => (l(), G(pt, {
      ref_key: "camera",
      ref: c,
      class: "map-atlas-viewport",
      controls: !1,
      "view-box": e.projection.viewBox,
      "atlas-insets": e.insets,
      "initial-overview": !e.projection.features.length,
      "initial-point": d.value ? [d.value.x, d.value.y] : void 0,
      "reset-key": `${e.projection.scope.kind}:${e.projection.scope.region?.key || ""}`,
      label: e.label,
      "focus-point": u.value ? [u.value.x, u.value.y] : void 0,
      "focus-sequence": e.focusSequence
    }, {
      background: je(({ viewport: k, size: h, unitScale: R }) => [e.active ? (l(), G(ya, {
        key: 0,
        projection: e.projection,
        viewport: k,
        size: h,
        "unit-scale": R
      }, null, 8, [
        "projection",
        "viewport",
        "size",
        "unit-scale"
      ])) : M("", !0)]),
      default: je(({ unitScale: k }) => [
        t("g", ka, [(l(!0), r(I, null, W(e.projection.regions, (h) => (l(), r("path", {
          key: h.location.key,
          d: i(Ce)(h.geometry),
          fill: "none",
          stroke: "var(--map-road-ink)",
          "stroke-width": k,
          "stroke-dasharray": `${k * 5} ${k * 5}`,
          opacity: ".35"
        }, null, 8, ga))), 128))]),
        (l(!0), r(I, null, W(e.projection.features.filter((h) => h.label && !h.source.destination), (h) => (l(), r("g", {
          key: h.source.id,
          class: "map-atlas-label",
          transform: `translate(${h.bounds[0] + h.bounds[2] / 2} ${h.bounds[1] + h.bounds[3] / 2}) scale(${k})`,
          "aria-hidden": "true"
        }, [t("text", {
          "text-anchor": "middle",
          fill: i(Ze)[h.source.material].ink
        }, y(h.label), 9, wa)], 8, Ma))), 128)),
        t("defs", null, [t("marker", {
          id: b,
          viewBox: "0 0 10 10",
          refX: "9",
          refY: "5",
          markerWidth: "5",
          markerHeight: "5",
          orient: "auto-start-reverse"
        }, [...n[0] || (n[0] = [t("path", {
          d: "M1 1l8 4-8 4z",
          fill: "var(--map-road-ink)"
        }, null, -1)])]), e.projection.clip ? (l(), r("clipPath", {
          key: 0,
          id: `${b}-clip`
        }, [t("path", { d: i(Ce)(e.projection.clip) }, null, 8, _a)], 8, $a)) : M("", !0)]),
        t("g", {
          class: "map-world-roads",
          "aria-hidden": "true",
          "clip-path": e.projection.clip ? `url(#${b}-clip)` : void 0
        }, [(l(!0), r(I, null, W(e.projection.routes, (h) => (l(), r("g", { key: h.link.id }, [t("path", {
          d: i(Ce)(h.feature.geometry),
          fill: "none",
          stroke: "var(--map-road-ink)",
          "stroke-width": k * 0.8,
          "marker-start": h.arrow === "start" ? `url(#${b})` : void 0,
          "marker-end": h.arrow === "end" ? `url(#${b})` : void 0
        }, null, 8, Ca)]))), 128))], 8, xa),
        (l(!0), r(I, null, W(e.projection.nodes, (h) => (l(), r("g", {
          key: h.location.key,
          class: te(["map-place", {
            "is-selected": h.location.key === e.selectedLocationKey,
            "is-current": h.location.key === o.value,
            "is-unvisited": h.location.status !== "visited"
          }]),
          transform: `translate(${h.x} ${h.y}) scale(${k * 0.5})`,
          role: "button",
          tabindex: "0",
          "aria-label": i(xe).placeLabel(h.location.name),
          onClick: Le((R) => p.$emit("select", h.location.key), ["stop"]),
          onKeydown: [Ge(Le((R) => p.$emit("select", h.location.key), ["stop"]), ["enter"]), Ge(Le((R) => p.$emit("select", h.location.key), ["stop", "prevent"]), ["space"])]
        }, [
          n[1] || (n[1] = t("circle", {
            class: "map-pin-halo",
            r: "39"
          }, null, -1)),
          n[2] || (n[2] = t("path", {
            class: "map-pin-body",
            d: "M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z"
          }, null, -1)),
          t("g", ja, [S(E, {
            name: v(h.location.terrain, h.location.scale),
            width: "28",
            height: "28"
          }, null, 8, ["name"])]),
          t("text", Aa, y(h.location.name.length > 14 ? h.location.name.slice(0, 13) + "…" : h.location.name), 1),
          h.location.key === o.value ? (l(), r("text", Ea, y(i(xe).current), 1)) : h.location.status !== "visited" ? (l(), r("text", Pa, y(i(_e).unvisited), 1)) : M("", !0),
          t("title", null, y(h.location.name) + y(h.location.brief ? " · " + h.location.brief : ""), 1)
        ], 42, Sa))), 128))
      ]),
      _: 1
    }, 8, [
      "view-box",
      "atlas-insets",
      "initial-overview",
      "initial-point",
      "reset-key",
      "label",
      "focus-point",
      "focus-sequence"
    ]));
  }
}), Ia = Ba, we;
async function ft() {
  if (!we) {
    const e = [
      "..",
      "..",
      "..",
      "libs",
      "material-symbols",
      "material-symbols-rounded.woff2"
    ].join("/"), s = new URL(e, import.meta.url);
    we = new FontFace("Xiaobai Map Symbols", `url("${s.href}")`, {
      display: "block",
      weight: "400"
    }).load(), we.catch(() => {
      we = void 0;
    });
  }
  document.fonts.add(await we);
}
var Ra = ["id"], La = ["stop-color", "stop-opacity"], Ha = ["stop-color", "stop-opacity"], Ta = ["stop-color", "stop-opacity"], Oa = ["id"], Va = ["fill", "fill-opacity"], Ka = {
  fill: "none",
  stroke: "var(--scene-shadow)",
  "stroke-width": ".65",
  opacity: ".24"
}, qa = {
  key: 1,
  d: "M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21"
}, Na = {
  key: 2,
  d: "M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z"
}, za = {
  key: 3,
  d: "M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17",
  opacity: ".65"
}, Da = {
  key: 4,
  d: "M3 8q6 3 13 0M25 25q7 2 17-1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.3",
  opacity: "1"
}, Za = {
  key: 5,
  d: "M5 32 37 0M12 32 44 0",
  stroke: "var(--scene-highlight)",
  "stroke-width": "2.2"
}, Fa = {
  key: 6,
  d: "M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3"
}, Ua = {
  key: 7,
  d: "M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2",
  "stroke-linecap": "round"
}, Ya = {
  key: 8,
  d: "M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1"
}, Wa = {
  key: 9,
  d: "M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32",
  opacity: ".55"
}, Qa = {
  key: 10,
  d: "m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8"
}, Ga = {
  key: 11,
  d: "M7 8q12-5 16 6t20 7M4 27l6-3"
}, Xa = {
  key: 12,
  d: "M5 19q5-3 11-1M29 8q6-2 12 1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.4"
}, Ja = {
  key: 0,
  d: "M0 1H48",
  stroke: "var(--scene-highlight)",
  "stroke-width": ".7",
  opacity: ".35"
}, en = ["id"], tn = ["id"], an = ["transform", "fill"], nn = /* @__PURE__ */ X({
  __name: "SceneMaterials",
  props: { prefix: {} },
  setup(e) {
    return (s, a) => (l(), r("defs", null, [
      (l(!0), r(I, null, W(i(lt), (o) => (l(), r(I, { key: o }, [t("linearGradient", {
        id: `${e.prefix}-face-${o}`,
        x1: "0",
        y1: "0",
        x2: ".7",
        y2: "1"
      }, [
        t("stop", {
          offset: "0",
          "stop-color": `color-mix(in srgb, ${i($e)(o)}, var(--scene-highlight) 24%)`,
          "stop-opacity": o === "glass" ? 0.35 : 1
        }, null, 8, La),
        t("stop", {
          offset: ".52",
          "stop-color": i($e)(o),
          "stop-opacity": o === "glass" ? 0.16 : 1
        }, null, 8, Ha),
        t("stop", {
          offset: "1",
          "stop-color": `color-mix(in srgb, ${i($e)(o)}, var(--scene-shadow) 16%)`,
          "stop-opacity": o === "glass" ? 0.28 : 1
        }, null, 8, Ta)
      ], 8, Ra), t("pattern", {
        id: `${e.prefix}-material-${o}`,
        width: "48",
        height: "32",
        patternUnits: "userSpaceOnUse",
        class: "scene-texture"
      }, [
        t("rect", {
          width: "48",
          height: "32",
          fill: i($e)(o),
          "fill-opacity": o === "glass" ? 0.4 : 1
        }, null, 8, Va),
        t("g", Ka, [o === "wood" ? (l(), r(I, { key: 0 }, [a[0] || (a[0] = t("path", { d: "M0 0H48M0 16H48M19 0V16M37 16V32" }, null, -1)), a[1] || (a[1] = t("path", {
          d: "M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1",
          opacity: ".5"
        }, null, -1))], 64)) : o === "stone" ? (l(), r("path", qa)) : o === "tile" ? (l(), r("path", Na)) : o === "marble" ? (l(), r("path", za)) : o === "water" ? (l(), r("path", Da)) : o === "glass" ? (l(), r("path", Za)) : o === "grass" || o === "forest" ? (l(), r("path", Fa)) : o === "dirt" || o === "sand" ? (l(), r("path", Ua)) : o === "metal" ? (l(), r("path", Ya)) : [
          "carpet",
          "fabric",
          "bed-sheet",
          "tatami"
        ].includes(o) ? (l(), r("path", Wa)) : o === "rune" ? (l(), r("path", Qa)) : o === "blood" ? (l(), r("path", Ga)) : o === "snow" ? (l(), r("path", Xa)) : M("", !0)]),
        o === "wood" || o === "stone" || o === "metal" ? (l(), r("path", Ja)) : M("", !0)
      ], 8, Oa)], 64))), 128)),
      t("radialGradient", {
        id: `${e.prefix}-crown-face`,
        cx: ".32",
        cy: ".25",
        r: ".8"
      }, [...a[2] || (a[2] = [
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
      ])], 8, en),
      (l(), r(I, null, W(3, (o) => t("symbol", {
        id: `${e.prefix}-crown-${o - 1}`,
        key: o,
        viewBox: "0 0 100 100"
      }, [t("g", {
        transform: `rotate(${o * 37} 50 50)`,
        fill: `url(#${e.prefix}-crown-face)`,
        stroke: "var(--scene-leaf-dark)",
        "stroke-width": ".6"
      }, [...a[3] || (a[3] = [
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
      ])], 8, an)], 8, tn)), 64))
    ]));
  }
}), ln = nn, sn = [
  "x",
  "y",
  "width",
  "height"
], on = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "50"
}, rn = {
  key: 1,
  width: "100",
  height: "100"
}, un = ["clip-path", "fill"], cn = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "49",
  class: "scene-object-edge"
}, dn = {
  key: 1,
  x: "1",
  y: "1",
  width: "98",
  height: "98",
  rx: "2",
  class: "scene-object-edge"
}, vn = ["fill"], pn = ["fill"], mn = ["d"], fn = {
  key: 0,
  d: "M9 78H91",
  class: "scene-object-seam"
}, yn = ["x"], hn = /* @__PURE__ */ X({
  __name: "SceneObject",
  props: {
    element: {},
    prefix: {},
    unitScale: {}
  },
  setup(e) {
    const s = e, a = C(() => ot(s.element)), o = C(() => Math.min(a.value.width, a.value.height) / s.unitScale >= 12), u = C(() => s.element.shape === "circle"), d = C(() => s.element.material), b = C(() => Dt(d.value, s.prefix)), c = C(() => It(d.value, s.prefix)), v = `scene-object-${He()}`;
    return (p, n) => (l(), r("svg", {
      x: a.value.x,
      y: a.value.y,
      width: a.value.width,
      height: a.value.height,
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "scene-object"
    }, [t("defs", null, [t("clipPath", { id: v }, [u.value ? (l(), r("circle", on)) : (l(), r("rect", rn))])]), t("g", {
      "clip-path": `url(#${v})`,
      fill: b.value
    }, [u.value ? (l(), r("circle", cn)) : (l(), r("rect", dn)), o.value ? (l(), r(I, { key: 2 }, [u.value ? (l(), r("circle", {
      key: 0,
      cx: "50",
      cy: "50",
      r: "44",
      fill: c.value,
      class: "scene-object-inset"
    }, null, 8, vn)) : (l(), r("rect", {
      key: 1,
      x: "5",
      y: "5",
      width: "90",
      height: "90",
      rx: "2",
      fill: c.value,
      class: "scene-object-inset"
    }, null, 8, pn)), e.element.icon === "table" || e.element.icon === "counter" ? (l(), r(I, { key: 2 }, [t("path", {
      d: u.value ? "M18 36A35 35 0 0 1 72 22" : "M8 13V8H92",
      class: "scene-object-shine"
    }, null, 8, mn), e.element.icon === "counter" ? (l(), r("path", fn)) : M("", !0)], 64)) : e.element.icon === "chair" ? (l(), r(I, { key: 3 }, [
      n[0] || (n[0] = t("rect", {
        x: "12",
        y: "29",
        width: "76",
        height: "61",
        rx: "9",
        class: "scene-object-inset"
      }, null, -1)),
      n[1] || (n[1] = t("rect", {
        x: "7",
        y: "5",
        width: "86",
        height: "23",
        rx: "6",
        class: "scene-object-edge"
      }, null, -1)),
      n[2] || (n[2] = t("path", {
        d: "M16 12H84",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : e.element.icon === "bed" ? (l(), r(I, { key: 4 }, [
      n[3] || (n[3] = t("rect", {
        x: "10",
        y: "12",
        width: "80",
        height: "79",
        rx: "5",
        class: "scene-object-inset"
      }, null, -1)),
      n[4] || (n[4] = t("rect", {
        x: "20",
        y: "17",
        width: "60",
        height: "20",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      n[5] || (n[5] = t("path", {
        d: "M12 45H88M17 82H83",
        class: "scene-object-seam"
      }, null, -1)),
      n[6] || (n[6] = t("path", {
        d: "M18 49H82",
        class: "scene-object-shine"
      }, null, -1))
    ], 64)) : e.element.icon === "shelf" ? (l(), r(I, { key: 5 }, [n[7] || (n[7] = t("path", {
      d: "M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92",
      class: "scene-object-seam"
    }, null, -1)), n[8] || (n[8] = t("path", {
      d: "M8 34H92M8 68H92",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "sofa" ? (l(), r(I, { key: 6 }, [
      n[9] || (n[9] = t("rect", {
        x: "8",
        y: "5",
        width: "84",
        height: "25",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      (l(), r(I, null, W(3, (k) => t("rect", {
        key: k,
        x: 15 + (k - 1) * 24,
        y: "32",
        width: "22",
        height: "57",
        rx: "5",
        class: "scene-object-inset"
      }, null, 8, yn)), 64)),
      n[10] || (n[10] = t("rect", {
        x: "3",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1)),
      n[11] || (n[11] = t("rect", {
        x: "86",
        y: "23",
        width: "11",
        height: "70",
        rx: "4",
        class: "scene-object-inset"
      }, null, -1))
    ], 64)) : e.element.icon === "bridge" ? (l(), r(I, { key: 7 }, [n[12] || (n[12] = t("path", {
      d: "M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91",
      class: "scene-object-seam"
    }, null, -1)), n[13] || (n[13] = t("path", {
      d: "M11 7V93M89 7V93",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "tree" ? (l(), r(I, { key: 8 }, [n[14] || (n[14] = Mt('<circle cx="34" cy="32" r="24" class="scene-object-inset"></circle><circle cx="69" cy="36" r="24" class="scene-object-inset"></circle><circle cx="30" cy="62" r="23" class="scene-object-inset"></circle><circle cx="64" cy="67" r="25" class="scene-object-inset"></circle><circle cx="49" cy="48" r="26" class="scene-object-inset"></circle><path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine"></path>', 6))], 64)) : e.element.icon === "rock" ? (l(), r(I, { key: 9 }, [n[15] || (n[15] = t("path", {
      d: "M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57",
      class: "scene-object-seam"
    }, null, -1)), n[16] || (n[16] = t("path", {
      d: "M12 38 33 17 72 22",
      class: "scene-object-shine"
    }, null, -1))], 64)) : M("", !0)], 64)) : M("", !0)], 8, un)], 8, sn));
  }
}), bn = hn, kn = ["data-element", "opacity"], gn = ["transform"], Mn = ["d"], wn = ["d", "stroke-width"], $n = [
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap"
], _n = [
  "d",
  "stroke",
  "stroke-opacity",
  "stroke-dasharray"
], xn = ["transform"], Cn = ["id"], Sn = ["d"], jn = ["clip-path"], An = [
  "href",
  "x",
  "y",
  "width",
  "height"
], En = ["transform"], Pn = {
  key: 0,
  r: "19",
  class: "scene-player-halo"
}, Bn = ["stroke"], In = {
  key: 1,
  class: "map-material-symbol",
  "aria-hidden": "true"
}, Rn = {
  key: 2,
  class: "map-symbol-fallback",
  "aria-hidden": "true"
}, Ln = ["x", "y"], Hn = /* @__PURE__ */ X({
  __name: "MapScene",
  props: { scene: {} },
  setup(e) {
    const s = e, a = B(!1);
    he(() => {
      ft().then(() => {
        a.value = !0;
      }).catch(() => {
        a.value = !1;
      });
    });
    const o = `xiaobai-map-scene-${He()}`, u = C(() => rt[s.scene.mood || "neutral"]), d = C(() => qt(s.scene.elements)), b = C(() => Kt(s.scene.elements).map((c, v) => ({
      element: c,
      bounds: ot(c),
      path: Tt(c),
      transform: Ht(c),
      area: Ot(c),
      presentation: Bt(c, o),
      clipId: `${o}-area-${v}`,
      object: Lt(c) && !Je(c),
      marker: Je(c) && c.shape !== "label"
    })));
    return (c, v) => (l(), G(pt, {
      class: "map-scene-viewport",
      style: Re({ "--scene-glow": u.value.glow }),
      "view-box": e.scene.viewBox,
      "reset-key": e.scene.key,
      label: `${e.scene.name} 场景地图`
    }, {
      default: je(({ unitScale: p }) => [
        S(ln, { prefix: o }),
        (l(!0), r(I, null, W(b.value, (n) => (l(), r("g", {
          key: n.element.id,
          class: te(["map-scene-element", [`is-${n.element.category}`, `is-${n.element.certainty || "confirmed"}`]]),
          "data-element": n.element.id,
          opacity: n.presentation.opacity
        }, [t("g", { transform: n.transform }, [
          n.object ? (l(), G(bn, {
            key: 0,
            element: n.element,
            prefix: o,
            "unit-scale": p
          }, null, 8, ["element", "unit-scale"])) : n.path ? (l(), r(I, { key: 1 }, [
            n.element.category === "wall" ? (l(), r("path", {
              key: 0,
              d: n.path,
              fill: "none",
              stroke: "var(--scene-shadow)",
              "stroke-width": "9",
              opacity: ".18",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, Mn)) : M("", !0),
            n.element.category === "road" && !n.area ? (l(), r("path", {
              key: 1,
              d: n.path,
              fill: "none",
              stroke: "var(--scene-soft-edge)",
              "stroke-width": n.presentation.width + 2,
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, wn)) : M("", !0),
            t("path", {
              d: n.path,
              fill: n.presentation.fill,
              stroke: n.presentation.stroke,
              "stroke-width": n.presentation.width,
              "stroke-dasharray": n.presentation.dash,
              "stroke-linejoin": "round",
              "stroke-linecap": n.element.category === "wall" ? "butt" : "round",
              "fill-rule": "evenodd",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, $n),
            n.element.category === "wall" ? (l(), r("path", {
              key: 2,
              d: n.path,
              fill: "none",
              stroke: n.element.material ? i($e)(n.element.material) : "var(--scene-wall)",
              "stroke-width": "3.5",
              "stroke-opacity": n.element.material === "glass" ? 0.4 : 1,
              "stroke-dasharray": n.presentation.dash,
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, _n)) : M("", !0)
          ], 64)) : M("", !0),
          n.object && !i(Rt)(n.element) && Math.min(n.bounds.width, n.bounds.height) / p >= 12 ? (l(), r("g", {
            key: 2,
            transform: `translate(${n.bounds.x + n.bounds.width / 2} ${n.bounds.y + n.bounds.height / 2})`,
            "aria-hidden": "true"
          }, [t("text", {
            class: te(a.value ? "map-material-symbol" : "map-symbol-fallback"),
            style: Re({
              fontSize: `${Math.min(22 * p, Math.min(n.bounds.width, n.bounds.height) * 0.65)}px`,
              fill: "var(--scene-edge)",
              textAnchor: "middle",
              dominantBaseline: "central"
            })
          }, y(a.value ? n.presentation.icon : n.presentation.fallback), 7)], 8, xn)) : M("", !0),
          d.value.has(n.element.id) ? (l(), r(I, { key: 3 }, [t("defs", null, [t("clipPath", { id: n.clipId }, [t("path", {
            d: n.path,
            "clip-rule": "evenodd"
          }, null, 8, Sn)], 8, Cn)]), t("g", {
            "clip-path": `url(#${n.clipId})`,
            class: "scene-forest-decoration",
            "aria-hidden": "true"
          }, [(l(!0), r(I, null, W(d.value.get(n.element.id), (k, h) => (l(), r("use", {
            key: h,
            href: `#${o}-crown-${k.variant}`,
            x: k.x - k.size / 2,
            y: k.y - k.size / 2,
            width: k.size,
            height: k.size
          }, null, 8, An))), 128))], 8, jn)], 64)) : M("", !0)
        ], 8, gn), n.marker ? (l(), r("g", {
          key: 0,
          class: "map-scene-icon",
          transform: `translate(${n.bounds.x + n.bounds.width / 2} ${n.bounds.y + n.bounds.height / 2}) scale(${p})`
        }, [
          n.element.actorKey === "player" || n.element.kind === "player" ? (l(), r("circle", Pn)) : M("", !0),
          t("circle", {
            r: "11",
            stroke: n.presentation.stroke
          }, null, 8, Bn),
          a.value ? (l(), r("text", In, y(n.presentation.icon), 1)) : (l(), r("text", Rn, y(n.presentation.fallback), 1))
        ], 8, En)) : M("", !0)], 10, kn))), 128)),
        t("g", {
          class: "scene-labels",
          style: Re({ "--scene-unit-scale": p })
        }, [(l(!0), r(I, null, W(b.value, (n) => (l(), r(I, { key: n.element.id }, [n.element.label ? (l(), r("text", {
          key: 0,
          class: te(["map-scene-label", { "is-primary": n.element.shape === "label" }]),
          x: i(Xe)(n.element, p)[0],
          y: i(Xe)(n.element, p)[1]
        }, y(n.element.label), 11, Ln)) : M("", !0)], 64))), 128))], 4)
      ]),
      _: 1
    }, 8, [
      "style",
      "view-box",
      "reset-key",
      "label"
    ]));
  }
}), Tn = Hn, On = {
  key: 0,
  class: "map-3d-loading",
  role: "status"
}, Vn = {
  class: "map-viewport-controls",
  "aria-label": "三维视角"
}, Kn = /* @__PURE__ */ X({
  __name: "MapScene3D",
  props: {
    scene: {},
    lowWalls: { type: Boolean },
    showLabels: { type: Boolean }
  },
  emits: ["fallback"],
  setup(e, { emit: s }) {
    const a = e, o = s, u = B(null), d = B(null), b = B(!0);
    let c, v = !1;
    return he(async () => {
      v = !0;
      try {
        const { createThreeRuntime: p } = await import("./xiaobai-os-three-runtime-B2B1D6bE.js");
        if (!v) return;
        c = p(u.value, d.value, { fallback: (n) => o("fallback", n) }), c.setScene(a.scene), c.walls(a.lowWalls), c.labels(a.showLabels), b.value = !1, ft().then(() => {
          v && c?.symbols(!0);
        }).catch(() => {
        });
      } catch {
        v && o("fallback", "当前设备无法打开三维，已切换二维。");
      }
    }), ae(() => a.scene, (p) => c?.setScene(p)), ae(() => a.lowWalls, (p) => c?.walls(p)), ae(() => a.showLabels, (p) => c?.labels(p)), Ae(() => {
      v = !1, c?.dispose(), c = void 0;
    }), (p, n) => (l(), r("div", {
      ref_key: "host",
      ref: u,
      class: "map-scene-three",
      style: Re({ "--scene-glow": i(rt)[e.scene.mood || "neutral"].glow })
    }, [
      t("div", {
        ref_key: "labelHost",
        ref: d,
        class: "map-3d-labels"
      }, null, 512),
      b.value ? (l(), r("div", On, "正在打开三维…")) : M("", !0),
      t("div", Vn, [
        t("button", {
          type: "button",
          "aria-label": "放大三维",
          onClick: n[0] || (n[0] = (k) => i(c)?.zoom(1.2))
        }, "+"),
        t("button", {
          type: "button",
          "aria-label": "缩小三维",
          onClick: n[1] || (n[1] = (k) => i(c)?.zoom(1 / 1.2))
        }, "−"),
        t("button", {
          type: "button",
          class: "map-fit",
          "aria-label": "重置三维视角",
          onClick: n[2] || (n[2] = (k) => i(c)?.fit())
        }, "全图")
      ])
    ], 4));
  }
}), qn = Kn, Nn = ["aria-label"], zn = { class: "map-scene-toolbar" }, Dn = {
  class: "map-render-switch",
  role: "group",
  "aria-label": "场景显示方式"
}, Zn = ["aria-pressed"], Fn = ["aria-pressed", "disabled"], Un = ["aria-pressed"], Yn = ["aria-pressed"], Wn = { class: "map-scene-stage" }, Qn = /* @__PURE__ */ X({
  __name: "MapSceneView",
  props: {
    scene: {},
    mode: {},
    threeUnavailable: { type: Boolean }
  },
  emits: ["update:mode", "fallback"],
  setup(e, { emit: s }) {
    const a = s, o = B(!1), u = B(!0);
    return (d, b) => (l(), r("section", {
      class: "map-scene-view",
      "aria-label": e.scene.name
    }, [t("div", zn, [
      t("div", Dn, [t("button", {
        type: "button",
        "aria-pressed": e.mode === "2d",
        onClick: b[0] || (b[0] = (c) => a("update:mode", "2d"))
      }, "二维", 8, Zn), t("button", {
        type: "button",
        "aria-pressed": e.mode === "3d",
        disabled: e.threeUnavailable,
        onClick: b[1] || (b[1] = (c) => a("update:mode", "3d"))
      }, "三维", 8, Fn)]),
      e.mode === "3d" ? (l(), r("button", {
        key: 0,
        type: "button",
        "aria-pressed": o.value,
        onClick: b[2] || (b[2] = (c) => o.value = !o.value)
      }, "低墙", 8, Un)) : M("", !0),
      e.mode === "3d" ? (l(), r("button", {
        key: 1,
        type: "button",
        "aria-pressed": u.value,
        onClick: b[3] || (b[3] = (c) => u.value = !u.value)
      }, "名称", 8, Yn)) : M("", !0)
    ]), t("div", Wn, [Ue(S(Tn, { scene: e.scene }, null, 8, ["scene"]), [[at, e.mode === "2d"]]), e.mode === "3d" ? (l(), G(qn, {
      key: 0,
      scene: e.scene,
      "low-walls": o.value,
      "show-labels": u.value,
      onFallback: b[4] || (b[4] = (c) => a("fallback", c))
    }, null, 8, [
      "scene",
      "low-walls",
      "show-labels"
    ])) : M("", !0)])], 8, Nn));
  }
}), Gn = Qn;
function Xn(e) {
  const s = e?.atlas.actors.find((o) => o.actorKey === "player"), a = e?.atlas.locations.find((o) => o.key === s?.locationKey);
  return a?.sceneKey && e?.scenes[a.sceneKey]?.status === "active" ? "scene" : "world";
}
var Jn = { class: "map-dialog-header" }, el = { key: 0 }, tl = { class: "map-settings-content" }, al = { class: "map-auto-setting" }, nl = ["aria-checked", "disabled"], ll = { class: "map-settings-section" }, sl = ["disabled"], ol = { key: 0 }, il = { class: "map-settings-section" }, rl = { key: 0 }, ul = ["disabled"], cl = {
  key: 0,
  class: "map-setting-note",
  role: "status"
}, dl = ["disabled"], vl = /* @__PURE__ */ X({
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
    return (s, a) => (l(), G(nt, {
      class: "map-dialog map-settings",
      "aria-labelledby": "map-settings-title",
      onClose: a[5] || (a[5] = (o) => s.$emit("close"))
    }, {
      default: je(() => [
        t("header", Jn, [a[6] || (a[6] = t("div", null, [t("small", null, "让地图跟上你的故事"), t("h2", { id: "map-settings-title" }, "地图设置")], -1)), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "关闭地图设置",
          onClick: a[0] || (a[0] = (o) => s.$emit("close"))
        }, [S(E, { name: "close" })])]),
        e.status || e.notice || e.maintenanceMessage ? (l(), r("section", {
          key: 0,
          class: te(["map-settings-feedback", { "is-error": e.notice ? e.noticeError : e.maintenanceError }]),
          role: "status"
        }, [t("strong", null, y(e.notice ? e.notice === e.maintenanceMessage ? "最近一次更新" : "操作提示" : e.status || "最近一次更新"), 1), e.notice || e.maintenanceMessage ? (l(), r("p", el, y(e.notice || e.maintenanceMessage), 1)) : M("", !0)], 2)) : M("", !0),
        t("div", tl, [
          t("section", al, [a[8] || (a[8] = t("div", null, [t("h3", null, "随对话自动更新"), t("p", null, "你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。")], -1)), t("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": e.autoMaintenance,
            "aria-label": "随对话自动更新",
            disabled: e.autoToggleBusy,
            onClick: a[1] || (a[1] = (o) => s.$emit("setAuto", !e.autoMaintenance))
          }, [...a[7] || (a[7] = [t("span", null, null, -1)])], 8, nl)]),
          t("section", ll, [
            S(E, { name: "refresh" }),
            a[9] || (a[9] = t("h3", null, "补充最近的变化", -1)),
            a[10] || (a[10] = t("p", null, "根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。", -1)),
            t("button", {
              type: "button",
              class: "map-primary-button",
              disabled: e.busy || !!e.disabledReason || !e.hasMap,
              onClick: a[2] || (a[2] = (o) => s.$emit("update"))
            }, y(e.busy ? e.status || "请稍候…" : "更新地图"), 9, sl),
            e.hasMap ? M("", !0) : (l(), r("small", ol, "请先建立世界地图"))
          ]),
          t("section", il, [
            S(E, { name: "globe" }),
            t("h3", null, y(e.hasMap ? "重新绘制世界" : "建立世界地图"), 1),
            a[11] || (a[11] = t("p", null, "依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。", -1)),
            e.hasMap ? (l(), r("p", rl, "新地图保存成功后替换原图；失败时保留原图。")) : M("", !0),
            t("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: e.busy || !!e.disabledReason,
              onClick: a[3] || (a[3] = (o) => s.$emit("rebuild"))
            }, y(e.busy ? e.status || "请稍候…" : e.hasMap ? "重新绘制" : "绘制世界地图"), 9, ul)
          ]),
          e.disabledReason ? (l(), r("p", cl, y(e.disabledReason), 1)) : M("", !0),
          t("button", {
            type: "button",
            class: "map-sync-button",
            disabled: e.busy || e.refreshDisabled,
            onClick: a[4] || (a[4] = (o) => s.$emit("refresh"))
          }, [S(E, { name: "refresh" }), a[12] || (a[12] = Z("重新加载地图", -1))], 8, dl),
          a[13] || (a[13] = t("p", { class: "map-setting-note" }, "只加载已保存的地图，不会重新绘制。绘制或更新时可以离开此页面。", -1))
        ])
      ]),
      _: 1
    }));
  }
}), pl = vl;
function ml(e, s, a) {
  const o = s.trim().toLocaleLowerCase();
  return e.locations.filter((u) => [u.name, u.brief].some((d) => d?.toLocaleLowerCase().includes(o)) && (a === "all" || (a === "visited" ? u.status === "visited" : u.status !== "visited")));
}
var fl = { class: "map-search-input" }, yl = ["aria-label", "placeholder"], hl = { class: "map-search-scope" }, bl = ["aria-label"], kl = ["aria-pressed", "onClick"], gl = { class: "map-search-results" }, Ml = ["onClick"], wl = { class: "map-result-icon" }, $l = { key: 0 }, _l = {
  key: 0,
  class: "map-search-empty"
}, xl = /* @__PURE__ */ X({
  __name: "MapSearch",
  props: {
    scope: {},
    title: {},
    initialFilter: {}
  },
  emits: ["close", "select"],
  setup(e) {
    const s = e, a = B(""), o = B(s.initialFilter), u = C(() => st[s.scope.kind]), d = C(() => [
      {
        id: "all",
        name: u.value.all
      },
      {
        id: "unvisited",
        name: _e.unvisited
      },
      {
        id: "visited",
        name: _e.visited
      }
    ]), b = C(() => ml(s.scope, a.value, o.value));
    return (c, v) => (l(), G(nt, {
      class: "map-dialog map-search-dialog",
      "aria-label": u.value.search,
      onClose: v[2] || (v[2] = (p) => c.$emit("close"))
    }, {
      default: je(() => [
        t("header", fl, [
          S(E, { name: "search" }),
          Ue(t("input", {
            "onUpdate:modelValue": v[0] || (v[0] = (p) => a.value = p),
            type: "search",
            "aria-label": u.value.search,
            placeholder: u.value.search,
            autofocus: ""
          }, null, 8, yl), [[gt, a.value]]),
          t("button", {
            type: "button",
            onClick: v[1] || (v[1] = (p) => c.$emit("close"))
          }, y(i(V).cancel), 1)
        ]),
        t("h2", hl, y(e.title), 1),
        t("nav", {
          class: "map-search-filters",
          "aria-label": i(V).filters
        }, [(l(!0), r(I, null, W(d.value, (p) => (l(), r("button", {
          key: p.id,
          type: "button",
          "aria-pressed": o.value === p.id,
          onClick: (n) => o.value = p.id
        }, y(p.name), 9, kl))), 128))], 8, bl),
        t("div", gl, [
          t("small", null, y(i(jt)(e.scope.kind, b.value.length)), 1),
          (l(!0), r(I, null, W(b.value, (p) => (l(), r("button", {
            key: p.key,
            type: "button",
            class: "map-search-result",
            onClick: (n) => c.$emit("select", p.key)
          }, [
            t("span", wl, [S(E, { name: e.scope.kind === "world" ? "globe" : "pin" }, null, 8, ["name"])]),
            t("span", null, [
              t("strong", null, y(p.name), 1),
              t("small", null, y(i(it)[p.scale]) + " · " + y(i(_e)[p.status === "visited" ? "visited" : "unvisited"]), 1),
              p.brief ? (l(), r("p", $l, y(p.brief), 1)) : M("", !0)
            ]),
            S(E, { name: "next" })
          ], 8, Ml))), 128)),
          b.value.length ? M("", !0) : (l(), r("div", _l, [
            S(E, { name: "search" }),
            t("h3", null, y(u.value.notFound), 1),
            t("p", null, y(i(V).searchHint), 1)
          ]))
        ])
      ]),
      _: 1
    }, 8, ["aria-label"]));
  }
}), Cl = xl, Sl = {
  class: "map-place-detail",
  "aria-labelledby": "map-place-title"
}, jl = { id: "map-place-title" }, Al = { class: "map-place-content" }, El = ["data-position-status"], Pl = {
  key: 1,
  class: "map-place-full-name"
}, Bl = {
  key: 2,
  class: "map-address"
}, Il = { class: "map-place-intro" }, Rl = { class: "map-place-actions" }, Ll = {
  key: 3,
  class: "map-detail-section"
}, Hl = { class: "map-people" }, Tl = {
  key: 4,
  class: "map-detail-section"
}, Ol = ["onClick"], Vl = /* @__PURE__ */ X({
  __name: "MapPlaceDetail",
  props: {
    location: {},
    map: {},
    currentKey: {},
    unlocated: {}
  },
  emits: [
    "close",
    "scene",
    "explore",
    "select"
  ],
  setup(e) {
    const s = e, a = C(() => Te(s.map.atlas, s.location.key).slice(0, -1)), o = C(() => ue(s.location)), u = C(() => s.map.atlas.actors.filter((b) => b.locationKey === s.location.key)), d = C(() => ba(s.map.atlas, s.location.key));
    return (b, c) => (l(), r("section", Sl, [
      c[6] || (c[6] = t("div", {
        class: "map-sheet-grip",
        "aria-hidden": "true"
      }, null, -1)),
      t("header", null, [t("div", null, [t("small", null, y(i(it)[e.location.scale]) + " · " + y(e.currentKey === e.location.key ? "当前位置" : i(_e)[e.location.status === "visited" ? "visited" : "unvisited"]), 1), t("h2", jl, y(e.location.name), 1)]), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "关闭地点详情",
        onClick: c[0] || (c[0] = (v) => b.$emit("close"))
      }, [S(E, { name: "close" })])]),
      t("div", Al, [
        e.unlocated ? (l(), r("p", {
          key: 0,
          class: "map-position-note",
          "data-position-status": e.unlocated
        }, [S(E, { name: "pin" }), Z(y(i(_t)[e.unlocated]), 1)], 8, El)) : M("", !0),
        e.location.name.length > 24 ? (l(), r("p", Pl, y(e.location.name), 1)) : M("", !0),
        a.value.length ? (l(), r("p", Bl, [S(E, { name: "pin" }), Z(y(a.value.map((v) => v.name).join(" · ")), 1)])) : M("", !0),
        t("p", Il, y(e.location.brief || "这个地点已记录在世界地图上，更多介绍等待故事展开。"), 1),
        t("div", Rl, [o.value ? (l(), r("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          onClick: c[1] || (c[1] = (v) => b.$emit("explore"))
        }, [S(E, { name: "compass" }), Z(y(i(V).regionMap), 1)])) : (l(), r("button", {
          key: 1,
          type: "button",
          class: "map-secondary-button",
          onClick: c[2] || (c[2] = (v) => b.$emit("scene"))
        }, [S(E, { name: "layers" }), Z(y(i(V).sceneMap), 1)]))]),
        u.value.length ? (l(), r("section", Ll, [c[3] || (c[3] = t("h3", null, "记录在这里的人物", -1)), t("p", Hl, [(l(!0), r(I, null, W(u.value, (v) => (l(), r("span", { key: v.actorKey }, [S(E, { name: "person" }), Z(y(v.displayName), 1)]))), 128))])])) : M("", !0),
        d.value.length ? (l(), r("section", Tl, [c[4] || (c[4] = t("h3", null, "相连的地方", -1)), (l(!0), r(I, null, W(d.value, (v) => (l(), r("button", {
          key: v.link.id,
          type: "button",
          class: "map-connection",
          onClick: (p) => b.$emit("select", v.location.key)
        }, [
          S(E, { name: "route" }),
          t("span", null, [t("strong", null, y(v.location.name), 1), t("small", null, y(v.link.label || i(Vt)[v.link.kind]) + y(v.link.bidirectional ? "" : v.outgoing ? " · 单向前往" : " · 仅可从对面到达"), 1)]),
          S(E, { name: "next" })
        ], 8, Ol))), 128))])) : M("", !0),
        c[5] || (c[5] = t("p", { class: "map-detail-footnote" }, "查看地图不会改变你在故事中的位置", -1))
      ])
    ]));
  }
}), Kl = Vl;
function et(e, s) {
  const a = s.role === "structure" && s.destination ? e.locations.find((d) => d.key === s.destination) : void 0, o = a && Fe(a) ? a.key : s.owner;
  if (!o) return null;
  const u = Se(e, o);
  return u ? u.key : e.locations.some((d) => d.key === o && Fe(d)) ? void 0 : null;
}
function ql(e, s) {
  const a = s === null ? void 0 : e.locations.find((d) => d.key === s && ue(d)), o = ha(e), u = (s === null ? e.locations.filter(ue) : a ? e.locations.filter((d) => Fe(d) && Se(e, d.key)?.key === a.key) : []).map((d) => o.has(d.key) ? {
    ...d,
    status: "visited"
  } : d);
  return {
    kind: s === null ? "world" : "region",
    region: a,
    locations: u,
    unvisited: u.filter((d) => d.status !== "visited").length,
    frame: a ? Ut(a.key) : s === null ? ct : ""
  };
}
function Nl(e, s) {
  const a = e.frames.find((m) => m.id === s.frame), o = Wt(e.frames), u = a?.boundary ? e.features.find((m) => m.id === a.boundary)?.geometry : void 0, d = [], b = [], c = [];
  for (const m of s.locations) {
    const g = m.position, w = g && o(g.frame, s.frame);
    if (!g || !w) {
      b.push({
        location: m,
        reason: g ? "mapping_unknown" : "position_unknown"
      });
      continue;
    }
    const [A, L] = Ft(g.at, w);
    if (u && !Zt([A, L], u)) {
      b.push({
        location: m,
        reason: "outside_map"
      });
      continue;
    }
    d.push({
      location: m,
      x: A,
      y: L
    });
  }
  for (const m of e.features) {
    if (m.role === "boundary") continue;
    const g = et(e, m);
    if (g === void 0 || (s.kind === "world" ? g !== null : !s.region || g !== s.region.key && (g !== null || !u))) continue;
    const w = o(m.frame, s.frame);
    if (!w) continue;
    const A = Be(m.geometry, w), L = Qt(A, u);
    if (!L) continue;
    const T = m.destination ? e.locations.find((O) => O.key === m.destination)?.name || "" : m.name || "";
    c.push({
      source: m,
      geometry: A,
      mapping: w,
      bounds: L,
      label: T
    });
  }
  d.sort((m, g) => m.location.key.localeCompare(g.location.key)), c.sort((m, g) => m.source.id.localeCompare(g.source.id));
  const v = e.features.flatMap((m) => {
    const g = et(e, m), w = o(m.frame, s.frame);
    if (!w || m.role === "boundary" || g !== null && g !== s.region?.key) return [];
    const A = Be(m.geometry, w);
    return [{
      source: m,
      geometry: A,
      mapping: w,
      bounds: ze(A),
      label: ""
    }];
  }), p = (m) => [
    m.source.support,
    ...m.source.crosses || [],
    ...Gt(m, v).map((g) => g.source.id)
  ], n = [], k = new Set(c.map((m) => m.source.id));
  for (let m = c.flatMap(p); m.length; ) {
    const g = m.shift(), w = g && !k.has(g) ? e.features.find((O) => O.id === g) : void 0;
    if (!w) continue;
    k.add(w.id);
    const A = o(w.frame, s.frame);
    if (!A) continue;
    const L = Be(w.geometry, A), T = {
      source: w,
      geometry: L,
      mapping: A,
      bounds: ze(L),
      label: ""
    };
    n.push(T), m.push(...p(T));
  }
  n.sort((m, g) => m.source.id.localeCompare(g.source.id));
  const h = new Map(d.map((m) => [m.location.key, m])), R = e.links.flatMap((m) => {
    const g = c.find((Q) => Q.source.id === m.feature), w = h.get(m.from), A = h.get(m.to);
    if (!g || !w || !A) return [];
    const L = dt(g.geometry), T = L[0], O = L[L.length - 1], U = (Q, ee) => Math.hypot(Q[0] - ee.x, Q[1] - ee.y) < 1e-6, P = m.bidirectional ? void 0 : U(T, w) && U(O, A) ? "end" : U(T, A) && U(O, w) ? "start" : void 0;
    return [{
      link: m,
      feature: g,
      from: w,
      to: A,
      ...P ? { arrow: P } : {}
    }];
  }), q = s.kind === "world" ? s.locations.flatMap((m) => {
    const g = e.frames.find((T) => T.owner === m.key), w = g?.boundary && e.features.find((T) => T.id === g.boundary), A = w && o(w.frame, s.frame);
    if (!w || !A) return [];
    const L = Be(w.geometry, A);
    return [{
      location: m,
      geometry: L,
      bounds: ze(L)
    }];
  }) : [], N = [
    ...c.map((m) => m.bounds),
    ...q.map((m) => m.bounds),
    ...d.map((m) => [
      m.x,
      m.y,
      0,
      0
    ])
  ];
  let F = [
    0,
    0,
    800,
    600
  ];
  if (N.length) {
    const m = Math.min(...N.map((T) => T[0])), g = Math.min(...N.map((T) => T[1])), w = Math.max(...N.map((T) => T[0] + T[2])) - m, A = Math.max(...N.map((T) => T[1] + T[3])) - g, L = Math.max(12, Math.max(w, A) * 0.08);
    F = [
      m - L,
      g - L,
      Math.max(w + L * 2, 120),
      Math.max(A + L * 2, 120)
    ];
  }
  return {
    scope: s,
    nodes: d,
    unlocated: b,
    features: c,
    regions: q,
    carriers: n,
    routes: R,
    clip: u,
    viewBox: F,
    drawable: !!N.length
  };
}
var Hs = new Set(Et), Ts = new Set(Nt), Os = new Set(xt), Vs = new Set(Pt), Ks = new Set(lt), qs = new Set(zt);
function zl() {
  return {
    schemaVersion: 2,
    revision: 0,
    atlas: {
      locations: [],
      links: [],
      actors: [],
      frames: [{ id: ct }],
      features: []
    },
    scenes: {}
  };
}
function ye(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function tt(e) {
  return e.maintenanceStatus === "maintaining" || e.maintenanceStatus === "rebuilding";
}
function Dl(e) {
  const s = B(structuredClone(Ie(e.initialState))), a = B(null), o = B(""), u = B(!1);
  let d = !1, b = 0, c = 0, v = () => {
  };
  const p = C(() => s.value.status === "unconfirmed" || s.value.writeState === "unconfirmed"), n = C(() => a.value !== null || ["loading", "saving"].includes(s.value.status) || ["maintaining", "rebuilding"].includes(s.value.maintenanceStatus || "")), k = C(() => n.value ? "正在更新地图，请稍候" : p.value ? "请先检查上一次是否保存成功" : s.value.status === "conflict" ? "存档有变化，请先选择要保留的版本" : s.value.status !== "ready" ? s.value.message || "地图暂时不可更新" : s.value.chatIdentity ? "" : "请先打开一个聊天"), h = C(() => s.value.maintenanceStatus === "rebuilding" || a.value === "rebuild" ? "正在绘制世界…" : s.value.maintenanceStatus === "maintaining" || a.value === "maintain" ? "正在更新地图…" : a.value === "confirm" ? "正在检查保存…" : n.value ? "请稍候…" : ""), R = C(() => s.value.message || o.value), q = C(() => s.value.message ? [
    "blocked",
    "error",
    "conflict",
    "unconfirmed"
  ].includes(s.value.status) : u.value);
  function N(g) {
    const w = tt(s.value);
    s.value = structuredClone(g), tt(g) ? (o.value = "", u.value = !1) : w && (o.value = g.maintenanceMessage || "", u.value = g.maintenanceStatus === "error");
  }
  function F(g, w) {
    const A = g instanceof Error ? g.message : String(g);
    return A.includes("聊天已切换") ? "聊天已切换，请重新打开地图。" : A === "host_request_timeout" ? "暂时没收到结果，地图可能还在更新。请稍后查看，不要再次更新。" : w === "confirm" ? "仍无法确认保存结果，请稍后再试。" : w === "adopt" ? "已保存版本暂时加载不了，当前修改还在，请稍后重试。" : w === "settings" ? "设置未能保存，请重试。" : "地图操作未完成，请稍后重试。";
  }
  async function m(g, w, A = {}) {
    if (a.value) return;
    const L = ++b, T = c, O = s.value.chatIdentity;
    a.value = w, o.value = "", u.value = !1;
    try {
      const U = await e.bridge.request(g, {
        chatIdentity: O,
        ...A
      }, 35e3);
      if (!d || L !== b || s.value.chatIdentity !== O) return;
      const P = ye(U) ? U.result : void 0, Q = ye(P) && ye(P.state) ? P.state : P;
      T === c && ye(Q) && Q.chatIdentity === O && N(Q), (w === "maintain" || w === "rebuild") && ye(P) && typeof P.message == "string" && P.message && (o.value = P.message), w === "refresh" && s.value.status === "ready" && (o.value = "已加载保存的地图。"), w === "settings" && (o.value = s.value.autoMaintenance ? "自动更新已开启。" : "自动更新已关闭。"), w === "confirm" && s.value.status === "ready" && (o.value = "已确认保存成功。"), w === "adopt" && ye(P) && P.adoption === "adopted" && (o.value = "已使用当前聊天里保存的 OS 存档。");
    } catch (U) {
      d && L === b && s.value.chatIdentity === O && (o.value = F(U, w), u.value = !0);
    } finally {
      d && L === b && (a.value = null);
    }
  }
  return he(() => {
    d = !0, v = e.bridge.subscribe((g) => {
      if (g.type === "map/state") {
        const w = g.payload.state;
        if (w.chatIdentity !== s.value.chatIdentity) return;
        c += 1, N(w);
      } else g.type === "map/error" && (c += 1, u.value = !0, o.value = g.payload.message || "地图暂时无法读取，请重新打开。");
    });
  }), Ae(() => {
    d = !1, b += 1, v();
  }), {
    state: s,
    activeRequest: a,
    busy: n,
    disabledReason: k,
    requiresConfirmation: p,
    status: h,
    notice: R,
    isError: q,
    dismissNotice: () => {
      o.value = "", u.value = !1;
    },
    refresh: () => {
      if (!n.value && !p.value) return m("map/refresh", "refresh");
    },
    confirmSave: () => {
      if (!n.value) return m("map/confirm-save", "confirm");
    },
    adopt: () => {
      if (!n.value) return m("map/adopt-server-state", "adopt");
    },
    setAuto: (g) => m("map/set-auto-maintenance", "settings", { enabled: g }),
    update: () => {
      if (!k.value && s.value.map) return m("map/maintain-once", "maintain");
    },
    rebuild: () => {
      if (!k.value) return m("map/rebuild", "rebuild");
    }
  };
}
function Zl(e, s, a) {
  const o = B([
    170,
    20,
    100,
    20
  ]);
  let u;
  const d = () => {
    const c = e.value?.getBoundingClientRect();
    if (!c?.height) return;
    const v = a.value?.getBoundingClientRect(), p = v && v.left >= c.left + c.width / 2;
    o.value = [
      Math.max(0, (s.value?.getBoundingClientRect().bottom || c.top) - c.top) + 16,
      p ? c.right - v.left + 16 : 20,
      v && !p ? c.bottom - v.top + 16 : 20,
      20
    ];
  }, b = () => {
    u?.disconnect();
    for (const c of [
      e.value,
      s.value,
      a.value
    ]) c && u?.observe(c);
    d();
  };
  return he(() => {
    u = new ResizeObserver(d), b();
  }), ae([s, a], b, { flush: "post" }), Ae(() => u?.disconnect()), {
    insets: o,
    measure: d
  };
}
var Fl = { class: "map-search-bar" }, Ul = ["disabled"], Yl = {
  key: 1,
  class: "map-search-entry"
}, Wl = {
  key: 0,
  class: "map-view-row"
}, Ql = ["aria-label"], Gl = ["aria-pressed"], Xl = ["aria-pressed"], Jl = ["aria-pressed"], es = {
  key: 0,
  class: "map-scene-tools"
}, ts = ["aria-expanded"], as = ["aria-label"], ns = ["aria-current"], ls = { "aria-current": "page" }, ss = {
  key: 2,
  class: "map-progress",
  role: "status"
}, os = {
  key: 3,
  class: "map-notice",
  role: "status"
}, is = ["disabled"], rs = ["disabled"], us = ["disabled"], cs = {
  key: 1,
  class: "map-empty"
}, ds = ["disabled"], vs = {
  key: 0,
  class: "map-setting-note"
}, ps = {
  key: 2,
  class: "map-empty"
}, ms = ["disabled"], fs = {
  key: 1,
  class: "map-empty map-first-map"
}, ys = { class: "map-empty-art" }, hs = ["disabled"], bs = {
  key: 1,
  class: "map-setting-note"
}, ks = {
  key: 0,
  class: "map-key"
}, gs = ["aria-label"], Ms = { class: "map-region-icon" }, ws = {
  id: "map-browse-summary",
  class: "map-region-summary"
}, $s = {
  class: "map-round-button",
  "aria-hidden": "true"
}, _s = { class: "map-atlas-toolbar" }, xs = { class: "map-floating-tools" }, Cs = ["disabled"], Ss = ["aria-expanded"], js = {
  key: 2,
  class: "map-scene-caption"
}, As = /* @__PURE__ */ X({
  __name: "MapApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const s = e, a = B(null), o = B(null), u = B(null), d = B(null), { insets: b, measure: c } = Zl(a, o, u), { state: v, activeRequest: p, busy: n, disabledReason: k, requiresConfirmation: h, status: R, notice: q, isError: N, dismissNotice: F, refresh: m, confirmSave: g, adopt: w, setAuto: A, update: L, rebuild: T } = Dl(s), O = B(""), U = () => Xn(v.value.map) === "scene" ? {
      kind: "scene",
      key: ""
    } : { kind: "world" }, P = B(U()), Q = B("3d"), ee = B(!1), ce = B("");
    let $ = !1;
    const x = C(() => P.value.kind === "scene"), H = C(() => P.value.kind === "scene" ? P.value.key : ""), z = B(""), Ee = B(0), se = B(!1), J = B(null), D = B(!1), K = C(() => v.value.map?.atlas), oe = C(() => K.value?.actors.find((j) => j.actorKey === "player")?.locationKey || ""), de = C(() => K.value?.locations.find((j) => j.key === oe.value)), ve = C(() => K.value?.locations.find((j) => j.key === (H.value || oe.value))), Oe = C(() => x.value && ve.value?.sceneKey ? v.value.map?.scenes[ve.value.sceneKey] : void 0), ne = C(() => {
      if (!K.value || P.value.kind === "world") return;
      const j = P.value.key || oe.value;
      return Se(K.value, j);
    }), Ye = zl().atlas, pe = C(() => !!(K.value && (K.value.locations.length || K.value.features.length))), Y = C(() => ql(K.value || Ye, P.value.kind === "world" ? null : ne.value?.key || "")), be = C(() => Nl(K.value || Ye, Y.value)), yt = C(() => be.value.unlocated.find((j) => j.location.key === O.value)?.reason), ie = C(() => Y.value.locations.find((j) => j.key === O.value)), ke = C(() => Y.value.kind === "world" ? le.world : ne.value?.name || V.unknownRegion), Ve = C(() => st[Y.value.kind]), We = C(() => Y.value.unvisited ? "unvisited" : "all");
    ae(() => v.value, (j, f) => {
      const _ = j.chatIdentity !== f.chatIdentity;
      (_ || !j.map?.atlas.locations.some((qe) => qe.key === O.value)) && (O.value = ""), _ && ($ = !1);
      const re = P.value.kind === "world" ? "" : P.value.key, kt = re && !j.map?.atlas.locations.some((qe) => qe.key === re);
      (_ || !f.map?.atlas.locations.length && j.map?.atlas.locations.length && !$ || kt) && (P.value = U()), _ && (se.value = !1, J.value = null, D.value = !1);
    }), ae(Y, (j, f) => {
      j.locations.some((_) => _.key === O.value) || (O.value = ""), (j.kind !== f.kind || j.region?.key !== f.region?.key || !K.value) && (O.value = "", J.value = null, D.value = !1);
    });
    function Ke(j) {
      $ = !0, P.value = j, O.value = "", J.value = null, D.value = !1;
    }
    function me(j = "") {
      Ke({
        kind: "region",
        key: j
      });
    }
    async function ge(j, f = !1) {
      const _ = K.value?.locations.find((re) => re.key === j);
      if (_) {
        if ($ = !0, f && K.value) {
          if (ue(_)) fe();
          else {
            const re = Se(K.value, j);
            if (!re) {
              Me(j);
              return;
            }
            me(re.key);
          }
          await Ne();
        }
        O.value = j, J.value = null, D.value = !1, await Ne(), c(), z.value = K.value ? mt(K.value, j, Y.value.locations) : j, Ee.value += 1;
      }
    }
    async function ht() {
      if (!(!de.value || !K.value)) {
        if (ue(de.value)) {
          await ge(de.value.key, !0);
          return;
        }
        if (!Se(K.value, de.value.key)) {
          Me();
          return;
        }
        me(), await Ne(), await ge(de.value.key);
      }
    }
    function Me(j = "") {
      Ke({
        kind: "scene",
        key: j === oe.value ? "" : j
      });
    }
    function fe() {
      Ke({ kind: "world" });
    }
    function bt(j) {
      ee.value || (ee.value = !0, Q.value = "2d", ce.value = j);
    }
    return wt(() => D.value ? (D.value = !1, !0) : x.value ? (me(H.value && ne.value?.key || ""), !0) : O.value ? (O.value = "", !0) : P.value.kind === "region" ? (fe(), !0) : !1), (j, f) => (l(), r("main", {
      ref_key: "mapElement",
      ref: a,
      class: te(["map-app", {
        "has-view-switch": pe.value,
        "is-scene-view": x.value,
        "is-atlas-view": pe.value && !x.value
      }])
    }, [
      t("div", {
        ref_key: "topElement",
        ref: o,
        class: "map-top"
      }, [
        t("header", Fl, [
          S(E, { name: x.value ? "layers" : "search" }, null, 8, ["name"]),
          x.value ? (l(), r("div", Yl, [Z(y(ve.value?.name || i(le).scene), 1), t("small", null, y(H.value ? i(V).sceneBrowsing : i(V).sceneCurrent), 1)])) : (l(), r("button", {
            key: 0,
            type: "button",
            class: "map-search-entry",
            disabled: !K.value?.locations.length,
            onClick: f[0] || (f[0] = (_) => J.value = "all")
          }, [Z(y(Ve.value.search), 1), t("small", null, y(ke.value), 1)], 8, Ul)),
          t("button", {
            type: "button",
            class: "map-round-button",
            "aria-label": "地图设置",
            onClick: f[1] || (f[1] = (_) => se.value = !0)
          }, [S(E, { name: "more" })])
        ]),
        pe.value ? (l(), r("div", Wl, [t("nav", {
          class: "map-view-switch",
          "aria-label": i(V).viewLabel
        }, [
          t("button", {
            type: "button",
            "aria-pressed": P.value.kind === "world",
            onClick: fe
          }, [S(E, { name: "globe" }), Z(y(i(le).world), 1)], 8, Gl),
          t("button", {
            type: "button",
            "aria-pressed": P.value.kind === "region",
            onClick: f[2] || (f[2] = (_) => me())
          }, [S(E, { name: "compass" }), Z(y(i(le).region), 1)], 8, Xl),
          t("button", {
            type: "button",
            "aria-pressed": x.value,
            onClick: f[3] || (f[3] = (_) => Me())
          }, [S(E, { name: "layers" }), Z(y(i(le).scene), 1)], 8, Jl)
        ], 8, Ql), x.value ? (l(), r("div", es, [H.value ? (l(), r("button", {
          key: 0,
          type: "button",
          class: "map-round-button",
          "aria-label": "回到当前场景",
          onClick: f[4] || (f[4] = (_) => Me())
        }, [S(E, { name: "locate" })])) : M("", !0), t("button", {
          type: "button",
          class: "map-round-button",
          "aria-expanded": D.value,
          "aria-label": "地图图例",
          onClick: f[5] || (f[5] = (_) => D.value = !D.value)
        }, [S(E, { name: "layers" })], 8, ts)])) : M("", !0)])) : M("", !0),
        pe.value && !x.value ? (l(), r("nav", {
          key: 1,
          class: "map-region-trail",
          "aria-label": i(V).trailLabel
        }, [t("button", {
          type: "button",
          "aria-current": P.value.kind === "world" ? "page" : void 0,
          onClick: fe
        }, [S(E, { name: "globe" }), Z(y(i(le).world), 1)], 8, ns), P.value.kind === "region" ? (l(), r(I, { key: 0 }, [S(E, { name: "next" }), t("span", ls, y(ke.value), 1)], 64)) : M("", !0)], 8, as)) : M("", !0),
        i(R) ? (l(), r("div", ss, [f[28] || (f[28] = t("span", null, null, -1)), Z(y(i(R)), 1)])) : M("", !0),
        ce.value ? (l(), r("aside", os, [t("p", null, y(ce.value), 1), t("button", {
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭三维提示",
          onClick: f[6] || (f[6] = (_) => ce.value = "")
        }, [S(E, { name: "close" })])])) : M("", !0),
        i(q) || i(h) || i(v).status === "conflict" ? (l(), r("aside", {
          key: 4,
          class: te(["map-notice", { "is-error": i(N) }]),
          role: "status"
        }, [t("p", null, y(i(q) || (i(h) ? "还不确定是否保存成功，请先检查保存。" : "服务器上的存档与当前内容不同。")), 1), i(h) ? (l(), r("button", {
          key: 0,
          type: "button",
          disabled: i(n),
          onClick: f[7] || (f[7] = (..._) => i(g) && i(g)(..._))
        }, "检查保存", 8, is)) : i(v).status === "conflict" ? (l(), r(I, { key: 1 }, [f[29] || (f[29] = t("small", null, "恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。", -1)), t("button", {
          type: "button",
          disabled: i(n),
          onClick: f[8] || (f[8] = (..._) => i(w) && i(w)(..._))
        }, "放弃未保存更改并恢复", 8, rs)], 64)) : i(v).status === "error" || i(v).status === "blocked" ? (l(), r("button", {
          key: 2,
          type: "button",
          disabled: i(n),
          onClick: f[9] || (f[9] = (..._) => i(m) && i(m)(..._))
        }, "重新加载", 8, us)) : (l(), r("button", {
          key: 3,
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭地图提示",
          onClick: f[10] || (f[10] = (..._) => i(F) && i(F)(..._))
        }, [S(E, { name: "close" })]))], 2)) : M("", !0)
      ], 512),
      t("div", { class: te(["map-canvas", { "has-detail": ie.value && !x.value }]) }, [i(v).map && pe.value ? (l(), r(I, { key: 0 }, [
        be.value.drawable ? Ue((l(), G(Ia, {
          key: 0,
          ref_key: "atlasElement",
          ref: d,
          active: !x.value,
          atlas: i(v).map.atlas,
          projection: be.value,
          label: ke.value,
          insets: i(b),
          "current-location-key": oe.value,
          "selected-location-key": O.value,
          "focus-key": z.value,
          "focus-sequence": Ee.value,
          onSelect: f[11] || (f[11] = (_) => ge(_))
        }, null, 8, [
          "active",
          "atlas",
          "projection",
          "label",
          "insets",
          "current-location-key",
          "selected-location-key",
          "focus-key",
          "focus-sequence"
        ])), [[at, !x.value]]) : M("", !0),
        x.value ? (l(), r(I, { key: 1 }, [Oe.value?.status === "active" ? (l(), G(Gn, {
          key: Oe.value.key,
          mode: Q.value,
          "onUpdate:mode": f[12] || (f[12] = (_) => Q.value = _),
          scene: Oe.value,
          "three-unavailable": ee.value,
          onFallback: bt
        }, null, 8, [
          "mode",
          "scene",
          "three-unavailable"
        ])) : (l(), r("div", cs, [
          S(E, { name: "layers" }),
          t("h2", null, y(ve.value ? i(V).sceneEmpty : i(V).unknownLocation), 1),
          H.value && H.value !== oe.value ? (l(), r("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: f[13] || (f[13] = (_) => ne.value ? me(ne.value.key) : fe())
          }, y(ne.value ? i(V).regionMap : i(le).world), 1)) : (l(), r(I, { key: 1 }, [
            t("p", null, y(ve.value ? i(V).sceneUpdateHint : i(V).locationUpdateHint), 1),
            t("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: !!i(k),
              onClick: f[14] || (f[14] = (..._) => i(L) && i(L)(..._))
            }, y(i(n) ? i(V).updating : i(V).update), 9, ds),
            i(k) && !i(n) ? (l(), r("p", vs, y(i(k)), 1)) : M("", !0)
          ], 64))
        ]))], 64)) : M("", !0),
        !x.value && !be.value.drawable ? (l(), r("div", ps, [
          S(E, { name: "pin" }),
          t("h2", null, y(P.value.kind === "region" && !ne.value ? i(V).unknownRegion : Y.value.locations.length ? i(xe).empty : Ve.value.empty), 1),
          t("p", null, y(P.value.kind === "region" && !ne.value ? i(V).unknownRegionHint : Y.value.locations.length ? i(xe).emptyHint : Ve.value.emptyHint), 1),
          P.value.kind === "region" ? (l(), r("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: fe
          }, y(i(le).world), 1)) : (l(), r("button", {
            key: 1,
            type: "button",
            class: "map-secondary-button",
            disabled: !!i(k),
            onClick: f[15] || (f[15] = (..._) => i(L) && i(L)(..._))
          }, y(i(n) ? i(V).updating : i(V).update), 9, ms))
        ])) : M("", !0)
      ], 64)) : (l(), r("div", fs, [
        t("span", ys, [S(E, { name: "globe" })]),
        f[30] || (f[30] = t("small", null, "故事之外，还有一整个世界", -1)),
        t("h1", null, y(i(v).status === "loading" ? "正在打开地图…" : "下一站，去哪里？"), 1),
        f[31] || (f[31] = t("p", null, [
          Z("把世界设定画成地图，"),
          t("br"),
          Z("也为留白的地方添上值得探索的去处。")
        ], -1)),
        i(v).status !== "loading" ? (l(), r("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          disabled: !!i(k),
          onClick: f[16] || (f[16] = (..._) => i(T) && i(T)(..._))
        }, y(i(n) ? i(R) || "正在准备…" : "绘制世界地图"), 9, hs)) : M("", !0),
        i(k) && !i(n) ? (l(), r("p", bs, y(i(k)), 1)) : M("", !0)
      ]))], 2),
      D.value ? (l(), r("aside", ks, [
        f[32] || (f[32] = t("strong", null, "读懂这张地图", -1)),
        f[33] || (f[33] = t("p", null, [
          t("i", { class: "map-key-current" }),
          Z("你在这里 "),
          t("i", { class: "map-key-place" }),
          Z("可探索地点")
        ], -1)),
        t("p", null, y(i(xe).legend), 1),
        t("small", null, y(i(V).legend), 1)
      ])) : M("", !0),
      pe.value && !x.value ? (l(), r("div", {
        key: 1,
        ref_key: "bottomElement",
        ref: u,
        class: te(["map-atlas-bottom", { "has-detail": ie.value }])
      }, [ie.value && i(v).map ? (l(), G(Kl, {
        key: ie.value.key,
        location: ie.value,
        map: i(v).map,
        "current-key": oe.value,
        unlocated: yt.value,
        onClose: f[17] || (f[17] = (_) => O.value = ""),
        onScene: f[18] || (f[18] = (_) => Me(ie.value.key)),
        onExplore: f[19] || (f[19] = (_) => me(ie.value.key)),
        onSelect: f[20] || (f[20] = (_) => ge(_, !0))
      }, null, 8, [
        "location",
        "map",
        "current-key",
        "unlocated"
      ])) : (l(), r("button", {
        key: 1,
        type: "button",
        class: "map-region-card",
        "aria-label": i(St)(Y.value.kind, We.value),
        "aria-describedby": "map-browse-summary",
        onClick: f[21] || (f[21] = (_) => J.value = We.value)
      }, [
        t("span", Ms, [S(E, { name: Y.value.kind === "world" ? "globe" : "compass" }, null, 8, ["name"])]),
        t("span", ws, [t("strong", null, y(ke.value), 1), t("small", null, y(i(At)(Y.value.kind, Y.value.locations.length, Y.value.unvisited)), 1)]),
        t("span", $s, [S(E, { name: "next" })])
      ], 8, gs)), t("div", _s, [be.value.drawable ? (l(), G(vt, {
        key: 0,
        onZoom: f[22] || (f[22] = (_) => d.value?.zoom(_)),
        onReset: f[23] || (f[23] = (_) => d.value?.reset())
      })) : M("", !0), t("div", xs, [t("button", {
        type: "button",
        class: "map-round-button",
        disabled: !de.value,
        "aria-label": "回到我的位置",
        onClick: ht
      }, [S(E, { name: "locate" })], 8, Cs), t("button", {
        type: "button",
        class: "map-round-button",
        "aria-expanded": D.value,
        "aria-label": "地图图例",
        onClick: f[24] || (f[24] = (_) => D.value = !D.value)
      }, [S(E, { name: "layers" })], 8, Ss)])])], 2)) : M("", !0),
      x.value && K.value?.locations.length ? (l(), r("footer", js, [S(E, { name: "layers" }), t("span", null, [t("strong", null, y(ve.value?.name || "当前位置待确认"), 1), t("small", null, y(H.value ? "正在查看场景图 · 不会移动人物" : "当前位置的场景图"), 1)])])) : M("", !0),
      J.value && K.value ? (l(), G(Cl, {
        key: 3,
        scope: Y.value,
        title: ke.value,
        "initial-filter": J.value,
        onClose: f[25] || (f[25] = (_) => J.value = null),
        onSelect: f[26] || (f[26] = (_) => ge(_))
      }, null, 8, [
        "scope",
        "title",
        "initial-filter"
      ])) : M("", !0),
      se.value ? (l(), G(pl, {
        key: 4,
        "auto-maintenance": i(v).autoMaintenance,
        busy: i(n),
        "refresh-disabled": i(h),
        "auto-toggle-busy": i(p) !== null,
        "disabled-reason": i(k),
        "has-map": !!i(v).map,
        status: i(R),
        "maintenance-message": i(v).maintenanceMessage || "",
        "maintenance-error": i(v).maintenanceStatus === "error",
        notice: i(q),
        "notice-error": i(N),
        onClose: f[27] || (f[27] = (_) => se.value = !1),
        onSetAuto: i(A),
        onUpdate: i(L),
        onRebuild: i(T),
        onRefresh: i(m)
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
      ])) : M("", !0)
    ], 2));
  }
}), Ns = As;
export {
  Ns as default
};
