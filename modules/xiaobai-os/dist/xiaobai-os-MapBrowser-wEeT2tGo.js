/* eslint-disable */
import { $ as Ne, A as je, D as q, E as z, J as be, M as ze, P as Ue, Q as Ve, R as Ae, S as v, T as D, U as Z, V as c, W as ie, X as ne, b as F, d as ht, dt as Le, f as Qe, ft as w, h as O, lt as b, m as Ce, p as Ge, q as we, r as pt, rt as V, ut as J, v as A, w as ft, x as $, y as s } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as yt } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { t as gt } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
function mt(e, n) {
  const o = /* @__PURE__ */ new Set(), t = e.ownerDocument, l = [
    "pointerup",
    "pointercancel",
    "lostpointercapture"
  ];
  function u() {
    for (const a of l) t.removeEventListener(a, h, !0);
    t.removeEventListener("visibilitychange", d);
  }
  function h(a) {
    o.delete(a.pointerId) && (o.size || u(), (a.type === "lostpointercapture" || !a.composedPath().includes(e)) && n(a.pointerId));
  }
  function i() {
    const a = [...o];
    o.clear(), u();
    for (const p of a) n(p);
  }
  function d() {
    t.hidden && i();
  }
  function y(a) {
    if (!o.size) {
      for (const p of l) t.addEventListener(p, h, !0);
      t.addEventListener("visibilitychange", d);
    }
    o.add(a.pointerId);
  }
  return e.addEventListener("pointerdown", y, !0), {
    cancel: i,
    dispose() {
      e.removeEventListener("pointerdown", y, !0), i();
    }
  };
}
var bt = { class: "map-viewport" }, wt = ["viewBox", "aria-label"], kt = {
  class: "map-viewport-controls",
  "aria-label": "地图缩放"
}, Mt = /* @__PURE__ */ q({
  __name: "MapViewport",
  props: {
    viewBox: {},
    resetKey: { default: "" },
    label: {},
    focusPoint: { default: void 0 },
    focusSequence: { default: 0 }
  },
  setup(e) {
    const n = e, o = V(null), t = V([...n.viewBox]), l = V([0, 0]), u = A(() => l.value[0] && l.value[1] ? Math.max(t.value[2] / l.value[0], t.value[3] / l.value[1]) : 1);
    let h, i;
    Ae(() => {
      i = mt(o.value, Y), h = new ResizeObserver((x) => {
        const P = x[0].contentRect;
        l.value = [P.width, P.height], (!P.width || !P.height) && i?.cancel();
      }), o.value && h.observe(o.value);
    });
    const d = /* @__PURE__ */ new Map();
    let y = null, a = [0, 0], p = 0, f = null, r = !1, m = !1, M = null;
    const k = A(() => t.value.join(" "));
    function S() {
      t.value = [...n.viewBox];
    }
    function g() {
      return u.value;
    }
    function C(x, P) {
      const B = o.value?.getBoundingClientRect();
      if (!B) return [t.value[0], t.value[1]];
      const K = g();
      return [t.value[0] + t.value[2] / 2 + (x - B.left - B.width / 2) * K, t.value[1] + t.value[3] / 2 + (P - B.top - B.height / 2) * K];
    }
    function E(x, P) {
      const B = Math.max(1, n.viewBox[2]), K = Math.min(B * 3, Math.max(Math.min(B * 0.24, 240), t.value[2] * x)), G = K / t.value[2], re = P || [t.value[0] + t.value[2] / 2, t.value[1] + t.value[3] / 2];
      t.value = [
        re[0] - (re[0] - t.value[0]) * G,
        re[1] - (re[1] - t.value[1]) * G,
        K,
        t.value[3] * G
      ];
    }
    function R() {
      if (!n.focusPoint) return;
      const x = Math.min(t.value[2], 620), P = t.value[3] * x / t.value[2];
      t.value = [
        n.focusPoint[0] - x / 2,
        n.focusPoint[1] - P / 2,
        x,
        P
      ];
    }
    function U() {
      const x = [...d.values()].map((P) => P.position);
      x.length === 1 && (y = x[0], a = [t.value[0], t.value[1]]), x.length === 2 && (p = Math.hypot(x[1][0] - x[0][0], x[1][1] - x[0][1]), f = [(x[0][0] + x[1][0]) / 2, (x[0][1] + x[1][1]) / 2], r = !0);
    }
    function H(x) {
      if (x.button !== 0 || d.size >= 2) return;
      d.size || (r = !1);
      const P = x.target;
      d.set(x.pointerId, {
        position: [x.clientX, x.clientY],
        target: P
      }), P.setPointerCapture(x.pointerId), U();
    }
    function I(x) {
      const P = d.get(x.pointerId);
      if (!P) return;
      P.position = [x.clientX, x.clientY];
      const B = [...d.values()].map((K) => K.position);
      if (B.length === 2 && f) {
        const K = Math.hypot(B[1][0] - B[0][0], B[1][1] - B[0][1]), G = [(B[0][0] + B[1][0]) / 2, (B[0][1] + B[1][1]) / 2];
        K > 0 && p > 0 && E(p / K, C(...f)), t.value[0] -= (G[0] - f[0]) * g(), t.value[1] -= (G[1] - f[1]) * g(), p = K, f = G;
      } else if (y) {
        const K = x.clientX - y[0], G = x.clientY - y[1];
        Math.abs(K) + Math.abs(G) > 4 && (r = !0), t.value = [
          a[0] - K * g(),
          a[1] - G * g(),
          t.value[2],
          t.value[3]
        ];
      }
    }
    function Y(x) {
      const P = d.get(x);
      P && (d.delete(x), P.target.hasPointerCapture(x) && P.target.releasePointerCapture(x), U(), d.size || (y = null, f = null), r && (m = !0, M && clearTimeout(M), M = setTimeout(() => {
        m = !1;
      }, 0)));
    }
    function ee(x) {
      m && (x.preventDefault(), x.stopPropagation());
    }
    return ne(() => n.resetKey, S, { immediate: !0 }), ne(() => n.focusSequence, R, { flush: "post" }), Ue(() => {
      i?.dispose(), h?.disconnect(), M && clearTimeout(M);
    }), (x, P) => (c(), v("div", bt, [(c(), v("svg", {
      ref_key: "svg",
      ref: o,
      class: "map-viewport-svg",
      viewBox: k.value,
      preserveAspectRatio: "xMidYMid meet",
      role: "group",
      "aria-label": e.label,
      onWheel: P[0] || (P[0] = Ce((B) => E(B.deltaY < 0 ? 0.84 : 1.19, C(B.clientX, B.clientY)), ["prevent"])),
      onPointerdown: H,
      onPointermove: I,
      onPointerup: P[1] || (P[1] = (B) => Y(B.pointerId)),
      onPointercancel: P[2] || (P[2] = (B) => Y(B.pointerId)),
      onClickCapture: ee
    }, [ie(x.$slots, "default", { unitScale: u.value })], 40, wt)), s("div", kt, [
      s("button", {
        type: "button",
        "aria-label": "放大地图",
        onClick: P[3] || (P[3] = (B) => E(0.8))
      }, "+"),
      s("button", {
        type: "button",
        "aria-label": "缩小地图",
        onClick: P[4] || (P[4] = (B) => E(1.25))
      }, "−"),
      s("button", {
        type: "button",
        class: "map-fit",
        onClick: S
      }, "全图")
    ])]));
  }
}), Ye = Mt, _t = {
  class: "map-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, $t = ["d"], xt = /* @__PURE__ */ q({
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
    return (o, t) => (c(), v("svg", _t, [s("path", { d: n[e.name] || n.pin }, null, 8, $t)]));
  }
}), T = xt;
function oe(e) {
  return e.scale === "region";
}
function Lt(e) {
  return e.scale !== "world" && !oe(e);
}
function ke(e, n) {
  const o = new Map(e.locations.map((u) => [u.key, u])), t = [];
  let l = o.get(n);
  for (; l; )
    t.unshift(l), l = l.parent ? o.get(l.parent) : void 0;
  return t;
}
function Se(e, n) {
  return ke(e, n).reverse().find(oe);
}
function Ct(e) {
  const n = /* @__PURE__ */ new Set(), o = e.actors.find((t) => t.actorKey === "player")?.locationKey;
  for (const t of e.locations)
    if (!(t.status !== "visited" && t.key !== o))
      for (const l of ke(e, t.key)) n.add(l.key);
  return n;
}
function Oe(e, n, o) {
  const t = new Set(o.map((l) => l.key));
  return ke(e, n).reverse().find((l) => t.has(l.key))?.key || "";
}
function St(e, n) {
  return e.links.flatMap((o) => {
    if (o.from !== n && o.to !== n) return [];
    const t = e.locations.find((l) => l.key === (o.from === n ? o.to : o.from));
    return t ? [{
      location: t,
      link: o,
      outgoing: o.bidirectional || o.from === n
    }] : [];
  });
}
function jt(e, n) {
  const o = [...n.locations].sort((a, p) => a.key.localeCompare(p.key, "en")), t = (a) => a.position && (a.parent || "") === n.positionParent, l = o.filter(t).map((a) => ({
    location: a,
    x: a.position[0],
    y: a.position[1],
    placed: !0
  }));
  let u = 0;
  for (const a of o.filter((p) => !t(p))) {
    let p, f;
    do {
      const r = u * 2.3999632297, m = 155 * Math.sqrt(u++);
      p = Math.round(500 + Math.cos(r) * m), f = Math.round(420 + Math.sin(r) * m);
    } while (l.some((r) => Math.hypot(r.x - p, r.y - f) < 160));
    l.push({
      location: a,
      x: p,
      y: f,
      placed: !1
    });
  }
  l.sort((a, p) => a.location.key.localeCompare(p.location.key, "en"));
  const h = new Map(l.map((a) => [a.location.key, a])), i = e.links.flatMap((a) => {
    const p = h.get(Oe(e, a.from, o)), f = h.get(Oe(e, a.to, o));
    if (!p || !f || p === f) return [];
    const r = (p.x + f.x) / 2, m = (p.y + f.y) / 2;
    return [{
      link: a,
      from: p,
      to: f,
      x: r,
      y: m,
      path: `M ${p.x} ${p.y} Q ${r + (f.y - p.y) * 0.12} ${m - (f.x - p.x) * 0.12} ${f.x} ${f.y}`
    }];
  }), d = l.length ? Math.min(...l.map((a) => a.x)) - 140 : 0, y = l.length ? Math.min(...l.map((a) => a.y)) - 150 : 0;
  return {
    nodes: l,
    routes: i,
    viewBox: [
      d,
      y,
      l.length ? Math.max(420, Math.max(...l.map((a) => a.x)) - d + 140) : 800,
      l.length ? Math.max(500, Math.max(...l.map((a) => a.y)) - y + 190) : 900
    ]
  };
}
var me = {
  label: "投影地图",
  empty: "还没有地图",
  description: "将地图投影到最后一个AI楼层末尾显示。",
  enabled: "地图投影已开启。",
  disabled: "地图投影已关闭。",
  views: {
    world: "世界",
    region: "地区",
    scene: "场景"
  },
  options: "地图显示选项",
  location: "回到当前位置",
  loadFailed: "地图投影加载失败，请刷新页面重试。"
}, X = {
  mode: "场景显示方式",
  two: "二维",
  three: "三维",
  lowWalls: "低墙",
  labels: "名称"
}, te = {
  world: "世界地图",
  region: "当前地区",
  scene: "当前场景"
}, de = {
  visited: "已到访",
  unvisited: "未到访"
}, Me = {
  world: {
    unit: "地区",
    search: "搜索地区",
    all: "全部地区",
    empty: "还没有记录地区",
    emptyHint: "更新地图后，可根据设定与剧情补充地区。",
    notFound: "没有找到符合条件的地区"
  },
  region: {
    unit: "场景",
    search: "搜索本地区场景",
    all: "全部场景",
    empty: "这个地区还没有记录场景",
    emptyHint: "可以查看其他地区，或更新地图补充。",
    notFound: "没有找到符合条件的场景"
  }
}, N = {
  loading: "正在打开地图…",
  viewLabel: "地图视图",
  trailLabel: "当前查看位置",
  unknownRegion: "所属地区待确认",
  unknownRegionHint: "地图还没有记录当前位置所属的地区。",
  regionMap: "查看地区地图",
  sceneMap: "查看场景图",
  cancel: "取消",
  filters: "到访筛选",
  searchHint: "试试其他名称或筛选条件。",
  update: "更新地图",
  updating: "正在更新…",
  sceneBrowsing: "正在查看已记录的场景",
  sceneCurrent: "看看你身边的布局",
  sceneEmpty: "这里的布局还没画出来",
  unknownLocation: "还不知道你在哪里",
  sceneUpdateHint: "更新地图后，会结合设定与剧情补齐这里的普通布局。",
  locationUpdateHint: "更新地图后，会根据剧情确认你所在的地方。",
  legend: "世界图展示地区，地区图展示所属场景；场景图展示一个地点的内部布局。地图不按实际比例。",
  legendLabel: "地图图例",
  legendTitle: "读懂这张地图",
  legendCurrent: "你在这里",
  legendPlace: "可探索地点",
  legendRoutes: "路线连接已记录的地点；箭头表示单向通行。"
};
function Xe(e, n) {
  return `${n} 个${Me[e].unit}`;
}
function Ot(e, n, o) {
  return `${Xe(e, n)} · ${o} 个${de.unvisited}`;
}
function Et(e, n) {
  return `查看${n === "all" ? "" : de[n]}${Me[e].unit}`;
}
var At = {
  class: "map-landscapes",
  "aria-hidden": "true"
}, Pt = ["transform"], zt = {
  class: "map-world-roads",
  "aria-hidden": "true"
}, It = ["d"], Bt = ["d", "marker-end"], Tt = ["x", "y"], Ht = [
  "transform",
  "aria-label",
  "onClick",
  "onKeydown"
], Rt = { transform: "translate(-14 -20)" }, Nt = {
  y: "64",
  class: "map-place-name"
}, Ut = {
  key: 0,
  y: "89",
  class: "map-place-status"
}, Vt = {
  key: 1,
  y: "89",
  class: "map-place-status"
}, Kt = /* @__PURE__ */ q({
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
  setup(e) {
    const n = e, o = A(() => jt(n.atlas, n.scope)), t = A(() => Oe(n.atlas, n.currentLocationKey, n.scope.locations)), l = A(() => o.value.nodes.find((i) => i.location.key === n.focusKey)), u = "map-arrow-" + we();
    function h(i, d) {
      return i === "water" ? "water" : i === "forest" ? "tree" : i === "mountain" ? "mountain" : ["world", "region"].includes(d) ? "globe" : d === "outdoor" ? "compass" : "building";
    }
    return (i, d) => (c(), F(Ye, {
      "view-box": o.value.viewBox,
      "reset-key": `${e.scope.kind}:${e.scope.region?.key || ""}`,
      label: e.label,
      "focus-point": l.value ? [l.value.x, l.value.y] : void 0,
      "focus-sequence": e.focusSequence
    }, {
      default: Ve(({ unitScale: y }) => [
        s("defs", null, [s("marker", {
          id: u,
          viewBox: "0 0 10 10",
          refX: "16",
          refY: "5",
          markerWidth: "5",
          markerHeight: "5",
          orient: "auto"
        }, [...d[0] || (d[0] = [s("path", {
          d: "M1 1l8 4-8 4z",
          fill: "var(--map-road-ink)"
        }, null, -1)])])]),
        s("g", At, [(c(!0), v(O, null, Z(o.value.nodes, (a) => (c(), v("g", {
          key: a.location.key,
          transform: `translate(${a.x} ${a.y})`,
          class: J(`is-${a.location.terrain || "urban"}`)
        }, [...d[1] || (d[1] = [s("path", { d: "M-108-20Q-100-100-32-94T87-56Q127-13 99 48T21 99Q-57 113-90 65T-108-20Z" }, null, -1), s("path", {
          class: "map-contour",
          d: "M-133-22Q-124-126-39-116T110-70Q156-17 124 60T26 123Q-71 139-112 81T-133-22Z"
        }, null, -1)])], 10, Pt))), 128))]),
        s("g", zt, [(c(!0), v(O, null, Z(o.value.routes, (a) => (c(), v("g", {
          key: a.link.id,
          class: J({
            "is-path": a.link.kind === "path",
            "is-portal": a.link.kind === "portal"
          })
        }, [
          s("path", {
            class: "map-road-casing",
            d: a.path
          }, null, 8, It),
          s("path", {
            class: "map-road-line",
            d: a.path,
            "marker-end": a.link.bidirectional ? void 0 : `url(#${u})`
          }, null, 8, Bt),
          a.link.label ? (c(), v("text", {
            key: 0,
            x: a.x,
            y: a.y - 14
          }, w(a.link.label), 9, Tt)) : $("", !0)
        ], 2))), 128))]),
        (c(!0), v(O, null, Z(o.value.nodes, (a) => (c(), v("g", {
          key: a.location.key,
          class: J(["map-place", {
            "is-selected": a.location.key === e.selectedLocationKey,
            "is-current": a.location.key === t.value,
            "is-unvisited": a.location.status !== "visited"
          }]),
          transform: `translate(${a.x} ${a.y}) scale(${y * 0.5})`,
          role: "button",
          tabindex: "0",
          "aria-label": `查看${a.location.name}`,
          onClick: Ce((p) => i.$emit("select", a.location.key), ["stop"]),
          onKeydown: [Ge(Ce((p) => i.$emit("select", a.location.key), ["stop"]), ["enter"]), Ge(Ce((p) => i.$emit("select", a.location.key), ["stop", "prevent"]), ["space"])]
        }, [
          d[2] || (d[2] = s("circle", {
            class: "map-pin-halo",
            r: "39"
          }, null, -1)),
          d[3] || (d[3] = s("path", {
            class: "map-pin-body",
            d: "M0 33C-6 25-26 8-26-6a26 26 0 0 1 52 0C26 8 6 25 0 33Z"
          }, null, -1)),
          s("g", Rt, [z(T, {
            name: h(a.location.terrain, a.location.scale),
            width: "28",
            height: "28"
          }, null, 8, ["name"])]),
          s("text", Nt, w(a.location.name.length > 14 ? a.location.name.slice(0, 13) + "…" : a.location.name), 1),
          a.location.key === t.value ? (c(), v("text", Ut, "你在这里")) : a.location.status !== "visited" ? (c(), v("text", Vt, w(b(de).unvisited), 1)) : $("", !0),
          s("title", null, w(a.location.name) + w(a.location.brief ? " · " + a.location.brief : ""), 1)
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
}), Zt = Kt, ge;
async function Je() {
  if (!ge) {
    const e = [
      "..",
      "..",
      "..",
      "libs",
      "material-symbols",
      "material-symbols-rounded.woff2"
    ].join("/"), n = new URL(e, import.meta.url);
    ge = new FontFace("Xiaobai Map Symbols", `url("${n.href}")`, {
      display: "block",
      weight: "400"
    }).load(), ge.catch(() => {
      ge = void 0;
    });
  }
  document.fonts.add(await ge);
}
var Bs = Object.freeze([
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
]), Ts = Object.freeze([
  "rect",
  "circle",
  "path",
  "curve",
  "icon",
  "label"
]), Hs = Object.freeze([
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
]), Gt = Object.freeze([
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
  "shadow",
  "flesh",
  "slime"
]), Rs = Object.freeze([
  "confirmed",
  "inferred",
  "unknown"
]), Ns = Object.freeze(["indoor", "outdoor"]), Us = Object.freeze([
  "sunlight",
  "daylight",
  "night"
]), Vs = Object.freeze(["on", "off"]), qt = Object.freeze([
  {
    name: "Seating and sleeping",
    icons: [
      "chair",
      "stool",
      "bench",
      "sofa",
      "bed"
    ],
    hint: "chair has a back; stool has none; bench is a long shared seat."
  },
  {
    name: "Surfaces and storage",
    icons: [
      "table",
      "counter",
      "shelf",
      "cabinet",
      "chest",
      "barrel"
    ],
    hint: "shelf is open shelving; cabinet is closed storage; chest is a box; barrel covers barrels and jars."
  },
  {
    name: "Kitchen and bathroom",
    icons: [
      "stove",
      "refrigerator",
      "sink",
      "toilet",
      "bathtub"
    ],
    hint: ""
  },
  {
    name: "Equipment and vehicles",
    icons: [
      "terminal",
      "machine",
      "vending-machine",
      "car"
    ],
    hint: "terminal is an operator console; machine is general machinery."
  },
  {
    name: "Site fixtures",
    icons: [
      "column",
      "partition",
      "fence",
      "door-open",
      "ladder",
      "statue",
      "well",
      "fountain",
      "bridge",
      "tent"
    ],
    hint: "partition is a freestanding screen; fence follows a path; door-open is an entrance marker, not evidence of an open door; ladder is a standalone ladder, not stairs or a floor connection."
  },
  {
    name: "Plants and natural objects",
    icons: [
      "tree",
      "potted-plant",
      "rock"
    ],
    hint: "tree is one tree; a forest is terrain with material forest."
  },
  {
    name: "Growing forms and conduits",
    icons: [
      "vine",
      "root",
      "tentacle",
      "pipe"
    ],
    hint: "Use an open path/curve along the centreline, from base to tip. Thickness and surface details are drawn by the app."
  },
  {
    name: "Natural formations",
    icons: ["mushroom", "crystal"],
    hint: "Use a rect/circle footprint for one formation."
  },
  {
    name: "Creatures",
    icons: [
      "slime",
      "dragon",
      "dwarf",
      "elf"
    ],
    hint: "Actors keep their identity and location marker. A rect/circle also gives their occupied size; a point is only a symbol."
  },
  {
    name: "Lighting and signs",
    icons: [
      "light",
      "fire",
      "flag",
      "sign"
    ],
    hint: "light is a freestanding fixture; light regions use category light without an object icon."
  }
]), et = Object.freeze(qt.flatMap((e) => [...e.icons])), Ks = Object.freeze([
  ...et,
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
  "marker",
  "player",
  "actor",
  "building",
  "water"
]), Zs = Object.freeze(/* @__PURE__ */ new Set([
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
])), Dt = Object.freeze({
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
  shadow: "#758079",
  flesh: "#aa657e",
  slime: "#6dbfa4"
});
function tt(e, n) {
  return `url(#${n}-material-${e || "unknown"})`;
}
function Wt(e, n) {
  return `url(#${n}-face-${e || "unknown"})`;
}
function fe(e) {
  return `color-mix(in srgb, ${Dt[e]}, var(--map-surface) var(--scene-material-mix))`;
}
var Ft = ["id"], Qt = ["stop-color", "stop-opacity"], Yt = ["stop-color", "stop-opacity"], Xt = ["stop-color", "stop-opacity"], Jt = ["id"], ea = ["fill", "fill-opacity"], ta = {
  fill: "none",
  stroke: "var(--scene-shadow)",
  "stroke-width": ".65",
  opacity: ".24"
}, aa = {
  key: 1,
  d: "M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21"
}, na = {
  key: 2,
  d: "M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z"
}, oa = {
  key: 3,
  d: "M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17",
  opacity: ".65"
}, sa = {
  key: 4,
  d: "M3 8q6 3 13 0M25 25q7 2 17-1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.3",
  opacity: "1"
}, ra = {
  key: 5,
  d: "M5 32 37 0M12 32 44 0",
  stroke: "var(--scene-highlight)",
  "stroke-width": "2.2"
}, la = {
  key: 6,
  d: "M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3"
}, ia = {
  key: 7,
  d: "M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2",
  "stroke-linecap": "round"
}, ca = {
  key: 8,
  d: "M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1"
}, ua = {
  key: 9,
  d: "M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32",
  opacity: ".55"
}, da = {
  key: 10,
  d: "m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8"
}, va = {
  key: 11,
  d: "M7 8q12-5 16 6t20 7M4 27l6-3"
}, ha = {
  key: 12,
  d: "M-3 4Q12 18 24 7T52 12M4 32Q18 17 34 29"
}, pa = {
  key: 13,
  d: "M5 13Q10 4 19 9M28 28Q35 19 43 24",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.5"
}, fa = {
  key: 14,
  d: "M5 19q5-3 11-1M29 8q6-2 12 1",
  stroke: "var(--scene-highlight)",
  "stroke-width": "1.4"
}, ya = {
  key: 0,
  d: "M0 1H48",
  stroke: "var(--scene-highlight)",
  "stroke-width": ".7",
  opacity: ".35"
}, ga = ["id"], ma = ["id"], ba = ["transform", "fill"], wa = /* @__PURE__ */ q({
  __name: "SceneMaterials",
  props: { prefix: {} },
  setup(e) {
    return (n, o) => (c(), v("defs", null, [
      (c(!0), v(O, null, Z(b(Gt), (t) => (c(), v(O, { key: t }, [s("linearGradient", {
        id: `${e.prefix}-face-${t}`,
        x1: "0",
        y1: "0",
        x2: ".7",
        y2: "1"
      }, [
        s("stop", {
          offset: "0",
          "stop-color": `color-mix(in srgb, ${b(fe)(t)}, var(--scene-highlight) 24%)`,
          "stop-opacity": t === "glass" ? 0.35 : 1
        }, null, 8, Qt),
        s("stop", {
          offset: ".52",
          "stop-color": b(fe)(t),
          "stop-opacity": t === "glass" ? 0.16 : 1
        }, null, 8, Yt),
        s("stop", {
          offset: "1",
          "stop-color": `color-mix(in srgb, ${b(fe)(t)}, var(--scene-shadow) 16%)`,
          "stop-opacity": t === "glass" ? 0.28 : 1
        }, null, 8, Xt)
      ], 8, Ft), s("pattern", {
        id: `${e.prefix}-material-${t}`,
        width: "48",
        height: "32",
        patternUnits: "userSpaceOnUse",
        class: "scene-texture"
      }, [
        s("rect", {
          width: "48",
          height: "32",
          fill: b(fe)(t),
          "fill-opacity": t === "glass" ? 0.4 : 1
        }, null, 8, ea),
        s("g", ta, [t === "wood" ? (c(), v(O, { key: 0 }, [o[0] || (o[0] = s("path", { d: "M0 0H48M0 16H48M19 0V16M37 16V32" }, null, -1)), o[1] || (o[1] = s("path", {
          d: "M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1",
          opacity: ".5"
        }, null, -1))], 64)) : t === "stone" ? (c(), v("path", aa)) : t === "tile" ? (c(), v("path", na)) : t === "marble" ? (c(), v("path", oa)) : t === "water" ? (c(), v("path", sa)) : t === "glass" ? (c(), v("path", ra)) : t === "grass" || t === "forest" ? (c(), v("path", la)) : t === "dirt" || t === "sand" ? (c(), v("path", ia)) : t === "metal" ? (c(), v("path", ca)) : [
          "carpet",
          "fabric",
          "bed-sheet",
          "tatami"
        ].includes(t) ? (c(), v("path", ua)) : t === "rune" ? (c(), v("path", da)) : t === "blood" ? (c(), v("path", va)) : t === "flesh" ? (c(), v("path", ha)) : t === "slime" ? (c(), v("path", pa)) : t === "snow" ? (c(), v("path", fa)) : $("", !0)]),
        t === "wood" || t === "stone" || t === "metal" ? (c(), v("path", ya)) : $("", !0)
      ], 8, Jt)], 64))), 128)),
      s("radialGradient", {
        id: `${e.prefix}-crown-face`,
        cx: ".32",
        cy: ".25",
        r: ".8"
      }, [...o[2] || (o[2] = [
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
      ])], 8, ga),
      (c(), v(O, null, Z(3, (t) => s("symbol", {
        id: `${e.prefix}-crown-${t - 1}`,
        key: t,
        viewBox: "0 0 100 100"
      }, [s("g", {
        transform: `rotate(${t * 37} 50 50)`,
        fill: `url(#${e.prefix}-crown-face)`,
        stroke: "var(--scene-leaf-dark)",
        "stroke-width": ".6"
      }, [...o[3] || (o[3] = [
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
      ])], 8, ba)], 8, ma)), 64))
    ]));
  }
}), ka = wa, Ke = {
  sand: {
    color: "#dfc68d",
    size: 4.2,
    relief: 0.075,
    roughness: 0.94
  },
  stone: {
    color: "#aeb8bc",
    size: 4.8,
    relief: 0.11,
    roughness: 0.88
  },
  dirt: {
    color: "#aa8965",
    size: 3.8,
    relief: 0.1,
    roughness: 0.96
  },
  grass: {
    color: "#8eae68",
    size: 3.6,
    relief: 0.075,
    roughness: 0.94
  },
  forest: {
    color: "#82916a",
    size: 3.6,
    relief: 0.08,
    roughness: 0.97
  },
  snow: {
    color: "#edf4f6",
    size: 5.2,
    relief: 0.09,
    roughness: 0.68
  },
  marble: {
    color: "#e3e9e8",
    size: 5.4,
    relief: 9e-3,
    roughness: 0.24
  },
  wood: {
    color: "#c4a077",
    size: 4.2,
    relief: 0.045,
    roughness: 0.62
  },
  tile: {
    color: "#d7e2e2",
    size: 3.2,
    relief: 0.035,
    roughness: 0.32
  }
};
function at(e) {
  return !!e && Object.hasOwn(Ke, e);
}
var ye = (e, n = 0, o = 1) => Math.max(n, Math.min(o, e)), Q = (e, n) => (e % n + n) % n, ue = (e, n, o) => {
  const t = ye((o - e) / (n - e));
  return t * t * (3 - 2 * t);
}, ae = Math.PI * 2;
function W(e, n, o = 0) {
  let t = Math.imul(e + 17, 374761393) ^ Math.imul(n + 41, 668265263) ^ Math.imul(o + 1, 1274126177);
  return t = Math.imul(t ^ t >>> 13, 1274126177), ((t ^ t >>> 16) >>> 0) / 4294967296;
}
function Ma() {
  const e = /* @__PURE__ */ new Map();
  return (n, o, t, l = 0) => {
    const u = t * 100 + l;
    let h = e.get(u);
    h || (h = Float64Array.from({ length: t * t }, (S, g) => W(g % t, Math.floor(g / t), l)), e.set(u, h));
    const i = n * t, d = o * t, y = Math.floor(i), a = Math.floor(d), p = ue(0, 1, i - y), f = ue(0, 1, d - a), r = Q(y, t), m = Q(y + 1, t), M = Q(a, t) * t, k = Q(a + 1, t) * t;
    return (h[M + r] * (1 - p) + h[M + m] * p) * (1 - f) + (h[k + r] * (1 - p) + h[k + m] * p) * f;
  };
}
function qe(e, n, o) {
  const t = e * o, l = n * o, u = Math.floor(t), h = Math.floor(l);
  let i = 1 / 0, d = 1 / 0, y = 0;
  for (let a = -1; a <= 1; a++) for (let p = -1; p <= 1; p++) {
    const f = u + p, r = h + a, m = Q(f, o), M = Q(r, o), k = (t - f - 0.15 - W(m, M, 3) * 0.7) ** 2 + (l - r - 0.15 - W(m, M, 7) * 0.7) ** 2;
    k < i ? (d = i, i = k, y = W(m, M, 11)) : k < d && (d = k);
  }
  return {
    distance: Math.sqrt(i),
    edge: Math.sqrt(d) - Math.sqrt(i),
    shade: y
  };
}
function _a(e) {
  const o = Ke[e], t = Ma(), l = new Uint8Array(256 * 256 * 4), u = new Uint8Array(256 * 256), h = new Uint8Array(256 * 256), i = [
    1,
    3,
    5
  ].map((d) => Number.parseInt(o.color.slice(d, d + 2), 16));
  for (let d = 0; d < 256; d++) for (let y = 0; y < 256; y++) {
    const a = y / 256, p = d / 256, f = W(y, d), r = t(a, p, 4);
    let m = 1, M = 0.5, k = o.roughness;
    if (e === "sand") {
      const g = p * 8 + Math.sin(a * ae) * 0.65 + r * 0.9, C = (0.5 + 0.5 * Math.sin(g * ae)) ** 3;
      m = 0.89 + C * 0.12 + f * 0.045, M = 0.32 + C * 0.24 + f * 0.055, k += (f - 0.5) * 0.08;
    } else if (e === "stone") {
      const g = qe(a + t(a, p, 8, 1) * 0.065, p + r * 0.065, 5), C = ue(0.018, 0.075, g.edge), E = t(a, p, 24, 2);
      m = (0.72 + g.shade * 0.29 + E * 0.09) * (0.62 + C * 0.38), M = 0.18 + C * 0.4 + E * 0.11 + f * 0.035, k += -0.1 + E * 0.17 + (1 - C) * 0.05;
    } else if (e === "dirt") {
      const g = qe(a + t(a, p, 8, 3) * 0.05, p + r * 0.045, 13), C = (1 - ue(0.08, 0.35 + g.shade * 0.4, g.distance)) * (0.55 + g.shade * 0.45), E = f > 0.93 ? 0.12 : f < 0.1 ? -0.09 : 0;
      m = 0.69 + r * 0.29 + C * 0.14 + E, M = 0.23 + r * 0.27 + C * 0.27 + E * 0.5, k += -0.07 + (1 - C) * 0.11;
    } else if (e === "grass" || e === "forest") {
      const g = t(a, p, 12, 4);
      m = 0.66 + r * 0.24 + g * 0.23 + f * 0.045, M = 0.25 + r * 0.13 + g * 0.2, k += -0.045 + g * 0.09;
    } else if (e === "snow") {
      const g = t(a + 0.045 * Math.sin(p * ae), p, 3, 6), C = (0.5 + 0.5 * Math.sin((p * 2 + a + r * 0.7) * ae)) ** 5;
      m = 0.82 + g * 0.17 + C * 0.07 + f * 0.025, M = 0.2 + g * 0.42 + C * 0.2 + t(a, p, 16, 4) * 0.045, k += f > 0.985 ? -0.38 : -0.07 + g * 0.15;
    } else if (e === "marble") {
      const g = r * 1.7 + t(a, p, 8, 2) * 0.65 + t(a, p, 16, 3) * 0.17, C = Math.abs(Math.sin((a * 2 + p * 3 + g) * ae)), E = Math.exp(-C * 12), R = Math.exp(-C * 3), U = Math.exp(-Math.abs(Math.sin((a * 5 - p * 2 + g) * ae)) * 18);
      m = 0.98 + r * 0.06 - E * 0.25 - R * 0.12 - U * 0.08, M = 0.49 + t(a, p, 16) * 0.02, k += -0.03 + R * 0.09;
    } else if (e === "wood") {
      const g = Math.floor(p * 4), C = Q(a * 2 + g % 2 * 0.5, 1), E = 1 - ue(8e-3, 0.024, Math.min(Q(p * 4, 1), 1 - Q(p * 4, 1), C, 1 - C)), R = Math.sin((p * 76 + t(a, p, 8, 3) * 1.3) * ae);
      m = 0.83 + W(g, Math.floor(a * 2 + g % 2 * 0.5) % 2, 2) * 0.17 + R * 0.025 - E * 0.22, M = 0.55 - E * 0.3 + R * 0.02, k += -0.04 + E * 0.29 + R * 0.025;
    } else if (e === "tile") {
      const g = Q(a * 4, 1), C = Q(p * 4, 1), E = Math.min(g, 1 - g, C, 1 - C), R = 1 - ue(0.016, 0.035, E);
      m = 0.94 + W(Math.floor(a * 4), Math.floor(p * 4), 3) * 0.07 - R * 0.22, M = 0.53 * ue(5e-3, 0.048, E), k += -0.07 + R * 0.65 + r * 0.07;
    }
    const S = d * 256 + y;
    for (let g = 0; g < 3; g++) l[S * 4 + g] = Math.round(ye(i[g] * m, 0, 255));
    l[S * 4 + 3] = 255, u[S] = Math.round(ye(M) * 255), h[S] = Math.round(ye(k) * 255);
  }
  return (e === "grass" || e === "forest") && $a({
    size: 256,
    color: l,
    height: u,
    roughness: h
  }, e, t), {
    size: 256,
    color: l,
    height: u,
    roughness: h
  };
}
function $a(e, n, o) {
  const { size: t, color: l, height: u } = e, h = n === "grass", i = h ? 1200 : 850;
  for (let d = 0; d < i; d++) {
    const y = W(d, 1) * t, a = W(d, 2) * t, p = h ? -1 + o(y / t, a / t, 4, 8) * 2.5 + (W(d, 3) - 0.5) * 1.7 : W(d, 3) * ae, f = (h ? 6 : 3) + W(d, 4) * (h ? 16 : 6), r = Math.cos(p) * f, m = Math.sin(p) * f, M = h ? 1.1 : 1.8, k = W(d, 5), S = h ? [
      104 + k * 73,
      133 + k * 65,
      62 + k * 48
    ] : [
      111 + k * 69,
      103 + k * 45,
      58 + k * 33
    ];
    for (let g = Math.floor(Math.min(a, a + m) - M); g <= Math.ceil(Math.max(a, a + m) + M); g++) for (let C = Math.floor(Math.min(y, y + r) - M); C <= Math.ceil(Math.max(y, y + r) + M); C++) {
      const E = ye(((C - y) * r + (g - a) * m) / (f * f)), R = Math.hypot(C - y - r * E, g - a - m * E), U = ye(M * (h ? 1 - E * 0.8 : Math.sin(E * Math.PI)) + 0.4 - R) * 0.85;
      if (!U) continue;
      const H = Q(g, t) * t + Q(C, t);
      for (let I = 0; I < 3; I++) l[H * 4 + I] = Math.round(l[H * 4 + I] * (1 - U) + S[I] * U);
      u[H] = Math.round(u[H] * (1 - U) + (145 + E * 35) * U);
    }
  }
}
var xa = [
  "id",
  "width",
  "height"
], La = [
  "href",
  "width",
  "height"
], Ca = /* @__PURE__ */ q({
  __name: "SceneGroundMaterials",
  props: {
    prefix: {},
    materials: {},
    scale: {}
  },
  setup(e) {
    const n = e, o = /* @__PURE__ */ new Map(), t = A(() => {
      for (const l of o.keys()) n.materials.includes(l) || o.delete(l);
      return n.materials.map((l) => {
        if (!o.has(l)) {
          const { size: u, color: h, height: i } = _a(l), d = document.createElement("canvas");
          d.width = d.height = u;
          const y = d.getContext("2d"), a = y.createImageData(u, u);
          for (let p = 0; p < u; p++) for (let f = 0; f < u; f++) {
            const r = p * u + f, m = i[p * u + (f + u - 1) % u] - i[p * u + (f + 1) % u], M = i[(p + u - 1) % u * u + f] - i[(p + 1) % u * u + f], k = 1 + Math.max(-0.18, Math.min(0.18, (m + M) / 255 * 0.65));
            for (let S = 0; S < 3; S++) a.data[r * 4 + S] = h[r * 4 + S] * k;
            a.data[r * 4 + 3] = 255;
          }
          y.putImageData(a, 0, 0), o.set(l, d.toDataURL());
        }
        return {
          material: l,
          href: o.get(l),
          size: Ke[l].size * n.scale
        };
      });
    });
    return (l, u) => (c(), v("defs", null, [(c(!0), v(O, null, Z(t.value, (h) => (c(), v("pattern", {
      id: `${e.prefix}-ground-${h.material}`,
      key: h.material,
      width: h.size,
      height: h.size,
      patternUnits: "userSpaceOnUse"
    }, [s("image", {
      href: h.href,
      width: h.size,
      height: h.size,
      preserveAspectRatio: "none"
    }, null, 8, La)], 8, xa))), 128))]));
  }
}), Sa = Ca, Ee = {
  vine: {
    label: "藤蔓",
    path: "M5 22C19 17 4 8 17 2M9 17C2 18 2 11 3 10C9 10 11 13 9 17ZM11 11C18 12 21 7 20 5C13 5 11 7 11 11Z"
  },
  root: {
    label: "根",
    path: "M11 2H15L13 10L19 14L22 22L16 16L11 14L6 21L2 22L8 12Z"
  },
  tentacle: {
    label: "触手",
    path: "M3 22C3 10 16 16 17 9C18 4 12 2 11 7C8 4 11 1 15 2C23 4 22 14 14 16C8 18 12 21 12 22Z"
  },
  pipe: {
    label: "管道",
    path: "M2 17H10V5H22V10H15V22H2ZM18 3H22V12H18M2 15V24"
  },
  mushroom: {
    label: "菌菇",
    path: "M10 13H14L16 22H8ZM2 12C2 0 22 0 22 12Q12 16 2 12ZM7 9H9M14 7H16"
  },
  crystal: {
    label: "晶体",
    path: "M12 1L18 7L16 20L12 23L8 20L6 7ZM12 1V23M6 7L12 11L18 7M2 11L6 13L8 20L4 19ZM22 11L18 13L16 20L20 19Z"
  },
  slime: {
    label: "史莱姆",
    path: "M2 18C3 14 5 13 6 8C7 1 17 1 18 8C19 13 22 13 22 18C22 23 2 23 2 18ZM8 13V15M16 13V15"
  },
  dragon: {
    label: "龙",
    path: "M12 20L9 15L2 17L4 10L1 4L9 8L11 12V6L9 3L13 4L16 2L15 7L14 12L17 8L23 4L20 11L22 17L15 15L14 20L18 23Z"
  },
  dwarf: {
    label: "矮人",
    path: "M5 10C4 0 20 0 19 10ZM4 12L8 14L12 12L16 14L20 12L18 19L12 23L6 19ZM8 8H9M15 8H16"
  },
  elf: {
    label: "精灵",
    path: "M7 6Q12 0 17 6L17 10L23 7L19 15L16 15L15 20L12 23L9 20L8 15L5 15L1 7L7 10ZM9 11H10M14 11H15"
  }
};
function _e(e) {
  return e && Object.hasOwn(Ee, e) ? Ee[e] : void 0;
}
function Be(e, n) {
  return Math.max(e, n) / 14;
}
var ja = /* @__PURE__ */ new Set([
  "water",
  "terrain",
  "furniture",
  "decoration",
  "danger",
  "magic",
  "secret",
  "light"
]), Oa = new Set(et), Ea = /* @__PURE__ */ new Set([
  "chair",
  "table",
  "bed",
  "counter",
  "shelf",
  "sofa",
  "bridge",
  "tree",
  "rock"
]);
function Aa(e) {
  return !!e.icon && (Ea.has(e.icon) || !!_e(e.icon));
}
var ce = (e) => Number(e.toFixed(3)).toString(), $e = (e) => e.geometry.points || [];
function Te(e) {
  return e.shape === "icon" || e.shape === "label" || e.category === "actor" || e.category === "door" || e.kind === "stairs" || e.icon === "stairs" || e.icon === "door-open";
}
function xe(e) {
  return $e(e).length >= 3 && (e.closed ?? ja.has(e.category));
}
function ve(e) {
  return e.category === "wall" || e.category === "grid" || e.icon === "fence" && ["path", "curve"].includes(e.shape) ? !1 : e.shape === "rect" || e.shape === "circle" ? !0 : (e.shape === "path" || e.shape === "curve") && xe(e);
}
function He(e) {
  return ![
    "wall",
    "grid",
    "actor"
  ].includes(e.category) && (e.shape === "rect" || e.shape === "circle") && (e.icon !== void 0 && Oa.has(e.icon) || [
    "furniture",
    "decoration",
    "door"
  ].includes(e.category));
}
function Ze(e, n, o) {
  const t = e[o], l = e[(o + 1) % e.length], u = e[o - 1] || (n ? e[e.length - 1] : t), h = e[o + 2] || (n ? e[(o + 2) % e.length] : l), i = (d, y, a) => Math.max(Math.min(y, a), Math.min(Math.max(y, a), d));
  return [[i(t[0] + (l[0] - u[0]) / 6, t[0], l[0]), i(t[1] + (l[1] - u[1]) / 6, t[1], l[1])], [i(l[0] - (h[0] - t[0]) / 6, t[0], l[0]), i(l[1] - (h[1] - t[1]) / 6, t[1], l[1])]];
}
function Gs(e) {
  if (e.shape === "rect") {
    const { x: u, y: h, width: i, height: d } = e.geometry;
    return {
      points: [
        [u, h],
        [u + i, h],
        [u + i, h + d],
        [u, h + d]
      ],
      closed: !0
    };
  }
  if (e.shape === "circle") {
    const { x: u, y: h, radius: i } = e.geometry;
    return {
      points: Array.from({ length: 64 }, (d, y) => [u + i * Math.cos(y * Math.PI / 32), h + i * Math.sin(y * Math.PI / 32)]),
      closed: !0
    };
  }
  if (e.shape !== "path" && e.shape !== "curve") return {
    points: [],
    closed: !1
  };
  const n = $e(e), o = xe(e), t = (u) => u.map((h) => Number(ce(h)));
  if (e.shape === "path" || n.length < 2) return {
    points: n.map(t),
    closed: o
  };
  const l = [t(n[0])];
  for (let u = 0; u < n.length - (o ? 0 : 1); u += 1) {
    const h = t(n[u]), i = t(n[(u + 1) % n.length]), [d, y] = Ze(n, o, u).map(t);
    for (let a = 1; a <= 12; a += 1) {
      const p = a / 12, f = 1 - p;
      l.push([0, 1].map((r) => f ** 3 * h[r] + 3 * f ** 2 * p * d[r] + 3 * f * p ** 2 * y[r] + p ** 3 * i[r]));
    }
  }
  return o && l.pop(), {
    points: l,
    closed: o
  };
}
function Pa(e) {
  if (e.shape === "rect") {
    const { x: u, y: h, width: i, height: d } = e.geometry;
    return `M ${u} ${h} h ${i} v ${d} h ${-i} Z`;
  }
  if (e.shape === "circle") {
    const { x: u, y: h, radius: i } = e.geometry;
    return `M ${u - i} ${h} a ${i} ${i} 0 1 0 ${i * 2} 0 a ${i} ${i} 0 1 0 ${-i * 2} 0 Z`;
  }
  const n = $e(e);
  if (n.length < 2) return "";
  const o = xe(e);
  if (e.shape === "path") return `M ${n.map(([u, h]) => `${ce(u)} ${ce(h)}`).join(" L ")}${o ? " Z" : ""}`;
  const t = [`M ${n[0].map(ce).join(" ")}`], l = n.length;
  for (let u = 0; u < l - (o ? 0 : 1); u += 1) {
    const [h, i] = Ze(n, o, u), d = n[(u + 1) % l];
    t.push(`C ${h.map(ce).join(" ")}, ${i.map(ce).join(" ")}, ${d.map(ce).join(" ")}`);
  }
  return t.join(" ") + (o ? " Z" : "");
}
function se(e) {
  if (e.shape === "rect") return { ...e.geometry };
  if (e.shape === "circle") {
    const { x: l, y: u, radius: h } = e.geometry;
    return {
      x: l - h,
      y: u - h,
      width: h * 2,
      height: h * 2
    };
  }
  const n = $e(e);
  if (!n.length) {
    const { x: l, y: u } = e.geometry;
    return {
      x: l,
      y: u,
      width: 0,
      height: 0
    };
  }
  const o = n.map((l) => l[0]), t = n.map((l) => l[1]);
  return {
    x: Math.min(...o),
    y: Math.min(...t),
    width: Math.max(...o) - Math.min(...o),
    height: Math.max(...t) - Math.min(...t)
  };
}
function za(e) {
  if (!e.rotation) return;
  const n = se(e);
  return `rotate(${e.rotation} ${n.x + n.width / 2} ${n.y + n.height / 2})`;
}
function De(e, n = 1) {
  const o = se(e), t = [o.x + o.width / 2, o.y + o.height / 2];
  if (e.shape === "label") return t;
  if (Te(e)) return [t[0], t[1] + 23 * n];
  if ((e.category === "terrain" || e.category === "water") && ve(e)) return t;
  if (e.shape === "path" || e.shape === "curve") {
    const h = $e(e), i = xe(e), d = h.length - (i ? 0 : 1), y = Array.from({ length: d }, (U, H) => Math.hypot(h[(H + 1) % h.length][0] - h[H][0], h[(H + 1) % h.length][1] - h[H][1]));
    let a = y.reduce((U, H) => U + H, 0) / 2, p = 0;
    for (; p < y.length - 1 && a > y[p]; )
      a -= y[p], p += 1;
    const f = h[p], r = h[(p + 1) % h.length], m = y[p] ? a / y[p] : 0.5;
    let M = f[0] + (r[0] - f[0]) * m, k = f[1] + (r[1] - f[1]) * m, S = r[0] - f[0], g = r[1] - f[1];
    if (e.shape === "curve") {
      const [U, H] = Ze(h, i, p), I = 1 - m;
      M = I ** 3 * f[0] + 3 * I ** 2 * m * U[0] + 3 * I * m ** 2 * H[0] + m ** 3 * r[0], k = I ** 3 * f[1] + 3 * I ** 2 * m * U[1] + 3 * I * m ** 2 * H[1] + m ** 3 * r[1], S = 3 * I ** 2 * (U[0] - f[0]) + 6 * I * m * (H[0] - U[0]) + 3 * m ** 2 * (r[0] - H[0]), g = 3 * I ** 2 * (U[1] - f[1]) + 6 * I * m * (H[1] - U[1]) + 3 * m ** 2 * (r[1] - H[1]);
    }
    const C = Math.hypot(S, g);
    if (!C) return [M, k - 13 * n];
    let E = -g / C, R = S / C;
    return (R > 0 || R === 0 && E < 0) && (E = -E, R = -R), [M + E * 13 * n, k + R * 13 * n];
  }
  const l = (e.rotation || 0) * Math.PI / 180, u = e.shape === "circle" ? o.height / 2 : (Math.abs(Math.sin(l)) * o.width + Math.abs(Math.cos(l)) * o.height) / 2;
  return [t[0], t[1] + u + 13 * n];
}
function Ia(e) {
  let n = 2166136261;
  for (const o of e) n = Math.imul(n ^ o.charCodeAt(0), 16777619);
  return n >>> 0;
}
function Ba(e) {
  const n = e.filter((t) => t.category === "terrain" && t.material === "forest" && ve(t) && !He(t)).sort((t, l) => t.id < l.id ? -1 : t.id > l.id ? 1 : 0), o = /* @__PURE__ */ new Map();
  for (let t = 0; t < n.length; t += 1) {
    const l = n[t], u = se(l), h = Math.floor(256 / n.length) + (t < 256 % n.length ? 1 : 0), i = u.width && u.height ? Math.min(h, Math.max(1, Math.ceil(u.width * u.height / 2704))) : 0, d = Math.min(i, Math.max(1, Math.ceil(Math.sqrt(i * u.width / Math.max(1, u.height))))), y = Math.ceil(i / Math.max(1, d));
    let a = Ia(l.id);
    const p = () => (a = Math.imul(a, 1664525) + 1013904223 >>> 0, a / 4294967296), f = [];
    for (let r = 0; r < i; r += 1) f.push({
      x: u.x + (r % d + 0.5 + (p() - 0.5) * 0.35) * u.width / d,
      y: u.y + (Math.floor(r / d) + 0.5 + (p() - 0.5) * 0.35) * u.height / y,
      size: Math.min(Math.max(u.width / d, u.height / y), Math.min(u.width, u.height)) * (1.25 + p() * 0.35),
      variant: Math.floor(p() * 3)
    });
    o.set(l.id, f);
  }
  return o;
}
var nt = {
  vine: "forest",
  root: "wood",
  tentacle: "flesh",
  pipe: "metal"
}, ot = {
  mushroom: "flesh",
  crystal: "glass",
  slime: "slime",
  dragon: "forest",
  dwarf: "metal",
  elf: "forest"
}, Ta = {
  ...nt,
  ...ot
};
function Ha(e) {
  return !!e.icon && Object.hasOwn(nt, e.icon) && ["path", "curve"].includes(e.shape) && !xe(e) && ![
    "wall",
    "grid",
    "actor",
    "door"
  ].includes(e.category);
}
function qs(e) {
  return !!e.icon && Object.hasOwn(ot, e.icon) && ["rect", "circle"].includes(e.shape) && ![
    "wall",
    "grid",
    "door"
  ].includes(e.category);
}
function st(e) {
  return e.material || (e.icon ? Ta[e.icon] : void 0);
}
var Ra = {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  class: "scene-organic-symbol"
}, Na = ["d"], Ua = /* @__PURE__ */ q({
  __name: "SceneSymbol",
  props: { icon: {} },
  setup(e) {
    return (n, o) => (c(), v("svg", Ra, [s("path", {
      d: b(_e)(e.icon)?.path,
      fill: "currentColor",
      "fill-opacity": ".35",
      stroke: "currentColor",
      "stroke-width": "1.2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, null, 8, Na)]));
  }
}), rt = /* @__PURE__ */ yt(Ua, [["__scopeId", "data-v-8136dc8a"]]), Va = [
  "x",
  "y",
  "width",
  "height"
], Ka = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "50"
}, Za = {
  key: 1,
  width: "100",
  height: "100"
}, Ga = ["clip-path", "fill"], qa = {
  key: 0,
  cx: "50",
  cy: "50",
  r: "49",
  class: "scene-object-edge"
}, Da = {
  key: 1,
  x: "1",
  y: "1",
  width: "98",
  height: "98",
  rx: "2",
  class: "scene-object-edge"
}, Wa = ["fill"], Fa = ["fill"], Qa = ["d"], Ya = {
  key: 0,
  d: "M9 78H91",
  class: "scene-object-seam"
}, Xa = ["x"], Ja = /* @__PURE__ */ q({
  __name: "SceneObject",
  props: {
    element: {},
    prefix: {},
    unitScale: {}
  },
  setup(e) {
    const n = e, o = A(() => se(n.element)), t = A(() => Math.min(o.value.width, o.value.height) / n.unitScale >= 12), l = A(() => n.element.shape === "circle"), u = A(() => st(n.element)), h = A(() => Wt(u.value, n.prefix)), i = A(() => tt(u.value, n.prefix)), d = `scene-object-${we()}`;
    return (y, a) => (c(), v("svg", {
      x: o.value.x,
      y: o.value.y,
      width: o.value.width,
      height: o.value.height,
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "scene-object"
    }, [s("defs", null, [s("clipPath", { id: d }, [l.value ? (c(), v("circle", Ka)) : (c(), v("rect", Za))])]), s("g", {
      "clip-path": `url(#${d})`,
      fill: h.value
    }, [l.value ? (c(), v("circle", qa)) : (c(), v("rect", Da)), t.value ? (c(), v(O, { key: 2 }, [l.value ? (c(), v("circle", {
      key: 0,
      cx: "50",
      cy: "50",
      r: "44",
      fill: i.value,
      class: "scene-object-inset"
    }, null, 8, Wa)) : (c(), v("rect", {
      key: 1,
      x: "5",
      y: "5",
      width: "90",
      height: "90",
      rx: "2",
      fill: i.value,
      class: "scene-object-inset"
    }, null, 8, Fa)), b(_e)(e.element.icon) ? (c(), F(rt, {
      key: 2,
      icon: e.element.icon,
      x: "12",
      y: "12",
      width: "76",
      height: "76",
      style: { color: "var(--scene-edge)" }
    }, null, 8, ["icon"])) : e.element.icon === "table" || e.element.icon === "counter" ? (c(), v(O, { key: 3 }, [s("path", {
      d: l.value ? "M18 36A35 35 0 0 1 72 22" : "M8 13V8H92",
      class: "scene-object-shine"
    }, null, 8, Qa), e.element.icon === "counter" ? (c(), v("path", Ya)) : $("", !0)], 64)) : e.element.icon === "chair" ? (c(), v(O, { key: 4 }, [
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
    ], 64)) : e.element.icon === "bed" ? (c(), v(O, { key: 5 }, [
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
    ], 64)) : e.element.icon === "shelf" ? (c(), v(O, { key: 6 }, [a[7] || (a[7] = s("path", {
      d: "M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92",
      class: "scene-object-seam"
    }, null, -1)), a[8] || (a[8] = s("path", {
      d: "M8 34H92M8 68H92",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "sofa" ? (c(), v(O, { key: 7 }, [
      a[9] || (a[9] = s("rect", {
        x: "8",
        y: "5",
        width: "84",
        height: "25",
        rx: "7",
        class: "scene-object-inset"
      }, null, -1)),
      (c(), v(O, null, Z(3, (p) => s("rect", {
        key: p,
        x: 15 + (p - 1) * 24,
        y: "32",
        width: "22",
        height: "57",
        rx: "5",
        class: "scene-object-inset"
      }, null, 8, Xa)), 64)),
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
    ], 64)) : e.element.icon === "bridge" ? (c(), v(O, { key: 8 }, [a[12] || (a[12] = s("path", {
      d: "M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91",
      class: "scene-object-seam"
    }, null, -1)), a[13] || (a[13] = s("path", {
      d: "M11 7V93M89 7V93",
      class: "scene-object-shine"
    }, null, -1))], 64)) : e.element.icon === "tree" ? (c(), v(O, { key: 9 }, [a[14] || (a[14] = ft('<circle cx="34" cy="32" r="24" class="scene-object-inset"></circle><circle cx="69" cy="36" r="24" class="scene-object-inset"></circle><circle cx="30" cy="62" r="23" class="scene-object-inset"></circle><circle cx="64" cy="67" r="25" class="scene-object-inset"></circle><circle cx="49" cy="48" r="26" class="scene-object-inset"></circle><path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine"></path>', 6))], 64)) : e.element.icon === "rock" ? (c(), v(O, { key: 10 }, [a[15] || (a[15] = s("path", {
      d: "M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57",
      class: "scene-object-seam"
    }, null, -1)), a[16] || (a[16] = s("path", {
      d: "M12 38 33 17 72 22",
      class: "scene-object-shine"
    }, null, -1))], 64)) : $("", !0)], 64)) : $("", !0)], 8, Ga)], 8, Va));
  }
}), en = Ja, We = {
  ...Object.fromEntries(Object.entries(Ee).map(([e, n]) => [e, n.label])),
  chair: "椅",
  stool: "凳",
  bench: "长凳",
  sofa: "沙发",
  bed: "床",
  table: "桌",
  counter: "台",
  shelf: "架",
  cabinet: "柜",
  chest: "箱",
  barrel: "桶",
  stove: "灶",
  refrigerator: "冰箱",
  sink: "水槽",
  toilet: "厕",
  bathtub: "浴缸",
  terminal: "终端",
  machine: "机械",
  "vending-machine": "售货",
  car: "车",
  column: "柱",
  partition: "屏风",
  fence: "围栏",
  "door-open": "门",
  ladder: "梯",
  statue: "雕像",
  well: "井",
  fountain: "喷泉",
  bridge: "桥",
  tent: "帐篷",
  tree: "树",
  "potted-plant": "盆栽",
  rock: "石",
  light: "灯",
  fire: "火",
  flag: "旗",
  sign: "牌"
}, tn = Object.freeze({
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
}), an = Object.freeze({
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
}), nn = Object.freeze({
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
}), on = Object.freeze({
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
}), sn = Object.freeze({
  ...Object.fromEntries(Object.entries(Ee).map(([e, n]) => [e, n.label])),
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
  water: "water_drop",
  stool: "chair_alt",
  bench: "event_seat",
  cabinet: "kitchen",
  barrel: "propane_tank",
  stove: "oven_gen",
  refrigerator: "kitchen",
  sink: "countertops",
  toilet: "wc",
  bathtub: "bathtub",
  terminal: "computer",
  machine: "precision_manufacturing",
  "vending-machine": "point_of_sale",
  car: "directions_car",
  column: "account_balance",
  partition: "view_column",
  fence: "fence",
  ladder: "format_line_spacing",
  statue: "architecture",
  well: "water_pump",
  fountain: "water",
  tent: "camping",
  "potted-plant": "potted_plant",
  flag: "flag",
  sign: "signpost"
}), rn = Object.freeze({
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
}), Re = Object.freeze({
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
}), ln = Object.freeze({
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
}), lt = Object.freeze({
  world: "世界",
  region: Me.world.unit,
  city: "城市",
  district: "街区",
  building: "建筑",
  floor: "楼层",
  room: "房间",
  outdoor: "户外"
}), cn = Object.freeze({
  door: "门",
  stairs: "楼梯",
  elevator: "电梯",
  path: "小径",
  road: "道路",
  portal: "传送门",
  passage: "通道"
});
function un(e, n) {
  return e < n ? -1 : e > n ? 1 : 0;
}
function dn(e, n) {
  const o = tn[e.category], t = ve(e), l = t && (e.material || e.category === "water") ? e.category === "terrain" && at(e.material) ? `url(#${n}-ground-${e.material})` : tt(e.material || "water", n) : "", u = e.certainty === "inferred" ? "8 6" : e.certainty === "unknown" ? "3 7" : o.dash;
  return {
    ...o,
    fill: t ? l || o.fill : "none",
    opacity: e.certainty === "unknown" ? 0.48 : e.certainty === "inferred" ? 0.72 : 1,
    dash: u,
    icon: e.icon ? sn[e.icon] : e.kind ? nn[e.kind] : rn[e.category],
    fallback: _e(e.icon)?.label || (e.kind ? on[e.kind] : e.icon && Object.hasOwn(We, e.icon) ? We[e.icon] : an[e.category].slice(0, 1)),
    z: Re[e.category]
  };
}
function vn(e) {
  const n = (o) => {
    if (!ve(o)) return 0;
    const t = se(o);
    return t.width * t.height;
  };
  return [...e].sort((o, t) => Re[o.category] - Re[t.category] || n(t) - n(o) || un(o.id, t.id));
}
var hn = {
  sky: {
    color: "#f5f8ff",
    intensity: 1.65
  },
  ground: "#9c8c7a",
  key: {
    color: "#fff3df",
    intensity: 3.1
  },
  fill: {
    color: "#daeaff",
    intensity: 0.65
  },
  shadows: !0,
  lampEmission: 0.18
}, pn = {
  indoor: {
    sunlight: {
      sky: {
        color: "#dceaff",
        intensity: 0.7
      },
      ground: "#8a8d98",
      key: {
        color: "#fff0d4",
        intensity: 3.6
      },
      fill: {
        color: "#bcd4ff",
        intensity: 0.18
      },
      shadows: !0,
      surface: [
        1.06,
        1.02,
        0.91
      ]
    },
    daylight: {
      sky: {
        color: "#e4eeff",
        intensity: 1.1
      },
      ground: "#8c929b",
      key: {
        color: "#e4edff",
        intensity: 0.4
      },
      fill: {
        color: "#dce9ff",
        intensity: 0.45
      },
      shadows: !1,
      surface: [
        0.89,
        0.94,
        1
      ]
    },
    night: {
      sky: {
        color: "#bccff0",
        intensity: 0.55
      },
      ground: "#667589",
      key: {
        color: "#c5d7ff",
        intensity: 0.12
      },
      fill: {
        color: "#bdd5ff",
        intensity: 0.3
      },
      shadows: !1,
      surface: [
        0.46,
        0.54,
        0.69
      ]
    }
  },
  outdoor: {
    sunlight: {
      sky: {
        color: "#dceeff",
        intensity: 0.9
      },
      ground: "#9b9b8c",
      key: {
        color: "#fff0d4",
        intensity: 4
      },
      fill: {
        color: "#c7deff",
        intensity: 0.25
      },
      shadows: !0,
      surface: [
        1.08,
        1.04,
        0.94
      ]
    },
    daylight: {
      sky: {
        color: "#e1eaff",
        intensity: 1.6
      },
      ground: "#a3a9b2",
      key: {
        color: "#edf2ff",
        intensity: 0.45
      },
      fill: {
        color: "#dbe6ff",
        intensity: 0.65
      },
      shadows: !1,
      surface: [
        0.93,
        0.98,
        1.03
      ]
    },
    night: {
      sky: {
        color: "#b8cfff",
        intensity: 0.48
      },
      ground: "#596f8b",
      key: {
        color: "#c5daff",
        intensity: 0.22
      },
      fill: {
        color: "#abc9ff",
        intensity: 0.26
      },
      shadows: !1,
      surface: [
        0.5,
        0.61,
        0.78
      ]
    }
  }
};
function fn(e) {
  if (!e) return hn;
  const n = pn[e.space][e.natural];
  return e.artificial === "off" ? {
    ...n,
    lampEmission: 0
  } : {
    ...n,
    lampEmission: 1.2
  };
}
function it(e) {
  return { "--scene-glow": ln[e.mood || "neutral"].glow };
}
function ct(e) {
  if (!e) return;
  const [n, o, t] = e;
  return `${n} 0 0 0 0  0 ${o} 0 0 0  0 0 ${t} 0 0  0 0 0 1 0`;
}
function yn(e) {
  return ct(fn(e).surface);
}
var Fe = [
  -1,
  0.95,
  -0.6
], Ie = {
  warm: {
    color: "#ffd59a",
    surface: [
      1.35,
      1.12,
      0.79
    ]
  },
  cold: {
    color: "#c5e4ff",
    surface: [
      0.99,
      1.15,
      1.35
    ]
  }
};
function gn(e) {
  if (e.lighting?.artificial !== "on") return [];
  const n = e.elements.filter((d) => d.category === "terrain" && ve(d)).map(se).sort((d, y) => y.width * y.height - d.width * d.height)[0], [o, t, l, u] = n ? [
    n.x,
    n.y,
    n.width,
    n.height
  ] : e.viewBox, h = Be(l, u), i = e.elements.filter((d) => d.shape !== "label" && d.material !== "shadow" && (d.category === "light" || d.icon === "light" || d.icon === "fire")).sort((d, y) => d.id.localeCompare(y.id)).slice(0, 4);
  return i.length ? i.map((d) => {
    const y = se(d), a = Math.max(y.width, y.height), p = d.category === "light" && !d.icon;
    return {
      id: d.id,
      x: y.x + y.width / 2,
      y: y.y + y.height / 2,
      radius: a > 0 ? a * (p ? 1.3 : 6) : h * 3.8,
      overhead: p,
      ...d.material === "cold-light" ? Ie.cold : Ie.warm
    };
  }) : [{
    id: "overhead",
    x: o + l / 2,
    y: t + u / 2,
    radius: Math.max(l, u) * 0.58,
    overhead: !0,
    ...Ie.warm
  }];
}
var mn = { key: 0 }, bn = ["id"], wn = ["values"], kn = ["id"], Mn = ["d", "transform"], _n = [
  "id",
  "cx",
  "cy",
  "r"
], $n = [
  "id",
  "x",
  "y",
  "width",
  "height"
], xn = [
  "cx",
  "cy",
  "r",
  "fill"
], Ln = ["id"], Cn = ["values"], Sn = ["filter"], jn = ["id"], On = ["data-element", "opacity"], En = ["clip-path"], An = ["d", "transform"], Pn = ["transform"], zn = ["d", "stroke"], In = ["d"], Bn = ["d", "stroke-width"], Tn = [
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap"
], Hn = [
  "d",
  "stroke",
  "stroke-opacity",
  "stroke-dasharray"
], Rn = ["transform"], Nn = ["id"], Un = ["d"], Vn = ["clip-path"], Kn = [
  "href",
  "x",
  "y",
  "width",
  "height"
], Zn = ["mask"], Gn = ["href", "filter"], qn = ["opacity", "transform"], Dn = {
  key: 0,
  r: "19",
  class: "scene-player-halo"
}, Wn = ["stroke"], Fn = {
  key: 2,
  class: "map-material-symbol",
  "aria-hidden": "true"
}, Qn = {
  key: 3,
  class: "map-symbol-fallback",
  "aria-hidden": "true"
}, Yn = ["x", "y"], Xn = /* @__PURE__ */ q({
  __name: "MapScene",
  props: { scene: {} },
  setup(e) {
    const n = e, o = V(!1);
    Ae(() => {
      Je().then(() => {
        o.value = !0;
      }).catch(() => {
        o.value = !1;
      });
    });
    const t = `xiaobai-map-scene-${we()}`, l = A(() => yn(n.scene.lighting)), u = A(() => gn(n.scene)), h = A(() => {
      if (n.scene.lighting?.natural !== "sunlight") return;
      const a = Be(n.scene.viewBox[2], n.scene.viewBox[3]);
      return `translate(${-Fe[0] * a * 0.45} ${-Fe[2] * a * 0.45})`;
    }), i = A(() => Ba(n.scene.elements)), d = A(() => [...new Set(n.scene.elements.filter((a) => a.category === "terrain" && ve(a) && !He(a)).map((a) => a.material).filter(at))]), y = A(() => vn(n.scene.elements).map((a, p) => ({
      element: a,
      bounds: se(a),
      path: Pa(a),
      transform: za(a),
      area: ve(a),
      presentation: dn(a, t),
      clipId: `${t}-area-${p}`,
      object: He(a) && !Te(a),
      marker: Te(a) && a.shape !== "label",
      growth: Ha(a)
    })));
    return (a, p) => (c(), F(Ye, {
      class: "map-scene-viewport",
      style: Le(b(it)(e.scene)),
      "view-box": e.scene.viewBox,
      "reset-key": e.scene.key,
      label: `${e.scene.name} 场景地图`
    }, {
      default: Ve(({ unitScale: f }) => [
        z(ka, { prefix: t }),
        z(Sa, {
          prefix: t,
          materials: d.value,
          scale: b(Be)(e.scene.viewBox[2], e.scene.viewBox[3])
        }, null, 8, ["materials", "scale"]),
        l.value ? (c(), v("defs", mn, [s("filter", {
          id: `${t}-lighting`,
          x: "-10%",
          y: "-10%",
          width: "120%",
          height: "120%",
          "color-interpolation-filters": "sRGB"
        }, [s("feColorMatrix", {
          type: "matrix",
          values: l.value
        }, null, 8, wn)], 8, bn)])) : $("", !0),
        s("defs", null, [s("clipPath", { id: `${t}-surfaces` }, [(c(!0), v(O, null, Z(y.value, (r) => (c(), v(O, { key: r.element.id }, [r.element.category === "terrain" && r.area ? (c(), v("path", {
          key: 0,
          d: r.path,
          transform: r.transform
        }, null, 8, Mn)) : $("", !0)], 64))), 128))], 8, kn), (c(!0), v(O, null, Z(u.value, (r, m) => (c(), v(O, { key: r.id }, [
          s("radialGradient", {
            id: `${t}-pool-${m}`,
            gradientUnits: "userSpaceOnUse",
            cx: r.x,
            cy: r.y,
            r: r.radius
          }, [...p[0] || (p[0] = [
            s("stop", {
              offset: "0",
              "stop-color": "white"
            }, null, -1),
            s("stop", {
              offset: ".18",
              "stop-color": "white",
              "stop-opacity": ".95"
            }, null, -1),
            s("stop", {
              offset: ".55",
              "stop-color": "white",
              "stop-opacity": ".48"
            }, null, -1),
            s("stop", {
              offset: "1",
              "stop-color": "white",
              "stop-opacity": "0"
            }, null, -1)
          ])], 8, _n),
          s("mask", {
            id: `${t}-mask-${m}`,
            maskUnits: "userSpaceOnUse",
            x: e.scene.viewBox[0],
            y: e.scene.viewBox[1],
            width: e.scene.viewBox[2],
            height: e.scene.viewBox[3]
          }, [s("circle", {
            cx: r.x,
            cy: r.y,
            r: r.radius,
            fill: `url(#${t}-pool-${m})`
          }, null, 8, xn)], 8, $n),
          s("filter", {
            id: `${t}-lamp-${m}`,
            "color-interpolation-filters": "sRGB"
          }, [s("feColorMatrix", {
            type: "matrix",
            values: b(ct)(r.surface)
          }, null, 8, Cn)], 8, Ln)
        ], 64))), 128))]),
        s("g", { filter: l.value ? `url(#${t}-lighting)` : void 0 }, [s("g", { id: `${t}-artwork` }, [(c(!0), v(O, null, Z(y.value, (r) => (c(), v("g", {
          key: r.element.id,
          class: J(["map-scene-element", [`is-${r.element.category}`, `is-${r.element.certainty || "confirmed"}`]]),
          "data-element": r.element.id,
          opacity: r.presentation.opacity
        }, [h.value && r.object && r.path ? (c(), v("g", {
          key: 0,
          "clip-path": `url(#${t}-surfaces)`,
          "aria-hidden": "true"
        }, [s("path", {
          d: r.path,
          transform: `${h.value} ${r.transform || ""}`,
          fill: "#263748",
          opacity: ".3"
        }, null, 8, An)], 8, En)) : $("", !0), s("g", { transform: r.transform }, [
          r.object ? (c(), F(en, {
            key: 0,
            element: r.element,
            prefix: t,
            "unit-scale": f
          }, null, 8, ["element", "unit-scale"])) : r.path ? (c(), v(O, { key: 1 }, [
            r.growth ? (c(), v("path", {
              key: 0,
              d: r.path,
              fill: "none",
              stroke: b(fe)(b(st)(r.element)),
              "stroke-width": "9",
              "stroke-linecap": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, zn)) : $("", !0),
            r.element.category === "wall" ? (c(), v("path", {
              key: 1,
              d: r.path,
              fill: "none",
              stroke: "var(--scene-shadow)",
              "stroke-width": "9",
              opacity: ".18",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, In)) : $("", !0),
            r.element.category === "road" && !r.area ? (c(), v("path", {
              key: 2,
              d: r.path,
              fill: "none",
              stroke: "var(--scene-soft-edge)",
              "stroke-width": r.presentation.width + 2,
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, Bn)) : $("", !0),
            s("path", {
              d: r.path,
              fill: r.presentation.fill,
              stroke: r.presentation.stroke,
              "stroke-width": r.presentation.width,
              "stroke-dasharray": r.presentation.dash,
              "stroke-linejoin": "round",
              "stroke-linecap": r.element.category === "wall" ? "butt" : "round",
              "fill-rule": "evenodd",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, Tn),
            r.element.category === "wall" ? (c(), v("path", {
              key: 3,
              d: r.path,
              fill: "none",
              stroke: r.element.material ? b(fe)(r.element.material) : "var(--scene-wall)",
              "stroke-width": "3.5",
              "stroke-opacity": r.element.material === "glass" ? 0.4 : 1,
              "stroke-dasharray": r.presentation.dash,
              "stroke-linejoin": "round",
              "vector-effect": "non-scaling-stroke"
            }, null, 8, Hn)) : $("", !0)
          ], 64)) : $("", !0),
          r.object && !b(Aa)(r.element) && Math.min(r.bounds.width, r.bounds.height) / f >= 12 ? (c(), v("g", {
            key: 2,
            transform: `translate(${r.bounds.x + r.bounds.width / 2} ${r.bounds.y + r.bounds.height / 2})`,
            "aria-hidden": "true"
          }, [s("text", {
            class: J(o.value ? "map-material-symbol" : "map-symbol-fallback"),
            style: Le({
              fontSize: `${Math.min(22 * f, Math.min(r.bounds.width, r.bounds.height) * 0.65)}px`,
              fill: "var(--scene-edge)",
              textAnchor: "middle",
              dominantBaseline: "central"
            })
          }, w(o.value ? r.presentation.icon : r.presentation.fallback), 7)], 8, Rn)) : $("", !0),
          i.value.has(r.element.id) ? (c(), v(O, { key: 3 }, [s("defs", null, [s("clipPath", { id: r.clipId }, [s("path", {
            d: r.path,
            "clip-rule": "evenodd"
          }, null, 8, Un)], 8, Nn)]), s("g", {
            "clip-path": `url(#${r.clipId})`,
            class: "scene-forest-decoration",
            "aria-hidden": "true"
          }, [(c(!0), v(O, null, Z(i.value.get(r.element.id), (m, M) => (c(), v("use", {
            key: M,
            href: `#${t}-crown-${m.variant}`,
            x: m.x - m.size / 2,
            y: m.y - m.size / 2,
            width: m.size,
            height: m.size
          }, null, 8, Kn))), 128))], 8, Vn)], 64)) : $("", !0)
        ], 8, Pn)], 10, On))), 128))], 8, jn)], 8, Sn),
        (c(!0), v(O, null, Z(u.value, (r, m) => (c(), v("g", {
          key: r.id,
          mask: `url(#${t}-mask-${m})`,
          "aria-hidden": "true"
        }, [s("use", {
          href: `#${t}-artwork`,
          filter: `url(#${t}-lamp-${m})`
        }, null, 8, Gn)], 8, Zn))), 128)),
        (c(!0), v(O, null, Z(y.value, (r) => (c(), v(O, { key: r.element.id }, [r.marker ? (c(), v("g", {
          key: 0,
          class: J(["map-scene-icon", `is-${r.element.category}`]),
          opacity: r.presentation.opacity,
          transform: `translate(${r.bounds.x + r.bounds.width / 2} ${r.bounds.y + r.bounds.height / 2}) scale(${f})`
        }, [
          r.element.actorKey === "player" || r.element.kind === "player" ? (c(), v("circle", Dn)) : $("", !0),
          s("circle", {
            r: "11",
            stroke: r.presentation.stroke
          }, null, 8, Wn),
          b(_e)(r.element.icon) ? (c(), F(rt, {
            key: 1,
            icon: r.element.icon,
            x: "-8",
            y: "-8",
            width: "16",
            height: "16",
            style: { color: "var(--map-accent)" }
          }, null, 8, ["icon"])) : o.value ? (c(), v("text", Fn, w(r.presentation.icon), 1)) : (c(), v("text", Qn, w(r.presentation.fallback), 1))
        ], 10, qn)) : $("", !0)], 64))), 128)),
        s("g", {
          class: "scene-labels",
          style: Le({ "--scene-unit-scale": f })
        }, [(c(!0), v(O, null, Z(y.value, (r) => (c(), v(O, { key: r.element.id }, [r.element.label ? (c(), v("text", {
          key: 0,
          class: J(["map-scene-label", { "is-primary": r.element.shape === "label" }]),
          x: b(De)(r.element, f)[0],
          y: b(De)(r.element, f)[1]
        }, w(r.element.label), 11, Yn)) : $("", !0)], 64))), 128))], 4)
      ]),
      _: 1
    }, 8, [
      "style",
      "view-box",
      "reset-key",
      "label"
    ]));
  }
}), Jn = Xn, eo = {
  key: 0,
  class: "map-3d-loading",
  role: "status"
}, to = {
  class: "map-viewport-controls",
  "aria-label": "三维视角"
}, ao = /* @__PURE__ */ q({
  __name: "MapScene3D",
  props: {
    scene: {},
    lowWalls: { type: Boolean },
    showLabels: { type: Boolean }
  },
  emits: ["fallback"],
  setup(e, { emit: n }) {
    const o = e, t = n, l = V(null), u = V(null), h = V(!0);
    let i, d, y, a = !1;
    function p() {
      y?.disconnect(), y = void 0, document.removeEventListener("visibilitychange", r);
    }
    function f() {
      p(), a && t("fallback", "当前设备无法打开三维，已切换二维。");
    }
    function r() {
      const m = l.value;
      if (!a || !d || i || document.hidden || !m?.isConnected) return;
      const M = m.getBoundingClientRect();
      if (!(!M.width || !M.height)) {
        p();
        try {
          i = d(m, u.value, { fallback: (k) => t("fallback", k) }), i.setScene(o.scene), i.walls(o.lowWalls), i.labels(o.showLabels), h.value = !1, Je().then(() => {
            a && i?.symbols(!0);
          }).catch(() => {
          });
        } catch {
          f();
        }
      }
    }
    return Ae(async () => {
      a = !0;
      try {
        if (d = (await import("./xiaobai-os-three-runtime-DwqX-hKZ.js")).createThreeRuntime, !a) return;
        y = new ResizeObserver(r), y.observe(l.value), document.addEventListener("visibilitychange", r), r();
      } catch {
        f();
      }
    }), ne(() => o.scene, (m) => i?.setScene(m)), ne(() => o.lowWalls, (m) => i?.walls(m)), ne(() => o.showLabels, (m) => i?.labels(m)), Ue(() => {
      a = !1, p(), i?.dispose(), i = void 0;
    }), (m, M) => (c(), v("div", {
      ref_key: "host",
      ref: l,
      class: "map-scene-three",
      style: Le(b(it)(e.scene))
    }, [
      s("div", {
        ref_key: "labelHost",
        ref: u,
        class: "map-3d-labels"
      }, null, 512),
      h.value ? (c(), v("div", eo, "正在打开三维…")) : $("", !0),
      s("div", to, [
        s("button", {
          type: "button",
          "aria-label": "放大三维",
          onClick: M[0] || (M[0] = (k) => b(i)?.zoom(1.2))
        }, "+"),
        s("button", {
          type: "button",
          "aria-label": "缩小三维",
          onClick: M[1] || (M[1] = (k) => b(i)?.zoom(1 / 1.2))
        }, "−"),
        s("button", {
          type: "button",
          class: "map-fit",
          "aria-label": "重置三维视角",
          onClick: M[2] || (M[2] = (k) => b(i)?.fit())
        }, "全图")
      ])
    ], 4));
  }
}), no = ao, oo = ["aria-label"], so = {
  key: 0,
  class: "map-scene-toolbar"
}, ro = ["aria-label"], lo = ["aria-pressed"], io = ["aria-pressed", "disabled"], co = ["aria-pressed"], uo = ["aria-pressed"], vo = { class: "map-scene-stage" }, ho = /* @__PURE__ */ q({
  __name: "MapSceneView",
  props: /* @__PURE__ */ je({
    scene: {},
    mode: {},
    threeUnavailable: { type: Boolean },
    compact: { type: Boolean }
  }, {
    lowWalls: {
      type: Boolean,
      default: !1
    },
    lowWallsModifiers: {},
    showLabels: {
      type: Boolean,
      default: !0
    },
    showLabelsModifiers: {}
  }),
  emits: /* @__PURE__ */ je(["update:mode", "fallback"], ["update:lowWalls", "update:showLabels"]),
  setup(e, { emit: n }) {
    const o = n, t = be(e, "lowWalls"), l = be(e, "showLabels");
    return (u, h) => (c(), v("section", {
      class: "map-scene-view",
      "aria-label": e.scene.name
    }, [e.compact ? $("", !0) : (c(), v("div", so, [
      s("div", {
        class: "map-render-switch",
        role: "group",
        "aria-label": b(X).mode
      }, [s("button", {
        type: "button",
        "aria-pressed": e.mode === "2d",
        onClick: h[0] || (h[0] = (i) => o("update:mode", "2d"))
      }, w(b(X).two), 9, lo), s("button", {
        type: "button",
        "aria-pressed": e.mode === "3d",
        disabled: e.threeUnavailable,
        onClick: h[1] || (h[1] = (i) => o("update:mode", "3d"))
      }, w(b(X).three), 9, io)], 8, ro),
      e.mode === "3d" ? (c(), v("button", {
        key: 0,
        type: "button",
        "aria-pressed": t.value,
        onClick: h[2] || (h[2] = (i) => t.value = !t.value)
      }, w(b(X).lowWalls), 9, co)) : $("", !0),
      e.mode === "3d" ? (c(), v("button", {
        key: 1,
        type: "button",
        "aria-pressed": l.value,
        onClick: h[3] || (h[3] = (i) => l.value = !l.value)
      }, w(b(X).labels), 9, uo)) : $("", !0)
    ])), s("div", vo, [Ne(z(Jn, { scene: e.scene }, null, 8, ["scene"]), [[Qe, e.mode === "2d"]]), e.mode === "3d" ? (c(), F(no, {
      key: 0,
      scene: e.scene,
      "low-walls": t.value,
      "show-labels": l.value,
      onFallback: h[4] || (h[4] = (i) => o("fallback", i))
    }, null, 8, [
      "scene",
      "low-walls",
      "show-labels"
    ])) : $("", !0)])], 8, oo));
  }
}), po = ho, fo = { class: "map-legend-content" }, yo = /* @__PURE__ */ q({
  __name: "MapLegend",
  setup(e) {
    return (n, o) => (c(), v("div", fo, [
      s("strong", null, w(b(N).legendTitle), 1),
      s("p", null, [
        o[0] || (o[0] = s("i", { class: "map-key-current" }, null, -1)),
        D(w(b(N).legendCurrent) + " ", 1),
        o[1] || (o[1] = s("i", { class: "map-key-place" }, null, -1)),
        D(w(b(N).legendPlace), 1)
      ]),
      s("p", null, w(b(N).legendRoutes), 1),
      s("small", null, w(b(N).legend), 1)
    ]));
  }
}), ut = yo, go = ["aria-label"], mo = [
  "aria-label",
  "aria-pressed",
  "onClick"
], bo = ["aria-label", "aria-expanded"], wo = ["aria-label"], ko = {
  key: 0,
  class: "map-projection-scene-options"
}, Mo = ["aria-label"], _o = ["aria-pressed"], $o = ["aria-pressed", "disabled"], xo = {
  key: 0,
  class: "map-projection-toggles"
}, Lo = ["aria-pressed"], Co = ["aria-pressed"], So = ["disabled"], jo = ["aria-expanded"], Oo = /* @__PURE__ */ q({
  __name: "MapProjectionControls",
  props: /* @__PURE__ */ je({
    view: {},
    sceneAvailable: { type: Boolean },
    threeUnavailable: { type: Boolean },
    located: { type: Boolean }
  }, {
    mode: { required: !0 },
    modeModifiers: {},
    lowWalls: {
      type: Boolean,
      required: !0
    },
    lowWallsModifiers: {},
    showLabels: {
      type: Boolean,
      required: !0
    },
    showLabelsModifiers: {}
  }),
  emits: /* @__PURE__ */ je(["navigate", "locate"], [
    "update:mode",
    "update:lowWalls",
    "update:showLabels"
  ]),
  setup(e, { emit: n }) {
    const o = e, t = n, l = be(e, "mode"), u = be(e, "lowWalls"), h = be(e, "showLabels"), i = V(!1), d = V(!1), y = V(null), a = V(null), p = `map-projection-options-${we()}`;
    function f() {
      i.value = !1, d.value = !1;
    }
    function r(M) {
      (!y.value || !M.composedPath().includes(y.value)) && f();
    }
    function m(M) {
      M.key !== "Escape" || !i.value || (M.preventDefault(), M.stopPropagation(), f(), a.value?.focus({ preventScroll: !0 }));
    }
    return ne(() => o.view, f), Ae(() => document.addEventListener("pointerdown", r, !0)), Ue(() => document.removeEventListener("pointerdown", r, !0)), (M, k) => (c(), v("div", {
      ref_key: "root",
      ref: y,
      class: "map-projection-controls",
      onKeydown: m
    }, [
      s("nav", {
        class: "map-projection-tabs",
        "aria-label": b(N).viewLabel
      }, [(c(!0), v(O, null, Z(b(me).views, (S, g) => (c(), v("button", {
        key: g,
        type: "button",
        "aria-label": b(te)[g],
        "aria-pressed": e.view === g,
        onClick: (C) => {
          f(), t("navigate", g);
        }
      }, w(S), 9, mo))), 128))], 8, go),
      s("button", {
        ref_key: "trigger",
        ref: a,
        type: "button",
        class: "map-projection-options-button",
        "aria-label": b(me).options,
        "aria-expanded": i.value,
        "aria-controls": p,
        onClick: k[0] || (k[0] = (S) => i.value ? f() : i.value = !0)
      }, [z(T, { name: "more" })], 8, bo),
      i.value ? (c(), v("section", {
        key: 0,
        id: p,
        class: "map-projection-options",
        "aria-label": b(me).options
      }, [
        e.view === "scene" && e.sceneAvailable ? (c(), v("div", ko, [s("div", {
          class: "map-render-switch",
          role: "group",
          "aria-label": b(X).mode
        }, [s("button", {
          type: "button",
          "aria-pressed": l.value === "2d",
          onClick: k[1] || (k[1] = (S) => l.value = "2d")
        }, w(b(X).two), 9, _o), s("button", {
          type: "button",
          "aria-pressed": l.value === "3d",
          disabled: e.threeUnavailable,
          onClick: k[2] || (k[2] = (S) => l.value = "3d")
        }, w(b(X).three), 9, $o)], 8, Mo), l.value === "3d" ? (c(), v("div", xo, [s("button", {
          type: "button",
          "aria-pressed": u.value,
          onClick: k[3] || (k[3] = (S) => u.value = !u.value)
        }, w(b(X).lowWalls), 9, Lo), s("button", {
          type: "button",
          "aria-pressed": h.value,
          onClick: k[4] || (k[4] = (S) => h.value = !h.value)
        }, w(b(X).labels), 9, Co)])) : $("", !0)])) : $("", !0),
        s("button", {
          type: "button",
          disabled: !e.located,
          onClick: k[5] || (k[5] = (S) => {
            t("locate"), f();
          })
        }, [z(T, { name: "locate" }), D(w(b(me).location), 1)], 8, So),
        s("button", {
          type: "button",
          "aria-expanded": d.value,
          onClick: k[6] || (k[6] = (S) => d.value = !d.value)
        }, [z(T, { name: "layers" }), D(w(b(N).legendLabel), 1)], 8, jo),
        d.value ? (c(), F(ut, { key: 1 })) : $("", !0)
      ], 8, wo)) : $("", !0)
    ], 544));
  }
}), Eo = Oo;
function Ao(e) {
  const n = e?.atlas.actors.find((t) => t.actorKey === "player"), o = e?.atlas.locations.find((t) => t.key === n?.locationKey);
  return o?.sceneKey && e?.scenes[o.sceneKey]?.status === "active" ? "scene" : "world";
}
function Po(e, n) {
  const o = n === null ? void 0 : e.locations.find((i) => i.key === n && oe(i)), t = Ct(e), l = (n === null ? e.locations.filter(oe) : o ? e.locations.filter((i) => Lt(i) && Se(e, i.key)?.key === o.key) : []).map((i) => t.has(i.key) ? {
    ...i,
    status: "visited"
  } : i), u = n === null ? l.filter((i) => !ke(e, i.key).slice(0, -1).some(oe)) : [], h = new Set(u.map((i) => i.parent || ""));
  return {
    kind: n === null ? "world" : "region",
    region: o,
    locations: l,
    unvisited: l.filter((i) => i.status !== "visited").length,
    positionParent: o ? o.key : h.size === 1 ? [...h][0] : null
  };
}
function zo(e, n, o) {
  const t = n.trim().toLocaleLowerCase();
  return e.locations.filter((l) => [l.name, l.brief].some((u) => u?.toLocaleLowerCase().includes(t)) && (o === "all" || (o === "visited" ? l.status === "visited" : l.status !== "visited")));
}
var Io = { class: "map-search-input" }, Bo = ["aria-label", "placeholder"], To = { class: "map-search-scope" }, Ho = ["aria-label"], Ro = ["aria-pressed", "onClick"], No = { class: "map-search-results" }, Uo = ["onClick"], Vo = { class: "map-result-icon" }, Ko = { key: 0 }, Zo = {
  key: 0,
  class: "map-search-empty"
}, Go = /* @__PURE__ */ q({
  __name: "MapSearch",
  props: {
    scope: {},
    title: {},
    initialFilter: {}
  },
  emits: ["close", "select"],
  setup(e) {
    const n = e, o = V(""), t = V(n.initialFilter), l = A(() => Me[n.scope.kind]), u = A(() => [
      {
        id: "all",
        name: l.value.all
      },
      {
        id: "unvisited",
        name: de.unvisited
      },
      {
        id: "visited",
        name: de.visited
      }
    ]), h = A(() => zo(n.scope, o.value, t.value));
    return (i, d) => (c(), F(gt, {
      class: "map-dialog map-search-dialog",
      "aria-label": l.value.search,
      onClose: d[2] || (d[2] = (y) => i.$emit("close"))
    }, {
      default: Ve(() => [
        s("header", Io, [
          z(T, { name: "search" }),
          Ne(s("input", {
            "onUpdate:modelValue": d[0] || (d[0] = (y) => o.value = y),
            type: "search",
            "aria-label": l.value.search,
            placeholder: l.value.search,
            autofocus: ""
          }, null, 8, Bo), [[ht, o.value]]),
          s("button", {
            type: "button",
            onClick: d[1] || (d[1] = (y) => i.$emit("close"))
          }, w(b(N).cancel), 1)
        ]),
        s("h2", To, w(e.title), 1),
        s("nav", {
          class: "map-search-filters",
          "aria-label": b(N).filters
        }, [(c(!0), v(O, null, Z(u.value, (y) => (c(), v("button", {
          key: y.id,
          type: "button",
          "aria-pressed": t.value === y.id,
          onClick: (a) => t.value = y.id
        }, w(y.name), 9, Ro))), 128))], 8, Ho),
        s("div", No, [
          s("small", null, w(b(Xe)(e.scope.kind, h.value.length)), 1),
          (c(!0), v(O, null, Z(h.value, (y) => (c(), v("button", {
            key: y.key,
            type: "button",
            class: "map-search-result",
            onClick: (a) => i.$emit("select", y.key)
          }, [
            s("span", Vo, [z(T, { name: e.scope.kind === "world" ? "globe" : "pin" }, null, 8, ["name"])]),
            s("span", null, [
              s("strong", null, w(y.name), 1),
              s("small", null, w(b(lt)[y.scale]) + " · " + w(b(de)[y.status === "visited" ? "visited" : "unvisited"]), 1),
              y.brief ? (c(), v("p", Ko, w(y.brief), 1)) : $("", !0)
            ]),
            z(T, { name: "next" })
          ], 8, Uo))), 128)),
          h.value.length ? $("", !0) : (c(), v("div", Zo, [
            z(T, { name: "search" }),
            s("h3", null, w(l.value.notFound), 1),
            s("p", null, w(b(N).searchHint), 1)
          ]))
        ])
      ]),
      _: 1
    }, 8, ["aria-label"]));
  }
}), qo = Go, Do = {
  class: "map-place-detail",
  "aria-labelledby": "map-place-title"
}, Wo = { id: "map-place-title" }, Fo = { class: "map-place-content" }, Qo = {
  key: 0,
  class: "map-place-full-name"
}, Yo = {
  key: 1,
  class: "map-address"
}, Xo = { class: "map-place-intro" }, Jo = { class: "map-place-actions" }, es = {
  key: 2,
  class: "map-detail-section"
}, ts = { class: "map-people" }, as = {
  key: 3,
  class: "map-detail-section"
}, ns = ["onClick"], os = /* @__PURE__ */ q({
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
    const n = e, o = A(() => ke(n.map.atlas, n.location.key).slice(0, -1)), t = A(() => oe(n.location)), l = A(() => n.map.atlas.actors.filter((h) => h.locationKey === n.location.key)), u = A(() => St(n.map.atlas, n.location.key));
    return (h, i) => (c(), v("section", Do, [
      i[6] || (i[6] = s("div", {
        class: "map-sheet-grip",
        "aria-hidden": "true"
      }, null, -1)),
      s("header", null, [s("div", null, [s("small", null, w(b(lt)[e.location.scale]) + " · " + w(e.currentKey === e.location.key ? "当前位置" : b(de)[e.location.status === "visited" ? "visited" : "unvisited"]), 1), s("h2", Wo, w(e.location.name), 1)]), s("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "关闭地点详情",
        onClick: i[0] || (i[0] = (d) => h.$emit("close"))
      }, [z(T, { name: "close" })])]),
      s("div", Fo, [
        e.location.name.length > 24 ? (c(), v("p", Qo, w(e.location.name), 1)) : $("", !0),
        o.value.length ? (c(), v("p", Yo, [z(T, { name: "pin" }), D(w(o.value.map((d) => d.name).join(" · ")), 1)])) : $("", !0),
        s("p", Xo, w(e.location.brief || "这个地点已记录在世界地图上，更多介绍等待故事展开。"), 1),
        s("div", Jo, [t.value ? (c(), v("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          onClick: i[1] || (i[1] = (d) => h.$emit("explore"))
        }, [z(T, { name: "compass" }), D(w(b(N).regionMap), 1)])) : (c(), v("button", {
          key: 1,
          type: "button",
          class: "map-secondary-button",
          onClick: i[2] || (i[2] = (d) => h.$emit("scene"))
        }, [z(T, { name: "layers" }), D(w(b(N).sceneMap), 1)]))]),
        l.value.length ? (c(), v("section", es, [i[3] || (i[3] = s("h3", null, "记录在这里的人物", -1)), s("p", ts, [(c(!0), v(O, null, Z(l.value, (d) => (c(), v("span", { key: d.actorKey }, [z(T, { name: "person" }), D(w(d.displayName), 1)]))), 128))])])) : $("", !0),
        u.value.length ? (c(), v("section", as, [i[4] || (i[4] = s("h3", null, "相连的地方", -1)), (c(!0), v(O, null, Z(u.value, (d) => (c(), v("button", {
          key: d.link.id,
          type: "button",
          class: "map-connection",
          onClick: (y) => h.$emit("select", d.location.key)
        }, [
          z(T, { name: "route" }),
          s("span", null, [s("strong", null, w(d.location.name), 1), s("small", null, w(d.link.label || b(cn)[d.link.kind]) + w(d.link.bidirectional ? "" : d.outgoing ? " · 单向前往" : " · 仅可从对面到达"), 1)]),
          z(T, { name: "next" })
        ], 8, ns))), 128))])) : $("", !0),
        i[5] || (i[5] = s("p", { class: "map-detail-footnote" }, "查看地图不会改变你在故事中的位置", -1))
      ])
    ]));
  }
}), ss = os, rs = { class: "map-top" }, ls = { class: "map-search-bar" }, is = ["disabled"], cs = {
  key: 1,
  class: "map-search-entry"
}, us = {
  key: 0,
  class: "map-view-row"
}, ds = ["aria-label"], vs = ["aria-pressed"], hs = ["aria-pressed"], ps = ["aria-pressed"], fs = {
  key: 0,
  class: "map-scene-tools"
}, ys = ["aria-expanded", "aria-label"], gs = ["aria-label"], ms = ["aria-current"], bs = { "aria-current": "page" }, ws = {
  key: 1,
  class: "map-notice",
  role: "status"
}, ks = {
  key: 1,
  class: "map-empty"
}, Ms = {
  key: 2,
  class: "map-empty"
}, _s = { class: "map-empty" }, $s = ["disabled"], xs = ["aria-expanded", "aria-label"], Ls = {
  key: 2,
  class: "map-key"
}, Cs = ["aria-label"], Ss = { class: "map-region-icon" }, js = {
  class: "map-round-button",
  "aria-hidden": "true"
}, Os = {
  key: 5,
  class: "map-scene-caption"
}, Es = ["title"], As = /* @__PURE__ */ q({
  __name: "MapBrowser",
  props: {
    map: {},
    chatIdentity: {},
    compact: { type: Boolean }
  },
  setup(e) {
    const n = e, o = `map-browse-summary-${we()}`, t = V(""), l = () => Ao(n.map) === "scene" ? {
      kind: "scene",
      key: ""
    } : { kind: "world" }, u = V(l()), h = V("3d"), i = V(!1), d = V(!0), y = V(!1), a = V("");
    let p = !1;
    const f = A(() => u.value.kind === "scene"), r = A(() => u.value.kind === "scene" ? u.value.key : ""), m = V(""), M = V(0), k = V(null), S = V(!1), g = A(() => n.map?.atlas), C = A(() => g.value?.actors.find((j) => j.actorKey === "player")?.locationKey || ""), E = A(() => g.value?.locations.find((j) => j.key === C.value)), R = A(() => g.value?.locations.find((j) => j.key === (r.value || C.value))), U = A(() => f.value && R.value?.sceneKey ? n.map?.scenes[R.value.sceneKey] : void 0), H = A(() => {
      if (!g.value || u.value.kind === "world") return;
      const j = u.value.key || C.value;
      return Se(g.value, j);
    }), I = A(() => Po(g.value || {
      locations: [],
      links: [],
      actors: []
    }, u.value.kind === "world" ? null : H.value?.key || "")), Y = A(() => I.value.locations.find((j) => j.key === t.value)), ee = A(() => I.value.kind === "world" ? te.world : H.value?.name || N.unknownRegion), x = A(() => Me[I.value.kind]), P = A(() => I.value.unvisited ? "unvisited" : "all");
    ne(() => ({
      map: n.map,
      chatIdentity: n.chatIdentity
    }), (j, _) => {
      const L = j.chatIdentity !== _.chatIdentity;
      (L || !j.map?.atlas.locations.some((Pe) => Pe.key === t.value)) && (t.value = ""), L && (p = !1);
      const le = u.value.kind === "world" ? "" : u.value.key, vt = le && !j.map?.atlas.locations.some((Pe) => Pe.key === le);
      (L || !_.map?.atlas.locations.length && j.map?.atlas.locations.length && !p || vt) && (u.value = l()), L && (k.value = null, S.value = !1);
    }), ne(I, (j, _) => {
      j.locations.some((L) => L.key === t.value) || (t.value = ""), (j.kind !== _.kind || j.region?.key !== _.region?.key || !g.value) && (t.value = "", k.value = null, S.value = !1);
    });
    function B(j) {
      p = !0, u.value = j, t.value = "", k.value = null, S.value = !1;
    }
    function K(j = "") {
      B({
        kind: "region",
        key: j
      });
    }
    async function G(j, _ = !1) {
      const L = g.value?.locations.find((le) => le.key === j);
      if (L) {
        if (p = !0, _ && g.value) {
          if (oe(L)) pe();
          else {
            const le = Se(g.value, j);
            if (!le) {
              he(j);
              return;
            }
            K(le.key);
          }
          await ze();
        }
        t.value = j, k.value = null, S.value = !1, await ze(), m.value = g.value ? Oe(g.value, j, I.value.locations) : j, M.value += 1;
      }
    }
    async function re() {
      if (!(!E.value || !g.value)) {
        if (oe(E.value)) {
          await G(E.value.key, !0);
          return;
        }
        if (!Se(g.value, E.value.key)) {
          he();
          return;
        }
        K(), await ze(), await G(E.value.key);
      }
    }
    function he(j = "") {
      B({
        kind: "scene",
        key: j === C.value ? "" : j
      });
    }
    function pe() {
      B({ kind: "world" });
    }
    function dt(j) {
      y.value || (y.value = !0, h.value = "2d", a.value = j);
    }
    return pt(() => S.value ? (S.value = !1, !0) : f.value ? (K(r.value && H.value?.key || ""), !0) : t.value ? (t.value = "", !0) : u.value.kind === "region" ? (pe(), !0) : !1), (j, _) => (c(), v("main", { class: J(["map-app", {
      "has-view-switch": g.value?.locations.length,
      "is-scene-view": f.value
    }]) }, [
      e.compact && g.value?.locations.length ? (c(), F(Eo, {
        key: 0,
        mode: h.value,
        "onUpdate:mode": _[0] || (_[0] = (L) => h.value = L),
        "low-walls": i.value,
        "onUpdate:lowWalls": _[1] || (_[1] = (L) => i.value = L),
        "show-labels": d.value,
        "onUpdate:showLabels": _[2] || (_[2] = (L) => d.value = L),
        view: u.value.kind,
        "scene-available": U.value?.status === "active",
        "three-unavailable": y.value,
        located: !!E.value,
        onNavigate: _[3] || (_[3] = (L) => B(L === "world" ? { kind: L } : {
          kind: L,
          key: ""
        })),
        onLocate: _[4] || (_[4] = (L) => f.value ? he() : re())
      }, null, 8, [
        "mode",
        "low-walls",
        "show-labels",
        "view",
        "scene-available",
        "three-unavailable",
        "located"
      ])) : $("", !0),
      s("div", rs, [
        e.compact ? $("", !0) : (c(), v(O, { key: 0 }, [
          s("header", ls, [
            z(T, { name: f.value ? "layers" : "search" }, null, 8, ["name"]),
            f.value ? (c(), v("div", cs, [D(w(R.value?.name || b(te).scene), 1), s("small", null, w(r.value ? b(N).sceneBrowsing : b(N).sceneCurrent), 1)])) : (c(), v("button", {
              key: 0,
              type: "button",
              class: "map-search-entry",
              disabled: !g.value?.locations.length,
              onClick: _[5] || (_[5] = (L) => k.value = "all")
            }, [D(w(x.value.search), 1), s("small", null, w(ee.value), 1)], 8, is)),
            ie(j.$slots, "toolbar")
          ]),
          g.value?.locations.length ? (c(), v("div", us, [s("nav", {
            class: "map-view-switch",
            "aria-label": b(N).viewLabel
          }, [
            s("button", {
              type: "button",
              "aria-pressed": u.value.kind === "world",
              onClick: pe
            }, [z(T, { name: "globe" }), D(w(b(te).world), 1)], 8, vs),
            s("button", {
              type: "button",
              "aria-pressed": u.value.kind === "region",
              onClick: _[6] || (_[6] = (L) => K())
            }, [z(T, { name: "compass" }), D(w(b(te).region), 1)], 8, hs),
            s("button", {
              type: "button",
              "aria-pressed": f.value,
              onClick: _[7] || (_[7] = (L) => he())
            }, [z(T, { name: "layers" }), D(w(b(te).scene), 1)], 8, ps)
          ], 8, ds), f.value ? (c(), v("div", fs, [r.value ? (c(), v("button", {
            key: 0,
            type: "button",
            class: "map-round-button",
            "aria-label": "回到当前场景",
            onClick: _[8] || (_[8] = (L) => he())
          }, [z(T, { name: "locate" })])) : $("", !0), s("button", {
            type: "button",
            class: "map-round-button",
            "aria-expanded": S.value,
            "aria-label": b(N).legendLabel,
            onClick: _[9] || (_[9] = (L) => S.value = !S.value)
          }, [z(T, { name: "layers" })], 8, ys)])) : $("", !0)])) : $("", !0),
          g.value?.locations.length && !f.value ? (c(), v("nav", {
            key: 1,
            class: "map-region-trail",
            "aria-label": b(N).trailLabel
          }, [s("button", {
            type: "button",
            "aria-current": u.value.kind === "world" ? "page" : void 0,
            onClick: pe
          }, [z(T, { name: "globe" }), D(w(b(te).world), 1)], 8, ms), u.value.kind === "region" ? (c(), v(O, { key: 0 }, [z(T, { name: "next" }), s("span", bs, w(ee.value), 1)], 64)) : $("", !0)], 8, gs)) : $("", !0)
        ], 64)),
        a.value ? (c(), v("aside", ws, [s("p", null, w(a.value), 1), s("button", {
          type: "button",
          class: "map-notice-close",
          "aria-label": "关闭三维提示",
          onClick: _[10] || (_[10] = (L) => a.value = "")
        }, [z(T, { name: "close" })])])) : $("", !0),
        ie(j.$slots, "feedback")
      ]),
      s("div", { class: J(["map-canvas", { "has-detail": Y.value && !f.value }]) }, [e.map && g.value?.locations.length ? (c(), v(O, { key: 0 }, [
        I.value.locations.length ? Ne((c(), F(Zt, {
          key: 0,
          atlas: e.map.atlas,
          scope: I.value,
          label: ee.value,
          "current-location-key": C.value,
          "selected-location-key": t.value,
          "focus-key": m.value,
          "focus-sequence": M.value,
          onSelect: _[11] || (_[11] = (L) => G(L))
        }, null, 8, [
          "atlas",
          "scope",
          "label",
          "current-location-key",
          "selected-location-key",
          "focus-key",
          "focus-sequence"
        ])), [[Qe, !f.value]]) : $("", !0),
        f.value ? (c(), v(O, { key: 1 }, [U.value?.status === "active" ? (c(), F(po, {
          key: 0,
          mode: h.value,
          "onUpdate:mode": _[12] || (_[12] = (L) => h.value = L),
          "low-walls": i.value,
          "onUpdate:lowWalls": _[13] || (_[13] = (L) => i.value = L),
          "show-labels": d.value,
          "onUpdate:showLabels": _[14] || (_[14] = (L) => d.value = L),
          scene: U.value,
          compact: e.compact,
          "three-unavailable": y.value,
          onFallback: dt
        }, null, 8, [
          "mode",
          "low-walls",
          "show-labels",
          "scene",
          "compact",
          "three-unavailable"
        ])) : (c(), v("div", ks, [
          z(T, { name: "layers" }),
          s("h2", null, w(R.value ? b(N).sceneEmpty : b(N).unknownLocation), 1),
          r.value && r.value !== C.value ? (c(), v("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: _[15] || (_[15] = (L) => H.value ? K(H.value.key) : pe())
          }, w(H.value ? b(N).regionMap : b(te).world), 1)) : ie(j.$slots, "scene-empty-action", { located: !!R.value }, void 0, void 0, 1)
        ]))], 64)) : $("", !0),
        !f.value && !I.value.locations.length ? (c(), v("div", Ms, [
          z(T, { name: "pin" }),
          s("h2", null, w(u.value.kind === "region" && !H.value ? b(N).unknownRegion : x.value.empty), 1),
          s("p", null, w(u.value.kind === "region" && !H.value ? b(N).unknownRegionHint : x.value.emptyHint), 1),
          u.value.kind === "region" ? (c(), v("button", {
            key: 0,
            type: "button",
            class: "map-secondary-button",
            onClick: pe
          }, w(b(te).world), 1)) : ie(j.$slots, "scope-empty-action", {}, void 0, void 0, 1)
        ])) : $("", !0)
      ], 64)) : ie(j.$slots, "empty-map", {}, () => [s("div", _s, [z(T, { name: "globe" }), s("h2", null, w(b(me).empty), 1)])], void 0, 1)], 2),
      !e.compact && g.value?.locations.length && !f.value ? (c(), v("div", {
        key: 1,
        class: J(["map-floating-tools", { "has-detail": Y.value }])
      }, [s("button", {
        type: "button",
        class: "map-round-button",
        disabled: !E.value,
        "aria-label": "回到我的位置",
        onClick: re
      }, [z(T, { name: "locate" })], 8, $s), s("button", {
        type: "button",
        class: "map-round-button",
        "aria-expanded": S.value,
        "aria-label": b(N).legendLabel,
        onClick: _[16] || (_[16] = (L) => S.value = !S.value)
      }, [z(T, { name: "layers" })], 8, xs)], 2)) : $("", !0),
      S.value ? (c(), v("aside", Ls, [z(ut)])) : $("", !0),
      Y.value && e.map && !f.value ? (c(), F(ss, {
        key: Y.value.key,
        location: Y.value,
        map: e.map,
        "current-key": C.value,
        onClose: _[17] || (_[17] = (L) => t.value = ""),
        onScene: _[18] || (_[18] = (L) => he(Y.value.key)),
        onExplore: _[19] || (_[19] = (L) => K(Y.value.key)),
        onSelect: _[20] || (_[20] = (L) => G(L, !0))
      }, null, 8, [
        "location",
        "map",
        "current-key"
      ])) : !e.compact && g.value?.locations.length && !f.value ? (c(), v("button", {
        key: 4,
        type: "button",
        class: "map-region-card",
        "aria-label": b(Et)(I.value.kind, P.value),
        "aria-describedby": o,
        onClick: _[21] || (_[21] = (L) => k.value = P.value)
      }, [
        s("span", Ss, [z(T, { name: I.value.kind === "world" ? "globe" : "compass" }, null, 8, ["name"])]),
        s("span", {
          id: o,
          class: "map-region-summary"
        }, [s("strong", null, w(ee.value), 1), s("small", null, w(b(Ot)(I.value.kind, I.value.locations.length, I.value.unvisited)), 1)]),
        s("span", js, [z(T, { name: "next" })])
      ], 8, Cs)) : !e.compact && f.value && g.value?.locations.length ? (c(), v("footer", Os, [z(T, { name: "layers" }), s("span", null, [s("strong", null, w(R.value?.name || "当前位置待确认"), 1), s("small", null, w(r.value ? "正在查看场景图 · 不会移动人物" : "当前位置的场景图"), 1)])])) : $("", !0),
      e.compact && g.value?.locations.length && !Y.value ? (c(), v("div", {
        key: 6,
        class: "map-projection-caption",
        title: f.value ? R.value?.name : ee.value
      }, [z(T, { name: f.value ? "pin" : "compass" }, null, 8, ["name"]), s("span", null, w(f.value ? R.value?.name || b(N).unknownLocation : ee.value), 1)], 8, Es)) : $("", !0),
      k.value && g.value ? (c(), F(qo, {
        key: 7,
        scope: I.value,
        title: ee.value,
        "initial-filter": k.value,
        onClose: _[22] || (_[22] = (L) => k.value = null),
        onSelect: _[23] || (_[23] = (L) => G(L))
      }, null, 8, [
        "scope",
        "title",
        "initial-filter"
      ])) : $("", !0),
      ie(j.$slots, "overlay")
    ], 2));
  }
}), Ds = As;
export {
  Dt as C,
  mt as D,
  T as E,
  at as S,
  me as T,
  Gs as _,
  an as a,
  Ke as b,
  st as c,
  Ba as d,
  ve as f,
  De as g,
  se as h,
  fn as i,
  qs as l,
  He as m,
  Fe as n,
  dn as o,
  Te as p,
  gn as r,
  vn as s,
  Ds as t,
  Ha as u,
  Be as v,
  N as w,
  _a as x,
  _e as y
};
