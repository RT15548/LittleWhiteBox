var Av = Object.create, Rh = Object.defineProperty, Cv = Object.getOwnPropertyDescriptor, xv = Object.getOwnPropertyNames, Iv = Object.getPrototypeOf, Rv = Object.prototype.hasOwnProperty, ms = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Pv = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var i = xv(t), o = 0, s = i.length, u; o < s; o++)
      u = i[o], !Rv.call(e, u) && u !== n && Rh(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Cv(t, u)) || r.enumerable
      });
  return e;
}, Mv = (e, t, n) => (n = e != null ? Av(Iv(e)) : {}, Pv(t || !e || !e.__esModule ? Rh(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function re(e, t, n, r, i) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !i) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function M(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Ph = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ph = e.randomUUID.bind(e), e.randomUUID();
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
}, te = class extends Error {
}, qe = class Da extends te {
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
    if (!t || !i) return new gs({
      message: r,
      cause: ka(n)
    });
    const o = n?.error;
    return t === 400 ? new Mh(t, o, r, i) : t === 401 ? new Nh(t, o, r, i) : t === 403 ? new kh(t, o, r, i) : t === 404 ? new Dh(t, o, r, i) : t === 409 ? new Lh(t, o, r, i) : t === 422 ? new $h(t, o, r, i) : t === 429 ? new Uh(t, o, r, i) : t >= 500 ? new Fh(t, o, r, i) : new Da(t, o, r, i);
  }
}, ft = class extends qe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, gs = class extends qe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ql = class extends gs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Mh = class extends qe {
}, Nh = class extends qe {
}, kh = class extends qe {
}, Dh = class extends qe {
}, Lh = class extends qe {
}, $h = class extends qe {
}, Uh = class extends qe {
}, Fh = class extends qe {
}, Bh = class extends te {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Oh = class extends te {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Fr = class extends Error {
  constructor(e) {
    super(e);
  }
}, Gh = class extends qe {
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
}, Nv = class extends te {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, kv = /^[a-z][a-z0-9+.-]*:/i, Dv = (e) => kv.test(e), Xe = (e) => (Xe = Array.isArray, Xe(e)), cc = Xe;
function qh(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function dc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Lv(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Js(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var $v = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new te(`${e} must be an integer`);
  if (t < 0) throw new te(`${e} must be a positive integer`);
  return t;
}, Uv = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, bi = (e) => new Promise((t) => setTimeout(t, e)), Hn = "6.34.0", Fv = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Bv() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Ov = () => {
  const e = Bv();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Hn,
    "X-Stainless-OS": hc(Deno.build.os),
    "X-Stainless-Arch": fc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Hn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Hn,
    "X-Stainless-OS": hc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": fc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Gv();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Hn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Hn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Gv() {
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
var fc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", hc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), pc, qv = () => pc ?? (pc = Ov());
function Vh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Hh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Kh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Hh({
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
function Wh(e) {
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
async function mc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Vv = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Jh = "RFC3986", zh = (e) => String(e), gc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: zh
};
var La = (e, t) => (La = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), La(e, t)), Et = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), zs = 1024, Hv = (e, t, n, r, i) => {
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
function Kv(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function yc(e, t) {
  if (Xe(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Yh = {
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
}, Xh = function(e, t) {
  Array.prototype.push.apply(e, Xe(t) ? t : [t]);
}, vc, Ne = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Hv,
  encodeValuesOnly: !1,
  format: Jh,
  formatter: zh,
  indices: !1,
  serializeDate(e) {
    return (vc ?? (vc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Wv(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ys = {};
function Qh(e, t, n, r, i, o, s, u, c, d, h, f, p, m, g, y, v, b) {
  let _ = e, w = b, E = 0, T = !1;
  for (; (w = w.get(Ys)) !== void 0 && !T; ) {
    const L = w.get(e);
    if (E += 1, typeof L < "u") {
      if (L === E) throw new RangeError("Cyclic object value");
      T = !0;
    }
    typeof w.get(Ys) > "u" && (E = 0);
  }
  if (typeof d == "function" ? _ = d(t, _) : _ instanceof Date ? _ = p?.(_) : n === "comma" && Xe(_) && (_ = yc(_, function(L) {
    return L instanceof Date ? p?.(L) : L;
  })), _ === null) {
    if (o) return c && !y ? c(t, Ne.encoder, v, "key", m) : t;
    _ = "";
  }
  if (Wv(_) || Kv(_)) {
    if (c) {
      const L = y ? t : c(t, Ne.encoder, v, "key", m);
      return [g?.(L) + "=" + g?.(c(_, Ne.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(_))];
  }
  const S = [];
  if (typeof _ > "u") return S;
  let N;
  if (n === "comma" && Xe(_))
    y && c && (_ = yc(_, c)), N = [{ value: _.length > 0 ? _.join(",") || null : void 0 }];
  else if (Xe(d)) N = d;
  else {
    const L = Object.keys(_);
    N = h ? L.sort(h) : L;
  }
  const A = u ? String(t).replace(/\./g, "%2E") : String(t), k = r && Xe(_) && _.length === 1 ? A + "[]" : A;
  if (i && Xe(_) && _.length === 0) return k + "[]";
  for (let L = 0; L < N.length; ++L) {
    const G = N[L], Z = typeof G == "object" && typeof G.value < "u" ? G.value : _[G];
    if (s && Z === null) continue;
    const K = f && u ? G.replace(/\./g, "%2E") : G, C = Xe(_) ? typeof n == "function" ? n(k, K) : k : k + (f ? "." + K : "[" + K + "]");
    b.set(e, E);
    const R = /* @__PURE__ */ new WeakMap();
    R.set(Ys, b), Xh(S, Qh(Z, C, n, r, i, o, s, u, n === "comma" && y && Xe(_) ? null : c, d, h, f, p, m, g, y, v, R));
  }
  return S;
}
function Jv(e = Ne) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || Ne.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Jh;
  if (typeof e.format < "u") {
    if (!La(gc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = gc[n];
  let i = Ne.filter;
  (typeof e.filter == "function" || Xe(e.filter)) && (i = e.filter);
  let o;
  if (e.arrayFormat && e.arrayFormat in Yh ? o = e.arrayFormat : "indices" in e ? o = e.indices ? "indices" : "repeat" : o = Ne.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : Ne.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : Ne.addQueryPrefix,
    allowDots: s,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : Ne.allowEmptyArrays,
    arrayFormat: o,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : Ne.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? Ne.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : Ne.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : Ne.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : Ne.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : Ne.encodeValuesOnly,
    filter: i,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : Ne.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : Ne.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : Ne.strictNullHandling
  };
}
function zv(e, t = {}) {
  let n = e;
  const r = Jv(t);
  let i, o;
  typeof r.filter == "function" ? (o = r.filter, n = o("", n)) : Xe(r.filter) && (o = r.filter, i = o);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Yh[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  i || (i = Object.keys(n)), r.sort && i.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < i.length; ++p) {
    const m = i[p];
    r.skipNulls && n[m] === null || Xh(s, Qh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = s.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function Yv(e) {
  return zv(e, { arrayFormat: "brackets" });
}
function Xv(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var _c;
function Vl(e) {
  let t;
  return (_c ?? (t = new globalThis.TextEncoder(), _c = t.encode.bind(t)))(e);
}
var bc;
function wc(e) {
  let t;
  return (bc ?? (t = new globalThis.TextDecoder(), bc = t.decode.bind(t)))(e);
}
var tt, nt, ys = class {
  constructor() {
    tt.set(this, void 0), nt.set(this, void 0), re(this, tt, new Uint8Array(), "f"), re(this, nt, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Vl(e) : e;
    re(this, tt, Xv([M(this, tt, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Qv(M(this, tt, "f"), M(this, nt, "f"))) != null; ) {
      if (r.carriage && M(this, nt, "f") == null) {
        re(this, nt, r.index, "f");
        continue;
      }
      if (M(this, nt, "f") != null && (r.index !== M(this, nt, "f") + 1 || r.carriage)) {
        n.push(wc(M(this, tt, "f").subarray(0, M(this, nt, "f") - 1))), re(this, tt, M(this, tt, "f").subarray(M(this, nt, "f")), "f"), re(this, nt, null, "f");
        continue;
      }
      const i = M(this, nt, "f") !== null ? r.preceding - 1 : r.preceding, o = wc(M(this, tt, "f").subarray(0, i));
      n.push(o), re(this, tt, M(this, tt, "f").subarray(r.index), "f"), re(this, nt, null, "f");
    }
    return n;
  }
  flush() {
    return M(this, tt, "f").length ? this.decode(`
`) : [];
  }
};
tt = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap();
ys.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ys.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Qv(e, t) {
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
function Zv(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Go = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Sc = (e, t, n) => {
  if (e) {
    if (Lv(Go, e)) return e;
    Be(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Go))}`);
  }
};
function Br() {
}
function Ui(e, t, n) {
  return !t || Go[e] > Go[n] ? Br : t[e].bind(t);
}
var jv = {
  error: Br,
  warn: Br,
  info: Br,
  debug: Br
}, Ec = /* @__PURE__ */ new WeakMap();
function Be(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return jv;
  const r = Ec.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: Ui("error", t, n),
    warn: Ui("warn", t, n),
    info: Ui("info", t, n),
    debug: Ui("debug", t, n)
  };
  return Ec.set(t, [n, i]), i;
}
var pn = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), vr, li = class Or {
  constructor(t, n, r) {
    this.iterator = t, vr.set(this, void 0), this.controller = n, re(this, vr, r, "f");
  }
  static fromSSEResponse(t, n, r, i) {
    let o = !1;
    const s = r ? Be(r) : console;
    async function* u() {
      if (o) throw new te("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let c = !1;
      try {
        for await (const d of e_(t, n))
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
              if (h && h.error) throw new qe(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new qe(void 0, h.error, h.message, void 0);
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
    return new Or(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new ys(), c = Wh(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
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
        if (Na(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Or(s, n, r);
  }
  [(vr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Or(() => i(t), this.controller, M(this, vr, "f")), new Or(() => i(n), this.controller, M(this, vr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Hh({
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
async function* e_(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new te("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new te("Attempted to iterate over a response with no body");
  const n = new n_(), r = new ys(), i = Wh(e.body);
  for await (const o of t_(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* t_(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Vl(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = Zv(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var n_ = class {
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
    let [t, n, r] = r_(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function r_(e, t) {
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
async function Zh(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    if (t.options.stream)
      return Be(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : li.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : jh(await n.json(), n) : await n.text();
  })();
  return Be(e).debug(`[${r}] response parsed`, pn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
function jh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Gr, ep = class tp extends Promise {
  constructor(t, n, r = Zh) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, Gr.set(this, void 0), re(this, Gr, t, "f");
  }
  _thenUnwrap(t) {
    return new tp(M(this, Gr, "f"), this.responsePromise, async (n, r) => jh(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(M(this, Gr, "f"), t))), this.parsedPromise;
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
Gr = /* @__PURE__ */ new WeakMap();
var Fi, Hl = class {
  constructor(e, t, n, r) {
    Fi.set(this, void 0), re(this, Fi, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new te("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await M(this, Fi, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Fi = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, i_ = class extends ep {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await Zh(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, vs = class extends Hl {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Ce = class extends Hl {
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
        ...qh(this.options.query),
        after: t
      }
    } : null;
  }
}, ui = class extends Hl {
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
        ...qh(this.options.query),
        after: e
      }
    } : null;
  }
}, o_ = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, s_ = "urn:ietf:params:oauth:grant-type:token-exchange", a_ = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Vh();
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
        grant_type: s_,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: o_[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Gh(t.status, s, t.headers) : qe.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
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
}, np = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ti(e, t, n) {
  return np(), new File(e, t ?? "unknown_file", n);
}
function _o(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Kl = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", _s = async (e, t) => $a(e.body) ? {
  ...e,
  body: await rp(e.body, t)
} : e, Ct = async (e, t) => ({
  ...e,
  body: await rp(e.body, t)
}), Tc = /* @__PURE__ */ new WeakMap();
function l_(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Tc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return Tc.set(t, r), r;
}
var rp = async (e, t) => {
  if (!await l_(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Ua(n, r, i))), n;
}, ip = (e) => e instanceof Blob && "name" in e, u_ = (e) => typeof e == "object" && e !== null && (e instanceof Response || Kl(e) || ip(e)), $a = (e) => {
  if (u_(e)) return !0;
  if (Array.isArray(e)) return e.some($a);
  if (e && typeof e == "object") {
    for (const t in e) if ($a(e[t])) return !0;
  }
  return !1;
}, Ua = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, ti([await n.blob()], _o(n)));
    else if (Kl(n)) e.append(t, ti([await new Response(Kh(n)).blob()], _o(n)));
    else if (ip(n)) e.append(t, n, _o(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ua(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Ua(e, `${t}[${r}]`, i)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, op = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", c_ = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && op(e), d_ = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function f_(e, t, n) {
  if (np(), e = await e, c_(e))
    return e instanceof File ? e : ti([await e.arrayBuffer()], e.name);
  if (d_(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ti(await Fa(i), t, n);
  }
  const r = await Fa(e);
  if (t || (t = _o(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return ti(r, t, n);
}
async function Fa(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (op(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Kl(e)) for await (const n of e) t.push(...await Fa(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${h_(e)}`);
  }
  return t;
}
function h_(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var j = class {
  constructor(e) {
    this._client = e;
  }
};
function sp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ac = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), p_ = (e = sp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ac) ?? Ac)?.toString) && (g = m + "", o.push({
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
    throw new te(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, F = /* @__PURE__ */ p_(sp), ap = class extends j {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/chat/completions/${e}/messages`, Ce, {
      query: t,
      ...n
    });
  }
};
function qo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Wl(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function wi(e) {
  return e?.$brand === "auto-parseable-tool";
}
function m_(e, t) {
  return !t || !lp(t) ? {
    ...e,
    choices: e.choices.map((n) => (up(n.message.tool_calls), {
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
    if (r.finish_reason === "length") throw new Bh();
    if (r.finish_reason === "content_filter") throw new Oh();
    return up(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((i) => y_(t, i)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? g_(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function g_(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function y_(e, t) {
  const n = e.tools?.find((r) => qo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: wi(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function v_(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => qo(r) && r.function?.name === t.function.name);
  return qo(n) && (wi(n) || n?.function.strict || !1);
}
function lp(e) {
  return Wl(e.response_format) ? !0 : e.tools?.some((t) => wi(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function up(e) {
  for (const t of e || []) if (t.type !== "function") throw new te(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function __(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new te(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new te(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Vo = (e) => e?.role === "assistant", cp = (e) => e?.role === "tool", Ba, bo, wo, qr, Vr, So, Hr, Dt, Kr, Ho, Ko, Kn, dp, zl = class {
  constructor() {
    Ba.add(this), this.controller = new AbortController(), bo.set(this, void 0), wo.set(this, () => {
    }), qr.set(this, () => {
    }), Vr.set(this, void 0), So.set(this, () => {
    }), Hr.set(this, () => {
    }), Dt.set(this, {}), Kr.set(this, !1), Ho.set(this, !1), Ko.set(this, !1), Kn.set(this, !1), re(this, bo, new Promise((e, t) => {
      re(this, wo, e, "f"), re(this, qr, t, "f");
    }), "f"), re(this, Vr, new Promise((e, t) => {
      re(this, So, e, "f"), re(this, Hr, t, "f");
    }), "f"), M(this, bo, "f").catch(() => {
    }), M(this, Vr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, M(this, Ba, "m", dp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (M(this, wo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return M(this, Kr, "f");
  }
  get errored() {
    return M(this, Ho, "f");
  }
  get aborted() {
    return M(this, Ko, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (M(this, Dt, "f")[e] || (M(this, Dt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = M(this, Dt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((i) => i.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (M(this, Dt, "f")[e] || (M(this, Dt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      re(this, Kn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    re(this, Kn, !0, "f"), await M(this, Vr, "f");
  }
  _emit(e, ...t) {
    if (M(this, Kr, "f")) return;
    e === "end" && (re(this, Kr, !0, "f"), M(this, So, "f").call(this));
    const n = M(this, Dt, "f")[e];
    if (n && (M(this, Dt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !M(this, Kn, "f") && !n?.length && Promise.reject(r), M(this, qr, "f").call(this, r), M(this, Hr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !M(this, Kn, "f") && !n?.length && Promise.reject(r), M(this, qr, "f").call(this, r), M(this, Hr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
bo = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), Kr = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), Ba = /* @__PURE__ */ new WeakSet(), dp = function(t) {
  if (re(this, Ho, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new ft()), t instanceof ft)
    return re(this, Ko, !0, "f"), this._emit("abort", t);
  if (t instanceof te) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new te(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new te(String(t)));
};
function b_(e) {
  return typeof e.parse == "function";
}
var He, Oa, Wo, Ga, qa, Va, fp, hp, w_ = 10, pp = class extends zl {
  constructor() {
    super(...arguments), He.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), cp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Vo(e) && e.tool_calls)
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
    return await this.done(), M(this, He, "m", Oa).call(this);
  }
  async finalMessage() {
    return await this.done(), M(this, He, "m", Wo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), M(this, He, "m", Ga).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), M(this, He, "m", qa).call(this);
  }
  async totalUsage() {
    return await this.done(), M(this, He, "m", Va).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = M(this, He, "m", Wo).call(this);
    t && this._emit("finalMessage", t);
    const n = M(this, He, "m", Oa).call(this);
    n && this._emit("finalContent", n);
    const r = M(this, He, "m", Ga).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const i = M(this, He, "m", qa).call(this);
    i != null && this._emit("finalFunctionToolCallResult", i), this._chatCompletions.some((o) => o.usage) && this._emit("totalUsage", M(this, He, "m", Va).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), M(this, He, "m", fp).call(this, t);
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
    const r = "tool", { tool_choice: i = "auto", stream: o, ...s } = t, u = typeof i != "string" && i.type === "function" && i?.function?.name, { maxChatCompletions: c = w_ } = n || {}, d = t.tools.map((p) => {
      if (wi(p)) {
        if (!p.$callback) throw new te("Tool given to `.runTools()` that does not have an associated function");
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
      if (!m) throw new te("missing message in ChatCompletion response");
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
          const S = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((N) => JSON.stringify(N)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: S
          });
          continue;
        }
        let w;
        try {
          w = b_(_) ? await _.parse(b) : b;
        } catch (S) {
          const N = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: y,
            content: N
          });
          continue;
        }
        const E = await _.function(w, this), T = M(this, He, "m", hp).call(this, E);
        if (this._addMessage({
          role: r,
          tool_call_id: y,
          content: T
        }), u) return;
      }
    }
  }
};
He = /* @__PURE__ */ new WeakSet(), Oa = function() {
  return M(this, He, "m", Wo).call(this).content ?? null;
}, Wo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Vo(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new te("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ga = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Vo(n) && n?.tool_calls?.length) return n.tool_calls.filter((r) => r.type === "function").at(-1)?.function;
  }
}, qa = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (cp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((i) => i.type === "function" && i.id === n.tool_call_id))) return n.content;
  }
}, Va = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, fp = function(t) {
  if (t.n != null && t.n > 1) throw new te("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, hp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var S_ = class mp extends pp {
  static runTools(t, n, r) {
    const i = new mp(), o = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return i._run(() => i._runTools(t, n, o)), i;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Vo(t) && t.content && this._emit("content", t.content);
  }
}, E_ = 1, gp = 2, yp = 4, vp = 8, T_ = 16, A_ = 32, C_ = 64, _p = 128, bp = 256, x_ = _p | bp, I_ = 496, Cc = gp | 497, xc = yp | vp, Le = {
  STR: E_,
  NUM: gp,
  ARR: yp,
  OBJ: vp,
  NULL: T_,
  BOOL: A_,
  NAN: C_,
  INFINITY: _p,
  MINUS_INFINITY: bp,
  INF: x_,
  SPECIAL: I_,
  ATOM: Cc,
  COLLECTION: xc,
  ALL: Cc | xc
}, R_ = class extends Error {
}, P_ = class extends Error {
};
function M_(e, t = Le.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return N_(e.trim(), t);
}
var N_ = (e, t) => {
  const n = e.length;
  let r = 0;
  const i = (p) => {
    throw new R_(`${p} at position ${r}`);
  }, o = (p) => {
    throw new P_(`${p} at position ${r}`);
  }, s = () => (f(), r >= n && i("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || Le.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || Le.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || Le.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || Le.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || Le.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || Le.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (g) {
      o(String(g));
    }
    else if (Le.STR & t) try {
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
        if (f(), r >= n && Le.OBJ & t) return p;
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
          if (Le.OBJ & t) return p;
          throw g;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (Le.OBJ & t) return p;
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
      if (Le.ARR & t) return p;
      i("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && Le.NUM & t && i("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (Le.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        o(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(Le.NUM & t) && i("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && Le.NUM & t && i("Not sure what '-' is");
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
}, Ic = (e) => M_(e, Le.ALL ^ Le.NUM), Pe, Pt, Ln, Vt, Xs, Bi, Qs, Zs, js, Oi, ea, Rc, wp = class Ha extends pp {
  constructor(t) {
    super(), Pe.add(this), Pt.set(this, void 0), Ln.set(this, void 0), Vt.set(this, void 0), re(this, Pt, t, "f"), re(this, Ln, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return M(this, Vt, "f");
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
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), M(this, Pe, "m", Xs).call(this);
    const o = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of o) M(this, Pe, "m", Qs).call(this, s);
    if (o.controller.signal?.aborted) throw new ft();
    return this._addChatCompletion(M(this, Pe, "m", Oi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), M(this, Pe, "m", Xs).call(this), this._connected();
    const i = li.fromReadableStream(t, this.controller);
    let o;
    for await (const s of i)
      o && o !== s.id && this._addChatCompletion(M(this, Pe, "m", Oi).call(this)), M(this, Pe, "m", Qs).call(this, s), o = s.id;
    if (i.controller.signal?.aborted) throw new ft();
    return this._addChatCompletion(M(this, Pe, "m", Oi).call(this));
  }
  [(Pt = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), Xs = function() {
    this.ended || re(this, Vt, void 0, "f");
  }, Bi = function(n) {
    let r = M(this, Ln, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, M(this, Ln, "f")[n.index] = r, r);
  }, Qs = function(n) {
    if (this.ended) return;
    const r = M(this, Pe, "m", Rc).call(this, n);
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
      const s = M(this, Pe, "m", Bi).call(this, o);
      o.finish_reason && (M(this, Pe, "m", js).call(this, o), s.current_tool_call_index != null && M(this, Pe, "m", Zs).call(this, o, s.current_tool_call_index));
      for (const u of i.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (M(this, Pe, "m", js).call(this, o), s.current_tool_call_index != null && M(this, Pe, "m", Zs).call(this, o, s.current_tool_call_index)), s.current_tool_call_index = u.index;
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
    if (M(this, Pe, "m", Bi).call(this, n).done_tool_calls.has(r)) return;
    const i = n.message.tool_calls?.[r];
    if (!i) throw new Error("no tool call snapshot");
    if (!i.type) throw new Error("tool call snapshot missing `type`");
    if (i.type === "function") {
      const o = M(this, Pt, "f")?.tools?.find((s) => qo(s) && s.function.name === i.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: i.function.name,
        index: r,
        arguments: i.function.arguments,
        parsed_arguments: wi(o) ? o.$parseRaw(i.function.arguments) : o?.function.strict ? JSON.parse(i.function.arguments) : null
      });
    } else i.type;
  }, js = function(n) {
    const r = M(this, Pe, "m", Bi).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const i = M(this, Pe, "m", ea).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: i ? i.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Oi = function() {
    if (this.ended) throw new te("stream has ended, this shouldn't happen");
    const n = M(this, Vt, "f");
    if (!n) throw new te("request ended without sending any chunks");
    return re(this, Vt, void 0, "f"), re(this, Ln, [], "f"), k_(n, M(this, Pt, "f"));
  }, ea = function() {
    const n = M(this, Pt, "f")?.response_format;
    return Wl(n) ? n : null;
  }, Rc = function(n) {
    var r, i, o, s;
    let u = M(this, Vt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = re(this, Vt, {
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
        const { content: S, refusal: N, ...A } = m;
        Object.assign(y.logprobs, A), S && ((r = y.logprobs).content ?? (r.content = []), y.logprobs.content.push(...S)), N && ((i = y.logprobs).refusal ?? (i.refusal = []), y.logprobs.refusal.push(...N));
      }
      if (f && (y.finish_reason = f, M(this, Pt, "f") && lp(M(this, Pt, "f")))) {
        if (f === "length") throw new Bh();
        if (f === "content_filter") throw new Oh();
      }
      if (Object.assign(y, g), !h) continue;
      const { content: v, refusal: b, function_call: _, role: w, tool_calls: E, ...T } = h;
      if (Object.assign(y.message, T), b && (y.message.refusal = (y.message.refusal || "") + b), w && (y.message.role = w), _ && (y.message.function_call ? (_.name && (y.message.function_call.name = _.name), _.arguments && ((o = y.message.function_call).arguments ?? (o.arguments = ""), y.message.function_call.arguments += _.arguments)) : y.message.function_call = _), v && (y.message.content = (y.message.content || "") + v, !y.message.refusal && M(this, Pe, "m", ea).call(this) && (y.message.parsed = Ic(y.message.content))), E) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: S, id: N, type: A, function: k, ...L } of E) {
          const G = (s = y.message.tool_calls)[S] ?? (s[S] = {});
          Object.assign(G, L), N && (G.id = N), A && (G.type = A), k && (G.function ?? (G.function = {
            name: k.name ?? "",
            arguments: ""
          })), k?.name && (G.function.name = k.name), k?.arguments && (G.function.arguments += k.arguments, v_(M(this, Pt, "f"), G) && (G.function.parsed_arguments = Ic(G.function.arguments)));
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
    return new li(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function k_(e, t) {
  const { id: n, choices: r, created: i, model: o, system_fingerprint: s, ...u } = e;
  return m_({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new te(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: y, ...v } = c, b = c.role;
      if (!b) throw new te(`missing role for choice ${h}`);
      if (g) {
        const { arguments: _, name: w } = g;
        if (_ == null) throw new te(`missing function_call.arguments for choice ${h}`);
        if (!w) throw new te(`missing function_call.name for choice ${h}`);
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
            const { function: E, type: T, id: S, ...N } = _, { arguments: A, name: k, ...L } = E || {};
            if (S == null) throw new te(`missing choices[${h}].tool_calls[${w}].id
${Gi(e)}`);
            if (T == null) throw new te(`missing choices[${h}].tool_calls[${w}].type
${Gi(e)}`);
            if (k == null) throw new te(`missing choices[${h}].tool_calls[${w}].function.name
${Gi(e)}`);
            if (A == null) throw new te(`missing choices[${h}].tool_calls[${w}].function.arguments
${Gi(e)}`);
            return {
              ...N,
              id: S,
              type: T,
              function: {
                ...L,
                name: k,
                arguments: A
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
function Gi(e) {
  return JSON.stringify(e);
}
var D_ = class Ka extends wp {
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
}, Yl = class extends j {
  constructor() {
    super(...arguments), this.messages = new ap(this._client);
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
    return this._client.getAPIList("/chat/completions", Ce, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return __(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Jl(n, e));
  }
  runTools(e, t) {
    return e.stream ? D_.runTools(this._client, e, t) : S_.runTools(this._client, e, t);
  }
  stream(e, t) {
    return wp.createChatCompletion(this._client, e, t);
  }
};
Yl.Messages = ap;
var Xl = class extends j {
  constructor() {
    super(...arguments), this.completions = new Yl(this._client);
  }
};
Xl.Completions = Yl;
var Sp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* L_(e) {
  if (!e) return;
  if (Sp in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : cc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = cc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var X = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of L_(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [Sp]: !0,
    values: t,
    nulls: n
  };
}, Ep = class extends j {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: X([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Tp = class extends j {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ct({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Ap = class extends j {
  create(e, t) {
    return this._client.post("/audio/translations", Ct({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, Si = class extends j {
  constructor() {
    super(...arguments), this.transcriptions = new Tp(this._client), this.translations = new Ap(this._client), this.speech = new Ep(this._client);
  }
};
Si.Transcriptions = Tp;
Si.Translations = Ap;
Si.Speech = Ep;
var Cp = class extends j {
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
    return this._client.getAPIList("/batches", Ce, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(F`/batches/${e}/cancel`, t);
  }
}, xp = class extends j {
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
    return this._client.getAPIList("/assistants", Ce, {
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
}, Ip = class extends j {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Rp = class extends j {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, bs = class extends j {
  constructor() {
    super(...arguments), this.sessions = new Ip(this._client), this.transcriptionSessions = new Rp(this._client);
  }
};
bs.Sessions = Ip;
bs.TranscriptionSessions = Rp;
var Pp = class extends j {
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
}, Mp = class extends j {
  retrieve(e, t) {
    return this._client.get(F`/chatkit/threads/${e}`, {
      ...t,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ui, {
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
    return this._client.getAPIList(F`/chatkit/threads/${e}/items`, ui, {
      query: t,
      ...n,
      headers: X([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, ws = class extends j {
  constructor() {
    super(...arguments), this.sessions = new Pp(this._client), this.threads = new Mp(this._client);
  }
};
ws.Sessions = Pp;
ws.Threads = Mp;
var Np = class extends j {
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
    return this._client.getAPIList(F`/threads/${e}/messages`, Ce, {
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
}, kp = class extends j {
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
    return this._client.getAPIList(F`/threads/${r}/runs/${e}/steps`, Ce, {
      query: i,
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, $_ = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let i = 0; i < n; i++) r[i] = t.charCodeAt(i);
    return Array.from(new Float32Array(r.buffer));
  }
}, $n = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, Oe, En, Wa, Tt, Eo, gt, Tn, Xn, bn, Jo, st, To, Ao, ni, Wr, Jr, Pc, Mc, Nc, kc, Dc, Lc, $c, ri = class extends zl {
  constructor() {
    super(...arguments), Oe.add(this), Wa.set(this, []), Tt.set(this, {}), Eo.set(this, {}), gt.set(this, void 0), Tn.set(this, void 0), Xn.set(this, void 0), bn.set(this, void 0), Jo.set(this, void 0), st.set(this, void 0), To.set(this, void 0), Ao.set(this, void 0), ni.set(this, void 0);
  }
  [(Wa = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), ni = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new En();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = li.fromReadableStream(e, this.controller);
    for await (const i of r) M(this, Oe, "m", Wr).call(this, i);
    if (r.controller.signal?.aborted) throw new ft();
    return this._addRun(M(this, Oe, "m", Jr).call(this));
  }
  toReadableStream() {
    return new li(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const i = new En();
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
    for await (const u of s) M(this, Oe, "m", Wr).call(this, u);
    if (s.controller.signal?.aborted) throw new ft();
    return this._addRun(M(this, Oe, "m", Jr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new En();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const i = new En();
    return i._run(() => i._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  currentEvent() {
    return M(this, To, "f");
  }
  currentRun() {
    return M(this, Ao, "f");
  }
  currentMessageSnapshot() {
    return M(this, gt, "f");
  }
  currentRunStepSnapshot() {
    return M(this, ni, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(M(this, Tt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(M(this, Eo, "f"));
  }
  async finalRun() {
    if (await this.done(), !M(this, Tn, "f")) throw Error("Final run was not received.");
    return M(this, Tn, "f");
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
    for await (const s of o) M(this, Oe, "m", Wr).call(this, s);
    if (o.controller.signal?.aborted) throw new ft();
    return this._addRun(M(this, Oe, "m", Jr).call(this));
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
    for await (const u of s) M(this, Oe, "m", Wr).call(this, u);
    if (s.controller.signal?.aborted) throw new ft();
    return this._addRun(M(this, Oe, "m", Jr).call(this));
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
En = ri, Wr = function(t) {
  if (!this.ended)
    switch (re(this, To, t, "f"), M(this, Oe, "m", Nc).call(this, t), t.event) {
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
        M(this, Oe, "m", $c).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        M(this, Oe, "m", Mc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        M(this, Oe, "m", Pc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Jr = function() {
  if (this.ended) throw new te("stream has ended, this shouldn't happen");
  if (!M(this, Tn, "f")) throw Error("Final run has not been received");
  return M(this, Tn, "f");
}, Pc = function(t) {
  const [n, r] = M(this, Oe, "m", Dc).call(this, t, M(this, gt, "f"));
  re(this, gt, n, "f"), M(this, Eo, "f")[n.id] = n;
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
        if (i.index != M(this, Xn, "f")) {
          if (M(this, bn, "f")) switch (M(this, bn, "f").type) {
            case "text":
              this._emit("textDone", M(this, bn, "f").text, M(this, gt, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", M(this, bn, "f").image_file, M(this, gt, "f"));
              break;
          }
          re(this, Xn, i.index, "f");
        }
        re(this, bn, n.content[i.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (M(this, Xn, "f") !== void 0) {
        const i = t.data.content[M(this, Xn, "f")];
        if (i) switch (i.type) {
          case "image_file":
            this._emit("imageFileDone", i.image_file, M(this, gt, "f"));
            break;
          case "text":
            this._emit("textDone", i.text, M(this, gt, "f"));
            break;
        }
      }
      M(this, gt, "f") && this._emit("messageDone", t.data), re(this, gt, void 0, "f");
  }
}, Mc = function(t) {
  const n = M(this, Oe, "m", kc).call(this, t);
  switch (re(this, ni, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const i of r.step_details.tool_calls) i.index == M(this, Jo, "f") ? this._emit("toolCallDelta", i, n.step_details.tool_calls[i.index]) : (M(this, st, "f") && this._emit("toolCallDone", M(this, st, "f")), re(this, Jo, i.index, "f"), re(this, st, n.step_details.tool_calls[i.index], "f"), M(this, st, "f") && this._emit("toolCallCreated", M(this, st, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      re(this, ni, void 0, "f"), t.data.step_details.type == "tool_calls" && M(this, st, "f") && (this._emit("toolCallDone", M(this, st, "f")), re(this, st, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Nc = function(t) {
  M(this, Wa, "f").push(t), this._emit("event", t);
}, kc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return M(this, Tt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = M(this, Tt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const i = En.accumulateDelta(n, r.delta);
        M(this, Tt, "f")[t.data.id] = i;
      }
      return M(this, Tt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      M(this, Tt, "f")[t.data.id] = t.data;
      break;
  }
  if (M(this, Tt, "f")[t.data.id]) return M(this, Tt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Dc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let i = t.data;
      if (i.delta.content) for (const o of i.delta.content) if (o.index in n.content) {
        let s = n.content[o.index];
        n.content[o.index] = M(this, Oe, "m", Lc).call(this, o, s);
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
}, Lc = function(t, n) {
  return En.accumulateDelta(n, t);
}, $c = function(t) {
  switch (re(this, Ao, t.data, "f"), t.event) {
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
      re(this, Tn, t.data, "f"), M(this, st, "f") && (this._emit("toolCallDone", M(this, st, "f")), re(this, st, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ql = class extends j {
  constructor() {
    super(...arguments), this.steps = new kp(this._client);
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
    return this._client.getAPIList(F`/threads/${e}/runs`, Ce, {
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
    return ri.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await bi(s);
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
    return ri.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return ri.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ql.Steps = kp;
var Ss = class extends j {
  constructor() {
    super(...arguments), this.runs = new Ql(this._client), this.messages = new Np(this._client);
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
    return ri.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Ss.Runs = Ql;
Ss.Messages = Np;
var sr = class extends j {
  constructor() {
    super(...arguments), this.realtime = new bs(this._client), this.chatkit = new ws(this._client), this.assistants = new xp(this._client), this.threads = new Ss(this._client);
  }
};
sr.Realtime = bs;
sr.ChatKit = ws;
sr.Assistants = xp;
sr.Threads = Ss;
var Dp = class extends j {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Lp = class extends j {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(F`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: X([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Zl = class extends j {
  constructor() {
    super(...arguments), this.content = new Lp(this._client);
  }
  create(e, t, n) {
    return this._client.post(F`/containers/${e}/files`, _s({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(F`/containers/${r}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/containers/${e}/files`, Ce, {
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
Zl.Content = Lp;
var jl = class extends j {
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
    return this._client.get(F`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Ce, {
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
jl.Files = Zl;
var $p = class extends j {
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
    return this._client.getAPIList(F`/conversations/${e}/items`, ui, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(F`/conversations/${r}/items/${e}`, n);
  }
}, eu = class extends j {
  constructor() {
    super(...arguments), this.items = new $p(this._client);
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
eu.Items = $p;
var Up = class extends j {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && Be(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const i = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t
    });
    return n ? i : (Be(this._client).debug("embeddings/decoding base64 embeddings from base64"), i._thenUnwrap((o) => (o && o.data && o.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = $_(u);
    }), o)));
  }
}, Fp = class extends j {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: i } = t;
    return this._client.get(F`/evals/${r}/runs/${i}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: r, ...i } = t;
    return this._client.getAPIList(F`/evals/${r}/runs/${e}/output_items`, Ce, {
      query: i,
      ...n
    });
  }
}, tu = class extends j {
  constructor() {
    super(...arguments), this.outputItems = new Fp(this._client);
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
    return this._client.getAPIList(F`/evals/${e}/runs`, Ce, {
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
tu.OutputItems = Fp;
var nu = class extends j {
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
    return this._client.get(F`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(F`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", Ce, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/evals/${e}`, t);
  }
};
nu.Runs = tu;
var Bp = class extends j {
  create(e, t) {
    return this._client.post("/files", Ct({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(F`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", Ce, {
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
      if (await bi(t), o = await this.retrieve(e), Date.now() - i > n) throw new ql({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return o;
  }
}, Op = class extends j {
}, Gp = class extends j {
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
}, ru = class extends j {
  constructor() {
    super(...arguments), this.graders = new Gp(this._client);
  }
};
ru.Graders = Gp;
var qp = class extends j {
  create(e, t, n) {
    return this._client.getAPIList(F`/fine_tuning/checkpoints/${e}/permissions`, vs, {
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
    return this._client.getAPIList(F`/fine_tuning/checkpoints/${e}/permissions`, ui, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(F`/fine_tuning/checkpoints/${r}/permissions/${e}`, n);
  }
}, iu = class extends j {
  constructor() {
    super(...arguments), this.permissions = new qp(this._client);
  }
};
iu.Permissions = qp;
var Vp = class extends j {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/fine_tuning/jobs/${e}/checkpoints`, Ce, {
      query: t,
      ...n
    });
  }
}, ou = class extends j {
  constructor() {
    super(...arguments), this.checkpoints = new Vp(this._client);
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
    return this._client.getAPIList("/fine_tuning/jobs", Ce, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(F`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(F`/fine_tuning/jobs/${e}/events`, Ce, {
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
ou.Checkpoints = Vp;
var ar = class extends j {
  constructor() {
    super(...arguments), this.methods = new Op(this._client), this.jobs = new ou(this._client), this.checkpoints = new iu(this._client), this.alpha = new ru(this._client);
  }
};
ar.Methods = Op;
ar.Jobs = ou;
ar.Checkpoints = iu;
ar.Alpha = ru;
var Hp = class extends j {
}, su = class extends j {
  constructor() {
    super(...arguments), this.graderModels = new Hp(this._client);
  }
};
su.GraderModels = Hp;
var Kp = class extends j {
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
}, Wp = class extends j {
  retrieve(e, t) {
    return this._client.get(F`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", vs, e);
  }
  delete(e, t) {
    return this._client.delete(F`/models/${e}`, t);
  }
}, Jp = class extends j {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, zp = class extends j {
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
}, Yp = class extends j {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Es = class extends j {
  constructor() {
    super(...arguments), this.clientSecrets = new Yp(this._client), this.calls = new zp(this._client);
  }
};
Es.ClientSecrets = Yp;
Es.Calls = zp;
function U_(e, t) {
  return !t || !B_(t) ? {
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
  } : Xp(e, t);
}
function Xp(e, t) {
  const n = e.output.map((i) => {
    if (i.type === "function_call") return {
      ...i,
      parsed_arguments: q_(t, i)
    };
    if (i.type === "message") {
      const o = i.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: F_(t, s.text)
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
function F_(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function B_(e) {
  return !!Wl(e.text?.format);
}
function O_(e) {
  return e?.$brand === "auto-parseable-tool";
}
function G_(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function q_(e, t) {
  const n = G_(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: O_(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Ja(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Un, qi, Ht, Vi, Uc, Fc, Bc, Oc, V_ = class Qp extends zl {
  constructor(t) {
    super(), Un.add(this), qi.set(this, void 0), Ht.set(this, void 0), Vi.set(this, void 0), re(this, qi, t, "f");
  }
  static createResponse(t, n, r) {
    const i = new Qp(n);
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
    i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort())), M(this, Un, "m", Uc).call(this);
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
    for await (const u of o) M(this, Un, "m", Fc).call(this, u, s);
    if (o.controller.signal?.aborted) throw new ft();
    return M(this, Un, "m", Bc).call(this);
  }
  [(qi = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Vi = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakSet(), Uc = function() {
    this.ended || re(this, Ht, void 0, "f");
  }, Fc = function(n, r) {
    if (this.ended) return;
    const i = (s, u) => {
      (r == null || u.sequence_number > r) && this._emit(s, u);
    }, o = M(this, Un, "m", Oc).call(this, n);
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
  }, Bc = function() {
    if (this.ended) throw new te("stream has ended, this shouldn't happen");
    const n = M(this, Ht, "f");
    if (!n) throw new te("request ended without sending any events");
    re(this, Ht, void 0, "f");
    const r = H_(n, M(this, qi, "f"));
    return re(this, Vi, r, "f"), r;
  }, Oc = function(n) {
    let r = M(this, Ht, "f");
    if (!r) {
      if (n.type !== "response.created") throw new te(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = re(this, Ht, n.response, "f"), r;
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
        re(this, Ht, n.response, "f");
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
    const t = M(this, Vi, "f");
    if (!t) throw new te("stream ended without producing a ChatCompletion");
    return t;
  }
};
function H_(e, t) {
  return U_(e, t);
}
var Zp = class extends j {
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/responses/${e}/input_items`, Ce, {
      query: t,
      ...n
    });
  }
}, jp = class extends j {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Ts = class extends j {
  constructor() {
    super(...arguments), this.inputItems = new Zp(this._client), this.inputTokens = new jp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Ja(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(F`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && Ja(r), r));
  }
  delete(e, t) {
    return this._client.delete(F`/responses/${e}`, {
      ...t,
      headers: X([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Xp(n, e));
  }
  stream(e, t) {
    return V_.createResponse(this._client, e, t);
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
Ts.InputItems = Zp;
Ts.InputTokens = jp;
var em = class extends j {
  retrieve(e, t) {
    return this._client.get(F`/skills/${e}/content`, {
      ...t,
      headers: X([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, tm = class extends j {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(F`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: X([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, au = class extends j {
  constructor() {
    super(...arguments), this.content = new tm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(F`/skills/${e}/versions`, _s({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(F`/skills/${r}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(F`/skills/${e}/versions`, Ce, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(F`/skills/${r}/versions/${e}`, n);
  }
};
au.Content = tm;
var As = class extends j {
  constructor() {
    super(...arguments), this.content = new em(this._client), this.versions = new au(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", _s({
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
    return this._client.getAPIList("/skills", Ce, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/skills/${e}`, t);
  }
};
As.Content = em;
As.Versions = au;
var nm = class extends j {
  create(e, t, n) {
    return this._client.post(F`/uploads/${e}/parts`, Ct({
      body: t,
      ...n
    }, this._client));
  }
}, lu = class extends j {
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
lu.Parts = nm;
var K_ = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((i) => i.status === "rejected");
  if (n.length) {
    for (const i of n) console.error(i.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const i of t) i.status === "fulfilled" && r.push(i.value);
  return r;
}, rm = class extends j {
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
    return this._client.getAPIList(F`/vector_stores/${r}/file_batches/${e}/files`, Ce, {
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
          await bi(s);
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
    return await K_(Array(o).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, im = class extends j {
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
    return this._client.getAPIList(F`/vector_stores/${e}/files`, Ce, {
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
          await bi(s);
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
    return this._client.getAPIList(F`/vector_stores/${r}/files/${e}/content`, vs, {
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Cs = class extends j {
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
    return this._client.getAPIList("/vector_stores", Ce, {
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
    return this._client.getAPIList(F`/vector_stores/${e}/search`, vs, {
      body: t,
      method: "post",
      ...n,
      headers: X([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Cs.Files = im;
Cs.FileBatches = rm;
var om = class extends j {
  create(e, t) {
    return this._client.post("/videos", Ct({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(F`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", ui, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(F`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", Ct({
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
    return this._client.get(F`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(F`/videos/${e}/remix`, _s({
      body: t,
      ...n
    }, this._client));
  }
}, Wn, sm, Co, am = class extends j {
  constructor() {
    super(...arguments), Wn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    M(this, Wn, "m", sm).call(this, n);
    const i = X([t]).values, o = M(this, Wn, "m", Co).call(this, i, "webhook-signature"), s = M(this, Wn, "m", Co).call(this, i, "webhook-timestamp"), u = M(this, Wn, "m", Co).call(this, i, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new Fr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Fr("Webhook timestamp is too old");
    if (c > d + r) throw new Fr("Webhook timestamp is too new");
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
    throw new Fr("The given webhook signature does not match the expected signature");
  }
};
Wn = /* @__PURE__ */ new WeakSet(), sm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Co = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var za, uu, xo, lm, ta = "workload-identity-auth", de = class {
  constructor({ baseURL: e = $n("OPENAI_BASE_URL"), apiKey: t = $n("OPENAI_API_KEY"), organization: n = $n("OPENAI_ORG_ID") ?? null, project: r = $n("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = $n("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: o, ...s } = {}) {
    if (za.add(this), xo.set(this, void 0), this.completions = new Dp(this), this.chat = new Xl(this), this.embeddings = new Up(this), this.files = new Bp(this), this.images = new Kp(this), this.audio = new Si(this), this.moderations = new Jp(this), this.models = new Wp(this), this.fineTuning = new ar(this), this.graders = new su(this), this.vectorStores = new Cs(this), this.webhooks = new am(this), this.beta = new sr(this), this.batches = new Cp(this), this.uploads = new lu(this), this.responses = new Ts(this), this.realtime = new Es(this), this.conversations = new eu(this), this.evals = new nu(this), this.containers = new jl(this), this.skills = new As(this), this.videos = new om(this), o) {
      if (t && t !== ta) throw new te("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ta;
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
    if (!u.dangerouslyAllowBrowser && Fv()) throw new te(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? uu.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = Sc(u.logLevel, "ClientOptions.logLevel", this) ?? Sc($n("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Vh(), re(this, xo, Vv, "f"), this._options = u, o && (this._workloadIdentityAuth = new a_(o, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = r, this.webhookSecret = i;
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
    return Yv(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Hn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ph()}`;
  }
  makeStatusError(e, t, n, r) {
    return qe.generate(e, t, n, r);
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
    const r = !M(this, za, "m", lm).call(this) && n || this.baseURL, i = Dv(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!dc(o) || !dc(s)) && (t = {
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
    return new ep(this, this.makeRequest(e, t, void 0));
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
    if (Be(this).debug(`[${c}] sending request`, pn({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new ft();
    const f = new AbortController(), p = await this.fetchWithAuth(s, o, u, f).catch(ka), m = Date.now();
    if (p instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new ft();
      const v = Na(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Be(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), Be(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, pn({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Be(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Be(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, pn({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - h,
        message: p.message
      })), p instanceof Gh || p instanceof Nv ? p : v ? new ql() : new gs({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      if (p.status === 401 && this._workloadIdentityAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await mc(p.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(p);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await mc(p.body), Be(this).info(`${g} - ${E}`), Be(this).debug(`[${c}] response error (${E})`, pn({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      Be(this).info(`${g} - ${v}`);
      const b = await p.text().catch((E) => ka(E).message), _ = Uv(b), w = _ ? void 0 : b;
      throw Be(this).debug(`[${c}] response error (${v})`, pn({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, _, w, p.headers);
    }
    return Be(this).info(g), Be(this).debug(`[${c}] response start`, pn({
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
    return new i_(this, n, e);
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
    return await bi(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && $v("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const o = X([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...qv(),
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
      body: Kh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...M(this, xo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
uu = de, xo = /* @__PURE__ */ new WeakMap(), za = /* @__PURE__ */ new WeakSet(), lm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
de.OpenAI = uu;
de.DEFAULT_TIMEOUT = 6e5;
de.OpenAIError = te;
de.APIError = qe;
de.APIConnectionError = gs;
de.APIConnectionTimeoutError = ql;
de.APIUserAbortError = ft;
de.NotFoundError = Dh;
de.ConflictError = Lh;
de.RateLimitError = Uh;
de.BadRequestError = Mh;
de.AuthenticationError = Nh;
de.InternalServerError = Fh;
de.PermissionDeniedError = kh;
de.UnprocessableEntityError = $h;
de.InvalidWebhookSignatureError = Fr;
de.toFile = f_;
de.Completions = Dp;
de.Chat = Xl;
de.Embeddings = Up;
de.Files = Bp;
de.Images = Kp;
de.Audio = Si;
de.Moderations = Jp;
de.Models = Wp;
de.FineTuning = ar;
de.Graders = su;
de.VectorStores = Cs;
de.Webhooks = am;
de.Beta = sr;
de.Batches = Cp;
de.Uploads = lu;
de.Responses = Ts;
de.Realtime = Es;
de.Conversations = eu;
de.Evals = nu;
de.Containers = jl;
de.Skills = As;
de.Videos = om;
function W_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function yt(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function J_(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function na(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (yt(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function mn(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      yt(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => mn(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && yt(e, n, t.text), typeof t.content == "string" && yt(e, n, t.content), typeof t.reasoning_content == "string" && yt(e, n, t.reasoning_content), typeof t.thinking == "string" && yt(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        yt(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && yt(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function z_(e = {}, t = {}) {
  const n = [];
  return mn(n, e.reasoning_content, "推理文本"), mn(n, e.reasoning, "推理文本"), mn(n, e.reasoning_text, "推理文本"), mn(n, e.thinking, "思考块"), mn(n, t.reasoning_content, "推理文本"), mn(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        yt(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        yt(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && yt(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Gc(e = "") {
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
function qc(e) {
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
function Y_(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const r of e.messages || []) {
    if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
      const i = r.tool_calls.map((o, s) => {
        const u = o.function?.name || "", c = o.id || `tool-call-${s + 1}`;
        return u && t.set(c, u), `<tool_call>${JSON.stringify({
          id: c,
          name: u,
          arguments: W_(o.function?.arguments || "{}")
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
    content: qc(e)
  }) : n[0] = {
    ...n[0],
    content: qc({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function X_(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var Q_ = class {
  constructor(e) {
    this.config = e, this.client = new de({
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
      messages: t ? Y_(e) : e.messages,
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
        const E = w.choices?.[0], T = E?.delta || {};
        E?.finish_reason && (m = E.finish_reason), typeof T.content == "string" && (p.content += T.content), Array.isArray(T.tool_calls) && T.tool_calls.forEach((N) => {
          const A = Number(N.index ?? 0), k = p.toolCalls[A] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          p.toolCalls[A] = {
            ...k,
            id: N.id || k.id,
            type: N.type || k.type,
            function: {
              name: N.function?.name || k.function?.name || "",
              arguments: `${k.function?.arguments || ""}${N.function?.arguments || ""}`
            }
          };
        });
        const S = na(p.content);
        X_(e, {
          text: p.toolCalls.filter((N) => N?.function?.name).length ? S.cleaned : S.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: S.thoughts
        });
      }
      const y = p.toolCalls.map((w) => ({
        id: w.id || `openai-tool-${Date.now()}`,
        name: w.function?.name || "",
        arguments: w.function?.arguments || "{}"
      })).filter((w) => w.name), v = na(p.content), b = y.length ? [] : Gc(v.cleaned), _ = [...y, ...b];
      return {
        text: y.length ? v.cleaned : v.cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: _,
        thoughts: v.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const r = await this.client.chat.completions.create(n, { signal: e.signal }), i = r.choices?.[0] || {}, o = i.message || {}, s = z_(o, i), u = (o.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = na(J_(o.content));
    c.thoughts.forEach((f) => s.push(f));
    const d = u.length ? [] : Gc(c.cleaned), h = [...u, ...d];
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
function um(e, t) {
  return {
    type: "message",
    role: e,
    content: Z_(t)
  };
}
function zo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Z_(e) {
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
function Yo(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Vc(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Yo(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Yo(e, n.summary || "推理摘要", r.text);
    }
  });
}
function j_(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Vc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Vc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function eb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function tb(e) {
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
function nb(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const i = n.toLowerCase();
  return !i.includes("proxy error") || !i.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function rb(e) {
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
        n.content?.trim() && t.push(zo(n.content)), n.tool_calls.forEach((r, i) => {
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
        t.push(zo(n.content || ""));
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
      n.content?.trim() && t.push(zo(n.content)), n.tool_calls.forEach((r, i) => {
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
      t.push(zo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? um(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function ob(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function sb(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function ab(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ra(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [i = "0", o = "0"] = String(t || "").split(":");
  return Number(n) - Number(i) || Number(r) - Number(o);
}
var lb = class {
  constructor(e) {
    this.config = e, this.client = new de({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = nb(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: j_(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: tb(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : eb(e) || void 0,
        input: c ? ib(e) : rb(e),
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
        Array.from(p.entries()).sort(([v], [b]) => ra(v, b)).forEach(([, v]) => Yo(y, "推理文本", v)), Array.from(m.entries()).sort(([v], [b]) => ra(v, b)).forEach(([, v]) => Yo(y, "推理摘要", v)), ab(e, {
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
    }, o = !ob(this.config.baseUrl);
    let s, u;
    try {
      s = typeof e.onStreamProgress == "function" ? await i(!1) : await r(!1), u = t(s), o && !u.text && !u.toolCalls.length && (s = typeof e.onStreamProgress == "function" ? await i(!0) : await r(!0), u = t(s));
    } catch (c) {
      if (!o || !sb(c)) throw c;
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
function W(e, t, n, r, i) {
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
function ci(e) {
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
}, se = class extends Error {
}, ut = class Xa extends se {
  constructor(t, n, r, i, o) {
    super(`${Xa.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("request-id"), this.error = n, this.type = o ?? null;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new xs({
      message: r,
      cause: Ya(n)
    });
    const o = n, s = o?.error?.type;
    return t === 400 ? new fm(t, o, r, i, s) : t === 401 ? new hm(t, o, r, i, s) : t === 403 ? new pm(t, o, r, i, s) : t === 404 ? new mm(t, o, r, i, s) : t === 409 ? new gm(t, o, r, i, s) : t === 422 ? new ym(t, o, r, i, s) : t === 429 ? new vm(t, o, r, i, s) : t >= 500 ? new _m(t, o, r, i, s) : new Xa(t, o, r, i, s);
  }
}, _t = class extends ut {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, xs = class extends ut {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, dm = class extends xs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, fm = class extends ut {
}, hm = class extends ut {
}, pm = class extends ut {
}, mm = class extends ut {
}, gm = class extends ut {
}, ym = class extends ut {
}, vm = class extends ut {
}, _m = class extends ut {
}, ub = /^[a-z][a-z0-9+.-]*:/i, cb = (e) => ub.test(e), Qa = (e) => (Qa = Array.isArray, Qa(e)), Hc = Qa;
function Za(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Kc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function db(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var fb = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new se(`${e} must be an integer`);
  if (t < 0) throw new se(`${e} must be a positive integer`);
  return t;
}, bm = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, hb = (e) => new Promise((t) => setTimeout(t, e)), Jn = "0.89.0", pb = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function mb() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var gb = () => {
  const e = mb();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jn,
    "X-Stainless-OS": Jc(Deno.build.os),
    "X-Stainless-Arch": Wc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jn,
    "X-Stainless-OS": Jc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Wc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = yb();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function yb() {
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
var Wc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Jc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), zc, vb = () => zc ?? (zc = gb());
function _b() {
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
async function bb(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var wb = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Sb(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new se(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Eb(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var Yc;
function du(e) {
  let t;
  return (Yc ?? (t = new globalThis.TextEncoder(), Yc = t.encode.bind(t)))(e);
}
var Xc;
function Qc(e) {
  let t;
  return (Xc ?? (t = new globalThis.TextDecoder(), Xc = t.decode.bind(t)))(e);
}
var rt, it, Ei = class {
  constructor() {
    rt.set(this, void 0), it.set(this, void 0), W(this, rt, new Uint8Array(), "f"), W(this, it, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? du(e) : e;
    W(this, rt, Eb([I(this, rt, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Tb(I(this, rt, "f"), I(this, it, "f"))) != null; ) {
      if (r.carriage && I(this, it, "f") == null) {
        W(this, it, r.index, "f");
        continue;
      }
      if (I(this, it, "f") != null && (r.index !== I(this, it, "f") + 1 || r.carriage)) {
        n.push(Qc(I(this, rt, "f").subarray(0, I(this, it, "f") - 1))), W(this, rt, I(this, rt, "f").subarray(I(this, it, "f")), "f"), W(this, it, null, "f");
        continue;
      }
      const i = I(this, it, "f") !== null ? r.preceding - 1 : r.preceding, o = Qc(I(this, rt, "f").subarray(0, i));
      n.push(o), W(this, rt, I(this, rt, "f").subarray(r.index), "f"), W(this, it, null, "f");
    }
    return n;
  }
  flush() {
    return I(this, rt, "f").length ? this.decode(`
`) : [];
  }
};
rt = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap();
Ei.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ei.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Tb(e, t) {
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
function Ab(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Xo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Zc = (e, t, n) => {
  if (e) {
    if (db(Xo, e)) return e;
    Ke(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Xo))}`);
  }
};
function zr() {
}
function Hi(e, t, n) {
  return !t || Xo[e] > Xo[n] ? zr : t[e].bind(t);
}
var Cb = {
  error: zr,
  warn: zr,
  info: zr,
  debug: zr
}, jc = /* @__PURE__ */ new WeakMap();
function Ke(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Cb;
  const r = jc.get(t);
  if (r && r[0] === n) return r[1];
  const i = {
    error: Hi("error", t, n),
    warn: Hi("warn", t, n),
    info: Hi("info", t, n),
    debug: Hi("debug", t, n)
  };
  return jc.set(t, [n, i]), i;
}
var gn = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), _r, di = class Yr {
  constructor(t, n, r) {
    this.iterator = t, _r.set(this, void 0), this.controller = n, W(this, _r, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? Ke(r) : console;
    async function* s() {
      if (i) throw new se("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
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
            const d = bm(c.data) ?? c.data, h = d?.error?.type;
            throw new ut(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (ci(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Yr(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    async function* o() {
      const u = new Ei(), c = cu(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (i) throw new se("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let u = !1;
      try {
        for await (const c of o())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (ci(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Yr(s, n, r);
  }
  [(_r = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Yr(() => i(t), this.controller, I(this, _r, "f")), new Yr(() => i(n), this.controller, I(this, _r, "f"))];
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
async function* xb(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new se("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new se("Attempted to iterate over a response with no body");
  const n = new Rb(), r = new Ei(), i = cu(e.body);
  for await (const o of Ib(i)) for (const s of r.decode(o)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const o of r.flush()) {
    const s = n.decode(o);
    s && (yield s);
  }
}
async function* Ib(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? du(n) : n;
    let i = new Uint8Array(t.length + r.length);
    i.set(t), i.set(r, t.length), t = i;
    let o;
    for (; (o = Ab(t)) !== -1; )
      yield t.slice(0, o), t = t.slice(o);
  }
  t.length > 0 && (yield t);
}
var Rb = class {
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
    let [t, n, r] = Pb(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Pb(e, t) {
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
      return Ke(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : di.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Tm(await n.json(), n) : await n.text();
  })();
  return Ke(e).debug(`[${r}] response parsed`, gn({
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
var Xr, Am = class Cm extends Promise {
  constructor(t, n, r = Em) {
    super((i) => {
      i(null);
    }), this.responsePromise = n, this.parseResponse = r, Xr.set(this, void 0), W(this, Xr, t, "f");
  }
  _thenUnwrap(t) {
    return new Cm(I(this, Xr, "f"), this.responsePromise, async (n, r) => Tm(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(I(this, Xr, "f"), t))), this.parsedPromise;
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
Xr = /* @__PURE__ */ new WeakMap();
var Ki, xm = class {
  constructor(e, t, n, r) {
    Ki.set(this, void 0), W(this, Ki, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new se("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await I(this, Ki, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Ki = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Mb = class extends Am {
  constructor(e, t, n) {
    super(e, t, async (r, i) => new n(r, i.response, await Em(r, i), i.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Ti = class extends xm {
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
}, It = class extends xm {
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
}, Im = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function er(e, t, n) {
  return Im(), new File(e, t ?? "unknown_file", n);
}
function Io(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Rm = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", fu = async (e, t, n = !0) => ({
  ...e,
  body: await kb(e.body, t, n)
}), ed = /* @__PURE__ */ new WeakMap();
function Nb(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ed.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const i = "Response" in t ? t.Response : (await t("data:,")).constructor, o = new FormData();
      return o.toString() !== await new i(o).text();
    } catch {
      return !0;
    }
  })();
  return ed.set(t, r), r;
}
var kb = async (e, t, n = !0) => {
  if (!await Nb(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([i, o]) => ja(r, i, o, n))), r;
}, Db = (e) => e instanceof Blob && "name" in e, ja = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let i = {};
      const o = n.headers.get("Content-Type");
      o && (i = { type: o }), e.append(t, er([await n.blob()], Io(n, r), i));
    } else if (Rm(n)) e.append(t, er([await new Response(Sm(n)).blob()], Io(n, r)));
    else if (Db(n)) e.append(t, er([n], Io(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((i) => ja(e, t + "[]", i, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([i, o]) => ja(e, `${t}[${i}]`, o, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Pm = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Lb = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Pm(e), $b = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ub(e, t, n) {
  if (Im(), e = await e, t || (t = Io(e, !0)), Lb(e))
    return e instanceof File && t == null && n == null ? e : er([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if ($b(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), er(await el(i), t, n);
  }
  const r = await el(e);
  if (!n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = {
      ...n,
      type: i
    });
  }
  return er(r, t, n);
}
async function el(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Pm(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Rm(e)) for await (const n of e) t.push(...await el(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Fb(e)}`);
  }
  return t;
}
function Fb(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ke = class {
  constructor(e) {
    this._client = e;
  }
}, Mm = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Bb(e) {
  if (!e) return;
  if (Mm in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Hc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = Hc(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var V = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of Bb(r)) {
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
var td = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Ob = (e = Nm) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (i = !0);
    const m = r[p];
    let g = (i ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? td) ?? td)?.toString) && (g = m + "", o.push({
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
    throw new se(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, oe = /* @__PURE__ */ Ob(Nm), km = class extends ke {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/environments/${e}?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", It, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(oe`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ii = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Ro(e) {
  return typeof e == "object" && e !== null && ii in e;
}
function Dm(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Ro(r) && n.add(r[ii]);
  if (t) {
    for (const r of t)
      if (Ro(r) && n.add(r[ii]), Array.isArray(r.content))
        for (const i of r.content) Ro(i) && n.add(i[ii]);
  }
  return Array.from(n);
}
function Lm(e, t) {
  const n = Dm(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Gb(e) {
  return Ro(e) ? { "x-stainless-helper": e[ii] } : {};
}
var $m = class extends ke {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files", Ti, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/files/${e}`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/files/${e}/content`, {
      ...n,
      headers: V([{
        "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/files/${e}`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files", fu({
      body: r,
      ...t,
      headers: V([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Gb(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Um = class extends ke {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/models/${e}?beta=true`, {
      ...n,
      headers: V([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Ti, {
      query: r,
      ...t,
      headers: V([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Fm = class extends ke {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(oe`/v1/agents/${e}/versions?beta=true`, It, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, hu = class extends ke {
  constructor() {
    super(...arguments), this.versions = new Fm(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.get(oe`/v1/agents/${e}?beta=true`, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/agents/${e}?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", It, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(oe`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
hu.Versions = Fm;
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
function nd(e, t, n) {
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
      const s = qb(t, o.text);
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
function qb(e, t) {
  const n = Om(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new se(`Failed to parse structured output: ${r}`);
  }
}
var Vb = (e) => {
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
}, zn = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), zn(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), zn(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), zn(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), zn(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), zn(e);
  }
  return e;
}, Hb = (e) => {
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
}, Kb = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, qm = (e) => JSON.parse(Kb(Hb(zn(Vb(e))))), ct, Kt, Fn, br, Wi, wr, Sr, Ji, Er, Mt, Tr, zi, Yi, dn, Xi, Qi, Ar, ia, rd, Zi, oa, sa, aa, id, od = "__json_buf";
function sd(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Wb = class tl {
  constructor(t, n) {
    ct.add(this), this.messages = [], this.receivedMessages = [], Kt.set(this, void 0), Fn.set(this, null), this.controller = new AbortController(), br.set(this, void 0), Wi.set(this, () => {
    }), wr.set(this, () => {
    }), Sr.set(this, void 0), Ji.set(this, () => {
    }), Er.set(this, () => {
    }), Mt.set(this, {}), Tr.set(this, !1), zi.set(this, !1), Yi.set(this, !1), dn.set(this, !1), Xi.set(this, void 0), Qi.set(this, void 0), Ar.set(this, void 0), Zi.set(this, (r) => {
      if (W(this, zi, !0, "f"), ci(r) && (r = new _t()), r instanceof _t)
        return W(this, Yi, !0, "f"), this._emit("abort", r);
      if (r instanceof se) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new se(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new se(String(r)));
    }), W(this, br, new Promise((r, i) => {
      W(this, Wi, r, "f"), W(this, wr, i, "f");
    }), "f"), W(this, Sr, new Promise((r, i) => {
      W(this, Ji, r, "f"), W(this, Er, i, "f");
    }), "f"), I(this, br, "f").catch(() => {
    }), I(this, Sr, "f").catch(() => {
    }), W(this, Fn, t, "f"), W(this, Ar, n?.logger ?? console, "f");
  }
  get response() {
    return I(this, Xi, "f");
  }
  get request_id() {
    return I(this, Qi, "f");
  }
  async withResponse() {
    W(this, dn, !0, "f");
    const t = await I(this, br, "f");
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
    return W(o, Fn, {
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
    }, I(this, Zi, "f"));
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
      I(this, ct, "m", oa).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) I(this, ct, "m", sa).call(this, c);
      if (u.controller.signal?.aborted) throw new _t();
      I(this, ct, "m", aa).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (W(this, Xi, t, "f"), W(this, Qi, t?.headers.get("request-id"), "f"), I(this, Wi, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return I(this, Tr, "f");
  }
  get errored() {
    return I(this, zi, "f");
  }
  get aborted() {
    return I(this, Yi, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (I(this, Mt, "f")[t] || (I(this, Mt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = I(this, Mt, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (I(this, Mt, "f")[t] || (I(this, Mt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      W(this, dn, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    W(this, dn, !0, "f"), await I(this, Sr, "f");
  }
  get currentMessage() {
    return I(this, Kt, "f");
  }
  async finalMessage() {
    return await this.done(), I(this, ct, "m", ia).call(this);
  }
  async finalText() {
    return await this.done(), I(this, ct, "m", rd).call(this);
  }
  _emit(t, ...n) {
    if (I(this, Tr, "f")) return;
    t === "end" && (W(this, Tr, !0, "f"), I(this, Ji, "f").call(this));
    const r = I(this, Mt, "f")[t];
    if (r && (I(this, Mt, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !I(this, dn, "f") && !r?.length && Promise.reject(i), I(this, wr, "f").call(this, i), I(this, Er, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !I(this, dn, "f") && !r?.length && Promise.reject(i), I(this, wr, "f").call(this, i), I(this, Er, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", I(this, ct, "m", ia).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      I(this, ct, "m", oa).call(this), this._connected(null);
      const o = di.fromReadableStream(t, this.controller);
      for await (const s of o) I(this, ct, "m", sa).call(this, s);
      if (o.controller.signal?.aborted) throw new _t();
      I(this, ct, "m", aa).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(Kt = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), Xi = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), Zi = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakSet(), ia = function() {
    if (this.receivedMessages.length === 0) throw new se("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, rd = function() {
    if (this.receivedMessages.length === 0) throw new se("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new se("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, oa = function() {
    this.ended || W(this, Kt, void 0, "f");
  }, sa = function(n) {
    if (this.ended) return;
    const r = I(this, ct, "m", id).call(this, n);
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
            sd(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(r), this._addMessage(nd(r, I(this, Fn, "f"), { logger: I(this, Ar, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        W(this, Kt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, aa = function() {
    if (this.ended) throw new se("stream has ended, this shouldn't happen");
    const n = I(this, Kt, "f");
    if (!n) throw new se("request ended without sending any chunks");
    return W(this, Kt, void 0, "f"), nd(n, I(this, Fn, "f"), { logger: I(this, Ar, "f") });
  }, id = function(n) {
    let r = I(this, Kt, "f");
    if (n.type === "message_start") {
      if (r) throw new se(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new se(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (i && sd(i)) {
              let o = i[od] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              if (Object.defineProperty(s, od, {
                value: o,
                enumerable: !1,
                writable: !0
              }), o) try {
                s.input = qm(o);
              } catch (u) {
                const c = new se(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${o}`);
                I(this, Zi, "f").call(this, c);
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
    return new di(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Vm = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Jb = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Cr, Bn, fn, Me, Ye, et, Lt, Wt, xr, ad, nl;
function ld() {
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
    Cr.add(this), this.client = e, Bn.set(this, !1), fn.set(this, !1), Me.set(this, void 0), Ye.set(this, void 0), et.set(this, void 0), Lt.set(this, void 0), Wt.set(this, void 0), xr.set(this, 0), W(this, Me, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Dm(t.tools, t.messages)].join(", ");
    W(this, Ye, {
      ...n,
      headers: V([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), W(this, Wt, ld(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Bn = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakSet(), ad = async function() {
    const t = I(this, Me, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (I(this, et, "f") !== void 0) try {
      const c = await I(this, et, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const i = t.model ?? I(this, Me, "f").params.model, o = t.summaryPrompt ?? Jb, s = I(this, Me, "f").params.messages;
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
      max_tokens: I(this, Me, "f").params.max_tokens
    }, {
      signal: I(this, Ye, "f").signal,
      headers: V([I(this, Ye, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new se("Expected text response for compaction");
    return I(this, Me, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (I(this, Bn, "f")) throw new se("Cannot iterate over a consumed stream");
    W(this, Bn, !0, "f"), W(this, fn, !0, "f"), W(this, Lt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (I(this, Me, "f").params.max_iterations && I(this, xr, "f") >= I(this, Me, "f").params.max_iterations) break;
          W(this, fn, !1, "f"), W(this, Lt, void 0, "f"), W(this, xr, (e = I(this, xr, "f"), e++, e), "f"), W(this, et, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...i } = I(this, Me, "f").params;
          if (i.stream ? (t = this.client.beta.messages.stream({ ...i }, I(this, Ye, "f")), W(this, et, t.finalMessage(), "f"), I(this, et, "f").catch(() => {
          }), yield t) : (W(this, et, this.client.beta.messages.create({
            ...i,
            stream: !1
          }, I(this, Ye, "f")), "f"), yield I(this, et, "f")), !await I(this, Cr, "m", ad).call(this)) {
            if (!I(this, fn, "f")) {
              const { role: s, content: u } = await I(this, et, "f");
              I(this, Me, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const o = await I(this, Cr, "m", nl).call(this, I(this, Me, "f").params.messages.at(-1));
            if (o) I(this, Me, "f").params.messages.push(o);
            else if (!I(this, fn, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!I(this, et, "f")) throw new se("ToolRunner concluded without a message from the server");
      I(this, Wt, "f").resolve(await I(this, et, "f"));
    } catch (t) {
      throw W(this, Bn, !1, "f"), I(this, Wt, "f").promise.catch(() => {
      }), I(this, Wt, "f").reject(t), W(this, Wt, ld(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? I(this, Me, "f").params = e(I(this, Me, "f").params) : I(this, Me, "f").params = e, W(this, fn, !0, "f"), W(this, Lt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? W(this, Ye, e(I(this, Ye, "f")), "f") : W(this, Ye, {
      ...I(this, Ye, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = I(this, Ye, "f").signal) {
    const t = await I(this, et, "f") ?? this.params.messages.at(-1);
    return t ? I(this, Cr, "m", nl).call(this, t, e) : null;
  }
  done() {
    return I(this, Wt, "f").promise;
  }
  async runUntilDone() {
    if (!I(this, Bn, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return I(this, Me, "f").params;
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
nl = async function(t, n = I(this, Ye, "f").signal) {
  return I(this, Lt, "f") !== void 0 ? I(this, Lt, "f") : (W(this, Lt, zb(I(this, Me, "f").params, t, {
    ...I(this, Ye, "f"),
    signal: n
  }), "f"), I(this, Lt, "f"));
};
async function zb(e, t = e.messages.at(-1), n) {
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
    const t = new Ei();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new se("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new se("Attempted to iterate over a response with no body");
    return new Wm(cu(t.body), n);
  }
}, Jm = class extends ke {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Ti, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(oe`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new se(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: i } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: V([{
        "anthropic-beta": [...i ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => Km.fromResponse(s.response, s.controller));
  }
}, ud = {
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
}, Yb = ["claude-opus-4-6"], Ai = class extends ke {
  constructor() {
    super(...arguments), this.batches = new Jm(this._client);
  }
  create(e, t) {
    const n = cd(e), { betas: r, ...i } = n;
    i.model in ud && console.warn(`The model '${i.model}' is deprecated and will reach end-of-life on ${ud[i.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), i.model in Yb && i.thinking && i.thinking.type === "enabled" && console.warn(`Using Claude with ${i.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
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
      headers: V([
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
      headers: V([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Gm(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Wb.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = cd(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Hm(this._client, e, t);
  }
};
function cd(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new se("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Ai.Batches = Jm;
Ai.BetaToolRunner = Hm;
Ai.ToolError = Vm;
var zm = class extends ke {
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(oe`/v1/sessions/${e}/events?beta=true`, It, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/sessions/${e}/events?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Ym = class extends ke {
  retrieve(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.get(oe`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: i, ...o } = t;
    return this._client.post(oe`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: o,
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(oe`/v1/sessions/${e}/resources?beta=true`, It, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: i } = t;
    return this._client.delete(oe`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/sessions/${e}/resources?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Is = class extends ke {
  constructor() {
    super(...arguments), this.events = new zm(this._client), this.resources = new Ym(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/sessions/${e}?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", It, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(oe`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Is.Events = zm;
Is.Resources = Ym;
var Xm = class extends ke {
  create(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.post(oe`/v1/skills/${e}/versions?beta=true`, fu({
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.get(oe`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(oe`/v1/skills/${e}/versions?beta=true`, It, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: i } = t;
    return this._client.delete(oe`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, pu = class extends ke {
  constructor() {
    super(...arguments), this.versions = new Xm(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", fu({
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", It, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
pu.Versions = Xm;
var Qm = class extends ke {
  create(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/vaults/${e}/credentials?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.get(oe`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: i, ...o } = t;
    return this._client.post(oe`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: o,
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...i } = t ?? {};
    return this._client.getAPIList(oe`/v1/vaults/${e}/credentials?beta=true`, It, {
      query: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.delete(oe`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: i } = t;
    return this._client.post(oe`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, mu = class extends ke {
  constructor() {
    super(...arguments), this.credentials = new Qm(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...i } = t;
    return this._client.post(oe`/v1/vaults/${e}?beta=true`, {
      body: i,
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", It, {
      query: r,
      ...t,
      headers: V([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(oe`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(oe`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: V([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
mu.Credentials = Qm;
var Rt = class extends ke {
  constructor() {
    super(...arguments), this.models = new Um(this._client), this.messages = new Ai(this._client), this.agents = new hu(this._client), this.environments = new km(this._client), this.sessions = new Is(this._client), this.vaults = new mu(this._client), this.files = new $m(this._client), this.skills = new pu(this._client);
  }
};
Rt.Models = Um;
Rt.Messages = Ai;
Rt.Agents = hu;
Rt.Environments = km;
Rt.Sessions = Is;
Rt.Vaults = mu;
Rt.Files = $m;
Rt.Skills = pu;
var Zm = class extends ke {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: V([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function jm(e) {
  return e?.output_config?.format;
}
function dd(e, t, n) {
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
      const s = Xb(t, o.text);
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
function Xb(e, t) {
  const n = jm(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new se(`Failed to parse structured output: ${r}`);
  }
}
var dt, Jt, On, Ir, ji, Rr, Pr, eo, Mr, Nt, Nr, to, no, hn, ro, io, kr, la, fd, ua, ca, da, fa, hd, pd = "__json_buf";
function md(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Qb = class rl {
  constructor(t, n) {
    dt.add(this), this.messages = [], this.receivedMessages = [], Jt.set(this, void 0), On.set(this, null), this.controller = new AbortController(), Ir.set(this, void 0), ji.set(this, () => {
    }), Rr.set(this, () => {
    }), Pr.set(this, void 0), eo.set(this, () => {
    }), Mr.set(this, () => {
    }), Nt.set(this, {}), Nr.set(this, !1), to.set(this, !1), no.set(this, !1), hn.set(this, !1), ro.set(this, void 0), io.set(this, void 0), kr.set(this, void 0), ua.set(this, (r) => {
      if (W(this, to, !0, "f"), ci(r) && (r = new _t()), r instanceof _t)
        return W(this, no, !0, "f"), this._emit("abort", r);
      if (r instanceof se) return this._emit("error", r);
      if (r instanceof Error) {
        const i = new se(r.message);
        return i.cause = r, this._emit("error", i);
      }
      return this._emit("error", new se(String(r)));
    }), W(this, Ir, new Promise((r, i) => {
      W(this, ji, r, "f"), W(this, Rr, i, "f");
    }), "f"), W(this, Pr, new Promise((r, i) => {
      W(this, eo, r, "f"), W(this, Mr, i, "f");
    }), "f"), I(this, Ir, "f").catch(() => {
    }), I(this, Pr, "f").catch(() => {
    }), W(this, On, t, "f"), W(this, kr, n?.logger ?? console, "f");
  }
  get response() {
    return I(this, ro, "f");
  }
  get request_id() {
    return I(this, io, "f");
  }
  async withResponse() {
    W(this, hn, !0, "f");
    const t = await I(this, Ir, "f");
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
    return W(o, On, {
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
    }, I(this, ua, "f"));
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
      I(this, dt, "m", ca).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) I(this, dt, "m", da).call(this, c);
      if (u.controller.signal?.aborted) throw new _t();
      I(this, dt, "m", fa).call(this);
    } finally {
      i && o && i.removeEventListener("abort", o);
    }
  }
  _connected(t) {
    this.ended || (W(this, ro, t, "f"), W(this, io, t?.headers.get("request-id"), "f"), I(this, ji, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return I(this, Nr, "f");
  }
  get errored() {
    return I(this, to, "f");
  }
  get aborted() {
    return I(this, no, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (I(this, Nt, "f")[t] || (I(this, Nt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = I(this, Nt, "f")[t];
    if (!r) return this;
    const i = r.findIndex((o) => o.listener === n);
    return i >= 0 && r.splice(i, 1), this;
  }
  once(t, n) {
    return (I(this, Nt, "f")[t] || (I(this, Nt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      W(this, hn, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    W(this, hn, !0, "f"), await I(this, Pr, "f");
  }
  get currentMessage() {
    return I(this, Jt, "f");
  }
  async finalMessage() {
    return await this.done(), I(this, dt, "m", la).call(this);
  }
  async finalText() {
    return await this.done(), I(this, dt, "m", fd).call(this);
  }
  _emit(t, ...n) {
    if (I(this, Nr, "f")) return;
    t === "end" && (W(this, Nr, !0, "f"), I(this, eo, "f").call(this));
    const r = I(this, Nt, "f")[t];
    if (r && (I(this, Nt, "f")[t] = r.filter((i) => !i.once), r.forEach(({ listener: i }) => i(...n))), t === "abort") {
      const i = n[0];
      !I(this, hn, "f") && !r?.length && Promise.reject(i), I(this, Rr, "f").call(this, i), I(this, Mr, "f").call(this, i), this._emit("end");
      return;
    }
    if (t === "error") {
      const i = n[0];
      !I(this, hn, "f") && !r?.length && Promise.reject(i), I(this, Rr, "f").call(this, i), I(this, Mr, "f").call(this, i), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", I(this, dt, "m", la).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      I(this, dt, "m", ca).call(this), this._connected(null);
      const o = di.fromReadableStream(t, this.controller);
      for await (const s of o) I(this, dt, "m", da).call(this, s);
      if (o.controller.signal?.aborted) throw new _t();
      I(this, dt, "m", fa).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  [(Jt = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), Pr = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), Mr = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap(), io = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakSet(), la = function() {
    if (this.receivedMessages.length === 0) throw new se("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, fd = function() {
    if (this.receivedMessages.length === 0) throw new se("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new se("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ca = function() {
    this.ended || W(this, Jt, void 0, "f");
  }, da = function(n) {
    if (this.ended) return;
    const r = I(this, dt, "m", hd).call(this, n);
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
            md(i) && i.input && this._emit("inputJson", n.delta.partial_json, i.input);
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
        this._addMessageParam(r), this._addMessage(dd(r, I(this, On, "f"), { logger: I(this, kr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        W(this, Jt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, fa = function() {
    if (this.ended) throw new se("stream has ended, this shouldn't happen");
    const n = I(this, Jt, "f");
    if (!n) throw new se("request ended without sending any chunks");
    return W(this, Jt, void 0, "f"), dd(n, I(this, On, "f"), { logger: I(this, kr, "f") });
  }, hd = function(n) {
    let r = I(this, Jt, "f");
    if (n.type === "message_start") {
      if (r) throw new se(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new se(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (i && md(i)) {
              let o = i[pd] || "";
              o += n.delta.partial_json;
              const s = { ...i };
              Object.defineProperty(s, pd, {
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
    return new di(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var tg = class extends ke {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(oe`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", Ti, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(oe`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(oe`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new se(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: V([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, i) => Km.fromResponse(i.response, i.controller));
  }
}, gu = class extends ke {
  constructor() {
    super(...arguments), this.batches = new tg(this._client);
  }
  create(e, t) {
    e.model in gd && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${gd[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in Zb && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
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
      headers: V([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => eg(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Qb.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, gd = {
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
}, Zb = ["claude-opus-4-6"];
gu.Batches = tg;
var ng = class extends ke {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(oe`/v1/models/${e}`, {
      ...n,
      headers: V([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Ti, {
      query: r,
      ...t,
      headers: V([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, oo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, il, yu, Po, rg, jb = "\\n\\nHuman:", ew = "\\n\\nAssistant:", Ie = class {
  constructor({ baseURL: e = oo("ANTHROPIC_BASE_URL"), apiKey: t = oo("ANTHROPIC_API_KEY") ?? null, authToken: n = oo("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    il.add(this), Po.set(this, void 0);
    const i = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!i.dangerouslyAllowBrowser && pb()) throw new se(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? yu.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const o = "warn";
    this.logLevel = o, this.logLevel = Zc(i.logLevel, "ClientOptions.logLevel", this) ?? Zc(oo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? o, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? _b(), W(this, Po, wb, "f"), this._options = i, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return V([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return V([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return V([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Sb(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Jn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${cm()}`;
  }
  makeStatusError(e, t, n, r) {
    return ut.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !I(this, il, "m", rg).call(this) && n || this.baseURL, i = cb(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery(), s = Object.fromEntries(i.searchParams);
    return (!Kc(o) || !Kc(s)) && (t = {
      ...s,
      ...o,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new se("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Ke(this).debug(`[${c}] sending request`, gn({
      retryOfRequestLogID: n,
      method: r.method,
      url: s,
      options: r,
      headers: o.headers
    })), r.signal?.aborted) throw new _t();
    const f = new AbortController(), p = await this.fetchWithTimeout(s, o, u, f).catch(Ya), m = Date.now();
    if (p instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new _t();
      const v = ci(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ke(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${y}`), Ke(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${y})`, gn({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ke(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ke(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, gn({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - h,
        message: p.message
      })), v ? new dm() : new xs({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([y]) => y === "request-id").map(([y, v]) => ", " + y + ": " + JSON.stringify(v)).join("")}] ${o.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const y = await this.shouldRetry(p);
      if (t && y) {
        const E = `retrying, ${t} attempts remaining`;
        return await bb(p.body), Ke(this).info(`${g} - ${E}`), Ke(this).debug(`[${c}] response error (${E})`, gn({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = y ? "error; no more retries left" : "error; not retryable";
      Ke(this).info(`${g} - ${v}`);
      const b = await p.text().catch((E) => Ya(E).message), _ = bm(b), w = _ ? void 0 : b;
      throw Ke(this).debug(`[${c}] response error (${v})`, gn({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, _, w, p.headers);
    }
    return Ke(this).info(g), Ke(this).debug(`[${c}] response start`, gn({
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
    return new Mb(this, n, e);
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
    return await hb(i), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const i = t - e;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new se("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: i, query: o, defaultBaseURL: s } = n, u = this.buildURL(i, o, s);
    "timeout" in n && fb("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const o = V([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...vb(),
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
    const n = V([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Sm(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : I(this, Po, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
yu = Ie, Po = /* @__PURE__ */ new WeakMap(), il = /* @__PURE__ */ new WeakSet(), rg = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Ie.Anthropic = yu;
Ie.HUMAN_PROMPT = jb;
Ie.AI_PROMPT = ew;
Ie.DEFAULT_TIMEOUT = 6e5;
Ie.AnthropicError = se;
Ie.APIError = ut;
Ie.APIConnectionError = xs;
Ie.APIConnectionTimeoutError = dm;
Ie.APIUserAbortError = _t;
Ie.NotFoundError = mm;
Ie.ConflictError = gm;
Ie.RateLimitError = vm;
Ie.BadRequestError = fm;
Ie.AuthenticationError = hm;
Ie.InternalServerError = _m;
Ie.PermissionDeniedError = pm;
Ie.UnprocessableEntityError = ym;
Ie.toFile = Ub;
var Ci = class extends Ie {
  constructor() {
    super(...arguments), this.completions = new Zm(this), this.messages = new gu(this), this.models = new ng(this), this.beta = new Rt(this);
  }
};
Ci.Completions = Zm;
Ci.Messages = gu;
Ci.Models = ng;
Ci.Beta = Rt;
function tw(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function nw(e = "") {
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
function rw(e) {
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
      const r = nw(n.image_url.url);
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
function iw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function ow(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && ig(t) || null;
}
function sw(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: ig(e.content) || [] } : void 0;
}
function aw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((r) => {
    (r.tool_calls || []).forEach((i) => {
      i.id && i.function?.name && n.set(i.id, i.function.name);
    });
  });
  for (const r of e)
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const i = ow(r);
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
            input: tw(i.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: rw(r.content)
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
var lw = class {
  constructor(e) {
    this.config = e, this.client = new Ci({
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
    })), n = iw(e), r = {
      model: this.config.model,
      system: n,
      messages: aw(e.messages),
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
      providerPayload: sw(i)
    };
  }
}, uw = /* @__PURE__ */ ms(((e, t) => {
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
})), cw = /* @__PURE__ */ ms(((e) => {
  var t = uw();
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
})), dw = /* @__PURE__ */ ms(((e, t) => {
  t.exports = cw();
})), fw = /* @__PURE__ */ ms(((e, t) => {
  var n = dw(), r = [
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
})), yd = /* @__PURE__ */ Mv(fw(), 1), hw = void 0, pw = void 0;
function mw() {
  return {
    geminiUrl: hw,
    vertexUrl: pw
  };
}
function gw(e, t, n, r) {
  var i, o;
  if (!e?.baseUrl) {
    const s = mw();
    return t ? (i = s.vertexUrl) !== null && i !== void 0 ? i : n : (o = s.geminiUrl) !== null && o !== void 0 ? o : r;
  }
  return e.baseUrl;
}
var Bt = class {
};
function q(e, t) {
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
function yw(e, t) {
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
function vw(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = a(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
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
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], ww(s)), t;
}
function bw(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], Sw(s)), t;
}
function ww(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
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
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Tw(s))), l(t, ["generatedVideos"], o);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(t, ["raiMediaFilteredReasons"], i), t;
}
function Ew(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], Pw(n)), t;
}
function Tw(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], Mw(n)), t;
}
function Aw(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Cw(e) {
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
  return s != null && l(t, ["response"], Rw(s)), t;
}
function Rw(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function Pw(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], vu(r));
  const i = a(e, ["encoding"]);
  return i != null && l(t, ["mimeType"], i), t;
}
function Mw(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], vu(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(t, ["mimeType"], i), t;
}
var vd;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(vd || (vd = {}));
var _d;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(_d || (_d = {}));
var bd;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(bd || (bd = {}));
var Xt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Xt || (Xt = {}));
var wd;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(wd || (wd = {}));
var Sd;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Sd || (Sd = {}));
var Ed;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Ed || (Ed = {}));
var Td;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Td || (Td = {}));
var Ad;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Ad || (Ad = {}));
var Cd;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Cd || (Cd = {}));
var xd;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(xd || (xd = {}));
var sl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(sl || (sl = {}));
var oi;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(oi || (oi = {}));
var Id;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Id || (Id = {}));
var Rd;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Rd || (Rd = {}));
var Pd;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Pd || (Pd = {}));
var Md;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Md || (Md = {}));
var Nd;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Nd || (Nd = {}));
var kd;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(kd || (kd = {}));
var Dd;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Dd || (Dd = {}));
var Ld;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Ld || (Ld = {}));
var $d;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})($d || ($d = {}));
var Ud;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ud || (Ud = {}));
var Fd;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Fd || (Fd = {}));
var Qo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Qo || (Qo = {}));
var Bd;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Bd || (Bd = {}));
var Od;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Od || (Od = {}));
var Gd;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Gd || (Gd = {}));
var qd;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(qd || (qd = {}));
var al;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(al || (al = {}));
var Vd;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Vd || (Vd = {}));
var Hd;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Hd || (Hd = {}));
var Kd;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Kd || (Kd = {}));
var Wd;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Wd || (Wd = {}));
var Jd;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Jd || (Jd = {}));
var zd;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(zd || (zd = {}));
var Yd;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Yd || (Yd = {}));
var ll;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ll || (ll = {}));
var Xd;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Xd || (Xd = {}));
var Qd;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Qd || (Qd = {}));
var Zo;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Zo || (Zo = {}));
var Zd;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Zd || (Zd = {}));
var jd;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(jd || (jd = {}));
var ef;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(ef || (ef = {}));
var tf;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(tf || (tf = {}));
var nf;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(nf || (nf = {}));
var rf;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(rf || (rf = {}));
var of;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(of || (of = {}));
var sf;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(sf || (sf = {}));
var af;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(af || (af = {}));
var lf;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(lf || (lf = {}));
var uf;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(uf || (uf = {}));
var cf;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(cf || (cf = {}));
var df;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(df || (df = {}));
var ff;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(ff || (ff = {}));
var hf;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(hf || (hf = {}));
var pf;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(pf || (pf = {}));
var mf;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(mf || (mf = {}));
var gf;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(gf || (gf = {}));
var yf;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(yf || (yf = {}));
var vf;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(vf || (vf = {}));
var _f;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(_f || (_f = {}));
var bf;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(bf || (bf = {}));
var wf;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(wf || (wf = {}));
var Qn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Qn || (Qn = {}));
var ul = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Dr = class {
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
}, Sf = class {
}, Ef = class {
}, Nw = class {
}, kw = class {
}, Dw = class {
}, Lw = class {
}, Tf = class {
}, Af = class {
}, Cf = class {
}, $w = class {
}, xf = class sg {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new sg();
    let i;
    const o = t;
    return n ? i = bw(o) : i = _w(o), Object.assign(r, i), r;
  }
}, If = class {
}, Rf = class {
}, Pf = class {
}, Mf = class {
}, Uw = class {
}, Fw = class {
}, Bw = class {
}, Ow = class ag {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new ag(), i = xw(t);
    return Object.assign(r, i), r;
  }
}, Gw = class {
}, qw = class {
}, Vw = class {
}, Hw = class {
}, Nf = class {
}, Kw = class {
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
}, Ww = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Jw = class lg {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new lg(), i = og(t);
    return Object.assign(r, i), r;
  }
};
function ge(e, t) {
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
  const n = ge(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function cg(e) {
  return Array.isArray(e) ? e.map((t) => jo(t)) : [jo(e)];
}
function jo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function dg(e) {
  const t = jo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function fg(e) {
  const t = jo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function kf(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function hg(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => kf(t)) : [kf(e)];
}
function cl(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Df(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Lf(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Ue(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return cl(e) ? e : {
    role: "user",
    parts: hg(e)
  };
}
function _u(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = Ue(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Ue(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Ue(n)) : [Ue(t)];
}
function Qe(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Df(e) || Lf(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Ue(e)];
  }
  const t = [], n = [], r = cl(e[0]);
  for (const i of e) {
    const o = cl(i);
    if (o != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (o) t.push(i);
    else {
      if (Df(i) || Lf(i)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(i);
    }
  }
  return r || t.push({
    role: "user",
    parts: hg(n)
  }), t;
}
function zw(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Xt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Xt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Xt).includes(r.toUpperCase()) ? r.toUpperCase() : Xt.TYPE_UNSPECIFIED });
  }
}
function tr(e) {
  const t = {}, n = ["items"], r = ["anyOf"], i = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const o = e.anyOf;
  o != null && o.length == 2 && (o[0].type === "null" ? (t.nullable = !0, e = o[1]) : o[1].type === "null" && (t.nullable = !0, e = o[0])), e.type instanceof Array && zw(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Xt).includes(u.toUpperCase()) ? u.toUpperCase() : Xt.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = tr(u);
      else if (r.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(tr(d));
        }
        t[s] = c;
      } else if (i.includes(s)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = tr(h);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function bu(e) {
  return tr(e);
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
function lr(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = tr(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = tr(t.response));
  return e;
}
function ur(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function Yw(e, t, n, r = 1) {
  const i = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : i ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : i ? `${n}/${t}` : t;
}
function Ot(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Yw(e, t, "cachedContents");
}
function pg(e) {
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
function ln(e) {
  return vu(e);
}
function Xw(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Qw(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Zw(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function mg(e) {
  var t;
  let n;
  if (Xw(e) && (n = e.name), !(Zw(e) && (n = e.uri, n === void 0)) && !(Qw(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
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
  ]) if (jw(e, t)) return e[t];
  return [];
}
function jw(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function eS(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function tS(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const o = i.name;
    if (r.has(o)) throw new Error(`Duplicate function name ${o} found in MCP tools. Please ensure function names are unique.`);
    r.add(o);
    const s = eS(i, t);
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
function nS(e) {
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
function cr(e, t) {
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
function rS(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function iS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function oS(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => BS(s))), l(t, ["inlinedResponses"], o);
  }
  const i = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], o);
  }
  return t;
}
function sS(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigqueryDestination", "outputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function aS(e) {
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
function Mo(e) {
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
  return d != null && l(t, ["dest"], oS(_g(d))), t;
}
function dl(e) {
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
  const h = a(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = a(e, ["inputConfig"]);
  f != null && l(t, ["src"], lS(f));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], sS(_g(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function lS(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = a(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const i = a(e, ["bigquerySource", "inputUri"]);
  return i != null && l(t, ["bigqueryUri"], i), t;
}
function uS(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = a(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const i = a(t, ["inlinedRequests"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => FS(e, s))), l(n, ["requests", "requests"], o);
  }
  return n;
}
function cS(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = a(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const i = a(e, ["bigqueryUri"]);
  if (i != null && l(t, ["bigquerySource", "inputUri"], i), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function dS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function fS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
}
function hS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
}
function pS(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = a(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], mS(r));
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
function mS(e) {
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
    Array.isArray(i) && (i = i.map((o) => WS(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function gS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const i = a(e, ["webhookConfig"]);
  return t !== void 0 && i != null && l(t, ["batch", "webhookConfig"], i), n;
}
function yS(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["dest"]);
  if (t !== void 0 && i != null && l(t, ["outputConfig"], aS(nS(i))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function $f(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], ge(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], uS(e, vg(e, i)));
  const o = a(t, ["config"]);
  return o != null && gS(o, n), n;
}
function vS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], ge(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["inputConfig"], cS(vg(e, i)));
  const o = a(t, ["config"]);
  return o != null && yS(o, n), n;
}
function _S(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function bS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["_url", "model"], ge(e, r));
  const i = a(t, ["src"]);
  i != null && l(n, ["batch", "inputConfig"], xS(e, i));
  const o = a(t, ["config"]);
  return o != null && _S(o, n), n;
}
function wS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
}
function SS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
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
function TS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["name"]);
  r != null && l(t, ["name"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function AS(e, t) {
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
  return i != null && (l(n, ["_self"], CS(i, n)), yw(n, { "requests[].*": "requests[].request.*" })), n;
}
function CS(e, t) {
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
  return i != null && l(n, ["requests"], AS(e, i)), n;
}
function IS(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function RS(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function PS(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function MS(e, t, n) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], wg(Ue(i)));
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
    let C = w;
    Array.isArray(C) && (C = C.map((R) => JS(R))), l(n, ["safetySettings"], C);
  }
  const E = a(t, ["tools"]);
  if (n !== void 0 && E != null) {
    let C = ur(E);
    Array.isArray(C) && (C = C.map((R) => YS(lr(R)))), l(n, ["tools"], C);
  }
  const T = a(t, ["toolConfig"]);
  if (n !== void 0 && T != null && l(n, ["toolConfig"], zS(T)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = a(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], Ot(e, S));
  const N = a(t, ["responseModalities"]);
  N != null && l(r, ["responseModalities"], N);
  const A = a(t, ["mediaResolution"]);
  A != null && l(r, ["mediaResolution"], A);
  const k = a(t, ["speechConfig"]);
  if (k != null && l(r, ["speechConfig"], wu(k)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const L = a(t, ["thinkingConfig"]);
  L != null && l(r, ["thinkingConfig"], L);
  const G = a(t, ["imageConfig"]);
  G != null && l(r, ["imageConfig"], US(G));
  const Z = a(t, ["enableEnhancedCivicAnswers"]);
  if (Z != null && l(r, ["enableEnhancedCivicAnswers"], Z), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const K = a(t, ["serviceTier"]);
  return n !== void 0 && K != null && l(n, ["serviceTier"], K), r;
}
function NS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => pS(h))), l(t, ["candidates"], d);
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
function kS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
}
function DS(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], cr(e, r)), n;
}
function LS(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], iS(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function $S(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function US(e) {
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
function FS(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["request", "model"], ge(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = Qe(i);
    Array.isArray(u) && (u = u.map((c) => wg(c))), l(n, ["request", "contents"], u);
  }
  const o = a(t, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], MS(e, s, a(n, ["request"], {}))), n;
}
function BS(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], NS(n));
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function OS(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  if (t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function GS(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const o = a(e, ["filter"]);
  return t !== void 0 && o != null && l(t, ["_query", "filter"], o), n;
}
function qS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && OS(n, t), t;
}
function VS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && GS(n, t), t;
}
function HS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const i = a(e, ["operations"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Mo(s))), l(t, ["batchJobs"], o);
  }
  return t;
}
function KS(e) {
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
function WS(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], IS(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], RS(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], dS(c));
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
function JS(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function zS(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], PS(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function YS(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], $S(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], LS(o));
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
var Dn = class {
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
}, XS = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dn(Ft.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = $f(this.apiClient, e), n = t._url, r = q("{model}:batchGenerateContent", n), i = t.batch.inputConfig.requests, o = i.requests, s = [];
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
      const c = vS(this.apiClient, e);
      return s = q("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    } else {
      const c = $f(this.apiClient, e);
      return s = q("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Mo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = bS(this.apiClient, e);
      return i = q("{model}:asyncBatchEmbedContent", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Mo(u));
    }
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DS(this.apiClient, e);
      return s = q("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => dl(d));
    } else {
      const c = kS(this.apiClient, e);
      return s = q("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => Mo(d));
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = hS(this.apiClient, e);
      o = q("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = fS(this.apiClient, e);
      o = q("batches/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = VS(e);
      return s = q("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = KS(d), f = new Nf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = qS(e);
      return s = q("batches", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = HS(d), f = new Nf();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SS(this.apiClient, e);
      return s = q("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => TS(d));
    } else {
      const c = wS(this.apiClient, e);
      return s = q("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => ES(d));
    }
  }
};
function QS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ZS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Uf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => w0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Ff(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => S0(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
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
    let h = Qe(s);
    Array.isArray(h) && (h = h.map((f) => Uf(f))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Uf(Ue(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => A0(f))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], E0(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function e0(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  t !== void 0 && i != null && l(t, ["expireTime"], i);
  const o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = Qe(s);
    Array.isArray(f) && (f = f.map((p) => Ff(p))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Ff(Ue(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => C0(p))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], T0(d));
  const h = a(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function t0(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], ug(e, r));
  const i = a(t, ["config"]);
  return i != null && jS(i, n), n;
}
function n0(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["model"], ug(e, r));
  const i = a(t, ["config"]);
  return i != null && e0(i, n), n;
}
function r0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function i0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function o0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function s0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function a0(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function l0(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function u0(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = a(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function c0(e) {
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
function d0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function f0(e, t) {
  const n = {}, r = a(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Ot(e, r)), n;
}
function h0(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], QS(n));
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
function m0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function g0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function y0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && m0(n, t), t;
}
function v0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && g0(n, t), t;
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
function w0(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], a0(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], l0(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ZS(c));
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
function S0(e) {
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
function E0(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], u0(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(t, ["includeServerSideToolInvocations"], i), t;
}
function T0(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function A0(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], p0(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], h0(o));
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
function C0(e) {
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
    Array.isArray(p) && (p = p.map((m) => c0(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
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
function I0(e, t) {
  const n = {}, r = a(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const i = a(e, ["expireTime"]);
  return t !== void 0 && i != null && l(t, ["expireTime"], i), n;
}
function R0(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], Ot(e, r));
  const i = a(t, ["config"]);
  return i != null && x0(i, n), n;
}
function P0(e, t) {
  const n = {}, r = a(t, ["name"]);
  r != null && l(n, ["_url", "name"], Ot(e, r));
  const i = a(t, ["config"]);
  return i != null && I0(i, n), n;
}
var M0 = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dn(Ft.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = n0(this.apiClient, e);
      return s = q("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = t0(this.apiClient, e);
      return s = q("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = f0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = d0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = i0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = s0(d), f = new Pf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = r0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = o0(d), f = new Pf();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = P0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => d);
    } else {
      const c = R0(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = v0(e);
      return s = q("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = b0(d), f = new Mf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = y0(e);
      return s = q("cachedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = _0(d), f = new Mf();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Qt(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function Bf(e) {
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
function ae(e) {
  return this instanceof ae ? (this.v = e, this) : new ae(e);
}
function bt(e, t, n) {
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
    m.value instanceof ae ? Promise.resolve(m.value.v).then(h, f) : p(o[0][2], m);
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
function wt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Bf == "function" ? Bf(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function N0(e) {
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
function k0(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Of(e) {
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
var D0 = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new L0(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, L0 = class {
  constructor(e, t, n, r = {}, i = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = i, this.sendPromise = Promise.resolve(), k0(i);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Ue(e.message), r = this.modelsModule.generateContent({
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
    const n = Ue(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? Of(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return bt(this, arguments, function* () {
      var r, i, o, s, u, c;
      const d = [];
      try {
        for (var h = !0, f = wt(e), p; p = yield ae(f.next()), r = p.done, !r; h = !0) {
          s = p.value, h = !1;
          const m = s;
          if (N0(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield ae(m);
        }
      } catch (m) {
        i = { error: m };
      } finally {
        try {
          !h && !r && (o = f.return) && (yield ae(o.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Of(n)) : this.history.push(e), this.history.push(...r);
  }
}, Eg = class Tg extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Tg.prototype);
  }
};
function $0(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function U0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function F0(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], mg(n)), t;
}
function B0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function O0(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], mg(n)), t;
}
function G0(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function q0(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function V0(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && q0(n, t), t;
}
function H0(e) {
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
function K0(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(t, ["files"], i);
  }
  return t;
}
var W0 = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dn(Ft.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const s = V0(e);
      return i = q("files", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
        const c = H0(u), d = new Gw();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = $0(e);
      return i = q("upload/v1beta/files", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = U0(u), d = new qw();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = O0(e);
      return i = q("files/{file}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
      const s = F0(e);
      return i = q("files/{file}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
        const c = B0(u), d = new Vw();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = G0(e);
      return i = q("files:register", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = K0(u), d = new Hw();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Gf(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function J0(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function No(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
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
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => fE(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function X0(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Q0(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Z0(e) {
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
function j0(e) {
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
  const T = a(e, ["thinkingConfig"]);
  T != null && l(t, ["thinkingConfig"], T);
  const S = a(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const N = a(e, ["topP"]);
  if (N != null && l(t, ["topP"], N), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function eE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], J0(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function tE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function nE(e, t) {
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], z0(Ue(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let A = ur(y);
    Array.isArray(A) && (A = A.map((k) => mE(lr(k)))), l(t, ["setup", "tools"], A);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], pE(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], Gf(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], Gf(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const T = a(e, ["proactivity"]);
  if (t !== void 0 && T != null && l(t, ["setup", "proactivity"], T), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const N = a(e, ["safetySettings"]);
  if (t !== void 0 && N != null) {
    let A = N;
    Array.isArray(A) && (A = A.map((k) => hE(k))), l(t, ["setup", "safetySettings"], A);
  }
  return n;
}
function rE(e, t) {
  const n = {}, r = a(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], j0(r));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Y0(Ue(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let k = ur(y);
    Array.isArray(k) && (k = k.map((L) => gE(lr(L)))), l(t, ["setup", "tools"], k);
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
  const N = a(e, ["avatarConfig"]);
  t !== void 0 && N != null && l(t, ["setup", "avatarConfig"], N);
  const A = a(e, ["safetySettings"]);
  if (t !== void 0 && A != null) {
    let k = A;
    Array.isArray(k) && (k = k.map((L) => L)), l(t, ["setup", "safetySettings"], k);
  }
  return n;
}
function iE(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], ge(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], nE(i, n)), n;
}
function oE(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], ge(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], rE(i, n)), n;
}
function sE(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function aE(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function lE(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = cg(n);
    Array.isArray(d) && (d = d.map((h) => No(h))), l(t, ["mediaChunks"], d);
  }
  const r = a(e, ["audio"]);
  r != null && l(t, ["audio"], No(fg(r)));
  const i = a(e, ["audioStreamEnd"]);
  i != null && l(t, ["audioStreamEnd"], i);
  const o = a(e, ["video"]);
  o != null && l(t, ["video"], No(dg(o)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function uE(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = cg(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
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
function cE(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = a(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const i = a(e, ["toolCall"]);
  i != null && l(t, ["toolCall"], i);
  const o = a(e, ["toolCallCancellation"]);
  o != null && l(t, ["toolCallCancellation"], o);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], yE(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = a(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], vE(h)), t;
}
function dE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], X0(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Q0(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], No(c));
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
function fE(e) {
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
function hE(e) {
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
function mE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], tE(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], eE(o));
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
function gE(e) {
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
    Array.isArray(p) && (p = p.map((m) => Z0(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function yE(e) {
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
function vE(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function _E(e, t) {
  const n = {}, r = a(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function bE(e, t) {
  const n = {}, r = a(e, ["data"]);
  if (r != null && l(n, ["data"], r), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function wE(e, t) {
  const n = {}, r = a(e, ["content"]);
  r != null && l(n, ["content"], r);
  const i = a(e, ["citationMetadata"]);
  i != null && l(n, ["citationMetadata"], SE(i));
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
function SE(e, t) {
  const n = {}, r = a(e, ["citationSources"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => o)), l(n, ["citations"], i);
  }
  return n;
}
function EE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let s = Qe(o);
    Array.isArray(s) && (s = s.map((u) => dr(u))), l(r, ["contents"], s);
  }
  return r;
}
function TE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["tokensInfo"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["tokensInfo"], o);
  }
  return n;
}
function AE(e, t) {
  const n = {}, r = a(e, ["values"]);
  r != null && l(n, ["values"], r);
  const i = a(e, ["statistics"]);
  return i != null && l(n, ["statistics"], CE(i)), n;
}
function CE(e, t) {
  const n = {}, r = a(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const i = a(e, ["token_count"]);
  return i != null && l(n, ["tokenCount"], i), n;
}
function xi(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => LT(s))), l(n, ["parts"], o);
  }
  const i = a(e, ["role"]);
  return i != null && l(n, ["role"], i), n;
}
function dr(e, t) {
  const n = {}, r = a(e, ["parts"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => $T(s))), l(n, ["parts"], o);
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
function IE(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function RE(e, t, n) {
  const r = {}, i = a(e, ["systemInstruction"]);
  t !== void 0 && i != null && l(t, ["systemInstruction"], dr(Ue(i)));
  const o = a(e, ["tools"]);
  if (t !== void 0 && o != null) {
    let u = o;
    Array.isArray(u) && (u = u.map((c) => Ig(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], bT(s)), r;
}
function PE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = Qe(o);
    Array.isArray(u) && (u = u.map((c) => xi(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && IE(s), r;
}
function ME(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = Qe(o);
    Array.isArray(u) && (u = u.map((c) => dr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && RE(s, r), r;
}
function NE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  i != null && l(n, ["totalTokens"], i);
  const o = a(e, ["cachedContentTokenCount"]);
  return o != null && l(n, ["cachedContentTokenCount"], o), n;
}
function kE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["totalTokens"]);
  return i != null && l(n, ["totalTokens"], i), n;
}
function DE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], ge(e, i)), r;
}
function LE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], ge(e, i)), r;
}
function $E(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function UE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function FE(e, t, n) {
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
function BE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => qT(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && FE(u, r), r;
}
function OE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Rs(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function GE(e, t, n) {
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
function qE(e, t, n) {
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
function VE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let d = _u(e, o);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && xi(Ue(s));
  const u = a(t, ["config"]);
  u != null && GE(u, r);
  const c = a(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], ge(e, c)), r;
}
function HE(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
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
    c != null && l(r, ["content"], dr(Ue(c)));
  }
  const u = a(t, ["config"]);
  return u != null && qE(u, r, n), r;
}
function KE(e, t) {
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
function WE(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions[]", "embeddings"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => AE(u))), l(n, ["embeddings"], s);
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
function JE(e, t) {
  const n = {}, r = a(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["deployedModelId"]);
  return i != null && l(n, ["deployedModelId"], i), n;
}
function zE(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function YE(e, t) {
  const n = {}, r = a(e, ["id"]);
  r != null && l(n, ["id"], r);
  const i = a(e, ["args"]);
  i != null && l(n, ["args"], i);
  const o = a(e, ["name"]);
  if (o != null && l(n, ["name"], o), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function XE(e, t) {
  const n = {}, r = a(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const i = a(e, ["mode"]);
  if (i != null && l(n, ["mode"], i), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function QE(e, t) {
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
function ZE(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], xi(Ue(o)));
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
    let R = E;
    Array.isArray(R) && (R = R.map((Y) => VT(Y))), l(n, ["safetySettings"], R);
  }
  const T = a(t, ["tools"]);
  if (n !== void 0 && T != null) {
    let R = ur(T);
    Array.isArray(R) && (R = R.map((Y) => QT(lr(Y)))), l(n, ["tools"], R);
  }
  const S = a(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], YT(S)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const N = a(t, ["cachedContent"]);
  n !== void 0 && N != null && l(n, ["cachedContent"], Ot(e, N));
  const A = a(t, ["responseModalities"]);
  A != null && l(i, ["responseModalities"], A);
  const k = a(t, ["mediaResolution"]);
  k != null && l(i, ["mediaResolution"], k);
  const L = a(t, ["speechConfig"]);
  if (L != null && l(i, ["speechConfig"], wu(L)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const G = a(t, ["thinkingConfig"]);
  G != null && l(i, ["thinkingConfig"], G);
  const Z = a(t, ["imageConfig"]);
  Z != null && l(i, ["imageConfig"], AT(Z));
  const K = a(t, ["enableEnhancedCivicAnswers"]);
  if (K != null && l(i, ["enableEnhancedCivicAnswers"], K), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const C = a(t, ["serviceTier"]);
  return n !== void 0 && C != null && l(n, ["serviceTier"], C), i;
}
function jE(e, t, n, r) {
  const i = {}, o = a(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], dr(Ue(o)));
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
  const T = a(t, ["modelSelectionConfig"]);
  T != null && l(i, ["modelConfig"], T);
  const S = a(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let B = S;
    Array.isArray(B) && (B = B.map((z) => z)), l(n, ["safetySettings"], B);
  }
  const N = a(t, ["tools"]);
  if (n !== void 0 && N != null) {
    let B = ur(N);
    Array.isArray(B) && (B = B.map((z) => Ig(lr(z)))), l(n, ["tools"], B);
  }
  const A = a(t, ["toolConfig"]);
  n !== void 0 && A != null && l(n, ["toolConfig"], XT(A));
  const k = a(t, ["labels"]);
  n !== void 0 && k != null && l(n, ["labels"], k);
  const L = a(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], Ot(e, L));
  const G = a(t, ["responseModalities"]);
  G != null && l(i, ["responseModalities"], G);
  const Z = a(t, ["mediaResolution"]);
  Z != null && l(i, ["mediaResolution"], Z);
  const K = a(t, ["speechConfig"]);
  K != null && l(i, ["speechConfig"], wu(K));
  const C = a(t, ["audioTimestamp"]);
  C != null && l(i, ["audioTimestamp"], C);
  const R = a(t, ["thinkingConfig"]);
  R != null && l(i, ["thinkingConfig"], R);
  const Y = a(t, ["imageConfig"]);
  if (Y != null && l(i, ["imageConfig"], CT(Y)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const J = a(t, ["modelArmorConfig"]);
  n !== void 0 && J != null && l(n, ["modelArmorConfig"], J);
  const D = a(t, ["serviceTier"]);
  return n !== void 0 && D != null && l(n, ["serviceTier"], D), i;
}
function qf(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = Qe(o);
    Array.isArray(u) && (u = u.map((c) => xi(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], ZE(e, s, r)), r;
}
function Vf(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["contents"]);
  if (o != null) {
    let u = Qe(o);
    Array.isArray(u) && (u = u.map((c) => dr(c))), l(r, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(r, ["generationConfig"], jE(e, s, r)), r;
}
function Hf(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["candidates"]);
  if (i != null) {
    let h = i;
    Array.isArray(h) && (h = h.map((f) => wE(f))), l(n, ["candidates"], h);
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
function Kf(e, t) {
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
function eT(e, t, n) {
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
function tT(e, t, n) {
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
function nT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && eT(s, r), r;
}
function rT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["config"]);
  return s != null && tT(s, r), r;
}
function iT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => gT(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], Cg(o)), n;
}
function oT(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Rs(u))), l(n, ["generatedImages"], s);
  }
  const o = a(e, ["positivePromptSafetyAttributes"]);
  return o != null && l(n, ["positivePromptSafetyAttributes"], xg(o)), n;
}
function sT(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Ps(f));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((y) => cA(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function aT(e, t, n) {
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
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], St(v));
  const b = a(e, ["referenceImages"]);
  if (t !== void 0 && b != null) {
    let T = b;
    Array.isArray(T) && (T = T.map((S) => dA(S))), l(t, ["instances[0]", "referenceImages"], T);
  }
  const _ = a(e, ["mask"]);
  t !== void 0 && _ != null && l(t, ["instances[0]", "mask"], uA(_));
  const w = a(e, ["compressionQuality"]);
  t !== void 0 && w != null && l(t, ["parameters", "compressionQuality"], w);
  const E = a(e, ["labels"]);
  if (t !== void 0 && E != null && l(t, ["labels"], E), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
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
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], fT(u)), n;
}
function uT(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const o = a(e, ["done"]);
  o != null && l(n, ["done"], o);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], hT(u)), n;
}
function cT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], Ps(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Rg(u));
  const c = a(t, ["source"]);
  c != null && pT(c, r);
  const d = a(t, ["config"]);
  return d != null && sT(d, r), r;
}
function dT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["prompt"]);
  o != null && l(r, ["instances[0]", "prompt"], o);
  const s = a(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], St(s));
  const u = a(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Pg(u));
  const c = a(t, ["source"]);
  c != null && mT(c, r);
  const d = a(t, ["config"]);
  return d != null && aT(d, r), r;
}
function fT(e, t) {
  const n = {}, r = a(e, ["generatedSamples"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => vT(u))), l(n, ["generatedVideos"], s);
  }
  const i = a(e, ["raiMediaFilteredCount"]);
  i != null && l(n, ["raiMediaFilteredCount"], i);
  const o = a(e, ["raiMediaFilteredReasons"]);
  return o != null && l(n, ["raiMediaFilteredReasons"], o), n;
}
function hT(e, t) {
  const n = {}, r = a(e, ["videos"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => _T(u))), l(n, ["generatedVideos"], s);
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
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], Ps(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Rg(s)), r;
}
function mT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], St(o));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Pg(s)), r;
}
function gT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], xT(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  return o != null && l(n, ["safetyAttributes"], Cg(o)), n;
}
function Rs(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["image"], Ag(r));
  const i = a(e, ["raiFilteredReason"]);
  i != null && l(n, ["raiFilteredReason"], i);
  const o = a(e, ["_self"]);
  o != null && l(n, ["safetyAttributes"], xg(o));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function yT(e, t) {
  const n = {}, r = a(e, ["_self"]);
  r != null && l(n, ["mask"], Ag(r));
  const i = a(e, ["labels"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["labels"], o);
  }
  return n;
}
function vT(e, t) {
  const n = {}, r = a(e, ["video"]);
  return r != null && l(n, ["video"], aA(r)), n;
}
function _T(e, t) {
  const n = {}, r = a(e, ["_self"]);
  return r != null && l(n, ["video"], lA(r)), n;
}
function bT(e, t) {
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
  const T = a(e, ["temperature"]);
  T != null && l(n, ["temperature"], T);
  const S = a(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const N = a(e, ["topK"]);
  N != null && l(n, ["topK"], N);
  const A = a(e, ["topP"]);
  if (A != null && l(n, ["topP"], A), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function wT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], ge(e, i)), r;
}
function ST(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  return i != null && l(r, ["_url", "name"], ge(e, i)), r;
}
function ET(e, t) {
  const n = {}, r = a(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], _E(r));
  const i = a(e, ["enableWidget"]);
  return i != null && l(n, ["enableWidget"], i), n;
}
function TT(e, t) {
  const n = {}, r = a(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const i = a(e, ["timeRangeFilter"]);
  return i != null && l(n, ["timeRangeFilter"], i), n;
}
function AT(e, t) {
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
function CT(e, t) {
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
  r != null && l(n, ["imageBytes"], ln(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Ag(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["imageBytes"], ln(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Ps(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], ln(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function St(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["imageBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], ln(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
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
function RT(e, t, n, r) {
  const i = {}, o = a(t, ["pageSize"]);
  n !== void 0 && o != null && l(n, ["_query", "pageSize"], o);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], gg(e, c)), i;
}
function PT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && IT(e, i, r), r;
}
function MT(e, t, n) {
  const r = {}, i = a(t, ["config"]);
  return i != null && RT(e, i, r), r;
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
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["nextPageToken"]);
  i != null && l(n, ["nextPageToken"], i);
  const o = a(e, ["_self"]);
  if (o != null) {
    let s = yg(o);
    Array.isArray(s) && (s = s.map((u) => hl(u))), l(n, ["models"], s);
  }
  return n;
}
function DT(e, t) {
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
  u != null && l(n, ["tunedModelInfo"], ZT(u));
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
    Array.isArray(p) && (p = p.map((m) => JE(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], jT(d));
  const h = a(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = a(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function LT(e, t) {
  const n = {}, r = a(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const i = a(e, ["codeExecutionResult"]);
  i != null && l(n, ["codeExecutionResult"], i);
  const o = a(e, ["executableCode"]);
  o != null && l(n, ["executableCode"], o);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], zE(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], YE(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], bE(d));
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
function $T(e, t) {
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
function UT(e, t) {
  const n = {}, r = a(e, ["productImage"]);
  return r != null && l(n, ["image"], St(r)), n;
}
function FT(e, t, n) {
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
function BT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["source"]);
  o != null && GT(o, r);
  const s = a(t, ["config"]);
  return s != null && FT(s, r), r;
}
function OT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => Rs(o))), l(n, ["generatedImages"], i);
  }
  return n;
}
function GT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["personImage"]);
  t !== void 0 && o != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], St(o));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => UT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function qT(e, t) {
  const n = {}, r = a(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], St(r));
  const i = a(e, ["referenceId"]);
  i != null && l(n, ["referenceId"], i);
  const o = a(e, ["referenceType"]);
  o != null && l(n, ["referenceType"], o);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], DT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], xE(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Cg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function xg(e, t) {
  const n = {}, r = a(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const i = a(e, ["safetyAttributes", "scores"]);
  i != null && l(n, ["scores"], i);
  const o = a(e, ["contentType"]);
  return o != null && l(n, ["contentType"], o), n;
}
function VT(e, t) {
  const n = {}, r = a(e, ["category"]);
  if (r != null && l(n, ["category"], r), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const i = a(e, ["threshold"]);
  return i != null && l(n, ["threshold"], i), n;
}
function HT(e, t) {
  const n = {}, r = a(e, ["image"]);
  return r != null && l(n, ["image"], St(r)), n;
}
function KT(e, t, n) {
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
function WT(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["source"]);
  o != null && zT(o, r);
  const s = a(t, ["config"]);
  return s != null && KT(s, r), r;
}
function JT(e, t) {
  const n = {}, r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((o) => yT(o))), l(n, ["generatedMasks"], i);
  }
  return n;
}
function zT(e, t, n) {
  const r = {}, i = a(e, ["prompt"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "prompt"], i);
  const o = a(e, ["image"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "image"], St(o));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], HT(s)), r;
}
function YT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  i != null && l(n, ["functionCallingConfig"], XE(i));
  const o = a(e, ["includeServerSideToolInvocations"]);
  return o != null && l(n, ["includeServerSideToolInvocations"], o), n;
}
function XT(e, t) {
  const n = {}, r = a(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const i = a(e, ["functionCallingConfig"]);
  if (i != null && l(n, ["functionCallingConfig"], i), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function QT(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = a(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const i = a(e, ["fileSearch"]);
  i != null && l(n, ["fileSearch"], i);
  const o = a(e, ["googleSearch"]);
  o != null && l(n, ["googleSearch"], TT(o));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], ET(s));
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
    Array.isArray(m) && (m = m.map((g) => QE(g))), l(n, ["functionDeclarations"], m);
  }
  const h = a(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function ZT(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
}
function jT(e, t) {
  const n = {}, r = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const o = a(e, ["updateTime"]);
  return o != null && l(n, ["updateTime"], o), n;
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
  const r = {}, i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const o = a(e, ["description"]);
  t !== void 0 && o != null && l(t, ["description"], o);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), r;
}
function nA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "name"], ge(e, i));
  const o = a(t, ["config"]);
  return o != null && eA(o, r), r;
}
function rA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["config"]);
  return o != null && tA(o, r), r;
}
function iA(e, t, n) {
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
function oA(e, t, n) {
  const r = {}, i = a(t, ["model"]);
  i != null && l(r, ["_url", "model"], ge(e, i));
  const o = a(t, ["image"]);
  o != null && l(r, ["instances[0]", "image"], St(o));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && iA(u, r), r;
}
function sA(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["predictions"]);
  if (i != null) {
    let o = i;
    Array.isArray(o) && (o = o.map((s) => Rs(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function aA(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["encodedVideo"]);
  i != null && l(n, ["videoBytes"], ln(i));
  const o = a(e, ["encoding"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function lA(e, t) {
  const n = {}, r = a(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["bytesBase64Encoded"]);
  i != null && l(n, ["videoBytes"], ln(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function uA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["_self"], St(r));
  const i = a(e, ["maskMode"]);
  return i != null && l(n, ["maskMode"], i), n;
}
function cA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], Ps(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function dA(e, t) {
  const n = {}, r = a(e, ["image"]);
  r != null && l(n, ["image"], St(r));
  const i = a(e, ["referenceType"]);
  return i != null && l(n, ["referenceType"], i), n;
}
function Rg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["encodedVideo"], ln(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["encoding"], o), n;
}
function Pg(e, t) {
  const n = {}, r = a(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const i = a(e, ["videoBytes"]);
  i != null && l(n, ["bytesBase64Encoded"], ln(i));
  const o = a(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function fA(e, t) {
  const n = {}, r = a(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function hA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && fA(n, t), t;
}
function pA(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function mA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && pA(r, t), t;
}
function gA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function yA(e, t) {
  const n = {}, r = a(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["customMetadata"], o);
  }
  const i = a(e, ["chunkingConfig"]);
  return t !== void 0 && i != null && l(t, ["chunkingConfig"], i), n;
}
function vA(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = a(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(t, ["done"], i);
  const o = a(e, ["error"]);
  o != null && l(t, ["error"], o);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], bA(s)), t;
}
function _A(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const i = a(e, ["config"]);
  return i != null && yA(i, t), t;
}
function bA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = a(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const i = a(e, ["documentName"]);
  return i != null && l(t, ["documentName"], i), t;
}
function wA(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function SA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && wA(n, t), t;
}
function EA(e) {
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
function TA(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = a(e, ["config"]);
  return r != null && Mg(r, t), t;
}
function AA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var CA = "Content-Type", xA = "X-Server-Timeout", IA = "User-Agent", pl = "x-goog-api-client", RA = "google-genai-sdk/1.50.1", PA = "v1beta1", MA = "v1beta", NA = /* @__PURE__ */ new Set(["us", "eu"]), kA = 5, DA = [
  408,
  429,
  500,
  502,
  503,
  504
], LA = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const i = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const o = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !o ? (i.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? i.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && NA.has(this.clientOptions.location) ? i.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (i.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), i.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : PA;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), i.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : MA, i.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return t && t.extraBody !== null && $A(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Wf(r), new ul(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Wf(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return bt(this, arguments, function* () {
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
          const { done: c, value: d } = yield ae(r.read());
          if (c) {
            if (o.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = i.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
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
                yield yield ae(new ul(new Response(y, {
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
      throw DA.includes(o.status) ? new Error(`Retryable HTTP Error: ${o.statusText}`) : new yd.AbortError(`Non-retryable exception ${o.statusText} sending request`);
    };
    return (0, yd.default)(i, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : kA) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = RA + " " + this.clientOptions.userAgentExtra;
    return e[IA] = t, e[pl] = t, e[CA] = "application/json", e;
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
    const u = { file: r }, c = this.getFileName(e), d = q("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return i.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const i = this.clientOptions.uploader, o = await i.stat(t), s = String(o.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : o.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Mg(n, h);
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
async function Wf(e) {
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
function $A(e, t) {
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
var UA = "mcp_used/unknown", FA = !1;
function Ng(e) {
  for (const t of e)
    if (BA(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return FA;
}
function kg(e) {
  var t;
  e[pl] = (((t = e[pl]) !== null && t !== void 0 ? t : "") + ` ${UA}`).trimStart();
}
function BA(e) {
  return e !== null && typeof e == "object" && e instanceof GA;
}
function OA(e) {
  return bt(this, arguments, function* (n, r = 100) {
    let i, o = 0;
    for (; o < r; ) {
      const s = yield ae(n.listTools({ cursor: i }));
      for (const u of s.tools)
        yield yield ae(u), o++;
      if (!s.nextCursor) break;
      i = s.nextCursor;
    }
  });
}
var GA = class Dg {
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
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, wt(OA(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), tS(this.mcpTools, this.config);
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
async function qA(e, t, n) {
  const r = new Ww();
  let i;
  n.data instanceof Blob ? i = JSON.parse(await n.data.text()) : i = JSON.parse(n.data), Object.assign(r, i), t(r);
}
var VA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), i = this.apiClient.getApiVersion(), o = WA(this.apiClient.getDefaultHeaders()), s = `${r}/ws/google.ai.generativelanguage.${i}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (y) => {
        qA(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(s, KA(o), p);
    m.connect(), await c;
    const g = { setup: { model: ge(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new HA(m, this.apiClient);
  }
}, HA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = aE(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = sE(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Qn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Qn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Qn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Qn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function KA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function WA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var JA = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function zA(e, t, n) {
  const r = new Kw();
  let i;
  n.data instanceof Blob ? i = await n.data.text() : n.data instanceof ArrayBuffer ? i = new TextDecoder().decode(n.data) : i = n.data;
  const o = JSON.parse(i);
  if (e.isVertexAI()) {
    const s = cE(o);
    Object.assign(r, s);
  } else Object.assign(r, o);
  t(r);
}
var YA = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new VA(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, i, o, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Ng(e.config.tools) && kg(h);
    const f = jA(h);
    if (this.apiClient.isVertexAI()) {
      const A = this.apiClient.getProject(), k = this.apiClient.getLocation(), L = this.apiClient.getApiKey(), G = !!A && !!k || !!L;
      this.apiClient.getCustomBaseUrl() && !G ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const A = this.apiClient.getApiKey();
      let k = "BidiGenerateContent", L = "key";
      A?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), k = "BidiGenerateContentConstrained", L = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${k}?${L}=${A}`;
    }
    let p = () => {
    };
    const m = new Promise((A) => {
      p = A;
    }), g = e.callbacks, y = function() {
      var A;
      (A = g?.onopen) === null || A === void 0 || A.call(g), p({});
    }, v = this.apiClient, b = {
      onopen: y,
      onmessage: (A) => {
        zA(v, g.onmessage, A);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(A) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(A) {
      }
    }, _ = this.webSocketFactory.create(d, ZA(f), b);
    _.connect(), await m;
    let w = ge(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && w.startsWith("publishers/")) {
      const A = this.apiClient.getProject(), k = this.apiClient.getLocation();
      A && k && (w = `projects/${A}/locations/${k}/` + w);
    }
    let E = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Qo.AUDIO] } : e.config.responseModalities = [Qo.AUDIO]), !((i = e.config) === null || i === void 0) && i.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const T = (s = (o = e.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : [], S = [];
    for (const A of T) if (this.isCallableTool(A)) {
      const k = A;
      S.push(await k.tool());
    } else S.push(A);
    S.length > 0 && (e.config.tools = S);
    const N = {
      model: w,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? E = oE(this.apiClient, N) : E = iE(this.apiClient, N), delete E.config, _.send(JSON.stringify(E)), new QA(_, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, XA = { turnComplete: !0 }, QA = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Qe(t.turns), e.isVertexAI() || (n = n.map((r) => xi(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(JA);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, XA), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: uE(e) } : t = { realtimeInput: lE(e) }, this.conn.send(JSON.stringify(t));
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
function ZA(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function jA(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Jf = 10;
function zf(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let i = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (nr(s)) {
    i = !0;
    break;
  }
  if (!i) return !0;
  const o = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return o && (o < 0 || !Number.isInteger(o)) || o == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", o), !0) : !1;
}
function nr(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function eC(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((i) => nr(i))) !== null && r !== void 0 ? r : !1;
}
function Yf(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, i) => {
    if (nr(r)) return;
    const o = r;
    o.functionDeclarations && o.functionDeclarations.length > 0 && n.push(i);
  }), n;
}
function Xf(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var tC = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Qe(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Qe(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Zo.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Zo.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, i, o, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !eC(t) || zf(t.config)) return await this.generateContentInternal(u);
      const c = Yf(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = Qe(u.contents), p = (i = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && i !== void 0 ? i : Jf;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const v of (s = (o = t.config) === null || o === void 0 ? void 0 : o.tools) !== null && s !== void 0 ? s : []) if (nr(v)) {
          const b = await v.callTool(d.functionCalls);
          y.push(...b);
        }
        m++, h = {
          role: "user",
          parts: y
        }, u.contents = Qe(u.contents), u.contents.push(g), u.contents.push(h), Xf(u.config) && (f.push(g), f.push(h));
      }
      return Xf(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, i, o, s;
      if (this.maybeMoveToResponseJsonSchem(t), zf(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Yf(t);
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
      return new Dn(Ft.PAGED_ITEM_MODELS, (i) => this.listInternal(i), await this.listInternal(r), r);
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
    const o = await Promise.all(i.map(async (u) => nr(u) ? await u.tool() : u)), s = {
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
    for (const o of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (nr(o)) {
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
    const i = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Jf;
    let o = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return bt(this, arguments, function* () {
        for (var f, p, m, g, y, v; s < i; ) {
          o && (s++, o = !1);
          const E = yield ae(c.processParamsMaybeAddMcpUsage(h)), T = yield ae(c.generateContentStreamInternal(E)), S = [], N = [];
          try {
            for (var b = !0, _ = (p = void 0, wt(T)), w; w = yield ae(_.next()), f = w.done, !f; b = !0) {
              g = w.value, b = !1;
              const A = g;
              if (yield yield ae(A), A.candidates && (!((y = A.candidates[0]) === null || y === void 0) && y.content)) {
                N.push(A.candidates[0].content);
                for (const k of (v = A.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (s < i && k.functionCall) {
                  if (!k.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(k.functionCall.name)) {
                    const L = yield ae(d.get(k.functionCall.name).callTool([k.functionCall]));
                    S.push(...L);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${k.functionCall.name}`);
                }
              }
            }
          } catch (A) {
            p = { error: A };
          } finally {
            try {
              !b && !f && (m = _.return) && (yield ae(m.call(_)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            o = !0;
            const A = new Dr();
            A.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield ae(A);
            const k = [];
            k.push(...N), k.push({
              role: "user",
              parts: S
            }), h.contents = Qe(h.contents).concat(k);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Vf(this.apiClient, e);
      return s = q("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = Kf(d), f = new Dr();
        return Object.assign(f, h), f;
      });
    } else {
      const c = qf(this.apiClient, e);
      return s = q("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = Hf(d), f = new Dr();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Vf(this.apiClient, e);
      return s = q("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), o.then(function(d) {
        return bt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, y = wt(d), v; v = yield ae(y.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = Kf(yield ae(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Dr();
              Object.assign(w, _), yield yield ae(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !h && (p = y.return) && (yield ae(p.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = qf(this.apiClient, e);
      return s = q("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }), o.then(function(d) {
        return bt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, y = wt(d), v; v = yield ae(y.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const b = m, _ = Hf(yield ae(b.json()), e);
              _.sdkHttpResponse = { headers: b.headers };
              const w = new Dr();
              Object.assign(w, _), yield yield ae(w);
            }
          } catch (b) {
            f = { error: b };
          } finally {
            try {
              !g && !h && (p = y.return) && (yield ae(p.call(y)));
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
      const c = HE(this.apiClient, e, e);
      return s = q(rS(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = WE(d, e), f = new Sf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = VE(this.apiClient, e);
      return s = q("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = KE(d), f = new Sf();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rT(this.apiClient, e);
      return s = q("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = oT(d), f = new Ef();
        return Object.assign(f, h), f;
      });
    } else {
      const c = nT(this.apiClient, e);
      return s = q("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = iT(d), f = new Ef();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = BE(this.apiClient, e);
      return i = q("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
        const c = OE(u), d = new Nw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = oA(this.apiClient, e);
      return i = q("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
        const c = sA(u), d = new kw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = BT(this.apiClient, e);
      return i = q("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = OT(u), d = new Dw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = WT(this.apiClient, e);
      return i = q("{model}:predict", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = JT(u), d = new Lw();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ST(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => hl(d));
    } else {
      const c = wT(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = MT(this.apiClient, e);
      return s = q("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = kT(d), f = new Tf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PT(this.apiClient, e);
      return s = q("{models_url}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = NT(d), f = new Tf();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rA(this.apiClient, e);
      return s = q("{model}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => hl(d));
    } else {
      const c = nA(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = LE(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = UE(d), f = new Af();
        return Object.assign(f, h), f;
      });
    } else {
      const c = DE(this.apiClient, e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = $E(d), f = new Af();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ME(this.apiClient, e);
      return s = q("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = kE(d), f = new Cf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PE(this.apiClient, e);
      return s = q("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = NE(d), f = new Cf();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = EE(this.apiClient, e);
      return i = q("{model}:computeTokens", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
        const c = TE(u), d = new $w();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = dT(this.apiClient, e);
      return s = q("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const h = uT(d), f = new xf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = cT(this.apiClient, e);
      return s = q("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json()), o.then((d) => {
        const h = lT(d), f = new xf();
        return Object.assign(f, h), f;
      });
    }
  }
}, nC = class extends Bt {
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
      const c = Cw(e);
      return s = q("{operationName}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), o;
    } else {
      const c = Aw(e);
      return s = q("{operationName}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const s = vw(e);
      return i = q("{resourceName}:fetchPredictOperation", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
function Qf(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function rC(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function iC(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function oC(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((o) => pC(o))), l(t, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function sC(e, t, n) {
  const r = {}, i = a(t, ["expireTime"]);
  n !== void 0 && i != null && l(n, ["expireTime"], i);
  const o = a(t, ["newSessionExpireTime"]);
  n !== void 0 && o != null && l(n, ["newSessionExpireTime"], o);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], hC(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function aC(e, t) {
  const n = {}, r = a(t, ["config"]);
  return r != null && l(n, ["config"], sC(e, r, n)), n;
}
function lC(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function uC(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = a(e, ["args"]);
  r != null && l(t, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(t, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function cC(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], rC(n));
  const r = a(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function dC(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function fC(e, t) {
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], oC(Ue(g)));
  const y = a(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let A = ur(y);
    Array.isArray(A) && (A = A.map((k) => yC(lr(k)))), l(t, ["setup", "tools"], A);
  }
  const v = a(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], gC(v));
  const b = a(e, ["inputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "inputAudioTranscription"], Qf(b));
  const _ = a(e, ["outputAudioTranscription"]);
  t !== void 0 && _ != null && l(t, ["setup", "outputAudioTranscription"], Qf(_));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const E = a(e, ["contextWindowCompression"]);
  t !== void 0 && E != null && l(t, ["setup", "contextWindowCompression"], E);
  const T = a(e, ["proactivity"]);
  if (t !== void 0 && T != null && l(t, ["setup", "proactivity"], T), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = a(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const N = a(e, ["safetySettings"]);
  if (t !== void 0 && N != null) {
    let A = N;
    Array.isArray(A) && (A = A.map((k) => mC(k))), l(t, ["setup", "safetySettings"], A);
  }
  return n;
}
function hC(e, t) {
  const n = {}, r = a(t, ["model"]);
  r != null && l(n, ["setup", "model"], ge(e, r));
  const i = a(t, ["config"]);
  return i != null && l(n, ["config"], fC(i, n)), n;
}
function pC(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(t, ["executableCode"], i);
  const o = a(e, ["fileData"]);
  o != null && l(t, ["fileData"], lC(o));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], uC(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], iC(c));
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
function mC(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function gC(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function yC(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = a(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(t, ["googleSearch"], dC(i));
  const o = a(e, ["googleMaps"]);
  o != null && l(t, ["googleMaps"], cC(o));
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
function vC(e) {
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
function _C(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const o = r.setup;
    typeof o == "object" && o !== null ? (e.bidiGenerateContentSetup = o, n = o) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const i = e.fieldMask;
  if (n) {
    const o = vC(n);
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
var bC = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = aC(this.apiClient, e);
      i = q("auth_tokens", s._url), o = s._query, delete s.config, delete s._url, delete s._query;
      const u = _C(s, e.config);
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
function wC(e, t) {
  const n = {}, r = a(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function SC(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = a(e, ["config"]);
  return r != null && wC(r, t), t;
}
function EC(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function TC(e, t) {
  const n = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  return t !== void 0 && i != null && l(t, ["_query", "pageToken"], i), n;
}
function AC(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = a(e, ["config"]);
  return r != null && TC(r, t), t;
}
function CC(e) {
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
var xC = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Dn(Ft.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = EC(e);
      return i = q("{name}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
      const o = SC(e);
      r = q("{name}", o._url), i = o._query, delete o._url, delete o._query, await this.apiClient.request({
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
      const s = AC(e);
      return i = q("{parent}/documents", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = CC(u), d = new Uw();
        return Object.assign(d, c), d;
      });
    }
  }
}, IC = class extends Bt {
  constructor(e, t = new xC(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Dn(Ft.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const s = hA(e);
      return i = q("fileSearchStores", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
      const s = gA(e);
      return i = q("{name}", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
      const o = mA(e);
      r = q("{name}", o._url), i = o._query, delete o._url, delete o._query, await this.apiClient.request({
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
      const s = SA(e);
      return i = q("fileSearchStores", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = EA(u), d = new Fw();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = TA(e);
      return i = q("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = AA(u), d = new Bw();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = _A(e);
      return i = q("{file_search_store_name}:importFile", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = vA(u), d = new Ow();
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
}, RC = () => Lg();
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
}, ht = class extends Error {
}, pt = class yl extends ht {
  constructor(t, n, r, i) {
    super(`${yl.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.error = n;
  }
  static makeMessage(t, n, r) {
    const i = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && i ? `${t} ${i}` : t ? `${t} status code (no body)` : i || "(no status code or body)";
  }
  static generate(t, n, r, i) {
    if (!t || !i) return new Ms({
      message: r,
      cause: gl(n)
    });
    const o = n;
    return t === 400 ? new Ug(t, o, r, i) : t === 401 ? new Fg(t, o, r, i) : t === 403 ? new Bg(t, o, r, i) : t === 404 ? new Og(t, o, r, i) : t === 409 ? new Gg(t, o, r, i) : t === 422 ? new qg(t, o, r, i) : t === 429 ? new Vg(t, o, r, i) : t >= 500 ? new Hg(t, o, r, i) : new yl(t, o, r, i);
  }
}, vl = class extends pt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ms = class extends pt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, $g = class extends Ms {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ug = class extends pt {
}, Fg = class extends pt {
}, Bg = class extends pt {
}, Og = class extends pt {
}, Gg = class extends pt {
}, qg = class extends pt {
}, Vg = class extends pt {
}, Hg = class extends pt {
}, PC = /^[a-z][a-z0-9+.-]*:/i, MC = (e) => PC.test(e), _l = (e) => (_l = Array.isArray, _l(e)), Zf = _l;
function jf(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function NC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var kC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ht(`${e} must be an integer`);
  if (t < 0) throw new ht(`${e} must be a positive integer`);
  return t;
}, DC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, LC = (e) => new Promise((t) => setTimeout(t, e));
function $C() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Kg(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function UC(e) {
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
async function FC(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), i = r.cancel();
  r.releaseLock(), await i;
}
var BC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function OC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ht(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var GC = "0.0.1", Jg = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function pa(e, t, n) {
  return Jg(), new File(e, t ?? "unknown_file", n);
}
function qC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var VC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", zg = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", HC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && zg(e), KC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function WC(e, t, n) {
  if (Jg(), e = await e, HC(e))
    return e instanceof File ? e : pa([await e.arrayBuffer()], e.name);
  if (KC(e)) {
    const i = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), pa(await bl(i), t, n);
  }
  const r = await bl(e);
  if (t || (t = qC(e)), !n?.type) {
    const i = r.find((o) => typeof o == "object" && "type" in o && o.type);
    typeof i == "string" && (n = Object.assign(Object.assign({}, n), { type: i }));
  }
  return pa(r, t, n);
}
async function bl(e) {
  var t, n, r, i, o;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (zg(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (VC(e)) try {
    for (var u = !0, c = wt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${JC(e)}`);
  }
  return s;
}
function JC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Eu = class {
  constructor(e) {
    this._client = e;
  }
};
Eu._key = [];
function Yg(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var eh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), zC = (e = Yg) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let i = !1;
  const o = [], s = n.reduce((h, f, p) => {
    var m, g, y;
    /[?#]/.test(f) && (i = !0);
    const v = r[p];
    let b = (i ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : eh)) !== null && g !== void 0 ? g : eh)) === null || y === void 0 ? void 0 : y.toString)) && (b = v + "", o.push({
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
    throw new ht(`Path parameters result in path with invalid segments:
${o.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}), vt = /* @__PURE__ */ zC(Yg), Xg = class extends Eu {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, i = Qt(e, ["api_version"]);
    if ("model" in i && "agent_config" in i) throw new ht("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in i && "generation_config" in i) throw new ht("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(vt`/${r}/interactions`, Object.assign(Object.assign({ body: i }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(vt`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(vt`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const i = t ?? {}, { api_version: o = this._client.apiVersion } = i, s = Qt(i, ["api_version"]);
    return this._client.get(vt`/${o}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Xg._key = Object.freeze(["interactions"]);
var Qg = class extends Xg {
}, Zg = class extends Eu {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, i = Qt(e, ["api_version", "webhook_id"]);
    return this._client.post(vt`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: i
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: i } = t, o = Qt(t, ["api_version", "update_mask"]);
    return this._client.patch(vt`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: i },
      body: o
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, i = Qt(n, ["api_version"]);
    return this._client.get(vt`/${r}/webhooks`, Object.assign({ query: i }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(vt`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(vt`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: i } = t ?? {};
    return this._client.post(vt`/${r}/webhooks/${e}:ping`, Object.assign({ body: i }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, o = Qt(r, ["api_version"]);
    return this._client.post(vt`/${i}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: o }, n));
  }
};
Zg._key = Object.freeze(["webhooks"]);
var jg = class extends Zg {
};
function YC(e) {
  let t = 0;
  for (const i of e) t += i.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const i of e)
    n.set(i, r), r += i.length;
  return n;
}
var so;
function Tu(e) {
  let t;
  return (so ?? (t = new globalThis.TextEncoder(), so = t.encode.bind(t)))(e);
}
var ao;
function th(e) {
  let t;
  return (ao ?? (t = new globalThis.TextDecoder(), ao = t.decode.bind(t)))(e);
}
var Ns = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Tu(e) : e;
    this.buffer = YC([this.buffer, n]);
    const r = [];
    let i;
    for (; (i = XC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (i.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = i.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (i.index !== this.carriageReturnIndex + 1 || i.carriage)) {
        r.push(th(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const o = this.carriageReturnIndex !== null ? i.preceding - 1 : i.preceding, s = th(this.buffer.subarray(0, o));
      r.push(s), this.buffer = this.buffer.subarray(i.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ns.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ns.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function XC(e, t) {
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
var es = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, nh = (e, t, n) => {
  if (e) {
    if (NC(es, e)) return e;
    We(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(es))}`);
  }
};
function Qr() {
}
function lo(e, t, n) {
  return !t || es[e] > es[n] ? Qr : t[e].bind(t);
}
var QC = {
  error: Qr,
  warn: Qr,
  info: Qr,
  debug: Qr
}, rh = /* @__PURE__ */ new WeakMap();
function We(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return QC;
  const i = rh.get(n);
  if (i && i[0] === r) return i[1];
  const o = {
    error: lo("error", n, r),
    warn: lo("warn", n, r),
    info: lo("info", n, r),
    debug: lo("debug", n, r)
  };
  return rh.set(n, [r, o]), o;
}
var yn = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), ZC = class Zr {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let i = !1;
    const o = r ? We(r) : console;
    function s() {
      return bt(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new ht("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = wt(jC(t, n)), y; y = yield ae(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield ae(JSON.parse(v.data));
                } catch (b) {
                  throw o.error("Could not parse message into JSON:", v.data), o.error("From chunk:", v.raw), b;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield ae(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ml(v)) return yield ae(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Zr(s, n, r);
  }
  static fromReadableStream(t, n, r) {
    let i = !1;
    function o() {
      return bt(this, arguments, function* () {
        var c, d, h, f;
        const p = new Ns(), m = Wg(t);
        try {
          for (var g = !0, y = wt(m), v; v = yield ae(y.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const b = f;
            for (const _ of p.decode(b)) yield yield ae(_);
          }
        } catch (b) {
          d = { error: b };
        } finally {
          try {
            !g && !c && (h = y.return) && (yield ae(h.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const b of p.flush()) yield yield ae(b);
      });
    }
    function s() {
      return bt(this, arguments, function* () {
        var c, d, h, f;
        if (i) throw new ht("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        i = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = wt(o()), y; y = yield ae(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const v = f;
              p || v && (yield yield ae(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield ae(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ml(v)) return yield ae(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Zr(s, n, r);
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
    return [new Zr(() => i(t), this.controller, this.client), new Zr(() => i(n), this.controller, this.client)];
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
function jC(e, t) {
  return bt(this, arguments, function* () {
    var r, i, o, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ht("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ht("Attempted to iterate over a response with no body");
    const u = new tx(), c = new Ns(), d = Wg(e.body);
    try {
      for (var h = !0, f = wt(ex(d)), p; p = yield ae(f.next()), r = p.done, !r; h = !0) {
        s = p.value, h = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield ae(y));
        }
      }
    } catch (m) {
      i = { error: m };
    } finally {
      try {
        !h && !r && (o = f.return) && (yield ae(o.call(f)));
      } finally {
        if (i) throw i.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield ae(g));
    }
  });
}
function ex(e) {
  return bt(this, arguments, function* () {
    var n, r, i, o;
    try {
      for (var s = !0, u = wt(e), c; c = yield ae(u.next()), n = c.done, !n; s = !0) {
        o = c.value, s = !1;
        const d = o;
        d != null && (yield yield ae(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Tu(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !s && !n && (i = u.return) && (yield ae(i.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var tx = class {
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
    let [t, n, r] = nx(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function nx(e, t) {
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
async function rx(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: o } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return We(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : ZC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return We(e).debug(`[${r}] response parsed`, yn({
    retryOfRequestLogID: i,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - o
  })), s;
}
var ix = class ey extends Promise {
  constructor(t, n, r = rx) {
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
function* ox(e) {
  if (!e) return;
  if (ty in e) {
    const { values: r, nulls: i } = e;
    yield* r.entries();
    for (const o of i) yield [o, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Zf(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const i = r[0];
    if (typeof i != "string") throw new TypeError("expected header name to be a string");
    const o = Zf(r[1]) ? r[1] : [r[1]];
    let s = !1;
    for (const u of o)
      u !== void 0 && (t && !s && (s = !0, yield [i, null]), yield [i, u]);
  }
}
var Lr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = /* @__PURE__ */ new Set();
    for (const [o, s] of ox(r)) {
      const u = o.toLowerCase();
      i.has(u) || (t.delete(o), i.add(u)), s === null ? (t.delete(o), n.add(u)) : (t.append(o, s), n.delete(u));
    }
  }
  return {
    [ty]: !0,
    values: t,
    nulls: n
  };
}, ma = (e) => {
  var t, n, r, i, o;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((o = (i = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || i === void 0 ? void 0 : i.call(r, e)) === null || o === void 0 ? void 0 : o.trim()) || void 0;
}, ny, ry = class iy {
  constructor(t) {
    var n, r, i, o, s, u, c, { baseURL: d = ma("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ma("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Qt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : iy.DEFAULT_TIMEOUT, this.logger = (i = m.logger) !== null && i !== void 0 ? i : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (o = nh(m.logLevel, "ClientOptions.logLevel", this)) !== null && o !== void 0 ? o : nh(ma("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : $C(), this.encoder = BC, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Lr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Lr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Lr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return OC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${GC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${RC()}`;
  }
  makeStatusError(t, n, r, i) {
    return pt.generate(t, n, r, i);
  }
  buildURL(t, n, r) {
    const i = !this.baseURLOverridden() && r || this.baseURL, o = MC(t) ? new URL(t) : new URL(i + (i.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(o.searchParams);
    return (!jf(s) || !jf(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (o.search = this.stringifyQuery(n)), o.toString();
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
    return new ix(this, this.makeRequest(t, n, void 0));
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
    if (We(this).debug(`[${p}] sending request`, yn({
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
        return We(this).info(`[${p}] connection ${E ? "timed out" : "failed"} - ${w}`), We(this).debug(`[${p}] connection ${E ? "timed out" : "failed"} (${w})`, yn({
          retryOfRequestLogID: r,
          url: h,
          durationMs: b - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw We(this).info(`[${p}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), We(this).debug(`[${p}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, yn({
        retryOfRequestLogID: r,
        url: h,
        durationMs: b - g,
        message: v.message
      })), E ? new $g() : new Ms({ cause: v });
    }
    const _ = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${b - g}ms`;
    if (!v.ok) {
      const w = await this.shouldRetry(v);
      if (n && w) {
        const A = `retrying, ${n} attempts remaining`;
        return await FC(v.body), We(this).info(`${_} - ${A}`), We(this).debug(`[${p}] response error (${A})`, yn({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: b - g
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const E = w ? "error; no more retries left" : "error; not retryable";
      We(this).info(`${_} - ${E}`);
      const T = await v.text().catch((A) => gl(A).message), S = DC(T), N = S ? void 0 : T;
      throw We(this).debug(`[${p}] response error (${E})`, yn({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: N,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, S, N, v.headers);
    }
    return We(this).info(_), We(this).debug(`[${p}] response start`, yn({
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
    const o = n || {}, { signal: s, method: u } = o, c = Qt(o, ["signal", "method"]), d = this._makeAbort(i);
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
    return await LC(s), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const o = n - t;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, i, o;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = s, f = this.buildURL(c, d, h);
    "timeout" in s && kC("timeout", s.timeout), s.timeout = (r = s.timeout) !== null && r !== void 0 ? r : this.timeout;
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
    let u = Lr([
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
    const r = Lr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: UC(t)
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
var De = class extends ry {
  constructor() {
    super(...arguments), this.interactions = new Qg(this), this.webhooks = new jg(this);
  }
};
ny = De;
De.GeminiNextGenAPIClient = ny;
De.GeminiNextGenAPIClientError = ht;
De.APIError = pt;
De.APIConnectionError = Ms;
De.APIConnectionTimeoutError = $g;
De.APIUserAbortError = vl;
De.NotFoundError = Og;
De.ConflictError = Gg;
De.RateLimitError = Vg;
De.BadRequestError = Ug;
De.AuthenticationError = Fg;
De.InternalServerError = Hg;
De.PermissionDeniedError = Bg;
De.UnprocessableEntityError = qg;
De.toFile = WC;
De.Interactions = Qg;
De.Webhooks = jg;
function sx(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function ax(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function lx(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ux(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function cx(e, t, n) {
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
function dx(e, t, n) {
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
  const T = a(e, ["encryptionSpec"]);
  return t !== void 0 && T != null && l(t, ["encryptionSpec"], T), r;
}
function fx(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && Ex(o);
  const s = a(e, ["config"]);
  return s != null && cx(s, n), n;
}
function hx(e, t) {
  const n = {}, r = a(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const i = a(e, ["preTunedModel"]);
  i != null && l(n, ["preTunedModel"], i);
  const o = a(e, ["trainingDataset"]);
  o != null && Tx(o, n, t);
  const s = a(e, ["config"]);
  return s != null && dx(s, n, t), n;
}
function px(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function mx(e, t) {
  const n = {}, r = a(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function gx(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function yx(e, t, n) {
  const r = {}, i = a(e, ["pageSize"]);
  t !== void 0 && i != null && l(t, ["_query", "pageSize"], i);
  const o = a(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), r;
}
function vx(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && gx(r, n), n;
}
function _x(e, t) {
  const n = {}, r = a(e, ["config"]);
  return r != null && yx(r, n), n;
}
function bx(e, t) {
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
function wx(e, t) {
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
function Sx(e, t) {
  const n = {}, r = a(e, ["name"]);
  r != null && l(n, ["model"], r);
  const i = a(e, ["name"]);
  return i != null && l(n, ["endpoint"], i), n;
}
function Ex(e, t) {
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
function Tx(e, t, n) {
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
  o != null && l(n, ["state"], pg(o));
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
  return p != null && l(n, ["tunedModel"], Sx(p)), n;
}
function wl(e, t) {
  const n = {}, r = a(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const i = a(e, ["name"]);
  i != null && l(n, ["name"], i);
  const o = a(e, ["state"]);
  o != null && l(n, ["state"], pg(o));
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
  const T = a(e, ["customBaseModel"]);
  T != null && l(n, ["customBaseModel"], T);
  const S = a(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let D = S;
    Array.isArray(D) && (D = D.map((B) => B)), l(n, ["evaluateDatasetRuns"], D);
  }
  const N = a(e, ["experiment"]);
  N != null && l(n, ["experiment"], N);
  const A = a(e, ["fullFineTuningSpec"]);
  A != null && l(n, ["fullFineTuningSpec"], A);
  const k = a(e, ["labels"]);
  k != null && l(n, ["labels"], k);
  const L = a(e, ["outputUri"]);
  L != null && l(n, ["outputUri"], L);
  const G = a(e, ["pipelineJob"]);
  G != null && l(n, ["pipelineJob"], G);
  const Z = a(e, ["serviceAccount"]);
  Z != null && l(n, ["serviceAccount"], Z);
  const K = a(e, ["tunedModelDisplayName"]);
  K != null && l(n, ["tunedModelDisplayName"], K);
  const C = a(e, ["tuningJobState"]);
  C != null && l(n, ["tuningJobState"], C);
  const R = a(e, ["veoTuningSpec"]);
  R != null && l(n, ["veoTuningSpec"], R);
  const Y = a(e, ["distillationSamplingSpec"]);
  Y != null && l(n, ["distillationSamplingSpec"], Y);
  const J = a(e, ["tuningJobMetadata"]);
  return J != null && l(n, ["tuningJobMetadata"], J), n;
}
function Ax(e, t) {
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
var Cx = class extends Bt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Dn(Ft.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
      const c = mx(e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
      const c = px(e);
      return s = q("{name}", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (i = e.config) === null || i === void 0 ? void 0 : i.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), o.then((d) => oy(d));
    }
  }
  async listInternal(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _x(e);
      return s = q("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = wx(d), f = new If();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vx(e);
      return s = q("tunedModels", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = bx(d), f = new If();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, i;
    let o, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ax(e);
      return s = q("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = ux(d), f = new Rf();
        return Object.assign(f, h), f;
      });
    } else {
      const c = sx(e);
      return s = q("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, o = this.apiClient.request({
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
        const h = lx(d), f = new Rf();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, i = "", o = {};
    if (this.apiClient.isVertexAI()) {
      const s = hx(e, e);
      return i = q("tuningJobs", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
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
      const s = fx(e);
      return i = q("tunedModels", s._url), o = s._query, delete s._url, delete s._query, r = this.apiClient.request({
        path: i,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Ax(u));
    }
  }
}, xx = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Ix = 1024 * 1024 * 8, Rx = 3, Px = 1e3, Mx = 2, ts = "x-goog-upload-status";
async function Nx(e, t, n, r) {
  var i;
  const o = await sy(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[ts]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function kx(e, t, n, r) {
  var i;
  const o = await sy(e, t, n, r), s = await o?.json();
  if (((i = o?.headers) === null || i === void 0 ? void 0 : i[ts]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = og(s), c = new Jw();
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
  let d = 0, h = 0, f = new ul(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Ix, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let y = 0, v = Px;
    for (; y < Rx; ) {
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
      }), !((o = f?.headers) === null || o === void 0) && o[ts]) break;
      y++, await Lx(v), v = v * Mx;
    }
    if (h += m, ((s = f?.headers) === null || s === void 0 ? void 0 : s[ts]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Dx(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function Lx(e) {
  return new Promise((t) => setTimeout(t, e));
}
var $x = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Nx(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await kx(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Dx(e);
  }
}, Ux = class {
  create(e, t, n) {
    return new Fx(e, t, n);
  }
}, Fx = class {
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
}, ih = "x-goog-api-key", Bx = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(ih) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(ih, this.apiKey);
    }
  }
}, Ox = "gl-node/", Gx = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new De({
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
    const n = gw(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Bx(this.apiKey);
    this.apiClient = new LA({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: Ox + "web",
      uploader: new $x(),
      downloader: new xx()
    }), this.models = new tC(this.apiClient), this.live = new YA(this.apiClient, r, new Ux()), this.batches = new XS(this.apiClient), this.chats = new D0(this.models, this.apiClient), this.caches = new M0(this.apiClient), this.files = new W0(this.apiClient), this.operations = new nC(this.apiClient), this.authTokens = new bC(this.apiClient), this.tunings = new Cx(this.apiClient), this.fileSearchStores = new IC(this.apiClient);
  }
};
function oh(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Zn(e) {
  return { text: String(e || "") };
}
function qx(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Vx(e) {
  if (typeof e == "string") return [Zn(e)];
  if (!Array.isArray(e)) return [Zn("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Zn(n.text || "") : n.type === "image_url" && n.image_url?.url ? qx(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Zn("")];
}
function sh() {
  return {
    role: "user",
    parts: [Zn("继续。")]
  };
}
function ah(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Hx(e) {
  switch (e) {
    case "high":
      return oi.HIGH;
    case "medium":
      return oi.MEDIUM;
    default:
      return oi.LOW;
  }
}
function lh(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Kx(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Wx(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function Jx(e) {
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
          response: oh(d.content)
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
        parts: [...s.content ? [Zn(s.content)] : [], ...s.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: oh(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: s.role === "assistant" ? "model" : "user",
      parts: Vx(s.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: sh().parts
  };
  const i = n[n.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: n,
    latestMessage: sh().parts
  };
}
function zx(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function uh(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
var Yx = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new Gx({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  createChat(e) {
    const t = Jx(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = Kx(e), i = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (i.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: Hx(e.reasoning.effort)
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
        if (g = y, lh(y).forEach((v, b) => {
          const _ = `${v.label}:${b}`;
          f.set(_, uh(f.get(_) || "", v.text));
        }), m = (y.functionCalls || []).map((v, b) => ({
          id: v.id || `google-tool-${b + 1}`,
          name: v.name || "",
          arguments: JSON.stringify(v.args || {})
        })).filter((v) => v.name), s = m, m.length) p = "";
        else {
          const v = ah(y);
          p = uh(p, v);
        }
        zx(n, {
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
      r = await e.sendMessage(u), i = lh(r), o = r.functionCalls?.length ? "" : ah(r);
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
      const n = { message: Wx(e.toolResponses) };
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
}, Xx = [
  "工具使用规则：",
  "- `LS` 只列目录的一级子项，适合看某层有哪些文件夹/文件，不能搜索文件内容。",
  "- `Glob` 只按路径模式匹配文件，适合先缩小文件集合；它不检查文件内容对不对。",
  "- `Grep` 只搜索文件内容里的命中片段；命中片段不是全文，也不代表上下文完整。结果很多时可配合 `offset` 和 `limit` 分页继续看。",
  "- `Read` 返回的是带行号的文件内容；如果返回 `truncated: true`、`hasMoreAfter: true`、`charLimited: true` 或 `nextStartLine`，表示当前只拿到一段，不是全文。",
  "- `RunSlashCommand` 执行的是用户当前真实酒馆实例中的斜杠命令，不是快照；查询类可以直接用，可能改动实例状态的命令要先明确说明并征得用户同意。",
  "- `ReadSkillsCatalog` 读取技能目录索引，只看有哪些 skill、摘要和触发词；不要把它当 skill 正文。",
  "- `ReadSkill` 读取某一个 skill 的完整正文；命中目录里某项后，再按需读取对应 skill，不要默认全读。",
  "- `UpdateSkill` 更新已有 skill 的正文或元数据，并同步刷新 Skills.json；它不是新建工具。",
  '- `GenerateSkill` 用于把刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill；先 `action: "propose"`，用户同意后再 `action: "save"`。',
  "- `DeleteSkill` 删除已有 skill，并同时从技能正文文件与 Skills.json 中移除该项。",
  "- 更新或删除 skill 属于持久化修改；只有在用户明确要求修改/删除该 skill 时才调用，不要自己擅自覆盖或清除。",
  "- 调用工具时，使用工具定义里的确切名字和参数名，不要自己改名或脑补额外字段。",
  "- 工具如果返回 `ok: false`、`error`、`raw`、`truncated`、`warning` 等字段，必须按字面理解并如实告诉用户，不要把失败、截断、空结果当成成功证据。",
  "- 如果工具返回的是原样 API / 代理错误文本，就直接基于该文本说明问题，不要擅自改写成别的原因。",
  "- 当工具结果不足以支撑结论时，要继续查证，或明确说明当前还不能确认。"
], Qx = [
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
      description: "更新已有 skill 的正文或元数据，并同步回写对应 skill 文件与 Skills.json。优先传 id；也可传 filename。未提供的字段会尽量保留原值。",
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
      description: ["将刚完成的一次大流程、多次试错或值得复用的过程沉淀成 skill。", '必须先调用 `action: "propose"` 请求用户同意；只有拿到 approvalToken 后，才能调用 `action: "save"` 真正写入 skill 文件和 Skills.json。'].join(`
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
function Zx(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function ch(e = [], t) {
  const n = e.slice(0, 3), r = [];
  return n.forEach((i) => r.push(t(i))), e.length > n.length && r.push(`……其余 ${e.length - n.length} 项见详细结果`), r;
}
function ay(e) {
  const t = Zx(e.content, null);
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
    t.truncated && r.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (r.push(""), r.push(...ch(n, (o) => `- ${o.publicPath}${o.source ? ` [${o.source}]` : ""}`)));
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
    t.truncated && r.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (r.push(""), r.push(...ch(n, (o) => `- ${o.publicPath}${o.type === "directory" ? " [目录]" : ""}`)));
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
        t.enabled === !1 ? "状态：已保存但未启用" : "状态：已启用"
      ].filter(Boolean).join(`
`),
      details: t.note ? String(t.note) : ""
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
var jx = 3.35, eI = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), tI = new TextEncoder();
function nI(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: r, persistSession: i, render: o, showToast: s, post: u, createRequestId: c, safeJsonParse: d, describeError: h, formatToolResultDisplay: f, buildTextWithAttachmentSummary: p, buildUserContentParts: m, normalizeAttachments: g, normalizeThoughtBlocks: y, normalizeSlashCommand: v, normalizeSlashSkillTrigger: b, shouldRequireSlashCommandApproval: _, buildSlashApprovalResult: w, isAbortError: E, createAdapter: T, getActiveProviderConfig: S, getSystemPrompt: N, SYSTEM_PROMPT: A, SUMMARY_SYSTEM_PROMPT: k, HISTORY_SUMMARY_PREFIX: L, MAX_CONTEXT_TOKENS: G, SUMMARY_TRIGGER_TOKENS: Z, DEFAULT_PRESERVED_TURNS: K, MIN_PRESERVED_TURNS: C, MAX_TOOL_ROUNDS: R, REQUEST_TIMEOUT_MS: Y, TOOL_DEFINITIONS: J, TOOL_NAMES: D } = e;
  let B = !1, z = 0, fe = "", ie = "", he = 0, _e = 0;
  function Re() {
    const x = typeof N == "function" ? N() : A;
    return String(x || A).trim() || A;
  }
  function ze() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: G,
      summaryActive: !1
    };
  }
  function un() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${L}
${t.historySummary.trim()}`
    } : null;
  }
  function ki() {
    const x = t.activeRun?.lightBrakeMessage;
    return x ? {
      role: "system",
      content: x
    } : null;
  }
  function Di(x) {
    return `${Math.max(0, Math.round((Number(x) || 0) / 1e3))}k`;
  }
  function yr(x = t.contextStats) {
    return `${Di(x.usedTokens)}/${Di(x.budgetTokens)}`;
  }
  function Gt(x, P = 1800) {
    const $ = String(x || "").replace(/\s+/g, " ").trim();
    return $.length <= P ? $ : `${$.slice(0, P)}…`;
  }
  function qt(x) {
    if (x?.approvalRequest) return "";
    if (x.role === "tool") return Gt(f(x).summary || x.content || "", 1400);
    if (x.role === "assistant" && Array.isArray(x.toolCalls) && x.toolCalls.length) {
      const P = x.toolCalls.map(($) => `工具: ${$.name} ${$.arguments || "{}"}`.trim());
      return Gt([x.content || "", ...P].filter(Boolean).join(`
`), 1600);
    }
    return Gt(p(x.content || "", x.attachments), 1600);
  }
  function Li(x = t.messages) {
    const P = [];
    let $ = [];
    return (x || []).filter((O) => !O?.approvalRequest).forEach((O) => {
      if (O.role === "user" && $.length) {
        P.push($), $ = [O];
        return;
      }
      $.push(O);
    }), $.length && P.push($), P.filter((O) => O.length);
  }
  function ev(x, P = "") {
    const $ = [];
    return P?.trim() && ($.push("已有历史摘要:"), $.push(P.trim()), $.push("")), x.forEach((O, Q) => {
      $.push(`第 ${Q + 1} 段历史:`), O.forEach((le) => {
        const me = le.role === "user" ? "用户" : le.role === "assistant" ? "助手" : `工具${le.toolName ? `(${le.toolName})` : ""}`;
        $.push(`${me}: ${qt(le) || "[空]"}`);
      }), $.push("");
    }), $.join(`
`).trim();
  }
  function tv(x, P = "") {
    const $ = [];
    return P?.trim() && $.push(P.trim()), x.forEach((O, Q) => {
      const le = O.map((me) => `${me.role === "user" ? "用户" : me.role === "assistant" ? "助手" : `工具${me.toolName ? `(${me.toolName})` : ""}`}: ${qt(me) || "[空]"}`).join(`
`);
      $.push(`补充历史 ${Q + 1}:
${le}`);
    }), Gt($.join(`

`), 6e3);
  }
  function nv() {
    let x = !1;
    return t.messages = t.messages.map((P) => {
      if (P?.role !== "assistant") return P;
      const $ = Array.isArray(P.thoughts) && P.thoughts.length, O = !!P.providerPayload;
      return !$ && !O ? P : (x = !0, {
        ...P,
        thoughts: [],
        providerPayload: void 0
      });
    }), x;
  }
  function rv() {
    const x = Li();
    return x.length ? x[x.length - 1] : [];
  }
  function ju(x = [], P = null) {
    const $ = y(x);
    if (!$.length) return $;
    const O = /* @__PURE__ */ new Set();
    return rv().forEach((Q) => {
      Q === P || Q?.role !== "assistant" || y(Q.thoughts).forEach((le) => {
        O.add(`${le.label}\0${le.text}`);
      });
    }), $.filter((Q) => !O.has(`${Q.label}\0${Q.text}`));
  }
  function iv(x = []) {
    return x.map((P) => {
      const $ = Array.isArray(P.content) ? P.content.map((O) => !O || typeof O != "object" ? "" : O.type === "text" ? O.text || "" : O.type === "image_url" ? `[image:${O.name || O.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : P.content || "";
      return P.role === "assistant" && Array.isArray(P.tool_calls) && P.tool_calls.length ? {
        role: "assistant",
        content: [$, P.tool_calls.map((O) => JSON.stringify({
          id: O.id,
          name: O.function?.name || "",
          arguments: O.function?.arguments || "{}"
        })).join(`
`)].filter(Boolean).join(`
`)
      } : P.role === "tool" ? {
        role: "tool",
        content: [P.tool_call_id || "", P.content || ""].filter(Boolean).join(`
`)
      } : {
        role: P.role,
        content: $
      };
    });
  }
  function Vs(x = [], P = []) {
    return [...iv(x), {
      role: "system",
      content: P.length ? `TOOLS
${JSON.stringify(P)}` : ""
    }].filter(($) => $.content);
  }
  function ov(x) {
    return Math.ceil(tI.encode(String(x || "")).length / jx);
  }
  function $i({ messages: x = [], tools: P = [] } = {}) {
    return ov(JSON.stringify(Vs(x, P)));
  }
  function ec(x = [], P = J) {
    const $ = S();
    return JSON.stringify({
      provider: String($?.provider || ""),
      model: String($?.model || ""),
      messages: Vs(x, P)
    });
  }
  function sv(x) {
    const P = String(x?.model || "").trim();
    return P || (x?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function tc(x, P) {
    const $ = await fetch(x, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(P)
    });
    if (!$.ok) throw new Error(`tokenizer_http_${$.status}`);
    return await $.json();
  }
  async function av(x = [], P = "") {
    if (!x.length) return 0;
    const $ = `/api/tokenizers/openai/count?model=${encodeURIComponent(P || "gpt-4o")}`;
    let O = -1;
    for (const Q of x) {
      const le = await tc($, [Q]), me = Number(le?.token_count);
      if (!Number.isFinite(me)) throw new Error("tokenizer_invalid_response");
      O += me;
    }
    return Math.max(0, O);
  }
  async function lv(x, P) {
    const $ = await tc(x, { text: P }), O = Number($?.count);
    if (!Number.isFinite(O)) throw new Error("tokenizer_invalid_response");
    return O;
  }
  async function nc({ messages: x = [], tools: P = [] } = {}) {
    const $ = S(), O = String($?.provider || ""), Q = Vs(x, P), le = JSON.stringify(Q);
    try {
      if (eI.has(O)) return await av(Q, sv($));
      if (O === "anthropic") return await lv("/api/tokenizers/claude/encode", le);
    } catch {
      return $i({
        messages: x,
        tools: P
      });
    }
    return $i({
      messages: x,
      tools: P
    });
  }
  async function rc(x = [], P = J) {
    const $ = ec(x, P), O = !!t.historySummary;
    let Q = ie === $ ? he : await nc({
      messages: x,
      tools: P
    });
    return Number.isFinite(Q) || (Q = $i({
      messages: x,
      tools: P
    })), ie = $, he = Q, fe = $, t.contextStats = {
      usedTokens: Q,
      budgetTokens: G,
      summaryActive: O
    }, Q;
  }
  function uv(x = [], P = J) {
    const $ = ec(x, P), O = !!t.historySummary, Q = ie === $ ? he : $i({
      messages: x,
      tools: P
    });
    if (fe = $, t.contextStats = {
      usedTokens: Q,
      budgetTokens: G,
      summaryActive: O
    }, ie === $) return;
    const le = ++_e;
    nc({
      messages: x,
      tools: P
    }).then((me) => {
      if (le !== _e || fe !== $ || !Number.isFinite(me)) return;
      ie = $, he = me;
      const ue = t.contextStats.usedTokens !== me || t.contextStats.summaryActive !== O || t.contextStats.budgetTokens !== G;
      t.contextStats = {
        usedTokens: me,
        budgetTokens: G,
        summaryActive: O
      }, ue && o();
    }).catch(() => {
    });
  }
  function cn(x) {
    x?.role === "user" && nv(), t.messages.push({
      ...x,
      attachments: g(x.attachments),
      thoughts: x?.role === "assistant" ? ju(x.thoughts) : y(x.thoughts)
    }), i();
  }
  function cv(x) {
    return Array.isArray(x) ? x.filter((P) => P && typeof P == "object" && P.name).map((P, $) => ({
      id: String(P.id || c(`tool-${$ + 1}`)),
      name: String(P.name || ""),
      arguments: typeof P.arguments == "string" ? P.arguments : JSON.stringify(P.arguments || {})
    })) : [];
  }
  function ic({ persist: x = !1 } = {}) {
    const P = Date.now();
    if ((x || P - z >= 1500) && (i(), z = P), B) return;
    B = !0;
    const $ = () => {
      B = !1, o();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame($);
      return;
    }
    setTimeout($, 16);
  }
  function dv() {
    const x = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(x), o(), x;
  }
  function oc(x, P = {}) {
    x && (typeof P.content == "string" && (x.content = P.content), P.providerPayload && typeof P.providerPayload == "object" && (x.providerPayload = P.providerPayload), Array.isArray(P.thoughts) && (x.thoughts = ju(P.thoughts, x)), Array.isArray(P.toolCalls) && (x.toolCalls = cv(P.toolCalls)), typeof P.streaming == "boolean" && (x.streaming = P.streaming));
  }
  function Hs(x, P = {}) {
    x && (oc(x, {
      ...P,
      streaming: !1
    }), ic({ persist: !0 }));
  }
  function fv(x, P) {
    for (const [$, O] of n.entries())
      O.runId === x && (n.delete($), O.cleanup?.(), O.reject(P));
  }
  function hv(x, P) {
    for (const [$, O] of r.entries())
      O.runId === x && (r.delete($), t.pendingApproval?.id === $ && (t.pendingApproval = null), O.cleanup?.(), O.reject(P));
    o();
  }
  function pv(x = "本轮请求已终止。") {
    const P = t.activeRun;
    P && (P.cancelNotice = x, t.progressLabel = "终止中", fv(P.id, /* @__PURE__ */ new Error("tool_aborted")), hv(P.id, /* @__PURE__ */ new Error("tool_aborted")), P.controller.abort(), o());
  }
  function Ks(x = t.messages) {
    const P = [{
      role: "system",
      content: Re()
    }], $ = un(), O = ki();
    $ && P.push($), O && P.push(O);
    for (const Q of x)
      if (!Q?.approvalRequest) {
        if (Q.role === "assistant" && Array.isArray(Q.toolCalls) && Q.toolCalls.length) {
          P.push({
            role: "assistant",
            content: Q.content || "",
            providerPayload: Q.providerPayload,
            tool_calls: Q.toolCalls.map((le) => ({
              id: le.id,
              type: "function",
              function: {
                name: le.name,
                arguments: le.arguments
              }
            }))
          });
          continue;
        }
        if (Q.role === "tool") {
          P.push({
            role: "tool",
            tool_call_id: Q.toolCallId,
            content: Q.content
          });
          continue;
        }
        P.push({
          role: Q.role,
          providerPayload: Q.providerPayload,
          content: Q.role === "user" ? m(Q) : Q.content
        });
      }
    return P;
  }
  function Ws() {
    const x = Li(), P = Math.min(t.archivedTurnCount, x.length);
    return x.slice(P).flat();
  }
  function mv() {
    const x = Li(), P = Math.min(t.archivedTurnCount, x.length);
    return P <= 0 ? !1 : (t.messages = x.slice(P).flat(), t.archivedTurnCount = 0, !0);
  }
  function sc(x, P, $) {
    const O = String($?.message || $ || "tool_failed"), [Q] = O.split(":");
    return {
      ok: !1,
      toolName: x,
      path: typeof P?.path == "string" ? P.path : "",
      error: Q || "tool_failed",
      raw: O,
      message: h($)
    };
  }
  function ac(x, P, $) {
    if (!x || !P || !$) return;
    const O = `${P}::${$}`;
    x.toolErrorStreakKey === O ? x.toolErrorStreakCount += 1 : (x.toolErrorStreakKey = O, x.toolErrorStreakCount = 1), x.toolErrorStreakCount >= 3 && x.lastLightBrakeKey !== O && (x.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${P}\` 都返回了同一个错误：\`${$}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, x.lastLightBrakeKey = O);
  }
  function gv(x) {
    x && (x.toolErrorStreakKey = "", x.toolErrorStreakCount = 0);
  }
  async function yv(x, P, $) {
    if (!P.length) return;
    const O = ev(P, t.historySummary), Q = tv(P, t.historySummary), le = S();
    try {
      const me = await x.chat({
        systemPrompt: k,
        messages: [{
          role: "user",
          content: O
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(le.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: $
      });
      t.historySummary = String(me.text || "").trim() || Q;
    } catch {
      t.historySummary = Q;
    }
  }
  async function vv(x, P) {
    const $ = [K, C];
    let O = Ws(), Q = Ks(O);
    if (await rc(Q), t.contextStats.usedTokens <= Z) return Q;
    for (const le of $) {
      const me = Li(), ue = Math.max(t.archivedTurnCount, me.length - Math.min(le, me.length));
      if (ue > t.archivedTurnCount && (await yv(x, me.slice(t.archivedTurnCount, ue), P), t.archivedTurnCount = ue, mv(), i()), O = Ws(), Q = Ks(O), await rc(Q), t.contextStats.usedTokens <= Z)
        return s(`已压缩较早历史，当前上下文 ${yr()}`), o(), Q;
    }
    return s(`最近对话本身已接近上限，当前上下文 ${yr()}`), o(), Q;
  }
  function lc(x, P, $ = {}) {
    const O = c("tool"), Q = t.activeRun;
    return Q && Q.id === $.runId && Q.toolRequestIds.add(O), new Promise((le, me) => {
      let ue = !1, we = null, be = null;
      const Ve = () => {
        we && (clearTimeout(we), we = null), $.signal && be && $.signal.removeEventListener("abort", be);
        const mt = t.activeRun;
        mt && mt.id === $.runId && mt.toolRequestIds.delete(O);
      }, je = (mt) => {
        ue || (ue = !0, n.delete(O), Ve(), me(mt));
      }, Te = (mt) => {
        ue || (ue = !0, n.delete(O), Ve(), le(mt));
      };
      if (be = () => {
        u("xb-assistant:tool-abort", { requestId: O }), je(/* @__PURE__ */ new Error("tool_aborted"));
      }, we = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: O }), je(/* @__PURE__ */ new Error("tool_timeout"));
      }, Y), n.set(O, {
        runId: $.runId,
        cleanup: Ve,
        resolve: Te,
        reject: je
      }), $.signal) {
        if ($.signal.aborted) {
          be();
          return;
        }
        $.signal.addEventListener("abort", be, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: O,
        name: x,
        arguments: P
      });
    });
  }
  function uc(x, P = {}) {
    const $ = c("approval"), O = t.activeRun?.id === P.runId ? t.activeRun : null;
    return t.pendingApproval = {
      id: $,
      ...x,
      status: "pending"
    }, o(), new Promise((Q, le) => {
      let me = !1, ue = null;
      const we = () => {
        O && O.toolRequestIds.delete($), P.signal && ue && P.signal.removeEventListener("abort", ue);
      }, be = () => {
        t.pendingApproval?.id === $ && (t.pendingApproval = null, o());
      }, Ve = (Te) => {
        me || (me = !0, r.delete($), we(), be(), Q(Te));
      }, je = (Te) => {
        me || (me = !0, r.delete($), we(), be(), le(Te));
      };
      if (ue = () => {
        je(/* @__PURE__ */ new Error("tool_aborted"));
      }, O && O.toolRequestIds.add($), r.set($, {
        runId: P.runId,
        cleanup: we,
        resolve: (Te) => {
          Ve(Te);
        },
        reject: je
      }), P.signal) {
        if (P.signal.aborted) {
          ue();
          return;
        }
        P.signal.addEventListener("abort", ue, { once: !0 });
      }
    });
  }
  function _v(x, P = {}) {
    return uc({
      kind: "slash-command",
      command: x
    }, P);
  }
  function bv(x = {}, P = {}) {
    return uc({
      kind: "generate-skill",
      title: String(x.title || "").trim(),
      reason: String(x.reason || "").trim(),
      sourceSummary: String(x.sourceSummary || "").trim()
    }, P);
  }
  function wv(x = t.messages) {
    for (let P = (x || []).length - 1; P >= 0; P -= 1) {
      const $ = x[P];
      if (!$?.approvalRequest && $?.role === "user")
        return $;
    }
    return null;
  }
  function Sv(x) {
    const P = b(x);
    return P ? {
      normalizedTrigger: P,
      matches: (Array.isArray(t.runtime?.skillsCatalog?.skills) ? t.runtime.skillsCatalog.skills : []).filter(($) => $ && $.enabled !== !1 && Array.isArray($.slashTriggers) && $.slashTriggers.includes(P))
    } : {
      normalizedTrigger: "",
      matches: []
    };
  }
  async function Ev(x) {
    const P = wv();
    if (!P) return null;
    const $ = String(P.content || "").trim();
    if (!$.startsWith("/")) return null;
    const O = b($);
    if (!O) return null;
    const { matches: Q } = Sv(O);
    if (!Q.length) return null;
    if (Q.length > 1)
      return s(`命令 ${O} 对应了多条已启用 skill，本轮已跳过自动读取。`), null;
    const le = Q[0], me = c("auto-read-skill");
    cn({
      role: "assistant",
      content: "",
      toolCalls: [{
        id: me,
        name: D.READ_SKILL,
        arguments: JSON.stringify({ id: le.id })
      }]
    }), o(), t.progressLabel = "工具中", o();
    let ue;
    try {
      ue = await lc(D.READ_SKILL, { id: le.id }, {
        runId: x.id,
        signal: x.controller.signal
      });
    } catch (we) {
      ue = sc(D.READ_SKILL, { id: le.id }, we);
    }
    return cn({
      role: "tool",
      toolCallId: me,
      toolName: D.READ_SKILL,
      content: JSON.stringify(ue, null, 2)
    }), o(), ue?.ok === !1 ? (s(`自动读取 skill 失败：${ue.message || ue.error || le.id}`), null) : ue;
  }
  async function Tv(x) {
    const P = T();
    let $ = 0, O = null;
    for (await Ev(x); $ < R; ) {
      if (x.controller.signal.aborted) throw new Error("assistant_aborted");
      $ += 1, t.currentRound = $, t.progressLabel = "生成中", o();
      const Q = S();
      let le = null;
      const me = (we = {}) => {
        const be = typeof we.text == "string", Ve = Array.isArray(we.thoughts);
        !be && !Ve || (le || (le = dv()), oc(le, {
          ...be ? { content: we.text } : {},
          ...Ve ? { thoughts: we.thoughts } : {}
        }), ic());
      };
      let ue;
      try {
        const we = {
          systemPrompt: Re(),
          tools: J,
          toolChoice: "auto",
          temperature: Q.temperature,
          maxTokens: Q.maxTokens,
          reasoning: {
            enabled: Q.reasoningEnabled,
            effort: Q.reasoningEffort
          },
          signal: x.controller.signal,
          onStreamProgress: me
        };
        Array.isArray(O) && O.length && P?.supportsSessionToolLoop ? we.toolResponses = O : we.messages = await vv(P, x.controller.signal), ue = await P.chat(we);
      } catch (we) {
        throw le && Hs(le), we;
      }
      if (Array.isArray(ue.toolCalls) && ue.toolCalls.length) {
        O = null, le ? Hs(le, {
          content: ue.text || "",
          thoughts: ue.thoughts,
          toolCalls: ue.toolCalls,
          providerPayload: ue.providerPayload
        }) : cn({
          role: "assistant",
          content: ue.text || "",
          toolCalls: ue.toolCalls,
          thoughts: ue.thoughts,
          providerPayload: ue.providerPayload
        }), o();
        const we = [];
        for (const be of ue.toolCalls) {
          if (x.controller.signal.aborted) throw new Error("assistant_aborted");
          const Ve = d(be.arguments, {}), je = be.name === D.RUN_SLASH_COMMAND ? v(Ve.command) : "";
          t.progressLabel = "工具中", o();
          let Te = null;
          try {
            be.name === D.RUN_SLASH_COMMAND && _(je) && (t.progressLabel = "确认中", o(), await _v(je, {
              runId: x.id,
              signal: x.controller.signal
            }) || (Te = w(je, !1))), be.name === D.GENERATE_SKILL && String(Ve.action || "").trim() === "propose" && (t.progressLabel = "确认中", o(), await bv(Ve, {
              runId: x.id,
              signal: x.controller.signal
            }) || (Te = {
              ok: !0,
              action: "propose",
              approved: !1,
              skipped: !0,
              title: String(Ve.title || "").trim(),
              note: "用户未同意生成 skill，本次已跳过。"
            })), Te || (Te = await lc(be.name, Ve, {
              runId: x.id,
              signal: x.controller.signal
            })), be.name === D.RUN_SLASH_COMMAND && je && Te?.ok !== !1 && _(je) && (Te = {
              ...Te,
              approval: w(je, !0)
            }), Te?.ok === !1 && Te.error !== "user_declined" ? ac(x, be.name, Te.error || "tool_failed") : gv(x);
          } catch (mt) {
            if (E(mt)) throw mt;
            Te = sc(be.name, Ve, mt), ac(x, be.name, Te.error);
          }
          cn({
            role: "tool",
            toolCallId: be.id,
            toolName: be.name,
            content: JSON.stringify(Te, null, 2)
          }), we.push({
            id: be.id,
            name: be.name,
            response: Te
          }), o();
        }
        P?.supportsSessionToolLoop && (O = we);
        continue;
      }
      O = null, le ? Hs(le, {
        content: ue.text || "没有拿到有效回复。",
        thoughts: ue.thoughts,
        providerPayload: ue.providerPayload
      }) : cn({
        role: "assistant",
        content: ue.text || "没有拿到有效回复。",
        thoughts: ue.thoughts,
        providerPayload: ue.providerPayload
      }), t.progressLabel = "", o();
      return;
    }
    cn({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${R}/${R}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", o();
  }
  return {
    resetCompactionState: ze,
    buildContextMeterLabel: yr,
    updateContextStats: uv,
    pushMessage: cn,
    cancelActiveRun: pv,
    toProviderMessages: Ks,
    getActiveContextMessages: Ws,
    runAssistantLoop: Tv
  };
}
var ly = "openai-compatible", uy = "默认", Sl = {
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
    provider: ly,
    modelConfigs: Au()
  };
}
function fi(e) {
  return String(e || "").trim() || "默认";
}
function rI(e = {}) {
  const t = Au();
  return Object.keys(Sl).forEach((n) => {
    t[n] = {
      ...Sl[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function iI(e) {
  return typeof e == "string" && e.trim() ? e : ly;
}
function oI(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs
  } } : {};
}
function sI(e = {}, t) {
  const n = {}, r = oI(e, t);
  return Object.entries(r).forEach(([i, o]) => {
    if (!o || typeof o != "object") return;
    const s = fi(i);
    n[s] = {
      provider: iI(o.provider),
      modelConfigs: rI(o.modelConfigs || {})
    };
  }), Object.keys(n).length || (n[uy] = Cu()), n;
}
function aI(e, t) {
  const n = fi(t);
  return e[n] ? n : Object.keys(e)[0];
}
function cy(e = {}) {
  const t = sI(e, fi(e.currentPresetName || e.presetDraftName || "默认")), n = aI(t, e.currentPresetName), r = t[n] || Cu();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: n,
    presetDraftName: fi(e.presetDraftName || n),
    presetNames: Object.keys(t),
    presets: t,
    provider: r.provider,
    modelConfigs: r.modelConfigs
  };
}
var lI = /* @__PURE__ */ new Set([
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
]), uI = /* @__PURE__ */ new Set([
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
function Iu(e) {
  const t = xu(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function cI(e) {
  const t = Iu(e);
  return t ? `/${t}` : "";
}
function dI(e) {
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
function ko(e) {
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
function fI(e) {
  const t = String(e || "").trim();
  return t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}
function ya(e) {
  const t = fI(e).toLowerCase();
  return [
    "false",
    "off",
    "0",
    "no"
  ].includes(t);
}
function va(e, t = [], n = {}) {
  const { allowPositional: r = !1 } = n, i = ko(e);
  return !r && i.positional.length ? !1 : Array.from(i.named.keys()).every((o) => t.includes(o));
}
function hI(e) {
  const t = Iu(e);
  if (!t) return !1;
  if (lI.has(t)) return !0;
  const n = dI(e);
  if (!uI.has(t)) return !1;
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
      const r = ko(n);
      return !r.positional.length && !r.named.has("name") && r.named.has("create") && ya(r.named.get("create"));
    }
    case "getpersonabook": {
      const r = ko(n);
      return r.positional.length || r.named.has("name") ? !1 : r.named.size ? r.named.size === 1 && r.named.has("create") && ya(r.named.get("create")) : !0;
    }
    case "getcharbook": {
      const r = ko(n), i = ["type", "create"];
      return !Array.from(r.named.keys()).every((o) => i.includes(o)) || r.named.has("name") || r.named.has("create") && !ya(r.named.get("create")) ? !1 : r.positional.length <= 1;
    }
    default:
      return !1;
  }
}
function pI(e) {
  return Iu(e) ? !hI(e) : !1;
}
var Tl = function(e, t) {
  return Tl = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Tl(e, t);
};
function mI(e, t) {
  if (typeof t != "function" && t !== null) throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  Tl(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var ce = function() {
  return ce = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, ce.apply(this, arguments);
};
function ns(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, i = t.length, o; r < i; r++) (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var Ge = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Fe = Object.keys, Ee = Array.isArray;
typeof Promise < "u" && !Ge.Promise && (Ge.Promise = Promise);
function lt(e, t) {
  return typeof t != "object" || Fe(t).forEach(function(n) {
    e[n] = t[n];
  }), e;
}
var ir = Object.getPrototypeOf, gI = {}.hasOwnProperty;
function Ze(e, t) {
  return gI.call(e, t);
}
function or(e, t) {
  typeof t == "function" && (t = t(ir(e))), (typeof Reflect > "u" ? Fe : Reflect.ownKeys)(t).forEach(function(n) {
    nn(e, n, t[n]);
  });
}
var dy = Object.defineProperty;
function nn(e, t, n, r) {
  dy(e, t, lt(n && Ze(n, "get") && typeof n.get == "function" ? {
    get: n.get,
    set: n.set,
    configurable: !0
  } : {
    value: n,
    configurable: !0,
    writable: !0
  }, r));
}
function fr(e) {
  return { from: function(t) {
    return e.prototype = Object.create(t.prototype), nn(e.prototype, "constructor", e), { extend: or.bind(null, e.prototype) };
  } };
}
var yI = Object.getOwnPropertyDescriptor;
function fy(e, t) {
  var n = yI(e, t), r;
  return n || (r = ir(e)) && fy(r, t);
}
var vI = [].slice;
function ks(e, t, n) {
  return vI.call(e, t, n);
}
function hy(e, t) {
  return t(e);
}
function jr(e) {
  if (!e) throw new Error("Assertion Failed");
}
function py(e) {
  Ge.setImmediate ? setImmediate(e) : setTimeout(e, 0);
}
function _I(e, t) {
  return e.reduce(function(n, r, i) {
    var o = t(r, i);
    return o && (n[o[0]] = o[1]), n;
  }, {});
}
function Ut(e, t) {
  if (typeof t == "string" && Ze(e, t)) return e[t];
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
function at(e, t, n) {
  if (!(!e || t === void 0) && !("isFrozen" in Object && Object.isFrozen(e)))
    if (typeof t != "string" && "length" in t) {
      jr(typeof n != "string" && "length" in n);
      for (var r = 0, i = t.length; r < i; ++r) at(e, t[r], n[r]);
    } else {
      var o = t.indexOf(".");
      if (o !== -1) {
        var s = t.substr(0, o), u = t.substr(o + 1);
        if (u === "") n === void 0 ? Ee(e) && !isNaN(parseInt(s)) ? e.splice(s, 1) : delete e[s] : e[s] = n;
        else {
          var c = e[s];
          (!c || !Ze(e, s)) && (c = e[s] = {}), at(c, u, n);
        }
      } else n === void 0 ? Ee(e) && !isNaN(parseInt(t)) ? e.splice(t, 1) : delete e[t] : e[t] = n;
    }
}
function bI(e, t) {
  typeof t == "string" ? at(e, t, void 0) : "length" in t && [].map.call(t, function(n) {
    at(e, n, void 0);
  });
}
function my(e) {
  var t = {};
  for (var n in e) Ze(e, n) && (t[n] = e[n]);
  return t;
}
var wI = [].concat;
function gy(e) {
  return wI.apply([], e);
}
var SI = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(gy([
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
  return Ge[e];
}), yy = new Set(SI.map(function(e) {
  return Ge[e];
}));
function vy(e) {
  var t = {};
  for (var n in e) if (Ze(e, n)) {
    var r = e[n];
    t[n] = !r || typeof r != "object" || yy.has(r.constructor) ? r : vy(r);
  }
  return t;
}
function EI(e) {
  for (var t in e) if (Ze(e, t)) return !1;
  return !0;
}
var si = null;
function Pn(e) {
  si = /* @__PURE__ */ new WeakMap();
  var t = Al(e);
  return si = null, t;
}
function Al(e) {
  if (!e || typeof e != "object") return e;
  var t = si.get(e);
  if (t) return t;
  if (Ee(e)) {
    t = [], si.set(e, t);
    for (var n = 0, r = e.length; n < r; ++n) t.push(Al(e[n]));
  } else if (yy.has(e.constructor)) t = e;
  else {
    var i = ir(e);
    t = i === Object.prototype ? {} : Object.create(i), si.set(e, t);
    for (var o in e) Ze(e, o) && (t[o] = Al(e[o]));
  }
  return t;
}
var TI = {}.toString;
function Cl(e) {
  return TI.call(e).slice(8, -1);
}
var xl = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", AI = typeof xl == "symbol" ? function(e) {
  var t;
  return e != null && (t = e[xl]) && t.apply(e);
} : function() {
  return null;
};
function vn(e, t) {
  var n = e.indexOf(t);
  return n >= 0 && e.splice(n, 1), n >= 0;
}
var Yn = {};
function $t(e) {
  var t, n, r, i;
  if (arguments.length === 1) {
    if (Ee(e)) return e.slice();
    if (this === Yn && typeof e == "string") return [e];
    if (i = AI(e)) {
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
var Ru = typeof Symbol < "u" ? function(e) {
  return e[Symbol.toStringTag] === "AsyncFunction";
} : function() {
  return !1;
}, CI = [
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
], _y = [
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
], Pu = CI.concat(_y), xI = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed",
  MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function hr(e, t) {
  this.name = e, this.message = t;
}
fr(hr).from(Error).extend({ toString: function() {
  return this.name + ": " + this.message;
} });
function by(e, t) {
  return e + ". Errors: " + Object.keys(t).map(function(n) {
    return t[n].toString();
  }).filter(function(n, r, i) {
    return i.indexOf(n) === r;
  }).join(`
`);
}
function rs(e, t, n, r) {
  this.failures = t, this.failedKeys = r, this.successCount = n, this.message = by(e, t);
}
fr(rs).from(hr);
function jn(e, t) {
  this.name = "BulkError", this.failures = Object.keys(t).map(function(n) {
    return t[n];
  }), this.failuresByPos = t, this.message = by(e, this.failures);
}
fr(jn).from(hr);
var Mu = Pu.reduce(function(e, t) {
  return e[t] = t + "Error", e;
}, {}), II = hr, ne = Pu.reduce(function(e, t) {
  var n = t + "Error";
  function r(i, o) {
    this.name = n, i ? typeof i == "string" ? (this.message = "".concat(i).concat(o ? `
 ` + o : ""), this.inner = o || null) : typeof i == "object" && (this.message = "".concat(i.name, " ").concat(i.message), this.inner = i) : (this.message = xI[t] || n, this.inner = null);
  }
  return fr(r).from(II), e[t] = r, e;
}, {});
ne.Syntax = SyntaxError;
ne.Type = TypeError;
ne.Range = RangeError;
var dh = _y.reduce(function(e, t) {
  return e[t + "Error"] = ne[t], e;
}, {});
function RI(e, t) {
  if (!e || e instanceof hr || e instanceof TypeError || e instanceof SyntaxError || !e.name || !dh[e.name]) return e;
  var n = new dh[e.name](t || e.message, e);
  return "stack" in e && nn(n, "stack", { get: function() {
    return this.inner.stack;
  } }), n;
}
var Ds = Pu.reduce(function(e, t) {
  return [
    "Syntax",
    "Type",
    "Range"
  ].indexOf(t) === -1 && (e[t + "Error"] = ne[t]), e;
}, {});
Ds.ModifyError = rs;
Ds.DexieError = hr;
Ds.BulkError = jn;
function ve() {
}
function Ii(e) {
  return e;
}
function PI(e, t) {
  return e == null || e === Ii ? t : function(n) {
    return t(e(n));
  };
}
function Mn(e, t) {
  return function() {
    e.apply(this, arguments), t.apply(this, arguments);
  };
}
function MI(e, t) {
  return e === ve ? t : function() {
    var n = e.apply(this, arguments);
    n !== void 0 && (arguments[0] = n);
    var r = this.onsuccess, i = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var o = t.apply(this, arguments);
    return r && (this.onsuccess = this.onsuccess ? Mn(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Mn(i, this.onerror) : i), o !== void 0 ? o : n;
  };
}
function NI(e, t) {
  return e === ve ? t : function() {
    e.apply(this, arguments);
    var n = this.onsuccess, r = this.onerror;
    this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Mn(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Mn(r, this.onerror) : r);
  };
}
function kI(e, t) {
  return e === ve ? t : function(n) {
    var r = e.apply(this, arguments);
    lt(n, r);
    var i = this.onsuccess, o = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var s = t.apply(this, arguments);
    return i && (this.onsuccess = this.onsuccess ? Mn(i, this.onsuccess) : i), o && (this.onerror = this.onerror ? Mn(o, this.onerror) : o), r === void 0 ? s === void 0 ? void 0 : s : lt(r, s);
  };
}
function DI(e, t) {
  return e === ve ? t : function() {
    return t.apply(this, arguments) === !1 ? !1 : e.apply(this, arguments);
  };
}
function Nu(e, t) {
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
function wy(e, t) {
  xt = e;
}
var hi = {}, Sy = 100, ku = typeof Promise > "u" ? [] : (function() {
  var e = Promise.resolve();
  if (typeof crypto > "u" || !crypto.subtle) return [
    e,
    ir(e),
    e
  ];
  var t = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [
    t,
    ir(t),
    e
  ];
})(), fh = ku[0], hh = ku[1], LI = ku[2], $I = hh && hh.then, wn = fh && fh.constructor, Du = !!LI;
function UI() {
  queueMicrotask(BI);
}
var pi = function(e, t) {
  ei.push([e, t]), is && (UI(), is = !1);
}, Il = !0, is = !0, xn = [], Do = [], Rl = Ii, en = {
  id: "global",
  global: !0,
  ref: 0,
  unhandleds: [],
  onunhandled: ve,
  pgp: !1,
  env: {},
  finalize: ve
}, ee = en, ei = [], In = 0, Lo = [];
function H(e) {
  if (typeof this != "object") throw new TypeError("Promises must be constructed via new");
  this._listeners = [], this._lib = !1;
  var t = this._PSD = ee;
  if (typeof e != "function") {
    if (e !== hi) throw new TypeError("Not a function");
    this._state = arguments[1], this._value = arguments[2], this._state === !1 && Ml(this, this._value);
    return;
  }
  this._state = null, this._value = null, ++t.ref, Ty(this, e);
}
var Pl = {
  get: function() {
    var e = ee, t = os;
    function n(r, i) {
      var o = this, s = !e.global && (e !== ee || t !== os), u = s && !on(), c = new H(function(d, h) {
        Lu(o, new Ey(ph(r, e, s, u), ph(i, e, s, u), d, h, e));
      });
      return this._consoleTask && (c._consoleTask = this._consoleTask), c;
    }
    return n.prototype = hi, n;
  },
  set: function(e) {
    nn(this, "then", e && e.prototype === hi ? Pl : {
      get: function() {
        return e;
      },
      set: Pl.set
    });
  }
};
or(H.prototype, {
  then: Pl,
  _then: function(e, t) {
    Lu(this, new Ey(null, null, e, t, ee));
  },
  catch: function(e) {
    if (arguments.length === 1) return this.then(null, e);
    var t = arguments[0], n = arguments[1];
    return typeof t == "function" ? this.then(null, function(r) {
      return r instanceof t ? n(r) : $o(r);
    }) : this.then(null, function(r) {
      return r && r.name === t ? n(r) : $o(r);
    });
  },
  finally: function(e) {
    return this.then(function(t) {
      return H.resolve(e()).then(function() {
        return t;
      });
    }, function(t) {
      return H.resolve(e()).then(function() {
        return $o(t);
      });
    });
  },
  timeout: function(e, t) {
    var n = this;
    return e < 1 / 0 ? new H(function(r, i) {
      var o = setTimeout(function() {
        return i(new ne.Timeout(t));
      }, e);
      n.then(r, i).finally(clearTimeout.bind(null, o));
    }) : this;
  }
});
typeof Symbol < "u" && Symbol.toStringTag && nn(H.prototype, Symbol.toStringTag, "Dexie.Promise");
en.env = Cy();
function Ey(e, t, n, r, i) {
  this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
}
or(H, {
  all: function() {
    var e = $t.apply(null, arguments).map(ss);
    return new H(function(t, n) {
      e.length === 0 && t([]);
      var r = e.length;
      e.forEach(function(i, o) {
        return H.resolve(i).then(function(s) {
          e[o] = s, --r || t(e);
        }, n);
      });
    });
  },
  resolve: function(e) {
    return e instanceof H ? e : e && typeof e.then == "function" ? new H(function(t, n) {
      e.then(t, n);
    }) : new H(hi, !0, e);
  },
  reject: $o,
  race: function() {
    var e = $t.apply(null, arguments).map(ss);
    return new H(function(t, n) {
      e.map(function(r) {
        return H.resolve(r).then(t, n);
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
    return os;
  } },
  newPSD: rn,
  usePSD: Nn,
  scheduler: {
    get: function() {
      return pi;
    },
    set: function(e) {
      pi = e;
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
    return new H(function(n, r) {
      return rn(function(i, o) {
        var s = ee;
        s.unhandleds = [], s.onunhandled = o, s.finalize = Mn(function() {
          var u = this;
          OI(function() {
            u.unhandleds.length === 0 ? i() : o(u.unhandleds[0]);
          });
        }, s.finalize), e();
      }, t, n, r);
    });
  }
});
wn && (wn.allSettled && nn(H, "allSettled", function() {
  var e = $t.apply(null, arguments).map(ss);
  return new H(function(t) {
    e.length === 0 && t([]);
    var n = e.length, r = new Array(n);
    e.forEach(function(i, o) {
      return H.resolve(i).then(function(s) {
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
}), wn.any && typeof AggregateError < "u" && nn(H, "any", function() {
  var e = $t.apply(null, arguments).map(ss);
  return new H(function(t, n) {
    e.length === 0 && n(/* @__PURE__ */ new AggregateError([]));
    var r = e.length, i = new Array(r);
    e.forEach(function(o, s) {
      return H.resolve(o).then(function(u) {
        return t(u);
      }, function(u) {
        i[s] = u, --r || n(new AggregateError(i));
      });
    });
  });
}), wn.withResolvers && (H.withResolvers = wn.withResolvers));
function Ty(e, t) {
  try {
    t(function(n) {
      if (e._state === null) {
        if (n === e) throw new TypeError("A promise cannot be resolved with itself.");
        var r = e._lib && pr();
        n && typeof n.then == "function" ? Ty(e, function(i, o) {
          n instanceof H ? n._then(i, o) : n.then(i, o);
        }) : (e._state = !0, e._value = n, Ay(e)), r && mr();
      }
    }, Ml.bind(null, e));
  } catch (n) {
    Ml(e, n);
  }
}
function Ml(e, t) {
  if (Do.push(t), e._state === null) {
    var n = e._lib && pr();
    t = Rl(t), e._state = !1, e._value = t, GI(e), Ay(e), n && mr();
  }
}
function Ay(e) {
  var t = e._listeners;
  e._listeners = [];
  for (var n = 0, r = t.length; n < r; ++n) Lu(e, t[n]);
  var i = e._PSD;
  --i.ref || i.finalize(), In === 0 && (++In, pi(function() {
    --In === 0 && $u();
  }, []));
}
function Lu(e, t) {
  if (e._state === null) {
    e._listeners.push(t);
    return;
  }
  var n = e._state ? t.onFulfilled : t.onRejected;
  if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
  ++t.psd.ref, ++In, pi(FI, [
    n,
    e,
    t
  ]);
}
function FI(e, t, n) {
  try {
    var r, i = t._value;
    !t._state && Do.length && (Do = []), r = xt && t._consoleTask ? t._consoleTask.run(function() {
      return e(i);
    }) : e(i), !t._state && Do.indexOf(i) === -1 && qI(t), n.resolve(r);
  } catch (o) {
    n.reject(o);
  } finally {
    --In === 0 && $u(), --n.psd.ref || n.psd.finalize();
  }
}
function BI() {
  Nn(en, function() {
    pr() && mr();
  });
}
function pr() {
  var e = Il;
  return Il = !1, is = !1, e;
}
function mr() {
  var e, t, n;
  do
    for (; ei.length > 0; )
      for (e = ei, ei = [], n = e.length, t = 0; t < n; ++t) {
        var r = e[t];
        r[0].apply(null, r[1]);
      }
  while (ei.length > 0);
  Il = !0, is = !0;
}
function $u() {
  var e = xn;
  xn = [], e.forEach(function(r) {
    r._PSD.onunhandled.call(null, r._value, r);
  });
  for (var t = Lo.slice(0), n = t.length; n; ) t[--n]();
}
function OI(e) {
  function t() {
    e(), Lo.splice(Lo.indexOf(t), 1);
  }
  Lo.push(t), ++In, pi(function() {
    --In === 0 && $u();
  }, []);
}
function GI(e) {
  xn.some(function(t) {
    return t._value === e._value;
  }) || xn.push(e);
}
function qI(e) {
  for (var t = xn.length; t; ) if (xn[--t]._value === e._value) {
    xn.splice(t, 1);
    return;
  }
}
function $o(e) {
  return new H(hi, !1, e);
}
function Se(e, t) {
  var n = ee;
  return function() {
    var r = pr(), i = ee;
    try {
      return sn(n, !0), e.apply(this, arguments);
    } catch (o) {
      t && t(o);
    } finally {
      sn(i, !1), r && mr();
    }
  };
}
var $e = {
  awaits: 0,
  echoes: 0,
  id: 0
}, VI = 0, Uo = [], Fo = 0, os = 0, HI = 0;
function rn(e, t, n, r) {
  var i = ee, o = Object.create(i);
  o.parent = i, o.ref = 0, o.global = !1, o.id = ++HI, en.env, o.env = Du ? {
    Promise: H,
    PromiseProp: {
      value: H,
      configurable: !0,
      writable: !0
    },
    all: H.all,
    race: H.race,
    allSettled: H.allSettled,
    any: H.any,
    resolve: H.resolve,
    reject: H.reject
  } : {}, t && lt(o, t), ++i.ref, o.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var s = Nn(o, e, n, r);
  return o.ref === 0 && o.finalize(), s;
}
function gr() {
  return $e.id || ($e.id = ++VI), ++$e.awaits, $e.echoes += Sy, $e.id;
}
function on() {
  return $e.awaits ? (--$e.awaits === 0 && ($e.id = 0), $e.echoes = $e.awaits * Sy, !0) : !1;
}
("" + $I).indexOf("[native code]") === -1 && (gr = on = ve);
function ss(e) {
  return $e.echoes && e && e.constructor === wn ? (gr(), e.then(function(t) {
    return on(), t;
  }, function(t) {
    return on(), xe(t);
  })) : e;
}
function KI(e) {
  ++os, (!$e.echoes || --$e.echoes === 0) && ($e.echoes = $e.awaits = $e.id = 0), Uo.push(ee), sn(e, !0);
}
function WI() {
  var e = Uo[Uo.length - 1];
  Uo.pop(), sn(e, !1);
}
function sn(e, t) {
  var n = ee;
  if ((t ? $e.echoes && (!Fo++ || e !== ee) : Fo && (!--Fo || e !== ee)) && queueMicrotask(t ? KI.bind(null, e) : WI), e !== ee && (ee = e, n === en && (en.env = Cy()), Du)) {
    var r = en.env.Promise, i = e.env;
    (n.global || e.global) && (Object.defineProperty(Ge, "Promise", i.PromiseProp), r.all = i.all, r.race = i.race, r.resolve = i.resolve, r.reject = i.reject, i.allSettled && (r.allSettled = i.allSettled), i.any && (r.any = i.any));
  }
}
function Cy() {
  var e = Ge.Promise;
  return Du ? {
    Promise: e,
    PromiseProp: Object.getOwnPropertyDescriptor(Ge, "Promise"),
    all: e.all,
    race: e.race,
    allSettled: e.allSettled,
    any: e.any,
    resolve: e.resolve,
    reject: e.reject
  } : {};
}
function Nn(e, t, n, r, i) {
  var o = ee;
  try {
    return sn(e, !0), t(n, r, i);
  } finally {
    sn(o, !1);
  }
}
function ph(e, t, n, r) {
  return typeof e != "function" ? e : function() {
    var i = ee;
    n && gr(), sn(t, !0);
    try {
      return e.apply(this, arguments);
    } finally {
      sn(i, !1), r && queueMicrotask(on);
    }
  };
}
function _a(e) {
  Promise === wn && $e.echoes === 0 ? Fo === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
}
var xe = H.reject;
function Nl(e, t, n, r) {
  if (!e.idbdb || !e._state.openComplete && !ee.letThrough && !e._vip) {
    if (e._state.openComplete) return xe(new ne.DatabaseClosed(e._state.dbOpenError));
    if (!e._state.isBeingOpened) {
      if (!e._state.autoOpen) return xe(new ne.DatabaseClosed());
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
      return o.name === Mu.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return Nl(e, t, n, r);
      })) : xe(o);
    }
    return i._promise(t, function(o, s) {
      return rn(function() {
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
var mh = "4.0.10", An = "￿", kl = -1 / 0, kt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", xy = "String expected.", rr = [], Ls = "__dbnames", ba = "readonly", wa = "readwrite";
function kn(e, t) {
  return e ? t ? function() {
    return e.apply(this, arguments) && t.apply(this, arguments);
  } : e : t;
}
var Iy = {
  type: 3,
  lower: -1 / 0,
  lowerOpen: !1,
  upper: [[]],
  upperOpen: !1
};
function uo(e) {
  return typeof e == "string" && !/\./.test(e) ? function(t) {
    return t[e] === void 0 && e in t && (t = Pn(t), delete t[e]), t;
  } : function(t) {
    return t;
  };
}
function JI() {
  throw ne.Type();
}
function pe(e, t) {
  try {
    var n = gh(e), r = gh(t);
    if (n !== r)
      return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r !== "Date" ? NaN : -1;
    switch (n) {
      case "number":
      case "Date":
      case "string":
        return e > t ? 1 : e < t ? -1 : 0;
      case "binary":
        return YI(yh(e), yh(t));
      case "Array":
        return zI(e, t);
    }
  } catch {
  }
  return NaN;
}
function zI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) {
    var s = pe(e[o], t[o]);
    if (s !== 0) return s;
  }
  return n === r ? 0 : n < r ? -1 : 1;
}
function YI(e, t) {
  for (var n = e.length, r = t.length, i = n < r ? n : r, o = 0; o < i; ++o) if (e[o] !== t[o]) return e[o] < t[o] ? -1 : 1;
  return n === r ? 0 : n < r ? -1 : 1;
}
function gh(e) {
  var t = typeof e;
  if (t !== "object") return t;
  if (ArrayBuffer.isView(e)) return "binary";
  var n = Cl(e);
  return n === "ArrayBuffer" ? "binary" : n;
}
function yh(e) {
  return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
}
var Ry = (function() {
  function e() {
  }
  return e.prototype._trans = function(t, n, r) {
    var i = this._tx || ee.trans, o = this.name, s = xt && typeof console < "u" && console.createTask && console.createTask("Dexie: ".concat(t === "readonly" ? "read" : "write", " ").concat(this.name));
    function u(h, f, p) {
      if (!p.schema[o]) throw new ne.NotFound("Table " + o + " not part of transaction");
      return n(p.idbtrans, p);
    }
    var c = pr();
    try {
      var d = i && i.db._novip === this.db._novip ? i === ee.trans ? i._promise(t, u, r) : rn(function() {
        return i._promise(t, u, r);
      }, {
        trans: i,
        transless: ee.transless || ee
      }) : Nl(this.db, t, [this.name], u);
      return s && (d._consoleTask = s, d = d.catch(function(h) {
        return console.trace(h), xe(h);
      })), d;
    } finally {
      c && mr();
    }
  }, e.prototype.get = function(t, n) {
    var r = this;
    return t && t.constructor === Object ? this.where(t).first(n) : t == null ? xe(new ne.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(i) {
      return r.core.get({
        trans: i,
        key: t
      }).then(function(o) {
        return r.hook.reading.fire(o);
      });
    }).then(n);
  }, e.prototype.where = function(t) {
    if (typeof t == "string") return new this.db.WhereClause(this, t);
    if (Ee(t)) return new this.db.WhereClause(this, "[".concat(t.join("+"), "]"));
    var n = Fe(t);
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
    if (r && this.db._maxKey !== An) {
      var i = r.keyPath.slice(0, n.length);
      return this.where(i).equals(i.map(function(h) {
        return t[h];
      }));
    }
    !r && xt && console.warn("The query ".concat(JSON.stringify(t), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(n.join("+"), "]"));
    var o = this.schema.idxByName;
    function s(h, f) {
      return pe(h, f) === 0;
    }
    var u = n.reduce(function(h, f) {
      var p = h[0], m = h[1], g = o[f], y = t[f];
      return [p || g, p || !g ? kn(m, g && g.multi ? function(v) {
        var b = Ut(v, f);
        return Ee(b) && b.some(function(_) {
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
    return new this.db.Collection(new this.db.WhereClause(this, Ee(t) ? "[".concat(t.join("+"), "]") : t));
  }, e.prototype.reverse = function() {
    return this.toCollection().reverse();
  }, e.prototype.mapToClass = function(t) {
    var n = this, r = n.db, i = n.name;
    this.schema.mappedClass = t, t.prototype instanceof JI && (t = (function(c) {
      mI(d, c);
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
    for (var o = /* @__PURE__ */ new Set(), s = t.prototype; s; s = ir(s)) Object.getOwnPropertyNames(s).forEach(function(c) {
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
      lt(this, n);
    }
    return this.mapToClass(t);
  }, e.prototype.add = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = uo(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "add",
        keys: n != null ? [n] : null,
        values: [u]
      });
    }).then(function(c) {
      return c.numFailures ? H.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        at(t, s, c);
      } catch {
      }
      return c;
    });
  }, e.prototype.update = function(t, n) {
    if (typeof t == "object" && !Ee(t)) {
      var r = Ut(t, this.schema.primKey.keyPath);
      return r === void 0 ? xe(new ne.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(r).modify(n);
    } else return this.where(":id").equals(t).modify(n);
  }, e.prototype.put = function(t, n) {
    var r = this, i = this.schema.primKey, o = i.auto, s = i.keyPath, u = t;
    return s && o && (u = uo(s)(t)), this._trans("readwrite", function(c) {
      return r.core.mutate({
        trans: c,
        type: "put",
        values: [u],
        keys: n != null ? [n] : null
      });
    }).then(function(c) {
      return c.numFailures ? H.reject(c.failures[0]) : c.lastResult;
    }).then(function(c) {
      if (s) try {
        at(t, s, c);
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
      return r.numFailures ? H.reject(r.failures[0]) : void 0;
    });
  }, e.prototype.clear = function() {
    var t = this;
    return this._trans("readwrite", function(n) {
      return t.core.mutate({
        trans: n,
        type: "deleteRange",
        range: Iy
      });
    }).then(function(n) {
      return n.numFailures ? H.reject(n.failures[0]) : void 0;
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
      if (h && o) throw new ne.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new ne.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, p = h && d ? t.map(uo(h)) : t;
      return i.core.mutate({
        trans: u,
        type: "add",
        keys: o,
        values: p,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new jn("".concat(i.name, ".bulkAdd(): ").concat(g, " of ").concat(f, " operations failed"), b);
      });
    });
  }, e.prototype.bulkPut = function(t, n, r) {
    var i = this, o = Array.isArray(n) ? n : void 0;
    r = r || (o ? void 0 : n);
    var s = r ? r.allKeys : void 0;
    return this._trans("readwrite", function(u) {
      var c = i.schema.primKey, d = c.auto, h = c.keyPath;
      if (h && o) throw new ne.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (o && o.length !== t.length) throw new ne.InvalidArgument("Arguments objects and keys must have the same length");
      var f = t.length, p = h && d ? t.map(uo(h)) : t;
      return i.core.mutate({
        trans: u,
        type: "put",
        keys: o,
        values: p,
        wantResults: s
      }).then(function(m) {
        var g = m.numFailures, y = m.results, v = m.lastResult, b = m.failures, _ = s ? y : v;
        if (g === 0) return _;
        throw new jn("".concat(i.name, ".bulkPut(): ").concat(g, " of ").concat(f, " operations failed"), b);
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
                if (pe(E, g) !== 0) throw new ne.Constraint("Cannot update primary key in bulkUpdate()");
              } else at(v, w, E);
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
          throw new jn("".concat(n.name, ".bulkUpdate(): ").concat(m, " of ").concat(f, " operations failed"), g);
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
      throw new jn("".concat(n.name, ".bulkDelete(): ").concat(o, " of ").concat(r, " operations failed"), u);
    });
  }, e;
})();
function Ri(e) {
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
    c || (c = DI), d || (d = ve);
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
    Fe(u).forEach(function(c) {
      var d = u[c];
      if (Ee(d)) o(c, u[c][0], u[c][1]);
      else if (d === "asap") var h = o(c, Ii, function() {
        for (var p = arguments.length, m = new Array(p); p--; ) m[p] = arguments[p];
        h.subscribers.forEach(function(g) {
          py(function() {
            g.apply(null, m);
          });
        });
      });
      else throw new ne.InvalidArgument("Invalid event config");
    });
  }
}
function Pi(e, t) {
  return fr(t).from({ prototype: e }), t;
}
function XI(e) {
  return Pi(Ry.prototype, function(n, r, i) {
    this.db = e, this._tx = i, this.name = n, this.schema = r, this.hook = e._allTables[n] ? e._allTables[n].hook : Ri(null, {
      creating: [MI, ve],
      reading: [PI, Ii],
      updating: [kI, ve],
      deleting: [NI, ve]
    });
  });
}
function Gn(e, t) {
  return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
}
function Sa(e, t) {
  e.filter = kn(e.filter, t);
}
function Ea(e, t, n) {
  var r = e.replayFilter;
  e.replayFilter = r ? function() {
    return kn(r(), t());
  } : t, e.justLimit = n && !r;
}
function QI(e, t) {
  e.isMatch = kn(e.isMatch, t);
}
function Bo(e, t) {
  if (e.isPrimKey) return t.primaryKey;
  var n = t.getIndexByKeyPath(e.index);
  if (!n) throw new ne.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
  return n;
}
function vh(e, t, n) {
  var r = Bo(e, t.schema);
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
function co(e, t, n, r) {
  var i = e.replayFilter ? kn(e.filter, e.replayFilter()) : e.filter;
  if (e.or) {
    var o = {}, s = function(u, c, d) {
      if (!i || i(c, d, function(p) {
        return c.stop(p);
      }, function(p) {
        return c.fail(p);
      })) {
        var h = c.primaryKey, f = "" + h;
        f === "[object ArrayBuffer]" && (f = "" + new Uint8Array(h)), Ze(o, f) || (o[f] = !0, t(u, c, d));
      }
    };
    return Promise.all([e.or._iterate(s, n), _h(vh(e, r, n), e.algorithm, s, !e.keysOnly && e.valueMapper)]);
  } else
    return _h(vh(e, r, n), kn(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
}
function _h(e, t, n, r) {
  var i = Se(r ? function(o, s, u) {
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
var ZI = (function() {
  function e(t) {
    Object.assign(this, t);
  }
  return e.prototype.execute = function(t) {
    var n;
    if (this.add !== void 0) {
      var r = this.add;
      if (Ee(r)) return ns(ns([], Ee(t) ? t : [], !0), r, !0).sort();
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
      if (Ee(i)) return Ee(t) ? t.filter(function(s) {
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
})(), jI = (function() {
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
    n.algorithm = kn(n.algorithm, t);
  }, e.prototype._iterate = function(t, n) {
    return co(this._ctx, t, n, this._ctx.table.core);
  }, e.prototype.clone = function(t) {
    var n = Object.create(this.constructor.prototype), r = Object.create(this._ctx);
    return t && lt(r, t), n._ctx = r, n;
  }, e.prototype.raw = function() {
    return this._ctx.valueMapper = null, this;
  }, e.prototype.each = function(t) {
    var n = this._ctx;
    return this._read(function(r) {
      return co(n, t, r, n.table.core);
    });
  }, e.prototype.count = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx, o = i.table.core;
      if (Gn(i, !0)) return o.count({
        trans: r,
        query: {
          index: Bo(i, o.schema),
          range: i.range
        }
      }).then(function(u) {
        return Math.min(u, i.limit);
      });
      var s = 0;
      return co(i, function() {
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
      return pe(s(d, o), s(h, o)) * u;
    }
    return this.toArray(function(d) {
      return d.sort(c);
    }).then(n);
  }, e.prototype.toArray = function(t) {
    var n = this;
    return this._read(function(r) {
      var i = n._ctx;
      if (i.dir === "next" && Gn(i, !0) && i.limit > 0) {
        var o = i.valueMapper, s = Bo(i, i.table.core.schema);
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
        return co(i, function(c) {
          return u.push(c);
        }, r, i.table.core).then(function() {
          return u;
        });
      }
    }, t);
  }, e.prototype.offset = function(t) {
    var n = this._ctx;
    return t <= 0 ? this : (n.offset += t, Gn(n) ? Ea(n, function() {
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
    }), QI(this._ctx, t), this;
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
    if (n.dir === "next" && Gn(n, !0) && n.limit > 0) return this._read(function(i) {
      var o = Bo(n, n.table.core.schema);
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
      var o = i.primaryKey.toString(), s = Ze(r, o);
      return r[o] = !0, !s;
    }), this;
  }, e.prototype.modify = function(t) {
    var n = this, r = this._ctx;
    return this._write(function(i) {
      var o;
      if (typeof t == "function") o = t;
      else {
        var s = Fe(t), u = s.length;
        o = function(_) {
          for (var w = !1, E = 0; E < u; ++E) {
            var T = s[E], S = t[T], N = Ut(_, T);
            S instanceof ZI ? (at(_, T, S.execute(N)), w = !0) : N !== S && (at(_, T, S), w = !0);
          }
          return w;
        };
      }
      var c = r.table.core, d = c.schema.primaryKey, h = d.outbound, f = d.extractKey, p = 200, m = n.db._options.modifyChunkSize;
      m && (typeof m == "object" ? p = m[c.name] || m["*"] || 200 : p = m);
      var g = [], y = 0, v = [], b = function(_, w) {
        var E = w.failures, T = w.numFailures;
        y += _ - T;
        for (var S = 0, N = Fe(E); S < N.length; S++) {
          var A = N[S];
          g.push(E[A]);
        }
      };
      return n.clone().primaryKeys().then(function(_) {
        var w = Gn(r) && r.limit === 1 / 0 && (typeof t != "function" || t === Ta) && {
          index: r.index,
          range: r.range
        }, E = function(T) {
          var S = Math.min(p, _.length - T);
          return c.getMany({
            trans: i,
            keys: _.slice(T, T + S),
            cache: "immutable"
          }).then(function(N) {
            for (var A = [], k = [], L = h ? [] : null, G = [], Z = 0; Z < S; ++Z) {
              var K = N[Z], C = {
                value: Pn(K),
                primKey: _[T + Z]
              };
              o.call(C, C.value, C) !== !1 && (C.value == null ? G.push(_[T + Z]) : !h && pe(f(K), f(C.value)) !== 0 ? (G.push(_[T + Z]), A.push(C.value)) : (k.push(C.value), h && L.push(_[T + Z])));
            }
            return Promise.resolve(A.length > 0 && c.mutate({
              trans: i,
              type: "add",
              values: A
            }).then(function(R) {
              for (var Y in R.failures) G.splice(parseInt(Y), 1);
              b(A.length, R);
            })).then(function() {
              return (k.length > 0 || w && typeof t == "object") && c.mutate({
                trans: i,
                type: "put",
                keys: L,
                values: k,
                criteria: w,
                changeSpec: typeof t != "function" && t,
                isAdditionalChunk: T > 0
              }).then(function(R) {
                return b(k.length, R);
              });
            }).then(function() {
              return (G.length > 0 || w && t === Ta) && c.mutate({
                trans: i,
                type: "delete",
                keys: G,
                criteria: w,
                isAdditionalChunk: T > 0
              }).then(function(R) {
                return b(G.length, R);
              });
            }).then(function() {
              return _.length > T + S && E(T + p);
            });
          });
        };
        return E(0).then(function() {
          if (g.length > 0) throw new rs("Error modifying one or more objects", g, y, v);
          return _.length;
        });
      });
    });
  }, e.prototype.delete = function() {
    var t = this._ctx, n = t.range;
    return Gn(t) && (t.isPrimKey || n.type === 3) ? this._write(function(r) {
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
          if (d) throw new rs("Could not delete some values", Object.keys(c).map(function(h) {
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
function eR(e) {
  return Pi(jI.prototype, function(n, r) {
    this.db = e;
    var i = Iy, o = null;
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
      valueMapper: c !== Ii ? c : null
    };
  });
}
function tR(e, t) {
  return e < t ? -1 : e === t ? 0 : 1;
}
function nR(e, t) {
  return e > t ? -1 : e === t ? 0 : 1;
}
function ot(e, t, n) {
  var r = e instanceof My ? new e.Collection(e) : e;
  return r._ctx.error = n ? new n(t) : new TypeError(t), r;
}
function qn(e) {
  return new e.Collection(e, function() {
    return Py("");
  }).limit(0);
}
function rR(e) {
  return e === "next" ? function(t) {
    return t.toUpperCase();
  } : function(t) {
    return t.toLowerCase();
  };
}
function iR(e) {
  return e === "next" ? function(t) {
    return t.toLowerCase();
  } : function(t) {
    return t.toUpperCase();
  };
}
function oR(e, t, n, r, i, o) {
  for (var s = Math.min(e.length, r.length), u = -1, c = 0; c < s; ++c) {
    var d = t[c];
    if (d !== r[c])
      return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : u >= 0 ? e.substr(0, u) + t[u] + n.substr(u + 1) : null;
    i(e[c], d) < 0 && (u = c);
  }
  return s < r.length && o === "next" ? e + n.substr(e.length) : s < e.length && o === "prev" ? e.substr(0, n.length) : u < 0 ? null : e.substr(0, u) + r[u] + n.substr(u + 1);
}
function fo(e, t, n, r) {
  var i, o, s, u, c, d, h, f = n.length;
  if (!n.every(function(y) {
    return typeof y == "string";
  })) return ot(e, xy);
  function p(y) {
    i = rR(y), o = iR(y), s = y === "next" ? tR : nR;
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
    return zt(u[0], c[f - 1] + r);
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
    for (var E = null, T = g; T < f; ++T) {
      var S = oR(_, w, u[T], c[T], s, d);
      S === null && E === null ? g = T + 1 : (E === null || s(E, S) > 0) && (E = S);
    }
    return v(E !== null ? function() {
      y.continue(E + h);
    } : b), !1;
  }), m;
}
function zt(e, t, n, r) {
  return {
    type: 2,
    lower: e,
    upper: t,
    lowerOpen: n,
    upperOpen: r
  };
}
function Py(e) {
  return {
    type: 1,
    lower: e,
    upper: e
  };
}
var My = (function() {
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
      return this._cmp(t, n) > 0 || this._cmp(t, n) === 0 && (r || i) && !(r && i) ? qn(this) : new this.Collection(this, function() {
        return zt(t, n, !r, !i);
      });
    } catch {
      return ot(this, kt);
    }
  }, e.prototype.equals = function(t) {
    return t == null ? ot(this, kt) : new this.Collection(this, function() {
      return Py(t);
    });
  }, e.prototype.above = function(t) {
    return t == null ? ot(this, kt) : new this.Collection(this, function() {
      return zt(t, void 0, !0);
    });
  }, e.prototype.aboveOrEqual = function(t) {
    return t == null ? ot(this, kt) : new this.Collection(this, function() {
      return zt(t, void 0, !1);
    });
  }, e.prototype.below = function(t) {
    return t == null ? ot(this, kt) : new this.Collection(this, function() {
      return zt(void 0, t, !1, !0);
    });
  }, e.prototype.belowOrEqual = function(t) {
    return t == null ? ot(this, kt) : new this.Collection(this, function() {
      return zt(void 0, t);
    });
  }, e.prototype.startsWith = function(t) {
    return typeof t != "string" ? ot(this, xy) : this.between(t, t + An, !0, !0);
  }, e.prototype.startsWithIgnoreCase = function(t) {
    return t === "" ? this.startsWith(t) : fo(this, function(n, r) {
      return n.indexOf(r[0]) === 0;
    }, [t], An);
  }, e.prototype.equalsIgnoreCase = function(t) {
    return fo(this, function(n, r) {
      return n === r[0];
    }, [t], "");
  }, e.prototype.anyOfIgnoreCase = function() {
    var t = $t.apply(Yn, arguments);
    return t.length === 0 ? qn(this) : fo(this, function(n, r) {
      return r.indexOf(n) !== -1;
    }, t, "");
  }, e.prototype.startsWithAnyOfIgnoreCase = function() {
    var t = $t.apply(Yn, arguments);
    return t.length === 0 ? qn(this) : fo(this, function(n, r) {
      return r.some(function(i) {
        return n.indexOf(i) === 0;
      });
    }, t, An);
  }, e.prototype.anyOf = function() {
    var t = this, n = $t.apply(Yn, arguments), r = this._cmp;
    try {
      n.sort(r);
    } catch {
      return ot(this, kt);
    }
    if (n.length === 0) return qn(this);
    var i = new this.Collection(this, function() {
      return zt(n[0], n[n.length - 1]);
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
    var t = $t.apply(Yn, arguments);
    if (t.length === 0) return new this.Collection(this);
    try {
      t.sort(this._ascending);
    } catch {
      return ot(this, kt);
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
    if (t.length === 0) return qn(this);
    if (!t.every(function(T) {
      return T[0] !== void 0 && T[1] !== void 0 && o(T[0], T[1]) <= 0;
    })) return ot(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", ne.InvalidArgument);
    var d = !n || n.includeLowers !== !1, h = n && n.includeUppers === !0;
    function f(T, S) {
      for (var N = 0, A = T.length; N < A; ++N) {
        var k = T[N];
        if (i(S[0], k[1]) < 0 && i(S[1], k[0]) > 0) {
          k[0] = u(k[0], S[0]), k[1] = c(k[1], S[1]);
          break;
        }
      }
      return N === A && T.push(S), T;
    }
    var p = o;
    function m(T, S) {
      return p(T[0], S[0]);
    }
    var g;
    try {
      g = t.reduce(f, []), g.sort(m);
    } catch {
      return ot(this, kt);
    }
    var y = 0, v = h ? function(T) {
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
      return zt(g[0][0], g[g.length - 1][1], !d, !h);
    });
    return E._ondirectionchange = function(T) {
      T === "next" ? (w = v, p = o) : (w = b, p = s), g.sort(m);
    }, E._addAlgorithm(function(T, S, N) {
      for (var A = T.key; w(A); )
        if (++y, y === g.length)
          return S(N), !1;
      return _(A) ? !0 : (r._cmp(A, g[y][1]) === 0 || r._cmp(A, g[y][0]) === 0 || S(function() {
        p === o ? T.continue(g[y][0]) : T.continue(g[y][1]);
      }), !1);
    }), E;
  }, e.prototype.startsWithAnyOf = function() {
    var t = $t.apply(Yn, arguments);
    return t.every(function(n) {
      return typeof n == "string";
    }) ? t.length === 0 ? qn(this) : this.inAnyRange(t.map(function(n) {
      return [n, n + An];
    })) : ot(this, "startsWithAnyOf() only works with strings");
  }, e;
})();
function sR(e) {
  return Pi(My.prototype, function(n, r, i) {
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
    }, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new ne.MissingAPI();
  });
}
function At(e) {
  return Se(function(t) {
    return mi(t), e(t.target.error), !1;
  });
}
function mi(e) {
  e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
}
var Mi = "storagemutated", Dl = "x-storagemutated-1", an = Ri(null, Mi), aR = (function() {
  function e() {
  }
  return e.prototype._lock = function() {
    return jr(!ee.global), ++this._reculock, this._reculock === 1 && !ee.global && (ee.lockOwnerFor = this), this;
  }, e.prototype._unlock = function() {
    if (jr(!ee.global), --this._reculock === 0)
      for (ee.global || (ee.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
        var t = this._blockedFuncs.shift();
        try {
          Nn(t[1], t[0]);
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
    if (jr(!this.idbtrans), !t && !r) switch (i && i.name) {
      case "DatabaseClosedError":
        throw new ne.DatabaseClosed(i);
      case "MissingAPIError":
        throw new ne.MissingAPI(i.message, i);
      default:
        throw new ne.OpenFailed(i);
    }
    if (!this.active) throw new ne.TransactionInactive();
    return jr(this._completion._state === null), t = this.idbtrans = t || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : r.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), t.onerror = Se(function(o) {
      mi(o), n._reject(t.error);
    }), t.onabort = Se(function(o) {
      mi(o), n.active && n._reject(new ne.Abort(t.error)), n.active = !1, n.on("abort").fire(o);
    }), t.oncomplete = Se(function() {
      n.active = !1, n._resolve(), "mutatedParts" in t && an.storagemutated.fire(t.mutatedParts);
    }), this;
  }, e.prototype._promise = function(t, n, r) {
    var i = this;
    if (t === "readwrite" && this.mode !== "readwrite") return xe(new ne.ReadOnly("Transaction is readonly"));
    if (!this.active) return xe(new ne.TransactionInactive());
    if (this._locked()) return new H(function(s, u) {
      i._blockedFuncs.push([function() {
        i._promise(t, n, r).then(s, u);
      }, ee]);
    });
    if (r) return rn(function() {
      var s = new H(function(u, c) {
        i._lock();
        var d = n(u, c, i);
        d && d.then && d.then(u, c);
      });
      return s.finally(function() {
        return i._unlock();
      }), s._lib = !0, s;
    });
    var o = new H(function(s, u) {
      var c = n(s, u, i);
      c && c.then && c.then(s, u);
    });
    return o._lib = !0, o;
  }, e.prototype._root = function() {
    return this.parent ? this.parent._root() : this;
  }, e.prototype.waitFor = function(t) {
    var n = this._root(), r = H.resolve(t);
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
    return new H(function(s, u) {
      r.then(function(c) {
        return n._waitingQueue.push(Se(s.bind(null, c)));
      }, function(c) {
        return n._waitingQueue.push(Se(u.bind(null, c)));
      }).finally(function() {
        n._waitingFor === o && (n._waitingFor = null);
      });
    });
  }, e.prototype.abort = function() {
    this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new ne.Abort()));
  }, e.prototype.table = function(t) {
    var n = this._memoizedTables || (this._memoizedTables = {});
    if (Ze(n, t)) return n[t];
    var r = this.schema[t];
    if (!r) throw new ne.NotFound("Table " + t + " not part of transaction");
    var i = new this.db.Table(t, r, this);
    return i.core = this.db.core.table(t), n[t] = i, i;
  }, e;
})();
function lR(e) {
  return Pi(aR.prototype, function(n, r, i, o, s) {
    var u = this;
    this.db = e, this.mode = n, this.storeNames = r, this.schema = i, this.chromeTransactionDurability = o, this.idbtrans = null, this.on = Ri(this, "complete", "error", "abort"), this.parent = s || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new H(function(c, d) {
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
    src: (n && !s ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + Ny(t)
  };
}
function Ny(e) {
  return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
}
function Uu(e, t, n) {
  return {
    name: e,
    primKey: t,
    indexes: n,
    mappedClass: null,
    idxByName: _I(n, function(r) {
      return [r.name, r];
    })
  };
}
function uR(e) {
  return e.length === 1 ? e[0] : e;
}
var gi = function(e) {
  try {
    return e.only([[]]), gi = function() {
      return [[]];
    }, [[]];
  } catch {
    return gi = function() {
      return An;
    }, An;
  }
};
function $l(e) {
  return e == null ? function() {
  } : typeof e == "string" ? cR(e) : function(t) {
    return Ut(t, e);
  };
}
function cR(e) {
  return e.split(".").length === 1 ? function(t) {
    return t[e];
  } : function(t) {
    return Ut(t, e);
  };
}
function bh(e) {
  return [].slice.call(e);
}
var dR = 0;
function ai(e) {
  return e == null ? ":id" : typeof e == "string" ? e : "[".concat(e.join("+"), "]");
}
function fR(e, t, n) {
  function r(f, p) {
    var m = bh(f.objectStoreNames);
    return {
      schema: {
        name: f.name,
        tables: m.map(function(g) {
          return p.objectStore(g);
        }).map(function(g) {
          var y = g.keyPath, v = g.autoIncrement, b = Ee(y), _ = y == null, w = {}, E = {
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
            indexes: bh(g.indexNames).map(function(T) {
              return g.index(T);
            }).map(function(T) {
              var S = T.name, N = T.unique, A = T.multiEntry, k = T.keyPath, L = {
                name: S,
                compound: Ee(k),
                keyPath: k,
                unique: N,
                multiEntry: A,
                extractKey: $l(k)
              };
              return w[ai(k)] = L, L;
            }),
            getIndexByKeyPath: function(T) {
              return w[ai(T)];
            }
          };
          return w[":id"] = E.primaryKey, y != null && (w[ai(y)] = E.primaryKey), E;
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
      var b = v.trans, _ = v.type, w = v.keys, E = v.values, T = v.range;
      return new Promise(function(S, N) {
        S = Se(S);
        var A = b.objectStore(p), k = A.keyPath == null, L = _ === "put" || _ === "add";
        if (!L && _ !== "delete" && _ !== "deleteRange") throw new Error("Invalid operation type: " + _);
        var G = (w || E || { length: 1 }).length;
        if (w && E && w.length !== E.length) throw new Error("Given keys array must have same length as given values array.");
        if (G === 0) return S({
          numFailures: 0,
          failures: {},
          results: [],
          lastResult: void 0
        });
        var Z, K = [], C = [], R = 0, Y = function(ie) {
          ++R, mi(ie);
        };
        if (_ === "deleteRange") {
          if (T.type === 4) return S({
            numFailures: R,
            failures: C,
            results: [],
            lastResult: void 0
          });
          T.type === 3 ? K.push(Z = A.clear()) : K.push(Z = A.delete(i(T)));
        } else {
          var J = L ? k ? [E, w] : [E, null] : [w, null], D = J[0], B = J[1];
          if (L) for (var z = 0; z < G; ++z)
            K.push(Z = B && B[z] !== void 0 ? A[_](D[z], B[z]) : A[_](D[z])), Z.onerror = Y;
          else for (var z = 0; z < G; ++z)
            K.push(Z = A[_](D[z])), Z.onerror = Y;
        }
        var fe = function(ie) {
          var he = ie.target.result;
          K.forEach(function(_e, Re) {
            return _e.error != null && (C[Re] = _e.error);
          }), S({
            numFailures: R,
            failures: C,
            results: _ === "delete" ? w : K.map(function(_e) {
              return _e.result;
            }),
            lastResult: he
          });
        };
        Z.onerror = function(ie) {
          Y(ie), fe(ie);
        }, Z.onsuccess = fe;
      });
    }
    function g(v) {
      var b = v.trans, _ = v.values, w = v.query, E = v.reverse, T = v.unique;
      return new Promise(function(S, N) {
        S = Se(S);
        var A = w.index, k = w.range, L = b.objectStore(p), G = A.isPrimaryKey ? L : L.index(A.name), Z = E ? T ? "prevunique" : "prev" : T ? "nextunique" : "next", K = _ || !("openKeyCursor" in G) ? G.openCursor(i(k), Z) : G.openKeyCursor(i(k), Z);
        K.onerror = At(N), K.onsuccess = Se(function(C) {
          var R = K.result;
          if (!R) {
            S(null);
            return;
          }
          R.___id = ++dR, R.done = !1;
          var Y = R.continue.bind(R), J = R.continuePrimaryKey;
          J && (J = J.bind(R));
          var D = R.advance.bind(R), B = function() {
            throw new Error("Cursor not started");
          }, z = function() {
            throw new Error("Cursor not stopped");
          };
          R.trans = b, R.stop = R.continue = R.continuePrimaryKey = R.advance = B, R.fail = Se(N), R.next = function() {
            var fe = this, ie = 1;
            return this.start(function() {
              return ie-- ? fe.continue() : fe.stop();
            }).then(function() {
              return fe;
            });
          }, R.start = function(fe) {
            var ie = new Promise(function(_e, Re) {
              _e = Se(_e), K.onerror = At(Re), R.fail = Re, R.stop = function(ze) {
                R.stop = R.continue = R.continuePrimaryKey = R.advance = z, _e(ze);
              };
            }), he = function() {
              if (K.result) try {
                fe();
              } catch (_e) {
                R.fail(_e);
              }
              else
                R.done = !0, R.start = function() {
                  throw new Error("Cursor behind last entry");
                }, R.stop();
            };
            return K.onsuccess = Se(function(_e) {
              K.onsuccess = he, he();
            }), R.continue = Y, R.continuePrimaryKey = J, R.advance = D, he(), ie;
          }, S(R);
        }, N);
      });
    }
    function y(v) {
      return function(b) {
        return new Promise(function(_, w) {
          _ = Se(_);
          var E = b.trans, T = b.values, S = b.limit, N = b.query, A = S === 1 / 0 ? void 0 : S, k = N.index, L = N.range, G = E.objectStore(p), Z = k.isPrimaryKey ? G : G.index(k.name), K = i(L);
          if (S === 0) return _({ result: [] });
          if (v) {
            var C = T ? Z.getAll(K, A) : Z.getAllKeys(K, A);
            C.onsuccess = function(D) {
              return _({ result: D.target.result });
            }, C.onerror = At(w);
          } else {
            var R = 0, Y = T || !("openKeyCursor" in Z) ? Z.openCursor(K) : Z.openKeyCursor(K), J = [];
            Y.onsuccess = function(D) {
              var B = Y.result;
              if (!B) return _({ result: J });
              if (J.push(T ? B.value : B.primaryKey), ++R === S) return _({ result: J });
              B.continue();
            }, Y.onerror = At(w);
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
          w = Se(w);
          for (var T = b.objectStore(p), S = _.length, N = new Array(S), A = 0, k = 0, L, G = function(C) {
            var R = C.target;
            (N[R._pos] = R.result) != null, ++k === A && w(N);
          }, Z = At(E), K = 0; K < S; ++K) _[K] != null && (L = T.get(_[K]), L._pos = K, L.onsuccess = G, L.onerror = Z, ++A);
          A === 0 && w(N);
        });
      },
      get: function(v) {
        var b = v.trans, _ = v.key;
        return new Promise(function(w, E) {
          w = Se(w);
          var T = b.objectStore(p).get(_);
          T.onsuccess = function(S) {
            return w(S.target.result);
          }, T.onerror = At(E);
        });
      },
      query: y(c),
      openCursor: g,
      count: function(v) {
        var b = v.query, _ = v.trans, w = b.index, E = b.range;
        return new Promise(function(T, S) {
          var N = _.objectStore(p), A = w.isPrimaryKey ? N : N.index(w.name), k = i(E), L = k ? A.count(k) : A.count();
          L.onsuccess = Se(function(G) {
            return T(G.target.result);
          }), L.onerror = At(S);
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
    MAX_KEY: gi(t),
    schema: u
  };
}
function hR(e, t) {
  return t.reduce(function(n, r) {
    var i = r.create;
    return ce(ce({}, n), i(n));
  }, e);
}
function pR(e, t, n, r) {
  var i = n.IDBKeyRange;
  return n.indexedDB, { dbcore: hR(fR(t, i, r), e.dbcore) };
}
function as(e, t) {
  var n = t.db;
  e.core = pR(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(r) {
    var i = r.name;
    e.core.schema.tables.some(function(o) {
      return o.name === i;
    }) && (r.core = e.core.table(i), e[i] instanceof e.Table && (e[i].core = r.core));
  });
}
function ls(e, t, n, r) {
  n.forEach(function(i) {
    var o = r[i];
    t.forEach(function(s) {
      var u = fy(s, i);
      (!u || "value" in u && u.value === void 0) && (s === e.Transaction.prototype || s instanceof e.Transaction ? nn(s, i, {
        get: function() {
          return this.table(i);
        },
        set: function(c) {
          dy(this, i, {
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
function mR(e, t) {
  return e._cfg.version - t._cfg.version;
}
function gR(e, t, n, r) {
  var i = e._dbSchema;
  n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = Uu("$meta", Dy("")[0], []), e._storeNames.push("$meta"));
  var o = e._createTransaction("readwrite", e._storeNames, i);
  o.create(n), o._completion.catch(r);
  var s = o._reject.bind(o), u = ee.transless || ee;
  rn(function() {
    if (ee.trans = o, ee.transless = u, t === 0)
      Fe(i).forEach(function(c) {
        Bu(n, c, i[c].primKey, i[c].indexes);
      }), as(e, n), H.follow(function() {
        return e.on.populate.fire(o);
      }).catch(s);
    else
      return as(e, n), vR(e, o, t).then(function(c) {
        return _R(e, c, o, n);
      }).catch(s);
  });
}
function yR(e, t) {
  ky(e._dbSchema, t), t.db.version % 10 === 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
  var n = $s(e, e.idbdb, t);
  cs(e, e._dbSchema, t);
  for (var r = Fu(n, e._dbSchema), i = function(d) {
    if (d.change.length || d.recreate)
      return console.warn("Unable to patch indexes of table ".concat(d.name, " because it has changes on the type of index or primary key.")), { value: void 0 };
    var h = t.objectStore(d.name);
    d.add.forEach(function(f) {
      xt && console.debug("Dexie upgrade patch: Creating missing index ".concat(d.name, ".").concat(f.src)), us(h, f);
    });
  }, o = 0, s = r.change; o < s.length; o++) {
    var u = s[o], c = i(u);
    if (typeof c == "object") return c.value;
  }
}
function vR(e, t, n) {
  return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(r) {
    return r ?? n;
  }) : H.resolve(n);
}
function _R(e, t, n, r) {
  var i = [], o = e._versions, s = e._dbSchema = $s(e, e.idbdb, r), u = o.filter(function(d) {
    return d._cfg.version >= t;
  });
  if (u.length === 0) return H.resolve();
  u.forEach(function(d) {
    i.push(function() {
      var h = s, f = d._cfg.dbschema;
      cs(e, h, r), cs(e, f, r), s = e._dbSchema = f;
      var p = Fu(h, f);
      p.add.forEach(function(_) {
        Bu(r, _[0], _[1].primKey, _[1].indexes);
      }), p.change.forEach(function(_) {
        if (_.recreate) throw new ne.Upgrade("Not yet support for changing primary key");
        var w = r.objectStore(_.name);
        _.add.forEach(function(E) {
          return us(w, E);
        }), _.change.forEach(function(E) {
          w.deleteIndex(E.name), us(w, E);
        }), _.del.forEach(function(E) {
          return w.deleteIndex(E);
        });
      });
      var m = d._cfg.contentUpgrade;
      if (m && d._cfg.version > t) {
        as(e, r), n._memoizedTables = {};
        var g = my(f);
        p.del.forEach(function(_) {
          g[_] = h[_];
        }), Ul(e, [e.Transaction.prototype]), ls(e, [e.Transaction.prototype], Fe(g), g), n.schema = g;
        var y = Ru(m);
        y && gr();
        var v, b = H.follow(function() {
          if (v = m(n), v && y) {
            var _ = on.bind(null, null);
            v.then(_, _);
          }
        });
        return v && typeof v.then == "function" ? H.resolve(v) : b.then(function() {
          return v;
        });
      }
    }), i.push(function(h) {
      var f = d._cfg.dbschema;
      bR(f, h), Ul(e, [e.Transaction.prototype]), ls(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
    }), i.push(function(h) {
      e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === d._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(f) {
        return f !== "$meta";
      })) : h.objectStore("$meta").put(d._cfg.version, "version"));
    });
  });
  function c() {
    return i.length ? H.resolve(i.shift()(n.idbtrans)).then(c) : H.resolve();
  }
  return c().then(function() {
    ky(s, r);
  });
}
function Fu(e, t) {
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
function Bu(e, t, n, r) {
  var i = e.db.createObjectStore(t, n.keyPath ? {
    keyPath: n.keyPath,
    autoIncrement: n.auto
  } : { autoIncrement: n.auto });
  return r.forEach(function(o) {
    return us(i, o);
  }), i;
}
function ky(e, t) {
  Fe(e).forEach(function(n) {
    t.db.objectStoreNames.contains(n) || (xt && console.debug("Dexie: Creating missing table", n), Bu(t, n, e[n].primKey, e[n].indexes));
  });
}
function bR(e, t) {
  [].slice.call(t.db.objectStoreNames).forEach(function(n) {
    return e[n] == null && t.db.deleteObjectStore(n);
  });
}
function us(e, t) {
  e.createIndex(t.name, t.keyPath, {
    unique: t.unique,
    multiEntry: t.multi
  });
}
function $s(e, t, n) {
  var r = {};
  return ks(t.objectStoreNames, 0).forEach(function(i) {
    for (var o = n.objectStore(i), s = o.keyPath, u = Ll(Ny(s), s || "", !0, !1, !!o.autoIncrement, s && typeof s != "string", !0), c = [], d = 0; d < o.indexNames.length; ++d) {
      var h = o.index(o.indexNames[d]);
      s = h.keyPath;
      var f = Ll(h.name, s, !!h.unique, !!h.multiEntry, !1, s && typeof s != "string", !1);
      c.push(f);
    }
    r[i] = Uu(i, u, c);
  }), r;
}
function wR(e, t, n) {
  e.verno = t.version / 10;
  var r = e._dbSchema = $s(e, t, n);
  e._storeNames = ks(t.objectStoreNames, 0), ls(e, [e._allTables], Fe(r), r);
}
function SR(e, t) {
  var n = Fu($s(e, e.idbdb, t), e._dbSchema);
  return !(n.add.length || n.change.some(function(r) {
    return r.add.length || r.change.length;
  }));
}
function cs(e, t, n) {
  for (var r = n.db.objectStoreNames, i = 0; i < r.length; ++i) {
    var o = r[i], s = n.objectStore(o);
    e._hasGetAll = "getAll" in s;
    for (var u = 0; u < s.indexNames.length; ++u) {
      var c = s.indexNames[u], d = s.index(c).keyPath, h = typeof d == "string" ? d : "[" + ks(d).join("+") + "]";
      if (t[o]) {
        var f = t[o].idxByName[h];
        f && (f.name = c, delete t[o].idxByName[h], t[o].idxByName[c] = f);
      }
    }
  }
  typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && Ge.WorkerGlobalScope && Ge instanceof Ge.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (e._hasGetAll = !1);
}
function Dy(e) {
  return e.split(",").map(function(t, n) {
    t = t.trim();
    var r = t.replace(/([&*]|\+\+)/g, ""), i = /^\[/.test(r) ? r.match(/^\[(.*)\]$/)[1].split("+") : r;
    return Ll(r, i || null, /\&/.test(t), /\*/.test(t), /\+\+/.test(t), Ee(i), n === 0);
  });
}
var ER = (function() {
  function e() {
  }
  return e.prototype._parseStoresSpec = function(t, n) {
    Fe(t).forEach(function(r) {
      if (t[r] !== null) {
        var i = Dy(t[r]), o = i.shift();
        if (o.unique = !0, o.multi) throw new ne.Schema("Primary key cannot be multi-valued");
        i.forEach(function(s) {
          if (s.auto) throw new ne.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!s.keyPath) throw new ne.Schema("Index must have a name and cannot be an empty string");
        }), n[r] = Uu(r, o, i);
      }
    });
  }, e.prototype.stores = function(t) {
    var n = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? lt(this._cfg.storesSource, t) : t;
    var r = n._versions, i = {}, o = {};
    return r.forEach(function(s) {
      lt(i, s._cfg.storesSource), o = s._cfg.dbschema = {}, s._parseStoresSpec(i, o);
    }), n._dbSchema = o, Ul(n, [
      n._allTables,
      n,
      n.Transaction.prototype
    ]), ls(n, [
      n._allTables,
      n,
      n.Transaction.prototype,
      this._cfg.tables
    ], Fe(o), o), n._storeNames = Fe(o), this;
  }, e.prototype.upgrade = function(t) {
    return this._cfg.contentUpgrade = Nu(this._cfg.contentUpgrade || ve, t), this;
  }, e;
})();
function TR(e) {
  return Pi(ER.prototype, function(n) {
    this.db = e, this._cfg = {
      version: n,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
  });
}
function Ou(e, t) {
  var n = e._dbNamesDB;
  return n || (n = e._dbNamesDB = new vi(Ls, {
    addons: [],
    indexedDB: e,
    IDBKeyRange: t
  }), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
}
function Gu(e) {
  return e && typeof e.databases == "function";
}
function AR(e) {
  var t = e.indexedDB, n = e.IDBKeyRange;
  return Gu(t) ? Promise.resolve(t.databases()).then(function(r) {
    return r.map(function(i) {
      return i.name;
    }).filter(function(i) {
      return i !== Ls;
    });
  }) : Ou(t, n).toCollection().primaryKeys();
}
function CR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Gu(n) && t !== Ls && Ou(n, r).put({ name: t }).catch(ve);
}
function xR(e, t) {
  var n = e.indexedDB, r = e.IDBKeyRange;
  !Gu(n) && t !== Ls && Ou(n, r).delete(t).catch(ve);
}
function Fl(e) {
  return rn(function() {
    return ee.letThrough = !0, e();
  });
}
function IR() {
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
function qu(e) {
  return !("from" in e);
}
var Je = function(e, t) {
  if (this) lt(this, arguments.length ? {
    d: 1,
    from: e,
    to: arguments.length > 1 ? t : e
  } : { d: 0 });
  else {
    var n = new Je();
    return e && "d" in e && lt(n, e), n;
  }
};
or(Je.prototype, (Aa = {
  add: function(e) {
    return ds(this, e), this;
  },
  addKey: function(e) {
    return yi(this, e, e), this;
  },
  addKeys: function(e) {
    var t = this;
    return e.forEach(function(n) {
      return yi(t, n, n);
    }), this;
  },
  hasKey: function(e) {
    var t = fs(this).next(e).value;
    return t && pe(t.from, e) <= 0 && pe(t.to, e) >= 0;
  }
}, Aa[xl] = function() {
  return fs(this);
}, Aa));
function yi(e, t, n) {
  var r = pe(t, n);
  if (!isNaN(r)) {
    if (r > 0) throw RangeError();
    if (qu(e)) return lt(e, {
      from: t,
      to: n,
      d: 1
    });
    var i = e.l, o = e.r;
    if (pe(n, e.from) < 0)
      return i ? yi(i, t, n) : e.l = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, wh(e);
    if (pe(t, e.to) > 0)
      return o ? yi(o, t, n) : e.r = {
        from: t,
        to: n,
        d: 1,
        l: null,
        r: null
      }, wh(e);
    pe(t, e.from) < 0 && (e.from = t, e.l = null, e.d = o ? o.d + 1 : 1), pe(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
    var s = !e.r;
    i && !e.l && ds(e, i), o && s && ds(e, o);
  }
}
function ds(e, t) {
  function n(r, i) {
    var o = i.from, s = i.to, u = i.l, c = i.r;
    yi(r, o, s), u && n(r, u), c && n(r, c);
  }
  qu(t) || n(e, t);
}
function RR(e, t) {
  var n = fs(t), r = n.next();
  if (r.done) return !1;
  for (var i = r.value, o = fs(e), s = o.next(i.from), u = s.value; !r.done && !s.done; ) {
    if (pe(u.from, i.to) <= 0 && pe(u.to, i.from) >= 0) return !0;
    pe(i.from, u.from) < 0 ? i = (r = n.next(u.from)).value : u = (s = o.next(i.from)).value;
  }
  return !1;
}
function fs(e) {
  var t = qu(e) ? null : {
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
function wh(e) {
  var t, n, r = (((t = e.r) === null || t === void 0 ? void 0 : t.d) || 0) - (((n = e.l) === null || n === void 0 ? void 0 : n.d) || 0), i = r > 1 ? "r" : r < -1 ? "l" : "";
  if (i) {
    var o = i === "r" ? "l" : "r", s = ce({}, e), u = e[i];
    e.from = u.from, e.to = u.to, e[i] = u[i], s[i] = u[o], e[o] = s, s.d = Sh(s);
  }
  e.d = Sh(e);
}
function Sh(e) {
  var t = e.r, n = e.l;
  return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
}
function Us(e, t) {
  return Fe(t).forEach(function(n) {
    e[n] ? ds(e[n], t[n]) : e[n] = vy(t[n]);
  }), e;
}
function Vu(e, t) {
  return e.all || t.all || Object.keys(e).some(function(n) {
    return t[n] && RR(t[n], e[n]);
  });
}
var Rn = {}, Ca = {}, xa = !1;
function ho(e, t) {
  Us(Ca, e), xa || (xa = !0, setTimeout(function() {
    xa = !1;
    var n = Ca;
    Ca = {}, Hu(n, !1);
  }, 0));
}
function Hu(e, t) {
  t === void 0 && (t = !1);
  var n = /* @__PURE__ */ new Set();
  if (e.all) for (var r = 0, i = Object.values(Rn); r < i.length; r++) {
    var o = i[r];
    Eh(o, e, n, t);
  }
  else for (var s in e) {
    var u = /^idb\:\/\/(.*)\/(.*)\//.exec(s);
    if (u) {
      var c = u[1], d = u[2], o = Rn["idb://".concat(c, "/").concat(d)];
      o && Eh(o, e, n, t);
    }
  }
  n.forEach(function(h) {
    return h();
  });
}
function Eh(e, t, n, r) {
  for (var i = [], o = 0, s = Object.entries(e.queries.query); o < s.length; o++) {
    for (var u = s[o], c = u[0], d = u[1], h = [], f = 0, p = d; f < p.length; f++) {
      var m = p[f];
      Vu(t, m.obsSet) ? m.subscribers.forEach(function(b) {
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
function PR(e) {
  var t = e._state, n = e._deps.indexedDB;
  if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
    return t.dbOpenError ? xe(t.dbOpenError) : e;
  });
  t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
  var r = t.openCanceller, i = Math.round(e.verno * 10), o = !1;
  function s() {
    if (t.openCanceller !== r) throw new ne.DatabaseClosed("db.open() was cancelled");
  }
  var u = t.dbReadyResolve, c = null, d = !1, h = function() {
    return new H(function(f, p) {
      if (s(), !n) throw new ne.MissingAPI();
      var m = e.name, g = t.autoSchema || !i ? n.open(m) : n.open(m, i);
      if (!g) throw new ne.MissingAPI();
      g.onerror = At(p), g.onblocked = Se(e._fireOnBlocked), g.onupgradeneeded = Se(function(y) {
        if (c = g.transaction, t.autoSchema && !e._options.allowEmptyDB) {
          g.onerror = mi, c.abort(), g.result.close();
          var v = n.deleteDatabase(m);
          v.onsuccess = v.onerror = Se(function() {
            p(new ne.NoSuchDatabase("Database ".concat(m, " doesnt exist")));
          });
        } else {
          c.onerror = At(p);
          var b = y.oldVersion > Math.pow(2, 62) ? 0 : y.oldVersion;
          d = b < 1, e.idbdb = g.result, o && yR(e, c), gR(e, b / 10, c, p);
        }
      }, p), g.onsuccess = Se(function() {
        c = null;
        var y = e.idbdb = g.result, v = ks(y.objectStoreNames);
        if (v.length > 0) try {
          var b = y.transaction(uR(v), "readonly");
          if (t.autoSchema) wR(e, y, b);
          else if (cs(e, e._dbSchema, b), !SR(e, b) && !o)
            return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), y.close(), i = y.version + 1, o = !0, f(h());
          as(e, b);
        } catch {
        }
        rr.push(e), y.onversionchange = Se(function(_) {
          t.vcFired = !0, e.on("versionchange").fire(_);
        }), y.onclose = Se(function(_) {
          e.on("close").fire(_);
        }), d && CR(e._deps, m), f();
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
      return H.reject(f);
    });
  };
  return H.race([r, (typeof navigator > "u" ? H.resolve() : IR()).then(h)]).then(function() {
    return s(), t.onReadyBeingFired = [], H.resolve(Fl(function() {
      return e.on.ready.fire(e.vip);
    })).then(function f() {
      if (t.onReadyBeingFired.length > 0) {
        var p = t.onReadyBeingFired.reduce(Nu, ve);
        return t.onReadyBeingFired = [], H.resolve(Fl(function() {
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
          m.name && (f["idb://".concat(e.name, "/").concat(p.name, "/").concat(m.name)] = new Je(-1 / 0, [[[]]]));
        }), f["idb://".concat(e.name, "/").concat(p.name, "/")] = f["idb://".concat(e.name, "/").concat(p.name, "/:dels")] = new Je(-1 / 0, [[[]]]);
      }), an(Mi).fire(f), Hu(f, !0);
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
      return c.done ? d : !d || typeof d.then != "function" ? Ee(d) ? Promise.all(d).then(r, i) : r(d) : d.then(r, i);
    };
  }
  return o(t)();
}
function MR(e, t, n) {
  var r = arguments.length;
  if (r < 2) throw new ne.InvalidArgument("Too few arguments");
  for (var i = new Array(r - 1); --r; ) i[r - 1] = arguments[r];
  return n = i.pop(), [
    e,
    gy(i),
    n
  ];
}
function Ly(e, t, n, r, i) {
  return H.resolve().then(function() {
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
      return f.name === Mu.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
        return Ly(e, t, n, null, i);
      })) : xe(f);
    }
    var c = Ru(i);
    c && gr();
    var d, h = H.follow(function() {
      if (d = i.call(s, s), d)
        if (c) {
          var f = on.bind(null, null);
          d.then(f, f);
        } else typeof d.next == "function" && typeof d.throw == "function" && (d = Bl(d));
    }, u);
    return (d && typeof d.then == "function" ? H.resolve(d).then(function(f) {
      return s.active ? f : xe(new ne.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
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
function po(e, t, n) {
  for (var r = Ee(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
  return r;
}
function NR(e) {
  return ce(ce({}, e), { table: function(t) {
    var n = e.table(t), r = n.schema, i = {}, o = [];
    function s(g, y, v) {
      var b = ai(g), _ = i[b] = i[b] || [], w = g == null ? 0 : typeof g == "string" ? 1 : g.length, E = y > 0, T = ce(ce({}, v), {
        name: E ? "".concat(b, "(virtual-from:").concat(v.name, ")") : v.name,
        lowLevelIndex: v,
        isVirtual: E,
        keyTail: y,
        keyLength: w,
        extractKey: $l(g),
        unique: !E && v.unique
      });
      return _.push(T), T.isPrimaryKey || o.push(T), w > 1 && s(w === 2 ? g[0] : g.slice(0, w - 1), y + 1, v), _.sort(function(S, N) {
        return S.keyTail - N.keyTail;
      }), T;
    }
    var u = s(r.primaryKey.keyPath, 0, r.primaryKey);
    i[":id"] = [u];
    for (var c = 0, d = r.indexes; c < d.length; c++) {
      var h = d[c];
      s(h.keyPath, 0, h);
    }
    function f(g) {
      var y = i[ai(g)];
      return y && y[0];
    }
    function p(g, y) {
      return {
        type: g.type === 1 ? 2 : g.type,
        lower: po(g.lower, g.lowerOpen ? e.MAX_KEY : e.MIN_KEY, y),
        lowerOpen: !0,
        upper: po(g.upper, g.upperOpen ? e.MIN_KEY : e.MAX_KEY, y),
        upperOpen: !0
      };
    }
    function m(g) {
      var y = g.query.index;
      return y.isVirtual ? ce(ce({}, g), { query: {
        index: y.lowLevelIndex,
        range: p(g.query.range, y.keyTail)
      } }) : g;
    }
    return ce(ce({}, n), {
      schema: ce(ce({}, r), {
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
            S != null ? E.continue(po(S, g.reverse ? e.MAX_KEY : e.MIN_KEY, v)) : g.unique ? E.continue(E.key.slice(0, _).concat(g.reverse ? e.MIN_KEY : e.MAX_KEY, v)) : E.continue();
          }
          return Object.create(E, {
            continue: { value: T },
            continuePrimaryKey: { value: function(S, N) {
              E.continuePrimaryKey(po(S, e.MAX_KEY, v), N);
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
var kR = {
  stack: "dbcore",
  name: "VirtualIndexMiddleware",
  level: 1,
  create: NR
};
function Ku(e, t, n, r) {
  return n = n || {}, r = r || "", Fe(e).forEach(function(i) {
    if (!Ze(t, i)) n[r + i] = void 0;
    else {
      var o = e[i], s = t[i];
      if (typeof o == "object" && typeof s == "object" && o && s) {
        var u = Cl(o);
        u !== Cl(s) ? n[r + i] = t[i] : u === "Object" ? Ku(o, s, n, r + i + ".") : o !== s && (n[r + i] = t[i]);
      } else o !== s && (n[r + i] = t[i]);
    }
  }), Fe(t).forEach(function(i) {
    Ze(e, i) || (n[r + i] = t[i]);
  }), n;
}
function Wu(e, t) {
  return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
}
var DR = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: function(e) {
    return ce(ce({}, e), { table: function(t) {
      var n = e.table(t), r = n.schema.primaryKey;
      return ce(ce({}, n), { mutate: function(i) {
        var o = ee.trans, s = o.table(t).hook, u = s.deleting, c = s.creating, d = s.updating;
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
          var g = ee.trans, y = m.keys || Wu(r, m);
          if (!y) throw new Error("Keys missing");
          return m = m.type === "add" || m.type === "put" ? ce(ce({}, m), { keys: y }) : ce({}, m), m.type !== "delete" && (m.values = ns([], m.values, !0)), m.keys && (m.keys = ns([], m.keys, !0)), LR(n, m, y).then(function(v) {
            var b = y.map(function(_, w) {
              var E = v[w], T = {
                onerror: null,
                onsuccess: null
              };
              if (m.type === "delete") u.fire.call(T, _, E, g);
              else if (m.type === "add" || E === void 0) {
                var S = c.fire.call(T, _, m.values[w], g);
                _ == null && S != null && (_ = S, m.keys[w] = _, r.outbound || at(m.values[w], r.keyPath, _));
              } else {
                var N = Ku(E, m.values[w]), A = d.fire.call(T, N, _, E, g);
                if (A) {
                  var k = m.values[w];
                  Object.keys(A).forEach(function(L) {
                    Ze(k, L) ? k[L] = A[L] : at(k, L, A[L]);
                  });
                }
              }
              return T;
            });
            return n.mutate(m).then(function(_) {
              for (var w = _.failures, E = _.results, T = _.numFailures, S = _.lastResult, N = 0; N < y.length; ++N) {
                var A = E ? E[N] : y[N], k = b[N];
                A == null ? k.onerror && k.onerror(w[N]) : k.onsuccess && k.onsuccess(m.type === "put" && v[N] ? m.values[N] : A);
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
              } : p(m, ce(ce({}, g), {
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
function LR(e, t, n) {
  return t.type === "add" ? Promise.resolve([]) : e.getMany({
    trans: t.trans,
    keys: n,
    cache: "immutable"
  });
}
function $y(e, t, n) {
  try {
    if (!t || t.keys.length < e.length) return null;
    for (var r = [], i = 0, o = 0; i < t.keys.length && o < e.length; ++i)
      pe(t.keys[i], e[o]) === 0 && (r.push(n ? Pn(t.values[i]) : t.values[i]), ++o);
    return r.length === e.length ? r : null;
  } catch {
    return null;
  }
}
var $R = {
  stack: "dbcore",
  level: -1,
  create: function(e) {
    return { table: function(t) {
      var n = e.table(t);
      return ce(ce({}, n), {
        getMany: function(r) {
          if (!r.cache) return n.getMany(r);
          var i = $y(r.keys, r.trans._cache, r.cache === "clone");
          return i ? H.resolve(i) : n.getMany(r).then(function(o) {
            return r.trans._cache = {
              keys: r.keys,
              values: r.cache === "clone" ? Pn(o) : o
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
function Uy(e, t) {
  return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
}
function Fy(e, t) {
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
var UR = {
  stack: "dbcore",
  level: 0,
  name: "Observability",
  create: function(e) {
    var t = e.schema.name, n = new Je(e.MIN_KEY, e.MAX_KEY);
    return ce(ce({}, e), {
      transaction: function(r, i, o) {
        if (ee.subscr && i !== "readonly") throw new ne.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(ee.querier));
        return e.transaction(r, i, o);
      },
      table: function(r) {
        var i = e.table(r), o = i.schema, s = o.primaryKey, u = o.indexes, c = s.extractKey, d = s.outbound, h = s.autoIncrement && u.filter(function(g) {
          return g.compound && g.keyPath.includes(s.keyPath);
        }), f = ce(ce({}, i), { mutate: function(g) {
          var y, v, b = g.trans, _ = g.mutatedParts || (g.mutatedParts = {}), w = function(K) {
            var C = "idb://".concat(t, "/").concat(r, "/").concat(K);
            return _[C] || (_[C] = new Je());
          }, E = w(""), T = w(":dels"), S = g.type, N = g.type === "deleteRange" ? [g.range] : g.type === "delete" ? [g.keys] : g.values.length < 50 ? [Wu(s, g).filter(function(K) {
            return K;
          }), g.values] : [], A = N[0], k = N[1], L = g.trans._cache;
          if (Ee(A)) {
            E.addKeys(A);
            var G = S === "delete" || A.length === k.length ? $y(A, L) : null;
            G || T.addKeys(A), (G || k) && FR(w, o, G, k);
          } else if (A) {
            var Z = {
              from: (y = A.lower) !== null && y !== void 0 ? y : e.MIN_KEY,
              to: (v = A.upper) !== null && v !== void 0 ? v : e.MAX_KEY
            };
            T.add(Z), E.add(Z);
          } else
            E.add(n), T.add(n), o.indexes.forEach(function(K) {
              return w(K.name).add(n);
            });
          return i.mutate(g).then(function(K) {
            return A && (g.type === "add" || g.type === "put") && (E.addKeys(K.results), h && h.forEach(function(C) {
              for (var R = g.values.map(function(B) {
                return C.extractKey(B);
              }), Y = C.keyPath.findIndex(function(B) {
                return B === s.keyPath;
              }), J = 0, D = K.results.length; J < D; ++J) R[J][Y] = K.results[J];
              w(C.name).addKeys(R);
            })), b.mutatedParts = Us(b.mutatedParts || {}, _), K;
          });
        } }), p = function(g) {
          var y, v, b = g.query, _ = b.index, w = b.range;
          return [_, new Je((y = w.lower) !== null && y !== void 0 ? y : e.MIN_KEY, (v = w.upper) !== null && v !== void 0 ? v : e.MAX_KEY)];
        }, m = {
          get: function(g) {
            return [s, new Je(g.key)];
          },
          getMany: function(g) {
            return [s, new Je().addKeys(g.keys)];
          },
          count: p,
          query: p,
          openCursor: p
        };
        return Fe(m).forEach(function(g) {
          f[g] = function(y) {
            var v = ee.subscr, b = !!v, _ = Uy(ee, i) && Fy(g, y) ? y.obsSet = {} : v;
            if (b) {
              var w = function(L) {
                var G = "idb://".concat(t, "/").concat(r, "/").concat(L);
                return _[G] || (_[G] = new Je());
              }, E = w(""), T = w(":dels"), S = m[g](y), N = S[0], A = S[1];
              if (g === "query" && N.isPrimaryKey && !y.values ? T.add(A) : w(N.name || "").add(A), !N.isPrimaryKey) if (g === "count") T.add(n);
              else {
                var k = g === "query" && d && y.values && i.query(ce(ce({}, y), { values: !1 }));
                return i[g].apply(this, arguments).then(function(L) {
                  if (g === "query") {
                    if (d && y.values) return k.then(function(C) {
                      var R = C.result;
                      return E.addKeys(R), L;
                    });
                    var G = y.values ? L.result.map(c) : L.result;
                    y.values ? E.addKeys(G) : T.addKeys(G);
                  } else if (g === "openCursor") {
                    var Z = L, K = y.values;
                    return Z && Object.create(Z, {
                      key: { get: function() {
                        return T.addKey(Z.primaryKey), Z.key;
                      } },
                      primaryKey: { get: function() {
                        var C = Z.primaryKey;
                        return T.addKey(C), C;
                      } },
                      value: { get: function() {
                        return K && E.addKey(Z.primaryKey), Z.value;
                      } }
                    });
                  }
                  return L;
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
function FR(e, t, n, r) {
  function i(o) {
    var s = e(o.name || "");
    function u(d) {
      return d != null ? o.extractKey(d) : null;
    }
    var c = function(d) {
      return o.multiEntry && Ee(d) ? d.forEach(function(h) {
        return s.addKey(h);
      }) : s.addKey(d);
    };
    (n || r).forEach(function(d, h) {
      var f = n && u(n[h]), p = r && u(r[h]);
      pe(f, p) !== 0 && (f != null && c(f), p != null && c(p));
    });
  }
  t.indexes.forEach(i);
}
function Th(e, t, n) {
  if (n.numFailures === 0) return t;
  if (t.type === "deleteRange") return null;
  var r = t.keys ? t.keys.length : "values" in t && t.values ? t.values.length : 1;
  if (n.numFailures === r) return null;
  var i = ce({}, t);
  return Ee(i.keys) && (i.keys = i.keys.filter(function(o, s) {
    return !(s in n.failures);
  })), "values" in i && Ee(i.values) && (i.values = i.values.filter(function(o, s) {
    return !(s in n.failures);
  })), i;
}
function BR(e, t) {
  return t.lower === void 0 ? !0 : t.lowerOpen ? pe(e, t.lower) > 0 : pe(e, t.lower) >= 0;
}
function OR(e, t) {
  return t.upper === void 0 ? !0 : t.upperOpen ? pe(e, t.upper) < 0 : pe(e, t.upper) <= 0;
}
function Ia(e, t) {
  return BR(e, t) && OR(e, t);
}
function Ah(e, t, n, r, i, o) {
  if (!n || n.length === 0) return e;
  var s = t.query.index, u = s.multiEntry, c = t.query.range, d = r.schema.primaryKey.extractKey, h = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(m, g) {
    var y = m, v = [];
    if (g.type === "add" || g.type === "put")
      for (var b = new Je(), _ = g.values.length - 1; _ >= 0; --_) {
        var w = g.values[_], E = d(w);
        if (!b.hasKey(E)) {
          var T = h(w);
          (u && Ee(T) ? T.some(function(L) {
            return Ia(L, c);
          }) : Ia(T, c)) && (b.addKey(E), v.push(w));
        }
      }
    switch (g.type) {
      case "add":
        var S = new Je().addKeys(t.values ? m.map(function(L) {
          return d(L);
        }) : m);
        y = m.concat(t.values ? v.filter(function(L) {
          var G = d(L);
          return S.hasKey(G) ? !1 : (S.addKey(G), !0);
        }) : v.map(function(L) {
          return d(L);
        }).filter(function(L) {
          return S.hasKey(L) ? !1 : (S.addKey(L), !0);
        }));
        break;
      case "put":
        var N = new Je().addKeys(g.values.map(function(L) {
          return d(L);
        }));
        y = m.filter(function(L) {
          return !N.hasKey(t.values ? d(L) : L);
        }).concat(t.values ? v : v.map(function(L) {
          return d(L);
        }));
        break;
      case "delete":
        var A = new Je().addKeys(g.keys);
        y = m.filter(function(L) {
          return !A.hasKey(t.values ? d(L) : L);
        });
        break;
      case "deleteRange":
        var k = g.range;
        y = m.filter(function(L) {
          return !Ia(d(L), k);
        });
        break;
    }
    return y;
  }, e);
  return p === e ? e : (p.sort(function(m, g) {
    return pe(f(m), f(g)) || pe(d(m), d(g));
  }), t.limit && t.limit < 1 / 0 && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), o ? Object.freeze(p) : p);
}
function Ch(e, t) {
  return pe(e.lower, t.lower) === 0 && pe(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
}
function GR(e, t, n, r) {
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
function qR(e, t, n, r) {
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
function VR(e, t) {
  return GR(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && qR(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
}
function HR(e, t, n, r) {
  var i = Rn["idb://".concat(e, "/").concat(t)];
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
        return d.req.limit === r.limit && d.req.values === r.values && Ch(d.req.query.range, r.query.range);
      });
      return u ? [
        u,
        !0,
        i,
        s
      ] : [
        s.find(function(d) {
          return ("limit" in d.req ? d.req.limit : 1 / 0) >= r.limit && (r.values ? d.req.values : !0) && VR(d.req.query.range, r.query.range);
        }),
        !1,
        i,
        s
      ];
    case "count":
      var c = s.find(function(d) {
        return Ch(d.req.query.range, r.query.range);
      });
      return [
        c,
        !!c,
        i,
        s
      ];
  }
}
function KR(e, t, n, r) {
  e.subscribers.add(n), r.addEventListener("abort", function() {
    e.subscribers.delete(n), e.subscribers.size === 0 && WR(e, t);
  });
}
function WR(e, t) {
  setTimeout(function() {
    e.subscribers.size === 0 && vn(t, e);
  }, 3e3);
}
var JR = {
  stack: "dbcore",
  level: 0,
  name: "Cache",
  create: function(e) {
    var t = e.schema.name;
    return ce(ce({}, e), {
      transaction: function(n, r, i) {
        var o = e.transaction(n, r, i);
        if (r === "readwrite") {
          var s = new AbortController(), u = s.signal, c = function(d) {
            return function() {
              if (s.abort(), r === "readwrite") {
                for (var h = /* @__PURE__ */ new Set(), f = 0, p = n; f < p.length; f++) {
                  var m = p[f], g = Rn["idb://".concat(t, "/").concat(m)];
                  if (g) {
                    var y = e.table(m), v = g.optimisticOps.filter(function(K) {
                      return K.trans === o;
                    });
                    if (o._explicit && d && o.mutatedParts) for (var b = 0, _ = Object.values(g.queries.query); b < _.length; b++)
                      for (var w = _[b], E = 0, T = w.slice(); E < T.length; E++) {
                        var S = T[E];
                        Vu(S.obsSet, o.mutatedParts) && (vn(w, S), S.subscribers.forEach(function(K) {
                          return h.add(K);
                        }));
                      }
                    else if (v.length > 0) {
                      g.optimisticOps = g.optimisticOps.filter(function(K) {
                        return K.trans !== o;
                      });
                      for (var N = 0, A = Object.values(g.queries.query); N < A.length; N++)
                        for (var w = A[N], k = 0, L = w.slice(); k < L.length; k++) {
                          var S = L[k];
                          if (S.res != null && o.mutatedParts) if (d && !S.dirty) {
                            var G = Object.isFrozen(S.res), Z = Ah(S.res, S.req, v, y, S, G);
                            S.dirty ? (vn(w, S), S.subscribers.forEach(function(R) {
                              return h.add(R);
                            })) : Z !== S.res && (S.res = Z, S.promise = H.resolve({ result: Z }));
                          } else
                            S.dirty && vn(w, S), S.subscribers.forEach(function(R) {
                              return h.add(R);
                            });
                        }
                    }
                  }
                }
                h.forEach(function(K) {
                  return K();
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
        return ce(ce({}, r), {
          mutate: function(o) {
            var s = ee.trans;
            if (i.outbound || s.db._options.cache === "disabled" || s.explicit || s.idbtrans.mode !== "readwrite") return r.mutate(o);
            var u = Rn["idb://".concat(t, "/").concat(n)];
            if (!u) return r.mutate(o);
            var c = r.mutate(o);
            return (o.type === "add" || o.type === "put") && (o.values.length >= 50 || Wu(i, o).some(function(d) {
              return d == null;
            })) ? c.then(function(d) {
              var h = Th(u, ce(ce({}, o), { values: o.values.map(function(f, p) {
                var m;
                if (d.failures[p]) return f;
                var g = !((m = i.keyPath) === null || m === void 0) && m.includes(".") ? Pn(f) : ce({}, f);
                return at(g, i.keyPath, d.results[p]), g;
              }) }), d);
              u.optimisticOps.push(h), queueMicrotask(function() {
                return o.mutatedParts && ho(o.mutatedParts);
              });
            }) : (u.optimisticOps.push(o), o.mutatedParts && ho(o.mutatedParts), c.then(function(d) {
              if (d.numFailures > 0) {
                vn(u.optimisticOps, o);
                var h = Th(u, o, d);
                h && u.optimisticOps.push(h), o.mutatedParts && ho(o.mutatedParts);
              }
            }), c.catch(function() {
              vn(u.optimisticOps, o), o.mutatedParts && ho(o.mutatedParts);
            })), c;
          },
          query: function(o) {
            var s;
            if (!Uy(ee, r) || !Fy("query", o)) return r.query(o);
            var u = ((s = ee.trans) === null || s === void 0 ? void 0 : s.db._options.cache) === "immutable", c = ee, d = c.requery, h = c.signal, f = HR(t, n, "query", o), p = f[0], m = f[1], g = f[2], y = f[3];
            if (p && m) p.obsSet = o.obsSet;
            else {
              var v = r.query(o).then(function(b) {
                var _ = b.result;
                if (p && (p.res = _), u) {
                  for (var w = 0, E = _.length; w < E; ++w) Object.freeze(_[w]);
                  Object.freeze(_);
                } else b.result = Pn(_);
                return b;
              }).catch(function(b) {
                return y && p && vn(y, p), Promise.reject(b);
              });
              p = {
                obsSet: o.obsSet,
                promise: v,
                subscribers: /* @__PURE__ */ new Set(),
                type: "query",
                req: o,
                dirty: !1
              }, y ? y.push(p) : (y = [p], g || (g = Rn["idb://".concat(t, "/").concat(n)] = {
                queries: {
                  query: {},
                  count: {}
                },
                objs: /* @__PURE__ */ new Map(),
                optimisticOps: [],
                unsignaledParts: {}
              }), g.queries.query[o.query.index.name || ""] = y);
            }
            return KR(p, y, d, h), p.promise.then(function(b) {
              return { result: Ah(b.result, o, g?.optimisticOps, r, p, u) };
            });
          }
        });
      }
    });
  }
};
function mo(e, t) {
  return new Proxy(e, { get: function(n, r, i) {
    return r === "db" ? t : Reflect.get(n, r, i);
  } });
}
var vi = (function() {
  function e(t, n) {
    var r = this;
    this._middlewares = {}, this.verno = 0;
    var i = e.dependencies;
    this._options = n = ce({
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
    s.dbReadyPromise = new H(function(c) {
      s.dbReadyResolve = c;
    }), s.openCanceller = new H(function(c, d) {
      s.cancelOpen = d;
    }), this._state = s, this.name = t, this.on = Ri(this, "populate", "blocked", "versionchange", "close", { ready: [Nu, ve] }), this.on.ready.subscribe = hy(this.on.ready.subscribe, function(c) {
      return function(d, h) {
        e.vip(function() {
          var f = r._state;
          if (f.openComplete)
            f.dbOpenError || H.resolve().then(d), h && c(d);
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
    }), this.Collection = eR(this), this.Table = XI(this), this.Transaction = lR(this), this.Version = TR(this), this.WhereClause = sR(this), this.on("versionchange", function(c) {
      c.newVersion > 0 ? console.warn("Another connection wants to upgrade database '".concat(r.name, "'. Closing db now to resume the upgrade.")) : console.warn("Another connection wants to delete database '".concat(r.name, "'. Closing db now to resume the delete request.")), r.close({ disableAutoOpen: !1 });
    }), this.on("blocked", function(c) {
      !c.newVersion || c.newVersion < c.oldVersion ? console.warn("Dexie.delete('".concat(r.name, "') was blocked")) : console.warn("Upgrade '".concat(r.name, "' blocked by other connection holding version ").concat(c.oldVersion / 10));
    }), this._maxKey = gi(n.IDBKeyRange), this._createTransaction = function(c, d, h, f) {
      return new r.Transaction(c, d, h, r._options.chromeTransactionDurability, f);
    }, this._fireOnBlocked = function(c) {
      r.on("blocked").fire(c), rr.filter(function(d) {
        return d.name === r.name && d !== r && !d._state.vcFired;
      }).map(function(d) {
        return d.on("versionchange").fire(c);
      });
    }, this.use($R), this.use(JR), this.use(UR), this.use(kR), this.use(DR);
    var u = new Proxy(this, { get: function(c, d, h) {
      if (d === "_vip") return !0;
      if (d === "table") return function(p) {
        return mo(r.table(p), u);
      };
      var f = Reflect.get(c, d, h);
      return f instanceof Ry ? mo(f, u) : d === "tables" ? f.map(function(p) {
        return mo(p, u);
      }) : d === "_createTransaction" ? function() {
        return mo(f.apply(this, arguments), u);
      } : f;
    } });
    this.vip = u, o.forEach(function(c) {
      return c(r);
    });
  }
  return e.prototype.version = function(t) {
    if (isNaN(t) || t < 0.1) throw new ne.Type("Given version is not a positive number");
    if (t = Math.round(t * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new ne.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, t);
    var n = this._versions, r = n.filter(function(i) {
      return i._cfg.version === t;
    })[0];
    return r || (r = new this.Version(t), n.push(r), n.sort(mR), r.stores({}), this._state.autoSchema = !1, r);
  }, e.prototype._whenReady = function(t) {
    var n = this;
    return this.idbdb && (this._state.openComplete || ee.letThrough || this._vip) ? t() : new H(function(r, i) {
      if (n._state.openComplete) return i(new ne.DatabaseClosed(n._state.dbOpenError));
      if (!n._state.isBeingOpened) {
        if (!n._state.autoOpen) {
          i(new ne.DatabaseClosed());
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
    return Nn(en, function() {
      return PR(t);
    });
  }, e.prototype._close = function() {
    var t = this._state, n = rr.indexOf(this);
    if (n >= 0 && rr.splice(n, 1), this.idbdb) {
      try {
        this.idbdb.close();
      } catch {
      }
      this.idbdb = null;
    }
    t.isBeingOpened || (t.dbReadyPromise = new H(function(r) {
      t.dbReadyResolve = r;
    }), t.openCanceller = new H(function(r, i) {
      t.cancelOpen = i;
    }));
  }, e.prototype.close = function(t) {
    var n = (t === void 0 ? { disableAutoOpen: !0 } : t).disableAutoOpen, r = this._state;
    n ? (r.isBeingOpened && r.cancelOpen(new ne.DatabaseClosed()), this._close(), r.autoOpen = !1, r.dbOpenError = new ne.DatabaseClosed()) : (this._close(), r.autoOpen = this._options.autoOpen || r.isBeingOpened, r.openComplete = !1, r.dbOpenError = null);
  }, e.prototype.delete = function(t) {
    var n = this;
    t === void 0 && (t = { disableAutoOpen: !0 });
    var r = arguments.length > 0 && typeof arguments[0] != "object", i = this._state;
    return new H(function(o, s) {
      var u = function() {
        n.close(t);
        var c = n._deps.indexedDB.deleteDatabase(n.name);
        c.onsuccess = Se(function() {
          xR(n._deps, n.name), o();
        }), c.onerror = At(s), c.onblocked = n._fireOnBlocked;
      };
      if (r) throw new ne.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
      return Fe(this._allTables).map(function(n) {
        return t._allTables[n];
      });
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype.transaction = function() {
    var t = MR.apply(this, arguments);
    return this._transaction.apply(this, t);
  }, e.prototype._transaction = function(t, n, r) {
    var i = this, o = ee.trans;
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
      else throw new ne.InvalidArgument("Invalid transaction mode: " + t);
      if (o) {
        if (o.mode === ba && u === wa) if (s) o = null;
        else throw new ne.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        o && c.forEach(function(h) {
          if (o && o.storeNames.indexOf(h) === -1) if (s) o = null;
          else throw new ne.SubTransaction("Table " + h + " not included in parent transaction.");
        }), s && o && !o.active && (o = null);
      }
    } catch (h) {
      return o ? o._promise(null, function(f, p) {
        p(h);
      }) : xe(h);
    }
    var d = Ly.bind(null, this, u, c, o, r);
    return o ? o._promise(u, d, "lock") : ee.trans ? Nn(ee.transless, function() {
      return i._whenReady(d);
    }) : this._whenReady(d);
  }, e.prototype.table = function(t) {
    if (!Ze(this._allTables, t)) throw new ne.InvalidTable("Table ".concat(t, " does not exist"));
    return this._allTables[t];
  }, e;
})(), zR = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", YR = (function() {
  function e(t) {
    this._subscribe = t;
  }
  return e.prototype.subscribe = function(t, n, r) {
    return this._subscribe(!t || typeof t == "function" ? {
      next: t,
      error: n,
      complete: r
    } : t);
  }, e.prototype[zR] = function() {
    return this;
  }, e;
})(), hs;
try {
  hs = {
    indexedDB: Ge.indexedDB || Ge.mozIndexedDB || Ge.webkitIndexedDB || Ge.msIndexedDB,
    IDBKeyRange: Ge.IDBKeyRange || Ge.webkitIDBKeyRange
  };
} catch {
  hs = {
    indexedDB: null,
    IDBKeyRange: null
  };
}
function XR(e) {
  var t = !1, n, r = new YR(function(i) {
    var o = Ru(e);
    function s(b) {
      var _ = pr();
      try {
        o && gr();
        var w = rn(e, b);
        return o && (w = w.finally(on)), w;
      } finally {
        _ && mr();
      }
    }
    var u = !1, c, d = {}, h = {}, f = {
      get closed() {
        return u;
      },
      unsubscribe: function() {
        u || (u = !0, c && c.abort(), p && an.storagemutated.unsubscribe(y));
      }
    };
    i.start && i.start(f);
    var p = !1, m = function() {
      return _a(v);
    };
    function g() {
      return Vu(h, d);
    }
    var y = function(b) {
      Us(d, b), g() && m();
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
          t = !0, n = E, !(u || _.signal.aborted) && (d = {}, h = b, !EI(h) && !p && (an(Mi, y), p = !0), _a(function() {
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
var Sn = vi;
or(Sn, ce(ce({}, Ds), {
  delete: function(e) {
    return new Sn(e, { addons: [] }).delete();
  },
  exists: function(e) {
    return new Sn(e, { addons: [] }).open().then(function(t) {
      return t.close(), !0;
    }).catch("NoSuchDatabaseError", function() {
      return !1;
    });
  },
  getDatabaseNames: function(e) {
    try {
      return AR(Sn.dependencies).then(e);
    } catch {
      return xe(new ne.MissingAPI());
    }
  },
  defineClass: function() {
    function e(t) {
      lt(this, t);
    }
    return e;
  },
  ignoreTransaction: function(e) {
    return ee.trans ? Nn(ee.transless, e) : e();
  },
  vip: Fl,
  async: function(e) {
    return function() {
      try {
        var t = Bl(e.apply(this, arguments));
        return !t || typeof t.then != "function" ? H.resolve(t) : t;
      } catch (n) {
        return xe(n);
      }
    };
  },
  spawn: function(e, t, n) {
    try {
      var r = Bl(e.apply(n, t || []));
      return !r || typeof r.then != "function" ? H.resolve(r) : r;
    } catch (i) {
      return xe(i);
    }
  },
  currentTransaction: { get: function() {
    return ee.trans || null;
  } },
  waitFor: function(e, t) {
    var n = H.resolve(typeof e == "function" ? Sn.ignoreTransaction(e) : e).timeout(t || 6e4);
    return ee.trans ? ee.trans.waitFor(n) : n;
  },
  Promise: H,
  debug: {
    get: function() {
      return xt;
    },
    set: function(e) {
      wy(e);
    }
  },
  derive: fr,
  extend: lt,
  props: or,
  override: hy,
  Events: Ri,
  on: an,
  liveQuery: XR,
  extendObservabilitySet: Us,
  getByKeyPath: Ut,
  setByKeyPath: at,
  delByKeyPath: bI,
  shallowClone: my,
  deepClone: Pn,
  getObjectDiff: Ku,
  cmp: pe,
  asap: py,
  minKey: kl,
  addons: [],
  connections: rr,
  errnames: Mu,
  dependencies: hs,
  cache: Rn,
  semVer: mh,
  version: mh.split(".").map(function(e) {
    return parseInt(e);
  }).reduce(function(e, t, n) {
    return e + t / Math.pow(10, n * 2);
  })
}));
Sn.maxKey = gi(Sn.dependencies.IDBKeyRange);
typeof dispatchEvent < "u" && typeof addEventListener < "u" && (an(Mi, function(e) {
  if (!Zt) {
    var t = new CustomEvent(Dl, { detail: e });
    Zt = !0, dispatchEvent(t), Zt = !1;
  }
}), addEventListener(Dl, function(e) {
  var t = e.detail;
  Zt || Ju(t);
}));
function Ju(e) {
  var t = Zt;
  try {
    Zt = !0, an.storagemutated.fire(e), Hu(e, !0);
  } finally {
    Zt = t;
  }
}
var Zt = !1, Yt, Ol = function() {
};
typeof BroadcastChannel < "u" && (Ol = function() {
  Yt = new BroadcastChannel(Dl), Yt.onmessage = function(e) {
    return e.data && Ju(e.data);
  };
}, Ol(), typeof Yt.unref == "function" && Yt.unref(), an(Mi, function(e) {
  Zt || Yt.postMessage(e);
}));
typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
  if (!vi.disableBfCache && e.persisted) {
    xt && console.debug("Dexie: handling persisted pagehide"), Yt?.close();
    for (var t = 0, n = rr; t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
  }
}), addEventListener("pageshow", function(e) {
  !vi.disableBfCache && e.persisted && (xt && console.debug("Dexie: handling persisted pageshow"), Ol(), Ju({ all: new Je(-1 / 0, [[]]) }));
}));
H.rejectionMapper = RI;
wy(xt);
var Fs = new vi("LittleWhiteBox_Assistant");
Fs.version(1).stores({
  sessions: "id, updatedAt",
  messages: "[sessionId+order], sessionId"
});
var go = Fs.sessions, $r = Fs.messages, _n = "default", Vn = Promise.resolve();
function By(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function QR(e, t, n, r) {
  return {
    sessionId: _n,
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
    providerPayload: By(e?.providerPayload)
  };
}
function ZR(e, t) {
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
    providerPayload: By(e?.providerPayload)
  };
}
function jR(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest);
}
function eP(e) {
  const { state: t, createRequestId: n, normalizeAttachments: r, normalizeThoughtBlocks: i, getActiveContextMessages: o } = e;
  function s() {
    const f = o().filter(jR).map((p, m) => QR(p, r, i, m));
    return {
      historySummary: String(t.historySummary || ""),
      sidebarCollapsed: t.sidebarCollapsed !== void 0 ? !!t.sidebarCollapsed : !0,
      messages: f
    };
  }
  async function u(f) {
    await Fs.transaction("rw", go, $r, async () => {
      await go.put({
        id: _n,
        updatedAt: Date.now(),
        historySummary: f.historySummary,
        sidebarCollapsed: f.sidebarCollapsed
      }), await $r.where("sessionId").equals(_n).delete(), f.messages.length && await $r.bulkPut(f.messages);
    });
  }
  function c() {
    const f = s();
    return Vn = Vn.catch(() => {
    }).then(async () => {
      try {
        await u(f);
      } catch (p) {
        console.error("[Assistant] 保存会话失败:", p);
      }
    }), Vn;
  }
  function d() {
    return Vn = Vn.catch(() => {
    }).then(async () => {
      try {
        await $r.where("sessionId").equals(_n).delete(), await go.delete(_n);
      } catch (f) {
        console.error("[Assistant] 清空会话失败:", f);
      }
    }), Vn;
  }
  async function h() {
    try {
      const f = await go.get(_n);
      if (!f) {
        t.messages = [], t.historySummary = "", t.archivedTurnCount = 0, t.sidebarCollapsed = !0;
        return;
      }
      const p = await $r.where("sessionId").equals(_n).toArray();
      p.sort((m, g) => Number(m.order || 0) - Number(g.order || 0)), t.messages = p.map((m) => ZR(m, {
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
function tP(e) {
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
    const E = _.slice(0, w), T = [];
    let S = "";
    return E.forEach((N) => {
      if (!i.includes(N.type)) {
        S = "只支持 PNG、JPG、WEBP、GIF 图片";
        return;
      }
      if ((Number(N.size) || 0) > s) {
        S = `单张图片不能超过 ${Math.round(s / (1024 * 1024))}MB`;
        return;
      }
      T.push(N);
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
      const N = await Promise.all(w.map((A) => f(A)));
      return t.draftAttachments = [...t.draftAttachments, ...N].slice(0, o), r(), (E || S) && n(E || `最多只能附 ${o} 张图片`), !0;
    } catch (N) {
      return n(String(N?.message || "读取图片失败")), !0;
    }
  }
  function v(b, _ = [], w = {}) {
    const E = u(_);
    b.replaceChildren(), b.style.display = E.length ? "" : "none", E.length && E.forEach((T, S) => {
      const N = document.createElement("div");
      if (N.className = w.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", T.dataUrl) {
        const k = document.createElement("img");
        k.className = "xb-assistant-attachment-image", k.src = T.dataUrl, k.alt = T.name, N.appendChild(k);
      } else {
        const k = document.createElement("div");
        k.className = "xb-assistant-attachment-placeholder", k.textContent = "图片", N.appendChild(k);
      }
      const A = document.createElement("div");
      if (A.className = "xb-assistant-attachment-name", A.textContent = T.name, N.appendChild(A), typeof w.onRemove == "function") {
        const k = document.createElement("button");
        k.type = "button", k.className = "xb-assistant-attachment-remove", k.textContent = "×", k.title = "移除图片", k.addEventListener("click", () => w.onRemove(S)), N.appendChild(k);
      }
      b.appendChild(N);
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
var nP = { chat: { exclude: [
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
function yo(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const i = document.createElement("option");
    i.value = r.value, i.textContent = r.label, e.appendChild(i);
  });
}
function zu(e = []) {
  const t = [...new Set(e.filter(Boolean).map((i) => String(i).trim()).filter(Boolean))], n = nP.chat, r = t.filter((i) => {
    const o = i.toLowerCase();
    return !n.exclude.some((s) => o.includes(s));
  });
  return r.length ? r : t;
}
function Bs(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function _i(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function rP(e) {
  const t = Bs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return _i([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return _i([`${t}/v1/models`, `${t}/models`]);
}
function iP(e) {
  const t = Bs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return _i([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return _i([`${t}/v1/models`, `${t}/models`]);
}
function oP(e, t) {
  const n = Bs(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return _i([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function sP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function aP(e, t = {}) {
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
    errorSnippet: sP(i, r)
  };
}
function lP(e) {
  return zu((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function uP(e) {
  return zu((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function cP(e) {
  return zu((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Ra({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let i = null;
  for (const o of e) for (const s of t) {
    const u = await aP(o, s);
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
async function dP(e) {
  const t = e.provider, n = Bs(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Ra({
    urls: oP(n, r),
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
    extractModels: cP,
    providerLabel: "Google AI"
  }) : t === "anthropic" ? await Ra({
    urls: iP(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: uP,
    providerLabel: "Anthropic"
  }) : await Ra({
    urls: rP(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: lP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function fP(e) {
  const { state: t, post: n, render: r, showToast: i, beginConfigSave: o, requestConfigFormSync: s, describeError: u, getPullState: c, setPullState: d, setProviderModels: h, getProviderModels: f, getProviderLabel: p, normalizeReasoningEffort: m, normalizeAssistantConfig: g, normalizePresetName: y, buildDefaultPreset: v, cloneDefaultModelConfigs: b, createRequestId: _, defaultPresetName: w, requestTimeoutMs: E, toolModeOptions: T, reasoningEffortOptions: S } = e;
  function N(D, B) {
    const z = y(D || w), fe = B && typeof B == "object" ? B : v(), ie = fe.provider || "openai-compatible", he = (fe.modelConfigs || b())[ie] || {};
    return {
      currentPresetName: z,
      presetDraftName: z,
      provider: ie,
      baseUrl: String(he.baseUrl || ""),
      model: String(he.model || ""),
      apiKey: String(he.apiKey || ""),
      temperature: Number(he.temperature ?? 0.2),
      reasoningEnabled: !!he.reasoningEnabled,
      reasoningEffort: m(he.reasoningEffort),
      toolMode: he.toolMode || "native"
    };
  }
  function A() {
    if (t.configDraft) return t.configDraft;
    const D = y(t.config?.currentPresetName || w);
    return t.configDraft = N(D, (t.config?.presets || {})[D] || v()), t.configDraft;
  }
  function k(D) {
    const B = A();
    return {
      ...B,
      currentPresetName: B.currentPresetName,
      presetDraftName: y(D.querySelector("#xb-assistant-preset-name")?.value),
      provider: D.querySelector("#xb-assistant-provider")?.value || B.provider || "openai-compatible",
      baseUrl: D.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: D.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: D.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Number(B.temperature ?? 0.2),
      reasoningEnabled: D.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: m(D.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: D.querySelector("#xb-assistant-tool-mode")?.value || B.toolMode || "native"
    };
  }
  function L(D) {
    return t.configDraft = k(D), t.configDraft;
  }
  function G(D = A()) {
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
  function Z() {
    const D = A();
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
  function K(D) {
    A(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: y(D.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function C(D) {
    if (!t.config) return;
    const B = A(), z = B.provider || "openai-compatible", fe = f(z), ie = D.querySelector("#xb-assistant-tool-mode-wrap"), he = D.querySelector("#xb-assistant-tool-mode"), _e = D.querySelector("#xb-assistant-reasoning-enabled"), Re = D.querySelector("#xb-assistant-reasoning-effort-wrap"), ze = D.querySelector("#xb-assistant-reasoning-effort"), un = D.querySelector("#xb-assistant-model-pulled"), ki = D.querySelector("#xb-assistant-preset-select"), Di = D.querySelector("#xb-assistant-preset-name");
    yo(ki, (t.config.presetNames || []).map((qt) => ({
      value: qt,
      label: qt
    }))), ki.value = B.currentPresetName || t.config.currentPresetName || w, Di.value = B.presetDraftName || B.currentPresetName || w, D.querySelector("#xb-assistant-provider").value = z, D.querySelector("#xb-assistant-base-url").value = B.baseUrl || "", D.querySelector("#xb-assistant-model").value = B.model || "", D.querySelector("#xb-assistant-api-key").value = B.apiKey || "", ie.style.display = z === "openai-compatible" ? "" : "none", yo(he, T), he.value = B.toolMode || "native", yo(ze, S), _e.checked = !!B.reasoningEnabled, ze.value = m(B.reasoningEffort), Re.style.display = _e.checked ? "" : "none", yo(un, fe.map((qt) => ({
      value: qt,
      label: qt
    })), "手动填写");
    const yr = D.querySelector("#xb-assistant-runtime"), Gt = c(z);
    yr.textContent = t.runtime ? `预设「${B.currentPresetName || w}」 · ${p(z)} · 已索引 ${t.runtime.indexedFileCount || 0} 个前端源码文件${Gt.message ? ` · ${Gt.message}` : ""}` : Gt.message || "";
  }
  function R(D) {
    const B = L(D), z = y(B.presetDraftName), fe = y(B.currentPresetName || t.config?.currentPresetName || w), ie = (t.config?.presets || {})[fe] || v(), he = {
      ...ie,
      provider: B.provider,
      modelConfigs: {
        ...ie.modelConfigs || b(),
        [B.provider]: {
          ...(ie.modelConfigs || b())[B.provider] || {},
          ...G(B)
        }
      }
    }, _e = {
      ...t.config?.presets || {},
      [z]: he
    };
    t.config = g({
      ...t.config,
      currentPresetName: z,
      presets: _e
    }), t.configDraft = N(z, he), s();
    const Re = _("save-config");
    o(Re), n("xb-assistant:save-config", {
      requestId: Re,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || w,
      presets: t.config?.presets || {}
    });
  }
  function Y(D) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      i("至少要保留一套预设");
      return;
    }
    const B = y(t.configDraft?.currentPresetName || t.config?.currentPresetName || w), z = { ...t.config?.presets || {} };
    delete z[B];
    const fe = Object.keys(z)[0] || w, ie = z[fe] || v();
    t.config = g({
      ...t.config,
      currentPresetName: fe,
      presets: z
    }), t.configDraft = N(fe, ie), s();
    const he = _("delete-preset");
    o(he), n("xb-assistant:save-config", {
      requestId: he,
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || w,
      presets: t.config?.presets || {}
    }), r();
  }
  function J(D) {
    D.querySelector("#xb-assistant-provider").addEventListener("change", (B) => {
      const z = B.currentTarget.value;
      A(), t.configDraft = {
        ...t.configDraft,
        provider: z
      }, s(), r();
    }), D.querySelector("#xb-assistant-preset-select").addEventListener("change", (B) => {
      const z = y(B.currentTarget.value), fe = (t.config?.presets || {})[z] || v();
      t.config = g({
        ...t.config,
        currentPresetName: z
      }), t.configDraft = N(z, fe), s(), r();
    }), D.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
      K(D);
    }), D.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      L(D);
    }), D.querySelector("#xb-assistant-model").addEventListener("input", () => {
      L(D);
    }), D.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      L(D);
    }), D.querySelector("#xb-assistant-model-pulled").addEventListener("change", (B) => {
      const z = B.currentTarget.value;
      z && (D.querySelector("#xb-assistant-model").value = z, L(D));
    }), D.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
      const B = D.querySelector("#xb-assistant-api-key");
      B.type = B.type === "password" ? "text" : "password", r();
    }), D.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      L(D), s(), r();
    }), D.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      L(D);
    }), D.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      L(D);
    }), D.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      L(D), s();
      const B = Z();
      d(B.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), r();
      try {
        const z = await dP(B);
        h(B.provider, z), d(B.provider, {
          status: "success",
          message: `已拉取 ${z.length} 个模型`
        });
      } catch (z) {
        h(B.provider, []), d(B.provider, {
          status: "error",
          message: u(z)
        });
      }
      s(), r();
    }), D.querySelector("#xb-assistant-save").addEventListener("click", () => {
      R(D);
    }), D.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      Y(D);
    });
  }
  return {
    getActiveProviderConfig: Z,
    syncConfigToForm: C,
    bindSettingsPanelEvents: J
  };
}
function hP(e) {
  const { state: t, toolNames: n, formatToolResultDisplay: r, normalizeThoughtBlocks: i, normalizeAttachments: o, renderAttachmentGallery: s } = e;
  let u = !1, c = null;
  const d = /* @__PURE__ */ new Set();
  function h(C) {
    return String(C || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function f(C) {
    const R = String(C || "").trim();
    if (!R) return "";
    try {
      const Y = globalThis.parent?.showdown || globalThis.showdown, J = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
      if (Y?.Converter && J?.sanitize) {
        const D = new Y.Converter({
          simpleLineBreaks: !0,
          strikethrough: !0,
          tables: !0,
          tasklists: !0,
          ghCodeBlocks: !0,
          simplifiedAutoLink: !0,
          openLinksInNewWindow: !0,
          emoji: !1
        }).makeHtml(R);
        return J.sanitize(D, {
          USE_PROFILES: { html: !0 },
          FORBID_TAGS: ["style", "script"]
        });
      }
    } catch {
    }
    return h(R).replace(/\n/g, "<br>");
  }
  async function p(C) {
    const R = String(C || "");
    if (!R) return !1;
    try {
      if (navigator.clipboard?.writeText)
        return await navigator.clipboard.writeText(R), !0;
    } catch {
    }
    try {
      const Y = document.createElement("textarea");
      Y.value = R, Y.setAttribute("readonly", "readonly"), Y.style.position = "fixed", Y.style.opacity = "0", Y.style.pointerEvents = "none", document.body.appendChild(Y), Y.select(), Y.setSelectionRange(0, Y.value.length);
      const J = document.execCommand("copy");
      return Y.remove(), J;
    } catch {
      return !1;
    }
  }
  function m(C) {
    Array.from(C.body.querySelectorAll("pre")).forEach((R) => {
      if (R.closest(".xb-assistant-codeblock")) return;
      const Y = C.createElement("div");
      Y.className = "xb-assistant-codeblock";
      const J = C.createElement("button");
      J.type = "button", J.className = "xb-assistant-code-copy", J.textContent = "⧉", J.title = "复制代码", J.setAttribute("aria-label", "复制代码"), J.addEventListener("click", async () => {
        const D = await p(R.querySelector("code")?.textContent || R.textContent || "");
        J.textContent = D ? "✓" : "!", J.title = D ? "已复制" : "复制失败", setTimeout(() => {
          J.textContent = "⧉", J.title = "复制代码";
        }, 1200);
      }), R.parentNode?.insertBefore(Y, R), Y.append(J, R);
    });
  }
  function g(C) {
    const R = new DOMParser().parseFromString(`<body>${String(C || "")}</body>`, "text/html");
    m(R);
    const Y = document.createDocumentFragment();
    for (; R.body.firstChild; ) Y.appendChild(R.body.firstChild);
    return Y;
  }
  function y(C) {
    return JSON.stringify({
      role: C.role,
      content: String(C.content || ""),
      toolCallId: String(C.toolCallId || ""),
      toolName: String(C.toolName || ""),
      toolCalls: Array.isArray(C.toolCalls) ? C.toolCalls.map((R) => ({
        id: String(R.id || ""),
        name: String(R.name || ""),
        arguments: String(R.arguments || "")
      })) : [],
      thoughts: i(C.thoughts),
      attachments: o(C.attachments).map((R) => ({
        kind: R.kind,
        name: R.name,
        type: R.type,
        size: R.size
      })),
      streaming: !!C.streaming
    });
  }
  function v(C) {
    return C?.role === "assistant" && Array.isArray(C.toolCalls) && C.toolCalls.length > 0;
  }
  function b(C, R = 0) {
    const Y = Array.isArray(C?.toolCalls) ? C.toolCalls.map((J) => String(J?.id || "").trim()).filter(Boolean) : [];
    return Y.length ? `tool-batch:${Y.join("|")}` : `tool-batch:fallback:${R}:${y(C)}`;
  }
  function _(C, R, Y) {
    const J = document.createElement("details"), D = b(C, Y);
    J.className = "xb-assistant-tool-batch", J.dataset.toolBatchKey = D, d.has(D) && (J.open = !0), J.addEventListener("toggle", () => {
      J.open ? d.add(D) : d.delete(D);
    });
    const B = document.createElement("summary");
    B.className = "xb-assistant-tool-batch-summary", B.textContent = `小白助手 · 已发起 ${Array.isArray(C.toolCalls) ? C.toolCalls.length : 0} 个工具调用`, J.appendChild(B);
    const z = document.createElement("div");
    z.className = "xb-assistant-tool-batch-body";
    const fe = String(C.content || "").trim();
    if (fe) {
      const ie = document.createElement("div");
      ie.className = "xb-assistant-tool-batch-note xb-assistant-markdown", ie.appendChild(g(f(fe))), z.appendChild(ie);
    }
    return R.forEach((ie) => {
      const he = E(ie);
      he.dataset.renderSignature = y(ie), z.appendChild(he);
    }), J.appendChild(z), J;
  }
  function w(C) {
    if (!C || !C.kind) return null;
    const R = document.createElement("div");
    R.className = "xb-assistant-approval";
    const Y = document.createElement("div");
    Y.className = "xb-assistant-approval-title", Y.textContent = C.kind === "generate-skill" ? "待确认的技能沉淀" : "待确认的斜杠命令";
    const J = document.createElement("pre");
    J.className = "xb-assistant-content xb-assistant-approval-command", J.textContent = C.kind === "generate-skill" ? [
      C.title ? `标题：${C.title}` : "",
      C.reason ? `原因：${C.reason}` : "",
      C.sourceSummary ? `过程摘要：${C.sourceSummary}` : ""
    ].filter(Boolean).join(`

`) : C.command || "";
    const D = document.createElement("div");
    if (D.className = "xb-assistant-approval-note", D.textContent = C.kind === "generate-skill" ? C.status === "approved" ? "已同意，接下来会生成 skill 草稿并继续保存流程。" : C.status === "declined" ? "已拒绝，本次不会生成 skill。" : C.status === "cancelled" ? "本轮请求已终止，这次 skill 沉淀未继续。" : "这会把刚完成的过程沉淀成可复用 skill；点“是”后才会进入生成。" : C.status === "approved" ? "已同意，命令已进入执行流程。" : C.status === "declined" ? "已拒绝，本次不会执行这条命令。" : C.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "这条命令会直接作用于你当前打开的真实酒馆实例；点“是”后才会真正执行。", R.append(Y, J, D), C.status === "pending") {
      const B = document.createElement("div");
      B.className = "xb-assistant-approval-actions";
      const z = document.createElement("button");
      z.type = "button", z.className = "xb-assistant-approval-button", z.dataset.approvalId = C.id, z.dataset.approvalDecision = "approve", z.textContent = C.kind === "generate-skill" ? "是，生成" : "是，执行";
      const fe = document.createElement("button");
      fe.type = "button", fe.className = "xb-assistant-approval-button secondary", fe.dataset.approvalId = C.id, fe.dataset.approvalDecision = "decline", fe.textContent = "否，跳过", B.append(z, fe), R.appendChild(B);
    }
    return R;
  }
  function E(C) {
    const R = document.createElement("div");
    R.className = `xb-assistant-bubble role-${C.role}`;
    const Y = String(C.content || "").trim(), J = C.role === "assistant" && Array.isArray(C.toolCalls) && C.toolCalls.length > 0;
    J && !Y && R.classList.add("is-tool-call");
    const D = document.createElement("div");
    if (D.className = "xb-assistant-meta", D.textContent = C.role === "user" ? "你" : C.role === "assistant" ? Array.isArray(C.toolCalls) && C.toolCalls.length ? `小白助手 · 已发起 ${C.toolCalls.length} 个工具调用` : `小白助手${C.streaming ? " · 正在生成" : ""}${Array.isArray(C.thoughts) && C.thoughts.length ? ` · 含 ${C.thoughts.length} 段思考` : ""}` : `工具结果${C.toolName ? ` · ${C.toolName}` : ""}`, C.role === "tool") {
      const ie = r(C), he = document.createElement("pre");
      if (he.className = "xb-assistant-content tool-summary", he.textContent = ie.summary || "工具已返回结果。", R.append(D, he), ie.details) {
        const _e = document.createElement("details");
        _e.className = "xb-assistant-tool-details";
        const Re = document.createElement("summary");
        Re.textContent = C.toolName === n.READ ? "展开文件内容" : "展开详细结果";
        const ze = document.createElement("pre");
        ze.className = "xb-assistant-content tool-detail", ze.textContent = ie.details, _e.append(Re, ze), R.appendChild(_e);
      }
      return R;
    }
    const B = document.createElement("div");
    B.className = "xb-assistant-content xb-assistant-markdown";
    const z = C.role === "assistant" && !J ? C.streaming ? "思考中…" : "我先查一下相关代码。" : "", fe = Y || String(z || "").trim();
    if (R.appendChild(D), fe && (B.appendChild(g(f(fe))), R.appendChild(B)), Array.isArray(C.attachments) && C.attachments.length) {
      const ie = document.createElement("div");
      ie.className = "xb-assistant-attachment-gallery", s(ie, C.attachments, { compact: !0 }), R.appendChild(ie);
    }
    if (C.role === "assistant" && Array.isArray(C.thoughts) && C.thoughts.length) {
      const ie = document.createElement("details");
      ie.className = "xb-assistant-thought-details";
      const he = document.createElement("summary");
      he.textContent = C.thoughts.length > 1 ? `展开思考块（${C.thoughts.length} 段）` : "展开思考块", ie.appendChild(he), C.thoughts.forEach((_e) => {
        const Re = document.createElement("div");
        Re.className = "xb-assistant-thought-block";
        const ze = document.createElement("div");
        ze.className = "xb-assistant-thought-label", ze.textContent = _e.label;
        const un = document.createElement("pre");
        un.className = "xb-assistant-content xb-assistant-thought-content", un.textContent = _e.text, Re.append(ze, un), ie.appendChild(Re);
      }), R.appendChild(ie);
    }
    return R;
  }
  function T(C) {
    if (!t.messages.length) {
      C.innerHTML = "";
      const R = document.createElement("div");
      R.className = "xb-assistant-empty", R.innerHTML = "<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住；同时我会在 98k 上下文附近自动总结，尽量保持长期记忆。</p><p>今天有什么我可以帮你的吗？</p>", C.appendChild(R);
      return;
    }
    C.innerHTML = "";
    for (let R = 0; R < t.messages.length; R += 1) {
      const Y = t.messages[R];
      if (v(Y)) {
        const D = [];
        let B = R + 1;
        for (; B < t.messages.length && t.messages[B]?.role === "tool"; )
          D.push(t.messages[B]), B += 1;
        const z = _(Y, D, R);
        z.dataset.renderSignature = y(Y), C.appendChild(z), R = B - 1;
        continue;
      }
      const J = E(Y);
      J.dataset.renderSignature = y(Y), C.appendChild(J);
    }
    t.autoScroll && (C.scrollTop = C.scrollHeight);
  }
  function S(C) {
    if (!C) return;
    C.innerHTML = "";
    const R = w(t.pendingApproval);
    R && C.appendChild(R);
  }
  function N(C) {
    if (!C) return;
    const R = () => {
      C.scrollTop = C.scrollHeight;
    };
    R(), requestAnimationFrame(() => {
      R(), requestAnimationFrame(R);
    });
  }
  function A(C) {
    C && C.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  function k(C) {
    const R = C.querySelector("#xb-assistant-chat"), Y = C.querySelector("#xb-assistant-scroll-top"), J = C.querySelector("#xb-assistant-scroll-bottom");
    if (!R || !Y || !J) return;
    const D = R.scrollTop, B = R.scrollHeight, z = R.clientHeight, fe = 80;
    Y.classList.toggle("visible", D > fe), J.classList.toggle("visible", B - D - z > fe);
  }
  function L(C) {
    C.querySelector("#xb-assistant-scroll-helpers")?.classList.add("active");
  }
  function G(C) {
    C.querySelector("#xb-assistant-scroll-helpers")?.classList.remove("active");
  }
  function Z(C) {
    c && clearTimeout(c), c = setTimeout(() => {
      G(C), c = null;
    }, 1500);
  }
  function K(C) {
    u || (u = !0, requestAnimationFrame(() => {
      k(C), L(C), Z(C), u = !1;
    }));
  }
  return {
    renderMessages: T,
    renderApprovalPanel: S,
    scrollChatToBottom: N,
    scrollChatToTop: A,
    updateChatScrollButtonsVisibility: k,
    handleAssistantChatScroll: K
  };
}
var pP = [
  "项目结构提示：",
  "你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。",
  "你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。",
  "你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。",
  "如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问小白X插件功能使用问题，也优先读取结构目录后再精准查找对应文件：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问 STscript、斜杠命令语法或脚本语言行为，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 。",
  "如果用户问 SillyTavern 前端 API、页面脚本接口、前端扩展调用方式或如何写插件，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。"
].join(`
`), Oy = [
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
  "- 可执行斜杠命令工具（RunSlashCommand）；**该工具作用于用户当前真实酒馆实例，可以查询实时状态（如当前 API、模型、角色等）**。",
  "- 可读写身份设定（user/files/LittleWhiteBox_Assistant_Identity.md）；需要调整你的长期身份、习惯、语气或工作方式时，可直接读取或写入这份文件。",
  "- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，用它保存长期排查结论、你的经验教训、经常的犯错、和用户指定要你记住的事情。",
  "- 可读取技能目录（user/files/LittleWhiteBox_Assistant_Skills.json）和按需读取某个 skill 正文；默认只看技能目录摘要，不要把所有 skill 正文一次性读进上下文。",
  "- 可新建、更新、删除 skill；其中生成新 skill 时必须先征得用户同意，再调用 GenerateSkill 写入技能文件和 Skills.json。",
  "- 不能访问后端、数据库、未索引文件。",
  "",
  "**重要区分 - 静态快照 vs 动态实例**：",
  "- LS/Glob/Grep/Read 工具读取的是**静态代码快照**（构建时索引），用于查看源码实现、配置逻辑、模块结构。",
  "- RunSlashCommand 工具查询的是**动态运行实例**（用户当前打开的酒馆），用于获取实时状态、设置值、角色数据。",
  "- 先判断问题属于动态实例还是静态代码：动态实例优先用 RunSlashCommand；静态代码优先先看结构，做好成本控制，别乱跑乱试。优先使用 Grep，而不是对同一问题反复多次 Read；如果不确定就先用 LS 了解结构，再精准读取。",
  '- 当用户问"我的 API 是什么""我当前用的什么模型"这类实时状态时，用 RunSlashCommand；当用户问"API 设置的代码在哪""这个功能入口在哪"这类源码问题时，先结合 project-structure.md 或 LS/Glob/Grep 缩小范围，再尽量一次性读取足够的连续内容，避免太细碎的多次分段读取。若证据还不够，就继续查到足以支撑结论为止。',
  "- 索引快照可能不包含用户最新修改的代码或配置文件；如需确认用户当前实例的实际状态，必须用 RunSlashCommand。",
  "",
  pP,
  "",
  ...Xx,
  "",
  "回答要求：",
  "- 具体、可核对，热情主动，必要时引用文件路径。",
  "- 工具调用要讲效率：避免“试探性”工具调用；能先低成本定位就不要直接反复精读，但也不要因为省调用而影响准确性。",
  "- 使用 skill 时，先看目录，再按需读取具体 skill；不要为了“保险”把所有 skill 全读一遍。",
  "- 只有在完成长流程创作、经过多次试错才得到稳定方案、或用户明确要求沉淀经验时，才建议生成 skill；一次性小问答、小修补、小报错不要生成 skill。",
  "- 更新或删除已有 skill 只在用户明确要求时执行；不要因为你觉得“更好”就擅自覆盖、禁用或删除技能。",
  "- 使用 RunSlashCommand 查询真实实例状态时，可以直接执行查询类命令。",
  "- 如果 RunSlashCommand 可能创建、修改、删除、发送消息、切换状态或重载页面，必须先明确告诉用户准备执行的命令和预期结果，并在用户同意后再执行。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), mP = "[历史摘要]", gP = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`), yP = "xb-assistant-app", Gy = "xb-assistant-root", qy = 18e4, vP = 64, Yu = 128e3, _P = 98e3, bP = 2, wP = 1, ps = 3, SP = 4 * 1024 * 1024, EP = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], TP = 2600, AP = 1800, CP = 4200, xP = 3e3, IP = 1800, RP = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], Vy = [
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
], PP = [
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
], U = {
  config: null,
  configDraft: null,
  runtime: null,
  pendingApproval: null,
  messages: [],
  historySummary: "",
  archivedTurnCount: 0,
  contextStats: {
    usedTokens: 0,
    budgetTokens: Yu,
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
}, Gl = /* @__PURE__ */ new Map(), Hy = /* @__PURE__ */ new Map(), vo = null, Ur = null, tn = null, Cn = null;
function Ni(e, t = {}) {
  parent.postMessage({
    source: yP,
    type: e,
    payload: t
  }, window.location.origin);
}
function Os(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function Ky(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
var Gs = null;
function Oo() {
  return Gs?.persistSession();
}
function MP() {
  return Gs?.clearSession();
}
function NP() {
  return Gs?.restoreSession();
}
function kP() {
  if (Ur !== null) return Ur;
  try {
    Ur = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    Ur = {};
  }
  return Ur;
}
function DP() {
  return ["mobile", "tablet"].includes(kP()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function LP(e, t) {
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
function $P(e) {
  return Vy.some((t) => t.value === e) ? e : "medium";
}
function Xu(e) {
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
function jt(e) {
  if (U.toast = String(e || "").trim(), vo && clearTimeout(vo), !U.toast) {
    Ae();
    return;
  }
  const t = Math.max(AP, Math.min(CP, TP + U.toast.length * 18));
  vo = setTimeout(() => {
    vo = null, U.toast = "", Ae();
  }, t), Ae();
}
function UP() {
  tn && (clearTimeout(tn), tn = null), Cn && (clearTimeout(Cn), Cn = null);
}
function Wy(e = IP) {
  Cn && clearTimeout(Cn), Cn = setTimeout(() => {
    Cn = null, U.configSave = {
      status: "idle",
      requestId: "",
      error: ""
    }, Ae();
  }, e);
}
function FP(e) {
  UP(), U.configSave = {
    status: "saving",
    requestId: e,
    error: ""
  }, tn = setTimeout(() => {
    tn = null, !(U.configSave.requestId !== e || U.configSave.status !== "saving") && (U.configSave = {
      status: "error",
      requestId: e,
      error: "保存超时，请重试"
    }, Ae(), Wy());
  }, xP), Ae();
}
function xh(e, { ok: t, error: n = "" } = {}) {
  e && U.configSave.requestId && U.configSave.requestId !== e || (tn && (clearTimeout(tn), tn = null), U.configSave = {
    status: t ? "success" : "error",
    requestId: e || U.configSave.requestId || "",
    error: t ? "" : String(n || "保存失败")
  }, Ae(), Wy());
}
function Jy() {
  U.configFormSyncPending = !0;
}
function Qu(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function BP(e) {
  return PP.find((t) => t.value === e)?.label || e;
}
function OP(e) {
  return U.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function GP(e, t) {
  U.pullStateByProvider = {
    ...U.pullStateByProvider,
    [e]: t
  };
}
function qP(e, t) {
  U.modelOptionsByProvider = {
    ...U.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function VP(e) {
  return Array.isArray(U.modelOptionsByProvider[e]) ? U.modelOptionsByProvider[e] : [];
}
var { normalizeAttachments: qs, buildTextWithAttachmentSummary: HP, buildUserContentParts: KP, appendDraftImageFiles: Ih, renderAttachmentGallery: zy } = tP({
  state: U,
  showToast: jt,
  render: Ae,
  acceptedImageMimeTypes: EP,
  maxImageAttachments: ps,
  maxImageFileBytes: SP
});
function Zu(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : Qu(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
var { getActiveProviderConfig: Yy, syncConfigToForm: WP, bindSettingsPanelEvents: JP } = fP({
  state: U,
  post: Ni,
  render: Ae,
  showToast: jt,
  beginConfigSave: FP,
  requestConfigFormSync: Jy,
  createRequestId: Os,
  describeError: Zu,
  getPullState: OP,
  setPullState: GP,
  setProviderModels: qP,
  getProviderModels: VP,
  getProviderLabel: BP,
  normalizeReasoningEffort: $P,
  normalizeAssistantConfig: cy,
  normalizePresetName: fi,
  buildDefaultPreset: Cu,
  cloneDefaultModelConfigs: Au,
  defaultPresetName: uy,
  requestTimeoutMs: qy,
  toolModeOptions: RP,
  reasoningEffortOptions: Vy
}), { renderMessages: zP, renderApprovalPanel: YP, scrollChatToBottom: Xy, scrollChatToTop: XP, updateChatScrollButtonsVisibility: Qy, handleAssistantChatScroll: QP } = hP({
  state: U,
  toolNames: ye,
  formatToolResultDisplay: ay,
  normalizeThoughtBlocks: Xu,
  normalizeAttachments: qs,
  renderAttachmentGallery: zy
});
function ZP() {
  const e = Yy();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new lb(e);
    case "anthropic":
      return new lw(e);
    case "google":
      return new Yx(e);
    default:
      return new Q_(e);
  }
}
function jP() {
  const e = String(U.runtime?.identityContent || "").trim();
  return [
    Oy,
    String(U.runtime?.skillsPromptSummary || "").trim(),
    e
  ].filter(Boolean).join(`

`);
}
var { resetCompactionState: eM, buildContextMeterLabel: tM, updateContextStats: nM, pushMessage: Pa, cancelActiveRun: rM, toProviderMessages: iM, getActiveContextMessages: Zy, runAssistantLoop: oM } = nI({
  state: U,
  pendingToolCalls: Gl,
  pendingApprovals: Hy,
  persistSession: Oo,
  render: Ae,
  showToast: jt,
  post: Ni,
  createRequestId: Os,
  safeJsonParse: Ky,
  describeError: Zu,
  formatToolResultDisplay: ay,
  buildTextWithAttachmentSummary: HP,
  buildUserContentParts: KP,
  normalizeAttachments: qs,
  normalizeThoughtBlocks: Xu,
  normalizeSlashCommand: xu,
  normalizeSlashSkillTrigger: cI,
  shouldRequireSlashCommandApproval: pI,
  buildSlashApprovalResult: LP,
  isAbortError: Qu,
  createAdapter: ZP,
  getActiveProviderConfig: Yy,
  getSystemPrompt: jP,
  SYSTEM_PROMPT: Oy,
  SUMMARY_SYSTEM_PROMPT: gP,
  HISTORY_SUMMARY_PREFIX: mP,
  MAX_CONTEXT_TOKENS: Yu,
  SUMMARY_TRIGGER_TOKENS: _P,
  DEFAULT_PRESERVED_TURNS: bP,
  MIN_PRESERVED_TURNS: wP,
  MAX_TOOL_ROUNDS: vP,
  REQUEST_TIMEOUT_MS: qy,
  TOOL_DEFINITIONS: Qx,
  TOOL_NAMES: ye
});
Gs = eP({
  state: U,
  safeJsonParse: Ky,
  createRequestId: Os,
  normalizeAttachments: qs,
  normalizeThoughtBlocks: Xu,
  getActiveContextMessages: Zy
});
function Ma(e) {
  U.config = cy(e || {}), U.configDraft = null, Jy(), Ae();
}
function sM(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((r) => {
    n.appendChild(document.importNode(r, !0));
  }), n;
}
function aM(e) {
  const t = `
        <div class="xb-assistant-shell ${U.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${U.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${U.sidebarCollapsed ? "false" : "true"}" aria-label="${U.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${U.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${U.sidebarCollapsed ? "hidden" : ""}>
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
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" ${U.sidebarCollapsed ? "hidden" : ""}></div>
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
  e.replaceChildren(sM(t));
}
function jy() {
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
        #${Gy} { width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; }
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
        .xb-assistant-meta { margin-bottom: 6px; font-size: 12px; opacity: 0.78; }
        .xb-assistant-bubble.is-tool-call .xb-assistant-meta { margin-bottom: 0; }
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
function Ae() {
  const e = document.getElementById(Gy);
  if (!e) return;
  e.firstChild || (aM(e), lM(e)), U.configFormSyncPending && (WP(e), U.configFormSyncPending = !1), nM(iM(Zy()));
  const t = e.querySelector("#xb-assistant-chat"), n = e.querySelector("#xb-assistant-approval-slot");
  zP(t), YP(n), U.autoScroll && Xy(t), Qy(e);
  const r = e.querySelector("#xb-assistant-send");
  r.disabled = !1, r.classList.toggle("is-busy", U.isBusy), r.textContent = U.isBusy ? "终止" : "发送";
  const i = e.querySelector("#xb-assistant-add-image");
  i.disabled = U.isBusy || U.draftAttachments.length >= ps, i.textContent = U.draftAttachments.length ? `发图（${U.draftAttachments.length}/${ps}）` : "发图";
  const o = e.querySelector("#xb-assistant-clear");
  o.disabled = U.isBusy || !U.messages.length, o.textContent = window.matchMedia("(max-width: 900px)").matches ? "清空" : "清空对话";
  const s = e.querySelector("#xb-assistant-delete-preset");
  s.disabled = U.isBusy || (U.config?.presetNames || []).length <= 1;
  const u = e.querySelector("#xb-assistant-save"), c = U.configSave.status;
  u.classList.add("xb-assistant-save-button"), u.classList.toggle("is-saving", c === "saving"), u.classList.toggle("is-success", c === "success"), u.classList.toggle("is-error", c === "error"), u.disabled = U.isBusy || c === "saving", c === "saving" ? (u.innerHTML = '<span class="xb-assistant-save-spinner" aria-hidden="true"></span>保存中...', u.title = "正在保存配置") : c === "success" ? (u.textContent = "已保存", u.title = "配置已保存") : c === "error" ? (u.textContent = "保存失败", u.title = U.configSave.error || "保存失败") : (u.textContent = "保存配置", u.title = "保存配置");
  const d = e.querySelector("#xb-assistant-pull-models");
  d.disabled = U.isBusy;
  const h = e.querySelector("#xb-assistant-status");
  h.textContent = U.progressLabel || "就绪", h.classList.toggle("busy", U.isBusy);
  const f = e.querySelector("#xb-assistant-context-meter");
  f.textContent = tM(), f.classList.toggle("summary-active", !!U.contextStats.summaryActive);
  const p = `${Math.round(Yu / 1e3)}k`;
  f.title = U.contextStats.summaryActive ? `当前实际送模上下文 / ${p}（已压缩较早历史）` : `当前实际送模上下文 / ${p}`;
  const m = e.querySelector("#xb-assistant-toast");
  m.textContent = U.toast || "", m.classList.toggle("visible", !!U.toast);
  const g = e.querySelector(".xb-assistant-shell"), y = e.querySelector(".xb-assistant-sidebar"), v = e.querySelector("#xb-assistant-sidebar-toggle"), b = e.querySelector(".xb-assistant-sidebar-content"), _ = e.querySelector("#xb-assistant-mobile-settings"), w = e.querySelector("#xb-assistant-mobile-close"), E = e.querySelector("#xb-assistant-mobile-backdrop"), T = window.matchMedia("(max-width: 900px)").matches;
  if (g?.classList.toggle("sidebar-collapsed", !!U.sidebarCollapsed), y?.classList.toggle("is-collapsed", !!U.sidebarCollapsed), b?.toggleAttribute("hidden", !!U.sidebarCollapsed), E?.toggleAttribute("hidden", !T || !!U.sidebarCollapsed), _?.toggleAttribute("hidden", !T), w?.toggleAttribute("hidden", !T), v) {
    v.setAttribute("aria-expanded", U.sidebarCollapsed ? "false" : "true"), v.setAttribute("aria-label", U.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), v.title = U.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const N = v.querySelector(".xb-assistant-sidebar-toggle-text"), A = v.querySelector(".xb-assistant-sidebar-toggle-icon");
    N && (N.textContent = T ? U.sidebarCollapsed ? "展开设置" : "收起设置" : ""), A && (A.textContent = T ? U.sidebarCollapsed ? "▼" : "▲" : U.sidebarCollapsed ? "⚙" : "‹");
  }
  _ && (_.textContent = U.sidebarCollapsed ? "设置" : "关闭设置", _.setAttribute("aria-expanded", U.sidebarCollapsed ? "false" : "true"), _.title = U.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), w && (w.textContent = "关闭", w.title = "关闭小白助手"), zy(e.querySelector("#xb-assistant-draft-gallery"), U.draftAttachments, { onRemove: (N) => {
    U.draftAttachments = U.draftAttachments.filter((A, k) => k !== N), Ae();
  } });
  const S = e.querySelector("#xb-assistant-toggle-key");
  S.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function lM(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), r = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 60), 200)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    U.sidebarCollapsed = !U.sidebarCollapsed, Oo(), Ae();
  }), e.querySelector("#xb-assistant-mobile-settings")?.addEventListener("click", () => {
    U.sidebarCollapsed = !U.sidebarCollapsed, Oo(), Ae();
  }), e.querySelector("#xb-assistant-mobile-close")?.addEventListener("click", () => {
    Ni("xb-assistant:close");
  }), e.querySelector("#xb-assistant-mobile-backdrop")?.addEventListener("click", () => {
    U.sidebarCollapsed || (U.sidebarCollapsed = !0, Oo(), Ae());
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (o) => {
    const s = o.currentTarget;
    U.autoScroll = s.scrollHeight - s.scrollTop - s.clientHeight <= 48, QP(e);
  });
  const i = (o) => {
    const s = o.target.closest("[data-approval-id][data-approval-decision]");
    if (!s) return;
    const u = s.dataset.approvalId || "", c = s.dataset.approvalDecision || "", d = Hy.get(u);
    d && (c === "approve" ? d.resolve(!0) : d.resolve(!1), Ae());
  };
  e.querySelector("#xb-assistant-chat").addEventListener("click", i), e.querySelector("#xb-assistant-approval-slot")?.addEventListener("click", i), JP(e), e.querySelector("#xb-assistant-clear").addEventListener("click", async () => {
    U.isBusy || (U.messages = [], U.draftAttachments = [], U.historySummary = "", U.archivedTurnCount = 0, U.pendingApproval = null, eM(), await MP(), jt("对话已清空"), Ae());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    U.isBusy || U.draftAttachments.length >= ps || n.click();
  }), e.querySelector("#xb-assistant-scroll-top").addEventListener("click", () => {
    U.autoScroll = !1, XP(e.querySelector("#xb-assistant-chat"));
  }), e.querySelector("#xb-assistant-scroll-bottom").addEventListener("click", () => {
    U.autoScroll = !0, Xy(e.querySelector("#xb-assistant-chat")), Qy(e);
  }), n.addEventListener("change", async (o) => {
    const s = Array.from(o.currentTarget.files || []);
    if (s.length)
      try {
        await Ih(s);
      } finally {
        o.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (o) => {
    if (U.isBusy) return;
    const s = Array.from(o.clipboardData?.items || []);
    if (!s.length) return;
    const u = s.filter((c) => c.kind === "file" && String(c.type || "").startsWith("image/")).map((c) => c.getAsFile()).filter(Boolean);
    u.length && (o.preventDefault(), await Ih(u));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (o) => {
    if (o.preventDefault(), U.isBusy) {
      rM("本轮请求已终止。");
      return;
    }
    const s = t.value.trim(), u = qs(U.draftAttachments);
    if (!s && !u.length) return;
    Pa({
      role: "user",
      content: s,
      attachments: u
    }), t.value = "", U.draftAttachments = [], r(), Ae();
    const c = {
      id: Os("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: "",
      lightBrakeMessage: "",
      lastLightBrakeKey: "",
      toolErrorStreakKey: "",
      toolErrorStreakCount: 0
    };
    U.activeRun = c, U.isBusy = !0, U.currentRound = 0, U.progressLabel = "生成中", U.autoScroll = !0, Ae();
    try {
      await oM(c);
    } catch (d) {
      Qu(d) ? c.cancelNotice && Pa({
        role: "assistant",
        content: c.cancelNotice
      }) : Pa({
        role: "assistant",
        content: Zu(d)
      });
    } finally {
      U.activeRun?.id === c.id && (U.activeRun = null), U.isBusy = !1, U.currentRound = 0, U.progressLabel = "", Ae();
    }
  }), t.addEventListener("input", r), t.addEventListener("keydown", (o) => {
    const s = !DP();
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
    U.runtime = t.payload?.runtime || null, Ma(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Ma(t.payload?.config || {}), xh(t.payload?.requestId || "", { ok: !0 }), jt("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:identity-updated") {
    U.runtime = {
      ...U.runtime || {},
      identityContent: String(t.payload?.identityContent || "").trim()
    }, jt("身份设定已更新");
    return;
  }
  if (t.type === "xb-assistant:skills-updated") {
    U.runtime = {
      ...U.runtime || {},
      skillsCatalog: t.payload?.skillsCatalog || {
        version: 1,
        skills: []
      },
      skillsPromptSummary: String(t.payload?.skillsPromptSummary || ""),
      skillsCatalogError: String(t.payload?.skillsCatalogError || "")
    }, jt("技能目录已刷新");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Ma(t.payload?.config || {}), xh(t.payload?.requestId || "", {
      ok: !1,
      error: t.payload?.error || "网络异常"
    }), jt(`保存失败：${t.payload?.error || "网络异常"}`);
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
async function uM() {
  await NP(), jy(), Ae(), Ni("xb-assistant:ready");
}
uM().catch((e) => {
  console.error("[Assistant] 启动失败:", e), jy(), Ae(), Ni("xb-assistant:ready");
});
