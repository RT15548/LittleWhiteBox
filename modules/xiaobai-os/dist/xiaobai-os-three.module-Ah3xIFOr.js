/* eslint-disable */
var wd = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2
}, Rd = {
  ROTATE: 0,
  PAN: 1,
  DOLLY_PAN: 2,
  DOLLY_ROTATE: 3
};
var vl = "attached";
var us = 1e3, Tn = 1001, fs = 1002, Ht = 1003, _l = 1004, xl = 1005, An = 1006, yl = 1007, Ms = 1008, Kn = 1009, Ml = 1010, Sl = 1011, El = 1012, Tl = 1013, Ss = 1014, Ri = 1015, Es = 1016, bl = 1017, Al = 1018, wl = 1020, Rl = 35902, Cl = 35899, Pl = 1021, Ll = 1022, $n = 1023, io = 1026, ro = 1027, so = 1028, Il = 1029, Ul = 1030, Dl = 1031, Nl = 1033, Ol = 33776, Fl = 33777, Bl = 33778, zl = 33779, Vl = 35840, Hl = 35841, kl = 35842, Gl = 35843, Wl = 36196, Xl = 37492, ql = 37496, Yl = 37808, Jl = 37809, Zl = 37810, Kl = 37811, $l = 37812, jl = 37813, Ql = 37814, ec = 37815, tc = 37816, nc = 37817, ic = 37818, rc = 37819, sc = 37820, ac = 37821, oc = 36492, lc = 36494, cc = 36495, hc = 36283, uc = 36284, fc = 36285, dc = 36286, dr = 2300, ds = 2301, Ar = 2302, zs = 2400, Vs = 2401, Hs = 2402, pc = 2500, mc = 3200, gc = 3201;
var zt = "srgb", Si = "srgb-linear", pr = "linear", mr = "srgb", wr = 7680;
var ao = 35044;
var jn = 2e3;
var Cn = class {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0) return;
    const i = n[e];
    if (i !== void 0) {
      const r = i.indexOf(t);
      r !== -1 && i.splice(r, 1);
    }
  }
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0) return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const i = n.slice(0);
      for (let r = 0, s = i.length; r < s; r++) i[r].call(this, e);
      e.target = null;
    }
  }
}, _t = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "0a",
  "0b",
  "0c",
  "0d",
  "0e",
  "0f",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "1a",
  "1b",
  "1c",
  "1d",
  "1e",
  "1f",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "2a",
  "2b",
  "2c",
  "2d",
  "2e",
  "2f",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "3a",
  "3b",
  "3c",
  "3d",
  "3e",
  "3f",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "4a",
  "4b",
  "4c",
  "4d",
  "4e",
  "4f",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "5a",
  "5b",
  "5c",
  "5d",
  "5e",
  "5f",
  "60",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "6a",
  "6b",
  "6c",
  "6d",
  "6e",
  "6f",
  "70",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "78",
  "79",
  "7a",
  "7b",
  "7c",
  "7d",
  "7e",
  "7f",
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "8a",
  "8b",
  "8c",
  "8d",
  "8e",
  "8f",
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
  "9a",
  "9b",
  "9c",
  "9d",
  "9e",
  "9f",
  "a0",
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "a8",
  "a9",
  "aa",
  "ab",
  "ac",
  "ad",
  "ae",
  "af",
  "b0",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b7",
  "b8",
  "b9",
  "ba",
  "bb",
  "bc",
  "bd",
  "be",
  "bf",
  "c0",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "ca",
  "cb",
  "cc",
  "cd",
  "ce",
  "cf",
  "d0",
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "d9",
  "da",
  "db",
  "dc",
  "dd",
  "de",
  "df",
  "e0",
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "e9",
  "ea",
  "eb",
  "ec",
  "ed",
  "ee",
  "ef",
  "f0",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "fa",
  "fb",
  "fc",
  "fd",
  "fe",
  "ff"
], ks = 1234567, _i = Math.PI / 180, Qn = 180 / Math.PI;
function Lt() {
  const e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0, i = Math.random() * 4294967295 | 0;
  return (_t[e & 255] + _t[e >> 8 & 255] + _t[e >> 16 & 255] + _t[e >> 24 & 255] + "-" + _t[t & 255] + _t[t >> 8 & 255] + "-" + _t[t >> 16 & 15 | 64] + _t[t >> 24 & 255] + "-" + _t[n & 63 | 128] + _t[n >> 8 & 255] + "-" + _t[n >> 16 & 255] + _t[n >> 24 & 255] + _t[i & 255] + _t[i >> 8 & 255] + _t[i >> 16 & 255] + _t[i >> 24 & 255]).toLowerCase();
}
function Ve(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function Ts(e, t) {
  return (e % t + t) % t;
}
function vc(e, t, n, i, r) {
  return i + (e - t) * (r - i) / (n - t);
}
function _c(e, t, n) {
  return e !== t ? (n - e) / (t - e) : 0;
}
function xi(e, t, n) {
  return (1 - n) * e + n * t;
}
function xc(e, t, n, i) {
  return xi(e, t, 1 - Math.exp(-n * i));
}
function yc(e, t = 1) {
  return t - Math.abs(Ts(e, t * 2) - t);
}
function Mc(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * (3 - 2 * e));
}
function Sc(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * e * (e * (e * 6 - 15) + 10));
}
function Ec(e, t) {
  return e + Math.floor(Math.random() * (t - e + 1));
}
function Tc(e, t) {
  return e + Math.random() * (t - e);
}
function bc(e) {
  return e * (0.5 - Math.random());
}
function Ac(e) {
  e !== void 0 && (ks = e);
  let t = ks += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function wc(e) {
  return e * _i;
}
function Rc(e) {
  return e * Qn;
}
function Cc(e) {
  return (e & e - 1) === 0 && e !== 0;
}
function Pc(e) {
  return Math.pow(2, Math.ceil(Math.log(e) / Math.LN2));
}
function Lc(e) {
  return Math.pow(2, Math.floor(Math.log(e) / Math.LN2));
}
function Ic(e, t, n, i, r) {
  const s = Math.cos, a = Math.sin, o = s(n / 2), l = a(n / 2), c = s((t + i) / 2), h = a((t + i) / 2), u = s((t - i) / 2), f = a((t - i) / 2), p = s((i - t) / 2), v = a((i - t) / 2);
  switch (r) {
    case "XYX":
      e.set(o * h, l * u, l * f, o * c);
      break;
    case "YZY":
      e.set(l * f, o * h, l * u, o * c);
      break;
    case "ZXZ":
      e.set(l * u, l * f, o * h, o * c);
      break;
    case "XZX":
      e.set(o * h, l * v, l * p, o * c);
      break;
    case "YXY":
      e.set(l * p, o * h, l * v, o * c);
      break;
    case "ZYZ":
      e.set(l * v, l * p, o * h, o * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + r);
  }
}
function Vt(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return e / 4294967295;
    case Uint16Array:
      return e / 65535;
    case Uint8Array:
      return e / 255;
    case Int32Array:
      return Math.max(e / 2147483647, -1);
    case Int16Array:
      return Math.max(e / 32767, -1);
    case Int8Array:
      return Math.max(e / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Qe(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return Math.round(e * 4294967295);
    case Uint16Array:
      return Math.round(e * 65535);
    case Uint8Array:
      return Math.round(e * 255);
    case Int32Array:
      return Math.round(e * 2147483647);
    case Int16Array:
      return Math.round(e * 32767);
    case Int8Array:
      return Math.round(e * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
var Cd = {
  DEG2RAD: _i,
  RAD2DEG: Qn,
  generateUUID: Lt,
  clamp: Ve,
  euclideanModulo: Ts,
  mapLinear: vc,
  inverseLerp: _c,
  lerp: xi,
  damp: xc,
  pingpong: yc,
  smoothstep: Mc,
  smootherstep: Sc,
  randInt: Ec,
  randFloat: Tc,
  randFloatSpread: bc,
  seededRandom: Ac,
  degToRad: wc,
  radToDeg: Rc,
  isPowerOfTwo: Cc,
  ceilPowerOfTwo: Pc,
  floorPowerOfTwo: Lc,
  setQuaternionFromProperEuler: Ic,
  normalize: Qe,
  denormalize: Vt
}, oe = class oo {
  constructor(t = 0, n = 0) {
    oo.prototype.isVector2 = !0, this.x = t, this.y = n;
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, n) {
    return this.x = t, this.y = n, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    const n = this.x, i = this.y, r = t.elements;
    return this.x = r[0] * n + r[3] * i + r[6], this.y = r[1] * n + r[4] * i + r[7], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
  }
  clamp(t, n) {
    return this.x = Ve(this.x, t.x, n.x), this.y = Ve(this.y, t.y, n.y), this;
  }
  clampScalar(t, n) {
    return this.x = Ve(this.x, t, n), this.y = Ve(this.y, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Ve(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    const n = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (n === 0) return Math.PI / 2;
    const i = this.dot(t) / n;
    return Math.acos(Ve(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const n = this.x - t.x, i = this.y - t.y;
    return n * n + i * i;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this;
  }
  rotateAround(t, n) {
    const i = Math.cos(n), r = Math.sin(n), s = this.x - t.x, a = this.y - t.y;
    return this.x = s * i - a * r + t.x, this.y = s * r + a * i + t.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}, ni = class {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i;
  }
  static slerpFlat(e, t, n, i, r, s, a) {
    let o = n[i + 0], l = n[i + 1], c = n[i + 2], h = n[i + 3];
    const u = r[s + 0], f = r[s + 1], p = r[s + 2], v = r[s + 3];
    if (a === 0) {
      e[t + 0] = o, e[t + 1] = l, e[t + 2] = c, e[t + 3] = h;
      return;
    }
    if (a === 1) {
      e[t + 0] = u, e[t + 1] = f, e[t + 2] = p, e[t + 3] = v;
      return;
    }
    if (h !== v || o !== u || l !== f || c !== p) {
      let g = 1 - a;
      const m = o * u + l * f + c * p + h * v, d = m >= 0 ? 1 : -1, T = 1 - m * m;
      if (T > Number.EPSILON) {
        const S = Math.sqrt(T), L = Math.atan2(S, m * d);
        g = Math.sin(g * L) / S, a = Math.sin(a * L) / S;
      }
      const _ = a * d;
      if (o = o * g + u * _, l = l * g + f * _, c = c * g + p * _, h = h * g + v * _, g === 1 - a) {
        const S = 1 / Math.sqrt(o * o + l * l + c * c + h * h);
        o *= S, l *= S, c *= S, h *= S;
      }
    }
    e[t] = o, e[t + 1] = l, e[t + 2] = c, e[t + 3] = h;
  }
  static multiplyQuaternionsFlat(e, t, n, i, r, s) {
    const a = n[i], o = n[i + 1], l = n[i + 2], c = n[i + 3], h = r[s], u = r[s + 1], f = r[s + 2], p = r[s + 3];
    return e[t] = a * p + c * h + o * f - l * u, e[t + 1] = o * p + c * u + l * h - a * f, e[t + 2] = l * p + c * f + a * u - o * h, e[t + 3] = c * p - a * h - o * u - l * f, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, n, i) {
    return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const n = e._x, i = e._y, r = e._z, s = e._order, a = Math.cos, o = Math.sin, l = a(n / 2), c = a(i / 2), h = a(r / 2), u = o(n / 2), f = o(i / 2), p = o(r / 2);
    switch (s) {
      case "XYZ":
        this._x = u * c * h + l * f * p, this._y = l * f * h - u * c * p, this._z = l * c * p + u * f * h, this._w = l * c * h - u * f * p;
        break;
      case "YXZ":
        this._x = u * c * h + l * f * p, this._y = l * f * h - u * c * p, this._z = l * c * p - u * f * h, this._w = l * c * h + u * f * p;
        break;
      case "ZXY":
        this._x = u * c * h - l * f * p, this._y = l * f * h + u * c * p, this._z = l * c * p + u * f * h, this._w = l * c * h - u * f * p;
        break;
      case "ZYX":
        this._x = u * c * h - l * f * p, this._y = l * f * h + u * c * p, this._z = l * c * p - u * f * h, this._w = l * c * h + u * f * p;
        break;
      case "YZX":
        this._x = u * c * h + l * f * p, this._y = l * f * h + u * c * p, this._z = l * c * p - u * f * h, this._w = l * c * h - u * f * p;
        break;
      case "XZY":
        this._x = u * c * h - l * f * p, this._y = l * f * h - u * c * p, this._z = l * c * p + u * f * h, this._w = l * c * h + u * f * p;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + s);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2, i = Math.sin(n);
    return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], i = t[4], r = t[8], s = t[1], a = t[5], o = t[9], l = t[2], c = t[6], h = t[10], u = n + a + h;
    if (u > 0) {
      const f = 0.5 / Math.sqrt(u + 1);
      this._w = 0.25 / f, this._x = (c - o) * f, this._y = (r - l) * f, this._z = (s - i) * f;
    } else if (n > a && n > h) {
      const f = 2 * Math.sqrt(1 + n - a - h);
      this._w = (c - o) / f, this._x = 0.25 * f, this._y = (i + s) / f, this._z = (r + l) / f;
    } else if (a > h) {
      const f = 2 * Math.sqrt(1 + a - n - h);
      this._w = (r - l) / f, this._x = (i + s) / f, this._y = 0.25 * f, this._z = (o + c) / f;
    } else {
      const f = 2 * Math.sqrt(1 + h - n - a);
      this._w = (s - i) / f, this._x = (r + l) / f, this._y = (o + c) / f, this._z = 0.25 * f;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Ve(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const i = Math.min(1, t / n);
    return this.slerp(e, i), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x, i = e._y, r = e._z, s = e._w, a = t._x, o = t._y, l = t._z, c = t._w;
    return this._x = n * c + s * a + i * l - r * o, this._y = i * c + s * o + r * a - n * l, this._z = r * c + s * l + n * o - i * a, this._w = s * c - n * a - i * o - r * l, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x, i = this._y, r = this._z, s = this._w;
    let a = s * e._w + n * e._x + i * e._y + r * e._z;
    if (a < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, a = -a) : this.copy(e), a >= 1)
      return this._w = s, this._x = n, this._y = i, this._z = r, this;
    const o = 1 - a * a;
    if (o <= Number.EPSILON) {
      const f = 1 - t;
      return this._w = f * s + t * this._w, this._x = f * n + t * this._x, this._y = f * i + t * this._y, this._z = f * r + t * this._z, this.normalize(), this;
    }
    const l = Math.sqrt(o), c = Math.atan2(l, a), h = Math.sin((1 - t) * c) / l, u = Math.sin(t * c) / l;
    return this._w = s * h + this._w * u, this._x = n * h + this._x * u, this._y = i * h + this._y * u, this._z = r * h + this._z * u, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), i = Math.sqrt(1 - n), r = Math.sqrt(n);
    return this.set(i * Math.sin(e), i * Math.cos(e), r * Math.sin(t), r * Math.cos(t));
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}, P = class lo {
  constructor(t = 0, n = 0, i = 0) {
    lo.prototype.isVector3 = !0, this.x = t, this.y = n, this.z = i;
  }
  set(t, n, i) {
    return i === void 0 && (i = this.z), this.x = t, this.y = n, this.z = i, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      case 2:
        this.z = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this.z = t.z + n.z, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this.z += t.z * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this.z = t.z - n.z, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  multiplyVectors(t, n) {
    return this.x = t.x * n.x, this.y = t.y * n.y, this.z = t.z * n.z, this;
  }
  applyEuler(t) {
    return this.applyQuaternion(Gs.setFromEuler(t));
  }
  applyAxisAngle(t, n) {
    return this.applyQuaternion(Gs.setFromAxisAngle(t, n));
  }
  applyMatrix3(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * n + s[3] * i + s[6] * r, this.y = s[1] * n + s[4] * i + s[7] * r, this.z = s[2] * n + s[5] * i + s[8] * r, this;
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements, a = 1 / (s[3] * n + s[7] * i + s[11] * r + s[15]);
    return this.x = (s[0] * n + s[4] * i + s[8] * r + s[12]) * a, this.y = (s[1] * n + s[5] * i + s[9] * r + s[13]) * a, this.z = (s[2] * n + s[6] * i + s[10] * r + s[14]) * a, this;
  }
  applyQuaternion(t) {
    const n = this.x, i = this.y, r = this.z, s = t.x, a = t.y, o = t.z, l = t.w, c = 2 * (a * r - o * i), h = 2 * (o * n - s * r), u = 2 * (s * i - a * n);
    return this.x = n + l * c + a * u - o * h, this.y = i + l * h + o * c - s * u, this.z = r + l * u + s * h - a * c, this;
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
  }
  transformDirection(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * n + s[4] * i + s[8] * r, this.y = s[1] * n + s[5] * i + s[9] * r, this.z = s[2] * n + s[6] * i + s[10] * r, this.normalize();
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
  }
  clamp(t, n) {
    return this.x = Ve(this.x, t.x, n.x), this.y = Ve(this.y, t.y, n.y), this.z = Ve(this.z, t.z, n.z), this;
  }
  clampScalar(t, n) {
    return this.x = Ve(this.x, t, n), this.y = Ve(this.y, t, n), this.z = Ve(this.z, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Ve(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this.z += (t.z - this.z) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this.z = t.z + (n.z - t.z) * i, this;
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, n) {
    const i = t.x, r = t.y, s = t.z, a = n.x, o = n.y, l = n.z;
    return this.x = r * l - s * o, this.y = s * a - i * l, this.z = i * o - r * a, this;
  }
  projectOnVector(t) {
    const n = t.lengthSq();
    if (n === 0) return this.set(0, 0, 0);
    const i = t.dot(this) / n;
    return this.copy(t).multiplyScalar(i);
  }
  projectOnPlane(t) {
    return Rr.copy(this).projectOnVector(t), this.sub(Rr);
  }
  reflect(t) {
    return this.sub(Rr.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const n = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (n === 0) return Math.PI / 2;
    const i = this.dot(t) / n;
    return Math.acos(Ve(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const n = this.x - t.x, i = this.y - t.y, r = this.z - t.z;
    return n * n + i * i + r * r;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, n, i) {
    const r = Math.sin(n) * t;
    return this.x = r * Math.sin(i), this.y = Math.cos(n) * t, this.z = r * Math.cos(i), this;
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, n, i) {
    return this.x = t * Math.sin(n), this.y = i, this.z = t * Math.cos(n), this;
  }
  setFromMatrixPosition(t) {
    const n = t.elements;
    return this.x = n[12], this.y = n[13], this.z = n[14], this;
  }
  setFromMatrixScale(t) {
    const n = this.setFromMatrixColumn(t, 0).length(), i = this.setFromMatrixColumn(t, 1).length(), r = this.setFromMatrixColumn(t, 2).length();
    return this.x = n, this.y = i, this.z = r, this;
  }
  setFromMatrixColumn(t, n) {
    return this.fromArray(t.elements, n * 4);
  }
  setFromMatrix3Column(t, n) {
    return this.fromArray(t.elements, n * 3);
  }
  setFromEuler(t) {
    return this.x = t._x, this.y = t._y, this.z = t._z, this;
  }
  setFromColor(t) {
    return this.x = t.r, this.y = t.g, this.z = t.b, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this.z = t[n + 2], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t[n + 2] = this.z, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this.z = t.getZ(n), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const t = Math.random() * Math.PI * 2, n = Math.random() * 2 - 1, i = Math.sqrt(1 - n * n);
    return this.x = i * Math.cos(t), this.y = n, this.z = i * Math.sin(t), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}, Rr = /* @__PURE__ */ new P(), Gs = /* @__PURE__ */ new ni(), Xe = class co {
  constructor(t, n, i, r, s, a, o, l, c) {
    co.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, n, i, r, s, a, o, l, c);
  }
  set(t, n, i, r, s, a, o, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = r, h[2] = o, h[3] = n, h[4] = s, h[5] = l, h[6] = i, h[7] = a, h[8] = c, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
  }
  copy(t) {
    const n = this.elements, i = t.elements;
    return n[0] = i[0], n[1] = i[1], n[2] = i[2], n[3] = i[3], n[4] = i[4], n[5] = i[5], n[6] = i[6], n[7] = i[7], n[8] = i[8], this;
  }
  extractBasis(t, n, i) {
    return t.setFromMatrix3Column(this, 0), n.setFromMatrix3Column(this, 1), i.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(t) {
    const n = t.elements;
    return this.set(n[0], n[4], n[8], n[1], n[5], n[9], n[2], n[6], n[10]), this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, n) {
    const i = t.elements, r = n.elements, s = this.elements, a = i[0], o = i[3], l = i[6], c = i[1], h = i[4], u = i[7], f = i[2], p = i[5], v = i[8], g = r[0], m = r[3], d = r[6], T = r[1], _ = r[4], S = r[7], L = r[2], A = r[5], C = r[8];
    return s[0] = a * g + o * T + l * L, s[3] = a * m + o * _ + l * A, s[6] = a * d + o * S + l * C, s[1] = c * g + h * T + u * L, s[4] = c * m + h * _ + u * A, s[7] = c * d + h * S + u * C, s[2] = f * g + p * T + v * L, s[5] = f * m + p * _ + v * A, s[8] = f * d + p * S + v * C, this;
  }
  multiplyScalar(t) {
    const n = this.elements;
    return n[0] *= t, n[3] *= t, n[6] *= t, n[1] *= t, n[4] *= t, n[7] *= t, n[2] *= t, n[5] *= t, n[8] *= t, this;
  }
  determinant() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8];
    return n * a * h - n * o * c - i * s * h + i * o * l + r * s * c - r * a * l;
  }
  invert() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], u = h * a - o * c, f = o * l - h * s, p = c * s - a * l, v = n * u + i * f + r * p;
    if (v === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const g = 1 / v;
    return t[0] = u * g, t[1] = (r * c - h * i) * g, t[2] = (o * i - r * a) * g, t[3] = f * g, t[4] = (h * n - r * l) * g, t[5] = (r * s - o * n) * g, t[6] = p * g, t[7] = (i * l - c * n) * g, t[8] = (a * n - i * s) * g, this;
  }
  transpose() {
    let t;
    const n = this.elements;
    return t = n[1], n[1] = n[3], n[3] = t, t = n[2], n[2] = n[6], n[6] = t, t = n[5], n[5] = n[7], n[7] = t, this;
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    const n = this.elements;
    return t[0] = n[0], t[1] = n[3], t[2] = n[6], t[3] = n[1], t[4] = n[4], t[5] = n[7], t[6] = n[2], t[7] = n[5], t[8] = n[8], this;
  }
  setUvTransform(t, n, i, r, s, a, o) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(i * l, i * c, -i * (l * a + c * o) + a + t, -r * c, r * l, -r * (-c * a + l * o) + o + n, 0, 0, 1), this;
  }
  scale(t, n) {
    return this.premultiply(Cr.makeScale(t, n)), this;
  }
  rotate(t) {
    return this.premultiply(Cr.makeRotation(-t)), this;
  }
  translate(t, n) {
    return this.premultiply(Cr.makeTranslation(t, n)), this;
  }
  makeTranslation(t, n) {
    return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, n, 0, 0, 1), this;
  }
  makeRotation(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, -i, 0, i, n, 0, 0, 0, 1), this;
  }
  makeScale(t, n) {
    return this.set(t, 0, 0, 0, n, 0, 0, 0, 1), this;
  }
  equals(t) {
    const n = this.elements, i = t.elements;
    for (let r = 0; r < 9; r++) if (n[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(t, n = 0) {
    for (let i = 0; i < 9; i++) this.elements[i] = t[i + n];
    return this;
  }
  toArray(t = [], n = 0) {
    const i = this.elements;
    return t[n] = i[0], t[n + 1] = i[1], t[n + 2] = i[2], t[n + 3] = i[3], t[n + 4] = i[4], t[n + 5] = i[5], t[n + 6] = i[6], t[n + 7] = i[7], t[n + 8] = i[8], t;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}, Cr = /* @__PURE__ */ new Xe();
function ho(e) {
  for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
  return !1;
}
function Ei(e) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", e);
}
function Uc() {
  const e = Ei("canvas");
  return e.style.display = "block", e;
}
var Ws = {};
function Ti(e) {
  e in Ws || (Ws[e] = !0, console.warn(e));
}
function Dc(e, t, n) {
  return new Promise(function(i, r) {
    function s() {
      switch (e.clientWaitSync(t, e.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case e.WAIT_FAILED:
          r();
          break;
        case e.TIMEOUT_EXPIRED:
          setTimeout(s, n);
          break;
        default:
          i();
      }
    }
    setTimeout(s, n);
  });
}
var Xs = /* @__PURE__ */ new Xe().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), qs = /* @__PURE__ */ new Xe().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
function Nc() {
  const e = {
    enabled: !0,
    workingColorSpace: Si,
    spaces: {},
    convert: function(r, s, a) {
      return this.enabled === !1 || s === a || !s || !a || (this.spaces[s].transfer === "srgb" && (r.r = en(r.r), r.g = en(r.g), r.b = en(r.b)), this.spaces[s].primaries !== this.spaces[a].primaries && (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === "srgb" && (r.r = Zn(r.r), r.g = Zn(r.g), r.b = Zn(r.b))), r;
    },
    workingToColorSpace: function(r, s) {
      return this.convert(r, this.workingColorSpace, s);
    },
    colorSpaceToWorking: function(r, s) {
      return this.convert(r, s, this.workingColorSpace);
    },
    getPrimaries: function(r) {
      return this.spaces[r].primaries;
    },
    getTransfer: function(r) {
      return r === "" ? pr : this.spaces[r].transfer;
    },
    getToneMappingMode: function(r) {
      return this.spaces[r].outputColorSpaceConfig.toneMappingMode || "standard";
    },
    getLuminanceCoefficients: function(r, s = this.workingColorSpace) {
      return r.fromArray(this.spaces[s].luminanceCoefficients);
    },
    define: function(r) {
      Object.assign(this.spaces, r);
    },
    _getMatrix: function(r, s, a) {
      return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(r) {
      return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(r = this.workingColorSpace) {
      return this.spaces[r].workingColorSpaceConfig.unpackColorSpace;
    },
    fromWorkingColorSpace: function(r, s) {
      return Ti("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), e.workingToColorSpace(r, s);
    },
    toWorkingColorSpace: function(r, s) {
      return Ti("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), e.colorSpaceToWorking(r, s);
    }
  }, t = [
    0.64,
    0.33,
    0.3,
    0.6,
    0.15,
    0.06
  ], n = [
    0.2126,
    0.7152,
    0.0722
  ], i = [0.3127, 0.329];
  return e.define({
    [Si]: {
      primaries: t,
      whitePoint: i,
      transfer: pr,
      toXYZ: Xs,
      fromXYZ: qs,
      luminanceCoefficients: n,
      workingColorSpaceConfig: { unpackColorSpace: zt },
      outputColorSpaceConfig: { drawingBufferColorSpace: zt }
    },
    [zt]: {
      primaries: t,
      whitePoint: i,
      transfer: mr,
      toXYZ: Xs,
      fromXYZ: qs,
      luminanceCoefficients: n,
      outputColorSpaceConfig: { drawingBufferColorSpace: zt }
    }
  }), e;
}
var je = /* @__PURE__ */ Nc();
function en(e) {
  return e < 0.04045 ? e * 0.0773993808 : Math.pow(e * 0.9478672986 + 0.0521327014, 2.4);
}
function Zn(e) {
  return e < 31308e-7 ? e * 12.92 : 1.055 * Math.pow(e, 0.41666) - 0.055;
}
var Ln, Oc = class {
  static getDataURL(e, t = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
    let n;
    if (e instanceof HTMLCanvasElement) n = e;
    else {
      Ln === void 0 && (Ln = Ei("canvas")), Ln.width = e.width, Ln.height = e.height;
      const i = Ln.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), n = Ln;
    }
    return n.toDataURL(t);
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = Ei("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let s = 0; s < r.length; s++) r[s] = en(r[s] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(en(t[n] / 255) * 255) : t[n] = en(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}, Fc = 0, bs = class {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Fc++ }), this.uuid = Lt(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  getSize(e) {
    const t = this.data;
    return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : t instanceof VideoFrame ? e.set(t.displayHeight, t.displayWidth, 0) : t !== null ? e.set(t.width, t.height, t.depth || 0) : e.set(0, 0, 0), e;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, i = this.data;
    if (i !== null) {
      let r;
      if (Array.isArray(i)) {
        r = [];
        for (let s = 0, a = i.length; s < a; s++) i[s].isDataTexture ? r.push(Pr(i[s].image)) : r.push(Pr(i[s]));
      } else r = Pr(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
};
function Pr(e) {
  return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap ? Oc.getDataURL(e) : e.data ? {
    data: Array.from(e.data),
    width: e.width,
    height: e.height,
    type: e.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
var Bc = 0, Lr = /* @__PURE__ */ new P(), Ut = class hr extends Cn {
  constructor(t = hr.DEFAULT_IMAGE, n = hr.DEFAULT_MAPPING, i = Tn, r = Tn, s = An, a = Ms, o = $n, l = Kn, c = hr.DEFAULT_ANISOTROPY, h = "") {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Bc++ }), this.uuid = Lt(), this.name = "", this.source = new bs(t), this.mipmaps = [], this.mapping = n, this.channel = 0, this.wrapS = i, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new oe(0, 0), this.repeat = new oe(1, 1), this.center = new oe(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Xe(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  get width() {
    return this.source.getSize(Lr).x;
  }
  get height() {
    return this.source.getSize(Lr).y;
  }
  get depth() {
    return this.source.getSize(Lr).z;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  addUpdateRange(t, n) {
    this.updateRanges.push({
      start: t,
      count: n
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.isArrayTexture = t.isArrayTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
  }
  setValues(t) {
    for (const n in t) {
      const i = t[n];
      if (i === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${n}' has value of undefined.`);
        continue;
      }
      const r = this[n];
      if (r === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${n}' does not exist.`);
        continue;
      }
      r && i && r.isVector2 && i.isVector2 || r && i && r.isVector3 && i.isVector3 || r && i && r.isMatrix3 && i.isMatrix3 ? r.copy(i) : this[n] = i;
    }
  }
  toJSON(t) {
    const n = t === void 0 || typeof t == "string";
    if (!n && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
    const i = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (i.userData = this.userData), n || (t.textures[this.uuid] = i), i;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== 300) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
      case us:
        t.x = t.x - Math.floor(t.x);
        break;
      case Tn:
        t.x = t.x < 0 ? 0 : 1;
        break;
      case fs:
        Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
        break;
    }
    if (t.y < 0 || t.y > 1) switch (this.wrapT) {
      case us:
        t.y = t.y - Math.floor(t.y);
        break;
      case Tn:
        t.y = t.y < 0 ? 0 : 1;
        break;
      case fs:
        Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
        break;
    }
    return this.flipY && (t.y = 1 - t.y), t;
  }
  set needsUpdate(t) {
    t === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
};
Ut.DEFAULT_IMAGE = null;
Ut.DEFAULT_MAPPING = 300;
Ut.DEFAULT_ANISOTROPY = 1;
var et = class uo {
  constructor(t = 0, n = 0, i = 0, r = 1) {
    uo.prototype.isVector4 = !0, this.x = t, this.y = n, this.z = i, this.w = r;
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, n, i, r) {
    return this.x = t, this.y = n, this.z = i, this.w = r, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setW(t) {
    return this.w = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      case 2:
        this.z = n;
        break;
      case 3:
        this.w = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this.z = t.z + n.z, this.w = t.w + n.w, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this.z += t.z * n, this.w += t.w * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this.z = t.z - n.z, this.w = t.w - n.w, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  applyMatrix4(t) {
    const n = this.x, i = this.y, r = this.z, s = this.w, a = t.elements;
    return this.x = a[0] * n + a[4] * i + a[8] * r + a[12] * s, this.y = a[1] * n + a[5] * i + a[9] * r + a[13] * s, this.z = a[2] * n + a[6] * i + a[10] * r + a[14] * s, this.w = a[3] * n + a[7] * i + a[11] * r + a[15] * s, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const n = Math.sqrt(1 - t.w * t.w);
    return n < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / n, this.y = t.y / n, this.z = t.z / n), this;
  }
  setAxisAngleFromRotationMatrix(t) {
    let n, i, r, s;
    const l = t.elements, c = l[0], h = l[4], u = l[8], f = l[1], p = l[5], v = l[9], g = l[2], m = l[6], d = l[10];
    if (Math.abs(h - f) < 0.01 && Math.abs(u - g) < 0.01 && Math.abs(v - m) < 0.01) {
      if (Math.abs(h + f) < 0.1 && Math.abs(u + g) < 0.1 && Math.abs(v + m) < 0.1 && Math.abs(c + p + d - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      n = Math.PI;
      const _ = (c + 1) / 2, S = (p + 1) / 2, L = (d + 1) / 2, A = (h + f) / 4, C = (u + g) / 4, U = (v + m) / 4;
      return _ > S && _ > L ? _ < 0.01 ? (i = 0, r = 0.707106781, s = 0.707106781) : (i = Math.sqrt(_), r = A / i, s = C / i) : S > L ? S < 0.01 ? (i = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(S), i = A / r, s = U / r) : L < 0.01 ? (i = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(L), i = C / s, r = U / s), this.set(i, r, s, n), this;
    }
    let T = Math.sqrt((m - v) * (m - v) + (u - g) * (u - g) + (f - h) * (f - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (m - v) / T, this.y = (u - g) / T, this.z = (f - h) / T, this.w = Math.acos((c + p + d - 1) / 2), this;
  }
  setFromMatrixPosition(t) {
    const n = t.elements;
    return this.x = n[12], this.y = n[13], this.z = n[14], this.w = n[15], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
  }
  clamp(t, n) {
    return this.x = Ve(this.x, t.x, n.x), this.y = Ve(this.y, t.y, n.y), this.z = Ve(this.z, t.z, n.z), this.w = Ve(this.w, t.w, n.w), this;
  }
  clampScalar(t, n) {
    return this.x = Ve(this.x, t, n), this.y = Ve(this.y, t, n), this.z = Ve(this.z, t, n), this.w = Ve(this.w, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Ve(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this.z += (t.z - this.z) * n, this.w += (t.w - this.w) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this.z = t.z + (n.z - t.z) * i, this.w = t.w + (n.w - t.w) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this.z = t[n + 2], this.w = t[n + 3], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t[n + 2] = this.z, t[n + 3] = this.w, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this.z = t.getZ(n), this.w = t.getW(n), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}, zc = class extends Cn {
  constructor(e = 1, t = 1, n = {}) {
    super(), n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: An,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new et(0, 0, e, t), this.scissorTest = !1, this.viewport = new et(0, 0, e, t);
    const i = new Ut({
      width: e,
      height: t,
      depth: n.depth
    });
    this.textures = [];
    const r = n.count;
    for (let s = 0; s < r; s++)
      this.textures[s] = i.clone(), this.textures[s].isRenderTargetTexture = !0, this.textures[s].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(e = {}) {
    const t = {
      minFilter: An,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
    for (let n = 0; n < this.textures.length; n++) this.textures[n].setValues(t);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), e !== null && (e.renderTarget = this), this._depthTexture = e;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let i = 0, r = this.textures.length; i < r; i++)
        this.textures[i].image.width = e, this.textures[i].image.height = t, this.textures[i].image.depth = n, this.textures[i].isArrayTexture = this.textures[i].image.depth > 1;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let t = 0, n = e.textures.length; t < n; t++) {
      this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
      const i = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new bs(i);
    }
    return this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}, wn = class extends zc {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}, fo = class extends Ut {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = Ht, this.minFilter = Ht, this.wrapR = Tn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}, Vc = class extends Ut {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = Ht, this.minFilter = Ht, this.wrapR = Tn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}, un = class {
  constructor(e = new P(1 / 0, 1 / 0, 1 / 0), t = new P(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(Ot.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(Ot.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = Ot.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0) for (let s = 0, a = r.count; s < a; s++)
        e.isMesh === !0 ? e.getVertexPosition(s, Ot) : Ot.fromBufferAttribute(r, s), Ot.applyMatrix4(e.matrixWorld), this.expandByPoint(Ot);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Ui.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Ui.copy(n.boundingBox)), Ui.applyMatrix4(e.matrixWorld), this.union(Ui);
    }
    const i = e.children;
    for (let r = 0, s = i.length; r < s; r++) this.expandByObject(i[r], t);
    return this;
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, Ot), Ot.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty()) return !1;
    this.getCenter(oi), Di.subVectors(this.max, oi), In.subVectors(e.a, oi), Un.subVectors(e.b, oi), Dn.subVectors(e.c, oi), rn.subVectors(Un, In), sn.subVectors(Dn, Un), mn.subVectors(In, Dn);
    let t = [
      0,
      -rn.z,
      rn.y,
      0,
      -sn.z,
      sn.y,
      0,
      -mn.z,
      mn.y,
      rn.z,
      0,
      -rn.x,
      sn.z,
      0,
      -sn.x,
      mn.z,
      0,
      -mn.x,
      -rn.y,
      rn.x,
      0,
      -sn.y,
      sn.x,
      0,
      -mn.y,
      mn.x,
      0
    ];
    return !Ir(t, In, Un, Dn, Di) || (t = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], !Ir(t, In, Un, Dn, Di)) ? !1 : (Ni.crossVectors(rn, sn), t = [
      Ni.x,
      Ni.y,
      Ni.z
    ], Ir(t, In, Un, Dn, Di));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Ot).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Ot).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Yt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Yt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Yt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Yt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Yt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Yt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Yt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Yt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Yt), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
  toJSON() {
    return {
      min: this.min.toArray(),
      max: this.max.toArray()
    };
  }
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
  }
}, Yt = [
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P()
], Ot = /* @__PURE__ */ new P(), Ui = /* @__PURE__ */ new un(), In = /* @__PURE__ */ new P(), Un = /* @__PURE__ */ new P(), Dn = /* @__PURE__ */ new P(), rn = /* @__PURE__ */ new P(), sn = /* @__PURE__ */ new P(), mn = /* @__PURE__ */ new P(), oi = /* @__PURE__ */ new P(), Di = /* @__PURE__ */ new P(), Ni = /* @__PURE__ */ new P(), gn = /* @__PURE__ */ new P();
function Ir(e, t, n, i, r) {
  for (let s = 0, a = e.length - 3; s <= a; s += 3) {
    gn.fromArray(e, s);
    const o = r.x * Math.abs(gn.x) + r.y * Math.abs(gn.y) + r.z * Math.abs(gn.z), l = t.dot(gn), c = n.dot(gn), h = i.dot(gn);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return !1;
  }
  return !0;
}
var Hc = /* @__PURE__ */ new un(), li = /* @__PURE__ */ new P(), Ur = /* @__PURE__ */ new P(), nn = class {
  constructor(e = new P(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Hc.setFromPoints(e).getCenter(n);
    let i = 0;
    for (let r = 0, s = e.length; r < s; r++) i = Math.max(i, n.distanceToSquared(e[r]));
    return this.radius = Math.sqrt(i), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    li.subVectors(e, this.center);
    const t = li.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(li, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Ur.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(li.copy(e.center).add(Ur)), this.expandByPoint(li.copy(e.center).sub(Ur))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return {
      radius: this.radius,
      center: this.center.toArray()
    };
  }
  fromJSON(e) {
    return this.radius = e.radius, this.center.fromArray(e.center), this;
  }
}, Jt = /* @__PURE__ */ new P(), Dr = /* @__PURE__ */ new P(), Oi = /* @__PURE__ */ new P(), an = /* @__PURE__ */ new P(), Nr = /* @__PURE__ */ new P(), Fi = /* @__PURE__ */ new P(), Or = /* @__PURE__ */ new P(), Ci = class {
  constructor(e = new P(), t = new P(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, Jt)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = Jt.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (Jt.copy(this.origin).addScaledVector(this.direction, t), Jt.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    Dr.copy(e).add(t).multiplyScalar(0.5), Oi.copy(t).sub(e).normalize(), an.copy(this.origin).sub(Dr);
    const r = e.distanceTo(t) * 0.5, s = -this.direction.dot(Oi), a = an.dot(this.direction), o = -an.dot(Oi), l = an.lengthSq(), c = Math.abs(1 - s * s);
    let h, u, f, p;
    if (c > 0)
      if (h = s * o - a, u = s * a - o, p = r * c, h >= 0) if (u >= -p) if (u <= p) {
        const v = 1 / c;
        h *= v, u *= v, f = h * (h + s * u + 2 * a) + u * (s * h + u + 2 * o) + l;
      } else
        u = r, h = Math.max(0, -(s * u + a)), f = -h * h + u * (u + 2 * o) + l;
      else
        u = -r, h = Math.max(0, -(s * u + a)), f = -h * h + u * (u + 2 * o) + l;
      else u <= -p ? (h = Math.max(0, -(-s * r + a)), u = h > 0 ? -r : Math.min(Math.max(-r, -o), r), f = -h * h + u * (u + 2 * o) + l) : u <= p ? (h = 0, u = Math.min(Math.max(-r, -o), r), f = u * (u + 2 * o) + l) : (h = Math.max(0, -(s * r + a)), u = h > 0 ? r : Math.min(Math.max(-r, -o), r), f = -h * h + u * (u + 2 * o) + l);
    else
      u = s > 0 ? -r : r, h = Math.max(0, -(s * u + a)), f = -h * h + u * (u + 2 * o) + l;
    return n && n.copy(this.origin).addScaledVector(this.direction, h), i && i.copy(Dr).addScaledVector(Oi, u), f;
  }
  intersectSphere(e, t) {
    Jt.subVectors(e.center, this.origin);
    const n = Jt.dot(this.direction), i = Jt.dot(Jt) - n * n, r = e.radius * e.radius;
    if (i > r) return null;
    const s = Math.sqrt(r - i), a = n - s, o = n + s;
    return o < 0 ? null : a < 0 ? this.at(o, t) : this.at(a, t);
  }
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, i, r, s, a, o;
    const l = 1 / this.direction.x, c = 1 / this.direction.y, h = 1 / this.direction.z, u = this.origin;
    return l >= 0 ? (n = (e.min.x - u.x) * l, i = (e.max.x - u.x) * l) : (n = (e.max.x - u.x) * l, i = (e.min.x - u.x) * l), c >= 0 ? (r = (e.min.y - u.y) * c, s = (e.max.y - u.y) * c) : (r = (e.max.y - u.y) * c, s = (e.min.y - u.y) * c), n > s || r > i || ((r > n || isNaN(n)) && (n = r), (s < i || isNaN(i)) && (i = s), h >= 0 ? (a = (e.min.z - u.z) * h, o = (e.max.z - u.z) * h) : (a = (e.max.z - u.z) * h, o = (e.min.z - u.z) * h), n > o || a > i) || ((a > n || n !== n) && (n = a), (o < i || i !== i) && (i = o), i < 0) ? null : this.at(n >= 0 ? n : i, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, Jt) !== null;
  }
  intersectTriangle(e, t, n, i, r) {
    Nr.subVectors(t, e), Fi.subVectors(n, e), Or.crossVectors(Nr, Fi);
    let s = this.direction.dot(Or), a;
    if (s > 0) {
      if (i) return null;
      a = 1;
    } else if (s < 0)
      a = -1, s = -s;
    else return null;
    an.subVectors(this.origin, e);
    const o = a * this.direction.dot(Fi.crossVectors(an, Fi));
    if (o < 0) return null;
    const l = a * this.direction.dot(Nr.cross(an));
    if (l < 0 || o + l > s) return null;
    const c = -a * an.dot(Or);
    return c < 0 ? null : this.at(c / s, r);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, Ye = class ps {
  constructor(t, n, i, r, s, a, o, l, c, h, u, f, p, v, g, m) {
    ps.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, n, i, r, s, a, o, l, c, h, u, f, p, v, g, m);
  }
  set(t, n, i, r, s, a, o, l, c, h, u, f, p, v, g, m) {
    const d = this.elements;
    return d[0] = t, d[4] = n, d[8] = i, d[12] = r, d[1] = s, d[5] = a, d[9] = o, d[13] = l, d[2] = c, d[6] = h, d[10] = u, d[14] = f, d[3] = p, d[7] = v, d[11] = g, d[15] = m, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new ps().fromArray(this.elements);
  }
  copy(t) {
    const n = this.elements, i = t.elements;
    return n[0] = i[0], n[1] = i[1], n[2] = i[2], n[3] = i[3], n[4] = i[4], n[5] = i[5], n[6] = i[6], n[7] = i[7], n[8] = i[8], n[9] = i[9], n[10] = i[10], n[11] = i[11], n[12] = i[12], n[13] = i[13], n[14] = i[14], n[15] = i[15], this;
  }
  copyPosition(t) {
    const n = this.elements, i = t.elements;
    return n[12] = i[12], n[13] = i[13], n[14] = i[14], this;
  }
  setFromMatrix3(t) {
    const n = t.elements;
    return this.set(n[0], n[3], n[6], 0, n[1], n[4], n[7], 0, n[2], n[5], n[8], 0, 0, 0, 0, 1), this;
  }
  extractBasis(t, n, i) {
    return t.setFromMatrixColumn(this, 0), n.setFromMatrixColumn(this, 1), i.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(t, n, i) {
    return this.set(t.x, n.x, i.x, 0, t.y, n.y, i.y, 0, t.z, n.z, i.z, 0, 0, 0, 0, 1), this;
  }
  extractRotation(t) {
    const n = this.elements, i = t.elements, r = 1 / Nn.setFromMatrixColumn(t, 0).length(), s = 1 / Nn.setFromMatrixColumn(t, 1).length(), a = 1 / Nn.setFromMatrixColumn(t, 2).length();
    return n[0] = i[0] * r, n[1] = i[1] * r, n[2] = i[2] * r, n[3] = 0, n[4] = i[4] * s, n[5] = i[5] * s, n[6] = i[6] * s, n[7] = 0, n[8] = i[8] * a, n[9] = i[9] * a, n[10] = i[10] * a, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const n = this.elements, i = t.x, r = t.y, s = t.z, a = Math.cos(i), o = Math.sin(i), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), u = Math.sin(s);
    if (t.order === "XYZ") {
      const f = a * h, p = a * u, v = o * h, g = o * u;
      n[0] = l * h, n[4] = -l * u, n[8] = c, n[1] = p + v * c, n[5] = f - g * c, n[9] = -o * l, n[2] = g - f * c, n[6] = v + p * c, n[10] = a * l;
    } else if (t.order === "YXZ") {
      const f = l * h, p = l * u, v = c * h, g = c * u;
      n[0] = f + g * o, n[4] = v * o - p, n[8] = a * c, n[1] = a * u, n[5] = a * h, n[9] = -o, n[2] = p * o - v, n[6] = g + f * o, n[10] = a * l;
    } else if (t.order === "ZXY") {
      const f = l * h, p = l * u, v = c * h, g = c * u;
      n[0] = f - g * o, n[4] = -a * u, n[8] = v + p * o, n[1] = p + v * o, n[5] = a * h, n[9] = g - f * o, n[2] = -a * c, n[6] = o, n[10] = a * l;
    } else if (t.order === "ZYX") {
      const f = a * h, p = a * u, v = o * h, g = o * u;
      n[0] = l * h, n[4] = v * c - p, n[8] = f * c + g, n[1] = l * u, n[5] = g * c + f, n[9] = p * c - v, n[2] = -c, n[6] = o * l, n[10] = a * l;
    } else if (t.order === "YZX") {
      const f = a * l, p = a * c, v = o * l, g = o * c;
      n[0] = l * h, n[4] = g - f * u, n[8] = v * u + p, n[1] = u, n[5] = a * h, n[9] = -o * h, n[2] = -c * h, n[6] = p * u + v, n[10] = f - g * u;
    } else if (t.order === "XZY") {
      const f = a * l, p = a * c, v = o * l, g = o * c;
      n[0] = l * h, n[4] = -u, n[8] = c * h, n[1] = f * u + g, n[5] = a * h, n[9] = p * u - v, n[2] = v * u - p, n[6] = o * h, n[10] = g * u + f;
    }
    return n[3] = 0, n[7] = 0, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(kc, t, Gc);
  }
  lookAt(t, n, i) {
    const r = this.elements;
    return Tt.subVectors(t, n), Tt.lengthSq() === 0 && (Tt.z = 1), Tt.normalize(), on.crossVectors(i, Tt), on.lengthSq() === 0 && (Math.abs(i.z) === 1 ? Tt.x += 1e-4 : Tt.z += 1e-4, Tt.normalize(), on.crossVectors(i, Tt)), on.normalize(), Bi.crossVectors(Tt, on), r[0] = on.x, r[4] = Bi.x, r[8] = Tt.x, r[1] = on.y, r[5] = Bi.y, r[9] = Tt.y, r[2] = on.z, r[6] = Bi.z, r[10] = Tt.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, n) {
    const i = t.elements, r = n.elements, s = this.elements, a = i[0], o = i[4], l = i[8], c = i[12], h = i[1], u = i[5], f = i[9], p = i[13], v = i[2], g = i[6], m = i[10], d = i[14], T = i[3], _ = i[7], S = i[11], L = i[15], A = r[0], C = r[4], U = r[8], E = r[12], M = r[1], w = r[5], F = r[9], H = r[13], B = r[2], Y = r[6], k = r[10], ee = r[14], W = r[3], se = r[7], pe = r[11], De = r[15];
    return s[0] = a * A + o * M + l * B + c * W, s[4] = a * C + o * w + l * Y + c * se, s[8] = a * U + o * F + l * k + c * pe, s[12] = a * E + o * H + l * ee + c * De, s[1] = h * A + u * M + f * B + p * W, s[5] = h * C + u * w + f * Y + p * se, s[9] = h * U + u * F + f * k + p * pe, s[13] = h * E + u * H + f * ee + p * De, s[2] = v * A + g * M + m * B + d * W, s[6] = v * C + g * w + m * Y + d * se, s[10] = v * U + g * F + m * k + d * pe, s[14] = v * E + g * H + m * ee + d * De, s[3] = T * A + _ * M + S * B + L * W, s[7] = T * C + _ * w + S * Y + L * se, s[11] = T * U + _ * F + S * k + L * pe, s[15] = T * E + _ * H + S * ee + L * De, this;
  }
  multiplyScalar(t) {
    const n = this.elements;
    return n[0] *= t, n[4] *= t, n[8] *= t, n[12] *= t, n[1] *= t, n[5] *= t, n[9] *= t, n[13] *= t, n[2] *= t, n[6] *= t, n[10] *= t, n[14] *= t, n[3] *= t, n[7] *= t, n[11] *= t, n[15] *= t, this;
  }
  determinant() {
    const t = this.elements, n = t[0], i = t[4], r = t[8], s = t[12], a = t[1], o = t[5], l = t[9], c = t[13], h = t[2], u = t[6], f = t[10], p = t[14], v = t[3], g = t[7], m = t[11], d = t[15];
    return v * (+s * l * u - r * c * u - s * o * f + i * c * f + r * o * p - i * l * p) + g * (+n * l * p - n * c * f + s * a * f - r * a * p + r * c * h - s * l * h) + m * (+n * c * u - n * o * p - s * a * u + i * a * p + s * o * h - i * c * h) + d * (-r * o * h - n * l * u + n * o * f + r * a * u - i * a * f + i * l * h);
  }
  transpose() {
    const t = this.elements;
    let n;
    return n = t[1], t[1] = t[4], t[4] = n, n = t[2], t[2] = t[8], t[8] = n, n = t[6], t[6] = t[9], t[9] = n, n = t[3], t[3] = t[12], t[12] = n, n = t[7], t[7] = t[13], t[13] = n, n = t[11], t[11] = t[14], t[14] = n, this;
  }
  setPosition(t, n, i) {
    const r = this.elements;
    return t.isVector3 ? (r[12] = t.x, r[13] = t.y, r[14] = t.z) : (r[12] = t, r[13] = n, r[14] = i), this;
  }
  invert() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], u = t[9], f = t[10], p = t[11], v = t[12], g = t[13], m = t[14], d = t[15], T = u * m * c - g * f * c + g * l * p - o * m * p - u * l * d + o * f * d, _ = v * f * c - h * m * c - v * l * p + a * m * p + h * l * d - a * f * d, S = h * g * c - v * u * c + v * o * p - a * g * p - h * o * d + a * u * d, L = v * u * l - h * g * l - v * o * f + a * g * f + h * o * m - a * u * m, A = n * T + i * _ + r * S + s * L;
    if (A === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / A;
    return t[0] = T * C, t[1] = (g * f * s - u * m * s - g * r * p + i * m * p + u * r * d - i * f * d) * C, t[2] = (o * m * s - g * l * s + g * r * c - i * m * c - o * r * d + i * l * d) * C, t[3] = (u * l * s - o * f * s - u * r * c + i * f * c + o * r * p - i * l * p) * C, t[4] = _ * C, t[5] = (h * m * s - v * f * s + v * r * p - n * m * p - h * r * d + n * f * d) * C, t[6] = (v * l * s - a * m * s - v * r * c + n * m * c + a * r * d - n * l * d) * C, t[7] = (a * f * s - h * l * s + h * r * c - n * f * c - a * r * p + n * l * p) * C, t[8] = S * C, t[9] = (v * u * s - h * g * s - v * i * p + n * g * p + h * i * d - n * u * d) * C, t[10] = (a * g * s - v * o * s + v * i * c - n * g * c - a * i * d + n * o * d) * C, t[11] = (h * o * s - a * u * s - h * i * c + n * u * c + a * i * p - n * o * p) * C, t[12] = L * C, t[13] = (h * g * r - v * u * r + v * i * f - n * g * f - h * i * m + n * u * m) * C, t[14] = (v * o * r - a * g * r - v * i * l + n * g * l + a * i * m - n * o * m) * C, t[15] = (a * u * r - h * o * r + h * i * l - n * u * l - a * i * f + n * o * f) * C, this;
  }
  scale(t) {
    const n = this.elements, i = t.x, r = t.y, s = t.z;
    return n[0] *= i, n[4] *= r, n[8] *= s, n[1] *= i, n[5] *= r, n[9] *= s, n[2] *= i, n[6] *= r, n[10] *= s, n[3] *= i, n[7] *= r, n[11] *= s, this;
  }
  getMaxScaleOnAxis() {
    const t = this.elements, n = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], i = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], r = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(n, i, r));
  }
  makeTranslation(t, n, i) {
    return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, n, 0, 0, 1, i, 0, 0, 0, 1), this;
  }
  makeRotationX(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(1, 0, 0, 0, 0, n, -i, 0, 0, i, n, 0, 0, 0, 0, 1), this;
  }
  makeRotationY(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, 0, i, 0, 0, 1, 0, 0, -i, 0, n, 0, 0, 0, 0, 1), this;
  }
  makeRotationZ(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, -i, 0, 0, i, n, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  makeRotationAxis(t, n) {
    const i = Math.cos(n), r = Math.sin(n), s = 1 - i, a = t.x, o = t.y, l = t.z, c = s * a, h = s * o;
    return this.set(c * a + i, c * o - r * l, c * l + r * o, 0, c * o + r * l, h * o + i, h * l - r * a, 0, c * l - r * o, h * l + r * a, s * l * l + i, 0, 0, 0, 0, 1), this;
  }
  makeScale(t, n, i) {
    return this.set(t, 0, 0, 0, 0, n, 0, 0, 0, 0, i, 0, 0, 0, 0, 1), this;
  }
  makeShear(t, n, i, r, s, a) {
    return this.set(1, i, s, 0, t, 1, a, 0, n, r, 1, 0, 0, 0, 0, 1), this;
  }
  compose(t, n, i) {
    const r = this.elements, s = n._x, a = n._y, o = n._z, l = n._w, c = s + s, h = a + a, u = o + o, f = s * c, p = s * h, v = s * u, g = a * h, m = a * u, d = o * u, T = l * c, _ = l * h, S = l * u, L = i.x, A = i.y, C = i.z;
    return r[0] = (1 - (g + d)) * L, r[1] = (p + S) * L, r[2] = (v - _) * L, r[3] = 0, r[4] = (p - S) * A, r[5] = (1 - (f + d)) * A, r[6] = (m + T) * A, r[7] = 0, r[8] = (v + _) * C, r[9] = (m - T) * C, r[10] = (1 - (f + g)) * C, r[11] = 0, r[12] = t.x, r[13] = t.y, r[14] = t.z, r[15] = 1, this;
  }
  decompose(t, n, i) {
    const r = this.elements;
    let s = Nn.set(r[0], r[1], r[2]).length();
    const a = Nn.set(r[4], r[5], r[6]).length(), o = Nn.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), t.x = r[12], t.y = r[13], t.z = r[14], Ft.copy(this);
    const l = 1 / s, c = 1 / a, h = 1 / o;
    return Ft.elements[0] *= l, Ft.elements[1] *= l, Ft.elements[2] *= l, Ft.elements[4] *= c, Ft.elements[5] *= c, Ft.elements[6] *= c, Ft.elements[8] *= h, Ft.elements[9] *= h, Ft.elements[10] *= h, n.setFromRotationMatrix(Ft), i.x = s, i.y = a, i.z = o, this;
  }
  makePerspective(t, n, i, r, s, a, o = jn, l = !1) {
    const c = this.elements, h = 2 * s / (n - t), u = 2 * s / (i - r), f = (n + t) / (n - t), p = (i + r) / (i - r);
    let v, g;
    if (l)
      v = s / (a - s), g = a * s / (a - s);
    else if (o === 2e3)
      v = -(a + s) / (a - s), g = -2 * a * s / (a - s);
    else if (o === 2001)
      v = -a / (a - s), g = -a * s / (a - s);
    else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = f, c[12] = 0, c[1] = 0, c[5] = u, c[9] = p, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = v, c[14] = g, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
  }
  makeOrthographic(t, n, i, r, s, a, o = jn, l = !1) {
    const c = this.elements, h = 2 / (n - t), u = 2 / (i - r), f = -(n + t) / (n - t), p = -(i + r) / (i - r);
    let v, g;
    if (l)
      v = 1 / (a - s), g = a / (a - s);
    else if (o === 2e3)
      v = -2 / (a - s), g = -(a + s) / (a - s);
    else if (o === 2001)
      v = -1 / (a - s), g = -s / (a - s);
    else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = f, c[1] = 0, c[5] = u, c[9] = 0, c[13] = p, c[2] = 0, c[6] = 0, c[10] = v, c[14] = g, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  equals(t) {
    const n = this.elements, i = t.elements;
    for (let r = 0; r < 16; r++) if (n[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(t, n = 0) {
    for (let i = 0; i < 16; i++) this.elements[i] = t[i + n];
    return this;
  }
  toArray(t = [], n = 0) {
    const i = this.elements;
    return t[n] = i[0], t[n + 1] = i[1], t[n + 2] = i[2], t[n + 3] = i[3], t[n + 4] = i[4], t[n + 5] = i[5], t[n + 6] = i[6], t[n + 7] = i[7], t[n + 8] = i[8], t[n + 9] = i[9], t[n + 10] = i[10], t[n + 11] = i[11], t[n + 12] = i[12], t[n + 13] = i[13], t[n + 14] = i[14], t[n + 15] = i[15], t;
  }
}, Nn = /* @__PURE__ */ new P(), Ft = /* @__PURE__ */ new Ye(), kc = /* @__PURE__ */ new P(0, 0, 0), Gc = /* @__PURE__ */ new P(1, 1, 1), on = /* @__PURE__ */ new P(), Bi = /* @__PURE__ */ new P(), Tt = /* @__PURE__ */ new P(), Ys = /* @__PURE__ */ new Ye(), Js = /* @__PURE__ */ new ni(), tn = class po {
  constructor(t = 0, n = 0, i = 0, r = po.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = t, this._y = n, this._z = i, this._order = r;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(t) {
    this._order = t, this._onChangeCallback();
  }
  set(t, n, i, r = this._order) {
    return this._x = t, this._y = n, this._z = i, this._order = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t, n = this._order, i = !0) {
    const r = t.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], u = r[2], f = r[6], p = r[10];
    switch (n) {
      case "XYZ":
        this._y = Math.asin(Ve(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ve(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ve(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-u, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Ve(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(f, p), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Ve(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, s)) : (this._x = 0, this._y = Math.atan2(o, p));
        break;
      case "XZY":
        this._z = Math.asin(-Ve(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, p), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + n);
    }
    return this._order = n, i === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, n, i) {
    return Ys.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Ys, n, i);
  }
  setFromVector3(t, n = this._order) {
    return this.set(t.x, t.y, t.z, n);
  }
  reorder(t) {
    return Js.setFromEuler(this), this.setFromQuaternion(Js, t);
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
  }
  fromArray(t) {
    return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this._x, t[n + 1] = this._y, t[n + 2] = this._z, t[n + 3] = this._order, t;
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
};
tn.DEFAULT_ORDER = "XYZ";
var As = class {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}, Wc = 0, Zs = /* @__PURE__ */ new P(), On = /* @__PURE__ */ new ni(), Zt = /* @__PURE__ */ new Ye(), zi = /* @__PURE__ */ new P(), ci = /* @__PURE__ */ new P(), Xc = /* @__PURE__ */ new P(), qc = /* @__PURE__ */ new ni(), Ks = /* @__PURE__ */ new P(1, 0, 0), $s = /* @__PURE__ */ new P(0, 1, 0), js = /* @__PURE__ */ new P(0, 0, 1), Qs = { type: "added" }, Yc = { type: "removed" }, Fn = {
  type: "childadded",
  child: null
}, Fr = {
  type: "childremoved",
  child: null
}, mt = class ur extends Cn {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Wc++ }), this.uuid = Lt(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = ur.DEFAULT_UP.clone();
    const t = new P(), n = new tn(), i = new ni(), r = new P(1, 1, 1);
    function s() {
      i.setFromEuler(n, !1);
    }
    function a() {
      n.setFromQuaternion(i, void 0, !1);
    }
    n._onChange(s), i._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: r
      },
      modelViewMatrix: { value: new Ye() },
      normalMatrix: { value: new Xe() }
    }), this.matrix = new Ye(), this.matrixWorld = new Ye(), this.matrixAutoUpdate = ur.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = ur.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new As(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(t) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(t) {
    return this.quaternion.premultiply(t), this;
  }
  setRotationFromAxisAngle(t, n) {
    this.quaternion.setFromAxisAngle(t, n);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, n) {
    return On.setFromAxisAngle(t, n), this.quaternion.multiply(On), this;
  }
  rotateOnWorldAxis(t, n) {
    return On.setFromAxisAngle(t, n), this.quaternion.premultiply(On), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(Ks, t);
  }
  rotateY(t) {
    return this.rotateOnAxis($s, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(js, t);
  }
  translateOnAxis(t, n) {
    return Zs.copy(t).applyQuaternion(this.quaternion), this.position.add(Zs.multiplyScalar(n)), this;
  }
  translateX(t) {
    return this.translateOnAxis(Ks, t);
  }
  translateY(t) {
    return this.translateOnAxis($s, t);
  }
  translateZ(t) {
    return this.translateOnAxis(js, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(Zt.copy(this.matrixWorld).invert());
  }
  lookAt(t, n, i) {
    t.isVector3 ? zi.copy(t) : zi.set(t, n, i);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), ci.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Zt.lookAt(ci, zi, this.up) : Zt.lookAt(zi, ci, this.up), this.quaternion.setFromRotationMatrix(Zt), r && (Zt.extractRotation(r.matrixWorld), On.setFromRotationMatrix(Zt), this.quaternion.premultiply(On.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.add(arguments[n]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(Qs), Fn.child = t, this.dispatchEvent(Fn), Fn.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) this.remove(arguments[i]);
      return this;
    }
    const n = this.children.indexOf(t);
    return n !== -1 && (t.parent = null, this.children.splice(n, 1), t.dispatchEvent(Yc), Fr.child = t, this.dispatchEvent(Fr), Fr.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(!0, !1), Zt.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Zt.multiply(t.parent.matrixWorld)), t.applyMatrix4(Zt), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(Qs), Fn.child = t, this.dispatchEvent(Fn), Fn.child = null, this;
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, n) {
    if (this[t] === n) return this;
    for (let i = 0, r = this.children.length; i < r; i++) {
      const s = this.children[i].getObjectByProperty(t, n);
      if (s !== void 0) return s;
    }
  }
  getObjectsByProperty(t, n, i = []) {
    this[t] === n && i.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++) r[s].getObjectsByProperty(t, n, i);
    return i;
  }
  getWorldPosition(t) {
    return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ci, t, Xc), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ci, qc, t), t;
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const n = this.matrixWorld.elements;
    return t.set(n[8], n[9], n[10]).normalize();
  }
  raycast() {
  }
  traverse(t) {
    t(this);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].traverseVisible(t);
  }
  traverseAncestors(t) {
    const n = this.parent;
    n !== null && (t(n), n.traverseAncestors(t));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, n) {
    const i = this.parent;
    if (t === !0 && i !== null && i.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), n === !0) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++) r[s].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(t) {
    const n = t === void 0 || typeof t == "string", i = {};
    n && (t = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, i.metadata = {
      version: 4.7,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const r = {};
    r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.geometryInfo = this._geometryInfo.map((o) => ({
      ...o,
      boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
      boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
    })), r.instanceInfo = this._instanceInfo.map((o) => ({ ...o })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(t), r.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(t.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l)) for (let c = 0, h = l.length; c < h; c++) {
          const u = l[c];
          s(t.shapes, u);
        }
        else s(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(t.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
      const o = [];
      for (let l = 0, c = this.material.length; l < c; l++) o.push(s(t.materials, this.material[l]));
      r.material = o;
    } else r.material = s(t.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++) r.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(t.animations, l));
      }
    }
    if (n) {
      const o = a(t.geometries), l = a(t.materials), c = a(t.textures), h = a(t.images), u = a(t.shapes), f = a(t.skeletons), p = a(t.animations), v = a(t.nodes);
      o.length > 0 && (i.geometries = o), l.length > 0 && (i.materials = l), c.length > 0 && (i.textures = c), h.length > 0 && (i.images = h), u.length > 0 && (i.shapes = u), f.length > 0 && (i.skeletons = f), p.length > 0 && (i.animations = p), v.length > 0 && (i.nodes = v);
    }
    return i.object = r, i;
    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, n = !0) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), n === !0) for (let i = 0; i < t.children.length; i++) {
      const r = t.children[i];
      this.add(r.clone());
    }
    return this;
  }
};
mt.DEFAULT_UP = /* @__PURE__ */ new P(0, 1, 0);
mt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var Bt = /* @__PURE__ */ new P(), Kt = /* @__PURE__ */ new P(), Br = /* @__PURE__ */ new P(), $t = /* @__PURE__ */ new P(), Bn = /* @__PURE__ */ new P(), zn = /* @__PURE__ */ new P(), ea = /* @__PURE__ */ new P(), zr = /* @__PURE__ */ new P(), Vr = /* @__PURE__ */ new P(), Hr = /* @__PURE__ */ new P(), kr = /* @__PURE__ */ new et(), Gr = /* @__PURE__ */ new et(), Wr = /* @__PURE__ */ new et(), hi = class qn {
  constructor(t = new P(), n = new P(), i = new P()) {
    this.a = t, this.b = n, this.c = i;
  }
  static getNormal(t, n, i, r) {
    r.subVectors(i, n), Bt.subVectors(t, n), r.cross(Bt);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  static getBarycoord(t, n, i, r, s) {
    Bt.subVectors(r, n), Kt.subVectors(i, n), Br.subVectors(t, n);
    const a = Bt.dot(Bt), o = Bt.dot(Kt), l = Bt.dot(Br), c = Kt.dot(Kt), h = Kt.dot(Br), u = a * c - o * o;
    if (u === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / u, p = (c * l - o * h) * f, v = (a * h - o * l) * f;
    return s.set(1 - p - v, v, p);
  }
  static containsPoint(t, n, i, r) {
    return this.getBarycoord(t, n, i, r, $t) === null ? !1 : $t.x >= 0 && $t.y >= 0 && $t.x + $t.y <= 1;
  }
  static getInterpolation(t, n, i, r, s, a, o, l) {
    return this.getBarycoord(t, n, i, r, $t) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, $t.x), l.addScaledVector(a, $t.y), l.addScaledVector(o, $t.z), l);
  }
  static getInterpolatedAttribute(t, n, i, r, s, a) {
    return kr.setScalar(0), Gr.setScalar(0), Wr.setScalar(0), kr.fromBufferAttribute(t, n), Gr.fromBufferAttribute(t, i), Wr.fromBufferAttribute(t, r), a.setScalar(0), a.addScaledVector(kr, s.x), a.addScaledVector(Gr, s.y), a.addScaledVector(Wr, s.z), a;
  }
  static isFrontFacing(t, n, i, r) {
    return Bt.subVectors(i, n), Kt.subVectors(t, n), Bt.cross(Kt).dot(r) < 0;
  }
  set(t, n, i) {
    return this.a.copy(t), this.b.copy(n), this.c.copy(i), this;
  }
  setFromPointsAndIndices(t, n, i, r) {
    return this.a.copy(t[n]), this.b.copy(t[i]), this.c.copy(t[r]), this;
  }
  setFromAttributeAndIndices(t, n, i, r) {
    return this.a.fromBufferAttribute(t, n), this.b.fromBufferAttribute(t, i), this.c.fromBufferAttribute(t, r), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  getArea() {
    return Bt.subVectors(this.c, this.b), Kt.subVectors(this.a, this.b), Bt.cross(Kt).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return qn.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, n) {
    return qn.getBarycoord(t, this.a, this.b, this.c, n);
  }
  getInterpolation(t, n, i, r, s) {
    return qn.getInterpolation(t, this.a, this.b, this.c, n, i, r, s);
  }
  containsPoint(t) {
    return qn.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return qn.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, n) {
    const i = this.a, r = this.b, s = this.c;
    let a, o;
    Bn.subVectors(r, i), zn.subVectors(s, i), zr.subVectors(t, i);
    const l = Bn.dot(zr), c = zn.dot(zr);
    if (l <= 0 && c <= 0) return n.copy(i);
    Vr.subVectors(t, r);
    const h = Bn.dot(Vr), u = zn.dot(Vr);
    if (h >= 0 && u <= h) return n.copy(r);
    const f = l * u - h * c;
    if (f <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), n.copy(i).addScaledVector(Bn, a);
    Hr.subVectors(t, s);
    const p = Bn.dot(Hr), v = zn.dot(Hr);
    if (v >= 0 && p <= v) return n.copy(s);
    const g = p * c - l * v;
    if (g <= 0 && c >= 0 && v <= 0)
      return o = c / (c - v), n.copy(i).addScaledVector(zn, o);
    const m = h * v - p * u;
    if (m <= 0 && u - h >= 0 && p - v >= 0)
      return ea.subVectors(s, r), o = (u - h) / (u - h + (p - v)), n.copy(r).addScaledVector(ea, o);
    const d = 1 / (m + g + f);
    return a = g * d, o = f * d, n.copy(i).addScaledVector(Bn, a).addScaledVector(zn, o);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}, mo = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, ln = {
  h: 0,
  s: 0,
  l: 0
}, Vi = {
  h: 0,
  s: 0,
  l: 0
};
function Xr(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e;
}
var ke = class {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const i = e;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i);
    } else this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = zt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, je.colorSpaceToWorking(this, t), this;
  }
  setRGB(e, t, n, i = je.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, je.colorSpaceToWorking(this, i), this;
  }
  setHSL(e, t, n, i = je.workingColorSpace) {
    if (e = Ts(e, 1), t = Ve(t, 0, 1), n = Ve(n, 0, 1), t === 0) this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, s = 2 * n - r;
      this.r = Xr(s, r, e + 1 / 3), this.g = Xr(s, r, e), this.b = Xr(s, r, e - 1 / 3);
    }
    return je.colorSpaceToWorking(this, i), this;
  }
  setStyle(e, t = zt) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let r;
      const s = i[1], a = i[2];
      switch (s) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, t);
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, t);
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, t);
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const r = i[1], s = r.length;
      if (s === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, t);
      if (s === 6) return this.setHex(parseInt(r, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0) return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = zt) {
    const n = mo[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = en(e.r), this.g = en(e.g), this.b = en(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Zn(e.r), this.g = Zn(e.g), this.b = Zn(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = zt) {
    return je.workingToColorSpace(xt.copy(this), e), Math.round(Ve(xt.r * 255, 0, 255)) * 65536 + Math.round(Ve(xt.g * 255, 0, 255)) * 256 + Math.round(Ve(xt.b * 255, 0, 255));
  }
  getHexString(e = zt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = je.workingColorSpace) {
    je.workingToColorSpace(xt.copy(this), t);
    const n = xt.r, i = xt.g, r = xt.b, s = Math.max(n, i, r), a = Math.min(n, i, r);
    let o, l;
    const c = (a + s) / 2;
    if (a === s)
      o = 0, l = 0;
    else {
      const h = s - a;
      switch (l = c <= 0.5 ? h / (s + a) : h / (2 - s - a), s) {
        case n:
          o = (i - r) / h + (i < r ? 6 : 0);
          break;
        case i:
          o = (r - n) / h + 2;
          break;
        case r:
          o = (n - i) / h + 4;
          break;
      }
      o /= 6;
    }
    return e.h = o, e.s = l, e.l = c, e;
  }
  getRGB(e, t = je.workingColorSpace) {
    return je.workingToColorSpace(xt.copy(this), t), e.r = xt.r, e.g = xt.g, e.b = xt.b, e;
  }
  getStyle(e = zt) {
    je.workingToColorSpace(xt.copy(this), e);
    const t = xt.r, n = xt.g, i = xt.b;
    return e !== "srgb" ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(ln), this.setHSL(ln.h + e, ln.s + t, ln.l + n);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  lerpHSL(e, t) {
    this.getHSL(ln), e.getHSL(Vi);
    const n = xi(ln.h, Vi.h, t), i = xi(ln.s, Vi.s, t), r = xi(ln.l, Vi.l, t);
    return this.setHSL(n, i, r), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, n = this.g, i = this.b, r = e.elements;
    return this.r = r[0] * t + r[3] * n + r[6] * i, this.g = r[1] * t + r[4] * n + r[7] * i, this.b = r[2] * t + r[5] * n + r[8] * i, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}, xt = /* @__PURE__ */ new ke();
ke.NAMES = mo;
var Jc = 0, fn = class extends Cn {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Jc++ }), this.uuid = Lt(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new ke(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = wr, this.stencilZFail = wr, this.stencilZPass = wr, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const i = this[t];
        if (i === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = { metadata: {
      version: 4.7,
      type: "Material",
      generator: "Material.toJSON"
    } };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== 1 && (n.blending = this.blending), this.side !== 0 && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== 204 && (n.blendSrc = this.blendSrc), this.blendDst !== 205 && (n.blendDst = this.blendDst), this.blendEquation !== 100 && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== 3 && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== 519 && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== 7680 && (n.stencilFail = this.stencilFail), this.stencilZFail !== 7680 && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== 7680 && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function i(r) {
      const s = [];
      for (const a in r) {
        const o = r[a];
        delete o.metadata, s.push(o);
      }
      return s;
    }
    if (t) {
      const r = i(e.textures), s = i(e.images);
      r.length > 0 && (n.textures = r), s.length > 0 && (n.images = s);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const i = t.length;
      n = new Array(i);
      for (let r = 0; r !== i; ++r) n[r] = t[r].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}, go = class extends fn {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ke(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new tn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}, ut = /* @__PURE__ */ new P(), Hi = /* @__PURE__ */ new oe(), Zc = 0, It = class {
  constructor(e, t, n = !1) {
    if (Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Zc++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = ao, this.updateRanges = [], this.gpuType = Ri, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let i = 0, r = this.itemSize; i < r; i++) this.array[e + i] = t.array[n + i];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2) for (let t = 0, n = this.count; t < n; t++)
      Hi.fromBufferAttribute(this, t), Hi.applyMatrix3(e), this.setXY(t, Hi.x, Hi.y);
    else if (this.itemSize === 3) for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyMatrix3(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyMatrix4(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyNormalMatrix(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.transformDirection(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = Vt(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = Qe(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = Vt(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = Qe(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = Vt(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = Qe(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = Vt(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = Qe(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = Vt(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = Qe(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = Qe(t, this.array), n = Qe(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = Qe(t, this.array), n = Qe(n, this.array), i = Qe(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = Qe(t, this.array), n = Qe(n, this.array), i = Qe(i, this.array), r = Qe(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e;
  }
}, vo = class extends It {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}, _o = class extends It {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}, Je = class extends It {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}, Kc = 0, Ct = /* @__PURE__ */ new Ye(), qr = /* @__PURE__ */ new mt(), Vn = /* @__PURE__ */ new P(), bt = /* @__PURE__ */ new un(), ui = /* @__PURE__ */ new un(), pt = /* @__PURE__ */ new P(), yt = class xo extends Cn {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Kc++ }), this.uuid = Lt(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
      start: 0,
      count: 1 / 0
    }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (ho(t) ? _o : vo)(t, 1) : this.index = t, this;
  }
  setIndirect(t) {
    return this.indirect = t, this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, n) {
    return this.attributes[t] = n, this;
  }
  deleteAttribute(t) {
    return delete this.attributes[t], this;
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, n, i = 0) {
    this.groups.push({
      start: t,
      count: n,
      materialIndex: i
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, n) {
    this.drawRange.start = t, this.drawRange.count = n;
  }
  applyMatrix4(t) {
    const n = this.attributes.position;
    n !== void 0 && (n.applyMatrix4(t), n.needsUpdate = !0);
    const i = this.attributes.normal;
    if (i !== void 0) {
      const s = new Xe().getNormalMatrix(t);
      i.applyNormalMatrix(s), i.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(t), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(t) {
    return Ct.makeRotationFromQuaternion(t), this.applyMatrix4(Ct), this;
  }
  rotateX(t) {
    return Ct.makeRotationX(t), this.applyMatrix4(Ct), this;
  }
  rotateY(t) {
    return Ct.makeRotationY(t), this.applyMatrix4(Ct), this;
  }
  rotateZ(t) {
    return Ct.makeRotationZ(t), this.applyMatrix4(Ct), this;
  }
  translate(t, n, i) {
    return Ct.makeTranslation(t, n, i), this.applyMatrix4(Ct), this;
  }
  scale(t, n, i) {
    return Ct.makeScale(t, n, i), this.applyMatrix4(Ct), this;
  }
  lookAt(t) {
    return qr.lookAt(t), qr.updateMatrix(), this.applyMatrix4(qr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Vn).negate(), this.translate(Vn.x, Vn.y, Vn.z), this;
  }
  setFromPoints(t) {
    const n = this.getAttribute("position");
    if (n === void 0) {
      const i = [];
      for (let r = 0, s = t.length; r < s; r++) {
        const a = t[r];
        i.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new Je(i, 3));
    } else {
      const i = Math.min(t.length, n.count);
      for (let r = 0; r < i; r++) {
        const s = t[r];
        n.setXYZ(r, s.x, s.y, s.z || 0);
      }
      t.length > n.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), n.needsUpdate = !0;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new un());
    const t = this.attributes.position, n = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new P(-1 / 0, -1 / 0, -1 / 0), new P(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), n) for (let i = 0, r = n.length; i < r; i++) {
        const s = n[i];
        bt.setFromBufferAttribute(s), this.morphTargetsRelative ? (pt.addVectors(this.boundingBox.min, bt.min), this.boundingBox.expandByPoint(pt), pt.addVectors(this.boundingBox.max, bt.max), this.boundingBox.expandByPoint(pt)) : (this.boundingBox.expandByPoint(bt.min), this.boundingBox.expandByPoint(bt.max));
      }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new nn());
    const t = this.attributes.position, n = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new P(), 1 / 0);
      return;
    }
    if (t) {
      const i = this.boundingSphere.center;
      if (bt.setFromBufferAttribute(t), n) for (let s = 0, a = n.length; s < a; s++) {
        const o = n[s];
        ui.setFromBufferAttribute(o), this.morphTargetsRelative ? (pt.addVectors(bt.min, ui.min), bt.expandByPoint(pt), pt.addVectors(bt.max, ui.max), bt.expandByPoint(pt)) : (bt.expandByPoint(ui.min), bt.expandByPoint(ui.max));
      }
      bt.getCenter(i);
      let r = 0;
      for (let s = 0, a = t.count; s < a; s++)
        pt.fromBufferAttribute(t, s), r = Math.max(r, i.distanceToSquared(pt));
      if (n) for (let s = 0, a = n.length; s < a; s++) {
        const o = n[s], l = this.morphTargetsRelative;
        for (let c = 0, h = o.count; c < h; c++)
          pt.fromBufferAttribute(o, c), l && (Vn.fromBufferAttribute(t, c), pt.add(Vn)), r = Math.max(r, i.distanceToSquared(pt));
      }
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const t = this.index, n = this.attributes;
    if (t === null || n.position === void 0 || n.normal === void 0 || n.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const i = n.position, r = n.normal, s = n.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new It(new Float32Array(4 * i.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let U = 0; U < i.count; U++)
      o[U] = new P(), l[U] = new P();
    const c = new P(), h = new P(), u = new P(), f = new oe(), p = new oe(), v = new oe(), g = new P(), m = new P();
    function d(U, E, M) {
      c.fromBufferAttribute(i, U), h.fromBufferAttribute(i, E), u.fromBufferAttribute(i, M), f.fromBufferAttribute(s, U), p.fromBufferAttribute(s, E), v.fromBufferAttribute(s, M), h.sub(c), u.sub(c), p.sub(f), v.sub(f);
      const w = 1 / (p.x * v.y - v.x * p.y);
      isFinite(w) && (g.copy(h).multiplyScalar(v.y).addScaledVector(u, -p.y).multiplyScalar(w), m.copy(u).multiplyScalar(p.x).addScaledVector(h, -v.x).multiplyScalar(w), o[U].add(g), o[E].add(g), o[M].add(g), l[U].add(m), l[E].add(m), l[M].add(m));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: t.count
    }]);
    for (let U = 0, E = T.length; U < E; ++U) {
      const M = T[U], w = M.start, F = M.count;
      for (let H = w, B = w + F; H < B; H += 3) d(t.getX(H + 0), t.getX(H + 1), t.getX(H + 2));
    }
    const _ = new P(), S = new P(), L = new P(), A = new P();
    function C(U) {
      L.fromBufferAttribute(r, U), A.copy(L);
      const E = o[U];
      _.copy(E), _.sub(L.multiplyScalar(L.dot(E))).normalize(), S.crossVectors(A, E);
      const M = S.dot(l[U]) < 0 ? -1 : 1;
      a.setXYZW(U, _.x, _.y, _.z, M);
    }
    for (let U = 0, E = T.length; U < E; ++U) {
      const M = T[U], w = M.start, F = M.count;
      for (let H = w, B = w + F; H < B; H += 3)
        C(t.getX(H + 0)), C(t.getX(H + 1)), C(t.getX(H + 2));
    }
  }
  computeVertexNormals() {
    const t = this.index, n = this.getAttribute("position");
    if (n !== void 0) {
      let i = this.getAttribute("normal");
      if (i === void 0)
        i = new It(new Float32Array(n.count * 3), 3), this.setAttribute("normal", i);
      else for (let f = 0, p = i.count; f < p; f++) i.setXYZ(f, 0, 0, 0);
      const r = new P(), s = new P(), a = new P(), o = new P(), l = new P(), c = new P(), h = new P(), u = new P();
      if (t) for (let f = 0, p = t.count; f < p; f += 3) {
        const v = t.getX(f + 0), g = t.getX(f + 1), m = t.getX(f + 2);
        r.fromBufferAttribute(n, v), s.fromBufferAttribute(n, g), a.fromBufferAttribute(n, m), h.subVectors(a, s), u.subVectors(r, s), h.cross(u), o.fromBufferAttribute(i, v), l.fromBufferAttribute(i, g), c.fromBufferAttribute(i, m), o.add(h), l.add(h), c.add(h), i.setXYZ(v, o.x, o.y, o.z), i.setXYZ(g, l.x, l.y, l.z), i.setXYZ(m, c.x, c.y, c.z);
      }
      else for (let f = 0, p = n.count; f < p; f += 3)
        r.fromBufferAttribute(n, f + 0), s.fromBufferAttribute(n, f + 1), a.fromBufferAttribute(n, f + 2), h.subVectors(a, s), u.subVectors(r, s), h.cross(u), i.setXYZ(f + 0, h.x, h.y, h.z), i.setXYZ(f + 1, h.x, h.y, h.z), i.setXYZ(f + 2, h.x, h.y, h.z);
      this.normalizeNormals(), i.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let n = 0, i = t.count; n < i; n++)
      pt.fromBufferAttribute(t, n), pt.normalize(), t.setXYZ(n, pt.x, pt.y, pt.z);
  }
  toNonIndexed() {
    function t(o, l) {
      const c = o.array, h = o.itemSize, u = o.normalized, f = new c.constructor(l.length * h);
      let p = 0, v = 0;
      for (let g = 0, m = l.length; g < m; g++) {
        o.isInterleavedBufferAttribute ? p = l[g] * o.data.stride + o.offset : p = l[g] * h;
        for (let d = 0; d < h; d++) f[v++] = c[p++];
      }
      return new It(f, h, u);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const n = new xo(), i = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = t(l, i);
      n.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, u = c.length; h < u; h++) {
        const f = c[h], p = t(f, i);
        l.push(p);
      }
      n.morphAttributes[o] = l;
    }
    n.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      n.addGroup(c.start, c.count, c.materialIndex);
    }
    return n;
  }
  toJSON() {
    const t = { metadata: {
      version: 4.7,
      type: "BufferGeometry",
      generator: "BufferGeometry.toJSON"
    } };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const n = this.index;
    n !== null && (t.data.index = {
      type: n.array.constructor.name,
      array: Array.prototype.slice.call(n.array)
    });
    const i = this.attributes;
    for (const l in i) {
      const c = i[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let u = 0, f = c.length; u < f; u++) {
        const p = c[u];
        h.push(p.toJSON(t.data));
      }
      h.length > 0 && (r[l] = h, s = !0);
    }
    s && (t.data.morphAttributes = r, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (t.data.boundingSphere = o.toJSON()), t;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const n = {};
    this.name = t.name;
    const i = t.index;
    i !== null && this.setIndex(i.clone());
    const r = t.attributes;
    for (const c in r) {
      const h = r[c];
      this.setAttribute(c, h.clone(n));
    }
    const s = t.morphAttributes;
    for (const c in s) {
      const h = [], u = s[c];
      for (let f = 0, p = u.length; f < p; f++) h.push(u[f].clone(n));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const u = a[c];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = t.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}, ta = /* @__PURE__ */ new Ye(), vn = /* @__PURE__ */ new Ci(), ki = /* @__PURE__ */ new nn(), na = /* @__PURE__ */ new P(), Gi = /* @__PURE__ */ new P(), Wi = /* @__PURE__ */ new P(), Xi = /* @__PURE__ */ new P(), Yr = /* @__PURE__ */ new P(), qi = /* @__PURE__ */ new P(), ia = /* @__PURE__ */ new P(), Yi = /* @__PURE__ */ new P(), Pt = class extends mt {
  constructor(e = new yt(), t = new go()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, t = Object.keys(e);
    if (t.length > 0) {
      const n = e[t[0]];
      if (n !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let i = 0, r = n.length; i < r; i++) {
          const s = n[i].name || String(i);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[s] = i;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry, i = n.attributes.position, r = n.morphAttributes.position, s = n.morphTargetsRelative;
    t.fromBufferAttribute(i, e);
    const a = this.morphTargetInfluences;
    if (r && a) {
      qi.set(0, 0, 0);
      for (let o = 0, l = r.length; o < l; o++) {
        const c = a[o], h = r[o];
        c !== 0 && (Yr.fromBufferAttribute(h, e), s ? qi.addScaledVector(Yr, c) : qi.addScaledVector(Yr.sub(t), c));
      }
      t.add(qi);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), ki.copy(n.boundingSphere), ki.applyMatrix4(r), vn.copy(e.ray).recast(e.near), !(ki.containsPoint(vn.origin) === !1 && (vn.intersectSphere(ki, na) === null || vn.origin.distanceToSquared(na) > (e.far - e.near) ** 2)) && (ta.copy(r).invert(), vn.copy(e.ray).applyMatrix4(ta), !(n.boundingBox !== null && vn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, vn)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, s = this.material, a = r.index, o = r.attributes.position, l = r.attributes.uv, c = r.attributes.uv1, h = r.attributes.normal, u = r.groups, f = r.drawRange;
    if (a !== null) if (Array.isArray(s)) for (let p = 0, v = u.length; p < v; p++) {
      const g = u[p], m = s[g.materialIndex], d = Math.max(g.start, f.start), T = Math.min(a.count, Math.min(g.start + g.count, f.start + f.count));
      for (let _ = d, S = T; _ < S; _ += 3) {
        const L = a.getX(_), A = a.getX(_ + 1), C = a.getX(_ + 2);
        i = Ji(this, m, e, n, l, c, h, L, A, C), i && (i.faceIndex = Math.floor(_ / 3), i.face.materialIndex = g.materialIndex, t.push(i));
      }
    }
    else {
      const p = Math.max(0, f.start), v = Math.min(a.count, f.start + f.count);
      for (let g = p, m = v; g < m; g += 3) {
        const d = a.getX(g), T = a.getX(g + 1), _ = a.getX(g + 2);
        i = Ji(this, s, e, n, l, c, h, d, T, _), i && (i.faceIndex = Math.floor(g / 3), t.push(i));
      }
    }
    else if (o !== void 0) if (Array.isArray(s)) for (let p = 0, v = u.length; p < v; p++) {
      const g = u[p], m = s[g.materialIndex], d = Math.max(g.start, f.start), T = Math.min(o.count, Math.min(g.start + g.count, f.start + f.count));
      for (let _ = d, S = T; _ < S; _ += 3) {
        const L = _, A = _ + 1, C = _ + 2;
        i = Ji(this, m, e, n, l, c, h, L, A, C), i && (i.faceIndex = Math.floor(_ / 3), i.face.materialIndex = g.materialIndex, t.push(i));
      }
    }
    else {
      const p = Math.max(0, f.start), v = Math.min(o.count, f.start + f.count);
      for (let g = p, m = v; g < m; g += 3) {
        const d = g, T = g + 1, _ = g + 2;
        i = Ji(this, s, e, n, l, c, h, d, T, _), i && (i.faceIndex = Math.floor(g / 3), t.push(i));
      }
    }
  }
};
function $c(e, t, n, i, r, s, a, o) {
  let l;
  if (t.side === 1 ? l = i.intersectTriangle(a, s, r, !0, o) : l = i.intersectTriangle(r, s, a, t.side === 0, o), l === null) return null;
  Yi.copy(o), Yi.applyMatrix4(e.matrixWorld);
  const c = n.ray.origin.distanceTo(Yi);
  return c < n.near || c > n.far ? null : {
    distance: c,
    point: Yi.clone(),
    object: e
  };
}
function Ji(e, t, n, i, r, s, a, o, l, c) {
  e.getVertexPosition(o, Gi), e.getVertexPosition(l, Wi), e.getVertexPosition(c, Xi);
  const h = $c(e, t, n, i, Gi, Wi, Xi, ia);
  if (h) {
    const u = new P();
    hi.getBarycoord(ia, Gi, Wi, Xi, u), r && (h.uv = hi.getInterpolatedAttribute(r, o, l, c, u, new oe())), s && (h.uv1 = hi.getInterpolatedAttribute(s, o, l, c, u, new oe())), a && (h.normal = hi.getInterpolatedAttribute(a, o, l, c, u, new P()), h.normal.dot(i.direction) > 0 && h.normal.multiplyScalar(-1));
    const f = {
      a: o,
      b: l,
      c,
      normal: new P(),
      materialIndex: 0
    };
    hi.getNormal(Gi, Wi, Xi, f.normal), h.face = f, h.barycoord = u;
  }
  return h;
}
var ws = class yo extends yt {
  constructor(t = 1, n = 1, i = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: t,
      height: n,
      depth: i,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], c = [], h = [], u = [];
    let f = 0, p = 0;
    v("z", "y", "x", -1, -1, i, n, t, a, s, 0), v("z", "y", "x", 1, -1, i, n, -t, a, s, 1), v("x", "z", "y", 1, 1, t, i, n, r, a, 2), v("x", "z", "y", 1, -1, t, i, -n, r, a, 3), v("x", "y", "z", 1, -1, t, n, i, r, s, 4), v("x", "y", "z", -1, -1, t, n, -i, r, s, 5), this.setIndex(l), this.setAttribute("position", new Je(c, 3)), this.setAttribute("normal", new Je(h, 3)), this.setAttribute("uv", new Je(u, 2));
    function v(g, m, d, T, _, S, L, A, C, U, E) {
      const M = S / C, w = L / U, F = S / 2, H = L / 2, B = A / 2, Y = C + 1, k = U + 1;
      let ee = 0, W = 0;
      const se = new P();
      for (let pe = 0; pe < k; pe++) {
        const De = pe * w - H;
        for (let Fe = 0; Fe < Y; Fe++)
          se[g] = (Fe * M - F) * T, se[m] = De * _, se[d] = B, c.push(se.x, se.y, se.z), se[g] = 0, se[m] = 0, se[d] = A > 0 ? 1 : -1, h.push(se.x, se.y, se.z), u.push(Fe / C), u.push(1 - pe / U), ee += 1;
      }
      for (let pe = 0; pe < U; pe++) for (let De = 0; De < C; De++) {
        const Fe = f + De + Y * pe, nt = f + De + Y * (pe + 1), Ze = f + (De + 1) + Y * (pe + 1), q = f + (De + 1) + Y * pe;
        l.push(Fe, nt, q), l.push(nt, Ze, q), W += 6;
      }
      o.addGroup(p, W, E), p += W, f += ee;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new yo(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
};
function ei(e) {
  const t = {};
  for (const n in e) {
    t[n] = {};
    for (const i in e[n]) {
      const r = e[n][i];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[n][i] = null) : t[n][i] = r.clone() : Array.isArray(r) ? t[n][i] = r.slice() : t[n][i] = r;
    }
  }
  return t;
}
function St(e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const i = ei(e[n]);
    for (const r in i) t[r] = i[r];
  }
  return t;
}
function jc(e) {
  const t = [];
  for (let n = 0; n < e.length; n++) t.push(e[n].clone());
  return t;
}
function Mo(e) {
  const t = e.getRenderTarget();
  return t === null ? e.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : je.workingColorSpace;
}
var Qc = {
  clone: ei,
  merge: St
}, eh = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, th = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`, hn = class extends fn {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = eh, this.fragmentShader = th, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      multiDraw: !1
    }, this.defaultAttributeValues = {
      color: [
        1,
        1,
        1
      ],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = ei(e.uniforms), this.uniformsGroups = jc(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const i in this.uniforms) {
      const r = this.uniforms[i].value;
      r && r.isTexture ? t.uniforms[i] = {
        type: "t",
        value: r.toJSON(e).uuid
      } : r && r.isColor ? t.uniforms[i] = {
        type: "c",
        value: r.getHex()
      } : r && r.isVector2 ? t.uniforms[i] = {
        type: "v2",
        value: r.toArray()
      } : r && r.isVector3 ? t.uniforms[i] = {
        type: "v3",
        value: r.toArray()
      } : r && r.isVector4 ? t.uniforms[i] = {
        type: "v4",
        value: r.toArray()
      } : r && r.isMatrix3 ? t.uniforms[i] = {
        type: "m3",
        value: r.toArray()
      } : r && r.isMatrix4 ? t.uniforms[i] = {
        type: "m4",
        value: r.toArray()
      } : t.uniforms[i] = { value: r };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions) this.extensions[i] === !0 && (n[i] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}, So = class extends mt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Ye(), this.projectionMatrix = new Ye(), this.projectionMatrixInverse = new Ye(), this.coordinateSystem = jn, this._reversedDepth = !1;
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, cn = /* @__PURE__ */ new P(), ra = /* @__PURE__ */ new oe(), sa = /* @__PURE__ */ new oe(), At = class extends So {
  constructor(e = 50, t = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = Qn * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const e = Math.tan(_i * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Qn * 2 * Math.atan(Math.tan(_i * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(e, t, n) {
    cn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(cn.x, cn.y).multiplyScalar(-e / cn.z), cn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(cn.x, cn.y).multiplyScalar(-e / cn.z);
  }
  getViewSize(e, t) {
    return this.getViewBounds(e, ra, sa), t.subVectors(sa, ra);
  }
  setViewOffset(e, t, n, i, r, s) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(_i * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
    const s = this.view;
    if (this.view !== null && this.view.enabled) {
      const o = s.fullWidth, l = s.fullHeight;
      r += s.offsetX * i / o, t -= s.offsetY * n / l, i *= s.width / o, n *= s.height / l;
    }
    const a = this.filmOffset;
    a !== 0 && (r += e * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}, Hn = -90, kn = 1, nh = class extends mt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new At(Hn, kn, e, t);
    i.layers = this.layers, this.add(i);
    const r = new At(Hn, kn, e, t);
    r.layers = this.layers, this.add(r);
    const s = new At(Hn, kn, e, t);
    s.layers = this.layers, this.add(s);
    const a = new At(Hn, kn, e, t);
    a.layers = this.layers, this.add(a);
    const o = new At(Hn, kn, e, t);
    o.layers = this.layers, this.add(o);
    const l = new At(Hn, kn, e, t);
    l.layers = this.layers, this.add(l);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, i, r, s, a, o] = t;
    for (const l of t) this.remove(l);
    if (e === 2e3)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), s.up.set(0, 0, 1), s.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), o.up.set(0, 1, 0), o.lookAt(0, 0, -1);
    else if (e === 2001)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), s.up.set(0, 0, -1), s.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), o.up.set(0, -1, 0), o.lookAt(0, 0, -1);
    else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const l of t)
      this.add(l), l.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [r, s, a, o, l, c] = this.children, h = e.getRenderTarget(), u = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
    e.xr.enabled = !1;
    const v = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, r), e.setRenderTarget(n, 1, i), e.render(t, s), e.setRenderTarget(n, 2, i), e.render(t, a), e.setRenderTarget(n, 3, i), e.render(t, o), e.setRenderTarget(n, 4, i), e.render(t, l), n.texture.generateMipmaps = v, e.setRenderTarget(n, 5, i), e.render(t, c), e.setRenderTarget(h, u, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0;
  }
}, Eo = class extends Ut {
  constructor(e = [], t = 301, n, i, r, s, a, o, l, c) {
    super(e, t, n, i, r, s, a, o, l, c), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}, ih = class extends wn {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = {
      width: e,
      height: e,
      depth: 1
    }, i = [
      n,
      n,
      n,
      n,
      n,
      n
    ];
    this.texture = new Eo(i), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: { tEquirect: { value: null } },
      vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
      fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
    }, i = new ws(5, 5, 5), r = new hn({
      name: "CubemapFromEquirect",
      uniforms: ei(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const s = new Pt(i, r), a = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = An), new nh(1, 10, this).update(e, s), t.minFilter = a, s.geometry.dispose(), s.material.dispose(), this;
  }
  clear(e, t = !0, n = !0, i = !0) {
    const r = e.getRenderTarget();
    for (let s = 0; s < 6; s++)
      e.setRenderTarget(this, s), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}, Zi = class extends mt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}, rh = { type: "move" }, Jr = class {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Zi(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Zi(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new P(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new P()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Zi(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new P(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new P()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t) for (const n of e.hand.values()) this._getHandJoint(t, n);
    }
    return this.dispatchEvent({
      type: "connected",
      data: e
    }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({
      type: "disconnected",
      data: e
    }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, n) {
    let i = null, r = null, s = null;
    const a = this._targetRay, o = this._grip, l = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (l && e.hand) {
        s = !0;
        for (const v of e.hand.values()) {
          const g = t.getJointPose(v, n), m = this._getHandJoint(l, v);
          g !== null && (m.matrix.fromArray(g.transform.matrix), m.matrix.decompose(m.position, m.rotation, m.scale), m.matrixWorldNeedsUpdate = !0, m.jointRadius = g.radius), m.visible = g !== null;
        }
        const c = l.joints["index-finger-tip"], h = l.joints["thumb-tip"], u = c.position.distanceTo(h.position);
        l.inputState.pinching && u > 0.025 ? (l.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !l.inputState.pinching && u <= 0.02 - 5e-3 && (l.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else o !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1));
      a !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (a.matrix.fromArray(i.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(i.linearVelocity)) : a.hasLinearVelocity = !1, i.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(i.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(rh)));
    }
    return a !== null && (a.visible = i !== null), o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), this;
  }
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Zi();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}, Pd = class To {
  constructor(t, n = 1, i = 1e3) {
    this.isFog = !0, this.name = "", this.color = new ke(t), this.near = n, this.far = i;
  }
  clone() {
    return new To(this.color, this.near, this.far);
  }
  toJSON() {
    return {
      type: "Fog",
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    };
  }
}, Ld = class extends mt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new tn(), this.environmentIntensity = 1, this.environmentRotation = new tn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}, Id = class {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = ao, this.updateRanges = [], this.version = 0, this.uuid = Lt();
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
  }
  copyAt(e, t, n) {
    e *= this.stride, n *= t.stride;
    for (let i = 0, r = this.stride; i < r; i++) this.array[e + i] = t.array[n + i];
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  clone(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Lt()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(t, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Lt()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}, Mt = /* @__PURE__ */ new P(), Ud = class bo {
  constructor(t, n, i, r = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = t, this.itemSize = n, this.offset = i, this.normalized = r;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(t) {
    this.data.needsUpdate = t;
  }
  applyMatrix4(t) {
    for (let n = 0, i = this.data.count; n < i; n++)
      Mt.fromBufferAttribute(this, n), Mt.applyMatrix4(t), this.setXYZ(n, Mt.x, Mt.y, Mt.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let n = 0, i = this.count; n < i; n++)
      Mt.fromBufferAttribute(this, n), Mt.applyNormalMatrix(t), this.setXYZ(n, Mt.x, Mt.y, Mt.z);
    return this;
  }
  transformDirection(t) {
    for (let n = 0, i = this.count; n < i; n++)
      Mt.fromBufferAttribute(this, n), Mt.transformDirection(t), this.setXYZ(n, Mt.x, Mt.y, Mt.z);
    return this;
  }
  getComponent(t, n) {
    let i = this.array[t * this.data.stride + this.offset + n];
    return this.normalized && (i = Vt(i, this.array)), i;
  }
  setComponent(t, n, i) {
    return this.normalized && (i = Qe(i, this.array)), this.data.array[t * this.data.stride + this.offset + n] = i, this;
  }
  setX(t, n) {
    return this.normalized && (n = Qe(n, this.array)), this.data.array[t * this.data.stride + this.offset] = n, this;
  }
  setY(t, n) {
    return this.normalized && (n = Qe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = n, this;
  }
  setZ(t, n) {
    return this.normalized && (n = Qe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = n, this;
  }
  setW(t, n) {
    return this.normalized && (n = Qe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = n, this;
  }
  getX(t) {
    let n = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (n = Vt(n, this.array)), n;
  }
  getY(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (n = Vt(n, this.array)), n;
  }
  getZ(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (n = Vt(n, this.array)), n;
  }
  getW(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (n = Vt(n, this.array)), n;
  }
  setXY(t, n, i) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Qe(n, this.array), i = Qe(i, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this;
  }
  setXYZ(t, n, i, r) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Qe(n, this.array), i = Qe(i, this.array), r = Qe(r, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this.data.array[t + 2] = r, this;
  }
  setXYZW(t, n, i, r, s) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Qe(n, this.array), i = Qe(i, this.array), r = Qe(r, this.array), s = Qe(s, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this.data.array[t + 2] = r, this.data.array[t + 3] = s, this;
  }
  clone(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const n = [];
      for (let i = 0; i < this.count; i++) {
        const r = i * this.data.stride + this.offset;
        for (let s = 0; s < this.itemSize; s++) n.push(this.data.array[r + s]);
      }
      return new It(new this.array.constructor(n), this.itemSize, this.normalized);
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new bo(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const n = [];
      for (let i = 0; i < this.count; i++) {
        const r = i * this.data.stride + this.offset;
        for (let s = 0; s < this.itemSize; s++) n.push(this.data.array[r + s]);
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: n,
        normalized: this.normalized
      };
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), {
        isInterleavedBufferAttribute: !0,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
  }
}, aa = /* @__PURE__ */ new P(), oa = /* @__PURE__ */ new et(), la = /* @__PURE__ */ new et(), sh = /* @__PURE__ */ new P(), ca = /* @__PURE__ */ new Ye(), Ki = /* @__PURE__ */ new P(), Zr = /* @__PURE__ */ new nn(), ha = /* @__PURE__ */ new Ye(), Kr = /* @__PURE__ */ new Ci(), Dd = class extends Pt {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = vl, this.bindMatrix = new Ye(), this.bindMatrixInverse = new Ye(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new un()), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Ki), this.boundingBox.expandByPoint(Ki);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new nn()), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Ki), this.boundingSphere.expandByPoint(Ki);
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, t) {
    const n = this.material, i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Zr.copy(this.boundingSphere), Zr.applyMatrix4(i), e.ray.intersectsSphere(Zr) !== !1 && (ha.copy(i).invert(), Kr.copy(e.ray).applyMatrix4(ha), !(this.boundingBox !== null && Kr.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, Kr)));
  }
  getVertexPosition(e, t) {
    return super.getVertexPosition(e, t), this.applyBoneTransform(e, t), t;
  }
  bind(e, t) {
    this.skeleton = e, t === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.copy(t).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    const e = new et(), t = this.geometry.attributes.skinWeight;
    for (let n = 0, i = t.count; n < i; n++) {
      e.fromBufferAttribute(t, n);
      const r = 1 / e.manhattanLength();
      r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w);
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === "attached" ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === "detached" ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton, i = this.geometry;
    oa.fromBufferAttribute(i.attributes.skinIndex, e), la.fromBufferAttribute(i.attributes.skinWeight, e), aa.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const s = la.getComponent(r);
      if (s !== 0) {
        const a = oa.getComponent(r);
        ca.multiplyMatrices(n.bones[a].matrixWorld, n.boneInverses[a]), t.addScaledVector(sh.copy(aa).applyMatrix4(ca), s);
      }
    }
    return t.applyMatrix4(this.bindMatrixInverse);
  }
}, ah = class extends mt {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}, Ao = class extends Ut {
  constructor(e = null, t = 1, n = 1, i, r, s, a, o, l = Ht, c = Ht, h, u) {
    super(null, s, a, o, l, c, i, r, h, u), this.isDataTexture = !0, this.image = {
      data: e,
      width: t,
      height: n
    }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}, ua = /* @__PURE__ */ new Ye(), oh = /* @__PURE__ */ new Ye(), Nd = class wo {
  constructor(t = [], n = []) {
    this.uuid = Lt(), this.bones = t.slice(0), this.boneInverses = n, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const t = this.bones, n = this.boneInverses;
    if (this.boneMatrices = new Float32Array(t.length * 16), n.length === 0) this.calculateInverses();
    else if (t.length !== n.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let i = 0, r = this.bones.length; i < r; i++) this.boneInverses.push(new Ye());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let t = 0, n = this.bones.length; t < n; t++) {
      const i = new Ye();
      this.bones[t] && i.copy(this.bones[t].matrixWorld).invert(), this.boneInverses.push(i);
    }
  }
  pose() {
    for (let t = 0, n = this.bones.length; t < n; t++) {
      const i = this.bones[t];
      i && i.matrixWorld.copy(this.boneInverses[t]).invert();
    }
    for (let t = 0, n = this.bones.length; t < n; t++) {
      const i = this.bones[t];
      i && (i.parent && i.parent.isBone ? (i.matrix.copy(i.parent.matrixWorld).invert(), i.matrix.multiply(i.matrixWorld)) : i.matrix.copy(i.matrixWorld), i.matrix.decompose(i.position, i.quaternion, i.scale));
    }
  }
  update() {
    const t = this.bones, n = this.boneInverses, i = this.boneMatrices, r = this.boneTexture;
    for (let s = 0, a = t.length; s < a; s++) {
      const o = t[s] ? t[s].matrixWorld : oh;
      ua.multiplyMatrices(o, n[s]), ua.toArray(i, s * 16);
    }
    r !== null && (r.needsUpdate = !0);
  }
  clone() {
    return new wo(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let t = Math.sqrt(this.bones.length * 4);
    t = Math.ceil(t / 4) * 4, t = Math.max(t, 4);
    const n = new Float32Array(t * t * 4);
    n.set(this.boneMatrices);
    const i = new Ao(n, t, t, $n, Ri);
    return i.needsUpdate = !0, this.boneMatrices = n, this.boneTexture = i, this;
  }
  getBoneByName(t) {
    for (let n = 0, i = this.bones.length; n < i; n++) {
      const r = this.bones[n];
      if (r.name === t) return r;
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null);
  }
  fromJSON(t, n) {
    this.uuid = t.uuid;
    for (let i = 0, r = t.bones.length; i < r; i++) {
      const s = t.bones[i];
      let a = n[s];
      a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", s), a = new ah()), this.bones.push(a), this.boneInverses.push(new Ye().fromArray(t.boneInverses[i]));
    }
    return this.init(), this;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.7,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    t.uuid = this.uuid;
    const n = this.bones, i = this.boneInverses;
    for (let r = 0, s = n.length; r < s; r++) {
      const a = n[r];
      t.bones.push(a.uuid);
      const o = i[r];
      t.boneInverses.push(o.toArray());
    }
    return t;
  }
}, fa = class extends It {
  constructor(e, t, n, i = 1) {
    super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = i;
  }
  copy(e) {
    return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
  }
}, Gn = /* @__PURE__ */ new Ye(), da = /* @__PURE__ */ new Ye(), $i = [], pa = /* @__PURE__ */ new un(), lh = /* @__PURE__ */ new Ye(), fi = /* @__PURE__ */ new Pt(), di = /* @__PURE__ */ new nn(), Od = class extends Pt {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new fa(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++) this.setMatrixAt(i, lh);
  }
  computeBoundingBox() {
    const e = this.geometry, t = this.count;
    this.boundingBox === null && (this.boundingBox = new un()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Gn), pa.copy(e.boundingBox).applyMatrix4(Gn), this.boundingBox.union(pa);
  }
  computeBoundingSphere() {
    const e = this.geometry, t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new nn()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Gn), di.copy(e.boundingSphere).applyMatrix4(Gn), this.boundingSphere.union(di);
  }
  copy(e, t) {
    return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  getColorAt(e, t) {
    t.fromArray(this.instanceColor.array, e * 3);
  }
  getMatrixAt(e, t) {
    t.fromArray(this.instanceMatrix.array, e * 16);
  }
  getMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = this.morphTexture.source.data.data, r = e * (n.length + 1) + 1;
    for (let s = 0; s < n.length; s++) n[s] = i[r + s];
  }
  raycast(e, t) {
    const n = this.matrixWorld, i = this.count;
    if (fi.geometry = this.geometry, fi.material = this.material, fi.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), di.copy(this.boundingSphere), di.applyMatrix4(n), e.ray.intersectsSphere(di) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, Gn), da.multiplyMatrices(n, Gn), fi.matrixWorld = da, fi.raycast(e, $i);
        for (let s = 0, a = $i.length; s < a; s++) {
          const o = $i[s];
          o.instanceId = r, o.object = this, t.push(o);
        }
        $i.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null && (this.instanceColor = new fa(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new Ao(new Float32Array(i * this.count), i, this.count, so, Ri));
    const r = this.morphTexture.source.data.data;
    let s = 0;
    for (let l = 0; l < n.length; l++) s += n[l];
    const a = this.geometry.morphTargetsRelative ? 1 : 1 - s, o = i * e;
    r[o] = a, r.set(n, o + 1);
  }
  updateMorphTargets() {
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null);
  }
}, $r = /* @__PURE__ */ new P(), ch = /* @__PURE__ */ new P(), hh = /* @__PURE__ */ new Xe(), Mn = class {
  constructor(e = new P(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, n, i) {
    return this.normal.set(e, t, n), this.constant = i, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const i = $r.subVectors(n, t).cross(ch.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta($r), i = this.normal.dot(n);
    if (i === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const r = -(e.start.dot(this.normal) + this.constant) / i;
    return r < 0 || r > 1 ? null : t.copy(e.start).addScaledVector(n, r);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || hh.getNormalMatrix(e), i = this.coplanarPoint($r).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(r), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, _n = /* @__PURE__ */ new nn(), uh = /* @__PURE__ */ new oe(0.5, 0.5), ji = /* @__PURE__ */ new P(), Rs = class {
  constructor(e = new Mn(), t = new Mn(), n = new Mn(), i = new Mn(), r = new Mn(), s = new Mn()) {
    this.planes = [
      e,
      t,
      n,
      i,
      r,
      s
    ];
  }
  set(e, t, n, i, r, s) {
    const a = this.planes;
    return a[0].copy(e), a[1].copy(t), a[2].copy(n), a[3].copy(i), a[4].copy(r), a[5].copy(s), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = jn, n = !1) {
    const i = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], c = r[4], h = r[5], u = r[6], f = r[7], p = r[8], v = r[9], g = r[10], m = r[11], d = r[12], T = r[13], _ = r[14], S = r[15];
    if (i[0].setComponents(l - s, f - c, m - p, S - d).normalize(), i[1].setComponents(l + s, f + c, m + p, S + d).normalize(), i[2].setComponents(l + a, f + h, m + v, S + T).normalize(), i[3].setComponents(l - a, f - h, m - v, S - T).normalize(), n)
      i[4].setComponents(o, u, g, _).normalize(), i[5].setComponents(l - o, f - u, m - g, S - _).normalize();
    else if (i[4].setComponents(l - o, f - u, m - g, S - _).normalize(), t === 2e3) i[5].setComponents(l + o, f + u, m + g, S + _).normalize();
    else if (t === 2001) i[5].setComponents(o, u, g, _).normalize();
    else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), _n.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), _n.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(_n);
  }
  intersectsSprite(e) {
    return _n.center.set(0, 0, 0), _n.radius = 0.7071067811865476 + uh.distanceTo(e.center), _n.applyMatrix4(e.matrixWorld), this.intersectsSphere(_n);
  }
  intersectsSphere(e) {
    const t = this.planes, n = e.center, i = -e.radius;
    for (let r = 0; r < 6; r++) if (t[r].distanceToPoint(n) < i) return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = t[n];
      if (ji.x = i.normal.x > 0 ? e.max.x : e.min.x, ji.y = i.normal.y > 0 ? e.max.y : e.min.y, ji.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(ji) < 0) return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, Ro = class extends fn {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new ke(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}, gr = /* @__PURE__ */ new P(), vr = /* @__PURE__ */ new P(), ma = /* @__PURE__ */ new Ye(), pi = /* @__PURE__ */ new Ci(), Qi = /* @__PURE__ */ new nn(), jr = /* @__PURE__ */ new P(), ga = /* @__PURE__ */ new P(), Co = class extends mt {
  constructor(e = new yt(), t = new Ro()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [0];
      for (let i = 1, r = t.count; i < r; i++)
        gr.fromBufferAttribute(t, i - 1), vr.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += gr.distanceTo(vr);
      e.setAttribute("lineDistance", new Je(n, 1));
    } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Line.threshold, s = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Qi.copy(n.boundingSphere), Qi.applyMatrix4(i), Qi.radius += r, e.ray.intersectsSphere(Qi) === !1) return;
    ma.copy(i).invert(), pi.copy(e.ray).applyMatrix4(ma);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), o = a * a, l = this.isLineSegments ? 2 : 1, c = n.index, h = n.attributes.position;
    if (c !== null) {
      const u = Math.max(0, s.start), f = Math.min(c.count, s.start + s.count);
      for (let p = u, v = f - 1; p < v; p += l) {
        const g = c.getX(p), m = c.getX(p + 1), d = er(this, e, pi, o, g, m, p);
        d && t.push(d);
      }
      if (this.isLineLoop) {
        const p = c.getX(f - 1), v = c.getX(u), g = er(this, e, pi, o, p, v, f - 1);
        g && t.push(g);
      }
    } else {
      const u = Math.max(0, s.start), f = Math.min(h.count, s.start + s.count);
      for (let p = u, v = f - 1; p < v; p += l) {
        const g = er(this, e, pi, o, p, p + 1, p);
        g && t.push(g);
      }
      if (this.isLineLoop) {
        const p = er(this, e, pi, o, f - 1, u, f - 1);
        p && t.push(p);
      }
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, t = Object.keys(e);
    if (t.length > 0) {
      const n = e[t[0]];
      if (n !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let i = 0, r = n.length; i < r; i++) {
          const s = n[i].name || String(i);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[s] = i;
        }
      }
    }
  }
};
function er(e, t, n, i, r, s, a) {
  const o = e.geometry.attributes.position;
  if (gr.fromBufferAttribute(o, r), vr.fromBufferAttribute(o, s), n.distanceSqToSegment(gr, vr, jr, ga) > i) return;
  jr.applyMatrix4(e.matrixWorld);
  const l = t.ray.origin.distanceTo(jr);
  if (!(l < t.near || l > t.far))
    return {
      distance: l,
      point: ga.clone().applyMatrix4(e.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: e
    };
}
var va = /* @__PURE__ */ new P(), _a = /* @__PURE__ */ new P(), Fd = class extends Co {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let i = 0, r = t.count; i < r; i += 2)
        va.fromBufferAttribute(t, i), _a.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + va.distanceTo(_a);
      e.setAttribute("lineDistance", new Je(n, 1));
    } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}, Bd = class extends Co {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop";
  }
}, fh = class extends fn {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new ke(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}, xa = /* @__PURE__ */ new Ye(), ms = /* @__PURE__ */ new Ci(), tr = /* @__PURE__ */ new nn(), nr = /* @__PURE__ */ new P(), zd = class extends mt {
  constructor(e = new yt(), t = new fh()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Points.threshold, s = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), tr.copy(n.boundingSphere), tr.applyMatrix4(i), tr.radius += r, e.ray.intersectsSphere(tr) === !1) return;
    xa.copy(i).invert(), ms.copy(e.ray).applyMatrix4(xa);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), o = a * a, l = n.index, c = n.attributes.position;
    if (l !== null) {
      const h = Math.max(0, s.start), u = Math.min(l.count, s.start + s.count);
      for (let f = h, p = u; f < p; f++) {
        const v = l.getX(f);
        nr.fromBufferAttribute(c, v), ya(nr, v, o, i, e, t, this);
      }
    } else {
      const h = Math.max(0, s.start), u = Math.min(c.count, s.start + s.count);
      for (let f = h, p = u; f < p; f++)
        nr.fromBufferAttribute(c, f), ya(nr, f, o, i, e, t, this);
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, t = Object.keys(e);
    if (t.length > 0) {
      const n = e[t[0]];
      if (n !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let i = 0, r = n.length; i < r; i++) {
          const s = n[i].name || String(i);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[s] = i;
        }
      }
    }
  }
};
function ya(e, t, n, i, r, s, a) {
  const o = ms.distanceSqToPoint(e);
  if (o < n) {
    const l = new P();
    ms.closestPointToPoint(e, l), l.applyMatrix4(i);
    const c = r.ray.origin.distanceTo(l);
    if (c < r.near || c > r.far) return;
    s.push({
      distance: c,
      distanceToRay: Math.sqrt(o),
      point: l,
      index: t,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: a
    });
  }
}
var Po = class extends Ut {
  constructor(e, t, n = Ss, i, r, s, a = Ht, o = Ht, l, c = io, h = 1) {
    if (c !== 1026 && c !== 1027) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    super({
      width: e,
      height: t,
      depth: h
    }, i, r, s, a, o, c, n, l), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.source = new bs(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}, Lo = class extends Ut {
  constructor(e = null) {
    super(), this.sourceTexture = e, this.isExternalTexture = !0;
  }
  copy(e) {
    return super.copy(e), this.sourceTexture = e.sourceTexture, this;
  }
}, Vd = class Io extends yt {
  constructor(t = 1, n = 32, i = 0, r = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: t,
      segments: n,
      thetaStart: i,
      thetaLength: r
    }, n = Math.max(3, n);
    const s = [], a = [], o = [], l = [], c = new P(), h = new oe();
    a.push(0, 0, 0), o.push(0, 0, 1), l.push(0.5, 0.5);
    for (let u = 0, f = 3; u <= n; u++, f += 3) {
      const p = i + u / n * r;
      c.x = t * Math.cos(p), c.y = t * Math.sin(p), a.push(c.x, c.y, c.z), o.push(0, 0, 1), h.x = (a[f] / t + 1) / 2, h.y = (a[f + 1] / t + 1) / 2, l.push(h.x, h.y);
    }
    for (let u = 1; u <= n; u++) s.push(u, u + 1, 0);
    this.setIndex(s), this.setAttribute("position", new Je(a, 3)), this.setAttribute("normal", new Je(o, 3)), this.setAttribute("uv", new Je(l, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Io(t.radius, t.segments, t.thetaStart, t.thetaLength);
  }
}, dh = class Uo extends yt {
  constructor(t = 1, n = 1, i = 1, r = 32, s = 1, a = !1, o = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: t,
      radiusBottom: n,
      height: i,
      radialSegments: r,
      heightSegments: s,
      openEnded: a,
      thetaStart: o,
      thetaLength: l
    };
    const c = this;
    r = Math.floor(r), s = Math.floor(s);
    const h = [], u = [], f = [], p = [];
    let v = 0;
    const g = [], m = i / 2;
    let d = 0;
    T(), a === !1 && (t > 0 && _(!0), n > 0 && _(!1)), this.setIndex(h), this.setAttribute("position", new Je(u, 3)), this.setAttribute("normal", new Je(f, 3)), this.setAttribute("uv", new Je(p, 2));
    function T() {
      const S = new P(), L = new P();
      let A = 0;
      const C = (n - t) / i;
      for (let U = 0; U <= s; U++) {
        const E = [], M = U / s, w = M * (n - t) + t;
        for (let F = 0; F <= r; F++) {
          const H = F / r, B = H * l + o, Y = Math.sin(B), k = Math.cos(B);
          L.x = w * Y, L.y = -M * i + m, L.z = w * k, u.push(L.x, L.y, L.z), S.set(Y, C, k).normalize(), f.push(S.x, S.y, S.z), p.push(H, 1 - M), E.push(v++);
        }
        g.push(E);
      }
      for (let U = 0; U < r; U++) for (let E = 0; E < s; E++) {
        const M = g[E][U], w = g[E + 1][U], F = g[E + 1][U + 1], H = g[E][U + 1];
        (t > 0 || E !== 0) && (h.push(M, w, H), A += 3), (n > 0 || E !== s - 1) && (h.push(w, F, H), A += 3);
      }
      c.addGroup(d, A, 0), d += A;
    }
    function _(S) {
      const L = v, A = new oe(), C = new P();
      let U = 0;
      const E = S === !0 ? t : n, M = S === !0 ? 1 : -1;
      for (let F = 1; F <= r; F++)
        u.push(0, m * M, 0), f.push(0, M, 0), p.push(0.5, 0.5), v++;
      const w = v;
      for (let F = 0; F <= r; F++) {
        const H = F / r * l + o, B = Math.cos(H), Y = Math.sin(H);
        C.x = E * Y, C.y = m * M, C.z = E * B, u.push(C.x, C.y, C.z), f.push(0, M, 0), A.x = B * 0.5 + 0.5, A.y = Y * 0.5 * M + 0.5, p.push(A.x, A.y), v++;
      }
      for (let F = 0; F < r; F++) {
        const H = L + F, B = w + F;
        S === !0 ? h.push(B, B + 1, H) : h.push(B + 1, B, H), U += 3;
      }
      c.addGroup(d, U, S === !0 ? 1 : 2), d += U;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Uo(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
}, Hd = class Do extends dh {
  constructor(t = 1, n = 1, i = 32, r = 1, s = !1, a = 0, o = Math.PI * 2) {
    super(0, t, n, i, r, s, a, o), this.type = "ConeGeometry", this.parameters = {
      radius: t,
      height: n,
      radialSegments: i,
      heightSegments: r,
      openEnded: s,
      thetaStart: a,
      thetaLength: o
    };
  }
  static fromJSON(t) {
    return new Do(t.radius, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
}, No = class Oo extends yt {
  constructor(t = [], n = [], i = 1, r = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: t,
      indices: n,
      radius: i,
      detail: r
    };
    const s = [], a = [];
    o(r), c(i), h(), this.setAttribute("position", new Je(s, 3)), this.setAttribute("normal", new Je(s.slice(), 3)), this.setAttribute("uv", new Je(a, 2)), r === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(T) {
      const _ = new P(), S = new P(), L = new P();
      for (let A = 0; A < n.length; A += 3)
        p(n[A + 0], _), p(n[A + 1], S), p(n[A + 2], L), l(_, S, L, T);
    }
    function l(T, _, S, L) {
      const A = L + 1, C = [];
      for (let U = 0; U <= A; U++) {
        C[U] = [];
        const E = T.clone().lerp(S, U / A), M = _.clone().lerp(S, U / A), w = A - U;
        for (let F = 0; F <= w; F++) F === 0 && U === A ? C[U][F] = E : C[U][F] = E.clone().lerp(M, F / w);
      }
      for (let U = 0; U < A; U++) for (let E = 0; E < 2 * (A - U) - 1; E++) {
        const M = Math.floor(E / 2);
        E % 2 === 0 ? (f(C[U][M + 1]), f(C[U + 1][M]), f(C[U][M])) : (f(C[U][M + 1]), f(C[U + 1][M + 1]), f(C[U + 1][M]));
      }
    }
    function c(T) {
      const _ = new P();
      for (let S = 0; S < s.length; S += 3)
        _.x = s[S + 0], _.y = s[S + 1], _.z = s[S + 2], _.normalize().multiplyScalar(T), s[S + 0] = _.x, s[S + 1] = _.y, s[S + 2] = _.z;
    }
    function h() {
      const T = new P();
      for (let _ = 0; _ < s.length; _ += 3) {
        T.x = s[_ + 0], T.y = s[_ + 1], T.z = s[_ + 2];
        const S = m(T) / 2 / Math.PI + 0.5, L = d(T) / Math.PI + 0.5;
        a.push(S, 1 - L);
      }
      v(), u();
    }
    function u() {
      for (let T = 0; T < a.length; T += 6) {
        const _ = a[T + 0], S = a[T + 2], L = a[T + 4];
        Math.max(_, S, L) > 0.9 && Math.min(_, S, L) < 0.1 && (_ < 0.2 && (a[T + 0] += 1), S < 0.2 && (a[T + 2] += 1), L < 0.2 && (a[T + 4] += 1));
      }
    }
    function f(T) {
      s.push(T.x, T.y, T.z);
    }
    function p(T, _) {
      const S = T * 3;
      _.x = t[S + 0], _.y = t[S + 1], _.z = t[S + 2];
    }
    function v() {
      const T = new P(), _ = new P(), S = new P(), L = new P(), A = new oe(), C = new oe(), U = new oe();
      for (let E = 0, M = 0; E < s.length; E += 9, M += 6) {
        T.set(s[E + 0], s[E + 1], s[E + 2]), _.set(s[E + 3], s[E + 4], s[E + 5]), S.set(s[E + 6], s[E + 7], s[E + 8]), A.set(a[M + 0], a[M + 1]), C.set(a[M + 2], a[M + 3]), U.set(a[M + 4], a[M + 5]), L.copy(T).add(_).add(S).divideScalar(3);
        const w = m(L);
        g(A, M + 0, T, w), g(C, M + 2, _, w), g(U, M + 4, S, w);
      }
    }
    function g(T, _, S, L) {
      L < 0 && T.x === 1 && (a[_] = T.x - 1), S.x === 0 && S.z === 0 && (a[_] = L / 2 / Math.PI + 0.5);
    }
    function m(T) {
      return Math.atan2(T.z, -T.x);
    }
    function d(T) {
      return Math.atan2(-T.y, Math.sqrt(T.x * T.x + T.z * T.z));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Oo(t.vertices, t.indices, t.radius, t.details);
  }
}, kd = class Fo extends No {
  constructor(t = 1, n = 0) {
    const i = (1 + Math.sqrt(5)) / 2, r = 1 / i, s = [
      -1,
      -1,
      -1,
      -1,
      -1,
      1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      -1,
      -1,
      1,
      -1,
      1,
      1,
      1,
      -1,
      1,
      1,
      1,
      0,
      -r,
      -i,
      0,
      -r,
      i,
      0,
      r,
      -i,
      0,
      r,
      i,
      -r,
      -i,
      0,
      -r,
      i,
      0,
      r,
      -i,
      0,
      r,
      i,
      0,
      -i,
      0,
      -r,
      i,
      0,
      -r,
      -i,
      0,
      r,
      i,
      0,
      r
    ];
    super(s, [
      3,
      11,
      7,
      3,
      7,
      15,
      3,
      15,
      13,
      7,
      19,
      17,
      7,
      17,
      6,
      7,
      6,
      15,
      17,
      4,
      8,
      17,
      8,
      10,
      17,
      10,
      6,
      8,
      0,
      16,
      8,
      16,
      2,
      8,
      2,
      10,
      0,
      12,
      1,
      0,
      1,
      18,
      0,
      18,
      16,
      6,
      10,
      2,
      6,
      2,
      13,
      6,
      13,
      15,
      2,
      16,
      18,
      2,
      18,
      3,
      2,
      3,
      13,
      18,
      1,
      9,
      18,
      9,
      11,
      18,
      11,
      3,
      4,
      14,
      12,
      4,
      12,
      0,
      4,
      0,
      8,
      11,
      9,
      5,
      11,
      5,
      19,
      11,
      19,
      7,
      19,
      5,
      14,
      19,
      14,
      4,
      19,
      4,
      17,
      1,
      12,
      14,
      1,
      14,
      5,
      1,
      5,
      9
    ], t, n), this.type = "DodecahedronGeometry", this.parameters = {
      radius: t,
      detail: n
    };
  }
  static fromJSON(t) {
    return new Fo(t.radius, t.detail);
  }
}, qt = class {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null;
  }
  getPoint() {
    console.warn("THREE.Curve: .getPoint() not implemented.");
  }
  getPointAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getPoint(n, t);
  }
  getPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
    return t;
  }
  getSpacedPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
    return t;
  }
  getLength() {
    const e = this.getLengths();
    return e[e.length - 1];
  }
  getLengths(e = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
    this.needsUpdate = !1;
    const t = [];
    let n, i = this.getPoint(0), r = 0;
    t.push(0);
    for (let s = 1; s <= e; s++)
      n = this.getPoint(s / e), r += n.distanceTo(i), t.push(r), i = n;
    return this.cacheArcLengths = t, t;
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths();
  }
  getUtoTmapping(e, t = null) {
    const n = this.getLengths();
    let i = 0;
    const r = n.length;
    let s;
    t ? s = t : s = e * n[r - 1];
    let a = 0, o = r - 1, l;
    for (; a <= o; )
      if (i = Math.floor(a + (o - a) / 2), l = n[i] - s, l < 0) a = i + 1;
      else if (l > 0) o = i - 1;
      else {
        o = i;
        break;
      }
    if (i = o, n[i] === s) return i / (r - 1);
    const c = n[i], h = n[i + 1] - c, u = (s - c) / h;
    return (i + u) / (r - 1);
  }
  getTangent(e, t) {
    let i = e - 1e-4, r = e + 1e-4;
    i < 0 && (i = 0), r > 1 && (r = 1);
    const s = this.getPoint(i), a = this.getPoint(r), o = t || (s.isVector2 ? new oe() : new P());
    return o.copy(a).sub(s).normalize(), o;
  }
  getTangentAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getTangent(n, t);
  }
  computeFrenetFrames(e, t = !1) {
    const n = new P(), i = [], r = [], s = [], a = new P(), o = new Ye();
    for (let f = 0; f <= e; f++) {
      const p = f / e;
      i[f] = this.getTangentAt(p, new P());
    }
    r[0] = new P(), s[0] = new P();
    let l = Number.MAX_VALUE;
    const c = Math.abs(i[0].x), h = Math.abs(i[0].y), u = Math.abs(i[0].z);
    c <= l && (l = c, n.set(1, 0, 0)), h <= l && (l = h, n.set(0, 1, 0)), u <= l && n.set(0, 0, 1), a.crossVectors(i[0], n).normalize(), r[0].crossVectors(i[0], a), s[0].crossVectors(i[0], r[0]);
    for (let f = 1; f <= e; f++) {
      if (r[f] = r[f - 1].clone(), s[f] = s[f - 1].clone(), a.crossVectors(i[f - 1], i[f]), a.length() > Number.EPSILON) {
        a.normalize();
        const p = Math.acos(Ve(i[f - 1].dot(i[f]), -1, 1));
        r[f].applyMatrix4(o.makeRotationAxis(a, p));
      }
      s[f].crossVectors(i[f], r[f]);
    }
    if (t === !0) {
      let f = Math.acos(Ve(r[0].dot(r[e]), -1, 1));
      f /= e, i[0].dot(a.crossVectors(r[0], r[e])) > 0 && (f = -f);
      for (let p = 1; p <= e; p++)
        r[p].applyMatrix4(o.makeRotationAxis(i[p], f * p)), s[p].crossVectors(i[p], r[p]);
    }
    return {
      tangents: i,
      normals: r,
      binormals: s
    };
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
  toJSON() {
    const e = { metadata: {
      version: 4.7,
      type: "Curve",
      generator: "Curve.toJSON"
    } };
    return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
  }
  fromJSON(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
}, Cs = class extends qt {
  constructor(e = 0, t = 0, n = 1, i = 1, r = 0, s = Math.PI * 2, a = !1, o = 0) {
    super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = n, this.yRadius = i, this.aStartAngle = r, this.aEndAngle = s, this.aClockwise = a, this.aRotation = o;
  }
  getPoint(e, t = new oe()) {
    const n = t, i = Math.PI * 2;
    let r = this.aEndAngle - this.aStartAngle;
    const s = Math.abs(r) < Number.EPSILON;
    for (; r < 0; ) r += i;
    for (; r > i; ) r -= i;
    r < Number.EPSILON && (s ? r = 0 : r = i), this.aClockwise === !0 && !s && (r === i ? r = -i : r = r - i);
    const a = this.aStartAngle + e * r;
    let o = this.aX + this.xRadius * Math.cos(a), l = this.aY + this.yRadius * Math.sin(a);
    if (this.aRotation !== 0) {
      const c = Math.cos(this.aRotation), h = Math.sin(this.aRotation), u = o - this.aX, f = l - this.aY;
      o = u * c - f * h + this.aX, l = u * h + f * c + this.aY;
    }
    return n.set(o, l);
  }
  copy(e) {
    return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
}, ph = class extends Cs {
  constructor(e, t, n, i, r, s) {
    super(e, t, n, n, i, r, s), this.isArcCurve = !0, this.type = "ArcCurve";
  }
};
function Ps() {
  let e = 0, t = 0, n = 0, i = 0;
  function r(s, a, o, l) {
    e = s, t = o, n = -3 * s + 3 * a - 2 * o - l, i = 2 * s - 2 * a + o + l;
  }
  return {
    initCatmullRom: function(s, a, o, l, c) {
      r(a, o, c * (o - s), c * (l - a));
    },
    initNonuniformCatmullRom: function(s, a, o, l, c, h, u) {
      let f = (a - s) / c - (o - s) / (c + h) + (o - a) / h, p = (o - a) / h - (l - a) / (h + u) + (l - o) / u;
      f *= h, p *= h, r(a, o, f, p);
    },
    calc: function(s) {
      const a = s * s, o = a * s;
      return e + t * s + n * a + i * o;
    }
  };
}
var ir = /* @__PURE__ */ new P(), Qr = /* @__PURE__ */ new Ps(), es = /* @__PURE__ */ new Ps(), ts = /* @__PURE__ */ new Ps(), mh = class extends qt {
  constructor(e = [], t = !1, n = "centripetal", i = 0.5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = n, this.tension = i;
  }
  getPoint(e, t = new P()) {
    const n = t, i = this.points, r = i.length, s = (r - (this.closed ? 0 : 1)) * e;
    let a = Math.floor(s), o = s - a;
    this.closed ? a += a > 0 ? 0 : (Math.floor(Math.abs(a) / r) + 1) * r : o === 0 && a === r - 1 && (a = r - 2, o = 1);
    let l, c;
    this.closed || a > 0 ? l = i[(a - 1) % r] : (ir.subVectors(i[0], i[1]).add(i[0]), l = ir);
    const h = i[a % r], u = i[(a + 1) % r];
    if (this.closed || a + 2 < r ? c = i[(a + 2) % r] : (ir.subVectors(i[r - 1], i[r - 2]).add(i[r - 1]), c = ir), this.curveType === "centripetal" || this.curveType === "chordal") {
      const f = this.curveType === "chordal" ? 0.5 : 0.25;
      let p = Math.pow(l.distanceToSquared(h), f), v = Math.pow(h.distanceToSquared(u), f), g = Math.pow(u.distanceToSquared(c), f);
      v < 1e-4 && (v = 1), p < 1e-4 && (p = v), g < 1e-4 && (g = v), Qr.initNonuniformCatmullRom(l.x, h.x, u.x, c.x, p, v, g), es.initNonuniformCatmullRom(l.y, h.y, u.y, c.y, p, v, g), ts.initNonuniformCatmullRom(l.z, h.z, u.z, c.z, p, v, g);
    } else this.curveType === "catmullrom" && (Qr.initCatmullRom(l.x, h.x, u.x, c.x, this.tension), es.initCatmullRom(l.y, h.y, u.y, c.y, this.tension), ts.initCatmullRom(l.z, h.z, u.z, c.z, this.tension));
    return n.set(Qr.calc(o), es.calc(o), ts.calc(o)), n;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(i.clone());
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, n = this.points.length; t < n; t++) {
      const i = this.points[t];
      e.points.push(i.toArray());
    }
    return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(new P().fromArray(i));
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
};
function Ma(e, t, n, i, r) {
  const s = (i - t) * 0.5, a = (r - n) * 0.5, o = e * e, l = e * o;
  return (2 * n - 2 * i + s + a) * l + (-3 * n + 3 * i - 2 * s - a) * o + s * e + n;
}
function gh(e, t) {
  const n = 1 - e;
  return n * n * t;
}
function vh(e, t) {
  return 2 * (1 - e) * e * t;
}
function _h(e, t) {
  return e * e * t;
}
function yi(e, t, n, i) {
  return gh(e, t) + vh(e, n) + _h(e, i);
}
function xh(e, t) {
  const n = 1 - e;
  return n * n * n * t;
}
function yh(e, t) {
  const n = 1 - e;
  return 3 * n * n * e * t;
}
function Mh(e, t) {
  return 3 * (1 - e) * e * e * t;
}
function Sh(e, t) {
  return e * e * e * t;
}
function Mi(e, t, n, i, r) {
  return xh(e, t) + yh(e, n) + Mh(e, i) + Sh(e, r);
}
var Bo = class extends qt {
  constructor(e = new oe(), t = new oe(), n = new oe(), i = new oe()) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = i;
  }
  getPoint(e, t = new oe()) {
    const n = t, i = this.v0, r = this.v1, s = this.v2, a = this.v3;
    return n.set(Mi(e, i.x, r.x, s.x, a.x), Mi(e, i.y, r.y, s.y, a.y)), n;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
  }
}, Eh = class extends qt {
  constructor(e = new P(), t = new P(), n = new P(), i = new P()) {
    super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = i;
  }
  getPoint(e, t = new P()) {
    const n = t, i = this.v0, r = this.v1, s = this.v2, a = this.v3;
    return n.set(Mi(e, i.x, r.x, s.x, a.x), Mi(e, i.y, r.y, s.y, a.y), Mi(e, i.z, r.z, s.z, a.z)), n;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
  }
}, zo = class extends qt {
  constructor(e = new oe(), t = new oe()) {
    super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = t;
  }
  getPoint(e, t = new oe()) {
    const n = t;
    return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n;
  }
  getPointAt(e, t) {
    return this.getPoint(e, t);
  }
  getTangent(e, t = new oe()) {
    return t.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t);
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}, Th = class extends qt {
  constructor(e = new P(), t = new P()) {
    super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = t;
  }
  getPoint(e, t = new P()) {
    const n = t;
    return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n;
  }
  getPointAt(e, t) {
    return this.getPoint(e, t);
  }
  getTangent(e, t = new P()) {
    return t.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t);
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}, Vo = class extends qt {
  constructor(e = new oe(), t = new oe(), n = new oe()) {
    super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n;
  }
  getPoint(e, t = new oe()) {
    const n = t, i = this.v0, r = this.v1, s = this.v2;
    return n.set(yi(e, i.x, r.x, s.x), yi(e, i.y, r.y, s.y)), n;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}, bh = class extends qt {
  constructor(e = new P(), t = new P(), n = new P()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n;
  }
  getPoint(e, t = new P()) {
    const n = t, i = this.v0, r = this.v1, s = this.v2;
    return n.set(yi(e, i.x, r.x, s.x), yi(e, i.y, r.y, s.y), yi(e, i.z, r.z, s.z)), n;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}, Ho = class extends qt {
  constructor(e = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
  }
  getPoint(e, t = new oe()) {
    const n = t, i = this.points, r = (i.length - 1) * e, s = Math.floor(r), a = r - s, o = i[s === 0 ? s : s - 1], l = i[s], c = i[s > i.length - 2 ? i.length - 1 : s + 1], h = i[s > i.length - 3 ? i.length - 1 : s + 2];
    return n.set(Ma(a, o.x, l.x, c.x, h.x), Ma(a, o.y, l.y, c.y, h.y)), n;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(i.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, n = this.points.length; t < n; t++) {
      const i = this.points[t];
      e.points.push(i.toArray());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(new oe().fromArray(i));
    }
    return this;
  }
}, gs = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcCurve: ph,
  CatmullRomCurve3: mh,
  CubicBezierCurve: Bo,
  CubicBezierCurve3: Eh,
  EllipseCurve: Cs,
  LineCurve: zo,
  LineCurve3: Th,
  QuadraticBezierCurve: Vo,
  QuadraticBezierCurve3: bh,
  SplineCurve: Ho
}), Ah = class extends qt {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
  }
  add(e) {
    this.curves.push(e);
  }
  closePath() {
    const e = this.curves[0].getPoint(0), t = this.curves[this.curves.length - 1].getPoint(1);
    if (!e.equals(t)) {
      const n = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
      this.curves.push(new gs[n](t, e));
    }
    return this;
  }
  getPoint(e, t) {
    const n = e * this.getLength(), i = this.getCurveLengths();
    let r = 0;
    for (; r < i.length; ) {
      if (i[r] >= n) {
        const s = i[r] - n, a = this.curves[r], o = a.getLength(), l = o === 0 ? 0 : 1 - s / o;
        return a.getPointAt(l, t);
      }
      r++;
    }
    return null;
  }
  getLength() {
    const e = this.getCurveLengths();
    return e[e.length - 1];
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
  }
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
    const e = [];
    let t = 0;
    for (let n = 0, i = this.curves.length; n < i; n++)
      t += this.curves[n].getLength(), e.push(t);
    return this.cacheLengths = e, e;
  }
  getSpacedPoints(e = 40) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
    return this.autoClose && t.push(t[0]), t;
  }
  getPoints(e = 12) {
    const t = [];
    let n;
    for (let i = 0, r = this.curves; i < r.length; i++) {
      const s = r[i], a = s.isEllipseCurve ? e * 2 : s.isLineCurve || s.isLineCurve3 ? 1 : s.isSplineCurve ? e * s.points.length : e, o = s.getPoints(a);
      for (let l = 0; l < o.length; l++) {
        const c = o[l];
        n && n.equals(c) || (t.push(c), n = c);
      }
    }
    return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t;
  }
  copy(e) {
    super.copy(e), this.curves = [];
    for (let t = 0, n = e.curves.length; t < n; t++) {
      const i = e.curves[t];
      this.curves.push(i.clone());
    }
    return this.autoClose = e.autoClose, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.autoClose = this.autoClose, e.curves = [];
    for (let t = 0, n = this.curves.length; t < n; t++) {
      const i = this.curves[t];
      e.curves.push(i.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
    for (let t = 0, n = e.curves.length; t < n; t++) {
      const i = e.curves[t];
      this.curves.push(new gs[i.type]().fromJSON(i));
    }
    return this;
  }
}, Sa = class extends Ah {
  constructor(e) {
    super(), this.type = "Path", this.currentPoint = new oe(), e && this.setFromPoints(e);
  }
  setFromPoints(e) {
    this.moveTo(e[0].x, e[0].y);
    for (let t = 1, n = e.length; t < n; t++) this.lineTo(e[t].x, e[t].y);
    return this;
  }
  moveTo(e, t) {
    return this.currentPoint.set(e, t), this;
  }
  lineTo(e, t) {
    const n = new zo(this.currentPoint.clone(), new oe(e, t));
    return this.curves.push(n), this.currentPoint.set(e, t), this;
  }
  quadraticCurveTo(e, t, n, i) {
    const r = new Vo(this.currentPoint.clone(), new oe(e, t), new oe(n, i));
    return this.curves.push(r), this.currentPoint.set(n, i), this;
  }
  bezierCurveTo(e, t, n, i, r, s) {
    const a = new Bo(this.currentPoint.clone(), new oe(e, t), new oe(n, i), new oe(r, s));
    return this.curves.push(a), this.currentPoint.set(r, s), this;
  }
  splineThru(e) {
    const t = new Ho([this.currentPoint.clone()].concat(e));
    return this.curves.push(t), this.currentPoint.copy(e[e.length - 1]), this;
  }
  arc(e, t, n, i, r, s) {
    const a = this.currentPoint.x, o = this.currentPoint.y;
    return this.absarc(e + a, t + o, n, i, r, s), this;
  }
  absarc(e, t, n, i, r, s) {
    return this.absellipse(e, t, n, n, i, r, s), this;
  }
  ellipse(e, t, n, i, r, s, a, o) {
    const l = this.currentPoint.x, c = this.currentPoint.y;
    return this.absellipse(e + l, t + c, n, i, r, s, a, o), this;
  }
  absellipse(e, t, n, i, r, s, a, o) {
    const l = new Cs(e, t, n, i, r, s, a, o);
    if (this.curves.length > 0) {
      const h = l.getPoint(0);
      h.equals(this.currentPoint) || this.lineTo(h.x, h.y);
    }
    this.curves.push(l);
    const c = l.getPoint(1);
    return this.currentPoint.copy(c), this;
  }
  copy(e) {
    return super.copy(e), this.currentPoint.copy(e.currentPoint), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.currentPoint = this.currentPoint.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this;
  }
}, ko = class extends Sa {
  constructor(e) {
    super(e), this.uuid = Lt(), this.type = "Shape", this.holes = [];
  }
  getPointsHoles(e) {
    const t = [];
    for (let n = 0, i = this.holes.length; n < i; n++) t[n] = this.holes[n].getPoints(e);
    return t;
  }
  extractPoints(e) {
    return {
      shape: this.getPoints(e),
      holes: this.getPointsHoles(e)
    };
  }
  copy(e) {
    super.copy(e), this.holes = [];
    for (let t = 0, n = e.holes.length; t < n; t++) {
      const i = e.holes[t];
      this.holes.push(i.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.uuid = this.uuid, e.holes = [];
    for (let t = 0, n = this.holes.length; t < n; t++) {
      const i = this.holes[t];
      e.holes.push(i.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
    for (let t = 0, n = e.holes.length; t < n; t++) {
      const i = e.holes[t];
      this.holes.push(new Sa().fromJSON(i));
    }
    return this;
  }
};
function wh(e, t, n = 2) {
  const i = t && t.length, r = i ? t[0] * n : e.length;
  let s = Go(e, 0, r, n, !0);
  const a = [];
  if (!s || s.next === s.prev) return a;
  let o, l, c;
  if (i && (s = Ih(e, t, s, n)), e.length > 80 * n) {
    o = 1 / 0, l = 1 / 0;
    let h = -1 / 0, u = -1 / 0;
    for (let f = n; f < r; f += n) {
      const p = e[f], v = e[f + 1];
      p < o && (o = p), v < l && (l = v), p > h && (h = p), v > u && (u = v);
    }
    c = Math.max(h - o, u - l), c = c !== 0 ? 32767 / c : 0;
  }
  return bi(s, a, n, o, l, c, 0), a;
}
function Go(e, t, n, i, r) {
  let s;
  if (r === Gh(e, t, n, i) > 0) for (let a = t; a < n; a += i) s = Ea(a / i | 0, e[a], e[a + 1], s);
  else for (let a = n - i; a >= t; a -= i) s = Ea(a / i | 0, e[a], e[a + 1], s);
  return s && ti(s, s.next) && (wi(s), s = s.next), s;
}
function Rn(e, t) {
  if (!e) return e;
  t || (t = e);
  let n = e, i;
  do
    if (i = !1, !n.steiner && (ti(n, n.next) || lt(n.prev, n, n.next) === 0)) {
      if (wi(n), n = t = n.prev, n === n.next) break;
      i = !0;
    } else n = n.next;
  while (i || n !== t);
  return t;
}
function bi(e, t, n, i, r, s, a) {
  if (!e) return;
  !a && s && Fh(e, i, r, s);
  let o = e;
  for (; e.prev !== e.next; ) {
    const l = e.prev, c = e.next;
    if (s ? Ch(e, i, r, s) : Rh(e)) {
      t.push(l.i, e.i, c.i), wi(e), e = c.next, o = c.next;
      continue;
    }
    if (e = c, e === o) {
      a ? a === 1 ? (e = Ph(Rn(e), t), bi(e, t, n, i, r, s, 2)) : a === 2 && Lh(e, t, n, i, r, s) : bi(Rn(e), t, n, i, r, s, 1);
      break;
    }
  }
}
function Rh(e) {
  const t = e.prev, n = e, i = e.next;
  if (lt(t, n, i) >= 0) return !1;
  const r = t.x, s = n.x, a = i.x, o = t.y, l = n.y, c = i.y, h = Math.min(r, s, a), u = Math.min(o, l, c), f = Math.max(r, s, a), p = Math.max(o, l, c);
  let v = i.next;
  for (; v !== t; ) {
    if (v.x >= h && v.x <= f && v.y >= u && v.y <= p && gi(r, o, s, l, a, c, v.x, v.y) && lt(v.prev, v, v.next) >= 0) return !1;
    v = v.next;
  }
  return !0;
}
function Ch(e, t, n, i) {
  const r = e.prev, s = e, a = e.next;
  if (lt(r, s, a) >= 0) return !1;
  const o = r.x, l = s.x, c = a.x, h = r.y, u = s.y, f = a.y, p = Math.min(o, l, c), v = Math.min(h, u, f), g = Math.max(o, l, c), m = Math.max(h, u, f), d = vs(p, v, t, n, i), T = vs(g, m, t, n, i);
  let _ = e.prevZ, S = e.nextZ;
  for (; _ && _.z >= d && S && S.z <= T; ) {
    if (_.x >= p && _.x <= g && _.y >= v && _.y <= m && _ !== r && _ !== a && gi(o, h, l, u, c, f, _.x, _.y) && lt(_.prev, _, _.next) >= 0 || (_ = _.prevZ, S.x >= p && S.x <= g && S.y >= v && S.y <= m && S !== r && S !== a && gi(o, h, l, u, c, f, S.x, S.y) && lt(S.prev, S, S.next) >= 0)) return !1;
    S = S.nextZ;
  }
  for (; _ && _.z >= d; ) {
    if (_.x >= p && _.x <= g && _.y >= v && _.y <= m && _ !== r && _ !== a && gi(o, h, l, u, c, f, _.x, _.y) && lt(_.prev, _, _.next) >= 0) return !1;
    _ = _.prevZ;
  }
  for (; S && S.z <= T; ) {
    if (S.x >= p && S.x <= g && S.y >= v && S.y <= m && S !== r && S !== a && gi(o, h, l, u, c, f, S.x, S.y) && lt(S.prev, S, S.next) >= 0) return !1;
    S = S.nextZ;
  }
  return !0;
}
function Ph(e, t) {
  let n = e;
  do {
    const i = n.prev, r = n.next.next;
    !ti(i, r) && Xo(i, n, n.next, r) && Ai(i, r) && Ai(r, i) && (t.push(i.i, n.i, r.i), wi(n), wi(n.next), n = e = r), n = n.next;
  } while (n !== e);
  return Rn(n);
}
function Lh(e, t, n, i, r, s) {
  let a = e;
  do {
    let o = a.next.next;
    for (; o !== a.prev; ) {
      if (a.i !== o.i && Vh(a, o)) {
        let l = qo(a, o);
        a = Rn(a, a.next), l = Rn(l, l.next), bi(a, t, n, i, r, s, 0), bi(l, t, n, i, r, s, 0);
        return;
      }
      o = o.next;
    }
    a = a.next;
  } while (a !== e);
}
function Ih(e, t, n, i) {
  const r = [];
  for (let s = 0, a = t.length; s < a; s++) {
    const o = Go(e, t[s] * i, s < a - 1 ? t[s + 1] * i : e.length, i, !1);
    o === o.next && (o.steiner = !0), r.push(zh(o));
  }
  r.sort(Uh);
  for (let s = 0; s < r.length; s++) n = Dh(r[s], n);
  return n;
}
function Uh(e, t) {
  let n = e.x - t.x;
  return n === 0 && (n = e.y - t.y, n === 0 && (n = (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x))), n;
}
function Dh(e, t) {
  const n = Nh(e, t);
  if (!n) return t;
  const i = qo(n, e);
  return Rn(i, i.next), Rn(n, n.next);
}
function Nh(e, t) {
  let n = t;
  const i = e.x, r = e.y;
  let s = -1 / 0, a;
  if (ti(e, n)) return n;
  do {
    if (ti(e, n.next)) return n.next;
    if (r <= n.y && r >= n.next.y && n.next.y !== n.y) {
      const u = n.x + (r - n.y) * (n.next.x - n.x) / (n.next.y - n.y);
      if (u <= i && u > s && (s = u, a = n.x < n.next.x ? n : n.next, u === i))
        return a;
    }
    n = n.next;
  } while (n !== t);
  if (!a) return null;
  const o = a, l = a.x, c = a.y;
  let h = 1 / 0;
  n = a;
  do {
    if (i >= n.x && n.x >= l && i !== n.x && Wo(r < c ? i : s, r, l, c, r < c ? s : i, r, n.x, n.y)) {
      const u = Math.abs(r - n.y) / (i - n.x);
      Ai(n, e) && (u < h || u === h && (n.x > a.x || n.x === a.x && Oh(a, n))) && (a = n, h = u);
    }
    n = n.next;
  } while (n !== o);
  return a;
}
function Oh(e, t) {
  return lt(e.prev, e, t.prev) < 0 && lt(t.next, e, e.next) < 0;
}
function Fh(e, t, n, i) {
  let r = e;
  do
    r.z === 0 && (r.z = vs(r.x, r.y, t, n, i)), r.prevZ = r.prev, r.nextZ = r.next, r = r.next;
  while (r !== e);
  r.prevZ.nextZ = null, r.prevZ = null, Bh(r);
}
function Bh(e) {
  let t, n = 1;
  do {
    let i = e, r;
    e = null;
    let s = null;
    for (t = 0; i; ) {
      t++;
      let a = i, o = 0;
      for (let c = 0; c < n && (o++, a = a.nextZ, !!a); c++)
        ;
      let l = n;
      for (; o > 0 || l > 0 && a; )
        o !== 0 && (l === 0 || !a || i.z <= a.z) ? (r = i, i = i.nextZ, o--) : (r = a, a = a.nextZ, l--), s ? s.nextZ = r : e = r, r.prevZ = s, s = r;
      i = a;
    }
    s.nextZ = null, n *= 2;
  } while (t > 1);
  return e;
}
function vs(e, t, n, i, r) {
  return e = (e - n) * r | 0, t = (t - i) * r | 0, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, e | t << 1;
}
function zh(e) {
  let t = e, n = e;
  do
    (t.x < n.x || t.x === n.x && t.y < n.y) && (n = t), t = t.next;
  while (t !== e);
  return n;
}
function Wo(e, t, n, i, r, s, a, o) {
  return (r - a) * (t - o) >= (e - a) * (s - o) && (e - a) * (i - o) >= (n - a) * (t - o) && (n - a) * (s - o) >= (r - a) * (i - o);
}
function gi(e, t, n, i, r, s, a, o) {
  return !(e === a && t === o) && Wo(e, t, n, i, r, s, a, o);
}
function Vh(e, t) {
  return e.next.i !== t.i && e.prev.i !== t.i && !Hh(e, t) && (Ai(e, t) && Ai(t, e) && kh(e, t) && (lt(e.prev, e, t.prev) || lt(e, t.prev, t)) || ti(e, t) && lt(e.prev, e, e.next) > 0 && lt(t.prev, t, t.next) > 0);
}
function lt(e, t, n) {
  return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function ti(e, t) {
  return e.x === t.x && e.y === t.y;
}
function Xo(e, t, n, i) {
  const r = sr(lt(e, t, n)), s = sr(lt(e, t, i)), a = sr(lt(n, i, e)), o = sr(lt(n, i, t));
  return !!(r !== s && a !== o || r === 0 && rr(e, n, t) || s === 0 && rr(e, i, t) || a === 0 && rr(n, e, i) || o === 0 && rr(n, t, i));
}
function rr(e, t, n) {
  return t.x <= Math.max(e.x, n.x) && t.x >= Math.min(e.x, n.x) && t.y <= Math.max(e.y, n.y) && t.y >= Math.min(e.y, n.y);
}
function sr(e) {
  return e > 0 ? 1 : e < 0 ? -1 : 0;
}
function Hh(e, t) {
  let n = e;
  do {
    if (n.i !== e.i && n.next.i !== e.i && n.i !== t.i && n.next.i !== t.i && Xo(n, n.next, e, t)) return !0;
    n = n.next;
  } while (n !== e);
  return !1;
}
function Ai(e, t) {
  return lt(e.prev, e, e.next) < 0 ? lt(e, t, e.next) >= 0 && lt(e, e.prev, t) >= 0 : lt(e, t, e.prev) < 0 || lt(e, e.next, t) < 0;
}
function kh(e, t) {
  let n = e, i = !1;
  const r = (e.x + t.x) / 2, s = (e.y + t.y) / 2;
  do
    n.y > s != n.next.y > s && n.next.y !== n.y && r < (n.next.x - n.x) * (s - n.y) / (n.next.y - n.y) + n.x && (i = !i), n = n.next;
  while (n !== e);
  return i;
}
function qo(e, t) {
  const n = _s(e.i, e.x, e.y), i = _s(t.i, t.x, t.y), r = e.next, s = t.prev;
  return e.next = t, t.prev = e, n.next = r, r.prev = n, i.next = n, n.prev = i, s.next = i, i.prev = s, i;
}
function Ea(e, t, n, i) {
  const r = _s(e, t, n);
  return i ? (r.next = i.next, r.prev = i, i.next.prev = r, i.next = r) : (r.prev = r, r.next = r), r;
}
function wi(e) {
  e.next.prev = e.prev, e.prev.next = e.next, e.prevZ && (e.prevZ.nextZ = e.nextZ), e.nextZ && (e.nextZ.prevZ = e.prevZ);
}
function _s(e, t, n) {
  return {
    i: e,
    x: t,
    y: n,
    prev: null,
    next: null,
    z: 0,
    prevZ: null,
    nextZ: null,
    steiner: !1
  };
}
function Gh(e, t, n, i) {
  let r = 0;
  for (let s = t, a = n - i; s < n; s += i)
    r += (e[a] - e[s]) * (e[s + 1] + e[a + 1]), a = s;
  return r;
}
var Wh = class {
  static triangulate(e, t, n = 2) {
    return wh(e, t, n);
  }
}, bn = class Yo {
  static area(t) {
    const n = t.length;
    let i = 0;
    for (let r = n - 1, s = 0; s < n; r = s++) i += t[r].x * t[s].y - t[s].x * t[r].y;
    return i * 0.5;
  }
  static isClockWise(t) {
    return Yo.area(t) < 0;
  }
  static triangulateShape(t, n) {
    const i = [], r = [], s = [];
    Ta(t), ba(i, t);
    let a = t.length;
    n.forEach(Ta);
    for (let l = 0; l < n.length; l++)
      r.push(a), a += n[l].length, ba(i, n[l]);
    const o = Wh.triangulate(i, r);
    for (let l = 0; l < o.length; l += 3) s.push(o.slice(l, l + 3));
    return s;
  }
};
function Ta(e) {
  const t = e.length;
  t > 2 && e[t - 1].equals(e[0]) && e.pop();
}
function ba(e, t) {
  for (let n = 0; n < t.length; n++)
    e.push(t[n].x), e.push(t[n].y);
}
var Gd = class Jo extends yt {
  constructor(t = new ko([
    new oe(0.5, 0.5),
    new oe(-0.5, 0.5),
    new oe(-0.5, -0.5),
    new oe(0.5, -0.5)
  ]), n = {}) {
    super(), this.type = "ExtrudeGeometry", this.parameters = {
      shapes: t,
      options: n
    }, t = Array.isArray(t) ? t : [t];
    const i = this, r = [], s = [];
    for (let o = 0, l = t.length; o < l; o++) {
      const c = t[o];
      a(c);
    }
    this.setAttribute("position", new Je(r, 3)), this.setAttribute("uv", new Je(s, 2)), this.computeVertexNormals();
    function a(o) {
      const l = [], c = n.curveSegments !== void 0 ? n.curveSegments : 12, h = n.steps !== void 0 ? n.steps : 1, u = n.depth !== void 0 ? n.depth : 1;
      let f = n.bevelEnabled !== void 0 ? n.bevelEnabled : !0, p = n.bevelThickness !== void 0 ? n.bevelThickness : 0.2, v = n.bevelSize !== void 0 ? n.bevelSize : p - 0.1, g = n.bevelOffset !== void 0 ? n.bevelOffset : 0, m = n.bevelSegments !== void 0 ? n.bevelSegments : 3;
      const d = n.extrudePath, T = n.UVGenerator !== void 0 ? n.UVGenerator : Xh;
      let _, S = !1, L, A, C, U;
      d && (_ = d.getSpacedPoints(h), S = !0, f = !1, L = d.computeFrenetFrames(h, !1), A = new P(), C = new P(), U = new P()), f || (m = 0, p = 0, v = 0, g = 0);
      const E = o.extractPoints(c);
      let M = E.shape;
      const w = E.holes;
      if (!bn.isClockWise(M)) {
        M = M.reverse();
        for (let J = 0, $ = w.length; J < $; J++) {
          const te = w[J];
          bn.isClockWise(te) && (w[J] = te.reverse());
        }
      }
      function F(J) {
        const te = 10000000000000001e-36;
        let Z = J[0];
        for (let ue = 1; ue <= J.length; ue++) {
          const ae = ue % J.length, ie = J[ae], Be = ie.x - Z.x, ze = ie.y - Z.y, Ge = Be * Be + ze * ze, b = Math.max(Math.abs(ie.x), Math.abs(ie.y), Math.abs(Z.x), Math.abs(Z.y));
          if (Ge <= te * b * b) {
            J.splice(ae, 1), ue--;
            continue;
          }
          Z = ie;
        }
      }
      F(M), w.forEach(F);
      const H = w.length, B = M;
      for (let J = 0; J < H; J++) {
        const $ = w[J];
        M = M.concat($);
      }
      function Y(J, $, te) {
        return $ || console.error("THREE.ExtrudeGeometry: vec does not exist"), J.clone().addScaledVector($, te);
      }
      const k = M.length;
      function ee(J, $, te) {
        let Z, ue, ae;
        const ie = J.x - $.x, Be = J.y - $.y, ze = te.x - J.x, Ge = te.y - J.y, b = ie * ie + Be * Be, x = ie * Ge - Be * ze;
        if (Math.abs(x) > Number.EPSILON) {
          const N = Math.sqrt(b), X = Math.sqrt(ze * ze + Ge * Ge), j = $.x - Be / N, G = $.y + ie / N, xe = te.x - Ge / X, le = te.y + ze / X, Te = ((xe - j) * Ge - (le - G) * ze) / (ie * Ge - Be * ze);
          Z = j + ie * Te - J.x, ue = G + Be * Te - J.y;
          const Pe = Z * Z + ue * ue;
          if (Pe <= 2) return new oe(Z, ue);
          ae = Math.sqrt(Pe / 2);
        } else {
          let N = !1;
          ie > Number.EPSILON ? ze > Number.EPSILON && (N = !0) : ie < -Number.EPSILON ? ze < -Number.EPSILON && (N = !0) : Math.sign(Be) === Math.sign(Ge) && (N = !0), N ? (Z = -Be, ue = ie, ae = Math.sqrt(b)) : (Z = ie, ue = Be, ae = Math.sqrt(b / 2));
        }
        return new oe(Z / ae, ue / ae);
      }
      const W = [];
      for (let J = 0, $ = B.length, te = $ - 1, Z = J + 1; J < $; J++, te++, Z++)
        te === $ && (te = 0), Z === $ && (Z = 0), W[J] = ee(B[J], B[te], B[Z]);
      const se = [];
      let pe, De = W.concat();
      for (let J = 0, $ = H; J < $; J++) {
        const te = w[J];
        pe = [];
        for (let Z = 0, ue = te.length, ae = ue - 1, ie = Z + 1; Z < ue; Z++, ae++, ie++)
          ae === ue && (ae = 0), ie === ue && (ie = 0), pe[Z] = ee(te[Z], te[ae], te[ie]);
        se.push(pe), De = De.concat(pe);
      }
      let Fe;
      if (m === 0) Fe = bn.triangulateShape(B, w);
      else {
        const J = [], $ = [];
        for (let te = 0; te < m; te++) {
          const Z = te / m, ue = p * Math.cos(Z * Math.PI / 2), ae = v * Math.sin(Z * Math.PI / 2) + g;
          for (let ie = 0, Be = B.length; ie < Be; ie++) {
            const ze = Y(B[ie], W[ie], ae);
            ye(ze.x, ze.y, -ue), Z === 0 && J.push(ze);
          }
          for (let ie = 0, Be = H; ie < Be; ie++) {
            const ze = w[ie];
            pe = se[ie];
            const Ge = [];
            for (let b = 0, x = ze.length; b < x; b++) {
              const N = Y(ze[b], pe[b], ae);
              ye(N.x, N.y, -ue), Z === 0 && Ge.push(N);
            }
            Z === 0 && $.push(Ge);
          }
        }
        Fe = bn.triangulateShape(J, $);
      }
      const nt = Fe.length, Ze = v + g;
      for (let J = 0; J < k; J++) {
        const $ = f ? Y(M[J], De[J], Ze) : M[J];
        S ? (C.copy(L.normals[0]).multiplyScalar($.x), A.copy(L.binormals[0]).multiplyScalar($.y), U.copy(_[0]).add(C).add(A), ye(U.x, U.y, U.z)) : ye($.x, $.y, 0);
      }
      for (let J = 1; J <= h; J++) for (let $ = 0; $ < k; $++) {
        const te = f ? Y(M[$], De[$], Ze) : M[$];
        S ? (C.copy(L.normals[J]).multiplyScalar(te.x), A.copy(L.binormals[J]).multiplyScalar(te.y), U.copy(_[J]).add(C).add(A), ye(U.x, U.y, U.z)) : ye(te.x, te.y, u / h * J);
      }
      for (let J = m - 1; J >= 0; J--) {
        const $ = J / m, te = p * Math.cos($ * Math.PI / 2), Z = v * Math.sin($ * Math.PI / 2) + g;
        for (let ue = 0, ae = B.length; ue < ae; ue++) {
          const ie = Y(B[ue], W[ue], Z);
          ye(ie.x, ie.y, u + te);
        }
        for (let ue = 0, ae = w.length; ue < ae; ue++) {
          const ie = w[ue];
          pe = se[ue];
          for (let Be = 0, ze = ie.length; Be < ze; Be++) {
            const Ge = Y(ie[Be], pe[Be], Z);
            S ? ye(Ge.x, Ge.y + _[h - 1].y, _[h - 1].x + te) : ye(Ge.x, Ge.y, u + te);
          }
        }
      }
      q(), he();
      function q() {
        const J = r.length / 3;
        if (f) {
          let $ = 0, te = k * $;
          for (let Z = 0; Z < nt; Z++) {
            const ue = Fe[Z];
            Ie(ue[2] + te, ue[1] + te, ue[0] + te);
          }
          $ = h + m * 2, te = k * $;
          for (let Z = 0; Z < nt; Z++) {
            const ue = Fe[Z];
            Ie(ue[0] + te, ue[1] + te, ue[2] + te);
          }
        } else {
          for (let $ = 0; $ < nt; $++) {
            const te = Fe[$];
            Ie(te[2], te[1], te[0]);
          }
          for (let $ = 0; $ < nt; $++) {
            const te = Fe[$];
            Ie(te[0] + k * h, te[1] + k * h, te[2] + k * h);
          }
        }
        i.addGroup(J, r.length / 3 - J, 0);
      }
      function he() {
        const J = r.length / 3;
        let $ = 0;
        fe(B, $), $ += B.length;
        for (let te = 0, Z = w.length; te < Z; te++) {
          const ue = w[te];
          fe(ue, $), $ += ue.length;
        }
        i.addGroup(J, r.length / 3 - J, 1);
      }
      function fe(J, $) {
        let te = J.length;
        for (; --te >= 0; ) {
          const Z = te;
          let ue = te - 1;
          ue < 0 && (ue = J.length - 1);
          for (let ae = 0, ie = h + m * 2; ae < ie; ae++) {
            const Be = k * ae, ze = k * (ae + 1);
            Ee($ + Z + Be, $ + ue + Be, $ + ue + ze, $ + Z + ze);
          }
        }
      }
      function ye(J, $, te) {
        l.push(J), l.push($), l.push(te);
      }
      function Ie(J, $, te) {
        qe(J), qe($), qe(te);
        const Z = r.length / 3, ue = T.generateTopUV(i, r, Z - 3, Z - 2, Z - 1);
        R(ue[0]), R(ue[1]), R(ue[2]);
      }
      function Ee(J, $, te, Z) {
        qe(J), qe($), qe(Z), qe($), qe(te), qe(Z);
        const ue = r.length / 3, ae = T.generateSideWallUV(i, r, ue - 6, ue - 3, ue - 2, ue - 1);
        R(ae[0]), R(ae[1]), R(ae[3]), R(ae[1]), R(ae[2]), R(ae[3]);
      }
      function qe(J) {
        r.push(l[J * 3 + 0]), r.push(l[J * 3 + 1]), r.push(l[J * 3 + 2]);
      }
      function R(J) {
        s.push(J.x), s.push(J.y);
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    const t = super.toJSON(), n = this.parameters.shapes, i = this.parameters.options;
    return qh(n, i, t);
  }
  static fromJSON(t, n) {
    const i = [];
    for (let s = 0, a = t.shapes.length; s < a; s++) {
      const o = n[t.shapes[s]];
      i.push(o);
    }
    const r = t.options.extrudePath;
    return r !== void 0 && (t.options.extrudePath = new gs[r.type]().fromJSON(r)), new Jo(i, t.options);
  }
}, Xh = {
  generateTopUV: function(e, t, n, i, r) {
    const s = t[n * 3], a = t[n * 3 + 1], o = t[i * 3], l = t[i * 3 + 1], c = t[r * 3], h = t[r * 3 + 1];
    return [
      new oe(s, a),
      new oe(o, l),
      new oe(c, h)
    ];
  },
  generateSideWallUV: function(e, t, n, i, r, s) {
    const a = t[n * 3], o = t[n * 3 + 1], l = t[n * 3 + 2], c = t[i * 3], h = t[i * 3 + 1], u = t[i * 3 + 2], f = t[r * 3], p = t[r * 3 + 1], v = t[r * 3 + 2], g = t[s * 3], m = t[s * 3 + 1], d = t[s * 3 + 2];
    return Math.abs(o - h) < Math.abs(a - c) ? [
      new oe(a, 1 - l),
      new oe(c, 1 - u),
      new oe(f, 1 - v),
      new oe(g, 1 - d)
    ] : [
      new oe(o, 1 - l),
      new oe(h, 1 - u),
      new oe(p, 1 - v),
      new oe(m, 1 - d)
    ];
  }
};
function qh(e, t, n) {
  if (n.shapes = [], Array.isArray(e)) for (let i = 0, r = e.length; i < r; i++) {
    const s = e[i];
    n.shapes.push(s.uuid);
  }
  else n.shapes.push(e.uuid);
  return n.options = Object.assign({}, t), t.extrudePath !== void 0 && (n.options.extrudePath = t.extrudePath.toJSON()), n;
}
var Wd = class Zo extends No {
  constructor(t = 1, n = 0) {
    const i = (1 + Math.sqrt(5)) / 2, r = [
      -1,
      i,
      0,
      1,
      i,
      0,
      -1,
      -i,
      0,
      1,
      -i,
      0,
      0,
      -1,
      i,
      0,
      1,
      i,
      0,
      -1,
      -i,
      0,
      1,
      -i,
      i,
      0,
      -1,
      i,
      0,
      1,
      -i,
      0,
      -1,
      -i,
      0,
      1
    ];
    super(r, [
      0,
      11,
      5,
      0,
      5,
      1,
      0,
      1,
      7,
      0,
      7,
      10,
      0,
      10,
      11,
      1,
      5,
      9,
      5,
      11,
      4,
      11,
      10,
      2,
      10,
      7,
      6,
      7,
      1,
      8,
      3,
      9,
      4,
      3,
      4,
      2,
      3,
      2,
      6,
      3,
      6,
      8,
      3,
      8,
      9,
      4,
      9,
      5,
      2,
      4,
      11,
      6,
      2,
      10,
      8,
      6,
      7,
      9,
      8,
      1
    ], t, n), this.type = "IcosahedronGeometry", this.parameters = {
      radius: t,
      detail: n
    };
  }
  static fromJSON(t) {
    return new Zo(t.radius, t.detail);
  }
}, Xd = class Ko extends yt {
  constructor(t = [
    new oe(0, -0.5),
    new oe(0.5, 0),
    new oe(0, 0.5)
  ], n = 12, i = 0, r = Math.PI * 2) {
    super(), this.type = "LatheGeometry", this.parameters = {
      points: t,
      segments: n,
      phiStart: i,
      phiLength: r
    }, n = Math.floor(n), r = Ve(r, 0, Math.PI * 2);
    const s = [], a = [], o = [], l = [], c = [], h = 1 / n, u = new P(), f = new oe(), p = new P(), v = new P(), g = new P();
    let m = 0, d = 0;
    for (let T = 0; T <= t.length - 1; T++) switch (T) {
      case 0:
        m = t[T + 1].x - t[T].x, d = t[T + 1].y - t[T].y, p.x = d * 1, p.y = -m, p.z = d * 0, g.copy(p), p.normalize(), l.push(p.x, p.y, p.z);
        break;
      case t.length - 1:
        l.push(g.x, g.y, g.z);
        break;
      default:
        m = t[T + 1].x - t[T].x, d = t[T + 1].y - t[T].y, p.x = d * 1, p.y = -m, p.z = d * 0, v.copy(p), p.x += g.x, p.y += g.y, p.z += g.z, p.normalize(), l.push(p.x, p.y, p.z), g.copy(v);
    }
    for (let T = 0; T <= n; T++) {
      const _ = i + T * h * r, S = Math.sin(_), L = Math.cos(_);
      for (let A = 0; A <= t.length - 1; A++) {
        u.x = t[A].x * S, u.y = t[A].y, u.z = t[A].x * L, a.push(u.x, u.y, u.z), f.x = T / n, f.y = A / (t.length - 1), o.push(f.x, f.y);
        const C = l[3 * A + 0] * S, U = l[3 * A + 1], E = l[3 * A + 0] * L;
        c.push(C, U, E);
      }
    }
    for (let T = 0; T < n; T++) for (let _ = 0; _ < t.length - 1; _++) {
      const S = _ + T * t.length, L = S, A = S + t.length, C = S + t.length + 1, U = S + 1;
      s.push(L, A, U), s.push(C, U, A);
    }
    this.setIndex(s), this.setAttribute("position", new Je(a, 3)), this.setAttribute("uv", new Je(o, 2)), this.setAttribute("normal", new Je(c, 3));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Ko(t.points, t.segments, t.phiStart, t.phiLength);
  }
}, $o = class jo extends yt {
  constructor(t = 1, n = 1, i = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: t,
      height: n,
      widthSegments: i,
      heightSegments: r
    };
    const s = t / 2, a = n / 2, o = Math.floor(i), l = Math.floor(r), c = o + 1, h = l + 1, u = t / o, f = n / l, p = [], v = [], g = [], m = [];
    for (let d = 0; d < h; d++) {
      const T = d * f - a;
      for (let _ = 0; _ < c; _++) {
        const S = _ * u - s;
        v.push(S, -T, 0), g.push(0, 0, 1), m.push(_ / o), m.push(1 - d / l);
      }
    }
    for (let d = 0; d < l; d++) for (let T = 0; T < o; T++) {
      const _ = T + c * d, S = T + c * (d + 1), L = T + 1 + c * (d + 1), A = T + 1 + c * d;
      p.push(_, S, A), p.push(S, L, A);
    }
    this.setIndex(p), this.setAttribute("position", new Je(v, 3)), this.setAttribute("normal", new Je(g, 3)), this.setAttribute("uv", new Je(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new jo(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}, qd = class Qo extends yt {
  constructor(t = 0.5, n = 1, i = 32, r = 1, s = 0, a = Math.PI * 2) {
    super(), this.type = "RingGeometry", this.parameters = {
      innerRadius: t,
      outerRadius: n,
      thetaSegments: i,
      phiSegments: r,
      thetaStart: s,
      thetaLength: a
    }, i = Math.max(3, i), r = Math.max(1, r);
    const o = [], l = [], c = [], h = [];
    let u = t;
    const f = (n - t) / r, p = new P(), v = new oe();
    for (let g = 0; g <= r; g++) {
      for (let m = 0; m <= i; m++) {
        const d = s + m / i * a;
        p.x = u * Math.cos(d), p.y = u * Math.sin(d), l.push(p.x, p.y, p.z), c.push(0, 0, 1), v.x = (p.x / n + 1) / 2, v.y = (p.y / n + 1) / 2, h.push(v.x, v.y);
      }
      u += f;
    }
    for (let g = 0; g < r; g++) {
      const m = g * (i + 1);
      for (let d = 0; d < i; d++) {
        const T = d + m, _ = T, S = T + i + 1, L = T + i + 2, A = T + 1;
        o.push(_, S, A), o.push(S, L, A);
      }
    }
    this.setIndex(o), this.setAttribute("position", new Je(l, 3)), this.setAttribute("normal", new Je(c, 3)), this.setAttribute("uv", new Je(h, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Qo(t.innerRadius, t.outerRadius, t.thetaSegments, t.phiSegments, t.thetaStart, t.thetaLength);
  }
}, Yd = class el extends yt {
  constructor(t = new ko([
    new oe(0, 0.5),
    new oe(-0.5, -0.5),
    new oe(0.5, -0.5)
  ]), n = 12) {
    super(), this.type = "ShapeGeometry", this.parameters = {
      shapes: t,
      curveSegments: n
    };
    const i = [], r = [], s = [], a = [];
    let o = 0, l = 0;
    if (Array.isArray(t) === !1) c(t);
    else for (let h = 0; h < t.length; h++)
      c(t[h]), this.addGroup(o, l, h), o += l, l = 0;
    this.setIndex(i), this.setAttribute("position", new Je(r, 3)), this.setAttribute("normal", new Je(s, 3)), this.setAttribute("uv", new Je(a, 2));
    function c(h) {
      const u = r.length / 3, f = h.extractPoints(n);
      let p = f.shape;
      const v = f.holes;
      bn.isClockWise(p) === !1 && (p = p.reverse());
      for (let m = 0, d = v.length; m < d; m++) {
        const T = v[m];
        bn.isClockWise(T) === !0 && (v[m] = T.reverse());
      }
      const g = bn.triangulateShape(p, v);
      for (let m = 0, d = v.length; m < d; m++) {
        const T = v[m];
        p = p.concat(T);
      }
      for (let m = 0, d = p.length; m < d; m++) {
        const T = p[m];
        r.push(T.x, T.y, 0), s.push(0, 0, 1), a.push(T.x, T.y);
      }
      for (let m = 0, d = g.length; m < d; m++) {
        const T = g[m], _ = T[0] + u, S = T[1] + u, L = T[2] + u;
        i.push(_, S, L), l += 3;
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    const t = super.toJSON(), n = this.parameters.shapes;
    return Yh(n, t);
  }
  static fromJSON(t, n) {
    const i = [];
    for (let r = 0, s = t.shapes.length; r < s; r++) {
      const a = n[t.shapes[r]];
      i.push(a);
    }
    return new el(i, t.curveSegments);
  }
};
function Yh(e, t) {
  if (t.shapes = [], Array.isArray(e)) for (let n = 0, i = e.length; n < i; n++) {
    const r = e[n];
    t.shapes.push(r.uuid);
  }
  else t.shapes.push(e.uuid);
  return t;
}
var Jd = class tl extends yt {
  constructor(t = 1, n = 32, i = 16, r = 0, s = Math.PI * 2, a = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: t,
      widthSegments: n,
      heightSegments: i,
      phiStart: r,
      phiLength: s,
      thetaStart: a,
      thetaLength: o
    }, n = Math.max(3, Math.floor(n)), i = Math.max(2, Math.floor(i));
    const l = Math.min(a + o, Math.PI);
    let c = 0;
    const h = [], u = new P(), f = new P(), p = [], v = [], g = [], m = [];
    for (let d = 0; d <= i; d++) {
      const T = [], _ = d / i;
      let S = 0;
      d === 0 && a === 0 ? S = 0.5 / n : d === i && l === Math.PI && (S = -0.5 / n);
      for (let L = 0; L <= n; L++) {
        const A = L / n;
        u.x = -t * Math.cos(r + A * s) * Math.sin(a + _ * o), u.y = t * Math.cos(a + _ * o), u.z = t * Math.sin(r + A * s) * Math.sin(a + _ * o), v.push(u.x, u.y, u.z), f.copy(u).normalize(), g.push(f.x, f.y, f.z), m.push(A + S, 1 - _), T.push(c++);
      }
      h.push(T);
    }
    for (let d = 0; d < i; d++) for (let T = 0; T < n; T++) {
      const _ = h[d][T + 1], S = h[d][T], L = h[d + 1][T], A = h[d + 1][T + 1];
      (d !== 0 || a > 0) && p.push(_, S, A), (d !== i - 1 || l < Math.PI) && p.push(S, L, A);
    }
    this.setIndex(p), this.setAttribute("position", new Je(v, 3)), this.setAttribute("normal", new Je(g, 3)), this.setAttribute("uv", new Je(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new tl(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
  }
}, Zd = class nl extends yt {
  constructor(t = 1, n = 0.4, i = 12, r = 48, s = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = {
      radius: t,
      tube: n,
      radialSegments: i,
      tubularSegments: r,
      arc: s
    }, i = Math.floor(i), r = Math.floor(r);
    const a = [], o = [], l = [], c = [], h = new P(), u = new P(), f = new P();
    for (let p = 0; p <= i; p++) for (let v = 0; v <= r; v++) {
      const g = v / r * s, m = p / i * Math.PI * 2;
      u.x = (t + n * Math.cos(m)) * Math.cos(g), u.y = (t + n * Math.cos(m)) * Math.sin(g), u.z = n * Math.sin(m), o.push(u.x, u.y, u.z), h.x = t * Math.cos(g), h.y = t * Math.sin(g), f.subVectors(u, h).normalize(), l.push(f.x, f.y, f.z), c.push(v / r), c.push(p / i);
    }
    for (let p = 1; p <= i; p++) for (let v = 1; v <= r; v++) {
      const g = (r + 1) * p + v - 1, m = (r + 1) * (p - 1) + v - 1, d = (r + 1) * (p - 1) + v, T = (r + 1) * p + v;
      a.push(g, m, T), a.push(m, d, T);
    }
    this.setIndex(a), this.setAttribute("position", new Je(o, 3)), this.setAttribute("normal", new Je(l, 3)), this.setAttribute("uv", new Je(c, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new nl(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
  }
}, Jh = class extends fn {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new ke(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ke(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new oe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new tn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}, Kd = class extends Jh {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new oe(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return Ve(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
      },
      set: function(t) {
        this.ior = (1 + 0.4 * t) / (1 - 0.4 * t);
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new ke(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new ke(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new ke(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(e);
  }
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(e) {
    this._anisotropy > 0 != e > 0 && this.version++, this._anisotropy = e;
  }
  get clearcoat() {
    return this._clearcoat;
  }
  set clearcoat(e) {
    this._clearcoat > 0 != e > 0 && this.version++, this._clearcoat = e;
  }
  get iridescence() {
    return this._iridescence;
  }
  set iridescence(e) {
    this._iridescence > 0 != e > 0 && this.version++, this._iridescence = e;
  }
  get dispersion() {
    return this._dispersion;
  }
  set dispersion(e) {
    this._dispersion > 0 != e > 0 && this.version++, this._dispersion = e;
  }
  get sheen() {
    return this._sheen;
  }
  set sheen(e) {
    this._sheen > 0 != e > 0 && this.version++, this._sheen = e;
  }
  get transmission() {
    return this._transmission;
  }
  set transmission(e) {
    this._transmission > 0 != e > 0 && this.version++, this._transmission = e;
  }
  copy(e) {
    return super.copy(e), this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.anisotropy = e.anisotropy, this.anisotropyRotation = e.anisotropyRotation, this.anisotropyMap = e.anisotropyMap, this.clearcoat = e.clearcoat, this.clearcoatMap = e.clearcoatMap, this.clearcoatRoughness = e.clearcoatRoughness, this.clearcoatRoughnessMap = e.clearcoatRoughnessMap, this.clearcoatNormalMap = e.clearcoatNormalMap, this.clearcoatNormalScale.copy(e.clearcoatNormalScale), this.dispersion = e.dispersion, this.ior = e.ior, this.iridescence = e.iridescence, this.iridescenceMap = e.iridescenceMap, this.iridescenceIOR = e.iridescenceIOR, this.iridescenceThicknessRange = [...e.iridescenceThicknessRange], this.iridescenceThicknessMap = e.iridescenceThicknessMap, this.sheen = e.sheen, this.sheenColor.copy(e.sheenColor), this.sheenColorMap = e.sheenColorMap, this.sheenRoughness = e.sheenRoughness, this.sheenRoughnessMap = e.sheenRoughnessMap, this.transmission = e.transmission, this.transmissionMap = e.transmissionMap, this.thickness = e.thickness, this.thicknessMap = e.thicknessMap, this.attenuationDistance = e.attenuationDistance, this.attenuationColor.copy(e.attenuationColor), this.specularIntensity = e.specularIntensity, this.specularIntensityMap = e.specularIntensityMap, this.specularColor.copy(e.specularColor), this.specularColorMap = e.specularColorMap, this;
  }
}, $d = class extends fn {
  constructor(e) {
    super(), this.isMeshLambertMaterial = !0, this.type = "MeshLambertMaterial", this.color = new ke(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ke(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new oe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new tn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}, Zh = class extends fn {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = mc, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}, Kh = class extends fn {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}, jd = class extends Ro {
  constructor(e) {
    super(), this.isLineDashedMaterial = !0, this.type = "LineDashedMaterial", this.scale = 1, this.dashSize = 3, this.gapSize = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.scale = e.scale, this.dashSize = e.dashSize, this.gapSize = e.gapSize, this;
  }
};
function ar(e, t) {
  return !e || e.constructor === t ? e : typeof t.BYTES_PER_ELEMENT == "number" ? new t(e) : Array.prototype.slice.call(e);
}
function $h(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function jh(e) {
  function t(r, s) {
    return e[r] - e[s];
  }
  const n = e.length, i = new Array(n);
  for (let r = 0; r !== n; ++r) i[r] = r;
  return i.sort(t), i;
}
function Aa(e, t, n) {
  const i = e.length, r = new e.constructor(i);
  for (let s = 0, a = 0; a !== i; ++s) {
    const o = n[s] * t;
    for (let l = 0; l !== t; ++l) r[a++] = e[o + l];
  }
  return r;
}
function il(e, t, n, i) {
  let r = 1, s = e[0];
  for (; s !== void 0 && s[i] === void 0; ) s = e[r++];
  if (s === void 0) return;
  let a = s[i];
  if (a !== void 0)
    if (Array.isArray(a)) do
      a = s[i], a !== void 0 && (t.push(s.time), n.push(...a)), s = e[r++];
    while (s !== void 0);
    else if (a.toArray !== void 0) do
      a = s[i], a !== void 0 && (t.push(s.time), a.toArray(n, n.length)), s = e[r++];
    while (s !== void 0);
    else do
      a = s[i], a !== void 0 && (t.push(s.time), n.push(a)), s = e[r++];
    while (s !== void 0);
}
var yr = class {
  constructor(e, t, n, i) {
    this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = i !== void 0 ? i : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(e) {
    const t = this.parameterPositions;
    let n = this._cachedIndex, i = t[n], r = t[n - 1];
    n: {
      e: {
        let s;
        t: {
          i: if (!(e < i)) {
            for (let a = n + 2; ; ) {
              if (i === void 0) {
                if (e < r) break i;
                return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
              }
              if (n === a) break;
              if (r = i, i = t[++n], e < i) break e;
            }
            s = t.length;
            break t;
          }
          if (!(e >= r)) {
            const a = t[1];
            e < a && (n = 2, r = a);
            for (let o = n - 2; ; ) {
              if (r === void 0)
                return this._cachedIndex = 0, this.copySampleValue_(0);
              if (n === o) break;
              if (i = r, r = t[--n - 1], e >= r) break e;
            }
            s = n, n = 0;
            break t;
          }
          break n;
        }
        for (; n < s; ) {
          const a = n + s >>> 1;
          e < t[a] ? s = a : n = a + 1;
        }
        if (i = t[n], r = t[n - 1], r === void 0)
          return this._cachedIndex = 0, this.copySampleValue_(0);
        if (i === void 0)
          return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
      }
      this._cachedIndex = n, this.intervalChanged_(n, r, i);
    }
    return this.interpolate_(n, r, e, i);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, i = this.valueSize, r = e * i;
    for (let s = 0; s !== i; ++s) t[s] = n[r + s];
    return t;
  }
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {
  }
}, Qh = class extends yr {
  constructor(e, t, n, i) {
    super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: zs,
      endingEnd: zs
    };
  }
  intervalChanged_(e, t, n) {
    const i = this.parameterPositions;
    let r = e - 2, s = e + 1, a = i[r], o = i[s];
    if (a === void 0) switch (this.getSettings_().endingStart) {
      case Vs:
        r = e, a = 2 * t - n;
        break;
      case Hs:
        r = i.length - 2, a = t + i[r] - i[r + 1];
        break;
      default:
        r = e, a = n;
    }
    if (o === void 0) switch (this.getSettings_().endingEnd) {
      case Vs:
        s = e, o = 2 * n - t;
        break;
      case Hs:
        s = 1, o = n + i[1] - i[0];
        break;
      default:
        s = e - 1, o = t;
    }
    const l = (n - t) * 0.5, c = this.valueSize;
    this._weightPrev = l / (t - a), this._weightNext = l / (o - n), this._offsetPrev = r * c, this._offsetNext = s * c;
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = e * a, l = o - a, c = this._offsetPrev, h = this._offsetNext, u = this._weightPrev, f = this._weightNext, p = (n - t) / (i - t), v = p * p, g = v * p, m = -u * g + 2 * u * v - u * p, d = (1 + u) * g + (-1.5 - 2 * u) * v + (-0.5 + u) * p + 1, T = (-1 - f) * g + (1.5 + f) * v + 0.5 * p, _ = f * g - f * v;
    for (let S = 0; S !== a; ++S) r[S] = m * s[c + S] + d * s[l + S] + T * s[o + S] + _ * s[h + S];
    return r;
  }
}, eu = class extends yr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = e * a, l = o - a, c = (n - t) / (i - t), h = 1 - c;
    for (let u = 0; u !== a; ++u) r[u] = s[l + u] * h + s[o + u] * c;
    return r;
  }
}, tu = class extends yr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}, kt = class {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = ar(t, this.TimeBufferType), this.values = ar(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
  }
  static toJSON(e) {
    const t = e.constructor;
    let n;
    if (t.toJSON !== this.toJSON) n = t.toJSON(e);
    else {
      n = {
        name: e.name,
        times: ar(e.times, Array),
        values: ar(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new tu(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new eu(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new Qh(this.times, this.values, this.getValueSize(), e);
  }
  setInterpolation(e) {
    let t;
    switch (e) {
      case dr:
        t = this.InterpolantFactoryMethodDiscrete;
        break;
      case ds:
        t = this.InterpolantFactoryMethodLinear;
        break;
      case Ar:
        t = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (t === void 0) {
      const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0) if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
      else throw new Error(n);
      return console.warn("THREE.KeyframeTrack:", n), this;
    }
    return this.createInterpolant = t, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return dr;
      case this.InterpolantFactoryMethodLinear:
        return ds;
      case this.InterpolantFactoryMethodSmooth:
        return Ar;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  shift(e) {
    if (e !== 0) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] += e;
    }
    return this;
  }
  scale(e) {
    if (e !== 1) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] *= e;
    }
    return this;
  }
  trim(e, t) {
    const n = this.times, i = n.length;
    let r = 0, s = i - 1;
    for (; r !== i && n[r] < e; ) ++r;
    for (; s !== -1 && n[s] > t; ) --s;
    if (++s, r !== 0 || s !== i) {
      r >= s && (s = Math.max(s, 1), r = s - 1);
      const a = this.getValueSize();
      this.times = n.slice(r, s), this.values = this.values.slice(r * a, s * a);
    }
    return this;
  }
  validate() {
    let e = !0;
    const t = this.getValueSize();
    t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
    const n = this.times, i = this.values, r = n.length;
    r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
    let s = null;
    for (let a = 0; a !== r; a++) {
      const o = n[a];
      if (typeof o == "number" && isNaN(o)) {
        console.error("THREE.KeyframeTrack: Time is not a valid number.", this, a, o), e = !1;
        break;
      }
      if (s !== null && s > o) {
        console.error("THREE.KeyframeTrack: Out of order keys.", this, a, o, s), e = !1;
        break;
      }
      s = o;
    }
    if (i !== void 0 && $h(i))
      for (let a = 0, o = i.length; a !== o; ++a) {
        const l = i[a];
        if (isNaN(l)) {
          console.error("THREE.KeyframeTrack: Value is not a valid number.", this, a, l), e = !1;
          break;
        }
      }
    return e;
  }
  optimize() {
    const e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), i = this.getInterpolation() === Ar, r = e.length - 1;
    let s = 1;
    for (let a = 1; a < r; ++a) {
      let o = !1;
      const l = e[a];
      if (l !== e[a + 1] && (a !== 1 || l !== e[0])) if (i)
        o = !0;
      else {
        const c = a * n, h = c - n, u = c + n;
        for (let f = 0; f !== n; ++f) {
          const p = t[c + f];
          if (p !== t[h + f] || p !== t[u + f]) {
            o = !0;
            break;
          }
        }
      }
      if (o) {
        if (a !== s) {
          e[s] = e[a];
          const c = a * n, h = s * n;
          for (let u = 0; u !== n; ++u) t[h + u] = t[c + u];
        }
        ++s;
      }
    }
    if (r > 0) {
      e[s] = e[r];
      for (let a = r * n, o = s * n, l = 0; l !== n; ++l) t[o + l] = t[a + l];
      ++s;
    }
    return s !== e.length ? (this.times = e.slice(0, s), this.values = t.slice(0, s * n)) : (this.times = e, this.values = t), this;
  }
  clone() {
    const e = this.times.slice(), t = this.values.slice(), n = this.constructor, i = new n(this.name, e, t);
    return i.createInterpolant = this.createInterpolant, i;
  }
};
kt.prototype.ValueTypeName = "";
kt.prototype.TimeBufferType = Float32Array;
kt.prototype.ValueBufferType = Float32Array;
kt.prototype.DefaultInterpolation = ds;
var ii = class extends kt {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
ii.prototype.ValueTypeName = "bool";
ii.prototype.ValueBufferType = Array;
ii.prototype.DefaultInterpolation = dr;
ii.prototype.InterpolantFactoryMethodLinear = void 0;
ii.prototype.InterpolantFactoryMethodSmooth = void 0;
var rl = class extends kt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
rl.prototype.ValueTypeName = "color";
var _r = class extends kt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
_r.prototype.ValueTypeName = "number";
var nu = class extends yr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = (n - t) / (i - t);
    let l = e * a;
    for (let c = l + a; l !== c; l += 4) ni.slerpFlat(r, 0, s, l - a, s, l, o);
    return r;
  }
}, Mr = class extends kt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  InterpolantFactoryMethodLinear(e) {
    return new nu(this.times, this.values, this.getValueSize(), e);
  }
};
Mr.prototype.ValueTypeName = "quaternion";
Mr.prototype.InterpolantFactoryMethodSmooth = void 0;
var ri = class extends kt {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
ri.prototype.ValueTypeName = "string";
ri.prototype.ValueBufferType = Array;
ri.prototype.DefaultInterpolation = dr;
ri.prototype.InterpolantFactoryMethodLinear = void 0;
ri.prototype.InterpolantFactoryMethodSmooth = void 0;
var xr = class extends kt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
xr.prototype.ValueTypeName = "vector";
var Qd = class {
  constructor(e = "", t = -1, n = [], i = pc) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = Lt(), this.userData = {}, this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const t = [], n = e.tracks, i = 1 / (e.fps || 1);
    for (let s = 0, a = n.length; s !== a; ++s) t.push(ru(n[s]).scale(i));
    const r = new this(e.name, e.duration, t, e.blendMode);
    return r.uuid = e.uuid, r.userData = JSON.parse(e.userData || "{}"), r;
  }
  static toJSON(e) {
    const t = [], n = e.tracks, i = {
      name: e.name,
      duration: e.duration,
      tracks: t,
      uuid: e.uuid,
      blendMode: e.blendMode,
      userData: JSON.stringify(e.userData)
    };
    for (let r = 0, s = n.length; r !== s; ++r) t.push(kt.toJSON(n[r]));
    return i;
  }
  static CreateFromMorphTargetSequence(e, t, n, i) {
    const r = t.length, s = [];
    for (let a = 0; a < r; a++) {
      let o = [], l = [];
      o.push((a + r - 1) % r, a, (a + 1) % r), l.push(0, 1, 0);
      const c = jh(o);
      o = Aa(o, 1, c), l = Aa(l, 1, c), !i && o[0] === 0 && (o.push(r), l.push(l[0])), s.push(new _r(".morphTargetInfluences[" + t[a].name + "]", o, l).scale(1 / n));
    }
    return new this(e, -1, s);
  }
  static findByName(e, t) {
    let n = e;
    if (!Array.isArray(e)) {
      const i = e;
      n = i.geometry && i.geometry.animations || i.animations;
    }
    for (let i = 0; i < n.length; i++) if (n[i].name === t) return n[i];
    return null;
  }
  static CreateClipsFromMorphTargetSequences(e, t, n) {
    const i = {}, r = /^([\w-]*?)([\d]+)$/;
    for (let a = 0, o = e.length; a < o; a++) {
      const l = e[a], c = l.name.match(r);
      if (c && c.length > 1) {
        const h = c[1];
        let u = i[h];
        u || (i[h] = u = []), u.push(l);
      }
    }
    const s = [];
    for (const a in i) s.push(this.CreateFromMorphTargetSequence(a, i[a], t, n));
    return s;
  }
  static parseAnimation(e, t) {
    if (console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"), !e)
      return console.error("THREE.AnimationClip: No animation in JSONLoader data."), null;
    const n = function(c, h, u, f, p) {
      if (u.length !== 0) {
        const v = [], g = [];
        il(u, v, g, f), v.length !== 0 && p.push(new c(h, v, g));
      }
    }, i = [], r = e.name || "default", s = e.fps || 30, a = e.blendMode;
    let o = e.length || -1;
    const l = e.hierarchy || [];
    for (let c = 0; c < l.length; c++) {
      const h = l[c].keys;
      if (!(!h || h.length === 0))
        if (h[0].morphTargets) {
          const u = {};
          let f;
          for (f = 0; f < h.length; f++) if (h[f].morphTargets) for (let p = 0; p < h[f].morphTargets.length; p++) u[h[f].morphTargets[p]] = -1;
          for (const p in u) {
            const v = [], g = [];
            for (let m = 0; m !== h[f].morphTargets.length; ++m) {
              const d = h[f];
              v.push(d.time), g.push(d.morphTarget === p ? 1 : 0);
            }
            i.push(new _r(".morphTargetInfluence[" + p + "]", v, g));
          }
          o = u.length * s;
        } else {
          const u = ".bones[" + t[c].name + "]";
          n(xr, u + ".position", h, "pos", i), n(Mr, u + ".quaternion", h, "rot", i), n(xr, u + ".scale", h, "scl", i);
        }
    }
    return i.length === 0 ? null : new this(r, o, i, a);
  }
  resetDuration() {
    const e = this.tracks;
    let t = 0;
    for (let n = 0, i = e.length; n !== i; ++n) {
      const r = this.tracks[n];
      t = Math.max(t, r.times[r.times.length - 1]);
    }
    return this.duration = t, this;
  }
  trim() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].trim(0, this.duration);
    return this;
  }
  validate() {
    let e = !0;
    for (let t = 0; t < this.tracks.length; t++) e = e && this.tracks[t].validate();
    return e;
  }
  optimize() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].optimize();
    return this;
  }
  clone() {
    const e = [];
    for (let n = 0; n < this.tracks.length; n++) e.push(this.tracks[n].clone());
    const t = new this.constructor(this.name, this.duration, e, this.blendMode);
    return t.userData = JSON.parse(JSON.stringify(this.userData)), t;
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
};
function iu(e) {
  switch (e.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return _r;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return xr;
    case "color":
      return rl;
    case "quaternion":
      return Mr;
    case "bool":
    case "boolean":
      return ii;
    case "string":
      return ri;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + e);
}
function ru(e) {
  if (e.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const t = iu(e.type);
  if (e.times === void 0) {
    const n = [], i = [];
    il(e.keys, n, i, "value"), e.times = n, e.values = i;
  }
  return t.parse !== void 0 ? t.parse(e) : new t(e.name, e.times, e.values, e.interpolation);
}
var Qt = {
  enabled: !1,
  files: {},
  add: function(e, t) {
    this.enabled !== !1 && (this.files[e] = t);
  },
  get: function(e) {
    if (this.enabled !== !1)
      return this.files[e];
  },
  remove: function(e) {
    delete this.files[e];
  },
  clear: function() {
    this.files = {};
  }
}, su = class {
  constructor(e, t, n) {
    const i = this;
    let r = !1, s = 0, a = 0, o;
    const l = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.abortController = new AbortController(), this.itemStart = function(c) {
      a++, r === !1 && i.onStart !== void 0 && i.onStart(c, s, a), r = !0;
    }, this.itemEnd = function(c) {
      s++, i.onProgress !== void 0 && i.onProgress(c, s, a), s === a && (r = !1, i.onLoad !== void 0 && i.onLoad());
    }, this.itemError = function(c) {
      i.onError !== void 0 && i.onError(c);
    }, this.resolveURL = function(c) {
      return o ? o(c) : c;
    }, this.setURLModifier = function(c) {
      return o = c, this;
    }, this.addHandler = function(c, h) {
      return l.push(c, h), this;
    }, this.removeHandler = function(c) {
      const h = l.indexOf(c);
      return h !== -1 && l.splice(h, 2), this;
    }, this.getHandler = function(c) {
      for (let h = 0, u = l.length; h < u; h += 2) {
        const f = l[h], p = l[h + 1];
        if (f.global && (f.lastIndex = 0), f.test(c)) return p;
      }
      return null;
    }, this.abort = function() {
      return this.abortController.abort(), this.abortController = new AbortController(), this;
    };
  }
}, au = /* @__PURE__ */ new su(), Pi = class {
  constructor(e) {
    this.manager = e !== void 0 ? e : au, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {
  }
  loadAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.load(e, i, t, r);
    });
  }
  parse() {
  }
  setCrossOrigin(e) {
    return this.crossOrigin = e, this;
  }
  setWithCredentials(e) {
    return this.withCredentials = e, this;
  }
  setPath(e) {
    return this.path = e, this;
  }
  setResourcePath(e) {
    return this.resourcePath = e, this;
  }
  setRequestHeader(e) {
    return this.requestHeader = e, this;
  }
  abort() {
    return this;
  }
};
Pi.DEFAULT_MATERIAL_NAME = "__DEFAULT";
var jt = {}, ou = class extends Error {
  constructor(e, t) {
    super(e), this.response = t;
  }
}, ep = class extends Pi {
  constructor(e) {
    super(e), this.mimeType = "", this.responseType = "", this._abortController = new AbortController();
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Qt.get(`file:${e}`);
    if (r !== void 0)
      return this.manager.itemStart(e), setTimeout(() => {
        t && t(r), this.manager.itemEnd(e);
      }, 0), r;
    if (jt[e] !== void 0) {
      jt[e].push({
        onLoad: t,
        onProgress: n,
        onError: i
      });
      return;
    }
    jt[e] = [], jt[e].push({
      onLoad: t,
      onProgress: n,
      onError: i
    });
    const s = new Request(e, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? "include" : "same-origin",
      signal: typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal
    }), a = this.mimeType, o = this.responseType;
    fetch(s).then((l) => {
      if (l.status === 200 || l.status === 0) {
        if (l.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || l.body === void 0 || l.body.getReader === void 0) return l;
        const c = jt[e], h = l.body.getReader(), u = l.headers.get("X-File-Size") || l.headers.get("Content-Length"), f = u ? parseInt(u) : 0, p = f !== 0;
        let v = 0;
        const g = new ReadableStream({ start(m) {
          d();
          function d() {
            h.read().then(({ done: T, value: _ }) => {
              if (T) m.close();
              else {
                v += _.byteLength;
                const S = new ProgressEvent("progress", {
                  lengthComputable: p,
                  loaded: v,
                  total: f
                });
                for (let L = 0, A = c.length; L < A; L++) {
                  const C = c[L];
                  C.onProgress && C.onProgress(S);
                }
                m.enqueue(_), d();
              }
            }, (T) => {
              m.error(T);
            });
          }
        } });
        return new Response(g);
      } else throw new ou(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
    }).then((l) => {
      switch (o) {
        case "arraybuffer":
          return l.arrayBuffer();
        case "blob":
          return l.blob();
        case "document":
          return l.text().then((c) => new DOMParser().parseFromString(c, a));
        case "json":
          return l.json();
        default:
          if (a === "") return l.text();
          {
            const c = /charset="?([^;"\s]*)"?/i.exec(a), h = c && c[1] ? c[1].toLowerCase() : void 0, u = new TextDecoder(h);
            return l.arrayBuffer().then((f) => u.decode(f));
          }
      }
    }).then((l) => {
      Qt.add(`file:${e}`, l);
      const c = jt[e];
      delete jt[e];
      for (let h = 0, u = c.length; h < u; h++) {
        const f = c[h];
        f.onLoad && f.onLoad(l);
      }
    }).catch((l) => {
      const c = jt[e];
      if (c === void 0)
        throw this.manager.itemError(e), l;
      delete jt[e];
      for (let h = 0, u = c.length; h < u; h++) {
        const f = c[h];
        f.onError && f.onError(l);
      }
      this.manager.itemError(e);
    }).finally(() => {
      this.manager.itemEnd(e);
    }), this.manager.itemStart(e);
  }
  setResponseType(e) {
    return this.responseType = e, this;
  }
  setMimeType(e) {
    return this.mimeType = e, this;
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
}, Wn = /* @__PURE__ */ new WeakMap(), lu = class extends Pi {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, s = Qt.get(`image:${e}`);
    if (s !== void 0) {
      if (s.complete === !0)
        r.manager.itemStart(e), setTimeout(function() {
          t && t(s), r.manager.itemEnd(e);
        }, 0);
      else {
        let h = Wn.get(s);
        h === void 0 && (h = [], Wn.set(s, h)), h.push({
          onLoad: t,
          onError: i
        });
      }
      return s;
    }
    const a = Ei("img");
    function o() {
      c(), t && t(this);
      const h = Wn.get(this) || [];
      for (let u = 0; u < h.length; u++) {
        const f = h[u];
        f.onLoad && f.onLoad(this);
      }
      Wn.delete(this), r.manager.itemEnd(e);
    }
    function l(h) {
      c(), i && i(h), Qt.remove(`image:${e}`);
      const u = Wn.get(this) || [];
      for (let f = 0; f < u.length; f++) {
        const p = u[f];
        p.onError && p.onError(h);
      }
      Wn.delete(this), r.manager.itemError(e), r.manager.itemEnd(e);
    }
    function c() {
      a.removeEventListener("load", o, !1), a.removeEventListener("error", l, !1);
    }
    return a.addEventListener("load", o, !1), a.addEventListener("error", l, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (a.crossOrigin = this.crossOrigin), Qt.add(`image:${e}`, a), r.manager.itemStart(e), a.src = e, a;
  }
}, tp = class extends Pi {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    const r = new Ut(), s = new lu(this.manager);
    return s.setCrossOrigin(this.crossOrigin), s.setPath(this.path), s.load(e, function(a) {
      r.image = a, r.needsUpdate = !0, t !== void 0 && t(r);
    }, n, i), r;
  }
}, Sr = class extends mt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new ke(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}, np = class extends Sr {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(mt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new ke(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}, ns = /* @__PURE__ */ new Ye(), wa = /* @__PURE__ */ new P(), Ra = /* @__PURE__ */ new P(), Ls = class {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new oe(512, 512), this.mapType = Kn, this.map = null, this.mapPass = null, this.matrix = new Ye(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Rs(), this._frameExtents = new oe(1, 1), this._viewportCount = 1, this._viewports = [new et(0, 0, 1, 1)];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    wa.setFromMatrixPosition(e.matrixWorld), t.position.copy(wa), Ra.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Ra), t.updateMatrixWorld(), ns.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(ns, t.coordinateSystem, t.reversedDepth), t.reversedDepth ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1) : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), n.multiply(ns);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}, cu = class extends Ls {
  constructor() {
    super(new At(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1, this.aspect = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = Qn * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height * this.aspect, r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}, ip = class extends Sr {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, s = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(mt.DEFAULT_UP), this.updateMatrix(), this.target = new mt(), this.distance = n, this.angle = i, this.penumbra = r, this.decay = s, this.map = null, this.shadow = new cu();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(e) {
    this.intensity = e / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}, Ca = /* @__PURE__ */ new Ye(), mi = /* @__PURE__ */ new P(), is = /* @__PURE__ */ new P(), hu = class extends Ls {
  constructor() {
    super(new At(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new oe(4, 2), this._viewportCount = 6, this._viewports = [
      new et(2, 1, 1, 1),
      new et(0, 1, 1, 1),
      new et(3, 1, 1, 1),
      new et(1, 1, 1, 1),
      new et(3, 0, 1, 1),
      new et(1, 0, 1, 1)
    ], this._cubeDirections = [
      new P(1, 0, 0),
      new P(-1, 0, 0),
      new P(0, 0, 1),
      new P(0, 0, -1),
      new P(0, 1, 0),
      new P(0, -1, 0)
    ], this._cubeUps = [
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 0, 1),
      new P(0, 0, -1)
    ];
  }
  updateMatrices(e, t = 0) {
    const n = this.camera, i = this.matrix, r = e.distance || n.far;
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), mi.setFromMatrixPosition(e.matrixWorld), n.position.copy(mi), is.copy(n.position), is.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(is), n.updateMatrixWorld(), i.makeTranslation(-mi.x, -mi.y, -mi.z), Ca.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Ca, n.coordinateSystem, n.reversedDepth);
  }
}, rp = class extends Sr {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new hu();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(e) {
    this.intensity = e / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this;
  }
}, sl = class extends So {
  constructor(e = -1, t = 1, n = 1, i = -1, r = 0.1, s = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = r, this.far = s, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, n, i, r, s) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, i = (this.top + this.bottom) / 2;
    let r = n - e, s = n + e, a = i + t, o = i - t;
    if (this.view !== null && this.view.enabled) {
      const l = (this.right - this.left) / this.view.fullWidth / this.zoom, c = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += l * this.view.offsetX, s = r + l * this.view.width, a -= c * this.view.offsetY, o = a - c * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, s, a, o, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}, uu = class extends Ls {
  constructor() {
    super(new sl(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}, sp = class extends Sr {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(mt.DEFAULT_UP), this.updateMatrix(), this.target = new mt(), this.shadow = new uu();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}, ap = class {
  static extractUrlBase(e) {
    const t = e.lastIndexOf("/");
    return t === -1 ? "./" : e.slice(0, t + 1);
  }
  static resolveURL(e, t) {
    return typeof e != "string" || e === "" ? "" : (/^https?:\/\//i.test(t) && /^\//.test(e) && (t = t.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(e) || /^data:.*,.*$/i.test(e) || /^blob:.*$/i.test(e) ? e : t + e);
  }
}, rs = /* @__PURE__ */ new WeakMap(), op = class extends Pi {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" }, this._abortController = new AbortController();
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, s = Qt.get(`image-bitmap:${e}`);
    if (s !== void 0) {
      if (r.manager.itemStart(e), s.then) {
        s.then((l) => {
          if (rs.has(s) === !0)
            i && i(rs.get(s)), r.manager.itemError(e), r.manager.itemEnd(e);
          else
            return t && t(l), r.manager.itemEnd(e), l;
        });
        return;
      }
      return setTimeout(function() {
        t && t(s), r.manager.itemEnd(e);
      }, 0), s;
    }
    const a = {};
    a.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", a.headers = this.requestHeader, a.signal = typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
    const o = fetch(e, a).then(function(l) {
      return l.blob();
    }).then(function(l) {
      return createImageBitmap(l, Object.assign(r.options, { colorSpaceConversion: "none" }));
    }).then(function(l) {
      return Qt.add(`image-bitmap:${e}`, l), t && t(l), r.manager.itemEnd(e), l;
    }).catch(function(l) {
      i && i(l), rs.set(o, l), Qt.remove(`image-bitmap:${e}`), r.manager.itemError(e), r.manager.itemEnd(e);
    });
    Qt.add(`image-bitmap:${e}`, o), r.manager.itemStart(e);
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
}, fu = class extends At {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
  }
}, du = "\\[\\]\\.:\\/", pu = /* @__PURE__ */ new RegExp("[\\[\\]\\.:\\/]", "g"), Is = "[^\\[\\]\\.:\\/]", mu = "[^" + du.replace("\\.", "") + "]", gu = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Is), vu = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", mu), _u = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Is), xu = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Is), yu = new RegExp("^" + gu + vu + _u + xu + "$"), Mu = [
  "material",
  "materials",
  "bones",
  "map"
], Su = class {
  constructor(e, t, n) {
    const i = n || ct.parseTrackName(t);
    this._targetGroup = e, this._bindings = e.subscribe_(t, i);
  }
  getValue(e, t) {
    this.bind();
    const n = this._targetGroup.nCachedObjects_, i = this._bindings[n];
    i !== void 0 && i.getValue(e, t);
  }
  setValue(e, t) {
    const n = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i) n[i].setValue(e, t);
  }
  bind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
  }
  unbind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
  }
}, ct = class Yn {
  constructor(t, n, i) {
    this.path = n, this.parsedPath = i || Yn.parseTrackName(n), this.node = Yn.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(t, n, i) {
    return t && t.isAnimationObjectGroup ? new Yn.Composite(t, n, i) : new Yn(t, n, i);
  }
  static sanitizeNodeName(t) {
    return t.replace(/\s/g, "_").replace(pu, "");
  }
  static parseTrackName(t) {
    const n = yu.exec(t);
    if (n === null) throw new Error("PropertyBinding: Cannot parse trackName: " + t);
    const i = {
      nodeName: n[2],
      objectName: n[3],
      objectIndex: n[4],
      propertyName: n[5],
      propertyIndex: n[6]
    }, r = i.nodeName && i.nodeName.lastIndexOf(".");
    if (r !== void 0 && r !== -1) {
      const s = i.nodeName.substring(r + 1);
      Mu.indexOf(s) !== -1 && (i.nodeName = i.nodeName.substring(0, r), i.objectName = s);
    }
    if (i.propertyName === null || i.propertyName.length === 0) throw new Error("PropertyBinding: can not parse propertyName from trackName: " + t);
    return i;
  }
  static findNode(t, n) {
    if (n === void 0 || n === "" || n === "." || n === -1 || n === t.name || n === t.uuid) return t;
    if (t.skeleton) {
      const i = t.skeleton.getBoneByName(n);
      if (i !== void 0) return i;
    }
    if (t.children) {
      const i = function(s) {
        for (let a = 0; a < s.length; a++) {
          const o = s[a];
          if (o.name === n || o.uuid === n) return o;
          const l = i(o.children);
          if (l) return l;
        }
        return null;
      }, r = i(t.children);
      if (r) return r;
    }
    return null;
  }
  _getValue_unavailable() {
  }
  _setValue_unavailable() {
  }
  _getValue_direct(t, n) {
    t[n] = this.targetObject[this.propertyName];
  }
  _getValue_array(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) t[n++] = i[r];
  }
  _getValue_arrayElement(t, n) {
    t[n] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(t, n) {
    this.resolvedProperty.toArray(t, n);
  }
  _setValue_direct(t, n) {
    this.targetObject[this.propertyName] = t[n];
  }
  _setValue_direct_setNeedsUpdate(t, n) {
    this.targetObject[this.propertyName] = t[n], this.targetObject.needsUpdate = !0;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(t, n) {
    this.targetObject[this.propertyName] = t[n], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_array(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
  }
  _setValue_array_setNeedsUpdate(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
    this.targetObject.needsUpdate = !0;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
    this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_arrayElement(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n];
  }
  _setValue_arrayElement_setNeedsUpdate(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n], this.targetObject.needsUpdate = !0;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_fromArray(t, n) {
    this.resolvedProperty.fromArray(t, n);
  }
  _setValue_fromArray_setNeedsUpdate(t, n) {
    this.resolvedProperty.fromArray(t, n), this.targetObject.needsUpdate = !0;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(t, n) {
    this.resolvedProperty.fromArray(t, n), this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _getValue_unbound(t, n) {
    this.bind(), this.getValue(t, n);
  }
  _setValue_unbound(t, n) {
    this.bind(), this.setValue(t, n);
  }
  bind() {
    let t = this.node;
    const n = this.parsedPath, i = n.objectName, r = n.propertyName;
    let s = n.propertyIndex;
    if (t || (t = Yn.findNode(this.rootNode, n.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
      console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (i) {
      let c = n.objectIndex;
      switch (i) {
        case "materials":
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.materials) {
            console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          t = t.material.materials;
          break;
        case "bones":
          if (!t.skeleton) {
            console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          t = t.skeleton.bones;
          for (let h = 0; h < t.length; h++) if (t[h].name === c) {
            c = h;
            break;
          }
          break;
        case "map":
          if ("map" in t) {
            t = t.map;
            break;
          }
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.map) {
            console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          t = t.material.map;
          break;
        default:
          if (t[i] === void 0) {
            console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          t = t[i];
      }
      if (c !== void 0) {
        if (t[c] === void 0) {
          console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
          return;
        }
        t = t[c];
      }
    }
    const a = t[r];
    if (a === void 0) {
      const c = n.nodeName;
      console.error("THREE.PropertyBinding: Trying to update property for track: " + c + "." + r + " but it wasn't found.", t);
      return;
    }
    let o = this.Versioning.None;
    this.targetObject = t, t.isMaterial === !0 ? o = this.Versioning.NeedsUpdate : t.isObject3D === !0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
    let l = this.BindingType.Direct;
    if (s !== void 0) {
      if (r === "morphTargetInfluences") {
        if (!t.geometry) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!t.geometry.morphAttributes) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        t.morphTargetDictionary[s] !== void 0 && (s = t.morphTargetDictionary[s]);
      }
      l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = s;
    } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = r;
    this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
};
ct.Composite = Su;
ct.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
ct.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
ct.prototype.GetterByBindingType = [
  ct.prototype._getValue_direct,
  ct.prototype._getValue_array,
  ct.prototype._getValue_arrayElement,
  ct.prototype._getValue_toArray
];
ct.prototype.SetterByBindingTypeAndVersioning = [
  [
    ct.prototype._setValue_direct,
    ct.prototype._setValue_direct_setNeedsUpdate,
    ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    ct.prototype._setValue_array,
    ct.prototype._setValue_array_setNeedsUpdate,
    ct.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    ct.prototype._setValue_arrayElement,
    ct.prototype._setValue_arrayElement_setNeedsUpdate,
    ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    ct.prototype._setValue_fromArray,
    ct.prototype._setValue_fromArray_setNeedsUpdate,
    ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
var Pa = /* @__PURE__ */ new Ye(), lp = class {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new Ci(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new As(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return Pa.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Pa), this;
  }
  intersectObject(e, t = !0, n = []) {
    return xs(e, this, n, t), n.sort(La), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++) xs(e[i], this, n, t);
    return n.sort(La), n;
  }
};
function La(e, t) {
  return e.distance - t.distance;
}
function xs(e, t, n, i) {
  let r = !0;
  if (e.layers.test(t.layers) && e.raycast(t, n) === !1 && (r = !1), r === !0 && i === !0) {
    const s = e.children;
    for (let a = 0, o = s.length; a < o; a++) xs(s[a], t, n, !0);
  }
}
var cp = class {
  constructor(e = 1, t = 0, n = 0) {
    this.radius = e, this.phi = t, this.theta = n;
  }
  set(e, t, n) {
    return this.radius = e, this.phi = t, this.theta = n, this;
  }
  copy(e) {
    return this.radius = e.radius, this.phi = e.phi, this.theta = e.theta, this;
  }
  makeSafe() {
    return this.phi = Ve(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  setFromVector3(e) {
    return this.setFromCartesianCoords(e.x, e.y, e.z);
  }
  setFromCartesianCoords(e, t, n) {
    return this.radius = Math.sqrt(e * e + t * t + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, n), this.phi = Math.acos(Ve(t / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, hp = class extends Cn {
  constructor(e, t = null) {
    super(), this.object = e, this.domElement = t, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = {
      LEFT: null,
      MIDDLE: null,
      RIGHT: null
    }, this.touches = {
      ONE: null,
      TWO: null
    };
  }
  connect(e) {
    if (e === void 0) {
      console.warn("THREE.Controls: connect() now requires an element.");
      return;
    }
    this.domElement !== null && this.disconnect(), this.domElement = e;
  }
  disconnect() {
  }
  dispose() {
  }
  update() {
  }
};
function Ia(e, t, n, i) {
  const r = Eu(i);
  switch (n) {
    case Pl:
      return e * t;
    case so:
      return e * t / r.components * r.byteLength;
    case Il:
      return e * t / r.components * r.byteLength;
    case Ul:
      return e * t * 2 / r.components * r.byteLength;
    case Dl:
      return e * t * 2 / r.components * r.byteLength;
    case Ll:
      return e * t * 3 / r.components * r.byteLength;
    case $n:
      return e * t * 4 / r.components * r.byteLength;
    case Nl:
      return e * t * 4 / r.components * r.byteLength;
    case Ol:
    case Fl:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Bl:
    case zl:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Hl:
    case Gl:
      return Math.max(e, 16) * Math.max(t, 8) / 4;
    case Vl:
    case kl:
      return Math.max(e, 8) * Math.max(t, 8) / 2;
    case Wl:
    case Xl:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case ql:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Yl:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Jl:
      return Math.floor((e + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Zl:
      return Math.floor((e + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Kl:
      return Math.floor((e + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case $l:
      return Math.floor((e + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case jl:
      return Math.floor((e + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case Ql:
      return Math.floor((e + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ec:
      return Math.floor((e + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case tc:
      return Math.floor((e + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case nc:
      return Math.floor((e + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case ic:
      return Math.floor((e + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case rc:
      return Math.floor((e + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case sc:
      return Math.floor((e + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case ac:
      return Math.floor((e + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case oc:
    case lc:
    case cc:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
    case hc:
    case uc:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 8;
    case fc:
    case dc:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${n} format.`);
}
function Eu(e) {
  switch (e) {
    case Kn:
    case Ml:
      return {
        byteLength: 1,
        components: 1
      };
    case El:
    case Sl:
    case Es:
      return {
        byteLength: 2,
        components: 1
      };
    case bl:
    case Al:
      return {
        byteLength: 2,
        components: 4
      };
    case Ss:
    case Tl:
    case Ri:
      return {
        byteLength: 4,
        components: 1
      };
    case Rl:
    case Cl:
      return {
        byteLength: 4,
        components: 3
      };
  }
  throw new Error(`Unknown texture type ${e}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "180" } }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "180");
function al() {
  let e = null, t = !1, n = null, i = null;
  function r(s, a) {
    n(s, a), i = e.requestAnimationFrame(r);
  }
  return {
    start: function() {
      t !== !0 && n !== null && (i = e.requestAnimationFrame(r), t = !0);
    },
    stop: function() {
      e.cancelAnimationFrame(i), t = !1;
    },
    setAnimationLoop: function(s) {
      n = s;
    },
    setContext: function(s) {
      e = s;
    }
  };
}
function Tu(e) {
  const t = /* @__PURE__ */ new WeakMap();
  function n(o, l) {
    const c = o.array, h = o.usage, u = c.byteLength, f = e.createBuffer();
    e.bindBuffer(l, f), e.bufferData(l, c, h), o.onUploadCallback();
    let p;
    if (c instanceof Float32Array) p = e.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array) p = e.HALF_FLOAT;
    else if (c instanceof Uint16Array) o.isFloat16BufferAttribute ? p = e.HALF_FLOAT : p = e.UNSIGNED_SHORT;
    else if (c instanceof Int16Array) p = e.SHORT;
    else if (c instanceof Uint32Array) p = e.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = e.INT;
    else if (c instanceof Int8Array) p = e.BYTE;
    else if (c instanceof Uint8Array) p = e.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = e.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: f,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: u
    };
  }
  function i(o, l, c) {
    const h = l.array, u = l.updateRanges;
    if (e.bindBuffer(c, o), u.length === 0) e.bufferSubData(c, 0, h);
    else {
      u.sort((p, v) => p.start - v.start);
      let f = 0;
      for (let p = 1; p < u.length; p++) {
        const v = u[f], g = u[p];
        g.start <= v.start + v.count + 1 ? v.count = Math.max(v.count, g.start + g.count - v.start) : (++f, u[f] = g);
      }
      u.length = f + 1;
      for (let p = 0, v = u.length; p < v; p++) {
        const g = u[p];
        e.bufferSubData(c, g.start * h.BYTES_PER_ELEMENT, h, g.start, g.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), t.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = t.get(o);
    l && (e.deleteBuffer(l.buffer), t.delete(o));
  }
  function a(o, l) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = t.get(o);
      (!h || h.version < o.version) && t.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    const c = t.get(o);
    if (c === void 0) t.set(o, n(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      i(c.buffer, o, l), c.version = o.version;
    }
  }
  return {
    get: r,
    remove: s,
    update: a
  };
}
var He = {
  alphahash_fragment: `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  alphahash_pars_fragment: `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  alphamap_fragment: `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  alphamap_pars_fragment: `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  alphatest_fragment: `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  alphatest_pars_fragment: `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  aomap_fragment: `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  aomap_pars_fragment: `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  batching_pars_vertex: `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  batching_vertex: `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  begin_vertex: `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  beginnormal_vertex: `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  bsdfs: `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  iridescence_fragment: `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  bumpmap_pars_fragment: `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  clipping_planes_fragment: `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  clipping_planes_pars_fragment: `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  clipping_planes_pars_vertex: `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  clipping_planes_vertex: `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  color_fragment: `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  color_pars_fragment: `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  color_pars_vertex: `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  color_vertex: `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  common: `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  cube_uv_reflection_fragment: `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  defaultnormal_vertex: `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  displacementmap_pars_vertex: `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  displacementmap_vertex: `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  emissivemap_fragment: `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  emissivemap_pars_fragment: `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  colorspace_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  colorspace_pars_fragment: `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  envmap_fragment: `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  envmap_common_pars_fragment: `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  envmap_pars_fragment: `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  envmap_pars_vertex: `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  envmap_physical_pars_fragment: `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  envmap_vertex: `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  fog_vertex: `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  fog_pars_vertex: `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  fog_fragment: `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  fog_pars_fragment: `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  gradientmap_pars_fragment: `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  lightmap_pars_fragment: `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  lights_lambert_fragment: `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  lights_lambert_pars_fragment: `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  lights_pars_begin: `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  lights_toon_fragment: `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  lights_toon_pars_fragment: `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  lights_phong_fragment: `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  lights_phong_pars_fragment: `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  lights_physical_fragment: `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  lights_physical_pars_fragment: `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  lights_fragment_begin: `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  lights_fragment_maps: `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  lights_fragment_end: `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  logdepthbuf_fragment: `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  logdepthbuf_pars_fragment: `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  logdepthbuf_pars_vertex: `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  logdepthbuf_vertex: `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  map_fragment: `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  map_pars_fragment: `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  map_particle_fragment: `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  map_particle_pars_fragment: `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  metalnessmap_fragment: `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  metalnessmap_pars_fragment: `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  morphinstance_vertex: `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  morphcolor_vertex: `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  morphnormal_vertex: `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  morphtarget_pars_vertex: `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  morphtarget_vertex: `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  normal_fragment_begin: `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  normal_fragment_maps: `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  normal_pars_fragment: `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  normal_pars_vertex: `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  normal_vertex: `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  normalmap_pars_fragment: `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  clearcoat_normal_fragment_begin: `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  clearcoat_normal_fragment_maps: `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  clearcoat_pars_fragment: `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  iridescence_pars_fragment: `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  opaque_fragment: `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  packing: `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  premultiplied_alpha_fragment: `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  project_vertex: `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  dithering_fragment: `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  dithering_pars_fragment: `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  roughnessmap_fragment: `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  roughnessmap_pars_fragment: `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  shadowmap_pars_fragment: `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  shadowmap_pars_vertex: `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  shadowmap_vertex: `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  shadowmask_pars_fragment: `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  skinbase_vertex: `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  skinning_pars_vertex: `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  skinning_vertex: `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  skinnormal_vertex: `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  specularmap_fragment: `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  specularmap_pars_fragment: `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  tonemapping_fragment: `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  tonemapping_pars_fragment: `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  transmission_fragment: `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  transmission_pars_fragment: `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  uv_pars_fragment: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  uv_pars_vertex: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  uv_vertex: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  worldpos_vertex: `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,
  background_vert: `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  background_frag: `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  backgroundCube_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  backgroundCube_frag: `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  cube_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  cube_frag: `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  depth_vert: `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  depth_frag: `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  distanceRGBA_vert: `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  distanceRGBA_frag: `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  equirect_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  equirect_frag: `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  linedashed_vert: `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  linedashed_frag: `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  meshbasic_vert: `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  meshbasic_frag: `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshlambert_vert: `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshlambert_frag: `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshmatcap_vert: `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  meshmatcap_frag: `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshnormal_vert: `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  meshnormal_frag: `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  meshphong_vert: `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshphong_frag: `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshphysical_vert: `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  meshphysical_frag: `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshtoon_vert: `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshtoon_frag: `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  points_vert: `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  points_frag: `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  shadow_vert: `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  shadow_frag: `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  sprite_vert: `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  sprite_frag: `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`
}, de = {
  common: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Xe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Xe() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Xe() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    ior: { value: 1.5 },
    refractionRatio: { value: 0.98 }
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Xe() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Xe() },
    normalScale: { value: /* @__PURE__ */ new oe(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Xe() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Xe() }
  },
  gradientmap: { gradientMap: { value: null } },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new ke(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: {
      value: [],
      properties: {
        direction: {},
        color: {}
      }
    },
    directionalLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      }
    },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        direction: {},
        distance: {},
        coneCos: {},
        penumbraCos: {},
        decay: {}
      }
    },
    spotLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      }
    },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        decay: {},
        distance: {}
      }
    },
    pointLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
        shadowCameraNear: {},
        shadowCameraFar: {}
      }
    },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: {
      value: [],
      properties: {
        direction: {},
        skyColor: {},
        groundColor: {}
      }
    },
    rectAreaLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        width: {},
        height: {}
      }
    },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Xe() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Xe() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new oe(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Xe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Xe() },
    alphaTest: { value: 0 }
  }
}, Xt = {
  basic: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.specularmap,
      de.envmap,
      de.aomap,
      de.lightmap,
      de.fog
    ]),
    vertexShader: He.meshbasic_vert,
    fragmentShader: He.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.specularmap,
      de.envmap,
      de.aomap,
      de.lightmap,
      de.emissivemap,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      de.fog,
      de.lights,
      { emissive: { value: /* @__PURE__ */ new ke(0) } }
    ]),
    vertexShader: He.meshlambert_vert,
    fragmentShader: He.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.specularmap,
      de.envmap,
      de.aomap,
      de.lightmap,
      de.emissivemap,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      de.fog,
      de.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) },
        specular: { value: /* @__PURE__ */ new ke(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: He.meshphong_vert,
    fragmentShader: He.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.envmap,
      de.aomap,
      de.lightmap,
      de.emissivemap,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      de.roughnessmap,
      de.metalnessmap,
      de.fog,
      de.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: He.meshphysical_vert,
    fragmentShader: He.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.aomap,
      de.lightmap,
      de.emissivemap,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      de.gradientmap,
      de.fog,
      de.lights,
      { emissive: { value: /* @__PURE__ */ new ke(0) } }
    ]),
    vertexShader: He.meshtoon_vert,
    fragmentShader: He.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      de.fog,
      { matcap: { value: null } }
    ]),
    vertexShader: He.meshmatcap_vert,
    fragmentShader: He.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ St([de.points, de.fog]),
    vertexShader: He.points_vert,
    fragmentShader: He.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: He.linedashed_vert,
    fragmentShader: He.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ St([de.common, de.displacementmap]),
    vertexShader: He.depth_vert,
    fragmentShader: He.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.bumpmap,
      de.normalmap,
      de.displacementmap,
      { opacity: { value: 1 } }
    ]),
    vertexShader: He.meshnormal_vert,
    fragmentShader: He.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ St([de.sprite, de.fog]),
    vertexShader: He.sprite_vert,
    fragmentShader: He.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Xe() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: He.background_vert,
    fragmentShader: He.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Xe() }
    },
    vertexShader: He.backgroundCube_vert,
    fragmentShader: He.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: He.cube_vert,
    fragmentShader: He.cube_frag
  },
  equirect: {
    uniforms: { tEquirect: { value: null } },
    vertexShader: He.equirect_vert,
    fragmentShader: He.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ St([
      de.common,
      de.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new P() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: He.distanceRGBA_vert,
    fragmentShader: He.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ St([
      de.lights,
      de.fog,
      {
        color: { value: /* @__PURE__ */ new ke(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: He.shadow_vert,
    fragmentShader: He.shadow_frag
  }
};
Xt.physical = {
  uniforms: /* @__PURE__ */ St([Xt.standard.uniforms, {
    clearcoat: { value: 0 },
    clearcoatMap: { value: null },
    clearcoatMapTransform: { value: /* @__PURE__ */ new Xe() },
    clearcoatNormalMap: { value: null },
    clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Xe() },
    clearcoatNormalScale: { value: /* @__PURE__ */ new oe(1, 1) },
    clearcoatRoughness: { value: 0 },
    clearcoatRoughnessMap: { value: null },
    clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Xe() },
    dispersion: { value: 0 },
    iridescence: { value: 0 },
    iridescenceMap: { value: null },
    iridescenceMapTransform: { value: /* @__PURE__ */ new Xe() },
    iridescenceIOR: { value: 1.3 },
    iridescenceThicknessMinimum: { value: 100 },
    iridescenceThicknessMaximum: { value: 400 },
    iridescenceThicknessMap: { value: null },
    iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Xe() },
    sheen: { value: 0 },
    sheenColor: { value: /* @__PURE__ */ new ke(0) },
    sheenColorMap: { value: null },
    sheenColorMapTransform: { value: /* @__PURE__ */ new Xe() },
    sheenRoughness: { value: 1 },
    sheenRoughnessMap: { value: null },
    sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Xe() },
    transmission: { value: 0 },
    transmissionMap: { value: null },
    transmissionMapTransform: { value: /* @__PURE__ */ new Xe() },
    transmissionSamplerSize: { value: /* @__PURE__ */ new oe() },
    transmissionSamplerMap: { value: null },
    thickness: { value: 0 },
    thicknessMap: { value: null },
    thicknessMapTransform: { value: /* @__PURE__ */ new Xe() },
    attenuationDistance: { value: 0 },
    attenuationColor: { value: /* @__PURE__ */ new ke(0) },
    specularColor: { value: /* @__PURE__ */ new ke(1, 1, 1) },
    specularColorMap: { value: null },
    specularColorMapTransform: { value: /* @__PURE__ */ new Xe() },
    specularIntensity: { value: 1 },
    specularIntensityMap: { value: null },
    specularIntensityMapTransform: { value: /* @__PURE__ */ new Xe() },
    anisotropyVector: { value: /* @__PURE__ */ new oe() },
    anisotropyMap: { value: null },
    anisotropyMapTransform: { value: /* @__PURE__ */ new Xe() }
  }]),
  vertexShader: He.meshphysical_vert,
  fragmentShader: He.meshphysical_frag
};
var or = {
  r: 0,
  b: 0,
  g: 0
}, xn = /* @__PURE__ */ new tn(), bu = /* @__PURE__ */ new Ye();
function Au(e, t, n, i, r, s, a) {
  const o = new ke(0);
  let l = s === !0 ? 0 : 1, c, h, u = null, f = 0, p = null;
  function v(_) {
    let S = _.isScene === !0 ? _.background : null;
    return S && S.isTexture && (S = (_.backgroundBlurriness > 0 ? n : t).get(S)), S;
  }
  function g(_) {
    let S = !1;
    const L = v(_);
    L === null ? d(o, l) : L && L.isColor && (d(L, 1), S = !0);
    const A = e.xr.getEnvironmentBlendMode();
    A === "additive" ? i.buffers.color.setClear(0, 0, 0, 1, a) : A === "alpha-blend" && i.buffers.color.setClear(0, 0, 0, 0, a), (e.autoClear || S) && (i.buffers.depth.setTest(!0), i.buffers.depth.setMask(!0), i.buffers.color.setMask(!0), e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil));
  }
  function m(_, S) {
    const L = v(S);
    L && (L.isCubeTexture || L.mapping === 306) ? (h === void 0 && (h = new Pt(new ws(1, 1, 1), new hn({
      name: "BackgroundCubeMaterial",
      uniforms: ei(Xt.backgroundCube.uniforms),
      vertexShader: Xt.backgroundCube.vertexShader,
      fragmentShader: Xt.backgroundCube.fragmentShader,
      side: 1,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(A, C, U) {
      this.matrixWorld.copyPosition(U.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", { get: function() {
      return this.uniforms.envMap.value;
    } }), r.update(h)), xn.copy(S.backgroundRotation), xn.x *= -1, xn.y *= -1, xn.z *= -1, L.isCubeTexture && L.isRenderTargetTexture === !1 && (xn.y *= -1, xn.z *= -1), h.material.uniforms.envMap.value = L, h.material.uniforms.flipEnvMap.value = L.isCubeTexture && L.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(bu.makeRotationFromEuler(xn)), h.material.toneMapped = je.getTransfer(L.colorSpace) !== mr, (u !== L || f !== L.version || p !== e.toneMapping) && (h.material.needsUpdate = !0, u = L, f = L.version, p = e.toneMapping), h.layers.enableAll(), _.unshift(h, h.geometry, h.material, 0, 0, null)) : L && L.isTexture && (c === void 0 && (c = new Pt(new $o(2, 2), new hn({
      name: "BackgroundMaterial",
      uniforms: ei(Xt.background.uniforms),
      vertexShader: Xt.background.vertexShader,
      fragmentShader: Xt.background.fragmentShader,
      side: 0,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
      return this.uniforms.t2D.value;
    } }), r.update(c)), c.material.uniforms.t2D.value = L, c.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, c.material.toneMapped = je.getTransfer(L.colorSpace) !== mr, L.matrixAutoUpdate === !0 && L.updateMatrix(), c.material.uniforms.uvTransform.value.copy(L.matrix), (u !== L || f !== L.version || p !== e.toneMapping) && (c.material.needsUpdate = !0, u = L, f = L.version, p = e.toneMapping), c.layers.enableAll(), _.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function d(_, S) {
    _.getRGB(or, Mo(e)), i.buffers.color.setClear(or.r, or.g, or.b, S, a);
  }
  function T() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(_, S = 1) {
      o.set(_), l = S, d(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(_) {
      l = _, d(o, l);
    },
    render: g,
    addToRenderList: m,
    dispose: T
  };
}
function wu(e, t) {
  const n = e.getParameter(e.MAX_VERTEX_ATTRIBS), i = {}, r = f(null);
  let s = r, a = !1;
  function o(M, w, F, H, B) {
    let Y = !1;
    const k = u(H, F, w);
    s !== k && (s = k, c(s.object)), Y = p(M, H, F, B), Y && v(M, H, F, B), B !== null && t.update(B, e.ELEMENT_ARRAY_BUFFER), (Y || a) && (a = !1, S(M, w, F, H), B !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t.get(B).buffer));
  }
  function l() {
    return e.createVertexArray();
  }
  function c(M) {
    return e.bindVertexArray(M);
  }
  function h(M) {
    return e.deleteVertexArray(M);
  }
  function u(M, w, F) {
    const H = F.wireframe === !0;
    let B = i[M.id];
    B === void 0 && (B = {}, i[M.id] = B);
    let Y = B[w.id];
    Y === void 0 && (Y = {}, B[w.id] = Y);
    let k = Y[H];
    return k === void 0 && (k = f(l()), Y[H] = k), k;
  }
  function f(M) {
    const w = [], F = [], H = [];
    for (let B = 0; B < n; B++)
      w[B] = 0, F[B] = 0, H[B] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: w,
      enabledAttributes: F,
      attributeDivisors: H,
      object: M,
      attributes: {},
      index: null
    };
  }
  function p(M, w, F, H) {
    const B = s.attributes, Y = w.attributes;
    let k = 0;
    const ee = F.getAttributes();
    for (const W in ee) if (ee[W].location >= 0) {
      const se = B[W];
      let pe = Y[W];
      if (pe === void 0 && (W === "instanceMatrix" && M.instanceMatrix && (pe = M.instanceMatrix), W === "instanceColor" && M.instanceColor && (pe = M.instanceColor)), se === void 0 || se.attribute !== pe || pe && se.data !== pe.data) return !0;
      k++;
    }
    return s.attributesNum !== k || s.index !== H;
  }
  function v(M, w, F, H) {
    const B = {}, Y = w.attributes;
    let k = 0;
    const ee = F.getAttributes();
    for (const W in ee) if (ee[W].location >= 0) {
      let se = Y[W];
      se === void 0 && (W === "instanceMatrix" && M.instanceMatrix && (se = M.instanceMatrix), W === "instanceColor" && M.instanceColor && (se = M.instanceColor));
      const pe = {};
      pe.attribute = se, se && se.data && (pe.data = se.data), B[W] = pe, k++;
    }
    s.attributes = B, s.attributesNum = k, s.index = H;
  }
  function g() {
    const M = s.newAttributes;
    for (let w = 0, F = M.length; w < F; w++) M[w] = 0;
  }
  function m(M) {
    d(M, 0);
  }
  function d(M, w) {
    const F = s.newAttributes, H = s.enabledAttributes, B = s.attributeDivisors;
    F[M] = 1, H[M] === 0 && (e.enableVertexAttribArray(M), H[M] = 1), B[M] !== w && (e.vertexAttribDivisor(M, w), B[M] = w);
  }
  function T() {
    const M = s.newAttributes, w = s.enabledAttributes;
    for (let F = 0, H = w.length; F < H; F++) w[F] !== M[F] && (e.disableVertexAttribArray(F), w[F] = 0);
  }
  function _(M, w, F, H, B, Y, k) {
    k === !0 ? e.vertexAttribIPointer(M, w, F, B, Y) : e.vertexAttribPointer(M, w, F, H, B, Y);
  }
  function S(M, w, F, H) {
    g();
    const B = H.attributes, Y = F.getAttributes(), k = w.defaultAttributeValues;
    for (const ee in Y) {
      const W = Y[ee];
      if (W.location >= 0) {
        let se = B[ee];
        if (se === void 0 && (ee === "instanceMatrix" && M.instanceMatrix && (se = M.instanceMatrix), ee === "instanceColor" && M.instanceColor && (se = M.instanceColor)), se !== void 0) {
          const pe = se.normalized, De = se.itemSize, Fe = t.get(se);
          if (Fe === void 0) continue;
          const nt = Fe.buffer, Ze = Fe.type, q = Fe.bytesPerElement, he = Ze === e.INT || Ze === e.UNSIGNED_INT || se.gpuType === 1013;
          if (se.isInterleavedBufferAttribute) {
            const fe = se.data, ye = fe.stride, Ie = se.offset;
            if (fe.isInstancedInterleavedBuffer) {
              for (let Ee = 0; Ee < W.locationSize; Ee++) d(W.location + Ee, fe.meshPerAttribute);
              M.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = fe.meshPerAttribute * fe.count);
            } else for (let Ee = 0; Ee < W.locationSize; Ee++) m(W.location + Ee);
            e.bindBuffer(e.ARRAY_BUFFER, nt);
            for (let Ee = 0; Ee < W.locationSize; Ee++) _(W.location + Ee, De / W.locationSize, Ze, pe, ye * q, (Ie + De / W.locationSize * Ee) * q, he);
          } else {
            if (se.isInstancedBufferAttribute) {
              for (let fe = 0; fe < W.locationSize; fe++) d(W.location + fe, se.meshPerAttribute);
              M.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = se.meshPerAttribute * se.count);
            } else for (let fe = 0; fe < W.locationSize; fe++) m(W.location + fe);
            e.bindBuffer(e.ARRAY_BUFFER, nt);
            for (let fe = 0; fe < W.locationSize; fe++) _(W.location + fe, De / W.locationSize, Ze, pe, De * q, De / W.locationSize * fe * q, he);
          }
        } else if (k !== void 0) {
          const pe = k[ee];
          if (pe !== void 0) switch (pe.length) {
            case 2:
              e.vertexAttrib2fv(W.location, pe);
              break;
            case 3:
              e.vertexAttrib3fv(W.location, pe);
              break;
            case 4:
              e.vertexAttrib4fv(W.location, pe);
              break;
            default:
              e.vertexAttrib1fv(W.location, pe);
          }
        }
      }
    }
    T();
  }
  function L() {
    U();
    for (const M in i) {
      const w = i[M];
      for (const F in w) {
        const H = w[F];
        for (const B in H)
          h(H[B].object), delete H[B];
        delete w[F];
      }
      delete i[M];
    }
  }
  function A(M) {
    if (i[M.id] === void 0) return;
    const w = i[M.id];
    for (const F in w) {
      const H = w[F];
      for (const B in H)
        h(H[B].object), delete H[B];
      delete w[F];
    }
    delete i[M.id];
  }
  function C(M) {
    for (const w in i) {
      const F = i[w];
      if (F[M.id] === void 0) continue;
      const H = F[M.id];
      for (const B in H)
        h(H[B].object), delete H[B];
      delete F[M.id];
    }
  }
  function U() {
    E(), a = !0, s !== r && (s = r, c(s.object));
  }
  function E() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: U,
    resetDefaultState: E,
    dispose: L,
    releaseStatesOfGeometry: A,
    releaseStatesOfProgram: C,
    initAttributes: g,
    enableAttribute: m,
    disableUnusedAttributes: T
  };
}
function Ru(e, t, n) {
  let i;
  function r(c) {
    i = c;
  }
  function s(c, h) {
    e.drawArrays(i, c, h), n.update(h, i, 1);
  }
  function a(c, h, u) {
    u !== 0 && (e.drawArraysInstanced(i, c, h, u), n.update(h, i, u));
  }
  function o(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i, c, 0, h, 0, u);
    let f = 0;
    for (let p = 0; p < u; p++) f += h[p];
    n.update(f, i, 1);
  }
  function l(c, h, u, f) {
    if (u === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null) for (let v = 0; v < c.length; v++) a(c[v], h[v], f[v]);
    else {
      p.multiDrawArraysInstancedWEBGL(i, c, 0, h, 0, f, 0, u);
      let v = 0;
      for (let g = 0; g < u; g++) v += h[g] * f[g];
      n.update(v, i, 1);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function Cu(e, t, n, i) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const C = t.get("EXT_texture_filter_anisotropic");
      r = e.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else r = 0;
    return r;
  }
  function a(C) {
    return !(C !== 1023 && i.convert(C) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(C) {
    const U = C === 1016 && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(C !== 1009 && i.convert(C) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE) && C !== 1015 && !U);
  }
  function l(C) {
    if (C === "highp") {
      if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp";
      C = "mediump";
    }
    return C === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = n.precision !== void 0 ? n.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const u = n.logarithmicDepthBuffer === !0, f = n.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), p = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), v = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), g = e.getParameter(e.MAX_TEXTURE_SIZE), m = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), d = e.getParameter(e.MAX_VERTEX_ATTRIBS), T = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), _ = e.getParameter(e.MAX_VARYING_VECTORS), S = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), L = v > 0, A = e.getParameter(e.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: u,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: v,
    maxTextureSize: g,
    maxCubemapSize: m,
    maxAttributes: d,
    maxVertexUniforms: T,
    maxVaryings: _,
    maxFragmentUniforms: S,
    vertexTextures: L,
    maxSamples: A
  };
}
function Pu(e) {
  const t = this;
  let n = null, i = 0, r = !1, s = !1;
  const a = new Mn(), o = new Xe(), l = {
    value: null,
    needsUpdate: !1
  };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, f) {
    const p = u.length !== 0 || f || i !== 0 || r;
    return r = f, i = u.length, p;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(u, f) {
    n = h(u, f, 0);
  }, this.setState = function(u, f, p) {
    const v = u.clippingPlanes, g = u.clipIntersection, m = u.clipShadows, d = e.get(u);
    if (!r || v === null || v.length === 0 || s && !m) s ? h(null) : c();
    else {
      const T = s ? 0 : i, _ = T * 4;
      let S = d.clippingState || null;
      l.value = S, S = h(v, f, _, p);
      for (let L = 0; L !== _; ++L) S[L] = n[L];
      d.clippingState = S, this.numIntersection = g ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function c() {
    l.value !== n && (l.value = n, l.needsUpdate = i > 0), t.numPlanes = i, t.numIntersection = 0;
  }
  function h(u, f, p, v) {
    const g = u !== null ? u.length : 0;
    let m = null;
    if (g !== 0) {
      if (m = l.value, v !== !0 || m === null) {
        const d = p + g * 4, T = f.matrixWorldInverse;
        o.getNormalMatrix(T), (m === null || m.length < d) && (m = new Float32Array(d));
        for (let _ = 0, S = p; _ !== g; ++_, S += 4)
          a.copy(u[_]).applyMatrix4(T, o), a.normal.toArray(m, S), m[S + 3] = a.constant;
      }
      l.value = m, l.needsUpdate = !0;
    }
    return t.numPlanes = g, t.numIntersection = 0, m;
  }
}
function Lu(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(a, o) {
    return o === 303 ? a.mapping = 301 : o === 304 && (a.mapping = 302), a;
  }
  function i(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === 303 || o === 304) if (t.has(a)) {
        const l = t.get(a).texture;
        return n(l, a.mapping);
      } else {
        const l = a.image;
        if (l && l.height > 0) {
          const c = new ih(l.height);
          return c.fromEquirectangularTexture(e, a), t.set(a, c), a.addEventListener("dispose", r), n(c.texture, a.mapping);
        } else return null;
      }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = t.get(o);
    l !== void 0 && (t.delete(o), l.dispose());
  }
  function s() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: i,
    dispose: s
  };
}
var Jn = 4, Ua = [
  0.125,
  0.215,
  0.35,
  0.446,
  0.526,
  0.582
], En = 20, ss = /* @__PURE__ */ new sl(), Da = /* @__PURE__ */ new ke(), as = null, os = 0, ls = 0, cs = !1, Sn = (1 + Math.sqrt(5)) / 2, Xn = 1 / Sn, Na = [
  /* @__PURE__ */ new P(-Sn, Xn, 0),
  /* @__PURE__ */ new P(Sn, Xn, 0),
  /* @__PURE__ */ new P(-Xn, 0, Sn),
  /* @__PURE__ */ new P(Xn, 0, Sn),
  /* @__PURE__ */ new P(0, Sn, -Xn),
  /* @__PURE__ */ new P(0, Sn, Xn),
  /* @__PURE__ */ new P(-1, 1, -1),
  /* @__PURE__ */ new P(1, 1, -1),
  /* @__PURE__ */ new P(-1, 1, 1),
  /* @__PURE__ */ new P(1, 1, 1)
], Iu = /* @__PURE__ */ new P(), Oa = class {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(e, t = 0, n = 0.1, i = 100, r = {}) {
    const { size: s = 256, position: a = Iu } = r;
    as = this._renderer.getRenderTarget(), os = this._renderer.getActiveCubeFace(), ls = this._renderer.getActiveMipmapLevel(), cs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(s);
    const o = this._allocateTargets();
    return o.depthBuffer = !0, this._sceneToCubeUV(e, n, i, o, a), t > 0 && this._blur(o, 0, 0, t), this._applyPMREM(o), this._cleanup(o), o;
  }
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = za(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Ba(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(as, os, ls), this._renderer.xr.enabled = cs, e.scissorTest = !1, lr(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), as = this._renderer.getRenderTarget(), os = this._renderer.getActiveCubeFace(), ls = this._renderer.getActiveMipmapLevel(), cs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: An,
      minFilter: An,
      generateMipmaps: !1,
      type: Es,
      format: $n,
      colorSpace: Si,
      depthBuffer: !1
    }, i = Fa(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Fa(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Uu(r)), this._blurMaterial = Du(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new Pt(this._lodPlanes[0], e);
    this._renderer.compile(t, ss);
  }
  _sceneToCubeUV(e, t, n, i, r) {
    const s = new At(90, 1, t, n), a = [
      1,
      -1,
      1,
      1,
      1,
      1
    ], o = [
      1,
      1,
      1,
      -1,
      -1,
      -1
    ], l = this._renderer, c = l.autoClear, h = l.toneMapping;
    l.getClearColor(Da), l.toneMapping = 0, l.autoClear = !1, l.state.buffers.depth.getReversed() && (l.setRenderTarget(i), l.clearDepth(), l.setRenderTarget(null));
    const u = new go({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), f = new Pt(new ws(), u);
    let p = !1;
    const v = e.background;
    v ? v.isColor && (u.color.copy(v), e.background = null, p = !0) : (u.color.copy(Da), p = !0);
    for (let g = 0; g < 6; g++) {
      const m = g % 3;
      m === 0 ? (s.up.set(0, a[g], 0), s.position.set(r.x, r.y, r.z), s.lookAt(r.x + o[g], r.y, r.z)) : m === 1 ? (s.up.set(0, 0, a[g]), s.position.set(r.x, r.y, r.z), s.lookAt(r.x, r.y + o[g], r.z)) : (s.up.set(0, a[g], 0), s.position.set(r.x, r.y, r.z), s.lookAt(r.x, r.y, r.z + o[g]));
      const d = this._cubeSize;
      lr(i, m * d, g > 2 ? d : 0, d, d), l.setRenderTarget(i), p && l.render(f, s), l.render(e, s);
    }
    f.geometry.dispose(), f.material.dispose(), l.toneMapping = h, l.autoClear = c, e.background = v;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = za()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Ba());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, s = new Pt(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = e;
    const o = this._cubeSize;
    lr(t, 0, 0, 3 * o, 2 * o), n.setRenderTarget(t), n.render(s, ss);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const s = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Na[(i - r - 1) % Na.length];
      this._blur(e, r - 1, r, s, a);
    }
    t.autoClear = n;
  }
  _blur(e, t, n, i, r) {
    const s = this._pingPongRenderTarget;
    this._halfBlur(e, s, t, n, i, "latitudinal", r), this._halfBlur(s, e, n, n, i, "longitudinal", r);
  }
  _halfBlur(e, t, n, i, r, s, a) {
    const o = this._renderer, l = this._blurMaterial;
    s !== "latitudinal" && s !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
    const c = 3, h = new Pt(this._lodPlanes[i], l), u = l.uniforms, f = this._sizeLods[n] - 1, p = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * En - 1), v = r / p, g = isFinite(r) ? 1 + Math.floor(c * v) : En;
    g > En && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${En}`);
    const m = [];
    let d = 0;
    for (let S = 0; S < En; ++S) {
      const L = S / v, A = Math.exp(-L * L / 2);
      m.push(A), S === 0 ? d += A : S < g && (d += 2 * A);
    }
    for (let S = 0; S < m.length; S++) m[S] = m[S] / d;
    u.envMap.value = e.texture, u.samples.value = g, u.weights.value = m, u.latitudinal.value = s === "latitudinal", a && (u.poleAxis.value = a);
    const { _lodMax: T } = this;
    u.dTheta.value = p, u.mipInt.value = T - n;
    const _ = this._sizeLods[i];
    lr(t, 3 * _ * (i > T - Jn ? i - T + Jn : 0), 4 * (this._cubeSize - _), 3 * _, 2 * _), o.setRenderTarget(t), o.render(h, ss);
  }
};
function Uu(e) {
  const t = [], n = [], i = [];
  let r = e;
  const s = e - Jn + 1 + Ua.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    n.push(o);
    let l = 1 / o;
    a > e - Jn ? l = Ua[a - e + Jn - 1] : a === 0 && (l = 0), i.push(l);
    const c = 1 / (o - 2), h = -c, u = 1 + c, f = [
      h,
      h,
      u,
      h,
      u,
      u,
      h,
      h,
      u,
      u,
      h,
      u
    ], p = 6, v = 6, g = 3, m = 2, d = 1, T = new Float32Array(g * v * p), _ = new Float32Array(m * v * p), S = new Float32Array(d * v * p);
    for (let A = 0; A < p; A++) {
      const C = A % 3 * 2 / 3 - 1, U = A > 2 ? 0 : -1, E = [
        C,
        U,
        0,
        C + 2 / 3,
        U,
        0,
        C + 2 / 3,
        U + 1,
        0,
        C,
        U,
        0,
        C + 2 / 3,
        U + 1,
        0,
        C,
        U + 1,
        0
      ];
      T.set(E, g * v * A), _.set(f, m * v * A);
      const M = [
        A,
        A,
        A,
        A,
        A,
        A
      ];
      S.set(M, d * v * A);
    }
    const L = new yt();
    L.setAttribute("position", new It(T, g)), L.setAttribute("uv", new It(_, m)), L.setAttribute("faceIndex", new It(S, d)), t.push(L), r > Jn && r--;
  }
  return {
    lodPlanes: t,
    sizeLods: n,
    sigmas: i
  };
}
function Fa(e, t, n) {
  const i = new wn(e, t, n);
  return i.texture.mapping = 306, i.texture.name = "PMREM.cubeUv", i.scissorTest = !0, i;
}
function lr(e, t, n, i, r) {
  e.viewport.set(t, n, i, r), e.scissor.set(t, n, i, r);
}
function Du(e, t, n) {
  const i = new Float32Array(En), r = new P(0, 1, 0);
  return new hn({
    name: "SphericalGaussianBlur",
    defines: {
      n: En,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / n,
      CUBEUV_MAX_MIP: `${e}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: i },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r }
    },
    vertexShader: Us(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ba() {
  return new hn({
    name: "EquirectangularToCubeUV",
    uniforms: { envMap: { value: null } },
    vertexShader: Us(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function za() {
  return new hn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Us(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Us() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function Nu(e) {
  let t = /* @__PURE__ */ new WeakMap(), n = null;
  function i(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === 303 || l === 304, h = l === 301 || l === 302;
      if (c || h) {
        let u = t.get(o);
        const f = u !== void 0 ? u.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return n === null && (n = new Oa(e)), u = c ? n.fromEquirectangular(o, u) : n.fromCubemap(o, u), u.texture.pmremVersion = o.pmremVersion, t.set(o, u), u.texture;
        if (u !== void 0) return u.texture;
        {
          const p = o.image;
          return c && p && p.height > 0 || h && p && r(p) ? (n === null && (n = new Oa(e)), u = c ? n.fromEquirectangular(o) : n.fromCubemap(o), u.texture.pmremVersion = o.pmremVersion, t.set(o, u), o.addEventListener("dispose", s), u.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++) o[h] !== void 0 && l++;
    return l === c;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener("dispose", s);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function a() {
    t = /* @__PURE__ */ new WeakMap(), n !== null && (n.dispose(), n = null);
  }
  return {
    get: i,
    dispose: a
  };
}
function Ou(e) {
  const t = {};
  function n(i) {
    if (t[i] !== void 0) return t[i];
    let r;
    switch (i) {
      case "WEBGL_depth_texture":
        r = e.getExtension("WEBGL_depth_texture") || e.getExtension("MOZ_WEBGL_depth_texture") || e.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r = e.getExtension("WEBGL_compressed_texture_s3tc") || e.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r = e.getExtension("WEBGL_compressed_texture_pvrtc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = e.getExtension(i);
    }
    return t[i] = r, r;
  }
  return {
    has: function(i) {
      return n(i) !== null;
    },
    init: function() {
      n("EXT_color_buffer_float"), n("WEBGL_clip_cull_distance"), n("OES_texture_float_linear"), n("EXT_color_buffer_half_float"), n("WEBGL_multisampled_render_to_texture"), n("WEBGL_render_shared_exponent");
    },
    get: function(i) {
      const r = n(i);
      return r === null && Ti("THREE.WebGLRenderer: " + i + " extension not supported."), r;
    }
  };
}
function Fu(e, t, n, i) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(u) {
    const f = u.target;
    f.index !== null && t.remove(f.index);
    for (const v in f.attributes) t.remove(f.attributes[v]);
    f.removeEventListener("dispose", a), delete r[f.id];
    const p = s.get(f);
    p && (t.remove(p), s.delete(f)), i.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, n.memory.geometries--;
  }
  function o(u, f) {
    return r[f.id] === !0 || (f.addEventListener("dispose", a), r[f.id] = !0, n.memory.geometries++), f;
  }
  function l(u) {
    const f = u.attributes;
    for (const p in f) t.update(f[p], e.ARRAY_BUFFER);
  }
  function c(u) {
    const f = [], p = u.index, v = u.attributes.position;
    let g = 0;
    if (p !== null) {
      const T = p.array;
      g = p.version;
      for (let _ = 0, S = T.length; _ < S; _ += 3) {
        const L = T[_ + 0], A = T[_ + 1], C = T[_ + 2];
        f.push(L, A, A, C, C, L);
      }
    } else if (v !== void 0) {
      const T = v.array;
      g = v.version;
      for (let _ = 0, S = T.length / 3 - 1; _ < S; _ += 3) {
        const L = _ + 0, A = _ + 1, C = _ + 2;
        f.push(L, A, A, C, C, L);
      }
    } else return;
    const m = new (ho(f) ? _o : vo)(f, 1);
    m.version = g;
    const d = s.get(u);
    d && t.remove(d), s.set(u, m);
  }
  function h(u) {
    const f = s.get(u);
    if (f) {
      const p = u.index;
      p !== null && f.version < p.version && c(u);
    } else c(u);
    return s.get(u);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: h
  };
}
function Bu(e, t, n) {
  let i;
  function r(f) {
    i = f;
  }
  let s, a;
  function o(f) {
    s = f.type, a = f.bytesPerElement;
  }
  function l(f, p) {
    e.drawElements(i, p, s, f * a), n.update(p, i, 1);
  }
  function c(f, p, v) {
    v !== 0 && (e.drawElementsInstanced(i, p, s, f * a, v), n.update(p, i, v));
  }
  function h(f, p, v) {
    if (v === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i, p, 0, s, f, 0, v);
    let g = 0;
    for (let m = 0; m < v; m++) g += p[m];
    n.update(g, i, 1);
  }
  function u(f, p, v, g) {
    if (v === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let d = 0; d < f.length; d++) c(f[d] / a, p[d], g[d]);
    else {
      m.multiDrawElementsInstancedWEBGL(i, p, 0, s, f, 0, g, 0, v);
      let d = 0;
      for (let T = 0; T < v; T++) d += p[T] * g[T];
      n.update(d, i, 1);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function zu(e) {
  const t = {
    geometries: 0,
    textures: 0
  }, n = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function i(s, a, o) {
    switch (n.calls++, a) {
      case e.TRIANGLES:
        n.triangles += o * (s / 3);
        break;
      case e.LINES:
        n.lines += o * (s / 2);
        break;
      case e.LINE_STRIP:
        n.lines += o * (s - 1);
        break;
      case e.LINE_LOOP:
        n.lines += o * s;
        break;
      case e.POINTS:
        n.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    n.calls = 0, n.triangles = 0, n.points = 0, n.lines = 0;
  }
  return {
    memory: t,
    render: n,
    programs: null,
    autoReset: !0,
    reset: r,
    update: i
  };
}
function Vu(e, t, n) {
  const i = /* @__PURE__ */ new WeakMap(), r = new et();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let f = i.get(o);
    if (f === void 0 || f.count !== u) {
      let E = function() {
        C.dispose(), i.delete(o), o.removeEventListener("dispose", E);
      };
      f !== void 0 && f.texture.dispose();
      const p = o.morphAttributes.position !== void 0, v = o.morphAttributes.normal !== void 0, g = o.morphAttributes.color !== void 0, m = o.morphAttributes.position || [], d = o.morphAttributes.normal || [], T = o.morphAttributes.color || [];
      let _ = 0;
      p === !0 && (_ = 1), v === !0 && (_ = 2), g === !0 && (_ = 3);
      let S = o.attributes.position.count * _, L = 1;
      S > t.maxTextureSize && (L = Math.ceil(S / t.maxTextureSize), S = t.maxTextureSize);
      const A = new Float32Array(S * L * 4 * u), C = new fo(A, S, L, u);
      C.type = Ri, C.needsUpdate = !0;
      const U = _ * 4;
      for (let M = 0; M < u; M++) {
        const w = m[M], F = d[M], H = T[M], B = S * L * 4 * M;
        for (let Y = 0; Y < w.count; Y++) {
          const k = Y * U;
          p === !0 && (r.fromBufferAttribute(w, Y), A[B + k + 0] = r.x, A[B + k + 1] = r.y, A[B + k + 2] = r.z, A[B + k + 3] = 0), v === !0 && (r.fromBufferAttribute(F, Y), A[B + k + 4] = r.x, A[B + k + 5] = r.y, A[B + k + 6] = r.z, A[B + k + 7] = 0), g === !0 && (r.fromBufferAttribute(H, Y), A[B + k + 8] = r.x, A[B + k + 9] = r.y, A[B + k + 10] = r.z, A[B + k + 11] = H.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: u,
        texture: C,
        size: new oe(S, L)
      }, i.set(o, f), o.addEventListener("dispose", E);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null) l.getUniforms().setValue(e, "morphTexture", a.morphTexture, n);
    else {
      let p = 0;
      for (let g = 0; g < c.length; g++) p += c[g];
      const v = o.morphTargetsRelative ? 1 : 1 - p;
      l.getUniforms().setValue(e, "morphTargetBaseInfluence", v), l.getUniforms().setValue(e, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(e, "morphTargetsTexture", f.texture, n), l.getUniforms().setValue(e, "morphTargetsTextureSize", f.size);
  }
  return { update: s };
}
function Hu(e, t, n, i) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = i.render.frame, h = l.geometry, u = t.get(l, h);
    if (r.get(u) !== c && (t.update(u), r.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (n.update(l.instanceMatrix, e.ARRAY_BUFFER), l.instanceColor !== null && n.update(l.instanceColor, e.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const f = l.skeleton;
      r.get(f) !== c && (f.update(), r.set(f, c));
    }
    return u;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener("dispose", o), n.remove(c.instanceMatrix), c.instanceColor !== null && n.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
var ol = /* @__PURE__ */ new Ut(), Va = /* @__PURE__ */ new Po(1, 1), ll = /* @__PURE__ */ new fo(), cl = /* @__PURE__ */ new Vc(), hl = /* @__PURE__ */ new Eo(), Ha = [], ka = [], Ga = new Float32Array(16), Wa = new Float32Array(9), Xa = new Float32Array(4);
function si(e, t, n) {
  const i = e[0];
  if (i <= 0 || i > 0) return e;
  const r = t * n;
  let s = Ha[r];
  if (s === void 0 && (s = new Float32Array(r), Ha[r] = s), t !== 0) {
    i.toArray(s, 0);
    for (let a = 1, o = 0; a !== t; ++a)
      o += n, e[a].toArray(s, o);
  }
  return s;
}
function ft(e, t) {
  if (e.length !== t.length) return !1;
  for (let n = 0, i = e.length; n < i; n++) if (e[n] !== t[n]) return !1;
  return !0;
}
function dt(e, t) {
  for (let n = 0, i = t.length; n < i; n++) e[n] = t[n];
}
function Er(e, t) {
  let n = ka[t];
  n === void 0 && (n = new Int32Array(t), ka[t] = n);
  for (let i = 0; i !== t; ++i) n[i] = e.allocateTextureUnit();
  return n;
}
function ku(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1f(this.addr, t), n[0] = t);
}
function Gu(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2f(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ft(n, t)) return;
    e.uniform2fv(this.addr, t), dt(n, t);
  }
}
function Wu(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3f(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else if (t.r !== void 0)
    (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) && (e.uniform3f(this.addr, t.r, t.g, t.b), n[0] = t.r, n[1] = t.g, n[2] = t.b);
  else {
    if (ft(n, t)) return;
    e.uniform3fv(this.addr, t), dt(n, t);
  }
}
function Xu(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4f(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ft(n, t)) return;
    e.uniform4fv(this.addr, t), dt(n, t);
  }
}
function qu(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ft(n, t)) return;
    e.uniformMatrix2fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ft(n, i)) return;
    Xa.set(i), e.uniformMatrix2fv(this.addr, !1, Xa), dt(n, i);
  }
}
function Yu(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ft(n, t)) return;
    e.uniformMatrix3fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ft(n, i)) return;
    Wa.set(i), e.uniformMatrix3fv(this.addr, !1, Wa), dt(n, i);
  }
}
function Ju(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ft(n, t)) return;
    e.uniformMatrix4fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ft(n, i)) return;
    Ga.set(i), e.uniformMatrix4fv(this.addr, !1, Ga), dt(n, i);
  }
}
function Zu(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1i(this.addr, t), n[0] = t);
}
function Ku(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2i(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ft(n, t)) return;
    e.uniform2iv(this.addr, t), dt(n, t);
  }
}
function $u(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3i(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else {
    if (ft(n, t)) return;
    e.uniform3iv(this.addr, t), dt(n, t);
  }
}
function ju(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4i(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ft(n, t)) return;
    e.uniform4iv(this.addr, t), dt(n, t);
  }
}
function Qu(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1ui(this.addr, t), n[0] = t);
}
function ef(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2ui(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ft(n, t)) return;
    e.uniform2uiv(this.addr, t), dt(n, t);
  }
}
function tf(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3ui(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else {
    if (ft(n, t)) return;
    e.uniform3uiv(this.addr, t), dt(n, t);
  }
}
function nf(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ft(n, t)) return;
    e.uniform4uiv(this.addr, t), dt(n, t);
  }
}
function rf(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r);
  let s;
  this.type === e.SAMPLER_2D_SHADOW ? (Va.compareFunction = 515, s = Va) : s = ol, n.setTexture2D(t || s, r);
}
function sf(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTexture3D(t || cl, r);
}
function af(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTextureCube(t || hl, r);
}
function of(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTexture2DArray(t || ll, r);
}
function lf(e) {
  switch (e) {
    case 5126:
      return ku;
    case 35664:
      return Gu;
    case 35665:
      return Wu;
    case 35666:
      return Xu;
    case 35674:
      return qu;
    case 35675:
      return Yu;
    case 35676:
      return Ju;
    case 5124:
    case 35670:
      return Zu;
    case 35667:
    case 35671:
      return Ku;
    case 35668:
    case 35672:
      return $u;
    case 35669:
    case 35673:
      return ju;
    case 5125:
      return Qu;
    case 36294:
      return ef;
    case 36295:
      return tf;
    case 36296:
      return nf;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return rf;
    case 35679:
    case 36299:
    case 36307:
      return sf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return af;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return of;
  }
}
function cf(e, t) {
  e.uniform1fv(this.addr, t);
}
function hf(e, t) {
  const n = si(t, this.size, 2);
  e.uniform2fv(this.addr, n);
}
function uf(e, t) {
  const n = si(t, this.size, 3);
  e.uniform3fv(this.addr, n);
}
function ff(e, t) {
  const n = si(t, this.size, 4);
  e.uniform4fv(this.addr, n);
}
function df(e, t) {
  const n = si(t, this.size, 4);
  e.uniformMatrix2fv(this.addr, !1, n);
}
function pf(e, t) {
  const n = si(t, this.size, 9);
  e.uniformMatrix3fv(this.addr, !1, n);
}
function mf(e, t) {
  const n = si(t, this.size, 16);
  e.uniformMatrix4fv(this.addr, !1, n);
}
function gf(e, t) {
  e.uniform1iv(this.addr, t);
}
function vf(e, t) {
  e.uniform2iv(this.addr, t);
}
function _f(e, t) {
  e.uniform3iv(this.addr, t);
}
function xf(e, t) {
  e.uniform4iv(this.addr, t);
}
function yf(e, t) {
  e.uniform1uiv(this.addr, t);
}
function Mf(e, t) {
  e.uniform2uiv(this.addr, t);
}
function Sf(e, t) {
  e.uniform3uiv(this.addr, t);
}
function Ef(e, t) {
  e.uniform4uiv(this.addr, t);
}
function Tf(e, t, n) {
  const i = this.cache, r = t.length, s = Er(n, r);
  ft(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture2D(t[a] || ol, s[a]);
}
function bf(e, t, n) {
  const i = this.cache, r = t.length, s = Er(n, r);
  ft(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture3D(t[a] || cl, s[a]);
}
function Af(e, t, n) {
  const i = this.cache, r = t.length, s = Er(n, r);
  ft(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTextureCube(t[a] || hl, s[a]);
}
function wf(e, t, n) {
  const i = this.cache, r = t.length, s = Er(n, r);
  ft(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture2DArray(t[a] || ll, s[a]);
}
function Rf(e) {
  switch (e) {
    case 5126:
      return cf;
    case 35664:
      return hf;
    case 35665:
      return uf;
    case 35666:
      return ff;
    case 35674:
      return df;
    case 35675:
      return pf;
    case 35676:
      return mf;
    case 5124:
    case 35670:
      return gf;
    case 35667:
    case 35671:
      return vf;
    case 35668:
    case 35672:
      return _f;
    case 35669:
    case 35673:
      return xf;
    case 5125:
      return yf;
    case 36294:
      return Mf;
    case 36295:
      return Sf;
    case 36296:
      return Ef;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Tf;
    case 35679:
    case 36299:
    case 36307:
      return bf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Af;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return wf;
  }
}
var Cf = class {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = lf(t.type);
  }
}, Pf = class {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Rf(t.type);
  }
}, Lf = class {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const i = this.seq;
    for (let r = 0, s = i.length; r !== s; ++r) {
      const a = i[r];
      a.setValue(e, t[a.id], n);
    }
  }
}, hs = /(\w+)(\])?(\[|\.)?/g;
function qa(e, t) {
  e.seq.push(t), e.map[t.id] = t;
}
function If(e, t, n) {
  const i = e.name, r = i.length;
  for (hs.lastIndex = 0; ; ) {
    const s = hs.exec(i), a = hs.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      qa(n, c === void 0 ? new Cf(o, e, t) : new Pf(o, e, t));
      break;
    } else {
      let h = n.map[o];
      h === void 0 && (h = new Lf(o), qa(n, h)), n = h;
    }
  }
}
var fr = class {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i);
      If(r, e.getUniformLocation(t, r.name), this);
    }
  }
  setValue(e, t, n, i) {
    const r = this.map[t];
    r !== void 0 && r.setValue(e, n, i);
  }
  setOptional(e, t, n) {
    const i = t[n];
    i !== void 0 && this.setValue(e, n, i);
  }
  static upload(e, t, n, i) {
    for (let r = 0, s = t.length; r !== s; ++r) {
      const a = t[r], o = n[a.id];
      o.needsUpdate !== !1 && a.setValue(e, o.value, i);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let i = 0, r = e.length; i !== r; ++i) {
      const s = e[i];
      s.id in t && n.push(s);
    }
    return n;
  }
};
function Ya(e, t, n) {
  const i = e.createShader(t);
  return e.shaderSource(i, n), e.compileShader(i), i;
}
var Uf = 37297, Df = 0;
function Nf(e, t) {
  const n = e.split(`
`), i = [], r = Math.max(t - 6, 0), s = Math.min(t + 6, n.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    i.push(`${o === t ? ">" : " "} ${o}: ${n[a]}`);
  }
  return i.join(`
`);
}
var Ja = /* @__PURE__ */ new Xe();
function Of(e) {
  je._getMatrix(Ja, je.workingColorSpace, e);
  const t = `mat3( ${Ja.elements.map((n) => n.toFixed(4))} )`;
  switch (je.getTransfer(e)) {
    case pr:
      return [t, "LinearTransferOETF"];
    case mr:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", e), [t, "LinearTransferOETF"];
  }
}
function Za(e, t, n) {
  const i = e.getShaderParameter(t, e.COMPILE_STATUS), r = (e.getShaderInfoLog(t) || "").trim();
  if (i && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return n.toUpperCase() + `

` + r + `

` + Nf(e.getShaderSource(t), a);
  } else return r;
}
function Ff(e, t) {
  const n = Of(t);
  return [
    `vec4 ${e}( vec4 value ) {`,
    `	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function Bf(e, t) {
  let n;
  switch (t) {
    case 1:
      n = "Linear";
      break;
    case 2:
      n = "Reinhard";
      break;
    case 3:
      n = "Cineon";
      break;
    case 4:
      n = "ACESFilmic";
      break;
    case 6:
      n = "AgX";
      break;
    case 7:
      n = "Neutral";
      break;
    case 5:
      n = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), n = "Linear";
  }
  return "vec3 " + e + "( vec3 color ) { return " + n + "ToneMapping( color ); }";
}
var cr = /* @__PURE__ */ new P();
function zf() {
  return je.getLuminanceCoefficients(cr), [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${cr.x.toFixed(4)}, ${cr.y.toFixed(4)}, ${cr.z.toFixed(4)} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function Vf(e) {
  return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(vi).join(`
`);
}
function Hf(e) {
  const t = [];
  for (const n in e) {
    const i = e[n];
    i !== !1 && t.push("#define " + n + " " + i);
  }
  return t.join(`
`);
}
function kf(e, t) {
  const n = {}, i = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < i; r++) {
    const s = e.getActiveAttrib(t, r), a = s.name;
    let o = 1;
    s.type === e.FLOAT_MAT2 && (o = 2), s.type === e.FLOAT_MAT3 && (o = 3), s.type === e.FLOAT_MAT4 && (o = 4), n[a] = {
      type: s.type,
      location: e.getAttribLocation(t, a),
      locationSize: o
    };
  }
  return n;
}
function vi(e) {
  return e !== "";
}
function Ka(e, t) {
  const n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return e.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, n).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function $a(e, t) {
  return e.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var Gf = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ys(e) {
  return e.replace(Gf, Xf);
}
var Wf = /* @__PURE__ */ new Map();
function Xf(e, t) {
  let n = He[t];
  if (n === void 0) {
    const i = Wf.get(t);
    if (i !== void 0)
      n = He[i], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, i);
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return ys(n);
}
var qf = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function ja(e) {
  return e.replace(qf, Yf);
}
function Yf(e, t, n, i) {
  let r = "";
  for (let s = parseInt(t); s < parseInt(n); s++) r += i.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Qa(e) {
  let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
  return e.precision === "highp" ? t += `
#define HIGH_PRECISION` : e.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : e.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
}
function Jf(e) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return e.shadowMapType === 1 ? t = "SHADOWMAP_TYPE_PCF" : e.shadowMapType === 2 ? t = "SHADOWMAP_TYPE_PCF_SOFT" : e.shadowMapType === 3 && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function Zf(e) {
  let t = "ENVMAP_TYPE_CUBE";
  if (e.envMap) switch (e.envMapMode) {
    case 301:
    case 302:
      t = "ENVMAP_TYPE_CUBE";
      break;
    case 306:
      t = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return t;
}
function Kf(e) {
  let t = "ENVMAP_MODE_REFLECTION";
  return e.envMap && e.envMapMode === 302 && (t = "ENVMAP_MODE_REFRACTION"), t;
}
function $f(e) {
  let t = "ENVMAP_BLENDING_NONE";
  if (e.envMap) switch (e.combine) {
    case 0:
      t = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case 1:
      t = "ENVMAP_BLENDING_MIX";
      break;
    case 2:
      t = "ENVMAP_BLENDING_ADD";
      break;
  }
  return t;
}
function jf(e) {
  const t = e.envMapCubeUVHeight;
  if (t === null) return null;
  const n = Math.log2(t) - 2, i = 1 / t;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, n), 112)),
    texelHeight: i,
    maxMip: n
  };
}
function Qf(e, t, n, i) {
  const r = e.getContext(), s = n.defines;
  let a = n.vertexShader, o = n.fragmentShader;
  const l = Jf(n), c = Zf(n), h = Kf(n), u = $f(n), f = jf(n), p = Vf(n), v = Hf(s), g = r.createProgram();
  let m, d, T = n.glslVersion ? "#version " + n.glslVersion + `
` : "";
  n.isRawShaderMaterial ? (m = [
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    v
  ].filter(vi).join(`
`), m.length > 0 && (m += `
`), d = [
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    v
  ].filter(vi).join(`
`), d.length > 0 && (d += `
`)) : (m = [
    Qa(n),
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    v,
    n.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    n.batching ? "#define USE_BATCHING" : "",
    n.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    n.instancing ? "#define USE_INSTANCING" : "",
    n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    n.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    n.useFog && n.fog ? "#define USE_FOG" : "",
    n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
    n.map ? "#define USE_MAP" : "",
    n.envMap ? "#define USE_ENVMAP" : "",
    n.envMap ? "#define " + h : "",
    n.lightMap ? "#define USE_LIGHTMAP" : "",
    n.aoMap ? "#define USE_AOMAP" : "",
    n.bumpMap ? "#define USE_BUMPMAP" : "",
    n.normalMap ? "#define USE_NORMALMAP" : "",
    n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    n.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    n.anisotropy ? "#define USE_ANISOTROPY" : "",
    n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    n.specularMap ? "#define USE_SPECULARMAP" : "",
    n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    n.metalnessMap ? "#define USE_METALNESSMAP" : "",
    n.alphaMap ? "#define USE_ALPHAMAP" : "",
    n.alphaHash ? "#define USE_ALPHAHASH" : "",
    n.transmission ? "#define USE_TRANSMISSION" : "",
    n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    n.mapUv ? "#define MAP_UV " + n.mapUv : "",
    n.alphaMapUv ? "#define ALPHAMAP_UV " + n.alphaMapUv : "",
    n.lightMapUv ? "#define LIGHTMAP_UV " + n.lightMapUv : "",
    n.aoMapUv ? "#define AOMAP_UV " + n.aoMapUv : "",
    n.emissiveMapUv ? "#define EMISSIVEMAP_UV " + n.emissiveMapUv : "",
    n.bumpMapUv ? "#define BUMPMAP_UV " + n.bumpMapUv : "",
    n.normalMapUv ? "#define NORMALMAP_UV " + n.normalMapUv : "",
    n.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + n.displacementMapUv : "",
    n.metalnessMapUv ? "#define METALNESSMAP_UV " + n.metalnessMapUv : "",
    n.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + n.roughnessMapUv : "",
    n.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + n.anisotropyMapUv : "",
    n.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + n.clearcoatMapUv : "",
    n.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + n.clearcoatNormalMapUv : "",
    n.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + n.clearcoatRoughnessMapUv : "",
    n.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + n.iridescenceMapUv : "",
    n.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + n.iridescenceThicknessMapUv : "",
    n.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + n.sheenColorMapUv : "",
    n.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + n.sheenRoughnessMapUv : "",
    n.specularMapUv ? "#define SPECULARMAP_UV " + n.specularMapUv : "",
    n.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + n.specularColorMapUv : "",
    n.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + n.specularIntensityMapUv : "",
    n.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + n.transmissionMapUv : "",
    n.thicknessMapUv ? "#define THICKNESSMAP_UV " + n.thicknessMapUv : "",
    n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
    n.vertexColors ? "#define USE_COLOR" : "",
    n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    n.vertexUv1s ? "#define USE_UV1" : "",
    n.vertexUv2s ? "#define USE_UV2" : "",
    n.vertexUv3s ? "#define USE_UV3" : "",
    n.pointsUvs ? "#define USE_POINTS_UV" : "",
    n.flatShading ? "#define FLAT_SHADED" : "",
    n.skinning ? "#define USE_SKINNING" : "",
    n.morphTargets ? "#define USE_MORPHTARGETS" : "",
    n.morphNormals && n.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    n.morphColors ? "#define USE_MORPHCOLORS" : "",
    n.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + n.morphTextureStride : "",
    n.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount : "",
    n.doubleSided ? "#define DOUBLE_SIDED" : "",
    n.flipSided ? "#define FLIP_SIDED" : "",
    n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    n.shadowMapEnabled ? "#define " + l : "",
    n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(vi).join(`
`), d = [
    Qa(n),
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    v,
    n.useFog && n.fog ? "#define USE_FOG" : "",
    n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
    n.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    n.map ? "#define USE_MAP" : "",
    n.matcap ? "#define USE_MATCAP" : "",
    n.envMap ? "#define USE_ENVMAP" : "",
    n.envMap ? "#define " + c : "",
    n.envMap ? "#define " + h : "",
    n.envMap ? "#define " + u : "",
    f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
    f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
    f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
    n.lightMap ? "#define USE_LIGHTMAP" : "",
    n.aoMap ? "#define USE_AOMAP" : "",
    n.bumpMap ? "#define USE_BUMPMAP" : "",
    n.normalMap ? "#define USE_NORMALMAP" : "",
    n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    n.anisotropy ? "#define USE_ANISOTROPY" : "",
    n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    n.clearcoat ? "#define USE_CLEARCOAT" : "",
    n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    n.dispersion ? "#define USE_DISPERSION" : "",
    n.iridescence ? "#define USE_IRIDESCENCE" : "",
    n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    n.specularMap ? "#define USE_SPECULARMAP" : "",
    n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    n.metalnessMap ? "#define USE_METALNESSMAP" : "",
    n.alphaMap ? "#define USE_ALPHAMAP" : "",
    n.alphaTest ? "#define USE_ALPHATEST" : "",
    n.alphaHash ? "#define USE_ALPHAHASH" : "",
    n.sheen ? "#define USE_SHEEN" : "",
    n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    n.transmission ? "#define USE_TRANSMISSION" : "",
    n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
    n.vertexColors || n.instancingColor || n.batchingColor ? "#define USE_COLOR" : "",
    n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    n.vertexUv1s ? "#define USE_UV1" : "",
    n.vertexUv2s ? "#define USE_UV2" : "",
    n.vertexUv3s ? "#define USE_UV3" : "",
    n.pointsUvs ? "#define USE_POINTS_UV" : "",
    n.gradientMap ? "#define USE_GRADIENTMAP" : "",
    n.flatShading ? "#define FLAT_SHADED" : "",
    n.doubleSided ? "#define DOUBLE_SIDED" : "",
    n.flipSided ? "#define FLIP_SIDED" : "",
    n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    n.shadowMapEnabled ? "#define " + l : "",
    n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    n.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    n.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
    n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    n.toneMapping !== 0 ? "#define TONE_MAPPING" : "",
    n.toneMapping !== 0 ? He.tonemapping_pars_fragment : "",
    n.toneMapping !== 0 ? Bf("toneMapping", n.toneMapping) : "",
    n.dithering ? "#define DITHERING" : "",
    n.opaque ? "#define OPAQUE" : "",
    He.colorspace_pars_fragment,
    Ff("linearToOutputTexel", n.outputColorSpace),
    zf(),
    n.useDepthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
    `
`
  ].filter(vi).join(`
`)), a = ys(a), a = Ka(a, n), a = $a(a, n), o = ys(o), o = Ka(o, n), o = $a(o, n), a = ja(a), o = ja(o), n.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, m = [
    p,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + m, d = [
    "#define varying in",
    n.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    n.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + d);
  const _ = T + m + a, S = T + d + o, L = Ya(r, r.VERTEX_SHADER, _), A = Ya(r, r.FRAGMENT_SHADER, S);
  r.attachShader(g, L), r.attachShader(g, A), n.index0AttributeName !== void 0 ? r.bindAttribLocation(g, 0, n.index0AttributeName) : n.morphTargets === !0 && r.bindAttribLocation(g, 0, "position"), r.linkProgram(g);
  function C(w) {
    if (e.debug.checkShaderErrors) {
      const F = r.getProgramInfoLog(g) || "", H = r.getShaderInfoLog(L) || "", B = r.getShaderInfoLog(A) || "", Y = F.trim(), k = H.trim(), ee = B.trim();
      let W = !0, se = !0;
      if (r.getProgramParameter(g, r.LINK_STATUS) === !1)
        if (W = !1, typeof e.debug.onShaderError == "function") e.debug.onShaderError(r, g, L, A);
        else {
          const pe = Za(r, L, "vertex"), De = Za(r, A, "fragment");
          console.error("THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(g, r.VALIDATE_STATUS) + `

Material Name: ` + w.name + `
Material Type: ` + w.type + `

Program Info Log: ` + Y + `
` + pe + `
` + De);
        }
      else Y !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", Y) : (k === "" || ee === "") && (se = !1);
      se && (w.diagnostics = {
        runnable: W,
        programLog: Y,
        vertexShader: {
          log: k,
          prefix: m
        },
        fragmentShader: {
          log: ee,
          prefix: d
        }
      });
    }
    r.deleteShader(L), r.deleteShader(A), U = new fr(r, g), E = kf(r, g);
  }
  let U;
  this.getUniforms = function() {
    return U === void 0 && C(this), U;
  };
  let E;
  this.getAttributes = function() {
    return E === void 0 && C(this), E;
  };
  let M = n.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return M === !1 && (M = r.getProgramParameter(g, Uf)), M;
  }, this.destroy = function() {
    i.releaseStatesOfProgram(this), r.deleteProgram(g), this.program = void 0;
  }, this.type = n.shaderType, this.name = n.shaderName, this.id = Df++, this.cacheKey = t, this.usedTimes = 1, this.program = g, this.vertexShader = L, this.fragmentShader = A, this;
}
var ed = 0, td = class {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, i = this._getShaderStage(t), r = this._getShaderStage(n), s = this._getShaderCacheForMaterial(e);
    return s.has(i) === !1 && (s.add(i), i.usedTimes++), s.has(r) === !1 && (s.add(r), r.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new nd(e), t.set(e, n)), n;
  }
}, nd = class {
  constructor(e) {
    this.id = ed++, this.code = e, this.usedTimes = 0;
  }
};
function id(e, t, n, i, r, s, a) {
  const o = new As(), l = new td(), c = /* @__PURE__ */ new Set(), h = [], u = r.logarithmicDepthBuffer, f = r.vertexTextures;
  let p = r.precision;
  const v = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function g(E) {
    return c.add(E), E === 0 ? "uv" : `uv${E}`;
  }
  function m(E, M, w, F, H) {
    const B = F.fog, Y = H.geometry, k = E.isMeshStandardMaterial ? F.environment : null, ee = (E.isMeshStandardMaterial ? n : t).get(E.envMap || k), W = ee && ee.mapping === 306 ? ee.image.height : null, se = v[E.type];
    E.precision !== null && (p = r.getMaxPrecision(E.precision), p !== E.precision && console.warn("THREE.WebGLProgram.getParameters:", E.precision, "not supported, using", p, "instead."));
    const pe = Y.morphAttributes.position || Y.morphAttributes.normal || Y.morphAttributes.color, De = pe !== void 0 ? pe.length : 0;
    let Fe = 0;
    Y.morphAttributes.position !== void 0 && (Fe = 1), Y.morphAttributes.normal !== void 0 && (Fe = 2), Y.morphAttributes.color !== void 0 && (Fe = 3);
    let nt, Ze, q, he;
    if (se) {
      const tt = Xt[se];
      nt = tt.vertexShader, Ze = tt.fragmentShader;
    } else
      nt = E.vertexShader, Ze = E.fragmentShader, l.update(E), q = l.getVertexShaderID(E), he = l.getFragmentShaderID(E);
    const fe = e.getRenderTarget(), ye = e.state.buffers.depth.getReversed(), Ie = H.isInstancedMesh === !0, Ee = H.isBatchedMesh === !0, qe = !!E.map, R = !!E.matcap, J = !!ee, $ = !!E.aoMap, te = !!E.lightMap, Z = !!E.bumpMap, ue = !!E.normalMap, ae = !!E.displacementMap, ie = !!E.emissiveMap, Be = !!E.metalnessMap, ze = !!E.roughnessMap, Ge = E.anisotropy > 0, b = E.clearcoat > 0, x = E.dispersion > 0, N = E.iridescence > 0, X = E.sheen > 0, j = E.transmission > 0, G = Ge && !!E.anisotropyMap, xe = b && !!E.clearcoatMap, le = b && !!E.clearcoatNormalMap, Te = b && !!E.clearcoatRoughnessMap, Pe = N && !!E.iridescenceMap, re = N && !!E.iridescenceThicknessMap, ge = X && !!E.sheenColorMap, Re = X && !!E.sheenRoughnessMap, Ce = !!E.specularMap, ve = !!E.specularColorMap, We = !!E.specularIntensityMap, I = j && !!E.transmissionMap, me = j && !!E.thicknessMap, ce = !!E.gradientMap, Ae = !!E.alphaMap, ne = E.alphaTest > 0, K = !!E.alphaHash, be = !!E.extensions;
    let Le = 0;
    E.toneMapped && (fe === null || fe.isXRRenderTarget === !0) && (Le = e.toneMapping);
    const ht = {
      shaderID: se,
      shaderType: E.type,
      shaderName: E.name,
      vertexShader: nt,
      fragmentShader: Ze,
      defines: E.defines,
      customVertexShaderID: q,
      customFragmentShaderID: he,
      isRawShaderMaterial: E.isRawShaderMaterial === !0,
      glslVersion: E.glslVersion,
      precision: p,
      batching: Ee,
      batchingColor: Ee && H._colorsTexture !== null,
      instancing: Ie,
      instancingColor: Ie && H.instanceColor !== null,
      instancingMorph: Ie && H.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: fe === null ? e.outputColorSpace : fe.isXRRenderTarget === !0 ? fe.texture.colorSpace : Si,
      alphaToCoverage: !!E.alphaToCoverage,
      map: qe,
      matcap: R,
      envMap: J,
      envMapMode: J && ee.mapping,
      envMapCubeUVHeight: W,
      aoMap: $,
      lightMap: te,
      bumpMap: Z,
      normalMap: ue,
      displacementMap: f && ae,
      emissiveMap: ie,
      normalMapObjectSpace: ue && E.normalMapType === 1,
      normalMapTangentSpace: ue && E.normalMapType === 0,
      metalnessMap: Be,
      roughnessMap: ze,
      anisotropy: Ge,
      anisotropyMap: G,
      clearcoat: b,
      clearcoatMap: xe,
      clearcoatNormalMap: le,
      clearcoatRoughnessMap: Te,
      dispersion: x,
      iridescence: N,
      iridescenceMap: Pe,
      iridescenceThicknessMap: re,
      sheen: X,
      sheenColorMap: ge,
      sheenRoughnessMap: Re,
      specularMap: Ce,
      specularColorMap: ve,
      specularIntensityMap: We,
      transmission: j,
      transmissionMap: I,
      thicknessMap: me,
      gradientMap: ce,
      opaque: E.transparent === !1 && E.blending === 1 && E.alphaToCoverage === !1,
      alphaMap: Ae,
      alphaTest: ne,
      alphaHash: K,
      combine: E.combine,
      mapUv: qe && g(E.map.channel),
      aoMapUv: $ && g(E.aoMap.channel),
      lightMapUv: te && g(E.lightMap.channel),
      bumpMapUv: Z && g(E.bumpMap.channel),
      normalMapUv: ue && g(E.normalMap.channel),
      displacementMapUv: ae && g(E.displacementMap.channel),
      emissiveMapUv: ie && g(E.emissiveMap.channel),
      metalnessMapUv: Be && g(E.metalnessMap.channel),
      roughnessMapUv: ze && g(E.roughnessMap.channel),
      anisotropyMapUv: G && g(E.anisotropyMap.channel),
      clearcoatMapUv: xe && g(E.clearcoatMap.channel),
      clearcoatNormalMapUv: le && g(E.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Te && g(E.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Pe && g(E.iridescenceMap.channel),
      iridescenceThicknessMapUv: re && g(E.iridescenceThicknessMap.channel),
      sheenColorMapUv: ge && g(E.sheenColorMap.channel),
      sheenRoughnessMapUv: Re && g(E.sheenRoughnessMap.channel),
      specularMapUv: Ce && g(E.specularMap.channel),
      specularColorMapUv: ve && g(E.specularColorMap.channel),
      specularIntensityMapUv: We && g(E.specularIntensityMap.channel),
      transmissionMapUv: I && g(E.transmissionMap.channel),
      thicknessMapUv: me && g(E.thicknessMap.channel),
      alphaMapUv: Ae && g(E.alphaMap.channel),
      vertexTangents: !!Y.attributes.tangent && (ue || Ge),
      vertexColors: E.vertexColors,
      vertexAlphas: E.vertexColors === !0 && !!Y.attributes.color && Y.attributes.color.itemSize === 4,
      pointsUvs: H.isPoints === !0 && !!Y.attributes.uv && (qe || Ae),
      fog: !!B,
      useFog: E.fog === !0,
      fogExp2: !!B && B.isFogExp2,
      flatShading: E.flatShading === !0 && E.wireframe === !1,
      sizeAttenuation: E.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reversedDepthBuffer: ye,
      skinning: H.isSkinnedMesh === !0,
      morphTargets: Y.morphAttributes.position !== void 0,
      morphNormals: Y.morphAttributes.normal !== void 0,
      morphColors: Y.morphAttributes.color !== void 0,
      morphTargetsCount: De,
      morphTextureStride: Fe,
      numDirLights: M.directional.length,
      numPointLights: M.point.length,
      numSpotLights: M.spot.length,
      numSpotLightMaps: M.spotLightMap.length,
      numRectAreaLights: M.rectArea.length,
      numHemiLights: M.hemi.length,
      numDirLightShadows: M.directionalShadowMap.length,
      numPointLightShadows: M.pointShadowMap.length,
      numSpotLightShadows: M.spotShadowMap.length,
      numSpotLightShadowsWithMaps: M.numSpotLightShadowsWithMaps,
      numLightProbes: M.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: E.dithering,
      shadowMapEnabled: e.shadowMap.enabled && w.length > 0,
      shadowMapType: e.shadowMap.type,
      toneMapping: Le,
      decodeVideoTexture: qe && E.map.isVideoTexture === !0 && je.getTransfer(E.map.colorSpace) === "srgb",
      decodeVideoTextureEmissive: ie && E.emissiveMap.isVideoTexture === !0 && je.getTransfer(E.emissiveMap.colorSpace) === "srgb",
      premultipliedAlpha: E.premultipliedAlpha,
      doubleSided: E.side === 2,
      flipSided: E.side === 1,
      useDepthPacking: E.depthPacking >= 0,
      depthPacking: E.depthPacking || 0,
      index0AttributeName: E.index0AttributeName,
      extensionClipCullDistance: be && E.extensions.clipCullDistance === !0 && i.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (be && E.extensions.multiDraw === !0 || Ee) && i.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: i.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: E.customProgramCacheKey()
    };
    return ht.vertexUv1s = c.has(1), ht.vertexUv2s = c.has(2), ht.vertexUv3s = c.has(3), c.clear(), ht;
  }
  function d(E) {
    const M = [];
    if (E.shaderID ? M.push(E.shaderID) : (M.push(E.customVertexShaderID), M.push(E.customFragmentShaderID)), E.defines !== void 0) for (const w in E.defines)
      M.push(w), M.push(E.defines[w]);
    return E.isRawShaderMaterial === !1 && (T(M, E), _(M, E), M.push(e.outputColorSpace)), M.push(E.customProgramCacheKey), M.join();
  }
  function T(E, M) {
    E.push(M.precision), E.push(M.outputColorSpace), E.push(M.envMapMode), E.push(M.envMapCubeUVHeight), E.push(M.mapUv), E.push(M.alphaMapUv), E.push(M.lightMapUv), E.push(M.aoMapUv), E.push(M.bumpMapUv), E.push(M.normalMapUv), E.push(M.displacementMapUv), E.push(M.emissiveMapUv), E.push(M.metalnessMapUv), E.push(M.roughnessMapUv), E.push(M.anisotropyMapUv), E.push(M.clearcoatMapUv), E.push(M.clearcoatNormalMapUv), E.push(M.clearcoatRoughnessMapUv), E.push(M.iridescenceMapUv), E.push(M.iridescenceThicknessMapUv), E.push(M.sheenColorMapUv), E.push(M.sheenRoughnessMapUv), E.push(M.specularMapUv), E.push(M.specularColorMapUv), E.push(M.specularIntensityMapUv), E.push(M.transmissionMapUv), E.push(M.thicknessMapUv), E.push(M.combine), E.push(M.fogExp2), E.push(M.sizeAttenuation), E.push(M.morphTargetsCount), E.push(M.morphAttributeCount), E.push(M.numDirLights), E.push(M.numPointLights), E.push(M.numSpotLights), E.push(M.numSpotLightMaps), E.push(M.numHemiLights), E.push(M.numRectAreaLights), E.push(M.numDirLightShadows), E.push(M.numPointLightShadows), E.push(M.numSpotLightShadows), E.push(M.numSpotLightShadowsWithMaps), E.push(M.numLightProbes), E.push(M.shadowMapType), E.push(M.toneMapping), E.push(M.numClippingPlanes), E.push(M.numClipIntersection), E.push(M.depthPacking);
  }
  function _(E, M) {
    o.disableAll(), M.supportsVertexTextures && o.enable(0), M.instancing && o.enable(1), M.instancingColor && o.enable(2), M.instancingMorph && o.enable(3), M.matcap && o.enable(4), M.envMap && o.enable(5), M.normalMapObjectSpace && o.enable(6), M.normalMapTangentSpace && o.enable(7), M.clearcoat && o.enable(8), M.iridescence && o.enable(9), M.alphaTest && o.enable(10), M.vertexColors && o.enable(11), M.vertexAlphas && o.enable(12), M.vertexUv1s && o.enable(13), M.vertexUv2s && o.enable(14), M.vertexUv3s && o.enable(15), M.vertexTangents && o.enable(16), M.anisotropy && o.enable(17), M.alphaHash && o.enable(18), M.batching && o.enable(19), M.dispersion && o.enable(20), M.batchingColor && o.enable(21), M.gradientMap && o.enable(22), E.push(o.mask), o.disableAll(), M.fog && o.enable(0), M.useFog && o.enable(1), M.flatShading && o.enable(2), M.logarithmicDepthBuffer && o.enable(3), M.reversedDepthBuffer && o.enable(4), M.skinning && o.enable(5), M.morphTargets && o.enable(6), M.morphNormals && o.enable(7), M.morphColors && o.enable(8), M.premultipliedAlpha && o.enable(9), M.shadowMapEnabled && o.enable(10), M.doubleSided && o.enable(11), M.flipSided && o.enable(12), M.useDepthPacking && o.enable(13), M.dithering && o.enable(14), M.transmission && o.enable(15), M.sheen && o.enable(16), M.opaque && o.enable(17), M.pointsUvs && o.enable(18), M.decodeVideoTexture && o.enable(19), M.decodeVideoTextureEmissive && o.enable(20), M.alphaToCoverage && o.enable(21), E.push(o.mask);
  }
  function S(E) {
    const M = v[E.type];
    let w;
    if (M) {
      const F = Xt[M];
      w = Qc.clone(F.uniforms);
    } else w = E.uniforms;
    return w;
  }
  function L(E, M) {
    let w;
    for (let F = 0, H = h.length; F < H; F++) {
      const B = h[F];
      if (B.cacheKey === M) {
        w = B, ++w.usedTimes;
        break;
      }
    }
    return w === void 0 && (w = new Qf(e, M, E, s), h.push(w)), w;
  }
  function A(E) {
    if (--E.usedTimes === 0) {
      const M = h.indexOf(E);
      h[M] = h[h.length - 1], h.pop(), E.destroy();
    }
  }
  function C(E) {
    l.remove(E);
  }
  function U() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: d,
    getUniforms: S,
    acquireProgram: L,
    releaseProgram: A,
    releaseShaderCache: C,
    programs: h,
    dispose: U
  };
}
function rd() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a) {
    return e.has(a);
  }
  function n(a) {
    let o = e.get(a);
    return o === void 0 && (o = {}, e.set(a, o)), o;
  }
  function i(a) {
    e.delete(a);
  }
  function r(a, o, l) {
    e.get(a)[o] = l;
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: t,
    get: n,
    remove: i,
    update: r,
    dispose: s
  };
}
function sd(e, t) {
  return e.groupOrder !== t.groupOrder ? e.groupOrder - t.groupOrder : e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.material.id !== t.material.id ? e.material.id - t.material.id : e.z !== t.z ? e.z - t.z : e.id - t.id;
}
function eo(e, t) {
  return e.groupOrder !== t.groupOrder ? e.groupOrder - t.groupOrder : e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.z !== t.z ? t.z - e.z : e.id - t.id;
}
function to() {
  const e = [];
  let t = 0;
  const n = [], i = [], r = [];
  function s() {
    t = 0, n.length = 0, i.length = 0, r.length = 0;
  }
  function a(u, f, p, v, g, m) {
    let d = e[t];
    return d === void 0 ? (d = {
      id: u.id,
      object: u,
      geometry: f,
      material: p,
      groupOrder: v,
      renderOrder: u.renderOrder,
      z: g,
      group: m
    }, e[t] = d) : (d.id = u.id, d.object = u, d.geometry = f, d.material = p, d.groupOrder = v, d.renderOrder = u.renderOrder, d.z = g, d.group = m), t++, d;
  }
  function o(u, f, p, v, g, m) {
    const d = a(u, f, p, v, g, m);
    p.transmission > 0 ? i.push(d) : p.transparent === !0 ? r.push(d) : n.push(d);
  }
  function l(u, f, p, v, g, m) {
    const d = a(u, f, p, v, g, m);
    p.transmission > 0 ? i.unshift(d) : p.transparent === !0 ? r.unshift(d) : n.unshift(d);
  }
  function c(u, f) {
    n.length > 1 && n.sort(u || sd), i.length > 1 && i.sort(f || eo), r.length > 1 && r.sort(f || eo);
  }
  function h() {
    for (let u = t, f = e.length; u < f; u++) {
      const p = e[u];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return {
    opaque: n,
    transmissive: i,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: h,
    sort: c
  };
}
function ad() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r) {
    const s = e.get(i);
    let a;
    return s === void 0 ? (a = new to(), e.set(i, [a])) : r >= s.length ? (a = new to(), s.push(a)) : a = s[r], a;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
function od() {
  const e = {};
  return { get: function(t) {
    if (e[t.id] !== void 0) return e[t.id];
    let n;
    switch (t.type) {
      case "DirectionalLight":
        n = {
          direction: new P(),
          color: new ke()
        };
        break;
      case "SpotLight":
        n = {
          position: new P(),
          direction: new P(),
          color: new ke(),
          distance: 0,
          coneCos: 0,
          penumbraCos: 0,
          decay: 0
        };
        break;
      case "PointLight":
        n = {
          position: new P(),
          color: new ke(),
          distance: 0,
          decay: 0
        };
        break;
      case "HemisphereLight":
        n = {
          direction: new P(),
          skyColor: new ke(),
          groundColor: new ke()
        };
        break;
      case "RectAreaLight":
        n = {
          color: new ke(),
          position: new P(),
          halfWidth: new P(),
          halfHeight: new P()
        };
        break;
    }
    return e[t.id] = n, n;
  } };
}
function ld() {
  const e = {};
  return { get: function(t) {
    if (e[t.id] !== void 0) return e[t.id];
    let n;
    switch (t.type) {
      case "DirectionalLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new oe()
        };
        break;
      case "SpotLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new oe()
        };
        break;
      case "PointLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new oe(),
          shadowCameraNear: 1,
          shadowCameraFar: 1e3
        };
        break;
    }
    return e[t.id] = n, n;
  } };
}
var cd = 0;
function hd(e, t) {
  return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (e.map ? 1 : 0);
}
function ud(e) {
  const t = new od(), n = ld(), i = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [
      0,
      0,
      0
    ],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++) i.probe.push(new P());
  const r = new P(), s = new Ye(), a = new Ye();
  function o(c) {
    let h = 0, u = 0, f = 0;
    for (let E = 0; E < 9; E++) i.probe[E].set(0, 0, 0);
    let p = 0, v = 0, g = 0, m = 0, d = 0, T = 0, _ = 0, S = 0, L = 0, A = 0, C = 0;
    c.sort(hd);
    for (let E = 0, M = c.length; E < M; E++) {
      const w = c[E], F = w.color, H = w.intensity, B = w.distance, Y = w.shadow && w.shadow.map ? w.shadow.map.texture : null;
      if (w.isAmbientLight)
        h += F.r * H, u += F.g * H, f += F.b * H;
      else if (w.isLightProbe) {
        for (let k = 0; k < 9; k++) i.probe[k].addScaledVector(w.sh.coefficients[k], H);
        C++;
      } else if (w.isDirectionalLight) {
        const k = t.get(w);
        if (k.color.copy(w.color).multiplyScalar(w.intensity), w.castShadow) {
          const ee = w.shadow, W = n.get(w);
          W.shadowIntensity = ee.intensity, W.shadowBias = ee.bias, W.shadowNormalBias = ee.normalBias, W.shadowRadius = ee.radius, W.shadowMapSize = ee.mapSize, i.directionalShadow[p] = W, i.directionalShadowMap[p] = Y, i.directionalShadowMatrix[p] = w.shadow.matrix, T++;
        }
        i.directional[p] = k, p++;
      } else if (w.isSpotLight) {
        const k = t.get(w);
        k.position.setFromMatrixPosition(w.matrixWorld), k.color.copy(F).multiplyScalar(H), k.distance = B, k.coneCos = Math.cos(w.angle), k.penumbraCos = Math.cos(w.angle * (1 - w.penumbra)), k.decay = w.decay, i.spot[g] = k;
        const ee = w.shadow;
        if (w.map && (i.spotLightMap[L] = w.map, L++, ee.updateMatrices(w), w.castShadow && A++), i.spotLightMatrix[g] = ee.matrix, w.castShadow) {
          const W = n.get(w);
          W.shadowIntensity = ee.intensity, W.shadowBias = ee.bias, W.shadowNormalBias = ee.normalBias, W.shadowRadius = ee.radius, W.shadowMapSize = ee.mapSize, i.spotShadow[g] = W, i.spotShadowMap[g] = Y, S++;
        }
        g++;
      } else if (w.isRectAreaLight) {
        const k = t.get(w);
        k.color.copy(F).multiplyScalar(H), k.halfWidth.set(w.width * 0.5, 0, 0), k.halfHeight.set(0, w.height * 0.5, 0), i.rectArea[m] = k, m++;
      } else if (w.isPointLight) {
        const k = t.get(w);
        if (k.color.copy(w.color).multiplyScalar(w.intensity), k.distance = w.distance, k.decay = w.decay, w.castShadow) {
          const ee = w.shadow, W = n.get(w);
          W.shadowIntensity = ee.intensity, W.shadowBias = ee.bias, W.shadowNormalBias = ee.normalBias, W.shadowRadius = ee.radius, W.shadowMapSize = ee.mapSize, W.shadowCameraNear = ee.camera.near, W.shadowCameraFar = ee.camera.far, i.pointShadow[v] = W, i.pointShadowMap[v] = Y, i.pointShadowMatrix[v] = w.shadow.matrix, _++;
        }
        i.point[v] = k, v++;
      } else if (w.isHemisphereLight) {
        const k = t.get(w);
        k.skyColor.copy(w.color).multiplyScalar(H), k.groundColor.copy(w.groundColor).multiplyScalar(H), i.hemi[d] = k, d++;
      }
    }
    m > 0 && (e.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = de.LTC_FLOAT_1, i.rectAreaLTC2 = de.LTC_FLOAT_2) : (i.rectAreaLTC1 = de.LTC_HALF_1, i.rectAreaLTC2 = de.LTC_HALF_2)), i.ambient[0] = h, i.ambient[1] = u, i.ambient[2] = f;
    const U = i.hash;
    (U.directionalLength !== p || U.pointLength !== v || U.spotLength !== g || U.rectAreaLength !== m || U.hemiLength !== d || U.numDirectionalShadows !== T || U.numPointShadows !== _ || U.numSpotShadows !== S || U.numSpotMaps !== L || U.numLightProbes !== C) && (i.directional.length = p, i.spot.length = g, i.rectArea.length = m, i.point.length = v, i.hemi.length = d, i.directionalShadow.length = T, i.directionalShadowMap.length = T, i.pointShadow.length = _, i.pointShadowMap.length = _, i.spotShadow.length = S, i.spotShadowMap.length = S, i.directionalShadowMatrix.length = T, i.pointShadowMatrix.length = _, i.spotLightMatrix.length = S + L - A, i.spotLightMap.length = L, i.numSpotLightShadowsWithMaps = A, i.numLightProbes = C, U.directionalLength = p, U.pointLength = v, U.spotLength = g, U.rectAreaLength = m, U.hemiLength = d, U.numDirectionalShadows = T, U.numPointShadows = _, U.numSpotShadows = S, U.numSpotMaps = L, U.numLightProbes = C, i.version = cd++);
  }
  function l(c, h) {
    let u = 0, f = 0, p = 0, v = 0, g = 0;
    const m = h.matrixWorldInverse;
    for (let d = 0, T = c.length; d < T; d++) {
      const _ = c[d];
      if (_.isDirectionalLight) {
        const S = i.directional[u];
        S.direction.setFromMatrixPosition(_.matrixWorld), r.setFromMatrixPosition(_.target.matrixWorld), S.direction.sub(r), S.direction.transformDirection(m), u++;
      } else if (_.isSpotLight) {
        const S = i.spot[p];
        S.position.setFromMatrixPosition(_.matrixWorld), S.position.applyMatrix4(m), S.direction.setFromMatrixPosition(_.matrixWorld), r.setFromMatrixPosition(_.target.matrixWorld), S.direction.sub(r), S.direction.transformDirection(m), p++;
      } else if (_.isRectAreaLight) {
        const S = i.rectArea[v];
        S.position.setFromMatrixPosition(_.matrixWorld), S.position.applyMatrix4(m), a.identity(), s.copy(_.matrixWorld), s.premultiply(m), a.extractRotation(s), S.halfWidth.set(_.width * 0.5, 0, 0), S.halfHeight.set(0, _.height * 0.5, 0), S.halfWidth.applyMatrix4(a), S.halfHeight.applyMatrix4(a), v++;
      } else if (_.isPointLight) {
        const S = i.point[f];
        S.position.setFromMatrixPosition(_.matrixWorld), S.position.applyMatrix4(m), f++;
      } else if (_.isHemisphereLight) {
        const S = i.hemi[g];
        S.direction.setFromMatrixPosition(_.matrixWorld), S.direction.transformDirection(m), g++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: i
  };
}
function no(e) {
  const t = new ud(e), n = [], i = [];
  function r(h) {
    c.camera = h, n.length = 0, i.length = 0;
  }
  function s(h) {
    n.push(h);
  }
  function a(h) {
    i.push(h);
  }
  function o() {
    t.setup(n);
  }
  function l(h) {
    t.setupView(n, h);
  }
  const c = {
    lightsArray: n,
    shadowsArray: i,
    camera: null,
    lights: t,
    transmissionRenderTarget: {}
  };
  return {
    init: r,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: s,
    pushShadow: a
  };
}
function fd(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(r, s = 0) {
    const a = t.get(r);
    let o;
    return a === void 0 ? (o = new no(e), t.set(r, [o])) : s >= a.length ? (o = new no(e), a.push(o)) : o = a[s], o;
  }
  function i() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: i
  };
}
var dd = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, pd = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function md(e, t, n) {
  let i = new Rs();
  const r = new oe(), s = new oe(), a = new et(), o = new Zh({ depthPacking: gc }), l = new Kh(), c = {}, h = n.maxTextureSize, u = {
    0: 1,
    1: 0,
    2: 2
  }, f = new hn({
    defines: { VSM_SAMPLES: 8 },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new oe() },
      radius: { value: 4 }
    },
    vertexShader: dd,
    fragmentShader: pd
  }), p = f.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const v = new yt();
  v.setAttribute("position", new It(new Float32Array([
    -1,
    -1,
    0.5,
    3,
    -1,
    0.5,
    -1,
    3,
    0.5
  ]), 3));
  const g = new Pt(v, f), m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let d = this.type;
  this.render = function(A, C, U) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || A.length === 0) return;
    const E = e.getRenderTarget(), M = e.getActiveCubeFace(), w = e.getActiveMipmapLevel(), F = e.state;
    F.setBlending(0), F.buffers.depth.getReversed() === !0 ? F.buffers.color.setClear(0, 0, 0, 0) : F.buffers.color.setClear(1, 1, 1, 1), F.buffers.depth.setTest(!0), F.setScissorTest(!1);
    const H = d !== 3 && this.type === 3, B = d === 3 && this.type !== 3;
    for (let Y = 0, k = A.length; Y < k; Y++) {
      const ee = A[Y], W = ee.shadow;
      if (W === void 0) {
        console.warn("THREE.WebGLShadowMap:", ee, "has no shadow.");
        continue;
      }
      if (W.autoUpdate === !1 && W.needsUpdate === !1) continue;
      r.copy(W.mapSize);
      const se = W.getFrameExtents();
      if (r.multiply(se), s.copy(W.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / se.x), r.x = s.x * se.x, W.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / se.y), r.y = s.y * se.y, W.mapSize.y = s.y)), W.map === null || H === !0 || B === !0) {
        const De = this.type !== 3 ? {
          minFilter: Ht,
          magFilter: Ht
        } : {};
        W.map !== null && W.map.dispose(), W.map = new wn(r.x, r.y, De), W.map.texture.name = ee.name + ".shadowMap", W.camera.updateProjectionMatrix();
      }
      e.setRenderTarget(W.map), e.clear();
      const pe = W.getViewportCount();
      for (let De = 0; De < pe; De++) {
        const Fe = W.getViewport(De);
        a.set(s.x * Fe.x, s.y * Fe.y, s.x * Fe.z, s.y * Fe.w), F.viewport(a), W.updateMatrices(ee, De), i = W.getFrustum(), S(C, U, W.camera, ee, this.type);
      }
      W.isPointLightShadow !== !0 && this.type === 3 && T(W, U), W.needsUpdate = !1;
    }
    d = this.type, m.needsUpdate = !1, e.setRenderTarget(E, M, w);
  };
  function T(A, C) {
    const U = t.update(g);
    f.defines.VSM_SAMPLES !== A.blurSamples && (f.defines.VSM_SAMPLES = A.blurSamples, p.defines.VSM_SAMPLES = A.blurSamples, f.needsUpdate = !0, p.needsUpdate = !0), A.mapPass === null && (A.mapPass = new wn(r.x, r.y)), f.uniforms.shadow_pass.value = A.map.texture, f.uniforms.resolution.value = A.mapSize, f.uniforms.radius.value = A.radius, e.setRenderTarget(A.mapPass), e.clear(), e.renderBufferDirect(C, null, U, f, g, null), p.uniforms.shadow_pass.value = A.mapPass.texture, p.uniforms.resolution.value = A.mapSize, p.uniforms.radius.value = A.radius, e.setRenderTarget(A.map), e.clear(), e.renderBufferDirect(C, null, U, p, g, null);
  }
  function _(A, C, U, E) {
    let M = null;
    const w = U.isPointLight === !0 ? A.customDistanceMaterial : A.customDepthMaterial;
    if (w !== void 0) M = w;
    else if (M = U.isPointLight === !0 ? l : o, e.localClippingEnabled && C.clipShadows === !0 && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0 || C.alphaToCoverage === !0) {
      const F = M.uuid, H = C.uuid;
      let B = c[F];
      B === void 0 && (B = {}, c[F] = B);
      let Y = B[H];
      Y === void 0 && (Y = M.clone(), B[H] = Y, C.addEventListener("dispose", L)), M = Y;
    }
    if (M.visible = C.visible, M.wireframe = C.wireframe, E === 3 ? M.side = C.shadowSide !== null ? C.shadowSide : C.side : M.side = C.shadowSide !== null ? C.shadowSide : u[C.side], M.alphaMap = C.alphaMap, M.alphaTest = C.alphaToCoverage === !0 ? 0.5 : C.alphaTest, M.map = C.map, M.clipShadows = C.clipShadows, M.clippingPlanes = C.clippingPlanes, M.clipIntersection = C.clipIntersection, M.displacementMap = C.displacementMap, M.displacementScale = C.displacementScale, M.displacementBias = C.displacementBias, M.wireframeLinewidth = C.wireframeLinewidth, M.linewidth = C.linewidth, U.isPointLight === !0 && M.isMeshDistanceMaterial === !0) {
      const F = e.properties.get(M);
      F.light = U;
    }
    return M;
  }
  function S(A, C, U, E, M) {
    if (A.visible === !1) return;
    if (A.layers.test(C.layers) && (A.isMesh || A.isLine || A.isPoints) && (A.castShadow || A.receiveShadow && M === 3) && (!A.frustumCulled || i.intersectsObject(A))) {
      A.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse, A.matrixWorld);
      const F = t.update(A), H = A.material;
      if (Array.isArray(H)) {
        const B = F.groups;
        for (let Y = 0, k = B.length; Y < k; Y++) {
          const ee = B[Y], W = H[ee.materialIndex];
          if (W && W.visible) {
            const se = _(A, W, E, M);
            A.onBeforeShadow(e, A, C, U, F, se, ee), e.renderBufferDirect(U, null, F, se, A, ee), A.onAfterShadow(e, A, C, U, F, se, ee);
          }
        }
      } else if (H.visible) {
        const B = _(A, H, E, M);
        A.onBeforeShadow(e, A, C, U, F, B, null), e.renderBufferDirect(U, null, F, B, A, null), A.onAfterShadow(e, A, C, U, F, B, null);
      }
    }
    const w = A.children;
    for (let F = 0, H = w.length; F < H; F++) S(w[F], C, U, E, M);
  }
  function L(A) {
    A.target.removeEventListener("dispose", L);
    for (const C in c) {
      const U = c[C], E = A.target.uuid;
      E in U && (U[E].dispose(), delete U[E]);
    }
  }
}
var gd = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function vd(e, t) {
  function n() {
    let I = !1;
    const me = new et();
    let ce = null;
    const Ae = new et(0, 0, 0, 0);
    return {
      setMask: function(ne) {
        ce !== ne && !I && (e.colorMask(ne, ne, ne, ne), ce = ne);
      },
      setLocked: function(ne) {
        I = ne;
      },
      setClear: function(ne, K, be, Le, ht) {
        ht === !0 && (ne *= Le, K *= Le, be *= Le), me.set(ne, K, be, Le), Ae.equals(me) === !1 && (e.clearColor(ne, K, be, Le), Ae.copy(me));
      },
      reset: function() {
        I = !1, ce = null, Ae.set(-1, 0, 0, 0);
      }
    };
  }
  function i() {
    let I = !1, me = !1, ce = null, Ae = null, ne = null;
    return {
      setReversed: function(K) {
        if (me !== K) {
          const be = t.get("EXT_clip_control");
          K ? be.clipControlEXT(be.LOWER_LEFT_EXT, be.ZERO_TO_ONE_EXT) : be.clipControlEXT(be.LOWER_LEFT_EXT, be.NEGATIVE_ONE_TO_ONE_EXT), me = K;
          const Le = ne;
          ne = null, this.setClear(Le);
        }
      },
      getReversed: function() {
        return me;
      },
      setTest: function(K) {
        K ? fe(e.DEPTH_TEST) : ye(e.DEPTH_TEST);
      },
      setMask: function(K) {
        ce !== K && !I && (e.depthMask(K), ce = K);
      },
      setFunc: function(K) {
        if (me && (K = gd[K]), Ae !== K) {
          switch (K) {
            case 0:
              e.depthFunc(e.NEVER);
              break;
            case 1:
              e.depthFunc(e.ALWAYS);
              break;
            case 2:
              e.depthFunc(e.LESS);
              break;
            case 3:
              e.depthFunc(e.LEQUAL);
              break;
            case 4:
              e.depthFunc(e.EQUAL);
              break;
            case 5:
              e.depthFunc(e.GEQUAL);
              break;
            case 6:
              e.depthFunc(e.GREATER);
              break;
            case 7:
              e.depthFunc(e.NOTEQUAL);
              break;
            default:
              e.depthFunc(e.LEQUAL);
          }
          Ae = K;
        }
      },
      setLocked: function(K) {
        I = K;
      },
      setClear: function(K) {
        ne !== K && (me && (K = 1 - K), e.clearDepth(K), ne = K);
      },
      reset: function() {
        I = !1, ce = null, Ae = null, ne = null, me = !1;
      }
    };
  }
  function r() {
    let I = !1, me = null, ce = null, Ae = null, ne = null, K = null, be = null, Le = null, ht = null;
    return {
      setTest: function(tt) {
        I || (tt ? fe(e.STENCIL_TEST) : ye(e.STENCIL_TEST));
      },
      setMask: function(tt) {
        me !== tt && !I && (e.stencilMask(tt), me = tt);
      },
      setFunc: function(tt, Gt, Wt) {
        (ce !== tt || Ae !== Gt || ne !== Wt) && (e.stencilFunc(tt, Gt, Wt), ce = tt, Ae = Gt, ne = Wt);
      },
      setOp: function(tt, Gt, Wt) {
        (K !== tt || be !== Gt || Le !== Wt) && (e.stencilOp(tt, Gt, Wt), K = tt, be = Gt, Le = Wt);
      },
      setLocked: function(tt) {
        I = tt;
      },
      setClear: function(tt) {
        ht !== tt && (e.clearStencil(tt), ht = tt);
      },
      reset: function() {
        I = !1, me = null, ce = null, Ae = null, ne = null, K = null, be = null, Le = null, ht = null;
      }
    };
  }
  const s = new n(), a = new i(), o = new r(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, u = {}, f = /* @__PURE__ */ new WeakMap(), p = [], v = null, g = !1, m = null, d = null, T = null, _ = null, S = null, L = null, A = null, C = new ke(0, 0, 0), U = 0, E = !1, M = null, w = null, F = null, H = null, B = null;
  const Y = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let k = !1, ee = 0;
  const W = e.getParameter(e.VERSION);
  W.indexOf("WebGL") !== -1 ? (ee = parseFloat(/^WebGL (\d)/.exec(W)[1]), k = ee >= 1) : W.indexOf("OpenGL ES") !== -1 && (ee = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), k = ee >= 2);
  let se = null, pe = {};
  const De = e.getParameter(e.SCISSOR_BOX), Fe = e.getParameter(e.VIEWPORT), nt = new et().fromArray(De), Ze = new et().fromArray(Fe);
  function q(I, me, ce, Ae) {
    const ne = new Uint8Array(4), K = e.createTexture();
    e.bindTexture(I, K), e.texParameteri(I, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(I, e.TEXTURE_MAG_FILTER, e.NEAREST);
    for (let be = 0; be < ce; be++) I === e.TEXTURE_3D || I === e.TEXTURE_2D_ARRAY ? e.texImage3D(me, 0, e.RGBA, 1, 1, Ae, 0, e.RGBA, e.UNSIGNED_BYTE, ne) : e.texImage2D(me + be, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, ne);
    return K;
  }
  const he = {};
  he[e.TEXTURE_2D] = q(e.TEXTURE_2D, e.TEXTURE_2D, 1), he[e.TEXTURE_CUBE_MAP] = q(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), he[e.TEXTURE_2D_ARRAY] = q(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), he[e.TEXTURE_3D] = q(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), fe(e.DEPTH_TEST), a.setFunc(3), Z(!1), ue(1), fe(e.CULL_FACE), $(0);
  function fe(I) {
    h[I] !== !0 && (e.enable(I), h[I] = !0);
  }
  function ye(I) {
    h[I] !== !1 && (e.disable(I), h[I] = !1);
  }
  function Ie(I, me) {
    return u[I] !== me ? (e.bindFramebuffer(I, me), u[I] = me, I === e.DRAW_FRAMEBUFFER && (u[e.FRAMEBUFFER] = me), I === e.FRAMEBUFFER && (u[e.DRAW_FRAMEBUFFER] = me), !0) : !1;
  }
  function Ee(I, me) {
    let ce = p, Ae = !1;
    if (I) {
      ce = f.get(me), ce === void 0 && (ce = [], f.set(me, ce));
      const ne = I.textures;
      if (ce.length !== ne.length || ce[0] !== e.COLOR_ATTACHMENT0) {
        for (let K = 0, be = ne.length; K < be; K++) ce[K] = e.COLOR_ATTACHMENT0 + K;
        ce.length = ne.length, Ae = !0;
      }
    } else ce[0] !== e.BACK && (ce[0] = e.BACK, Ae = !0);
    Ae && e.drawBuffers(ce);
  }
  function qe(I) {
    return v !== I ? (e.useProgram(I), v = I, !0) : !1;
  }
  const R = {
    100: e.FUNC_ADD,
    101: e.FUNC_SUBTRACT,
    102: e.FUNC_REVERSE_SUBTRACT
  };
  R[103] = e.MIN, R[104] = e.MAX;
  const J = {
    200: e.ZERO,
    201: e.ONE,
    202: e.SRC_COLOR,
    204: e.SRC_ALPHA,
    210: e.SRC_ALPHA_SATURATE,
    208: e.DST_COLOR,
    206: e.DST_ALPHA,
    203: e.ONE_MINUS_SRC_COLOR,
    205: e.ONE_MINUS_SRC_ALPHA,
    209: e.ONE_MINUS_DST_COLOR,
    207: e.ONE_MINUS_DST_ALPHA,
    211: e.CONSTANT_COLOR,
    212: e.ONE_MINUS_CONSTANT_COLOR,
    213: e.CONSTANT_ALPHA,
    214: e.ONE_MINUS_CONSTANT_ALPHA
  };
  function $(I, me, ce, Ae, ne, K, be, Le, ht, tt) {
    if (I === 0) {
      g === !0 && (ye(e.BLEND), g = !1);
      return;
    }
    if (g === !1 && (fe(e.BLEND), g = !0), I !== 5) {
      if (I !== m || tt !== E) {
        if ((d !== 100 || S !== 100) && (e.blendEquation(e.FUNC_ADD), d = 100, S = 100), tt) switch (I) {
          case 1:
            e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
            break;
          case 2:
            e.blendFunc(e.ONE, e.ONE);
            break;
          case 3:
            e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
            break;
          case 4:
            e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", I);
            break;
        }
        else switch (I) {
          case 1:
            e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
            break;
          case 2:
            e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
            break;
          case 3:
            console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
            break;
          case 4:
            console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", I);
            break;
        }
        T = null, _ = null, L = null, A = null, C.set(0, 0, 0), U = 0, m = I, E = tt;
      }
      return;
    }
    ne = ne || me, K = K || ce, be = be || Ae, (me !== d || ne !== S) && (e.blendEquationSeparate(R[me], R[ne]), d = me, S = ne), (ce !== T || Ae !== _ || K !== L || be !== A) && (e.blendFuncSeparate(J[ce], J[Ae], J[K], J[be]), T = ce, _ = Ae, L = K, A = be), (Le.equals(C) === !1 || ht !== U) && (e.blendColor(Le.r, Le.g, Le.b, ht), C.copy(Le), U = ht), m = I, E = !1;
  }
  function te(I, me) {
    I.side === 2 ? ye(e.CULL_FACE) : fe(e.CULL_FACE);
    let ce = I.side === 1;
    me && (ce = !ce), Z(ce), I.blending === 1 && I.transparent === !1 ? $(0) : $(I.blending, I.blendEquation, I.blendSrc, I.blendDst, I.blendEquationAlpha, I.blendSrcAlpha, I.blendDstAlpha, I.blendColor, I.blendAlpha, I.premultipliedAlpha), a.setFunc(I.depthFunc), a.setTest(I.depthTest), a.setMask(I.depthWrite), s.setMask(I.colorWrite);
    const Ae = I.stencilWrite;
    o.setTest(Ae), Ae && (o.setMask(I.stencilWriteMask), o.setFunc(I.stencilFunc, I.stencilRef, I.stencilFuncMask), o.setOp(I.stencilFail, I.stencilZFail, I.stencilZPass)), ie(I.polygonOffset, I.polygonOffsetFactor, I.polygonOffsetUnits), I.alphaToCoverage === !0 ? fe(e.SAMPLE_ALPHA_TO_COVERAGE) : ye(e.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Z(I) {
    M !== I && (I ? e.frontFace(e.CW) : e.frontFace(e.CCW), M = I);
  }
  function ue(I) {
    I !== 0 ? (fe(e.CULL_FACE), I !== w && (I === 1 ? e.cullFace(e.BACK) : I === 2 ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))) : ye(e.CULL_FACE), w = I;
  }
  function ae(I) {
    I !== F && (k && e.lineWidth(I), F = I);
  }
  function ie(I, me, ce) {
    I ? (fe(e.POLYGON_OFFSET_FILL), (H !== me || B !== ce) && (e.polygonOffset(me, ce), H = me, B = ce)) : ye(e.POLYGON_OFFSET_FILL);
  }
  function Be(I) {
    I ? fe(e.SCISSOR_TEST) : ye(e.SCISSOR_TEST);
  }
  function ze(I) {
    I === void 0 && (I = e.TEXTURE0 + Y - 1), se !== I && (e.activeTexture(I), se = I);
  }
  function Ge(I, me, ce) {
    ce === void 0 && (se === null ? ce = e.TEXTURE0 + Y - 1 : ce = se);
    let Ae = pe[ce];
    Ae === void 0 && (Ae = {
      type: void 0,
      texture: void 0
    }, pe[ce] = Ae), (Ae.type !== I || Ae.texture !== me) && (se !== ce && (e.activeTexture(ce), se = ce), e.bindTexture(I, me || he[I]), Ae.type = I, Ae.texture = me);
  }
  function b() {
    const I = pe[se];
    I !== void 0 && I.type !== void 0 && (e.bindTexture(I.type, null), I.type = void 0, I.texture = void 0);
  }
  function x() {
    try {
      e.compressedTexImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function N() {
    try {
      e.compressedTexImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function X() {
    try {
      e.texSubImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function j() {
    try {
      e.texSubImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function G() {
    try {
      e.compressedTexSubImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function xe() {
    try {
      e.compressedTexSubImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function le() {
    try {
      e.texStorage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Te() {
    try {
      e.texStorage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Pe() {
    try {
      e.texImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function re() {
    try {
      e.texImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ge(I) {
    nt.equals(I) === !1 && (e.scissor(I.x, I.y, I.z, I.w), nt.copy(I));
  }
  function Re(I) {
    Ze.equals(I) === !1 && (e.viewport(I.x, I.y, I.z, I.w), Ze.copy(I));
  }
  function Ce(I, me) {
    let ce = c.get(me);
    ce === void 0 && (ce = /* @__PURE__ */ new WeakMap(), c.set(me, ce));
    let Ae = ce.get(I);
    Ae === void 0 && (Ae = e.getUniformBlockIndex(me, I.name), ce.set(I, Ae));
  }
  function ve(I, me) {
    const ce = c.get(me).get(I);
    l.get(me) !== ce && (e.uniformBlockBinding(me, ce, I.__bindingPointIndex), l.set(me, ce));
  }
  function We() {
    e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(!0, !0, !0, !0), e.clearColor(0, 0, 0, 0), e.depthMask(!0), e.depthFunc(e.LESS), a.setReversed(!1), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), h = {}, se = null, pe = {}, u = {}, f = /* @__PURE__ */ new WeakMap(), p = [], v = null, g = !1, m = null, d = null, T = null, _ = null, S = null, L = null, A = null, C = new ke(0, 0, 0), U = 0, E = !1, M = null, w = null, F = null, H = null, B = null, nt.set(0, 0, e.canvas.width, e.canvas.height), Ze.set(0, 0, e.canvas.width, e.canvas.height), s.reset(), a.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: a,
      stencil: o
    },
    enable: fe,
    disable: ye,
    bindFramebuffer: Ie,
    drawBuffers: Ee,
    useProgram: qe,
    setBlending: $,
    setMaterial: te,
    setFlipSided: Z,
    setCullFace: ue,
    setLineWidth: ae,
    setPolygonOffset: ie,
    setScissorTest: Be,
    activeTexture: ze,
    bindTexture: Ge,
    unbindTexture: b,
    compressedTexImage2D: x,
    compressedTexImage3D: N,
    texImage2D: Pe,
    texImage3D: re,
    updateUBOMapping: Ce,
    uniformBlockBinding: ve,
    texStorage2D: le,
    texStorage3D: Te,
    texSubImage2D: X,
    texSubImage3D: j,
    compressedTexSubImage2D: G,
    compressedTexSubImage3D: xe,
    scissor: ge,
    viewport: Re,
    reset: We
  };
}
function _d(e, t, n, i, r, s, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new oe(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const f = /* @__PURE__ */ new WeakMap();
  let p = !1;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function v(b, x) {
    return p ? new OffscreenCanvas(b, x) : Ei("canvas");
  }
  function g(b, x, N) {
    let X = 1;
    const j = Ge(b);
    if ((j.width > N || j.height > N) && (X = N / Math.max(j.width, j.height)), X < 1) if (typeof HTMLImageElement < "u" && b instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && b instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && b instanceof ImageBitmap || typeof VideoFrame < "u" && b instanceof VideoFrame) {
      const G = Math.floor(X * j.width), xe = Math.floor(X * j.height);
      u === void 0 && (u = v(G, xe));
      const le = x ? v(G, xe) : u;
      return le.width = G, le.height = xe, le.getContext("2d").drawImage(b, 0, 0, G, xe), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + j.width + "x" + j.height + ") to (" + G + "x" + xe + ")."), le;
    } else
      return "data" in b && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + j.width + "x" + j.height + ")."), b;
    return b;
  }
  function m(b) {
    return b.generateMipmaps;
  }
  function d(b) {
    e.generateMipmap(b);
  }
  function T(b) {
    return b.isWebGLCubeRenderTarget ? e.TEXTURE_CUBE_MAP : b.isWebGL3DRenderTarget ? e.TEXTURE_3D : b.isWebGLArrayRenderTarget || b.isCompressedArrayTexture ? e.TEXTURE_2D_ARRAY : e.TEXTURE_2D;
  }
  function _(b, x, N, X, j = !1) {
    if (b !== null) {
      if (e[b] !== void 0) return e[b];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + b + "'");
    }
    let G = x;
    if (x === e.RED && (N === e.FLOAT && (G = e.R32F), N === e.HALF_FLOAT && (G = e.R16F), N === e.UNSIGNED_BYTE && (G = e.R8)), x === e.RED_INTEGER && (N === e.UNSIGNED_BYTE && (G = e.R8UI), N === e.UNSIGNED_SHORT && (G = e.R16UI), N === e.UNSIGNED_INT && (G = e.R32UI), N === e.BYTE && (G = e.R8I), N === e.SHORT && (G = e.R16I), N === e.INT && (G = e.R32I)), x === e.RG && (N === e.FLOAT && (G = e.RG32F), N === e.HALF_FLOAT && (G = e.RG16F), N === e.UNSIGNED_BYTE && (G = e.RG8)), x === e.RG_INTEGER && (N === e.UNSIGNED_BYTE && (G = e.RG8UI), N === e.UNSIGNED_SHORT && (G = e.RG16UI), N === e.UNSIGNED_INT && (G = e.RG32UI), N === e.BYTE && (G = e.RG8I), N === e.SHORT && (G = e.RG16I), N === e.INT && (G = e.RG32I)), x === e.RGB_INTEGER && (N === e.UNSIGNED_BYTE && (G = e.RGB8UI), N === e.UNSIGNED_SHORT && (G = e.RGB16UI), N === e.UNSIGNED_INT && (G = e.RGB32UI), N === e.BYTE && (G = e.RGB8I), N === e.SHORT && (G = e.RGB16I), N === e.INT && (G = e.RGB32I)), x === e.RGBA_INTEGER && (N === e.UNSIGNED_BYTE && (G = e.RGBA8UI), N === e.UNSIGNED_SHORT && (G = e.RGBA16UI), N === e.UNSIGNED_INT && (G = e.RGBA32UI), N === e.BYTE && (G = e.RGBA8I), N === e.SHORT && (G = e.RGBA16I), N === e.INT && (G = e.RGBA32I)), x === e.RGB && (N === e.UNSIGNED_INT_5_9_9_9_REV && (G = e.RGB9_E5), N === e.UNSIGNED_INT_10F_11F_11F_REV && (G = e.R11F_G11F_B10F)), x === e.RGBA) {
      const xe = j ? pr : je.getTransfer(X);
      N === e.FLOAT && (G = e.RGBA32F), N === e.HALF_FLOAT && (G = e.RGBA16F), N === e.UNSIGNED_BYTE && (G = xe === "srgb" ? e.SRGB8_ALPHA8 : e.RGBA8), N === e.UNSIGNED_SHORT_4_4_4_4 && (G = e.RGBA4), N === e.UNSIGNED_SHORT_5_5_5_1 && (G = e.RGB5_A1);
    }
    return (G === e.R16F || G === e.R32F || G === e.RG16F || G === e.RG32F || G === e.RGBA16F || G === e.RGBA32F) && t.get("EXT_color_buffer_float"), G;
  }
  function S(b, x) {
    let N;
    return b ? x === null || x === 1014 || x === 1020 ? N = e.DEPTH24_STENCIL8 : x === 1015 ? N = e.DEPTH32F_STENCIL8 : x === 1012 && (N = e.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : x === null || x === 1014 || x === 1020 ? N = e.DEPTH_COMPONENT24 : x === 1015 ? N = e.DEPTH_COMPONENT32F : x === 1012 && (N = e.DEPTH_COMPONENT16), N;
  }
  function L(b, x) {
    return m(b) === !0 || b.isFramebufferTexture && b.minFilter !== 1003 && b.minFilter !== 1006 ? Math.log2(Math.max(x.width, x.height)) + 1 : b.mipmaps !== void 0 && b.mipmaps.length > 0 ? b.mipmaps.length : b.isCompressedTexture && Array.isArray(b.image) ? x.mipmaps.length : 1;
  }
  function A(b) {
    const x = b.target;
    x.removeEventListener("dispose", A), U(x), x.isVideoTexture && h.delete(x);
  }
  function C(b) {
    const x = b.target;
    x.removeEventListener("dispose", C), M(x);
  }
  function U(b) {
    const x = i.get(b);
    if (x.__webglInit === void 0) return;
    const N = b.source, X = f.get(N);
    if (X) {
      const j = X[x.__cacheKey];
      j.usedTimes--, j.usedTimes === 0 && E(b), Object.keys(X).length === 0 && f.delete(N);
    }
    i.remove(b);
  }
  function E(b) {
    const x = i.get(b);
    e.deleteTexture(x.__webglTexture);
    const N = b.source, X = f.get(N);
    delete X[x.__cacheKey], a.memory.textures--;
  }
  function M(b) {
    const x = i.get(b);
    if (b.depthTexture && (b.depthTexture.dispose(), i.remove(b.depthTexture)), b.isWebGLCubeRenderTarget) for (let X = 0; X < 6; X++) {
      if (Array.isArray(x.__webglFramebuffer[X])) for (let j = 0; j < x.__webglFramebuffer[X].length; j++) e.deleteFramebuffer(x.__webglFramebuffer[X][j]);
      else e.deleteFramebuffer(x.__webglFramebuffer[X]);
      x.__webglDepthbuffer && e.deleteRenderbuffer(x.__webglDepthbuffer[X]);
    }
    else {
      if (Array.isArray(x.__webglFramebuffer)) for (let X = 0; X < x.__webglFramebuffer.length; X++) e.deleteFramebuffer(x.__webglFramebuffer[X]);
      else e.deleteFramebuffer(x.__webglFramebuffer);
      if (x.__webglDepthbuffer && e.deleteRenderbuffer(x.__webglDepthbuffer), x.__webglMultisampledFramebuffer && e.deleteFramebuffer(x.__webglMultisampledFramebuffer), x.__webglColorRenderbuffer)
        for (let X = 0; X < x.__webglColorRenderbuffer.length; X++) x.__webglColorRenderbuffer[X] && e.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);
      x.__webglDepthRenderbuffer && e.deleteRenderbuffer(x.__webglDepthRenderbuffer);
    }
    const N = b.textures;
    for (let X = 0, j = N.length; X < j; X++) {
      const G = i.get(N[X]);
      G.__webglTexture && (e.deleteTexture(G.__webglTexture), a.memory.textures--), i.remove(N[X]);
    }
    i.remove(b);
  }
  let w = 0;
  function F() {
    w = 0;
  }
  function H() {
    const b = w;
    return b >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + b + " texture units while this GPU supports only " + r.maxTextures), w += 1, b;
  }
  function B(b) {
    const x = [];
    return x.push(b.wrapS), x.push(b.wrapT), x.push(b.wrapR || 0), x.push(b.magFilter), x.push(b.minFilter), x.push(b.anisotropy), x.push(b.internalFormat), x.push(b.format), x.push(b.type), x.push(b.generateMipmaps), x.push(b.premultiplyAlpha), x.push(b.flipY), x.push(b.unpackAlignment), x.push(b.colorSpace), x.join();
  }
  function Y(b, x) {
    const N = i.get(b);
    if (b.isVideoTexture && Be(b), b.isRenderTargetTexture === !1 && b.isExternalTexture !== !0 && b.version > 0 && N.__version !== b.version) {
      const X = b.image;
      if (X === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (X.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        he(N, b, x);
        return;
      }
    } else b.isExternalTexture && (N.__webglTexture = b.sourceTexture ? b.sourceTexture : null);
    n.bindTexture(e.TEXTURE_2D, N.__webglTexture, e.TEXTURE0 + x);
  }
  function k(b, x) {
    const N = i.get(b);
    if (b.isRenderTargetTexture === !1 && b.version > 0 && N.__version !== b.version) {
      he(N, b, x);
      return;
    }
    n.bindTexture(e.TEXTURE_2D_ARRAY, N.__webglTexture, e.TEXTURE0 + x);
  }
  function ee(b, x) {
    const N = i.get(b);
    if (b.isRenderTargetTexture === !1 && b.version > 0 && N.__version !== b.version) {
      he(N, b, x);
      return;
    }
    n.bindTexture(e.TEXTURE_3D, N.__webglTexture, e.TEXTURE0 + x);
  }
  function W(b, x) {
    const N = i.get(b);
    if (b.version > 0 && N.__version !== b.version) {
      fe(N, b, x);
      return;
    }
    n.bindTexture(e.TEXTURE_CUBE_MAP, N.__webglTexture, e.TEXTURE0 + x);
  }
  const se = {
    [us]: e.REPEAT,
    [Tn]: e.CLAMP_TO_EDGE,
    [fs]: e.MIRRORED_REPEAT
  }, pe = {
    [Ht]: e.NEAREST,
    [_l]: e.NEAREST_MIPMAP_NEAREST,
    [xl]: e.NEAREST_MIPMAP_LINEAR,
    [An]: e.LINEAR,
    [yl]: e.LINEAR_MIPMAP_NEAREST,
    [Ms]: e.LINEAR_MIPMAP_LINEAR
  }, De = {
    512: e.NEVER,
    519: e.ALWAYS,
    513: e.LESS,
    515: e.LEQUAL,
    514: e.EQUAL,
    518: e.GEQUAL,
    516: e.GREATER,
    517: e.NOTEQUAL
  };
  function Fe(b, x) {
    if (x.type === 1015 && t.has("OES_texture_float_linear") === !1 && (x.magFilter === 1006 || x.magFilter === 1007 || x.magFilter === 1005 || x.magFilter === 1008 || x.minFilter === 1006 || x.minFilter === 1007 || x.minFilter === 1005 || x.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), e.texParameteri(b, e.TEXTURE_WRAP_S, se[x.wrapS]), e.texParameteri(b, e.TEXTURE_WRAP_T, se[x.wrapT]), (b === e.TEXTURE_3D || b === e.TEXTURE_2D_ARRAY) && e.texParameteri(b, e.TEXTURE_WRAP_R, se[x.wrapR]), e.texParameteri(b, e.TEXTURE_MAG_FILTER, pe[x.magFilter]), e.texParameteri(b, e.TEXTURE_MIN_FILTER, pe[x.minFilter]), x.compareFunction && (e.texParameteri(b, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(b, e.TEXTURE_COMPARE_FUNC, De[x.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (x.magFilter === 1003 || x.minFilter !== 1005 && x.minFilter !== 1008 || x.type === 1015 && t.has("OES_texture_float_linear") === !1) return;
      if (x.anisotropy > 1 || i.get(x).__currentAnisotropy) {
        const N = t.get("EXT_texture_filter_anisotropic");
        e.texParameterf(b, N.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(x.anisotropy, r.getMaxAnisotropy())), i.get(x).__currentAnisotropy = x.anisotropy;
      }
    }
  }
  function nt(b, x) {
    let N = !1;
    b.__webglInit === void 0 && (b.__webglInit = !0, x.addEventListener("dispose", A));
    const X = x.source;
    let j = f.get(X);
    j === void 0 && (j = {}, f.set(X, j));
    const G = B(x);
    if (G !== b.__cacheKey) {
      j[G] === void 0 && (j[G] = {
        texture: e.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, N = !0), j[G].usedTimes++;
      const xe = j[b.__cacheKey];
      xe !== void 0 && (j[b.__cacheKey].usedTimes--, xe.usedTimes === 0 && E(x)), b.__cacheKey = G, b.__webglTexture = j[G].texture;
    }
    return N;
  }
  function Ze(b, x, N) {
    return Math.floor(Math.floor(b / N) / x);
  }
  function q(b, x, N, X) {
    const G = b.updateRanges;
    if (G.length === 0) n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, x.width, x.height, N, X, x.data);
    else {
      G.sort((re, ge) => re.start - ge.start);
      let xe = 0;
      for (let re = 1; re < G.length; re++) {
        const ge = G[xe], Re = G[re], Ce = ge.start + ge.count, ve = Ze(Re.start, x.width, 4), We = Ze(ge.start, x.width, 4);
        Re.start <= Ce + 1 && ve === We && Ze(Re.start + Re.count - 1, x.width, 4) === ve ? ge.count = Math.max(ge.count, Re.start + Re.count - ge.start) : (++xe, G[xe] = Re);
      }
      G.length = xe + 1;
      const le = e.getParameter(e.UNPACK_ROW_LENGTH), Te = e.getParameter(e.UNPACK_SKIP_PIXELS), Pe = e.getParameter(e.UNPACK_SKIP_ROWS);
      e.pixelStorei(e.UNPACK_ROW_LENGTH, x.width);
      for (let re = 0, ge = G.length; re < ge; re++) {
        const Re = G[re], Ce = Math.floor(Re.start / 4), ve = Math.ceil(Re.count / 4), We = Ce % x.width, I = Math.floor(Ce / x.width), me = ve, ce = 1;
        e.pixelStorei(e.UNPACK_SKIP_PIXELS, We), e.pixelStorei(e.UNPACK_SKIP_ROWS, I), n.texSubImage2D(e.TEXTURE_2D, 0, We, I, me, ce, N, X, x.data);
      }
      b.clearUpdateRanges(), e.pixelStorei(e.UNPACK_ROW_LENGTH, le), e.pixelStorei(e.UNPACK_SKIP_PIXELS, Te), e.pixelStorei(e.UNPACK_SKIP_ROWS, Pe);
    }
  }
  function he(b, x, N) {
    let X = e.TEXTURE_2D;
    (x.isDataArrayTexture || x.isCompressedArrayTexture) && (X = e.TEXTURE_2D_ARRAY), x.isData3DTexture && (X = e.TEXTURE_3D);
    const j = nt(b, x), G = x.source;
    n.bindTexture(X, b.__webglTexture, e.TEXTURE0 + N);
    const xe = i.get(G);
    if (G.version !== xe.__version || j === !0) {
      n.activeTexture(e.TEXTURE0 + N);
      const le = je.getPrimaries(je.workingColorSpace), Te = x.colorSpace === "" ? null : je.getPrimaries(x.colorSpace), Pe = x.colorSpace === "" || le === Te ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, x.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, x.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, Pe);
      let re = g(x.image, !1, r.maxTextureSize);
      re = ze(x, re);
      const ge = s.convert(x.format, x.colorSpace), Re = s.convert(x.type);
      let Ce = _(x.internalFormat, ge, Re, x.colorSpace, x.isVideoTexture);
      Fe(X, x);
      let ve;
      const We = x.mipmaps, I = x.isVideoTexture !== !0, me = xe.__version === void 0 || j === !0, ce = G.dataReady, Ae = L(x, re);
      if (x.isDepthTexture)
        Ce = S(x.format === ro, x.type), me && (I ? n.texStorage2D(e.TEXTURE_2D, 1, Ce, re.width, re.height) : n.texImage2D(e.TEXTURE_2D, 0, Ce, re.width, re.height, 0, ge, Re, null));
      else if (x.isDataTexture) if (We.length > 0) {
        I && me && n.texStorage2D(e.TEXTURE_2D, Ae, Ce, We[0].width, We[0].height);
        for (let ne = 0, K = We.length; ne < K; ne++)
          ve = We[ne], I ? ce && n.texSubImage2D(e.TEXTURE_2D, ne, 0, 0, ve.width, ve.height, ge, Re, ve.data) : n.texImage2D(e.TEXTURE_2D, ne, Ce, ve.width, ve.height, 0, ge, Re, ve.data);
        x.generateMipmaps = !1;
      } else I ? (me && n.texStorage2D(e.TEXTURE_2D, Ae, Ce, re.width, re.height), ce && q(x, re, ge, Re)) : n.texImage2D(e.TEXTURE_2D, 0, Ce, re.width, re.height, 0, ge, Re, re.data);
      else if (x.isCompressedTexture) if (x.isCompressedArrayTexture) {
        I && me && n.texStorage3D(e.TEXTURE_2D_ARRAY, Ae, Ce, We[0].width, We[0].height, re.depth);
        for (let ne = 0, K = We.length; ne < K; ne++)
          if (ve = We[ne], x.format !== 1023) if (ge !== null) if (I) {
            if (ce) if (x.layerUpdates.size > 0) {
              const be = Ia(ve.width, ve.height, x.format, x.type);
              for (const Le of x.layerUpdates) {
                const ht = ve.data.subarray(Le * be / ve.data.BYTES_PER_ELEMENT, (Le + 1) * be / ve.data.BYTES_PER_ELEMENT);
                n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, ne, 0, 0, Le, ve.width, ve.height, 1, ge, ht);
              }
              x.clearLayerUpdates();
            } else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, ne, 0, 0, 0, ve.width, ve.height, re.depth, ge, ve.data);
          } else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY, ne, Ce, ve.width, ve.height, re.depth, 0, ve.data, 0, 0);
          else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          else I ? ce && n.texSubImage3D(e.TEXTURE_2D_ARRAY, ne, 0, 0, 0, ve.width, ve.height, re.depth, ge, Re, ve.data) : n.texImage3D(e.TEXTURE_2D_ARRAY, ne, Ce, ve.width, ve.height, re.depth, 0, ge, Re, ve.data);
      } else {
        I && me && n.texStorage2D(e.TEXTURE_2D, Ae, Ce, We[0].width, We[0].height);
        for (let ne = 0, K = We.length; ne < K; ne++)
          ve = We[ne], x.format !== 1023 ? ge !== null ? I ? ce && n.compressedTexSubImage2D(e.TEXTURE_2D, ne, 0, 0, ve.width, ve.height, ge, ve.data) : n.compressedTexImage2D(e.TEXTURE_2D, ne, Ce, ve.width, ve.height, 0, ve.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : I ? ce && n.texSubImage2D(e.TEXTURE_2D, ne, 0, 0, ve.width, ve.height, ge, Re, ve.data) : n.texImage2D(e.TEXTURE_2D, ne, Ce, ve.width, ve.height, 0, ge, Re, ve.data);
      }
      else if (x.isDataArrayTexture) if (I) {
        if (me && n.texStorage3D(e.TEXTURE_2D_ARRAY, Ae, Ce, re.width, re.height, re.depth), ce) if (x.layerUpdates.size > 0) {
          const ne = Ia(re.width, re.height, x.format, x.type);
          for (const K of x.layerUpdates) {
            const be = re.data.subarray(K * ne / re.data.BYTES_PER_ELEMENT, (K + 1) * ne / re.data.BYTES_PER_ELEMENT);
            n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, K, re.width, re.height, 1, ge, Re, be);
          }
          x.clearLayerUpdates();
        } else n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, 0, re.width, re.height, re.depth, ge, Re, re.data);
      } else n.texImage3D(e.TEXTURE_2D_ARRAY, 0, Ce, re.width, re.height, re.depth, 0, ge, Re, re.data);
      else if (x.isData3DTexture) I ? (me && n.texStorage3D(e.TEXTURE_3D, Ae, Ce, re.width, re.height, re.depth), ce && n.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, re.width, re.height, re.depth, ge, Re, re.data)) : n.texImage3D(e.TEXTURE_3D, 0, Ce, re.width, re.height, re.depth, 0, ge, Re, re.data);
      else if (x.isFramebufferTexture) {
        if (me) if (I) n.texStorage2D(e.TEXTURE_2D, Ae, Ce, re.width, re.height);
        else {
          let ne = re.width, K = re.height;
          for (let be = 0; be < Ae; be++)
            n.texImage2D(e.TEXTURE_2D, be, Ce, ne, K, 0, ge, Re, null), ne >>= 1, K >>= 1;
        }
      } else if (We.length > 0) {
        if (I && me) {
          const ne = Ge(We[0]);
          n.texStorage2D(e.TEXTURE_2D, Ae, Ce, ne.width, ne.height);
        }
        for (let ne = 0, K = We.length; ne < K; ne++)
          ve = We[ne], I ? ce && n.texSubImage2D(e.TEXTURE_2D, ne, 0, 0, ge, Re, ve) : n.texImage2D(e.TEXTURE_2D, ne, Ce, ge, Re, ve);
        x.generateMipmaps = !1;
      } else if (I) {
        if (me) {
          const ne = Ge(re);
          n.texStorage2D(e.TEXTURE_2D, Ae, Ce, ne.width, ne.height);
        }
        ce && n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, ge, Re, re);
      } else n.texImage2D(e.TEXTURE_2D, 0, Ce, ge, Re, re);
      m(x) && d(X), xe.__version = G.version, x.onUpdate && x.onUpdate(x);
    }
    b.__version = x.version;
  }
  function fe(b, x, N) {
    if (x.image.length !== 6) return;
    const X = nt(b, x), j = x.source;
    n.bindTexture(e.TEXTURE_CUBE_MAP, b.__webglTexture, e.TEXTURE0 + N);
    const G = i.get(j);
    if (j.version !== G.__version || X === !0) {
      n.activeTexture(e.TEXTURE0 + N);
      const xe = je.getPrimaries(je.workingColorSpace), le = x.colorSpace === "" ? null : je.getPrimaries(x.colorSpace), Te = x.colorSpace === "" || xe === le ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, x.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, x.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, Te);
      const Pe = x.isCompressedTexture || x.image[0].isCompressedTexture, re = x.image[0] && x.image[0].isDataTexture, ge = [];
      for (let K = 0; K < 6; K++)
        !Pe && !re ? ge[K] = g(x.image[K], !0, r.maxCubemapSize) : ge[K] = re ? x.image[K].image : x.image[K], ge[K] = ze(x, ge[K]);
      const Re = ge[0], Ce = s.convert(x.format, x.colorSpace), ve = s.convert(x.type), We = _(x.internalFormat, Ce, ve, x.colorSpace), I = x.isVideoTexture !== !0, me = G.__version === void 0 || X === !0, ce = j.dataReady;
      let Ae = L(x, Re);
      Fe(e.TEXTURE_CUBE_MAP, x);
      let ne;
      if (Pe) {
        I && me && n.texStorage2D(e.TEXTURE_CUBE_MAP, Ae, We, Re.width, Re.height);
        for (let K = 0; K < 6; K++) {
          ne = ge[K].mipmaps;
          for (let be = 0; be < ne.length; be++) {
            const Le = ne[be];
            x.format !== 1023 ? Ce !== null ? I ? ce && n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be, 0, 0, Le.width, Le.height, Ce, Le.data) : n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be, We, Le.width, Le.height, 0, Le.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : I ? ce && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be, 0, 0, Le.width, Le.height, Ce, ve, Le.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be, We, Le.width, Le.height, 0, Ce, ve, Le.data);
          }
        }
      } else {
        if (ne = x.mipmaps, I && me) {
          ne.length > 0 && Ae++;
          const K = Ge(ge[0]);
          n.texStorage2D(e.TEXTURE_CUBE_MAP, Ae, We, K.width, K.height);
        }
        for (let K = 0; K < 6; K++) if (re) {
          I ? ce && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, 0, 0, ge[K].width, ge[K].height, Ce, ve, ge[K].data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, We, ge[K].width, ge[K].height, 0, Ce, ve, ge[K].data);
          for (let be = 0; be < ne.length; be++) {
            const Le = ne[be].image[K].image;
            I ? ce && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be + 1, 0, 0, Le.width, Le.height, Ce, ve, Le.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be + 1, We, Le.width, Le.height, 0, Ce, ve, Le.data);
          }
        } else {
          I ? ce && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, 0, 0, Ce, ve, ge[K]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, We, Ce, ve, ge[K]);
          for (let be = 0; be < ne.length; be++) {
            const Le = ne[be];
            I ? ce && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be + 1, 0, 0, Ce, ve, Le.image[K]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + K, be + 1, We, Ce, ve, Le.image[K]);
          }
        }
      }
      m(x) && d(e.TEXTURE_CUBE_MAP), G.__version = j.version, x.onUpdate && x.onUpdate(x);
    }
    b.__version = x.version;
  }
  function ye(b, x, N, X, j, G) {
    const xe = s.convert(N.format, N.colorSpace), le = s.convert(N.type), Te = _(N.internalFormat, xe, le, N.colorSpace), Pe = i.get(x), re = i.get(N);
    if (re.__renderTarget = x, !Pe.__hasExternalTextures) {
      const ge = Math.max(1, x.width >> G), Re = Math.max(1, x.height >> G);
      j === e.TEXTURE_3D || j === e.TEXTURE_2D_ARRAY ? n.texImage3D(j, G, Te, ge, Re, x.depth, 0, xe, le, null) : n.texImage2D(j, G, Te, ge, Re, 0, xe, le, null);
    }
    n.bindFramebuffer(e.FRAMEBUFFER, b), ie(x) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, X, j, re.__webglTexture, 0, ae(x)) : (j === e.TEXTURE_2D || j >= e.TEXTURE_CUBE_MAP_POSITIVE_X && j <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z) && e.framebufferTexture2D(e.FRAMEBUFFER, X, j, re.__webglTexture, G), n.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function Ie(b, x, N) {
    if (e.bindRenderbuffer(e.RENDERBUFFER, b), x.depthBuffer) {
      const X = x.depthTexture, j = X && X.isDepthTexture ? X.type : null, G = S(x.stencilBuffer, j), xe = x.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, le = ae(x);
      ie(x) ? o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, le, G, x.width, x.height) : N ? e.renderbufferStorageMultisample(e.RENDERBUFFER, le, G, x.width, x.height) : e.renderbufferStorage(e.RENDERBUFFER, G, x.width, x.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, xe, e.RENDERBUFFER, b);
    } else {
      const X = x.textures;
      for (let j = 0; j < X.length; j++) {
        const G = X[j], xe = s.convert(G.format, G.colorSpace), le = s.convert(G.type), Te = _(G.internalFormat, xe, le, G.colorSpace), Pe = ae(x);
        N && ie(x) === !1 ? e.renderbufferStorageMultisample(e.RENDERBUFFER, Pe, Te, x.width, x.height) : ie(x) ? o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, Pe, Te, x.width, x.height) : e.renderbufferStorage(e.RENDERBUFFER, Te, x.width, x.height);
      }
    }
    e.bindRenderbuffer(e.RENDERBUFFER, null);
  }
  function Ee(b, x) {
    if (x && x.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (n.bindFramebuffer(e.FRAMEBUFFER, b), !(x.depthTexture && x.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const N = i.get(x.depthTexture);
    N.__renderTarget = x, (!N.__webglTexture || x.depthTexture.image.width !== x.width || x.depthTexture.image.height !== x.height) && (x.depthTexture.image.width = x.width, x.depthTexture.image.height = x.height, x.depthTexture.needsUpdate = !0), Y(x.depthTexture, 0);
    const X = N.__webglTexture, j = ae(x);
    if (x.depthTexture.format === 1026) ie(x) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, X, 0, j) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, X, 0);
    else if (x.depthTexture.format === 1027) ie(x) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, X, 0, j) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, X, 0);
    else throw new Error("Unknown depthTexture format");
  }
  function qe(b) {
    const x = i.get(b), N = b.isWebGLCubeRenderTarget === !0;
    if (x.__boundDepthTexture !== b.depthTexture) {
      const X = b.depthTexture;
      if (x.__depthDisposeCallback && x.__depthDisposeCallback(), X) {
        const j = () => {
          delete x.__boundDepthTexture, delete x.__depthDisposeCallback, X.removeEventListener("dispose", j);
        };
        X.addEventListener("dispose", j), x.__depthDisposeCallback = j;
      }
      x.__boundDepthTexture = X;
    }
    if (b.depthTexture && !x.__autoAllocateDepthBuffer) {
      if (N) throw new Error("target.depthTexture not supported in Cube render targets");
      const X = b.texture.mipmaps;
      X && X.length > 0 ? Ee(x.__webglFramebuffer[0], b) : Ee(x.__webglFramebuffer, b);
    } else if (N) {
      x.__webglDepthbuffer = [];
      for (let X = 0; X < 6; X++)
        if (n.bindFramebuffer(e.FRAMEBUFFER, x.__webglFramebuffer[X]), x.__webglDepthbuffer[X] === void 0)
          x.__webglDepthbuffer[X] = e.createRenderbuffer(), Ie(x.__webglDepthbuffer[X], b, !1);
        else {
          const j = b.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, G = x.__webglDepthbuffer[X];
          e.bindRenderbuffer(e.RENDERBUFFER, G), e.framebufferRenderbuffer(e.FRAMEBUFFER, j, e.RENDERBUFFER, G);
        }
    } else {
      const X = b.texture.mipmaps;
      if (X && X.length > 0 ? n.bindFramebuffer(e.FRAMEBUFFER, x.__webglFramebuffer[0]) : n.bindFramebuffer(e.FRAMEBUFFER, x.__webglFramebuffer), x.__webglDepthbuffer === void 0)
        x.__webglDepthbuffer = e.createRenderbuffer(), Ie(x.__webglDepthbuffer, b, !1);
      else {
        const j = b.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, G = x.__webglDepthbuffer;
        e.bindRenderbuffer(e.RENDERBUFFER, G), e.framebufferRenderbuffer(e.FRAMEBUFFER, j, e.RENDERBUFFER, G);
      }
    }
    n.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function R(b, x, N) {
    const X = i.get(b);
    x !== void 0 && ye(X.__webglFramebuffer, b, b.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0), N !== void 0 && qe(b);
  }
  function J(b) {
    const x = b.texture, N = i.get(b), X = i.get(x);
    b.addEventListener("dispose", C);
    const j = b.textures, G = b.isWebGLCubeRenderTarget === !0, xe = j.length > 1;
    if (xe || (X.__webglTexture === void 0 && (X.__webglTexture = e.createTexture()), X.__version = x.version, a.memory.textures++), G) {
      N.__webglFramebuffer = [];
      for (let le = 0; le < 6; le++) if (x.mipmaps && x.mipmaps.length > 0) {
        N.__webglFramebuffer[le] = [];
        for (let Te = 0; Te < x.mipmaps.length; Te++) N.__webglFramebuffer[le][Te] = e.createFramebuffer();
      } else N.__webglFramebuffer[le] = e.createFramebuffer();
    } else {
      if (x.mipmaps && x.mipmaps.length > 0) {
        N.__webglFramebuffer = [];
        for (let le = 0; le < x.mipmaps.length; le++) N.__webglFramebuffer[le] = e.createFramebuffer();
      } else N.__webglFramebuffer = e.createFramebuffer();
      if (xe) for (let le = 0, Te = j.length; le < Te; le++) {
        const Pe = i.get(j[le]);
        Pe.__webglTexture === void 0 && (Pe.__webglTexture = e.createTexture(), a.memory.textures++);
      }
      if (b.samples > 0 && ie(b) === !1) {
        N.__webglMultisampledFramebuffer = e.createFramebuffer(), N.__webglColorRenderbuffer = [], n.bindFramebuffer(e.FRAMEBUFFER, N.__webglMultisampledFramebuffer);
        for (let le = 0; le < j.length; le++) {
          const Te = j[le];
          N.__webglColorRenderbuffer[le] = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, N.__webglColorRenderbuffer[le]);
          const Pe = s.convert(Te.format, Te.colorSpace), re = s.convert(Te.type), ge = _(Te.internalFormat, Pe, re, Te.colorSpace, b.isXRRenderTarget === !0), Re = ae(b);
          e.renderbufferStorageMultisample(e.RENDERBUFFER, Re, ge, b.width, b.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + le, e.RENDERBUFFER, N.__webglColorRenderbuffer[le]);
        }
        e.bindRenderbuffer(e.RENDERBUFFER, null), b.depthBuffer && (N.__webglDepthRenderbuffer = e.createRenderbuffer(), Ie(N.__webglDepthRenderbuffer, b, !0)), n.bindFramebuffer(e.FRAMEBUFFER, null);
      }
    }
    if (G) {
      n.bindTexture(e.TEXTURE_CUBE_MAP, X.__webglTexture), Fe(e.TEXTURE_CUBE_MAP, x);
      for (let le = 0; le < 6; le++) if (x.mipmaps && x.mipmaps.length > 0) for (let Te = 0; Te < x.mipmaps.length; Te++) ye(N.__webglFramebuffer[le][Te], b, x, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + le, Te);
      else ye(N.__webglFramebuffer[le], b, x, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + le, 0);
      m(x) && d(e.TEXTURE_CUBE_MAP), n.unbindTexture();
    } else if (xe) {
      for (let le = 0, Te = j.length; le < Te; le++) {
        const Pe = j[le], re = i.get(Pe);
        let ge = e.TEXTURE_2D;
        (b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (ge = b.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(ge, re.__webglTexture), Fe(ge, Pe), ye(N.__webglFramebuffer, b, Pe, e.COLOR_ATTACHMENT0 + le, ge, 0), m(Pe) && d(ge);
      }
      n.unbindTexture();
    } else {
      let le = e.TEXTURE_2D;
      if ((b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (le = b.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(le, X.__webglTexture), Fe(le, x), x.mipmaps && x.mipmaps.length > 0) for (let Te = 0; Te < x.mipmaps.length; Te++) ye(N.__webglFramebuffer[Te], b, x, e.COLOR_ATTACHMENT0, le, Te);
      else ye(N.__webglFramebuffer, b, x, e.COLOR_ATTACHMENT0, le, 0);
      m(x) && d(le), n.unbindTexture();
    }
    b.depthBuffer && qe(b);
  }
  function $(b) {
    const x = b.textures;
    for (let N = 0, X = x.length; N < X; N++) {
      const j = x[N];
      if (m(j)) {
        const G = T(b), xe = i.get(j).__webglTexture;
        n.bindTexture(G, xe), d(G), n.unbindTexture();
      }
    }
  }
  const te = [], Z = [];
  function ue(b) {
    if (b.samples > 0) {
      if (ie(b) === !1) {
        const x = b.textures, N = b.width, X = b.height;
        let j = e.COLOR_BUFFER_BIT;
        const G = b.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, xe = i.get(b), le = x.length > 1;
        if (le) for (let Pe = 0; Pe < x.length; Pe++)
          n.bindFramebuffer(e.FRAMEBUFFER, xe.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Pe, e.RENDERBUFFER, null), n.bindFramebuffer(e.FRAMEBUFFER, xe.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Pe, e.TEXTURE_2D, null, 0);
        n.bindFramebuffer(e.READ_FRAMEBUFFER, xe.__webglMultisampledFramebuffer);
        const Te = b.texture.mipmaps;
        Te && Te.length > 0 ? n.bindFramebuffer(e.DRAW_FRAMEBUFFER, xe.__webglFramebuffer[0]) : n.bindFramebuffer(e.DRAW_FRAMEBUFFER, xe.__webglFramebuffer);
        for (let Pe = 0; Pe < x.length; Pe++) {
          if (b.resolveDepthBuffer && (b.depthBuffer && (j |= e.DEPTH_BUFFER_BIT), b.stencilBuffer && b.resolveStencilBuffer && (j |= e.STENCIL_BUFFER_BIT)), le) {
            e.framebufferRenderbuffer(e.READ_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, xe.__webglColorRenderbuffer[Pe]);
            const re = i.get(x[Pe]).__webglTexture;
            e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, re, 0);
          }
          e.blitFramebuffer(0, 0, N, X, 0, 0, N, X, j, e.NEAREST), l === !0 && (te.length = 0, Z.length = 0, te.push(e.COLOR_ATTACHMENT0 + Pe), b.depthBuffer && b.resolveDepthBuffer === !1 && (te.push(G), Z.push(G), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, Z)), e.invalidateFramebuffer(e.READ_FRAMEBUFFER, te));
        }
        if (n.bindFramebuffer(e.READ_FRAMEBUFFER, null), n.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), le) for (let Pe = 0; Pe < x.length; Pe++) {
          n.bindFramebuffer(e.FRAMEBUFFER, xe.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Pe, e.RENDERBUFFER, xe.__webglColorRenderbuffer[Pe]);
          const re = i.get(x[Pe]).__webglTexture;
          n.bindFramebuffer(e.FRAMEBUFFER, xe.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Pe, e.TEXTURE_2D, re, 0);
        }
        n.bindFramebuffer(e.DRAW_FRAMEBUFFER, xe.__webglMultisampledFramebuffer);
      } else if (b.depthBuffer && b.resolveDepthBuffer === !1 && l) {
        const x = b.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
        e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [x]);
      }
    }
  }
  function ae(b) {
    return Math.min(r.maxSamples, b.samples);
  }
  function ie(b) {
    const x = i.get(b);
    return b.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && x.__useRenderToTexture !== !1;
  }
  function Be(b) {
    const x = a.render.frame;
    h.get(b) !== x && (h.set(b, x), b.update());
  }
  function ze(b, x) {
    const N = b.colorSpace, X = b.format, j = b.type;
    return b.isCompressedTexture === !0 || b.isVideoTexture === !0 || N !== "srgb-linear" && N !== "" && (je.getTransfer(N) === "srgb" ? (X !== 1023 || j !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", N)), x;
  }
  function Ge(b) {
    return typeof HTMLImageElement < "u" && b instanceof HTMLImageElement ? (c.width = b.naturalWidth || b.width, c.height = b.naturalHeight || b.height) : typeof VideoFrame < "u" && b instanceof VideoFrame ? (c.width = b.displayWidth, c.height = b.displayHeight) : (c.width = b.width, c.height = b.height), c;
  }
  this.allocateTextureUnit = H, this.resetTextureUnits = F, this.setTexture2D = Y, this.setTexture2DArray = k, this.setTexture3D = ee, this.setTextureCube = W, this.rebindTextures = R, this.setupRenderTarget = J, this.updateRenderTargetMipmap = $, this.updateMultisampleRenderTarget = ue, this.setupDepthRenderbuffer = qe, this.setupFrameBufferTexture = ye, this.useMultisampledRTT = ie;
}
function xd(e, t) {
  function n(i, r = "") {
    let s;
    const a = je.getTransfer(r);
    if (i === 1009) return e.UNSIGNED_BYTE;
    if (i === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
    if (i === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
    if (i === 35902) return e.UNSIGNED_INT_5_9_9_9_REV;
    if (i === 35899) return e.UNSIGNED_INT_10F_11F_11F_REV;
    if (i === 1010) return e.BYTE;
    if (i === 1011) return e.SHORT;
    if (i === 1012) return e.UNSIGNED_SHORT;
    if (i === 1013) return e.INT;
    if (i === 1014) return e.UNSIGNED_INT;
    if (i === 1015) return e.FLOAT;
    if (i === 1016) return e.HALF_FLOAT;
    if (i === 1021) return e.ALPHA;
    if (i === 1022) return e.RGB;
    if (i === 1023) return e.RGBA;
    if (i === 1026) return e.DEPTH_COMPONENT;
    if (i === 1027) return e.DEPTH_STENCIL;
    if (i === 1028) return e.RED;
    if (i === 1029) return e.RED_INTEGER;
    if (i === 1030) return e.RG;
    if (i === 1031) return e.RG_INTEGER;
    if (i === 1033) return e.RGBA_INTEGER;
    if (i === 33776 || i === 33777 || i === 33778 || i === 33779) if (a === "srgb")
      if (s = t.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
        if (i === 33776) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (i === 33777) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (i === 33778) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (i === 33779) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
    else if (s = t.get("WEBGL_compressed_texture_s3tc"), s !== null) {
      if (i === 33776) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (i === 33777) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (i === 33778) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (i === 33779) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (i === 35840 || i === 35841 || i === 35842 || i === 35843)
      if (s = t.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (i === 35840) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (i === 35841) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (i === 35842) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (i === 35843) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (i === 36196 || i === 37492 || i === 37496)
      if (s = t.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (i === 36196 || i === 37492) return a === "srgb" ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (i === 37496) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (i === 37808 || i === 37809 || i === 37810 || i === 37811 || i === 37812 || i === 37813 || i === 37814 || i === 37815 || i === 37816 || i === 37817 || i === 37818 || i === 37819 || i === 37820 || i === 37821)
      if (s = t.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (i === 37808) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (i === 37809) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (i === 37810) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (i === 37811) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (i === 37812) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (i === 37813) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (i === 37814) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (i === 37815) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (i === 37816) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (i === 37817) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (i === 37818) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (i === 37819) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (i === 37820) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (i === 37821) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (i === 36492 || i === 36494 || i === 36495)
      if (s = t.get("EXT_texture_compression_bptc"), s !== null) {
        if (i === 36492) return a === "srgb" ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (i === 36494) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (i === 36495) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (i === 36283 || i === 36284 || i === 36285 || i === 36286)
      if (s = t.get("EXT_texture_compression_rgtc"), s !== null) {
        if (i === 36283) return s.COMPRESSED_RED_RGTC1_EXT;
        if (i === 36284) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (i === 36285) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (i === 36286) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return i === 1020 ? e.UNSIGNED_INT_24_8 : e[i] !== void 0 ? e[i] : null;
  }
  return { convert: n };
}
var yd = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Md = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`, Sd = class {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t) {
    if (this.texture === null) {
      const n = new Lo(e.texture);
      (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new hn({
        vertexShader: yd,
        fragmentShader: Md,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Pt(new $o(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}, Ed = class extends Cn {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, s = null, a = "local-floor", o = 1, l = null, c = null, h = null, u = null, f = null, p = null;
    const v = typeof XRWebGLBinding < "u", g = new Sd(), m = {}, d = t.getContextAttributes();
    let T = null, _ = null;
    const S = [], L = [], A = new oe();
    let C = null;
    const U = new At();
    U.viewport = new et();
    const E = new At();
    E.viewport = new et();
    const M = [U, E], w = new fu();
    let F = null, H = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(q) {
      let he = S[q];
      return he === void 0 && (he = new Jr(), S[q] = he), he.getTargetRaySpace();
    }, this.getControllerGrip = function(q) {
      let he = S[q];
      return he === void 0 && (he = new Jr(), S[q] = he), he.getGripSpace();
    }, this.getHand = function(q) {
      let he = S[q];
      return he === void 0 && (he = new Jr(), S[q] = he), he.getHandSpace();
    };
    function B(q) {
      const he = L.indexOf(q.inputSource);
      if (he === -1) return;
      const fe = S[he];
      fe !== void 0 && (fe.update(q.inputSource, q.frame, l || s), fe.dispatchEvent({
        type: q.type,
        data: q.inputSource
      }));
    }
    function Y() {
      i.removeEventListener("select", B), i.removeEventListener("selectstart", B), i.removeEventListener("selectend", B), i.removeEventListener("squeeze", B), i.removeEventListener("squeezestart", B), i.removeEventListener("squeezeend", B), i.removeEventListener("end", Y), i.removeEventListener("inputsourceschange", k);
      for (let q = 0; q < S.length; q++) {
        const he = L[q];
        he !== null && (L[q] = null, S[q].disconnect(he));
      }
      F = null, H = null, g.reset();
      for (const q in m) delete m[q];
      e.setRenderTarget(T), f = null, u = null, h = null, i = null, _ = null, Ze.stop(), n.isPresenting = !1, e.setPixelRatio(C), e.setSize(A.width, A.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(q) {
      r = q, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(q) {
      a = q, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return l || s;
    }, this.setReferenceSpace = function(q) {
      l = q;
    }, this.getBaseLayer = function() {
      return u !== null ? u : f;
    }, this.getBinding = function() {
      return h === null && v && (h = new XRWebGLBinding(i, t)), h;
    }, this.getFrame = function() {
      return p;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(q) {
      if (i = q, i !== null) {
        if (T = e.getRenderTarget(), i.addEventListener("select", B), i.addEventListener("selectstart", B), i.addEventListener("selectend", B), i.addEventListener("squeeze", B), i.addEventListener("squeezestart", B), i.addEventListener("squeezeend", B), i.addEventListener("end", Y), i.addEventListener("inputsourceschange", k), d.xrCompatible !== !0 && await t.makeXRCompatible(), C = e.getPixelRatio(), e.getSize(A), v && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let he = null, fe = null, ye = null;
          d.depth && (ye = d.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, he = d.stencil ? ro : io, fe = d.stencil ? wl : Ss);
          const Ie = {
            colorFormat: t.RGBA8,
            depthFormat: ye,
            scaleFactor: r
          };
          h = this.getBinding(), u = h.createProjectionLayer(Ie), i.updateRenderState({ layers: [u] }), e.setPixelRatio(1), e.setSize(u.textureWidth, u.textureHeight, !1), _ = new wn(u.textureWidth, u.textureHeight, {
            format: $n,
            type: Kn,
            depthTexture: new Po(u.textureWidth, u.textureHeight, fe, void 0, void 0, void 0, void 0, void 0, void 0, he),
            stencilBuffer: d.stencil,
            colorSpace: e.outputColorSpace,
            samples: d.antialias ? 4 : 0,
            resolveDepthBuffer: u.ignoreDepthValues === !1,
            resolveStencilBuffer: u.ignoreDepthValues === !1
          });
        } else {
          const he = {
            antialias: d.antialias,
            alpha: !0,
            depth: d.depth,
            stencil: d.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, he), i.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), _ = new wn(f.framebufferWidth, f.framebufferHeight, {
            format: $n,
            type: Kn,
            colorSpace: e.outputColorSpace,
            stencilBuffer: d.stencil,
            resolveDepthBuffer: f.ignoreDepthValues === !1,
            resolveStencilBuffer: f.ignoreDepthValues === !1
          });
        }
        _.isXRRenderTarget = !0, this.setFoveation(o), l = null, s = await i.requestReferenceSpace(a), Ze.setContext(i), Ze.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null) return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return g.getDepthTexture();
    };
    function k(q) {
      for (let he = 0; he < q.removed.length; he++) {
        const fe = q.removed[he], ye = L.indexOf(fe);
        ye >= 0 && (L[ye] = null, S[ye].disconnect(fe));
      }
      for (let he = 0; he < q.added.length; he++) {
        const fe = q.added[he];
        let ye = L.indexOf(fe);
        if (ye === -1) {
          for (let Ee = 0; Ee < S.length; Ee++) if (Ee >= L.length) {
            L.push(fe), ye = Ee;
            break;
          } else if (L[Ee] === null) {
            L[Ee] = fe, ye = Ee;
            break;
          }
          if (ye === -1) break;
        }
        const Ie = S[ye];
        Ie && Ie.connect(fe);
      }
    }
    const ee = new P(), W = new P();
    function se(q, he, fe) {
      ee.setFromMatrixPosition(he.matrixWorld), W.setFromMatrixPosition(fe.matrixWorld);
      const ye = ee.distanceTo(W), Ie = he.projectionMatrix.elements, Ee = fe.projectionMatrix.elements, qe = Ie[14] / (Ie[10] - 1), R = Ie[14] / (Ie[10] + 1), J = (Ie[9] + 1) / Ie[5], $ = (Ie[9] - 1) / Ie[5], te = (Ie[8] - 1) / Ie[0], Z = (Ee[8] + 1) / Ee[0], ue = qe * te, ae = qe * Z, ie = ye / (-te + Z), Be = ie * -te;
      if (he.matrixWorld.decompose(q.position, q.quaternion, q.scale), q.translateX(Be), q.translateZ(ie), q.matrixWorld.compose(q.position, q.quaternion, q.scale), q.matrixWorldInverse.copy(q.matrixWorld).invert(), Ie[10] === -1)
        q.projectionMatrix.copy(he.projectionMatrix), q.projectionMatrixInverse.copy(he.projectionMatrixInverse);
      else {
        const ze = qe + ie, Ge = R + ie, b = ue - Be, x = ae + (ye - Be), N = J * R / Ge * ze, X = $ * R / Ge * ze;
        q.projectionMatrix.makePerspective(b, x, N, X, ze, Ge), q.projectionMatrixInverse.copy(q.projectionMatrix).invert();
      }
    }
    function pe(q, he) {
      he === null ? q.matrixWorld.copy(q.matrix) : q.matrixWorld.multiplyMatrices(he.matrixWorld, q.matrix), q.matrixWorldInverse.copy(q.matrixWorld).invert();
    }
    this.updateCamera = function(q) {
      if (i === null) return;
      let he = q.near, fe = q.far;
      g.texture !== null && (g.depthNear > 0 && (he = g.depthNear), g.depthFar > 0 && (fe = g.depthFar)), w.near = E.near = U.near = he, w.far = E.far = U.far = fe, (F !== w.near || H !== w.far) && (i.updateRenderState({
        depthNear: w.near,
        depthFar: w.far
      }), F = w.near, H = w.far), w.layers.mask = q.layers.mask | 6, U.layers.mask = w.layers.mask & 3, E.layers.mask = w.layers.mask & 5;
      const ye = q.parent, Ie = w.cameras;
      pe(w, ye);
      for (let Ee = 0; Ee < Ie.length; Ee++) pe(Ie[Ee], ye);
      Ie.length === 2 ? se(w, U, E) : w.projectionMatrix.copy(U.projectionMatrix), De(q, w, ye);
    };
    function De(q, he, fe) {
      fe === null ? q.matrix.copy(he.matrixWorld) : (q.matrix.copy(fe.matrixWorld), q.matrix.invert(), q.matrix.multiply(he.matrixWorld)), q.matrix.decompose(q.position, q.quaternion, q.scale), q.updateMatrixWorld(!0), q.projectionMatrix.copy(he.projectionMatrix), q.projectionMatrixInverse.copy(he.projectionMatrixInverse), q.isPerspectiveCamera && (q.fov = Qn * 2 * Math.atan(1 / q.projectionMatrix.elements[5]), q.zoom = 1);
    }
    this.getCamera = function() {
      return w;
    }, this.getFoveation = function() {
      if (!(u === null && f === null))
        return o;
    }, this.setFoveation = function(q) {
      o = q, u !== null && (u.fixedFoveation = q), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = q);
    }, this.hasDepthSensing = function() {
      return g.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return g.getMesh(w);
    }, this.getCameraTexture = function(q) {
      return m[q];
    };
    let Fe = null;
    function nt(q, he) {
      if (c = he.getViewerPose(l || s), p = he, c !== null) {
        const fe = c.views;
        f !== null && (e.setRenderTargetFramebuffer(_, f.framebuffer), e.setRenderTarget(_));
        let ye = !1;
        fe.length !== w.cameras.length && (w.cameras.length = 0, ye = !0);
        for (let Ee = 0; Ee < fe.length; Ee++) {
          const qe = fe[Ee];
          let R = null;
          if (f !== null) R = f.getViewport(qe);
          else {
            const $ = h.getViewSubImage(u, qe);
            R = $.viewport, Ee === 0 && (e.setRenderTargetTextures(_, $.colorTexture, $.depthStencilTexture), e.setRenderTarget(_));
          }
          let J = M[Ee];
          J === void 0 && (J = new At(), J.layers.enable(Ee), J.viewport = new et(), M[Ee] = J), J.matrix.fromArray(qe.transform.matrix), J.matrix.decompose(J.position, J.quaternion, J.scale), J.projectionMatrix.fromArray(qe.projectionMatrix), J.projectionMatrixInverse.copy(J.projectionMatrix).invert(), J.viewport.set(R.x, R.y, R.width, R.height), Ee === 0 && (w.matrix.copy(J.matrix), w.matrix.decompose(w.position, w.quaternion, w.scale)), ye === !0 && w.cameras.push(J);
        }
        const Ie = i.enabledFeatures;
        if (Ie && Ie.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && v) {
          h = n.getBinding();
          const Ee = h.getDepthInformation(fe[0]);
          Ee && Ee.isValid && Ee.texture && g.init(Ee, i.renderState);
        }
        if (Ie && Ie.includes("camera-access") && v) {
          e.state.unbindTexture(), h = n.getBinding();
          for (let Ee = 0; Ee < fe.length; Ee++) {
            const qe = fe[Ee].camera;
            if (qe) {
              let R = m[qe];
              R || (R = new Lo(), m[qe] = R);
              const J = h.getCameraImage(qe);
              R.sourceTexture = J;
            }
          }
        }
      }
      for (let fe = 0; fe < S.length; fe++) {
        const ye = L[fe], Ie = S[fe];
        ye !== null && Ie !== void 0 && Ie.update(ye, he, l || s);
      }
      Fe && Fe(q, he), he.detectedPlanes && n.dispatchEvent({
        type: "planesdetected",
        data: he
      }), p = null;
    }
    const Ze = new al();
    Ze.setAnimationLoop(nt), this.setAnimationLoop = function(q) {
      Fe = q;
    }, this.dispose = function() {
    };
  }
}, yn = /* @__PURE__ */ new tn(), Td = /* @__PURE__ */ new Ye();
function bd(e, t) {
  function n(m, d) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), d.value.copy(m.matrix);
  }
  function i(m, d) {
    d.color.getRGB(m.fogColor.value, Mo(e)), d.isFog ? (m.fogNear.value = d.near, m.fogFar.value = d.far) : d.isFogExp2 && (m.fogDensity.value = d.density);
  }
  function r(m, d, T, _, S) {
    d.isMeshBasicMaterial || d.isMeshLambertMaterial ? s(m, d) : d.isMeshToonMaterial ? (s(m, d), u(m, d)) : d.isMeshPhongMaterial ? (s(m, d), h(m, d)) : d.isMeshStandardMaterial ? (s(m, d), f(m, d), d.isMeshPhysicalMaterial && p(m, d, S)) : d.isMeshMatcapMaterial ? (s(m, d), v(m, d)) : d.isMeshDepthMaterial ? s(m, d) : d.isMeshDistanceMaterial ? (s(m, d), g(m, d)) : d.isMeshNormalMaterial ? s(m, d) : d.isLineBasicMaterial ? (a(m, d), d.isLineDashedMaterial && o(m, d)) : d.isPointsMaterial ? l(m, d, T, _) : d.isSpriteMaterial ? c(m, d) : d.isShadowMaterial ? (m.color.value.copy(d.color), m.opacity.value = d.opacity) : d.isShaderMaterial && (d.uniformsNeedUpdate = !1);
  }
  function s(m, d) {
    m.opacity.value = d.opacity, d.color && m.diffuse.value.copy(d.color), d.emissive && m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity), d.map && (m.map.value = d.map, n(d.map, m.mapTransform)), d.alphaMap && (m.alphaMap.value = d.alphaMap, n(d.alphaMap, m.alphaMapTransform)), d.bumpMap && (m.bumpMap.value = d.bumpMap, n(d.bumpMap, m.bumpMapTransform), m.bumpScale.value = d.bumpScale, d.side === 1 && (m.bumpScale.value *= -1)), d.normalMap && (m.normalMap.value = d.normalMap, n(d.normalMap, m.normalMapTransform), m.normalScale.value.copy(d.normalScale), d.side === 1 && m.normalScale.value.negate()), d.displacementMap && (m.displacementMap.value = d.displacementMap, n(d.displacementMap, m.displacementMapTransform), m.displacementScale.value = d.displacementScale, m.displacementBias.value = d.displacementBias), d.emissiveMap && (m.emissiveMap.value = d.emissiveMap, n(d.emissiveMap, m.emissiveMapTransform)), d.specularMap && (m.specularMap.value = d.specularMap, n(d.specularMap, m.specularMapTransform)), d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest);
    const T = t.get(d), _ = T.envMap, S = T.envMapRotation;
    _ && (m.envMap.value = _, yn.copy(S), yn.x *= -1, yn.y *= -1, yn.z *= -1, _.isCubeTexture && _.isRenderTargetTexture === !1 && (yn.y *= -1, yn.z *= -1), m.envMapRotation.value.setFromMatrix4(Td.makeRotationFromEuler(yn)), m.flipEnvMap.value = _.isCubeTexture && _.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = d.reflectivity, m.ior.value = d.ior, m.refractionRatio.value = d.refractionRatio), d.lightMap && (m.lightMap.value = d.lightMap, m.lightMapIntensity.value = d.lightMapIntensity, n(d.lightMap, m.lightMapTransform)), d.aoMap && (m.aoMap.value = d.aoMap, m.aoMapIntensity.value = d.aoMapIntensity, n(d.aoMap, m.aoMapTransform));
  }
  function a(m, d) {
    m.diffuse.value.copy(d.color), m.opacity.value = d.opacity, d.map && (m.map.value = d.map, n(d.map, m.mapTransform));
  }
  function o(m, d) {
    m.dashSize.value = d.dashSize, m.totalSize.value = d.dashSize + d.gapSize, m.scale.value = d.scale;
  }
  function l(m, d, T, _) {
    m.diffuse.value.copy(d.color), m.opacity.value = d.opacity, m.size.value = d.size * T, m.scale.value = _ * 0.5, d.map && (m.map.value = d.map, n(d.map, m.uvTransform)), d.alphaMap && (m.alphaMap.value = d.alphaMap, n(d.alphaMap, m.alphaMapTransform)), d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest);
  }
  function c(m, d) {
    m.diffuse.value.copy(d.color), m.opacity.value = d.opacity, m.rotation.value = d.rotation, d.map && (m.map.value = d.map, n(d.map, m.mapTransform)), d.alphaMap && (m.alphaMap.value = d.alphaMap, n(d.alphaMap, m.alphaMapTransform)), d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest);
  }
  function h(m, d) {
    m.specular.value.copy(d.specular), m.shininess.value = Math.max(d.shininess, 1e-4);
  }
  function u(m, d) {
    d.gradientMap && (m.gradientMap.value = d.gradientMap);
  }
  function f(m, d) {
    m.metalness.value = d.metalness, d.metalnessMap && (m.metalnessMap.value = d.metalnessMap, n(d.metalnessMap, m.metalnessMapTransform)), m.roughness.value = d.roughness, d.roughnessMap && (m.roughnessMap.value = d.roughnessMap, n(d.roughnessMap, m.roughnessMapTransform)), d.envMap && (m.envMapIntensity.value = d.envMapIntensity);
  }
  function p(m, d, T) {
    m.ior.value = d.ior, d.sheen > 0 && (m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen), m.sheenRoughness.value = d.sheenRoughness, d.sheenColorMap && (m.sheenColorMap.value = d.sheenColorMap, n(d.sheenColorMap, m.sheenColorMapTransform)), d.sheenRoughnessMap && (m.sheenRoughnessMap.value = d.sheenRoughnessMap, n(d.sheenRoughnessMap, m.sheenRoughnessMapTransform))), d.clearcoat > 0 && (m.clearcoat.value = d.clearcoat, m.clearcoatRoughness.value = d.clearcoatRoughness, d.clearcoatMap && (m.clearcoatMap.value = d.clearcoatMap, n(d.clearcoatMap, m.clearcoatMapTransform)), d.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = d.clearcoatRoughnessMap, n(d.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), d.clearcoatNormalMap && (m.clearcoatNormalMap.value = d.clearcoatNormalMap, n(d.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale), d.side === 1 && m.clearcoatNormalScale.value.negate())), d.dispersion > 0 && (m.dispersion.value = d.dispersion), d.iridescence > 0 && (m.iridescence.value = d.iridescence, m.iridescenceIOR.value = d.iridescenceIOR, m.iridescenceThicknessMinimum.value = d.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = d.iridescenceThicknessRange[1], d.iridescenceMap && (m.iridescenceMap.value = d.iridescenceMap, n(d.iridescenceMap, m.iridescenceMapTransform)), d.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = d.iridescenceThicknessMap, n(d.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), d.transmission > 0 && (m.transmission.value = d.transmission, m.transmissionSamplerMap.value = T.texture, m.transmissionSamplerSize.value.set(T.width, T.height), d.transmissionMap && (m.transmissionMap.value = d.transmissionMap, n(d.transmissionMap, m.transmissionMapTransform)), m.thickness.value = d.thickness, d.thicknessMap && (m.thicknessMap.value = d.thicknessMap, n(d.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = d.attenuationDistance, m.attenuationColor.value.copy(d.attenuationColor)), d.anisotropy > 0 && (m.anisotropyVector.value.set(d.anisotropy * Math.cos(d.anisotropyRotation), d.anisotropy * Math.sin(d.anisotropyRotation)), d.anisotropyMap && (m.anisotropyMap.value = d.anisotropyMap, n(d.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = d.specularIntensity, m.specularColor.value.copy(d.specularColor), d.specularColorMap && (m.specularColorMap.value = d.specularColorMap, n(d.specularColorMap, m.specularColorMapTransform)), d.specularIntensityMap && (m.specularIntensityMap.value = d.specularIntensityMap, n(d.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function v(m, d) {
    d.matcap && (m.matcap.value = d.matcap);
  }
  function g(m, d) {
    const T = t.get(d).light;
    m.referencePosition.value.setFromMatrixPosition(T.matrixWorld), m.nearDistance.value = T.shadow.camera.near, m.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: i,
    refreshMaterialUniforms: r
  };
}
function Ad(e, t, n, i) {
  let r = {}, s = {}, a = [];
  const o = e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(T, _) {
    const S = _.program;
    i.uniformBlockBinding(T, S);
  }
  function c(T, _) {
    let S = r[T.id];
    S === void 0 && (v(T), S = h(T), r[T.id] = S, T.addEventListener("dispose", m));
    const L = _.program;
    i.updateUBOMapping(T, L);
    const A = t.render.frame;
    s[T.id] !== A && (f(T), s[T.id] = A);
  }
  function h(T) {
    const _ = u();
    T.__bindingPointIndex = _;
    const S = e.createBuffer(), L = T.__size, A = T.usage;
    return e.bindBuffer(e.UNIFORM_BUFFER, S), e.bufferData(e.UNIFORM_BUFFER, L, A), e.bindBuffer(e.UNIFORM_BUFFER, null), e.bindBufferBase(e.UNIFORM_BUFFER, _, S), S;
  }
  function u() {
    for (let T = 0; T < o; T++) if (a.indexOf(T) === -1)
      return a.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(T) {
    const _ = r[T.id], S = T.uniforms, L = T.__cache;
    e.bindBuffer(e.UNIFORM_BUFFER, _);
    for (let A = 0, C = S.length; A < C; A++) {
      const U = Array.isArray(S[A]) ? S[A] : [S[A]];
      for (let E = 0, M = U.length; E < M; E++) {
        const w = U[E];
        if (p(w, A, E, L) === !0) {
          const F = w.__offset, H = Array.isArray(w.value) ? w.value : [w.value];
          let B = 0;
          for (let Y = 0; Y < H.length; Y++) {
            const k = H[Y], ee = g(k);
            typeof k == "number" || typeof k == "boolean" ? (w.__data[0] = k, e.bufferSubData(e.UNIFORM_BUFFER, F + B, w.__data)) : k.isMatrix3 ? (w.__data[0] = k.elements[0], w.__data[1] = k.elements[1], w.__data[2] = k.elements[2], w.__data[3] = 0, w.__data[4] = k.elements[3], w.__data[5] = k.elements[4], w.__data[6] = k.elements[5], w.__data[7] = 0, w.__data[8] = k.elements[6], w.__data[9] = k.elements[7], w.__data[10] = k.elements[8], w.__data[11] = 0) : (k.toArray(w.__data, B), B += ee.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          e.bufferSubData(e.UNIFORM_BUFFER, F, w.__data);
        }
      }
    }
    e.bindBuffer(e.UNIFORM_BUFFER, null);
  }
  function p(T, _, S, L) {
    const A = T.value, C = _ + "_" + S;
    if (L[C] === void 0)
      return typeof A == "number" || typeof A == "boolean" ? L[C] = A : L[C] = A.clone(), !0;
    {
      const U = L[C];
      if (typeof A == "number" || typeof A == "boolean") {
        if (U !== A)
          return L[C] = A, !0;
      } else if (U.equals(A) === !1)
        return U.copy(A), !0;
    }
    return !1;
  }
  function v(T) {
    const _ = T.uniforms;
    let S = 0;
    const L = 16;
    for (let C = 0, U = _.length; C < U; C++) {
      const E = Array.isArray(_[C]) ? _[C] : [_[C]];
      for (let M = 0, w = E.length; M < w; M++) {
        const F = E[M], H = Array.isArray(F.value) ? F.value : [F.value];
        for (let B = 0, Y = H.length; B < Y; B++) {
          const k = H[B], ee = g(k), W = S % L, se = W % ee.boundary, pe = W + se;
          S += se, pe !== 0 && L - pe < ee.storage && (S += L - pe), F.__data = new Float32Array(ee.storage / Float32Array.BYTES_PER_ELEMENT), F.__offset = S, S += ee.storage;
        }
      }
    }
    const A = S % L;
    return A > 0 && (S += L - A), T.__size = S, T.__cache = {}, this;
  }
  function g(T) {
    const _ = {
      boundary: 0,
      storage: 0
    };
    return typeof T == "number" || typeof T == "boolean" ? (_.boundary = 4, _.storage = 4) : T.isVector2 ? (_.boundary = 8, _.storage = 8) : T.isVector3 || T.isColor ? (_.boundary = 16, _.storage = 12) : T.isVector4 ? (_.boundary = 16, _.storage = 16) : T.isMatrix3 ? (_.boundary = 48, _.storage = 48) : T.isMatrix4 ? (_.boundary = 64, _.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), _;
  }
  function m(T) {
    const _ = T.target;
    _.removeEventListener("dispose", m);
    const S = a.indexOf(_.__bindingPointIndex);
    a.splice(S, 1), e.deleteBuffer(r[_.id]), delete r[_.id], delete s[_.id];
  }
  function d() {
    for (const T in r) e.deleteBuffer(r[T]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: d
  };
}
var up = class {
  constructor(e = {}) {
    const { canvas: t = Uc(), context: n = null, depth: i = !0, stencil: r = !1, alpha: s = !1, antialias: a = !1, premultipliedAlpha: o = !0, preserveDrawingBuffer: l = !1, powerPreference: c = "default", failIfMajorPerformanceCaveat: h = !1, reversedDepthBuffer: u = !1 } = e;
    this.isWebGLRenderer = !0;
    let f;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      f = n.getContextAttributes().alpha;
    } else f = s;
    const p = new Uint32Array(4), v = new Int32Array(4);
    let g = null, m = null;
    const d = [], T = [];
    this.domElement = t, this.debug = {
      checkShaderErrors: !0,
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = 0, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const _ = this;
    let S = !1;
    this._outputColorSpace = zt;
    let L = 0, A = 0, C = null, U = -1, E = null;
    const M = new et(), w = new et();
    let F = null;
    const H = new ke(0);
    let B = 0, Y = t.width, k = t.height, ee = 1, W = null, se = null;
    const pe = new et(0, 0, Y, k), De = new et(0, 0, Y, k);
    let Fe = !1;
    const nt = new Rs();
    let Ze = !1, q = !1;
    const he = new Ye(), fe = new P(), ye = new et(), Ie = {
      background: null,
      fog: null,
      environment: null,
      overrideMaterial: null,
      isScene: !0
    };
    let Ee = !1;
    function qe() {
      return C === null ? ee : 1;
    }
    let R = n;
    function J(y, O) {
      return t.getContext(y, O);
    }
    try {
      const y = {
        alpha: !0,
        depth: i,
        stencil: r,
        antialias: a,
        premultipliedAlpha: o,
        preserveDrawingBuffer: l,
        powerPreference: c,
        failIfMajorPerformanceCaveat: h
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", "three.js r180"), t.addEventListener("webglcontextlost", me, !1), t.addEventListener("webglcontextrestored", ce, !1), t.addEventListener("webglcontextcreationerror", Ae, !1), R === null) {
        const O = "webgl2";
        if (R = J(O, y), R === null) throw J(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (y) {
      throw console.error("THREE.WebGLRenderer: " + y.message), y;
    }
    let $, te, Z, ue, ae, ie, Be, ze, Ge, b, x, N, X, j, G, xe, le, Te, Pe, re, ge, Re, Ce, ve;
    function We() {
      $ = new Ou(R), $.init(), Re = new xd(R, $), te = new Cu(R, $, e, Re), Z = new vd(R, $), te.reversedDepthBuffer && u && Z.buffers.depth.setReversed(!0), ue = new zu(R), ae = new rd(), ie = new _d(R, $, Z, ae, te, Re, ue), Be = new Lu(_), ze = new Nu(_), Ge = new Tu(R), Ce = new wu(R, Ge), b = new Fu(R, Ge, ue, Ce), x = new Hu(R, b, Ge, ue), Pe = new Vu(R, te, ie), xe = new Pu(ae), N = new id(_, Be, ze, $, te, Ce, xe), X = new bd(_, ae), j = new ad(), G = new fd($), Te = new Au(_, Be, ze, Z, x, f, o), le = new md(_, x, te), ve = new Ad(R, ue, te, Z), re = new Ru(R, $, ue), ge = new Bu(R, $, ue), ue.programs = N.programs, _.capabilities = te, _.extensions = $, _.properties = ae, _.renderLists = j, _.shadowMap = le, _.state = Z, _.info = ue;
    }
    We();
    const I = new Ed(_, R);
    this.xr = I, this.getContext = function() {
      return R;
    }, this.getContextAttributes = function() {
      return R.getContextAttributes();
    }, this.forceContextLoss = function() {
      const y = $.get("WEBGL_lose_context");
      y && y.loseContext();
    }, this.forceContextRestore = function() {
      const y = $.get("WEBGL_lose_context");
      y && y.restoreContext();
    }, this.getPixelRatio = function() {
      return ee;
    }, this.setPixelRatio = function(y) {
      y !== void 0 && (ee = y, this.setSize(Y, k, !1));
    }, this.getSize = function(y) {
      return y.set(Y, k);
    }, this.setSize = function(y, O, z = !0) {
      if (I.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Y = y, k = O, t.width = Math.floor(y * ee), t.height = Math.floor(O * ee), z === !0 && (t.style.width = y + "px", t.style.height = O + "px"), this.setViewport(0, 0, y, O);
    }, this.getDrawingBufferSize = function(y) {
      return y.set(Y * ee, k * ee).floor();
    }, this.setDrawingBufferSize = function(y, O, z) {
      Y = y, k = O, ee = z, t.width = Math.floor(y * z), t.height = Math.floor(O * z), this.setViewport(0, 0, y, O);
    }, this.getCurrentViewport = function(y) {
      return y.copy(M);
    }, this.getViewport = function(y) {
      return y.copy(pe);
    }, this.setViewport = function(y, O, z, V) {
      y.isVector4 ? pe.set(y.x, y.y, y.z, y.w) : pe.set(y, O, z, V), Z.viewport(M.copy(pe).multiplyScalar(ee).round());
    }, this.getScissor = function(y) {
      return y.copy(De);
    }, this.setScissor = function(y, O, z, V) {
      y.isVector4 ? De.set(y.x, y.y, y.z, y.w) : De.set(y, O, z, V), Z.scissor(w.copy(De).multiplyScalar(ee).round());
    }, this.getScissorTest = function() {
      return Fe;
    }, this.setScissorTest = function(y) {
      Z.setScissorTest(Fe = y);
    }, this.setOpaqueSort = function(y) {
      W = y;
    }, this.setTransparentSort = function(y) {
      se = y;
    }, this.getClearColor = function(y) {
      return y.copy(Te.getClearColor());
    }, this.setClearColor = function() {
      Te.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Te.getClearAlpha();
    }, this.setClearAlpha = function() {
      Te.setClearAlpha(...arguments);
    }, this.clear = function(y = !0, O = !0, z = !0) {
      let V = 0;
      if (y) {
        let D = !1;
        if (C !== null) {
          const Q = C.texture.format;
          D = Q === 1033 || Q === 1031 || Q === 1029;
        }
        if (D) {
          const Q = C.texture.type, _e = Q === 1009 || Q === 1014 || Q === 1012 || Q === 1020 || Q === 1017 || Q === 1018, Me = Te.getClearColor(), Se = Te.getClearAlpha(), Ne = Me.r, Oe = Me.g, Ue = Me.b;
          _e ? (p[0] = Ne, p[1] = Oe, p[2] = Ue, p[3] = Se, R.clearBufferuiv(R.COLOR, 0, p)) : (v[0] = Ne, v[1] = Oe, v[2] = Ue, v[3] = Se, R.clearBufferiv(R.COLOR, 0, v));
        } else V |= R.COLOR_BUFFER_BIT;
      }
      O && (V |= R.DEPTH_BUFFER_BIT), z && (V |= R.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), R.clear(V);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", me, !1), t.removeEventListener("webglcontextrestored", ce, !1), t.removeEventListener("webglcontextcreationerror", Ae, !1), Te.dispose(), j.dispose(), G.dispose(), ae.dispose(), Be.dispose(), ze.dispose(), x.dispose(), Ce.dispose(), ve.dispose(), N.dispose(), I.dispose(), I.removeEventListener("sessionstart", Gt), I.removeEventListener("sessionend", Wt), dn.stop();
    };
    function me(y) {
      y.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), S = !0;
    }
    function ce() {
      console.log("THREE.WebGLRenderer: Context Restored."), S = !1;
      const y = ue.autoReset, O = le.enabled, z = le.autoUpdate, V = le.needsUpdate, D = le.type;
      We(), ue.autoReset = y, le.enabled = O, le.autoUpdate = z, le.needsUpdate = V, le.type = D;
    }
    function Ae(y) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", y.statusMessage);
    }
    function ne(y) {
      const O = y.target;
      O.removeEventListener("dispose", ne), K(O);
    }
    function K(y) {
      be(y), ae.remove(y);
    }
    function be(y) {
      const O = ae.get(y).programs;
      O !== void 0 && (O.forEach(function(z) {
        N.releaseProgram(z);
      }), y.isShaderMaterial && N.releaseShaderCache(y));
    }
    this.renderBufferDirect = function(y, O, z, V, D, Q) {
      O === null && (O = Ie);
      const _e = D.isMesh && D.matrixWorld.determinant() < 0, Me = ul(y, O, z, V, D);
      Z.setMaterial(V, _e);
      let Se = z.index, Ne = 1;
      if (V.wireframe === !0) {
        if (Se = b.getWireframeAttribute(z), Se === void 0) return;
        Ne = 2;
      }
      const Oe = z.drawRange, Ue = z.attributes.position;
      let Ke = Oe.start * Ne, it = (Oe.start + Oe.count) * Ne;
      Q !== null && (Ke = Math.max(Ke, Q.start * Ne), it = Math.min(it, (Q.start + Q.count) * Ne)), Se !== null ? (Ke = Math.max(Ke, 0), it = Math.min(it, Se.count)) : Ue != null && (Ke = Math.max(Ke, 0), it = Math.min(it, Ue.count));
      const st = it - Ke;
      if (st < 0 || st === 1 / 0) return;
      Ce.setup(D, V, Me, z, Se);
      let at, rt = re;
      if (Se !== null && (at = Ge.get(Se), rt = ge, rt.setIndex(at)), D.isMesh) V.wireframe === !0 ? (Z.setLineWidth(V.wireframeLinewidth * qe()), rt.setMode(R.LINES)) : rt.setMode(R.TRIANGLES);
      else if (D.isLine) {
        let we = V.linewidth;
        we === void 0 && (we = 1), Z.setLineWidth(we * qe()), D.isLineSegments ? rt.setMode(R.LINES) : D.isLineLoop ? rt.setMode(R.LINE_LOOP) : rt.setMode(R.LINE_STRIP);
      } else D.isPoints ? rt.setMode(R.POINTS) : D.isSprite && rt.setMode(R.TRIANGLES);
      if (D.isBatchedMesh) if (D._multiDrawInstances !== null)
        Ti("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), rt.renderMultiDrawInstances(D._multiDrawStarts, D._multiDrawCounts, D._multiDrawCount, D._multiDrawInstances);
      else if ($.get("WEBGL_multi_draw"))
        rt.renderMultiDraw(D._multiDrawStarts, D._multiDrawCounts, D._multiDrawCount);
      else {
        const we = D._multiDrawStarts, gt = D._multiDrawCounts, $e = D._multiDrawCount, Dt = Se ? Ge.get(Se).bytesPerElement : 1, Pn = ae.get(V).currentProgram.getUniforms();
        for (let Et = 0; Et < $e; Et++)
          Pn.setValue(R, "_gl_DrawID", Et), rt.render(we[Et] / Dt, gt[Et]);
      }
      else if (D.isInstancedMesh) rt.renderInstances(Ke, st, D.count);
      else if (z.isInstancedBufferGeometry) {
        const we = z._maxInstanceCount !== void 0 ? z._maxInstanceCount : 1 / 0, gt = Math.min(z.instanceCount, we);
        rt.renderInstances(Ke, st, gt);
      } else rt.render(Ke, st);
    };
    function Le(y, O, z) {
      y.transparent === !0 && y.side === 2 && y.forceSinglePass === !1 ? (y.side = 1, y.needsUpdate = !0, Ii(y, O, z), y.side = 0, y.needsUpdate = !0, Ii(y, O, z), y.side = 2) : Ii(y, O, z);
    }
    this.compile = function(y, O, z = null) {
      z === null && (z = y), m = G.get(z), m.init(O), T.push(m), z.traverseVisible(function(D) {
        D.isLight && D.layers.test(O.layers) && (m.pushLight(D), D.castShadow && m.pushShadow(D));
      }), y !== z && y.traverseVisible(function(D) {
        D.isLight && D.layers.test(O.layers) && (m.pushLight(D), D.castShadow && m.pushShadow(D));
      }), m.setupLights();
      const V = /* @__PURE__ */ new Set();
      return y.traverse(function(D) {
        if (!(D.isMesh || D.isPoints || D.isLine || D.isSprite)) return;
        const Q = D.material;
        if (Q) if (Array.isArray(Q)) for (let _e = 0; _e < Q.length; _e++) {
          const Me = Q[_e];
          Le(Me, z, D), V.add(Me);
        }
        else
          Le(Q, z, D), V.add(Q);
      }), m = T.pop(), V;
    }, this.compileAsync = function(y, O, z = null) {
      const V = this.compile(y, O, z);
      return new Promise((D) => {
        function Q() {
          if (V.forEach(function(_e) {
            ae.get(_e).currentProgram.isReady() && V.delete(_e);
          }), V.size === 0) {
            D(y);
            return;
          }
          setTimeout(Q, 10);
        }
        $.get("KHR_parallel_shader_compile") !== null ? Q() : setTimeout(Q, 10);
      });
    };
    let ht = null;
    function tt(y) {
      ht && ht(y);
    }
    function Gt() {
      dn.stop();
    }
    function Wt() {
      dn.start();
    }
    const dn = new al();
    dn.setAnimationLoop(tt), typeof self < "u" && dn.setContext(self), this.setAnimationLoop = function(y) {
      ht = y, I.setAnimationLoop(y), y === null ? dn.stop() : dn.start();
    }, I.addEventListener("sessionstart", Gt), I.addEventListener("sessionend", Wt), this.render = function(y, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (S === !0) return;
      if (y.matrixWorldAutoUpdate === !0 && y.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), I.enabled === !0 && I.isPresenting === !0 && (I.cameraAutoUpdate === !0 && I.updateCamera(O), O = I.getCamera()), y.isScene === !0 && y.onBeforeRender(_, y, O, C), m = G.get(y, T.length), m.init(O), T.push(m), he.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), nt.setFromProjectionMatrix(he, jn, O.reversedDepth), q = this.localClippingEnabled, Ze = xe.init(this.clippingPlanes, q), g = j.get(y, d.length), g.init(), d.push(g), I.enabled === !0 && I.isPresenting === !0) {
        const Q = _.xr.getDepthSensingMesh();
        Q !== null && Tr(Q, O, -1 / 0, _.sortObjects);
      }
      Tr(y, O, 0, _.sortObjects), g.finish(), _.sortObjects === !0 && g.sort(W, se), Ee = I.enabled === !1 || I.isPresenting === !1 || I.hasDepthSensing() === !1, Ee && Te.addToRenderList(g, y), this.info.render.frame++, Ze === !0 && xe.beginShadows();
      const z = m.state.shadowsArray;
      le.render(z, y, O), Ze === !0 && xe.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = g.opaque, D = g.transmissive;
      if (m.setupLights(), O.isArrayCamera) {
        const Q = O.cameras;
        if (D.length > 0) for (let _e = 0, Me = Q.length; _e < Me; _e++) {
          const Se = Q[_e];
          Ns(V, D, y, Se);
        }
        Ee && Te.render(y);
        for (let _e = 0, Me = Q.length; _e < Me; _e++) {
          const Se = Q[_e];
          Ds(g, y, Se, Se.viewport);
        }
      } else
        D.length > 0 && Ns(V, D, y, O), Ee && Te.render(y), Ds(g, y, O);
      C !== null && A === 0 && (ie.updateMultisampleRenderTarget(C), ie.updateRenderTargetMipmap(C)), y.isScene === !0 && y.onAfterRender(_, y, O), Ce.resetDefaultState(), U = -1, E = null, T.pop(), T.length > 0 ? (m = T[T.length - 1], Ze === !0 && xe.setGlobalState(_.clippingPlanes, m.state.camera)) : m = null, d.pop(), d.length > 0 ? g = d[d.length - 1] : g = null;
    };
    function Tr(y, O, z, V) {
      if (y.visible === !1) return;
      if (y.layers.test(O.layers)) {
        if (y.isGroup) z = y.renderOrder;
        else if (y.isLOD)
          y.autoUpdate === !0 && y.update(O);
        else if (y.isLight)
          m.pushLight(y), y.castShadow && m.pushShadow(y);
        else if (y.isSprite) {
          if (!y.frustumCulled || nt.intersectsSprite(y)) {
            V && ye.setFromMatrixPosition(y.matrixWorld).applyMatrix4(he);
            const Q = x.update(y), _e = y.material;
            _e.visible && g.push(y, Q, _e, z, ye.z, null);
          }
        } else if ((y.isMesh || y.isLine || y.isPoints) && (!y.frustumCulled || nt.intersectsObject(y))) {
          const Q = x.update(y), _e = y.material;
          if (V && (y.boundingSphere !== void 0 ? (y.boundingSphere === null && y.computeBoundingSphere(), ye.copy(y.boundingSphere.center)) : (Q.boundingSphere === null && Q.computeBoundingSphere(), ye.copy(Q.boundingSphere.center)), ye.applyMatrix4(y.matrixWorld).applyMatrix4(he)), Array.isArray(_e)) {
            const Me = Q.groups;
            for (let Se = 0, Ne = Me.length; Se < Ne; Se++) {
              const Oe = Me[Se], Ue = _e[Oe.materialIndex];
              Ue && Ue.visible && g.push(y, Q, Ue, z, ye.z, Oe);
            }
          } else _e.visible && g.push(y, Q, _e, z, ye.z, null);
        }
      }
      const D = y.children;
      for (let Q = 0, _e = D.length; Q < _e; Q++) Tr(D[Q], O, z, V);
    }
    function Ds(y, O, z, V) {
      const D = y.opaque, Q = y.transmissive, _e = y.transparent;
      m.setupLightsView(z), Ze === !0 && xe.setGlobalState(_.clippingPlanes, z), V && Z.viewport(M.copy(V)), D.length > 0 && Li(D, O, z), Q.length > 0 && Li(Q, O, z), _e.length > 0 && Li(_e, O, z), Z.buffers.depth.setTest(!0), Z.buffers.depth.setMask(!0), Z.buffers.color.setMask(!0), Z.setPolygonOffset(!1);
    }
    function Ns(y, O, z, V) {
      if ((z.isScene === !0 ? z.overrideMaterial : null) !== null) return;
      m.state.transmissionRenderTarget[V.id] === void 0 && (m.state.transmissionRenderTarget[V.id] = new wn(1, 1, {
        generateMipmaps: !0,
        type: $.has("EXT_color_buffer_half_float") || $.has("EXT_color_buffer_float") ? Es : Kn,
        minFilter: Ms,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: je.workingColorSpace
      }));
      const D = m.state.transmissionRenderTarget[V.id], Q = V.viewport || M;
      D.setSize(Q.z * _.transmissionResolutionScale, Q.w * _.transmissionResolutionScale);
      const _e = _.getRenderTarget(), Me = _.getActiveCubeFace(), Se = _.getActiveMipmapLevel();
      _.setRenderTarget(D), _.getClearColor(H), B = _.getClearAlpha(), B < 1 && _.setClearColor(16777215, 0.5), _.clear(), Ee && Te.render(z);
      const Ne = _.toneMapping;
      _.toneMapping = 0;
      const Oe = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), m.setupLightsView(V), Ze === !0 && xe.setGlobalState(_.clippingPlanes, V), Li(y, z, V), ie.updateMultisampleRenderTarget(D), ie.updateRenderTargetMipmap(D), $.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Ue = !1;
        for (let Ke = 0, it = O.length; Ke < it; Ke++) {
          const st = O[Ke], at = st.object, rt = st.geometry, we = st.material, gt = st.group;
          if (we.side === 2 && at.layers.test(V.layers)) {
            const $e = we.side;
            we.side = 1, we.needsUpdate = !0, Os(at, z, V, rt, we, gt), we.side = $e, we.needsUpdate = !0, Ue = !0;
          }
        }
        Ue === !0 && (ie.updateMultisampleRenderTarget(D), ie.updateRenderTargetMipmap(D));
      }
      _.setRenderTarget(_e, Me, Se), _.setClearColor(H, B), Oe !== void 0 && (V.viewport = Oe), _.toneMapping = Ne;
    }
    function Li(y, O, z) {
      const V = O.isScene === !0 ? O.overrideMaterial : null;
      for (let D = 0, Q = y.length; D < Q; D++) {
        const _e = y[D], Me = _e.object, Se = _e.geometry, Ne = _e.group;
        let Oe = _e.material;
        Oe.allowOverride === !0 && V !== null && (Oe = V), Me.layers.test(z.layers) && Os(Me, O, z, Se, Oe, Ne);
      }
    }
    function Os(y, O, z, V, D, Q) {
      y.onBeforeRender(_, O, z, V, D, Q), y.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse, y.matrixWorld), y.normalMatrix.getNormalMatrix(y.modelViewMatrix), D.onBeforeRender(_, O, z, V, y, Q), D.transparent === !0 && D.side === 2 && D.forceSinglePass === !1 ? (D.side = 1, D.needsUpdate = !0, _.renderBufferDirect(z, O, V, D, y, Q), D.side = 0, D.needsUpdate = !0, _.renderBufferDirect(z, O, V, D, y, Q), D.side = 2) : _.renderBufferDirect(z, O, V, D, y, Q), y.onAfterRender(_, O, z, V, D, Q);
    }
    function Ii(y, O, z) {
      O.isScene !== !0 && (O = Ie);
      const V = ae.get(y), D = m.state.lights, Q = m.state.shadowsArray, _e = D.state.version, Me = N.getParameters(y, D.state, Q, O, z), Se = N.getProgramCacheKey(Me);
      let Ne = V.programs;
      V.environment = y.isMeshStandardMaterial ? O.environment : null, V.fog = O.fog, V.envMap = (y.isMeshStandardMaterial ? ze : Be).get(y.envMap || V.environment), V.envMapRotation = V.environment !== null && y.envMap === null ? O.environmentRotation : y.envMapRotation, Ne === void 0 && (y.addEventListener("dispose", ne), Ne = /* @__PURE__ */ new Map(), V.programs = Ne);
      let Oe = Ne.get(Se);
      if (Oe !== void 0) {
        if (V.currentProgram === Oe && V.lightsStateVersion === _e)
          return Bs(y, Me), Oe;
      } else
        Me.uniforms = N.getUniforms(y), y.onBeforeCompile(Me, _), Oe = N.acquireProgram(Me, Se), Ne.set(Se, Oe), V.uniforms = Me.uniforms;
      const Ue = V.uniforms;
      return (!y.isShaderMaterial && !y.isRawShaderMaterial || y.clipping === !0) && (Ue.clippingPlanes = xe.uniform), Bs(y, Me), V.needsLights = dl(y), V.lightsStateVersion = _e, V.needsLights && (Ue.ambientLightColor.value = D.state.ambient, Ue.lightProbe.value = D.state.probe, Ue.directionalLights.value = D.state.directional, Ue.directionalLightShadows.value = D.state.directionalShadow, Ue.spotLights.value = D.state.spot, Ue.spotLightShadows.value = D.state.spotShadow, Ue.rectAreaLights.value = D.state.rectArea, Ue.ltc_1.value = D.state.rectAreaLTC1, Ue.ltc_2.value = D.state.rectAreaLTC2, Ue.pointLights.value = D.state.point, Ue.pointLightShadows.value = D.state.pointShadow, Ue.hemisphereLights.value = D.state.hemi, Ue.directionalShadowMap.value = D.state.directionalShadowMap, Ue.directionalShadowMatrix.value = D.state.directionalShadowMatrix, Ue.spotShadowMap.value = D.state.spotShadowMap, Ue.spotLightMatrix.value = D.state.spotLightMatrix, Ue.spotLightMap.value = D.state.spotLightMap, Ue.pointShadowMap.value = D.state.pointShadowMap, Ue.pointShadowMatrix.value = D.state.pointShadowMatrix), V.currentProgram = Oe, V.uniformsList = null, Oe;
    }
    function Fs(y) {
      if (y.uniformsList === null) {
        const O = y.currentProgram.getUniforms();
        y.uniformsList = fr.seqWithValue(O.seq, y.uniforms);
      }
      return y.uniformsList;
    }
    function Bs(y, O) {
      const z = ae.get(y);
      z.outputColorSpace = O.outputColorSpace, z.batching = O.batching, z.batchingColor = O.batchingColor, z.instancing = O.instancing, z.instancingColor = O.instancingColor, z.instancingMorph = O.instancingMorph, z.skinning = O.skinning, z.morphTargets = O.morphTargets, z.morphNormals = O.morphNormals, z.morphColors = O.morphColors, z.morphTargetsCount = O.morphTargetsCount, z.numClippingPlanes = O.numClippingPlanes, z.numIntersection = O.numClipIntersection, z.vertexAlphas = O.vertexAlphas, z.vertexTangents = O.vertexTangents, z.toneMapping = O.toneMapping;
    }
    function ul(y, O, z, V, D) {
      O.isScene !== !0 && (O = Ie), ie.resetTextureUnits();
      const Q = O.fog, _e = V.isMeshStandardMaterial ? O.environment : null, Me = C === null ? _.outputColorSpace : C.isXRRenderTarget === !0 ? C.texture.colorSpace : Si, Se = (V.isMeshStandardMaterial ? ze : Be).get(V.envMap || _e), Ne = V.vertexColors === !0 && !!z.attributes.color && z.attributes.color.itemSize === 4, Oe = !!z.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), Ue = !!z.morphAttributes.position, Ke = !!z.morphAttributes.normal, it = !!z.morphAttributes.color;
      let st = 0;
      V.toneMapped && (C === null || C.isXRRenderTarget === !0) && (st = _.toneMapping);
      const at = z.morphAttributes.position || z.morphAttributes.normal || z.morphAttributes.color, rt = at !== void 0 ? at.length : 0, we = ae.get(V), gt = m.state.lights;
      if (Ze === !0 && (q === !0 || y !== E)) {
        const vt = y === E && V.id === U;
        xe.setState(V, y, vt);
      }
      let $e = !1;
      V.version === we.__version ? (we.needsLights && we.lightsStateVersion !== gt.state.version || we.outputColorSpace !== Me || D.isBatchedMesh && we.batching === !1 || !D.isBatchedMesh && we.batching === !0 || D.isBatchedMesh && we.batchingColor === !0 && D.colorTexture === null || D.isBatchedMesh && we.batchingColor === !1 && D.colorTexture !== null || D.isInstancedMesh && we.instancing === !1 || !D.isInstancedMesh && we.instancing === !0 || D.isSkinnedMesh && we.skinning === !1 || !D.isSkinnedMesh && we.skinning === !0 || D.isInstancedMesh && we.instancingColor === !0 && D.instanceColor === null || D.isInstancedMesh && we.instancingColor === !1 && D.instanceColor !== null || D.isInstancedMesh && we.instancingMorph === !0 && D.morphTexture === null || D.isInstancedMesh && we.instancingMorph === !1 && D.morphTexture !== null || we.envMap !== Se || V.fog === !0 && we.fog !== Q || we.numClippingPlanes !== void 0 && (we.numClippingPlanes !== xe.numPlanes || we.numIntersection !== xe.numIntersection) || we.vertexAlphas !== Ne || we.vertexTangents !== Oe || we.morphTargets !== Ue || we.morphNormals !== Ke || we.morphColors !== it || we.toneMapping !== st || we.morphTargetsCount !== rt) && ($e = !0) : ($e = !0, we.__version = V.version);
      let Dt = we.currentProgram;
      $e === !0 && (Dt = Ii(V, O, D));
      let Pn = !1, Et = !1, ai = !1;
      const ot = Dt.getUniforms(), wt = we.uniforms;
      if (Z.useProgram(Dt.program) && (Pn = !0, Et = !0, ai = !0), V.id !== U && (U = V.id, Et = !0), Pn || E !== y) {
        Z.buffers.depth.getReversed() && y.reversedDepth !== !0 && (y._reversedDepth = !0, y.updateProjectionMatrix()), ot.setValue(R, "projectionMatrix", y.projectionMatrix), ot.setValue(R, "viewMatrix", y.matrixWorldInverse);
        const vt = ot.map.cameraPosition;
        vt !== void 0 && vt.setValue(R, fe.setFromMatrixPosition(y.matrixWorld)), te.logarithmicDepthBuffer && ot.setValue(R, "logDepthBufFC", 2 / (Math.log(y.far + 1) / Math.LN2)), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && ot.setValue(R, "isOrthographic", y.isOrthographicCamera === !0), E !== y && (E = y, Et = !0, ai = !0);
      }
      if (D.isSkinnedMesh) {
        ot.setOptional(R, D, "bindMatrix"), ot.setOptional(R, D, "bindMatrixInverse");
        const vt = D.skeleton;
        vt && (vt.boneTexture === null && vt.computeBoneTexture(), ot.setValue(R, "boneTexture", vt.boneTexture, ie));
      }
      D.isBatchedMesh && (ot.setOptional(R, D, "batchingTexture"), ot.setValue(R, "batchingTexture", D._matricesTexture, ie), ot.setOptional(R, D, "batchingIdTexture"), ot.setValue(R, "batchingIdTexture", D._indirectTexture, ie), ot.setOptional(R, D, "batchingColorTexture"), D._colorsTexture !== null && ot.setValue(R, "batchingColorTexture", D._colorsTexture, ie));
      const Rt = z.morphAttributes;
      if ((Rt.position !== void 0 || Rt.normal !== void 0 || Rt.color !== void 0) && Pe.update(D, z, Dt), (Et || we.receiveShadow !== D.receiveShadow) && (we.receiveShadow = D.receiveShadow, ot.setValue(R, "receiveShadow", D.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (wt.envMap.value = Se, wt.flipEnvMap.value = Se.isCubeTexture && Se.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && O.environment !== null && (wt.envMapIntensity.value = O.environmentIntensity), Et && (ot.setValue(R, "toneMappingExposure", _.toneMappingExposure), we.needsLights && fl(wt, ai), Q && V.fog === !0 && X.refreshFogUniforms(wt, Q), X.refreshMaterialUniforms(wt, V, ee, k, m.state.transmissionRenderTarget[y.id]), fr.upload(R, Fs(we), wt, ie)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (fr.upload(R, Fs(we), wt, ie), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && ot.setValue(R, "center", D.center), ot.setValue(R, "modelViewMatrix", D.modelViewMatrix), ot.setValue(R, "normalMatrix", D.normalMatrix), ot.setValue(R, "modelMatrix", D.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const vt = V.uniformsGroups;
        for (let Nt = 0, br = vt.length; Nt < br; Nt++) {
          const pn = vt[Nt];
          ve.update(pn, Dt), ve.bind(pn, Dt);
        }
      }
      return Dt;
    }
    function fl(y, O) {
      y.ambientLightColor.needsUpdate = O, y.lightProbe.needsUpdate = O, y.directionalLights.needsUpdate = O, y.directionalLightShadows.needsUpdate = O, y.pointLights.needsUpdate = O, y.pointLightShadows.needsUpdate = O, y.spotLights.needsUpdate = O, y.spotLightShadows.needsUpdate = O, y.rectAreaLights.needsUpdate = O, y.hemisphereLights.needsUpdate = O;
    }
    function dl(y) {
      return y.isMeshLambertMaterial || y.isMeshToonMaterial || y.isMeshPhongMaterial || y.isMeshStandardMaterial || y.isShadowMaterial || y.isShaderMaterial && y.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return L;
    }, this.getActiveMipmapLevel = function() {
      return A;
    }, this.getRenderTarget = function() {
      return C;
    }, this.setRenderTargetTextures = function(y, O, z) {
      const V = ae.get(y);
      V.__autoAllocateDepthBuffer = y.resolveDepthBuffer === !1, V.__autoAllocateDepthBuffer === !1 && (V.__useRenderToTexture = !1), ae.get(y.texture).__webglTexture = O, ae.get(y.depthTexture).__webglTexture = V.__autoAllocateDepthBuffer ? void 0 : z, V.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(y, O) {
      const z = ae.get(y);
      z.__webglFramebuffer = O, z.__useDefaultFramebuffer = O === void 0;
    };
    const pl = R.createFramebuffer();
    this.setRenderTarget = function(y, O = 0, z = 0) {
      C = y, L = O, A = z;
      let V = !0, D = null, Q = !1, _e = !1;
      if (y) {
        const Me = ae.get(y);
        if (Me.__useDefaultFramebuffer !== void 0)
          Z.bindFramebuffer(R.FRAMEBUFFER, null), V = !1;
        else if (Me.__webglFramebuffer === void 0) ie.setupRenderTarget(y);
        else if (Me.__hasExternalTextures) ie.rebindTextures(y, ae.get(y.texture).__webglTexture, ae.get(y.depthTexture).__webglTexture);
        else if (y.depthBuffer) {
          const Oe = y.depthTexture;
          if (Me.__boundDepthTexture !== Oe) {
            if (Oe !== null && ae.has(Oe) && (y.width !== Oe.image.width || y.height !== Oe.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            ie.setupDepthRenderbuffer(y);
          }
        }
        const Se = y.texture;
        (Se.isData3DTexture || Se.isDataArrayTexture || Se.isCompressedArrayTexture) && (_e = !0);
        const Ne = ae.get(y).__webglFramebuffer;
        y.isWebGLCubeRenderTarget ? (Array.isArray(Ne[O]) ? D = Ne[O][z] : D = Ne[O], Q = !0) : y.samples > 0 && ie.useMultisampledRTT(y) === !1 ? D = ae.get(y).__webglMultisampledFramebuffer : Array.isArray(Ne) ? D = Ne[z] : D = Ne, M.copy(y.viewport), w.copy(y.scissor), F = y.scissorTest;
      } else
        M.copy(pe).multiplyScalar(ee).floor(), w.copy(De).multiplyScalar(ee).floor(), F = Fe;
      if (z !== 0 && (D = pl), Z.bindFramebuffer(R.FRAMEBUFFER, D) && V && Z.drawBuffers(y, D), Z.viewport(M), Z.scissor(w), Z.setScissorTest(F), Q) {
        const Me = ae.get(y.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_CUBE_MAP_POSITIVE_X + O, Me.__webglTexture, z);
      } else if (_e) {
        const Me = O;
        for (let Se = 0; Se < y.textures.length; Se++) {
          const Ne = ae.get(y.textures[Se]);
          R.framebufferTextureLayer(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0 + Se, Ne.__webglTexture, z, Me);
        }
      } else if (y !== null && z !== 0) {
        const Me = ae.get(y.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, Me.__webglTexture, z);
      }
      U = -1;
    }, this.readRenderTargetPixels = function(y, O, z, V, D, Q, _e, Me = 0) {
      if (!(y && y.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Se = ae.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && _e !== void 0 && (Se = Se[_e]), Se) {
        Z.bindFramebuffer(R.FRAMEBUFFER, Se);
        try {
          const Ne = y.textures[Me], Oe = Ne.format, Ue = Ne.type;
          if (!te.textureFormatReadable(Oe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!te.textureTypeReadable(Ue)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= y.width - V && z >= 0 && z <= y.height - D && (y.textures.length > 1 && R.readBuffer(R.COLOR_ATTACHMENT0 + Me), R.readPixels(O, z, V, D, Re.convert(Oe), Re.convert(Ue), Q));
        } finally {
          const Ne = C !== null ? ae.get(C).__webglFramebuffer : null;
          Z.bindFramebuffer(R.FRAMEBUFFER, Ne);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(y, O, z, V, D, Q, _e, Me = 0) {
      if (!(y && y.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Se = ae.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && _e !== void 0 && (Se = Se[_e]), Se) if (O >= 0 && O <= y.width - V && z >= 0 && z <= y.height - D) {
        Z.bindFramebuffer(R.FRAMEBUFFER, Se);
        const Ne = y.textures[Me], Oe = Ne.format, Ue = Ne.type;
        if (!te.textureFormatReadable(Oe)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!te.textureTypeReadable(Ue)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        const Ke = R.createBuffer();
        R.bindBuffer(R.PIXEL_PACK_BUFFER, Ke), R.bufferData(R.PIXEL_PACK_BUFFER, Q.byteLength, R.STREAM_READ), y.textures.length > 1 && R.readBuffer(R.COLOR_ATTACHMENT0 + Me), R.readPixels(O, z, V, D, Re.convert(Oe), Re.convert(Ue), 0);
        const it = C !== null ? ae.get(C).__webglFramebuffer : null;
        Z.bindFramebuffer(R.FRAMEBUFFER, it);
        const st = R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE, 0);
        return R.flush(), await Dc(R, st, 4), R.bindBuffer(R.PIXEL_PACK_BUFFER, Ke), R.getBufferSubData(R.PIXEL_PACK_BUFFER, 0, Q), R.deleteBuffer(Ke), R.deleteSync(st), Q;
      } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(y, O = null, z = 0) {
      const V = Math.pow(2, -z), D = Math.floor(y.image.width * V), Q = Math.floor(y.image.height * V), _e = O !== null ? O.x : 0, Me = O !== null ? O.y : 0;
      ie.setTexture2D(y, 0), R.copyTexSubImage2D(R.TEXTURE_2D, z, 0, 0, _e, Me, D, Q), Z.unbindTexture();
    };
    const ml = R.createFramebuffer(), gl = R.createFramebuffer();
    this.copyTextureToTexture = function(y, O, z = null, V = null, D = 0, Q = null) {
      Q === null && (D !== 0 ? (Ti("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), Q = D, D = 0) : Q = 0);
      let _e, Me, Se, Ne, Oe, Ue, Ke, it, st;
      const at = y.isCompressedTexture ? y.mipmaps[Q] : y.image;
      if (z !== null)
        _e = z.max.x - z.min.x, Me = z.max.y - z.min.y, Se = z.isBox3 ? z.max.z - z.min.z : 1, Ne = z.min.x, Oe = z.min.y, Ue = z.isBox3 ? z.min.z : 0;
      else {
        const Rt = Math.pow(2, -D);
        _e = Math.floor(at.width * Rt), Me = Math.floor(at.height * Rt), y.isDataArrayTexture ? Se = at.depth : y.isData3DTexture ? Se = Math.floor(at.depth * Rt) : Se = 1, Ne = 0, Oe = 0, Ue = 0;
      }
      V !== null ? (Ke = V.x, it = V.y, st = V.z) : (Ke = 0, it = 0, st = 0);
      const rt = Re.convert(O.format), we = Re.convert(O.type);
      let gt;
      O.isData3DTexture ? (ie.setTexture3D(O, 0), gt = R.TEXTURE_3D) : O.isDataArrayTexture || O.isCompressedArrayTexture ? (ie.setTexture2DArray(O, 0), gt = R.TEXTURE_2D_ARRAY) : (ie.setTexture2D(O, 0), gt = R.TEXTURE_2D), R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL, O.flipY), R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), R.pixelStorei(R.UNPACK_ALIGNMENT, O.unpackAlignment);
      const $e = R.getParameter(R.UNPACK_ROW_LENGTH), Dt = R.getParameter(R.UNPACK_IMAGE_HEIGHT), Pn = R.getParameter(R.UNPACK_SKIP_PIXELS), Et = R.getParameter(R.UNPACK_SKIP_ROWS), ai = R.getParameter(R.UNPACK_SKIP_IMAGES);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, at.width), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, at.height), R.pixelStorei(R.UNPACK_SKIP_PIXELS, Ne), R.pixelStorei(R.UNPACK_SKIP_ROWS, Oe), R.pixelStorei(R.UNPACK_SKIP_IMAGES, Ue);
      const ot = y.isDataArrayTexture || y.isData3DTexture, wt = O.isDataArrayTexture || O.isData3DTexture;
      if (y.isDepthTexture) {
        const Rt = ae.get(y), vt = ae.get(O), Nt = ae.get(Rt.__renderTarget), br = ae.get(vt.__renderTarget);
        Z.bindFramebuffer(R.READ_FRAMEBUFFER, Nt.__webglFramebuffer), Z.bindFramebuffer(R.DRAW_FRAMEBUFFER, br.__webglFramebuffer);
        for (let pn = 0; pn < Se; pn++)
          ot && (R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, ae.get(y).__webglTexture, D, Ue + pn), R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, ae.get(O).__webglTexture, Q, st + pn)), R.blitFramebuffer(Ne, Oe, _e, Me, Ke, it, _e, Me, R.DEPTH_BUFFER_BIT, R.NEAREST);
        Z.bindFramebuffer(R.READ_FRAMEBUFFER, null), Z.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else if (D !== 0 || y.isRenderTargetTexture || ae.has(y)) {
        const Rt = ae.get(y), vt = ae.get(O);
        Z.bindFramebuffer(R.READ_FRAMEBUFFER, ml), Z.bindFramebuffer(R.DRAW_FRAMEBUFFER, gl);
        for (let Nt = 0; Nt < Se; Nt++)
          ot ? R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, Rt.__webglTexture, D, Ue + Nt) : R.framebufferTexture2D(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, Rt.__webglTexture, D), wt ? R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, vt.__webglTexture, Q, st + Nt) : R.framebufferTexture2D(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, vt.__webglTexture, Q), D !== 0 ? R.blitFramebuffer(Ne, Oe, _e, Me, Ke, it, _e, Me, R.COLOR_BUFFER_BIT, R.NEAREST) : wt ? R.copyTexSubImage3D(gt, Q, Ke, it, st + Nt, Ne, Oe, _e, Me) : R.copyTexSubImage2D(gt, Q, Ke, it, Ne, Oe, _e, Me);
        Z.bindFramebuffer(R.READ_FRAMEBUFFER, null), Z.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else wt ? y.isDataTexture || y.isData3DTexture ? R.texSubImage3D(gt, Q, Ke, it, st, _e, Me, Se, rt, we, at.data) : O.isCompressedArrayTexture ? R.compressedTexSubImage3D(gt, Q, Ke, it, st, _e, Me, Se, rt, at.data) : R.texSubImage3D(gt, Q, Ke, it, st, _e, Me, Se, rt, we, at) : y.isDataTexture ? R.texSubImage2D(R.TEXTURE_2D, Q, Ke, it, _e, Me, rt, we, at.data) : y.isCompressedTexture ? R.compressedTexSubImage2D(R.TEXTURE_2D, Q, Ke, it, at.width, at.height, rt, at.data) : R.texSubImage2D(R.TEXTURE_2D, Q, Ke, it, _e, Me, rt, we, at);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, $e), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, Dt), R.pixelStorei(R.UNPACK_SKIP_PIXELS, Pn), R.pixelStorei(R.UNPACK_SKIP_ROWS, Et), R.pixelStorei(R.UNPACK_SKIP_IMAGES, ai), Q === 0 && O.generateMipmaps && R.generateMipmap(gt), Z.unbindTexture();
    }, this.initRenderTarget = function(y) {
      ae.get(y).__webglFramebuffer === void 0 && ie.setupRenderTarget(y);
    }, this.initTexture = function(y) {
      y.isCubeTexture ? ie.setTextureCube(y, 0) : y.isData3DTexture ? ie.setTexture3D(y, 0) : y.isDataArrayTexture || y.isCompressedArrayTexture ? ie.setTexture2DArray(y, 0) : ie.setTexture2D(y, 0), Z.unbindTexture();
    }, this.resetState = function() {
      L = 0, A = 0, C = null, Z.reset(), Ce.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return jn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = je._getDrawingBufferColorSpace(e), t.unpackColorSpace = je._getUnpackColorSpace();
  }
};
export {
  Kd as $,
  Ud as A,
  cp as At,
  An as B,
  Zi as C,
  hn as Ct,
  fa as D,
  Dd as Dt,
  op as E,
  Nd as Et,
  Co as F,
  Zd as Ft,
  ap as G,
  yl as H,
  Ro as I,
  oe as It,
  Cd as J,
  wd as K,
  jd as L,
  P as Lt,
  dr as M,
  Rd as Mt,
  ds as N,
  Ut as Nt,
  Od as O,
  nn as Ot,
  Xd as P,
  tp as Pt,
  $d as Q,
  Bd as R,
  xr as Rt,
  Pd as S,
  Ld as St,
  Wd as T,
  Yd as Tt,
  Si as U,
  Ms as V,
  Pi as W,
  Pt as X,
  Ye as Y,
  go as Z,
  sp as _,
  Ci as _t,
  un as a,
  _r as at,
  ep as b,
  qd as bt,
  yt as c,
  At as ct,
  ke as d,
  zd as dt,
  Jh as et,
  je as f,
  fh as ft,
  Ao as g,
  $n as gt,
  dh as h,
  Mr as ht,
  ah as i,
  _l as it,
  yr as j,
  ip as jt,
  Id as k,
  Jd as kt,
  Vd as l,
  Mn as lt,
  hp as m,
  ni as mt,
  up as n,
  Ht as nt,
  ws as o,
  mt as ot,
  Hd as p,
  ct as pt,
  fn as q,
  Qd as r,
  xl as rt,
  It as s,
  sl as st,
  Oa as t,
  fs as tt,
  Tn as u,
  rp as ut,
  kd as v,
  lp as vt,
  np as w,
  ko as wt,
  Je as x,
  zt as xt,
  Gd as y,
  us as yt,
  Fd as z
};
