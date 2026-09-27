/* eslint-disable */
import { C as xe, E as Se, Ft as ae, M as W, Ot as ke, St as ee, X as V, Y as j, Z as ve, _ as Ae, at as Ce, b as q, bt as Le, c as oe, f as Ee, g as Fe, h as te, lt as re, n as Pe, o as Ge, ot as se, t as Ie, u as X, wt as Re, x as Oe, xt as ie, yt as ze, z as ne } from "./xiaobai-os-three.module-DlsF37OG.js";
import { a as Te, c as We, i as _e, l as Be, n as De, s as J, t as ce, u as le } from "./xiaobai-os-materials-BLRbkJ4k.js";
import { n as Ue, r as je, t as Z } from "./xiaobai-os-resources-LQ2LTqLo.js";
function de(s) {
  const e = le(s), i = [], c = (n, t, a) => {
    for (const r of [
      n,
      t,
      a
    ]) i.push(r[0], -r[1], 0);
  };
  if (We(s)) for (const [n, t, a] of Re.triangulateShape(e.map((r) => new ae(...r)), [])) c(e[n], e[t], e[a]);
  else {
    const n = "width" in s ? (s.width || 1) / 2 : 2;
    for (let t = 1; t < e.length; t++) {
      const a = e[t - 1], r = e[t], p = Math.hypot(r[0] - a[0], r[1] - a[1]);
      if (!p) continue;
      const l = -(r[1] - a[1]) / p * n, f = (r[0] - a[0]) / p * n, u = [
        [a[0] + l, a[1] + f],
        [r[0] + l, r[1] + f],
        [r[0] - l, r[1] - f],
        [a[0] - l, a[1] - f]
      ];
      c(u[0], u[1], u[2]), c(u[0], u[2], u[3]);
    }
    for (const t of e) for (let a = 0; a < 16; a++) {
      const r = a * Math.PI / 8, p = (a + 1) * Math.PI / 8;
      c(t, [t[0] + Math.cos(r) * n, t[1] + Math.sin(r) * n], [t[0] + Math.cos(p) * n, t[1] + Math.sin(p) * n]);
    }
  }
  const d = new oe();
  return d.setAttribute("position", new q(i, 3)), d.setAttribute("uv", new q(i.flatMap((n, t) => t % 3 === 0 ? [i[t] / 64, -i[t + 1] / 64] : []), 2)), d.computeVertexNormals(), d;
}
function Ze() {
  const s = new Z(), e = new Uint8Array(4096 * 4);
  let i = 21841;
  for (let l = 0; l < e.length; l += 4)
    i = Math.imul(i, 1664525) + 1013904223 >>> 0, e[l] = e[l + 1] = e[l + 2] = 250 + i % 6, e[l + 3] = 255;
  const c = s.own(new te(e, 64, 64));
  c.wrapS = c.wrapT = ze, c.magFilter = ne, c.colorSpace = ie, c.needsUpdate = !0;
  const d = new Uint8Array(4096 * 4);
  for (let l = 0; l < 64; l++) for (let f = 0; f < 64; f++) {
    const u = (l * 64 + f) * 4;
    d[u] = d[u + 1] = d[u + 2] = 255, d[u + 3] = Math.round(Math.max(0, 1 - Math.hypot(f - 31.5, l - 31.5) / 31.5) ** 2 * 255);
  }
  const n = s.own(new te(d, 64, 64));
  n.magFilter = ne, n.needsUpdate = !0;
  const t = /* @__PURE__ */ new Map(), a = {
    tree: s.own(new xe(1, 1)),
    mist: s.own(new re(2, 2)),
    roof: s.own(new Ee(1, 1, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4)),
    cube: s.own(new Ge(1, 1, 1)),
    rock: s.own(new Ae(1, 0)),
    sphere: s.own(new ke(1, 32, 20))
  };
  function r(l, f = "base", u = !1) {
    const M = [
      "relief",
      "dunes",
      "detail",
      "celestial"
    ].includes(f), g = f === "detail", b = f === "mist", o = `${l}:${f}:${u}`;
    if (!t.has(o)) {
      const m = ce[l], y = new X(g ? m.ink : m.base);
      g && l === "forest" && y.lerp(new X(m.light), 0.45);
      const S = {
        color: y,
        side: 2,
        depthTest: M,
        depthWrite: M,
        transparent: u,
        premultipliedAlpha: u,
        blending: u ? 4 : 1,
        stencilWrite: !0,
        stencilFunc: 514,
        stencilFail: W,
        stencilZFail: W,
        stencilZPass: W,
        stencilWriteMask: 0
      };
      t.set(o, s.own(b ? new V({
        ...S,
        map: n,
        transparent: !0,
        opacity: 0.28,
        depthTest: !1,
        depthWrite: !1
      }) : M ? new ve({
        ...S,
        flatShading: f !== "celestial" && f !== "dunes"
      }) : new V({
        ...S,
        map: c
      })));
    }
    return t.get(o);
  }
  function p(l) {
    for (const f of t.values()) $e(f, l);
  }
  return {
    material: r,
    shapes: a,
    stencil: p,
    dispose: () => s.dispose()
  };
}
function $e(s, e) {
  s.stencilRef = e, s.stencilFuncMask = e;
}
function fe(s) {
  let e = 2166136261;
  for (let i = 0; i < s.length; i++) e = Math.imul(e ^ s.charCodeAt(i), 16777619);
  return e >>> 0;
}
function Ke(s, e, i, c = 192, d = 48) {
  const n = d;
  let t = 2 ** Math.max(0, Math.ceil(Math.log2(i * 6 / n)));
  const a = J(s.geometry), r = Be(s.geometry), p = (o) => [
    Math.floor(Math.max(a[0], e[0] - n * 2) / o),
    Math.floor(Math.max(a[1], e[1] - n * 2) / o),
    Math.ceil(Math.min(a[0] + a[2], e[0] + e[2] + n * 2) / o),
    Math.ceil(Math.min(a[1] + a[3], e[1] + e[3] + n * 2) / o)
  ];
  let l = p(n * t);
  for (; Math.max(0, l[2] - l[0]) * Math.max(0, l[3] - l[1]) > Math.max(4, c); )
    t *= 2, l = p(n * t);
  const [f, u, M, g] = l, b = [];
  for (let o = u; o < g && b.length < c; o++) for (let m = f; m < M && b.length < c; m++) {
    const y = m * t, S = o * t, E = `${s.id}:${y}:${S}`, x = fe(E), k = y * n + ((x & 255) / 255 - 0.5) * n * 0.55, F = S * n + ((x >>> 8 & 255) / 255 - 0.5) * n * 0.55;
    s.form === "scattered" && x % 3 !== 0 || r([k, F]) && b.push({
      id: E,
      x: k,
      y: F,
      size: n * (0.45 + (x >>> 16 & 255) / 255 * 0.2),
      variant: x % 3
    });
  }
  return b;
}
var Ne = 1024, Ve = 1600, qe = (s) => s.form || (s.material === "forest" ? "forest" : s.material === "vacuum" ? "stars" : "plain");
function Xe(s) {
  const { id: e, geometry: i, material: c, form: d, role: n } = s.source;
  return JSON.stringify([
    e,
    i,
    c,
    d,
    n,
    s.mapping
  ]);
}
function Je(s, e) {
  const { scale: i, offset: c } = s.mapping;
  return [
    (e[0] - c[0]) / i,
    (e[1] - c[1]) / i,
    e[2] / i,
    e[3] / i
  ];
}
function ue(s) {
  const e = new Oe(), { scale: i, offset: c } = s.mapping;
  return e.position.set(c[0], -c[1], 0), e.scale.setScalar(i), e;
}
function Ye(s, e) {
  const i = new Z(), c = ue(s), d = s.source, n = i.own(de(d.geometry)), t = d.role === "relief";
  if (![
    "asteroids",
    "nebula",
    "celestial"
  ].includes(d.form || "") && !(t && ["ridge", "dunes"].includes(d.form || "")) && c.add(new j(n, e.material(d.material, "base", t))), d.form === "celestial") {
    const [a, r, p, l] = J(d.geometry), f = new j(e.shapes.sphere, e.material(d.material, "celestial"));
    f.position.set(a + p / 2, -r - l / 2, 0), f.scale.set(p / 2, l / 2, Math.min(p, l) / 2), c.add(f);
  }
  return {
    group: c,
    footprint: n,
    dispose() {
      c.removeFromParent(), i.dispose();
    }
  };
}
function He(s, e, i, c, d) {
  const n = s.source, t = J(n.geometry), a = Je(s, e), r = qe(n), p = Math.max(1, Math.min(t[2], t[3])), l = Math.max(0.25, Math.min(48, p / (r === "forest" ? 16 : 10))), f = [
    "forest",
    "scattered",
    "compact",
    "blocks",
    "towers",
    "asteroids",
    "stars",
    "nebula"
  ].includes(r) ? Ke(n, a, i / s.mapping.scale, Math.max(1, c), l) : [];
  let u, M = 0;
  if (["ridge", "dunes"].includes(r)) {
    const g = Math.max(t[0], a[0]), b = Math.max(t[1], a[1]), o = Math.max(0, Math.min(t[0] + t[2], a[0] + a[2]) - g), m = Math.max(0, Math.min(t[1] + t[3], a[1] + a[3]) - b);
    M = 2 ** Math.ceil(Math.log2(Math.max(p / 48, i / s.mapping.scale * 5, Math.sqrt(o * m / Math.max(1, d)))));
    const y = () => [
      Math.floor(g / M),
      Math.floor(b / M),
      Math.ceil((g + o) / M),
      Math.ceil((b + m) / M)
    ];
    for (u = y(); (u[2] - u[0]) * (u[3] - u[1]) > Math.max(4, d); )
      M *= 2, u = y();
  }
  return {
    kind: r,
    samples: f,
    grid: u,
    step: M,
    bounds: t,
    key: JSON.stringify([
      r,
      f,
      u,
      M
    ])
  };
}
function Qe(s, e, i, c, d) {
  const n = s / c, t = e / c, a = i % 997, r = Math.sin(n * (d ? 36 : 22) + Math.sin(t * 11 + a) * 1.4 + a), p = (1 - Math.abs(r)) ** (d ? 1.2 : 1.8), l = (Math.sin(n * 43 - t * 31 + a) + 1) / 2;
  return c * (d ? 0.08 : 0.22) * (p * 0.8 + l * 0.2);
}
function et(s, e) {
  const i = [], c = [], [d, n, t, a] = s.grid, r = s.step, p = Math.max(1, Math.min(s.bounds[2], s.bounds[3])), l = fe(e), f = t - d + 1;
  for (let M = n; M <= a; M++) for (let g = d; g <= t; g++) {
    const b = g * r, o = M * r;
    if (i.push(b, -o, Qe(b, o, l, p, s.kind === "dunes") + 0.1), g < t && M < a) {
      const m = (M - n) * f + g - d;
      c.push(m, m + f, m + 1, m + 1, m + f, m + f + 1);
    }
  }
  const u = new oe();
  return u.setAttribute("position", new q(i, 3)), u.setIndex(c), u.computeVertexNormals(), u;
}
function tt(s, e, i) {
  const c = new Z(), d = ue(s), n = s.source;
  if (e.grid && d.add(new j(c.own(et(e, n.id)), i.material(n.material, e.kind === "dunes" ? "dunes" : "relief", n.role === "relief"))), e.samples.length) {
    const t = e.kind === "forest", a = e.kind === "stars", r = e.kind === "nebula", p = [
      "blocks",
      "compact",
      "scattered",
      "towers"
    ].includes(e.kind), l = r ? i.shapes.mist : t ? i.shapes.tree : p ? e.kind === "towers" ? i.shapes.cube : i.shapes.roof : i.shapes.rock, f = i.material(a ? "cold-light" : n.material, r ? "mist" : a ? "star" : t || p ? "detail" : "relief"), u = r ? le(n.geometry) : [], M = c.own(new Se(l, f, e.samples.length)), g = new Ce(), b = new X();
    M.frustumCulled = !1, e.samples.forEach((o, m) => {
      let y = o.size;
      if (t && (y *= 1.4), a && (y *= 0.035), e.kind === "asteroids" && (y *= 0.28), r) {
        let E = 1 / 0;
        for (let x = 0; x < u.length; x++) {
          const k = u[x], F = u[(x + 1) % u.length], z = F[0] - k[0], G = F[1] - k[1], T = Math.max(0, Math.min(1, ((o.x - k[0]) * z + (o.y - k[1]) * G) / (z * z + G * G || 1)));
          E = Math.min(E, Math.hypot(o.x - k[0] - z * T, o.y - k[1] - G * T));
        }
        y = Math.min(y * 5, E);
      }
      const S = y * (e.kind === "towers" ? 1.4 : 0.55);
      g.position.set(o.x, -o.y, S), g.rotation.set(0, 0, p ? 0 : o.variant * 0.6), g.scale.set(y, y * (p ? 0.7 : 1), S), g.updateMatrix(), M.setMatrixAt(m, g.matrix), b.setHSL(t ? 0.34 + o.variant * 0.02 : 0.08, t ? 0.15 : 0.04, 0.65 + o.variant * 0.12), M.setColorAt(m, b);
    }), M.instanceMatrix.needsUpdate = !0, d.add(M);
  }
  return {
    group: d,
    dispose() {
      d.removeFromParent(), c.dispose();
    }
  };
}
function ot(s, e, i) {
  const c = new Z(), d = Ze(), n = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = new ee(), r = new se(-1, 1, 1, -1, 0.01, 2e7), p = new Fe("#ffffff", 2);
  p.position.set(-1, 2, 4), a.add(new Pe("#ffffff", 1.3), p);
  const l = new ee(), f = c.own(new V({
    colorWrite: !1,
    depthTest: !1,
    depthWrite: !1,
    side: 2,
    stencilWrite: !0,
    stencilFail: W,
    stencilZFail: W
  })), u = c.own(new re(2, 2)), M = new j(u, f);
  M.frustumCulled = !1, l.add(M);
  const g = new se(-1, 1, 1, -1, 0.01, 10);
  g.position.z = 1;
  const b = new ae();
  let o, m, y = !1, S = !0;
  const E = Ue(me, () => !y && S && !!m && m.size[0] > 0 && m.size[1] > 0), x = new AbortController();
  let k, F;
  const z = () => {
    for (const h of n.values())
      h.body.dispose(), h.details?.dispose();
    n.clear();
  };
  function G() {
    if (!y) {
      y = !0, E.cancel(), x.abort(), k?.disconnect(), F?.disconnect(), z();
      for (const h of t.values()) h.dispose();
      t.clear(), c.dispose(), d.dispose(), a.clear(), l.clear(), o?.dispose(), o?.forceContextLoss(), o?.domElement.remove();
    }
  }
  function T(h) {
    y || (G(), e(h));
  }
  function $(h, R) {
    const v = JSON.stringify(h);
    return R.add(v), t.has(v) || t.set(v, de(h)), t.get(v);
  }
  function _(h, R, v, P, A = !1, L = !1) {
    M.geometry = h, f.stencilRef = R, f.stencilFuncMask = v, f.stencilWriteMask = P, f.stencilFunc = v ? 514 : 519, f.stencilZPass = A ? 0 : Le, o.render(l, L ? g : r);
  }
  function he(h, R, v) {
    const P = De(h, R);
    m.projection.clip && P.intersections.push(m.projection.clip), o.state.buffers.stencil.setMask(255), o.clear(!1, !0, !0);
    let A = 1;
    _($(P.intersections[0], v), A, 0, A);
    for (const L of P.intersections.slice(1)) {
      const I = A === 1 ? 2 : 1;
      _(u, 0, 0, I, !0, !0), _($(L, v), A | I, A, I), A = I;
    }
    for (const L of P.exclusions) _($(L.geometry, v), 0, 0, A, !0);
    d.stencil(A);
  }
  function me() {
    if (!(y || !m || !o))
      try {
        const { projection: h, viewport: [R, v, P, A], size: L, unitScale: I } = m;
        o.getSize(b), (b.x !== L[0] || b.y !== L[1]) && o.setSize(L[0], L[1], !1);
        const Y = I * L[0], H = I * L[1];
        r.left = -Y / 2, r.right = Y / 2, r.top = H / 2, r.bottom = -H / 2;
        const K = Math.max(P, A, ...h.features.map((w) => Math.max(w.bounds[2], w.bounds[3]))) * 4 + 10;
        r.near = K * 0.01, r.far = K * 3, r.position.set(R + P / 2, -v - A / 2, K), r.updateProjectionMatrix(), r.updateMatrixWorld();
        const D = h.features.filter((w) => w.source.role === "environment"), pe = D.length && D.every((w) => w.source.material === D[0].source.material), Me = getComputedStyle(s).getPropertyValue("--atlas-paper").trim();
        o.setClearColor(pe ? ce[D[0].source.material].base : Me), o.state.buffers.stencil.setMask(255), o.clear();
        const U = _e(h.features.filter((w) => Te(w.bounds, m.viewport))), we = new Set(U.map((w) => w.source.id)), Q = /* @__PURE__ */ new Set();
        for (const [w, O] of n) we.has(w) || (O.body.dispose(), O.details?.dispose(), n.delete(w));
        const ge = [...h.features, ...h.carriers], ye = Math.max(1, Math.floor(Ne / Math.max(1, U.length))), be = Math.max(1, Math.floor(Ve / Math.max(1, U.filter((w) => ["ridge", "dunes"].includes(w.source.form || "")).length)));
        for (const w of U) {
          const O = Xe(w);
          let C = n.get(w.source.id);
          C?.key !== O && (C?.body.dispose(), C?.details?.dispose(), C = {
            key: O,
            body: Ye(w, d)
          }, n.set(w.source.id, C));
          const N = He(w, m.viewport, I, ye, be);
          C.detailKey !== N.key && (C.details?.dispose(), C.details = tt(w, N, d), C.detailKey = N.key), he(w, ge, Q), a.add(C.body.group, C.details.group), o.render(a, r), a.remove(C.body.group, C.details.group);
        }
        for (const [w, O] of t) Q.has(w) || (O.dispose(), t.delete(w));
        i();
      } catch (h) {
        T(h);
      }
  }
  function B() {
    E.request();
  }
  try {
    o = new Ie({
      antialias: !0,
      alpha: !1,
      stencil: !0,
      powerPreference: "low-power"
    }), o.setPixelRatio(je()), o.outputColorSpace = ie, o.autoClear = !1, o.debug.onShaderError = () => T(/* @__PURE__ */ new Error("atlas_shader_failed")), o.domElement.setAttribute("aria-hidden", "true"), s.prepend(o.domElement), o.domElement.addEventListener("webglcontextlost", (h) => {
      h.preventDefault(), T(/* @__PURE__ */ new Error("atlas_context_lost"));
    }, { signal: x.signal }), k = new IntersectionObserver((h) => {
      S = h[0].isIntersecting, S ? B() : E.cancel();
    }), k.observe(s), document.addEventListener("visibilitychange", () => {
      document.hidden ? E.cancel() : B();
    }, { signal: x.signal }), F = new MutationObserver(B);
    for (let h = s; h; h = h.parentElement) F.observe(h, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    return {
      dispose: G,
      update(h) {
        m = h, B();
      }
    };
  } catch (h) {
    throw G(), h;
  }
}
export {
  ot as createAtlasRuntime
};
