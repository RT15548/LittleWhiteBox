var bv = Object.create, Ch = Object.defineProperty, wv = Object.getOwnPropertyDescriptor, Sv = Object.getOwnPropertyNames, Ev = Object.getPrototypeOf, Tv = Object.prototype.hasOwnProperty, fs = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Av = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var i = Sv(t), o = 0, s = i.length, u; o < s; o++)
      u = i[o], !Tv.call(e, u) && u !== n && Ch(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = wv(t, u)) || r.enumerable
      });
  return e;
}, Cv = (e, t, n) => (n = e != null ? bv(Ev(e)) : {}, Av(t || !e || !e.__esModule ? Ch(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function te(e, t, n, r, i) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function R(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var xh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return xh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Na(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ka = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, j = class extends Error {
}, Ge = class Da extends j {
  constructor(t, n, r, i) {
    super(`${Da.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("x-request-id"), this.error = n;
    const o = n;
    this.code = o?.code, this.param = o?.param, this.type = o?.type;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new hs({
      message: r,
      cause: ka(n)
    });
    const o = n?.error;
    return t === 400 ? new Ih(t, o, r, i) : t === 401 ? new Rh(t, o, r, i) : t === 403 ? new Ph(t, o, r, i) : t === 404 ? new Mh(t, o, r, i) : t === 409 ? new Nh(t, o, r, i) : t === 422 ? new kh(t, o, r, i) : t === 429 ? new Dh(t, o, r, i) : t >= 500 ? new Lh(t, o, r, i) : new Da(t, o, r, i);
  }
}, dt = class extends Ge {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, hs = class extends Ge {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ql = class extends hs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ih = class extends Ge {
}, Rh = class extends Ge {
}, Ph = class extends Ge {
}, Mh = class extends Ge {
}, Nh = class extends Ge {
}, kh = class extends Ge {
}, Dh = class extends Ge {
}, Lh = class extends Ge {
}, $h = class extends j {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Uh = class extends j {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, $r = class extends Error {
  constructor(e) {
    super(e);
  }
}, Fh = class extends Ge {
  constructor(e, t, n) {
    let r = "OAuth2 authentication error", i;
    if (t && typeof t == "object") {
      const o = t;
      i = o.error;
      const s = o.error_description;
      s && typeof s == "string" ? r = s : i && (r = i);
    }
    super(e, t, r, n), this.error_code = i;
  }
}, xv = class extends j {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Iv = /^[a-z][a-z0-9+.-]*:/i, Rv = (e) => Iv.test(e), Je = (e) => (Je = Array.isArray, Je(e)), ac = Je;
function Bh(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function lc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Pv(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Js(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Mv = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new j(`${e} must be an integer`);
  if (t < 0) throw new j(`${e} must be a positive integer`);
  return t;
}, Nv = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, vi = (e) => new Promise((t) => setTimeout(t, e)), qn = "6.34.0", kv = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Dv() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Lv = () => {
  const e = Dv();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qn,
    "X-Stainless-OS": cc(Deno.build.os),
    "X-Stainless-Arch": uc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qn,
    "X-Stainless-OS": cc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": uc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = $v();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function $v() {
  if (typeof navigator > "u" || !navigator) return null;
  for (const { key: e, pattern: t } of [
    {
      key: "edge",
      pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "chrome",
      pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "firefox",
      pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "safari",
      pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
    }
  ]) {
    const n = t.exec(navigator.userAgent);
    if (n) return {
      browser: e,
      version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
    };
  }
  return null;
}
var uc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", cc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), dc, Uv = () => dc ?? (dc = Lv());
function Oh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Gh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function qh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Gh({
    start() {
    },
    async pull(n) {
      const { done: r, value: i } = await t.next();
      r ? n.close() : n.enqueue(i);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Vh(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function fc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Fv = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Hh = "RFC3986", Kh = (e) => String(e), hc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Kh
};
var La = (e, t) => (La = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), La(e, t)), Et = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), zs = 1024, Bv = (e, t, n, r, i) => {
  if (e.length === 0) return e;
  let o = e;
  if (typeof e == "symbol" ? o = Symbol.prototype.toString.call(e) : typeof e != "string" && (o = String(e)), n === "iso-8859-1") return escape(o).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < o.length; u += zs) {
    const c = o.length >= zs ? o.slice(u, u + zs) : o, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || i === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = Et[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Et[192 | f >> 6] + Et[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Et[224 | f >> 12] + Et[128 | f >> 6 & 63] + Et[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = Et[240 | f >> 18] + Et[128 | f >> 12 & 63] + Et[128 | f >> 6 & 63] + Et[128 | f & 63];
    }
    s += d.join("");
  }
  return s;
};
function Ov(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function pc(e, t) {
  if (Je(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Wh = {
  brackets(e) {
    return String(e) + "[]";
  },
  comma: "comma",
  indices(e, t) {
    return String(e) + "[" + t + "]";
  },
  repeat(e) {
    return String(e);
  }
}, Jh = function(e, t) {
  Array.prototype.push.apply(e, Je(t) ? t : [t]);
}, mc, Me = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Bv,
  encodeValuesOnly: !1,
  format: Hh,
  formatter: Kh,
  indices: !1,
  serializeDate(e) {
    return (mc ?? (mc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Gv(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ys = {};
function zh(e, t, n, r, i, o, s, u, c, d, h, f, p, m, g, y, v, b) {
  let _ = e, w = b, E = 0, A = !1;
  for (; (w = w.get(Ys)) !== void 0 && !A; ) {
    const T = w.get(e);
    if (E += 1, typeof T < "u") {
      if (T === E) throw new RangeError("Cyclic object value");
      A = !0;
    }
    typeof w.get(Ys) > "u" && (E = 0);
  }
  if (typeof d == "function" ? _ = d(t, _) : _ instanceof Date ? _ = p?.(_) : n === "comma" && Je(_) && (_ = pc(_, function(T) {
    return T instanceof Date ? p?.(T) : T;
  })), _ === null) {
    if (o) return c && !y ? c(t, Me.encoder, v, "key", m) : t;
    _ = "";
  }
  if (Gv(_) || Ov(_)) {
    if (c) {
      const T = y ? t : c(t, Me.encoder, v, "key", m);
      return [g?.(T) + "=" + g?.(c(_, Me.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(_))];
  }
  const S = [];
  if (typeof _ > "u") return S;
  let I;
  if (n === "comma" && Je(_))
    y && c && (_ = pc(_, c)), I = [{ value: _.length > 0 ? _.join(",") || null : void 0 }];
  else if (Je(d)) I = d;
  else {
    const T = Object.keys(_);
    I = h ? T.sort(h) : T;
  }
  const C = u ? String(t).replace(/\./g, "%2E") : String(t), P = r && Je(_) && _.length === 1 ? C + "[]" : C;
  if (i && Je(_) && _.length === 0) return P + "[]";
  for (let T = 0; T < I.length; ++T) {
    const k = I[T], F = typeof k == "object" && typeof k.value < "u" ? k.value : _[k];
    if (s && F === null) continue;
    const B = f && u ? k.replace(/\./g, "%2E") : k, W = Je(_) ? typeof n == "function" ? n(P, B) : P : P + (f ? "." + B : "[" + B + "]");
    b.set(e, E);
    const O = /* @__PURE__ */ new WeakMap();
    O.set(Ys, b), Jh(S, zh(F, W, n, r, i, o, s, u, n === "comma" && y && Je(_) ? null : c, d, h, f, p, m, g, y, v, O));
  }
  return S;
}
function qv(e = Me) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || Me.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Hh;
  if (typeof e.format < "u") {
    if (!La(hc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = hc[n];
  let i = Me.filter;
  (typeof e.filter == "function" || Je(e.filter)) && (i = e.filter);
  let o;
  if (e.arrayFormat && e.arrayFormat in Wh ? o = e.arrayFormat : "indices" in e ? o = e.indices ? "indices" : "repeat" : o = Me.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : Me.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : Me.addQueryPrefix,
    allowDots: s,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : Me.allowEmptyArrays,
    arrayFormat: o,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : Me.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? Me.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : Me.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : Me.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : Me.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : Me.encodeValuesOnly,
    filter: i,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : Me.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : Me.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : Me.strictNullHandling
  };
}
function Vv(e, t = {}) {
  let n = e;
  const r = qv(t);
  let i, o;
  typeof r.filter == "function" ? (o = r.filter, n = o("", n)) : Je(r.filter) && (o = r.filter, i = o);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Wh[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  i || (i = Object.keys(n)), r.sort && i.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < i.length; ++p) {
    const m = i[p];
    r.skipNulls && n[m] === null || Jh(s, zh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = s.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function Hv(e) {
  return Vv(e, { arrayFormat: "brackets" });
}
function Kv(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var gc;
function Vl(e) {
  let t;
  return (gc ?? (t = new globalThis.TextEncoder(), gc = t.encode.bind(t)))(e);
}
var yc;
function vc(e) {
  let t;
  return (yc ?? (t = new globalThis.TextDecoder(), yc = t.decode.bind(t)))(e);
}
var Ze, je, ps = class {
  constructor() {
    Ze.set(this, void 0), je.set(this, void 0), te(this, Ze, new Uint8Array(), "f"), te(this, je, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Vl(e) : e;
    te(this, Ze, Kv([R(this, Ze, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Wv(R(this, Ze, "f"), R(this, je, "f"))) != null; ) {
      if (r.carriage && R(this, je, "f") == null) {
        te(this, je, r.index, "f");
        continue;
      }
      if (R(this, je, "f") != null && (r.index !== R(this, je, "f") + 1 || r.carriage)) {
        n.push(vc(R(this, Ze, "f").subarray(0, R(this, je, "f") - 1))), te(this, Ze, R(this, Ze, "f").subarray(R(this, je, "f")), "f"), te(this, je, null, "f");
        continue;
      }
      const i = R(this, je, "f") !== null ? r.preceding - 1 : r.preceding, o = vc(R(this, Ze, "f").subarray(0, i));
      n.push(o), te(this, Ze, R(this, Ze, "f").subarray(r.index), "f"), te(this, je, null, "f");
    }
    return n;
  }
  flush() {
    return R(this, Ze, "f").length ? this.decode(`
`) : [];
  }
};
Ze = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap();
ps.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ps.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Wv(e, t) {
  for (let i = t ?? 0; i < e.length; i++) {
    if (e[i] === 10) return {
      preceding: i,
      index: i + 1,
      carriage: !1
    };
    if (e[i] === 13) return {
      preceding: i,
      index: i + 1,
      carriage: !0
    };
  }
  return null;
}
function Jv(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Fo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, _c = (e, t, n) => {
  if (e) {
    if (Pv(Fo, e)) return e;
    Fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Fo))}`);
  }
};
function Ur() {
}
function Di(e, t, n) {
  return !t || Fo[e] > Fo[n] ? Ur : t[e].bind(t);
}
var zv = {
  error: Ur,
  warn: Ur,
  info: Ur,
  debug: Ur
}, bc = /* @__PURE__ */ new WeakMap();
function Fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return zv;
  const r = bc.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: Di("error", t, n),
    warn: Di("warn", t, n),
    info: Di("info", t, n),
    debug: Di("debug", t, n)
  };
  return bc.set(t, [n, i]), i;
}
var dn = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), gr, si = class Fr {
  constructor(t, n, r) {
    this.iterator = t, gr.set(this, void 0), this.controller = n, te(this, gr, r, "f");
  }
  static fromSSEResponse(t, n, r, i) {
    let o = !1;
    const s = r ? Fe(r) : console;
    async function* u() {
      if (o) throw new j("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let c = !1;
      try {
        for await (const d of Yv(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let h;
              try {
                h = JSON.parse(d.data);
              } catch (f) {
                throw s.error("Could not parse message into JSON:", d.data), s.error("From chunk:", d.raw), f;
              }
              if (h && h.error) throw new Ge(void 0, h.error, void 0, t.headers);
              yield i ? {
                event: d.event,
                data: h
              } : h;
            } else {
              let h;
              try {
                h = JSON.parse(d.data);
              } catch (f) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), f;
              }
              if (d.event == "error") throw new Ge(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Na(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Fr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new ps(), c = Vh(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (i) throw new j("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of o())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Na(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Fr(s, n, r);
  }
  [(gr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), i = (o) => ({ next: () => {
      if (o.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return o.shift();
    } });
    return [new Fr(() => i(t), this.controller, R(this, gr, "f")), new Fr(() => i(n), this.controller, R(this, gr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Gh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = Vl(JSON.stringify(i) + `
`);
          r.enqueue(s);
        } catch (i) {
          r.error(i);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Yv(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new j("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new j("Attempted to iterate over a response with no body");
  const n = new Qv(), r = new ps(), i = Vh(e.body);
  for await (const o of Xv(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* Xv(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Vl(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = Jv(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var Qv = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const i = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], i;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = Zv(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Zv(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function Yh(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    if (t.options.stream)
      return Fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : si.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Xh(await n.json(), n) : await n.text();
  })();
  return Fe(e).debug(`[${r}] response parsed`, dn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
function Xh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Br, Qh = class Zh extends Promise {
  constructor(t, n, r = Yh) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, Br.set(this, void 0), te(this, Br, t, "f");
  }
  _thenUnwrap(t) {
    return new Zh(R(this, Br, "f"), this.responsePromise, async (n, r) => Xh(t(await this.parseResponse(n, r), r), r.response));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n,
      request_id: n.headers.get("x-request-id")
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(R(this, Br, "f"), t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
};
Br = /* @__PURE__ */ new WeakMap();
var Li, Hl = class {
  constructor(e, t, n, r) {
    Li.set(this, void 0), te(this, Li, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new j("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await R(this, Li, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Li = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, jv = class extends Qh {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await Yh(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, ms = class extends Hl {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Te = class extends Hl {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.getPaginatedItems(), t = e[e.length - 1]?.id;
    return t ? {
      ...this.options,
      query: {
        ...Bh(this.options.query),
        after: t
      }
    } : null;
  }
}, ai = class extends Hl {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Bh(this.options.query),
        after: e
      }
    } : null;
  }
}, e_ = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, t_ = "urn:ietf:params:oauth:grant-type:token-exchange", n_ = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Oh();
  }
  async getToken() {
    if (!this.cachedToken || this.isTokenExpired(this.cachedToken)) {
      if (this.refreshPromise) return await this.refreshPromise;
      this.refreshPromise = this.refreshToken();
      try {
        return await this.refreshPromise;
      } finally {
        this.refreshPromise = null;
      }
    }
    return this.needsRefresh(this.cachedToken) && !this.refreshPromise && (this.refreshPromise = this.refreshToken().finally(() => {
      this.refreshPromise = null;
    })), this.cachedToken.token;
  }
  async refreshToken() {
    const e = await this.config.provider.getToken(), t = await this.fetch(this.tokenExchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: t_,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: e_[this.config.provider.tokenType],
        identity_provider_id: this.config.identityProviderId,
        service_account_id: this.config.serviceAccountId
      })
    });
    if (!t.ok) {
      const o = await t.text();
      let s;
      try {
        s = JSON.parse(o);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Fh(t.status, s, t.headers) : Ge.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), r = n.expires_in || 3600, i = Date.now() + r * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: i
    }, n.access_token;
  }
  isTokenExpired(e) {
    return Date.now() >= e.expiresAt;
  }
  needsRefresh(e) {
    const t = (this.config.refreshBufferSeconds ?? 1200) * 1e3;
    return Date.now() >= e.expiresAt - t;
  }
  invalidateToken() {
    this.cachedToken = null, this.refreshPromise = null;
  }
}, jh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function jr(e, t, n) {
  return jh(), new File(e, t ?? "unknown_file", n);
}
function go(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Kl = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", gs = async (e, t) => $a(e.body) ? {
  ...e,
  body: await ep(e.body, t)
} : e, Ct = async (e, t) => ({
  ...e,
  body: await ep(e.body, t)
}), wc = /* @__PURE__ */ new WeakMap();
function r_(e) {
  const t = typeof e == "function" ? e : e.fetch, n = wc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return wc.set(t, r), r;
}
var ep = async (e, t) => {
  if (!await r_(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Ua(n, r, i))), n;
}, tp = (e) => e instanceof Blob && "name" in e, i_ = (e) => typeof e == "object" && e !== null && (e instanceof Response || Kl(e) || tp(e)), $a = (e) => {
  if (i_(e)) return !0;
  if (Array.isArray(e)) return e.some($a);
  if (e && typeof e == "object") {
    for (const t in e) if ($a(e[t])) return !0;
  }
  return !1;
}, Ua = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, jr([await n.blob()], go(n)));
    else if (Kl(n)) e.append(t, jr([await new Response(qh(n)).blob()], go(n)));
    else if (tp(n)) e.append(t, n, go(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ua(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Ua(e, `${t}[${r}]`, i)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, np = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", o_ = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && np(e), s_ = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function a_(e, t, n) {
  if (jh(), e = await e, o_(e))
    return e instanceof File ? e : jr([await e.arrayBuffer()], e.name);
  if (s_(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), jr(await Fa(i), t, n);
  }
  const r = await Fa(e);
  if (t || (t = go(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return jr(r, t, n);
}
async function Fa(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (np(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Kl(e)) for await (const n of e) t.push(...await Fa(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${l_(e)}`);
  }
  return t;
}
function l_(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Y = class {
  constructor(e) {
    this._client = e;
  }
};
function rp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Sc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), u_ = (e = rp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Sc) ?? Sc)?.toString) && (g = m + "", o.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) o.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (o.sort((h, f) => h.start - f.start), o.length > 0) {
    let h = 0;
    const f = o.reduce((p, m) => {
      const g = " ".repeat(m.start - h), y = "^".repeat(m.length);
      return h = m.start + m.length, p + g + y;
    }, "");
    throw new j(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, U = /* @__PURE__ */ u_(rp), ip = class extends Y {
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/chat/completions/${e}/messages`, Te, {
      query: t,
      ...n
    });
  }
};
function Bo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Wl(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function _i(e) {
  return e?.$brand === "auto-parseable-tool";
}
function c_(e, t) {
  return !t || !op(t) ? {
    ...e,
    choices: e.choices.map((n) => (sp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Jl(e, t);
}
function Jl(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new $h();
    if (r.finish_reason === "content_filter") throw new Uh();
    return sp(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((i) => f_(t, i)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? d_(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function d_(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function f_(e, t) {
  const n = e.tools?.find((r) => Bo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: _i(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function h_(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => Bo(r) && r.function?.name === t.function.name);
  return Bo(n) && (_i(n) || n?.function.strict || !1);
}
function op(e) {
  return Wl(e.response_format) ? !0 : e.tools?.some((t) => _i(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function sp(e) {
  for (const t of e || []) if (t.type !== "function") throw new j(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function p_(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new j(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new j(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Oo = (e) => e?.role === "assistant", ap = (e) => e?.role === "tool", Ba, yo, vo, Or, Gr, _o, qr, Dt, Vr, Go, qo, Vn, lp, zl = class {
  constructor() {
    Ba.add(this), this.controller = new AbortController(), yo.set(this, void 0), vo.set(this, () => {
    }), Or.set(this, () => {
    }), Gr.set(this, void 0), _o.set(this, () => {
    }), qr.set(this, () => {
    }), Dt.set(this, {}), Vr.set(this, !1), Go.set(this, !1), qo.set(this, !1), Vn.set(this, !1), te(this, yo, new Promise((e, t) => {
      te(this, vo, e, "f"), te(this, Or, t, "f");
    }), "f"), te(this, Gr, new Promise((e, t) => {
      te(this, _o, e, "f"), te(this, qr, t, "f");
    }), "f"), R(this, yo, "f").catch(() => {
    }), R(this, Gr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, R(this, Ba, "m", lp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (R(this, vo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return R(this, Vr, "f");
  }
  get errored() {
    return R(this, Go, "f");
  }
  get aborted() {
    return R(this, qo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (R(this, Dt, "f")[e] || (R(this, Dt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = R(this, Dt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((i) => i.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (R(this, Dt, "f")[e] || (R(this, Dt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      te(this, Vn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    te(this, Vn, !0, "f"), await R(this, Gr, "f");
  }
  _emit(e, ...t) {
    if (R(this, Vr, "f")) return;
    e === "end" && (te(this, Vr, !0, "f"), R(this, _o, "f").call(this));
    const n = R(this, Dt, "f")[e];
    if (n && (R(this, Dt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !R(this, Vn, "f") && !n?.length && Promise.reject(r), R(this, Or, "f").call(this, r), R(this, qr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !R(this, Vn, "f") && !n?.length && Promise.reject(r), R(this, Or, "f").call(this, r), R(this, qr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
yo = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), Ba = /* @__PURE__ */ new WeakSet(), lp = function(t) {
  if (te(this, Go, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new dt()), t instanceof dt)
    return te(this, qo, !0, "f"), this._emit("abort", t);
  if (t instanceof j) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new j(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new j(String(t)));
};
function m_(e) {
  return typeof e.parse == "function";
}
var qe, Oa, Vo, Ga, qa, Va, up, cp, g_ = 10, dp = class extends zl {
  constructor() {
    super(...arguments), qe.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), ap(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Oo(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new j("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), R(this, qe, "m", Oa).call(this);
  }
  async finalMessage() {
    return await this.done(), R(this, qe, "m", Vo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), R(this, qe, "m", Ga).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), R(this, qe, "m", qa).call(this);
  }
  async totalUsage() {
    return await this.done(), R(this, qe, "m", Va).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = R(this, qe, "m", Vo).call(this);
    t && this._emit("finalMessage", t);
    const n = R(this, qe, "m", Oa).call(this);
    n && this._emit("finalContent", n);
    const r = R(this, qe, "m", Ga).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const i = R(this, qe, "m", qa).call(this);
    i != null && this._emit("finalFunctionToolCallResult", i), this._chatCompletions.some((o) => o.usage) && this._emit("totalUsage", R(this, qe, "m", Va).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), R(this, qe, "m", up).call(this, t);
    const i = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Jl(i, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: i = "auto", stream: o, ...s } = t, u = typeof i != "string" && i.type === "function" && i?.function?.name, { maxChatCompletions: c = g_ } = n || {}, d = t.tools.map((p) => {
      if (_i(p)) {
        if (!p.$callback) throw new j("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: p.$callback,
            name: p.function.name,
            description: p.function.description || "",
            parameters: p.function.parameters,
            parse: p.$parseRaw,
            strict: !0
          }
        };
      }
      return p;
    }), h = {};
    for (const p of d) p.type === "function" && (h[p.function.name || p.function.function.name] = p.function);
    const f = "tools" in t ? d.map((p) => p.type === "function" ? {
      type: "function",
      function: {
        name: p.function.name || p.function.function.name,
        parameters: p.function.parameters,
        description: p.function.description,
        strict: p.function.strict
      }
    } : p) : void 0;
    for (const p of t.messages) this._addMessage(p, !1);
    for (let p = 0; p < c; ++p) {
      const m = (await this._createChatCompletion(e, {
        ...s,
        tool_choice: i,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new j("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const y = g.id, { name: v, arguments: b } = g.function, _ = h[v];
        if (_) {
          if (u && u !== v) {
            const S = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: y,
              content: S
            });
            continue;
          }
        } else {
          const S = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((I) => JSON.stringify(I)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: S
          });
          continue;
        }
        let w;
        try {
          w = m_(_) ? await _.parse(b) : b;
        } catch (S) {
          const I = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: I
          });
          continue;
        }
        const E = await _.function(w, this), A = R(this, qe, "m", cp).call(this, E);
        if (this._addMessage({
          role: r,
          tool_call_id: y,
          content: A
        }), u) return;
      }
    }
  }
};
qe = /* @__PURE__ */ new WeakSet(), Oa = function() {
  return R(this, qe, "m", Vo).call(this).content ?? null;
}, Vo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Oo(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new j("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ga = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Oo(n) && n?.tool_calls?.length) return n.tool_calls.filter((r) => r.type === "function").at(-1)?.function;
  }
}, qa = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (ap(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((i) => i.type === "function" && i.id === n.tool_call_id))) return n.content;
  }
}, Va = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, up = function(t) {
  if (t.n != null && t.n > 1) throw new j("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, cp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var y_ = class fp extends dp {
  static runTools(t, n, r) {
    const i = new fp(), o = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, o)), i;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Oo(t) && t.content && this._emit("content", t.content);
  }
}, v_ = 1, hp = 2, pp = 4, mp = 8, __ = 16, b_ = 32, w_ = 64, gp = 128, yp = 256, S_ = gp | yp, E_ = 496, Ec = hp | 497, Tc = pp | mp, De = {
  STR: v_,
  NUM: hp,
  ARR: pp,
  OBJ: mp,
  NULL: __,
  BOOL: b_,
  NAN: w_,
  INFINITY: gp,
  MINUS_INFINITY: yp,
  INF: S_,
  SPECIAL: E_,
  ATOM: Ec,
  COLLECTION: Tc,
  ALL: Ec | Tc
}, T_ = class extends Error {
}, A_ = class extends Error {
};
function C_(e, t = De.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return x_(e.trim(), t);
}
var x_ = (e, t) => {
  const n = e.length;
  let r = 0;
  const i = (p) => {
    throw new T_(`${p} at position ${r}`);
  }, o = (p) => {
    throw new A_(`${p} at position ${r}`);
  }, s = () => (f(), r >= n && i("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || De.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || De.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || De.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || De.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || De.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || De.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (g) {
      o(String(g));
    }
    else if (De.STR & t) try {
      return JSON.parse(e.substring(p, r - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    i("Unterminated string literal");
  }, c = () => {
    r++, f();
    const p = {};
    try {
      for (; e[r] !== "}"; ) {
        if (f(), r >= n && De.OBJ & t) return p;
        const m = u();
        f(), r++;
        try {
          const g = s();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (De.OBJ & t) return p;
          throw g;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (De.OBJ & t) return p;
      i("Expected '}' at end of object");
    }
    return r++, p;
  }, d = () => {
    r++;
    const p = [];
    try {
      for (; e[r] !== "]"; )
        p.push(s()), f(), e[r] === "," && r++;
    } catch {
      if (De.ARR & t) return p;
      i("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && De.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (De.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        o(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(De.NUM & t) && i("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && De.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        o(String(g));
      }
    }
  }, f = () => {
    for (; r < n && ` 
\r	`.includes(e[r]); ) r++;
  };
  return s();
}, Ac = (e) => C_(e, De.ALL ^ De.NUM), Re, Pt, kn, Gt, Xs, $i, Qs, Zs, js, Ui, ea, Cc, vp = class Ha extends dp {
  constructor(t) {
    super(), Re.add(this), Pt.set(this, void 0), kn.set(this, void 0), Gt.set(this, void 0), te(this, Pt, t, "f"), te(this, kn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return R(this, Gt, "f");
  }
  static fromReadableStream(t) {
    const n = new Ha(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const i = new Ha(n);
    return i._run(() => i._runChatCompletion(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  async _createChatCompletion(t, n, r) {
    super._createChatCompletion;
    const i = r?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), R(this, Re, "m", Xs).call(this);
    const o = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of o) R(this, Re, "m", Qs).call(this, s);
    if (o.controller.signal?.aborted) throw new dt();
    return this._addChatCompletion(R(this, Re, "m", Ui).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), R(this, Re, "m", Xs).call(this), this._connected();
    const i = si.fromReadableStream(t, this.controller);
    let o;
    for await (const s of i)
      o && o !== s.id && this._addChatCompletion(R(this, Re, "m", Ui).call(this)), R(this, Re, "m", Qs).call(this, s), o = s.id;
    if (i.controller.signal?.aborted) throw new dt();
    return this._addChatCompletion(R(this, Re, "m", Ui).call(this));
  }
  [(Pt = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakSet(), Xs = function() {
    this.ended || te(this, Gt, void 0, "f");
  }, $i = function(n) {
    let r = R(this, kn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, R(this, kn, "f")[n.index] = r, r);
  }, Qs = function(n) {
    if (this.ended) return;
    const r = R(this, Re, "m", Cc).call(this, n);
    this._emit("chunk", n, r);
    for (const i of n.choices) {
      const o = r.choices[i.index];
      i.delta.content != null && o.message?.role === "assistant" && o.message?.content && (this._emit("content", i.delta.content, o.message.content), this._emit("content.delta", {
        delta: i.delta.content,
        snapshot: o.message.content,
        parsed: o.message.parsed
      })), i.delta.refusal != null && o.message?.role === "assistant" && o.message?.refusal && this._emit("refusal.delta", {
        delta: i.delta.refusal,
        snapshot: o.message.refusal
      }), i.logprobs?.content != null && o.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: i.logprobs?.content,
        snapshot: o.logprobs?.content ?? []
      }), i.logprobs?.refusal != null && o.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: i.logprobs?.refusal,
        snapshot: o.logprobs?.refusal ?? []
      });
      const s = R(this, Re, "m", $i).call(this, o);
      o.finish_reason && (R(this, Re, "m", js).call(this, o), s.current_tool_call_index != null && R(this, Re, "m", Zs).call(this, o, s.current_tool_call_index));
      for (const u of i.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (R(this, Re, "m", js).call(this, o), s.current_tool_call_index != null && R(this, Re, "m", Zs).call(this, o, s.current_tool_call_index)), s.current_tool_call_index = u.index;
      for (const u of i.delta.tool_calls ?? []) {
        const c = o.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : (c?.type, void 0));
      }
    }
  }, Zs = function(n, r) {
    if (R(this, Re, "m", $i).call(this, n).done_tool_calls.has(r)) return;
    const i = n.message.tool_calls?.[r];
    if (!i) throw new Error("no tool call snapshot");
    if (!i.type) throw new Error("tool call snapshot missing `type`");
    if (i.type === "function") {
      const o = R(this, Pt, "f")?.tools?.find((s) => Bo(s) && s.function.name === i.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: i.function.name,
        index: r,
        arguments: i.function.arguments,
        parsed_arguments: _i(o) ? o.$parseRaw(i.function.arguments) : o?.function.strict ? JSON.parse(i.function.arguments) : null
      });
    } else i.type;
  }, js = function(n) {
    const r = R(this, Re, "m", $i).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const i = R(this, Re, "m", ea).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: i ? i.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Ui = function() {
    if (this.ended) throw new j("stream has ended, this shouldn't happen");
    const n = R(this, Gt, "f");
    if (!n) throw new j("request ended without sending any chunks");
    return te(this, Gt, void 0, "f"), te(this, kn, [], "f"), I_(n, R(this, Pt, "f"));
  }, ea = function() {
    const n = R(this, Pt, "f")?.response_format;
    return Wl(n) ? n : null;
  }, Cc = function(n) {
    var r, i, o, s;
    let u = R(this, Gt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = te(this, Gt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: m = null, ...g } of n.choices) {
      let y = u.choices[p];
      if (y || (y = u.choices[p] = {
        finish_reason: f,
        index: p,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!y.logprobs) y.logprobs = Object.assign({}, m);
      else {
        const { content: S, refusal: I, ...C } = m;
        Object.assign(y.logprobs, C), S && ((r = y.logprobs).content ?? (r.content = []), y.logprobs.content.push(...S)), I && ((i = y.logprobs).refusal ?? (i.refusal = []), y.logprobs.refusal.push(...I));
      }
      if (f && (y.finish_reason = f, R(this, Pt, "f") && op(R(this, Pt, "f")))) {
        if (f === "length") throw new $h();
        if (f === "content_filter") throw new Uh();
      }
      if (Object.assign(y, g), !h) continue;
      const { content: v, refusal: b, function_call: _, role: w, tool_calls: E, ...A } = h;
      if (Object.assign(y.message, A), b && (y.message.refusal = (y.message.refusal || "") + b), w && (y.message.role = w), _ && (y.message.function_call ? (_.name && (y.message.function_call.name = _.name), _.arguments && ((o = y.message.function_call).arguments ?? (o.arguments = ""), y.message.function_call.arguments += _.arguments)) : y.message.function_call = _), v && (y.message.content = (y.message.content || "") + v, !y.message.refusal && R(this, Re, "m", ea).call(this) && (y.message.parsed = Ac(y.message.content))), E) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: S, id: I, type: C, function: P, ...T } of E) {
          const k = (s = y.message.tool_calls)[S] ?? (s[S] = {});
          Object.assign(k, T), I && (k.id = I), C && (k.type = C), P && (k.function ?? (k.function = {
            name: P.name ?? "",
            arguments: ""
          })), P?.name && (k.function.name = P.name), P?.arguments && (k.function.arguments += P.arguments, h_(R(this, Pt, "f"), k) && (k.function.parsed_arguments = Ac(k.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("chunk", (i) => {
      const o = n.shift();
      o ? o.resolve(i) : t.push(i);
    }), this.on("end", () => {
      r = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((i, o) => n.push({
        resolve: i,
        reject: o
      })).then((i) => i ? {
        value: i,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new si(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function I_(e, t) {
  const { id: n, choices: r, created: i, model: o, system_fingerprint: s, ...u } = e;
  return c_({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new j(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: y, ...v } = c, b = c.role;
      if (!b) throw new j(`missing role for choice ${h}`);
      if (g) {
        const { arguments: _, name: w } = g;
        if (_ == null) throw new j(`missing function_call.arguments for choice ${h}`);
        if (!w) throw new j(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: _,
              name: w
            },
            role: b,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: h,
          logprobs: f
        };
      }
      return y ? {
        ...p,
        index: h,
        finish_reason: d,
        logprobs: f,
        message: {
          ...v,
          role: b,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: y.map((_, w) => {
            const { function: E, type: A, id: S, ...I } = _, { arguments: C, name: P, ...T } = E || {};
            if (S == null) throw new j(`missing choices[${h}].tool_calls[${w}].id
${Fi(e)}`);
            if (A == null) throw new j(`missing choices[${h}].tool_calls[${w}].type
${Fi(e)}`);
            if (P == null) throw new j(`missing choices[${h}].tool_calls[${w}].function.name
${Fi(e)}`);
            if (C == null) throw new j(`missing choices[${h}].tool_calls[${w}].function.arguments
${Fi(e)}`);
            return {
              ...I,
              id: S,
              type: A,
              function: {
                ...T,
                name: P,
                arguments: C
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...v,
          content: m,
          role: b,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: i,
    model: o,
    object: "chat.completion",
    ...s ? { system_fingerprint: s } : {}
  }, t);
}
function Fi(e) {
  return JSON.stringify(e);
}
var R_ = class Ka extends vp {
  static fromReadableStream(t) {
    const n = new Ka(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const i = new Ka(n), o = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, o)), i;
  }
}, Yl = class extends Y {
  constructor() {
    super(...arguments), this.messages = new ip(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(U`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", Te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return p_(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Jl(n, e));
  }
  runTools(e, t) {
    return e.stream ? R_.runTools(this._client, e, t) : y_.runTools(this._client, e, t);
  }
  stream(e, t) {
    return vp.createChatCompletion(this._client, e, t);
  }
};
Yl.Messages = ip;
var Xl = class extends Y {
  constructor() {
    super(...arguments), this.completions = new Yl(this._client);
  }
};
Xl.Completions = Yl;
var _p = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* P_(e) {
  if (!e) return;
  if (_p in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ac(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = ac(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var z = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of P_(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [_p]: !0,
    values: t,
    nulls: n
  };
}, bp = class extends Y {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: z([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, wp = class extends Y {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ct({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Sp = class extends Y {
  create(e, t) {
    return this._client.post("/audio/translations", Ct({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, bi = class extends Y {
  constructor() {
    super(...arguments), this.transcriptions = new wp(this._client), this.translations = new Sp(this._client), this.speech = new bp(this._client);
  }
};
bi.Transcriptions = wp;
bi.Translations = Sp;
bi.Speech = bp;
var Ep = class extends Y {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", Te, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(U`/batches/${e}/cancel`, t);
  }
}, Tp = class extends Y {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/assistants/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(U`/assistants/${e}`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Te, {
      query: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(U`/assistants/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ap = class extends Y {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Cp = class extends Y {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, ys = class extends Y {
  constructor() {
    super(...arguments), this.sessions = new Ap(this._client), this.transcriptionSessions = new Cp(this._client);
  }
};
ys.Sessions = Ap;
ys.TranscriptionSessions = Cp;
var xp = class extends Y {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(U`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, Ip = class extends Y {
  retrieve(e, t) {
    return this._client.get(U`/chatkit/threads/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ai, {
      query: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(U`/chatkit/threads/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(U`/chatkit/threads/${e}/items`, ai, {
      query: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, vs = class extends Y {
  constructor() {
    super(...arguments), this.sessions = new xp(this._client), this.threads = new Ip(this._client);
  }
};
vs.Sessions = xp;
vs.Threads = Ip;
var Rp = class extends Y {
  create(e, t, n) {
    return this._client.post(U`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(U`/threads/${r}/messages/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(U`/threads/${r}/messages/${e}`, {
      body: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/threads/${e}/messages`, Te, {
      query: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(U`/threads/${r}/messages/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Pp = class extends Y {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: i, ...o } = t;
    return this._client.get(U`/threads/${r}/runs/${i}/steps/${e}`, {
      query: o,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.getAPIList(U`/threads/${r}/runs/${e}/steps`, Te, {
      query: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, M_ = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let i = 0; i < n; i++) r[i] = t.charCodeAt(i);
    return Array.from(new Float32Array(r.buffer));
  }
}, Dn = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, Be, bn, Wa, Tt, bo, mt, wn, zn, yn, Ho, rt, wo, So, ei, Hr, Kr, xc, Ic, Rc, Pc, Mc, Nc, kc, ti = class extends zl {
  constructor() {
    super(...arguments), Be.add(this), Wa.set(this, []), Tt.set(this, {}), bo.set(this, {}), mt.set(this, void 0), wn.set(this, void 0), zn.set(this, void 0), yn.set(this, void 0), Ho.set(this, void 0), rt.set(this, void 0), wo.set(this, void 0), So.set(this, void 0), ei.set(this, void 0);
  }
  [(Wa = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), ei = /* @__PURE__ */ new WeakMap(), Be = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (r) => {
      const i = t.shift();
      i ? i.resolve(r) : e.push(r);
    }), this.on("end", () => {
      n = !0;
      for (const r of t) r.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (r) => {
      n = !0;
      for (const i of t) i.reject(r);
      t.length = 0;
    }), this.on("error", (r) => {
      n = !0;
      for (const i of t) i.reject(r);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => t.push({
        resolve: r,
        reject: i
      })).then((r) => r ? {
        value: r,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  static fromReadableStream(e) {
    const t = new bn();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = si.fromReadableStream(e, this.controller);
    for await (const i of r) R(this, Be, "m", Hr).call(this, i);
    if (r.controller.signal?.aborted) throw new dt();
    return this._addRun(R(this, Be, "m", Kr).call(this));
  }
  toReadableStream() {
    return new si(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const i = new bn();
    return i._run(() => i._runToolAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  async _createToolAssistantStream(e, t, n, r) {
    const i = r?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
    const o = {
      ...n,
      stream: !0
    }, s = await e.submitToolOutputs(t, o, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) R(this, Be, "m", Hr).call(this, u);
    if (s.controller.signal?.aborted) throw new dt();
    return this._addRun(R(this, Be, "m", Kr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new bn();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const i = new bn();
    return i._run(() => i._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  currentEvent() {
    return R(this, wo, "f");
  }
  currentRun() {
    return R(this, So, "f");
  }
  currentMessageSnapshot() {
    return R(this, mt, "f");
  }
  currentRunStepSnapshot() {
    return R(this, ei, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(R(this, Tt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(R(this, bo, "f"));
  }
  async finalRun() {
    if (await this.done(), !R(this, wn, "f")) throw Error("Final run was not received.");
    return R(this, wn, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...t,
      stream: !0
    }, o = await e.createAndRun(i, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of o) R(this, Be, "m", Hr).call(this, s);
    if (o.controller.signal?.aborted) throw new dt();
    return this._addRun(R(this, Be, "m", Kr).call(this));
  }
  async _createAssistantStream(e, t, n, r) {
    const i = r?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
    const o = {
      ...n,
      stream: !0
    }, s = await e.create(t, o, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) R(this, Be, "m", Hr).call(this, u);
    if (s.controller.signal?.aborted) throw new dt();
    return this._addRun(R(this, Be, "m", Kr).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, r] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = r;
        continue;
      }
      let i = e[n];
      if (i == null) {
        e[n] = r;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = r;
        continue;
      }
      if (typeof i == "string" && typeof r == "string") i += r;
      else if (typeof i == "number" && typeof r == "number") i += r;
      else if (Js(i) && Js(r)) i = this.accumulateDelta(i, r);
      else if (Array.isArray(i) && Array.isArray(r)) {
        if (i.every((o) => typeof o == "string" || typeof o == "number")) {
          i.push(...r);
          continue;
        }
        for (const o of r) {
          if (!Js(o)) throw new Error(`Expected array delta entry to be an object but got: ${o}`);
          const s = o.index;
          if (s == null)
            throw console.error(o), new Error("Expected array delta entry to have an `index` property");
          if (typeof s != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${s}`);
          const u = i[s];
          u == null ? i.push(o) : i[s] = this.accumulateDelta(u, o);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${r}, accValue: ${i}`);
      e[n] = i;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, t, n) {
    return await this._createThreadAssistantStream(t, e, n);
  }
  async _runAssistantStream(e, t, n, r) {
    return await this._createAssistantStream(t, e, n, r);
  }
  async _runToolAssistantStream(e, t, n, r) {
    return await this._createToolAssistantStream(t, e, n, r);
  }
};
bn = ti, Hr = function(t) {
  if (!this.ended)
    switch (te(this, wo, t, "f"), R(this, Be, "m", Rc).call(this, t), t.event) {
      case "thread.created":
        break;
      case "thread.run.created":
      case "thread.run.queued":
      case "thread.run.in_progress":
      case "thread.run.requires_action":
      case "thread.run.completed":
      case "thread.run.incomplete":
      case "thread.run.failed":
      case "thread.run.cancelling":
      case "thread.run.cancelled":
      case "thread.run.expired":
        R(this, Be, "m", kc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        R(this, Be, "m", Ic).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        R(this, Be, "m", xc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Kr = function() {
  if (this.ended) throw new j("stream has ended, this shouldn't happen");
  if (!R(this, wn, "f")) throw Error("Final run has not been received");
  return R(this, wn, "f");
}, xc = function(t) {
  const [n, r] = R(this, Be, "m", Mc).call(this, t, R(this, mt, "f"));
  te(this, mt, n, "f"), R(this, bo, "f")[n.id] = n;
  for (const i of r) {
    const o = n.content[i.index];
    o?.type == "text" && this._emit("textCreated", o.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const i of t.data.delta.content) {
        if (i.type == "text" && i.text) {
          let o = i.text, s = n.content[i.index];
          if (s && s.type == "text") this._emit("textDelta", o, s.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (i.index != R(this, zn, "f")) {
          if (R(this, yn, "f")) switch (R(this, yn, "f").type) {
            case "text":
              this._emit("textDone", R(this, yn, "f").text, R(this, mt, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", R(this, yn, "f").image_file, R(this, mt, "f"));
              break;
          }
          te(this, zn, i.index, "f");
        }
        te(this, yn, n.content[i.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (R(this, zn, "f") !== void 0) {
        const i = t.data.content[R(this, zn, "f")];
        if (i) switch (i.type) {
          case "image_file":
            this._emit("imageFileDone", i.image_file, R(this, mt, "f"));
            break;
          case "text":
            this._emit("textDone", i.text, R(this, mt, "f"));
            break;
        }
      }
      R(this, mt, "f") && this._emit("messageDone", t.data), te(this, mt, void 0, "f");
  }
}, Ic = function(t) {
  const n = R(this, Be, "m", Pc).call(this, t);
  switch (te(this, ei, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const i of r.step_details.tool_calls) i.index == R(this, Ho, "f") ? this._emit("toolCallDelta", i, n.step_details.tool_calls[i.index]) : (R(this, rt, "f") && this._emit("toolCallDone", R(this, rt, "f")), te(this, Ho, i.index, "f"), te(this, rt, n.step_details.tool_calls[i.index], "f"), R(this, rt, "f") && this._emit("toolCallCreated", R(this, rt, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      te(this, ei, void 0, "f"), t.data.step_details.type == "tool_calls" && R(this, rt, "f") && (this._emit("toolCallDone", R(this, rt, "f")), te(this, rt, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Rc = function(t) {
  R(this, Wa, "f").push(t), this._emit("event", t);
}, Pc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return R(this, Tt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = R(this, Tt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const i = bn.accumulateDelta(n, r.delta);
        R(this, Tt, "f")[t.data.id] = i;
      }
      return R(this, Tt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      R(this, Tt, "f")[t.data.id] = t.data;
      break;
  }
  if (R(this, Tt, "f")[t.data.id]) return R(this, Tt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Mc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let i = t.data;
      if (i.delta.content) for (const o of i.delta.content) if (o.index in n.content) {
        let s = n.content[o.index];
        n.content[o.index] = R(this, Be, "m", Nc).call(this, o, s);
      } else
        n.content[o.index] = o, r.push(o);
      return [n, r];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, r];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Nc = function(t, n) {
  return bn.accumulateDelta(n, t);
}, kc = function(t) {
  switch (te(this, So, t.data, "f"), t.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete":
      te(this, wn, t.data, "f"), R(this, rt, "f") && (this._emit("toolCallDone", R(this, rt, "f")), te(this, rt, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ql = class extends Y {
  constructor() {
    super(...arguments), this.steps = new Pp(this._client);
  }
  create(e, t, n) {
    const { include: r, ...i } = t;
    return this._client.post(U`/threads/${e}/runs`, {
      query: { include: r },
      body: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(U`/threads/${r}/runs/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(U`/threads/${r}/runs/${e}`, {
      body: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/threads/${e}/runs`, Te, {
      query: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(U`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return ti.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = z([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: i, response: o } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...r
        }
      }).withResponse();
      switch (i.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = o.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await vi(s);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return i;
      }
    }
  }
  stream(e, t, n) {
    return ti.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(U`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const r = await this.submitToolOutputs(e, t, n);
    return await this.poll(r.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return ti.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ql.Steps = Pp;
var _s = class extends Y {
  constructor() {
    super(...arguments), this.runs = new Ql(this._client), this.messages = new Rp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/threads/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(U`/threads/${e}`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(U`/threads/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return ti.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
_s.Runs = Ql;
_s.Messages = Rp;
var ir = class extends Y {
  constructor() {
    super(...arguments), this.realtime = new ys(this._client), this.chatkit = new vs(this._client), this.assistants = new Tp(this._client), this.threads = new _s(this._client);
  }
};
ir.Realtime = ys;
ir.ChatKit = vs;
ir.Assistants = Tp;
ir.Threads = _s;
var Mp = class extends Y {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Np = class extends Y {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(U`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: z([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Zl = class extends Y {
  constructor() {
    super(...arguments), this.content = new Np(this._client);
  }
  create(e, t, n) {
    return this._client.post(U`/containers/${e}/files`, gs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(U`/containers/${r}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/containers/${e}/files`, Te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(U`/containers/${r}/files/${e}`, {
      ...n,
      headers: z([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Zl.Content = Np;
var jl = class extends Y {
  constructor() {
    super(...arguments), this.files = new Zl(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/containers/${e}`, {
      ...t,
      headers: z([{ Accept: "*/*" }, t?.headers])
    });
  }
};
jl.Files = Zl;
var kp = class extends Y {
  create(e, t, n) {
    const { include: r, ...i } = t;
    return this._client.post(U`/conversations/${e}/items`, {
      query: { include: r },
      body: i,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...i } = t;
    return this._client.get(U`/conversations/${r}/items/${e}`, {
      query: i,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/conversations/${e}/items`, ai, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(U`/conversations/${r}/items/${e}`, n);
  }
}, eu = class extends Y {
  constructor() {
    super(...arguments), this.items = new kp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(U`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(U`/conversations/${e}`, t);
  }
};
eu.Items = kp;
var Dp = class extends Y {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && Fe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const i = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t
    });
    return n ? i : (Fe(this._client).debug("embeddings/decoding base64 embeddings from base64"), i._thenUnwrap((o) => (o && o.data && o.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = M_(u);
    }), o)));
  }
}, Lp = class extends Y {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: i } = t;
    return this._client.get(U`/evals/${r}/runs/${i}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: r, ...i } = t;
    return this._client.getAPIList(U`/evals/${r}/runs/${e}/output_items`, Te, {
      query: i,
      ...n
    });
  }
}, tu = class extends Y {
  constructor() {
    super(...arguments), this.outputItems = new Lp(this._client);
  }
  create(e, t, n) {
    return this._client.post(U`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(U`/evals/${r}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/evals/${e}/runs`, Te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(U`/evals/${r}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(U`/evals/${r}/runs/${e}`, n);
  }
};
tu.OutputItems = Lp;
var nu = class extends Y {
  constructor() {
    super(...arguments), this.runs = new tu(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(U`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", Te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/evals/${e}`, t);
  }
};
nu.Runs = tu;
var $p = class extends Y {
  create(e, t) {
    return this._client.post("/files", Ct({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(U`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", Te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(U`/files/${e}/content`, {
      ...t,
      headers: z([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const r = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), i = Date.now();
    let o = await this.retrieve(e);
    for (; !o.status || !r.has(o.status); )
      if (await vi(t), o = await this.retrieve(e), Date.now() - i > n) throw new ql({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return o;
  }
}, Up = class extends Y {
}, Fp = class extends Y {
  run(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/run", {
      body: e,
      ...t
    });
  }
  validate(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/validate", {
      body: e,
      ...t
    });
  }
}, ru = class extends Y {
  constructor() {
    super(...arguments), this.graders = new Fp(this._client);
  }
};
ru.Graders = Fp;
var Bp = class extends Y {
  create(e, t, n) {
    return this._client.getAPIList(U`/fine_tuning/checkpoints/${e}/permissions`, ms, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(U`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/fine_tuning/checkpoints/${e}/permissions`, ai, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(U`/fine_tuning/checkpoints/${r}/permissions/${e}`, n);
  }
}, iu = class extends Y {
  constructor() {
    super(...arguments), this.permissions = new Bp(this._client);
  }
};
iu.Permissions = Bp;
var Op = class extends Y {
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/fine_tuning/jobs/${e}/checkpoints`, Te, {
      query: t,
      ...n
    });
  }
}, ou = class extends Y {
  constructor() {
    super(...arguments), this.checkpoints = new Op(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", Te, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(U`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(U`/fine_tuning/jobs/${e}/events`, Te, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(U`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(U`/fine_tuning/jobs/${e}/resume`, t);
  }
};
ou.Checkpoints = Op;
var or = class extends Y {
  constructor() {
    super(...arguments), this.methods = new Up(this._client), this.jobs = new ou(this._client), this.checkpoints = new iu(this._client), this.alpha = new ru(this._client);
  }
};
or.Methods = Up;
or.Jobs = ou;
or.Checkpoints = iu;
or.Alpha = ru;
var Gp = class extends Y {
}, su = class extends Y {
  constructor() {
    super(...arguments), this.graderModels = new Gp(this._client);
  }
};
su.GraderModels = Gp;
var qp = class extends Y {
  createVariation(e, t) {
    return this._client.post("/images/variations", Ct({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Ct({
      body: e,
      ...t,
      stream: e.stream ?? !1
    }, this._client));
  }
  generate(e, t) {
    return this._client.post("/images/generations", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Vp = class extends Y {
  retrieve(e, t) {
    return this._client.get(U`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", ms, e);
  }
  delete(e, t) {
    return this._client.delete(U`/models/${e}`, t);
  }
}, Hp = class extends Y {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, Kp = class extends Y {
  accept(e, t, n) {
    return this._client.post(U`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: z([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(U`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: z([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(U`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: z([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(U`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: z([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Wp = class extends Y {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, bs = class extends Y {
  constructor() {
    super(...arguments), this.clientSecrets = new Wp(this._client), this.calls = new Kp(this._client);
  }
};
bs.ClientSecrets = Wp;
bs.Calls = Kp;
function N_(e, t) {
  return !t || !D_(t) ? {
    ...e,
    output_parsed: null,
    output: e.output.map((n) => n.type === "function_call" ? {
      ...n,
      parsed_arguments: null
    } : n.type === "message" ? {
      ...n,
      content: n.content.map((r) => ({
        ...r,
        parsed: null
      }))
    } : n)
  } : Jp(e, t);
}
function Jp(e, t) {
  const n = e.output.map((i) => {
    if (i.type === "function_call") return {
      ...i,
      parsed_arguments: U_(t, i)
    };
    if (i.type === "message") {
      const o = i.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: k_(t, s.text)
      } : s);
      return {
        ...i,
        content: o
      };
    }
    return i;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Ja(r), Object.defineProperty(r, "output_parsed", {
    enumerable: !0,
    get() {
      for (const i of r.output)
        if (i.type === "message") {
          for (const o of i.content) if (o.type === "output_text" && o.parsed !== null) return o.parsed;
        }
      return null;
    }
  }), r;
}
function k_(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function D_(e) {
  return !!Wl(e.text?.format);
}
function L_(e) {
  return e?.$brand === "auto-parseable-tool";
}
function $_(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function U_(e, t) {
  const n = $_(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: L_(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Ja(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Ln, Bi, qt, Oi, Dc, Lc, $c, Uc, F_ = class zp extends zl {
  constructor(t) {
    super(), Ln.add(this), Bi.set(this, void 0), qt.set(this, void 0), Oi.set(this, void 0), te(this, Bi, t, "f");
  }
  static createResponse(t, n, r) {
    const i = new zp(n);
    return i._run(() => i._createOrRetrieveResponse(t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  async _createOrRetrieveResponse(t, n, r) {
    const i = r?.signal;
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), R(this, Ln, "m", Dc).call(this);
    let o, s = null;
    "response_id" in n ? (o = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...r,
      signal: this.controller.signal,
      stream: !0
    }), s = n.starting_after ?? null) : o = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of o) R(this, Ln, "m", Lc).call(this, u, s);
    if (o.controller.signal?.aborted) throw new dt();
    return R(this, Ln, "m", $c).call(this);
  }
  [(Bi = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakMap(), Oi = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakSet(), Dc = function() {
    this.ended || te(this, qt, void 0, "f");
  }, Lc = function(n, r) {
    if (this.ended) return;
    const i = (s, u) => {
      (r == null || u.sequence_number > r) && this._emit(s, u);
    }, o = R(this, Ln, "m", Uc).call(this, n);
    switch (i("event", n), n.type) {
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new j(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const u = s.content[n.content_index];
          if (!u) throw new j(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new j(`expected content to be 'output_text', got ${u.type}`);
          i("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new j(`missing output at index ${n.output_index}`);
        s.type === "function_call" && i("response.function_call_arguments.delta", {
          ...n,
          snapshot: s.arguments
        });
        break;
      }
      default:
        i(n.type, n);
        break;
    }
  }, $c = function() {
    if (this.ended) throw new j("stream has ended, this shouldn't happen");
    const n = R(this, qt, "f");
    if (!n) throw new j("request ended without sending any events");
    te(this, qt, void 0, "f");
    const r = B_(n, R(this, Bi, "f"));
    return te(this, Oi, r, "f"), r;
  }, Uc = function(n) {
    let r = R(this, qt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new j(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = te(this, qt, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const i = r.output[n.output_index];
        if (!i) throw new j(`missing output at index ${n.output_index}`);
        const o = i.type, s = n.part;
        o === "message" && s.type !== "reasoning_text" ? i.content.push(s) : o === "reasoning" && s.type === "reasoning_text" && (i.content || (i.content = []), i.content.push(s));
        break;
      }
      case "response.output_text.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new j(`missing output at index ${n.output_index}`);
        if (i.type === "message") {
          const o = i.content[n.content_index];
          if (!o) throw new j(`missing content at index ${n.content_index}`);
          if (o.type !== "output_text") throw new j(`expected content to be 'output_text', got ${o.type}`);
          o.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new j(`missing output at index ${n.output_index}`);
        i.type === "function_call" && (i.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new j(`missing output at index ${n.output_index}`);
        if (i.type === "reasoning") {
          const o = i.content?.[n.content_index];
          if (!o) throw new j(`missing content at index ${n.content_index}`);
          if (o.type !== "reasoning_text") throw new j(`expected content to be 'reasoning_text', got ${o.type}`);
          o.text += n.delta;
        }
        break;
      }
      case "response.completed":
        te(this, qt, n.response, "f");
        break;
    }
    return r;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("event", (i) => {
      const o = n.shift();
      o ? o.resolve(i) : t.push(i);
    }), this.on("end", () => {
      r = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((i, o) => n.push({
        resolve: i,
        reject: o
      })).then((i) => i ? {
        value: i,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  async finalResponse() {
    await this.done();
    const t = R(this, Oi, "f");
    if (!t) throw new j("stream ended without producing a ChatCompletion");
    return t;
  }
};
function B_(e, t) {
  return N_(e, t);
}
var Yp = class extends Y {
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/responses/${e}/input_items`, Te, {
      query: t,
      ...n
    });
  }
}, Xp = class extends Y {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, ws = class extends Y {
  constructor() {
    super(...arguments), this.inputItems = new Yp(this._client), this.inputTokens = new Xp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Ja(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(U`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && Ja(r), r));
  }
  delete(e, t) {
    return this._client.delete(U`/responses/${e}`, {
      ...t,
      headers: z([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Jp(n, e));
  }
  stream(e, t) {
    return F_.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(U`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
ws.InputItems = Yp;
ws.InputTokens = Xp;
var Qp = class extends Y {
  retrieve(e, t) {
    return this._client.get(U`/skills/${e}/content`, {
      ...t,
      headers: z([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Zp = class extends Y {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(U`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: z([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, au = class extends Y {
  constructor() {
    super(...arguments), this.content = new Zp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(U`/skills/${e}/versions`, gs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(U`/skills/${r}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/skills/${e}/versions`, Te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(U`/skills/${r}/versions/${e}`, n);
  }
};
au.Content = Zp;
var Ss = class extends Y {
  constructor() {
    super(...arguments), this.content = new Qp(this._client), this.versions = new au(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", gs({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(U`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(U`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", Te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/skills/${e}`, t);
  }
};
Ss.Content = Qp;
Ss.Versions = au;
var jp = class extends Y {
  create(e, t, n) {
    return this._client.post(U`/uploads/${e}/parts`, Ct({
      body: t,
      ...n
    }, this._client));
  }
}, lu = class extends Y {
  constructor() {
    super(...arguments), this.parts = new jp(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(U`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(U`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
lu.Parts = jp;
var O_ = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((i) => i.status === "rejected");
  if (n.length) {
    for (const i of n) console.error(i.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const i of t) i.status === "fulfilled" && r.push(i.value);
  return r;
}, em = class extends Y {
  create(e, t, n) {
    return this._client.post(U`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(U`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(U`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...i } = t;
    return this._client.getAPIList(U`/vector_stores/${r}/file_batches/${e}/files`, Te, {
      query: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const r = z([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: i, response: o } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse();
      switch (i.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = o.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await vi(s);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return i;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, r) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const i = r?.maxConcurrency ?? 5, o = Math.min(i, t.length), s = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await s.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        c.push(p.id);
      }
    }
    return await O_(Array(o).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, tm = class extends Y {
  create(e, t, n) {
    return this._client.post(U`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(U`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...i } = t;
    return this._client.post(U`/vector_stores/${r}/files/${e}`, {
      body: i,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(U`/vector_stores/${e}/files`, Te, {
      query: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(U`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = z([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const i = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse(), o = i.data;
      switch (o.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = i.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await vi(s);
          break;
        case "failed":
        case "completed":
          return o;
      }
    }
  }
  async upload(e, t, n) {
    const r = await this._client.files.create({
      file: t,
      purpose: "assistants"
    }, n);
    return this.create(e, { file_id: r.id }, n);
  }
  async uploadAndPoll(e, t, n) {
    const r = await this.upload(e, t, n);
    return await this.poll(e, r.id, n);
  }
  content(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.getAPIList(U`/vector_stores/${r}/files/${e}/content`, ms, {
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Es = class extends Y {
  constructor() {
    super(...arguments), this.files = new tm(this._client), this.fileBatches = new em(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/vector_stores/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(U`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Te, {
      query: e,
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(U`/vector_stores/${e}`, {
      ...t,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(U`/vector_stores/${e}/search`, ms, {
      body: t,
      method: "post",
      ...n,
      headers: z([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Es.Files = tm;
Es.FileBatches = em;
var nm = class extends Y {
  create(e, t) {
    return this._client.post("/videos", Ct({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(U`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", ai, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", Ct({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(U`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: z([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Ct({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Ct({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(U`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(U`/videos/${e}/remix`, gs({
      body: t,
      ...n
    }, this._client));
  }
}, Hn, rm, Eo, im = class extends Y {
  constructor() {
    super(...arguments), Hn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    R(this, Hn, "m", rm).call(this, n);
    const i = z([t]).values, o = R(this, Hn, "m", Eo).call(this, i, "webhook-signature"), s = R(this, Hn, "m", Eo).call(this, i, "webhook-timestamp"), u = R(this, Hn, "m", Eo).call(this, i, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new $r("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new $r("Webhook timestamp is too old");
    if (c > d + r) throw new $r("Webhook timestamp is too new");
    const h = o.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${s}.${e}` : `${s}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of h) try {
      const y = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, y, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new $r("The given webhook signature does not match the expected signature");
  }
};
Hn = /* @__PURE__ */ new WeakSet(), rm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Eo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var za, uu, To, om, ta = "workload-identity-auth", ae = class {
  constructor({ baseURL: e = Dn("OPENAI_BASE_URL"), apiKey: t = Dn("OPENAI_API_KEY"), organization: n = Dn("OPENAI_ORG_ID") ?? null, project: r = Dn("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = Dn("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: o, ...s } = {}) {
    if (za.add(this), To.set(this, void 0), this.completions = new Mp(this), this.chat = new Xl(this), this.embeddings = new Dp(this), this.files = new $p(this), this.images = new qp(this), this.audio = new bi(this), this.moderations = new Hp(this), this.models = new Vp(this), this.fineTuning = new or(this), this.graders = new su(this), this.vectorStores = new Es(this), this.webhooks = new im(this), this.beta = new ir(this), this.batches = new Ep(this), this.uploads = new lu(this), this.responses = new ws(this), this.realtime = new bs(this), this.conversations = new eu(this), this.evals = new nu(this), this.containers = new jl(this), this.skills = new Ss(this), this.videos = new nm(this), o) {
      if (t && t !== ta) throw new j("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ta;
    } else if (t === void 0) throw new j("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: r,
      webhookSecret: i,
      workloadIdentity: o,
      ...s,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && kv()) throw new j(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? uu.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = _c(u.logLevel, "ClientOptions.logLevel", this) ?? _c(Dn("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Oh(), te(this, To, Fv, "f"), this._options = u, o && (this._workloadIdentityAuth = new n_(o, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = r, this.webhookSecret = i;
  }
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      workloadIdentity: this._options.workloadIdentity,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: t }) {
  }
  async authHeaders(e) {
    return z([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return Hv(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${qn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${xh()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ge.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof j ? n : new j(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new j(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !R(this, za, "m", om).call(this) && n || this.baseURL, i = Rv(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!lc(o) || !lc(s)) && (t = {
      ...s,
      ...o,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
  }
  async prepareOptions(e) {
    await this._callApiKey();
  }
  async prepareRequest(e, { url: t, options: n }) {
  }
  get(e, t) {
    return this.methodRequest("get", e, t);
  }
  post(e, t) {
    return this.methodRequest("post", e, t);
  }
  patch(e, t) {
    return this.methodRequest("patch", e, t);
  }
  put(e, t) {
    return this.methodRequest("put", e, t);
  }
  delete(e, t) {
    return this.methodRequest("delete", e, t);
  }
  methodRequest(e, t, n) {
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new Qh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, i = r.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(r);
    const { req: o, url: s, timeout: u } = await this.buildRequest(r, { retryCount: i - t });
    await this.prepareRequest(o, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Fe(this).debug(`[${c}] sending request`, dn({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new dt();
    const f = new AbortController(), p = await this.fetchWithAuth(s, o, u, f).catch(ka), m = Date.now();
    if (p instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new dt();
      const v = Na(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Fe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), Fe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, dn({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Fe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Fe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, dn({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - h,
        message: p.message
      })), p instanceof Fh || p instanceof xv ? p : v ? new ql() : new hs({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      if (p.status === 401 && this._workloadIdentityAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await fc(p.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(p);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await fc(p.body), Fe(this).info(`${g} - ${E}`), Fe(this).debug(`[${c}] response error (${E})`, dn({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      Fe(this).info(`${g} - ${v}`);
      const b = await p.text().catch((E) => ka(E).message), _ = Nv(b), w = _ ? void 0 : b;
      throw Fe(this).debug(`[${c}] response error (${v})`, dn({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, _, w, p.headers);
    }
    return Fe(this).info(g), Fe(this).debug(`[${c}] response start`, dn({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: r,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((r) => ({
      method: "get",
      path: e,
      ...r
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new jv(this, n, e);
  }
  async fetchWithAuth(e, t, n, r) {
    if (this._workloadIdentityAuth) {
      const i = t.headers, o = i.get("Authorization");
      if (!o || o === `Bearer ${ta}`) {
        const s = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${s}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: i, method: o, ...s } = t || {}, u = this._makeAbort(r);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    o && (h.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let i;
    const o = r?.get("retry-after-ms");
    if (o) {
      const u = parseFloat(o);
      Number.isNaN(u) || (i = u);
    }
    const s = r?.get("retry-after");
    if (s && !i) {
      const u = parseFloat(s);
      Number.isNaN(u) ? i = Date.parse(s) - Date.now() : i = u * 1e3;
    }
    if (i === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      i = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await vi(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && Mv("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: h } = this.buildBody({ options: n });
    return h && (e.__metadata = {
      ...e.__metadata,
      hasStreamingBody: !0
    }), {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: c,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: u,
      timeout: n.timeout
    };
  }
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
    let i = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = e.idempotencyKey);
    const o = z([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Uv(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(o), o.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0,
      isStreamingBody: !1
    };
    const n = z([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, i = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !i
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: qh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...R(this, To, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
uu = ae, To = /* @__PURE__ */ new WeakMap(), za = /* @__PURE__ */ new WeakSet(), om = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
ae.OpenAI = uu;
ae.DEFAULT_TIMEOUT = 6e5;
ae.OpenAIError = j;
ae.APIError = Ge;
ae.APIConnectionError = hs;
ae.APIConnectionTimeoutError = ql;
ae.APIUserAbortError = dt;
ae.NotFoundError = Mh;
ae.ConflictError = Nh;
ae.RateLimitError = Dh;
ae.BadRequestError = Ih;
ae.AuthenticationError = Rh;
ae.InternalServerError = Lh;
ae.PermissionDeniedError = Ph;
ae.UnprocessableEntityError = kh;
ae.InvalidWebhookSignatureError = $r;
ae.toFile = a_;
ae.Completions = Mp;
ae.Chat = Xl;
ae.Embeddings = Dp;
ae.Files = $p;
ae.Images = qp;
ae.Audio = bi;
ae.Moderations = Hp;
ae.Models = Vp;
ae.FineTuning = or;
ae.Graders = su;
ae.VectorStores = Es;
ae.Webhooks = im;
ae.Beta = ir;
ae.Batches = Ep;
ae.Uploads = lu;
ae.Responses = ws;
ae.Realtime = bs;
ae.Conversations = eu;
ae.Evals = nu;
ae.Containers = jl;
ae.Skills = Ss;
ae.Videos = nm;
function G_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function gt(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function q_(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function na(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (gt(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function fn(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      gt(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => fn(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && gt(e, n, t.text), typeof t.content == "string" && gt(e, n, t.content), typeof t.reasoning_content == "string" && gt(e, n, t.reasoning_content), typeof t.thinking == "string" && gt(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        gt(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && gt(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function V_(e = {}, t = {}) {
  const n = [];
  return fn(n, e.reasoning_content, "推理文本"), fn(n, e.reasoning, "推理文本"), fn(n, e.reasoning_text, "推理文本"), fn(n, e.thinking, "思考块"), fn(n, t.reasoning_content, "推理文本"), fn(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        gt(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        gt(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && gt(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Fc(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((i, o) => {
      try {
        const s = JSON.parse(i[1]);
        n.push({
          id: s.id || `tool-call-${o + 1}`,
          name: String(s.name || ""),
          arguments: typeof s.arguments == "string" ? s.arguments : JSON.stringify(s.arguments || {})
        });
      } catch {
        n.push({
          id: `tool-call-${o + 1}`,
          name: "",
          arguments: ""
        });
      }
    });
  }), n.filter((r) => r.name);
}
function Bc(e) {
  const t = (e.tools || []).map((n) => [`- ${n.function.name}: ${n.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(n.function.parameters || {})}`].join(`
`)).join(`
`);
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    "请严格输出如下边界标记包裹的 JSON，不要改写边界标记：",
    '<tool_call>{"name":"工具名","arguments":{...}}</tool_call>',
    "可以输出多段 <tool_call> ... </tool_call>。",
    "除非必须说明，否则不要在工具调用前后输出多余解释。",
    t ? `可用工具:
${t}` : ""
  ].filter(Boolean).join(`

`);
}
function H_(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const r of e.messages || []) {
    if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
      const i = r.tool_calls.map((o, s) => {
        const u = o.function?.name || "", c = o.id || `tool-call-${s + 1}`;
        return u && t.set(c, u), `<tool_call>${JSON.stringify({
          id: c,
          name: u,
          arguments: G_(o.function?.arguments || "{}")
        })}</tool_call>`;
      }).join(`
`);
      n.push({
        role: "assistant",
        content: [r.content || "", i].filter(Boolean).join(`

`)
      });
      continue;
    }
    if (r.role === "tool") {
      const i = t.get(r.tool_call_id || "") || "unknown_tool", o = String(r.content || "");
      n.push({
        role: "user",
        content: [
          "<tool_result>",
          `name: ${i}`,
          "content:",
          o,
          "</tool_result>"
        ].join(`
`)
      });
      continue;
    }
    n.push({
      role: r.role,
      content: r.content
    });
  }
  return !n.length || n[0].role !== "system" ? n.unshift({
    role: "system",
    content: Bc(e)
  }) : n[0] = {
    ...n[0],
    content: Bc({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function K_(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var W_ = class {
  constructor(e) {
    this.config = e, this.client = new ae({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = {
      model: this.config.model,
      messages: t ? H_(e) : e.messages,
      tools: t ? void 0 : e.tools,
      tool_choice: t ? void 0 : e.toolChoice || "auto",
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    if (!e.reasoning?.enabled && typeof e.temperature == "number" && (n.temperature = e.temperature), e.reasoning?.enabled && (n.reasoning_effort = e.reasoning.effort), typeof e.onStreamProgress == "function") {
      const f = await this.client.chat.completions.create({
        ...n,
        stream: !0
      }, { signal: e.signal }), p = {
        content: "",
        toolCalls: []
      };
      let m = "stop", g = this.config.model;
      for await (const w of f) {
        g = w.model || g;
        const E = w.choices?.[0], A = E?.delta || {};
        E?.finish_reason && (m = E.finish_reason), typeof A.content == "string" && (p.content += A.content), Array.isArray(A.tool_calls) && A.tool_calls.forEach((I) => {
          const C = Number(I.index ?? 0), P = p.toolCalls[C] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          p.toolCalls[C] = {
            ...P,
            id: I.id || P.id,
            type: I.type || P.type,
            function: {
              name: I.function?.name || P.function?.name || "",
              arguments: `${P.function?.arguments || ""}${I.function?.arguments || ""}`
            }
          };
        });
        const S = na(p.content);
        K_(e, {
          text: p.toolCalls.filter((I) => I?.function?.name).length ? S.cleaned : S.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: S.thoughts
        });
      }
      const y = p.toolCalls.map((w) => ({
        id: w.id || `openai-tool-${Date.now()}`,
        name: w.function?.name || "",
        arguments: w.function?.arguments || "{}"
      })).filter((w) => w.name), v = na(p.content), b = y.length ? [] : Fc(v.cleaned), _ = [...y, ...b];
      return {
        text: y.length ? v.cleaned : v.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: _,
        thoughts: v.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const r = await this.client.chat.completions.create(n, { signal: e.signal }), i = r.choices?.[0] || {}, o = i.message || {}, s = V_(o, i), u = (o.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = na(q_(o.content));
    c.thoughts.forEach((f) => s.push(f));
    const d = u.length ? [] : Fc(c.cleaned), h = [...u, ...d];
    return {
      text: u.length ? c.cleaned : c.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
      toolCalls: h,
      thoughts: s,
      finishReason: i.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "openai-compatible"
    };
  }
};
function sm(e, t) {
  return {
    type: "message",
    role: e,
    content: J_(t)
  };
}
function Ko(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function J_(e) {
  if (typeof e == "string") return [{
    type: "input_text",
    text: e
  }];
  if (!Array.isArray(e)) return [{
    type: "input_text",
    text: ""
  }];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "image_url" && n.image_url?.url ? {
    type: "input_image",
    image_url: n.image_url.url
  } : n.type === "text" ? {
    type: "input_text",
    text: n.text || ""
  } : null).filter(Boolean);
  return t.length ? t : [{
    type: "input_text",
    text: ""
  }];
}
function Wo(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Oc(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Wo(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Wo(e, n.summary || "推理摘要", r.text);
    }
  });
}
function z_(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Oc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Oc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function Y_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function X_(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "message" && Array.isArray(r.content)) {
        r.content.forEach((i) => {
          if (!(!i || typeof i != "object")) {
            if (i.type === "output_text" && typeof i.text == "string" && i.text.trim()) {
              n.push(i.text.trim());
              return;
            }
            i.type === "refusal" && typeof i.refusal == "string" && i.refusal.trim() && n.push(i.refusal.trim());
          }
        });
        return;
      }
      typeof r.text == "string" && r.text.trim() && n.push(r.text.trim());
    }
  }), n.join(`
`).trim();
}
function Q_(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const i = n.toLowerCase();
  return !i.includes("proxy error") || !i.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function Z_(e) {
  const t = [];
  for (const n of e.messages || [])
    if (n.role !== "system") {
      if (n.role === "tool") {
        t.push({
          type: "function_call_output",
          call_id: n.tool_call_id || "missing_tool_call_id",
          output: n.content
        });
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Ko(n.content)), n.tool_calls.forEach((r, i) => {
          t.push({
            type: "function_call",
            call_id: r.id || `function_call_${i + 1}`,
            name: r.function?.name || "",
            arguments: r.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(Ko(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? sm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function j_(e) {
  const t = [];
  for (const n of e.messages || []) {
    if (n.role === "system") {
      t.push({
        role: "system",
        content: typeof n.content == "string" ? n.content : ""
      });
      continue;
    }
    if (n.role === "tool") {
      t.push({
        type: "function_call_output",
        call_id: n.tool_call_id || "missing_tool_call_id",
        output: n.content
      });
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Ko(n.content)), n.tool_calls.forEach((r, i) => {
        t.push({
          type: "function_call",
          call_id: r.id || `function_call_${i + 1}`,
          name: r.function?.name || "",
          arguments: r.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(Ko(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? sm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function eb(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function tb(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function nb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ra(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [i = "0", o = "0"] = String(t || "").split(":");
  return Number(n) - Number(i) || Number(r) - Number(o);
}
var rb = class {
  constructor(e) {
    this.config = e, this.client = new ae({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = Q_(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: z_(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: X_(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : Y_(e) || void 0,
        input: c ? j_(e) : Z_(e),
        ...Array.isArray(e.tools) && e.tools.length ? {
          tools: e.tools.map((h) => ({
            type: "function",
            name: h.function.name,
            description: h.function.description,
            parameters: h.function.parameters
          })),
          tool_choice: e.toolChoice || "auto"
        } : {},
        ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
      };
      return !e.reasoning?.enabled && typeof e.temperature == "number" && (d.temperature = e.temperature), e.reasoning?.enabled && (d.reasoning = {
        effort: e.reasoning.effort,
        summary: "detailed"
      }), d;
    }, r = async (c = !1) => {
      const d = n(c);
      return await this.client.responses.create(d, { signal: e.signal });
    }, i = async (c = !1) => {
      const d = n(c), h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const y = [];
        Array.from(p.entries()).sort(([v], [b]) => ra(v, b)).forEach(([, v]) => Wo(y, "推理文本", v)), Array.from(m.entries()).sort(([v], [b]) => ra(v, b)).forEach(([, v]) => Wo(y, "推理摘要", v)), nb(e, {
          text: Array.from(f.entries()).sort(([v], [b]) => ra(v, b)).map(([, v]) => v).join(`
`).trim(),
          thoughts: y
        });
      };
      return h.on("response.output_text.delta", (y) => {
        const v = `${y.output_index}:${y.content_index}`;
        f.set(v, `${f.get(v) || ""}${y.delta}`), g();
      }), h.on("response.reasoning_text.delta", (y) => {
        const v = `${y.output_index}:${y.content_index}`;
        p.set(v, `${p.get(v) || ""}${y.delta}`), g();
      }), h.on("response.reasoning_summary_text.delta", (y) => {
        const v = `${y.output_index}:${y.summary_index}`;
        m.set(v, `${m.get(v) || ""}${y.delta}`), g();
      }), await h.finalResponse();
    }, o = !eb(this.config.baseUrl);
    let s, u;
    try {
      s = typeof e.onStreamProgress == "function" ? await i(!1) : await r(!1), u = t(s), o && !u.text && !u.toolCalls.length && (s = typeof e.onStreamProgress == "function" ? await i(!0) : await r(!0), u = t(s));
    } catch (c) {
      if (!o || !tb(c)) throw c;
      s = typeof e.onStreamProgress == "function" ? await i(!0) : await r(!0), u = t(s);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: s.incomplete_details?.reason || s.status || "stop",
      model: s.model || this.config.model,
      provider: "openai-responses"
    };
  }
};
function J(e, t, n, r, i) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function x(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var am = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return am = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function li(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ya = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, re = class extends Error {
}, st = class Xa extends re {
  constructor(t, n, r, i, o) {
    super(`${Xa.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("request-id"), this.error = n, this.type = o ?? null;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new Ts({
      message: r,
      cause: Ya(n)
    });
    const o = n, s = o?.error?.type;
    return t === 400 ? new um(t, o, r, i, s) : t === 401 ? new cm(t, o, r, i, s) : t === 403 ? new dm(t, o, r, i, s) : t === 404 ? new fm(t, o, r, i, s) : t === 409 ? new hm(t, o, r, i, s) : t === 422 ? new pm(t, o, r, i, s) : t === 429 ? new mm(t, o, r, i, s) : t >= 500 ? new gm(t, o, r, i, s) : new Xa(t, o, r, i, s);
  }
}, vt = class extends st {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ts = class extends st {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, lm = class extends Ts {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, um = class extends st {
}, cm = class extends st {
}, dm = class extends st {
}, fm = class extends st {
}, hm = class extends st {
}, pm = class extends st {
}, mm = class extends st {
}, gm = class extends st {
}, ib = /^[a-z][a-z0-9+.-]*:/i, ob = (e) => ib.test(e), Qa = (e) => (Qa = Array.isArray, Qa(e)), Gc = Qa;
function Za(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function qc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function sb(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ab = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new re(`${e} must be an integer`);
  if (t < 0) throw new re(`${e} must be a positive integer`);
  return t;
}, ym = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, lb = (e) => new Promise((t) => setTimeout(t, e)), Kn = "0.89.0", ub = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function cb() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var db = () => {
  const e = cb();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kn,
    "X-Stainless-OS": Hc(Deno.build.os),
    "X-Stainless-Arch": Vc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kn,
    "X-Stainless-OS": Hc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Vc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = fb();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function fb() {
  if (typeof navigator > "u" || !navigator) return null;
  for (const { key: e, pattern: t } of [
    {
      key: "edge",
      pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "chrome",
      pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "firefox",
      pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "safari",
      pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
    }
  ]) {
    const n = t.exec(navigator.userAgent);
    if (n) return {
      browser: e,
      version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
    };
  }
  return null;
}
var Vc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Hc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Kc, hb = () => Kc ?? (Kc = db());
function pb() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function vm(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function _m(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return vm({
    start() {
    },
    async pull(n) {
      const { done: r, value: i } = await t.next();
      r ? n.close() : n.enqueue(i);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function cu(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function mb(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var gb = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function yb(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new re(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function vb(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var Wc;
function du(e) {
  let t;
  return (Wc ?? (t = new globalThis.TextEncoder(), Wc = t.encode.bind(t)))(e);
}
var Jc;
function zc(e) {
  let t;
  return (Jc ?? (t = new globalThis.TextDecoder(), Jc = t.decode.bind(t)))(e);
}
var et, tt, wi = class {
  constructor() {
    et.set(this, void 0), tt.set(this, void 0), J(this, et, new Uint8Array(), "f"), J(this, tt, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? du(e) : e;
    J(this, et, vb([x(this, et, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = _b(x(this, et, "f"), x(this, tt, "f"))) != null; ) {
      if (r.carriage && x(this, tt, "f") == null) {
        J(this, tt, r.index, "f");
        continue;
      }
      if (x(this, tt, "f") != null && (r.index !== x(this, tt, "f") + 1 || r.carriage)) {
        n.push(zc(x(this, et, "f").subarray(0, x(this, tt, "f") - 1))), J(this, et, x(this, et, "f").subarray(x(this, tt, "f")), "f"), J(this, tt, null, "f");
        continue;
      }
      const i = x(this, tt, "f") !== null ? r.preceding - 1 : r.preceding, o = zc(x(this, et, "f").subarray(0, i));
      n.push(o), J(this, et, x(this, et, "f").subarray(r.index), "f"), J(this, tt, null, "f");
    }
    return n;
  }
  flush() {
    return x(this, et, "f").length ? this.decode(`
`) : [];
  }
};
et = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap();
wi.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
wi.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function _b(e, t) {
  for (let i = t ?? 0; i < e.length; i++) {
    if (e[i] === 10) return {
      preceding: i,
      index: i + 1,
      carriage: !1
    };
    if (e[i] === 13) return {
      preceding: i,
      index: i + 1,
      carriage: !0
    };
  }
  return null;
}
function bb(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Jo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Yc = (e, t, n) => {
  if (e) {
    if (sb(Jo, e)) return e;
    Ve(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Jo))}`);
  }
};
function Wr() {
}
function Gi(e, t, n) {
  return !t || Jo[e] > Jo[n] ? Wr : t[e].bind(t);
}
var wb = {
  error: Wr,
  warn: Wr,
  info: Wr,
  debug: Wr
}, Xc = /* @__PURE__ */ new WeakMap();
function Ve(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return wb;
  const r = Xc.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: Gi("error", t, n),
    warn: Gi("warn", t, n),
    info: Gi("info", t, n),
    debug: Gi("debug", t, n)
  };
  return Xc.set(t, [n, i]), i;
}
var hn = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), yr, ui = class Jr {
  constructor(t, n, r) {
    this.iterator = t, yr.set(this, void 0), this.controller = n, J(this, yr, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? Ve(r) : console;
    async function* s() {
      if (i) throw new re("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of Sb(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw o.error("Could not parse message into JSON:", c.data), o.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw o.error("Could not parse message into JSON:", c.data), o.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = ym(c.data) ?? c.data, h = d?.error?.type;
            throw new st(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (li(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Jr(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new wi(), c = cu(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (i) throw new re("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of o())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (li(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Jr(s, n, r);
  }
  [(yr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), i = (o) => ({ next: () => {
      if (o.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return o.shift();
    } });
    return [new Jr(() => i(t), this.controller, x(this, yr, "f")), new Jr(() => i(n), this.controller, x(this, yr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return vm({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = du(JSON.stringify(i) + `
`);
          r.enqueue(s);
        } catch (i) {
          r.error(i);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Sb(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new re("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new re("Attempted to iterate over a response with no body");
  const n = new Tb(), r = new wi(), i = cu(e.body);
  for await (const o of Eb(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* Eb(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? du(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = bb(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var Tb = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const i = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], i;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = Ab(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Ab(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function bm(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    if (t.options.stream)
      return Ve(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : ui.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : wm(await n.json(), n) : await n.text();
  })();
  return Ve(e).debug(`[${r}] response parsed`, hn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
function wm(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var zr, Sm = class Em extends Promise {
  constructor(t, n, r = bm) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, zr.set(this, void 0), J(this, zr, t, "f");
  }
  _thenUnwrap(t) {
    return new Em(x(this, zr, "f"), this.responsePromise, async (n, r) => wm(t(await this.parseResponse(n, r), r), r.response));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n,
      request_id: n.headers.get("request-id")
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(x(this, zr, "f"), t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
};
zr = /* @__PURE__ */ new WeakMap();
var qi, Tm = class {
  constructor(e, t, n, r) {
    qi.set(this, void 0), J(this, qi, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new re("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await x(this, qi, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(qi = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Cb = class extends Sm {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await bm(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Si = class extends Tm {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.first_id = n.first_id || null, this.last_id = n.last_id || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    if (this.options.query?.before_id) {
      const t = this.first_id;
      return t ? {
        ...this.options,
        query: {
          ...Za(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Za(this.options.query),
        after_id: e
      }
    } : null;
  }
}, It = class extends Tm {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.next_page = n.next_page || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    const e = this.next_page;
    return e ? {
      ...this.options,
      query: {
        ...Za(this.options.query),
        page: e
      }
    } : null;
  }
}, Am = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zn(e, t, n) {
  return Am(), new File(e, t ?? "unknown_file", n);
}
function Ao(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Cm = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", fu = async (e, t, n = !0) => ({
  ...e,
  body: await Ib(e.body, t, n)
}), Qc = /* @__PURE__ */ new WeakMap();
function xb(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Qc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return Qc.set(t, r), r;
}
var Ib = async (e, t, n = !0) => {
  if (!await xb(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([i, o]) => ja(r, i, o, n))), r;
}, Rb = (e) => e instanceof Blob && "name" in e, ja = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let i = {};
      const o = n.headers.get("Content-Type");
      o && (i = { type: o }), e.append(t, Zn([await n.blob()], Ao(n, r), i));
    } else if (Cm(n)) e.append(t, Zn([await new Response(_m(n)).blob()], Ao(n, r)));
    else if (Rb(n)) e.append(t, Zn([n], Ao(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((i) => ja(e, t + "[]", i, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([i, o]) => ja(e, `${t}[${i}]`, o, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, xm = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Pb = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && xm(e), Mb = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Nb(e, t, n) {
  if (Am(), e = await e, t || (t = Ao(e, !0)), Pb(e))
    return e instanceof File && t == null && n == null ? e : Zn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Mb(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zn(await el(i), t, n);
  }
  const r = await el(e);
  if (!n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return Zn(r, t, n);
}
async function el(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (xm(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Cm(e)) for await (const n of e) t.push(...await el(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${kb(e)}`);
  }
  return t;
}
function kb(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Ne = class {
  constructor(e) {
    this._client = e;
  }
}, Im = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Db(e) {
  if (!e) return;
  if (Im in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Gc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = Gc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var H = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of Db(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [Im]: !0,
    values: t,
    nulls: n
  };
};
function Rm(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Zc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Lb = (e = Rm) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Zc) ?? Zc)?.toString) && (g = m + "", o.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) o.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (o.sort((h, f) => h.start - f.start), o.length > 0) {
    let h = 0;
    const f = o.reduce((p, m) => {
      const g = " ".repeat(m.start - h), y = "^".repeat(m.length);
      return h = m.start + m.length, p + g + y;
    }, "");
    throw new re(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, ne = /* @__PURE__ */ Lb(Rm), Pm = class extends Ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/environments/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", It, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(ne`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ni = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Co(e) {
  return typeof e == "object" && e !== null && ni in e;
}
function Mm(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Co(r) && n.add(r[ni]);
  if (t) {
    for (const r of t)
      if (Co(r) && n.add(r[ni]), Array.isArray(r.content))
        for (const i of r.content) Co(i) && n.add(i[ni]);
  }
  return Array.from(n);
}
function Nm(e, t) {
  const n = Mm(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function $b(e) {
  return Co(e) ? { "x-stainless-helper": e[ni] } : {};
}
var km = class extends Ne {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files", Si, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/files/${e}`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/files/${e}/content`, {
      ...n,
      headers: H([{
        "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/files/${e}`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files", fu({
      body: r,
      ...t,
      headers: H([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        $b(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Dm = class extends Ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/models/${e}?beta=true`, {
      ...n,
      headers: H([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Si, {
      query: r,
      ...t,
      headers: H([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Lm = class extends Ne {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(ne`/v1/agents/${e}/versions?beta=true`, It, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, hu = class extends Ne {
  constructor() {
    super(...arguments), this.versions = new Lm(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.get(ne`/v1/agents/${e}?beta=true`, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/agents/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", It, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(ne`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
hu.Versions = Lm;
var $m = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Um(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function jc(e, t, n) {
  const r = Um(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((i) => {
      if (i.type === "text") {
        const o = Object.defineProperty({ ...i }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(o, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return i;
    }),
    parsed_output: null
  } : Fm(e, t, n);
}
function Fm(e, t, n) {
  let r = null;
  const i = e.content.map((o) => {
    if (o.type === "text") {
      const s = Ub(t, o.text);
      r === null && (r = s);
      const u = Object.defineProperty({ ...o }, "parsed_output", {
        value: s,
        enumerable: !1
      });
      return Object.defineProperty(u, "parsed", {
        get() {
          return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), s;
        },
        enumerable: !1
      });
    }
    return o;
  });
  return {
    ...e,
    content: i,
    parsed_output: r
  };
}
function Ub(e, t) {
  const n = Um(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new re(`Failed to parse structured output: ${r}`);
  }
}
var Fb = (e) => {
  let t = 0, n = [];
  for (; t < e.length; ) {
    let r = e[t];
    if (r === "\\") {
      t++;
      continue;
    }
    if (r === "{") {
      n.push({
        type: "brace",
        value: "{"
      }), t++;
      continue;
    }
    if (r === "}") {
      n.push({
        type: "brace",
        value: "}"
      }), t++;
      continue;
    }
    if (r === "[") {
      n.push({
        type: "paren",
        value: "["
      }), t++;
      continue;
    }
    if (r === "]") {
      n.push({
        type: "paren",
        value: "]"
      }), t++;
      continue;
    }
    if (r === ":") {
      n.push({
        type: "separator",
        value: ":"
      }), t++;
      continue;
    }
    if (r === ",") {
      n.push({
        type: "delimiter",
        value: ","
      }), t++;
      continue;
    }
    if (r === '"') {
      let s = "", u = !1;
      for (r = e[++t]; r !== '"'; ) {
        if (t === e.length) {
          u = !0;
          break;
        }
        if (r === "\\") {
          if (t++, t === e.length) {
            u = !0;
            break;
          }
          s += r + e[t], r = e[++t];
        } else
          s += r, r = e[++t];
      }
      r = e[++t], u || n.push({
        type: "string",
        value: s
      });
      continue;
    }
    if (r && /\s/.test(r)) {
      t++;
      continue;
    }
    let i = /[0-9]/;
    if (r && i.test(r) || r === "-" || r === ".") {
      let s = "";
      for (r === "-" && (s += r, r = e[++t]); r && i.test(r) || r === "."; )
        s += r, r = e[++t];
      n.push({
        type: "number",
        value: s
      });
      continue;
    }
    let o = /[a-z]/i;
    if (r && o.test(r)) {
      let s = "";
      for (; r && o.test(r) && t !== e.length; )
        s += r, r = e[++t];
      if (s == "true" || s == "false" || s === "null") n.push({
        type: "name",
        value: s
      });
      else {
        t++;
        continue;
      }
      continue;
    }
    t++;
  }
  return n;
}, Wn = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Wn(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Wn(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Wn(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), Wn(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Wn(e);
  }
  return e;
}, Bb = (e) => {
  let t = [];
  return e.map((n) => {
    n.type === "brace" && (n.value === "{" ? t.push("}") : t.splice(t.lastIndexOf("}"), 1)), n.type === "paren" && (n.value === "[" ? t.push("]") : t.splice(t.lastIndexOf("]"), 1));
  }), t.length > 0 && t.reverse().map((n) => {
    n === "}" ? e.push({
      type: "brace",
      value: "}"
    }) : n === "]" && e.push({
      type: "paren",
      value: "]"
    });
  }), e;
}, Ob = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Bm = (e) => JSON.parse(Ob(Bb(Wn(Fb(e))))), ut, Vt, $n, vr, Vi, _r, br, Hi, wr, Mt, Sr, Ki, Wi, ln, Ji, zi, Er, ia, ed, Yi, oa, sa, aa, td, nd = "__json_buf";
function rd(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Gb = class tl {
  constructor(t, n) {
    ut.add(this), this.messages = [], this.receivedMessages = [], Vt.set(this, void 0), $n.set(this, null), this.controller = new AbortController(), vr.set(this, void 0), Vi.set(this, () => {
    }), _r.set(this, () => {
    }), br.set(this, void 0), Hi.set(this, () => {
    }), wr.set(this, () => {
    }), Mt.set(this, {}), Sr.set(this, !1), Ki.set(this, !1), Wi.set(this, !1), ln.set(this, !1), Ji.set(this, void 0), zi.set(this, void 0), Er.set(this, void 0), Yi.set(this, (r) => {
      if (J(this, Ki, !0, "f"), li(r) && (r = new vt()), r instanceof vt)
        return J(this, Wi, !0, "f"), this._emit("abort", r);
      if (r instanceof re) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new re(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new re(String(r)));
    }), J(this, vr, new Promise((r, i) => {
      J(this, Vi, r, "f"), J(this, _r, i, "f");
    }), "f"), J(this, br, new Promise((r, i) => {
      J(this, Hi, r, "f"), J(this, wr, i, "f");
    }), "f"), x(this, vr, "f").catch(() => {
    }), x(this, br, "f").catch(() => {
    }), J(this, $n, t, "f"), J(this, Er, n?.logger ?? console, "f");
  }
  get response() {
    return x(this, Ji, "f");
  }
  get request_id() {
    return x(this, zi, "f");
  }
  async withResponse() {
    J(this, ln, !0, "f");
    const t = await x(this, vr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new tl(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: i } = {}) {
    const o = new tl(n, { logger: i });
    for (const s of n.messages) o._addMessageParam(s);
    return J(o, $n, {
      ...n,
      stream: !0
    }, "f"), o._run(() => o._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, x(this, Yi, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const i = r?.signal;
    let o;
    i && (i.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), i.addEventListener("abort", o));
    try {
      x(this, ut, "m", oa).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) x(this, ut, "m", sa).call(this, c);
      if (u.controller.signal?.aborted) throw new vt();
      x(this, ut, "m", aa).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (J(this, Ji, t, "f"), J(this, zi, t?.headers.get("request-id"), "f"), x(this, Vi, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return x(this, Sr, "f");
  }
  get errored() {
    return x(this, Ki, "f");
  }
  get aborted() {
    return x(this, Wi, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (x(this, Mt, "f")[t] || (x(this, Mt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = x(this, Mt, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (x(this, Mt, "f")[t] || (x(this, Mt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      J(this, ln, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    J(this, ln, !0, "f"), await x(this, br, "f");
  }
  get currentMessage() {
    return x(this, Vt, "f");
  }
  async finalMessage() {
    return await this.done(), x(this, ut, "m", ia).call(this);
  }
  async finalText() {
    return await this.done(), x(this, ut, "m", ed).call(this);
  }
  _emit(t, ...n) {
    if (x(this, Sr, "f")) return;
    t === "end" && (J(this, Sr, !0, "f"), x(this, Hi, "f").call(this));
    const r = x(this, Mt, "f")[t];
    if (r && (x(this, Mt, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !x(this, ln, "f") && !r?.length && Promise.reject(i), x(this, _r, "f").call(this, i), x(this, wr, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !x(this, ln, "f") && !r?.length && Promise.reject(i), x(this, _r, "f").call(this, i), x(this, wr, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", x(this, ut, "m", ia).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      x(this, ut, "m", oa).call(this), this._connected(null);
      const o = ui.fromReadableStream(t, this.controller);
      for await (const s of o) x(this, ut, "m", sa).call(this, s);
      if (o.controller.signal?.aborted) throw new vt();
      x(this, ut, "m", aa).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(Vt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), Vi = /* @__PURE__ */ new WeakMap(), _r = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), Hi = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), Ki = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakSet(), ia = function() {
    if (this.receivedMessages.length === 0) throw new re("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ed = function() {
    if (this.receivedMessages.length === 0) throw new re("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new re("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, oa = function() {
    this.ended || J(this, Vt, void 0, "f");
  }, sa = function(n) {
    if (this.ended) return;
    const r = x(this, ut, "m", td).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const i = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            i.type === "text" && this._emit("text", n.delta.text, i.text || "");
            break;
          case "citations_delta":
            i.type === "text" && this._emit("citation", n.delta.citation, i.citations ?? []);
            break;
          case "input_json_delta":
            rd(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
            break;
          case "thinking_delta":
            i.type === "thinking" && this._emit("thinking", n.delta.thinking, i.thinking);
            break;
          case "signature_delta":
            i.type === "thinking" && this._emit("signature", i.signature);
            break;
          case "compaction_delta":
            i.type === "compaction" && i.content && this._emit("compaction", i.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(jc(r, x(this, $n, "f"), { logger: x(this, Er, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        J(this, Vt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, aa = function() {
    if (this.ended) throw new re("stream has ended, this shouldn't happen");
    const n = x(this, Vt, "f");
    if (!n) throw new re("request ended without sending any chunks");
    return J(this, Vt, void 0, "f"), jc(n, x(this, $n, "f"), { logger: x(this, Er, "f") });
  }, td = function(n) {
    let r = x(this, Vt, "f");
    if (n.type === "message_start") {
      if (r) throw new re(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new re(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.container = n.delta.container, r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, r.context_management = n.context_management, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (r.usage.iterations = n.usage.iterations), r;
      case "content_block_start":
        return r.content.push(n.content_block), r;
      case "content_block_delta": {
        const i = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            i?.type === "text" && (r.content[n.index] = {
              ...i,
              text: (i.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            i?.type === "text" && (r.content[n.index] = {
              ...i,
              citations: [...i.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (i && rd(i)) {
              let o = i[nd] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              if (Object.defineProperty(s, nd, {
                value: o,
                enumerable: !1,
                writable: !0
              }), o) try {
                s.input = Bm(o);
              } catch (u) {
                const c = new re(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${o}`);
                x(this, Yi, "f").call(this, c);
              }
              r.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            i?.type === "thinking" && (r.content[n.index] = {
              ...i,
              thinking: i.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            i?.type === "thinking" && (r.content[n.index] = {
              ...i,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            i?.type === "compaction" && (r.content[n.index] = {
              ...i,
              content: (i.content || "") + n.delta.content
            });
            break;
          default:
            n.delta;
        }
        return r;
      }
      case "content_block_stop":
        return r;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("streamEvent", (i) => {
      const o = n.shift();
      o ? o.resolve(i) : t.push(i);
    }), this.on("end", () => {
      r = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((i, o) => n.push({
        resolve: i,
        reject: o
      })).then((i) => i ? {
        value: i,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new ui(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Om = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var qb = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`, Tr, Un, un, Pe, We, Qe, Lt, Ht, Ar, id, nl;
function od() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var Gm = class {
  constructor(e, t, n) {
    Tr.add(this), this.client = e, Un.set(this, !1), un.set(this, !1), Pe.set(this, void 0), We.set(this, void 0), Qe.set(this, void 0), Lt.set(this, void 0), Ht.set(this, void 0), Ar.set(this, 0), J(this, Pe, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Mm(t.tools, t.messages)].join(", ");
    J(this, We, {
      ...n,
      headers: H([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), J(this, Ht, od(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Un = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakSet(), id = async function() {
    const t = x(this, Pe, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (x(this, Qe, "f") !== void 0) try {
      const c = await x(this, Qe, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const i = t.model ?? x(this, Pe, "f").params.model, o = t.summaryPrompt ?? qb, s = x(this, Pe, "f").params.messages;
    if (s[s.length - 1].role === "assistant") {
      const c = s[s.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? s.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: i,
      messages: [...s, {
        role: "user",
        content: [{
          type: "text",
          text: o
        }]
      }],
      max_tokens: x(this, Pe, "f").params.max_tokens
    }, {
      signal: x(this, We, "f").signal,
      headers: H([x(this, We, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new re("Expected text response for compaction");
    return x(this, Pe, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (x(this, Un, "f")) throw new re("Cannot iterate over a consumed stream");
    J(this, Un, !0, "f"), J(this, un, !0, "f"), J(this, Lt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (x(this, Pe, "f").params.max_iterations && x(this, Ar, "f") >= x(this, Pe, "f").params.max_iterations) break;
          J(this, un, !1, "f"), J(this, Lt, void 0, "f"), J(this, Ar, (e = x(this, Ar, "f"), e++, e), "f"), J(this, Qe, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...i } = x(this, Pe, "f").params;
          if (i.stream ? (t = this.client.beta.messages.stream({ ...i }, x(this, We, "f")), J(this, Qe, t.finalMessage(), "f"), x(this, Qe, "f").catch(() => {
          }), yield t) : (J(this, Qe, this.client.beta.messages.create({
            ...i,
            stream: !1
          }, x(this, We, "f")), "f"), yield x(this, Qe, "f")), !await x(this, Tr, "m", id).call(this)) {
            if (!x(this, un, "f")) {
              const { role: s, content: u } = await x(this, Qe, "f");
              x(this, Pe, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const o = await x(this, Tr, "m", nl).call(this, x(this, Pe, "f").params.messages.at(-1));
            if (o) x(this, Pe, "f").params.messages.push(o);
            else if (!x(this, un, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!x(this, Qe, "f")) throw new re("ToolRunner concluded without a message from the server");
      x(this, Ht, "f").resolve(await x(this, Qe, "f"));
    } catch (t) {
      throw J(this, Un, !1, "f"), x(this, Ht, "f").promise.catch(() => {
      }), x(this, Ht, "f").reject(t), J(this, Ht, od(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? x(this, Pe, "f").params = e(x(this, Pe, "f").params) : x(this, Pe, "f").params = e, J(this, un, !0, "f"), J(this, Lt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? J(this, We, e(x(this, We, "f")), "f") : J(this, We, {
      ...x(this, We, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = x(this, We, "f").signal) {
    const t = await x(this, Qe, "f") ?? this.params.messages.at(-1);
    return t ? x(this, Tr, "m", nl).call(this, t, e) : null;
  }
  done() {
    return x(this, Ht, "f").promise;
  }
  async runUntilDone() {
    if (!x(this, Un, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return x(this, Pe, "f").params;
  }
  pushMessages(...e) {
    this.setMessagesParams((t) => ({
      ...t,
      messages: [...t.messages, ...e]
    }));
  }
  then(e, t) {
    return this.runUntilDone().then(e, t);
  }
};
nl = async function(t, n = x(this, We, "f").signal) {
  return x(this, Lt, "f") !== void 0 ? x(this, Lt, "f") : (J(this, Lt, Vb(x(this, Pe, "f").params, t, {
    ...x(this, We, "f"),
    signal: n
  }), "f"), x(this, Lt, "f"));
};
async function Vb(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const r = t.content.filter((i) => i.type === "tool_use");
  return r.length === 0 ? null : {
    role: "user",
    content: await Promise.all(r.map(async (i) => {
      const o = e.tools.find((s) => ("name" in s ? s.name : s.mcp_server_name) === i.name);
      if (!o || !("run" in o)) return {
        type: "tool_result",
        tool_use_id: i.id,
        content: `Error: Tool '${i.name}' not found`,
        is_error: !0
      };
      try {
        let s = i.input;
        "parse" in o && o.parse && (s = o.parse(s));
        const u = await o.run(s, {
          toolUseBlock: i,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: i.id,
          content: u
        };
      } catch (s) {
        return {
          type: "tool_result",
          tool_use_id: i.id,
          content: s instanceof Om ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var qm = class Vm {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new wi();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new re("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new re("Attempted to iterate over a response with no body");
    return new Vm(cu(t.body), n);
  }
}, Hm = class extends Ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Si, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(ne`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new re(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: i } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: H([{
        "anthropic-beta": [...i ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => qm.fromResponse(s.response, s.controller));
  }
}, sd = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026"
}, Hb = ["claude-opus-4-6"], Ei = class extends Ne {
  constructor() {
    super(...arguments), this.batches = new Hm(this._client);
  }
  create(e, t) {
    const n = ad(e), { betas: r, ...i } = n;
    i.model in sd && console.warn(`The model '${i.model}' is deprecated and will reach end-of-life on ${sd[i.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), i.model in Hb && i.thinking && i.thinking.type === "enabled" && console.warn(`Using Claude with ${i.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let o = this._client._options.timeout;
    if (!i.stream && o == null) {
      const u = $m[i.model] ?? void 0;
      o = this._client.calculateNonstreamingTimeout(i.max_tokens, u);
    }
    const s = Nm(i.tools, i.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: i,
      timeout: o ?? 6e5,
      ...t,
      headers: H([
        { ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 },
        s,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: H([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Fm(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Gb.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = ad(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Gm(this._client, e, t);
  }
};
function ad(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new re("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Ei.Batches = Hm;
Ei.BetaToolRunner = Gm;
Ei.ToolError = Om;
var Km = class extends Ne {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(ne`/v1/sessions/${e}/events?beta=true`, It, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/sessions/${e}/events?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Wm = class extends Ne {
  retrieve(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.get(ne`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: i, ...o } = t;
    return this._client.post(ne`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: o,
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(ne`/v1/sessions/${e}/resources?beta=true`, It, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.delete(ne`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/sessions/${e}/resources?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, As = class extends Ne {
  constructor() {
    super(...arguments), this.events = new Km(this._client), this.resources = new Wm(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/sessions/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", It, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(ne`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
As.Events = Km;
As.Resources = Wm;
var Jm = class extends Ne {
  create(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.post(ne`/v1/skills/${e}/versions?beta=true`, fu({
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.get(ne`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(ne`/v1/skills/${e}/versions?beta=true`, It, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.delete(ne`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, pu = class extends Ne {
  constructor() {
    super(...arguments), this.versions = new Jm(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", fu({
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", It, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
pu.Versions = Jm;
var zm = class extends Ne {
  create(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/vaults/${e}/credentials?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.get(ne`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: i, ...o } = t;
    return this._client.post(ne`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: o,
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(ne`/v1/vaults/${e}/credentials?beta=true`, It, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.delete(ne`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.post(ne`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, mu = class extends Ne {
  constructor() {
    super(...arguments), this.credentials = new zm(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(ne`/v1/vaults/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", It, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(ne`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(ne`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
mu.Credentials = zm;
var Rt = class extends Ne {
  constructor() {
    super(...arguments), this.models = new Dm(this._client), this.messages = new Ei(this._client), this.agents = new hu(this._client), this.environments = new Pm(this._client), this.sessions = new As(this._client), this.vaults = new mu(this._client), this.files = new km(this._client), this.skills = new pu(this._client);
  }
};
Rt.Models = Dm;
Rt.Messages = Ei;
Rt.Agents = hu;
Rt.Environments = Pm;
Rt.Sessions = As;
Rt.Vaults = mu;
Rt.Files = km;
Rt.Skills = pu;
var Ym = class extends Ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: H([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Xm(e) {
  return e?.output_config?.format;
}
function ld(e, t, n) {
  const r = Xm(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((i) => i.type === "text" ? Object.defineProperty({ ...i }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : i),
    parsed_output: null
  } : Qm(e, t, n);
}
function Qm(e, t, n) {
  let r = null;
  const i = e.content.map((o) => {
    if (o.type === "text") {
      const s = Kb(t, o.text);
      return r === null && (r = s), Object.defineProperty({ ...o }, "parsed_output", {
        value: s,
        enumerable: !1
      });
    }
    return o;
  });
  return {
    ...e,
    content: i,
    parsed_output: r
  };
}
function Kb(e, t) {
  const n = Xm(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new re(`Failed to parse structured output: ${r}`);
  }
}
var ct, Kt, Fn, Cr, Xi, xr, Ir, Qi, Rr, Nt, Pr, Zi, ji, cn, eo, to, Mr, la, ud, ua, ca, da, fa, cd, dd = "__json_buf";
function fd(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Wb = class rl {
  constructor(t, n) {
    ct.add(this), this.messages = [], this.receivedMessages = [], Kt.set(this, void 0), Fn.set(this, null), this.controller = new AbortController(), Cr.set(this, void 0), Xi.set(this, () => {
    }), xr.set(this, () => {
    }), Ir.set(this, void 0), Qi.set(this, () => {
    }), Rr.set(this, () => {
    }), Nt.set(this, {}), Pr.set(this, !1), Zi.set(this, !1), ji.set(this, !1), cn.set(this, !1), eo.set(this, void 0), to.set(this, void 0), Mr.set(this, void 0), ua.set(this, (r) => {
      if (J(this, Zi, !0, "f"), li(r) && (r = new vt()), r instanceof vt)
        return J(this, ji, !0, "f"), this._emit("abort", r);
      if (r instanceof re) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new re(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new re(String(r)));
    }), J(this, Cr, new Promise((r, i) => {
      J(this, Xi, r, "f"), J(this, xr, i, "f");
    }), "f"), J(this, Ir, new Promise((r, i) => {
      J(this, Qi, r, "f"), J(this, Rr, i, "f");
    }), "f"), x(this, Cr, "f").catch(() => {
    }), x(this, Ir, "f").catch(() => {
    }), J(this, Fn, t, "f"), J(this, Mr, n?.logger ?? console, "f");
  }
  get response() {
    return x(this, eo, "f");
  }
  get request_id() {
    return x(this, to, "f");
  }
  async withResponse() {
    J(this, cn, !0, "f");
    const t = await x(this, Cr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new rl(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: i } = {}) {
    const o = new rl(n, { logger: i });
    for (const s of n.messages) o._addMessageParam(s);
    return J(o, Fn, {
      ...n,
      stream: !0
    }, "f"), o._run(() => o._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, x(this, ua, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const i = r?.signal;
    let o;
    i && (i.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), i.addEventListener("abort", o));
    try {
      x(this, ct, "m", ca).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) x(this, ct, "m", da).call(this, c);
      if (u.controller.signal?.aborted) throw new vt();
      x(this, ct, "m", fa).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (J(this, eo, t, "f"), J(this, to, t?.headers.get("request-id"), "f"), x(this, Xi, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return x(this, Pr, "f");
  }
  get errored() {
    return x(this, Zi, "f");
  }
  get aborted() {
    return x(this, ji, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (x(this, Nt, "f")[t] || (x(this, Nt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = x(this, Nt, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (x(this, Nt, "f")[t] || (x(this, Nt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      J(this, cn, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    J(this, cn, !0, "f"), await x(this, Ir, "f");
  }
  get currentMessage() {
    return x(this, Kt, "f");
  }
  async finalMessage() {
    return await this.done(), x(this, ct, "m", la).call(this);
  }
  async finalText() {
    return await this.done(), x(this, ct, "m", ud).call(this);
  }
  _emit(t, ...n) {
    if (x(this, Pr, "f")) return;
    t === "end" && (J(this, Pr, !0, "f"), x(this, Qi, "f").call(this));
    const r = x(this, Nt, "f")[t];
    if (r && (x(this, Nt, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !x(this, cn, "f") && !r?.length && Promise.reject(i), x(this, xr, "f").call(this, i), x(this, Rr, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !x(this, cn, "f") && !r?.length && Promise.reject(i), x(this, xr, "f").call(this, i), x(this, Rr, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", x(this, ct, "m", la).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      x(this, ct, "m", ca).call(this), this._connected(null);
      const o = ui.fromReadableStream(t, this.controller);
      for await (const s of o) x(this, ct, "m", da).call(this, s);
      if (o.controller.signal?.aborted) throw new vt();
      x(this, ct, "m", fa).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(Kt = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), Xi = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), Pr = /* @__PURE__ */ new WeakMap(), Zi = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), Mr = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakSet(), la = function() {
    if (this.receivedMessages.length === 0) throw new re("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ud = function() {
    if (this.receivedMessages.length === 0) throw new re("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new re("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ca = function() {
    this.ended || J(this, Kt, void 0, "f");
  }, da = function(n) {
    if (this.ended) return;
    const r = x(this, ct, "m", cd).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const i = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            i.type === "text" && this._emit("text", n.delta.text, i.text || "");
            break;
          case "citations_delta":
            i.type === "text" && this._emit("citation", n.delta.citation, i.citations ?? []);
            break;
          case "input_json_delta":
            fd(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
            break;
          case "thinking_delta":
            i.type === "thinking" && this._emit("thinking", n.delta.thinking, i.thinking);
            break;
          case "signature_delta":
            i.type === "thinking" && this._emit("signature", i.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(ld(r, x(this, Fn, "f"), { logger: x(this, Mr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        J(this, Kt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, fa = function() {
    if (this.ended) throw new re("stream has ended, this shouldn't happen");
    const n = x(this, Kt, "f");
    if (!n) throw new re("request ended without sending any chunks");
    return J(this, Kt, void 0, "f"), ld(n, x(this, Fn, "f"), { logger: x(this, Mr, "f") });
  }, cd = function(n) {
    let r = x(this, Kt, "f");
    if (n.type === "message_start") {
      if (r) throw new re(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new re(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), r;
      case "content_block_start":
        return r.content.push({ ...n.content_block }), r;
      case "content_block_delta": {
        const i = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            i?.type === "text" && (r.content[n.index] = {
              ...i,
              text: (i.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            i?.type === "text" && (r.content[n.index] = {
              ...i,
              citations: [...i.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (i && fd(i)) {
              let o = i[dd] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              Object.defineProperty(s, dd, {
                value: o,
                enumerable: !1,
                writable: !0
              }), o && (s.input = Bm(o)), r.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            i?.type === "thinking" && (r.content[n.index] = {
              ...i,
              thinking: i.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            i?.type === "thinking" && (r.content[n.index] = {
              ...i,
              signature: n.delta.signature
            });
            break;
          default:
            n.delta;
        }
        return r;
      }
      case "content_block_stop":
        return r;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("streamEvent", (i) => {
      const o = n.shift();
      o ? o.resolve(i) : t.push(i);
    }), this.on("end", () => {
      r = !0;
      for (const i of n) i.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), this.on("error", (i) => {
      r = !0;
      for (const o of n) o.reject(i);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((i, o) => n.push({
        resolve: i,
        reject: o
      })).then((i) => i ? {
        value: i,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new ui(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Zm = class extends Ne {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(ne`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", Si, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(ne`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(ne`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new re(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: H([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, i) => qm.fromResponse(i.response, i.controller));
  }
}, gu = class extends Ne {
  constructor() {
    super(...arguments), this.batches = new Zm(this._client);
  }
  create(e, t) {
    e.model in hd && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${hd[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in Jb && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const i = $m[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, i);
    }
    const r = Nm(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: H([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Qm(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Wb.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, hd = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026",
  "claude-3-5-haiku-latest": "February 19th, 2026",
  "claude-3-5-haiku-20241022": "February 19th, 2026",
  "claude-opus-4-0": "June 15th, 2026",
  "claude-opus-4-20250514": "June 15th, 2026",
  "claude-sonnet-4-0": "June 15th, 2026",
  "claude-sonnet-4-20250514": "June 15th, 2026"
}, Jb = ["claude-opus-4-6"];
gu.Batches = Zm;
var jm = class extends Ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(ne`/v1/models/${e}`, {
      ...n,
      headers: H([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Si, {
      query: r,
      ...t,
      headers: H([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, no = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, il, yu, xo, eg, zb = "\\n\\nHuman:", Yb = "\\n\\nAssistant:", Ie = class {
  constructor({ baseURL: e = no("ANTHROPIC_BASE_URL"), apiKey: t = no("ANTHROPIC_API_KEY") ?? null, authToken: n = no("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    il.add(this), xo.set(this, void 0);
    const i = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!i.dangerouslyAllowBrowser && ub()) throw new re(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? yu.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const o = "warn";
    this.logLevel = o, this.logLevel = Yc(i.logLevel, "ClientOptions.logLevel", this) ?? Yc(no("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? o, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? pb(), J(this, xo, gb, "f"), this._options = i, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
  }
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      authToken: this.authToken,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: t }) {
    if (!(e.get("x-api-key") || e.get("authorization")) && !(this.apiKey && e.get("x-api-key")) && !t.has("x-api-key") && !(this.authToken && e.get("authorization")) && !t.has("authorization"))
      throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
  }
  async authHeaders(e) {
    return H([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return H([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return H([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return yb(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Kn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${am()}`;
  }
  makeStatusError(e, t, n, r) {
    return st.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !x(this, il, "m", eg).call(this) && n || this.baseURL, i = ob(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!qc(o) || !qc(s)) && (t = {
      ...s,
      ...o,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new re("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
    return 600 * 1e3;
  }
  async prepareOptions(e) {
  }
  async prepareRequest(e, { url: t, options: n }) {
  }
  get(e, t) {
    return this.methodRequest("get", e, t);
  }
  post(e, t) {
    return this.methodRequest("post", e, t);
  }
  patch(e, t) {
    return this.methodRequest("patch", e, t);
  }
  put(e, t) {
    return this.methodRequest("put", e, t);
  }
  delete(e, t) {
    return this.methodRequest("delete", e, t);
  }
  methodRequest(e, t, n) {
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new Sm(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, i = r.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(r);
    const { req: o, url: s, timeout: u } = await this.buildRequest(r, { retryCount: i - t });
    await this.prepareRequest(o, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Ve(this).debug(`[${c}] sending request`, hn({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new vt();
    const f = new AbortController(), p = await this.fetchWithTimeout(s, o, u, f).catch(Ya), m = Date.now();
    if (p instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new vt();
      const v = li(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ve(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), Ve(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, hn({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ve(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ve(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, hn({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - h,
        message: p.message
      })), v ? new lm() : new Ts({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([y]) => y === "request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const y = await this.shouldRetry(p);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await mb(p.body), Ve(this).info(`${g} - ${E}`), Ve(this).debug(`[${c}] response error (${E})`, hn({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      Ve(this).info(`${g} - ${v}`);
      const b = await p.text().catch((E) => Ya(E).message), _ = ym(b), w = _ ? void 0 : b;
      throw Ve(this).debug(`[${c}] response error (${v})`, hn({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, _, w, p.headers);
    }
    return Ve(this).info(g), Ve(this).debug(`[${c}] response start`, hn({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: r,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((r) => ({
      method: "get",
      path: e,
      ...r
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new Cb(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: i, method: o, ...s } = t || {}, u = this._makeAbort(r);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    o && (h.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let i;
    const o = r?.get("retry-after-ms");
    if (o) {
      const u = parseFloat(o);
      Number.isNaN(u) || (i = u);
    }
    const s = r?.get("retry-after");
    if (s && !i) {
      const u = parseFloat(s);
      Number.isNaN(u) ? i = Date.parse(s) - Date.now() : i = u * 1e3;
    }
    if (i === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      i = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await lb(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new re("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && ab("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d } = this.buildBody({ options: n });
    return {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: c,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: u,
      timeout: n.timeout
    };
  }
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
    let i = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = e.idempotencyKey);
    const o = H([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...hb(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(o), o.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = H([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: _m(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : x(this, xo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
yu = Ie, xo = /* @__PURE__ */ new WeakMap(), il = /* @__PURE__ */ new WeakSet(), eg = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Ie.Anthropic = yu;
Ie.HUMAN_PROMPT = zb;
Ie.AI_PROMPT = Yb;
Ie.DEFAULT_TIMEOUT = 6e5;
Ie.AnthropicError = re;
Ie.APIError = st;
Ie.APIConnectionError = Ts;
Ie.APIConnectionTimeoutError = lm;
Ie.APIUserAbortError = vt;
Ie.NotFoundError = fm;
Ie.ConflictError = hm;
Ie.RateLimitError = mm;
Ie.BadRequestError = um;
Ie.AuthenticationError = cm;
Ie.InternalServerError = gm;
Ie.PermissionDeniedError = dm;
Ie.UnprocessableEntityError = pm;
Ie.toFile = Nb;
var Ti = class extends Ie {
  constructor() {
    super(...arguments), this.completions = new Ym(this), this.messages = new gu(this), this.models = new jm(this), this.beta = new Rt(this);
  }
};
Ti.Completions = Ym;
Ti.Messages = gu;
Ti.Models = jm;
Ti.Beta = Rt;
function Xb(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Qb(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function tg(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Zb(e) {
  if (typeof e == "string") return [{
    type: "text",
    text: e
  }];
  if (!Array.isArray(e)) return [{
    type: "text",
    text: ""
  }];
  const t = e.map((n) => {
    if (!n || typeof n != "object") return null;
    if (n.type === "text") return {
      type: "text",
      text: n.text || ""
    };
    if (n.type === "image_url" && n.image_url?.url) {
      const r = Qb(n.image_url.url);
      return !r.mediaType || !r.data ? null : {
        type: "image",
        source: {
          type: "base64",
          media_type: r.mediaType,
          data: r.data
        }
      };
    }
    return null;
  }).filter(Boolean);
  return t.length ? t : [{
    type: "text",
    text: ""
  }];
}
function jb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function ew(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && tg(t) || null;
}
function tw(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: tg(e.content) || [] } : void 0;
}
function nw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((r) => {
    (r.tool_calls || []).forEach((i) => {
      i.id && i.function?.name && n.set(i.id, i.function.name);
    });
  });
  for (const r of e)
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const i = ew(r);
        if (i) {
          t.push({
            role: "assistant",
            content: i
          });
          continue;
        }
      }
      if (r.role === "tool") {
        t.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: r.tool_call_id,
            name: n.get(r.tool_call_id || "") || void 0,
            content: r.content
          }]
        });
        continue;
      }
      if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...r.content ? [{
            type: "text",
            text: r.content
          }] : [], ...r.tool_calls.map((i) => ({
            type: "tool_use",
            id: i.id,
            name: i.function.name,
            input: Xb(i.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: Zb(r.content)
      });
    }
  return t;
}
function ha(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var rw = class {
  constructor(e) {
    this.config = e, this.client = new Ti({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.anthropic.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (e.tools || []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), n = jb(e), r = {
      model: this.config.model,
      system: n,
      messages: nw(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.thinking = {
      type: "adaptive",
      display: "summarized"
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const s = this.client.messages.stream(r, { signal: e.signal }), u = /* @__PURE__ */ new Map(), c = () => Array.from(u.entries()).sort(([d], [h]) => d.localeCompare(h)).map(([d, h]) => ({
        label: d.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: h
      })).filter((d) => d.text);
      s.on("text", (d, h) => {
        ha(e, {
          text: h || "",
          thoughts: c()
        });
      }), s.on("thinking", (d, h) => {
        u.set("thinking:0", h || ""), ha(e, { thoughts: c() });
      }), s.on("contentBlock", (d) => {
        d?.type === "redacted_thinking" && (u.set("redacted:0", d.data || ""), ha(e, { thoughts: c() }));
      }), i = await s.finalMessage();
    } else i = await this.client.messages.create(r, { signal: e.signal });
    const o = (i.content || []).filter((s) => s.type === "tool_use" && s.name).map((s, u) => ({
      id: s.id || `anthropic-tool-${u + 1}`,
      name: s.name,
      arguments: JSON.stringify(s.input || {})
    }));
    return {
      text: (i.content || []).filter((s) => s.type === "text").map((s) => s.text || "").join(`
`),
      toolCalls: o,
      thoughts: (i.content || []).filter((s) => s.type === "thinking" || s.type === "redacted_thinking").map((s) => ({
        label: s.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: s.type === "thinking" ? s.thinking || "" : s.data || ""
      })).filter((s) => s.text),
      finishReason: i.stop_reason || "stop",
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: tw(i)
    };
  }
}, iw = /* @__PURE__ */ fs(((e, t) => {
  function n(r, i) {
    typeof i == "boolean" && (i = { forever: i }), this._originalTimeouts = JSON.parse(JSON.stringify(r)), this._timeouts = r, this._options = i || {}, this._maxRetryTime = i && i.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(r) {
    if (this._timeout && clearTimeout(this._timeout), !r) return !1;
    var i = (/* @__PURE__ */ new Date()).getTime();
    if (r && i - this._operationStart >= this._maxRetryTime)
      return this._errors.push(r), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(r);
    var o = this._timeouts.shift();
    if (o === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), o = this._cachedTimeouts.slice(-1);
    else return !1;
    var s = this;
    return this._timer = setTimeout(function() {
      s._attempts++, s._operationTimeoutCb && (s._timeout = setTimeout(function() {
        s._operationTimeoutCb(s._attempts);
      }, s._operationTimeout), s._options.unref && s._timeout.unref()), s._fn(s._attempts);
    }, o), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(r, i) {
    this._fn = r, i && (i.timeout && (this._operationTimeout = i.timeout), i.cb && (this._operationTimeoutCb = i.cb));
    var o = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      o._operationTimeoutCb();
    }, o._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
  }, n.prototype.try = function(r) {
    this.attempt(r);
  }, n.prototype.start = function(r) {
    this.attempt(r);
  }, n.prototype.start = n.prototype.try, n.prototype.errors = function() {
    return this._errors;
  }, n.prototype.attempts = function() {
    return this._attempts;
  }, n.prototype.mainError = function() {
    if (this._errors.length === 0) return null;
    for (var r = {}, i = null, o = 0, s = 0; s < this._errors.length; s++) {
      var u = this._errors[s], c = u.message, d = (r[c] || 0) + 1;
      r[c] = d, d >= o && (i = u, o = d);
    }
    return i;
  };
})), ow = /* @__PURE__ */ fs(((e) => {
  var t = iw();
  e.operation = function(n) {
    return new t(e.timeouts(n), {
      forever: n && (n.forever || n.retries === 1 / 0),
      unref: n && n.unref,
      maxRetryTime: n && n.maxRetryTime
    });
  }, e.timeouts = function(n) {
    if (n instanceof Array) return [].concat(n);
    var r = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: 1 / 0,
      randomize: !1
    };
    for (var i in n) r[i] = n[i];
    if (r.minTimeout > r.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var o = [], s = 0; s < r.retries; s++) o.push(this.createTimeout(s, r));
    return n && n.forever && !o.length && o.push(this.createTimeout(s, r)), o.sort(function(u, c) {
      return u - c;
    }), o;
  }, e.createTimeout = function(n, r) {
    var i = r.randomize ? Math.random() + 1 : 1, o = Math.round(i * Math.max(r.minTimeout, 1) * Math.pow(r.factor, n));
    return o = Math.min(o, r.maxTimeout), o;
  }, e.wrap = function(n, r, i) {
    if (r instanceof Array && (i = r, r = null), !i) {
      i = [];
      for (var o in n) typeof n[o] == "function" && i.push(o);
    }
    for (var s = 0; s < i.length; s++) {
      var u = i[s], c = n[u];
      n[u] = function(h) {
        var f = e.operation(r), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), sw = /* @__PURE__ */ fs(((e, t) => {
  t.exports = ow();
})), aw = /* @__PURE__ */ fs(((e, t) => {
  var n = sw(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], i = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, o = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, s = (c) => r.includes(c), u = (c, d) => new Promise((h, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (m) => {
      try {
        h(await c(m));
      } catch (g) {
        if (!(g instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof i)
          p.stop(), f(g.originalError);
        else if (g instanceof TypeError && !s(g.message))
          p.stop(), f(g);
        else {
          o(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (y) {
            f(y);
            return;
          }
          p.retry(g) || f(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = i;
})), pd = /* @__PURE__ */ Cv(aw(), 1), lw = void 0, uw = void 0;
function cw() {
  return {
    geminiUrl: lw,
    vertexUrl: uw
  };
}
function dw(e, t, n, r) {
  var i, o;
  if (!e?.baseUrl) {
    const s = cw();
    return t ? (i = s.vertexUrl) !== null && i !== void 0 ? i : n : (o = s.geminiUrl) !== null && o !== void 0 ? o : r;
  }
  return e.baseUrl;
}
var Bt = class {
};
function V(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, r) => {
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const i = t[r];
      return i != null ? String(i) : "";
    } else throw new Error(`Key '${r}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let o = 0; o < t.length - 1; o++) {
    const s = t[o];
    if (s.endsWith("[]")) {
      const u = s.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${s}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const h = c[d];
          l(h, t.slice(o + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(o + 1), n);
      }
      return;
    } else if (s.endsWith("[0]")) {
      const u = s.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(o + 1), n);
      return;
    }
    (!e[s] || typeof e[s] != "object") && (e[s] = {}), e = e[s];
  }
  const r = t[t.length - 1], i = e[r];
  if (i !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === i) return;
    if (typeof i == "object" && typeof n == "object" && i !== null && n !== null) Object.assign(i, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${r}`);
  } else r === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[r] = n;
}
function a(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let r = 0; r < t.length; r++) {
      if (typeof e != "object" || e === null) return n;
      const i = t[r];
      if (i.endsWith("[]")) {
        const o = i.slice(0, -2);
        if (o in e) {
          const s = e[o];
          return Array.isArray(s) ? s.map((u) => a(u, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[i];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function fw(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const i = n.split("."), o = r.split("."), s = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < i.length; c++) if (i[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && o.length > u) for (let c = u; c < o.length; c++) {
      const d = o[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && s.add(d);
    }
    ol(e, i, o, 0, s);
  }
}
function ol(e, t, n, r, i) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const o = t[r];
  if (o.endsWith("[]")) {
    const s = o.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) ol(c, t, n, r + 1, i);
  } else if (o === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const s = e, u = Object.keys(s).filter((d) => !d.startsWith("_") && !i.has(d)), c = {};
      for (const d of u) c[d] = s[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(r)) p === "*" ? f.push(d) : f.push(p);
        l(s, f, h);
      }
      for (const d of u) delete s[d];
    }
  } else {
    const s = e;
    o in s && ol(s[o], t, n, r + 1, i);
  }
}
function vu(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function hw(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = a(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function pw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], gw(s)), t;
}
function mw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], yw(s)), t;
}
function gw(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => vw(s))), l(t, ["generatedVideos"], o);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(t, ["raiMediaFilteredReasons"], i), t;
}
function yw(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => _w(s))), l(t, ["generatedVideos"], o);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(t, ["raiMediaFilteredReasons"], i), t;
}
function vw(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], Aw(n)), t;
}
function _w(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], Cw(n)), t;
}
function bw(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function ww(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Sw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], Ew(s)), t;
}
function Ew(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function ng(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], Tw(s)), t;
}
function Tw(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function Aw(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], vu(r));
  const i = a(e, ["encoding"]);
  return i != null && l(t, ["mimeType"], i), t;
}
function Cw(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], vu(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(t, ["mimeType"], i), t;
}
var md;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(md || (md = {}));
var gd;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(gd || (gd = {}));
var yd;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(yd || (yd = {}));
var zt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(zt || (zt = {}));
var vd;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(vd || (vd = {}));
var _d;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(_d || (_d = {}));
var bd;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(bd || (bd = {}));
var wd;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(wd || (wd = {}));
var Sd;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Sd || (Sd = {}));
var Ed;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Ed || (Ed = {}));
var Td;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Td || (Td = {}));
var sl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(sl || (sl = {}));
var ri;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(ri || (ri = {}));
var Ad;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Ad || (Ad = {}));
var Cd;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Cd || (Cd = {}));
var xd;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(xd || (xd = {}));
var Id;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Id || (Id = {}));
var Rd;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Rd || (Rd = {}));
var Pd;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Pd || (Pd = {}));
var Md;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Md || (Md = {}));
var Nd;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Nd || (Nd = {}));
var kd;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(kd || (kd = {}));
var Dd;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Dd || (Dd = {}));
var Ld;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ld || (Ld = {}));
var zo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(zo || (zo = {}));
var $d;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})($d || ($d = {}));
var Ud;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Ud || (Ud = {}));
var Fd;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Fd || (Fd = {}));
var Bd;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Bd || (Bd = {}));
var al;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(al || (al = {}));
var Od;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Od || (Od = {}));
var Gd;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Gd || (Gd = {}));
var qd;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(qd || (qd = {}));
var Vd;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Vd || (Vd = {}));
var Hd;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Hd || (Hd = {}));
var Kd;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Kd || (Kd = {}));
var Wd;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Wd || (Wd = {}));
var ll;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ll || (ll = {}));
var Jd;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Jd || (Jd = {}));
var zd;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(zd || (zd = {}));
var Yo;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Yo || (Yo = {}));
var Yd;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Yd || (Yd = {}));
var Xd;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Xd || (Xd = {}));
var Qd;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Qd || (Qd = {}));
var Zd;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Zd || (Zd = {}));
var jd;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(jd || (jd = {}));
var ef;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(ef || (ef = {}));
var tf;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(tf || (tf = {}));
var nf;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(nf || (nf = {}));
var rf;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(rf || (rf = {}));
var of;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(of || (of = {}));
var sf;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(sf || (sf = {}));
var af;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(af || (af = {}));
var lf;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(lf || (lf = {}));
var uf;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(uf || (uf = {}));
var cf;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(cf || (cf = {}));
var df;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(df || (df = {}));
var ff;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(ff || (ff = {}));
var hf;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(hf || (hf = {}));
var pf;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(pf || (pf = {}));
var mf;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(mf || (mf = {}));
var gf;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(gf || (gf = {}));
var yf;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(yf || (yf = {}));
var vf;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(vf || (vf = {}));
var Yn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Yn || (Yn = {}));
var ul = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Nr = class {
  get text() {
    var e, t, n, r, i, o, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, i, o, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, i, o, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, r, i, o, s, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, i, o, s, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, _f = class {
}, bf = class {
}, xw = class {
}, Iw = class {
}, Rw = class {
}, Pw = class {
}, wf = class {
}, Sf = class {
}, Ef = class {
}, Mw = class {
}, Tf = class rg {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new rg();
    let i;
    const o = t;
    return n ? i = mw(o) : i = pw(o), Object.assign(r, i), r;
  }
}, Af = class {
}, Cf = class {
}, xf = class {
}, If = class {
}, Nw = class {
}, kw = class {
}, Dw = class {
}, Lw = class ig {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new ig(), i = Sw(t);
    return Object.assign(r, i), r;
  }
}, $w = class {
}, Uw = class {
}, Fw = class {
}, Bw = class {
}, Rf = class {
}, Ow = class {
  get text() {
    var e, t, n;
    let r = "", i = !1;
    const o = [];
    for (const s of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(s)) u !== "text" && u !== "thought" && c !== null && o.push(u);
      if (typeof s.text == "string") {
        if (typeof s.thought == "boolean" && s.thought) continue;
        i = !0, r += s.text;
      }
    }
    return o.length > 0 && console.warn(`there are non-text parts ${o} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), i ? r : void 0;
  }
  get data() {
    var e, t, n;
    let r = "";
    const i = [];
    for (const o of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [s, u] of Object.entries(o)) s !== "inlineData" && u !== null && i.push(s);
      o.inlineData && typeof o.inlineData.data == "string" && (r += atob(o.inlineData.data));
    }
    return i.length > 0 && console.warn(`there are non-data parts ${i} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, Gw = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, qw = class og {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new og(), i = ng(t);
    return Object.assign(r, i), r;
  }
};
function pe(e, t) {
  if (!t || typeof t != "string") throw new Error("model is required and must be a string");
  if (t.includes("..") || t.includes("?") || t.includes("&")) throw new Error("invalid model parameter");
  if (e.isVertexAI()) {
    if (t.startsWith("publishers/") || t.startsWith("projects/") || t.startsWith("models/")) return t;
    if (t.indexOf("/") >= 0) {
      const n = t.split("/", 2);
      return `publishers/${n[0]}/models/${n[1]}`;
    } else return `publishers/google/models/${t}`;
  } else return t.startsWith("models/") || t.startsWith("tunedModels/") ? t : `models/${t}`;
}
function sg(e, t) {
  const n = pe(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function ag(e) {
  return Array.isArray(e) ? e.map((t) => Xo(t)) : [Xo(e)];
}
function Xo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function lg(e) {
  const t = Xo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function ug(e) {
  const t = Xo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Pf(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function cg(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Pf(t)) : [Pf(e)];
}
function cl(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Mf(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Nf(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function $e(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return cl(e) ? e : {
    role: "user",
    parts: cg(e)
  };
}
function _u(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = $e(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = $e(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => $e(n)) : [$e(t)];
}
function ze(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Mf(e) || Nf(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [$e(e)];
  }
  const t = [], n = [], r = cl(e[0]);
  for (const i of e) {
    const o = cl(i);
    if (o != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (o) t.push(i);
    else {
      if (Mf(i) || Nf(i)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(i);
    }
  }
  return r || t.push({
    role: "user",
    parts: cg(n)
  }), t;
}
function Vw(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(zt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : zt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(zt).includes(r.toUpperCase()) ? r.toUpperCase() : zt.TYPE_UNSPECIFIED });
  }
}
function jn(e) {
  const t = {}, n = ["items"], r = ["anyOf"], i = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const o = e.anyOf;
  o != null && o.length == 2 && (o[0].type === "null" ? (t.nullable = !0, e = o[1]) : o[1].type === "null" && (t.nullable = !0, e = o[0])), e.type instanceof Array && Vw(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(zt).includes(u.toUpperCase()) ? u.toUpperCase() : zt.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = jn(u);
      else if (r.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(jn(d));
        }
        t[s] = c;
      } else if (i.includes(s)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = jn(h);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function bu(e) {
  return jn(e);
}
function wu(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Su(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function sr(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = jn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = jn(t.response));
  return e;
}
function ar(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function Hw(e, t, n, r = 1) {
  const i = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : i ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : i ? `${n}/${t}` : t;
}
function Ot(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Hw(e, t, "cachedContents");
}
function dg(e) {
  switch (e) {
    case "STATE_UNSPECIFIED":
      return "JOB_STATE_UNSPECIFIED";
    case "CREATING":
      return "JOB_STATE_RUNNING";
    case "ACTIVE":
      return "JOB_STATE_SUCCEEDED";
    case "FAILED":
      return "JOB_STATE_FAILED";
    default:
      return e;
  }
}
function on(e) {
  return vu(e);
}
function Kw(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Ww(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Jw(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function fg(e) {
  var t;
  let n;
  if (Kw(e) && (n = e.name), !(Jw(e) && (n = e.uri, n === void 0)) && !(Ww(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function hg(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function pg(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (zw(e, t)) return e[t];
  return [];
}
function zw(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Yw(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function Xw(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const o = i.name;
    if (r.has(o)) throw new Error(`Duplicate function name ${o} found in MCP tools. Please ensure function names are unique.`);
    r.add(o);
    const s = Yw(i, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function mg(e, t) {
  let n;
  if (typeof t == "string") if (e.isVertexAI()) if (t.startsWith("gs://")) n = {
    format: "jsonl",
    gcsUri: [t]
  };
  else if (t.startsWith("bq://")) n = {
    format: "bigquery",
    bigqueryUri: t
  };
  else throw new Error(`Unsupported string source for Vertex AI: ${t}`);
  else if (t.startsWith("files/")) n = { fileName: t };
  else throw new Error(`Unsupported string source for Gemini API: ${t}`);
  else if (Array.isArray(t)) {
    if (e.isVertexAI()) throw new Error("InlinedRequest[] is not supported in Vertex AI.");
    n = { inlinedRequests: t };
  } else n = t;
  const r = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, i = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (i > 0 || r !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (r > 0 || i !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function Qw(e) {
  if (typeof e != "string") return e;
  const t = e;
  if (t.startsWith("gs://")) return {
    format: "jsonl",
    gcsUri: t
  };
  if (t.startsWith("bq://")) return {
    format: "bigquery",
    bigqueryUri: t
  };
  throw new Error(`Unsupported destination: ${t}`);
}
function gg(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const r = n.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0) return e;
  let i = !1;
  for (const o of r) {
    if (typeof o != "object" || o === null) continue;
    const s = o.response;
    if (!(typeof s != "object" || s === null) && s.embedding !== void 0) {
      i = !0;
      break;
    }
  }
  return i && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function lr(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function yg(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function Zw(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function jw(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function eS(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => DS(s))), l(t, ["inlinedResponses"], o);
  }
  const i = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], o);
  }
  return t;
}
function tS(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigqueryDestination", "outputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function nS(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsDestination", "outputUriPrefix"], r);
  const i = a(e, ["bigqueryUri"]);
  if (i != null && l(t, ["bigqueryDestination", "outputUri"], i), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function Io(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const i = a(e, ["metadata", "state"]);
  i != null && l(t, ["state"], yg(i));
  const o = a(e, ["metadata", "createTime"]);
  o != null && l(t, ["createTime"], o);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], eS(gg(d))), t;
}
function dl(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const i = a(e, ["state"]);
  i != null && l(t, ["state"], yg(i));
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["createTime"]);
  s != null && l(t, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const h = a(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = a(e, ["inputConfig"]);
  f != null && l(t, ["src"], rS(f));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], tS(gg(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function rS(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigquerySource", "inputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function iS(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = a(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const i = a(t, ["inlinedRequests"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => kS(e, s))), l(n, ["requests", "requests"], o);
  }
  return n;
}
function oS(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const i = a(e, ["bigqueryUri"]);
  if (i != null && l(t, ["bigquerySource", "inputUri"], i), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function sS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function aS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function lS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function uS(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = a(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], cS(r));
  const i = a(e, ["tokenCount"]);
  i != null && l(t, ["tokenCount"], i);
  const o = a(e, ["finishReason"]);
  o != null && l(t, ["finishReason"], o);
  const s = a(e, ["groundingMetadata"]);
  s != null && l(t, ["groundingMetadata"], s);
  const u = a(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = a(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = a(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const h = a(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = a(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function cS(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["citations"], r);
  }
  return t;
}
function vg(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => GS(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function dS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const i = a(e, ["webhookConfig"]);
  return t !== void 0 && i != null && l(t, ["batch", "webhookConfig"], i), n;
}
function fS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["dest"]);
  if (t !== void 0 && i != null && l(t, ["outputConfig"], nS(Qw(i))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function kf(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], pe(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], iS(e, mg(e, i)));
  const o = a(t, ["config"]);
  return o != null && dS(o, n), n;
}
function hS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], pe(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["inputConfig"], oS(mg(e, i)));
  const o = a(t, ["config"]);
  return o != null && fS(o, n), n;
}
function pS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function mS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], pe(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], SS(e, i));
  const o = a(t, ["config"]);
  return o != null && pS(o, n), n;
}
function gS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function yS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function vS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function _S(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function bS(e, t) {
  const n = {}, r = a(t, ["contents"]);
  if (r != null) {
    let o = _u(e, r);
    Array.isArray(o) && (o = o.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], o);
  }
  const i = a(t, ["config"]);
  return i != null && (l(n, ["_self"], wS(i, n)), fw(n, { "requests[].*": "requests[].request.*" })), n;
}
function wS(e, t) {
  const n = {}, r = a(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const i = a(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const o = a(e, ["outputDimensionality"]);
  if (t !== void 0 && o != null && l(t, ["requests[]", "outputDimensionality"], o), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function SS(e, t) {
  const n = {}, r = a(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const i = a(t, ["inlinedRequests"]);
  return i != null && l(n, ["requests"], bS(e, i)), n;
}
function ES(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function TS(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function AS(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function CS(e, t, n) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], vg($e(i)));
  const o = a(t, ["temperature"]);
  o != null && l(r, ["temperature"], o);
  const s = a(t, ["topP"]);
  s != null && l(r, ["topP"], s);
  const u = a(t, ["topK"]);
  u != null && l(r, ["topK"], u);
  const c = a(t, ["candidateCount"]);
  c != null && l(r, ["candidateCount"], c);
  const d = a(t, ["maxOutputTokens"]);
  d != null && l(r, ["maxOutputTokens"], d);
  const h = a(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const f = a(t, ["responseLogprobs"]);
  f != null && l(r, ["responseLogprobs"], f);
  const p = a(t, ["logprobs"]);
  p != null && l(r, ["logprobs"], p);
  const m = a(t, ["presencePenalty"]);
  m != null && l(r, ["presencePenalty"], m);
  const g = a(t, ["frequencyPenalty"]);
  g != null && l(r, ["frequencyPenalty"], g);
  const y = a(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const v = a(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const b = a(t, ["responseSchema"]);
  b != null && l(r, ["responseSchema"], bu(b));
  const _ = a(t, ["responseJsonSchema"]);
  if (_ != null && l(r, ["responseJsonSchema"], _), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let W = w;
    Array.isArray(W) && (W = W.map((O) => qS(O))), l(n, ["safetySettings"], W);
  }
  const E = a(t, ["tools"]);
  if (n !== void 0 && E != null) {
    let W = ar(E);
    Array.isArray(W) && (W = W.map((O) => HS(sr(O)))), l(n, ["tools"], W);
  }
  const A = a(t, ["toolConfig"]);
  if (n !== void 0 && A != null && l(n, ["toolConfig"], VS(A)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = a(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], Ot(e, S));
  const I = a(t, ["responseModalities"]);
  I != null && l(r, ["responseModalities"], I);
  const C = a(t, ["mediaResolution"]);
  C != null && l(r, ["mediaResolution"], C);
  const P = a(t, ["speechConfig"]);
  if (P != null && l(r, ["speechConfig"], wu(P)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const T = a(t, ["thinkingConfig"]);
  T != null && l(r, ["thinkingConfig"], T);
  const k = a(t, ["imageConfig"]);
  k != null && l(r, ["imageConfig"], NS(k));
  const F = a(t, ["enableEnhancedCivicAnswers"]);
  if (F != null && l(r, ["enableEnhancedCivicAnswers"], F), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const B = a(t, ["serviceTier"]);
  return n !== void 0 && B != null && l(n, ["serviceTier"], B), r;
}
function xS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => uS(h))), l(t, ["candidates"], d);
  }
  const i = a(e, ["modelVersion"]);
  i != null && l(t, ["modelVersion"], i);
  const o = a(e, ["promptFeedback"]);
  o != null && l(t, ["promptFeedback"], o);
  const s = a(e, ["responseId"]);
  s != null && l(t, ["responseId"], s);
  const u = a(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = a(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function IS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function RS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], lr(e, r)), n;
}
function PS(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], jw(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function MS(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function NS(e) {
  const t = {}, n = a(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const r = a(e, ["imageSize"]);
  if (r != null && l(t, ["imageSize"], r), a(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (a(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (a(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (a(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function kS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["request", "model"], pe(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ze(i);
    Array.isArray(u) && (u = u.map((c) => vg(c))), l(n, ["request", "contents"], u);
  }
  const o = a(t, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], CS(e, s, a(n, ["request"], {}))), n;
}
function DS(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], xS(n));
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function LS(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  if (t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function $S(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const o = a(e, ["filter"]);
  return t !== void 0 && o != null && l(t, ["_query", "filter"], o), n;
}
function US(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && LS(n, t), t;
}
function FS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && $S(n, t), t;
}
function BS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["operations"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Io(s))), l(t, ["batchJobs"], o);
  }
  return t;
}
function OS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["batchPredictionJobs"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => dl(s))), l(t, ["batchJobs"], o);
  }
  return t;
}
function GS(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], ES(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], TS(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], sS(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function qS(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function VS(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], AS(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function HS(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], MS(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], PS(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
var Ft;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Ft || (Ft = {}));
var Nn = class {
  constructor(e, t, n, r) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, r);
  }
  init(e, t, n) {
    var r, i;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let o = { config: {} };
    !n || Object.keys(n).length === 0 ? o = { config: {} } : typeof n == "object" ? o = Object.assign({}, n) : o = n, o.config && (o.config.pageToken = t.nextPageToken), this.paramsInternal = o, this.pageInternalSize = (i = (r = o.config) === null || r === void 0 ? void 0 : r.pageSize) !== null && i !== void 0 ? i : this.pageInternal.length;
  }
  initNextPage(e) {
    this.init(this.nameInternal, e, this.paramsInternal);
  }
  get page() {
    return this.pageInternal;
  }
  get name() {
    return this.nameInternal;
  }
  get pageSize() {
    return this.pageInternalSize;
  }
  get sdkHttpResponse() {
    return this.sdkHttpResponseInternal;
  }
  get params() {
    return this.paramsInternal;
  }
  get pageLength() {
    return this.pageInternal.length;
  }
  getItem(e) {
    return this.pageInternal[e];
  }
  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        if (this.idxInternal >= this.pageLength) if (this.hasNextPage()) await this.nextPage();
        else return {
          value: void 0,
          done: !0
        };
        const e = this.getItem(this.idxInternal);
        return this.idxInternal += 1, {
          value: e,
          done: !1
        };
      },
      return: async () => ({
        value: void 0,
        done: !0
      })
    };
  }
  async nextPage() {
    if (!this.hasNextPage()) throw new Error("No more pages to fetch.");
    const e = await this.requestInternal(this.params);
    return this.initNextPage(e), this.page;
  }
  hasNextPage() {
    var e;
    return ((e = this.params.config) === null || e === void 0 ? void 0 : e.pageToken) !== void 0;
  }
}, KS = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nn(Ft.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = kf(this.apiClient, e), n = t._url, r = V("{model}:batchGenerateContent", n), i = t.batch.inputConfig.requests, o = i.requests, s = [];
    for (const u of o) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const h = c.request;
        h.systemInstruction = d, c.request = h;
      }
      s.push(c);
    }
    return i.requests = s, delete t.config, delete t._url, delete t._query, {
      path: r,
      body: t
    };
  }
  getGcsUri(e) {
    if (typeof e == "string") return e.startsWith("gs://") ? e : void 0;
    if (!Array.isArray(e) && e.gcsUri && e.gcsUri.length > 0) return e.gcsUri[0];
  }
  getBigqueryUri(e) {
    if (typeof e == "string") return e.startsWith("bq://") ? e : void 0;
    if (!Array.isArray(e)) return e.bigqueryUri;
  }
  formatDestination(e, t) {
    const n = t ? Object.assign({}, t) : {}, r = Date.now().toString();
    if (n.displayName || (n.displayName = `genaiBatchJob_${r}`), n.dest === void 0) {
      const i = this.getGcsUri(e), o = this.getBigqueryUri(e);
      if (i) i.endsWith(".jsonl") ? n.dest = `${i.slice(0, -6)}/dest` : n.dest = `${i}_dest_${r}`;
      else if (o) n.dest = `${o}_dest_${r}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hS(this.apiClient, e);
      return s = V("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    } else {
      const c = kf(this.apiClient, e);
      return s = V("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Io(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = mS(this.apiClient, e);
      return i = V("{model}:asyncBatchEmbedContent", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Io(u));
    }
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = RS(this.apiClient, e);
      return s = V("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    } else {
      const c = IS(this.apiClient, e);
      return s = V("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Io(d));
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = lS(this.apiClient, e);
      o = V("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = aS(this.apiClient, e);
      o = V("batches/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = FS(e);
      return s = V("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = OS(d), f = new Rf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = US(e);
      return s = V("batches", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = BS(d), f = new Rf();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yS(this.apiClient, e);
      return s = V("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => _S(d));
    } else {
      const c = gS(this.apiClient, e);
      return s = V("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => vS(d));
    }
  }
};
function WS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function JS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Df(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => gE(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Lf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => yE(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function zS(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  t !== void 0 && i != null && l(t, ["expireTime"], i);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let h = ze(s);
    Array.isArray(h) && (h = h.map((f) => Df(f))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Df($e(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => bE(f))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], vE(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function YS(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  t !== void 0 && i != null && l(t, ["expireTime"], i);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = ze(s);
    Array.isArray(f) && (f = f.map((p) => Lf(p))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Lf($e(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => wE(p))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], _E(d));
  const h = a(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function XS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], sg(e, r));
  const i = a(t, ["config"]);
  return i != null && zS(i, n), n;
}
function QS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], sg(e, r));
  const i = a(t, ["config"]);
  return i != null && YS(i, n), n;
}
function ZS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function jS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function eE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function nE(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function rE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function iE(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function oE(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["parameters"]);
  i != null && l(t, ["parameters"], i);
  const o = a(e, ["parametersJsonSchema"]);
  o != null && l(t, ["parametersJsonSchema"], o);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function sE(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function aE(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function lE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], WS(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function uE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function cE(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function dE(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function fE(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && cE(n, t), t;
}
function hE(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && dE(n, t), t;
}
function pE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["cachedContents"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["cachedContents"], o);
  }
  return t;
}
function mE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["cachedContents"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["cachedContents"], o);
  }
  return t;
}
function gE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], nE(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], rE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], JS(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function yE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], o);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function vE(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], iE(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function _E(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function bE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], uE(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], lE(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function wE(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = a(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], i);
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], o);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => oE(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function SE(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  return t !== void 0 && i != null && l(t, ["expireTime"], i), n;
}
function EE(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  return t !== void 0 && i != null && l(t, ["expireTime"], i), n;
}
function TE(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], Ot(e, r));
  const i = a(t, ["config"]);
  return i != null && SE(i, n), n;
}
function AE(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], Ot(e, r));
  const i = a(t, ["config"]);
  return i != null && EE(i, n), n;
}
var CE = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nn(Ft.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = QS(this.apiClient, e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = XS(this.apiClient, e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    }
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = aE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = sE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = jS(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = tE(d), f = new xf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ZS(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = eE(d), f = new xf();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = TE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hE(e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = mE(d), f = new If();
        return Object.assign(f, h), f;
      });
    } else {
      const c = fE(e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = pE(d), f = new If();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Yt(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function $f(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, n = t && e[t], r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == "number") return { next: function() {
    return e && r >= e.length && (e = void 0), {
      value: e && e[r++],
      done: !e
    };
  } };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function ie(e) {
  return this instanceof ie ? (this.v = e, this) : new ie(e);
}
function _t(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), i, o = [];
  return i = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", s), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function s(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    r[m] && (i[m] = function(y) {
      return new Promise(function(v, b) {
        o.push([
          m,
          y,
          v,
          b
        ]) > 1 || c(m, y);
      });
    }, g && (i[m] = g(i[m])));
  }
  function c(m, g) {
    try {
      d(r[m](g));
    } catch (y) {
      p(o[0][3], y);
    }
  }
  function d(m) {
    m.value instanceof ie ? Promise.resolve(m.value.v).then(h, f) : p(o[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), o.shift(), o.length && c(o[0][0], o[0][1]);
  }
}
function bt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof $f == "function" ? $f(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(o) {
    n[o] = e[o] && function(s) {
      return new Promise(function(u, c) {
        s = e[o](s), i(u, c, s.done, s.value);
      });
    };
  }
  function i(o, s, u, c) {
    Promise.resolve(c).then(function(d) {
      o({
        value: d,
        done: u
      });
    }, s);
  }
}
function xE(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : _g(n);
}
function _g(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function IE(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Uf(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const i = [];
    let o = !0;
    for (; r < n && e[r].role === "model"; )
      i.push(e[r]), o && !_g(e[r]) && (o = !1), r++;
    o ? t.push(...i) : t.pop();
  }
  return t;
}
var RE = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new PE(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, PE = class {
  constructor(e, t, n, r = {}, i = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = i, this.sendPromise = Promise.resolve(), IE(i);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = $e(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var i, o, s;
      const u = await r, c = (o = (i = u.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (s = d.slice(h)) !== null && s !== void 0 ? s : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = $e(e.message), r = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = r.then(() => {
    }).catch(() => {
    });
    const i = await r;
    return this.processStreamResponse(i, n);
  }
  getHistory(e = !1) {
    const t = e ? Uf(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return _t(this, arguments, function* () {
      var r, i, o, s, u, c;
      const d = [];
      try {
        for (var h = !0, f = bt(e), p; p = yield ie(f.next()), r = p.done, !r; h = !0) {
          s = p.value, h = !1;
          const m = s;
          if (xE(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield ie(m);
        }
      } catch (m) {
        i = { error: m };
      } finally {
        try {
          !h && !r && (o = f.return) && (yield ie(o.call(f)));
        } finally {
          if (i) throw i.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let r = [];
    t.length > 0 && t.every((i) => i.role !== void 0) ? r = t : r.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Uf(n)) : this.history.push(e), this.history.push(...r);
  }
}, bg = class wg extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, wg.prototype);
  }
};
function ME(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function NE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function kE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], fg(n)), t;
}
function DE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function LE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], fg(n)), t;
}
function $E(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function UE(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function FE(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && UE(n, t), t;
}
function BE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["files"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["files"], o);
  }
  return t;
}
function OE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(t, ["files"], i);
  }
  return t;
}
var GE = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nn(Ft.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async upload(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");
    return this.apiClient.uploadFile(e.file, e.config).then((t) => t);
  }
  async download(e) {
    await this.apiClient.downloadFile(e);
  }
  async registerFiles(e) {
    throw new Error("registerFiles is only supported in Node.js environments.");
  }
  async _registerFiles(e) {
    return this.registerFilesInternal(e);
  }
  async listInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = FE(e);
      return i = V("files", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = BE(u), d = new $w();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = ME(e);
      return i = V("upload/v1beta/files", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = NE(u), d = new Uw();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = LE(e);
      return i = V("files/{file}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = kE(e);
      return i = V("files/{file}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = DE(u), d = new Fw();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = $E(e);
      return i = V("files:register", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = OE(u), d = new Bw();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Ff(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function qE(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ro(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function VE(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => s0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function HE(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => a0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function KE(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function WE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function JE(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["parameters"]);
  i != null && l(t, ["parameters"], i);
  const o = a(e, ["parametersJsonSchema"]);
  o != null && l(t, ["parametersJsonSchema"], o);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function zE(e) {
  const t = {}, n = a(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const r = a(e, ["responseJsonSchema"]);
  r != null && l(t, ["responseJsonSchema"], r);
  const i = a(e, ["audioTimestamp"]);
  i != null && l(t, ["audioTimestamp"], i);
  const o = a(e, ["candidateCount"]);
  o != null && l(t, ["candidateCount"], o);
  const s = a(e, ["enableAffectiveDialog"]);
  s != null && l(t, ["enableAffectiveDialog"], s);
  const u = a(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = a(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = a(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const h = a(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = a(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const p = a(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = a(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = a(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const y = a(e, ["responseSchema"]);
  y != null && l(t, ["responseSchema"], y);
  const v = a(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const b = a(e, ["seed"]);
  b != null && l(t, ["seed"], b);
  const _ = a(e, ["speechConfig"]);
  _ != null && l(t, ["speechConfig"], _);
  const w = a(e, ["stopSequences"]);
  w != null && l(t, ["stopSequences"], w);
  const E = a(e, ["temperature"]);
  E != null && l(t, ["temperature"], E);
  const A = a(e, ["thinkingConfig"]);
  A != null && l(t, ["thinkingConfig"], A);
  const S = a(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const I = a(e, ["topP"]);
  if (I != null && l(t, ["topP"], I), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function YE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], qE(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function XE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function QE(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const i = a(e, ["responseModalities"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const o = a(e, ["temperature"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], o);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Su(f));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], VE($e(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let C = ar(y);
    Array.isArray(C) && (C = C.map((P) => c0(sr(P)))), l(t, ["setup", "tools"], C);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], u0(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], Ff(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], Ff(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const A = a(e, ["proactivity"]);
  if (t !== void 0 && A != null && l(t, ["setup", "proactivity"], A), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const I = a(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let C = I;
    Array.isArray(C) && (C = C.map((P) => l0(P))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function ZE(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], zE(r));
  const i = a(e, ["responseModalities"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const o = a(e, ["temperature"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], o);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Su(f));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], HE($e(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let P = ar(y);
    Array.isArray(P) && (P = P.map((T) => d0(sr(T)))), l(t, ["setup", "tools"], P);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], b);
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], _);
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const A = a(e, ["proactivity"]);
  t !== void 0 && A != null && l(t, ["setup", "proactivity"], A);
  const S = a(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const I = a(e, ["avatarConfig"]);
  t !== void 0 && I != null && l(t, ["setup", "avatarConfig"], I);
  const C = a(e, ["safetySettings"]);
  if (t !== void 0 && C != null) {
    let P = C;
    Array.isArray(P) && (P = P.map((T) => T)), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function jE(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], pe(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], QE(i, n)), n;
}
function e0(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], pe(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], ZE(i, n)), n;
}
function t0(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function n0(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function r0(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = ag(n);
    Array.isArray(d) && (d = d.map((h) => Ro(h))), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], Ro(ug(r)));
  const i = a(e, ["audioStreamEnd"]);
  i != null && l(t, ["audioStreamEnd"], i);
  const o = a(e, ["video"]);
  o != null && l(t, ["video"], Ro(lg(o)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function i0(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = ag(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], ug(r));
  const i = a(e, ["audioStreamEnd"]);
  i != null && l(t, ["audioStreamEnd"], i);
  const o = a(e, ["video"]);
  o != null && l(t, ["video"], lg(o));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function o0(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = a(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const i = a(e, ["toolCall"]);
  i != null && l(t, ["toolCall"], i);
  const o = a(e, ["toolCallCancellation"]);
  o != null && l(t, ["toolCallCancellation"], o);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], f0(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = a(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], h0(h)), t;
}
function s0(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], KE(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], WE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Ro(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function a0(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], o);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function l0(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function u0(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function c0(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], XE(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], YE(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function d0(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = a(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], i);
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], o);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => JE(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function f0(e) {
  const t = {}, n = a(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const r = a(e, ["cachedContentTokenCount"]);
  r != null && l(t, ["cachedContentTokenCount"], r);
  const i = a(e, ["candidatesTokenCount"]);
  i != null && l(t, ["responseTokenCount"], i);
  const o = a(e, ["toolUsePromptTokenCount"]);
  o != null && l(t, ["toolUsePromptTokenCount"], o);
  const s = a(e, ["thoughtsTokenCount"]);
  s != null && l(t, ["thoughtsTokenCount"], s);
  const u = a(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = a(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = a(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const h = a(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = a(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = a(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function h0(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function p0(e, t) {
  const n = {}, r = a(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function m0(e, t) {
  const n = {}, r = a(e, ["data"]);
  if (r != null && l(n, ["data"], r), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function g0(e, t) {
  const n = {}, r = a(e, ["content"]);
  r != null && l(n, ["content"], r);
  const i = a(e, ["citationMetadata"]);
  i != null && l(n, ["citationMetadata"], y0(i));
  const o = a(e, ["tokenCount"]);
  o != null && l(n, ["tokenCount"], o);
  const s = a(e, ["finishReason"]);
  s != null && l(n, ["finishReason"], s);
  const u = a(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = a(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = a(e, ["index"]);
  d != null && l(n, ["index"], d);
  const h = a(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = a(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = a(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function y0(e, t) {
  const n = {}, r = a(e, ["citationSources"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(n, ["citations"], i);
  }
  return n;
}
function v0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let s = ze(o);
    Array.isArray(s) && (s = s.map((u) => ur(u))), l(r, ["contents"], s);
  }
  return r;
}
function _0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["tokensInfo"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["tokensInfo"], o);
  }
  return n;
}
function b0(e, t) {
  const n = {}, r = a(e, ["values"]);
  r != null && l(n, ["values"], r);
  const i = a(e, ["statistics"]);
  return i != null && l(n, ["statistics"], w0(i)), n;
}
function w0(e, t) {
  const n = {}, r = a(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const i = a(e, ["token_count"]);
  return i != null && l(n, ["tokenCount"], i), n;
}
function Ai(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => PT(s))), l(n, ["parts"], o);
  }
  const i = a(e, ["role"]);
  return i != null && l(n, ["role"], i), n;
}
function ur(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => MT(s))), l(n, ["parts"], o);
  }
  const i = a(e, ["role"]);
  return i != null && l(n, ["role"], i), n;
}
function S0(e, t) {
  const n = {}, r = a(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const i = a(e, ["enableControlImageComputation"]);
  return i != null && l(n, ["computeControl"], i), n;
}
function E0(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function T0(e, t, n) {
  const r = {}, i = a(e, ["systemInstruction"]);
  t !== void 0 && i != null && l(t, ["systemInstruction"], ur($e(i)));
  const o = a(e, ["tools"]);
  if (t !== void 0 && o != null) {
    let u = o;
    Array.isArray(u) && (u = u.map((c) => Ag(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], mT(s)), r;
}
function A0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = ze(o);
    Array.isArray(u) && (u = u.map((c) => Ai(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && E0(s), r;
}
function C0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = ze(o);
    Array.isArray(u) && (u = u.map((c) => ur(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && T0(s, r), r;
}
function x0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  i != null && l(n, ["totalTokens"], i);
  const o = a(e, ["cachedContentTokenCount"]);
  return o != null && l(n, ["cachedContentTokenCount"], o), n;
}
function I0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  return i != null && l(n, ["totalTokens"], i), n;
}
function R0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], pe(e, i)), r;
}
function P0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], pe(e, i)), r;
}
function M0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function N0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function k0(e, t, n) {
  const r = {}, i = a(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const o = a(e, ["negativePrompt"]);
  t !== void 0 && o != null && l(t, ["parameters", "negativePrompt"], o);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = a(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const y = a(e, ["outputMimeType"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], y);
  const v = a(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const b = a(e, ["addWatermark"]);
  t !== void 0 && b != null && l(t, ["parameters", "addWatermark"], b);
  const _ = a(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const w = a(e, ["editMode"]);
  t !== void 0 && w != null && l(t, ["parameters", "editMode"], w);
  const E = a(e, ["baseSteps"]);
  return t !== void 0 && E != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], E), r;
}
function D0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => UT(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && k0(u, r), r;
}
function L0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Cs(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function $0(e, t, n) {
  const r = {}, i = a(e, ["taskType"]);
  t !== void 0 && i != null && l(t, ["requests[]", "taskType"], i);
  const o = a(e, ["title"]);
  t !== void 0 && o != null && l(t, ["requests[]", "title"], o);
  const s = a(e, ["outputDimensionality"]);
  if (t !== void 0 && s != null && l(t, ["requests[]", "outputDimensionality"], s), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return r;
}
function U0(e, t, n) {
  const r = {};
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = a(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = a(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let o = a(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const f = a(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (o === "EMBED_CONTENT") {
    const f = a(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = a(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = a(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = a(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = a(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = a(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = a(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = a(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = a(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = a(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = a(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = a(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return r;
}
function F0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let d = _u(e, o);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && Ai($e(s));
  const u = a(t, ["config"]);
  u != null && $0(u, r);
  const c = a(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], pe(e, c)), r;
}
function B0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  let o = a(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = _u(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(r, ["content"], ur($e(c)));
  }
  const u = a(t, ["config"]);
  return u != null && U0(u, r, n), r;
}
function O0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["embeddings"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => u)), l(n, ["embeddings"], s);
  }
  const o = a(e, ["metadata"]);
  return o != null && l(n, ["metadata"], o), n;
}
function G0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions[]", "embeddings"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => b0(u))), l(n, ["embeddings"], s);
  }
  const o = a(e, ["metadata"]);
  if (o != null && l(n, ["metadata"], o), t && a(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const s = a(e, ["embedding"]), u = a(e, ["usageMetadata"]), c = a(e, ["truncated"]);
    if (s) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), s.statistics = d, l(n, ["embeddings"], [s]);
    }
  }
  return n;
}
function q0(e, t) {
  const n = {}, r = a(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["deployedModelId"]);
  return i != null && l(n, ["deployedModelId"], i), n;
}
function V0(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function H0(e, t) {
  const n = {}, r = a(e, ["id"]);
  r != null && l(n, ["id"], r);
  const i = a(e, ["args"]);
  i != null && l(n, ["args"], i);
  const o = a(e, ["name"]);
  if (o != null && l(n, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function K0(e, t) {
  const n = {}, r = a(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const i = a(e, ["mode"]);
  if (i != null && l(n, ["mode"], i), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function W0(e, t) {
  const n = {}, r = a(e, ["description"]);
  r != null && l(n, ["description"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["parameters"]);
  o != null && l(n, ["parameters"], o);
  const s = a(e, ["parametersJsonSchema"]);
  s != null && l(n, ["parametersJsonSchema"], s);
  const u = a(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = a(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function J0(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], Ai($e(o)));
  const s = a(t, ["temperature"]);
  s != null && l(i, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(i, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(i, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(i, ["candidateCount"], d);
  const h = a(t, ["maxOutputTokens"]);
  h != null && l(i, ["maxOutputTokens"], h);
  const f = a(t, ["stopSequences"]);
  f != null && l(i, ["stopSequences"], f);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(i, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(i, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(i, ["presencePenalty"], g);
  const y = a(t, ["frequencyPenalty"]);
  y != null && l(i, ["frequencyPenalty"], y);
  const v = a(t, ["seed"]);
  v != null && l(i, ["seed"], v);
  const b = a(t, ["responseMimeType"]);
  b != null && l(i, ["responseMimeType"], b);
  const _ = a(t, ["responseSchema"]);
  _ != null && l(i, ["responseSchema"], bu(_));
  const w = a(t, ["responseJsonSchema"]);
  if (w != null && l(i, ["responseJsonSchema"], w), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const E = a(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let O = E;
    Array.isArray(O) && (O = O.map((le) => FT(le))), l(n, ["safetySettings"], O);
  }
  const A = a(t, ["tools"]);
  if (n !== void 0 && A != null) {
    let O = ar(A);
    Array.isArray(O) && (O = O.map((le) => WT(sr(le)))), l(n, ["tools"], O);
  }
  const S = a(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], HT(S)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const I = a(t, ["cachedContent"]);
  n !== void 0 && I != null && l(n, ["cachedContent"], Ot(e, I));
  const C = a(t, ["responseModalities"]);
  C != null && l(i, ["responseModalities"], C);
  const P = a(t, ["mediaResolution"]);
  P != null && l(i, ["mediaResolution"], P);
  const T = a(t, ["speechConfig"]);
  if (T != null && l(i, ["speechConfig"], wu(T)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const k = a(t, ["thinkingConfig"]);
  k != null && l(i, ["thinkingConfig"], k);
  const F = a(t, ["imageConfig"]);
  F != null && l(i, ["imageConfig"], bT(F));
  const B = a(t, ["enableEnhancedCivicAnswers"]);
  if (B != null && l(i, ["enableEnhancedCivicAnswers"], B), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = a(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), i;
}
function z0(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], ur($e(o)));
  const s = a(t, ["temperature"]);
  s != null && l(i, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(i, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(i, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(i, ["candidateCount"], d);
  const h = a(t, ["maxOutputTokens"]);
  h != null && l(i, ["maxOutputTokens"], h);
  const f = a(t, ["stopSequences"]);
  f != null && l(i, ["stopSequences"], f);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(i, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(i, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(i, ["presencePenalty"], g);
  const y = a(t, ["frequencyPenalty"]);
  y != null && l(i, ["frequencyPenalty"], y);
  const v = a(t, ["seed"]);
  v != null && l(i, ["seed"], v);
  const b = a(t, ["responseMimeType"]);
  b != null && l(i, ["responseMimeType"], b);
  const _ = a(t, ["responseSchema"]);
  _ != null && l(i, ["responseSchema"], bu(_));
  const w = a(t, ["responseJsonSchema"]);
  w != null && l(i, ["responseJsonSchema"], w);
  const E = a(t, ["routingConfig"]);
  E != null && l(i, ["routingConfig"], E);
  const A = a(t, ["modelSelectionConfig"]);
  A != null && l(i, ["modelConfig"], A);
  const S = a(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let q = S;
    Array.isArray(q) && (q = q.map((X) => X)), l(n, ["safetySettings"], q);
  }
  const I = a(t, ["tools"]);
  if (n !== void 0 && I != null) {
    let q = ar(I);
    Array.isArray(q) && (q = q.map((X) => Ag(sr(X)))), l(n, ["tools"], q);
  }
  const C = a(t, ["toolConfig"]);
  n !== void 0 && C != null && l(n, ["toolConfig"], KT(C));
  const P = a(t, ["labels"]);
  n !== void 0 && P != null && l(n, ["labels"], P);
  const T = a(t, ["cachedContent"]);
  n !== void 0 && T != null && l(n, ["cachedContent"], Ot(e, T));
  const k = a(t, ["responseModalities"]);
  k != null && l(i, ["responseModalities"], k);
  const F = a(t, ["mediaResolution"]);
  F != null && l(i, ["mediaResolution"], F);
  const B = a(t, ["speechConfig"]);
  B != null && l(i, ["speechConfig"], wu(B));
  const W = a(t, ["audioTimestamp"]);
  W != null && l(i, ["audioTimestamp"], W);
  const O = a(t, ["thinkingConfig"]);
  O != null && l(i, ["thinkingConfig"], O);
  const le = a(t, ["imageConfig"]);
  if (le != null && l(i, ["imageConfig"], wT(le)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const ue = a(t, ["modelArmorConfig"]);
  n !== void 0 && ue != null && l(n, ["modelArmorConfig"], ue);
  const D = a(t, ["serviceTier"]);
  return n !== void 0 && D != null && l(n, ["serviceTier"], D), i;
}
function Bf(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = ze(o);
    Array.isArray(u) && (u = u.map((c) => Ai(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], J0(e, s, r)), r;
}
function Of(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = ze(o);
    Array.isArray(u) && (u = u.map((c) => ur(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], z0(e, s, r)), r;
}
function Gf(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["candidates"]);
  if (i != null) {
    let h = i;
    Array.isArray(h) && (h = h.map((f) => g0(f))), l(n, ["candidates"], h);
  }
  const o = a(e, ["modelVersion"]);
  o != null && l(n, ["modelVersion"], o);
  const s = a(e, ["promptFeedback"]);
  s != null && l(n, ["promptFeedback"], s);
  const u = a(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = a(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = a(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function qf(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["candidates"]);
  if (i != null) {
    let h = i;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
  }
  const o = a(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = a(e, ["modelVersion"]);
  s != null && l(n, ["modelVersion"], s);
  const u = a(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = a(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = a(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function Y0(e, t, n) {
  const r = {};
  if (a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const i = a(e, ["numberOfImages"]);
  t !== void 0 && i != null && l(t, ["parameters", "sampleCount"], i);
  const o = a(e, ["aspectRatio"]);
  t !== void 0 && o != null && l(t, ["parameters", "aspectRatio"], o);
  const s = a(e, ["guidanceScale"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "guidanceScale"], s), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = a(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = a(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const h = a(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = a(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const p = a(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = a(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), a(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = a(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), a(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function X0(e, t, n) {
  const r = {}, i = a(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const o = a(e, ["negativePrompt"]);
  t !== void 0 && o != null && l(t, ["parameters", "negativePrompt"], o);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = a(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const y = a(e, ["outputMimeType"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], y);
  const v = a(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const b = a(e, ["addWatermark"]);
  t !== void 0 && b != null && l(t, ["parameters", "addWatermark"], b);
  const _ = a(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const w = a(e, ["imageSize"]);
  t !== void 0 && w != null && l(t, ["parameters", "sampleImageSize"], w);
  const E = a(e, ["enhancePrompt"]);
  return t !== void 0 && E != null && l(t, ["parameters", "enhancePrompt"], E), r;
}
function Q0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && Y0(s, r), r;
}
function Z0(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && X0(s, r), r;
}
function j0(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => dT(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], Eg(o)), n;
}
function eT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Cs(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], Tg(o)), n;
}
function tT(e, t, n) {
  const r = {}, i = a(e, ["numberOfVideos"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "sampleCount"], i), a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const o = a(e, ["durationSeconds"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "durationSeconds"], o), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const s = a(e, ["aspectRatio"]);
  t !== void 0 && s != null && l(t, ["parameters", "aspectRatio"], s);
  const u = a(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = a(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), a(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = a(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const h = a(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), a(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = a(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], xs(f));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((y) => oA(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function nT(e, t, n) {
  const r = {}, i = a(e, ["numberOfVideos"]);
  t !== void 0 && i != null && l(t, ["parameters", "sampleCount"], i);
  const o = a(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = a(e, ["fps"]);
  t !== void 0 && s != null && l(t, ["parameters", "fps"], s);
  const u = a(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = a(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = a(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const h = a(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = a(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = a(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = a(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const y = a(e, ["generateAudio"]);
  t !== void 0 && y != null && l(t, ["parameters", "generateAudio"], y);
  const v = a(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], wt(v));
  const b = a(e, ["referenceImages"]);
  if (t !== void 0 && b != null) {
    let A = b;
    Array.isArray(A) && (A = A.map((S) => sA(S))), l(t, ["instances[0]", "referenceImages"], A);
  }
  const _ = a(e, ["mask"]);
  t !== void 0 && _ != null && l(t, ["instances[0]", "mask"], iA(_));
  const w = a(e, ["compressionQuality"]);
  t !== void 0 && w != null && l(t, ["parameters", "compressionQuality"], w);
  const E = a(e, ["labels"]);
  if (t !== void 0 && E != null && l(t, ["labels"], E), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function rT(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const o = a(e, ["done"]);
  o != null && l(n, ["done"], o);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], aT(u)), n;
}
function iT(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const o = a(e, ["done"]);
  o != null && l(n, ["done"], o);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], lT(u)), n;
}
function oT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], xs(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Cg(u));
  const c = a(t, ["source"]);
  c != null && uT(c, r);
  const d = a(t, ["config"]);
  return d != null && tT(d, r), r;
}
function sT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], wt(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], xg(u));
  const c = a(t, ["source"]);
  c != null && cT(c, r);
  const d = a(t, ["config"]);
  return d != null && nT(d, r), r;
}
function aT(e, t) {
  const n = {}, r = a(e, ["generatedSamples"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => hT(u))), l(n, ["generatedVideos"], s);
  }
  const i = a(e, ["raiMediaFilteredCount"]);
  i != null && l(n, ["raiMediaFilteredCount"], i);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(n, ["raiMediaFilteredReasons"], o), n;
}
function lT(e, t) {
  const n = {}, r = a(e, ["videos"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => pT(u))), l(n, ["generatedVideos"], s);
  }
  const i = a(e, ["raiMediaFilteredCount"]);
  i != null && l(n, ["raiMediaFilteredCount"], i);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(n, ["raiMediaFilteredReasons"], o), n;
}
function uT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], xs(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Cg(s)), r;
}
function cT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], wt(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], xg(s)), r;
}
function dT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], ST(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  return o != null && l(n, ["safetyAttributes"], Eg(o)), n;
}
function Cs(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], Sg(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  o != null && l(n, ["safetyAttributes"], Tg(o));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function fT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["mask"], Sg(r));
  const i = a(e, ["labels"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["labels"], o);
  }
  return n;
}
function hT(e, t) {
  const n = {}, r = a(e, ["video"]);
  return r != null && l(n, ["video"], nA(r)), n;
}
function pT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  return r != null && l(n, ["video"], rA(r)), n;
}
function mT(e, t) {
  const n = {}, r = a(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const i = a(e, ["responseJsonSchema"]);
  i != null && l(n, ["responseJsonSchema"], i);
  const o = a(e, ["audioTimestamp"]);
  o != null && l(n, ["audioTimestamp"], o);
  const s = a(e, ["candidateCount"]);
  s != null && l(n, ["candidateCount"], s);
  const u = a(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = a(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = a(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const h = a(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = a(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const p = a(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = a(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = a(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const y = a(e, ["responseModalities"]);
  y != null && l(n, ["responseModalities"], y);
  const v = a(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const b = a(e, ["routingConfig"]);
  b != null && l(n, ["routingConfig"], b);
  const _ = a(e, ["seed"]);
  _ != null && l(n, ["seed"], _);
  const w = a(e, ["speechConfig"]);
  w != null && l(n, ["speechConfig"], w);
  const E = a(e, ["stopSequences"]);
  E != null && l(n, ["stopSequences"], E);
  const A = a(e, ["temperature"]);
  A != null && l(n, ["temperature"], A);
  const S = a(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const I = a(e, ["topK"]);
  I != null && l(n, ["topK"], I);
  const C = a(e, ["topP"]);
  if (C != null && l(n, ["topP"], C), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function gT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], pe(e, i)), r;
}
function yT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], pe(e, i)), r;
}
function vT(e, t) {
  const n = {}, r = a(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], p0(r));
  const i = a(e, ["enableWidget"]);
  return i != null && l(n, ["enableWidget"], i), n;
}
function _T(e, t) {
  const n = {}, r = a(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const i = a(e, ["timeRangeFilter"]);
  return i != null && l(n, ["timeRangeFilter"], i), n;
}
function bT(e, t) {
  const n = {}, r = a(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const i = a(e, ["imageSize"]);
  if (i != null && l(n, ["imageSize"], i), a(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (a(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (a(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (a(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function wT(e, t) {
  const n = {}, r = a(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const i = a(e, ["imageSize"]);
  i != null && l(n, ["imageSize"], i);
  const o = a(e, ["personGeneration"]);
  o != null && l(n, ["personGeneration"], o);
  const s = a(e, ["prominentPeople"]);
  s != null && l(n, ["prominentPeople"], s);
  const u = a(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = a(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = a(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function ST(e, t) {
  const n = {}, r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], on(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Sg(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["imageBytes"], on(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function xs(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], on(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function wt(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["imageBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], on(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ET(e, t, n, r) {
  const i = {}, o = a(t, ["pageSize"]);
  n !== void 0 && o != null && l(n, ["_query", "pageSize"], o);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hg(e, c)), i;
}
function TT(e, t, n, r) {
  const i = {}, o = a(t, ["pageSize"]);
  n !== void 0 && o != null && l(n, ["_query", "pageSize"], o);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], hg(e, c)), i;
}
function AT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && ET(e, i, r), r;
}
function CT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && TT(e, i, r), r;
}
function xT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["_self"]);
  if (o != null) {
    let s = pg(o);
    Array.isArray(s) && (s = s.map((u) => fl(u))), l(n, ["models"], s);
  }
  return n;
}
function IT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["_self"]);
  if (o != null) {
    let s = pg(o);
    Array.isArray(s) && (s = s.map((u) => hl(u))), l(n, ["models"], s);
  }
  return n;
}
function RT(e, t) {
  const n = {}, r = a(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const i = a(e, ["segmentationClasses"]);
  i != null && l(n, ["maskClasses"], i);
  const o = a(e, ["maskDilation"]);
  return o != null && l(n, ["dilation"], o), n;
}
function fl(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["displayName"]);
  i != null && l(n, ["displayName"], i);
  const o = a(e, ["description"]);
  o != null && l(n, ["description"], o);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], JT(u));
  const c = a(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = a(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = a(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = a(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = a(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = a(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = a(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const y = a(e, ["thinking"]);
  return y != null && l(n, ["thinking"], y), n;
}
function hl(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["displayName"]);
  i != null && l(n, ["displayName"], i);
  const o = a(e, ["description"]);
  o != null && l(n, ["description"], o);
  const s = a(e, ["versionId"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => q0(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], zT(d));
  const h = a(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = a(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function PT(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const i = a(e, ["codeExecutionResult"]);
  i != null && l(n, ["codeExecutionResult"], i);
  const o = a(e, ["executableCode"]);
  o != null && l(n, ["executableCode"], o);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], V0(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], H0(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], m0(d));
  const h = a(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = a(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const y = a(e, ["toolResponse"]);
  y != null && l(n, ["toolResponse"], y);
  const v = a(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function MT(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const i = a(e, ["codeExecutionResult"]);
  i != null && l(n, ["codeExecutionResult"], i);
  const o = a(e, ["executableCode"]);
  o != null && l(n, ["executableCode"], o);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], s);
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const h = a(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function NT(e, t) {
  const n = {}, r = a(e, ["productImage"]);
  return r != null && l(n, ["image"], wt(r)), n;
}
function kT(e, t, n) {
  const r = {}, i = a(e, ["numberOfImages"]);
  t !== void 0 && i != null && l(t, ["parameters", "sampleCount"], i);
  const o = a(e, ["baseSteps"]);
  t !== void 0 && o != null && l(t, ["parameters", "baseSteps"], o);
  const s = a(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const u = a(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = a(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = a(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const h = a(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = a(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = a(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = a(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = a(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), r;
}
function DT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["source"]);
  o != null && $T(o, r);
  const s = a(t, ["config"]);
  return s != null && kT(s, r), r;
}
function LT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => Cs(o))), l(n, ["generatedImages"], i);
  }
  return n;
}
function $T(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["personImage"]);
  t !== void 0 && o != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], wt(o));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => NT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function UT(e, t) {
  const n = {}, r = a(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], wt(r));
  const i = a(e, ["referenceId"]);
  i != null && l(n, ["referenceId"], i);
  const o = a(e, ["referenceType"]);
  o != null && l(n, ["referenceType"], o);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], RT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], S0(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Eg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function Tg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function FT(e, t) {
  const n = {}, r = a(e, ["category"]);
  if (r != null && l(n, ["category"], r), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const i = a(e, ["threshold"]);
  return i != null && l(n, ["threshold"], i), n;
}
function BT(e, t) {
  const n = {}, r = a(e, ["image"]);
  return r != null && l(n, ["image"], wt(r)), n;
}
function OT(e, t, n) {
  const r = {}, i = a(e, ["mode"]);
  t !== void 0 && i != null && l(t, ["parameters", "mode"], i);
  const o = a(e, ["maxPredictions"]);
  t !== void 0 && o != null && l(t, ["parameters", "maxPredictions"], o);
  const s = a(e, ["confidenceThreshold"]);
  t !== void 0 && s != null && l(t, ["parameters", "confidenceThreshold"], s);
  const u = a(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = a(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = a(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function GT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["source"]);
  o != null && VT(o, r);
  const s = a(t, ["config"]);
  return s != null && OT(s, r), r;
}
function qT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => fT(o))), l(n, ["generatedMasks"], i);
  }
  return n;
}
function VT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], wt(o));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], BT(s)), r;
}
function HT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  i != null && l(n, ["functionCallingConfig"], K0(i));
  const o = a(e, ["includeServerSideToolInvocations"]);
  return o != null && l(n, ["includeServerSideToolInvocations"], o), n;
}
function KT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  if (i != null && l(n, ["functionCallingConfig"], i), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function WT(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = a(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const i = a(e, ["fileSearch"]);
  i != null && l(n, ["fileSearch"], i);
  const o = a(e, ["googleSearch"]);
  o != null && l(n, ["googleSearch"], _T(o));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], vT(s));
  const u = a(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = a(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Ag(e, t) {
  const n = {}, r = a(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const i = a(e, ["computerUse"]);
  if (i != null && l(n, ["computerUse"], i), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = a(e, ["googleSearch"]);
  o != null && l(n, ["googleSearch"], o);
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], s);
  const u = a(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = a(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = a(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => W0(g))), l(n, ["functionDeclarations"], m);
  }
  const h = a(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function JT(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
}
function zT(e, t) {
  const n = {}, r = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
}
function YT(e, t, n) {
  const r = {}, i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["description"]);
  t !== void 0 && o != null && l(t, ["description"], o);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function XT(e, t, n) {
  const r = {}, i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["description"]);
  t !== void 0 && o != null && l(t, ["description"], o);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function QT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "name"], pe(e, i));
  const o = a(t, ["config"]);
  return o != null && YT(o, r), r;
}
function ZT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["config"]);
  return o != null && XT(o, r), r;
}
function jT(e, t, n) {
  const r = {}, i = a(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const o = a(e, ["safetyFilterLevel"]);
  t !== void 0 && o != null && l(t, ["parameters", "safetySetting"], o);
  const s = a(e, ["personGeneration"]);
  t !== void 0 && s != null && l(t, ["parameters", "personGeneration"], s);
  const u = a(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = a(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = a(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const h = a(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = a(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = a(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = a(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = a(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), r;
}
function eA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], pe(e, i));
  const o = a(t, ["image"]);
  o != null && l(r, ["instances[0]", "image"], wt(o));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && jT(u, r), r;
}
function tA(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Cs(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function nA(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["encodedVideo"]);
  i != null && l(n, ["videoBytes"], on(i));
  const o = a(e, ["encoding"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function rA(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["videoBytes"], on(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function iA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["_self"], wt(r));
  const i = a(e, ["maskMode"]);
  return i != null && l(n, ["maskMode"], i), n;
}
function oA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], xs(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function sA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], wt(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function Cg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["encodedVideo"], on(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["encoding"], o), n;
}
function xg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], on(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function aA(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function lA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && aA(n, t), t;
}
function uA(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function cA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && uA(r, t), t;
}
function dA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function fA(e, t) {
  const n = {}, r = a(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["customMetadata"], o);
  }
  const i = a(e, ["chunkingConfig"]);
  return t !== void 0 && i != null && l(t, ["chunkingConfig"], i), n;
}
function hA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], mA(s)), t;
}
function pA(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const i = a(e, ["config"]);
  return i != null && fA(i, t), t;
}
function mA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function gA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function yA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && gA(n, t), t;
}
function vA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["fileSearchStores"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["fileSearchStores"], o);
  }
  return t;
}
function Ig(e, t) {
  const n = {}, r = a(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let u = o;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const s = a(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function _A(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["config"]);
  return r != null && Ig(r, t), t;
}
function bA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var wA = "Content-Type", SA = "X-Server-Timeout", EA = "User-Agent", pl = "x-goog-api-client", TA = "google-genai-sdk/1.50.1", AA = "v1beta1", CA = "v1beta", xA = /* @__PURE__ */ new Set(["us", "eu"]), IA = 5, RA = [
  408,
  429,
  500,
  502,
  503,
  504
], PA = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const i = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const o = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !o ? (i.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? i.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && xA.has(this.clientOptions.location) ? i.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (i.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), i.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : AA;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), i.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : CA, i.baseUrl = "https://generativelanguage.googleapis.com/";
    i.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = i, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(i, e.httpOptions));
  }
  isVertexAI() {
    var e;
    return (e = this.clientOptions.vertexai) !== null && e !== void 0 ? e : !1;
  }
  getProject() {
    return this.clientOptions.project;
  }
  getLocation() {
    return this.clientOptions.location;
  }
  getCustomBaseUrl() {
    return this.customBaseUrl;
  }
  async getAuthHeaders() {
    const e = new Headers();
    return await this.clientOptions.auth.addAuthHeaders(e), e;
  }
  getApiVersion() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.apiVersion !== void 0) return this.clientOptions.httpOptions.apiVersion;
    throw new Error("API version is not set.");
  }
  getBaseUrl() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.baseUrl !== void 0) return this.clientOptions.httpOptions.baseUrl;
    throw new Error("Base URL is not set.");
  }
  getRequestUrl() {
    return this.getRequestUrlInternal(this.clientOptions.httpOptions);
  }
  getHeaders() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.headers !== void 0) return this.clientOptions.httpOptions.headers;
    throw new Error("Headers are not set.");
  }
  getRequestUrlInternal(e) {
    if (!e || e.baseUrl === void 0 || e.apiVersion === void 0) throw new Error("HTTP options are not correctly set.");
    const t = [e.baseUrl.endsWith("/") ? e.baseUrl.slice(0, -1) : e.baseUrl];
    return e.apiVersion && e.apiVersion !== "" && t.push(e.apiVersion), t.join("/");
  }
  getBaseResourcePath() {
    return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
  }
  getApiKey() {
    return this.clientOptions.apiKey;
  }
  getWebsocketBaseUrl() {
    const e = this.getBaseUrl(), t = new URL(e);
    return t.protocol = t.protocol == "http:" ? "ws" : "wss", t.toString();
  }
  setBaseUrl(e) {
    if (this.clientOptions.httpOptions) this.clientOptions.httpOptions.baseUrl = e;
    else throw new Error("HTTP options are not correctly set.");
  }
  constructUrl(e, t, n) {
    const r = [this.getRequestUrlInternal(t)];
    return n && r.push(this.getBaseResourcePath()), e !== "" && r.push(e), new URL(`${r.join("/")}`);
  }
  shouldPrependVertexProjectPath(e, t) {
    return !(t.baseUrl && t.baseUrlResourceScope === ll.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [o, s] of Object.entries(e.queryParams)) r.searchParams.append(o, String(s));
    let i = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else i.body = e.body;
    return i = await this.includeExtraHttpOptionsToRequestInit(i, t, r.toString(), e.abortSignal), this.unaryApiCall(r, i, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [r, i] of Object.entries(t)) typeof i == "object" ? n[r] = Object.assign(Object.assign({}, n[r]), i) : i !== void 0 && (n[r] = i);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    (!r.searchParams.has("alt") || r.searchParams.get("alt") !== "sse") && r.searchParams.set("alt", "sse");
    let i = {};
    return i.body = e.body, i = await this.includeExtraHttpOptionsToRequestInit(i, t, r.toString(), e.abortSignal), this.streamApiCall(r, i, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, r) {
    if (t && t.timeout || r) {
      const i = new AbortController(), o = i.signal;
      if (t.timeout && t?.timeout > 0) {
        const s = setTimeout(() => i.abort(), t.timeout);
        s && typeof s.unref == "function" && s.unref();
      }
      r && r.addEventListener("abort", () => {
        i.abort();
      }), e.signal = o;
    }
    return t && t.extraBody !== null && MA(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Vf(r), new ul(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Vf(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return _t(this, arguments, function* () {
      var n;
      const r = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), i = new TextDecoder("utf-8");
      if (!r) throw new Error("Response body is empty");
      try {
        let o = "";
        const s = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield ie(r.read());
          if (c) {
            if (o.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = i.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), y = g.status, v = g.code, b = `got status: ${y}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new bg({
                message: b,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          o += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const y of u) {
              const v = o.indexOf(y);
              v !== -1 && (f === -1 || v < f) && (f = v, p = y.length);
            }
            if (f === -1) break;
            const m = o.substring(0, f);
            o = o.substring(f + p);
            const g = m.trim();
            if (g.startsWith(s)) {
              const y = g.substring(5).trim();
              try {
                yield yield ie(new ul(new Response(y, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (v) {
                throw new Error(`exception parsing stream chunk ${y}. ${v}`);
              }
            }
          }
        }
      } finally {
        r.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    var n;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) return fetch(e, t);
    const r = this.clientOptions.httpOptions.retryOptions, i = async () => {
      const o = await fetch(e, t);
      if (o.ok) return o;
      throw RA.includes(o.status) ? new Error(`Retryable HTTP Error: ${o.statusText}`) : new pd.AbortError(`Non-retryable exception ${o.statusText} sending request`);
    };
    return (0, pd.default)(i, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : IA) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = TA + " " + this.clientOptions.userAgentExtra;
    return e[EA] = t, e[pl] = t, e[wA] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, i] of Object.entries(e.headers)) n.append(r, i);
      e.timeout && e.timeout > 0 && n.append(SA, String(Math.ceil(e.timeout / 1e3)));
    }
    return await this.clientOptions.auth.addAuthHeaders(n, t), n;
  }
  getFileName(e) {
    var t;
    let n = "";
    return typeof e == "string" && (n = e.replace(/[/\\]+$/, ""), n = (t = n.split(/[/\\]/).pop()) !== null && t !== void 0 ? t : ""), n;
  }
  async uploadFile(e, t) {
    var n;
    const r = {};
    t != null && (r.mimeType = t.mimeType, r.name = t.name, r.displayName = t.displayName), r.name && !r.name.startsWith("files/") && (r.name = `files/${r.name}`);
    const i = this.clientOptions.uploader, o = await i.stat(e);
    r.sizeBytes = String(o.size);
    const s = (n = t?.mimeType) !== null && n !== void 0 ? n : o.type;
    if (s === void 0 || s === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    r.mimeType = s;
    const u = { file: r }, c = this.getFileName(e), d = V("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return i.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const i = this.clientOptions.uploader, o = await i.stat(t), s = String(o.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : o.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Ig(n, h);
    const f = await this.fetchUploadUrl(c, s, u, d, h, n?.httpOptions);
    return i.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, i, o) {
    var s;
    let u = {};
    o ? u = o : u = {
      apiVersion: "",
      headers: Object.assign({
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": `${t}`,
        "X-Goog-Upload-Header-Content-Type": `${n}`
      }, r ? { "X-Goog-Upload-File-Name": r } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(i),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (s = c?.headers) === null || s === void 0 ? void 0 : s["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Vf(e) {
  var t;
  if (e === void 0) throw new Error("response is undefined");
  if (!e.ok) {
    const n = e.status;
    let r;
    !((t = e.headers.get("content-type")) === null || t === void 0) && t.includes("application/json") ? r = await e.json() : r = { error: {
      message: await e.text(),
      code: e.status,
      status: e.statusText
    } };
    const i = JSON.stringify(r);
    throw n >= 400 && n < 600 ? new bg({
      message: i,
      status: n
    }) : new Error(i);
  }
}
function MA(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const o = JSON.parse(e.body);
    if (typeof o == "object" && o !== null && !Array.isArray(o)) n = o;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function r(o, s) {
    const u = Object.assign({}, o);
    for (const c in s) if (Object.prototype.hasOwnProperty.call(s, c)) {
      const d = s[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = r(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const i = r(n, t);
  e.body = JSON.stringify(i);
}
var NA = "mcp_used/unknown", kA = !1;
function Rg(e) {
  for (const t of e)
    if (DA(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return kA;
}
function Pg(e) {
  var t;
  e[pl] = (((t = e[pl]) !== null && t !== void 0 ? t : "") + ` ${NA}`).trimStart();
}
function DA(e) {
  return e !== null && typeof e == "object" && e instanceof $A;
}
function LA(e) {
  return _t(this, arguments, function* (n, r = 100) {
    let i, o = 0;
    for (; o < r; ) {
      const s = yield ie(n.listTools({ cursor: i }));
      for (const u of s.tools)
        yield yield ie(u), o++;
      if (!s.nextCursor) break;
      i = s.nextCursor;
    }
  });
}
var $A = class Mg {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Mg(t, n);
  }
  async initialize() {
    var t, n, r, i;
    if (this.mcpTools.length > 0) return;
    const o = {}, s = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, bt(LA(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        i = d.value, u = !1;
        const f = i;
        s.push(f);
        const p = f.name;
        if (o[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        o[p] = h;
      }
    } catch (f) {
      n = { error: f };
    } finally {
      try {
        !u && !t && (r = c.return) && await r.call(c);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = s, this.functionNameToMcpClient = o;
  }
  async tool() {
    return await this.initialize(), Xw(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const r of t) if (r.name in this.functionNameToMcpClient) {
      const i = this.functionNameToMcpClient[r.name];
      let o;
      this.config.timeout && (o = { timeout: this.config.timeout });
      const s = await i.callTool({
        name: r.name,
        arguments: r.args
      }, void 0, o);
      n.push({ functionResponse: {
        name: r.name,
        response: s.isError ? { error: s } : s
      } });
    }
    return n;
  }
};
async function UA(e, t, n) {
  const r = new Gw();
  let i;
  n.data instanceof Blob ? i = JSON.parse(await n.data.text()) : i = JSON.parse(n.data), Object.assign(r, i), t(r);
}
var FA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), i = this.apiClient.getApiVersion(), o = GA(this.apiClient.getDefaultHeaders()), s = `${r}/ws/google.ai.generativelanguage.${i}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (y) => {
        UA(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(s, OA(o), p);
    m.connect(), await c;
    const g = { setup: { model: pe(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new BA(m, this.apiClient);
  }
}, BA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = n0(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = t0(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Yn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Yn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Yn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Yn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function OA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function GA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var qA = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function VA(e, t, n) {
  const r = new Ow();
  let i;
  n.data instanceof Blob ? i = await n.data.text() : n.data instanceof ArrayBuffer ? i = new TextDecoder().decode(n.data) : i = n.data;
  const o = JSON.parse(i);
  if (e.isVertexAI()) {
    const s = o0(o);
    Object.assign(r, s);
  } else Object.assign(r, o);
  t(r);
}
var HA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new FA(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, i, o, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Rg(e.config.tools) && Pg(h);
    const f = zA(h);
    if (this.apiClient.isVertexAI()) {
      const C = this.apiClient.getProject(), P = this.apiClient.getLocation(), T = this.apiClient.getApiKey(), k = !!C && !!P || !!T;
      this.apiClient.getCustomBaseUrl() && !k ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const C = this.apiClient.getApiKey();
      let P = "BidiGenerateContent", T = "key";
      C?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), P = "BidiGenerateContentConstrained", T = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${P}?${T}=${C}`;
    }
    let p = () => {
    };
    const m = new Promise((C) => {
      p = C;
    }), g = e.callbacks, y = function() {
      var C;
      (C = g?.onopen) === null || C === void 0 || C.call(g), p({});
    }, v = this.apiClient, b = {
      onopen: y,
      onmessage: (C) => {
        VA(v, g.onmessage, C);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(C) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(C) {
      }
    }, _ = this.webSocketFactory.create(d, JA(f), b);
    _.connect(), await m;
    let w = pe(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && w.startsWith("publishers/")) {
      const C = this.apiClient.getProject(), P = this.apiClient.getLocation();
      C && P && (w = `projects/${C}/locations/${P}/` + w);
    }
    let E = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [zo.AUDIO] } : e.config.responseModalities = [zo.AUDIO]), !((i = e.config) === null || i === void 0) && i.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const A = (s = (o = e.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : [], S = [];
    for (const C of A) if (this.isCallableTool(C)) {
      const P = C;
      S.push(await P.tool());
    } else S.push(C);
    S.length > 0 && (e.config.tools = S);
    const I = {
      model: w,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? E = e0(this.apiClient, I) : E = jE(this.apiClient, I), delete E.config, _.send(JSON.stringify(E)), new WA(_, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, KA = { turnComplete: !0 }, WA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = ze(t.turns), e.isVertexAI() || (n = n.map((r) => Ai(r)));
      } catch {
        throw new Error(`Failed to parse client content "turns", type: '${typeof t.turns}'`);
      }
      return { clientContent: {
        turns: n,
        turnComplete: t.turnComplete
      } };
    }
    return { clientContent: { turnComplete: t.turnComplete } };
  }
  tLiveClienttToolResponse(e, t) {
    let n = [];
    if (t.functionResponses == null) throw new Error("functionResponses is required.");
    if (Array.isArray(t.functionResponses) ? n = t.functionResponses : n = [t.functionResponses], n.length === 0) throw new Error("functionResponses is required.");
    for (const r of n) {
      if (typeof r != "object" || r === null || !("name" in r) || !("response" in r)) throw new Error(`Could not parse function response, type '${typeof r}'.`);
      if (!e.isVertexAI() && !("id" in r)) throw new Error(qA);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, KA), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: i0(e) } : t = { realtimeInput: r0(e) }, this.conn.send(JSON.stringify(t));
  }
  sendToolResponse(e) {
    if (e.functionResponses == null) throw new Error("Tool response parameters are required.");
    const t = this.tLiveClienttToolResponse(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  close() {
    this.conn.close();
  }
};
function JA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function zA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Hf = 10;
function Kf(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let i = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (er(s)) {
    i = !0;
    break;
  }
  if (!i) return !0;
  const o = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return o && (o < 0 || !Number.isInteger(o)) || o == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", o), !0) : !1;
}
function er(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function YA(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((i) => er(i))) !== null && r !== void 0 ? r : !1;
}
function Wf(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, i) => {
    if (er(r)) return;
    const o = r;
    o.functionDeclarations && o.functionDeclarations.length > 0 && n.push(i);
  }), n;
}
function Jf(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var XA = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = ze(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = ze(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Yo.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Yo.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, i, o, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !YA(t) || Kf(t.config)) return await this.generateContentInternal(u);
      const c = Wf(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = ze(u.contents), p = (i = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && i !== void 0 ? i : Hf;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const v of (s = (o = t.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : []) if (er(v)) {
          const b = await v.callTool(d.functionCalls);
          y.push(...b);
        }
        m++, h = {
          role: "user",
          parts: y
        }, u.contents = ze(u.contents), u.contents.push(g), u.contents.push(h), Jf(u.config) && (f.push(g), f.push(h));
      }
      return Jf(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, i, o, s;
      if (this.maybeMoveToResponseJsonSchem(t), Kf(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Wf(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (i = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || i === void 0 ? void 0 : i.streamFunctionCallArguments, d = (s = (o = t?.config) === null || o === void 0 ? void 0 : o.automaticFunctionCalling) === null || s === void 0 ? void 0 : s.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let i;
      const o = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((r = u?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? i = u?.safetyAttributes : o.push(u);
      let s;
      return i ? s = {
        generatedImages: o,
        positivePromptSafetyAttributes: i,
        sdkHttpResponse: n.sdkHttpResponse
      } : s = {
        generatedImages: o,
        sdkHttpResponse: n.sdkHttpResponse
      }, s;
    }), this.list = async (t) => {
      var n;
      const r = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !r.config.queryBase) {
        if (!((n = r.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        r.config.filter = "labels.tune-type:*";
      }
      return new Nn(Ft.PAGED_ITEM_MODELS, (i) => this.listInternal(i), await this.listInternal(r), r);
    }, this.editImage = async (t) => {
      const n = {
        model: t.model,
        prompt: t.prompt,
        referenceImages: [],
        config: t.config
      };
      return t.referenceImages && t.referenceImages && (n.referenceImages = t.referenceImages.map((r) => r.toReferenceImageAPI())), await this.editImageInternal(n);
    }, this.upscaleImage = async (t) => {
      let n = {
        numberOfImages: 1,
        mode: "upscale"
      };
      t.config && (n = Object.assign(Object.assign({}, n), t.config));
      const r = {
        model: t.model,
        image: t.image,
        upscaleFactor: t.upscaleFactor,
        config: n
      };
      return await this.upscaleImageInternal(r);
    }, this.generateVideos = async (t) => {
      var n, r, i, o, s, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((o = (i = t.source) === null || i === void 0 ? void 0 : i.video) === null || o === void 0) && o.uri && (!((u = (s = t.source) === null || s === void 0 ? void 0 : s.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
        uri: t.source.video.uri,
        mimeType: t.source.video.mimeType
      })), await this.generateVideosInternal(t);
    };
  }
  maybeMoveToResponseJsonSchem(e) {
    e.config && e.config.responseSchema && (e.config.responseJsonSchema || Object.keys(e.config.responseSchema).includes("$schema") && (e.config.responseJsonSchema = e.config.responseSchema, delete e.config.responseSchema));
  }
  async processParamsMaybeAddMcpUsage(e) {
    var t, n, r;
    const i = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!i) return e;
    const o = await Promise.all(i.map(async (u) => er(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: o })
    };
    if (s.config.tools = o, e.config && e.config.tools && Rg(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Pg(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const i = /* @__PURE__ */ new Map();
    for (const o of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (er(o)) {
      const s = o, u = await s.tool();
      for (const c of (r = u.functionDeclarations) !== null && r !== void 0 ? r : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (i.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        i.set(c.name, s);
      }
    }
    return i;
  }
  async processAfcStream(e) {
    var t, n, r;
    const i = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Hf;
    let o = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return _t(this, arguments, function* () {
        for (var f, p, m, g, y, v; s < i; ) {
          o && (s++, o = !1);
          const E = yield ie(c.processParamsMaybeAddMcpUsage(h)), A = yield ie(c.generateContentStreamInternal(E)), S = [], I = [];
          try {
            for (var b = !0, _ = (p = void 0, bt(A)), w; w = yield ie(_.next()), f = w.done, !f; b = !0) {
              g = w.value, b = !1;
              const C = g;
              if (yield yield ie(C), C.candidates && (!((y = C.candidates[0]) === null || y === void 0) && y.content)) {
                I.push(C.candidates[0].content);
                for (const P of (v = C.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (s < i && P.functionCall) {
                  if (!P.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(P.functionCall.name)) {
                    const T = yield ie(d.get(P.functionCall.name).callTool([P.functionCall]));
                    S.push(...T);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${P.functionCall.name}`);
                }
              }
            }
          } catch (C) {
            p = { error: C };
          } finally {
            try {
              !b && !f && (m = _.return) && (yield ie(m.call(_)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            o = !0;
            const C = new Nr();
            C.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield ie(C);
            const P = [];
            P.push(...I), P.push({
              role: "user",
              parts: S
            }), h.contents = ze(h.contents).concat(P);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Of(this.apiClient, e);
      return s = V("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = qf(d), f = new Nr();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Bf(this.apiClient, e);
      return s = V("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = Gf(d), f = new Nr();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Of(this.apiClient, e);
      return s = V("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), o.then(function(d) {
        return _t(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, y = bt(d), v; v = yield ie(y.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = qf(yield ie(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Nr();
              Object.assign(w, _), yield yield ie(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !h && (p = y.return) && (yield ie(p.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Bf(this.apiClient, e);
      return s = V("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }), o.then(function(d) {
        return _t(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, y = bt(d), v; v = yield ie(y.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = Gf(yield ie(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Nr();
              Object.assign(w, _), yield yield ie(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !h && (p = y.return) && (yield ie(p.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = B0(this.apiClient, e, e);
      return s = V(Zw(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = G0(d, e), f = new _f();
        return Object.assign(f, h), f;
      });
    } else {
      const c = F0(this.apiClient, e);
      return s = V("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = O0(d), f = new _f();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Z0(this.apiClient, e);
      return s = V("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = eT(d), f = new bf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Q0(this.apiClient, e);
      return s = V("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = j0(d), f = new bf();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = D0(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = L0(u), d = new xw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = eA(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = tA(u), d = new Iw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = DT(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = LT(u), d = new Rw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = GT(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = qT(u), d = new Pw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yT(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => hl(d));
    } else {
      const c = gT(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => fl(d));
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = CT(this.apiClient, e);
      return s = V("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = IT(d), f = new wf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = AT(this.apiClient, e);
      return s = V("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = xT(d), f = new wf();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZT(this.apiClient, e);
      return s = V("{model}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => hl(d));
    } else {
      const c = QT(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => fl(d));
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = P0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = N0(d), f = new Sf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = R0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = M0(d), f = new Sf();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = C0(this.apiClient, e);
      return s = V("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = I0(d), f = new Ef();
        return Object.assign(f, h), f;
      });
    } else {
      const c = A0(this.apiClient, e);
      return s = V("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = x0(d), f = new Ef();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = v0(this.apiClient, e);
      return i = V("{model}:computeTokens", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = _0(u), d = new Mw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sT(this.apiClient, e);
      return s = V("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const h = iT(d), f = new Tf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = oT(this.apiClient, e);
      return s = V("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const h = rT(d), f = new Tf();
        return Object.assign(f, h), f;
      });
    }
  }
}, QA = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let i;
      n && "httpOptions" in n && (i = n.httpOptions);
      const o = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: i }
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !1
      });
    }
  }
  async get(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let i;
      n && "httpOptions" in n && (i = n.httpOptions);
      const o = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: i }
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !1
      });
    }
  }
  async getVideosOperationInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ww(e);
      return s = V("{operationName}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o;
    } else {
      const c = bw(e);
      return s = V("{operationName}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = hw(e);
      return i = V("{resourceName}:fetchPredictOperation", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function zf(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function ZA(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function jA(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function eC(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => uC(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function tC(e, t, n) {
  const r = {}, i = a(t, ["expireTime"]);
  n !== void 0 && i != null && l(n, ["expireTime"], i);
  const o = a(t, ["newSessionExpireTime"]);
  n !== void 0 && o != null && l(n, ["newSessionExpireTime"], o);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], lC(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function nC(e, t) {
  const n = {}, r = a(t, ["config"]);
  return r != null && l(n, ["config"], tC(e, r, n)), n;
}
function rC(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function iC(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function oC(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], ZA(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function sC(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function aC(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const i = a(e, ["responseModalities"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], i);
  const o = a(e, ["temperature"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], o);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Su(f));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], eC($e(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let C = ar(y);
    Array.isArray(C) && (C = C.map((P) => fC(sr(P)))), l(t, ["setup", "tools"], C);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], dC(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], zf(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], zf(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const A = a(e, ["proactivity"]);
  if (t !== void 0 && A != null && l(t, ["setup", "proactivity"], A), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const I = a(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let C = I;
    Array.isArray(C) && (C = C.map((P) => cC(P))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function lC(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], pe(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], aC(i, n)), n;
}
function uC(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], rC(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], iC(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], jA(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function cC(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function dC(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function fC(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], sC(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], oC(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function hC(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const r = e[n];
    if (typeof r == "object" && r != null && Object.keys(r).length > 0) {
      const i = Object.keys(r).map((o) => `${n}.${o}`);
      t.push(...i);
    } else t.push(n);
  }
  return t.join(",");
}
function pC(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const o = r.setup;
    typeof o == "object" && o !== null ? (e.bidiGenerateContentSetup = o, n = o) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const i = e.fieldMask;
  if (n) {
    const o = hC(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) o ? e.fieldMask = o : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && i !== null && Array.isArray(i) && i.length > 0) {
      const s = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      i.length > 0 && (u = i.map((d) => s.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      o && c.push(o), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else i !== null && Array.isArray(i) && i.length > 0 ? e.fieldMask = i.join(",") : delete e.fieldMask;
  return e;
}
var mC = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = nC(this.apiClient, e);
      i = V("auth_tokens", s._url), o = s._query, delete s.config, delete s._url, delete s._query;
      const u = pC(s, e.config);
      return r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
};
function gC(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function yC(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && gC(r, t), t;
}
function vC(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function _C(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function bC(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = a(e, ["config"]);
  return r != null && _C(r, t), t;
}
function wC(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["documents"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["documents"], o);
  }
  return t;
}
var SC = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Nn(Ft.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = vC(e);
      return i = V("{name}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const o = yC(e);
      r = V("{name}", o._url), i = o._query, delete o._url, delete o._query, await this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(o),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = bC(e);
      return i = V("{parent}/documents", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = wC(u), d = new Nw();
        return Object.assign(d, c), d;
      });
    }
  }
}, EC = class extends Bt {
  constructor(e, t = new SC(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Nn(Ft.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = lA(e);
      return i = V("fileSearchStores", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = dA(e);
      return i = V("{name}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const o = cA(e);
      r = V("{name}", o._url), i = o._query, delete o._url, delete o._query, await this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(o),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = yA(e);
      return i = V("fileSearchStores", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = vA(u), d = new kw();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = _A(e);
      return i = V("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = bA(u), d = new Dw();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = pA(e);
      return i = V("{file_search_store_name}:importFile", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = hA(u), d = new Lw();
        return Object.assign(d, c), d;
      });
    }
  }
}, Ng = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ng = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, TC = () => Ng();
function ml(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var gl = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, ft = class extends Error {
}, ht = class yl extends ft {
  constructor(t, n, r, i) {
    super(`${yl.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.error = n;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new Is({
      message: r,
      cause: gl(n)
    });
    const o = n;
    return t === 400 ? new Dg(t, o, r, i) : t === 401 ? new Lg(t, o, r, i) : t === 403 ? new $g(t, o, r, i) : t === 404 ? new Ug(t, o, r, i) : t === 409 ? new Fg(t, o, r, i) : t === 422 ? new Bg(t, o, r, i) : t === 429 ? new Og(t, o, r, i) : t >= 500 ? new Gg(t, o, r, i) : new yl(t, o, r, i);
  }
}, vl = class extends ht {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Is = class extends ht {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, kg = class extends Is {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Dg = class extends ht {
}, Lg = class extends ht {
}, $g = class extends ht {
}, Ug = class extends ht {
}, Fg = class extends ht {
}, Bg = class extends ht {
}, Og = class extends ht {
}, Gg = class extends ht {
}, AC = /^[a-z][a-z0-9+.-]*:/i, CC = (e) => AC.test(e), _l = (e) => (_l = Array.isArray, _l(e)), Yf = _l;
function Xf(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function xC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var IC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ft(`${e} must be an integer`);
  if (t < 0) throw new ft(`${e} must be a positive integer`);
  return t;
}, RC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, PC = (e) => new Promise((t) => setTimeout(t, e));
function MC() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function qg(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function NC(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return qg({
    start() {
    },
    async pull(n) {
      const { done: r, value: i } = await t.next();
      r ? n.close() : n.enqueue(i);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function Vg(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function kC(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), i = r.cancel();
  r.releaseLock(), await i;
}
var DC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function LC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ft(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var $C = "0.0.1", Hg = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function pa(e, t, n) {
  return Hg(), new File(e, t ?? "unknown_file", n);
}
function UC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var FC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Kg = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", BC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Kg(e), OC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function GC(e, t, n) {
  if (Hg(), e = await e, BC(e))
    return e instanceof File ? e : pa([await e.arrayBuffer()], e.name);
  if (OC(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), pa(await bl(i), t, n);
  }
  const r = await bl(e);
  if (t || (t = UC(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = Object.assign(Object.assign({}, n), { type: i }));
  }
  return pa(r, t, n);
}
async function bl(e) {
  var t, n, r, i, o;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (Kg(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (FC(e)) try {
    for (var u = !0, c = bt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      i = d.value, u = !1;
      const h = i;
      s.push(...await bl(h));
    }
  } catch (h) {
    n = { error: h };
  } finally {
    try {
      !u && !t && (r = c.return) && await r.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const h = (o = e?.constructor) === null || o === void 0 ? void 0 : o.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${qC(e)}`);
  }
  return s;
}
function qC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Eu = class {
  constructor(e) {
    this._client = e;
  }
};
Eu._key = [];
function Wg(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Qf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), VC = (e = Wg) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    var m, g, y;
    /[?#]/.test(f) && (i = !0);
    const v = r[p];
    let b = (i ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : Qf)) !== null && g !== void 0 ? g : Qf)) === null || y === void 0 ? void 0 : y.toString)) && (b = v + "", o.push({
      start: h.length + f.length,
      length: b.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : b);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const h = d[0].startsWith("/"), f = h ? 1 : 0, p = h ? d[0].slice(1) : d[0];
    o.push({
      start: d.index + f,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (o.sort((h, f) => h.start - f.start), o.length > 0) {
    let h = 0;
    const f = o.reduce((p, m) => {
      const g = " ".repeat(m.start - h), y = "^".repeat(m.length);
      return h = m.start + m.length, p + g + y;
    }, "");
    throw new ft(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}), yt = /* @__PURE__ */ VC(Wg), Jg = class extends Eu {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, i = Yt(e, ["api_version"]);
    if ("model" in i && "agent_config" in i) throw new ft("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in i && "generation_config" in i) throw new ft("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(yt`/${r}/interactions`, Object.assign(Object.assign({ body: i }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(yt`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(yt`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const i = t ?? {}, { api_version: o = this._client.apiVersion } = i, s = Yt(i, ["api_version"]);
    return this._client.get(yt`/${o}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Jg._key = Object.freeze(["interactions"]);
var zg = class extends Jg {
}, Yg = class extends Eu {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, i = Yt(e, ["api_version", "webhook_id"]);
    return this._client.post(yt`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: i
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: i } = t, o = Yt(t, ["api_version", "update_mask"]);
    return this._client.patch(yt`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: i },
      body: o
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, i = Yt(n, ["api_version"]);
    return this._client.get(yt`/${r}/webhooks`, Object.assign({ query: i }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(yt`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(yt`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: i } = t ?? {};
    return this._client.post(yt`/${r}/webhooks/${e}:ping`, Object.assign({ body: i }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, o = Yt(r, ["api_version"]);
    return this._client.post(yt`/${i}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: o }, n));
  }
};
Yg._key = Object.freeze(["webhooks"]);
var Xg = class extends Yg {
};
function HC(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var ro;
function Tu(e) {
  let t;
  return (ro ?? (t = new globalThis.TextEncoder(), ro = t.encode.bind(t)))(e);
}
var io;
function Zf(e) {
  let t;
  return (io ?? (t = new globalThis.TextDecoder(), io = t.decode.bind(t)))(e);
}
var Rs = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Tu(e) : e;
    this.buffer = HC([this.buffer, n]);
    const r = [];
    let i;
    for (; (i = KC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (i.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = i.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (i.index !== this.carriageReturnIndex + 1 || i.carriage)) {
        r.push(Zf(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const o = this.carriageReturnIndex !== null ? i.preceding - 1 : i.preceding, s = Zf(this.buffer.subarray(0, o));
      r.push(s), this.buffer = this.buffer.subarray(i.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Rs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Rs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function KC(e, t) {
  const i = t ?? 0, o = e.indexOf(10, i), s = e.indexOf(13, i);
  if (o === -1 && s === -1) return null;
  let u;
  return o !== -1 && s !== -1 ? u = Math.min(o, s) : u = o !== -1 ? o : s, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var Qo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, jf = (e, t, n) => {
  if (e) {
    if (xC(Qo, e)) return e;
    He(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Qo))}`);
  }
};
function Yr() {
}
function oo(e, t, n) {
  return !t || Qo[e] > Qo[n] ? Yr : t[e].bind(t);
}
var WC = {
  error: Yr,
  warn: Yr,
  info: Yr,
  debug: Yr
}, eh = /* @__PURE__ */ new WeakMap();
function He(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return WC;
  const i = eh.get(n);
  if (i && i[0] === r) return i[1];
  const o = {
    error: oo("error", n, r),
    warn: oo("warn", n, r),
    info: oo("info", n, r),
    debug: oo("debug", n, r)
  };
  return eh.set(n, [r, o]), o;
}
var pn = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), JC = class Xr {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? He(r) : console;
    function s() {
      return _t(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new ft("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = bt(zC(t, n)), y; y = yield ie(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield ie(JSON.parse(v.data));
                } catch (b) {
                  throw o.error("Could not parse message into JSON:", v.data), o.error("From chunk:", v.raw), b;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield ie(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ml(v)) return yield ie(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Xr(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    function o() {
      return _t(this, arguments, function* () {
        var c, d, h, f;
        const p = new Rs(), m = Vg(t);
        try {
          for (var g = !0, y = bt(m), v; v = yield ie(y.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const b = f;
            for (const _ of p.decode(b)) yield yield ie(_);
          }
        } catch (b) {
          d = { error: b };
        } finally {
          try {
            !g && !c && (h = y.return) && (yield ie(h.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const b of p.flush()) yield yield ie(b);
      });
    }
    function s() {
      return _t(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new ft("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = bt(o()), y; y = yield ie(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              p || v && (yield yield ie(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield ie(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ml(v)) return yield ie(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Xr(s, n, r);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), i = (o) => ({ next: () => {
      if (o.length === 0) {
        const s = r.next();
        t.push(s), n.push(s);
      }
      return o.shift();
    } });
    return [new Xr(() => i(t), this.controller, this.client), new Xr(() => i(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return qg({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = Tu(JSON.stringify(i) + `
`);
          r.enqueue(s);
        } catch (i) {
          r.error(i);
        }
      },
      async cancel() {
        var r;
        await ((r = n.return) === null || r === void 0 ? void 0 : r.call(n));
      }
    });
  }
};
function zC(e, t) {
  return _t(this, arguments, function* () {
    var r, i, o, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ft("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ft("Attempted to iterate over a response with no body");
    const u = new XC(), c = new Rs(), d = Vg(e.body);
    try {
      for (var h = !0, f = bt(YC(d)), p; p = yield ie(f.next()), r = p.done, !r; h = !0) {
        s = p.value, h = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield ie(y));
        }
      }
    } catch (m) {
      i = { error: m };
    } finally {
      try {
        !h && !r && (o = f.return) && (yield ie(o.call(f)));
      } finally {
        if (i) throw i.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield ie(g));
    }
  });
}
function YC(e) {
  return _t(this, arguments, function* () {
    var n, r, i, o;
    try {
      for (var s = !0, u = bt(e), c; c = yield ie(u.next()), n = c.done, !n; s = !0) {
        o = c.value, s = !1;
        const d = o;
        d != null && (yield yield ie(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Tu(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !s && !n && (i = u.return) && (yield ie(i.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var XC = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const i = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], i;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = QC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function QC(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function ZC(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return He(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : JC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return He(e).debug(`[${r}] response parsed`, pn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
var jC = class Qg extends Promise {
  constructor(t, n, r = ZC) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Qg(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(this.client, t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
}, Zg = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* ex(e) {
  if (!e) return;
  if (Zg in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Yf(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = Yf(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var kr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of ex(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [Zg]: !0,
    values: t,
    nulls: n
  };
}, ma = (e) => {
  var t, n, r, i, o;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((o = (i = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || i === void 0 ? void 0 : i.call(r, e)) === null || o === void 0 ? void 0 : o.trim()) || void 0;
}, jg, ey = class ty {
  constructor(t) {
    var n, r, i, o, s, u, c, { baseURL: d = ma("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ma("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Yt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : ty.DEFAULT_TIMEOUT, this.logger = (i = m.logger) !== null && i !== void 0 ? i : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (o = jf(m.logLevel, "ClientOptions.logLevel", this)) !== null && o !== void 0 ? o : jf(ma("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : MC(), this.encoder = DC, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
  }
  withOptions(t) {
    return new this.constructor(Object.assign(Object.assign(Object.assign({}, this._options), {
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      apiVersion: this.apiVersion
    }), t));
  }
  baseURLOverridden() {
    return this.baseURL !== "https://generativelanguage.googleapis.com";
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: t, nulls: n }) {
    if (!(t.has("authorization") || t.has("x-goog-api-key")) && !(this.apiKey && t.get("x-goog-api-key")) && !n.has("x-goog-api-key"))
      throw new Error('Could not resolve authentication method. Expected the apiKey to be set. Or for the "x-goog-api-key" headers to be explicitly omitted');
  }
  async authHeaders(t) {
    const n = kr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return kr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return kr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return LC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${$C}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${TC()}`;
  }
  makeStatusError(t, n, r, i) {
    return ht.generate(t, n, r, i);
  }
  buildURL(t, n, r) {
    const i = !this.baseURLOverridden() && r || this.baseURL, o = CC(t) ? new URL(t) : new URL(i + (i.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(o.searchParams);
    return (!Xf(s) || !Xf(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (o.search = this.stringifyQuery(n)), o.toString();
  }
  async prepareOptions(t) {
    if (this.clientAdapter && this.clientAdapter.isVertexAI() && !t.path.startsWith(`/${this.apiVersion}/projects/`)) {
      const n = t.path.slice(this.apiVersion.length + 1);
      t.path = `/${this.apiVersion}/projects/${this.clientAdapter.getProject()}/locations/${this.clientAdapter.getLocation()}${n}`;
    }
  }
  async prepareRequest(t, { url: n, options: r }) {
  }
  get(t, n) {
    return this.methodRequest("get", t, n);
  }
  post(t, n) {
    return this.methodRequest("post", t, n);
  }
  patch(t, n) {
    return this.methodRequest("patch", t, n);
  }
  put(t, n) {
    return this.methodRequest("put", t, n);
  }
  delete(t, n) {
    return this.methodRequest("delete", t, n);
  }
  methodRequest(t, n, r) {
    return this.request(Promise.resolve(r).then((i) => Object.assign({
      method: t,
      path: n
    }, i)));
  }
  request(t, n = null) {
    return new jC(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var i, o, s;
    const u = await t, c = (i = u.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (He(this).debug(`[${p}] sending request`, pn({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((o = u.signal) === null || o === void 0) && o.aborted) throw new vl();
    const y = new AbortController(), v = await this.fetchWithTimeout(h, d, f, y).catch(gl), b = Date.now();
    if (v instanceof globalThis.Error) {
      const w = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new vl();
      const E = ml(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return He(this).info(`[${p}] connection ${E ? "timed out" : "failed"} - ${w}`), He(this).debug(`[${p}] connection ${E ? "timed out" : "failed"} (${w})`, pn({
          retryOfRequestLogID: r,
          url: h,
          durationMs: b - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw He(this).info(`[${p}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), He(this).debug(`[${p}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, pn({
        retryOfRequestLogID: r,
        url: h,
        durationMs: b - g,
        message: v.message
      })), E ? new kg() : new Is({ cause: v });
    }
    const _ = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${b - g}ms`;
    if (!v.ok) {
      const w = await this.shouldRetry(v);
      if (n && w) {
        const C = `retrying, ${n} attempts remaining`;
        return await kC(v.body), He(this).info(`${_} - ${C}`), He(this).debug(`[${p}] response error (${C})`, pn({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: b - g
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const E = w ? "error; no more retries left" : "error; not retryable";
      He(this).info(`${_} - ${E}`);
      const A = await v.text().catch((C) => gl(C).message), S = RC(A), I = S ? void 0 : A;
      throw He(this).debug(`[${p}] response error (${E})`, pn({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: I,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, S, I, v.headers);
    }
    return He(this).info(_), He(this).debug(`[${p}] response start`, pn({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: b - g
    })), {
      response: v,
      options: u,
      controller: y,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, i) {
    const o = n || {}, { signal: s, method: u } = o, c = Yt(o, ["signal", "method"]), d = this._makeAbort(i);
    s && s.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, r), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: i.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (p.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, p);
    } finally {
      clearTimeout(h);
    }
  }
  async shouldRetry(t) {
    const n = t.headers.get("x-should-retry");
    return n === "true" ? !0 : n === "false" ? !1 : t.status === 408 || t.status === 409 || t.status === 429 || t.status >= 500;
  }
  async retryRequest(t, n, r, i) {
    var o;
    let s;
    const u = i?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (s = d);
    }
    const c = i?.get("retry-after");
    if (c && !s) {
      const d = parseFloat(c);
      Number.isNaN(d) ? s = Date.parse(c) - Date.now() : s = d * 1e3;
    }
    if (s === void 0) {
      const d = (o = t.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await PC(s), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const o = n - t;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, i, o;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = s, f = this.buildURL(c, d, h);
    "timeout" in s && IC("timeout", s.timeout), s.timeout = (r = s.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: s }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, s.signal && { signal: s.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (i = this.fetchOptions) !== null && i !== void 0 ? i : {}), (o = s.fetchOptions) !== null && o !== void 0 ? o : {}),
      url: f,
      timeout: s.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: i }) {
    let o = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = t.idempotencyKey);
    const s = await this.authHeaders(t);
    let u = kr([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      r,
      t.headers,
      s
    ]);
    return this.validateHeaders(u), u.values;
  }
  _makeAbort(t) {
    return () => t.abort();
  }
  buildBody({ options: { body: t, headers: n } }) {
    if (!t) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const r = kr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: NC(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
ey.DEFAULT_TIMEOUT = 6e4;
var ke = class extends ey {
  constructor() {
    super(...arguments), this.interactions = new zg(this), this.webhooks = new Xg(this);
  }
};
jg = ke;
ke.GeminiNextGenAPIClient = jg;
ke.GeminiNextGenAPIClientError = ft;
ke.APIError = ht;
ke.APIConnectionError = Is;
ke.APIConnectionTimeoutError = kg;
ke.APIUserAbortError = vl;
ke.NotFoundError = Ug;
ke.ConflictError = Fg;
ke.RateLimitError = Og;
ke.BadRequestError = Dg;
ke.AuthenticationError = Lg;
ke.InternalServerError = Gg;
ke.PermissionDeniedError = $g;
ke.UnprocessableEntityError = Bg;
ke.toFile = GC;
ke.Interactions = zg;
ke.Webhooks = Xg;
function tx(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function nx(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function rx(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ix(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ox(e, t, n) {
  const r = {};
  if (a(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const i = a(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && i != null && l(t, ["displayName"], i), a(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const o = a(e, ["epochCount"]);
  t !== void 0 && o != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], o);
  const s = a(e, ["learningRateMultiplier"]);
  if (s != null && l(r, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], s), a(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (a(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (a(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (a(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (a(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = a(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = a(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (a(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (a(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (a(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (a(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (a(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (a(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return r;
}
function sx(e, t, n) {
  const r = {};
  let i = a(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], ga(S));
  } else if (i === "PREFERENCE_TUNING") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], ga(S));
  } else if (i === "DISTILLATION") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], ga(S));
  }
  const o = a(e, ["tunedModelDisplayName"]);
  t !== void 0 && o != null && l(t, ["tunedModelDisplayName"], o);
  const s = a(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  let u = a(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "PREFERENCE_TUNING") {
    const S = a(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "DISTILLATION") {
    const S = a(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  }
  let c = a(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "PREFERENCE_TUNING") {
    const S = a(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "DISTILLATION") {
    const S = a(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  }
  let d = a(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "PREFERENCE_TUNING") {
    const S = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "DISTILLATION") {
    const S = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], S);
  }
  let h = a(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "PREFERENCE_TUNING") {
    const S = a(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "DISTILLATION") {
    const S = a(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  }
  let f = a(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "tuningMode"], S);
  } else if (f === "DISTILLATION") {
    const S = a(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "tuningMode"], S);
  }
  const p = a(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = a(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  } else if (m === "DISTILLATION") {
    const S = a(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  }
  let g = a(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  } else if (g === "DISTILLATION") {
    const S = a(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  }
  const y = a(e, ["labels"]);
  t !== void 0 && y != null && l(t, ["labels"], y);
  const v = a(e, ["beta"]);
  t !== void 0 && v != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], v);
  const b = a(e, ["baseTeacherModel"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "baseTeacherModel"], b);
  const _ = a(e, ["tunedTeacherModelSource"]);
  t !== void 0 && _ != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], _);
  const w = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && w != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], w);
  const E = a(e, ["outputUri"]);
  t !== void 0 && E != null && l(t, ["outputUri"], E);
  const A = a(e, ["encryptionSpec"]);
  return t !== void 0 && A != null && l(t, ["encryptionSpec"], A), r;
}
function ax(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && vx(o);
  const s = a(e, ["config"]);
  return s != null && ox(s, n), n;
}
function lx(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && _x(o, n, t);
  const s = a(e, ["config"]);
  return s != null && sx(s, n, t), n;
}
function ux(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function cx(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function dx(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function fx(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function hx(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && dx(r, n), n;
}
function px(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && fx(r, n), n;
}
function mx(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["tunedModels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => ny(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function gx(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["tuningJobs"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => wl(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function yx(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["model"], r);
  const i = a(e, ["name"]);
  return i != null && l(n, ["endpoint"], i), n;
}
function vx(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const r = a(e, ["examples"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(n, ["examples", "examples"], i);
  }
  return n;
}
function _x(e, t, n) {
  const r = {};
  let i = a(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (i === "PREFERENCE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (i === "DISTILLATION") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  let o = a(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (o === "PREFERENCE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (o === "DISTILLATION") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  if (a(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return r;
}
function ny(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["state"]);
  o != null && l(n, ["state"], dg(o));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = a(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = a(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = a(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], yx(p)), n;
}
function wl(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["state"]);
  o != null && l(n, ["state"], dg(o));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = a(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = a(e, ["description"]);
  f != null && l(n, ["description"], f);
  const p = a(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = a(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = a(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const y = a(e, ["supervisedTuningSpec"]);
  y != null && l(n, ["supervisedTuningSpec"], y);
  const v = a(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const b = a(e, ["distillationSpec"]);
  b != null && l(n, ["distillationSpec"], b);
  const _ = a(e, ["tuningDataStats"]);
  _ != null && l(n, ["tuningDataStats"], _);
  const w = a(e, ["encryptionSpec"]);
  w != null && l(n, ["encryptionSpec"], w);
  const E = a(e, ["partnerModelTuningSpec"]);
  E != null && l(n, ["partnerModelTuningSpec"], E);
  const A = a(e, ["customBaseModel"]);
  A != null && l(n, ["customBaseModel"], A);
  const S = a(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let D = S;
    Array.isArray(D) && (D = D.map((q) => q)), l(n, ["evaluateDatasetRuns"], D);
  }
  const I = a(e, ["experiment"]);
  I != null && l(n, ["experiment"], I);
  const C = a(e, ["fullFineTuningSpec"]);
  C != null && l(n, ["fullFineTuningSpec"], C);
  const P = a(e, ["labels"]);
  P != null && l(n, ["labels"], P);
  const T = a(e, ["outputUri"]);
  T != null && l(n, ["outputUri"], T);
  const k = a(e, ["pipelineJob"]);
  k != null && l(n, ["pipelineJob"], k);
  const F = a(e, ["serviceAccount"]);
  F != null && l(n, ["serviceAccount"], F);
  const B = a(e, ["tunedModelDisplayName"]);
  B != null && l(n, ["tunedModelDisplayName"], B);
  const W = a(e, ["tuningJobState"]);
  W != null && l(n, ["tuningJobState"], W);
  const O = a(e, ["veoTuningSpec"]);
  O != null && l(n, ["veoTuningSpec"], O);
  const le = a(e, ["distillationSamplingSpec"]);
  le != null && l(n, ["distillationSamplingSpec"], le);
  const ue = a(e, ["tuningJobMetadata"]);
  return ue != null && l(n, ["tuningJobMetadata"], ue), n;
}
function bx(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = a(e, ["done"]);
  s != null && l(n, ["done"], s);
  const u = a(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function ga(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const i = a(e, ["vertexDatasetResource"]);
  return i != null && l(n, ["validationDatasetUri"], i), n;
}
var wx = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nn(Ft.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const r = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (r.checkpointId = t.config.preTunedModelCheckpointId);
        const i = Object.assign(Object.assign({}, t), { preTunedModel: r });
        return i.baseModel = void 0, await this.tuneInternal(i);
      } else {
        const r = Object.assign({}, t);
        return await this.tuneInternal(r);
      }
      else {
        const r = Object.assign({}, t), i = await this.tuneMldevInternal(r);
        let o = "";
        return i.metadata !== void 0 && i.metadata.tunedModel !== void 0 ? o = i.metadata.tunedModel : i.name !== void 0 && i.name.includes("/operations/") && (o = i.name.split("/operations/")[0]), {
          name: o,
          state: al.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cx(e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => wl(d));
    } else {
      const c = ux(e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => ny(d));
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = px(e);
      return s = V("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = gx(d), f = new Af();
        return Object.assign(f, h), f;
      });
    } else {
      const c = hx(e);
      return s = V("tunedModels", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = mx(d), f = new Af();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nx(e);
      return s = V("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = ix(d), f = new Cf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = tx(e);
      return s = V("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const h = rx(d), f = new Cf();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = lx(e, e);
      return i = V("tuningJobs", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => wl(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = ax(e);
      return i = V("tunedModels", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => bx(u));
    }
  }
}, Sx = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Ex = 1024 * 1024 * 8, Tx = 3, Ax = 1e3, Cx = 2, Zo = "x-goog-upload-status";
async function xx(e, t, n, r) {
  var i;
  const o = await ry(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[Zo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function Ix(e, t, n, r) {
  var i;
  const o = await ry(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[Zo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = ng(s), c = new qw();
  return Object.assign(c, u), c;
}
async function ry(e, t, n, r) {
  var i, o, s;
  let u = t;
  const c = r?.baseUrl || ((i = n.clientOptions.httpOptions) === null || i === void 0 ? void 0 : i.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new ul(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Ex, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let y = 0, v = Ax;
    for (; y < Tx; ) {
      const b = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, r), {
          apiVersion: "",
          baseUrl: u,
          headers: b
        })
      }), !((o = f?.headers) === null || o === void 0) && o[Zo]) break;
      y++, await Px(v), v = v * Cx;
    }
    if (h += m, ((s = f?.headers) === null || s === void 0 ? void 0 : s[Zo]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Rx(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function Px(e) {
  return new Promise((t) => setTimeout(t, e));
}
var Mx = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await xx(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Ix(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Rx(e);
  }
}, Nx = class {
  create(e, t, n) {
    return new kx(e, t, n);
  }
}, kx = class {
  constructor(e, t, n) {
    this.url = e, this.headers = t, this.callbacks = n;
  }
  connect() {
    this.ws = new WebSocket(this.url), this.ws.onopen = this.callbacks.onopen, this.ws.onerror = this.callbacks.onerror, this.ws.onclose = this.callbacks.onclose, this.ws.onmessage = this.callbacks.onmessage;
  }
  send(e) {
    if (this.ws === void 0) throw new Error("WebSocket is not connected");
    this.ws.send(e);
  }
  close() {
    if (this.ws === void 0) throw new Error("WebSocket is not connected");
    this.ws.close();
  }
}, th = "x-goog-api-key", Dx = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(th) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(th, this.apiKey);
    }
  }
}, Lx = "gl-node/", $x = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ke({
        baseURL: this.apiClient.getBaseUrl(),
        apiKey: this.apiKey,
        apiVersion: this.apiClient.getApiVersion(),
        clientAdapter: this.apiClient,
        defaultHeaders: this.apiClient.getDefaultHeaders(),
        timeout: n?.timeout,
        maxRetries: (e = n?.retryOptions) === null || e === void 0 ? void 0 : e.attempts
      });
    }
    return t?.extraBody && console.warn("GoogleGenAI.interactions: Client level httpOptions.extraBody is not supported by the interactions client and will be ignored."), this._nextGenClient;
  }
  get interactions() {
    return this._interactions !== void 0 ? this._interactions : (console.warn("GoogleGenAI.interactions: Interactions usage is experimental and may change in future versions."), this._interactions = this.getNextGenClient().interactions, this._interactions);
  }
  get webhooks() {
    return this._webhooks !== void 0 ? this._webhooks : (this._webhooks = this.getNextGenClient().webhooks, this._webhooks);
  }
  constructor(e) {
    var t;
    if (e.apiKey == null) throw new Error("An API Key must be set when running in a browser");
    if (e.project || e.location) throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");
    this.vertexai = (t = e.vertexai) !== null && t !== void 0 ? t : !1, this.apiKey = e.apiKey;
    const n = dw(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Dx(this.apiKey);
    this.apiClient = new PA({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: Lx + "web",
      uploader: new Mx(),
      downloader: new Sx()
    }), this.models = new XA(this.apiClient), this.live = new HA(this.apiClient, r, new Nx()), this.batches = new KS(this.apiClient), this.chats = new RE(this.models, this.apiClient), this.caches = new CE(this.apiClient), this.files = new GE(this.apiClient), this.operations = new QA(this.apiClient), this.authTokens = new mC(this.apiClient), this.tunings = new wx(this.apiClient), this.fileSearchStores = new EC(this.apiClient);
  }
};
function nh(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Xn(e) {
  return { text: String(e || "") };
}
function Ux(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Fx(e) {
  if (typeof e == "string") return [Xn(e)];
  if (!Array.isArray(e)) return [Xn("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Xn(n.text || "") : n.type === "image_url" && n.image_url?.url ? Ux(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Xn("")];
}
function rh() {
  return {
    role: "user",
    parts: [Xn("继续。")]
  };
}
function ih(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Bx(e) {
  switch (e) {
    case "high":
      return ri.HIGH;
    case "medium":
      return ri.MEDIUM;
    default:
      return ri.LOW;
  }
}
function oh(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Ox(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Gx(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function qx(e) {
  const t = /* @__PURE__ */ new Map(), n = [], r = (e || []).filter((o) => o.role === "user" || o.role === "assistant" || o.role === "tool");
  r.forEach((o) => {
    (o.tool_calls || []).forEach((s) => {
      s.id && s.function?.name && t.set(s.id, s.function.name);
    });
  });
  for (let o = 0; o < r.length; o += 1) {
    const s = r[o];
    if (s.role === "tool") {
      const u = [];
      let c = o;
      for (; c < r.length && r[c].role === "tool"; ) {
        const d = r[c];
        u.push({ functionResponse: {
          name: t.get(d.tool_call_id || "") || "tool_result",
          response: nh(d.content)
        } }), c += 1;
      }
      n.push({
        role: "user",
        parts: u
      }), o = c - 1;
      continue;
    }
    if (s.role === "assistant" && Array.isArray(s.tool_calls) && s.tool_calls.length) {
      n.push({
        role: "model",
        parts: [...s.content ? [Xn(s.content)] : [], ...s.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: nh(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: s.role === "assistant" ? "model" : "user",
      parts: Fx(s.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: rh().parts
  };
  const i = n[n.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: n,
    latestMessage: rh().parts
  };
}
function Vx(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function sh(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
var Hx = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new $x({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  createChat(e) {
    const t = qx(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = Ox(e), i = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (i.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: Bx(e.reasoning.effort)
    }), n.length && (i.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (i.toolConfig = { functionCallingConfig: { mode: sl.ANY } });
    const o = {
      model: this.config.model,
      history: t.history,
      config: i
    };
    return {
      chat: this.client.chats.create(o),
      sendPayload: { message: t.latestMessage }
    };
  }
  async sendThroughChat(e, t, n) {
    let r, i, o, s = [];
    const u = { ...t };
    if (typeof n.onStreamProgress == "function") {
      const h = await e.sendMessageStream(u), f = /* @__PURE__ */ new Map();
      let p = "", m = [], g = null;
      for await (const y of h) {
        if (g = y, oh(y).forEach((v, b) => {
          const _ = `${v.label}:${b}`;
          f.set(_, sh(f.get(_) || "", v.text));
        }), m = (y.functionCalls || []).map((v, b) => ({
          id: v.id || `google-tool-${b + 1}`,
          name: v.name || "",
          arguments: JSON.stringify(v.args || {})
        })).filter((v) => v.name), s = m, m.length) p = "";
        else {
          const v = ih(y);
          p = sh(p, v);
        }
        Vx(n, {
          text: p,
          thoughts: Array.from(f.values()).filter(Boolean).map((v, b) => ({
            label: `思考块 ${b + 1}`,
            text: v
          }))
        });
      }
      r = g || { functionCalls: m }, i = Array.from(f.values()).filter(Boolean).map((y, v) => ({
        label: `思考块 ${v + 1}`,
        text: y
      })), o = s.length ? "" : p;
    } else
      r = await e.sendMessage(u), i = oh(r), o = r.functionCalls?.length ? "" : ih(r);
    const c = (r.functionCalls || []).map((h, f) => ({
      id: h.id || `google-tool-${f + 1}`,
      name: h.name || "",
      arguments: JSON.stringify(h.args || {})
    })).filter((h) => h.name), d = c.length ? c : s;
    return {
      text: d.length ? "" : o,
      toolCalls: d,
      thoughts: i,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google"
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const n = { message: Gx(e.toolResponses) };
      return await this.sendThroughChat(this.activeChat, n, e);
    }
    const t = this.createChat(e);
    return this.activeChat = t.chat, await this.sendThroughChat(this.activeChat, t.sendPayload, e);
  }
}, ge = {
  LS: "LS",
  GLOB: "Glob",
  GREP: "Grep",
  READ: "Read",
  RUN_SLASH_COMMAND: "RunSlashCommand",
  READ_IDENTITY: "ReadIdentity",
  WRITE_IDENTITY: "WriteIdentity",
  READ_WORKLOG: "ReadWorklog",
  WRITE_WORKLOG: "WriteWorklog"
}, Kx = [
  "工具使用规则：",
  "- `LS` 只列目录的一级子项，适合看某层有哪些文件夹/文件，不能搜索文件内容。",
  "- `Glob` 只按路径模式匹配文件，适合先缩小文件集合；它不检查文件内容对不对。",
  "- `Grep` 只搜索文件内容里的命中片段；命中片段不是全文，也不代表上下文完整。结果很多时可配合 `offset` 和 `limit` 分页继续看。",
  "- `Read` 返回的是带行号的文件内容；如果返回 `truncated: true`、`hasMoreAfter: true`、`charLimited: true` 或 `nextStartLine`，表示当前只拿到一段，不是全文。",
  "- `RunSlashCommand` 执行的是用户当前真实酒馆实例中的斜杠命令，不是快照；查询类可以直接用，可能改动实例状态的命令要先明确说明并征得用户同意。",
  "- 调用工具时，使用工具定义里的确切名字和参数名，不要自己改名或脑补额外字段。",
  "- 工具如果返回 `ok: false`、`error`、`raw`、`truncated`、`warning` 等字段，必须按字面理解并如实告诉用户，不要把失败、截断、空结果当成成功证据。",
  "- 如果工具返回的是原样 API / 代理错误文本，就直接基于该文本说明问题，不要擅自改写成别的原因。",
  "- 当工具结果不足以支撑结论时，要继续查证，或明确说明当前还不能确认。"
], Wx = [
  {
    type: "function",
    function: {
      name: ge.LS,
      description: [
        "列出某个目录下的一级子项。",
        "用途：查看项目结构、确认某层有哪些目录/文件、数插件目录或模块目录。",
        "限制：只看一级子项，不读文件内容，不递归搜索。",
        "当你想知道“这一层有什么”时优先用它。"
      ].join(`
`),
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "目录公开路径，例如 scripts/extensions/third-party/ 或 scripts/extensions/third-party/LittleWhiteBox/modules/。"
          },
          limit: {
            type: "number",
            description: "最多返回多少个一级子项。默认 50，最大 100。"
          }
        },
        required: ["path"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.GLOB,
      description: [
        "按 glob 模式匹配文件路径。",
        "用途：先按路径模式缩小文件集合，例如 **/*.js、modules/assistant/**/*.js、story-summary/**/vector*.js。",
        "限制：只匹配文件路径，不检查文件内容。",
        "当你已经大致知道目录范围、想找某类文件时优先用它。"
      ].join(`
`),
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "glob 路径模式，例如 scripts/extensions/third-party/LittleWhiteBox/modules/**/*.js。"
          },
          limit: {
            type: "number",
            description: "最多返回多少个文件。默认 50，最大 100。"
          }
        },
        required: ["pattern"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.GREP,
      description: [
        "在文件内容中按 grep/rg 风格搜索。",
        "用途：搜索明确关键词、函数名、变量名、报错文本、配置项名或正则模式。",
        "默认按正则表达式处理；可用 glob 限定文件范围。",
        "输出模式：content 返回命中片段；files_with_matches 只返回命中文件；count 返回每个文件的命中次数。",
        "结果很多时，用 offset 跳过前 N 个结果，再配合 limit 查看下一页。",
        "不要用它做“熟悉整个项目”的宽泛扫射；开放式探索应先 LS / Glob，再针对性 Grep。"
      ].join(`
`),
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "grep/rg 风格的搜索模式。默认按正则处理。"
          },
          glob: {
            type: "string",
            description: "可选的文件路径 glob，例如 **/*.js 或 modules/assistant/**/*.js。"
          },
          outputMode: {
            type: "string",
            enum: [
              "content",
              "files_with_matches",
              "count"
            ],
            description: "输出模式。content 返回命中行和上下文；files_with_matches 只返回命中文件；count 返回每个文件的命中次数。默认 files_with_matches。"
          },
          limit: {
            type: "number",
            description: "最多返回多少个结果。默认 10，最大 50。可与 offset 一起用于分页。"
          },
          offset: {
            type: "number",
            description: "跳过前多少个结果后再返回。默认 0。适合结果很多时继续看下一页。"
          },
          contextLines: {
            type: "number",
            description: "每个匹配前后显示多少行上下文。默认 0，最大 5。"
          },
          useRegex: {
            type: "boolean",
            description: "是否按正则表达式处理。默认 true；需要字面量搜索时传 false。"
          }
        },
        required: ["pattern"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.READ,
      description: [
        "读取某个已索引公开文本文件。",
        "用途：查看具体实现、配置、样式、注释和文档内容。",
        "默认会尽量读取整文件；文件过大时会自动返回首段，并给出 nextStartLine / nextEndLine 供继续读取。",
        "可选 startLine / endLine 按行读取；当你已经知道大致位置时，优先定向读取需要的片段。",
        "结果使用带行号的文本格式返回，便于直接引用具体行。",
        "如果返回 truncated、hasMoreAfter、charLimited 或 nextStartLine，表示当前只拿到一段，不是全文。",
        "目录不能用 Read；目录结构请用 LS，文件集合请用 Glob，内容搜索请用 Grep。"
      ].join(`
`),
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "文件公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js。"
          },
          startLine: {
            type: "number",
            description: "可选起始行号（从 1 开始）。用于大文件分段读取。"
          },
          endLine: {
            type: "number",
            description: "可选结束行号。不填时会自动给出一个合适范围。"
          }
        },
        required: ["path"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.RUN_SLASH_COMMAND,
      description: [
        "执行 SillyTavern 斜杠命令（STscript）。",
        "用途：查询用户当前真实酒馆实例里的 API、模型、角色、聊天、扩展状态，或在用户明确同意后执行角色创建等操作。",
        "这不是读快照，而是直接作用于用户当前打开的实例。",
        "调用前要先想清楚命令会不会改动实例状态；查询类命令可直接执行，创建/修改/删除/发送消息/切换状态类命令要先征得用户同意。"
      ].join(`
`),
      parameters: {
        type: "object",
        properties: { command: {
          type: "string",
          description: '要执行的斜杠命令文本，例如 /api、/model、/char-get field=name、/char-create name="Alice"。'
        } },
        required: ["command"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.READ_IDENTITY,
      description: "读取酒馆 user/files/LittleWhiteBox_Assistant_Identity.md 这份固定身份设定文件；如果文件还不存在，也会返回不存在状态。",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.WRITE_IDENTITY,
      description: "将身份设定写入酒馆 user/files/LittleWhiteBox_Assistant_Identity.md。写入成功后，当前已打开的小白助手会立即使用新身份继续后续回合。",
      parameters: {
        type: "object",
        properties: { content: {
          type: "string",
          description: "完整身份文档内容。"
        } },
        required: ["content"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.READ_WORKLOG,
      description: "读取酒馆 user/files/LittleWhiteBox_Assistant_Worklog.md 这份固定工作记录；如果文件还不存在，也会返回不存在状态。",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ge.WRITE_WORKLOG,
      description: "将排查结果或工作记录写入酒馆 user/files 下的工作记录文件。默认写入 user/files/LittleWhiteBox_Assistant_Worklog.md；如果未指定 name，就写默认工作记录。",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "工作区文件名。"
          },
          content: {
            type: "string",
            description: "完整文档内容。"
          }
        },
        required: ["content"],
        additionalProperties: !1
      }
    }
  }
];
function Jx(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function ah(e = [], t) {
  const n = e.slice(0, 3), r = [];
  return n.forEach((i) => r.push(t(i))), e.length > n.length && r.push(`……其余 ${e.length - n.length} 项见详细结果`), r;
}
function zx(e, t = {}) {
  switch (e) {
    case ge.LS:
      return `查看目录 ${t.path || ""}`.trim();
    case ge.GLOB:
      return `匹配文件 ${t.pattern || ""}`.trim();
    case ge.GREP:
      return `搜索内容 ${t.pattern || ""}`.trim();
    case ge.READ:
      return `读取文件 ${t.path || ""}${t.startLine ? `:${t.startLine}` : ""}${t.endLine ? `-${t.endLine}` : ""}`.trim();
    case ge.RUN_SLASH_COMMAND:
      return `执行斜杠命令 ${t.command || ""}`.trim();
    case ge.READ_IDENTITY:
      return "读取身份设定";
    case ge.WRITE_IDENTITY:
      return "写入身份设定";
    case ge.READ_WORKLOG:
      return "读取工作记录";
    case ge.WRITE_WORKLOG:
      return `写入工作记录 ${t.name || ""}`.trim();
    default:
      return `调用工具 ${e}`;
  }
}
function iy(e) {
  const t = Jx(e.content, null);
  if (!t || typeof t != "object") return {
    summary: e.content || "",
    details: ""
  };
  if (t.ok === !1 && t.error) {
    const n = [
      `工具返回错误：${t.error}`,
      t.message ? `说明：${t.message}` : "",
      t.suggestion ? `建议：${t.suggestion}` : ""
    ].filter(Boolean), r = [];
    return t.path && r.push(`路径：${t.path}`), Number.isFinite(t.sizeBytes) && t.sizeBytes > 0 && r.push(`大小：${Math.round(t.sizeBytes / 1024)} KB`), Number.isFinite(t.lineCount) && t.lineCount >= 0 && r.push(`行数：${t.lineCount}`), t.raw && t.raw !== t.error && r.push(`原始错误：${t.raw}`), {
      summary: n.join(`
`),
      details: r.join(`
`)
    };
  }
  if (e.toolName === ge.GLOB) {
    const n = Array.isArray(t.items) ? t.items : [], r = [`glob“${t.pattern || ""}”命中 ${t.total || 0} 个文件，当前展示 ${n.length} 个。`];
    t.truncated && r.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (r.push(""), r.push(...ah(n, (o) => `- ${o.publicPath}${o.source ? ` [${o.source}]` : ""}`)));
    const i = n.map((o) => `- ${o.publicPath}${o.source ? ` [${o.source}]` : ""}`);
    return {
      summary: r.join(`
`),
      details: i.join(`
`)
    };
  }
  if (e.toolName === ge.LS) {
    const n = Array.isArray(t.items) ? t.items : [], r = [`目录 ${t.directoryPath || ""} 下找到 ${t.total || 0} 个一级子项，当前展示 ${n.length} 个。`];
    t.truncated && r.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (r.push(""), r.push(...ah(n, (o) => `- ${o.publicPath}${o.type === "directory" ? " [目录]" : ""}`)));
    const i = n.map((o) => {
      const s = [];
      return o.type === "directory" && s.push("目录"), o.source && s.push(o.source), o.type === "directory" && Number(o.descendantFileCount) > 0 && s.push(`包含 ${o.descendantFileCount} 个已索引文件`), `- ${o.publicPath}${s.length ? ` [${s.join(" | ")}]` : ""}`;
    });
    return {
      summary: r.join(`
`),
      details: i.join(`
`)
    };
  }
  if (e.toolName === ge.GREP) {
    const n = Array.isArray(t.items) ? t.items : [], r = t.outputMode || "files_with_matches", i = [`grep“${t.pattern || ""}”模式：${r}。当前展示 ${n.length} 个结果。`];
    t.glob && i.push(`glob 限定：${t.glob}`), Number(t.offset) > 0 && i.push(`偏移：已跳过前 ${t.offset} 个结果`), r === "content" && Number(t.contextLines) > 0 && i.push(`上下文：前后 ${t.contextLines} 行`), t.truncated ? (i.push(`结果仍有剩余；本次已扫描 ${t.scannedFiles || 0}/${t.candidateFiles || t.indexedFiles || 0} 个候选文件。`), i.push(`如需继续，可把 offset 设为 ${Number(t.nextOffset) || (Number(t.offset) || 0) + n.length}。`)) : Number(t.candidateFiles) > 0 && t.glob ? (i.push(`本次扫描 ${t.scannedFiles || 0}/${t.candidateFiles} 个候选文件。`), Number.isFinite(t.total) && i.push(`总命中文件数：${t.total}`)) : Number.isFinite(t.total) && i.push(`总命中文件数：${t.total}`);
    const o = [];
    return n.length && (i.push(""), n.forEach((s) => {
      if (r === "count")
        i.push(`- ${s.path}${Number.isFinite(s.matchCount) ? `（${s.matchCount} 处）` : ""}`), o.push(`${s.path}${Number.isFinite(s.matchCount) ? `: ${s.matchCount}` : ""}`);
      else if (r === "files_with_matches")
        i.push(`- ${s.path}${Number.isFinite(s.matchCount) ? `（${s.matchCount} 处）` : ""}`), o.push(s.path);
      else {
        const u = Array.isArray(s.matches) ? s.matches[0] : null, c = u?.line ? `:${u.line}` : "";
        i.push(`- ${s.path}${c}${s.matchCount ? `（${s.matchCount} 处）` : ""}`), Array.isArray(s.matches) && s.matches.length && (o.push(s.path), s.matches.forEach((d, h) => {
          o.push(`  [${h + 1}] 第 ${d.line || "?"} 行: ${d.text || ""}`), d.context && o.push(d.context);
        }), o.push(""));
      }
    })), {
      summary: i.join(`
`),
      details: o.join(`
`).trim()
    };
  }
  if (e.toolName === ge.READ) {
    const n = [
      `已读取文件：${t.path || ""}`,
      t.source ? `来源：${t.source}` : "",
      `范围：第 ${t.startLine || 1} 行到第 ${t.endLine || 0} 行 / 共 ${t.totalLines || 0} 行`,
      t.contentFormat === "numbered_lines" ? "格式：带行号内容" : ""
    ];
    return t.autoChunked && n.push("文件较大，当前自动返回首段。"), t.charLimited && n.push("当前结果还受输出预算限制，继续读取时请按 nextStartLine / nextEndLine 往后读。"), t.hasMoreBefore && n.push("前面还有内容。"), t.hasMoreAfter && n.push(`后面还有内容；如需继续，可从第 ${t.nextStartLine} 行读到第 ${t.nextEndLine} 行。`), !t.hasMoreBefore && !t.hasMoreAfter && n.push("当前已是完整读取结果。"), {
      summary: n.filter(Boolean).join(`
`),
      details: String(t.content || "")
    };
  }
  if (e.toolName === ge.RUN_SLASH_COMMAND) {
    const n = [`已执行斜杠命令：${t.command || ""}`, t.ok === !1 ? "状态：失败" : "状态：成功"];
    t.error && n.push(`错误：${t.error}`), t.note && n.push(`说明：${t.note}`);
    let r = "";
    return t.result !== void 0 ? r = typeof t.result == "string" ? t.result : JSON.stringify(t.result, null, 2) : t.raw && (r = typeof t.raw == "string" ? t.raw : JSON.stringify(t.raw, null, 2)), {
      summary: n.filter(Boolean).join(`
`),
      details: r
    };
  }
  return e.toolName === ge.WRITE_IDENTITY ? {
    summary: [`身份设定已写入 ${t.name || "LittleWhiteBox_Assistant_Identity.md"}`.trim(), t.hotUpdated ? "当前会话身份已同步刷新。" : ""].filter(Boolean).join(`
`),
    details: ""
  } : e.toolName === ge.READ_IDENTITY ? {
    summary: t.exists ? `已读取身份设定：${t.name || "LittleWhiteBox_Assistant_Identity.md"}` : `身份设定还不存在：${t.name || "LittleWhiteBox_Assistant_Identity.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : e.toolName === ge.WRITE_WORKLOG ? {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  } : e.toolName === ge.READ_WORKLOG ? {
    summary: t.exists ? `已读取工作记录：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}` : `工作记录还不存在：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
var Yx = 3.35, Xx = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), Qx = new TextEncoder();
function Zx(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: r, persistSession: i, render: o, showToast: s, post: u, createRequestId: c, safeJsonParse: d, describeError: h, describeToolCall: f, formatToolResultDisplay: p, buildTextWithAttachmentSummary: m, buildUserContentParts: g, normalizeAttachments: y, normalizeThoughtBlocks: v, normalizeSlashCommand: b, shouldRequireSlashCommandApproval: _, setApprovalStatus: w, buildSlashApprovalResult: E, isAbortError: A, createAdapter: S, getActiveProviderConfig: I, getSystemPrompt: C, SYSTEM_PROMPT: P, SUMMARY_SYSTEM_PROMPT: T, HISTORY_SUMMARY_PREFIX: k, MAX_CONTEXT_TOKENS: F, SUMMARY_TRIGGER_TOKENS: B, DEFAULT_PRESERVED_TURNS: W, MIN_PRESERVED_TURNS: O, MAX_TOOL_ROUNDS: le, REQUEST_TIMEOUT_MS: ue, TOOL_DEFINITIONS: D, TOOL_NAMES: q } = e;
  let X = !1, me = 0, fe = "", he = "", Ae = 0, at = 0;
  function sn() {
    const M = typeof C == "function" ? C() : P;
    return String(M || P).trim() || P;
  }
  function Os() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: F,
      summaryActive: !1
    };
  }
  function Mi() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${k}
${t.historySummary.trim()}`
    } : null;
  }
  function Gs() {
    const M = t.activeRun?.lightBrakeMessage;
    return M ? {
      role: "system",
      content: M
    } : null;
  }
  function Ni(M) {
    return `${Math.max(0, Math.round((Number(M) || 0) / 1e3))}k`;
  }
  function an(M = t.contextStats) {
    return `${Ni(M.usedTokens)}/${Ni(M.budgetTokens)}`;
  }
  function St(M, N = 1800) {
    const $ = String(M || "").replace(/\s+/g, " ").trim();
    return $.length <= N ? $ : `${$.slice(0, N)}…`;
  }
  function Zu(M) {
    if (M?.approvalRequest) return "";
    if (M.role === "tool") return St(p(M).summary || M.content || "", 1400);
    if (M.role === "assistant" && Array.isArray(M.toolCalls) && M.toolCalls.length) {
      const N = M.toolCalls.map(($) => `工具: ${$.name} ${$.arguments || "{}"}`.trim());
      return St([M.content || "", ...N].filter(Boolean).join(`
`), 1600);
    }
    return St(m(M.content || "", M.attachments), 1600);
  }
  function qs(M = t.messages) {
    const N = [];
    let $ = [];
    return (M || []).filter((G) => !G?.approvalRequest).forEach((G) => {
      if (G.role === "user" && $.length) {
        N.push($), $ = [G];
        return;
      }
      $.push(G);
    }), $.length && N.push($), N.filter((G) => G.length);
  }
  function Zy(M, N = "") {
    const $ = [];
    return N?.trim() && ($.push("已有历史摘要:"), $.push(N.trim()), $.push("")), M.forEach((G, Q) => {
      $.push(`第 ${Q + 1} 段历史:`), G.forEach((oe) => {
        const ye = oe.role === "user" ? "用户" : oe.role === "assistant" ? "助手" : `工具${oe.toolName ? `(${oe.toolName})` : ""}`;
        $.push(`${ye}: ${Zu(oe) || "[空]"}`);
      }), $.push("");
    }), $.join(`
`).trim();
  }
  function jy(M, N = "") {
    const $ = [];
    return N?.trim() && $.push(N.trim()), M.forEach((G, Q) => {
      const oe = G.map((ye) => `${ye.role === "user" ? "用户" : ye.role === "assistant" ? "助手" : `工具${ye.toolName ? `(${ye.toolName})` : ""}`}: ${Zu(ye) || "[空]"}`).join(`
`);
      $.push(`补充历史 ${Q + 1}:
${oe}`);
    }), St($.join(`

`), 6e3);
  }
  function ev() {
    let M = !1;
    return t.messages = t.messages.map((N) => {
      if (N?.role !== "assistant") return N;
      const $ = Array.isArray(N.thoughts) && N.thoughts.length, G = !!N.providerPayload;
      return !$ && !G ? N : (M = !0, {
        ...N,
        thoughts: [],
        providerPayload: void 0
      });
    }), M;
  }
  function tv() {
    const M = qs();
    return M.length ? M[M.length - 1] : [];
  }
  function ju(M = [], N = null) {
    const $ = v(M);
    if (!$.length) return $;
    const G = /* @__PURE__ */ new Set();
    return tv().forEach((Q) => {
      Q === N || Q?.role !== "assistant" || v(Q.thoughts).forEach((oe) => {
        G.add(`${oe.label}\0${oe.text}`);
      });
    }), $.filter((Q) => !G.has(`${Q.label}\0${Q.text}`));
  }
  function nv(M = []) {
    return M.map((N) => {
      const $ = Array.isArray(N.content) ? N.content.map((G) => !G || typeof G != "object" ? "" : G.type === "text" ? G.text || "" : G.type === "image_url" ? `[image:${G.name || G.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : N.content || "";
      return N.role === "assistant" && Array.isArray(N.tool_calls) && N.tool_calls.length ? {
        role: "assistant",
        content: [$, N.tool_calls.map((G) => JSON.stringify({
          id: G.id,
          name: G.function?.name || "",
          arguments: G.function?.arguments || "{}"
        })).join(`
`)].filter(Boolean).join(`
`)
      } : N.role === "tool" ? {
        role: "tool",
        content: [N.tool_call_id || "", N.content || ""].filter(Boolean).join(`
`)
      } : {
        role: N.role,
        content: $
      };
    });
  }
  function Vs(M = [], N = []) {
    return [...nv(M), {
      role: "system",
      content: N.length ? `TOOLS
${JSON.stringify(N)}` : ""
    }].filter(($) => $.content);
  }
  function rv(M) {
    return Math.ceil(Qx.encode(String(M || "")).length / Yx);
  }
  function ki({ messages: M = [], tools: N = [] } = {}) {
    return rv(JSON.stringify(Vs(M, N)));
  }
  function ec(M = [], N = D) {
    const $ = I();
    return JSON.stringify({
      provider: String($?.provider || ""),
      model: String($?.model || ""),
      messages: Vs(M, N)
    });
  }
  function iv(M) {
    const N = String(M?.model || "").trim();
    return N || (M?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function tc(M, N) {
    const $ = await fetch(M, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(N)
    });
    if (!$.ok) throw new Error(`tokenizer_http_${$.status}`);
    return await $.json();
  }
  async function ov(M = [], N = "") {
    if (!M.length) return 0;
    const $ = `/api/tokenizers/openai/count?model=${encodeURIComponent(N || "gpt-4o")}`;
    let G = -1;
    for (const Q of M) {
      const oe = await tc($, [Q]), ye = Number(oe?.token_count);
      if (!Number.isFinite(ye)) throw new Error("tokenizer_invalid_response");
      G += ye;
    }
    return Math.max(0, G);
  }
  async function sv(M, N) {
    const $ = await tc(M, { text: N }), G = Number($?.count);
    if (!Number.isFinite(G)) throw new Error("tokenizer_invalid_response");
    return G;
  }
  async function nc({ messages: M = [], tools: N = [] } = {}) {
    const $ = I(), G = String($?.provider || ""), Q = Vs(M, N), oe = JSON.stringify(Q);
    try {
      if (Xx.has(G)) return await ov(Q, iv($));
      if (G === "anthropic") return await sv("/api/tokenizers/claude/encode", oe);
    } catch {
      return ki({
        messages: M,
        tools: N
      });
    }
    return ki({
      messages: M,
      tools: N
    });
  }
  async function rc(M = [], N = D) {
    const $ = ec(M, N), G = !!t.historySummary;
    let Q = he === $ ? Ae : await nc({
      messages: M,
      tools: N
    });
    return Number.isFinite(Q) || (Q = ki({
      messages: M,
      tools: N
    })), he = $, Ae = Q, fe = $, t.contextStats = {
      usedTokens: Q,
      budgetTokens: F,
      summaryActive: G
    }, Q;
  }
  function av(M = [], N = D) {
    const $ = ec(M, N), G = !!t.historySummary, Q = he === $ ? Ae : ki({
      messages: M,
      tools: N
    });
    if (fe = $, t.contextStats = {
      usedTokens: Q,
      budgetTokens: F,
      summaryActive: G
    }, he === $) return;
    const oe = ++at;
    nc({
      messages: M,
      tools: N
    }).then((ye) => {
      if (oe !== at || fe !== $ || !Number.isFinite(ye)) return;
      he = $, Ae = ye;
      const ce = t.contextStats.usedTokens !== ye || t.contextStats.summaryActive !== G || t.contextStats.budgetTokens !== F;
      t.contextStats = {
        usedTokens: ye,
        budgetTokens: F,
        summaryActive: G
      }, ce && o();
    }).catch(() => {
    });
  }
  function mr(M) {
    M?.role === "user" && ev(), t.messages.push({
      ...M,
      attachments: y(M.attachments),
      thoughts: M?.role === "assistant" ? ju(M.thoughts) : v(M.thoughts)
    }), i();
  }
  function lv(M) {
    return Array.isArray(M) ? M.filter((N) => N && typeof N == "object" && N.name).map((N, $) => ({
      id: String(N.id || c(`tool-${$ + 1}`)),
      name: String(N.name || ""),
      arguments: typeof N.arguments == "string" ? N.arguments : JSON.stringify(N.arguments || {})
    })) : [];
  }
  function ic({ persist: M = !1 } = {}) {
    const N = Date.now();
    if ((M || N - me >= 1500) && (i(), me = N), X) return;
    X = !0;
    const $ = () => {
      X = !1, o();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame($);
      return;
    }
    setTimeout($, 16);
  }
  function uv() {
    const M = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(M), o(), M;
  }
  function oc(M, N = {}) {
    M && (typeof N.content == "string" && (M.content = N.content), N.providerPayload && typeof N.providerPayload == "object" && (M.providerPayload = N.providerPayload), Array.isArray(N.thoughts) && (M.thoughts = ju(N.thoughts, M)), Array.isArray(N.toolCalls) && (M.toolCalls = lv(N.toolCalls)), typeof N.streaming == "boolean" && (M.streaming = N.streaming));
  }
  function Hs(M, N = {}) {
    M && (oc(M, {
      ...N,
      streaming: !1
    }), ic({ persist: !0 }));
  }
  function cv(M, N) {
    for (const [$, G] of n.entries())
      G.runId === M && (n.delete($), G.cleanup?.(), G.reject(N));
  }
  function dv(M, N) {
    for (const [$, G] of r.entries())
      G.runId === M && (r.delete($), t.pendingApproval?.id === $ && (t.pendingApproval = null), G.cleanup?.(), G.reject(N));
    o();
  }
  function fv(M = "本轮请求已终止。") {
    const N = t.activeRun;
    N && (N.cancelNotice = M, t.progressLabel = "终止中", cv(N.id, /* @__PURE__ */ new Error("tool_aborted")), dv(N.id, /* @__PURE__ */ new Error("tool_aborted")), N.controller.abort(), o());
  }
  function Ks(M = t.messages) {
    const N = [{
      role: "system",
      content: sn()
    }], $ = Mi(), G = Gs();
    $ && N.push($), G && N.push(G);
    for (const Q of M)
      if (!Q?.approvalRequest) {
        if (Q.role === "assistant" && Array.isArray(Q.toolCalls) && Q.toolCalls.length) {
          N.push({
            role: "assistant",
            content: Q.content || "",
            providerPayload: Q.providerPayload,
            tool_calls: Q.toolCalls.map((oe) => ({
              id: oe.id,
              type: "function",
              function: {
                name: oe.name,
                arguments: oe.arguments
              }
            }))
          });
          continue;
        }
        if (Q.role === "tool") {
          N.push({
            role: "tool",
            tool_call_id: Q.toolCallId,
            content: Q.content
          });
          continue;
        }
        N.push({
          role: Q.role,
          providerPayload: Q.providerPayload,
          content: Q.role === "user" ? g(Q) : Q.content
        });
      }
    return N;
  }
  function Ws() {
    const M = qs(), N = Math.min(t.archivedTurnCount, M.length);
    return M.slice(N).flat();
  }
  function hv(M, N, $) {
    const G = String($?.message || $ || "tool_failed"), [Q] = G.split(":");
    return {
      ok: !1,
      toolName: M,
      path: typeof N?.path == "string" ? N.path : "",
      error: Q || "tool_failed",
      raw: G,
      message: h($)
    };
  }
  function sc(M, N, $) {
    if (!M || !N || !$) return;
    const G = `${N}::${$}`;
    M.toolErrorStreakKey === G ? M.toolErrorStreakCount += 1 : (M.toolErrorStreakKey = G, M.toolErrorStreakCount = 1), M.toolErrorStreakCount >= 3 && M.lastLightBrakeKey !== G && (M.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${N}\` 都返回了同一个错误：\`${$}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, M.lastLightBrakeKey = G);
  }
  function pv(M) {
    M && (M.toolErrorStreakKey = "", M.toolErrorStreakCount = 0);
  }
  async function mv(M, N, $) {
    if (!N.length) return;
    const G = Zy(N, t.historySummary), Q = jy(N, t.historySummary), oe = I();
    try {
      const ye = await M.chat({
        systemPrompt: T,
        messages: [{
          role: "user",
          content: G
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(oe.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: $
      });
      t.historySummary = String(ye.text || "").trim() || Q;
    } catch {
      t.historySummary = Q;
    }
  }
  async function gv(M, N) {
    const $ = qs(), G = [W, O];
    let Q = Ws(), oe = Ks(Q);
    if (await rc(oe), t.contextStats.usedTokens <= B) return oe;
    for (const ye of G) {
      const ce = Math.max(t.archivedTurnCount, $.length - Math.min(ye, $.length));
      if (ce > t.archivedTurnCount && (await mv(M, $.slice(t.archivedTurnCount, ce), N), t.archivedTurnCount = ce, i()), Q = Ws(), oe = Ks(Q), await rc(oe), t.contextStats.usedTokens <= B)
        return s(`已压缩较早历史，当前上下文 ${an()}`), o(), oe;
    }
    return s(`最近对话本身已接近上限，当前上下文 ${an()}`), o(), oe;
  }
  function yv(M, N, $ = {}) {
    const G = c("tool"), Q = t.activeRun;
    return Q && Q.id === $.runId && Q.toolRequestIds.add(G), new Promise((oe, ye) => {
      let ce = !1, Ee = null, _e = null;
      const lt = () => {
        Ee && (clearTimeout(Ee), Ee = null), $.signal && _e && $.signal.removeEventListener("abort", _e);
        const pt = t.activeRun;
        pt && pt.id === $.runId && pt.toolRequestIds.delete(G);
      }, Xe = (pt) => {
        ce || (ce = !0, n.delete(G), lt(), ye(pt));
      }, Ce = (pt) => {
        ce || (ce = !0, n.delete(G), lt(), oe(pt));
      };
      if (_e = () => {
        u("xb-assistant:tool-abort", { requestId: G }), Xe(/* @__PURE__ */ new Error("tool_aborted"));
      }, Ee = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: G }), Xe(/* @__PURE__ */ new Error("tool_timeout"));
      }, ue), n.set(G, {
        runId: $.runId,
        cleanup: lt,
        resolve: Ce,
        reject: Xe
      }), $.signal) {
        if ($.signal.aborted) {
          _e();
          return;
        }
        $.signal.addEventListener("abort", _e, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: G,
        name: M,
        arguments: N
      });
    });
  }
  function vv(M, N = {}) {
    const $ = c("approval"), G = t.activeRun?.id === N.runId ? t.activeRun : null;
    return t.pendingApproval = {
      id: $,
      kind: "slash-command",
      command: M,
      status: "pending"
    }, o(), new Promise((Q, oe) => {
      let ye = !1, ce = null;
      const Ee = () => {
        G && G.toolRequestIds.delete($), N.signal && ce && N.signal.removeEventListener("abort", ce);
      }, _e = () => {
        t.pendingApproval?.id === $ && (t.pendingApproval = null, o());
      }, lt = (Ce) => {
        ye || (ye = !0, r.delete($), Ee(), _e(), Q(Ce));
      }, Xe = (Ce) => {
        ye || (ye = !0, r.delete($), Ee(), _e(), oe(Ce));
      };
      if (ce = () => {
        Xe(/* @__PURE__ */ new Error("tool_aborted"));
      }, G && G.toolRequestIds.add($), r.set($, {
        runId: N.runId,
        cleanup: Ee,
        resolve: (Ce) => {
          lt(Ce);
        },
        reject: Xe
      }), N.signal) {
        if (N.signal.aborted) {
          ce();
          return;
        }
        N.signal.addEventListener("abort", ce, { once: !0 });
      }
    });
  }
  async function _v(M) {
    const N = S();
    let $ = 0, G = null;
    for (; $ < le; ) {
      if (M.controller.signal.aborted) throw new Error("assistant_aborted");
      $ += 1, t.currentRound = $, t.progressLabel = "生成中", o();
      const Q = I();
      let oe = null;
      const ye = (Ee = {}) => {
        const _e = typeof Ee.text == "string", lt = Array.isArray(Ee.thoughts);
        !_e && !lt || (oe || (oe = uv()), oc(oe, {
          ..._e ? { content: Ee.text } : {},
          ...lt ? { thoughts: Ee.thoughts } : {}
        }), ic());
      };
      let ce;
      try {
        const Ee = {
          systemPrompt: sn(),
          tools: D,
          toolChoice: "auto",
          temperature: Q.temperature,
          maxTokens: Q.maxTokens,
          reasoning: {
            enabled: Q.reasoningEnabled,
            effort: Q.reasoningEffort
          },
          signal: M.controller.signal,
          onStreamProgress: ye
        };
        Array.isArray(G) && G.length && N?.supportsSessionToolLoop ? Ee.toolResponses = G : Ee.messages = await gv(N, M.controller.signal), ce = await N.chat(Ee);
      } catch (Ee) {
        throw oe && Hs(oe), Ee;
      }
      if (Array.isArray(ce.toolCalls) && ce.toolCalls.length) {
        G = null, oe ? Hs(oe, {
          content: ce.text || "",
          thoughts: ce.thoughts,
          toolCalls: ce.toolCalls,
          providerPayload: ce.providerPayload
        }) : mr({
          role: "assistant",
          content: ce.text || "",
          toolCalls: ce.toolCalls,
          thoughts: ce.thoughts,
          providerPayload: ce.providerPayload
        }), o();
        const Ee = [];
        for (const _e of ce.toolCalls) {
          if (M.controller.signal.aborted) throw new Error("assistant_aborted");
          const lt = d(_e.arguments, {}), Xe = _e.name === q.RUN_SLASH_COMMAND ? b(lt.command) : "";
          t.progressLabel = "工具中", o();
          let Ce = null;
          try {
            _e.name === q.RUN_SLASH_COMMAND && _(Xe) && (t.progressLabel = "确认中", o(), await vv(Xe, {
              runId: M.id,
              signal: M.controller.signal
            }) || (Ce = E(Xe, !1))), Ce || (Ce = await yv(_e.name, lt, {
              runId: M.id,
              signal: M.controller.signal
            })), _e.name === q.RUN_SLASH_COMMAND && Xe && Ce?.ok !== !1 && _(Xe) && (Ce = {
              ...Ce,
              approval: E(Xe, !0)
            }), Ce?.ok === !1 && Ce.error !== "user_declined" ? sc(M, _e.name, Ce.error || "tool_failed") : pv(M);
          } catch (pt) {
            if (A(pt)) throw pt;
            Ce = hv(_e.name, lt, pt), sc(M, _e.name, Ce.error);
          }
          mr({
            role: "tool",
            toolCallId: _e.id,
            toolName: _e.name,
            content: JSON.stringify(Ce, null, 2)
          }), Ee.push({
            id: _e.id,
            name: _e.name,
            response: Ce
          }), o();
        }
        N?.supportsSessionToolLoop && (G = Ee);
        continue;
      }
      G = null, oe ? Hs(oe, {
        content: ce.text || "没有拿到有效回复。",
        thoughts: ce.thoughts,
        providerPayload: ce.providerPayload
      }) : mr({
        role: "assistant",
        content: ce.text || "没有拿到有效回复。",
        thoughts: ce.thoughts,
        providerPayload: ce.providerPayload
      }), t.progressLabel = "", o();
      return;
    }
    mr({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${le}/${le}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", o();
  }
  return {
    resetCompactionState: Os,
    buildContextMeterLabel: an,
    updateContextStats: av,
    pushMessage: mr,
    cancelActiveRun: fv,
    toProviderMessages: Ks,
    getActiveContextMessages: Ws,
    runAssistantLoop: _v
  };
}
var oy = "openai-compatible", sy = "默认", Sl = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 0.2
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 0.2,
    toolMode: "native"
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 0.2
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 0.2
  }
};
function Au() {
  return JSON.parse(JSON.stringify(Sl));
}
function Cu() {
  return {
    provider: oy,
    modelConfigs: Au()
  };
}
function ci(e) {
  return String(e || "").trim() || "默认";
}
function jx(e = {}) {
  const t = Au();
  return Object.keys(Sl).forEach((n) => {
    t[n] = {
      ...Sl[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function eI(e) {
  return typeof e == "string" && e.trim() ? e : oy;
}
function tI(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs
  } } : {};
}
function nI(e = {}, t) {
  const n = {}, r = tI(e, t);
  return Object.entries(r).forEach(([i, o]) => {
    if (!o || typeof o != "object") return;
    const s = ci(i);
    n[s] = {
      provider: eI(o.provider),
      modelConfigs: jx(o.modelConfigs || {})
    };
  }), Object.keys(n).length || (n[sy] = Cu()), n;
}
function rI(e, t) {
  const n = ci(t);
  return e[n] ? n : Object.keys(e)[0];
}
function ay(e = {}) {
  const t = nI(e, ci(e.currentPresetName || e.presetDraftName || "默认")), n = rI(t, e.currentPresetName), r = t[n] || Cu();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: n,
    presetDraftName: ci(e.presetDraftName || n),
    presetNames: Object.keys(t),
    presets: t,
    provider: r.provider,
    modelConfigs: r.modelConfigs
  };
}
var iI = /* @__PURE__ */ new Set([
  "char-data",
  "char-get",
  "char-find",
  "clipboard-get",
  "extension-exists",
  "extension-installed",
  "extension-state",
  "findchar",
  "findentry",
  "getchatname",
  "getentryfield",
  "getglobalbooks",
  "getglobalvar",
  "getpromptentry",
  "getvar",
  "is-mobile",
  "len",
  "listinjects",
  "listvar",
  "member-count",
  "member-get",
  "messages",
  "tokens",
  "wi-get-timed-effect"
]), oI = /* @__PURE__ */ new Set([
  "api",
  "api-url",
  "context",
  "getcharbook",
  "getchatbook",
  "getpersonabook",
  "instruct",
  "instruct-state",
  "model",
  "tokenizer"
]);
function xu(e) {
  const t = String(e || "").trim();
  return t ? t.startsWith("/") ? t : `/${t}` : "";
}
function ly(e) {
  const t = xu(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function sI(e) {
  const t = xu(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  if (!n) return "";
  const r = n.search(/\s/);
  return r < 0 ? "" : n.slice(r + 1).trim();
}
function El(e) {
  const t = String(e || "").trim();
  return t ? t.match(/(?:[^\s"]+|"[^"]*")+/g) || [] : [];
}
function Po(e) {
  const t = El(e), n = /* @__PURE__ */ new Map(), r = [];
  return t.forEach((i) => {
    const o = i.match(/^([A-Za-z0-9_-]+)=(.+)$/);
    if (!o) {
      r.push(i);
      return;
    }
    const s = String(o[1] || "").trim(), u = String(o[2] || "").trim();
    n.set(s, u);
  }), {
    tokens: t,
    named: n,
    positional: r
  };
}
function aI(e) {
  const t = String(e || "").trim();
  return t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}
function ya(e) {
  const t = aI(e).toLowerCase();
  return [
    "false",
    "off",
    "0",
    "no"
  ].includes(t);
}
function va(e, t = [], n = {}) {
  const { allowPositional: r = !1 } = n, i = Po(e);
  return !r && i.positional.length ? !1 : Array.from(i.named.keys()).every((o) => t.includes(o));
}
function lI(e) {
  const t = ly(e);
  if (!t) return !1;
  if (iI.has(t)) return !0;
  const n = sI(e);
  if (!oI.has(t)) return !1;
  switch (t) {
    case "api":
    case "context":
    case "model":
      return va(n, ["quiet"]);
    case "tokenizer":
      return El(n).length === 0;
    case "api-url":
      return va(n, [
        "api",
        "connect",
        "quiet"
      ]);
    case "instruct":
      return va(n, ["quiet", "forceGet"]);
    case "instruct-state":
      return El(n).length === 0;
    case "getchatbook": {
      const r = Po(n);
      return !r.positional.length && !r.named.has("name") && r.named.has("create") && ya(r.named.get("create"));
    }
    case "getpersonabook": {
      const r = Po(n);
      return r.positional.length || r.named.has("name") ? !1 : r.named.size ? r.named.size === 1 && r.named.has("create") && ya(r.named.get("create")) : !0;
    }
    case "getcharbook": {
      const r = Po(n), i = ["type", "create"];
      return !Array.from(r.named.keys()).every((o) => i.includes(o)) || r.named.has("name") || r.named.has("create") && !ya(r.named.get("create")) ? !1 : r.positional.length <= 1;
    }
    default:
      return !1;
  }
}
function uI(e) {
  return ly(e) ? !lI(e) : !1;
}
var Tl = function(e, t) {
  return Tl = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Tl(e, t);
};
function cI(e, t) {
  if (typeof t != "function" && t !== null) throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  Tl(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var se = function() {
  return se = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, se.apply(this, arguments);
};
function jo(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, i = t.length, o; r < i; r++) (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var Oe = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ue = Object.keys, Se = Array.isArray;
typeof Promise < "u" && !Oe.Promise && (Oe.Promise = Promise);
function ot(e, t) {
  return typeof t != "object" || Ue(t).forEach(function(n) {
    e[n] = t[n];
  }), e;
}
var nr = Object.getPrototypeOf, dI = {}.hasOwnProperty;
function Ye(e, t) {
  return dI.call(e, t);
}
function rr(e, t) {
  typeof t == "function" && (t = t(nr(e))), (typeof Reflect > "u" ? Ue : Reflect.ownKeys)(t).forEach(function(n) {
    jt(e, n, t[n]);
  });
}
var uy = Object.defineProperty;
function jt(e, t, n, r) {
  uy(e, t, ot(n && Ye(n, "get") && typeof n.get == "function" ? {
    get: n.get,
    set: n.set,
    configurable: !0
  } : {
    value: n,
    configurable: !0,
    writable: !0
  }, r));
}
function cr(e) {
  return { from: function(t) {
    return e.prototype = Object.create(t.prototype), jt(e.prototype, "constructor", e), { extend: rr.bind(null, e.prototype) };
  } };
}
var fI = Object.getOwnPropertyDescriptor;
function cy(e, t) {
  var n = fI(e, t), r;
  return n || (r = nr(e)) && cy(r, t);
}
var hI = [].slice;
function Ps(e, t, n) {
  return hI.call(e, t, n);
}
function dy(e, t) {
  return t(e);
}
function Qr(e) {
  if (!e) throw new Error("Assertion Failed");
}
function fy(e) {
  Oe.setImmediate ? setImmediate(e) : setTimeout(e, 0);
}
function pI(e, t) {
  return e.reduce(function(n, r, i) {
    var o = t(r, i);
    return o && (n[o[0]] = o[1]), n;
  }, {});
}
function Ut(e, t) {
  if (typeof t == "string" && Ye(e, t)) return e[t];
  if (!t) return e;
  if (typeof t != "string") {
    for (var n = [], r = 0, i = t.length; r < i; ++r) {
      var o = Ut(e, t[r]);
      n.push(o);
    }
    return n;
  }
  var s = t.indexOf(".");
  if (s !== -1) {
    var u = e[t.substr(0, s)];
    return u == null ? void 0 : Ut(u, t.substr(s + 1));
  }
}
function it(e, t, n) {
  if (!(!e || t === void 0) && !("isFrozen" in Object && Object.isFrozen(e)))
    if (typeof t != "string" && "length" in t) {
      Qr(typeof n != "string" && "length" in n);
      for (var r = 0, i = t.length; r < i; ++r) it(e, t[r], n[r]);
    } else {
      var o = t.indexOf(".");
      if (o !== -1) {
        var s = t.substr(0, o), u = t.substr(o + 1);
        if (u === "") n === void 0 ? Se(e) && !isNaN(parseInt(s)) ? e.splice(s, 1) : delete e[s] : e[s] = n;
        else {
          var c = e[s];
          (!c || !Ye(e, s)) && (c = e[s] = {}), it(c, u, n);
        }
      } else n === void 0 ? Se(e) && !isNaN(parseInt(t)) ? e.splice(t, 1) : delete e[t] : e[t] = n;
    }
}
function mI(e, t) {
  typeof t == "string" ? it(e, t, void 0) : "length" in t && [].map.call(t, function(n) {
    it(e, n, void 0);
  });
}
function hy(e) {
  var t = {};
  for (var n in e) Ye(e, n) && (t[n] = e[n]);
  return t;
}
var gI = [].concat;
function py(e) {
  return gI.apply([], e);
}
var yI = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(py([
  8,
  16,
  32,
  64
].map(function(e) {
  return [
    "Int",
    "Uint",
    "Float"
  ].map(function(t) {
    return t + e + "Array";
  });
}))).filter(function(e) {
  return Oe[e];
}), my = new Set(yI.map(function(e) {
  return Oe[e];
}));
function gy(e) {
  var t = {};
  for (var n in e) if (Ye(e, n)) {
    var r = e[n];
    t[n] = !r || typeof r != "object" || my.has(r.constructor) ? r : gy(r);
  }
  return t;
}
function vI(e) {
  for (var t in e) if (Ye(e, t)) return !1;
  return !0;
}
var ii = null;
function In(e) {
  ii = /* @__PURE__ */ new WeakMap();
  var t = Al(e);
  return ii = null, t;
}
function Al(e) {
  if (!e || typeof e != "object") return e;
  var t = ii.get(e);
  if (t) return t;
  if (Se(e)) {
    t = [], ii.set(e, t);
    for (var n = 0, r = e.length; n < r; ++n) t.push(Al(e[n]));
  } else if (my.has(e.constructor)) t = e;
  else {
    var i = nr(e);
    t = i === Object.prototype ? {} : Object.create(i), ii.set(e, t);
    for (var o in e) Ye(e, o) && (t[o] = Al(e[o]));
  }
  return t;
}
var _I = {}.toString;
function Cl(e) {
  return _I.call(e).slice(8, -1);
}
var xl = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", bI = typeof xl == "symbol" ? function(e) {
  var t;
  return e != null && (t = e[xl]) && t.apply(e);
} : function() {
  return null;
};
function mn(e, t) {
  var n = e.indexOf(t);
  return n >= 0 && e.splice(n, 1), n >= 0;
}
var Jn = {};
function $t(e) {
  var t, n, r, i;
  if (arguments.length === 1) {
    if (Se(e)) return e.slice();
    if (this === Jn && typeof e == "string") return [e];
    if (i = bI(e)) {
      for (n = []; r = i.next(), !r.done; ) n.push(r.value);
      return n;
    }
    if (e == null) return [e];
    if (t = e.length, typeof t == "number") {
      for (n = new Array(t); t--; ) n[t] = e[t];
      return n;
    }
    return [e];
  }
  for (t = arguments.length, n = new Array(t); t--; ) n[t] = arguments[t];
  return n;
}
var Iu = typeof Symbol < "u" ? function(e) {
  return e[Symbol.toStringTag] === "AsyncFunction";
} : function() {
  return !1;
}, wI = [
  "Modify",
  "Bulk",
  "OpenFailed",
  "VersionChange",
  "Schema",
  "Upgrade",
  "InvalidTable",
  "MissingAPI",
  "NoSuchDatabase",
  "InvalidArgument",
  "SubTransaction",
  "Unsupported",
  "Internal",
  "DatabaseClosed",
  "PrematureCommit",
  "ForeignAwait"
], yy = [
  "Unknown",
  "Constraint",
  "Data",
  "TransactionInactive",
  "ReadOnly",
  "Version",
  "NotFound",
  "InvalidState",
  "InvalidAccess",
  "Abort",
  "Timeout",
  "QuotaExceeded",
  "Syntax",
  "DataClone"
], Ru = wI.concat(yy), SI = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed",
  MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function dr(e, t) {
  this.name = e, this.message = t;
}
cr(dr).from(Error).extend({ toString: function() {
  return this.name + ": " + this.message;
} });
function vy(e, t) {
  return e + ". Errors: " + Object.keys(t).map(function(n) {
    return t[n].toString();
  }).filter(function(n, r, i) {
    return i.indexOf(n) === r;
  }).join(`
`);
}
function es(e, t, n, r) {
  this.failures = t, this.failedKeys = r, this.successCount = n, this.message = vy(e, t);
}
cr(es).from(dr);
function Qn(e, t) {
  this.name = "BulkError", this.failures = Object.keys(t).map(function(n) {
    return t[n];
  }), this.failuresByPos = t, this.message = vy(e, this.failures);
}
cr(Qn).from(dr);
var Pu = Ru.reduce(function(e, t) {
  return e[t] = t + "Error", e;
}, {}), EI = dr, ee = Ru.reduce(function(e, t) {
  var n = t + "Error";
  function r(i, o) {
    this.name = n, i ? typeof i == "string" ? (this.message = "".concat(i).concat(o ? `
 ` + o : ""), this.inner = o || null) : typeof i == "object" && (this.message = "".concat(i.name, " ").concat(i.message), this.inner = i) : (this.message = SI[t] || n, this.inner = null);
  }
  return cr(r).from(EI), e[t] = r, e;
}, {});
ee.Syntax = SyntaxError;
ee.Type = TypeError;
ee.Range = RangeError;
var lh = yy.reduce(function(e, t) {
  return e[t + "Error"] = ee[t], e;
}, {});
function TI(e, t) {
  if (!e || e instanceof dr || e instanceof TypeError || e instanceof SyntaxError || !e.name || !lh[e.name]) return e;
  var n = new lh[e.name](t || e.message, e);
  return "stack" in e && jt(n, "stack", { get: function() {
    return this.inner.stack;
  } }), n;
}
var Ms = Ru.reduce(function(e, t) {
  return [
    "Syntax",
    "Type",
    "Range"
  ].indexOf(t) === -1 && (e[t + "Error"] = ee[t]), e;
}, {});
Ms.ModifyError = es;
Ms.DexieError = dr;
Ms.BulkError = Qn;
function ve() {
}
function Ci(e) {
  return e;
}
function AI(e, t) {
  return e == null || e === Ci ? t : function(n) {
    return t(e(n));
  };
}
function Rn(e, t) {
  return function() {
    e.apply(this, arguments), t.apply(this, arguments);
  };
}
function CI(e, t) {
  return e === ve ? t : function() {
    var n = e.apply(this, arguments);
    n !== void 0 && (arguments[0] = n);
    var r = this.onsuccess, i = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var o = t.apply(this, arguments);
    return r && (this.onsuccess = this.onsuccess ? Rn(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Rn(i, this.onerror) : i), o !== void 0 ? o : n;
  };
}
function xI(e, t) {
  return e === ve ? t : function() {
    e.apply(this, arguments);
    var n = this.onsuccess, r = this.onerror;
    this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Rn(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Rn(r, this.onerror) : r);
  };
}
function II(e, t) {
  return e === ve ? t : function(n) {
    var r = e.apply(this, arguments);
    ot(n, r);
    var i = this.onsuccess, o = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var s = t.apply(this, arguments);
    return i && (this.onsuccess = this.onsuccess ? Rn(i, this.onsuccess) : i), o && (this.onerror = this.onerror ? Rn(o, this.onerror) : o), r === void 0 ? s === void 0 ? void 0 : s : ot(r, s);
  };
}
function RI(e, t) {
  return e === ve ? t : function() {
    return t.apply(this, arguments) === !1 ? !1 : e.apply(this, arguments);
  };
}
function Mu(e, t) {
  return e === ve ? t : function() {
    var n = e.apply(this, arguments);
    if (n && typeof n.then == "function") {
      for (var r = this, i = arguments.length, o = new Array(i); i--; ) o[i] = arguments[i];
      return n.then(function() {
        return t.apply(r, o);
      });
    }
    return t.apply(this, arguments);
  };
}
var xt = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function _y(e, t) {
  xt = e;
}
var di = {}, by = 100, Nu = typeof Promise > "u" ? [] : (function() {
  var e = Promise.resolve();
  if (typeof crypto > "u" || !crypto.subtle) return [
    e,
    nr(e),
    e
  ];
  var t = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [
    t,
    nr(t),
    e
  ];
})(), uh = Nu[0], ch = Nu[1], PI = Nu[2], MI = ch && ch.then, vn = uh && uh.constructor, ku = !!PI;
function NI() {
  queueMicrotask(DI);
}
var fi = function(e, t) {
  Zr.push([e, t]), ts && (NI(), ts = !1);
}, Il = !0, ts = !0, Tn = [], Mo = [], Rl = Ci, Qt = {
  id: "global",
  global: !0,
  ref: 0,
  unhandleds: [],
  onunhandled: ve,
  pgp: !1,
  env: {},
  finalize: ve
}, Z = Qt, Zr = [], An = 0, No = [];
function K(e) {
  if (typeof this != "object") throw new TypeError("Promises must be constructed via new");
  this._listeners = [], this._lib = !1;
  var t = this._PSD = Z;
  if (typeof e != "function") {
    if (e !== di) throw new TypeError("Not a function");
    this._state = arguments[1], this._value = arguments[2], this._state === !1 && Ml(this, this._value);
    return;
  }
  this._state = null, this._value = null, ++t.ref, Sy(this, e);
}
var Pl = {
  get: function() {
    var e = Z, t = ns;
    function n(r, i) {
      var o = this, s = !e.global && (e !== Z || t !== ns), u = s && !tn(), c = new K(function(d, h) {
        Du(o, new wy(dh(r, e, s, u), dh(i, e, s, u), d, h, e));
      });
      return this._consoleTask && (c._consoleTask = this._consoleTask), c;
    }
    return n.prototype = di, n;
  },
  set: function(e) {
    jt(this, "then", e && e.prototype === di ? Pl : {
      get: function() {
        return e;
      },
      set: Pl.set
    });
  }
};
rr(K.prototype, {
  then: Pl,
  _then: function(e, t) {
    Du(this, new wy(null, null, e, t, Z));
  },
  catch: function(e) {
    if (arguments.length === 1) return this.then(null, e);
    var t = arguments[0], n = arguments[1];
    return typeof t == "function" ? this.then(null, function(r) {
      return r instanceof t ? n(r) : ko(r);
    }) : this.then(null, function(r) {
      return r && r.name === t ? n(r) : ko(r);
    });
  },
  finally: function(e) {
    return this.then(function(t) {
      return K.resolve(e()).then(function() {
        return t;
      });
    }, function(t) {
      return K.resolve(e()).then(function() {
        return ko(t);
      });
    });
  },
  timeout: function(e, t) {
    var n = this;
    return e < 1 / 0 ? new K(function(r, i) {
      var o = setTimeout(function() {
        return i(new ee.Timeout(t));
      }, e);
      n.then(r, i).finally(clearTimeout.bind(null, o));
    }) : this;
  }
});
typeof Symbol < "u" && Symbol.toStringTag && jt(K.prototype, Symbol.toStringTag, "Dexie.Promise");
Qt.env = Ty();
function wy(e, t, n, r, i) {
  this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
}
rr(K, {
  all: function() {
    var e = $t.apply(null, arguments).map(rs);
    return new K(function(t, n) {
      e.length === 0 && t([]);
      var r = e.length;
      e.forEach(function(i, o) {
        return K.resolve(i).then(function(s) {
          e[o] = s, --r || t(e);
        }, n);
      });
    });
  },
  resolve: function(e) {
    return e instanceof K ? e : e && typeof e.then == "function" ? new K(function(t, n) {
      e.then(t, n);
    }) : new K(di, !0, e);
  },
  reject: ko,
  race: function() {
    var e = $t.apply(null, arguments).map(rs);
    return new K(function(t, n) {
      e.map(function(r) {
        return K.resolve(r).then(t, n);
      });
    });
  },
  PSD: {
    get: function() {
      return Z;
    },
    set: function(e) {
      return Z = e;
    }
  },
  totalEchoes: { get: function() {
    return ns;
  } },
  newPSD: en,
  usePSD: Pn,
  scheduler: {
    get: function() {
      return fi;
    },
    set: function(e) {
      fi = e;
    }
  },
  rejectionMapper: {
    get: function() {
      return Rl;
    },
    set: function(e) {
      Rl = e;
    }
  },
  follow: function(e, t) {
    return new K(function(n, r) {
      return en(function(i, o) {
        var s = Z;
        s.unhandleds = [], s.onunhandled = o, s.finalize = Rn(function() {
          var u = this;
          LI(function() {
            u.unhandleds.length === 0 ? i() : o(u.unhandleds[0]);
          });
        }, s.finalize), e();
      }, t, n, r);
    });
  }
});
vn && (vn.allSettled && jt(K, "allSettled", function() {
  var e = $t.apply(null, arguments).map(rs);
  return new K(function(t) {
    e.length === 0 && t([]);
    var n = e.length, r = new Array(n);
    e.forEach(function(i, o) {
      return K.resolve(i).then(function(s) {
        return r[o] = {
          status: "fulfilled",
          value: s
        };
      }, function(s) {
        return r[o] = {
          status: "rejected",
          reason: s
        };
      }).then(function() {
        return --n || t(r);
      });
    });
  });
}), vn.any && typeof AggregateError < "u" && jt(K, "any", function() {
  var e = $t.apply(null, arguments).map(rs);
  return new K(function(t, n) {
    e.length === 0 && n(/* @__PURE__ */ new AggregateError([]));
    var r = e.length, i = new Array(r);
    e.forEach(function(o, s) {
      return K.resolve(o).then(function(u) {
        return t(u);
      }, function(u) {
        i[s] = u, --r || n(new AggregateError(i));
      });
    });
  });
}), vn.withResolvers && (K.withResolvers = vn.withResolvers));
function Sy(e, t) {
  try {
    t(function(n) {
      if (e._state === null) {
        if (n === e) throw new TypeError("A promise cannot be resolved with itself.");
        var r = e._lib && fr();
        n && typeof n.then == "function" ? Sy(e, function(i, o) {
          n instanceof K ? n._then(i, o) : n.then(i, o);
        }) : (e._state = !0, e._value = n, Ey(e)), r && hr();
      }
    }, Ml.bind(null, e));
  } catch (n) {
    Ml(e, n);
  }
}
function Ml(e, t) {
  if (Mo.push(t), e._state === null) {
    var n = e._lib && fr();
    t = Rl(t), e._state = !1, e._value = t, $I(e), Ey(e), n && hr();
  }
}
function Ey(e) {
  var t = e._listeners;
  e._listeners = [];
  for (var n = 0, r = t.length; n < r; ++n) Du(e, t[n]);
  var i = e._PSD;
  --i.ref || i.finalize(), An === 0 && (++An, fi(function() {
    --An === 0 && Lu();
  }, []));
}
function Du(e, t) {
  if (e._state === null) {
    e._listeners.push(t);
    return;
  }
  var n = e._state ? t.onFulfilled : t.onRejected;
  if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
  ++t.psd.ref, ++An, fi(kI, [
    n,
    e,
    t
  ]);
}
function kI(e, t, n) {
  try {
    var r, i = t._value;
    !t._state && Mo.length && (Mo = []), r = xt && t._consoleTask ? t._consoleTask.run(function() {
      return e(i);
    }) : e(i), !t._state && Mo.indexOf(i) === -1 && UI(t), n.resolve(r);
  } catch (o) {
    n.reject(o);
  } finally {
    --An === 0 && Lu(), --n.psd.ref || n.psd.finalize();
  }
}
function DI() {
  Pn(Qt, function() {
    fr() && hr();
  });
}
function fr() {
  var e = Il;
  return Il = !1, ts = !1, e;
}
function hr() {
  var e, t, n;
  do
    for (; Zr.length > 0; )
      for (e = Zr, Zr = [], n = e.length, t = 0; t < n; ++t) {
        var r = e[t];
        r[0].apply(null, r[1]);
      }
  while (Zr.length > 0);
  Il = !0, ts = !0;
}
function Lu() {
  var e = Tn;
  Tn = [], e.forEach(function(r) {
    r._PSD.onunhandled.call(null, r._value, r);
  });
  for (var t = No.slice(0), n = t.length; n; ) t[--n]();
}
function LI(e) {
  function t() {
    e(), No.splice(No.indexOf(t), 1);
  }
  No.push(t), ++An, fi(function() {
    --An === 0 && Lu();
  }, []);
}
function $I(e) {
  Tn.some(function(t) {
    return t._value === e._value;
  }) || Tn.push(e);
}
function UI(e) {
  for (var t = Tn.length; t; ) if (Tn[--t]._value === e._value) {
    Tn.splice(t, 1);
    return;
  }
}
function ko(e) {
  return new K(di, !1, e);
}
function be(e, t) {
  var n = Z;
  return function() {
    var r = fr(), i = Z;
    try {
      return nn(n, !0), e.apply(this, arguments);
    } catch (o) {
      t && t(o);
    } finally {
      nn(i, !1), r && hr();
    }
  };
}
var Le = {
  awaits: 0,
  echoes: 0,
  id: 0
}, FI = 0, Do = [], Lo = 0, ns = 0, BI = 0;
function en(e, t, n, r) {
  var i = Z, o = Object.create(i);
  o.parent = i, o.ref = 0, o.global = !1, o.id = ++BI, Qt.env, o.env = ku ? {
    Promise: K,
    PromiseProp: {
      value: K,
      configurable: !0,
      writable: !0
    },
    all: K.all,
    race: K.race,
    allSettled: K.allSettled,
    any: K.any,
    resolve: K.resolve,
    reject: K.reject
  } : {}, t && ot(o, t), ++i.ref, o.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var s = Pn(o, e, n, r);
  return o.ref === 0 && o.finalize(), s;
}
function pr() {
  return Le.id || (Le.id = ++FI), ++Le.awaits, Le.echoes += by, Le.id;
}
function tn() {
  return Le.awaits ? (--Le.awaits === 0 && (Le.id = 0), Le.echoes = Le.awaits * by, !0) : !1;
}
("" + MI).indexOf("[native code]") === -1 && (pr = tn = ve);
function rs(e) {
  return Le.echoes && e && e.constructor === vn ? (pr(), e.then(function(t) {
    return tn(), t;
  }, function(t) {
    return tn(), xe(t);
  })) : e;
}
function OI(e) {
  ++ns, (!Le.echoes || --Le.echoes === 0) && (Le.echoes = Le.awaits = Le.id = 0), Do.push(Z), nn(e, !0);
}
function GI() {
  var e = Do[Do.length - 1];
  Do.pop(), nn(e, !1);
}
function nn(e, t) {
  var n = Z;
  if ((t ? Le.echoes && (!Lo++ || e !== Z) : Lo && (!--Lo || e !== Z)) && queueMicrotask(t ? OI.bind(null, e) : GI), e !== Z && (Z = e, n === Qt && (Qt.env = Ty()), ku)) {
    var r = Qt.env.Promise, i = e.env;
    (n.global || e.global) && (Object.defineProperty(Oe, "Promise", i.PromiseProp), r.all = i.all, r.race = i.race, r.resolve = i.resolve, r.reject = i.reject, i.allSettled && (r.allSettled = i.allSettled), i.any && (r.any = i.any));
  }
}
function Ty() {
  var e = Oe.Promise;
  return ku ? {
    Promise: e,
    PromiseProp: Object.getOwnPropertyDescriptor(Oe, "Promise"),
    all: e.all,
    race: e.race,
    allSettled: e.allSettled,
    any: e.any,
    resolve: e.resolve,
    reject: e.reject
  } : {};
}
function Pn(e, t, n, r, i) {
  var o = Z;
  try {
    return nn(e, !0), t(n, r, i);
  } finally {
    nn(o, !1);
  }
}
function dh(e, t, n, r) {
  return typeof e != "function" ? e : function() {
    var i = Z;
    n && pr(), nn(t, !0);
    try {
      return e.apply(this, arguments);
    } finally {
      nn(i, !1), r && queueMicrotask(tn);
    }
  };
}
function _a(e) {
  Promise === vn && Le.echoes === 0 ? Lo === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
}
var xe = K.reject;
function Nl(e, t, n, r) {
  if (!e.idbdb || !e._state.openComplete && !Z.letThrough && !e._vip) {
    if (e._state.openComplete) return xe(new ee.DatabaseClosed(e._state.dbOpenError));
    if (!e._state.isBeingOpened) {
      if (!e._state.autoOpen) return xe(new ee.DatabaseClosed());
      e.open().catch(ve);
    }
    return e._state.dbReadyPromise.then(function() {
      return Nl(e, t, n, r);
    });
  } else {
    var i = e._createTransaction(t, n, e._dbSchema);
    try {
      i.create(), e._state.PR1398_maxLoop = 3;
    } catch (o) {
      return o.name === Pu.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return Nl(e, t, n, r);
      })) : xe(o);
    }
    return i._promise(t, function(o, s) {
      return en(function() {
        return Z.trans = i, r(o, s, i);
      });
    }).then(function(o) {
      if (t === "readwrite") try {
        i.idbtrans.commit();
      } catch {
      }
      return t === "readonly" ? o : i._completion.then(function() {
        return o;
      });
    });
  }
}
var fh = "4.0.10", Sn = "￿", kl = -1 / 0, kt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Ay = "String expected.", tr = [], Ns = "__dbnames", ba = "readonly", wa = "readwrite";
function Mn(e, t) {
  return e ? t ? function() {
    return e.apply(this, arguments) && t.apply(this, arguments);
  } : e : t;
}
var Cy = {
  type: 3,
  lower: -1 / 0,
  lowerOpen: !1,
  upper: [[]],
  upperOpen: !1
};
function so(e) {
  return typeof e == "string" && !/\./.test(e) ? function(t) {
    return t[e] === void 0 && e in t && (t = In(t), delete t[e]), t;
  } : function(t) {
    return t;
  };
}
function qI() {
  throw ee.Type();
}
function de(e, t) {
  try {
    var n = hh(e), r = hh(t);
    if (n !== r)
      return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r !== "Date" ? NaN : -1;
    switch (n) {
      case "number":
      case "Date":
      case "string":
        return e > t ? 1 : e < t ? -1 : 0;
      case "binary":
        return HI(ph(e), ph(t));
      case "Array":
        return VI(e, t);
    }
  } catch {
  }
  return NaN;
}
function VI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) {
    var s = de(e[o], t[o]);
    if (s !== 0) return s;
  }
  return n === r ? 0 : n < r ? -1 : 1;
}
function HI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) if (e[o] !== t[o]) return e[o] < t[o] ? -1 : 1;
  return n === r ? 0 : n < r ? -1 : 1;
}
function hh(e) {
  var t = typeof e;
  if (t !== "object") return t;
  if (ArrayBuffer.isView(e)) return "binary";
  var n = Cl(e);
  return n === "ArrayBuffer" ? "binary" : n;
}
function ph(e) {
  return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
}
var xy = (function() {
  function e() {
  }
  return e.prototype._trans = function(t, n, r) {
    var i = this._tx || Z.trans, o = this.name, s = xt && typeof console < "u" && console.createTask && console.createTask("Dexie: ".concat(t === "readonly" ? "read" : "write", " ").concat(this.name));
    function u(h, f, p) {
      if (!p.schema[o]) throw new ee.NotFound("Table " + o + " not part of transaction");
      return n(p.idbtrans, p);
    }
    var c = fr();
    try {
      var d = i && i.db._novip === this.db._novip ? i === Z.trans ? i._promise(t, u, r) : en(function() {
        return i._promise(t, u, r);
      }, {
        trans: i,
        transless: Z.transless || Z
      }) : Nl(this.db, t, [this.name], u);
      return s && (d._consoleTask = s, d = d.catch(function(h) {
        return console.trace(h), xe(h);
      })), d;
    } finally {
      c && hr();
    }
  }, e.prototype.get = function(t, n) {
    var r = this;
    return t && t.constructor === Object ? this.where(t).first(n) : t == null ? xe(new ee.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(i) {
      return r.core.get({
        trans: i,
        key: t
      }).then(function(o) {
        return r.hook.reading.fire(o);
      });
    }).then(n);
  }, e.prototype.where = function(t) {
    if (typeof t == "string") return new this.db.WhereClause(this, t);
    if (Se(t)) return new this.db.WhereClause(this, "[".concat(t.join("+"), "]"));
    var n = Ue(t);
    if (n.length === 1) return this.where(n[0]).equals(t[n[0]]);
    var r = this.schema.indexes.concat(this.schema.primKey).filter(function(h) {
      if (h.compound && n.every(function(p) {
        return h.keyPath.indexOf(p) >= 0;
      })) {
        for (var f = 0; f < n.length; ++f) if (n.indexOf(h.keyPath[f]) === -1) return !1;
        return !0;
      }
      return !1;
    }).sort(function(h, f) {
      return h.keyPath.length - f.keyPath.length;
    })[0];
    if (r && this.db._maxKey !== Sn) {
      var i = r.keyPath.slice(0, n.length);
      return this.where(i).equals(i.map(function(h) {
        return t[h];
      }));
    }
    !r && xt && console.warn("The query ".concat(JSON.stringify(t), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(n.join("+"), "]"));
    var o = this.schema.idxByName;
    function s(h, f) {
      return de(h, f) === 0;
    }
    var u = n.reduce(function(h, f) {
      var p = h[0], m = h[1], g = o[f], y = t[f];
      return [p || g, p || !g ? Mn(m, g && g.multi ? function(v) {
        var b = Ut(v, f);
        return Se(b) && b.some(function(_) {
          return s(y, _);
        });
      } : function(v) {
        return s(y, Ut(v, f));
      }) : m];
    }, [null, null]), c = u[0], d = u[1];
    return c ? this.where(c.name).equals(t[c.keyPath]).filter(d) : r ? this.filter(d) : this.where(n).equals("");
  }, e.prototype.filter = function(t) {
    return this.toCollection().and(t);
  }, e.prototype.count = function(t) {
    return this.toCollection().count(t);
  }, e.prototype.offset = function(t) {
    return this.toCollection().offset(t);
  }, e.prototype.limit = function(t) {
    return this.toCollection().limit(t);
  }, e.prototype.each = function(t) {
    return this.toCollection().each(t);
  }, e.prototype.toArray = function(t) {
    return this.toCollection().toArray(t);
  }, e.prototype.toCollection = function() {
    return new this.db.Collection(new this.db.WhereClause(this));
  }, e.prototype.orderBy = function(t) {
    return new this.db.Collection(new this.db.WhereClause(this, Se(t) ? "[".concat(t.join("+"), "]") : t));
  }, e.prototype.reverse = function() {
    return this.toCollection().reverse();
  }, e.prototype.mapToClass = function(t) {
    var n = this, r = n.db, i = n.name;
    this.schema.mappedClass = t, t.prototype instanceof qI && (t = (function(c) {
      cI(d, c);
      function d() {
        return c !== null && c.apply(this, arguments) || this;
      }
      return Object.defineProperty(d.prototype, "db", {
        get: function() {
          return r;
        },
        enumerable: !1,
        configurable: !0
      }), d.prototype.table = function() {
        return i;
      }, d;
    })(t));
    for (var o = /* @__PURE__ */ new Set(), s = t.prototype; s; s = nr(s)) Object.getOwnPropertyNames(s).forEach(function(c) {
      return o.add(c);
    });
    var u = function(c) {
      if (!c) return c;
      var d = Object.create(t.prototype);
      for (var h in c) if (!o.has(h)) try {
        d[h] = c[h];
      } catch {
      }
      return d;
    };
    return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = u, this.hook("reading", u), t;
  }, e.prototype.defineClass = function() {
    function t(n) {
      ot(this, n);
    }
    return this.mapToClass(t);
  }, e.prototype.add = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = so(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "add",
        keys: n != null ? [n] : null,
        values: [u]
      });
    }).then(function(c) {
      return c.numFailures ? K.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        it(t, s, c);
      } catch {
      }
      return c;
    });
  }, e.prototype.update = function(t, n) {
    if (typeof t == "object" && !Se(t)) {
      var r = Ut(t, this.schema.primKey.keyPath);
      return r === void 0 ? xe(new ee.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(r).modify(n);
    } else return this.where(":id").equals(t).modify(n);
  }, e.prototype.put = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = so(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "put",
        values: [u],
        keys: n != null ? [n] : null
      });
    }).then(function(c) {
      return c.numFailures ? K.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        it(t, s, c);
      } catch {
      }
      return c;
    });
  }, e.prototype.delete = function(t) {
    var n = this;
    return this._trans("readwrite", function(r) {
      return n.core.mutate({
        trans: r,
        type: "delete",
        keys: [t]
      });
    }).then(function(r) {
      return r.numFailures ? K.reject(r.failures[0]) : void 0;
    });
  }, e.prototype.clear = function() {
    var t = this;
    return this._trans("readwrite", function(n) {
      return t.core.mutate({
        trans: n,
        type: "deleteRange",
        range: Cy
      });
    }).then(function(n) {
      return n.numFailures ? K.reject(n.failures[0]) : void 0;
    });
  }, e.prototype.bulkGet = function(t) {
    var n = this;
    return this._trans("readonly", function(r) {
      return n.core.getMany({
        keys: t,
        trans: r
      }).then(function(i) {
        return i.map(function(o) {
          return n.hook.reading.fire(o);
        });
      });
    });
  }, e.prototype.bulkAdd = function(t, n, r) {
    var i = this, o = Array.isArray(n) ? n : void 0;
    r = r || (o ? void 0 : n);
    var s = r ? r.allKeys : void 0;
    return this._trans("readwrite", function(u) {
      var c = i.schema.primKey, d = c.auto, h = c.keyPath;
      if (h && o) throw new ee.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new ee.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, p = h && d ? t.map(so(h)) : t;
      return i.core.mutate({
        trans: u,
        type: "add",
        keys: o,
        values: p,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new Qn("".concat(i.name, ".bulkAdd(): ").concat(g, " of ").concat(f, " operations failed"), b);
      });
    });
  }, e.prototype.bulkPut = function(t, n, r) {
    var i = this, o = Array.isArray(n) ? n : void 0;
    r = r || (o ? void 0 : n);
    var s = r ? r.allKeys : void 0;
    return this._trans("readwrite", function(u) {
      var c = i.schema.primKey, d = c.auto, h = c.keyPath;
      if (h && o) throw new ee.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new ee.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, p = h && d ? t.map(so(h)) : t;
      return i.core.mutate({
        trans: u,
        type: "put",
        keys: o,
        values: p,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new Qn("".concat(i.name, ".bulkPut(): ").concat(g, " of ").concat(f, " operations failed"), b);
      });
    });
  }, e.prototype.bulkUpdate = function(t) {
    var n = this, r = this.core, i = t.map(function(u) {
      return u.key;
    }), o = t.map(function(u) {
      return u.changes;
    }), s = [];
    return this._trans("readwrite", function(u) {
      return r.getMany({
        trans: u,
        keys: i,
        cache: "clone"
      }).then(function(c) {
        var d = [], h = [];
        t.forEach(function(p, m) {
          var g = p.key, y = p.changes, v = c[m];
          if (v) {
            for (var b = 0, _ = Object.keys(y); b < _.length; b++) {
              var w = _[b], E = y[w];
              if (w === n.schema.primKey.keyPath) {
                if (de(E, g) !== 0) throw new ee.Constraint("Cannot update primary key in bulkUpdate()");
              } else it(v, w, E);
            }
            s.push(m), d.push(g), h.push(v);
          }
        });
        var f = d.length;
        return r.mutate({
          trans: u,
          type: "put",
          keys: d,
          values: h,
          updates: {
            keys: i,
            changeSpecs: o
          }
        }).then(function(p) {
          var m = p.numFailures, g = p.failures;
          if (m === 0) return f;
          for (var y = 0, v = Object.keys(g); y < v.length; y++) {
            var b = v[y], _ = s[Number(b)];
            if (_ != null) {
              var w = g[b];
              delete g[b], g[_] = w;
            }
          }
          throw new Qn("".concat(n.name, ".bulkUpdate(): ").concat(m, " of ").concat(f, " operations failed"), g);
        });
      });
    });
  }, e.prototype.bulkDelete = function(t) {
    var n = this, r = t.length;
    return this._trans("readwrite", function(i) {
      return n.core.mutate({
        trans: i,
        type: "delete",
        keys: t
      });
    }).then(function(i) {
      var o = i.numFailures, s = i.lastResult, u = i.failures;
      if (o === 0) return s;
      throw new Qn("".concat(n.name, ".bulkDelete(): ").concat(o, " of ").concat(r, " operations failed"), u);
    });
  }, e;
})();
function xi(e) {
  var t = {}, n = function(u, c) {
    if (c) {
      for (var d = arguments.length, h = new Array(d - 1); --d; ) h[d - 1] = arguments[d];
      return t[u].subscribe.apply(null, h), e;
    } else if (typeof u == "string") return t[u];
  };
  n.addEventType = o;
  for (var r = 1, i = arguments.length; r < i; ++r) o(arguments[r]);
  return n;
  function o(u, c, d) {
    if (typeof u == "object") return s(u);
    c || (c = RI), d || (d = ve);
    var h = {
      subscribers: [],
      fire: d,
      subscribe: function(f) {
        h.subscribers.indexOf(f) === -1 && (h.subscribers.push(f), h.fire = c(h.fire, f));
      },
      unsubscribe: function(f) {
        h.subscribers = h.subscribers.filter(function(p) {
          return p !== f;
        }), h.fire = h.subscribers.reduce(c, d);
      }
    };
    return t[u] = n[u] = h, h;
  }
  function s(u) {
    Ue(u).forEach(function(c) {
      var d = u[c];
      if (Se(d)) o(c, u[c][0], u[c][1]);
      else if (d === "asap") var h = o(c, Ci, function() {
        for (var p = arguments.length, m = new Array(p); p--; ) m[p] = arguments[p];
        h.subscribers.forEach(function(g) {
          fy(function() {
            g.apply(null, m);
          });
        });
      });
      else throw new ee.InvalidArgument("Invalid event config");
    });
  }
}
function Ii(e, t) {
  return cr(t).from({ prototype: e }), t;
}
function KI(e) {
  return Ii(xy.prototype, function(n, r, i) {
    this.db = e, this._tx = i, this.name = n, this.schema = r, this.hook = e._allTables[n] ? e._allTables[n].hook : xi(null, {
      creating: [CI, ve],
      reading: [AI, Ci],
      updating: [II, ve],
      deleting: [xI, ve]
    });
  });
}
function Bn(e, t) {
  return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
}
function Sa(e, t) {
  e.filter = Mn(e.filter, t);
}
function Ea(e, t, n) {
  var r = e.replayFilter;
  e.replayFilter = r ? function() {
    return Mn(r(), t());
  } : t, e.justLimit = n && !r;
}
function WI(e, t) {
  e.isMatch = Mn(e.isMatch, t);
}
function $o(e, t) {
  if (e.isPrimKey) return t.primaryKey;
  var n = t.getIndexByKeyPath(e.index);
  if (!n) throw new ee.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
  return n;
}
function mh(e, t, n) {
  var r = $o(e, t.schema);
  return t.openCursor({
    trans: n,
    values: !e.keysOnly,
    reverse: e.dir === "prev",
    unique: !!e.unique,
    query: {
      index: r,
      range: e.range
    }
  });
}
function ao(e, t, n, r) {
  var i = e.replayFilter ? Mn(e.filter, e.replayFilter()) : e.filter;
  if (e.or) {
    var o = {}, s = function(u, c, d) {
      if (!i || i(c, d, function(p) {
        return c.stop(p);
      }, function(p) {
        return c.fail(p);
      })) {
        var h = c.primaryKey, f = "" + h;
        f === "[object ArrayBuffer]" && (f = "" + new Uint8Array(h)), Ye(o, f) || (o[f] = !0, t(u, c, d));
      }
    };
    return Promise.all([e.or._iterate(s, n), gh(mh(e, r, n), e.algorithm, s, !e.keysOnly && e.valueMapper)]);
  } else
    return gh(mh(e, r, n), Mn(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
}
function gh(e, t, n, r) {
  var i = be(r ? function(o, s, u) {
    return n(r(o), s, u);
  } : n);
  return e.then(function(o) {
    if (o) return o.start(function() {
      var s = function() {
        return o.continue();
      };
      (!t || t(o, function(u) {
        return s = u;
      }, function(u) {
        o.stop(u), s = ve;
      }, function(u) {
        o.fail(u), s = ve;
      })) && i(o.value, o, function(u) {
        return s = u;
      }), s();
    });
  });
}
var JI = (function() {
  function e(t) {
    Object.assign(this, t);
  }
  return e.prototype.execute = function(t) {
    var n;
    if (this.add !== void 0) {
      var r = this.add;
      if (Se(r)) return jo(jo([], Se(t) ? t : [], !0), r, !0).sort();
      if (typeof r == "number") return (Number(t) || 0) + r;
      if (typeof r == "bigint") try {
        return BigInt(t) + r;
      } catch {
        return BigInt(0) + r;
      }
      throw new TypeError("Invalid term ".concat(r));
    }
    if (this.remove !== void 0) {
      var i = this.remove;
      if (Se(i)) return Se(t) ? t.filter(function(s) {
        return !i.includes(s);
      }).sort() : [];
      if (typeof i == "number") return Number(t) - i;
      if (typeof i == "bigint") try {
        return BigInt(t) - i;
      } catch {
        return BigInt(0) - i;
      }
      throw new TypeError("Invalid subtrahend ".concat(i));
    }
    var o = (n = this.replacePrefix) === null || n === void 0 ? void 0 : n[0];
    return o && typeof t == "string" && t.startsWith(o) ? this.replacePrefix[1] + t.substring(o.length) : t;
  }, e;
})(), zI = (function() {
  function e() {
  }
  return e.prototype._read = function(t, n) {
    var r = this._ctx;
    return r.error ? r.table._trans(null, xe.bind(null, r.error)) : r.table._trans("readonly", t).then(n);
  }, e.prototype._write = function(t) {
    var n = this._ctx;
    return n.error ? n.table._trans(null, xe.bind(null, n.error)) : n.table._trans("readwrite", t, "locked");
  }, e.prototype._addAlgorithm = function(t) {
    var n = this._ctx;
    n.algorithm = Mn(n.algorithm, t);
  }, e.prototype._iterate = function(t, n) {
    return ao(this._ctx, t, n, this._ctx.table.core);
  }, e.prototype.clone = function(t) {
    var n = Object.create(this.constructor.prototype), r = Object.create(this._ctx);
    return t && ot(r, t), n._ctx = r, n;
  }, e.prototype.raw = function() {
    return this._ctx.valueMapper = null, this;
  }, e.prototype.each = function(t) {
    var n = this._ctx;
    return this._read(function(r) {
      return ao(n, t, r, n.table.core);
    });
  }, e.prototype.count = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx, o = i.table.core;
      if (Bn(i, !0)) return o.count({
        trans: r,
        query: {
          index: $o(i, o.schema),
          range: i.range
        }
      }).then(function(u) {
        return Math.min(u, i.limit);
      });
      var s = 0;
      return ao(i, function() {
        return ++s, !1;
      }, r, o).then(function() {
        return s;
      });
    }).then(t);
  }, e.prototype.sortBy = function(t, n) {
    var r = t.split(".").reverse(), i = r[0], o = r.length - 1;
    function s(d, h) {
      return h ? s(d[r[h]], h - 1) : d[i];
    }
    var u = this._ctx.dir === "next" ? 1 : -1;
    function c(d, h) {
      return de(s(d, o), s(h, o)) * u;
    }
    return this.toArray(function(d) {
      return d.sort(c);
    }).then(n);
  }, e.prototype.toArray = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx;
      if (i.dir === "next" && Bn(i, !0) && i.limit > 0) {
        var o = i.valueMapper, s = $o(i, i.table.core.schema);
        return i.table.core.query({
          trans: r,
          limit: i.limit,
          values: !0,
          query: {
            index: s,
            range: i.range
          }
        }).then(function(c) {
          var d = c.result;
          return o ? d.map(o) : d;
        });
      } else {
        var u = [];
        return ao(i, function(c) {
          return u.push(c);
        }, r, i.table.core).then(function() {
          return u;
        });
      }
    }, t);
  }, e.prototype.offset = function(t) {
    var n = this._ctx;
    return t <= 0 ? this : (n.offset += t, Bn(n) ? Ea(n, function() {
      var r = t;
      return function(i, o) {
        return r === 0 ? !0 : r === 1 ? (--r, !1) : (o(function() {
          i.advance(r), r = 0;
        }), !1);
      };
    }) : Ea(n, function() {
      var r = t;
      return function() {
        return --r < 0;
      };
    }), this);
  }, e.prototype.limit = function(t) {
    return this._ctx.limit = Math.min(this._ctx.limit, t), Ea(this._ctx, function() {
      var n = t;
      return function(r, i, o) {
        return --n <= 0 && i(o), n >= 0;
      };
    }, !0), this;
  }, e.prototype.until = function(t, n) {
    return Sa(this._ctx, function(r, i, o) {
      return t(r.value) ? (i(o), n) : !0;
    }), this;
  }, e.prototype.first = function(t) {
    return this.limit(1).toArray(function(n) {
      return n[0];
    }).then(t);
  }, e.prototype.last = function(t) {
    return this.reverse().first(t);
  }, e.prototype.filter = function(t) {
    return Sa(this._ctx, function(n) {
      return t(n.value);
    }), WI(this._ctx, t), this;
  }, e.prototype.and = function(t) {
    return this.filter(t);
  }, e.prototype.or = function(t) {
    return new this.db.WhereClause(this._ctx.table, t, this);
  }, e.prototype.reverse = function() {
    return this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
  }, e.prototype.desc = function() {
    return this.reverse();
  }, e.prototype.eachKey = function(t) {
    var n = this._ctx;
    return n.keysOnly = !n.isMatch, this.each(function(r, i) {
      t(i.key, i);
    });
  }, e.prototype.eachUniqueKey = function(t) {
    return this._ctx.unique = "unique", this.eachKey(t);
  }, e.prototype.eachPrimaryKey = function(t) {
    var n = this._ctx;
    return n.keysOnly = !n.isMatch, this.each(function(r, i) {
      t(i.primaryKey, i);
    });
  }, e.prototype.keys = function(t) {
    var n = this._ctx;
    n.keysOnly = !n.isMatch;
    var r = [];
    return this.each(function(i, o) {
      r.push(o.key);
    }).then(function() {
      return r;
    }).then(t);
  }, e.prototype.primaryKeys = function(t) {
    var n = this._ctx;
    if (n.dir === "next" && Bn(n, !0) && n.limit > 0) return this._read(function(i) {
      var o = $o(n, n.table.core.schema);
      return n.table.core.query({
        trans: i,
        values: !1,
        limit: n.limit,
        query: {
          index: o,
          range: n.range
        }
      });
    }).then(function(i) {
      return i.result;
    }).then(t);
    n.keysOnly = !n.isMatch;
    var r = [];
    return this.each(function(i, o) {
      r.push(o.primaryKey);
    }).then(function() {
      return r;
    }).then(t);
  }, e.prototype.uniqueKeys = function(t) {
    return this._ctx.unique = "unique", this.keys(t);
  }, e.prototype.firstKey = function(t) {
    return this.limit(1).keys(function(n) {
      return n[0];
    }).then(t);
  }, e.prototype.lastKey = function(t) {
    return this.reverse().firstKey(t);
  }, e.prototype.distinct = function() {
    var t = this._ctx, n = t.index && t.table.schema.idxByName[t.index];
    if (!n || !n.multi) return this;
    var r = {};
    return Sa(this._ctx, function(i) {
      var o = i.primaryKey.toString(), s = Ye(r, o);
      return r[o] = !0, !s;
    }), this;
  }, e.prototype.modify = function(t) {
    var n = this, r = this._ctx;
    return this._write(function(i) {
      var o;
      if (typeof t == "function") o = t;
      else {
        var s = Ue(t), u = s.length;
        o = function(_) {
          for (var w = !1, E = 0; E < u; ++E) {
            var A = s[E], S = t[A], I = Ut(_, A);
            S instanceof JI ? (it(_, A, S.execute(I)), w = !0) : I !== S && (it(_, A, S), w = !0);
          }
          return w;
        };
      }
      var c = r.table.core, d = c.schema.primaryKey, h = d.outbound, f = d.extractKey, p = 200, m = n.db._options.modifyChunkSize;
      m && (typeof m == "object" ? p = m[c.name] || m["*"] || 200 : p = m);
      var g = [], y = 0, v = [], b = function(_, w) {
        var E = w.failures, A = w.numFailures;
        y += _ - A;
        for (var S = 0, I = Ue(E); S < I.length; S++) {
          var C = I[S];
          g.push(E[C]);
        }
      };
      return n.clone().primaryKeys().then(function(_) {
        var w = Bn(r) && r.limit === 1 / 0 && (typeof t != "function" || t === Ta) && {
          index: r.index,
          range: r.range
        }, E = function(A) {
          var S = Math.min(p, _.length - A);
          return c.getMany({
            trans: i,
            keys: _.slice(A, A + S),
            cache: "immutable"
          }).then(function(I) {
            for (var C = [], P = [], T = h ? [] : null, k = [], F = 0; F < S; ++F) {
              var B = I[F], W = {
                value: In(B),
                primKey: _[A + F]
              };
              o.call(W, W.value, W) !== !1 && (W.value == null ? k.push(_[A + F]) : !h && de(f(B), f(W.value)) !== 0 ? (k.push(_[A + F]), C.push(W.value)) : (P.push(W.value), h && T.push(_[A + F])));
            }
            return Promise.resolve(C.length > 0 && c.mutate({
              trans: i,
              type: "add",
              values: C
            }).then(function(O) {
              for (var le in O.failures) k.splice(parseInt(le), 1);
              b(C.length, O);
            })).then(function() {
              return (P.length > 0 || w && typeof t == "object") && c.mutate({
                trans: i,
                type: "put",
                keys: T,
                values: P,
                criteria: w,
                changeSpec: typeof t != "function" && t,
                isAdditionalChunk: A > 0
              }).then(function(O) {
                return b(P.length, O);
              });
            }).then(function() {
              return (k.length > 0 || w && t === Ta) && c.mutate({
                trans: i,
                type: "delete",
                keys: k,
                criteria: w,
                isAdditionalChunk: A > 0
              }).then(function(O) {
                return b(k.length, O);
              });
            }).then(function() {
              return _.length > A + S && E(A + p);
            });
          });
        };
        return E(0).then(function() {
          if (g.length > 0) throw new es("Error modifying one or more objects", g, y, v);
          return _.length;
        });
      });
    });
  }, e.prototype.delete = function() {
    var t = this._ctx, n = t.range;
    return Bn(t) && (t.isPrimKey || n.type === 3) ? this._write(function(r) {
      var i = t.table.core.schema.primaryKey, o = n;
      return t.table.core.count({
        trans: r,
        query: {
          index: i,
          range: o
        }
      }).then(function(s) {
        return t.table.core.mutate({
          trans: r,
          type: "deleteRange",
          range: o
        }).then(function(u) {
          var c = u.failures;
          u.lastResult, u.results;
          var d = u.numFailures;
          if (d) throw new es("Could not delete some values", Object.keys(c).map(function(h) {
            return c[h];
          }), s - d);
          return s - d;
        });
      });
    }) : this.modify(Ta);
  }, e;
})(), Ta = function(e, t) {
  return t.value = null;
};
function YI(e) {
  return Ii(zI.prototype, function(n, r) {
    this.db = e;
    var i = Cy, o = null;
    if (r) try {
      i = r();
    } catch (d) {
      o = d;
    }
    var s = n._ctx, u = s.table, c = u.hook.reading.fire;
    this._ctx = {
      table: u,
      index: s.index,
      isPrimKey: !s.index || u.schema.primKey.keyPath && s.index === u.schema.primKey.name,
      range: i,
      keysOnly: !1,
      dir: "next",
      unique: "",
      algorithm: null,
      filter: null,
      replayFilter: null,
      justLimit: !0,
      isMatch: null,
      offset: 0,
      limit: 1 / 0,
      error: o,
      or: s.or,
      valueMapper: c !== Ci ? c : null
    };
  });
}
function XI(e, t) {
  return e < t ? -1 : e === t ? 0 : 1;
}
function QI(e, t) {
  return e > t ? -1 : e === t ? 0 : 1;
}
function nt(e, t, n) {
  var r = e instanceof Ry ? new e.Collection(e) : e;
  return r._ctx.error = n ? new n(t) : new TypeError(t), r;
}
function On(e) {
  return new e.Collection(e, function() {
    return Iy("");
  }).limit(0);
}
function ZI(e) {
  return e === "next" ? function(t) {
    return t.toUpperCase();
  } : function(t) {
    return t.toLowerCase();
  };
}
function jI(e) {
  return e === "next" ? function(t) {
    return t.toLowerCase();
  } : function(t) {
    return t.toUpperCase();
  };
}
function eR(e, t, n, r, i, o) {
  for (var s = Math.min(e.length, r.length), u = -1, c = 0; c < s; ++c) {
    var d = t[c];
    if (d !== r[c])
      return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : u >= 0 ? e.substr(0, u) + t[u] + n.substr(u + 1) : null;
    i(e[c], d) < 0 && (u = c);
  }
  return s < r.length && o === "next" ? e + n.substr(e.length) : s < e.length && o === "prev" ? e.substr(0, n.length) : u < 0 ? null : e.substr(0, u) + r[u] + n.substr(u + 1);
}
function lo(e, t, n, r) {
  var i, o, s, u, c, d, h, f = n.length;
  if (!n.every(function(y) {
    return typeof y == "string";
  })) return nt(e, Ay);
  function p(y) {
    i = ZI(y), o = jI(y), s = y === "next" ? XI : QI;
    var v = n.map(function(b) {
      return {
        lower: o(b),
        upper: i(b)
      };
    }).sort(function(b, _) {
      return s(b.lower, _.lower);
    });
    u = v.map(function(b) {
      return b.upper;
    }), c = v.map(function(b) {
      return b.lower;
    }), d = y, h = y === "next" ? "" : r;
  }
  p("next");
  var m = new e.Collection(e, function() {
    return Wt(u[0], c[f - 1] + r);
  });
  m._ondirectionchange = function(y) {
    p(y);
  };
  var g = 0;
  return m._addAlgorithm(function(y, v, b) {
    var _ = y.key;
    if (typeof _ != "string") return !1;
    var w = o(_);
    if (t(w, c, g)) return !0;
    for (var E = null, A = g; A < f; ++A) {
      var S = eR(_, w, u[A], c[A], s, d);
      S === null && E === null ? g = A + 1 : (E === null || s(E, S) > 0) && (E = S);
    }
    return v(E !== null ? function() {
      y.continue(E + h);
    } : b), !1;
  }), m;
}
function Wt(e, t, n, r) {
  return {
    type: 2,
    lower: e,
    upper: t,
    lowerOpen: n,
    upperOpen: r
  };
}
function Iy(e) {
  return {
    type: 1,
    lower: e,
    upper: e
  };
}
var Ry = (function() {
  function e() {
  }
  return Object.defineProperty(e.prototype, "Collection", {
    get: function() {
      return this._ctx.table.db.Collection;
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype.between = function(t, n, r, i) {
    r = r !== !1, i = i === !0;
    try {
      return this._cmp(t, n) > 0 || this._cmp(t, n) === 0 && (r || i) && !(r && i) ? On(this) : new this.Collection(this, function() {
        return Wt(t, n, !r, !i);
      });
    } catch {
      return nt(this, kt);
    }
  }, e.prototype.equals = function(t) {
    return t == null ? nt(this, kt) : new this.Collection(this, function() {
      return Iy(t);
    });
  }, e.prototype.above = function(t) {
    return t == null ? nt(this, kt) : new this.Collection(this, function() {
      return Wt(t, void 0, !0);
    });
  }, e.prototype.aboveOrEqual = function(t) {
    return t == null ? nt(this, kt) : new this.Collection(this, function() {
      return Wt(t, void 0, !1);
    });
  }, e.prototype.below = function(t) {
    return t == null ? nt(this, kt) : new this.Collection(this, function() {
      return Wt(void 0, t, !1, !0);
    });
  }, e.prototype.belowOrEqual = function(t) {
    return t == null ? nt(this, kt) : new this.Collection(this, function() {
      return Wt(void 0, t);
    });
  }, e.prototype.startsWith = function(t) {
    return typeof t != "string" ? nt(this, Ay) : this.between(t, t + Sn, !0, !0);
  }, e.prototype.startsWithIgnoreCase = function(t) {
    return t === "" ? this.startsWith(t) : lo(this, function(n, r) {
      return n.indexOf(r[0]) === 0;
    }, [t], Sn);
  }, e.prototype.equalsIgnoreCase = function(t) {
    return lo(this, function(n, r) {
      return n === r[0];
    }, [t], "");
  }, e.prototype.anyOfIgnoreCase = function() {
    var t = $t.apply(Jn, arguments);
    return t.length === 0 ? On(this) : lo(this, function(n, r) {
      return r.indexOf(n) !== -1;
    }, t, "");
  }, e.prototype.startsWithAnyOfIgnoreCase = function() {
    var t = $t.apply(Jn, arguments);
    return t.length === 0 ? On(this) : lo(this, function(n, r) {
      return r.some(function(i) {
        return n.indexOf(i) === 0;
      });
    }, t, Sn);
  }, e.prototype.anyOf = function() {
    var t = this, n = $t.apply(Jn, arguments), r = this._cmp;
    try {
      n.sort(r);
    } catch {
      return nt(this, kt);
    }
    if (n.length === 0) return On(this);
    var i = new this.Collection(this, function() {
      return Wt(n[0], n[n.length - 1]);
    });
    i._ondirectionchange = function(s) {
      r = s === "next" ? t._ascending : t._descending, n.sort(r);
    };
    var o = 0;
    return i._addAlgorithm(function(s, u, c) {
      for (var d = s.key; r(d, n[o]) > 0; )
        if (++o, o === n.length)
          return u(c), !1;
      return r(d, n[o]) === 0 ? !0 : (u(function() {
        s.continue(n[o]);
      }), !1);
    }), i;
  }, e.prototype.notEqual = function(t) {
    return this.inAnyRange([[kl, t], [t, this.db._maxKey]], {
      includeLowers: !1,
      includeUppers: !1
    });
  }, e.prototype.noneOf = function() {
    var t = $t.apply(Jn, arguments);
    if (t.length === 0) return new this.Collection(this);
    try {
      t.sort(this._ascending);
    } catch {
      return nt(this, kt);
    }
    var n = t.reduce(function(r, i) {
      return r ? r.concat([[r[r.length - 1][1], i]]) : [[kl, i]];
    }, null);
    return n.push([t[t.length - 1], this.db._maxKey]), this.inAnyRange(n, {
      includeLowers: !1,
      includeUppers: !1
    });
  }, e.prototype.inAnyRange = function(t, n) {
    var r = this, i = this._cmp, o = this._ascending, s = this._descending, u = this._min, c = this._max;
    if (t.length === 0) return On(this);
    if (!t.every(function(A) {
      return A[0] !== void 0 && A[1] !== void 0 && o(A[0], A[1]) <= 0;
    })) return nt(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", ee.InvalidArgument);
    var d = !n || n.includeLowers !== !1, h = n && n.includeUppers === !0;
    function f(A, S) {
      for (var I = 0, C = A.length; I < C; ++I) {
        var P = A[I];
        if (i(S[0], P[1]) < 0 && i(S[1], P[0]) > 0) {
          P[0] = u(P[0], S[0]), P[1] = c(P[1], S[1]);
          break;
        }
      }
      return I === C && A.push(S), A;
    }
    var p = o;
    function m(A, S) {
      return p(A[0], S[0]);
    }
    var g;
    try {
      g = t.reduce(f, []), g.sort(m);
    } catch {
      return nt(this, kt);
    }
    var y = 0, v = h ? function(A) {
      return o(A, g[y][1]) > 0;
    } : function(A) {
      return o(A, g[y][1]) >= 0;
    }, b = d ? function(A) {
      return s(A, g[y][0]) > 0;
    } : function(A) {
      return s(A, g[y][0]) >= 0;
    };
    function _(A) {
      return !v(A) && !b(A);
    }
    var w = v, E = new this.Collection(this, function() {
      return Wt(g[0][0], g[g.length - 1][1], !d, !h);
    });
    return E._ondirectionchange = function(A) {
      A === "next" ? (w = v, p = o) : (w = b, p = s), g.sort(m);
    }, E._addAlgorithm(function(A, S, I) {
      for (var C = A.key; w(C); )
        if (++y, y === g.length)
          return S(I), !1;
      return _(C) ? !0 : (r._cmp(C, g[y][1]) === 0 || r._cmp(C, g[y][0]) === 0 || S(function() {
        p === o ? A.continue(g[y][0]) : A.continue(g[y][1]);
      }), !1);
    }), E;
  }, e.prototype.startsWithAnyOf = function() {
    var t = $t.apply(Jn, arguments);
    return t.every(function(n) {
      return typeof n == "string";
    }) ? t.length === 0 ? On(this) : this.inAnyRange(t.map(function(n) {
      return [n, n + Sn];
    })) : nt(this, "startsWithAnyOf() only works with strings");
  }, e;
})();
function tR(e) {
  return Ii(Ry.prototype, function(n, r, i) {
    if (this.db = e, this._ctx = {
      table: n,
      index: r === ":id" ? null : r,
      or: i
    }, this._cmp = this._ascending = de, this._descending = function(o, s) {
      return de(s, o);
    }, this._max = function(o, s) {
      return de(o, s) > 0 ? o : s;
    }, this._min = function(o, s) {
      return de(o, s) < 0 ? o : s;
    }, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new ee.MissingAPI();
  });
}
function At(e) {
  return be(function(t) {
    return hi(t), e(t.target.error), !1;
  });
}
function hi(e) {
  e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
}
var Ri = "storagemutated", Dl = "x-storagemutated-1", rn = xi(null, Ri), nR = (function() {
  function e() {
  }
  return e.prototype._lock = function() {
    return Qr(!Z.global), ++this._reculock, this._reculock === 1 && !Z.global && (Z.lockOwnerFor = this), this;
  }, e.prototype._unlock = function() {
    if (Qr(!Z.global), --this._reculock === 0)
      for (Z.global || (Z.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
        var t = this._blockedFuncs.shift();
        try {
          Pn(t[1], t[0]);
        } catch {
        }
      }
    return this;
  }, e.prototype._locked = function() {
    return this._reculock && Z.lockOwnerFor !== this;
  }, e.prototype.create = function(t) {
    var n = this;
    if (!this.mode) return this;
    var r = this.db.idbdb, i = this.db._state.dbOpenError;
    if (Qr(!this.idbtrans), !t && !r) switch (i && i.name) {
      case "DatabaseClosedError":
        throw new ee.DatabaseClosed(i);
      case "MissingAPIError":
        throw new ee.MissingAPI(i.message, i);
      default:
        throw new ee.OpenFailed(i);
    }
    if (!this.active) throw new ee.TransactionInactive();
    return Qr(this._completion._state === null), t = this.idbtrans = t || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : r.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), t.onerror = be(function(o) {
      hi(o), n._reject(t.error);
    }), t.onabort = be(function(o) {
      hi(o), n.active && n._reject(new ee.Abort(t.error)), n.active = !1, n.on("abort").fire(o);
    }), t.oncomplete = be(function() {
      n.active = !1, n._resolve(), "mutatedParts" in t && rn.storagemutated.fire(t.mutatedParts);
    }), this;
  }, e.prototype._promise = function(t, n, r) {
    var i = this;
    if (t === "readwrite" && this.mode !== "readwrite") return xe(new ee.ReadOnly("Transaction is readonly"));
    if (!this.active) return xe(new ee.TransactionInactive());
    if (this._locked()) return new K(function(s, u) {
      i._blockedFuncs.push([function() {
        i._promise(t, n, r).then(s, u);
      }, Z]);
    });
    if (r) return en(function() {
      var s = new K(function(u, c) {
        i._lock();
        var d = n(u, c, i);
        d && d.then && d.then(u, c);
      });
      return s.finally(function() {
        return i._unlock();
      }), s._lib = !0, s;
    });
    var o = new K(function(s, u) {
      var c = n(s, u, i);
      c && c.then && c.then(s, u);
    });
    return o._lib = !0, o;
  }, e.prototype._root = function() {
    return this.parent ? this.parent._root() : this;
  }, e.prototype.waitFor = function(t) {
    var n = this._root(), r = K.resolve(t);
    if (n._waitingFor) n._waitingFor = n._waitingFor.then(function() {
      return r;
    });
    else {
      n._waitingFor = r, n._waitingQueue = [];
      var i = n.idbtrans.objectStore(n.storeNames[0]);
      (function s() {
        for (++n._spinCount; n._waitingQueue.length; ) n._waitingQueue.shift()();
        n._waitingFor && (i.get(-1 / 0).onsuccess = s);
      })();
    }
    var o = n._waitingFor;
    return new K(function(s, u) {
      r.then(function(c) {
        return n._waitingQueue.push(be(s.bind(null, c)));
      }, function(c) {
        return n._waitingQueue.push(be(u.bind(null, c)));
      }).finally(function() {
        n._waitingFor === o && (n._waitingFor = null);
      });
    });
  }, e.prototype.abort = function() {
    this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new ee.Abort()));
  }, e.prototype.table = function(t) {
    var n = this._memoizedTables || (this._memoizedTables = {});
    if (Ye(n, t)) return n[t];
    var r = this.schema[t];
    if (!r) throw new ee.NotFound("Table " + t + " not part of transaction");
    var i = new this.db.Table(t, r, this);
    return i.core = this.db.core.table(t), n[t] = i, i;
  }, e;
})();
function rR(e) {
  return Ii(nR.prototype, function(n, r, i, o, s) {
    var u = this;
    this.db = e, this.mode = n, this.storeNames = r, this.schema = i, this.chromeTransactionDurability = o, this.idbtrans = null, this.on = xi(this, "complete", "error", "abort"), this.parent = s || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new K(function(c, d) {
      u._resolve = c, u._reject = d;
    }), this._completion.then(function() {
      u.active = !1, u.on.complete.fire();
    }, function(c) {
      var d = u.active;
      return u.active = !1, u.on.error.fire(c), u.parent ? u.parent._reject(c) : d && u.idbtrans && u.idbtrans.abort(), xe(c);
    });
  });
}
function Ll(e, t, n, r, i, o, s) {
  return {
    name: e,
    keyPath: t,
    unique: n,
    multi: r,
    auto: i,
    compound: o,
    src: (n && !s ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + Py(t)
  };
}
function Py(e) {
  return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
}
function $u(e, t, n) {
  return {
    name: e,
    primKey: t,
    indexes: n,
    mappedClass: null,
    idxByName: pI(n, function(r) {
      return [r.name, r];
    })
  };
}
function iR(e) {
  return e.length === 1 ? e[0] : e;
}
var pi = function(e) {
  try {
    return e.only([[]]), pi = function() {
      return [[]];
    }, [[]];
  } catch {
    return pi = function() {
      return Sn;
    }, Sn;
  }
};
function $l(e) {
  return e == null ? function() {
  } : typeof e == "string" ? oR(e) : function(t) {
    return Ut(t, e);
  };
}
function oR(e) {
  return e.split(".").length === 1 ? function(t) {
    return t[e];
  } : function(t) {
    return Ut(t, e);
  };
}
function yh(e) {
  return [].slice.call(e);
}
var sR = 0;
function oi(e) {
  return e == null ? ":id" : typeof e == "string" ? e : "[".concat(e.join("+"), "]");
}
function aR(e, t, n) {
  function r(f, p) {
    var m = yh(f.objectStoreNames);
    return {
      schema: {
        name: f.name,
        tables: m.map(function(g) {
          return p.objectStore(g);
        }).map(function(g) {
          var y = g.keyPath, v = g.autoIncrement, b = Se(y), _ = y == null, w = {}, E = {
            name: g.name,
            primaryKey: {
              name: null,
              isPrimaryKey: !0,
              outbound: _,
              compound: b,
              keyPath: y,
              autoIncrement: v,
              unique: !0,
              extractKey: $l(y)
            },
            indexes: yh(g.indexNames).map(function(A) {
              return g.index(A);
            }).map(function(A) {
              var S = A.name, I = A.unique, C = A.multiEntry, P = A.keyPath, T = {
                name: S,
                compound: Se(P),
                keyPath: P,
                unique: I,
                multiEntry: C,
                extractKey: $l(P)
              };
              return w[oi(P)] = T, T;
            }),
            getIndexByKeyPath: function(A) {
              return w[oi(A)];
            }
          };
          return w[":id"] = E.primaryKey, y != null && (w[oi(y)] = E.primaryKey), E;
        })
      },
      hasGetAll: m.length > 0 && "getAll" in p.objectStore(m[0]) && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
    };
  }
  function i(f) {
    if (f.type === 3) return null;
    if (f.type === 4) throw new Error("Cannot convert never type to IDBKeyRange");
    var p = f.lower, m = f.upper, g = f.lowerOpen, y = f.upperOpen;
    return p === void 0 ? m === void 0 ? null : t.upperBound(m, !!y) : m === void 0 ? t.lowerBound(p, !!g) : t.bound(p, m, !!g, !!y);
  }
  function o(f) {
    var p = f.name;
    function m(v) {
      var b = v.trans, _ = v.type, w = v.keys, E = v.values, A = v.range;
      return new Promise(function(S, I) {
        S = be(S);
        var C = b.objectStore(p), P = C.keyPath == null, T = _ === "put" || _ === "add";
        if (!T && _ !== "delete" && _ !== "deleteRange") throw new Error("Invalid operation type: " + _);
        var k = (w || E || { length: 1 }).length;
        if (w && E && w.length !== E.length) throw new Error("Given keys array must have same length as given values array.");
        if (k === 0) return S({
          numFailures: 0,
          failures: {},
          results: [],
          lastResult: void 0
        });
        var F, B = [], W = [], O = 0, le = function(fe) {
          ++O, hi(fe);
        };
        if (_ === "deleteRange") {
          if (A.type === 4) return S({
            numFailures: O,
            failures: W,
            results: [],
            lastResult: void 0
          });
          A.type === 3 ? B.push(F = C.clear()) : B.push(F = C.delete(i(A)));
        } else {
          var ue = T ? P ? [E, w] : [E, null] : [w, null], D = ue[0], q = ue[1];
          if (T) for (var X = 0; X < k; ++X)
            B.push(F = q && q[X] !== void 0 ? C[_](D[X], q[X]) : C[_](D[X])), F.onerror = le;
          else for (var X = 0; X < k; ++X)
            B.push(F = C[_](D[X])), F.onerror = le;
        }
        var me = function(fe) {
          var he = fe.target.result;
          B.forEach(function(Ae, at) {
            return Ae.error != null && (W[at] = Ae.error);
          }), S({
            numFailures: O,
            failures: W,
            results: _ === "delete" ? w : B.map(function(Ae) {
              return Ae.result;
            }),
            lastResult: he
          });
        };
        F.onerror = function(fe) {
          le(fe), me(fe);
        }, F.onsuccess = me;
      });
    }
    function g(v) {
      var b = v.trans, _ = v.values, w = v.query, E = v.reverse, A = v.unique;
      return new Promise(function(S, I) {
        S = be(S);
        var C = w.index, P = w.range, T = b.objectStore(p), k = C.isPrimaryKey ? T : T.index(C.name), F = E ? A ? "prevunique" : "prev" : A ? "nextunique" : "next", B = _ || !("openKeyCursor" in k) ? k.openCursor(i(P), F) : k.openKeyCursor(i(P), F);
        B.onerror = At(I), B.onsuccess = be(function(W) {
          var O = B.result;
          if (!O) {
            S(null);
            return;
          }
          O.___id = ++sR, O.done = !1;
          var le = O.continue.bind(O), ue = O.continuePrimaryKey;
          ue && (ue = ue.bind(O));
          var D = O.advance.bind(O), q = function() {
            throw new Error("Cursor not started");
          }, X = function() {
            throw new Error("Cursor not stopped");
          };
          O.trans = b, O.stop = O.continue = O.continuePrimaryKey = O.advance = q, O.fail = be(I), O.next = function() {
            var me = this, fe = 1;
            return this.start(function() {
              return fe-- ? me.continue() : me.stop();
            }).then(function() {
              return me;
            });
          }, O.start = function(me) {
            var fe = new Promise(function(Ae, at) {
              Ae = be(Ae), B.onerror = At(at), O.fail = at, O.stop = function(sn) {
                O.stop = O.continue = O.continuePrimaryKey = O.advance = X, Ae(sn);
              };
            }), he = function() {
              if (B.result) try {
                me();
              } catch (Ae) {
                O.fail(Ae);
              }
              else
                O.done = !0, O.start = function() {
                  throw new Error("Cursor behind last entry");
                }, O.stop();
            };
            return B.onsuccess = be(function(Ae) {
              B.onsuccess = he, he();
            }), O.continue = le, O.continuePrimaryKey = ue, O.advance = D, he(), fe;
          }, S(O);
        }, I);
      });
    }
    function y(v) {
      return function(b) {
        return new Promise(function(_, w) {
          _ = be(_);
          var E = b.trans, A = b.values, S = b.limit, I = b.query, C = S === 1 / 0 ? void 0 : S, P = I.index, T = I.range, k = E.objectStore(p), F = P.isPrimaryKey ? k : k.index(P.name), B = i(T);
          if (S === 0) return _({ result: [] });
          if (v) {
            var W = A ? F.getAll(B, C) : F.getAllKeys(B, C);
            W.onsuccess = function(D) {
              return _({ result: D.target.result });
            }, W.onerror = At(w);
          } else {
            var O = 0, le = A || !("openKeyCursor" in F) ? F.openCursor(B) : F.openKeyCursor(B), ue = [];
            le.onsuccess = function(D) {
              var q = le.result;
              if (!q) return _({ result: ue });
              if (ue.push(A ? q.value : q.primaryKey), ++O === S) return _({ result: ue });
              q.continue();
            }, le.onerror = At(w);
          }
        });
      };
    }
    return {
      name: p,
      schema: f,
      mutate: m,
      getMany: function(v) {
        var b = v.trans, _ = v.keys;
        return new Promise(function(w, E) {
          w = be(w);
          for (var A = b.objectStore(p), S = _.length, I = new Array(S), C = 0, P = 0, T, k = function(W) {
            var O = W.target;
            (I[O._pos] = O.result) != null, ++P === C && w(I);
          }, F = At(E), B = 0; B < S; ++B) _[B] != null && (T = A.get(_[B]), T._pos = B, T.onsuccess = k, T.onerror = F, ++C);
          C === 0 && w(I);
        });
      },
      get: function(v) {
        var b = v.trans, _ = v.key;
        return new Promise(function(w, E) {
          w = be(w);
          var A = b.objectStore(p).get(_);
          A.onsuccess = function(S) {
            return w(S.target.result);
          }, A.onerror = At(E);
        });
      },
      query: y(c),
      openCursor: g,
      count: function(v) {
        var b = v.query, _ = v.trans, w = b.index, E = b.range;
        return new Promise(function(A, S) {
          var I = _.objectStore(p), C = w.isPrimaryKey ? I : I.index(w.name), P = i(E), T = P ? C.count(P) : C.count();
          T.onsuccess = be(function(k) {
            return A(k.target.result);
          }), T.onerror = At(S);
        });
      }
    };
  }
  var s = r(e, n), u = s.schema, c = s.hasGetAll, d = u.tables.map(function(f) {
    return o(f);
  }), h = {};
  return d.forEach(function(f) {
    return h[f.name] = f;
  }), {
    stack: "dbcore",
    transaction: e.transaction.bind(e),
    table: function(f) {
      if (!h[f]) throw new Error("Table '".concat(f, "' not found"));
      return h[f];
    },
    MIN_KEY: -1 / 0,
    MAX_KEY: pi(t),
    schema: u
  };
}
function lR(e, t) {
  return t.reduce(function(n, r) {
    var i = r.create;
    return se(se({}, n), i(n));
  }, e);
}
function uR(e, t, n, r) {
  var i = n.IDBKeyRange;
  return n.indexedDB, { dbcore: lR(aR(t, i, r), e.dbcore) };
}
function is(e, t) {
  var n = t.db;
  e.core = uR(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(r) {
    var i = r.name;
    e.core.schema.tables.some(function(o) {
      return o.name === i;
    }) && (r.core = e.core.table(i), e[i] instanceof e.Table && (e[i].core = r.core));
  });
}
function os(e, t, n, r) {
  n.forEach(function(i) {
    var o = r[i];
    t.forEach(function(s) {
      var u = cy(s, i);
      (!u || "value" in u && u.value === void 0) && (s === e.Transaction.prototype || s instanceof e.Transaction ? jt(s, i, {
        get: function() {
          return this.table(i);
        },
        set: function(c) {
          uy(this, i, {
            value: c,
            writable: !0,
            configurable: !0,
            enumerable: !0
          });
        }
      }) : s[i] = new e.Table(i, o));
    });
  });
}
function Ul(e, t) {
  t.forEach(function(n) {
    for (var r in n) n[r] instanceof e.Table && delete n[r];
  });
}
function cR(e, t) {
  return e._cfg.version - t._cfg.version;
}
function dR(e, t, n, r) {
  var i = e._dbSchema;
  n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = $u("$meta", Ny("")[0], []), e._storeNames.push("$meta"));
  var o = e._createTransaction("readwrite", e._storeNames, i);
  o.create(n), o._completion.catch(r);
  var s = o._reject.bind(o), u = Z.transless || Z;
  en(function() {
    if (Z.trans = o, Z.transless = u, t === 0)
      Ue(i).forEach(function(c) {
        Fu(n, c, i[c].primKey, i[c].indexes);
      }), is(e, n), K.follow(function() {
        return e.on.populate.fire(o);
      }).catch(s);
    else
      return is(e, n), hR(e, o, t).then(function(c) {
        return pR(e, c, o, n);
      }).catch(s);
  });
}
function fR(e, t) {
  My(e._dbSchema, t), t.db.version % 10 === 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
  var n = ks(e, e.idbdb, t);
  as(e, e._dbSchema, t);
  for (var r = Uu(n, e._dbSchema), i = function(d) {
    if (d.change.length || d.recreate)
      return console.warn("Unable to patch indexes of table ".concat(d.name, " because it has changes on the type of index or primary key.")), { value: void 0 };
    var h = t.objectStore(d.name);
    d.add.forEach(function(f) {
      xt && console.debug("Dexie upgrade patch: Creating missing index ".concat(d.name, ".").concat(f.src)), ss(h, f);
    });
  }, o = 0, s = r.change; o < s.length; o++) {
    var u = s[o], c = i(u);
    if (typeof c == "object") return c.value;
  }
}
function hR(e, t, n) {
  return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(r) {
    return r ?? n;
  }) : K.resolve(n);
}
function pR(e, t, n, r) {
  var i = [], o = e._versions, s = e._dbSchema = ks(e, e.idbdb, r), u = o.filter(function(d) {
    return d._cfg.version >= t;
  });
  if (u.length === 0) return K.resolve();
  u.forEach(function(d) {
    i.push(function() {
      var h = s, f = d._cfg.dbschema;
      as(e, h, r), as(e, f, r), s = e._dbSchema = f;
      var p = Uu(h, f);
      p.add.forEach(function(_) {
        Fu(r, _[0], _[1].primKey, _[1].indexes);
      }), p.change.forEach(function(_) {
        if (_.recreate) throw new ee.Upgrade("Not yet support for changing primary key");
        var w = r.objectStore(_.name);
        _.add.forEach(function(E) {
          return ss(w, E);
        }), _.change.forEach(function(E) {
          w.deleteIndex(E.name), ss(w, E);
        }), _.del.forEach(function(E) {
          return w.deleteIndex(E);
        });
      });
      var m = d._cfg.contentUpgrade;
      if (m && d._cfg.version > t) {
        is(e, r), n._memoizedTables = {};
        var g = hy(f);
        p.del.forEach(function(_) {
          g[_] = h[_];
        }), Ul(e, [e.Transaction.prototype]), os(e, [e.Transaction.prototype], Ue(g), g), n.schema = g;
        var y = Iu(m);
        y && pr();
        var v, b = K.follow(function() {
          if (v = m(n), v && y) {
            var _ = tn.bind(null, null);
            v.then(_, _);
          }
        });
        return v && typeof v.then == "function" ? K.resolve(v) : b.then(function() {
          return v;
        });
      }
    }), i.push(function(h) {
      var f = d._cfg.dbschema;
      mR(f, h), Ul(e, [e.Transaction.prototype]), os(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
    }), i.push(function(h) {
      e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === d._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(f) {
        return f !== "$meta";
      })) : h.objectStore("$meta").put(d._cfg.version, "version"));
    });
  });
  function c() {
    return i.length ? K.resolve(i.shift()(n.idbtrans)).then(c) : K.resolve();
  }
  return c().then(function() {
    My(s, r);
  });
}
function Uu(e, t) {
  var n = {
    del: [],
    add: [],
    change: []
  }, r;
  for (r in e) t[r] || n.del.push(r);
  for (r in t) {
    var i = e[r], o = t[r];
    if (!i) n.add.push([r, o]);
    else {
      var s = {
        name: r,
        def: o,
        recreate: !1,
        del: [],
        add: [],
        change: []
      };
      if ("" + (i.primKey.keyPath || "") != "" + (o.primKey.keyPath || "") || i.primKey.auto !== o.primKey.auto)
        s.recreate = !0, n.change.push(s);
      else {
        var u = i.idxByName, c = o.idxByName, d = void 0;
        for (d in u) c[d] || s.del.push(d);
        for (d in c) {
          var h = u[d], f = c[d];
          h ? h.src !== f.src && s.change.push(f) : s.add.push(f);
        }
        (s.del.length > 0 || s.add.length > 0 || s.change.length > 0) && n.change.push(s);
      }
    }
  }
  return n;
}
function Fu(e, t, n, r) {
  var i = e.db.createObjectStore(t, n.keyPath ? {
    keyPath: n.keyPath,
    autoIncrement: n.auto
  } : { autoIncrement: n.auto });
  return r.forEach(function(o) {
    return ss(i, o);
  }), i;
}
function My(e, t) {
  Ue(e).forEach(function(n) {
    t.db.objectStoreNames.contains(n) || (xt && console.debug("Dexie: Creating missing table", n), Fu(t, n, e[n].primKey, e[n].indexes));
  });
}
function mR(e, t) {
  [].slice.call(t.db.objectStoreNames).forEach(function(n) {
    return e[n] == null && t.db.deleteObjectStore(n);
  });
}
function ss(e, t) {
  e.createIndex(t.name, t.keyPath, {
    unique: t.unique,
    multiEntry: t.multi
  });
}
function ks(e, t, n) {
  var r = {};
  return Ps(t.objectStoreNames, 0).forEach(function(i) {
    for (var o = n.objectStore(i), s = o.keyPath, u = Ll(Py(s), s || "", !0, !1, !!o.autoIncrement, s && typeof s != "string", !0), c = [], d = 0; d < o.indexNames.length; ++d) {
      var h = o.index(o.indexNames[d]);
      s = h.keyPath;
      var f = Ll(h.name, s, !!h.unique, !!h.multiEntry, !1, s && typeof s != "string", !1);
      c.push(f);
    }
    r[i] = $u(i, u, c);
  }), r;
}
function gR(e, t, n) {
  e.verno = t.version / 10;
  var r = e._dbSchema = ks(e, t, n);
  e._storeNames = Ps(t.objectStoreNames, 0), os(e, [e._allTables], Ue(r), r);
}
function yR(e, t) {
  var n = Uu(ks(e, e.idbdb, t), e._dbSchema);
  return !(n.add.length || n.change.some(function(r) {
    return r.add.length || r.change.length;
  }));
}
function as(e, t, n) {
  for (var r = n.db.objectStoreNames, i = 0; i < r.length; ++i) {
    var o = r[i], s = n.objectStore(o);
    e._hasGetAll = "getAll" in s;
    for (var u = 0; u < s.indexNames.length; ++u) {
      var c = s.indexNames[u], d = s.index(c).keyPath, h = typeof d == "string" ? d : "[" + Ps(d).join("+") + "]";
      if (t[o]) {
        var f = t[o].idxByName[h];
        f && (f.name = c, delete t[o].idxByName[h], t[o].idxByName[c] = f);
      }
    }
  }
  typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && Oe.WorkerGlobalScope && Oe instanceof Oe.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (e._hasGetAll = !1);
}
function Ny(e) {
  return e.split(",").map(function(t, n) {
    t = t.trim();
    var r = t.replace(/([&*]|\+\+)/g, ""), i = /^\[/.test(r) ? r.match(/^\[(.*)\]$/)[1].split("+") : r;
    return Ll(r, i || null, /\&/.test(t), /\*/.test(t), /\+\+/.test(t), Se(i), n === 0);
  });
}
var vR = (function() {
  function e() {
  }
  return e.prototype._parseStoresSpec = function(t, n) {
    Ue(t).forEach(function(r) {
      if (t[r] !== null) {
        var i = Ny(t[r]), o = i.shift();
        if (o.unique = !0, o.multi) throw new ee.Schema("Primary key cannot be multi-valued");
        i.forEach(function(s) {
          if (s.auto) throw new ee.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!s.keyPath) throw new ee.Schema("Index must have a name and cannot be an empty string");
        }), n[r] = $u(r, o, i);
      }
    });
  }, e.prototype.stores = function(t) {
    var n = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? ot(this._cfg.storesSource, t) : t;
    var r = n._versions, i = {}, o = {};
    return r.forEach(function(s) {
      ot(i, s._cfg.storesSource), o = s._cfg.dbschema = {}, s._parseStoresSpec(i, o);
    }), n._dbSchema = o, Ul(n, [
      n._allTables,
      n,
      n.Transaction.prototype
    ]), os(n, [
      n._allTables,
      n,
      n.Transaction.prototype,
      this._cfg.tables
    ], Ue(o), o), n._storeNames = Ue(o), this;
  }, e.prototype.upgrade = function(t) {
    return this._cfg.contentUpgrade = Mu(this._cfg.contentUpgrade || ve, t), this;
  }, e;
})();
function _R(e) {
  return Ii(vR.prototype, function(n) {
    this.db = e, this._cfg = {
      version: n,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
  });
}
function Bu(e, t) {
  var n = e._dbNamesDB;
  return n || (n = e._dbNamesDB = new gi(Ns, {
    addons: [],
    indexedDB: e,
    IDBKeyRange: t
  }), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
}
function Ou(e) {
  return e && typeof e.databases == "function";
}
function bR(e) {
  var t = e.indexedDB, n = e.IDBKeyRange;
  return Ou(t) ? Promise.resolve(t.databases()).then(function(r) {
    return r.map(function(i) {
      return i.name;
    }).filter(function(i) {
      return i !== Ns;
    });
  }) : Bu(t, n).toCollection().primaryKeys();
}
function wR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Ou(n) && t !== Ns && Bu(n, r).put({ name: t }).catch(ve);
}
function SR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Ou(n) && t !== Ns && Bu(n, r).delete(t).catch(ve);
}
function Fl(e) {
  return en(function() {
    return Z.letThrough = !0, e();
  });
}
function ER() {
  if (!(!navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent)) || !indexedDB.databases) return Promise.resolve();
  var e;
  return new Promise(function(t) {
    var n = function() {
      return indexedDB.databases().finally(t);
    };
    e = setInterval(n, 100), n();
  }).finally(function() {
    return clearInterval(e);
  });
}
var Aa;
function Gu(e) {
  return !("from" in e);
}
var Ke = function(e, t) {
  if (this) ot(this, arguments.length ? {
    d: 1,
    from: e,
    to: arguments.length > 1 ? t : e
  } : { d: 0 });
  else {
    var n = new Ke();
    return e && "d" in e && ot(n, e), n;
  }
};
rr(Ke.prototype, (Aa = {
  add: function(e) {
    return ls(this, e), this;
  },
  addKey: function(e) {
    return mi(this, e, e), this;
  },
  addKeys: function(e) {
    var t = this;
    return e.forEach(function(n) {
      return mi(t, n, n);
    }), this;
  },
  hasKey: function(e) {
    var t = us(this).next(e).value;
    return t && de(t.from, e) <= 0 && de(t.to, e) >= 0;
  }
}, Aa[xl] = function() {
  return us(this);
}, Aa));
function mi(e, t, n) {
  var r = de(t, n);
  if (!isNaN(r)) {
    if (r > 0) throw RangeError();
    if (Gu(e)) return ot(e, {
      from: t,
      to: n,
      d: 1
    });
    var i = e.l, o = e.r;
    if (de(n, e.from) < 0)
      return i ? mi(i, t, n) : e.l = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, vh(e);
    if (de(t, e.to) > 0)
      return o ? mi(o, t, n) : e.r = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, vh(e);
    de(t, e.from) < 0 && (e.from = t, e.l = null, e.d = o ? o.d + 1 : 1), de(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
    var s = !e.r;
    i && !e.l && ls(e, i), o && s && ls(e, o);
  }
}
function ls(e, t) {
  function n(r, i) {
    var o = i.from, s = i.to, u = i.l, c = i.r;
    mi(r, o, s), u && n(r, u), c && n(r, c);
  }
  Gu(t) || n(e, t);
}
function TR(e, t) {
  var n = us(t), r = n.next();
  if (r.done) return !1;
  for (var i = r.value, o = us(e), s = o.next(i.from), u = s.value; !r.done && !s.done; ) {
    if (de(u.from, i.to) <= 0 && de(u.to, i.from) >= 0) return !0;
    de(i.from, u.from) < 0 ? i = (r = n.next(u.from)).value : u = (s = o.next(i.from)).value;
  }
  return !1;
}
function us(e) {
  var t = Gu(e) ? null : {
    s: 0,
    n: e
  };
  return { next: function(n) {
    for (var r = arguments.length > 0; t; ) switch (t.s) {
      case 0:
        if (t.s = 1, r) for (; t.n.l && de(n, t.n.from) < 0; ) t = {
          up: t,
          n: t.n.l,
          s: 1
        };
        else for (; t.n.l; ) t = {
          up: t,
          n: t.n.l,
          s: 1
        };
      case 1:
        if (t.s = 2, !r || de(n, t.n.to) <= 0) return {
          value: t.n,
          done: !1
        };
      case 2:
        if (t.n.r) {
          t.s = 3, t = {
            up: t,
            n: t.n.r,
            s: 0
          };
          continue;
        }
      case 3:
        t = t.up;
    }
    return { done: !0 };
  } };
}
function vh(e) {
  var t, n, r = (((t = e.r) === null || t === void 0 ? void 0 : t.d) || 0) - (((n = e.l) === null || n === void 0 ? void 0 : n.d) || 0), i = r > 1 ? "r" : r < -1 ? "l" : "";
  if (i) {
    var o = i === "r" ? "l" : "r", s = se({}, e), u = e[i];
    e.from = u.from, e.to = u.to, e[i] = u[i], s[i] = u[o], e[o] = s, s.d = _h(s);
  }
  e.d = _h(e);
}
function _h(e) {
  var t = e.r, n = e.l;
  return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
}
function Ds(e, t) {
  return Ue(t).forEach(function(n) {
    e[n] ? ls(e[n], t[n]) : e[n] = gy(t[n]);
  }), e;
}
function qu(e, t) {
  return e.all || t.all || Object.keys(e).some(function(n) {
    return t[n] && TR(t[n], e[n]);
  });
}
var Cn = {}, Ca = {}, xa = !1;
function uo(e, t) {
  Ds(Ca, e), xa || (xa = !0, setTimeout(function() {
    xa = !1;
    var n = Ca;
    Ca = {}, Vu(n, !1);
  }, 0));
}
function Vu(e, t) {
  t === void 0 && (t = !1);
  var n = /* @__PURE__ */ new Set();
  if (e.all) for (var r = 0, i = Object.values(Cn); r < i.length; r++) {
    var o = i[r];
    bh(o, e, n, t);
  }
  else for (var s in e) {
    var u = /^idb\:\/\/(.*)\/(.*)\//.exec(s);
    if (u) {
      var c = u[1], d = u[2], o = Cn["idb://".concat(c, "/").concat(d)];
      o && bh(o, e, n, t);
    }
  }
  n.forEach(function(h) {
    return h();
  });
}
function bh(e, t, n, r) {
  for (var i = [], o = 0, s = Object.entries(e.queries.query); o < s.length; o++) {
    for (var u = s[o], c = u[0], d = u[1], h = [], f = 0, p = d; f < p.length; f++) {
      var m = p[f];
      qu(t, m.obsSet) ? m.subscribers.forEach(function(b) {
        return n.add(b);
      }) : r && h.push(m);
    }
    r && i.push([c, h]);
  }
  if (r) for (var g = 0, y = i; g < y.length; g++) {
    var v = y[g], c = v[0], h = v[1];
    e.queries.query[c] = h;
  }
}
function AR(e) {
  var t = e._state, n = e._deps.indexedDB;
  if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
    return t.dbOpenError ? xe(t.dbOpenError) : e;
  });
  t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
  var r = t.openCanceller, i = Math.round(e.verno * 10), o = !1;
  function s() {
    if (t.openCanceller !== r) throw new ee.DatabaseClosed("db.open() was cancelled");
  }
  var u = t.dbReadyResolve, c = null, d = !1, h = function() {
    return new K(function(f, p) {
      if (s(), !n) throw new ee.MissingAPI();
      var m = e.name, g = t.autoSchema || !i ? n.open(m) : n.open(m, i);
      if (!g) throw new ee.MissingAPI();
      g.onerror = At(p), g.onblocked = be(e._fireOnBlocked), g.onupgradeneeded = be(function(y) {
        if (c = g.transaction, t.autoSchema && !e._options.allowEmptyDB) {
          g.onerror = hi, c.abort(), g.result.close();
          var v = n.deleteDatabase(m);
          v.onsuccess = v.onerror = be(function() {
            p(new ee.NoSuchDatabase("Database ".concat(m, " doesnt exist")));
          });
        } else {
          c.onerror = At(p);
          var b = y.oldVersion > Math.pow(2, 62) ? 0 : y.oldVersion;
          d = b < 1, e.idbdb = g.result, o && fR(e, c), dR(e, b / 10, c, p);
        }
      }, p), g.onsuccess = be(function() {
        c = null;
        var y = e.idbdb = g.result, v = Ps(y.objectStoreNames);
        if (v.length > 0) try {
          var b = y.transaction(iR(v), "readonly");
          if (t.autoSchema) gR(e, y, b);
          else if (as(e, e._dbSchema, b), !yR(e, b) && !o)
            return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), y.close(), i = y.version + 1, o = !0, f(h());
          is(e, b);
        } catch {
        }
        tr.push(e), y.onversionchange = be(function(_) {
          t.vcFired = !0, e.on("versionchange").fire(_);
        }), y.onclose = be(function(_) {
          e.on("close").fire(_);
        }), d && wR(e._deps, m), f();
      }, p);
    }).catch(function(f) {
      switch (f?.name) {
        case "UnknownError":
          if (t.PR1398_maxLoop > 0)
            return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), h();
          break;
        case "VersionError":
          if (i > 0)
            return i = 0, h();
          break;
      }
      return K.reject(f);
    });
  };
  return K.race([r, (typeof navigator > "u" ? K.resolve() : ER()).then(h)]).then(function() {
    return s(), t.onReadyBeingFired = [], K.resolve(Fl(function() {
      return e.on.ready.fire(e.vip);
    })).then(function f() {
      if (t.onReadyBeingFired.length > 0) {
        var p = t.onReadyBeingFired.reduce(Mu, ve);
        return t.onReadyBeingFired = [], K.resolve(Fl(function() {
          return p(e.vip);
        })).then(f);
      }
    });
  }).finally(function() {
    t.openCanceller === r && (t.onReadyBeingFired = null, t.isBeingOpened = !1);
  }).catch(function(f) {
    t.dbOpenError = f;
    try {
      c && c.abort();
    } catch {
    }
    return r === t.openCanceller && e._close(), xe(f);
  }).finally(function() {
    t.openComplete = !0, u();
  }).then(function() {
    if (d) {
      var f = {};
      e.tables.forEach(function(p) {
        p.schema.indexes.forEach(function(m) {
          m.name && (f["idb://".concat(e.name, "/").concat(p.name, "/").concat(m.name)] = new Ke(-1 / 0, [[[]]]));
        }), f["idb://".concat(e.name, "/").concat(p.name, "/")] = f["idb://".concat(e.name, "/").concat(p.name, "/:dels")] = new Ke(-1 / 0, [[[]]]);
      }), rn(Ri).fire(f), Vu(f, !0);
    }
    return e;
  });
}
function Bl(e) {
  var t = function(s) {
    return e.next(s);
  }, n = function(s) {
    return e.throw(s);
  }, r = o(t), i = o(n);
  function o(s) {
    return function(u) {
      var c = s(u), d = c.value;
      return c.done ? d : !d || typeof d.then != "function" ? Se(d) ? Promise.all(d).then(r, i) : r(d) : d.then(r, i);
    };
  }
  return o(t)();
}
function CR(e, t, n) {
  var r = arguments.length;
  if (r < 2) throw new ee.InvalidArgument("Too few arguments");
  for (var i = new Array(r - 1); --r; ) i[r - 1] = arguments[r];
  return n = i.pop(), [
    e,
    py(i),
    n
  ];
}
function ky(e, t, n, r, i) {
  return K.resolve().then(function() {
    var o = Z.transless || Z, s = e._createTransaction(t, n, e._dbSchema, r);
    s.explicit = !0;
    var u = {
      trans: s,
      transless: o
    };
    if (r) s.idbtrans = r.idbtrans;
    else try {
      s.create(), s.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
    } catch (f) {
      return f.name === Pu.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return ky(e, t, n, null, i);
      })) : xe(f);
    }
    var c = Iu(i);
    c && pr();
    var d, h = K.follow(function() {
      if (d = i.call(s, s), d)
        if (c) {
          var f = tn.bind(null, null);
          d.then(f, f);
        } else typeof d.next == "function" && typeof d.throw == "function" && (d = Bl(d));
    }, u);
    return (d && typeof d.then == "function" ? K.resolve(d).then(function(f) {
      return s.active ? f : xe(new ee.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
    }) : h.then(function() {
      return d;
    })).then(function(f) {
      return r && s._resolve(), s._completion.then(function() {
        return f;
      });
    }).catch(function(f) {
      return s._reject(f), xe(f);
    });
  });
}
function co(e, t, n) {
  for (var r = Se(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
  return r;
}
function xR(e) {
  return se(se({}, e), { table: function(t) {
    var n = e.table(t), r = n.schema, i = {}, o = [];
    function s(g, y, v) {
      var b = oi(g), _ = i[b] = i[b] || [], w = g == null ? 0 : typeof g == "string" ? 1 : g.length, E = y > 0, A = se(se({}, v), {
        name: E ? "".concat(b, "(virtual-from:").concat(v.name, ")") : v.name,
        lowLevelIndex: v,
        isVirtual: E,
        keyTail: y,
        keyLength: w,
        extractKey: $l(g),
        unique: !E && v.unique
      });
      return _.push(A), A.isPrimaryKey || o.push(A), w > 1 && s(w === 2 ? g[0] : g.slice(0, w - 1), y + 1, v), _.sort(function(S, I) {
        return S.keyTail - I.keyTail;
      }), A;
    }
    var u = s(r.primaryKey.keyPath, 0, r.primaryKey);
    i[":id"] = [u];
    for (var c = 0, d = r.indexes; c < d.length; c++) {
      var h = d[c];
      s(h.keyPath, 0, h);
    }
    function f(g) {
      var y = i[oi(g)];
      return y && y[0];
    }
    function p(g, y) {
      return {
        type: g.type === 1 ? 2 : g.type,
        lower: co(g.lower, g.lowerOpen ? e.MAX_KEY : e.MIN_KEY, y),
        lowerOpen: !0,
        upper: co(g.upper, g.upperOpen ? e.MIN_KEY : e.MAX_KEY, y),
        upperOpen: !0
      };
    }
    function m(g) {
      var y = g.query.index;
      return y.isVirtual ? se(se({}, g), { query: {
        index: y.lowLevelIndex,
        range: p(g.query.range, y.keyTail)
      } }) : g;
    }
    return se(se({}, n), {
      schema: se(se({}, r), {
        primaryKey: u,
        indexes: o,
        getIndexByKeyPath: f
      }),
      count: function(g) {
        return n.count(m(g));
      },
      query: function(g) {
        return n.query(m(g));
      },
      openCursor: function(g) {
        var y = g.query.index, v = y.keyTail, b = y.isVirtual, _ = y.keyLength;
        if (!b) return n.openCursor(g);
        function w(E) {
          function A(S) {
            S != null ? E.continue(co(S, g.reverse ? e.MAX_KEY : e.MIN_KEY, v)) : g.unique ? E.continue(E.key.slice(0, _).concat(g.reverse ? e.MIN_KEY : e.MAX_KEY, v)) : E.continue();
          }
          return Object.create(E, {
            continue: { value: A },
            continuePrimaryKey: { value: function(S, I) {
              E.continuePrimaryKey(co(S, e.MAX_KEY, v), I);
            } },
            primaryKey: { get: function() {
              return E.primaryKey;
            } },
            key: { get: function() {
              var S = E.key;
              return _ === 1 ? S[0] : S.slice(0, _);
            } },
            value: { get: function() {
              return E.value;
            } }
          });
        }
        return n.openCursor(m(g)).then(function(E) {
          return E && w(E);
        });
      }
    });
  } });
}
var IR = {
  stack: "dbcore",
  name: "VirtualIndexMiddleware",
  level: 1,
  create: xR
};
function Hu(e, t, n, r) {
  return n = n || {}, r = r || "", Ue(e).forEach(function(i) {
    if (!Ye(t, i)) n[r + i] = void 0;
    else {
      var o = e[i], s = t[i];
      if (typeof o == "object" && typeof s == "object" && o && s) {
        var u = Cl(o);
        u !== Cl(s) ? n[r + i] = t[i] : u === "Object" ? Hu(o, s, n, r + i + ".") : o !== s && (n[r + i] = t[i]);
      } else o !== s && (n[r + i] = t[i]);
    }
  }), Ue(t).forEach(function(i) {
    Ye(e, i) || (n[r + i] = t[i]);
  }), n;
}
function Ku(e, t) {
  return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
}
var RR = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: function(e) {
    return se(se({}, e), { table: function(t) {
      var n = e.table(t), r = n.schema.primaryKey;
      return se(se({}, n), { mutate: function(i) {
        var o = Z.trans, s = o.table(t).hook, u = s.deleting, c = s.creating, d = s.updating;
        switch (i.type) {
          case "add":
            if (c.fire === ve) break;
            return o._promise("readwrite", function() {
              return h(i);
            }, !0);
          case "put":
            if (c.fire === ve && d.fire === ve) break;
            return o._promise("readwrite", function() {
              return h(i);
            }, !0);
          case "delete":
            if (u.fire === ve) break;
            return o._promise("readwrite", function() {
              return h(i);
            }, !0);
          case "deleteRange":
            if (u.fire === ve) break;
            return o._promise("readwrite", function() {
              return f(i);
            }, !0);
        }
        return n.mutate(i);
        function h(m) {
          var g = Z.trans, y = m.keys || Ku(r, m);
          if (!y) throw new Error("Keys missing");
          return m = m.type === "add" || m.type === "put" ? se(se({}, m), { keys: y }) : se({}, m), m.type !== "delete" && (m.values = jo([], m.values, !0)), m.keys && (m.keys = jo([], m.keys, !0)), PR(n, m, y).then(function(v) {
            var b = y.map(function(_, w) {
              var E = v[w], A = {
                onerror: null,
                onsuccess: null
              };
              if (m.type === "delete") u.fire.call(A, _, E, g);
              else if (m.type === "add" || E === void 0) {
                var S = c.fire.call(A, _, m.values[w], g);
                _ == null && S != null && (_ = S, m.keys[w] = _, r.outbound || it(m.values[w], r.keyPath, _));
              } else {
                var I = Hu(E, m.values[w]), C = d.fire.call(A, I, _, E, g);
                if (C) {
                  var P = m.values[w];
                  Object.keys(C).forEach(function(T) {
                    Ye(P, T) ? P[T] = C[T] : it(P, T, C[T]);
                  });
                }
              }
              return A;
            });
            return n.mutate(m).then(function(_) {
              for (var w = _.failures, E = _.results, A = _.numFailures, S = _.lastResult, I = 0; I < y.length; ++I) {
                var C = E ? E[I] : y[I], P = b[I];
                C == null ? P.onerror && P.onerror(w[I]) : P.onsuccess && P.onsuccess(m.type === "put" && v[I] ? m.values[I] : C);
              }
              return {
                failures: w,
                results: E,
                numFailures: A,
                lastResult: S
              };
            }).catch(function(_) {
              return b.forEach(function(w) {
                return w.onerror && w.onerror(_);
              }), Promise.reject(_);
            });
          });
        }
        function f(m) {
          return p(m.trans, m.range, 1e4);
        }
        function p(m, g, y) {
          return n.query({
            trans: m,
            values: !1,
            query: {
              index: r,
              range: g
            },
            limit: y
          }).then(function(v) {
            var b = v.result;
            return h({
              type: "delete",
              keys: b,
              trans: m
            }).then(function(_) {
              return _.numFailures > 0 ? Promise.reject(_.failures[0]) : b.length < y ? {
                failures: [],
                numFailures: 0,
                lastResult: void 0
              } : p(m, se(se({}, g), {
                lower: b[b.length - 1],
                lowerOpen: !0
              }), y);
            });
          });
        }
      } });
    } });
  }
};
function PR(e, t, n) {
  return t.type === "add" ? Promise.resolve([]) : e.getMany({
    trans: t.trans,
    keys: n,
    cache: "immutable"
  });
}
function Dy(e, t, n) {
  try {
    if (!t || t.keys.length < e.length) return null;
    for (var r = [], i = 0, o = 0; i < t.keys.length && o < e.length; ++i)
      de(t.keys[i], e[o]) === 0 && (r.push(n ? In(t.values[i]) : t.values[i]), ++o);
    return r.length === e.length ? r : null;
  } catch {
    return null;
  }
}
var MR = {
  stack: "dbcore",
  level: -1,
  create: function(e) {
    return { table: function(t) {
      var n = e.table(t);
      return se(se({}, n), {
        getMany: function(r) {
          if (!r.cache) return n.getMany(r);
          var i = Dy(r.keys, r.trans._cache, r.cache === "clone");
          return i ? K.resolve(i) : n.getMany(r).then(function(o) {
            return r.trans._cache = {
              keys: r.keys,
              values: r.cache === "clone" ? In(o) : o
            }, o;
          });
        },
        mutate: function(r) {
          return r.type !== "add" && (r.trans._cache = null), n.mutate(r);
        }
      });
    } };
  }
};
function Ly(e, t) {
  return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
}
function $y(e, t) {
  switch (e) {
    case "query":
      return t.values && !t.unique;
    case "get":
      return !1;
    case "getMany":
      return !1;
    case "count":
      return !1;
    case "openCursor":
      return !1;
  }
}
var NR = {
  stack: "dbcore",
  level: 0,
  name: "Observability",
  create: function(e) {
    var t = e.schema.name, n = new Ke(e.MIN_KEY, e.MAX_KEY);
    return se(se({}, e), {
      transaction: function(r, i, o) {
        if (Z.subscr && i !== "readonly") throw new ee.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(Z.querier));
        return e.transaction(r, i, o);
      },
      table: function(r) {
        var i = e.table(r), o = i.schema, s = o.primaryKey, u = o.indexes, c = s.extractKey, d = s.outbound, h = s.autoIncrement && u.filter(function(g) {
          return g.compound && g.keyPath.includes(s.keyPath);
        }), f = se(se({}, i), { mutate: function(g) {
          var y, v, b = g.trans, _ = g.mutatedParts || (g.mutatedParts = {}), w = function(B) {
            var W = "idb://".concat(t, "/").concat(r, "/").concat(B);
            return _[W] || (_[W] = new Ke());
          }, E = w(""), A = w(":dels"), S = g.type, I = g.type === "deleteRange" ? [g.range] : g.type === "delete" ? [g.keys] : g.values.length < 50 ? [Ku(s, g).filter(function(B) {
            return B;
          }), g.values] : [], C = I[0], P = I[1], T = g.trans._cache;
          if (Se(C)) {
            E.addKeys(C);
            var k = S === "delete" || C.length === P.length ? Dy(C, T) : null;
            k || A.addKeys(C), (k || P) && kR(w, o, k, P);
          } else if (C) {
            var F = {
              from: (y = C.lower) !== null && y !== void 0 ? y : e.MIN_KEY,
              to: (v = C.upper) !== null && v !== void 0 ? v : e.MAX_KEY
            };
            A.add(F), E.add(F);
          } else
            E.add(n), A.add(n), o.indexes.forEach(function(B) {
              return w(B.name).add(n);
            });
          return i.mutate(g).then(function(B) {
            return C && (g.type === "add" || g.type === "put") && (E.addKeys(B.results), h && h.forEach(function(W) {
              for (var O = g.values.map(function(q) {
                return W.extractKey(q);
              }), le = W.keyPath.findIndex(function(q) {
                return q === s.keyPath;
              }), ue = 0, D = B.results.length; ue < D; ++ue) O[ue][le] = B.results[ue];
              w(W.name).addKeys(O);
            })), b.mutatedParts = Ds(b.mutatedParts || {}, _), B;
          });
        } }), p = function(g) {
          var y, v, b = g.query, _ = b.index, w = b.range;
          return [_, new Ke((y = w.lower) !== null && y !== void 0 ? y : e.MIN_KEY, (v = w.upper) !== null && v !== void 0 ? v : e.MAX_KEY)];
        }, m = {
          get: function(g) {
            return [s, new Ke(g.key)];
          },
          getMany: function(g) {
            return [s, new Ke().addKeys(g.keys)];
          },
          count: p,
          query: p,
          openCursor: p
        };
        return Ue(m).forEach(function(g) {
          f[g] = function(y) {
            var v = Z.subscr, b = !!v, _ = Ly(Z, i) && $y(g, y) ? y.obsSet = {} : v;
            if (b) {
              var w = function(T) {
                var k = "idb://".concat(t, "/").concat(r, "/").concat(T);
                return _[k] || (_[k] = new Ke());
              }, E = w(""), A = w(":dels"), S = m[g](y), I = S[0], C = S[1];
              if (g === "query" && I.isPrimaryKey && !y.values ? A.add(C) : w(I.name || "").add(C), !I.isPrimaryKey) if (g === "count") A.add(n);
              else {
                var P = g === "query" && d && y.values && i.query(se(se({}, y), { values: !1 }));
                return i[g].apply(this, arguments).then(function(T) {
                  if (g === "query") {
                    if (d && y.values) return P.then(function(W) {
                      var O = W.result;
                      return E.addKeys(O), T;
                    });
                    var k = y.values ? T.result.map(c) : T.result;
                    y.values ? E.addKeys(k) : A.addKeys(k);
                  } else if (g === "openCursor") {
                    var F = T, B = y.values;
                    return F && Object.create(F, {
                      key: { get: function() {
                        return A.addKey(F.primaryKey), F.key;
                      } },
                      primaryKey: { get: function() {
                        var W = F.primaryKey;
                        return A.addKey(W), W;
                      } },
                      value: { get: function() {
                        return B && E.addKey(F.primaryKey), F.value;
                      } }
                    });
                  }
                  return T;
                });
              }
            }
            return i[g].apply(this, arguments);
          };
        }), f;
      }
    });
  }
};
function kR(e, t, n, r) {
  function i(o) {
    var s = e(o.name || "");
    function u(d) {
      return d != null ? o.extractKey(d) : null;
    }
    var c = function(d) {
      return o.multiEntry && Se(d) ? d.forEach(function(h) {
        return s.addKey(h);
      }) : s.addKey(d);
    };
    (n || r).forEach(function(d, h) {
      var f = n && u(n[h]), p = r && u(r[h]);
      de(f, p) !== 0 && (f != null && c(f), p != null && c(p));
    });
  }
  t.indexes.forEach(i);
}
function wh(e, t, n) {
  if (n.numFailures === 0) return t;
  if (t.type === "deleteRange") return null;
  var r = t.keys ? t.keys.length : "values" in t && t.values ? t.values.length : 1;
  if (n.numFailures === r) return null;
  var i = se({}, t);
  return Se(i.keys) && (i.keys = i.keys.filter(function(o, s) {
    return !(s in n.failures);
  })), "values" in i && Se(i.values) && (i.values = i.values.filter(function(o, s) {
    return !(s in n.failures);
  })), i;
}
function DR(e, t) {
  return t.lower === void 0 ? !0 : t.lowerOpen ? de(e, t.lower) > 0 : de(e, t.lower) >= 0;
}
function LR(e, t) {
  return t.upper === void 0 ? !0 : t.upperOpen ? de(e, t.upper) < 0 : de(e, t.upper) <= 0;
}
function Ia(e, t) {
  return DR(e, t) && LR(e, t);
}
function Sh(e, t, n, r, i, o) {
  if (!n || n.length === 0) return e;
  var s = t.query.index, u = s.multiEntry, c = t.query.range, d = r.schema.primaryKey.extractKey, h = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(m, g) {
    var y = m, v = [];
    if (g.type === "add" || g.type === "put")
      for (var b = new Ke(), _ = g.values.length - 1; _ >= 0; --_) {
        var w = g.values[_], E = d(w);
        if (!b.hasKey(E)) {
          var A = h(w);
          (u && Se(A) ? A.some(function(T) {
            return Ia(T, c);
          }) : Ia(A, c)) && (b.addKey(E), v.push(w));
        }
      }
    switch (g.type) {
      case "add":
        var S = new Ke().addKeys(t.values ? m.map(function(T) {
          return d(T);
        }) : m);
        y = m.concat(t.values ? v.filter(function(T) {
          var k = d(T);
          return S.hasKey(k) ? !1 : (S.addKey(k), !0);
        }) : v.map(function(T) {
          return d(T);
        }).filter(function(T) {
          return S.hasKey(T) ? !1 : (S.addKey(T), !0);
        }));
        break;
      case "put":
        var I = new Ke().addKeys(g.values.map(function(T) {
          return d(T);
        }));
        y = m.filter(function(T) {
          return !I.hasKey(t.values ? d(T) : T);
        }).concat(t.values ? v : v.map(function(T) {
          return d(T);
        }));
        break;
      case "delete":
        var C = new Ke().addKeys(g.keys);
        y = m.filter(function(T) {
          return !C.hasKey(t.values ? d(T) : T);
        });
        break;
      case "deleteRange":
        var P = g.range;
        y = m.filter(function(T) {
          return !Ia(d(T), P);
        });
        break;
    }
    return y;
  }, e);
  return p === e ? e : (p.sort(function(m, g) {
    return de(f(m), f(g)) || de(d(m), d(g));
  }), t.limit && t.limit < 1 / 0 && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), o ? Object.freeze(p) : p);
}
function Eh(e, t) {
  return de(e.lower, t.lower) === 0 && de(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
}
function $R(e, t, n, r) {
  if (e === void 0) return t !== void 0 ? -1 : 0;
  if (t === void 0) return 1;
  var i = de(e, t);
  if (i === 0) {
    if (n && r) return 0;
    if (n) return 1;
    if (r) return -1;
  }
  return i;
}
function UR(e, t, n, r) {
  if (e === void 0) return t !== void 0 ? 1 : 0;
  if (t === void 0) return -1;
  var i = de(e, t);
  if (i === 0) {
    if (n && r) return 0;
    if (n) return -1;
    if (r) return 1;
  }
  return i;
}
function FR(e, t) {
  return $R(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && UR(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
}
function BR(e, t, n, r) {
  var i = Cn["idb://".concat(e, "/").concat(t)];
  if (!i) return [];
  var o = i.queries[n];
  if (!o) return [
    null,
    !1,
    i,
    null
  ];
  var s = o[(r.query ? r.query.index.name : null) || ""];
  if (!s) return [
    null,
    !1,
    i,
    null
  ];
  switch (n) {
    case "query":
      var u = s.find(function(d) {
        return d.req.limit === r.limit && d.req.values === r.values && Eh(d.req.query.range, r.query.range);
      });
      return u ? [
        u,
        !0,
        i,
        s
      ] : [
        s.find(function(d) {
          return ("limit" in d.req ? d.req.limit : 1 / 0) >= r.limit && (r.values ? d.req.values : !0) && FR(d.req.query.range, r.query.range);
        }),
        !1,
        i,
        s
      ];
    case "count":
      var c = s.find(function(d) {
        return Eh(d.req.query.range, r.query.range);
      });
      return [
        c,
        !!c,
        i,
        s
      ];
  }
}
function OR(e, t, n, r) {
  e.subscribers.add(n), r.addEventListener("abort", function() {
    e.subscribers.delete(n), e.subscribers.size === 0 && GR(e, t);
  });
}
function GR(e, t) {
  setTimeout(function() {
    e.subscribers.size === 0 && mn(t, e);
  }, 3e3);
}
var qR = {
  stack: "dbcore",
  level: 0,
  name: "Cache",
  create: function(e) {
    var t = e.schema.name;
    return se(se({}, e), {
      transaction: function(n, r, i) {
        var o = e.transaction(n, r, i);
        if (r === "readwrite") {
          var s = new AbortController(), u = s.signal, c = function(d) {
            return function() {
              if (s.abort(), r === "readwrite") {
                for (var h = /* @__PURE__ */ new Set(), f = 0, p = n; f < p.length; f++) {
                  var m = p[f], g = Cn["idb://".concat(t, "/").concat(m)];
                  if (g) {
                    var y = e.table(m), v = g.optimisticOps.filter(function(B) {
                      return B.trans === o;
                    });
                    if (o._explicit && d && o.mutatedParts) for (var b = 0, _ = Object.values(g.queries.query); b < _.length; b++)
                      for (var w = _[b], E = 0, A = w.slice(); E < A.length; E++) {
                        var S = A[E];
                        qu(S.obsSet, o.mutatedParts) && (mn(w, S), S.subscribers.forEach(function(B) {
                          return h.add(B);
                        }));
                      }
                    else if (v.length > 0) {
                      g.optimisticOps = g.optimisticOps.filter(function(B) {
                        return B.trans !== o;
                      });
                      for (var I = 0, C = Object.values(g.queries.query); I < C.length; I++)
                        for (var w = C[I], P = 0, T = w.slice(); P < T.length; P++) {
                          var S = T[P];
                          if (S.res != null && o.mutatedParts) if (d && !S.dirty) {
                            var k = Object.isFrozen(S.res), F = Sh(S.res, S.req, v, y, S, k);
                            S.dirty ? (mn(w, S), S.subscribers.forEach(function(O) {
                              return h.add(O);
                            })) : F !== S.res && (S.res = F, S.promise = K.resolve({ result: F }));
                          } else
                            S.dirty && mn(w, S), S.subscribers.forEach(function(O) {
                              return h.add(O);
                            });
                        }
                    }
                  }
                }
                h.forEach(function(B) {
                  return B();
                });
              }
            };
          };
          o.addEventListener("abort", c(!1), { signal: u }), o.addEventListener("error", c(!1), { signal: u }), o.addEventListener("complete", c(!0), { signal: u });
        }
        return o;
      },
      table: function(n) {
        var r = e.table(n), i = r.schema.primaryKey;
        return se(se({}, r), {
          mutate: function(o) {
            var s = Z.trans;
            if (i.outbound || s.db._options.cache === "disabled" || s.explicit || s.idbtrans.mode !== "readwrite") return r.mutate(o);
            var u = Cn["idb://".concat(t, "/").concat(n)];
            if (!u) return r.mutate(o);
            var c = r.mutate(o);
            return (o.type === "add" || o.type === "put") && (o.values.length >= 50 || Ku(i, o).some(function(d) {
              return d == null;
            })) ? c.then(function(d) {
              var h = wh(u, se(se({}, o), { values: o.values.map(function(f, p) {
                var m;
                if (d.failures[p]) return f;
                var g = !((m = i.keyPath) === null || m === void 0) && m.includes(".") ? In(f) : se({}, f);
                return it(g, i.keyPath, d.results[p]), g;
              }) }), d);
              u.optimisticOps.push(h), queueMicrotask(function() {
                return o.mutatedParts && uo(o.mutatedParts);
              });
            }) : (u.optimisticOps.push(o), o.mutatedParts && uo(o.mutatedParts), c.then(function(d) {
              if (d.numFailures > 0) {
                mn(u.optimisticOps, o);
                var h = wh(u, o, d);
                h && u.optimisticOps.push(h), o.mutatedParts && uo(o.mutatedParts);
              }
            }), c.catch(function() {
              mn(u.optimisticOps, o), o.mutatedParts && uo(o.mutatedParts);
            })), c;
          },
          query: function(o) {
            var s;
            if (!Ly(Z, r) || !$y("query", o)) return r.query(o);
            var u = ((s = Z.trans) === null || s === void 0 ? void 0 : s.db._options.cache) === "immutable", c = Z, d = c.requery, h = c.signal, f = BR(t, n, "query", o), p = f[0], m = f[1], g = f[2], y = f[3];
            if (p && m) p.obsSet = o.obsSet;
            else {
              var v = r.query(o).then(function(b) {
                var _ = b.result;
                if (p && (p.res = _), u) {
                  for (var w = 0, E = _.length; w < E; ++w) Object.freeze(_[w]);
                  Object.freeze(_);
                } else b.result = In(_);
                return b;
              }).catch(function(b) {
                return y && p && mn(y, p), Promise.reject(b);
              });
              p = {
                obsSet: o.obsSet,
                promise: v,
                subscribers: /* @__PURE__ */ new Set(),
                type: "query",
                req: o,
                dirty: !1
              }, y ? y.push(p) : (y = [p], g || (g = Cn["idb://".concat(t, "/").concat(n)] = {
                queries: {
                  query: {},
                  count: {}
                },
                objs: /* @__PURE__ */ new Map(),
                optimisticOps: [],
                unsignaledParts: {}
              }), g.queries.query[o.query.index.name || ""] = y);
            }
            return OR(p, y, d, h), p.promise.then(function(b) {
              return { result: Sh(b.result, o, g?.optimisticOps, r, p, u) };
            });
          }
        });
      }
    });
  }
};
function fo(e, t) {
  return new Proxy(e, { get: function(n, r, i) {
    return r === "db" ? t : Reflect.get(n, r, i);
  } });
}
var gi = (function() {
  function e(t, n) {
    var r = this;
    this._middlewares = {}, this.verno = 0;
    var i = e.dependencies;
    this._options = n = se({
      addons: e.addons,
      autoOpen: !0,
      indexedDB: i.indexedDB,
      IDBKeyRange: i.IDBKeyRange,
      cache: "cloned"
    }, n), this._deps = {
      indexedDB: n.indexedDB,
      IDBKeyRange: n.IDBKeyRange
    };
    var o = n.addons;
    this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
    var s = {
      dbOpenError: null,
      isBeingOpened: !1,
      onReadyBeingFired: null,
      openComplete: !1,
      dbReadyResolve: ve,
      dbReadyPromise: null,
      cancelOpen: ve,
      openCanceller: null,
      autoSchema: !0,
      PR1398_maxLoop: 3,
      autoOpen: n.autoOpen
    };
    s.dbReadyPromise = new K(function(c) {
      s.dbReadyResolve = c;
    }), s.openCanceller = new K(function(c, d) {
      s.cancelOpen = d;
    }), this._state = s, this.name = t, this.on = xi(this, "populate", "blocked", "versionchange", "close", { ready: [Mu, ve] }), this.on.ready.subscribe = dy(this.on.ready.subscribe, function(c) {
      return function(d, h) {
        e.vip(function() {
          var f = r._state;
          if (f.openComplete)
            f.dbOpenError || K.resolve().then(d), h && c(d);
          else if (f.onReadyBeingFired)
            f.onReadyBeingFired.push(d), h && c(d);
          else {
            c(d);
            var p = r;
            h || c(function m() {
              p.on.ready.unsubscribe(d), p.on.ready.unsubscribe(m);
            });
          }
        });
      };
    }), this.Collection = YI(this), this.Table = KI(this), this.Transaction = rR(this), this.Version = _R(this), this.WhereClause = tR(this), this.on("versionchange", function(c) {
      c.newVersion > 0 ? console.warn("Another connection wants to upgrade database '".concat(r.name, "'. Closing db now to resume the upgrade.")) : console.warn("Another connection wants to delete database '".concat(r.name, "'. Closing db now to resume the delete request.")), r.close({ disableAutoOpen: !1 });
    }), this.on("blocked", function(c) {
      !c.newVersion || c.newVersion < c.oldVersion ? console.warn("Dexie.delete('".concat(r.name, "') was blocked")) : console.warn("Upgrade '".concat(r.name, "' blocked by other connection holding version ").concat(c.oldVersion / 10));
    }), this._maxKey = pi(n.IDBKeyRange), this._createTransaction = function(c, d, h, f) {
      return new r.Transaction(c, d, h, r._options.chromeTransactionDurability, f);
    }, this._fireOnBlocked = function(c) {
      r.on("blocked").fire(c), tr.filter(function(d) {
        return d.name === r.name && d !== r && !d._state.vcFired;
      }).map(function(d) {
        return d.on("versionchange").fire(c);
      });
    }, this.use(MR), this.use(qR), this.use(NR), this.use(IR), this.use(RR);
    var u = new Proxy(this, { get: function(c, d, h) {
      if (d === "_vip") return !0;
      if (d === "table") return function(p) {
        return fo(r.table(p), u);
      };
      var f = Reflect.get(c, d, h);
      return f instanceof xy ? fo(f, u) : d === "tables" ? f.map(function(p) {
        return fo(p, u);
      }) : d === "_createTransaction" ? function() {
        return fo(f.apply(this, arguments), u);
      } : f;
    } });
    this.vip = u, o.forEach(function(c) {
      return c(r);
    });
  }
  return e.prototype.version = function(t) {
    if (isNaN(t) || t < 0.1) throw new ee.Type("Given version is not a positive number");
    if (t = Math.round(t * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new ee.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, t);
    var n = this._versions, r = n.filter(function(i) {
      return i._cfg.version === t;
    })[0];
    return r || (r = new this.Version(t), n.push(r), n.sort(cR), r.stores({}), this._state.autoSchema = !1, r);
  }, e.prototype._whenReady = function(t) {
    var n = this;
    return this.idbdb && (this._state.openComplete || Z.letThrough || this._vip) ? t() : new K(function(r, i) {
      if (n._state.openComplete) return i(new ee.DatabaseClosed(n._state.dbOpenError));
      if (!n._state.isBeingOpened) {
        if (!n._state.autoOpen) {
          i(new ee.DatabaseClosed());
          return;
        }
        n.open().catch(ve);
      }
      n._state.dbReadyPromise.then(r, i);
    }).then(t);
  }, e.prototype.use = function(t) {
    var n = t.stack, r = t.create, i = t.level, o = t.name;
    o && this.unuse({
      stack: n,
      name: o
    });
    var s = this._middlewares[n] || (this._middlewares[n] = []);
    return s.push({
      stack: n,
      create: r,
      level: i ?? 10,
      name: o
    }), s.sort(function(u, c) {
      return u.level - c.level;
    }), this;
  }, e.prototype.unuse = function(t) {
    var n = t.stack, r = t.name, i = t.create;
    return n && this._middlewares[n] && (this._middlewares[n] = this._middlewares[n].filter(function(o) {
      return i ? o.create !== i : r ? o.name !== r : !1;
    })), this;
  }, e.prototype.open = function() {
    var t = this;
    return Pn(Qt, function() {
      return AR(t);
    });
  }, e.prototype._close = function() {
    var t = this._state, n = tr.indexOf(this);
    if (n >= 0 && tr.splice(n, 1), this.idbdb) {
      try {
        this.idbdb.close();
      } catch {
      }
      this.idbdb = null;
    }
    t.isBeingOpened || (t.dbReadyPromise = new K(function(r) {
      t.dbReadyResolve = r;
    }), t.openCanceller = new K(function(r, i) {
      t.cancelOpen = i;
    }));
  }, e.prototype.close = function(t) {
    var n = (t === void 0 ? { disableAutoOpen: !0 } : t).disableAutoOpen, r = this._state;
    n ? (r.isBeingOpened && r.cancelOpen(new ee.DatabaseClosed()), this._close(), r.autoOpen = !1, r.dbOpenError = new ee.DatabaseClosed()) : (this._close(), r.autoOpen = this._options.autoOpen || r.isBeingOpened, r.openComplete = !1, r.dbOpenError = null);
  }, e.prototype.delete = function(t) {
    var n = this;
    t === void 0 && (t = { disableAutoOpen: !0 });
    var r = arguments.length > 0 && typeof arguments[0] != "object", i = this._state;
    return new K(function(o, s) {
      var u = function() {
        n.close(t);
        var c = n._deps.indexedDB.deleteDatabase(n.name);
        c.onsuccess = be(function() {
          SR(n._deps, n.name), o();
        }), c.onerror = At(s), c.onblocked = n._fireOnBlocked;
      };
      if (r) throw new ee.InvalidArgument("Invalid closeOptions argument to db.delete()");
      i.isBeingOpened ? i.dbReadyPromise.then(u) : u();
    });
  }, e.prototype.backendDB = function() {
    return this.idbdb;
  }, e.prototype.isOpen = function() {
    return this.idbdb !== null;
  }, e.prototype.hasBeenClosed = function() {
    var t = this._state.dbOpenError;
    return t && t.name === "DatabaseClosed";
  }, e.prototype.hasFailed = function() {
    return this._state.dbOpenError !== null;
  }, e.prototype.dynamicallyOpened = function() {
    return this._state.autoSchema;
  }, Object.defineProperty(e.prototype, "tables", {
    get: function() {
      var t = this;
      return Ue(this._allTables).map(function(n) {
        return t._allTables[n];
      });
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype.transaction = function() {
    var t = CR.apply(this, arguments);
    return this._transaction.apply(this, t);
  }, e.prototype._transaction = function(t, n, r) {
    var i = this, o = Z.trans;
    (!o || o.db !== this || t.indexOf("!") !== -1) && (o = null);
    var s = t.indexOf("?") !== -1;
    t = t.replace("!", "").replace("?", "");
    var u, c;
    try {
      if (c = n.map(function(h) {
        var f = h instanceof i.Table ? h.name : h;
        if (typeof f != "string") throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return f;
      }), t == "r" || t === ba) u = ba;
      else if (t == "rw" || t == wa) u = wa;
      else throw new ee.InvalidArgument("Invalid transaction mode: " + t);
      if (o) {
        if (o.mode === ba && u === wa) if (s) o = null;
        else throw new ee.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        o && c.forEach(function(h) {
          if (o && o.storeNames.indexOf(h) === -1) if (s) o = null;
          else throw new ee.SubTransaction("Table " + h + " not included in parent transaction.");
        }), s && o && !o.active && (o = null);
      }
    } catch (h) {
      return o ? o._promise(null, function(f, p) {
        p(h);
      }) : xe(h);
    }
    var d = ky.bind(null, this, u, c, o, r);
    return o ? o._promise(u, d, "lock") : Z.trans ? Pn(Z.transless, function() {
      return i._whenReady(d);
    }) : this._whenReady(d);
  }, e.prototype.table = function(t) {
    if (!Ye(this._allTables, t)) throw new ee.InvalidTable("Table ".concat(t, " does not exist"));
    return this._allTables[t];
  }, e;
})(), VR = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", HR = (function() {
  function e(t) {
    this._subscribe = t;
  }
  return e.prototype.subscribe = function(t, n, r) {
    return this._subscribe(!t || typeof t == "function" ? {
      next: t,
      error: n,
      complete: r
    } : t);
  }, e.prototype[VR] = function() {
    return this;
  }, e;
})(), cs;
try {
  cs = {
    indexedDB: Oe.indexedDB || Oe.mozIndexedDB || Oe.webkitIndexedDB || Oe.msIndexedDB,
    IDBKeyRange: Oe.IDBKeyRange || Oe.webkitIDBKeyRange
  };
} catch {
  cs = {
    indexedDB: null,
    IDBKeyRange: null
  };
}
function KR(e) {
  var t = !1, n, r = new HR(function(i) {
    var o = Iu(e);
    function s(b) {
      var _ = fr();
      try {
        o && pr();
        var w = en(e, b);
        return o && (w = w.finally(tn)), w;
      } finally {
        _ && hr();
      }
    }
    var u = !1, c, d = {}, h = {}, f = {
      get closed() {
        return u;
      },
      unsubscribe: function() {
        u || (u = !0, c && c.abort(), p && rn.storagemutated.unsubscribe(y));
      }
    };
    i.start && i.start(f);
    var p = !1, m = function() {
      return _a(v);
    };
    function g() {
      return qu(h, d);
    }
    var y = function(b) {
      Ds(d, b), g() && m();
    }, v = function() {
      if (!(u || !cs.indexedDB)) {
        d = {};
        var b = {};
        c && c.abort(), c = new AbortController();
        var _ = {
          subscr: b,
          signal: c.signal,
          requery: m,
          querier: e,
          trans: null
        }, w = s(_);
        Promise.resolve(w).then(function(E) {
          t = !0, n = E, !(u || _.signal.aborted) && (d = {}, h = b, !vI(h) && !p && (rn(Ri, y), p = !0), _a(function() {
            return !u && i.next && i.next(E);
          }));
        }, function(E) {
          t = !1, ["DatabaseClosedError", "AbortError"].includes(E?.name) || u || _a(function() {
            u || i.error && i.error(E);
          });
        });
      }
    };
    return setTimeout(m, 0), f;
  });
  return r.hasValue = function() {
    return t;
  }, r.getValue = function() {
    return n;
  }, r;
}
var _n = gi;
rr(_n, se(se({}, Ms), {
  delete: function(e) {
    return new _n(e, { addons: [] }).delete();
  },
  exists: function(e) {
    return new _n(e, { addons: [] }).open().then(function(t) {
      return t.close(), !0;
    }).catch("NoSuchDatabaseError", function() {
      return !1;
    });
  },
  getDatabaseNames: function(e) {
    try {
      return bR(_n.dependencies).then(e);
    } catch {
      return xe(new ee.MissingAPI());
    }
  },
  defineClass: function() {
    function e(t) {
      ot(this, t);
    }
    return e;
  },
  ignoreTransaction: function(e) {
    return Z.trans ? Pn(Z.transless, e) : e();
  },
  vip: Fl,
  async: function(e) {
    return function() {
      try {
        var t = Bl(e.apply(this, arguments));
        return !t || typeof t.then != "function" ? K.resolve(t) : t;
      } catch (n) {
        return xe(n);
      }
    };
  },
  spawn: function(e, t, n) {
    try {
      var r = Bl(e.apply(n, t || []));
      return !r || typeof r.then != "function" ? K.resolve(r) : r;
    } catch (i) {
      return xe(i);
    }
  },
  currentTransaction: { get: function() {
    return Z.trans || null;
  } },
  waitFor: function(e, t) {
    var n = K.resolve(typeof e == "function" ? _n.ignoreTransaction(e) : e).timeout(t || 6e4);
    return Z.trans ? Z.trans.waitFor(n) : n;
  },
  Promise: K,
  debug: {
    get: function() {
      return xt;
    },
    set: function(e) {
      _y(e);
    }
  },
  derive: cr,
  extend: ot,
  props: rr,
  override: dy,
  Events: xi,
  on: rn,
  liveQuery: KR,
  extendObservabilitySet: Ds,
  getByKeyPath: Ut,
  setByKeyPath: it,
  delByKeyPath: mI,
  shallowClone: hy,
  deepClone: In,
  getObjectDiff: Hu,
  cmp: de,
  asap: fy,
  minKey: kl,
  addons: [],
  connections: tr,
  errnames: Pu,
  dependencies: cs,
  cache: Cn,
  semVer: fh,
  version: fh.split(".").map(function(e) {
    return parseInt(e);
  }).reduce(function(e, t, n) {
    return e + t / Math.pow(10, n * 2);
  })
}));
_n.maxKey = pi(_n.dependencies.IDBKeyRange);
typeof dispatchEvent < "u" && typeof addEventListener < "u" && (rn(Ri, function(e) {
  if (!Xt) {
    var t = new CustomEvent(Dl, { detail: e });
    Xt = !0, dispatchEvent(t), Xt = !1;
  }
}), addEventListener(Dl, function(e) {
  var t = e.detail;
  Xt || Wu(t);
}));
function Wu(e) {
  var t = Xt;
  try {
    Xt = !0, rn.storagemutated.fire(e), Vu(e, !0);
  } finally {
    Xt = t;
  }
}
var Xt = !1, Jt, Ol = function() {
};
typeof BroadcastChannel < "u" && (Ol = function() {
  Jt = new BroadcastChannel(Dl), Jt.onmessage = function(e) {
    return e.data && Wu(e.data);
  };
}, Ol(), typeof Jt.unref == "function" && Jt.unref(), rn(Ri, function(e) {
  Xt || Jt.postMessage(e);
}));
typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
  if (!gi.disableBfCache && e.persisted) {
    xt && console.debug("Dexie: handling persisted pagehide"), Jt?.close();
    for (var t = 0, n = tr; t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
  }
}), addEventListener("pageshow", function(e) {
  !gi.disableBfCache && e.persisted && (xt && console.debug("Dexie: handling persisted pageshow"), Ol(), Wu({ all: new Ke(-1 / 0, [[]]) }));
}));
K.rejectionMapper = TI;
_y(xt);
var Ls = new gi("LittleWhiteBox_Assistant");
Ls.version(1).stores({
  sessions: "id, updatedAt",
  messages: "[sessionId+order], sessionId"
});
var ho = Ls.sessions, Dr = Ls.messages, gn = "default", Gn = Promise.resolve();
function Uy(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function WR(e, t, n, r) {
  return {
    sessionId: gn,
    order: r,
    role: e.role,
    content: String(e.content || ""),
    attachments: t(e.attachments).map((i) => ({
      kind: i.kind,
      name: i.name,
      type: i.type,
      size: i.size
    })),
    toolCallId: e.toolCallId || "",
    toolName: e.toolName || "",
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((i) => ({
      id: i.id || "",
      name: i.name || "",
      arguments: String(i.arguments || "{}")
    })) : [],
    thoughts: n(e.thoughts).map((i) => ({
      label: i.label,
      text: i.text
    })),
    providerPayload: Uy(e?.providerPayload)
  };
}
function JR(e, t) {
  const { normalizeAttachments: n, normalizeThoughtBlocks: r, createRequestId: i } = t;
  return !e || typeof e != "object" || ![
    "user",
    "assistant",
    "tool"
  ].includes(e.role) || e.approvalRequest ? null : {
    role: e.role,
    content: String(e.content || ""),
    attachments: n(e.attachments || []),
    toolCallId: e.toolCallId ? String(e.toolCallId) : void 0,
    toolName: e.toolName ? String(e.toolName) : void 0,
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.filter((o) => o && typeof o == "object" && o.name).map((o) => ({
      id: String(o.id || i("tool")),
      name: String(o.name || ""),
      arguments: String(o.arguments || "{}")
    })) : void 0,
    thoughts: r(e.thoughts || []),
    providerPayload: Uy(e?.providerPayload)
  };
}
function zR(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest);
}
function YR(e) {
  const { state: t, createRequestId: n, normalizeAttachments: r, normalizeThoughtBlocks: i, getActiveContextMessages: o } = e;
  function s() {
    const f = o().filter(zR).map((p, m) => WR(p, r, i, m));
    return {
      historySummary: String(t.historySummary || ""),
      sidebarCollapsed: t.sidebarCollapsed !== void 0 ? !!t.sidebarCollapsed : !0,
      messages: f
    };
  }
  async function u(f) {
    await Ls.transaction("rw", ho, Dr, async () => {
      await ho.put({
        id: gn,
        updatedAt: Date.now(),
        historySummary: f.historySummary,
        sidebarCollapsed: f.sidebarCollapsed
      }), await Dr.where("sessionId").equals(gn).delete(), f.messages.length && await Dr.bulkPut(f.messages);
    });
  }
  function c() {
    const f = s();
    return Gn = Gn.catch(() => {
    }).then(async () => {
      try {
        await u(f);
      } catch (p) {
        console.error("[Assistant] 保存会话失败:", p);
      }
    }), Gn;
  }
  function d() {
    return Gn = Gn.catch(() => {
    }).then(async () => {
      try {
        await Dr.where("sessionId").equals(gn).delete(), await ho.delete(gn);
      } catch (f) {
        console.error("[Assistant] 清空会话失败:", f);
      }
    }), Gn;
  }
  async function h() {
    try {
      const f = await ho.get(gn);
      if (!f) {
        t.messages = [], t.historySummary = "", t.archivedTurnCount = 0, t.sidebarCollapsed = !0;
        return;
      }
      const p = await Dr.where("sessionId").equals(gn).toArray();
      p.sort((m, g) => Number(m.order || 0) - Number(g.order || 0)), t.messages = p.map((m) => JR(m, {
        normalizeAttachments: r,
        normalizeThoughtBlocks: i,
        createRequestId: n
      })).filter(Boolean), t.historySummary = String(f.historySummary || ""), t.archivedTurnCount = 0, t.sidebarCollapsed = f.sidebarCollapsed !== void 0 ? !!f.sidebarCollapsed : !0;
    } catch (f) {
      console.error("[Assistant] 恢复会话失败:", f), t.messages = [], t.historySummary = "", t.archivedTurnCount = 0, t.sidebarCollapsed = !0;
    }
  }
  return {
    clearSession: d,
    persistSession: c,
    restoreSession: h
  };
}
function XR(e) {
  const { state: t, showToast: n, render: r, acceptedImageMimeTypes: i, maxImageAttachments: o, maxImageFileBytes: s } = e;
  function u(b) {
    return Array.isArray(b) ? b.map((_) => {
      if (!_ || typeof _ != "object" || _.kind !== "image") return null;
      const w = String(_.type || "").trim().toLowerCase(), E = typeof _.dataUrl == "string" ? _.dataUrl.trim() : "", A = E.startsWith("data:image/");
      return w && !i.includes(w) ? null : {
        kind: "image",
        name: String(_.name || "image").trim() || "image",
        type: w || "image/png",
        dataUrl: A ? E : "",
        size: Math.max(0, Number(_.size) || 0)
      };
    }).filter(Boolean) : [];
  }
  function c(b) {
    const _ = u(b);
    if (!_.length) return "";
    const w = _.map((E) => E.name).join("、");
    return `[附图 ${_.length} 张：${w}]`;
  }
  function d(b, _) {
    const w = c(_), E = String(b || "").trim();
    return w ? [E, w].filter(Boolean).join(`
`) : E;
  }
  function h(b = {}) {
    const _ = u(b.attachments).filter((E) => E.dataUrl), w = [];
    return b.content?.trim() && w.push({
      type: "text",
      text: b.content.trim()
    }), _.forEach((E) => {
      w.push({
        type: "image_url",
        image_url: { url: E.dataUrl },
        mimeType: E.type,
        name: E.name
      });
    }), w.length ? w : [{
      type: "text",
      text: ""
    }];
  }
  function f(b) {
    return new Promise((_, w) => {
      const E = new FileReader();
      E.onerror = () => w(/* @__PURE__ */ new Error(`读取图片失败：${b.name || "未命名图片"}`)), E.onload = () => {
        _({
          kind: "image",
          name: p(b),
          type: b.type || "image/png",
          size: Number(b.size) || 0,
          dataUrl: typeof E.result == "string" ? E.result : ""
        });
      }, E.readAsDataURL(b);
    });
  }
  function p(b) {
    const _ = typeof b?.name == "string" ? b.name.trim() : "";
    if (_) return _;
    const w = m(b?.type);
    return `clipboard-image-${Date.now()}.${w}`;
  }
  function m(b) {
    switch (String(b || "").toLowerCase()) {
      case "image/jpeg":
        return "jpg";
      case "image/webp":
        return "webp";
      case "image/gif":
        return "gif";
      default:
        return "png";
    }
  }
  function g(b) {
    const _ = Array.isArray(b) ? b.filter(Boolean) : [], w = Math.max(0, o - t.draftAttachments.length);
    if (!w) return {
      validFiles: [],
      rejectedReason: `最多只能附 ${o} 张图片`,
      reachedLimit: !0,
      hadOverflow: !1
    };
    const E = _.slice(0, w), A = [];
    let S = "";
    return E.forEach((I) => {
      if (!i.includes(I.type)) {
        S = "只支持 PNG、JPG、WEBP、GIF 图片";
        return;
      }
      if ((Number(I.size) || 0) > s) {
        S = `单张图片不能超过 ${Math.round(s / (1024 * 1024))}MB`;
        return;
      }
      A.push(I);
    }), {
      validFiles: A,
      rejectedReason: S,
      reachedLimit: !1,
      hadOverflow: _.length > w
    };
  }
  async function y(b) {
    const _ = Array.isArray(b) ? b.filter(Boolean) : [];
    if (!_.length) return !1;
    const { validFiles: w, rejectedReason: E, reachedLimit: A, hadOverflow: S } = g(_);
    if (!w.length)
      return n(E || "没有可添加的图片"), A || !!E;
    try {
      const I = await Promise.all(w.map((C) => f(C)));
      return t.draftAttachments = [...t.draftAttachments, ...I].slice(0, o), r(), (E || S) && n(E || `最多只能附 ${o} 张图片`), !0;
    } catch (I) {
      return n(String(I?.message || "读取图片失败")), !0;
    }
  }
  function v(b, _ = [], w = {}) {
    const E = u(_);
    b.replaceChildren(), b.style.display = E.length ? "" : "none", E.length && E.forEach((A, S) => {
      const I = document.createElement("div");
      if (I.className = w.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", A.dataUrl) {
        const P = document.createElement("img");
        P.className = "xb-assistant-attachment-image", P.src = A.dataUrl, P.alt = A.name, I.appendChild(P);
      } else {
        const P = document.createElement("div");
        P.className = "xb-assistant-attachment-placeholder", P.textContent = "图片", I.appendChild(P);
      }
      const C = document.createElement("div");
      if (C.className = "xb-assistant-attachment-name", C.textContent = A.name, I.appendChild(C), typeof w.onRemove == "function") {
        const P = document.createElement("button");
        P.type = "button", P.className = "xb-assistant-attachment-remove", P.textContent = "×", P.title = "移除图片", P.addEventListener("click", () => w.onRemove(S)), I.appendChild(P);
      }
      b.appendChild(I);
    });
  }
  return {
    normalizeAttachments: u,
    buildAttachmentSummary: c,
    buildTextWithAttachmentSummary: d,
    buildUserContentParts: h,
    appendDraftImageFiles: y,
    renderAttachmentGallery: v
  };
}
var QR = { chat: { exclude: [
  "embedding",
  "embed",
  "rerank",
  "reranker",
  "tts",
  "speech",
  "audio",
  "whisper",
  "transcription",
  "stt",
  "image",
  "sdxl",
  "flux",
  "moderation"
] } };
function po(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const i = document.createElement("option");
    i.value = r.value, i.textContent = r.label, e.appendChild(i);
  });
}
function Ju(e = []) {
  const t = [...new Set(e.filter(Boolean).map((i) => String(i).trim()).filter(Boolean))], n = QR.chat, r = t.filter((i) => {
    const o = i.toLowerCase();
    return !n.exclude.some((s) => o.includes(s));
  });
  return r.length ? r : t;
}
function $s(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function yi(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function ZR(e) {
  const t = $s(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return yi([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return yi([`${t}/v1/models`, `${t}/models`]);
}
function jR(e) {
  const t = $s(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return yi([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return yi([`${t}/v1/models`, `${t}/models`]);
}
function eP(e, t) {
  const n = $s(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return yi([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function tP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function nP(e, t = {}) {
  const n = await fetch(e, t), r = await n.text();
  let i = null, o = null;
  try {
    i = r ? JSON.parse(r) : {};
  } catch (s) {
    o = s;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: i,
    rawText: r,
    parseError: o,
    errorSnippet: tP(i, r)
  };
}
function rP(e) {
  return Ju((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function iP(e) {
  return Ju((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function oP(e) {
  return Ju((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Ra({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let i = null;
  for (const o of e) for (const s of t) {
    const u = await nP(o, s);
    if (!u.ok) {
      i = u;
      continue;
    }
    if (u.parseError) {
      i = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    i = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (i) {
    const o = i.url ? ` (${i.url})` : "", s = i.errorSnippet ? `：${i.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${i.status || "unknown"}${s}${o}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function sP(e) {
  const t = e.provider, n = $s(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Ra({
    urls: eP(n, r),
    requestOptionsList: [
      { headers: {
        Accept: "application/json",
        "x-goog-api-key": r
      } },
      { headers: {
        Accept: "application/json",
        Authorization: `Bearer ${r}`
      } },
      { headers: { Accept: "application/json" } }
    ],
    extractModels: oP,
    providerLabel: "Google AI"
  }) : t === "anthropic" ? await Ra({
    urls: jR(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: iP,
    providerLabel: "Anthropic"
  }) : await Ra({
    urls: ZR(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: rP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function aP(e) {
  const { state: t, post: n, render: r, showToast: i, beginConfigSave: o, requestConfigFormSync: s, describeError: u, getPullState: c, setPullState: d, setProviderModels: h, getProviderModels: f, getProviderLabel: p, normalizeReasoningEffort: m, normalizeAssistantConfig: g, normalizePresetName: y, buildDefaultPreset: v, cloneDefaultModelConfigs: b, createRequestId: _, defaultPresetName: w, requestTimeoutMs: E, toolModeOptions: A, reasoningEffortOptions: S } = e;
  function I(D, q) {
    const X = y(D || w), me = q && typeof q == "object" ? q : v(), fe = me.provider || "openai-compatible", he = (me.modelConfigs || b())[fe] || {};
    return {
      currentPresetName: X,
      presetDraftName: X,
      provider: fe,
      baseUrl: String(he.baseUrl || ""),
      model: String(he.model || ""),
      apiKey: String(he.apiKey || ""),
      temperature: Number(he.temperature ?? 0.2),
      reasoningEnabled: !!he.reasoningEnabled,
      reasoningEffort: m(he.reasoningEffort),
      toolMode: he.toolMode || "native"
    };
  }
  function C() {
    if (t.configDraft) return t.configDraft;
    const D = y(t.config?.currentPresetName || w);
    return t.configDraft = I(D, (t.config?.presets || {})[D] || v()), t.configDraft;
  }
  function P(D) {
    const q = C();
    return {
      ...q,
      currentPresetName: q.currentPresetName,
      presetDraftName: y(D.querySelector("#xb-assistant-preset-name")?.value),
      provider: D.querySelector("#xb-assistant-provider")?.value || q.provider || "openai-compatible",
      baseUrl: D.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: D.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: D.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Number(q.temperature ?? 0.2),
      reasoningEnabled: D.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: m(D.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: D.querySelector("#xb-assistant-tool-mode")?.value || q.toolMode || "native"
    };
  }
  function T(D) {
    return t.configDraft = P(D), t.configDraft;
  }
  function k(D = C()) {
    return {
      baseUrl: String(D.baseUrl || ""),
      model: String(D.model || ""),
      apiKey: String(D.apiKey || ""),
      temperature: Number(D.temperature ?? 0.2),
      reasoningEnabled: !!D.reasoningEnabled,
      reasoningEffort: m(D.reasoningEffort),
      toolMode: D.provider === "openai-compatible" ? D.toolMode || "native" : void 0
    };
  }
  function F() {
    const D = C();
    return {
      provider: D.provider || "openai-compatible",
      baseUrl: D.baseUrl || "",
      model: D.model || "",
      apiKey: D.apiKey || "",
      temperature: Number(D.temperature ?? 0.2),
      maxTokens: null,
      timeoutMs: E,
      toolMode: D.toolMode || "native",
      reasoningEnabled: !!D.reasoningEnabled,
      reasoningEffort: m(D.reasoningEffort)
    };
  }
  function B(D) {
    C(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: y(D.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function W(D) {
    if (!t.config) return;
    const q = C(), X = q.provider || "openai-compatible", me = f(X), fe = D.querySelector("#xb-assistant-tool-mode-wrap"), he = D.querySelector("#xb-assistant-tool-mode"), Ae = D.querySelector("#xb-assistant-reasoning-enabled"), at = D.querySelector("#xb-assistant-reasoning-effort-wrap"), sn = D.querySelector("#xb-assistant-reasoning-effort"), Os = D.querySelector("#xb-assistant-model-pulled"), Mi = D.querySelector("#xb-assistant-preset-select"), Gs = D.querySelector("#xb-assistant-preset-name");
    po(Mi, (t.config.presetNames || []).map((St) => ({
      value: St,
      label: St
    }))), Mi.value = q.currentPresetName || t.config.currentPresetName || w, Gs.value = q.presetDraftName || q.currentPresetName || w, D.querySelector("#xb-assistant-provider").value = X, D.querySelector("#xb-assistant-base-url").value = q.baseUrl || "", D.querySelector("#xb-assistant-model").value = q.model || "", D.querySelector("#xb-assistant-api-key").value = q.apiKey || "", fe.style.display = X === "openai-compatible" ? "" : "none", po(he, A), he.value = q.toolMode || "native", po(sn, S), Ae.checked = !!q.reasoningEnabled, sn.value = m(q.reasoningEffort), at.style.display = Ae.checked ? "" : "none", po(Os, me.map((St) => ({
      value: St,
      label: St
    })), "手动填写");
    const Ni = D.querySelector("#xb-assistant-runtime"), an = c(X);
    Ni.textContent = t.runtime ? `预设「${q.currentPresetName || w}」 · ${p(X)} · 已索引 ${t.runtime.indexedFileCount || 0} 个前端源码文件${an.message ? ` · ${an.message}` : ""}` : an.message || "";
  }
  function O(D) {
    const q = T(D), X = y(q.presetDraftName), me = y(q.currentPresetName || t.config?.currentPresetName || w), fe = (t.config?.presets || {})[me] || v(), he = {
      ...fe,
      provider: q.provider,
      modelConfigs: {
        ...fe.modelConfigs || b(),
        [q.provider]: {
          ...(fe.modelConfigs || b())[q.provider] || {},
          ...k(q)
        }
      }
    }, Ae = {
      ...t.config?.presets || {},
      [X]: he
    };
    t.config = g({
      ...t.config,
      currentPresetName: X,
      presets: Ae
    }), t.configDraft = I(X, he), s();
    const at = _("save-config");
    o(at), n("xb-assistant:save-config", {
      requestId: at,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || w,
      presets: t.config?.presets || {}
    });
  }
  function le(D) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      i("至少要保留一套预设");
      return;
    }
    const q = y(t.configDraft?.currentPresetName || t.config?.currentPresetName || w), X = { ...t.config?.presets || {} };
    delete X[q];
    const me = Object.keys(X)[0] || w, fe = X[me] || v();
    t.config = g({
      ...t.config,
      currentPresetName: me,
      presets: X
    }), t.configDraft = I(me, fe), s();
    const he = _("delete-preset");
    o(he), n("xb-assistant:save-config", {
      requestId: he,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || w,
      presets: t.config?.presets || {}
    }), r();
  }
  function ue(D) {
    D.querySelector("#xb-assistant-provider").addEventListener("change", (q) => {
      const X = q.currentTarget.value;
      C(), t.configDraft = {
        ...t.configDraft,
        provider: X
      }, s(), r();
    }), D.querySelector("#xb-assistant-preset-select").addEventListener("change", (q) => {
      const X = y(q.currentTarget.value), me = (t.config?.presets || {})[X] || v();
      t.config = g({
        ...t.config,
        currentPresetName: X
      }), t.configDraft = I(X, me), s(), r();
    }), D.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
      B(D);
    }), D.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      T(D);
    }), D.querySelector("#xb-assistant-model").addEventListener("input", () => {
      T(D);
    }), D.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      T(D);
    }), D.querySelector("#xb-assistant-model-pulled").addEventListener("change", (q) => {
      const X = q.currentTarget.value;
      X && (D.querySelector("#xb-assistant-model").value = X, T(D));
    }), D.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
      const q = D.querySelector("#xb-assistant-api-key");
      q.type = q.type === "password" ? "text" : "password", r();
    }), D.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      T(D), s(), r();
    }), D.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      T(D);
    }), D.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      T(D);
    }), D.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      T(D), s();
      const q = F();
      d(q.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), r();
      try {
        const X = await sP(q);
        h(q.provider, X), d(q.provider, {
          status: "success",
          message: `已拉取 ${X.length} 个模型`
        });
      } catch (X) {
        h(q.provider, []), d(q.provider, {
          status: "error",
          message: u(X)
        });
      }
      s(), r();
    }), D.querySelector("#xb-assistant-save").addEventListener("click", () => {
      O(D);
    }), D.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      le(D);
    });
  }
  return {
    getActiveProviderConfig: F,
    syncConfigToForm: W,
    bindSettingsPanelEvents: ue
  };
}
function lP(e) {
  const { state: t, toolNames: n, formatToolResultDisplay: r, normalizeThoughtBlocks: i, normalizeAttachments: o, renderAttachmentGallery: s } = e;
  let u = !1, c = null;
  function d(T) {
    return String(T || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function h(T) {
    const k = String(T || "").trim();
    if (!k) return "";
    try {
      const F = globalThis.parent?.showdown || globalThis.showdown, B = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
      if (F?.Converter && B?.sanitize) {
        const W = new F.Converter({
          simpleLineBreaks: !0,
          strikethrough: !0,
          tables: !0,
          tasklists: !0,
          ghCodeBlocks: !0,
          simplifiedAutoLink: !0,
          openLinksInNewWindow: !0,
          emoji: !1
        }).makeHtml(k);
        return B.sanitize(W, {
          USE_PROFILES: { html: !0 },
          FORBID_TAGS: ["style", "script"]
        });
      }
    } catch {
    }
    return d(k).replace(/\n/g, "<br>");
  }
  async function f(T) {
    const k = String(T || "");
    if (!k) return !1;
    try {
      if (navigator.clipboard?.writeText)
        return await navigator.clipboard.writeText(k), !0;
    } catch {
    }
    try {
      const F = document.createElement("textarea");
      F.value = k, F.setAttribute("readonly", "readonly"), F.style.position = "fixed", F.style.opacity = "0", F.style.pointerEvents = "none", document.body.appendChild(F), F.select(), F.setSelectionRange(0, F.value.length);
      const B = document.execCommand("copy");
      return F.remove(), B;
    } catch {
      return !1;
    }
  }
  function p(T) {
    Array.from(T.body.querySelectorAll("pre")).forEach((k) => {
      if (k.closest(".xb-assistant-codeblock")) return;
      const F = T.createElement("div");
      F.className = "xb-assistant-codeblock";
      const B = T.createElement("button");
      B.type = "button", B.className = "xb-assistant-code-copy", B.textContent = "⧉", B.title = "复制代码", B.setAttribute("aria-label", "复制代码"), B.addEventListener("click", async () => {
        const W = await f(k.querySelector("code")?.textContent || k.textContent || "");
        B.textContent = W ? "✓" : "!", B.title = W ? "已复制" : "复制失败", setTimeout(() => {
          B.textContent = "⧉", B.title = "复制代码";
        }, 1200);
      }), k.parentNode?.insertBefore(F, k), F.append(B, k);
    });
  }
  function m(T) {
    const k = new DOMParser().parseFromString(`<body>${String(T || "")}</body>`, "text/html");
    p(k);
    const F = document.createDocumentFragment();
    return Array.from(k.body.childNodes).forEach((B) => {
      F.appendChild(document.importNode(B, !0));
    }), F;
  }
  function g(T) {
    return JSON.stringify({
      role: T.role,
      content: String(T.content || ""),
      toolCallId: String(T.toolCallId || ""),
      toolName: String(T.toolName || ""),
      toolCalls: Array.isArray(T.toolCalls) ? T.toolCalls.map((k) => ({
        id: String(k.id || ""),
        name: String(k.name || ""),
        arguments: String(k.arguments || "")
      })) : [],
      thoughts: i(T.thoughts),
      attachments: o(T.attachments).map((k) => ({
        kind: k.kind,
        name: k.name,
        type: k.type,
        size: k.size
      })),
      streaming: !!T.streaming
    });
  }
  function y(T) {
    if (!T || T.kind !== "slash-command") return null;
    const k = document.createElement("div");
    k.className = "xb-assistant-approval";
    const F = document.createElement("div");
    F.className = "xb-assistant-approval-title", F.textContent = "待确认的斜杠命令";
    const B = document.createElement("pre");
    B.className = "xb-assistant-content xb-assistant-approval-command", B.textContent = T.command || "";
    const W = document.createElement("div");
    if (W.className = "xb-assistant-approval-note", W.textContent = T.status === "approved" ? "已同意，命令已进入执行流程。" : T.status === "declined" ? "已拒绝，本次不会执行这条命令。" : T.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "这条命令会直接作用于你当前打开的真实酒馆实例；点“是”后才会真正执行。", k.append(F, B, W), T.status === "pending") {
      const O = document.createElement("div");
      O.className = "xb-assistant-approval-actions";
      const le = document.createElement("button");
      le.type = "button", le.className = "xb-assistant-approval-button", le.dataset.approvalId = T.id, le.dataset.approvalDecision = "approve", le.textContent = "是，执行";
      const ue = document.createElement("button");
      ue.type = "button", ue.className = "xb-assistant-approval-button secondary", ue.dataset.approvalId = T.id, ue.dataset.approvalDecision = "decline", ue.textContent = "否，跳过", O.append(le, ue), k.appendChild(O);
    }
    return k;
  }
  function v(T) {
    const k = document.createElement("div");
    k.className = `xb-assistant-bubble role-${T.role}`;
    const F = String(T.content || "").trim(), B = T.role === "assistant" && Array.isArray(T.toolCalls) && T.toolCalls.length > 0;
    B && !F && k.classList.add("is-tool-call");
    const W = document.createElement("div");
    if (W.className = "xb-assistant-meta", W.textContent = T.role === "user" ? "你" : T.role === "assistant" ? Array.isArray(T.toolCalls) && T.toolCalls.length ? `小白助手 · 已发起 ${T.toolCalls.length} 个工具调用` : `小白助手${T.streaming ? " · 正在生成" : ""}${Array.isArray(T.thoughts) && T.thoughts.length ? ` · 含 ${T.thoughts.length} 段思考` : ""}` : `工具结果${T.toolName ? ` · ${T.toolName}` : ""}`, T.role === "tool") {
      const D = r(T), q = document.createElement("pre");
      if (q.className = "xb-assistant-content tool-summary", q.textContent = D.summary || "工具已返回结果。", k.append(W, q), D.details) {
        const X = document.createElement("details");
        X.className = "xb-assistant-tool-details";
        const me = document.createElement("summary");
        me.textContent = T.toolName === n.READ ? "展开文件内容" : "展开详细结果";
        const fe = document.createElement("pre");
        fe.className = "xb-assistant-content tool-detail", fe.textContent = D.details, X.append(me, fe), k.appendChild(X);
      }
      return k;
    }
    const O = document.createElement("div");
    O.className = "xb-assistant-content xb-assistant-markdown";
    const le = T.role === "assistant" && !B ? T.streaming ? "思考中…" : "我先查一下相关代码。" : "", ue = F || String(le || "").trim();
    if (k.appendChild(W), ue && (O.appendChild(m(h(ue))), k.appendChild(O)), Array.isArray(T.attachments) && T.attachments.length) {
      const D = document.createElement("div");
      D.className = "xb-assistant-attachment-gallery", s(D, T.attachments, { compact: !0 }), k.appendChild(D);
    }
    if (T.role === "assistant" && Array.isArray(T.thoughts) && T.thoughts.length) {
      const D = document.createElement("details");
      D.className = "xb-assistant-thought-details";
      const q = document.createElement("summary");
      q.textContent = T.thoughts.length > 1 ? `展开思考块（${T.thoughts.length} 段）` : "展开思考块", D.appendChild(q), T.thoughts.forEach((X) => {
        const me = document.createElement("div");
        me.className = "xb-assistant-thought-block";
        const fe = document.createElement("div");
        fe.className = "xb-assistant-thought-label", fe.textContent = X.label;
        const he = document.createElement("pre");
        he.className = "xb-assistant-content xb-assistant-thought-content", he.textContent = X.text, me.append(fe, he), D.appendChild(me);
      }), k.appendChild(D);
    }
    return k;
  }
  function b(T) {
    if (!t.messages.length) {
      T.innerHTML = "";
      const k = document.createElement("div");
      k.className = "xb-assistant-empty", k.innerHTML = "<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住；同时我会在 128k 上下文附近自动总结，尽量保持长期记忆。</p><p>今天有什么我可以帮你的吗？</p>", T.appendChild(k);
      return;
    }
    T.innerHTML = "", t.messages.forEach((k) => {
      const F = v(k);
      F.dataset.renderSignature = g(k), T.appendChild(F);
    }), t.autoScroll && (T.scrollTop = T.scrollHeight);
  }
  function _(T) {
    if (!T) return;
    T.innerHTML = "";
    const k = y(t.pendingApproval);
    k && T.appendChild(k);
  }
  function w(T) {
    if (!T) return;
    const k = () => {
      T.scrollTop = T.scrollHeight;
    };
    k(), requestAnimationFrame(() => {
      k(), requestAnimationFrame(k);
    });
  }
  function E(T) {
    T && T.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  function A(T) {
    const k = T.querySelector("#xb-assistant-chat"), F = T.querySelector("#xb-assistant-scroll-top"), B = T.querySelector("#xb-assistant-scroll-bottom");
    if (!k || !F || !B) return;
    const W = k.scrollTop, O = k.scrollHeight, le = k.clientHeight, ue = 80;
    F.classList.toggle("visible", W > ue), B.classList.toggle("visible", O - W - le > ue);
  }
  function S(T) {
    T.querySelector("#xb-assistant-scroll-helpers")?.classList.add("active");
  }
  function I(T) {
    T.querySelector("#xb-assistant-scroll-helpers")?.classList.remove("active");
  }
  function C(T) {
    c && clearTimeout(c), c = setTimeout(() => {
      I(T), c = null;
    }, 1500);
  }
  function P(T) {
    u || (u = !0, requestAnimationFrame(() => {
      A(T), S(T), C(T), u = !1;
    }));
  }
  return {
    renderMessages: b,
    renderApprovalPanel: _,
    scrollChatToBottom: w,
    scrollChatToTop: E,
    updateChatScrollButtonsVisibility: A,
    handleAssistantChatScroll: P
  };
}
var uP = [
  "项目结构提示：",
  "你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。",
  "你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。",
  "你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。",
  "如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问小白X插件功能使用问题，也优先读取结构目录后再精准查找对应文件：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问 STscript、斜杠命令语法或脚本语言行为，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 。",
  "如果用户问 SillyTavern 前端 API、页面脚本接口、前端扩展调用方式或如何写插件，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。"
].join(`
`), Fy = [
  "你是 SillyTavern 中 LittleWhiteBox（中文一般称“小白X”）插件的内置技术支持助手，当前正在这个界面中为用户提供帮助。",
  "",
  "你的职责是：",
  "- 解答 LittleWhiteBox 和 SillyTavern 的代码、设置、模块行为、报错排查与使用问题。",
  "- 辅助用户写卡、写插件、写脚本、整理设定、构思剧情或基于当前酒馆状态给出操作建议。",
  "- 当问题涉及具体实现、文件路径、设置逻辑、错误原因或当前实例状态时，优先使用工具查证后再回答。",
  "- 如果查实属于小白X自身功能 BUG、设计缺陷或值得做的必要优化，可以建议用户前往 LittleWhiteBox 的 GitHub Issues 页面提交 issue：https://github.com/RT15548/LittleWhiteBox/issues 。",
  "",
  "你的能力范围：",
  "- 默认只读代码与资料；如果需要写入，只能写固定身份设定或工作记录，不允许改代码。",
  "- 可读取已索引的公开前端文件（LittleWhiteBox 和 SillyTavern public/scripts/*）；**这些文件是构建时的静态快照，不是用户当前实例的实时状态**。",
  "- 可执行斜杠命令工具（RunSlashCommand）；**该工具作用于用户当前真实酒馆实例，可以查询实时状态（如当前 API、模型、角色等）**。",
  "- 可读写身份设定（user/files/LittleWhiteBox_Assistant_Identity.md）；需要调整你的长期身份、习惯、语气或工作方式时，可直接读取或写入这份文件。",
  "- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，用它保存长期排查结论、你的经验教训、经常的犯错、和用户指定要你记住的事情。",
  "- 不能访问后端、数据库、未索引文件。",
  "",
  "**重要区分 - 静态快照 vs 动态实例**：",
  "- LS/Glob/Grep/Read 工具读取的是**静态代码快照**（构建时索引），用于查看源码实现、配置逻辑、模块结构。",
  "- RunSlashCommand 工具查询的是**动态运行实例**（用户当前打开的酒馆），用于获取实时状态、设置值、角色数据。",
  "- 先判断问题属于动态实例还是静态代码：动态实例优先用 RunSlashCommand；静态代码优先先看结构，做好成本控制，别乱跑乱试。优先使用 Grep，而不是对同一问题反复多次 Read；如果不确定就先用 LS 了解结构，再精准读取。",
  '- 当用户问"我的 API 是什么""我当前用的什么模型"这类实时状态时，用 RunSlashCommand；当用户问"API 设置的代码在哪""这个功能入口在哪"这类源码问题时，先结合 project-structure.md 或 LS/Glob/Grep 缩小范围，再尽量一次性读取足够的连续内容，避免太细碎的多次分段读取。若证据还不够，就继续查到足以支撑结论为止。',
  "- 索引快照可能不包含用户最新修改的代码或配置文件；如需确认用户当前实例的实际状态，必须用 RunSlashCommand。",
  "",
  uP,
  "",
  ...Kx,
  "",
  "回答要求：",
  "- 具体、可核对，热情主动，必要时引用文件路径。",
  "- 工具调用要讲效率：避免“试探性”工具调用；能先低成本定位就不要直接反复精读，但也不要因为省调用而影响准确性。",
  "- 使用 RunSlashCommand 查询真实实例状态时，可以直接执行查询类命令。",
  "- 如果 RunSlashCommand 可能创建、修改、删除、发送消息、切换状态或重载页面，必须先明确告诉用户准备执行的命令和预期结果，并在用户同意后再执行。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), cP = "[历史摘要]", dP = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`), fP = "xb-assistant-app", By = "xb-assistant-root", Oy = 18e4, hP = 64, zu = 158e3, pP = 128e3, mP = 2, gP = 1, ds = 3, yP = 4 * 1024 * 1024, vP = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], _P = 2600, bP = 1800, wP = 4200, SP = 3e3, EP = 1800, TP = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], Gy = [
  {
    value: "low",
    label: "低"
  },
  {
    value: "medium",
    label: "中"
  },
  {
    value: "high",
    label: "高"
  }
], AP = [
  {
    value: "openai-responses",
    label: "OpenAI Responses"
  },
  {
    value: "openai-compatible",
    label: "OpenAI-Compatible"
  },
  {
    value: "anthropic",
    label: "Anthropic"
  },
  {
    value: "google",
    label: "Google AI"
  }
], L = {
  config: null,
  configDraft: null,
  runtime: null,
  pendingApproval: null,
  messages: [],
  historySummary: "",
  archivedTurnCount: 0,
  contextStats: {
    usedTokens: 0,
    budgetTokens: zu,
    summaryActive: !1
  },
  isBusy: !1,
  currentRound: 0,
  progressLabel: "",
  activeRun: null,
  autoScroll: !0,
  toast: "",
  modelOptionsByProvider: {},
  pullStateByProvider: {},
  draftAttachments: [],
  sidebarCollapsed: !0,
  configFormSyncPending: !0,
  configSave: {
    status: "idle",
    requestId: "",
    error: ""
  }
}, Gl = /* @__PURE__ */ new Map(), qy = /* @__PURE__ */ new Map(), mo = null, Lr = null, Zt = null, En = null;
function Pi(e, t = {}) {
  parent.postMessage({
    source: fP,
    type: e,
    payload: t
  }, window.location.origin);
}
function Us(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function Vy(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
var Fs = null;
function Uo() {
  return Fs?.persistSession();
}
function CP() {
  return Fs?.clearSession();
}
function xP() {
  return Fs?.restoreSession();
}
function IP() {
  if (Lr !== null) return Lr;
  try {
    Lr = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    Lr = {};
  }
  return Lr;
}
function RP() {
  return ["mobile", "tablet"].includes(IP()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function PP(e, t) {
  !L.pendingApproval || L.pendingApproval.id !== e || (L.pendingApproval = {
    ...L.pendingApproval,
    status: t
  }, we());
}
function MP(e, t) {
  return t ? {
    ok: !0,
    command: e,
    note: "用户已同意执行该斜杠命令。"
  } : {
    ok: !1,
    command: e,
    skipped: !0,
    error: "user_declined",
    note: "用户未同意执行该斜杠命令，本次已跳过。"
  };
}
function NP(e) {
  return Gy.some((t) => t.value === e) ? e : "medium";
}
function Yu(e) {
  if (!Array.isArray(e)) return [];
  const t = /* @__PURE__ */ new Set();
  return e.map((n) => {
    if (!n || typeof n != "object") return null;
    const r = String(n.text || "").trim();
    return r ? {
      label: String(n.label || "思考块").trim() || "思考块",
      text: r
    } : null;
  }).filter(Boolean).filter((n) => {
    const r = `${n.label}\0${n.text}`;
    return t.has(r) ? !1 : (t.add(r), !0);
  });
}
function xn(e) {
  if (L.toast = String(e || "").trim(), mo && clearTimeout(mo), !L.toast) {
    we();
    return;
  }
  const t = Math.max(bP, Math.min(wP, _P + L.toast.length * 18));
  mo = setTimeout(() => {
    mo = null, L.toast = "", we();
  }, t), we();
}
function kP() {
  Zt && (clearTimeout(Zt), Zt = null), En && (clearTimeout(En), En = null);
}
function Hy(e = EP) {
  En && clearTimeout(En), En = setTimeout(() => {
    En = null, L.configSave = {
      status: "idle",
      requestId: "",
      error: ""
    }, we();
  }, e);
}
function DP(e) {
  kP(), L.configSave = {
    status: "saving",
    requestId: e,
    error: ""
  }, Zt = setTimeout(() => {
    Zt = null, !(L.configSave.requestId !== e || L.configSave.status !== "saving") && (L.configSave = {
      status: "error",
      requestId: e,
      error: "保存超时，请重试"
    }, we(), Hy());
  }, SP), we();
}
function Th(e, { ok: t, error: n = "" } = {}) {
  e && L.configSave.requestId && L.configSave.requestId !== e || (Zt && (clearTimeout(Zt), Zt = null), L.configSave = {
    status: t ? "success" : "error",
    requestId: e || L.configSave.requestId || "",
    error: t ? "" : String(n || "保存失败")
  }, we(), Hy());
}
function Ky() {
  L.configFormSyncPending = !0;
}
function Xu(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function LP(e) {
  return AP.find((t) => t.value === e)?.label || e;
}
function $P(e) {
  return L.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function UP(e, t) {
  L.pullStateByProvider = {
    ...L.pullStateByProvider,
    [e]: t
  };
}
function FP(e, t) {
  L.modelOptionsByProvider = {
    ...L.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function BP(e) {
  return Array.isArray(L.modelOptionsByProvider[e]) ? L.modelOptionsByProvider[e] : [];
}
var { normalizeAttachments: Bs, buildTextWithAttachmentSummary: OP, buildUserContentParts: GP, appendDraftImageFiles: Ah, renderAttachmentGallery: Wy } = XR({
  state: L,
  showToast: xn,
  render: we,
  acceptedImageMimeTypes: vP,
  maxImageAttachments: ds,
  maxImageFileBytes: yP
});
function Qu(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : Xu(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
var { getActiveProviderConfig: Jy, syncConfigToForm: qP, bindSettingsPanelEvents: VP } = aP({
  state: L,
  post: Pi,
  render: we,
  showToast: xn,
  beginConfigSave: DP,
  requestConfigFormSync: Ky,
  createRequestId: Us,
  describeError: Qu,
  getPullState: $P,
  setPullState: UP,
  setProviderModels: FP,
  getProviderModels: BP,
  getProviderLabel: LP,
  normalizeReasoningEffort: NP,
  normalizeAssistantConfig: ay,
  normalizePresetName: ci,
  buildDefaultPreset: Cu,
  cloneDefaultModelConfigs: Au,
  defaultPresetName: sy,
  requestTimeoutMs: Oy,
  toolModeOptions: TP,
  reasoningEffortOptions: Gy
}), { renderMessages: HP, renderApprovalPanel: KP, scrollChatToBottom: zy, scrollChatToTop: WP, updateChatScrollButtonsVisibility: Yy, handleAssistantChatScroll: JP } = lP({
  state: L,
  toolNames: ge,
  formatToolResultDisplay: iy,
  normalizeThoughtBlocks: Yu,
  normalizeAttachments: Bs,
  renderAttachmentGallery: Wy
});
function zP() {
  const e = Jy();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new rb(e);
    case "anthropic":
      return new rw(e);
    case "google":
      return new Hx(e);
    default:
      return new W_(e);
  }
}
function YP() {
  return [Fy, String(L.runtime?.identityContent || "").trim()].filter(Boolean).join(`

`);
}
var { resetCompactionState: XP, buildContextMeterLabel: QP, updateContextStats: ZP, pushMessage: Pa, cancelActiveRun: jP, toProviderMessages: eM, getActiveContextMessages: Xy, runAssistantLoop: tM } = Zx({
  state: L,
  pendingToolCalls: Gl,
  pendingApprovals: qy,
  persistSession: Uo,
  render: we,
  showToast: xn,
  post: Pi,
  createRequestId: Us,
  safeJsonParse: Vy,
  describeError: Qu,
  describeToolCall: zx,
  formatToolResultDisplay: iy,
  buildTextWithAttachmentSummary: OP,
  buildUserContentParts: GP,
  normalizeAttachments: Bs,
  normalizeThoughtBlocks: Yu,
  normalizeSlashCommand: xu,
  shouldRequireSlashCommandApproval: uI,
  setApprovalStatus: PP,
  buildSlashApprovalResult: MP,
  isAbortError: Xu,
  createAdapter: zP,
  getActiveProviderConfig: Jy,
  getSystemPrompt: YP,
  SYSTEM_PROMPT: Fy,
  SUMMARY_SYSTEM_PROMPT: dP,
  HISTORY_SUMMARY_PREFIX: cP,
  MAX_CONTEXT_TOKENS: zu,
  SUMMARY_TRIGGER_TOKENS: pP,
  DEFAULT_PRESERVED_TURNS: mP,
  MIN_PRESERVED_TURNS: gP,
  MAX_TOOL_ROUNDS: hP,
  REQUEST_TIMEOUT_MS: Oy,
  TOOL_DEFINITIONS: Wx,
  TOOL_NAMES: ge
});
Fs = YR({
  state: L,
  safeJsonParse: Vy,
  createRequestId: Us,
  normalizeAttachments: Bs,
  normalizeThoughtBlocks: Yu,
  getActiveContextMessages: Xy
});
function Ma(e) {
  L.config = ay(e || {}), L.configDraft = null, Ky(), we();
}
function nM(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((r) => {
    n.appendChild(document.importNode(r, !0));
  }), n;
}
function rM(e) {
  const t = `
        <div class="xb-assistant-shell ${L.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${L.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${L.sidebarCollapsed ? "false" : "true"}" aria-label="${L.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${L.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${L.sidebarCollapsed ? "hidden" : ""}>
                    <div class="xb-assistant-brand">
                    </div>
                    <section class="xb-assistant-config">
                    <label>
                        <span>已存预设</span>
                        <select id="xb-assistant-preset-select"></select>
                    </label>
                    <label>
                        <span>预设名称</span>
                        <input id="xb-assistant-preset-name" type="text" placeholder="例如：OpenAI 测试号" />
                    </label>
                    <label>
                        <span>Provider</span>
                        <select id="xb-assistant-provider">
                            <option value="openai-responses">OpenAI Responses</option>
                            <option value="openai-compatible">OpenAI-compatible</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="google">Google AI</option>
                        </select>
                    </label>
                    <label>
                        <span>Base URL</span>
                        <input id="xb-assistant-base-url" type="text" />
                    </label>
                    <label>
                        <span>API Key</span>
                        <div class="xb-assistant-inline-input">
                            <input id="xb-assistant-api-key" type="password" />
                            <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                        </div>
                    </label>
                    <label>
                        <span>Model</span>
                        <input id="xb-assistant-model" type="text" />
                    </label>
                    <div class="xb-assistant-inline-input xb-assistant-model-row">
                        <label class="xb-assistant-grow">
                            <span>已拉取模型</span>
                            <select id="xb-assistant-model-pulled">
                                <option value="">手动填写</option>
                            </select>
                        </label>
                        <button id="xb-assistant-pull-models" type="button" class="secondary">拉取模型</button>
                    </div>
                    <label id="xb-assistant-tool-mode-wrap">
                        <span>Tool 调用格式</span>
                        <select id="xb-assistant-tool-mode"></select>
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>思考模式</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-reasoning-enabled" type="checkbox" />
                            <span>开启</span>
                        </span>
                    </label>
                    <label id="xb-assistant-reasoning-effort-wrap">
                        <span>思考强度</span>
                        <select id="xb-assistant-reasoning-effort"></select>
                    </label>
                    <div class="xb-assistant-actions">
                        <button id="xb-assistant-save" type="button">保存配置</button>
                        <button id="xb-assistant-delete-preset" type="button" class="secondary">删除配置</button>
                    </div>
                    <div class="xb-assistant-runtime" id="xb-assistant-runtime"></div>
                    <div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite"></div>
                    </section>
                </div>
            </aside>
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" ${L.sidebarCollapsed ? "hidden" : ""}></div>
            <main class="xb-assistant-main">
                <div class="xb-assistant-mobile-topbar">
                    <section class="xb-assistant-toolbar">
                        <div class="xb-assistant-toolbar-cluster">
                            <div class="xb-assistant-status" id="xb-assistant-status"></div>
                            <div class="xb-assistant-context-meter" id="xb-assistant-context-meter" title="当前实际送模上下文 / 最大上下文"></div>
                            <button id="xb-assistant-clear" type="button" class="secondary ghost">清空对话</button>
                        </div>
                        <button id="xb-assistant-mobile-settings" type="button" class="secondary ghost xb-assistant-mobile-settings">设置</button>
                    </section>
                    <button id="xb-assistant-mobile-close" type="button" class="xb-assistant-mobile-close" hidden>关闭</button>
                </div>
                <section class="xb-assistant-chat-wrap">
                    <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                    <div class="xb-assistant-scroll-helpers" id="xb-assistant-scroll-helpers">
                        <button id="xb-assistant-scroll-top" type="button" class="xb-assistant-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                        <button id="xb-assistant-scroll-bottom" type="button" class="xb-assistant-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                    </div>
                </section>
                <section class="xb-assistant-approval-slot" id="xb-assistant-approval-slot"></section>
                <form class="xb-assistant-compose" id="xb-assistant-form">
                    <div class="xb-assistant-compose-main">
                        <textarea id="xb-assistant-input" placeholder=""></textarea>
                        <input id="xb-assistant-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden />
                        <div class="xb-assistant-attachment-gallery xb-assistant-draft-gallery" id="xb-assistant-draft-gallery" style="display:none;"></div>
                    </div>
                    <div class="xb-assistant-compose-actions">
                        <button id="xb-assistant-add-image" type="button" class="secondary ghost">发图</button>
                        <button id="xb-assistant-send" type="submit">发送</button>
                    </div>
                </form>
            </main>
        </div>
    `;
  e.replaceChildren(nM(t));
}
function Qy() {
  const e = document.createElement("style");
  e.textContent = `
        :root { color-scheme: light; font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 223, 178, 0.72), transparent 34%),
                radial-gradient(circle at top right, rgba(154, 210, 255, 0.58), transparent 28%),
                linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
            color: #142033;
            overflow-x: hidden;
        }
        #${By} { width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; }
        .xb-assistant-shell {
            position: relative;
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            transition: grid-template-columns 0.22s ease;
        }
        .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 56px minmax(0, 1fr); }
        .xb-assistant-sidebar {
            position: relative;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            padding: 24px 20px;
            background: rgba(255, 255, 255, 0.82);
            border-right: 1px solid rgba(20, 32, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: hidden;
            box-sizing: border-box;
            transition: padding 0.22s ease;
        }
        .xb-assistant-mobile-settings,
        .xb-assistant-mobile-close,
        .xb-assistant-mobile-backdrop {
            display: none;
        }
        .xb-assistant-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .xb-assistant-sidebar.is-collapsed {
            padding: 14px 10px;
            overflow: hidden;
        }
        .xb-assistant-sidebar-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 36px;
            padding: 0 10px;
            border: none;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.88);
            color: #fff6e9;
            cursor: pointer;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }
        .xb-assistant-sidebar-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(17, 31, 51, 0.16);
        }
        .xb-assistant-sidebar-toggle-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
        }
        .xb-assistant-sidebar-toggle-text {
            display: none;
            font-size: 13px;
            font-weight: 600;
            line-height: 1;
        }
        .xb-assistant-sidebar-content {
            display: grid;
            gap: 16px;
            margin-top: 16px;
            min-width: 0;
            min-height: 0;
            overflow: auto;
            opacity: 1;
            transition: opacity 0.18s ease;
        }
        .xb-assistant-sidebar-content[hidden] {
            display: none !important;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
            opacity: 0;
            pointer-events: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
        .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-badge {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-header {
            justify-content: center;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-toggle {
            width: 36px;
            min-width: 36px;
            height: 36px;
            padding: 0;
        }
        .xb-assistant-brand h1 { margin: 12px 0 8px; font-size: 30px; }
        .xb-assistant-brand p { margin: 0 0 18px; color: #4b5a70; line-height: 1.55; }
        .xb-assistant-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            background: #142033;
            color: #fff6e9;
            font-size: 13px;
            letter-spacing: 0.08em;
        }
        .xb-assistant-config { display: grid; gap: 12px; }
        .xb-assistant-config label { display: grid; gap: 6px; font-size: 13px; color: #41526a; }
        .xb-assistant-config input,
        .xb-assistant-config select,
        .xb-assistant-compose textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 14px;
            padding: 12px 14px;
            font: inherit;
            background: rgba(255, 255, 255, 0.9);
        }
        .xb-assistant-inline-input {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-assistant-grow { min-width: 0; }
        .xb-assistant-model-row { align-items: end; }
        .xb-assistant-checkbox-row {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
        }
        .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #1b3758;
            font-size: 14px;
        }
        .xb-assistant-help {
            margin-top: -2px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(27, 55, 88, 0.05);
            color: #52637a;
            font-size: 12px;
            line-height: 1.65;
        }
        .xb-assistant-help code {
            padding: 0.08em 0.34em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
        }
        .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: #1b3758;
        }
        .xb-assistant-actions,
        .xb-assistant-toolbar {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: flex-start;
        }
        .xb-assistant-actions {
            gap: 8px;
            flex-wrap: wrap;
        }
        .xb-assistant-toolbar-cluster {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            flex: 1 1 auto;
            min-width: 0;
        }
        .xb-assistant-actions button,
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 999px;
            min-height: 40px;
            padding: 0 16px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
            box-shadow: 0 10px 24px rgba(27, 55, 88, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-save-button.is-saving,
        .xb-assistant-save-button.is-success,
        .xb-assistant-save-button.is-error {
            pointer-events: none;
        }
        .xb-assistant-save-button.is-saving {
            opacity: 0.86;
        }
        .xb-assistant-save-button.is-success {
            background: #3fb950;
            color: #fff;
            box-shadow: 0 14px 28px rgba(63, 185, 80, 0.22);
        }
        .xb-assistant-save-button.is-error {
            background: #f85149;
            color: #fff;
            box-shadow: 0 14px 28px rgba(248, 81, 73, 0.22);
        }
        .xb-assistant-save-button .xb-assistant-save-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            margin-right: 8px;
            border-radius: 999px;
            border: 2px solid currentColor;
            border-right-color: transparent;
            vertical-align: -2px;
            animation: xb-assistant-spin 0.85s linear infinite;
        }
        .xb-assistant-actions button:hover,
        .xb-assistant-toolbar button:hover,
        .xb-assistant-compose button:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(27, 55, 88, 0.16);
        }
        .xb-assistant-actions button.secondary,
        .xb-assistant-toolbar button.secondary,
        .xb-assistant-compose button.secondary {
            background: rgba(255, 255, 255, 0.9);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-actions button.ghost,
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-compose button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 14px;
            background: rgba(255, 255, 255, 0.74);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-actions button:disabled,
        .xb-assistant-toolbar button:disabled,
        .xb-assistant-compose button:disabled {
            opacity: 0.52;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .xb-assistant-runtime {
            font-size: 12px;
            color: #5a6a81;
            min-height: 18px;
            line-height: 1.6;
        }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto;
            padding: 20px;
            gap: 16px;
            min-height: 0;
            height: 100%;
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }
        .xb-assistant-status {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.84);
            color: #41526a;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.06);
        }
        .xb-assistant-context-meter {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(27, 55, 88, 0.09);
            color: #1b3758;
            font-size: 12px;
            font-weight: 600;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-context-meter.summary-active {
            background: rgba(201, 107, 51, 0.12);
            color: #8d442b;
            box-shadow: inset 0 0 0 1px rgba(201, 107, 51, 0.18);
        }
        .xb-assistant-chat-wrap {
            position: relative;
            display: flex;
            min-height: 0;
            height: 100%;
            overflow: hidden;
        }
        .xb-assistant-status.busy::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 8px;
            border-radius: 999px;
            background: #c96b33;
            box-shadow: 0 0 0 rgba(201, 107, 51, 0.35);
            animation: xb-assistant-pulse 1.2s ease infinite;
            vertical-align: middle;
        }
        .xb-assistant-chat {
            flex: 1 1 auto;
            height: 100%;
            min-height: 0;
            overflow: auto;
            overflow-x: hidden;
            padding: 4px;
            display: grid;
            gap: 12px;
            align-content: start;
            justify-items: start;
            grid-auto-rows: max-content;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            overscroll-behavior: contain;
        }
        .xb-assistant-scroll-helpers {
            position: absolute;
            top: 12%;
            right: 10px;
            bottom: 12%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .xb-assistant-scroll-helpers.active {
            opacity: 1;
        }
        .xb-assistant-scroll-btn {
            width: 32px;
            height: 32px;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 999px;
            background: rgba(244, 248, 252, 0.92);
            color: #1b3758;
            cursor: pointer;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8) translateX(8px);
            transition: all 0.2s ease;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.08);
            font: inherit;
            font-size: 12px;
            font-weight: 700;
        }
        .xb-assistant-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        .xb-assistant-scroll-btn:hover {
            background: rgba(255, 255, 255, 0.98);
            transform: scale(1.08) translateX(0);
        }
        .xb-assistant-scroll-btn:active {
            transform: scale(0.96) translateX(0);
        }
        .xb-assistant-approval-slot {
            display: grid;
            gap: 12px;
            margin-top: 10px;
        }
        .xb-assistant-approval-slot:empty {
            display: none;
        }
        .xb-assistant-empty {
            align-self: center;
            justify-self: center;
            max-width: 720px;
            padding: 24px 28px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.82);
            box-shadow: 0 18px 48px rgba(17, 31, 51, 0.08);
        }
        .xb-assistant-empty h2 { margin: 0 0 10px; font-size: 24px; }
        .xb-assistant-empty p { margin: 0; color: #4b5a70; line-height: 1.7; }
        .xb-assistant-empty p + p { margin-top: 8px; }
        .xb-assistant-bubble {
            width: min(860px, 100%);
            max-width: 100%;
            box-sizing: border-box;
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 12px 30px rgba(17, 31, 51, 0.07);
            align-self: start;
            overflow-wrap: anywhere;
        }
        .xb-assistant-bubble.role-user {
            justify-self: end;
            background: linear-gradient(135deg, #1b3758 0%, #285786 100%);
            color: white;
        }
        .xb-assistant-bubble.role-assistant { background: rgba(255, 255, 255, 0.9); }
        .xb-assistant-bubble.role-assistant.is-tool-call {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        .xb-assistant-bubble.role-tool {
            background: transparent;
            border: 1px dashed rgba(27, 55, 88, 0.18);
        }
        .xb-assistant-meta { margin-bottom: 6px; font-size: 12px; opacity: 0.78; }
        .xb-assistant-bubble.is-tool-call .xb-assistant-meta { margin-bottom: 0; }
        .xb-assistant-content { margin: 0; white-space: pre-wrap; word-break: break-word; font: inherit; }
        .xb-assistant-markdown {
            white-space: normal;
            line-height: 1.7;
        }
        .xb-assistant-markdown > *:first-child { margin-top: 0; }
        .xb-assistant-markdown > *:last-child { margin-bottom: 0; }
        .xb-assistant-markdown p,
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol,
        .xb-assistant-markdown pre,
        .xb-assistant-markdown blockquote,
        .xb-assistant-markdown table,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            margin: 0 0 0.8em;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.38em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 0.95em;
        }
        .xb-assistant-markdown pre {
            overflow: visible;
            max-width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.06);
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-all;
        }
        .xb-assistant-codeblock {
            position: relative;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.14);
            color: #36567b;
            cursor: pointer;
            font: 600 12px/1 "Segoe UI Emoji", "Apple Color Emoji", sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy:hover {
            background: rgba(20, 32, 51, 0.22);
            opacity: 1;
        }
        .xb-assistant-codeblock pre {
            padding-top: 34px;
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 12px;
            border-left: 3px solid rgba(27, 55, 88, 0.24);
            color: #4b5a70;
        }
        .xb-assistant-markdown a {
            color: #285786;
            text-decoration: underline;
        }
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol {
            padding-left: 1.4em;
        }
        .xb-assistant-attachment-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
        }
        .xb-assistant-attachment-card {
            position: relative;
            width: 132px;
            padding: 8px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-attachment-card.compact {
            background: rgba(255, 255, 255, 0.18);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
        }
        .xb-assistant-attachment-image,
        .xb-assistant-attachment-placeholder {
            width: 100%;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            background: rgba(20, 32, 51, 0.08);
        }
        .xb-assistant-attachment-placeholder {
            display: grid;
            place-items: center;
            color: #41526a;
            font-size: 13px;
        }
        .xb-assistant-attachment-name {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.4;
            word-break: break-word;
        }
        .xb-assistant-attachment-remove {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 999px;
            background: rgba(20, 32, 51, 0.72);
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-approval {
            margin-top: 12px;
            padding: 14px;
            border-radius: 14px;
            background: rgba(244, 248, 252, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-approval-title {
            margin-bottom: 8px;
            color: #1b3758;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-assistant-approval-command {
            margin-top: 0;
            margin-bottom: 8px;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-approval-note {
            color: #4b5a70;
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-assistant-approval-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .xb-assistant-approval-button {
            border: none;
            border-radius: 999px;
            min-height: 36px;
            padding: 0 14px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
        }
        .xb-assistant-approval-button.secondary {
            background: rgba(255, 255, 255, 0.92);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-thought-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-thought-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-tool-details summary::marker,
        .xb-assistant-tool-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-thought-details summary::marker,
        .xb-assistant-thought-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-tool-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-tool-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-thought-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-content.tool-detail {
            margin-top: 10px;
            line-height: 1.6;
            max-height: calc(1.6em * 3 + 24px);
            overflow: hidden;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 12px;
            padding: 12px;
        }
        .xb-assistant-content.tool-summary {
            max-height: calc(1.6em + 2px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .xb-assistant-tool-details[open] .xb-assistant-content.tool-detail {
            max-height: none;
            overflow: auto;
        }
        .xb-assistant-thought-block + .xb-assistant-thought-block {
            margin-top: 12px;
        }
        .xb-assistant-thought-label {
            margin-top: 10px;
            margin-bottom: 8px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-content {
            margin-top: 0;
            padding: 12px;
            border-radius: 12px;
            background: rgba(245, 247, 250, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.1);
            line-height: 1.65;
        }
        .xb-assistant-compose {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
            align-items: end;
            background: rgba(255, 255, 255, 0.78);
            border-radius: 22px;
            padding: 14px;
            box-shadow: 0 16px 40px rgba(17, 31, 51, 0.08);
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            min-height: 0;
            overflow: hidden;
        }
        .xb-assistant-compose-main {
            min-width: 0;
            max-width: 100%;
        }
        .xb-assistant-compose-actions {
            display: grid;
            gap: 8px;
        }
        .xb-assistant-compose textarea { min-height: 60px; resize: vertical; max-width: 100%; overflow-x: hidden; }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 22px;
            color: #36567b;
            font-size: 12px;
            font-weight: 600;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .xb-assistant-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .xb-assistant-toast-inline {
            padding: 4px 2px 0;
        }
        @keyframes xb-assistant-pulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0.35); }
            70% { box-shadow: 0 0 0 8px rgba(201, 107, 51, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0); }
        }
        @keyframes xb-assistant-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
            .xb-assistant-shell {
                grid-template-columns: minmax(0, 1fr);
                grid-template-rows: minmax(0, 1fr);
                height: 100%;
            }
            .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 1fr; }
            .xb-assistant-sidebar {
                position: absolute;
                inset: 12px;
                z-index: 30;
                padding: 16px;
                grid-template-rows: auto minmax(0, 1fr);
                border: 1px solid rgba(20, 32, 51, 0.08);
                border-radius: 24px;
                box-shadow: 0 24px 60px rgba(17, 31, 51, 0.16);
                max-height: none;
                overflow: hidden;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .xb-assistant-sidebar.is-collapsed {
                padding: 16px;
                opacity: 0;
                transform: translateY(10px);
                pointer-events: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
                opacity: 0;
                pointer-events: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
            .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
                display: none;
            }
            .xb-assistant-sidebar-toggle {
                min-width: 116px;
                padding: 8px 14px;
                justify-content: space-between;
                background: linear-gradient(135deg, rgba(27, 55, 88, 0.92), rgba(40, 87, 134, 0.92));
                font-size: 14px;
            }
            .xb-assistant-mobile-backdrop {
                display: block;
                position: absolute;
                inset: 0;
                z-index: 20;
                background: rgba(15, 23, 35, 0.24);
                backdrop-filter: blur(4px);
            }
            .xb-assistant-mobile-backdrop[hidden] {
                display: none;
            }
            .xb-assistant-mobile-settings {
                display: inline-flex;
                flex: 0 0 auto;
            }
            .xb-assistant-sidebar-content {
                padding-right: 2px;
            }
            .xb-assistant-sidebar-toggle-text {
                display: inline-flex;
                align-items: center;
            }
            .xb-assistant-mobile-topbar {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                align-items: stretch;
                gap: 8px;
            }
            .xb-assistant-main {
                padding: 12px;
                min-height: 0;
                height: 100%;
                gap: 12px;
            }
            .xb-assistant-mobile-close {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 56px;
                min-height: 36px;
                padding: 0 14px;
                border: 1px solid rgba(20, 32, 51, 0.14);
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.88);
                color: #203249;
                box-shadow: 0 8px 18px rgba(17, 31, 51, 0.10);
                white-space: nowrap;
            }
            .xb-assistant-compose {
                grid-template-columns: 1fr;
                padding: 12px;
                padding-bottom: calc(12px + env(safe-area-inset-bottom));
            }
            .xb-assistant-compose-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .xb-assistant-toolbar {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                align-items: stretch;
                gap: 8px;
            }
            .xb-assistant-toolbar-cluster {
                display: contents;
            }
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
            .xb-assistant-status,
            .xb-assistant-context-meter,
            .xb-assistant-toolbar button {
                display: flex;
                align-items: center;
                min-width: 0;
                justify-content: center;
                padding-inline: 8px;
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .xb-assistant-chat { padding-inline: 0; min-height: 0; }
            .xb-assistant-bubble { width: 100%; }
            .xb-assistant-empty {
                width: 100%;
                padding: 18px;
                box-sizing: border-box;
            }
            .xb-assistant-scroll-helpers {
                right: 6px;
                top: 14%;
                bottom: calc(14% + env(safe-area-inset-bottom));
            }
            .xb-assistant-scroll-btn {
                width: 28px;
                height: 28px;
                font-size: 11px;
            }
            .xb-assistant-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .xb-assistant-compose textarea {
                min-height: 60px;
                max-height: min(200px, 32vh);
                resize: none;
                overflow-y: auto;
            }
        }
    `, document.head.appendChild(e);
}
function we() {
  const e = document.getElementById(By);
  if (!e) return;
  e.firstChild || (rM(e), iM(e)), L.configFormSyncPending && (qP(e), L.configFormSyncPending = !1), ZP(eM(Xy()));
  const t = e.querySelector("#xb-assistant-chat"), n = e.querySelector("#xb-assistant-approval-slot");
  HP(t), KP(n), L.autoScroll && zy(t), Yy(e);
  const r = e.querySelector("#xb-assistant-send");
  r.disabled = !1, r.classList.toggle("is-busy", L.isBusy), r.textContent = L.isBusy ? "终止" : "发送";
  const i = e.querySelector("#xb-assistant-add-image");
  i.disabled = L.isBusy || L.draftAttachments.length >= ds, i.textContent = L.draftAttachments.length ? `发图（${L.draftAttachments.length}/${ds}）` : "发图";
  const o = e.querySelector("#xb-assistant-clear");
  o.disabled = L.isBusy || !L.messages.length, o.textContent = window.matchMedia("(max-width: 900px)").matches ? "清空" : "清空对话";
  const s = e.querySelector("#xb-assistant-delete-preset");
  s.disabled = L.isBusy || (L.config?.presetNames || []).length <= 1;
  const u = e.querySelector("#xb-assistant-save"), c = L.configSave.status;
  u.classList.add("xb-assistant-save-button"), u.classList.toggle("is-saving", c === "saving"), u.classList.toggle("is-success", c === "success"), u.classList.toggle("is-error", c === "error"), u.disabled = L.isBusy || c === "saving", c === "saving" ? (u.innerHTML = '<span class="xb-assistant-save-spinner" aria-hidden="true"></span>保存中...', u.title = "正在保存配置") : c === "success" ? (u.textContent = "已保存", u.title = "配置已保存") : c === "error" ? (u.textContent = "保存失败", u.title = L.configSave.error || "保存失败") : (u.textContent = "保存配置", u.title = "保存配置");
  const d = e.querySelector("#xb-assistant-pull-models");
  d.disabled = L.isBusy;
  const h = e.querySelector("#xb-assistant-status");
  h.textContent = L.progressLabel || "就绪", h.classList.toggle("busy", L.isBusy);
  const f = e.querySelector("#xb-assistant-context-meter");
  f.textContent = QP(), f.classList.toggle("summary-active", !!L.contextStats.summaryActive);
  const p = `${Math.round(zu / 1e3)}k`;
  f.title = L.contextStats.summaryActive ? `当前实际送模上下文 / ${p}（已压缩较早历史）` : `当前实际送模上下文 / ${p}`;
  const m = e.querySelector("#xb-assistant-toast");
  m.textContent = L.toast || "", m.classList.toggle("visible", !!L.toast);
  const g = e.querySelector(".xb-assistant-shell"), y = e.querySelector(".xb-assistant-sidebar"), v = e.querySelector("#xb-assistant-sidebar-toggle"), b = e.querySelector(".xb-assistant-sidebar-content"), _ = e.querySelector("#xb-assistant-mobile-settings"), w = e.querySelector("#xb-assistant-mobile-close"), E = e.querySelector("#xb-assistant-mobile-backdrop"), A = window.matchMedia("(max-width: 900px)").matches;
  if (g?.classList.toggle("sidebar-collapsed", !!L.sidebarCollapsed), y?.classList.toggle("is-collapsed", !!L.sidebarCollapsed), b?.toggleAttribute("hidden", !!L.sidebarCollapsed), E?.toggleAttribute("hidden", !A || !!L.sidebarCollapsed), _?.toggleAttribute("hidden", !A), w?.toggleAttribute("hidden", !A), v) {
    v.setAttribute("aria-expanded", L.sidebarCollapsed ? "false" : "true"), v.setAttribute("aria-label", L.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), v.title = L.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const I = v.querySelector(".xb-assistant-sidebar-toggle-text"), C = v.querySelector(".xb-assistant-sidebar-toggle-icon");
    I && (I.textContent = A ? L.sidebarCollapsed ? "展开设置" : "收起设置" : ""), C && (C.textContent = A ? L.sidebarCollapsed ? "▼" : "▲" : L.sidebarCollapsed ? "⚙" : "‹");
  }
  _ && (_.textContent = L.sidebarCollapsed ? "设置" : "关闭设置", _.setAttribute("aria-expanded", L.sidebarCollapsed ? "false" : "true"), _.title = L.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), w && (w.textContent = "关闭", w.title = "关闭小白助手"), Wy(e.querySelector("#xb-assistant-draft-gallery"), L.draftAttachments, { onRemove: (I) => {
    L.draftAttachments = L.draftAttachments.filter((C, P) => P !== I), we();
  } });
  const S = e.querySelector("#xb-assistant-toggle-key");
  S.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function iM(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), r = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 60), 200)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    L.sidebarCollapsed = !L.sidebarCollapsed, Uo(), we();
  }), e.querySelector("#xb-assistant-mobile-settings")?.addEventListener("click", () => {
    L.sidebarCollapsed = !L.sidebarCollapsed, Uo(), we();
  }), e.querySelector("#xb-assistant-mobile-close")?.addEventListener("click", () => {
    Pi("xb-assistant:close");
  }), e.querySelector("#xb-assistant-mobile-backdrop")?.addEventListener("click", () => {
    L.sidebarCollapsed || (L.sidebarCollapsed = !0, Uo(), we());
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (o) => {
    const s = o.currentTarget;
    L.autoScroll = s.scrollHeight - s.scrollTop - s.clientHeight <= 48, JP(e);
  });
  const i = (o) => {
    const s = o.target.closest("[data-approval-id][data-approval-decision]");
    if (!s) return;
    const u = s.dataset.approvalId || "", c = s.dataset.approvalDecision || "", d = qy.get(u);
    d && (c === "approve" ? d.resolve(!0) : d.resolve(!1), we());
  };
  e.querySelector("#xb-assistant-chat").addEventListener("click", i), e.querySelector("#xb-assistant-approval-slot")?.addEventListener("click", i), VP(e), e.querySelector("#xb-assistant-clear").addEventListener("click", async () => {
    L.isBusy || (L.messages = [], L.draftAttachments = [], L.historySummary = "", L.archivedTurnCount = 0, L.pendingApproval = null, XP(), await CP(), xn("对话已清空"), we());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    L.isBusy || L.draftAttachments.length >= ds || n.click();
  }), e.querySelector("#xb-assistant-scroll-top").addEventListener("click", () => {
    L.autoScroll = !1, WP(e.querySelector("#xb-assistant-chat"));
  }), e.querySelector("#xb-assistant-scroll-bottom").addEventListener("click", () => {
    L.autoScroll = !0, zy(e.querySelector("#xb-assistant-chat")), Yy(e);
  }), n.addEventListener("change", async (o) => {
    const s = Array.from(o.currentTarget.files || []);
    if (s.length)
      try {
        await Ah(s);
      } finally {
        o.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (o) => {
    if (L.isBusy) return;
    const s = Array.from(o.clipboardData?.items || []);
    if (!s.length) return;
    const u = s.filter((c) => c.kind === "file" && String(c.type || "").startsWith("image/")).map((c) => c.getAsFile()).filter(Boolean);
    u.length && (o.preventDefault(), await Ah(u));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (o) => {
    if (o.preventDefault(), L.isBusy) {
      jP("本轮请求已终止。");
      return;
    }
    const s = t.value.trim(), u = Bs(L.draftAttachments);
    if (!s && !u.length) return;
    Pa({
      role: "user",
      content: s,
      attachments: u
    }), t.value = "", L.draftAttachments = [], r(), we();
    const c = {
      id: Us("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: "",
      lightBrakeMessage: "",
      lastLightBrakeKey: "",
      toolErrorStreakKey: "",
      toolErrorStreakCount: 0
    };
    L.activeRun = c, L.isBusy = !0, L.currentRound = 0, L.progressLabel = "生成中", L.autoScroll = !0, we();
    try {
      await tM(c);
    } catch (d) {
      Xu(d) ? c.cancelNotice && Pa({
        role: "assistant",
        content: c.cancelNotice
      }) : Pa({
        role: "assistant",
        content: Qu(d)
      });
    } finally {
      L.activeRun?.id === c.id && (L.activeRun = null), L.isBusy = !1, L.currentRound = 0, L.progressLabel = "", we();
    }
  }), t.addEventListener("input", r), t.addEventListener("keydown", (o) => {
    const s = !RP();
    if (!o.isComposing && !o.shiftKey && !o.ctrlKey && !o.altKey && !o.metaKey && o.key === "Enter" && s) {
      o.preventDefault();
      const u = e.querySelector("#xb-assistant-form");
      if (typeof u?.requestSubmit == "function") {
        u.requestSubmit();
        return;
      }
      u?.dispatchEvent(new Event("submit", {
        cancelable: !0,
        bubbles: !0
      }));
    }
  }), r();
}
window.addEventListener("message", (e) => {
  if (e.origin !== window.location.origin || e.source !== parent) return;
  const t = e.data || {};
  if (t.type === "xb-assistant:config") {
    L.runtime = t.payload?.runtime || null, Ma(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Ma(t.payload?.config || {}), Th(t.payload?.requestId || "", { ok: !0 }), xn("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:identity-updated") {
    L.runtime = {
      ...L.runtime || {},
      identityContent: String(t.payload?.identityContent || "").trim()
    }, xn("身份设定已更新");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Ma(t.payload?.config || {}), Th(t.payload?.requestId || "", {
      ok: !1,
      error: t.payload?.error || "网络异常"
    }), xn(`保存失败：${t.payload?.error || "网络异常"}`);
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = Gl.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = Gl.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
async function oM() {
  await xP(), Qy(), we(), Pi("xb-assistant:ready");
}
oM().catch((e) => {
  console.error("[Assistant] 启动失败:", e), Qy(), we(), Pi("xb-assistant:ready");
});
