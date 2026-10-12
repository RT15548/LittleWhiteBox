/* eslint-disable */
import { c as p, s as y } from "./xiaobai-os-three.module-Ah3xIFOr.js";
function E(i, a = !1) {
  const r = i[0].index !== null, m = new Set(Object.keys(i[0].attributes)), n = new Set(Object.keys(i[0].morphAttributes)), f = {}, t = {}, h = i[0].morphTargetsRelative, u = new p();
  let g = 0;
  for (let e = 0; e < i.length; ++e) {
    const s = i[e];
    let l = 0;
    if (r !== (s.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const o in s.attributes) {
      if (!m.has(o))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + '. All geometries must have compatible attributes; make sure "' + o + '" attribute exists among all geometries, or in none of them.'), null;
      f[o] === void 0 && (f[o] = []), f[o].push(s.attributes[o]), l++;
    }
    if (l !== m.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + ". Make sure all geometries have the same number of attributes."), null;
    if (h !== s.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const o in s.morphAttributes) {
      if (!n.has(o))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + ".  .morphAttributes must be consistent throughout all geometries."), null;
      t[o] === void 0 && (t[o] = []), t[o].push(s.morphAttributes[o]);
    }
    if (a) {
      let o;
      if (r) o = s.index.count;
      else if (s.attributes.position !== void 0) o = s.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + e + ". The geometry must have either an index or a position attribute"), null;
      u.addGroup(g, o, e), g += o;
    }
  }
  if (r) {
    let e = 0;
    const s = [];
    for (let l = 0; l < i.length; ++l) {
      const o = i[l].index;
      for (let c = 0; c < o.count; ++c) s.push(o.getX(c) + e);
      e += i[l].attributes.position.count;
    }
    u.setIndex(s);
  }
  for (const e in f) {
    const s = b(f[e]);
    if (!s)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " attribute."), null;
    u.setAttribute(e, s);
  }
  for (const e in t) {
    const s = t[e][0].length;
    if (s === 0) break;
    u.morphAttributes = u.morphAttributes || {}, u.morphAttributes[e] = [];
    for (let l = 0; l < s; ++l) {
      const o = [];
      for (let d = 0; d < t[e].length; ++d) o.push(t[e][d][l]);
      const c = b(o);
      if (!c)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " morphAttribute."), null;
      u.morphAttributes[e].push(c);
    }
  }
  return u;
}
function b(i) {
  let a, r, m, n = -1, f = 0;
  for (let g = 0; g < i.length; ++g) {
    const e = i[g];
    if (a === void 0 && (a = e.array.constructor), a !== e.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (r === void 0 && (r = e.itemSize), r !== e.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (m === void 0 && (m = e.normalized), m !== e.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (n === -1 && (n = e.gpuType), n !== e.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    f += e.count * r;
  }
  const t = new a(f), h = new y(t, r, m);
  let u = 0;
  for (let g = 0; g < i.length; ++g) {
    const e = i[g];
    if (e.isInterleavedBufferAttribute) {
      const s = u / r;
      for (let l = 0, o = e.count; l < o; l++) for (let c = 0; c < r; c++) {
        const d = e.getComponent(l, c);
        h.setComponent(l + s, c, d);
      }
    } else t.set(e.array, u);
    u += e.count * r;
  }
  return n !== void 0 && (h.gpuType = n), h;
}
function G(i, a) {
  if (a === 0)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), i;
  if (a === 2 || a === 1) {
    let r = i.getIndex();
    if (r === null) {
      const t = [], h = i.getAttribute("position");
      if (h !== void 0) {
        for (let u = 0; u < h.count; u++) t.push(u);
        i.setIndex(t), r = i.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), i;
    }
    const m = r.count - 2, n = [];
    if (a === 2) for (let t = 1; t <= m; t++)
      n.push(r.getX(0)), n.push(r.getX(t)), n.push(r.getX(t + 1));
    else for (let t = 0; t < m; t++) t % 2 === 0 ? (n.push(r.getX(t)), n.push(r.getX(t + 1)), n.push(r.getX(t + 2))) : (n.push(r.getX(t + 2)), n.push(r.getX(t + 1)), n.push(r.getX(t)));
    n.length / 3 !== m && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const f = i.clone();
    return f.setIndex(n), f.clearGroups(), f;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", a), i;
}
export {
  G as n,
  E as t
};
