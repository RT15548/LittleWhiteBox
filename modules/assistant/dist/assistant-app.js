var Uh = Object.create, Ec = Object.defineProperty, Fh = Object.getOwnPropertyDescriptor, Bh = Object.getOwnPropertyNames, Gh = Object.getPrototypeOf, Oh = Object.prototype.hasOwnProperty, Ss = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), qh = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var s = Bh(t), i = 0, a = s.length, u; i < a; i++)
      u = s[i], !Oh.call(e, u) && u !== n && Ec(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Fh(t, u)) || o.enumerable
      });
  return e;
}, Vh = (e, t, n) => (n = e != null ? Uh(Gh(e)) : {}, qh(t || !e || !e.__esModule ? Ec(n, "default", {
  value: e,
  enumerable: !0
}) : n, e));
function Y(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function w(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Tc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Tc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Ti(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var wi = (e) => {
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
}, W = class extends Error {
}, Te = class bi extends W {
  constructor(t, n, o, s) {
    super(`${bi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Es({
      message: o,
      cause: wi(n)
    });
    const i = n?.error;
    return t === 400 ? new wc(t, i, o, s) : t === 401 ? new bc(t, i, o, s) : t === 403 ? new Ac(t, i, o, s) : t === 404 ? new Cc(t, i, o, s) : t === 409 ? new Ic(t, i, o, s) : t === 422 ? new xc(t, i, o, s) : t === 429 ? new Rc(t, i, o, s) : t >= 500 ? new Pc(t, i, o, s) : new bi(t, i, o, s);
  }
}, Oe = class extends Te {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Es = class extends Te {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, gr = class extends Es {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, wc = class extends Te {
}, bc = class extends Te {
}, Ac = class extends Te {
}, Cc = class extends Te {
}, Ic = class extends Te {
}, xc = class extends Te {
}, Rc = class extends Te {
}, Pc = class extends Te {
}, Mc = class extends W {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Nc = class extends W {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Rn = class extends Error {
  constructor(e) {
    super(e);
  }
}, kc = class extends Te {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", s;
    if (t && typeof t == "object") {
      const i = t;
      s = i.error;
      const a = i.error_description;
      a && typeof a == "string" ? o = a : s && (o = s);
    }
    super(e, t, o, n), this.error_code = s;
  }
}, Hh = class extends W {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Jh = /^[a-z][a-z0-9+.-]*:/i, Wh = (e) => Jh.test(e), Pe = (e) => (Pe = Array.isArray, Pe(e)), va = Pe;
function Lc(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Sa(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Kh(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ws(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var zh = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new W(`${e} must be an integer`);
  if (t < 0) throw new W(`${e} must be a positive integer`);
  return t;
}, Yh = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, to = (e) => new Promise((t) => setTimeout(t, e)), Ot = "6.34.0", Xh = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Qh() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Zh = () => {
  const e = Qh();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ot,
    "X-Stainless-OS": Ta(Deno.build.os),
    "X-Stainless-Arch": Ea(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ot,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ot,
    "X-Stainless-OS": Ta(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ea(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = jh();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ot,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ot,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function jh() {
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
var Ea = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ta = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), wa, em = () => wa ?? (wa = Zh());
function Dc() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function $c(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Uc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return $c({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Fc(e) {
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
async function ba(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var tm = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Bc = "RFC3986", Gc = (e) => String(e), Aa = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Gc
};
var Ai = (e, t) => (Ai = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ai(e, t)), Qe = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ks = 1024, nm = (e, t, n, o, s) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += Ks) {
    const c = i.length >= Ks ? i.slice(u, u + Ks) : i, d = [];
    for (let p = 0; p < c.length; ++p) {
      let f = c.charCodeAt(p);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(p);
        continue;
      }
      if (f < 128) {
        d[d.length] = Qe[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Qe[192 | f >> 6] + Qe[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Qe[224 | f >> 12] + Qe[128 | f >> 6 & 63] + Qe[128 | f & 63];
        continue;
      }
      p += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(p) & 1023), d[d.length] = Qe[240 | f >> 18] + Qe[128 | f >> 12 & 63] + Qe[128 | f >> 6 & 63] + Qe[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function om(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Ca(e, t) {
  if (Pe(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Oc = {
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
}, qc = function(e, t) {
  Array.prototype.push.apply(e, Pe(t) ? t : [t]);
}, Ia, pe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: nm,
  encodeValuesOnly: !1,
  format: Bc,
  formatter: Gc,
  indices: !1,
  serializeDate(e) {
    return (Ia ?? (Ia = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function sm(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var zs = {};
function Vc(e, t, n, o, s, i, a, u, c, d, p, f, h, m, g, y, _, S) {
  let T = e, C = S, R = 0, L = !1;
  for (; (C = C.get(zs)) !== void 0 && !L; ) {
    const q = C.get(e);
    if (R += 1, typeof q < "u") {
      if (q === R) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof C.get(zs) > "u" && (R = 0);
  }
  if (typeof d == "function" ? T = d(t, T) : T instanceof Date ? T = h?.(T) : n === "comma" && Pe(T) && (T = Ca(T, function(q) {
    return q instanceof Date ? h?.(q) : q;
  })), T === null) {
    if (i) return c && !y ? c(t, pe.encoder, _, "key", m) : t;
    T = "";
  }
  if (sm(T) || om(T)) {
    if (c) {
      const q = y ? t : c(t, pe.encoder, _, "key", m);
      return [g?.(q) + "=" + g?.(c(T, pe.encoder, _, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(T))];
  }
  const b = [];
  if (typeof T > "u") return b;
  let v;
  if (n === "comma" && Pe(T))
    y && c && (T = Ca(T, c)), v = [{ value: T.length > 0 ? T.join(",") || null : void 0 }];
  else if (Pe(d)) v = d;
  else {
    const q = Object.keys(T);
    v = p ? q.sort(p) : q;
  }
  const A = u ? String(t).replace(/\./g, "%2E") : String(t), P = o && Pe(T) && T.length === 1 ? A + "[]" : A;
  if (s && Pe(T) && T.length === 0) return P + "[]";
  for (let q = 0; q < v.length; ++q) {
    const V = v[q], k = typeof V == "object" && typeof V.value < "u" ? V.value : T[V];
    if (a && k === null) continue;
    const D = f && u ? V.replace(/\./g, "%2E") : V, U = Pe(T) ? typeof n == "function" ? n(P, D) : P : P + (f ? "." + D : "[" + D + "]");
    S.set(e, R);
    const z = /* @__PURE__ */ new WeakMap();
    z.set(zs, S), qc(b, Vc(k, U, n, o, s, i, a, u, n === "comma" && y && Pe(T) ? null : c, d, p, f, h, m, g, y, _, z));
  }
  return b;
}
function im(e = pe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || pe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Bc;
  if (typeof e.format < "u") {
    if (!Ai(Aa, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Aa[n];
  let s = pe.filter;
  (typeof e.filter == "function" || Pe(e.filter)) && (s = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Oc ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = pe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : pe.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : pe.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : pe.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : pe.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? pe.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : pe.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : pe.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : pe.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : pe.encodeValuesOnly,
    filter: s,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : pe.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : pe.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : pe.strictNullHandling
  };
}
function rm(e, t = {}) {
  let n = e;
  const o = im(t);
  let s, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : Pe(o.filter) && (i = o.filter, s = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Oc[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  s || (s = Object.keys(n)), o.sort && s.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let h = 0; h < s.length; ++h) {
    const m = s[h];
    o.skipNulls && n[m] === null || qc(a, Vc(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const p = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), p.length > 0 ? f + p : "";
}
function am(e) {
  return rm(e, { arrayFormat: "brackets" });
}
function lm(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var xa;
function yr(e) {
  let t;
  return (xa ?? (t = new globalThis.TextEncoder(), xa = t.encode.bind(t)))(e);
}
var Ra;
function Pa(e) {
  let t;
  return (Ra ?? (t = new globalThis.TextDecoder(), Ra = t.decode.bind(t)))(e);
}
var ke, Le, Ts = class {
  constructor() {
    ke.set(this, void 0), Le.set(this, void 0), Y(this, ke, new Uint8Array(), "f"), Y(this, Le, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? yr(e) : e;
    Y(this, ke, lm([w(this, ke, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = um(w(this, ke, "f"), w(this, Le, "f"))) != null; ) {
      if (o.carriage && w(this, Le, "f") == null) {
        Y(this, Le, o.index, "f");
        continue;
      }
      if (w(this, Le, "f") != null && (o.index !== w(this, Le, "f") + 1 || o.carriage)) {
        n.push(Pa(w(this, ke, "f").subarray(0, w(this, Le, "f") - 1))), Y(this, ke, w(this, ke, "f").subarray(w(this, Le, "f")), "f"), Y(this, Le, null, "f");
        continue;
      }
      const s = w(this, Le, "f") !== null ? o.preceding - 1 : o.preceding, i = Pa(w(this, ke, "f").subarray(0, s));
      n.push(i), Y(this, ke, w(this, ke, "f").subarray(o.index), "f"), Y(this, Le, null, "f");
    }
    return n;
  }
  flush() {
    return w(this, ke, "f").length ? this.decode(`
`) : [];
  }
};
ke = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap();
Ts.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ts.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function um(e, t) {
  for (let s = t ?? 0; s < e.length; s++) {
    if (e[s] === 10) return {
      preceding: s,
      index: s + 1,
      carriage: !1
    };
    if (e[s] === 13) return {
      preceding: s,
      index: s + 1,
      carriage: !0
    };
  }
  return null;
}
function cm(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var os = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ma = (e, t, n) => {
  if (e) {
    if (Kh(os, e)) return e;
    ve(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(os))}`);
  }
};
function Pn() {
}
function po(e, t, n) {
  return !t || os[e] > os[n] ? Pn : t[e].bind(t);
}
var dm = {
  error: Pn,
  warn: Pn,
  info: Pn,
  debug: Pn
}, Na = /* @__PURE__ */ new WeakMap();
function ve(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return dm;
  const o = Na.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: po("error", t, n),
    warn: po("warn", t, n),
    info: po("info", t, n),
    debug: po("debug", t, n)
  };
  return Na.set(t, [n, s]), s;
}
var At = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), un, Yn = class Mn {
  constructor(t, n, o) {
    this.iterator = t, un.set(this, void 0), this.controller = n, Y(this, un, o, "f");
  }
  static fromSSEResponse(t, n, o, s) {
    let i = !1;
    const a = o ? ve(o) : console;
    async function* u() {
      if (i) throw new W("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of fm(t, n))
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
                throw a.error("Could not parse message into JSON:", d.data), a.error("From chunk:", d.raw), f;
              }
              if (p && p.error) throw new Te(void 0, p.error, void 0, t.headers);
              yield s ? {
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
              if (d.event == "error") throw new Te(void 0, p.error, p.message, void 0);
              yield {
                event: d.event,
                data: p
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Ti(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Mn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new Ts(), c = Fc(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new W("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Ti(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Mn(a, n, o);
  }
  [(un = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Mn(() => s(t), this.controller, w(this, un, "f")), new Mn(() => s(n), this.controller, w(this, un, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return $c({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = yr(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* fm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new W("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new W("Attempted to iterate over a response with no body");
  const n = new hm(), o = new Ts(), s = Fc(e.body);
  for await (const i of pm(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* pm(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? yr(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = cm(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var hm = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = mm(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function mm(e, t) {
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
async function Hc(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ve(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Yn.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Jc(await n.json(), n) : await n.text();
  })();
  return ve(e).debug(`[${o}] response parsed`, At({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Jc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Nn, Wc = class Kc extends Promise {
  constructor(t, n, o = Hc) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, Nn.set(this, void 0), Y(this, Nn, t, "f");
  }
  _thenUnwrap(t) {
    return new Kc(w(this, Nn, "f"), this.responsePromise, async (n, o) => Jc(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(w(this, Nn, "f"), t))), this.parsedPromise;
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
Nn = /* @__PURE__ */ new WeakMap();
var ho, _r = class {
  constructor(e, t, n, o) {
    ho.set(this, void 0), Y(this, ho, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new W("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await w(this, ho, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(ho = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, gm = class extends Wc {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Hc(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, ws = class extends _r {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, ue = class extends _r {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1;
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
        ...Lc(this.options.query),
        after: t
      }
    } : null;
  }
}, Xn = class extends _r {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
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
        ...Lc(this.options.query),
        after: e
      }
    } : null;
  }
}, ym = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, _m = "urn:ietf:params:oauth:grant-type:token-exchange", vm = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Dc();
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
        grant_type: _m,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: ym[this.config.provider.tokenType],
        identity_provider_id: this.config.identityProviderId,
        service_account_id: this.config.serviceAccountId
      })
    });
    if (!t.ok) {
      const i = await t.text();
      let a;
      try {
        a = JSON.parse(i);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new kc(t.status, a, t.headers) : Te.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), o = n.expires_in || 3600, s = Date.now() + o * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: s
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
}, zc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Hn(e, t, n) {
  return zc(), new File(e, t ?? "unknown_file", n);
}
function Oo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var vr = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", bs = async (e, t) => Ci(e.body) ? {
  ...e,
  body: await Yc(e.body, t)
} : e, je = async (e, t) => ({
  ...e,
  body: await Yc(e.body, t)
}), ka = /* @__PURE__ */ new WeakMap();
function Sm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ka.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return ka.set(t, o), o;
}
var Yc = async (e, t) => {
  if (!await Sm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => Ii(n, o, s))), n;
}, Xc = (e) => e instanceof Blob && "name" in e, Em = (e) => typeof e == "object" && e !== null && (e instanceof Response || vr(e) || Xc(e)), Ci = (e) => {
  if (Em(e)) return !0;
  if (Array.isArray(e)) return e.some(Ci);
  if (e && typeof e == "object") {
    for (const t in e) if (Ci(e[t])) return !0;
  }
  return !1;
}, Ii = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Hn([await n.blob()], Oo(n)));
    else if (vr(n)) e.append(t, Hn([await new Response(Uc(n)).blob()], Oo(n)));
    else if (Xc(n)) e.append(t, n, Oo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Ii(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => Ii(e, `${t}[${o}]`, s)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Qc = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Tm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Qc(e), wm = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function bm(e, t, n) {
  if (zc(), e = await e, Tm(e))
    return e instanceof File ? e : Hn([await e.arrayBuffer()], e.name);
  if (wm(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Hn(await xi(s), t, n);
  }
  const o = await xi(e);
  if (t || (t = Oo(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Hn(o, t, n);
}
async function xi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Qc(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (vr(e)) for await (const n of e) t.push(...await xi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Am(e)}`);
  }
  return t;
}
function Am(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var J = class {
  constructor(e) {
    this._client = e;
  }
};
function Zc(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var La = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Cm = (e = Zc) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? La) ?? La)?.toString) && (g = m + "", i.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((p, f) => p.start - f.start), i.length > 0) {
    let p = 0;
    const f = i.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new W(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, N = /* @__PURE__ */ Cm(Zc), jc = class extends J {
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/chat/completions/${e}/messages`, ue, {
      query: t,
      ...n
    });
  }
};
function ss(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Sr(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function no(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Im(e, t) {
  return !t || !ed(t) ? {
    ...e,
    choices: e.choices.map((n) => (td(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Er(e, t);
}
function Er(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Mc();
    if (o.finish_reason === "content_filter") throw new Nc();
    return td(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((s) => Rm(t, s)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? xm(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function xm(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Rm(e, t) {
  const n = e.tools?.find((o) => ss(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: no(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Pm(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => ss(o) && o.function?.name === t.function.name);
  return ss(n) && (no(n) || n?.function.strict || !1);
}
function ed(e) {
  return Sr(e.response_format) ? !0 : e.tools?.some((t) => no(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function td(e) {
  for (const t of e || []) if (t.type !== "function") throw new W(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Mm(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new W(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new W(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var is = (e) => e?.role === "assistant", nd = (e) => e?.role === "tool", Ri, qo, Vo, kn, Ln, Ho, Dn, rt, $n, rs, as, qt, od, Tr = class {
  constructor() {
    Ri.add(this), this.controller = new AbortController(), qo.set(this, void 0), Vo.set(this, () => {
    }), kn.set(this, () => {
    }), Ln.set(this, void 0), Ho.set(this, () => {
    }), Dn.set(this, () => {
    }), rt.set(this, {}), $n.set(this, !1), rs.set(this, !1), as.set(this, !1), qt.set(this, !1), Y(this, qo, new Promise((e, t) => {
      Y(this, Vo, e, "f"), Y(this, kn, t, "f");
    }), "f"), Y(this, Ln, new Promise((e, t) => {
      Y(this, Ho, e, "f"), Y(this, Dn, t, "f");
    }), "f"), w(this, qo, "f").catch(() => {
    }), w(this, Ln, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, w(this, Ri, "m", od).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (w(this, Vo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return w(this, $n, "f");
  }
  get errored() {
    return w(this, rs, "f");
  }
  get aborted() {
    return w(this, as, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (w(this, rt, "f")[e] || (w(this, rt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = w(this, rt, "f")[e];
    if (!n) return this;
    const o = n.findIndex((s) => s.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (w(this, rt, "f")[e] || (w(this, rt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      Y(this, qt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    Y(this, qt, !0, "f"), await w(this, Ln, "f");
  }
  _emit(e, ...t) {
    if (w(this, $n, "f")) return;
    e === "end" && (Y(this, $n, !0, "f"), w(this, Ho, "f").call(this));
    const n = w(this, rt, "f")[e];
    if (n && (w(this, rt, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !w(this, qt, "f") && !n?.length && Promise.reject(o), w(this, kn, "f").call(this, o), w(this, Dn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !w(this, qt, "f") && !n?.length && Promise.reject(o), w(this, kn, "f").call(this, o), w(this, Dn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
qo = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), rs = /* @__PURE__ */ new WeakMap(), as = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakMap(), Ri = /* @__PURE__ */ new WeakSet(), od = function(t) {
  if (Y(this, rs, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Oe()), t instanceof Oe)
    return Y(this, as, !0, "f"), this._emit("abort", t);
  if (t instanceof W) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new W(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new W(String(t)));
};
function Nm(e) {
  return typeof e.parse == "function";
}
var be, Pi, ls, Mi, Ni, ki, sd, id, km = 10, rd = class extends Tr {
  constructor() {
    super(...arguments), be.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), nd(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (is(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new W("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), w(this, be, "m", Pi).call(this);
  }
  async finalMessage() {
    return await this.done(), w(this, be, "m", ls).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), w(this, be, "m", Mi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), w(this, be, "m", Ni).call(this);
  }
  async totalUsage() {
    return await this.done(), w(this, be, "m", ki).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = w(this, be, "m", ls).call(this);
    t && this._emit("finalMessage", t);
    const n = w(this, be, "m", Pi).call(this);
    n && this._emit("finalContent", n);
    const o = w(this, be, "m", Mi).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const s = w(this, be, "m", Ni).call(this);
    s != null && this._emit("finalFunctionToolCallResult", s), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", w(this, be, "m", ki).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, be, "m", sd).call(this, t);
    const s = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Er(s, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: s = "auto", stream: i, ...a } = t, u = typeof s != "string" && s.type === "function" && s?.function?.name, { maxChatCompletions: c = km } = n || {}, d = t.tools.map((h) => {
      if (no(h)) {
        if (!h.$callback) throw new W("Tool given to `.runTools()` that does not have an associated function");
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
        ...a,
        tool_choice: s,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new W("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const y = g.id, { name: _, arguments: S } = g.function, T = p[_];
        if (T) {
          if (u && u !== _) {
            const b = `Invalid tool_call: ${JSON.stringify(_)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: y,
              content: b
            });
            continue;
          }
        } else {
          const b = `Invalid tool_call: ${JSON.stringify(_)}. Available options are: ${Object.keys(p).map((v) => JSON.stringify(v)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: b
          });
          continue;
        }
        let C;
        try {
          C = Nm(T) ? await T.parse(S) : S;
        } catch (b) {
          const v = b instanceof Error ? b.message : String(b);
          this._addMessage({
            role: o,
            tool_call_id: y,
            content: v
          });
          continue;
        }
        const R = await T.function(C, this), L = w(this, be, "m", id).call(this, R);
        if (this._addMessage({
          role: o,
          tool_call_id: y,
          content: L
        }), u) return;
      }
    }
  }
};
be = /* @__PURE__ */ new WeakSet(), Pi = function() {
  return w(this, be, "m", ls).call(this).content ?? null;
}, ls = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (is(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new W("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Mi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (is(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, Ni = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (nd(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((s) => s.type === "function" && s.id === n.tool_call_id))) return n.content;
  }
}, ki = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, sd = function(t) {
  if (t.n != null && t.n > 1) throw new W("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, id = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Lm = class ad extends rd {
  static runTools(t, n, o) {
    const s = new ad(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), is(t) && t.content && this._emit("content", t.content);
  }
}, Dm = 1, ld = 2, ud = 4, cd = 8, $m = 16, Um = 32, Fm = 64, dd = 128, fd = 256, Bm = dd | fd, Gm = 496, Da = ld | 497, $a = ud | cd, ge = {
  STR: Dm,
  NUM: ld,
  ARR: ud,
  OBJ: cd,
  NULL: $m,
  BOOL: Um,
  NAN: Fm,
  INFINITY: dd,
  MINUS_INFINITY: fd,
  INF: Bm,
  SPECIAL: Gm,
  ATOM: Da,
  COLLECTION: $a,
  ALL: Da | $a
}, Om = class extends Error {
}, qm = class extends Error {
};
function Vm(e, t = ge.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return Hm(e.trim(), t);
}
var Hm = (e, t) => {
  const n = e.length;
  let o = 0;
  const s = (h) => {
    throw new Om(`${h} at position ${o}`);
  }, i = (h) => {
    throw new qm(`${h} at position ${o}`);
  }, a = () => (f(), o >= n && s("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ge.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ge.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ge.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ge.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ge.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ge.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : p()), u = () => {
    const h = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(h, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (ge.STR & t) try {
      return JSON.parse(e.substring(h, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(h, e.lastIndexOf("\\")) + '"');
    }
    s("Unterminated string literal");
  }, c = () => {
    o++, f();
    const h = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && ge.OBJ & t) return h;
        const m = u();
        f(), o++;
        try {
          const g = a();
          Object.defineProperty(h, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (ge.OBJ & t) return h;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (ge.OBJ & t) return h;
      s("Expected '}' at end of object");
    }
    return o++, h;
  }, d = () => {
    o++;
    const h = [];
    try {
      for (; e[o] !== "]"; )
        h.push(a()), f(), e[o] === "," && o++;
    } catch {
      if (ge.ARR & t) return h;
      s("Expected ']' at end of array");
    }
    return o++, h;
  }, p = () => {
    if (o === 0) {
      e === "-" && ge.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ge.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const h = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(ge.NUM & t) && s("Unterminated number literal");
    try {
      return JSON.parse(e.substring(h, o));
    } catch {
      e.substring(h, o) === "-" && ge.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(h, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
      }
    }
  }, f = () => {
    for (; o < n && ` 
\r	`.includes(e[o]); ) o++;
  };
  return a();
}, Ua = (e) => Vm(e, ge.ALL ^ ge.NUM), de, ot, Dt, ft, Ys, mo, Xs, Qs, Zs, go, js, Fa, pd = class Li extends rd {
  constructor(t) {
    super(), de.add(this), ot.set(this, void 0), Dt.set(this, void 0), ft.set(this, void 0), Y(this, ot, t, "f"), Y(this, Dt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return w(this, ft, "f");
  }
  static fromReadableStream(t) {
    const n = new Li(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const s = new Li(n);
    return s._run(() => s._runChatCompletion(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createChatCompletion(t, n, o) {
    super._createChatCompletion;
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), w(this, de, "m", Ys).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) w(this, de, "m", Xs).call(this, a);
    if (i.controller.signal?.aborted) throw new Oe();
    return this._addChatCompletion(w(this, de, "m", go).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, de, "m", Ys).call(this), this._connected();
    const s = Yn.fromReadableStream(t, this.controller);
    let i;
    for await (const a of s)
      i && i !== a.id && this._addChatCompletion(w(this, de, "m", go).call(this)), w(this, de, "m", Xs).call(this, a), i = a.id;
    if (s.controller.signal?.aborted) throw new Oe();
    return this._addChatCompletion(w(this, de, "m", go).call(this));
  }
  [(ot = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), de = /* @__PURE__ */ new WeakSet(), Ys = function() {
    this.ended || Y(this, ft, void 0, "f");
  }, mo = function(n) {
    let o = w(this, Dt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, w(this, Dt, "f")[n.index] = o, o);
  }, Xs = function(n) {
    if (this.ended) return;
    const o = w(this, de, "m", Fa).call(this, n);
    this._emit("chunk", n, o);
    for (const s of n.choices) {
      const i = o.choices[s.index];
      s.delta.content != null && i.message?.role === "assistant" && i.message?.content && (this._emit("content", s.delta.content, i.message.content), this._emit("content.delta", {
        delta: s.delta.content,
        snapshot: i.message.content,
        parsed: i.message.parsed
      })), s.delta.refusal != null && i.message?.role === "assistant" && i.message?.refusal && this._emit("refusal.delta", {
        delta: s.delta.refusal,
        snapshot: i.message.refusal
      }), s.logprobs?.content != null && i.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: s.logprobs?.content,
        snapshot: i.logprobs?.content ?? []
      }), s.logprobs?.refusal != null && i.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: s.logprobs?.refusal,
        snapshot: i.logprobs?.refusal ?? []
      });
      const a = w(this, de, "m", mo).call(this, i);
      i.finish_reason && (w(this, de, "m", Zs).call(this, i), a.current_tool_call_index != null && w(this, de, "m", Qs).call(this, i, a.current_tool_call_index));
      for (const u of s.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (w(this, de, "m", Zs).call(this, i), a.current_tool_call_index != null && w(this, de, "m", Qs).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
      for (const u of s.delta.tool_calls ?? []) {
        const c = i.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : (c?.type, void 0));
      }
    }
  }, Qs = function(n, o) {
    if (w(this, de, "m", mo).call(this, n).done_tool_calls.has(o)) return;
    const s = n.message.tool_calls?.[o];
    if (!s) throw new Error("no tool call snapshot");
    if (!s.type) throw new Error("tool call snapshot missing `type`");
    if (s.type === "function") {
      const i = w(this, ot, "f")?.tools?.find((a) => ss(a) && a.function.name === s.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: s.function.name,
        index: o,
        arguments: s.function.arguments,
        parsed_arguments: no(i) ? i.$parseRaw(s.function.arguments) : i?.function.strict ? JSON.parse(s.function.arguments) : null
      });
    } else s.type;
  }, Zs = function(n) {
    const o = w(this, de, "m", mo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const s = w(this, de, "m", js).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: s ? s.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, go = function() {
    if (this.ended) throw new W("stream has ended, this shouldn't happen");
    const n = w(this, ft, "f");
    if (!n) throw new W("request ended without sending any chunks");
    return Y(this, ft, void 0, "f"), Y(this, Dt, [], "f"), Jm(n, w(this, ot, "f"));
  }, js = function() {
    const n = w(this, ot, "f")?.response_format;
    return Sr(n) ? n : null;
  }, Fa = function(n) {
    var o, s, i, a;
    let u = w(this, ft, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = Y(this, ft, {
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
        const { content: b, refusal: v, ...A } = m;
        Object.assign(y.logprobs, A), b && ((o = y.logprobs).content ?? (o.content = []), y.logprobs.content.push(...b)), v && ((s = y.logprobs).refusal ?? (s.refusal = []), y.logprobs.refusal.push(...v));
      }
      if (f && (y.finish_reason = f, w(this, ot, "f") && ed(w(this, ot, "f")))) {
        if (f === "length") throw new Mc();
        if (f === "content_filter") throw new Nc();
      }
      if (Object.assign(y, g), !p) continue;
      const { content: _, refusal: S, function_call: T, role: C, tool_calls: R, ...L } = p;
      if (Object.assign(y.message, L), S && (y.message.refusal = (y.message.refusal || "") + S), C && (y.message.role = C), T && (y.message.function_call ? (T.name && (y.message.function_call.name = T.name), T.arguments && ((i = y.message.function_call).arguments ?? (i.arguments = ""), y.message.function_call.arguments += T.arguments)) : y.message.function_call = T), _ && (y.message.content = (y.message.content || "") + _, !y.message.refusal && w(this, de, "m", js).call(this) && (y.message.parsed = Ua(y.message.content))), R) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: b, id: v, type: A, function: P, ...q } of R) {
          const V = (a = y.message.tool_calls)[b] ?? (a[b] = {});
          Object.assign(V, q), v && (V.id = v), A && (V.type = A), P && (V.function ?? (V.function = {
            name: P.name ?? "",
            arguments: ""
          })), P?.name && (V.function.name = P.name), P?.arguments && (V.function.arguments += P.arguments, Pm(w(this, ot, "f"), V) && (V.function.parsed_arguments = Ua(V.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("chunk", (s) => {
      const i = n.shift();
      i ? i.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, i) => n.push({
        resolve: s,
        reject: i
      })).then((s) => s ? {
        value: s,
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
    return new Yn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function Jm(e, t) {
  const { id: n, choices: o, created: s, model: i, system_fingerprint: a, ...u } = e;
  return Im({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: p, logprobs: f, ...h }) => {
      if (!d) throw new W(`missing finish_reason for choice ${p}`);
      const { content: m = null, function_call: g, tool_calls: y, ..._ } = c, S = c.role;
      if (!S) throw new W(`missing role for choice ${p}`);
      if (g) {
        const { arguments: T, name: C } = g;
        if (T == null) throw new W(`missing function_call.arguments for choice ${p}`);
        if (!C) throw new W(`missing function_call.name for choice ${p}`);
        return {
          ...h,
          message: {
            content: m,
            function_call: {
              arguments: T,
              name: C
            },
            role: S,
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
          ..._,
          role: S,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: y.map((T, C) => {
            const { function: R, type: L, id: b, ...v } = T, { arguments: A, name: P, ...q } = R || {};
            if (b == null) throw new W(`missing choices[${p}].tool_calls[${C}].id
${yo(e)}`);
            if (L == null) throw new W(`missing choices[${p}].tool_calls[${C}].type
${yo(e)}`);
            if (P == null) throw new W(`missing choices[${p}].tool_calls[${C}].function.name
${yo(e)}`);
            if (A == null) throw new W(`missing choices[${p}].tool_calls[${C}].function.arguments
${yo(e)}`);
            return {
              ...v,
              id: b,
              type: L,
              function: {
                ...q,
                name: P,
                arguments: A
              }
            };
          })
        }
      } : {
        ...h,
        message: {
          ..._,
          content: m,
          role: S,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: p,
        logprobs: f
      };
    }),
    created: s,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function yo(e) {
  return JSON.stringify(e);
}
var Wm = class Di extends pd {
  static fromReadableStream(t) {
    const n = new Di(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const s = new Di(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, i)), s;
  }
}, wr = class extends J {
  constructor() {
    super(...arguments), this.messages = new jc(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(N`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", ue, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return Mm(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Er(n, e));
  }
  runTools(e, t) {
    return e.stream ? Wm.runTools(this._client, e, t) : Lm.runTools(this._client, e, t);
  }
  stream(e, t) {
    return pd.createChatCompletion(this._client, e, t);
  }
};
wr.Messages = jc;
var br = class extends J {
  constructor() {
    super(...arguments), this.completions = new wr(this._client);
  }
};
br.Completions = wr;
var hd = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Km(e) {
  if (!e) return;
  if (hd in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : va(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = va(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var H = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Km(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [hd]: !0,
    values: t,
    nulls: n
  };
}, md = class extends J {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: H([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, gd = class extends J {
  create(e, t) {
    return this._client.post("/audio/transcriptions", je({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, yd = class extends J {
  create(e, t) {
    return this._client.post("/audio/translations", je({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, oo = class extends J {
  constructor() {
    super(...arguments), this.transcriptions = new gd(this._client), this.translations = new yd(this._client), this.speech = new md(this._client);
  }
};
oo.Transcriptions = gd;
oo.Translations = yd;
oo.Speech = md;
var _d = class extends J {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", ue, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(N`/batches/${e}/cancel`, t);
  }
}, vd = class extends J {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/assistants/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(N`/assistants/${e}`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", ue, {
      query: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(N`/assistants/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Sd = class extends J {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ed = class extends J {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, As = class extends J {
  constructor() {
    super(...arguments), this.sessions = new Sd(this._client), this.transcriptionSessions = new Ed(this._client);
  }
};
As.Sessions = Sd;
As.TranscriptionSessions = Ed;
var Td = class extends J {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(N`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, wd = class extends J {
  retrieve(e, t) {
    return this._client.get(N`/chatkit/threads/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", Xn, {
      query: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(N`/chatkit/threads/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(N`/chatkit/threads/${e}/items`, Xn, {
      query: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Cs = class extends J {
  constructor() {
    super(...arguments), this.sessions = new Td(this._client), this.threads = new wd(this._client);
  }
};
Cs.Sessions = Td;
Cs.Threads = wd;
var bd = class extends J {
  create(e, t, n) {
    return this._client.post(N`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(N`/threads/${o}/messages/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(N`/threads/${o}/messages/${e}`, {
      body: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/threads/${e}/messages`, ue, {
      query: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(N`/threads/${o}/messages/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Ad = class extends J {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: s, ...i } = t;
    return this._client.get(N`/threads/${o}/runs/${s}/steps/${e}`, {
      query: i,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.getAPIList(N`/threads/${o}/runs/${e}/steps`, ue, {
      query: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, zm = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let s = 0; s < n; s++) o[s] = t.charCodeAt(s);
    return Array.from(new Float32Array(o.buffer));
  }
}, $t = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, Se, Pt, $i, Ze, Jo, He, Mt, Wt, Rt, us, Ue, Wo, Ko, Jn, Un, Fn, Ba, Ga, Oa, qa, Va, Ha, Ja, Wn = class extends Tr {
  constructor() {
    super(...arguments), Se.add(this), $i.set(this, []), Ze.set(this, {}), Jo.set(this, {}), He.set(this, void 0), Mt.set(this, void 0), Wt.set(this, void 0), Rt.set(this, void 0), us.set(this, void 0), Ue.set(this, void 0), Wo.set(this, void 0), Ko.set(this, void 0), Jn.set(this, void 0);
  }
  [($i = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), us = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (o) => {
      const s = t.shift();
      s ? s.resolve(o) : e.push(o);
    }), this.on("end", () => {
      n = !0;
      for (const o of t) o.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (o) => {
      n = !0;
      for (const s of t) s.reject(o);
      t.length = 0;
    }), this.on("error", (o) => {
      n = !0;
      for (const s of t) s.reject(o);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => t.push({
        resolve: o,
        reject: s
      })).then((o) => o ? {
        value: o,
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
    const t = new Pt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = Yn.fromReadableStream(e, this.controller);
    for await (const s of o) w(this, Se, "m", Un).call(this, s);
    if (o.controller.signal?.aborted) throw new Oe();
    return this._addRun(w(this, Se, "m", Fn).call(this));
  }
  toReadableStream() {
    return new Yn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const s = new Pt();
    return s._run(() => s._runToolAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createToolAssistantStream(e, t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.submitToolOutputs(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) w(this, Se, "m", Un).call(this, u);
    if (a.controller.signal?.aborted) throw new Oe();
    return this._addRun(w(this, Se, "m", Fn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Pt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const s = new Pt();
    return s._run(() => s._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  currentEvent() {
    return w(this, Wo, "f");
  }
  currentRun() {
    return w(this, Ko, "f");
  }
  currentMessageSnapshot() {
    return w(this, He, "f");
  }
  currentRunStepSnapshot() {
    return w(this, Jn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(w(this, Ze, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(w(this, Jo, "f"));
  }
  async finalRun() {
    if (await this.done(), !w(this, Mt, "f")) throw Error("Final run was not received.");
    return w(this, Mt, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const s = {
      ...t,
      stream: !0
    }, i = await e.createAndRun(s, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) w(this, Se, "m", Un).call(this, a);
    if (i.controller.signal?.aborted) throw new Oe();
    return this._addRun(w(this, Se, "m", Fn).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.create(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) w(this, Se, "m", Un).call(this, u);
    if (a.controller.signal?.aborted) throw new Oe();
    return this._addRun(w(this, Se, "m", Fn).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, o] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = o;
        continue;
      }
      let s = e[n];
      if (s == null) {
        e[n] = o;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = o;
        continue;
      }
      if (typeof s == "string" && typeof o == "string") s += o;
      else if (typeof s == "number" && typeof o == "number") s += o;
      else if (Ws(s) && Ws(o)) s = this.accumulateDelta(s, o);
      else if (Array.isArray(s) && Array.isArray(o)) {
        if (s.every((i) => typeof i == "string" || typeof i == "number")) {
          s.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Ws(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const a = i.index;
          if (a == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = s[a];
          u == null ? s.push(i) : s[a] = this.accumulateDelta(u, i);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${o}, accValue: ${s}`);
      e[n] = s;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, t, n) {
    return await this._createThreadAssistantStream(t, e, n);
  }
  async _runAssistantStream(e, t, n, o) {
    return await this._createAssistantStream(t, e, n, o);
  }
  async _runToolAssistantStream(e, t, n, o) {
    return await this._createToolAssistantStream(t, e, n, o);
  }
};
Pt = Wn, Un = function(t) {
  if (!this.ended)
    switch (Y(this, Wo, t, "f"), w(this, Se, "m", Oa).call(this, t), t.event) {
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
        w(this, Se, "m", Ja).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        w(this, Se, "m", Ga).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        w(this, Se, "m", Ba).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Fn = function() {
  if (this.ended) throw new W("stream has ended, this shouldn't happen");
  if (!w(this, Mt, "f")) throw Error("Final run has not been received");
  return w(this, Mt, "f");
}, Ba = function(t) {
  const [n, o] = w(this, Se, "m", Va).call(this, t, w(this, He, "f"));
  Y(this, He, n, "f"), w(this, Jo, "f")[n.id] = n;
  for (const s of o) {
    const i = n.content[s.index];
    i?.type == "text" && this._emit("textCreated", i.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const s of t.data.delta.content) {
        if (s.type == "text" && s.text) {
          let i = s.text, a = n.content[s.index];
          if (a && a.type == "text") this._emit("textDelta", i, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (s.index != w(this, Wt, "f")) {
          if (w(this, Rt, "f")) switch (w(this, Rt, "f").type) {
            case "text":
              this._emit("textDone", w(this, Rt, "f").text, w(this, He, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", w(this, Rt, "f").image_file, w(this, He, "f"));
              break;
          }
          Y(this, Wt, s.index, "f");
        }
        Y(this, Rt, n.content[s.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (w(this, Wt, "f") !== void 0) {
        const s = t.data.content[w(this, Wt, "f")];
        if (s) switch (s.type) {
          case "image_file":
            this._emit("imageFileDone", s.image_file, w(this, He, "f"));
            break;
          case "text":
            this._emit("textDone", s.text, w(this, He, "f"));
            break;
        }
      }
      w(this, He, "f") && this._emit("messageDone", t.data), Y(this, He, void 0, "f");
  }
}, Ga = function(t) {
  const n = w(this, Se, "m", qa).call(this, t);
  switch (Y(this, Jn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const s of o.step_details.tool_calls) s.index == w(this, us, "f") ? this._emit("toolCallDelta", s, n.step_details.tool_calls[s.index]) : (w(this, Ue, "f") && this._emit("toolCallDone", w(this, Ue, "f")), Y(this, us, s.index, "f"), Y(this, Ue, n.step_details.tool_calls[s.index], "f"), w(this, Ue, "f") && this._emit("toolCallCreated", w(this, Ue, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      Y(this, Jn, void 0, "f"), t.data.step_details.type == "tool_calls" && w(this, Ue, "f") && (this._emit("toolCallDone", w(this, Ue, "f")), Y(this, Ue, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Oa = function(t) {
  w(this, $i, "f").push(t), this._emit("event", t);
}, qa = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return w(this, Ze, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = w(this, Ze, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const s = Pt.accumulateDelta(n, o.delta);
        w(this, Ze, "f")[t.data.id] = s;
      }
      return w(this, Ze, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      w(this, Ze, "f")[t.data.id] = t.data;
      break;
  }
  if (w(this, Ze, "f")[t.data.id]) return w(this, Ze, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Va = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = t.data;
      if (s.delta.content) for (const i of s.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = w(this, Se, "m", Ha).call(this, i, a);
      } else
        n.content[i.index] = i, o.push(i);
      return [n, o];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, o];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Ha = function(t, n) {
  return Pt.accumulateDelta(n, t);
}, Ja = function(t) {
  switch (Y(this, Ko, t.data, "f"), t.event) {
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
      Y(this, Mt, t.data, "f"), w(this, Ue, "f") && (this._emit("toolCallDone", w(this, Ue, "f")), Y(this, Ue, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ar = class extends J {
  constructor() {
    super(...arguments), this.steps = new Ad(this._client);
  }
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(N`/threads/${e}/runs`, {
      query: { include: o },
      body: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(N`/threads/${o}/runs/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(N`/threads/${o}/runs/${e}`, {
      body: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/threads/${e}/runs`, ue, {
      query: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(N`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Wn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = H([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: s, response: i } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...o
        }
      }).withResponse();
      switch (s.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await to(a);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return s;
      }
    }
  }
  stream(e, t, n) {
    return Wn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(N`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Wn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ar.Steps = Ad;
var Is = class extends J {
  constructor() {
    super(...arguments), this.runs = new Ar(this._client), this.messages = new bd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/threads/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(N`/threads/${e}`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(N`/threads/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return Wn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Is.Runs = Ar;
Is.Messages = bd;
var jt = class extends J {
  constructor() {
    super(...arguments), this.realtime = new As(this._client), this.chatkit = new Cs(this._client), this.assistants = new vd(this._client), this.threads = new Is(this._client);
  }
};
jt.Realtime = As;
jt.ChatKit = Cs;
jt.Assistants = vd;
jt.Threads = Is;
var Cd = class extends J {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Id = class extends J {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(N`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: H([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Cr = class extends J {
  constructor() {
    super(...arguments), this.content = new Id(this._client);
  }
  create(e, t, n) {
    return this._client.post(N`/containers/${e}/files`, bs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(N`/containers/${o}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/containers/${e}/files`, ue, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(N`/containers/${o}/files/${e}`, {
      ...n,
      headers: H([{ Accept: "*/*" }, n?.headers])
    });
  }
};
Cr.Content = Id;
var Ir = class extends J {
  constructor() {
    super(...arguments), this.files = new Cr(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", ue, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/containers/${e}`, {
      ...t,
      headers: H([{ Accept: "*/*" }, t?.headers])
    });
  }
};
Ir.Files = Cr;
var xd = class extends J {
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(N`/conversations/${e}/items`, {
      query: { include: o },
      body: s,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...s } = t;
    return this._client.get(N`/conversations/${o}/items/${e}`, {
      query: s,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/conversations/${e}/items`, Xn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(N`/conversations/${o}/items/${e}`, n);
  }
}, xr = class extends J {
  constructor() {
    super(...arguments), this.items = new xd(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(N`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(N`/conversations/${e}`, t);
  }
};
xr.Items = xd;
var Rd = class extends J {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && ve(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const s = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? s : (ve(this._client).debug("embeddings/decoding base64 embeddings from base64"), s._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = zm(u);
    }), i)));
  }
}, Pd = class extends J {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: s } = t;
    return this._client.get(N`/evals/${o}/runs/${s}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...s } = t;
    return this._client.getAPIList(N`/evals/${o}/runs/${e}/output_items`, ue, {
      query: s,
      ...n
    });
  }
}, Rr = class extends J {
  constructor() {
    super(...arguments), this.outputItems = new Pd(this._client);
  }
  create(e, t, n) {
    return this._client.post(N`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(N`/evals/${o}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/evals/${e}/runs`, ue, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(N`/evals/${o}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(N`/evals/${o}/runs/${e}`, n);
  }
};
Rr.OutputItems = Pd;
var Pr = class extends J {
  constructor() {
    super(...arguments), this.runs = new Rr(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(N`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", ue, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/evals/${e}`, t);
  }
};
Pr.Runs = Rr;
var Md = class extends J {
  create(e, t) {
    return this._client.post("/files", je({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(N`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", ue, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(N`/files/${e}/content`, {
      ...t,
      headers: H([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), s = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !o.has(i.status); )
      if (await to(t), i = await this.retrieve(e), Date.now() - s > n) throw new gr({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Nd = class extends J {
}, kd = class extends J {
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
}, Mr = class extends J {
  constructor() {
    super(...arguments), this.graders = new kd(this._client);
  }
};
Mr.Graders = kd;
var Ld = class extends J {
  create(e, t, n) {
    return this._client.getAPIList(N`/fine_tuning/checkpoints/${e}/permissions`, ws, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(N`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/fine_tuning/checkpoints/${e}/permissions`, Xn, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(N`/fine_tuning/checkpoints/${o}/permissions/${e}`, n);
  }
}, Nr = class extends J {
  constructor() {
    super(...arguments), this.permissions = new Ld(this._client);
  }
};
Nr.Permissions = Ld;
var Dd = class extends J {
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/fine_tuning/jobs/${e}/checkpoints`, ue, {
      query: t,
      ...n
    });
  }
}, kr = class extends J {
  constructor() {
    super(...arguments), this.checkpoints = new Dd(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", ue, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(N`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(N`/fine_tuning/jobs/${e}/events`, ue, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(N`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(N`/fine_tuning/jobs/${e}/resume`, t);
  }
};
kr.Checkpoints = Dd;
var en = class extends J {
  constructor() {
    super(...arguments), this.methods = new Nd(this._client), this.jobs = new kr(this._client), this.checkpoints = new Nr(this._client), this.alpha = new Mr(this._client);
  }
};
en.Methods = Nd;
en.Jobs = kr;
en.Checkpoints = Nr;
en.Alpha = Mr;
var $d = class extends J {
}, Lr = class extends J {
  constructor() {
    super(...arguments), this.graderModels = new $d(this._client);
  }
};
Lr.GraderModels = $d;
var Ud = class extends J {
  createVariation(e, t) {
    return this._client.post("/images/variations", je({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", je({
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
}, Fd = class extends J {
  retrieve(e, t) {
    return this._client.get(N`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", ws, e);
  }
  delete(e, t) {
    return this._client.delete(N`/models/${e}`, t);
  }
}, Bd = class extends J {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, Gd = class extends J {
  accept(e, t, n) {
    return this._client.post(N`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: H([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(N`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: H([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(N`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: H([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(N`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: H([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Od = class extends J {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, xs = class extends J {
  constructor() {
    super(...arguments), this.clientSecrets = new Od(this._client), this.calls = new Gd(this._client);
  }
};
xs.ClientSecrets = Od;
xs.Calls = Gd;
function Ym(e, t) {
  return !t || !Qm(t) ? {
    ...e,
    output_parsed: null,
    output: e.output.map((n) => n.type === "function_call" ? {
      ...n,
      parsed_arguments: null
    } : n.type === "message" ? {
      ...n,
      content: n.content.map((o) => ({
        ...o,
        parsed: null
      }))
    } : n)
  } : qd(e, t);
}
function qd(e, t) {
  const n = e.output.map((s) => {
    if (s.type === "function_call") return {
      ...s,
      parsed_arguments: eg(t, s)
    };
    if (s.type === "message") {
      const i = s.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: Xm(t, a.text)
      } : a);
      return {
        ...s,
        content: i
      };
    }
    return s;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Ui(o), Object.defineProperty(o, "output_parsed", {
    enumerable: !0,
    get() {
      for (const s of o.output)
        if (s.type === "message") {
          for (const i of s.content) if (i.type === "output_text" && i.parsed !== null) return i.parsed;
        }
      return null;
    }
  }), o;
}
function Xm(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function Qm(e) {
  return !!Sr(e.text?.format);
}
function Zm(e) {
  return e?.$brand === "auto-parseable-tool";
}
function jm(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function eg(e, t) {
  const n = jm(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: Zm(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Ui(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Ut, _o, pt, vo, Wa, Ka, za, Ya, tg = class Vd extends Tr {
  constructor(t) {
    super(), Ut.add(this), _o.set(this, void 0), pt.set(this, void 0), vo.set(this, void 0), Y(this, _o, t, "f");
  }
  static createResponse(t, n, o) {
    const s = new Vd(n);
    return s._run(() => s._createOrRetrieveResponse(t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createOrRetrieveResponse(t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), w(this, Ut, "m", Wa).call(this);
    let i, a = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...o,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) w(this, Ut, "m", Ka).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Oe();
    return w(this, Ut, "m", za).call(this);
  }
  [(_o = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakSet(), Wa = function() {
    this.ended || Y(this, pt, void 0, "f");
  }, Ka = function(n, o) {
    if (this.ended) return;
    const s = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = w(this, Ut, "m", Ya).call(this, n);
    switch (s("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new W(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new W(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new W(`expected content to be 'output_text', got ${u.type}`);
          s("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new W(`missing output at index ${n.output_index}`);
        a.type === "function_call" && s("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        s(n.type, n);
        break;
    }
  }, za = function() {
    if (this.ended) throw new W("stream has ended, this shouldn't happen");
    const n = w(this, pt, "f");
    if (!n) throw new W("request ended without sending any events");
    Y(this, pt, void 0, "f");
    const o = ng(n, w(this, _o, "f"));
    return Y(this, vo, o, "f"), o;
  }, Ya = function(n) {
    let o = w(this, pt, "f");
    if (!o) {
      if (n.type !== "response.created") throw new W(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = Y(this, pt, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const s = o.output[n.output_index];
        if (!s) throw new W(`missing output at index ${n.output_index}`);
        const i = s.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? s.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (s.content || (s.content = []), s.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new W(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const i = s.content[n.content_index];
          if (!i) throw new W(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new W(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new W(`missing output at index ${n.output_index}`);
        s.type === "function_call" && (s.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new W(`missing output at index ${n.output_index}`);
        if (s.type === "reasoning") {
          const i = s.content?.[n.content_index];
          if (!i) throw new W(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new W(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        Y(this, pt, n.response, "f");
        break;
    }
    return o;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("event", (s) => {
      const i = n.shift();
      i ? i.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, i) => n.push({
        resolve: s,
        reject: i
      })).then((s) => s ? {
        value: s,
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
    const t = w(this, vo, "f");
    if (!t) throw new W("stream ended without producing a ChatCompletion");
    return t;
  }
};
function ng(e, t) {
  return Ym(e, t);
}
var Hd = class extends J {
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/responses/${e}/input_items`, ue, {
      query: t,
      ...n
    });
  }
}, Jd = class extends J {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, Rs = class extends J {
  constructor() {
    super(...arguments), this.inputItems = new Hd(this._client), this.inputTokens = new Jd(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Ui(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(N`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Ui(o), o));
  }
  delete(e, t) {
    return this._client.delete(N`/responses/${e}`, {
      ...t,
      headers: H([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => qd(n, e));
  }
  stream(e, t) {
    return tg.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(N`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
Rs.InputItems = Hd;
Rs.InputTokens = Jd;
var Wd = class extends J {
  retrieve(e, t) {
    return this._client.get(N`/skills/${e}/content`, {
      ...t,
      headers: H([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, Kd = class extends J {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(N`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: H([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, Dr = class extends J {
  constructor() {
    super(...arguments), this.content = new Kd(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(N`/skills/${e}/versions`, bs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(N`/skills/${o}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/skills/${e}/versions`, ue, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(N`/skills/${o}/versions/${e}`, n);
  }
};
Dr.Content = Kd;
var Ps = class extends J {
  constructor() {
    super(...arguments), this.content = new Wd(this._client), this.versions = new Dr(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", bs({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(N`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(N`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", ue, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/skills/${e}`, t);
  }
};
Ps.Content = Wd;
Ps.Versions = Dr;
var zd = class extends J {
  create(e, t, n) {
    return this._client.post(N`/uploads/${e}/parts`, je({
      body: t,
      ...n
    }, this._client));
  }
}, $r = class extends J {
  constructor() {
    super(...arguments), this.parts = new zd(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(N`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(N`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
$r.Parts = zd;
var og = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((s) => s.status === "rejected");
  if (n.length) {
    for (const s of n) console.error(s.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const s of t) s.status === "fulfilled" && o.push(s.value);
  return o;
}, Yd = class extends J {
  create(e, t, n) {
    return this._client.post(N`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(N`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(N`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.getAPIList(N`/vector_stores/${o}/file_batches/${e}/files`, ue, {
      query: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = H([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: s, response: i } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse();
      switch (s.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await to(a);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return s;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, o) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const s = o?.maxConcurrency ?? 5, i = Math.min(s, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(p) {
      for (let f of p) {
        const h = await a.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(h.id);
      }
    }
    return await og(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Xd = class extends J {
  create(e, t, n) {
    return this._client.post(N`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(N`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.post(N`/vector_stores/${o}/files/${e}`, {
      body: s,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(N`/vector_stores/${e}/files`, ue, {
      query: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(N`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = H([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const s = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse(), i = s.data;
      switch (i.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = s.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await to(a);
          break;
        case "failed":
        case "completed":
          return i;
      }
    }
  }
  async upload(e, t, n) {
    const o = await this._client.files.create({
      file: t,
      purpose: "assistants"
    }, n);
    return this.create(e, { file_id: o.id }, n);
  }
  async uploadAndPoll(e, t, n) {
    const o = await this.upload(e, t, n);
    return await this.poll(e, o.id, n);
  }
  content(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.getAPIList(N`/vector_stores/${o}/files/${e}/content`, ws, {
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, Ms = class extends J {
  constructor() {
    super(...arguments), this.files = new Xd(this._client), this.fileBatches = new Yd(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(N`/vector_stores/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(N`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", ue, {
      query: e,
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(N`/vector_stores/${e}`, {
      ...t,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(N`/vector_stores/${e}/search`, ws, {
      body: t,
      method: "post",
      ...n,
      headers: H([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
Ms.Files = Xd;
Ms.FileBatches = Yd;
var Qd = class extends J {
  create(e, t) {
    return this._client.post("/videos", je({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(N`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", Xn, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(N`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", je({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(N`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: H([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", je({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", je({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(N`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(N`/videos/${e}/remix`, bs({
      body: t,
      ...n
    }, this._client));
  }
}, Vt, Zd, zo, jd = class extends J {
  constructor() {
    super(...arguments), Vt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    w(this, Vt, "m", Zd).call(this, n);
    const s = H([t]).values, i = w(this, Vt, "m", zo).call(this, s, "webhook-signature"), a = w(this, Vt, "m", zo).call(this, s, "webhook-timestamp"), u = w(this, Vt, "m", zo).call(this, s, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Rn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Rn("Webhook timestamp is too old");
    if (c > d + o) throw new Rn("Webhook timestamp is too new");
    const p = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), h = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of p) try {
      const y = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, y, new TextEncoder().encode(h))) return;
    } catch {
      continue;
    }
    throw new Rn("The given webhook signature does not match the expected signature");
  }
};
Vt = /* @__PURE__ */ new WeakSet(), Zd = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, zo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Fi, Ur, Yo, ef, ei = "workload-identity-auth", ee = class {
  constructor({ baseURL: e = $t("OPENAI_BASE_URL"), apiKey: t = $t("OPENAI_API_KEY"), organization: n = $t("OPENAI_ORG_ID") ?? null, project: o = $t("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = $t("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: i, ...a } = {}) {
    if (Fi.add(this), Yo.set(this, void 0), this.completions = new Cd(this), this.chat = new br(this), this.embeddings = new Rd(this), this.files = new Md(this), this.images = new Ud(this), this.audio = new oo(this), this.moderations = new Bd(this), this.models = new Fd(this), this.fineTuning = new en(this), this.graders = new Lr(this), this.vectorStores = new Ms(this), this.webhooks = new jd(this), this.beta = new jt(this), this.batches = new _d(this), this.uploads = new $r(this), this.responses = new Rs(this), this.realtime = new xs(this), this.conversations = new xr(this), this.evals = new Pr(this), this.containers = new Ir(this), this.skills = new Ps(this), this.videos = new Qd(this), i) {
      if (t && t !== ei) throw new W("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = ei;
    } else if (t === void 0) throw new W("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: o,
      webhookSecret: s,
      workloadIdentity: i,
      ...a,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && Xh()) throw new W(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Ur.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = Ma(u.logLevel, "ClientOptions.logLevel", this) ?? Ma($t("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Dc(), Y(this, Yo, tm, "f"), this._options = u, i && (this._workloadIdentityAuth = new vm(i, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = s;
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
    return H([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return am(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ot}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Tc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Te.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof W ? n : new W(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new W(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !w(this, Fi, "m", ef).call(this) && n || this.baseURL, s = Wh(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!Sa(i) || !Sa(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new Wc(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (ve(this).debug(`[${c}] sending request`, At({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Oe();
    const f = new AbortController(), h = await this.fetchWithAuth(a, i, u, f).catch(wi), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Oe();
      const _ = Ti(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return ve(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), ve(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, At({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw ve(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), ve(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, At({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), h instanceof kc || h instanceof Hh ? h : _ ? new gr() : new Es({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, _]) => ", " + y + ": " + JSON.stringify(_)).join("")}] ${i.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      if (h.status === 401 && this._workloadIdentityAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await ba(h.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(h);
      if (t && y) {
        const R = `retrying, ${t} attempts remaining`;
        return await ba(h.body), ve(this).info(`${g} - ${R}`), ve(this).debug(`[${c}] response error (${R})`, At({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      ve(this).info(`${g} - ${_}`);
      const S = await h.text().catch((R) => wi(R).message), T = Yh(S), C = T ? void 0 : S;
      throw ve(this).debug(`[${c}] response error (${_})`, At({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: C,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, T, C, h.headers);
    }
    return ve(this).info(g), ve(this).debug(`[${c}] response start`, At({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((o) => ({
      method: "get",
      path: e,
      ...o
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new gm(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const s = t.headers, i = s.get("Authorization");
      if (!i || i === `Bearer ${ei}`) {
        const a = await this._workloadIdentityAuth.getToken();
        s.set("Authorization", `Bearer ${a}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: i, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, p = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (p.method = i.toUpperCase());
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
  async retryRequest(e, t, n, o) {
    let s;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (s = u);
    }
    const a = o?.get("retry-after");
    if (a && !s) {
      const u = parseFloat(a);
      Number.isNaN(u) ? s = Date.parse(a) - Date.now() : s = u * 1e3;
    }
    if (s === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await to(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && zh("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: p } = this.buildBody({ options: n });
    return p && (e.__metadata = {
      ...e.__metadata,
      hasStreamingBody: !0
    }), {
      req: {
        method: o,
        headers: await this.buildHeaders({
          options: e,
          method: o,
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
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = e.idempotencyKey);
    const i = H([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...em(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(i), i.values;
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
    const n = H([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, s = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !s
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Uc(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...w(this, Yo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Ur = ee, Yo = /* @__PURE__ */ new WeakMap(), Fi = /* @__PURE__ */ new WeakSet(), ef = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
ee.OpenAI = Ur;
ee.DEFAULT_TIMEOUT = 6e5;
ee.OpenAIError = W;
ee.APIError = Te;
ee.APIConnectionError = Es;
ee.APIConnectionTimeoutError = gr;
ee.APIUserAbortError = Oe;
ee.NotFoundError = Cc;
ee.ConflictError = Ic;
ee.RateLimitError = Rc;
ee.BadRequestError = wc;
ee.AuthenticationError = bc;
ee.InternalServerError = Pc;
ee.PermissionDeniedError = Ac;
ee.UnprocessableEntityError = xc;
ee.InvalidWebhookSignatureError = Rn;
ee.toFile = bm;
ee.Completions = Cd;
ee.Chat = br;
ee.Embeddings = Rd;
ee.Files = Md;
ee.Images = Ud;
ee.Audio = oo;
ee.Moderations = Bd;
ee.Models = Fd;
ee.FineTuning = en;
ee.Graders = Lr;
ee.VectorStores = Ms;
ee.Webhooks = jd;
ee.Beta = jt;
ee.Batches = _d;
ee.Uploads = $r;
ee.Responses = Rs;
ee.Realtime = xs;
ee.Conversations = xr;
ee.Evals = Pr;
ee.Containers = Ir;
ee.Skills = Ps;
ee.Videos = Qd;
function sg(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function ig(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Je(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function rg(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function ti(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Je(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Ct(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Je(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Ct(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Je(e, n, t.text), typeof t.content == "string" && Je(e, n, t.content), typeof t.reasoning_content == "string" && Je(e, n, t.reasoning_content), typeof t.thinking == "string" && Je(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Je(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Je(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function ag(e = {}, t = {}) {
  const n = [];
  return Ct(n, e.reasoning_content, "推理文本"), Ct(n, e.reasoning, "推理文本"), Ct(n, e.reasoning_text, "推理文本"), Ct(n, e.thinking, "思考块"), Ct(n, t.reasoning_content, "推理文本"), Ct(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Je(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Je(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Je(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function Xa(e = "") {
  const t = [/<<TOOL_CALL>>\s*([\s\S]*?)\s*<<\/TOOL_CALL>>/g, /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((s, i) => {
      try {
        const a = JSON.parse(s[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: typeof a.arguments == "string" ? a.arguments : JSON.stringify(a.arguments || {})
        });
      } catch {
        n.push({
          id: `tool-call-${i + 1}`,
          name: "",
          arguments: ""
        });
      }
    });
  }), n.filter((o) => o.name);
}
function Qa(e) {
  const t = (e.tools || []).map((n) => [`- ${n.function.name}: ${n.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(n.function.parameters || {})}`].join(`
`)).join(`
`);
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    "请严格输出如下边界标记包裹的 JSON，不要改写边界标记：",
    '<<TOOL_CALL>>{"name":"工具名","arguments":{...}}<</TOOL_CALL>>',
    "可以输出多段 <<TOOL_CALL>> ... <</TOOL_CALL>>。",
    "除非必须说明，否则不要在工具调用前后输出多余解释。",
    t ? `可用工具:
${t}` : ""
  ].filter(Boolean).join(`

`);
}
function lg(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const o of e.messages || []) {
    if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
      const s = o.tool_calls.map((i, a) => {
        const u = i.function?.name || "", c = i.id || `tool-call-${a + 1}`;
        return u && t.set(c, u), `<<TOOL_CALL>>${JSON.stringify({
          id: c,
          name: u,
          arguments: ig(i.function?.arguments || "{}")
        })}<</TOOL_CALL>>`;
      }).join(`
`);
      n.push({
        role: "assistant",
        content: [o.content || "", s].filter(Boolean).join(`

`)
      });
      continue;
    }
    if (o.role === "tool") {
      n.push({
        role: "user",
        content: [`工具 ${t.get(o.tool_call_id || "") || "unknown_tool"} 已返回结果。`, o.content || ""].filter(Boolean).join(`
`)
      });
      continue;
    }
    n.push({
      role: o.role,
      content: o.content
    });
  }
  return !n.length || n[0].role !== "system" ? n.unshift({
    role: "system",
    content: Qa(e)
  }) : n[0] = {
    ...n[0],
    content: Qa({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function ug(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var cg = class {
  constructor(e) {
    this.config = e, this.client = new ee({
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
      messages: t ? lg(e) : e.messages,
      tools: t ? void 0 : e.tools,
      tool_choice: t ? void 0 : e.toolChoice || "auto",
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    if (!e.reasoning?.enabled && typeof e.temperature == "number" && (n.temperature = e.temperature), e.reasoning?.enabled && (n.reasoning_effort = e.reasoning.effort, n.reasoning = {
      effort: e.reasoning.effort,
      summary: "detailed"
    }, n.thinking = {
      type: "enabled",
      budget_tokens: e.reasoning.effort === "high" ? 4096 : e.reasoning.effort === "medium" ? 2048 : 1024,
      display: "summarized"
    }), sg("[LittleWhiteBox Assistant] OpenAI-Compatible outgoing request", n), typeof e.onStreamProgress == "function") {
      const f = await this.client.chat.completions.create({
        ...n,
        stream: !0
      }, { signal: e.signal }), h = {
        content: "",
        toolCalls: []
      };
      let m = "stop", g = this.config.model;
      for await (const C of f) {
        g = C.model || g;
        const R = C.choices?.[0], L = R?.delta || {};
        R?.finish_reason && (m = R.finish_reason), typeof L.content == "string" && (h.content += L.content), Array.isArray(L.tool_calls) && L.tool_calls.forEach((v) => {
          const A = Number(v.index ?? 0), P = h.toolCalls[A] || {
            id: "",
            type: "function",
            function: {
              name: "",
              arguments: ""
            }
          };
          h.toolCalls[A] = {
            ...P,
            id: v.id || P.id,
            type: v.type || P.type,
            function: {
              name: v.function?.name || P.function?.name || "",
              arguments: `${P.function?.arguments || ""}${v.function?.arguments || ""}`
            }
          };
        });
        const b = ti(h.content);
        ug(e, {
          text: h.toolCalls.filter((v) => v?.function?.name).length ? b.cleaned : b.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
          thoughts: b.thoughts
        });
      }
      const y = h.toolCalls.map((C) => ({
        id: C.id || `openai-tool-${Date.now()}`,
        name: C.function?.name || "",
        arguments: C.function?.arguments || "{}"
      })).filter((C) => C.name), _ = ti(h.content), S = y.length ? [] : Xa(_.cleaned), T = [...y, ...S];
      return {
        text: y.length ? _.cleaned : _.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
        toolCalls: T,
        thoughts: _.thoughts,
        finishReason: m,
        model: g,
        provider: "openai-compatible"
      };
    }
    const o = await this.client.chat.completions.create(n, { signal: e.signal }), s = o.choices?.[0] || {}, i = s.message || {}, a = ag(i, s), u = (i.tool_calls || []).map((f) => ({
      id: f.id || `openai-tool-${Date.now()}`,
      name: f.function?.name || "",
      arguments: f.function?.arguments || "{}"
    })).filter((f) => f.name), c = ti(rg(i.content));
    c.thoughts.forEach((f) => a.push(f));
    const d = u.length ? [] : Xa(c.cleaned), p = [...u, ...d];
    return {
      text: u.length ? c.cleaned : c.cleaned.replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, "").replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "").trim(),
      toolCalls: p,
      thoughts: a,
      finishReason: s.finish_reason || "stop",
      model: o.model || this.config.model,
      provider: "openai-compatible"
    };
  }
};
function cn(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function tf(e, t) {
  return {
    type: "message",
    role: e,
    content: dg(t)
  };
}
function cs(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function dg(e) {
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
function ds(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Za(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        ds(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && ds(e, n.summary || "推理摘要", o.text);
    }
  });
}
function fg(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Za(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Za(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function pg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function hg(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "message" && Array.isArray(o.content)) {
        o.content.forEach((s) => {
          if (!(!s || typeof s != "object")) {
            if (s.type === "output_text" && typeof s.text == "string" && s.text.trim()) {
              n.push(s.text.trim());
              return;
            }
            s.type === "refusal" && typeof s.refusal == "string" && s.refusal.trim() && n.push(s.refusal.trim());
          }
        });
        return;
      }
      typeof o.text == "string" && o.text.trim() && n.push(o.text.trim());
    }
  }), n.join(`
`).trim();
}
function mg(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const s = n.toLowerCase();
  return !s.includes("proxy error") || !s.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function gg(e) {
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
        n.content?.trim() && t.push(cs(n.content)), n.tool_calls.forEach((o, s) => {
          t.push({
            type: "function_call",
            call_id: o.id || `function_call_${s + 1}`,
            name: o.function?.name || "",
            arguments: o.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(cs(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? tf(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function yg(e) {
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
      n.content?.trim() && t.push(cs(n.content)), n.tool_calls.forEach((o, s) => {
        t.push({
          type: "function_call",
          call_id: o.id || `function_call_${s + 1}`,
          name: o.function?.name || "",
          arguments: o.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(cs(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? tf(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function _g(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function vg(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function Sg(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ni(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [s = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(s) || Number(o) - Number(i);
}
var Eg = class {
  constructor(e) {
    this.config = e, this.client = new ee({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (c) => {
      const d = mg(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const p = Array.isArray(c.output) ? c.output : [];
      return {
        output: p,
        thoughts: fg(p),
        toolCalls: p.filter((f) => f.type === "function_call" && f.name).map((f, h) => ({
          id: f.call_id || `response-tool-${h + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: hg(c)
      };
    }, n = (c = !1) => {
      const d = {
        model: this.config.model,
        instructions: c ? void 0 : pg(e) || void 0,
        input: c ? yg(e) : gg(e),
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
    }, o = async (c = !1) => {
      const d = n(c);
      return cn(c ? "[LittleWhiteBox Assistant] OpenAI Responses outgoing request (legacy system-in-input fallback)" : "[LittleWhiteBox Assistant] OpenAI Responses outgoing request", d), await this.client.responses.create(d, { signal: e.signal });
    }, s = async (c = !1) => {
      const d = n(c);
      cn(c ? "[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request (legacy system-in-input fallback)" : "[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request", d);
      const p = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const y = [];
        Array.from(h.entries()).sort(([_], [S]) => ni(_, S)).forEach(([, _]) => ds(y, "推理文本", _)), Array.from(m.entries()).sort(([_], [S]) => ni(_, S)).forEach(([, _]) => ds(y, "推理摘要", _)), Sg(e, {
          text: Array.from(f.entries()).sort(([_], [S]) => ni(_, S)).map(([, _]) => _).join(`
`).trim(),
          thoughts: y
        });
      };
      return p.on("response.output_text.delta", (y) => {
        const _ = `${y.output_index}:${y.content_index}`;
        f.set(_, `${f.get(_) || ""}${y.delta}`), g();
      }), p.on("response.reasoning_text.delta", (y) => {
        const _ = `${y.output_index}:${y.content_index}`;
        h.set(_, `${h.get(_) || ""}${y.delta}`), g();
      }), p.on("response.reasoning_summary_text.delta", (y) => {
        const _ = `${y.output_index}:${y.summary_index}`;
        m.set(_, `${m.get(_) || ""}${y.delta}`), g();
      }), await p.finalResponse();
    }, i = !_g(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await s(!1) : await o(!1), u = t(a), !u.text && !u.toolCalls.length && cn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response", a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a), !u.text && !u.toolCalls.length && cn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback", a));
    } catch (c) {
      if (!i || !vg(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = t(a), !u.text && !u.toolCalls.length && cn("[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback", a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses"
    };
  }
};
function O(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function E(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var nf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return nf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Qn(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Bi = (e) => {
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
}, Q = class extends Error {
}, Fe = class Gi extends Q {
  constructor(t, n, o, s, i) {
    super(`${Gi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Ns({
      message: o,
      cause: Bi(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new sf(t, i, o, s, a) : t === 401 ? new rf(t, i, o, s, a) : t === 403 ? new af(t, i, o, s, a) : t === 404 ? new lf(t, i, o, s, a) : t === 409 ? new uf(t, i, o, s, a) : t === 422 ? new cf(t, i, o, s, a) : t === 429 ? new df(t, i, o, s, a) : t >= 500 ? new ff(t, i, o, s, a) : new Gi(t, i, o, s, a);
  }
}, Ke = class extends Fe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ns = class extends Fe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, of = class extends Ns {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, sf = class extends Fe {
}, rf = class extends Fe {
}, af = class extends Fe {
}, lf = class extends Fe {
}, uf = class extends Fe {
}, cf = class extends Fe {
}, df = class extends Fe {
}, ff = class extends Fe {
}, Tg = /^[a-z][a-z0-9+.-]*:/i, wg = (e) => Tg.test(e), Oi = (e) => (Oi = Array.isArray, Oi(e)), ja = Oi;
function qi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function el(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function bg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Ag = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Q(`${e} must be an integer`);
  if (t < 0) throw new Q(`${e} must be a positive integer`);
  return t;
}, pf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Cg = (e) => new Promise((t) => setTimeout(t, e)), Ht = "0.89.0", Ig = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function xg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Rg = () => {
  const e = xg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": nl(Deno.build.os),
    "X-Stainless-Arch": tl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": nl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": tl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Pg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Pg() {
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
var tl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", nl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ol, Mg = () => ol ?? (ol = Rg());
function Ng() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function hf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function mf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return hf({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Fr(e) {
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
async function kg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Lg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Dg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Q(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function $g(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var sl;
function Br(e) {
  let t;
  return (sl ?? (t = new globalThis.TextEncoder(), sl = t.encode.bind(t)))(e);
}
var il;
function rl(e) {
  let t;
  return (il ?? (t = new globalThis.TextDecoder(), il = t.decode.bind(t)))(e);
}
var De, $e, so = class {
  constructor() {
    De.set(this, void 0), $e.set(this, void 0), O(this, De, new Uint8Array(), "f"), O(this, $e, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Br(e) : e;
    O(this, De, $g([E(this, De, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Ug(E(this, De, "f"), E(this, $e, "f"))) != null; ) {
      if (o.carriage && E(this, $e, "f") == null) {
        O(this, $e, o.index, "f");
        continue;
      }
      if (E(this, $e, "f") != null && (o.index !== E(this, $e, "f") + 1 || o.carriage)) {
        n.push(rl(E(this, De, "f").subarray(0, E(this, $e, "f") - 1))), O(this, De, E(this, De, "f").subarray(E(this, $e, "f")), "f"), O(this, $e, null, "f");
        continue;
      }
      const s = E(this, $e, "f") !== null ? o.preceding - 1 : o.preceding, i = rl(E(this, De, "f").subarray(0, s));
      n.push(i), O(this, De, E(this, De, "f").subarray(o.index), "f"), O(this, $e, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, De, "f").length ? this.decode(`
`) : [];
  }
};
De = /* @__PURE__ */ new WeakMap(), $e = /* @__PURE__ */ new WeakMap();
so.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
so.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Ug(e, t) {
  for (let s = t ?? 0; s < e.length; s++) {
    if (e[s] === 10) return {
      preceding: s,
      index: s + 1,
      carriage: !1
    };
    if (e[s] === 13) return {
      preceding: s,
      index: s + 1,
      carriage: !0
    };
  }
  return null;
}
function Fg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var fs = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, al = (e, t, n) => {
  if (e) {
    if (bg(fs, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(fs))}`);
  }
};
function Bn() {
}
function So(e, t, n) {
  return !t || fs[e] > fs[n] ? Bn : t[e].bind(t);
}
var Bg = {
  error: Bn,
  warn: Bn,
  info: Bn,
  debug: Bn
}, ll = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Bg;
  const o = ll.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: So("error", t, n),
    warn: So("warn", t, n),
    info: So("info", t, n),
    debug: So("debug", t, n)
  };
  return ll.set(t, [n, s]), s;
}
var It = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), dn, Zn = class Gn {
  constructor(t, n, o) {
    this.iterator = t, dn.set(this, void 0), this.controller = n, O(this, dn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? Ae(o) : console;
    async function* a() {
      if (s) throw new Q("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of Gg(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw i.error("Could not parse message into JSON:", c.data), i.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw i.error("Could not parse message into JSON:", c.data), i.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = pf(c.data) ?? c.data, p = d?.error?.type;
            throw new Fe(void 0, d, void 0, t.headers, p);
          }
        }
        u = !0;
      } catch (c) {
        if (Qn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Gn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* i() {
      const u = new so(), c = Fr(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new Q("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Qn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Gn(a, n, o);
  }
  [(dn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Gn(() => s(t), this.controller, E(this, dn, "f")), new Gn(() => s(n), this.controller, E(this, dn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return hf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Br(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Gg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Q("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Q("Attempted to iterate over a response with no body");
  const n = new qg(), o = new so(), s = Fr(e.body);
  for await (const i of Og(s)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Og(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Br(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let i;
    for (; (i = Fg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var qg = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Vg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Vg(e, t) {
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
async function gf(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Zn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : yf(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${o}] response parsed`, It({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function yf(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var On, _f = class vf extends Promise {
  constructor(t, n, o = gf) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, On.set(this, void 0), O(this, On, t, "f");
  }
  _thenUnwrap(t) {
    return new vf(E(this, On, "f"), this.responsePromise, async (n, o) => yf(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, On, "f"), t))), this.parsedPromise;
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
On = /* @__PURE__ */ new WeakMap();
var Eo, Sf = class {
  constructor(e, t, n, o) {
    Eo.set(this, void 0), O(this, Eo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new Q("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, Eo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Eo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Hg = class extends _f {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await gf(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, io = class extends Sf {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.first_id = n.first_id || null, this.last_id = n.last_id || null;
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
          ...qi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...qi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, et = class extends Sf {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.next_page = n.next_page || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    const e = this.next_page;
    return e ? {
      ...this.options,
      query: {
        ...qi(this.options.query),
        page: e
      }
    } : null;
  }
}, Ef = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Yt(e, t, n) {
  return Ef(), new File(e, t ?? "unknown_file", n);
}
function Xo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Tf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gr = async (e, t, n = !0) => ({
  ...e,
  body: await Wg(e.body, t, n)
}), ul = /* @__PURE__ */ new WeakMap();
function Jg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ul.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new s(i).text();
    } catch {
      return !0;
    }
  })();
  return ul.set(t, o), o;
}
var Wg = async (e, t, n = !0) => {
  if (!await Jg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([s, i]) => Vi(o, s, i, n))), o;
}, Kg = (e) => e instanceof Blob && "name" in e, Vi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let s = {};
      const i = n.headers.get("Content-Type");
      i && (s = { type: i }), e.append(t, Yt([await n.blob()], Xo(n, o), s));
    } else if (Tf(n)) e.append(t, Yt([await new Response(mf(n)).blob()], Xo(n, o)));
    else if (Kg(n)) e.append(t, Yt([n], Xo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((s) => Vi(e, t + "[]", s, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([s, i]) => Vi(e, `${t}[${s}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, wf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", zg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && wf(e), Yg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Xg(e, t, n) {
  if (Ef(), e = await e, t || (t = Xo(e, !0)), zg(e))
    return e instanceof File && t == null && n == null ? e : Yt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Yg(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Yt(await Hi(s), t, n);
  }
  const o = await Hi(e);
  if (!n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return Yt(o, t, n);
}
async function Hi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (wf(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Tf(e)) for await (const n of e) t.push(...await Hi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Qg(e)}`);
  }
  return t;
}
function Qg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var he = class {
  constructor(e) {
    this._client = e;
  }
}, bf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Zg(e) {
  if (!e) return;
  if (bf in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ja(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = ja(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var G = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of Zg(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [bf]: !0,
    values: t,
    nulls: n
  };
};
function Af(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var cl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), jg = (e = Af) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? cl) ?? cl)?.toString) && (g = m + "", i.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((p, f) => p.start - f.start), i.length > 0) {
    let p = 0;
    const f = i.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new Q(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, X = /* @__PURE__ */ jg(Af), Cf = class extends he {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/environments/${e}?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", et, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(X`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Kn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Qo(e) {
  return typeof e == "object" && e !== null && Kn in e;
}
function If(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) Qo(o) && n.add(o[Kn]);
  if (t) {
    for (const o of t)
      if (Qo(o) && n.add(o[Kn]), Array.isArray(o.content))
        for (const s of o.content) Qo(s) && n.add(s[Kn]);
  }
  return Array.from(n);
}
function xf(e, t) {
  const n = If(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function ey(e) {
  return Qo(e) ? { "x-stainless-helper": e[Kn] } : {};
}
var Rf = class extends he {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", io, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/files/${e}`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/files/${e}/content`, {
      ...n,
      headers: G([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/files/${e}`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", Gr({
      body: o,
      ...t,
      headers: G([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        ey(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Pf = class extends he {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/models/${e}?beta=true`, {
      ...n,
      headers: G([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", io, {
      query: o,
      ...t,
      headers: G([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Mf = class extends he {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(X`/v1/agents/${e}/versions?beta=true`, et, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Or = class extends he {
  constructor() {
    super(...arguments), this.versions = new Mf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.get(X`/v1/agents/${e}?beta=true`, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/agents/${e}?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", et, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(X`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Or.Versions = Mf;
var Nf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function kf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function dl(e, t, n) {
  const o = kf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => {
      if (s.type === "text") {
        const i = Object.defineProperty({ ...s }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(i, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return s;
    }),
    parsed_output: null
  } : Lf(e, t, n);
}
function Lf(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = ty(t, i.text);
      o === null && (o = a);
      const u = Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
        enumerable: !1
      });
      return Object.defineProperty(u, "parsed", {
        get() {
          return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), a;
        },
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: s,
    parsed_output: o
  };
}
function ty(e, t) {
  const n = kf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new Q(`Failed to parse structured output: ${o}`);
  }
}
var ny = (e) => {
  let t = 0, n = [];
  for (; t < e.length; ) {
    let o = e[t];
    if (o === "\\") {
      t++;
      continue;
    }
    if (o === "{") {
      n.push({
        type: "brace",
        value: "{"
      }), t++;
      continue;
    }
    if (o === "}") {
      n.push({
        type: "brace",
        value: "}"
      }), t++;
      continue;
    }
    if (o === "[") {
      n.push({
        type: "paren",
        value: "["
      }), t++;
      continue;
    }
    if (o === "]") {
      n.push({
        type: "paren",
        value: "]"
      }), t++;
      continue;
    }
    if (o === ":") {
      n.push({
        type: "separator",
        value: ":"
      }), t++;
      continue;
    }
    if (o === ",") {
      n.push({
        type: "delimiter",
        value: ","
      }), t++;
      continue;
    }
    if (o === '"') {
      let a = "", u = !1;
      for (o = e[++t]; o !== '"'; ) {
        if (t === e.length) {
          u = !0;
          break;
        }
        if (o === "\\") {
          if (t++, t === e.length) {
            u = !0;
            break;
          }
          a += o + e[t], o = e[++t];
        } else
          a += o, o = e[++t];
      }
      o = e[++t], u || n.push({
        type: "string",
        value: a
      });
      continue;
    }
    if (o && /\s/.test(o)) {
      t++;
      continue;
    }
    let s = /[0-9]/;
    if (o && s.test(o) || o === "-" || o === ".") {
      let a = "";
      for (o === "-" && (a += o, o = e[++t]); o && s.test(o) || o === "."; )
        a += o, o = e[++t];
      n.push({
        type: "number",
        value: a
      });
      continue;
    }
    let i = /[a-z]/i;
    if (o && i.test(o)) {
      let a = "";
      for (; o && i.test(o) && t !== e.length; )
        a += o, o = e[++t];
      if (a == "true" || a == "false" || a === "null") n.push({
        type: "name",
        value: a
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
}, Jt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Jt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Jt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Jt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Jt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Jt(e);
  }
  return e;
}, oy = (e) => {
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
}, sy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Df = (e) => JSON.parse(sy(oy(Jt(ny(e))))), Be, ht, Ft, fn, To, pn, hn, wo, mn, st, gn, bo, Ao, Tt, Co, Io, yn, oi, fl, xo, si, ii, ri, pl, hl = "__json_buf";
function ml(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var iy = class Ji {
  constructor(t, n) {
    Be.add(this), this.messages = [], this.receivedMessages = [], ht.set(this, void 0), Ft.set(this, null), this.controller = new AbortController(), fn.set(this, void 0), To.set(this, () => {
    }), pn.set(this, () => {
    }), hn.set(this, void 0), wo.set(this, () => {
    }), mn.set(this, () => {
    }), st.set(this, {}), gn.set(this, !1), bo.set(this, !1), Ao.set(this, !1), Tt.set(this, !1), Co.set(this, void 0), Io.set(this, void 0), yn.set(this, void 0), xo.set(this, (o) => {
      if (O(this, bo, !0, "f"), Qn(o) && (o = new Ke()), o instanceof Ke)
        return O(this, Ao, !0, "f"), this._emit("abort", o);
      if (o instanceof Q) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new Q(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new Q(String(o)));
    }), O(this, fn, new Promise((o, s) => {
      O(this, To, o, "f"), O(this, pn, s, "f");
    }), "f"), O(this, hn, new Promise((o, s) => {
      O(this, wo, o, "f"), O(this, mn, s, "f");
    }), "f"), E(this, fn, "f").catch(() => {
    }), E(this, hn, "f").catch(() => {
    }), O(this, Ft, t, "f"), O(this, yn, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, Co, "f");
  }
  get request_id() {
    return E(this, Io, "f");
  }
  async withResponse() {
    O(this, Tt, !0, "f");
    const t = await E(this, fn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ji(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new Ji(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return O(i, Ft, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, xo, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const s = o?.signal;
    let i;
    s && (s.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), s.addEventListener("abort", i));
    try {
      E(this, Be, "m", si).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) E(this, Be, "m", ii).call(this, c);
      if (u.controller.signal?.aborted) throw new Ke();
      E(this, Be, "m", ri).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (O(this, Co, t, "f"), O(this, Io, t?.headers.get("request-id"), "f"), E(this, To, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, gn, "f");
  }
  get errored() {
    return E(this, bo, "f");
  }
  get aborted() {
    return E(this, Ao, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, st, "f")[t] || (E(this, st, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = E(this, st, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (E(this, st, "f")[t] || (E(this, st, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      O(this, Tt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    O(this, Tt, !0, "f"), await E(this, hn, "f");
  }
  get currentMessage() {
    return E(this, ht, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, Be, "m", oi).call(this);
  }
  async finalText() {
    return await this.done(), E(this, Be, "m", fl).call(this);
  }
  _emit(t, ...n) {
    if (E(this, gn, "f")) return;
    t === "end" && (O(this, gn, !0, "f"), E(this, wo, "f").call(this));
    const o = E(this, st, "f")[t];
    if (o && (E(this, st, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !E(this, Tt, "f") && !o?.length && Promise.reject(s), E(this, pn, "f").call(this, s), E(this, mn, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !E(this, Tt, "f") && !o?.length && Promise.reject(s), E(this, pn, "f").call(this, s), E(this, mn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, Be, "m", oi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      E(this, Be, "m", si).call(this), this._connected(null);
      const i = Zn.fromReadableStream(t, this.controller);
      for await (const a of i) E(this, Be, "m", ii).call(this, a);
      if (i.controller.signal?.aborted) throw new Ke();
      E(this, Be, "m", ri).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(ht = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Be = /* @__PURE__ */ new WeakSet(), oi = function() {
    if (this.receivedMessages.length === 0) throw new Q("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, fl = function() {
    if (this.receivedMessages.length === 0) throw new Q("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new Q("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, si = function() {
    this.ended || O(this, ht, void 0, "f");
  }, ii = function(n) {
    if (this.ended) return;
    const o = E(this, Be, "m", pl).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const s = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            s.type === "text" && this._emit("text", n.delta.text, s.text || "");
            break;
          case "citations_delta":
            s.type === "text" && this._emit("citation", n.delta.citation, s.citations ?? []);
            break;
          case "input_json_delta":
            ml(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
            break;
          case "thinking_delta":
            s.type === "thinking" && this._emit("thinking", n.delta.thinking, s.thinking);
            break;
          case "signature_delta":
            s.type === "thinking" && this._emit("signature", s.signature);
            break;
          case "compaction_delta":
            s.type === "compaction" && s.content && this._emit("compaction", s.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(dl(o, E(this, Ft, "f"), { logger: E(this, yn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        O(this, ht, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ri = function() {
    if (this.ended) throw new Q("stream has ended, this shouldn't happen");
    const n = E(this, ht, "f");
    if (!n) throw new Q("request ended without sending any chunks");
    return O(this, ht, void 0, "f"), dl(n, E(this, Ft, "f"), { logger: E(this, yn, "f") });
  }, pl = function(n) {
    let o = E(this, ht, "f");
    if (n.type === "message_start") {
      if (o) throw new Q(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new Q(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.container = n.delta.container, o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, o.context_management = n.context_management, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (o.usage.iterations = n.usage.iterations), o;
      case "content_block_start":
        return o.content.push(n.content_block), o;
      case "content_block_delta": {
        const s = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              text: (s.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              citations: [...s.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (s && ml(s)) {
              let i = s[hl] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              if (Object.defineProperty(a, hl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Df(i);
              } catch (u) {
                const c = new Q(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                E(this, xo, "f").call(this, c);
              }
              o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              thinking: s.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            s?.type === "compaction" && (o.content[n.index] = {
              ...s,
              content: (s.content || "") + n.delta.content
            });
            break;
          default:
            n.delta;
        }
        return o;
      }
      case "content_block_stop":
        return o;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("streamEvent", (s) => {
      const i = n.shift();
      i ? i.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, i) => n.push({
        resolve: s,
        reject: i
      })).then((s) => s ? {
        value: s,
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
    return new Zn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var $f = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var ry = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, _n, Bt, wt, fe, Re, Ne, at, mt, vn, gl, Wi;
function yl() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var Uf = class {
  constructor(e, t, n) {
    _n.add(this), this.client = e, Bt.set(this, !1), wt.set(this, !1), fe.set(this, void 0), Re.set(this, void 0), Ne.set(this, void 0), at.set(this, void 0), mt.set(this, void 0), vn.set(this, 0), O(this, fe, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...If(t.tools, t.messages)].join(", ");
    O(this, Re, {
      ...n,
      headers: G([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), O(this, mt, yl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Bt = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), fe = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakSet(), gl = async function() {
    const t = E(this, fe, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (E(this, Ne, "f") !== void 0) try {
      const c = await E(this, Ne, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const s = t.model ?? E(this, fe, "f").params.model, i = t.summaryPrompt ?? ry, a = E(this, fe, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((p) => p.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: s,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: E(this, fe, "f").params.max_tokens
    }, {
      signal: E(this, Re, "f").signal,
      headers: G([E(this, Re, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new Q("Expected text response for compaction");
    return E(this, fe, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (E(this, Bt, "f")) throw new Q("Cannot iterate over a consumed stream");
    O(this, Bt, !0, "f"), O(this, wt, !0, "f"), O(this, at, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (E(this, fe, "f").params.max_iterations && E(this, vn, "f") >= E(this, fe, "f").params.max_iterations) break;
          O(this, wt, !1, "f"), O(this, at, void 0, "f"), O(this, vn, (e = E(this, vn, "f"), e++, e), "f"), O(this, Ne, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...s } = E(this, fe, "f").params;
          if (s.stream ? (t = this.client.beta.messages.stream({ ...s }, E(this, Re, "f")), O(this, Ne, t.finalMessage(), "f"), E(this, Ne, "f").catch(() => {
          }), yield t) : (O(this, Ne, this.client.beta.messages.create({
            ...s,
            stream: !1
          }, E(this, Re, "f")), "f"), yield E(this, Ne, "f")), !await E(this, _n, "m", gl).call(this)) {
            if (!E(this, wt, "f")) {
              const { role: a, content: u } = await E(this, Ne, "f");
              E(this, fe, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await E(this, _n, "m", Wi).call(this, E(this, fe, "f").params.messages.at(-1));
            if (i) E(this, fe, "f").params.messages.push(i);
            else if (!E(this, wt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!E(this, Ne, "f")) throw new Q("ToolRunner concluded without a message from the server");
      E(this, mt, "f").resolve(await E(this, Ne, "f"));
    } catch (t) {
      throw O(this, Bt, !1, "f"), E(this, mt, "f").promise.catch(() => {
      }), E(this, mt, "f").reject(t), O(this, mt, yl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? E(this, fe, "f").params = e(E(this, fe, "f").params) : E(this, fe, "f").params = e, O(this, wt, !0, "f"), O(this, at, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? O(this, Re, e(E(this, Re, "f")), "f") : O(this, Re, {
      ...E(this, Re, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = E(this, Re, "f").signal) {
    const t = await E(this, Ne, "f") ?? this.params.messages.at(-1);
    return t ? E(this, _n, "m", Wi).call(this, t, e) : null;
  }
  done() {
    return E(this, mt, "f").promise;
  }
  async runUntilDone() {
    if (!E(this, Bt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return E(this, fe, "f").params;
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
Wi = async function(t, n = E(this, Re, "f").signal) {
  return E(this, at, "f") !== void 0 ? E(this, at, "f") : (O(this, at, ay(E(this, fe, "f").params, t, {
    ...E(this, Re, "f"),
    signal: n
  }), "f"), E(this, at, "f"));
};
async function ay(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((s) => s.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (s) => {
      const i = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === s.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: s.id,
        content: `Error: Tool '${s.name}' not found`,
        is_error: !0
      };
      try {
        let a = s.input;
        "parse" in i && i.parse && (a = i.parse(a));
        const u = await i.run(a, {
          toolUseBlock: s,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: s.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: s.id,
          content: a instanceof $f ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Ff = class Bf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new so();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Q("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Q("Attempted to iterate over a response with no body");
    return new Bf(Fr(t.body), n);
  }
}, Gf = class extends he {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", io, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(X`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new Q(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: s } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: G([{
        "anthropic-beta": [...s ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Ff.fromResponse(a.response, a.controller));
  }
}, _l = {
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
}, ly = ["claude-opus-4-6"], ro = class extends he {
  constructor() {
    super(...arguments), this.batches = new Gf(this._client);
  }
  create(e, t) {
    const n = vl(e), { betas: o, ...s } = n;
    s.model in _l && console.warn(`The model '${s.model}' is deprecated and will reach end-of-life on ${_l[s.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), s.model in ly && s.thinking && s.thinking.type === "enabled" && console.warn(`Using Claude with ${s.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!s.stream && i == null) {
      const u = Nf[s.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(s.max_tokens, u);
    }
    const a = xf(s.tools, s.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: s,
      timeout: i ?? 6e5,
      ...t,
      headers: G([
        { ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 },
        a,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: G([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Lf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return iy.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = vl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Uf(this._client, e, t);
  }
};
function vl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new Q("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
ro.Batches = Gf;
ro.BetaToolRunner = Uf;
ro.ToolError = $f;
var Of = class extends he {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(X`/v1/sessions/${e}/events?beta=true`, et, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/sessions/${e}/events?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, qf = class extends he {
  retrieve(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.get(X`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: s, ...i } = t;
    return this._client.post(X`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(X`/v1/sessions/${e}/resources?beta=true`, et, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.delete(X`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/sessions/${e}/resources?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ks = class extends he {
  constructor() {
    super(...arguments), this.events = new Of(this._client), this.resources = new qf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/sessions/${e}?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", et, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(X`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
ks.Events = Of;
ks.Resources = qf;
var Vf = class extends he {
  create(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.post(X`/v1/skills/${e}/versions?beta=true`, Gr({
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.get(X`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(X`/v1/skills/${e}/versions?beta=true`, et, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.delete(X`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, qr = class extends he {
  constructor() {
    super(...arguments), this.versions = new Vf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Gr({
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", et, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
qr.Versions = Vf;
var Hf = class extends he {
  create(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/vaults/${e}/credentials?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.get(X`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: s, ...i } = t;
    return this._client.post(X`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(X`/v1/vaults/${e}/credentials?beta=true`, et, {
      query: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.delete(X`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.post(X`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Vr = class extends he {
  constructor() {
    super(...arguments), this.credentials = new Hf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(X`/v1/vaults/${e}?beta=true`, {
      body: s,
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", et, {
      query: o,
      ...t,
      headers: G([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(X`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(X`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: G([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Vr.Credentials = Hf;
var tt = class extends he {
  constructor() {
    super(...arguments), this.models = new Pf(this._client), this.messages = new ro(this._client), this.agents = new Or(this._client), this.environments = new Cf(this._client), this.sessions = new ks(this._client), this.vaults = new Vr(this._client), this.files = new Rf(this._client), this.skills = new qr(this._client);
  }
};
tt.Models = Pf;
tt.Messages = ro;
tt.Agents = Or;
tt.Environments = Cf;
tt.Sessions = ks;
tt.Vaults = Vr;
tt.Files = Rf;
tt.Skills = qr;
var Jf = class extends he {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: G([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Wf(e) {
  return e?.output_config?.format;
}
function Sl(e, t, n) {
  const o = Wf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => s.type === "text" ? Object.defineProperty({ ...s }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : s),
    parsed_output: null
  } : Kf(e, t, n);
}
function Kf(e, t, n) {
  let o = null;
  const s = e.content.map((i) => {
    if (i.type === "text") {
      const a = uy(t, i.text);
      return o === null && (o = a), Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: s,
    parsed_output: o
  };
}
function uy(e, t) {
  const n = Wf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new Q(`Failed to parse structured output: ${o}`);
  }
}
var Ge, gt, Gt, Sn, Ro, En, Tn, Po, wn, it, bn, Mo, No, bt, ko, Lo, An, ai, El, li, ui, ci, di, Tl, wl = "__json_buf";
function bl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var cy = class Ki {
  constructor(t, n) {
    Ge.add(this), this.messages = [], this.receivedMessages = [], gt.set(this, void 0), Gt.set(this, null), this.controller = new AbortController(), Sn.set(this, void 0), Ro.set(this, () => {
    }), En.set(this, () => {
    }), Tn.set(this, void 0), Po.set(this, () => {
    }), wn.set(this, () => {
    }), it.set(this, {}), bn.set(this, !1), Mo.set(this, !1), No.set(this, !1), bt.set(this, !1), ko.set(this, void 0), Lo.set(this, void 0), An.set(this, void 0), li.set(this, (o) => {
      if (O(this, Mo, !0, "f"), Qn(o) && (o = new Ke()), o instanceof Ke)
        return O(this, No, !0, "f"), this._emit("abort", o);
      if (o instanceof Q) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new Q(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new Q(String(o)));
    }), O(this, Sn, new Promise((o, s) => {
      O(this, Ro, o, "f"), O(this, En, s, "f");
    }), "f"), O(this, Tn, new Promise((o, s) => {
      O(this, Po, o, "f"), O(this, wn, s, "f");
    }), "f"), E(this, Sn, "f").catch(() => {
    }), E(this, Tn, "f").catch(() => {
    }), O(this, Gt, t, "f"), O(this, An, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, ko, "f");
  }
  get request_id() {
    return E(this, Lo, "f");
  }
  async withResponse() {
    O(this, bt, !0, "f");
    const t = await E(this, Sn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ki(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const i = new Ki(n, { logger: s });
    for (const a of n.messages) i._addMessageParam(a);
    return O(i, Gt, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, li, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const s = o?.signal;
    let i;
    s && (s.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), s.addEventListener("abort", i));
    try {
      E(this, Ge, "m", ui).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) E(this, Ge, "m", ci).call(this, c);
      if (u.controller.signal?.aborted) throw new Ke();
      E(this, Ge, "m", di).call(this);
    } finally {
      s && i && s.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (O(this, ko, t, "f"), O(this, Lo, t?.headers.get("request-id"), "f"), E(this, Ro, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, bn, "f");
  }
  get errored() {
    return E(this, Mo, "f");
  }
  get aborted() {
    return E(this, No, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, it, "f")[t] || (E(this, it, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = E(this, it, "f")[t];
    if (!o) return this;
    const s = o.findIndex((i) => i.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (E(this, it, "f")[t] || (E(this, it, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      O(this, bt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    O(this, bt, !0, "f"), await E(this, Tn, "f");
  }
  get currentMessage() {
    return E(this, gt, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, Ge, "m", ai).call(this);
  }
  async finalText() {
    return await this.done(), E(this, Ge, "m", El).call(this);
  }
  _emit(t, ...n) {
    if (E(this, bn, "f")) return;
    t === "end" && (O(this, bn, !0, "f"), E(this, Po, "f").call(this));
    const o = E(this, it, "f")[t];
    if (o && (E(this, it, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !E(this, bt, "f") && !o?.length && Promise.reject(s), E(this, En, "f").call(this, s), E(this, wn, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !E(this, bt, "f") && !o?.length && Promise.reject(s), E(this, En, "f").call(this, s), E(this, wn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, Ge, "m", ai).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      E(this, Ge, "m", ui).call(this), this._connected(null);
      const i = Zn.fromReadableStream(t, this.controller);
      for await (const a of i) E(this, Ge, "m", ci).call(this, a);
      if (i.controller.signal?.aborted) throw new Ke();
      E(this, Ge, "m", di).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(gt = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), li = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakSet(), ai = function() {
    if (this.receivedMessages.length === 0) throw new Q("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, El = function() {
    if (this.receivedMessages.length === 0) throw new Q("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new Q("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ui = function() {
    this.ended || O(this, gt, void 0, "f");
  }, ci = function(n) {
    if (this.ended) return;
    const o = E(this, Ge, "m", Tl).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const s = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            s.type === "text" && this._emit("text", n.delta.text, s.text || "");
            break;
          case "citations_delta":
            s.type === "text" && this._emit("citation", n.delta.citation, s.citations ?? []);
            break;
          case "input_json_delta":
            bl(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
            break;
          case "thinking_delta":
            s.type === "thinking" && this._emit("thinking", n.delta.thinking, s.thinking);
            break;
          case "signature_delta":
            s.type === "thinking" && this._emit("signature", s.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(Sl(o, E(this, Gt, "f"), { logger: E(this, An, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        O(this, gt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, di = function() {
    if (this.ended) throw new Q("stream has ended, this shouldn't happen");
    const n = E(this, gt, "f");
    if (!n) throw new Q("request ended without sending any chunks");
    return O(this, gt, void 0, "f"), Sl(n, E(this, Gt, "f"), { logger: E(this, An, "f") });
  }, Tl = function(n) {
    let o = E(this, gt, "f");
    if (n.type === "message_start") {
      if (o) throw new Q(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new Q(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), o;
      case "content_block_start":
        return o.content.push({ ...n.content_block }), o;
      case "content_block_delta": {
        const s = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              text: (s.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              citations: [...s.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (s && bl(s)) {
              let i = s[wl] || "";
              i += n.delta.partial_json;
              const a = { ...s };
              Object.defineProperty(a, wl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Df(i)), o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              thinking: s.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              signature: n.delta.signature
            });
            break;
          default:
            n.delta;
        }
        return o;
      }
      case "content_block_stop":
        return o;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("streamEvent", (s) => {
      const i = n.shift();
      i ? i.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const i of n) i.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, i) => n.push({
        resolve: s,
        reject: i
      })).then((s) => s ? {
        value: s,
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
    return new Zn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var zf = class extends he {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(X`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", io, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(X`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(X`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new Q(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: G([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => Ff.fromResponse(s.response, s.controller));
  }
}, Hr = class extends he {
  constructor() {
    super(...arguments), this.batches = new zf(this._client);
  }
  create(e, t) {
    e.model in Al && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Al[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in dy && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const s = Nf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, s);
    }
    const o = xf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: G([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Kf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return cy.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Al = {
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
}, dy = ["claude-opus-4-6"];
Hr.Batches = zf;
var Yf = class extends he {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(X`/v1/models/${e}`, {
      ...n,
      headers: G([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", io, {
      query: o,
      ...t,
      headers: G([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Do = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, zi, Jr, Zo, Xf, fy = "\\n\\nHuman:", py = "\\n\\nAssistant:", ce = class {
  constructor({ baseURL: e = Do("ANTHROPIC_BASE_URL"), apiKey: t = Do("ANTHROPIC_API_KEY") ?? null, authToken: n = Do("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    zi.add(this), Zo.set(this, void 0);
    const s = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!s.dangerouslyAllowBrowser && Ig()) throw new Q(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = s.baseURL, this.timeout = s.timeout ?? Jr.DEFAULT_TIMEOUT, this.logger = s.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = al(s.logLevel, "ClientOptions.logLevel", this) ?? al(Do("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = s.fetchOptions, this.maxRetries = s.maxRetries ?? 2, this.fetch = s.fetch ?? Ng(), O(this, Zo, Lg, "f"), this._options = s, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return G([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return G([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return G([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Dg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ht}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${nf()}`;
  }
  makeStatusError(e, t, n, o) {
    return Fe.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !E(this, zi, "m", Xf).call(this) && n || this.baseURL, s = wg(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!el(i) || !el(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new Q("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new _f(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (Ae(this).debug(`[${c}] sending request`, It({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ke();
    const f = new AbortController(), h = await this.fetchWithTimeout(a, i, u, f).catch(Bi), m = Date.now();
    if (h instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ke();
      const _ = Qn(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return Ae(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - ${y}`), Ae(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (${y})`, It({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw Ae(this).info(`[${c}] connection ${_ ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${c}] connection ${_ ? "timed out" : "failed"} (error; no more retries left)`, It({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), _ ? new of() : new Ns({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([y]) => y === "request-id").map(([y, _]) => ", " + y + ": " + JSON.stringify(_)).join("")}] ${i.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      const y = await this.shouldRetry(h);
      if (t && y) {
        const R = `retrying, ${t} attempts remaining`;
        return await kg(h.body), Ae(this).info(`${g} - ${R}`), Ae(this).debug(`[${c}] response error (${R})`, It({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const _ = y ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${g} - ${_}`);
      const S = await h.text().catch((R) => Bi(R).message), T = pf(S), C = T ? void 0 : S;
      throw Ae(this).debug(`[${c}] response error (${_})`, It({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: C,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, T, C, h.headers);
    }
    return Ae(this).info(g), Ae(this).debug(`[${c}] response start`, It({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((o) => ({
      method: "get",
      path: e,
      ...o
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new Hg(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: i, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, p = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (p.method = i.toUpperCase());
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
  async retryRequest(e, t, n, o) {
    let s;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (s = u);
    }
    const a = o?.get("retry-after");
    if (a && !s) {
      const u = parseFloat(a);
      Number.isNaN(u) ? s = Date.parse(a) - Date.now() : s = u * 1e3;
    }
    if (s === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Cg(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new Q("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: i, defaultBaseURL: a } = n, u = this.buildURL(s, i, a);
    "timeout" in n && Ag("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d } = this.buildBody({ options: n });
    return {
      req: {
        method: o,
        headers: await this.buildHeaders({
          options: e,
          method: o,
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
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = e.idempotencyKey);
    const i = G([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Mg(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(i), i.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = G([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: mf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : E(this, Zo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Jr = ce, Zo = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakSet(), Xf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ce.Anthropic = Jr;
ce.HUMAN_PROMPT = fy;
ce.AI_PROMPT = py;
ce.DEFAULT_TIMEOUT = 6e5;
ce.AnthropicError = Q;
ce.APIError = Fe;
ce.APIConnectionError = Ns;
ce.APIConnectionTimeoutError = of;
ce.APIUserAbortError = Ke;
ce.NotFoundError = lf;
ce.ConflictError = uf;
ce.RateLimitError = df;
ce.BadRequestError = sf;
ce.AuthenticationError = rf;
ce.InternalServerError = ff;
ce.PermissionDeniedError = af;
ce.UnprocessableEntityError = cf;
ce.toFile = Xg;
var ao = class extends ce {
  constructor() {
    super(...arguments), this.completions = new Jf(this), this.messages = new Hr(this), this.models = new Yf(this), this.beta = new tt(this);
  }
};
ao.Completions = Jf;
ao.Messages = Hr;
ao.Models = Yf;
ao.Beta = tt;
function hy(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function my(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function gy(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function yy(e) {
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
      const o = gy(n.image_url.url);
      return !o.mediaType || !o.data ? null : {
        type: "image",
        source: {
          type: "base64",
          media_type: o.mediaType,
          data: o.data
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
function _y(e) {
  switch (e) {
    case "high":
      return 4096;
    case "medium":
      return 2048;
    default:
      return 1024;
  }
}
function vy(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Sy(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((o) => {
    (o.tool_calls || []).forEach((s) => {
      s.id && s.function?.name && n.set(s.id, s.function.name);
    });
  });
  for (const o of e)
    if (o.role !== "system") {
      if (o.role === "tool") {
        t.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: o.tool_call_id,
            name: n.get(o.tool_call_id || "") || void 0,
            content: o.content
          }]
        });
        continue;
      }
      if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...o.content ? [{
            type: "text",
            text: o.content
          }] : [], ...o.tool_calls.map((s) => ({
            type: "tool_use",
            id: s.id,
            name: s.function.name,
            input: my(s.function.arguments)
          }))]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: yy(o.content)
      });
    }
  return t;
}
function fi(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
var Ey = class {
  constructor(e) {
    this.config = e, this.client = new ao({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.anthropic.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 18e4,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  async chat(e) {
    const t = (e.tools || []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), n = vy(e), o = {
      model: this.config.model,
      system: n,
      messages: Sy(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "enabled",
      budget_tokens: _y(e.reasoning.effort),
      display: "summarized"
    }), hy("[LittleWhiteBox Assistant] Anthropic outgoing request", o);
    let s;
    if (typeof e.onStreamProgress == "function") {
      const a = this.client.messages.stream(o, { signal: e.signal }), u = /* @__PURE__ */ new Map(), c = () => Array.from(u.entries()).sort(([d], [p]) => d.localeCompare(p)).map(([d, p]) => ({
        label: d.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: p
      })).filter((d) => d.text);
      a.on("text", (d, p) => {
        fi(e, {
          text: p || "",
          thoughts: c()
        });
      }), a.on("thinking", (d, p) => {
        u.set("thinking:0", p || ""), fi(e, { thoughts: c() });
      }), a.on("contentBlock", (d) => {
        d?.type === "redacted_thinking" && (u.set("redacted:0", d.data || ""), fi(e, { thoughts: c() }));
      }), s = await a.finalMessage();
    } else s = await this.client.messages.create(o, { signal: e.signal });
    const i = (s.content || []).filter((a) => a.type === "tool_use" && a.name).map((a, u) => ({
      id: a.id || `anthropic-tool-${u + 1}`,
      name: a.name,
      arguments: JSON.stringify(a.input || {})
    }));
    return {
      text: (s.content || []).filter((a) => a.type === "text").map((a) => a.text || "").join(`
`),
      toolCalls: i,
      thoughts: (s.content || []).filter((a) => a.type === "thinking" || a.type === "redacted_thinking").map((a) => ({
        label: a.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: a.type === "thinking" ? a.thinking || "" : a.data || ""
      })).filter((a) => a.text),
      finishReason: s.stop_reason || "stop",
      model: s.model || this.config.model,
      provider: "anthropic"
    };
  }
}, Ty = /* @__PURE__ */ Ss(((e, t) => {
  function n(o, s) {
    typeof s == "boolean" && (s = { forever: s }), this._originalTimeouts = JSON.parse(JSON.stringify(o)), this._timeouts = o, this._options = s || {}, this._maxRetryTime = s && s.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(o) {
    if (this._timeout && clearTimeout(this._timeout), !o) return !1;
    var s = (/* @__PURE__ */ new Date()).getTime();
    if (o && s - this._operationStart >= this._maxRetryTime)
      return this._errors.push(o), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(o);
    var i = this._timeouts.shift();
    if (i === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), i = this._cachedTimeouts.slice(-1);
    else return !1;
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
    }, i), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(o, s) {
    this._fn = o, s && (s.timeout && (this._operationTimeout = s.timeout), s.cb && (this._operationTimeoutCb = s.cb));
    var i = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      i._operationTimeoutCb();
    }, i._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
  }, n.prototype.try = function(o) {
    console.log("Using RetryOperation.try() is deprecated"), this.attempt(o);
  }, n.prototype.start = function(o) {
    console.log("Using RetryOperation.start() is deprecated"), this.attempt(o);
  }, n.prototype.start = n.prototype.try, n.prototype.errors = function() {
    return this._errors;
  }, n.prototype.attempts = function() {
    return this._attempts;
  }, n.prototype.mainError = function() {
    if (this._errors.length === 0) return null;
    for (var o = {}, s = null, i = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= i && (s = u, i = d);
    }
    return s;
  };
})), wy = /* @__PURE__ */ Ss(((e) => {
  var t = Ty();
  e.operation = function(n) {
    return new t(e.timeouts(n), {
      forever: n && (n.forever || n.retries === 1 / 0),
      unref: n && n.unref,
      maxRetryTime: n && n.maxRetryTime
    });
  }, e.timeouts = function(n) {
    if (n instanceof Array) return [].concat(n);
    var o = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: 1 / 0,
      randomize: !1
    };
    for (var s in n) o[s] = n[s];
    if (o.minTimeout > o.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var i = [], a = 0; a < o.retries; a++) i.push(this.createTimeout(a, o));
    return n && n.forever && !i.length && i.push(this.createTimeout(a, o)), i.sort(function(u, c) {
      return u - c;
    }), i;
  }, e.createTimeout = function(n, o) {
    var s = o.randomize ? Math.random() + 1 : 1, i = Math.round(s * Math.max(o.minTimeout, 1) * Math.pow(o.factor, n));
    return i = Math.min(i, o.maxTimeout), i;
  }, e.wrap = function(n, o, s) {
    if (o instanceof Array && (s = o, o = null), !s) {
      s = [];
      for (var i in n) typeof n[i] == "function" && s.push(i);
    }
    for (var a = 0; a < s.length; a++) {
      var u = s[a], c = n[u];
      n[u] = function(p) {
        var f = e.operation(o), h = Array.prototype.slice.call(arguments, 1), m = h.pop();
        h.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          p.apply(n, h);
        });
      }.bind(n, c), n[u].options = o;
    }
  };
})), by = /* @__PURE__ */ Ss(((e, t) => {
  t.exports = wy();
})), Ay = /* @__PURE__ */ Ss(((e, t) => {
  var n = by(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], s = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, p) => {
    const f = p.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, a = (c) => o.includes(c), u = (c, d) => new Promise((p, f) => {
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
        if (g instanceof s)
          h.stop(), f(g.originalError);
        else if (g instanceof TypeError && !a(g.message))
          h.stop(), f(g);
        else {
          i(g, m, d);
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
  t.exports = u, t.exports.default = u, t.exports.AbortError = s;
})), Cl = /* @__PURE__ */ Vh(Ay(), 1), Cy = void 0, Iy = void 0;
function xy() {
  return {
    geminiUrl: Cy,
    vertexUrl: Iy
  };
}
function Ry(e, t, n, o) {
  var s, i;
  if (!e?.baseUrl) {
    const a = xy();
    return t ? (s = a.vertexUrl) !== null && s !== void 0 ? s : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var ut = class {
};
function B(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, o) => {
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const s = t[o];
      return s != null ? String(s) : "";
    } else throw new Error(`Key '${o}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    if (a.endsWith("[]")) {
      const u = a.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const p = c[d];
          l(p, t.slice(i + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(i + 1), n);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const u = a.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(i + 1), n);
      return;
    }
    (!e[a] || typeof e[a] != "object") && (e[a] = {}), e = e[a];
  }
  const o = t[t.length - 1], s = e[o];
  if (s !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === s) return;
    if (typeof s == "object" && typeof n == "object" && s !== null && n !== null) Object.assign(s, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function r(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const s = t[o];
      if (s.endsWith("[]")) {
        const i = s.slice(0, -2);
        if (i in e) {
          const a = e[i];
          return Array.isArray(a) ? a.map((u) => r(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[s];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function Py(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const s = n.split("."), i = o.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < s.length; c++) if (s[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    Yi(e, s, i, 0, a);
  }
}
function Yi(e, t, n, o, s) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Yi(c, t, n, o + 1, s);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !s.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, p] of Object.entries(c)) {
        const f = [];
        for (const h of n.slice(o)) h === "*" ? f.push(d) : f.push(h);
        l(a, f, p);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    i in a && Yi(a[i], t, n, o + 1, s);
  }
}
function Wr(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function My(e) {
  const t = {}, n = r(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = r(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function Ny(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Ly(a)), t;
}
function ky(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Dy(a)), t;
}
function Ly(e) {
  const t = {}, n = r(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => $y(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Dy(e) {
  const t = {}, n = r(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Uy(a))), l(t, ["generatedVideos"], i);
  }
  const o = r(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = r(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function $y(e) {
  const t = {}, n = r(e, ["video"]);
  return n != null && l(t, ["video"], Vy(n)), t;
}
function Uy(e) {
  const t = {}, n = r(e, ["_self"]);
  return n != null && l(t, ["video"], Hy(n)), t;
}
function Fy(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function By(e) {
  const t = {}, n = r(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Gy(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], Oy(a)), t;
}
function Oy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Qf(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], qy(a)), t;
}
function qy(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Vy(e) {
  const t = {}, n = r(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Wr(o));
  const s = r(e, ["encoding"]);
  return s != null && l(t, ["mimeType"], s), t;
}
function Hy(e) {
  const t = {}, n = r(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = r(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Wr(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(t, ["mimeType"], s), t;
}
var Il;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Il || (Il = {}));
var xl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(xl || (xl = {}));
var Rl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Rl || (Rl = {}));
var yt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(yt || (yt = {}));
var Pl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(kl || (kl = {}));
var Ll;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Ll || (Ll = {}));
var Dl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})($l || ($l = {}));
var Xi;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Xi || (Xi = {}));
var zn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(zn || (zn = {}));
var Ul;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Fl || (Fl = {}));
var Bl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Bl || (Bl = {}));
var Gl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Ol || (Ol = {}));
var ql;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(ql || (ql = {}));
var Vl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Vl || (Vl = {}));
var Hl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Hl || (Hl = {}));
var Jl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Jl || (Jl = {}));
var Wl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Wl || (Wl = {}));
var Kl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Kl || (Kl = {}));
var ps;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ps || (ps = {}));
var zl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Ql || (Ql = {}));
var Qi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Qi || (Qi = {}));
var Zl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(ou || (ou = {}));
var su;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(su || (su = {}));
var Zi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Zi || (Zi = {}));
var iu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(iu || (iu = {}));
var ru;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(ru || (ru = {}));
var hs;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(hs || (hs = {}));
var au;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(au || (au = {}));
var lu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(cu || (cu = {}));
var du;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(du || (du = {}));
var fu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(fu || (fu = {}));
var pu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(pu || (pu = {}));
var hu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(hu || (hu = {}));
var mu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(vu || (vu = {}));
var Su;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Eu || (Eu = {}));
var Tu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Tu || (Tu = {}));
var wu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(wu || (wu = {}));
var bu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(bu || (bu = {}));
var Au;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Au || (Au = {}));
var Cu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Iu || (Iu = {}));
var xu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(xu || (xu = {}));
var Ru;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Ru || (Ru = {}));
var Kt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Kt || (Kt = {}));
var ji = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Cn = class {
  get text() {
    var e, t, n, o, s, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const p = [];
    for (const f of (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [h, m] of Object.entries(f)) h !== "text" && h !== "thought" && h !== "thoughtSignature" && (m !== null || m !== void 0) && p.push(h);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return p.length > 0 && console.warn(`there are non-text parts ${p} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, s, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const p of (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, h] of Object.entries(p)) f !== "inlineData" && (h !== null || h !== void 0) && d.push(f);
      p.inlineData && typeof p.inlineData.data == "string" && (c += atob(p.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, s, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, s, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.executableCode).map((p) => p.executableCode).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, s, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.codeExecutionResult).map((p) => p.codeExecutionResult).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, Pu = class {
}, Mu = class {
}, Jy = class {
}, Wy = class {
}, Ky = class {
}, zy = class {
}, Nu = class {
}, ku = class {
}, Lu = class {
}, Yy = class {
}, Du = class Zf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Zf();
    let s;
    const i = t;
    return n ? s = ky(i) : s = Ny(i), Object.assign(o, s), o;
  }
}, $u = class {
}, Uu = class {
}, Fu = class {
}, Bu = class {
}, Xy = class {
}, Qy = class {
}, Zy = class {
}, jy = class jf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new jf(), s = Gy(t);
    return Object.assign(o, s), o;
  }
}, e_ = class {
}, t_ = class {
}, n_ = class {
}, o_ = class {
}, Gu = class {
}, s_ = class {
  get text() {
    var e, t, n;
    let o = "", s = !1;
    const i = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        s = !0, o += a.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), s ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const s = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(i)) a !== "inlineData" && u !== null && s.push(a);
      i.inlineData && typeof i.inlineData.data == "string" && (o += atob(i.inlineData.data));
    }
    return s.length > 0 && console.warn(`there are non-data parts ${s} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, i_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, r_ = class ep {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new ep(), s = Qf(t);
    return Object.assign(o, s), o;
  }
};
function te(e, t) {
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
function tp(e, t) {
  const n = te(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function np(e) {
  return Array.isArray(e) ? e.map((t) => ms(t)) : [ms(e)];
}
function ms(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function op(e) {
  const t = ms(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function sp(e) {
  const t = ms(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Ou(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function ip(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Ou(t)) : [Ou(e)];
}
function er(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function qu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Vu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function ye(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return er(e) ? e : {
    role: "user",
    parts: ip(e)
  };
}
function Kr(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = ye(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = ye(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => ye(n)) : [ye(t)];
}
function Me(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (qu(e) || Vu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [ye(e)];
  }
  const t = [], n = [], o = er(e[0]);
  for (const s of e) {
    const i = er(s);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(s);
    else {
      if (qu(s) || Vu(s)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(s);
    }
  }
  return o || t.push({
    role: "user",
    parts: ip(n)
  }), t;
}
function a_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(yt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : yt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(yt).includes(o.toUpperCase()) ? o.toUpperCase() : yt.TYPE_UNSPECIFIED });
  }
}
function Xt(e) {
  const t = {}, n = ["items"], o = ["anyOf"], s = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && a_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(yt).includes(u.toUpperCase()) ? u.toUpperCase() : yt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = Xt(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(Xt(d));
        }
        t[a] = c;
      } else if (s.includes(a)) {
        const c = {};
        for (const [d, p] of Object.entries(u)) c[d] = Xt(p);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function zr(e) {
  return Xt(e);
}
function Yr(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Xr(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function tn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = Xt(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = Xt(t.response));
  return e;
}
function nn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function l_(e, t, n, o = 1) {
  const s = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : s ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : s ? `${n}/${t}` : t;
}
function ct(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return l_(e, t, "cachedContents");
}
function rp(e) {
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
function vt(e) {
  return Wr(e);
}
function u_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function c_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function d_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function ap(e) {
  var t;
  let n;
  if (u_(e) && (n = e.name), !(d_(e) && (n = e.uri, n === void 0)) && !(c_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function lp(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function up(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (f_(e, t)) return e[t];
  return [];
}
function f_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function p_(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function h_(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const i = s.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = p_(s, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function cp(e, t) {
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
  const o = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, s = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (s > 0 || o !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || s !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function m_(e) {
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
function dp(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let s = !1;
  for (const i of o) {
    if (typeof i != "object" || i === null) continue;
    const a = i.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      s = !0;
      break;
    }
  }
  return s && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function on(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function fp(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function g_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function y_(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function __(e) {
  const t = {}, n = r(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = r(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Z_(a))), l(t, ["inlinedResponses"], i);
  }
  const s = r(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function v_(e) {
  const t = {}, n = r(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigqueryDestination", "outputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function S_(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && l(t, ["gcsDestination", "outputUriPrefix"], o);
  const s = r(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigqueryDestination", "outputUri"], s), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function jo(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["metadata", "state"]);
  s != null && l(t, ["state"], fp(s));
  const i = r(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = r(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = r(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = r(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = r(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], __(dp(d))), t;
}
function tr(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = r(e, ["state"]);
  s != null && l(t, ["state"], fp(s));
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const u = r(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = r(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const p = r(e, ["model"]);
  p != null && l(t, ["model"], p);
  const f = r(e, ["inputConfig"]);
  f != null && l(t, ["src"], E_(f));
  const h = r(e, ["outputConfig"]);
  h != null && l(t, ["dest"], v_(dp(h)));
  const m = r(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function E_(e) {
  const t = {}, n = r(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = r(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const s = r(e, ["bigquerySource", "inputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function T_(e, t) {
  const n = {};
  if (r(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (r(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = r(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const s = r(t, ["inlinedRequests"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Q_(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function w_(e) {
  const t = {}, n = r(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = r(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const s = r(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigquerySource", "inputUri"], s), r(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (r(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function b_(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function A_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function C_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function I_(e) {
  const t = {}, n = r(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = r(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], x_(o));
  const s = r(e, ["tokenCount"]);
  s != null && l(t, ["tokenCount"], s);
  const i = r(e, ["finishReason"]);
  i != null && l(t, ["finishReason"], i);
  const a = r(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const u = r(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = r(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = r(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const p = r(e, ["safetyRatings"]);
  if (p != null) {
    let h = p;
    Array.isArray(h) && (h = h.map((m) => m)), l(t, ["safetyRatings"], h);
  }
  const f = r(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function x_(e) {
  const t = {}, n = r(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["citations"], o);
  }
  return t;
}
function pp(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => iv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function R_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), r(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const s = r(e, ["webhookConfig"]);
  return t !== void 0 && s != null && l(t, ["batch", "webhookConfig"], s), n;
}
function P_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = r(e, ["dest"]);
  if (t !== void 0 && s != null && l(t, ["outputConfig"], S_(m_(s))), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Hu(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], te(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], T_(e, cp(e, s)));
  const i = r(t, ["config"]);
  return i != null && R_(i, n), n;
}
function M_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], te(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["inputConfig"], w_(cp(e, s)));
  const i = r(t, ["config"]);
  return i != null && P_(i, n), n;
}
function N_(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function k_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["_url", "model"], te(e, o));
  const s = r(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], G_(e, s));
  const i = r(t, ["config"]);
  return i != null && N_(i, n), n;
}
function L_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function D_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function $_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function U_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function F_(e, t) {
  const n = {}, o = r(t, ["contents"]);
  if (o != null) {
    let i = Kr(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const s = r(t, ["config"]);
  return s != null && (l(n, ["_self"], B_(s, n)), Py(n, { "requests[].*": "requests[].request.*" })), n;
}
function B_(e, t) {
  const n = {}, o = r(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const s = r(e, ["title"]);
  t !== void 0 && s != null && l(t, ["requests[]", "title"], s);
  const i = r(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), r(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (r(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (r(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (r(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function G_(e, t) {
  const n = {}, o = r(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const s = r(t, ["inlinedRequests"]);
  return s != null && l(n, ["requests"], F_(e, s)), n;
}
function O_(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function q_(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function V_(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function H_(e, t, n) {
  const o = {}, s = r(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], pp(ye(s)));
  const i = r(t, ["temperature"]);
  i != null && l(o, ["temperature"], i);
  const a = r(t, ["topP"]);
  a != null && l(o, ["topP"], a);
  const u = r(t, ["topK"]);
  u != null && l(o, ["topK"], u);
  const c = r(t, ["candidateCount"]);
  c != null && l(o, ["candidateCount"], c);
  const d = r(t, ["maxOutputTokens"]);
  d != null && l(o, ["maxOutputTokens"], d);
  const p = r(t, ["stopSequences"]);
  p != null && l(o, ["stopSequences"], p);
  const f = r(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
  const h = r(t, ["logprobs"]);
  h != null && l(o, ["logprobs"], h);
  const m = r(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = r(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const y = r(t, ["seed"]);
  y != null && l(o, ["seed"], y);
  const _ = r(t, ["responseMimeType"]);
  _ != null && l(o, ["responseMimeType"], _);
  const S = r(t, ["responseSchema"]);
  S != null && l(o, ["responseSchema"], zr(S));
  const T = r(t, ["responseJsonSchema"]);
  if (T != null && l(o, ["responseJsonSchema"], T), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const C = r(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let U = C;
    Array.isArray(U) && (U = U.map((z) => rv(z))), l(n, ["safetySettings"], U);
  }
  const R = r(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let U = nn(R);
    Array.isArray(U) && (U = U.map((z) => lv(tn(z)))), l(n, ["tools"], U);
  }
  const L = r(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], av(L)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const b = r(t, ["cachedContent"]);
  n !== void 0 && b != null && l(n, ["cachedContent"], ct(e, b));
  const v = r(t, ["responseModalities"]);
  v != null && l(o, ["responseModalities"], v);
  const A = r(t, ["mediaResolution"]);
  A != null && l(o, ["mediaResolution"], A);
  const P = r(t, ["speechConfig"]);
  if (P != null && l(o, ["speechConfig"], Yr(P)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const q = r(t, ["thinkingConfig"]);
  q != null && l(o, ["thinkingConfig"], q);
  const V = r(t, ["imageConfig"]);
  V != null && l(o, ["imageConfig"], X_(V));
  const k = r(t, ["enableEnhancedCivicAnswers"]);
  if (k != null && l(o, ["enableEnhancedCivicAnswers"], k), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const D = r(t, ["serviceTier"]);
  return n !== void 0 && D != null && l(n, ["serviceTier"], D), o;
}
function J_(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((p) => I_(p))), l(t, ["candidates"], d);
  }
  const s = r(e, ["modelVersion"]);
  s != null && l(t, ["modelVersion"], s);
  const i = r(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const a = r(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = r(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = r(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function W_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function K_(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], on(e, o)), n;
}
function z_(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], y_(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Y_(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function X_(e) {
  const t = {}, n = r(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const o = r(e, ["imageSize"]);
  if (o != null && l(t, ["imageSize"], o), r(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (r(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (r(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (r(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function Q_(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["request", "model"], te(e, o));
  const s = r(t, ["contents"]);
  if (s != null) {
    let u = Me(s);
    Array.isArray(u) && (u = u.map((c) => pp(c))), l(n, ["request", "contents"], u);
  }
  const i = r(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = r(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], H_(e, a, r(n, ["request"], {}))), n;
}
function Z_(e) {
  const t = {}, n = r(e, ["response"]);
  n != null && l(t, ["response"], J_(n));
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function j_(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  if (t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), r(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function ev(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const i = r(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function tv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && j_(n, t), t;
}
function nv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && ev(n, t), t;
}
function ov(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["operations"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => jo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function sv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["batchPredictionJobs"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => tr(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function iv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], O_(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], q_(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], b_(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = r(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function rv(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function av(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], V_(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function lv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Y_(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], z_(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = r(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
var lt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(lt || (lt = {}));
var Nt = class {
  constructor(e, t, n, o) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, o);
  }
  init(e, t, n) {
    var o, s;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let i = { config: {} };
    !n || Object.keys(n).length === 0 ? i = { config: {} } : typeof n == "object" ? i = Object.assign({}, n) : i = n, i.config && (i.config.pageToken = t.nextPageToken), this.paramsInternal = i, this.pageInternalSize = (s = (o = i.config) === null || o === void 0 ? void 0 : o.pageSize) !== null && s !== void 0 ? s : this.pageInternal.length;
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
}, uv = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(lt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Hu(this.apiClient, e), n = t._url, o = B("{model}:batchGenerateContent", n), s = t.batch.inputConfig.requests, i = s.requests, a = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const p = c.request;
        p.systemInstruction = d, c.request = p;
      }
      a.push(c);
    }
    return s.requests = a, delete t.config, delete t._url, delete t._query, {
      path: o,
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
    const n = t ? Object.assign({}, t) : {}, o = Date.now().toString();
    if (n.displayName || (n.displayName = `genaiBatchJob_${o}`), n.dest === void 0) {
      const s = this.getGcsUri(e), i = this.getBigqueryUri(e);
      if (s) s.endsWith(".jsonl") ? n.dest = `${s.slice(0, -6)}/dest` : n.dest = `${s}_dest_${o}`;
      else if (i) n.dest = `${i}_dest_${o}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = M_(this.apiClient, e);
      return a = B("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => tr(d));
    } else {
      const c = Hu(this.apiClient, e);
      return a = B("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => jo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = k_(this.apiClient, e);
      return s = B("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => jo(u));
    }
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = K_(this.apiClient, e);
      return a = B("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => tr(d));
    } else {
      const c = W_(this.apiClient, e);
      return a = B("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => jo(d));
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = C_(this.apiClient, e);
      i = B("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = A_(this.apiClient, e);
      i = B("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nv(e);
      return a = B("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = sv(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = tv(e);
      return a = B("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = ov(d), f = new Gu();
        return Object.assign(f, p), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = D_(this.apiClient, e);
      return a = B("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => U_(d));
    } else {
      const c = L_(this.apiClient, e);
      return a = B("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => $_(d));
    }
  }
};
function cv(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function dv(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ju(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Lv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Wu(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Dv(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function fv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let p = Me(a);
    Array.isArray(p) && (p = p.map((f) => Ju(f))), l(t, ["contents"], p);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Ju(ye(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((f) => Fv(f))), l(t, ["tools"], p);
  }
  const d = r(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], $v(d)), r(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function pv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const i = r(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = r(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Me(a);
    Array.isArray(f) && (f = f.map((h) => Wu(h))), l(t, ["contents"], f);
  }
  const u = r(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Wu(ye(u)));
  const c = r(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => Bv(h))), l(t, ["tools"], f);
  }
  const d = r(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Uv(d));
  const p = r(e, ["kmsKeyName"]);
  return t !== void 0 && p != null && l(t, ["encryption_spec", "kmsKeyName"], p), n;
}
function hv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], tp(e, o));
  const s = r(t, ["config"]);
  return s != null && fv(s, n), n;
}
function mv(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["model"], tp(e, o));
  const s = r(t, ["config"]);
  return s != null && pv(s, n), n;
}
function gv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function yv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function _v(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function vv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Sv(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ev(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Tv(e) {
  const t = {}, n = r(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = r(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function wv(e) {
  const t = {}, n = r(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["parameters"]);
  s != null && l(t, ["parameters"], s);
  const i = r(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = r(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = r(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function bv(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function Av(e, t) {
  const n = {}, o = r(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function Cv(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cv(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Iv(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function xv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Rv(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Pv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && xv(n, t), t;
}
function Mv(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && Rv(n, t), t;
}
function Nv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["cachedContents"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function kv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["cachedContents"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function Lv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Sv(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Ev(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], dv(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = r(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function Dv(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function $v(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Tv(o));
  const s = r(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function Uv(e) {
  const t = {}, n = r(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = r(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Fv(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Iv(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Cv(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = r(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function Bv(e) {
  const t = {}, n = r(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = r(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], s);
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = r(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = r(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => wv(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Gv(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function Ov(e, t) {
  const n = {}, o = r(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = r(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function qv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ct(e, o));
  const s = r(t, ["config"]);
  return s != null && Gv(s, n), n;
}
function Vv(e, t) {
  const n = {}, o = r(t, ["name"]);
  o != null && l(n, ["_url", "name"], ct(e, o));
  const s = r(t, ["config"]);
  return s != null && Ov(s, n), n;
}
var Hv = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(lt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = mv(this.apiClient, e);
      return a = B("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = hv(this.apiClient, e);
      return a = B("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Av(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = bv(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yv(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = vv(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = gv(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = _v(d), f = new Fu();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Vv(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = qv(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Mv(e);
      return a = B("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = kv(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Pv(e);
      return a = B("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = Nv(d), f = new Bu();
        return Object.assign(f, p), f;
      });
    }
  }
};
function _t(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, o = Object.getOwnPropertySymbols(e); s < o.length; s++) t.indexOf(o[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[s]) && (n[o[s]] = e[o[s]]);
  return n;
}
function Ku(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, n = t && e[t], o = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == "number") return { next: function() {
    return e && o >= e.length && (e = void 0), {
      value: e && e[o++],
      done: !e
    };
  } };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Z(e) {
  return this instanceof Z ? (this.v = e, this) : new Z(e);
}
function ze(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), s, i = [];
  return s = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (s[m] = function(y) {
      return new Promise(function(_, S) {
        i.push([
          m,
          y,
          _,
          S
        ]) > 1 || c(m, y);
      });
    }, g && (s[m] = g(s[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (y) {
      h(i[0][3], y);
    }
  }
  function d(m) {
    m.value instanceof Z ? Promise.resolve(m.value.v).then(p, f) : h(i[0][2], m);
  }
  function p(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function h(m, g) {
    m(g), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function Ye(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Ku == "function" ? Ku(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(i) {
    n[i] = e[i] && function(a) {
      return new Promise(function(u, c) {
        a = e[i](a), s(u, c, a.done, a.value);
      });
    };
  }
  function s(i, a, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, a);
  }
}
function Jv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : hp(n);
}
function hp(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Wv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function zu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const s = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      s.push(e[o]), i && !hp(e[o]) && (i = !1), o++;
    i ? t.push(...s) : t.pop();
  }
  return t;
}
var Kv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new zv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, zv = class {
  constructor(e, t, n, o = {}, s = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = s, this.sendPromise = Promise.resolve(), Wv(s);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = ye(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var s, i, a;
      const u = await o, c = (i = (s = u.candidates) === null || s === void 0 ? void 0 : s[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, p = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(p)) !== null && a !== void 0 ? a : []);
      const h = c ? [c] : [];
      this.recordHistory(n, h, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = ye(e.message), o = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = o.then(() => {
    }).catch(() => {
    });
    const s = await o;
    return this.processStreamResponse(s, n);
  }
  getHistory(e = !1) {
    const t = e ? zu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return ze(this, arguments, function* () {
      var o, s, i, a, u, c;
      const d = [];
      try {
        for (var p = !0, f = Ye(e), h; h = yield Z(f.next()), o = h.done, !o; p = !0) {
          a = h.value, p = !1;
          const m = a;
          if (Jv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield Z(m);
        }
      } catch (m) {
        s = { error: m };
      } finally {
        try {
          !p && !o && (i = f.return) && (yield Z(i.call(f)));
        } finally {
          if (s) throw s.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let o = [];
    t.length > 0 && t.every((s) => s.role !== void 0) ? o = t : o.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...zu(n)) : this.history.push(e), this.history.push(...o);
  }
}, mp = class gp extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, gp.prototype);
  }
};
function Yv(e) {
  const t = {}, n = r(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Xv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Qv(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], ap(n)), t;
}
function Zv(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function jv(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "file"], ap(n)), t;
}
function eS(e) {
  const t = {}, n = r(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function tS(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function nS(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && tS(n, t), t;
}
function oS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["files"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["files"], i);
  }
  return t;
}
function sS(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(t, ["files"], s);
  }
  return t;
}
var iS = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(lt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = nS(e);
      return s = B("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = oS(u), d = new e_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Yv(e);
      return s = B("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Xv(u), d = new t_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jv(e);
      return s = B("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Qv(e);
      return s = B("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = Zv(u), d = new n_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = eS(e);
      return s = B("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = sS(u), d = new o_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Yu(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function rS(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function es(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function aS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => bS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function lS(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => AS(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function uS(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function cS(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function dS(e) {
  const t = {}, n = r(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = r(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = r(e, ["parameters"]);
  s != null && l(t, ["parameters"], s);
  const i = r(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = r(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = r(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function fS(e) {
  const t = {}, n = r(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const o = r(e, ["responseJsonSchema"]);
  o != null && l(t, ["responseJsonSchema"], o);
  const s = r(e, ["audioTimestamp"]);
  s != null && l(t, ["audioTimestamp"], s);
  const i = r(e, ["candidateCount"]);
  i != null && l(t, ["candidateCount"], i);
  const a = r(e, ["enableAffectiveDialog"]);
  a != null && l(t, ["enableAffectiveDialog"], a);
  const u = r(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = r(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = r(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const p = r(e, ["mediaResolution"]);
  p != null && l(t, ["mediaResolution"], p);
  const f = r(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const h = r(e, ["responseLogprobs"]);
  h != null && l(t, ["responseLogprobs"], h);
  const m = r(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = r(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const y = r(e, ["responseSchema"]);
  y != null && l(t, ["responseSchema"], y);
  const _ = r(e, ["routingConfig"]);
  _ != null && l(t, ["routingConfig"], _);
  const S = r(e, ["seed"]);
  S != null && l(t, ["seed"], S);
  const T = r(e, ["speechConfig"]);
  T != null && l(t, ["speechConfig"], T);
  const C = r(e, ["stopSequences"]);
  C != null && l(t, ["stopSequences"], C);
  const R = r(e, ["temperature"]);
  R != null && l(t, ["temperature"], R);
  const L = r(e, ["thinkingConfig"]);
  L != null && l(t, ["thinkingConfig"], L);
  const b = r(e, ["topK"]);
  b != null && l(t, ["topK"], b);
  const v = r(e, ["topP"]);
  if (v != null && l(t, ["topP"], v), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function pS(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], rS(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function hS(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function mS(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const s = r(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const i = r(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = r(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const p = r(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Xr(f));
  const h = r(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], aS(ye(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let A = nn(y);
    Array.isArray(A) && (A = A.map((P) => xS(tn(P)))), l(t, ["setup", "tools"], A);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], IS(_));
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], Yu(S));
  const T = r(e, ["outputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "outputAudioTranscription"], Yu(T));
  const C = r(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const L = r(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const b = r(e, ["avatarConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "avatarConfig"], b);
  const v = r(e, ["safetySettings"]);
  if (t !== void 0 && v != null) {
    let A = v;
    Array.isArray(A) && (A = A.map((P) => CS(P))), l(t, ["setup", "safetySettings"], A);
  }
  return n;
}
function gS(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], fS(o));
  const s = r(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const i = r(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = r(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const p = r(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Xr(f));
  const h = r(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], lS(ye(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let P = nn(y);
    Array.isArray(P) && (P = P.map((q) => RS(tn(q)))), l(t, ["setup", "tools"], P);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], _);
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], S);
  const T = r(e, ["outputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "outputAudioTranscription"], T);
  const C = r(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const L = r(e, ["proactivity"]);
  t !== void 0 && L != null && l(t, ["setup", "proactivity"], L);
  const b = r(e, ["explicitVadSignal"]);
  t !== void 0 && b != null && l(t, ["setup", "explicitVadSignal"], b);
  const v = r(e, ["avatarConfig"]);
  t !== void 0 && v != null && l(t, ["setup", "avatarConfig"], v);
  const A = r(e, ["safetySettings"]);
  if (t !== void 0 && A != null) {
    let P = A;
    Array.isArray(P) && (P = P.map((q) => q)), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function yS(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], te(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], mS(s, n)), n;
}
function _S(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], te(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], gS(s, n)), n;
}
function vS(e) {
  const t = {}, n = r(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function SS(e) {
  const t = {}, n = r(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function ES(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = np(n);
    Array.isArray(d) && (d = d.map((p) => es(p))), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], es(sp(o)));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], es(op(i)));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function TS(e) {
  const t = {}, n = r(e, ["media"]);
  if (n != null) {
    let d = np(n);
    Array.isArray(d) && (d = d.map((p) => p)), l(t, ["mediaChunks"], d);
  }
  const o = r(e, ["audio"]);
  o != null && l(t, ["audio"], sp(o));
  const s = r(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const i = r(e, ["video"]);
  i != null && l(t, ["video"], op(i));
  const a = r(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = r(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = r(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function wS(e) {
  const t = {}, n = r(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = r(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const s = r(e, ["toolCall"]);
  s != null && l(t, ["toolCall"], s);
  const i = r(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = r(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], PS(a));
  const u = r(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = r(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = r(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const p = r(e, ["voiceActivity"]);
  return p != null && l(t, ["voiceActivity"], MS(p)), t;
}
function bS(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], uS(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], cS(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], es(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = r(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function AS(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function CS(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function IS(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function xS(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], hS(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], pS(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = r(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function RS(e) {
  const t = {}, n = r(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = r(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], s);
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = r(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = r(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => dS(m))), l(t, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = r(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = r(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function PS(e) {
  const t = {}, n = r(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const o = r(e, ["cachedContentTokenCount"]);
  o != null && l(t, ["cachedContentTokenCount"], o);
  const s = r(e, ["candidatesTokenCount"]);
  s != null && l(t, ["responseTokenCount"], s);
  const i = r(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
  const a = r(e, ["thoughtsTokenCount"]);
  a != null && l(t, ["thoughtsTokenCount"], a);
  const u = r(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = r(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = r(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const p = r(e, ["candidatesTokensDetails"]);
  if (p != null) {
    let m = p;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = r(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const h = r(e, ["trafficType"]);
  return h != null && l(t, ["trafficType"], h), t;
}
function MS(e) {
  const t = {}, n = r(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function NS(e, t) {
  const n = {}, o = r(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function kS(e, t) {
  const n = {}, o = r(e, ["data"]);
  if (o != null && l(n, ["data"], o), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function LS(e, t) {
  const n = {}, o = r(e, ["content"]);
  o != null && l(n, ["content"], o);
  const s = r(e, ["citationMetadata"]);
  s != null && l(n, ["citationMetadata"], DS(s));
  const i = r(e, ["tokenCount"]);
  i != null && l(n, ["tokenCount"], i);
  const a = r(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const u = r(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = r(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = r(e, ["index"]);
  d != null && l(n, ["index"], d);
  const p = r(e, ["logprobsResult"]);
  p != null && l(n, ["logprobsResult"], p);
  const f = r(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const h = r(e, ["urlContextMetadata"]);
  return h != null && l(n, ["urlContextMetadata"], h), n;
}
function DS(e, t) {
  const n = {}, o = r(e, ["citationSources"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(n, ["citations"], s);
  }
  return n;
}
function $S(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let a = Me(i);
    Array.isArray(a) && (a = a.map((u) => sn(u))), l(o, ["contents"], a);
  }
  return o;
}
function US(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["tokensInfo"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function FS(e, t) {
  const n = {}, o = r(e, ["values"]);
  o != null && l(n, ["values"], o);
  const s = r(e, ["statistics"]);
  return s != null && l(n, ["statistics"], BS(s)), n;
}
function BS(e, t) {
  const n = {}, o = r(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const s = r(e, ["token_count"]);
  return s != null && l(n, ["tokenCount"], s), n;
}
function lo(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => zE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function sn(e, t) {
  const n = {}, o = r(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => YE(a))), l(n, ["parts"], i);
  }
  const s = r(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function GS(e, t) {
  const n = {}, o = r(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const s = r(e, ["enableControlImageComputation"]);
  return s != null && l(n, ["computeControl"], s), n;
}
function OS(e, t) {
  const n = {};
  if (r(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (r(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (r(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function qS(e, t, n) {
  const o = {}, s = r(e, ["systemInstruction"]);
  t !== void 0 && s != null && l(t, ["systemInstruction"], sn(ye(s)));
  const i = r(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Sp(c))), l(t, ["tools"], u);
  }
  const a = r(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], kE(a)), o;
}
function VS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Me(i);
    Array.isArray(u) && (u = u.map((c) => lo(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && OS(a), o;
}
function HS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Me(i);
    Array.isArray(u) && (u = u.map((c) => sn(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && qS(a, o), o;
}
function JS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  s != null && l(n, ["totalTokens"], s);
  const i = r(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function WS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["totalTokens"]);
  return s != null && l(n, ["totalTokens"], s), n;
}
function KS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], te(e, s)), o;
}
function zS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], te(e, s)), o;
}
function YS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function XS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function QS(e, t, n) {
  const o = {}, s = r(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const i = r(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = r(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = r(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = r(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = r(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const p = r(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const y = r(e, ["outputMimeType"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], y);
  const _ = r(e, ["outputCompressionQuality"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], _);
  const S = r(e, ["addWatermark"]);
  t !== void 0 && S != null && l(t, ["parameters", "addWatermark"], S);
  const T = r(e, ["labels"]);
  t !== void 0 && T != null && l(t, ["labels"], T);
  const C = r(e, ["editMode"]);
  t !== void 0 && C != null && l(t, ["parameters", "editMode"], C);
  const R = r(e, ["baseSteps"]);
  return t !== void 0 && R != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], R), o;
}
function ZS(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => tT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = r(t, ["config"]);
  return u != null && QS(u, o), o;
}
function jS(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Ls(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function eE(e, t, n) {
  const o = {}, s = r(e, ["taskType"]);
  t !== void 0 && s != null && l(t, ["requests[]", "taskType"], s);
  const i = r(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const a = r(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), r(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (r(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (r(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (r(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function tE(e, t, n) {
  const o = {};
  let s = r(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = r(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = r(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = r(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = r(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let a = r(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "PREDICT") {
    const f = r(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (a === "EMBED_CONTENT") {
    const f = r(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = r(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = r(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = r(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = r(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = r(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = r(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = r(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let p = r(n, ["embeddingApiType"]);
  if (p === void 0 && (p = "PREDICT"), p === "EMBED_CONTENT") {
    const f = r(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function nE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let d = Kr(e, i);
    Array.isArray(d) && (d = d.map((p) => p)), l(o, ["requests[]", "content"], d);
  }
  const a = r(t, ["content"]);
  a != null && lo(ye(a));
  const u = r(t, ["config"]);
  u != null && eE(u, o);
  const c = r(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], te(e, c)), o;
}
function oE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  let i = r(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = r(t, ["contents"]);
    if (c != null) {
      let d = Kr(e, c);
      Array.isArray(d) && (d = d.map((p) => p)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = r(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = r(t, ["content"]);
    c != null && l(o, ["content"], sn(ye(c)));
  }
  const u = r(t, ["config"]);
  return u != null && tE(u, o, n), o;
}
function sE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const i = r(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function iE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions[]", "embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => FS(u))), l(n, ["embeddings"], a);
  }
  const i = r(e, ["metadata"]);
  if (i != null && l(n, ["metadata"], i), t && r(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = r(e, ["embedding"]), u = r(e, ["usageMetadata"]), c = r(e, ["truncated"]);
    if (a) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function rE(e, t) {
  const n = {}, o = r(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["deployedModelId"]);
  return s != null && l(n, ["deployedModelId"], s), n;
}
function aE(e, t) {
  const n = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function lE(e, t) {
  const n = {}, o = r(e, ["id"]);
  o != null && l(n, ["id"], o);
  const s = r(e, ["args"]);
  s != null && l(n, ["args"], s);
  const i = r(e, ["name"]);
  if (i != null && l(n, ["name"], i), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function uE(e, t) {
  const n = {}, o = r(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const s = r(e, ["mode"]);
  if (s != null && l(n, ["mode"], s), r(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function cE(e, t) {
  const n = {}, o = r(e, ["description"]);
  o != null && l(n, ["description"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["parameters"]);
  i != null && l(n, ["parameters"], i);
  const a = r(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const u = r(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = r(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), r(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function dE(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], lo(ye(i)));
  const a = r(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = r(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const p = r(t, ["maxOutputTokens"]);
  p != null && l(s, ["maxOutputTokens"], p);
  const f = r(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const h = r(t, ["responseLogprobs"]);
  h != null && l(s, ["responseLogprobs"], h);
  const m = r(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const y = r(t, ["frequencyPenalty"]);
  y != null && l(s, ["frequencyPenalty"], y);
  const _ = r(t, ["seed"]);
  _ != null && l(s, ["seed"], _);
  const S = r(t, ["responseMimeType"]);
  S != null && l(s, ["responseMimeType"], S);
  const T = r(t, ["responseSchema"]);
  T != null && l(s, ["responseSchema"], zr(T));
  const C = r(t, ["responseJsonSchema"]);
  if (C != null && l(s, ["responseJsonSchema"], C), r(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (r(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = r(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let z = R;
    Array.isArray(z) && (z = z.map((ie) => nT(ie))), l(n, ["safetySettings"], z);
  }
  const L = r(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let z = nn(L);
    Array.isArray(z) && (z = z.map((ie) => cT(tn(ie)))), l(n, ["tools"], z);
  }
  const b = r(t, ["toolConfig"]);
  if (n !== void 0 && b != null && l(n, ["toolConfig"], lT(b)), r(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const v = r(t, ["cachedContent"]);
  n !== void 0 && v != null && l(n, ["cachedContent"], ct(e, v));
  const A = r(t, ["responseModalities"]);
  A != null && l(s, ["responseModalities"], A);
  const P = r(t, ["mediaResolution"]);
  P != null && l(s, ["mediaResolution"], P);
  const q = r(t, ["speechConfig"]);
  if (q != null && l(s, ["speechConfig"], Yr(q)), r(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const V = r(t, ["thinkingConfig"]);
  V != null && l(s, ["thinkingConfig"], V);
  const k = r(t, ["imageConfig"]);
  k != null && l(s, ["imageConfig"], FE(k));
  const D = r(t, ["enableEnhancedCivicAnswers"]);
  if (D != null && l(s, ["enableEnhancedCivicAnswers"], D), r(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const U = r(t, ["serviceTier"]);
  return n !== void 0 && U != null && l(n, ["serviceTier"], U), s;
}
function fE(e, t, n, o) {
  const s = {}, i = r(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], sn(ye(i)));
  const a = r(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = r(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = r(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = r(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const p = r(t, ["maxOutputTokens"]);
  p != null && l(s, ["maxOutputTokens"], p);
  const f = r(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const h = r(t, ["responseLogprobs"]);
  h != null && l(s, ["responseLogprobs"], h);
  const m = r(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = r(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const y = r(t, ["frequencyPenalty"]);
  y != null && l(s, ["frequencyPenalty"], y);
  const _ = r(t, ["seed"]);
  _ != null && l(s, ["seed"], _);
  const S = r(t, ["responseMimeType"]);
  S != null && l(s, ["responseMimeType"], S);
  const T = r(t, ["responseSchema"]);
  T != null && l(s, ["responseSchema"], zr(T));
  const C = r(t, ["responseJsonSchema"]);
  C != null && l(s, ["responseJsonSchema"], C);
  const R = r(t, ["routingConfig"]);
  R != null && l(s, ["routingConfig"], R);
  const L = r(t, ["modelSelectionConfig"]);
  L != null && l(s, ["modelConfig"], L);
  const b = r(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let _e = b;
    Array.isArray(_e) && (_e = _e.map((nt) => nt)), l(n, ["safetySettings"], _e);
  }
  const v = r(t, ["tools"]);
  if (n !== void 0 && v != null) {
    let _e = nn(v);
    Array.isArray(_e) && (_e = _e.map((nt) => Sp(tn(nt)))), l(n, ["tools"], _e);
  }
  const A = r(t, ["toolConfig"]);
  n !== void 0 && A != null && l(n, ["toolConfig"], uT(A));
  const P = r(t, ["labels"]);
  n !== void 0 && P != null && l(n, ["labels"], P);
  const q = r(t, ["cachedContent"]);
  n !== void 0 && q != null && l(n, ["cachedContent"], ct(e, q));
  const V = r(t, ["responseModalities"]);
  V != null && l(s, ["responseModalities"], V);
  const k = r(t, ["mediaResolution"]);
  k != null && l(s, ["mediaResolution"], k);
  const D = r(t, ["speechConfig"]);
  D != null && l(s, ["speechConfig"], Yr(D));
  const U = r(t, ["audioTimestamp"]);
  U != null && l(s, ["audioTimestamp"], U);
  const z = r(t, ["thinkingConfig"]);
  z != null && l(s, ["thinkingConfig"], z);
  const ie = r(t, ["imageConfig"]);
  if (ie != null && l(s, ["imageConfig"], BE(ie)), r(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const le = r(t, ["modelArmorConfig"]);
  n !== void 0 && le != null && l(n, ["modelArmorConfig"], le);
  const xe = r(t, ["serviceTier"]);
  return n !== void 0 && xe != null && l(n, ["serviceTier"], xe), s;
}
function Xu(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Me(i);
    Array.isArray(u) && (u = u.map((c) => lo(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], dE(e, a, o)), o;
}
function Qu(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["contents"]);
  if (i != null) {
    let u = Me(i);
    Array.isArray(u) && (u = u.map((c) => sn(c))), l(o, ["contents"], u);
  }
  const a = r(t, ["config"]);
  return a != null && l(o, ["generationConfig"], fE(e, a, o)), o;
}
function Zu(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => LS(f))), l(n, ["candidates"], p);
  }
  const i = r(e, ["modelVersion"]);
  i != null && l(n, ["modelVersion"], i);
  const a = r(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const u = r(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = r(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = r(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function ju(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => f)), l(n, ["candidates"], p);
  }
  const i = r(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const a = r(e, ["modelVersion"]);
  a != null && l(n, ["modelVersion"], a);
  const u = r(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = r(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = r(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function pE(e, t, n) {
  const o = {};
  if (r(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (r(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const s = r(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const i = r(e, ["aspectRatio"]);
  t !== void 0 && i != null && l(t, ["parameters", "aspectRatio"], i);
  const a = r(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), r(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = r(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = r(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const p = r(e, ["includeRaiReason"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeRaiReason"], p);
  const f = r(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const h = r(e, ["outputMimeType"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], h);
  const m = r(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), r(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = r(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), r(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return o;
}
function hE(e, t, n) {
  const o = {}, s = r(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const i = r(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = r(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = r(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = r(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = r(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const p = r(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = r(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
  const m = r(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = r(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const y = r(e, ["outputMimeType"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], y);
  const _ = r(e, ["outputCompressionQuality"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], _);
  const S = r(e, ["addWatermark"]);
  t !== void 0 && S != null && l(t, ["parameters", "addWatermark"], S);
  const T = r(e, ["labels"]);
  t !== void 0 && T != null && l(t, ["labels"], T);
  const C = r(e, ["imageSize"]);
  t !== void 0 && C != null && l(t, ["parameters", "sampleImageSize"], C);
  const R = r(e, ["enhancePrompt"]);
  return t !== void 0 && R != null && l(t, ["parameters", "enhancePrompt"], R), o;
}
function mE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && pE(a, o), o;
}
function gE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["config"]);
  return a != null && hE(a, o), o;
}
function yE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => RE(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], _p(i)), n;
}
function _E(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Ls(u))), l(n, ["generatedImages"], a);
  }
  const i = r(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], vp(i)), n;
}
function vE(e, t, n) {
  const o = {}, s = r(e, ["numberOfVideos"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s), r(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (r(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const i = r(e, ["durationSeconds"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "durationSeconds"], i), r(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = r(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const u = r(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = r(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), r(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = r(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const p = r(e, ["enhancePrompt"]);
  if (t !== void 0 && p != null && l(t, ["parameters", "enhancePrompt"], p), r(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = r(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Ds(f));
  const h = r(e, ["referenceImages"]);
  if (t !== void 0 && h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((y) => wT(y))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (r(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (r(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = r(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function SE(e, t, n) {
  const o = {}, s = r(e, ["numberOfVideos"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const i = r(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const a = r(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const u = r(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = r(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = r(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const p = r(e, ["resolution"]);
  t !== void 0 && p != null && l(t, ["parameters", "resolution"], p);
  const f = r(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = r(e, ["pubsubTopic"]);
  t !== void 0 && h != null && l(t, ["parameters", "pubsubTopic"], h);
  const m = r(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = r(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const y = r(e, ["generateAudio"]);
  t !== void 0 && y != null && l(t, ["parameters", "generateAudio"], y);
  const _ = r(e, ["lastFrame"]);
  t !== void 0 && _ != null && l(t, ["instances[0]", "lastFrame"], Xe(_));
  const S = r(e, ["referenceImages"]);
  if (t !== void 0 && S != null) {
    let L = S;
    Array.isArray(L) && (L = L.map((b) => bT(b))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const T = r(e, ["mask"]);
  t !== void 0 && T != null && l(t, ["instances[0]", "mask"], TT(T));
  const C = r(e, ["compressionQuality"]);
  t !== void 0 && C != null && l(t, ["parameters", "compressionQuality"], C);
  const R = r(e, ["labels"]);
  if (t !== void 0 && R != null && l(t, ["labels"], R), r(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function EE(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], AE(u)), n;
}
function TE(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const i = r(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = r(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = r(e, ["response"]);
  return u != null && l(n, ["response"], CE(u)), n;
}
function wE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Ds(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Ep(u));
  const c = r(t, ["source"]);
  c != null && IE(c, o);
  const d = r(t, ["config"]);
  return d != null && vE(d, o), o;
}
function bE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = r(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Xe(a));
  const u = r(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Tp(u));
  const c = r(t, ["source"]);
  c != null && xE(c, o);
  const d = r(t, ["config"]);
  return d != null && SE(d, o), o;
}
function AE(e, t) {
  const n = {}, o = r(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => ME(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function CE(e, t) {
  const n = {}, o = r(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => NE(u))), l(n, ["generatedVideos"], a);
  }
  const s = r(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const i = r(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function IE(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ds(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Ep(a)), o;
}
function xE(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Xe(i));
  const a = r(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Tp(a)), o;
}
function RE(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], GE(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], _p(i)), n;
}
function Ls(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["image"], yp(o));
  const s = r(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const i = r(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], vp(i));
  const a = r(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function PE(e, t) {
  const n = {}, o = r(e, ["_self"]);
  o != null && l(n, ["mask"], yp(o));
  const s = r(e, ["labels"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function ME(e, t) {
  const n = {}, o = r(e, ["video"]);
  return o != null && l(n, ["video"], ST(o)), n;
}
function NE(e, t) {
  const n = {}, o = r(e, ["_self"]);
  return o != null && l(n, ["video"], ET(o)), n;
}
function kE(e, t) {
  const n = {}, o = r(e, ["modelSelectionConfig"]);
  o != null && l(n, ["modelConfig"], o);
  const s = r(e, ["responseJsonSchema"]);
  s != null && l(n, ["responseJsonSchema"], s);
  const i = r(e, ["audioTimestamp"]);
  i != null && l(n, ["audioTimestamp"], i);
  const a = r(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const u = r(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = r(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = r(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const p = r(e, ["maxOutputTokens"]);
  p != null && l(n, ["maxOutputTokens"], p);
  const f = r(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const h = r(e, ["presencePenalty"]);
  h != null && l(n, ["presencePenalty"], h);
  const m = r(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = r(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const y = r(e, ["responseModalities"]);
  y != null && l(n, ["responseModalities"], y);
  const _ = r(e, ["responseSchema"]);
  _ != null && l(n, ["responseSchema"], _);
  const S = r(e, ["routingConfig"]);
  S != null && l(n, ["routingConfig"], S);
  const T = r(e, ["seed"]);
  T != null && l(n, ["seed"], T);
  const C = r(e, ["speechConfig"]);
  C != null && l(n, ["speechConfig"], C);
  const R = r(e, ["stopSequences"]);
  R != null && l(n, ["stopSequences"], R);
  const L = r(e, ["temperature"]);
  L != null && l(n, ["temperature"], L);
  const b = r(e, ["thinkingConfig"]);
  b != null && l(n, ["thinkingConfig"], b);
  const v = r(e, ["topK"]);
  v != null && l(n, ["topK"], v);
  const A = r(e, ["topP"]);
  if (A != null && l(n, ["topP"], A), r(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function LE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], te(e, s)), o;
}
function DE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  return s != null && l(o, ["_url", "name"], te(e, s)), o;
}
function $E(e, t) {
  const n = {}, o = r(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], NS(o));
  const s = r(e, ["enableWidget"]);
  return s != null && l(n, ["enableWidget"], s), n;
}
function UE(e, t) {
  const n = {}, o = r(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const s = r(e, ["timeRangeFilter"]);
  return s != null && l(n, ["timeRangeFilter"], s), n;
}
function FE(e, t) {
  const n = {}, o = r(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const s = r(e, ["imageSize"]);
  if (s != null && l(n, ["imageSize"], s), r(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (r(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (r(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (r(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (r(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function BE(e, t) {
  const n = {}, o = r(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const s = r(e, ["imageSize"]);
  s != null && l(n, ["imageSize"], s);
  const i = r(e, ["personGeneration"]);
  i != null && l(n, ["personGeneration"], i);
  const a = r(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const u = r(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = r(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = r(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function GE(e, t) {
  const n = {}, o = r(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], vt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function yp(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["imageBytes"], vt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Ds(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = r(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], vt(o));
  const s = r(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Xe(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["imageBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], vt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function OE(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], lp(e, c)), s;
}
function qE(e, t, n, o) {
  const s = {}, i = r(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = r(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = r(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = r(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], lp(e, c)), s;
}
function VE(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && OE(e, s, o), o;
}
function HE(e, t, n) {
  const o = {}, s = r(t, ["config"]);
  return s != null && qE(e, s, o), o;
}
function JE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = up(i);
    Array.isArray(a) && (a = a.map((u) => nr(u))), l(n, ["models"], a);
  }
  return n;
}
function WE(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["_self"]);
  if (i != null) {
    let a = up(i);
    Array.isArray(a) && (a = a.map((u) => or(u))), l(n, ["models"], a);
  }
  return n;
}
function KE(e, t) {
  const n = {}, o = r(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const s = r(e, ["segmentationClasses"]);
  s != null && l(n, ["maskClasses"], s);
  const i = r(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function nr(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const i = r(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = r(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = r(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], dT(u));
  const c = r(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = r(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const p = r(e, ["supportedGenerationMethods"]);
  p != null && l(n, ["supportedActions"], p);
  const f = r(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const h = r(e, ["maxTemperature"]);
  h != null && l(n, ["maxTemperature"], h);
  const m = r(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = r(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const y = r(e, ["thinking"]);
  return y != null && l(n, ["thinking"], y), n;
}
function or(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = r(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const i = r(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = r(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = r(e, ["deployedModels"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((m) => rE(m))), l(n, ["endpoints"], h);
  }
  const c = r(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = r(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], fT(d));
  const p = r(e, ["defaultCheckpointId"]);
  p != null && l(n, ["defaultCheckpointId"], p);
  const f = r(e, ["checkpoints"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["checkpoints"], h);
  }
  return n;
}
function zE(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = r(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const i = r(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = r(e, ["fileData"]);
  a != null && l(n, ["fileData"], aE(a));
  const u = r(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], lE(u));
  const c = r(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], kS(d));
  const p = r(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = r(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = r(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = r(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = r(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const y = r(e, ["toolResponse"]);
  y != null && l(n, ["toolResponse"], y);
  const _ = r(e, ["partMetadata"]);
  return _ != null && l(n, ["partMetadata"], _), n;
}
function YE(e, t) {
  const n = {}, o = r(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = r(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const i = r(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = r(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const u = r(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = r(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = r(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const p = r(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = r(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = r(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = r(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), r(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (r(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (r(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function XE(e, t) {
  const n = {}, o = r(e, ["productImage"]);
  return o != null && l(n, ["image"], Xe(o)), n;
}
function QE(e, t, n) {
  const o = {}, s = r(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const i = r(e, ["baseSteps"]);
  t !== void 0 && i != null && l(t, ["parameters", "baseSteps"], i);
  const a = r(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const u = r(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = r(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = r(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const p = r(e, ["addWatermark"]);
  t !== void 0 && p != null && l(t, ["parameters", "addWatermark"], p);
  const f = r(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const h = r(e, ["outputCompressionQuality"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], h);
  const m = r(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = r(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function ZE(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["source"]);
  i != null && eT(i, o);
  const a = r(t, ["config"]);
  return a != null && QE(a, o), o;
}
function jE(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => Ls(i))), l(n, ["generatedImages"], s);
  }
  return n;
}
function eT(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Xe(i));
  const a = r(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => XE(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function tT(e, t) {
  const n = {}, o = r(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Xe(o));
  const s = r(e, ["referenceId"]);
  s != null && l(n, ["referenceId"], s);
  const i = r(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = r(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], KE(a));
  const u = r(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], GS(u));
  const c = r(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = r(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function _p(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function vp(e, t) {
  const n = {}, o = r(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = r(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const i = r(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function nT(e, t) {
  const n = {}, o = r(e, ["category"]);
  if (o != null && l(n, ["category"], o), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const s = r(e, ["threshold"]);
  return s != null && l(n, ["threshold"], s), n;
}
function oT(e, t) {
  const n = {}, o = r(e, ["image"]);
  return o != null && l(n, ["image"], Xe(o)), n;
}
function sT(e, t, n) {
  const o = {}, s = r(e, ["mode"]);
  t !== void 0 && s != null && l(t, ["parameters", "mode"], s);
  const i = r(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const a = r(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = r(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = r(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = r(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), o;
}
function iT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["source"]);
  i != null && aT(i, o);
  const a = r(t, ["config"]);
  return a != null && sT(a, o), o;
}
function rT(e, t) {
  const n = {}, o = r(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => PE(i))), l(n, ["generatedMasks"], s);
  }
  return n;
}
function aT(e, t, n) {
  const o = {}, s = r(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const i = r(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Xe(i));
  const a = r(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], oT(a)), o;
}
function lT(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  s != null && l(n, ["functionCallingConfig"], uE(s));
  const i = r(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function uT(e, t) {
  const n = {}, o = r(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = r(e, ["functionCallingConfig"]);
  if (s != null && l(n, ["functionCallingConfig"], s), r(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function cT(e, t) {
  const n = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = r(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const s = r(e, ["fileSearch"]);
  s != null && l(n, ["fileSearch"], s);
  const i = r(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], UE(i));
  const a = r(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], $E(a));
  const u = r(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = r(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["functionDeclarations"], h);
  }
  const d = r(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const p = r(e, ["urlContext"]);
  p != null && l(n, ["urlContext"], p);
  const f = r(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["mcpServers"], h);
  }
  return n;
}
function Sp(e, t) {
  const n = {}, o = r(e, ["retrieval"]);
  o != null && l(n, ["retrieval"], o);
  const s = r(e, ["computerUse"]);
  if (s != null && l(n, ["computerUse"], s), r(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = r(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], i);
  const a = r(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const u = r(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = r(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = r(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => cE(g))), l(n, ["functionDeclarations"], m);
  }
  const p = r(e, ["googleSearchRetrieval"]);
  p != null && l(n, ["googleSearchRetrieval"], p);
  const f = r(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const h = r(e, ["urlContext"]);
  if (h != null && l(n, ["urlContext"], h), r(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function dT(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function fT(e, t) {
  const n = {}, o = r(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const i = r(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function pT(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function hT(e, t, n) {
  const o = {}, s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = r(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function mT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "name"], te(e, s));
  const i = r(t, ["config"]);
  return i != null && pT(i, o), o;
}
function gT(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["config"]);
  return i != null && hT(i, o), o;
}
function yT(e, t, n) {
  const o = {}, s = r(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const i = r(e, ["safetyFilterLevel"]);
  t !== void 0 && i != null && l(t, ["parameters", "safetySetting"], i);
  const a = r(e, ["personGeneration"]);
  t !== void 0 && a != null && l(t, ["parameters", "personGeneration"], a);
  const u = r(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = r(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = r(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const p = r(e, ["enhanceInputImage"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], p);
  const f = r(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const h = r(e, ["labels"]);
  t !== void 0 && h != null && l(t, ["labels"], h);
  const m = r(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = r(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function _T(e, t, n) {
  const o = {}, s = r(t, ["model"]);
  s != null && l(o, ["_url", "model"], te(e, s));
  const i = r(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Xe(i));
  const a = r(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = r(t, ["config"]);
  return u != null && yT(u, o), o;
}
function vT(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["predictions"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => Ls(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function ST(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["encodedVideo"]);
  s != null && l(n, ["videoBytes"], vt(s));
  const i = r(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function ET(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["videoBytes"], vt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function TT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["_self"], Xe(o));
  const s = r(e, ["maskMode"]);
  return s != null && l(n, ["maskMode"], s), n;
}
function wT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], Ds(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function bT(e, t) {
  const n = {}, o = r(e, ["image"]);
  o != null && l(n, ["image"], Xe(o));
  const s = r(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function Ep(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["encodedVideo"], vt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Tp(e, t) {
  const n = {}, o = r(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = r(e, ["videoBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], vt(s));
  const i = r(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function AT(e, t) {
  const n = {}, o = r(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function CT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && AT(n, t), t;
}
function IT(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function xT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && IT(o, t), t;
}
function RT(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function PT(e, t) {
  const n = {}, o = r(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const s = r(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function MT(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = r(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = r(e, ["done"]);
  s != null && l(t, ["done"], s);
  const i = r(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = r(e, ["response"]);
  return a != null && l(t, ["response"], kT(a)), t;
}
function NT(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const s = r(e, ["config"]);
  return s != null && PT(s, t), t;
}
function kT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = r(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function LT(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function DT(e) {
  const t = {}, n = r(e, ["config"]);
  return n != null && LT(n, t), t;
}
function $T(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["fileSearchStores"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function wp(e, t) {
  const n = {}, o = r(e, ["mimeType"]);
  t !== void 0 && o != null && l(t, ["mimeType"], o);
  const s = r(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const i = r(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = r(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function UT(e) {
  const t = {}, n = r(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = r(e, ["config"]);
  return o != null && wp(o, t), t;
}
function FT(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var BT = "Content-Type", GT = "X-Server-Timeout", OT = "User-Agent", sr = "x-goog-api-client", qT = "google-genai-sdk/1.50.1", VT = "v1beta1", HT = "v1beta", JT = /* @__PURE__ */ new Set(["us", "eu"]), WT = 5, KT = [
  408,
  429,
  500,
  502,
  503,
  504
], zT = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const s = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (s.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? s.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && JT.has(this.clientOptions.location) ? s.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (s.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), s.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : VT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), s.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : HT, s.baseUrl = "https://generativelanguage.googleapis.com/";
    s.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = s, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(s, e.httpOptions));
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
    const o = [this.getRequestUrlInternal(t)];
    return n && o.push(this.getBaseResourcePath()), e !== "" && o.push(e), new URL(`${o.join("/")}`);
  }
  shouldPrependVertexProjectPath(e, t) {
    return !(t.baseUrl && t.baseUrlResourceScope === Zi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, a] of Object.entries(e.queryParams)) o.searchParams.append(i, String(a));
    let s = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else s.body = e.body;
    return s = await this.includeExtraHttpOptionsToRequestInit(s, t, o.toString(), e.abortSignal), this.unaryApiCall(o, s, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [o, s] of Object.entries(t)) typeof s == "object" ? n[o] = Object.assign(Object.assign({}, n[o]), s) : s !== void 0 && (n[o] = s);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    (!o.searchParams.has("alt") || o.searchParams.get("alt") !== "sse") && o.searchParams.set("alt", "sse");
    let s = {};
    return s.body = e.body, s = await this.includeExtraHttpOptionsToRequestInit(s, t, o.toString(), e.abortSignal), this.streamApiCall(o, s, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, o) {
    if (t && t.timeout || o) {
      const s = new AbortController(), i = s.signal;
      if (t.timeout && t?.timeout > 0) {
        const a = setTimeout(() => s.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      o && o.addEventListener("abort", () => {
        s.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && YT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await ec(o), new ji(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await ec(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return ze(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), s = new TextDecoder("utf-8");
      if (!o) throw new Error("Response body is empty");
      try {
        let i = "";
        const a = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield Z(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const p = s.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(p);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), y = g.status, _ = g.code, S = `got status: ${y}. ${JSON.stringify(m)}`;
              if (_ >= 400 && _ < 600) throw new mp({
                message: S,
                status: _
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          i += p;
          let f = -1, h = 0;
          for (; ; ) {
            f = -1, h = 0;
            for (const y of u) {
              const _ = i.indexOf(y);
              _ !== -1 && (f === -1 || _ < f) && (f = _, h = y.length);
            }
            if (f === -1) break;
            const m = i.substring(0, f);
            i = i.substring(f + h);
            const g = m.trim();
            if (g.startsWith(a)) {
              const y = g.substring(5).trim();
              try {
                yield yield Z(new ji(new Response(y, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (_) {
                throw new Error(`exception parsing stream chunk ${y}. ${_}`);
              }
            }
          }
        }
      } finally {
        o.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    var n;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) return fetch(e, t);
    const o = this.clientOptions.httpOptions.retryOptions, s = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw KT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Cl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Cl.default)(s, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : WT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = qT + " " + this.clientOptions.userAgentExtra;
    return e[OT] = t, e[sr] = t, e[BT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, s] of Object.entries(e.headers)) n.append(o, s);
      e.timeout && e.timeout > 0 && n.append(GT, String(Math.ceil(e.timeout / 1e3)));
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
    const o = {};
    t != null && (o.mimeType = t.mimeType, o.name = t.name, o.displayName = t.displayName), o.name && !o.name.startsWith("files/") && (o.name = `files/${o.name}`);
    const s = this.clientOptions.uploader, i = await s.stat(e);
    o.sizeBytes = String(i.size);
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = a;
    const u = { file: o }, c = this.getFileName(e), d = B("upload/v1beta/files", u._url), p = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return s.upload(e, p, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const s = this.clientOptions.uploader, i = await s.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), p = {};
    n != null && wp(n, p);
    const f = await this.fetchUploadUrl(c, a, u, d, p, n?.httpOptions);
    return s.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, s, i) {
    var a;
    let u = {};
    i ? u = i : u = {
      apiVersion: "",
      headers: Object.assign({
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": `${t}`,
        "X-Goog-Upload-Header-Content-Type": `${n}`
      }, o ? { "X-Goog-Upload-File-Name": o } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(s),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function ec(e) {
  var t;
  if (e === void 0) throw new Error("response is undefined");
  if (!e.ok) {
    const n = e.status;
    let o;
    !((t = e.headers.get("content-type")) === null || t === void 0) && t.includes("application/json") ? o = await e.json() : o = { error: {
      message: await e.text(),
      code: e.status,
      status: e.statusText
    } };
    const s = JSON.stringify(o);
    throw n >= 400 && n < 600 ? new mp({
      message: s,
      status: n
    }) : new Error(s);
  }
}
function YT(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const i = JSON.parse(e.body);
    if (typeof i == "object" && i !== null && !Array.isArray(i)) n = i;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function o(i, a) {
    const u = Object.assign({}, i);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], p = u[c];
      d && typeof d == "object" && !Array.isArray(d) && p && typeof p == "object" && !Array.isArray(p) ? u[c] = o(p, d) : (p && d && typeof p != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof p}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const s = o(n, t);
  e.body = JSON.stringify(s);
}
var XT = "mcp_used/unknown", QT = !1;
function bp(e) {
  for (const t of e)
    if (ZT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return QT;
}
function Ap(e) {
  var t;
  e[sr] = (((t = e[sr]) !== null && t !== void 0 ? t : "") + ` ${XT}`).trimStart();
}
function ZT(e) {
  return e !== null && typeof e == "object" && e instanceof ew;
}
function jT(e) {
  return ze(this, arguments, function* (n, o = 100) {
    let s, i = 0;
    for (; i < o; ) {
      const a = yield Z(n.listTools({ cursor: s }));
      for (const u of a.tools)
        yield yield Z(u), i++;
      if (!a.nextCursor) break;
      s = a.nextCursor;
    }
  });
}
var ew = class Cp {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Cp(t, n);
  }
  async initialize() {
    var t, n, o, s;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const p of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ye(jT(p))), d; d = await c.next(), t = d.done, !t; u = !0) {
        s = d.value, u = !1;
        const f = s;
        a.push(f);
        const h = f.name;
        if (i[h]) throw new Error(`Duplicate function name ${h} found in MCP tools. Please ensure function names are unique.`);
        i[h] = p;
      }
    } catch (f) {
      n = { error: f };
    } finally {
      try {
        !u && !t && (o = c.return) && await o.call(c);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = a, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), h_(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const s = this.functionNameToMcpClient[o.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const a = await s.callTool({
        name: o.name,
        arguments: o.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: o.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function tw(e, t, n) {
  const o = new i_();
  let s;
  n.data instanceof Blob ? s = JSON.parse(await n.data.text()) : s = JSON.parse(n.data), Object.assign(o, s), t(o);
}
var nw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), s = this.apiClient.getApiVersion(), i = iw(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((y) => {
      u = y;
    }), d = e.callbacks, p = function() {
      u({});
    }, f = this.apiClient, h = {
      onopen: p,
      onmessage: (y) => {
        tw(f, d.onmessage, y);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(y) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(y) {
      }
    }, m = this.webSocketFactory.create(a, sw(i), h);
    m.connect(), await c;
    const g = { setup: { model: te(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new ow(m, this.apiClient);
  }
}, ow = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = SS(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = vS(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Kt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Kt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Kt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Kt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function sw(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function iw(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var rw = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function aw(e, t, n) {
  const o = new s_();
  let s;
  n.data instanceof Blob ? s = await n.data.text() : n.data instanceof ArrayBuffer ? s = new TextDecoder().decode(n.data) : s = n.data;
  const i = JSON.parse(s);
  if (e.isVertexAI()) {
    const a = wS(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var lw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new nw(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, s, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && bp(e.config.tools) && Ap(p);
    const f = fw(p);
    if (this.apiClient.isVertexAI()) {
      const A = this.apiClient.getProject(), P = this.apiClient.getLocation(), q = this.apiClient.getApiKey(), V = !!A && !!P || !!q;
      this.apiClient.getCustomBaseUrl() && !V ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const A = this.apiClient.getApiKey();
      let P = "BidiGenerateContent", q = "key";
      A?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), P = "BidiGenerateContentConstrained", q = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${P}?${q}=${A}`;
    }
    let h = () => {
    };
    const m = new Promise((A) => {
      h = A;
    }), g = e.callbacks, y = function() {
      var A;
      (A = g?.onopen) === null || A === void 0 || A.call(g), h({});
    }, _ = this.apiClient, S = {
      onopen: y,
      onmessage: (A) => {
        aw(_, g.onmessage, A);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(A) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(A) {
      }
    }, T = this.webSocketFactory.create(d, dw(f), S);
    T.connect(), await m;
    let C = te(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && C.startsWith("publishers/")) {
      const A = this.apiClient.getProject(), P = this.apiClient.getLocation();
      A && P && (C = `projects/${A}/locations/${P}/` + C);
    }
    let R = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ps.AUDIO] } : e.config.responseModalities = [ps.AUDIO]), !((s = e.config) === null || s === void 0) && s.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const L = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], b = [];
    for (const A of L) if (this.isCallableTool(A)) {
      const P = A;
      b.push(await P.tool());
    } else b.push(A);
    b.length > 0 && (e.config.tools = b);
    const v = {
      model: C,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? R = _S(this.apiClient, v) : R = yS(this.apiClient, v), delete R.config, T.send(JSON.stringify(R)), new cw(T, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, uw = { turnComplete: !0 }, cw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Me(t.turns), e.isVertexAI() || (n = n.map((o) => lo(o)));
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
    for (const o of n) {
      if (typeof o != "object" || o === null || !("name" in o) || !("response" in o)) throw new Error(`Could not parse function response, type '${typeof o}'.`);
      if (!e.isVertexAI() && !("id" in o)) throw new Error(rw);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, uw), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: TS(e) } : t = { realtimeInput: ES(e) }, this.conn.send(JSON.stringify(t));
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
function dw(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function fw(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var tc = 10;
function nc(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let s = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Qt(a)) {
    s = !0;
    break;
  }
  if (!s) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Qt(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function pw(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((s) => Qt(s))) !== null && o !== void 0 ? o : !1;
}
function oc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, s) => {
    if (Qt(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(s);
  }), n;
}
function sc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var hw = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Me(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Me(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: hs.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: hs.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, s, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !pw(t) || nc(t.config)) return await this.generateContentInternal(u);
      const c = oc(t);
      if (c.length > 0) {
        const g = c.map((y) => `tools[${y}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, p;
      const f = Me(u.contents), h = (s = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && s !== void 0 ? s : tc;
      let m = 0;
      for (; m < h && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const _ of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (Qt(_)) {
          const S = await _.callTool(d.functionCalls);
          y.push(...S);
        }
        m++, p = {
          role: "user",
          parts: y
        }, u.contents = Me(u.contents), u.contents.push(g), u.contents.push(p), sc(u.config) && (f.push(g), f.push(p));
      }
      return sc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, s, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), nc(t.config)) {
        const p = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(p);
      }
      const u = oc(t);
      if (u.length > 0) {
        const p = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${p}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (s = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || s === void 0 ? void 0 : s.streamFunctionCallArguments, d = (a = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let s;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? s = u?.safetyAttributes : i.push(u);
      let a;
      return s ? a = {
        generatedImages: i,
        positivePromptSafetyAttributes: s,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const o = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !o.config.queryBase) {
        if (!((n = o.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        o.config.filter = "labels.tune-type:*";
      }
      return new Nt(lt.PAGED_ITEM_MODELS, (s) => this.listInternal(s), await this.listInternal(o), o);
    }, this.editImage = async (t) => {
      const n = {
        model: t.model,
        prompt: t.prompt,
        referenceImages: [],
        config: t.config
      };
      return t.referenceImages && t.referenceImages && (n.referenceImages = t.referenceImages.map((o) => o.toReferenceImageAPI())), await this.editImageInternal(n);
    }, this.upscaleImage = async (t) => {
      let n = {
        numberOfImages: 1,
        mode: "upscale"
      };
      t.config && (n = Object.assign(Object.assign({}, n), t.config));
      const o = {
        model: t.model,
        image: t.image,
        upscaleFactor: t.upscaleFactor,
        config: n
      };
      return await this.upscaleImageInternal(o);
    }, this.generateVideos = async (t) => {
      var n, o, s, i, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (s = t.source) === null || s === void 0 ? void 0 : s.video) === null || i === void 0) && i.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
        uri: t.source.video.uri,
        mimeType: t.source.video.mimeType
      })), await this.generateVideosInternal(t);
    };
  }
  maybeMoveToResponseJsonSchem(e) {
    e.config && e.config.responseSchema && (e.config.responseJsonSchema || Object.keys(e.config.responseSchema).includes("$schema") && (e.config.responseJsonSchema = e.config.responseSchema, delete e.config.responseSchema));
  }
  async processParamsMaybeAddMcpUsage(e) {
    var t, n, o;
    const s = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!s) return e;
    const i = await Promise.all(s.map(async (u) => Qt(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && bp(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Ap(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const s = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Qt(i)) {
      const a = i, u = await a.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (s.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        s.set(c.name, a);
      }
    }
    return s;
  }
  async processAfcStream(e) {
    var t, n, o;
    const s = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : tc;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, p) {
      return ze(this, arguments, function* () {
        for (var f, h, m, g, y, _; a < s; ) {
          i && (a++, i = !1);
          const R = yield Z(c.processParamsMaybeAddMcpUsage(p)), L = yield Z(c.generateContentStreamInternal(R)), b = [], v = [];
          try {
            for (var S = !0, T = (h = void 0, Ye(L)), C; C = yield Z(T.next()), f = C.done, !f; S = !0) {
              g = C.value, S = !1;
              const A = g;
              if (yield yield Z(A), A.candidates && (!((y = A.candidates[0]) === null || y === void 0) && y.content)) {
                v.push(A.candidates[0].content);
                for (const P of (_ = A.candidates[0].content.parts) !== null && _ !== void 0 ? _ : []) if (a < s && P.functionCall) {
                  if (!P.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(P.functionCall.name)) {
                    const q = yield Z(d.get(P.functionCall.name).callTool([P.functionCall]));
                    b.push(...q);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${P.functionCall.name}`);
                }
              }
            }
          } catch (A) {
            h = { error: A };
          } finally {
            try {
              !S && !f && (m = T.return) && (yield Z(m.call(T)));
            } finally {
              if (h) throw h.error;
            }
          }
          if (b.length > 0) {
            i = !0;
            const A = new Cn();
            A.candidates = [{ content: {
              role: "user",
              parts: b
            } }], yield yield Z(A);
            const P = [];
            P.push(...v), P.push({
              role: "user",
              parts: b
            }), p.contents = Me(p.contents).concat(P);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Qu(this.apiClient, e);
      return a = B("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = ju(d), f = new Cn();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Xu(this.apiClient, e);
      return a = B("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = Zu(d), f = new Cn();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Qu(this.apiClient, e);
      return a = B("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return ze(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = Ye(d), _; _ = yield Z(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const S = m, T = ju(yield Z(S.json()), e);
              T.sdkHttpResponse = { headers: S.headers };
              const C = new Cn();
              Object.assign(C, T), yield yield Z(C);
            }
          } catch (S) {
            f = { error: S };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield Z(h.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Xu(this.apiClient, e);
      return a = B("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }), i.then(function(d) {
        return ze(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, y = Ye(d), _; _ = yield Z(y.next()), p = _.done, !p; g = !0) {
              m = _.value, g = !1;
              const S = m, T = Zu(yield Z(S.json()), e);
              T.sdkHttpResponse = { headers: S.headers };
              const C = new Cn();
              Object.assign(C, T), yield yield Z(C);
            }
          } catch (S) {
            f = { error: S };
          } finally {
            try {
              !g && !p && (h = y.return) && (yield Z(h.call(y)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = oE(this.apiClient, e, e);
      return a = B(g_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = iE(d, e), f = new Pu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = nE(this.apiClient, e);
      return a = B("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = sE(d), f = new Pu();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gE(this.apiClient, e);
      return a = B("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = _E(d), f = new Mu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = mE(this.apiClient, e);
      return a = B("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = yE(d), f = new Mu();
        return Object.assign(f, p), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ZS(this.apiClient, e);
      return s = B("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = jS(u), d = new Jy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = _T(this.apiClient, e);
      return s = B("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = vT(u), d = new Wy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ZE(this.apiClient, e);
      return s = B("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = jE(u), d = new Ky();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = iT(this.apiClient, e);
      return s = B("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = rT(u), d = new zy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DE(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => or(d));
    } else {
      const c = LE(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => nr(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = HE(this.apiClient, e);
      return a = B("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = WE(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = VE(this.apiClient, e);
      return a = B("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = JE(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gT(this.apiClient, e);
      return a = B("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => or(d));
    } else {
      const c = mT(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => nr(d));
    }
  }
  async delete(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zS(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = XS(d), f = new ku();
        return Object.assign(f, p), f;
      });
    } else {
      const c = KS(this.apiClient, e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = YS(d), f = new ku();
        return Object.assign(f, p), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = HS(this.apiClient, e);
      return a = B("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = WS(d), f = new Lu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = VS(this.apiClient, e);
      return a = B("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = JS(d), f = new Lu();
        return Object.assign(f, p), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = $S(this.apiClient, e);
      return s = B("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = US(u), d = new Yy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bE(this.apiClient, e);
      return a = B("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = TE(d), f = new Du();
        return Object.assign(f, p), f;
      });
    } else {
      const c = wE(this.apiClient, e);
      return a = B("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const p = EE(d), f = new Du();
        return Object.assign(f, p), f;
      });
    }
  }
}, mw = class extends ut {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let s;
      n && "httpOptions" in n && (s = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: s }
      });
      return t._fromAPIResponse({
        apiResponse: i,
        _isVertexAI: !0
      });
    } else {
      const o = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !1
      });
    }
  }
  async get(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let s;
      n && "httpOptions" in n && (s = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: s }
      });
      return t._fromAPIResponse({
        apiResponse: i,
        _isVertexAI: !0
      });
    } else {
      const o = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !1
      });
    }
  }
  async getVideosOperationInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = By(e);
      return a = B("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = Fy(e);
      return a = B("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), i;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = My(e);
      return s = B("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function ic(e) {
  const t = {};
  if (r(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function gw(e) {
  const t = {}, n = r(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), r(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (r(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (r(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (r(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (r(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function yw(e) {
  const t = {}, n = r(e, ["data"]);
  if (n != null && l(t, ["data"], n), r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function _w(e) {
  const t = {}, n = r(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((i) => Iw(i))), l(t, ["parts"], s);
  }
  const o = r(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function vw(e, t, n) {
  const o = {}, s = r(t, ["expireTime"]);
  n !== void 0 && s != null && l(n, ["expireTime"], s);
  const i = r(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = r(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = r(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], Cw(e, u));
  const c = r(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function Sw(e, t) {
  const n = {}, o = r(t, ["config"]);
  return o != null && l(n, ["config"], vw(e, o, n)), n;
}
function Ew(e) {
  const t = {};
  if (r(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = r(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = r(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Tw(e) {
  const t = {}, n = r(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = r(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = r(e, ["name"]);
  if (s != null && l(t, ["name"], s), r(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (r(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function ww(e) {
  const t = {}, n = r(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], gw(n));
  const o = r(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function bw(e) {
  const t = {}, n = r(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), r(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (r(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = r(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Aw(e, t) {
  const n = {}, o = r(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const s = r(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const i = r(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = r(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = r(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = r(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = r(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const p = r(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = r(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Xr(f));
  const h = r(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = r(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = r(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], _w(ye(g)));
  const y = r(e, ["tools"]);
  if (t !== void 0 && y != null) {
    let A = nn(y);
    Array.isArray(A) && (A = A.map((P) => Pw(tn(P)))), l(t, ["setup", "tools"], A);
  }
  const _ = r(e, ["sessionResumption"]);
  t !== void 0 && _ != null && l(t, ["setup", "sessionResumption"], Rw(_));
  const S = r(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], ic(S));
  const T = r(e, ["outputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "outputAudioTranscription"], ic(T));
  const C = r(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const R = r(e, ["contextWindowCompression"]);
  t !== void 0 && R != null && l(t, ["setup", "contextWindowCompression"], R);
  const L = r(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), r(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const b = r(e, ["avatarConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "avatarConfig"], b);
  const v = r(e, ["safetySettings"]);
  if (t !== void 0 && v != null) {
    let A = v;
    Array.isArray(A) && (A = A.map((P) => xw(P))), l(t, ["setup", "safetySettings"], A);
  }
  return n;
}
function Cw(e, t) {
  const n = {}, o = r(t, ["model"]);
  o != null && l(n, ["setup", "model"], te(e, o));
  const s = r(t, ["config"]);
  return s != null && l(n, ["config"], Aw(s, n)), n;
}
function Iw(e) {
  const t = {}, n = r(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = r(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = r(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const i = r(e, ["fileData"]);
  i != null && l(t, ["fileData"], Ew(i));
  const a = r(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Tw(a));
  const u = r(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = r(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], yw(c));
  const d = r(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = r(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = r(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = r(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = r(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = r(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const y = r(e, ["partMetadata"]);
  return y != null && l(t, ["partMetadata"], y), t;
}
function xw(e) {
  const t = {}, n = r(e, ["category"]);
  if (n != null && l(t, ["category"], n), r(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = r(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Rw(e) {
  const t = {}, n = r(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), r(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Pw(e) {
  const t = {};
  if (r(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = r(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = r(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = r(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], bw(s));
  const i = r(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], ww(i));
  const a = r(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), r(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = r(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = r(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), r(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = r(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = r(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function Mw(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const o = e[n];
    if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
      const s = Object.keys(o).map((i) => `${n}.${i}`);
      t.push(...s);
    } else t.push(n);
  }
  return t.join(",");
}
function Nw(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const s = e.fieldMask;
  if (n) {
    const i = Mw(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && s !== null && Array.isArray(s) && s.length > 0) {
      const a = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      s.length > 0 && (u = s.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else s !== null && Array.isArray(s) && s.length > 0 ? e.fieldMask = s.join(",") : delete e.fieldMask;
  return e;
}
var kw = class extends ut {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = Sw(this.apiClient, e);
      s = B("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = Nw(a, e.config);
      return o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), o.then((c) => c);
    }
  }
};
function Lw(e, t) {
  const n = {}, o = r(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function Dw(e) {
  const t = {}, n = r(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = r(e, ["config"]);
  return o != null && Lw(o, t), t;
}
function $w(e) {
  const t = {}, n = r(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function Uw(e, t) {
  const n = {}, o = r(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = r(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function Fw(e) {
  const t = {}, n = r(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = r(e, ["config"]);
  return o != null && Uw(o, t), t;
}
function Bw(e) {
  const t = {}, n = r(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = r(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = r(e, ["documents"]);
  if (s != null) {
    let i = s;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["documents"], i);
  }
  return t;
}
var Gw = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Nt(lt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = $w(e);
      return s = B("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = Dw(e);
      o = B("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Fw(e);
      return s = B("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Bw(u), d = new Xy();
        return Object.assign(d, c), d;
      });
    }
  }
}, Ow = class extends ut {
  constructor(e, t = new Gw(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Nt(lt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = CT(e);
      return s = B("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = RT(e);
      return s = B("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = xT(e);
      o = B("{name}", i._url), s = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = DT(e);
      return s = B("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = $T(u), d = new Qy();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = UT(e);
      return s = B("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = FT(u), d = new Zy();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = NT(e);
      return s = B("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = MT(u), d = new jy();
        return Object.assign(d, c), d;
      });
    }
  }
}, Ip = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ip = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, qw = () => Ip();
function ir(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var rr = (e) => {
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
}, qe = class extends Error {
}, Ve = class ar extends qe {
  constructor(t, n, o, s) {
    super(`${ar.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.error = n;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new $s({
      message: o,
      cause: rr(n)
    });
    const i = n;
    return t === 400 ? new Rp(t, i, o, s) : t === 401 ? new Pp(t, i, o, s) : t === 403 ? new Mp(t, i, o, s) : t === 404 ? new Np(t, i, o, s) : t === 409 ? new kp(t, i, o, s) : t === 422 ? new Lp(t, i, o, s) : t === 429 ? new Dp(t, i, o, s) : t >= 500 ? new $p(t, i, o, s) : new ar(t, i, o, s);
  }
}, lr = class extends Ve {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, $s = class extends Ve {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, xp = class extends $s {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Rp = class extends Ve {
}, Pp = class extends Ve {
}, Mp = class extends Ve {
}, Np = class extends Ve {
}, kp = class extends Ve {
}, Lp = class extends Ve {
}, Dp = class extends Ve {
}, $p = class extends Ve {
}, Vw = /^[a-z][a-z0-9+.-]*:/i, Hw = (e) => Vw.test(e), ur = (e) => (ur = Array.isArray, ur(e)), rc = ur;
function ac(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Jw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Ww = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new qe(`${e} must be an integer`);
  if (t < 0) throw new qe(`${e} must be a positive integer`);
  return t;
}, Kw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, zw = (e) => new Promise((t) => setTimeout(t, e));
function Yw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Up(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Xw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Up({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function Fp(e) {
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
async function Qw(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), s = o.cancel();
  o.releaseLock(), await s;
}
var Zw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function jw(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new qe(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var e0 = "0.0.1", Bp = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function pi(e, t, n) {
  return Bp(), new File(e, t ?? "unknown_file", n);
}
function t0(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var n0 = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", o0 = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Gp(e), s0 = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function i0(e, t, n) {
  if (Bp(), e = await e, o0(e))
    return e instanceof File ? e : pi([await e.arrayBuffer()], e.name);
  if (s0(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), pi(await cr(s), t, n);
  }
  const o = await cr(e);
  if (t || (t = t0(e)), !n?.type) {
    const s = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof s == "string" && (n = Object.assign(Object.assign({}, n), { type: s }));
  }
  return pi(o, t, n);
}
async function cr(e) {
  var t, n, o, s, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Gp(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (n0(e)) try {
    for (var u = !0, c = Ye(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      s = d.value, u = !1;
      const p = s;
      a.push(...await cr(p));
    }
  } catch (p) {
    n = { error: p };
  } finally {
    try {
      !u && !t && (o = c.return) && await o.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const p = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${p ? `; constructor: ${p}` : ""}${r0(e)}`);
  }
  return a;
}
function r0(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Qr = class {
  constructor(e) {
    this._client = e;
  }
};
Qr._key = [];
function Op(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var lc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), a0 = (e = Op) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const i = [], a = n.reduce((p, f, h) => {
    var m, g, y;
    /[?#]/.test(f) && (s = !0);
    const _ = o[h];
    let S = (s ? encodeURIComponent : e)("" + _);
    return h !== o.length && (_ == null || typeof _ == "object" && _.toString === ((y = Object.getPrototypeOf((g = Object.getPrototypeOf((m = _.hasOwnProperty) !== null && m !== void 0 ? m : lc)) !== null && g !== void 0 ? g : lc)) === null || y === void 0 ? void 0 : y.toString)) && (S = _ + "", i.push({
      start: p.length + f.length,
      length: S.length,
      error: `Value of type ${Object.prototype.toString.call(_).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : S);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const p = d[0].startsWith("/"), f = p ? 1 : 0, h = p ? d[0].slice(1) : d[0];
    i.push({
      start: d.index + f,
      length: h.length,
      error: `Value "${h}" can't be safely passed as a path parameter`
    });
  }
  if (i.sort((p, f) => p.start - f.start), i.length > 0) {
    let p = 0;
    const f = i.reduce((h, m) => {
      const g = " ".repeat(m.start - p), y = "^".repeat(m.length);
      return p = m.start + m.length, h + g + y;
    }, "");
    throw new qe(`Path parameters result in path with invalid segments:
${i.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), We = /* @__PURE__ */ a0(Op), qp = class extends Qr {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, s = _t(e, ["api_version"]);
    if ("model" in s && "agent_config" in s) throw new qe("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in s && "generation_config" in s) throw new qe("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(We`/${o}/interactions`, Object.assign(Object.assign({ body: s }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(We`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(We`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const s = t ?? {}, { api_version: i = this._client.apiVersion } = s, a = _t(s, ["api_version"]);
    return this._client.get(We`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
qp._key = Object.freeze(["interactions"]);
var Vp = class extends qp {
}, Hp = class extends Qr {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, s = _t(e, ["api_version", "webhook_id"]);
    return this._client.post(We`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: s
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: s } = t, i = _t(t, ["api_version", "update_mask"]);
    return this._client.patch(We`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: s },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, s = _t(n, ["api_version"]);
    return this._client.get(We`/${o}/webhooks`, Object.assign({ query: s }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(We`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(We`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: s } = t ?? {};
    return this._client.post(We`/${o}/webhooks/${e}:ping`, Object.assign({ body: s }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, i = _t(o, ["api_version"]);
    return this._client.post(We`/${s}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Hp._key = Object.freeze(["webhooks"]);
var Jp = class extends Hp {
};
function l0(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var $o;
function Zr(e) {
  let t;
  return ($o ?? (t = new globalThis.TextEncoder(), $o = t.encode.bind(t)))(e);
}
var Uo;
function uc(e) {
  let t;
  return (Uo ?? (t = new globalThis.TextDecoder(), Uo = t.decode.bind(t)))(e);
}
var Us = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Zr(e) : e;
    this.buffer = l0([this.buffer, n]);
    const o = [];
    let s;
    for (; (s = u0(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (s.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = s.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (s.index !== this.carriageReturnIndex + 1 || s.carriage)) {
        o.push(uc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? s.preceding - 1 : s.preceding, a = uc(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(s.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Us.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Us.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function u0(e, t) {
  const s = t ?? 0, i = e.indexOf(10, s), a = e.indexOf(13, s);
  if (i === -1 && a === -1) return null;
  let u;
  return i !== -1 && a !== -1 ? u = Math.min(i, a) : u = i !== -1 ? i : a, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var gs = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, cc = (e, t, n) => {
  if (e) {
    if (Jw(gs, e)) return e;
    Ce(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(gs))}`);
  }
};
function qn() {
}
function Fo(e, t, n) {
  return !t || gs[e] > gs[n] ? qn : t[e].bind(t);
}
var c0 = {
  error: qn,
  warn: qn,
  info: qn,
  debug: qn
}, dc = /* @__PURE__ */ new WeakMap();
function Ce(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return c0;
  const s = dc.get(n);
  if (s && s[0] === o) return s[1];
  const i = {
    error: Fo("error", n, o),
    warn: Fo("warn", n, o),
    info: Fo("info", n, o),
    debug: Fo("debug", n, o)
  };
  return dc.set(n, [o, i]), i;
}
var xt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), d0 = class Vn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const i = o ? Ce(o) : console;
    function a() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new qe("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ye(f0(t, n)), y; y = yield Z(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              if (!h)
                if (_.data.startsWith("[DONE]")) {
                  h = !0;
                  continue;
                } else try {
                  yield yield Z(JSON.parse(_.data));
                } catch (S) {
                  throw i.error("Could not parse message into JSON:", _.data), i.error("From chunk:", _.raw), S;
                }
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield Z(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (ir(_)) return yield Z(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Vn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    function i() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        const h = new Us(), m = Fp(t);
        try {
          for (var g = !0, y = Ye(m), _; _ = yield Z(y.next()), c = _.done, !c; g = !0) {
            f = _.value, g = !1;
            const S = f;
            for (const T of h.decode(S)) yield yield Z(T);
          }
        } catch (S) {
          d = { error: S };
        } finally {
          try {
            !g && !c && (p = y.return) && (yield Z(p.call(y)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const S of h.flush()) yield yield Z(S);
      });
    }
    function a() {
      return ze(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new qe("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Ye(i()), y; y = yield Z(g.next()), c = y.done, !c; m = !0) {
              f = y.value, m = !1;
              const _ = f;
              h || _ && (yield yield Z(JSON.parse(_)));
            }
          } catch (_) {
            d = { error: _ };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield Z(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (_) {
          if (ir(_)) return yield Z(void 0);
          throw _;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Vn(a, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Vn(() => s(t), this.controller, this.client), new Vn(() => s(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Up({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: i } = await n.next();
          if (i) return o.close();
          const a = Zr(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function f0(e, t) {
  return ze(this, arguments, function* () {
    var o, s, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new qe("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new qe("Attempted to iterate over a response with no body");
    const u = new h0(), c = new Us(), d = Fp(e.body);
    try {
      for (var p = !0, f = Ye(p0(d)), h; h = yield Z(f.next()), o = h.done, !o; p = !0) {
        a = h.value, p = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const y = u.decode(g);
          y && (yield yield Z(y));
        }
      }
    } catch (m) {
      s = { error: m };
    } finally {
      try {
        !p && !o && (i = f.return) && (yield Z(i.call(f)));
      } finally {
        if (s) throw s.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield Z(g));
    }
  });
}
function p0(e) {
  return ze(this, arguments, function* () {
    var n, o, s, i;
    try {
      for (var a = !0, u = Ye(e), c; c = yield Z(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield Z(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Zr(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (s = u.return) && (yield Z(s.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var h0 = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = m0(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function m0(e, t) {
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
async function g0(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Ce(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : d0.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Ce(e).debug(`[${o}] response parsed`, xt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var y0 = class Wp extends Promise {
  constructor(t, n, o = g0) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Wp(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Kp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* _0(e) {
  if (!e) return;
  if (Kp in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const i of s) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : rc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const i = rc(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var In = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, a] of _0(o)) {
      const u = i.toLowerCase();
      s.has(u) || (t.delete(i), s.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Kp]: !0,
    values: t,
    nulls: n
  };
}, hi = (e) => {
  var t, n, o, s, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (s = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || s === void 0 ? void 0 : s.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, zp, Yp = class Xp {
  constructor(t) {
    var n, o, s, i, a, u, c, { baseURL: d = hi("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: p = (n = hi("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, h = _t(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: p,
      apiVersion: f
    }, h), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : Xp.DEFAULT_TIMEOUT, this.logger = (s = m.logger) !== null && s !== void 0 ? s : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = cc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : cc(hi("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : Yw(), this.encoder = Zw, this._options = m, this.apiKey = p, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = In([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return In([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return In([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return jw(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${e0}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${qw()}`;
  }
  makeStatusError(t, n, o, s) {
    return Ve.generate(t, n, o, s);
  }
  buildURL(t, n, o) {
    const s = !this.baseURLOverridden() && o || this.baseURL, i = Hw(t) ? new URL(t) : new URL(s + (s.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!ac(a) || !ac(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
  }
  async prepareOptions(t) {
    if (this.clientAdapter && this.clientAdapter.isVertexAI() && !t.path.startsWith(`/${this.apiVersion}/projects/`)) {
      const n = t.path.slice(this.apiVersion.length + 1);
      t.path = `/${this.apiVersion}/projects/${this.clientAdapter.getProject()}/locations/${this.clientAdapter.getLocation()}${n}`;
    }
  }
  async prepareRequest(t, { url: n, options: o }) {
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
  methodRequest(t, n, o) {
    return this.request(Promise.resolve(o).then((s) => Object.assign({
      method: t,
      path: n
    }, s)));
  }
  request(t, n = null) {
    return new y0(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var s, i, a;
    const u = await t, c = (s = u.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: p, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: p,
      options: u
    });
    const h = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (Ce(this).debug(`[${h}] sending request`, xt({
      retryOfRequestLogID: o,
      method: u.method,
      url: p,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new lr();
    const y = new AbortController(), _ = await this.fetchWithTimeout(p, d, f, y).catch(rr), S = Date.now();
    if (_ instanceof globalThis.Error) {
      const C = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new lr();
      const R = ir(_) || /timed? ?out/i.test(String(_) + ("cause" in _ ? String(_.cause) : ""));
      if (n)
        return Ce(this).info(`[${h}] connection ${R ? "timed out" : "failed"} - ${C}`), Ce(this).debug(`[${h}] connection ${R ? "timed out" : "failed"} (${C})`, xt({
          retryOfRequestLogID: o,
          url: p,
          durationMs: S - g,
          message: _.message
        })), this.retryRequest(u, n, o ?? h);
      throw Ce(this).info(`[${h}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), Ce(this).debug(`[${h}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, xt({
        retryOfRequestLogID: o,
        url: p,
        durationMs: S - g,
        message: _.message
      })), R ? new xp() : new $s({ cause: _ });
    }
    const T = `[${h}${m}] ${d.method} ${p} ${_.ok ? "succeeded" : "failed"} with status ${_.status} in ${S - g}ms`;
    if (!_.ok) {
      const C = await this.shouldRetry(_);
      if (n && C) {
        const A = `retrying, ${n} attempts remaining`;
        return await Qw(_.body), Ce(this).info(`${T} - ${A}`), Ce(this).debug(`[${h}] response error (${A})`, xt({
          retryOfRequestLogID: o,
          url: _.url,
          status: _.status,
          headers: _.headers,
          durationMs: S - g
        })), this.retryRequest(u, n, o ?? h, _.headers);
      }
      const R = C ? "error; no more retries left" : "error; not retryable";
      Ce(this).info(`${T} - ${R}`);
      const L = await _.text().catch((A) => rr(A).message), b = Kw(L), v = b ? void 0 : L;
      throw Ce(this).debug(`[${h}] response error (${R})`, xt({
        retryOfRequestLogID: o,
        url: _.url,
        status: _.status,
        headers: _.headers,
        message: v,
        durationMs: Date.now() - g
      })), this.makeStatusError(_.status, b, v, _.headers);
    }
    return Ce(this).info(T), Ce(this).debug(`[${h}] response start`, xt({
      retryOfRequestLogID: o,
      url: _.url,
      status: _.status,
      headers: _.headers,
      durationMs: S - g
    })), {
      response: _,
      options: u,
      controller: y,
      requestLogID: h,
      retryOfRequestLogID: o,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, o, s) {
    const i = n || {}, { signal: a, method: u } = i, c = _t(i, ["signal", "method"]), d = this._makeAbort(s);
    a && a.addEventListener("abort", d, { once: !0 });
    const p = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, h = Object.assign(Object.assign(Object.assign({ signal: s.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
  async retryRequest(t, n, o, s) {
    var i;
    let a;
    const u = s?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = s?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await zw(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, s, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: p } = a, f = this.buildURL(c, d, p);
    "timeout" in a && Ww("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
    const { bodyHeaders: h, body: m } = this.buildBody({ options: a }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: h,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (s = this.fetchOptions) !== null && s !== void 0 ? s : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: s }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = In([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      o,
      t.headers,
      a
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
    const o = In([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: Xw(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Yp.DEFAULT_TIMEOUT = 6e4;
var me = class extends Yp {
  constructor() {
    super(...arguments), this.interactions = new Vp(this), this.webhooks = new Jp(this);
  }
};
zp = me;
me.GeminiNextGenAPIClient = zp;
me.GeminiNextGenAPIClientError = qe;
me.APIError = Ve;
me.APIConnectionError = $s;
me.APIConnectionTimeoutError = xp;
me.APIUserAbortError = lr;
me.NotFoundError = Np;
me.ConflictError = kp;
me.RateLimitError = Dp;
me.BadRequestError = Rp;
me.AuthenticationError = Pp;
me.InternalServerError = $p;
me.PermissionDeniedError = Mp;
me.UnprocessableEntityError = Lp;
me.toFile = i0;
me.Interactions = Vp;
me.Webhooks = Jp;
function v0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function S0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function E0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function T0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function w0(e, t, n) {
  const o = {};
  if (r(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const s = r(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && s != null && l(t, ["displayName"], s), r(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = r(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const a = r(e, ["learningRateMultiplier"]);
  if (a != null && l(o, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], a), r(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (r(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (r(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (r(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (r(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = r(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = r(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), r(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (r(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (r(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (r(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (r(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (r(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (r(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return o;
}
function b0(e, t, n) {
  const o = {};
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["validationDataset"]);
    t !== void 0 && b != null && l(t, ["supervisedTuningSpec"], mi(b));
  } else if (s === "PREFERENCE_TUNING") {
    const b = r(e, ["validationDataset"]);
    t !== void 0 && b != null && l(t, ["preferenceOptimizationSpec"], mi(b));
  } else if (s === "DISTILLATION") {
    const b = r(e, ["validationDataset"]);
    t !== void 0 && b != null && l(t, ["distillationSpec"], mi(b));
  }
  const i = r(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = r(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = r(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["epochCount"]);
    t !== void 0 && b != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], b);
  } else if (u === "PREFERENCE_TUNING") {
    const b = r(e, ["epochCount"]);
    t !== void 0 && b != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], b);
  } else if (u === "DISTILLATION") {
    const b = r(e, ["epochCount"]);
    t !== void 0 && b != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], b);
  }
  let c = r(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["learningRateMultiplier"]);
    t !== void 0 && b != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], b);
  } else if (c === "PREFERENCE_TUNING") {
    const b = r(e, ["learningRateMultiplier"]);
    t !== void 0 && b != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], b);
  } else if (c === "DISTILLATION") {
    const b = r(e, ["learningRateMultiplier"]);
    t !== void 0 && b != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], b);
  }
  let d = r(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && b != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], b);
  } else if (d === "PREFERENCE_TUNING") {
    const b = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && b != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], b);
  } else if (d === "DISTILLATION") {
    const b = r(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && b != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], b);
  }
  let p = r(n, ["config", "method"]);
  if (p === void 0 && (p = "SUPERVISED_FINE_TUNING"), p === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["adapterSize"]);
    t !== void 0 && b != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], b);
  } else if (p === "PREFERENCE_TUNING") {
    const b = r(e, ["adapterSize"]);
    t !== void 0 && b != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], b);
  } else if (p === "DISTILLATION") {
    const b = r(e, ["adapterSize"]);
    t !== void 0 && b != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], b);
  }
  let f = r(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["tuningMode"]);
    t !== void 0 && b != null && l(t, ["supervisedTuningSpec", "tuningMode"], b);
  } else if (f === "DISTILLATION") {
    const b = r(e, ["tuningMode"]);
    t !== void 0 && b != null && l(t, ["distillationSpec", "tuningMode"], b);
  }
  const h = r(e, ["customBaseModel"]);
  t !== void 0 && h != null && l(t, ["customBaseModel"], h);
  let m = r(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["batchSize"]);
    t !== void 0 && b != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], b);
  } else if (m === "DISTILLATION") {
    const b = r(e, ["batchSize"]);
    t !== void 0 && b != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], b);
  }
  let g = r(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const b = r(e, ["learningRate"]);
    t !== void 0 && b != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], b);
  } else if (g === "DISTILLATION") {
    const b = r(e, ["learningRate"]);
    t !== void 0 && b != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], b);
  }
  const y = r(e, ["labels"]);
  t !== void 0 && y != null && l(t, ["labels"], y);
  const _ = r(e, ["beta"]);
  t !== void 0 && _ != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], _);
  const S = r(e, ["baseTeacherModel"]);
  t !== void 0 && S != null && l(t, ["distillationSpec", "baseTeacherModel"], S);
  const T = r(e, ["tunedTeacherModelSource"]);
  t !== void 0 && T != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], T);
  const C = r(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && C != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], C);
  const R = r(e, ["outputUri"]);
  t !== void 0 && R != null && l(t, ["outputUri"], R);
  const L = r(e, ["encryptionSpec"]);
  return t !== void 0 && L != null && l(t, ["encryptionSpec"], L), o;
}
function A0(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && $0(i);
  const a = r(e, ["config"]);
  return a != null && w0(a, n), n;
}
function C0(e, t) {
  const n = {}, o = r(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = r(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const i = r(e, ["trainingDataset"]);
  i != null && U0(i, n, t);
  const a = r(e, ["config"]);
  return a != null && b0(a, n, t), n;
}
function I0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function x0(e, t) {
  const n = {}, o = r(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function R0(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function P0(e, t, n) {
  const o = {}, s = r(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const i = r(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = r(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function M0(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && R0(o, n), n;
}
function N0(e, t) {
  const n = {}, o = r(e, ["config"]);
  return o != null && P0(o, n), n;
}
function k0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Qp(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function L0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const i = r(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => dr(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function D0(e, t) {
  const n = {}, o = r(e, ["name"]);
  o != null && l(n, ["model"], o);
  const s = r(e, ["name"]);
  return s != null && l(n, ["endpoint"], s), n;
}
function $0(e, t) {
  const n = {};
  if (r(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (r(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = r(e, ["examples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((i) => i)), l(n, ["examples", "examples"], s);
  }
  return n;
}
function U0(e, t, n) {
  const o = {};
  let s = r(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const a = r(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (s === "PREFERENCE_TUNING") {
    const a = r(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (s === "DISTILLATION") {
    const a = r(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  let i = r(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const a = r(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (i === "PREFERENCE_TUNING") {
    const a = r(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (i === "DISTILLATION") {
    const a = r(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  if (r(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function Qp(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], rp(i));
  const a = r(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = r(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = r(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = r(e, ["description"]);
  p != null && l(n, ["description"], p);
  const f = r(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const h = r(e, ["_self"]);
  return h != null && l(n, ["tunedModel"], D0(h)), n;
}
function dr(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["state"]);
  i != null && l(n, ["state"], rp(i));
  const a = r(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = r(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = r(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = r(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = r(e, ["error"]);
  p != null && l(n, ["error"], p);
  const f = r(e, ["description"]);
  f != null && l(n, ["description"], f);
  const h = r(e, ["baseModel"]);
  h != null && l(n, ["baseModel"], h);
  const m = r(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = r(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const y = r(e, ["supervisedTuningSpec"]);
  y != null && l(n, ["supervisedTuningSpec"], y);
  const _ = r(e, ["preferenceOptimizationSpec"]);
  _ != null && l(n, ["preferenceOptimizationSpec"], _);
  const S = r(e, ["distillationSpec"]);
  S != null && l(n, ["distillationSpec"], S);
  const T = r(e, ["tuningDataStats"]);
  T != null && l(n, ["tuningDataStats"], T);
  const C = r(e, ["encryptionSpec"]);
  C != null && l(n, ["encryptionSpec"], C);
  const R = r(e, ["partnerModelTuningSpec"]);
  R != null && l(n, ["partnerModelTuningSpec"], R);
  const L = r(e, ["customBaseModel"]);
  L != null && l(n, ["customBaseModel"], L);
  const b = r(e, ["evaluateDatasetRuns"]);
  if (b != null) {
    let xe = b;
    Array.isArray(xe) && (xe = xe.map((_e) => _e)), l(n, ["evaluateDatasetRuns"], xe);
  }
  const v = r(e, ["experiment"]);
  v != null && l(n, ["experiment"], v);
  const A = r(e, ["fullFineTuningSpec"]);
  A != null && l(n, ["fullFineTuningSpec"], A);
  const P = r(e, ["labels"]);
  P != null && l(n, ["labels"], P);
  const q = r(e, ["outputUri"]);
  q != null && l(n, ["outputUri"], q);
  const V = r(e, ["pipelineJob"]);
  V != null && l(n, ["pipelineJob"], V);
  const k = r(e, ["serviceAccount"]);
  k != null && l(n, ["serviceAccount"], k);
  const D = r(e, ["tunedModelDisplayName"]);
  D != null && l(n, ["tunedModelDisplayName"], D);
  const U = r(e, ["tuningJobState"]);
  U != null && l(n, ["tuningJobState"], U);
  const z = r(e, ["veoTuningSpec"]);
  z != null && l(n, ["veoTuningSpec"], z);
  const ie = r(e, ["distillationSamplingSpec"]);
  ie != null && l(n, ["distillationSamplingSpec"], ie);
  const le = r(e, ["tuningJobMetadata"]);
  return le != null && l(n, ["tuningJobMetadata"], le), n;
}
function F0(e, t) {
  const n = {}, o = r(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = r(e, ["name"]);
  s != null && l(n, ["name"], s);
  const i = r(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = r(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = r(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function mi(e, t) {
  const n = {}, o = r(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const s = r(e, ["vertexDatasetResource"]);
  return s != null && l(n, ["validationDatasetUri"], s), n;
}
var B0 = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(lt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const o = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (o.checkpointId = t.config.preTunedModelCheckpointId);
        const s = Object.assign(Object.assign({}, t), { preTunedModel: o });
        return s.baseModel = void 0, await this.tuneInternal(s);
      } else {
        const o = Object.assign({}, t);
        return await this.tuneInternal(o);
      }
      else {
        const o = Object.assign({}, t), s = await this.tuneMldevInternal(o);
        let i = "";
        return s.metadata !== void 0 && s.metadata.tunedModel !== void 0 ? i = s.metadata.tunedModel : s.name !== void 0 && s.name.includes("/operations/") && (i = s.name.split("/operations/")[0]), {
          name: i,
          state: Qi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = x0(e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => dr(d));
    } else {
      const c = I0(e);
      return a = B("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Qp(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = N0(e);
      return a = B("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = L0(d), f = new $u();
        return Object.assign(f, p), f;
      });
    } else {
      const c = M0(e);
      return a = B("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = k0(d), f = new $u();
        return Object.assign(f, p), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = S0(e);
      return a = B("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = T0(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = v0(e);
      return a = B("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const p = E0(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = C0(e, e);
      return s = B("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => dr(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, s = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = A0(e);
      return s = B("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => F0(u));
    }
  }
}, G0 = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, O0 = 1024 * 1024 * 8, q0 = 3, V0 = 1e3, H0 = 2, ys = "x-goog-upload-status";
async function J0(e, t, n, o) {
  var s;
  const i = await Zp(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[ys]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function W0(e, t, n, o) {
  var s;
  const i = await Zp(e, t, n, o), a = await i?.json();
  if (((s = i?.headers) === null || s === void 0 ? void 0 : s[ys]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Qf(a), c = new r_();
  return Object.assign(c, u), c;
}
async function Zp(e, t, n, o) {
  var s, i, a;
  let u = t;
  const c = o?.baseUrl || ((s = n.clientOptions.httpOptions) === null || s === void 0 ? void 0 : s.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, p = 0, f = new ji(new Response()), h = "upload";
  for (d = e.size; p < d; ) {
    const m = Math.min(O0, d - p), g = e.slice(p, p + m);
    p + m >= d && (h += ", finalize");
    let y = 0, _ = V0;
    for (; y < q0; ) {
      const S = Object.assign(Object.assign({}, o?.headers || {}), {
        "X-Goog-Upload-Command": h,
        "X-Goog-Upload-Offset": String(p),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, o), {
          apiVersion: "",
          baseUrl: u,
          headers: S
        })
      }), !((i = f?.headers) === null || i === void 0) && i[ys]) break;
      y++, await z0(_), _ = _ * H0;
    }
    if (p += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[ys]) !== "active") break;
    if (d <= p) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function K0(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function z0(e) {
  return new Promise((t) => setTimeout(t, e));
}
var Y0 = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await J0(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await W0(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await K0(e);
  }
}, X0 = class {
  create(e, t, n) {
    return new Q0(e, t, n);
  }
}, Q0 = class {
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
}, fc = "x-goog-api-key", Z0 = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(fc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(fc, this.apiKey);
    }
  }
}, j0 = "gl-node/", eb = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new me({
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
    const n = Ry(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new Z0(this.apiKey);
    this.apiClient = new zT({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: j0 + "web",
      uploader: new Y0(),
      downloader: new G0()
    }), this.models = new hw(this.apiClient), this.live = new lw(this.apiClient, o, new X0()), this.batches = new uv(this.apiClient), this.chats = new Kv(this.models, this.apiClient), this.caches = new Hv(this.apiClient), this.files = new iS(this.apiClient), this.operations = new mw(this.apiClient), this.authTokens = new kw(this.apiClient), this.tunings = new B0(this.apiClient), this.fileSearchStores = new Ow(this.apiClient);
  }
};
function pc(e, t) {
  const n = globalThis.top?.console || console;
  try {
    n.groupCollapsed(e), n.log(JSON.parse(JSON.stringify(t))), n.groupEnd();
  } catch {
    n.log(e, t);
  }
}
function hc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function zt(e) {
  return { text: String(e || "") };
}
function tb(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function nb(e) {
  if (typeof e == "string") return [zt(e)];
  if (!Array.isArray(e)) return [zt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? zt(n.text || "") : n.type === "image_url" && n.image_url?.url ? tb(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [zt("")];
}
function mc() {
  return {
    role: "user",
    parts: [zt("继续。")]
  };
}
function ob(e) {
  switch (e) {
    case "high":
      return zn.HIGH;
    case "medium":
      return zn.MEDIUM;
    default:
      return zn.LOW;
  }
}
function gc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function sb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function ib(e) {
  const t = /* @__PURE__ */ new Map(), n = [], o = (e || []).filter((i) => i.role === "user" || i.role === "assistant" || i.role === "tool");
  o.forEach((i) => {
    (i.tool_calls || []).forEach((a) => {
      a.id && a.function?.name && t.set(a.id, a.function.name);
    });
  });
  for (let i = 0; i < o.length; i += 1) {
    const a = o[i];
    if (a.role === "tool") {
      const u = [];
      let c = i;
      for (; c < o.length && o[c].role === "tool"; ) {
        const d = o[c];
        u.push({ functionResponse: {
          name: t.get(d.tool_call_id || "") || "tool_result",
          response: hc(d.content)
        } }), c += 1;
      }
      n.push({
        role: "user",
        parts: u
      }), i = c - 1;
      continue;
    }
    if (a.role === "assistant" && Array.isArray(a.tool_calls) && a.tool_calls.length) {
      n.push({
        role: "model",
        parts: [...a.content ? [zt(a.content)] : [], ...a.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: hc(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: nb(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: mc().parts
  };
  const s = n[n.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: n,
    latestMessage: mc().parts
  };
}
function rb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function yc(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
var ab = class {
  constructor(e) {
    this.config = e, this.client = new eb({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 18e4
      }
    });
  }
  async chat(e) {
    const t = ib(e.messages), n = Array.isArray(e.tools) ? e.tools : [], o = sb(e), s = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    e.reasoning?.enabled && (s.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: ob(e.reasoning.effort)
    }), n.length && (s.tools = [{ functionDeclarations: n.map((g) => ({
      name: g.function.name,
      description: g.function.description,
      parameters: g.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (s.toolConfig = { functionCallingConfig: { mode: Xi.ANY } });
    const i = {
      model: this.config.model,
      history: t.history,
      config: s
    };
    pc("[LittleWhiteBox Assistant] Google AI outgoing create payload", i);
    const a = this.client.chats.create(i), u = { message: t.latestMessage };
    pc("[LittleWhiteBox Assistant] Google AI outgoing send payload", u);
    let c, d, p, f = [];
    if (typeof e.onStreamProgress == "function") {
      const g = await a.sendMessageStream(u), y = /* @__PURE__ */ new Map();
      let _ = "", S = [], T = null;
      for await (const C of g) {
        T = C;
        const R = typeof C.text == "string" ? C.text : (C.candidates?.[0]?.content?.parts || []).map((L) => L.text || "").filter(Boolean).join(`
`);
        _ = yc(_, R), gc(C).forEach((L, b) => {
          const v = `${L.label}:${b}`;
          y.set(v, yc(y.get(v) || "", L.text));
        }), S = (C.functionCalls || []).map((L, b) => ({
          id: L.id || `google-tool-${b + 1}`,
          name: L.name || "",
          arguments: JSON.stringify(L.args || {})
        })).filter((L) => L.name), f = S, rb(e, {
          text: _,
          thoughts: Array.from(y.values()).filter(Boolean).map((L, b) => ({
            label: `思考块 ${b + 1}`,
            text: L
          }))
        });
      }
      c = T || { functionCalls: S }, d = Array.from(y.values()).filter(Boolean).map((C, R) => ({
        label: `思考块 ${R + 1}`,
        text: C
      })), p = _;
    } else
      c = await a.sendMessage(u), d = gc(c), p = typeof c.text == "string" ? c.text : (c.candidates?.[0]?.content?.parts || []).map((g) => g.text || "").filter(Boolean).join(`
`);
    const h = (c.functionCalls || []).map((g, y) => ({
      id: g.id || `google-tool-${y + 1}`,
      name: g.name || "",
      arguments: JSON.stringify(g.args || {})
    })).filter((g) => g.name), m = h.length ? h : f;
    return {
      text: p,
      toolCalls: m,
      thoughts: d,
      finishReason: c.candidates?.[0]?.finishReason || "STOP",
      model: c.modelVersion || this.config.model,
      provider: "google"
    };
  }
}, ae = {
  LS: "LS",
  GLOB: "Glob",
  GREP: "Grep",
  READ: "Read",
  RUN_SLASH_COMMAND: "RunSlashCommand",
  READ_WORKLOG: "ReadWorklog",
  WRITE_WORKLOG: "WriteWorklog"
}, lb = [
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
], ub = [
  {
    type: "function",
    function: {
      name: ae.LS,
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
      name: ae.GLOB,
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
      name: ae.GREP,
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
      name: ae.READ,
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
      name: ae.RUN_SLASH_COMMAND,
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
      name: ae.READ_WORKLOG,
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
      name: ae.WRITE_WORKLOG,
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
function cb(e, t = null) {
  try {
    return JSON.parse(e || "null");
  } catch {
    return t;
  }
}
function _c(e = [], t) {
  const n = e.slice(0, 3), o = [];
  return n.forEach((s) => o.push(t(s))), e.length > n.length && o.push(`……其余 ${e.length - n.length} 项见详细结果`), o;
}
function db(e, t = {}) {
  switch (e) {
    case ae.LS:
      return `查看目录 ${t.path || ""}`.trim();
    case ae.GLOB:
      return `匹配文件 ${t.pattern || ""}`.trim();
    case ae.GREP:
      return `搜索内容 ${t.pattern || ""}`.trim();
    case ae.READ:
      return `读取文件 ${t.path || ""}${t.startLine ? `:${t.startLine}` : ""}${t.endLine ? `-${t.endLine}` : ""}`.trim();
    case ae.RUN_SLASH_COMMAND:
      return `执行斜杠命令 ${t.command || ""}`.trim();
    case ae.READ_WORKLOG:
      return "读取工作记录";
    case ae.WRITE_WORKLOG:
      return `写入工作记录 ${t.name || ""}`.trim();
    default:
      return `调用工具 ${e}`;
  }
}
function jp(e) {
  const t = cb(e.content, null);
  if (!t || typeof t != "object") return {
    summary: e.content || "",
    details: ""
  };
  if (t.ok === !1 && t.error) {
    const n = [
      `工具返回错误：${t.error}`,
      t.message ? `说明：${t.message}` : "",
      t.suggestion ? `建议：${t.suggestion}` : ""
    ].filter(Boolean), o = [];
    return t.path && o.push(`路径：${t.path}`), Number.isFinite(t.sizeBytes) && t.sizeBytes > 0 && o.push(`大小：${Math.round(t.sizeBytes / 1024)} KB`), Number.isFinite(t.lineCount) && t.lineCount >= 0 && o.push(`行数：${t.lineCount}`), t.raw && t.raw !== t.error && o.push(`原始错误：${t.raw}`), {
      summary: n.join(`
`),
      details: o.join(`
`)
    };
  }
  if (e.toolName === ae.GLOB) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`glob“${t.pattern || ""}”命中 ${t.total || 0} 个文件，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把模式或路径范围再收窄一点。"), n.length && (o.push(""), o.push(..._c(n, (i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`)));
    const s = n.map((i) => `- ${i.publicPath}${i.source ? ` [${i.source}]` : ""}`);
    return {
      summary: o.join(`
`),
      details: s.join(`
`)
    };
  }
  if (e.toolName === ae.LS) {
    const n = Array.isArray(t.items) ? t.items : [], o = [`目录 ${t.directoryPath || ""} 下找到 ${t.total || 0} 个一级子项，当前展示 ${n.length} 个。`];
    t.truncated && o.push("结果已截断，可以把目录范围再收窄一点。"), n.length && (o.push(""), o.push(..._c(n, (i) => `- ${i.publicPath}${i.type === "directory" ? " [目录]" : ""}`)));
    const s = n.map((i) => {
      const a = [];
      return i.type === "directory" && a.push("目录"), i.source && a.push(i.source), i.type === "directory" && Number(i.descendantFileCount) > 0 && a.push(`包含 ${i.descendantFileCount} 个已索引文件`), `- ${i.publicPath}${a.length ? ` [${a.join(" | ")}]` : ""}`;
    });
    return {
      summary: o.join(`
`),
      details: s.join(`
`)
    };
  }
  if (e.toolName === ae.GREP) {
    const n = Array.isArray(t.items) ? t.items : [], o = t.outputMode || "files_with_matches", s = [`grep“${t.pattern || ""}”模式：${o}。当前展示 ${n.length} 个结果。`];
    t.glob && s.push(`glob 限定：${t.glob}`), Number(t.offset) > 0 && s.push(`偏移：已跳过前 ${t.offset} 个结果`), o === "content" && Number(t.contextLines) > 0 && s.push(`上下文：前后 ${t.contextLines} 行`), t.truncated ? (s.push(`结果仍有剩余；本次已扫描 ${t.scannedFiles || 0}/${t.candidateFiles || t.indexedFiles || 0} 个候选文件。`), s.push(`如需继续，可把 offset 设为 ${Number(t.nextOffset) || (Number(t.offset) || 0) + n.length}。`)) : Number(t.candidateFiles) > 0 && t.glob ? (s.push(`本次扫描 ${t.scannedFiles || 0}/${t.candidateFiles} 个候选文件。`), Number.isFinite(t.total) && s.push(`总命中文件数：${t.total}`)) : Number.isFinite(t.total) && s.push(`总命中文件数：${t.total}`);
    const i = [];
    return n.length && (s.push(""), n.forEach((a) => {
      if (o === "count")
        s.push(`- ${a.path}${Number.isFinite(a.matchCount) ? `（${a.matchCount} 处）` : ""}`), i.push(`${a.path}${Number.isFinite(a.matchCount) ? `: ${a.matchCount}` : ""}`);
      else if (o === "files_with_matches")
        s.push(`- ${a.path}${Number.isFinite(a.matchCount) ? `（${a.matchCount} 处）` : ""}`), i.push(a.path);
      else {
        const u = Array.isArray(a.matches) ? a.matches[0] : null, c = u?.line ? `:${u.line}` : "";
        s.push(`- ${a.path}${c}${a.matchCount ? `（${a.matchCount} 处）` : ""}`), Array.isArray(a.matches) && a.matches.length && (i.push(a.path), a.matches.forEach((d, p) => {
          i.push(`  [${p + 1}] 第 ${d.line || "?"} 行: ${d.text || ""}`), d.context && i.push(d.context);
        }), i.push(""));
      }
    })), {
      summary: s.join(`
`),
      details: i.join(`
`).trim()
    };
  }
  if (e.toolName === ae.READ) {
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
  if (e.toolName === ae.RUN_SLASH_COMMAND) {
    const n = [`已执行斜杠命令：${t.command || ""}`, t.ok === !1 ? "状态：失败" : "状态：成功"];
    t.error && n.push(`错误：${t.error}`), t.note && n.push(`说明：${t.note}`);
    let o = "";
    return t.result !== void 0 ? o = typeof t.result == "string" ? t.result : JSON.stringify(t.result, null, 2) : t.raw && (o = typeof t.raw == "string" ? t.raw : JSON.stringify(t.raw, null, 2)), {
      summary: n.filter(Boolean).join(`
`),
      details: o
    };
  }
  return e.toolName === ae.WRITE_WORKLOG ? {
    summary: `工作记录已写入 ${t.name || ""}`.trim(),
    details: ""
  } : e.toolName === ae.READ_WORKLOG ? {
    summary: t.exists ? `已读取工作记录：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}` : `工作记录还不存在：${t.name || "LittleWhiteBox_Assistant_Worklog.md"}`,
    details: t.exists ? String(t.content || "") : ""
  } : {
    summary: JSON.stringify(t, null, 2),
    details: ""
  };
}
var fb = 3.35, pb = /* @__PURE__ */ new Set(["openai-compatible", "openai-responses"]), hb = new TextEncoder();
function mb(e) {
  const { state: t, pendingToolCalls: n, pendingApprovals: o, persistSession: s, render: i, showToast: a, post: u, createRequestId: c, safeJsonParse: d, describeError: p, describeToolCall: f, formatToolResultDisplay: h, buildTextWithAttachmentSummary: m, buildUserContentParts: g, normalizeAttachments: y, normalizeThoughtBlocks: _, normalizeSlashCommand: S, shouldRequireSlashCommandApproval: T, setApprovalStatus: C, buildSlashApprovalResult: R, isAbortError: L, createAdapter: b, getActiveProviderConfig: v, SYSTEM_PROMPT: A, SUMMARY_SYSTEM_PROMPT: P, HISTORY_SUMMARY_PREFIX: q, MAX_CONTEXT_TOKENS: V, SUMMARY_TRIGGER_TOKENS: k, DEFAULT_PRESERVED_TURNS: D, MIN_PRESERVED_TURNS: U, MAX_TOOL_ROUNDS: z, REQUEST_TIMEOUT_MS: ie, TOOL_DEFINITIONS: le, TOOL_NAMES: xe } = e;
  let _e = !1, nt = 0, rn = "", dt = "", kt = 0, uo = 0;
  function an() {
    t.historySummary = "", t.archivedTurnCount = 0, t.contextStats = {
      usedTokens: 0,
      budgetTokens: V,
      summaryActive: !1
    };
  }
  function St() {
    return t.historySummary?.trim() ? {
      role: "system",
      content: `${q}
${t.historySummary.trim()}`
    } : null;
  }
  function hh() {
    const I = t.activeRun?.lightBrakeMessage;
    return I ? {
      role: "system",
      content: I
    } : null;
  }
  function ua(I) {
    return `${Math.max(0, Math.round((Number(I) || 0) / 1e3))}k`;
  }
  function Gs(I = t.contextStats) {
    return `${ua(I.usedTokens)}/${ua(I.budgetTokens)}`;
  }
  function co(I, x = 1800) {
    const M = String(I || "").replace(/\s+/g, " ").trim();
    return M.length <= x ? M : `${M.slice(0, x)}…`;
  }
  function ca(I) {
    if (I.role === "tool") return co(h(I).summary || I.content || "", 1400);
    if (I.role === "assistant" && Array.isArray(I.toolCalls) && I.toolCalls.length) {
      const x = I.toolCalls.map((M) => `工具: ${M.name} ${M.arguments || "{}"}`.trim());
      return co([I.content || "", ...x].filter(Boolean).join(`
`), 1600);
    }
    return co(m(I.content || "", I.attachments), 1600);
  }
  function Os(I = t.messages) {
    const x = [];
    let M = [];
    return (I || []).forEach(($) => {
      if ($.role === "user" && M.length) {
        x.push(M), M = [$];
        return;
      }
      M.push($);
    }), M.length && x.push(M), x.filter(($) => $.length);
  }
  function mh(I, x = "") {
    const M = [];
    return x?.trim() && (M.push("已有历史摘要:"), M.push(x.trim()), M.push("")), I.forEach(($, K) => {
      M.push(`第 ${K + 1} 段历史:`), $.forEach((j) => {
        const oe = j.role === "user" ? "用户" : j.role === "assistant" ? "助手" : `工具${j.toolName ? `(${j.toolName})` : ""}`;
        M.push(`${oe}: ${ca(j) || "[空]"}`);
      }), M.push("");
    }), M.join(`
`).trim();
  }
  function gh(I, x = "") {
    const M = [];
    return x?.trim() && M.push(x.trim()), I.forEach(($, K) => {
      const j = $.map((oe) => `${oe.role === "user" ? "用户" : oe.role === "assistant" ? "助手" : `工具${oe.toolName ? `(${oe.toolName})` : ""}`}: ${ca(oe) || "[空]"}`).join(`
`);
      M.push(`补充历史 ${K + 1}:
${j}`);
    }), co(M.join(`

`), 6e3);
  }
  function yh() {
    let I = !1;
    return t.messages = t.messages.map((x) => x?.role !== "assistant" || !Array.isArray(x.thoughts) || !x.thoughts.length ? x : (I = !0, {
      ...x,
      thoughts: []
    })), I;
  }
  function _h() {
    const I = Os();
    return I.length ? I[I.length - 1] : [];
  }
  function da(I = [], x = null) {
    const M = _(I);
    if (!M.length) return M;
    const $ = /* @__PURE__ */ new Set();
    return _h().forEach((K) => {
      K === x || K?.role !== "assistant" || _(K.thoughts).forEach((j) => {
        $.add(`${j.label}\0${j.text}`);
      });
    }), M.filter((K) => !$.has(`${K.label}\0${K.text}`));
  }
  function vh(I = []) {
    return I.map((x) => {
      const M = Array.isArray(x.content) ? x.content.map(($) => !$ || typeof $ != "object" ? "" : $.type === "text" ? $.text || "" : $.type === "image_url" ? `[image:${$.name || $.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : x.content || "";
      return x.role === "assistant" && Array.isArray(x.tool_calls) && x.tool_calls.length ? {
        role: "assistant",
        content: [M, x.tool_calls.map(($) => JSON.stringify({
          id: $.id,
          name: $.function?.name || "",
          arguments: $.function?.arguments || "{}"
        })).join(`
`)].filter(Boolean).join(`
`)
      } : x.role === "tool" ? {
        role: "tool",
        content: [x.tool_call_id || "", x.content || ""].filter(Boolean).join(`
`)
      } : {
        role: x.role,
        content: M
      };
    });
  }
  function qs(I = [], x = []) {
    return [...vh(I), {
      role: "system",
      content: x.length ? `TOOLS
${JSON.stringify(x)}` : ""
    }].filter((M) => M.content);
  }
  function Sh(I) {
    return Math.ceil(hb.encode(String(I || "")).length / fb);
  }
  function fo({ messages: I = [], tools: x = [] } = {}) {
    return Sh(JSON.stringify(qs(I, x)));
  }
  function fa(I = [], x = le) {
    const M = v();
    return JSON.stringify({
      provider: String(M?.provider || ""),
      model: String(M?.model || ""),
      messages: qs(I, x)
    });
  }
  function Eh(I) {
    const x = String(I?.model || "").trim();
    return x || (I?.provider === "anthropic" ? "claude" : "gpt-4o");
  }
  async function pa(I, x) {
    const M = await fetch(I, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(x)
    });
    if (!M.ok) throw new Error(`tokenizer_http_${M.status}`);
    return await M.json();
  }
  async function Th(I = [], x = "") {
    if (!I.length) return 0;
    const M = `/api/tokenizers/openai/count?model=${encodeURIComponent(x || "gpt-4o")}`;
    let $ = -1;
    for (const K of I) {
      const j = await pa(M, [K]), oe = Number(j?.token_count);
      if (!Number.isFinite(oe)) throw new Error("tokenizer_invalid_response");
      $ += oe;
    }
    return Math.max(0, $);
  }
  async function wh(I, x) {
    const M = await pa(I, { text: x }), $ = Number(M?.count);
    if (!Number.isFinite($)) throw new Error("tokenizer_invalid_response");
    return $;
  }
  async function ha({ messages: I = [], tools: x = [] } = {}) {
    const M = v(), $ = String(M?.provider || ""), K = qs(I, x), j = JSON.stringify(K);
    try {
      if (pb.has($)) return await Th(K, Eh(M));
      if ($ === "anthropic") return await wh("/api/tokenizers/claude/encode", j);
    } catch {
      return fo({
        messages: I,
        tools: x
      });
    }
    return fo({
      messages: I,
      tools: x
    });
  }
  async function ma(I = [], x = le) {
    const M = fa(I, x), $ = !!t.historySummary;
    let K = dt === M ? kt : await ha({
      messages: I,
      tools: x
    });
    return Number.isFinite(K) || (K = fo({
      messages: I,
      tools: x
    })), dt = M, kt = K, rn = M, t.contextStats = {
      usedTokens: K,
      budgetTokens: V,
      summaryActive: $
    }, K;
  }
  function bh(I = [], x = le) {
    const M = fa(I, x), $ = !!t.historySummary, K = dt === M ? kt : fo({
      messages: I,
      tools: x
    });
    if (rn = M, t.contextStats = {
      usedTokens: K,
      budgetTokens: V,
      summaryActive: $
    }, dt === M) return;
    const j = ++uo;
    ha({
      messages: I,
      tools: x
    }).then((oe) => {
      if (j !== uo || rn !== M || !Number.isFinite(oe)) return;
      dt = M, kt = oe;
      const ne = t.contextStats.usedTokens !== oe || t.contextStats.summaryActive !== $ || t.contextStats.budgetTokens !== V;
      t.contextStats = {
        usedTokens: oe,
        budgetTokens: V,
        summaryActive: $
      }, ne && i();
    }).catch(() => {
    });
  }
  function Lt(I) {
    I?.role === "user" && yh(), t.messages.push({
      ...I,
      attachments: y(I.attachments),
      thoughts: I?.role === "assistant" ? da(I.thoughts) : _(I.thoughts)
    }), s();
  }
  function Ah(I) {
    return Array.isArray(I) ? I.filter((x) => x && typeof x == "object" && x.name).map((x, M) => ({
      id: String(x.id || c(`tool-${M + 1}`)),
      name: String(x.name || ""),
      arguments: typeof x.arguments == "string" ? x.arguments : JSON.stringify(x.arguments || {})
    })) : [];
  }
  function ga({ persist: I = !1 } = {}) {
    const x = Date.now();
    if ((I || x - nt >= 1500) && (s(), nt = x), _e) return;
    _e = !0;
    const M = () => {
      _e = !1, i();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(M);
      return;
    }
    setTimeout(M, 16);
  }
  function Ch() {
    const I = {
      role: "assistant",
      content: "",
      thoughts: [],
      streaming: !0
    };
    return t.messages.push(I), i(), I;
  }
  function ya(I, x = {}) {
    I && (typeof x.content == "string" && (I.content = x.content), Array.isArray(x.thoughts) && (I.thoughts = da(x.thoughts, I)), Array.isArray(x.toolCalls) && (I.toolCalls = Ah(x.toolCalls)), typeof x.streaming == "boolean" && (I.streaming = x.streaming));
  }
  function Vs(I, x = {}) {
    I && (ya(I, {
      ...x,
      streaming: !1
    }), ga({ persist: !0 }));
  }
  function Ih(I, x) {
    for (const [M, $] of n.entries())
      $.runId === I && (n.delete(M), $.cleanup?.(), $.reject(x));
  }
  function xh(I, x) {
    for (const [M, $] of o.entries())
      $.runId === I && (o.delete(M), C(M, "cancelled"), $.cleanup?.(), $.reject(x));
  }
  function Rh(I = "本轮请求已终止。") {
    const x = t.activeRun;
    x && (x.cancelNotice = I, t.progressLabel = "正在终止…", Ih(x.id, /* @__PURE__ */ new Error("tool_aborted")), xh(x.id, /* @__PURE__ */ new Error("tool_aborted")), x.controller.abort(), i());
  }
  function Hs(I = t.messages) {
    const x = [{
      role: "system",
      content: A
    }], M = St(), $ = hh();
    M && x.push(M), $ && x.push($);
    for (const K of I) {
      if (K.role === "assistant" && Array.isArray(K.toolCalls) && K.toolCalls.length) {
        x.push({
          role: "assistant",
          content: K.content || "",
          tool_calls: K.toolCalls.map((j) => ({
            id: j.id,
            type: "function",
            function: {
              name: j.name,
              arguments: j.arguments
            }
          }))
        });
        continue;
      }
      if (K.role === "tool") {
        x.push({
          role: "tool",
          tool_call_id: K.toolCallId,
          content: K.content
        });
        continue;
      }
      x.push({
        role: K.role,
        content: K.role === "user" ? g(K) : K.content
      });
    }
    return x;
  }
  function Js() {
    const I = Os(), x = Math.min(t.archivedTurnCount, I.length);
    return I.slice(x).flat();
  }
  function Ph(I, x, M) {
    const $ = String(M?.message || M || "tool_failed"), [K] = $.split(":");
    return {
      ok: !1,
      toolName: I,
      path: typeof x?.path == "string" ? x.path : "",
      error: K || "tool_failed",
      raw: $,
      message: p(M)
    };
  }
  function _a(I, x, M) {
    if (!I || !x || !M) return;
    const $ = `${x}::${M}`;
    I.toolErrorStreakKey === $ ? I.toolErrorStreakCount += 1 : (I.toolErrorStreakKey = $, I.toolErrorStreakCount = 1), I.toolErrorStreakCount >= 3 && I.lastLightBrakeKey !== $ && (I.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${x}\` 都返回了同一个错误：\`${M}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`, I.lastLightBrakeKey = $);
  }
  function Mh(I) {
    I && (I.toolErrorStreakKey = "", I.toolErrorStreakCount = 0);
  }
  async function Nh(I, x, M) {
    if (!x.length) return;
    const $ = mh(x, t.historySummary), K = gh(x, t.historySummary), j = v();
    try {
      const oe = await I.chat({
        systemPrompt: P,
        messages: [{
          role: "user",
          content: $
        }],
        tools: [],
        toolChoice: "none",
        temperature: Math.min(j.temperature ?? 0.2, 0.2),
        maxTokens: null,
        signal: M
      });
      t.historySummary = String(oe.text || "").trim() || K;
    } catch {
      t.historySummary = K;
    }
  }
  async function kh(I, x) {
    const M = Os(), $ = [D, U];
    let K = Js(), j = Hs(K);
    if (await ma(j), t.contextStats.usedTokens <= k) return j;
    for (const oe of $) {
      const ne = Math.max(t.archivedTurnCount, M.length - Math.min(oe, M.length));
      if (ne > t.archivedTurnCount && (await Nh(I, M.slice(t.archivedTurnCount, ne), x), t.archivedTurnCount = ne, s()), K = Js(), j = Hs(K), await ma(j), t.contextStats.usedTokens <= k)
        return a(`已压缩较早历史，当前上下文 ${Gs()}`), i(), j;
    }
    return a(`最近对话本身已接近上限，当前上下文 ${Gs()}`), i(), j;
  }
  function Lh(I, x, M = {}) {
    const $ = c("tool"), K = t.activeRun;
    return K && K.id === M.runId && K.toolRequestIds.add($), new Promise((j, oe) => {
      let ne = !1, se = null, we = null;
      const Ee = () => {
        se && (clearTimeout(se), se = null), M.signal && we && M.signal.removeEventListener("abort", we);
        const Et = t.activeRun;
        Et && Et.id === M.runId && Et.toolRequestIds.delete($);
      }, re = (Et) => {
        ne || (ne = !0, n.delete($), Ee(), oe(Et));
      }, ln = (Et) => {
        ne || (ne = !0, n.delete($), Ee(), j(Et));
      };
      if (we = () => {
        u("xb-assistant:tool-abort", { requestId: $ }), re(/* @__PURE__ */ new Error("tool_aborted"));
      }, se = setTimeout(() => {
        u("xb-assistant:tool-abort", { requestId: $ }), re(/* @__PURE__ */ new Error("tool_timeout"));
      }, ie), n.set($, {
        runId: M.runId,
        cleanup: Ee,
        resolve: ln,
        reject: re
      }), M.signal) {
        if (M.signal.aborted) {
          we();
          return;
        }
        M.signal.addEventListener("abort", we, { once: !0 });
      }
      u("xb-assistant:tool-call", {
        requestId: $,
        name: I,
        arguments: x
      });
    });
  }
  function Dh(I, x = {}) {
    const M = c("approval"), $ = t.activeRun?.id === x.runId ? t.activeRun : null;
    return Lt({
      role: "assistant",
      content: "这条斜杠命令会直接作用于你当前打开的真实酒馆实例。请确认是否继续执行。",
      approvalRequest: {
        id: M,
        kind: "slash-command",
        command: I,
        status: "pending"
      }
    }), i(), new Promise((K, j) => {
      let oe = !1, ne = null;
      const se = () => {
        $ && $.toolRequestIds.delete(M), x.signal && ne && x.signal.removeEventListener("abort", ne);
      }, we = (re) => {
        oe || (oe = !0, o.delete(M), se(), K(re));
      }, Ee = (re) => {
        oe || (oe = !0, o.delete(M), se(), j(re));
      };
      if (ne = () => {
        C(M, "cancelled"), Ee(/* @__PURE__ */ new Error("tool_aborted"));
      }, $ && $.toolRequestIds.add(M), o.set(M, {
        runId: x.runId,
        cleanup: se,
        resolve: (re) => {
          C(M, re ? "approved" : "declined"), we(re);
        },
        reject: Ee
      }), x.signal) {
        if (x.signal.aborted) {
          ne();
          return;
        }
        x.signal.addEventListener("abort", ne, { once: !0 });
      }
    });
  }
  async function $h(I) {
    const x = b();
    let M = 0;
    for (; M < z; ) {
      if (I.controller.signal.aborted) throw new Error("assistant_aborted");
      M += 1, t.currentRound = M, t.progressLabel = "正在请求模型…", i();
      const $ = v(), K = await kh(x, I.controller.signal);
      let j = null;
      const oe = (se = {}) => {
        const we = typeof se.text == "string", Ee = Array.isArray(se.thoughts);
        !we && !Ee || (j || (j = Ch()), ya(j, {
          ...we ? { content: se.text } : {},
          ...Ee ? { thoughts: se.thoughts } : {}
        }), ga());
      };
      let ne;
      try {
        ne = await x.chat({
          systemPrompt: A,
          messages: K,
          tools: le,
          toolChoice: "auto",
          temperature: $.temperature,
          maxTokens: $.maxTokens,
          reasoning: {
            enabled: $.reasoningEnabled,
            effort: $.reasoningEffort
          },
          signal: I.controller.signal,
          onStreamProgress: oe
        });
      } catch (se) {
        throw j && Vs(j), se;
      }
      if (Array.isArray(ne.toolCalls) && ne.toolCalls.length) {
        j ? Vs(j, {
          content: ne.text || "",
          thoughts: ne.thoughts,
          toolCalls: ne.toolCalls
        }) : Lt({
          role: "assistant",
          content: ne.text || "",
          toolCalls: ne.toolCalls,
          thoughts: ne.thoughts
        }), i();
        for (const se of ne.toolCalls) {
          if (I.controller.signal.aborted) throw new Error("assistant_aborted");
          const we = d(se.arguments, {}), Ee = se.name === xe.RUN_SLASH_COMMAND ? S(we.command) : "";
          t.progressLabel = `正在${f(se.name, we)}…`, i();
          let re = null;
          try {
            se.name === xe.RUN_SLASH_COMMAND && T(Ee) && (t.progressLabel = "等待你确认斜杠命令…", i(), await Dh(Ee, {
              runId: I.id,
              signal: I.controller.signal
            }) || (re = R(Ee, !1))), re || (re = await Lh(se.name, we, {
              runId: I.id,
              signal: I.controller.signal
            })), se.name === xe.RUN_SLASH_COMMAND && Ee && re?.ok !== !1 && T(Ee) && (re = {
              ...re,
              approval: R(Ee, !0)
            }), re?.ok === !1 && re.error !== "user_declined" ? _a(I, se.name, re.error || "tool_failed") : Mh(I);
          } catch (ln) {
            if (L(ln)) throw ln;
            re = Ph(se.name, we, ln), _a(I, se.name, re.error);
          }
          Lt({
            role: "tool",
            toolCallId: se.id,
            toolName: se.name,
            content: JSON.stringify(re, null, 2)
          }), i();
        }
        continue;
      }
      j ? Vs(j, {
        content: ne.text || "没有拿到有效回复。",
        thoughts: ne.thoughts
      }) : Lt({
        role: "assistant",
        content: ne.text || "没有拿到有效回复。",
        thoughts: ne.thoughts
      }), t.progressLabel = "", i();
      return;
    }
    Lt({
      role: "assistant",
      content: `这轮工具调用已经到上限了（${z}/${z}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`
    }), t.progressLabel = "", i();
  }
  return {
    resetCompactionState: an,
    buildContextMeterLabel: Gs,
    updateContextStats: bh,
    pushMessage: Lt,
    cancelActiveRun: Rh,
    toProviderMessages: Hs,
    getActiveContextMessages: Js,
    runAssistantLoop: $h
  };
}
var eh = "openai-compatible", th = "默认", fr = {
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
function jr() {
  return JSON.parse(JSON.stringify(fr));
}
function ea() {
  return {
    provider: eh,
    modelConfigs: jr()
  };
}
function jn(e) {
  return String(e || "").trim() || "默认";
}
function gb(e = {}) {
  const t = jr();
  return Object.keys(fr).forEach((n) => {
    t[n] = {
      ...fr[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function yb(e) {
  return typeof e == "string" && e.trim() ? e : eh;
}
function _b(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs
  } } : {};
}
function vb(e = {}, t) {
  const n = {}, o = _b(e, t);
  return Object.entries(o).forEach(([s, i]) => {
    if (!i || typeof i != "object") return;
    const a = jn(s);
    n[a] = {
      provider: yb(i.provider),
      modelConfigs: gb(i.modelConfigs || {})
    };
  }), Object.keys(n).length || (n[th] = ea()), n;
}
function Sb(e, t) {
  const n = jn(t);
  return e[n] ? n : Object.keys(e)[0];
}
function nh(e = {}) {
  const t = vb(e, jn(e.currentPresetName || e.presetDraftName || "默认")), n = Sb(t, e.currentPresetName), o = t[n] || ea();
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    currentPresetName: n,
    presetDraftName: jn(e.presetDraftName || n),
    presetNames: Object.keys(t),
    presets: t,
    provider: o.provider,
    modelConfigs: o.modelConfigs
  };
}
var Eb = /* @__PURE__ */ new Set([
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
]), Tb = /* @__PURE__ */ new Set([
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
function ta(e) {
  const t = String(e || "").trim();
  return t ? t.startsWith("/") ? t : `/${t}` : "";
}
function oh(e) {
  const t = ta(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  return n ? n.split(/\s+/)[0].toLowerCase() : "";
}
function wb(e) {
  const t = ta(e);
  if (!t) return "";
  const n = t.slice(1).trim();
  if (!n) return "";
  const o = n.search(/\s/);
  return o < 0 ? "" : n.slice(o + 1).trim();
}
function pr(e) {
  const t = String(e || "").trim();
  return t ? t.match(/(?:[^\s"]+|"[^"]*")+/g) || [] : [];
}
function ts(e) {
  const t = pr(e), n = /* @__PURE__ */ new Map(), o = [];
  return t.forEach((s) => {
    const i = s.match(/^([A-Za-z0-9_-]+)=(.+)$/);
    if (!i) {
      o.push(s);
      return;
    }
    const a = String(i[1] || "").trim(), u = String(i[2] || "").trim();
    n.set(a, u);
  }), {
    tokens: t,
    named: n,
    positional: o
  };
}
function bb(e) {
  const t = String(e || "").trim();
  return t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}
function gi(e) {
  const t = bb(e).toLowerCase();
  return [
    "false",
    "off",
    "0",
    "no"
  ].includes(t);
}
function yi(e, t = [], n = {}) {
  const { allowPositional: o = !1 } = n, s = ts(e);
  return !o && s.positional.length ? !1 : Array.from(s.named.keys()).every((i) => t.includes(i));
}
function Ab(e) {
  const t = oh(e);
  if (!t) return !1;
  if (Eb.has(t)) return !0;
  const n = wb(e);
  if (!Tb.has(t)) return !1;
  switch (t) {
    case "api":
    case "context":
    case "model":
      return yi(n, ["quiet"]);
    case "tokenizer":
      return pr(n).length === 0;
    case "api-url":
      return yi(n, [
        "api",
        "connect",
        "quiet"
      ]);
    case "instruct":
      return yi(n, ["quiet", "forceGet"]);
    case "instruct-state":
      return pr(n).length === 0;
    case "getchatbook": {
      const o = ts(n);
      return !o.positional.length && !o.named.has("name") && o.named.has("create") && gi(o.named.get("create"));
    }
    case "getpersonabook": {
      const o = ts(n);
      return o.positional.length || o.named.has("name") ? !1 : o.named.size ? o.named.size === 1 && o.named.has("create") && gi(o.named.get("create")) : !0;
    }
    case "getcharbook": {
      const o = ts(n), s = ["type", "create"];
      return !Array.from(o.named.keys()).every((i) => s.includes(i)) || o.named.has("name") || o.named.has("create") && !gi(o.named.get("create")) ? !1 : o.positional.length <= 1;
    }
    default:
      return !1;
  }
}
function Cb(e) {
  return oh(e) ? !Ab(e) : !1;
}
var _i = "littlewhitebox.assistant.session.v2", Ib = 60, vc = 16e3;
function ns(e) {
  const t = String(e || "");
  return t.length <= vc ? t : `${t.slice(0, vc)}

[内容过长，已截断保存]`;
}
function xb(e, t, n) {
  const o = e?.approvalRequest && typeof e.approvalRequest == "object" ? {
    id: String(e.approvalRequest.id || ""),
    kind: String(e.approvalRequest.kind || ""),
    command: String(e.approvalRequest.command || ""),
    status: String(e.approvalRequest.status || "")
  } : null;
  return {
    role: e.role,
    content: ns(e.content),
    attachments: t(e.attachments).map((s) => ({
      kind: s.kind,
      name: s.name,
      type: s.type,
      size: s.size
    })),
    toolCallId: e.toolCallId || "",
    toolName: e.toolName || "",
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.map((s) => ({
      id: s.id || "",
      name: s.name || "",
      arguments: ns(s.arguments || "{}")
    })) : [],
    thoughts: n(e.thoughts).map((s) => ({
      label: s.label,
      text: ns(s.text)
    })),
    approvalRequest: o && o.status && o.status !== "pending" ? o : void 0
  };
}
function Rb(e, t) {
  const { normalizeAttachments: n, normalizeThoughtBlocks: o, createRequestId: s } = t;
  if (!e || typeof e != "object" || ![
    "user",
    "assistant",
    "tool"
  ].includes(e.role)) return null;
  const i = e.approvalRequest && typeof e.approvalRequest == "object" ? {
    id: String(e.approvalRequest.id || ""),
    kind: String(e.approvalRequest.kind || ""),
    command: String(e.approvalRequest.command || ""),
    status: String(e.approvalRequest.status || "")
  } : void 0;
  return {
    role: e.role,
    content: String(e.content || ""),
    attachments: n(e.attachments),
    toolCallId: e.toolCallId ? String(e.toolCallId) : void 0,
    toolName: e.toolName ? String(e.toolName) : void 0,
    toolCalls: Array.isArray(e.toolCalls) ? e.toolCalls.filter((a) => a && typeof a == "object" && a.name).map((a) => ({
      id: String(a.id || s("tool")),
      name: String(a.name || ""),
      arguments: String(a.arguments || "{}")
    })) : void 0,
    thoughts: o(e.thoughts),
    approvalRequest: i?.status && i.status !== "pending" ? i : void 0
  };
}
function Pb(e) {
  return !(!e || typeof e != "object" || e.streaming || e.approvalRequest?.status === "pending");
}
function Mb(e) {
  const { state: t, storage: n = globalThis.localStorage, safeJsonParse: o, createRequestId: s, normalizeAttachments: i, normalizeThoughtBlocks: a, getActiveContextMessages: u } = e;
  function c() {
    try {
      const p = u().filter(Pb).slice(-Ib), f = ns(t.historySummary || "");
      if (!p.length && !f) {
        n.removeItem(_i);
        return;
      }
      n.setItem(_i, JSON.stringify({
        messages: p.map((h) => xb(h, i, a)),
        historySummary: f,
        sidebarCollapsed: t.sidebarCollapsed
      }));
    } catch {
    }
  }
  function d() {
    try {
      const p = o(n.getItem(_i), {});
      t.messages = Array.isArray(p.messages) ? p.messages.map((f) => Rb(f, {
        normalizeAttachments: i,
        normalizeThoughtBlocks: a,
        createRequestId: s
      })).filter(Boolean) : [], t.historySummary = String(p.historySummary || ""), t.archivedTurnCount = 0, t.sidebarCollapsed = p.sidebarCollapsed !== void 0 ? !!p.sidebarCollapsed : !0;
    } catch {
      t.messages = [], t.historySummary = "", t.archivedTurnCount = 0, t.sidebarCollapsed = !0;
    }
  }
  return {
    persistSession: c,
    restoreSession: d
  };
}
function Nb(e) {
  const { state: t, showToast: n, render: o, acceptedImageMimeTypes: s, maxImageAttachments: i, maxImageFileBytes: a } = e;
  function u(S) {
    return Array.isArray(S) ? S.map((T) => {
      if (!T || typeof T != "object" || T.kind !== "image") return null;
      const C = String(T.type || "").trim().toLowerCase(), R = typeof T.dataUrl == "string" ? T.dataUrl.trim() : "", L = R.startsWith("data:image/");
      return C && !s.includes(C) ? null : {
        kind: "image",
        name: String(T.name || "image").trim() || "image",
        type: C || "image/png",
        dataUrl: L ? R : "",
        size: Math.max(0, Number(T.size) || 0)
      };
    }).filter(Boolean) : [];
  }
  function c(S) {
    const T = u(S);
    if (!T.length) return "";
    const C = T.map((R) => R.name).join("、");
    return `[附图 ${T.length} 张：${C}]`;
  }
  function d(S, T) {
    const C = c(T), R = String(S || "").trim();
    return C ? [R, C].filter(Boolean).join(`
`) : R;
  }
  function p(S = {}) {
    const T = u(S.attachments).filter((R) => R.dataUrl), C = [];
    return S.content?.trim() && C.push({
      type: "text",
      text: S.content.trim()
    }), T.forEach((R) => {
      C.push({
        type: "image_url",
        image_url: { url: R.dataUrl },
        mimeType: R.type,
        name: R.name
      });
    }), C.length ? C : [{
      type: "text",
      text: ""
    }];
  }
  function f(S) {
    return new Promise((T, C) => {
      const R = new FileReader();
      R.onerror = () => C(/* @__PURE__ */ new Error(`读取图片失败：${S.name || "未命名图片"}`)), R.onload = () => {
        T({
          kind: "image",
          name: h(S),
          type: S.type || "image/png",
          size: Number(S.size) || 0,
          dataUrl: typeof R.result == "string" ? R.result : ""
        });
      }, R.readAsDataURL(S);
    });
  }
  function h(S) {
    const T = typeof S?.name == "string" ? S.name.trim() : "";
    if (T) return T;
    const C = m(S?.type);
    return `clipboard-image-${Date.now()}.${C}`;
  }
  function m(S) {
    switch (String(S || "").toLowerCase()) {
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
  function g(S) {
    const T = Array.isArray(S) ? S.filter(Boolean) : [], C = Math.max(0, i - t.draftAttachments.length);
    if (!C) return {
      validFiles: [],
      rejectedReason: `最多只能附 ${i} 张图片`,
      reachedLimit: !0,
      hadOverflow: !1
    };
    const R = T.slice(0, C), L = [];
    let b = "";
    return R.forEach((v) => {
      if (!s.includes(v.type)) {
        b = "只支持 PNG、JPG、WEBP、GIF 图片";
        return;
      }
      if ((Number(v.size) || 0) > a) {
        b = `单张图片不能超过 ${Math.round(a / (1024 * 1024))}MB`;
        return;
      }
      L.push(v);
    }), {
      validFiles: L,
      rejectedReason: b,
      reachedLimit: !1,
      hadOverflow: T.length > C
    };
  }
  async function y(S) {
    const T = Array.isArray(S) ? S.filter(Boolean) : [];
    if (!T.length) return !1;
    const { validFiles: C, rejectedReason: R, reachedLimit: L, hadOverflow: b } = g(T);
    if (!C.length)
      return n(R || "没有可添加的图片"), L || !!R;
    try {
      const v = await Promise.all(C.map((A) => f(A)));
      return t.draftAttachments = [...t.draftAttachments, ...v].slice(0, i), o(), (R || b) && n(R || `最多只能附 ${i} 张图片`), !0;
    } catch (v) {
      return n(String(v?.message || "读取图片失败")), !0;
    }
  }
  function _(S, T = [], C = {}) {
    const R = u(T);
    S.replaceChildren(), S.style.display = R.length ? "" : "none", R.length && R.forEach((L, b) => {
      const v = document.createElement("div");
      if (v.className = C.compact ? "xb-assistant-attachment-card compact" : "xb-assistant-attachment-card", L.dataUrl) {
        const P = document.createElement("img");
        P.className = "xb-assistant-attachment-image", P.src = L.dataUrl, P.alt = L.name, v.appendChild(P);
      } else {
        const P = document.createElement("div");
        P.className = "xb-assistant-attachment-placeholder", P.textContent = "图片", v.appendChild(P);
      }
      const A = document.createElement("div");
      if (A.className = "xb-assistant-attachment-name", A.textContent = L.name, v.appendChild(A), typeof C.onRemove == "function") {
        const P = document.createElement("button");
        P.type = "button", P.className = "xb-assistant-attachment-remove", P.textContent = "×", P.title = "移除图片", P.addEventListener("click", () => C.onRemove(b)), v.appendChild(P);
      }
      S.appendChild(v);
    });
  }
  return {
    normalizeAttachments: u,
    buildAttachmentSummary: c,
    buildTextWithAttachmentSummary: d,
    buildUserContentParts: p,
    appendDraftImageFiles: y,
    renderAttachmentGallery: _
  };
}
var kb = { chat: { exclude: [
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
function Bo(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const o = document.createElement("option");
    o.value = "", o.textContent = n, e.appendChild(o);
  }
  t.forEach((o) => {
    const s = document.createElement("option");
    s.value = o.value, s.textContent = o.label, e.appendChild(s);
  });
}
function na(e = []) {
  const t = [...new Set(e.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))], n = kb.chat, o = t.filter((s) => {
    const i = s.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return o.length ? o : t;
}
function Fs(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function eo(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function Lb(e) {
  const t = Fs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return eo([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return eo([`${t}/v1/models`, `${t}/models`]);
}
function Db(e) {
  const t = Fs(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return eo([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return eo([`${t}/v1/models`, `${t}/models`]);
}
function $b(e, t) {
  const n = Fs(e);
  if (!n) return [];
  const o = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return eo([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${o}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${o}/v1beta/models`,
    `${o}/models?key=${encodeURIComponent(t)}`,
    `${o}/models`
  ]);
}
function Ub(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((o) => typeof o == "string" && o.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function Fb(e, t = {}) {
  const n = await fetch(e, t), o = await n.text();
  let s = null, i = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (a) {
    i = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: s,
    rawText: o,
    parseError: i,
    errorSnippet: Ub(s, o)
  };
}
function Bb(e) {
  return na((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Gb(e) {
  return na((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Ob(e) {
  return na((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function vi({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: o }) {
  let s = null;
  for (const i of e) for (const a of t) {
    const u = await Fb(i, a);
    if (!u.ok) {
      s = u;
      continue;
    }
    if (u.parseError) {
      s = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    s = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (s) {
    const i = s.url ? ` (${s.url})` : "", a = s.errorSnippet ? `：${s.errorSnippet}` : "";
    throw new Error(`${o} 拉取模型失败：${s.status || "unknown"}${a}${i}`);
  }
  throw new Error(`${o} 拉取模型失败：未获取到模型列表。`);
}
async function qb(e) {
  const t = e.provider, n = Fs(e.baseUrl || ""), o = String(e.apiKey || "").trim();
  if (!o) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await vi({
    urls: $b(n, o),
    requestOptionsList: [
      { headers: {
        Accept: "application/json",
        "x-goog-api-key": o
      } },
      { headers: {
        Accept: "application/json",
        Authorization: `Bearer ${o}`
      } },
      { headers: { Accept: "application/json" } }
    ],
    extractModels: Ob,
    providerLabel: "Google AI"
  }) : t === "anthropic" ? await vi({
    urls: Db(n),
    requestOptionsList: [{ headers: {
      "x-api-key": o,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: Gb,
    providerLabel: "Anthropic"
  }) : await vi({
    urls: Lb(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${o}`,
      Accept: "application/json"
    } }],
    extractModels: Bb,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function Vb(e) {
  const { state: t, post: n, render: o, showToast: s, describeError: i, getPullState: a, setPullState: u, setProviderModels: c, getProviderModels: d, getProviderLabel: p, normalizeReasoningEffort: f, normalizeAssistantConfig: h, normalizePresetName: m, buildDefaultPreset: g, cloneDefaultModelConfigs: y, defaultPresetName: _, requestTimeoutMs: S, toolModeOptions: T, reasoningEffortOptions: C } = e;
  function R() {
    const k = t.config || {}, D = k.provider || "openai-compatible", U = (k.modelConfigs || {})[D] || {};
    return {
      provider: D,
      baseUrl: U.baseUrl || "",
      model: U.model || "",
      apiKey: U.apiKey || "",
      temperature: Number(U.temperature ?? 0.2),
      maxTokens: null,
      timeoutMs: S,
      toolMode: U.toolMode || "native",
      reasoningEnabled: !!U.reasoningEnabled,
      reasoningEffort: f(U.reasoningEffort)
    };
  }
  function L(k, D) {
    return {
      baseUrl: k.querySelector("#xb-assistant-base-url").value.trim(),
      model: k.querySelector("#xb-assistant-model").value.trim(),
      apiKey: k.querySelector("#xb-assistant-api-key").value.trim(),
      temperature: Number(((t.config?.modelConfigs || {})[D] || {}).temperature ?? 0.2),
      reasoningEnabled: k.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: f(k.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: D === "openai-compatible" ? k.querySelector("#xb-assistant-tool-mode")?.value || "native" : void 0
    };
  }
  function b(k) {
    t.config && (t.config.presetDraftName = m(k.querySelector("#xb-assistant-preset-name")?.value));
  }
  function v(k) {
    if (!t.config) return;
    b(k);
    const D = k.querySelector("#xb-assistant-provider").value, U = m(t.config.currentPresetName);
    t.config = {
      ...h({
        ...t.config,
        currentPresetName: U,
        presetDraftName: t.config.presetDraftName,
        presets: {
          ...t.config.presets || {},
          [U]: {
            ...(t.config.presets || {})[U] || g(),
            provider: D,
            modelConfigs: {
              ...((t.config.presets || {})[U] || {}).modelConfigs || y(),
              [D]: {
                ...(((t.config.presets || {})[U] || {}).modelConfigs || y())[D] || {},
                ...L(k, D)
              }
            }
          }
        }
      }),
      provider: D
    };
  }
  function A(k) {
    if (!t.config) return;
    const D = t.config.provider || "openai-compatible", U = (t.config.modelConfigs || {})[D] || {}, z = d(D), ie = k.querySelector("#xb-assistant-tool-mode-wrap"), le = k.querySelector("#xb-assistant-tool-mode"), xe = k.querySelector("#xb-assistant-reasoning-enabled"), _e = k.querySelector("#xb-assistant-reasoning-effort-wrap"), nt = k.querySelector("#xb-assistant-reasoning-effort"), rn = k.querySelector("#xb-assistant-model-pulled"), dt = k.querySelector("#xb-assistant-preset-select"), kt = k.querySelector("#xb-assistant-preset-name");
    Bo(dt, (t.config.presetNames || []).map((St) => ({
      value: St,
      label: St
    }))), dt.value = t.config.currentPresetName || _, kt.value = t.config.presetDraftName || t.config.currentPresetName || _, k.querySelector("#xb-assistant-provider").value = D, k.querySelector("#xb-assistant-base-url").value = U.baseUrl || "", k.querySelector("#xb-assistant-model").value = U.model || "", k.querySelector("#xb-assistant-api-key").value = U.apiKey || "", ie.style.display = D === "openai-compatible" ? "" : "none", Bo(le, T), le.value = U.toolMode || "native", Bo(nt, C), xe.checked = !!U.reasoningEnabled, nt.value = f(U.reasoningEffort), _e.style.display = xe.checked ? "" : "none", Bo(rn, z.map((St) => ({
      value: St,
      label: St
    })), "手动填写");
    const uo = k.querySelector("#xb-assistant-runtime"), an = a(D);
    uo.textContent = t.runtime ? `预设「${t.config.currentPresetName || _}」 · ${p(D)} · 已索引 ${t.runtime.indexedFileCount || 0} 个前端源码文件${an.message ? ` · ${an.message}` : ""}` : an.message || "";
  }
  function P(k) {
    v(k);
    const D = m(k.querySelector("#xb-assistant-preset-name")?.value), U = m(t.config?.currentPresetName || _), z = (t.config?.presets || {})[D];
    if (D !== U && z) {
      s(`预设「${D}」已存在，请从下拉切换到它；如果要新建，请换个名字。`), o();
      return;
    }
    const ie = (t.config?.presets || {})[U] || g(), le = {
      ...t.config?.presets || {},
      [D]: ie
    };
    t.config = h({
      ...t.config,
      currentPresetName: D,
      presetDraftName: D,
      presets: le
    }), n("xb-assistant:save-config", {
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || _,
      presets: t.config?.presets || {}
    });
  }
  function q(k) {
    if (v(k), Object.keys(t.config?.presets || {}).length <= 1) {
      s("至少要保留一套预设");
      return;
    }
    const D = m(t.config?.currentPresetName || _), U = { ...t.config?.presets || {} };
    delete U[D];
    const z = Object.keys(U)[0] || _;
    t.config = h({
      ...t.config,
      currentPresetName: z,
      presetDraftName: z,
      presets: U
    }), n("xb-assistant:save-config", {
      workspaceFileName: t.config?.workspaceFileName || "",
      currentPresetName: t.config?.currentPresetName || _,
      presets: t.config?.presets || {}
    }), o();
  }
  function V(k) {
    k.querySelector("#xb-assistant-provider").addEventListener("change", () => {
      v(k), t.config = {
        ...t.config || {},
        provider: k.querySelector("#xb-assistant-provider").value
      }, o();
    }), k.querySelector("#xb-assistant-preset-select").addEventListener("change", (D) => {
      v(k);
      const U = m(D.currentTarget.value), z = (t.config?.presets || {})[U] || g();
      t.config = h({
        ...t.config,
        currentPresetName: U,
        presetDraftName: U,
        provider: z.provider,
        modelConfigs: z.modelConfigs
      }), o();
    }), k.querySelector("#xb-assistant-preset-name").addEventListener("input", () => {
      b(k);
    }), k.querySelector("#xb-assistant-model-pulled").addEventListener("change", (D) => {
      const U = D.currentTarget.value;
      U && (k.querySelector("#xb-assistant-model").value = U);
    }), k.querySelector("#xb-assistant-toggle-key").addEventListener("click", () => {
      const D = k.querySelector("#xb-assistant-api-key");
      D.type = D.type === "password" ? "text" : "password", o();
    }), k.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      v(k), o();
    }), k.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      v(k);
    }), k.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      v(k);
      const D = R();
      u(D.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), o();
      try {
        const U = await qb(D);
        c(D.provider, U), u(D.provider, {
          status: "success",
          message: `已拉取 ${U.length} 个模型`
        });
      } catch (U) {
        c(D.provider, []), u(D.provider, {
          status: "error",
          message: i(U)
        });
      }
      o();
    }), k.querySelector("#xb-assistant-save").addEventListener("click", () => {
      P(k);
    }), k.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      q(k);
    });
  }
  return {
    getActiveProviderConfig: R,
    syncCurrentProviderDraft: v,
    syncConfigToForm: A,
    bindSettingsPanelEvents: V
  };
}
function Hb(e) {
  const { state: t, examplePrompts: n, toolNames: o, formatToolResultDisplay: s, normalizeThoughtBlocks: i, normalizeAttachments: a, renderAttachmentGallery: u } = e;
  let c = !1, d = null;
  function p(v) {
    return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function f(v) {
    const A = String(v || "").trim();
    if (!A) return "";
    try {
      const P = globalThis.parent?.showdown || globalThis.showdown, q = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
      if (P?.Converter && q?.sanitize) {
        const V = new P.Converter({
          simpleLineBreaks: !0,
          strikethrough: !0,
          tables: !0,
          tasklists: !0,
          ghCodeBlocks: !0,
          simplifiedAutoLink: !0,
          openLinksInNewWindow: !0,
          emoji: !1
        }).makeHtml(A);
        return q.sanitize(V, {
          USE_PROFILES: { html: !0 },
          FORBID_TAGS: ["style", "script"]
        });
      }
    } catch {
    }
    return p(A).replace(/\n/g, "<br>");
  }
  function h(v) {
    const A = new DOMParser().parseFromString(`<body>${String(v || "")}</body>`, "text/html"), P = document.createDocumentFragment();
    return Array.from(A.body.childNodes).forEach((q) => {
      P.appendChild(document.importNode(q, !0));
    }), P;
  }
  function m(v) {
    return JSON.stringify({
      role: v.role,
      content: String(v.content || ""),
      toolCallId: String(v.toolCallId || ""),
      toolName: String(v.toolName || ""),
      toolCalls: Array.isArray(v.toolCalls) ? v.toolCalls.map((A) => ({
        id: String(A.id || ""),
        name: String(A.name || ""),
        arguments: String(A.arguments || "")
      })) : [],
      thoughts: i(v.thoughts),
      attachments: a(v.attachments).map((A) => ({
        kind: A.kind,
        name: A.name,
        type: A.type,
        size: A.size
      })),
      approvalRequest: v.approvalRequest ? {
        id: String(v.approvalRequest.id || ""),
        kind: String(v.approvalRequest.kind || ""),
        command: String(v.approvalRequest.command || ""),
        status: String(v.approvalRequest.status || "")
      } : null,
      streaming: !!v.streaming
    });
  }
  function g(v) {
    const A = document.createElement("div");
    A.className = `xb-assistant-bubble role-${v.role}`;
    const P = document.createElement("div");
    if (P.className = "xb-assistant-meta", P.textContent = v.role === "user" ? "你" : v.role === "assistant" ? Array.isArray(v.toolCalls) && v.toolCalls.length ? `小白助手 · 已发起 ${v.toolCalls.length} 个工具调用${Array.isArray(v.thoughts) && v.thoughts.length ? ` · 含 ${v.thoughts.length} 段思考` : ""}` : `小白助手${v.streaming ? " · 正在生成" : ""}${Array.isArray(v.thoughts) && v.thoughts.length ? ` · 含 ${v.thoughts.length} 段思考` : ""}` : `工具结果${v.toolName ? ` · ${v.toolName}` : ""}`, v.role === "tool") {
      const V = s(v), k = document.createElement("pre");
      if (k.className = "xb-assistant-content tool-summary", k.textContent = V.summary || "工具已返回结果。", A.append(P, k), V.details) {
        const D = document.createElement("details");
        D.className = "xb-assistant-tool-details";
        const U = document.createElement("summary");
        U.textContent = v.toolName === o.READ ? "展开文件内容" : "展开详细结果";
        const z = document.createElement("pre");
        z.className = "xb-assistant-content tool-detail", z.textContent = V.details, D.append(U, z), A.appendChild(D);
      }
      return A;
    }
    const q = document.createElement("div");
    if (q.className = "xb-assistant-content xb-assistant-markdown", q.appendChild(h(f(v.content || (v.role === "assistant" ? v.streaming ? "思考中…" : "我先查一下相关代码。" : "")))), A.append(P, q), Array.isArray(v.attachments) && v.attachments.length) {
      const V = document.createElement("div");
      V.className = "xb-assistant-attachment-gallery", u(V, v.attachments, { compact: !0 }), A.appendChild(V);
    }
    if (v.role === "assistant" && v.approvalRequest?.kind === "slash-command") {
      const V = document.createElement("div");
      V.className = "xb-assistant-approval";
      const k = document.createElement("div");
      k.className = "xb-assistant-approval-title", k.textContent = "待确认的斜杠命令";
      const D = document.createElement("pre");
      D.className = "xb-assistant-content xb-assistant-approval-command", D.textContent = v.approvalRequest.command || "";
      const U = document.createElement("div");
      if (U.className = "xb-assistant-approval-note", U.textContent = v.approvalRequest.status === "approved" ? "已同意，命令已进入执行流程。" : v.approvalRequest.status === "declined" ? "已拒绝，本次不会执行这条命令。" : v.approvalRequest.status === "cancelled" ? "本轮请求已终止，这条命令未执行。" : "这条命令可能改动真实实例状态；点“是”后才会真正执行。", V.append(k, D, U), v.approvalRequest.status === "pending") {
        const z = document.createElement("div");
        z.className = "xb-assistant-approval-actions";
        const ie = document.createElement("button");
        ie.type = "button", ie.className = "xb-assistant-approval-button", ie.dataset.approvalId = v.approvalRequest.id, ie.dataset.approvalDecision = "approve", ie.textContent = "是，执行";
        const le = document.createElement("button");
        le.type = "button", le.className = "xb-assistant-approval-button secondary", le.dataset.approvalId = v.approvalRequest.id, le.dataset.approvalDecision = "decline", le.textContent = "否，跳过", z.append(ie, le), V.appendChild(z);
      }
      A.appendChild(V);
    }
    if (v.role === "assistant" && Array.isArray(v.thoughts) && v.thoughts.length) {
      const V = document.createElement("details");
      V.className = "xb-assistant-thought-details";
      const k = document.createElement("summary");
      k.textContent = v.thoughts.length > 1 ? `展开思考块（${v.thoughts.length} 段）` : "展开思考块", V.appendChild(k), v.thoughts.forEach((D) => {
        const U = document.createElement("div");
        U.className = "xb-assistant-thought-block";
        const z = document.createElement("div");
        z.className = "xb-assistant-thought-label", z.textContent = D.label;
        const ie = document.createElement("pre");
        ie.className = "xb-assistant-content xb-assistant-thought-content", ie.textContent = D.text, U.append(z, ie), V.appendChild(U);
      }), A.appendChild(V);
    }
    return A;
  }
  function y(v) {
    const A = Array.from(v.querySelectorAll(".xb-assistant-bubble"));
    if (!t.messages.length) {
      v.innerHTML = "";
      const q = document.createElement("div");
      q.className = "xb-assistant-empty", q.innerHTML = "<h2>你好，我是小白助手</h2><p>我运行在你当前打开的 SillyTavern 酒馆里，专门帮你解答 LittleWhiteBox 和酒馆前端的问题。</p><p><strong>我能做什么：</strong></p><ul><li><strong>查看源码</strong>：读取 LittleWhiteBox 和酒馆前端的代码快照（构建时索引），帮你找按钮位置、设置逻辑、报错链路。</li><li><strong>查询实例</strong>：执行斜杠命令查询你当前酒馆的实时状态，比如当前 API、模型、角色、扩展开关等。</li><li><strong>记录工作</strong>：把排查结论写到 <code>user/files/LittleWhiteBox_Assistant_Worklog.md</code>，方便你后续查看。</li></ul><p><strong>我不能做什么：</strong></p><ul><li>不能访问后端代码、数据库、API Key 存储位置。</li><li>不能修改你的源码或配置文件。</li><li>代码快照可能不包含你最新的修改；如需确认当前实例状态，我会用斜杠命令查询。</li></ul><p>下面是一些示例问题，点击后会填入输入框（不会自动发送）：</p>";
      const V = document.createElement("div");
      V.className = "xb-assistant-examples", n.forEach((k) => {
        const D = document.createElement("button");
        D.type = "button", D.className = "xb-assistant-example-chip", D.dataset.prompt = k, D.textContent = k, V.appendChild(D);
      }), q.appendChild(V), v.appendChild(q);
      return;
    }
    const P = v.querySelector(".xb-assistant-empty");
    P && P.remove(), t.messages.forEach((q, V) => {
      const k = m(q), D = A[V] || null;
      if (D?.dataset.renderSignature === k) return;
      const U = g(q);
      U.dataset.renderSignature = k, D ? v.replaceChild(U, D) : v.appendChild(U);
    }), A.slice(t.messages.length).forEach((q) => q.remove()), t.autoScroll && (v.scrollTop = v.scrollHeight);
  }
  function _(v) {
    if (!v) return;
    const A = () => {
      v.scrollTop = v.scrollHeight;
    };
    A(), requestAnimationFrame(() => {
      A(), requestAnimationFrame(A);
    });
  }
  function S(v) {
    v && v.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  function T(v) {
    const A = v.querySelector("#xb-assistant-chat"), P = v.querySelector("#xb-assistant-scroll-top"), q = v.querySelector("#xb-assistant-scroll-bottom");
    if (!A || !P || !q) return;
    const V = A.scrollTop, k = A.scrollHeight, D = A.clientHeight, U = 80;
    P.classList.toggle("visible", V > U), q.classList.toggle("visible", k - V - D > U);
  }
  function C(v) {
    v.querySelector("#xb-assistant-scroll-helpers")?.classList.add("active");
  }
  function R(v) {
    v.querySelector("#xb-assistant-scroll-helpers")?.classList.remove("active");
  }
  function L(v) {
    d && clearTimeout(d), d = setTimeout(() => {
      R(v), d = null;
    }, 1500);
  }
  function b(v) {
    c || (c = !0, requestAnimationFrame(() => {
      T(v), C(v), L(v), c = !1;
    }));
  }
  return {
    renderMessages: y,
    scrollChatToBottom: _,
    scrollChatToTop: S,
    updateChatScrollButtonsVisibility: T,
    handleAssistantChatScroll: b
  };
}
var Jb = [
  "这个功能的代码入口在哪个文件？",
  "我当前用的是什么 API 和模型？",
  "为什么某个设置勾上后刷新又没了？",
  "帮我查一下某个报错是从哪条链路抛出来的。"
], Wb = [
  "项目结构提示：",
  "你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。",
  "你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。",
  "你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。",
  "如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智、模块分层和常见入口，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。",
  "如果用户问 STscript 或 SillyTavern 前端 API，可以优先查看这两份参考资料：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 与 scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。"
].join(`
`), Kb = [
  "你是“小白助手”，是 SillyTavern 中 LittleWhiteBox（中文一般称“小白X”）插件的内置技术支持助手，当前正在这个界面中为用户提供帮助。",
  "",
  "你的职责是：",
  "- 解答 LittleWhiteBox 和 SillyTavern 前端代码、设置、模块行为和报错问题。",
  "- 当问题涉及具体实现、文件路径、设置逻辑或错误原因时，优先使用工具查证后再回答。",
  "",
  "你的能力范围：",
  "- 默认只读代码与资料；如果需要写入，只能写固定工作记录，不允许改代码。",
  "- 可读取已索引的公开前端文件（LittleWhiteBox 和 SillyTavern public/scripts/*）；**这些文件是构建时的静态快照，不是用户当前实例的实时状态**。",
  "- 可执行斜杠命令工具（RunSlashCommand）；**该工具作用于用户当前真实酒馆实例，可以查询实时状态（如当前 API、模型、角色等）**。",
  "- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，文件不存在就创建，用它保存长期排查结论和用户指定要你记住的事情。",
  "- 不能访问后端、数据库、未索引文件。",
  "",
  "**重要区分 - 静态快照 vs 动态实例**：",
  "- LS/Glob/Grep/Read 工具读取的是**静态代码快照**（构建时索引），用于查看源码实现、配置逻辑、模块结构。",
  "- RunSlashCommand 工具查询的是**动态运行实例**（用户当前打开的酒馆），用于获取实时状态、设置值、角色数据。",
  '- 当用户问"我的 API 是什么"时，用 RunSlashCommand；当用户问"API 设置的代码在哪"时，用 Grep/Read。',
  "- 索引快照可能不包含用户最新修改的代码或配置文件；如需确认用户当前实例的实际状态，必须用 RunSlashCommand。",
  "",
  Wb,
  "",
  ...lb,
  "",
  "回答要求：",
  "- 具体、可核对，热情主动，必要时引用文件路径。",
  "- 使用 RunSlashCommand 查询真实实例状态时，可以直接执行查询类命令。",
  "- 如果 RunSlashCommand 可能创建、修改、删除、发送消息、切换状态或重载页面，必须先明确告诉用户准备执行的命令和预期结果，并在用户同意后再执行。",
  "- 执行 RunSlashCommand 后，要如实说明实际执行的命令和工具返回结果，不要美化或改写失败原因。"
].join(`
`), zb = "[历史摘要]", Yb = [
  "你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。",
  "只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。",
  "必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。",
  "如果某项信息不存在，就不要编造。",
  "尽量紧凑清晰，适合直接作为后续上下文继续使用。"
].join(`
`), Xb = "xb-assistant-app", sh = "xb-assistant-root", ih = 18e4, Qb = 64, rh = 128e3, Zb = 98e3, jb = 2, eA = 1, _s = 3, tA = 4 * 1024 * 1024, nA = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], oA = 2600, sA = 1800, iA = 4200, rA = [{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}], ah = [
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
], aA = [
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
], F = {
  config: null,
  runtime: null,
  messages: [],
  historySummary: "",
  archivedTurnCount: 0,
  contextStats: {
    usedTokens: 0,
    budgetTokens: rh,
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
  sidebarCollapsed: !0
}, hr = /* @__PURE__ */ new Map(), lh = /* @__PURE__ */ new Map(), Go = null, xn = null;
function oa(e, t = {}) {
  parent.postMessage({
    source: Xb,
    type: e,
    payload: t
  }, window.location.origin);
}
function sa(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function uh(e, t = {}) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return t;
  }
}
var ia = null;
function vs() {
  ia?.persistSession();
}
function lA() {
  ia?.restoreSession();
}
function uA() {
  if (xn !== null) return xn;
  try {
    xn = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
  } catch {
    xn = {};
  }
  return xn;
}
function cA() {
  return ["mobile", "tablet"].includes(uA()?.platform?.type) ? !0 : window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
}
function dA(e) {
  return F.messages.find((t) => t?.approvalRequest?.id === e) || null;
}
function fA(e, t) {
  const n = dA(e);
  n?.approvalRequest && (n.approvalRequest.status = t, vs());
}
function pA(e, t) {
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
function hA(e) {
  return ah.some((t) => t.value === e) ? e : "medium";
}
function ra(e) {
  if (!Array.isArray(e)) return [];
  const t = /* @__PURE__ */ new Set();
  return e.map((n) => {
    if (!n || typeof n != "object") return null;
    const o = String(n.text || "").trim();
    return o ? {
      label: String(n.label || "思考块").trim() || "思考块",
      text: o
    } : null;
  }).filter(Boolean).filter((n) => {
    const o = `${n.label}\0${n.text}`;
    return t.has(o) ? !1 : (t.add(o), !0);
  });
}
function Zt(e) {
  if (F.toast = String(e || "").trim(), Go && clearTimeout(Go), !F.toast) {
    Ie();
    return;
  }
  const t = Math.max(sA, Math.min(iA, oA + F.toast.length * 18));
  Go = setTimeout(() => {
    Go = null, F.toast = "", Ie();
  }, t), Ie();
}
function aa(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return e?.name === "AbortError" || t === "assistant_aborted" || t === "tool_aborted" || t.includes("aborted");
}
function mA(e) {
  return aA.find((t) => t.value === e)?.label || e;
}
function gA(e) {
  return F.pullStateByProvider[e] || {
    status: "idle",
    message: ""
  };
}
function yA(e, t) {
  F.pullStateByProvider = {
    ...F.pullStateByProvider,
    [e]: t
  };
}
function _A(e, t) {
  F.modelOptionsByProvider = {
    ...F.modelOptionsByProvider,
    [e]: Array.isArray(t) ? t : []
  };
}
function vA(e) {
  return Array.isArray(F.modelOptionsByProvider[e]) ? F.modelOptionsByProvider[e] : [];
}
var { normalizeAttachments: Bs, buildTextWithAttachmentSummary: SA, buildUserContentParts: EA, appendDraftImageFiles: Sc, renderAttachmentGallery: ch } = Nb({
  state: F,
  showToast: Zt,
  render: Ie,
  acceptedImageMimeTypes: nA,
  maxImageAttachments: _s,
  maxImageFileBytes: tA
});
function la(e) {
  const t = String(e?.message || e || "unknown_error"), n = t.toLowerCase();
  return e?.rawDisplay ? String(e.rawDisplay) : aa(e) ? "本轮请求已终止。" : n === "tool_timeout" ? "工具调用超时了（180 秒），可以重试，或把问题收窄一点。" : n.startsWith("workspace_write_failed:") ? "工作区写入失败，请检查酒馆文件权限或稍后重试。" : n.startsWith("manifest_load_failed:") ? "助手索引文件清单加载失败，请刷新页面后再试。" : n.startsWith("file_read_failed:") ? "读取源码文件失败了，请换个文件再试，或刷新页面重试。" : n === "file_not_indexed" ? "这个文件不在当前助手索引范围里。" : n === "directory_path_required" ? "还没有提供要查看的目录路径。" : n === "glob_pattern_required" ? "还没有提供 glob 路径模式。" : n === "empty_query" ? "搜索词是空的，换一个明确点的关键词就行。" : t;
}
var { getActiveProviderConfig: dh, syncCurrentProviderDraft: TA, syncConfigToForm: wA, bindSettingsPanelEvents: bA } = Vb({
  state: F,
  post: oa,
  render: Ie,
  showToast: Zt,
  describeError: la,
  getPullState: gA,
  setPullState: yA,
  setProviderModels: _A,
  getProviderModels: vA,
  getProviderLabel: mA,
  normalizeReasoningEffort: hA,
  normalizeAssistantConfig: nh,
  normalizePresetName: jn,
  buildDefaultPreset: ea,
  cloneDefaultModelConfigs: jr,
  defaultPresetName: th,
  requestTimeoutMs: ih,
  toolModeOptions: rA,
  reasoningEffortOptions: ah
}), { renderMessages: AA, scrollChatToBottom: mr, scrollChatToTop: CA, updateChatScrollButtonsVisibility: fh, handleAssistantChatScroll: IA } = Hb({
  state: F,
  examplePrompts: Jb,
  toolNames: ae,
  formatToolResultDisplay: jp,
  normalizeThoughtBlocks: ra,
  normalizeAttachments: Bs,
  renderAttachmentGallery: ch
});
function xA() {
  const e = dh();
  if (!e.apiKey) throw new Error("请先在小白助手里填写当前提供商的 API Key。");
  switch (e.provider) {
    case "openai-responses":
      return new Eg(e);
    case "anthropic":
      return new Ey(e);
    case "google":
      return new ab(e);
    default:
      return new cg(e);
  }
}
var { resetCompactionState: RA, buildContextMeterLabel: PA, updateContextStats: MA, pushMessage: Si, cancelActiveRun: NA, toProviderMessages: kA, getActiveContextMessages: ph, runAssistantLoop: LA } = mb({
  state: F,
  pendingToolCalls: hr,
  pendingApprovals: lh,
  persistSession: vs,
  render: Ie,
  showToast: Zt,
  post: oa,
  createRequestId: sa,
  safeJsonParse: uh,
  describeError: la,
  describeToolCall: db,
  formatToolResultDisplay: jp,
  buildTextWithAttachmentSummary: SA,
  buildUserContentParts: EA,
  normalizeAttachments: Bs,
  normalizeThoughtBlocks: ra,
  normalizeSlashCommand: ta,
  shouldRequireSlashCommandApproval: Cb,
  setApprovalStatus: fA,
  buildSlashApprovalResult: pA,
  isAbortError: aa,
  createAdapter: xA,
  getActiveProviderConfig: dh,
  SYSTEM_PROMPT: Kb,
  SUMMARY_SYSTEM_PROMPT: Yb,
  HISTORY_SUMMARY_PREFIX: zb,
  MAX_CONTEXT_TOKENS: rh,
  SUMMARY_TRIGGER_TOKENS: Zb,
  DEFAULT_PRESERVED_TURNS: jb,
  MIN_PRESERVED_TURNS: eA,
  MAX_TOOL_ROUNDS: Qb,
  REQUEST_TIMEOUT_MS: ih,
  TOOL_DEFINITIONS: ub,
  TOOL_NAMES: ae
});
ia = Mb({
  state: F,
  safeJsonParse: uh,
  createRequestId: sa,
  normalizeAttachments: Bs,
  normalizeThoughtBlocks: ra,
  getActiveContextMessages: ph
});
function Ei(e) {
  F.config = nh(e || {}), Ie();
}
function DA(e) {
  const t = new DOMParser().parseFromString(`<body>${String(e || "")}</body>`, "text/html"), n = document.createDocumentFragment();
  return Array.from(t.body.childNodes).forEach((o) => {
    n.appendChild(document.importNode(o, !0));
  }), n;
}
function $A(e) {
  const t = `
        <div class="xb-assistant-shell ${F.sidebarCollapsed ? "sidebar-collapsed" : ""}">
            <aside class="xb-assistant-sidebar ${F.sidebarCollapsed ? "is-collapsed" : ""}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${F.sidebarCollapsed ? "false" : "true"}" aria-label="${F.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}" title="${F.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${F.sidebarCollapsed ? "hidden" : ""}>
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
            <main class="xb-assistant-main">
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-toolbar-cluster">
                        <div class="xb-assistant-status" id="xb-assistant-status"></div>
                        <div class="xb-assistant-context-meter" id="xb-assistant-context-meter" title="当前实际送模上下文 / 最大上下文"></div>
                        <button id="xb-assistant-clear" type="button" class="secondary ghost">清空对话</button>
                    </div>
                </section>
                <section class="xb-assistant-chat-wrap">
                    <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                    <div class="xb-assistant-scroll-helpers" id="xb-assistant-scroll-helpers">
                        <button id="xb-assistant-scroll-top" type="button" class="xb-assistant-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                        <button id="xb-assistant-scroll-bottom" type="button" class="xb-assistant-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                    </div>
                </section>
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
  e.replaceChildren(DA(t));
}
function UA() {
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
        #${sh} { width: 100%; height: 100%; overflow: hidden; }
        .xb-assistant-shell {
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
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
            transition: padding 0.22s ease;
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
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
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
            min-height: 0;
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
        .xb-assistant-examples {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 16px;
        }
        .xb-assistant-example-chip {
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 999px;
            padding: 10px 14px;
            background: rgba(244, 248, 252, 0.96);
            color: #1b3758;
            cursor: pointer;
            font: inherit;
        }
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
        .xb-assistant-bubble.role-tool {
            background: rgba(244, 248, 252, 0.95);
            border: 1px dashed rgba(27, 55, 88, 0.18);
        }
        .xb-assistant-meta { margin-bottom: 6px; font-size: 12px; opacity: 0.78; }
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
            max-height: calc(1.6em * 3 + 12px);
            overflow: hidden;
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
        .xb-assistant-compose textarea { min-height: 92px; resize: vertical; max-width: 100%; overflow-x: hidden; }
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
        @media (max-width: 900px) {
            .xb-assistant-shell { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); height: 100%; }
            .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 1fr; }
            .xb-assistant-sidebar {
                padding: 12px 14px;
                grid-template-rows: auto minmax(0, 1fr);
                border-right: none;
                border-bottom: 1px solid rgba(20, 32, 51, 0.08);
                max-height: min(46vh, 420px);
                overflow: hidden;
            }
            .xb-assistant-sidebar.is-collapsed {
                padding: 12px 14px;
                overflow: hidden;
                max-height: none;
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
                min-width: 108px;
                padding: 8px 14px;
                justify-content: space-between;
                background: linear-gradient(135deg, rgba(27, 55, 88, 0.92), rgba(40, 87, 134, 0.92));
                font-size: 14px;
            }
            .xb-assistant-sidebar-content {
                padding-right: 2px;
            }
            .xb-assistant-sidebar-toggle-text {
                display: inline-flex;
                align-items: center;
            }
            .xb-assistant-main { padding: 14px; min-height: 0; height: 100%; }
            .xb-assistant-compose { grid-template-columns: 1fr; }
            .xb-assistant-compose-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .xb-assistant-toolbar,
            .xb-assistant-toolbar-cluster { align-items: stretch; }
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
            .xb-assistant-status { justify-content: center; }
            .xb-assistant-chat { padding-inline: 0; min-height: 0; }
            .xb-assistant-bubble { width: 100%; }
            .xb-assistant-scroll-btn {
                width: 28px;
                height: 28px;
                font-size: 11px;
            }
            .xb-assistant-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `, document.head.appendChild(e);
}
function Ie() {
  const e = document.getElementById(sh);
  if (!e) return;
  e.firstChild || ($A(e), FA(e)), wA(e), MA(kA(ph()));
  const t = e.querySelector("#xb-assistant-chat");
  AA(t), F.autoScroll && mr(t), fh(e);
  const n = e.querySelector("#xb-assistant-send");
  n.disabled = !1, n.classList.toggle("is-busy", F.isBusy), n.textContent = F.isBusy ? "终止" : "发送";
  const o = e.querySelector("#xb-assistant-add-image");
  o.disabled = F.isBusy || F.draftAttachments.length >= _s, o.textContent = F.draftAttachments.length ? `发图（${F.draftAttachments.length}/${_s}）` : "发图";
  const s = e.querySelector("#xb-assistant-clear");
  s.disabled = F.isBusy || !F.messages.length;
  const i = e.querySelector("#xb-assistant-delete-preset");
  i.disabled = F.isBusy || (F.config?.presetNames || []).length <= 1;
  const a = e.querySelector("#xb-assistant-pull-models");
  a.disabled = F.isBusy;
  const u = e.querySelector("#xb-assistant-status");
  u.textContent = F.progressLabel || "就绪", u.classList.toggle("busy", F.isBusy);
  const c = e.querySelector("#xb-assistant-context-meter");
  c.textContent = PA(), c.classList.toggle("summary-active", !!F.contextStats.summaryActive), c.title = F.contextStats.summaryActive ? "当前实际送模上下文 / 128k（已压缩较早历史）" : "当前实际送模上下文 / 128k";
  const d = e.querySelector("#xb-assistant-toast");
  d.textContent = F.toast || "", d.classList.toggle("visible", !!F.toast);
  const p = e.querySelector(".xb-assistant-shell"), f = e.querySelector(".xb-assistant-sidebar"), h = e.querySelector("#xb-assistant-sidebar-toggle"), m = e.querySelector(".xb-assistant-sidebar-content");
  if (p?.classList.toggle("sidebar-collapsed", !!F.sidebarCollapsed), f?.classList.toggle("is-collapsed", !!F.sidebarCollapsed), m?.toggleAttribute("hidden", !!F.sidebarCollapsed), h) {
    const y = window.matchMedia("(max-width: 900px)").matches;
    h.setAttribute("aria-expanded", F.sidebarCollapsed ? "false" : "true"), h.setAttribute("aria-label", F.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置"), h.title = F.sidebarCollapsed ? "展开 API 配置" : "收起 API 配置";
    const _ = h.querySelector(".xb-assistant-sidebar-toggle-text"), S = h.querySelector(".xb-assistant-sidebar-toggle-icon");
    _ && (_.textContent = y ? F.sidebarCollapsed ? "展开设置" : "收起设置" : ""), S && (S.textContent = y ? F.sidebarCollapsed ? "▼" : "▲" : F.sidebarCollapsed ? "⚙" : "‹");
  }
  ch(e.querySelector("#xb-assistant-draft-gallery"), F.draftAttachments, { onRemove: (y) => {
    F.draftAttachments = F.draftAttachments.filter((_, S) => S !== y), Ie();
  } });
  const g = e.querySelector("#xb-assistant-toggle-key");
  g.textContent = e.querySelector("#xb-assistant-api-key").type === "password" ? "显示" : "隐藏";
}
function FA(e) {
  const t = e.querySelector("#xb-assistant-input"), n = e.querySelector("#xb-assistant-image-input"), o = () => {
    t.style.height = "auto", t.style.height = `${Math.min(Math.max(t.scrollHeight, 92), 240)}px`;
  };
  e.querySelector("#xb-assistant-sidebar-toggle")?.addEventListener("click", () => {
    F.sidebarCollapsed = !F.sidebarCollapsed, vs(), Ie();
  }), e.querySelector("#xb-assistant-chat").addEventListener("scroll", (s) => {
    const i = s.currentTarget;
    F.autoScroll = i.scrollHeight - i.scrollTop - i.clientHeight <= 48, IA(e);
  }), e.querySelector("#xb-assistant-chat").addEventListener("click", (s) => {
    const i = s.target.closest(".xb-assistant-example-chip");
    if (i) {
      t.value = i.dataset.prompt || "", o(), t.focus(), F.autoScroll = !0, mr(e.querySelector("#xb-assistant-chat"));
      return;
    }
    const a = s.target.closest("[data-approval-id][data-approval-decision]");
    if (!a) return;
    const u = a.dataset.approvalId || "", c = a.dataset.approvalDecision || "", d = lh.get(u);
    d && (c === "approve" ? d.resolve(!0) : d.resolve(!1), Ie());
  }), bA(e), e.querySelector("#xb-assistant-clear").addEventListener("click", () => {
    F.isBusy || (F.messages = [], F.draftAttachments = [], RA(), vs(), Zt("对话已清空"), Ie());
  }), e.querySelector("#xb-assistant-add-image").addEventListener("click", () => {
    F.isBusy || F.draftAttachments.length >= _s || n.click();
  }), e.querySelector("#xb-assistant-scroll-top").addEventListener("click", () => {
    F.autoScroll = !1, CA(e.querySelector("#xb-assistant-chat"));
  }), e.querySelector("#xb-assistant-scroll-bottom").addEventListener("click", () => {
    F.autoScroll = !0, mr(e.querySelector("#xb-assistant-chat")), fh(e);
  }), n.addEventListener("change", async (s) => {
    const i = Array.from(s.currentTarget.files || []);
    if (i.length)
      try {
        await Sc(i);
      } finally {
        s.currentTarget.value = "";
      }
  }), t.addEventListener("paste", async (s) => {
    if (F.isBusy) return;
    const i = Array.from(s.clipboardData?.items || []);
    if (!i.length) return;
    const a = i.filter((u) => u.kind === "file" && String(u.type || "").startsWith("image/")).map((u) => u.getAsFile()).filter(Boolean);
    a.length && (s.preventDefault(), await Sc(a));
  }), e.querySelector("#xb-assistant-form").addEventListener("submit", async (s) => {
    if (s.preventDefault(), F.isBusy) {
      NA("本轮请求已终止。");
      return;
    }
    const i = t.value.trim(), a = Bs(F.draftAttachments);
    if (!i && !a.length) return;
    TA(e), Si({
      role: "user",
      content: i,
      attachments: a
    }), t.value = "", F.draftAttachments = [], o(), Ie();
    const u = {
      id: sa("run"),
      controller: new AbortController(),
      toolRequestIds: /* @__PURE__ */ new Set(),
      cancelNotice: "",
      lightBrakeMessage: "",
      lastLightBrakeKey: "",
      toolErrorStreakKey: "",
      toolErrorStreakCount: 0
    };
    F.activeRun = u, F.isBusy = !0, F.currentRound = 0, F.progressLabel = "正在请求模型…", F.autoScroll = !0, Ie();
    try {
      await LA(u);
    } catch (c) {
      aa(c) ? u.cancelNotice && Si({
        role: "assistant",
        content: u.cancelNotice
      }) : Si({
        role: "assistant",
        content: la(c)
      });
    } finally {
      F.activeRun?.id === u.id && (F.activeRun = null), F.isBusy = !1, F.currentRound = 0, F.progressLabel = "", Ie();
    }
  }), t.addEventListener("input", o), t.addEventListener("keydown", (s) => {
    const i = !cA();
    if (!s.isComposing && !s.shiftKey && !s.ctrlKey && !s.altKey && !s.metaKey && s.key === "Enter" && i) {
      s.preventDefault();
      const a = e.querySelector("#xb-assistant-form");
      if (typeof a?.requestSubmit == "function") {
        a.requestSubmit();
        return;
      }
      a?.dispatchEvent(new Event("submit", {
        cancelable: !0,
        bubbles: !0
      }));
    }
  }), o();
}
window.addEventListener("message", (e) => {
  if (e.origin !== window.location.origin || e.source !== parent) return;
  const t = e.data || {};
  if (t.type === "xb-assistant:config") {
    F.runtime = t.payload?.runtime || null, Ei(t.payload?.config || {});
    return;
  }
  if (t.type === "xb-assistant:config-saved") {
    Ei(t.payload?.config || {}), Zt("配置已保存");
    return;
  }
  if (t.type === "xb-assistant:config-save-error") {
    Ei(t.payload?.config || {}), Zt(`保存失败：${t.payload?.error || "网络异常"}`);
    return;
  }
  if (t.type === "xb-assistant:tool-result") {
    const n = hr.get(t.payload?.requestId || "");
    if (!n) return;
    n.resolve(t.payload.result);
    return;
  }
  if (t.type === "xb-assistant:tool-error") {
    const n = hr.get(t.payload?.requestId || "");
    if (!n) return;
    n.reject(new Error(t.payload.error || "tool_failed"));
  }
});
lA();
UA();
Ie();
oa("xb-assistant:ready");
