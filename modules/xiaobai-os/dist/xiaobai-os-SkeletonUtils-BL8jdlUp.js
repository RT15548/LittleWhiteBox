/* eslint-disable */
function p(t) {
  const s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), e = t.clone();
  return i(t, e, function(o, n) {
    s.set(n, o), r.set(o, n);
  }), e.traverse(function(o) {
    if (!o.isSkinnedMesh) return;
    const n = o, c = s.get(o), l = c.skeleton.bones;
    n.skeleton = c.skeleton.clone(), n.bindMatrix.copy(c.bindMatrix), n.skeleton.bones = l.map(function(u) {
      return r.get(u);
    }), n.bind(n.skeleton, n.bindMatrix);
  }), e;
}
function i(t, s, r) {
  r(t, s);
  for (let e = 0; e < t.children.length; e++) i(t.children[e], s.children[e], r);
}
export {
  p as t
};
