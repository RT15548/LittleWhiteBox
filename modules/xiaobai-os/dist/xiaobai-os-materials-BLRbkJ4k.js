/* eslint-disable */
import { t as Q } from "./xiaobai-os-chunk-9ZSF5uba.js";
var L = /* @__PURE__ */ Q(((t, h) => {
  h.exports = {};
})), rt = /* @__PURE__ */ Q(((t, h) => {
  (function() {
    "use strict";
    var c = "input is invalid type", d = typeof window == "object", s = d ? window : {};
    s.JS_SHA256_NO_WINDOW && (d = !1);
    var p = !d && typeof self == "object", o = !s.JS_SHA256_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node && process.type != "renderer";
    o ? s = globalThis : p && (s = self);
    var l = !s.JS_SHA256_NO_COMMON_JS && typeof h == "object" && h.exports, u = typeof define == "function" && define.amd, b = !s.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", r = "0123456789abcdef".split(""), _ = [
      -2147483648,
      8388608,
      32768,
      128
    ], x = [
      24,
      16,
      8,
      0
    ], k = [
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ], R = [
      "hex",
      "array",
      "digest",
      "arrayBuffer"
    ], S = [];
    (s.JS_SHA256_NO_NODE_JS || !Array.isArray) && (Array.isArray = function(e) {
      return Object.prototype.toString.call(e) === "[object Array]";
    }), b && (s.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) && (ArrayBuffer.isView = function(e) {
      return typeof e == "object" && e.buffer && e.buffer.constructor === ArrayBuffer;
    });
    var Y = function(e, f) {
      return function(y) {
        return new B(f, !0).update(y)[e]();
      };
    }, K = function(e) {
      var f = Y("hex", e);
      o && (f = et(f, e)), f.create = function() {
        return new B(e);
      }, f.update = function(v) {
        return f.create().update(v);
      };
      for (var y = 0; y < R.length; ++y) {
        var a = R[y];
        f[a] = Y(a, e);
      }
      return f;
    }, et = function(e, f) {
      var y = L(), a = L().Buffer, v = f ? "sha224" : "sha256", n;
      a.from && !s.JS_SHA256_NO_BUFFER_FROM ? n = a.from : n = function(i) {
        return new a(i);
      };
      var w = function(i) {
        if (typeof i == "string") return y.createHash(v).update(i, "utf8").digest("hex");
        if (i == null) throw new Error(c);
        return i.constructor === ArrayBuffer && (i = new Uint8Array(i)), Array.isArray(i) || ArrayBuffer.isView(i) || i.constructor === a ? y.createHash(v).update(n(i)).digest("hex") : e(i);
      };
      return w;
    }, q = function(e, f) {
      return function(y, a) {
        return new z(y, f, !0).update(a)[e]();
      };
    }, G = function(e) {
      var f = q("hex", e);
      f.create = function(v) {
        return new z(v, e);
      }, f.update = function(v, n) {
        return f.create(v).update(n);
      };
      for (var y = 0; y < R.length; ++y) {
        var a = R[y];
        f[a] = q(a, e);
      }
      return f;
    };
    function B(e, f) {
      f ? (S[0] = S[16] = S[1] = S[2] = S[3] = S[4] = S[5] = S[6] = S[7] = S[8] = S[9] = S[10] = S[11] = S[12] = S[13] = S[14] = S[15] = 0, this.blocks = S) : this.blocks = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ], e ? (this.h0 = 3238371032, this.h1 = 914150663, this.h2 = 812702999, this.h3 = 4144912697, this.h4 = 4290775857, this.h5 = 1750603025, this.h6 = 1694076839, this.h7 = 3204075428) : (this.h0 = 1779033703, this.h1 = 3144134277, this.h2 = 1013904242, this.h3 = 2773480762, this.h4 = 1359893119, this.h5 = 2600822924, this.h6 = 528734635, this.h7 = 1541459225), this.block = this.start = this.bytes = this.hBytes = 0, this.finalized = this.hashed = !1, this.first = !0, this.is224 = e;
    }
    B.prototype.update = function(e) {
      if (!this.finalized) {
        var f, y = typeof e;
        if (y !== "string") {
          if (y === "object") {
            if (e === null) throw new Error(c);
            if (b && e.constructor === ArrayBuffer) e = new Uint8Array(e);
            else if (!Array.isArray(e) && (!b || !ArrayBuffer.isView(e)))
              throw new Error(c);
          } else throw new Error(c);
          f = !0;
        }
        for (var a, v = 0, n, w = e.length, i = this.blocks; v < w; ) {
          if (this.hashed && (this.hashed = !1, i[0] = this.block, this.block = i[16] = i[1] = i[2] = i[3] = i[4] = i[5] = i[6] = i[7] = i[8] = i[9] = i[10] = i[11] = i[12] = i[13] = i[14] = i[15] = 0), f) for (n = this.start; v < w && n < 64; ++v) i[n >>> 2] |= e[v] << x[n++ & 3];
          else for (n = this.start; v < w && n < 64; ++v)
            a = e.charCodeAt(v), a < 128 ? i[n >>> 2] |= a << x[n++ & 3] : a < 2048 ? (i[n >>> 2] |= (192 | a >>> 6) << x[n++ & 3], i[n >>> 2] |= (128 | a & 63) << x[n++ & 3]) : a < 55296 || a >= 57344 ? (i[n >>> 2] |= (224 | a >>> 12) << x[n++ & 3], i[n >>> 2] |= (128 | a >>> 6 & 63) << x[n++ & 3], i[n >>> 2] |= (128 | a & 63) << x[n++ & 3]) : (a = 65536 + ((a & 1023) << 10 | e.charCodeAt(++v) & 1023), i[n >>> 2] |= (240 | a >>> 18) << x[n++ & 3], i[n >>> 2] |= (128 | a >>> 12 & 63) << x[n++ & 3], i[n >>> 2] |= (128 | a >>> 6 & 63) << x[n++ & 3], i[n >>> 2] |= (128 | a & 63) << x[n++ & 3]);
          this.lastByteIndex = n, this.bytes += n - this.start, n >= 64 ? (this.block = i[16], this.start = n - 64, this.hash(), this.hashed = !0) : this.start = n;
        }
        return this.bytes > 4294967295 && (this.hBytes += this.bytes / 4294967296 << 0, this.bytes = this.bytes % 4294967296), this;
      }
    }, B.prototype.finalize = function() {
      if (!this.finalized) {
        this.finalized = !0;
        var e = this.blocks, f = this.lastByteIndex;
        e[16] = this.block, e[f >>> 2] |= _[f & 3], this.block = e[16], f >= 56 && (this.hashed || this.hash(), e[0] = this.block, e[16] = e[1] = e[2] = e[3] = e[4] = e[5] = e[6] = e[7] = e[8] = e[9] = e[10] = e[11] = e[12] = e[13] = e[14] = e[15] = 0), e[14] = this.hBytes << 3 | this.bytes >>> 29, e[15] = this.bytes << 3, this.hash();
      }
    }, B.prototype.hash = function() {
      var e = this.h0, f = this.h1, y = this.h2, a = this.h3, v = this.h4, n = this.h5, w = this.h6, i = this.h7, A = this.blocks, M, E, O, N, m, U, j, H, T, D, J;
      for (M = 16; M < 64; ++M)
        m = A[M - 15], E = (m >>> 7 | m << 25) ^ (m >>> 18 | m << 14) ^ m >>> 3, m = A[M - 2], O = (m >>> 17 | m << 15) ^ (m >>> 19 | m << 13) ^ m >>> 10, A[M] = A[M - 16] + E + A[M - 7] + O << 0;
      for (J = f & y, M = 0; M < 64; M += 4)
        this.first ? (this.is224 ? (H = 300032, m = A[0] - 1413257819, i = m - 150054599 << 0, a = m + 24177077 << 0) : (H = 704751109, m = A[0] - 210244248, i = m - 1521486534 << 0, a = m + 143694565 << 0), this.first = !1) : (E = (e >>> 2 | e << 30) ^ (e >>> 13 | e << 19) ^ (e >>> 22 | e << 10), O = (v >>> 6 | v << 26) ^ (v >>> 11 | v << 21) ^ (v >>> 25 | v << 7), H = e & f, N = H ^ e & y ^ J, j = v & n ^ ~v & w, m = i + O + j + k[M] + A[M], U = E + N, i = a + m << 0, a = m + U << 0), E = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10), O = (i >>> 6 | i << 26) ^ (i >>> 11 | i << 21) ^ (i >>> 25 | i << 7), T = a & e, N = T ^ a & f ^ H, j = i & v ^ ~i & n, m = w + O + j + k[M + 1] + A[M + 1], U = E + N, w = y + m << 0, y = m + U << 0, E = (y >>> 2 | y << 30) ^ (y >>> 13 | y << 19) ^ (y >>> 22 | y << 10), O = (w >>> 6 | w << 26) ^ (w >>> 11 | w << 21) ^ (w >>> 25 | w << 7), D = y & a, N = D ^ y & e ^ T, j = w & i ^ ~w & v, m = n + O + j + k[M + 2] + A[M + 2], U = E + N, n = f + m << 0, f = m + U << 0, E = (f >>> 2 | f << 30) ^ (f >>> 13 | f << 19) ^ (f >>> 22 | f << 10), O = (n >>> 6 | n << 26) ^ (n >>> 11 | n << 21) ^ (n >>> 25 | n << 7), J = f & y, N = J ^ f & a ^ D, j = n & w ^ ~n & i, m = v + O + j + k[M + 3] + A[M + 3], U = E + N, v = e + m << 0, e = m + U << 0, this.chromeBugWorkAround = !0;
      this.h0 = this.h0 + e << 0, this.h1 = this.h1 + f << 0, this.h2 = this.h2 + y << 0, this.h3 = this.h3 + a << 0, this.h4 = this.h4 + v << 0, this.h5 = this.h5 + n << 0, this.h6 = this.h6 + w << 0, this.h7 = this.h7 + i << 0;
    }, B.prototype.hex = function() {
      this.finalize();
      var e = this.h0, f = this.h1, y = this.h2, a = this.h3, v = this.h4, n = this.h5, w = this.h6, i = this.h7, A = r[e >>> 28 & 15] + r[e >>> 24 & 15] + r[e >>> 20 & 15] + r[e >>> 16 & 15] + r[e >>> 12 & 15] + r[e >>> 8 & 15] + r[e >>> 4 & 15] + r[e & 15] + r[f >>> 28 & 15] + r[f >>> 24 & 15] + r[f >>> 20 & 15] + r[f >>> 16 & 15] + r[f >>> 12 & 15] + r[f >>> 8 & 15] + r[f >>> 4 & 15] + r[f & 15] + r[y >>> 28 & 15] + r[y >>> 24 & 15] + r[y >>> 20 & 15] + r[y >>> 16 & 15] + r[y >>> 12 & 15] + r[y >>> 8 & 15] + r[y >>> 4 & 15] + r[y & 15] + r[a >>> 28 & 15] + r[a >>> 24 & 15] + r[a >>> 20 & 15] + r[a >>> 16 & 15] + r[a >>> 12 & 15] + r[a >>> 8 & 15] + r[a >>> 4 & 15] + r[a & 15] + r[v >>> 28 & 15] + r[v >>> 24 & 15] + r[v >>> 20 & 15] + r[v >>> 16 & 15] + r[v >>> 12 & 15] + r[v >>> 8 & 15] + r[v >>> 4 & 15] + r[v & 15] + r[n >>> 28 & 15] + r[n >>> 24 & 15] + r[n >>> 20 & 15] + r[n >>> 16 & 15] + r[n >>> 12 & 15] + r[n >>> 8 & 15] + r[n >>> 4 & 15] + r[n & 15] + r[w >>> 28 & 15] + r[w >>> 24 & 15] + r[w >>> 20 & 15] + r[w >>> 16 & 15] + r[w >>> 12 & 15] + r[w >>> 8 & 15] + r[w >>> 4 & 15] + r[w & 15];
      return this.is224 || (A += r[i >>> 28 & 15] + r[i >>> 24 & 15] + r[i >>> 20 & 15] + r[i >>> 16 & 15] + r[i >>> 12 & 15] + r[i >>> 8 & 15] + r[i >>> 4 & 15] + r[i & 15]), A;
    }, B.prototype.toString = B.prototype.hex, B.prototype.digest = function() {
      this.finalize();
      var e = this.h0, f = this.h1, y = this.h2, a = this.h3, v = this.h4, n = this.h5, w = this.h6, i = this.h7, A = [
        e >>> 24 & 255,
        e >>> 16 & 255,
        e >>> 8 & 255,
        e & 255,
        f >>> 24 & 255,
        f >>> 16 & 255,
        f >>> 8 & 255,
        f & 255,
        y >>> 24 & 255,
        y >>> 16 & 255,
        y >>> 8 & 255,
        y & 255,
        a >>> 24 & 255,
        a >>> 16 & 255,
        a >>> 8 & 255,
        a & 255,
        v >>> 24 & 255,
        v >>> 16 & 255,
        v >>> 8 & 255,
        v & 255,
        n >>> 24 & 255,
        n >>> 16 & 255,
        n >>> 8 & 255,
        n & 255,
        w >>> 24 & 255,
        w >>> 16 & 255,
        w >>> 8 & 255,
        w & 255
      ];
      return this.is224 || A.push(i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, i & 255), A;
    }, B.prototype.array = B.prototype.digest, B.prototype.arrayBuffer = function() {
      this.finalize();
      var e = /* @__PURE__ */ new ArrayBuffer(this.is224 ? 28 : 32), f = new DataView(e);
      return f.setUint32(0, this.h0), f.setUint32(4, this.h1), f.setUint32(8, this.h2), f.setUint32(12, this.h3), f.setUint32(16, this.h4), f.setUint32(20, this.h5), f.setUint32(24, this.h6), this.is224 || f.setUint32(28, this.h7), e;
    };
    function z(e, f, y) {
      var a, v = typeof e;
      if (v === "string") {
        var n = [], w = e.length, i = 0, A;
        for (a = 0; a < w; ++a)
          A = e.charCodeAt(a), A < 128 ? n[i++] = A : A < 2048 ? (n[i++] = 192 | A >>> 6, n[i++] = 128 | A & 63) : A < 55296 || A >= 57344 ? (n[i++] = 224 | A >>> 12, n[i++] = 128 | A >>> 6 & 63, n[i++] = 128 | A & 63) : (A = 65536 + ((A & 1023) << 10 | e.charCodeAt(++a) & 1023), n[i++] = 240 | A >>> 18, n[i++] = 128 | A >>> 12 & 63, n[i++] = 128 | A >>> 6 & 63, n[i++] = 128 | A & 63);
        e = n;
      } else if (v === "object") {
        if (e === null) throw new Error(c);
        if (b && e.constructor === ArrayBuffer) e = new Uint8Array(e);
        else if (!Array.isArray(e) && (!b || !ArrayBuffer.isView(e)))
          throw new Error(c);
      } else throw new Error(c);
      e.length > 64 && (e = new B(f, !0).update(e).array());
      var M = [], E = [];
      for (a = 0; a < 64; ++a) {
        var O = e[a] || 0;
        M[a] = 92 ^ O, E[a] = 54 ^ O;
      }
      B.call(this, f, y), this.update(E), this.oKeyPad = M, this.inner = !0, this.sharedMemory = y;
    }
    z.prototype = new B(), z.prototype.finalize = function() {
      if (B.prototype.finalize.call(this), this.inner) {
        this.inner = !1;
        var e = this.array();
        B.call(this, this.is224, this.sharedMemory), this.update(this.oKeyPad), this.update(e), B.prototype.finalize.call(this);
      }
    };
    var I = K();
    I.sha256 = I, I.sha224 = K(!0), I.sha256.hmac = G(), I.sha224.hmac = G(!0), l ? h.exports = I : (s.sha256 = I.sha256, s.sha224 = I.sha224, u && define(function() {
      return I;
    }));
  })();
})), st = rt(), Z = "atlas";
function ft(t) {
  return t ? `map:${(0, st.sha256)(t)}` : Z;
}
var ct = Object.freeze({
  frame: Z,
  scale: 1,
  offset: [0, 0]
});
function W(t, h) {
  return [t[0] * h.scale + h.offset[0], t[1] * h.scale + h.offset[1]];
}
function ut(t) {
  const h = new Map(t.map((s) => [s.id, s])), c = /* @__PURE__ */ new Map();
  function d(s) {
    if (c.has(s)) return c.get(s);
    const p = s, o = /* @__PURE__ */ new Map();
    let l = 1, u = [0, 0];
    for (; !o.has(s); ) {
      o.set(s, {
        frame: s,
        scale: l,
        offset: u
      });
      const b = h.get(s)?.mapping;
      if (!b) break;
      u = W(u, b), l *= b.scale, s = b.frame;
    }
    return c.set(p, o), o;
  }
  return (s, p) => {
    if (!h.has(s) || !h.has(p)) return null;
    const o = d(s);
    for (const [l, u] of d(p)) {
      const b = o.get(l);
      if (b) {
        const r = b.scale / u.scale, _ = [(b.offset[0] - u.offset[0]) / u.scale, (b.offset[1] - u.offset[1]) / u.scale];
        return ![r, ..._].every(Number.isFinite) || r <= 0 ? null : {
          frame: p,
          scale: r,
          offset: _
        };
      }
    }
    return null;
  };
}
function C(t) {
  return t.shape === "rect" || t.shape === "circle" || (t.shape === "path" || t.shape === "curve") && t.closed === !0;
}
function F(t) {
  if (t.shape === "rect") return [
    [t.x, t.y],
    [t.x + t.width, t.y],
    [t.x + t.width, t.y + t.height],
    [t.x, t.y + t.height]
  ];
  if (t.shape === "point") return [[t.x, t.y]];
  if (t.shape === "circle") return Array.from({ length: 64 }, (s, p) => [t.x + t.radius * Math.cos(p * Math.PI / 32), t.y + t.radius * Math.sin(p * Math.PI / 32)]);
  if (t.shape === "path") return t.points;
  const h = [], c = t.points.length, d = (s) => t.points[t.closed ? (s + c) % c : Math.max(0, Math.min(c - 1, s))];
  for (let s = 0; s < c - (t.closed ? 0 : 1); s++) {
    const p = d(s - 1), o = d(s), l = d(s + 1), u = d(s + 2);
    for (let b = 0; b < 8; b++) {
      const r = b / 8;
      h.push([0, 1].map((_) => 0.5 * (2 * o[_] + (-p[_] + l[_]) * r + (2 * p[_] - 5 * o[_] + 4 * l[_] - u[_]) * r * r + (-p[_] + 3 * o[_] - 3 * l[_] + u[_]) * r * r * r)));
    }
  }
  return t.closed || h.push(t.points[c - 1]), h;
}
function lt(t, h) {
  if ("points" in t) return {
    ...t,
    points: t.points.map((s) => W(s, h)),
    ...t.width === void 0 ? {} : { width: t.width * h.scale }
  };
  const [c, d] = W([t.x, t.y], h);
  return t.shape === "rect" ? {
    ...t,
    x: c,
    y: d,
    width: t.width * h.scale,
    height: t.height * h.scale
  } : t.shape === "circle" ? {
    ...t,
    x: c,
    y: d,
    radius: t.radius * h.scale
  } : {
    ...t,
    x: c,
    y: d
  };
}
function V(t, h = 0) {
  let c = 1 / 0, d = 1 / 0, s = -1 / 0, p = -1 / 0;
  for (const [o, l] of t)
    c = Math.min(c, o), d = Math.min(d, l), s = Math.max(s, o), p = Math.max(p, l);
  return [
    c - h,
    d - h,
    s - c + 2 * h,
    p - d + 2 * h
  ];
}
function X(t) {
  return V(F(t), (t.shape === "path" || t.shape === "curve") && !t.closed ? (t.width || 0) / 2 : 0);
}
function g(t, h) {
  return t[0] <= h[0] + h[2] && h[0] <= t[0] + t[2] && t[1] <= h[1] + h[3] && h[1] <= t[1] + t[3];
}
function P(t, h) {
  return it(h)(t);
}
function it(t) {
  const h = F(t), c = C(t);
  return (d) => {
    if (!c) {
      const p = t.shape === "path" || t.shape === "curve" ? (t.width || 0) / 2 : 0;
      for (let o = 1; o < h.length; o++) {
        const l = h[o - 1], u = h[o], b = u[0] - l[0], r = u[1] - l[1], _ = Math.max(0, Math.min(1, ((d[0] - l[0]) * b + (d[1] - l[1]) * r) / (b * b + r * r || 1)));
        if (Math.hypot(d[0] - l[0] - _ * b, d[1] - l[1] - _ * r) <= p) return !0;
      }
      return !1;
    }
    let s = !1;
    for (let p = 0, o = h.length - 1; p < h.length; o = p++) {
      const l = h[p], u = h[o];
      l[1] > d[1] != u[1] > d[1] && d[0] < (u[0] - l[0]) * (d[1] - l[1]) / (u[1] - l[1]) + l[0] && (s = !s);
    }
    return s;
  };
}
function tt(t, h, c, d) {
  const s = h[0] - t[0], p = h[1] - t[1], o = d[0] - c[0], l = d[1] - c[1], u = s * l - p * o;
  if (!u) return null;
  const b = ((c[0] - t[0]) * l - (c[1] - t[1]) * o) / u, r = ((c[0] - t[0]) * p - (c[1] - t[1]) * s) / u;
  return b >= 0 && b <= 1 && r >= 0 && r <= 1 ? [t[0] + b * s, t[1] + b * p] : null;
}
function nt(t, h, c, d) {
  const s = d[0] - c[0], p = d[1] - c[1], o = c[0] - t[0], l = c[1] - t[1], u = s * s + p * p, b = 2 * (o * s + l * p), r = o * o + l * l - h * h, _ = b * b - 4 * u * r;
  return !u || _ < 0 ? [] : [(-b - Math.sqrt(_)) / (2 * u), (-b + Math.sqrt(_)) / (2 * u)].filter((x) => x >= 0 && x <= 1).map((x) => [c[0] + s * x, c[1] + p * x]);
}
function ht(t, h, c) {
  const d = F(t), s = F(h), p = s.filter((o) => P(o, t));
  for (const o of d) {
    const l = [
      [o[0] - c, o[1]],
      [o[0] + c, o[1]],
      [o[0], o[1] - c],
      [o[0], o[1] + c]
    ];
    p.push(...l.filter((u) => P(u, h)));
    for (let u = 0; u < s.length; u++) p.push(...nt(o, c, s[u], s[(u + 1) % s.length]));
  }
  for (let o = 1; o < d.length; o++) {
    const l = d[o - 1], u = d[o], b = Math.hypot(u[0] - l[0], u[1] - l[1]);
    if (!b) continue;
    const r = -(u[1] - l[1]) / b * c, _ = (u[0] - l[0]) / b * c, x = [
      [l[0] + r, l[1] + _],
      [u[0] + r, u[1] + _],
      [u[0] - r, u[1] - _],
      [l[0] - r, l[1] - _]
    ];
    p.push(...x.filter((k) => P(k, h)));
    for (let k = 0; k < x.length; k++) for (let R = 0; R < s.length; R++) {
      const S = tt(x[k], x[(k + 1) % x.length], s[R], s[(R + 1) % s.length]);
      S && p.push(S);
    }
  }
  return p;
}
function dt(t, h) {
  const c = X(t);
  if (!h) return c;
  const d = X(h);
  if (!g(c, d)) return null;
  const s = (t.shape === "path" || t.shape === "curve") && !t.closed ? (t.width || 0) / 2 : 0;
  if (s) {
    const u = ht(t, h, s);
    if (!u.length) return null;
    const b = V(u), r = Math.max(b[0], d[0]), _ = Math.max(b[1], d[1]);
    return [
      r,
      _,
      Math.max(0, Math.min(b[0] + b[2], d[0] + d[2]) - r),
      Math.max(0, Math.min(b[1] + b[3], d[1] + d[3]) - _)
    ];
  }
  const p = F(t), o = F(h), l = p.filter((u) => P(u, h));
  C(t) && l.push(...o.filter((u) => P(u, t)));
  for (let u = 0; u < p.length - (C(t) ? 0 : 1); u++) for (let b = 0; b < o.length; b++) {
    const r = tt(p[u], p[(u + 1) % p.length], o[b], o[(b + 1) % o.length]);
    r && l.push(r);
  }
  return l.length ? V(l) : null;
}
var $ = {
  environment: 0,
  surface: 1,
  cover: 2,
  relief: 3,
  channel: 4,
  structure: 5,
  zone: 6,
  landmark: 7,
  boundary: 8
};
function pt(t) {
  const h = [...t].sort((p, o) => $[p.source.role] - $[o.source.role] || p.source.id.localeCompare(o.source.id)), c = /* @__PURE__ */ new Set(), d = [], s = new Set(h.map((p) => p.source.id));
  for (; h.length; ) {
    const p = h.findIndex((l) => [l.source.support, ...l.source.crosses || []].every((u) => !u || !s.has(u) || c.has(u)));
    if (p < 0) throw new Error("space_support_cycle");
    const o = h.splice(p, 1)[0];
    c.add(o.source.id), d.push(o);
  }
  return d;
}
function at(t, h) {
  const c = t.source;
  return h.filter((d) => {
    const s = d.source;
    return !g(t.bounds, d.bounds) || c.id === s.id || c.support !== s.support || c.crosses?.includes(s.id) ? !1 : s.material === "water" && s.role !== "environment" && c.material !== "water" && [
      "surface",
      "cover",
      "relief",
      "structure"
    ].includes(c.role) ? !0 : [
      "scattered",
      "compact",
      "blocks",
      "towers"
    ].includes(c.form || "") ? s.role === "channel" || s.role === "cover" || s.role === "structure" && !!s.destination && C(s.geometry) : !1;
  });
}
function bt(t, h) {
  const c = [t.geometry], d = [], s = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set();
  let o = t;
  for (; o; ) {
    if (s.has(o.source.id)) throw new Error("space_support_cycle");
    s.add(o.source.id);
    for (const l of o.source.crosses || []) p.add(l);
    d.push(...at(o, h)), o = h.find((l) => l.source.id === o.source.support), o && c.push(o.geometry);
  }
  return {
    intersections: c,
    exclusions: [...new Map(d.filter((l) => !p.has(l.source.id)).map((l) => [l.source.id, l])).values()]
  };
}
var yt = {
  unknown: {
    base: "#dbe3ea",
    ink: "#657d8f",
    light: "#f7fafc"
  },
  wood: {
    base: "#cea77d",
    ink: "#896345",
    light: "#edcdaa"
  },
  stone: {
    base: "#c0c9c8",
    ink: "#768c91",
    light: "#f1f2e7"
  },
  tile: {
    base: "#d6dbe5",
    ink: "#96a2b5",
    light: "#f7f7ff"
  },
  carpet: {
    base: "#c59cb4",
    ink: "#8a637b",
    light: "#eacbdf"
  },
  "bed-sheet": {
    base: "#e7dce8",
    ink: "#ab96b0",
    light: "#fff5fa"
  },
  fabric: {
    base: "#cab6d8",
    ink: "#91749f",
    light: "#e9d8f3"
  },
  tatami: {
    base: "#cdd3a8",
    ink: "#8e9762",
    light: "#e7eacd"
  },
  sand: {
    base: "#e4c28b",
    ink: "#ae754d",
    light: "#fff0c7"
  },
  marble: {
    base: "#ecedf4",
    ink: "#a9b4c9",
    light: "#ffffff"
  },
  blood: {
    base: "#c77780",
    ink: "#853d51",
    light: "#efa3a4"
  },
  water: {
    base: "#71bbc9",
    ink: "#397a99",
    light: "#d3eff0"
  },
  grass: {
    base: "#d1dfba",
    ink: "#8da987",
    light: "#eff0d5"
  },
  forest: {
    base: "#73997d",
    ink: "#365e52",
    light: "#bace9e"
  },
  glass: {
    base: "#b9e5e5",
    ink: "#6daeb6",
    light: "#ecffff"
  },
  dirt: {
    base: "#d4bb9c",
    ink: "#a18766",
    light: "#ead7b9"
  },
  snow: {
    base: "#eaf6fc",
    ink: "#9dbecf",
    light: "#ffffff"
  },
  metal: {
    base: "#a8bfd2",
    ink: "#587b98",
    light: "#e0edf8"
  },
  rune: {
    base: "#c4b2ef",
    ink: "#8068bd",
    light: "#ece2ff"
  },
  "warm-light": {
    base: "#ffe0a1",
    ink: "#d6a45b",
    light: "#fff8d8"
  },
  "cold-light": {
    base: "#b6e8ff",
    ink: "#6daecb",
    light: "#edfbff"
  },
  shadow: {
    base: "#9e9bba",
    ink: "#615b83",
    light: "#c8c7df"
  },
  vacuum: {
    base: "#101d32",
    ink: "#182b49",
    light: "#b8d4ed"
  },
  rock: {
    base: "#b5b7a7",
    ink: "#616e68",
    light: "#ebe9d8"
  },
  ice: {
    base: "#c6eaf1",
    ink: "#74b3cd",
    light: "#f0ffff"
  },
  cloud: {
    base: "#d4d9f0",
    ink: "#939fc6",
    light: "#f6f6ff"
  },
  lava: {
    base: "#f5a274",
    ink: "#ba624e",
    light: "#ffdf91"
  }
};
export {
  g as a,
  C as c,
  P as d,
  lt as f,
  W as g,
  ft as h,
  pt as i,
  it as l,
  ut as m,
  bt as n,
  dt as o,
  Z as p,
  at as r,
  X as s,
  yt as t,
  F as u
};
