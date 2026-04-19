var Tv = Object.create, Rp = Object.defineProperty, Av = Object.getOwnPropertyDescriptor, xv = Object.getOwnPropertyNames, Cv = Object.getPrototypeOf, Iv = Object.prototype.hasOwnProperty, gs = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Rv = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var i = xv(t), o = 0, s = i.length, u; o < s; o++)
      u = i[o], !Iv.call(e, u) && u !== n && Rp(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Av(t, u)) || r.enumerable
      });
  return e;
}, Pv = (e, t, n) => (n = e != null ? Tv(Cv(e)) : {}, Rv(t || !e || !e.__esModule ? Rp(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function oe(e, t, n, r, i) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function P(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Pp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Pp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Ma(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Na = (e) => {
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
}, te = class extends Error {
}, Ke = class ka extends te {
  constructor(t, n, r, i) {
    super(`${ka.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("x-request-id"), this.error = n;
    const o = n;
    this.code = o?.code, this.param = o?.param, this.type = o?.type;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new ys({
      message: r,
      cause: Na(n)
    });
    const o = n?.error;
    return t === 400 ? new Mp(t, o, r, i) : t === 401 ? new Np(t, o, r, i) : t === 403 ? new kp(t, o, r, i) : t === 404 ? new Dp(t, o, r, i) : t === 409 ? new Lp(t, o, r, i) : t === 422 ? new $p(t, o, r, i) : t === 429 ? new Up(t, o, r, i) : t >= 500 ? new Fp(t, o, r, i) : new ka(t, o, r, i);
  }
}, vt = class extends Ke {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, ys = class extends Ke {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Gl = class extends ys {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Mp = class extends Ke {
}, Np = class extends Ke {
}, kp = class extends Ke {
}, Dp = class extends Ke {
}, Lp = class extends Ke {
}, $p = class extends Ke {
}, Up = class extends Ke {
}, Fp = class extends Ke {
}, Bp = class extends te {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Op = class extends te {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Kr = class extends Error {
  constructor(e) {
    super(e);
  }
}, Gp = class extends Ke {
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
}, Mv = class extends te {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Nv = /^[a-z][a-z0-9+.-]*:/i, kv = (e) => Nv.test(e), je = (e) => (je = Array.isArray, je(e)), lc = je;
function qp(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function uc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Dv(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ys(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Lv = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new te(`${e} must be an integer`);
  if (t < 0) throw new te(`${e} must be a positive integer`);
  return t;
}, $v = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Ci = (e) => new Promise((t) => setTimeout(t, e)), Xn = "6.34.0", Uv = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Fv() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Bv = () => {
  const e = Fv();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xn,
    "X-Stainless-OS": dc(Deno.build.os),
    "X-Stainless-Arch": cc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xn,
    "X-Stainless-OS": dc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": cc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Ov();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Ov() {
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
var cc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", dc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), fc, Gv = () => fc ?? (fc = Bv());
function Vp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Hp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Kp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Hp({
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
function Wp(e) {
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
async function pc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var qv = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Jp = "RFC3986", zp = (e) => String(e), hc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: zp
};
var Da = (e, t) => (Da = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Da(e, t)), Mt = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Xs = 1024, Vv = (e, t, n, r, i) => {
  if (e.length === 0) return e;
  let o = e;
  if (typeof e == "symbol" ? o = Symbol.prototype.toString.call(e) : typeof e != "string" && (o = String(e)), n === "iso-8859-1") return escape(o).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < o.length; u += Xs) {
    const c = o.length >= Xs ? o.slice(u, u + Xs) : o, d = [];
    for (let p = 0; p < c.length; ++p) {
      let f = c.charCodeAt(p);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || i === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(p);
        continue;
      }
      if (f < 128) {
        d[d.length] = Mt[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Mt[192 | f >> 6] + Mt[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Mt[224 | f >> 12] + Mt[128 | f >> 6 & 63] + Mt[128 | f & 63];
        continue;
      }
      p += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(p) & 1023), d[d.length] = Mt[240 | f >> 18] + Mt[128 | f >> 12 & 63] + Mt[128 | f >> 6 & 63] + Mt[128 | f & 63];
    }
    s += d.join("");
  }
  return s;
};
function Hv(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function mc(e, t) {
  if (je(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Yp = {
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
}, Xp = function(e, t) {
  Array.prototype.push.apply(e, je(t) ? t : [t]);
}, gc, Le = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Vv,
  encodeValuesOnly: !1,
  format: Jp,
  formatter: zp,
  indices: !1,
  serializeDate(e) {
    return (gc ?? (gc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Kv(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Qs = {};
function Qp(e, t, n, r, i, o, s, u, c, d, p, f, h, m, g, y, v, b) {
  let _ = e, w = b, E = 0, T = !1;
  for (; (w = w.get(Qs)) !== void 0 && !T; ) {
    const $ = w.get(e);
    if (E += 1, typeof $ < "u") {
      if ($ === E) throw new RangeError("Cyclic object value");
      T = !0;
    }
    typeof w.get(Qs) > "u" && (E = 0);
  }
  if (typeof d == "function" ? _ = d(t, _) : _ instanceof Date ? _ = h?.(_) : n === "comma" && je(_) && (_ = mc(_, function($) {
    return $ instanceof Date ? h?.($) : $;
  })), _ === null) {
    if (o) return c && !y ? c(t, Le.encoder, v, "key", m) : t;
    _ = "";
  }
  if (Kv(_) || Hv(_)) {
    if (c) {
      const $ = y ? t : c(t, Le.encoder, v, "key", m);
      return [g?.($) + "=" + g?.(c(_, Le.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(_))];
  }
  const S = [];
  if (typeof _ > "u") return S;
  let k;
  if (n === "comma" && je(_))
    y && c && (_ = mc(_, c)), k = [{ value: _.length > 0 ? _.join(",") || null : void 0 }];
  else if (je(d)) k = d;
  else {
    const $ = Object.keys(_);
    k = p ? $.sort(p) : $;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), N = r && je(_) && _.length === 1 ? x + "[]" : x;
  if (i && je(_) && _.length === 0) return N + "[]";
  for (let $ = 0; $ < k.length; ++$) {
    const G = k[$], K = typeof G == "object" && typeof G.value < "u" ? G.value : _[G];
    if (s && K === null) continue;
    const z = f && u ? G.replace(/\./g, "%2E") : G, A = je(_) ? typeof n == "function" ? n(N, z) : N : N + (f ? "." + z : "[" + z + "]");
    b.set(e, E);
    const M = /* @__PURE__ */ new WeakMap();
    M.set(Qs, b), Xp(S, Qp(K, A, n, r, i, o, s, u, n === "comma" && y && je(_) ? null : c, d, p, f, h, m, g, y, v, M));
  }
  return S;
}
function Wv(e = Le) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || Le.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Jp;
  if (typeof e.format < "u") {
    if (!Da(hc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = hc[n];
  let i = Le.filter;
  (typeof e.filter == "function" || je(e.filter)) && (i = e.filter);
  let o;
  if (e.arrayFormat && e.arrayFormat in Yp ? o = e.arrayFormat : "indices" in e ? o = e.indices ? "indices" : "repeat" : o = Le.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : Le.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : Le.addQueryPrefix,
    allowDots: s,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : Le.allowEmptyArrays,
    arrayFormat: o,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : Le.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? Le.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : Le.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : Le.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : Le.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : Le.encodeValuesOnly,
    filter: i,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : Le.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : Le.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : Le.strictNullHandling
  };
}
function Jv(e, t = {}) {
  let n = e;
  const r = Wv(t);
  let i, o;
  typeof r.filter == "function" ? (o = r.filter, n = o("", n)) : je(r.filter) && (o = r.filter, i = o);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Yp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  i || (i = Object.keys(n)), r.sort && i.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let h = 0; h < i.length; ++h) {
    const m = i[h];
    r.skipNulls && n[m] === null || Xp(s, Qp(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const p = s.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), p.length > 0 ? f + p : "";
}
function zv(e) {
  return Jv(e, { arrayFormat: "brackets" });
}
function Yv(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var yc;
function ql(e) {
  let t;
  return (yc ?? (t = new globalThis.TextEncoder(), yc = t.encode.bind(t)))(e);
}
var vc;
function _c(e) {
  let t;
  return (vc ?? (t = new globalThis.TextDecoder(), vc = t.decode.bind(t)))(e);
}
var ot, st, vs = class {
  constructor() {
    ot.set(this, void 0), st.set(this, void 0), oe(this, ot, new Uint8Array(), "f"), oe(this, st, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ql(e) : e;
    oe(this, ot, Yv([P(this, ot, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Xv(P(this, ot, "f"), P(this, st, "f"))) != null; ) {
      if (r.carriage && P(this, st, "f") == null) {
        oe(this, st, r.index, "f");
        continue;
      }
      if (P(this, st, "f") != null && (r.index !== P(this, st, "f") + 1 || r.carriage)) {
        n.push(_c(P(this, ot, "f").subarray(0, P(this, st, "f") - 1))), oe(this, ot, P(this, ot, "f").subarray(P(this, st, "f")), "f"), oe(this, st, null, "f");
        continue;
      }
      const i = P(this, st, "f") !== null ? r.preceding - 1 : r.preceding, o = _c(P(this, ot, "f").subarray(0, i));
      n.push(o), oe(this, ot, P(this, ot, "f").subarray(r.index), "f"), oe(this, st, null, "f");
    }
    return n;
  }
  flush() {
    return P(this, ot, "f").length ? this.decode(`
`) : [];
  }
};
ot = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap();
vs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
vs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Xv(e, t) {
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
function Qv(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var qo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, bc = (e, t, n) => {
  if (e) {
    if (Dv(qo, e)) return e;
    qe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(qo))}`);
  }
};
function Wr() {
}
function Gi(e, t, n) {
  return !t || qo[e] > qo[n] ? Wr : t[e].bind(t);
}
var Zv = {
  error: Wr,
  warn: Wr,
  info: Wr,
  debug: Wr
}, wc = /* @__PURE__ */ new WeakMap();
function qe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Zv;
  const r = wc.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: Gi("error", t, n),
    warn: Gi("warn", t, n),
    info: Gi("info", t, n),
    debug: Gi("debug", t, n)
  };
  return wc.set(t, [n, i]), i;
}
var _n = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Tr, mi = class Jr {
  constructor(t, n, r) {
    this.iterator = t, Tr.set(this, void 0), this.controller = n, oe(this, Tr, r, "f");
  }
  static fromSSEResponse(t, n, r, i) {
    let o = !1;
    const s = r ? qe(r) : console;
    async function* u() {
      if (o) throw new te("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let c = !1;
      try {
        for await (const d of jv(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let p;
              try {
                p = JSON.parse(d.data);
              } catch (f) {
                throw s.error("Could not parse message into JSON:", d.data), s.error("From chunk:", d.raw), f;
              }
              if (p && p.error) throw new Ke(void 0, p.error, void 0, t.headers);
              yield i ? {
                event: d.event,
                data: p
              } : p;
            } else {
              let p;
              try {
                p = JSON.parse(d.data);
              } catch (f) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), f;
              }
              if (d.event == "error") throw new Ke(void 0, p.error, p.message, void 0);
              yield {
                event: d.event,
                data: p
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Ma(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Jr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new vs(), c = Wp(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (i) throw new te("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of o())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Ma(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Jr(s, n, r);
  }
  [(Tr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Jr(() => i(t), this.controller, P(this, Tr, "f")), new Jr(() => i(n), this.controller, P(this, Tr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Hp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = ql(JSON.stringify(i) + `
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
async function* jv(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new te("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new te("Attempted to iterate over a response with no body");
  const n = new t_(), r = new vs(), i = Wp(e.body);
  for await (const o of e_(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* e_(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ql(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = Qv(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var t_ = class {
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
    let [t, n, r] = n_(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function n_(e, t) {
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
async function Zp(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    if (t.options.stream)
      return qe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : mi.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : jp(await n.json(), n) : await n.text();
  })();
  return qe(e).debug(`[${r}] response parsed`, _n({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
function jp(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var zr, eh = class th extends Promise {
  constructor(t, n, r = Zp) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, zr.set(this, void 0), oe(this, zr, t, "f");
  }
  _thenUnwrap(t) {
    return new th(P(this, zr, "f"), this.responsePromise, async (n, r) => jp(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(P(this, zr, "f"), t))), this.parsedPromise;
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
var qi, Vl = class {
  constructor(e, t, n, r) {
    qi.set(this, void 0), oe(this, qi, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new te("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await P(this, qi, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(qi = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, r_ = class extends eh {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await Zp(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, _s = class extends Vl {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Pe = class extends Vl {
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
        ...qp(this.options.query),
        after: t
      }
    } : null;
  }
}, gi = class extends Vl {
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
        ...qp(this.options.query),
        after: e
      }
    } : null;
  }
}, i_ = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, o_ = "urn:ietf:params:oauth:grant-type:token-exchange", s_ = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Vp();
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
        grant_type: o_,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: i_[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Gp(t.status, s, t.headers) : Ke.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
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
}, nh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function li(e, t, n) {
  return nh(), new File(e, t ?? "unknown_file", n);
}
function So(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Hl = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", bs = async (e, t) => La(e.body) ? {
  ...e,
  body: await rh(e.body, t)
} : e, Dt = async (e, t) => ({
  ...e,
  body: await rh(e.body, t)
}), Sc = /* @__PURE__ */ new WeakMap();
function a_(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Sc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return Sc.set(t, r), r;
}
var rh = async (e, t) => {
  if (!await a_(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => $a(n, r, i))), n;
}, ih = (e) => e instanceof Blob && "name" in e, l_ = (e) => typeof e == "object" && e !== null && (e instanceof Response || Hl(e) || ih(e)), La = (e) => {
  if (l_(e)) return !0;
  if (Array.isArray(e)) return e.some(La);
  if (e && typeof e == "object") {
    for (const t in e) if (La(e[t])) return !0;
  }
  return !1;
}, $a = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, li([await n.blob()], So(n)));
    else if (Hl(n)) e.append(t, li([await new Response(Kp(n)).blob()], So(n)));
    else if (ih(n)) e.append(t, n, So(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => $a(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => $a(e, `${t}[${r}]`, i)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, oh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", u_ = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && oh(e), c_ = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function d_(e, t, n) {
  if (nh(), e = await e, u_(e))
    return e instanceof File ? e : li([await e.arrayBuffer()], e.name);
  if (c_(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), li(await Ua(i), t, n);
  }
  const r = await Ua(e);
  if (t || (t = So(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return li(r, t, n);
}
async function Ua(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (oh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Hl(e)) for await (const n of e) t.push(...await Ua(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${f_(e)}`);
  }
  return t;
}
function f_(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Z = class {
  constructor(e) {
    this._client = e;
  }
};
function sh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ec = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), p_ = (e = sh) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[h];
    let g = (i ? encodeURIComponent : e)("" + m);
    return h !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ec) ?? Ec)?.toString) && (g = m + "", o.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) o.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (o.sort((p, f) => p.start - f.start), o.length > 0) {
    let p = 0;
    const f = o.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new te(`Path parameters result in path with invalid segments:
${o.map((h) => h.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, F = /* @__PURE__ */ p_(sh), ah = class extends Z {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/chat/completions/${e}/messages`, Pe, {
      query: t,
      ...n
    });
  }
};
function Vo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Kl(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Ii(e) {
  return e?.$brand === "auto-parseable-tool";
}
function h_(e, t) {
  return !t || !lh(t) ? {
    ...e,
    choices: e.choices.map((n) => (uh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Wl(e, t);
}
function Wl(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new Bp();
    if (r.finish_reason === "content_filter") throw new Op();
    return uh(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((i) => g_(t, i)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? m_(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function m_(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function g_(e, t) {
  const n = e.tools?.find((r) => Vo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Ii(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function y_(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => Vo(r) && r.function?.name === t.function.name);
  return Vo(n) && (Ii(n) || n?.function.strict || !1);
}
function lh(e) {
  return Kl(e.response_format) ? !0 : e.tools?.some((t) => Ii(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function uh(e) {
  for (const t of e || []) if (t.type !== "function") throw new te(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function v_(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new te(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new te(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Ho = (e) => e?.role === "assistant", ch = (e) => e?.role === "tool", Fa, Eo, To, Yr, Xr, Ao, Qr, qt, Zr, Ko, Wo, Qn, dh, Jl = class {
  constructor() {
    Fa.add(this), this.controller = new AbortController(), Eo.set(this, void 0), To.set(this, () => {
    }), Yr.set(this, () => {
    }), Xr.set(this, void 0), Ao.set(this, () => {
    }), Qr.set(this, () => {
    }), qt.set(this, {}), Zr.set(this, !1), Ko.set(this, !1), Wo.set(this, !1), Qn.set(this, !1), oe(this, Eo, new Promise((e, t) => {
      oe(this, To, e, "f"), oe(this, Yr, t, "f");
    }), "f"), oe(this, Xr, new Promise((e, t) => {
      oe(this, Ao, e, "f"), oe(this, Qr, t, "f");
    }), "f"), P(this, Eo, "f").catch(() => {
    }), P(this, Xr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, P(this, Fa, "m", dh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (P(this, To, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return P(this, Zr, "f");
  }
  get errored() {
    return P(this, Ko, "f");
  }
  get aborted() {
    return P(this, Wo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (P(this, qt, "f")[e] || (P(this, qt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = P(this, qt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((i) => i.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (P(this, qt, "f")[e] || (P(this, qt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      oe(this, Qn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    oe(this, Qn, !0, "f"), await P(this, Xr, "f");
  }
  _emit(e, ...t) {
    if (P(this, Zr, "f")) return;
    e === "end" && (oe(this, Zr, !0, "f"), P(this, Ao, "f").call(this));
    const n = P(this, qt, "f")[e];
    if (n && (P(this, qt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !P(this, Qn, "f") && !n?.length && Promise.reject(r), P(this, Yr, "f").call(this, r), P(this, Qr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !P(this, Qn, "f") && !n?.length && Promise.reject(r), P(this, Yr, "f").call(this, r), P(this, Qr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Eo = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), Qr = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakMap(), Zr = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), Fa = /* @__PURE__ */ new WeakSet(), dh = function(t) {
  if (oe(this, Ko, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new vt()), t instanceof vt)
    return oe(this, Wo, !0, "f"), this._emit("abort", t);
  if (t instanceof te) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new te(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new te(String(t)));
};
function __(e) {
  return typeof e.parse == "function";
}
var Je, Ba, Jo, Oa, Ga, qa, fh, ph, b_ = 10, hh = class extends Jl {
  constructor() {
    super(...arguments), Je.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), ch(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Ho(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new te("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), P(this, Je, "m", Ba).call(this);
  }
  async finalMessage() {
    return await this.done(), P(this, Je, "m", Jo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), P(this, Je, "m", Oa).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), P(this, Je, "m", Ga).call(this);
  }
  async totalUsage() {
    return await this.done(), P(this, Je, "m", qa).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = P(this, Je, "m", Jo).call(this);
    t && this._emit("finalMessage", t);
    const n = P(this, Je, "m", Ba).call(this);
    n && this._emit("finalContent", n);
    const r = P(this, Je, "m", Oa).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const i = P(this, Je, "m", Ga).call(this);
    i != null && this._emit("finalFunctionToolCallResult", i), this._chatCompletions.some((o) => o.usage) && this._emit("totalUsage", P(this, Je, "m", qa).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), P(this, Je, "m", fh).call(this, t);
    const i = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Wl(i, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: i = "auto", stream: o, ...s } = t, u = typeof i != "string" && i.type === "function" && i?.function?.name, { maxChatCompletions: c = b_ } = n || {}, d = t.tools.map((h) => {
      if (Ii(h)) {
        if (!h.$callback) throw new te("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: h.$callback,
            name: h.function.name,
            description: h.function.description || "",
            parameters: h.function.parameters,
            parse: h.$parseRaw,
            strict: !0
          }
        };
      }
      return h;
    }), p = {};
    for (const h of d) h.type === "function" && (p[h.function.name || h.function.function.name] = h.function);
    const f = "tools" in t ? d.map((h) => h.type === "function" ? {
      type: "function",
      function: {
        name: h.function.name || h.function.function.name,
        parameters: h.function.parameters,
        description: h.function.description,
        strict: h.function.strict
      }
    } : h) : void 0;
    for (const h of t.messages) this._addMessage(h, !1);
    for (let h = 0; h < c; ++h) {
      const m = (await this._createChatCompletion(e, {
        ...s,
        tool_choice: i,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new te("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const y = g.id, { name: v, arguments: b } = g.function, _ = p[v];
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
          const S = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(p).map((k) => JSON.stringify(k)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: S
          });
          continue;
        }
        let w;
        try {
          w = __(_) ? await _.parse(b) : b;
        } catch (S) {
          const k = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: k
          });
          continue;
        }
        const E = await _.function(w, this), T = P(this, Je, "m", ph).call(this, E);
        if (this._addMessage({
          role: r,
          tool_call_id: y,
          content: T
        }), u) return;
      }
    }
  }
};
Je = /* @__PURE__ */ new WeakSet(), Ba = function() {
  return P(this, Je, "m", Jo).call(this).content ?? null;
}, Jo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Ho(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new te("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Oa = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Ho(n) && n?.tool_calls?.length) return n.tool_calls.filter((r) => r.type === "function").at(-1)?.function;
  }
}, Ga = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (ch(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((i) => i.type === "function" && i.id === n.tool_call_id))) return n.content;
  }
}, qa = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, fh = function(t) {
  if (t.n != null && t.n > 1) throw new te("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, ph = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var w_ = class mh extends hh {
  static runTools(t, n, r) {
    const i = new mh(), o = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, o)), i;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Ho(t) && t.content && this._emit("content", t.content);
  }
}, S_ = 1, gh = 2, yh = 4, vh = 8, E_ = 16, T_ = 32, A_ = 64, _h = 128, bh = 256, x_ = _h | bh, C_ = 496, Tc = gh | 497, Ac = yh | vh, Fe = {
  STR: S_,
  NUM: gh,
  ARR: yh,
  OBJ: vh,
  NULL: E_,
  BOOL: T_,
  NAN: A_,
  INFINITY: _h,
  MINUS_INFINITY: bh,
  INF: x_,
  SPECIAL: C_,
  ATOM: Tc,
  COLLECTION: Ac,
  ALL: Tc | Ac
}, I_ = class extends Error {
}, R_ = class extends Error {
};
function P_(e, t = Fe.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return M_(e.trim(), t);
}
var M_ = (e, t) => {
  const n = e.length;
  let r = 0;
  const i = (h) => {
    throw new I_(`${h} at position ${r}`);
  }, o = (h) => {
    throw new R_(`${h} at position ${r}`);
  }, s = () => (f(), r >= n && i("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || Fe.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || Fe.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || Fe.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || Fe.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || Fe.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || Fe.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : p()), u = () => {
    const h = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(h, ++r - Number(m)));
    } catch (g) {
      o(String(g));
    }
    else if (Fe.STR & t) try {
      return JSON.parse(e.substring(h, r - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(h, e.lastIndexOf("\\")) + '"');
    }
    i("Unterminated string literal");
  }, c = () => {
    r++, f();
    const h = {};
    try {
      for (; e[r] !== "}"; ) {
        if (f(), r >= n && Fe.OBJ & t) return h;
        const m = u();
        f(), r++;
        try {
          const g = s();
          Object.defineProperty(h, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (Fe.OBJ & t) return h;
          throw g;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (Fe.OBJ & t) return h;
      i("Expected '}' at end of object");
    }
    return r++, h;
  }, d = () => {
    r++;
    const h = [];
    try {
      for (; e[r] !== "]"; )
        h.push(s()), f(), e[r] === "," && r++;
    } catch {
      if (Fe.ARR & t) return h;
      i("Expected ']' at end of array");
    }
    return r++, h;
  }, p = () => {
    if (r === 0) {
      e === "-" && Fe.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (Fe.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        o(String(m));
      }
    }
    const h = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(Fe.NUM & t) && i("Unterminated number literal");
    try {
      return JSON.parse(e.substring(h, r));
    } catch {
      e.substring(h, r) === "-" && Fe.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(h, e.lastIndexOf("e")));
      } catch (g) {
        o(String(g));
      }
    }
  }, f = () => {
    for (; r < n && ` 
\r	`.includes(e[r]); ) r++;
  };
  return s();
}, xc = (e) => P_(e, Fe.ALL ^ Fe.NUM), ke, Ft, Gn, Yt, Zs, Vi, js, ea, ta, Hi, na, Cc, wh = class Va extends hh {
  constructor(t) {
    super(), ke.add(this), Ft.set(this, void 0), Gn.set(this, void 0), Yt.set(this, void 0), oe(this, Ft, t, "f"), oe(this, Gn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return P(this, Yt, "f");
  }
  static fromReadableStream(t) {
    const n = new Va(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const i = new Va(n);
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
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), P(this, ke, "m", Zs).call(this);
    const o = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of o) P(this, ke, "m", js).call(this, s);
    if (o.controller.signal?.aborted) throw new vt();
    return this._addChatCompletion(P(this, ke, "m", Hi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), P(this, ke, "m", Zs).call(this), this._connected();
    const i = mi.fromReadableStream(t, this.controller);
    let o;
    for await (const s of i)
      o && o !== s.id && this._addChatCompletion(P(this, ke, "m", Hi).call(this)), P(this, ke, "m", js).call(this, s), o = s.id;
    if (i.controller.signal?.aborted) throw new vt();
    return this._addChatCompletion(P(this, ke, "m", Hi).call(this));
  }
  [(Ft = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakSet(), Zs = function() {
    this.ended || oe(this, Yt, void 0, "f");
  }, Vi = function(n) {
    let r = P(this, Gn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, P(this, Gn, "f")[n.index] = r, r);
  }, js = function(n) {
    if (this.ended) return;
    const r = P(this, ke, "m", Cc).call(this, n);
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
      const s = P(this, ke, "m", Vi).call(this, o);
      o.finish_reason && (P(this, ke, "m", ta).call(this, o), s.current_tool_call_index != null && P(this, ke, "m", ea).call(this, o, s.current_tool_call_index));
      for (const u of i.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (P(this, ke, "m", ta).call(this, o), s.current_tool_call_index != null && P(this, ke, "m", ea).call(this, o, s.current_tool_call_index)), s.current_tool_call_index = u.index;
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
  }, ea = function(n, r) {
    if (P(this, ke, "m", Vi).call(this, n).done_tool_calls.has(r)) return;
    const i = n.message.tool_calls?.[r];
    if (!i) throw new Error("no tool call snapshot");
    if (!i.type) throw new Error("tool call snapshot missing `type`");
    if (i.type === "function") {
      const o = P(this, Ft, "f")?.tools?.find((s) => Vo(s) && s.function.name === i.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: i.function.name,
        index: r,
        arguments: i.function.arguments,
        parsed_arguments: Ii(o) ? o.$parseRaw(i.function.arguments) : o?.function.strict ? JSON.parse(i.function.arguments) : null
      });
    } else i.type;
  }, ta = function(n) {
    const r = P(this, ke, "m", Vi).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const i = P(this, ke, "m", na).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: i ? i.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Hi = function() {
    if (this.ended) throw new te("stream has ended, this shouldn't happen");
    const n = P(this, Yt, "f");
    if (!n) throw new te("request ended without sending any chunks");
    return oe(this, Yt, void 0, "f"), oe(this, Gn, [], "f"), N_(n, P(this, Ft, "f"));
  }, na = function() {
    const n = P(this, Ft, "f")?.response_format;
    return Kl(n) ? n : null;
  }, Cc = function(n) {
    var r, i, o, s;
    let u = P(this, Yt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = oe(this, Yt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: p, finish_reason: f, index: h, logprobs: m = null, ...g } of n.choices) {
      let y = u.choices[h];
      if (y || (y = u.choices[h] = {
        finish_reason: f,
        index: h,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!y.logprobs) y.logprobs = Object.assign({}, m);
      else {
        const { content: S, refusal: k, ...x } = m;
        Object.assign(y.logprobs, x), S && ((r = y.logprobs).content ?? (r.content = []), y.logprobs.content.push(...S)), k && ((i = y.logprobs).refusal ?? (i.refusal = []), y.logprobs.refusal.push(...k));
      }
      if (f && (y.finish_reason = f, P(this, Ft, "f") && lh(P(this, Ft, "f")))) {
        if (f === "length") throw new Bp();
        if (f === "content_filter") throw new Op();
      }
      if (Object.assign(y, g), !p) continue;
      const { content: v, refusal: b, function_call: _, role: w, tool_calls: E, ...T } = p;
      if (Object.assign(y.message, T), b && (y.message.refusal = (y.message.refusal || "") + b), w && (y.message.role = w), _ && (y.message.function_call ? (_.name && (y.message.function_call.name = _.name), _.arguments && ((o = y.message.function_call).arguments ?? (o.arguments = ""), y.message.function_call.arguments += _.arguments)) : y.message.function_call = _), v && (y.message.content = (y.message.content || "") + v, !y.message.refusal && P(this, ke, "m", na).call(this) && (y.message.parsed = xc(y.message.content))), E) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: S, id: k, type: x, function: N, ...$ } of E) {
          const G = (s = y.message.tool_calls)[S] ?? (s[S] = {});
          Object.assign(G, $), k && (G.id = k), x && (G.type = x), N && (G.function ?? (G.function = {
            name: N.name ?? "",
            arguments: ""
          })), N?.name && (G.function.name = N.name), N?.arguments && (G.function.arguments += N.arguments, y_(P(this, Ft, "f"), G) && (G.function.parsed_arguments = xc(G.function.arguments)));
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
    return new mi(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function N_(e, t) {
  const { id: n, choices: r, created: i, model: o, system_fingerprint: s, ...u } = e;
  return h_({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: p, logprobs: f, ...h }) => {
      if (!d) throw new te(`missing finish_reason for choice ${p}`);
      const { content: m = null, function_call: g, tool_calls: y, ...v } = c, b = c.role;
      if (!b) throw new te(`missing role for choice ${p}`);
      if (g) {
        const { arguments: _, name: w } = g;
        if (_ == null) throw new te(`missing function_call.arguments for choice ${p}`);
        if (!w) throw new te(`missing function_call.name for choice ${p}`);
        return {
          ...h,
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
          index: p,
          logprobs: f
        };
      }
      return y ? {
        ...h,
        index: p,
        finish_reason: d,
        logprobs: f,
        message: {
          ...v,
          role: b,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: y.map((_, w) => {
            const { function: E, type: T, id: S, ...k } = _, { arguments: x, name: N, ...$ } = E || {};
            if (S == null) throw new te(`missing choices[${p}].tool_calls[${w}].id
${Ki(e)}`);
            if (T == null) throw new te(`missing choices[${p}].tool_calls[${w}].type
${Ki(e)}`);
            if (N == null) throw new te(`missing choices[${p}].tool_calls[${w}].function.name
${Ki(e)}`);
            if (x == null) throw new te(`missing choices[${p}].tool_calls[${w}].function.arguments
${Ki(e)}`);
            return {
              ...k,
              id: S,
              type: T,
              function: {
                ...$,
                name: N,
                arguments: x
              }
            };
          })
        }
      } : {
        ...h,
        message: {
          ...v,
          content: m,
          role: b,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: p,
        logprobs: f
      };
    }),
    created: i,
    model: o,
    object: "chat.completion",
    ...s ? { system_fingerprint: s } : {}
  }, t);
}
function Ki(e) {
  return JSON.stringify(e);
}
var k_ = class Ha extends wh {
  static fromReadableStream(t) {
    const n = new Ha(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const i = new Ha(n), o = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, o)), i;
  }
}, zl = class extends Z {
  constructor() {
    super(...arguments), this.messages = new ah(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(F`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", Pe, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return v_(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Wl(n, e));
  }
  runTools(e, t) {
    return e.stream ? k_.runTools(this._client, e, t) : w_.runTools(this._client, e, t);
  }
  stream(e, t) {
    return wh.createChatCompletion(this._client, e, t);
  }
};
zl.Messages = ah;
var Yl = class extends Z {
  constructor() {
    super(...arguments), this.completions = new zl(this._client);
  }
};
Yl.Completions = zl;
var Sh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* D_(e) {
  if (!e) return;
  if (Sh in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : lc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = lc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var X = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of D_(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [Sh]: !0,
    values: t,
    nulls: n
  };
}, Eh = class extends Z {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: X([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Th = class extends Z {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Dt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ah = class extends Z {
  create(e, t) {
    return this._client.post("/audio/translations", Dt({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ri = class extends Z {
  constructor() {
    super(...arguments), this.transcriptions = new Th(this._client), this.translations = new Ah(this._client), this.speech = new Eh(this._client);
  }
};
Ri.Transcriptions = Th;
Ri.Translations = Ah;
Ri.Speech = Eh;
var xh = class extends Z {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", Pe, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(F`/batches/${e}/cancel`, t);
  }
}, Ch = class extends Z {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/assistants/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(F`/assistants/${e}`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Pe, {
      query: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(F`/assistants/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ih = class extends Z {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Rh = class extends Z {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, ws = class extends Z {
  constructor() {
    super(...arguments), this.sessions = new Ih(this._client), this.transcriptionSessions = new Rh(this._client);
  }
};
ws.Sessions = Ih;
ws.TranscriptionSessions = Rh;
var Ph = class extends Z {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(F`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, Mh = class extends Z {
  retrieve(e, t) {
    return this._client.get(F`/chatkit/threads/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", gi, {
      query: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(F`/chatkit/threads/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(F`/chatkit/threads/${e}/items`, gi, {
      query: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Ss = class extends Z {
  constructor() {
    super(...arguments), this.sessions = new Ph(this._client), this.threads = new Mh(this._client);
  }
};
Ss.Sessions = Ph;
Ss.Threads = Mh;
var Nh = class extends Z {
  create(e, t, n) {
    return this._client.post(F`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(F`/threads/${r}/messages/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(F`/threads/${r}/messages/${e}`, {
      body: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/threads/${e}/messages`, Pe, {
      query: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(F`/threads/${r}/messages/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, kh = class extends Z {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: i, ...o } = t;
    return this._client.get(F`/threads/${r}/runs/${i}/steps/${e}`, {
      query: o,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.getAPIList(F`/threads/${r}/runs/${e}/steps`, Pe, {
      query: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, L_ = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let i = 0; i < n; i++) r[i] = t.charCodeAt(i);
    return Array.from(new Float32Array(r.buffer));
  }
}, qn = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, Ve, Rn, Ka, Nt, xo, Et, Pn, nr, xn, zo, ct, Co, Io, ui, jr, ei, Ic, Rc, Pc, Mc, Nc, kc, Dc, ci = class extends Jl {
  constructor() {
    super(...arguments), Ve.add(this), Ka.set(this, []), Nt.set(this, {}), xo.set(this, {}), Et.set(this, void 0), Pn.set(this, void 0), nr.set(this, void 0), xn.set(this, void 0), zo.set(this, void 0), ct.set(this, void 0), Co.set(this, void 0), Io.set(this, void 0), ui.set(this, void 0);
  }
  [(Ka = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), ui = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Rn();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = mi.fromReadableStream(e, this.controller);
    for await (const i of r) P(this, Ve, "m", jr).call(this, i);
    if (r.controller.signal?.aborted) throw new vt();
    return this._addRun(P(this, Ve, "m", ei).call(this));
  }
  toReadableStream() {
    return new mi(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const i = new Rn();
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
    for await (const u of s) P(this, Ve, "m", jr).call(this, u);
    if (s.controller.signal?.aborted) throw new vt();
    return this._addRun(P(this, Ve, "m", ei).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new Rn();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const i = new Rn();
    return i._run(() => i._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  currentEvent() {
    return P(this, Co, "f");
  }
  currentRun() {
    return P(this, Io, "f");
  }
  currentMessageSnapshot() {
    return P(this, Et, "f");
  }
  currentRunStepSnapshot() {
    return P(this, ui, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(P(this, Nt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(P(this, xo, "f"));
  }
  async finalRun() {
    if (await this.done(), !P(this, Pn, "f")) throw Error("Final run was not received.");
    return P(this, Pn, "f");
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
    for await (const s of o) P(this, Ve, "m", jr).call(this, s);
    if (o.controller.signal?.aborted) throw new vt();
    return this._addRun(P(this, Ve, "m", ei).call(this));
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
    for await (const u of s) P(this, Ve, "m", jr).call(this, u);
    if (s.controller.signal?.aborted) throw new vt();
    return this._addRun(P(this, Ve, "m", ei).call(this));
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
      else if (Ys(i) && Ys(r)) i = this.accumulateDelta(i, r);
      else if (Array.isArray(i) && Array.isArray(r)) {
        if (i.every((o) => typeof o == "string" || typeof o == "number")) {
          i.push(...r);
          continue;
        }
        for (const o of r) {
          if (!Ys(o)) throw new Error(`Expected array delta entry to be an object but got: ${o}`);
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
Rn = ci, jr = function(t) {
  if (!this.ended)
    switch (oe(this, Co, t, "f"), P(this, Ve, "m", Pc).call(this, t), t.event) {
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
        P(this, Ve, "m", Dc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        P(this, Ve, "m", Rc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        P(this, Ve, "m", Ic).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, ei = function() {
  if (this.ended) throw new te("stream has ended, this shouldn't happen");
  if (!P(this, Pn, "f")) throw Error("Final run has not been received");
  return P(this, Pn, "f");
}, Ic = function(t) {
  const [n, r] = P(this, Ve, "m", Nc).call(this, t, P(this, Et, "f"));
  oe(this, Et, n, "f"), P(this, xo, "f")[n.id] = n;
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
        if (i.index != P(this, nr, "f")) {
          if (P(this, xn, "f")) switch (P(this, xn, "f").type) {
            case "text":
              this._emit("textDone", P(this, xn, "f").text, P(this, Et, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", P(this, xn, "f").image_file, P(this, Et, "f"));
              break;
          }
          oe(this, nr, i.index, "f");
        }
        oe(this, xn, n.content[i.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (P(this, nr, "f") !== void 0) {
        const i = t.data.content[P(this, nr, "f")];
        if (i) switch (i.type) {
          case "image_file":
            this._emit("imageFileDone", i.image_file, P(this, Et, "f"));
            break;
          case "text":
            this._emit("textDone", i.text, P(this, Et, "f"));
            break;
        }
      }
      P(this, Et, "f") && this._emit("messageDone", t.data), oe(this, Et, void 0, "f");
  }
}, Rc = function(t) {
  const n = P(this, Ve, "m", Mc).call(this, t);
  switch (oe(this, ui, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const i of r.step_details.tool_calls) i.index == P(this, zo, "f") ? this._emit("toolCallDelta", i, n.step_details.tool_calls[i.index]) : (P(this, ct, "f") && this._emit("toolCallDone", P(this, ct, "f")), oe(this, zo, i.index, "f"), oe(this, ct, n.step_details.tool_calls[i.index], "f"), P(this, ct, "f") && this._emit("toolCallCreated", P(this, ct, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      oe(this, ui, void 0, "f"), t.data.step_details.type == "tool_calls" && P(this, ct, "f") && (this._emit("toolCallDone", P(this, ct, "f")), oe(this, ct, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Pc = function(t) {
  P(this, Ka, "f").push(t), this._emit("event", t);
}, Mc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return P(this, Nt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = P(this, Nt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const i = Rn.accumulateDelta(n, r.delta);
        P(this, Nt, "f")[t.data.id] = i;
      }
      return P(this, Nt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      P(this, Nt, "f")[t.data.id] = t.data;
      break;
  }
  if (P(this, Nt, "f")[t.data.id]) return P(this, Nt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Nc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let i = t.data;
      if (i.delta.content) for (const o of i.delta.content) if (o.index in n.content) {
        let s = n.content[o.index];
        n.content[o.index] = P(this, Ve, "m", kc).call(this, o, s);
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
}, kc = function(t, n) {
  return Rn.accumulateDelta(n, t);
}, Dc = function(t) {
  switch (oe(this, Io, t.data, "f"), t.event) {
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
      oe(this, Pn, t.data, "f"), P(this, ct, "f") && (this._emit("toolCallDone", P(this, ct, "f")), oe(this, ct, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Xl = class extends Z {
  constructor() {
    super(...arguments), this.steps = new kh(this._client);
  }
  create(e, t, n) {
    const { include: r, ...i } = t;
    return this._client.post(F`/threads/${e}/runs`, {
      query: { include: r },
      body: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(F`/threads/${r}/runs/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(F`/threads/${r}/runs/${e}`, {
      body: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/threads/${e}/runs`, Pe, {
      query: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(F`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return ci.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = X([n?.headers, {
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
          await Ci(s);
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
    return ci.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...i } = t;
    return this._client.post(F`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const r = await this.submitToolOutputs(e, t, n);
    return await this.poll(r.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return ci.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Xl.Steps = kh;
var Es = class extends Z {
  constructor() {
    super(...arguments), this.runs = new Xl(this._client), this.messages = new Nh(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/threads/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(F`/threads/${e}`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(F`/threads/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return ci.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Es.Runs = Xl;
Es.Messages = Nh;
var fr = class extends Z {
  constructor() {
    super(...arguments), this.realtime = new ws(this._client), this.chatkit = new Ss(this._client), this.assistants = new Ch(this._client), this.threads = new Es(this._client);
  }
};
fr.Realtime = ws;
fr.ChatKit = Ss;
fr.Assistants = Ch;
fr.Threads = Es;
var Dh = class extends Z {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Lh = class extends Z {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(F`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: X([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Ql = class extends Z {
  constructor() {
    super(...arguments), this.content = new Lh(this._client);
  }
  create(e, t, n) {
    return this._client.post(F`/containers/${e}/files`, bs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(F`/containers/${r}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/containers/${e}/files`, Pe, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(F`/containers/${r}/files/${e}`, {
      ...n,
      headers: X([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Ql.Content = Lh;
var Zl = class extends Z {
  constructor() {
    super(...arguments), this.files = new Ql(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Pe, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/containers/${e}`, {
      ...t,
      headers: X([{ Accept: "*/*" }, t?.headers])
    });
  }
};
Zl.Files = Ql;
var $h = class extends Z {
  create(e, t, n) {
    const { include: r, ...i } = t;
    return this._client.post(F`/conversations/${e}/items`, {
      query: { include: r },
      body: i,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...i } = t;
    return this._client.get(F`/conversations/${r}/items/${e}`, {
      query: i,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/conversations/${e}/items`, gi, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(F`/conversations/${r}/items/${e}`, n);
  }
}, jl = class extends Z {
  constructor() {
    super(...arguments), this.items = new $h(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(F`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(F`/conversations/${e}`, t);
  }
};
jl.Items = $h;
var Uh = class extends Z {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && qe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const i = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t
    });
    return n ? i : (qe(this._client).debug("embeddings/decoding base64 embeddings from base64"), i._thenUnwrap((o) => (o && o.data && o.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = L_(u);
    }), o)));
  }
}, Fh = class extends Z {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: i } = t;
    return this._client.get(F`/evals/${r}/runs/${i}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: r, ...i } = t;
    return this._client.getAPIList(F`/evals/${r}/runs/${e}/output_items`, Pe, {
      query: i,
      ...n
    });
  }
}, eu = class extends Z {
  constructor() {
    super(...arguments), this.outputItems = new Fh(this._client);
  }
  create(e, t, n) {
    return this._client.post(F`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(F`/evals/${r}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/evals/${e}/runs`, Pe, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(F`/evals/${r}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(F`/evals/${r}/runs/${e}`, n);
  }
};
eu.OutputItems = Fh;
var tu = class extends Z {
  constructor() {
    super(...arguments), this.runs = new eu(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(F`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", Pe, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/evals/${e}`, t);
  }
};
tu.Runs = eu;
var Bh = class extends Z {
  create(e, t) {
    return this._client.post("/files", Dt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(F`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", Pe, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(F`/files/${e}/content`, {
      ...t,
      headers: X([{ Accept: "application/binary" }, t?.headers]),
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
      if (await Ci(t), o = await this.retrieve(e), Date.now() - i > n) throw new Gl({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return o;
  }
}, Oh = class extends Z {
}, Gh = class extends Z {
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
}, nu = class extends Z {
  constructor() {
    super(...arguments), this.graders = new Gh(this._client);
  }
};
nu.Graders = Gh;
var qh = class extends Z {
  create(e, t, n) {
    return this._client.getAPIList(F`/fine_tuning/checkpoints/${e}/permissions`, _s, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(F`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/fine_tuning/checkpoints/${e}/permissions`, gi, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(F`/fine_tuning/checkpoints/${r}/permissions/${e}`, n);
  }
}, ru = class extends Z {
  constructor() {
    super(...arguments), this.permissions = new qh(this._client);
  }
};
ru.Permissions = qh;
var Vh = class extends Z {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/fine_tuning/jobs/${e}/checkpoints`, Pe, {
      query: t,
      ...n
    });
  }
}, iu = class extends Z {
  constructor() {
    super(...arguments), this.checkpoints = new Vh(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", Pe, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(F`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(F`/fine_tuning/jobs/${e}/events`, Pe, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(F`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(F`/fine_tuning/jobs/${e}/resume`, t);
  }
};
iu.Checkpoints = Vh;
var pr = class extends Z {
  constructor() {
    super(...arguments), this.methods = new Oh(this._client), this.jobs = new iu(this._client), this.checkpoints = new ru(this._client), this.alpha = new nu(this._client);
  }
};
pr.Methods = Oh;
pr.Jobs = iu;
pr.Checkpoints = ru;
pr.Alpha = nu;
var Hh = class extends Z {
}, ou = class extends Z {
  constructor() {
    super(...arguments), this.graderModels = new Hh(this._client);
  }
};
ou.GraderModels = Hh;
var Kh = class extends Z {
  createVariation(e, t) {
    return this._client.post("/images/variations", Dt({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Dt({
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
}, Wh = class extends Z {
  retrieve(e, t) {
    return this._client.get(F`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", _s, e);
  }
  delete(e, t) {
    return this._client.delete(F`/models/${e}`, t);
  }
}, Jh = class extends Z {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, zh = class extends Z {
  accept(e, t, n) {
    return this._client.post(F`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: X([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(F`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: X([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(F`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: X([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(F`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: X([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Yh = class extends Z {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Ts = class extends Z {
  constructor() {
    super(...arguments), this.clientSecrets = new Yh(this._client), this.calls = new zh(this._client);
  }
};
Ts.ClientSecrets = Yh;
Ts.Calls = zh;
function $_(e, t) {
  return !t || !F_(t) ? {
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
  } : Xh(e, t);
}
function Xh(e, t) {
  const n = e.output.map((i) => {
    if (i.type === "function_call") return {
      ...i,
      parsed_arguments: G_(t, i)
    };
    if (i.type === "message") {
      const o = i.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: U_(t, s.text)
      } : s);
      return {
        ...i,
        content: o
      };
    }
    return i;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Wa(r), Object.defineProperty(r, "output_parsed", {
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
function U_(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function F_(e) {
  return !!Kl(e.text?.format);
}
function B_(e) {
  return e?.$brand === "auto-parseable-tool";
}
function O_(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function G_(e, t) {
  const n = O_(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: B_(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Wa(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Vn, Wi, Xt, Ji, Lc, $c, Uc, Fc, q_ = class Qh extends Jl {
  constructor(t) {
    super(), Vn.add(this), Wi.set(this, void 0), Xt.set(this, void 0), Ji.set(this, void 0), oe(this, Wi, t, "f");
  }
  static createResponse(t, n, r) {
    const i = new Qh(n);
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
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), P(this, Vn, "m", Lc).call(this);
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
    for await (const u of o) P(this, Vn, "m", $c).call(this, u, s);
    if (o.controller.signal?.aborted) throw new vt();
    return P(this, Vn, "m", Uc).call(this);
  }
  [(Wi = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakSet(), Lc = function() {
    this.ended || oe(this, Xt, void 0, "f");
  }, $c = function(n, r) {
    if (this.ended) return;
    const i = (s, u) => {
      (r == null || u.sequence_number > r) && this._emit(s, u);
    }, o = P(this, Vn, "m", Fc).call(this, n);
    switch (i("event", n), n.type) {
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new te(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const u = s.content[n.content_index];
          if (!u) throw new te(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new te(`expected content to be 'output_text', got ${u.type}`);
          i("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new te(`missing output at index ${n.output_index}`);
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
  }, Uc = function() {
    if (this.ended) throw new te("stream has ended, this shouldn't happen");
    const n = P(this, Xt, "f");
    if (!n) throw new te("request ended without sending any events");
    oe(this, Xt, void 0, "f");
    const r = V_(n, P(this, Wi, "f"));
    return oe(this, Ji, r, "f"), r;
  }, Fc = function(n) {
    let r = P(this, Xt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new te(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = oe(this, Xt, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const i = r.output[n.output_index];
        if (!i) throw new te(`missing output at index ${n.output_index}`);
        const o = i.type, s = n.part;
        o === "message" && s.type !== "reasoning_text" ? i.content.push(s) : o === "reasoning" && s.type === "reasoning_text" && (i.content || (i.content = []), i.content.push(s));
        break;
      }
      case "response.output_text.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new te(`missing output at index ${n.output_index}`);
        if (i.type === "message") {
          const o = i.content[n.content_index];
          if (!o) throw new te(`missing content at index ${n.content_index}`);
          if (o.type !== "output_text") throw new te(`expected content to be 'output_text', got ${o.type}`);
          o.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new te(`missing output at index ${n.output_index}`);
        i.type === "function_call" && (i.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const i = r.output[n.output_index];
        if (!i) throw new te(`missing output at index ${n.output_index}`);
        if (i.type === "reasoning") {
          const o = i.content?.[n.content_index];
          if (!o) throw new te(`missing content at index ${n.content_index}`);
          if (o.type !== "reasoning_text") throw new te(`expected content to be 'reasoning_text', got ${o.type}`);
          o.text += n.delta;
        }
        break;
      }
      case "response.completed":
        oe(this, Xt, n.response, "f");
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
    const t = P(this, Ji, "f");
    if (!t) throw new te("stream ended without producing a ChatCompletion");
    return t;
  }
};
function V_(e, t) {
  return $_(e, t);
}
var Zh = class extends Z {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/responses/${e}/input_items`, Pe, {
      query: t,
      ...n
    });
  }
}, jh = class extends Z {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, As = class extends Z {
  constructor() {
    super(...arguments), this.inputItems = new Zh(this._client), this.inputTokens = new jh(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Wa(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(F`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && Wa(r), r));
  }
  delete(e, t) {
    return this._client.delete(F`/responses/${e}`, {
      ...t,
      headers: X([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Xh(n, e));
  }
  stream(e, t) {
    return q_.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(F`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
As.InputItems = Zh;
As.InputTokens = jh;
var em = class extends Z {
  retrieve(e, t) {
    return this._client.get(F`/skills/${e}/content`, {
      ...t,
      headers: X([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, tm = class extends Z {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(F`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: X([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, su = class extends Z {
  constructor() {
    super(...arguments), this.content = new tm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(F`/skills/${e}/versions`, bs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(F`/skills/${r}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/skills/${e}/versions`, Pe, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(F`/skills/${r}/versions/${e}`, n);
  }
};
su.Content = tm;
var xs = class extends Z {
  constructor() {
    super(...arguments), this.content = new em(this._client), this.versions = new su(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", bs({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(F`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(F`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", Pe, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/skills/${e}`, t);
  }
};
xs.Content = em;
xs.Versions = su;
var nm = class extends Z {
  create(e, t, n) {
    return this._client.post(F`/uploads/${e}/parts`, Dt({
      body: t,
      ...n
    }, this._client));
  }
}, au = class extends Z {
  constructor() {
    super(...arguments), this.parts = new nm(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(F`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(F`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
au.Parts = nm;
var H_ = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((i) => i.status === "rejected");
  if (n.length) {
    for (const i of n) console.error(i.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const i of t) i.status === "fulfilled" && r.push(i.value);
  return r;
}, rm = class extends Z {
  create(e, t, n) {
    return this._client.post(F`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(F`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(F`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...i } = t;
    return this._client.getAPIList(F`/vector_stores/${r}/file_batches/${e}/files`, Pe, {
      query: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const r = X([n?.headers, {
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
          await Ci(s);
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
    async function d(p) {
      for (let f of p) {
        const h = await s.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        c.push(h.id);
      }
    }
    return await H_(Array(o).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, im = class extends Z {
  create(e, t, n) {
    return this._client.post(F`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(F`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...i } = t;
    return this._client.post(F`/vector_stores/${r}/files/${e}`, {
      body: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/vector_stores/${e}/files`, Pe, {
      query: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(F`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = X([n?.headers, {
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
          await Ci(s);
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
    return this._client.getAPIList(F`/vector_stores/${r}/files/${e}/content`, _s, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Cs = class extends Z {
  constructor() {
    super(...arguments), this.files = new im(this._client), this.fileBatches = new rm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(F`/vector_stores/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(F`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Pe, {
      query: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(F`/vector_stores/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(F`/vector_stores/${e}/search`, _s, {
      body: t,
      method: "post",
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Cs.Files = im;
Cs.FileBatches = rm;
var om = class extends Z {
  create(e, t) {
    return this._client.post("/videos", Dt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(F`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", gi, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", Dt({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(F`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: X([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Dt({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Dt({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(F`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(F`/videos/${e}/remix`, bs({
      body: t,
      ...n
    }, this._client));
  }
}, Zn, sm, Ro, am = class extends Z {
  constructor() {
    super(...arguments), Zn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    P(this, Zn, "m", sm).call(this, n);
    const i = X([t]).values, o = P(this, Zn, "m", Ro).call(this, i, "webhook-signature"), s = P(this, Zn, "m", Ro).call(this, i, "webhook-timestamp"), u = P(this, Zn, "m", Ro).call(this, i, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new Kr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Kr("Webhook timestamp is too old");
    if (c > d + r) throw new Kr("Webhook timestamp is too new");
    const p = o.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), h = u ? `${u}.${s}.${e}` : `${s}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of p) try {
      const y = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, y, new TextEncoder().encode(h))) return;
    } catch {
      continue;
    }
    throw new Kr("The given webhook signature does not match the expected signature");
  }
};
Zn = /* @__PURE__ */ new WeakSet(), sm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Ro = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var Ja, lu, Po, lm, ra = "workload-identity-auth", fe = class {
  constructor({ baseURL: e = qn("OPENAI_BASE_URL"), apiKey: t = qn("OPENAI_API_KEY"), organization: n = qn("OPENAI_ORG_ID") ?? null, project: r = qn("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = qn("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: o, ...s } = {}) {
    if (Ja.add(this), Po.set(this, void 0), this.completions = new Dh(this), this.chat = new Yl(this), this.embeddings = new Uh(this), this.files = new Bh(this), this.images = new Kh(this), this.audio = new Ri(this), this.moderations = new Jh(this), this.models = new Wh(this), this.fineTuning = new pr(this), this.graders = new ou(this), this.vectorStores = new Cs(this), this.webhooks = new am(this), this.beta = new fr(this), this.batches = new xh(this), this.uploads = new au(this), this.responses = new As(this), this.realtime = new Ts(this), this.conversations = new jl(this), this.evals = new tu(this), this.containers = new Zl(this), this.skills = new xs(this), this.videos = new om(this), o) {
      if (t && t !== ra) throw new te("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ra;
    } else if (t === void 0) throw new te("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: r,
      webhookSecret: i,
      workloadIdentity: o,
      ...s,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && Uv()) throw new te(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? lu.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = bc(u.logLevel, "ClientOptions.logLevel", this) ?? bc(qn("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Vp(), oe(this, Po, qv, "f"), this._options = u, o && (this._workloadIdentityAuth = new s_(o, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = r, this.webhookSecret = i;
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
    return X([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return zv(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Xn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Pp()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ke.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof te ? n : new te(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new te(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !P(this, Ja, "m", lm).call(this) && n || this.baseURL, i = kv(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!uc(o) || !uc(s)) && (t = {
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
    return new eh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, i = r.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(r);
    const { req: o, url: s, timeout: u } = await this.buildRequest(r, { retryCount: i - t });
    await this.prepareRequest(o, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (qe(this).debug(`[${c}] sending request`, _n({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new vt();
    const f = new AbortController(), h = await this.fetchWithAuth(s, o, u, f).catch(Na), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new vt();
      const v = Ma(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return qe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), qe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, _n({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(r, t, n ?? c);
      throw qe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), qe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, _n({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - p,
        message: h.message
      })), h instanceof Gp || h instanceof Mv ? h : v ? new Gl() : new ys({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      if (h.status === 401 && this._workloadIdentityAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await pc(h.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(h);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await pc(h.body), qe(this).info(`${g} - ${E}`), qe(this).debug(`[${c}] response error (${E})`, _n({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(r, t, n ?? c, h.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      qe(this).info(`${g} - ${v}`);
      const b = await h.text().catch((E) => Na(E).message), _ = $v(b), w = _ ? void 0 : b;
      throw qe(this).debug(`[${c}] response error (${v})`, _n({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: w,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, _, w, h.headers);
    }
    return qe(this).info(g), qe(this).debug(`[${c}] response start`, _n({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: r,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
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
    return new r_(this, n, e);
  }
  async fetchWithAuth(e, t, n, r) {
    if (this._workloadIdentityAuth) {
      const i = t.headers, o = i.get("Authorization");
      if (!o || o === `Bearer ${ra}`) {
        const s = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${s}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: i, method: o, ...s } = t || {}, u = this._makeAbort(r);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, p = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    o && (p.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, p);
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
    return await Ci(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && Lv("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: p } = this.buildBody({ options: n });
    return p && (e.__metadata = {
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
    const o = X([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Gv(),
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
    const n = X([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, i = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !i
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Kp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...P(this, Po, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
lu = fe, Po = /* @__PURE__ */ new WeakMap(), Ja = /* @__PURE__ */ new WeakSet(), lm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
fe.OpenAI = lu;
fe.DEFAULT_TIMEOUT = 6e5;
fe.OpenAIError = te;
fe.APIError = Ke;
fe.APIConnectionError = ys;
fe.APIConnectionTimeoutError = Gl;
fe.APIUserAbortError = vt;
fe.NotFoundError = Dp;
fe.ConflictError = Lp;
fe.RateLimitError = Up;
fe.BadRequestError = Mp;
fe.AuthenticationError = Np;
fe.InternalServerError = Fp;
fe.PermissionDeniedError = kp;
fe.UnprocessableEntityError = $p;
fe.InvalidWebhookSignatureError = Kr;
fe.toFile = d_;
fe.Completions = Dh;
fe.Chat = Yl;
fe.Embeddings = Uh;
fe.Files = Bh;
fe.Images = Kh;
fe.Audio = Ri;
fe.Moderations = Jh;
fe.Models = Wh;
fe.FineTuning = pr;
fe.Graders = ou;
fe.VectorStores = Cs;
fe.Webhooks = am;
fe.Beta = fr;
fe.Batches = xh;
fe.Uploads = au;
fe.Responses = As;
fe.Realtime = Ts;
fe.Conversations = jl;
fe.Evals = tu;
fe.Containers = Zl;
fe.Skills = xs;
fe.Videos = om;
function K_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Tt(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function W_(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function ia(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (Tt(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function bn(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Tt(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => bn(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Tt(e, n, t.text), typeof t.content == "string" && Tt(e, n, t.content), typeof t.reasoning_content == "string" && Tt(e, n, t.reasoning_content), typeof t.thinking == "string" && Tt(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        Tt(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && Tt(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function J_(e = {}, t = {}) {
  const n = [];
  return bn(n, e.reasoning_content, "推理文本"), bn(n, e.reasoning, "推理文本"), bn(n, e.reasoning_text, "推理文本"), bn(n, e.thinking, "思考块"), bn(n, t.reasoning_content, "推理文本"), bn(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Tt(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        Tt(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && Tt(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Bc(e = "") {
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
function Oc(e) {
  const t = (e.tools || []).map((n) => [`- ${n.function.name}: ${n.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(n.function.parameters || {})}`].join(`
`)).join(`
`);
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    "用 <tool_call> 和 </tool_call> 明确 JSON 范围，请严格输出如下边界标记和包裹的 JSON，不要改写边界标记：",
    '<tool_call>{"name":"工具名","arguments":{...}}</tool_call>',
    "如果需要多个工具调用，可以连续输出多段 <tool_call> ... </tool_call>。",
    "在输出第一个 <tool_call> 之前，可根据任务复杂度决定是否需要先说明：简单查询可直接输出 <tool_call>；复杂任务可先简要说明你准备查什么或怎么查。",
    "一旦开始输出第一个 <tool_call>，就不要再继续输出面向用户的正文、解释、总结或补充；把本轮需要的 tool_call 连续输出完就结束。",
    t ? `可用工具:
${t}` : ""
  ].filter(Boolean).join(`

`);
}
function z_(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const r of e.messages || []) {
    if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
      const i = r.tool_calls.map((o, s) => {
        const u = o.function?.name || "", c = o.id || `tool-call-${s + 1}`;
        return u && t.set(c, u), `<tool_call>${JSON.stringify({
          id: c,
          name: u,
          arguments: K_(o.function?.arguments || "{}")
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
    content: Oc(e)
  }) : n[0] = {
    ...n[0],
    content: Oc({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function Y_(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var X_ = class {
  constructor(e) {
    this.config = e, this.client = new fe({
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
      messages: t ? z_(e) : e.messages,
      tools: t ? void 0 : e.tools,
      tool_choice: t ? void 0 : e.toolChoice || "auto",
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    if (!e.reasoning?.enabled && typeof e.temperature == "number" && (n.temperature = e.temperature), e.reasoning?.enabled && (n.reasoning_effort = e.reasoning.effort), typeof e.onStreamProgress == "function") {
      const f = await this.client.chat.completions.create({
        ...n,
        stream: !0
      }, { signal: e.signal }), h = {
        content: "",
        toolCalls: []
      };
      let m = "stop", g = this.config.model;
      for await (const w of f) {
        g = w.model || g;
        const E = w.choices?.[0], T = E?.delta || {};
        E?.finish_reason && (m = E.finish_reason), typeof T.content == "string" && (h.content += T.content), Array.isArray(T.tool_calls) && T.tool_calls.forEach((k) => {
          const x = Number(k.index ?? 0), N = h.toolCalls[x] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          h.toolCalls[x] = {
            ...N,
            id: k.id || N.id,
            type: k.type || N.type,
            function: {
              name: k.function?.name || N.function?.name || "",
              arguments: `${N.function?.arguments || ""}${k.function?.arguments || ""}`
            }
          };
        });
        const S = ia(h.content);
        Y_(e, {
          text: h.toolCalls.filter((k) => k?.function?.name).length ? S.cleaned : S.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: S.thoughts
        });
      }
      const y = h.toolCalls.map((w) => ({
        id: w.id || `openai-tool-${Date.now()}`,
        name: w.function?.name || "",
        arguments: w.function?.arguments || "{}"
      })).filter((w) => w.name), v = ia(h.content), b = y.length ? [] : Bc(v.cleaned), _ = [...y, ...b];
      return {
        text: y.length ? v.cleaned : v.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: _,
        thoughts: v.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const r = await this.client.chat.completions.create(n, { signal: e.signal }), i = r.choices?.[0] || {}, o = i.message || {}, s = J_(o, i), u = (o.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = ia(W_(o.content));
    c.thoughts.forEach((f) => s.push(f));
    const d = u.length ? [] : Bc(c.cleaned), p = [...u, ...d];
    return {
      text: u.length ? c.cleaned : c.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
      toolCalls: p,
      thoughts: s,
      finishReason: i.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "openai-compatible"
    };
  }
};
function um(e, t) {
  return {
    type: "message",
    role: e,
    content: Q_(t)
  };
}
function Yo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Q_(e) {
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
function Xo(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Gc(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Xo(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Xo(e, n.summary || "推理摘要", r.text);
    }
  });
}
function Z_(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Gc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Gc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function j_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function eb(e) {
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
function tb(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const i = n.toLowerCase();
  return !i.includes("proxy error") || !i.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function nb(e) {
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
        n.content?.trim() && t.push(Yo(n.content)), n.tool_calls.forEach((r, i) => {
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
        t.push(Yo(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? um(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function rb(e) {
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
      n.content?.trim() && t.push(Yo(n.content)), n.tool_calls.forEach((r, i) => {
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
      t.push(Yo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? um(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function ib(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function ob(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function sb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function oa(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [i = "0", o = "0"] = String(t || "").split(":");
  return Number(n) - Number(i) || Number(r) - Number(o);
}
var ab = class {
  constructor(e) {
    this.config = e, this.client = new fe({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = tb(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const p = Array.isArray(c.output) ? c.output : [];
      return {
        output: p,
        thoughts: Z_(p),
        toolCalls: p.filter((f) => f.type === "function_call" && f.name).map((f, h) => ({
          id: f.call_id || `response-tool-${h + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: eb(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : j_(e) || void 0,
        input: c ? rb(e) : nb(e),
        ...Array.isArray(e.tools) && e.tools.length ? {
          tools: e.tools.map((p) => ({
            type: "function",
            name: p.function.name,
            description: p.function.description,
            parameters: p.function.parameters
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
      const d = n(c), p = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const y = [];
        Array.from(h.entries()).sort(([v], [b]) => oa(v, b)).forEach(([, v]) => Xo(y, "推理文本", v)), Array.from(m.entries()).sort(([v], [b]) => oa(v, b)).forEach(([, v]) => Xo(y, "推理摘要", v)), sb(e, {
          text: Array.from(f.entries()).sort(([v], [b]) => oa(v, b)).map(([, v]) => v).join(`
`).trim(),
          thoughts: y
        });
      };
      return p.on("response.output_text.delta", (y) => {
        const v = `${y.output_index}:${y.content_index}`;
        f.set(v, `${f.get(v) || ""}${y.delta}`), g();
      }), p.on("response.reasoning_text.delta", (y) => {
        const v = `${y.output_index}:${y.content_index}`;
        h.set(v, `${h.get(v) || ""}${y.delta}`), g();
      }), p.on("response.reasoning_summary_text.delta", (y) => {
        const v = `${y.output_index}:${y.summary_index}`;
        m.set(v, `${m.get(v) || ""}${y.delta}`), g();
      }), await p.finalResponse();
    }, o = !ib(this.config.baseUrl);
    let s, u;
    try {
      s = typeof e.onStreamProgress == "function" ? await i(!1) : await r(!1), u = t(s), o && !u.text && !u.toolCalls.length && (s = typeof e.onStreamProgress == "function" ? await i(!0) : await r(!0), u = t(s));
    } catch (c) {
      if (!o || !ob(c)) throw c;
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
function Y(e, t, n, r, i) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function I(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var cm = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return cm = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function yi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var za = (e) => {
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
}, ae = class extends Error {
}, pt = class Ya extends ae {
  constructor(t, n, r, i, o) {
    super(`${Ya.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("request-id"), this.error = n, this.type = o ?? null;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new Is({
      message: r,
      cause: za(n)
    });
    const o = n, s = o?.error?.type;
    return t === 400 ? new fm(t, o, r, i, s) : t === 401 ? new pm(t, o, r, i, s) : t === 403 ? new hm(t, o, r, i, s) : t === 404 ? new mm(t, o, r, i, s) : t === 409 ? new gm(t, o, r, i, s) : t === 422 ? new ym(t, o, r, i, s) : t === 429 ? new vm(t, o, r, i, s) : t >= 500 ? new _m(t, o, r, i, s) : new Ya(t, o, r, i, s);
  }
}, xt = class extends pt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Is = class extends pt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, dm = class extends Is {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, fm = class extends pt {
}, pm = class extends pt {
}, hm = class extends pt {
}, mm = class extends pt {
}, gm = class extends pt {
}, ym = class extends pt {
}, vm = class extends pt {
}, _m = class extends pt {
}, lb = /^[a-z][a-z0-9+.-]*:/i, ub = (e) => lb.test(e), Xa = (e) => (Xa = Array.isArray, Xa(e)), qc = Xa;
function Qa(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Vc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function cb(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var db = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ae(`${e} must be an integer`);
  if (t < 0) throw new ae(`${e} must be a positive integer`);
  return t;
}, bm = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, fb = (e) => new Promise((t) => setTimeout(t, e)), jn = "0.89.0", pb = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function hb() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var mb = () => {
  const e = hb();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": jn,
    "X-Stainless-OS": Kc(Deno.build.os),
    "X-Stainless-Arch": Hc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": jn,
    "X-Stainless-OS": Kc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Hc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = gb();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function gb() {
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
var Hc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Kc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Wc, yb = () => Wc ?? (Wc = mb());
function vb() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function wm(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Sm(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return wm({
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
function uu(e) {
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
async function _b(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var bb = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function wb(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ae(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Sb(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var Jc;
function cu(e) {
  let t;
  return (Jc ?? (t = new globalThis.TextEncoder(), Jc = t.encode.bind(t)))(e);
}
var zc;
function Yc(e) {
  let t;
  return (zc ?? (t = new globalThis.TextDecoder(), zc = t.decode.bind(t)))(e);
}
var at, lt, Pi = class {
  constructor() {
    at.set(this, void 0), lt.set(this, void 0), Y(this, at, new Uint8Array(), "f"), Y(this, lt, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? cu(e) : e;
    Y(this, at, Sb([I(this, at, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Eb(I(this, at, "f"), I(this, lt, "f"))) != null; ) {
      if (r.carriage && I(this, lt, "f") == null) {
        Y(this, lt, r.index, "f");
        continue;
      }
      if (I(this, lt, "f") != null && (r.index !== I(this, lt, "f") + 1 || r.carriage)) {
        n.push(Yc(I(this, at, "f").subarray(0, I(this, lt, "f") - 1))), Y(this, at, I(this, at, "f").subarray(I(this, lt, "f")), "f"), Y(this, lt, null, "f");
        continue;
      }
      const i = I(this, lt, "f") !== null ? r.preceding - 1 : r.preceding, o = Yc(I(this, at, "f").subarray(0, i));
      n.push(o), Y(this, at, I(this, at, "f").subarray(r.index), "f"), Y(this, lt, null, "f");
    }
    return n;
  }
  flush() {
    return I(this, at, "f").length ? this.decode(`
`) : [];
  }
};
at = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap();
Pi.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Pi.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Eb(e, t) {
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
function Tb(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Qo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Xc = (e, t, n) => {
  if (e) {
    if (cb(Qo, e)) return e;
    ze(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Qo))}`);
  }
};
function ti() {
}
function zi(e, t, n) {
  return !t || Qo[e] > Qo[n] ? ti : t[e].bind(t);
}
var Ab = {
  error: ti,
  warn: ti,
  info: ti,
  debug: ti
}, Qc = /* @__PURE__ */ new WeakMap();
function ze(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Ab;
  const r = Qc.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: zi("error", t, n),
    warn: zi("warn", t, n),
    info: zi("info", t, n),
    debug: zi("debug", t, n)
  };
  return Qc.set(t, [n, i]), i;
}
var wn = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Ar, vi = class ni {
  constructor(t, n, r) {
    this.iterator = t, Ar.set(this, void 0), this.controller = n, Y(this, Ar, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? ze(r) : console;
    async function* s() {
      if (i) throw new ae("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of xb(t, n)) {
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
            const d = bm(c.data) ?? c.data, p = d?.error?.type;
            throw new pt(void 0, d, void 0, t.headers, p);
          }
        }
        u = !0;
      } catch (c) {
        if (yi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new ni(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new Pi(), c = uu(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (i) throw new ae("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of o())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (yi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new ni(s, n, r);
  }
  [(Ar = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new ni(() => i(t), this.controller, I(this, Ar, "f")), new ni(() => i(n), this.controller, I(this, Ar, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return wm({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = cu(JSON.stringify(i) + `
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
async function* xb(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ae("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ae("Attempted to iterate over a response with no body");
  const n = new Ib(), r = new Pi(), i = uu(e.body);
  for await (const o of Cb(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* Cb(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? cu(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = Tb(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var Ib = class {
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
    let [t, n, r] = Rb(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Rb(e, t) {
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
async function Em(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    if (t.options.stream)
      return ze(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : vi.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Tm(await n.json(), n) : await n.text();
  })();
  return ze(e).debug(`[${r}] response parsed`, wn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
function Tm(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var ri, Am = class xm extends Promise {
  constructor(t, n, r = Em) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, ri.set(this, void 0), Y(this, ri, t, "f");
  }
  _thenUnwrap(t) {
    return new xm(I(this, ri, "f"), this.responsePromise, async (n, r) => Tm(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(I(this, ri, "f"), t))), this.parsedPromise;
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
ri = /* @__PURE__ */ new WeakMap();
var Yi, Cm = class {
  constructor(e, t, n, r) {
    Yi.set(this, void 0), Y(this, Yi, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new ae("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await I(this, Yi, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Yi = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Pb = class extends Am {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await Em(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Mi = class extends Cm {
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
          ...Qa(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Qa(this.options.query),
        after_id: e
      }
    } : null;
  }
}, $t = class extends Cm {
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
        ...Qa(this.options.query),
        page: e
      }
    } : null;
  }
}, Im = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function sr(e, t, n) {
  return Im(), new File(e, t ?? "unknown_file", n);
}
function Mo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Rm = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", du = async (e, t, n = !0) => ({
  ...e,
  body: await Nb(e.body, t, n)
}), Zc = /* @__PURE__ */ new WeakMap();
function Mb(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Zc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return Zc.set(t, r), r;
}
var Nb = async (e, t, n = !0) => {
  if (!await Mb(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([i, o]) => Za(r, i, o, n))), r;
}, kb = (e) => e instanceof Blob && "name" in e, Za = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let i = {};
      const o = n.headers.get("Content-Type");
      o && (i = { type: o }), e.append(t, sr([await n.blob()], Mo(n, r), i));
    } else if (Rm(n)) e.append(t, sr([await new Response(Sm(n)).blob()], Mo(n, r)));
    else if (kb(n)) e.append(t, sr([n], Mo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((i) => Za(e, t + "[]", i, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([i, o]) => Za(e, `${t}[${i}]`, o, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Pm = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Db = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Pm(e), Lb = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function $b(e, t, n) {
  if (Im(), e = await e, t || (t = Mo(e, !0)), Db(e))
    return e instanceof File && t == null && n == null ? e : sr([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Lb(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), sr(await ja(i), t, n);
  }
  const r = await ja(e);
  if (!n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return sr(r, t, n);
}
async function ja(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Pm(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Rm(e)) for await (const n of e) t.push(...await ja(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Ub(e)}`);
  }
  return t;
}
function Ub(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var $e = class {
  constructor(e) {
    this._client = e;
  }
}, Mm = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Fb(e) {
  if (!e) return;
  if (Mm in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : qc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = qc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var H = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of Fb(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [Mm]: !0,
    values: t,
    nulls: n
  };
};
function Nm(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var jc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Bb = (e = Nm) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[h];
    let g = (i ? encodeURIComponent : e)("" + m);
    return h !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? jc) ?? jc)?.toString) && (g = m + "", o.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === r.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) o.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (o.sort((p, f) => p.start - f.start), o.length > 0) {
    let p = 0;
    const f = o.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new ae(`Path parameters result in path with invalid segments:
${o.map((h) => h.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, se = /* @__PURE__ */ Bb(Nm), km = class extends $e {
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
    return this._client.get(se`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/environments/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", $t, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(se`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, di = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function No(e) {
  return typeof e == "object" && e !== null && di in e;
}
function Dm(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) No(r) && n.add(r[di]);
  if (t) {
    for (const r of t)
      if (No(r) && n.add(r[di]), Array.isArray(r.content))
        for (const i of r.content) No(i) && n.add(i[di]);
  }
  return Array.from(n);
}
function Lm(e, t) {
  const n = Dm(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Ob(e) {
  return No(e) ? { "x-stainless-helper": e[di] } : {};
}
var $m = class extends $e {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files", Mi, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/files/${e}`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(se`/v1/files/${e}/content`, {
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
    return this._client.get(se`/v1/files/${e}`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files", du({
      body: r,
      ...t,
      headers: H([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Ob(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Um = class extends $e {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(se`/v1/models/${e}?beta=true`, {
      ...n,
      headers: H([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Mi, {
      query: r,
      ...t,
      headers: H([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Fm = class extends $e {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(se`/v1/agents/${e}/versions?beta=true`, $t, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, fu = class extends $e {
  constructor() {
    super(...arguments), this.versions = new Fm(this._client);
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
    return this._client.get(se`/v1/agents/${e}?beta=true`, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/agents/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", $t, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(se`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
fu.Versions = Fm;
var Bm = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Om(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function ed(e, t, n) {
  const r = Om(t);
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
  } : Gm(e, t, n);
}
function Gm(e, t, n) {
  let r = null;
  const i = e.content.map((o) => {
    if (o.type === "text") {
      const s = Gb(t, o.text);
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
function Gb(e, t) {
  const n = Om(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new ae(`Failed to parse structured output: ${r}`);
  }
}
var qb = (e) => {
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
}, er = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), er(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), er(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), er(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), er(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), er(e);
  }
  return e;
}, Vb = (e) => {
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
}, Hb = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, qm = (e) => JSON.parse(Hb(Vb(er(qb(e))))), gt, Qt, Hn, xr, Xi, Cr, Ir, Qi, Rr, Bt, Pr, Zi, ji, gn, eo, to, Mr, sa, td, no, aa, la, ua, nd, rd = "__json_buf";
function id(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Kb = class el {
  constructor(t, n) {
    gt.add(this), this.messages = [], this.receivedMessages = [], Qt.set(this, void 0), Hn.set(this, null), this.controller = new AbortController(), xr.set(this, void 0), Xi.set(this, () => {
    }), Cr.set(this, () => {
    }), Ir.set(this, void 0), Qi.set(this, () => {
    }), Rr.set(this, () => {
    }), Bt.set(this, {}), Pr.set(this, !1), Zi.set(this, !1), ji.set(this, !1), gn.set(this, !1), eo.set(this, void 0), to.set(this, void 0), Mr.set(this, void 0), no.set(this, (r) => {
      if (Y(this, Zi, !0, "f"), yi(r) && (r = new xt()), r instanceof xt)
        return Y(this, ji, !0, "f"), this._emit("abort", r);
      if (r instanceof ae) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new ae(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new ae(String(r)));
    }), Y(this, xr, new Promise((r, i) => {
      Y(this, Xi, r, "f"), Y(this, Cr, i, "f");
    }), "f"), Y(this, Ir, new Promise((r, i) => {
      Y(this, Qi, r, "f"), Y(this, Rr, i, "f");
    }), "f"), I(this, xr, "f").catch(() => {
    }), I(this, Ir, "f").catch(() => {
    }), Y(this, Hn, t, "f"), Y(this, Mr, n?.logger ?? console, "f");
  }
  get response() {
    return I(this, eo, "f");
  }
  get request_id() {
    return I(this, to, "f");
  }
  async withResponse() {
    Y(this, gn, !0, "f");
    const t = await I(this, xr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new el(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: i } = {}) {
    const o = new el(n, { logger: i });
    for (const s of n.messages) o._addMessageParam(s);
    return Y(o, Hn, {
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
    }, I(this, no, "f"));
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
      I(this, gt, "m", aa).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) I(this, gt, "m", la).call(this, c);
      if (u.controller.signal?.aborted) throw new xt();
      I(this, gt, "m", ua).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (Y(this, eo, t, "f"), Y(this, to, t?.headers.get("request-id"), "f"), I(this, Xi, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return I(this, Pr, "f");
  }
  get errored() {
    return I(this, Zi, "f");
  }
  get aborted() {
    return I(this, ji, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (I(this, Bt, "f")[t] || (I(this, Bt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = I(this, Bt, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (I(this, Bt, "f")[t] || (I(this, Bt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      Y(this, gn, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    Y(this, gn, !0, "f"), await I(this, Ir, "f");
  }
  get currentMessage() {
    return I(this, Qt, "f");
  }
  async finalMessage() {
    return await this.done(), I(this, gt, "m", sa).call(this);
  }
  async finalText() {
    return await this.done(), I(this, gt, "m", td).call(this);
  }
  _emit(t, ...n) {
    if (I(this, Pr, "f")) return;
    t === "end" && (Y(this, Pr, !0, "f"), I(this, Qi, "f").call(this));
    const r = I(this, Bt, "f")[t];
    if (r && (I(this, Bt, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !I(this, gn, "f") && !r?.length && Promise.reject(i), I(this, Cr, "f").call(this, i), I(this, Rr, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !I(this, gn, "f") && !r?.length && Promise.reject(i), I(this, Cr, "f").call(this, i), I(this, Rr, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", I(this, gt, "m", sa).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      I(this, gt, "m", aa).call(this), this._connected(null);
      const o = vi.fromReadableStream(t, this.controller);
      for await (const s of o) I(this, gt, "m", la).call(this, s);
      if (o.controller.signal?.aborted) throw new xt();
      I(this, gt, "m", ua).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(Qt = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Xi = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), Pr = /* @__PURE__ */ new WeakMap(), Zi = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), Mr = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakSet(), sa = function() {
    if (this.receivedMessages.length === 0) throw new ae("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, td = function() {
    if (this.receivedMessages.length === 0) throw new ae("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new ae("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, aa = function() {
    this.ended || Y(this, Qt, void 0, "f");
  }, la = function(n) {
    if (this.ended) return;
    const r = I(this, gt, "m", nd).call(this, n);
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
            id(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(r), this._addMessage(ed(r, I(this, Hn, "f"), { logger: I(this, Mr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        Y(this, Qt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ua = function() {
    if (this.ended) throw new ae("stream has ended, this shouldn't happen");
    const n = I(this, Qt, "f");
    if (!n) throw new ae("request ended without sending any chunks");
    return Y(this, Qt, void 0, "f"), ed(n, I(this, Hn, "f"), { logger: I(this, Mr, "f") });
  }, nd = function(n) {
    let r = I(this, Qt, "f");
    if (n.type === "message_start") {
      if (r) throw new ae(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new ae(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (i && id(i)) {
              let o = i[rd] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              if (Object.defineProperty(s, rd, {
                value: o,
                enumerable: !1,
                writable: !0
              }), o) try {
                s.input = qm(o);
              } catch (u) {
                const c = new ae(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${o}`);
                I(this, no, "f").call(this, c);
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
    return new vi(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Vm = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Wb = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Nr, Kn, yn, De, Ze, it, Vt, Zt, kr, od, tl;
function sd() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var Hm = class {
  constructor(e, t, n) {
    Nr.add(this), this.client = e, Kn.set(this, !1), yn.set(this, !1), De.set(this, void 0), Ze.set(this, void 0), it.set(this, void 0), Vt.set(this, void 0), Zt.set(this, void 0), kr.set(this, 0), Y(this, De, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Dm(t.tools, t.messages)].join(", ");
    Y(this, Ze, {
      ...n,
      headers: H([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), Y(this, Zt, sd(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Kn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), Zt = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakSet(), od = async function() {
    const t = I(this, De, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (I(this, it, "f") !== void 0) try {
      const c = await I(this, it, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const i = t.model ?? I(this, De, "f").params.model, o = t.summaryPrompt ?? Wb, s = I(this, De, "f").params.messages;
    if (s[s.length - 1].role === "assistant") {
      const c = s[s.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((p) => p.type !== "tool_use");
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
      max_tokens: I(this, De, "f").params.max_tokens
    }, {
      signal: I(this, Ze, "f").signal,
      headers: H([I(this, Ze, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new ae("Expected text response for compaction");
    return I(this, De, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (I(this, Kn, "f")) throw new ae("Cannot iterate over a consumed stream");
    Y(this, Kn, !0, "f"), Y(this, yn, !0, "f"), Y(this, Vt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (I(this, De, "f").params.max_iterations && I(this, kr, "f") >= I(this, De, "f").params.max_iterations) break;
          Y(this, yn, !1, "f"), Y(this, Vt, void 0, "f"), Y(this, kr, (e = I(this, kr, "f"), e++, e), "f"), Y(this, it, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...i } = I(this, De, "f").params;
          if (i.stream ? (t = this.client.beta.messages.stream({ ...i }, I(this, Ze, "f")), Y(this, it, t.finalMessage(), "f"), I(this, it, "f").catch(() => {
          }), yield t) : (Y(this, it, this.client.beta.messages.create({
            ...i,
            stream: !1
          }, I(this, Ze, "f")), "f"), yield I(this, it, "f")), !await I(this, Nr, "m", od).call(this)) {
            if (!I(this, yn, "f")) {
              const { role: s, content: u } = await I(this, it, "f");
              I(this, De, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const o = await I(this, Nr, "m", tl).call(this, I(this, De, "f").params.messages.at(-1));
            if (o) I(this, De, "f").params.messages.push(o);
            else if (!I(this, yn, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!I(this, it, "f")) throw new ae("ToolRunner concluded without a message from the server");
      I(this, Zt, "f").resolve(await I(this, it, "f"));
    } catch (t) {
      throw Y(this, Kn, !1, "f"), I(this, Zt, "f").promise.catch(() => {
      }), I(this, Zt, "f").reject(t), Y(this, Zt, sd(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? I(this, De, "f").params = e(I(this, De, "f").params) : I(this, De, "f").params = e, Y(this, yn, !0, "f"), Y(this, Vt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? Y(this, Ze, e(I(this, Ze, "f")), "f") : Y(this, Ze, {
      ...I(this, Ze, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = I(this, Ze, "f").signal) {
    const t = await I(this, it, "f") ?? this.params.messages.at(-1);
    return t ? I(this, Nr, "m", tl).call(this, t, e) : null;
  }
  done() {
    return I(this, Zt, "f").promise;
  }
  async runUntilDone() {
    if (!I(this, Kn, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return I(this, De, "f").params;
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
tl = async function(t, n = I(this, Ze, "f").signal) {
  return I(this, Vt, "f") !== void 0 ? I(this, Vt, "f") : (Y(this, Vt, Jb(I(this, De, "f").params, t, {
    ...I(this, Ze, "f"),
    signal: n
  }), "f"), I(this, Vt, "f"));
};
async function Jb(e, t = e.messages.at(-1), n) {
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
          content: s instanceof Vm ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Km = class Wm {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Pi();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ae("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ae("Attempted to iterate over a response with no body");
    return new Wm(uu(t.body), n);
  }
}, Jm = class extends $e {
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
    return this._client.get(se`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Mi, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(se`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new ae(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: i } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: H([{
        "anthropic-beta": [...i ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => Km.fromResponse(s.response, s.controller));
  }
}, ad = {
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
}, zb = ["claude-opus-4-6"], Ni = class extends $e {
  constructor() {
    super(...arguments), this.batches = new Jm(this._client);
  }
  create(e, t) {
    const n = ld(e), { betas: r, ...i } = n;
    i.model in ad && console.warn(`The model '${i.model}' is deprecated and will reach end-of-life on ${ad[i.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), i.model in zb && i.thinking && i.thinking.type === "enabled" && console.warn(`Using Claude with ${i.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let o = this._client._options.timeout;
    if (!i.stream && o == null) {
      const u = Bm[i.model] ?? void 0;
      o = this._client.calculateNonstreamingTimeout(i.max_tokens, u);
    }
    const s = Lm(i.tools, i.messages);
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
    }, this.create(e, t).then((n) => Gm(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Kb.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = ld(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Hm(this._client, e, t);
  }
};
function ld(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new ae("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Ni.Batches = Jm;
Ni.BetaToolRunner = Hm;
Ni.ToolError = Vm;
var zm = class extends $e {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(se`/v1/sessions/${e}/events?beta=true`, $t, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/sessions/${e}/events?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(se`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Ym = class extends $e {
  retrieve(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.get(se`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: i, ...o } = t;
    return this._client.post(se`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: o,
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(se`/v1/sessions/${e}/resources?beta=true`, $t, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.delete(se`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/sessions/${e}/resources?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Rs = class extends $e {
  constructor() {
    super(...arguments), this.events = new zm(this._client), this.resources = new Ym(this._client);
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
    return this._client.get(se`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/sessions/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", $t, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(se`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Rs.Events = zm;
Rs.Resources = Ym;
var Xm = class extends $e {
  create(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.post(se`/v1/skills/${e}/versions?beta=true`, du({
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.get(se`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(se`/v1/skills/${e}/versions?beta=true`, $t, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.delete(se`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, pu = class extends $e {
  constructor() {
    super(...arguments), this.versions = new Xm(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", du({
      body: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(se`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", $t, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
pu.Versions = Xm;
var Qm = class extends $e {
  create(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/vaults/${e}/credentials?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.get(se`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: i, ...o } = t;
    return this._client.post(se`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: o,
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(se`/v1/vaults/${e}/credentials?beta=true`, $t, {
      query: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.delete(se`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.post(se`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, hu = class extends $e {
  constructor() {
    super(...arguments), this.credentials = new Qm(this._client);
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
    return this._client.get(se`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(se`/v1/vaults/${e}?beta=true`, {
      body: i,
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", $t, {
      query: r,
      ...t,
      headers: H([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(se`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(se`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: H([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
hu.Credentials = Qm;
var Ut = class extends $e {
  constructor() {
    super(...arguments), this.models = new Um(this._client), this.messages = new Ni(this._client), this.agents = new fu(this._client), this.environments = new km(this._client), this.sessions = new Rs(this._client), this.vaults = new hu(this._client), this.files = new $m(this._client), this.skills = new pu(this._client);
  }
};
Ut.Models = Um;
Ut.Messages = Ni;
Ut.Agents = fu;
Ut.Environments = km;
Ut.Sessions = Rs;
Ut.Vaults = hu;
Ut.Files = $m;
Ut.Skills = pu;
var Zm = class extends $e {
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
function jm(e) {
  return e?.output_config?.format;
}
function ud(e, t, n) {
  const r = jm(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((i) => i.type === "text" ? Object.defineProperty({ ...i }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : i),
    parsed_output: null
  } : eg(e, t, n);
}
function eg(e, t, n) {
  let r = null;
  const i = e.content.map((o) => {
    if (o.type === "text") {
      const s = Yb(t, o.text);
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
function Yb(e, t) {
  const n = jm(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new ae(`Failed to parse structured output: ${r}`);
  }
}
var yt, jt, Wn, Dr, ro, Lr, $r, io, Ur, Ot, Fr, oo, so, vn, ao, lo, Br, ca, cd, da, fa, pa, ha, dd, fd = "__json_buf";
function pd(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Xb = class nl {
  constructor(t, n) {
    yt.add(this), this.messages = [], this.receivedMessages = [], jt.set(this, void 0), Wn.set(this, null), this.controller = new AbortController(), Dr.set(this, void 0), ro.set(this, () => {
    }), Lr.set(this, () => {
    }), $r.set(this, void 0), io.set(this, () => {
    }), Ur.set(this, () => {
    }), Ot.set(this, {}), Fr.set(this, !1), oo.set(this, !1), so.set(this, !1), vn.set(this, !1), ao.set(this, void 0), lo.set(this, void 0), Br.set(this, void 0), da.set(this, (r) => {
      if (Y(this, oo, !0, "f"), yi(r) && (r = new xt()), r instanceof xt)
        return Y(this, so, !0, "f"), this._emit("abort", r);
      if (r instanceof ae) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new ae(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new ae(String(r)));
    }), Y(this, Dr, new Promise((r, i) => {
      Y(this, ro, r, "f"), Y(this, Lr, i, "f");
    }), "f"), Y(this, $r, new Promise((r, i) => {
      Y(this, io, r, "f"), Y(this, Ur, i, "f");
    }), "f"), I(this, Dr, "f").catch(() => {
    }), I(this, $r, "f").catch(() => {
    }), Y(this, Wn, t, "f"), Y(this, Br, n?.logger ?? console, "f");
  }
  get response() {
    return I(this, ao, "f");
  }
  get request_id() {
    return I(this, lo, "f");
  }
  async withResponse() {
    Y(this, vn, !0, "f");
    const t = await I(this, Dr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new nl(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: i } = {}) {
    const o = new nl(n, { logger: i });
    for (const s of n.messages) o._addMessageParam(s);
    return Y(o, Wn, {
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
    }, I(this, da, "f"));
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
      I(this, yt, "m", fa).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) I(this, yt, "m", pa).call(this, c);
      if (u.controller.signal?.aborted) throw new xt();
      I(this, yt, "m", ha).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (Y(this, ao, t, "f"), Y(this, lo, t?.headers.get("request-id"), "f"), I(this, ro, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return I(this, Fr, "f");
  }
  get errored() {
    return I(this, oo, "f");
  }
  get aborted() {
    return I(this, so, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (I(this, Ot, "f")[t] || (I(this, Ot, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = I(this, Ot, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (I(this, Ot, "f")[t] || (I(this, Ot, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      Y(this, vn, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    Y(this, vn, !0, "f"), await I(this, $r, "f");
  }
  get currentMessage() {
    return I(this, jt, "f");
  }
  async finalMessage() {
    return await this.done(), I(this, yt, "m", ca).call(this);
  }
  async finalText() {
    return await this.done(), I(this, yt, "m", cd).call(this);
  }
  _emit(t, ...n) {
    if (I(this, Fr, "f")) return;
    t === "end" && (Y(this, Fr, !0, "f"), I(this, io, "f").call(this));
    const r = I(this, Ot, "f")[t];
    if (r && (I(this, Ot, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !I(this, vn, "f") && !r?.length && Promise.reject(i), I(this, Lr, "f").call(this, i), I(this, Ur, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !I(this, vn, "f") && !r?.length && Promise.reject(i), I(this, Lr, "f").call(this, i), I(this, Ur, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", I(this, yt, "m", ca).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      I(this, yt, "m", fa).call(this), this._connected(null);
      const o = vi.fromReadableStream(t, this.controller);
      for await (const s of o) I(this, yt, "m", pa).call(this, s);
      if (o.controller.signal?.aborted) throw new xt();
      I(this, yt, "m", ha).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(jt = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Dr = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap(), Lr = /* @__PURE__ */ new WeakMap(), $r = /* @__PURE__ */ new WeakMap(), io = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), Fr = /* @__PURE__ */ new WeakMap(), oo = /* @__PURE__ */ new WeakMap(), so = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), ao = /* @__PURE__ */ new WeakMap(), lo = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), da = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakSet(), ca = function() {
    if (this.receivedMessages.length === 0) throw new ae("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, cd = function() {
    if (this.receivedMessages.length === 0) throw new ae("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new ae("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, fa = function() {
    this.ended || Y(this, jt, void 0, "f");
  }, pa = function(n) {
    if (this.ended) return;
    const r = I(this, yt, "m", dd).call(this, n);
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
            pd(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(r), this._addMessage(ud(r, I(this, Wn, "f"), { logger: I(this, Br, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        Y(this, jt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ha = function() {
    if (this.ended) throw new ae("stream has ended, this shouldn't happen");
    const n = I(this, jt, "f");
    if (!n) throw new ae("request ended without sending any chunks");
    return Y(this, jt, void 0, "f"), ud(n, I(this, Wn, "f"), { logger: I(this, Br, "f") });
  }, dd = function(n) {
    let r = I(this, jt, "f");
    if (n.type === "message_start") {
      if (r) throw new ae(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new ae(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (i && pd(i)) {
              let o = i[fd] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              Object.defineProperty(s, fd, {
                value: o,
                enumerable: !1,
                writable: !0
              }), o && (s.input = qm(o)), r.content[n.index] = s;
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
    return new vi(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var tg = class extends $e {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(se`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", Mi, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(se`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(se`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new ae(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: H([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, i) => Km.fromResponse(i.response, i.controller));
  }
}, mu = class extends $e {
  constructor() {
    super(...arguments), this.batches = new tg(this._client);
  }
  create(e, t) {
    e.model in hd && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${hd[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in Qb && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const i = Bm[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, i);
    }
    const r = Lm(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: H([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => eg(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Xb.createMessage(this, e, t, { logger: this._client.logger ?? console });
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
}, Qb = ["claude-opus-4-6"];
mu.Batches = tg;
var ng = class extends $e {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(se`/v1/models/${e}`, {
      ...n,
      headers: H([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Mi, {
      query: r,
      ...t,
      headers: H([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, uo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, rl, gu, ko, rg, Zb = "\\n\\nHuman:", jb = "\\n\\nAssistant:", Ne = class {
  constructor({ baseURL: e = uo("ANTHROPIC_BASE_URL"), apiKey: t = uo("ANTHROPIC_API_KEY") ?? null, authToken: n = uo("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    rl.add(this), ko.set(this, void 0);
    const i = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!i.dangerouslyAllowBrowser && pb()) throw new ae(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? gu.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const o = "warn";
    this.logLevel = o, this.logLevel = Xc(i.logLevel, "ClientOptions.logLevel", this) ?? Xc(uo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? o, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? vb(), Y(this, ko, bb, "f"), this._options = i, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return wb(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${jn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${cm()}`;
  }
  makeStatusError(e, t, n, r) {
    return pt.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !I(this, rl, "m", rg).call(this) && n || this.baseURL, i = ub(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!Vc(o) || !Vc(s)) && (t = {
      ...s,
      ...o,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new ae("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Am(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, i = r.maxRetries ?? this.maxRetries;
    t == null && (t = i), await this.prepareOptions(r);
    const { req: o, url: s, timeout: u } = await this.buildRequest(r, { retryCount: i - t });
    await this.prepareRequest(o, {
      url: s,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (ze(this).debug(`[${c}] sending request`, wn({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new xt();
    const f = new AbortController(), h = await this.fetchWithTimeout(s, o, u, f).catch(za), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new xt();
      const v = yi(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return ze(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), ze(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, wn({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(r, t, n ?? c);
      throw ze(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), ze(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, wn({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - p,
        message: h.message
      })), v ? new dm() : new Is({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      const y = await this.shouldRetry(h);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await _b(h.body), ze(this).info(`${g} - ${E}`), ze(this).debug(`[${c}] response error (${E})`, wn({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(r, t, n ?? c, h.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      ze(this).info(`${g} - ${v}`);
      const b = await h.text().catch((E) => za(E).message), _ = bm(b), w = _ ? void 0 : b;
      throw ze(this).debug(`[${c}] response error (${v})`, wn({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: w,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, _, w, h.headers);
    }
    return ze(this).info(g), ze(this).debug(`[${c}] response start`, wn({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: r,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
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
    return new Pb(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: i, method: o, ...s } = t || {}, u = this._makeAbort(r);
    i && i.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, p = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    o && (p.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, p);
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
    return await fb(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new ae("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && db("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...yb(),
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
      body: Sm(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : I(this, ko, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
gu = Ne, ko = /* @__PURE__ */ new WeakMap(), rl = /* @__PURE__ */ new WeakSet(), rg = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Ne.Anthropic = gu;
Ne.HUMAN_PROMPT = Zb;
Ne.AI_PROMPT = jb;
Ne.DEFAULT_TIMEOUT = 6e5;
Ne.AnthropicError = ae;
Ne.APIError = pt;
Ne.APIConnectionError = Is;
Ne.APIConnectionTimeoutError = dm;
Ne.APIUserAbortError = xt;
Ne.NotFoundError = mm;
Ne.ConflictError = gm;
Ne.RateLimitError = vm;
Ne.BadRequestError = fm;
Ne.AuthenticationError = pm;
Ne.InternalServerError = _m;
Ne.PermissionDeniedError = hm;
Ne.UnprocessableEntityError = ym;
Ne.toFile = $b;
var ki = class extends Ne {
  constructor() {
    super(...arguments), this.completions = new Zm(this), this.messages = new mu(this), this.models = new ng(this), this.beta = new Ut(this);
  }
};
ki.Completions = Zm;
ki.Messages = mu;
ki.Models = ng;
ki.Beta = Ut;
function ew(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function tw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function ig(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function nw(e) {
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
      const r = tw(n.image_url.url);
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
function rw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function iw(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && ig(t) || null;
}
function ow(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: ig(e.content) || [] } : void 0;
}
function sw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((r) => {
    (r.tool_calls || []).forEach((i) => {
      i.id && i.function?.name && n.set(i.id, i.function.name);
    });
  });
  for (const r of e)
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const i = iw(r);
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
            input: ew(i.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: nw(r.content)
      });
    }
  return t;
}
function ma(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var aw = class {
  constructor(e) {
    this.config = e, this.client = new ki({
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
    })), n = rw(e), r = {
      model: this.config.model,
      system: n,
      messages: sw(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.thinking = {
      type: "adaptive",
      display: "summarized"
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const s = this.client.messages.stream(r, { signal: e.signal }), u = /* @__PURE__ */ new Map(), c = () => Array.from(u.entries()).sort(([d], [p]) => d.localeCompare(p)).map(([d, p]) => ({
        label: d.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: p
      })).filter((d) => d.text);
      s.on("text", (d, p) => {
        ma(e, {
          text: p || "",
          thoughts: c()
        });
      }), s.on("thinking", (d, p) => {
        u.set("thinking:0", p || ""), ma(e, { thoughts: c() });
      }), s.on("contentBlock", (d) => {
        d?.type === "redacted_thinking" && (u.set("redacted:0", d.data || ""), ma(e, { thoughts: c() }));
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
      providerPayload: ow(i)
    };
  }
}, lw = /* @__PURE__ */ gs(((e, t) => {
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
})), uw = /* @__PURE__ */ gs(((e) => {
  var t = lw();
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
      n[u] = function(p) {
        var f = e.operation(r), h = Array.prototype.slice.call(arguments, 1), m = h.pop();
        h.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          p.apply(n, h);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), cw = /* @__PURE__ */ gs(((e, t) => {
  t.exports = uw();
})), dw = /* @__PURE__ */ gs(((e, t) => {
  var n = cw(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], i = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, o = (c, d, p) => {
    const f = p.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, s = (c) => r.includes(c), u = (c, d) => new Promise((p, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const h = n.operation(d);
    h.attempt(async (m) => {
      try {
        p(await c(m));
      } catch (g) {
        if (!(g instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof i)
          h.stop(), f(g.originalError);
        else if (g instanceof TypeError && !s(g.message))
          h.stop(), f(g);
        else {
          o(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (y) {
            f(y);
            return;
          }
          h.retry(g) || f(h.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = i;
})), md = /* @__PURE__ */ Pv(dw(), 1), fw = void 0, pw = void 0;
function hw() {
  return {
    geminiUrl: fw,
    vertexUrl: pw
  };
}
function mw(e, t, n, r) {
  var i, o;
  if (!e?.baseUrl) {
    const s = hw();
    return t ? (i = s.vertexUrl) !== null && i !== void 0 ? i : n : (o = s.geminiUrl) !== null && o !== void 0 ? o : r;
  }
  return e.baseUrl;
}
var Jt = class {
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
          const p = c[d];
          l(p, t.slice(o + 1), n[d]);
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
function gw(e, t) {
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
    il(e, i, o, 0, s);
  }
}
function il(e, t, n, r, i) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const o = t[r];
  if (o.endsWith("[]")) {
    const s = o.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) il(c, t, n, r + 1, i);
  } else if (o === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const s = e, u = Object.keys(s).filter((d) => !d.startsWith("_") && !i.has(d)), c = {};
      for (const d of u) c[d] = s[d];
      for (const [d, p] of Object.entries(c)) {
        const f = [];
        for (const h of n.slice(r)) h === "*" ? f.push(d) : f.push(h);
        l(s, f, p);
      }
      for (const d of u) delete s[d];
    }
  } else {
    const s = e;
    o in s && il(s[o], t, n, r + 1, i);
  }
}
function yu(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function yw(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = a(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function vw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], bw(s)), t;
}
function _w(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], ww(s)), t;
}
function bw(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Sw(s))), l(t, ["generatedVideos"], o);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(t, ["raiMediaFilteredReasons"], i), t;
}
function ww(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Ew(s))), l(t, ["generatedVideos"], o);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(t, ["raiMediaFilteredReasons"], i), t;
}
function Sw(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], Rw(n)), t;
}
function Ew(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], Pw(n)), t;
}
function Tw(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Aw(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function xw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], Cw(s)), t;
}
function Cw(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function og(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], Iw(s)), t;
}
function Iw(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function Rw(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], yu(r));
  const i = a(e, ["encoding"]);
  return i != null && l(t, ["mimeType"], i), t;
}
function Pw(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], yu(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(t, ["mimeType"], i), t;
}
var gd;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(gd || (gd = {}));
var yd;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(yd || (yd = {}));
var vd;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(vd || (vd = {}));
var nn;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(nn || (nn = {}));
var _d;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(_d || (_d = {}));
var bd;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(bd || (bd = {}));
var wd;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(wd || (wd = {}));
var Sd;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Sd || (Sd = {}));
var Ed;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Ed || (Ed = {}));
var Td;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Td || (Td = {}));
var Ad;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Ad || (Ad = {}));
var ol;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(ol || (ol = {}));
var fi;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(fi || (fi = {}));
var xd;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(xd || (xd = {}));
var Cd;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Cd || (Cd = {}));
var Id;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Id || (Id = {}));
var Rd;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Rd || (Rd = {}));
var Pd;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Pd || (Pd = {}));
var Md;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Md || (Md = {}));
var Nd;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Nd || (Nd = {}));
var kd;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(kd || (kd = {}));
var Dd;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Dd || (Dd = {}));
var Ld;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ld || (Ld = {}));
var $d;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})($d || ($d = {}));
var Zo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Zo || (Zo = {}));
var Ud;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Ud || (Ud = {}));
var Fd;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Fd || (Fd = {}));
var Bd;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Bd || (Bd = {}));
var Od;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Od || (Od = {}));
var sl;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(sl || (sl = {}));
var Gd;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Gd || (Gd = {}));
var qd;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(qd || (qd = {}));
var Vd;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Vd || (Vd = {}));
var Hd;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Hd || (Hd = {}));
var Kd;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Kd || (Kd = {}));
var Wd;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Wd || (Wd = {}));
var Jd;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Jd || (Jd = {}));
var al;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(al || (al = {}));
var zd;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(zd || (zd = {}));
var Yd;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Yd || (Yd = {}));
var jo;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(jo || (jo = {}));
var Xd;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Xd || (Xd = {}));
var Qd;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Qd || (Qd = {}));
var Zd;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Zd || (Zd = {}));
var jd;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(jd || (jd = {}));
var ef;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(ef || (ef = {}));
var tf;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(tf || (tf = {}));
var nf;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(nf || (nf = {}));
var rf;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(rf || (rf = {}));
var of;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(of || (of = {}));
var sf;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(sf || (sf = {}));
var af;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(af || (af = {}));
var lf;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(lf || (lf = {}));
var uf;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(uf || (uf = {}));
var cf;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(cf || (cf = {}));
var df;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(df || (df = {}));
var ff;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(ff || (ff = {}));
var pf;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(pf || (pf = {}));
var hf;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(hf || (hf = {}));
var mf;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(mf || (mf = {}));
var gf;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(gf || (gf = {}));
var yf;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(yf || (yf = {}));
var vf;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(vf || (vf = {}));
var _f;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(_f || (_f = {}));
var rr;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(rr || (rr = {}));
var ll = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Or = class {
  get text() {
    var e, t, n, r, i, o, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const p = [];
    for (const f of (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [h, m] of Object.entries(f)) h !== "text" && h !== "thought" && h !== "thoughtSignature" && (m !== null || m !== void 0) && p.push(h);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return p.length > 0 && console.warn(`there are non-text parts ${p} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, i, o, s, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const p of (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, h] of Object.entries(p)) f !== "inlineData" && (h !== null || h !== void 0) && d.push(f);
      p.inlineData && typeof p.inlineData.data == "string" && (c += atob(p.inlineData.data));
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
    const d = (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.executableCode).map((p) => p.executableCode).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, i, o, s, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (s = (o = (i = this.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.codeExecutionResult).map((p) => p.codeExecutionResult).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, bf = class {
}, wf = class {
}, Mw = class {
}, Nw = class {
}, kw = class {
}, Dw = class {
}, Sf = class {
}, Ef = class {
}, Tf = class {
}, Lw = class {
}, Af = class sg {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new sg();
    let i;
    const o = t;
    return n ? i = _w(o) : i = vw(o), Object.assign(r, i), r;
  }
}, xf = class {
}, Cf = class {
}, If = class {
}, Rf = class {
}, $w = class {
}, Uw = class {
}, Fw = class {
}, Bw = class ag {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new ag(), i = xw(t);
    return Object.assign(r, i), r;
  }
}, Ow = class {
}, Gw = class {
}, qw = class {
}, Vw = class {
}, Pf = class {
}, Hw = class {
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
}, Kw = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Ww = class lg {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new lg(), i = og(t);
    return Object.assign(r, i), r;
  }
};
function me(e, t) {
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
function ug(e, t) {
  const n = me(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function cg(e) {
  return Array.isArray(e) ? e.map((t) => es(t)) : [es(e)];
}
function es(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function dg(e) {
  const t = es(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function fg(e) {
  const t = es(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Mf(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function pg(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Mf(t)) : [Mf(e)];
}
function ul(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Nf(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function kf(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Oe(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return ul(e) ? e : {
    role: "user",
    parts: pg(e)
  };
}
function vu(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = Oe(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Oe(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Oe(n)) : [Oe(t)];
}
function tt(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Nf(e) || kf(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Oe(e)];
  }
  const t = [], n = [], r = ul(e[0]);
  for (const i of e) {
    const o = ul(i);
    if (o != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (o) t.push(i);
    else {
      if (Nf(i) || kf(i)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(i);
    }
  }
  return r || t.push({
    role: "user",
    parts: pg(n)
  }), t;
}
function Jw(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(nn).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : nn.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(nn).includes(r.toUpperCase()) ? r.toUpperCase() : nn.TYPE_UNSPECIFIED });
  }
}
function ar(e) {
  const t = {}, n = ["items"], r = ["anyOf"], i = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const o = e.anyOf;
  o != null && o.length == 2 && (o[0].type === "null" ? (t.nullable = !0, e = o[1]) : o[1].type === "null" && (t.nullable = !0, e = o[0])), e.type instanceof Array && Jw(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(nn).includes(u.toUpperCase()) ? u.toUpperCase() : nn.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = ar(u);
      else if (r.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(ar(d));
        }
        t[s] = c;
      } else if (i.includes(s)) {
        const c = {};
        for (const [d, p] of Object.entries(u)) c[d] = ar(p);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function _u(e) {
  return ar(e);
}
function bu(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function wu(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function hr(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = ar(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = ar(t.response));
  return e;
}
function mr(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function zw(e, t, n, r = 1) {
  const i = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : i ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : i ? `${n}/${t}` : t;
}
function zt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return zw(e, t, "cachedContents");
}
function hg(e) {
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
function pn(e) {
  return yu(e);
}
function Yw(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Xw(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Qw(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function mg(e) {
  var t;
  let n;
  if (Yw(e) && (n = e.name), !(Qw(e) && (n = e.uri, n === void 0)) && !(Xw(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function gg(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function yg(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (Zw(e, t)) return e[t];
  return [];
}
function Zw(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function jw(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function eS(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const o = i.name;
    if (r.has(o)) throw new Error(`Duplicate function name ${o} found in MCP tools. Please ensure function names are unique.`);
    r.add(o);
    const s = jw(i, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function vg(e, t) {
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
function tS(e) {
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
function _g(e) {
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
function gr(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function bg(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function nS(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function rS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function iS(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => FS(s))), l(t, ["inlinedResponses"], o);
  }
  const i = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], o);
  }
  return t;
}
function oS(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigqueryDestination", "outputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function sS(e) {
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
function Do(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const i = a(e, ["metadata", "state"]);
  i != null && l(t, ["state"], bg(i));
  const o = a(e, ["metadata", "createTime"]);
  o != null && l(t, ["createTime"], o);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], iS(_g(d))), t;
}
function cl(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const i = a(e, ["state"]);
  i != null && l(t, ["state"], bg(i));
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
  const p = a(e, ["model"]);
  p != null && l(t, ["model"], p);
  const f = a(e, ["inputConfig"]);
  f != null && l(t, ["src"], aS(f));
  const h = a(e, ["outputConfig"]);
  h != null && l(t, ["dest"], oS(_g(h)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function aS(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigquerySource", "inputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function lS(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = a(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const i = a(t, ["inlinedRequests"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => US(e, s))), l(n, ["requests", "requests"], o);
  }
  return n;
}
function uS(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const i = a(e, ["bigqueryUri"]);
  if (i != null && l(t, ["bigquerySource", "inputUri"], i), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function cS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function dS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function fS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function pS(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = a(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], hS(r));
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
  const p = a(e, ["safetyRatings"]);
  if (p != null) {
    let h = p;
    Array.isArray(h) && (h = h.map((m) => m)), l(t, ["safetyRatings"], h);
  }
  const f = a(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function hS(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["citations"], r);
  }
  return t;
}
function wg(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => KS(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function mS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const i = a(e, ["webhookConfig"]);
  return t !== void 0 && i != null && l(t, ["batch", "webhookConfig"], i), n;
}
function gS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["dest"]);
  if (t !== void 0 && i != null && l(t, ["outputConfig"], sS(tS(i))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Df(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], me(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], lS(e, vg(e, i)));
  const o = a(t, ["config"]);
  return o != null && mS(o, n), n;
}
function yS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], me(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["inputConfig"], uS(vg(e, i)));
  const o = a(t, ["config"]);
  return o != null && gS(o, n), n;
}
function vS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function _S(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], me(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], xS(e, i));
  const o = a(t, ["config"]);
  return o != null && vS(o, n), n;
}
function bS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function wS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function SS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function ES(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function TS(e, t) {
  const n = {}, r = a(t, ["contents"]);
  if (r != null) {
    let o = vu(e, r);
    Array.isArray(o) && (o = o.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], o);
  }
  const i = a(t, ["config"]);
  return i != null && (l(n, ["_self"], AS(i, n)), gw(n, { "requests[].*": "requests[].request.*" })), n;
}
function AS(e, t) {
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
function xS(e, t) {
  const n = {}, r = a(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const i = a(t, ["inlinedRequests"]);
  return i != null && l(n, ["requests"], TS(e, i)), n;
}
function CS(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function IS(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function RS(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function PS(e, t, n) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], wg(Oe(i)));
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
  const p = a(t, ["stopSequences"]);
  p != null && l(r, ["stopSequences"], p);
  const f = a(t, ["responseLogprobs"]);
  f != null && l(r, ["responseLogprobs"], f);
  const h = a(t, ["logprobs"]);
  h != null && l(r, ["logprobs"], h);
  const m = a(t, ["presencePenalty"]);
  m != null && l(r, ["presencePenalty"], m);
  const g = a(t, ["frequencyPenalty"]);
  g != null && l(r, ["frequencyPenalty"], g);
  const y = a(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const v = a(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const b = a(t, ["responseSchema"]);
  b != null && l(r, ["responseSchema"], _u(b));
  const _ = a(t, ["responseJsonSchema"]);
  if (_ != null && l(r, ["responseJsonSchema"], _), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let A = w;
    Array.isArray(A) && (A = A.map((M) => WS(M))), l(n, ["safetySettings"], A);
  }
  const E = a(t, ["tools"]);
  if (n !== void 0 && E != null) {
    let A = mr(E);
    Array.isArray(A) && (A = A.map((M) => zS(hr(M)))), l(n, ["tools"], A);
  }
  const T = a(t, ["toolConfig"]);
  if (n !== void 0 && T != null && l(n, ["toolConfig"], JS(T)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = a(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], zt(e, S));
  const k = a(t, ["responseModalities"]);
  k != null && l(r, ["responseModalities"], k);
  const x = a(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const N = a(t, ["speechConfig"]);
  if (N != null && l(r, ["speechConfig"], bu(N)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const $ = a(t, ["thinkingConfig"]);
  $ != null && l(r, ["thinkingConfig"], $);
  const G = a(t, ["imageConfig"]);
  G != null && l(r, ["imageConfig"], $S(G));
  const K = a(t, ["enableEnhancedCivicAnswers"]);
  if (K != null && l(r, ["enableEnhancedCivicAnswers"], K), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const z = a(t, ["serviceTier"]);
  return n !== void 0 && z != null && l(n, ["serviceTier"], z), r;
}
function MS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((p) => pS(p))), l(t, ["candidates"], d);
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
function NS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function kS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], gr(e, r)), n;
}
function DS(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], rS(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function LS(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function $S(e) {
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
function US(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["request", "model"], me(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = tt(i);
    Array.isArray(u) && (u = u.map((c) => wg(c))), l(n, ["request", "contents"], u);
  }
  const o = a(t, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], PS(e, s, a(n, ["request"], {}))), n;
}
function FS(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], MS(n));
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function BS(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  if (t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function OS(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const o = a(e, ["filter"]);
  return t !== void 0 && o != null && l(t, ["_query", "filter"], o), n;
}
function GS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && BS(n, t), t;
}
function qS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && OS(n, t), t;
}
function VS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["operations"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Do(s))), l(t, ["batchJobs"], o);
  }
  return t;
}
function HS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["batchPredictionJobs"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => cl(s))), l(t, ["batchJobs"], o);
  }
  return t;
}
function KS(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], CS(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], IS(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], cS(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function WS(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function JS(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], RS(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function zS(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], LS(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], DS(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = a(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
var Wt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Wt || (Wt = {}));
var On = class {
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
}, YS = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new On(Wt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Df(this.apiClient, e), n = t._url, r = V("{model}:batchGenerateContent", n), i = t.batch.inputConfig.requests, o = i.requests, s = [];
    for (const u of o) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const p = c.request;
        p.systemInstruction = d, c.request = p;
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
      const c = yS(this.apiClient, e);
      return s = V("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => cl(d));
    } else {
      const c = Df(this.apiClient, e);
      return s = V("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Do(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = _S(this.apiClient, e);
      return i = V("{model}:asyncBatchEmbedContent", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Do(u));
    }
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kS(this.apiClient, e);
      return s = V("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => cl(d));
    } else {
      const c = NS(this.apiClient, e);
      return s = V("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Do(d));
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = fS(this.apiClient, e);
      o = V("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = dS(this.apiClient, e);
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
      const c = qS(e);
      return s = V("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = HS(d), f = new Pf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = GS(e);
      return s = V("batches", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = VS(d), f = new Pf();
        return Object.assign(f, p), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wS(this.apiClient, e);
      return s = V("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => ES(d));
    } else {
      const c = bS(this.apiClient, e);
      return s = V("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => SS(d));
    }
  }
};
function XS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function QS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Lf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => b0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function $f(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => w0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function ZS(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  t !== void 0 && i != null && l(t, ["expireTime"], i);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let p = tt(s);
    Array.isArray(p) && (p = p.map((f) => Lf(f))), l(t, ["contents"], p);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Lf(Oe(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((f) => T0(f))), l(t, ["tools"], p);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], S0(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function jS(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  t !== void 0 && i != null && l(t, ["expireTime"], i);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = tt(s);
    Array.isArray(f) && (f = f.map((h) => $f(h))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], $f(Oe(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => A0(h))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], E0(d));
  const p = a(e, ["kmsKeyName"]);
  return t !== void 0 && p != null && l(t, ["encryption_spec", "kmsKeyName"], p), n;
}
function e0(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], ug(e, r));
  const i = a(t, ["config"]);
  return i != null && ZS(i, n), n;
}
function t0(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], ug(e, r));
  const i = a(t, ["config"]);
  return i != null && jS(i, n), n;
}
function n0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], zt(e, r)), n;
}
function r0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], zt(e, r)), n;
}
function i0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function o0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function s0(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function a0(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function l0(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function u0(e) {
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
function c0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], zt(e, r)), n;
}
function d0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], zt(e, r)), n;
}
function f0(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], XS(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function p0(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function h0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function m0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function g0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && h0(n, t), t;
}
function y0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && m0(n, t), t;
}
function v0(e) {
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
function _0(e) {
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
function b0(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], s0(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], a0(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], QS(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function w0(e) {
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
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function S0(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], l0(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function E0(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function T0(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], p0(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], f0(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = a(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function A0(e) {
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
    let h = c;
    Array.isArray(h) && (h = h.map((m) => u0(m))), l(t, ["functionDeclarations"], h);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = a(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function x0(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  return t !== void 0 && i != null && l(t, ["expireTime"], i), n;
}
function C0(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  return t !== void 0 && i != null && l(t, ["expireTime"], i), n;
}
function I0(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], zt(e, r));
  const i = a(t, ["config"]);
  return i != null && x0(i, n), n;
}
function R0(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], zt(e, r));
  const i = a(t, ["config"]);
  return i != null && C0(i, n), n;
}
var P0 = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new On(Wt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = t0(this.apiClient, e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = e0(this.apiClient, e);
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
      const c = d0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = c0(this.apiClient, e);
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
      const c = r0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = o0(d), f = new If();
        return Object.assign(f, p), f;
      });
    } else {
      const c = n0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = i0(d), f = new If();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = R0(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = I0(this.apiClient, e);
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
      const c = y0(e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = _0(d), f = new Rf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = g0(e);
      return s = V("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = v0(d), f = new Rf();
        return Object.assign(f, p), f;
      });
    }
  }
};
function rn(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function Uf(e) {
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
function le(e) {
  return this instanceof le ? (this.v = e, this) : new le(e);
}
function Ct(e, t, n) {
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
      h(o[0][3], y);
    }
  }
  function d(m) {
    m.value instanceof le ? Promise.resolve(m.value.v).then(p, f) : h(o[0][2], m);
  }
  function p(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function h(m, g) {
    m(g), o.shift(), o.length && c(o[0][0], o[0][1]);
  }
}
function It(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Uf == "function" ? Uf(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function M0(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Sg(n);
}
function Sg(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function N0(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Ff(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const i = [];
    let o = !0;
    for (; r < n && e[r].role === "model"; )
      i.push(e[r]), o && !Sg(e[r]) && (o = !1), r++;
    o ? t.push(...i) : t.pop();
  }
  return t;
}
var k0 = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new D0(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, D0 = class {
  constructor(e, t, n, r = {}, i = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = i, this.sendPromise = Promise.resolve(), N0(i);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Oe(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var i, o, s;
      const u = await r, c = (o = (i = u.candidates) === null || i === void 0 ? void 0 : i[0]) === null || o === void 0 ? void 0 : o.content, d = u.automaticFunctionCallingHistory, p = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (s = d.slice(p)) !== null && s !== void 0 ? s : []);
      const h = c ? [c] : [];
      this.recordHistory(n, h, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = Oe(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? Ff(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Ct(this, arguments, function* () {
      var r, i, o, s, u, c;
      const d = [];
      try {
        for (var p = !0, f = It(e), h; h = yield le(f.next()), r = h.done, !r; p = !0) {
          s = h.value, p = !1;
          const m = s;
          if (M0(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield le(m);
        }
      } catch (m) {
        i = { error: m };
      } finally {
        try {
          !p && !r && (o = f.return) && (yield le(o.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Ff(n)) : this.history.push(e), this.history.push(...r);
  }
}, Eg = class Tg extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Tg.prototype);
  }
};
function L0(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function $0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function U0(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], mg(n)), t;
}
function F0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function B0(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], mg(n)), t;
}
function O0(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function G0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function q0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && G0(n, t), t;
}
function V0(e) {
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
function H0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(t, ["files"], i);
  }
  return t;
}
var K0 = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new On(Wt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const s = q0(e);
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
        const c = V0(u), d = new Ow();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = L0(e);
      return i = V("upload/v1beta/files", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = $0(u), d = new Gw();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = B0(e);
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
      const s = U0(e);
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
        const c = F0(u), d = new qw();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = O0(e);
      return i = V("files:register", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = H0(u), d = new Vw();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Bf(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function W0(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Lo(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function J0(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => cE(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function z0(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => dE(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Y0(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function X0(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Q0(e) {
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
function Z0(e) {
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
  const p = a(e, ["mediaResolution"]);
  p != null && l(t, ["mediaResolution"], p);
  const f = a(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const h = a(e, ["responseLogprobs"]);
  h != null && l(t, ["responseLogprobs"], h);
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
  const T = a(e, ["thinkingConfig"]);
  T != null && l(t, ["thinkingConfig"], T);
  const S = a(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const k = a(e, ["topP"]);
  if (k != null && l(t, ["topP"], k), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function j0(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], W0(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function eE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function tE(e, t) {
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
  const p = a(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], wu(f));
  const h = a(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], J0(Oe(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let x = mr(y);
    Array.isArray(x) && (x = x.map((N) => hE(hr(N)))), l(t, ["setup", "tools"], x);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], pE(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], Bf(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], Bf(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const T = a(e, ["proactivity"]);
  if (t !== void 0 && T != null && l(t, ["setup", "proactivity"], T), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let x = k;
    Array.isArray(x) && (x = x.map((N) => fE(N))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function nE(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], Z0(r));
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
  const p = a(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], wu(f));
  const h = a(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], z0(Oe(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let N = mr(y);
    Array.isArray(N) && (N = N.map(($) => mE(hr($)))), l(t, ["setup", "tools"], N);
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
  const T = a(e, ["proactivity"]);
  t !== void 0 && T != null && l(t, ["setup", "proactivity"], T);
  const S = a(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const k = a(e, ["avatarConfig"]);
  t !== void 0 && k != null && l(t, ["setup", "avatarConfig"], k);
  const x = a(e, ["safetySettings"]);
  if (t !== void 0 && x != null) {
    let N = x;
    Array.isArray(N) && (N = N.map(($) => $)), l(t, ["setup", "safetySettings"], N);
  }
  return n;
}
function rE(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], me(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], tE(i, n)), n;
}
function iE(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], me(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], nE(i, n)), n;
}
function oE(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function sE(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function aE(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = cg(n);
    Array.isArray(d) && (d = d.map((p) => Lo(p))), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], Lo(fg(r)));
  const i = a(e, ["audioStreamEnd"]);
  i != null && l(t, ["audioStreamEnd"], i);
  const o = a(e, ["video"]);
  o != null && l(t, ["video"], Lo(dg(o)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function lE(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = cg(n);
    Array.isArray(d) && (d = d.map((p) => p)), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], fg(r));
  const i = a(e, ["audioStreamEnd"]);
  i != null && l(t, ["audioStreamEnd"], i);
  const o = a(e, ["video"]);
  o != null && l(t, ["video"], dg(o));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function uE(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = a(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const i = a(e, ["toolCall"]);
  i != null && l(t, ["toolCall"], i);
  const o = a(e, ["toolCallCancellation"]);
  o != null && l(t, ["toolCallCancellation"], o);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], gE(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const p = a(e, ["voiceActivity"]);
  return p != null && l(t, ["voiceActivity"], yE(p)), t;
}
function cE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], Y0(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], X0(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Lo(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function dE(e) {
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
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function fE(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function pE(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function hE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], eE(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], j0(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = a(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function mE(e) {
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
    let h = c;
    Array.isArray(h) && (h = h.map((m) => Q0(m))), l(t, ["functionDeclarations"], h);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = a(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function gE(e) {
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
  const p = a(e, ["candidatesTokensDetails"]);
  if (p != null) {
    let m = p;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = a(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const h = a(e, ["trafficType"]);
  return h != null && l(t, ["trafficType"], h), t;
}
function yE(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function vE(e, t) {
  const n = {}, r = a(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function _E(e, t) {
  const n = {}, r = a(e, ["data"]);
  if (r != null && l(n, ["data"], r), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bE(e, t) {
  const n = {}, r = a(e, ["content"]);
  r != null && l(n, ["content"], r);
  const i = a(e, ["citationMetadata"]);
  i != null && l(n, ["citationMetadata"], wE(i));
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
  const p = a(e, ["logprobsResult"]);
  p != null && l(n, ["logprobsResult"], p);
  const f = a(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const h = a(e, ["urlContextMetadata"]);
  return h != null && l(n, ["urlContextMetadata"], h), n;
}
function wE(e, t) {
  const n = {}, r = a(e, ["citationSources"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(n, ["citations"], i);
  }
  return n;
}
function SE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let s = tt(o);
    Array.isArray(s) && (s = s.map((u) => yr(u))), l(r, ["contents"], s);
  }
  return r;
}
function EE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["tokensInfo"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["tokensInfo"], o);
  }
  return n;
}
function TE(e, t) {
  const n = {}, r = a(e, ["values"]);
  r != null && l(n, ["values"], r);
  const i = a(e, ["statistics"]);
  return i != null && l(n, ["statistics"], AE(i)), n;
}
function AE(e, t) {
  const n = {}, r = a(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const i = a(e, ["token_count"]);
  return i != null && l(n, ["tokenCount"], i), n;
}
function Di(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => DT(s))), l(n, ["parts"], o);
  }
  const i = a(e, ["role"]);
  return i != null && l(n, ["role"], i), n;
}
function yr(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => LT(s))), l(n, ["parts"], o);
  }
  const i = a(e, ["role"]);
  return i != null && l(n, ["role"], i), n;
}
function xE(e, t) {
  const n = {}, r = a(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const i = a(e, ["enableControlImageComputation"]);
  return i != null && l(n, ["computeControl"], i), n;
}
function CE(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function IE(e, t, n) {
  const r = {}, i = a(e, ["systemInstruction"]);
  t !== void 0 && i != null && l(t, ["systemInstruction"], yr(Oe(i)));
  const o = a(e, ["tools"]);
  if (t !== void 0 && o != null) {
    let u = o;
    Array.isArray(u) && (u = u.map((c) => Ig(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], _T(s)), r;
}
function RE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = tt(o);
    Array.isArray(u) && (u = u.map((c) => Di(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && CE(s), r;
}
function PE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = tt(o);
    Array.isArray(u) && (u = u.map((c) => yr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && IE(s, r), r;
}
function ME(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  i != null && l(n, ["totalTokens"], i);
  const o = a(e, ["cachedContentTokenCount"]);
  return o != null && l(n, ["cachedContentTokenCount"], o), n;
}
function NE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  return i != null && l(n, ["totalTokens"], i), n;
}
function kE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], me(e, i)), r;
}
function DE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], me(e, i)), r;
}
function LE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function $E(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function UE(e, t, n) {
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
  const p = a(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
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
function FE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => GT(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && UE(u, r), r;
}
function BE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Ps(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function OE(e, t, n) {
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
function GE(e, t, n) {
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
  let p = a(n, ["embeddingApiType"]);
  if (p === void 0 && (p = "PREDICT"), p === "EMBED_CONTENT") {
    const f = a(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return r;
}
function qE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let d = vu(e, o);
    Array.isArray(d) && (d = d.map((p) => p)), l(r, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && Di(Oe(s));
  const u = a(t, ["config"]);
  u != null && OE(u, r);
  const c = a(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], me(e, c)), r;
}
function VE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  let o = a(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = vu(e, c);
      Array.isArray(d) && (d = d.map((p) => p)), l(r, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(r, ["content"], yr(Oe(c)));
  }
  const u = a(t, ["config"]);
  return u != null && GE(u, r, n), r;
}
function HE(e, t) {
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
function KE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions[]", "embeddings"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => TE(u))), l(n, ["embeddings"], s);
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
function WE(e, t) {
  const n = {}, r = a(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["deployedModelId"]);
  return i != null && l(n, ["deployedModelId"], i), n;
}
function JE(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function zE(e, t) {
  const n = {}, r = a(e, ["id"]);
  r != null && l(n, ["id"], r);
  const i = a(e, ["args"]);
  i != null && l(n, ["args"], i);
  const o = a(e, ["name"]);
  if (o != null && l(n, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function YE(e, t) {
  const n = {}, r = a(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const i = a(e, ["mode"]);
  if (i != null && l(n, ["mode"], i), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function XE(e, t) {
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
function QE(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], Di(Oe(o)));
  const s = a(t, ["temperature"]);
  s != null && l(i, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(i, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(i, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(i, ["candidateCount"], d);
  const p = a(t, ["maxOutputTokens"]);
  p != null && l(i, ["maxOutputTokens"], p);
  const f = a(t, ["stopSequences"]);
  f != null && l(i, ["stopSequences"], f);
  const h = a(t, ["responseLogprobs"]);
  h != null && l(i, ["responseLogprobs"], h);
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
  _ != null && l(i, ["responseSchema"], _u(_));
  const w = a(t, ["responseJsonSchema"]);
  if (w != null && l(i, ["responseJsonSchema"], w), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const E = a(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let M = E;
    Array.isArray(M) && (M = M.map((O) => qT(O))), l(n, ["safetySettings"], M);
  }
  const T = a(t, ["tools"]);
  if (n !== void 0 && T != null) {
    let M = mr(T);
    Array.isArray(M) && (M = M.map((O) => XT(hr(O)))), l(n, ["tools"], M);
  }
  const S = a(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], zT(S)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const k = a(t, ["cachedContent"]);
  n !== void 0 && k != null && l(n, ["cachedContent"], zt(e, k));
  const x = a(t, ["responseModalities"]);
  x != null && l(i, ["responseModalities"], x);
  const N = a(t, ["mediaResolution"]);
  N != null && l(i, ["mediaResolution"], N);
  const $ = a(t, ["speechConfig"]);
  if ($ != null && l(i, ["speechConfig"], bu($)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const G = a(t, ["thinkingConfig"]);
  G != null && l(i, ["thinkingConfig"], G);
  const K = a(t, ["imageConfig"]);
  K != null && l(i, ["imageConfig"], TT(K));
  const z = a(t, ["enableEnhancedCivicAnswers"]);
  if (z != null && l(i, ["enableEnhancedCivicAnswers"], z), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const A = a(t, ["serviceTier"]);
  return n !== void 0 && A != null && l(n, ["serviceTier"], A), i;
}
function ZE(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], yr(Oe(o)));
  const s = a(t, ["temperature"]);
  s != null && l(i, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(i, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(i, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(i, ["candidateCount"], d);
  const p = a(t, ["maxOutputTokens"]);
  p != null && l(i, ["maxOutputTokens"], p);
  const f = a(t, ["stopSequences"]);
  f != null && l(i, ["stopSequences"], f);
  const h = a(t, ["responseLogprobs"]);
  h != null && l(i, ["responseLogprobs"], h);
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
  _ != null && l(i, ["responseSchema"], _u(_));
  const w = a(t, ["responseJsonSchema"]);
  w != null && l(i, ["responseJsonSchema"], w);
  const E = a(t, ["routingConfig"]);
  E != null && l(i, ["routingConfig"], E);
  const T = a(t, ["modelSelectionConfig"]);
  T != null && l(i, ["modelConfig"], T);
  const S = a(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let ie = S;
    Array.isArray(ie) && (ie = ie.map((L) => L)), l(n, ["safetySettings"], ie);
  }
  const k = a(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let ie = mr(k);
    Array.isArray(ie) && (ie = ie.map((L) => Ig(hr(L)))), l(n, ["tools"], ie);
  }
  const x = a(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], YT(x));
  const N = a(t, ["labels"]);
  n !== void 0 && N != null && l(n, ["labels"], N);
  const $ = a(t, ["cachedContent"]);
  n !== void 0 && $ != null && l(n, ["cachedContent"], zt(e, $));
  const G = a(t, ["responseModalities"]);
  G != null && l(i, ["responseModalities"], G);
  const K = a(t, ["mediaResolution"]);
  K != null && l(i, ["mediaResolution"], K);
  const z = a(t, ["speechConfig"]);
  z != null && l(i, ["speechConfig"], bu(z));
  const A = a(t, ["audioTimestamp"]);
  A != null && l(i, ["audioTimestamp"], A);
  const M = a(t, ["thinkingConfig"]);
  M != null && l(i, ["thinkingConfig"], M);
  const O = a(t, ["imageConfig"]);
  if (O != null && l(i, ["imageConfig"], AT(O)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const W = a(t, ["modelArmorConfig"]);
  n !== void 0 && W != null && l(n, ["modelArmorConfig"], W);
  const ne = a(t, ["serviceTier"]);
  return n !== void 0 && ne != null && l(n, ["serviceTier"], ne), i;
}
function Of(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = tt(o);
    Array.isArray(u) && (u = u.map((c) => Di(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], QE(e, s, r)), r;
}
function Gf(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = tt(o);
    Array.isArray(u) && (u = u.map((c) => yr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], ZE(e, s, r)), r;
}
function qf(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["candidates"]);
  if (i != null) {
    let p = i;
    Array.isArray(p) && (p = p.map((f) => bE(f))), l(n, ["candidates"], p);
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
function Vf(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["candidates"]);
  if (i != null) {
    let p = i;
    Array.isArray(p) && (p = p.map((f) => f)), l(n, ["candidates"], p);
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
function jE(e, t, n) {
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
  const p = a(e, ["includeRaiReason"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeRaiReason"], p);
  const f = a(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const h = a(e, ["outputMimeType"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], h);
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
function eT(e, t, n) {
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
  const p = a(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
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
function tT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && jE(s, r), r;
}
function nT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && eT(s, r), r;
}
function rT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => mT(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], xg(o)), n;
}
function iT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Ps(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], Cg(o)), n;
}
function oT(e, t, n) {
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
  const p = a(e, ["enhancePrompt"]);
  if (t !== void 0 && p != null && l(t, ["parameters", "enhancePrompt"], p), a(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = a(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Ms(f));
  const h = a(e, ["referenceImages"]);
  if (t !== void 0 && h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((y) => uA(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function sT(e, t, n) {
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
  const p = a(e, ["resolution"]);
  t !== void 0 && p != null && l(t, ["parameters", "resolution"], p);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = a(e, ["pubsubTopic"]);
  t !== void 0 && h != null && l(t, ["parameters", "pubsubTopic"], h);
  const m = a(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = a(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const y = a(e, ["generateAudio"]);
  t !== void 0 && y != null && l(t, ["parameters", "generateAudio"], y);
  const v = a(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], Rt(v));
  const b = a(e, ["referenceImages"]);
  if (t !== void 0 && b != null) {
    let T = b;
    Array.isArray(T) && (T = T.map((S) => cA(S))), l(t, ["instances[0]", "referenceImages"], T);
  }
  const _ = a(e, ["mask"]);
  t !== void 0 && _ != null && l(t, ["instances[0]", "mask"], lA(_));
  const w = a(e, ["compressionQuality"]);
  t !== void 0 && w != null && l(t, ["parameters", "compressionQuality"], w);
  const E = a(e, ["labels"]);
  if (t !== void 0 && E != null && l(t, ["labels"], E), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function aT(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const o = a(e, ["done"]);
  o != null && l(n, ["done"], o);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], dT(u)), n;
}
function lT(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const o = a(e, ["done"]);
  o != null && l(n, ["done"], o);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], fT(u)), n;
}
function uT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], Ms(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Rg(u));
  const c = a(t, ["source"]);
  c != null && pT(c, r);
  const d = a(t, ["config"]);
  return d != null && oT(d, r), r;
}
function cT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], Rt(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Pg(u));
  const c = a(t, ["source"]);
  c != null && hT(c, r);
  const d = a(t, ["config"]);
  return d != null && sT(d, r), r;
}
function dT(e, t) {
  const n = {}, r = a(e, ["generatedSamples"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => yT(u))), l(n, ["generatedVideos"], s);
  }
  const i = a(e, ["raiMediaFilteredCount"]);
  i != null && l(n, ["raiMediaFilteredCount"], i);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(n, ["raiMediaFilteredReasons"], o), n;
}
function fT(e, t) {
  const n = {}, r = a(e, ["videos"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => vT(u))), l(n, ["generatedVideos"], s);
  }
  const i = a(e, ["raiMediaFilteredCount"]);
  i != null && l(n, ["raiMediaFilteredCount"], i);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(n, ["raiMediaFilteredReasons"], o), n;
}
function pT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], Ms(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Rg(s)), r;
}
function hT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], Rt(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Pg(s)), r;
}
function mT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], xT(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  return o != null && l(n, ["safetyAttributes"], xg(o)), n;
}
function Ps(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], Ag(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  o != null && l(n, ["safetyAttributes"], Cg(o));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function gT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["mask"], Ag(r));
  const i = a(e, ["labels"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["labels"], o);
  }
  return n;
}
function yT(e, t) {
  const n = {}, r = a(e, ["video"]);
  return r != null && l(n, ["video"], sA(r)), n;
}
function vT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  return r != null && l(n, ["video"], aA(r)), n;
}
function _T(e, t) {
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
  const p = a(e, ["maxOutputTokens"]);
  p != null && l(n, ["maxOutputTokens"], p);
  const f = a(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const h = a(e, ["presencePenalty"]);
  h != null && l(n, ["presencePenalty"], h);
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
  const T = a(e, ["temperature"]);
  T != null && l(n, ["temperature"], T);
  const S = a(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const k = a(e, ["topK"]);
  k != null && l(n, ["topK"], k);
  const x = a(e, ["topP"]);
  if (x != null && l(n, ["topP"], x), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function bT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], me(e, i)), r;
}
function wT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], me(e, i)), r;
}
function ST(e, t) {
  const n = {}, r = a(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], vE(r));
  const i = a(e, ["enableWidget"]);
  return i != null && l(n, ["enableWidget"], i), n;
}
function ET(e, t) {
  const n = {}, r = a(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const i = a(e, ["timeRangeFilter"]);
  return i != null && l(n, ["timeRangeFilter"], i), n;
}
function TT(e, t) {
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
function AT(e, t) {
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
function xT(e, t) {
  const n = {}, r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], pn(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Ag(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["imageBytes"], pn(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Ms(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], pn(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Rt(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["imageBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], pn(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function CT(e, t, n, r) {
  const i = {}, o = a(t, ["pageSize"]);
  n !== void 0 && o != null && l(n, ["_query", "pageSize"], o);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], gg(e, c)), i;
}
function IT(e, t, n, r) {
  const i = {}, o = a(t, ["pageSize"]);
  n !== void 0 && o != null && l(n, ["_query", "pageSize"], o);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], gg(e, c)), i;
}
function RT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && CT(e, i, r), r;
}
function PT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && IT(e, i, r), r;
}
function MT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["_self"]);
  if (o != null) {
    let s = yg(o);
    Array.isArray(s) && (s = s.map((u) => dl(u))), l(n, ["models"], s);
  }
  return n;
}
function NT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["_self"]);
  if (o != null) {
    let s = yg(o);
    Array.isArray(s) && (s = s.map((u) => fl(u))), l(n, ["models"], s);
  }
  return n;
}
function kT(e, t) {
  const n = {}, r = a(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const i = a(e, ["segmentationClasses"]);
  i != null && l(n, ["maskClasses"], i);
  const o = a(e, ["maskDilation"]);
  return o != null && l(n, ["dilation"], o), n;
}
function dl(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["displayName"]);
  i != null && l(n, ["displayName"], i);
  const o = a(e, ["description"]);
  o != null && l(n, ["description"], o);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], QT(u));
  const c = a(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = a(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const p = a(e, ["supportedGenerationMethods"]);
  p != null && l(n, ["supportedActions"], p);
  const f = a(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const h = a(e, ["maxTemperature"]);
  h != null && l(n, ["maxTemperature"], h);
  const m = a(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = a(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const y = a(e, ["thinking"]);
  return y != null && l(n, ["thinking"], y), n;
}
function fl(e, t) {
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
    let h = u;
    Array.isArray(h) && (h = h.map((m) => WE(m))), l(n, ["endpoints"], h);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], ZT(d));
  const p = a(e, ["defaultCheckpointId"]);
  p != null && l(n, ["defaultCheckpointId"], p);
  const f = a(e, ["checkpoints"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["checkpoints"], h);
  }
  return n;
}
function DT(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const i = a(e, ["codeExecutionResult"]);
  i != null && l(n, ["codeExecutionResult"], i);
  const o = a(e, ["executableCode"]);
  o != null && l(n, ["executableCode"], o);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], JE(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], zE(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], _E(d));
  const p = a(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = a(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = a(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const y = a(e, ["toolResponse"]);
  y != null && l(n, ["toolResponse"], y);
  const v = a(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function LT(e, t) {
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
  const p = a(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = a(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function $T(e, t) {
  const n = {}, r = a(e, ["productImage"]);
  return r != null && l(n, ["image"], Rt(r)), n;
}
function UT(e, t, n) {
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
  const p = a(e, ["addWatermark"]);
  t !== void 0 && p != null && l(t, ["parameters", "addWatermark"], p);
  const f = a(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const h = a(e, ["outputCompressionQuality"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], h);
  const m = a(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = a(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), r;
}
function FT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["source"]);
  o != null && OT(o, r);
  const s = a(t, ["config"]);
  return s != null && UT(s, r), r;
}
function BT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => Ps(o))), l(n, ["generatedImages"], i);
  }
  return n;
}
function OT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["personImage"]);
  t !== void 0 && o != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Rt(o));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => $T(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function GT(e, t) {
  const n = {}, r = a(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], Rt(r));
  const i = a(e, ["referenceId"]);
  i != null && l(n, ["referenceId"], i);
  const o = a(e, ["referenceType"]);
  o != null && l(n, ["referenceType"], o);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], kT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], xE(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function xg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function Cg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function qT(e, t) {
  const n = {}, r = a(e, ["category"]);
  if (r != null && l(n, ["category"], r), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const i = a(e, ["threshold"]);
  return i != null && l(n, ["threshold"], i), n;
}
function VT(e, t) {
  const n = {}, r = a(e, ["image"]);
  return r != null && l(n, ["image"], Rt(r)), n;
}
function HT(e, t, n) {
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
function KT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["source"]);
  o != null && JT(o, r);
  const s = a(t, ["config"]);
  return s != null && HT(s, r), r;
}
function WT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => gT(o))), l(n, ["generatedMasks"], i);
  }
  return n;
}
function JT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], Rt(o));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], VT(s)), r;
}
function zT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  i != null && l(n, ["functionCallingConfig"], YE(i));
  const o = a(e, ["includeServerSideToolInvocations"]);
  return o != null && l(n, ["includeServerSideToolInvocations"], o), n;
}
function YT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  if (i != null && l(n, ["functionCallingConfig"], i), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function XT(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = a(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const i = a(e, ["fileSearch"]);
  i != null && l(n, ["fileSearch"], i);
  const o = a(e, ["googleSearch"]);
  o != null && l(n, ["googleSearch"], ET(o));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], ST(s));
  const u = a(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["functionDeclarations"], h);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const p = a(e, ["urlContext"]);
  p != null && l(n, ["urlContext"], p);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["mcpServers"], h);
  }
  return n;
}
function Ig(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => XE(g))), l(n, ["functionDeclarations"], m);
  }
  const p = a(e, ["googleSearchRetrieval"]);
  p != null && l(n, ["googleSearchRetrieval"], p);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(n, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function QT(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
}
function ZT(e, t) {
  const n = {}, r = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
}
function jT(e, t, n) {
  const r = {}, i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["description"]);
  t !== void 0 && o != null && l(t, ["description"], o);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function eA(e, t, n) {
  const r = {}, i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["description"]);
  t !== void 0 && o != null && l(t, ["description"], o);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function tA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "name"], me(e, i));
  const o = a(t, ["config"]);
  return o != null && jT(o, r), r;
}
function nA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["config"]);
  return o != null && eA(o, r), r;
}
function rA(e, t, n) {
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
  const p = a(e, ["enhanceInputImage"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], p);
  const f = a(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const h = a(e, ["labels"]);
  t !== void 0 && h != null && l(t, ["labels"], h);
  const m = a(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = a(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), r;
}
function iA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], me(e, i));
  const o = a(t, ["image"]);
  o != null && l(r, ["instances[0]", "image"], Rt(o));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && rA(u, r), r;
}
function oA(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Ps(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function sA(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["encodedVideo"]);
  i != null && l(n, ["videoBytes"], pn(i));
  const o = a(e, ["encoding"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function aA(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["videoBytes"], pn(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function lA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["_self"], Rt(r));
  const i = a(e, ["maskMode"]);
  return i != null && l(n, ["maskMode"], i), n;
}
function uA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], Ms(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function cA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], Rt(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function Rg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["encodedVideo"], pn(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["encoding"], o), n;
}
function Pg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], pn(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function dA(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function fA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && dA(n, t), t;
}
function pA(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function hA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && pA(r, t), t;
}
function mA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function gA(e, t) {
  const n = {}, r = a(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["customMetadata"], o);
  }
  const i = a(e, ["chunkingConfig"]);
  return t !== void 0 && i != null && l(t, ["chunkingConfig"], i), n;
}
function yA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], _A(s)), t;
}
function vA(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const i = a(e, ["config"]);
  return i != null && gA(i, t), t;
}
function _A(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function bA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function wA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && bA(n, t), t;
}
function SA(e) {
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
function Mg(e, t) {
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
function EA(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["config"]);
  return r != null && Mg(r, t), t;
}
function TA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var AA = "Content-Type", xA = "X-Server-Timeout", CA = "User-Agent", pl = "x-goog-api-client", IA = "google-genai-sdk/1.50.1", RA = "v1beta1", PA = "v1beta", MA = /* @__PURE__ */ new Set(["us", "eu"]), NA = 5, kA = [
  408,
  429,
  500,
  502,
  503,
  504
], DA = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const i = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const o = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !o ? (i.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? i.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && MA.has(this.clientOptions.location) ? i.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (i.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), i.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : RA;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), i.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : PA, i.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === al.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && LA(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Hf(r), new ll(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Hf(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return Ct(this, arguments, function* () {
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
          const { done: c, value: d } = yield le(r.read());
          if (c) {
            if (o.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const p = i.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(p);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), y = g.status, v = g.code, b = `got status: ${y}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new Eg({
                message: b,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          o += p;
          let f = -1, h = 0;
          for (; ; ) {
            f = -1, h = 0;
            for (const y of u) {
              const v = o.indexOf(y);
              v !== -1 && (f === -1 || v < f) && (f = v, h = y.length);
            }
            if (f === -1) break;
            const m = o.substring(0, f);
            o = o.substring(f + h);
            const g = m.trim();
            if (g.startsWith(s)) {
              const y = g.substring(5).trim();
              try {
                yield yield le(new ll(new Response(y, {
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
      throw kA.includes(o.status) ? new Error(`Retryable HTTP Error: ${o.statusText}`) : new md.AbortError(`Non-retryable exception ${o.statusText} sending request`);
    };
    return (0, md.default)(i, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : NA) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = IA + " " + this.clientOptions.userAgentExtra;
    return e[CA] = t, e[pl] = t, e[AA] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, i] of Object.entries(e.headers)) n.append(r, i);
      e.timeout && e.timeout > 0 && n.append(xA, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: r }, c = this.getFileName(e), d = V("upload/v1beta/files", u._url), p = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return i.upload(e, p, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const i = this.clientOptions.uploader, o = await i.stat(t), s = String(o.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : o.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), p = {};
    n != null && Mg(n, p);
    const f = await this.fetchUploadUrl(c, s, u, d, p, n?.httpOptions);
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
async function Hf(e) {
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
    throw n >= 400 && n < 600 ? new Eg({
      message: i,
      status: n
    }) : new Error(i);
  }
}
function LA(e, t) {
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
      const d = s[c], p = u[c];
      d && typeof d == "object" && !Array.isArray(d) && p && typeof p == "object" && !Array.isArray(p) ? u[c] = r(p, d) : (p && d && typeof p != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof p}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const i = r(n, t);
  e.body = JSON.stringify(i);
}
var $A = "mcp_used/unknown", UA = !1;
function Ng(e) {
  for (const t of e)
    if (FA(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return UA;
}
function kg(e) {
  var t;
  e[pl] = (((t = e[pl]) !== null && t !== void 0 ? t : "") + ` ${$A}`).trimStart();
}
function FA(e) {
  return e !== null && typeof e == "object" && e instanceof OA;
}
function BA(e) {
  return Ct(this, arguments, function* (n, r = 100) {
    let i, o = 0;
    for (; o < r; ) {
      const s = yield le(n.listTools({ cursor: i }));
      for (const u of s.tools)
        yield yield le(u), o++;
      if (!s.nextCursor) break;
      i = s.nextCursor;
    }
  });
}
var OA = class Dg {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Dg(t, n);
  }
  async initialize() {
    var t, n, r, i;
    if (this.mcpTools.length > 0) return;
    const o = {}, s = [];
    for (const p of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, It(BA(p))), d; d = await c.next(), t = d.done, !t; u = !0) {
        i = d.value, u = !1;
        const f = i;
        s.push(f);
        const h = f.name;
        if (o[h]) throw new Error(`Duplicate function name ${h} found in MCP tools. Please ensure function names are unique.`);
        o[h] = p;
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
    return await this.initialize(), eS(this.mcpTools, this.config);
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
async function GA(e, t, n) {
  const r = new Kw();
  let i;
  n.data instanceof Blob ? i = JSON.parse(await n.data.text()) : i = JSON.parse(n.data), Object.assign(r, i), t(r);
}
var qA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), i = this.apiClient.getApiVersion(), o = KA(this.apiClient.getDefaultHeaders()), s = `${r}/ws/google.ai.generativelanguage.${i}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, p = function() {
      u({});
    }, f = this.apiClient, h = {
      onopen: p,
      onmessage: (y) => {
        GA(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(s, HA(o), h);
    m.connect(), await c;
    const g = { setup: { model: me(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new VA(m, this.apiClient);
  }
}, VA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = sE(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = oE(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(rr.PLAY);
  }
  pause() {
    this.sendPlaybackControl(rr.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(rr.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(rr.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function HA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function KA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var WA = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function JA(e, t, n) {
  const r = new Hw();
  let i;
  n.data instanceof Blob ? i = await n.data.text() : n.data instanceof ArrayBuffer ? i = new TextDecoder().decode(n.data) : i = n.data;
  const o = JSON.parse(i);
  if (e.isVertexAI()) {
    const s = uE(o);
    Object.assign(r, s);
  } else Object.assign(r, o);
  t(r);
}
var zA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new qA(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, i, o, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && Ng(e.config.tools) && kg(p);
    const f = ZA(p);
    if (this.apiClient.isVertexAI()) {
      const x = this.apiClient.getProject(), N = this.apiClient.getLocation(), $ = this.apiClient.getApiKey(), G = !!x && !!N || !!$;
      this.apiClient.getCustomBaseUrl() && !G ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const x = this.apiClient.getApiKey();
      let N = "BidiGenerateContent", $ = "key";
      x?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), N = "BidiGenerateContentConstrained", $ = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${N}?${$}=${x}`;
    }
    let h = () => {
    };
    const m = new Promise((x) => {
      h = x;
    }), g = e.callbacks, y = function() {
      var x;
      (x = g?.onopen) === null || x === void 0 || x.call(g), h({});
    }, v = this.apiClient, b = {
      onopen: y,
      onmessage: (x) => {
        JA(v, g.onmessage, x);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, _ = this.webSocketFactory.create(d, QA(f), b);
    _.connect(), await m;
    let w = me(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && w.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), N = this.apiClient.getLocation();
      x && N && (w = `projects/${x}/locations/${N}/` + w);
    }
    let E = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Zo.AUDIO] } : e.config.responseModalities = [Zo.AUDIO]), !((i = e.config) === null || i === void 0) && i.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const T = (s = (o = e.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : [], S = [];
    for (const x of T) if (this.isCallableTool(x)) {
      const N = x;
      S.push(await N.tool());
    } else S.push(x);
    S.length > 0 && (e.config.tools = S);
    const k = {
      model: w,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? E = iE(this.apiClient, k) : E = rE(this.apiClient, k), delete E.config, _.send(JSON.stringify(E)), new XA(_, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, YA = { turnComplete: !0 }, XA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = tt(t.turns), e.isVertexAI() || (n = n.map((r) => Di(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(WA);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, YA), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: lE(e) } : t = { realtimeInput: aE(e) }, this.conn.send(JSON.stringify(t));
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
function QA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function ZA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Kf = 10;
function Wf(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let i = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (lr(s)) {
    i = !0;
    break;
  }
  if (!i) return !0;
  const o = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return o && (o < 0 || !Number.isInteger(o)) || o == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", o), !0) : !1;
}
function lr(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function jA(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((i) => lr(i))) !== null && r !== void 0 ? r : !1;
}
function Jf(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, i) => {
    if (lr(r)) return;
    const o = r;
    o.functionDeclarations && o.functionDeclarations.length > 0 && n.push(i);
  }), n;
}
function zf(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var ex = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = tt(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = tt(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: jo.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: jo.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, i, o, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !jA(t) || Wf(t.config)) return await this.generateContentInternal(u);
      const c = Jf(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, p;
      const f = tt(u.contents), h = (i = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && i !== void 0 ? i : Kf;
      let m = 0;
      for (; m < h && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const v of (s = (o = t.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : []) if (lr(v)) {
          const b = await v.callTool(d.functionCalls);
          y.push(...b);
        }
        m++, p = {
          role: "user",
          parts: y
        }, u.contents = tt(u.contents), u.contents.push(g), u.contents.push(p), zf(u.config) && (f.push(g), f.push(p));
      }
      return zf(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, i, o, s;
      if (this.maybeMoveToResponseJsonSchem(t), Wf(t.config)) {
        const p = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(p);
      }
      const u = Jf(t);
      if (u.length > 0) {
        const p = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${p}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
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
      return new On(Wt.PAGED_ITEM_MODELS, (i) => this.listInternal(i), await this.listInternal(r), r);
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
    const o = await Promise.all(i.map(async (u) => lr(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: o })
    };
    if (s.config.tools = o, e.config && e.config.tools && Ng(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), kg(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const i = /* @__PURE__ */ new Map();
    for (const o of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (lr(o)) {
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
    const i = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Kf;
    let o = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, p) {
      return Ct(this, arguments, function* () {
        for (var f, h, m, g, y, v; s < i; ) {
          o && (s++, o = !1);
          const E = yield le(c.processParamsMaybeAddMcpUsage(p)), T = yield le(c.generateContentStreamInternal(E)), S = [], k = [];
          try {
            for (var b = !0, _ = (h = void 0, It(T)), w; w = yield le(_.next()), f = w.done, !f; b = !0) {
              g = w.value, b = !1;
              const x = g;
              if (yield yield le(x), x.candidates && (!((y = x.candidates[0]) === null || y === void 0) && y.content)) {
                k.push(x.candidates[0].content);
                for (const N of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (s < i && N.functionCall) {
                  if (!N.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(N.functionCall.name)) {
                    const $ = yield le(d.get(N.functionCall.name).callTool([N.functionCall]));
                    S.push(...$);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${N.functionCall.name}`);
                }
              }
            }
          } catch (x) {
            h = { error: x };
          } finally {
            try {
              !b && !f && (m = _.return) && (yield le(m.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
          if (S.length > 0) {
            o = !0;
            const x = new Or();
            x.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield le(x);
            const N = [];
            N.push(...k), N.push({
              role: "user",
              parts: S
            }), p.contents = tt(p.contents).concat(N);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Gf(this.apiClient, e);
      return s = V("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = Vf(d), f = new Or();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Of(this.apiClient, e);
      return s = V("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = qf(d), f = new Or();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Gf(this.apiClient, e);
      return s = V("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), o.then(function(d) {
        return Ct(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = It(d), v; v = yield le(y.next()), p = v.done, !p; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = Vf(yield le(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Or();
              Object.assign(w, _), yield yield le(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield le(h.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Of(this.apiClient, e);
      return s = V("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }), o.then(function(d) {
        return Ct(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = It(d), v; v = yield le(y.next()), p = v.done, !p; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = qf(yield le(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Or();
              Object.assign(w, _), yield yield le(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield le(h.call(y)));
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
      const c = VE(this.apiClient, e, e);
      return s = V(nS(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = KE(d, e), f = new bf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = qE(this.apiClient, e);
      return s = V("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = HE(d), f = new bf();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nT(this.apiClient, e);
      return s = V("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = iT(d), f = new wf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = tT(this.apiClient, e);
      return s = V("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = rT(d), f = new wf();
        return Object.assign(f, p), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = FE(this.apiClient, e);
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
        const c = BE(u), d = new Mw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = iA(this.apiClient, e);
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
        const c = oA(u), d = new Nw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = FT(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = BT(u), d = new kw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = KT(this.apiClient, e);
      return i = V("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = WT(u), d = new Dw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wT(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => fl(d));
    } else {
      const c = bT(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PT(this.apiClient, e);
      return s = V("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = NT(d), f = new Sf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = RT(this.apiClient, e);
      return s = V("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = MT(d), f = new Sf();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nA(this.apiClient, e);
      return s = V("{model}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => fl(d));
    } else {
      const c = tA(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = $E(d), f = new Ef();
        return Object.assign(f, p), f;
      });
    } else {
      const c = kE(this.apiClient, e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = LE(d), f = new Ef();
        return Object.assign(f, p), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PE(this.apiClient, e);
      return s = V("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = NE(d), f = new Tf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = RE(this.apiClient, e);
      return s = V("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = ME(d), f = new Tf();
        return Object.assign(f, p), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = SE(this.apiClient, e);
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
        const c = EE(u), d = new Lw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cT(this.apiClient, e);
      return s = V("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const p = lT(d), f = new Af();
        return Object.assign(f, p), f;
      });
    } else {
      const c = uT(this.apiClient, e);
      return s = V("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const p = aT(d), f = new Af();
        return Object.assign(f, p), f;
      });
    }
  }
}, tx = class extends Jt {
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
      const c = Aw(e);
      return s = V("{operationName}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o;
    } else {
      const c = Tw(e);
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
      const s = yw(e);
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
function Yf(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function nx(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function rx(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function ix(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => px(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function ox(e, t, n) {
  const r = {}, i = a(t, ["expireTime"]);
  n !== void 0 && i != null && l(n, ["expireTime"], i);
  const o = a(t, ["newSessionExpireTime"]);
  n !== void 0 && o != null && l(n, ["newSessionExpireTime"], o);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], fx(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function sx(e, t) {
  const n = {}, r = a(t, ["config"]);
  return r != null && l(n, ["config"], ox(e, r, n)), n;
}
function ax(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function lx(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function ux(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], nx(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function cx(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function dx(e, t) {
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
  const p = a(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], wu(f));
  const h = a(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], ix(Oe(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let x = mr(y);
    Array.isArray(x) && (x = x.map((N) => gx(hr(N)))), l(t, ["setup", "tools"], x);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], mx(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], Yf(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], Yf(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const T = a(e, ["proactivity"]);
  if (t !== void 0 && T != null && l(t, ["setup", "proactivity"], T), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let x = k;
    Array.isArray(x) && (x = x.map((N) => hx(N))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function fx(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], me(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], dx(i, n)), n;
}
function px(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], ax(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], lx(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], rx(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = a(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = a(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = a(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function hx(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function mx(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function gx(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], cx(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], ux(o));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = a(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function yx(e) {
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
function vx(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const o = r.setup;
    typeof o == "object" && o !== null ? (e.bidiGenerateContentSetup = o, n = o) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const i = e.fieldMask;
  if (n) {
    const o = yx(n);
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
var _x = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = sx(this.apiClient, e);
      i = V("auth_tokens", s._url), o = s._query, delete s.config, delete s._url, delete s._query;
      const u = vx(s, e.config);
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
function bx(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function wx(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && bx(r, t), t;
}
function Sx(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function Ex(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function Tx(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = a(e, ["config"]);
  return r != null && Ex(r, t), t;
}
function Ax(e) {
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
var xx = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new On(Wt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = Sx(e);
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
      const o = wx(e);
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
      const s = Tx(e);
      return i = V("{parent}/documents", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Ax(u), d = new $w();
        return Object.assign(d, c), d;
      });
    }
  }
}, Cx = class extends Jt {
  constructor(e, t = new xx(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new On(Wt.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const s = fA(e);
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
      const s = mA(e);
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
      const o = hA(e);
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
      const s = wA(e);
      return i = V("fileSearchStores", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = SA(u), d = new Uw();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = EA(e);
      return i = V("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = TA(u), d = new Fw();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = vA(e);
      return i = V("{file_search_store_name}:importFile", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = yA(u), d = new Bw();
        return Object.assign(d, c), d;
      });
    }
  }
}, Lg = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Lg = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, Ix = () => Lg();
function hl(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ml = (e) => {
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
}, _t = class extends Error {
}, bt = class gl extends _t {
  constructor(t, n, r, i) {
    super(`${gl.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.error = n;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new Ns({
      message: r,
      cause: ml(n)
    });
    const o = n;
    return t === 400 ? new Ug(t, o, r, i) : t === 401 ? new Fg(t, o, r, i) : t === 403 ? new Bg(t, o, r, i) : t === 404 ? new Og(t, o, r, i) : t === 409 ? new Gg(t, o, r, i) : t === 422 ? new qg(t, o, r, i) : t === 429 ? new Vg(t, o, r, i) : t >= 500 ? new Hg(t, o, r, i) : new gl(t, o, r, i);
  }
}, yl = class extends bt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ns = class extends bt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, $g = class extends Ns {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ug = class extends bt {
}, Fg = class extends bt {
}, Bg = class extends bt {
}, Og = class extends bt {
}, Gg = class extends bt {
}, qg = class extends bt {
}, Vg = class extends bt {
}, Hg = class extends bt {
}, Rx = /^[a-z][a-z0-9+.-]*:/i, Px = (e) => Rx.test(e), vl = (e) => (vl = Array.isArray, vl(e)), Xf = vl;
function Qf(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Mx(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Nx = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new _t(`${e} must be an integer`);
  if (t < 0) throw new _t(`${e} must be a positive integer`);
  return t;
}, kx = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Dx = (e) => new Promise((t) => setTimeout(t, e));
function Lx() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Kg(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function $x(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Kg({
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
function Wg(e) {
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
async function Ux(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), i = r.cancel();
  r.releaseLock(), await i;
}
var Fx = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Bx(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new _t(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var Ox = "0.0.1", Jg = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ga(e, t, n) {
  return Jg(), new File(e, t ?? "unknown_file", n);
}
function Gx(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var qx = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", zg = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Vx = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && zg(e), Hx = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Kx(e, t, n) {
  if (Jg(), e = await e, Vx(e))
    return e instanceof File ? e : ga([await e.arrayBuffer()], e.name);
  if (Hx(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ga(await _l(i), t, n);
  }
  const r = await _l(e);
  if (t || (t = Gx(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = Object.assign(Object.assign({}, n), { type: i }));
  }
  return ga(r, t, n);
}
async function _l(e) {
  var t, n, r, i, o;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (zg(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (qx(e)) try {
    for (var u = !0, c = It(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      i = d.value, u = !1;
      const p = i;
      s.push(...await _l(p));
    }
  } catch (p) {
    n = { error: p };
  } finally {
    try {
      !u && !t && (r = c.return) && await r.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const p = (o = e?.constructor) === null || o === void 0 ? void 0 : o.name;
    throw new Error(`Unexpected data type: ${typeof e}${p ? `; constructor: ${p}` : ""}${Wx(e)}`);
  }
  return s;
}
function Wx(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Su = class {
  constructor(e) {
    this._client = e;
  }
};
Su._key = [];
function Yg(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Zf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Jx = (e = Yg) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((p, f, h) => {
    var m, g, y;
    /[?#]/.test(f) && (i = !0);
    const v = r[h];
    let b = (i ? encodeURIComponent : e)("" + v);
    return h !== r.length && (v == null || typeof v == "object" && v.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : Zf)) !== null && g !== void 0 ? g : Zf)) === null || y === void 0 ? void 0 : y.toString)) && (b = v + "", o.push({
      start: p.length + f.length,
      length: b.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === r.length ? "" : b);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const p = d[0].startsWith("/"), f = p ? 1 : 0, h = p ? d[0].slice(1) : d[0];
    o.push({
      start: d.index + f,
      length: h.length,
      error: `Value "${h}" can't be safely passed as a path parameter`
    });
  }
  if (o.sort((p, f) => p.start - f.start), o.length > 0) {
    let p = 0;
    const f = o.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new _t(`Path parameters result in path with invalid segments:
${o.map((h) => h.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}), At = /* @__PURE__ */ Jx(Yg), Xg = class extends Su {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, i = rn(e, ["api_version"]);
    if ("model" in i && "agent_config" in i) throw new _t("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in i && "generation_config" in i) throw new _t("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(At`/${r}/interactions`, Object.assign(Object.assign({ body: i }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(At`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(At`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const i = t ?? {}, { api_version: o = this._client.apiVersion } = i, s = rn(i, ["api_version"]);
    return this._client.get(At`/${o}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Xg._key = Object.freeze(["interactions"]);
var Qg = class extends Xg {
}, Zg = class extends Su {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, i = rn(e, ["api_version", "webhook_id"]);
    return this._client.post(At`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: i
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: i } = t, o = rn(t, ["api_version", "update_mask"]);
    return this._client.patch(At`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: i },
      body: o
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, i = rn(n, ["api_version"]);
    return this._client.get(At`/${r}/webhooks`, Object.assign({ query: i }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(At`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(At`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: i } = t ?? {};
    return this._client.post(At`/${r}/webhooks/${e}:ping`, Object.assign({ body: i }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, o = rn(r, ["api_version"]);
    return this._client.post(At`/${i}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: o }, n));
  }
};
Zg._key = Object.freeze(["webhooks"]);
var jg = class extends Zg {
};
function zx(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var co;
function Eu(e) {
  let t;
  return (co ?? (t = new globalThis.TextEncoder(), co = t.encode.bind(t)))(e);
}
var fo;
function jf(e) {
  let t;
  return (fo ?? (t = new globalThis.TextDecoder(), fo = t.decode.bind(t)))(e);
}
var ks = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Eu(e) : e;
    this.buffer = zx([this.buffer, n]);
    const r = [];
    let i;
    for (; (i = Yx(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (i.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = i.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (i.index !== this.carriageReturnIndex + 1 || i.carriage)) {
        r.push(jf(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const o = this.carriageReturnIndex !== null ? i.preceding - 1 : i.preceding, s = jf(this.buffer.subarray(0, o));
      r.push(s), this.buffer = this.buffer.subarray(i.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
ks.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ks.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Yx(e, t) {
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
var ts = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ep = (e, t, n) => {
  if (e) {
    if (Mx(ts, e)) return e;
    Ye(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ts))}`);
  }
};
function ii() {
}
function po(e, t, n) {
  return !t || ts[e] > ts[n] ? ii : t[e].bind(t);
}
var Xx = {
  error: ii,
  warn: ii,
  info: ii,
  debug: ii
}, tp = /* @__PURE__ */ new WeakMap();
function Ye(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return Xx;
  const i = tp.get(n);
  if (i && i[0] === r) return i[1];
  const o = {
    error: po("error", n, r),
    warn: po("warn", n, r),
    info: po("info", n, r),
    debug: po("debug", n, r)
  };
  return tp.set(n, [r, o]), o;
}
var Sn = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Qx = class oi {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? Ye(r) : console;
    function s() {
      return Ct(this, arguments, function* () {
        var c, d, p, f;
        if (i) throw new _t("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = It(Zx(t, n)), y; y = yield le(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              if (!h)
                if (v.data.startsWith("[DONE]")) {
                  h = !0;
                  continue;
                } else try {
                  yield yield le(JSON.parse(v.data));
                } catch (b) {
                  throw o.error("Could not parse message into JSON:", v.data), o.error("From chunk:", v.raw), b;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield le(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (v) {
          if (hl(v)) return yield le(void 0);
          throw v;
        } finally {
          h || n.abort();
        }
      });
    }
    return new oi(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    function o() {
      return Ct(this, arguments, function* () {
        var c, d, p, f;
        const h = new ks(), m = Wg(t);
        try {
          for (var g = !0, y = It(m), v; v = yield le(y.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const b = f;
            for (const _ of h.decode(b)) yield yield le(_);
          }
        } catch (b) {
          d = { error: b };
        } finally {
          try {
            !g && !c && (p = y.return) && (yield le(p.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const b of h.flush()) yield yield le(b);
      });
    }
    function s() {
      return Ct(this, arguments, function* () {
        var c, d, p, f;
        if (i) throw new _t("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = It(o()), y; y = yield le(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              h || v && (yield yield le(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield le(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (v) {
          if (hl(v)) return yield le(void 0);
          throw v;
        } finally {
          h || n.abort();
        }
      });
    }
    return new oi(s, n, r);
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
    return [new oi(() => i(t), this.controller, this.client), new oi(() => i(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Kg({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: i, done: o } = await n.next();
          if (o) return r.close();
          const s = Eu(JSON.stringify(i) + `
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
function Zx(e, t) {
  return Ct(this, arguments, function* () {
    var r, i, o, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new _t("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new _t("Attempted to iterate over a response with no body");
    const u = new eC(), c = new ks(), d = Wg(e.body);
    try {
      for (var p = !0, f = It(jx(d)), h; h = yield le(f.next()), r = h.done, !r; p = !0) {
        s = h.value, p = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield le(y));
        }
      }
    } catch (m) {
      i = { error: m };
    } finally {
      try {
        !p && !r && (o = f.return) && (yield le(o.call(f)));
      } finally {
        if (i) throw i.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield le(g));
    }
  });
}
function jx(e) {
  return Ct(this, arguments, function* () {
    var n, r, i, o;
    try {
      for (var s = !0, u = It(e), c; c = yield le(u.next()), n = c.done, !n; s = !0) {
        o = c.value, s = !1;
        const d = o;
        d != null && (yield yield le(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Eu(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !s && !n && (i = u.return) && (yield le(i.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var eC = class {
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
    let [t, n, r] = tC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function tC(e, t) {
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
async function nC(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return Ye(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : Qx.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Ye(e).debug(`[${r}] response parsed`, Sn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
var rC = class ey extends Promise {
  constructor(t, n, r = nC) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new ey(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, ty = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iC(e) {
  if (!e) return;
  if (ty in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Xf(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = Xf(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var Gr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of iC(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [ty]: !0,
    values: t,
    nulls: n
  };
}, ya = (e) => {
  var t, n, r, i, o;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((o = (i = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || i === void 0 ? void 0 : i.call(r, e)) === null || o === void 0 ? void 0 : o.trim()) || void 0;
}, ny, ry = class iy {
  constructor(t) {
    var n, r, i, o, s, u, c, { baseURL: d = ya("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: p = (n = ya("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, h = rn(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: p,
      apiVersion: f
    }, h), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : iy.DEFAULT_TIMEOUT, this.logger = (i = m.logger) !== null && i !== void 0 ? i : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (o = ep(m.logLevel, "ClientOptions.logLevel", this)) !== null && o !== void 0 ? o : ep(ya("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : Lx(), this.encoder = Fx, this._options = m, this.apiKey = p, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Gr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Gr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Gr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return Bx(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ox}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ix()}`;
  }
  makeStatusError(t, n, r, i) {
    return bt.generate(t, n, r, i);
  }
  buildURL(t, n, r) {
    const i = !this.baseURLOverridden() && r || this.baseURL, o = Px(t) ? new URL(t) : new URL(i + (i.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(o.searchParams);
    return (!Qf(s) || !Qf(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (o.search = this.stringifyQuery(n)), o.toString();
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
    return new rC(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var i, o, s;
    const u = await t, c = (i = u.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: p, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: p,
      options: u
    });
    const h = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (Ye(this).debug(`[${h}] sending request`, Sn({
      retryOfRequestLogID: r,
      method: u.method,
      url: p,
      options: u,
      headers: d.headers
    })), !((o = u.signal) === null || o === void 0) && o.aborted) throw new yl();
    const y = new AbortController(), v = await this.fetchWithTimeout(p, d, f, y).catch(ml), b = Date.now();
    if (v instanceof globalThis.Error) {
      const w = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new yl();
      const E = hl(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Ye(this).info(`[${h}] connection ${E ? "timed out" : "failed"} - ${w}`), Ye(this).debug(`[${h}] connection ${E ? "timed out" : "failed"} (${w})`, Sn({
          retryOfRequestLogID: r,
          url: p,
          durationMs: b - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? h);
      throw Ye(this).info(`[${h}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), Ye(this).debug(`[${h}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, Sn({
        retryOfRequestLogID: r,
        url: p,
        durationMs: b - g,
        message: v.message
      })), E ? new $g() : new Ns({ cause: v });
    }
    const _ = `[${h}${m}] ${d.method} ${p} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${b - g}ms`;
    if (!v.ok) {
      const w = await this.shouldRetry(v);
      if (n && w) {
        const x = `retrying, ${n} attempts remaining`;
        return await Ux(v.body), Ye(this).info(`${_} - ${x}`), Ye(this).debug(`[${h}] response error (${x})`, Sn({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: b - g
        })), this.retryRequest(u, n, r ?? h, v.headers);
      }
      const E = w ? "error; no more retries left" : "error; not retryable";
      Ye(this).info(`${_} - ${E}`);
      const T = await v.text().catch((x) => ml(x).message), S = kx(T), k = S ? void 0 : T;
      throw Ye(this).debug(`[${h}] response error (${E})`, Sn({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: k,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, S, k, v.headers);
    }
    return Ye(this).info(_), Ye(this).debug(`[${h}] response start`, Sn({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: b - g
    })), {
      response: v,
      options: u,
      controller: y,
      requestLogID: h,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, i) {
    const o = n || {}, { signal: s, method: u } = o, c = rn(o, ["signal", "method"]), d = this._makeAbort(i);
    s && s.addEventListener("abort", d, { once: !0 });
    const p = setTimeout(d, r), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, h = Object.assign(Object.assign(Object.assign({ signal: i.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (h.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, h);
    } finally {
      clearTimeout(p);
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
    return await Dx(s), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const o = n - t;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, i, o;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: p } = s, f = this.buildURL(c, d, p);
    "timeout" in s && Nx("timeout", s.timeout), s.timeout = (r = s.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: h, body: m } = this.buildBody({ options: s }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: h,
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
    let u = Gr([
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
    const r = Gr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: $x(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
ry.DEFAULT_TIMEOUT = 6e4;
var Ue = class extends ry {
  constructor() {
    super(...arguments), this.interactions = new Qg(this), this.webhooks = new jg(this);
  }
};
ny = Ue;
Ue.GeminiNextGenAPIClient = ny;
Ue.GeminiNextGenAPIClientError = _t;
Ue.APIError = bt;
Ue.APIConnectionError = Ns;
Ue.APIConnectionTimeoutError = $g;
Ue.APIUserAbortError = yl;
Ue.NotFoundError = Og;
Ue.ConflictError = Gg;
Ue.RateLimitError = Vg;
Ue.BadRequestError = Ug;
Ue.AuthenticationError = Fg;
Ue.InternalServerError = Hg;
Ue.PermissionDeniedError = Bg;
Ue.UnprocessableEntityError = qg;
Ue.toFile = Kx;
Ue.Interactions = Qg;
Ue.Webhooks = jg;
function oC(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function sC(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function aC(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function lC(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function uC(e, t, n) {
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
function cC(e, t, n) {
  const r = {};
  let i = a(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], va(S));
  } else if (i === "PREFERENCE_TUNING") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], va(S));
  } else if (i === "DISTILLATION") {
    const S = a(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], va(S));
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
  let p = a(n, ["config", "method"]);
  if (p === void 0 && (p = "SUPERVISED_FINE_TUNING"), p === "SUPERVISED_FINE_TUNING") {
    const S = a(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (p === "PREFERENCE_TUNING") {
    const S = a(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (p === "DISTILLATION") {
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
  const h = a(e, ["customBaseModel"]);
  t !== void 0 && h != null && l(t, ["customBaseModel"], h);
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
  const T = a(e, ["encryptionSpec"]);
  return t !== void 0 && T != null && l(t, ["encryptionSpec"], T), r;
}
function dC(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && SC(o);
  const s = a(e, ["config"]);
  return s != null && uC(s, n), n;
}
function fC(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && EC(o, n, t);
  const s = a(e, ["config"]);
  return s != null && cC(s, n, t), n;
}
function pC(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function hC(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function mC(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function gC(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function yC(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && mC(r, n), n;
}
function vC(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && gC(r, n), n;
}
function _C(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["tunedModels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => oy(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function bC(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["tuningJobs"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => bl(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function wC(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["model"], r);
  const i = a(e, ["name"]);
  return i != null && l(n, ["endpoint"], i), n;
}
function SC(e, t) {
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
function EC(e, t, n) {
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
function oy(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["state"]);
  o != null && l(n, ["state"], hg(o));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = a(e, ["description"]);
  p != null && l(n, ["description"], p);
  const f = a(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const h = a(e, ["_self"]);
  return h != null && l(n, ["tunedModel"], wC(h)), n;
}
function bl(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["state"]);
  o != null && l(n, ["state"], hg(o));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = a(e, ["error"]);
  p != null && l(n, ["error"], p);
  const f = a(e, ["description"]);
  f != null && l(n, ["description"], f);
  const h = a(e, ["baseModel"]);
  h != null && l(n, ["baseModel"], h);
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
  const T = a(e, ["customBaseModel"]);
  T != null && l(n, ["customBaseModel"], T);
  const S = a(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let ne = S;
    Array.isArray(ne) && (ne = ne.map((ie) => ie)), l(n, ["evaluateDatasetRuns"], ne);
  }
  const k = a(e, ["experiment"]);
  k != null && l(n, ["experiment"], k);
  const x = a(e, ["fullFineTuningSpec"]);
  x != null && l(n, ["fullFineTuningSpec"], x);
  const N = a(e, ["labels"]);
  N != null && l(n, ["labels"], N);
  const $ = a(e, ["outputUri"]);
  $ != null && l(n, ["outputUri"], $);
  const G = a(e, ["pipelineJob"]);
  G != null && l(n, ["pipelineJob"], G);
  const K = a(e, ["serviceAccount"]);
  K != null && l(n, ["serviceAccount"], K);
  const z = a(e, ["tunedModelDisplayName"]);
  z != null && l(n, ["tunedModelDisplayName"], z);
  const A = a(e, ["tuningJobState"]);
  A != null && l(n, ["tuningJobState"], A);
  const M = a(e, ["veoTuningSpec"]);
  M != null && l(n, ["veoTuningSpec"], M);
  const O = a(e, ["distillationSamplingSpec"]);
  O != null && l(n, ["distillationSamplingSpec"], O);
  const W = a(e, ["tuningJobMetadata"]);
  return W != null && l(n, ["tuningJobMetadata"], W), n;
}
function TC(e, t) {
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
function va(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const i = a(e, ["vertexDatasetResource"]);
  return i != null && l(n, ["validationDatasetUri"], i), n;
}
var AC = class extends Jt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new On(Wt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: sl.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hC(e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => bl(d));
    } else {
      const c = pC(e);
      return s = V("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => oy(d));
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vC(e);
      return s = V("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = bC(d), f = new xf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = yC(e);
      return s = V("tunedModels", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = _C(d), f = new xf();
        return Object.assign(f, p), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sC(e);
      return s = V("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = lC(d), f = new Cf();
        return Object.assign(f, p), f;
      });
    } else {
      const c = oC(e);
      return s = V("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => {
        const p = aC(d), f = new Cf();
        return Object.assign(f, p), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = fC(e, e);
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
      })), r.then((u) => bl(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = dC(e);
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
      })), r.then((u) => TC(u));
    }
  }
}, xC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, CC = 1024 * 1024 * 8, IC = 3, RC = 1e3, PC = 2, ns = "x-goog-upload-status";
async function MC(e, t, n, r) {
  var i;
  const o = await sy(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[ns]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function NC(e, t, n, r) {
  var i;
  const o = await sy(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[ns]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = og(s), c = new Ww();
  return Object.assign(c, u), c;
}
async function sy(e, t, n, r) {
  var i, o, s;
  let u = t;
  const c = r?.baseUrl || ((i = n.clientOptions.httpOptions) === null || i === void 0 ? void 0 : i.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, p = 0, f = new ll(new Response()), h = "upload";
  for (d = e.size; p < d; ) {
    const m = Math.min(CC, d - p), g = e.slice(p, p + m);
    p + m >= d && (h += ", finalize");
    let y = 0, v = RC;
    for (; y < IC; ) {
      const b = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": h,
        "X-Goog-Upload-Offset": String(p),
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
      }), !((o = f?.headers) === null || o === void 0) && o[ns]) break;
      y++, await DC(v), v = v * PC;
    }
    if (p += m, ((s = f?.headers) === null || s === void 0 ? void 0 : s[ns]) !== "active") break;
    if (d <= p) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function kC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function DC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var LC = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await MC(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await NC(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await kC(e);
  }
}, $C = class {
  create(e, t, n) {
    return new UC(e, t, n);
  }
}, UC = class {
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
}, np = "x-goog-api-key", FC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(np) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(np, this.apiKey);
    }
  }
}, BC = "gl-node/", OC = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new Ue({
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
    const n = mw(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new FC(this.apiKey);
    this.apiClient = new DA({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: BC + "web",
      uploader: new LC(),
      downloader: new xC()
    }), this.models = new ex(this.apiClient), this.live = new zA(this.apiClient, r, new $C()), this.batches = new YS(this.apiClient), this.chats = new k0(this.models, this.apiClient), this.caches = new P0(this.apiClient), this.files = new K0(this.apiClient), this.operations = new tx(this.apiClient), this.authTokens = new _x(this.apiClient), this.tunings = new AC(this.apiClient), this.fileSearchStores = new Cx(this.apiClient);
  }
};
function rp(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ir(e) {
  return { text: String(e || "") };
}
function GC(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function qC(e) {
  if (typeof e == "string") return [ir(e)];
  if (!Array.isArray(e)) return [ir("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? ir(n.text || "") : n.type === "image_url" && n.image_url?.url ? GC(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [ir("")];
}
function ip() {
  return {
    role: "user",
    parts: [ir("继续。")]
  };
}
function op(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function VC(e) {
  switch (e) {
    case "high":
      return fi.HIGH;
    case "medium":
      return fi.MEDIUM;
    default:
      return fi.LOW;
  }
}
function sp(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function HC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function KC(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function WC(e) {
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
          response: rp(d.content)
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
        parts: [...s.content ? [ir(s.content)] : [], ...s.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: rp(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: s.role === "assistant" ? "model" : "user",
      parts: qC(s.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: ip().parts
  };
  const i = n[n.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: n,
    latestMessage: ip().parts
  };
}
function JC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ap(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
var zC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new OC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  createChat(e) {
    const t = WC(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = HC(e), i = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (i.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: VC(e.reasoning.effort)
    }), n.length && (i.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (i.toolConfig = { functionCallingConfig: { mode: ol.ANY } });
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
      const p = await e.sendMessageStream(u), f = /* @__PURE__ */ new Map();
      let h = "", m = [], g = null;
      for await (const y of p) {
        if (g = y, sp(y).forEach((v, b) => {
          const _ = `${v.label}:${b}`;
          f.set(_, ap(f.get(_) || "", v.text));
        }), m = (y.functionCalls || []).map((v, b) => ({
          id: v.id || `google-tool-${b + 1}`,
          name: v.name || "",
          arguments: JSON.stringify(v.args || {})
        })).filter((v) => v.name), s = m, m.length) h = "";
        else {
          const v = op(y);
          h = ap(h, v);
        }
        JC(n, {
          text: h,
          thoughts: Array.from(f.values()).filter(Boolean).map((v, b) => ({
            label: `思考块 ${b + 1}`,
            text: v
          }))
        });
      }
      r = g || { functionCalls: m }, i = Array.from(f.values()).filter(Boolean).map((y, v) => ({
        label: `思考块 ${v + 1}`,
        text: y
      })), o = s.length ? "" : h;
    } else
      r = await e.sendMessage(u), i = sp(r), o = r.functionCalls?.length ? "" : op(r);
    const c = (r.functionCalls || []).map((p, f) => ({
      id: p.id || `google-tool-${f + 1}`,
      name: p.name || "",
      arguments: JSON.stringify(p.args || {})
    })).filter((p) => p.name), d = c.length ? c : s;
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
      const n = { message: KC(e.toolResponses) };
      return await this.sendThroughChat(this.activeChat, n, e);
    }
    const t = this.createChat(e);
    return this.activeChat = t.chat, await this.sendThroughChat(this.activeChat, t.sendPayload, e);
  }
}, ye = {
  LS: "LS",
  GLOB: "Glob",
  GREP: "Grep",
  READ: "Read",
  RUN_SLASH_COMMAND: "RunSlashCommand",
  READ_IDENTITY: "ReadIdentity",
  WRITE_IDENTITY: "WriteIdentity",
  READ_WORKLOG: "ReadWorklog",
  WRITE_WORKLOG: "WriteWorklog",
  READ_SKILLS_CATALOG: "ReadSkillsCatalog",
  READ_SKILL: "ReadSkill",
  UPDATE_SKILL: "UpdateSkill",
  GENERATE_SKILL: "GenerateSkill",
  DELETE_SKILL: "DeleteSkill"
}, YC = [
  "工具使用规则：",
  "- `LS` 只列目录的一级子项，适合看某层有哪些文件夹/文件，不能搜索文件内容。",
  "- `Glob` 只按路径模式匹配文件，适合先缩小文件集合；它不检查文件内容对不对。",
  "- `Grep` 只搜索文件内容里的命中片段；命中片段不是全文，也不代表上下文完整。结果很多时可配合 `offset` 和 `limit` 分页继续看。",
  "- `Read` 返回的是带行号的文件内容；如果返回 `truncated: true`、`hasMoreAfter: true`、`charLimited: true` 或 `nextStartLine`，表示当前只拿到一段，不是全文。",
  "- `RunSlashCommand` 执行的是用户当前真实酒馆实例中的斜杠命令，不是快照；是否会先弹审批，由当前权限模式决定。",
  "- `ReadSkillsCatalog` 读取技能目录索引，只看有哪些 skill、摘要和触发词；不要把它当 skill 正文。",
  "- `ReadSkill` 读取某一个 skill 的完整正文；命中目录里某项后，再按需读取对应 skill，不要默认全读。",
  "- `UpdateSkill` 更新已有 skill 的正文或元数据，并同步刷新 Skills.json；它不是新建工具，并且支持局部更新。",
  '- `GenerateSkill` 用于把刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill；先 `action: "propose"`，用户同意后再 `action: "save"`；save 阶段请显式填写全部保存字段。',
  "- `DeleteSkill` 删除已有 skill，并同时从技能正文文件与 Skills.json 中移除该项。",
  "- 更新或删除 skill 属于持久化修改；只有在用户明确要求修改/删除该 skill 时才调用，不要自己擅自覆盖或清除。",
  "- 调用工具时，使用工具定义里的确切名字和参数名，不要自己改名或脑补额外字段。",
  "- 工具如果返回 `ok: false`、`error`、`raw`、`truncated`、`warning` 等字段，必须按字面理解并如实告诉用户，不要把失败、截断、空结果当成成功证据。",
  "- 如果工具返回的是原样 API / 代理错误文本，就直接基于该文本说明问题，不要擅自改写成别的原因。",
  "- 当工具结果不足以支撑结论时，要继续查证，或明确说明当前还不能确认。"
], XC = [
  {
    type: "function",
    function: {
      name: ye.LS,
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
      name: ye.GLOB,
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
      name: ye.GREP,
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
      name: ye.READ,
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
      name: ye.RUN_SLASH_COMMAND,
      description: [
        "执行 SillyTavern 斜杠命令（STscript）。",
        "用途：读取或操作用户当前真实酒馆实例里的对象与状态，例如角色卡、世界书、聊天、预设、扩展、当前模型与接口等。",
        "这不是读快照，而是直接作用于用户当前打开的实例。",
        "具体是否会先弹审批，由当前权限模式和运行时审批结果决定。"
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
      name: ye.READ_IDENTITY,
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
      name: ye.WRITE_IDENTITY,
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
      name: ye.READ_WORKLOG,
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
      name: ye.WRITE_WORKLOG,
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
  },
  {
    type: "function",
    function: {
      name: ye.READ_SKILLS_CATALOG,
      description: "读取酒馆 user/files/LittleWhiteBox_Assistant_Skills.json 这份技能目录索引，返回已登记的 skill 元数据和注入用目录摘要。",
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
      name: ye.READ_SKILL,
      description: "读取某一个 skill 的完整正文。优先传 id；也可传 filename。两者二选一，不能都不传。",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "技能 id，例如 skill-plugin-debugging。"
          },
          filename: {
            type: "string",
            description: "技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。"
          }
        },
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ye.UPDATE_SKILL,
      description: "更新已有 skill 的正文或元数据，并同步回写对应 skill 文件与 Skills.json。优先传 id；也可传 filename。支持局部更新，未提供的字段会保持原值不变。",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "技能 id，例如 skill-plugin-debugging。"
          },
          filename: {
            type: "string",
            description: "技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。"
          },
          title: {
            type: "string",
            description: "可选的新标题。"
          },
          summary: {
            type: "string",
            description: "可选的新一句话摘要。"
          },
          triggers: {
            type: "array",
            items: { type: "string" },
            description: "可选的新触发关键词列表。"
          },
          slashTriggers: {
            type: "array",
            items: { type: "string" },
            description: "可选的新 slash 触发命令列表，例如 /写插件。"
          },
          when_to_use: {
            type: "string",
            description: "可选的新 when_to_use。"
          },
          content: {
            type: "string",
            description: "可选的新 skill 正文（不含 frontmatter）。"
          },
          enabled: {
            type: "boolean",
            description: "可选；是否启用该 skill。"
          }
        },
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ye.GENERATE_SKILL,
      description: [
        "将刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill。",
        '必须先调用 `action: "propose"` 请求用户同意；只有拿到 approvalToken 后，才能调用 `action: "save"` 真正写入 skill 文件和 Skills.json。',
        '`action: "save"` 时，请显式填写全部保存字段。'
      ].join(`
`),
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["propose", "save"],
            description: "propose 请求用户同意；save 在获得 approvalToken 后真正保存。"
          },
          title: {
            type: "string",
            description: "技能标题，例如“长流程插件排错”。"
          },
          reason: {
            type: "string",
            description: "为什么值得沉淀成 skill。仅 propose 阶段需要。"
          },
          sourceSummary: {
            type: "string",
            description: "本次过程的简要总结。仅 propose 阶段需要。"
          },
          approvalToken: {
            type: "string",
            description: "propose 成功后返回的一次性 token。仅 save 阶段需要。"
          },
          id: {
            type: "string",
            description: "propose 返回的建议 skill id。仅 save 阶段需要。"
          },
          summary: {
            type: "string",
            description: "技能一句话摘要。仅 save 阶段需要。"
          },
          triggers: {
            type: "array",
            items: { type: "string" },
            description: "触发关键词列表。仅 save 阶段需要。"
          },
          slashTriggers: {
            type: "array",
            items: { type: "string" },
            description: "slash 触发命令列表，例如 /写插件。仅 save 阶段需要。"
          },
          when_to_use: {
            type: "string",
            description: "什么情况下适合使用这条 skill。仅 save 阶段需要。"
          },
          content: {
            type: "string",
            description: "skill 正文 markdown，不含 frontmatter。仅 save 阶段需要。"
          },
          enabled: {
            type: "boolean",
            description: "保存后是否启用。仅 save 阶段需要。"
          }
        },
        required: ["action"],
        additionalProperties: !1
      }
    }
  },
  {
    type: "function",
    function: {
      name: ye.DELETE_SKILL,
      description: "删除已有 skill，并同时移除技能正文文件与 Skills.json 中的目录项。优先传 id；也可传 filename。",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "技能 id，例如 skill-plugin-debugging。"
          },
          filename: {
            type: "string",
            description: "技能文件名，例如 LittleWhiteBox_Assistant_Skill_plugin-debugging.md。"
          }
        },
        additionalProperties: !1
      }
    }
  }
];
function QC(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function lp(e = [], t) {
  const n = e.slice(0, 3), r = [];
  return n.forEach((i) => r.push(t(i))), e.length > n.length && r.push(`……其余 ${e.length - n.length} 项见详细结果`), r;
}
function ay(e) {
  const t = QC(e.content, null);
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
  if (e.toolName === ye.GLOB) {
    const n = Array.isArray(t.items) ? t.items : [], r = [`glob“${t.pattern || ""}”命中 ${t.total || 0} 个文件，当前展示 ${n.length} 个。`];
    t.truncated && r.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (r.push(""), r.push(...lp(n, (o) => `- ${o.publicPath}${o.source ? ` [${o.source}]` : ""}`)));
    const i = n.map((o) => `- ${o.publicPath}${o.source ? ` [${o.source}]` : ""}`);
    return {
      summary: r.join(`
`),
      details: i.join(`
`)
    };
  }
  if (e.toolName === ye.LS) {
    const n = Array.isArray(t.items) ? t.items : [], r = [`目录 ${t.directoryPath || ""} 下找到 ${t.total || 0} 个一级子项，当前展示 ${n.length} 个。`];
    t.truncated && r.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (r.push(""), r.push(...lp(n, (o) => `- ${o.publicPath}${o.type === "directory" ? " [目录]" : ""}`)));
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
  if (e.toolName === ye.GREP) {
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
        i.push(`- ${s.path}${c}${s.matchCount ? `（${s.matchCount} 处）` : ""}`), Array.isArray(s.matches) && s.matches.length && (o.push(s.path), s.matches.forEach((d, p) => {
          o.push(`  [${p + 1}] 第 ${d.line || "?"} 行: ${d.text || ""}`), d.context && o.push(d.context);
        }), o.push(""));
      }
    })), {
      summary: i.join(`
`),
      details: o.join(`
`).trim()
    };
  }
  if (e.toolName === ye.READ) {
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
  if (e.toolName === ye.RUN_SLASH_COMMAND) {
    const n = [`已执行斜杠命令：${t.command || ""}`, t.ok === !1 ? "状态：失败" : "状态：成功"];
    t.error && n.push(`错误：${t.error}`), t.note && n.push(`说明：${t.note}`);
    let r = "";
    return t.result !== void 0 ? r = typeof t.result == "string" ? t.result : JSON.stringify(t.result, null, 2) : t.raw && (r = typeof t.raw == "string" ? t.raw : JSON.stringify(t.raw, null, 2)), {
      summary: n.filter(Boolean).join(`
`),
      details: r
    };
  }
  if (e.toolName === ye.WRITE_IDENTITY) return {
    summary: [`身份设定已写入 ${t.name || "LittleWhiteBox_Assistant_Identity.md"}`.trim(), t.hotUpdated ? "当前会话身份已同步刷新。" : ""].filter(Boolean).join(`
`),
    details: ""
  };
  if (e.toolName === ye.READ_IDENTITY) return {
    summary: t.exists ? `已读取身份设定：${t.name || "LittleWhiteBox_Assistant_Identity.md"}` : `身份设定还不存在：${t.name || "LittleWhiteBox_Assistant_Identity.md"}`,
    details: t.exists ? String(t.content || "") : ""
  };
  if (e.toolName === ye.WRITE_WORKLOG) return {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  };
  if (e.toolName === ye.READ_WORKLOG) return {
    summary: t.exists ? `已读取工作记录：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}` : `工作记录还不存在：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}`,
    details: t.exists ? String(t.content || "") : ""
  };
  if (e.toolName === ye.READ_SKILLS_CATALOG) return {
    summary: [
      `已读取技能目录：${t.name || "LittleWhiteBox_Assistant_Skills.json"}`,
      `总技能数：${Number(t.total) || 0}`,
      `启用技能：${Number(t.enabledCount) || 0}`
    ].join(`
`),
    details: String(t.content || t.summaryText || "")
  };
  if (e.toolName === ye.READ_SKILL)
    return t.ok === !1 && t.error ? {
      summary: [`读取技能失败：${t.error}`, t.message ? `说明：${t.message}` : ""].filter(Boolean).join(`
`),
      details: ""
    } : {
      summary: [
        `已读取技能：${t.title || t.id || t.filename || ""}`.trim(),
        t.filename ? `文件：${t.filename}` : "",
        t.summary ? `摘要：${t.summary}` : "",
        Array.isArray(t.slashTriggers) && t.slashTriggers.length ? `Slash：${t.slashTriggers.join(", ")}` : ""
      ].filter(Boolean).join(`
`),
      details: String(t.content || "")
    };
  if (e.toolName === ye.UPDATE_SKILL)
    return t.ok === !1 && t.error ? {
      summary: [`更新技能失败：${t.error}`, t.message ? `说明：${t.message}` : ""].filter(Boolean).join(`
`),
      details: ""
    } : {
      summary: [
        `技能已更新：${t.title || t.id || t.filename || ""}`.trim(),
        t.filename ? `文件：${t.filename}` : "",
        t.enabled === !1 ? "状态：已保存但未启用" : "状态：已启用"
      ].filter(Boolean).join(`
`),
      details: t.note ? String(t.note) : ""
    };
  if (e.toolName === ye.GENERATE_SKILL) {
    if (t.ok === !1 && t.error) return {
      summary: [`技能处理失败：${t.error}`, t.message ? `说明：${t.message}` : ""].filter(Boolean).join(`
`),
      details: t.details ? String(t.details) : ""
    };
    if (t.action === "propose") return {
      summary: t.approved === !1 ? `本次未生成技能：${t.title || ""}`.trim() : `技能生成已获同意：${t.title || t.id || ""}`.trim(),
      details: [
        t.id ? `id: ${t.id}` : "",
        t.filename ? `filename: ${t.filename}` : "",
        t.instructions ? String(t.instructions) : ""
      ].filter(Boolean).join(`

`)
    };
    if (t.action === "save") return {
      summary: [
        `技能已保存：${t.title || t.id || ""}`.trim(),
        t.filename ? `文件：${t.filename}` : "",
        t.enabled === !1 ? "状态：已保存但未启用" : "状态：已启用",
        t.warning ? `提醒：${t.warning}` : ""
      ].filter(Boolean).join(`
`),
      details: [
        t.note ? String(t.note) : "",
        Array.isArray(t.missingFields) && t.missingFields.length ? `missingFields: ${t.missingFields.join(", ")}` : "",
        t.followUpRequired && t.followUpTool ? `followUpTool: ${t.followUpTool}` : ""
      ].filter(Boolean).join(`

`)
    };
  }
  return e.toolName === ye.DELETE_SKILL ? t.ok === !1 && t.error ? {
    summary: [`删除技能失败：${t.error}`, t.message ? `说明：${t.message}` : ""].filter(Boolean).join(`
`),
    details: ""
  } : {
    summary: [
      `技能已删除：${t.title || t.id || t.filename || ""}`.trim(),
      t.filename ? `文件：${t.filename}` : "",
      t.fileDeleted === !1 ? "正文文件原本不存在，已仅清理目录项" : "正文文件与目录项均已删除"
    ].filter(Boolean).join(`
`),
    details: t.note ? String(t.note) : ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
var ZC = 3.35, jC = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), eI = new TextEncoder();
function tI(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: r, persistSession: i, render: o, showToast: s, post: u, createRequestId: c, safeJsonParse: d, describeError: p, formatToolResultDisplay: f, buildTextWithAttachmentSummary: h, buildUserContentParts: m, normalizeAttachments: g, normalizeThoughtBlocks: y, normalizeSlashCommand: v, normalizeSlashSkillTrigger: b, shouldRequireSlashCommandApproval: _, buildSlashApprovalResult: w, isAbortError: E, createAdapter: T, getActiveProviderConfig: S, getSystemPrompt: k, SYSTEM_PROMPT: x, SUMMARY_SYSTEM_PROMPT: N, HISTORY_SUMMARY_PREFIX: $, MAX_CONTEXT_TOKENS: G, SUMMARY_TRIGGER_TOKENS: K, DEFAULT_PRESERVED_TURNS: z, MIN_PRESERVED_TURNS: A, MAX_TOOL_ROUNDS: M, REQUEST_TIMEOUT_MS: O, TOOL_DEFINITIONS: W, TOOL_NAMES: ne } = e;
  let ie = !1, L = 0, q = "", j = "", ge = 0, ve = 0;
  function we() {
    const C = typeof k == "function" ? k() : x;
    return String(C || x).trim() || x;
  }
  function wt() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: G,
      summaryActive: !1
    };
  }
  function ht() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${$}
${t.historySummary.trim()}`
    } : null;
  }
  function Se() {
    const C = t.activeRun?.lightBrakeMessage;
    return C ? {
      role: "system",
      content: C
    } : null;
  }
  function Te(C) {
    return `${Math.max(0, Math.round((Number(C) || 0) / 1e3))}k`;
  }
  function Ie(C = t.contextStats) {
    return `${Te(C.usedTokens)}/${Te(C.budgetTokens)}`;
  }
  function Qe(C, R = 1800) {
    const U = String(C || "").replace(/\s+/g, " ").trim();
    return U.length <= R ? U : `${U.slice(0, R)}…`;
  }
  function mt(C) {
    if (C?.approvalRequest) return "";
    if (C.role === "tool") return Qe(f(C).summary || C.content || "", 1400);
    if (C.role === "assistant" && Array.isArray(C.toolCalls) && C.toolCalls.length) {
      const R = C.toolCalls.map((U) => `工具: ${U.name} ${U.arguments || "{}"}`.trim());
      return Qe([C.content || "", ...R].filter(Boolean).join(`
`), 1600);
    }
    return Qe(h(C.content || "", C.attachments), 1600);
  }
  function Pt(C = t.messages) {
    const R = [];
    let U = [];
    return (C || []).filter((B) => !B?.approvalRequest).forEach((B) => {
      if (B.role === "user" && U.length) {
        R.push(U), U = [B];
        return;
      }
      U.push(B);
    }), U.length && R.push(U), R.filter((B) => B.length);
  }
  function Er(C, R = "") {
    const U = [];
    return R?.trim() && (U.push("已有历史摘要:"), U.push(R.trim()), U.push("")), C.forEach((B, Q) => {
      U.push(`第 ${Q + 1} 段历史:`), B.forEach((ue) => {
        const he = ue.role === "user" ? "用户" : ue.role === "assistant" ? "助手" : `工具${ue.toolName ? `(${ue.toolName})` : ""}`;
        U.push(`${he}: ${mt(ue) || "[空]"}`);
      }), U.push("");
    }), U.join(`
`).trim();
  }
  function hn(C, R = "") {
    const U = [];
    return R?.trim() && U.push(R.trim()), C.forEach((B, Q) => {
      const ue = B.map((he) => `${he.role === "user" ? "用户" : he.role === "assistant" ? "助手" : `工具${he.toolName ? `(${he.toolName})` : ""}`}: ${mt(he) || "[空]"}`).join(`
`);
      U.push(`补充历史 ${Q + 1}:
${ue}`);
    }), Qe(U.join(`

`), 6e3);
  }
  function tv() {
    let C = !1;
    return t.messages = t.messages.map((R) => {
      if (R?.role !== "assistant") return R;
      const U = Array.isArray(R.thoughts) && R.thoughts.length, B = !!R.providerPayload;
      return !U && !B ? R : (C = !0, {
        ...R,
        thoughts: [],
        providerPayload: void 0
      });
    }), C;
  }
  function nv() {
    const C = Pt();
    return C.length ? C[C.length - 1] : [];
  }
  function Qu(C = [], R = null) {
    const U = y(C);
    if (!U.length) return U;
    const B = /* @__PURE__ */ new Set();
    return nv().forEach((Q) => {
      Q === R || Q?.role !== "assistant" || y(Q.thoughts).forEach((ue) => {
        B.add(`${ue.label}\0${ue.text}`);
      });
    }), U.filter((Q) => !B.has(`${Q.label}\0${Q.text}`));
  }
  function rv(C = []) {
    return C.map((R) => {
      const U = Array.isArray(R.content) ? R.content.map((B) => !B || typeof B != "object" ? "" : B.type === "text" ? B.text || "" : B.type === "image_url" ? `[image:${B.name || B.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : R.content || "";
      return R.role === "assistant" && Array.isArray(R.tool_calls) && R.tool_calls.length ? {
        role: "assistant",
        content: [U, R.tool_calls.map((B) => JSON.stringify({
          id: B.id,
          name: B.function?.name || "",
          arguments: B.function?.arguments || "{}"
        })).join(`
`)].filter(Boolean).join(`
`)
      } : R.role === "tool" ? {
        role: "tool",
        content: [R.tool_call_id || "", R.content || ""].filter(Boolean).join(`
`)
      } : {
        role: R.role,
        content: U
      };
    });
  }
  function Ks(C = [], R = []) {
    return [...rv(C), {
      role: "system",
      content: R.length ? `TOOLS
${JSON.stringify(R)}` : ""
    }].filter((U) => U.content);
  }
  function iv(C) {
    return Math.ceil(eI.encode(String(C || "")).length / ZC);
  }
  function Oi({ messages: C = [], tools: R = [] } = {}) {
    return iv(JSON.stringify(Ks(C, R)));
  }
  function Zu(C = [], R = W) {
    const U = S();
    return JSON.stringify({
      provider: String(U?.provider || ""),
      model: String(U?.model || ""),
      messages: Ks(C, R)
    });
  }
  function ov(C) {
    const R = String(C?.model || "").trim();
    return R || (C?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function ju(C, R) {
    const U = await fetch(C, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(R)
    });
    if (!U.ok) throw new Error(`tokenizer_http_${U.status}`);
    return await U.json();
  }
  async function sv(C = [], R = "") {
    if (!C.length) return 0;
    const U = `/api/tokenizers/openai/count?model=${encodeURIComponent(R || "gpt-4o")}`;
    let B = -1;
    for (const Q of C) {
      const ue = await ju(U, [Q]), he = Number(ue?.token_count);
      if (!Number.isFinite(he)) throw new Error("tokenizer_invalid_response");
      B += he;
    }
    return Math.max(0, B);
  }
  async function av(C, R) {
    const U = await ju(C, { text: R }), B = Number(U?.count);
    if (!Number.isFinite(B)) throw new Error("tokenizer_invalid_response");
    return B;
  }
  async function ec({ messages: C = [], tools: R = [] } = {}) {
    const U = S(), B = String(U?.provider || ""), Q = Ks(C, R), ue = JSON.stringify(Q);
    try {
      if (jC.has(B)) return await sv(Q, ov(U));
      if (B === "anthropic") return await av("/api/tokenizers/claude/encode", ue);
    } catch {
      return Oi({
        messages: C,
        tools: R
      });
    }
    return Oi({
      messages: C,
      tools: R
    });
  }
  async function tc(C = [], R = W) {
    const U = Zu(C, R), B = !!t.historySummary;
    let Q = j === U ? ge : await ec({
      messages: C,
      tools: R
    });
    return Number.isFinite(Q) || (Q = Oi({
      messages: C,
      tools: R
    })), j = U, ge = Q, q = U, t.contextStats = {
      usedTokens: Q,
      budgetTokens: G,
      summaryActive: B
    }, Q;
  }
  function lv(C = [], R = W) {
    const U = Zu(C, R), B = !!t.historySummary, Q = j === U ? ge : Oi({
      messages: C,
      tools: R
    });
    if (q = U, t.contextStats = {
      usedTokens: Q,
      budgetTokens: G,
      summaryActive: B
    }, j === U) return;
    const ue = ++ve;
    ec({
      messages: C,
      tools: R
    }).then((he) => {
      if (ue !== ve || q !== U || !Number.isFinite(he)) return;
      j = U, ge = he;
      const ce = t.contextStats.usedTokens !== he || t.contextStats.summaryActive !== B || t.contextStats.budgetTokens !== G;
      t.contextStats = {
        usedTokens: he,
        budgetTokens: G,
        summaryActive: B
      }, ce && o();
    }).catch(() => {
    });
  }
  function mn(C) {
    C?.role === "user" && tv(), t.messages.push({
      ...C,
      attachments: g(C.attachments),
      thoughts: C?.role === "assistant" ? Qu(C.thoughts) : y(C.thoughts)
    }), i();
  }
  function uv(C) {
    return Array.isArray(C) ? C.filter((R) => R && typeof R == "object" && R.name).map((R, U) => ({
      id: String(R.id || c(`tool-${U + 1}`)),
      name: String(R.name || ""),
      arguments: typeof R.arguments == "string" ? R.arguments : JSON.stringify(R.arguments || {})
    })) : [];
  }
  function nc({ persist: C = !1 } = {}) {
    const R = Date.now();
    if ((C || R - L >= 1500) && (i(), L = R), ie) return;
    ie = !0;
    const U = () => {
      ie = !1, o();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(U);
      return;
    }
    setTimeout(U, 16);
  }
  function cv() {
    const C = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(C), o(), C;
  }
  function rc(C, R = {}) {
    C && (typeof R.content == "string" && (C.content = R.content), R.providerPayload && typeof R.providerPayload == "object" && (C.providerPayload = R.providerPayload), Array.isArray(R.thoughts) && (C.thoughts = Qu(R.thoughts, C)), Array.isArray(R.toolCalls) && (C.toolCalls = uv(R.toolCalls)), typeof R.streaming == "boolean" && (C.streaming = R.streaming));
  }
  function Ws(C, R = {}) {
    C && (rc(C, {
      ...R,
      streaming: !1
    }), nc({ persist: !0 }));
  }
  function dv(C, R) {
    for (const [U, B] of n.entries())
      B.runId === C && (n.delete(U), B.cleanup?.(), B.reject(R));
  }
  function fv(C, R) {
    for (const [U, B] of r.entries())
      B.runId === C && (r.delete(U), t.pendingApproval?.id === U && (t.pendingApproval = null), B.cleanup?.(), B.reject(R));
    o();
  }
  function pv(C = "本轮请求已终止。") {
    const R = t.activeRun;
    R && (R.cancelNotice = C, t.progressLabel = "终止中", dv(R.id, /* @__PURE__ */ new Error("tool_aborted")), fv(R.id, /* @__PURE__ */ new Error("tool_aborted")), R.controller.abort(), o());
  }
  function Js(C = t.messages) {
    const R = [{
      role: "system",
      content: we()
    }], U = ht(), B = Se();
    U && R.push(U), B && R.push(B);
    for (const Q of C)
      if (!Q?.approvalRequest) {
        if (Q.role === "assistant" && Array.isArray(Q.toolCalls) && Q.toolCalls.length) {
          R.push({
            role: "assistant",
            content: Q.content || "",
            providerPayload: Q.providerPayload,
            tool_calls: Q.toolCalls.map((ue) => ({
              id: ue.id,
              type: "function",
              function: {
                name: ue.name,
                arguments: ue.arguments
              }
            }))
          });
          continue;
        }
        if (Q.role === "tool") {
          R.push({
            role: "tool",
            tool_call_id: Q.toolCallId,
            content: Q.content
          });
          continue;
        }
        R.push({
          role: Q.role,
          providerPayload: Q.providerPayload,
          content: Q.role === "user" ? m(Q) : Q.content
        });
      }
    return R;
  }
  function zs() {
    const C = Pt(), R = Math.min(t.archivedTurnCount, C.length);
    return C.slice(R).flat();
  }
  function hv() {
    const C = Pt(), R = Math.min(t.archivedTurnCount, C.length);
    return R <= 0 ? !1 : (t.messages = C.slice(R).flat(), t.archivedTurnCount = 0, !0);
  }
  function ic(C, R, U) {
    const B = String(U?.message || U || "tool_failed"), [Q] = B.split(":");
    return {
      ok: !1,
      toolName: C,
      path: typeof R?.path == "string" ? R.path : "",
      error: Q || "tool_failed",
      raw: B,
      message: p(U)
    };
  }
  function oc(C, R, U) {
    if (!C || !R || !U) return;
    const B = `${R}::${U}`;
    C.toolErrorStreakKey === B ? C.toolErrorStreakCount += 1 : (C.toolErrorStreakKey = B, C.toolErrorStreakCount = 1), C.toolErrorStreakCount >= 3 && C.lastLightBrakeKey !== B && (C.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${R}\` 都返回了同一个错误：\`${U}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, C.lastLightBrakeKey = B);
  }
  function mv(C) {
    C && (C.toolErrorStreakKey = "", C.toolErrorStreakCount = 0);
  }
  async function gv(C, R, U) {
    if (!R.length) return;
    const B = Er(R, t.historySummary), Q = hn(R, t.historySummary), ue = S();
    try {
      const he = await C.chat({
        systemPrompt: N,
        messages: [{
          role: "user",
          content: B
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(ue.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: U
      });
      t.historySummary = String(he.text || "").trim() || Q;
    } catch {
      t.historySummary = Q;
    }
  }
  async function yv(C, R) {
    const U = [z, A];
    let B = zs(), Q = Js(B);
    if (await tc(Q), t.contextStats.usedTokens <= K) return Q;
    for (const ue of U) {
      const he = Pt(), ce = Math.max(t.archivedTurnCount, he.length - Math.min(ue, he.length));
      if (ce > t.archivedTurnCount && (await gv(C, he.slice(t.archivedTurnCount, ce), R), t.archivedTurnCount = ce, hv(), i()), B = zs(), Q = Js(B), await tc(Q), t.contextStats.usedTokens <= K)
        return s(`已压缩较早历史，当前上下文 ${Ie()}`), o(), Q;
    }
    return s(`最近对话本身已接近上限，当前上下文 ${Ie()}`), o(), Q;
  }
  function sc(C, R, U = {}) {
    const B = c("tool"), Q = t.activeRun;
    return Q && Q.id === U.runId && Q.toolRequestIds.add(B), new Promise((ue, he) => {
      let ce = !1, Ae = null, Ee = null;
      const We = () => {
        Ae && (clearTimeout(Ae), Ae = null), U.signal && Ee && U.signal.removeEventListener("abort", Ee);
        const St = t.activeRun;
        St && St.id === U.runId && St.toolRequestIds.delete(B);
      }, rt = (St) => {
        ce || (ce = !0, n.delete(B), We(), he(St));
      }, Re = (St) => {
        ce || (ce = !0, n.delete(B), We(), ue(St));
      };
      if (Ee = () => {
        u("xb-assistant:tool-abort", { requestId: B }), rt(/* @__PURE__ */ new Error("tool_aborted"));
      }, Ae = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: B }), rt(/* @__PURE__ */ new Error("tool_timeout"));
      }, O), n.set(B, {
        runId: U.runId,
        cleanup: We,
        resolve: Re,
        reject: rt
      }), U.signal) {
        if (U.signal.aborted) {
          Ee();
          return;
        }
        U.signal.addEventListener("abort", Ee, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: B,
        name: C,
        arguments: R
      });
    });
  }
  function ac(C, R = {}) {
    const U = c("approval"), B = t.activeRun?.id === R.runId ? t.activeRun : null;
    return t.pendingApproval = {
      id: U,
      ...C,
      status: "pending"
    }, o(), new Promise((Q, ue) => {
      let he = !1, ce = null;
      const Ae = () => {
        B && B.toolRequestIds.delete(U), R.signal && ce && R.signal.removeEventListener("abort", ce);
      }, Ee = () => {
        t.pendingApproval?.id === U && (t.pendingApproval = null, o());
      }, We = (Re) => {
        he || (he = !0, r.delete(U), Ae(), Ee(), Q(Re));
      }, rt = (Re) => {
        he || (he = !0, r.delete(U), Ae(), Ee(), ue(Re));
      };
      if (ce = () => {
        rt(/* @__PURE__ */ new Error("tool_aborted"));
      }, B && B.toolRequestIds.add(U), r.set(U, {
        runId: R.runId,
        cleanup: Ae,
        resolve: (Re) => {
          We(Re);
        },
        reject: rt
      }), R.signal) {
        if (R.signal.aborted) {
          ce();
          return;
        }
        R.signal.addEventListener("abort", ce, { once: !0 });
      }
    });
  }
  function vv(C, R = {}) {
    return ac({
      kind: "slash-command",
      command: C
    }, R);
  }
  function _v(C = {}, R = {}) {
    return ac({
      kind: "generate-skill",
      title: String(C.title || "").trim(),
      reason: String(C.reason || "").trim(),
      sourceSummary: String(C.sourceSummary || "").trim()
    }, R);
  }
  function bv(C = t.messages) {
    for (let R = (C || []).length - 1; R >= 0; R -= 1) {
      const U = C[R];
      if (!U?.approvalRequest && U?.role === "user")
        return U;
    }
    return null;
  }
  function wv(C) {
    const R = b(C);
    return R ? {
      normalizedTrigger: R,
      matches: (Array.isArray(t.runtime?.skillsCatalog?.skills) ? t.runtime.skillsCatalog.skills : []).filter((U) => U && U.enabled !== !1 && Array.isArray(U.slashTriggers) && U.slashTriggers.includes(R))
    } : {
      normalizedTrigger: "",
      matches: []
    };
  }
  async function Sv(C) {
    const R = bv();
    if (!R) return null;
    const U = String(R.content || "").trim();
    if (!U.startsWith("/")) return null;
    const B = b(U);
    if (!B) return null;
    const { matches: Q } = wv(B);
    if (!Q.length) return null;
    if (Q.length > 1)
      return s(`命令 ${B} 对应了多条已启用 skill，本轮已跳过自动读取。`), null;
    const ue = Q[0], he = c("auto-read-skill");
    mn({
      role: "assistant",
      content: "",
      toolCalls: [{
        id: he,
        name: ne.READ_SKILL,
        arguments: JSON.stringify({ id: ue.id })
      }]
    }), o(), t.progressLabel = "工具中", o();
    let ce;
    try {
      ce = await sc(ne.READ_SKILL, { id: ue.id }, {
        runId: C.id,
        signal: C.controller.signal
      });
    } catch (Ae) {
      ce = ic(ne.READ_SKILL, { id: ue.id }, Ae);
    }
    return mn({
      role: "tool",
      toolCallId: he,
      toolName: ne.READ_SKILL,
      content: JSON.stringify(ce, null, 2)
    }), o(), ce?.ok === !1 ? (s(`自动读取 skill 失败：${ce.message || ce.error || ue.id}`), null) : ce;
  }
  async function Ev(C) {
    const R = T();
    let U = 0, B = null;
    for (await Sv(C); U < M; ) {
      if (C.controller.signal.aborted) throw new Error("assistant_aborted");
      U += 1, t.currentRound = U, t.progressLabel = "生成中", o();
      const Q = S();
      let ue = null;
      const he = (Ae = {}) => {
        const Ee = typeof Ae.text == "string", We = Array.isArray(Ae.thoughts);
        !Ee && !We || (ue || (ue = cv()), rc(ue, {
          ...Ee ? { content: Ae.text } : {},
          ...We ? { thoughts: Ae.thoughts } : {}
        }), nc());
      };
      let ce;
      try {
        const Ae = {
          systemPrompt: we(),
          tools: W,
          toolChoice: "auto",
          temperature: Q.temperature,
          maxTokens: Q.maxTokens,
          reasoning: {
            enabled: Q.reasoningEnabled,
            effort: Q.reasoningEffort
          },
          signal: C.controller.signal,
          onStreamProgress: he
        };
        Array.isArray(B) && B.length && R?.supportsSessionToolLoop ? Ae.toolResponses = B : Ae.messages = await yv(R, C.controller.signal), ce = await R.chat(Ae);
      } catch (Ae) {
        throw ue && Ws(ue), Ae;
      }
      if (Array.isArray(ce.toolCalls) && ce.toolCalls.length) {
        B = null, ue ? Ws(ue, {
          content: ce.text || "",
          thoughts: ce.thoughts,
          toolCalls: ce.toolCalls,
          providerPayload: ce.providerPayload
        }) : mn({
          role: "assistant",
          content: ce.text || "",
          toolCalls: ce.toolCalls,
          thoughts: ce.thoughts,
          providerPayload: ce.providerPayload
        }), o();
        const Ae = [];
        for (const Ee of ce.toolCalls) {
          if (C.controller.signal.aborted) throw new Error("assistant_aborted");
          const We = d(Ee.arguments, {}), rt = Ee.name === ne.RUN_SLASH_COMMAND ? v(We.command) : "";
          t.progressLabel = "工具中", o();
          let Re = null;
          try {
            Ee.name === ne.RUN_SLASH_COMMAND && _(rt) && (t.progressLabel = "确认中", o(), await vv(rt, {
              runId: C.id,
              signal: C.controller.signal
            }) || (Re = w(rt, !1))), Ee.name === ne.GENERATE_SKILL && String(We.action || "").trim() === "propose" && (t.progressLabel = "确认中", o(), await _v(We, {
              runId: C.id,
              signal: C.controller.signal
            }) || (Re = {
              ok: !0,
              action: "propose",
              approved: !1,
              skipped: !0,
              title: String(We.title || "").trim(),
              note: "用户未同意生成 skill，本次已跳过。"
            })), Re || (Re = await sc(Ee.name, We, {
              runId: C.id,
              signal: C.controller.signal
            })), Ee.name === ne.RUN_SLASH_COMMAND && rt && Re?.ok !== !1 && _(rt) && (Re = {
              ...Re,
              approval: w(rt, !0)
            }), Re?.ok === !1 && Re.error !== "user_declined" ? oc(C, Ee.name, Re.error || "tool_failed") : mv(C);
          } catch (St) {
            if (E(St)) throw St;
            Re = ic(Ee.name, We, St), oc(C, Ee.name, Re.error);
          }
          mn({
            role: "tool",
            toolCallId: Ee.id,
            toolName: Ee.name,
            content: JSON.stringify(Re, null, 2)
          }), Ae.push({
            id: Ee.id,
            name: Ee.name,
            response: Re
          }), o();
        }
        R?.supportsSessionToolLoop && (B = Ae);
        continue;
      }
      B = null, ue ? Ws(ue, {
        content: ce.text || "没有拿到有效回复。",
        thoughts: ce.thoughts,
        providerPayload: ce.providerPayload
      }) : mn({
        role: "assistant",
        content: ce.text || "没有拿到有效回复。",
        thoughts: ce.thoughts,
        providerPayload: ce.providerPayload
      }), t.progressLabel = "", o();
      return;
    }
    mn({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${M}/${M}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", o();
  }
  return {
    resetCompactionState: wt,
    buildContextMeterLabel: Ie,
    updateContextStats: lv,
    pushMessage: mn,
    cancelActiveRun: pv,
    toProviderMessages: Js,
    getActiveContextMessages: zs,
    runAssistantLoop: Ev
  };
}
var ly = "openai-compatible", uy = "默认", cy = "default", wl = {
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
function Tu() {
  return JSON.parse(JSON.stringify(wl));
}
function Au() {
  return {
    provider: ly,
    modelConfigs: Tu(),
    permissionMode: cy
  };
}
function Ds(e) {
  return e === "full" ? "full" : cy;
}
function _i(e) {
  return String(e || "").trim() || "默认";
}
function nI(e = {}) {
  const t = Tu();
  return Object.keys(wl).forEach((n) => {
    t[n] = {
      ...wl[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function rI(e) {
  return typeof e == "string" && e.trim() ? e : ly;
}
function iI(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function oI(e = {}, t) {
  const n = {}, r = iI(e, t);
  return Object.entries(r).forEach(([i, o]) => {
    if (!o || typeof o != "object") return;
    const s = _i(i);
    n[s] = {
      provider: rI(o.provider),
      modelConfigs: nI(o.modelConfigs || {}),
      permissionMode: Ds(o.permissionMode)
    };
  }), Object.keys(n).length || (n[uy] = Au()), n;
}
function sI(e, t) {
  const n = _i(t);
  return e[n] ? n : Object.keys(e)[0];
}
function dy(e = {}) {
  const t = oI(e, _i(e.currentPresetName || e.presetDraftName || "默认")), n = sI(t, e.currentPresetName), r = t[n] || Au();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: n,
    presetDraftName: _i(e.presetDraftName || n),
    presetNames: Object.keys(t),
    presets: t,
    provider: r.provider,
    modelConfigs: r.modelConfigs,
    permissionMode: Ds(r.permissionMode)
  };
}
function xu(e) {
  const t = String(e || "").trim();
  return t ? t.startsWith("/") ? t : `/${t}` : "";
}
function aI(e) {
  const t = xu(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function lI(e) {
  const t = aI(e);
  return t ? `/${t}` : "";
}
function uI(e, t = "default") {
  return xu(e) ? Ds(t) !== "full" : !1;
}
var Sl = function(e, t) {
  return Sl = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Sl(e, t);
};
function cI(e, t) {
  if (typeof t != "function" && t !== null) throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  Sl(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var de = function() {
  return de = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, de.apply(this, arguments);
};
function rs(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, i = t.length, o; r < i; r++) (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var He = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ge = Object.keys, Ce = Array.isArray;
typeof Promise < "u" && !He.Promise && (He.Promise = Promise);
function ft(e, t) {
  return typeof t != "object" || Ge(t).forEach(function(n) {
    e[n] = t[n];
  }), e;
}
var cr = Object.getPrototypeOf, dI = {}.hasOwnProperty;
function nt(e, t) {
  return dI.call(e, t);
}
function dr(e, t) {
  typeof t == "function" && (t = t(cr(e))), (typeof Reflect > "u" ? Ge : Reflect.ownKeys)(t).forEach(function(n) {
    ln(e, n, t[n]);
  });
}
var fy = Object.defineProperty;
function ln(e, t, n, r) {
  fy(e, t, ft(n && nt(n, "get") && typeof n.get == "function" ? {
    get: n.get,
    set: n.set,
    configurable: !0
  } : {
    value: n,
    configurable: !0,
    writable: !0
  }, r));
}
function vr(e) {
  return { from: function(t) {
    return e.prototype = Object.create(t.prototype), ln(e.prototype, "constructor", e), { extend: dr.bind(null, e.prototype) };
  } };
}
var fI = Object.getOwnPropertyDescriptor;
function py(e, t) {
  var n = fI(e, t), r;
  return n || (r = cr(e)) && py(r, t);
}
var pI = [].slice;
function Ls(e, t, n) {
  return pI.call(e, t, n);
}
function hy(e, t) {
  return t(e);
}
function si(e) {
  if (!e) throw new Error("Assertion Failed");
}
function my(e) {
  He.setImmediate ? setImmediate(e) : setTimeout(e, 0);
}
function hI(e, t) {
  return e.reduce(function(n, r, i) {
    var o = t(r, i);
    return o && (n[o[0]] = o[1]), n;
  }, {});
}
function Kt(e, t) {
  if (typeof t == "string" && nt(e, t)) return e[t];
  if (!t) return e;
  if (typeof t != "string") {
    for (var n = [], r = 0, i = t.length; r < i; ++r) {
      var o = Kt(e, t[r]);
      n.push(o);
    }
    return n;
  }
  var s = t.indexOf(".");
  if (s !== -1) {
    var u = e[t.substr(0, s)];
    return u == null ? void 0 : Kt(u, t.substr(s + 1));
  }
}
function dt(e, t, n) {
  if (!(!e || t === void 0) && !("isFrozen" in Object && Object.isFrozen(e)))
    if (typeof t != "string" && "length" in t) {
      si(typeof n != "string" && "length" in n);
      for (var r = 0, i = t.length; r < i; ++r) dt(e, t[r], n[r]);
    } else {
      var o = t.indexOf(".");
      if (o !== -1) {
        var s = t.substr(0, o), u = t.substr(o + 1);
        if (u === "") n === void 0 ? Ce(e) && !isNaN(parseInt(s)) ? e.splice(s, 1) : delete e[s] : e[s] = n;
        else {
          var c = e[s];
          (!c || !nt(e, s)) && (c = e[s] = {}), dt(c, u, n);
        }
      } else n === void 0 ? Ce(e) && !isNaN(parseInt(t)) ? e.splice(t, 1) : delete e[t] : e[t] = n;
    }
}
function mI(e, t) {
  typeof t == "string" ? dt(e, t, void 0) : "length" in t && [].map.call(t, function(n) {
    dt(e, n, void 0);
  });
}
function gy(e) {
  var t = {};
  for (var n in e) nt(e, n) && (t[n] = e[n]);
  return t;
}
var gI = [].concat;
function yy(e) {
  return gI.apply([], e);
}
var yI = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(yy([
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
  return He[e];
}), vy = new Set(yI.map(function(e) {
  return He[e];
}));
function _y(e) {
  var t = {};
  for (var n in e) if (nt(e, n)) {
    var r = e[n];
    t[n] = !r || typeof r != "object" || vy.has(r.constructor) ? r : _y(r);
  }
  return t;
}
function vI(e) {
  for (var t in e) if (nt(e, t)) return !1;
  return !0;
}
var pi = null;
function $n(e) {
  pi = /* @__PURE__ */ new WeakMap();
  var t = El(e);
  return pi = null, t;
}
function El(e) {
  if (!e || typeof e != "object") return e;
  var t = pi.get(e);
  if (t) return t;
  if (Ce(e)) {
    t = [], pi.set(e, t);
    for (var n = 0, r = e.length; n < r; ++n) t.push(El(e[n]));
  } else if (vy.has(e.constructor)) t = e;
  else {
    var i = cr(e);
    t = i === Object.prototype ? {} : Object.create(i), pi.set(e, t);
    for (var o in e) nt(e, o) && (t[o] = El(e[o]));
  }
  return t;
}
var _I = {}.toString;
function Tl(e) {
  return _I.call(e).slice(8, -1);
}
var Al = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", bI = typeof Al == "symbol" ? function(e) {
  var t;
  return e != null && (t = e[Al]) && t.apply(e);
} : function() {
  return null;
};
function En(e, t) {
  var n = e.indexOf(t);
  return n >= 0 && e.splice(n, 1), n >= 0;
}
var tr = {};
function Ht(e) {
  var t, n, r, i;
  if (arguments.length === 1) {
    if (Ce(e)) return e.slice();
    if (this === tr && typeof e == "string") return [e];
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
var Cu = typeof Symbol < "u" ? function(e) {
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
], by = [
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
], Iu = wI.concat(by), SI = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed",
  MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function _r(e, t) {
  this.name = e, this.message = t;
}
vr(_r).from(Error).extend({ toString: function() {
  return this.name + ": " + this.message;
} });
function wy(e, t) {
  return e + ". Errors: " + Object.keys(t).map(function(n) {
    return t[n].toString();
  }).filter(function(n, r, i) {
    return i.indexOf(n) === r;
  }).join(`
`);
}
function is(e, t, n, r) {
  this.failures = t, this.failedKeys = r, this.successCount = n, this.message = wy(e, t);
}
vr(is).from(_r);
function or(e, t) {
  this.name = "BulkError", this.failures = Object.keys(t).map(function(n) {
    return t[n];
  }), this.failuresByPos = t, this.message = wy(e, this.failures);
}
vr(or).from(_r);
var Ru = Iu.reduce(function(e, t) {
  return e[t] = t + "Error", e;
}, {}), EI = _r, re = Iu.reduce(function(e, t) {
  var n = t + "Error";
  function r(i, o) {
    this.name = n, i ? typeof i == "string" ? (this.message = "".concat(i).concat(o ? `
 ` + o : ""), this.inner = o || null) : typeof i == "object" && (this.message = "".concat(i.name, " ").concat(i.message), this.inner = i) : (this.message = SI[t] || n, this.inner = null);
  }
  return vr(r).from(EI), e[t] = r, e;
}, {});
re.Syntax = SyntaxError;
re.Type = TypeError;
re.Range = RangeError;
var up = by.reduce(function(e, t) {
  return e[t + "Error"] = re[t], e;
}, {});
function TI(e, t) {
  if (!e || e instanceof _r || e instanceof TypeError || e instanceof SyntaxError || !e.name || !up[e.name]) return e;
  var n = new up[e.name](t || e.message, e);
  return "stack" in e && ln(n, "stack", { get: function() {
    return this.inner.stack;
  } }), n;
}
var $s = Iu.reduce(function(e, t) {
  return [
    "Syntax",
    "Type",
    "Range"
  ].indexOf(t) === -1 && (e[t + "Error"] = re[t]), e;
}, {});
$s.ModifyError = is;
$s.DexieError = _r;
$s.BulkError = or;
function _e() {
}
function Li(e) {
  return e;
}
function AI(e, t) {
  return e == null || e === Li ? t : function(n) {
    return t(e(n));
  };
}
function Un(e, t) {
  return function() {
    e.apply(this, arguments), t.apply(this, arguments);
  };
}
function xI(e, t) {
  return e === _e ? t : function() {
    var n = e.apply(this, arguments);
    n !== void 0 && (arguments[0] = n);
    var r = this.onsuccess, i = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var o = t.apply(this, arguments);
    return r && (this.onsuccess = this.onsuccess ? Un(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Un(i, this.onerror) : i), o !== void 0 ? o : n;
  };
}
function CI(e, t) {
  return e === _e ? t : function() {
    e.apply(this, arguments);
    var n = this.onsuccess, r = this.onerror;
    this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Un(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Un(r, this.onerror) : r);
  };
}
function II(e, t) {
  return e === _e ? t : function(n) {
    var r = e.apply(this, arguments);
    ft(n, r);
    var i = this.onsuccess, o = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var s = t.apply(this, arguments);
    return i && (this.onsuccess = this.onsuccess ? Un(i, this.onsuccess) : i), o && (this.onerror = this.onerror ? Un(o, this.onerror) : o), r === void 0 ? s === void 0 ? void 0 : s : ft(r, s);
  };
}
function RI(e, t) {
  return e === _e ? t : function() {
    return t.apply(this, arguments) === !1 ? !1 : e.apply(this, arguments);
  };
}
function Pu(e, t) {
  return e === _e ? t : function() {
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
var Lt = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function Sy(e, t) {
  Lt = e;
}
var bi = {}, Ey = 100, Mu = typeof Promise > "u" ? [] : (function() {
  var e = Promise.resolve();
  if (typeof crypto > "u" || !crypto.subtle) return [
    e,
    cr(e),
    e
  ];
  var t = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [
    t,
    cr(t),
    e
  ];
})(), cp = Mu[0], dp = Mu[1], PI = Mu[2], MI = dp && dp.then, Cn = cp && cp.constructor, Nu = !!PI;
function NI() {
  queueMicrotask(DI);
}
var wi = function(e, t) {
  ai.push([e, t]), os && (NI(), os = !1);
}, xl = !0, os = !0, kn = [], $o = [], Cl = Li, sn = {
  id: "global",
  global: !0,
  ref: 0,
  unhandleds: [],
  onunhandled: _e,
  pgp: !1,
  env: {},
  finalize: _e
}, ee = sn, ai = [], Dn = 0, Uo = [];
function J(e) {
  if (typeof this != "object") throw new TypeError("Promises must be constructed via new");
  this._listeners = [], this._lib = !1;
  var t = this._PSD = ee;
  if (typeof e != "function") {
    if (e !== bi) throw new TypeError("Not a function");
    this._state = arguments[1], this._value = arguments[2], this._state === !1 && Rl(this, this._value);
    return;
  }
  this._state = null, this._value = null, ++t.ref, Ay(this, e);
}
var Il = {
  get: function() {
    var e = ee, t = ss;
    function n(r, i) {
      var o = this, s = !e.global && (e !== ee || t !== ss), u = s && !cn(), c = new J(function(d, p) {
        ku(o, new Ty(fp(r, e, s, u), fp(i, e, s, u), d, p, e));
      });
      return this._consoleTask && (c._consoleTask = this._consoleTask), c;
    }
    return n.prototype = bi, n;
  },
  set: function(e) {
    ln(this, "then", e && e.prototype === bi ? Il : {
      get: function() {
        return e;
      },
      set: Il.set
    });
  }
};
dr(J.prototype, {
  then: Il,
  _then: function(e, t) {
    ku(this, new Ty(null, null, e, t, ee));
  },
  catch: function(e) {
    if (arguments.length === 1) return this.then(null, e);
    var t = arguments[0], n = arguments[1];
    return typeof t == "function" ? this.then(null, function(r) {
      return r instanceof t ? n(r) : Fo(r);
    }) : this.then(null, function(r) {
      return r && r.name === t ? n(r) : Fo(r);
    });
  },
  finally: function(e) {
    return this.then(function(t) {
      return J.resolve(e()).then(function() {
        return t;
      });
    }, function(t) {
      return J.resolve(e()).then(function() {
        return Fo(t);
      });
    });
  },
  timeout: function(e, t) {
    var n = this;
    return e < 1 / 0 ? new J(function(r, i) {
      var o = setTimeout(function() {
        return i(new re.Timeout(t));
      }, e);
      n.then(r, i).finally(clearTimeout.bind(null, o));
    }) : this;
  }
});
typeof Symbol < "u" && Symbol.toStringTag && ln(J.prototype, Symbol.toStringTag, "Dexie.Promise");
sn.env = Cy();
function Ty(e, t, n, r, i) {
  this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
}
dr(J, {
  all: function() {
    var e = Ht.apply(null, arguments).map(as);
    return new J(function(t, n) {
      e.length === 0 && t([]);
      var r = e.length;
      e.forEach(function(i, o) {
        return J.resolve(i).then(function(s) {
          e[o] = s, --r || t(e);
        }, n);
      });
    });
  },
  resolve: function(e) {
    return e instanceof J ? e : e && typeof e.then == "function" ? new J(function(t, n) {
      e.then(t, n);
    }) : new J(bi, !0, e);
  },
  reject: Fo,
  race: function() {
    var e = Ht.apply(null, arguments).map(as);
    return new J(function(t, n) {
      e.map(function(r) {
        return J.resolve(r).then(t, n);
      });
    });
  },
  PSD: {
    get: function() {
      return ee;
    },
    set: function(e) {
      return ee = e;
    }
  },
  totalEchoes: { get: function() {
    return ss;
  } },
  newPSD: un,
  usePSD: Fn,
  scheduler: {
    get: function() {
      return wi;
    },
    set: function(e) {
      wi = e;
    }
  },
  rejectionMapper: {
    get: function() {
      return Cl;
    },
    set: function(e) {
      Cl = e;
    }
  },
  follow: function(e, t) {
    return new J(function(n, r) {
      return un(function(i, o) {
        var s = ee;
        s.unhandleds = [], s.onunhandled = o, s.finalize = Un(function() {
          var u = this;
          LI(function() {
            u.unhandleds.length === 0 ? i() : o(u.unhandleds[0]);
          });
        }, s.finalize), e();
      }, t, n, r);
    });
  }
});
Cn && (Cn.allSettled && ln(J, "allSettled", function() {
  var e = Ht.apply(null, arguments).map(as);
  return new J(function(t) {
    e.length === 0 && t([]);
    var n = e.length, r = new Array(n);
    e.forEach(function(i, o) {
      return J.resolve(i).then(function(s) {
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
}), Cn.any && typeof AggregateError < "u" && ln(J, "any", function() {
  var e = Ht.apply(null, arguments).map(as);
  return new J(function(t, n) {
    e.length === 0 && n(/* @__PURE__ */ new AggregateError([]));
    var r = e.length, i = new Array(r);
    e.forEach(function(o, s) {
      return J.resolve(o).then(function(u) {
        return t(u);
      }, function(u) {
        i[s] = u, --r || n(new AggregateError(i));
      });
    });
  });
}), Cn.withResolvers && (J.withResolvers = Cn.withResolvers));
function Ay(e, t) {
  try {
    t(function(n) {
      if (e._state === null) {
        if (n === e) throw new TypeError("A promise cannot be resolved with itself.");
        var r = e._lib && br();
        n && typeof n.then == "function" ? Ay(e, function(i, o) {
          n instanceof J ? n._then(i, o) : n.then(i, o);
        }) : (e._state = !0, e._value = n, xy(e)), r && wr();
      }
    }, Rl.bind(null, e));
  } catch (n) {
    Rl(e, n);
  }
}
function Rl(e, t) {
  if ($o.push(t), e._state === null) {
    var n = e._lib && br();
    t = Cl(t), e._state = !1, e._value = t, $I(e), xy(e), n && wr();
  }
}
function xy(e) {
  var t = e._listeners;
  e._listeners = [];
  for (var n = 0, r = t.length; n < r; ++n) ku(e, t[n]);
  var i = e._PSD;
  --i.ref || i.finalize(), Dn === 0 && (++Dn, wi(function() {
    --Dn === 0 && Du();
  }, []));
}
function ku(e, t) {
  if (e._state === null) {
    e._listeners.push(t);
    return;
  }
  var n = e._state ? t.onFulfilled : t.onRejected;
  if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
  ++t.psd.ref, ++Dn, wi(kI, [
    n,
    e,
    t
  ]);
}
function kI(e, t, n) {
  try {
    var r, i = t._value;
    !t._state && $o.length && ($o = []), r = Lt && t._consoleTask ? t._consoleTask.run(function() {
      return e(i);
    }) : e(i), !t._state && $o.indexOf(i) === -1 && UI(t), n.resolve(r);
  } catch (o) {
    n.reject(o);
  } finally {
    --Dn === 0 && Du(), --n.psd.ref || n.psd.finalize();
  }
}
function DI() {
  Fn(sn, function() {
    br() && wr();
  });
}
function br() {
  var e = xl;
  return xl = !1, os = !1, e;
}
function wr() {
  var e, t, n;
  do
    for (; ai.length > 0; )
      for (e = ai, ai = [], n = e.length, t = 0; t < n; ++t) {
        var r = e[t];
        r[0].apply(null, r[1]);
      }
  while (ai.length > 0);
  xl = !0, os = !0;
}
function Du() {
  var e = kn;
  kn = [], e.forEach(function(r) {
    r._PSD.onunhandled.call(null, r._value, r);
  });
  for (var t = Uo.slice(0), n = t.length; n; ) t[--n]();
}
function LI(e) {
  function t() {
    e(), Uo.splice(Uo.indexOf(t), 1);
  }
  Uo.push(t), ++Dn, wi(function() {
    --Dn === 0 && Du();
  }, []);
}
function $I(e) {
  kn.some(function(t) {
    return t._value === e._value;
  }) || kn.push(e);
}
function UI(e) {
  for (var t = kn.length; t; ) if (kn[--t]._value === e._value) {
    kn.splice(t, 1);
    return;
  }
}
function Fo(e) {
  return new J(bi, !1, e);
}
function xe(e, t) {
  var n = ee;
  return function() {
    var r = br(), i = ee;
    try {
      return dn(n, !0), e.apply(this, arguments);
    } catch (o) {
      t && t(o);
    } finally {
      dn(i, !1), r && wr();
    }
  };
}
var Be = {
  awaits: 0,
  echoes: 0,
  id: 0
}, FI = 0, Bo = [], Oo = 0, ss = 0, BI = 0;
function un(e, t, n, r) {
  var i = ee, o = Object.create(i);
  o.parent = i, o.ref = 0, o.global = !1, o.id = ++BI, sn.env, o.env = Nu ? {
    Promise: J,
    PromiseProp: {
      value: J,
      configurable: !0,
      writable: !0
    },
    all: J.all,
    race: J.race,
    allSettled: J.allSettled,
    any: J.any,
    resolve: J.resolve,
    reject: J.reject
  } : {}, t && ft(o, t), ++i.ref, o.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var s = Fn(o, e, n, r);
  return o.ref === 0 && o.finalize(), s;
}
function Sr() {
  return Be.id || (Be.id = ++FI), ++Be.awaits, Be.echoes += Ey, Be.id;
}
function cn() {
  return Be.awaits ? (--Be.awaits === 0 && (Be.id = 0), Be.echoes = Be.awaits * Ey, !0) : !1;
}
("" + MI).indexOf("[native code]") === -1 && (Sr = cn = _e);
function as(e) {
  return Be.echoes && e && e.constructor === Cn ? (Sr(), e.then(function(t) {
    return cn(), t;
  }, function(t) {
    return cn(), Me(t);
  })) : e;
}
function OI(e) {
  ++ss, (!Be.echoes || --Be.echoes === 0) && (Be.echoes = Be.awaits = Be.id = 0), Bo.push(ee), dn(e, !0);
}
function GI() {
  var e = Bo[Bo.length - 1];
  Bo.pop(), dn(e, !1);
}
function dn(e, t) {
  var n = ee;
  if ((t ? Be.echoes && (!Oo++ || e !== ee) : Oo && (!--Oo || e !== ee)) && queueMicrotask(t ? OI.bind(null, e) : GI), e !== ee && (ee = e, n === sn && (sn.env = Cy()), Nu)) {
    var r = sn.env.Promise, i = e.env;
    (n.global || e.global) && (Object.defineProperty(He, "Promise", i.PromiseProp), r.all = i.all, r.race = i.race, r.resolve = i.resolve, r.reject = i.reject, i.allSettled && (r.allSettled = i.allSettled), i.any && (r.any = i.any));
  }
}
function Cy() {
  var e = He.Promise;
  return Nu ? {
    Promise: e,
    PromiseProp: Object.getOwnPropertyDescriptor(He, "Promise"),
    all: e.all,
    race: e.race,
    allSettled: e.allSettled,
    any: e.any,
    resolve: e.resolve,
    reject: e.reject
  } : {};
}
function Fn(e, t, n, r, i) {
  var o = ee;
  try {
    return dn(e, !0), t(n, r, i);
  } finally {
    dn(o, !1);
  }
}
function fp(e, t, n, r) {
  return typeof e != "function" ? e : function() {
    var i = ee;
    n && Sr(), dn(t, !0);
    try {
      return e.apply(this, arguments);
    } finally {
      dn(i, !1), r && queueMicrotask(cn);
    }
  };
}
function _a(e) {
  Promise === Cn && Be.echoes === 0 ? Oo === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
}
var Me = J.reject;
function Pl(e, t, n, r) {
  if (!e.idbdb || !e._state.openComplete && !ee.letThrough && !e._vip) {
    if (e._state.openComplete) return Me(new re.DatabaseClosed(e._state.dbOpenError));
    if (!e._state.isBeingOpened) {
      if (!e._state.autoOpen) return Me(new re.DatabaseClosed());
      e.open().catch(_e);
    }
    return e._state.dbReadyPromise.then(function() {
      return Pl(e, t, n, r);
    });
  } else {
    var i = e._createTransaction(t, n, e._dbSchema);
    try {
      i.create(), e._state.PR1398_maxLoop = 3;
    } catch (o) {
      return o.name === Ru.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return Pl(e, t, n, r);
      })) : Me(o);
    }
    return i._promise(t, function(o, s) {
      return un(function() {
        return ee.trans = i, r(o, s, i);
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
var pp = "4.0.10", Mn = "￿", Ml = -1 / 0, Gt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Iy = "String expected.", ur = [], Us = "__dbnames", ba = "readonly", wa = "readwrite";
function Bn(e, t) {
  return e ? t ? function() {
    return e.apply(this, arguments) && t.apply(this, arguments);
  } : e : t;
}
var Ry = {
  type: 3,
  lower: -1 / 0,
  lowerOpen: !1,
  upper: [[]],
  upperOpen: !1
};
function ho(e) {
  return typeof e == "string" && !/\./.test(e) ? function(t) {
    return t[e] === void 0 && e in t && (t = $n(t), delete t[e]), t;
  } : function(t) {
    return t;
  };
}
function qI() {
  throw re.Type();
}
function pe(e, t) {
  try {
    var n = hp(e), r = hp(t);
    if (n !== r)
      return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r !== "Date" ? NaN : -1;
    switch (n) {
      case "number":
      case "Date":
      case "string":
        return e > t ? 1 : e < t ? -1 : 0;
      case "binary":
        return HI(mp(e), mp(t));
      case "Array":
        return VI(e, t);
    }
  } catch {
  }
  return NaN;
}
function VI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) {
    var s = pe(e[o], t[o]);
    if (s !== 0) return s;
  }
  return n === r ? 0 : n < r ? -1 : 1;
}
function HI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) if (e[o] !== t[o]) return e[o] < t[o] ? -1 : 1;
  return n === r ? 0 : n < r ? -1 : 1;
}
function hp(e) {
  var t = typeof e;
  if (t !== "object") return t;
  if (ArrayBuffer.isView(e)) return "binary";
  var n = Tl(e);
  return n === "ArrayBuffer" ? "binary" : n;
}
function mp(e) {
  return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
}
var Py = (function() {
  function e() {
  }
  return e.prototype._trans = function(t, n, r) {
    var i = this._tx || ee.trans, o = this.name, s = Lt && typeof console < "u" && console.createTask && console.createTask("Dexie: ".concat(t === "readonly" ? "read" : "write", " ").concat(this.name));
    function u(p, f, h) {
      if (!h.schema[o]) throw new re.NotFound("Table " + o + " not part of transaction");
      return n(h.idbtrans, h);
    }
    var c = br();
    try {
      var d = i && i.db._novip === this.db._novip ? i === ee.trans ? i._promise(t, u, r) : un(function() {
        return i._promise(t, u, r);
      }, {
        trans: i,
        transless: ee.transless || ee
      }) : Pl(this.db, t, [this.name], u);
      return s && (d._consoleTask = s, d = d.catch(function(p) {
        return console.trace(p), Me(p);
      })), d;
    } finally {
      c && wr();
    }
  }, e.prototype.get = function(t, n) {
    var r = this;
    return t && t.constructor === Object ? this.where(t).first(n) : t == null ? Me(new re.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(i) {
      return r.core.get({
        trans: i,
        key: t
      }).then(function(o) {
        return r.hook.reading.fire(o);
      });
    }).then(n);
  }, e.prototype.where = function(t) {
    if (typeof t == "string") return new this.db.WhereClause(this, t);
    if (Ce(t)) return new this.db.WhereClause(this, "[".concat(t.join("+"), "]"));
    var n = Ge(t);
    if (n.length === 1) return this.where(n[0]).equals(t[n[0]]);
    var r = this.schema.indexes.concat(this.schema.primKey).filter(function(p) {
      if (p.compound && n.every(function(h) {
        return p.keyPath.indexOf(h) >= 0;
      })) {
        for (var f = 0; f < n.length; ++f) if (n.indexOf(p.keyPath[f]) === -1) return !1;
        return !0;
      }
      return !1;
    }).sort(function(p, f) {
      return p.keyPath.length - f.keyPath.length;
    })[0];
    if (r && this.db._maxKey !== Mn) {
      var i = r.keyPath.slice(0, n.length);
      return this.where(i).equals(i.map(function(p) {
        return t[p];
      }));
    }
    !r && Lt && console.warn("The query ".concat(JSON.stringify(t), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(n.join("+"), "]"));
    var o = this.schema.idxByName;
    function s(p, f) {
      return pe(p, f) === 0;
    }
    var u = n.reduce(function(p, f) {
      var h = p[0], m = p[1], g = o[f], y = t[f];
      return [h || g, h || !g ? Bn(m, g && g.multi ? function(v) {
        var b = Kt(v, f);
        return Ce(b) && b.some(function(_) {
          return s(y, _);
        });
      } : function(v) {
        return s(y, Kt(v, f));
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
    return new this.db.Collection(new this.db.WhereClause(this, Ce(t) ? "[".concat(t.join("+"), "]") : t));
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
    for (var o = /* @__PURE__ */ new Set(), s = t.prototype; s; s = cr(s)) Object.getOwnPropertyNames(s).forEach(function(c) {
      return o.add(c);
    });
    var u = function(c) {
      if (!c) return c;
      var d = Object.create(t.prototype);
      for (var p in c) if (!o.has(p)) try {
        d[p] = c[p];
      } catch {
      }
      return d;
    };
    return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = u, this.hook("reading", u), t;
  }, e.prototype.defineClass = function() {
    function t(n) {
      ft(this, n);
    }
    return this.mapToClass(t);
  }, e.prototype.add = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = ho(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "add",
        keys: n != null ? [n] : null,
        values: [u]
      });
    }).then(function(c) {
      return c.numFailures ? J.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        dt(t, s, c);
      } catch {
      }
      return c;
    });
  }, e.prototype.update = function(t, n) {
    if (typeof t == "object" && !Ce(t)) {
      var r = Kt(t, this.schema.primKey.keyPath);
      return r === void 0 ? Me(new re.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(r).modify(n);
    } else return this.where(":id").equals(t).modify(n);
  }, e.prototype.put = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = ho(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "put",
        values: [u],
        keys: n != null ? [n] : null
      });
    }).then(function(c) {
      return c.numFailures ? J.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        dt(t, s, c);
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
      return r.numFailures ? J.reject(r.failures[0]) : void 0;
    });
  }, e.prototype.clear = function() {
    var t = this;
    return this._trans("readwrite", function(n) {
      return t.core.mutate({
        trans: n,
        type: "deleteRange",
        range: Ry
      });
    }).then(function(n) {
      return n.numFailures ? J.reject(n.failures[0]) : void 0;
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
      var c = i.schema.primKey, d = c.auto, p = c.keyPath;
      if (p && o) throw new re.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new re.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, h = p && d ? t.map(ho(p)) : t;
      return i.core.mutate({
        trans: u,
        type: "add",
        keys: o,
        values: h,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new or("".concat(i.name, ".bulkAdd(): ").concat(g, " of ").concat(f, " operations failed"), b);
      });
    });
  }, e.prototype.bulkPut = function(t, n, r) {
    var i = this, o = Array.isArray(n) ? n : void 0;
    r = r || (o ? void 0 : n);
    var s = r ? r.allKeys : void 0;
    return this._trans("readwrite", function(u) {
      var c = i.schema.primKey, d = c.auto, p = c.keyPath;
      if (p && o) throw new re.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new re.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, h = p && d ? t.map(ho(p)) : t;
      return i.core.mutate({
        trans: u,
        type: "put",
        keys: o,
        values: h,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new or("".concat(i.name, ".bulkPut(): ").concat(g, " of ").concat(f, " operations failed"), b);
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
        var d = [], p = [];
        t.forEach(function(h, m) {
          var g = h.key, y = h.changes, v = c[m];
          if (v) {
            for (var b = 0, _ = Object.keys(y); b < _.length; b++) {
              var w = _[b], E = y[w];
              if (w === n.schema.primKey.keyPath) {
                if (pe(E, g) !== 0) throw new re.Constraint("Cannot update primary key in bulkUpdate()");
              } else dt(v, w, E);
            }
            s.push(m), d.push(g), p.push(v);
          }
        });
        var f = d.length;
        return r.mutate({
          trans: u,
          type: "put",
          keys: d,
          values: p,
          updates: {
            keys: i,
            changeSpecs: o
          }
        }).then(function(h) {
          var m = h.numFailures, g = h.failures;
          if (m === 0) return f;
          for (var y = 0, v = Object.keys(g); y < v.length; y++) {
            var b = v[y], _ = s[Number(b)];
            if (_ != null) {
              var w = g[b];
              delete g[b], g[_] = w;
            }
          }
          throw new or("".concat(n.name, ".bulkUpdate(): ").concat(m, " of ").concat(f, " operations failed"), g);
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
      throw new or("".concat(n.name, ".bulkDelete(): ").concat(o, " of ").concat(r, " operations failed"), u);
    });
  }, e;
})();
function $i(e) {
  var t = {}, n = function(u, c) {
    if (c) {
      for (var d = arguments.length, p = new Array(d - 1); --d; ) p[d - 1] = arguments[d];
      return t[u].subscribe.apply(null, p), e;
    } else if (typeof u == "string") return t[u];
  };
  n.addEventType = o;
  for (var r = 1, i = arguments.length; r < i; ++r) o(arguments[r]);
  return n;
  function o(u, c, d) {
    if (typeof u == "object") return s(u);
    c || (c = RI), d || (d = _e);
    var p = {
      subscribers: [],
      fire: d,
      subscribe: function(f) {
        p.subscribers.indexOf(f) === -1 && (p.subscribers.push(f), p.fire = c(p.fire, f));
      },
      unsubscribe: function(f) {
        p.subscribers = p.subscribers.filter(function(h) {
          return h !== f;
        }), p.fire = p.subscribers.reduce(c, d);
      }
    };
    return t[u] = n[u] = p, p;
  }
  function s(u) {
    Ge(u).forEach(function(c) {
      var d = u[c];
      if (Ce(d)) o(c, u[c][0], u[c][1]);
      else if (d === "asap") var p = o(c, Li, function() {
        for (var h = arguments.length, m = new Array(h); h--; ) m[h] = arguments[h];
        p.subscribers.forEach(function(g) {
          my(function() {
            g.apply(null, m);
          });
        });
      });
      else throw new re.InvalidArgument("Invalid event config");
    });
  }
}
function Ui(e, t) {
  return vr(t).from({ prototype: e }), t;
}
function KI(e) {
  return Ui(Py.prototype, function(n, r, i) {
    this.db = e, this._tx = i, this.name = n, this.schema = r, this.hook = e._allTables[n] ? e._allTables[n].hook : $i(null, {
      creating: [xI, _e],
      reading: [AI, Li],
      updating: [II, _e],
      deleting: [CI, _e]
    });
  });
}
function Jn(e, t) {
  return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
}
function Sa(e, t) {
  e.filter = Bn(e.filter, t);
}
function Ea(e, t, n) {
  var r = e.replayFilter;
  e.replayFilter = r ? function() {
    return Bn(r(), t());
  } : t, e.justLimit = n && !r;
}
function WI(e, t) {
  e.isMatch = Bn(e.isMatch, t);
}
function Go(e, t) {
  if (e.isPrimKey) return t.primaryKey;
  var n = t.getIndexByKeyPath(e.index);
  if (!n) throw new re.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
  return n;
}
function gp(e, t, n) {
  var r = Go(e, t.schema);
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
function mo(e, t, n, r) {
  var i = e.replayFilter ? Bn(e.filter, e.replayFilter()) : e.filter;
  if (e.or) {
    var o = {}, s = function(u, c, d) {
      if (!i || i(c, d, function(h) {
        return c.stop(h);
      }, function(h) {
        return c.fail(h);
      })) {
        var p = c.primaryKey, f = "" + p;
        f === "[object ArrayBuffer]" && (f = "" + new Uint8Array(p)), nt(o, f) || (o[f] = !0, t(u, c, d));
      }
    };
    return Promise.all([e.or._iterate(s, n), yp(gp(e, r, n), e.algorithm, s, !e.keysOnly && e.valueMapper)]);
  } else
    return yp(gp(e, r, n), Bn(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
}
function yp(e, t, n, r) {
  var i = xe(r ? function(o, s, u) {
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
        o.stop(u), s = _e;
      }, function(u) {
        o.fail(u), s = _e;
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
      if (Ce(r)) return rs(rs([], Ce(t) ? t : [], !0), r, !0).sort();
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
      if (Ce(i)) return Ce(t) ? t.filter(function(s) {
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
    return r.error ? r.table._trans(null, Me.bind(null, r.error)) : r.table._trans("readonly", t).then(n);
  }, e.prototype._write = function(t) {
    var n = this._ctx;
    return n.error ? n.table._trans(null, Me.bind(null, n.error)) : n.table._trans("readwrite", t, "locked");
  }, e.prototype._addAlgorithm = function(t) {
    var n = this._ctx;
    n.algorithm = Bn(n.algorithm, t);
  }, e.prototype._iterate = function(t, n) {
    return mo(this._ctx, t, n, this._ctx.table.core);
  }, e.prototype.clone = function(t) {
    var n = Object.create(this.constructor.prototype), r = Object.create(this._ctx);
    return t && ft(r, t), n._ctx = r, n;
  }, e.prototype.raw = function() {
    return this._ctx.valueMapper = null, this;
  }, e.prototype.each = function(t) {
    var n = this._ctx;
    return this._read(function(r) {
      return mo(n, t, r, n.table.core);
    });
  }, e.prototype.count = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx, o = i.table.core;
      if (Jn(i, !0)) return o.count({
        trans: r,
        query: {
          index: Go(i, o.schema),
          range: i.range
        }
      }).then(function(u) {
        return Math.min(u, i.limit);
      });
      var s = 0;
      return mo(i, function() {
        return ++s, !1;
      }, r, o).then(function() {
        return s;
      });
    }).then(t);
  }, e.prototype.sortBy = function(t, n) {
    var r = t.split(".").reverse(), i = r[0], o = r.length - 1;
    function s(d, p) {
      return p ? s(d[r[p]], p - 1) : d[i];
    }
    var u = this._ctx.dir === "next" ? 1 : -1;
    function c(d, p) {
      return pe(s(d, o), s(p, o)) * u;
    }
    return this.toArray(function(d) {
      return d.sort(c);
    }).then(n);
  }, e.prototype.toArray = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx;
      if (i.dir === "next" && Jn(i, !0) && i.limit > 0) {
        var o = i.valueMapper, s = Go(i, i.table.core.schema);
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
        return mo(i, function(c) {
          return u.push(c);
        }, r, i.table.core).then(function() {
          return u;
        });
      }
    }, t);
  }, e.prototype.offset = function(t) {
    var n = this._ctx;
    return t <= 0 ? this : (n.offset += t, Jn(n) ? Ea(n, function() {
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
    if (n.dir === "next" && Jn(n, !0) && n.limit > 0) return this._read(function(i) {
      var o = Go(n, n.table.core.schema);
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
      var o = i.primaryKey.toString(), s = nt(r, o);
      return r[o] = !0, !s;
    }), this;
  }, e.prototype.modify = function(t) {
    var n = this, r = this._ctx;
    return this._write(function(i) {
      var o;
      if (typeof t == "function") o = t;
      else {
        var s = Ge(t), u = s.length;
        o = function(_) {
          for (var w = !1, E = 0; E < u; ++E) {
            var T = s[E], S = t[T], k = Kt(_, T);
            S instanceof JI ? (dt(_, T, S.execute(k)), w = !0) : k !== S && (dt(_, T, S), w = !0);
          }
          return w;
        };
      }
      var c = r.table.core, d = c.schema.primaryKey, p = d.outbound, f = d.extractKey, h = 200, m = n.db._options.modifyChunkSize;
      m && (typeof m == "object" ? h = m[c.name] || m["*"] || 200 : h = m);
      var g = [], y = 0, v = [], b = function(_, w) {
        var E = w.failures, T = w.numFailures;
        y += _ - T;
        for (var S = 0, k = Ge(E); S < k.length; S++) {
          var x = k[S];
          g.push(E[x]);
        }
      };
      return n.clone().primaryKeys().then(function(_) {
        var w = Jn(r) && r.limit === 1 / 0 && (typeof t != "function" || t === Ta) && {
          index: r.index,
          range: r.range
        }, E = function(T) {
          var S = Math.min(h, _.length - T);
          return c.getMany({
            trans: i,
            keys: _.slice(T, T + S),
            cache: "immutable"
          }).then(function(k) {
            for (var x = [], N = [], $ = p ? [] : null, G = [], K = 0; K < S; ++K) {
              var z = k[K], A = {
                value: $n(z),
                primKey: _[T + K]
              };
              o.call(A, A.value, A) !== !1 && (A.value == null ? G.push(_[T + K]) : !p && pe(f(z), f(A.value)) !== 0 ? (G.push(_[T + K]), x.push(A.value)) : (N.push(A.value), p && $.push(_[T + K])));
            }
            return Promise.resolve(x.length > 0 && c.mutate({
              trans: i,
              type: "add",
              values: x
            }).then(function(M) {
              for (var O in M.failures) G.splice(parseInt(O), 1);
              b(x.length, M);
            })).then(function() {
              return (N.length > 0 || w && typeof t == "object") && c.mutate({
                trans: i,
                type: "put",
                keys: $,
                values: N,
                criteria: w,
                changeSpec: typeof t != "function" && t,
                isAdditionalChunk: T > 0
              }).then(function(M) {
                return b(N.length, M);
              });
            }).then(function() {
              return (G.length > 0 || w && t === Ta) && c.mutate({
                trans: i,
                type: "delete",
                keys: G,
                criteria: w,
                isAdditionalChunk: T > 0
              }).then(function(M) {
                return b(G.length, M);
              });
            }).then(function() {
              return _.length > T + S && E(T + h);
            });
          });
        };
        return E(0).then(function() {
          if (g.length > 0) throw new is("Error modifying one or more objects", g, y, v);
          return _.length;
        });
      });
    });
  }, e.prototype.delete = function() {
    var t = this._ctx, n = t.range;
    return Jn(t) && (t.isPrimKey || n.type === 3) ? this._write(function(r) {
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
          if (d) throw new is("Could not delete some values", Object.keys(c).map(function(p) {
            return c[p];
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
  return Ui(zI.prototype, function(n, r) {
    this.db = e;
    var i = Ry, o = null;
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
      valueMapper: c !== Li ? c : null
    };
  });
}
function XI(e, t) {
  return e < t ? -1 : e === t ? 0 : 1;
}
function QI(e, t) {
  return e > t ? -1 : e === t ? 0 : 1;
}
function ut(e, t, n) {
  var r = e instanceof Ny ? new e.Collection(e) : e;
  return r._ctx.error = n ? new n(t) : new TypeError(t), r;
}
function zn(e) {
  return new e.Collection(e, function() {
    return My("");
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
function go(e, t, n, r) {
  var i, o, s, u, c, d, p, f = n.length;
  if (!n.every(function(y) {
    return typeof y == "string";
  })) return ut(e, Iy);
  function h(y) {
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
    }), d = y, p = y === "next" ? "" : r;
  }
  h("next");
  var m = new e.Collection(e, function() {
    return en(u[0], c[f - 1] + r);
  });
  m._ondirectionchange = function(y) {
    h(y);
  };
  var g = 0;
  return m._addAlgorithm(function(y, v, b) {
    var _ = y.key;
    if (typeof _ != "string") return !1;
    var w = o(_);
    if (t(w, c, g)) return !0;
    for (var E = null, T = g; T < f; ++T) {
      var S = eR(_, w, u[T], c[T], s, d);
      S === null && E === null ? g = T + 1 : (E === null || s(E, S) > 0) && (E = S);
    }
    return v(E !== null ? function() {
      y.continue(E + p);
    } : b), !1;
  }), m;
}
function en(e, t, n, r) {
  return {
    type: 2,
    lower: e,
    upper: t,
    lowerOpen: n,
    upperOpen: r
  };
}
function My(e) {
  return {
    type: 1,
    lower: e,
    upper: e
  };
}
var Ny = (function() {
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
      return this._cmp(t, n) > 0 || this._cmp(t, n) === 0 && (r || i) && !(r && i) ? zn(this) : new this.Collection(this, function() {
        return en(t, n, !r, !i);
      });
    } catch {
      return ut(this, Gt);
    }
  }, e.prototype.equals = function(t) {
    return t == null ? ut(this, Gt) : new this.Collection(this, function() {
      return My(t);
    });
  }, e.prototype.above = function(t) {
    return t == null ? ut(this, Gt) : new this.Collection(this, function() {
      return en(t, void 0, !0);
    });
  }, e.prototype.aboveOrEqual = function(t) {
    return t == null ? ut(this, Gt) : new this.Collection(this, function() {
      return en(t, void 0, !1);
    });
  }, e.prototype.below = function(t) {
    return t == null ? ut(this, Gt) : new this.Collection(this, function() {
      return en(void 0, t, !1, !0);
    });
  }, e.prototype.belowOrEqual = function(t) {
    return t == null ? ut(this, Gt) : new this.Collection(this, function() {
      return en(void 0, t);
    });
  }, e.prototype.startsWith = function(t) {
    return typeof t != "string" ? ut(this, Iy) : this.between(t, t + Mn, !0, !0);
  }, e.prototype.startsWithIgnoreCase = function(t) {
    return t === "" ? this.startsWith(t) : go(this, function(n, r) {
      return n.indexOf(r[0]) === 0;
    }, [t], Mn);
  }, e.prototype.equalsIgnoreCase = function(t) {
    return go(this, function(n, r) {
      return n === r[0];
    }, [t], "");
  }, e.prototype.anyOfIgnoreCase = function() {
    var t = Ht.apply(tr, arguments);
    return t.length === 0 ? zn(this) : go(this, function(n, r) {
      return r.indexOf(n) !== -1;
    }, t, "");
  }, e.prototype.startsWithAnyOfIgnoreCase = function() {
    var t = Ht.apply(tr, arguments);
    return t.length === 0 ? zn(this) : go(this, function(n, r) {
      return r.some(function(i) {
        return n.indexOf(i) === 0;
      });
    }, t, Mn);
  }, e.prototype.anyOf = function() {
    var t = this, n = Ht.apply(tr, arguments), r = this._cmp;
    try {
      n.sort(r);
    } catch {
      return ut(this, Gt);
    }
    if (n.length === 0) return zn(this);
    var i = new this.Collection(this, function() {
      return en(n[0], n[n.length - 1]);
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
    return this.inAnyRange([[Ml, t], [t, this.db._maxKey]], {
      includeLowers: !1,
      includeUppers: !1
    });
  }, e.prototype.noneOf = function() {
    var t = Ht.apply(tr, arguments);
    if (t.length === 0) return new this.Collection(this);
    try {
      t.sort(this._ascending);
    } catch {
      return ut(this, Gt);
    }
    var n = t.reduce(function(r, i) {
      return r ? r.concat([[r[r.length - 1][1], i]]) : [[Ml, i]];
    }, null);
    return n.push([t[t.length - 1], this.db._maxKey]), this.inAnyRange(n, {
      includeLowers: !1,
      includeUppers: !1
    });
  }, e.prototype.inAnyRange = function(t, n) {
    var r = this, i = this._cmp, o = this._ascending, s = this._descending, u = this._min, c = this._max;
    if (t.length === 0) return zn(this);
    if (!t.every(function(T) {
      return T[0] !== void 0 && T[1] !== void 0 && o(T[0], T[1]) <= 0;
    })) return ut(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", re.InvalidArgument);
    var d = !n || n.includeLowers !== !1, p = n && n.includeUppers === !0;
    function f(T, S) {
      for (var k = 0, x = T.length; k < x; ++k) {
        var N = T[k];
        if (i(S[0], N[1]) < 0 && i(S[1], N[0]) > 0) {
          N[0] = u(N[0], S[0]), N[1] = c(N[1], S[1]);
          break;
        }
      }
      return k === x && T.push(S), T;
    }
    var h = o;
    function m(T, S) {
      return h(T[0], S[0]);
    }
    var g;
    try {
      g = t.reduce(f, []), g.sort(m);
    } catch {
      return ut(this, Gt);
    }
    var y = 0, v = p ? function(T) {
      return o(T, g[y][1]) > 0;
    } : function(T) {
      return o(T, g[y][1]) >= 0;
    }, b = d ? function(T) {
      return s(T, g[y][0]) > 0;
    } : function(T) {
      return s(T, g[y][0]) >= 0;
    };
    function _(T) {
      return !v(T) && !b(T);
    }
    var w = v, E = new this.Collection(this, function() {
      return en(g[0][0], g[g.length - 1][1], !d, !p);
    });
    return E._ondirectionchange = function(T) {
      T === "next" ? (w = v, h = o) : (w = b, h = s), g.sort(m);
    }, E._addAlgorithm(function(T, S, k) {
      for (var x = T.key; w(x); )
        if (++y, y === g.length)
          return S(k), !1;
      return _(x) ? !0 : (r._cmp(x, g[y][1]) === 0 || r._cmp(x, g[y][0]) === 0 || S(function() {
        h === o ? T.continue(g[y][0]) : T.continue(g[y][1]);
      }), !1);
    }), E;
  }, e.prototype.startsWithAnyOf = function() {
    var t = Ht.apply(tr, arguments);
    return t.every(function(n) {
      return typeof n == "string";
    }) ? t.length === 0 ? zn(this) : this.inAnyRange(t.map(function(n) {
      return [n, n + Mn];
    })) : ut(this, "startsWithAnyOf() only works with strings");
  }, e;
})();
function tR(e) {
  return Ui(Ny.prototype, function(n, r, i) {
    if (this.db = e, this._ctx = {
      table: n,
      index: r === ":id" ? null : r,
      or: i
    }, this._cmp = this._ascending = pe, this._descending = function(o, s) {
      return pe(s, o);
    }, this._max = function(o, s) {
      return pe(o, s) > 0 ? o : s;
    }, this._min = function(o, s) {
      return pe(o, s) < 0 ? o : s;
    }, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new re.MissingAPI();
  });
}
function kt(e) {
  return xe(function(t) {
    return Si(t), e(t.target.error), !1;
  });
}
function Si(e) {
  e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
}
var Fi = "storagemutated", Nl = "x-storagemutated-1", fn = $i(null, Fi), nR = (function() {
  function e() {
  }
  return e.prototype._lock = function() {
    return si(!ee.global), ++this._reculock, this._reculock === 1 && !ee.global && (ee.lockOwnerFor = this), this;
  }, e.prototype._unlock = function() {
    if (si(!ee.global), --this._reculock === 0)
      for (ee.global || (ee.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
        var t = this._blockedFuncs.shift();
        try {
          Fn(t[1], t[0]);
        } catch {
        }
      }
    return this;
  }, e.prototype._locked = function() {
    return this._reculock && ee.lockOwnerFor !== this;
  }, e.prototype.create = function(t) {
    var n = this;
    if (!this.mode) return this;
    var r = this.db.idbdb, i = this.db._state.dbOpenError;
    if (si(!this.idbtrans), !t && !r) switch (i && i.name) {
      case "DatabaseClosedError":
        throw new re.DatabaseClosed(i);
      case "MissingAPIError":
        throw new re.MissingAPI(i.message, i);
      default:
        throw new re.OpenFailed(i);
    }
    if (!this.active) throw new re.TransactionInactive();
    return si(this._completion._state === null), t = this.idbtrans = t || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : r.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), t.onerror = xe(function(o) {
      Si(o), n._reject(t.error);
    }), t.onabort = xe(function(o) {
      Si(o), n.active && n._reject(new re.Abort(t.error)), n.active = !1, n.on("abort").fire(o);
    }), t.oncomplete = xe(function() {
      n.active = !1, n._resolve(), "mutatedParts" in t && fn.storagemutated.fire(t.mutatedParts);
    }), this;
  }, e.prototype._promise = function(t, n, r) {
    var i = this;
    if (t === "readwrite" && this.mode !== "readwrite") return Me(new re.ReadOnly("Transaction is readonly"));
    if (!this.active) return Me(new re.TransactionInactive());
    if (this._locked()) return new J(function(s, u) {
      i._blockedFuncs.push([function() {
        i._promise(t, n, r).then(s, u);
      }, ee]);
    });
    if (r) return un(function() {
      var s = new J(function(u, c) {
        i._lock();
        var d = n(u, c, i);
        d && d.then && d.then(u, c);
      });
      return s.finally(function() {
        return i._unlock();
      }), s._lib = !0, s;
    });
    var o = new J(function(s, u) {
      var c = n(s, u, i);
      c && c.then && c.then(s, u);
    });
    return o._lib = !0, o;
  }, e.prototype._root = function() {
    return this.parent ? this.parent._root() : this;
  }, e.prototype.waitFor = function(t) {
    var n = this._root(), r = J.resolve(t);
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
    return new J(function(s, u) {
      r.then(function(c) {
        return n._waitingQueue.push(xe(s.bind(null, c)));
      }, function(c) {
        return n._waitingQueue.push(xe(u.bind(null, c)));
      }).finally(function() {
        n._waitingFor === o && (n._waitingFor = null);
      });
    });
  }, e.prototype.abort = function() {
    this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new re.Abort()));
  }, e.prototype.table = function(t) {
    var n = this._memoizedTables || (this._memoizedTables = {});
    if (nt(n, t)) return n[t];
    var r = this.schema[t];
    if (!r) throw new re.NotFound("Table " + t + " not part of transaction");
    var i = new this.db.Table(t, r, this);
    return i.core = this.db.core.table(t), n[t] = i, i;
  }, e;
})();
function rR(e) {
  return Ui(nR.prototype, function(n, r, i, o, s) {
    var u = this;
    this.db = e, this.mode = n, this.storeNames = r, this.schema = i, this.chromeTransactionDurability = o, this.idbtrans = null, this.on = $i(this, "complete", "error", "abort"), this.parent = s || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new J(function(c, d) {
      u._resolve = c, u._reject = d;
    }), this._completion.then(function() {
      u.active = !1, u.on.complete.fire();
    }, function(c) {
      var d = u.active;
      return u.active = !1, u.on.error.fire(c), u.parent ? u.parent._reject(c) : d && u.idbtrans && u.idbtrans.abort(), Me(c);
    });
  });
}
function kl(e, t, n, r, i, o, s) {
  return {
    name: e,
    keyPath: t,
    unique: n,
    multi: r,
    auto: i,
    compound: o,
    src: (n && !s ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + ky(t)
  };
}
function ky(e) {
  return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
}
function Lu(e, t, n) {
  return {
    name: e,
    primKey: t,
    indexes: n,
    mappedClass: null,
    idxByName: hI(n, function(r) {
      return [r.name, r];
    })
  };
}
function iR(e) {
  return e.length === 1 ? e[0] : e;
}
var Ei = function(e) {
  try {
    return e.only([[]]), Ei = function() {
      return [[]];
    }, [[]];
  } catch {
    return Ei = function() {
      return Mn;
    }, Mn;
  }
};
function Dl(e) {
  return e == null ? function() {
  } : typeof e == "string" ? oR(e) : function(t) {
    return Kt(t, e);
  };
}
function oR(e) {
  return e.split(".").length === 1 ? function(t) {
    return t[e];
  } : function(t) {
    return Kt(t, e);
  };
}
function vp(e) {
  return [].slice.call(e);
}
var sR = 0;
function hi(e) {
  return e == null ? ":id" : typeof e == "string" ? e : "[".concat(e.join("+"), "]");
}
function aR(e, t, n) {
  function r(f, h) {
    var m = vp(f.objectStoreNames);
    return {
      schema: {
        name: f.name,
        tables: m.map(function(g) {
          return h.objectStore(g);
        }).map(function(g) {
          var y = g.keyPath, v = g.autoIncrement, b = Ce(y), _ = y == null, w = {}, E = {
            name: g.name,
            primaryKey: {
              name: null,
              isPrimaryKey: !0,
              outbound: _,
              compound: b,
              keyPath: y,
              autoIncrement: v,
              unique: !0,
              extractKey: Dl(y)
            },
            indexes: vp(g.indexNames).map(function(T) {
              return g.index(T);
            }).map(function(T) {
              var S = T.name, k = T.unique, x = T.multiEntry, N = T.keyPath, $ = {
                name: S,
                compound: Ce(N),
                keyPath: N,
                unique: k,
                multiEntry: x,
                extractKey: Dl(N)
              };
              return w[hi(N)] = $, $;
            }),
            getIndexByKeyPath: function(T) {
              return w[hi(T)];
            }
          };
          return w[":id"] = E.primaryKey, y != null && (w[hi(y)] = E.primaryKey), E;
        })
      },
      hasGetAll: m.length > 0 && "getAll" in h.objectStore(m[0]) && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
    };
  }
  function i(f) {
    if (f.type === 3) return null;
    if (f.type === 4) throw new Error("Cannot convert never type to IDBKeyRange");
    var h = f.lower, m = f.upper, g = f.lowerOpen, y = f.upperOpen;
    return h === void 0 ? m === void 0 ? null : t.upperBound(m, !!y) : m === void 0 ? t.lowerBound(h, !!g) : t.bound(h, m, !!g, !!y);
  }
  function o(f) {
    var h = f.name;
    function m(v) {
      var b = v.trans, _ = v.type, w = v.keys, E = v.values, T = v.range;
      return new Promise(function(S, k) {
        S = xe(S);
        var x = b.objectStore(h), N = x.keyPath == null, $ = _ === "put" || _ === "add";
        if (!$ && _ !== "delete" && _ !== "deleteRange") throw new Error("Invalid operation type: " + _);
        var G = (w || E || { length: 1 }).length;
        if (w && E && w.length !== E.length) throw new Error("Given keys array must have same length as given values array.");
        if (G === 0) return S({
          numFailures: 0,
          failures: {},
          results: [],
          lastResult: void 0
        });
        var K, z = [], A = [], M = 0, O = function(j) {
          ++M, Si(j);
        };
        if (_ === "deleteRange") {
          if (T.type === 4) return S({
            numFailures: M,
            failures: A,
            results: [],
            lastResult: void 0
          });
          T.type === 3 ? z.push(K = x.clear()) : z.push(K = x.delete(i(T)));
        } else {
          var W = $ ? N ? [E, w] : [E, null] : [w, null], ne = W[0], ie = W[1];
          if ($) for (var L = 0; L < G; ++L)
            z.push(K = ie && ie[L] !== void 0 ? x[_](ne[L], ie[L]) : x[_](ne[L])), K.onerror = O;
          else for (var L = 0; L < G; ++L)
            z.push(K = x[_](ne[L])), K.onerror = O;
        }
        var q = function(j) {
          var ge = j.target.result;
          z.forEach(function(ve, we) {
            return ve.error != null && (A[we] = ve.error);
          }), S({
            numFailures: M,
            failures: A,
            results: _ === "delete" ? w : z.map(function(ve) {
              return ve.result;
            }),
            lastResult: ge
          });
        };
        K.onerror = function(j) {
          O(j), q(j);
        }, K.onsuccess = q;
      });
    }
    function g(v) {
      var b = v.trans, _ = v.values, w = v.query, E = v.reverse, T = v.unique;
      return new Promise(function(S, k) {
        S = xe(S);
        var x = w.index, N = w.range, $ = b.objectStore(h), G = x.isPrimaryKey ? $ : $.index(x.name), K = E ? T ? "prevunique" : "prev" : T ? "nextunique" : "next", z = _ || !("openKeyCursor" in G) ? G.openCursor(i(N), K) : G.openKeyCursor(i(N), K);
        z.onerror = kt(k), z.onsuccess = xe(function(A) {
          var M = z.result;
          if (!M) {
            S(null);
            return;
          }
          M.___id = ++sR, M.done = !1;
          var O = M.continue.bind(M), W = M.continuePrimaryKey;
          W && (W = W.bind(M));
          var ne = M.advance.bind(M), ie = function() {
            throw new Error("Cursor not started");
          }, L = function() {
            throw new Error("Cursor not stopped");
          };
          M.trans = b, M.stop = M.continue = M.continuePrimaryKey = M.advance = ie, M.fail = xe(k), M.next = function() {
            var q = this, j = 1;
            return this.start(function() {
              return j-- ? q.continue() : q.stop();
            }).then(function() {
              return q;
            });
          }, M.start = function(q) {
            var j = new Promise(function(ve, we) {
              ve = xe(ve), z.onerror = kt(we), M.fail = we, M.stop = function(wt) {
                M.stop = M.continue = M.continuePrimaryKey = M.advance = L, ve(wt);
              };
            }), ge = function() {
              if (z.result) try {
                q();
              } catch (ve) {
                M.fail(ve);
              }
              else
                M.done = !0, M.start = function() {
                  throw new Error("Cursor behind last entry");
                }, M.stop();
            };
            return z.onsuccess = xe(function(ve) {
              z.onsuccess = ge, ge();
            }), M.continue = O, M.continuePrimaryKey = W, M.advance = ne, ge(), j;
          }, S(M);
        }, k);
      });
    }
    function y(v) {
      return function(b) {
        return new Promise(function(_, w) {
          _ = xe(_);
          var E = b.trans, T = b.values, S = b.limit, k = b.query, x = S === 1 / 0 ? void 0 : S, N = k.index, $ = k.range, G = E.objectStore(h), K = N.isPrimaryKey ? G : G.index(N.name), z = i($);
          if (S === 0) return _({ result: [] });
          if (v) {
            var A = T ? K.getAll(z, x) : K.getAllKeys(z, x);
            A.onsuccess = function(ne) {
              return _({ result: ne.target.result });
            }, A.onerror = kt(w);
          } else {
            var M = 0, O = T || !("openKeyCursor" in K) ? K.openCursor(z) : K.openKeyCursor(z), W = [];
            O.onsuccess = function(ne) {
              var ie = O.result;
              if (!ie) return _({ result: W });
              if (W.push(T ? ie.value : ie.primaryKey), ++M === S) return _({ result: W });
              ie.continue();
            }, O.onerror = kt(w);
          }
        });
      };
    }
    return {
      name: h,
      schema: f,
      mutate: m,
      getMany: function(v) {
        var b = v.trans, _ = v.keys;
        return new Promise(function(w, E) {
          w = xe(w);
          for (var T = b.objectStore(h), S = _.length, k = new Array(S), x = 0, N = 0, $, G = function(A) {
            var M = A.target;
            (k[M._pos] = M.result) != null, ++N === x && w(k);
          }, K = kt(E), z = 0; z < S; ++z) _[z] != null && ($ = T.get(_[z]), $._pos = z, $.onsuccess = G, $.onerror = K, ++x);
          x === 0 && w(k);
        });
      },
      get: function(v) {
        var b = v.trans, _ = v.key;
        return new Promise(function(w, E) {
          w = xe(w);
          var T = b.objectStore(h).get(_);
          T.onsuccess = function(S) {
            return w(S.target.result);
          }, T.onerror = kt(E);
        });
      },
      query: y(c),
      openCursor: g,
      count: function(v) {
        var b = v.query, _ = v.trans, w = b.index, E = b.range;
        return new Promise(function(T, S) {
          var k = _.objectStore(h), x = w.isPrimaryKey ? k : k.index(w.name), N = i(E), $ = N ? x.count(N) : x.count();
          $.onsuccess = xe(function(G) {
            return T(G.target.result);
          }), $.onerror = kt(S);
        });
      }
    };
  }
  var s = r(e, n), u = s.schema, c = s.hasGetAll, d = u.tables.map(function(f) {
    return o(f);
  }), p = {};
  return d.forEach(function(f) {
    return p[f.name] = f;
  }), {
    stack: "dbcore",
    transaction: e.transaction.bind(e),
    table: function(f) {
      if (!p[f]) throw new Error("Table '".concat(f, "' not found"));
      return p[f];
    },
    MIN_KEY: -1 / 0,
    MAX_KEY: Ei(t),
    schema: u
  };
}
function lR(e, t) {
  return t.reduce(function(n, r) {
    var i = r.create;
    return de(de({}, n), i(n));
  }, e);
}
function uR(e, t, n, r) {
  var i = n.IDBKeyRange;
  return n.indexedDB, { dbcore: lR(aR(t, i, r), e.dbcore) };
}
function ls(e, t) {
  var n = t.db;
  e.core = uR(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(r) {
    var i = r.name;
    e.core.schema.tables.some(function(o) {
      return o.name === i;
    }) && (r.core = e.core.table(i), e[i] instanceof e.Table && (e[i].core = r.core));
  });
}
function us(e, t, n, r) {
  n.forEach(function(i) {
    var o = r[i];
    t.forEach(function(s) {
      var u = py(s, i);
      (!u || "value" in u && u.value === void 0) && (s === e.Transaction.prototype || s instanceof e.Transaction ? ln(s, i, {
        get: function() {
          return this.table(i);
        },
        set: function(c) {
          fy(this, i, {
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
function Ll(e, t) {
  t.forEach(function(n) {
    for (var r in n) n[r] instanceof e.Table && delete n[r];
  });
}
function cR(e, t) {
  return e._cfg.version - t._cfg.version;
}
function dR(e, t, n, r) {
  var i = e._dbSchema;
  n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = Lu("$meta", Ly("")[0], []), e._storeNames.push("$meta"));
  var o = e._createTransaction("readwrite", e._storeNames, i);
  o.create(n), o._completion.catch(r);
  var s = o._reject.bind(o), u = ee.transless || ee;
  un(function() {
    if (ee.trans = o, ee.transless = u, t === 0)
      Ge(i).forEach(function(c) {
        Uu(n, c, i[c].primKey, i[c].indexes);
      }), ls(e, n), J.follow(function() {
        return e.on.populate.fire(o);
      }).catch(s);
    else
      return ls(e, n), pR(e, o, t).then(function(c) {
        return hR(e, c, o, n);
      }).catch(s);
  });
}
function fR(e, t) {
  Dy(e._dbSchema, t), t.db.version % 10 === 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
  var n = Fs(e, e.idbdb, t);
  ds(e, e._dbSchema, t);
  for (var r = $u(n, e._dbSchema), i = function(d) {
    if (d.change.length || d.recreate)
      return console.warn("Unable to patch indexes of table ".concat(d.name, " because it has changes on the type of index or primary key.")), { value: void 0 };
    var p = t.objectStore(d.name);
    d.add.forEach(function(f) {
      Lt && console.debug("Dexie upgrade patch: Creating missing index ".concat(d.name, ".").concat(f.src)), cs(p, f);
    });
  }, o = 0, s = r.change; o < s.length; o++) {
    var u = s[o], c = i(u);
    if (typeof c == "object") return c.value;
  }
}
function pR(e, t, n) {
  return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(r) {
    return r ?? n;
  }) : J.resolve(n);
}
function hR(e, t, n, r) {
  var i = [], o = e._versions, s = e._dbSchema = Fs(e, e.idbdb, r), u = o.filter(function(d) {
    return d._cfg.version >= t;
  });
  if (u.length === 0) return J.resolve();
  u.forEach(function(d) {
    i.push(function() {
      var p = s, f = d._cfg.dbschema;
      ds(e, p, r), ds(e, f, r), s = e._dbSchema = f;
      var h = $u(p, f);
      h.add.forEach(function(_) {
        Uu(r, _[0], _[1].primKey, _[1].indexes);
      }), h.change.forEach(function(_) {
        if (_.recreate) throw new re.Upgrade("Not yet support for changing primary key");
        var w = r.objectStore(_.name);
        _.add.forEach(function(E) {
          return cs(w, E);
        }), _.change.forEach(function(E) {
          w.deleteIndex(E.name), cs(w, E);
        }), _.del.forEach(function(E) {
          return w.deleteIndex(E);
        });
      });
      var m = d._cfg.contentUpgrade;
      if (m && d._cfg.version > t) {
        ls(e, r), n._memoizedTables = {};
        var g = gy(f);
        h.del.forEach(function(_) {
          g[_] = p[_];
        }), Ll(e, [e.Transaction.prototype]), us(e, [e.Transaction.prototype], Ge(g), g), n.schema = g;
        var y = Cu(m);
        y && Sr();
        var v, b = J.follow(function() {
          if (v = m(n), v && y) {
            var _ = cn.bind(null, null);
            v.then(_, _);
          }
        });
        return v && typeof v.then == "function" ? J.resolve(v) : b.then(function() {
          return v;
        });
      }
    }), i.push(function(p) {
      var f = d._cfg.dbschema;
      mR(f, p), Ll(e, [e.Transaction.prototype]), us(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
    }), i.push(function(p) {
      e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === d._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(f) {
        return f !== "$meta";
      })) : p.objectStore("$meta").put(d._cfg.version, "version"));
    });
  });
  function c() {
    return i.length ? J.resolve(i.shift()(n.idbtrans)).then(c) : J.resolve();
  }
  return c().then(function() {
    Dy(s, r);
  });
}
function $u(e, t) {
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
          var p = u[d], f = c[d];
          p ? p.src !== f.src && s.change.push(f) : s.add.push(f);
        }
        (s.del.length > 0 || s.add.length > 0 || s.change.length > 0) && n.change.push(s);
      }
    }
  }
  return n;
}
function Uu(e, t, n, r) {
  var i = e.db.createObjectStore(t, n.keyPath ? {
    keyPath: n.keyPath,
    autoIncrement: n.auto
  } : { autoIncrement: n.auto });
  return r.forEach(function(o) {
    return cs(i, o);
  }), i;
}
function Dy(e, t) {
  Ge(e).forEach(function(n) {
    t.db.objectStoreNames.contains(n) || (Lt && console.debug("Dexie: Creating missing table", n), Uu(t, n, e[n].primKey, e[n].indexes));
  });
}
function mR(e, t) {
  [].slice.call(t.db.objectStoreNames).forEach(function(n) {
    return e[n] == null && t.db.deleteObjectStore(n);
  });
}
function cs(e, t) {
  e.createIndex(t.name, t.keyPath, {
    unique: t.unique,
    multiEntry: t.multi
  });
}
function Fs(e, t, n) {
  var r = {};
  return Ls(t.objectStoreNames, 0).forEach(function(i) {
    for (var o = n.objectStore(i), s = o.keyPath, u = kl(ky(s), s || "", !0, !1, !!o.autoIncrement, s && typeof s != "string", !0), c = [], d = 0; d < o.indexNames.length; ++d) {
      var p = o.index(o.indexNames[d]);
      s = p.keyPath;
      var f = kl(p.name, s, !!p.unique, !!p.multiEntry, !1, s && typeof s != "string", !1);
      c.push(f);
    }
    r[i] = Lu(i, u, c);
  }), r;
}
function gR(e, t, n) {
  e.verno = t.version / 10;
  var r = e._dbSchema = Fs(e, t, n);
  e._storeNames = Ls(t.objectStoreNames, 0), us(e, [e._allTables], Ge(r), r);
}
function yR(e, t) {
  var n = $u(Fs(e, e.idbdb, t), e._dbSchema);
  return !(n.add.length || n.change.some(function(r) {
    return r.add.length || r.change.length;
  }));
}
function ds(e, t, n) {
  for (var r = n.db.objectStoreNames, i = 0; i < r.length; ++i) {
    var o = r[i], s = n.objectStore(o);
    e._hasGetAll = "getAll" in s;
    for (var u = 0; u < s.indexNames.length; ++u) {
      var c = s.indexNames[u], d = s.index(c).keyPath, p = typeof d == "string" ? d : "[" + Ls(d).join("+") + "]";
      if (t[o]) {
        var f = t[o].idxByName[p];
        f && (f.name = c, delete t[o].idxByName[p], t[o].idxByName[c] = f);
      }
    }
  }
  typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && He.WorkerGlobalScope && He instanceof He.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (e._hasGetAll = !1);
}
function Ly(e) {
  return e.split(",").map(function(t, n) {
    t = t.trim();
    var r = t.replace(/([&*]|\+\+)/g, ""), i = /^\[/.test(r) ? r.match(/^\[(.*)\]$/)[1].split("+") : r;
    return kl(r, i || null, /\&/.test(t), /\*/.test(t), /\+\+/.test(t), Ce(i), n === 0);
  });
}
var vR = (function() {
  function e() {
  }
  return e.prototype._parseStoresSpec = function(t, n) {
    Ge(t).forEach(function(r) {
      if (t[r] !== null) {
        var i = Ly(t[r]), o = i.shift();
        if (o.unique = !0, o.multi) throw new re.Schema("Primary key cannot be multi-valued");
        i.forEach(function(s) {
          if (s.auto) throw new re.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!s.keyPath) throw new re.Schema("Index must have a name and cannot be an empty string");
        }), n[r] = Lu(r, o, i);
      }
    });
  }, e.prototype.stores = function(t) {
    var n = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? ft(this._cfg.storesSource, t) : t;
    var r = n._versions, i = {}, o = {};
    return r.forEach(function(s) {
      ft(i, s._cfg.storesSource), o = s._cfg.dbschema = {}, s._parseStoresSpec(i, o);
    }), n._dbSchema = o, Ll(n, [
      n._allTables,
      n,
      n.Transaction.prototype
    ]), us(n, [
      n._allTables,
      n,
      n.Transaction.prototype,
      this._cfg.tables
    ], Ge(o), o), n._storeNames = Ge(o), this;
  }, e.prototype.upgrade = function(t) {
    return this._cfg.contentUpgrade = Pu(this._cfg.contentUpgrade || _e, t), this;
  }, e;
})();
function _R(e) {
  return Ui(vR.prototype, function(n) {
    this.db = e, this._cfg = {
      version: n,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
  });
}
function Fu(e, t) {
  var n = e._dbNamesDB;
  return n || (n = e._dbNamesDB = new Ai(Us, {
    addons: [],
    indexedDB: e,
    IDBKeyRange: t
  }), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
}
function Bu(e) {
  return e && typeof e.databases == "function";
}
function bR(e) {
  var t = e.indexedDB, n = e.IDBKeyRange;
  return Bu(t) ? Promise.resolve(t.databases()).then(function(r) {
    return r.map(function(i) {
      return i.name;
    }).filter(function(i) {
      return i !== Us;
    });
  }) : Fu(t, n).toCollection().primaryKeys();
}
function wR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Bu(n) && t !== Us && Fu(n, r).put({ name: t }).catch(_e);
}
function SR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Bu(n) && t !== Us && Fu(n, r).delete(t).catch(_e);
}
function $l(e) {
  return un(function() {
    return ee.letThrough = !0, e();
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
function Ou(e) {
  return !("from" in e);
}
var Xe = function(e, t) {
  if (this) ft(this, arguments.length ? {
    d: 1,
    from: e,
    to: arguments.length > 1 ? t : e
  } : { d: 0 });
  else {
    var n = new Xe();
    return e && "d" in e && ft(n, e), n;
  }
};
dr(Xe.prototype, (Aa = {
  add: function(e) {
    return fs(this, e), this;
  },
  addKey: function(e) {
    return Ti(this, e, e), this;
  },
  addKeys: function(e) {
    var t = this;
    return e.forEach(function(n) {
      return Ti(t, n, n);
    }), this;
  },
  hasKey: function(e) {
    var t = ps(this).next(e).value;
    return t && pe(t.from, e) <= 0 && pe(t.to, e) >= 0;
  }
}, Aa[Al] = function() {
  return ps(this);
}, Aa));
function Ti(e, t, n) {
  var r = pe(t, n);
  if (!isNaN(r)) {
    if (r > 0) throw RangeError();
    if (Ou(e)) return ft(e, {
      from: t,
      to: n,
      d: 1
    });
    var i = e.l, o = e.r;
    if (pe(n, e.from) < 0)
      return i ? Ti(i, t, n) : e.l = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, _p(e);
    if (pe(t, e.to) > 0)
      return o ? Ti(o, t, n) : e.r = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, _p(e);
    pe(t, e.from) < 0 && (e.from = t, e.l = null, e.d = o ? o.d + 1 : 1), pe(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
    var s = !e.r;
    i && !e.l && fs(e, i), o && s && fs(e, o);
  }
}
function fs(e, t) {
  function n(r, i) {
    var o = i.from, s = i.to, u = i.l, c = i.r;
    Ti(r, o, s), u && n(r, u), c && n(r, c);
  }
  Ou(t) || n(e, t);
}
function TR(e, t) {
  var n = ps(t), r = n.next();
  if (r.done) return !1;
  for (var i = r.value, o = ps(e), s = o.next(i.from), u = s.value; !r.done && !s.done; ) {
    if (pe(u.from, i.to) <= 0 && pe(u.to, i.from) >= 0) return !0;
    pe(i.from, u.from) < 0 ? i = (r = n.next(u.from)).value : u = (s = o.next(i.from)).value;
  }
  return !1;
}
function ps(e) {
  var t = Ou(e) ? null : {
    s: 0,
    n: e
  };
  return { next: function(n) {
    for (var r = arguments.length > 0; t; ) switch (t.s) {
      case 0:
        if (t.s = 1, r) for (; t.n.l && pe(n, t.n.from) < 0; ) t = {
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
        if (t.s = 2, !r || pe(n, t.n.to) <= 0) return {
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
function _p(e) {
  var t, n, r = (((t = e.r) === null || t === void 0 ? void 0 : t.d) || 0) - (((n = e.l) === null || n === void 0 ? void 0 : n.d) || 0), i = r > 1 ? "r" : r < -1 ? "l" : "";
  if (i) {
    var o = i === "r" ? "l" : "r", s = de({}, e), u = e[i];
    e.from = u.from, e.to = u.to, e[i] = u[i], s[i] = u[o], e[o] = s, s.d = bp(s);
  }
  e.d = bp(e);
}
function bp(e) {
  var t = e.r, n = e.l;
  return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
}
function Bs(e, t) {
  return Ge(t).forEach(function(n) {
    e[n] ? fs(e[n], t[n]) : e[n] = _y(t[n]);
  }), e;
}
function Gu(e, t) {
  return e.all || t.all || Object.keys(e).some(function(n) {
    return t[n] && TR(t[n], e[n]);
  });
}
var Ln = {}, xa = {}, Ca = !1;
function yo(e, t) {
  Bs(xa, e), Ca || (Ca = !0, setTimeout(function() {
    Ca = !1;
    var n = xa;
    xa = {}, qu(n, !1);
  }, 0));
}
function qu(e, t) {
  t === void 0 && (t = !1);
  var n = /* @__PURE__ */ new Set();
  if (e.all) for (var r = 0, i = Object.values(Ln); r < i.length; r++) {
    var o = i[r];
    wp(o, e, n, t);
  }
  else for (var s in e) {
    var u = /^idb\:\/\/(.*)\/(.*)\//.exec(s);
    if (u) {
      var c = u[1], d = u[2], o = Ln["idb://".concat(c, "/").concat(d)];
      o && wp(o, e, n, t);
    }
  }
  n.forEach(function(p) {
    return p();
  });
}
function wp(e, t, n, r) {
  for (var i = [], o = 0, s = Object.entries(e.queries.query); o < s.length; o++) {
    for (var u = s[o], c = u[0], d = u[1], p = [], f = 0, h = d; f < h.length; f++) {
      var m = h[f];
      Gu(t, m.obsSet) ? m.subscribers.forEach(function(b) {
        return n.add(b);
      }) : r && p.push(m);
    }
    r && i.push([c, p]);
  }
  if (r) for (var g = 0, y = i; g < y.length; g++) {
    var v = y[g], c = v[0], p = v[1];
    e.queries.query[c] = p;
  }
}
function AR(e) {
  var t = e._state, n = e._deps.indexedDB;
  if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
    return t.dbOpenError ? Me(t.dbOpenError) : e;
  });
  t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
  var r = t.openCanceller, i = Math.round(e.verno * 10), o = !1;
  function s() {
    if (t.openCanceller !== r) throw new re.DatabaseClosed("db.open() was cancelled");
  }
  var u = t.dbReadyResolve, c = null, d = !1, p = function() {
    return new J(function(f, h) {
      if (s(), !n) throw new re.MissingAPI();
      var m = e.name, g = t.autoSchema || !i ? n.open(m) : n.open(m, i);
      if (!g) throw new re.MissingAPI();
      g.onerror = kt(h), g.onblocked = xe(e._fireOnBlocked), g.onupgradeneeded = xe(function(y) {
        if (c = g.transaction, t.autoSchema && !e._options.allowEmptyDB) {
          g.onerror = Si, c.abort(), g.result.close();
          var v = n.deleteDatabase(m);
          v.onsuccess = v.onerror = xe(function() {
            h(new re.NoSuchDatabase("Database ".concat(m, " doesnt exist")));
          });
        } else {
          c.onerror = kt(h);
          var b = y.oldVersion > Math.pow(2, 62) ? 0 : y.oldVersion;
          d = b < 1, e.idbdb = g.result, o && fR(e, c), dR(e, b / 10, c, h);
        }
      }, h), g.onsuccess = xe(function() {
        c = null;
        var y = e.idbdb = g.result, v = Ls(y.objectStoreNames);
        if (v.length > 0) try {
          var b = y.transaction(iR(v), "readonly");
          if (t.autoSchema) gR(e, y, b);
          else if (ds(e, e._dbSchema, b), !yR(e, b) && !o)
            return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), y.close(), i = y.version + 1, o = !0, f(p());
          ls(e, b);
        } catch {
        }
        ur.push(e), y.onversionchange = xe(function(_) {
          t.vcFired = !0, e.on("versionchange").fire(_);
        }), y.onclose = xe(function(_) {
          e.on("close").fire(_);
        }), d && wR(e._deps, m), f();
      }, h);
    }).catch(function(f) {
      switch (f?.name) {
        case "UnknownError":
          if (t.PR1398_maxLoop > 0)
            return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), p();
          break;
        case "VersionError":
          if (i > 0)
            return i = 0, p();
          break;
      }
      return J.reject(f);
    });
  };
  return J.race([r, (typeof navigator > "u" ? J.resolve() : ER()).then(p)]).then(function() {
    return s(), t.onReadyBeingFired = [], J.resolve($l(function() {
      return e.on.ready.fire(e.vip);
    })).then(function f() {
      if (t.onReadyBeingFired.length > 0) {
        var h = t.onReadyBeingFired.reduce(Pu, _e);
        return t.onReadyBeingFired = [], J.resolve($l(function() {
          return h(e.vip);
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
    return r === t.openCanceller && e._close(), Me(f);
  }).finally(function() {
    t.openComplete = !0, u();
  }).then(function() {
    if (d) {
      var f = {};
      e.tables.forEach(function(h) {
        h.schema.indexes.forEach(function(m) {
          m.name && (f["idb://".concat(e.name, "/").concat(h.name, "/").concat(m.name)] = new Xe(-1 / 0, [[[]]]));
        }), f["idb://".concat(e.name, "/").concat(h.name, "/")] = f["idb://".concat(e.name, "/").concat(h.name, "/:dels")] = new Xe(-1 / 0, [[[]]]);
      }), fn(Fi).fire(f), qu(f, !0);
    }
    return e;
  });
}
function Ul(e) {
  var t = function(s) {
    return e.next(s);
  }, n = function(s) {
    return e.throw(s);
  }, r = o(t), i = o(n);
  function o(s) {
    return function(u) {
      var c = s(u), d = c.value;
      return c.done ? d : !d || typeof d.then != "function" ? Ce(d) ? Promise.all(d).then(r, i) : r(d) : d.then(r, i);
    };
  }
  return o(t)();
}
function xR(e, t, n) {
  var r = arguments.length;
  if (r < 2) throw new re.InvalidArgument("Too few arguments");
  for (var i = new Array(r - 1); --r; ) i[r - 1] = arguments[r];
  return n = i.pop(), [
    e,
    yy(i),
    n
  ];
}
function $y(e, t, n, r, i) {
  return J.resolve().then(function() {
    var o = ee.transless || ee, s = e._createTransaction(t, n, e._dbSchema, r);
    s.explicit = !0;
    var u = {
      trans: s,
      transless: o
    };
    if (r) s.idbtrans = r.idbtrans;
    else try {
      s.create(), s.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
    } catch (f) {
      return f.name === Ru.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return $y(e, t, n, null, i);
      })) : Me(f);
    }
    var c = Cu(i);
    c && Sr();
    var d, p = J.follow(function() {
      if (d = i.call(s, s), d)
        if (c) {
          var f = cn.bind(null, null);
          d.then(f, f);
        } else typeof d.next == "function" && typeof d.throw == "function" && (d = Ul(d));
    }, u);
    return (d && typeof d.then == "function" ? J.resolve(d).then(function(f) {
      return s.active ? f : Me(new re.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
    }) : p.then(function() {
      return d;
    })).then(function(f) {
      return r && s._resolve(), s._completion.then(function() {
        return f;
      });
    }).catch(function(f) {
      return s._reject(f), Me(f);
    });
  });
}
function vo(e, t, n) {
  for (var r = Ce(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
  return r;
}
function CR(e) {
  return de(de({}, e), { table: function(t) {
    var n = e.table(t), r = n.schema, i = {}, o = [];
    function s(g, y, v) {
      var b = hi(g), _ = i[b] = i[b] || [], w = g == null ? 0 : typeof g == "string" ? 1 : g.length, E = y > 0, T = de(de({}, v), {
        name: E ? "".concat(b, "(virtual-from:").concat(v.name, ")") : v.name,
        lowLevelIndex: v,
        isVirtual: E,
        keyTail: y,
        keyLength: w,
        extractKey: Dl(g),
        unique: !E && v.unique
      });
      return _.push(T), T.isPrimaryKey || o.push(T), w > 1 && s(w === 2 ? g[0] : g.slice(0, w - 1), y + 1, v), _.sort(function(S, k) {
        return S.keyTail - k.keyTail;
      }), T;
    }
    var u = s(r.primaryKey.keyPath, 0, r.primaryKey);
    i[":id"] = [u];
    for (var c = 0, d = r.indexes; c < d.length; c++) {
      var p = d[c];
      s(p.keyPath, 0, p);
    }
    function f(g) {
      var y = i[hi(g)];
      return y && y[0];
    }
    function h(g, y) {
      return {
        type: g.type === 1 ? 2 : g.type,
        lower: vo(g.lower, g.lowerOpen ? e.MAX_KEY : e.MIN_KEY, y),
        lowerOpen: !0,
        upper: vo(g.upper, g.upperOpen ? e.MIN_KEY : e.MAX_KEY, y),
        upperOpen: !0
      };
    }
    function m(g) {
      var y = g.query.index;
      return y.isVirtual ? de(de({}, g), { query: {
        index: y.lowLevelIndex,
        range: h(g.query.range, y.keyTail)
      } }) : g;
    }
    return de(de({}, n), {
      schema: de(de({}, r), {
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
          function T(S) {
            S != null ? E.continue(vo(S, g.reverse ? e.MAX_KEY : e.MIN_KEY, v)) : g.unique ? E.continue(E.key.slice(0, _).concat(g.reverse ? e.MIN_KEY : e.MAX_KEY, v)) : E.continue();
          }
          return Object.create(E, {
            continue: { value: T },
            continuePrimaryKey: { value: function(S, k) {
              E.continuePrimaryKey(vo(S, e.MAX_KEY, v), k);
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
  create: CR
};
function Vu(e, t, n, r) {
  return n = n || {}, r = r || "", Ge(e).forEach(function(i) {
    if (!nt(t, i)) n[r + i] = void 0;
    else {
      var o = e[i], s = t[i];
      if (typeof o == "object" && typeof s == "object" && o && s) {
        var u = Tl(o);
        u !== Tl(s) ? n[r + i] = t[i] : u === "Object" ? Vu(o, s, n, r + i + ".") : o !== s && (n[r + i] = t[i]);
      } else o !== s && (n[r + i] = t[i]);
    }
  }), Ge(t).forEach(function(i) {
    nt(e, i) || (n[r + i] = t[i]);
  }), n;
}
function Hu(e, t) {
  return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
}
var RR = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: function(e) {
    return de(de({}, e), { table: function(t) {
      var n = e.table(t), r = n.schema.primaryKey;
      return de(de({}, n), { mutate: function(i) {
        var o = ee.trans, s = o.table(t).hook, u = s.deleting, c = s.creating, d = s.updating;
        switch (i.type) {
          case "add":
            if (c.fire === _e) break;
            return o._promise("readwrite", function() {
              return p(i);
            }, !0);
          case "put":
            if (c.fire === _e && d.fire === _e) break;
            return o._promise("readwrite", function() {
              return p(i);
            }, !0);
          case "delete":
            if (u.fire === _e) break;
            return o._promise("readwrite", function() {
              return p(i);
            }, !0);
          case "deleteRange":
            if (u.fire === _e) break;
            return o._promise("readwrite", function() {
              return f(i);
            }, !0);
        }
        return n.mutate(i);
        function p(m) {
          var g = ee.trans, y = m.keys || Hu(r, m);
          if (!y) throw new Error("Keys missing");
          return m = m.type === "add" || m.type === "put" ? de(de({}, m), { keys: y }) : de({}, m), m.type !== "delete" && (m.values = rs([], m.values, !0)), m.keys && (m.keys = rs([], m.keys, !0)), PR(n, m, y).then(function(v) {
            var b = y.map(function(_, w) {
              var E = v[w], T = {
                onerror: null,
                onsuccess: null
              };
              if (m.type === "delete") u.fire.call(T, _, E, g);
              else if (m.type === "add" || E === void 0) {
                var S = c.fire.call(T, _, m.values[w], g);
                _ == null && S != null && (_ = S, m.keys[w] = _, r.outbound || dt(m.values[w], r.keyPath, _));
              } else {
                var k = Vu(E, m.values[w]), x = d.fire.call(T, k, _, E, g);
                if (x) {
                  var N = m.values[w];
                  Object.keys(x).forEach(function($) {
                    nt(N, $) ? N[$] = x[$] : dt(N, $, x[$]);
                  });
                }
              }
              return T;
            });
            return n.mutate(m).then(function(_) {
              for (var w = _.failures, E = _.results, T = _.numFailures, S = _.lastResult, k = 0; k < y.length; ++k) {
                var x = E ? E[k] : y[k], N = b[k];
                x == null ? N.onerror && N.onerror(w[k]) : N.onsuccess && N.onsuccess(m.type === "put" && v[k] ? m.values[k] : x);
              }
              return {
                failures: w,
                results: E,
                numFailures: T,
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
          return h(m.trans, m.range, 1e4);
        }
        function h(m, g, y) {
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
            return p({
              type: "delete",
              keys: b,
              trans: m
            }).then(function(_) {
              return _.numFailures > 0 ? Promise.reject(_.failures[0]) : b.length < y ? {
                failures: [],
                numFailures: 0,
                lastResult: void 0
              } : h(m, de(de({}, g), {
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
function Uy(e, t, n) {
  try {
    if (!t || t.keys.length < e.length) return null;
    for (var r = [], i = 0, o = 0; i < t.keys.length && o < e.length; ++i)
      pe(t.keys[i], e[o]) === 0 && (r.push(n ? $n(t.values[i]) : t.values[i]), ++o);
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
      return de(de({}, n), {
        getMany: function(r) {
          if (!r.cache) return n.getMany(r);
          var i = Uy(r.keys, r.trans._cache, r.cache === "clone");
          return i ? J.resolve(i) : n.getMany(r).then(function(o) {
            return r.trans._cache = {
              keys: r.keys,
              values: r.cache === "clone" ? $n(o) : o
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
function Fy(e, t) {
  return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
}
function By(e, t) {
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
    var t = e.schema.name, n = new Xe(e.MIN_KEY, e.MAX_KEY);
    return de(de({}, e), {
      transaction: function(r, i, o) {
        if (ee.subscr && i !== "readonly") throw new re.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(ee.querier));
        return e.transaction(r, i, o);
      },
      table: function(r) {
        var i = e.table(r), o = i.schema, s = o.primaryKey, u = o.indexes, c = s.extractKey, d = s.outbound, p = s.autoIncrement && u.filter(function(g) {
          return g.compound && g.keyPath.includes(s.keyPath);
        }), f = de(de({}, i), { mutate: function(g) {
          var y, v, b = g.trans, _ = g.mutatedParts || (g.mutatedParts = {}), w = function(z) {
            var A = "idb://".concat(t, "/").concat(r, "/").concat(z);
            return _[A] || (_[A] = new Xe());
          }, E = w(""), T = w(":dels"), S = g.type, k = g.type === "deleteRange" ? [g.range] : g.type === "delete" ? [g.keys] : g.values.length < 50 ? [Hu(s, g).filter(function(z) {
            return z;
          }), g.values] : [], x = k[0], N = k[1], $ = g.trans._cache;
          if (Ce(x)) {
            E.addKeys(x);
            var G = S === "delete" || x.length === N.length ? Uy(x, $) : null;
            G || T.addKeys(x), (G || N) && kR(w, o, G, N);
          } else if (x) {
            var K = {
              from: (y = x.lower) !== null && y !== void 0 ? y : e.MIN_KEY,
              to: (v = x.upper) !== null && v !== void 0 ? v : e.MAX_KEY
            };
            T.add(K), E.add(K);
          } else
            E.add(n), T.add(n), o.indexes.forEach(function(z) {
              return w(z.name).add(n);
            });
          return i.mutate(g).then(function(z) {
            return x && (g.type === "add" || g.type === "put") && (E.addKeys(z.results), p && p.forEach(function(A) {
              for (var M = g.values.map(function(ie) {
                return A.extractKey(ie);
              }), O = A.keyPath.findIndex(function(ie) {
                return ie === s.keyPath;
              }), W = 0, ne = z.results.length; W < ne; ++W) M[W][O] = z.results[W];
              w(A.name).addKeys(M);
            })), b.mutatedParts = Bs(b.mutatedParts || {}, _), z;
          });
        } }), h = function(g) {
          var y, v, b = g.query, _ = b.index, w = b.range;
          return [_, new Xe((y = w.lower) !== null && y !== void 0 ? y : e.MIN_KEY, (v = w.upper) !== null && v !== void 0 ? v : e.MAX_KEY)];
        }, m = {
          get: function(g) {
            return [s, new Xe(g.key)];
          },
          getMany: function(g) {
            return [s, new Xe().addKeys(g.keys)];
          },
          count: h,
          query: h,
          openCursor: h
        };
        return Ge(m).forEach(function(g) {
          f[g] = function(y) {
            var v = ee.subscr, b = !!v, _ = Fy(ee, i) && By(g, y) ? y.obsSet = {} : v;
            if (b) {
              var w = function($) {
                var G = "idb://".concat(t, "/").concat(r, "/").concat($);
                return _[G] || (_[G] = new Xe());
              }, E = w(""), T = w(":dels"), S = m[g](y), k = S[0], x = S[1];
              if (g === "query" && k.isPrimaryKey && !y.values ? T.add(x) : w(k.name || "").add(x), !k.isPrimaryKey) if (g === "count") T.add(n);
              else {
                var N = g === "query" && d && y.values && i.query(de(de({}, y), { values: !1 }));
                return i[g].apply(this, arguments).then(function($) {
                  if (g === "query") {
                    if (d && y.values) return N.then(function(A) {
                      var M = A.result;
                      return E.addKeys(M), $;
                    });
                    var G = y.values ? $.result.map(c) : $.result;
                    y.values ? E.addKeys(G) : T.addKeys(G);
                  } else if (g === "openCursor") {
                    var K = $, z = y.values;
                    return K && Object.create(K, {
                      key: { get: function() {
                        return T.addKey(K.primaryKey), K.key;
                      } },
                      primaryKey: { get: function() {
                        var A = K.primaryKey;
                        return T.addKey(A), A;
                      } },
                      value: { get: function() {
                        return z && E.addKey(K.primaryKey), K.value;
                      } }
                    });
                  }
                  return $;
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
      return o.multiEntry && Ce(d) ? d.forEach(function(p) {
        return s.addKey(p);
      }) : s.addKey(d);
    };
    (n || r).forEach(function(d, p) {
      var f = n && u(n[p]), h = r && u(r[p]);
      pe(f, h) !== 0 && (f != null && c(f), h != null && c(h));
    });
  }
  t.indexes.forEach(i);
}
function Sp(e, t, n) {
  if (n.numFailures === 0) return t;
  if (t.type === "deleteRange") return null;
  var r = t.keys ? t.keys.length : "values" in t && t.values ? t.values.length : 1;
  if (n.numFailures === r) return null;
  var i = de({}, t);
  return Ce(i.keys) && (i.keys = i.keys.filter(function(o, s) {
    return !(s in n.failures);
  })), "values" in i && Ce(i.values) && (i.values = i.values.filter(function(o, s) {
    return !(s in n.failures);
  })), i;
}
function DR(e, t) {
  return t.lower === void 0 ? !0 : t.lowerOpen ? pe(e, t.lower) > 0 : pe(e, t.lower) >= 0;
}
function LR(e, t) {
  return t.upper === void 0 ? !0 : t.upperOpen ? pe(e, t.upper) < 0 : pe(e, t.upper) <= 0;
}
function Ia(e, t) {
  return DR(e, t) && LR(e, t);
}
function Ep(e, t, n, r, i, o) {
  if (!n || n.length === 0) return e;
  var s = t.query.index, u = s.multiEntry, c = t.query.range, d = r.schema.primaryKey.extractKey, p = s.extractKey, f = (s.lowLevelIndex || s).extractKey, h = n.reduce(function(m, g) {
    var y = m, v = [];
    if (g.type === "add" || g.type === "put")
      for (var b = new Xe(), _ = g.values.length - 1; _ >= 0; --_) {
        var w = g.values[_], E = d(w);
        if (!b.hasKey(E)) {
          var T = p(w);
          (u && Ce(T) ? T.some(function($) {
            return Ia($, c);
          }) : Ia(T, c)) && (b.addKey(E), v.push(w));
        }
      }
    switch (g.type) {
      case "add":
        var S = new Xe().addKeys(t.values ? m.map(function($) {
          return d($);
        }) : m);
        y = m.concat(t.values ? v.filter(function($) {
          var G = d($);
          return S.hasKey(G) ? !1 : (S.addKey(G), !0);
        }) : v.map(function($) {
          return d($);
        }).filter(function($) {
          return S.hasKey($) ? !1 : (S.addKey($), !0);
        }));
        break;
      case "put":
        var k = new Xe().addKeys(g.values.map(function($) {
          return d($);
        }));
        y = m.filter(function($) {
          return !k.hasKey(t.values ? d($) : $);
        }).concat(t.values ? v : v.map(function($) {
          return d($);
        }));
        break;
      case "delete":
        var x = new Xe().addKeys(g.keys);
        y = m.filter(function($) {
          return !x.hasKey(t.values ? d($) : $);
        });
        break;
      case "deleteRange":
        var N = g.range;
        y = m.filter(function($) {
          return !Ia(d($), N);
        });
        break;
    }
    return y;
  }, e);
  return h === e ? e : (h.sort(function(m, g) {
    return pe(f(m), f(g)) || pe(d(m), d(g));
  }), t.limit && t.limit < 1 / 0 && (h.length > t.limit ? h.length = t.limit : e.length === t.limit && h.length < t.limit && (i.dirty = !0)), o ? Object.freeze(h) : h);
}
function Tp(e, t) {
  return pe(e.lower, t.lower) === 0 && pe(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
}
function $R(e, t, n, r) {
  if (e === void 0) return t !== void 0 ? -1 : 0;
  if (t === void 0) return 1;
  var i = pe(e, t);
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
  var i = pe(e, t);
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
  var i = Ln["idb://".concat(e, "/").concat(t)];
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
        return d.req.limit === r.limit && d.req.values === r.values && Tp(d.req.query.range, r.query.range);
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
        return Tp(d.req.query.range, r.query.range);
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
    e.subscribers.size === 0 && En(t, e);
  }, 3e3);
}
var qR = {
  stack: "dbcore",
  level: 0,
  name: "Cache",
  create: function(e) {
    var t = e.schema.name;
    return de(de({}, e), {
      transaction: function(n, r, i) {
        var o = e.transaction(n, r, i);
        if (r === "readwrite") {
          var s = new AbortController(), u = s.signal, c = function(d) {
            return function() {
              if (s.abort(), r === "readwrite") {
                for (var p = /* @__PURE__ */ new Set(), f = 0, h = n; f < h.length; f++) {
                  var m = h[f], g = Ln["idb://".concat(t, "/").concat(m)];
                  if (g) {
                    var y = e.table(m), v = g.optimisticOps.filter(function(z) {
                      return z.trans === o;
                    });
                    if (o._explicit && d && o.mutatedParts) for (var b = 0, _ = Object.values(g.queries.query); b < _.length; b++)
                      for (var w = _[b], E = 0, T = w.slice(); E < T.length; E++) {
                        var S = T[E];
                        Gu(S.obsSet, o.mutatedParts) && (En(w, S), S.subscribers.forEach(function(z) {
                          return p.add(z);
                        }));
                      }
                    else if (v.length > 0) {
                      g.optimisticOps = g.optimisticOps.filter(function(z) {
                        return z.trans !== o;
                      });
                      for (var k = 0, x = Object.values(g.queries.query); k < x.length; k++)
                        for (var w = x[k], N = 0, $ = w.slice(); N < $.length; N++) {
                          var S = $[N];
                          if (S.res != null && o.mutatedParts) if (d && !S.dirty) {
                            var G = Object.isFrozen(S.res), K = Ep(S.res, S.req, v, y, S, G);
                            S.dirty ? (En(w, S), S.subscribers.forEach(function(M) {
                              return p.add(M);
                            })) : K !== S.res && (S.res = K, S.promise = J.resolve({ result: K }));
                          } else
                            S.dirty && En(w, S), S.subscribers.forEach(function(M) {
                              return p.add(M);
                            });
                        }
                    }
                  }
                }
                p.forEach(function(z) {
                  return z();
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
        return de(de({}, r), {
          mutate: function(o) {
            var s = ee.trans;
            if (i.outbound || s.db._options.cache === "disabled" || s.explicit || s.idbtrans.mode !== "readwrite") return r.mutate(o);
            var u = Ln["idb://".concat(t, "/").concat(n)];
            if (!u) return r.mutate(o);
            var c = r.mutate(o);
            return (o.type === "add" || o.type === "put") && (o.values.length >= 50 || Hu(i, o).some(function(d) {
              return d == null;
            })) ? c.then(function(d) {
              var p = Sp(u, de(de({}, o), { values: o.values.map(function(f, h) {
                var m;
                if (d.failures[h]) return f;
                var g = !((m = i.keyPath) === null || m === void 0) && m.includes(".") ? $n(f) : de({}, f);
                return dt(g, i.keyPath, d.results[h]), g;
              }) }), d);
              u.optimisticOps.push(p), queueMicrotask(function() {
                return o.mutatedParts && yo(o.mutatedParts);
              });
            }) : (u.optimisticOps.push(o), o.mutatedParts && yo(o.mutatedParts), c.then(function(d) {
              if (d.numFailures > 0) {
                En(u.optimisticOps, o);
                var p = Sp(u, o, d);
                p && u.optimisticOps.push(p), o.mutatedParts && yo(o.mutatedParts);
              }
            }), c.catch(function() {
              En(u.optimisticOps, o), o.mutatedParts && yo(o.mutatedParts);
            })), c;
          },
          query: function(o) {
            var s;
            if (!Fy(ee, r) || !By("query", o)) return r.query(o);
            var u = ((s = ee.trans) === null || s === void 0 ? void 0 : s.db._options.cache) === "immutable", c = ee, d = c.requery, p = c.signal, f = BR(t, n, "query", o), h = f[0], m = f[1], g = f[2], y = f[3];
            if (h && m) h.obsSet = o.obsSet;
            else {
              var v = r.query(o).then(function(b) {
                var _ = b.result;
                if (h && (h.res = _), u) {
                  for (var w = 0, E = _.length; w < E; ++w) Object.freeze(_[w]);
                  Object.freeze(_);
                } else b.result = $n(_);
                return b;
              }).catch(function(b) {
                return y && h && En(y, h), Promise.reject(b);
              });
              h = {
                obsSet: o.obsSet,
                promise: v,
                subscribers: /* @__PURE__ */ new Set(),
                type: "query",
                req: o,
                dirty: !1
              }, y ? y.push(h) : (y = [h], g || (g = Ln["idb://".concat(t, "/").concat(n)] = {
                queries: {
                  query: {},
                  count: {}
                },
                objs: /* @__PURE__ */ new Map(),
                optimisticOps: [],
                unsignaledParts: {}
              }), g.queries.query[o.query.index.name || ""] = y);
            }
            return OR(h, y, d, p), h.promise.then(function(b) {
              return { result: Ep(b.result, o, g?.optimisticOps, r, h, u) };
            });
          }
        });
      }
    });
  }
};
function _o(e, t) {
  return new Proxy(e, { get: function(n, r, i) {
    return r === "db" ? t : Reflect.get(n, r, i);
  } });
}
var Ai = (function() {
  function e(t, n) {
    var r = this;
    this._middlewares = {}, this.verno = 0;
    var i = e.dependencies;
    this._options = n = de({
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
      dbReadyResolve: _e,
      dbReadyPromise: null,
      cancelOpen: _e,
      openCanceller: null,
      autoSchema: !0,
      PR1398_maxLoop: 3,
      autoOpen: n.autoOpen
    };
    s.dbReadyPromise = new J(function(c) {
      s.dbReadyResolve = c;
    }), s.openCanceller = new J(function(c, d) {
      s.cancelOpen = d;
    }), this._state = s, this.name = t, this.on = $i(this, "populate", "blocked", "versionchange", "close", { ready: [Pu, _e] }), this.on.ready.subscribe = hy(this.on.ready.subscribe, function(c) {
      return function(d, p) {
        e.vip(function() {
          var f = r._state;
          if (f.openComplete)
            f.dbOpenError || J.resolve().then(d), p && c(d);
          else if (f.onReadyBeingFired)
            f.onReadyBeingFired.push(d), p && c(d);
          else {
            c(d);
            var h = r;
            p || c(function m() {
              h.on.ready.unsubscribe(d), h.on.ready.unsubscribe(m);
            });
          }
        });
      };
    }), this.Collection = YI(this), this.Table = KI(this), this.Transaction = rR(this), this.Version = _R(this), this.WhereClause = tR(this), this.on("versionchange", function(c) {
      c.newVersion > 0 ? console.warn("Another connection wants to upgrade database '".concat(r.name, "'. Closing db now to resume the upgrade.")) : console.warn("Another connection wants to delete database '".concat(r.name, "'. Closing db now to resume the delete request.")), r.close({ disableAutoOpen: !1 });
    }), this.on("blocked", function(c) {
      !c.newVersion || c.newVersion < c.oldVersion ? console.warn("Dexie.delete('".concat(r.name, "') was blocked")) : console.warn("Upgrade '".concat(r.name, "' blocked by other connection holding version ").concat(c.oldVersion / 10));
    }), this._maxKey = Ei(n.IDBKeyRange), this._createTransaction = function(c, d, p, f) {
      return new r.Transaction(c, d, p, r._options.chromeTransactionDurability, f);
    }, this._fireOnBlocked = function(c) {
      r.on("blocked").fire(c), ur.filter(function(d) {
        return d.name === r.name && d !== r && !d._state.vcFired;
      }).map(function(d) {
        return d.on("versionchange").fire(c);
      });
    }, this.use(MR), this.use(qR), this.use(NR), this.use(IR), this.use(RR);
    var u = new Proxy(this, { get: function(c, d, p) {
      if (d === "_vip") return !0;
      if (d === "table") return function(h) {
        return _o(r.table(h), u);
      };
      var f = Reflect.get(c, d, p);
      return f instanceof Py ? _o(f, u) : d === "tables" ? f.map(function(h) {
        return _o(h, u);
      }) : d === "_createTransaction" ? function() {
        return _o(f.apply(this, arguments), u);
      } : f;
    } });
    this.vip = u, o.forEach(function(c) {
      return c(r);
    });
  }
  return e.prototype.version = function(t) {
    if (isNaN(t) || t < 0.1) throw new re.Type("Given version is not a positive number");
    if (t = Math.round(t * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new re.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, t);
    var n = this._versions, r = n.filter(function(i) {
      return i._cfg.version === t;
    })[0];
    return r || (r = new this.Version(t), n.push(r), n.sort(cR), r.stores({}), this._state.autoSchema = !1, r);
  }, e.prototype._whenReady = function(t) {
    var n = this;
    return this.idbdb && (this._state.openComplete || ee.letThrough || this._vip) ? t() : new J(function(r, i) {
      if (n._state.openComplete) return i(new re.DatabaseClosed(n._state.dbOpenError));
      if (!n._state.isBeingOpened) {
        if (!n._state.autoOpen) {
          i(new re.DatabaseClosed());
          return;
        }
        n.open().catch(_e);
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
    return Fn(sn, function() {
      return AR(t);
    });
  }, e.prototype._close = function() {
    var t = this._state, n = ur.indexOf(this);
    if (n >= 0 && ur.splice(n, 1), this.idbdb) {
      try {
        this.idbdb.close();
      } catch {
      }
      this.idbdb = null;
    }
    t.isBeingOpened || (t.dbReadyPromise = new J(function(r) {
      t.dbReadyResolve = r;
    }), t.openCanceller = new J(function(r, i) {
      t.cancelOpen = i;
    }));
  }, e.prototype.close = function(t) {
    var n = (t === void 0 ? { disableAutoOpen: !0 } : t).disableAutoOpen, r = this._state;
    n ? (r.isBeingOpened && r.cancelOpen(new re.DatabaseClosed()), this._close(), r.autoOpen = !1, r.dbOpenError = new re.DatabaseClosed()) : (this._close(), r.autoOpen = this._options.autoOpen || r.isBeingOpened, r.openComplete = !1, r.dbOpenError = null);
  }, e.prototype.delete = function(t) {
    var n = this;
    t === void 0 && (t = { disableAutoOpen: !0 });
    var r = arguments.length > 0 && typeof arguments[0] != "object", i = this._state;
    return new J(function(o, s) {
      var u = function() {
        n.close(t);
        var c = n._deps.indexedDB.deleteDatabase(n.name);
        c.onsuccess = xe(function() {
          SR(n._deps, n.name), o();
        }), c.onerror = kt(s), c.onblocked = n._fireOnBlocked;
      };
      if (r) throw new re.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
      return Ge(this._allTables).map(function(n) {
        return t._allTables[n];
      });
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype.transaction = function() {
    var t = xR.apply(this, arguments);
    return this._transaction.apply(this, t);
  }, e.prototype._transaction = function(t, n, r) {
    var i = this, o = ee.trans;
    (!o || o.db !== this || t.indexOf("!") !== -1) && (o = null);
    var s = t.indexOf("?") !== -1;
    t = t.replace("!", "").replace("?", "");
    var u, c;
    try {
      if (c = n.map(function(p) {
        var f = p instanceof i.Table ? p.name : p;
        if (typeof f != "string") throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return f;
      }), t == "r" || t === ba) u = ba;
      else if (t == "rw" || t == wa) u = wa;
      else throw new re.InvalidArgument("Invalid transaction mode: " + t);
      if (o) {
        if (o.mode === ba && u === wa) if (s) o = null;
        else throw new re.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        o && c.forEach(function(p) {
          if (o && o.storeNames.indexOf(p) === -1) if (s) o = null;
          else throw new re.SubTransaction("Table " + p + " not included in parent transaction.");
        }), s && o && !o.active && (o = null);
      }
    } catch (p) {
      return o ? o._promise(null, function(f, h) {
        h(p);
      }) : Me(p);
    }
    var d = $y.bind(null, this, u, c, o, r);
    return o ? o._promise(u, d, "lock") : ee.trans ? Fn(ee.transless, function() {
      return i._whenReady(d);
    }) : this._whenReady(d);
  }, e.prototype.table = function(t) {
    if (!nt(this._allTables, t)) throw new re.InvalidTable("Table ".concat(t, " does not exist"));
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
})(), hs;
try {
  hs = {
    indexedDB: He.indexedDB || He.mozIndexedDB || He.webkitIndexedDB || He.msIndexedDB,
    IDBKeyRange: He.IDBKeyRange || He.webkitIDBKeyRange
  };
} catch {
  hs = {
    indexedDB: null,
    IDBKeyRange: null
  };
}
function KR(e) {
  var t = !1, n, r = new HR(function(i) {
    var o = Cu(e);
    function s(b) {
      var _ = br();
      try {
        o && Sr();
        var w = un(e, b);
        return o && (w = w.finally(cn)), w;
      } finally {
        _ && wr();
      }
    }
    var u = !1, c, d = {}, p = {}, f = {
      get closed() {
        return u;
      },
      unsubscribe: function() {
        u || (u = !0, c && c.abort(), h && fn.storagemutated.unsubscribe(y));
      }
    };
    i.start && i.start(f);
    var h = !1, m = function() {
      return _a(v);
    };
    function g() {
      return Gu(p, d);
    }
    var y = function(b) {
      Bs(d, b), g() && m();
    }, v = function() {
      if (!(u || !hs.indexedDB)) {
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
          t = !0, n = E, !(u || _.signal.aborted) && (d = {}, p = b, !vI(p) && !h && (fn(Fi, y), h = !0), _a(function() {
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
var In = Ai;
dr(In, de(de({}, $s), {
  delete: function(e) {
    return new In(e, { addons: [] }).delete();
  },
  exists: function(e) {
    return new In(e, { addons: [] }).open().then(function(t) {
      return t.close(), !0;
    }).catch("NoSuchDatabaseError", function() {
      return !1;
    });
  },
  getDatabaseNames: function(e) {
    try {
      return bR(In.dependencies).then(e);
    } catch {
      return Me(new re.MissingAPI());
    }
  },
  defineClass: function() {
    function e(t) {
      ft(this, t);
    }
    return e;
  },
  ignoreTransaction: function(e) {
    return ee.trans ? Fn(ee.transless, e) : e();
  },
  vip: $l,
  async: function(e) {
    return function() {
      try {
        var t = Ul(e.apply(this, arguments));
        return !t || typeof t.then != "function" ? J.resolve(t) : t;
      } catch (n) {
        return Me(n);
      }
    };
  },
  spawn: function(e, t, n) {
    try {
      var r = Ul(e.apply(n, t || []));
      return !r || typeof r.then != "function" ? J.resolve(r) : r;
    } catch (i) {
      return Me(i);
    }
  },
  currentTransaction: { get: function() {
    return ee.trans || null;
  } },
  waitFor: function(e, t) {
    var n = J.resolve(typeof e == "function" ? In.ignoreTransaction(e) : e).timeout(t || 6e4);
    return ee.trans ? ee.trans.waitFor(n) : n;
  },
  Promise: J,
  debug: {
    get: function() {
      return Lt;
    },
    set: function(e) {
      Sy(e);
    }
  },
  derive: vr,
  extend: ft,
  props: dr,
  override: hy,
  Events: $i,
  on: fn,
  liveQuery: KR,
  extendObservabilitySet: Bs,
  getByKeyPath: Kt,
  setByKeyPath: dt,
  delByKeyPath: mI,
  shallowClone: gy,
  deepClone: $n,
  getObjectDiff: Vu,
  cmp: pe,
  asap: my,
  minKey: Ml,
  addons: [],
  connections: ur,
  errnames: Ru,
  dependencies: hs,
  cache: Ln,
  semVer: pp,
  version: pp.split(".").map(function(e) {
    return parseInt(e);
  }).reduce(function(e, t, n) {
    return e + t / Math.pow(10, n * 2);
  })
}));
In.maxKey = Ei(In.dependencies.IDBKeyRange);
typeof dispatchEvent < "u" && typeof addEventListener < "u" && (fn(Fi, function(e) {
  if (!on) {
    var t = new CustomEvent(Nl, { detail: e });
    on = !0, dispatchEvent(t), on = !1;
  }
}), addEventListener(Nl, function(e) {
  var t = e.detail;
  on || Ku(t);
}));
function Ku(e) {
  var t = on;
  try {
    on = !0, fn.storagemutated.fire(e), qu(e, !0);
  } finally {
    on = t;
  }
}
var on = !1, tn, Fl = function() {
};
typeof BroadcastChannel < "u" && (Fl = function() {
  tn = new BroadcastChannel(Nl), tn.onmessage = function(e) {
    return e.data && Ku(e.data);
  };
}, Fl(), typeof tn.unref == "function" && tn.unref(), fn(Fi, function(e) {
  on || tn.postMessage(e);
}));
typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
  if (!Ai.disableBfCache && e.persisted) {
    Lt && console.debug("Dexie: handling persisted pagehide"), tn?.close();
    for (var t = 0, n = ur; t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
  }
}), addEventListener("pageshow", function(e) {
  !Ai.disableBfCache && e.persisted && (Lt && console.debug("Dexie: handling persisted pageshow"), Fl(), Ku({ all: new Xe(-1 / 0, [[]]) }));
}));
J.rejectionMapper = TI;
Sy(Lt);
var Os = new Ai("LittleWhiteBox_Assistant");
Os.version(1).stores({
  sessions: "id, updatedAt",
  messages: "[sessionId+order], sessionId"
});
var bo = Os.sessions, qr = Os.messages, Tn = "default", Yn = Promise.resolve();
function Oy(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function WR(e, t, n, r) {
  return {
    sessionId: Tn,
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
    providerPayload: Oy(e?.providerPayload)
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
    providerPayload: Oy(e?.providerPayload)
  };
}
function zR(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest);
}
function YR(e) {
  const { state: t, createRequestId: n, normalizeAttachments: r, normalizeThoughtBlocks: i, getActiveContextMessages: o } = e;
  function s() {
    const f = o().filter(zR).map((h, m) => WR(h, r, i, m));
    return {
      historySummary: String(t.historySummary || ""),
      sidebarCollapsed: t.sidebarCollapsed !== void 0 ? !!t.sidebarCollapsed : !0,
      messages: f
    };
  }
  async function u(f) {
    await Os.transaction("rw", bo, qr, async () => {
      await bo.put({
        id: Tn,
        updatedAt: Date.now(),
        historySummary: f.historySummary,
        sidebarCollapsed: f.sidebarCollapsed
      }), await qr.where("sessionId").equals(Tn).delete(), f.messages.length && await qr.bulkPut(f.messages);
    });
  }
  function c() {
    const f = s();
    return Yn = Yn.catch(() => {
    }).then(async () => {
      try {
        await u(f);
      } catch (h) {
        console.error("[Assistant] 保存会话失败:", h);
      }
    }), Yn;
  }
  function d() {
    return Yn = Yn.catch(() => {
    }).then(async () => {
      try {
        await qr.where("sessionId").equals(Tn).delete(), await bo.delete(Tn);
      } catch (f) {
        console.error("[Assistant] 清空会话失败:", f);
      }
    }), Yn;
  }
  async function p() {
    try {
      const f = await bo.get(Tn);
      if (!f) {
        t.messages = [], t.historySummary = "", t.archivedTurnCount = 0, t.sidebarCollapsed = !0;
        return;
      }
      const h = await qr.where("sessionId").equals(Tn).toArray();
      h.sort((m, g) => Number(m.order || 0) - Number(g.order || 0)), t.messages = h.map((m) => JR(m, {
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
    restoreSession: p
  };
}
function XR(e) {
  const { state: t, showToast: n, render: r, acceptedImageMimeTypes: i, maxImageAttachments: o, maxImageFileBytes: s } = e;
  function u(b) {
    return Array.isArray(b) ? b.map((_) => {
      if (!_ || typeof _ != "object" || _.kind !== "image") return null;
      const w = String(_.type || "").trim().toLowerCase(), E = typeof _.dataUrl == "string" ? _.dataUrl.trim() : "", T = E.startsWith("data:image/");
      return w && !i.includes(w) ? null : {
        kind: "image",
        name: String(_.name || "image").trim() || "image",
        type: w || "image/png",
        dataUrl: T ? E : "",
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
  function p(b = {}) {
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
          name: h(b),
          type: b.type || "image/png",
          size: Number(b.size) || 0,
          dataUrl: typeof E.result == "string" ? E.result : ""
        });
      }, E.readAsDataURL(b);
    });
  }
  function h(b) {
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
    const E = _.slice(0, w), T = [];
    let S = "";
    return E.forEach((k) => {
      if (!i.includes(k.type)) {
        S = "只支持 PNG、JPG、WEBP、GIF 图片";
        return;
      }
      if ((Number(k.size) || 0) > s) {
        S = `单张图片不能超过 ${Math.round(s / (1024 * 1024))}MB`;
        return;
      }
      T.push(k);
    }), {
      validFiles: T,
      rejectedReason: S,
      reachedLimit: !1,
      hadOverflow: _.length > w
    };
  }
  async function y(b) {
    const _ = Array.isArray(b) ? b.filter(Boolean) : [];
    if (!_.length) return !1;
    const { validFiles: w, rejectedReason: E, reachedLimit: T, hadOverflow: S } = g(_);
    if (!w.length)
      return n(E || "没有可添加的图片"), T || !!E;
    try {
      const k = await Promise.all(w.map((x) => f(x)));
      return t.draftAttachments = [...t.draftAttachments, ...k].slice(0, o), r(), (E || S) && n(E || `最多只能附 ${o} 张图片`), !0;
    } catch (k) {
      return n(String(k?.message || "读取图片失败")), !0;
    }
  }
  function v(b, _ = [], w = {}) {
    const E = u(_);
    b.replaceChildren(), b.style.display = E.length ? "" : "none", E.length && E.forEach((T, S) => {
      const k = document.createElement("div");
      if (k.className = w.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", T.dataUrl) {
        const N = document.createElement("img");
        N.className = "xb-assistant-attachment-image", N.src = T.dataUrl, N.alt = T.name, k.appendChild(N);
      } else {
        const N = document.createElement("div");
        N.className = "xb-assistant-attachment-placeholder", N.textContent = "图片", k.appendChild(N);
      }
      const x = document.createElement("div");
      if (x.className = "xb-assistant-attachment-name", x.textContent = T.name, k.appendChild(x), typeof w.onRemove == "function") {
        const N = document.createElement("button");
        N.type = "button", N.className = "xb-assistant-attachment-remove", N.textContent = "×", N.title = "移除图片", N.addEventListener("click", () => w.onRemove(S)), k.appendChild(N);
      }
      b.appendChild(k);
    });
  }
  return {
    normalizeAttachments: u,
    buildAttachmentSummary: c,
    buildTextWithAttachmentSummary: d,
    buildUserContentParts: p,
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
function Vr(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const i = document.createElement("option");
    i.value = r.value, i.textContent = r.label, e.appendChild(i);
  });
}
function Wu(e = []) {
  const t = [...new Set(e.filter(Boolean).map((i) => String(i).trim()).filter(Boolean))], n = QR.chat, r = t.filter((i) => {
    const o = i.toLowerCase();
    return !n.exclude.some((s) => o.includes(s));
  });
  return r.length ? r : t;
}
function Gs(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function xi(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function ZR(e) {
  const t = Gs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return xi([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return xi([`${t}/v1/models`, `${t}/models`]);
}
function jR(e) {
  const t = Gs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return xi([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return xi([`${t}/v1/models`, `${t}/models`]);
}
function eP(e, t) {
  const n = Gs(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return xi([
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
  return Wu((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function iP(e) {
  return Wu((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function oP(e) {
  return Wu((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
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
  const t = e.provider, n = Gs(e.baseUrl || ""), r = String(e.apiKey || "").trim();
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
  const { state: t, post: n, render: r, showToast: i, beginConfigSave: o, requestConfigFormSync: s, describeError: u, getPullState: c, setPullState: d, setProviderModels: p, getProviderModels: f, getProviderLabel: h, normalizePermissionMode: m, normalizeReasoningEffort: g, normalizeAssistantConfig: y, normalizePresetName: v, buildDefaultPreset: b, cloneDefaultModelConfigs: _, createRequestId: w, defaultPresetName: E, requestTimeoutMs: T, toolModeOptions: S, permissionModeOptions: k, reasoningEffortOptions: x } = e;
  function N(L, q) {
    const j = v(L || E), ge = q && typeof q == "object" ? q : b(), ve = ge.provider || "openai-compatible", we = (ge.modelConfigs || _())[ve] || {};
    return {
      currentPresetName: j,
      presetDraftName: j,
      provider: ve,
      baseUrl: String(we.baseUrl || ""),
      model: String(we.model || ""),
      apiKey: String(we.apiKey || ""),
      temperature: Number(we.temperature ?? 0.2),
      reasoningEnabled: !!we.reasoningEnabled,
      reasoningEffort: g(we.reasoningEffort),
      toolMode: we.toolMode || "native",
      permissionMode: m(ge.permissionMode)
    };
  }
  function $() {
    if (t.configDraft) return t.configDraft;
    const L = v(t.config?.currentPresetName || E);
    return t.configDraft = N(L, (t.config?.presets || {})[L] || b()), t.configDraft;
  }
  function G(L) {
    const q = $();
    return {
      ...q,
      currentPresetName: q.currentPresetName,
      presetDraftName: v(L.querySelector("#xb-assistant-preset-name")?.value),
      provider: L.querySelector("#xb-assistant-provider")?.value || q.provider || "openai-compatible",
      baseUrl: L.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: L.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: L.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Number(q.temperature ?? 0.2),
      reasoningEnabled: L.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: g(L.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: L.querySelector("#xb-assistant-tool-mode")?.value || q.toolMode || "native",
      permissionMode: m(L.querySelector("#xb-assistant-permission-mode")?.value || q.permissionMode)
    };
  }
  function K(L) {
    return t.configDraft = G(L), t.configDraft;
  }
  function z(L = $()) {
    return {
      baseUrl: String(L.baseUrl || ""),
      model: String(L.model || ""),
      apiKey: String(L.apiKey || ""),
      temperature: Number(L.temperature ?? 0.2),
      reasoningEnabled: !!L.reasoningEnabled,
      reasoningEffort: g(L.reasoningEffort),
      toolMode: L.provider === "openai-compatible" ? L.toolMode || "native" : void 0
    };
  }
  function A() {
    const L = $();
    return {
      provider: L.provider || "openai-compatible",
      baseUrl: L.baseUrl || "",
      model: L.model || "",
      apiKey: L.apiKey || "",
      temperature: Number(L.temperature ?? 0.2),
      maxTokens: null,
      timeoutMs: T,
      toolMode: L.toolMode || "native",
      reasoningEnabled: !!L.reasoningEnabled,
      reasoningEffort: g(L.reasoningEffort)
    };
  }
  function M(L) {
    $(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: v(L.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function O(L) {
    if (!t.config) return;
    const q = $(), j = q.provider || "openai-compatible", ge = f(j), ve = L.querySelector("#xb-assistant-tool-mode-wrap"), we = L.querySelector("#xb-assistant-tool-mode"), wt = L.querySelector("#xb-assistant-reasoning-enabled"), ht = L.querySelector("#xb-assistant-reasoning-effort-wrap"), Se = L.querySelector("#xb-assistant-reasoning-effort"), Te = L.querySelector("#xb-assistant-permission-mode"), Ie = L.querySelector("#xb-assistant-model-pulled"), Qe = L.querySelector("#xb-assistant-preset-select"), mt = L.querySelector("#xb-assistant-preset-name");
    Vr(Qe, (t.config.presetNames || []).map((hn) => ({
      value: hn,
      label: hn
    }))), Qe.value = q.currentPresetName || t.config.currentPresetName || E, mt.value = q.presetDraftName || q.currentPresetName || E, L.querySelector("#xb-assistant-provider").value = j, L.querySelector("#xb-assistant-base-url").value = q.baseUrl || "", L.querySelector("#xb-assistant-model").value = q.model || "", L.querySelector("#xb-assistant-api-key").value = q.apiKey || "", ve.style.display = j === "openai-compatible" ? "" : "none", Vr(we, S), we.value = q.toolMode || "native", Vr(Te, k), Te.value = m(q.permissionMode), Vr(Se, x), wt.checked = !!q.reasoningEnabled, Se.value = g(q.reasoningEffort), ht.style.display = wt.checked ? "" : "none", Vr(Ie, ge.map((hn) => ({
      value: hn,
      label: hn
    })), "手动填写");
    const Pt = L.querySelector("#xb-assistant-runtime"), Er = c(j);
    Pt.textContent = t.runtime ? `预设「${q.currentPresetName || E}」 · ${h(j)} · 已索引 ${t.runtime.indexedFileCount || 0} 个前端源码文件${Er.message ? ` · ${Er.message}` : ""}` : Er.message || "";
  }
  function W(L) {
    const q = K(L), j = v(q.presetDraftName), ge = v(q.currentPresetName || t.config?.currentPresetName || E), ve = (t.config?.presets || {})[ge] || b(), we = {
      ...ve,
      provider: q.provider,
      permissionMode: m(q.permissionMode),
      modelConfigs: {
        ...ve.modelConfigs || _(),
        [q.provider]: {
          ...(ve.modelConfigs || _())[q.provider] || {},
          ...z(q)
        }
      }
    }, wt = {
      ...t.config?.presets || {},
      [j]: we
    };
    t.config = y({
      ...t.config,
      currentPresetName: j,
      presets: wt
    }), t.configDraft = N(j, we), s();
    const ht = w("save-config");
    o(ht), n("xb-assistant:save-config", {
      requestId: ht,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || E,
      presets: t.config?.presets || {}
    });
  }
  function ne(L) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      i("至少要保留一套预设");
      return;
    }
    const q = v(t.configDraft?.currentPresetName || t.config?.currentPresetName || E), j = { ...t.config?.presets || {} };
    delete j[q];
    const ge = Object.keys(j)[0] || E, ve = j[ge] || b();
    t.config = y({
      ...t.config,
      currentPresetName: ge,
      presets: j
    }), t.configDraft = N(ge, ve), s();
    const we = w("delete-preset");
    o(we), n("xb-assistant:save-config", {
      requestId: we,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || E,
      presets: t.config?.presets || {}
    }), r();
  }
  function ie(L) {
    L.querySelector("#xb-assistant-provider").addEventListener("change", (q) => {
      const j = q.currentTarget.value;
      $(), t.configDraft = {
        ...t.configDraft,
        provider: j
      }, s(), r();
    }), L.querySelector("#xb-assistant-preset-select").addEventListener("change", (q) => {
      const j = v(q.currentTarget.value), ge = (t.config?.presets || {})[j] || b();
      t.config = y({
        ...t.config,
        currentPresetName: j
      }), t.configDraft = N(j, ge), s(), r();
    }), L.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
      M(L);
    }), L.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      K(L);
    }), L.querySelector("#xb-assistant-model").addEventListener("input", () => {
      K(L);
    }), L.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      K(L);
    }), L.querySelector("#xb-assistant-model-pulled").addEventListener("change", (q) => {
      const j = q.currentTarget.value;
      j && (L.querySelector("#xb-assistant-model").value = j, K(L));
    }), L.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
      const q = L.querySelector("#xb-assistant-api-key");
      q.type = q.type === "password" ? "text" : "password", r();
    }), L.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      K(L), s(), r();
    }), L.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      K(L);
    }), L.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      K(L);
    }), L.querySelector("#xb-assistant-permission-mode").addEventListener("change", () => {
      K(L);
    }), L.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      K(L), s();
      const q = A();
      d(q.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), r();
      try {
        const j = await sP(q);
        p(q.provider, j), d(q.provider, {
          status: "success",
          message: `已拉取 ${j.length} 个模型`
        });
      } catch (j) {
        p(q.provider, []), d(q.provider, {
          status: "error",
          message: u(j)
        });
      }
      s(), r();
    }), L.querySelector("#xb-assistant-save").addEventListener("click", () => {
      W(L);
    }), L.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      ne(L);
    });
  }
  return {
    getActiveProviderConfig: A,
    syncConfigToForm: O,
    bindSettingsPanelEvents: ie
  };
}
function lP(e) {
  const { state: t, toolNames: n, formatToolResultDisplay: r, normalizeThoughtBlocks: i, normalizeAttachments: o, renderAttachmentGallery: s } = e;
  let u = !1, c = null;
  const d = /* @__PURE__ */ new Set();
  function p(A) {
    return String(A || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function f(A) {
    const M = String(A || "").trim();
    if (!M) return "";
    try {
      const O = globalThis.parent?.showdown || globalThis.showdown, W = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
      if (O?.Converter && W?.sanitize) {
        const ne = new O.Converter({
          simpleLineBreaks: !0,
          strikethrough: !0,
          tables: !0,
          tasklists: !0,
          ghCodeBlocks: !0,
          simplifiedAutoLink: !0,
          openLinksInNewWindow: !0,
          emoji: !1
        }).makeHtml(M);
        return W.sanitize(ne, {
          USE_PROFILES: { html: !0 },
          FORBID_TAGS: ["style", "script"]
        });
      }
    } catch {
    }
    return p(M).replace(/\n/g, "<br>");
  }
  async function h(A) {
    const M = String(A || "");
    if (!M) return !1;
    try {
      if (navigator.clipboard?.writeText)
        return await navigator.clipboard.writeText(M), !0;
    } catch {
    }
    try {
      const O = document.createElement("textarea");
      O.value = M, O.setAttribute("readonly", "readonly"), O.style.position = "fixed", O.style.opacity = "0", O.style.pointerEvents = "none", document.body.appendChild(O), O.select(), O.setSelectionRange(0, O.value.length);
      const W = document.execCommand("copy");
      return O.remove(), W;
    } catch {
      return !1;
    }
  }
  function m(A) {
    Array.from(A.body.querySelectorAll("pre")).forEach((M) => {
      if (M.closest(".xb-assistant-codeblock")) return;
      const O = A.createElement("div");
      O.className = "xb-assistant-codeblock";
      const W = A.createElement("button");
      W.type = "button", W.className = "xb-assistant-code-copy", W.textContent = "⧉", W.title = "复制代码", W.setAttribute("aria-label", "复制代码"), W.addEventListener("click", async () => {
        const ne = await h(M.querySelector("code")?.textContent || M.textContent || "");
        W.textContent = ne ? "✓" : "!", W.title = ne ? "已复制" : "复制失败", setTimeout(() => {
          W.textContent = "⧉", W.title = "复制代码";
        }, 1200);
      }), M.parentNode?.insertBefore(O, M), O.append(W, M);
    });
  }
  function g(A) {
    const M = new DOMParser().parseFromString(`<body>${String(A || "")}</body>`, "text/html");
    m(M);
    const O = document.createDocumentFragment();
    for (; M.body.firstChild; ) O.appendChild(M.body.firstChild);
    return O;
  }
  function y(A) {
    return JSON.stringify({
      role: A.role,
      content: String(A.content || ""),
      toolCallId: String(A.toolCallId || ""),
      toolName: String(A.toolName || ""),
      toolCalls: Array.isArray(A.toolCalls) ? A.toolCalls.map((M) => ({
        id: String(M.id || ""),
        name: String(M.name || ""),
        arguments: String(M.arguments || "")
      })) : [],
      thoughts: i(A.thoughts),
      attachments: o(A.attachments).map((M) => ({
        kind: M.kind,
        name: M.name,
        type: M.type,
        size: M.size
      })),
      streaming: !!A.streaming
    });
  }
  function v(A) {
    return A?.role === "assistant" && Array.isArray(A.toolCalls) && A.toolCalls.length > 0;
  }
  function b(A, M = 0) {
    const O = Array.isArray(A?.toolCalls) ? A.toolCalls.map((W) => String(W?.id || "").trim()).filter(Boolean) : [];
    return O.length ? `tool-batch:${O.join("|")}` : `tool-batch:fallback:${M}:${y(A)}`;
  }
  function _(A, M, O) {
    const W = document.createElement("details"), ne = b(A, O);
    W.className = "xb-assistant-tool-batch", W.dataset.toolBatchKey = ne, d.has(ne) && (W.open = !0), W.addEventListener("toggle", () => {
      W.open ? d.add(ne) : d.delete(ne);
    });
    const ie = document.createElement("summary");
    ie.className = "xb-assistant-tool-batch-summary", ie.textContent = `小白助手 · 已发起 ${Array.isArray(A.toolCalls) ? A.toolCalls.length : 0} 个工具调用`, W.appendChild(ie);
    const L = document.createElement("div");
    L.className = "xb-assistant-tool-batch-body";
    const q = String(A.content || "").trim();
    if (q) {
      const j = document.createElement("div");
      j.className = "xb-assistant-tool-batch-note xb-assistant-markdown", j.appendChild(g(f(q))), L.appendChild(j);
    }
    return M.forEach((j) => {
      const ge = E(j);
      ge.dataset.renderSignature = y(j), L.appendChild(ge);
    }), W.appendChild(L), W;
  }
  function w(A) {
    if (!A || !A.kind) return null;
    const M = document.createElement("div");
    M.className = "xb-assistant-approval";
    const O = document.createElement("div");
    O.className = "xb-assistant-approval-title", O.textContent = A.kind === "generate-skill" ? "待确认的技能沉淀" : "待确认的斜杠命令";
    const W = document.createElement("pre");
    W.className = "xb-assistant-content xb-assistant-approval-command", W.textContent = A.kind === "generate-skill" ? [
      A.title ? `标题：${A.title}` : "",
      A.reason ? `原因：${A.reason}` : "",
      A.sourceSummary ? `过程摘要：${A.sourceSummary}` : ""
    ].filter(Boolean).join(`

`) : A.command || "";
    const ne = document.createElement("div");
    if (ne.className = "xb-assistant-approval-note", ne.textContent = A.kind === "generate-skill" ? A.status === "approved" ? "已同意，接下来会生成 skill 草稿并继续保存流程。" : A.status === "declined" ? "已拒绝，本次不会生成 skill。" : A.status === "cancelled" ? "本轮请求已终止，这次 skill 沉淀未继续。" : "这会把刚完成的过程沉淀成可复用 skill；点“是”后才会进入生成。" : A.status === "approved" ? "已同意，命令已进入执行流程。" : A.status === "declined" ? "已拒绝，本次不会执行这条命令。" : A.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "当前权限模式要求先确认；点“是”后才会真正执行这条斜杠命令。", M.append(O, W, ne), A.status === "pending") {
      const ie = document.createElement("div");
      ie.className = "xb-assistant-approval-actions";
      const L = document.createElement("button");
      L.type = "button", L.className = "xb-assistant-approval-button", L.dataset.approvalId = A.id, L.dataset.approvalDecision = "approve", L.textContent = A.kind === "generate-skill" ? "是，生成" : "是，执行";
      const q = document.createElement("button");
      q.type = "button", q.className = "xb-assistant-approval-button secondary", q.dataset.approvalId = A.id, q.dataset.approvalDecision = "decline", q.textContent = "否，跳过", ie.append(L, q), M.appendChild(ie);
    }
    return M;
  }
  function E(A, M = -1) {
    const O = document.createElement("div");
    O.className = `xb-assistant-bubble role-${A.role}`, Number.isInteger(M) && M >= 0 && (O.dataset.messageIndex = String(M));
    const W = String(A.content || "").trim(), ne = A.role === "assistant" && Array.isArray(A.toolCalls) && A.toolCalls.length > 0, ie = ne && !W, L = A.role === "assistant" && !ne && !!W, q = L && t.editingMessageIndex === M;
    ie && O.classList.add("is-tool-call");
    const j = document.createElement("div");
    j.className = "xb-assistant-meta-row";
    const ge = document.createElement("div");
    if (ge.className = "xb-assistant-meta", ge.textContent = A.role === "user" ? "你" : A.role === "assistant" ? Array.isArray(A.toolCalls) && A.toolCalls.length ? `小白助手 · 已发起 ${A.toolCalls.length} 个工具调用` : `小白助手${A.streaming ? " · 正在生成" : ""}${Array.isArray(A.thoughts) && A.thoughts.length ? ` · 含 ${A.thoughts.length} 段思考` : ""}` : `工具结果${A.toolName ? ` · ${A.toolName}` : ""}`, j.appendChild(ge), L) {
      const Se = document.createElement("div");
      Se.className = "xb-assistant-message-actions", (q ? [{
        action: "save-edit",
        label: "✓",
        title: "保存这条消息的修改"
      }, {
        action: "cancel-edit",
        label: "✕",
        title: "取消本次修改"
      }] : [
        {
          action: "copy",
          label: "⧉",
          title: "复制整条消息"
        },
        {
          action: "edit",
          label: "✎",
          title: "编辑这条消息"
        },
        {
          action: "reroll",
          label: "↻",
          title: "从这里重新生成后续回复"
        },
        {
          action: "delete",
          label: "🗑",
          title: "删除这条消息"
        }
      ]).forEach((Te) => {
        const Ie = document.createElement("button");
        Ie.type = "button", Ie.className = "xb-assistant-message-action", Ie.dataset.messageAction = Te.action, Ie.dataset.messageIndex = String(M), Ie.textContent = Te.label, Ie.title = Te.title, Ie.setAttribute("aria-label", Te.title), t.isBusy && Te.action !== "cancel-edit" && (Ie.disabled = !0), Se.appendChild(Ie);
      }), j.appendChild(Se);
    }
    if (O.appendChild(j), A.role === "tool") {
      const Se = r(A), Te = document.createElement("pre");
      if (Te.className = "xb-assistant-content tool-summary", Te.textContent = Se.summary || "工具已返回结果。", O.append(Te), Se.details) {
        const Ie = document.createElement("details");
        Ie.className = "xb-assistant-tool-details";
        const Qe = document.createElement("summary");
        Qe.textContent = A.toolName === n.READ ? "展开文件内容" : "展开详细结果";
        const mt = document.createElement("pre");
        mt.className = "xb-assistant-content tool-detail", mt.textContent = Se.details, Ie.append(Qe, mt), O.appendChild(Ie);
      }
      return O;
    }
    const ve = document.createElement("div");
    ve.className = "xb-assistant-content xb-assistant-markdown";
    const we = A.role === "assistant" && !ne ? A.streaming ? "思考中…" : "我先查一下相关代码。" : "", wt = W || String(we || "").trim();
    let ht = null;
    if (A.role === "assistant" && Array.isArray(A.thoughts) && A.thoughts.length) {
      const Se = document.createElement("details");
      Se.className = "xb-assistant-thought-details";
      const Te = document.createElement("summary");
      Te.textContent = A.thoughts.length > 1 ? `展开思考块（${A.thoughts.length} 段）` : "展开思考块", Se.appendChild(Te), A.thoughts.forEach((Ie) => {
        const Qe = document.createElement("div");
        Qe.className = "xb-assistant-thought-block";
        const mt = document.createElement("div");
        mt.className = "xb-assistant-thought-label", mt.textContent = Ie.label;
        const Pt = document.createElement("pre");
        Pt.className = "xb-assistant-content xb-assistant-thought-content", Pt.textContent = Ie.text, Qe.append(mt, Pt), Se.appendChild(Qe);
      }), ht = Se;
    }
    if (q) {
      const Se = document.createElement("div");
      Se.className = "xb-assistant-message-editor-wrap";
      const Te = document.createElement("textarea");
      Te.className = "xb-assistant-message-editor", Te.value = W, Te.rows = Math.min(Math.max(W.split(`
`).length, 4), 14), Te.setAttribute("aria-label", "编辑助手消息"), Se.appendChild(Te), O.appendChild(Se);
    } else wt ? (ht && O.appendChild(ht), ve.appendChild(g(f(wt))), O.appendChild(ve)) : ht && O.appendChild(ht);
    if (Array.isArray(A.attachments) && A.attachments.length) {
      const Se = document.createElement("div");
      Se.className = "xb-assistant-attachment-gallery", s(Se, A.attachments, { compact: !0 }), O.appendChild(Se);
    }
    return O;
  }
  function T(A) {
    if (!t.messages.length) {
      A.innerHTML = "";
      const M = document.createElement("div");
      M.className = "xb-assistant-empty", M.innerHTML = "<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住；同时我会在 98k 上下文附近自动总结，尽量保持长期记忆。</p><p>今天有什么我可以帮你的吗？</p>", A.appendChild(M);
      return;
    }
    A.innerHTML = "";
    for (let M = 0; M < t.messages.length; M += 1) {
      const O = t.messages[M];
      if (v(O)) {
        const ne = [];
        let ie = M + 1;
        for (; ie < t.messages.length && t.messages[ie]?.role === "tool"; )
          ne.push(t.messages[ie]), ie += 1;
        const L = _(O, ne, M);
        L.dataset.renderSignature = y(O), A.appendChild(L), M = ie - 1;
        continue;
      }
      const W = E(O, M);
      W.dataset.renderSignature = y(O), A.appendChild(W);
    }
    t.autoScroll && (A.scrollTop = A.scrollHeight);
  }
  function S(A) {
    if (!A) return;
    A.innerHTML = "";
    const M = w(t.pendingApproval);
    M && A.appendChild(M);
  }
  function k(A) {
    if (!A) return;
    const M = () => {
      A.scrollTop = A.scrollHeight;
    };
    M(), requestAnimationFrame(() => {
      M(), requestAnimationFrame(M);
    });
  }
  function x(A) {
    A && A.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  function N(A) {
    const M = A.querySelector("#xb-assistant-chat"), O = A.querySelector("#xb-assistant-scroll-top"), W = A.querySelector("#xb-assistant-scroll-bottom");
    if (!M || !O || !W) return;
    const ne = M.scrollTop, ie = M.scrollHeight, L = M.clientHeight, q = 80;
    O.classList.toggle("visible", ne > q), W.classList.toggle("visible", ie - ne - L > q);
  }
  function $(A) {
    A.querySelector("#xb-assistant-scroll-helpers")?.classList.add("active");
  }
  function G(A) {
    A.querySelector("#xb-assistant-scroll-helpers")?.classList.remove("active");
  }
  function K(A) {
    c && clearTimeout(c), c = setTimeout(() => {
      G(A), c = null;
    }, 1500);
  }
  function z(A) {
    u || (u = !0, requestAnimationFrame(() => {
      N(A), $(A), K(A), u = !1;
    }));
  }
  return {
    renderMessages: T,
    renderApprovalPanel: S,
    scrollChatToBottom: k,
    scrollChatToTop: x,
    updateChatScrollButtonsVisibility: N,
    handleAssistantChatScroll: z,
    copyText: h
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
`), Gy = [
  "你是 SillyTavern 中 LittleWhiteBox（中文一般称“小白X”）插件的内置技术支持助手，当前正在这个界面中为用户提供帮助。",
  "",
  "你的职责是：",
  "- 解答 LittleWhiteBox 和 SillyTavern 的代码、设置、模块行为、报错排查与使用问题。",
  "- 辅助用户写卡、写插件、写脚本、整理设定、构思剧情或基于当前酒馆状态给出操作建议。",
  "- 当问题涉及具体实现、文件路径、设置逻辑、错误原因或当前实例状态时，优先使用工具查证后再回答。",
  "- 如果查实属于小白X自身功能 BUG、设计缺陷或值得做的必要优化，可以建议用户前往 LittleWhiteBox 的 GitHub Issues 页面提交 issue：https://github.com/RT15548/LittleWhiteBox/issues 。",
  "",
  "你的能力范围：",
  "- 默认只读代码与资料；如果需要写入，只能写身份设定、工作记录或技能文件，不允许改代码。",
  "- 可读取已索引的公开前端文件（LittleWhiteBox 和 SillyTavern public/scripts/*）；**这些文件是构建时的静态快照，不是用户当前实例的实时状态**。",
  "- 可执行斜杠命令工具（RunSlashCommand）；**该工具直接作用于用户当前真实酒馆实例，可用来读取或操作实例中的现有对象与状态，例如角色卡、世界书、聊天、预设、扩展、当前模型与接口等，但前提是对应能力确实存在于 SillyTavern 已有斜杠命令中**。",
  "- 可读写身份设定（user/files/LittleWhiteBox_Assistant_Identity.md）；需要调整你的长期身份、习惯、语气或工作方式时，可直接读取或写入这份文件。",
  "- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，用它保存长期排查结论、你的经验教训、经常的犯错、和用户指定要你记住的事情。",
  "- 可读取技能目录（user/files/LittleWhiteBox_Assistant_Skills.json）和按需读取某个 skill 正文；默认只看技能目录摘要，不要把所有 skill 正文一次性读进上下文。",
  "- 可新建、更新、删除 skill；生成新 skill 时遵循工具返回的保存流程。",
  "- 不能访问后端、数据库、未索引文件。",
  "",
  "**重要区分 - 静态快照 vs 动态实例**：",
  "- LS/Glob/Grep/Read 工具读取的是**静态代码快照**（构建时索引），用于查看源码实现、配置逻辑、模块结构。",
  "- RunSlashCommand 作用的是**动态运行实例**（用户当前打开的酒馆），用于获取实时状态、读取实例数据，或执行实例内已有操作。",
  "- 先判断问题属于动态实例还是静态代码：如果用户要你查看或操作真实实例里的东西，例如修改世界书、创建角色卡、检查当前扩展状态、读取聊天现场状态，就优先考虑 RunSlashCommand；如果用户问源码入口、设置保存逻辑、UI 布局、模块职责，就优先先看 project-structure.md 或 LS/Glob/Grep/Read。",
  "- 静态代码排查先做低成本定位：优先结合目录参考、LS、Glob、Grep 缩小范围，再尽量一次性读取足够的连续内容，避免太细碎的多次分段读取。若证据还不够，就继续查到足以支撑结论为止。",
  "- 索引快照可能不包含用户最新修改的代码或配置文件；如需确认用户当前实例的实际状态，必须用 RunSlashCommand。",
  "",
  uP,
  "",
  ...YC,
  "",
  "回答要求：",
  "- 具体、可核对，必要时引用文件路径。",
  "- 工具调用要讲效率：避免“试探性”工具调用；能先低成本定位就不要直接反复精读，但也不要因为省调用而影响准确性。",
  "- 使用 skill 时，先看目录，再按需读取具体 skill；不要为了“保险”把所有 skill 全读一遍。",
  "- 只有在完成长流程创作、经过多次试错才得到稳定方案、或用户明确要求沉淀经验时，才建议生成 skill；一次性小问答、小修补、小报错不要生成 skill。",
  "- 更新或删除已有 skill 只在用户明确要求时执行；不要因为你觉得“更好”就擅自覆盖、禁用或删除技能。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), cP = "[历史摘要]", dP = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`);
function fP(e = "default") {
  return e === "full" ? [
    "当前权限模式：完全权限。",
    "- RunSlashCommand 会直接执行，不会进入额外系统审批流程。",
    "- 请务必不要辜负用户给你的完全权限信任，在执行前想清楚命令作用及后果；涉及不可逆的数据修改操作时，要先明确获得用户同意。"
  ].join(`
`) : [
    "当前权限模式：默认权限。",
    "- RunSlashCommand 不会直接执行，会进入额外系统审批流程。",
    "- 请想想为何用户不给你完全权限，并为之努力吧！证明你自己的靠谱，在执行前想清楚命令作用及后果；涉及不可逆的数据修改操作时，要先明确获得用户同意。"
  ].join(`
`);
}
var pP = "xb-assistant-app", qy = "xb-assistant-root", Vy = 18e4, hP = 64, Ju = 128e3, mP = 98e3, gP = 2, yP = 1, ms = 3, vP = 4 * 1024 * 1024, _P = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], bP = 2600, wP = 1800, SP = 4200, EP = 3e3, TP = 1800, AP = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], Hy = [
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
], xP = [
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
], CP = [{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}], D = {
  config: null,
  configDraft: null,
  runtime: null,
  pendingApproval: null,
  messages: [],
  historySummary: "",
  archivedTurnCount: 0,
  contextStats: {
    usedTokens: 0,
    budgetTokens: Ju,
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
  editingMessageIndex: -1,
  configSave: {
    status: "idle",
    requestId: "",
    error: ""
  }
}, Bl = /* @__PURE__ */ new Map(), Ky = /* @__PURE__ */ new Map(), wo = null, Hr = null, an = null, Nn = null;
function Bi(e, t = {}) {
  parent.postMessage({
    source: pP,
    type: e,
    payload: t
  }, window.location.origin);
}
function qs(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function Wy(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
var Vs = null;
function An() {
  return Vs?.persistSession();
}
function IP() {
  return Vs?.clearSession();
}
function RP() {
  return Vs?.restoreSession();
}
function PP() {
  if (Hr !== null) return Hr;
  try {
    Hr = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    Hr = {};
  }
  return Hr;
}
function MP() {
  return ["mobile", "tablet"].includes(PP()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function NP(e, t) {
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
function kP(e) {
  return Hy.some((t) => t.value === e) ? e : "medium";
}
function zu(e) {
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
function et(e) {
  if (D.toast = String(e || "").trim(), wo && clearTimeout(wo), !D.toast) {
    be();
    return;
  }
  const t = Math.max(wP, Math.min(SP, bP + D.toast.length * 18));
  wo = setTimeout(() => {
    wo = null, D.toast = "", be();
  }, t), be();
}
function DP() {
  an && (clearTimeout(an), an = null), Nn && (clearTimeout(Nn), Nn = null);
}
function Jy(e = TP) {
  Nn && clearTimeout(Nn), Nn = setTimeout(() => {
    Nn = null, D.configSave = {
      status: "idle",
      requestId: "",
      error: ""
    }, be();
  }, e);
}
function LP(e) {
  DP(), D.configSave = {
    status: "saving",
    requestId: e,
    error: ""
  }, an = setTimeout(() => {
    an = null, !(D.configSave.requestId !== e || D.configSave.status !== "saving") && (D.configSave = {
      status: "error",
      requestId: e,
      error: "保存超时，请重试"
    }, be(), Jy());
  }, EP), be();
}
function Ap(e, { ok: t, error: n = "" } = {}) {
  e && D.configSave.requestId && D.configSave.requestId !== e || (an && (clearTimeout(an), an = null), D.configSave = {
    status: t ? "success" : "error",
    requestId: e || D.configSave.requestId || "",
    error: t ? "" : String(n || "保存失败")
  }, be(), Jy());
}
function zy() {
  D.configFormSyncPending = !0;
}
function Yu(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function $P(e) {
  return xP.find((t) => t.value === e)?.label || e;
}
function UP(e) {
  return D.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function FP(e, t) {
  D.pullStateByProvider = {
    ...D.pullStateByProvider,
    [e]: t
  };
}
function BP(e, t) {
  D.modelOptionsByProvider = {
    ...D.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function OP(e) {
  return Array.isArray(D.modelOptionsByProvider[e]) ? D.modelOptionsByProvider[e] : [];
}
var { normalizeAttachments: Hs, buildTextWithAttachmentSummary: GP, buildUserContentParts: qP, appendDraftImageFiles: xp, renderAttachmentGallery: Yy } = XR({
  state: D,
  showToast: et,
  render: be,
  acceptedImageMimeTypes: _P,
  maxImageAttachments: ms,
  maxImageFileBytes: vP
});
function Xu(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : Yu(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
var { getActiveProviderConfig: Xy, syncConfigToForm: VP, bindSettingsPanelEvents: HP } = aP({
  state: D,
  post: Bi,
  render: be,
  showToast: et,
  beginConfigSave: LP,
  requestConfigFormSync: zy,
  createRequestId: qs,
  describeError: Xu,
  getPullState: UP,
  setPullState: FP,
  setProviderModels: BP,
  getProviderModels: OP,
  getProviderLabel: $P,
  normalizePermissionMode: Ds,
  normalizeReasoningEffort: kP,
  normalizeAssistantConfig: dy,
  normalizePresetName: _i,
  buildDefaultPreset: Au,
  cloneDefaultModelConfigs: Tu,
  defaultPresetName: uy,
  requestTimeoutMs: Vy,
  toolModeOptions: AP,
  permissionModeOptions: CP,
  reasoningEffortOptions: Hy
}), { renderMessages: KP, renderApprovalPanel: WP, scrollChatToBottom: Qy, scrollChatToTop: JP, updateChatScrollButtonsVisibility: Zy, handleAssistantChatScroll: zP, copyText: YP } = lP({
  state: D,
  toolNames: ye,
  formatToolResultDisplay: ay,
  normalizeThoughtBlocks: zu,
  normalizeAttachments: Hs,
  renderAttachmentGallery: Yy
});
function XP() {
  const e = Xy();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new ab(e);
    case "anthropic":
      return new aw(e);
    case "google":
      return new zC(e);
    default:
      return new X_(e);
  }
}
function QP() {
  const e = String(D.runtime?.identityContent || "").trim(), t = String(D.runtime?.skillsPromptSummary || "").trim();
  return [
    Gy,
    fP(D.config?.permissionMode),
    t,
    e
  ].filter(Boolean).join(`

`);
}
var { resetCompactionState: ZP, buildContextMeterLabel: jP, updateContextStats: eM, pushMessage: Ol, cancelActiveRun: tM, toProviderMessages: nM, getActiveContextMessages: jy, runAssistantLoop: rM } = tI({
  state: D,
  pendingToolCalls: Bl,
  pendingApprovals: Ky,
  persistSession: An,
  render: be,
  showToast: et,
  post: Bi,
  createRequestId: qs,
  safeJsonParse: Wy,
  describeError: Xu,
  formatToolResultDisplay: ay,
  buildTextWithAttachmentSummary: GP,
  buildUserContentParts: qP,
  normalizeAttachments: Hs,
  normalizeThoughtBlocks: zu,
  normalizeSlashCommand: xu,
  normalizeSlashSkillTrigger: lI,
  shouldRequireSlashCommandApproval: (e) => uI(e, D.config?.permissionMode),
  buildSlashApprovalResult: NP,
  isAbortError: Yu,
  createAdapter: XP,
  getActiveProviderConfig: Xy,
  getSystemPrompt: QP,
  SYSTEM_PROMPT: Gy,
  SUMMARY_SYSTEM_PROMPT: dP,
  HISTORY_SUMMARY_PREFIX: cP,
  MAX_CONTEXT_TOKENS: Ju,
  SUMMARY_TRIGGER_TOKENS: mP,
  DEFAULT_PRESERVED_TURNS: gP,
  MIN_PRESERVED_TURNS: yP,
  MAX_TOOL_ROUNDS: hP,
  REQUEST_TIMEOUT_MS: Vy,
  TOOL_DEFINITIONS: XC,
  TOOL_NAMES: ye
});
Vs = YR({
  state: D,
  safeJsonParse: Wy,
  createRequestId: qs,
  normalizeAttachments: Hs,
  normalizeThoughtBlocks: zu,
  getActiveContextMessages: jy
});
function Pa(e) {
  D.config = dy(e || {}), D.configDraft = null, zy(), be();
}
function Cp() {
  return {
    id: qs("run"),
    controller: new AbortController(),
    toolRequestIds: /* @__PURE__ */ new Set(),
    cancelNotice: "",
    lightBrakeMessage: "",
    lastLightBrakeKey: "",
    toolErrorStreakKey: "",
    toolErrorStreakCount: 0
  };
}
async function Ip(e) {
  D.activeRun = e, D.isBusy = !0, D.currentRound = 0, D.progressLabel = "生成中", D.autoScroll = !0, be();
  try {
    await rM(e);
  } catch (t) {
    Yu(t) ? e.cancelNotice && Ol({
      role: "assistant",
      content: e.cancelNotice
    }) : Ol({
      role: "assistant",
      content: Xu(t)
    });
  } finally {
    D.activeRun?.id === e.id && (D.activeRun = null), D.isBusy = !1, D.currentRound = 0, D.progressLabel = "", be();
  }
}
function iM(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const n = e[t];
    if (!n?.approvalRequest)
      return n || null;
  }
  return null;
}
function oM(e) {
  return !!(e && e.role === "assistant" && !e.streaming && !(Array.isArray(e.toolCalls) && e.toolCalls.length) && String(e.content || "").trim());
}
function sM(e) {
  for (let t = e; t >= 0; t -= 1) {
    const n = D.messages[t];
    if (!n?.approvalRequest && n?.role === "user")
      return t;
  }
  return -1;
}
function aM(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((r) => {
    n.appendChild(document.importNode(r, !0));
  }), n;
}
function lM(e) {
  const t = `
        <div class="xb-assistant-shell ${D.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${D.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${D.sidebarCollapsed ? "false" : "true"}" aria-label="${D.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${D.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${D.sidebarCollapsed ? "hidden" : ""}>
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
                    <label>
                        <span>斜杠命令权限</span>
                        <select id="xb-assistant-permission-mode"></select>
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
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" ${D.sidebarCollapsed ? "hidden" : ""}></div>
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
  e.replaceChildren(aM(t));
}
function ev() {
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
        #${qy} { width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; }
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
            min-width: 0;
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
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
            width: calc(100% - 20px);
            max-width: calc(100% - 20px);
            min-width: 0;
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
        .xb-assistant-meta-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 6px;
        }
        .xb-assistant-meta {
            flex: 1 1 auto;
            min-width: 0;
            font-size: 12px;
            opacity: 0.78;
        }
        .xb-assistant-bubble.is-tool-call .xb-assistant-meta { margin-bottom: 0; }
        .xb-assistant-message-actions {
            display: inline-flex;
            flex: 0 0 auto;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 6px;
        }
        .xb-assistant-message-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 4px 9px;
            border: 1px solid rgba(27, 55, 88, 0.12);
            border-radius: 999px;
            background: rgba(247, 250, 253, 0.96);
            color: #304862;
            font-size: 12px;
            line-height: 1.1;
            cursor: pointer;
            transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-message-action:hover:not(:disabled) {
            background: rgba(230, 238, 247, 0.98);
            border-color: rgba(27, 55, 88, 0.22);
            color: #203249;
        }
        .xb-assistant-message-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .xb-assistant-message-editor-wrap {
            min-width: 0;
        }
        .xb-assistant-message-editor {
            width: 100%;
            min-height: 108px;
            box-sizing: border-box;
            resize: vertical;
            padding: 12px 14px;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 14px;
            background: rgba(252, 253, 255, 0.96);
            color: #203249;
            font: inherit;
            line-height: 1.7;
        }
        .xb-assistant-message-editor:focus {
            outline: none;
            border-color: rgba(40, 87, 134, 0.48);
            box-shadow: 0 0 0 3px rgba(40, 87, 134, 0.12);
        }
        .xb-assistant-content {
            margin: 0;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            white-space: pre-wrap;
            word-break: break-word;
            font: inherit;
        }
        .xb-assistant-markdown {
            min-width: 0;
            max-width: 100%;
            white-space: normal;
            line-height: 1.7;
            overflow-wrap: anywhere;
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
            overflow-x: hidden;
            overflow-y: visible;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.06);
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-all;
        }
        .xb-assistant-codeblock {
            position: relative;
            min-width: 0;
            max-width: 100%;
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
        .xb-assistant-tool-batch {
            width: min(100%, calc(100% - 20px));
            margin-left: 0;
            margin-right: auto;
            border-radius: 18px;
            background: rgba(244, 248, 252, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.08);
            box-shadow: 0 12px 28px rgba(17, 31, 51, 0.06);
            padding: 10px 14px;
            box-sizing: border-box;
        }
        .xb-assistant-tool-batch + .xb-assistant-tool-batch {
            margin-top: 12px;
        }
        .xb-assistant-tool-batch-summary {
            cursor: pointer;
            color: #56677e;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
            list-style: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            user-select: none;
        }
        .xb-assistant-tool-batch-summary::marker,
        .xb-assistant-tool-batch-summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-tool-batch-summary::after {
            content: '>';
            color: #36567b;
            font-size: 14px;
            transition: transform 0.16s ease;
            transform-origin: center;
        }
        .xb-assistant-tool-batch[open] .xb-assistant-tool-batch-summary::after {
            transform: rotate(90deg);
        }
        .xb-assistant-tool-batch-body {
            display: grid;
            gap: 10px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-tool-batch-note {
            padding: 12px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(27, 55, 88, 0.08);
            line-height: 1.65;
            color: #1e2f44;
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
function be() {
  const e = document.getElementById(qy);
  if (!e) return;
  e.firstChild || (lM(e), uM(e)), D.configFormSyncPending && (VP(e), D.configFormSyncPending = !1), eM(nM(jy()));
  const t = e.querySelector("#xb-assistant-chat"), n = e.querySelector("#xb-assistant-approval-slot");
  KP(t), WP(n), D.autoScroll && Qy(t), Zy(e);
  const r = e.querySelector("#xb-assistant-send");
  r.disabled = !1, r.classList.toggle("is-busy", D.isBusy), r.textContent = D.isBusy ? "终止" : "发送";
  const i = e.querySelector("#xb-assistant-add-image");
  i.disabled = D.isBusy || D.draftAttachments.length >= ms, i.textContent = D.draftAttachments.length ? `发图（${D.draftAttachments.length}/${ms}）` : "发图";
  const o = e.querySelector("#xb-assistant-clear");
  o.disabled = D.isBusy || !D.messages.length, o.textContent = window.matchMedia("(max-width: 900px)").matches ? "清空" : "清空对话";
  const s = e.querySelector("#xb-assistant-delete-preset");
  s.disabled = D.isBusy || (D.config?.presetNames || []).length <= 1;
  const u = e.querySelector("#xb-assistant-save"), c = D.configSave.status;
  u.classList.add("xb-assistant-save-button"), u.classList.toggle("is-saving", c === "saving"), u.classList.toggle("is-success", c === "success"), u.classList.toggle("is-error", c === "error"), u.disabled = D.isBusy || c === "saving", c === "saving" ? (u.innerHTML = '<span class="xb-assistant-save-spinner" aria-hidden="true"></span>保存中...', u.title = "正在保存配置") : c === "success" ? (u.textContent = "已保存", u.title = "配置已保存") : c === "error" ? (u.textContent = "保存失败", u.title = D.configSave.error || "保存失败") : (u.textContent = "保存配置", u.title = "保存配置");
  const d = e.querySelector("#xb-assistant-pull-models");
  d.disabled = D.isBusy;
  const p = e.querySelector("#xb-assistant-status");
  p.textContent = D.progressLabel || "就绪", p.classList.toggle("busy", D.isBusy);
  const f = e.querySelector("#xb-assistant-context-meter");
  f.textContent = jP(), f.classList.toggle("summary-active", !!D.contextStats.summaryActive);
  const h = `${Math.round(Ju / 1e3)}k`;
  f.title = D.contextStats.summaryActive ? `当前实际送模上下文 / ${h}（已压缩较早历史）` : `当前实际送模上下文 / ${h}`;
  const m = e.querySelector("#xb-assistant-toast");
  m.textContent = D.toast || "", m.classList.toggle("visible", !!D.toast);
  const g = e.querySelector(".xb-assistant-shell"), y = e.querySelector(".xb-assistant-sidebar"), v = e.querySelector("#xb-assistant-sidebar-toggle"), b = e.querySelector(".xb-assistant-sidebar-content"), _ = e.querySelector("#xb-assistant-mobile-settings"), w = e.querySelector("#xb-assistant-mobile-close"), E = e.querySelector("#xb-assistant-mobile-backdrop"), T = window.matchMedia("(max-width: 900px)").matches;
  if (g?.classList.toggle("sidebar-collapsed", !!D.sidebarCollapsed), y?.classList.toggle("is-collapsed", !!D.sidebarCollapsed), b?.toggleAttribute("hidden", !!D.sidebarCollapsed), E?.toggleAttribute("hidden", !T || !!D.sidebarCollapsed), _?.toggleAttribute("hidden", !T), w?.toggleAttribute("hidden", !T), v) {
    v.setAttribute("aria-expanded", D.sidebarCollapsed ? "false" : "true"), v.setAttribute("aria-label", D.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), v.title = D.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const k = v.querySelector(".xb-assistant-sidebar-toggle-text"), x = v.querySelector(".xb-assistant-sidebar-toggle-icon");
    k && (k.textContent = T ? D.sidebarCollapsed ? "展开设置" : "收起设置" : ""), x && (x.textContent = T ? D.sidebarCollapsed ? "▼" : "▲" : D.sidebarCollapsed ? "⚙" : "‹");
  }
  _ && (_.textContent = D.sidebarCollapsed ? "设置" : "关闭设置", _.setAttribute("aria-expanded", D.sidebarCollapsed ? "false" : "true"), _.title = D.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), w && (w.textContent = "关闭", w.title = "关闭小白助手"), Yy(e.querySelector("#xb-assistant-draft-gallery"), D.draftAttachments, { onRemove: (k) => {
    D.draftAttachments = D.draftAttachments.filter((x, N) => N !== k), be();
  } });
  const S = e.querySelector("#xb-assistant-toggle-key");
  S.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function uM(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), r = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 60), 200)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    D.sidebarCollapsed = !D.sidebarCollapsed, An(), be();
  }), e.querySelector("#xb-assistant-mobile-settings")?.addEventListener("click", () => {
    D.sidebarCollapsed = !D.sidebarCollapsed, An(), be();
  }), e.querySelector("#xb-assistant-mobile-close")?.addEventListener("click", () => {
    Bi("xb-assistant:close");
  }), e.querySelector("#xb-assistant-mobile-backdrop")?.addEventListener("click", () => {
    D.sidebarCollapsed || (D.sidebarCollapsed = !0, An(), be());
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (o) => {
    const s = o.currentTarget;
    D.autoScroll = s.scrollHeight - s.scrollTop - s.clientHeight <= 48, zP(e);
  });
  const i = async (o) => {
    const s = o.target.closest("[data-approval-id][data-approval-decision]");
    if (s) {
      const f = s.dataset.approvalId || "", h = s.dataset.approvalDecision || "", m = Ky.get(f);
      if (!m) return;
      h === "approve" ? m.resolve(!0) : m.resolve(!1), be();
      return;
    }
    const u = o.target.closest("[data-message-action][data-message-index]");
    if (!u) return;
    const c = Number.parseInt(u.dataset.messageIndex || "", 10), d = String(u.dataset.messageAction || "").trim();
    if (!Number.isInteger(c) || c < 0 || !d) return;
    const p = D.messages[c];
    if (oM(p)) {
      if (d === "copy") {
        et(await YP(String(p.content || "")) ? "已复制整条消息" : "复制失败");
        return;
      }
      if (d === "edit") {
        if (D.isBusy) return;
        D.editingMessageIndex = c, be();
        const f = e.querySelector(`.xb-assistant-bubble[data-message-index="${c}"] .xb-assistant-message-editor`);
        f?.focus(), f?.setSelectionRange(f.value.length, f.value.length);
        return;
      }
      if (d === "cancel-edit") {
        D.editingMessageIndex = -1, be();
        return;
      }
      if (d === "save-edit") {
        if (D.isBusy) return;
        const f = e.querySelector(`.xb-assistant-bubble[data-message-index="${c}"] .xb-assistant-message-editor`), h = String(f?.value || "").trim();
        if (!h) {
          et("消息内容不能为空");
          return;
        }
        D.messages[c] = {
          ...p,
          content: h
        }, D.editingMessageIndex = -1, await An(), et("消息已更新"), be();
        return;
      }
      if (d === "delete") {
        if (D.isBusy) return;
        D.messages.splice(c, 1), D.editingMessageIndex = -1, await An(), et("消息已删除"), be();
        return;
      }
      if (d === "reroll") {
        if (D.isBusy) return;
        const f = sM(c - 1);
        if (f < 0) {
          et("这条消息前没有可重跑的用户输入");
          return;
        }
        const h = D.messages.slice(0, f + 1), m = iM(h);
        if (!m || m.role !== "user") {
          et("这条消息前没有可重跑的用户输入");
          return;
        }
        D.messages = h, D.pendingApproval = null, D.editingMessageIndex = -1, await An(), be(), await Ip(Cp());
      }
    }
  };
  e.querySelector("#xb-assistant-chat").addEventListener("click", i), e.querySelector("#xb-assistant-approval-slot")?.addEventListener("click", i), HP(e), e.querySelector("#xb-assistant-clear").addEventListener("click", async () => {
    D.isBusy || (D.messages = [], D.draftAttachments = [], D.historySummary = "", D.archivedTurnCount = 0, D.pendingApproval = null, D.editingMessageIndex = -1, ZP(), await IP(), et("对话已清空"), be());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    D.isBusy || D.draftAttachments.length >= ms || n.click();
  }), e.querySelector("#xb-assistant-scroll-top").addEventListener("click", () => {
    D.autoScroll = !1, JP(e.querySelector("#xb-assistant-chat"));
  }), e.querySelector("#xb-assistant-scroll-bottom").addEventListener("click", () => {
    D.autoScroll = !0, Qy(e.querySelector("#xb-assistant-chat")), Zy(e);
  }), n.addEventListener("change", async (o) => {
    const s = Array.from(o.currentTarget.files || []);
    if (s.length)
      try {
        await xp(s);
      } finally {
        o.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (o) => {
    if (D.isBusy) return;
    const s = Array.from(o.clipboardData?.items || []);
    if (!s.length) return;
    const u = s.filter((c) => c.kind === "file" && String(c.type || "").startsWith("image/")).map((c) => c.getAsFile()).filter(Boolean);
    u.length && (o.preventDefault(), await xp(u));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (o) => {
    if (o.preventDefault(), D.isBusy) {
      tM("本轮请求已终止。");
      return;
    }
    const s = t.value.trim(), u = Hs(D.draftAttachments);
    !s && !u.length || (Ol({
      role: "user",
      content: s,
      attachments: u
    }), t.value = "", D.draftAttachments = [], r(), be(), D.editingMessageIndex = -1, await Ip(Cp()));
  }), t.addEventListener("input", r), t.addEventListener("keydown", (o) => {
    const s = !MP();
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
    D.runtime = t.payload?.runtime || null, Pa(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Pa(t.payload?.config || {}), Ap(t.payload?.requestId || "", { ok: !0 }), et("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:identity-updated") {
    D.runtime = {
      ...D.runtime || {},
      identityContent: String(t.payload?.identityContent || "").trim()
    }, et("身份设定已更新");
    return;
  }
  if (t.type === "xb-assistant:skills-updated") {
    D.runtime = {
      ...D.runtime || {},
      skillsCatalog: t.payload?.skillsCatalog || {
        version: 1,
        skills: []
      },
      skillsPromptSummary: String(t.payload?.skillsPromptSummary || ""),
      skillsCatalogError: String(t.payload?.skillsCatalogError || "")
    }, et("技能目录已刷新");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Pa(t.payload?.config || {}), Ap(t.payload?.requestId || "", {
      ok: !1,
      error: t.payload?.error || "网络异常"
    }), et(`保存失败：${t.payload?.error || "网络异常"}`);
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = Bl.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = Bl.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
async function cM() {
  await RP(), ev(), be(), Bi("xb-assistant:ready");
}
cM().catch((e) => {
  console.error("[Assistant] 启动失败:", e), ev(), be(), Bi("xb-assistant:ready");
});
