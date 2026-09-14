/* eslint-disable */
import { $ as j, F as et, J as Gt, O as jt, P as nt, Q as V, R as qt, S as zt, X as x, Z as Xt, _ as Zt, _t as Jt, a as rt, at as Qt, ct as Yt, d as kt, dt as _t, et as yt, ft as q, g as te, it as ee, lt as A, m as ne, n as re, nt as T, ot as se, pt as z, r as ie, rt as Mt, st as F, t as oe, tt as ae, ut as ce, v as fe } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
var U = void 0, st = typeof window < "u" && window.trustedTypes;
if (st) try {
  U = /* @__PURE__ */ st.createPolicy("vue", { createHTML: (t) => t });
} catch {
}
var Nt = U ? (t) => U.createHTML(t) : (t) => t, le = "http://www.w3.org/2000/svg", ue = "http://www.w3.org/1998/Math/MathML", g = typeof document < "u" ? document : null, it = g && /* @__PURE__ */ g.createElement("template"), de = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, r) => {
    const s = e === "svg" ? g.createElementNS(le, t) : e === "mathml" ? g.createElementNS(ue, t) : n ? g.createElement(t, { is: n }) : g.createElement(t);
    return t === "select" && r && r.multiple != null && s.setAttribute("multiple", r.multiple), s;
  },
  createText: (t) => g.createTextNode(t),
  createComment: (t) => g.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => g.querySelector(t),
  setScopeId(t, e) {
    t.setAttribute(e, "");
  },
  insertStaticContent(t, e, n, r, s, o) {
    const i = n ? n.previousSibling : e.lastChild;
    if (s && (s === o || s.nextSibling)) for (; e.insertBefore(s.cloneNode(!0), n), !(s === o || !(s = s.nextSibling)); )
      ;
    else {
      it.innerHTML = Nt(r === "svg" ? `<svg>${t}</svg>` : r === "mathml" ? `<math>${t}</math>` : t);
      const a = it.content;
      if (r === "svg" || r === "mathml") {
        const c = a.firstChild;
        for (; c.firstChild; ) a.appendChild(c.firstChild);
        a.removeChild(c);
      }
      e.insertBefore(a, n);
    }
    return [i ? i.nextSibling : e.firstChild, n ? n.previousSibling : e.lastChild];
  }
}, C = "transition", L = "animation", M = /* @__PURE__ */ Symbol("_vtc"), Lt = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: !0
  },
  duration: [
    String,
    Number,
    Object
  ],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
}, Pt = /* @__PURE__ */ V({}, re, Lt), pe = (t) => (t.displayName = "Transition", t.props = Pt, t), je = /* @__PURE__ */ pe((t, { slots: e }) => fe(oe, It(t), e)), w = (t, e = []) => {
  T(t) ? t.forEach((n) => n(...e)) : t && t(...e);
}, ot = (t) => t ? T(t) ? t.some((e) => e.length > 1) : t.length > 1 : !1;
function It(t) {
  const e = {};
  for (const f in t) f in Lt || (e[f] = t[f]);
  if (t.css === !1) return e;
  const { name: n = "v", type: r, duration: s, enterFromClass: o = `${n}-enter-from`, enterActiveClass: i = `${n}-enter-active`, enterToClass: a = `${n}-enter-to`, appearFromClass: c = o, appearActiveClass: l = i, appearToClass: u = a, leaveFromClass: p = `${n}-leave-from`, leaveActiveClass: d = `${n}-leave-active`, leaveToClass: _ = `${n}-leave-to` } = t, y = me(s), Ft = y && y[0], Ht = y && y[1], { onBeforeEnter: X, onEnter: Z, onEnterCancelled: J, onLeave: Q, onLeaveCancelled: Kt, onBeforeAppear: Bt = X, onAppear: Wt = Z, onAppearCancelled: Ut = J } = e, H = (f, m, E, R) => {
    f._enterCancelled = R, S(f, m ? u : a), S(f, m ? l : i), E && E();
  }, Y = (f, m) => {
    f._isLeaving = !1, S(f, p), S(f, _), S(f, d), m && m();
  }, k = (f) => (m, E) => {
    const R = f ? Wt : Z, tt = () => H(m, f, E);
    w(R, [m, tt]), at(() => {
      S(m, f ? c : o), h(m, f ? u : a), ot(R) || ct(m, r, Ft, tt);
    });
  };
  return V(e, {
    onBeforeEnter(f) {
      w(X, [f]), h(f, o), h(f, i);
    },
    onBeforeAppear(f) {
      w(Bt, [f]), h(f, c), h(f, l);
    },
    onEnter: k(!1),
    onAppear: k(!0),
    onLeave(f, m) {
      f._isLeaving = !0;
      const E = () => Y(f, m);
      h(f, p), f._enterCancelled ? (h(f, d), G(f)) : (G(f), h(f, d)), at(() => {
        f._isLeaving && (S(f, p), h(f, _), ot(Q) || ct(f, r, Ht, E));
      }), w(Q, [f, E]);
    },
    onEnterCancelled(f) {
      H(f, !1, void 0, !0), w(J, [f]);
    },
    onAppearCancelled(f) {
      H(f, !0, void 0, !0), w(Ut, [f]);
    },
    onLeaveCancelled(f) {
      Y(f), w(Kt, [f]);
    }
  });
}
function me(t) {
  if (t == null) return null;
  if (Qt(t)) return [K(t.enter), K(t.leave)];
  {
    const e = K(t);
    return [e, e];
  }
}
function K(t) {
  return Jt(t);
}
function h(t, e) {
  e.split(/\s+/).forEach((n) => n && t.classList.add(n)), (t[M] || (t[M] = /* @__PURE__ */ new Set())).add(e);
}
function S(t, e) {
  e.split(/\s+/).forEach((r) => r && t.classList.remove(r));
  const n = t[M];
  n && (n.delete(e), n.size || (t[M] = void 0));
}
function at(t) {
  requestAnimationFrame(() => {
    requestAnimationFrame(t);
  });
}
var he = 0;
function ct(t, e, n, r) {
  const s = t._endId = ++he, o = () => {
    s === t._endId && r();
  };
  if (n != null) return setTimeout(o, n);
  const { type: i, timeout: a, propCount: c } = xt(t, e);
  if (!i) return r();
  const l = i + "end";
  let u = 0;
  const p = () => {
    t.removeEventListener(l, d), o();
  }, d = (_) => {
    _.target === t && ++u >= c && p();
  };
  setTimeout(() => {
    u < c && p();
  }, a + 1), t.addEventListener(l, d);
}
function xt(t, e) {
  const n = window.getComputedStyle(t), r = (y) => (n[y] || "").split(", "), s = r(`${C}Delay`), o = r(`${C}Duration`), i = ft(s, o), a = r(`${L}Delay`), c = r(`${L}Duration`), l = ft(a, c);
  let u = null, p = 0, d = 0;
  e === C ? i > 0 && (u = C, p = i, d = o.length) : e === L ? l > 0 && (u = L, p = l, d = c.length) : (p = Math.max(i, l), u = p > 0 ? i > l ? C : L : null, d = u ? u === C ? o.length : c.length : 0);
  const _ = u === C && /\b(?:transform|all)(?:,|$)/.test(r(`${C}Property`).toString());
  return {
    type: u,
    timeout: p,
    propCount: d,
    hasTransform: _
  };
}
function ft(t, e) {
  for (; t.length < e.length; ) t = t.concat(t);
  return Math.max(...e.map((n, r) => lt(n) + lt(t[r])));
}
function lt(t) {
  return t === "auto" ? 0 : Number(t.slice(0, -1).replace(",", ".")) * 1e3;
}
function G(t) {
  return (t ? t.ownerDocument : document).body.offsetHeight;
}
function ge(t, e, n) {
  const r = t[M];
  r && (e = (e ? [e, ...r] : [...r]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
var O = /* @__PURE__ */ Symbol("_vod"), Dt = /* @__PURE__ */ Symbol("_vsh"), qe = {
  name: "show",
  beforeMount(t, { value: e }, { transition: n }) {
    t[O] = t.style.display === "none" ? "" : t.style.display, n && e ? n.beforeEnter(t) : P(t, e);
  },
  mounted(t, { value: e }, { transition: n }) {
    n && e && n.enter(t);
  },
  updated(t, { value: e, oldValue: n }, { transition: r }) {
    !e != !n && (r ? e ? (r.beforeEnter(t), P(t, !0), r.enter(t)) : r.leave(t, () => {
      P(t, !1);
    }) : P(t, e));
  },
  beforeUnmount(t, { value: e }) {
    P(t, e);
  }
};
function P(t, e) {
  t.style.display = e ? t[O] : "none", t[Dt] = !e;
}
var ve = /* @__PURE__ */ Symbol(""), Ce = /(?:^|;)\s*display\s*:/;
function Se(t, e, n) {
  const r = t.style, s = A(n);
  let o = !1;
  if (n && !s) {
    if (e) if (A(e))
      for (const i of e.split(";")) {
        const a = i.slice(0, i.indexOf(":")).trim();
        n[a] == null && I(r, a, "");
      }
    else for (const i in e) n[i] == null && I(r, i, "");
    for (const i in n) {
      i === "display" && (o = !0);
      const a = n[i];
      a != null ? Te(t, i, !A(e) && e ? e[i] : void 0, a) || I(r, i, a) : I(r, i, "");
    }
  } else if (s) {
    if (e !== n) {
      const i = r[ve];
      i && (n += ";" + i), r.cssText = n, o = Ce.test(n);
    }
  } else e && t.removeAttribute("style");
  O in t && (t[O] = o ? r.display : "", t[Dt] && (r.display = "none"));
}
var ut = /\s*!important$/;
function I(t, e, n) {
  if (T(n)) n.forEach((r) => I(t, e, r));
  else if (n == null && (n = ""), e.startsWith("--")) t.setProperty(e, n);
  else {
    const r = be(t, e);
    ut.test(n) ? t.setProperty(j(r), n.replace(ut, ""), "important") : t[r] = n;
  }
}
var dt = [
  "Webkit",
  "Moz",
  "ms"
], B = {};
function be(t, e) {
  const n = B[e];
  if (n) return n;
  let r = x(e);
  if (r !== "filter" && r in t) return B[e] = r;
  r = Xt(r);
  for (let s = 0; s < dt.length; s++) {
    const o = dt[s] + r;
    if (o in t) return B[e] = o;
  }
  return e;
}
function Te(t, e, n, r) {
  return t.tagName === "TEXTAREA" && (e === "width" || e === "height") && A(r) && n === r;
}
var pt = "http://www.w3.org/1999/xlink";
function mt(t, e, n, r, s, o = Yt(e)) {
  r && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(pt, e.slice(6, e.length)) : t.setAttributeNS(pt, e, n) : n == null || o && !yt(n) ? t.removeAttribute(e) : t.setAttribute(e, o ? "" : ce(n) ? String(n) : n);
}
function ht(t, e, n, r, s) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? Nt(n) : n);
    return;
  }
  const o = t.tagName;
  if (e === "value" && o !== "PROGRESS" && !o.includes("-")) {
    const a = o === "OPTION" ? t.getAttribute("value") || "" : t.value, c = n == null ? t.type === "checkbox" ? "on" : "" : String(n);
    (a !== c || !("_value" in t)) && (t.value = c), n == null && t.removeAttribute(e), t._value = n;
    return;
  }
  let i = !1;
  if (n === "" || n == null) {
    const a = typeof t[e];
    a === "boolean" ? n = yt(n) : n == null && a === "string" ? (n = "", i = !0) : a === "number" && (n = 0, i = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  i && t.removeAttribute(s || e);
}
function b(t, e, n, r) {
  t.addEventListener(e, n, r);
}
function Ee(t, e, n, r) {
  t.removeEventListener(e, n, r);
}
var gt = /* @__PURE__ */ Symbol("_vei");
function we(t, e, n, r, s = null) {
  const o = t[gt] || (t[gt] = {}), i = o[e];
  if (r && i) i.value = r;
  else {
    const [a, c] = Ae(e);
    r ? b(t, a, o[e] = Me(r, s), c) : i && (Ee(t, a, i, c), o[e] = void 0);
  }
}
var vt = /(?:Once|Passive|Capture)$/;
function Ae(t) {
  let e;
  if (vt.test(t)) {
    e = {};
    let n;
    for (; n = t.match(vt); )
      t = t.slice(0, t.length - n[0].length), e[n[0].toLowerCase()] = !0;
  }
  return [t[2] === ":" ? t.slice(3) : j(t.slice(2)), e];
}
var W = 0, _e = /* @__PURE__ */ Promise.resolve(), ye = () => W || (_e.then(() => W = 0), W = Date.now());
function Me(t, e) {
  const n = (r) => {
    if (!r._vts) r._vts = Date.now();
    else if (r._vts <= n.attached) return;
    const s = n.value;
    if (T(s)) {
      const o = r.stopImmediatePropagation;
      r.stopImmediatePropagation = () => {
        o.call(r), r._stopped = !0;
      };
      const i = s.slice(), a = [r];
      for (let c = 0; c < i.length && !r._stopped; c++) {
        const l = i[c];
        l && rt(l, e, 5, a);
      }
    } else rt(s, e, 5, [r]);
  };
  return n.value = t, n.attached = ye(), n;
}
var Ct = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Ne = (t, e, n, r, s, o) => {
  const i = s === "svg";
  e === "class" ? ge(t, r, i) : e === "style" ? Se(t, n, r) : se(e) ? ee(e) || we(t, e, n, r, o) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Le(t, e, r, i)) ? (ht(t, e, r), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && mt(t, e, r, i, o, e !== "value")) : t._isVueCE && (Pe(t, e) || t._def.__asyncLoader && (/[A-Z]/.test(e) || !A(r))) ? ht(t, x(e), r, o, e) : (e === "true-value" ? t._trueValue = r : e === "false-value" && (t._falseValue = r), mt(t, e, r, i));
};
function Le(t, e, n, r) {
  if (r)
    return !!(e === "innerHTML" || e === "textContent" || e in t && Ct(e) && Mt(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && t.tagName === "IFRAME" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA") return !1;
  if (e === "width" || e === "height") {
    const s = t.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE") return !1;
  }
  return Ct(e) && A(n) ? !1 : e in t;
}
function Pe(t, e) {
  const n = t._def.props;
  if (!n) return !1;
  const r = x(e);
  return Array.isArray(n) ? n.some((s) => x(s) === r) : Object.keys(n).some((s) => x(s) === r);
}
var Rt = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ Symbol("_moveCb"), St = /* @__PURE__ */ Symbol("_enterCb"), Ie = (t) => (delete t.props.mode, t), ze = /* @__PURE__ */ Ie({
  name: "TransitionGroup",
  props: /* @__PURE__ */ V({}, Pt, {
    tag: String,
    moveClass: String
  }),
  setup(t, { slots: e }) {
    const n = te(), r = qt();
    let s, o;
    return jt(() => {
      if (!s.length) return;
      const i = t.moveClass || `${t.name || "v"}-move`;
      if (!Oe(s[0].el, n.vnode.el, i)) {
        s = [];
        return;
      }
      s.forEach(xe), s.forEach(De);
      const a = s.filter(Re);
      G(n.vnode.el), a.forEach((c) => {
        const l = c.el, u = l.style;
        h(l, i), u.transform = u.webkitTransform = u.transitionDuration = "";
        const p = l[$] = (d) => {
          d && d.target !== l || (!d || d.propertyName.endsWith("transform")) && (l.removeEventListener("transitionend", p), l[$] = null, S(l, i));
        };
        l.addEventListener("transitionend", p);
      }), s = [];
    }), () => {
      const i = Gt(t), a = It(i);
      let c = i.tag || ie;
      if (s = [], o) for (let l = 0; l < o.length; l++) {
        const u = o[l];
        u.el && u.el instanceof Element && (s.push(u), et(u, nt(u, a, r, n)), Rt.set(u, $t(u.el)));
      }
      o = e.default ? Zt(e.default()) : [];
      for (let l = 0; l < o.length; l++) {
        const u = o[l];
        u.key != null && et(u, nt(u, a, r, n));
      }
      return ne(c, null, o);
    };
  }
});
function xe(t) {
  const e = t.el;
  e[$] && e[$](), e[St] && e[St]();
}
function De(t) {
  Ot.set(t, $t(t.el));
}
function Re(t) {
  const e = Rt.get(t), n = Ot.get(t), r = e.left - n.left, s = e.top - n.top;
  if (r || s) {
    const o = t.el, i = o.style, a = o.getBoundingClientRect();
    let c = 1, l = 1;
    return o.offsetWidth && (c = a.width / o.offsetWidth), o.offsetHeight && (l = a.height / o.offsetHeight), (!Number.isFinite(c) || c === 0) && (c = 1), (!Number.isFinite(l) || l === 0) && (l = 1), Math.abs(c - 1) < 0.01 && (c = 1), Math.abs(l - 1) < 0.01 && (l = 1), i.transform = i.webkitTransform = `translate(${r / c}px,${s / l}px)`, i.transitionDuration = "0s", t;
  }
}
function $t(t) {
  const e = t.getBoundingClientRect();
  return {
    left: e.left,
    top: e.top
  };
}
function Oe(t, e, n) {
  const r = t.cloneNode(), s = t[M];
  s && s.forEach((a) => {
    a.split(/\s+/).forEach((c) => c && r.classList.remove(c));
  }), n.split(/\s+/).forEach((a) => a && r.classList.add(a)), r.style.display = "none";
  const o = e.nodeType === 1 ? e : e.parentNode;
  o.appendChild(r);
  const { hasTransform: i } = xt(r);
  return o.removeChild(r), i;
}
var N = (t) => {
  const e = t.props["onUpdate:modelValue"] || !1;
  return T(e) ? (n) => ae(e, n) : e;
};
function $e(t) {
  t.target.composing = !0;
}
function bt(t) {
  const e = t.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
var v = /* @__PURE__ */ Symbol("_assign");
function Tt(t, e, n) {
  return e && (t = t.trim()), n && (t = z(t)), t;
}
var Xe = {
  created(t, { modifiers: { lazy: e, trim: n, number: r } }, s) {
    t[v] = N(s);
    const o = r || s.props && s.props.type === "number";
    b(t, e ? "change" : "input", (i) => {
      i.target.composing || t[v](Tt(t.value, n, o));
    }), (n || o) && b(t, "change", () => {
      t.value = Tt(t.value, n, o);
    }), e || (b(t, "compositionstart", $e), b(t, "compositionend", bt), b(t, "change", bt));
  },
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: r, trim: s, number: o } }, i) {
    if (t[v] = N(i), t.composing) return;
    const a = (o || t.type === "number") && !/^0\d/.test(t.value) ? z(t.value) : t.value, c = e ?? "";
    if (a === c) return;
    const l = t.getRootNode();
    (l instanceof Document || l instanceof ShadowRoot) && l.activeElement === t && t.type !== "range" && (r && e === n || s && t.value.trim() === c) || (t.value = c);
  }
}, Ze = {
  deep: !0,
  created(t, e, n) {
    t[v] = N(n), b(t, "change", () => {
      const r = t._modelValue, s = D(t), o = t.checked, i = t[v];
      if (T(r)) {
        const a = q(r, s), c = a !== -1;
        if (o && !c) i(r.concat(s));
        else if (!o && c) {
          const l = [...r];
          l.splice(a, 1), i(l);
        }
      } else if (F(r)) {
        const a = new Set(r);
        o ? a.add(s) : a.delete(s), i(a);
      } else i(Vt(t, o));
    });
  },
  mounted: Et,
  beforeUpdate(t, e, n) {
    t[v] = N(n), Et(t, e, n);
  }
};
function Et(t, { value: e, oldValue: n }, r) {
  t._modelValue = e;
  let s;
  if (T(e)) s = q(e, r.props.value) > -1;
  else if (F(e)) s = e.has(r.props.value);
  else {
    if (e === n) return;
    s = _t(e, Vt(t, !0));
  }
  t.checked !== s && (t.checked = s);
}
var Je = {
  deep: !0,
  created(t, { value: e, modifiers: { number: n } }, r) {
    const s = F(e);
    b(t, "change", () => {
      const o = Array.prototype.filter.call(t.options, (i) => i.selected).map((i) => n ? z(D(i)) : D(i));
      t[v](t.multiple ? s ? new Set(o) : o : o[0]), t._assigning = !0, zt(() => {
        t._assigning = !1;
      });
    }), t[v] = N(r);
  },
  mounted(t, { value: e }) {
    wt(t, e);
  },
  beforeUpdate(t, e, n) {
    t[v] = N(n);
  },
  updated(t, { value: e }) {
    t._assigning || wt(t, e);
  }
};
function wt(t, e) {
  const n = t.multiple, r = T(e);
  if (!(n && !r && !F(e))) {
    for (let s = 0, o = t.options.length; s < o; s++) {
      const i = t.options[s], a = D(i);
      if (n) if (r) {
        const c = typeof a;
        c === "string" || c === "number" ? i.selected = e.some((l) => String(l) === String(a)) : i.selected = q(e, a) > -1;
      } else i.selected = e.has(a);
      else if (_t(D(i), e)) {
        t.selectedIndex !== s && (t.selectedIndex = s);
        return;
      }
    }
    !n && t.selectedIndex !== -1 && (t.selectedIndex = -1);
  }
}
function D(t) {
  return "_value" in t ? t._value : t.value;
}
function Vt(t, e) {
  const n = e ? "_trueValue" : "_falseValue";
  return n in t ? t[n] : e;
}
var Ve = [
  "ctrl",
  "shift",
  "alt",
  "meta"
], Fe = {
  stop: (t) => t.stopPropagation(),
  prevent: (t) => t.preventDefault(),
  self: (t) => t.target !== t.currentTarget,
  ctrl: (t) => !t.ctrlKey,
  shift: (t) => !t.shiftKey,
  alt: (t) => !t.altKey,
  meta: (t) => !t.metaKey,
  left: (t) => "button" in t && t.button !== 0,
  middle: (t) => "button" in t && t.button !== 1,
  right: (t) => "button" in t && t.button !== 2,
  exact: (t, e) => Ve.some((n) => t[`${n}Key`] && !e.includes(n))
}, Qe = (t, e) => {
  if (!t) return t;
  const n = t._withMods || (t._withMods = {}), r = e.join(".");
  return n[r] || (n[r] = ((s, ...o) => {
    for (let i = 0; i < e.length; i++) {
      const a = Fe[e[i]];
      if (a && a(s, e)) return;
    }
    return t(s, ...o);
  }));
}, He = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Ye = (t, e) => {
  const n = t._withKeys || (t._withKeys = {}), r = e.join(".");
  return n[r] || (n[r] = ((s) => {
    if (!("key" in s)) return;
    const o = j(s.key);
    if (e.some((i) => i === o || He[i] === o)) return t(s);
  }));
}, Ke = /* @__PURE__ */ V({ patchProp: Ne }, de), At;
function Be() {
  return At || (At = kt(Ke));
}
var ke = ((...t) => {
  const e = Be().createApp(...t), { mount: n } = e;
  return e.mount = (r) => {
    const s = Ue(r);
    if (!s) return;
    const o = e._component;
    !Mt(o) && !o.render && !o.template && (o.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const i = n(s, !1, We(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), i;
  }, e;
});
function We(t) {
  if (t instanceof SVGElement) return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement) return "mathml";
}
function Ue(t) {
  return A(t) ? document.querySelector(t) : t;
}
export {
  Je as a,
  Ye as c,
  Ze as i,
  Qe as l,
  ze as n,
  Xe as o,
  ke as r,
  qe as s,
  je as t
};
