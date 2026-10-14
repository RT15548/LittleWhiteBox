/* eslint-disable */
import { $ as de, D as ue, E as Ce, I as ra, M as la, N as da, P as Pt, R as Rt, S as _, T as le, U as X, V as g, X as me, at as ua, b as $e, d as Ae, dt as qt, ft as p, h as T, i as kt, lt as n, m as Re, p as ca, r as va, rt as V, u as Pe, ut as De, v as W, x as I, y } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as pe } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { $ as Lt, B as fa, Bt, Ct as pa, D as ie, Dt as ma, E as ha, Et as pt, Ft as We, Ht as nt, M as ba, Nt as mt, O as ya, Ot as ka, Q as gt, R as ga, S as wa, T as _e, Tt as Wt, U as _a, Ut as ht, Vt as Xe, Wt as q, _t as xa, a as Ma, b as $a, c as Ca, d as dt, dt as Aa, et as oe, f as ut, g as Dt, i as wt, it as xe, jt as Sa, k as Ia, l as Fe, m as ot, n as Ea, o as ct, s as Ee, tt as Tt, u as Pa, ut as Ra, v as Be, vt as qa, wt as La, x as Ft, yt as Ba, zt as Wa } from "./xiaobai-os-three.module-Bxd-t3Ck.js";
import { t as Ut } from "./xiaobai-os-BufferGeometryUtils-Cb-FyMS_.js";
import { C as bt, S as Ge, _ as Da, a as Ta, b as Me, c as Fa, d as Ze, f as je, g as Ua, h as Na, i as Nt, l as Y, m as za, n as o, o as Se, p as be, r as lt, s as ze, t as Oa, u as Ga, v as we, x as rt, y as ce } from "./xiaobai-os-shore-cover-CFqEuhxy.js";
import { t as Va } from "./xiaobai-os-GLTFLoader-C4rUKqFr.js";
var ja = (e) => [
  "travel",
  "drag",
  "rest",
  "take",
  "work",
  "construct"
].includes(e.kind), _t = (e) => [
  "say",
  "declare",
  "offer",
  "accept"
].includes(e.kind);
function Ha(e, l) {
  const t = ua(null), a = V(!1), i = V(""), s = V(!1), r = V(null);
  let d = !1, f = null, k = null;
  function c($) {
    if (!(d || t.value && $.revision < t.value.revision) && (t.value = $, k?.id === $.lastRequest)) {
      const b = k.accepted;
      k = null, b();
    }
  }
  const u = e.subscribe(($) => {
    if ($.type !== "game/island/state") return;
    const b = $.payload;
    b.chatIdentity === l && (f = b.state, c(b.state));
  });
  async function v($, b = {}) {
    if (d || a.value) return !1;
    a.value = !0, i.value = "", r.value = null, f = null;
    try {
      const { result: C } = await e.request(`game/island/${$}`, {
        chatIdentity: l,
        actionId: crypto.randomUUID(),
        revision: t.value?.revision ?? 0,
        ...b
      }, $ === "think" || $ === "interpret" ? 36e4 : 35e3), w = f;
      return c(w && w.revision >= C.revision ? w : C), s.value = !1, !0;
    } catch (C) {
      i.value = lt(C), r.value = $;
      const w = C?.code ?? "";
      return s.value = w.startsWith("host_request_") || w.startsWith("island_save_") || w === "island_memory_save", !1;
    } finally {
      a.value = !1;
    }
  }
  const m = W(() => a.value || t.value?.busy || s.value || t.value?.pending || t.value?.memoryPending || t.value?.writeState !== "ready");
  async function h() {
    for (let $ = 0; $ < 6 && t.value?.needsDecision; $++) if (!await v("think", { reason: "decision" })) return !1;
    return !t.value?.needsDecision;
  }
  const A = () => t.value?.recent.at(-1)?.sequence ?? 0, M = ($) => t.value?.recent.some((b) => b.sequence > $ && b.audience.includes("player") && ((b.payload.kind === "speech" || b.payload.kind === "declaration") && b.payload.actor !== "player" || b.payload.kind === "offered" && b.payload.to === "player"));
  return {
    view: t,
    busy: a,
    error: i,
    blocked: m,
    uncertain: s,
    failedRequest: r,
    read: () => v("read"),
    recover: () => v("confirm"),
    settings: () => v("settings"),
    async history($) {
      try {
        const { result: b } = await e.request("game/island/history", {
          chatIdentity: l,
          after: $,
          limit: 40
        }, 35e3);
        return b;
      } catch (b) {
        return i.value = lt(b), null;
      }
    },
    async start($) {
      return await v("start", { mode: $ }) && await h();
    },
    async act($) {
      return m.value || !await v("act", { operation: $ }) ? !1 : _t($) && t.value?.scene !== "alone" ? v("think", { reason: "response" }) : !0;
    },
    async speak($, b) {
      if (m.value) return !1;
      const C = crypto.randomUUID();
      return k = {
        id: C,
        accepted: b
      }, await v("act", {
        actionId: C,
        operation: {
          kind: "say",
          text: $
        }
      }) ? t.value?.scene === "alone" || await v("think", { reason: "response" }) : (s.value || (k = null), !1);
    },
    async interpret($) {
      return m.value ? !1 : v("interpret", { text: $ });
    },
    async dismissIntent() {
      return m.value || !t.value?.intent ? !1 : v("dismiss-intent", { intentId: t.value.intent.id });
    },
    async acceptIntent($) {
      const b = t.value?.intent;
      if (m.value || b?.result.kind !== "action") return null;
      const C = b.result.operation;
      return k = {
        id: b.id,
        accepted: $
      }, await v("accept-intent", {
        actionId: b.id,
        revision: b.revision
      }) ? _t(C) && t.value?.scene !== "alone" && !await v("think", { reason: "response" }) ? null : C : (s.value || (k = null), null);
    },
    async advance($) {
      const b = A();
      if (m.value || !await h()) return !1;
      if (M(b)) return !0;
      const C = t.value.player.clock, w = !!t.value.player.self.activity;
      for (let x = 0; x < 6; x++) {
        const P = $ - (t.value.player.clock - C);
        if (P <= 0) return !0;
        if (!await v("advance", { seconds: P })) return !1;
        if (t.value?.step === "contact") return await h();
        if (t.value?.step !== "decision" || t.value.phase !== "living") return !0;
        const S = A();
        if (!await h()) return !1;
        if (M(S) || w && !t.value?.player?.self.activity) return !0;
      }
      return !0;
    },
    async think() {
      return m.value ? !1 : t.value?.needsDecision ? h() : v("think", { reason: "response" });
    },
    async cancel() {
      try {
        await e.request("game/island/cancel", { chatIdentity: l }, 35e3);
      } catch ($) {
        i.value = lt($);
      }
    },
    dispose() {
      d = !0, k = null, u();
    }
  };
}
var Ya = [
  "shelter",
  "raincatcher",
  "latrine",
  "firepit",
  "signal"
], Ka = [
  "tear_cloth",
  "twist_cord",
  "foot_wraps",
  "open_coconut",
  "coir_cord",
  "weave_basket",
  "dry_tinder",
  "fire_drill",
  "cook_fish"
], Xa = {
  halfWidth: 0.95,
  offset: 0.8,
  height: 1.75
};
function fe(e, l) {
  return Math.hypot(e.x - l.x, e.y - l.y);
}
function Ie(e, l) {
  return fe(e, l) <= rt.reachMetres + 1e-8;
}
var Oe = (e, l, t) => (l.x - e.x) * (t.y - e.y) - (l.y - e.y) * (t.x - e.x);
function Ke(e, l, t) {
  return Math.abs(Oe(e, l, t)) < 1e-8 && t.x >= Math.min(e.x, l.x) && t.x <= Math.max(e.x, l.x) && t.y >= Math.min(e.y, l.y) && t.y <= Math.max(e.y, l.y);
}
function Za(e, l, t, a) {
  return Oe(e, l, t) * Oe(e, l, a) < 0 && Oe(t, a, e) * Oe(t, a, l) < 0 || Ke(e, l, t) || Ke(e, l, a) || Ke(t, a, e) || Ke(t, a, l);
}
function Te(e, l) {
  let t = !1;
  for (let a = 0, i = l.length - 1; a < l.length; i = a++) {
    const s = l[a], r = l[i];
    if (Ke(s, r, e)) return !0;
    s.y > e.y != r.y > e.y && e.x < (r.x - s.x) * (e.y - s.y) / (r.y - s.y) + s.x && (t = !t);
  }
  return t;
}
function Qa(e, l, t) {
  return Te(e, t) || Te(l, t) || t.some((a, i) => Za(e, l, a, t[(i + 1) % t.length]));
}
function Qe(e, l) {
  return Te(e, l.land) && !l.obstacles.some((t) => Te(e, t));
}
function Ja(e, l, t) {
  if (!Qe(e, t) || !Qe(l, t) || t.obstacles.some((d) => Qa(e, l, d))) return !1;
  const a = l.x - e.x, i = l.y - e.y, s = a * a + i * i;
  if (!s) return !0;
  const r = [0, 1];
  for (let d = 0; d < t.land.length; d++) {
    const f = t.land[d], k = t.land[(d + 1) % t.land.length], c = k.x - f.x, u = k.y - f.y, v = a * u - i * c;
    if (Math.abs(v) < 1e-8) {
      if (Math.abs(Oe(e, l, f)) < 1e-8) for (const m of [f, k]) {
        const h = ((m.x - e.x) * a + (m.y - e.y) * i) / s;
        h > 0 && h < 1 && r.push(h);
      }
    } else {
      const m = ((f.x - e.x) * u - (f.y - e.y) * c) / v, h = ((f.x - e.x) * i - (f.y - e.y) * a) / v;
      m > 0 && m < 1 && h >= 0 && h <= 1 && r.push(m);
    }
  }
  return r.sort((d, f) => d - f), r.slice(1).every((d, f) => {
    const k = (r[f] + d) / 2;
    return Te({
      x: e.x + a * k,
      y: e.y + i * k
    }, t.land);
  });
}
var He = {
  seep: {
    radius: 0.8,
    depth: 0.18,
    waterDepth: 0.065
  },
  reef_food: {
    radius: 3.3,
    depth: 0.55,
    waterDepth: 0.32
  }
}, Ve = {
  base: 0.9,
  lobes: 0.08,
  detail: 0.06
}, it = Object.values(Fa).filter((e) => e.kind === "seep" || e.kind === "reef_food");
function vt(e, l, t) {
  const a = l.x * 0.13 + l.y * 0.07;
  return He[e].radius * (Ve.base + Math.sin(t * 3 + a) * Ve.lobes + Math.cos(t * 5 - a) * Ve.detail);
}
function zt(e) {
  return He[e].radius * (Ve.base + Ve.lobes + Ve.detail);
}
function en(e, l) {
  const t = e.x - l.position.x, a = e.y - l.position.y;
  return Math.hypot(t, a) / vt(l.kind, l.position, Math.atan2(a, t));
}
function Je(e) {
  return Ge.lowWater + (Ge.highWater - Ge.lowWater) * e;
}
function yt(e) {
  const l = Math.min(1, bt(e) / 55), t = Math.exp(-((e.x + 40) ** 2 / 38e4 + e.y ** 2 / 12e4)), a = Math.sin(e.x / 43) * Math.cos(e.y / 51) * 0.3;
  return l * (1.2 + t * 11.5 + a);
}
var xt = it.map((e) => yt(e.position) - He[e.kind].depth);
function Mt(e, l, t = 1) {
  const a = He[e];
  return yt(l) - a.depth + a.waterDepth * t;
}
function ke(e) {
  const l = yt(e);
  for (let t = 0; t < it.length; t++) {
    const a = it[t], i = zt(a.kind);
    if (Math.abs(e.x - a.position.x) > i || Math.abs(e.y - a.position.y) > i) continue;
    const s = en(e, a);
    if (s >= 1) continue;
    const r = s * s * (3 - 2 * s);
    return xt[t] + (l - xt[t]) * r;
  }
  return l;
}
function et(e) {
  return e.x > 650 ? "reef" : e.y > 300 ? "mangrove" : e.x < -660 ? "sand" : "scrub";
}
function tn(e) {
  return et(e) !== "reef" && et(e) !== "mangrove" && ke(e) > Ge.highWater;
}
function an(e, l) {
  return Object.values(e.structures).some((t) => t.kind === "firepit" && t.workLeft === 0 && t.burning && t.fuelSeconds > 0 && fe(t.position, l) <= 3);
}
function nn(e, l) {
  return e !== "reef_food" || l <= Ge.forageMax;
}
var il = Math.acos(2 * Ge.forageMax - 1) / Math.PI, tt = /* @__PURE__ */ new Map();
function on(e) {
  let l = tt.get(e);
  return l || (l = new xe({
    color: e,
    roughness: 0.92
  }), tt.set(e, l)), l;
}
function J(e, l, t, a = 0, i = 0, s = 0) {
  const r = new oe(e, on(l));
  return r.position.set(a, i, s), r.castShadow = !0, r.receiveShadow = !0, t.add(r), r;
}
function ye(e, l, t, a, i) {
  const s = J(new Be(a * 0.8, a, l.distanceTo(t), 7), i, e);
  return s.position.copy(l).add(t).multiplyScalar(0.5), s.quaternion.setFromUnitVectors(new q(0, 1, 0), t.clone().sub(l).normalize()), s;
}
function at(e, l = []) {
  const t = /* @__PURE__ */ new Set([...tt.values(), ...l]);
  e.traverse((a) => {
    if (a instanceof oe) {
      a.geometry.dispose();
      for (const i of Array.isArray(a.material) ? a.material : [a.material]) t.has(i) || i.dispose();
    }
  });
}
function sn() {
  for (const e of tt.values()) e.dispose();
  tt.clear();
}
function rn(e, l) {
  const t = new ie(), a = "#947958", i = e.kind, s = 1 - e.workLeft / Se[i].seconds;
  function r(m, h, A) {
    for (let M = 0; M < 3; M++) {
      const $ = J(new Xe(0.085, 0.013, 4, 10), "#c0ae77", t, m, h + M * 0.035, A);
      $.rotation.x = Math.PI / 2;
    }
  }
  if (i === "signal") {
    for (let m = 0; m < Math.max(1, Math.ceil(s * 6)); m++) {
      const h = m % 3 * Math.PI / 3, A = m < 3 ? -1 : 1;
      ye(t, new q(0, 0.07, 0), new q(Math.cos(h) * 3.7 * A, 0.07, Math.sin(h) * 3.7 * A), 0.09, a);
    }
    return t;
  }
  if (i === "firepit") {
    const m = J(new ut(0.7, 24), e.burning || !e.fuelSeconds ? "#777364" : "#b6a88a", t, 0, 0.025, 0);
    m.rotation.x = -Math.PI / 2;
    for (let h = 0; h < Math.min(7, Math.ceil(e.fuelSeconds / 1e3)); h++) {
      const A = h * 2.4;
      ye(t, new q(Math.cos(A) * -0.55, 0.08, Math.sin(A) * -0.55), new q(Math.cos(A) * 0.55, 0.12, Math.sin(A) * 0.55), 0.055, "#65523e");
    }
    if (e.burning && e.fuelSeconds > 0) for (let h = 0; h < 3; h++) J(new Dt(0.12, 0.4 + h * 0.08, 7), "#f7c15c", t, Math.sin(h * 2.3) * 0.12, 0.29, Math.cos(h * 2.3) * 0.12).material.emissive.set("#bc480e");
    return t;
  }
  if (i === "latrine") {
    const { halfWidth: m, offset: h, height: A } = Xa;
    for (const M of [-m, m].slice(0, s > 0.15 ? 2 : 1))
      ye(t, new q(M, 0, h), new q(M, A, h), 0.055, a), s > 0.25 && r(M, A - 0.12, h);
    if (s > 0.25) {
      ye(t, new q(-m, A - 0.08, h), new q(m, A - 0.08, h), 0.025, "#c0ae77");
      const M = Math.ceil((s - 0.25) / 0.75 * 8);
      for (let $ = 0; $ < M; $++) {
        const b = l.leaf("palm", A, 0.9, 0.03, 0);
        b.rotation.x = -Math.PI / 2, b.position.set(-m + ($ + 0.5) * m / 4, 0.03, h + $ % 2 * 0.035), t.add(b);
      }
    }
    return t;
  }
  const d = i === "shelter", f = d ? 3.8 : 1.65, k = d ? 2.5 : 1.65, c = d ? 2.1 : 1.45, u = d ? 1.35 : 1.1, v = [
    [-f / 2, -k / 2],
    [f / 2, -k / 2],
    [-f / 2, k / 2],
    [f / 2, k / 2]
  ];
  for (const [m, h] of v.slice(0, Math.max(1, Math.ceil(s / 0.2 * 4)))) {
    const A = h < 0 ? c : u;
    ye(t, new q(m, 0, h), new q(m + 0.025, A, h), 0.065, a), s > 0.2 && r(m, A - 0.13, h);
  }
  if (s > 0.2) {
    for (const m of [-k / 2, k / 2]) {
      const h = m < 0 ? c : u;
      ye(t, new q(-f / 2 - 0.18, h, m), new q(f / 2 + 0.18, h, m), 0.05, a);
    }
    for (const m of [
      -f / 2,
      0,
      f / 2
    ]) ye(t, new q(m, c, -k / 2), new q(m, u, k / 2), 0.035, "#aa9772");
  }
  if (s > 0.4) {
    const m = d ? 8 : 4, h = Math.ceil((s - 0.4) / 0.6 * m);
    for (let A = 0; A < h; A++) {
      const M = l.leaf("palm", k + 0.8, 0.95, 0.12, c - u);
      M.position.set(-f / 2 + (A + 0.5) / m * f, c + 0.07 + A % 2 * 0.02, -k / 2 - 0.25), t.add(M);
    }
  }
  if (i === "raincatcher" && e.workLeft === 0) {
    const m = J(new We(0.6, 18, 8, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48), "#708553", t, 0, 0.45, 0);
    if (m.material.side = 2, e.water?.millilitres) {
      const h = e.water.millilitres / Se.raincatcher.capacity, A = J(new ut(0.2 + h * 0.33, 24), "#77b6b6", t, 0, 0.11 + h * 0.27, 0);
      A.rotation.x = -Math.PI / 2;
    }
  }
  return t;
}
var ln = "" + new URL("island-assets/foliage-atlas-C3IuhTqb.png", import.meta.url).href, dn = {
  palm: [0, 1],
  coastal: [1, 1],
  mangrove: [0, 0],
  dry: [1, 0]
};
function un(e, l) {
  const t = new Bt().load(ln, e, void 0, l);
  t.colorSpace = pt;
  const a = new xe({
    map: t,
    color: "#d2e0c3",
    alphaTest: 0.45,
    side: 2,
    roughness: 0.95
  });
  function i(s, r, d, f = 0.35, k = 0.2) {
    const c = [], u = [], v = [], m = dn[s], h = 8;
    for (let $ = 0; $ <= h; $++) {
      const b = $ / h;
      for (let C = 0; C < 3; C++) {
        const w = C / 2, x = (w - 0.5) * d;
        c.push(x, Math.sin(b * Math.PI) * f - k * b - Math.abs(x) * 0.08, b * r), u.push((m[0] + w) / 2, (m[1] + b) / 2);
      }
    }
    for (let $ = 0; $ < h; $++) for (let b = 0; b < 2; b++) {
      const C = $ * 3 + b, w = C + 3;
      v.push(C, w, C + 1, C + 1, w, w + 1);
    }
    const A = new Fe();
    A.setAttribute("position", new _e(c, 3)), A.setAttribute("uv", new _e(u, 2)), A.setIndex(v), A.computeVertexNormals();
    const M = new oe(A, a);
    return M.castShadow = !0, M.receiveShadow = !0, M;
  }
  return {
    leaf: i,
    materials: [a],
    dispose() {
      t.dispose(), a.dispose();
    }
  };
}
function cn() {
  const e = { value: new q() }, l = { value: new q() }, t = /* @__PURE__ */ new Map();
  function a(i) {
    let s = t.get(i);
    return s || (s = i.clone(), s.onBeforeCompile = (r) => {
      r.uniforms.cutawayFocus = e, r.uniforms.cutawayCamera = l, r.vertexShader = `varying vec3 vCutawayPosition;
${r.vertexShader}`.replace("#include <project_vertex>", `
                vec4 cutawayWorld = vec4(transformed, 1.);
                #ifdef USE_INSTANCING
                    cutawayWorld = instanceMatrix * cutawayWorld;
                #endif
                vCutawayPosition = (modelMatrix * cutawayWorld).xyz;
                #include <project_vertex>`), r.fragmentShader = `varying vec3 vCutawayPosition; uniform vec3 cutawayFocus; uniform vec3 cutawayCamera;
${r.fragmentShader}`.replace("#include <alphatest_fragment>", `#include <alphatest_fragment>
                    vec3 gap = vCutawayPosition - cutawayFocus;
                    float depth = dot(gap, cutawayCamera);
                    float radius = length(gap - depth * cutawayCamera);
                    float opening = (1. - smoothstep(.6, 1.65, radius)) * step(.3, depth);
                    float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))));
                    if(grain < opening * .92) discard;`);
    }, t.set(i, s), s);
  }
  return {
    material: a,
    get materials() {
      return [...t.values()];
    },
    apply(i) {
      i.traverse((s) => {
        s instanceof oe && s.material instanceof xe && (s.material = a(s.material));
      });
    },
    update(i, s) {
      e.value.copy(i).y += 0.9, l.value.copy(s.position).sub(e.value).normalize();
    },
    dispose() {
      for (const i of t.values()) i.dispose();
      t.clear();
    }
  };
}
var vn = "" + new URL("island-assets/ground-sand-CqYcg8qt.jpg", import.meta.url).href, fn = "" + new URL("island-assets/ground-scrub-DnvqjMp-.jpg", import.meta.url).href, pn = "" + new URL("island-assets/ground-reef-uNrDfMdi.jpg", import.meta.url).href, mn = "" + new URL("island-assets/ground-mangrove-CDWDRXi1.jpg", import.meta.url).href;
function hn(e, l, t) {
  const a = new Bt(), i = [
    vn,
    fn,
    pn,
    mn
  ].map((f) => {
    const k = a.load(f, l, void 0, t);
    return k.wrapS = k.wrapT = La, k.colorSpace = pt, k.anisotropy = Math.min(4, e), k;
  }), s = new xe({
    map: i[0],
    roughness: 1
  }), r = { value: Je(0) };
  s.onBeforeCompile = (f) => {
    f.uniforms.waterline = r, f.uniforms.scrubMap = { value: i[1] }, f.uniforms.reefMap = { value: i[2] }, f.uniforms.mangroveMap = { value: i[3] }, f.vertexShader = `attribute vec4 groundBlend; varying vec4 vGroundBlend; varying float groundHeight;
${f.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
vGroundBlend = groundBlend; groundHeight = (modelMatrix * vec4(position, 1.)).y;`), f.fragmentShader = `uniform sampler2D scrubMap; uniform sampler2D reefMap; uniform sampler2D mangroveMap; uniform float waterline; varying vec4 vGroundBlend; varying float groundHeight;
${f.fragmentShader}`.replace("#include <map_fragment>", `diffuseColor *= texture2D(map, vMapUv) * vGroundBlend.x
                + texture2D(scrubMap, vMapUv) * vGroundBlend.y
                + texture2D(reefMap, vMapUv) * vGroundBlend.z
                + texture2D(mangroveMap, vMapUv) * vGroundBlend.w;
                float dampSand = (1. - smoothstep(waterline + .025, waterline + .15, groundHeight)) * vGroundBlend.x;
                diffuseColor.rgb *= mix(vec3(1.), vec3(.67, .73, .75), dampSand);`);
  };
  const d = new xe({
    map: i[2],
    color: "#c4c7b4",
    roughness: 0.96,
    flatShading: !0
  });
  return {
    material: s,
    reefRock: d,
    update(f) {
      r.value = Je(f);
    },
    dispose() {
      d.dispose();
      for (const f of i) f.dispose();
    }
  };
}
function bn() {
  const e = [], l = [], t = [], a = [
    1,
    1.003,
    1.009,
    1.022,
    1.05,
    1.12,
    1.3,
    1.8,
    3.5,
    10
  ], i = Me.land.length;
  for (const r of a) for (const d of Me.land) {
    const f = {
      x: d.x * r,
      y: d.y * r
    };
    e.push(f.x, 0, f.y), l.push(r === 1 ? 0 : bt(f));
  }
  for (let r = 0; r < a.length - 1; r++) for (let d = 0; d < i; d++) {
    const f = r * i + d, k = r * i + (d + 1) % i, c = f + i, u = k + i;
    t.push(f, k, c, k, u, c);
  }
  const s = new Fe();
  return s.setAttribute("position", new _e(e, 3)), s.setAttribute("shoreMetres", new _e(l, 1)), s.setIndex(t), s;
}
function yn(e) {
  const l = {
    time: { value: 0 },
    level: { value: Je(0) },
    light: { value: 1 }
  }, t = new ie(), a = [];
  function i(f) {
    const k = new ka({
      transparent: f,
      depthWrite: !f,
      uniforms: {
        ...l,
        overLand: { value: f }
      },
      vertexShader: `uniform float level; attribute float shoreMetres; varying vec3 p; varying float depth,shore;
                void main(){p=(modelMatrix*vec4(position,1.)).xyz;depth=level-p.y;shore=shoreMetres;p.y=level;
                gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
      fragmentShader: `uniform float time,level,light;uniform bool overLand;
                varying vec3 p;varying float depth,shore;
                float hash(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
                float noise(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);
                    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
                void main(){
                    if(overLand && depth<=0.) discard;
                    vec2 drift=vec2(time*.055,-time*.038);
                    float broad=noise(p.xz*.18+drift),fine=noise(p.xz*1.65-drift*2.);
                    float ripple=noise(p.xz*3.2+drift*3.);
                    float waterDepth=overLand?depth:max(0.,level)+shore*.13;
                    vec3 shallow=vec3(.045,.32,.31),deep=vec3(.012,.095,.15);
                    vec3 c=mix(shallow,deep,smoothstep(0.,4.8,waterDepth));
                    float fleck=smoothstep(.74,.9,fine)*smoothstep(.50,.76,ripple);
                    c+=(broad-.5)*.035+vec3(.32,.47,.5)*fleck*.22;
                    float edge=overLand?depth*12.:shore;
                    float reach=overLand?1.-smoothstep(.025,.24,depth):(1.-smoothstep(.1,2.,shore))*(1.-smoothstep(0.,.08,level));
                    float breaker=pow(max(0.,sin(edge*2.1-time*.8+broad*.65)),12.);
                    float foam=reach*(breaker*(.45+.55*fine)+.1*smoothstep(.55,.8,ripple));
                    c=mix(c,vec3(.8,.9,.88),foam*.82)*light;
                    // Lose sight of the bed gradually before the outer coast, not at the mesh seam.
                    float alpha=overLand?mix(1.,mix(.28,.8,smoothstep(0.,1.2,depth))+foam*.15,smoothstep(0.,5.,shore))
                        *smoothstep(0.,.055,depth):1.;
                    gl_FragColor=vec4(c,alpha);
                    #include <tonemapping_fragment>
                    #include <colorspace_fragment>
                }`
    });
    return a.push(k), k;
  }
  const s = new oe(bn(), i(!1));
  t.add(s);
  const r = new Fe();
  r.setAttribute("position", e.getAttribute("position").clone()), r.setAttribute("shoreMetres", e.getAttribute("shoreMetres").clone()), r.setIndex(e.getIndex().clone());
  const d = new oe(r, i(!0));
  d.renderOrder = 1, t.add(d);
  for (const f of [s, d]) f.frustumCulled = !1;
  return {
    root: t,
    update(f, k, c) {
      l.level.value = Je(f), l.light.value = k ? c ? 0.72 : 1 : 0.22;
    },
    animate(f) {
      l.time.value = f;
    },
    dispose() {
      t.removeFromParent(), s.geometry.dispose(), r.dispose();
      for (const f of a) f.dispose();
    }
  };
}
var Ot = {
  player: {
    skin: "#c89575",
    height: 1.76,
    build: 1,
    hair: "short",
    portrait: null
  },
  lin: {
    skin: "#d4a58b",
    height: 1.65,
    build: 0.91,
    hair: "bob",
    portrait: [0, 0]
  },
  zhou: {
    skin: "#bc8969",
    height: 1.81,
    build: 1.08,
    hair: "short",
    portrait: [1, 0]
  },
  xu: {
    skin: "#d0a088",
    height: 1.68,
    build: 0.94,
    hair: "tied",
    portrait: [2, 0]
  },
  chen: {
    skin: "#c39376",
    height: 1.79,
    build: 0.97,
    hair: "short",
    portrait: [0, 1]
  },
  luo: {
    skin: "#bd8d74",
    height: 1.75,
    build: 1.05,
    hair: "short",
    portrait: [2, 1]
  }
}, kn = 0.42, gn = 0.4, wn = 0.065, _n = 0.69, xn = 0.15, se = {
  thigh: kn,
  shin: gn,
  ankle: wn,
  hipY: 0.885,
  headY: _n,
  headRadius: xn,
  stature: 1.7249999999999999,
  upperArm: 0.28,
  forearm: 0.24
};
function Mn(e, l, t, a, i) {
  const { hips: s, spine: r, head: d, legs: f, arms: k } = e;
  s.position.set(0, se.hipY, 0), s.rotation.set(0, 0, 0), r.rotation.set(0, 0, 0), d.rotation.set(0, 0, 0);
  for (const c of [...f, ...k])
    c.base.rotation.set(0, 0, 0), c.bend.rotation.set(0, 0, 0), c.end.rotation.set(0, 0, 0);
  if (i) {
    s.position.y = 0.16, s.rotation.x = -Math.PI / 2, f.forEach((c, u) => {
      c.base.rotation.z = (u ? -1 : 1) * 0.07, c.bend.rotation.x = 0.08;
    }), k.forEach((c, u) => {
      c.base.rotation.z = (u ? 1 : -1) * 0.18, c.bend.rotation.x = -0.2;
    }), d.rotation.y = 0.15;
    return;
  }
  if (t)
    f.forEach((c, u) => {
      const v = Math.sin(l + u * Math.PI);
      c.base.rotation.x = v * 0.42, c.bend.rotation.x = Math.max(0, -v) * 0.5, c.end.rotation.x = -c.base.rotation.x - c.bend.rotation.x;
    }), k.forEach((c, u) => {
      c.base.rotation.x = -Math.sin(l + u * Math.PI) * 0.26, c.bend.rotation.x = -0.12;
    }), a === "drag" && (r.rotation.x = -0.16, k.forEach((c) => {
      c.base.rotation.x = 0.4;
    }));
  else if (a === "rest") {
    s.position.y = 0.13, r.rotation.x = 0.13;
    const c = -1.95, u = -Math.acos((s.position.y - se.thigh * Math.cos(c) - se.ankle) / se.shin);
    f.forEach((v) => {
      v.base.rotation.x = c, v.bend.rotation.x = u - c, v.end.rotation.x = -u;
    }), k.forEach((v) => {
      v.base.rotation.x = -0.45, v.bend.rotation.x = -0.65;
    }), d.rotation.x = -0.08;
  } else a === "work" || a === "take" ? (s.position.y = 0.55, r.rotation.x = 0.42, d.rotation.x = 0.16, f.forEach((c) => {
    c.base.rotation.x = -1, c.bend.rotation.x = 1.9, c.end.rotation.x = -0.9;
  }), k.forEach((c, u) => {
    c.base.rotation.x = -1.15, c.bend.rotation.x = -0.35 + Math.sin(l * 0.6 + u) * 0.08;
  })) : a === "construct" ? (s.position.y = se.hipY - 0.05, r.rotation.x = 0.3, f.forEach((c) => {
    c.base.rotation.x = -0.2, c.bend.rotation.x = 0.4, c.end.rotation.x = -0.2;
  }), k.forEach((c, u) => {
    c.base.rotation.x = -0.8, c.bend.rotation.x = -0.5 + Math.sin(l * 0.7 + u) * 0.15;
  })) : (r.rotation.x = Math.sin(l * 0.2) * 8e-3, k.forEach((c, u) => {
    c.base.rotation.z = (u ? 1 : -1) * 0.07, c.bend.rotation.x = -0.06;
  }));
  a === "offer" && (k[1].base.rotation.set(-1.05, 0, 0.08), k[1].bend.rotation.x = -0.45), (a !== "rest" || t) && (s.position.y = se.ankle + Math.max(...f.map((c) => se.thigh * Math.cos(c.base.rotation.x) + se.shin * Math.cos(c.base.rotation.x + c.bend.rotation.x))));
}
function Gt(e) {
  return typeof e.color == "string" ? new ot(e.color) : new ot(...e.color);
}
function Vt(e, l, t) {
  e.color.copy(Gt(l)).multiplyScalar(1 - t * 0.28), e.roughness = l.dryRoughness - t * 0.24;
}
function ve(e, l, t, a = 0, i = 0, s = 0) {
  const r = new oe(l, t);
  return r.position.set(a, i, s), r.castShadow = r.receiveShadow = !0, e.add(r), r;
}
function ge(e, l, t, a) {
  const i = ve(e, new We(1, 14, 10), l, ...a);
  return i.scale.set(...t), i;
}
function Ue(e, l, t, a = 1) {
  const i = ve(e, new ga(t.map(([s, r]) => new ht(s, r)), 16), l);
  return i.scale.z = a, i;
}
function he(e, l = 0, t = 0, a = 0) {
  const i = new ie();
  return i.position.set(l, t, a), e.add(i), i;
}
function jt(e) {
  for (const t of [...e.children]) t instanceof ie && jt(t);
  const l = /* @__PURE__ */ new Map();
  for (const t of [...e.children]) {
    if (!(t instanceof oe) || !(t.material instanceof xe)) continue;
    t.updateMatrix();
    const a = t.geometry.index ? t.geometry.toNonIndexed() : t.geometry.clone();
    a.applyMatrix4(t.matrix), a.deleteAttribute("uv");
    const i = l.get(t.material) ?? [];
    i.push(a), l.set(t.material, i), t.geometry.dispose(), e.remove(t);
  }
  for (const [t, a] of l) {
    const i = Ut(a);
    if (a.forEach((s) => s.dispose()), !i) throw new Error("island_survivor_geometry");
    ve(e, i, t);
  }
}
function $n(e) {
  const l = [], t = [];
  for (let r = 0; r <= 10; r++) for (let d = 0; d <= 24; d++) {
    const f = d / 24 * Math.PI * 2, k = (1 - Math.cos(f)) / 2, c = e === "bob" || e === "wavy" ? 1.45 + k * 1.25 : 1.35 + k * 0.65, u = r / 10 * c, v = e === "wavy" ? 1 + Math.sin(f * 7) * 0.055 : 1;
    if (l.push(Math.sin(u) * Math.sin(f) * 0.126 * v, Math.cos(u) * 0.155 - (e === "bob" && u > 1.5 ? (u - 1.5) * 0.06 : 0), Math.sin(u) * Math.cos(f) * 0.125 * v), r < 10 && d < 24) {
      const m = r * 25 + d, h = m + 24 + 1;
      t.push(m, h, m + 1, m + 1, h, h + 1);
    }
  }
  const s = new Fe();
  return s.setAttribute("position", new _e(l, 3)), s.setIndex(t), s.computeVertexNormals(), s;
}
function Cn(e, l, t) {
  const a = Ot[e], i = new ie(), s = he(i), r = a.height / se.stature;
  s.scale.set(r * a.build, r, r);
  const d = new xe({
    color: a.skin,
    roughness: 0.82
  }), f = new xe({
    color: "#38352f",
    roughness: 0.95
  }), k = new xe({
    color: "#454d4d",
    roughness: 0.86
  }), c = /* @__PURE__ */ new Map();
  function u(F) {
    const U = we[F], H = new xe({
      color: Gt(U),
      roughness: U.dryRoughness
    });
    return c.set(F, H), H;
  }
  const v = l.find((F) => we[F]?.slot === "upper"), m = l.find((F) => we[F]?.slot === "lower"), h = l.find((F) => we[F]?.slot === "upper_inner"), A = l.find((F) => we[F]?.slot === "lower_inner"), M = l.find((F) => we[F]?.slot === "feet"), $ = v ? u(v) : h ? u(h) : d, b = m ? u(m) : d, C = !m && A ? u(A) : b, w = M ? u(M) : d, x = he(s, 0, se.hipY), P = he(x), S = he(P, 0, se.headY);
  ge(x, C, [
    0.17,
    0.105,
    0.115
  ], [
    0,
    -0.025,
    0
  ]), Ue(P, $, [
    [0.135, -0.04],
    [0.15, 0.06],
    [0.17, 0.2],
    [0.205, 0.36],
    [0.225, 0.43],
    [0.18, 0.49],
    [0.065, 0.53]
  ], 0.62), ve(P, new Be(0.048, 0.055, 0.1, 12), d, 0, 0.565), ge(S, d, [
    0.112,
    se.headRadius,
    0.108
  ], [
    0,
    0,
    0
  ]), ve(S, $n(a.hair), f, 0, 6e-3, -0.012), ge(S, d, [
    0.024,
    0.032,
    0.024
  ], [
    0,
    -5e-3,
    0.104
  ]);
  for (const F of [-1, 1])
    ge(S, d, [
      0.021,
      0.037,
      0.017
    ], [
      F * 0.111,
      -5e-3,
      0
    ]), ge(S, k, [
      0.012,
      6e-3,
      4e-3
    ], [
      F * 0.044,
      0.031,
      0.1
    ]), ve(S, new Ee(0.035, 8e-3, 8e-3), f, F * 0.044, 0.053, 0.1);
  if (a.hair === "tied") {
    const F = new dt(t ? [
      new q(0, -0.015, -0.095),
      new q(0.08, -0.12, -0.098),
      new q(0.12, -0.3, -0.1)
    ] : [
      new q(0, -0.015, -0.12),
      new q(0.01, -0.1, -0.19),
      new q(0.015, -0.29, -0.18)
    ]);
    ve(S, new nt(F, 10, 0.038, 8, !1), f);
  }
  if (v) {
    ve(P, new Ee(0.014, 0.4, 9e-3), $, 0, 0.23, 0.129);
    for (let F = 0; F < 4; F++) ge(P, k, [
      9e-3,
      9e-3,
      4e-3
    ], [
      0,
      0.1 + F * 0.09,
      0.137
    ]);
    for (const F of [-1, 1]) {
      const U = ve(P, new Ee(0.065, 0.085, 0.012), $, F * 0.047, 0.482, 0.077);
      U.rotation.z = F * 0.45, U.rotation.x = -0.3;
    }
  }
  const G = [], L = [];
  for (const F of [-1, 1]) {
    const U = he(x, F * 0.1, 0), H = he(U, 0, -se.thigh), re = he(H, 0, -se.shin);
    if (Ue(U, b, [
      [0.069, -se.thigh - 0.01],
      [0.082, -0.24],
      [0.096, -0.04],
      [0.084, 0.015]
    ]), ge(H, b, [
      0.07,
      0.071,
      0.07
    ], [
      0,
      0,
      0
    ]), Ue(H, b, [
      [0.045, -se.shin],
      [0.056, -0.25],
      [0.071, -0.035],
      [0.067, 5e-3]
    ]), ge(re, w, [
      0.054,
      0.05,
      0.135
    ], [
      0,
      -0.015,
      0.057
    ]), l.includes("shoes")) {
      const j = ve(re, new Ee(0.104, 0.018, 0.24), k, 0, -0.054, 0.047);
      j.rotation.x = -0.015;
    }
    G.push({
      base: U,
      bend: H,
      end: re
    });
    const ae = he(P, F * 0.222, 0.435), N = he(ae, 0, -se.upperArm), te = he(N, 0, -se.forearm);
    Ue(ae, d, [
      [0.042, -se.upperArm],
      [0.063, -0.065],
      [0.059, 0.02]
    ]), ge(ae, $, [
      0.072,
      0.077,
      0.073
    ], [
      0,
      -0.016,
      0
    ]), v && (Ue(ae, $, [
      [0.064, -0.16],
      [0.073, -0.04],
      [0.066, 0.015]
    ]), ve(ae, new Be(0.066, 0.064, 0.024, 12), $, 0, -0.155)), ge(N, d, [
      0.043,
      0.048,
      0.043
    ], [
      0,
      0,
      0
    ]), Ue(N, d, [
      [0.027, -se.forearm],
      [0.045, -0.07],
      [0.04, 5e-3]
    ]), ge(te, d, [
      0.035,
      0.055,
      0.023
    ], [
      0,
      -0.039,
      0.01
    ]), ge(te, d, [
      0.017,
      0.028,
      0.019
    ], [
      -F * 0.027,
      -0.024,
      0.026
    ]), L.push({
      base: ae,
      bend: N,
      end: te
    });
  }
  if (l.includes("lifejacket")) {
    const F = u("lifejacket");
    for (const H of [-1, 1])
      ve(P, new Pa(0.07, 0.27, 5, 10), F, H * 0.105, 0.285, 0.14).scale.set(1.05, 1, 0.66), ve(P, new Ee(0.14, 0.028, 0.015), k, H * 0.104, 0.19, 0.19);
    const U = new dt([
      new q(-0.15, 0.43, 0.08),
      new q(-0.1, 0.55, -0.05),
      new q(0, 0.56, -0.09),
      new q(0.1, 0.55, -0.05),
      new q(0.15, 0.43, 0.08)
    ]);
    ve(P, new nt(U, 14, 0.047, 8, !1), F), ve(P, new Ee(0.054, 0.034, 0.016), k, 0, 0.19, 0.2);
  }
  jt(s);
  const ee = {
    hips: x,
    spine: P,
    head: S,
    legs: G,
    arms: L
  }, z = he(i), D = he(i, 0, 0.36 * r), K = he(S, 0, 0.23), R = new q(), Q = new q(0, -0.03, 0.045);
  return {
    root: i,
    hand: z,
    covering: D,
    headAnchor: K,
    wetness(F) {
      for (const U of F) {
        const H = c.get(U.kind);
        H && Vt(H, we[U.kind], U.wetness);
      }
    },
    pose(F, U, H) {
      Mn(ee, F, U, H, t), i.updateMatrixWorld(!0), L[1].end.getWorldPosition(R), i.worldToLocal(R), z.position.copy(R).add(Q);
    },
    dispose() {
      at(i);
    }
  };
}
function st(e, l, t) {
  if (we[e.kind]) return t.garment(e);
  const a = new ie(), i = "#a38b61", s = e.wetness > 0.25 ? "#a6b9bd" : "#d0dcd8";
  switch (e.kind) {
    case "bottle": {
      const r = J(new Be(0.1, 0.1, 0.3, 10), "#aeddda", a, 0, 0.11, 0);
      r.rotation.z = Math.PI / 2;
      const d = J(new Be(0.05, 0.065, 0.1, 8), "#e9f3ed", a, 0.19, 0.11, 0);
      d.rotation.z = Math.PI / 2;
      break;
    }
    case "metal_cup":
    case "shell":
    case "coconut_open": {
      const r = e.kind === "metal_cup", d = r ? "#bac7c8" : i, f = r ? 0.04 : 0.17, k = r ? 0.034 : 0.12, c = r ? 0.09 : 0.22;
      J(new Be(f, k, c, 16, 1, !0), d, a, 0, c / 2 + 0.01, 0);
      const u = J(new Xe(f, r ? 4e-3 : 0.014, 5, 16), d, a, 0, c + 0.01, 0);
      u.rotation.x = Math.PI / 2;
      const v = J(new ut(k, 16), e.kind === "coconut_open" ? "#f2ecdb" : d, a, 0, 0.01, 0);
      v.rotation.x = -Math.PI / 2;
      break;
    }
    case "coconut":
      J(new We(0.18, 10, 8), "#9b9e5e", a, 0, 0.17, 0).scale.y = 1.15;
      break;
    case "coconut_husk":
      for (let r = 0; r < 3; r++) {
        const d = J(new We(0.16, 8, 5), "#a18b61", a, (r - 1) * 0.17, 0.05, 0);
        d.scale.set(0.5, 0.3, 1.7), d.rotation.y = (r - 1) * 0.45;
      }
      break;
    case "coral_stone":
      J(new Ft(0.23, 1), "#c4bdaa", a, 0, 0.12, 0).scale.y = 0.65;
      break;
    case "metal_edge":
      J(new Ee(0.35, 0.02, 0.19), "#b2c3c9", a, 0, 0.035, 0).rotation.set(0.09, 0.6, 0.1);
      break;
    case "branch":
    case "fire_drill":
      for (let r = 0; r < Math.min(e.quantity, 5); r++) ye(a, new q(-0.65, 0.06 + r * 0.05, r * 0.09), new q(0.55, 0.12 + r * 0.05, r * 0.06 + 0.1), 0.045, i);
      e.kind === "fire_drill" && ye(a, new q(-0.3, 0.1, -0.25), new q(0.15, 0.12, 0.3), 0.025, "#bba77c");
      break;
    case "palm_leaf":
      for (let r = 0; r < Math.min(e.quantity, 5); r++) {
        const d = l.leaf("palm", 1.9, 0.9, 0.06, 0);
        d.position.set(r * 0.07, 0.06 + r * 0.035, -0.95), d.rotation.y = r * 0.18, a.add(d);
      }
      break;
    case "fish":
    case "cooked_fish": {
      const r = e.kind === "fish" ? "#a9bfc5" : "#be976d";
      J(new We(0.12, 10, 6), r, a, 0, 0.065, 0).scale.set(1.7, 0.5, 0.7);
      const d = J(new Dt(0.09, 0.13, 3), r, a, -0.23, 0.06, 0);
      d.rotation.z = -Math.PI / 2, d.scale.z = 0.35;
      break;
    }
    case "cord": {
      const r = J(new Xe(0.15, 0.018, 5, 16), i, a, 0, 0.04, 0);
      r.rotation.x = Math.PI / 2;
      break;
    }
    case "basket": {
      J(new Be(0.33, 0.23, 0.36, 12, 1, !0), "#b0a16f", a, 0, 0.2, 0).material.side = 2;
      const r = J(new Xe(0.3, 0.025, 5, 16, Math.PI), i, a, 0, 0.34, 0);
      r.rotation.y = Math.PI / 2;
      break;
    }
    case "cloth":
      J(new Ee(0.42, 0.025, 0.35), s, a, 0, 0.025, 0);
      break;
    case "tinder":
      for (let r = 0; r < 7; r++) ye(a, new q(-0.14, 0.02, r * 0.03), new q(0.1, 0.025 + r * 8e-3, 0.15 - r * 0.02), 0.012, "#cfbf8e");
      break;
  }
  return a;
}
function An(e, l, t) {
  const a = st(e, l, t);
  if (a.userData.garment && !["shoes", "wraps"].includes(e.kind)) {
    const i = new ct().setFromObject(a);
    a.rotation.x = Math.PI / 2, a.position.y = i.min.z;
  } else {
    e.kind === "bottle" && (a.rotation.z = Math.PI / 2);
    const i = new ct().setFromObject(a).getCenter(new q());
    a.position.sub(i);
  }
  return a;
}
function Sn(e, l, t, a, i) {
  const s = /* @__PURE__ */ new Map(), r = new ie(), d = document.createElement("div");
  d.className = "island-people-labels", l.append(d), e.add(r);
  const f = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  f.classList.add("island-people-leaders"), f.setAttribute("aria-hidden", "true"), d.append(f);
  function k(h) {
    for (const A of [h.visual.hand, h.visual.covering])
      at(A, a.materials), A.clear();
  }
  function c(h) {
    r.remove(h.visual.root), k(h), h.visual.dispose(), h.label?.remove(), h.leader?.remove();
  }
  function u(h, A) {
    const M = [{
      id: h.observer,
      ...h.self
    }, ...h.people], $ = new Set(M.map((b) => b.id));
    for (const [b, C] of s) $.has(b) || (c(C), s.delete(b));
    for (const b of M) {
      const C = h.items.filter((R) => R.location.kind === "worn" && R.location.person === b.id), w = C.map((R) => R.kind), x = h.offers.find((R) => R.from === b.id), P = x ?? h.using.find((R) => R.person === b.id), S = h.items.filter((R) => R.location.kind === "covering" && R.location.person === b.id), G = JSON.stringify([b.id === "ye" ? null : w, b.body.kind]);
      let L = s.get(b.id);
      if (!L || L.signature !== G) {
        const R = L?.visual.root.position.clone(), Q = L?.visual.root.rotation.y ?? 0;
        L && c(L);
        const F = b.body.kind === "dead", U = b.id === "ye" ? i.create(C, F) : Cn(b.id, w, F);
        U.root.position.x = R?.x ?? b.position.x, U.root.position.z = R?.z ?? b.position.y, U.root.rotation.y = Q;
        let H = null, re = null;
        if (b.id !== "player") {
          const ae = b.id;
          H = document.createElement("button"), H.textContent = ce[ae].name, H.setAttribute("aria-label", `${o.look} · ${ce[ae].name}`), H.addEventListener("click", () => t(ae)), d.append(H), re = document.createElementNS("http://www.w3.org/2000/svg", "line"), f.append(re);
        } else {
          const ae = new oe(new Wt(0.4, 0.47, 36), new Tt({
            color: "#245d61",
            side: 2
          }));
          ae.rotation.x = -Math.PI / 2, ae.position.y = 0.04, U.root.add(ae);
        }
        L = {
          visual: U,
          label: H,
          leader: re,
          signature: G,
          attachments: "",
          from: U.root.position.clone(),
          to: U.root.position.clone(),
          started: 0,
          duration: 0,
          activity: null,
          work: null,
          reducedMotion: A
        }, s.set(b.id, L), r.add(U.root);
      }
      const ee = JSON.stringify([P && [
        P.form,
        P.units,
        P.wetness
      ], S.map((R) => [
        R.kind,
        R.quantity,
        R.wetness
      ])]);
      if (L.attachments !== ee) {
        k(L);
        let R = 0;
        for (const Q of S) for (let F = 0; F < Q.quantity && R < 8; F++, R++) {
          const U = st({
            ...Q,
            quantity: 1
          }, a, i);
          U.position.set((R % 2 - 0.5) * 0.08, R * 0.015, -0.25 + R % 3 * 0.22), L.visual.covering.add(U);
        }
        P && L.visual.hand.add(An({
          kind: P.form,
          quantity: P.units,
          wetness: P.wetness
        }, a, i)), L.attachments = ee;
      }
      const z = (typeof b.activity == "object" ? b.activity?.kind : b.activity) ?? null;
      L.work = typeof b.activity == "object" ? b.activity?.kind === "work" ? b.activity.task.kind : null : "work" in b ? b.work : null, L.activity = z, L.reducedMotion = A, L.visual.wetness(C);
      const D = x && M.find((R) => R.id === x.to);
      D && fe(b.position, D.position) > 0.01 && (L.visual.root.rotation.y = Math.atan2(D.position.x - b.position.x, D.position.y - b.position.y)), L.label && (L.label.title = b.body.kind === "dead" ? o.remains : z ? o.active[z] : o.idle);
      const K = new q(b.position.x, 0, b.position.y);
      if (K.x !== L.to.x || K.z !== L.to.z) {
        const R = {
          x: L.visual.root.position.x,
          y: L.visual.root.position.z
        };
        L.from.set(R.x, 0, R.y), L.to.copy(K), L.started = performance.now(), L.duration = !A && Ja(R, b.position, Me) ? Math.min(1e3, Math.max(260, fe(R, b.position) * 45)) : 0, L.duration && (L.visual.root.rotation.y = Math.atan2(K.x - R.x, K.z - R.y));
      }
    }
  }
  function v(h) {
    let A = !1;
    for (const M of s.values()) {
      const $ = M.duration ? Math.min(1, Math.max(0, (h - M.started) / M.duration)) : 1;
      M.visual.root.position.x = gt.lerp(M.from.x, M.to.x, $), M.visual.root.position.z = gt.lerp(M.from.z, M.to.z, $), M.visual.root.position.y = ke({
        x: M.visual.root.position.x,
        y: M.visual.root.position.z
      }), M.visual.pose(M.reducedMotion ? 0 : h / 160, $ < 1, M.activity, M.work), A ||= $ < 1;
    }
    return A;
  }
  function m(h) {
    const A = l.clientWidth, M = l.clientHeight, $ = [], b = [...s.values()].filter((C) => C.label).map((C) => ({
      figure: C,
      p: C.visual.headAnchor.getWorldPosition(new q()).add(new q(0, 0.18, 0)).project(h)
    })).sort((C, w) => C.p.y - w.p.y);
    for (const { figure: C, p: w } of b) {
      const x = C.label, P = C.leader;
      if (P.style.display = "none", x.hidden = Math.abs(w.x) > 0.96 || Math.abs(w.y) > 0.9, x.hidden) continue;
      const S = (w.x + 1) * A / 2, G = (1 - w.y) * M / 2;
      let L = G;
      for (; $.some((ee) => Math.abs(ee.x - S) < 46 && Math.abs(ee.y - L) < 24); ) L -= 24;
      $.push({
        x: S,
        y: L
      }), x.style.transform = `translate(${S}px,${L}px) translate(-50%,-100%)`, L < G && (P.style.display = "", P.setAttribute("x1", String(S)), P.setAttribute("x2", String(S)), P.setAttribute("y1", String(L)), P.setAttribute("y2", String(G)));
    }
  }
  return {
    update: u,
    animate: v,
    project: m,
    player: () => s.get("player")?.visual.root.position,
    pick(h) {
      let A = 1 / 0, M = null;
      for (const [$, b] of s) {
        if ($ === "player") continue;
        const C = [];
        b.visual.root.traverseVisible((x) => {
          x instanceof mt && (x.computeBoundingSphere(), x.computeBoundingBox()), x instanceof oe && C.push(x);
        });
        const w = h.intersectObjects(C, !1)[0];
        w && w.distance < A && (A = w.distance, M = $);
      }
      return M;
    },
    dispose() {
      for (const h of s.values()) c(h);
      s.clear(), e.remove(r), d.remove();
    }
  };
}
function In(e) {
  const t = Me.land.map((M) => new ht(M.x, M.y)), a = Sa.triangulateShape(t, []), i = [], s = [], r = [], d = [], f = [], k = [], c = /* @__PURE__ */ new Map(), u = {
    sand: [
      1,
      0,
      0,
      0
    ],
    scrub: [
      0,
      1,
      0,
      0
    ],
    reef: [
      0,
      0,
      1,
      0
    ],
    mangrove: [
      0,
      0,
      0,
      1
    ]
  };
  function v(M) {
    const $ = `${M.x}:${M.y}`, b = c.get($);
    if (b !== void 0) return b;
    const C = i.length / 3;
    c.set($, C), i.push(M.x, ke(M), M.y), d.push(M.x / 4, -M.y / 4), k.push(bt(M));
    const w = new q(ke({
      x: M.x - 0.1,
      y: M.y
    }) - ke({
      x: M.x + 0.1,
      y: M.y
    }), 0.2, ke({
      x: M.x,
      y: M.y - 0.1
    }) - ke({
      x: M.x,
      y: M.y + 0.1
    })).normalize();
    return s.push(...w.toArray()), r.push(...u[et(M)]), C;
  }
  function m(M, $, b, C = it) {
    const [w, x, P] = [
      [
        M,
        $,
        b
      ],
      [
        $,
        b,
        M
      ],
      [
        b,
        M,
        $
      ]
    ].sort((K, R) => (R[0].x - R[1].x) ** 2 + (R[0].y - R[1].y) ** 2 - ((K[0].x - K[1].x) ** 2 + (K[0].y - K[1].y) ** 2))[0], S = Math.min(M.x, $.x, b.x), G = Math.max(M.x, $.x, b.x), L = Math.min(M.y, $.y, b.y), ee = Math.max(M.y, $.y, b.y), z = C.filter((K) => {
      const R = zt(K.kind), Q = K.position;
      return Q.x + R >= S && Q.x - R <= G && Q.y + R >= L && Q.y - R <= ee;
    }), D = z.reduce((K, R) => Math.min(K, He[R.kind].radius / 10), 10);
    if (Math.hypot(w.x - x.x, w.y - x.y) > D) {
      const K = {
        x: (w.x + x.x) / 2,
        y: (w.y + x.y) / 2
      };
      m(w, K, P, z), m(K, x, P, z);
      return;
    }
    ($.x - M.x) * (b.y - M.y) - ($.y - M.y) * (b.x - M.x) > 0 ? f.push(v(M), v(b), v($)) : f.push(v(M), v($), v(b));
  }
  for (const [M, $, b] of a) m(Me.land[M], Me.land[$], Me.land[b]);
  const h = new Fe();
  h.setAttribute("position", new _e(i, 3)), h.setAttribute("normal", new _e(s, 3)), h.setAttribute("groundBlend", new _e(r, 4)), h.setAttribute("uv", new _e(d, 2)), h.setAttribute("shoreMetres", new _e(k, 1)), h.setIndex(f);
  const A = new oe(h, e);
  return A.receiveShadow = !0, A;
}
function En(e) {
  const t = new Float32Array(1440), a = new Fe(), i = new fa({
    color: "#d6e9ee",
    transparent: !0,
    opacity: 0.45,
    depthWrite: !1
  }), s = new _a(a, i);
  s.frustumCulled = !1, s.visible = !1, e.add(s);
  const r = new Ca(t, 3);
  return r.setUsage(wa), a.setAttribute("position", r), {
    setRain(d) {
      s.visible = d;
    },
    animate(d, f) {
      if (s.visible) {
        s.position.copy(f);
        for (let k = 0; k < 240; k++) {
          const c = k * 17.137 % 1 * 55 - 27.5, u = k * 9.753 % 1 * 55 - 27.5, v = 20 - (d * 11 + k * 2.793) % 20, m = v * 0.16, h = k * 6;
          t[h] = c + m, t[h + 1] = v, t[h + 2] = u, t[h + 3] = c + m - 0.14, t[h + 4] = v - 0.9, t[h + 5] = u;
        }
        r.needsUpdate = !0;
      }
    },
    dispose() {
      e.remove(s), a.dispose(), i.dispose();
    }
  };
}
function Pn(e, l) {
  const t = new ie(), a = 5.3 + e % 7 * 0.35, i = Math.sin(e) * 1.2, s = new dt([
    new q(0, 0, 0),
    new q(i * 0.25, a * 0.5, 0.1),
    new q(i, a, 0.3)
  ]), r = new nt(s, 14, 0.18, 9, !1), d = r.getAttribute("position"), f = r.getAttribute("uv"), k = new q();
  for (let c = 0; c < d.count; c++) {
    const u = f.getX(c), v = s.getPointAt(u), m = 0.24 - 0.1 * u;
    k.fromBufferAttribute(d, c).sub(v).multiplyScalar(m / 0.18).add(v), d.setXYZ(c, k.x, k.y, k.z);
  }
  r.computeVertexNormals(), J(r, "#aa9b7d", t);
  for (let c = 1; c < 13; c++) {
    const u = c / 14, v = J(new Xe(0.24 - 0.1 * u, 8e-3, 3, 9), "#877f67", t);
    v.position.copy(s.getPointAt(u)), v.quaternion.setFromUnitVectors(new q(0, 0, 1), s.getTangentAt(u));
  }
  for (let c = 0; c < 11; c++) {
    const u = c * Math.PI * 2 / 11 + e, v = 3.1 + 0.5 * Math.sin(e + c), m = l.leaf("palm", v, 1.65, c < 8 ? 0.65 : 1, c < 8 ? 0.6 : -0.45);
    m.position.set(i, a - (c < 8 ? 0.1 : 0), 0.3), m.rotation.y = u, t.add(m);
  }
  for (let c = 0; c < 2; c++) {
    const u = l.leaf("dry", 2.5, 1.1, 0.1, 1.8);
    u.rotation.y = e + c * 3, u.position.set(i, a - 0.35, 0.3), t.add(u);
  }
  return t;
}
function Ht(e, l, t, a, i, s) {
  for (let r = 0; r < 2; r++) for (let d = 0; d < 6; d++) {
    const f = l.leaf(t, s, s * 0.85, 0.25, -0.15), k = i + d * Math.PI / 3 + r * 0.6;
    f.position.copy(a).add(new q(0, r * 0.3, 0)), f.rotation.set(r ? -0.5 : 0.18, k, 0.08 * Math.sin(d)), e.add(f);
  }
}
function Yt(e, l, t) {
  const a = new ie();
  for (let i = 0; i < 3; i++) {
    const s = e + i * 2.4, r = Math.cos(s) * t * 0.35, d = Math.sin(s) * t * 0.35, f = new q(r, t * (0.75 + i * 0.1), d);
    ye(a, new q(0, 0, 0), f, t * 0.035, "#887d61"), Ht(a, l, "coastal", f, s, t * 0.6);
  }
  return a;
}
function Rn(e, l) {
  const t = new ie(), a = 2.6 + e % 4 * 0.3;
  for (let i = 0; i < 6; i++) {
    const s = e + i * Math.PI / 3, r = 1.2 + 0.2 * Math.sin(i + e), d = new qa(new q(Math.cos(s) * r, 0, Math.sin(s) * r), new q(Math.cos(s) * 0.8, 1.25, Math.sin(s) * 0.8), new q(0, 1.4, 0));
    J(new nt(d, 7, 0.055, 6, !1), "#7c7862", t);
  }
  ye(t, new q(0, 0.6, 0), new q(0.1, a, 0), 0.14, "#797c65");
  for (let i = 0; i < 4; i++) {
    const s = e + i * Math.PI / 2, r = new q(Math.cos(s) * 0.9, a + 0.2 * Math.sin(i), Math.sin(s) * 0.9);
    ye(t, new q(0.1, a - 0.8, 0), r, 0.055, "#82806a"), Ht(t, l, "mangrove", r, s, 1.35);
  }
  return t;
}
function qn(e, l) {
  const t = new ie();
  for (let a = 0; a < 2; a++) {
    const i = e + a * 2.4, s = Yt(e + a, l, 1.5 + a * 0.25);
    s.position.set(Math.cos(i) * 0.6, 0, Math.sin(i) * 0.6), t.add(s);
  }
  return t;
}
function Kt(e, l = 1) {
  const t = new Ia(l, 1), a = t.getAttribute("position");
  for (let r = 0; r < a.count; r++) {
    const d = a.getX(r) / l, f = a.getY(r) / l, k = a.getZ(r) / l, c = 1 + Math.sin(d * 5 + f * 3 + e) * 0.13 + Math.cos(k * 6 - f * 4 + e) * 0.1;
    a.setXYZ(r, d * c * l, (f * 0.4 + Math.sin(d * 4 + k * 3 + e) * 0.07) * l, k * c * l);
  }
  t.computeVertexNormals();
  const i = t.getAttribute("normal"), s = t.getAttribute("uv");
  for (let r = 0; r < a.count; r++) {
    const d = Math.abs(i.getX(r)), f = Math.abs(i.getY(r)), k = Math.abs(i.getZ(r)), c = d > f && d > k ? a.getZ(r) : a.getX(r), u = f >= d && f >= k ? a.getZ(r) : a.getY(r);
    s.setXY(r, c + e, u + e);
  }
  return t;
}
function Ln(e, l) {
  e.updateMatrixWorld(!0);
  const t = /* @__PURE__ */ new Map();
  return e.traverse((a) => {
    if (!(a instanceof oe) || Array.isArray(a.material)) return;
    const i = a.geometry.index ? a.geometry.toNonIndexed() : a.geometry.clone();
    i.applyMatrix4(a.matrixWorld), a.material.map || i.deleteAttribute("uv");
    const s = t.get(a.material) ?? [];
    s.push(i), t.set(a.material, s);
  }), at(e, l), e.clear(), [...t].map(([a, i]) => {
    const s = Ut(i);
    for (const r of i) r.dispose();
    if (!s) throw new Error("island_geometry_merge");
    return {
      geometry: s,
      material: a
    };
  });
}
function Bn(e, l, t, a) {
  const i = new ie();
  e.add(i);
  const s = /* @__PURE__ */ new Map();
  let r = "";
  function d(c, u) {
    const v = `${c}:${u}`;
    let m = s.get(v);
    if (!m) {
      const h = u * 17 + 3, A = c === "palm" ? Pn(h, l) : c === "mangrove" ? Rn(h, l) : c === "coastal" ? Yt(h, l, 0.75) : c === "thicket" ? qn(h, l) : new ie();
      if (c === "rock") {
        const M = new oe(Kt(h), a);
        M.position.y = 0.16, A.add(M);
      }
      m = Ln(A, [...l.materials, a]), s.set(v, m);
    }
    return m;
  }
  function f() {
    for (const c of i.children) c.dispose();
    i.clear();
  }
  function k(c) {
    const u = `${Math.floor(c.x / 25)}:${Math.floor(c.y / 25)}`;
    if (u === r) return;
    r = u, f();
    const v = Math.floor(c.x / 25) * 25, m = Math.floor(c.y / 25) * 25, h = /* @__PURE__ */ new Map();
    function A(M, $, b, C = 1) {
      const w = Math.floor($) % 3, x = `${Math.floor(b.x / 25)}:${Math.floor(b.y / 25)}:${M}:${w}`;
      let P = h.get(x);
      P || (P = {
        parts: d(M, w),
        matrices: []
      }, h.set(x, P)), P.matrices.push(new Lt().compose(new q(b.x, ke(b), b.y), new Ba().setFromAxisAngle(new q(0, 1, 0), $), new q(C, C, C)));
    }
    for (let M = Math.floor((v - 75) / 7) * 7; M < v + 75; M += 7) for (let $ = Math.floor((m - 75) / 7) * 7; $ < m + 75; $ += 7) {
      const b = Math.abs(Math.sin(M * 12.9898 + $ * 78.233) * 43758.5453), C = b % 1, w = {
        x: M + C * 5,
        y: $ + Math.sin(b) * 4
      };
      if (!Qe(w, Me)) continue;
      const x = et(w);
      if (x === "reef" || x === "sand" && w.x < -722) {
        (x === "reef" || C < 0.15) && A("rock", b, w, x === "reef" ? 0.5 + C : 0.15 + C);
        continue;
      }
      x === "mangrove" ? C < 0.5 && A("mangrove", b, w) : C < 0.33 ? A("palm", b, w) : C < 0.8 && !Me.sightScreens.some((P) => Te(w, P)) && A("coastal", b, w, 0.9 + C * 0.3);
    }
    for (let M = Math.floor((v - 75) / 4) * 4; M < v + 75; M += 4) for (let $ = Math.floor((m - 75) / 4) * 4; $ < m + 75; $ += 4) {
      const b = Math.abs(Math.sin(M * 7.137 + $ * 41.31) * 9123.71), C = {
        x: M + Math.sin(b) * 0.75,
        y: $ + Math.cos(b * 3) * 0.75
      };
      Qe(C, Me) && Me.sightScreens.some((w) => Te(C, w)) && A("thicket", b, C, 0.9 + b % 1 * 0.2);
    }
    for (const { parts: M, matrices: $ } of h.values()) for (const b of M) {
      const C = new ba(b.geometry, t.material(b.material), $.length);
      $.forEach((w, x) => C.setMatrixAt(x, w)), C.instanceMatrix.needsUpdate = !0, C.computeBoundingSphere(), C.castShadow = !0, C.receiveShadow = !0, i.add(C);
    }
  }
  return {
    update: k,
    dispose() {
      f();
      for (const c of s.values()) for (const u of c) u.geometry.dispose();
      s.clear(), e.remove(i);
    }
  };
}
function Wn(e, l, t, a) {
  const i = new ie(), s = e.position, r = ke(s), d = 48, f = e.kind === "seep" ? Math.min(1, e.stock / je.seep.capacity) : 1;
  if (f > 0 && Mt(e.kind, s, f) > Je(a)) {
    const u = Mt(e.kind, s, f) - r, v = [
      0,
      u,
      0
    ], m = [0.5, 0.5], h = [];
    for (let $ = 0; $ <= d; $++) {
      const b = $ / d * Math.PI * 2, C = vt(e.kind, s, b);
      v.push(Math.cos(b) * C, u, Math.sin(b) * C), m.push(0.5 + Math.cos(b) * 0.5, 0.5 + Math.sin(b) * 0.5), $ && h.push(0, $ + 1, $);
    }
    const A = new Fe();
    A.setAttribute("position", new _e(v, 3)), A.setAttribute("uv", new _e(m, 2)), A.setIndex(h), A.computeVertexNormals();
    const M = new oe(A, t);
    M.receiveShadow = !0, i.add(M);
  }
  const k = s.x * 0.13 + s.y * 0.07, c = e.kind === "reef_food" ? 15 : 5;
  for (let u = 0; u < c; u++) {
    const v = u * 2.399963 + k, m = 0.5 + Math.sin(u * 3.71 + k) * 0.5, h = vt(e.kind, s, v) * (0.78 + m * 0.32), A = Math.cos(v) * h, M = Math.sin(v) * h, $ = He[e.kind].radius * (0.045 + m * 0.075), b = new oe(Kt(k + u, $), l);
    b.scale.set(1.5 + m, 0.8 + m * 0.4, 0.8 + m * 0.5), b.rotation.set(m * 0.3, v, m * 0.2), b.position.set(A, ke({
      x: s.x + A,
      y: s.y + M
    }) - r + $ * 0.15, M), b.castShadow = !0, b.receiveShadow = !0, i.add(b);
  }
  return i;
}
function Dn(e) {
  const l = new ie(), t = e.kind === "disturbed_ground", a = e.kind === "urine", i = J(new We(1, 12, 6), t ? "#ac9670" : a ? "#baae85" : "#796448", l, 0, 0.012);
  if (i.scale.set(t ? 0.32 : 0.2, t ? 0.075 : a ? 0.01 : 0.035, t ? 0.24 : 0.16), i.castShadow = !a, t) for (let s = 0; s < 5; s++) {
    const r = J(new Ft(0.045), "#c5b08c", l, Math.cos(s * 2.4) * 0.26, 0.015, Math.sin(s * 2.4) * 0.19);
    r.scale.y = 0.5;
  }
  return l;
}
function Tn(e, l, t, a, i) {
  const s = new Ea({
    antialias: !0,
    alpha: !1,
    powerPreference: "low-power"
  });
  s.setPixelRatio(Math.min(devicePixelRatio, 1.6)), s.shadowMap.enabled = !0, s.shadowMap.type = 2, s.outputColorSpace = pt, s.toneMapping = 4, s.toneMappingExposure = 1.25, e.append(s.domElement);
  const r = new ma();
  r.background = new ot("#c0e8ef"), r.fog = new ha("#c0e8ef", 120, 235);
  const d = new Aa(-35, 35, 25, -25, 0.1, 500), f = new $a("#fff4da", 3);
  f.position.set(-35, 65, -25), f.castShadow = !0, f.shadow.mapSize.set(2048, 2048), Object.assign(f.shadow.camera, {
    left: -60,
    right: 60,
    top: 60,
    bottom: -60,
    near: 0.5,
    far: 180
  }), f.shadow.bias = -4e-4, r.add(f, f.target, new ya("#e5f7ff", "#a2a67d", 2.1));
  const k = hn(s.capabilities.getMaxAnisotropy(), () => {
    S || R();
  }, a), c = In(k.material);
  r.add(c);
  const u = yn(c.geometry);
  r.add(u.root);
  const v = new xe({
    color: "#75b5b6",
    roughness: 0.2,
    metalness: 0.12,
    transparent: !0,
    opacity: 0.78
  }), m = new ie(), h = new ie();
  r.add(m, h);
  const A = un(() => {
    S || R();
  }, a), M = cn(), $ = Bn(r, A, M, k.reefRock), b = Sn(r, e, t, A, i), C = En(r), w = new oe(new Wt(0.5, 0.6, 40), new Tt({
    color: "#2b7b78",
    transparent: !0,
    opacity: 0.85,
    side: 2
  }));
  w.rotation.x = -Math.PI / 2, w.position.y = 0.035, h.add(w), h.visible = !1;
  let x = null, P = 0, S = !1, G = !0, L = 12;
  const ee = new pa(), z = matchMedia("(prefers-reduced-motion: reduce)");
  function D() {
    const N = e.clientWidth, te = e.clientHeight;
    !N || !te || (s.setSize(N, te, !1), d.left = -L * N / te, d.right = L * N / te, d.top = L, d.bottom = -L, d.updateProjectionMatrix(), R());
  }
  function K(N = performance.now()) {
    if (P = 0, S || !G || !x || document.hidden || !e.clientHeight) return;
    b.animate(N);
    const te = b.player(), j = new q(te.x, ke({
      x: te.x,
      y: te.z
    }), te.z);
    d.position.copy(j).add(new q(10, 25, 32)), d.lookAt(j), d.updateMatrixWorld(), M.update(te, d), f.position.copy(j).add(new q(-35, 65, -25)), f.target.position.copy(j), b.project(d), u.animate(z.matches ? 0 : N / 1e3), C.animate(z.matches ? 0 : N / 1e3, j), s.render(r, d), z.matches || (P = requestAnimationFrame(K));
  }
  function R() {
    cancelAnimationFrame(P), P = requestAnimationFrame(K);
  }
  function Q(N) {
    x = N, $.update(N.self.position), at(m, [
      ...A.materials,
      ...M.materials,
      k.reefRock,
      v
    ]), m.clear(), b.update(N, z.matches);
    for (const j of N.waste) {
      const ne = Dn(j);
      ne.position.set(j.position.x, 0, j.position.y), m.add(ne);
    }
    for (const j of N.structures) {
      const ne = rn(j, A);
      M.apply(ne), ne.position.set(j.position.x, 0, j.position.y), m.add(ne);
    }
    for (const j of N.items) {
      if (j.location.kind !== "ground") continue;
      const ne = j.location.position, Z = st(j, A, i);
      Z.position.set(ne.x, 0, ne.y), m.add(Z);
    }
    for (const j of N.resources) {
      const ne = j.position;
      if (j.kind === "seep" || j.kind === "reef_food") {
        const Z = Wn({
          ...j,
          kind: j.kind
        }, k.reefRock, v, N.weather.tide);
        Z.position.set(ne.x, 0, ne.y), m.add(Z);
      } else if (j.kind === "coconuts") for (let Z = 0; Z < Math.min(7, j.stock); Z++) J(new We(0.16, 8, 7), "#9a9e56", m, ne.x + Math.cos(Z * 2.4) * 0.6, 0.12, ne.y + Math.sin(Z * 2.4) * 0.6);
      else {
        const Z = st({
          kind: j.kind === "wood" ? "branch" : "palm_leaf",
          quantity: Math.floor(j.stock),
          wetness: 0
        }, A, i);
        Z.position.set(ne.x, 0, ne.y), m.add(Z);
      }
    }
    for (const j of m.children) j.position.y += ke({
      x: j.position.x,
      y: j.position.z
    });
    s.toneMappingExposure = N.weather.daylight ? N.weather.rain ? 1.05 : 1.25 : 0.58;
    const te = N.weather.daylight ? N.weather.rain ? "#b4d4df" : "#c0e8ef" : "#5c788c";
    r.background = new ot(te), r.fog.color.set(te), f.intensity = N.weather.daylight ? N.weather.rain ? 1.4 : 3 : 0.6, u.update(N.weather.tide, N.weather.daylight, N.weather.rain), k.update(N.weather.tide), C.setRain(N.weather.rain), R();
  }
  function F(N) {
    if (!x || N.button !== 0) return;
    const te = s.domElement.getBoundingClientRect();
    ee.setFromCamera(new ht((N.clientX - te.left) / te.width * 2 - 1, 1 - (N.clientY - te.top) / te.height * 2), d);
    const j = b.pick(ee);
    if (j) {
      t(j);
      return;
    }
    const ne = ee.intersectObject(c, !1)[0];
    if (!ne) return;
    const Z = {
      x: ne.point.x,
      y: ne.point.z
    };
    !Qe(Z, Me) || fe(Z, x.self.position) > 90 || (h.visible = !0, h.position.set(Z.x, ke(Z), Z.y), R(), l(Z));
  }
  function U(N) {
    L = Math.max(3, Math.min(36, L + N)), D();
  }
  function H(N) {
    N.preventDefault(), U(Math.sign(N.deltaY) * 2);
  }
  function re() {
    document.hidden ? cancelAnimationFrame(P) : R();
  }
  const ae = new ResizeObserver(D);
  return ae.observe(e), s.domElement.addEventListener("pointerup", F), s.domElement.addEventListener("wheel", H, { passive: !1 }), s.domElement.addEventListener("webglcontextlost", a), document.addEventListener("visibilitychange", re), D(), {
    update: Q,
    resize: D,
    changeZoom: U,
    setActive(N) {
      G = N, N ? (D(), R()) : cancelAnimationFrame(P);
    },
    dispose() {
      S = !0, cancelAnimationFrame(P), ae.disconnect(), document.removeEventListener("visibilitychange", re), s.domElement.removeEventListener("pointerup", F), s.domElement.removeEventListener("wheel", H), s.domElement.removeEventListener("webglcontextlost", a), b.dispose(), C.dispose(), $.dispose(), u.dispose(), at(r, [
        ...A.materials,
        ...M.materials,
        k.reefRock,
        v
      ]), M.dispose(), A.dispose(), k.dispose(), v.dispose(), sn(), f.dispose(), s.dispose(), s.domElement.remove();
    }
  };
}
var $t = "" + new URL("island-assets/ye-8ouylymt.glb", import.meta.url).href;
function Fn(e) {
  const l = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = e.clone();
  return Xt(e, a, function(i, s) {
    l.set(s, i), t.set(i, s);
  }), a.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const s = i, r = l.get(i), d = r.skeleton.bones;
    s.skeleton = r.skeleton.clone(), s.bindMatrix.copy(r.bindMatrix), s.skeleton.bones = d.map(function(f) {
      return t.get(f);
    }), s.bind(s.skeleton, s.bindMatrix);
  }), a;
}
function Xt(e, l, t) {
  t(e, l);
  for (let a = 0; a < e.children.length; a++) Xt(e.children[a], l.children[a], t);
}
var Ct = [
  "idle",
  "walk",
  "rest",
  "work",
  "construct",
  "drink",
  "wash",
  "offer",
  "drag",
  "dead"
], Un = {
  gather: "work",
  fill: "work",
  pour: "work",
  empty: "work",
  drink: "drink",
  sip: "drink",
  eat: "drink",
  craft: "work",
  build: "construct",
  relieve: "work",
  wash: "wash",
  cover_waste: "work",
  cover_body: "work",
  ignite: "work",
  fuel: "work",
  boil: "work"
};
function Nn(e, l, t, a) {
  return e ? "dead" : l ? t === "drag" ? "drag" : "walk" : t === "work" ? a ? Un[a] : "work" : t === "rest" || t === "construct" || t === "offer" ? t : t === "take" ? "work" : "idle";
}
function ft(e) {
  const l = Array.isArray(e.material) ? e.material : [e.material];
  if (l.some((t) => !(t instanceof xe))) throw new Error("island_character_material");
  return l;
}
function At(e) {
  const l = /* @__PURE__ */ new Map();
  e.traverse((t) => {
    const a = t.userData.garment_id;
    if (a) {
      if (l.has(a)) throw new Error("island_character_duplicate_garment");
      l.set(a, t);
    }
  });
  for (const t of new Set(Object.values(we).map((a) => a.shape))) if (!l.has(t)) throw new Error(`island_character_missing_garment:${t}`);
  return l;
}
function Ne(e, l) {
  const t = e.getObjectByName(xa.sanitizeNodeName(l));
  if (!(t instanceof Ma)) throw new Error(`island_character_missing_bone:${l}`);
  return t;
}
function zn(e) {
  const l = [], t = new q();
  if (e.updateMatrixWorld(!0), e.traverse((a) => {
    if (!(a instanceof oe)) return;
    let i = a;
    for (; i && !i.userData.asset_role; ) i = i.parent;
    if (!i || ![
      "body.skin",
      "clothing.shoes",
      "clothing.wraps"
    ].includes(i.userData.asset_role)) return;
    const s = [];
    for (let d = 0; d < a.geometry.getAttribute("position").count; d++)
      a.getVertexPosition(d, t).applyMatrix4(a.matrixWorld), s.push(t.y);
    const r = Math.min(...s);
    l.push({
      mesh: a,
      vertices: s.flatMap((d, f) => d < r + 0.035 ? [f] : [])
    });
  }), !l.length) throw new Error("island_character_missing_foot_contact");
  return l;
}
function On(e) {
  for (let l = e; l; l = l.parent) if (!l.visible) return !1;
  return !0;
}
function St(e) {
  if (typeof e.userData.garment_tint != "boolean") throw new Error("island_character_missing_fabric_role");
  return {
    material: e.clone(),
    dry: e.color.clone(),
    roughness: e.roughness,
    tint: e.userData.garment_tint
  };
}
function It(e, l, t) {
  for (const a of e) a.tint ? Vt(a.material, l, t) : (a.material.color.copy(a.dry).multiplyScalar(1 - t * 0.28), a.material.roughness = Math.max(0.05, a.roughness - t * 0.24));
}
function Et(e) {
  const l = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  e.traverse((s) => {
    if (s instanceof oe) {
      l.add(s.geometry);
      for (const r of ft(s)) {
        t.add(r);
        for (const d of Object.values(r)) d instanceof Wa && a.add(d);
      }
      s instanceof mt && i.add(s.skeleton);
    }
  }), i.forEach((s) => s.dispose()), l.forEach((s) => s.dispose()), t.forEach((s) => s.dispose()), a.forEach((s) => {
    s.dispose(), s.source.data?.close?.();
  });
}
function Gn(e) {
  const l = e.scene, t = new Map(e.animations.map((r) => [r.name, r])), a = /* @__PURE__ */ new Map();
  let i = !1;
  try {
    for (const f of Ct) if (!t.has(f)) throw new Error(`island_character_missing_animation:${f}`);
    Ne(l, "head"), Ne(l, "wrist.R"), Ne(l, "finger3-1.R");
    const r = At(l), d = new wt(l);
    d.clipAction(t.get("idle")).play(), d.update(0), l.updateMatrixWorld(!0);
    for (const [f, k] of r) {
      const c = [], u = new ct(), v = new q();
      if (k.traverse((h) => {
        if (!(h instanceof oe)) return;
        const A = ft(h);
        if (A.some((b) => typeof b.userData.garment_tint != "boolean")) throw new Error("island_character_missing_fabric_role");
        const M = h.geometry.clone(), $ = M.getAttribute("position");
        for (let b = 0; b < $.count; b++)
          h.getVertexPosition(b, v).applyMatrix4(h.matrixWorld), $.setXYZ(b, v.x, v.y, v.z), u.expandByPoint(v);
        M.deleteAttribute("skinIndex"), M.deleteAttribute("skinWeight"), c.push({
          geometry: M,
          materials: A
        });
      }), !c.length) throw new Error("island_character_empty_garment");
      const m = u.getCenter(new q());
      for (const { geometry: h } of c) {
        if (h.translate(-m.x, -m.y, -m.z), f === "shoes" || f === "wraps") h.translate(0, (u.max.y - u.min.y) / 2 + 0.01, 0);
        else {
          const A = f === "lifejacket" ? 0.5 : 0.18;
          h.scale(1, 1, A), h.rotateX(-Math.PI / 2), h.translate(0, (u.max.z - u.min.z) * A / 2 + 0.01, 0);
        }
        h.computeVertexNormals(), h.computeBoundingBox(), h.computeBoundingSphere();
      }
      a.set(f, c);
    }
    d.stopAllAction(), d.uncacheRoot(l);
  } catch (r) {
    throw a.forEach((d) => d.forEach((f) => f.geometry.dispose())), Et(l), r;
  }
  function s() {
    if (i) throw new Error("island_character_disposed");
  }
  return {
    create(r, d) {
      s();
      const f = Fn(l), k = new ie(), c = new ie(), u = new ie(), v = new Ra();
      k.name = "ye", f.name = "ye-body", k.add(f, c, u, v), u.position.y = 0.35;
      const m = At(f), h = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Set();
      f.traverse((z) => {
        z instanceof oe && (z.castShadow = z.receiveShadow = !0, z.frustumCulled = !1), z instanceof mt && A.add(z.skeleton);
      });
      for (const [z, D] of m) {
        const K = [];
        D.traverse((R) => {
          if (!(R instanceof oe)) return;
          const Q = ft(R).map(St);
          K.push(...Q), R.material = Array.isArray(R.material) ? Q.map((F) => F.material) : Q[0].material;
        }), h.set(z, K);
      }
      const M = Ne(f, "head"), $ = Ne(f, "wrist.R"), b = Ne(f, "finger3-1.R"), C = zn(f), w = new q(), x = new q(), P = new wt(f), S = new Map(Ct.map((z) => [z, P.clipAction(t.get(z))]));
      let G = null, L = null;
      const ee = {
        root: k,
        hand: c,
        covering: u,
        headAnchor: v,
        wetness(z) {
          for (const [D, K] of m) {
            const R = z.find((Q) => we[Q.kind]?.shape === D);
            K.visible = !!R, R && It(h.get(D), we[R.kind], R.wetness);
          }
        },
        pose(z, D, K, R = null) {
          const Q = Nn(d, D, K, R), F = S.get(Q);
          if (f.position.y = 0, G !== F) {
            const H = G;
            G = F, G.reset().play(), H && H.crossFadeTo(G, 0.18, !1);
          }
          const U = L === null ? 0 : Math.max(0, Math.min(0.08, (z - L) * 0.16));
          if (z === 0) {
            for (const H of S.values()) H !== G && H.stop();
            G.stopFading().setEffectiveWeight(1);
          }
          if (P.update(U), L = z, k.updateMatrixWorld(!0), Q === "idle" || Q === "walk") {
            const H = new Lt().copy(k.matrixWorld).invert();
            let re = 1 / 0;
            for (const ae of C)
              if (On(ae.mesh))
                for (const N of ae.vertices)
                  ae.mesh.getVertexPosition(N, w).applyMatrix4(ae.mesh.matrixWorld).applyMatrix4(H), re = Math.min(re, w.y);
            if (!Number.isFinite(re)) throw new Error("island_character_invalid_foot_contact");
            f.position.y = -re, k.updateMatrixWorld(!0);
          }
          $.getWorldPosition(x), b.getWorldPosition(w), x.lerp(w, 0.55), c.position.copy(k.worldToLocal(x)), M.getWorldPosition(w), v.position.copy(k.worldToLocal(w)), v.position.y += 0.16;
        },
        dispose() {
          P.stopAllAction(), P.uncacheRoot(f), A.forEach((z) => z.dispose()), h.forEach((z) => z.forEach((D) => D.material.dispose()));
        }
      };
      return ee.wetness(r), ee.pose(0, !1, null), ee;
    },
    garment(r) {
      s();
      const d = we[r.kind];
      if (!d) throw new Error("island_not_garment");
      const f = new ie();
      f.userData.garment = !0;
      for (const k of a.get(d.shape)) {
        const c = k.materials.map(St);
        It(c, d, r.wetness);
        const u = c.map((m) => m.material), v = new oe(k.geometry.clone(), u.length === 1 ? u[0] : u);
        v.castShadow = v.receiveShadow = !0, f.add(v);
      }
      return f;
    },
    dispose() {
      i || (i = !0, a.forEach((r) => r.forEach((d) => d.geometry.dispose())), a.clear(), Et(l));
    }
  };
}
async function Vn(e) {
  const l = await fetch($t, { signal: e });
  if (!l.ok) throw new Error(`island_character_load:${l.status}`);
  const t = await l.arrayBuffer();
  e.throwIfAborted();
  const a = Gn(await new Va().parseAsync(t, new URL(".", $t).href));
  return e.aborted && (a.dispose(), e.throwIfAborted()), a;
}
var jn = ["aria-label"], Hn = {
  key: 0,
  class: "island-field-loading",
  role: "status"
}, Yn = {
  key: 1,
  class: "island-camera"
}, Kn = ["aria-label"], Xn = ["aria-label"], Zn = /* @__PURE__ */ ue({
  __name: "IslandField",
  props: {
    observation: {},
    disabled: { type: Boolean }
  },
  emits: [
    "move",
    "person",
    "error"
  ],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(null), s = V(!0), r = new AbortController();
    let d = null, f = null, k = !0;
    Rt(async () => {
      try {
        f = await Vn(r.signal), d = Tn(i.value, (v) => {
          t.disabled || a("move", v);
        }, (v) => a("person", v), () => a("error"), f), d.update(t.observation), d.setActive(k), s.value = !1;
      } catch (v) {
        r.signal.aborted || (console.error(v), a("error"));
      }
    }), me(() => t.observation, (v) => d?.update(v)), Pt(() => {
      r.abort(), d?.dispose(), f?.dispose();
    }), da(() => {
      k = !0, d?.setActive(!0);
    }), ra(() => {
      k = !1, d?.setActive(!1);
    });
    function c(v) {
      d?.changeZoom(v);
    }
    function u(v) {
      if (t.disabled || s.value) return;
      const m = {
        ArrowUp: [0, -8],
        ArrowDown: [0, 8],
        ArrowLeft: [-8, 0],
        ArrowRight: [8, 0]
      }[v.key];
      m && (v.preventDefault(), a("move", {
        x: t.observation.self.position.x + m[0],
        y: t.observation.self.position.y + m[1]
      }));
    }
    return (v, m) => (g(), _("div", {
      ref_key: "root",
      ref: i,
      class: "island-field",
      tabindex: "0",
      "aria-label": n(o).mapLabel,
      onKeydown: Re(u, ["self"])
    }, [s.value ? (g(), _("p", Hn, p(n(o).loadingScene), 1)) : (g(), _("div", Yn, [y("button", {
      "aria-label": n(o).zoomIn,
      onClick: m[0] || (m[0] = (h) => c(-2))
    }, "＋", 8, Kn), y("button", {
      "aria-label": n(o).zoomOut,
      onClick: m[1] || (m[1] = (h) => c(2))
    }, "−", 8, Xn)]))], 40, jn));
  }
}), Qn = /* @__PURE__ */ pe(Zn, [["__scopeId", "data-v-b24e0257"]]);
function Jn(e, l, t, a) {
  const i = Ze[e];
  return i.toolOptions.length && !l.some((s) => s.quantity > 0 && Y[s.kind].tools.some((r) => i.toolOptions.includes(r))) ? "tool_missing" : i.fire && !a ? "fire_missing" : e === "dry_tinder" && t.some((s) => s.wetness > 0.25) ? "material_wet" : null;
}
function Zt(e) {
  const l = /* @__PURE__ */ new Map();
  for (const t of e) {
    const a = `${t.kind}:${t.location.kind}:${t.food}`;
    let i = l.get(a);
    i || (i = {
      key: a,
      kind: t.kind,
      location: t.location.kind,
      food: t.food,
      items: [],
      quantity: 0
    }, l.set(a, i)), i.items.push(t), i.quantity += t.quantity;
  }
  for (const t of l.values()) t.items.sort((a, i) => a.wetness - i.wetness);
  return [...l.values()];
}
function Qt(e, l) {
  const t = [];
  for (const a of e) {
    let i = l[a.key] ?? 0;
    if (!Number.isSafeInteger(i) || i < 0 || i > a.quantity) return null;
    for (const s of a.items) {
      const r = Math.min(i, s.quantity);
      r && (t.push({
        item: s.id,
        units: r
      }), i -= r);
    }
  }
  return t;
}
var eo = { class: "island-workshop" }, to = { class: "island-recipes" }, ao = ["aria-pressed", "onClick"], no = { class: "island-recipe-result" }, oo = { class: "island-requirements" }, io = { key: 0 }, so = {
  key: 0,
  class: "island-material-food"
}, ro = [
  "onUpdate:modelValue",
  "max",
  "aria-label"
], lo = {
  key: 1,
  class: "island-material-warning"
}, uo = {
  key: 2,
  class: "island-material-warning"
}, co = { class: "island-requirements" }, vo = {
  key: 4,
  class: "island-material-warning",
  role: "status"
}, fo = ["disabled"], po = /* @__PURE__ */ ue({
  __name: "Workshop",
  props: {
    mode: {},
    items: {},
    hasFire: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["work"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V("tear_cloth"), s = V({}), r = W(() => t.mode === "craft" ? Ka.map((x) => ({
      id: x,
      ...Ze[x]
    })) : Ya.map((x) => ({
      id: x,
      ...Se[x]
    }))), d = W(() => t.mode === "craft" ? Ze[i.value] : Se[i.value]), f = W(() => t.items.filter((x) => x.quantity && !x.water?.millilitres && (Object.keys(Y[x.kind].materials).some((P) => P in d.value.needs) || "kinds" in d.value && x.kind in d.value.kinds))), k = W(() => Zt(f.value)), c = W(() => Qt(k.value, s.value)), u = W(() => c.value ?? []), v = W(() => k.value.filter((x) => x.location === "worn" && s.value[x.key] > 0).map((x) => Y[x.kind].name)), m = W(() => k.value.some((x) => x.food === "off_odor" && s.value[x.key] > 0)), h = W(() => Da(u.value.map((x) => ({
      kind: f.value.find((P) => P.id === x.item).kind,
      units: x.units
    })))), A = W(() => [...Object.entries(d.value.needs).map(([x, P]) => ({
      name: Ga[x],
      needed: P,
      chosen: h.value.capabilities[x] ?? 0
    })), ..."kinds" in d.value ? Object.entries(d.value.kinds).map(([x, P]) => ({
      name: Y[x].name,
      needed: P,
      chosen: h.value.kinds[x] ?? 0
    })) : []]), M = W(() => c.value !== null && A.value.every((x) => x.chosen >= x.needed)), $ = W(() => t.mode === "craft" ? Jn(i.value, t.items, u.value.map((x) => f.value.find((P) => P.id === x.item)), t.hasFire) : null), b = W(() => {
      if (t.mode !== "craft") return [];
      const x = Ze[i.value], P = [];
      return x.toolOptions.length && P.push({
        label: o.toolChoice(x.toolOptions.map((S) => za[S])),
        ready: t.items.some((S) => S.quantity > 0 && Y[S.kind].tools.some((G) => x.toolOptions.includes(G)))
      }), x.fire && P.push({
        label: o.nearbyFire,
        ready: t.hasFire
      }), P;
    });
    function C() {
      const x = { ...d.value.needs }, P = "kinds" in d.value ? { ...d.value.kinds } : {}, S = {};
      for (const G of k.value) {
        if (G.location === "worn" || G.food === "off_odor") continue;
        let L = 0;
        for (let ee = 0; ee < G.quantity && !(!(P[G.kind] > 0) && !Object.entries(Y[G.kind].materials).some(([z]) => x[z] > 0)); ee++) {
          L++, P[G.kind] = Math.max(0, (P[G.kind] ?? 0) - 1);
          for (const [z, D] of Object.entries(Y[G.kind].materials)) x[z] = Math.max(0, (x[z] ?? 0) - D);
        }
        L && (S[G.key] = L);
      }
      s.value = S;
    }
    me(() => t.mode, () => {
      i.value = t.mode === "craft" ? "tear_cloth" : "shelter";
    }, { immediate: !0 }), me([i, f], C, { immediate: !0 });
    function w() {
      !M.value || $.value || a("work", t.mode === "craft" ? {
        kind: "craft",
        recipe: i.value,
        materials: u.value
      } : {
        kind: "build",
        blueprint: i.value,
        materials: u.value
      });
    }
    return (x, P) => (g(), _("div", eo, [
      y("div", to, [(g(!0), _(T, null, X(r.value, (S) => (g(), _("button", {
        key: S.id,
        "aria-pressed": i.value === S.id,
        onClick: (G) => i.value = S.id
      }, p(S.name), 9, ao))), 128))]),
      y("p", no, [le(p(n(o).duration(d.value.seconds)), 1), "outputs" in d.value ? (g(), _(T, { key: 0 }, [le(" · " + p(n(o).produces) + " " + p(Object.entries(d.value.outputs).map(([S, G]) => `${n(Y)[S].name} × ${G}`).join("、")), 1)], 64)) : I("", !0)]),
      y("h3", null, p(n(o).materials), 1),
      y("ul", oo, [(g(!0), _(T, null, X(A.value, (S) => (g(), _("li", {
        key: S.name,
        class: De({ missing: S.chosen < S.needed })
      }, [y("span", null, p(S.name), 1), y("span", null, p(Number(S.chosen.toFixed(1))) + " / " + p(S.needed), 1)], 2))), 128))]),
      f.value.length ? I("", !0) : (g(), _("p", io, p(n(o).noMaterials), 1)),
      (g(!0), _(T, null, X(k.value, (S) => (g(), _("label", {
        key: S.key,
        class: "island-material"
      }, [y("span", null, [
        le(p(n(Y)[S.kind].name), 1),
        y("small", null, [le(" · " + p(n(o).materialAvailable(S.quantity)), 1), S.location === "worn" ? (g(), _(T, { key: 0 }, [le(" · " + p(n(o).worn), 1)], 64)) : S.location === "ground" ? (g(), _(T, { key: 1 }, [le(" · " + p(n(o).ground), 1)], 64)) : I("", !0)]),
        S.food ? (g(), _("small", so, p(n(o).foodCondition[S.food]), 1)) : I("", !0)
      ]), de(y("input", {
        "onUpdate:modelValue": (G) => s.value[S.key] = G,
        type: "number",
        min: "0",
        max: S.quantity,
        "aria-label": `${n(Y)[S.kind].name} · ${S.food ? n(o).foodCondition[S.food] + " · " : ""}${n(o).quantity}`
      }, null, 8, ro), [[
        Ae,
        s.value[S.key],
        void 0,
        { number: !0 }
      ]])]))), 128)),
      v.value.length ? (g(), _("p", lo, p(n(o).dismantleWarning(v.value)), 1)) : I("", !0),
      m.value ? (g(), _("p", uo, p(n(o).spoiledCooking), 1)) : I("", !0),
      b.value.length ? (g(), _(T, { key: 3 }, [
        y("h3", null, p(n(o).tools), 1),
        y("ul", co, [(g(!0), _(T, null, X(b.value, (S) => (g(), _("li", {
          key: S.label,
          class: De({ missing: !S.ready })
        }, [y("span", null, p(S.label), 1), y("span", null, p(S.ready ? n(o).ready : n(o).missingCondition), 1)], 2))), 128))]),
        y("small", null, p(n(o).toolsKept), 1)
      ], 64)) : I("", !0),
      $.value ? (g(), _("p", vo, p(n(Ta)[$.value]), 1)) : I("", !0),
      y("button", {
        class: "island-primary",
        disabled: e.disabled || !M.value || !!$.value,
        onClick: w
      }, p(M.value ? e.mode === "craft" ? n(o).make : n(o).place : n(o).materialMissing), 9, fo)
    ]));
  }
}), mo = /* @__PURE__ */ pe(po, [["__scopeId", "data-v-f961b0ce"]]), ho = {
  key: 0,
  class: "island-sites"
}, bo = ["disabled", "onClick"], yo = ["disabled", "onClick"], ko = { class: "island-site-row" }, go = ["aria-label"], wo = {
  value: "",
  disabled: ""
}, _o = ["value"], xo = ["max", "aria-label"], Mo = ["disabled", "onClick"], $o = ["disabled", "onClick"], Co = { class: "island-site-row" }, Ao = ["aria-label"], So = {
  value: "",
  disabled: ""
}, Io = ["value"], Eo = ["disabled", "onClick"], Po = { class: "island-site-row" }, Ro = ["aria-label"], qo = {
  value: "",
  disabled: ""
}, Lo = ["value"], Bo = ["disabled", "onClick"], Wo = ["disabled", "onClick"], Do = /* @__PURE__ */ ue({
  __name: "CampSites",
  props: {
    sites: {},
    items: {},
    position: {},
    disabled: { type: Boolean }
  },
  emits: ["act", "move"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(""), s = V(""), r = V(1), d = W(() => t.items.filter((b) => b.water)), f = W(() => Zt(t.items.filter((b) => Y[b.kind].materials.fuel))), k = W(() => f.value.find((b) => b.key === s.value)), c = W(() => Qt(f.value, { [s.value]: r.value })), u = W(() => !!k.value && !!c.value?.length && Y[k.value.kind].materials.fuel * r.value >= 1);
    me(s, () => {
      r.value = k.value ? Math.ceil(1 / Y[k.value.kind].materials.fuel) : 1;
    });
    const v = W(() => t.items.find((b) => b.kind === "tinder")), m = W(() => t.items.find((b) => b.kind === "fire_drill")), h = (b) => Ie(t.position, b);
    function A(b) {
      const C = d.value.find((w) => w.id === i.value);
      return C ? Math.max(0, Math.floor(Math.min(250, b, Y[C.kind].capacity - C.water.millilitres))) : 0;
    }
    function M(b) {
      v.value && m.value && a("act", {
        kind: "work",
        task: {
          kind: "ignite",
          site: b,
          tinder: v.value.id,
          drill: m.value.id
        }
      });
    }
    function $(b) {
      u.value && a("act", {
        kind: "work",
        task: {
          kind: "fuel",
          site: b,
          materials: c.value
        }
      });
    }
    return (b, C) => e.sites.length ? (g(), _("section", ho, [(g(!0), _(T, null, X(e.sites, (w) => (g(), _("article", {
      key: w.id,
      class: "island-site"
    }, [y("header", null, [y("strong", null, p(n(Se)[w.kind].name), 1), y("small", null, p(n(o).distance(n(fe)(e.position, w.position))), 1)]), h(w.position) ? w.workLeft ? (g(), _("button", {
      key: 1,
      disabled: e.disabled,
      onClick: (x) => a("act", {
        kind: "construct",
        site: w.id
      })
    }, p(n(o).work), 9, yo)) : (g(), _(T, { key: 2 }, [w.kind === "firepit" ? (g(), _(T, { key: 0 }, [
      y("small", null, p(w.burning ? n(o).fireBurning : n(o).fireUnlit) + " · " + p(w.fuelSeconds ? n(o).fuelTime(w.fuelSeconds) : n(o).fireNeedsFuel), 1),
      y("div", ko, [
        de(y("select", {
          "onUpdate:modelValue": C[0] || (C[0] = (x) => s.value = x),
          "aria-label": n(o).fuel
        }, [y("option", wo, p(n(o).materials), 1), (g(!0), _(T, null, X(f.value, (x) => (g(), _("option", {
          key: x.key,
          value: x.key
        }, p(n(Y)[x.kind].name) + " × " + p(x.quantity), 9, _o))), 128))], 8, go), [[Pe, s.value]]),
        k.value ? de((g(), _("input", {
          key: 0,
          "onUpdate:modelValue": C[1] || (C[1] = (x) => r.value = x),
          type: "number",
          min: "1",
          max: k.value.quantity,
          "aria-label": `${n(o).fuel} · ${n(o).quantity}`
        }, null, 8, xo)), [[
          Ae,
          r.value,
          void 0,
          { number: !0 }
        ]]) : I("", !0),
        y("button", {
          disabled: e.disabled || !u.value,
          onClick: (x) => $(w.id)
        }, p(n(o).fuel), 9, Mo)
      ]),
      y("button", {
        disabled: e.disabled || w.burning || !w.fuelSeconds || !v.value || !m.value,
        onClick: (x) => M(w.id)
      }, p(n(o).fire), 9, $o),
      y("div", Co, [de(y("select", {
        "onUpdate:modelValue": C[2] || (C[2] = (x) => i.value = x),
        "aria-label": n(o).waterContainer
      }, [y("option", So, p(n(o).waterContainer), 1), (g(!0), _(T, null, X(d.value.filter((x) => n(Y)[x.kind].heatSafe && x.water.millilitres), (x) => (g(), _("option", {
        key: x.id,
        value: x.id
      }, p(n(Y)[x.kind].name), 9, Io))), 128))], 8, Ao), [[Pe, i.value]]), y("button", {
        disabled: e.disabled || !w.burning || !i.value,
        onClick: (x) => a("act", {
          kind: "work",
          task: {
            kind: "boil",
            site: w.id,
            container: i.value
          }
        })
      }, p(n(o).boil), 9, Eo)])
    ], 64)) : I("", !0), w.water ? (g(), _(T, { key: 1 }, [
      y("small", null, p(Math.floor(w.water.millilitres)) + " ml", 1),
      y("div", Po, [de(y("select", {
        "onUpdate:modelValue": C[3] || (C[3] = (x) => i.value = x),
        "aria-label": n(o).waterContainer
      }, [y("option", qo, p(n(o).waterContainer), 1), (g(!0), _(T, null, X(d.value, (x) => (g(), _("option", {
        key: x.id,
        value: x.id
      }, p(n(Y)[x.kind].name), 9, Lo))), 128))], 8, Ro), [[Pe, i.value]]), y("button", {
        disabled: e.disabled || !A(w.water.millilitres),
        onClick: (x) => a("act", {
          kind: "work",
          task: {
            kind: "fill",
            source: w.id,
            container: i.value,
            millilitres: A(w.water.millilitres)
          }
        })
      }, p(n(o).fill), 9, Bo)]),
      y("button", {
        disabled: e.disabled || w.water.millilitres < 1,
        onClick: (x) => a("act", {
          kind: "work",
          task: {
            kind: "sip",
            source: w.id,
            millilitres: Math.min(250, Math.floor(w.water.millilitres))
          }
        })
      }, p(n(o).sip), 9, Wo),
      y("small", null, p(n(o).rawWaterRisk), 1)
    ], 64)) : I("", !0)], 64)) : (g(), _("button", {
      key: 0,
      disabled: e.disabled,
      onClick: (x) => a("move", w.position)
    }, p(n(o).approach), 9, bo))]))), 128))])) : I("", !0);
  }
}), To = /* @__PURE__ */ pe(Do, [["__scopeId", "data-v-1bf8db2b"]]), Fo = { key: 0 }, Uo = /* @__PURE__ */ ue({
  __name: "FoodReadout",
  props: {
    water: {},
    food: {}
  },
  setup(e) {
    return (l, t) => (g(), _(T, null, [
      e.water ? (g(), _("small", Fo, p(Math.floor(e.water.millilitres)) + " ml · " + p(n(o)[e.water.quality]), 1)) : I("", !0),
      e.food && e.food !== e.water?.food ? (g(), _("small", {
        key: 1,
        class: De({ "island-food-warning": e.food === "off_odor" })
      }, p(n(o).foodCondition[e.food]), 3)) : I("", !0),
      e.water?.food ? (g(), _("small", {
        key: 2,
        class: De({ "island-food-warning": e.water.food === "off_odor" })
      }, p(e.food === e.water.food ? n(o).foodAndLiquid : n(o).liquid) + " · " + p(n(o).foodCondition[e.water.food]), 3)) : I("", !0)
    ], 64));
  }
}), Jt = /* @__PURE__ */ pe(Uo, [["__scopeId", "data-v-20772ea3"]]), No = ["aria-label"], zo = ["disabled", "onClick"], Oo = /* @__PURE__ */ ue({
  __name: "IncomingOffers",
  props: {
    offers: {},
    disabled: { type: Boolean }
  },
  emits: ["accept"],
  setup(e, { emit: l }) {
    const t = l;
    return (a, i) => e.offers.some((s) => s.to === "player") ? (g(), _("div", {
      key: 0,
      class: "island-incoming",
      "aria-label": n(o).incoming
    }, [(g(!0), _(T, null, X(e.offers.filter((s) => s.to === "player"), (s) => (g(), _("button", {
      key: s.from,
      disabled: e.disabled,
      onClick: (r) => t("accept", s.from)
    }, [y("span", null, [le(p(n(o).receive) + " · " + p(n(Y)[s.form].name) + " × " + p(s.units), 1), Ce(Jt, {
      water: s.water,
      food: s.food
    }, null, 8, ["water", "food"])]), y("small", null, p(n(o).offeredBy(s.from)), 1)], 8, zo))), 128))], 8, No)) : I("", !0);
  }
}), ea = /* @__PURE__ */ pe(Oo, [["__scopeId", "data-v-e7b4c839"]]), Go = { class: "island-item-actions" }, Vo = ["disabled"], jo = ["disabled"], Ho = ["disabled"], Yo = ["disabled"], Ko = ["disabled"], Xo = ["value"], Zo = ["max", "disabled"], Qo = { class: "island-item-actions" }, Jo = ["disabled"], ei = ["disabled"], ti = /* @__PURE__ */ ue({
  __name: "LiquidActions",
  props: {
    item: {},
    accessible: {},
    disabled: { type: Boolean }
  },
  emits: ["work"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(!1), s = V(""), r = V(250), d = W(() => Math.floor(t.item.water?.millilitres ?? 0)), f = W(() => t.accessible.filter((v) => v.id !== t.item.id && v.water && v.water.millilitres < Y[v.kind].capacity)), k = W(() => {
      const v = f.value.find((m) => m.id === s.value);
      return v ? Math.floor(Math.min(d.value, Y[v.kind].capacity - v.water.millilitres)) : 0;
    });
    me(f, (v) => {
      v.some((m) => m.id === s.value) || (s.value = v[0]?.id ?? "");
    }, { immediate: !0 }), me(d, (v, m) => {
      v < m && (i.value = !1);
    });
    function c() {
      i.value = !0, r.value = Math.min(250, k.value);
    }
    function u() {
      a("work", {
        kind: "pour",
        from: t.item.id,
        container: s.value,
        millilitres: r.value
      });
    }
    return (v, m) => d.value ? (g(), _(T, { key: 0 }, [y("div", Go, [
      y("button", {
        disabled: e.disabled,
        onClick: m[0] || (m[0] = (h) => a("work", {
          kind: "drink",
          container: e.item.id,
          millilitres: Math.min(250, d.value)
        }))
      }, p(e.item.water?.food === "off_odor" ? n(o).drinkDespiteSpoilage : n(o).drink), 9, Vo),
      d.value >= n(ze).minimumWashMl ? (g(), _("button", {
        key: 0,
        disabled: e.disabled,
        onClick: m[1] || (m[1] = (h) => a("work", {
          kind: "wash",
          supply: {
            kind: "container",
            id: e.item.id
          },
          millilitres: Math.min(n(ze).portionMl, d.value)
        }))
      }, p(n(o).wash), 9, jo)) : I("", !0),
      f.value.length && !i.value ? (g(), _("button", {
        key: 1,
        disabled: e.disabled,
        onClick: c
      }, p(n(o).pour), 9, Ho)) : I("", !0),
      y("button", {
        disabled: e.disabled,
        onClick: m[2] || (m[2] = (h) => a("work", {
          kind: "empty",
          container: e.item.id,
          millilitres: d.value
        }))
      }, p(n(o).emptyLiquid), 9, Yo)
    ]), i.value ? (g(), _("form", {
      key: 0,
      class: "island-pour",
      onSubmit: Re(u, ["prevent"])
    }, [
      y("label", null, [le(p(n(o).pourTo), 1), de(y("select", {
        "onUpdate:modelValue": m[3] || (m[3] = (h) => s.value = h),
        disabled: e.disabled
      }, [(g(!0), _(T, null, X(f.value, (h) => (g(), _("option", {
        key: h.id,
        value: h.id
      }, p(n(Y)[h.kind].name) + " · " + p(Math.floor(h.water.millilitres)) + " ml · " + p(h.location.kind === "ground" ? n(o).ground : n(o).carried), 9, Xo))), 128))], 8, Ko), [[Pe, s.value]])]),
      y("label", null, [le(p(n(o).pourAmount), 1), de(y("input", {
        "onUpdate:modelValue": m[4] || (m[4] = (h) => r.value = h),
        type: "number",
        min: "1",
        max: k.value,
        disabled: e.disabled
      }, null, 8, Zo), [[
        Ae,
        r.value,
        void 0,
        { number: !0 }
      ]])]),
      y("div", Qo, [y("button", { disabled: e.disabled || !Number.isSafeInteger(r.value) || r.value < 1 || r.value > k.value }, p(n(o).pour), 9, Jo), y("button", {
        type: "button",
        disabled: e.disabled,
        onClick: m[5] || (m[5] = (h) => i.value = !1)
      }, p(n(o).cancel), 9, ei)])
    ], 32)) : I("", !0)], 64)) : I("", !0);
  }
}), ai = /* @__PURE__ */ pe(ti, [["__scopeId", "data-v-1232f41a"]]), ni = { key: 0 }, oi = { key: 0 }, ii = { key: 1 }, si = { key: 2 }, ri = { key: 0 }, li = { class: "island-item-actions" }, di = ["disabled", "onClick"], ui = ["disabled", "onClick"], ci = ["disabled", "onClick"], vi = ["disabled", "onClick"], fi = ["disabled", "onClick"], pi = ["onSubmit"], mi = { key: 0 }, hi = ["disabled"], bi = ["value"], yi = { key: 0 }, ki = ["max", "disabled"], gi = { class: "island-item-actions" }, wi = ["disabled"], _i = ["disabled"], xi = {
  key: 2,
  class: "island-item-actions"
}, Mi = ["disabled"], $i = /* @__PURE__ */ ue({
  __name: "Inventory",
  props: {
    observation: {},
    disabled: { type: Boolean }
  },
  emits: ["act", "move"],
  setup(e, { emit: l }) {
    const t = e, a = l;
    function i(b) {
      return b.location.kind === "ground" ? null : t.observation.people.find((C) => b.location.kind !== "ground" && C.id === b.location.person);
    }
    const s = W(() => t.observation.items.filter((b) => b.location.kind === "ground" || b.location.person === "player" || i(b)?.body.kind === "dead")), r = (b) => b.location.kind !== "ground" && b.location.person === "player";
    function d(b) {
      return b.location.kind === "ground" ? b.location.position : i(b)?.position ?? t.observation.self.position;
    }
    const f = (b) => Ie(t.observation.self.position, d(b)), k = W(() => s.value.filter((b) => r(b) || b.location.kind === "ground" && f(b))), c = W(() => t.disabled || !!t.observation.self.activity), u = W(() => t.observation.self.activity?.kind === "offer" ? t.observation.self.activity : null), v = W(() => t.observation.people.filter((b) => b.body.kind === "living" && Ie(t.observation.self.position, b.position))), m = V(null), h = V(""), A = V(1);
    me(() => t.observation, () => {
      (u.value?.item === m.value || !s.value.some((b) => b.id === m.value && r(b))) && (m.value = null);
    });
    function M(b) {
      m.value = b, h.value = v.value[0]?.id ?? "", A.value = 1;
    }
    function $(b) {
      !h.value || c.value || a("act", {
        kind: "offer",
        item: b,
        to: h.value,
        units: A.value
      });
    }
    return (b, C) => (g(), _("div", null, [
      Ce(ea, {
        offers: e.observation.offers,
        disabled: e.disabled,
        onAccept: C[0] || (C[0] = (w) => a("act", {
          kind: "accept",
          from: w
        }))
      }, null, 8, ["offers", "disabled"]),
      s.value.length ? I("", !0) : (g(), _("p", ni, p(n(o).empty), 1)),
      (g(!0), _(T, null, X(s.value, (w) => (g(), _("article", {
        key: w.id,
        class: "island-item"
      }, [
        y("div", null, [
          y("strong", null, p(n(Y)[w.kind].name), 1),
          y("span", null, [le(" × " + p(w.quantity), 1), w.location.kind === "worn" ? (g(), _("small", oi, " · " + p(n(o).worn), 1)) : w.location.kind === "ground" ? (g(), _("small", ii, " · " + p(n(o).ground), 1)) : w.location.kind === "covering" ? (g(), _("small", si, " · " + p(n(o).covering), 1)) : I("", !0)]),
          i(w)?.body.kind === "dead" && w.location.kind !== "covering" ? (g(), _("small", ri, p(n(o).remains), 1)) : I("", !0),
          Ce(Jt, {
            water: w.water,
            food: w.food
          }, null, 8, ["water", "food"])
        ]),
        y("div", li, [
          r(w) ? I("", !0) : (g(), _("button", {
            key: 0,
            disabled: c.value,
            onClick: (x) => f(w) ? a("act", {
              kind: "take",
              item: w.id
            }) : a("move", d(w))
          }, p(f(w) ? n(o).take : n(o).approach), 9, di)),
          r(w) ? (g(), _(T, { key: 1 }, [
            y("button", {
              disabled: c.value,
              onClick: (x) => a("act", {
                kind: "drop",
                item: w.id
              })
            }, p(n(o).drop), 9, ui),
            n(Na)[w.kind] ? (g(), _("button", {
              key: 0,
              disabled: c.value,
              onClick: (x) => a("act", {
                kind: w.location.kind === "worn" ? "unwear" : "wear",
                item: w.id
              })
            }, p(w.location.kind === "worn" ? n(o).unwear : n(o).wear), 9, ci)) : I("", !0),
            w.location.kind === "carried" && m.value !== w.id ? (g(), _("button", {
              key: 1,
              disabled: c.value,
              onClick: (x) => M(w.id)
            }, p(n(o).offer), 9, vi)) : I("", !0)
          ], 64)) : I("", !0),
          r(w) || w.location.kind === "ground" && f(w) ? (g(), _(T, { key: 2 }, [n(Y)[w.kind].energy ? (g(), _("button", {
            key: 0,
            disabled: c.value,
            onClick: (x) => a("act", {
              kind: "work",
              task: {
                kind: "eat",
                item: w.id
              }
            })
          }, p(w.food === "off_odor" ? n(o).eatDespiteSpoilage : n(o).eat), 9, fi)) : I("", !0)], 64)) : I("", !0)
        ]),
        w.water && (r(w) || w.location.kind === "ground" && f(w)) ? (g(), $e(ai, {
          key: 0,
          item: w,
          accessible: k.value,
          disabled: c.value,
          onWork: C[1] || (C[1] = (x) => a("act", {
            kind: "work",
            task: x
          }))
        }, null, 8, [
          "item",
          "accessible",
          "disabled"
        ])) : I("", !0),
        m.value === w.id ? (g(), _("form", {
          key: 1,
          class: "island-offer-form",
          onSubmit: Re((x) => $(w.id), ["prevent"])
        }, [v.value.length ? (g(), _(T, { key: 1 }, [y("label", null, [le(p(n(o).offerTo), 1), de(y("select", {
          "onUpdate:modelValue": C[2] || (C[2] = (x) => h.value = x),
          disabled: c.value
        }, [(g(!0), _(T, null, X(v.value, (x) => (g(), _("option", {
          key: x.id,
          value: x.id
        }, p(n(ce)[x.id].name), 9, bi))), 128))], 8, hi), [[Pe, h.value]])]), w.quantity > 1 ? (g(), _("label", yi, [le(p(n(o).quantity), 1), de(y("input", {
          "onUpdate:modelValue": C[3] || (C[3] = (x) => A.value = x),
          type: "number",
          min: "1",
          max: w.quantity,
          disabled: c.value
        }, null, 8, ki), [[
          Ae,
          A.value,
          void 0,
          { number: !0 }
        ]])])) : I("", !0)], 64)) : (g(), _("p", mi, p(n(o).noRecipient), 1)), y("div", gi, [y("button", { disabled: c.value || !v.value.some((x) => x.id === h.value) || !Number.isSafeInteger(A.value) || A.value < 1 || A.value > w.quantity }, p(n(o).offer), 9, wi), y("button", {
          type: "button",
          disabled: e.disabled,
          onClick: C[4] || (C[4] = (x) => m.value = null)
        }, p(n(o).cancel), 9, _i)])], 40, pi)) : I("", !0),
        u.value?.item === w.id ? (g(), _("div", xi, [y("span", null, p(n(o).offering(u.value.to)) + " × " + p(u.value.units), 1), y("button", {
          disabled: e.disabled,
          onClick: C[5] || (C[5] = (x) => a("act", { kind: "cancel" }))
        }, p(n(o).takeBack), 9, Mi)])) : I("", !0)
      ]))), 128))
    ]));
  }
}), Ci = /* @__PURE__ */ pe($i, [["__scopeId", "data-v-fcf52d8c"]]), Ai = { class: "island-hygiene" }, Si = ["aria-label", "disabled"], Ii = ["value"], Ei = [
  "min",
  "max",
  "disabled"
], Pi = ["disabled"], Ri = { key: 1 }, qi = ["disabled", "onClick"], Li = /* @__PURE__ */ ue({
  __name: "HygieneActions",
  props: {
    observation: {},
    disabled: { type: Boolean }
  },
  emits: ["work", "move"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(""), s = V(ze.portionMl), r = W(() => {
      const c = t.observation, u = c.items.filter((h) => h.water && (h.location.kind === "ground" || h.location.kind === "carried" && h.location.person === c.observer)).map((h) => ({
        supply: {
          kind: "container",
          id: h.id
        },
        name: Y[h.kind].name,
        available: h.water.millilitres,
        position: h.location.kind === "ground" ? h.location.position : c.self.position
      })), v = c.resources.filter((h) => h.kind === "seep").map((h) => ({
        supply: {
          kind: "source",
          id: h.id
        },
        name: je[h.kind].name,
        available: h.stock,
        position: h.position
      })), m = c.structures.filter((h) => h.water && !h.workLeft).map((h) => ({
        supply: {
          kind: "source",
          id: h.id
        },
        name: Se[h.kind].name,
        available: h.water.millilitres,
        position: h.position
      }));
      return [
        ...u,
        ...v,
        ...m
      ].filter((h) => h.available >= ze.minimumWashMl).map((h) => ({
        ...h,
        key: `${h.supply.kind}:${h.supply.id}`
      }));
    });
    me(r, (c) => {
      c.some((u) => u.key === i.value) || (i.value = c[0]?.key ?? "");
    }, { immediate: !0 });
    const d = W(() => r.value.find((c) => c.key === i.value)), f = (c) => Ie(t.observation.self.position, c);
    function k() {
      if (d.value) {
        if (!f(d.value.position)) {
          a("move", d.value.position);
          return;
        }
        a("work", {
          kind: "wash",
          supply: d.value.supply,
          millilitres: s.value
        });
      }
    }
    return (c, u) => (g(), _("section", Ai, [
      y("h3", null, p(n(o).washSupply), 1),
      d.value ? (g(), _("form", {
        key: 0,
        onSubmit: Re(k, ["prevent"])
      }, [
        de(y("select", {
          "onUpdate:modelValue": u[0] || (u[0] = (v) => i.value = v),
          "aria-label": n(o).washSupply,
          disabled: e.disabled
        }, [(g(!0), _(T, null, X(r.value, (v) => (g(), _("option", {
          key: v.key,
          value: v.key
        }, p(v.name) + " · " + p(Math.floor(v.available)) + " ml · " + p(n(o).distance(n(fe)(e.observation.self.position, v.position))), 9, Ii))), 128))], 8, Si), [[Pe, i.value]]),
        y("label", null, [le(p(n(o).washAmount), 1), de(y("input", {
          "onUpdate:modelValue": u[1] || (u[1] = (v) => s.value = v),
          type: "number",
          min: n(ze).minimumWashMl,
          max: Math.min(1e4, Math.floor(d.value.available)),
          disabled: e.disabled
        }, null, 8, Ei), [[
          Ae,
          s.value,
          void 0,
          { number: !0 }
        ]])]),
        y("button", { disabled: e.disabled || f(d.value.position) && (!Number.isSafeInteger(s.value) || s.value < n(ze).minimumWashMl || s.value > Math.min(1e4, d.value.available)) }, p(f(d.value.position) ? n(o).wash : n(o).approach), 9, Pi),
        y("small", null, p(n(o).washNote), 1)
      ], 32)) : (g(), _("p", Ri, p(n(o).noWashWater), 1)),
      e.observation.waste.length ? (g(), _(T, { key: 2 }, [y("h3", null, p(n(o).groundTraces), 1), (g(!0), _(T, null, X(e.observation.waste, (v) => (g(), _("article", {
        key: v.id,
        class: "island-item"
      }, [y("span", null, p(n(o).wasteKind[v.kind]) + " · " + p(n(o).distance(n(fe)(e.observation.self.position, v.position))), 1), v.kind !== "disturbed_ground" && n(tn)(v.position) ? (g(), _("button", {
        key: 0,
        disabled: e.disabled,
        onClick: (m) => f(v.position) ? a("work", {
          kind: "cover_waste",
          waste: v.id
        }) : a("move", v.position)
      }, p(f(v.position) ? n(o).cover : n(o).approach), 9, qi)) : I("", !0)]))), 128))], 64)) : I("", !0)
    ]));
  }
}), Bi = /* @__PURE__ */ pe(Li, [["__scopeId", "data-v-7264cf76"]]), Wi = {
  class: "island-gm-failure",
  role: "alert"
}, Di = ["disabled"], Ti = ["disabled"], Fi = /* @__PURE__ */ ue({
  __name: "GmFailure",
  props: {
    error: {},
    busy: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["retry", "settings"],
  setup(e) {
    return (l, t) => (g(), _("section", Wi, [
      y("strong", null, p(n(o).gmFailed), 1),
      y("details", null, [
        y("summary", null, p(n(o).errorDetails), 1),
        y("p", null, p(e.error), 1),
        y("p", null, p(n(o).gmFailureDetail), 1)
      ]),
      y("div", null, [y("button", {
        disabled: e.disabled,
        onClick: t[0] || (t[0] = (a) => l.$emit("retry"))
      }, p(n(o).retryGm), 9, Di), y("button", {
        disabled: e.busy,
        onClick: t[1] || (t[1] = (a) => l.$emit("settings"))
      }, p(n(o).modelSettings), 9, Ti)])
    ]));
  }
}), Ui = /* @__PURE__ */ pe(Fi, [["__scopeId", "data-v-e1a787c6"]]);
function Ni(e, l) {
  const t = [], a = [], i = (u, v) => t.push({
    label: u,
    value: v
  }), s = (u) => o.actionCoordinates(u), r = (u) => {
    const v = l.items.find((A) => A.id === u), m = v.location, h = m.kind === "ground" ? `${o.ground} · ${s(m.position)}` : `${ce[m.person].name} · ${m.kind === "worn" ? o.worn : m.kind === "covering" ? o.covering : o.carried}`;
    return o.actionItem(Y[v.kind].name, `${h}${v.food ? ` · ${o.foodCondition[v.food]}` : ""}`);
  }, d = (u) => {
    const v = l.structures.find((m) => m.id === u);
    return o.actionItem(Se[v.kind].name, s(v.position));
  }, f = (u) => {
    const v = l.resources.find((m) => m.id === u);
    return v ? o.actionItem(je[v.kind].name, s(v.position)) : d(u);
  }, k = e.operation;
  let c;
  switch (k.kind) {
    case "say":
      c = o.speak, i(o.actionWords, k.text);
      break;
    case "declare": {
      c = o.ownChoices;
      const u = k.choice;
      switch (u.kind) {
        case "residence":
          i(o.residence, s(u.position));
          break;
        case "support":
          i(o.actionTarget, `${o.stance[u.stance]} · ${ce[u.person].name}`);
          break;
        case "proposal":
          c = o.propose;
          break;
        case "response":
          c = o.commitment[u.stance], i(o.actionTarget, o.actionReference(u.proposal));
          break;
        case "relay":
          c = o.relayStatement, i(o.actionTarget, o.actionReference(u.reference));
          break;
      }
      i(o.actionWords, k.text), a.push(o.declarationNote);
      break;
    }
    case "travel":
    case "drag":
      c = k.kind === "travel" ? o.goThere : o.dragBody, i(o.actionRoute, k.route.map(s).join(" → ")), k.kind === "drag" && (i(o.actionTarget, ce[k.subject].name), a.push(o.bodyHandlingNote));
      break;
    case "rest":
      c = o.active.rest;
      break;
    case "cancel":
      c = o.pause;
      break;
    case "take":
    case "drop":
    case "wear":
    case "unwear":
      c = o[k.kind], i(o.actionTarget, r(k.item));
      break;
    case "offer":
      c = o.offer, i(o.actionTarget, `${ce[k.to].name} · ${r(k.item)} ${o.actionQuantity(k.units)}`);
      break;
    case "accept": {
      c = o.receive;
      const u = l.offers.find((v) => v.from === k.from && v.to === "player");
      i(o.actionTarget, `${ce[k.from].name} · ${Y[u.form].name} ${o.actionQuantity(u.units)}`), u.food && a.push(o.foodCondition[u.food]), u.water?.food && a.push(`${o.liquid} · ${o.foodCondition[u.water.food]}`);
      break;
    }
    case "construct":
      c = o.work, i(o.actionTarget, d(k.site));
      break;
    case "work": {
      const u = k.task;
      if (c = Ua[u.kind], "item" in u && i(o.actionTarget, r(u.item)), "subject" in u && i(o.remains, ce[u.subject].name), "source" in u && i(o.actionTarget, f(u.source)), "container" in u && i(o.waterContainer, r(u.container)), u.kind === "wash" && (i(o.washSupply, u.supply.kind === "container" ? r(u.supply.id) : f(u.supply.id)), a.push(o.washNote)), u.kind === "pour" && i(o.pourFrom, r(u.from)), "millilitres" in u && i(o.actionWater, o.actionMl(u.millilitres)), "site" in u && i(o.actionPosition, d(u.site)), "materials" in u) {
        i(o.materials, u.materials.map((m) => `${r(m.item)} ${o.actionQuantity(m.units)}`).join(`
`)), a.push(o.actionMaterialsNote);
        const v = u.materials.map((m) => l.items.find((h) => h.id === m.item)).filter((m) => m.location.kind === "worn");
        v.length && a.push(o.dismantleWarning(v.map((m) => Y[m.kind].name))), u.materials.some((m) => l.items.find((h) => h.id === m.item)?.food === "off_odor") && a.push(o.spoiledCooking);
      }
      if (u.kind === "craft" && (c = Ze[u.recipe].name), u.kind === "build" && (c = Se[u.blueprint].name, i(o.actionPosition, s(l.self.position))), u.kind === "gather" && i(o.quantity, o.actionQuantity(u.units)), u.kind === "ignite" && (i(o.tools, r(u.drill)), i(o.materials, r(u.tinder))), u.kind === "relieve" && (c = u.waste === "urine" ? o.relieveUrine : o.relieveFeces, i(o.actionPosition, o.actionAtFeet), a.push(o.actionReliefNote)), u.kind === "cover_waste" && i(o.actionPosition, s(l.waste.find((v) => v.id === u.waste).position)), (u.kind === "sip" || u.kind === "drink" && l.items.find((v) => v.id === u.container)?.water?.quality === "untreated") && a.push(o.rawWaterRisk), u.kind === "drink" || u.kind === "pour" || u.kind === "boil") {
        const v = l.items.find((m) => m.id === (u.kind === "pour" ? u.from : u.container))?.water;
        v?.food && a.push(`${o.liquid} · ${o.foodCondition[v.food]}`);
      }
      u.kind === "empty" && a.push(o.emptyLiquidNote);
      break;
    }
  }
  return e.seconds !== null && i(o.actionTime, o.duration(e.seconds)), {
    title: c,
    fields: t,
    warnings: a
  };
}
var zi = { class: "island-composer" }, Oi = ["aria-label"], Gi = ["aria-pressed"], Vi = ["aria-pressed"], ji = ["aria-label"], Hi = { class: "island-item-actions" }, Yi = ["disabled"], Ki = ["disabled"], Xi = ["disabled"], Zi = [
  "maxlength",
  "placeholder",
  "aria-label",
  "disabled",
  "onKeydown"
], Qi = ["disabled"], Ji = {
  key: 1,
  class: "island-action-cost"
}, es = /* @__PURE__ */ ue({
  __name: "PlayerComposer",
  props: {
    client: {},
    disabled: { type: Boolean }
  },
  emits: ["accepted"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V("speech"), s = V(""), r = V(""), d = W({
      get: () => i.value === "speech" ? s.value : r.value,
      set: (v) => {
        i.value === "speech" ? s.value = v : r.value = v;
      }
    }), f = W(() => {
      const v = t.client.view.value?.intent;
      return i.value === "action" && v && (v.result.kind === "question" || v.text === r.value.trim()) ? v : null;
    }), k = W(() => f.value?.result.kind === "action" ? Ni(f.value.result, t.client.view.value.player) : null);
    me(() => t.client.view.value?.intent?.id, () => {
      const v = t.client.view.value?.intent;
      if (v?.result.kind === "question") {
        r.value = "", i.value = "action";
        return;
      }
      v && !r.value && (r.value = v.text, i.value = "action");
    }, { immediate: !0 });
    async function c() {
      if (t.disabled) return;
      const v = d.value.trim();
      v && (i.value === "action" ? await t.client.interpret(v) : await t.client.speak(v, () => {
        s.value.trim() === v && (s.value = "");
      }));
    }
    async function u() {
      const v = r.value.trim(), m = await t.client.acceptIntent(() => {
        r.value.trim() === v && (r.value = "");
      });
      m && a("accepted", m);
    }
    return (v, m) => (g(), _("div", zi, [
      y("div", {
        class: "island-input-mode",
        role: "group",
        "aria-label": n(o).action
      }, [y("button", {
        type: "button",
        "aria-pressed": i.value === "speech",
        onClick: m[0] || (m[0] = (h) => i.value = "speech")
      }, p(n(o).speak), 9, Gi), y("button", {
        type: "button",
        "aria-pressed": i.value === "action",
        onClick: m[1] || (m[1] = (h) => i.value = "action")
      }, p(n(o).action), 9, Vi)], 8, Oi),
      f.value ? (g(), _("section", {
        key: 0,
        class: "island-action-preview",
        "aria-live": "polite",
        "aria-label": n(o).proposedAction
      }, [k.value ? (g(), _(T, { key: 0 }, [
        y("h3", null, p(k.value.title), 1),
        y("dl", null, [(g(!0), _(T, null, X(k.value.fields, (h, A) => (g(), _(T, { key: A }, [y("dt", null, p(h.label), 1), y("dd", null, p(h.value), 1)], 64))), 128))]),
        (g(!0), _(T, null, X(k.value.warnings, (h, A) => (g(), _("p", {
          key: A,
          class: "island-action-warning"
        }, p(h), 1))), 128)),
        y("div", Hi, [y("button", {
          class: "island-primary",
          disabled: e.disabled,
          onClick: u
        }, p(n(o).confirmAction), 9, Yi), y("button", {
          disabled: e.disabled,
          onClick: m[2] || (m[2] = (h) => e.client.dismissIntent())
        }, p(n(o).dismissAction), 9, Ki)])
      ], 64)) : f.value.result.kind === "question" ? (g(), _(T, { key: 1 }, [
        y("h3", null, p(n(o).actionQuestion), 1),
        y("p", null, p(f.value.result.text), 1),
        y("button", {
          disabled: e.disabled,
          onClick: m[3] || (m[3] = (h) => e.client.dismissIntent())
        }, p(n(o).dismissAction), 9, Xi)
      ], 64)) : I("", !0)], 8, ji)) : I("", !0),
      y("form", { onSubmit: Re(c, ["prevent"]) }, [de(y("textarea", {
        "onUpdate:modelValue": m[4] || (m[4] = (h) => d.value = h),
        rows: "2",
        maxlength: n(rt).maxSpeechCharacters,
        placeholder: i.value === "speech" ? n(o).sayPlaceholder : n(o).actionPlaceholder,
        "aria-label": i.value === "speech" ? n(o).speak : n(o).action,
        disabled: e.disabled,
        onKeydown: ca(Re(c, ["ctrl", "prevent"]), ["enter"])
      }, null, 40, Zi), [[Ae, d.value]]), y("button", {
        class: "island-primary",
        disabled: e.disabled || !d.value.trim() || !!k.value
      }, p(i.value === "speech" ? n(o).send : n(o).interpretAction), 9, Qi)], 32),
      i.value === "action" && !f.value ? (g(), _("small", Ji, p(n(o).actionCost), 1)) : I("", !0)
    ]));
  }
}), ts = /* @__PURE__ */ pe(es, [["__scopeId", "data-v-2f56fa31"]]), as = "" + new URL("island-assets/cast-portraits-DCy4TZOL.jpg", import.meta.url).href, ns = "" + new URL("island-assets/ye-portrait-DcaYqBmx.png", import.meta.url).href, os = /* @__PURE__ */ ue({
  __name: "Portrait",
  props: { person: {} },
  setup(e) {
    const l = e, t = W(() => {
      if (l.person === "ye") return {
        backgroundImage: `url(${ns})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 38%"
      };
      const a = Ot[l.person].portrait;
      return {
        backgroundImage: `url(${as})`,
        backgroundPosition: `${a[0] * 50}% ${a[1] * 100}%`
      };
    });
    return (a, i) => (g(), _("span", {
      class: "island-portrait",
      "aria-hidden": "true",
      style: qt(t.value)
    }, null, 4));
  }
}), ta = /* @__PURE__ */ pe(os, [["__scopeId", "data-v-f50cd5b8"]]), is = { class: "island-agreements" }, ss = ["disabled"], rs = [
  "maxlength",
  "placeholder",
  "disabled"
], ls = { class: "island-item-actions" }, ds = ["disabled"], us = ["disabled"], cs = {
  key: 1,
  class: "island-agreement-empty"
}, vs = { class: "island-agreement-terms" }, fs = { key: 0 }, ps = ["aria-label"], ms = { class: "island-agreement-terms" }, hs = ["disabled", "onClick"], bs = { class: "island-item-actions" }, ys = ["disabled", "onClick"], ks = ["disabled", "onClick"], gs = ["disabled", "onClick"], ws = /* @__PURE__ */ ue({
  __name: "Agreements",
  props: {
    agreements: {},
    disabled: { type: Boolean }
  },
  emits: ["act"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(!1), s = V(""), r = V(null);
    me(() => t.agreements, (c) => {
      r.value !== null && c.some((u) => u.proposer === "player" && u.terms === r.value.text && u.proposal > r.value.after) && (s.value.trim() === r.value.text && (s.value = "", i.value = !1), r.value = null);
    });
    function d() {
      const c = s.value.trim();
      !c || t.disabled || (r.value = {
        text: c,
        after: Math.max(0, ...t.agreements.map((u) => u.proposal))
      }, a("act", {
        kind: "declare",
        text: c,
        choice: { kind: "proposal" }
      }));
    }
    function f(c, u) {
      a("act", {
        kind: "declare",
        text: o.respondAgreement(u === "accept"),
        choice: {
          kind: "response",
          proposal: c,
          stance: u
        }
      });
    }
    function k(c) {
      a("act", {
        kind: "declare",
        text: o.relayStatement,
        choice: {
          kind: "relay",
          reference: c
        }
      });
    }
    return (c, u) => (g(), _("section", is, [
      y("header", null, [y("h3", null, p(n(o).agreements), 1), i.value ? I("", !0) : (g(), _("button", {
        key: 0,
        disabled: e.disabled,
        onClick: u[0] || (u[0] = (v) => i.value = !0)
      }, p(n(o).propose), 9, ss))]),
      i.value ? (g(), _("form", {
        key: 0,
        onSubmit: Re(d, ["prevent"])
      }, [
        y("label", null, [le(p(n(o).proposalTerms), 1), de(y("textarea", {
          "onUpdate:modelValue": u[1] || (u[1] = (v) => s.value = v),
          rows: "4",
          maxlength: n(rt).maxSpeechCharacters,
          placeholder: n(o).proposalPlaceholder,
          disabled: e.disabled
        }, null, 8, rs), [[Ae, s.value]])]),
        y("small", null, p(n(o).agreementNote), 1),
        y("div", ls, [y("button", {
          class: "island-primary",
          disabled: e.disabled || !s.value.trim()
        }, p(n(o).propose), 9, ds), y("button", {
          type: "button",
          disabled: e.disabled,
          onClick: u[2] || (u[2] = (v) => i.value = !1)
        }, p(n(o).cancel), 9, us)])
      ], 32)) : I("", !0),
      !e.agreements.length && !i.value ? (g(), _("p", cs, p(n(o).noAgreements), 1)) : I("", !0),
      (g(!0), _(T, null, X(e.agreements, (v) => (g(), _("article", {
        key: v.proposal,
        class: "island-agreement"
      }, [
        y("strong", null, p(n(o).proposalBy(v.proposer)), 1),
        y("small", null, p(n(o).time(v.learnedAt)) + " · " + p(n(o).through(v.through)), 1),
        y("p", vs, p(v.terms), 1),
        y("ul", null, [(g(!0), _(T, null, X(v.commitments, (m) => (g(), _("li", { key: m.actor }, [
          y("span", null, p(n(ce)[m.actor].name), 1),
          y("span", { class: De(m.stance) }, p(n(o).commitment[m.stance]), 3),
          m.reference !== v.proposal ? (g(), _("details", fs, [
            y("summary", { "aria-label": `${n(ce)[m.actor].name} · ${n(o).look}` }, p(n(o).look), 9, ps),
            y("small", null, p(n(o).time(m.learnedAt)) + " · " + p(n(o).through(m.through)), 1),
            y("p", ms, p(m.text), 1),
            y("button", {
              disabled: e.disabled,
              onClick: (h) => k(m.reference)
            }, p(n(o).relayResponse), 9, hs)
          ])) : I("", !0)
        ]))), 128))]),
        y("div", bs, [
          v.commitments.some((m) => m.actor === "player" && m.stance === "accept") ? I("", !0) : (g(), _("button", {
            key: 0,
            disabled: e.disabled,
            onClick: (m) => f(v.proposal, "accept")
          }, p(n(o).accept), 9, ys)),
          v.commitments.some((m) => m.actor === "player" && m.stance === "decline") ? I("", !0) : (g(), _("button", {
            key: 1,
            disabled: e.disabled,
            onClick: (m) => f(v.proposal, "decline")
          }, p(v.commitments.some((m) => m.actor === "player" && m.stance === "accept") ? n(o).withdraw : n(o).decline), 9, ks)),
          y("button", {
            disabled: e.disabled,
            onClick: (m) => k(v.proposal)
          }, p(n(o).relayTerms), 9, gs)
        ])
      ]))), 128))
    ]));
  }
}), _s = /* @__PURE__ */ pe(ws, [["__scopeId", "data-v-75cf5307"]]);
function xs(e) {
  return !!(Y[e].materials.cover || Y[e].materials.fabric);
}
var Ms = { class: "island-remains" }, $s = ["disabled"], Cs = ["disabled"], As = ["value"], Ss = ["disabled"], Is = { key: 1 }, Es = /* @__PURE__ */ ue({
  __name: "Remains",
  props: {
    observation: {},
    subject: {},
    disabled: { type: Boolean }
  },
  emits: ["act", "drag"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = V(""), s = W(() => t.observation.items.filter((f) => xs(f.kind) && (f.location.kind === "carried" ? f.location.person === "player" : f.location.kind === "ground" && Ie(f.location.position, t.observation.self.position)))), r = W(() => t.observation.people.some((f) => f.id === t.subject && Ie(f.position, t.observation.self.position))), d = W(() => t.disabled || !!t.observation.self.activity || !r.value);
    return me(s, (f) => {
      f.some((k) => k.id === i.value) || (i.value = f[0]?.id ?? "");
    }, { immediate: !0 }), (f, k) => (g(), _("section", Ms, [
      y("button", {
        disabled: d.value,
        onClick: k[0] || (k[0] = (c) => a("drag", e.subject))
      }, p(n(o).dragBody), 9, $s),
      y("p", null, p(n(o).bodyHandlingNote), 1),
      s.value.length ? (g(), _("form", {
        key: 0,
        onSubmit: k[2] || (k[2] = Re((c) => a("act", {
          kind: "work",
          task: {
            kind: "cover_body",
            subject: e.subject,
            item: i.value
          }
        }), ["prevent"]))
      }, [y("label", null, [le(p(n(o).coverMaterial), 1), de(y("select", {
        "onUpdate:modelValue": k[1] || (k[1] = (c) => i.value = c),
        disabled: d.value
      }, [(g(!0), _(T, null, X(s.value, (c) => (g(), _("option", {
        key: c.id,
        value: c.id
      }, p(n(Y)[c.kind].name) + " × " + p(c.quantity), 9, As))), 128))], 8, Cs), [[Pe, i.value]])]), y("button", { disabled: d.value || !i.value }, p(n(o).coverBody), 9, Ss)], 32)) : (g(), _("p", Is, p(n(o).noCoverMaterial), 1))
    ]));
  }
}), Ps = /* @__PURE__ */ pe(Es, [["__scopeId", "data-v-f2019aa8"]]), Rs = { class: "island-social" }, qs = { class: "island-item" }, Ls = { class: "island-item-actions" }, Bs = ["disabled"], Ws = ["disabled"], Ds = { class: "island-person-tabs" }, Ts = ["aria-pressed", "onClick"], Fs = {
  key: 0,
  class: "island-item"
}, Us = { class: "island-person-profile" }, Ns = { class: "island-item-actions" }, zs = ["disabled"], Os = ["disabled", "onClick"], Gs = { key: 2 }, Vs = { key: 3 }, js = /* @__PURE__ */ ue({
  __name: "People",
  props: {
    observation: {},
    selected: {},
    disabled: { type: Boolean }
  },
  emits: [
    "act",
    "move",
    "select",
    "drag"
  ],
  setup(e, { emit: l }) {
    const t = e, a = l, i = W(() => t.observation.declarations.find((k) => k.payload.kind === "declaration" && k.payload.actor === "player" && k.payload.choice.kind === "residence")), s = W(() => i.value?.payload.kind === "declaration" && i.value.payload.choice.kind === "residence" ? i.value.payload.choice.position : null), r = W(() => t.observation.people.find((k) => k.id === t.selected));
    function d(k) {
      t.selected && a("act", {
        kind: "declare",
        text: o.declaration(t.selected, k),
        choice: {
          kind: "support",
          person: t.selected,
          stance: k
        }
      });
    }
    function f() {
      if (!r.value) return;
      const k = t.observation.self.position, c = r.value.position, u = fe(k, c);
      if (Ie(k, c)) return;
      const v = (u - rt.reachMetres * 0.8) / u;
      a("move", {
        x: k.x + (c.x - k.x) * v,
        y: k.y + (c.y - k.y) * v
      });
    }
    return (k, c) => (g(), _("section", Rs, [
      y("h3", null, p(n(o).ownChoices), 1),
      y("div", qs, [
        y("strong", null, p(n(o).residence), 1),
        y("p", null, p(s.value ? n(o).distance(n(fe)(e.observation.self.position, s.value)) : n(o).noResidence), 1),
        y("div", Ls, [y("button", {
          disabled: e.disabled,
          onClick: c[0] || (c[0] = (u) => a("act", {
            kind: "declare",
            text: n(o).declareResidence,
            choice: {
              kind: "residence",
              position: e.observation.self.position
            }
          }))
        }, p(n(o).settleHere), 9, Bs), s.value ? (g(), _("button", {
          key: 0,
          disabled: e.disabled || !!e.observation.self.activity,
          onClick: c[1] || (c[1] = (u) => a("move", s.value))
        }, p(n(o).returnHome), 9, Ws)) : I("", !0)])
      ]),
      y("h3", null, p(n(o).visiblePeople), 1),
      y("nav", Ds, [(g(!0), _(T, null, X(e.observation.people, (u) => (g(), _("button", {
        key: u.id,
        "aria-pressed": e.selected === u.id,
        onClick: (v) => a("select", u.id)
      }, p(n(ce)[u.id].name), 9, Ts))), 128))]),
      r.value ? (g(), _("article", Fs, [y("div", Us, [Ce(ta, { person: r.value.id }, null, 8, ["person"]), y("div", null, [y("strong", null, p(n(ce)[r.value.id].name), 1), y("p", null, p(r.value.body.kind === "dead" ? n(o).remains : r.value.activity ? n(o).active[r.value.activity] : n(o).idle) + " · " + p(n(o).distance(n(fe)(e.observation.self.position, r.value.position))), 1)])]), y("div", Ns, [n(Ie)(e.observation.self.position, r.value.position) ? I("", !0) : (g(), _("button", {
        key: 0,
        disabled: e.disabled || !!e.observation.self.activity,
        onClick: f
      }, p(n(o).approach), 9, zs)), r.value.body.kind === "living" ? (g(), _(T, { key: 1 }, X([
        "with",
        "neutral",
        "against"
      ], (u) => y("button", {
        key: u,
        disabled: e.disabled,
        onClick: (v) => d(u)
      }, p(n(o).stance[u]), 9, Os)), 64)) : I("", !0)])])) : I("", !0),
      r.value?.body.kind === "dead" ? (g(), $e(Ps, {
        key: 1,
        observation: e.observation,
        subject: r.value.id,
        disabled: e.disabled,
        onAct: c[2] || (c[2] = (u) => a("act", u)),
        onDrag: c[3] || (c[3] = (u) => a("drag", u))
      }, null, 8, [
        "observation",
        "subject",
        "disabled"
      ])) : I("", !0),
      r.value?.body.kind !== "dead" ? (g(), _("small", Gs, p(n(o).declarationNote), 1)) : I("", !0),
      Ce(_s, {
        agreements: e.observation.agreements,
        disabled: e.disabled,
        onAct: c[4] || (c[4] = (u) => a("act", u))
      }, null, 8, ["agreements", "disabled"]),
      y("h3", null, p(n(o).knownChoices), 1),
      e.observation.declarations.length ? I("", !0) : (g(), _("p", Vs, p(n(o).noChoices), 1)),
      (g(!0), _(T, null, X(e.observation.declarations, (u) => (g(), _("article", {
        key: u.sequence,
        class: "island-log"
      }, [u.payload.kind === "declaration" ? (g(), _(T, { key: 0 }, [y("small", null, p(n(ce)[u.payload.actor].name) + " · " + p(n(o).time(u.at)), 1), y("p", null, p(u.payload.text), 1)], 64)) : I("", !0)]))), 128))
    ]));
  }
}), Hs = /* @__PURE__ */ pe(js, [["__scopeId", "data-v-c0b30239"]]), Ys = { class: "island-history-controls" }, Ks = ["disabled"], Xs = { key: 0 }, Zs = ["disabled"], Qs = /* @__PURE__ */ ue({
  __name: "Journal",
  props: {
    journey: {},
    recent: {},
    load: { type: Function }
  },
  setup(e) {
    const l = e, t = V(null), a = V(!1);
    me(() => l.journey, () => {
      t.value = null;
    });
    async function i(s) {
      if (!a.value) {
        a.value = !0;
        try {
          const r = await l.load(s);
          r && (t.value = r);
        } finally {
          a.value = !1;
        }
      }
    }
    return (s, r) => (g(), _(T, null, [
      y("div", Ys, [y("button", {
        disabled: a.value,
        onClick: r[0] || (r[0] = (d) => i(0))
      }, p(n(o).earlier), 9, Ks), t.value ? (g(), _("button", {
        key: 0,
        onClick: r[1] || (r[1] = (d) => t.value = null)
      }, p(n(o).recent), 1)) : I("", !0)]),
      (g(!0), _(T, null, X(t.value?.entries ?? e.recent, (d) => (g(), _("article", {
        key: d.sequence,
        class: "island-log"
      }, [y("small", null, p(n(o).time(d.at)), 1), y("p", null, p(n(Nt)(d.payload, d.shared)), 1)]))), 128)),
      t.value && !t.value.entries.length ? (g(), _("p", Xs, p(n(o).historyEmpty), 1)) : I("", !0),
      t.value?.next ? (g(), _("button", {
        key: 1,
        disabled: a.value,
        onClick: r[2] || (r[2] = (d) => i(t.value.next))
      }, p(n(o).nextPage), 9, Zs)) : I("", !0)
    ], 64));
  }
}), Js = Qs, er = { class: "island-known-note" }, tr = { key: 0 }, ar = { class: "island-item-actions" }, nr = ["disabled", "onClick"], or = /* @__PURE__ */ ue({
  __name: "KnownPlaces",
  props: {
    observation: {},
    disabled: { type: Boolean }
  },
  emits: ["move"],
  setup(e, { emit: l }) {
    const t = e, a = l, i = W(() => [...t.observation.knownPlaces].sort((s, r) => fe(t.observation.self.position, s.position) - fe(t.observation.self.position, r.position)));
    return (s, r) => (g(), _(T, null, [
      y("p", er, p(n(o).knownPlacesNote), 1),
      i.value.length ? I("", !0) : (g(), _("p", tr, p(n(o).noKnownPlaces), 1)),
      (g(!0), _(T, null, X(i.value, (d) => (g(), _("article", {
        key: `${d.subject.kind}:${d.subject.id}`,
        class: "island-item"
      }, [y("div", null, [y("strong", null, p(d.subject.kind === "resource" ? n(je)[d.subject.form].name : n(Se)[d.subject.form].name), 1), y("small", null, p(n(o).distance(n(fe)(e.observation.self.position, d.position))) + " · " + p(n(o).firstObserved) + " " + p(n(o).time(d.observedAt)), 1)]), y("div", ar, [y("button", {
        disabled: e.disabled,
        onClick: (f) => a("move", d.position)
      }, p(n(o).goThere), 9, nr)])]))), 128))
    ], 64));
  }
}), ir = /* @__PURE__ */ pe(or, [["__scopeId", "data-v-cd31d745"]]);
function sr(e) {
  const l = o.feeling;
  return [
    {
      key: "thirst",
      ratio: e.waterDeficit / be.lethalWaterDeficit,
      feeling: e.waterDeficit < be.thirstSignal ? l.thirst[0] : e.waterDeficit < be.lethalWaterDeficit / 2 ? l.thirst[1] : l.thirst[2]
    },
    {
      key: "hunger",
      ratio: 1 - e.energy / be.maxEnergy,
      feeling: e.energy > be.hungerSignal ? l.hunger[0] : e.energy > 0 ? l.hunger[1] : l.hunger[2]
    },
    {
      key: "fatigue",
      ratio: e.fatigue / 100,
      feeling: e.fatigue < be.fatigueSignal / 2 ? l.fatigue[0] : e.fatigue < be.fatigueSignal ? l.fatigue[1] : l.fatigue[2]
    },
    {
      key: "bladder",
      ratio: e.bladder / be.bladderLimit,
      feeling: e.bladder < be.bladderSignal ? l.relief[0] : l.relief[1]
    },
    {
      key: "bowel",
      ratio: e.bowel / be.bowelLimit,
      feeling: e.bowel < be.bowelSignal ? l.relief[0] : l.relief[1]
    },
    {
      key: "wound",
      ratio: e.footWound,
      feeling: e.footWound === 0 ? l.foot[0] : l.foot[1]
    },
    {
      key: "hygiene",
      ratio: 1 - e.soiling,
      feeling: e.soiling < 0.3 ? l.clean[0] : l.clean[1]
    }
  ].map((t) => ({
    ...t,
    percent: Math.round(Math.min(1, Math.max(0, t.ratio)) * 100)
  }));
}
function rr(e) {
  const l = [];
  for (const t of e) {
    if (t.payload.kind === "started") continue;
    const a = l.at(-1), i = a?.event.payload, s = t.payload;
    a && i?.kind === "worked" && s.kind === "worked" && i.task === "gather" && s.task === "gather" && i.actor === s.actor && i.target === s.target ? a.repetitions++ : l.push({
      event: t,
      repetitions: 1
    });
  }
  return l;
}
var lr = { class: "island-title-content" }, dr = ["disabled"], ur = { class: "island-world" }, cr = {
  key: 1,
  class: "island-render-error",
  role: "alert"
}, vr = { class: "island-hud" }, fr = {
  key: 2,
  class: "island-vitals"
}, pr = ["aria-label"], mr = [
  "value",
  "aria-label",
  "aria-valuetext"
], hr = {
  key: 3,
  class: "island-drag-choice",
  role: "status"
}, br = {
  key: 4,
  class: "island-nearby"
}, yr = ["aria-pressed", "onClick"], kr = {
  key: 0,
  class: "island-resource"
}, gr = {
  key: 0,
  role: "status"
}, wr = { key: 1 }, _r = { key: 2 }, xr = ["max", "aria-label"], Mr = ["aria-label"], $r = ["value"], Cr = ["max", "aria-label"], Ar = ["disabled"], Sr = ["disabled"], Ir = { class: "island-bottom" }, Er = { class: "island-clock-action" }, Pr = ["disabled"], Rr = ["disabled"], qr = ["aria-pressed", "onClick"], Lr = { class: "island-conversation" }, Br = ["disabled"], Wr = { key: 0 }, Dr = {
  key: 0,
  class: "island-opening"
}, Tr = {
  key: 0,
  class: "island-thinking",
  role: "status"
}, Fr = ["aria-label"], Ur = { class: "island-panel-body" }, Nr = { class: "island-needs" }, zr = [
  "value",
  "aria-label",
  "aria-valuetext"
], Or = {
  key: 0,
  class: "island-body-feeling"
}, Gr = { class: "island-body-actions" }, Vr = ["disabled"], jr = ["disabled"], Hr = ["disabled"], Yr = ["aria-label"], Kr = ["disabled"], Xr = {
  key: 2,
  class: "island-notice",
  role: "alert"
}, Zr = ["disabled"], Qr = /* @__PURE__ */ ue({
  __name: "IslandRoom",
  props: {
    bridge: {},
    chatIdentity: {},
    generationActive: { type: Boolean }
  },
  setup(e) {
    const l = e, t = Ha(l.bridge, l.chatIdentity), { view: a, busy: i, error: s, blocked: r } = t, d = V(null), f = V(!1), k = V(!1), c = V(!1), u = V(null), v = V(null), m = V(null), h = V(null), A = V(null), M = V(250), $ = V(1), b = V(""), C = V(null), w = W(() => a.value?.player ?? null), x = W(() => w.value?.self), P = W(() => x.value?.body.kind === "living" ? x.value.body.needs : null), S = W(() => r.value || l.generationActive || a.value?.phase !== "living"), G = W(() => !!s.value && t.failedRequest.value === "think" && !a.value?.pending && !a.value?.memoryPending && !t.uncertain.value), L = (O) => !!x.value && Ie(x.value.position, O), ee = W(() => w.value?.items.filter((O) => O.location.kind === "ground" ? L(O.location.position) : O.location.person === "player") ?? []), z = W(() => ee.value.filter((O) => O.water !== null)), D = W(() => w.value?.resources.find((O) => O.id === A.value)), K = W(() => {
      const O = z.value.find((B) => B.id === b.value);
      return O ? Math.floor(Math.min(D.value?.stock ?? 0, Y[O.kind].capacity - O.water.millilitres)) : 0;
    }), R = W(() => Number.isSafeInteger(M.value) && M.value > 0), Q = W(() => !!D.value && !!w.value && nn(D.value.kind, w.value.weather.tide)), F = W(() => Q.value && Number.isSafeInteger($.value) && $.value > 0 && $.value <= Math.floor(D.value?.stock ?? 0)), U = W(() => x.value?.activity), H = W(() => !!w.value && an({ structures: Object.fromEntries(w.value.structures.map((O) => [O.id, O])) }, w.value.self.position)), re = W(() => P.value ? sr(P.value) : []), ae = W(() => re.value.filter((O) => O.key === "thirst" || O.key === "fatigue")), N = W(() => ee.value.some((O) => O.location.kind === "worn" && O.wetness > 0.25)), te = W(() => rr(a.value?.recent ?? []).slice(-12));
    va(() => f.value ? (f.value = !1, !0) : !1), kt(u, () => {
      d.value = null;
    }), kt(v, () => {
      c.value ? c.value = !1 : f.value = !1;
    }), me(() => a.value?.recent.at(-1)?.sequence, async () => {
      const O = m.value, B = !O || O.scrollHeight - O.scrollTop - O.clientHeight < 70;
      await la(), B && m.value && (m.value.scrollTop = m.value.scrollHeight);
    }), Rt(() => {
      t.read();
    }), Pt(t.dispose);
    async function j() {
      f.value = !0, a.value?.phase === "unstarted" && await t.start("start");
    }
    async function ne(O) {
      ja(O) && await t.advance(3600);
    }
    async function Z(O) {
      await t.act(O) && await ne(O);
    }
    function qe(O) {
      return Z({
        kind: "work",
        task: O
      });
    }
    function Le(O) {
      if (U.value) return;
      const B = C.value ? {
        kind: "drag",
        subject: C.value,
        route: [O]
      } : {
        kind: "travel",
        route: [O]
      };
      C.value = null, Z(B);
    }
    function aa(O) {
      d.value = null, C.value = O;
    }
    me(d, (O) => {
      O && (C.value = null);
    });
    function na(O) {
      h.value = O, d.value = "people";
    }
    async function oa() {
      await t.start("restart") && (c.value = !1, f.value = !0, d.value = null, C.value = null);
    }
    function ia(O) {
      A.value = O, $.value = 1, b.value = z.value[0]?.id ?? "";
    }
    function sa() {
      if (D.value) {
        if (!L(D.value.position)) {
          Le(D.value.position);
          return;
        }
        D.value.kind === "seep" ? qe({
          kind: "fill",
          source: D.value.id,
          container: b.value,
          millilitres: M.value
        }) : qe({
          kind: "gather",
          source: D.value.id,
          units: $.value
        });
      }
    }
    return (O, B) => (g(), _("section", { class: De(["island-room", { "island-reviewing-action": !!n(a)?.intent }]) }, [!f.value || !w.value ? (g(), _("div", {
      key: 0,
      class: "island-title",
      style: qt({ backgroundImage: `url(${n(Oa)})` })
    }, [y("div", lr, [
      y("h1", null, p(n(o).name), 1),
      y("p", null, p(n(o).opening), 1),
      y("button", {
        class: "island-primary",
        disabled: n(i) || !n(a),
        onClick: j
      }, p(n(a)?.phase === "unstarted" ? n(o).start : n(o).resume), 9, dr)
    ])], 4)) : (g(), _(T, { key: 1 }, [
      y("main", ur, [
        k.value ? (g(), _("div", cr, [y("p", null, p(n(o).renderError), 1), y("button", { onClick: B[1] || (B[1] = (E) => k.value = !1) }, p(n(o).reloadScene), 1)])) : (g(), $e(Qn, {
          key: 0,
          observation: w.value,
          disabled: S.value || !!U.value || !!d.value,
          onMove: Le,
          onPerson: na,
          onError: B[0] || (B[0] = (E) => k.value = !0)
        }, null, 8, ["observation", "disabled"])),
        y("header", vr, [
          y("div", null, [y("strong", null, p(n(o).terrain[n(et)(w.value.self.position)]), 1), y("span", null, p(n(o).time(w.value.clock)), 1)]),
          y("span", null, p(w.value.weather.rain ? n(o).storm : w.value.weather.daylight ? n(o).clear : n(o).night) + " · " + p(w.value.weather.temperature) + "°", 1),
          y("button", { onClick: B[2] || (B[2] = (E) => f.value = !1) }, p(n(o).back), 1)
        ]),
        P.value ? (g(), _("div", fr, [(g(!0), _(T, null, X(ae.value, (E) => (g(), _("button", {
          key: E.key,
          "aria-label": `${n(o)[E.key]} · ${E.feeling}`,
          onClick: B[3] || (B[3] = (Ye) => d.value = "body")
        }, [y("span", null, p(n(o)[E.key]), 1), y("meter", {
          min: "0",
          max: "100",
          value: E.percent,
          "aria-label": n(o)[E.key],
          "aria-valuetext": E.feeling
        }, null, 8, mr)], 8, pr))), 128))])) : I("", !0),
        C.value ? (g(), _("div", hr, [y("span", null, p(n(o).dragDestination(C.value)), 1), y("button", { onClick: B[4] || (B[4] = (E) => C.value = null) }, p(n(o).cancel), 1)])) : (g(), _("aside", br, [
          y("header", null, [y("h2", null, p(n(o).nearby), 1), y("button", { onClick: B[5] || (B[5] = (E) => d.value = "places") }, p(n(o).places), 1)]),
          (g(!0), _(T, null, X(w.value.resources, (E) => (g(), _("button", {
            key: E.id,
            "aria-pressed": A.value === E.id,
            onClick: (Ye) => ia(E.id)
          }, [le(p(n(je)[E.kind].name), 1), y("small", null, p(n(o).distance(n(fe)(x.value.position, E.position))), 1)], 8, yr))), 128)),
          D.value ? (g(), _("div", kr, [
            D.value.kind === "reef_food" ? (g(), _("small", gr, p(Q.value ? n(o).poolExposed : n(o).poolFlooded), 1)) : I("", !0),
            D.value.kind !== "seep" && D.value.stock < 1 ? (g(), _("small", wr, p(n(o).sourceDepleted), 1)) : I("", !0),
            D.value.kind !== "seep" && D.value.stock >= 1 && Q.value && L(D.value.position) ? (g(), _("label", _r, [
              le(p(n(o).quantity), 1),
              de(y("input", {
                "onUpdate:modelValue": B[6] || (B[6] = (E) => $.value = E),
                type: "number",
                min: "1",
                max: Math.floor(D.value.stock),
                "aria-label": n(o).quantity
              }, null, 8, xr), [[
                Ae,
                $.value,
                void 0,
                { number: !0 }
              ]]),
              y("small", null, p(n(o).gatherAvailable(Math.floor(D.value.stock))) + " · " + p(n(o).duration(n(je)[D.value.kind].seconds * (F.value ? $.value : 1))), 1)
            ])) : I("", !0),
            D.value.kind === "seep" && L(D.value.position) ? (g(), _(T, { key: 3 }, [
              z.value.length ? de((g(), _("select", {
                key: 0,
                "onUpdate:modelValue": B[7] || (B[7] = (E) => b.value = E),
                "aria-label": n(o).waterContainer
              }, [(g(!0), _(T, null, X(z.value, (E) => (g(), _("option", {
                key: E.id,
                value: E.id
              }, p(n(Y)[E.kind].name), 9, $r))), 128))], 8, Mr)), [[Pe, b.value]]) : I("", !0),
              de(y("input", {
                "onUpdate:modelValue": B[8] || (B[8] = (E) => M.value = E),
                type: "number",
                min: "1",
                max: Math.min(n(be).maxSipMl, Math.floor(D.value.stock)),
                "aria-label": n(o).ml
              }, null, 8, Cr), [[
                Ae,
                M.value,
                void 0,
                { number: !0 }
              ]]),
              y("button", {
                disabled: S.value || !!U.value || !R.value || M.value > Math.min(n(be).maxSipMl, D.value.stock),
                onClick: B[9] || (B[9] = (E) => qe({
                  kind: "sip",
                  source: D.value.id,
                  millilitres: M.value
                }))
              }, p(n(o).sip), 9, Ar),
              y("small", null, p(n(o).rawWaterRisk), 1)
            ], 64)) : I("", !0),
            D.value.kind !== "seep" || !L(D.value.position) || z.value.length ? (g(), _("button", {
              key: 4,
              class: "island-primary",
              disabled: S.value || !!U.value || L(D.value.position) && (D.value.kind === "seep" ? !b.value || !R.value || M.value > K.value : !F.value),
              onClick: sa
            }, p(L(D.value.position) ? D.value.kind === "seep" ? n(o).fill : n(o).gather : n(o).approach), 9, Sr)) : I("", !0)
          ])) : I("", !0)
        ])),
        y("div", Ir, [y("div", Er, [
          y("span", null, p(U.value ? n(a).step === "contact" ? n(o).contactPause : n(o).active[U.value.kind] : n(o).waiting), 1),
          U.value ? (g(), _("button", {
            key: 0,
            disabled: S.value,
            onClick: B[10] || (B[10] = (E) => n(t).act({ kind: "cancel" }))
          }, p(n(o).pause), 9, Pr)) : I("", !0),
          y("button", {
            class: "island-primary",
            disabled: S.value,
            onClick: B[11] || (B[11] = (E) => n(t).advance(U.value ? 3600 : 60))
          }, p(U.value ? n(o).continue : n(o).wait), 9, Rr)
        ]), y("nav", null, [(g(), _(T, null, X([
          "inventory",
          "craft",
          "build",
          "body",
          "journal"
        ], (E) => y("button", {
          key: E,
          "aria-pressed": d.value === E,
          onClick: (Ye) => d.value = d.value === E ? null : E
        }, p(n(o)[E]), 9, qr)), 64))])])
      ]),
      y("section", Lr, [
        y("header", null, [
          y("div", null, [y("strong", null, p(n(a).scene ? n(o)[n(a).scene] : n(o).dead), 1), y("small", null, p(w.value.people.length ? `${n(o).inSight} · ${w.value.people.map((E) => n(ce)[E.id].name + (E.body.kind === "dead" ? ` · ${n(o).remains}` : "")).join("、")}` : n(o).nobody), 1)]),
          y("button", { onClick: B[12] || (B[12] = (E) => d.value = "people") }, p(n(o).people), 1),
          y("button", {
            disabled: S.value || n(a).scene === "alone" && !n(a).needsDecision,
            onClick: B[13] || (B[13] = (E) => n(t).think())
          }, p(n(o).continue), 9, Br)
        ]),
        y("div", {
          ref_key: "transcript",
          ref: m,
          class: "island-transcript",
          "aria-live": "polite"
        }, [(g(!0), _(T, null, X(te.value, ({ event: E, repetitions: Ye }) => (g(), _("article", {
          key: E.sequence,
          class: De({
            speech: E.payload.kind === "speech" || E.payload.kind === "declaration",
            mine: "actor" in E.payload && E.payload.actor === "player"
          })
        }, [E.payload.kind === "speech" || E.payload.kind === "declaration" ? (g(), _(T, { key: 0 }, [E.payload.actor !== "player" ? (g(), $e(ta, {
          key: 0,
          person: E.payload.actor
        }, null, 8, ["person"])) : I("", !0), y("strong", null, p(n(ce)[E.payload.actor].name), 1)], 64)) : I("", !0), y("p", null, [le(p(n(Nt)(E.payload, E.shared)), 1), Ye > 1 ? (g(), _("small", Wr, p(n(o).repeated(Ye)), 1)) : I("", !0)])], 2))), 128)), te.value.length ? I("", !0) : (g(), _("p", Dr, p(n(o).opening), 1))], 512),
        Ce(ea, {
          offers: w.value.offers,
          disabled: S.value,
          onAccept: B[14] || (B[14] = (E) => Z({
            kind: "accept",
            from: E
          }))
        }, null, 8, ["offers", "disabled"]),
        n(a).thinking ? (g(), _("div", Tr, [y("span", null, p(n(a).interpreting ? n(o).interpreting : n(o).thinking), 1), y("button", { onClick: B[15] || (B[15] = (E) => n(t).cancel()) }, p(n(o).stopGm), 1)])) : I("", !0),
        G.value ? (g(), $e(Ui, {
          key: 1,
          error: n(s),
          busy: n(i),
          disabled: S.value,
          onRetry: B[16] || (B[16] = (E) => n(t).think()),
          onSettings: B[17] || (B[17] = (E) => n(t).settings())
        }, null, 8, [
          "error",
          "busy",
          "disabled"
        ])) : I("", !0),
        Ce(ts, {
          client: n(t),
          disabled: S.value,
          onAccepted: ne
        }, null, 8, ["client", "disabled"])
      ]),
      d.value ? (g(), _("section", {
        key: 0,
        ref_key: "panelRoot",
        ref: u,
        class: "island-panel",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": n(o)[d.value],
        tabindex: "-1"
      }, [y("header", null, [y("h2", null, p(n(o)[d.value]), 1), y("button", { onClick: B[18] || (B[18] = (E) => d.value = null) }, p(n(o).close), 1)]), y("div", Ur, [
        d.value === "inventory" ? (g(), $e(Ci, {
          key: 0,
          observation: w.value,
          disabled: S.value,
          onAct: Z,
          onMove: Le
        }, null, 8, ["observation", "disabled"])) : I("", !0),
        d.value === "craft" || d.value === "build" ? (g(), $e(mo, {
          key: 1,
          mode: d.value,
          items: ee.value,
          "has-fire": H.value,
          disabled: S.value || !!U.value,
          onWork: qe
        }, null, 8, [
          "mode",
          "items",
          "has-fire",
          "disabled"
        ])) : I("", !0),
        d.value === "build" ? (g(), $e(To, {
          key: 2,
          sites: w.value.structures,
          items: ee.value,
          position: x.value.position,
          disabled: S.value || !!U.value,
          onAct: Z,
          onMove: Le
        }, null, 8, [
          "sites",
          "items",
          "position",
          "disabled"
        ])) : I("", !0),
        d.value === "people" ? (g(), $e(Hs, {
          key: 3,
          observation: w.value,
          selected: h.value,
          disabled: S.value,
          onAct: Z,
          onMove: B[19] || (B[19] = (E) => {
            d.value = null, Le(E);
          }),
          onSelect: B[20] || (B[20] = (E) => h.value = E),
          onDrag: aa
        }, null, 8, [
          "observation",
          "selected",
          "disabled"
        ])) : I("", !0),
        d.value === "places" ? (g(), $e(ir, {
          key: 4,
          observation: w.value,
          disabled: S.value || !!U.value,
          onMove: B[21] || (B[21] = (E) => {
            d.value = null, Le(E);
          })
        }, null, 8, ["observation", "disabled"])) : I("", !0),
        d.value === "body" && P.value ? (g(), _(T, { key: 5 }, [
          y("dl", Nr, [(g(!0), _(T, null, X(re.value, (E) => (g(), _(T, { key: E.key }, [y("dt", null, p(n(o)[E.key]), 1), y("dd", null, [y("span", null, p(E.feeling), 1), y("meter", {
            min: "0",
            max: "100",
            value: E.percent,
            "aria-label": n(o)[E.key],
            "aria-valuetext": E.feeling
          }, null, 8, zr)])], 64))), 128))]),
          N.value ? (g(), _("p", Or, p(n(o).wetClothing), 1)) : I("", !0),
          y("div", Gr, [
            y("button", {
              disabled: S.value || !!U.value || P.value.bladder < 1,
              onClick: B[22] || (B[22] = (E) => qe({
                kind: "relieve",
                waste: "urine"
              }))
            }, p(n(o).relieveUrine), 9, Vr),
            y("button", {
              disabled: S.value || !!U.value || P.value.bowel < 1,
              onClick: B[23] || (B[23] = (E) => qe({
                kind: "relieve",
                waste: "feces"
              }))
            }, p(n(o).relieveFeces), 9, jr),
            y("button", {
              disabled: S.value || !!U.value,
              onClick: B[24] || (B[24] = (E) => Z({
                kind: "rest",
                seconds: 600
              }))
            }, p(n(o).rest), 9, Hr)
          ]),
          Ce(Bi, {
            observation: w.value,
            disabled: S.value || !!U.value,
            onWork: qe,
            onMove: B[25] || (B[25] = (E) => {
              d.value = null, Le(E);
            })
          }, null, 8, ["observation", "disabled"])
        ], 64)) : I("", !0),
        d.value === "journal" ? (g(), _(T, { key: 6 }, [Ce(Js, {
          journey: n(a).journey,
          recent: n(a).recent,
          load: n(t).history
        }, null, 8, [
          "journey",
          "recent",
          "load"
        ]), y("button", { onClick: B[26] || (B[26] = (E) => c.value = !0) }, p(n(o).restart), 1)], 64)) : I("", !0)
      ])], 8, Fr)) : I("", !0),
      n(a).phase === "ended" || c.value ? (g(), _("div", {
        key: 1,
        ref_key: "endingRoot",
        ref: v,
        class: "island-ending",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": c.value ? n(o).restart : n(o).dead,
        tabindex: "-1"
      }, [y("div", null, [
        y("h2", null, p(c.value ? n(o).restart : n(o).dead), 1),
        y("p", null, p(c.value ? n(o).restartWarning : n(o).deadDetail), 1),
        y("button", {
          class: "island-primary",
          disabled: n(i),
          onClick: oa
        }, p(c.value ? n(o).yes : n(o).restart), 9, Kr),
        c.value ? (g(), _("button", {
          key: 0,
          onClick: B[27] || (B[27] = (E) => c.value = !1)
        }, p(n(o).cancel), 1)) : I("", !0)
      ])], 8, Yr)) : I("", !0)
    ], 64)), !G.value && (n(s) || n(a)?.pending || n(a)?.memoryPending || n(t).uncertain.value) ? (g(), _("div", Xr, [y("span", null, p(n(s) || n(o).recover), 1), y("button", {
      disabled: n(i),
      onClick: B[28] || (B[28] = (E) => n(a)?.pending || n(a)?.memoryPending ? n(t).recover() : n(t).read())
    }, p(n(a)?.pending || n(a)?.memoryPending ? n(o).recover : n(o).retry), 9, Zr)])) : I("", !0)], 2));
  }
}), sl = Qr;
export {
  sl as default
};
