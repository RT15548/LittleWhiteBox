/* eslint-disable */
function d(r, s) {
  let t = null;
  function o(n) {
    if (!t || n.pointerId !== t.id) return;
    const e = t.surface.getBoundingClientRect(), c = e.width * 0.36, u = (n.clientX - e.left - e.width / 2) / c, l = (n.clientY - e.top - e.height / 2) / c, a = Math.max(1, Math.hypot(u, l));
    r(u / a, l / a);
  }
  function i() {
    const n = t;
    t = null, r(0, 0), n?.surface.hasPointerCapture(n.id) && n.surface.releasePointerCapture(n.id);
  }
  return {
    down(n) {
      if (t || n.button !== 0) return;
      s();
      const e = n.currentTarget;
      e.setPointerCapture(n.pointerId), t = {
        id: n.pointerId,
        surface: e
      }, o(n);
    },
    move: o,
    release(n) {
      t?.id === n.pointerId && i();
    },
    clear: i
  };
}
function p(r) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), o = r.clone();
  return f(r, o, function(i, n) {
    s.set(n, i), t.set(i, n);
  }), o.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const n = i, e = s.get(i), c = e.skeleton.bones;
    n.skeleton = e.skeleton.clone(), n.bindMatrix.copy(e.bindMatrix), n.skeleton.bones = c.map(function(u) {
      return t.get(u);
    }), n.bind(n.skeleton, n.bindMatrix);
  }), o;
}
function f(r, s, t) {
  t(r, s);
  for (let o = 0; o < r.children.length; o++) f(r.children[o], s.children[o], t);
}
export {
  d as n,
  p as t
};
