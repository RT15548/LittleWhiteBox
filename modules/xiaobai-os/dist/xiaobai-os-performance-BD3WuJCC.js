/* eslint-disable */
import { n as M, t as c } from "./xiaobai-os-design-Bb2ApHR1.js";
function h(t, n, o) {
  const r = t.group(n, o);
  for (const i of M) t.ball(r, [
    i.radius[0],
    i.radius[1],
    i.radius[2]
  ], c[i.color], [
    i.center[0],
    i.center[1],
    i.center[2]
  ]);
  return r;
}
function p(t, n, o) {
  for (const r of o) {
    const i = t[r.shape](n, [...r.size], r.color, [...r.at]);
    i.rotation.z = r.tilt ?? 0;
  }
}
var f = 1100;
function x(t) {
  return { walk(n, o) {
    if (!n.length) return !1;
    const r = Math.max(0, o / f), i = Math.min(n.length - 1, Math.floor(r)), a = n[Math.min(i + 1, n.length - 1)], e = n[i], s = Math.min(1, Math.max(0, (r - i - 0.16) / 0.84));
    return t.position.copy(e).lerp(a, s), t.position.y += Math.abs(Math.sin(s * Math.PI * 4)) * 0.045, t.rotation.y = Math.sign(a.x - e.x) * 0.4, i < n.length - 1;
  } };
}
function g(t) {
  return {
    pose(n, o, r, i = !1) {
      const a = i ? 0 : Math.sin(r / 520) * 0.012;
      t.position.copy(o), t.rotation.set(0, 0, 0), n === "reading" && (t.rotation.x = 0.2 + a), n === "reclining" && t.rotation.set(-0.23, -0.15, -0.14 + a), n === "sleeping" && (t.rotation.z = Math.PI / 2), n === "sipping" && (t.rotation.x = -0.08 + a), n === "looking" && (t.rotation.y = i ? 0.25 : Math.sin(r / 850) * 0.3), t.position.y += a;
    },
    reset() {
      t.rotation.set(0, 0, 0);
    }
  };
}
function y(t, n) {
  return {
    rest(o) {
      t.position.copy(n), t.rotation.y = 0, o.visible = !1;
    },
    carry(o, r, i) {
      const a = Math.max(0, (o - 0.2) / 0.8);
      i.visible = a > 0 && a < 0.92, t.position.x = n.x + a * (r - n.x), t.position.y = n.y + Math.abs(Math.sin(a * 22)) * 0.1, t.rotation.y = 0.6;
    }
  };
}
export {
  p as a,
  x as i,
  y as n,
  h as o,
  g as r,
  f as t
};
