/* eslint-disable */
import { Lt as M, o as S } from "./xiaobai-os-three.module-Ah3xIFOr.js";
var g = new M();
function a(u, n, i, y, f, e) {
  const x = 2 * Math.PI * f / 4, l = Math.max(e - 2 * f, 0), m = Math.PI / 4;
  g.copy(n), g[y] = 0, g.normalize();
  const t = 0.5 * x / (x + l), b = 1 - g.angleTo(u) / m;
  return Math.sign(g[i]) === 1 ? b * t : l / (x + l) + t + t * (1 - b);
}
var A = class p extends S {
  constructor(n = 1, i = 1, y = 1, f = 2, e = 0.1) {
    const x = f * 2 + 1;
    if (e = Math.min(n / 2, i / 2, y / 2, e), super(1, 1, 1, x, x, x), this.type = "RoundedBoxGeometry", this.parameters = {
      width: n,
      height: i,
      depth: y,
      segments: f,
      radius: e
    }, x === 1) return;
    const l = this.toNonIndexed();
    this.index = null, this.attributes.position = l.attributes.position, this.attributes.normal = l.attributes.normal, this.attributes.uv = l.attributes.uv;
    const m = new M(), t = new M(), b = new M(n, i, y).divideScalar(2).subScalar(e), z = this.attributes.position.array, h = this.attributes.normal.array, r = this.attributes.uv.array, k = z.length / 6, o = new M(), v = 0.5 / x;
    for (let c = 0, s = 0; c < z.length; c += 3, s += 2)
      switch (m.fromArray(z, c), t.copy(m), t.x -= Math.sign(t.x) * v, t.y -= Math.sign(t.y) * v, t.z -= Math.sign(t.z) * v, t.normalize(), z[c + 0] = b.x * Math.sign(m.x) + t.x * e, z[c + 1] = b.y * Math.sign(m.y) + t.y * e, z[c + 2] = b.z * Math.sign(m.z) + t.z * e, h[c + 0] = t.x, h[c + 1] = t.y, h[c + 2] = t.z, Math.floor(c / k)) {
        case 0:
          o.set(1, 0, 0), r[s + 0] = a(o, t, "z", "y", e, y), r[s + 1] = 1 - a(o, t, "y", "z", e, i);
          break;
        case 1:
          o.set(-1, 0, 0), r[s + 0] = 1 - a(o, t, "z", "y", e, y), r[s + 1] = 1 - a(o, t, "y", "z", e, i);
          break;
        case 2:
          o.set(0, 1, 0), r[s + 0] = 1 - a(o, t, "x", "z", e, n), r[s + 1] = a(o, t, "z", "x", e, y);
          break;
        case 3:
          o.set(0, -1, 0), r[s + 0] = 1 - a(o, t, "x", "z", e, n), r[s + 1] = 1 - a(o, t, "z", "x", e, y);
          break;
        case 4:
          o.set(0, 0, 1), r[s + 0] = 1 - a(o, t, "x", "y", e, n), r[s + 1] = 1 - a(o, t, "y", "x", e, i);
          break;
        case 5:
          o.set(0, 0, -1), r[s + 0] = a(o, t, "x", "y", e, n), r[s + 1] = 1 - a(o, t, "y", "x", e, i);
          break;
      }
  }
  static fromJSON(n) {
    return new p(n.width, n.height, n.depth, n.segments, n.radius);
  }
};
export {
  A as t
};
